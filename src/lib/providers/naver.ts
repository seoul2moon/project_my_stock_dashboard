import "server-only";
import type { Candle, CandleInterval, NewsItem, Quote, SearchResult } from "@/lib/types/stock";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

async function naverFetch(url: string): Promise<Response> {
  return fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
}

function parseSignedNumber(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export async function searchNaver(query: string): Promise<SearchResult[]> {
  const url = `https://m.stock.naver.com/front-api/search/autoComplete?query=${encodeURIComponent(
    query
  )}&target=stock`;
  const res = await naverFetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const items: unknown[] = data?.result?.items ?? [];

  const results: SearchResult[] = [];
  for (const raw of items) {
    const item = raw as {
      code?: string;
      name?: string;
      nationCode?: string;
    };
    if (!item.code || !item.name) continue;
    if (item.nationCode === "KOR") {
      results.push({ market: "KR", symbol: item.code, name: item.name, currency: "KRW" });
    } else if (item.nationCode === "USA") {
      results.push({ market: "US", symbol: item.code, name: item.name, currency: "USD" });
    }
  }
  return results;
}

export async function getNaverQuote(code: string): Promise<Quote | null> {
  const res = await naverFetch(`https://m.stock.naver.com/api/stock/${code}/basic`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.stockName || !data?.closePrice) return null;

  const price = parseSignedNumber(data.closePrice);
  const change = parseSignedNumber(data.compareToPreviousClosePrice);
  const changePercent = parseSignedNumber(data.fluctuationsRatio);

  return {
    market: "KR",
    symbol: code,
    name: data.stockName,
    price,
    change,
    changePercent,
    currency: "KRW",
    updatedAt: new Date().toISOString(),
  };
}

export async function getNaverQuotes(codes: string[]): Promise<Quote[]> {
  const results = await Promise.all(codes.map((code) => getNaverQuote(code)));
  return results.filter((q): q is Quote => q !== null);
}

const TIMEFRAME_MAP: Record<CandleInterval, string> = {
  day: "day",
  week: "week",
  month: "month",
};

function formatDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export async function getNaverCandles(code: string, interval: CandleInterval): Promise<Candle[]> {
  const end = new Date();
  const start = new Date(end);
  const yearsBack = interval === "month" ? 10 : interval === "week" ? 3 : 1;
  start.setFullYear(start.getFullYear() - yearsBack);

  const url = `https://api.finance.naver.com/siseJson.naver?symbol=${code}&requestType=1&startTime=${formatDate(
    start
  )}&endTime=${formatDate(end)}&timeframe=${TIMEFRAME_MAP[interval]}`;

  const res = await naverFetch(url);
  if (!res.ok) return [];
  const text = await res.text();

  const rowPattern = /\["(\d{8})",\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/g;
  const candles: Candle[] = [];
  let match: RegExpExecArray | null;
  while ((match = rowPattern.exec(text)) !== null) {
    const [, dateStr, open, high, low, close, volume] = match;
    const time = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    candles.push({
      time,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume),
    });
  }
  return candles;
}

export async function getNaverNews(code: string): Promise<NewsItem[]> {
  const res = await naverFetch(
    `https://m.stock.naver.com/api/news/stock/${code}?pageSize=20&page=1`
  );
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  const news: NewsItem[] = [];
  for (const group of data) {
    for (const item of group?.items ?? []) {
      if (!item?.title || !item?.mobileNewsUrl) continue;
      const dt = String(item.datetime ?? "");
      const publishedAt =
        dt.length === 12
          ? `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}T${dt.slice(8, 10)}:${dt.slice(
              10,
              12
            )}:00+09:00`
          : new Date().toISOString();
      news.push({
        id: item.id ?? `${code}-${news.length}`,
        title: item.title,
        url: item.mobileNewsUrl,
        source: item.officeName ?? "Naver",
        publishedAt,
      });
    }
  }
  return news;
}
