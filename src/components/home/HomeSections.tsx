import Link from "next/link";
import { Check } from "lucide-react";
import { brl } from "@/config/bots";
import { combos, discountPercent } from "@/config/combos";
import { differentials, marqueeItems, testimonials } from "@/config/home";
import { ComboTable } from "./ComboTable";
import { HireButton } from "./HireButton";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";
import "./spotlight.css";

/** Faixa de diferenciais em rolagem contínua, bem sutil e em cinza. */
export function Marquee() {
  return (
    <div className="mq" aria-hidden="true">
      <div className="mq-track">
        {[0, 1].map((copy) => (
          <ul key={copy} className="mq-list">
            {[0, 1].flatMap((rep) => marqueeItems.map((t) => <li key={`${rep}-${t}`}>{t}</li>))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/** Grade de 6 diferenciais numerados (01 a 06). Textos em src/config/home.ts. */
export function Differentials() {
  return (
    <section id="diferenciais" className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal>
              <p className="eyebrow-l">Diferenciais</p>
            </Reveal>
            <KineticTitle as="h2" className="sec-title mt-3" accent="do jeito certo">
              Bot de Discord,
            </KineticTitle>
          </div>
          <Reveal delay={120}>
            <p className="sec-lead">Pouca coisa para configurar, nada para esconder e uma equipe de verdade do outro lado.</p>
          </Reveal>
        </div>

        <div className="df-grid">
          {differentials.map((d, i) => (
            <Reveal key={d.title} delay={(i % 3) * 100} className="h-full">
              <div className="panel df-card">
                <span className="df-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Tabela de comparação dos 4 combos. */
export function ComparisonSection() {
  return (
    <section id="comparar" className="sec scroll-mt-20">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal>
              <p className="eyebrow-l">Comparação</p>
            </Reveal>
            <KineticTitle as="h2" className="sec-title mt-3" accent="cada combo inclui">
              O que
            </KineticTitle>
          </div>
        </div>
        <Reveal>
          <ComboTable />
        </Reveal>
      </div>
    </section>
  );
}

/** Planos: os 4 combos lado a lado, versão compacta com o fluxo de contratação pelo Discord. */
export function PlansSection() {
  return (
    <section id="planos" className="sec scroll-mt-20">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal>
              <p className="eyebrow-l">Planos</p>
            </Reveal>
            <KineticTitle as="h2" className="sec-title mt-3" accent="que cabe no servidor">
              Um preço
            </KineticTitle>
            <Reveal delay={120}>
              <ul className="pl-notes">
                {["Pix pelo Discord", "Liberação rápida", "Cancele quando quiser"].map((n) => (
                  <li key={n}>
                    <Check aria-hidden="true" /> {n}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <Link href="/bots" className="hero-cta hero-cta--ghost">
              Ver bots avulsos
            </Link>
          </Reveal>
        </div>

        <div className="pl-grid">
          {combos.map((c, i) => {
            const off = discountPercent(c);
            return (
              <Reveal key={c.id} delay={i * 90} className="h-full">
                <div className={`panel pl-card ${c.featured ? "pl-card--featured" : ""}`}>
                  <h3>Combo {c.name}</h3>
                  <p className="pl-old">{brl(c.oldPrice)}</p>
                  <p className="pl-new">
                    {brl(c.price)} <small>/mês</small>
                  </p>
                  {off > 0 && <span className="pl-off">-{off}%</span>}
                  <HireButton items={[{ name: `Combo ${c.name}`, price: c.price }]} label="Contratar" className="cb-btn" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Depoimentos reais. Sem depoimentos em src/config/home.ts, a seção inteira fica oculta. */
export function Testimonials() {
  if (testimonials.length === 0) return null;
  return (
    <section id="depoimentos" className="sec">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <Reveal>
              <p className="eyebrow-l">Depoimentos</p>
            </Reveal>
            <h2 className="sec-title mt-3">Quem usa, recomenda</h2>
          </div>
        </div>
        <div className="ts-grid">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100} className="h-full">
              <figure className="panel ts-card">
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <b>{t.name}</b>
                  {t.role}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
