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
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/staff/bots — atribuir bot a um cliente pelo Discord ID
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  try {
    const { userId, discloudAppId, name } = await request.json();

    if (!userId || !discloudAppId || !name) {
      return NextResponse.json({ error: "Campos obrigatórios: userId, discloudAppId, name" }, { status: 400 });
    }

    // Verificar se o bot já existe
    const existing = await prisma.discloudBot.findFirst({ where: { discloudAppId } });
    if (existing) return NextResponse.json({ error: "Este App ID já está cadastrado" }, { status: 400 });

    // Salva direto com o Discord ID como userId — sem precisar de User no banco
    const bot = await prisma.discloudBot.create({
      data: { userId, discloudAppId, name, status: "offline" }
    });

    return NextResponse.json({ bot }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
