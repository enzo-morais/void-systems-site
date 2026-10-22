import { steps } from "@/config/home";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";

/** Como funciona: título à esquerda, texto de apoio à direita e os 3 passos em colunas largas. */
export function HowItWorks() {
  return (
    <section data-scene="3" className="pt-36 pb-12 sm:pb-20">
      <div className="wrap">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow-l">Como funciona</p>
            </Reveal>
            <KineticTitle as="h1" className="mt-3 text-4xl sm:text-6xl 2xl:text-7xl font-bold tracking-tight leading-[1.04] text-white" accent="em 3 passos">
              Do pedido ao bot rodando
            </KineticTitle>
          </div>
          <Reveal delay={150}>
            <p className="sec-lead">Sem complicação: você escolhe, a gente configura com você e o bot passa a trabalhar sozinho.</p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 160} className="h-full">
              <div className="panel h-full p-8">
                <span className="font-display text-5xl font-bold text-zinc-600">0{i + 1}</span>
                <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-silver leading-relaxed">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
