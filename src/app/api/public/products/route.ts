import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true, description: true, category: true, badge: true, billing: true, tags: true },
  });
  return NextResponse.json(products);
}
