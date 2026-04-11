import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VØID Systems — Bots para Discord",
  description: "Estúdio de tecnologia especializado em bots e sistemas personalizados para Discord. Automação, organização e controle para seu servidor.",
  metadataBase: new URL("https://voidsystems.store"),
  openGraph: {
    title: "VØID Systems",
    description: "Bots e sistemas personalizados para Discord. Automação profissional pro seu servidor.",
    url: "https://voidsystems.store",
    siteName: "VØID Systems",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "VØID Systems",
    description: "Bots e sistemas personalizados para Discord.",
  },
  icons: { icon: "/icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
