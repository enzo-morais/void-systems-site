import { NextRequest, NextResponse } from "next/server";
import { RULES, checkRate, getClientIp } from "@/lib/ratelimit";

// Serve o HTML de um transcript de ticket guardado como gist SECRETO no GitHub.
// A busca é feita aqui, no servidor, com GITHUB_TOKEN (token só com permissão "gist"): o navegador nunca vê o token.
// A resposta é o HTML puro (fora do layout do site), sem JavaScript.

export const runtime = "nodejs";

const GIST_ID = /^[0-9a-f]{20,40}$/i;
const MAX_BYTES = 8 * 1024 * 1024; // protege a memória da função; o bot mantém o transcript bem abaixo disso
const CACHE_SECONDS = 300; // cache curto, para não estourar o limite da API do GitHub

// O transcript não usa JavaScript: bloqueia qualquer script. Imagens: embutidas (data:) e CDN do Discord.
const CSP = [
  "default-src 'none'",
  "script-src 'none'",
  "style-src 'unsafe-inline'",
  "img-src data: https://cdn.discordapp.com https://media.discordapp.net",
  "font-src 'none'",
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

const BASE_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": CSP,
  "X-Content-Type-Options": "nosniff",
};

/** 404 no tema do site (escuro, destaque roxo), em HTML próprio para não passar pelo layout. */
function notFoundPage(status: number, title: string, text: string, cache: string) {
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${title} — VØID Systems</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;background:#000;color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.n{font-size:clamp(7rem,28vw,12rem);font-weight:700;line-height:1;letter-spacing:-.05em;color:rgba(143,125,255,.16);margin:0}
h1{font-size:clamp(1.5rem,5vw,1.9rem);margin:-1.4rem 0 .75rem}p{color:rgba(192,192,192,.8);font-size:.9rem;max-width:26rem;margin:0 0 2rem;line-height:1.5}
a{display:inline-block;padding:.75rem 1.6rem;border-radius:999px;background:#7c3aed;color:#fff;text-decoration:none;font-weight:600;font-size:.9rem}a:hover{background:#6d28d9}
</style></head><body><p class="n">${status === 404 ? "404" : status}</p><h1>${title}</h1><p>${text}</p><a href="/">Voltar ao início</a></body></html>`;
  return new NextResponse(html, { status, headers: { ...BASE_HEADERS, "Cache-Control": cache } });
}

const expired = () =>
  notFoundPage(404, "Este transcript expirou ou não existe.", "O link pode ter passado da validade ou o transcript foi apagado.", "public, max-age=0, s-maxage=60");

type GistFile = { filename?: string; content?: string; truncated?: boolean; raw_url?: string };

function githubHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "void-systems-transcript",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

type Result = { kind: "ok"; html: string } | { kind: "missing" } | { kind: "error" };

async function loadTranscript(id: string, token: string): Promise<Result> {
  try {
    const res = await fetch(`https://api.github.com/gists/${id}`, {
      headers: githubHeaders(token),
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: CACHE_SECONDS },
    });
    if (res.status === 404 || res.status === 410) return { kind: "missing" };
    if (!res.ok) {
      console.error(`[transcript] GitHub respondeu HTTP ${res.status}`);
      return { kind: "error" };
    }
    const gist = (await res.json()) as { files?: Record<string, GistFile> };
    // só serve arquivos "transcript-*.html": nunca outros gists da conta
    const file = Object.values(gist.files ?? {}).find(
      (f) => f.filename?.startsWith("transcript-") && f.filename.endsWith(".html"),
    );
    if (!file) return { kind: "missing" };

    let html = file.content;
    if ((file.truncated || typeof html !== "string") && file.raw_url) {
      const raw = new URL(file.raw_url);
      if (raw.protocol !== "https:" || raw.hostname !== "gist.githubusercontent.com") return { kind: "error" };
      const r = await fetch(raw, { signal: AbortSignal.timeout(15_000), next: { revalidate: CACHE_SECONDS } });
      if (!r.ok) return { kind: "error" };
      html = await r.text();
    }
    if (typeof html !== "string" || !html.length) return { kind: "missing" };
    if (Buffer.byteLength(html, "utf8") > MAX_BYTES) return { kind: "error" };
    return { kind: "ok", html };
  } catch (e) {
    console.error("[transcript] falha ao buscar o gist:", e instanceof Error ? e.message : e);
    return { kind: "error" };
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!GIST_ID.test(id)) return expired();

  const limit = await checkRate(RULES.transcriptIp, getClientIp(req.headers));
  if (!limit.ok) {
    const r = notFoundPage(429, "Muitas tentativas", "Aguarde um pouco e abra o link novamente.", "no-store");
    r.headers.set("Retry-After", String(limit.retryAfterSec));
    return r;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("[transcript] GITHUB_TOKEN não configurado nas variáveis de ambiente.");
    return notFoundPage(503, "Transcript indisponível", "Tente novamente em alguns minutos.", "no-store");
  }

  const result = await loadTranscript(id, token);
  if (result.kind === "missing") return expired();
  if (result.kind === "error") return notFoundPage(503, "Transcript indisponível", "Tente novamente em alguns minutos.", "no-store");

  return new NextResponse(result.html, {
    status: 200,
    headers: { ...BASE_HEADERS, "Cache-Control": `public, max-age=60, s-maxage=${CACHE_SECONDS}` },
  });
}
