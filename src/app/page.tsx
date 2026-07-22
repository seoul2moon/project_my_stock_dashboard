"use client";

import Link from "next/link";
import { useWatchlistStore } from "@/store/watchlist-store";
import { usePortfolioStore } from "@/store/portfolio-store";
import { WatchlistTable } from "@/components/watchlist/watchlist-table";
import { PnlSummaryCard } from "@/components/portfolio/pnl-summary-card";
import { Card, CardContent } from "@/components/ui/card";
import { useQuotes } from "@/hooks/use-quotes";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { calcHoldingsPnl, calcTotalsByCurrency } from "@/lib/portfolio-calc";

export default function Home() {
  const mounted = useHasMounted();
  const watchlistRaw = useWatchlistStore((s) => s.items);
  const holdingsRaw = usePortfolioStore((s) => s.holdings);
  const watchlist = mounted ? watchlistRaw : [];
  const holdings = mounted ? holdingsRaw : [];

  const { quotes } = useQuotes(holdings);
  const rows = calcHoldingsPnl(holdings, quotes);
  const totals = calcTotalsByCurrency(rows);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">포트폴리오 요약</h2>
        <PnlSummaryCard totals={totals} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">관심종목</h2>
          <Link href="/watchlist" className="text-sm text-blue-600 hover:underline">
            관리하기
          </Link>
        </div>
        <Card>
          <CardContent>
            <WatchlistTable
              items={watchlist}
              emptyMessage="관심종목을 추가하면 실시간 시세가 여기 표시됩니다."
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
