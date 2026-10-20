"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/config/home";
import { Reveal } from "./Reveal";
import "./faq.css";

export function FaqSection({ scene = 4 }: { scene?: number }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" data-scene={scene} className="px-6 pb-16 pt-4">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-3">
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
