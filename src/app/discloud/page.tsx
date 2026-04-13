import { DiscloudBots } from "@/components/dashboard/discloud-bots";
import { VoidBackground } from "@/components/landing/void-background";
import { Header } from "@/components/landing/header";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DiscloudDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <VoidBackground />
      <Header />
      <main className="relative z-10">
        <DiscloudBots />
      </main>
    </>
  );
}
