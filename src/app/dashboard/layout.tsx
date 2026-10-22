import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: "Painel — VØID Systems",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!isStaffMember(session)) {
    redirect("/");
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
