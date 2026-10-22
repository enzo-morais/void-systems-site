import { Check } from "lucide-react";
import { brl } from "@/config/bots";
import { combos, type Combo } from "@/config/combos";
import { ComboMockup } from "./ComboMockups";
import { HireButton } from "./HireButton";
import { Reveal } from "./Reveal";
import "./spotlight.css";

/** Seção de destaque de um combo: texto de um lado e mockup de tablet do outro. `reverse` inverte os lados. */
export function ComboSpotlight({ combo, reverse = false }: { combo: Combo; reverse?: boolean }) {
  const sp = combo.spotlight;
  const mockSide = reverse ? "left" : "right";

  return (
    <section id={`combo-${combo.id}`} className="sp-section">
      <div className={`wrap sp-grid ${reverse ? "sp-grid--rev" : ""}`}>
        <div className="sp-text">
          <Reveal>
            <p className="sp-label">{sp.label}</p>
          </Reveal>
          <Reveal delay={80}>
            <h3 className="sp-title">
              <span>{sp.title[0]}</span>
              <span>{sp.title[1]}</span>
            </h3>
          </Reveal>
          <Reveal delay={140}>
            <p className="sec-lead sp-sub">{sp.subtitle}</p>
          </Reveal>

          <ul className="sp-list">
            {sp.items.map((item, i) => (
              <Reveal key={item.title} delay={200 + i * 90}>
                <li className="sp-item">
                  {sp.style === "steps" ? (
                    <span className="sp-num">{String(i + 1).padStart(2, "0")}</span>
                  ) : (
                    <span className="sp-check">
                      <Check aria-hidden="true" />
                    </span>
                  )}
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={420}>
            <ul className="sp-chips" aria-label="Recursos do combo">
              {sp.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
            <div className="sp-cta">
              <HireButton items={[{ name: `Combo ${combo.name}`, price: combo.price }]} label={`Contratar por ${brl(combo.price)}/mês`} className="hero-cta hero-cta--primary" />
            </div>
          </Reveal>
        </div>

        <Reveal delay={150} className="sp-mock">
          <ComboMockup comboId={combo.id} side={mockSide} result={sp.result} />
        </Reveal>
      </div>
    </section>
  );
}

/** Uma seção de destaque por combo, alternando os lados (texto à esquerda/mockup à direita, depois o contrário). */
export function ComboSpotlights() {
  return (
    <div id="recursos">
      {combos.map((combo, i) => (
        <ComboSpotlight key={combo.id} combo={combo} reverse={i % 2 === 1} />
      ))}
    </div>
  );
}
