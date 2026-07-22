export type Market = "KR" | "US";

export interface StockRef {
  market: Market;
  symbol: string;
}

export interface Quote extends StockRef {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: "KRW" | "USD";
  updatedAt: string;
}

export type CandleInterval = "day" | "week" | "month";

export interface Candle {
  time: string; // ISO date, "YYYY-MM-DD"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SearchResult extends StockRef {
  name: string;
  currency: "KRW" | "USD";
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export interface WatchlistItem extends StockRef {
  name: string;
  currency: "KRW" | "USD";
  addedAt: string;
}

export interface Holding extends StockRef {
  id: string;
  name: string;
  currency: "KRW" | "USD";
  quantity: number;
  avgPrice: number;
  createdAt: string;
}

export type FearGreedRating =
  | "extreme fear"
  | "fear"
  | "neutral"
  | "greed"
  | "extreme greed";

export interface FearGreedIndex {
  score: number;
  rating: FearGreedRating;
  timestamp: string;
  previousClose: number;
  previousWeek: number;
  previousMonth: number;
  previousYear: number;
}
