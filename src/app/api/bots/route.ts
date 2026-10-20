import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

function getUserId(session: any): string | null {
  return session?.user?.id ?? session?.user?.discordId ?? null;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const discordId = (session as any)?.user?.discordId;
    const bots = await prisma.discloudBot.findMany({
      where: {
        OR: [
          { userId },
          ...(discordId && discordId !== userId ? [{ userId: discordId }] : [])
        ]
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ bots });
  } catch (error) {
    console.error("Erro ao listar bots:", error);
    return NextResponse.json({ error: "Erro ao carregar bots" }, { status: 500 });
  }
}

// Não existe POST aqui de propósito: cliente nunca cadastra nem vincula bot.
// Só o staff faz isso, em POST /api/staff/bots (que exige o cargo de staff no servidor).
