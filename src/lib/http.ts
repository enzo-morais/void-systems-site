import { NextResponse } from "next/server";

/**
 * Resposta 500 sem detalhes internos: o erro real vai só para o log do servidor.
 * (Antes várias rotas devolviam `e.message`, que podia expor texto do Prisma, da Discloud ou do Discord.)
 */
export function serverError(context: string, e: unknown, publicMessage = "Erro interno. Tente novamente."): NextResponse {
  console.error(`[${context}]`, e instanceof Error ? e.message : e);
  return NextResponse.json({ error: publicMessage }, { status: 500 });
}
