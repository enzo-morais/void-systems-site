import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// Política de conteúdo em modo "report-only": não bloqueia nada, só registra o que bloquearia (em /api/public/csp-report).
// Depois de alguns dias sem relatórios inesperados dá para trocar o nome do cabeçalho para Content-Security-Policy.
// 'unsafe-inline' em script/style é exigido pelo Next (scripts de hidratação e estilos inline); um nonce por requisição
// seria o próximo passo para endurecer isso.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.discordapp.com https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "report-uri /api/public/csp-report",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  ...(isProd ? [{ key: "Content-Security-Policy-Report-Only", value: csp }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    // /transcript/* define os próprios cabeçalhos (CSP rígida, no-referrer) e fica de fora
    return [{ source: "/((?!transcript/).*)", headers: securityHeaders }];
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
