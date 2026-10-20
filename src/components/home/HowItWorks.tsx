import { steps } from "@/config/home";
import { Reveal } from "./Reveal";

export function HowItWorks() {
  return (
    <section id="como-funciona" className="px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-silver/75">Como funciona</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Do pedido ao bot rodando, em 3 passos</h2>
        </Reveal>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* linha que liga os passos no desktop */}
          <div
            className="hidden md:block absolute top-6 left-[16%] right-[16%] h-px"
            style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)" }}
          />

          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 180} className="relative text-center">
              <div
                className="mx-auto w-12 h-12 rounded-full grid place-items-center text-sm font-semibold text-white bg-black"
                style={{ border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 0 30px rgba(124,138,255,0.25)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-silver/75 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
