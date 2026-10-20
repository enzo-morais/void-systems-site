import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { DiscloudBots } from "@/components/dashboard/discloud-bots";
import { DashboardShell } from "@/components/dashboard/shell";
import { HomeHeader } from "@/components/home/HomeHeader";
import { Footer } from "@/components/home/Footer";
import "@/components/home/home.css";

export default async function DiscloudDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // staff: dentro do painel staff; cliente: no layout do site
  if (isStaffMember(session)) {
    return (
      <DashboardShell user={session.user}>
        <DiscloudBots embedded />
      </DashboardShell>
    );
  }

  return (
    <div className="site-root pt">
      <HomeHeader />
      <main className="relative z-10 pt-24 pb-16 px-4">
        <DiscloudBots />
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
