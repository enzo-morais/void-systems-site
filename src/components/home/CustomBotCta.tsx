import { DISCORD_LINK } from "@/config/home";
import { Reveal } from "./Reveal";

export function CustomBotCta() {
  return (
    <section className="px-6 py-16">
      <Reveal className="max-w-5xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-14 sm:px-14 text-center"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(124,138,255,0.16), rgba(10,10,10,0.8) 70%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-silver/75">Bot personalizado</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Precisa de algo que não existe no catálogo?</h2>
          <p className="mt-4 text-silver/75 max-w-xl mx-auto">
            Contamos o que o seu servidor precisa e montamos um bot sob medida. Peça um orçamento, sem compromisso.
          </p>
          <a
            href={DISCORD_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-medium text-black bg-white hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-shadow"
          >
            Pedir orçamento no Discord
          </a>
        </div>
      </Reveal>
    </section>
  );
}
