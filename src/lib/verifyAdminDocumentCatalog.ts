/** VERIFY 행정문서 — /documents 전용 자료 목록·설명 (UI 표현만, 업로드 handler와 분리). */

export type VerifyAdminDocPriority = "우선 제출" | "있으면 제출" | "선택";

export const VERIFY_ADMIN_EXTRA_EXPLANATION_LABEL = "추가 설명 자료";

export interface VerifyAdminDocumentSpec {
  label: string;
  priority: VerifyAdminDocPriority;
  /** Accordion — 왜 필요한가 */
  whyNeeded: string;
  /** Accordion — 어떤 자료를 올리면 되나요? */
  uploadGuide: string;
  examples: string[];
  /** case01_authorityDemand 조건부 노출 */
  requiresAuthorityDemand?: "payment" | "supplement";
}

const VERIFY_ADMIN_DOCUMENT_SPECS: VerifyAdminDocumentSpec[] = [
  {
    label: "교통국에서 받은 안내·통지 문서",
    priority: "우선 제출",
    whyNeeded:
      "교통국에서 어떤 안내를 받았는지 확인하기 위해, 받은 문서나 그 내용을 볼 수 있는 자료가 필요합니다.",
    uploadGuide:
      "교통국에서 받은 공문, 통지서, 안내문, 문자 또는 다른 사람이 설명·통역해 준 내용을 확인할 수 있는 자료를 올려주세요.",
    examples: ["공문", "통지서", "안내문", "문자", "문서 사진", "스크린샷"],
  },
  {
    label: "교통국에 제출했던 서류·자료",
    priority: "우선 제출",
    whyNeeded:
      "이미 교통국에 제출한 내용이 있다면, 그 자료를 함께 확인하면 사건 흐름을 더 정확히 파악할 수 있습니다.",
    uploadGuide:
      "이번 문제와 관련하여 교통국에 이미 제출한 서류나 자료가 있다면 올려주세요. 없으면 건너뛰어도 됩니다.",
    examples: ["신청서", "제출서류", "보완서류", "접수증", "영수증"],
  },
  {
    label: "교통국과 주고받은 답변·대화",
    priority: "있으면 제출",
    whyNeeded:
      "교통국에 문의하거나 답변을 받은 내용이 있으면, 그 대화가 사건의 다음 단계를 이해하는 데 도움이 됩니다.",
    uploadGuide:
      "교통국에 문의하거나 답변한 내용이 있다면 해당 대화나 답변을 올려주세요. 통역·구두 안내 내용도 가능합니다.",
    examples: [
      "카카오톡",
      "Zalo",
      "이메일",
      "문자",
      "담당자 답변",
      "통역을 통해 전달받은 내용",
    ],
  },
  {
    label: "실제 상황을 확인할 수 있는 자료",
    priority: "있으면 제출",
    whyNeeded:
      "교통국의 설명과 실제로 있었던 일이 같은지 비교하려면, 당시 상황을 보여주는 자료가 도움이 됩니다.",
    uploadGuide:
      "교통국의 설명과 실제 상황을 비교하는 데 도움이 되는 자료가 있으면 올려주세요. 베트남어 문서를 직접 읽지 못해도 괜찮습니다.",
    examples: ["사진", "영상", "접수 기록", "방문 기록", "예약 기록", "관련 문서"],
  },
  {
    label: "날짜·장소를 확인할 수 있는 자료",
    priority: "있으면 제출",
    whyNeeded:
      "언제, 어디에서 일이 있었는지가 맞는지 확인하려면 날짜·장소와 관련된 자료가 도움이 됩니다.",
    uploadGuide:
      "실제로 언제, 어디에서 일이 있었는지 확인하는 데 도움이 되는 자료가 있다면 올려주세요.",
    examples: ["방문 기록", "접수 기록", "예약 기록", "사진", "메시지", "영수증"],
  },
  {
    label: "납부 요구·금액을 확인할 수 있는 자료",
    priority: "우선 제출",
    whyNeeded:
      "얼마를 왜 납부해야 하는지 확인하려면, 납부 안내와 관련된 자료가 필요합니다.",
    uploadGuide:
      "얼마를 왜 납부해야 하는지 확인할 수 있는 안내나 관련 자료가 있다면 올려주세요. 아직 납부하지 않았다면 영수증은 없어도 됩니다.",
    examples: ["납부 안내", "금액이 표시된 문서", "고지 내용", "영수증", "납부 기록"],
    requiresAuthorityDemand: "payment",
  },
  {
    label: "보완 요구와 관련된 자료",
    priority: "우선 제출",
    whyNeeded:
      "교통국에서 추가 제출이나 수정을 요구했다면, 그 요구 내용과 관련 자료를 함께 확인할 수 있습니다.",
    uploadGuide:
      "교통국에서 추가로 제출하거나 수정하라고 안내한 내용과 관련된 자료를 올려주세요.",
    examples: ["보완 요청", "추가 제출 안내", "기존 제출서류", "수정 요청 내용"],
    requiresAuthorityDemand: "supplement",
  },
  {
    label: "추가 참고자료",
    priority: "선택",
    whyNeeded:
      "위 자료 외에 사건을 이해하는 데 도움이 되는 자료가 있으면 함께 확인할 수 있습니다.",
    uploadGuide: "위 자료 외에 사건을 이해하는 데 도움이 되는 자료가 있다면 추가해 주세요.",
    examples: ["기타 참고 문서", "관련 사진", "메모", "기타 자료"],
  },
];

export const VERIFY_ADMIN_EXTRA_EXPLANATION_SPEC: VerifyAdminDocumentSpec = {
  label: VERIFY_ADMIN_EXTRA_EXPLANATION_LABEL,
  priority: "선택",
  whyNeeded:
    "2차 질문에서 설명하지 못한 내용을 전문가에게 추가로 전달하고 싶을 때 사용합니다.",
  uploadGuide:
    "질문에서 설명하지 못한 내용을 추가로 전달하고 싶은 경우 올려주세요. 필수는 아닙니다.",
  examples: ["추가 설명 메모", "상황 정리 문서", "기타 보완 자료"],
};

export function buildVerifyAdminDocumentSpecs(
  authorityDemand?: string | null,
): VerifyAdminDocumentSpec[] {
  return VERIFY_ADMIN_DOCUMENT_SPECS.filter((spec) => {
    if (!spec.requiresAuthorityDemand) return true;
    return authorityDemand === spec.requiresAuthorityDemand;
  });
}

export function getVerifyAdminDocumentSpecByLabel(
  label: string,
  authorityDemand?: string | null,
): VerifyAdminDocumentSpec | null {
  if (label === VERIFY_ADMIN_EXTRA_EXPLANATION_LABEL) {
    return VERIFY_ADMIN_EXTRA_EXPLANATION_SPEC;
  }
  return (
    buildVerifyAdminDocumentSpecs(authorityDemand).find((spec) => spec.label === label) ??
    null
  );
}

/** getRequiredDocuments 호환 — 우선/있으면/선택(참고) 분리 */
export function getVerifyAdminRequiredDocumentConfig(authorityDemand?: string | null): {
  documents: string[];
  optionalDocuments: string[];
} {
  const specs = buildVerifyAdminDocumentSpecs(authorityDemand);
  return {
    documents: specs.filter((s) => s.priority === "우선 제출").map((s) => s.label),
    optionalDocuments: specs
      .filter((s) => s.priority === "있으면 제출" || s.priority === "선택")
      .map((s) => s.label),
  };
}
