// Testes da revalidação de cargos do Discord (A3), com o Discord simulado.
// Rodar:  npx -y tsx --test scripts/security/session.test.ts
import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { JWT } from "next-auth/jwt";
import {
  CLIENT_ROLE_ID,
  ROLES_GRACE_MS,
  ROLES_RECHECK_MS,
  SESSION_MAX_AGE_S,
  STAFF_ROLE_ID,
  fetchMemberRoles,
  revalidateRoles,
  type MemberRoles,
} from "../../src/lib/staff-check";

const T0 = 1_800_000_000_000;
const discordToken = (extra: Partial<JWT> = {}): JWT => ({ provider: "discord", discordId: "123", isStaff: true, isClient: false, ...extra });
let calls = 0;
const fixed = (r: MemberRoles) => async () => {
  calls++;
  return r;
};

describe("sessão e revalidação de cargos", () => {
  beforeEach(() => {
    calls = 0;
    process.env.DISCORD_GUILD_ID = "guild";
    process.env.DISCORD_BOT_TOKEN = "bot";
  });

  it("a sessão dura no máximo 24h", () => assert.equal(SESSION_MAX_AGE_S, 86400));

  it("staff que perdeu o cargo deixa de ser staff na próxima conferência", async () => {
    const t = discordToken({ rolesCheckedAt: T0, rolesOkAt: T0 });
    await revalidateRoles(t, T0 + ROLES_RECHECK_MS + 1, fixed({ status: "ok", roles: [CLIENT_ROLE_ID] }));
    assert.equal(t.isStaff, false);
    assert.equal(t.isClient, true);
  });

  it("quem saiu do servidor perde staff e cliente", async () => {
    const t = discordToken({ isClient: true, rolesCheckedAt: T0, rolesOkAt: T0 });
    await revalidateRoles(t, T0 + ROLES_RECHECK_MS + 1, fixed({ status: "gone" }));
    assert.equal(t.isStaff, false);
    assert.equal(t.isClient, false);
  });

  it("staff que continua com o cargo segue staff", async () => {
    const t = discordToken({ rolesCheckedAt: T0, rolesOkAt: T0 });
    await revalidateRoles(t, T0 + ROLES_RECHECK_MS + 1, fixed({ status: "ok", roles: [STAFF_ROLE_ID] }));
    assert.equal(t.isStaff, true);
  });

  it("não consulta o Discord antes de 10 minutos", async () => {
    const t = discordToken({ rolesCheckedAt: T0, rolesOkAt: T0 });
    await revalidateRoles(t, T0 + ROLES_RECHECK_MS - 1000, fixed({ status: "gone" }));
    assert.equal(calls, 0);
    assert.equal(t.isStaff, true);
  });

  it("erro do Discord: mantém o cargo dentro da carência e o remove depois dela", async () => {
    const t = discordToken({ rolesCheckedAt: T0, rolesOkAt: T0 });
    await revalidateRoles(t, T0 + ROLES_RECHECK_MS + 1, fixed({ status: "error" }));
    assert.equal(t.isStaff, true, "dentro da carência continua staff");
    const later = T0 + ROLES_GRACE_MS + ROLES_RECHECK_MS;
    t.rolesCheckedAt = T0;
    await revalidateRoles(t, later, fixed({ status: "error" }));
    assert.equal(t.isStaff, false, "passada a carência o acesso de staff cai");
  });

  it("token antigo (sem marcação) ganha carência em vez de cair de imediato", async () => {
    const t = discordToken();
    await revalidateRoles(t, T0, fixed({ status: "error" }));
    assert.equal(t.isStaff, true);
    assert.equal(t.rolesOkAt, T0);
  });

  it("login por email não é tocado", async () => {
    const t: JWT = { provider: "credentials", isStaff: false };
    await revalidateRoles(t, T0, fixed({ status: "ok", roles: [STAFF_ROLE_ID] }));
    assert.equal(calls, 0);
    assert.equal(t.isStaff, false, "email nunca vira staff por esta rota");
  });

  it("fetchMemberRoles: 200 → cargos, 404 → gone, 500 → error, usa o token do bot", async () => {
    let seen = "";
    const mk = (status: number, body: unknown = {}) =>
      (async (_u: unknown, init?: RequestInit) => {
        seen = String((init?.headers as Record<string, string>).Authorization);
        return new Response(JSON.stringify(body), { status });
      }) as typeof fetch;
    assert.deepEqual(await fetchMemberRoles("u200", mk(200, { roles: ["a", "b"] })), { status: "ok", roles: ["a", "b"] });
    assert.equal(seen, "Bot bot");
    assert.deepEqual(await fetchMemberRoles("u404", mk(404)), { status: "gone" });
    assert.deepEqual(await fetchMemberRoles("u500", mk(500)), { status: "error" });
    const boom = (async () => {
      throw new Error("rede");
    }) as typeof fetch;
    assert.deepEqual(await fetchMemberRoles("ubad", boom), { status: "error" });
  });

  it("sem DISCORD_BOT_TOKEN configurado: ignora (skip) em vez de derrubar o acesso", async () => {
    delete process.env.DISCORD_BOT_TOKEN;
    assert.deepEqual(await fetchMemberRoles("x"), { status: "skip" });
  });
});
