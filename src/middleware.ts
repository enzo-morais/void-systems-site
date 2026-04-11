import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Rotas que não precisam de login
  const publicPaths = ["/login", "/api/auth", "/api/public", "/termos", "/privacidade"];
  const isPublic = publicPaths.some((p) => req.nextUrl.pathname.startsWith(p));

  // Assets e arquivos estáticos
  const isAsset = req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/uploads") ||
    req.nextUrl.pathname.includes(".");

  if (isPublic || isAsset) return NextResponse.next();

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
