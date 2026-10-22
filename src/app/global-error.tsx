"use client";

/** Último recurso (erro no layout raiz): precisa trazer o próprio <html> e usa só estilos em linha, no mesmo tema. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", background: "#050505", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 1600, margin: "0 auto", padding: "0 40px" }}>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", margin: "0 0 12px" }}>Algo deu errado</h1>
          <p style={{ color: "#a1a1aa", margin: "0 0 28px", maxWidth: 560 }}>Tivemos um problema ao carregar o site. Tente de novo; se continuar, fale com a gente no Discord.</p>
          <button type="button" onClick={reset} style={{ padding: "14px 28px", borderRadius: 12, border: 0, background: "#fff", color: "#000", fontWeight: 600, cursor: "pointer" }}>
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
