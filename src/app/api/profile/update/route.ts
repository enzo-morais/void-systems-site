import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { name, email } = await req.json();

  if (email && email !== session.user.email) {
    const existing = await prisma.siteUser.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email já em uso" }, { status: 409 });
  }

  await prisma.siteUser.update({
    where: { email: session.user.email },
    data: { ...(name && { name }), ...(email && { email }) },
  });

  return NextResponse.json({ success: true });
}
