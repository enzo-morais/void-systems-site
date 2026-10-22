import { Hero } from "@/components/home/Hero";
import { CombosSection } from "@/components/home/CombosSection";
import { ComboSpotlights } from "@/components/home/ComboSpotlight";
import { ComparisonSection, Differentials, Marquee, PlansSection, Testimonials } from "@/components/home/HomeSections";
import { HomeClients } from "@/components/home/HomeClients";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCta } from "@/components/home/FinalCta";
import { pageMetadata } from "@/config/seo";

export const metadata = pageMetadata("home");

// Ordem da home: hero, faixa de diferenciais, combos, uma seção de destaque por combo, diferenciais,
// comparação, planos, clientes, depoimentos (ocultos sem depoimentos reais), FAQ e CTA final.
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <CombosSection />
      <ComboSpotlights />
      <Differentials />
      <ComparisonSection />
      <PlansSection />
      <HomeClients />
      <Testimonials />
      <FaqSection heading />
      <FinalCta />
    </>
  );
}
