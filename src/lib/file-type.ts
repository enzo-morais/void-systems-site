export type DetectedType = { ext: string; mime: string };

/** Descobre o tipo pelo CONTEÚDO (assinatura do arquivo); o nome e o Content-Type enviados não são confiáveis. */
export function detectFileType(b: Buffer): DetectedType | null {
  const startsWith = (...bytes: number[]) => bytes.length <= b.length && bytes.every((v, i) => b[i] === v);
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { ext: "png", mime: "image/png" };
  if (startsWith(0xff, 0xd8, 0xff)) return { ext: "jpg", mime: "image/jpeg" };
  if (b.length > 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (b.length >= 6 && (b.toString("ascii", 0, 6) === "GIF87a" || b.toString("ascii", 0, 6) === "GIF89a")) return { ext: "gif", mime: "image/gif" };
  if (b.length >= 5 && b.toString("ascii", 0, 5) === "%PDF-") return { ext: "pdf", mime: "application/pdf" };
  return null;
}
