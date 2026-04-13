import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import { sanitizeInput } from "@/lib/discloud-middleware";

const prisma = new PrismaClient();

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
    const bots = await prisma.discloudBot.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ bots });
  } catch (error) {
    console.error("Erro ao listar bots:", error);
    return NextResponse.json({ error: "Erro ao carregar bots" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);

  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { discloudAppId, name } = body;

    const sanitizedAppId = sanitizeInput(String(discloudAppId ?? ""));
    const sanitizedName = sanitizeInput(String(name ?? ""));

    if (!sanitizedAppId || !sanitizedName) {
      return NextResponse.json({ error: "App ID e nome são obrigatórios" }, { status: 400 });
    }

    const existingBot = await prisma.discloudBot.findFirst({
      where: {
        OR: [
          { discloudAppId: sanitizedAppId },
          { name: sanitizedName, userId }
        ]
      }
    });

    if (existingBot) {
      return NextResponse.json({ error: "Bot já cadastrado" }, { status: 400 });
    }

    const bot = await prisma.discloudBot.create({
      data: { userId, discloudAppId: sanitizedAppId, name: sanitizedName, status: "offline" }
    });

    return NextResponse.json({ bot }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar bot:", error);
    return NextResponse.json({ error: "Erro ao adicionar bot" }, { status: 500 });
  }
}
