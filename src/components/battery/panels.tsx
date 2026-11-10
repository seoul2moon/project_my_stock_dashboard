"use client";

import Link from "next/link";
import { AlertTriangle, Anchor, ArrowRight, Landmark, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHOKEPOINTS, CONCENTRATION, EDGES, MATERIAL_LABEL, NODES, NODE_BY_ID, STAGES, STAGE_LABEL } from "@/lib/battery/data";
import { IMPACT_META, impactLevel, type CriticalityItem, type SimulationResult } from "@/lib/battery/simulate";
import type { Scenario, Ticker } from "@/lib/battery/types";
import { cn } from "@/lib/utils";
import { StageShape } from "./supply-map";

const pct = (v: number, digits = 0) => `${(v * 100).toFixed(digits)}%`;

function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
  label,
  valueLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: React.ReactNode;
  valueLabel: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="min-w-0 truncate">{label}</span>
        <span className="shrink-0 font-mono text-xs tabular-nums text-neutral-500">{valueLabel}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </label>
  );
}

export function ImpactBadge({ output }: { output: number }) {
  const level = impactLevel(output);
  const meta = IMPACT_META[level];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-300">
      <span className="inline-block size-2 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

/* ───────── KPI 타일 ───────── */
export function KpiRow({ result, topRisk }: { result: SimulationResult; topRisk?: CriticalityItem }) {
  const fulfilled = 1 - result.demandLossGWh / result.totalDemandGWh;
  const affected = NODES.filter((n) => impactLevel(result.nodes[n.id].output) !== "normal" && impactLevel(result.nodes[n.id].output) !== "up").length;
  const tiles = [
    { label: "세계 배터리 수요 충족률", sub: "Demand fulfilment", value: pct(fulfilled, 1) },
    { label: "공급 부족량", sub: "Shortfall (GWh/yr)", value: `${result.demandLossGWh.toFixed(0)} GWh` },
    { label: "영향받는 거점", sub: "Affected sites", value: `${affected} / ${NODES.length}` },
    { label: "현재 최대 취약점", sub: "Top bottleneck", value: topRisk?.name ?? "-", small: true },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <Card key={t.label}>
          <CardContent className="p-4">
            <div className="text-xs text-neutral-500">{t.label}</div>
            <div className={cn("mt-1 font-semibold text-neutral-900 dark:text-neutral-50", t.small ? "text-base leading-snug" : "text-2xl")}>{t.value}</div>
            <div className="mt-0.5 text-[11px] text-neutral-400">{t.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ───────── 선택 노드 상세 ───────── */
export function NodeDetail({
  nodeId,
  result,
  scenario,
  onProduction,
  onSelect,
}: {
  nodeId: string | null;
  result: SimulationResult;
  scenario: Scenario;
  onProduction: (id: string, v: number) => void;
  onSelect: (id: string) => void;
}) {
  if (!nodeId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>거점 상세 · 생산량 조정</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-500">
          지도에서 광산·공장 아이콘을 클릭하면 이곳에서 <b>생산량을 조정</b>하고, 어떤 하류 거점이 영향을 받는지 볼 수 있어요.
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["cell_catl", "c_korea_ecopro", "m_drc", "r_china_li", "cell_lges_pl"].map((id) => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                {NODE_BY_ID[id].name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const n = NODE_BY_ID[nodeId];
  const r = result.nodes[nodeId];
  const target = scenario.production[nodeId] ?? 1;
  const suppliers = EDGES.map((e, i) => ({ e, i })).filter(({ e }) => e.to === nodeId);
  const customers = EDGES.map((e, i) => ({ e, i })).filter(({ e }) => e.from === nodeId);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <StageShape stage={n.stage} size={10} color="#2a78d6" />
            {STAGE_LABEL[n.stage]} · {n.country}
          </div>
          <h3 className="mt-0.5 font-semibold text-neutral-900 dark:text-neutral-50">{n.name}</h3>
          <div className="text-xs text-neutral-400">{n.nameEn}</div>
        </div>
        <ImpactBadge output={r.output} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-sm text-neutral-600 dark:text-neutral-300">
          <div>운영: {n.operator}</div>
          <div>규모: {n.scale}</div>
        </div>

        {n.stage !== "demand" ? (
          <Slider
            label="목표 가동률 (생산량 조정)"
            value={target}
            min={0}
            max={1.2}
            step={0.05}
            onChange={(v) => onProduction(nodeId, v)}
            valueLabel={`${pct(target)} → 실제 ${pct(r.output)}`}
          />
        ) : (
          <div className="text-sm">
            수요 충족률 <b>{pct(r.output, 1)}</b>
            {n.demandGWh ? <span className="text-neutral-500"> (부족 {(n.demandGWh * (1 - r.output)).toFixed(0)} GWh / {n.demandGWh} GWh)</span> : null}
          </div>
        )}

        {r.inputLimit < 0.999 && r.limitingMaterial ? (
          <div className="flex items-start gap-2 rounded-lg bg-orange-50 p-2.5 text-xs text-orange-900 dark:bg-orange-950/40 dark:text-orange-200">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              <b>{MATERIAL_LABEL[r.limitingMaterial]}</b> 조달 부족으로 최대 {pct(r.inputLimit)}까지만 가동 가능 (원재료 병목).
            </span>
          </div>
        ) : null}

        {r.supplies.length ? (
          <div>
            <div className="mb-1.5 text-xs font-medium text-neutral-500">원재료 조달률 (Input availability)</div>
            <div className="flex flex-col gap-1.5">
              {r.supplies.map((s) => (
                <div key={s.material} className="flex items-center gap-2 text-xs">
                  <span className="w-14 shrink-0">{MATERIAL_LABEL[s.material]}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className="h-full rounded-full" style={{ width: pct(s.supply), background: IMPACT_META[impactLevel(s.supply)].color === "#898781" ? "#2a78d6" : IMPACT_META[impactLevel(s.supply)].color }} />
                  </div>
                  <span className="w-10 text-right font-mono tabular-nums">{pct(s.supply)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <FlowList title="공급처 (Suppliers)" items={suppliers.map(({ e, i }) => ({ id: e.from, material: e.material, share: e.share, flow: result.edgeFlow[i] }))} onSelect={onSelect} />
        <FlowList title="고객사 (Customers)" items={customers.map(({ e, i }) => ({ id: e.to, material: e.material, share: e.share, flow: result.edgeFlow[i] }))} onSelect={onSelect} shareLabel="상대 조달비중" />

        {n.tickers?.length ? <TickerLinks tickers={n.tickers} /> : null}
      </CardContent>
    </Card>
  );
}

function FlowList({
  title,
  items,
  onSelect,
  shareLabel = "비중",
}: {
  title: string;
  items: { id: string; material: keyof typeof MATERIAL_LABEL; share: number; flow: number }[];
  onSelect: (id: string) => void;
  shareLabel?: string;
}) {
  if (!items.length) return null;
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-neutral-500">{title}</div>
      <ul className="divide-y divide-neutral-100 text-xs dark:divide-neutral-800">
        {items.map((it) => (
          <li key={`${it.id}-${it.material}`} className="flex items-center gap-2 py-1.5">
            <button onClick={() => onSelect(it.id)} className="min-w-0 flex-1 truncate text-left hover:text-blue-600 hover:underline">
              {NODE_BY_ID[it.id].name}
            </button>
            <span className="shrink-0 text-neutral-400">
              {MATERIAL_LABEL[it.material]} · {shareLabel} {pct(it.share)}
            </span>
            <span className="w-16 shrink-0 text-right">
              <ImpactBadgeCompact value={it.flow} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImpactBadgeCompact({ value }: { value: number }) {
  const level = impactLevel(value);
  return (
    <span className="inline-flex items-center justify-end gap-1 font-mono tabular-nums">
      <span className="inline-block size-1.5 rounded-full" style={{ background: IMPACT_META[level].color }} />
      {pct(value)}
    </span>
  );
}

function TickerLinks({ tickers }: { tickers: Ticker[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tickers.map((t) => (
        <Link
          key={`${t.market}-${t.symbol}`}
          href={`/stock/${t.market}/${t.symbol}`}
          className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300"
        >
          {t.name} <span className="text-blue-400">{t.symbol}</span>
        </Link>
      ))}
    </div>
  );
}

/* ───────── 병목/정책 리스크 컨트롤 ───────── */
export function DisruptionControls({
  scenario,
  onDisruption,
  onBuffer,
  onReset,
}: {
  scenario: Scenario;
  onDisruption: (id: string, v: number) => void;
  onBuffer: (v: number) => void;
  onReset: () => void;
}) {
  const productionChanged = Object.entries(scenario.production).filter(([, v]) => v !== 1);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>병목 · 정책 리스크 (Chokepoints)</CardTitle>
        <button onClick={onReset} className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
          <RotateCcw size={12} /> 초기화
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {CHOKEPOINTS.map((c) => {
          const v = scenario.disruption[c.id] ?? 0;
          return (
            <Slider
              key={c.id}
              value={v}
              onChange={(val) => onDisruption(c.id, val)}
              label={
                <span className="inline-flex items-center gap-1.5" title={c.description}>
                  {c.kind === "sea" ? <Anchor size={13} className="shrink-0 text-sky-600" /> : <Landmark size={13} className="shrink-0 text-violet-600" />}
                  {c.name}
                </span>
              }
              valueLabel={v === 0 ? "정상" : `${pct(v)} 차질`}
            />
          );
        })}
        <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <Slider
            value={scenario.buffer}
            onChange={onBuffer}
            max={0.6}
            label="재고·대체조달 완충 (Buffer)"
            valueLabel={pct(scenario.buffer)}
          />
          <p className="mt-1 text-[11px] text-neutral-400">
            각 단계에서 부족분의 일부를 재고·다른 공급처로 메운다고 가정. 단기(1~3개월) 충격은 높게, 장기 충격은 낮게 두세요.
          </p>
        </div>
        {productionChanged.length ? (
          <div className="border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
            <div className="mb-1 font-medium text-neutral-500">생산량 조정 중인 거점</div>
            <ul className="flex flex-col gap-0.5">
              {productionChanged.map(([id, v]) => (
                <li key={id} className="flex justify-between">
                  <span>{NODE_BY_ID[id].name}</span>
                  <span className="font-mono tabular-nums">{pct(v)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/* ───────── 단계별 영향 ───────── */
export function StageImpact({ result }: { result: SimulationResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>단계별 평균 가동 손실 (Loss by stage)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        {STAGES.map((s) => {
          const loss = result.stageLoss[s.id];
          const color = IMPACT_META[impactLevel(1 - loss)].color;
          return (
            <div key={s.id} className="flex items-center gap-2 text-sm">
              <span className="flex w-20 shrink-0 items-center gap-1.5">
                <StageShape stage={s.id} size={10} color="#898781" />
                {s.label}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className="h-full rounded-full transition-all" style={{ width: pct(Math.min(1, loss)), background: loss < 0.02 ? "#2a78d6" : color, minWidth: loss > 0 ? 4 : 0 }} />
              </div>
              <span className="w-12 text-right font-mono text-xs tabular-nums">{loss < 0.0005 ? "0.0%" : `-${pct(loss, 1)}`}</span>
            </div>
          );
        })}
        <p className="text-[11px] text-neutral-400">상류(채굴)의 충격이 하류(셀·수요)로 갈수록 어떻게 증폭·완화되는지 비교해 보세요.</p>
      </CardContent>
    </Card>
  );
}

/* ───────── 영향받는 상장사 ───────── */
export function AffectedCompanies({ result }: { result: SimulationResult }) {
  const map = new Map<string, { t: Ticker; worst: number; sites: string[] }>();
  for (const n of NODES) {
    const out = result.nodes[n.id].output;
    for (const t of n.tickers ?? []) {
      const key = `${t.market}-${t.symbol}`;
      const cur = map.get(key) ?? { t, worst: 1, sites: [] };
      if (out < 0.98) cur.sites.push(`${n.name} ${pct(out)}`);
      cur.worst = Math.min(cur.worst, out);
      map.set(key, cur);
    }
  }
  const list = [...map.values()].sort((a, b) => a.worst - b.worst);
  return (
    <Card>
      <CardHeader>
        <CardTitle>관련 상장사 영향 (Listed companies exposed)</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {list.map(({ t, worst, sites }) => (
            <li key={`${t.market}-${t.symbol}`} className="flex items-center gap-2 py-2 text-sm">
              <Link href={`/stock/${t.market}/${t.symbol}`} className="min-w-0 flex-1 hover:text-blue-600">
                <div className="flex items-center gap-1.5 font-medium">
                  {t.name}
                  <span className="text-xs font-normal text-neutral-400">
                    {t.market} {t.symbol}
                  </span>
                </div>
                {sites.length ? <div className="truncate text-xs text-neutral-500">{sites.join(" · ")}</div> : null}
              </Link>
              <ImpactBadge output={worst} />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-neutral-400">가장 크게 타격받는 거점 기준. 주가 영향은 가격 전가·재고·계약 구조에 따라 반대로 나타날 수도 있어요 (예: 공급 부족 → 리튬 가격 상승 → 광산주 수혜).</p>
      </CardContent>
    </Card>
  );
}

/* ───────── 병목 랭킹 ───────── */
export function CriticalityRanking({ items, onSelect }: { items: CriticalityItem[]; onSelect: (id: string) => void }) {
  const top = items.slice(0, 10);
  const max = Math.max(1, ...top.map((t) => t.lossGWh));
  return (
    <Card>
      <CardHeader>
        <CardTitle>병목 랭킹 — 멈추면 가장 아픈 곳 (Single points of failure)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {top.map((it, idx) => (
          <button
            key={it.id}
            onClick={() => it.kind === "node" && onSelect(it.id)}
            className={cn("group flex items-center gap-2 text-left text-sm", it.kind === "node" ? "cursor-pointer" : "cursor-default")}
          >
            <span className="w-5 shrink-0 text-right font-mono text-xs text-neutral-400">{idx + 1}</span>
            <span className="flex w-40 shrink-0 items-center gap-1.5 truncate group-hover:text-blue-600 sm:w-56">
              {it.kind === "chokepoint" ? <Anchor size={12} className="shrink-0 text-neutral-400" /> : <StageShape stage={NODE_BY_ID[it.id].stage} size={10} color="#898781" />}
              <span className="truncate">{it.name}</span>
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-full rounded-full bg-[#2a78d6]" style={{ width: pct(it.lossGWh / max) }} />
            </div>
            <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums">{it.lossGWh.toFixed(0)} GWh</span>
          </button>
        ))}
        <p className="mt-1 text-[11px] text-neutral-400">
          현재 시나리오에서 해당 거점이 100% 멈추거나 병목이 완전 봉쇄될 때 추가로 사라지는 세계 배터리 공급량(연간 GWh).
        </p>
      </CardContent>
    </Card>
  );
}

/* ───────── 공급 집중도 ───────── */
export function ConcentrationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>국가 집중도 — 1위 국가 점유율 (Market concentration)</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {CONCENTRATION.map((c) => (
          <div key={c.step} className="flex items-center gap-2 text-sm">
            <span className="w-40 shrink-0 sm:w-48">
              <span className="block truncate">{c.step}</span>
              <span className="block truncate text-[11px] text-neutral-400">{c.stepEn}</span>
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-full rounded-full" style={{ width: pct(c.share), background: c.share >= 0.7 ? IMPACT_META.critical.color : c.share >= 0.5 ? IMPACT_META.serious.color : "#2a78d6" }} />
            </div>
            <span className="w-24 shrink-0 text-right text-xs">
              {c.top} <span className="font-mono tabular-nums">{pct(c.share)}</span>
            </span>
          </div>
        ))}
        <p className="mt-1 text-[11px] text-neutral-400">IEA Global Critical Minerals Outlook 2024·2025 등 공개자료 기반 근사치. 70% 이상은 빨강, 50% 이상은 주황.</p>
      </CardContent>
    </Card>
  );
}

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
      {STAGES.map((s) => (
        <span key={s.id} className="inline-flex items-center gap-1">
          <StageShape stage={s.id} size={11} color="#2a78d6" />
          {s.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <svg width={11} height={11} viewBox="-1.4 -1.4 2.8 2.8" aria-hidden>
          <rect x={-0.8} y={-0.8} width={1.6} height={1.6} transform="rotate(45)" fill="white" stroke="#52514e" strokeWidth={0.3} />
        </svg>
        해상 병목
      </span>
      <span className="mx-1 hidden h-3 w-px bg-neutral-300 sm:inline-block dark:bg-neutral-700" />
      {(["normal", "minor", "serious", "critical", "up"] as const).map((l) => (
        <span key={l} className="inline-flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-full" style={{ background: l === "normal" ? "#2a78d6" : IMPACT_META[l].color }} />
          {l === "normal" ? "정상" : IMPACT_META[l].label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1 text-neutral-400">
        <ArrowRight size={11} /> 선 굵기 = 조달 비중
      </span>
    </div>
  );
}
