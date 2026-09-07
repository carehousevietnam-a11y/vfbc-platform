import {
  COST_CHECK_DISCLAIMER,
  COST_CHECK_MARKET_NOTE,
  getCostCheckService,
} from "@/lib/costCheck";
import { TRC_CHECK_MARKET_CASES } from "@/lib/contentPacks/checkMarketCases";

/** 공개 시장 사례 — checkMarketCases와 동일 출처 재사용 */
export { TRC_CHECK_MARKET_CASES as TRC_COST_MARKET_CASES } from "@/lib/contentPacks/checkMarketCases";

/**
 * TRC intent=cost 「더 자세히 보기」 표준 콘텐츠.
 * 공식 수수료 구간은 costCheck가 인용한 Circular 28/2026/TT-BTC(2026.4.1 시행)과
 * 정부 전자신문(Báo Điện tử Chính phủ) 공표 내용이 일치함을 확인한 뒤 구간별로 표기한다.
 * costCheck 요약값「최대 $165」와 충돌하지 않으며, 동일 통달의 구간 명세를 펼친 것이다.
 */
export const TRC_COST_OFFICIAL_FEE_TIERS = [
  {
    label: "2년 이하",
    amountUsd: 145,
    basis: "카드 유효기간이 2년 이하인 경우",
  },
  {
    label: "2년 초과 ~ 5년",
    amountUsd: 155,
    basis: "카드 유효기간이 2년 초과 5년 이하인 경우",
  },
  {
    label: "5년 초과 ~ 10년",
    amountUsd: 165,
    basis: "카드 유효기간이 5년 초과 10년 이하인 경우",
  },
] as const;

export const TRC_COST_OFFICIAL_SOURCE = {
  agency: "Bộ Tài chính (베트남 재무부)",
  document: "Thông tư 28/2026/TT-BTC",
  documentKo: "Circular 28/2026/TT-BTC",
  effectiveDate: "2026-04-01",
  publishedNote: "2026-03-31 정부 전자신문 공표",
  /** 1순위: 정부 전자신문(Công báo / Báo Điện tử Chính phủ) */
  url: "https://baochinhphu.vn/quy-dinh-moi-ve-thu-phi-le-phi-xuat-nhap-canh-102260331184313162.htm",
  urlLabel: "Báo Điện tử Chính phủ — 출입국·체류 수수료 규정 안내",
} as const;

export const TRC_COST_DIRECT_ANSWER =
  "거주증(TRC) 발급 시 정부에 납부하는 공식 수수료는 카드 유효기간 구간에 따라 USD 145·155·165로 정해져 있습니다. 번역·공증·서류 준비·행정 대행 등이 필요한 경우에는 정부 수수료와 별도로 비용이 발생할 수 있습니다.";

export const TRC_COST_PRICE_GAP_REASONS = [
  "정부에 납부하는 공식 수수료",
  "서류 준비",
  "번역",
  "공증·인증",
  "행정기관 대응",
  "대행 업무 범위",
] as const;

export const TRC_COST_CHECKLIST = [
  "정부 수수료가 견적에 포함되어 있는지",
  "번역·공증 비용이 포함되어 있는지",
  "행정 대행 범위가 어디까지인지",
  "추가 비용이 발생하는 조건이 있는지",
  "재신청·보완 대응 비용이 별도인지",
] as const;

export function getTrcCostGuideDetailModel() {
  const cost = getCostCheckService("trc");

  return {
    h1: "거주증 비용 안내",
    intro: "정부 공식 수수료와 시장에서 보일 수 있는 비용을 구분해 정리한 일반 참고입니다.",
    directAnswer: TRC_COST_DIRECT_ANSWER,
    feeTiers: TRC_COST_OFFICIAL_FEE_TIERS,
    officialSource: TRC_COST_OFFICIAL_SOURCE,
    costCheckSummary: cost.governmentFee,
    costCheckSourceLabel: cost.source,
    lookupGuide: cost.lookupGuide,
    officialDisclaimer: COST_CHECK_DISCLAIMER,
    market: {
      currency: cost.currency,
      min: cost.marketMin,
      max: cost.marketMax,
      note: cost.marketNote,
      marketDisclaimer: COST_CHECK_MARKET_NOTE,
    },
    marketCases: TRC_CHECK_MARKET_CASES,
    priceGapReasons: TRC_COST_PRICE_GAP_REASONS,
    checklist: TRC_COST_CHECKLIST,
    funnelHref: cost.ctaHref,
  };
}

export type TrcCostGuideDetailModel = ReturnType<typeof getTrcCostGuideDetailModel>;
