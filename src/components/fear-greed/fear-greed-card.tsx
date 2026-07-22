"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FearGreedGauge } from "@/components/fear-greed/fear-greed-gauge";
import { useFearGreedIndex } from "@/hooks/use-fear-greed";
import { FEAR_GREED_META } from "@/lib/fear-greed";

function MiniStat({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm font-medium tabular-nums">{Math.round(score)}</span>
    </div>
  );
}

export function FearGreedCard() {
  const { index, loading, error } = useFearGreedIndex();

  return (
    <Card>
      <CardHeader>
        <CardTitle>CNN 공포 &amp; 탐욕 지수</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
        {!index ? (
          <p className="py-8 text-center text-sm text-neutral-500">
            {loading ? "불러오는 중..." : "데이터를 불러오지 못했습니다."}
          </p>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[260px]" style={{ color: FEAR_GREED_META[index.rating].color }}>
              <FearGreedGauge score={index.score} />
            </div>
            <div className="-mt-6 flex flex-col items-center">
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color: FEAR_GREED_META[index.rating].color }}
              >
                {Math.round(index.score)}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: FEAR_GREED_META[index.rating].color }}
              >
                {FEAR_GREED_META[index.rating].label}
              </span>
            </div>
            <div className="mt-4 grid w-full grid-cols-4 gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-900">
              <MiniStat label="전일" score={index.previousClose} />
              <MiniStat label="1주 전" score={index.previousWeek} />
              <MiniStat label="1개월 전" score={index.previousMonth} />
              <MiniStat label="1년 전" score={index.previousYear} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
