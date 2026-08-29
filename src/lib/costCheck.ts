export type CostCheckServiceId =
  | "tamtru"
  | "trc"
  | "wp"
  | "driving-license"
  | "company"
  | "restaurant"
  | "hygiene"
  | "fire-safety"
  | "cosmetics"
  | "environment"
  | "medical-device"
  | "franchise"
  | "admin"
  | "real-estate"
  | "fraud"
  | "tax"
  | "notary";

export type CostCheckTab = "lookup" | "review" | "direct";

export type ReviewVerdict = "very_low" | "fair" | "caution" | "risk";

export type DocPrepStatus = "unknown" | "not_started" | "partial" | "ready";

export type CostCheckCurrency = "USD" | "VND";

export type PriceReliabilityStatus =
  | "VERIFIED"
  | "OFFICIAL_CURRENT_CHECK_REQUIRED"
  | "OFFICIAL_SCOPE_CHECK_REQUIRED"
  | "MARKET_REFERENCE"
  | "REFERENCE_ONLY"
  | "PENDING"
  | "NOT_FOUND";

export type OfficialSourceEntry = {
  region: string;
  applicationType: "new" | "reissue" | "renewal" | "exemption";
  amount: number | null;
  currency: "VND";
  source: string;
  sourceType: "official_government_document";
  sourceDate?: string;
  checkedDate: string;
  status: PriceReliabilityStatus;
  uncertainty?: string;
  verificationNote?: string;
};

export type CostCheckService = {
  id: CostCheckServiceId;
  label: string;
  shortLabel: string;
  description: string;
  currency: CostCheckCurrency;
  governmentFee: string;
  source: string;
  marketMin: number;
  marketMax: number;
  marketNote: string;
  /** R 계산용 정부 수수료 참고치 (동일 통화) */
  govFeeAmount: number;
  /** R 계산용 시장 통상 수수료(대행·번역 등) 참고치 */
  marketUsualFeeAmount: number;
  lookupGuide: string;
  ctaLabel: string;
  ctaHref: string;
  /** STEP 5B/5C: 지역별 공식 원문 확인 데이터 (선택적, 없으면 기존 UI 그대로) */
  officialSources?: OfficialSourceEntry[];
};

export type DirectPermitLineItem = {
  label: string;
  amount: string;
  kind: "government" | "market";
};

export const COST_CHECK_DISCLAIMER =
  "본 정보는 조사 시점 기준이며, 베트남 행정 절차·수수료는 관공서 통폐합 및 법령 개정으로 자주 변경됩니다. 실제 비용은 관할기관·시점에 따라 다를 수 있으니 정확한 금액은 진행 시점에 반드시 재확인하시기 바랍니다.";

export const COST_CHECK_MARKET_NOTE =
  "아래 시장 범위는 공식 통계가 아닌 참고용 추정치이며, 지역·난이도·포함 서비스에 따라 달라질 수 있습니다.";

export const DIRECT_PERMIT_COMPANY_DISCLAIMER =
  "실제 비용은 업종, 사업 규모, 인허가 난이도, 관할 지역, 진행 시점에 따라 달라질 수 있습니다. 위 금액은 일반적인 참고용이며, 정확한 견적은 상황별 진단이 필요합니다.";

export const DIRECT_PERMIT_COMPANY_ITEMS: DirectPermitLineItem[] = [
  {
    label: "법인설립 등록비",
    amount: "25,000~50,000 VND (온라인 무료)",
    kind: "government",
  },
  {
    label: "사업내용 공고비",
    amount: "100,000 VND",
    kind: "government",
  },
  {
    label: "법인 인감",
    amount: "150,000~500,000 VND",
    kind: "market",
  },
  {
    label: "전자서명",
    amount: "약 1,530,000 VND",
    kind: "market",
  },
  {
    label: "전자세금계산서 초기설정",
    amount: "935,000~2,000,000 VND",
    kind: "market",
  },
];

export const DIRECT_PERMIT_COMPANY_TOTAL = "약 1,200,000~4,000,000 VND";

export const DIRECT_PERMIT_COMPANY_GUIDE =
  "법인설립은 정부 고시 수수료 외에도 인감·전자서명·세무 초기설정 등 실무 비용이 함께 발생하는 경우가 많습니다. 아래 목록은 직접 진행 시 흔히 준비하는 항목을 참고용으로 정리한 것입니다.";

export const COST_CHECK_SERVICES: CostCheckService[] = [
  {
    id: "tamtru",
    label: "임시거주등록 (땀주)",
    shortLabel: "땀주",
    description: "임시거주 신고·등록",
    currency: "USD",
    governmentFee: "무료",
    source: "Circular 04/2015/TT-BCA",
    marketMin: 30,
    marketMax: 100,
    marketNote: "대행·번역·이동 비용 포함 시장 참고 범위",
    govFeeAmount: 0,
    marketUsualFeeAmount: 65,
    lookupGuide:
      "임시거주 신고 자체는 정부 수수료가 없지만, 대행·이동·서류 준비 비용은 별도로 발생할 수 있습니다.",
    ctaLabel: "땀주 가능성 진단 (CHECK)",
    ctaHref: "/check/tamtru",
  },
  {
    id: "driving-license",
    label: "운전면허 전환",
    shortLabel: "운전면허",
    description: "외국인 운전면허 교환·전환",
    currency: "VND",
    governmentFee: "135,000 VND",
    source: "국가공공서비스 포털 — 외국인 운전면허 교환 절차",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 135_000,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "외국인 운전면허 교환 정부 수수료는 국가공공서비스 포털 기준입니다. 번역·공증 등 추가 비용은 별도로 발생할 수 있습니다.",
    ctaLabel: "운전면허 가능성 진단 (CHECK)",
    ctaHref: "/check/driving-license",
    officialSources: [
      {
        region: "외국인 운전면허 교환",
        applicationType: "new",
        amount: 135_000,
        currency: "VND",
        source: "국가공공서비스 포털 — 외국인 운전면허 교환 절차",
        sourceType: "official_government_document",
        checkedDate: "2026-08-23",
        status: "VERIFIED",
      },
    ],
  },
  {
    id: "trc",
    label: "거주증 (TRC) 신규",
    shortLabel: "TRC",
    description: "거주증 신규 발급",
    currency: "USD",
    governmentFee: "최대 $165 (5~10년 구간 기준, 구간별 상이)",
    source: "Circular 28/2026/TT-BTC (2026.4.1 시행)",
    marketMin: 250,
    marketMax: 400,
    marketNote: "정부 수수료·번역·대행 포함 시장 참고 범위",
    govFeeAmount: 165,
    marketUsualFeeAmount: 160,
    lookupGuide:
      "거주증 정부 수수료는 체류 기간 구간에 따라 달라집니다. 견적 비교 전 본인 해당 구간을 먼저 확인하는 것이 좋습니다.",
    ctaLabel: "TRC 가능성 진단 (CHECK)",
    ctaHref: "/check/trc",
  },
  {
    id: "wp",
    label: "노동허가증 (WP)",
    shortLabel: "WP",
    description: "노동허가 신청·갱신",
    currency: "USD",
    governmentFee: "400,000~1,000,000 VND (지역별 상이)",
    source: "Circular 85/2019/TT-BTC(개정), Decree 152/2020·219/2025/ND-CP",
    marketMin: 400,
    marketMax: 800,
    marketNote: "정부 수수료·번역·대행 포함 시장 참고 범위",
    govFeeAmount: 28,
    marketUsualFeeAmount: 572,
    lookupGuide:
      "노동허가 정부 수수료는 관할 지역에 따라 VND 금액이 달라집니다. 견적은 정부 수수료와 대행·번역 비용이 함께 포함됐는지 확인하세요.",
    ctaLabel: "WP 가능성 진단 (CHECK)",
    ctaHref: "/check/wp",
    officialSources: [
      {
        region: "Hà Nội",
        applicationType: "new",
        amount: 400_000,
        currency: "VND",
        source: "QĐ 396/QĐ-TTPVHCC (Hà Nội TTPVHCC, 2026-03-31)",
        sourceType: "official_government_document",
        sourceDate: "2026-03-31",
        checkedDate: "2026-08-15",
        status: "VERIFIED",
      },
      {
        region: "Hà Nội",
        applicationType: "reissue",
        amount: 300_000,
        currency: "VND",
        source: "QĐ 396/QĐ-TTPVHCC (Hà Nội TTPVHCC, 2026-03-31)",
        sourceType: "official_government_document",
        sourceDate: "2026-03-31",
        checkedDate: "2026-08-15",
        status: "VERIFIED",
      },
      {
        region: "Hà Nội",
        applicationType: "renewal",
        amount: 300_000,
        currency: "VND",
        source: "QĐ 396/QĐ-TTPVHCC (Hà Nội TTPVHCC, 2026-03-31)",
        sourceType: "official_government_document",
        sourceDate: "2026-03-31",
        checkedDate: "2026-08-15",
        status: "VERIFIED",
      },
      {
        region: "Quảng Ngãi",
        applicationType: "new",
        amount: 600_000,
        currency: "VND",
        source: "NQ 16/2025/NQ-HĐND (HĐND tỉnh Quảng Ngãi, 2025-10-24)",
        sourceType: "official_government_document",
        sourceDate: "2025-10-24",
        checkedDate: "2026-08-15",
        status: "VERIFIED",
      },
      {
        region: "Quảng Ngãi",
        applicationType: "reissue",
        amount: 450_000,
        currency: "VND",
        source: "NQ 16/2025/NQ-HĐND (HĐND tỉnh Quảng Ngãi, 2025-10-24)",
        sourceType: "official_government_document",
        sourceDate: "2025-10-24",
        checkedDate: "2026-08-15",
        status: "VERIFIED",
      },
      {
        region: "Quảng Ngãi",
        applicationType: "renewal",
        amount: 450_000,
        currency: "VND",
        source: "NQ 16/2025/NQ-HĐND (HĐND tỉnh Quảng Ngãi, 2025-10-24)",
        sourceType: "official_government_document",
        sourceDate: "2025-10-24",
        checkedDate: "2026-08-15",
        status: "VERIFIED",
      },
      {
        region: "TP. Hồ Chí Minh",
        applicationType: "new",
        amount: 600_000,
        currency: "VND",
        source: "NQ 09/2022/NQ-HĐND (HĐND TP.HCM, 2022-07-08)",
        sourceType: "official_government_document",
        sourceDate: "2022-07-20",
        checkedDate: "2026-08-15",
        status: "OFFICIAL_CURRENT_CHECK_REQUIRED",
        uncertainty:
          "2025.7.1 행정구역 통합(舊 Bình Dương·Bà Rịa-Vũng Tàu 병합) 이후 이 금액이 그대로 적용되는지, 온라인 신청 면제 조항(NQ 07/2024)의 2026년 현재 유효 여부가 확인되지 않았습니다.",
        verificationNote:
          "공식 결의안 원문(NQ 09/2022/NQ-HĐND)은 확인되었으나, 행정구역 통합 이후 현재 적용 여부는 별도 확인이 필요합니다.",
      },
      {
        region: "TP. Hồ Chí Minh",
        applicationType: "reissue",
        amount: 450_000,
        currency: "VND",
        source: "NQ 09/2022/NQ-HĐND (HĐND TP.HCM, 2022-07-08)",
        sourceType: "official_government_document",
        sourceDate: "2022-07-20",
        checkedDate: "2026-08-15",
        status: "OFFICIAL_CURRENT_CHECK_REQUIRED",
        uncertainty: "2025.7.1 행정구역 통합 이후 현재 적용 여부 확인 필요.",
      },
      {
        region: "TP. Hồ Chí Minh",
        applicationType: "renewal",
        amount: 450_000,
        currency: "VND",
        source: "NQ 09/2022/NQ-HĐND (HĐND TP.HCM, 2022-07-08)",
        sourceType: "official_government_document",
        sourceDate: "2022-07-20",
        checkedDate: "2026-08-15",
        status: "OFFICIAL_CURRENT_CHECK_REQUIRED",
        uncertainty: "2025.7.1 행정구역 통합 이후 현재 적용 여부 확인 필요.",
      },
      {
        region: "Quảng Ninh",
        applicationType: "new",
        amount: null,
        currency: "VND",
        source: "NQ 97/2025/NQ-HĐND (HĐND tỉnh Quảng Ninh, 2025-12-16, 2026~2030 적용 예정)",
        sourceType: "official_government_document",
        sourceDate: "2025-12-16",
        checkedDate: "2026-08-15",
        status: "PENDING",
        uncertainty:
          "구 결의안(NQ 62/2017, NQ 84/2022)은 폐지가 확인되었으나 신규 금액 원문은 아직 확인하지 못했습니다.",
      },
      {
        region: "Đồng Nai",
        applicationType: "new",
        amount: null,
        currency: "VND",
        source: "NQ 43/2025/NQ-HĐND (HĐND tỉnh Đồng Nai, 2026-01-01 시행 예정)",
        sourceType: "official_government_document",
        checkedDate: "2026-08-15",
        status: "PENDING",
        uncertainty: "결의안 존재는 확인되었으나 구체적 금액 원문은 아직 확인하지 못했습니다.",
      },
    ],
  },
  {
    id: "company",
    label: "외국인 법인설립 (ERC)",
    shortLabel: "법인설립",
    description: "ERC 등록·설립",
    currency: "USD",
    governmentFee:
      "등록비 25,000~50,000 VND(온라인 무료) + 공고비 100,000 VND (IRC 별도 수수료는 미확인, ERC에 포함해 표기)",
    source: "Thông tư 47/2019/TT-BTC(개정 64/2025)",
    marketMin: 1200,
    marketMax: 2500,
    marketNote: "ERC·IRC·번역·대행 포함 시장 참고 범위",
    govFeeAmount: 5,
    marketUsualFeeAmount: 1745,
    lookupGuide:
      "법인설립 정부 고시 수수료는 상대적으로 낮지만, 번역·공증·대행·후속 인허가 비용이 견적에 크게 반영되는 경우가 많습니다.",
    ctaLabel: "법인설립 가능성 진단 (REGISTER)",
    ctaHref: "/register/company",
  },
  {
    id: "admin",
    label: "행정문서 리뷰",
    shortLabel: "행정문서",
    description: "출입국·노동·세무 공문서 검토",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "행정문서 검토는 문서 유형·분량·긴급 여부에 따라 상담 비용이 달라질 수 있습니다. 확인된 상담가격이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "행정문서 검토 (VERIFY)",
    ctaHref: "/verify/admin",
  },
  {
    id: "real-estate",
    label: "부동산 문서 리뷰",
    shortLabel: "부동산",
    description: "임대·매매 계약서",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "부동산 문서 검토는 계약 유형·특약·보증금 조건에 따라 상담 비용이 달라질 수 있습니다. 확인된 상담가격이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "부동산 문서 검토 (VERIFY)",
    ctaHref: "/verify/real-estate",
  },
  {
    id: "fraud",
    label: "사기문서 리뷰",
    shortLabel: "사기문서",
    description: "투자·거래 사기 의심 문서",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "사기 의심 문서 검토는 문서 유형·피해 정황·긴급 여부에 따라 상담 비용이 달라질 수 있습니다. 확인된 상담가격이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "사기문서 검토 (VERIFY)",
    ctaHref: "/verify/fraud",
  },
  {
    id: "tax",
    label: "세무문서 리뷰",
    shortLabel: "세무문서",
    description: "세금 고지서·신고서",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "세무문서 검토는 고지·신고 유형과 대응 범위에 따라 상담 비용이 달라질 수 있습니다. 확인된 상담가격이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "세무문서 검토 (VERIFY)",
    ctaHref: "/verify/tax",
  },
  {
    id: "notary",
    label: "서류 공증·번역",
    shortLabel: "공증번역",
    description: "공증 1페이지 + 첫 번역",
    currency: "VND",
    governmentFee: "공증 10,000 VND/페이지 (첫 번역)",
    source: "Circular 257/2016/TT-BTC",
    marketMin: 40_000,
    marketMax: 310_000,
    marketNote: "공증 10,000 VND + 번역료 30,000~300,000 VND/페이지 참고 합산 범위",
    govFeeAmount: 10_000,
    marketUsualFeeAmount: 165_000,
    lookupGuide:
      "공증 수수료는 정부 고시가 있지만, 번역 품질·긴급 여부·페이지 수에 따라 번역 비용 차이가 큽니다.",
    ctaLabel: "서류 검토 상담 (VERIFY)",
    ctaHref: "/verify/unclear",
  },
];

/** REGISTER 7종 — 공식 수수료·시장가 미연결. COST_CHECK_SERVICES에 넣지 않아 cost-check 카탈로그 라우팅을 바꾸지 않음. */
export const REGISTER_PENDING_COST_SERVICES: CostCheckService[] = [
  {
    id: "restaurant",
    label: "식당허가",
    shortLabel: "식당허가",
    description: "요식업 영업허가",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "식당허가 전용 공식 수수료·시장가격 데이터가 아직 연결되지 않았습니다. 확인된 기준이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "식당허가 가능성 진단 (REGISTER)",
    ctaHref: "/register/restaurant",
  },
  {
    id: "hygiene",
    label: "위생허가",
    shortLabel: "위생허가",
    description: "식품·위생 안전 인증",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "위생허가 전용 공식 수수료·시장가격 데이터가 아직 연결되지 않았습니다. 확인된 기준이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "위생허가 가능성 진단 (REGISTER)",
    ctaHref: "/register/hygiene",
  },
  {
    id: "fire-safety",
    label: "소방허가",
    shortLabel: "소방허가",
    description: "소방시설 안전 인증",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "소방허가 전용 공식 수수료·시장가격 데이터가 아직 연결되지 않았습니다. 확인된 기준이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "소방허가 가능성 진단 (REGISTER)",
    ctaHref: "/register/fire-safety",
  },
  {
    id: "cosmetics",
    label: "화장품허가",
    shortLabel: "화장품허가",
    description: "화장품 제조·유통 허가",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "화장품허가 전용 공식 수수료·시장가격 데이터가 아직 연결되지 않았습니다. 확인된 기준이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "화장품허가 가능성 진단 (REGISTER)",
    ctaHref: "/register/cosmetics",
  },
  {
    id: "environment",
    label: "환경허가",
    shortLabel: "환경허가",
    description: "환경영향평가·배출허가",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "환경허가 전용 공식 수수료·시장가격 데이터가 아직 연결되지 않았습니다. 확인된 기준이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "환경허가 가능성 진단 (REGISTER)",
    ctaHref: "/register/environment",
  },
  {
    id: "medical-device",
    label: "의료기기 수입·유통허가",
    shortLabel: "의료기기허가",
    description: "의료기기 수입·유통 허가",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "의료기기허가 전용 공식 수수료·시장가격 데이터가 아직 연결되지 않았습니다. 확인된 기준이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "의료기기허가 가능성 진단 (REGISTER)",
    ctaHref: "/register/medical-device",
  },
  {
    id: "franchise",
    label: "프랜차이즈 등록",
    shortLabel: "프랜차이즈",
    description: "가맹사업 등록·계약 허가",
    currency: "VND",
    governmentFee: "",
    source: "",
    marketMin: 0,
    marketMax: 0,
    marketNote: "",
    govFeeAmount: 0,
    marketUsualFeeAmount: 0,
    lookupGuide:
      "프랜차이즈 등록 전용 공식 수수료·시장가격 데이터가 아직 연결되지 않았습니다. 확인된 기준이 확보되면 이 화면에 안내됩니다.",
    ctaLabel: "프랜차이즈 등록 가능성 진단 (REGISTER)",
    ctaHref: "/register/franchise",
  },
];

export function getCostCheckService(id: CostCheckServiceId): CostCheckService {
  const service =
    COST_CHECK_SERVICES.find((item) => item.id === id) ??
    REGISTER_PENDING_COST_SERVICES.find((item) => item.id === id);
  if (!service) throw new Error(`Unknown cost check service: ${id}`);
  return service;
}

export function getFairReferenceTotal(service: CostCheckService): number {
  return service.govFeeAmount + service.marketUsualFeeAmount;
}

export function formatCostAmount(amount: number, currency: CostCheckCurrency): string {
  if (currency === "USD") {
    return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `${amount.toLocaleString("ko-KR")} VND`;
}

export function evaluateCostQuoteReview(
  service: CostCheckService,
  quotedAmount: number
): {
  verdict: ReviewVerdict;
  title: string;
  summary: string;
  detail: string;
  fairReference: number;
  bubblePercent: number | null;
} {
  const fairReference = getFairReferenceTotal(service);
  const veryLowThreshold = service.marketMin * 0.65;

  if (quotedAmount < veryLowThreshold) {
    return {
      verdict: "very_low",
      title: "너무 낮음 — 서비스 누락 확인",
      summary: "견적이 통상 범위보다 현저히 낮습니다.",
      detail:
        "이 정도 금액이면 필수 서비스(번역·공증·대행·재제출 대응 등)가 빠졌거나, 진행 중 추가 비용이 발생할 가능성이 있습니다. 포함 항목을 꼭 확인해보시길 권장합니다.",
      fairReference,
      bubblePercent: null,
    };
  }

  const bubblePercent = fairReference > 0 ? ((quotedAmount - fairReference) / fairReference) * 100 : 0;

  if (bubblePercent <= 0) {
    return {
      verdict: "fair",
      title: "적정",
      summary: "입력 견적이 참고 적정 범위 이하 또는 근접합니다.",
      detail:
        "정부 수수료와 통상적인 대행·서류 비용을 합친 참고 기준 대비 무난한 수준입니다. 다만 포함 항목과 처리 기간은 견적서에서 한 번 더 확인하세요.",
      fairReference,
      bubblePercent,
    };
  }

  if (bubblePercent <= 30) {
    return {
      verdict: "caution",
      title: "주의 — 대행료 거품 포함 가능",
      summary: `참고 적정 범위보다 약 ${bubblePercent.toFixed(0)}% 높습니다.`,
      detail:
        "긴급 처리, 추가 번역, 방문 동행 등 부가 서비스가 포함됐을 수 있습니다. 견적서 항목별로 무엇이 포함됐는지 확인해보시길 권장합니다.",
      fairReference,
      bubblePercent,
    };
  }

  return {
    verdict: "risk",
    title: "위험 — 포함 항목 확인 권장",
    summary: `참고 적정 범위보다 약 ${bubblePercent.toFixed(0)}% 높습니다.`,
    detail:
      "이 범위를 넘으면 어떤 서비스가 포함됐는지(인허가 패키지, 후속 지원, 다수 서류 번역 등) 확인해보시길 권장합니다. 동일 조건의 다른 견적과 비교해 보시는 것도 도움이 됩니다.",
    fairReference,
    bubblePercent,
  };
}

export function docPrepHint(status: DocPrepStatus): string | null {
  switch (status) {
    case "not_started":
      return "서류가 아직 준비되지 않았다면, 번역·공증·보완 서류 비용이 견적에 추가될 수 있습니다.";
    case "partial":
      return "일부 서류만 준비된 상태라면, 누락 항목에 따른 추가 비용이 발생할 수 있습니다.";
    case "ready":
      return "서류가 대체로 준비된 경우, 견적은 대행·제출·행정 수수료 중심으로 비교하시면 됩니다.";
    default:
      return null;
  }
}
