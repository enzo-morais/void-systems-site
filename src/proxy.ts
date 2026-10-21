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
  "/transcript",
  "/api/auth",
  "/api/public",
  "/_next",
  "/favicon",
  "/icon",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
