"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MAP_REGIONS, SupplyMap, type MapRegion } from "@/components/battery/supply-map";
import {
  AffectedCompanies,
  ConcentrationCard,
  CriticalityRanking,
  DisruptionControls,
  KpiRow,
  MapLegend,
  NodeDetail,
  StageImpact,
} from "@/components/battery/panels";
import { MATERIALS, PRESETS } from "@/lib/battery/data";
import { EMPTY_SCENARIO, rankCriticality, simulate } from "@/lib/battery/simulate";
import type { Material, Scenario } from "@/lib/battery/types";
import { cn } from "@/lib/utils";

function Chip({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
          : "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      )}
    >
      {children}
    </button>
  );
}

export default function BatterySupplyChainPage() {
  const [scenario, setScenario] = useState<Scenario>(EMPTY_SCENARIO);
  const [presetId, setPresetId] = useState("base");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [region, setRegion] = useState<MapRegion>("world");
  const [materialFilter, setMaterialFilter] = useState<Material | "all">("all");

  const result = useMemo(() => simulate(scenario), [scenario]);
  const ranking = useMemo(() => rankCriticality(scenario, result.demandLossGWh), [scenario, result.demandLossGWh]);

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setScenario({ ...EMPTY_SCENARIO, ...p.scenario, production: { ...p.scenario.production }, disruption: { ...p.scenario.disruption } });
  };

  const update = (fn: (s: Scenario) => Scenario) => {
    setPresetId("custom");
    setScenario(fn);
  };

  const preset = PRESETS.find((p) => p.id === presetId);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold">배터리 공급망 맵</h1>
        <p className="mt-1 text-sm text-neutral-500">
          광산 → 정제 → 소재 → 셀 → 완성차까지, 어디가 막히면 누가 영향을 받는지 시뮬레이션합니다.
          <span className="ml-1 text-neutral-400">Global battery supply chain &amp; bottleneck simulator</span>
        </p>
      </div>

      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {PRESETS.map((p) => (
          <Chip key={p.id} active={presetId === p.id} onClick={() => applyPreset(p.id)} title={p.description}>
            {p.label}
          </Chip>
        ))}
        {presetId === "custom" ? <Chip active onClick={() => {}}>사용자 설정</Chip> : null}
      </div>
      {preset ? <p className="-mt-3 text-xs text-neutral-500">시나리오: {preset.description}</p> : null}

      <KpiRow result={result} topRisk={ranking[0]} />

      <Card>
        <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 overflow-x-auto">
              {MAP_REGIONS.map((r) => (
                <Chip key={r.id} active={region === r.id} onClick={() => setRegion(r.id)}>
                  {r.label}
                </Chip>
              ))}
            </div>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value as Material | "all")}
              className="h-8 rounded-md border border-neutral-200 bg-transparent px-2 text-xs dark:border-neutral-700"
              aria-label="물자 필터"
            >
              <option value="all">모든 물자 경로</option>
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.labelEn})
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-hidden rounded-lg border border-neutral-100 dark:border-neutral-800">
            <SupplyMap
              result={result}
              scenario={scenario}
              selectedId={selectedId}
              onSelect={setSelectedId}
              region={region}
              materialFilter={materialFilter}
            />
          </div>
          <MapLegend />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <NodeDetail
          nodeId={selectedId}
          result={result}
          scenario={scenario}
          onSelect={setSelectedId}
          onProduction={(id, v) => update((s) => ({ ...s, production: { ...s.production, [id]: v } }))}
        />
        <DisruptionControls
          scenario={scenario}
          onDisruption={(id, v) => update((s) => ({ ...s, disruption: { ...s.disruption, [id]: v } }))}
          onBuffer={(v) => update((s) => ({ ...s, buffer: v }))}
          onReset={() => applyPreset("base")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StageImpact result={result} />
        <AffectedCompanies result={result} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CriticalityRanking items={ranking} onSelect={setSelectedId} />
        <ConcentrationCard />
      </div>

      <p className="text-xs leading-relaxed text-neutral-400">
        ※ 모델 안내: 각 거점의 가동률 = min(목표 가동률, 원재료 조달 가능률). 조달 비중에 잡히지 않은 나머지는 &lsquo;기타 공급원&rsquo;으로 정상 공급된다고
        가정합니다. 해상 병목은 우회로(희망봉·순다해협 등)로 일부 커버되는 것을 반영해 손실계수를 낮게 잡았습니다. 수치는 2024~2025년 공개자료 기반
        근사치로 투자 판단의 근거가 아닌 &lsquo;구조 이해용&rsquo; 도구입니다.
      </p>
    </div>
  );
}
