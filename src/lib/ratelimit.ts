import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limit compartilhado entre todas as instâncias (Upstash Redis). O limitador antigo em memória
// (src/lib/rate-limit.ts) não funcionava na Vercel: cada instância tinha o seu contador.

export interface Rule {
  /** Prefixo da chave no Redis (também identifica a regra nos logs). */
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
} satisfies Record<string, Rule>;

function makeRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

const redis = makeRedis();
const limiters = new Map<string, Ratelimit>();

function limiterFor(rule: Rule): Ratelimit | null {
  if (!redis) return null;
  let l = limiters.get(rule.name);
  if (!l) {
    l = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(rule.limit, rule.window), prefix: `rl:${rule.name}` });
    limiters.set(rule.name, l);
  }
  return l;
}

// Só para desenvolvimento local sem Upstash configurado. Em produção NUNCA é usado.
const localHits = new Map<string, number[]>();
function windowMs(rule: Rule) {
  const [n, unit] = rule.window.split(" ");
  return Number(n) * (unit === "s" ? 1000 : unit === "m" ? 60_000 : 3_600_000);
}
function localLimit(rule: Rule, key: string) {
  const now = Date.now();
  const k = `${rule.name}:${key}`;
  const hits = (localHits.get(k) ?? []).filter((t) => now - t < windowMs(rule));
  if (hits.length >= rule.limit) {
    localHits.set(k, hits);
    return { ok: false, retryAfterSec: Math.ceil((windowMs(rule) - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  localHits.set(k, hits);
  return { ok: true, retryAfterSec: 0 };
}

export interface RateResult {
  ok: boolean;
  retryAfterSec: number;
}

/**
 * Consome 1 tentativa da regra para a chave (IP ou email). Se o Upstash não estiver configurado:
 * em produção bloqueia (falha fechada, para não deixar as rotas de conta sem proteção);
 * em desenvolvimento usa um contador local.
 */
export async function checkRate(rule: Rule, key: string): Promise<RateResult> {
  const limiter = limiterFor(rule);
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.error("[ratelimit] Upstash não configurado em produção: bloqueando por segurança");
      return { ok: false, retryAfterSec: 60 };
    }
    return localLimit(rule, key);
  }
  try {
    const r = await limiter.limit(key);
    return { ok: r.success, retryAfterSec: Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)) };
  } catch (e) {
    console.error("[ratelimit] erro ao falar com o Upstash:", e instanceof Error ? e.message : e);
    // falha fechada nas rotas de conta
    return { ok: false, retryAfterSec: 30 };
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

export function tooManyRequests(retryAfterSec: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return NextResponse.json(
    { error: `Muitas tentativas. Tente novamente em ${minutes} minuto${minutes > 1 ? "s" : ""}.` },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
