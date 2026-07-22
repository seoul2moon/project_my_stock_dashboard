"use client";

import { useEffect, useState } from "react";
import type { FearGreedIndex } from "@/lib/types/stock";

const POLL_INTERVAL_MS = 5 * 60 * 1000;

export function useFearGreedIndex() {
  const [index, setIndex] = useState<FearGreedIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function fetchIndex() {
      try {
        const res = await fetch("/api/fear-greed");
        if (!res.ok) throw new Error("failed to fetch fear & greed index");
        const data = await res.json();
        if (!cancelled) {
          setIndex(data.index ?? null);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("공포탐욕지수를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function schedule() {
      timer = setTimeout(async () => {
        if (!document.hidden) await fetchIndex();
        schedule();
      }, POLL_INTERVAL_MS);
    }

    fetchIndex();
    schedule();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { index, loading, error };
}
