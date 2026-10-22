import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";

interface PageHeaderProps {
  scene: number;
  eyebrow: string;
  title: string;
  accent: string;
  lead: string;
  /** Ajuste opcional de altura/espaço do bloco. */
  className?: string;
}

/** Cabeçalho de cada página interna: título grande à esquerda, texto de apoio à direita em telas largas. */
export function PageHeader({ scene, eyebrow, title, accent, lead, className = "" }: PageHeaderProps) {
  return (
    <section data-scene={scene} className={`pt-36 pb-12 sm:pb-16 ${className}`}>
      <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow-l">{eyebrow}</p>
          </Reveal>
          <KineticTitle as="h1" className="mt-3 text-4xl sm:text-6xl 2xl:text-7xl font-bold tracking-tight leading-[1.04] text-white" accent={accent}>
            {title}
          </KineticTitle>
        </div>
        <Reveal delay={150}>
          <p className="sec-lead">{lead}</p>
        </Reveal>
      </div>
    </section>
  );
}
