"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { REPORTS, VERDICT_META, calcFirmStats, type Verdict } from "@/lib/short-reports";

const VERDICT_ORDER: Verdict[] = ["hit", "partial", "ongoing", "miss"];

function pct(n: number | null) {
  return n === null ? "-" : `${Math.round(n * 100)}%`;
}

export default function ShortReportsPage() {
  const firmStats = useMemo(() => calcFirmStats(), []);
  const [firm, setFirm] = useState<string>("all");
  const [verdict, setVerdict] = useState<Verdict | "all">("all");

  const reports = useMemo(() => {
    const rank = new Map(firmStats.map((f, i) => [f.name, i]));
    return REPORTS.filter((r) => (firm === "all" || r.firm === firm) && (verdict === "all" || r.verdict === verdict)).sort(
      (a, b) =>
        (rank.get(a.firm) ?? 99) - (rank.get(b.firm) ?? 99) ||
        VERDICT_ORDER.indexOf(a.verdict) - VERDICT_ORDER.indexOf(b.verdict) ||
        b.date.localeCompare(a.date)
    );
  }, [firm, verdict, firmStats]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">미국 공매도 리포트</h1>
        <p className="mt-1 text-sm text-neutral-500">
          미국 상장사를 대상으로 한 행동주의 공매도 리포트를 모았어요. 리서치 회사는 적중률 순으로 정렬돼 있어요.
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          공매도 리포트는 주가에 영향을 주려고 공개하는 자료라서 모두 무료예요. &quot;리포트 보기&quot;를 누르면 각 회사
          사이트의 원문(PDF 또는 웹페이지)이 열려요. 일부 사이트는 처음 들어갈 때 면책 조항 동의를 요구할 수 있어요.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">리서치 회사 신뢰도 순위</h2>
        <Card>
          <CardContent className="overflow-x-auto pt-4">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800">
                  <th className="py-2 pr-2">#</th>
                  <th className="py-2 pr-2">회사</th>
                  <th className="py-2 pr-2 text-right">보정 점수</th>
                  <th className="py-2 pr-2 text-right">단순 적중률</th>
                  <th className="py-2 pr-2 text-right">적중/부분/미적중</th>
                  <th className="py-2 text-right">리포트 수</th>
                </tr>
              </thead>
              <tbody>
                {firmStats.map((f, i) => (
                  <tr
                    key={f.name}
                    onClick={() => setFirm(firm === f.name ? "all" : f.name)}
                    className={cn(
                      "cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50",
                      firm === f.name && "bg-blue-50 dark:bg-blue-950/40"
                    )}
                  >
                    <td className="py-2 pr-2 text-neutral-400">{i + 1}</td>
                    <td className="py-2 pr-2">
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-neutral-500">{f.note}</div>
                    </td>
                    <td className="py-2 pr-2 text-right font-semibold tabular-nums">
                      {f.resolved ? pct(f.adjustedScore) : "평가 불가"}
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums">{pct(f.rawRate)}</td>
                    <td className="py-2 pr-2 text-right tabular-nums">
                      {f.hits}/{f.partials}/{f.misses}
                    </td>
                    <td className="py-2 text-right tabular-nums">{f.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs leading-relaxed text-neutral-500">
              판정 기준: 사기·회계부정이 자백, 규제기관 조치, 상장폐지로 입증되거나 밸류에이션 숏 이후 주가가 장기간 크게
              떨어지면 &quot;적중&quot;이에요. 주가는 떨어졌지만 핵심 주장이 입증되지 않았으면 &quot;부분 적중&quot;, 아무 조치가 없고 주가가
              발표 시점보다 높으면 &quot;미적중&quot;이에요. 점수는 적중 1점, 부분 적중 0.5점, 미적중 0점이에요. &quot;진행 중&quot;인 리포트는 점수에서 빼요. 보정 점수는
              (점수 합 + 1) ÷ (판정된 리포트 수 + 2)로 계산해서, 리포트가 1~2개뿐인 회사가 100%로 1위가 되는 것을 막아요.
              이 페이지에 모은 리포트만 기준으로 한 점수라서 공식 통계가 아니에요. 유명한 적중 사례 위주로 모았기 때문에
              실제 적중률보다 높게 나올 수 있어요.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-lg font-semibold">리포트 ({reports.length})</h2>
          <select
            value={firm}
            onChange={(e) => setFirm(e.target.value)}
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="all">전체 회사</option>
            {firmStats.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
          <select
            value={verdict}
            onChange={(e) => setVerdict(e.target.value as Verdict | "all")}
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="all">전체 결과</option>
            {VERDICT_ORDER.map((v) => (
              <option key={v} value={v}>
                {VERDICT_META[v].label}
              </option>
            ))}
          </select>
        </div>

        {reports.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-col gap-2 pt-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={cn("rounded px-2 py-0.5 font-medium", VERDICT_META[r.verdict].className)}>
                  {VERDICT_META[r.verdict].label}
                </span>
                <span className="font-mono font-semibold">{r.ticker}</span>
                <span className="text-neutral-500">{r.company}</span>
                <span className="ml-auto text-neutral-500">
                  {r.firm} · {r.date}
                </span>
              </div>
              <h3 className="font-medium leading-snug">{r.title}</h3>
              <dl className="grid gap-1 text-sm">
                <div>
                  <dt className="inline font-medium text-neutral-500">주장 · </dt>
                  <dd className="inline">{r.claims}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-neutral-500">결과 · </dt>
                  <dd className="inline">{r.outcome}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {r.reportUrl && (
                  <a
                    href={r.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    리포트 보기 <ExternalLink size={13} />
                  </a>
                )}
                {r.evidence?.map((e) => (
                  <a
                    key={e.url}
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 hover:underline dark:hover:text-neutral-200"
                  >
                    {e.label} <ExternalLink size={13} />
                  </a>
                ))}
              </div>
              {r.reportUrlNote && <p className="text-xs text-neutral-400">{r.reportUrlNote}</p>}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
