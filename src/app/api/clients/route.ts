import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { RULES, enforce, sessionKey } from "@/lib/ratelimit";
import { parseBody } from "@/lib/validation";
import { clientCreate } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(clients);
  } catch (e: any) {
    console.error("[/api/clients GET]", e?.message, e?.code);
    return NextResponse.json({ error: e?.message ?? "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  { const limited = await enforce(RULES.staffWrite, sessionKey(session)); if (limited) return limited; }

  const parsed = await parseBody(req, clientCreate);
  if (!parsed.ok) return parsed.response;
  const { name, discordId, email, notes } = parsed.data;

  const client = await prisma.client.create({
    data: { name, discordId: discordId || null, email: email || null, notes: notes || null },
  });
  return NextResponse.json(client, { status: 201 });
}
