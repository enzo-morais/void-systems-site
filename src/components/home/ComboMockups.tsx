import { Check, Store, Trophy } from "lucide-react";
import "./tablet.css";

/** Moldura de tablet em CSS puro: borda escura arredondada, leve inclinação, reflexo e câmera. `side` é o lado da página onde ele fica. */
export function Tablet({ side, result, children }: { side: "left" | "right"; result: string; children: React.ReactNode }) {
  return (
    <div className={`tb tb--${side}`}>
      <div className="tb-tilt">
        <div className="tb-frame">
          <span className="tb-cam" aria-hidden="true" />
          <div className="tb-screen">{children}</div>
        </div>
      </div>
      <p className="tb-result">
        <Check aria-hidden="true" /> {result}
      </p>
    </div>
  );
}

/* As interfaces abaixo são desenhos em HTML/CSS, não são capturas de tela: texto e números são só de exemplo. */

function Simples() {
  const modules = ["Tickets de atendimento", "Boas-vindas", "Cargos automáticos", "Moderação", "Utilidades"];
  return (
    <>
      <div className="mk-bar">
        <span className="mk-mono">/config</span>
        <span className="mk-dim">VØID Simples</span>
      </div>
      <ul className="mk-modules">
        {modules.map((m) => (
          <li key={m}>
            <span>{m}</span>
            <span className="mk-switch mk-switch--on" />
          </li>
        ))}
      </ul>
      <button type="button" tabIndex={-1} className="mk-btn">
        Salvar alterações
      </button>
      <div className="mk-toast">
        <Check aria-hidden="true" /> Ticket aberto
      </div>
    </>
  );
}

function Community() {
  const rows = [
    { name: "Marina", lv: 18, xp: 82 },
    { name: "Davi", lv: 16, xp: 64 },
    { name: "Rafa", lv: 14, xp: 47 },
    { name: "Bruno", lv: 12, xp: 31 },
  ];
  return (
    <>
      <div className="mk-card">
        <p className="mk-title">Ranking de níveis</p>
        <div className="mk-rank">
          {rows.map((r) => (
            <div key={r.name} className="mk-rank-row">
              <span className="mk-av">{r.name[0]}</span>
              <div>
                <p className="mk-rank-name">
                  {r.name} <small>{r.xp * 12} XP</small>
                </p>
                <div className="mk-bar-track">
                  <div className="mk-bar-fill" style={{ width: `${r.xp}%` }} />
                </div>
              </div>
              <span className="mk-lv">Nv {r.lv}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mk-card">
        <div className="mk-purchase">
          <span className="mk-purchase-ico">
            <Store aria-hidden="true" />
          </span>
          <div>
            <p>Nova compra na loja</p>
            <small>VIP 30 dias · R$ 9,90 · Marina</small>
          </div>
          <span className="mk-green-dot" aria-hidden="true" />
        </div>
      </div>
    </>
  );
}

function DayZ() {
  // 30 barras de uptime: uma fora do ar, o resto no ar
  const bars = Array.from({ length: 30 }, (_, i) => i === 17);
  return (
    <>
      <div className="mk-bar">
        <span className="mk-mono">Status do servidor</span>
        <span className="mk-live">
          <i /> AO VIVO
        </span>
      </div>
      <div className="mk-stats">
        <div className="mk-stat">
          <small>Jogadores</small>
          <b>42/60</b>
        </div>
        <div className="mk-stat">
          <small>Ping</small>
          <b>38 ms</b>
        </div>
        <div className="mk-stat">
          <small>Mapa</small>
          <b>Chernarus</b>
        </div>
      </div>
      <div className="mk-servers">
        <div className="mk-server">
          <span className="mk-green-dot" />
          <span>DayZ #1</span>
          <span>42/60</span>
        </div>
        <div className="mk-server">
          <span className="mk-green-dot" />
          <span>DayZ #2</span>
          <span>31/60</span>
        </div>
      </div>
      <div className="mk-uptime">
        <p className="mk-title">Uptime · 30 dias (exemplo)</p>
        <div className="mk-uptime-bars" aria-hidden="true">
          {bars.map((off, i) => (
            <i key={i} className={off ? "off" : ""} />
          ))}
        </div>
      </div>
    </>
  );
}

function ServerGames() {
  const matches = [
    { label: "Semifinal 1", a: ["Alpha", 2, true], b: ["Bravo", 1, false] },
    { label: "Semifinal 2", a: ["Delta", 3, true], b: ["Echo", 2, false] },
    { label: "3º lugar", a: ["Bravo", 1, false], b: ["Echo", 2, true] },
    { label: "Final", a: ["Alpha", 3, true], b: ["Delta", 1, false] },
  ] as const;
  return (
    <>
      <div className="mk-bar">
        <span className="mk-mono">Torneio · Copa VØID</span>
        <span className="mk-dim">4 partidas</span>
      </div>
      <div className="mk-bracket">
        {matches.map((m) => (
          <div key={m.label} className="mk-match">
            <small>{m.label}</small>
            {[m.a, m.b].map(([team, score, win]) => (
              <div key={team as string} className={`mk-team ${win ? "mk-team--win" : ""}`}>
                <span>{team}</span>
                <b>{score}</b>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mk-champion">
        <Trophy aria-hidden="true" />
        <div>
          <small>Campeão</small>
          <b>Alpha</b>
        </div>
      </div>
    </>
  );
}

const screens: Record<string, () => React.ReactElement> = {
  simples: Simples,
  community: Community,
  dayz: DayZ,
  "server-games": ServerGames,
};

/** Interface simulada do combo dentro do tablet. Combos novos sem interface própria ficam só com o texto. */
export function ComboMockup({ comboId, side, result }: { comboId: string; side: "left" | "right"; result: string }) {
  const Screen = screens[comboId];
  if (!Screen) return null;
  return (
    <Tablet side={side} result={result}>
      <Screen />
    </Tablet>
  );
}
