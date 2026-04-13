import { DiscloudBots } from "@/components/dashboard/discloud-bots";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DiscloudDashboard() {
  const session = await getServerSession(authOptions);

  // Redirecionar se não estiver autenticado
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <DiscloudBots />
    </div>
  );
}
