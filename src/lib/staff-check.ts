import type { JWT } from "next-auth/jwt";

// Revalida os cargos do Discord (staff/cliente) de quem entrou com Discord, para que perder o cargo
// derrube o acesso em poucos minutos, sem esperar a sessão expirar. Usa o token do bot (já existente no
// servidor), então nenhum token do usuário precisa ficar guardado no cookie.

export const STAFF_ROLE_ID = "1462664924936274144";
export const CLIENT_ROLE_ID = "1462664263096205457";

/** Duração máxima da sessão (cookie JWT). */
export const SESSION_MAX_AGE_S = 24 * 60 * 60;
/** De quanto em quanto tempo os cargos são conferidos de novo. */
export const ROLES_RECHECK_MS = 10 * 60_000;
/** Se o Discord ficar fora do ar, os cargos antigos valem só por este tempo; depois o acesso de staff cai. */
export const ROLES_GRACE_MS = 60 * 60_000;

export type MemberRoles = { status: "ok"; roles: string[] } | { status: "gone" } | { status: "error" } | { status: "skip" };

// Cache por instância: as rotas de API não conseguem regravar o cookie, então sem isto cada requisição consultaria o Discord.
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { at: number; result: MemberRoles }>();

export async function fetchMemberRoles(discordId: string, fetchFn: typeof fetch = fetch): Promise<MemberRoles> {
  const guild = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!guild || !botToken) return { status: "skip" }; // sem configuração não há como conferir

  const hit = cache.get(discordId);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.result;

  let result: MemberRoles;
  try {
    const res = await fetchFn(`https://discord.com/api/v10/guilds/${guild}/members/${encodeURIComponent(discordId)}`, {
      headers: { Authorization: `Bot ${botToken}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 404) result = { status: "gone" }; // saiu do servidor
    else if (!res.ok) result = { status: "error" };
    else {
      const member = (await res.json()) as { roles?: unknown };
      result = { status: "ok", roles: Array.isArray(member.roles) ? member.roles.filter((r): r is string => typeof r === "string") : [] };
    }
  } catch {
    result = { status: "error" };
  }
  if (result.status !== "error") {
    if (cache.size > 500) cache.clear();
    cache.set(discordId, { at: Date.now(), result });
  }
  return result;
}

/** Confere os cargos de um token de login Discord e atualiza isStaff/isClient. Não faz nada para outros logins. */
export async function revalidateRoles(token: JWT, now = Date.now(), fetcher: (id: string) => Promise<MemberRoles> = fetchMemberRoles): Promise<void> {
  if (token.provider !== "discord" || !token.discordId) return;
  // tokens emitidos antes desta checagem começam com carência, para um erro do Discord não derrubar todo mundo de uma vez
  if (token.rolesOkAt === undefined) token.rolesOkAt = now;
  if (token.rolesCheckedAt !== undefined && now - token.rolesCheckedAt < ROLES_RECHECK_MS) return;

  const r = await fetcher(token.discordId);
  if (r.status === "skip") {
    token.rolesCheckedAt = now;
  } else if (r.status === "ok") {
    token.isStaff = r.roles.includes(STAFF_ROLE_ID);
    token.isClient = r.roles.includes(CLIENT_ROLE_ID);
    token.rolesCheckedAt = token.rolesOkAt = now;
  } else if (r.status === "gone") {
    token.isStaff = false;
    token.isClient = false;
    token.rolesCheckedAt = token.rolesOkAt = now;
  } else {
    // erro do Discord: tenta de novo em 1 minuto e, passada a carência, tira o acesso de staff (falha fechada)
    token.rolesCheckedAt = now - ROLES_RECHECK_MS + 60_000;
    if (now - token.rolesOkAt > ROLES_GRACE_MS) {
      token.isStaff = false;
      token.isClient = false;
    }
  }
}
