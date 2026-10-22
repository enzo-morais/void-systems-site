import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/produtos",
  "/bots",
  "/como-funciona",
  "/clientes",
  "/faq",
  "/sobre",
  "/equipe",
  "/login",
  "/termos",
  "/privacidade",
  "/reembolso",
  "/robots.txt",
  "/sitemap.xml",
  "/transcript",
  "/api/auth",
  "/api/public",
  "/_next",
  "/favicon",
  "/icon",
];

/** Áreas que exigem login. A API (menos /api/auth e /api/public, liberadas acima) também. */
const PRIVATE_PREFIXES = ["/dashboard", "/perfil", "/meus-bots", "/discloud", "/api"];

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Protege as escritas da API contra requisições vindas de outro site (CSRF): se o navegador mandou Origin,
 * ele precisa ser o do próprio site; sem Origin, o Sec-Fetch-Site não pode ser de outro site.
 * Clientes que não são navegador (curl, servidores) não mandam nenhum dos dois e continuam passando:
 * eles não carregam o cookie de sessão de ninguém. /api/auth tem o próprio token CSRF do NextAuth.
 */
function crossOriginWrite(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/") || SAFE_METHODS.has(request.method)) return false;
  if (pathname.startsWith("/api/auth/") || pathname === "/api/public/csp-report") return false;

  const origin = request.headers.get("origin");
  if (origin) {
    const hosts = new Set<string>();
    for (const h of [request.nextUrl.host, request.headers.get("host"), request.headers.get("x-forwarded-host")]) if (h) hosts.add(h);
    try {
      if (process.env.NEXTAUTH_URL) hosts.add(new URL(process.env.NEXTAUTH_URL).host);
    } catch { /* NEXTAUTH_URL inválida */ }
    try {
      return !hosts.has(new URL(origin).host);
    } catch {
      return true; // Origin "null" ou malformado
    }
  }
  const site = request.headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin" && site !== "none";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (crossOriginWrite(request)) {
    return NextResponse.json({ error: "Origem não permitida" }, { status: 403 });
  }

  // Home pública (match exato, "/" sozinho liberaria tudo)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Liberar rotas públicas
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Liberar arquivos estáticos
  if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2)$/)) {
    return NextResponse.next();
  }

  // Só as áreas privadas exigem sessão. Qualquer outro caminho segue para o Next, que mostra a página ou a 404 do tema
  // (antes, uma URL inexistente mandava o visitante para o login).
  if (!PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Sessão válida: confere a assinatura e a validade do JWT (e não só se o cookie existe)
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }).catch(() => null);

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
