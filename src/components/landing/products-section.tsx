"use client";

import { useEffect, useState } from "react";
import { Package, ArrowRight } from "lucide-react";
import { FadeIn } from "./fade-in";
import { VoidCard } from "./void-card";
import { VoidButton } from "./void-button";

interface Product {
  id: string; name: string; price: number; description: string | null; category: string | null;
}

const DISCORD_LINK = "https://discord.gg/voidsystems";

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/public/products").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setProducts(d);
    });
  }, []);

  if (products.length === 0) return null;

  // Agrupar por categoria
  const categories = new Map<string, Product[]>();
  for (const p of products) {
    const cat = p.category || "Geral";
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(p);
  }

  return (
    <section id="produtos" className="px-6 py-32 max-w-6xl mx-auto">
      <FadeIn className="text-center mb-16">
        <p className="text-sm text-silver/60 uppercase tracking-widest mb-3">Catálogo</p>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Nossos Produtos</h2>
        <p className="text-silver/50 mt-4 max-w-lg mx-auto">Confira nossos bots e serviços. Para adquirir, entre em contato pelo Discord.</p>
      </FadeIn>

      {Array.from(categories.entries()).map(([cat, items]) => (
        <div key={cat} className="mb-12">
          <FadeIn>
            <h3 className="text-sm font-semibold text-silver/40 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Package className="w-4 h-4" /> {cat}
            </h3>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((product, i) => (
              <FadeIn key={product.id} delay={i * 80}>
                <VoidCard className="h-full flex flex-col">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-1">{product.name}</h4>
                    {product.description && (
                      <p className="text-sm text-silver/50 mb-4 leading-relaxed">{product.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-2xl font-bold">
                      R${product.price.toFixed(2).replace(".", ",")}
                      <span className="text-xs text-silver/30 font-normal ml-1">/mês</span>
                    </p>
                    <a
                      href={DISCORD_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-300 bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    >
                      Contratar
                    </a>
                  </div>
                </VoidCard>
              </FadeIn>
            ))}
          </div>
        </div>
      ))}

      <FadeIn className="text-center mt-8">
        <VoidButton href={DISCORD_LINK} variant="secondary">
          Ver todos no Discord <ArrowRight className="w-4 h-4" />
        </VoidButton>
      </FadeIn>
    </section>
  );
}
