import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";

interface PageHeaderProps {
  scene: number;
  eyebrow: string;
  title: string;
  accent: string;
  lead: string;
  /** Altura mínima do bloco; deixa espaço para a forma do fundo aparecer. */
  className?: string;
}

/** Cabeçalho de cada página interna. */
export function PageHeader({ scene, eyebrow, title, accent, lead, className = "min-h-[62vh]" }: PageHeaderProps) {
  return (
    <section data-scene={scene} className={`flex items-center justify-center px-6 pt-24 pb-10 ${className}`}>
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver/80">{eyebrow}</p>
        </Reveal>
        <KineticTitle as="h1" className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.06] text-white" accent={accent}>
          {title}
        </KineticTitle>
        <Reveal delay={150}>
          <p className="mt-5 text-base sm:text-lg text-silver/85 max-w-xl mx-auto">{lead}</p>
        </Reveal>
      </div>
    </section>
  );
}
