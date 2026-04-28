import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const { token, channelId, components } = await req.json();
    if (!token || !channelId || !components) {
      return NextResponse.json({ error: "token, channelId and components are required" }, { status: 400 });
    }
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ components, flags: 32768 }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Discord API error: ${res.status} – ${JSON.stringify(err)}`);
    }
    const result = await res.json();
    return NextResponse.json({ success: true, messageId: result.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
