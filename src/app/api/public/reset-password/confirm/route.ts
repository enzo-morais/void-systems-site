import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, code, newPassword } = await req.json();
  if (!email || !code || !newPassword) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres" }, { status: 400 });

  const user = await prisma.siteUser.findUnique({ where: { email } });
  if (!user || user.verifyCode !== code) {
    return NextResponse.json({ error: "Código incorreto" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.siteUser.update({
    where: { email },
    data: { password: hashed, verifyCode: null },
  });

  return NextResponse.json({ success: true });
}
