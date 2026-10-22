// PREVIEW DE LINK (Open Graph / Twitter card) E TÍTULOS DAS PÁGINAS: o único arquivo para editar.
//
// O que está aqui aparece quando o link do site é enviado no Discord, WhatsApp, Telegram, X etc., e nos resultados do Google.
// Nada disso mexe no layout nem nas cores do site.
//
// Como editar:
//  - Textos de cada página: `pages` (título e descrição). A home usa `pages.home`.
//  - O preview é só texto (título e descrição): o site não usa imagem de compartilhamento.
//  - Endereço do site: SITE_URL em src/config/store.ts (o canonical e as URLs absolutas saem dele).
//  - Cor da barrinha do embed no Discord: `themeColor`.
//
// Páginas privadas (painel, perfil, login, meus bots, bots hospedados) NÃO usam este arquivo: ficam com noindex e sem preview.

import type { Metadata } from "next";
import { SITE_URL } from "./store";

export const SITE_NAME = "VØID Systems";

/** Cor da barrinha do embed no Discord e da barra do navegador no celular. */
export const themeColor = "#000000";

export interface PageSeo {
  title: string;
  description: string;
}

/** Título e descrição de cada página pública. A chave é o nome usado em pageMetadata("..."). */
export const pages = {
  home: {
    title: "VØID Systems — Bots para Discord",
    description: "4 combos prontos para o seu servidor: Simples, Community, DayZ e Server Games. Pix pelo Discord, suporte direto e cancele quando quiser.",
  },
  bots: {
    title: "Combos e bots para Discord — VØID Systems",
    description: "Os 4 combos da VØID (Simples, Community, DayZ e Server Games) e o catálogo de bots avulsos: ticket, registro, verificação, boas-vindas e mais.",
  },
  "como-funciona": {
    title: "Como funciona — VØID Systems",
    description: "Do pedido ao bot rodando em 3 passos, e por que escolher a VØID para o seu servidor de Discord.",
  },
  clientes: {
    title: "Clientes — VØID Systems",
    description: "Os servidores de Discord que já rodam bots da VØID Systems.",
  },
  faq: {
    title: "Perguntas frequentes — VØID Systems",
    description: "Pagamento, prazos, hospedagem, desistência e outras dúvidas sobre os combos e bots da VØID Systems.",
  },
  sobre: {
    title: "Sobre — VØID Systems",
    description: "Conheça a VØID Systems: estúdio de bots e sistemas personalizados para Discord.",
  },
  equipe: {
    title: "Entre para a equipe — VØID Systems",
    description: "Candidate-se para vender os combos e bots da VØID Systems: comissão por venda, acesso ao painel e horário flexível.",
  },
  termos: {
    title: "Termos de Uso — VØID Systems",
    description: "Termos de uso dos serviços da VØID Systems: combos e bots para Discord, pagamento, cancelamento e responsabilidades.",
  },
  privacidade: {
    title: "Política de Privacidade — VØID Systems",
    description: "Como a VØID Systems trata dados pessoais, para quê, por quanto tempo e como você exerce os seus direitos (LGPD).",
  },
  reembolso: {
    title: "Política de Reembolso — VØID Systems",
    description: "Direito de arrependimento em até 7 dias, cancelamento sem multa e o que acontece se o serviço falhar.",
  },
} satisfies Record<string, PageSeo>;

export type PageKey = keyof typeof pages;

/** Caminho (canonical) de cada página. */
const paths: Record<PageKey, string> = {
  home: "/",
  bots: "/bots",
  "como-funciona": "/como-funciona",
  clientes: "/clientes",
  faq: "/faq",
  sobre: "/sobre",
  equipe: "/equipe",
  termos: "/termos",
  privacidade: "/privacidade",
  reembolso: "/reembolso",
};

/** Metadados completos de uma página pública: título, descrição, canonical, Open Graph e Twitter card (só texto). */
export function buildMetadata(seo: PageSeo, path: string): Metadata {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary", // sem imagem: o cartão grande ficaria vazio
      title: seo.title,
      description: seo.description,
    },
  };
}

/** Atalho para as páginas da lista `pages`. */
export const pageMetadata = (key: PageKey): Metadata => buildMetadata(pages[key], paths[key]);
