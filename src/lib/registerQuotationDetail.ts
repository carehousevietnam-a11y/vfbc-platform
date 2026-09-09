/**
 * REGISTER 견적서 상세 섹션 콘텐츠.
 * 공통 UI 구조(CHECK 견적서와 동일)에 서비스별 문구만 교체한다.
 * company · restaurant 전용 + 나머지 REGISTER는 MODEL 기반 기본 상세.
 */

import type { CostCheckServiceId } from "@/lib/costCheck";

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
    "공식 수수료 외에 아래 비용이 추가로 발생할 수 있습니다.",
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
    "공식 심사비 외에 아래 비용이 추가로 발생할 수 있습니다.",
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

/** Hygiene — Company Master와 동일 섹션 구조 · 위생허가 문구만 교체 */
export const HYGIENE_QUOTATION_DETAIL: RegisterQuotationDetailContent = {
  additionalCostIntro:
    "공식 심사비 외에 아래 비용이 추가로 발생할 수 있습니다.",
  additionalCostItems: [
    { label: "건강검진", note: "종사자·주체 · 견적 포함 여부 확인" },
    { label: "ATTP 교육·이수", note: "조건부 · 관할·업종에 따라 필요" },
    { label: "시설·주방 보완", note: "현장 심사 전 · 범위에 따라 상이" },
    { label: "검체·시험", note: "조건부 · 제3자 비용 별도 가능" },
    { label: "평면도·배치도", note: "조건부 · 견적 포함 여부 확인" },
    { label: "사업등록", note: "법인/호킨 형태 · 위생 심사와 별도" },
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
    "기본 견적 외 정부 심사비·건강검진·시설 보완이 별도 청구될 수 있습니다.",
    "서비스 범위가 다른 시장가격과 단순 비교하면 과다·과소 판단이 어긋날 수 있습니다.",
  ],
  riskFooterNote: "확정 법률·벌금이 아니라 위생허가 진행 참고 안내입니다.",
  marketWhyTitle: "시장가격이 관공서 공식비용보다 높은 이유",
  marketWhyBody:
    "관공서 공식비용은 식품안전 심사 수수료이고, 시장가격에는 서류·현장 준비·대행 업무가 포함될 수 있습니다. 건강검진·시설 보완·연계 허가는 별도일 수 있습니다.",
  footerDisclaimer:
    "정부 심사비와 시장 대행가격은 합산하지 않습니다. 사업등록·소방·시설 보완은 별도일 수 있습니다.",
};

/** Fire-safety — Company Master와 동일 섹션 구조 */
export const FIRE_SAFETY_QUOTATION_DETAIL: RegisterQuotationDetailContent = {
  additionalCostIntro:
    "공식 심사비 외에 아래 비용이 추가로 발생할 수 있습니다.",
  additionalCostItems: [
    { label: "PCCC 설계·기술문서", note: "조건부 · 설계 유형에 따라 필요" },
    { label: "설비·공사", note: "실제 시공 · 범위에 따라 상이" },
    { label: "현장 점검·시험", note: "조건부 · 시설 규모에 따라 별도" },
    { label: "도면·배치 수정", note: "심사 전 · 견적 포함 여부 확인" },
    { label: "서류 번역·공증", note: "조건부 · 외국어 서류 시 필요" },
    { label: "연계 인허가", note: "사업등록·환경 등 · 별도 절차" },
    { label: "서류 보완·재제출", note: "누락·반려 시 발생 가능" },
    { label: "별도 대행 업무", note: "기본 패키지 외 범위에 따라 상이" },
  ],
  riskIntro: "직접 진행과 대행 선택에서 흔히 확인하는 참고 안내입니다.",
  selfProceedTitle: "직접 진행하다 문제가 생기는 경우",
  selfProceedRisks: [
    "설계·서류 요건 미충족으로 반려·보완·재심사가 생길 수 있습니다.",
    "설비 공사와 심사 범위를 혼동하면 일정 지연과 추가 비용이 생길 수 있습니다.",
  ],
  badAgencyTitle: "잘못된 컨설팅·대행 업체를 선택한 경우",
  badAgencyRisks: [
    "기본 견적 외 설계·공사·시험 비용이 별도 청구될 수 있습니다.",
    "서비스 범위가 다른 시장가격과 단순 비교하면 과다·과소 판단이 어긋날 수 있습니다.",
  ],
  riskFooterNote: "확정 법률·벌금이 아니라 소방허가 진행 참고 안내입니다.",
  marketWhyTitle: "시장가격이 관공서 공식비용보다 높은 이유",
  marketWhyBody:
    "관공서 공식비용은 PCCC 심사 수수료이고, 시장가격에는 설계·서류·대행 업무가 포함될 수 있습니다. 설비 공사·시험·연계 인허가는 별도일 수 있습니다.",
  footerDisclaimer:
    "PCCC 설계·심사와 설비 공사는 업무 범위가 달라 합산하지 않습니다. 동일 범위의 공개 시장가격이 부족해 임의 비교를 하지 않습니다.",
};

/** Environment — Company Master와 동일 섹션 구조 */
export const ENVIRONMENT_QUOTATION_DETAIL: RegisterQuotationDetailContent = {
  additionalCostIntro:
    "공식 심사비 외에 아래 비용이 추가로 발생할 수 있습니다.",
  additionalCostItems: [
    { label: "환경영향평가(ĐTM)", note: "조건부 · 규모·유형에 따라 별도" },
    { label: "측정·분석", note: "조건부 · 제3자 비용 별도 가능" },
    { label: "기술·환경 문서", note: "프로젝트 범위 · 견적 포함 여부 확인" },
    { label: "서류 번역·공증", note: "조건부 · 외국어 서류 시 필요" },
    { label: "현장 보완", note: "심사 전 · 범위에 따라 상이" },
    { label: "연계 인허가", note: "건설·운영 허가 · 별도 절차" },
    { label: "서류 보완·재제출", note: "누락·반려 시 발생 가능" },
    { label: "별도 대행 업무", note: "기본 패키지 외 범위에 따라 상이" },
  ],
  riskIntro: "직접 진행과 대행 선택에서 흔히 확인하는 참고 안내입니다.",
  selfProceedTitle: "직접 진행하다 문제가 생기는 경우",
  selfProceedRisks: [
    "허가 유형·서류 요건 미충족으로 반려·보완이 생길 수 있습니다.",
    "ĐTM·허가·등록 절차를 혼동하면 일정 지연과 추가 비용이 생길 수 있습니다.",
  ],
  badAgencyTitle: "잘못된 컨설팅·대행 업체를 선택한 경우",
  badAgencyRisks: [
    "기본 견적 외 측정·분석·ĐTM 비용이 별도 청구될 수 있습니다.",
    "서비스 범위가 다른 시장가격과 단순 비교하면 과다·과소 판단이 어긋날 수 있습니다.",
  ],
  riskFooterNote: "확정 법률·벌금이 아니라 환경허가 진행 참고 안내입니다.",
  marketWhyTitle: "시장가격이 관공서 공식비용보다 높은 이유",
  marketWhyBody:
    "관공서 공식비용은 환경허가 심사 수수료이고, 시장가격에는 서류·측정·대행 업무가 포함될 수 있습니다. ĐTM·공사·연계 절차는 별도일 수 있습니다.",
  footerDisclaimer:
    "환경허가·등록·영향평가는 절차가 달라 합산하지 않습니다. 동일 범위의 공개 시장가격이 부족해 임의 비교를 하지 않습니다.",
};

/** Cosmetics — Company Master와 동일 섹션 구조 */
export const COSMETICS_QUOTATION_DETAIL: RegisterQuotationDetailContent = {
  additionalCostIntro:
    "공식 심사비 외에 아래 비용이 추가로 발생할 수 있습니다.",
  additionalCostItems: [
    { label: "제품 시험·검사", note: "조건부 · 제품에 따라 필요" },
    { label: "CFS·수입 서류", note: "수입 제품 · 견적 포함 여부 확인" },
    { label: "번역·공증·합법화", note: "조건부 · 외국 제조사 서류 시" },
    { label: "CGMP·생산시설", note: "조건부 · 국내 생산 시 별도" },
    { label: "라벨·성분 검토", note: "제품 1건 · 범위에 따라 상이" },
    { label: "추가 제품 공표", note: "제품 단위 · 공식비용 별도" },
    { label: "서류 보완·재제출", note: "누락·반려 시 발생 가능" },
    { label: "별도 대행 업무", note: "기본 패키지 외 범위에 따라 상이" },
  ],
  riskIntro: "직접 진행과 대행 선택에서 흔히 확인하는 참고 안내입니다.",
  selfProceedTitle: "직접 진행하다 문제가 생기는 경우",
  selfProceedRisks: [
    "성분·라벨·서류 요건 미충족으로 반려·보완이 생길 수 있습니다.",
    "시험·CFS·생산시설 요건을 빠뜨리면 일정 지연과 추가 비용이 생길 수 있습니다.",
  ],
  badAgencyTitle: "잘못된 컨설팅·대행 업체를 선택한 경우",
  badAgencyRisks: [
    "기본 견적 외 시험·CFS·CGMP 비용이 별도 청구될 수 있습니다.",
    "제품 수·범위가 다른 시장가격과 단순 비교하면 판단이 어긋날 수 있습니다.",
  ],
  riskFooterNote: "확정 법률·벌금이 아니라 화장품허가 진행 참고 안내입니다.",
  marketWhyTitle: "시장가격이 관공서 공식비용보다 높은 이유",
  marketWhyBody:
    "관공서 공식비용은 제품 공표 심사 수수료이고, 시장가격에는 서류·대행 업무가 포함될 수 있습니다. 시험·CFS·생산시설 허가는 별도일 수 있습니다.",
  footerDisclaimer:
    "공식 공표 심사비와 시장 대행가격은 합산하지 않습니다. 검사·CGMP·생산시설은 별도입니다.",
};

/** Medical-device — Company Master와 동일 섹션 구조 */
export const MEDICAL_DEVICE_QUOTATION_DETAIL: RegisterQuotationDetailContent = {
  additionalCostIntro:
    "공식 심사비 외에 아래 비용이 추가로 발생할 수 있습니다.",
  additionalCostItems: [
    { label: "시험·인증", note: "등급·제품 · 견적 포함 여부 확인" },
    { label: "ISO 13485", note: "조건부 · 제조·유통에 따라 필요" },
    { label: "기술·품질 문서", note: "등급별 · 범위에 따라 상이" },
    { label: "번역·공증", note: "조건부 · 외국 제조사 서류 시" },
    { label: "C/D·판매조건", note: "A/B 공표와 별도 · 조건부" },
    { label: "추가 품목 공표", note: "1 hồ sơ 단위 · 등급별 차이" },
    { label: "서류 보완·재제출", note: "누락·반려 시 발생 가능" },
    { label: "별도 대행 업무", note: "기본 패키지 외 범위에 따라 상이" },
  ],
  riskIntro: "직접 진행과 대행 선택에서 흔히 확인하는 참고 안내입니다.",
  selfProceedTitle: "직접 진행하다 문제가 생기는 경우",
  selfProceedRisks: [
    "등급·기술문서 요건 미충족으로 반려·보완이 생길 수 있습니다.",
    "A/B 공표와 C/D·판매조건을 혼동하면 일정 지연과 추가 비용이 생길 수 있습니다.",
  ],
  badAgencyTitle: "잘못된 컨설팅·대행 업체를 선택한 경우",
  badAgencyRisks: [
    "기본 견적 외 시험·인증·ISO 비용이 별도 청구될 수 있습니다.",
    "등급·범위가 다른 시장가격과 단순 비교하면 판단이 어긋날 수 있습니다.",
  ],
  riskFooterNote: "확정 법률·벌금이 아니라 의료기기 허가 진행 참고 안내입니다.",
  marketWhyTitle: "시장가격이 관공서 공식비용보다 높은 이유",
  marketWhyBody:
    "관공서 공식비용은 적용기준 공표 심사 수수료이고, 시장가격에는 서류·대행 업무가 포함될 수 있습니다. 시험·인증·C/D 절차는 별도일 수 있습니다.",
  footerDisclaimer:
    "공식 A/B 공표 심사비와 시장 대행가는 합산하지 않습니다. C/D·판매조건·시험·인증은 별도입니다.",
};

/** Franchise — Company Master와 동일 섹션 구조 */
export const FRANCHISE_QUOTATION_DETAIL: RegisterQuotationDetailContent = {
  additionalCostIntro:
    "공식 등록비 외에 아래 비용이 추가로 발생할 수 있습니다.",
  additionalCostItems: [
    { label: "정보공개서(FDD)", note: "등록 핵심 · 견적 포함 여부 확인" },
    { label: "계약·매뉴얼 번역", note: "조건부 · 문서 언어에 따라 필요" },
    { label: "공증·인증", note: "조건부 · 해외 본사 서류 시" },
    { label: "브랜드·상표 검토", note: "조건부 · 별도 법률 업무" },
    { label: "현지 법인 설립", note: "등록 전제 · 별도 절차" },
    { label: "서류 보완·재제출", note: "누락·반려 시 발생 가능" },
    { label: "연계 인허가", note: "사업등록 등 · 별도 절차" },
    { label: "별도 대행 업무", note: "기본 패키지 외 범위에 따라 상이" },
  ],
  riskIntro: "직접 진행과 대행 선택에서 흔히 확인하는 참고 안내입니다.",
  selfProceedTitle: "직접 진행하다 문제가 생기는 경우",
  selfProceedRisks: [
    "정보공개서·계약 요건 미충족으로 반려·보완이 생길 수 있습니다.",
    "등록 범위와 운영 준비를 혼동하면 일정 지연과 추가 비용이 생길 수 있습니다.",
  ],
  badAgencyTitle: "잘못된 컨설팅·대행 업체를 선택한 경우",
  badAgencyRisks: [
    "기본 견적 외 FDD·번역·공증 비용이 별도 청구될 수 있습니다.",
    "업무 범위가 다른 시장가격과 단순 비교하면 판단이 어긋날 수 있습니다.",
  ],
  riskFooterNote: "확정 법률·벌금이 아니라 프랜차이즈 등록 진행 참고 안내입니다.",
  marketWhyTitle: "시장가격이 관공서 공식비용보다 높은 이유",
  marketWhyBody:
    "관공서 공식비용은 등록 수수료이고, 시장가격에는 정보공개서·계약·대행 업무가 포함될 수 있습니다. FDD·번역·법인 설립은 별도일 수 있습니다.",
  footerDisclaimer:
    "공식 등록 수수료와 시장 대행가는 합산하지 않습니다. FDD·계약·매뉴얼 업무는 별도입니다.",
};

/**
 * Master 견적서 섹션 3·4·5 — company/restaurant 및 REGISTER 6개 서비스 전용 상세.
 */
export function getRegisterQuotationDetail(
  id: CostCheckServiceId
): RegisterQuotationDetailContent | null {
  if (id === "company") return COMPANY_QUOTATION_DETAIL;
  if (id === "restaurant") return RESTAURANT_QUOTATION_DETAIL;
  if (id === "hygiene") return HYGIENE_QUOTATION_DETAIL;
  if (id === "fire-safety") return FIRE_SAFETY_QUOTATION_DETAIL;
  if (id === "environment") return ENVIRONMENT_QUOTATION_DETAIL;
  if (id === "cosmetics") return COSMETICS_QUOTATION_DETAIL;
  if (id === "medical-device") return MEDICAL_DEVICE_QUOTATION_DETAIL;
  if (id === "franchise") return FRANCHISE_QUOTATION_DETAIL;

  return null;
}
