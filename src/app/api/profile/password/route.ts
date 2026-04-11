import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: "Nova senha deve ter no mínimo 6 caracteres" }, { status: 400 });

  const user = await prisma.siteUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.siteUser.update({ where: { email: session.user.email }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
