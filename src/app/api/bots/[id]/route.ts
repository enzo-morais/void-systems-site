import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import { protectBotRoute, createLog } from "@/lib/discloud-middleware";
import { getBotStatus, startBot, stopBot, restartBot } from "@/lib/discloud-api";

const prisma = new PrismaClient();

/**
 * GET /api/bots/:id - Obter status do bot
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const bot = await prisma.discloudBot.findUnique({
      where: { id: params.id, userId }
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot não encontrado" }, { status: 404 });
    }

    // Obter status real da Discloud
    const status = await getBotStatus(bot.discloudAppId);

    // Atualizar status no banco
    await prisma.discloudBot.update({
      where: { id: params.id },
      data: { status: status.status, lastAction: new Date() }
    });

    return NextResponse.json({ bot, status });
  } catch (error) {
    console.error("Erro ao obter status do bot:", error);
    return NextResponse.json({ error: "Erro ao obter status" }, { status: 500 });
  }
}

/**
 * POST /api/bots/:id/start - Iniciar bot
 */
export async function POST_START(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Verificar proteção
  const result = await protectBotRoute(request, params.id);
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 403 });
  }

  try {
    // Iniciar bot na Discloud
    const response = await startBot(result.bot.discloudAppId);

    if (response.success) {
      // Atualizar status no banco
      await prisma.discloudBot.update({
        where: { id: params.id },
        data: { status: "starting", lastAction: new Date() }
      });

      // Criar log
      await createLog(
        userId,
        "bot_start",
        `Bot ${result.bot.name} (${result.bot.discloudAppId}) iniciado`,
        session.user.name || "Usuário"
      );

      return NextResponse.json({ success: true, message: "Bot iniciado com sucesso" });
    }

    return NextResponse.json({ error: "Erro ao iniciar bot" }, { status: 500 });
  } catch (error) {
    console.error("Erro ao iniciar bot:", error);
    return NextResponse.json({ error: "Erro ao iniciar bot" }, { status: 500 });
  }
}

/**
 * POST /api/bots/:id/stop - Parar bot
 */
export async function POST_STOP(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Verificar proteção
  const result = await protectBotRoute(request, params.id);
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 403 });
  }

  try {
    // Parar bot na Discloud
    const response = await stopBot(result.bot.discloudAppId);

    if (response.success) {
      // Atualizar status no banco
      await prisma.discloudBot.update({
        where: { id: params.id },
        data: { status: "stopping", lastAction: new Date() }
      });

      // Criar log
      await createLog(
        userId,
        "bot_stop",
        `Bot ${result.bot.name} (${result.bot.discloudAppId}) parado`,
        session.user.name || "Usuário"
      );

      return NextResponse.json({ success: true, message: "Bot parado com sucesso" });
    }

    return NextResponse.json({ error: "Erro ao parar bot" }, { status: 500 });
  } catch (error) {
    console.error("Erro ao parar bot:", error);
    return NextResponse.json({ error: "Erro ao parar bot" }, { status: 500 });
  }
}

/**
 * POST /api/bots/:id/restart - Reiniciar bot
 */
export async function POST_RESTART(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Verificar proteção
  const result = await protectBotRoute(request, params.id);
  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 403 });
  }

  try {
    // Reiniciar bot na Discloud
    const response = await restartBot(result.bot.discloudAppId);

    if (response.success) {
      // Atualizar status no banco
      await prisma.discloudBot.update({
        where: { id: params.id },
        data: { status: "starting", lastAction: new Date() }
      });

      // Criar log
      await createLog(
        userId,
        "bot_restart",
        `Bot ${result.bot.name} (${result.bot.discloudAppId}) reiniciado`,
        session.user.name || "Usuário"
      );

      return NextResponse.json({ success: true, message: "Bot reiniciado com sucesso" });
    }

    return NextResponse.json({ error: "Erro ao reiniciar bot" }, { status: 500 });
  } catch (error) {
    console.error("Erro ao reiniciar bot:", error);
    return NextResponse.json({ error: "Erro ao reiniciar bot" }, { status: 500 });
  }
}

// Rotas dinâmicas
export { POST_START as POST };
export { POST_START as start };
export { POST_STOP as stop };
export { POST_RESTART as restart };
