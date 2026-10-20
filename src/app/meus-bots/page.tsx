import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { DiscloudBots } from "@/components/dashboard/discloud-bots";
import { HomeHeader } from "@/components/home/HomeHeader";
import { Footer } from "@/components/home/Footer";
import "@/components/home/home.css";

// Área do cliente: sempre no layout do site e só com os bots da própria conta (GET /api/bots),
// mesmo para staff. A visão de todos os bots hospedados continua em /discloud, dentro do painel.
export default async function MeusBots() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/meus-bots");

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
