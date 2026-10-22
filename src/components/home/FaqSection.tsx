"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/config/home";
import { KineticTitle } from "./KineticTitle";
import { Reveal } from "./Reveal";
import "./faq.css";

/** Perguntas frequentes em duas colunas largas. Com `heading`, mostra o título da seção (home); na página /faq o título vem do PageHeader. */
export function FaqSection({ scene = 4, heading = false }: { scene?: number; heading?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" data-scene={scene} className={heading ? "sec scroll-mt-20" : "pb-16 pt-4"}>
      <div className="wrap">
        {heading && (
          <div className="sec-head">
            <div>
              <Reveal>
                <p className="eyebrow-l">Dúvidas</p>
              </Reveal>
              <KineticTitle as="h2" className="sec-title mt-3" accent="frequentes">
                Perguntas
              </KineticTitle>
            </div>
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-2 lg:gap-x-6 items-start">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={(i % 2) * 70}>
                <div className={`faq-item ${isOpen ? "faq-item--open" : ""}`}>
                  <button
                    type="button"
                    id={`faq-btn-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-medium text-white">{item.q}</span>
                    <ChevronDown className="faq-chevron w-4 h-4 shrink-0 text-silver" />
                  </button>
                  <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} className="faq-panel">
                    <div className="faq-panel-inner">
                      <p className="px-5 pb-5 text-sm text-silver leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
