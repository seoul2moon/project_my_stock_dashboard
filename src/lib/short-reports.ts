// 미국 상장 종목 대상 행동주의 공매도 리포트 큐레이션 데이터.
// 결과(verdict)는 이후 규제기관 조치, 회사 자백, 상장폐지, 감사인 사임 등
// 공개적으로 확인 가능한 사건을 기준으로 수동 판정한 것이다.

export type Verdict = "hit" | "partial" | "miss" | "ongoing";

export interface LinkRef {
  label: string;
  url: string;
}

export interface ShortReport {
  id: string;
  firm: string;
  ticker: string;
  company: string;
  date: string; // YYYY-MM-DD (일자를 확인하지 못한 경우 YYYY-MM)
  title: string;
  reportUrl?: string;
  reportUrlNote?: string;
  claims: string;
  outcome: string;
  verdict: Verdict;
  evidence?: LinkRef[];
}

export interface FirmInfo {
  name: string;
  founder: string;
  note: string;
  url: string;
}

export const VERDICT_META: Record<Verdict, { label: string; score: number | null; className: string }> = {
  hit: {
    label: "적중",
    score: 1,
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  partial: {
    label: "부분 적중",
    score: 0.5,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  miss: {
    label: "미적중",
    score: 0,
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  },
  ongoing: {
    label: "진행 중",
    score: null,
    className: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  },
};

export const FIRMS: FirmInfo[] = [
  {
    name: "Hindenburg Research",
    founder: "Nate Anderson",
    note: "2017~2025년 1월 활동 종료. Nikola·Tingo처럼 형사/SEC 사건으로 이어진 리포트가 많음.",
    url: "https://hindenburgresearch.com/",
  },
  {
    name: "Muddy Waters",
    founder: "Carson Block",
    note: "중국계 상장사 회계부정 폭로로 유명. 루이싱커피 익명 리포트를 공개하며 숏 포지션 공개.",
    url: "https://muddywatersresearch.com/research/",
  },
  {
    name: "Citron Research",
    founder: "Andrew Left",
    note: "Valeant 폭로로 유명하지만 성장주 숏에서 빗나간 사례도 많음.",
    url: "https://www.citronresearch.com/",
  },
  {
    name: "Wolfpack Research",
    founder: "Dan David",
    note: "중국계·소형주 대상 리포트. iQIYI 리포트 후 SEC 조사 착수.",
    url: "https://www.wolfpackresearch.com/",
  },
  {
    name: "Grizzly Research",
    founder: "-",
    note: "GSX Techedu를 가장 먼저(2020년 2월) 공개 지적.",
    url: "https://grizzlyreports.com/",
  },
  {
    name: "Culper Research",
    founder: "-",
    note: "중소형 기술·바이오주 위주. 2026년 5월 엔비디아 중국 우회판매 리포트 발표.",
    url: "https://culperresearch.com/",
  },
  {
    name: "Spruce Point Capital",
    founder: "Ben Axler",
    note: "대형·중형주 대상 장문 리포트. 주가 하락은 자주 맞지만 회계부정이 공식 입증된 사례는 드묾.",
    url: "https://www.sprucepointcap.com/research",
  },
  {
    name: "Kerrisdale Capital",
    founder: "Sahm Adrangi",
    note: "고평가 테마주(수소·양자·원전) 밸류에이션 숏 위주. 테마 랠리에 역으로 당한 사례도 있음.",
    url: "https://www.kerrisdalecap.com/",
  },
  {
    name: "Gotham City Research",
    founder: "Daniel Yu",
    note: "스페인 Gowex(파산) 폭로로 유명. 미국에선 Tile Shop, Carvana 특수관계 거래 지적.",
    url: "https://www.gothamcityresearch.com/",
  },
];

export const REPORTS: ShortReport[] = [
  {
    id: "hb-nkla",
    firm: "Hindenburg Research",
    ticker: "NKLA",
    company: "Nikola",
    date: "2020-09-10",
    title: "Nikola: How to Parlay An Ocean of Lies Into a Partnership With the Largest Auto OEM in America",
    reportUrl: "https://hindenburgresearch.com/nikola/",
    claims:
      "수소트럭 Nikola One 주행 영상은 언덕에서 굴려 내린 것이고, 본사 태양광·수소 생산설비 등 창업자 Trevor Milton의 주장 다수가 거짓이라고 폭로.",
    outcome:
      "회사가 '굴려 내린 영상' 시인, Milton 10일 만에 사임. 2022년 증권·통신사기 유죄, 2023년 징역 4년 선고. 회사는 SEC와 1.25억 달러 합의.",
    verdict: "hit",
    evidence: [
      { label: "FreightWaves: 징역 4년 선고", url: "https://www.freightwaves.com/news/nikola-founder-sentenced-to-4-years-on-fraud-convictions" },
    ],
  },
  {
    id: "hb-ride",
    firm: "Hindenburg Research",
    ticker: "RIDE",
    company: "Lordstown Motors",
    date: "2021-03-12",
    title: "The Lordstown Motors Mirage: Fake Orders, Undisclosed Production Hurdles, And A Prototype Inferno",
    reportUrl: "https://hindenburgresearch.com/lordstown/",
    claims: "선주문(프리오더) 대부분이 가짜이거나 구속력이 없고, 생산 일정도 과장됐다고 지적.",
    outcome:
      "2021년 6월 CEO·CFO 동반 사임, 2023년 파산 신청. 2024년 2월 SEC가 주문·생산 관련 허위 표시로 회사를 사기 혐의로 제재.",
    verdict: "hit",
  },
  {
    id: "hb-tio",
    firm: "Hindenburg Research",
    ticker: "TIO",
    company: "Tingo Group",
    date: "2023-06-06",
    title: "Tingo Group: Fake Farmers, Phones, and Financials—The Nigerian Empire That Isn't",
    reportUrl: "https://hindenburgresearch.com/tingo/",
    claims: "나이지리아 농민·휴대폰 사업과 재무제표가 사실상 전부 조작된 '명백한 사기'라고 주장.",
    outcome:
      "2023년 12월 SEC가 창업자 Dozy Mmobuosi를 사기 혐의로 제소, 2024년 1월 형사 기소. 2024년 8월 법원이 회사·CEO의 사기 책임 인정.",
    verdict: "hit",
    evidence: [
      {
        label: "BNN Bloomberg: SEC 소송 결과",
        url: "https://bnnbloomberg.ca/business/company-news/2024/08/28/hindenburg-target-tingo-fails-to-respond-to-sec-fraud-lawsuit",
      },
    ],
  },
  {
    id: "hb-iep",
    firm: "Hindenburg Research",
    ticker: "IEP",
    company: "Icahn Enterprises",
    date: "2023-05-02",
    title: "Icahn Enterprises: The Corporate Raider Throwing Stones From His Own Glass House",
    reportUrl: "https://hindenburgresearch.com/icahn/",
    claims:
      "신규 투자자 돈으로 고배당을 지급하는 '폰지 유사' 구조이며, Carl Icahn 개인 주식담보대출 규모가 충분히 공시되지 않았다고 지적.",
    outcome: "2023년 8월 배당 50% 삭감. 2024년 8월 SEC가 주식담보대출 미공시로 Icahn과 회사를 제재(합의).",
    verdict: "hit",
  },
  {
    id: "hb-smci",
    firm: "Hindenburg Research",
    ticker: "SMCI",
    company: "Super Micro Computer",
    date: "2024-08-27",
    title: "Super Micro: Fresh Evidence Of Accounting Manipulation, Sibling Self-Dealing And Sanctions Evasion At This AI High Flyer",
    reportUrl: "https://hindenburgresearch.com/smci/",
    claims: "회계 조작 재발, CEO 형제 회사와의 특수관계 거래(3년간 9.83억 달러), 러시아·중국 대상 수출통제 위반 의혹.",
    outcome:
      "연차보고서 제출 지연, 감사인 EY가 '경영진 진술을 신뢰할 수 없다'며 사임. 다만 회사 특별위원회는 부정행위를 찾지 못했다고 발표.",
    verdict: "partial",
    evidence: [
      { label: "Motley Fool: EY 사임 정리", url: "https://www.fool.com/investing/2024/11/04/what-is-happening-at-super-micro-computer-heres-wh" },
    ],
  },
  {
    id: "hb-xyz",
    firm: "Hindenburg Research",
    ticker: "SQ/XYZ",
    company: "Block (Cash App)",
    date: "2023-03-23",
    title: "Block: How Inflated User Metrics and \"Frictionless\" Fraud Facilitation Enabled Insiders To Cash Out Over $1 Billion",
    reportUrl: "https://hindenburgresearch.com/block/",
    claims: "Cash App 사용자 수가 중복·가짜 계정으로 부풀려졌고, 자금세탁방지(AML)·사기 통제가 허술하다고 주장.",
    outcome:
      "사용자 수 과장 자체는 입증되지 않았지만, 이후 AML·소비자보호 문제로 주 규제당국과 CFPB에 벌금·배상 합의.",
    verdict: "partial",
  },
  {
    id: "hb-cvna",
    firm: "Hindenburg Research",
    ticker: "CVNA",
    company: "Carvana",
    date: "2025-01-02",
    title: "Carvana: A Father-Son Accounting Grift For The Ages",
    reportUrl: "https://hindenburgresearch.com/carvana/",
    claims: "부자(父子) 경영진의 특수관계 거래와 대출채권 매각을 통한 이익 부풀리기 의혹.",
    outcome: "현재까지 규제기관 처분 등 확인된 결과가 없고, 리포트 이후 주가는 오히려 크게 상승.",
    verdict: "miss",
  },
  {
    id: "mw-lk",
    firm: "Muddy Waters",
    ticker: "LK",
    company: "Luckin Coffee",
    date: "2020-01-31",
    title: "Luckin Coffee: Fraud + Fundamentally Broken Business (89쪽 익명 리포트, Muddy Waters 공개)",
    reportUrl: "https://www.benzinga.com/analyst-ratings/analyst-color/20/01/15229236/luckin-coffees-stock-hit-by-short-report-alleging-fraud",
    reportUrlNote: "원문 PDF는 Muddy Waters 트위터(2020.1.31) 첨부 파일. 링크는 당시 보도.",
    claims: "1만 시간 이상 매장 영상 분석으로 매장당 판매량이 2019년 3분기 69%, 4분기 88% 부풀려졌다고 주장.",
    outcome:
      "2020년 4월 회사가 COO 주도로 약 3.1억 달러 매출 조작을 자백, 주가 하루 -75%. 2020년 6월 나스닥 상장폐지, SEC에 1.8억 달러 벌금.",
    verdict: "hit",
    evidence: [
      {
        label: "NRN: 상장폐지",
        url: "https://www.nrn.com/restaurant-finance/luckin-coffee-drops-stock-market-delisting-appeal-following-fraud-scandal",
      },
    ],
  },
  {
    id: "mw-gsx",
    firm: "Muddy Waters",
    ticker: "GSX/GOTU",
    company: "GSX Techedu (현 Gaotu)",
    date: "2020-05-18",
    title: "GSX: Small Classes, Big Lies",
    reportUrl: "https://muddywatersresearch.com/research/gsx/small-classes-big-lies/",
    claims: "분석한 수업 수강생의 최소 70% 이상이 봇(bot)이라며 학생 수와 매출이 크게 부풀려졌다고 주장.",
    outcome:
      "회계부정이 공식 입증되지는 않았지만 2021년 중국 사교육 규제와 Archegos 사태로 주가 90% 이상 폭락.",
    verdict: "partial",
  },
  {
    id: "mw-onp",
    firm: "Muddy Waters",
    ticker: "ONP",
    company: "Orient Paper",
    date: "2010-06-28",
    title: "Muddy Waters Initiating Coverage on ONP - Strong Sell",
    reportUrl: "https://muddywatersresearch.com/research/orient-paper-inc/initiating-coverage-onp/",
    claims: "공장 실사 결과 2008~2009년 매출과 자산 가치가 크게 과장됐다고 주장. Muddy Waters의 첫 리포트.",
    outcome: "주가 급락 후 회복하지 못했지만, 회사 자체 조사는 부정을 부인했고 규제기관 처분은 없었음.",
    verdict: "partial",
  },
  {
    id: "mw-app",
    firm: "Muddy Waters",
    ticker: "APP",
    company: "AppLovin",
    date: "2025-03-27",
    title: "AppLovin: Deep Data Analysis Shows APP is Ripping Off Advertisers",
    reportUrl: "https://muddywatersresearch.com/wp-content/uploads/2025/03/MW_20250327-2.pdf",
    claims: "이커머스 광고 전환의 상당 부분이 리타기팅이며, 플랫폼 약관을 위반하는 기기 식별 방식을 쓴다고 주장.",
    outcome: "결론이 나지 않음. 2025년 5월 후속 리포트 발표.",
    verdict: "ongoing",
    evidence: [
      { label: "후속 리포트(2025.5.7)", url: "https://muddywatersresearch.com/wp-content/uploads/2025/05/APP_20250507.pdf" },
    ],
  },
  {
    id: "citron-vrx",
    firm: "Citron Research",
    ticker: "VRX",
    company: "Valeant Pharmaceuticals (현 Bausch Health)",
    date: "2015-10-21",
    title: "Valeant: Could This Be the Pharmaceutical Enron?",
    reportUrl: "https://citronresearch.com/wp-content/uploads/2015/10/Valeant-Philador-and-RandO-final-a.pdf",
    claims: "숨겨진 특수약국 Philidor를 통해 가짜 송장으로 매출을 부풀리는 채널 스터핑을 한다고 주장.",
    outcome:
      "Valeant가 Philidor와의 관계를 끊고 Philidor는 폐업. 관련 임원들이 형사 유죄, 회사는 2020년 SEC에 4,500만 달러 합의금. 주가 90% 이상 폭락.",
    verdict: "hit",
    evidence: [
      { label: "BioSpace: 발표 당시 보도", url: "https://www.biospace.com/valeant-plunges-after-bearish-report-likens-it-to-b-enron-b" },
      {
        label: "BioSpace: Philidor 관계 정리",
        url: "https://www.biospace.com/valeant-severs-ties-with-controversial-specialty-pharmacy-b-philidor-b-which-plans-to-shutter-its-doors",
      },
    ],
  },
  {
    id: "citron-shop",
    firm: "Citron Research",
    ticker: "SHOP",
    company: "Shopify",
    date: "2017-10-04",
    title: "Shopify: 'Get Rich Quick' 판매자 모집 의혹 리포트",
    reportUrlNote: "원문 링크 미확인",
    claims: "소득을 미끼로 판매자를 끌어들이는 방식이 FTC 규제 대상이 될 수 있다고 주장.",
    outcome: "규제 조치가 없었고, 이후 주가가 수 배 상승한 대표적인 빗나간 숏 사례.",
    verdict: "miss",
  },
  {
    id: "wolfpack-iq",
    firm: "Wolfpack Research",
    ticker: "IQ",
    company: "iQIYI",
    date: "2020-04-06",
    title: "iQIYI: The Netflix of China? Good Luckin.",
    reportUrl: "https://dev.wolfpackresearch.com/research/iq-netflix-of-china-good-luckin/",
    claims: "상장 전부터 이용자 수를 최대 60% 부풀리고, 2019년 매출을 80~130억 위안(27~44%) 과대계상했다고 주장.",
    outcome: "2020년 8월 SEC가 재무자료 제출을 요구하며 조사 착수, 주가 급락. 최종 처분은 확인되지 않음.",
    verdict: "partial",
    evidence: [
      { label: "CNBC: SEC 조사 착수", url: "https://www.cnbc.com/2020/08/14/iqiyi-sec-investigation-into-fraud-allegations-shares-plunge.html" },
    ],
  },
  {
    id: "grizzly-gsx",
    firm: "Grizzly Research",
    ticker: "GSX/GOTU",
    company: "GSX Techedu (현 Gaotu)",
    date: "2020-02-25",
    title: "Brushed Student Counts and Cooked Books: Why We Believe GSX Techedu is the Worst Publicly Traded Education Company",
    reportUrl:
      "https://grizzlyreports.com/brushed-student-counts-and-cooked-books-why-we-believe-gsx-techedu-is-the-worst-publicly-traded-education-company/",
    claims: "가짜 주문(브러싱)으로 학생 수를 부풀리고, IPO 당시 이익을 과장했다고 처음 공개 지적.",
    outcome: "Muddy Waters·Citron이 뒤따름. 회계부정은 공식 입증되지 않았지만 2021년 주가 90% 이상 폭락.",
    verdict: "partial",
  },
  {
    id: "culper-nvda",
    firm: "Culper Research",
    ticker: "NVDA",
    company: "NVIDIA",
    date: "2026-05-13",
    title: "NVIDIA (NVDA): The China Problem",
    reportUrl: "https://culperresearch.com/wp-content/uploads/2026/05/Culper_NVDA_5-13-2026.pdf",
    claims:
      "말레이시아 Megaspeed 등 동남아 중개업체를 통해 엔비디아 서버가 중국으로 계속 흘러가며, FY2026 컴퓨트 매출의 20% 이상이 중국과 연결돼 있다고 주장.",
    outcome:
      "2026년 11월 Megaspeed 임원의 스파이 의혹이 보도되며 리포트가 다시 주목받음. 우회 판매 주장은 아직 독립적으로 확인되지 않음.",
    verdict: "ongoing",
    evidence: [
      {
        label: "TechCrunch (2026.11.9)",
        url: "https://techcrunch.com/2026/11/09/a-short-seller-flagged-nvidia-ceos-ties-to-a-suspected-chinese-spy-six-months-before-the-scandal/",
      },
    ],
  },
  {
    id: "spruce-geni",
    firm: "Spruce Point Capital",
    ticker: "GENI",
    company: "Genius Sports",
    date: "2021-08-05",
    title: "Genius Sports Limited: Strong Sell",
    reportUrl: "https://www.sprucepointcap.com/research/genius-sports-limited",
    claims: "경쟁사도 제공하는 스포츠 데이터를 중개할 뿐인 SPAC 상장사로, 성장성과 재무가 과장됐다며 60~80% 하락 가능성 제시.",
    outcome: "2021년 말까지 주가 약 52% 하락. 다만 회계부정 등 규제기관 조치는 없었음.",
    verdict: "partial",
    evidence: [
      {
        label: "Institutional Investor: 2021년 성과",
        url: "https://www.institutionalinvestor.com/article/2bsto5bufgzha3htbasxs/portfolio/short-activist-spruce-point-soars-in-turbulent-year-for-short-sellers",
      },
    ],
  },
  {
    id: "spruce-nvei",
    firm: "Spruce Point Capital",
    ticker: "NVEI",
    company: "Nuvei",
    date: "2021-12-08",
    title: "Nuvei Corp.: Strong Sell",
    reportUrl: "https://www.sprucepointcap.com/research/nuvei-corp",
    claims: "경영진의 의심스러운 사업 관행과 고위험 가맹점 의존을 지적하며 40~60% 하락 가능성 제시.",
    outcome: "발표 당일 주가 36% 급락, 이후 고점 대비 약 75% 하락. 부정행위가 공식 입증되지는 않았고, 2024년 사모펀드에 인수돼 상장폐지.",
    verdict: "partial",
    evidence: [
      {
        label: "Benzinga: 발표 당시 반응",
        url: "https://www.benzinga.com/analyst-ratings/analyst-color/21/12/24509729/citron-buys-the-dip-in-nuvei-says-no-proof-of-fraud-in-new-short-seller-report",
      },
    ],
  },
  {
    id: "spruce-gnrc",
    firm: "Spruce Point Capital",
    ticker: "GNRC",
    company: "Generac",
    date: "2022-06",
    title: "Generac Holdings, Inc.: Strong Sell",
    reportUrl: "https://www.sprucepointcap.com/research/generac-holdings-inc",
    claims: "가정용 발전기 수요가 일시적이고 클린에너지 인수 전략이 부실하다며 40~50% 하락 가능성 제시.",
    outcome: "이후 1년간 주가가 크게 하락했지만 회계 문제는 확인되지 않음. 순수 밸류에이션·업황 숏.",
    verdict: "partial",
  },
  {
    id: "kerrisdale-plug",
    firm: "Kerrisdale Capital",
    ticker: "PLUG",
    company: "Plug Power",
    date: "2021-01",
    title: "Plug Power, Inc. (PLUG)",
    reportUrl: "https://www.kerrisdalecap.com/wp-content/uploads/2021/01/Plug-Power-Inc.-PLUG.pdf",
    claims: "수소 테마로 주가가 실적과 동떨어지게 부풀려졌다는 밸류에이션 숏.",
    outcome: "2021년 1월 고점 이후 주가가 장기적으로 90% 이상 하락. 2021년 회계 정정(재작성)도 발생.",
    verdict: "hit",
  },
  {
    id: "kerrisdale-ionq",
    firm: "Kerrisdale Capital",
    ticker: "IONQ",
    company: "IonQ",
    date: "2025-03-13",
    title: "IonQ, Inc. (IONQ)",
    reportUrl: "https://www.kerrisdalecap.com/wp-content/uploads/2025/03/IonQ-%E2%80%93-Kerrisdale.pdf",
    claims: "양자컴퓨터 확장 로드맵이 비현실적이고, 2026년 예상 매출의 40배라는 밸류에이션이 터무니없다고 주장.",
    outcome: "발표 당일 약 4% 하락(약 21달러). 2026년 11월 주가는 약 35달러로 발표 시점보다 높음.",
    verdict: "miss",
    evidence: [
      {
        label: "Benzinga: 발표 당시 반응",
        url: "https://www.benzinga.com/trading-ideas/movers/25/03/44307671/is-high-flying-ionq-stock-a-disaster-in-the-making-shares-slide-as-short-seller-raises-red-flags",
      },
    ],
  },
  {
    id: "kerrisdale-qbts",
    firm: "Kerrisdale Capital",
    ticker: "QBTS",
    company: "D-Wave Quantum",
    date: "2025-04",
    title: "D-Wave Quantum Inc (QBTS) - Past-Gen Computing",
    reportUrl: "https://www.kerrisdalecap.com/wp-content/uploads/2025/04/Dwave-Kerrisdale.pdf",
    claims: "어닐링 방식은 한물간 기술이고 밸류에이션이 과도하다고 주장.",
    outcome: "발표 당일 7.03달러. 2026년 들어 약 60% 하락했지만 11월 주가 약 10.5달러로 여전히 발표 시점보다 높음.",
    verdict: "miss",
    evidence: [
      {
        label: "24/7 Wall St. (2026.11)",
        url: "https://247wallst.com/investing/2026/11/11/d-wave-quantum-crashed-60-in-2026-but-this-major-investment-bank-expects-shares-to-quadruple/",
      },
    ],
  },
  {
    id: "kerrisdale-afrm",
    firm: "Kerrisdale Capital",
    ticker: "AFRM",
    company: "Affirm Holdings",
    date: "2026-01",
    title: "Affirm Holdings, Inc. (AFRM)",
    reportUrl: "https://www.kerrisdalecap.com/wp-content/uploads/2026/01/Affirm-Kerrisdale.pdf",
    claims: "BNPL(선구매 후결제) 대출이 사실상 서브프라임 성격이라며 적정가 17달러(약 80% 하락) 제시.",
    outcome: "결론이 나지 않음.",
    verdict: "ongoing",
  },
  {
    id: "gotham-tts",
    firm: "Gotham City Research",
    ticker: "TTS",
    company: "Tile Shop Holdings",
    date: "2013-11-14",
    title: "The Tile Shop: Like Crazy Eddie's, But With An Undisclosed Related Party and A Chinese Twist",
    reportUrl:
      "https://www.gothamcityresearch.com/post/2013/11/14/the-tile-shop-like-crazy-eddie-s-but-with-an-undisclosed-related-party-and-a-chinese-twis",
    claims: "최대 공급사가 CEO 처남이 몰래 지배하는 특수관계사이며, 이익이 200% 이상 부풀려졌다고 주장.",
    outcome:
      "발표 당일 주가 39% 폭락. 회사가 미공시 관계를 인정하고 해당 공급사와 거래를 끊었지만, 내부 조사에서 이익 과장은 대체로 부인.",
    verdict: "partial",
    evidence: [
      { label: "Star Tribune: 주가 급락", url: "https://www.startribune.com/tile-shop-shares-dive-on-investor-s-accusations/231963121/" },
      { label: "Motley Fool: 내부 조사 결과", url: "https://www.fool.com/investing/general/2014/01/29/tile-shop-holdings-largely-exonerates-itself.aspx" },
    ],
  },
  {
    id: "gotham-cvna",
    firm: "Gotham City Research",
    ticker: "CVNA",
    company: "Carvana",
    date: "2026-01-28",
    title: "Carvana: Bridgecrest and the Undisclosed Transactions and Debts",
    reportUrl: "https://www.gothamcityresearch.com/post/carvana-bridgecrest-and-the-undisclosed-transactions-and-debts",
    claims:
      "CEO 부친 소유 DriveTime·Bridgecrest에 대출채권을 비싸게 넘겨 이익을 약 10억 달러 부풀렸다고 주장(정보공개청구로 얻은 감사보고서 근거).",
    outcome: "발표 당일 약 15% 하락(종가 410달러) 후 일부 반등. 애널리스트 다수는 매수 의견 유지. 결론이 나지 않음.",
    verdict: "ongoing",
    evidence: [
      {
        label: "Benzinga: 발표 당시 반응",
        url: "https://www.benzinga.com/trading-ideas/movers/26/01/50202312/carvana-stock-dives-following-gotham-city-short-report",
      },
    ],
  },
];

export interface FirmStats extends FirmInfo {
  total: number;
  resolved: number;
  hits: number;
  partials: number;
  misses: number;
  /** 단순 적중률 (적중 1, 부분 0.5, 미적중 0) */
  rawRate: number | null;
  /** 표본 수 보정 점수: (점수합 + 1) / (판정 수 + 2) */
  adjustedScore: number;
}

export function calcFirmStats(reports: ShortReport[] = REPORTS): FirmStats[] {
  return FIRMS.map((firm) => {
    const own = reports.filter((r) => r.firm === firm.name);
    const resolved = own.filter((r) => VERDICT_META[r.verdict].score !== null);
    const sum = resolved.reduce((acc, r) => acc + (VERDICT_META[r.verdict].score ?? 0), 0);
    return {
      ...firm,
      total: own.length,
      resolved: resolved.length,
      hits: own.filter((r) => r.verdict === "hit").length,
      partials: own.filter((r) => r.verdict === "partial").length,
      misses: own.filter((r) => r.verdict === "miss").length,
      rawRate: resolved.length ? sum / resolved.length : null,
      adjustedScore: (sum + 1) / (resolved.length + 2),
    };
  }).sort(
    (a, b) =>
      Number(b.resolved > 0) - Number(a.resolved > 0) || b.adjustedScore - a.adjustedScore || b.resolved - a.resolved
  );
}
