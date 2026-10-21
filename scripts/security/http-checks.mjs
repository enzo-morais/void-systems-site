// Verificações HTTP de segurança contra o servidor LOCAL (nunca produção).
// Rodar com o servidor ligado:  BASE=http://localhost:3002 node scripts/security/http-checks.mjs
// Cria usuários de teste (@example.invalid) no banco e apaga tudo no final.
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const BASE = process.env.BASE || "http://localhost:3002";
if (!/localhost|127\.0\.0\.1/.test(BASE)) throw new Error("Estes testes só rodam em localhost");
const prisma = new PrismaClient();
const created = [];
const results = [];
const check = (nome, ok, extra = "") => {
  results.push(ok);
  console.log(`${ok ? "PASSOU" : "FALHOU"}  ${nome}${extra ? "  → " + extra : ""}`);
};
const uniq = () => randomBytes(4).toString("hex");
let ipN = 0;
const freshIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${++ipN % 250}`;

async function post(path, body, headers = {}) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": freshIp(), ...headers },
    body: JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json, retryAfter: res.headers.get("retry-after") };
}

async function mkUser({ verified = true, password = "SenhaForte123" } = {}) {
  const email = `seg-${uniq()}@example.invalid`;
  await prisma.siteUser.create({ data: { name: "Teste", email, password: await bcrypt.hash(password, 4), emailVerified: verified } });
  created.push(email);
  return { email, password };
}

// login pelo NextAuth (credenciais) com cookie jar simples
async function login(email, password, ip = freshIp()) {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const jar = (csrfRes.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: jar, "x-forwarded-for": ip },
    body: new URLSearchParams({ csrfToken, email, password, json: "true" }).toString(),
  });
  const body = await res.json().catch(() => ({}));
  const cookies = (res.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]);
  const session = cookies.find((c) => c.startsWith("next-auth.session-token"));
  const erro = body.url ? new URL(body.url).searchParams.get("error") : null;
  return { session: session ? [jar, ...cookies].filter(Boolean).join("; ") : null, erro };
}

try {
  console.log("== C1: cliente não cadastra bot ==");
  const u = await mkUser();
  const l = await login(u.email, u.password);
  check("login de teste funciona", !!l.session, l.erro ?? "");
  const r1 = await fetch(`${BASE}/api/bots`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: l.session ?? "" }, body: JSON.stringify({ discloudAppId: "123456789", name: "invasor" }) });
  check("POST /api/bots (logado) é recusado com 405", r1.status === 405, `status ${r1.status}`);
  const r2 = await fetch(`${BASE}/api/bots`, { headers: { Cookie: l.session ?? "" } });
  check("GET /api/bots (listar os próprios bots) continua funcionando", r2.status === 200, `status ${r2.status}`);
  const apps = await prisma.discloudBot.count({ where: { discloudAppId: "123456789" } });
  check("nenhum bot foi criado no banco", apps === 0);
  const r3 = await fetch(`${BASE}/api/staff/bots`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: l.session ?? "" }, body: JSON.stringify({ userId: "1", discloudAppId: "999" }) });
  check("rota de staff continua exigindo staff (403 para cliente)", r3.status === 403, `status ${r3.status}`);

  console.log("\n== C2: /verify ==");
  const v = await mkUser({ verified: false });
  const wrong = await post("/api/public/verify", { email: v.email, code: "000000" });
  const unknown = await post("/api/public/verify", { email: `naoexiste-${uniq()}@example.invalid`, code: "000000" });
  check("código errado → 400 'Código incorreto ou expirado'", wrong.status === 400 && wrong.json?.error === "Código incorreto ou expirado", JSON.stringify(wrong.json));
  check("email inexistente → resposta IDÊNTICA (não revela se a conta existe)", unknown.status === wrong.status && unknown.json?.error === wrong.json?.error);
  const extra = await post("/api/public/verify", { email: v.email, code: "123456", role: "staff" });
  check("campo extra no corpo é rejeitado (400)", extra.status === 400);
  const badCode = await post("/api/public/verify", { email: v.email, code: "12ab" });
  check("código fora do formato é rejeitado (400)", badCode.status === 400);
  // limite por email: 5 por 15 min, mesmo trocando o IP a cada requisição
  const alvo = (await mkUser({ verified: false })).email;
  let last;
  for (let i = 0; i < 7; i++) last = await post("/api/public/verify", { email: alvo, code: "000000" });
  check("depois de 5 tentativas o email leva 429 (mesmo trocando de IP)", last.status === 429, `status ${last.status}`);
  check("429 traz mensagem clara e Retry-After", /Muitas tentativas/.test(last.json?.error ?? "") && !!last.retryAfter, `${last.json?.error} | Retry-After ${last.retryAfter}`);

  console.log("\n== C2: /reset-password/confirm ==");
  const c = await mkUser();
  const cr = await post("/api/public/reset-password/confirm", { email: c.email, code: "000000", newPassword: "OutraSenha123" });
  check("sem código emitido → 400 genérico", cr.status === 400 && cr.json?.error === "Código incorreto ou expirado");
  const alvo2 = (await mkUser()).email;
  let l2;
  for (let i = 0; i < 7; i++) l2 = await post("/api/public/reset-password/confirm", { email: alvo2, code: "000001", newPassword: "OutraSenha123" });
  check("força bruta no /confirm: 429 depois de 5 tentativas", l2.status === 429, `status ${l2.status}`);
  const after = await prisma.siteUser.findUnique({ where: { email: c.email } });
  check("a senha não foi alterada", await bcrypt.compare(c.password, after.password));

  console.log("\n== C2: /reset-password (pedido) ==");
  const ghost = `fantasma-${uniq()}@example.invalid`;
  const s = [];
  for (let i = 0; i < 5; i++) s.push(await post("/api/public/reset-password", { email: ghost }));
  check("email inexistente responde sucesso (não revela a conta)", s[0].status === 200 && s[0].json?.success === true);
  check("pedidos repetidos para o mesmo email levam 429", s.some((x) => x.status === 429), s.map((x) => x.status).join(","));

  console.log("\n== A2: senha mínima de 8 ==");
  const reg7 = await post("/api/public/register", { name: "Teste", email: `seg-${uniq()}@example.invalid`, password: "1234567" });
  check("cadastro com 7 caracteres é recusado (400) com mensagem clara", reg7.status === 400 && /8/.test(reg7.json?.error ?? ""), JSON.stringify(reg7.json));
  const rc7 = await post("/api/public/reset-password/confirm", { email: (await mkUser()).email, code: "123456", newPassword: "1234567" });
  check("redefinição com 7 caracteres é recusada (400)", rc7.status === 400 && /8/.test(rc7.json?.error ?? ""));
  const pw = await mkUser();
  const lp = await login(pw.email, pw.password);
  const chg = (body) => fetch(`${BASE}/api/profile/password`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: lp.session ?? "" }, body: JSON.stringify(body) });
  const c7 = await chg({ currentPassword: pw.password, newPassword: "1234567" });
  check("troca de senha para 7 caracteres é recusada (400)", c7.status === 400, `status ${c7.status}`);
  const same = await prisma.siteUser.findUnique({ where: { email: pw.email } });
  check("a senha não mudou", await bcrypt.compare(pw.password, same.password));
  const old6 = await mkUser({ password: "abc123" });
  const l6 = await login(old6.email, "abc123");
  check("quem tem senha antiga de 6 caracteres ainda consegue ENTRAR", !!l6.session, l6.erro ?? "");

  console.log("\n== A1: rate limit nas rotas de usuário logado ==");
  const lim = await mkUser();
  const ll = await login(lim.email, lim.password);
  const tries = [];
  for (let i = 0; i < 7; i++) tries.push((await fetch(`${BASE}/api/profile/password`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: ll.session ?? "" }, body: JSON.stringify({ currentPassword: "errada-errada", newPassword: "NovaSenha123" }) })).status);
  check("troca de senha: 5 tentativas (400) e depois 429", tries.slice(0, 5).every((x) => x === 400) && tries[5] === 429, tries.join(","));
  const appsSame = [];
  const sameIp = freshIp();
  for (let i = 0; i < 5; i++) appsSame.push((await post("/api/public/applications", {}, { "x-forwarded-for": sameIp })).status);
  check("candidatura pública: 3 tentativas (400, nada é criado) e a 4ª leva 429", appsSame.slice(0, 3).every((x) => x === 400) && appsSame[3] === 429, appsSame.join(","));

  console.log("\n== login: força bruta ==");
  const t = await mkUser();
  const tentativas = [];
  for (let i = 0; i < 8; i++) tentativas.push(await login(t.email, "senhaerrada", freshIp()));
  check("as primeiras tentativas erradas voltam 'CredentialsSignin'", tentativas[0].erro === "CredentialsSignin", String(tentativas[0].erro));
  check("depois de 5 erros o login é bloqueado (RATE_LIMITED), mesmo trocando de IP", tentativas.slice(5).some((x) => x.erro === "RATE_LIMITED"), tentativas.map((x) => x.erro).join(","));
  const certa = await login(t.email, t.password, freshIp());
  check("durante o bloqueio nem a senha certa entra", certa.erro === "RATE_LIMITED" && !certa.session, String(certa.erro));
} finally {
  await prisma.siteUser.deleteMany({ where: { email: { in: created } } });
  await prisma.$disconnect();
}

const falhas = results.filter((x) => !x).length;
console.log(`\n${results.length - falhas}/${results.length} verificações passaram.`);
process.exit(falhas ? 1 : 0);
