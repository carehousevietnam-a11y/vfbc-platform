/**
 * 마이페이지 "전문가 진행하기" 3옵션 카드 내용.
 * - 직접 확인하기 4종 + 직접 인허가 받기 8종, 모두 같은 3옵션 구조.
 * - 가격은 아직 정해지지 않아 ○○○로 가린다. 값이 정해지면 EXPERT_OPTION_PRICE_LABEL 한 곳만 바꾼다.
 * - 가격은 카드를 눌러 선택한 뒤에만 화면에 보인다. 결제는 이 파일과 무관하며 마지막 단계에서 붙인다.
 * - 고객 문구 규칙: 담당은 "VFBCAI 전문가팀"만 쓰고, 물결표를 쓰지 않는다.
 */

export type ExpertOptionId = "draft" | "accompany" | "full";

export type ExpertOption = {
  id: ExpertOptionId;
  title: string;
  summary: string;
  includes: string[];
  priceLabel: string;
};

export const EXPERT_OPTION_PRICE_LABEL = "○○○";

type ExpertServiceSpec = {
  /** 마이페이지 serviceType (verify_*) */
  serviceType: string;
  /** 신청 서류 이름 (예: "거주증 신청서류") */
  doc: string;
  /** 방문·제출 기관 */
  office: string;
  /** 서비스별로 먼저 점검하는 한 가지 */
  check: string;
};

const SPECS: ExpertServiceSpec[] = [
  { serviceType: "verify_trc", doc: "거주증 신청서류", office: "출입국 관리 기관", check: "체류 목적·서류 불일치 점검" },
  { serviceType: "verify_wp", doc: "노동허가 신청서류", office: "노동 담당 기관", check: "고용 사유·자격 서류 점검" },
  { serviceType: "verify_tamtru", doc: "임시 거주 신고서류", office: "거주지 관할 공안", check: "집주인 서류와 신고 기한 점검" },
  { serviceType: "verify_license", doc: "운전면허 전환 신청서류", office: "운전면허 담당 기관", check: "면허 번역과 공증 서류 점검" },
  { serviceType: "verify_company", doc: "법인설립 신청서류", office: "투자·사업등록 담당 기관", check: "투자 등록 서류의 정합 점검" },
  { serviceType: "verify_restaurant", doc: "식당 영업허가 서류", office: "관할 영업허가 기관", check: "입지와 업종 요건 점검" },
  { serviceType: "verify_hygiene", doc: "위생 허가 서류", office: "관할 식품위생 기관", check: "시설과 위생 기준 점검" },
  { serviceType: "verify_fire", doc: "소방 허가 서류", office: "관할 소방 기관", check: "소방 설계와 점검 서류 확인" },
  { serviceType: "verify_cosmetics", doc: "화장품 판매 신고서류", office: "화장품 관리 기관", check: "제품 성분과 표시 서류 점검" },
  { serviceType: "verify_environment", doc: "환경 허가 서류", office: "관할 환경 기관", check: "배출·영향평가 대상 점검" },
  { serviceType: "verify_medical", doc: "의료기기 허가 서류", office: "의료기기 관리 기관", check: "제품 등급과 수입 요건 점검" },
  { serviceType: "verify_franchise", doc: "프랜차이즈 등록 서류", office: "관할 상공 기관", check: "가맹 계약 서류 점검" },
];

function buildOptions(spec: ExpertServiceSpec): ExpertOption[] {
  return [
    {
      id: "draft",
      title: "서류 작성만",
      summary: `${spec.doc}를 VFBCAI 전문가팀이 작성합니다. 제출은 직접 합니다.`,
      includes: [`${spec.doc} 작성`, spec.check, "제출 순서 안내"],
      priceLabel: EXPERT_OPTION_PRICE_LABEL,
    },
    {
      id: "accompany",
      title: "서류 작성 + 통역·제출 동행",
      summary: `작성에 더해 ${spec.office} 방문에 통역과 동행을 붙입니다.`,
      includes: [`${spec.doc} 작성`, spec.check, `${spec.office} 방문 통역`, "서류 제출 동행"],
      priceLabel: EXPERT_OPTION_PRICE_LABEL,
    },
    {
      id: "full",
      title: "모든 서비스",
      summary: "작성부터 제출, 보완 대응, 결과 수령까지 전담합니다.",
      includes: [`${spec.doc} 작성`, spec.check, "제출 대행 또는 동행", "보완 요구 대응", "결과 수령 확인"],
      priceLabel: EXPERT_OPTION_PRICE_LABEL,
    },
  ];
}

const OPTIONS_BY_SERVICE: Record<string, ExpertOption[]> = Object.fromEntries(
  SPECS.map((spec) => [spec.serviceType, buildOptions(spec)]),
);

/** 12개 서비스만 값이 있다. 그 외(행정문서·부동산 등)는 null이라 기존 버튼이 그대로 나온다. */
export function getExpertOptions(serviceType: string | null | undefined): ExpertOption[] | null {
  if (!serviceType) return null;
  return OPTIONS_BY_SERVICE[serviceType.replace(/-/g, "_")] ?? null;
}
