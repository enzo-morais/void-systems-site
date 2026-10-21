import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { RULES, enforce, sessionKey } from "@/lib/ratelimit";
import { parseBody, passwordSchema } from "@/lib/validation";

const bodySchema = z.object({ currentPassword: z.string().min(1).max(200), newPassword: passwordSchema }).strict();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // limite por usuário: impede tentar descobrir a senha atual em força bruta
  const limited = await enforce(RULES.profilePassword, sessionKey(session));
  if (limited) return limited;

  const parsed = await parseBody(req, bodySchema);
  if (!parsed.ok) return parsed.response;
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.siteUser.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.siteUser.update({ where: { email: session.user.email }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
