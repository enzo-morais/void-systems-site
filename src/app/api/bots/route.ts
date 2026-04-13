import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";
import { protectAllBotRoutes, sanitizeInput } from "@/lib/discloud-middleware";

const prisma = new PrismaClient();

/**
 * GET /api/bots - Listar todos os bots do usuário
 */
export async function GET(request: NextRequest) {
  // Proteção de rotas
  const authError = await protectAllBotRoutes(request);
  if (authError) return authError;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    // Buscar bots do usuário
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

/**
 * POST /api/bots - Adicionar novo bot
 */
export async function POST(request: NextRequest) {
  // Proteção de rotas
  const authError = await protectAllBotRoutes(request);
  if (authError) return authError;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { discloudAppId, name } = body;

    // Sanitizar entradas
    const sanitizedAppId = sanitizeInput(discloudAppId);
    const sanitizedName = sanitizeInput(name);

    // Validar dados
    if (!sanitizedAppId || !sanitizedName) {
      return NextResponse.json({ error: "App ID e nome são obrigatórios" }, { status: 400 });
    }

    // Verificar se o bot já existe
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

    // Criar bot no banco
    const bot = await prisma.discloudBot.create({
      data: {
        userId,
        discloudAppId: sanitizedAppId,
        name: sanitizedName,
        status: "offline"
      }
    });

    return NextResponse.json({ bot }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar bot:", error);
    return NextResponse.json({ error: "Erro ao adicionar bot" }, { status: 500 });
  }
}
