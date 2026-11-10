"use client";

import { useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import { CHOKEPOINTS, EDGES, MATERIAL_LABEL, NODES, NODE_BY_ID, STAGE_LABEL } from "@/lib/battery/data";
import { EDGE_CHOKEPOINTS, IMPACT_META, impactLevel, type SimulationResult } from "@/lib/battery/simulate";
import type { Material, Scenario, Stage } from "@/lib/battery/types";
import { cn } from "@/lib/utils";

const W = 960;
const H = 470;

const projection = geoNaturalEarth1()
  .rotate([-150, 0])
  .fitExtent(
    [
      [8, 8],
      [W - 8, H - 8],
    ],
    {
      type: "MultiPoint",
      coordinates: [
        [-29.9, 72],
        [-29.9, -56],
        [150, 72],
        [150, -56],
        [329.9, 72],
        [329.9, -56],
      ],
    }
  );
const path = geoPath(projection);

const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
const LAND_PATH = path(feature(topo, topo.objects.countries)) ?? "";
const BORDER_PATH = path(mesh(topo, topo.objects.countries, (a, b) => a !== b)) ?? "";
const GRATICULE_PATH = path(geoGraticule10()) ?? "";
const SPHERE_PATH = path({ type: "Sphere" }) ?? "";

function project(lon: number, lat: number): [number, number] {
  return projection([lon, lat]) ?? [0, 0];
}

const NODE_XY: Record<string, [number, number]> = Object.fromEntries(NODES.map((n) => [n.id, project(n.lon, n.lat)]));

/** 경로를 살짝 휘어진 곡선으로 */
const EDGE_PATHS = EDGES.map((e) => {
  const [x1, y1] = NODE_XY[e.from];
  const [x2, y2] = NODE_XY[e.to];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = (x1 + x2) / 2 - dy * 0.18;
  const cy = (y1 + y2) / 2 + dx * 0.18;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
});

export type MapRegion = "world" | "eastasia" | "korea" | "europe" | "namerica";

export const MAP_REGIONS: { id: MapRegion; label: string; bbox?: [number, number, number, number] }[] = [
  { id: "world", label: "전세계" },
  { id: "eastasia", label: "동아시아", bbox: [100, 18, 142, 48] },
  { id: "korea", label: "한국", bbox: [125.6, 33.6, 130.2, 38.2] },
  { id: "europe", label: "유럽", bbox: [5, 44, 28, 65] },
  { id: "namerica", label: "북미", bbox: [-124, 26, -72, 46] },
];

function viewBoxFor(region: MapRegion): [number, number, number, number] {
  const r = MAP_REGIONS.find((m) => m.id === region);
  if (!r?.bbox) return [0, 0, W, H];
  const [lon0, lat0, lon1, lat1] = r.bbox;
  const pts = [
    project(lon0, lat0),
    project(lon1, lat0),
    project(lon0, lat1),
    project(lon1, lat1),
    project((lon0 + lon1) / 2, lat1),
  ];
  let x0 = Math.min(...pts.map((p) => p[0]));
  let x1 = Math.max(...pts.map((p) => p[0]));
  let y0 = Math.min(...pts.map((p) => p[1]));
  let y1 = Math.max(...pts.map((p) => p[1]));
  // 지도 비율 유지
  const aspect = W / H;
  const w = x1 - x0;
  const h = y1 - y0;
  if (w / h > aspect) {
    const nh = w / aspect;
    y0 -= (nh - h) / 2;
    y1 = y0 + nh;
  } else {
    const nw = h * aspect;
    x0 -= (nw - w) / 2;
    x1 = x0 + nw;
  }
  return [x0, y0, x1 - x0, y1 - y0];
}

/** 단계별 마커 모양 (반지름 1 기준) */
const SHAPES: Record<Stage, string> = {
  mine: "M0,-1.25 L1.15,0.85 L-1.15,0.85 Z",
  refine: "M-0.95,-0.95 H0.95 V0.95 H-0.95 Z",
  material: "M0,-1.25 L1.25,0 L0,1.25 L-1.25,0 Z",
  cell: "M1,0 A1,1 0 1,1 -1,0 A1,1 0 1,1 1,0 Z",
  demand: "M1.1,0 L0.55,0.95 L-0.55,0.95 L-1.1,0 L-0.55,-0.95 L0.55,-0.95 Z",
};

export function StageShape({ stage, size = 12, color = "currentColor" }: { stage: Stage; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="-1.4 -1.4 2.8 2.8" aria-hidden>
      <path d={SHAPES[stage]} fill={color} />
    </svg>
  );
}

interface Props {
  result: SimulationResult;
  scenario: Scenario;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  region: MapRegion;
  materialFilter: Material | "all";
}

interface Tip {
  x: number;
  y: number;
  w: number;
  title: string;
  lines: string[];
}

export function SupplyMap({ result, scenario, selectedId, onSelect, region, materialFilter }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  const vb = useMemo(() => viewBoxFor(region), [region]);
  const k = W / vb[2]; // 확대 배율
  const focusId = hoverId ?? selectedId;
  const showLabels = region !== "world";

  const showTip = (evt: React.MouseEvent, title: string, lines: string[]) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ x: evt.clientX - rect.left, y: evt.clientY - rect.top, w: rect.width, title, lines });
  };

  const edgeOrder = useMemo(() => {
    // 영향받은/선택된 경로를 위에 그리도록 정렬
    return EDGES.map((_, i) => i).sort((a, b) => {
      const fa = EDGES[a].from === focusId || EDGES[a].to === focusId ? 1 : 0;
      const fb = EDGES[b].from === focusId || EDGES[b].to === focusId ? 1 : 0;
      return fa - fb || result.edgeFlow[b] - result.edgeFlow[a];
    });
  }, [focusId, result.edgeFlow]);

  return (
    <div ref={wrapRef} className="relative w-full" onMouseLeave={() => setTip(null)}>
      <svg
        viewBox={vb.join(" ")}
        className="block h-auto w-full select-none"
        role="img"
        aria-label="전세계 배터리 공급망 지도"
        onClick={() => onSelect(null)}
      >
        <path d={SPHERE_PATH} className="fill-sky-50 dark:fill-neutral-900" />
        <path d={GRATICULE_PATH} fill="none" className="stroke-neutral-200 dark:stroke-neutral-800" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        <path d={LAND_PATH} className="fill-neutral-200 dark:fill-neutral-800" />
        <path d={BORDER_PATH} fill="none" className="stroke-white dark:stroke-neutral-900" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />

        {/* 물류 경로 */}
        <g fill="none">
          {edgeOrder.map((i) => {
            const e = EDGES[i];
            if (materialFilter !== "all" && e.material !== materialFilter) return null;
            const flow = result.edgeFlow[i];
            const level = impactLevel(flow);
            const isFocus = focusId != null && (e.from === focusId || e.to === focusId);
            const dimmed = focusId != null && !isFocus;
            const impacted = level !== "normal" && level !== "up";
            const color = impacted ? IMPACT_META[level].color : level === "up" ? IMPACT_META.up.color : "#3987e5";
            return (
              <path
                key={i}
                d={EDGE_PATHS[i]}
                stroke={color}
                strokeWidth={0.6 + e.share * 2.6}
                strokeOpacity={dimmed ? 0.06 : isFocus ? 0.95 : impacted ? 0.8 : 0.32}
                strokeDasharray={isFocus ? "6 4" : undefined}
                className={isFocus ? "battery-flow" : undefined}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                onMouseMove={(evt) =>
                  showTip(evt, `${NODE_BY_ID[e.from].name} → ${NODE_BY_ID[e.to].name}`, [
                    `${MATERIAL_LABEL[e.material]} · 조달 비중 ${(e.share * 100).toFixed(0)}%`,
                    `현재 흐름: 평소의 ${(flow * 100).toFixed(0)}%`,
                    ...(EDGE_CHOKEPOINTS[i].length
                      ? [`경유 병목: ${EDGE_CHOKEPOINTS[i].map((c) => CHOKEPOINTS.find((x) => x.id === c)?.name).join(", ")}`]
                      : []),
                  ])
                }
                onMouseLeave={() => setTip(null)}
                style={{ pointerEvents: dimmed ? "none" : "stroke" }}
              />
            );
          })}
        </g>

        {/* 해상 병목 */}
        {CHOKEPOINTS.filter((c) => c.kind === "sea").map((c) => {
          const [x, y] = project(c.lon, c.lat);
          const level = scenario.disruption[c.id] ?? 0;
          const s = 7 / k;
          return (
            <g
              key={c.id}
              transform={`translate(${x},${y})`}
              onMouseMove={(evt) => showTip(evt, `⚓ ${c.name} (${c.nameEn})`, [c.description, `봉쇄 강도: ${(level * 100).toFixed(0)}%`])}
              onMouseLeave={() => setTip(null)}
            >
              <rect
                x={-s}
                y={-s}
                width={s * 2}
                height={s * 2}
                transform="rotate(45)"
                fill={level > 0 ? IMPACT_META.critical.color : "#ffffff"}
                stroke={level > 0 ? "#ffffff" : "#52514e"}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
                fillOpacity={level > 0 ? 0.35 + level * 0.65 : 1}
              />
              {showLabels || level > 0 ? (
                <text y={-s * 1.9} textAnchor="middle" fontSize={11 / k} className="fill-neutral-700 stroke-white font-medium dark:fill-neutral-200 dark:stroke-neutral-900" paintOrder="stroke" strokeWidth={3 / k}>
                  {c.name}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* 노드 */}
        {NODES.map((n) => {
          const [x, y] = NODE_XY[n.id];
          const r = result.nodes[n.id];
          const level = impactLevel(r.output);
          const base = n.stage === "demand" ? 7 : n.stage === "cell" ? 6 : 5;
          const size = (base * (selectedId === n.id ? 1.5 : 1)) / k;
          const dimmed = focusId != null && focusId !== n.id && !EDGES.some((e) => (e.from === focusId && e.to === n.id) || (e.to === focusId && e.from === n.id));
          const fill = level === "normal" ? "#2a78d6" : IMPACT_META[level].color;
          return (
            <g
              key={n.id}
              transform={`translate(${x},${y})`}
              className="cursor-pointer"
              opacity={dimmed ? 0.25 : 1}
              onClick={(evt) => {
                evt.stopPropagation();
                onSelect(selectedId === n.id ? null : n.id);
              }}
              onMouseEnter={() => setHoverId(n.id)}
              onMouseMove={(evt) =>
                showTip(evt, `${n.name}`, [
                  `${n.nameEn} · ${STAGE_LABEL[n.stage]} · ${n.country}`,
                  n.scale,
                  `가동률: ${(r.output * 100).toFixed(0)}% — ${IMPACT_META[level].label}`,
                  ...(r.limitingMaterial && r.inputLimit < 0.999 ? [`부족 원재료: ${MATERIAL_LABEL[r.limitingMaterial]}`] : []),
                ])
              }
              onMouseLeave={() => {
                setHoverId(null);
                setTip(null);
              }}
            >
              {/* 넓은 히트 영역 */}
              <circle r={Math.max(size * 1.8, 10 / k)} fill="transparent" />
              <path d={SHAPES[n.stage]} transform={`scale(${size})`} fill={fill} className="stroke-white dark:stroke-neutral-900" strokeWidth={2 / size / k} />
              {selectedId === n.id ? <circle r={size * 1.9} fill="none" stroke={fill} strokeWidth={1.5} vectorEffect="non-scaling-stroke" /> : null}
              {showLabels ? (
                <text x={size * 1.6} y={4 / k} fontSize={10.5 / k} className="fill-neutral-800 stroke-white dark:fill-neutral-100 dark:stroke-neutral-900" paintOrder="stroke" strokeWidth={3 / k}>
                  {n.name}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {tip ? (
        <div
          className={cn(
            "pointer-events-none absolute z-10 max-w-[280px] rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95"
          )}
          style={{
            left: Math.max(4, Math.min(tip.x + 14, tip.w - 290)),
            top: tip.y + 14,
          }}
        >
          <div className="mb-1 font-semibold text-neutral-900 dark:text-neutral-50">{tip.title}</div>
          {tip.lines.map((l, i) => (
            <div key={i} className="text-neutral-600 dark:text-neutral-300">
              {l}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
