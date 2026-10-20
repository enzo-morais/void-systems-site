// Testes do fluxo de códigos (C2) contra o banco, só para desenvolvimento local.
// Cria usuários de teste (@example.invalid) e apaga tudo no final.
// Rodar:  npx -y tsx --test scripts/security/c2-codes.test.ts
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { CODE_MAX_ATTEMPTS, checkCode, generateCode, hashCode, issueCode } from "../../src/lib/codes";

const prisma = new PrismaClient();
const created: string[] = [];

async function newUser(): Promise<string> {
  const email = `seg-${randomBytes(4).toString("hex")}@example.invalid`;
  await prisma.siteUser.create({ data: { name: "Teste", email, password: "x" } });
  created.push(email);
  return email;
}

const wrongOf = (code: string) => (code === "000000" ? "000001" : "000000");

describe("códigos de verificação e de redefinição de senha", () => {
  before(() => {
    process.env.CODE_HASH_SECRET ||= "segredo-de-teste-local";
  });
  after(async () => {
    await prisma.siteUser.deleteMany({ where: { email: { in: created } } });
    await prisma.$disconnect();
  });

  it("gera 6 dígitos e guarda só o hash, com validade de 15 min", async () => {
    const email = await newUser();
    const code = await issueCode("verify", email);
    assert.match(code, /^\d{6}$/);
    const row = await prisma.siteUser.findUniqueOrThrow({ where: { email } });
    assert.notEqual(row.verifyCodeHash, code);
    assert.equal(row.verifyCodeHash, hashCode("verify", email, code));
    assert.equal(JSON.stringify(row).includes(`"${code}"`), false, "o código em texto puro não pode estar no banco");
    const ttl = row.verifyCodeExpires!.getTime() - Date.now();
    assert.ok(ttl > 14 * 60_000 && ttl <= 15 * 60_000, `validade fora de 15 min: ${ttl}`);
    assert.equal(row.verifyAttempts, 0);
  });

  it("os códigos não repetem um padrão fixo (usa crypto.randomInt)", () => {
    const seen = new Set(Array.from({ length: 300 }, () => generateCode()));
    assert.ok(seen.size > 250, `pouca variação: ${seen.size}`);
  });

  it("código certo funciona uma única vez", async () => {
    const email = await newUser();
    const code = await issueCode("verify", email);
    assert.equal(await checkCode("verify", email, code), true);
    assert.equal(await checkCode("verify", email, code), false, "reuso do mesmo código deve falhar");
  });

  it("depois de 5 palpites errados o código certo também deixa de valer", async () => {
    const email = await newUser();
    const code = await issueCode("reset", email);
    for (let i = 0; i < CODE_MAX_ATTEMPTS; i++) assert.equal(await checkCode("reset", email, wrongOf(code)), false);
    assert.equal(await checkCode("reset", email, code), false, "6ª tentativa (certa) tem que ser barrada");
    const novo = await issueCode("reset", email); // pedir outro código zera o contador
    assert.equal(await checkCode("reset", email, novo), true);
  });

  it("20 palpites em paralelo nunca passam do limite de tentativas", async () => {
    const email = await newUser();
    const code = await issueCode("reset", email);
    await Promise.all(Array.from({ length: 20 }, () => checkCode("reset", email, wrongOf(code))));
    const row = await prisma.siteUser.findUniqueOrThrow({ where: { email } });
    assert.equal(row.resetAttempts, CODE_MAX_ATTEMPTS);
    assert.equal(await checkCode("reset", email, code), false);
  });

  it("código expirado (15 min) é recusado", async () => {
    const email = await newUser();
    const code = await issueCode("verify", email);
    await prisma.siteUser.update({ where: { email }, data: { verifyCodeExpires: new Date(Date.now() - 1000) } });
    assert.equal(await checkCode("verify", email, code), false);
  });

  it("código de verificação não serve para redefinir senha (e vice-versa)", async () => {
    const email = await newUser();
    const verifyCode = await issueCode("verify", email);
    assert.equal(await checkCode("reset", email, verifyCode), false);
    const resetCode = await issueCode("reset", email);
    assert.equal(await checkCode("verify", email, resetCode), false);
  });

  it("código de uma conta não serve para outra", async () => {
    const a = await newUser();
    const b = await newUser();
    const codeA = await issueCode("reset", a);
    await issueCode("reset", b);
    assert.equal(await checkCode("reset", b, codeA), false);
  });

  it("email inexistente: falha sem lançar erro", async () => {
    assert.equal(await checkCode("verify", "ninguem@example.invalid", "123456"), false);
  });
});
