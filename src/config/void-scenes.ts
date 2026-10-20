// Mapa "rota -> cena do fundo -> transição". Edite aqui quando criar páginas novas.
//
// Cenas disponíveis (SceneName):
//   orbit    dois pontos orbitando o centro
//   torus    toro 3D de partículas
//   grid     grade de pontos com onda e reação ao mouse
//   rings    anéis girando com texto circular
//   squares  quadrados arredondados girando
//   logo     partículas formando o logo VØID
//   calm     só o campo de estrelas, sem forma central
//
// Transições (TransitionKind), todas de ~0,9s:
//   morph    as partículas mudam de forma, escalonadas, com leve redemoinho
//   explode  tudo colapsa no centro e explode até a nova forma
//   cascade  as partículas caem em cascata, linha por linha
//   spiral   as partículas giram em espiral até a nova forma
//   vortex   tudo é sugado para um ponto, flash na cor de destaque e a nova forma se abre
//   dissolve as partículas se dissolvem suavemente (viram só estrelas)
//
// "scenes: 'page'" significa: a página decide as cenas pelos blocos data-scene="0".."5"
// e o scroll controla a mudança entre elas (é o caso da home).

import { bots } from "@/config/bots";

export type SceneName = "orbit" | "torus" | "grid" | "rings" | "squares" | "logo" | "calm";
export type TransitionKind = "morph" | "explode" | "cascade" | "spiral" | "vortex" | "dissolve";

/** Duração da transição entre rotas, em segundos. */
export const TRANSITION_SECONDS = 0.9;

/** Índice de cada cena no motor do fundo. */
export const SCENE_INDEX: Record<SceneName, number> = {
  orbit: 0,
  torus: 1,
  grid: 2,
  rings: 3,
  squares: 4,
  logo: 5,
  calm: 6,
};

/** Posição e tamanho do logo de partículas (cena "logo") numa tela de w x h, em pixels. */
export type LogoLayout = (w: number, h: number) => { cx: number; cy: number; width: number };

export interface RouteScene {
  /** Caminho. Sem `exact`, vale também para tudo que começa com ele (/painel vale /painel/x). */
  path: string;
  exact?: boolean;
  /** Cena fixa da rota, ou "page" para a página decidir (data-scene + scroll). */
  scenes: SceneName | "page";
  /** Transição ao ENTRAR nesta rota. */
  transition: TransitionKind;
  /** Texto circular da cena "rings" (maiúsculo automaticamente). */
  ringText?: (pathname: string) => string | undefined;
  /** Onde desenhar o logo (só para a cena "logo"). Sem isso, fica centralizado e um pouco acima do meio. */
  logo?: LogoLayout;
}

/** Primeira regra que casar vence: coloque as mais específicas antes. */
export const routeScenes: RouteScene[] = [
  // detalhe de um bot: anel girando com o nome do bot
  {
    path: "/bots/",
    scenes: "rings",
    transition: "spiral",
    ringText: (pathname) => bots.find((b) => b.id === pathname.split("/")[2])?.name,
  },
  // catálogo: grade com onda e reação ao mouse
  { path: "/bots", exact: true, scenes: "grid", transition: "cascade" },
  // login: o logo se forma
  {
    path: "/login",
    scenes: "logo",
    transition: "vortex",
    // desktop: logo no lado direito, ao lado do painel de 460px; celular: menor, acima do formulário
    logo: (w, h) =>
      w >= 1024
        ? { cx: 460 + (w - 460) / 2, cy: h * 0.42, width: Math.min((w - 460) * 0.72, 640, h * 0.9) }
        : { cx: w / 2, cy: 100, width: Math.min(w * 0.6, 260) },
  },
  // painel: só estrelas, calmo
  { path: "/dashboard", scenes: "calm", transition: "dissolve" },
  { path: "/discloud", scenes: "calm", transition: "dissolve" },
  { path: "/perfil", scenes: "calm", transition: "dissolve" },
  // home e páginas do site com cenas controladas pelo scroll
  { path: "/", exact: true, scenes: "page", transition: "explode" },
  { path: "/como-funciona", scenes: "page", transition: "morph" },
  { path: "/clientes", scenes: "page", transition: "morph" },
  { path: "/faq", scenes: "page", transition: "morph" },
];

/** Qualquer rota sem regra (loja, termos, sobre...) fica só com as estrelas. */
export const defaultRoute: Omit<RouteScene, "path"> = { scenes: "calm", transition: "dissolve" };

export interface ResolvedRoute {
  /** Índices das cenas, ou "page". */
  scenes: number[] | "page";
  transition: TransitionKind;
  ringText?: string;
  logo?: LogoLayout;
}

export function resolveRoute(pathname: string): ResolvedRoute {
  const rule =
    routeScenes.find((r) => (r.exact ? pathname === r.path : pathname === r.path || pathname.startsWith(r.path.endsWith("/") ? r.path : r.path + "/"))) ??
    defaultRoute;
  return {
    scenes: rule.scenes === "page" ? "page" : [SCENE_INDEX[rule.scenes]],
    transition: rule.transition,
    ringText: rule.ringText?.(pathname),
    logo: rule.logo,
  };
}
