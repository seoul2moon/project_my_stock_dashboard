"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CandleChart } from "@/components/stock/candle-chart";
import { NewsList } from "@/components/stock/news-list";
import { useQuotes } from "@/hooks/use-quotes";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useWatchlistStore } from "@/store/watchlist-store";
import { formatPercent, formatPrice, formatSigned } from "@/lib/format";
import type { Candle, CandleInterval, Market, NewsItem } from "@/lib/types/stock";

const INTERVAL_OPTIONS: { value: CandleInterval; label: string }[] = [
  { value: "day", label: "일봉" },
  { value: "week", label: "주봉" },
  { value: "month", label: "월봉" },
];

export default function StockDetailPage() {
  const params = useParams<{ market: string; symbol: string }>();
  const market = params.market.toUpperCase() as Market;
  const symbol = decodeURIComponent(params.symbol);

  const { quotes } = useQuotes([{ market, symbol }]);
  const quote = quotes[0];

  const mounted = useHasMounted();
  const hasRaw = useWatchlistStore((s) => s.has(market, symbol));
  const has = mounted && hasRaw;
  const add = useWatchlistStore((s) => s.add);
  const remove = useWatchlistStore((s) => s.remove);

  const [interval, setInterval] = useState<CandleInterval>("day");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [candlesLoading, setCandlesLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCandles() {
      setCandlesLoading(true);
      try {
        const res = await fetch(
          `/api/candles?market=${market}&symbol=${encodeURIComponent(symbol)}&interval=${interval}`
        );
        const data = await res.json();
        if (!cancelled) setCandles(data.candles ?? []);
      } finally {
        if (!cancelled) setCandlesLoading(false);
      }
    }

    fetchCandles();
    return () => {
      cancelled = true;
    };
  }, [market, symbol, interval]);

  useEffect(() => {
    let cancelled = false;

    async function fetchNews() {
      setNewsLoading(true);
      try {
        const res = await fetch(`/api/news?market=${market}&symbol=${encodeURIComponent(symbol)}`);
        const data = await res.json();
        if (!cancelled) setNews(data.news ?? []);
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    }

    fetchNews();
    return () => {
      cancelled = true;
    };
  }, [market, symbol]);

  const up = (quote?.change ?? 0) > 0;
  const down = (quote?.change ?? 0) < 0;
  const currency = quote?.currency ?? (market === "KR" ? "KRW" : "USD");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                market === "KR"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              }`}
            >
              {market}
            </span>
            <h1 className="text-xl font-semibold">{quote?.name ?? symbol}</h1>
            <span className="text-sm text-neutral-400">{symbol}</span>
          </div>
          {quote && (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums">
                {formatPrice(quote.price, currency)}
              </span>
              <span
                className={`text-sm tabular-nums ${
                  up ? "text-red-600" : down ? "text-blue-600" : "text-neutral-500"
                }`}
              >
                {formatSigned(quote.change, currency === "KRW" ? 0 : 2)} (
                {formatPercent(quote.changePercent)})
              </span>
            </div>
          )}
        </div>
        <Button
          variant={has ? "outline" : "default"}
          onClick={() =>
            has
              ? remove(market, symbol)
              : add({
                  market,
                  symbol,
                  name: quote?.name ?? symbol,
                  currency,
                })
          }
        >
          <Star size={16} fill={has ? "currentColor" : "none"} />
          {has ? "관심종목 삭제" : "관심종목 추가"}
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-500">가격 차트</h2>
            <Tabs value={interval} onChange={setInterval} options={INTERVAL_OPTIONS} />
          </div>
          {candlesLoading ? (
            <div className="flex h-[360px] items-center justify-center text-sm text-neutral-500">
              불러오는 중...
            </div>
          ) : (
            <CandleChart candles={candles} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="mb-2 text-sm font-medium text-neutral-500">뉴스</h2>
          {newsLoading ? (
            <p className="py-6 text-center text-sm text-neutral-500">불러오는 중...</p>
          ) : (
            <NewsList news={news} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
