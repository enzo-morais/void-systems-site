import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Comprovantes de venda ficam no bucket "receipts" do Supabase Storage, que deve ser PRIVADO.
// Ninguém abre o arquivo direto: o staff pede /api/sales/[id]/receipt, que gera uma URL assinada de curta duração.

export const RECEIPTS_BUCKET = "receipts";
/** Validade da URL assinada, em segundos. */
export const RECEIPT_URL_TTL_S = 60;

/** Nome gerado pelo upload atual: timestamp + UUID + extensão detectada pelo conteúdo. */
export const RECEIPT_NAME = /^\d{10,}-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp|gif|pdf)$/;
/** Nomes antigos (`<timestamp>-<aleatório>.<ext>`): só letras, números, ponto, hífen e sublinhado, sem barras. */
const LEGACY_NAME = /^[\w.-]{1,200}$/;

/**
 * Extrai o nome do arquivo no bucket a partir do que está salvo em Sale.receipt:
 * o nome puro (uploads novos) ou a URL pública completa (vendas antigas). Devolve null se não for reconhecível,
 * e nunca devolve um caminho com "/" ou "..", então não dá para apontar para outro bucket ou pasta.
 */
export function receiptPath(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  if (RECEIPT_NAME.test(v) || (LEGACY_NAME.test(v) && !v.includes(".."))) return v;
  try {
    const u = new URL(v);
    const m = u.pathname.match(/^\/storage\/v1\/object\/(?:public|sign|authenticated)\/receipts\/([^/]+)$/);
    if (!m) return null;
    const name = decodeURIComponent(m[1]);
    return LEGACY_NAME.test(name) && !name.includes("..") ? name : null;
  } catch {
    return null;
  }
}

let admin: SupabaseClient | null = null;
/** Cliente com a chave de serviço (só no servidor). Criado na primeira vez que é usado. */
export function supabaseAdmin(): SupabaseClient {
  if (!admin) admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  return admin;
}

/** URL assinada (RECEIPT_URL_TTL_S segundos) para o arquivo, ou null se o Storage não conseguiu gerar. */
export async function signedReceiptUrl(path: string, client: Pick<SupabaseClient, "storage"> = supabaseAdmin()): Promise<string | null> {
  const { data, error } = await client.storage.from(RECEIPTS_BUCKET).createSignedUrl(path, RECEIPT_URL_TTL_S);
  if (error || !data?.signedUrl) {
    console.error("[receipts] não foi possível assinar a URL:", error?.message ?? "sem resposta");
    return null;
  }
  return data.signedUrl;
}
