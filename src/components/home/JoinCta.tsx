import "./hero.css";
import { DISCORD_STORE_URL } from "@/config/store";
import { Reveal } from "./Reveal";

interface JoinCtaProps {
  scene: number;
  title: string;
  text: string;
  button: string;
}

/** Faixa de chamada para o Discord, usada no fim das páginas internas. */
export function JoinCta({ scene, title, text, button }: JoinCtaProps) {
  return (
    <section data-scene={scene} className="px-6 py-16">
      <Reveal className="max-w-4xl mx-auto">
        <div className="panel px-6 py-12 sm:px-12 text-center" style={{ borderColor: "rgba(143,125,255,0.35)" }}>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-3 text-silver/85 max-w-xl mx-auto">{text}</p>
          <a href={DISCORD_STORE_URL} target="_blank" rel="noopener noreferrer" className="hero-cta hero-cta--primary mt-7">
            {button}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
