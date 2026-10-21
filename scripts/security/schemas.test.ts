// Testes dos schemas de entrada (validação Zod .strict()).
// Rodar:  npx -y tsx --test scripts/security/schemas.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applicationReview,
  clientCreate,
  productCreate,
  productPatch,
  profileUpdate,
  publicApplication,
  saleCreate,
  salePatch,
  staffBotCreate,
  taskCreate,
  taskPatch,
} from "../../src/lib/schemas";

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) => assert.equal(schema.safeParse(v).success, true, JSON.stringify(v));
const bad = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) => assert.equal(schema.safeParse(v).success, false, JSON.stringify(v));

describe("schemas de entrada", () => {
  it("produto: aceita o que o painel envia e recusa campos extras", () => {
    ok(productCreate, { name: "Bot de Ticket", price: 29.9, category: "bots", description: "x", badge: "novo", billing: "monthly", tags: "a,b" });
    ok(productPatch, { name: "x", price: 10, category: null, description: null, badge: null, billing: "yearly", tags: null });
    ok(productPatch, { active: false });
    bad(productPatch, { id: "outro", name: "x" });
    bad(productPatch, { createdAt: "2020-01-01" });
    bad(productCreate, { name: "x", price: -1 });
    bad(productCreate, { name: "x", price: "10" });
    bad(productCreate, { name: "", price: 1 });
    bad(productCreate, { name: "x".repeat(121), price: 1 });
  });

  it("venda: tamanhos e tipos", () => {
    ok(saleCreate, { client: "Ana", product: "Bot", value: 50, staffName: "Enzo", notes: "ok", receipt: "https://x/y.png" });
    bad(saleCreate, { client: "Ana", product: "Bot", value: 50, staffName: "Enzo", staffId: "x" });
    bad(saleCreate, { client: "Ana", product: "Bot", value: NaN, staffName: "Enzo" });
    bad(saleCreate, { client: "Ana", product: "Bot", value: 50 });
    ok(salePatch, { client: "Ana", value: 12.5, notes: null });
    bad(salePatch, { receipt: "x" });
    bad(salePatch, { id: "x" });
  });

  it("tarefa: só valores conhecidos de status e prioridade", () => {
    ok(taskCreate, { title: "Fazer", priority: "high" });
    bad(taskCreate, { title: "Fazer", priority: "urgentissimo" });
    ok(taskPatch, { status: "done" });
    bad(taskPatch, { status: "hackeado" });
    bad(taskPatch, { updatedAt: "x" });
  });

  it("cliente, formulário, bot e perfil", () => {
    ok(clientCreate, { name: "Ana", email: "a@b.co", discordId: "123", notes: "n" });
    ok(clientCreate, { name: "Ana", email: "" });
    bad(clientCreate, { name: "Ana", email: "não é email" });
    bad(clientCreate, { name: "Ana", status: "vip" });
    ok(applicationReview, { status: "approved" });
    bad(applicationReview, { status: "pending" });
    bad(applicationReview, { status: "approved", reviewedBy: "eu" });
    ok(staffBotCreate, { userId: "u1", discloudAppId: "1234567890123", name: "Bot", botClientId: "123456789012345678" });
    bad(staffBotCreate, { userId: "u1", discloudAppId: "../../x" });
    bad(staffBotCreate, { userId: "u1", discloudAppId: "123456", botClientId: "../../evil" });
    ok(profileUpdate, { name: "Ana", email: "ana@x.co" });
    ok(profileUpdate, { name: "" });
    bad(profileUpdate, { name: "Ana", isStaff: true });
    bad(profileUpdate, { email: "x" });
  });

  it("candidatura pública: campos obrigatórios, tamanhos e extras", () => {
    const base = { name: "Ana", age: "20", discordId: "123456789012345678", discord: "ana#0001", why: "porque sim", experience: "pouca", hours: "4" };
    ok(publicApplication, base);
    ok(publicApplication, { ...base, extra: "" });
    bad(publicApplication, { ...base, why: "x".repeat(1501) });
    bad(publicApplication, { ...base, status: "approved" });
    bad(publicApplication, { name: "Ana" });
  });
});
