import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, price, category, description, badge, billing, tags } = await req.json();
  if (!name || price == null) return NextResponse.json({ error: "Nome e preço obrigatórios" }, { status: 400 });

  const product = await prisma.product.create({
    data: { name, price: Number(price), category: category || null, description: description || null, badge: badge || null, billing: billing || "monthly", tags: tags || null },
  });

  await prisma.log.create({
    data: {
      action: "Produto cadastrado",
      details: `${name} — R$${Number(price).toFixed(2)}`,
      staffName: session!.user?.username || session!.user?.name || "Staff",
    },
  });

  return NextResponse.json(product, { status: 201 });
}
