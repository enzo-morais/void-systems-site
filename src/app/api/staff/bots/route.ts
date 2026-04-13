import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

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
    const { userId, discloudAppId, name, botClientId } = await request.json();

    if (!userId || !discloudAppId) {
      return NextResponse.json({ error: "userId e discloudAppId são obrigatórios" }, { status: 400 });
    }

    // Verificar se o bot já existe
    const existing = await prisma.discloudBot.findFirst({ where: { discloudAppId } });
    if (existing) return NextResponse.json({ error: "Este App ID já está cadastrado" }, { status: 400 });

    // Se tiver botClientId, buscar nome e avatar automaticamente
    let botName = name || discloudAppId;
    let botAvatar: string | null = null;

    if (botClientId) {
      try {
        const res = await fetch(`https://discord.com/api/v10/applications/${botClientId}/rpc`);
        if (res.ok) {
          const data = await res.json();
          botName = data.name || botName;
          botAvatar = data.icon
            ? `https://cdn.discordapp.com/app-icons/${botClientId}/${data.icon}.png`
            : null;
        }
      } catch { /* usa o nome fornecido */ }
    }

    const bot = await prisma.discloudBot.create({
      data: { userId, discloudAppId, name: botName, botClientId: botClientId || null, botAvatar, status: "offline" }
    });

    return NextResponse.json({ bot }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
