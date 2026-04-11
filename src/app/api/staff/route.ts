import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  const GUILD_ID = process.env.DISCORD_GUILD_ID;
  const STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID;

  if (!BOT_TOKEN || !GUILD_ID || !STAFF_ROLE_ID) {
    return NextResponse.json({ error: "Configuração Discord incompleta", debug: { hasBotToken: !!BOT_TOKEN, hasGuildId: !!GUILD_ID, hasRoleId: !!STAFF_ROLE_ID } }, { status: 500 });
  }

  try {
    const members = [];
    let after = "";

    for (let i = 0; i < 10; i++) {
      const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000${after ? `&after=${after}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      });

      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json({ error: `Discord API: ${res.status}`, details: text }, { status: 502 });
      }

      const batch = await res.json();
      if (!Array.isArray(batch) || batch.length === 0) break;

      for (const m of batch) {
        if (m.roles?.includes(STAFF_ROLE_ID)) {
          const user = m.user;
          members.push({
            id: user.id,
            username: user.username,
            displayName: m.nick || user.global_name || user.username,
            avatar: user.avatar
              ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
              : null,
          });
        }
      }

      after = batch[batch.length - 1].user.id;
      if (batch.length < 1000) break;
    }

    return NextResponse.json(members);
  } catch (err) {
    return NextResponse.json({ error: "Erro interno", details: String(err) }, { status: 500 });
  }
}
