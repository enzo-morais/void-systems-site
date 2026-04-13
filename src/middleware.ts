import { NextRequest, NextResponse } from "next/server";

// Rotas que não precisam de login
const PUBLIC_PATHS = [
  "/login",
  "/termos",
  "/privacidade",
  "/api/auth",
  "/api/public",
  "/_next",
  "/favicon",
  "/icon",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Liberar rotas públicas
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Liberar arquivos estáticos
  if (pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2)$/)) {
    return NextResponse.next();
  }

  // Verificar cookie de sessão do NextAuth
  const sessionToken =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  if (!sessionToken) {
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
