import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { VoidBackground } from "@/components/landing/void-background";
import { Header } from "@/components/landing/header";
import { PanelBuilderApp } from "@/components/panel-builder/PanelBuilderApp";

const PANEL_BUILDER_ROLE_ID = process.env.DISCORD_PANEL_BUILDER_ROLE_ID;

export default async function PanelBuilderPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Verificar cargo se configurado
  if (PANEL_BUILDER_ROLE_ID) {
    const roles = (session.user as any)?.roles as string[] | undefined;
    const isStaff = (session.user as any)?.isStaff;
    if (!isStaff && !roles?.includes(PANEL_BUILDER_ROLE_ID)) {
      redirect("/");
    }
  }

  return (
    <>
      <VoidBackground />
      <div className="relative z-10">
        <Header />
        <PanelBuilderApp />
      </div>
    </>
  );
}
