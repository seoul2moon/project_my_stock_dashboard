"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useWatchlistStore } from "@/store/watchlist-store";
import { WatchlistTable } from "@/components/watchlist/watchlist-table";
import { StockSearchDialog } from "@/components/stock/stock-search-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHasMounted } from "@/hooks/use-has-mounted";

export default function WatchlistPage() {
  const mounted = useHasMounted();
  const itemsRaw = useWatchlistStore((s) => s.items);
  const items = mounted ? itemsRaw : [];
  const add = useWatchlistStore((s) => s.add);
  const remove = useWatchlistStore((s) => s.remove);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">관심종목</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={16} />
          종목 추가
        </Button>
      </div>

      <Card>
        <CardContent>
          <WatchlistTable items={items} onRemove={remove} />
        </CardContent>
      </Card>

      <StockSearchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="관심종목 추가"
        onSelect={(r) => add({ market: r.market, symbol: r.symbol, name: r.name, currency: r.currency })}
      />
    </div>
  );
}
