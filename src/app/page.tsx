import { VoidBackgroundClient } from "@/components/void/VoidBackgroundClient";
import { SmoothScroll } from "@/components/void/SmoothScroll";
import { HomeHeader } from "@/components/home/HomeHeader";
import { Hero } from "@/components/home/Hero";
import { ClientsMarquee } from "@/components/home/ClientsMarquee";
import { StatsSection } from "@/components/home/StatsSection";
import { CatalogSection } from "@/components/home/CatalogSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ReasonsSection } from "@/components/home/ReasonsSection";
import { CustomBotCta } from "@/components/home/CustomBotCta";
import { FaqSection } from "@/components/home/FaqSection";
import { FinalCta } from "@/components/home/FinalCta";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <VoidBackgroundClient />
      <SmoothScroll />
      <HomeHeader />

      <main className="relative z-10">
        <Hero />
        <ClientsMarquee />
        <StatsSection />
        <CatalogSection />
        <HowItWorks />
        <ReasonsSection />
        <CustomBotCta />
        <FaqSection />
        <FinalCta />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </>
  );
}
