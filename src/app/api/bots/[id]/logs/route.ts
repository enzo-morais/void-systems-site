import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { userOwnsBot } from "@/lib/bot-auth";

const DISCLOUD_API_URL = "https://api.discloud.app/v2";
const DISCLOUD_API_KEY = process.env.DISCLOUD_API_KEY;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const bot = await prisma.discloudBot.findUnique({ where: { id } });
  if (!bot || !userOwnsBot(bot, session)) {
    return NextResponse.json({ error: "Bot não encontrado" }, { status: 404 });
  }

  try {
    const res = await fetch(`${DISCLOUD_API_URL}/app/${bot.discloudAppId}/logs`, {
      headers: { "api-token": DISCLOUD_API_KEY ?? "" }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || "Erro ao buscar logs" }, { status: res.status });
    }

    const data = await res.json();
    // A Discloud retorna { status: "ok", apps: { terminal: { big: "...", small: "..." } } }
    const terminal = data.apps?.terminal ?? data.terminal ?? {};
    const logs = terminal.big ?? terminal.small ?? "";

    return NextResponse.json({ logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
