import { type NextRequest, NextResponse } from "next/server";
import { getNaverNews } from "@/lib/providers/naver";
import { getYahooNews } from "@/lib/providers/yahoo";
import type { Market } from "@/lib/types/stock";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const market = params.get("market") as Market | null;
  const symbol = params.get("symbol");

  if (!market || !symbol) {
    return NextResponse.json({ error: "invalid params" }, { status: 400 });
  }

  const news = market === "KR" ? await getNaverNews(symbol) : await getYahooNews(symbol);
  return NextResponse.json({ news });
}
