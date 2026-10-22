import { PageHeader } from "@/components/home/PageHeader";
import { ClientsWall } from "@/components/home/ClientsWall";
import { StatsSection } from "@/components/home/StatsSection";
import { pageMetadata } from "@/config/seo";
import { JoinCta } from "@/components/home/JoinCta";

export const metadata = pageMetadata("clientes");

export default function ClientesPage() {
  return (
    <>
      <PageHeader
        scene={1}
        eyebrow="Clientes"
        title="Servidores que"
        accent="confiam na VØID"
        lead="Comunidades que já rodam bots feitos pela gente, 24 horas por dia."
      />
      <ClientsWall />
      <StatsSection scene={1} />
      <JoinCta
        scene={1}
        title="Quer ver o seu servidor aqui?"
        text="Fale com a gente no Discord e monte o bot que a sua comunidade precisa."
        button="Falar no Discord"
      />
    </>
  );
}
