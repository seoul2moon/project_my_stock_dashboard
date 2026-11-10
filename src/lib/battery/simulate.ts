import { CHOKEPOINTS, EDGES, NODES, NODE_BY_ID, chokepointsForEdge } from "./data";
import type { Material, Scenario, Stage, SupplyEdge } from "./types";

export const EMPTY_SCENARIO: Scenario = { production: {}, disruption: {}, buffer: 0 };

/** 경로별 통과 병목은 정적이므로 한 번만 계산 */
export const EDGE_CHOKEPOINTS: string[][] = EDGES.map(chokepointsForEdge);
const CP_LOSS = Object.fromEntries(CHOKEPOINTS.map((c) => [c.id, c.lossFactor]));

const INBOUND: Record<string, number[]> = {};
EDGES.forEach((e, i) => {
  (INBOUND[e.to] ??= []).push(i);
});

export interface MaterialSupply {
  material: Material;
  /** 해당 원재료 조달 가능률 (완충 적용 후, 0~1) */
  supply: number;
}

export interface NodeResult {
  /** 실제 산출률 (0~1.2). 1 = 평소 수준 */
  output: number;
  /** 사용자가 설정한 목표 가동률 */
  target: number;
  /** 원재료 부족으로 제한된 가동 가능률 (0~1) */
  inputLimit: number;
  /** 가장 부족한 원재료 */
  limitingMaterial?: Material;
  supplies: MaterialSupply[];
}

export interface SimulationResult {
  nodes: Record<string, NodeResult>;
  /** 경로별 실제 흐름 비율 (평소 대비) */
  edgeFlow: number[];
  /** 경로별 병목 통과 계수 (0~1) */
  edgePass: number[];
  /** 전세계 배터리 수요 충족 손실 (GWh) */
  demandLossGWh: number;
  totalDemandGWh: number;
  stageLoss: Record<Stage, number>;
}

function edgePassFactor(i: number, s: Scenario): number {
  let f = 1;
  for (const cp of EDGE_CHOKEPOINTS[i]) {
    const level = s.disruption[cp] ?? 0;
    if (level > 0) f *= 1 - level * CP_LOSS[cp];
  }
  return f;
}

/**
 * 공급망 전파 시뮬레이션 (레온티예프형 단순 모델).
 *
 * 노드 산출률 = min(목표 가동률, 원재료 제약)
 * 원재료 m 조달률 = (기타 공급원 비중) + Σ(경로 비중 × 상류 산출률 × 병목 통과율)
 * 원재료 제약 = min_m [ 1 − 의존도_m × (1 − 조달률_m) ]
 */
export function simulate(s: Scenario): SimulationResult {
  const edgePass = EDGES.map((_, i) => edgePassFactor(i, s));
  const nodes: Record<string, NodeResult> = {};

  const visit = (id: string): number => {
    if (nodes[id]) return nodes[id].output;
    const node = NODE_BY_ID[id];
    const target = s.production[id] ?? 1;

    // 원재료별 조달률 계산
    const byMat = new Map<Material, { got: number; share: number }>();
    for (const i of INBOUND[id] ?? []) {
      const e = EDGES[i];
      const up = visit(e.from);
      const acc = byMat.get(e.material) ?? { got: 0, share: 0 };
      acc.got += e.share * up * edgePass[i];
      acc.share += e.share;
      byMat.set(e.material, acc);
    }

    let inputLimit = 1;
    let limitingMaterial: Material | undefined;
    const supplies: MaterialSupply[] = [];
    for (const [material, { got, share }] of byMat) {
      const raw = Math.min(1, 1 - share + got);
      const supply = 1 - (1 - raw) * (1 - s.buffer);
      supplies.push({ material, supply });
      const dep = node.requires?.[material] ?? 1;
      const limit = 1 - dep * (1 - supply);
      if (limit < inputLimit - 1e-9) {
        inputLimit = limit;
        limitingMaterial = material;
      }
    }

    const output = Math.max(0, Math.min(target, inputLimit));
    nodes[id] = { output, target, inputLimit, limitingMaterial, supplies };
    return output;
  };

  NODES.forEach((n) => visit(n.id));

  const edgeFlow = EDGES.map((e, i) => nodes[e.from].output * edgePass[i]);

  let demandLossGWh = 0;
  let totalDemandGWh = 0;
  for (const n of NODES) {
    if (!n.demandGWh) continue;
    totalDemandGWh += n.demandGWh;
    demandLossGWh += n.demandGWh * Math.max(0, 1 - nodes[n.id].output);
  }

  const stageLoss = {} as Record<Stage, number>;
  for (const stage of ["mine", "refine", "material", "cell", "demand"] as Stage[]) {
    const list = NODES.filter((n) => n.stage === stage);
    stageLoss[stage] = list.reduce((sum, n) => sum + Math.max(0, 1 - nodes[n.id].output), 0) / list.length;
  }

  return { nodes, edgeFlow, edgePass, demandLossGWh, totalDemandGWh, stageLoss };
}

export interface CriticalityItem {
  id: string;
  kind: "node" | "chokepoint";
  name: string;
  lossGWh: number;
}

/**
 * 병목 랭킹: 각 노드/병목을 하나씩 "완전 중단"시켰을 때 사라지는 전세계 배터리 수요(GWh).
 * 현재 시나리오 위에서 추가 충격을 계산하므로 "지금 상태에서 가장 취약한 곳"을 보여줌.
 */
export function rankCriticality(base: Scenario, baseLoss: number): CriticalityItem[] {
  const items: CriticalityItem[] = [];
  for (const n of NODES) {
    if (n.stage === "demand") continue;
    const r = simulate({ ...base, production: { ...base.production, [n.id]: 0 } });
    items.push({ id: n.id, kind: "node", name: n.name, lossGWh: r.demandLossGWh - baseLoss });
  }
  for (const c of CHOKEPOINTS) {
    const r = simulate({ ...base, disruption: { ...base.disruption, [c.id]: 1 } });
    items.push({ id: c.id, kind: "chokepoint", name: c.name, lossGWh: r.demandLossGWh - baseLoss });
  }
  return items.sort((a, b) => b.lossGWh - a.lossGWh);
}

export type ImpactLevel = "up" | "normal" | "minor" | "serious" | "critical";

/** 평소(100%) 대비 감소폭으로 영향 등급 판정 */
export function impactLevel(output: number): ImpactLevel {
  const drop = 1 - output;
  if (drop < -0.005) return "up";
  if (drop < 0.02) return "normal";
  if (drop < 0.1) return "minor";
  if (drop < 0.35) return "serious";
  return "critical";
}

export const IMPACT_META: Record<ImpactLevel, { label: string; color: string }> = {
  up: { label: "증산", color: "#0ca30c" },
  normal: { label: "정상", color: "#898781" },
  minor: { label: "경미 (2~10%↓)", color: "#fab219" },
  serious: { label: "심각 (10~35%↓)", color: "#ec835a" },
  critical: { label: "위기 (35%↓ 이상)", color: "#d03b3b" },
};

export function edgesTouching(id: string): number[] {
  return EDGES.flatMap((e: SupplyEdge, i) => (e.from === id || e.to === id ? [i] : []));
}
