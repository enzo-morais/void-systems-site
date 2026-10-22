import { filled } from "@/config/legal";

/**
 * Identificação da empresa (Decreto 7.962/2013). Dados em src/config/legal.ts.
 * Mostra só o que estiver preenchido; se nada estiver, não mostra nada (nunca aparece "[PREENCHER]").
 */
export function CompanyInfo({ className = "" }: { className?: string }) {
  const email = filled("EMAIL_CONTATO");
  const partes: React.ReactNode[] = [
    filled("RAZAO_SOCIAL"),
    filled("CNPJ") && `CNPJ ${filled("CNPJ")}`,
    filled("ENDERECO"),
    email && (
      <a key="mail" href={`mailto:${email}`} className="underline underline-offset-2 hover:text-white">
        {email}
      </a>
    ),
  ].filter(Boolean);
  if (partes.length === 0) return null;

  return (
    <address className={`not-italic ${className}`}>
      {partes.map((parte, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          {parte}
        </span>
      ))}
    </address>
  );
}

/** Aviso de que a VØID não tem vínculo com o Discord. */
export const DISCORD_DISCLAIMER = "VØID Systems não é afiliada ao Discord Inc.";

/** true se há algum dado da empresa preenchido (para decidir se o bloco de identificação aparece). */
export const hasCompanyInfo = () => ["RAZAO_SOCIAL", "CNPJ", "ENDERECO", "EMAIL_CONTATO"].some((k) => filled(k as "CNPJ"));
