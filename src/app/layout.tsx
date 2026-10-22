import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { VoidBackgroundClient } from "@/components/void/VoidBackgroundClient";
import { MeshBackground } from "@/components/void/MeshBackground";
import { SITE_URL } from "@/config/store";
import { pages, themeColor } from "@/config/seo";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Fontes do site novo (Fontshare), servidas do próprio projeto: títulos e texto.
const clash = localFont({
  variable: "--font-clash",
  display: "swap",
  src: [
    { path: "../fonts/ClashDisplay-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ClashDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ClashDisplay-700.woff2", weight: "700", style: "normal" },
  ],
});
const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    { path: "../fonts/Satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Satoshi-700.woff2", weight: "700", style: "normal" },
  ],
});

// Padrão do site: título e descrição de reserva. O Open Graph e o Twitter card de cada página pública vêm de src/config/seo.ts;
// as páginas privadas (painel, perfil, login...) ficam sem preview e com noindex.
export const metadata: Metadata = {
  title: pages.home.title,
  description: pages.home.description,
  metadataBase: new URL(SITE_URL),
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

/** theme-color: cor da barrinha do embed no Discord e da barra do navegador no celular. */
export const viewport: Viewport = { themeColor };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable} ${clash.variable} ${satoshi.variable}`}>
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Providers>
          {/* o fundo fica no layout raiz: gradient mesh em todas as páginas; o login troca por partículas */}
          <MeshBackground />
          <VoidBackgroundClient />
          {children}
        </Providers>
      </body>
    </html>
  );
}
