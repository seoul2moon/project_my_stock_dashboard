import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Market, WatchlistItem } from "@/lib/types/stock";

interface WatchlistState {
  items: WatchlistItem[];
  add: (item: Omit<WatchlistItem, "addedAt">) => void;
  remove: (market: Market, symbol: string) => void;
  has: (market: Market, symbol: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        if (get().has(item.market, item.symbol)) return;
        set((state) => ({
          items: [...state.items, { ...item, addedAt: new Date().toISOString() }],
        }));
      },
      remove: (market, symbol) => {
        set((state) => ({
          items: state.items.filter((i) => !(i.market === market && i.symbol === symbol)),
        }));
      },
      has: (market, symbol) => {
        return get().items.some((i) => i.market === market && i.symbol === symbol);
      },
    }),
    { name: "stock-dashboard.watchlist" }
  )
);
