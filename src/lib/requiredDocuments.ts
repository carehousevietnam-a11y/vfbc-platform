// 공통 Document Upload Page(/documents) 전용 필요서류 목록 설정.
//
// 모든 서비스는 동일한 업로드 원칙을 사용한다.
// - documents: 우선 제출
// - optionalDocuments: 있으면 제출
//
// AI 리포트와 전문가 진행은 같은 목록 구조를 사용하고,
// 화면 안내 문구만 각 목적에 맞게 다르게 표시한다.

export type DocumentServiceKey =
  | "wp"
  | "trc"
  | "tamtru"
  | "driving-license"
  | "verify_admin"
  | "verify_real-estate"
  | "verify_fraud"
  | "verify_tax"
  | "verify_unclear"
  | "register_restaurant"
  | "register_cosmetics"
  | "register_environment"
  | "register_fire_safety"
  | "register_franchise"
  | "register_hygiene"
  | "register_medical_device"
  | "permit_company"
  | "register_company"
  | "permit_company_individual"
  | "permit_company_corporate"
  | "register_company_individual"
  | "register_company_corporate";

export interface RequiredDocumentConfig {
  serviceKey: string;
  serviceLabel: string;
  documents: string[];
  optionalDocuments?: string[];
}

const CONFIG: Record<DocumentServiceKey, RequiredDocumentConfig> = {
  wp: {
    serviceKey: "wp",
    serviceLabel: "노동허가(WP)",
    documents: ["여권", "학력증명서", "범죄경력증명서", "건강진단서"],
    optionalDocuments: [
      "재직·경력 관련 자료",
      "기존 노동허가·보완·반려 관련 자료",
      "기타 관련 자료",
    ],
  },
  trc: {
    serviceKey: "trc",
    serviceLabel: "거주증(TRC)",
    documents: ["여권", "비자", "재직증명서", "회사서류"],
    optionalDocuments: [
      "주소지 관련 자료",
      "기존 거주증·보완·반려 관련 자료",
      "기타 관련 자료",
    ],
  },
  tamtru: {
    serviceKey: "tamtru",
    serviceLabel: "임시거주등록(땀주)",
    documents: ["여권", "임대차계약서", "주소지 증빙"],
    optionalDocuments: [
      "집주인 또는 관리사무소 관련 자료",
      "기존 등록·보완·반려 관련 자료",
      "기타 관련 자료",
    ],
  },
  "driving-license": {
    serviceKey: "driving-license",
    serviceLabel: "운전면허 전환",
    documents: ["여권", "거주증(TRC)", "본국 운전면허", "번역공증본"],
    optionalDocuments: [
      "면허 앞·뒷면 추가 사진",
      "기존 전환 신청·보완·반려 관련 자료",
      "기타 관련 자료",
    ],
  },
  verify_admin: {
    serviceKey: "verify_admin",
    serviceLabel: "행정문서 검토",
    documents: ["사건 내용 정리", "계약서·공문·통지서"],
    optionalDocuments: [
      "카카오톡·Zalo·이메일 대화 캡처",
      "사진·영수증·송금증 등 증거자료",
      "기타 참고자료",
    ],
  },
  "verify_real-estate": {
    serviceKey: "verify_real-estate",
    serviceLabel: "부동산 문서 검토",
    documents: ["매매·임대차 계약서", "등기부등본 등 소유권 증빙"],
    optionalDocuments: [
      "계약금·중도금 송금증",
      "카카오톡·Zalo·이메일 대화 캡처",
      "기타 참고자료",
    ],
  },
  verify_fraud: {
    serviceKey: "verify_fraud",
    serviceLabel: "사기·피해 문서 검토",
    documents: [
      "사건 내용 및 피해 경위 정리",
      "계약서·투자약정서·차용증",
      "송금증·입금내역·영수증",
    ],
    optionalDocuments: [
      "카카오톡·Zalo·이메일 대화 캡처",
      "신고서·통지서 등 관련 자료",
      "기타 증거자료",
    ],
  },
  verify_tax: {
    serviceKey: "verify_tax",
    serviceLabel: "세금 문서 검토",
    documents: ["세금 신고서·납부서", "세무기관 통지서·결정서"],
    optionalDocuments: [
      "계약서·세금계산서·영수증",
      "회계장부·거래내역",
      "회사 사업자·세무 관련 서류",
      "기타 참고자료",
    ],
  },
  verify_unclear: {
    serviceKey: "verify_unclear",
    serviceLabel: "분야 불명확 문서 검토",
    documents: ["사건 내용 및 진행 경위 정리", "계약서·공문·통지서"],
    optionalDocuments: [
      "카카오톡·Zalo·이메일 대화 캡처",
      "송금증·영수증·사진 등 증거자료",
      "기관 접수증·결정서",
      "기타 참고자료",
    ],
  },
  register_restaurant: {
    serviceKey: "register_restaurant",
    serviceLabel: "식당허가",
    documents: [
      "사업자등록증 또는 법인등록증",
      "영업장 임대차계약서",
      "대표자·조리 종사자 건강검진서",
    ],
    optionalDocuments: [
      "임대인의 법적 권리 증빙",
      "위생안전 시설 관련 자료",
      "소방시설·소방점검 관련 자료",
      "업장 평면도 또는 내부 사진",
      "기존 허가·보완·반려 관련 자료",
      "기타 관련 자료",
    ],
  },
  register_cosmetics: {
    serviceKey: "register_cosmetics",
    serviceLabel: "화장품허가",
    documents: [
      "사업자등록증 또는 법인등록증",
      "제조사 위임장",
      "자유판매증명서(CFS)",
      "제품 전성분표 및 성분자료",
    ],
    optionalDocuments: [
      "화장품 제품 공고 관련 신청자료",
      "제품정보파일(PIF) 또는 안전성 자료",
      "제품 라벨·포장 디자인 자료",
      "제조사 및 품질관리 관련 증빙",
      "기존 허가·보완·반려 관련 자료",
      "기타 제품별 추가자료",
    ],
  },
  register_environment: {
    serviceKey: "register_environment",
    serviceLabel: "환경허가",
    documents: [
      "사업자등록증 또는 법인등록증",
      "사업장 임대차계약서 또는 토지·공장 사용권 자료",
      "사업장 위치도·평면도 및 공정 설명자료",
      "환경영향평가서 또는 환경보호계획 관련 자료",
    ],
    optionalDocuments: [
      "배출시설·방지시설 설계도 및 설치자료",
      "폐수·대기·소음·폐기물 관련 측정자료",
      "원료·연료·생산량 및 공정 흐름도",
      "사업장 내부·외부 및 환경시설 사진",
      "기존 환경허가·보완요청서·반려 통지서",
      "기타 환경 관련 자료",
    ],
  },
  register_fire_safety: {
    serviceKey: "register_fire_safety",
    serviceLabel: "소방허가",
    documents: [
      "사업자등록증 또는 법인등록증",
      "영업장·사업장 임대차계약서",
      "건축물 평면도 및 소방시설 배치도",
      "소방시설 설치·점검 관련 자료",
    ],
    optionalDocuments: [
      "소방안전관리자 선임자료",
      "소방계획서·비상대피계획",
      "소화기·경보·스프링클러 등 시설 사진",
      "건축물 사용승인 또는 관련 건축자료",
      "기존 소방검사·보완요청서·반려 통지서",
      "기타 소방 관련 자료",
    ],
  },
  register_franchise: {
    serviceKey: "register_franchise",
    serviceLabel: "프랜차이즈 등록",
    documents: [
      "가맹본부 사업자등록증 또는 법인등록증",
      "직영점 운영 이력 증빙",
      "가맹계약서",
      "가맹사업 운영매뉴얼",
    ],
    optionalDocuments: [
      "가맹사업 정보공개자료",
      "상표권·브랜드 사용권 증빙",
      "직영점 매출·운영 관련 자료",
      "가맹점 교육·지원 체계 자료",
      "기존 등록·보완요청서·반려 통지서",
      "기타 프랜차이즈 관련 자료",
    ],
  },
  register_hygiene: {
    serviceKey: "register_hygiene",
    serviceLabel: "위생허가",
    documents: [
      "사업자등록증 또는 법인등록증",
      "영업장 임대차계약서",
      "영업장 평면도 및 시설 배치도",
      "대표자·종사자 건강검진서",
    ],
    optionalDocuments: [
      "종사자 위생교육 이수자료",
      "조리·저장·세척시설 사진",
      "식재료 보관·폐기물 처리 관련 자료",
      "수질검사 또는 방역·소독 관련 자료",
      "기존 위생검사·보완요청서·반려 통지서",
      "기타 위생 관련 자료",
    ],
  },
  register_medical_device: {
    serviceKey: "register_medical_device",
    serviceLabel: "의료기기 수입·유통허가",
    documents: [
      "사업자등록증 또는 법인등록증",
      "제조사 위임장 또는 공급계약서",
      "의료기기 제품 분류자료",
      "제품 품질·기술문서",
      "보관·유통시설 또는 창고 관련 자료",
    ],
    optionalDocuments: [
      "자유판매증명서(CFS)",
      "ISO·품질관리 인증자료",
      "제품 라벨·사용설명서",
      "시험성적서·안전성·성능 자료",
      "창고 평면도·시설 사진 및 관리절차",
      "기존 허가·보완요청서·반려 통지서",
      "기타 제품별 추가자료",
    ],
  },
  permit_company: {
    serviceKey: "permit_company",
    serviceLabel: "외국인투자 법인설립",
    documents: [],
    optionalDocuments: [],
  },
  register_company: {
    serviceKey: "register_company",
    serviceLabel: "외국인투자 법인설립",
    documents: [],
    optionalDocuments: [],
  },
  permit_company_individual: {
    serviceKey: "permit_company_individual",
    serviceLabel: "법인설립 · 개인 투자",
    documents: [
      "개인 투자자 여권",
      "개인 은행 잔고증명서",
      "예정 법정대표자 여권",
      "본점 임대차계약서 또는 예정 주소 자료",
    ],
    optionalDocuments: [
      "임대인의 법적 권리 증빙",
      "예정 법인명·사업목적·투자금 정리자료",
      "기존 보완요청서·반려 통지서",
      "사업장 내부 사진이나 시설자료",
      "기타 관련 자료",
    ],
  },
  register_company_individual: {
    serviceKey: "register_company_individual",
    serviceLabel: "법인설립 · 개인 투자",
    documents: [
      "개인 투자자 여권",
      "개인 은행 잔고증명서",
      "예정 법정대표자 여권",
      "본점 임대차계약서 또는 예정 주소 자료",
    ],
    optionalDocuments: [
      "임대인의 법적 권리 증빙",
      "예정 법인명·사업목적·투자금 정리자료",
      "기존 보완요청서·반려 통지서",
      "사업장 내부 사진이나 시설자료",
      "기타 관련 자료",
    ],
  },
  permit_company_corporate: {
    serviceKey: "permit_company_corporate",
    serviceLabel: "법인설립 · 법인 투자",
    documents: [
      "투자법인 등록증",
      "투자법인 정관",
      "투자법인 법정대표자 여권",
      "재무제표·감사보고서 또는 법인 잔고증명서",
      "예정 베트남 법인 법정대표자 여권",
      "본점 임대차계약서 또는 예정 주소 자료",
    ],
    optionalDocuments: [
      "투자 결정서 또는 이사회·주주총회 결의서",
      "위임장",
      "임대인의 법적 권리 증빙",
      "예정 법인명·사업목적·투자금 정리자료",
      "기존 보완요청서·반려 통지서",
      "사업장 내부 사진이나 시설자료",
      "기타 관련 자료",
    ],
  },
  register_company_corporate: {
    serviceKey: "register_company_corporate",
    serviceLabel: "법인설립 · 법인 투자",
    documents: [
      "투자법인 등록증",
      "투자법인 정관",
      "투자법인 법정대표자 여권",
      "재무제표·감사보고서 또는 법인 잔고증명서",
      "예정 베트남 법인 법정대표자 여권",
      "본점 임대차계약서 또는 예정 주소 자료",
    ],
    optionalDocuments: [
      "투자 결정서 또는 이사회·주주총회 결의서",
      "위임장",
      "임대인의 법적 권리 증빙",
      "예정 법인명·사업목적·투자금 정리자료",
      "기존 보완요청서·반려 통지서",
      "사업장 내부 사진이나 시설자료",
      "기타 관련 자료",
    ],
  },
};

const DEFAULT_CONFIG: RequiredDocumentConfig = {
  serviceKey: "unknown",
  serviceLabel: "서류",
  documents: ["여권", "비자"],
  optionalDocuments: ["회사서류", "사진", "기타 관련 자료"],
};

export function getRequiredDocuments(
  service: string | null | undefined,
  _mode?: "ai_report" | "expert"
): RequiredDocumentConfig {
  if (service && service in CONFIG) {
    return CONFIG[service as DocumentServiceKey];
  }

  return DEFAULT_CONFIG;
}
