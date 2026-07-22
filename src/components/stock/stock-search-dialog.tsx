"use client";

import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import type { SearchResult } from "@/lib/types/stock";

interface StockSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSelect: (result: SearchResult) => void;
}

export function StockSearchDialog({ open, onOpenChange, title, onSelect }: StockSearchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title}>
      {open && (
        <StockSearchContent
          onSelect={(r) => {
            onSelect(r);
            onOpenChange(false);
          }}
        />
      )}
    </Dialog>
  );
}

function StockSearchContent({ onSelect }: { onSelect: (result: SearchResult) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const displayResults = query.trim() ? results : [];

  return (
    <>
      <Input
        autoFocus
        placeholder="종목명 또는 코드 검색 (예: 삼성전자, AAPL)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="mt-3 max-h-80 overflow-y-auto">
        {loading && <p className="py-4 text-center text-sm text-neutral-500">검색 중...</p>}
        {!loading && query && displayResults.length === 0 && (
          <p className="py-4 text-center text-sm text-neutral-500">검색 결과가 없습니다.</p>
        )}
        <ul className="flex flex-col gap-0.5">
          {displayResults.map((r) => (
            <li key={`${r.market}-${r.symbol}`}>
              <button
                onClick={() => onSelect(r)}
                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      r.market === "KR"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    }`}
                  >
                    {r.market}
                  </span>
                  <span className="font-medium">{r.name}</span>
                </span>
                <span className="text-neutral-400">{r.symbol}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
