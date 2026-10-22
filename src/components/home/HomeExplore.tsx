import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { explore } from "@/config/home";
import { Reveal } from "./Reveal";
import "./home-explore.css";

export function HomeExplore() {
  return (
    <section data-scene="4" className="sec">
      <div className="wrap">
        <div className="sec-head">
          <Reveal>
            <p className="eyebrow-l">Explore</p>
            <h2 className="sec-title mt-3">Tudo sobre a VØID, página por página</h2>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {explore.map((item, i) => (
            <Reveal key={item.href} delay={i * 100} className="h-full">
              <Link href={item.href} className="he-card panel">
                <span className="he-num">0{i + 1}</span>
                <h3 className="mt-6 text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-silver leading-relaxed">{item.desc}</p>
                <ArrowUpRight className="he-arrow w-5 h-5" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
