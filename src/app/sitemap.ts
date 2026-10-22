import type { MetadataRoute } from "next";
import { bots } from "@/config/bots";
import { SITE_URL } from "@/config/store";

// sitemap.xml: só as páginas públicas (a home e as páginas de cada bot entram automaticamente).
const pages = ["", "/bots", "/como-funciona", "/clientes", "/faq", "/sobre", "/equipe", "/termos", "/privacidade", "/reembolso"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...pages, ...bots.map((b) => `/bots/${b.id}`)].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/bots/") ? 0.5 : 0.7,
  }));
}
