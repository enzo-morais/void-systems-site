import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseBody } from "@/lib/validation";
import { publicApplication } from "@/lib/schemas";
import { RULES, checkRate, getClientIp, tooManyRequests } from "@/lib/ratelimit";

const WEBHOOK = process.env.DISCORD_LOGIN_WEBHOOK;

export async function POST(req: NextRequest) {
  const limit = await checkRate(RULES.applicationIp, getClientIp(req.headers));
  if (!limit.ok) return tooManyRequests(limit.retryAfterSec);

  const parsed = await parseBody(req, publicApplication);
  if (!parsed.ok) return NextResponse.json({ error: "Preencha todos os campos obrigatórios (respeitando os tamanhos máximos)" }, { status: 400 });
  const { name, age, discordId, discord, why, experience, hours, extra } = parsed.data;

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
          allowed_mentions: { parse: [] },
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
