"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/config/home";
import { Reveal } from "./Reveal";
import "./faq.css";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="px-6 py-24">
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-silver/75">Dúvidas</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Perguntas frequentes</h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 70}>
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
                    <ChevronDown className="faq-chevron w-4 h-4 shrink-0 text-silver/75" />
                  </button>
                  <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} className="faq-panel">
                    <div className="faq-panel-inner">
                      <p className="px-5 pb-5 text-sm text-silver/75 leading-relaxed">{item.a}</p>
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
