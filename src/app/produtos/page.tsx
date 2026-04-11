"use client";

import { useEffect, useState } from "react";
import { Package, ArrowRight, Sparkles, Star, Flame, X, Eye, ShoppingCart, Plus, Minus, Percent } from "lucide-react";
import { VoidBackground } from "@/components/landing/void-background";
import { Header } from "@/components/landing/header";
import { FadeIn } from "@/components/landing/fade-in";
import { VoidCard } from "@/components/landing/void-card";

interface Product {
  id: string; name: string; price: number; description: string | null; category: string | null; badge: string | null; billing: string; tags: string | null;
}

const DISCORD_LINK = "https://discord.gg/voidsystems";

const badgeStyles: Record<string, { bg: string; color: string; icon: typeof Star; order: number }> = {
  Destaque: { bg: "rgba(168,85,247,0.1)", color: "#a855f7", icon: Star, order: 0 },
  Novo: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", icon: Sparkles, order: 1 },
  Popular: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", icon: Flame, order: 2 },
};

function getDiscount(count: number) {
  if (count >= 4) return 0.20;
  if (count >= 3) return 0.15;
  if (count >= 2) return 0.10;
  return 0;
}

function sortByBadge(a: Product, b: Product) {
  const orderA = a.badge && badgeStyles[a.badge] ? badgeStyles[a.badge].order : 99;
  const orderB = b.badge && badgeStyles[b.badge] ? badgeStyles[b.badge].order : 99;
  return orderA - orderB;
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [badgeFilter, setBadgeFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetch("/api/public/products").then((r) => r.json()).then((d) => {
      if (Array.isArray(d)) setProducts(d);
      setLoading(false);
    });
  }, []);

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category || "Geral")))];
  const badges = ["Todos", ...Array.from(new Set(products.map((p) => p.badge).filter(Boolean) as string[]))];

  const filtered = products.filter((p) => {
    if (filter !== "Todos" && (p.category || "Geral") !== filter) return false;
    if (badgeFilter !== "Todos" && p.badge !== badgeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.category || "").toLowerCase().includes(q) && !(p.tags || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort(sortByBadge);

  // Cart calculations
  const cartProducts = cart.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];
  const monthlyInCart = cartProducts.filter((p) => p.billing !== "once");
  const discount = getDiscount(monthlyInCart.length);
  const subtotal = cartProducts.reduce((sum, p) => sum + p.price, 0);
  const monthlyTotal = monthlyInCart.reduce((sum, p) => sum + p.price, 0);
  const onceTotal = cartProducts.filter((p) => p.billing === "once").reduce((sum, p) => sum + p.price, 0);
  const discountAmount = monthlyTotal * discount;
  const total = subtotal - discountAmount;

  function toggleCart(id: string) {
    setCart((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  return (
    <>
      <VoidBackground />
      <Header />
      <main className="relative z-10 pt-8 pb-20 px-6 max-w-7xl mx-auto min-h-screen flex flex-col">
        <FadeIn className="text-center mb-10">
          <p className="text-sm text-silver/60 uppercase tracking-widest mb-3">Catálogo</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Nossos Produtos</h1>
          <p className="text-silver/50 mt-4 max-w-lg mx-auto">Confira nossos bots e serviços. Adicione ao carrinho pra calcular descontos.</p>
        </FadeIn>

        {/* Discount info */}
        <FadeIn className="flex items-center justify-center gap-6 mb-8 flex-wrap">
          {[{ n: "2 bots", d: "10%" }, { n: "3 bots", d: "15%" }, { n: "4+ bots", d: "20%" }].map((x) => (
            <div key={x.n} className="flex items-center gap-2 text-xs text-silver/40">
              <Percent className="w-3 h-3" /> {x.n} → <span className="text-green-400 font-medium">{x.d} OFF</span>
            </div>
          ))}
        </FadeIn>

        {/* Filters */}
        <FadeIn className="mb-8 space-y-4">
          <div className="max-w-md mx-auto">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, categoria ou tag..."
              className="w-full bg-white/[0.04] border rounded-lg px-4 py-2.5 text-sm focus:outline-none placeholder:text-silver/20 backdrop-blur-sm text-center"
              style={{ borderColor: "rgba(255,255,255,0.08)" }} />
          </div>
          {categories.length > 2 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[10px] text-silver/30 uppercase tracking-wider mr-2">Categoria:</span>
              {categories.map((cat) => (
                <button key={cat} onClick={() => setFilter(cat)} className="text-xs px-4 py-2 rounded-full transition-all cursor-pointer"
                  style={{ backgroundColor: filter === cat ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,${filter === cat ? 0.2 : 0.06})`, color: filter === cat ? "#fff" : "rgba(192,192,192,0.5)" }}>
                  {cat}
                </button>
              ))}
            </div>
          )}
          {badges.length > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[10px] text-silver/30 uppercase tracking-wider mr-2">Badge:</span>
              {badges.map((b) => (
                <button key={b} onClick={() => setBadgeFilter(b)} className="text-xs px-4 py-2 rounded-full transition-all cursor-pointer"
                  style={{ backgroundColor: badgeFilter === b ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,${badgeFilter === b ? 0.2 : 0.06})`, color: badgeFilter === b ? "#fff" : "rgba(192,192,192,0.5)" }}>
                  {b}
                </button>
              ))}
            </div>
          )}
        </FadeIn>

        {/* Products grid */}
        {loading ? (
          <div className="text-center py-20 text-silver/30 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-silver/30 text-sm">Nenhum produto disponível.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {filtered.map((product, i) => {
              const badge = product.badge ? badgeStyles[product.badge] : null;
              const BadgeIcon = badge?.icon;
              const inCart = cart.includes(product.id);
              return (
                <FadeIn key={product.id} delay={i * 40}>
                  <VoidCard className={`h-full flex flex-col relative ${inCart ? "ring-1 ring-green-400/30" : ""}`}>
                    {badge && BadgeIcon && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: badge.bg, color: badge.color }}>
                        <BadgeIcon className="w-3 h-3" />{product.badge}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 pr-20">{product.name}</h3>
                      {product.category && <p className="text-[10px] text-silver/30 uppercase tracking-wider mb-2">{product.category}</p>}
                      {product.description && (
                        <button onClick={() => setSelected(product)} className="flex items-center gap-1.5 text-xs text-silver/40 hover:text-white transition-colors cursor-pointer mb-2">
                          <Eye className="w-3.5 h-3.5" /> Ver detalhes
                        </button>
                      )}
                      {product.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {product.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-2xl font-bold">
                        R${product.price.toFixed(2).replace(".", ",")}
                        <span className="text-xs text-silver/30 font-normal ml-1">{product.billing === "once" ? "único" : "/mês"}</span>
                      </p>
                      <button onClick={() => toggleCart(product.id)}
                        className={`text-xs px-4 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${inCart ? "bg-green-400/10 text-green-400 border border-green-400/20" : "bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"}`}>
                        {inCart ? <><Minus className="w-3 h-3" /> Remover</> : <><Plus className="w-3 h-3" /> Adicionar</>}
                      </button>
                    </div>
                  </VoidCard>
                </FadeIn>
              );
            })}
          </div>
        )}

        {/* Floating cart button */}
        {cart.length > 0 && (
          <button onClick={() => setShowCart(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-white text-black font-medium px-5 py-3 rounded-full shadow-2xl cursor-pointer hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all">
            <ShoppingCart className="w-4 h-4" />
            <span>{cart.length}</span>
            {discount > 0 && <span className="text-green-600 text-xs font-bold">-{discount * 100}%</span>}
          </button>
        )}

        {/* Cart modal */}
        {showCart && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowCart(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative rounded-xl w-full max-w-lg mx-4 flex flex-col max-h-[80vh]"
              style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <h2 className="text-lg font-semibold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Calculadora</h2>
                <button onClick={() => setShowCart(false)} className="p-2 cursor-pointer text-silver/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="overflow-y-auto p-5 space-y-2 flex-1">
                {cartProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-[10px] text-silver/30">{p.billing === "once" ? "Pagamento único" : "Mensal"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium">R${p.price.toFixed(2).replace(".", ",")}</p>
                      <button onClick={() => toggleCart(p.id)} className="text-red-400/60 hover:text-red-400 cursor-pointer"><X className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex justify-between text-sm text-silver/50">
                  <span>Subtotal</span>
                  <span>R${subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Desconto ({discount * 100}% em {monthlyInCart.length} bots mensais)</span>
                    <span>-R${discountAmount.toFixed(2).replace(".", ",")}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span>Total</span>
                  <span className="text-green-400">R${total.toFixed(2).replace(".", ",")}</span>
                </div>
                {discount > 0 && <p className="text-[10px] text-silver/30">* Desconto aplicado apenas em bots mensais</p>}
                <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer"
                  className="block w-full text-center bg-white text-black font-medium py-3 rounded-lg mt-3 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                  Contratar pelo Discord
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Detail modal */}
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setSelected(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4 flex flex-col"
              style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold">{selected.name}</h2>
                    {selected.badge && badgeStyles[selected.badge] && (() => {
                      const b = badgeStyles[selected.badge!]; const Icon = b.icon;
                      return <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: b.bg, color: b.color }}><Icon className="w-3 h-3" />{selected.badge}</span>;
                    })()}
                  </div>
                  {selected.category && <p className="text-[10px] text-silver/30 uppercase tracking-wider">{selected.category}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="p-2 cursor-pointer text-silver/40 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto p-6 flex-1">
                <div className="text-sm text-silver/60 leading-relaxed whitespace-pre-wrap">{selected.description}</div>
              </div>
              <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-2xl font-bold">R${selected.price.toFixed(2).replace(".", ",")}<span className="text-xs text-silver/30 font-normal ml-1">{selected.billing === "once" ? "único" : "/mês"}</span></p>
                <button onClick={() => { toggleCart(selected.id); setSelected(null); }}
                  className="text-sm px-6 py-2.5 rounded-lg font-medium bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all cursor-pointer flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-silver/20 mt-auto pt-8 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="mb-2">&copy; 2026 VØID Systems</p>
          <div className="flex items-center justify-center gap-4">
            <a href="/termos" className="text-silver/30 hover:text-white transition-colors">Termos</a>
            <a href="/privacidade" className="text-silver/30 hover:text-white transition-colors">Privacidade</a>
          </div>
        </footer>
      </main>
    </>
  );
}
