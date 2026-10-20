// Testes do limitador no Postgres, só para desenvolvimento local.
// Rodar:  npx -y tsx --test scripts/security/ratelimit.test.ts
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { checkRate, type Rule } from "../../src/lib/ratelimit";

const prisma = new PrismaClient();
const tag = `t${randomBytes(3).toString("hex")}`;
const rule: Rule = { name: `teste-${tag}`, limit: 3, window: "10 m" };

describe("rate limit no banco", () => {
  after(async () => {
    await prisma.rateLimit.deleteMany({ where: { key: { startsWith: `teste-${tag}` } } });
    await prisma.$disconnect();
  });

  it("libera até o limite e bloqueia depois, com tempo de espera", async () => {
    for (let i = 0; i < 3; i++) assert.equal((await checkRate(rule, "a")).ok, true);
    const r = await checkRate(rule, "a");
    assert.equal(r.ok, false);
    assert.ok(r.retryAfterSec > 500 && r.retryAfterSec <= 600, `retryAfter ${r.retryAfterSec}`);
  });

  it("chaves diferentes não se afetam", async () => {
    assert.equal((await checkRate(rule, "b")).ok, true);
  });

  it("30 requisições em paralelo: exatamente o limite passa", async () => {
    const rs = await Promise.all(Array.from({ length: 30 }, () => checkRate(rule, "paralelo")));
    assert.equal(rs.filter((r) => r.ok).length, 3);
  });

  it("depois que a janela expira o contador recomeça", async () => {
    await prisma.rateLimit.update({ where: { key: `${rule.name}:a` }, data: { expiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await checkRate(rule, "a")).ok, true);
    const row = await prisma.rateLimit.findUniqueOrThrow({ where: { key: `${rule.name}:a` } });
    assert.equal(row.count, 1);
  });

  it("IP desconhecido nunca é bloqueado (não vira um balde único para todos)", async () => {
    for (let i = 0; i < 10; i++) assert.equal((await checkRate(rule, "unknown")).ok, true);
  });
});
