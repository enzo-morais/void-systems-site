import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Sem permissão" }, { status: 403 });

  const { id } = await params;
  await prisma.discloudBot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
