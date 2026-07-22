import "server-only";
import type { FearGreedIndex, FearGreedRating } from "@/lib/types/stock";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

const VALID_RATINGS: FearGreedRating[] = [
  "extreme fear",
  "fear",
  "neutral",
  "greed",
  "extreme greed",
];

function toRating(raw: unknown): FearGreedRating {
  const value = String(raw).toLowerCase();
  return (VALID_RATINGS as string[]).includes(value) ? (value as FearGreedRating) : "neutral";
}

export async function getFearGreedIndex(): Promise<FearGreedIndex | null> {
  const res = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
    headers: {
      "User-Agent": UA,
      Referer: "https://edition.cnn.com/markets/fear-and-greed",
      Accept: "application/json, text/plain, */*",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data = await res.json();
  const fg = data?.fear_and_greed;
  if (!fg || typeof fg.score !== "number") return null;

  return {
    score: fg.score,
    rating: toRating(fg.rating),
    timestamp: fg.timestamp ?? new Date().toISOString(),
    previousClose: fg.previous_close ?? fg.score,
    previousWeek: fg.previous_1_week ?? fg.score,
    previousMonth: fg.previous_1_month ?? fg.score,
    previousYear: fg.previous_1_year ?? fg.score,
  };
}
