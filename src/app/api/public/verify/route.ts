import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Email e código obrigatórios" }, { status: 400 });
  }

  const user = await prisma.siteUser.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email já verificado" }, { status: 400 });
  }

  if (user.verifyCode !== code) {
    return NextResponse.json({ error: "Código incorreto" }, { status: 400 });
  }

  await prisma.siteUser.update({
    where: { email },
    data: { emailVerified: true, verifyCode: null },
  });

  return NextResponse.json({ success: true });
}
