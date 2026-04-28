import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const { token, guildId } = await req.json();
    if (!token || !guildId) return NextResponse.json({ error: "Token and guildId required" }, { status: 400 });
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${token}` },
    });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const all = await res.json();
    const channels = all.filter((c: { type: number }) => c.type === 0 || c.type === 5);
    return NextResponse.json({ channels });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
