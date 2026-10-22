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

  console.log("\n== A4: validação de entrada ==");
  const up = await mkUser();
  const lu = await login(up.email, up.password);
  const upd = (body) => fetch(`${BASE}/api/profile/update`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: lu.session ?? "" }, body: JSON.stringify(body) });
  check("perfil: campo extra (isStaff) é recusado", (await upd({ name: "Novo", isStaff: true })).status === 400);
  check("perfil: email inválido é recusado", (await upd({ email: "nao-e-email" })).status === 400);
  check("perfil: nome válido é aceito", (await upd({ name: "Nome Novo" })).status === 200);
  const longApp = await post("/api/public/applications", { name: "Ana", age: "20", discordId: "123456789012345678", discord: "ana", why: "x".repeat(5000), experience: "y", hours: "4" });
  check("candidatura: texto gigante é recusado (400)", longApp.status === 400);
  const raw = await fetch(`${BASE}/api/public/applications`, { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": freshIp() }, body: "{isso nao e json" });
  check("corpo que não é JSON dá 400 (e não 500)", raw.status === 400, `status ${raw.status}`);
  const wrongType = await post("/api/public/register", ["array"]);
  check("corpo do tipo errado dá 400", wrongType.status === 400);

  console.log("\n== sessão e cadastro ==");
  const forged = await fetch(`${BASE}/perfil`, { redirect: "manual", headers: { Cookie: "next-auth.session-token=cookie-forjado-qualquer" } });
  check("cookie de sessão forjado não passa pelo proxy (307 para /login)", forged.status === 307 && (forged.headers.get("location") ?? "").includes("/login"), `status ${forged.status}`);
  const none = await fetch(`${BASE}/perfil`, { redirect: "manual" });
  check("sem cookie também vai para o login", none.status === 307);
  const real = await fetch(`${BASE}/perfil`, { redirect: "manual", headers: { Cookie: l.session ?? "" } });
  check("sessão válida passa pelo proxy (200)", real.status === 200, `status ${real.status}`);
  const exist = await mkUser();
  const regExisting = await post("/api/public/register", { name: "Invasor", email: exist.email.toUpperCase(), password: "SenhaDoInvasor1" });
  check("cadastro com email já existente responde igual a um novo (201, sem 409)", regExisting.status === 201 && regExisting.json?.needsVerification === true, JSON.stringify(regExisting.json));
  const still = await prisma.siteUser.findUnique({ where: { email: exist.email } });
  check("a conta existente não foi alterada (nome, senha e nenhum código novo)", still.name === "Teste" && (await bcrypt.compare(exist.password, still.password)) && !still.verifyCodeHash);
  const lower = await login(exist.email.toUpperCase(), exist.password);
  check("login com o email em MAIÚSCULAS funciona (normalizado)", !!lower.session, lower.erro ?? "");

  console.log("\n== cabeçalhos e origem ==");
  const home = await fetch(`${BASE}/login`);
  const hh = (k) => home.headers.get(k) ?? "";
  check("cabeçalhos de segurança presentes (nosniff, frame DENY, referrer, permissions, HSTS)", hh("x-content-type-options") === "nosniff" && hh("x-frame-options") === "DENY" && !!hh("referrer-policy") && !!hh("permissions-policy") && !!hh("strict-transport-security"));
  check("CSP em modo report-only (não bloqueia) com frame-ancestors 'none'", /frame-ancestors 'none'/.test(hh("content-security-policy-report-only")) && !hh("content-security-policy"));
  check("não anuncia X-Powered-By", !hh("x-powered-by"));
  const tr = await fetch(`${BASE}/transcript/zzzz`);
  check("/transcript mantém o próprio Referrer-Policy: no-referrer", tr.headers.get("referrer-policy") === "no-referrer" && /script-src 'none'/.test(tr.headers.get("content-security-policy") ?? ""));
  const probe = `p-${uniq()}@example.invalid`;
  const evilOrigin = await post("/api/public/verify", { email: probe, code: "000000" }, { Origin: "https://evil.example.com" });
  check("POST vindo de outro site (Origin estranho) é barrado com 403", evilOrigin.status === 403, `status ${evilOrigin.status}`);
  const crossSite = await post("/api/public/verify", { email: probe, code: "000000" }, { "Sec-Fetch-Site": "cross-site" });
  check("POST com Sec-Fetch-Site cross-site e sem Origin também é barrado (403)", crossSite.status === 403, `status ${crossSite.status}`);
  const nullOrigin = await post("/api/public/verify", { email: probe, code: "000000" }, { Origin: "null" });
  check("Origin 'null' (iframe sandbox) é barrado (403)", nullOrigin.status === 403);
  const sameOrigin = await post("/api/public/verify", { email: probe, code: "000000" }, { Origin: BASE, "Sec-Fetch-Site": "same-origin" });
  check("POST do próprio site passa normalmente (400 de código errado, não 403)", sameOrigin.status === 400, `status ${sameOrigin.status}`);
  const noOrigin = await post("/api/public/verify", { email: probe, code: "000000" });
  check("cliente sem Origin (curl/servidor) continua funcionando", noOrigin.status === 400, `status ${noOrigin.status}`);
  const csp = await fetch(`${BASE}/api/public/csp-report`, { method: "POST", headers: { "Content-Type": "application/csp-report", Origin: "https://evil.example.com" }, body: "{}" });
  check("endpoint de relatório de CSP responde 204 (não exige Origin do site)", csp.status === 204, `status ${csp.status}`);
  const upl = await fetch(`${BASE}/api/upload`, { method: "POST", headers: { Cookie: l.session ?? "" }, body: new FormData() });
  check("upload exige staff (cliente comum leva 401)", upl.status === 401, `status ${upl.status}`);
  const rcpt = await fetch(`${BASE}/api/sales/qualquer-id/receipt`, { redirect: "manual", headers: { Cookie: l.session ?? "" } });
  check("comprovante: cliente comum não consegue URL assinada (401)", rcpt.status === 401, `status ${rcpt.status}`);

  console.log("\n== login: força bruta ==");
  console.log("\n== páginas legais, robots e sitemap ==");
  const pg = async (path) => {
    const r = await fetch(`${BASE}${path}`, { redirect: "manual" });
    return { status: r.status, body: await r.text(), headers: r.headers };
  };
  const reemb = await pg("/reembolso");
  check("/reembolso é pública (200), cita os 7 dias e o Pix e só pede o ticket no Discord", reemb.status === 200 && /7 dias corridos/.test(reemb.body) && /Pix/.test(reemb.body), `status ${reemb.status}`);
  check("nenhuma página legal mostra [PREENCHER]", !/PREENCHER/.test(reemb.body));
  const termosPg = await pg("/termos");
  check("/termos sem as frases antigas (99,9% e 'não realizamos reembolsos')", termosPg.status === 200 && !/99[.,]9/.test(termosPg.body) && !/não realizamos reembolsos/i.test(termosPg.body));
  const priv = await pg("/privacidade");
  check("/privacidade traz direitos (art. 18), operadora/controlador e cookies", priv.status === 200 && /OPERADORA/.test(priv.body) && /art\. 18/.test(priv.body) && /Cookies/.test(priv.body));
  const home2 = await pg("/");
  check("rodapé: Termos, Privacidade, Reembolso, Suporte no Discord, aviso do Discord e nada a preencher", /Política de Reembolso/.test(home2.body) && /Suporte no Discord/.test(home2.body) && /não é afiliada ao Discord Inc/.test(home2.body) && !/PREENCHER/.test(home2.body));
  console.log("\n== preview do link (Open Graph / Twitter) ==");
  const URLBASE = "https://www.voidsystems.store";
  const has = (html, str) => html.includes(str);
  const homeHtml = home2.body;
  check("home: og:title e og:description exatos", has(homeHtml, 'property="og:title" content="VØID Systems — Bots para Discord"') && has(homeHtml, 'property="og:description" content="4 combos prontos para o seu servidor: Simples, Community, DayZ e Server Games. Pix pelo Discord, suporte direto e cancele quando quiser."'));
  check("home: og:site_name, og:type, og:locale e og:url", has(homeHtml, 'property="og:site_name" content="VØID Systems"') && has(homeHtml, 'property="og:type" content="website"') && has(homeHtml, 'property="og:locale" content="pt_BR"') && (has(homeHtml, `property="og:url" content="${URLBASE}/"`) || has(homeHtml, `property="og:url" content="${URLBASE}"`)));
  check("home: SEM imagem (nenhum og:image nem twitter:image)", !has(homeHtml, 'property="og:image') && !has(homeHtml, 'name="twitter:image'));
  check("home: Twitter card (summary) com o mesmo título e descrição", has(homeHtml, 'name="twitter:card" content="summary"') && has(homeHtml, 'name="twitter:title" content="VØID Systems — Bots para Discord"') && has(homeHtml, 'name="twitter:description" content="4 combos prontos'));
  check("home: theme-color #000000", has(homeHtml, 'name="theme-color" content="#000000"'));
  check("home: canonical aponta para o www", has(homeHtml, `rel="canonical" href="${URLBASE}/"`) || has(homeHtml, `rel="canonical" href="${URLBASE}"`));
  for (const [path, title] of [["/termos", "Termos de Uso — VØID Systems"], ["/privacidade", "Política de Privacidade — VØID Systems"], ["/reembolso", "Política de Reembolso — VØID Systems"], ["/bots", "Combos e bots para Discord — VØID Systems"], ["/faq", "Perguntas frequentes — VØID Systems"]]) {
    const r = await pg(path);
    check(`${path}: título e descrição próprios e canonical`, has(r.body, `property="og:title" content="${title}"`) && has(r.body, `rel="canonical" href="${URLBASE}${path}"`) && has(r.body, 'property="og:description" content="') && !has(r.body, 'property="og:image') && !has(r.body, 'content="4 combos prontos para o seu servidor: Simples'));
  }
  const botPg = await pg("/bots/ticket");
  check("/bots/[id]: título do bot", has(botPg.body, 'property="og:title" content="Bot de Ticket — VØID Systems"'));
  const loginPg = await pg("/login");
  check("/login: noindex e SEM preview (nenhuma tag og:)", has(loginPg.body, 'name="robots" content="noindex') && !has(loginPg.body, 'property="og:'));
  const perfilPg2 = await fetch(`${BASE}/perfil`, { redirect: "manual", headers: { Cookie: l.session ?? "" } });
  const perfilHtml2 = await perfilPg2.text();
  check("/perfil (logado): noindex e SEM preview", has(perfilHtml2, 'name="robots" content="noindex') && !has(perfilHtml2, 'property="og:'));
  const ogGone = await fetch(`${BASE}/og.png`, { redirect: "manual" });
  check("não existe mais imagem de compartilhamento (/og.png não responde 200)", ogGone.status !== 200, `status ${ogGone.status}`);
  const robots = await pg("/robots.txt");
  check("robots.txt libera o site e bloqueia painel, perfil, api e transcripts", robots.status === 200 && /Disallow: \/dashboard/.test(robots.body) && /Disallow: \/perfil/.test(robots.body) && /Disallow: \/api\//.test(robots.body) && /Disallow: \/transcript\//.test(robots.body) && /Sitemap:/.test(robots.body));
  const sm = await pg("/sitemap.xml");
  check("sitemap.xml lista as páginas públicas e não lista o painel", sm.status === 200 && /\/reembolso/.test(sm.body) && /\/bots\/ticket/.test(sm.body) && !/dashboard|perfil|login/.test(sm.body));
  const perfilPg = await fetch(`${BASE}/perfil`, { redirect: "manual", headers: { Cookie: l.session ?? "" } });
  const perfilHtml = await perfilPg.text();
  check("/perfil (logado) tem noindex", /name="robots" content="noindex/.test(perfilHtml));
  const notFound = await pg("/pagina-que-nao-existe-xyz");
  check("URL inexistente (sem login) mostra a 404 do tema, não o login", notFound.status === 404 && /Página não encontrada/.test(notFound.body), `status ${notFound.status}`);
  for (const privatePath of ["/dashboard", "/perfil", "/meus-bots", "/discloud", "/api/bots", "/api/sales"]) {
    const r = await fetch(`${BASE}${privatePath}`, { redirect: "manual" });
    check(`área privada ${privatePath} sem login continua indo para /login (307)`, r.status === 307 && (r.headers.get("location") ?? "").includes("/login"), `status ${r.status}`);
  }

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
