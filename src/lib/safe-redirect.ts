/**
 * Aceita só caminhos internos do próprio site (ex.: "/perfil?x=1") para o `callbackUrl` do login.
 * Qualquer coisa que possa levar para outro domínio ("https://...", "//dominio", "/\\dominio", "javascript:...")
 * vira o fallback, evitando open redirect depois do login.
 */
export function safeCallbackPath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || typeof raw !== "string" || raw.length > 500) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  // barra invertida e caracteres de controle (tab/quebra de linha são ignorados pelos navegadores e formariam "//")
  if (/[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;
  try {
    const u = new URL(raw, "http://interno.invalid");
    if (u.origin !== "http://interno.invalid") return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
