import { KineticTitle } from "./KineticTitle";
import { ClientsRows } from "./ClientsWall";
import { Reveal } from "./Reveal";

/** Faixa de clientes da home: título à esquerda e uma faixa em carrossel infinito de ponta a ponta. */
export function HomeClients() {
  return (
    <section id="clientes" data-scene="1" className="sec-tight scroll-mt-20">
      <div className="wrap mb-10">
        <Reveal>
          <p className="eyebrow-l">Clientes</p>
        </Reveal>
        <KineticTitle as="h2" className="sec-title mt-3" accent="confiam na VØID">
          Servidores que
        </KineticTitle>
      </div>

      <Reveal>
        <ClientsRows rows={1} />
      </Reveal>
    </section>
  );
}
