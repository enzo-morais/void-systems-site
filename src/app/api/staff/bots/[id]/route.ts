import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { RULES, enforce, sessionKey } from "@/lib/ratelimit";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  { const limited = await enforce(RULES.staffWrite, sessionKey(session)); if (limited) return limited; }

  const { id } = await params;
  await prisma.discloudBot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
