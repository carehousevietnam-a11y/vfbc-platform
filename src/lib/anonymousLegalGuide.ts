import { getRequiredDocuments } from "@/lib/requiredDocuments";
import type { InferredLegalRagContext } from "@/lib/aiGateway";

const MYPAGE_CTA =
  "정확한 서류 목록과 예시 샘플은 무료회원 가입 후 마이페이지에서 확인하실 수 있습니다.";

const EXPERT_CTA =
  "회원님 상황에 맞는 정확한 확인이 필요하시면, 마이페이지 Case Room에서 「전문가 상담 요청」을 남겨 주세요. VFBCAI 전문가팀이 서류를 검토한 뒤 다음 단계를 안내해 드립니다.";

const DISCLAIMER =
  "이 내용은 AI가 관련 법령을 바탕으로 제공하는 참고용 가이드이며, 실제 진행은 반드시 전문가와 상의하시기 바랍니다.";

/** Legal RAG 호출 실패 시에도 익명 /ai 에 구조화 가이드를 유지한다. */
export function buildAnonymousStructuredFallback(
  question: string,
  inferred: InferredLegalRagContext
): string {
  const config = getRequiredDocuments(inferred.service_type);
  const required = config.documents.map((item) => `  · ${item}`).join("\n");
  const optional = (config.optionalDocuments ?? []).map((item) => `  · ${item}`).join("\n");
  const q = question.trim();

  return [
    `말씀하신 "${q}"은(는) **${config.serviceLabel}** 관련 문의로 이해했습니다.`,
    "",
    "관련 법령 데이터를 지금 불러오지 못했지만, 아래 순서로 서류를 준비하시면 전문가 상담 시 훨씬 빠르게 안내를 받으실 수 있습니다.",
    "",
    "【필수 행정서류】",
    required || "  · 여권 및 현재 체류 자격(비자) 정보",
    "",
    "【추가·첨부 서류】",
    optional || "  · 기관에서 추가로 요청할 수 있는 확인 서류",
    "",
    MYPAGE_CTA,
    "",
    EXPERT_CTA,
    "",
    DISCLAIMER,
  ].join("\n");
}
