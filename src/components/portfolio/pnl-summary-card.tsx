import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent, formatPrice, formatSigned } from "@/lib/format";
import type { CurrencyTotal } from "@/lib/portfolio-calc";

export function PnlSummaryCard({ totals }: { totals: CurrencyTotal[] }) {
  if (totals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>포트폴리오 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">보유 종목이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {totals.map((t) => {
        const up = t.totalPnl > 0;
        const down = t.totalPnl < 0;
        return (
          <Card key={t.currency}>
            <CardHeader>
              <CardTitle>{t.currency === "KRW" ? "국내 포트폴리오" : "해외 포트폴리오"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">
                {formatPrice(t.totalValue, t.currency)}
              </p>
              <p
                className={`mt-1 text-sm tabular-nums ${
                  up ? "text-red-600" : down ? "text-blue-600" : "text-neutral-500"
                }`}
              >
                {formatSigned(t.totalPnl, t.currency === "KRW" ? 0 : 2)} ({formatPercent(t.totalPnlPercent)})
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
