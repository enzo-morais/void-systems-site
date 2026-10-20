import { Headset, Languages, Server, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { reasons } from "@/config/home";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";

const icons: Record<(typeof reasons)[number]["icon"], LucideIcon> = {
  support: Headset,
  server: Server,
  language: Languages,
  setup: SlidersHorizontal,
};

export function ReasonsSection() {
  return (
    <section data-scene="4" className="px-6 py-28 min-h-[110vh] flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <Reveal className="text-center max-w-2xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver/75">Por que a VØID</p>
          <KineticTitle className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white" accent="o servidor funcionando">
            Feito para quem quer
          </KineticTitle>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((item, i) => {
            const Icon = icons[item.icon];
            return (
              <Reveal key={item.title} delay={i * 110} className="h-full">
                <div className="panel h-full p-6">
                  <div
                    className="w-10 h-10 rounded-lg grid place-items-center text-white"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-5 font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-silver/75 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
