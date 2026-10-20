import { clients } from "@/config/home";
import { Reveal } from "./Reveal";
import "./clients-marquee.css";

export function ClientsMarquee() {
  return (
    <section id="clientes" className="px-6 py-20">
      <Reveal>
        <p className="text-center text-xs uppercase tracking-[0.2em] text-silver/75">
          Servidores que confiam na VØID
        </p>
      </Reveal>

      <Reveal delay={150} className="mt-10">
        <div className="cm-viewport">
          <div className="cm-track">
            {/* cada lista repete os nomes para cobrir telas largas; só a primeira ocorrência é lida por leitores de tela */}
            {[0, 1].map((copy) => (
              <ul key={copy} className="cm-list">
                {[0, 1, 2].flatMap((rep) =>
                  clients.map((name) => (
                    <li key={`${rep}-${name}`} className="cm-item" aria-hidden={copy + rep > 0 || undefined}>
                      {name}
                    </li>
                  ))
                )}
              </ul>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
