import "server-only";
import type { Candle, CandleInterval, NewsItem, Quote } from "@/lib/types/stock";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

async function yahooFetch(url: string): Promise<Response> {
  return fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
}

interface ChartMeta {
  symbol: string;
  currency?: string;
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  longName?: string;
  shortName?: string;
}

interface ChartResult {
  meta: ChartMeta;
  timestamp?: number[];
  indicators?: {
    quote?: Array<{
      open?: (number | null)[];
      high?: (number | null)[];
      low?: (number | null)[];
      close?: (number | null)[];
      volume?: (number | null)[];
    }>;
  };
}

async function fetchChart(
  symbol: string,
  range: string,
  interval: string
): Promise<ChartResult | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?range=${range}&interval=${interval}`;
  const res = await yahooFetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const result = data?.chart?.result?.[0];
  return result ?? null;
}

export async function getYahooQuote(symbol: string): Promise<Quote | null> {
  const result = await fetchChart(symbol, "5d", "1d");
  if (!result?.meta?.regularMarketPrice) return null;
  const { meta } = result;
  const price = meta.regularMarketPrice ?? 0;
  const prevClose = meta.chartPreviousClose ?? price;
  const change = price - prevClose;
  const changePercent = prevClose ? (change / prevClose) * 100 : 0;

  return {
    market: "US",
    symbol,
    name: meta.longName ?? meta.shortName ?? symbol,
    price,
    change,
    changePercent,
    currency: "USD",
    updatedAt: new Date().toISOString(),
  };
}

export async function getYahooQuotes(symbols: string[]): Promise<Quote[]> {
  const results = await Promise.all(symbols.map((s) => getYahooQuote(s)));
  return results.filter((q): q is Quote => q !== null);
}

const INTERVAL_MAP: Record<CandleInterval, { range: string; interval: string }> = {
  day: { range: "6mo", interval: "1d" },
  week: { range: "2y", interval: "1wk" },
  month: { range: "10y", interval: "1mo" },
};

export async function getYahooCandles(symbol: string, interval: CandleInterval): Promise<Candle[]> {
  const { range, interval: yInterval } = INTERVAL_MAP[interval];
  const result = await fetchChart(symbol, range, yInterval);
  if (!result?.timestamp) return [];

  const quote = result.indicators?.quote?.[0];
  if (!quote) return [];

  const candles: Candle[] = [];
  for (let i = 0; i < result.timestamp.length; i++) {
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    if (open == null || high == null || low == null || close == null) continue;

    const date = new Date(result.timestamp[i] * 1000);
    const time = date.toISOString().slice(0, 10);
    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume: quote.volume?.[i] ?? 0,
    });
  }
  return candles;
}

export async function getYahooNews(symbol: string): Promise<NewsItem[]> {
  const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
    symbol
  )}&newsCount=20&quotesCount=0`;
  const res = await yahooFetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const items: unknown[] = data?.news ?? [];

  const news: NewsItem[] = [];
  for (const raw of items) {
    const item = raw as {
      uuid?: string;
      title?: string;
      link?: string;
      publisher?: string;
      providerPublishTime?: number;
      relatedTickers?: string[];
    };
    if (!item.title || !item.link) continue;
    if (item.relatedTickers && !item.relatedTickers.includes(symbol)) continue;
    news.push({
      id: item.uuid ?? `${symbol}-${news.length}`,
      title: item.title,
      url: item.link,
      source: item.publisher ?? "Yahoo Finance",
      publishedAt: item.providerPublishTime
        ? new Date(item.providerPublishTime * 1000).toISOString()
        : new Date().toISOString(),
    });
  }
  return news;
}
