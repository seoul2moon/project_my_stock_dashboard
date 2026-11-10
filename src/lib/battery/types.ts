import type { Market } from "@/lib/types/stock";

/** 공급망 단계 (Supply chain stage) */
export type Stage = "mine" | "refine" | "material" | "cell" | "demand";

/** 흐르는 물자 종류 */
export type Material =
  | "lithium"
  | "nickel"
  | "cobalt"
  | "graphite"
  | "manganese"
  | "cathode"
  | "anode"
  | "cell";

/** 지역 태그 — 해상 경로(병목 통과 여부) 판정에 사용 */
export type Region =
  | "CN" // 중국
  | "KR" // 한국
  | "JP" // 일본
  | "AU" // 호주
  | "SAM" // 남미
  | "AFR" // 아프리카
  | "IDN" // 인도네시아
  | "PHL" // 필리핀
  | "EU" // 유럽
  | "NA"; // 북미

export interface Ticker {
  market: Market;
  symbol: string;
  name: string;
}

export interface SupplyNode {
  id: string;
  name: string;
  /** 영문 명칭 — 영어 공부용 병기 */
  nameEn: string;
  stage: Stage;
  region: Region;
  country: string;
  lat: number;
  lon: number;
  /** 대표 기업/운영사 */
  operator: string;
  /** 규모 설명(추정치) */
  scale: string;
  /**
   * 원재료 의존도: 산출물 중 해당 원재료가 필요한 비율 (0~1).
   * 예) 중국 양극재는 LFP 비중이 커서 니켈 의존도가 낮음.
   */
  requires?: Partial<Record<Material, number>>;
  /** 수요처 노드의 연간 배터리 수요 (GWh, 추정) */
  demandGWh?: number;
  tickers?: Ticker[];
}

export interface SupplyEdge {
  from: string;
  to: string;
  material: Material;
  /** 도착 노드가 해당 물자를 이 경로로 조달하는 비중 (0~1). 나머지는 '기타 공급원'으로 간주 */
  share: number;
}

export interface Chokepoint {
  id: string;
  name: string;
  nameEn: string;
  kind: "sea" | "policy";
  lat: number;
  lon: number;
  /** 완전 봉쇄 시에도 우회로로 일부 커버되는 것을 반영한 실질 손실 계수 (0~1) */
  lossFactor: number;
  description: string;
}

export interface Scenario {
  /** 노드별 생산 가동률 (0~1.2), 기본 1 */
  production: Record<string, number>;
  /** 병목별 봉쇄 강도 (0~1), 기본 0 */
  disruption: Record<string, number>;
  /** 재고·대체조달 완충 (0~0.6) — 하류로 전파되는 부족분을 줄여줌 */
  buffer: number;
}

export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  scenario: Partial<Scenario>;
}
