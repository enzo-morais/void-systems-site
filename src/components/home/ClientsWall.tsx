import { clients } from "@/config/home";
import { Reveal } from "./Reveal";
import "./clients-wall.css";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Row({ names, reverse }: { names: string[]; reverse?: boolean }) {
  return (
    <div className="cw-viewport">
      <div className={`cw-track ${reverse ? "cw-track--rev" : ""}`}>
        {[0, 1].map((copy) => (
          <ul key={copy} className="cw-list">
            {[0, 1, 2].flatMap((rep) =>
              names.map((name) => (
                <li key={`${rep}-${name}`} className="cw-card panel" aria-hidden={copy + rep > 0 || undefined}>
                  <span className="cw-avatar font-display">{initials(name)}</span>
                  <span>
                    <span className="cw-name font-display">{name}</span>
                    <span className="cw-tag font-mono">Cliente VØID</span>
                  </span>
                </li>
              ))
            )}
          </ul>
        ))}
      </div>
    </div>
  );
}

/** Faixas de clientes em carrossel infinito (1 ou 2, em sentidos opostos). Nomes em src/config/home.ts. */
export function ClientsRows({ rows = 2 }: { rows?: 1 | 2 }) {
  const second = [...clients.slice(2), ...clients.slice(0, 2)];
  return (
    <div className="space-y-4">
      <Row names={clients} />
      {rows === 2 && <Row names={second} reverse />}
    </div>
  );
}

/** Seção das páginas internas: duas faixas de clientes. */
export function ClientsWall() {
  return (
    <section data-scene="1" className="py-16">
      <Reveal>
        <ClientsRows />
      </Reveal>
    </section>
  );
}
