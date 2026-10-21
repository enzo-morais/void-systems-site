// Verifica GET /api/sales/[id]/receipt contra o servidor de DESENVOLVIMENTO local (usa o staff de teste do .env.local).
// Rodar:  npx next dev -p 3003   e depois   BASE=http://localhost:3003 node scripts/security/receipt-route-check.mjs
// Cria uma venda temporária no banco e apaga no final. Nunca use contra produção.
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.BASE || "http://localhost:3003";
if (!/localhost|127\.0\.0\.1/.test(BASE)) throw new Error("Só roda em localhost");

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^"|"$/g, "")]),
);
if (!env.DEV_STAFF_EMAIL || !env.DEV_STAFF_PASSWORD) throw new Error("DEV_STAFF_EMAIL/PASSWORD ausentes no .env.local");

const prisma = new PrismaClient();
const results = [];
const check = (nome, ok, extra = "") => {
  results.push(ok);
  console.log(`${ok ? "PASSOU" : "FALHOU"}  ${nome}${extra ? "  → " + extra : ""}`);
};

async function login(email, password) {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const jar = (csrfRes.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: jar },
    body: new URLSearchParams({ csrfToken, email, password, json: "true" }).toString(),
  });
  const cookies = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]);
  return [jar, ...cookies].filter(Boolean).join("; ");
}

const get = (path, cookie) => fetch(`${BASE}${path}`, { redirect: "manual", headers: cookie ? { Cookie: cookie } : {} });
const created = [];

try {
  const staff = await login(env.DEV_STAFF_EMAIL, env.DEV_STAFF_PASSWORD);
  const me = await (await get("/api/auth/session", staff)).json();
  check("login do staff de teste (dev)", me?.user?.isStaff === true, JSON.stringify(me?.user ?? null));

  const withReceipt = await prisma.sale.create({ data: { client: "teste", product: "teste", value: 1, staffName: "teste", receipt: "1789000000000-3f2b8c1e-4d5a-4b6c-8e7f-9a0b1c2d3e4f.png" } });
  const legacy = await prisma.sale.create({ data: { client: "teste", product: "teste", value: 1, staffName: "teste", receipt: "https://x.supabase.co/storage/v1/object/public/receipts/1700000000000-abc123.png" } });
  const without = await prisma.sale.create({ data: { client: "teste", product: "teste", value: 1, staffName: "teste" } });
  const evil = await prisma.sale.create({ data: { client: "teste", product: "teste", value: 1, staffName: "teste", receipt: "https://evil.example.com/segredo" } });
  created.push(withReceipt.id, legacy.id, without.id, evil.id);

  const anon = await get(`/api/sales/${withReceipt.id}/receipt`);
  check("sem login: não chega na rota (307 para /login)", anon.status === 307 && (anon.headers.get("location") ?? "").includes("/login"), `status ${anon.status}`);

  const a = await get(`/api/sales/${withReceipt.id}/receipt`, staff);
  // com a chave de serviço do Supabase real: 302 para a URL assinada; com a chave de exemplo local: 502 (não consegue assinar)
  check("staff com comprovante: 302 (assinado) ou 502 (Storage local sem chave real), nunca 200/404", a.status === 302 || a.status === 502, `status ${a.status}`);
  if (a.status === 302) {
    check("redirect vai para o Supabase, com cache desligado", /supabase\.co/.test(a.headers.get("location") ?? "") && /no-store/.test(a.headers.get("cache-control") ?? ""));
  }
  const b = await get(`/api/sales/${legacy.id}/receipt`, staff);
  check("comprovante antigo (URL pública salva) também é tratado (302/502)", b.status === 302 || b.status === 502, `status ${b.status}`);
  const c = await get(`/api/sales/${without.id}/receipt`, staff);
  check("venda sem comprovante: 404", c.status === 404, `status ${c.status}`);
  const d = await get(`/api/sales/${evil.id}/receipt`, staff);
  check("valor salvo que não é do bucket (URL de outro site): 404, não assina nem redireciona", d.status === 404, `status ${d.status}`);
  const e = await get(`/api/sales/id-que-nao-existe/receipt`, staff);
  check("venda inexistente: 404", e.status === 404, `status ${e.status}`);
} finally {
  await prisma.sale.deleteMany({ where: { id: { in: created } } });
  await prisma.$disconnect();
}

const falhas = results.filter((x) => !x).length;
console.log(`\n${results.length - falhas}/${results.length} verificações passaram.`);
process.exit(falhas ? 1 : 0);
