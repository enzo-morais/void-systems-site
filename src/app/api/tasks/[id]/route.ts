import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { RULES, enforce, sessionKey } from "@/lib/ratelimit";
import { parseBody } from "@/lib/validation";
import { taskPatch } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  { const limited = await enforce(RULES.staffWrite, sessionKey(session)); if (limited) return limited; }
  const { id } = await params;
  const parsed = await parseBody(req, taskPatch);
  if (!parsed.ok) return parsed.response;
  try {
    const task = await prisma.task.update({ where: { id }, data: parsed.data });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  { const limited = await enforce(RULES.staffWrite, sessionKey(session)); if (limited) return limited; }
  const { id } = await params;
  try {
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }
}
