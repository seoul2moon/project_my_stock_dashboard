"use client";

import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { SearchResult } from "@/lib/types/stock";
import { ChevronLeft } from "lucide-react";

interface HoldingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { stock: SearchResult; quantity: number; avgPrice: number }) => void;
}

export function HoldingFormDialog({ open, onOpenChange, onSubmit }: HoldingFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="보유종목 추가">
      {open && (
        <HoldingFormContent
          onSubmit={(data) => {
            onSubmit(data);
            onOpenChange(false);
          }}
        />
      )}
    </Dialog>
  );
}

function HoldingFormContent({
  onSubmit,
}: {
  onSubmit: (data: { stock: SearchResult; quantity: number; avgPrice: number }) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [stock, setStock] = useState<SearchResult | null>(null);
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  useEffect(() => {
    if (!query.trim() || stock) return;
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
  }, [query, stock]);

  const displayResults = query.trim() && !stock ? results : [];
  const canSubmit = stock && Number(quantity) > 0 && Number(avgPrice) > 0;

  if (!stock) {
    return (
      <>
        <Input
          autoFocus
          placeholder="종목명 또는 코드 검색 (예: 삼성전자, AAPL)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="mt-3 max-h-72 overflow-y-auto">
          {loading && <p className="py-4 text-center text-sm text-neutral-500">검색 중...</p>}
          {!loading && query && displayResults.length === 0 && (
            <p className="py-4 text-center text-sm text-neutral-500">검색 결과가 없습니다.</p>
          )}
          <ul className="flex flex-col gap-0.5">
            {displayResults.map((r) => (
              <li key={`${r.market}-${r.symbol}`}>
                <button
                  onClick={() => setStock(r)}
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

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setStock(null)}
        className="flex w-fit items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
      >
        <ChevronLeft size={14} />
        다시 검색
      </button>
      <p className="font-medium">
        {stock.name} <span className="text-neutral-400">({stock.symbol})</span>
      </p>
      <div>
        <label className="mb-1 block text-xs text-neutral-500">보유 수량</label>
        <Input
          type="number"
          min="0"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-500">
          평균 매입 단가 ({stock.currency})
        </label>
        <Input
          type="number"
          min="0"
          step="any"
          value={avgPrice}
          onChange={(e) => setAvgPrice(e.target.value)}
          placeholder="0"
        />
      </div>
      <Button
        disabled={!canSubmit}
        onClick={() => {
          if (!canSubmit) return;
          onSubmit({ stock, quantity: Number(quantity), avgPrice: Number(avgPrice) });
        }}
      >
        추가
      </Button>
    </div>
  );
}
