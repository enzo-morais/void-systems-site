import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { RULES, enforce, sessionKey } from "@/lib/ratelimit";
import { receiptPath, signedReceiptUrl } from "@/lib/receipts";

/**
 * GET /api/sales/[id]/receipt — só staff. Redireciona para uma URL assinada de 60 segundos do comprovante
 * (o bucket é privado). Serve tanto como href de link quanto como src de <img>.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  { const limited = await enforce(RULES.receiptView, sessionKey(session)); if (limited) return limited; }

  const { id } = await params;
  const sale = await prisma.sale.findUnique({ where: { id }, select: { receipt: true } });
  const path = receiptPath(sale?.receipt);
  if (!path) return NextResponse.json({ error: "Comprovante não encontrado" }, { status: 404 });

  const url = await signedReceiptUrl(path);
  if (!url) return NextResponse.json({ error: "Não foi possível abrir o comprovante agora" }, { status: 502 });

  // a URL assinada é de uso imediato: nada de guardar em cache
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
}
