import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { RULES, enforce, sessionKey } from "@/lib/ratelimit";
import { parseBody } from "@/lib/validation";
import { saleCreate } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const sales = await prisma.sale.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  { const limited = await enforce(RULES.staffWrite, sessionKey(session)); if (limited) return limited; }

  const parsed = await parseBody(req, saleCreate);
  if (!parsed.ok) return parsed.response;
  const { client, product, value, notes, staffName, receipt } = parsed.data;

  const sale = await prisma.sale.create({
    data: { client, product, value: Number(value), notes: notes || null, staffName, receipt: receipt || null },
  });

  const logStaff = session!.user?.username || session!.user?.name || "Staff";
  await prisma.log.create({
    data: { action: "Venda registrada", details: `${product} para ${client} — R$${Number(value).toFixed(2)} (vendedor: ${staffName})`, staffName: logStaff },
  });

  // Webhook de venda
  const WEBHOOK = process.env.DISCORD_LOGIN_WEBHOOK;
  if (WEBHOOK) {
    try {
      await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allowed_mentions: { parse: [] },
          embeds: [{
            title: "Nova venda registrada",
            color: 0x22c55e,
            fields: [
              { name: "Cliente", value: client, inline: true },
              { name: "Produto", value: product, inline: true },
              { name: "Valor", value: `R$${Number(value).toFixed(2)}`, inline: true },
              { name: "Vendedor", value: staffName, inline: true },
              { name: "Registrado por", value: logStaff, inline: true },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "VOID Systems — Vendas" },
          }],
        }),
      });
    } catch { /* silent */ }
  }

  return NextResponse.json(sale, { status: 201 });
}
