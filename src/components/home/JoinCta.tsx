import "./hero.css";
import { DISCORD_STORE_URL } from "@/config/store";
import { Reveal } from "./Reveal";

interface JoinCtaProps {
  scene: number;
  title: string;
  text: string;
  button: string;
}

/** Faixa de chamada para o Discord, usada no fim das páginas internas: texto à esquerda, botão à direita. */
export function JoinCta({ scene, title, text, button }: JoinCtaProps) {
  return (
    <section data-scene={scene} className="sec-tight">
      <Reveal className="wrap">
        <div className="panel flex flex-col gap-8 px-6 py-10 sm:px-12 sm:py-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">{title}</h2>
            <p className="mt-3 text-silver max-w-xl">{text}</p>
          </div>
          <a href={DISCORD_STORE_URL} target="_blank" rel="noopener noreferrer" className="hero-cta hero-cta--primary shrink-0">
            {button}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
