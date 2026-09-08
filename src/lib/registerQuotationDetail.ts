/**
 * REGISTER 견적서 상세 섹션 콘텐츠.
 * 공통 UI 구조(CHECK 견적서와 동일)에 서비스별 문구만 교체한다.
 * company · restaurant 전용 + 나머지 REGISTER는 MODEL 기반 기본 상세.
 */

import type { CostCheckServiceId } from "@/lib/costCheck";
import { getRegisterCostModel } from "@/lib/registerCostCheck";

export type RegisterQuotationExtraCostItem = {
  label: string;
  note: string;
};

export type RegisterQuotationDetailContent = {
  additionalCostIntro: string;
  additionalCostItems: readonly RegisterQuotationExtraCostItem[];
  riskIntro: string;
  selfProceedTitle: string;
  selfProceedRisks: readonly string[];
  badAgencyTitle: string;
  badAgencyRisks: readonly string[];
  riskFooterNote: string;
  marketWhyTitle: string;
  marketWhyBody: string;
  footerDisclaimer: string;
};

/** Company — CHECK 견적서 섹션 3·4·5·하단 주의문 (짧고 정제된 FDI 문구) */
export const COMPANY_QUOTATION_DETAIL: RegisterQuotationDetailContent = {
  additionalCostIntro:
    "공식 수수료 외에 아래 비용이 추가로 발생할 수 있습니다. 받은 견적 포함 여부를 확인하세요.",
  additionalCostItems: [
    { label: "서류 번역", note: "조건부 · 견적 포함 여부 확인" },
    { label: "공증·인증", note: "조건부 · 견적 포함 여부 확인" },
    { label: "법인 인감", note: "실무 준비 · 업체·사양에 따라 상이" },
    { label: "전자서명", note: "실무 준비 · 세무·전자신고에 필요 가능" },
    { label: "전자세금 초기설정", note: "조건부 · 영업 준비 단계에서 발생 가능" },
    { label: "외국인 투자 서류", note: "조건부 · IRC·번역·합법화 등 별도" },
    { label: "서류 보완·재제출", note: "누락·반려 시 발생 가능" },
    { label: "별도 대행 업무", note: "기본 패키지 외 범위에 따라 상이" },
  ],
  riskIntro: "직접 진행과 대행 선택에서 흔히 확인하는 참고 안내입니다.",
  selfProceedTitle: "직접 진행하다 문제가 생기는 경우",
  selfProceedRisks: [
    "등록서류 누락·오류로 반려·보완·재제출이 생길 수 있습니다.",
    "업종·주소·투자조건에 따라 추가 절차와 일정 지연이 생길 수 있습니다.",
  ],
  badAgencyTitle: "잘못된 컨설팅·대행 업체를 선택한 경우",
  badAgencyRisks: [
    "기본 견적 외 정부비용·번역·공증·세무·전자서명이 별도 청구될 수 있습니다.",
    "업체 변경·재진행으로 비용이 중복되고 일정이 늦어질 수 있습니다.",
  ],
  riskFooterNote: "확정 법률·벌금이 아니라 법인설립 진행 참고 안내입니다.",
  marketWhyTitle: "시장가격이 관공서 공식비용보다 높은 이유",
  marketWhyBody:
    "관공서 공식비용은 정부기관에 납부하는 수수료이고, 시장가격에는 FDI 법인설립을 위한 법률·행정 대행 업무가 포함될 수 있습니다. 번역·공증 등 제3자 비용과 업종별 추가 인허가는 별도일 수 있습니다.",
  footerDisclaimer:
    "정부 수수료(VND)와 시장 일반가격(USD)은 합산·환율 환산하지 않습니다. 투자자본은 설립비용이 아닙니다.",
};

/** Restaurant — Company Master와 동일 섹션 구조 · 식당 ATTP 문구만 교체 */
export const RESTAURANT_QUOTATION_DETAIL: RegisterQuotationDetailContent = {
  additionalCostIntro:
    "공식 심사비 외에 아래 비용이 추가로 발생할 수 있습니다. 받은 견적 포함 여부를 확인하세요.",
  additionalCostItems: [
    { label: "건강검진", note: "종사자·주체 · 견적 포함 여부 확인" },
    { label: "ATTP 교육·이수", note: "조건부 · 관할·업종에 따라 필요" },
    { label: "시설·주방 보완", note: "현장 심사 전 · 범위에 따라 상이" },
    { label: "평면도·배치도", note: "조건부 · 견적 포함 여부 확인" },
    { label: "검체·시험", note: "조건부 · 제3자 비용 별도 가능" },
    { label: "사업등록", note: "법인/호킨 형태 · 식당 심사와 별도" },
    { label: "소방(PCCC)", note: "조건부 · 규모·시설에 따라 별도" },
    { label: "서류 보완·재제출", note: "누락·반려 시 발생 가능" },
  ],
  riskIntro: "직접 진행과 대행 선택에서 흔히 확인하는 참고 안내입니다.",
  selfProceedTitle: "직접 진행하다 문제가 생기는 경우",
  selfProceedRisks: [
    "시설·서류 요건 미충족으로 반려·보완·재심사가 생길 수 있습니다.",
    "사업등록·소방 등 연계 허가를 빠뜨리면 일정 지연과 추가 비용이 생길 수 있습니다.",
  ],
  badAgencyTitle: "잘못된 컨설팅·대행 업체를 선택한 경우",
  badAgencyRisks: [
    "기본 견적 외 정부 심사비·건강검진·시설 보완·소방이 별도 청구될 수 있습니다.",
    "서비스 범위가 다른 시장가격과 단순 비교하면 과다·과소 판단이 어긋날 수 있습니다.",
  ],
  riskFooterNote: "확정 법률·벌금이 아니라 식당허가 진행 참고 안내입니다.",
  marketWhyTitle: "시장가격이 관공서 공식비용보다 높은 이유",
  marketWhyBody:
    "관공서 공식비용은 식품안전 심사 수수료이고, 시장가격에는 서류·현장 준비·대행 업무가 포함될 수 있습니다. 건강검진·시설 보완·사업등록·소방은 별도일 수 있습니다.",
  footerDisclaimer:
    "정부 심사비와 시장 대행가격은 합산하지 않습니다. 사업등록·소방·시설 보완은 별도일 수 있습니다.",
};

const SERVICE_LABEL: Partial<Record<CostCheckServiceId, string>> = {
  hygiene: "위생허가",
  "fire-safety": "소방허가",
  environment: "환경허가",
  cosmetics: "화장품허가",
  "medical-device": "의료기기 허가",
  franchise: "프랜차이즈 등록",
};

/**
 * Master 견적서 섹션 3·4·5 — company/restaurant는 전용, 그 외는 기존 MODEL 문구만 재사용.
 */
export function getRegisterQuotationDetail(
  id: CostCheckServiceId
): RegisterQuotationDetailContent | null {
  if (id === "company") return COMPANY_QUOTATION_DETAIL;
  if (id === "restaurant") return RESTAURANT_QUOTATION_DETAIL;

  const model = getRegisterCostModel(id);
  if (!model) return null;

  const label = SERVICE_LABEL[id] ?? "인허가";
  const extraFromModel = [
    ...model.thirdPartyLines.map((line) => ({
      label: line.label,
      note: line.condition ?? "조건부 · 견적 포함 여부 확인",
    })),
    ...model.marketLines
      .filter((line) => line.status !== "verified" || !line.amount)
      .map((line) => ({
        label: line.label,
        note: line.condition ?? "조건 확인 후 안내",
      })),
  ].slice(0, 8);

  return {
    additionalCostIntro:
      "공식 비용 외에 아래 비용이 추가로 발생할 수 있습니다. 받은 견적 포함 여부를 확인하세요.",
    additionalCostItems:
      extraFromModel.length > 0
        ? extraFromModel
        : [{ label: "추가 절차·서류", note: "조건에 따라 별도 · 견적 포함 여부 확인" }],
    riskIntro: "직접 진행과 대행 선택에서 흔히 확인하는 참고 안내입니다.",
    selfProceedTitle: "직접 진행하다 문제가 생기는 경우",
    selfProceedRisks: [
      "서류·요건 미충족으로 반려·보완·재제출이 생길 수 있습니다.",
      "연계 절차를 빠뜨리면 일정 지연과 추가 비용이 생길 수 있습니다.",
    ],
    badAgencyTitle: "잘못된 컨설팅·대행 업체를 선택한 경우",
    badAgencyRisks: [
      "기본 견적 외 정부비용·제3자 비용이 별도 청구될 수 있습니다.",
      "서비스 범위가 다른 시장가격과 단순 비교하면 과다·과소 판단이 어긋날 수 있습니다.",
    ],
    riskFooterNote: `확정 법률·벌금이 아니라 ${label} 진행 참고 안내입니다.`,
    marketWhyTitle: "시장가격이 관공서 공식비용보다 높은 이유",
    marketWhyBody: model.marketHint || model.structureHint,
    footerDisclaimer: model.totalNote,
  };
}
