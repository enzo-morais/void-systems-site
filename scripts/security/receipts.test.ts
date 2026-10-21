// Testes dos comprovantes privados (M3): extração do nome do arquivo e geração da URL assinada.
// Rodar:  npx -y tsx --test scripts/security/receipts.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RECEIPT_NAME, RECEIPT_URL_TTL_S, receiptPath, signedReceiptUrl } from "../../src/lib/receipts";
import { saleCreate } from "../../src/lib/schemas";

const NEW = "1789000000000-3f2b8c1e-4d5a-4b6c-8e7f-9a0b1c2d3e4f.png";

describe("receiptPath", () => {
  it("nome novo do upload", () => assert.equal(receiptPath(NEW), NEW));

  it("nome antigo e URL pública antiga viram o nome do arquivo", () => {
    assert.equal(receiptPath("1700000000000-abc123.png"), "1700000000000-abc123.png");
    assert.equal(
      receiptPath("https://abc.supabase.co/storage/v1/object/public/receipts/1700000000000-abc123.png"),
      "1700000000000-abc123.png",
    );
    assert.equal(
      receiptPath("https://abc.supabase.co/storage/v1/object/sign/receipts/1700000000000-abc123.jpeg"),
      "1700000000000-abc123.jpeg",
    );
  });

  it("recusa caminhos que saem do bucket ou apontam para outro bucket", () => {
    for (const bad of [
      "../segredo.png",
      "pasta/arquivo.png",
      "..",
      "a/../b.png",
      "https://abc.supabase.co/storage/v1/object/public/outro-bucket/x.png",
      "https://abc.supabase.co/storage/v1/object/public/receipts/pasta/x.png",
      "https://abc.supabase.co/storage/v1/object/public/receipts/..%2F..%2Fx.png",
      "https://evil.example.com/arquivo",
      "javascript:alert(1)",
      "",
      "   ",
    ]) {
      assert.equal(receiptPath(bad), null, `deveria recusar ${JSON.stringify(bad)}`);
    }
    assert.equal(receiptPath(null), null);
    assert.equal(receiptPath(undefined), null);
  });
});

describe("signedReceiptUrl", () => {
  const fakeClient = (result: { data: { signedUrl: string } | null; error: { message: string } | null }, seen: { bucket?: string; path?: string; ttl?: number }) =>
    ({
      storage: {
        from(bucket: string) {
          seen.bucket = bucket;
          return {
            async createSignedUrl(path: string, ttl: number) {
              seen.path = path;
              seen.ttl = ttl;
              return result;
            },
          };
        },
      },
    }) as unknown as Parameters<typeof signedReceiptUrl>[1];

  it("pede ao bucket 'receipts' uma URL de 60 segundos", async () => {
    const seen: { bucket?: string; path?: string; ttl?: number } = {};
    const url = await signedReceiptUrl(NEW, fakeClient({ data: { signedUrl: "https://x.supabase.co/sign?token=t" }, error: null }, seen));
    assert.equal(url, "https://x.supabase.co/sign?token=t");
    assert.deepEqual(seen, { bucket: "receipts", path: NEW, ttl: RECEIPT_URL_TTL_S });
    assert.equal(RECEIPT_URL_TTL_S, 60);
  });

  it("erro do Storage vira null (a rota responde 502, sem vazar detalhes)", async () => {
    assert.equal(await signedReceiptUrl(NEW, fakeClient({ data: null, error: { message: "Object not found" } }, {})), null);
  });
});

describe("venda: campo receipt", () => {
  const base = { client: "Ana", product: "Bot", value: 10, staffName: "Enzo" };
  it("aceita só o nome gerado pelo upload", () => {
    assert.equal(RECEIPT_NAME.test(NEW), true);
    assert.equal(saleCreate.safeParse({ ...base, receipt: NEW }).success, true);
    assert.equal(saleCreate.safeParse({ ...base }).success, true);
    assert.equal(saleCreate.safeParse({ ...base, receipt: null }).success, true);
  });
  it("recusa URLs e caminhos no lugar do nome", () => {
    for (const bad of ["https://evil.example.com/x.png", "../x.png", "pasta/x.png", "qualquer.png"]) {
      assert.equal(saleCreate.safeParse({ ...base, receipt: bad }).success, false, bad);
    }
  });
});
