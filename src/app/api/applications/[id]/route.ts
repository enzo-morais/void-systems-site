import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const reviewedBy = session!.user?.username || session!.user?.name || "Staff";

  const app = await prisma.application.update({
    where: { id },
    data: { status, reviewedBy },
  });

  await prisma.log.create({
    data: {
      action: status === "approved" ? "Formulário aprovado" : "Formulário reprovado",
      details: `${app.name} (${app.discord})`,
      staffName: reviewedBy,
    },
  });

  return NextResponse.json(app);
}
