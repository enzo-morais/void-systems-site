import { NextResponse } from "next/server";
import { z } from "zod";

// Validação de entrada das rotas. Todas as rotas devem usar schemas com .strict(): campos extras são rejeitados.

export const PASSWORD_MIN = 6; // sobe para 8 na etapa de senhas
export const PASSWORD_MAX = 72; // limite do bcrypt

export const emailSchema = z.string().trim().max(254).email();
export const codeSchema = z.string().regex(/^\d{6}$/, "Código inválido");
export const passwordSchema = z.string().min(PASSWORD_MIN).max(PASSWORD_MAX);
export const nameSchema = z.string().trim().min(1).max(80);

type ParseResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/** Lê o corpo JSON e valida com o schema. Nunca lança: devolve a resposta 400 pronta. */
export async function parseBody<T extends z.ZodType>(req: Request, schema: T): Promise<ParseResult<z.infer<T>>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 }) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: NextResponse.json({ error: "Dados inválidos. Confira os campos e tente de novo." }, { status: 400 }) };
  }
  return { ok: true, data: parsed.data };
}
