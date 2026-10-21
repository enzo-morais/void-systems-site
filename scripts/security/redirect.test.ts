// Testes do callbackUrl seguro (open redirect).
// Rodar:  npx -y tsx --test scripts/security/redirect.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeCallbackPath } from "../../src/lib/safe-redirect";

describe("safeCallbackPath", () => {
  it("mantém caminhos internos", () => {
    assert.equal(safeCallbackPath("/perfil"), "/perfil");
    assert.equal(safeCallbackPath("/meus-bots?x=1#topo"), "/meus-bots?x=1#topo");
    assert.equal(safeCallbackPath("/"), "/");
  });
  it("sem valor volta para a home", () => {
    assert.equal(safeCallbackPath(null), "/");
    assert.equal(safeCallbackPath(undefined), "/");
    assert.equal(safeCallbackPath(""), "/");
  });
  it("recusa qualquer destino externo ou disfarçado", () => {
    for (const evil of [
      "https://evil.com",
      "http://evil.com/x",
      "//evil.com",
      "///evil.com",
      "/\\evil.com",
      "\\\\evil.com",
      "javascript:alert(1)",
      "data:text/html,<script>1</script>",
      "evil.com",
      "/\t/evil.com",
      "/\n/evil.com",
      "/\r/evil.com",
      "%2f%2fevil.com",
      "/" + "a".repeat(600),
    ]) {
      assert.equal(safeCallbackPath(evil), "/", `deveria recusar ${JSON.stringify(evil)}`);
    }
  });
  it("aceita fallback personalizado", () => assert.equal(safeCallbackPath("https://evil.com", "/perfil"), "/perfil"));
});
