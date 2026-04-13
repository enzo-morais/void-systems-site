import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import { getBotStatus } from "@/lib/discloud-api";
import { userOwnsBot } from "@/lib/bot-auth";

const prisma = new PrismaClient();

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const bot = await prisma.discloudBot.findUnique({ where: { id } });
    if (!bot || !userOwnsBot(bot, session)) return NextResponse.json({ error: "Bot não encontrado" }, { status: 404 });

    const status = await getBotStatus(bot.discloudAppId);
    await prisma.discloudBot.update({ where: { id }, data: { status: status.status, lastAction: new Date() } });
    return NextResponse.json({ bot, status });
  } catch {
    return NextResponse.json({ error: "Erro ao obter status" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const bot = await prisma.discloudBot.findUnique({ where: { id } });
    if (!bot || !userOwnsBot(bot, session)) return NextResponse.json({ error: "Bot não encontrado" }, { status: 404 });

    await prisma.discloudBot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao remover bot" }, { status: 500 });
  }
}
