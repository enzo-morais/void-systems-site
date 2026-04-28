import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { VoidBackground } from "@/components/landing/void-background";
import { Header } from "@/components/landing/header";
import { PanelBuilderClient } from "@/components/panel-builder/PanelBuilderClient";

const PANEL_BUILDER_ROLE_ID = process.env.DISCORD_PANEL_BUILDER_ROLE_ID;

export default async function PanelBuilderPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Qualquer usuário logado pode acessar o panel builder

  return (
    <>
      <VoidBackground />
      <div className="relative z-10">
        <Header />
        <PanelBuilderClient />
      </div>
    </>
  );
}
