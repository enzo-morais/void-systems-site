import { steps } from "@/config/home";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";

/** Cena dos anéis: título no topo, passos embaixo, e o centro livre para a forma do fundo. */
export function HowItWorks() {
  return (
    <section data-scene="3" className="px-6 pt-28 pb-20 min-h-[118vh] flex flex-col justify-between gap-16">
      <div className="max-w-3xl mx-auto text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver/80">Como funciona</p>
        </Reveal>
        <KineticTitle as="h1" className="mt-3 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.06] text-white" accent="em 3 passos">
          Do pedido ao bot rodando
        </KineticTitle>
        <Reveal delay={150}>
          <p className="mt-5 text-base sm:text-lg text-silver/85 max-w-xl mx-auto">
            Sem complicação: você escolhe, a gente configura com você e o bot passa a trabalhar sozinho.
          </p>
        </Reveal>
      </div>

      <div className="max-w-6xl mx-auto w-full grid gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 160} className="h-full">
            <div className="panel h-full p-7">
              <span className="font-display text-5xl font-bold" style={{ color: "var(--void-accent)" }}>
                0{i + 1}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-silver/85 leading-relaxed">{step.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
