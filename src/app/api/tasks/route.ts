import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { title, description, priority, assignedTo } = await req.json();
  if (!title) return NextResponse.json({ error: "Título obrigatório" }, { status: 400 });

  const task = await prisma.task.create({
    data: { title, description: description || null, priority: priority || "medium", assignedTo: assignedTo || null },
  });
  return NextResponse.json(task, { status: 201 });
}
