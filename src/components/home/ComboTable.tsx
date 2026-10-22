import { Check } from "lucide-react";
import { brl } from "@/config/bots";
import { combos, featureRows } from "@/config/combos";
import { HireButton } from "./HireButton";
import "./combos.css";

/** Tabela de comparação: recursos nas linhas, combos nas colunas, check ou traço. Rola só dentro da própria caixa em telas estreitas. */
export function ComboTable() {
  return (
    <div className="ct-wrap" role="region" aria-label="Comparação dos combos" tabIndex={0}>
      <table className="ct">
        <caption className="sr-only">Recursos incluídos em cada combo</caption>
        <thead>
          <tr>
            <th scope="col" className="ct-feature">
              Recursos
            </th>
            {combos.map((c) => (
              <th scope="col" key={c.id} className="ct-combo">
                <span className="ct-combo-name">{c.name}</span>
                <span className="ct-combo-price">
                  {brl(c.price)}
                  <small>/mês</small>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {featureRows.map((row) => (
            <tr key={row.id}>
              <th scope="row" className="ct-feature">
                {row.label}
              </th>
              {combos.map((c) => {
                const has = c.features.includes(row.id);
                return (
                  <td key={c.id} className="ct-cell">
                    {has ? (
                      <>
                        <Check className="ct-yes" aria-hidden="true" />
                        <span className="sr-only">Incluído</span>
                      </>
                    ) : (
                      <>
                        <span className="ct-no" aria-hidden="true">
                          —
                        </span>
                        <span className="sr-only">Não incluído</span>
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="ct-feature" />
            {combos.map((c) => (
              <td key={c.id} className="ct-cell">
                <HireButton items={[{ name: `Combo ${c.name}`, price: c.price }]} label="Contratar" className="cb-btn cb-btn--sm" />
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
