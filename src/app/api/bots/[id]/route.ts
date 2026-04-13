import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import { protectBotRoute, createLog } from "@/lib/discloud-middleware";
import { getBotStatus, startBot, stopBot, restartBot } from "@/lib/discloud-api";

const prisma = new PrismaClient();

type Params = { params: Promise<{ id: string }> };
type SessionUser = { id?: string; name?: string };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const bot = await prisma.discloudBot.findUnique({ where: { id, userId } });
    if (!bot) return NextResponse.json({ error: "Bot não encontrado" }, { status: 404 });

    const status = await getBotStatus(bot.discloudAppId);
    await prisma.discloudBot.update({ where: { id }, data: { status: status.status, lastAction: new Date() } });

    return NextResponse.json({ bot, status });
  } catch {
    return NextResponse.json({ error: "Erro ao obter status" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;

  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const url = new URL(request.url);
  const action = url.pathname.split("/").pop(); // start | stop | restart

  const result = await protectBotRoute(request, id);
  if (!result.success) return NextResponse.json({ error: result.message }, { status: 403 });

  try {
    let response;
    let newStatus: string;
    let logAction: string;

    if (action === "start") {
      response = await startBot(result.bot.discloudAppId);
      newStatus = "starting";
      logAction = "bot_start";
    } else if (action === "stop") {
      response = await stopBot(result.bot.discloudAppId);
      newStatus = "stopping";
      logAction = "bot_stop";
    } else if (action === "restart") {
      response = await restartBot(result.bot.discloudAppId);
      newStatus = "starting";
      logAction = "bot_restart";
    } else {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    if (response.success) {
      await prisma.discloudBot.update({ where: { id }, data: { status: newStatus, lastAction: new Date() } });
      await createLog(userId, logAction, `Bot ${result.bot.name} (${result.bot.discloudAppId}) - ${action}`, session?.user?.name || "Usuário");
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Erro na ação" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as SessionUser)?.id;

  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const bot = await prisma.discloudBot.findUnique({ where: { id, userId } });
    if (!bot) return NextResponse.json({ error: "Bot não encontrado" }, { status: 404 });

    await prisma.discloudBot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao remover bot" }, { status: 500 });
  }
}
