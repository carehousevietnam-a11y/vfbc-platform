import { getRequiredDocuments } from "@/lib/requiredDocuments";
import type { InferredLegalRagContext } from "@/lib/aiGateway";

const MYPAGE_CTA =
  "정확한 서류 목록과 예시 샘플은 무료회원 가입 후 마이페이지에서 확인하실 수 있습니다.";

export const ANONYMOUS_GUIDE_DISCLAIMER =
  "이 내용은 AI가 제공하는 참고용 가이드이며, 실제 진행은 전문가와 상의하시기 바랍니다.";

const LEGAL_REFS: Partial<Record<string, string>> = {
  trc: "04/2016/TT-BNG, 47/2014/QH13",
  wp: "152/2020/NĐ-CP, 11/2020/TT-BLĐTBXH",
  tamtru: "04/2016/TT-BNG, 47/2014/QH13",
  "driving-license": "04/2016/TT-BNG, 47/2014/QH13",
};

const PROCESS_BY_GROUP: Record<InferredLegalRagContext["service_group"], string> = {
  check:
    "일반적으로는 ① 서류 준비 → ② 관할 출입국·거주 관리 기관 신청 → ③ 심사 후 발급 순으로 진행됩니다. 유형에 따라 추가 서류를 요청받을 수 있습니다.",
  verify:
    "일반적으로는 ① 서류·계약서 준비 → ② 전문가 검토 요청 → ③ 검토 결과에 따른 다음 조치 순으로 진행됩니다.",
  register:
    "일반적으로는 ① 서류 준비 → ② 관할 등록·허가 기관 신청 → ③ 심사·현장 확인 후 승인 순으로 진행됩니다. 업종에 따라 추가 서류를 요청받을 수 있습니다.",
};

function openingLine(
  serviceLabel: string,
  serviceGroup: InferredLegalRagContext["service_group"]
): string {
  if (serviceGroup === "verify") {
    return `네, **${serviceLabel}** 검토에 필요한 서류를 정리해 드릴게요.`;
  }
  if (serviceGroup === "register") {
    return `네, **${serviceLabel}** 등록에 필요한 서류를 정리해 드릴게요.`;
  }
  return `네, **${serviceLabel}** 신청에 필요한 서류를 정리해 드릴게요.`;
}

function docIntroLine(serviceLabel: string, serviceGroup: InferredLegalRagContext["service_group"]): string {
  if (serviceGroup === "verify") {
    return `${serviceLabel} 검토를 위해 아래와 같은 서류가 필요합니다.`;
  }
  if (serviceGroup === "register") {
    return `${serviceLabel} 등록에 아래와 같은 서류가 필요합니다.`;
  }
  return `${serviceLabel} 신청에 아래와 같은 서류가 필요합니다.`;
}

function mergedDocumentLines(serviceType: string): string[] {
  const config = getRequiredDocuments(serviceType);
  const optional = config.optionalDocuments ?? [];
  return [...config.documents, ...optional];
}

function legalBasisLine(serviceType: string): string {
  const refs = LEGAL_REFS[serviceType];
  if (refs) {
    return `관련 법령: ${refs} (구체 조항은 전문가 확인 필요)`;
  }
  return "관련 법령은 사안별로 다르며, 구체 조항은 전문가 확인이 필요합니다.";
}

/** 익명 /ai — 주제 추정 성공 시 즉시 반환하는 구조화 가이드. */
export function buildAnonymousFastGuide(
  inferred: InferredLegalRagContext,
  options?: { legalBasisLine?: string }
): string {
  const config = getRequiredDocuments(inferred.service_type);
  const docs = mergedDocumentLines(inferred.service_type);
  const bullets = docs.map((item) => `· ${item}`).join("\n");
  const legalLine = options?.legalBasisLine ?? legalBasisLine(inferred.service_type);

  return [
    openingLine(config.serviceLabel, inferred.service_group),
    "",
    docIntroLine(config.serviceLabel, inferred.service_group),
    "",
    bullets,
    "",
    PROCESS_BY_GROUP[inferred.service_group],
    "",
    legalLine,
    "",
    ANONYMOUS_GUIDE_DISCLAIMER,
    "",
    MYPAGE_CTA,
  ].join("\n");
}

/** 하위 호환 — fast guide와 동일한 형식을 사용한다. */
export function buildAnonymousStructuredFallback(
  _question: string,
  inferred: InferredLegalRagContext
): string {
  return buildAnonymousFastGuide(inferred);
}
