import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { explore } from "@/config/home";
import { Reveal } from "./Reveal";
import "./home-explore.css";

export function HomeExplore() {
  return (
    <section data-scene="4" className="px-6 py-24">
      <div className="max-w-6xl mx-auto w-full">
        <Reveal className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-silver/80">Explore</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white">Tudo sobre a VØID, página por página</h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {explore.map((item, i) => (
            <Reveal key={item.href} delay={i * 100} className="h-full">
              <Link href={item.href} className="he-card panel">
                <span className="he-num">0{i + 1}</span>
                <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-silver/85 leading-relaxed">{item.desc}</p>
                <ArrowUpRight className="he-arrow w-5 h-5" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
