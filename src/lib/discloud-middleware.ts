import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Middleware para proteger rotas de bots
 * Verifica: autenticação, autorização (só o dono do bot), rate limit
 */
export async function protectBotRoute(
  request: NextRequest,
  botId: string
): Promise<{
  success: boolean;
  message?: string;
  userId?: string;
  bot?: any;
}> {
  // 1. Verificar autenticação
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Não autenticado" };
  }

  const userId = session.user.id;

  // 2. Verificar se o usuário é o dono do bot (autorização)
  const bot = await prisma.discloudBot.findUnique({
    where: { id: botId },
    select: { userId: true, discloudAppId: true, name: true }
  });

  if (!bot) {
    return { success: false, message: "Bot não encontrado" };
  }

  if (bot.userId !== userId) {
    return { success: false, message: "Acesso negado" };
  }

  // 3. Rate limiting (5 ações por minuto por bot)
  const now = new Date();
  const windowMs = 60000; // 1 minuto
  const windowStart = new Date(now.getTime() - windowMs);

  const recentActions = await prisma.log.count({
    where: {
      userId: userId,
      action: {
        in: ["bot_start", "bot_stop", "bot_restart"]
      },
      createdAt: { gte: windowStart }
    }
  });

  if (recentActions >= 5) {
    return { success: false, message: "Limite de ações excedido. Tente novamente em 1 minuto." };
  }

  return { success: true, userId, bot };
}

/**
 * Middleware para proteger todas as rotas de bots
 */
export async function protectAllBotRoutes(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Verificar se o usuário está autorizado (apenas ID específico)
  const authorizedUserId = process.env.AUTHORIZED_USER_ID;
  if (authorizedUserId && (session?.user as { id?: string })?.id !== authorizedUserId) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  return null; // Continua
}

/**
 * Sanitizar entrada para evitar injection
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Criar log de ação
 */
export async function createLog(
  userId: string,
  action: string,
  details: string,
  staffName: string
) {
  await prisma.log.create({
    data: {
      userId,
      action,
      details,
      staffName
    }
  });
}
