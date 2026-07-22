import { type NextRequest, NextResponse } from "next/server";
import { getNaverQuotes } from "@/lib/providers/naver";
import { getYahooQuotes } from "@/lib/providers/yahoo";
import type { Quote } from "@/lib/types/stock";

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  if (!symbolsParam) {
    return NextResponse.json({ quotes: [] satisfies Quote[] });
  }

  const pairs = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [market, symbol] = s.split(":");
      return { market, symbol };
    });

  const krSymbols = pairs.filter((p) => p.market === "KR").map((p) => p.symbol);
  const usSymbols = pairs.filter((p) => p.market === "US").map((p) => p.symbol);

  const [krQuotes, usQuotes] = await Promise.all([
    krSymbols.length ? getNaverQuotes(krSymbols) : Promise.resolve([]),
    usSymbols.length ? getYahooQuotes(usSymbols) : Promise.resolve([]),
  ]);

  return NextResponse.json({ quotes: [...krQuotes, ...usQuotes] });
}
