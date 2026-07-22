import type { FearGreedRating } from "@/lib/types/stock";

export const FEAR_GREED_META: Record<FearGreedRating, { label: string; color: string }> = {
  "extreme fear": { label: "극단적 공포", color: "#dc2626" },
  fear: { label: "공포", color: "#f97316" },
  neutral: { label: "중립", color: "#eab308" },
  greed: { label: "탐욕", color: "#65a30d" },
  "extreme greed": { label: "극단적 탐욕", color: "#16a34a" },
};

export const FEAR_GREED_SEGMENTS: { rating: FearGreedRating; from: number; to: number }[] = [
  { rating: "extreme fear", from: 0, to: 20 },
  { rating: "fear", from: 20, to: 40 },
  { rating: "neutral", from: 40, to: 60 },
  { rating: "greed", from: 60, to: 80 },
  { rating: "extreme greed", from: 80, to: 100 },
];
