import { Hero } from "@/components/home/Hero";
import { HomeClients } from "@/components/home/HomeClients";
import { FeaturedBots } from "@/components/home/FeaturedBots";
import { StatsSection } from "@/components/home/StatsSection";
import { HomeExplore } from "@/components/home/HomeExplore";
import { FinalCta } from "@/components/home/FinalCta";

// Cada seção ativa uma cena do fundo (data-scene): 0 hero, 1 clientes, 2 destaques,
// 3 números, 4 explore, 5 final. A ordem aqui é a ordem das cenas ao rolar.
export default function Home() {
  return (
    <>
      <Hero />
      <HomeClients />
      <FeaturedBots />
      <StatsSection scene={3} tall />
      <HomeExplore />
      <FinalCta />
    </>
  );
}
