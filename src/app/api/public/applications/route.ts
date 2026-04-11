import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const WEBHOOK = process.env.DISCORD_LOGIN_WEBHOOK;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(ip, 2, 300000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde 5 minutos." }, { status: 429 });
  }
  const { name, age, discordId, discord, why, experience, hours, extra } = await req.json();

  if (!name || !age || !discordId || !discord || !why || !experience || !hours) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios" }, { status: 400 });
  }

  const existing = await prisma.application.findFirst({
    where: { discordId, status: "pending" },
  });
  if (existing) {
    return NextResponse.json({ error: "Você já tem um formulário pendente de análise" }, { status: 409 });
  }

  const app = await prisma.application.create({
    data: { name, age, discordId, discord, why, experience, hours, extra: extra || null },
  });

  // Webhook - novo formulário pendente
  if (WEBHOOK) {
    const pendingCount = await prisma.application.count({ where: { status: "pending" } });
    try {
      await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            title: "Novo formulário de candidatura",
            color: 0xfbbf24,
            fields: [
              { name: "Nome", value: name, inline: true },
              { name: "Discord", value: discord, inline: true },
              { name: "Discord ID", value: discordId, inline: true },
              { name: "Idade", value: age, inline: true },
              { name: "Horas/dia", value: hours, inline: true },
              { name: "Pendentes", value: String(pendingCount), inline: true },
              { name: "Por que quer entrar?", value: why.slice(0, 1024), inline: false },
              { name: "Experiência", value: experience.slice(0, 1024), inline: false },
              ...(extra ? [{ name: "Observações", value: extra.slice(0, 1024), inline: false }] : []),
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "VOID Systems — Formulários" },
          }],
        }),
      });
    } catch { /* silent */ }
  }

  return NextResponse.json(app, { status: 201 });
}
