import Link from "next/link";
import { combos } from "@/config/combos";
import { ComboGrid } from "./ComboCard";
import { ComboTable } from "./ComboTable";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";

interface CombosSectionProps {
  /** Mostra a tabela de comparação logo abaixo dos cards (página de bots). Na home vira um link. */
  compare?: boolean;
  scene?: number;
}

/** Seção dos 4 combos (produtos principais da loja). Dados em src/config/combos.ts. */
export function CombosSection({ compare = false, scene = 2 }: CombosSectionProps) {
  return (
    <section id="combos" data-scene={scene} className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal>
              <p className="eyebrow-l">Combos</p>
            </Reveal>
            <KineticTitle as="h2" className="sec-title mt-3" accent="do seu servidor">
              Escolha o combo
            </KineticTitle>
            <Reveal delay={120}>
              <p className="sec-lead mt-4">Pacotes prontos para o seu tipo de servidor, com desconto em relação aos bots avulsos. O pagamento é feito via Pix pelo nosso Discord.</p>
            </Reveal>
          </div>
          {!compare && (
            <Reveal delay={160}>
              <Link href="/#comparar" className="hero-cta hero-cta--ghost">
                Comparar combos
              </Link>
            </Reveal>
          )}
        </div>

        <Reveal>
          <ComboGrid items={combos} />
        </Reveal>

        {compare && (
          <div id="comparar" className="mt-20 scroll-mt-28">
            <Reveal>
              <p className="eyebrow-l">Comparação</p>
              <h2 className="sec-title mt-3">O que cada combo inclui</h2>
            </Reveal>
            <Reveal delay={100} className="mt-8">
              <ComboTable />
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
