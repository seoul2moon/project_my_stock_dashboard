import type { Holding, Quote } from "@/lib/types/stock";

export interface HoldingPnl extends Holding {
  currentPrice: number | null;
  marketValue: number | null;
  cost: number;
  pnl: number | null;
  pnlPercent: number | null;
}

export function calcHoldingsPnl(holdings: Holding[], quotes: Quote[]): HoldingPnl[] {
  const quoteMap = new Map(quotes.map((q) => [`${q.market}:${q.symbol}`, q]));
  return holdings.map((h) => {
    const quote = quoteMap.get(`${h.market}:${h.symbol}`);
    const cost = h.quantity * h.avgPrice;
    if (!quote) {
      return { ...h, currentPrice: null, marketValue: null, cost, pnl: null, pnlPercent: null };
    }
    const marketValue = h.quantity * quote.price;
    const pnl = marketValue - cost;
    const pnlPercent = cost ? (pnl / cost) * 100 : 0;
    return { ...h, currentPrice: quote.price, marketValue, cost, pnl, pnlPercent };
  });
}

export interface CurrencyTotal {
  currency: "KRW" | "USD";
  totalCost: number;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export function calcTotalsByCurrency(rows: HoldingPnl[]): CurrencyTotal[] {
  const groups = new Map<"KRW" | "USD", { cost: number; value: number }>();
  for (const row of rows) {
    if (row.marketValue == null) continue;
    const g = groups.get(row.currency) ?? { cost: 0, value: 0 };
    g.cost += row.cost;
    g.value += row.marketValue;
    groups.set(row.currency, g);
  }
  return Array.from(groups.entries()).map(([currency, g]) => ({
    currency,
    totalCost: g.cost,
    totalValue: g.value,
    totalPnl: g.value - g.cost,
    totalPnlPercent: g.cost ? ((g.value - g.cost) / g.cost) * 100 : 0,
  }));
}
