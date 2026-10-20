// Motor do fundo animado da home (canvas 2D). Portado do protótipo "VØID Reel".
// Cada seção da página marcada com data-scene="0".."5" é uma cena; o scroll é a timeline.

import { TRANSITION_SECONDS, type ResolvedRoute, type TransitionKind } from "@/config/void-scenes";

type Vec4 = [number, number, number, number];

export interface VoidEngineEls {
  canvas: HTMLCanvasElement;
  cut: HTMLElement;
  grain: HTMLElement;
}

interface Particle {
  r: number;
  a: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
  tw: number;
}

interface SceneGroup {
  top: number;
  h: number;
}

const TAU = Math.PI * 2;
const SCENES = 7; // 0..5 + 6 = calm (só estrelas)
const BG = "#0a0a0d";
const RING_WORDS = "TICKET · REGISTRO · VERIFICAÇÃO · BOAS-VINDAS · ANÚNCIO · BATE-PONTO · ";
const RING_SMALL = "AUTOMAÇÃO · DISCORD · 24H · SUPORTE · HOSPEDADO · ";

/** Repete o texto até preencher o anel (ex.: nome do bot). */
function buildRingWords(text: string) {
  const unit = `${text.toUpperCase()} · `;
  let out = "";
  while (out.length < 56) out += unit;
  return out;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Converte qualquer cor CSS (hex, rgb, hsl) em [r,g,b]. */
function parseColor(value: string): [number, number, number] {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const x = c.getContext("2d");
  if (!x) return [143, 125, 255];
  x.fillStyle = "#8f7dff";
  x.fillStyle = value;
  x.fillRect(0, 0, 1, 1);
  const d = x.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

export interface VoidEngine {
  stop: () => void;
  /** Informe a rota atual: define a cena e anima a transição (ver src/config/void-scenes.ts). */
  setRoute: (route: ResolvedRoute) => void;
}

export function startVoidEngine(els: VoidEngineEls): VoidEngine {
  const { canvas, cut, grain } = els;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return { stop: () => {}, setRoute: () => {} };
  const g2d: CanvasRenderingContext2D = ctx;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0;
  let H = 0;
  let DPR = 1;
  let S = 0;
  let N = 0;
  let PER = 60;
  let P: Particle[] = [];
  let logoPts: [number, number][] = [];
  let stars: Star[] = [];
  // cenas presentes na página atual (ordem da página) e seus limites
  let sceneList: number[] = [0];
  let groups: SceneGroup[] = [{ top: 0, h: 1 }];
  let pageP = 0; // progresso do scroll na página (0..1)
  let curF = 0; // posição suavizada na lista de cenas da página
  let curA = 0; // par de cenas desenhado agora: A -> B com mistura m
  let curB = 0;
  let curM = 0;
  let routeActive = false; // troca de página: transição direta de uma cena para outra
  let routeA = 0;
  let routeB = 0;
  let routeT = 0;
  let routeKind: TransitionKind = "morph";
  let routeMode: "page" | "fixed" = "page";
  let ringWords = RING_WORDS;
  let lastDominant = 0;
  // layout do logo de partículas (pode ser definido pela rota, ex.: login)
  let logoFn: ResolvedRoute["logo"];
  let logoCx = 0;
  let logoCy = 0;
  let logoW = 0;
  // estado interativo (login): hover no botão, carregando, erro e sucesso
  const ui = { hoverTarget: 0, hoverX: 0, hoverY: 0, hoverAmt: 0, loadTarget: 0, loadAmt: 0, errT: 0, succ: false, succT: 0 };
  let X = new Float32Array(0);
  let Y = new Float32Array(0);
  let accent: [number, number, number] = [143, 125, 255];
  let displayFont = '"Arial Black", sans-serif';
  let monoFont = "monospace";

  let mx = -9999;
  let my = -9999;
  let t = 0;
  let ring = 0;
  let lastY = window.scrollY;
  let vel = 0;
  let localF = 0;
  let raf = 0;
  let pending = false;
  let lastNow = 0;
  let stopped = false;

  const accA = (a: number) => `rgba(${accent[0]},${accent[1]},${accent[2]},${a})`;

  function readTheme() {
    const v = cssVar("--void-accent");
    accent = parseColor(v || "#8f7dff");
    const d = cssVar("--font-clash");
    displayFont = `${d ? d + ", " : ""}"Arial Black", sans-serif`;
    const m = cssVar("--font-geist-mono");
    monoFont = `${m ? m + ", " : ""}ui-monospace, monospace`;
  }

  // grão de filme: ruído gerado uma vez, animado só por CSS
  function buildGrain() {
    const g = document.createElement("canvas");
    g.width = g.height = 160;
    const c = g.getContext("2d");
    if (!c) return;
    const d = c.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    c.putImageData(d, 0, 0);
    grain.style.backgroundImage = `url(${g.toDataURL()})`;
  }

  function layoutLogo() {
    if (logoFn) {
      const l = logoFn(W, H);
      logoCx = l.cx;
      logoCy = l.cy;
      logoW = l.width;
    } else {
      logoCx = W / 2;
      logoCy = H / 2 - H * 0.24;
      logoW = Math.min(W * (W < 700 ? 0.84 : 0.72), 800, H * 1.1);
    }
  }

  function sampleLogo() {
    const o = document.createElement("canvas");
    layoutLogo();
    const w = Math.round(logoW);
    const h = Math.round(w * 0.32);
    o.width = w;
    o.height = h;
    const c = o.getContext("2d", { willReadFrequently: true });
    if (!c || !w || !h) return;
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `700 ${Math.round(h * 0.82)}px ${displayFont}`;
    c.fillText("VØID", w / 2, h / 2);
    const d = c.getImageData(0, 0, w, h).data;
    const pts: [number, number][] = [];
    const step = Math.max(3, Math.round(w / 190));
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        if (d[(y * w + x) * 4 + 3] > 140) pts.push([x - w / 2, y - h / 2]);
      }
    }
    const order = pts.map((_, i) => i).sort(() => Math.random() - 0.5);
    logoPts = [];
    for (let i = 0; i < N; i++) {
      logoPts.push(pts[order[i % Math.max(1, pts.length)]] || [0, 0]);
    }
  }

  // cenas da página atual: cada bloco com data-scene="0".."5"; blocos com o mesmo número formam uma cena
  // Lê os blocos data-scene da página. Com replaceList=true (só em setRoute) troca a lista de cenas
  // e devolve false se a página ainda não montou. Sem ele, só atualiza a geometria das cenas atuais:
  // assim um resize/observer nunca troca a cena "atual" antes da transição de rota começar.
  function measure(replaceList = false): boolean {
    const found = new Map<number, { top: number; bottom: number }>();
    document.querySelectorAll<HTMLElement>("[data-scene]").forEach((el) => {
      const k = Number(el.dataset.scene);
      if (!Number.isInteger(k) || k < 0 || k >= SCENES) return;
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      const bottom = top + r.height;
      const cur = found.get(k);
      if (!cur) found.set(k, { top, bottom });
      else {
        cur.top = Math.min(cur.top, top);
        cur.bottom = Math.max(cur.bottom, bottom);
      }
    });
    const geo = (k: number, fallback?: SceneGroup): SceneGroup => {
      const f = found.get(k);
      return f ? { top: f.top, h: Math.max(1, f.bottom - f.top) } : (fallback ?? { top: 0, h: 1 });
    };
    if (replaceList) {
      if (found.size === 0) return false;
      const list = [...found.keys()].sort((x, y) => (found.get(x)?.top ?? 0) - (found.get(y)?.top ?? 0));
      sceneList = list;
      groups = list.map((k) => geo(k));
      return true;
    }
    if (routeMode === "page") groups = sceneList.map((k, idx) => geo(k, groups[idx]));
    return found.size > 0;
  }

  const mobile = () => window.matchMedia("(max-width: 699px)").matches;

  function resize() {
    // no celular a barra do navegador esconde/mostra ao rolar e dispara resize só de altura: ignorar
    if (mobile() && W === window.innerWidth && H !== 0) return;
    const small = mobile();
    DPR = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    g2d.setTransform(DPR, 0, 0, DPR, 0, 0);
    S = Math.min(W, H);
    const n = small ? 360 : 840;
    PER = small ? 40 : 60;
    if (n !== N) {
      N = n;
      P = [];
      for (let i = 0; i < N; i++) P.push({ r: Math.random(), a: Math.random() * TAU });
      X = new Float32Array(N);
      Y = new Float32Array(N);
    }
    stars = [];
    const sn = small ? 90 : 200;
    for (let i = 0; i < sn; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H * 3, z: 0.2 + Math.random() * 0.8, tw: Math.random() * 6 });
    }
    g2d.fillStyle = BG;
    g2d.fillRect(0, 0, W, H);
    readTheme();
    sampleLogo();
    measure();
  }

  // posição de cada partícula em cada cena -> o = [x, y, raio, alpha]
  function scene(k: number, i: number, o: Vec4) {
    const cx = W / 2;
    const cy = H / 2;
    switch (k) {
      case 0: {
        const a = t * 1.15 + (i % 2) * Math.PI;
        const R = S * 0.075;
        o[0] = cx + Math.cos(a) * R;
        o[1] = cy + Math.sin(a) * R * 0.9;
        o[2] = i < 2 ? 7 : 2.2;
        o[3] = i < 2 ? 1 : 0;
        return;
      }
      case 1: {
        const rings = Math.ceil(N / PER);
        const ui = i % PER;
        const vi = Math.floor(i / PER);
        const u = (ui / PER) * TAU + vi * 0.13;
        const v = (vi / rings) * TAU;
        const R = S * 0.3;
        const r = S * 0.11;
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);
        const ay = t * 0.28;
        const ax = 1.0 + localF * 0.7; // inclina conforme o scroll
        const x1 = x * Math.cos(ay) - z * Math.sin(ay);
        const z1 = x * Math.sin(ay) + z * Math.cos(ay);
        const y1 = y * Math.cos(ax) - z1 * Math.sin(ax);
        const z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
        const f = 1 / (1 + z2 / (S * 1.3));
        o[0] = cx + x1 * f;
        o[1] = cy + y1 * f;
        o[2] = 0.8 + 1.7 * f;
        o[3] = 0.25 + 0.75 * clamp(f * f, 0, 1);
        return;
      }
      case 2: {
        const cols = Math.ceil(Math.sqrt((N * W) / H));
        const rows = Math.ceil(N / cols);
        const gx = i % cols;
        const gy = Math.floor(i / cols);
        const x = ((gx + 0.5) * W) / cols;
        let y = ((gy + 0.5) * H) / rows;
        const w = Math.sin(gx * 0.42 + gy * 0.28 - t * 1.5 + localF * 9);
        y += w * S * 0.014;
        const near = Math.max(0, 1 - Math.hypot(x - mx, y - my) / (S * 0.24));
        o[0] = x + (x - mx) * near * 0.12;
        o[1] = y + (y - my) * near * 0.12;
        o[2] = 1.2 + w * 0.7 + near * 4.5;
        o[3] = 0.22 + (0.28 * (w + 1)) / 2 + near * 0.7;
        return;
      }
      case 3: {
        const band = i % 3;
        const R = band === 0 ? S * 0.44 : band === 1 ? S * 0.27 : S * 0.2;
        const dir = band === 0 ? -0.6 : band === 1 ? 1 : 1.8;
        const a = (i / N) * TAU * 3 + ring * dir;
        o[0] = cx + Math.cos(a) * R;
        o[1] = cy + Math.sin(a) * R;
        o[2] = band === 1 ? 1.7 : 1.1;
        o[3] = band === 1 ? 0.65 : 0.3;
        return;
      }
      case 4: {
        const layer = i % 4;
        const j = Math.floor(i / 4);
        const per = Math.ceil(N / 4);
        const a = (j / per) * TAU;
        const e = 2 + 4 * (0.5 + 0.5 * Math.sin(localF * TAU + t * 0.35 + layer * 0.6)); // círculo -> quadrado
        const c = Math.cos(a);
        const s = Math.sin(a);
        let x = Math.sign(c) * Math.pow(Math.abs(c), 2 / e);
        let y = Math.sign(s) * Math.pow(Math.abs(s), 2 / e);
        const R = S * (0.17 + layer * 0.065);
        const rot = t * 0.3 * (layer % 2 ? -1 : 1) + localF * 1.8 + layer * 0.3;
        x *= R;
        y *= R;
        o[0] = cx + x * Math.cos(rot) - y * Math.sin(rot);
        o[1] = cy + x * Math.sin(rot) + y * Math.cos(rot);
        o[2] = 1.3 + layer * 0.2;
        o[3] = 0.25 + layer * 0.22;
        return;
      }
      case 6: {
        // calma: sem forma central, partículas invisíveis (só o campo de estrelas)
        o[0] = cx;
        o[1] = cy;
        o[2] = 0;
        o[3] = 0;
        return;
      }
      default: {
        const lp = logoPts[i] || [0, 0];
        const j = Math.sin(t * 2.2 + i) * 0.7;
        o[0] = logoCx + lp[0] + j;
        o[1] = logoCy + lp[1] + Math.cos(t * 1.7 + i) * 0.7;
        o[2] = 2.2;
        o[3] = 1;
      }
    }
  }

  function computeScene(dt: number) {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - H);
    pageP = clamp(y / max, 0, 1);
    const n = sceneList.length;

    let target = 0;
    if (n > 1) {
      const mid = y + H * 0.5;
      let f = 0;
      for (let i = 0; i < n; i++) {
        const g = groups[i];
        if (mid >= g.top) f = i + Math.min(1, (mid - g.top) / g.h);
      }
      target = clamp(f - 0.5, 0, n - 1);
    }
    curF = reduce ? target : curF + (target - curF) * (1 - Math.exp(-dt * 8));
    const i = Math.min(Math.floor(curF), n - 1);
    curA = sceneList[i];
    curB = sceneList[Math.min(i + 1, n - 1)];
    curM = i >= n - 1 ? 0 : curF - i;

    // troca de página: morph direto da cena anterior para a nova
    if (routeActive) {
      routeT = Math.min(1, routeT + dt / TRANSITION_SECONDS);
      curA = routeA;
      curB = routeB;
      curM = routeT;
      if (routeT >= 1) routeActive = false;
    }
  }

  const O1: Vec4 = [0, 0, 0, 0];
  const O2: Vec4 = [0, 0, 0, 0];
  const cutCache = { v: "" };

  const OUT: Vec4 = [0, 0, 0, 0];
  const lerp = (a: number, b: number, q: number) => a + (b - a) * q;
  const smooth01 = (q: number) => q * q * (3 - 2 * q);

  // posição/tamanho/alpha de uma partícula durante a troca de rota (m = 0..1, linear no tempo)
  function placeRoute(kind: TransitionKind, i: number, m: number, p: Particle) {
    const cx = W / 2;
    const cy = H / 2;
    scene(routeA, i, O1);
    scene(routeB, i, O2);
    const d = p.r * 0.3;
    switch (kind) {
      case "explode": {
        // tudo colapsa no centro e explode até a nova forma
        if (m < 0.25) {
          const q = ease(m / 0.25);
          OUT[0] = lerp(O1[0], cx, q);
          OUT[1] = lerp(O1[1], cy, q);
          OUT[2] = O1[2];
          OUT[3] = O1[3] * (1 - 0.6 * q);
          return;
        }
        const e = ease(clamp((m - 0.25 - d * 0.3) / 0.66, 0, 1));
        const dist = S * (0.55 + p.r * 0.9);
        const bx = cx + Math.cos(p.a) * dist;
        const by = cy + Math.sin(p.a) * dist;
        const u = 1 - e;
        OUT[0] = u * u * cx + 2 * u * e * bx + e * e * O2[0];
        OUT[1] = u * u * cy + 2 * u * e * by + e * e * O2[1];
        OUT[2] = O2[2] * (1 + u * 1.2);
        OUT[3] = lerp(O1[3] * 0.4, O2[3], smooth01(e));
        return;
      }
      case "cascade": {
        // as antigas caem; as novas caem em cascata, linha por linha
        if (m < 0.28) {
          const q = (m / 0.28) * (m / 0.28);
          OUT[0] = O1[0];
          OUT[1] = O1[1] + q * H * 0.8;
          OUT[2] = O1[2];
          OUT[3] = O1[3] * (1 - q);
          return;
        }
        const delay = clamp(O2[1] / H, 0, 1);
        const e = clamp((m - 0.28 - delay * 0.3) / 0.42, 0, 1);
        const ee = 1 - Math.pow(1 - e, 3);
        OUT[0] = O2[0];
        OUT[1] = lerp(-30 - p.r * 90, O2[1], ee);
        OUT[2] = O2[2];
        OUT[3] = O2[3] * clamp(e * 4, 0, 1);
        return;
      }
      case "spiral": {
        // giram em espiral até a nova forma
        const rA = Math.hypot(O1[0] - cx, O1[1] - cy);
        const rB = Math.hypot(O2[0] - cx, O2[1] - cy);
        const thA = Math.atan2(O1[1] - cy, O1[0] - cx);
        const thB = Math.atan2(O2[1] - cy, O2[0] - cx);
        const dth = ((((thB - thA + 3 * Math.PI) % TAU) + TAU) % TAU) - Math.PI;
        const e = ease(clamp((m - d * 0.5) / 0.7, 0, 1));
        const th = thA + (dth + TAU) * e;
        const rr = lerp(rA, rB, e) * (1 - 0.25 * Math.sin(Math.PI * e));
        OUT[0] = cx + Math.cos(th) * rr;
        OUT[1] = cy + Math.sin(th) * rr;
        OUT[2] = lerp(O1[2], O2[2], e);
        OUT[3] = lerp(O1[3], O2[3], e);
        return;
      }
      case "vortex": {
        // tudo é sugado para o centro, flash, e a nova forma se abre
        const rA = Math.hypot(O1[0] - cx, O1[1] - cy);
        const thA = Math.atan2(O1[1] - cy, O1[0] - cx);
        if (m < 0.45) {
          const q = (m / 0.45) * (m / 0.45);
          const th = thA + q * 2.5;
          const rr = rA * (1 - q);
          OUT[0] = cx + Math.cos(th) * rr;
          OUT[1] = cy + Math.sin(th) * rr;
          OUT[2] = O1[2] * (1 - 0.5 * q);
          OUT[3] = O1[3];
          return;
        }
        const rB = Math.hypot(O2[0] - cx, O2[1] - cy);
        const thB = Math.atan2(O2[1] - cy, O2[0] - cx);
        const e = ease(clamp((m - 0.5 - d * 0.2) / 0.44, 0, 1));
        const th = thB - (1 - e) * 3;
        const rr = rB * e;
        OUT[0] = cx + Math.cos(th) * rr;
        OUT[1] = cy + Math.sin(th) * rr;
        OUT[2] = O2[2];
        OUT[3] = m < 0.5 ? 0 : O2[3] * clamp(e * 3, 0, 1);
        return;
      }
      case "dissolve": {
        // dissolve suavemente: as partículas se afastam e somem, restam só as estrelas
        const q = smooth01(clamp((m - 0.45) / 0.55, 0, 1));
        const dx = Math.cos(p.a) * S * 0.08 * m;
        const dy = Math.sin(p.a) * S * 0.08 * m;
        OUT[0] = lerp(O1[0] + dx, O2[0], q);
        OUT[1] = lerp(O1[1] + dy, O2[1], q);
        OUT[2] = lerp(O1[2], O2[2], q);
        OUT[3] = lerp(O1[3] * (1 - clamp(m * 1.3, 0, 1)), O2[3], q);
        return;
      }
      default: {
        const e = ease(clamp((m - 0.22 - d) / 0.5, 0, 1));
        const sw = Math.sin(Math.PI * e) * S * 0.16 * (0.4 + p.r);
        const ang = p.a + t * 0.6;
        OUT[0] = lerp(O1[0], O2[0], e) + Math.cos(ang) * sw;
        OUT[1] = lerp(O1[1], O2[1], e) + Math.sin(ang) * sw;
        OUT[2] = lerp(O1[2], O2[2], e);
        OUT[3] = lerp(O1[3], O2[3], e);
      }
    }
  }

  function frame(now: number) {
    pending = false;
    if (stopped) return;
    const dt = lastNow ? clamp((now - lastNow) / 1000, 0.001, 0.05) : 1 / 60;
    lastNow = now;
    const f60 = dt * 60;
    const scrollY = window.scrollY;

    if (!reduce) t += dt;
    vel = reduce ? 0 : vel + ((scrollY - lastY) / f60 - vel) * (1 - Math.pow(1 - 0.12, f60));
    lastY = scrollY;
    ring += reduce ? 0 : (0.003 + Math.abs(vel) * 0.0014) * f60; // acelera com a velocidade do scroll

    // estado interativo suavizado
    ui.hoverAmt += (ui.hoverTarget - ui.hoverAmt) * (1 - Math.exp(-dt * 8));
    ui.loadAmt += (ui.loadTarget - ui.loadAmt) * (1 - Math.exp(-dt * 5));
    ui.errT = Math.max(0, ui.errT - dt / 0.7);
    if (ui.succ) ui.succT = Math.min(1, ui.succT + dt / 0.9);
    const uiActive = ui.hoverAmt > 0.01 || ui.loadAmt > 0.01 || ui.errT > 0.01 || ui.succ;

    computeScene(dt);
    const k = curA;
    const k2 = curB;
    const fr = curM;
    localF = pageP;
    // mistura 0..1 já descontando o atraso inicial das partículas
    const mm = clamp((fr - 0.22) / 0.78, 0, 1);
    const weight = (sc: number) => (k === k2 ? (sc === k ? 1 : 0) : (sc === k ? 1 - mm : 0) + (sc === k2 ? mm : 0));
    lastDominant = mm < 0.5 ? k : k2;

    // rastro: em vez de limpar, pinta o fundo semitransparente
    g2d.globalCompositeOperation = "source-over";
    g2d.fillStyle = reduce ? BG : `rgba(10,10,13,${routeActive ? 0.07 : 0.2 + clamp(Math.abs(vel) * 0.01, 0, 0.25)})`; // na troca de rota o rastro fica mais longo
    g2d.fillRect(0, 0, W, H);

    // brilho central
    const glow = g2d.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, S * 0.75);
    glow.addColorStop(0, accA((0.035 + 0.015 * Math.sin(t * 0.8)) * (1 - 0.7 * weight(6))));
    glow.addColorStop(1, accA(0));
    g2d.fillStyle = glow;
    g2d.fillRect(0, 0, W, H);

    // estrelas em camadas, com parallax de profundidade (mais calmas na cena sem forma)
    const calmW = weight(6);
    g2d.globalCompositeOperation = "lighter";
    for (const s of stars) {
      const y = (((s.y - scrollY * s.z * 0.35) % H) + H) % H;
      const x = s.x + (mx > 0 ? (mx - W / 2) * s.z * -0.015 : 0);
      const a = (0.15 + 0.35 * s.z) * (0.6 + 0.4 * Math.sin(t * 1.5 * (1 - 0.65 * calmW) + s.tw));
      g2d.fillStyle = `rgba(236,235,242,${a})`;
      g2d.fillRect(x, y, s.z * 1.6, s.z * 1.6);
    }

    // partículas: transição escalonada com redemoinho, mistura aditiva
    const split = Math.abs(vel) > 3 && !reduce ? clamp(Math.abs(vel) * 0.35, 0, 9) : 0; // glitch no scroll rápido
    const [ar, ag, ab] = accent;
    // logo parado + mistura aditiva + rastro acumulam até virar branco: na cena do logo usa mistura normal
    g2d.globalCompositeOperation = k === 5 || k2 === 5 ? "source-over" : "lighter";
    for (let i = 0; i < N; i++) {
      const p = P[i];
      let r: number;
      let a: number;
      let e: number;
      if (routeActive) {
        placeRoute(routeKind, i, fr, p);
        X[i] = OUT[0];
        Y[i] = OUT[1];
        r = OUT[2];
        a = OUT[3];
        e = fr; // para a cor: vira cor de destaque ao chegar no logo
      } else {
        const d = p.r * 0.3;
        e = ease(clamp((fr - 0.22 - d) / 0.5, 0, 1));
        scene(k, i, O1);
        scene(k2, i, O2);
        const sw = Math.sin(Math.PI * e) * S * 0.16 * (0.4 + p.r);
        const ang = p.a + t * 0.6;
        X[i] = O1[0] + (O2[0] - O1[0]) * e + Math.cos(ang) * sw;
        Y[i] = O1[1] + (O2[1] - O1[1]) * e + Math.sin(ang) * sw;
        r = O1[2] + (O2[2] - O1[2]) * e;
        a = O1[3] + (O2[3] - O1[3]) * e;
      }
      if (uiActive) {
        const ucx = k === 5 || k2 === 5 ? logoCx : W / 2;
        const ucy = k === 5 || k2 === 5 ? logoCy : H / 2;
        // carregando: o logo pulsa devagar
        if (ui.loadAmt > 0.01) {
          const pulse = Math.sin(t * 2.2);
          const sc = 1 + ui.loadAmt * 0.04 * pulse;
          X[i] = ucx + (X[i] - ucx) * sc;
          Y[i] = ucy + (Y[i] - ucy) * sc;
          a *= 1 + ui.loadAmt * 0.25 * Math.sin(t * 2.2 + 1.2);
        }
        // hover no botão: as partículas se agitam na direção dele
        if (ui.hoverAmt > 0.01) {
          const vx = ui.hoverX - X[i];
          const vy = ui.hoverY - Y[i];
          const len = Math.hypot(vx, vy) || 1;
          const amp = ui.hoverAmt * 5 * (0.5 + 0.5 * Math.sin(t * 7 + i));
          X[i] += (vx / len) * amp;
          Y[i] += (vy / len) * amp;
        }
        // erro: tremida das partículas
        if (ui.errT > 0.01) {
          const jr = Math.sin(i * 12.9898 + t * 60) * 43758.5453;
          X[i] += (jr - Math.floor(jr) - 0.5) * ui.errT * 16;
        }
        // sucesso: sugadas para o centro em espiral
        if (ui.succ) {
          const q = ease(clamp(ui.succT, 0, 1));
          const dx = X[i] - ucx;
          const dy = Y[i] - ucy;
          const th = Math.atan2(dy, dx) + q * 2.4;
          const rr = Math.hypot(dx, dy) * (1 - q);
          X[i] = ucx + Math.cos(th) * rr;
          Y[i] = ucy + Math.sin(th) * rr;
          r *= 1 - 0.5 * q;
        }
      }
      if (a < 0.02) continue;
      const isAcc = i % 9 === 0 || (k === 0 && i < 2 && e < 0.5) || k === 5 || (k2 === 5 && e > 0.5);
      if (split > 0) {
        g2d.fillStyle = `rgba(255,40,80,${a * 0.5})`;
        g2d.beginPath();
        g2d.arc(X[i] - split, Y[i], r, 0, TAU);
        g2d.fill();
        g2d.fillStyle = `rgba(40,200,255,${a * 0.5})`;
        g2d.beginPath();
        g2d.arc(X[i] + split, Y[i], r, 0, TAU);
        g2d.fill();
      }
      if (ui.errT > 0.02) {
        // erro: glitch rápido em vermelho
        const gl = ui.errT * 7;
        g2d.fillStyle = `rgba(255,45,70,${Math.min(1, a * 0.9)})`;
        g2d.beginPath();
        g2d.arc(X[i] - gl, Y[i], r, 0, TAU);
        g2d.fill();
        g2d.beginPath();
        g2d.arc(X[i] + gl * 0.6, Y[i] + gl * 0.3, r, 0, TAU);
        g2d.fill();
      }
      g2d.fillStyle = isAcc ? `rgba(${ar},${ag},${ab},${Math.min(1, a + 0.25)})` : `rgba(236,235,242,${a})`;
      g2d.beginPath();
      g2d.arc(X[i], Y[i], r, 0, TAU);
      g2d.fill();
      if (isAcc && r > 1.5 && k !== 5 && k2 !== 5) {
        g2d.fillStyle = `rgba(${ar},${ag},${ab},${a * 0.12})`;
        g2d.beginPath();
        g2d.arc(X[i], Y[i], r * 4, 0, TAU);
        g2d.fill();
      }
    }

    // linhas: aros do toro, contornos do quadrado e malha perto do mouse
    const wT = weight(1);
    const wQ = weight(4);
    const wG = weight(2);
    g2d.lineWidth = 0.6;
    if (wT > 0.02) {
      g2d.strokeStyle = `rgba(236,235,242,${0.16 * wT})`;
      g2d.beginPath();
      for (let i = 0; i < N; i++) {
        if (i % PER === 0) g2d.moveTo(X[i], Y[i]);
        else g2d.lineTo(X[i], Y[i]);
        if (i % PER === PER - 1) g2d.lineTo(X[i - PER + 1], Y[i - PER + 1]);
      }
      g2d.stroke();
    }
    if (wQ > 0.02) {
      g2d.strokeStyle = accA(0.22 * wQ);
      for (let l = 0; l < 4; l++) {
        g2d.beginPath();
        let first = true;
        for (let i = l; i < N; i += 4) {
          if (first) {
            g2d.moveTo(X[i], Y[i]);
            first = false;
          } else g2d.lineTo(X[i], Y[i]);
        }
        g2d.closePath();
        g2d.stroke();
      }
    }
    if (wG > 0.02 && mx > 0) {
      const cols = Math.ceil(Math.sqrt((N * W) / H));
      g2d.strokeStyle = accA(0.5 * wG);
      g2d.beginPath();
      for (let i = 0; i < N; i++) {
        const near = 1 - Math.hypot(X[i] - mx, Y[i] - my) / (S * 0.2);
        if (near > 0) {
          if (i % cols !== cols - 1 && i + 1 < N) {
            g2d.moveTo(X[i], Y[i]);
            g2d.lineTo(X[i + 1], Y[i + 1]);
          }
          if (i + cols < N) {
            g2d.moveTo(X[i], Y[i]);
            g2d.lineTo(X[i + cols], Y[i + cols]);
          }
        }
      }
      g2d.stroke();
    }

    // órbitas pontilhadas da cena 0
    const w0 = weight(0);
    if (w0 > 0.02) {
      g2d.strokeStyle = `rgba(236,235,242,${0.14 * w0})`;
      g2d.setLineDash([2, 6]);
      g2d.beginPath();
      g2d.ellipse(W / 2, H / 2, S * 0.075, S * 0.0675, 0, 0, TAU);
      g2d.stroke();
      g2d.beginPath();
      g2d.ellipse(W / 2, H / 2, S * 0.2, S * 0.2, 0, 0, TAU);
      g2d.stroke();
      g2d.setLineDash([]);
    }

    g2d.globalCompositeOperation = "source-over";

    // anéis de texto girando em sentidos opostos + ponto pulsante (cena 3)
    const wText = weight(3);
    if (wText > 0.01) {
      const chars = [...ringWords];
      const step = TAU / chars.length;
      g2d.save();
      g2d.translate(W / 2, H / 2);
      g2d.textAlign = "center";
      g2d.textBaseline = "middle";
      g2d.rotate(ring);
      g2d.font = `600 ${Math.max(11, S * 0.026)}px ${displayFont}`;
      g2d.fillStyle = `rgba(236,235,242,${0.9 * wText})`;
      chars.forEach((ch, j) => {
        g2d.save();
        g2d.rotate(j * step);
        g2d.translate(0, -S * 0.355);
        g2d.fillText(ch, 0, 0);
        g2d.restore();
      });
      g2d.rotate(-ring * 2.2);
      g2d.font = `500 ${Math.max(9, S * 0.014)}px ${monoFont}`;
      g2d.fillStyle = `rgba(141,139,153,${0.9 * wText})`;
      const small = [...RING_SMALL];
      const st = TAU / small.length;
      small.forEach((ch, j) => {
        g2d.save();
        g2d.rotate(j * st);
        g2d.translate(0, -S * 0.235);
        g2d.fillText(ch, 0, 0);
        g2d.restore();
      });
      g2d.restore();
      g2d.fillStyle = accA(wText);
      g2d.beginPath();
      g2d.arc(W / 2, H / 2, S * 0.02 * (1 + 0.15 * Math.sin(t * 3)), 0, TAU);
      g2d.fill();
    }

    // corte de cena: flash de tela cheia na troca entre a cena 3 e a 4 (desligado com movimento reduzido)
    const isCut = (k === 2 && k2 === 3) || (k === 3 && k2 === 2);
    const dc = Math.abs(mm - 0.5);
    const sceneCut = !reduce && isCut && dc < 0.12 ? (1 - dc / 0.12) * 0.94 : 0;
    const vortexFlash = !reduce && routeActive && routeKind === "vortex" ? clamp(1 - Math.abs(routeT - 0.5) / 0.1, 0, 1) * 0.85 : 0;
    const succFlash = ui.succ ? clamp(1 - Math.abs(ui.succT - 0.6) / 0.14, 0, 1) * 0.85 : 0;
    const cutOp = String(Math.max(sceneCut, vortexFlash, succFlash));
    if (cutCache.v !== cutOp) {
      cutCache.v = cutOp;
      cut.style.opacity = cutOp;
    }


    if (!reduce) raf = requestAnimationFrame(frame);
  }

  // movimento reduzido: sem loop, redesenha só quando a página rola ou muda de tamanho
  function schedule() {
    if (pending || stopped) return;
    pending = true;
    raf = requestAnimationFrame(frame);
  }

  const onResize = () => {
    resize();
    if (reduce) schedule();
  };
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    mx = e.clientX;
    my = e.clientY;
  };
  const onLeave = () => {
    mx = my = -9999;
  };
  const onScrollStatic = () => schedule();
  // eventos do fundo enviados pelas páginas (ex.: login): hover, loading, error, success
  const onBg = (e: Event) => {
    if (reduce) return;
    const d = (e as CustomEvent<{ state: string; x?: number; y?: number }>).detail;
    if (!d) return;
    if (d.state === "hover") {
      ui.hoverTarget = 1;
      ui.hoverX = d.x ?? W / 2;
      ui.hoverY = d.y ?? H / 2;
    } else if (d.state === "hover-end") ui.hoverTarget = 0;
    else if (d.state === "loading") ui.loadTarget = 1;
    else if (d.state === "idle") ui.loadTarget = 0;
    else if (d.state === "error") ui.errT = 1;
    else if (d.state === "success") {
      ui.succ = true;
      ui.succT = 0;
      ui.loadTarget = 0;
    }
  };

  // início
  buildGrain();
  readTheme();
  resize();
  window.addEventListener("resize", onResize);
  if (!reduce) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("void-bg", onBg);
    document.addEventListener("pointerleave", onLeave);
  } else {
    window.addEventListener("scroll", onScrollStatic, { passive: true });
  }

  // a altura da página muda (fontes, FAQ aberto, conteúdo): remedir as cenas
  const ro = new ResizeObserver(() => {
    if (pendingRoute) setRoute(pendingRoute);
    else measure();
    if (reduce) schedule();
  });
  ro.observe(document.body);

  // as fontes do canvas precisam estar carregadas antes de amostrar o logo
  const fontLoads = [
    `700 48px ${displayFont}`,
    `600 48px ${displayFont}`,
    `500 48px ${monoFont}`,
  ].map((f) => document.fonts.load(f).catch(() => []));
  Promise.all(fontLoads).then(() => {
    if (stopped) return;
    readTheme();
    sampleLogo();
    measure();
    if (reduce) schedule();
  });

  if (reduce) schedule();
  else raf = requestAnimationFrame(frame);

  let firstRoute = true;
  let pendingRoute: ResolvedRoute | null = null; // rota "page" cuja página ainda não montou

  const setRoute = (route: ResolvedRoute) => {
    if (route.scenes === "page") {
      if (!measure(true)) {
        pendingRoute = route; // o observer de tamanho tenta de novo quando a página montar
        return;
      }
      routeMode = "page";
    } else {
      routeMode = "fixed";
      sceneList = [...route.scenes];
      groups = [{ top: 0, h: 1 }];
    }
    pendingRoute = null;
    logoFn = route.logo;
    ui.hoverTarget = ui.loadTarget = 0;
    ui.errT = 0;
    ui.succ = false;
    ui.succT = 0;
    const prevLogoW = logoW;
    layoutLogo();
    if (Math.abs(logoW - prevLogoW) > 1) sampleLogo();
    ringWords = route.ringText ? buildRingWords(route.ringText) : RING_WORDS;

    const next = sceneList[0];
    curF = 0;
    if (firstRoute) {
      firstRoute = false;
      curA = curB = lastDominant = next;
      if (reduce) schedule();
      return;
    }
    if (!reduce && next !== lastDominant) {
      routeKind = route.transition;
      routeActive = true;
      routeA = lastDominant;
      routeB = next;
      routeT = 0;
    } else {
      routeActive = false;
      lastDominant = next;
    }
    if (reduce) schedule();
  };

  const stop = () => {
    stopped = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("void-bg", onBg);
    window.removeEventListener("scroll", onScrollStatic);
    document.removeEventListener("pointerleave", onLeave);
  };
  return { stop, setRoute };
}
