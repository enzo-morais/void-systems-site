import { SmoothScroll } from "@/components/void/SmoothScroll";
import { HomeHeader } from "@/components/home/HomeHeader";
import { Footer } from "@/components/home/Footer";
import "@/components/home/home.css";

// Layout compartilhado das páginas do site. O fundo animado fica no layout raiz (src/app/layout.tsx).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-root">
      <SmoothScroll />
      <HomeHeader />

      <main className="home-main relative z-10">{children}</main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
