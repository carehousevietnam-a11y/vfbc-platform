/**
 * CHECK 견적서 「시장 사례 참고」 — 공개 원문에 가격이 명시된 사례만 수록.
 * 평균·최저·최고·적정가로 표현하지 않는다.
 */

export type CheckMarketCase = {
  name: string;
  summary: string;
  url: string;
};

/** TRC — Siglaw / LawPlus 공개 페이지 (기존 TRC 상세와 동일) */
export const TRC_CHECK_MARKET_CASES: readonly CheckMarketCase[] = [
  {
    name: "Siglaw",
    summary: "TRC 서비스 from USD 285",
    url: "https://en.siglaw.com.vn/temporary-residence-card-service-visa.html",
  },
  {
    name: "LawPlus",
    summary: "TRC 서비스 from USD 500 (2년·워크퍼밋 포함)",
    url: "https://lawplus.vn/investment-in-vietnam/",
  },
] as const;

/**
 * WP — Siglaw 공개 요금표(재발급 from USD 180 등) /
 * LawPlus investment 페이지 Work permit from $700
 */
export const WP_CHECK_MARKET_CASES: readonly CheckMarketCase[] = [
  {
    name: "Siglaw",
    summary: "WP 서비스 from USD 180",
    url: "https://siglaw.com.vn/giay-phep-lao-dong.html",
  },
  {
    name: "LawPlus",
    summary: "WP 서비스 from USD 700",
    url: "https://lawplus.vn/investment-in-vietnam/",
  },
] as const;

/**
 * Tamtru — 공개 대행 요금이 확인된 사례만 사용
 * (Siglaw/LawPlus 공개 페이지에서 임시거주 신고 대행가를 확인하지 못함)
 */
export const TAMTRU_CHECK_MARKET_CASES: readonly CheckMarketCase[] = [
  {
    name: "Luật Tâm Phước Thịnh",
    summary: "임시거주 신고 서비스 from 500.000 VND",
    url: "https://luattamphuocthinh.vn/dang-ky-tam-tru-cho-nguoi-nuoc-ngoai/",
  },
] as const;

/**
 * Driving — AZVLAW / Doanh Nhân Việt 공개 서비스가
 */
export const DRIVING_CHECK_MARKET_CASES: readonly CheckMarketCase[] = [
  {
    name: "AZVLAW",
    summary: "운전면허 교환 서비스 from 2.500.000 VND",
    url: "https://azvlaw.vn/dich-vu-doi-giay-phep-lai-xe-cho-nguoi-nuoc-ngoai/",
  },
  {
    name: "Doanh Nhân Việt",
    summary: "외국인 운전면허 교환 서비스 from 1.500.000 VND",
    url: "https://doibanglaixenuocngoai.vn/doi-gplx-cho-nguoi-nuoc-ngoai.html",
  },
] as const;
