import { LEGAL_UPDATED, LEGAL_VERSION, type LegalDoc } from "@/config/legal";

/** Página de documento jurídico: título e versão à esquerda, texto numerado à direita. O conteúdo vem de src/config/legal.ts. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <main className="pt-36 pb-24 wrap min-h-screen">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-20">
        <header className="lg:sticky lg:top-32 self-start">
          <p className="eyebrow-l">Legal</p>
          <h1 className="sec-title mt-3">{doc.title}</h1>
          <p className="mt-3 text-xs text-zinc-500">
            Versão {LEGAL_VERSION} · Atualizado em {LEGAL_UPDATED}
          </p>
        </header>

        <div className="panel p-8 sm:p-12 max-w-4xl">
          <div className="space-y-6 text-sm text-silver leading-relaxed">
            {doc.sections.map((section, i) => (
              <section key={section.title}>
                <h2 className="text-white font-semibold mb-2">
                  {i + 1}. {section.title}
                </h2>
                <div className="space-y-3">
                  {section.blocks.map((block, j) =>
                    "p" in block ? (
                      <p key={j}>{block.p}</p>
                    ) : (
                      <ul key={j} className="list-disc pl-5 space-y-1.5 marker:text-zinc-600">
                        {block.ul.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
