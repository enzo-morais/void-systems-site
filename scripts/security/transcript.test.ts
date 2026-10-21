// Testes da rota /transcript/[id] com a API do GitHub simulada (nunca chama o GitHub de verdade).
// Rodar:  npx -y tsx --test scripts/security/transcript.test.ts
import { after, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GET } from "../../src/app/transcript/[id]/route";

const prisma = new PrismaClient();
const realFetch = globalThis.fetch;
const ID = "a1b2c3d4e5f60718293a4b5c6d7e8f90";
const calls: { url: string; headers: Record<string, string> }[] = [];
const ips: string[] = [];

function stubGithub(handler: (url: string) => Response) {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof URL ? input.href : input);
    calls.push({ url, headers: (init?.headers ?? {}) as Record<string, string> });
    return handler(url);
  }) as typeof fetch;
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function call(id = ID, ip?: string) {
  const addr = ip ?? `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  ips.push(addr);
  const req = new NextRequest(`http://localhost/transcript/${id}`, { headers: { "x-forwarded-for": addr } });
  return GET(req, { params: Promise.resolve({ id }) });
}

describe("rota /transcript/[id]", () => {
  beforeEach(() => {
    calls.length = 0;
    process.env.GITHUB_TOKEN = "token-de-teste";
    globalThis.fetch = realFetch;
  });
  after(async () => {
    globalThis.fetch = realFetch;
    await prisma.rateLimit.deleteMany({ where: { key: { in: ips.map((i) => `transcript-ip:${i}`) } } });
    await prisma.$disconnect();
  });

  it("gist válido: devolve o HTML puro com os headers de segurança", async () => {
    const html = "<html><body><h1>Ticket #42</h1></body></html>";
    stubGithub(() => json({ files: { "transcript-42.html": { filename: "transcript-42.html", content: html } } }));
    const res = await call();
    assert.equal(res.status, 200);
    assert.equal(await res.text(), html);
    assert.match(res.headers.get("content-type")!, /^text\/html/);
    assert.match(res.headers.get("x-robots-tag")!, /noindex/);
    assert.equal(res.headers.get("referrer-policy"), "no-referrer");
    assert.match(res.headers.get("content-security-policy")!, /script-src 'none'/);
    assert.match(res.headers.get("cache-control")!, /s-maxage=300/);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `https://api.github.com/gists/${ID}`);
    assert.equal(calls[0].headers.Authorization, "Bearer token-de-teste", "a busca usa o token no servidor");
  });

  it("o token nunca aparece na resposta", async () => {
    stubGithub(() => json({ files: { "transcript-1.html": { filename: "transcript-1.html", content: "<p>ok</p>" } } }));
    const res = await call();
    const all = JSON.stringify([...res.headers.entries()]) + (await res.text());
    assert.equal(all.includes("token-de-teste"), false);
  });

  it("gist cujo arquivo não começa com transcript-: 404, sem servir o conteúdo", async () => {
    stubGithub(() => json({ files: { "segredos.html": { filename: "segredos.html", content: "<p>NÃO PODE VAZAR</p>" } } }));
    const res = await call();
    assert.equal(res.status, 404);
    const body = await res.text();
    assert.match(body, /Este transcript expirou ou não existe\./);
    assert.equal(body.includes("NÃO PODE VAZAR"), false);
  });

  it("gist apagado ou inexistente (404 do GitHub): página 404 do tema", async () => {
    stubGithub(() => json({ message: "Not Found" }, 404));
    const res = await call();
    assert.equal(res.status, 404);
    assert.match(await res.text(), /Este transcript expirou ou não existe\./);
  });

  it("id fora do formato: 404 sem chamar o GitHub", async () => {
    stubGithub(() => json({}));
    for (const bad of ["abc", "../../etc/passwd", "zzzzzzzzzzzzzzzzzzzzzzzz", ID + "g"]) {
      assert.equal((await call(bad)).status, 404);
    }
    assert.equal(calls.length, 0);
  });

  it("arquivo truncado: busca o conteúdo completo em gist.githubusercontent.com", async () => {
    const full = "<p>transcript grande</p>";
    stubGithub((url) =>
      url.startsWith("https://api.github.com/")
        ? json({ files: { "transcript-9.html": { filename: "transcript-9.html", truncated: true, raw_url: "https://gist.githubusercontent.com/u/x/raw/transcript-9.html" } } })
        : new Response(full),
    );
    const res = await call();
    assert.equal(res.status, 200);
    assert.equal(await res.text(), full);
  });

  it("raw_url de outro domínio é recusado (não faz a requisição)", async () => {
    stubGithub(() => json({ files: { "transcript-9.html": { filename: "transcript-9.html", truncated: true, raw_url: "https://evil.example.com/x" } } }));
    const res = await call();
    assert.equal(res.status, 503);
    assert.equal(calls.length, 1);
  });

  it("sem GITHUB_TOKEN: 503 sem chamar o GitHub", async () => {
    delete process.env.GITHUB_TOKEN;
    stubGithub(() => json({}));
    const res = await call();
    assert.equal(res.status, 503);
    assert.equal(calls.length, 0);
  });

  it("erro do GitHub (500/401/403): 503 e não revela detalhes", async () => {
    for (const status of [401, 403, 500]) {
      stubGithub(() => json({ message: "Bad credentials" }, status));
      const res = await call();
      assert.equal(res.status, 503);
      assert.equal((await res.text()).includes("Bad credentials"), false);
    }
  });

  it("rate limit: depois de 30 acessos do mesmo IP no minuto responde 429", async () => {
    stubGithub(() => json({ files: { "transcript-1.html": { filename: "transcript-1.html", content: "<p>ok</p>" } } }));
    const ip = `172.16.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
    const statuses: number[] = [];
    for (let i = 0; i < 33; i++) statuses.push((await call(ID, ip)).status);
    assert.equal(statuses.filter((s) => s === 200).length, 30);
    assert.equal(statuses.at(-1), 429);
  });
});
