import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";

/**
 * GET /api/staff/bot-info?clientId=xxx
 * Busca nome e avatar de um bot Discord pelo Client ID
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const clientId = request.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId obrigatório" }, { status: 400 });

  try {
    // Buscar informações do bot pelo Client ID via Discord API
    const res = await fetch(`https://discord.com/api/v10/applications/${clientId}/rpc`, {
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Bot não encontrado. Verifique o Client ID." }, { status: 404 });
    }

    const data = await res.json();

    const avatar = data.icon
      ? `https://cdn.discordapp.com/app-icons/${clientId}/${data.icon}.png`
      : null;

    return NextResponse.json({
      name: data.name,
      avatar,
      description: data.description,
      id: data.id,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
