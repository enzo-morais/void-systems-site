"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "Como funciona o pagamento?", a: "Aceitamos apenas Pix. O pagamento é mensal e você pode cancelar a qualquer momento pelo Discord." },
  { q: "Posso testar antes de comprar?", a: "Sim! O VØID Ticket é um bot de ticket gratuito e vitalício pra você testar a qualidade do nosso trabalho. Além dele, temos diversos outros bots pagos no nosso catálogo." },
  { q: "Quanto tempo leva pra configurar?", a: "A maioria dos bots fica pronto no mesmo dia. Configurações mais complexas podem levar 48 horas ou mais." },
  { q: "O bot fica hospedado onde?", a: "Todos os bots ficam hospedados em servidores dedicados com 99.9% de uptime. Você não precisa se preocupar com nada." },
  { q: "E se eu precisar de algo personalizado?", a: "Fazemos bots sob medida. Entre no Discord, abra um ticket e descreva o que precisa. Enviamos um orçamento sem compromisso." },
  { q: "Posso trocar de plano depois?", a: "Sim, você pode fazer upgrade ou downgrade a qualquer momento. A diferença é ajustada no próximo pagamento." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-6 py-32 max-w-3xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-sm text-silver/50 uppercase tracking-widest mb-3">Dúvidas</p>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Perguntas Frequentes</h2>
      </div>

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-xl overflow-hidden backdrop-blur-md transition-all duration-200"
            style={{
              background: open === i ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
              border: `1px solid rgba(255,255,255,${open === i ? 0.1 : 0.06})`,
            }}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
            >
              <span className="text-sm font-medium pr-4">{faq.q}</span>
              <ChevronDown
                className="w-4 h-4 text-silver/40 shrink-0 transition-transform duration-200"
                style={{ transform: open === i ? "rotate(180deg)" : "rotate(0)" }}
              />
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: open === i ? "200px" : "0", opacity: open === i ? 1 : 0 }}
            >
              <p className="px-5 pb-4 text-sm text-silver/50 leading-relaxed">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
