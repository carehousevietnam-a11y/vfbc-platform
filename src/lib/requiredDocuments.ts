// 공통 Document Upload Page(/documents) 전용 필요서류 목록 설정.
//
// 주의: 기존 CHECK 4개 페이지(src/app/check/{wp,trc,tamtru,driving-license}/page.tsx)의
// WP_REQUIRED_DOCUMENTS / TRC_REQUIRED_DOCUMENTS / TAMTRU_REQUIRED_DOCUMENTS /
// LICENSE_REQUIRED_DOCUMENTS 상수는 절대 수정하지 않는다. 이 파일은 완전히 별도이며,
// /documents 페이지에서만 사용한다.
//
// 마스터문서 "AI 리포트 원칙"에 따라 상세 행정 절차 설명 없이, 여권/비자/노동허가증/
// 회사서류/사진처럼 목록 중심의 단순 명칭만 사용한다.

export type DocumentServiceKey =
  | "wp"
  | "trc"
  | "tamtru"
  | "driving-license"
  | "verify_admin"
  | "verify_real-estate"
  | "verify_fraud"
  | "verify_tax"
  | "verify_unclear";

export interface RequiredDocumentConfig {
  serviceKey: string;
  serviceLabel: string;
  documents: string[];
}

const CONFIG: Record<DocumentServiceKey, RequiredDocumentConfig> = {
  wp: {
    serviceKey: "wp",
    serviceLabel: "노동허가(WP)",
    documents: ["여권", "학력증명서", "범죄경력증명서", "건강진단서"],
  },
  trc: {
    serviceKey: "trc",
    serviceLabel: "거주증(TRC)",
    documents: ["여권", "비자", "재직증명서", "회사서류"],
  },
  tamtru: {
    serviceKey: "tamtru",
    serviceLabel: "임시거주등록(땀주)",
    documents: ["여권", "임대차계약서", "주소지 증빙"],
  },
  "driving-license": {
    serviceKey: "driving-license",
    serviceLabel: "운전면허 전환",
    documents: ["여권", "거주증(TRC)", "본국 운전면허", "번역공증본"],
  },
  // VERIFY(직접검토하기) 전용 — CHECK 4종과는 완전히 별도의 사건자료 목록.
  verify_admin: {
    serviceKey: "verify_admin",
    serviceLabel: "행정문서 검토",
    documents: [
      "사건 내용 정리",
      "계약서·공문·통지서",
      "카카오톡·Zalo·이메일 대화 캡처",
      "사진·영수증·송금증 등 증거자료",
      "기타 참고자료",
    ],
  },
  "verify_real-estate": {
    serviceKey: "verify_real-estate",
    serviceLabel: "부동산 문서 검토",
    documents: [
      "매매·임대차 계약서",
      "등기부등본 등 소유권 증빙",
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
      "카카오톡·Zalo·이메일 대화 캡처",
      "신고서·통지서 등 관련 자료",
      "기타 증거자료",
    ],
  },
  verify_tax: {
    serviceKey: "verify_tax",
    serviceLabel: "세금 문서 검토",
    documents: [
      "세금 신고서·납부서",
      "세무기관 통지서·결정서",
      "계약서·세금계산서·영수증",
      "회계장부·거래내역",
      "회사 사업자·세무 관련 서류",
      "기타 참고자료",
    ],
  },
  verify_unclear: {
    serviceKey: "verify_unclear",
    serviceLabel: "분야 불명확 문서 검토",
    documents: [
      "사건 내용 및 진행 경위 정리",
      "계약서·공문·통지서",
      "카카오톡·Zalo·이메일 대화 캡처",
      "송금증·영수증·사진 등 증거자료",
      "기관 접수증·결정서",
      "기타 참고자료",
    ],
  },
};

const DEFAULT_CONFIG: RequiredDocumentConfig = {
  serviceKey: "unknown",
  serviceLabel: "서류",
  documents: ["여권", "비자", "회사서류", "사진"],
};

export function getRequiredDocuments(service: string | null | undefined): RequiredDocumentConfig {
  if (service && service in CONFIG) {
    return CONFIG[service as DocumentServiceKey];
  }
  return DEFAULT_CONFIG;
}
