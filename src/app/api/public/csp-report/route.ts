import { NextRequest, NextResponse } from "next/server";
import { RULES, checkRate, getClientIp } from "@/lib/ratelimit";

// Recebe os relatórios da Content-Security-Policy em modo "report-only" e os escreve no log do servidor,
// para ver o que a política bloquearia antes de ligá-la de verdade. Não grava nada no banco.

const MAX_BYTES = 10_000;

export async function POST(req: NextRequest) {
  const limit = await checkRate(RULES.cspReport, getClientIp(req.headers));
  if (!limit.ok) return new NextResponse(null, { status: 204 }); // sem alarde: só descarta

  try {
    const body = (await req.text()).slice(0, MAX_BYTES);
    console.warn("[csp-report]", body.replace(/\s+/g, " "));
  } catch {
    /* relatório ilegível: ignora */
  }
  return new NextResponse(null, { status: 204 });
}
