import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/store";

// robots.txt: o site público pode ser indexado; painel, área do cliente, API, login e transcripts não.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/perfil", "/meus-bots", "/discloud", "/login", "/api/", "/transcript/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
