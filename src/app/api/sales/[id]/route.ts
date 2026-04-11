import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const sale = await prisma.sale.update({
      where: { id },
      data: {
        ...(body.client && { client: body.client }),
        ...(body.product && { product: body.product }),
        ...(body.value != null && { value: Number(body.value) }),
        ...(body.notes !== undefined && { notes: body.notes || null }),
        ...(body.staffName && { staffName: body.staffName }),
      },
    });
    return NextResponse.json(sale);
  } catch {
    return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.sale.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 });
  }
}
