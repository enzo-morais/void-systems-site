import { Check } from "lucide-react";
import { brl } from "@/config/bots";
import { discountPercent, type Combo } from "@/config/combos";
import { HireButton } from "./HireButton";
import "./combos.css";

/** Card de um combo: nome, preço antigo riscado, preço novo, selo de desconto (calculado), recursos e "Contratar" (fluxo do Discord). */
export function ComboCard({ combo }: { combo: Combo }) {
  const off = discountPercent(combo);

  return (
    <article className={`cb ${combo.featured ? "cb--featured" : ""}`}>
      <div className="cb-top">
        <h3 className="cb-name">Combo {combo.name}</h3>
        {combo.featured && <span className="cb-pill">Mais escolhido</span>}
      </div>
      <p className="cb-tagline">{combo.tagline}</p>

      <div className="cb-price">
        <div className="cb-price-row">
          <s className="cb-old" aria-label={`Preço antigo ${brl(combo.oldPrice)}`}>
            {brl(combo.oldPrice)}
          </s>
          {off > 0 && <span className="cb-badge">-{off}%</span>}
        </div>
        <p className="cb-new-row">
          <span className="cb-new">{brl(combo.price)}</span>
          <span className="cb-per">/mês</span>
        </p>
      </div>

      <ul className="cb-list">
        {combo.highlights.slice(0, 6).map((item) => (
          <li key={item}>
            <Check className="cb-check" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <HireButton items={[{ name: `Combo ${combo.name}`, price: combo.price }]} label="Contratar" className="cb-btn" />
    </article>
  );
}

/** Grade de combos: 4 colunas no desktop, 2 no tablet, 1 no celular. */
export function ComboGrid({ items }: { items: Combo[] }) {
  return (
    <div className="cb-grid">
      {items.map((combo) => (
        <ComboCard key={combo.id} combo={combo} />
      ))}
    </div>
  );
}
