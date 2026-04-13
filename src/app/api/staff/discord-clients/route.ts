import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";

const GUILD_ID = process.env.DISCORD_GUILD_ID!;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
const CLIENT_ROLE_ID = process.env.DISCORD_CLIENT_ROLE_ID!;

/**
 * GET /api/staff/discord-clients
 * Busca todos os membros do servidor com o cargo de cliente
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  if (!CLIENT_ROLE_ID) {
    return NextResponse.json({ error: "DISCORD_CLIENT_ROLE_ID não configurado" }, { status: 500 });
  }

  try {
    // Buscar membros com paginação (Discord retorna até 1000 por vez)
    let allMembers: any[] = [];
    let after = "0";
    
    while (true) {
      const res = await fetch(
        `https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000&after=${after}`,
        { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao buscar membros");
      }

      const members = await res.json();
      if (!members.length) break;

      allMembers = allMembers.concat(members);
      
      // Se retornou menos de 1000, chegou ao fim
      if (members.length < 1000) break;
      
      // Próxima página
      after = members[members.length - 1].user.id;
    }

    // Filtrar apenas quem tem o cargo de cliente
    const clients = allMembers
      .filter((m: any) => m.roles?.includes(CLIENT_ROLE_ID))
      .map((m: any) => ({
        id: m.user.id,
        username: m.user.username,
        displayName: m.nick || m.user.global_name || m.user.username,
        avatar: m.user.avatar
          ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/${parseInt(m.user.id) % 5}.png`,
      }));

    return NextResponse.json({ clients, total: clients.length });
  } catch (error: any) {
    console.error("Erro ao buscar clientes Discord:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
