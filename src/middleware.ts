import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * Middleware para proteger rotas do dashboard
 */
export async function middleware(request: NextRequest) {
  // Proteger apenas rotas do dashboard
  if (request.nextUrl.pathname.startsWith("/discloud")) {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      // Redirecionar para login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar se o usuário está autorizado (apenas ID específico)
    const authorizedUserId = process.env.AUTHORIZED_USER_ID;
    if (authorizedUserId && session.user.id !== authorizedUserId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/discloud/:path*"]
};
