import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { RULES, enforce, sessionKey } from "@/lib/ratelimit";
import { parseBody } from "@/lib/validation";
import { applicationReview } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  { const limited = await enforce(RULES.staffWrite, sessionKey(session)); if (limited) return limited; }
  const { id } = await params;
  const parsed = await parseBody(req, applicationReview);
  if (!parsed.ok) return parsed.response;
  const { status } = parsed.data;

  const reviewedBy = session!.user?.username || session!.user?.name || "Staff";

  let app;
  try {
    app = await prisma.application.update({
      where: { id },
      data: { status, reviewedBy },
    });
  } catch {
    return NextResponse.json({ error: "Formulário não encontrado" }, { status: 404 });
  }

  await prisma.log.create({
    data: {
      action: status === "approved" ? "Formulário aprovado" : "Formulário reprovado",
      details: `${app.name} (${app.discord})`,
      staffName: reviewedBy,
    },
  });

  return NextResponse.json(app);
}
