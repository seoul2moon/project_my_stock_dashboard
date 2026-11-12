"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LineChart } from "lucide-react";
import { FearGreedBadge } from "@/components/fear-greed/fear-greed-badge";

const NAV_ITEMS = [
  { href: "/", label: "대시보드" },
  { href: "/watchlist", label: "관심종목" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/short-reports", label: "공매도 리포트" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 overflow-x-auto px-3 sm:gap-6 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold whitespace-nowrap">
          <LineChart size={20} className="shrink-0 text-blue-600" />
          <span className="hidden sm:inline">주식 대시보드</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
                pathname === item.href
                  ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto shrink-0">
          <FearGreedBadge />
        </div>
      </div>
    </header>
  );
}
