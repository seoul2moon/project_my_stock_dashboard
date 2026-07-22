"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { HoldingFormDialog } from "@/components/portfolio/holding-form-dialog";
import { PnlSummaryCard } from "@/components/portfolio/pnl-summary-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuotes } from "@/hooks/use-quotes";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { calcHoldingsPnl, calcTotalsByCurrency } from "@/lib/portfolio-calc";

export default function PortfolioPage() {
  const mounted = useHasMounted();
  const holdingsRaw = usePortfolioStore((s) => s.holdings);
  const holdings = mounted ? holdingsRaw : [];
  const add = usePortfolioStore((s) => s.add);
  const remove = usePortfolioStore((s) => s.remove);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { quotes } = useQuotes(holdings);
  const rows = calcHoldingsPnl(holdings, quotes);
  const totals = calcTotalsByCurrency(rows);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">포트폴리오</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={16} />
          보유종목 추가
        </Button>
      </div>

      <PnlSummaryCard totals={totals} />

      <Card>
        <CardContent>
          <HoldingsTable rows={rows} onRemove={remove} />
        </CardContent>
      </Card>

      <HoldingFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={({ stock, quantity, avgPrice }) =>
          add({
            market: stock.market,
            symbol: stock.symbol,
            name: stock.name,
            currency: stock.currency,
            quantity,
            avgPrice,
          })
        }
      />
    </div>
  );
}
