import { NextResponse } from "next/server";
import { prisma } from "./prisma";

// Rate limit compartilhado entre todas as instâncias, guardado no Postgres do próprio site (tabela "RateLimit").
// Janela fixa: a primeira tentativa abre a janela, as seguintes incrementam o contador até o limite.
// O limitador antigo em memória (src/lib/rate-limit.ts) não funcionava na Vercel: cada instância tinha o seu contador.

export interface Rule {
  /** Prefixo da chave (também identifica a regra nos logs). */
  name: string;
  limit: number;
  /** Janela, ex.: "10 m". */
  window: `${number} ${"s" | "m" | "h"}`;
}

/** Regras da proteção de contas. Cada uma vale por IP e também por email. */
export const RULES = {
  loginIp: { name: "login-ip", limit: 10, window: "10 m" },
  loginEmail: { name: "login-email", limit: 5, window: "15 m" },
  registerIp: { name: "register-ip", limit: 5, window: "10 m" },
  registerEmail: { name: "register-email", limit: 3, window: "15 m" },
  verifyIp: { name: "verify-ip", limit: 10, window: "10 m" },
  verifyEmail: { name: "verify-email", limit: 5, window: "15 m" },
  resetRequestIp: { name: "reset-req-ip", limit: 5, window: "10 m" },
  resetRequestEmail: { name: "reset-req-email", limit: 3, window: "15 m" },
  resetConfirmIp: { name: "reset-confirm-ip", limit: 10, window: "10 m" },
  resetConfirmEmail: { name: "reset-confirm-email", limit: 5, window: "15 m" },
  /** Página pública do transcript (/transcript/[id]): só por IP. */
  transcriptIp: { name: "transcript-ip", limit: 30, window: "1 m" },
  /** Formulário público de candidatura: por IP. */
  applicationIp: { name: "application-ip", limit: 3, window: "10 m" },
  /** Rotas de usuário logado (chave = id do usuário). */
  profilePassword: { name: "profile-password", limit: 5, window: "15 m" },
  profileUpdate: { name: "profile-update", limit: 20, window: "10 m" },
  upload: { name: "upload", limit: 20, window: "10 m" },
  /** Ligar/desligar/reiniciar/remover bot (chama a API da Discloud). */
  botControl: { name: "bot-control", limit: 10, window: "1 m" },
  /** Leituras que chamam a Discloud (status e logs). */
  botRead: { name: "bot-read", limit: 60, window: "1 m" },
  /** Escritas do painel do staff (criar/editar/apagar). */
  staffWrite: { name: "staff-write", limit: 60, window: "1 m" },
  /** Teto GLOBAL de chamadas à Discloud (todos os usuários somados), para não estourar o limite da API deles. */
  discloudGlobal: { name: "discloud-global", limit: 120, window: "1 m" },
  /** Relatórios de CSP do navegador (por IP). */
  cspReport: { name: "csp-report", limit: 30, window: "1 m" },
  /** Staff: consultas que chamam a API do Discord. */
  staffDiscord: { name: "staff-discord", limit: 30, window: "1 m" },
} satisfies Record<string, Rule>;

function windowSec(rule: Rule) {
  const [n, unit] = rule.window.split(" ");
  return Number(n) * (unit === "s" ? 1 : unit === "m" ? 60 : 3600);
}

export interface RateResult {
  ok: boolean;
  retryAfterSec: number;
}

/** Chance de limpar linhas expiradas a cada consulta; sem cron e sem variável de ambiente. */
const CLEANUP_CHANCE = 0.02;

/**
 * Consome 1 tentativa da regra para a chave (IP ou email), de forma atômica (um único INSERT ... ON CONFLICT).
 * Falha ABERTA: se o IP não puder ser identificado ou se o banco der erro, a requisição passa (e o erro é logado),
 * para que um problema do limitador nunca bloqueie o login de todo mundo. O login em si já depende do mesmo banco.
 */
export async function checkRate(rule: Rule, key: string): Promise<RateResult> {
  // sem IP identificável todos cairiam no mesmo balde e se bloqueariam entre si
  if (!key || key === "unknown") return { ok: true, retryAfterSec: 0 };

  const id = `${rule.name}:${key}`;
  const secs = windowSec(rule);
  try {
    const rows = await prisma.$queryRaw<{ count: number; secs: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "expiresAt")
      VALUES (${id}, 1, (NOW() AT TIME ZONE 'UTC') + ${secs} * INTERVAL '1 second')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."expiresAt" <= (NOW() AT TIME ZONE 'UTC') THEN 1 ELSE "RateLimit"."count" + 1 END,
        "expiresAt" = CASE WHEN "RateLimit"."expiresAt" <= (NOW() AT TIME ZONE 'UTC')
          THEN (NOW() AT TIME ZONE 'UTC') + ${secs} * INTERVAL '1 second' ELSE "RateLimit"."expiresAt" END
      RETURNING "count", CEIL(EXTRACT(EPOCH FROM ("expiresAt" - (NOW() AT TIME ZONE 'UTC'))))::int AS secs`;
    if (Math.random() < CLEANUP_CHANCE) {
      prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "expiresAt" < (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 hour'`.catch(() => {});
    }
    const row = rows[0];
    if (row.count > rule.limit) return { ok: false, retryAfterSec: Math.max(1, row.secs) };
    return { ok: true, retryAfterSec: 0 };
  } catch (e) {
    console.error("[ratelimit] erro no banco, liberando a requisição:", e instanceof Error ? e.message : e);
    return { ok: true, retryAfterSec: 0 };
  }
}

/** IP do cliente. Na Vercel o x-forwarded-for é escrito pela própria plataforma; o primeiro valor é o do cliente. */
export function getClientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const get = (name: string) => {
    if (headers instanceof Headers) return headers.get(name) ?? undefined;
    const v = headers[name];
    return Array.isArray(v) ? v[0] : v;
  };
  const xff = get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  return first || get("x-real-ip") || "unknown";
}

/** Normaliza o email só para usar de chave (não altera o email salvo). */
export const emailKey = (email: string) => email.trim().toLowerCase();

/** Aplica as duas regras (IP e email) e devolve o resultado mais restritivo. */
export async function checkIpAndEmail(ipRule: Rule, emailRuleDef: Rule, ip: string, email: string): Promise<RateResult> {
  const byIp = await checkRate(ipRule, ip);
  if (!byIp.ok) return byIp;
  return checkRate(emailRuleDef, emailKey(email));
}

/** Chave do usuário logado para o rate limit (id do site, Discord ID ou email). */
export function sessionKey(session: { user?: { id?: string; discordId?: string; email?: string | null } } | null): string {
  const u = session?.user;
  return u?.id ?? u?.discordId ?? u?.email ?? "anon";
}

/** Consome 1 tentativa da regra; devolve a resposta 429 se passou do limite, ou null se pode seguir. */
export async function enforce(rule: Rule, key: string): Promise<NextResponse | null> {
  const r = await checkRate(rule, key);
  return r.ok ? null : tooManyRequests(r.retryAfterSec);
}

/** Limite por usuário e, em seguida, o teto global da Discloud. */
export async function enforceDiscloud(rule: Rule, session: Parameters<typeof sessionKey>[0]): Promise<NextResponse | null> {
  return (await enforce(rule, sessionKey(session))) ?? (await enforce(RULES.discloudGlobal, "global"));
}

export function tooManyRequests(retryAfterSec: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return NextResponse.json(
    { error: `Muitas tentativas. Tente novamente em ${minutes} minuto${minutes > 1 ? "s" : ""}.` },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
