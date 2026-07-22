import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Holding } from "@/lib/types/stock";

interface PortfolioState {
  holdings: Holding[];
  add: (holding: Omit<Holding, "id" | "createdAt">) => void;
  update: (id: string, patch: Partial<Pick<Holding, "quantity" | "avgPrice">>) => void;
  remove: (id: string) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      holdings: [],
      add: (holding) => {
        set((state) => ({
          holdings: [
            ...state.holdings,
            { ...holding, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        }));
      },
      update: (id, patch) => {
        set((state) => ({
          holdings: state.holdings.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        }));
      },
      remove: (id) => {
        set((state) => ({ holdings: state.holdings.filter((h) => h.id !== id) }));
      },
    }),
    { name: "stock-dashboard.portfolio" }
  )
);
