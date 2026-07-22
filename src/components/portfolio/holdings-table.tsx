"use client";

import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { formatPercent, formatPrice, formatSigned } from "@/lib/format";
import type { HoldingPnl } from "@/lib/portfolio-calc";
import { X } from "lucide-react";
import Link from "next/link";

interface HoldingsTableProps {
  rows: HoldingPnl[];
  onRemove: (id: string) => void;
}

export function HoldingsTable({ rows, onRemove }: HoldingsTableProps) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-neutral-500">보유 종목이 없습니다.</p>;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>종목</Th>
          <Th className="text-right">수량</Th>
          <Th className="text-right">평균단가</Th>
          <Th className="text-right">현재가</Th>
          <Th className="text-right">평가금액</Th>
          <Th className="text-right">평가손익</Th>
          <Th className="w-8" />
        </Tr>
      </Thead>
      <Tbody>
        {rows.map((row) => {
          const up = (row.pnl ?? 0) > 0;
          const down = (row.pnl ?? 0) < 0;
          return (
            <Tr key={row.id}>
              <Td>
                <Link
                  href={`/stock/${row.market}/${row.symbol}`}
                  className="flex items-center gap-2 font-medium hover:underline"
                >
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      row.market === "KR"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                    }`}
                  >
                    {row.market}
                  </span>
                  {row.name}
                </Link>
              </Td>
              <Td className="text-right tabular-nums">{row.quantity}</Td>
              <Td className="text-right tabular-nums">{formatPrice(row.avgPrice, row.currency)}</Td>
              <Td className="text-right tabular-nums">
                {row.currentPrice != null ? formatPrice(row.currentPrice, row.currency) : "-"}
              </Td>
              <Td className="text-right tabular-nums">
                {row.marketValue != null ? formatPrice(row.marketValue, row.currency) : "-"}
              </Td>
              <Td
                className={`text-right tabular-nums ${
                  up ? "text-red-600" : down ? "text-blue-600" : "text-neutral-500"
                }`}
              >
                {row.pnl != null
                  ? `${formatSigned(row.pnl, row.currency === "KRW" ? 0 : 2)} (${formatPercent(row.pnlPercent ?? 0)})`
                  : "-"}
              </Td>
              <Td>
                <button
                  onClick={() => onRemove(row.id)}
                  className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-600 dark:hover:bg-neutral-800"
                  aria-label="삭제"
                >
                  <X size={14} />
                </button>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
