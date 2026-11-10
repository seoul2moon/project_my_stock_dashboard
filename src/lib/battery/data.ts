/**
 * 전세계 배터리 공급망 데이터 (2024~2025년 공개자료 기반 근사치).
 *
 * 수치는 IEA Global Critical Minerals Outlook, USGS Mineral Commodity Summaries,
 * 각 사 IR 자료 등에서 공개된 비중을 단순화한 "추정치"이며,
 * 실제 계약 물량·지분 구조와 다를 수 있습니다. 시나리오 분석용 모델입니다.
 */
import type {
  Chokepoint,
  Material,
  Region,
  ScenarioPreset,
  Stage,
  SupplyEdge,
  SupplyNode,
  Ticker,
} from "./types";

const T = {
  ALB: { market: "US", symbol: "ALB", name: "Albemarle" },
  SQM: { market: "US", symbol: "SQM", name: "SQM" },
  TSLA: { market: "US", symbol: "TSLA", name: "Tesla" },
  GM: { market: "US", symbol: "GM", name: "General Motors" },
  F: { market: "US", symbol: "F", name: "Ford" },
  TM: { market: "US", symbol: "TM", name: "Toyota" },
  POSCO: { market: "KR", symbol: "005490", name: "POSCO홀딩스" },
  POSCOFM: { market: "KR", symbol: "003670", name: "포스코퓨처엠" },
  ECOPRO: { market: "KR", symbol: "247540", name: "에코프로비엠" },
  LNF: { market: "KR", symbol: "066970", name: "엘앤에프" },
  LGES: { market: "KR", symbol: "373220", name: "LG에너지솔루션" },
  SDI: { market: "KR", symbol: "006400", name: "삼성SDI" },
  SKI: { market: "KR", symbol: "096770", name: "SK이노베이션" },
  HMC: { market: "KR", symbol: "005380", name: "현대차" },
  KIA: { market: "KR", symbol: "000270", name: "기아" },
} satisfies Record<string, Ticker>;

export const STAGES: { id: Stage; label: string; labelEn: string }[] = [
  { id: "mine", label: "채굴", labelEn: "Mining" },
  { id: "refine", label: "정제", labelEn: "Refining" },
  { id: "material", label: "소재", labelEn: "Materials" },
  { id: "cell", label: "셀", labelEn: "Cell" },
  { id: "demand", label: "수요", labelEn: "Demand" },
];

export const MATERIALS: { id: Material; label: string; labelEn: string }[] = [
  { id: "lithium", label: "리튬", labelEn: "Lithium" },
  { id: "nickel", label: "니켈", labelEn: "Nickel" },
  { id: "cobalt", label: "코발트", labelEn: "Cobalt" },
  { id: "graphite", label: "흑연", labelEn: "Graphite" },
  { id: "manganese", label: "망간", labelEn: "Manganese" },
  { id: "cathode", label: "양극재", labelEn: "Cathode" },
  { id: "anode", label: "음극재", labelEn: "Anode" },
  { id: "cell", label: "배터리셀", labelEn: "Battery cell" },
];

export const MATERIAL_LABEL = Object.fromEntries(MATERIALS.map((m) => [m.id, m.label])) as Record<
  Material,
  string
>;
export const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.id, s.label])) as Record<Stage, string>;

const HIGH_NI_CATHODE = { lithium: 1, nickel: 1, cobalt: 0.9, manganese: 0.5 };
const CELL = { cathode: 1, anode: 1 };

export const NODES: SupplyNode[] = [
  // ───────── 채굴 (Mining) ─────────
  { id: "m_greenbushes", name: "그린부시스 리튬광산", nameEn: "Greenbushes", stage: "mine", region: "AU", country: "호주", lat: -33.86, lon: 116.06, operator: "Talison (Tianqi·IGO·Albemarle)", scale: "세계 최대 경암 리튬광 (리튬 채굴의 ~15%)", tickers: [T.ALB] },
  { id: "m_pilbara", name: "필바라 리튬광산", nameEn: "Pilgangoora", stage: "mine", region: "AU", country: "호주", lat: -21.0, lon: 118.9, operator: "Pilbara Minerals", scale: "스포듀민 정광 ~70만t/년", tickers: [T.POSCO] },
  { id: "m_atacama", name: "아타카마 염호", nameEn: "Salar de Atacama", stage: "mine", region: "SAM", country: "칠레", lat: -23.5, lon: -68.2, operator: "SQM·Albemarle", scale: "염호 리튬 (세계 ~20%)", tickers: [T.SQM, T.ALB] },
  { id: "m_argentina", name: "아르헨티나 리튬 삼각지대", nameEn: "Lithium Triangle (AR)", stage: "mine", region: "SAM", country: "아르헨티나", lat: -25.4, lon: -67.0, operator: "Rio Tinto(Arcadium)·POSCO 등", scale: "신규 증설 중 (세계 ~6%)", tickers: [T.POSCO] },
  { id: "m_zimbabwe", name: "짐바브웨 리튬", nameEn: "Zimbabwe lithium", stage: "mine", region: "AFR", country: "짐바브웨", lat: -17.6, lon: 31.0, operator: "중국계 (Huayou·Sinomine 등)", scale: "세계 ~8%" },
  { id: "m_china_li", name: "중국 리튬 (칭하이·이춘)", nameEn: "China lithium (Qinghai/Yichun)", stage: "mine", region: "CN", country: "중국", lat: 36.6, lon: 95.0, operator: "CATL·Zangge 등", scale: "세계 ~17% (염호+레피도라이트)" },
  { id: "m_sulawesi", name: "인니 니켈광 (술라웨시)", nameEn: "Sulawesi nickel", stage: "mine", region: "IDN", country: "인도네시아", lat: -4.2, lon: 121.6, operator: "Vale·Harita·Tsingshan 등", scale: "세계 니켈 채굴 ~55%" },
  { id: "m_philippines", name: "필리핀 니켈광", nameEn: "Philippine nickel", stage: "mine", region: "PHL", country: "필리핀", lat: 9.8, lon: 125.5, operator: "Nickel Asia 등", scale: "세계 ~10% (원광 수출)" },
  { id: "m_drc", name: "콩고민주공화국 코발트", nameEn: "DRC Copperbelt cobalt", stage: "mine", region: "AFR", country: "DR콩고", lat: -10.7, lon: 25.5, operator: "CMOC·Glencore 등", scale: "세계 코발트 채굴 ~75%" },
  { id: "m_heilongjiang", name: "중국 천연흑연 (헤이룽장)", nameEn: "Heilongjiang graphite", stage: "mine", region: "CN", country: "중국", lat: 45.8, lon: 130.9, operator: "중국 다수", scale: "세계 천연흑연 ~75%" },
  { id: "m_mozambique", name: "모잠비크 흑연 (발라마)", nameEn: "Balama graphite", stage: "mine", region: "AFR", country: "모잠비크", lat: -13.3, lon: 38.6, operator: "Syrah Resources", scale: "중국 외 최대 흑연광" },
  { id: "m_sa_mn", name: "남아공 망간 (칼라하리)", nameEn: "Kalahari manganese", stage: "mine", region: "AFR", country: "남아공", lat: -27.2, lon: 22.9, operator: "South32·Assmang 등", scale: "세계 망간 ~35%" },

  // ───────── 정제 (Refining) ─────────
  { id: "r_china_li", name: "중국 리튬 정제 (장시·쓰촨)", nameEn: "China lithium refining", stage: "refine", region: "CN", country: "중국", lat: 28.0, lon: 114.4, operator: "Ganfeng·Tianqi·Yahua 등", scale: "세계 리튬 화학 ~65%", requires: { lithium: 1 } },
  { id: "r_chile_li", name: "칠레 탄산리튬 (안토파가스타)", nameEn: "Chile lithium carbonate", stage: "refine", region: "SAM", country: "칠레", lat: -23.6, lon: -70.4, operator: "SQM·Albemarle", scale: "세계 리튬 화학 ~20%", requires: { lithium: 1 }, tickers: [T.SQM, T.ALB] },
  { id: "r_aus_li", name: "호주 수산화리튬 (퀴나나)", nameEn: "Kwinana hydroxide", stage: "refine", region: "AU", country: "호주", lat: -32.2, lon: 115.8, operator: "Tianqi·IGO, Albemarle", scale: "소규모 (램프업 지연)", requires: { lithium: 1 }, tickers: [T.ALB] },
  { id: "r_korea_li", name: "한국 수산화리튬 (광양)", nameEn: "Gwangyang hydroxide", stage: "refine", region: "KR", country: "한국", lat: 34.72, lon: 127.5, operator: "포스코필바라리튬솔루션", scale: "수산화리튬 ~4만t/년", requires: { lithium: 1 }, tickers: [T.POSCO] },
  { id: "r_indo_ni", name: "인니 니켈 제련 (모로왈리)", nameEn: "Morowali HPAL/matte", stage: "refine", region: "IDN", country: "인도네시아", lat: -2.8, lon: 121.9, operator: "Tsingshan·Huayou·GEM 등 중국계", scale: "MHP·니켈매트 (배터리용 니켈 최대 공급지)", requires: { nickel: 1 } },
  { id: "r_china_co", name: "중국 코발트·니켈 정제 (저장)", nameEn: "China Co/Ni refining", stage: "refine", region: "CN", country: "중국", lat: 30.6, lon: 120.5, operator: "Huayou·GEM·CNGR 등", scale: "세계 코발트 정제 ~75%, 전구체 ~80%", requires: { cobalt: 0.6, nickel: 0.7 } },
  { id: "r_japan_ni", name: "일본 니켈 정제 (니하마)", nameEn: "Niihama nickel refinery", stage: "refine", region: "JP", country: "일본", lat: 33.96, lon: 133.28, operator: "Sumitomo Metal Mining", scale: "배터리용 황산니켈", requires: { nickel: 1 } },
  { id: "r_finland_co", name: "핀란드 코발트 정제 (코콜라)", nameEn: "Kokkola cobalt refinery", stage: "refine", region: "EU", country: "핀란드", lat: 63.8, lon: 23.1, operator: "Umicore", scale: "중국 외 최대 코발트 정제", requires: { cobalt: 1 } },

  // ───────── 소재 (Materials: 양극재·음극재) ─────────
  { id: "c_china", name: "중국 양극재 클러스터", nameEn: "China cathode cluster", stage: "material", region: "CN", country: "중국", lat: 28.2, lon: 112.9, operator: "Hunan Yuneng·Dynanonic·Ronbay 등", scale: "세계 양극재 ~75% (LFP 중심)", requires: { lithium: 1, nickel: 0.35, cobalt: 0.3, manganese: 0.3 } },
  { id: "c_korea_ecopro", name: "에코프로비엠 (포항)", nameEn: "EcoPro BM Pohang", stage: "material", region: "KR", country: "한국", lat: 36.05, lon: 129.4, operator: "에코프로비엠", scale: "하이니켈 양극재 ~18만t/년", requires: HIGH_NI_CATHODE, tickers: [T.ECOPRO] },
  { id: "c_korea_lnf", name: "엘앤에프 (대구)", nameEn: "L&F Daegu", stage: "material", region: "KR", country: "한국", lat: 35.87, lon: 128.6, operator: "엘앤에프", scale: "NCMA 양극재", requires: HIGH_NI_CATHODE, tickers: [T.LNF] },
  { id: "c_korea_posco", name: "포스코퓨처엠 양극재 (광양)", nameEn: "POSCO Future M cathode", stage: "material", region: "KR", country: "한국", lat: 35.05, lon: 127.8, operator: "포스코퓨처엠", scale: "양극재 ~10만t/년+", requires: HIGH_NI_CATHODE, tickers: [T.POSCOFM] },
  { id: "c_japan", name: "일본 양극재 (스미토모·니치아)", nameEn: "Japan cathode", stage: "material", region: "JP", country: "일본", lat: 33.9, lon: 134.6, operator: "Sumitomo Metal Mining·Nichia", scale: "NCA (파나소닉 공급)", requires: { lithium: 1, nickel: 1, cobalt: 0.9, manganese: 0.2 } },
  { id: "a_china", name: "중국 음극재 (네이멍구·광둥)", nameEn: "China anode", stage: "material", region: "CN", country: "중국", lat: 40.6, lon: 110.0, operator: "BTR·Shanshan·Putailai 등", scale: "세계 음극재 ~90%", requires: { graphite: 0.45 } },
  { id: "a_korea_posco", name: "포스코퓨처엠 음극재 (세종)", nameEn: "POSCO Future M anode", stage: "material", region: "KR", country: "한국", lat: 36.42, lon: 127.25, operator: "포스코퓨처엠", scale: "국내 유일 천연흑연 음극재", requires: { graphite: 1 }, tickers: [T.POSCOFM] },
  { id: "a_japan", name: "일본 음극재", nameEn: "Japan anode", stage: "material", region: "JP", country: "일본", lat: 35.5, lon: 139.7, operator: "Resonac·Mitsubishi Chemical", scale: "인조흑연 위주 (소규모)", requires: { graphite: 0.6 } },

  // ───────── 셀 (Cell manufacturing) ─────────
  { id: "cell_catl", name: "CATL (닝더)", nameEn: "CATL Ningde", stage: "cell", region: "CN", country: "중국", lat: 26.66, lon: 119.55, operator: "CATL", scale: "세계 점유율 ~37%", requires: CELL },
  { id: "cell_byd", name: "BYD (선전)", nameEn: "BYD Shenzhen", stage: "cell", region: "CN", country: "중국", lat: 22.7, lon: 114.3, operator: "BYD (FinDreams)", scale: "세계 점유율 ~17%", requires: CELL },
  { id: "cell_china_other", name: "중국 기타 셀 (CALB·EVE·Gotion)", nameEn: "Other Chinese cells", stage: "cell", region: "CN", country: "중국", lat: 31.8, lon: 117.2, operator: "CALB·EVE·Gotion 등", scale: "세계 점유율 ~20%", requires: CELL },
  { id: "cell_lges_kr", name: "LG에너지솔루션 오창", nameEn: "LGES Ochang", stage: "cell", region: "KR", country: "한국", lat: 36.72, lon: 127.43, operator: "LG에너지솔루션", scale: "마더팩토리", requires: CELL, tickers: [T.LGES] },
  { id: "cell_lges_pl", name: "LG에너지솔루션 브로츠와프", nameEn: "LGES Wrocław", stage: "cell", region: "EU", country: "폴란드", lat: 51.1, lon: 17.0, operator: "LG에너지솔루션", scale: "유럽 최대 셀 공장 (~70GWh)", requires: CELL, tickers: [T.LGES] },
  { id: "cell_lges_us", name: "얼티엄셀즈·LGES 미시간", nameEn: "Ultium Cells / LGES Michigan", stage: "cell", region: "NA", country: "미국", lat: 41.1, lon: -80.8, operator: "LG에너지솔루션·GM", scale: "북미 ~80GWh+", requires: CELL, tickers: [T.LGES, T.GM] },
  { id: "cell_sdi_kr", name: "삼성SDI 천안·울산", nameEn: "Samsung SDI Korea", stage: "cell", region: "KR", country: "한국", lat: 37.0, lon: 127.1, operator: "삼성SDI", scale: "각형·원통형", requires: CELL, tickers: [T.SDI] },
  { id: "cell_sdi_hu", name: "삼성SDI 괴드", nameEn: "Samsung SDI Göd", stage: "cell", region: "EU", country: "헝가리", lat: 47.7, lon: 19.13, operator: "삼성SDI", scale: "유럽 OEM 공급 (~40GWh)", requires: CELL, tickers: [T.SDI] },
  { id: "cell_skon_us", name: "SK온 커머스 (조지아)", nameEn: "SK On Commerce, GA", stage: "cell", region: "NA", country: "미국", lat: 34.2, lon: -83.46, operator: "SK온", scale: "포드·현대 공급 (~22GWh)", requires: CELL, tickers: [T.SKI] },
  { id: "cell_skon_hu", name: "SK온 이반차 (헝가리)", nameEn: "SK On Iváncsa", stage: "cell", region: "EU", country: "헝가리", lat: 47.15, lon: 18.82, operator: "SK온", scale: "~30GWh", requires: CELL, tickers: [T.SKI] },
  { id: "cell_pana_us", name: "파나소닉 기가팩토리 네바다", nameEn: "Panasonic Gigafactory Nevada", stage: "cell", region: "NA", country: "미국", lat: 39.54, lon: -119.44, operator: "Panasonic·Tesla", scale: "~39GWh 원통형", requires: CELL, tickers: [T.TSLA] },
  { id: "cell_pana_jp", name: "파나소닉 (일본)", nameEn: "Panasonic Japan", stage: "cell", region: "JP", country: "일본", lat: 34.7, lon: 135.5, operator: "Panasonic Energy", scale: "원통형 4680·2170", requires: CELL },

  // ───────── 수요 (Demand: OEM·ESS) ─────────
  { id: "d_china", name: "중국 EV·ESS 수요", nameEn: "China EV & ESS", stage: "demand", region: "CN", country: "중국", lat: 34.5, lon: 113.6, operator: "BYD·Geely·Tesla상하이 등", scale: "세계 수요 ~55%", demandGWh: 900, requires: { cell: 1 } },
  { id: "d_eu", name: "유럽 OEM", nameEn: "European OEMs", stage: "demand", region: "EU", country: "독일 외", lat: 52.4, lon: 10.8, operator: "VW·BMW·Stellantis·Renault", scale: "~250GWh", demandGWh: 250, requires: { cell: 1 } },
  { id: "d_tesla", name: "테슬라 (미국)", nameEn: "Tesla US", stage: "demand", region: "NA", country: "미국", lat: 30.2, lon: -97.6, operator: "Tesla", scale: "EV+메가팩 ~120GWh", demandGWh: 120, requires: { cell: 1 }, tickers: [T.TSLA] },
  { id: "d_us_oem", name: "GM·포드 (디트로이트)", nameEn: "GM & Ford", stage: "demand", region: "NA", country: "미국", lat: 42.33, lon: -83.05, operator: "GM·Ford", scale: "~80GWh", demandGWh: 80, requires: { cell: 1 }, tickers: [T.GM, T.F] },
  { id: "d_hyundai_us", name: "현대차 메타플랜트 (조지아)", nameEn: "Hyundai Metaplant", stage: "demand", region: "NA", country: "미국", lat: 32.1, lon: -81.4, operator: "현대차그룹", scale: "~30GWh", demandGWh: 30, requires: { cell: 1 }, tickers: [T.HMC, T.KIA] },
  { id: "d_korea", name: "현대·기아 (울산)", nameEn: "Hyundai-Kia Korea", stage: "demand", region: "KR", country: "한국", lat: 35.55, lon: 129.32, operator: "현대차·기아", scale: "~50GWh", demandGWh: 50, requires: { cell: 1 }, tickers: [T.HMC, T.KIA] },
  { id: "d_japan", name: "일본 OEM", nameEn: "Japanese OEMs", stage: "demand", region: "JP", country: "일본", lat: 35.08, lon: 137.15, operator: "Toyota·Nissan·Honda", scale: "~40GWh", demandGWh: 40, requires: { cell: 1 }, tickers: [T.TM] },
];

type E = [from: string, to: string, material: Material, share: number];

const RAW_EDGES: E[] = [
  // 리튬 원료 → 정제
  ["m_greenbushes", "r_china_li", "lithium", 0.3],
  ["m_pilbara", "r_china_li", "lithium", 0.2],
  ["m_zimbabwe", "r_china_li", "lithium", 0.12],
  ["m_china_li", "r_china_li", "lithium", 0.25],
  ["m_argentina", "r_china_li", "lithium", 0.05],
  ["m_atacama", "r_chile_li", "lithium", 0.95],
  ["m_greenbushes", "r_aus_li", "lithium", 0.9],
  ["m_pilbara", "r_korea_li", "lithium", 0.6],
  ["m_argentina", "r_korea_li", "lithium", 0.3],
  // 니켈·코발트 원료 → 정제 (인니는 2020년부터 원광 수출 금지 → 현지 제련 후 중간재 수출)
  ["m_sulawesi", "r_indo_ni", "nickel", 1.0],
  ["r_indo_ni", "r_china_co", "nickel", 0.55],
  ["m_philippines", "r_china_co", "nickel", 0.2],
  ["m_drc", "r_china_co", "cobalt", 0.8],
  ["m_philippines", "r_japan_ni", "nickel", 0.6],
  ["r_indo_ni", "r_japan_ni", "nickel", 0.25],
  ["m_drc", "r_finland_co", "cobalt", 0.85],
  // 정제 → 양극재
  ["r_china_li", "c_china", "lithium", 0.85],
  ["r_chile_li", "c_china", "lithium", 0.1],
  ["r_china_co", "c_china", "nickel", 0.65],
  ["r_indo_ni", "c_china", "nickel", 0.3],
  ["r_china_co", "c_china", "cobalt", 0.9],
  ["m_sa_mn", "c_china", "manganese", 0.5],

  ["r_china_li", "c_korea_ecopro", "lithium", 0.45],
  ["r_chile_li", "c_korea_ecopro", "lithium", 0.25],
  ["r_korea_li", "c_korea_ecopro", "lithium", 0.2],
  ["r_indo_ni", "c_korea_ecopro", "nickel", 0.5],
  ["r_china_co", "c_korea_ecopro", "nickel", 0.3],
  ["r_japan_ni", "c_korea_ecopro", "nickel", 0.1],
  ["r_china_co", "c_korea_ecopro", "cobalt", 0.7],
  ["r_finland_co", "c_korea_ecopro", "cobalt", 0.15],
  ["m_sa_mn", "c_korea_ecopro", "manganese", 0.6],

  ["r_china_li", "c_korea_lnf", "lithium", 0.5],
  ["r_aus_li", "c_korea_lnf", "lithium", 0.2],
  ["r_chile_li", "c_korea_lnf", "lithium", 0.2],
  ["r_china_co", "c_korea_lnf", "nickel", 0.5],
  ["r_indo_ni", "c_korea_lnf", "nickel", 0.4],
  ["r_china_co", "c_korea_lnf", "cobalt", 0.8],
  ["m_sa_mn", "c_korea_lnf", "manganese", 0.5],

  ["r_korea_li", "c_korea_posco", "lithium", 0.5],
  ["r_china_li", "c_korea_posco", "lithium", 0.3],
  ["r_chile_li", "c_korea_posco", "lithium", 0.15],
  ["r_indo_ni", "c_korea_posco", "nickel", 0.5],
  ["r_china_co", "c_korea_posco", "nickel", 0.3],
  ["r_china_co", "c_korea_posco", "cobalt", 0.6],
  ["r_finland_co", "c_korea_posco", "cobalt", 0.2],
  ["m_sa_mn", "c_korea_posco", "manganese", 0.6],

  ["r_chile_li", "c_japan", "lithium", 0.5],
  ["r_china_li", "c_japan", "lithium", 0.3],
  ["r_aus_li", "c_japan", "lithium", 0.15],
  ["r_japan_ni", "c_japan", "nickel", 0.7],
  ["r_indo_ni", "c_japan", "nickel", 0.2],
  ["r_china_co", "c_japan", "cobalt", 0.5],
  ["r_finland_co", "c_japan", "cobalt", 0.3],
  ["m_sa_mn", "c_japan", "manganese", 0.6],
  // 흑연 → 음극재
  ["m_heilongjiang", "a_china", "graphite", 0.85],
  ["m_mozambique", "a_china", "graphite", 0.1],
  ["m_heilongjiang", "a_korea_posco", "graphite", 0.6],
  ["m_mozambique", "a_korea_posco", "graphite", 0.25],
  ["m_heilongjiang", "a_japan", "graphite", 0.5],
  ["m_mozambique", "a_japan", "graphite", 0.1],
  // 소재 → 셀
  ["c_china", "cell_catl", "cathode", 0.95],
  ["a_china", "cell_catl", "anode", 0.95],
  ["c_china", "cell_byd", "cathode", 0.98],
  ["a_china", "cell_byd", "anode", 0.98],
  ["c_china", "cell_china_other", "cathode", 0.95],
  ["a_china", "cell_china_other", "anode", 0.95],

  ["c_korea_lnf", "cell_lges_kr", "cathode", 0.35],
  ["c_korea_posco", "cell_lges_kr", "cathode", 0.25],
  ["c_korea_ecopro", "cell_lges_kr", "cathode", 0.15],
  ["c_china", "cell_lges_kr", "cathode", 0.15],
  ["a_china", "cell_lges_kr", "anode", 0.7],
  ["a_korea_posco", "cell_lges_kr", "anode", 0.25],

  ["c_korea_lnf", "cell_lges_pl", "cathode", 0.3],
  ["c_korea_posco", "cell_lges_pl", "cathode", 0.25],
  ["c_china", "cell_lges_pl", "cathode", 0.35],
  ["a_china", "cell_lges_pl", "anode", 0.75],
  ["a_korea_posco", "cell_lges_pl", "anode", 0.15],

  ["c_korea_posco", "cell_lges_us", "cathode", 0.45],
  ["c_korea_lnf", "cell_lges_us", "cathode", 0.3],
  ["c_china", "cell_lges_us", "cathode", 0.1],
  ["a_korea_posco", "cell_lges_us", "anode", 0.35],
  ["a_china", "cell_lges_us", "anode", 0.45],
  ["a_japan", "cell_lges_us", "anode", 0.1],

  ["c_korea_ecopro", "cell_sdi_kr", "cathode", 0.6],
  ["c_korea_posco", "cell_sdi_kr", "cathode", 0.15],
  ["c_japan", "cell_sdi_kr", "cathode", 0.1],
  ["a_china", "cell_sdi_kr", "anode", 0.7],
  ["a_japan", "cell_sdi_kr", "anode", 0.15],
  ["a_korea_posco", "cell_sdi_kr", "anode", 0.1],

  ["c_korea_ecopro", "cell_sdi_hu", "cathode", 0.65],
  ["c_china", "cell_sdi_hu", "cathode", 0.2],
  ["a_china", "cell_sdi_hu", "anode", 0.75],
  ["a_japan", "cell_sdi_hu", "anode", 0.1],

  ["c_korea_ecopro", "cell_skon_us", "cathode", 0.6],
  ["c_korea_posco", "cell_skon_us", "cathode", 0.2],
  ["a_china", "cell_skon_us", "anode", 0.6],
  ["a_korea_posco", "cell_skon_us", "anode", 0.2],
  ["a_japan", "cell_skon_us", "anode", 0.1],

  ["c_korea_ecopro", "cell_skon_hu", "cathode", 0.6],
  ["c_china", "cell_skon_hu", "cathode", 0.25],
  ["a_china", "cell_skon_hu", "anode", 0.8],

  ["c_japan", "cell_pana_us", "cathode", 0.7],
  ["c_korea_lnf", "cell_pana_us", "cathode", 0.1],
  ["a_japan", "cell_pana_us", "anode", 0.4],
  ["a_china", "cell_pana_us", "anode", 0.5],

  ["c_japan", "cell_pana_jp", "cathode", 0.85],
  ["a_japan", "cell_pana_jp", "anode", 0.5],
  ["a_china", "cell_pana_jp", "anode", 0.45],
  // 셀 → 수요
  ["cell_catl", "d_china", "cell", 0.45],
  ["cell_byd", "d_china", "cell", 0.3],
  ["cell_china_other", "d_china", "cell", 0.22],

  ["cell_catl", "d_eu", "cell", 0.3],
  ["cell_lges_pl", "d_eu", "cell", 0.25],
  ["cell_sdi_hu", "d_eu", "cell", 0.12],
  ["cell_skon_hu", "d_eu", "cell", 0.1],
  ["cell_byd", "d_eu", "cell", 0.05],
  ["cell_china_other", "d_eu", "cell", 0.05],

  ["cell_pana_us", "d_tesla", "cell", 0.45],
  ["cell_catl", "d_tesla", "cell", 0.15],
  ["cell_lges_kr", "d_tesla", "cell", 0.15],
  ["cell_pana_jp", "d_tesla", "cell", 0.1],

  ["cell_lges_us", "d_us_oem", "cell", 0.7],
  ["cell_skon_us", "d_us_oem", "cell", 0.15],
  ["cell_catl", "d_us_oem", "cell", 0.05],

  ["cell_skon_us", "d_hyundai_us", "cell", 0.45],
  ["cell_lges_us", "d_hyundai_us", "cell", 0.25],
  ["cell_lges_kr", "d_hyundai_us", "cell", 0.15],

  ["cell_lges_kr", "d_korea", "cell", 0.35],
  ["cell_sdi_kr", "d_korea", "cell", 0.3],
  ["cell_catl", "d_korea", "cell", 0.2],

  ["cell_pana_jp", "d_japan", "cell", 0.6],
  ["cell_catl", "d_japan", "cell", 0.15],
  ["cell_byd", "d_japan", "cell", 0.05],
];

export const EDGES: SupplyEdge[] = RAW_EDGES.map(([from, to, material, share]) => ({ from, to, material, share }));

export const NODE_BY_ID: Record<string, SupplyNode> = Object.fromEntries(NODES.map((n) => [n.id, n]));

// ───────── 병목 (Chokepoints) ─────────
export const CHOKEPOINTS: Chokepoint[] = [
  { id: "sea_malacca", name: "말라카 해협", nameEn: "Strait of Malacca", kind: "sea", lat: 2.5, lon: 101.5, lossFactor: 0.35, description: "아프리카·유럽 ↔ 동아시아 해상물동량의 핵심 길목. 우회(순다·롬복) 시 운송일수 증가." },
  { id: "sea_redsea", name: "홍해·수에즈 운하", nameEn: "Red Sea / Suez Canal", kind: "sea", lat: 13.5, lon: 43.0, lossFactor: 0.25, description: "아시아 ↔ 유럽 최단로. 봉쇄 시 희망봉 우회로 10~14일 지연." },
  { id: "sea_panama", name: "파나마 운하", nameEn: "Panama Canal", kind: "sea", lat: 9.1, lon: -79.7, lossFactor: 0.3, description: "아시아 ↔ 미국 동부·남부 항만. 가뭄 시 통항 제한 사례(2023)." },
  { id: "sea_taiwan", name: "대만 해협·남중국해", nameEn: "Taiwan Strait", kind: "sea", lat: 24.0, lon: 119.8, lossFactor: 0.4, description: "중국 남부 ↔ 한국·일본, 동남아 ↔ 동북아 항로." },
  { id: "pol_cn_graphite", name: "중국 흑연·음극재 수출통제", nameEn: "China graphite export controls", kind: "policy", lat: 45.8, lon: 125.0, lossFactor: 1, description: "2023.12 시행된 흑연 수출허가제 강화 시나리오. 중국 밖으로 나가는 흑연·음극재 흐름 차단." },
  { id: "pol_cn_refined", name: "중국 정제광물·양극재 수출통제", nameEn: "China refined-mineral export controls", kind: "policy", lat: 30.0, lon: 108.0, lossFactor: 1, description: "리튬·코발트·니켈 정제품, 전구체·양극재의 중국 외 수출 제한 시나리오." },
  { id: "pol_us_feoc", name: "미국 FEOC·관세 (중국산 배제)", nameEn: "US FEOC rules / tariffs", kind: "policy", lat: 38.9, lon: -77.0, lossFactor: 1, description: "IRA 해외우려기관(FEOC) 규정·관세로 중국산 소재·셀이 미국 공장/수요처에 못 들어오는 시나리오." },
  { id: "pol_idn_ni", name: "인니 니켈 중간재 수출 제한", nameEn: "Indonesia nickel export curbs", kind: "policy", lat: -6.2, lon: 106.8, lossFactor: 1, description: "원광 수출금지(2020)에 이어 MHP·매트 등 중간재까지 제한/과세하는 시나리오." },
];

const EAST_ASIA: Region[] = ["CN", "KR", "JP"];

/** 해당 경로가 통과하는 병목 id 목록 (단순화된 해상 경로 규칙) */
export function chokepointsForEdge(edge: SupplyEdge): string[] {
  const a = NODE_BY_ID[edge.from];
  const b = NODE_BY_ID[edge.to];
  const out: string[] = [];
  if (a.region === b.region) return policyChokepoints(edge, a, b);

  // 아프리카 → 동아시아 : 말라카
  if (a.region === "AFR" && EAST_ASIA.includes(b.region)) out.push("sea_malacca");
  // 동아시아 ↔ 유럽 : 말라카 + 홍해
  if ((EAST_ASIA.includes(a.region) && b.region === "EU") || (a.region === "EU" && EAST_ASIA.includes(b.region))) {
    out.push("sea_malacca", "sea_redsea");
  }
  // 동아시아 → 미국 동부/남부 : 파나마 (서부는 태평양 직항)
  if (EAST_ASIA.includes(a.region) && b.region === "NA" && b.lon > -100) out.push("sea_panama");
  // 중국 남부 → 한국/일본, 아프리카·동남아 → 동북아 : 대만해협·남중국해
  if (a.region === "CN" && a.lat < 25 && (b.region === "KR" || b.region === "JP")) out.push("sea_taiwan");
  if ((a.region === "AFR" || a.region === "PHL") && (b.region === "KR" || b.region === "JP" || (b.region === "CN" && b.lat > 27))) {
    out.push("sea_taiwan");
  }
  return [...out, ...policyChokepoints(edge, a, b)];
}

function policyChokepoints(edge: SupplyEdge, a: SupplyNode, b: SupplyNode): string[] {
  const out: string[] = [];
  const leavesChina = a.region === "CN" && b.region !== "CN";
  if (leavesChina && (edge.material === "graphite" || edge.material === "anode")) out.push("pol_cn_graphite");
  if (leavesChina && ["lithium", "nickel", "cobalt", "cathode"].includes(edge.material)) out.push("pol_cn_refined");
  if (a.region === "CN" && b.region === "NA") out.push("pol_us_feoc");
  if (a.region === "IDN" && b.region !== "IDN") out.push("pol_idn_ni");
  return out;
}

// ───────── 공급 집중도 (IEA 2024/2025 근사치) ─────────
export const CONCENTRATION: { step: string; stepEn: string; top: string; share: number }[] = [
  { step: "음극재(흑연) 가공", stepEn: "Anode / graphite processing", top: "중국", share: 0.92 },
  { step: "코발트 채굴", stepEn: "Cobalt mining", top: "DR콩고", share: 0.75 },
  { step: "코발트 정제", stepEn: "Cobalt refining", top: "중국", share: 0.76 },
  { step: "양극재 생산", stepEn: "Cathode production", top: "중국", share: 0.75 },
  { step: "배터리셀 생산", stepEn: "Cell manufacturing", top: "중국", share: 0.77 },
  { step: "리튬 정제", stepEn: "Lithium refining", top: "중국", share: 0.65 },
  { step: "니켈 채굴", stepEn: "Nickel mining", top: "인도네시아", share: 0.55 },
  { step: "리튬 채굴", stepEn: "Lithium mining", top: "호주", share: 0.37 },
];

// ───────── 시나리오 프리셋 ─────────
export const PRESETS: ScenarioPreset[] = [
  { id: "base", label: "기본 (정상)", description: "모든 공장 100% 가동, 병목 없음.", scenario: {} },
  { id: "cn_graphite", label: "중국 흑연 수출통제", description: "중국산 흑연·음극재의 해외 반출 80% 차단.", scenario: { disruption: { pol_cn_graphite: 0.8 } } },
  { id: "idn_nickel", label: "인니 니켈 감산", description: "RKAB(채굴쿼터) 축소로 술라웨시 니켈 채굴 40% 감소.", scenario: { production: { m_sulawesi: 0.6 } } },
  { id: "drc_cobalt", label: "DRC 코발트 수출중단", description: "DR콩고 코발트 수출 금지(2025 실제 사례) — 채굴 출하 70% 감소.", scenario: { production: { m_drc: 0.3 } } },
  { id: "red_sea", label: "홍해·말라카 동시 위기", description: "홍해 완전 봉쇄 + 말라카 해협 50% 차질.", scenario: { disruption: { sea_redsea: 1, sea_malacca: 0.5 } } },
  { id: "catl_cut", label: "CATL 30% 감산", description: "세계 1위 셀 메이커 CATL 생산 30% 축소.", scenario: { production: { cell_catl: 0.7 } } },
  { id: "us_feoc", label: "미국 중국산 완전 배제", description: "FEOC 규정·관세로 중국산 소재·셀의 미국 유입 100% 차단.", scenario: { disruption: { pol_us_feoc: 1 } } },
  { id: "taiwan", label: "대만해협 봉쇄", description: "대만해협·남중국해 항로 100% 봉쇄.", scenario: { disruption: { sea_taiwan: 1 } } },
];
