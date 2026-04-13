import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/staff/bots — listar todos os bots (staff only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const bots = await prisma.discloudBot.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(bots);
  } catch (e: any) {
    console.error("Erro ao listar bots:", e);
    return NextResponse.json({ error: "Erro ao listar bots: " + e.message }, { status: 500 });
  }
}

// POST /api/staff/bots — atribuir bot a um cliente (pelo discordId do cliente)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { userId, discloudAppId, name } = await request.json();

  if (!userId || !discloudAppId || !name) {
    return NextResponse.json({ error: "Campos obrigatórios: userId, discloudAppId, name" }, { status: 400 });
  }

  // Verificar se o usuário existe
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  // Verificar se o bot já existe
  const existing = await prisma.discloudBot.findFirst({ where: { discloudAppId } });
  if (existing) return NextResponse.json({ error: "Este App ID já está cadastrado" }, { status: 400 });

  const bot = await prisma.discloudBot.create({
    data: { userId, discloudAppId, name, status: "offline" }
  });

  return NextResponse.json({ bot }, { status: 201 });
}
