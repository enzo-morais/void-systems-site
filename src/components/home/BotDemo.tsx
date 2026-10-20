import { Hash, Play } from "lucide-react";
import type { BotItem, DemoStep } from "@/config/bots";
import "./bot-demo.css";

const STEP_SECONDS = 1.25;

function Cursor() {
  return (
    <svg className="bd-cursor" viewBox="0 0 24 24" fill="#fff" stroke="#000" strokeWidth="1.2" aria-hidden="true">
      <path d="M4 2l15 9-6.5 1.5L9 19z" />
    </svg>
  );
}

function Row({ step, i }: { step: DemoStep; i: number }) {
  const style = { ["--i" as string]: i };

  if (step.kind === "sys") {
    return (
      <div className="bd-row bd-row--sys" style={style}>
        <span>{step.text}</span>
      </div>
    );
  }

  if (step.kind === "user") {
    return (
      <div className="bd-row" style={style}>
        <span className="bd-av bd-av--user">{step.name[0]}</span>
        <span className="bd-col">
          <b className="bd-name">{step.name}</b>
          <span className="bd-text">{step.text}</span>
        </span>
      </div>
    );
  }

  if (step.kind === "click") {
    return (
      <div className="bd-row" style={style}>
        <span className="bd-av bd-av--user">{step.name[0]}</span>
        <span className="bd-col">
          <b className="bd-name">{step.name}</b>
          <span className="bd-clickwrap">
            <span className="bd-btn bd-btn--blurple bd-btn--press">{step.button}</span>
            <Cursor />
          </span>
        </span>
      </div>
    );
  }

  // bot / embed: aparece depois de "digitando..."
  return (
    <div className="bd-row" style={style}>
      <span className="bd-av bd-av--bot">V</span>
      <span className="bd-col">
        <b className="bd-name">
          VØID Bot <i className="bd-tag">Bot</i>
        </b>
        <span className="bd-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="bd-after">
          {step.kind === "bot" ? (
            <span className="bd-text">{step.text}</span>
          ) : (
            <span className="bd-embed" style={step.color ? { borderLeftColor: step.color } : undefined}>
              <b className="bd-embed-title">{step.title}</b>
              {step.text && <span className="bd-embed-text">{step.text}</span>}
              {step.fields && (
                <span className="bd-fields">
                  {step.fields.map(([k, v]) => (
                    <span key={k}>
                      <small>{k}</small>
                      <em>{v}</em>
                    </span>
                  ))}
                </span>
              )}
              {step.buttons && (
                <span className="bd-buttons">
                  {step.buttons.map((b, n) => (
                    <span key={b} className={`bd-btn ${n === 0 && step.buttons!.length > 1 ? "bd-btn--danger" : ""}`}>
                      {b}
                    </span>
                  ))}
                </span>
              )}
            </span>
          )}
        </span>
      </span>
    </div>
  );
}

/**
 * Janelinha de Discord que mostra o bot em ação. Parada com um convite ("Ver em ação");
 * a conversa roda ao passar o mouse no card (ou sempre, com `autoplay`).
 */
export function BotDemo({ bot, autoplay = false }: { bot: BotItem; autoplay?: boolean }) {
  const cycle = bot.demo.length * STEP_SECONDS + 3.5;
  return (
    <div className={`bd ${autoplay ? "bd--auto" : ""}`} style={{ ["--cycle" as string]: `${cycle}s`, ["--step" as string]: `${STEP_SECONDS}s` }} aria-hidden="true">
      <div className="bd-head">
        <Hash className="w-3.5 h-3.5" />
        {bot.channel}
      </div>
      <div className="bd-feed">
        {bot.demo.map((step, i) => (
          <Row key={i} step={step} i={i} />
        ))}
      </div>
      <div className="bd-idle">
        <span className="bd-play">
          <Play className="w-4 h-4" />
        </span>
        Ver em ação
      </div>
    </div>
  );
}
