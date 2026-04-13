import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { startBot } from "@/lib/discloud-api";
import { userOwnsBot } from "@/lib/bot-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const bot = await prisma.discloudBot.findUnique({ where: { id } });
  if (!bot || !userOwnsBot(bot, session)) return NextResponse.json({ error: "Bot não encontrado" }, { status: 404 });

  try {
    await startBot(bot.discloudAppId);
    await prisma.discloudBot.update({ where: { id }, data: { status: "starting", lastAction: new Date() } });
    await prisma.log.create({ data: {
      userId: bot.userId,
      action: "bot_start",
      details: `Bot ${bot.name} iniciado`,
      staffName: (session.user as any)?.name || "Cliente"
    }});
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erro ao iniciar" }, { status: 500 });
  }
}
