import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import { stopBot } from "@/lib/discloud-api";

const prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id ?? (session?.user as any)?.discordId;

  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const bot = await prisma.discloudBot.findUnique({ where: { id } });
  if (!bot || bot.userId !== userId) return NextResponse.json({ error: "Bot não encontrado" }, { status: 404 });

  try {
    await stopBot(bot.discloudAppId);
    await prisma.discloudBot.update({ where: { id }, data: { status: "stopping", lastAction: new Date() } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro ao parar" }, { status: 500 });
  }
}
