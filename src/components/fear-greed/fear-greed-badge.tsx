"use client";

import Link from "next/link";
import { useFearGreedIndex } from "@/hooks/use-fear-greed";
import { FEAR_GREED_META } from "@/lib/fear-greed";

export function FearGreedBadge() {
  const { index } = useFearGreedIndex();

  if (!index) return null;

  const meta = FEAR_GREED_META[index.rating];

  return (
    <Link
      href="/"
      title={`CNN 공포 & 탐욕 지수: ${meta.label} (${Math.round(index.score)})`}
      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800"
    >
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
      <span className="hidden text-neutral-500 sm:inline">공포탐욕</span>
      <span style={{ color: meta.color }}>
        {meta.label} {Math.round(index.score)}
      </span>
    </Link>
  );
}
