export type CostCheckServiceId = "tamtru" | "trc" | "wp" | "company" | "notary";

export type CostCheckVerdict = "very_low" | "low" | "fair" | "high";

export type DocPrepStatus = "unknown" | "not_started" | "partial" | "ready";

export type CostCheckCurrency = "USD" | "VND";

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
  ctaLabel: string;
  ctaHref: string;
};

export const COST_CHECK_DISCLAIMER =
  "본 정보는 조사 시점 기준이며, 베트남 행정 절차·수수료는 관공서 통폐합 및 법령 개정으로 자주 변경됩니다. 실제 비용은 관할기관·시점에 따라 다를 수 있으니 정확한 금액은 진행 시점에 반드시 재확인하시기 바랍니다.";

export const COST_CHECK_MARKET_NOTE =
  "아래 시장 범위는 공식 통계가 아닌 참고용 추정치이며, 지역·난이도·포함 서비스에 따라 달라질 수 있습니다.";

export const COST_CHECK_SERVICES: CostCheckService[] = [
  {
    id: "tamtru",
    label: "임시거주등록 (땀주)",
    shortLabel: "땀주",
    description: "임시거주 신고·등록 대행 견적",
    currency: "USD",
    governmentFee: "무료",
    source: "Circular 04/2015/TT-BCA",
    marketMin: 30,
    marketMax: 100,
    marketNote: "대행·번역·이동 비용 포함 시장 참고 범위",
    ctaLabel: "땀주 가능성 진단 (CHECK)",
    ctaHref: "/check/tamtru",
  },
  {
    id: "trc",
    label: "거주증 (TRC) 신규",
    shortLabel: "TRC",
    description: "거주증 신규 발급 대행 견적",
    currency: "USD",
    governmentFee: "최대 $165 (5~10년 구간 기준, 구간별 상이)",
    source: "Circular 28/2026/TT-BTC (2026.4.1 시행)",
    marketMin: 250,
    marketMax: 400,
    marketNote: "정부 수수료·번역·대행 포함 시장 참고 범위",
    ctaLabel: "TRC 가능성 진단 (CHECK)",
    ctaHref: "/check/trc",
  },
  {
    id: "wp",
    label: "노동허가증 (WP)",
    shortLabel: "WP",
    description: "노동허가 신청·갱신 대행 견적",
    currency: "USD",
    governmentFee: "400,000~1,000,000 VND (지역별 상이)",
    source: "Circular 85/2019/TT-BTC(개정), Decree 152/2020·219/2025/ND-CP",
    marketMin: 400,
    marketMax: 800,
    marketNote: "정부 수수료·번역·대행 포함 시장 참고 범위",
    ctaLabel: "WP 가능성 진단 (CHECK)",
    ctaHref: "/check/wp",
  },
  {
    id: "company",
    label: "외국인 법인설립 (ERC)",
    shortLabel: "법인설립",
    description: "ERC 등록·설립 대행 견적",
    currency: "USD",
    governmentFee:
      "등록비 25,000~50,000 VND(온라인 무료) + 공고비 100,000 VND (IRC 별도 수수료는 미확인, ERC에 포함해 표기)",
    source: "Thông tư 47/2019/TT-BTC(개정 64/2025)",
    marketMin: 1200,
    marketMax: 2500,
    marketNote: "ERC·IRC·번역·대행 포함 시장 참고 범위",
    ctaLabel: "법인설립 가능성 진단 (REGISTER)",
    ctaHref: "/register/company",
  },
  {
    id: "notary",
    label: "서류 공증·번역",
    shortLabel: "공증번역",
    description: "공증 1페이지 + 첫 번역 견적",
    currency: "VND",
    governmentFee: "공증 10,000 VND/페이지 (첫 번역)",
    source: "Circular 257/2016/TT-BTC",
    marketMin: 40_000,
    marketMax: 310_000,
    marketNote: "공증 10,000 VND + 번역료 30,000~300,000 VND/페이지 참고 합산 범위",
    ctaLabel: "서류 검토 상담 (VERIFY)",
    ctaHref: "/verify/unclear",
  },
];

export function getCostCheckService(id: CostCheckServiceId): CostCheckService {
  const service = COST_CHECK_SERVICES.find((item) => item.id === id);
  if (!service) throw new Error(`Unknown cost check service: ${id}`);
  return service;
}

export function formatCostAmount(amount: number, currency: CostCheckCurrency): string {
  if (currency === "USD") {
    return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `${amount.toLocaleString("ko-KR")} VND`;
}

export function evaluateCostQuote(
  service: CostCheckService,
  quotedAmount: number
): {
  verdict: CostCheckVerdict;
  title: string;
  summary: string;
  detail: string;
} {
  const { marketMin, marketMax } = service;
  const veryLowThreshold = marketMin * 0.65;

  if (quotedAmount < veryLowThreshold) {
    return {
      verdict: "very_low",
      title: "시장 범위보다 현저히 낮음",
      summary: "견적이 통상 범위보다 많이 낮습니다.",
      detail:
        "이 정도 금액이면 필수 서비스(번역·공증·대행·재제출 대응 등)가 빠졌거나, 진행 중 추가 비용이 발생할 가능성이 있습니다. 포함 항목을 꼭 확인해보시길 권장합니다.",
    };
  }

  if (quotedAmount < marketMin) {
    return {
      verdict: "low",
      title: "시장 범위 하단 이하",
      summary: "견적이 참고 시장 범위보다 낮은 편입니다.",
      detail:
        "최저가만으로 선택하기보다, 어떤 서비스가 포함됐는지(서류 준비·번역·제출·재접수 대응 등) 견적서 항목을 함께 확인해보시길 권장합니다.",
    };
  }

  if (quotedAmount <= marketMax) {
    return {
      verdict: "fair",
      title: "시장 참고 범위 내",
      summary: "입력하신 견적은 통상적인 시장 참고 범위 안에 있습니다.",
      detail:
        "다만 포함 항목·처리 기간·반려 시 추가 비용 조건은 업체마다 다를 수 있으니, 계약 전 세부 항목을 확인하시면 더 안전합니다.",
    };
  }

  return {
    verdict: "high",
    title: "시장 참고 범위 상단 초과",
    summary: "견적이 참고 시장 범위보다 높은 편입니다.",
    detail:
      "이 범위를 넘으면 어떤 서비스가 포함됐는지(긴급 처리·추가 번역·대행 범위 등) 확인해보시길 권장합니다. 동일 조건의 다른 견적과 비교해 보시는 것도 도움이 됩니다.",
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
