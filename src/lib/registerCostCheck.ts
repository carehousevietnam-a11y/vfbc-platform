import type { CostCheckService, CostCheckServiceId } from "@/lib/costCheck";

/**
 * REGISTER COST CHECK 상세 모델.
 * CHECK의 CostCheckService(정부 수수료 1줄 + 시장 범위)를 대체하지 않는다.
 * 확인된 공식/시장 항목만 수록하고, 미확인·조건 미결정은 금액을 만들지 않는다.
 */

export type RegisterCostLineStatus = "verified" | "checking" | "conditional";
export type RegisterCostLineType = "government" | "market" | "third_party" | "conditional";
export type RegisterCostGroup = "government" | "third_party" | "market";
export type RegisterTotalStatus = "computable" | "partial" | "unavailable";

export type RegisterCostLine = {
  label: string;
  amount: string | null;
  unit?: string;
  type: RegisterCostLineType;
  condition?: string;
  source: string;
  sourceUrl?: string;
  sourceDate?: string;
  status: RegisterCostLineStatus;
};

export type RegisterCostModel = {
  serviceId: CostCheckServiceId;
  governmentSummary: string;
  governmentHint: string;
  marketSummary: string;
  marketHint: string;
  structureSummary: string;
  structureHint: string;
  governmentLines: RegisterCostLine[];
  thirdPartyLines: RegisterCostLine[];
  marketLines: RegisterCostLine[];
  totalStatus: RegisterTotalStatus;
  totalDisplay: string;
  totalNote: string;
};

const TT64_WINDOW = "2025-07-01 ~ 2026-12-31, Thông tư 64/2025/TT-BTC 50% 감면";

function lineDisplay(line: RegisterCostLine): string {
  if (line.status === "verified" && line.amount) return line.amount;
  if (line.status === "conditional") return line.amount ?? "조건에 따라 달라집니다";
  if (line.status === "checking") {
    if (line.type === "market") return "시장가격 확인 중";
    if (line.type === "government") return "공식 비용 확인 중";
    return "확인 중";
  }
  return "조건에 따라 달라집니다";
}

export function registerCostLineDisplay(line: RegisterCostLine): string {
  return lineDisplay(line);
}

/**
 * Company FDI 시장 비교용 — CHECK evaluateCostQuoteReview 재사용.
 * govFeeAmount=0: 정부 VND와 시장 USD를 합산하지 않음.
 * marketUsualFeeAmount=5000: 일반 FDI 공개 범위 상한(임의 평균 아님).
 * costCheck.ts company 행을 바꾸지 않음(CHECK/공유 데이터 보호).
 */
export const COMPANY_FDI_REVIEW_SERVICE: CostCheckService = {
  id: "company",
  label: "외국인 법인설립 (FDI)",
  shortLabel: "법인설립",
  description: "FDI 법인설립 대행 시장 비교",
  currency: "USD",
  governmentFee: "ERC 온라인 0 · 오프라인 25,000 VND + 공표 100,000 VND",
  source: "Thông tư 47/2019/TT-BTC, Thông tư 64/2025/TT-BTC · 2026 FDI 공개 시장자료",
  marketMin: 2_000,
  marketMax: 5_000,
  marketNote: "일반 FDI 전문 대행 공개 사례 USD 2,000~5,000+",
  govFeeAmount: 0,
  marketUsualFeeAmount: 5_000,
  lookupGuide:
    "정부 공식비용(VND)과 FDI 대행 시장가격(USD)은 합산·환율 환산하지 않습니다. 투자자본은 설립비용이 아닙니다.",
  ctaLabel: "법인설립 가능성 진단 (REGISTER)",
  ctaHref: "/register/company",
};

/**
 * Restaurant ATTP 시장 비교용 — Company Master와 동일 evaluateCostQuoteReview 구조.
 * govFeeAmount=0: 정부 심사비(VND)와 시장 대행가(VND)를 합산하지 않음.
 * marketMin/Max: 식음 풀패키지 형성가격 8,000,000–15,000,000 VND (평균·극단값 아님).
 */
export const RESTAURANT_REVIEW_SERVICE: CostCheckService = {
  id: "restaurant",
  label: "식당·요식업 등록 (ATTP)",
  shortLabel: "식당허가",
  description: "식당 식품안전 대행 시장 비교",
  currency: "VND",
  governmentFee: "200인 미만 350,000 VND / 200인 이상 500,000 VND",
  source: "Thông tư 67/2021/TT-BTC, Thông tư 64/2025/TT-BTC · 2026 식당 ATTP 공개 시장자료",
  marketMin: 8_000_000,
  marketMax: 15_000_000,
  marketNote: "시장 일반가격 8,000,000–15,000,000 VND",
  govFeeAmount: 0,
  marketUsualFeeAmount: 15_000_000,
  lookupGuide:
    "정부 공식비용(식품안전 심사)과 시장 대행가격은 합산하지 않습니다. 사업등록·소방·시설 보완은 별도일 수 있습니다.",
  ctaLabel: "식당허가 가능성 진단 (REGISTER)",
  ctaHref: "/register/restaurant",
};

/**
 * Master 견적 비교용 CostCheckService — 기존 MODEL 수치만 재사용(문구·금액 재설계 금지).
 * 시장 비교 불가 서비스는 null.
 */
export function getRegisterReviewService(id: CostCheckServiceId): CostCheckService | null {
  if (id === "restaurant") return RESTAURANT_REVIEW_SERVICE;
  if (id === "company") return COMPANY_FDI_REVIEW_SERVICE;

  const model = getRegisterCostModel(id);
  if (!model) return null;

  if (id === "hygiene") {
    return {
      id: "hygiene",
      label: "위생허가",
      shortLabel: "위생허가",
      description: "위생·식품안전 대행 시장 비교",
      currency: "VND",
      governmentFee: model.governmentSummary,
      source: model.governmentLines[0]?.source ?? "",
      marketMin: 8_000_000,
      marketMax: 15_000_000,
      marketNote: model.marketSummary,
      govFeeAmount: 0,
      marketUsualFeeAmount: 15_000_000,
      lookupGuide: model.structureHint,
      ctaLabel: "위생허가 가능성 진단 (REGISTER)",
      ctaHref: "/register/hygiene",
    };
  }

  if (id === "cosmetics") {
    return {
      id: "cosmetics",
      label: "화장품허가",
      shortLabel: "화장품허가",
      description: "화장품 공표 대행 시장 비교",
      currency: "VND",
      governmentFee: model.governmentSummary,
      source: model.governmentLines[0]?.source ?? "",
      marketMin: 2_000_000,
      marketMax: 3_500_000,
      marketNote: model.marketSummary,
      govFeeAmount: 0,
      marketUsualFeeAmount: 3_500_000,
      lookupGuide: model.structureHint,
      ctaLabel: "화장품허가 가능성 진단 (REGISTER)",
      ctaHref: "/register/cosmetics",
    };
  }

  return null;
}

const COMPANY_MODEL: RegisterCostModel = {
  serviceId: "company",
  governmentSummary: "ERC 온라인 0 VND · 오프라인 25,000 VND + 공표 100,000 VND",
  governmentHint: "정부기관 납부 수수료",
  marketSummary: "USD 2,000~5,000+",
  marketHint: "일반적인 시장가격 범위",
  structureSummary: "시장 일반가격(USD) 기준 비교",
  structureHint: "정부비용(VND)과 시장 일반가격(USD)은 합산·환율 환산하지 않습니다.",
  governmentLines: [
    {
      label: "기업등록 수수료 (ERC)",
      amount: "온라인 0 VND / 오프라인 25,000 VND/회",
      unit: "회",
      type: "government",
      condition: `전자네트워크(온라인) 등록은 Thông tư 47/2019/TT-BTC에 따라 면제(0 VND). 직접·우편 제출은 원 요금 50,000 VND의 50%인 25,000 VND. ${TT64_WINDOW}.`,
      source: "Thông tư 47/2019/TT-BTC, Thông tư 64/2025/TT-BTC",
      sourceUrl:
        "https://angiang.gov.vn/vi/toan-van-thong-tu-642025tt-btc-quy-dinh-muc-thu-mien-mot-so-khoan-phi-le-phi",
      sourceDate: "2025-06-30",
      status: "verified",
    },
    {
      label: "등록내용 공표 비용",
      amount: "100,000 VND/회",
      unit: "회",
      type: "government",
      condition: "온라인 등록 시에도 공표 비용은 별도. ERC 등록 수수료 면제와 별개.",
      source: "Thông tư 47/2019/TT-BTC 부표 — 공표 100,000 VND/회",
      sourceUrl:
        "https://luatvietnam.vn/tin-van-ban-moi/dang-ky-doanh-nghiep-qua-mang-duoc-mien-le-phi-186-21986-article.html",
      sourceDate: "2019-08-05",
      status: "verified",
    },
    {
      label: "투자등록증(IRC) 수수료",
      amount: "0 VND (공개 공식 수수료)",
      type: "government",
      condition:
        "공개 행정·안내 자료상 국가 수수료 0 VND인 절차로 확인됨. 다만 절차·관할·업종 조건에 따라 별도 확인이 필요하면 조건부로 본다. 시장 대행비·번역·공증과 합치지 않음.",
      source: "국가 공공서비스/투자등록 안내 · 2026 공개 자료(IRC 국가 수수료 0)",
      status: "conditional",
    },
  ],
  thirdPartyLines: [
    {
      label: "법인 인감",
      amount: "150,000~500,000 VND",
      type: "third_party",
      condition: "정부 수수료가 아님. 실무에서 흔히 준비하는 항목이며 업체·사양에 따라 달라질 수 있음.",
      source: "기존 DIRECT_PERMIT_COMPANY_ITEMS",
      status: "conditional",
    },
    {
      label: "전자서명",
      amount: "약 1,530,000 VND",
      type: "third_party",
      condition: "정부 수수료가 아님. 세무·전자신고 실무에서 필요한 경우가 많음.",
      source: "기존 DIRECT_PERMIT_COMPANY_ITEMS",
      status: "conditional",
    },
    {
      label: "전자세금계산서 초기설정",
      amount: "935,000~2,000,000 VND",
      type: "third_party",
      condition: "설립 직후 영업 준비 단계에서 필요한 경우가 많음. 선택 패키지로 단정하지 않음.",
      source: "기존 DIRECT_PERMIT_COMPANY_ITEMS",
      status: "conditional",
    },
    {
      label: "번역·공증·합법화 (외국인 투자)",
      amount: null,
      type: "third_party",
      condition:
        "투자자 유형·서류 언어에 따라 필요. FDI 대행 견적에 포함되지 않은 경우가 많음. 확정 금액은 조건에 따라 달라집니다.",
      source: "외국인 투자 서류 실무 요건 · 공식 단가표 아님",
      status: "conditional",
    },
  ],
  marketLines: [
    {
      label: "FDI 전문 대행 (일반 공개 사례)",
      amount: "USD 2,000~5,000+",
      type: "market",
      condition:
        "외국인투자법인(FDI) 설립 전문 서비스 공개 사례. 내국인 법인설립 VND 패키지와 혼용 금지. 정부 공식비용과 합산·USD→VND 환율 환산·투자자본 포함 금지. 서비스 범위·정부비용 포함/별도·VAT·번역·공증은 사례마다 다름. 단일 평균 금지.",
      source:
        "City Lawyer USD 2,200 / XTVN Law Firm USD 2,000~5,000 / SBLaw non-conditional USD 4,500 / CRP Consulting USD 2,000~15,000 / RedTab standard USD 1,650~4,000 (2026 FDI 공개 시장자료)",
      sourceDate: "2026",
      status: "verified",
    },
    {
      label: "FDI 대행 (조건부·복잡 공개 사례)",
      amount: "USD 5,000~15,000+",
      type: "market",
      condition:
        "조건부 업종·추가 인허가·복잡 프로젝트 공개 사례. 일부 공개 시장자료는 USD 22,000까지 확인. 일반 FDI 사례와 섞어 평균내지 않음.",
      source:
        "SBLaw conditional minimum USD 7,000 / CRP Consulting up to USD 15,000 / RedTab conditional USD 3,400~22,000 / Viet An Law FDI vs 국내 설립 비용 구분 설명 (2026 공개 시장자료)",
      sourceDate: "2026",
      status: "verified",
    },
  ],
  totalStatus: "partial",
  totalDisplay: "정부비용(VND) · 시장 일반가격(USD) 별도",
  totalNote:
    "정부 공식비용과 시장 일반가격은 합산·환율 환산하지 않습니다. 투자자본은 설립비용이 아닙니다.",
};

/** Company 비용견적 — FDI 공개 원문 가격 사례만 (내국인 VND 패키지 제외 · 이름↔URL 일치). */
export const COMPANY_REGISTER_MARKET_CASES = [
  {
    name: "Nova Law",
    summary: "FDI set up from USD 2,000 · IRC·ERC·인감·은행계좌 포함 표기",
    url: "https://novalaw.vn/en/set-up-company-in-vietnam-service/",
  },
  {
    name: "SBLaw",
    summary: "IRC+ERC USD 4,000~4,500 · VAT·번역 별도(원문)",
    url: "https://sblaw.vn/establishment-of-software-outsourcing-enterprise/",
  },
  {
    name: "SBLaw (조건부)",
    summary: "조건부(예: Training License 포함) from USD 7,040 · 정부수수료 포함 표기",
    url: "https://sblaw.vn/the-legal-procedure-and-attorney-fee-for-setting-up-company-in-vietnam/",
  },
  {
    name: "XTVN Law Firm",
    summary: "FDI 설립 공개 요금표(2025-06-30~) · 조사 기준 USD 2,000~5,000",
    url: "https://xtlaw.com.vn/bang-gia.htm",
  },
  {
    name: "Viet An Law",
    summary: "국내 from 1,500,000 VND · FDI from 26,000,000 VND · 법률/IRC 비용 별도",
    url: "https://vietanlaw.com/cost-of-company-registration/",
  },
  {
    name: "Viet An Law (등록 가이드)",
    summary: "Typical legal service fees USD 2,000~15,000 · 투자자본 미포함",
    url: "https://vietanlaw.com/company-registration-in-vietnam/",
  },
] as const;

const RESTAURANT_MODEL: RegisterCostModel = {
  serviceId: "restaurant",
  governmentSummary: "식품안전 심사 350,000 또는 500,000 VND",
  governmentHint: "제공 규모(200인 미만/이상)에 따라 다름 · 2026.12.31까지 50% 감면",
  marketSummary: "8,000,000–15,000,000 VND",
  marketHint: "일반적인 시장가격 범위",
  structureSummary: "시장 일반가격(VND) 기준 비교",
  structureHint: "정부 심사비와 시장 대행가격은 합산하지 않습니다.",
  governmentLines: [
    {
      label: "식품안전 조건 충족 인증 심사 (음식점)",
      amount: "200인 미만 350,000 VND / 200인 이상 500,000 VND",
      unit: "회/시설",
      type: "government",
      condition: `원 요금 700,000 / 1,000,000 VND의 50%. ${TT64_WINDOW}. 사업등록·소방 등 다른 허가는 별도.`,
      source: "Thông tư 67/2021/TT-BTC, Thông tư 64/2025/TT-BTC",
      sourceUrl:
        "https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Thong-tu-64-2025-TT-BTC-mien-mot-so-khoan-phi-le-phi-nham-ho-tro-doanh-nghiep-nguoi-dan-662967.aspx",
      sourceDate: "2025-06-30",
      status: "verified",
    },
    {
      label: "사업등록 관련 비용",
      amount: null,
      type: "conditional",
      condition:
        "법인/호킨 형태에 따라 기업등록 수수료가 별도로 발생할 수 있음. 식당허가 심사비와 합치지 않음.",
      source: "기업등록은 company 모델(Thông tư 47/2019, 64/2025) 별도",
      status: "conditional",
    },
    {
      label: "PCCC 등 별도 조건부 허가",
      amount: null,
      type: "conditional",
      condition: "시설·투자 규모에 따라 소방 설계심사 등이 필요할 수 있음. 금액은 fire-safety 모델 참고.",
      source: "Thông tư 70/2025/TT-BTC (투자비 × 요율)",
      status: "conditional",
    },
  ],
  thirdPartyLines: [
    {
      label: "건강검진·검체/시험 등",
      amount: null,
      type: "third_party",
      condition: "시설 준비 상태에 따라 필요. 확인된 공식 단가표를 아직 연결하지 않음.",
      source: "공식 단가 미연결",
      status: "checking",
    },
  ],
  marketLines: [
    {
      label: "식당·식음 ATTP 대행 (시장 일반가격)",
      amount: "8,000,000–15,000,000 VND",
      type: "market",
      condition:
        "식음 풀패키지(조사·서류·제출·심사 동행) 공개 형성 구간. 서류만·cam kết·체인·생산·국가비 미포함 저가 사례와 평균·합산하지 않음.",
      source:
        "Vạn Luật 표준 8–12M / Hoàng Nam 중규모 8–15M / Giấy Phép Nhanh 식음 12–15M / Trường Thuận Đức 식음 10–12M (2026 공개)",
      sourceDate: "2026",
      status: "verified",
    },
  ],
  totalStatus: "partial",
  totalDisplay: "정부비용 · 시장 일반가격 별도",
  totalNote:
    "정부 공식비용과 시장 대행가격은 합산하지 않습니다. 사업등록·소방·시설 보완·건강검진은 별도일 수 있습니다.",
};

/** Restaurant 비용견적 — 식음 풀패키지 형성가격 공개 사례 (평균 금지 · 이름↔URL 일치). */
export const RESTAURANT_REGISTER_MARKET_CASES = [
  {
    name: "Vạn Luật (표준)",
    summary: "표준 A-Z 8,000,000–12,000,000 VND · 최저대 형성",
    url: "https://vanluat.vn/bang-gia-dich-vu-xin-giay-attp-nha-hang-quan-an-moi-nhat-22301.html",
  },
  {
    name: "Hoàng Nam (중규모)",
    summary: "중규모 식당 8,000,000–15,000,000 VND",
    url: "https://hoangnam.com.vn/dich-vu-dang-ky-ve-sinh-an-toan-thuc-pham/",
  },
  {
    name: "Giấy Phép Nhanh (식음)",
    summary: "dịch vụ ăn uống 12,000,000–15,000,000 VND · 최고대 형성",
    url: "https://giayphepnhanh.com.vn/bang-gia-dich-vu-xin-giay-phep-con-2026",
  },
  {
    name: "Trường Thuận Đức (식음)",
    summary: "Bộ Y tế 식음 HKD 10,000,000–12,000,000 · 회사 12,000,000 VND",
    url: "https://tuvantruongthuanduc.vn/dich-vu-dang-ky-ve-sinh-an-toan-thuc-pham.html",
  },
  {
    name: "VLC",
    summary: "일반 회사/HKD 10,000,000 VND (대행 9M + 국가 1M)",
    url: "https://vlcvn.com/blogs/xin-giay-chung-nhan-ve-sinh-an-toan-thuc-pham-va-cong-bo/dich-vu-xin-cap-giay-phep-ve-sinh-an-toan-thuc-pham-tron-goi",
  },
] as const;

const HYGIENE_MODEL: RegisterCostModel = {
  serviceId: "hygiene",
  governmentSummary: "식품서비스 심사 350,000 또는 500,000 VND",
  governmentHint: "제공 규모(200인 미만/이상)에 따라 다름 · 2026.12.31까지 50% 감면",
  marketSummary: "8,000,000–15,000,000 VND",
  marketHint: "일반적인 시장가격 범위",
  structureSummary: "시장 일반가격(VND) 기준 비교",
  structureHint: "정부 심사비와 시장 대행가격은 합산하지 않습니다.",
  governmentLines: [
    {
      label: "식품서비스업 식품안전 조건 충족 인증 심사",
      amount: "200인 미만 350,000 VND / 200인 이상 500,000 VND",
      unit: "회/시설",
      type: "government",
      condition: `원 요금 700,000 / 1,000,000 VND의 50%. ${TT64_WINDOW}. 생산·유통 등 다른 시설 유형은 별도 단가일 수 있음.`,
      source: "Thông tư 67/2021/TT-BTC, Thông tư 64/2025/TT-BTC",
      sourceUrl:
        "https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Thong-tu-64-2025-TT-BTC-mien-mot-so-khoan-phi-le-phi-nham-ho-tro-doanh-nghiep-nguoi-dan-662967.aspx",
      sourceDate: "2025-06-30",
      status: "verified",
    },
  ],
  thirdPartyLines: [
    {
      label: "검체·시험·시설 보완",
      amount: null,
      type: "third_party",
      condition: "관할·시설 상태에 따라 필요. 확인된 공식 단가 없음.",
      source: "공식 단가 미연결",
      status: "checking",
    },
  ],
  marketLines: [
    {
      label: "위생·식품안전 대행 (시장 일반가격)",
      amount: "8,000,000–15,000,000 VND",
      type: "market",
      condition:
        "비교 가능한 공개 풀서비스 형성 구간(최저대 8,000,000 · 최고대 15,000,000). 평균·공사/설비 혼재 가격과 합산하지 않음.",
      source: "식음·위생 풀서비스 공개 형성가격 8,000,000–15,000,000 VND (2026)",
      sourceDate: "2026",
      status: "verified",
    },
  ],
  totalStatus: "partial",
  totalDisplay: "정부비용 · 시장 일반가격 별도",
  totalNote:
    "정부 공식비용과 시장 대행가격은 합산하지 않습니다. 시설 유형·보완·검체는 별도일 수 있습니다.",
};

const FIRE_MODEL: RegisterCostModel = {
  serviceId: "fire-safety",
  governmentSummary: "시설·설계·적용 대상에 따라 달라짐",
  governmentHint:
    "시설 규모·설계 범위 및 PCCC 적용 대상에 따라 공식 수수료가 달라져 현재 정보만으로 단일 금액을 특정하기 어렵습니다.",
  marketSummary: "업무 범위에 따라 달라짐",
  marketHint:
    "PCCC 설계·서류·심사와 실제 설비공사는 업무 범위가 달라 비용 차이가 큽니다. 동일 범위의 공개 가격이 부족해 임의의 시장가격을 제시하지 않습니다.",
  structureSummary: "조건 확인 후 안내",
  structureHint: "공식 심사비와 시장 대행가 모두 조건 미확정으로 합산하지 않습니다",
  governmentLines: [
    {
      label: "PCCC 설계 승인 심사비",
      amount: null,
      type: "government",
      condition:
        "Thông tư 70/2025/TT-BTC(2025-07-01 시행). 시설 규모·설계 범위 및 PCCC 적용 대상에 따라 공식 수수료가 달라져 현재 정보만으로 단일 금액을 특정하기 어렵습니다.",
      source: "Thông tư 70/2025/TT-BTC (2025-07-01 시행)",
      sourceUrl: "https://congbao.chinhphu.vn/van-ban/thong-tu-so-70-2025-tt-btc-45422/57423.htm",
      sourceDate: "2025-07-01",
      status: "conditional",
    },
  ],
  thirdPartyLines: [
    {
      label: "설계·기술문서",
      amount: null,
      type: "third_party",
      condition: "설계 유형에 따라 필요. 확인된 공식/공개 단가 없음.",
      source: "공식 단가 미연결",
      status: "checking",
    },
  ],
  marketLines: [
    {
      label: "소방허가 대행",
      amount: null,
      type: "market",
      condition:
        "PCCC 설계·서류·심사와 실제 설비공사는 업무 범위가 달라 비용 차이가 큽니다. 동일 범위의 공개 가격이 부족해 임의의 시장가격을 제시하지 않습니다.",
      source: "비교 가능 공개 형성가격 미확정",
      status: "checking",
    },
  ],
  totalStatus: "unavailable",
  totalDisplay: "조건 확인 후 안내",
  totalNote:
    "PCCC 설계·서류·심사와 실제 설비공사는 업무 범위가 달라 비용 차이가 큽니다. 동일 범위의 공개 가격이 부족해 임의의 시장가격을 제시하지 않습니다.",
};

const ENVIRONMENT_MODEL: RegisterCostModel = {
  serviceId: "environment",
  governmentSummary: "유형·규모·관할에 따라 달라짐",
  governmentHint:
    "환경허가 유형·사업 규모 및 관할 지방정부에 따라 공식 수수료가 달라 현재 정보만으로 단일 금액을 특정하기 어렵습니다.",
  marketSummary: "절차·업무 범위에 따라 달라짐",
  marketHint:
    "환경허가·환경등록·환경영향평가는 절차와 업무 범위가 서로 다릅니다. 동일 범위의 공개 가격이 부족해 임의의 시장가격을 제시하지 않습니다.",
  structureSummary: "조건 확인 후 안내",
  structureHint: "공식 심사비와 시장 대행가 모두 조건 미확정으로 합산하지 않습니다",
  governmentLines: [
    {
      label: "환경허가(Giấy phép môi trường) 심사비",
      amount: null,
      type: "government",
      condition:
        "환경허가 유형·사업 규모 및 관할 지방정부에 따라 공식 수수료가 달라 현재 정보만으로 단일 금액을 특정하기 어렵습니다. ĐTM과 별도 절차.",
      source: "Thông tư 85/2019/TT-BTC(개정 106/2021) · 지방 HĐND 규정",
      sourceUrl:
        "https://www.dulieuphapluat.vn/van-ban/thue-phi-le-phi-van-ban/nghi-quyet-372026nq-hdnd-quy-dinh-muc-thu-che-do-thu-nop-quan-ly-va-su-dung-phi-tham-dinh-bao-cao-danh-gia-tac-dong-moi-truong-phi-tham-dinh-cap-dieu-chinh-giay-phep-moi-truong-tren-dia-ban-tinh-dong-thap-1426846.html",
      sourceDate: "2026",
      status: "conditional",
    },
  ],
  thirdPartyLines: [
    {
      label: "측정·분석·환경기술 문서",
      amount: null,
      type: "third_party",
      condition:
        "프로젝트 규모·영향 평가 범위에 따라 필요. ĐTM·측정·분석·공사비와 환경허가 수수료를 합산·시장가로 쓰지 않음.",
      source: "공식 단가 미연결",
      status: "checking",
    },
  ],
  marketLines: [
    {
      label: "환경허가 대행·전문기관",
      amount: null,
      type: "market",
      condition:
        "환경허가·환경등록·환경영향평가는 절차와 업무 범위가 서로 다릅니다. 동일 범위의 공개 가격이 부족해 임의의 시장가격을 제시하지 않습니다.",
      source: "비교 가능 공개 형성가격 미확정",
      status: "checking",
    },
  ],
  totalStatus: "unavailable",
  totalDisplay: "조건 확인 후 안내",
  totalNote:
    "환경허가·환경등록·환경영향평가는 절차와 업무 범위가 서로 다릅니다. 동일 범위의 공개 가격이 부족해 임의의 시장가격을 제시하지 않습니다.",
};

const COSMETICS_MODEL: RegisterCostModel = {
  serviceId: "cosmetics",
  governmentSummary: "500,000 VND/제품 공표 심사",
  governmentHint: "제품(호소) 단위 공식 수수료",
  marketSummary: "2,000,000–3,500,000 VND",
  marketHint: "일반적인 시장가격 범위",
  structureSummary: "시장 일반가격(VND) 기준 비교",
  structureHint: "정부 공표 심사비와 시장 대행가격은 합산하지 않습니다. 제품 1건 기준.",
  governmentLines: [
    {
      label: "화장품 제품 공표 심사비",
      amount: "500,000 VND/제품",
      unit: "제품",
      type: "government",
      condition: "국내 생산·수입 모두 동일 공식 단가. 제품(호소) 1건 단위. 국가공공서비스포털 표기와 일치.",
      source: "Thông tư 41/2023/TT-BTC · Cổng DVC ma_thu_tuc=3712",
      sourceUrl: "https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=3712",
      sourceDate: "2023-08-01",
      status: "verified",
    },
  ],
  thirdPartyLines: [
    {
      label: "번역·공증·영사합법화·CFS (수입)",
      amount: null,
      type: "third_party",
      condition:
        "수입 제품에 필요할 수 있음. 국내 생산과 동일 비용으로 계산하지 않음. 확인된 공식 단가 없음.",
      source: "DVC 수입 화장품 CFS 요구 · 공식 수수료표 아님",
      sourceUrl: "https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=3712",
      status: "conditional",
    },
    {
      label: "시험·검사",
      amount: null,
      type: "third_party",
      condition: "제품에 따라 필요. 시장 일반가격에 합산하지 않음. 확인된 공식 단가 없음.",
      source: "공식 단가 미연결",
      status: "checking",
    },
  ],
  marketLines: [
    {
      label: "화장품 제품 공표·신고 대행 (시장 일반가격)",
      amount: "2,000,000–3,500,000 VND",
      type: "market",
      condition:
        "제품 1건 기준 공개 풀서비스 형성 구간(최저대 2,000,000 · 최고대 3,500,000). 평균·검사비·CGMP/생산시설 허가·1M 저가·5M 제조시설 범위와 합산·혼용하지 않음.",
      source: "화장품 제품 공표/신고 대행 공개 형성가격 2,000,000–3,500,000 VND/제품 (2026)",
      sourceDate: "2026",
      status: "verified",
    },
  ],
  totalStatus: "partial",
  totalDisplay: "정부비용 · 시장 일반가격 별도",
  totalNote:
    "공식 공표 심사비(500,000 VND/제품)와 시장 대행가격(제품 1건)은 합산하지 않습니다. 검사·CGMP·생산시설은 별도입니다.",
};

const MEDICAL_MODEL: RegisterCostModel = {
  serviceId: "medical-device",
  governmentSummary: "A 500,000 / B 1,500,000 VND (1 hồ sơ)",
  governmentHint: "Công bố tiêu chuẩn áp dụng · 등급에 따라 다름 · 2026.12.31까지 50% 감면 반영",
  marketSummary: "등급·공표 범위에 따라 달라짐",
  marketHint:
    "의료기기 등급과 신고·등록 범위에 따라 대행비용이 달라집니다. 동일 조건의 공개 시장가격이 부족해 임의의 가격을 제시하지 않습니다.",
  structureSummary: "공식 A/B · 시장은 조건 확인 후 안내",
  structureHint: "공식 A/B 공표 심사비와 시장 대행가는 합산하지 않습니다. C/D·판매조건은 별도.",
  governmentLines: [
    {
      label: "적용기준 공표 심사 (A)",
      amount: "500,000 VND / 1 hồ sơ",
      unit: "hồ sơ",
      type: "government",
      condition: `Công bố tiêu chuẩn áp dụng (A). 원 요금 1,000,000 VND의 50%. ${TT64_WINDOW}. C/D 유통허가·판매조건 공표와 합산하지 않음.`,
      source: "Thông tư 59/2023/TT-BTC, Thông tư 64/2025/TT-BTC",
      sourceUrl: "https://luatvietnam.vn/thue/thong-tu-59-2023-tt-btc-muc-thu-che-do-thu-phi-linh-vuc-y-te-265574-d1.html",
      sourceDate: "2023-10-16",
      status: "verified",
    },
    {
      label: "적용기준 공표 심사 (B)",
      amount: "1,500,000 VND / 1 hồ sơ",
      unit: "hồ sơ",
      type: "government",
      condition: `Công bố tiêu chuẩn áp dụng (B). 원 요금 3,000,000 VND의 50%. ${TT64_WINDOW}. C/D 유통허가·판매조건 공표와 합산하지 않음.`,
      source: "Thông tư 59/2023/TT-BTC, Thông tư 64/2025/TT-BTC",
      sourceDate: "2023-10-16",
      status: "verified",
    },
  ],
  thirdPartyLines: [
    {
      label: "시험·인증·기술문서",
      amount: null,
      type: "third_party",
      condition:
        "등급·제품에 따라 필요. ISO 13485·시험·인증을 시장 일반가격에 합산하지 않음. 확인된 공식 단가 없음.",
      source: "공식 단가 미연결",
      status: "checking",
    },
  ],
  marketLines: [
    {
      label: "의료기기 A/B 공표 대행",
      amount: null,
      type: "market",
      condition:
        "의료기기 등급과 신고·등록 범위에 따라 대행비용이 달라집니다. 동일 조건의 공개 시장가격이 부족해 임의의 가격을 제시하지 않습니다. C/D·판매조건·시험·인증을 시장가로 쓰지 않음.",
      source: "비교 가능 공개 형성가격 미확정",
      status: "checking",
    },
  ],
  totalStatus: "partial",
  totalDisplay: "정부 A/B 공표 · 시장은 조건 확인 후 안내",
  totalNote:
    "의료기기 등급과 신고·등록 범위에 따라 대행비용이 달라집니다. 동일 조건의 공개 시장가격이 부족해 임의의 가격을 제시하지 않습니다. C/D·판매조건은 A/B 공표와 별도입니다.",
};

const FRANCHISE_MODEL: RegisterCostModel = {
  serviceId: "franchise",
  governmentSummary: "현행 공개 수수료 확인 어려움",
  governmentHint:
    "현재 공개된 현행 행정자료에서 적용 수수료 금액을 확인하기 어려워 정확한 공식비용을 임의로 제시하지 않습니다.",
  marketSummary: "업무 범위에 따라 달라짐",
  marketHint:
    "가맹등록·정보공개서·계약서 등 업무 범위에 따라 대행비용이 달라집니다. 동일 범위의 공개 가격이 부족해 임의의 시장가격을 제시하지 않습니다.",
  structureSummary: "조건 확인 후 안내",
  structureHint: "공식 등록 수수료와 시장 대행가는 합산하지 않습니다. FDD·계약·매뉴얼 업무는 별도.",
  governmentLines: [
    {
      label: "해외→베트남 프랜차이즈 등록 수수료",
      amount: null,
      type: "government",
      condition:
        "현재 공개된 현행 행정자료에서 적용 수수료 금액을 확인하기 어려워 정확한 공식비용을 임의로 제시하지 않습니다. 과거 Quyết định 106/2008/QĐ-BTC 수수료는 현행으로 쓰지 않음.",
      source: "Cổng DVC · Đăng ký Nhượng quyền thương mại từ nước ngoài vào Việt Nam",
      sourceUrl: "https://dichvucong.moit.gov.vn/TTHCOnlineDetail.aspx?DocId=11",
      status: "checking",
    },
  ],
  thirdPartyLines: [
    {
      label: "계약·정보공개서 번역·공증",
      amount: null,
      type: "third_party",
      condition:
        "등록 대상·문서 언어에 따라 필요. FDD·계약·운영매뉴얼 비용을 등록 수수료·시장 일반가격에 합산하지 않음.",
      source: "공식 단가 미연결",
      status: "checking",
    },
  ],
  marketLines: [
    {
      label: "프랜차이즈 등록 대행",
      amount: null,
      type: "market",
      condition:
        "가맹등록·정보공개서·계약서 등 업무 범위에 따라 대행비용이 달라집니다. 동일 범위의 공개 가격이 부족해 임의의 시장가격을 제시하지 않습니다.",
      source: "비교 가능 공개 형성가격 미확정",
      status: "checking",
    },
  ],
  totalStatus: "unavailable",
  totalDisplay: "조건 확인 후 안내",
  totalNote:
    "가맹등록·정보공개서·계약서 등 업무 범위에 따라 대행비용이 달라집니다. 동일 범위의 공개 가격이 부족해 임의의 시장가격을 제시하지 않습니다.",
};

const REGISTER_COST_MODELS: Partial<Record<CostCheckServiceId, RegisterCostModel>> = {
  company: COMPANY_MODEL,
  restaurant: RESTAURANT_MODEL,
  hygiene: HYGIENE_MODEL,
  "fire-safety": FIRE_MODEL,
  environment: ENVIRONMENT_MODEL,
  cosmetics: COSMETICS_MODEL,
  "medical-device": MEDICAL_MODEL,
  franchise: FRANCHISE_MODEL,
};

export function getRegisterCostModel(id: CostCheckServiceId): RegisterCostModel | null {
  return REGISTER_COST_MODELS[id] ?? null;
}

export function isRegisterCostServiceId(id: CostCheckServiceId): boolean {
  return getRegisterCostModel(id) != null;
}
