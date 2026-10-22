import { PageHeader } from "@/components/home/PageHeader";
import { CombosSection } from "@/components/home/CombosSection";
import { CatalogSection } from "@/components/home/CatalogSection";
import { pageMetadata } from "@/config/seo";
import { CustomBotCta } from "@/components/home/CustomBotCta";

export const metadata = pageMetadata("bots");

export default function BotsPage() {
  return (
    <>
      <PageHeader
        scene={2}
        eyebrow="Loja"
        title="Combos e bots"
        accent="para o seu servidor"
        lead="Escolha um dos 4 combos ou monte o seu com bots avulsos. O pagamento é feito via Pix pelo nosso Discord, com atendimento direto da equipe."
      />
      <CombosSection compare />
      <CatalogSection />
      <CustomBotCta scene={2} />
    </>
  );
}
