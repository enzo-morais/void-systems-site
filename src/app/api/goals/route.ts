import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MONTHLY_GOAL = 5;

interface DiscordMember {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
}

async function fetchStaff(): Promise<DiscordMember[]> {
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
  const GUILD_ID = process.env.DISCORD_GUILD_ID!;
  const STAFF_ROLE_ID = process.env.DISCORD_STAFF_ROLE_ID!;
  const members: DiscordMember[] = [];
  let after = "";

  for (let i = 0; i < 10; i++) {
    const url = `https://discord.com/api/v10/guilds/${GUILD_ID}/members?limit=1000${after ? "&after=" + after : ""}`;
    const res = await fetch(url, { headers: { Authorization: "Bot " + BOT_TOKEN } });
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    for (const m of batch) {
      if (m.roles?.includes(STAFF_ROLE_ID)) {
        members.push({
          id: m.user.id,
          username: m.user.username,
          displayName: m.nick || m.user.global_name || m.user.username,
          avatar: m.user.avatar ? "https://cdn.discordapp.com/avatars/" + m.user.id + "/" + m.user.avatar + ".png?size=128" : null,
        });
      }
    }
    after = batch[batch.length - 1].user.id;
    if (batch.length < 1000) break;
  }
  return members;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const members = await fetchStaff();

  const sales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    },
    select: { staffName: true },
  });

  // Contar vendas por staffName
  const counts: Record<string, number> = {};
  for (const s of sales) {
    const name = s.staffName;
    if (name) counts[name] = (counts[name] || 0) + 1;
  }

  const team = members.map(function (member) {
    const c = counts[member.displayName] || 0;
    return {
      id: member.id,
      name: member.displayName,
      username: member.username,
      avatar: member.avatar,
      sales: c,
      goal: MONTHLY_GOAL,
      completed: c >= MONTHLY_GOAL,
      percentage: Math.min(Math.round((c / MONTHLY_GOAL) * 100), 100),
    };
  });

  team.sort(function (a, b) { return b.sales - a.sales; });

  return NextResponse.json({
    goal: MONTHLY_GOAL,
    month: now.toLocaleString("pt-BR", { month: "long", year: "numeric" }),
    team: team,
  });
}
