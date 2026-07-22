"use client";

import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatPercent, formatPrice, formatSigned } from "@/lib/format";
import { useQuotes } from "@/hooks/use-quotes";
import type { WatchlistItem } from "@/lib/types/stock";
import { X } from "lucide-react";

interface WatchlistTableProps {
  items: WatchlistItem[];
  onRemove?: (market: WatchlistItem["market"], symbol: string) => void;
  emptyMessage?: string;
}

export function WatchlistTable({ items, onRemove, emptyMessage }: WatchlistTableProps) {
  const { quotes, loading, error } = useQuotes(items);
  const quoteMap = new Map(quotes.map((q) => [`${q.market}:${q.symbol}`, q]));

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-500">
        {emptyMessage ?? "관심종목이 없습니다."}
      </p>
    );
  }

  return (
    <div>
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <Table>
        <Thead>
          <Tr>
            <Th>종목</Th>
            <Th className="text-right">현재가</Th>
            <Th className="text-right">전일대비</Th>
            <Th className="text-right">등락률</Th>
            {onRemove && <Th className="w-8" />}
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item) => {
            const quote = quoteMap.get(`${item.market}:${item.symbol}`);
            const up = (quote?.change ?? 0) > 0;
            const down = (quote?.change ?? 0) < 0;
            return (
              <Tr key={`${item.market}-${item.symbol}`}>
                <Td>
                  <Link
                    href={`/stock/${item.market}/${item.symbol}`}
                    className="flex items-center gap-2 font-medium hover:underline"
                  >
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        item.market === "KR"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                      }`}
                    >
                      {item.market}
                    </span>
                    {item.name}
                  </Link>
                </Td>
                <Td className="text-right tabular-nums">
                  {quote ? formatPrice(quote.price, item.currency) : loading ? "..." : "-"}
                </Td>
                <Td
                  className={`text-right tabular-nums ${
                    up ? "text-red-600" : down ? "text-blue-600" : "text-neutral-500"
                  }`}
                >
                  {quote ? formatSigned(quote.change, item.currency === "KRW" ? 0 : 2) : "-"}
                </Td>
                <Td
                  className={`text-right tabular-nums ${
                    up ? "text-red-600" : down ? "text-blue-600" : "text-neutral-500"
                  }`}
                >
                  {quote ? formatPercent(quote.changePercent) : "-"}
                </Td>
                {onRemove && (
                  <Td>
                    <button
                      onClick={() => onRemove(item.market, item.symbol)}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-600 dark:hover:bg-neutral-800"
                      aria-label="삭제"
                    >
                      <X size={14} />
                    </button>
                  </Td>
                )}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </div>
  );
}
