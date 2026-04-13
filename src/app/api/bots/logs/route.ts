import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const discordId = (session.user as any)?.discordId;
  const userId = (session.user as any)?.id;

  // Buscar logs de ações dos bots do usuário
  const logs = await prisma.log.findMany({
    where: {
      action: { in: ["bot_start", "bot_stop", "bot_restart"] },
      OR: [
        { userId },
        ...(discordId ? [{ userId: discordId }] : [])
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return NextResponse.json(logs);
}
