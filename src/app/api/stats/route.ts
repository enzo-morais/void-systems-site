import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [totalSales, salesSum, totalClients, totalTasks, pendingTasks] = await Promise.all([
    prisma.sale.count(),
    prisma.sale.aggregate({ _sum: { value: true } }),
    prisma.client.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: "pending" } }),
  ]);

  return NextResponse.json({
    totalSales,
    revenue: salesSum._sum.value || 0,
    totalClients,
    totalTasks,
    pendingTasks,
  });
}
