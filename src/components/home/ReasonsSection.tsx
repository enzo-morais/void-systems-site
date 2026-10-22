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
    <section data-scene="4" className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal>
              <p className="eyebrow-l">Por que a VØID</p>
            </Reveal>
            <KineticTitle as="h2" className="sec-title mt-3" accent="o servidor funcionando">
              Feito para quem quer
            </KineticTitle>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {reasons.map((item, i) => {
            const Icon = icons[item.icon];
            return (
              <Reveal key={item.title} delay={i * 110} className="h-full">
                <div className="panel h-full p-7">
                  <div className="w-11 h-11 rounded-lg grid place-items-center text-white" style={{ background: "#111", border: "1px solid #27272a" }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-6 font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-silver leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
