import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // habilita <ViewTransition> do React nas navegações (animação de saída/entrada das páginas)
    viewTransition: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    // a loja antiga foi incorporada à página de bots (com calculadora de desconto)
    return [{ source: "/produtos", destination: "/bots", permanent: true }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

export default nextConfig;
