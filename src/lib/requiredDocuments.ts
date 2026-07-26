// 공통 Document Upload Page(/documents) 전용 필요서류 목록 설정.
//
// 주의: 기존 CHECK 4개 페이지(src/app/check/{wp,trc,tamtru,driving-license}/page.tsx)의
// WP_REQUIRED_DOCUMENTS / TRC_REQUIRED_DOCUMENTS / TAMTRU_REQUIRED_DOCUMENTS /
// LICENSE_REQUIRED_DOCUMENTS 상수는 절대 수정하지 않는다. 이 파일은 완전히 별도이며,
// /documents 페이지에서만 사용한다.
//
// 마스터문서 "AI 리포트 원칙"에 따라 상세 행정 절차 설명 없이, 여권/비자/노동허가증/
// 회사서류/사진처럼 목록 중심의 단순 명칭만 사용한다.

export type DocumentServiceKey = "wp" | "trc" | "tamtru" | "driving-license";

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
