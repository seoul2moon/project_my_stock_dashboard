"use client";

import { useEffect, useState } from "react";
import type { Market, Quote } from "@/lib/types/stock";

const POLL_INTERVAL_MS = 20000;

export function useQuotes(refs: { market: Market; symbol: string }[]) {
  const key = refs.map((r) => `${r.market}:${r.symbol}`).join(",");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function fetchQuotes() {
      try {
        const res = await fetch(`/api/quote?symbols=${encodeURIComponent(key)}`);
        if (!res.ok) throw new Error("failed to fetch quotes");
        const data = await res.json();
        if (!cancelled) {
          setQuotes(data.quotes ?? []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("시세를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function schedule() {
      timer = setTimeout(async () => {
        if (!document.hidden) await fetchQuotes();
        schedule();
      }, POLL_INTERVAL_MS);
    }

    fetchQuotes();
    schedule();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [key]);

  if (!key) {
    return { quotes: [], loading: false, error: null };
  }
  return { quotes, loading, error };
}
