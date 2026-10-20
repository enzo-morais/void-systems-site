import { KineticTitle } from "./KineticTitle";
import { ClientsRows } from "./ClientsWall";
import { Reveal } from "./Reveal";

/** Faixa de clientes da home (cena do toro): título e uma faixa em carrossel infinito. */
export function HomeClients() {
  return (
    <section data-scene="1" className="min-h-[75vh] flex flex-col justify-center gap-14 py-20">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver/80">Clientes</p>
        </Reveal>
        <KineticTitle className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-white" accent="confiam na VØID">
          Servidores que
        </KineticTitle>
      </div>

      <Reveal>
        <ClientsRows rows={1} />
      </Reveal>
    </section>
  );
}
