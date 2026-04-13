import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/staff/bots — listar todos os bots (staff only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const bots = await prisma.discloudBot.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(bots);
}

// POST /api/staff/bots — atribuir bot a um cliente (pelo discordId do cliente)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { clientDiscordId, discloudAppId, name } = await request.json();

  if (!clientDiscordId || !discloudAppId || !name) {
    return NextResponse.json({ error: "Campos obrigatórios: clientDiscordId, discloudAppId, name" }, { status: 400 });
  }

  // Buscar o User pelo discordId
  const account = await prisma.account.findFirst({
    where: { providerAccountId: clientDiscordId, provider: "discord" },
    select: { userId: true }
  });

  if (!account) {
    return NextResponse.json({ error: "Cliente não encontrado. O cliente precisa ter feito login no site pelo menos uma vez." }, { status: 404 });
  }

  // Verificar se o bot já existe
  const existing = await prisma.discloudBot.findFirst({ where: { discloudAppId } });
  if (existing) return NextResponse.json({ error: "Este App ID já está cadastrado" }, { status: 400 });

  const bot = await prisma.discloudBot.create({
    data: { userId: account.userId, discloudAppId, name, status: "offline" }
  });

  return NextResponse.json({ bot }, { status: 201 });
}
