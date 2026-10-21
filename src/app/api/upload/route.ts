import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions, isStaffMember } from "@/lib/auth-options";
import { RULES, enforce, sessionKey } from "@/lib/ratelimit";
import { detectFileType } from "@/lib/file-type";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const MAX_BYTES = 5 * 1024 * 1024; // comprovantes são fotos/prints/PDF: 5 MB sobra
const BODY_SLACK = 512 * 1024; // cabeçalhos do multipart

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isStaffMember(session)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  { const limited = await enforce(RULES.upload, sessionKey(session)); if (limited) return limited; }

  // recusa antes de ler o corpo inteiro na memória
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES + BODY_SLACK) return NextResponse.json({ error: "Arquivo muito grande (máximo 5 MB)" }, { status: 413 });

  let file: File | null = null;
  try {
    const formData = await req.formData();
    const f = formData.get("file");
    file = f instanceof File ? f : null;
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "Arquivo vazio" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Arquivo muito grande (máximo 5 MB)" }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const type = detectFileType(buffer);
  if (!type) return NextResponse.json({ error: "Tipo de arquivo não permitido. Envie PNG, JPG, WEBP, GIF ou PDF." }, { status: 415 });

  // nome 100% gerado aqui (a extensão vem do conteúdo detectado, nunca do nome enviado)
  const filename = `${Date.now()}-${randomUUID()}.${type.ext}`;

  const { error } = await supabase.storage
    .from("receipts")
    .upload(filename, buffer, { contentType: type.mime, upsert: false });

  if (error) {
    console.error("Supabase upload error:", error.message);
    return NextResponse.json({ error: "Erro ao enviar arquivo" }, { status: 500 });
  }

  const { data } = supabase.storage.from("receipts").getPublicUrl(filename);

  return NextResponse.json({ url: data.publicUrl });
}
