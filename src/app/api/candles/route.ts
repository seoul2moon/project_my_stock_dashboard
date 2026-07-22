import { type NextRequest, NextResponse } from "next/server";
import { getNaverCandles } from "@/lib/providers/naver";
import { getYahooCandles } from "@/lib/providers/yahoo";
import type { CandleInterval, Market } from "@/lib/types/stock";

const VALID_INTERVALS: CandleInterval[] = ["day", "week", "month"];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const market = params.get("market") as Market | null;
  const symbol = params.get("symbol");
  const interval = (params.get("interval") ?? "day") as CandleInterval;

  if (!market || !symbol || !VALID_INTERVALS.includes(interval)) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const candles =
    market === "KR"
      ? await getNaverCandles(symbol, interval)
      : await getYahooCandles(symbol, interval);

  return NextResponse.json({ candles });
}
