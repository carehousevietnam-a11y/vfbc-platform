export {
  REAL_ESTATE_PHASE2_DOCUMENT_LISTS,
  type RealEstatePhase2DocumentList,
} from "./generated/meta";

import { REAL_ESTATE_PHASE2_DOCUMENT_LISTS } from "./generated/meta";
import type { RealEstateCaseId } from "./types";
import { correctParticlesInSentence } from "./koreanParticle";

/** `/documents?mode=phase2_upload` RE 필수 서류 — `documents/page.tsx` L788~794 와 동일 소스 */
export function listRealEstatePhase2RequiredDocuments(caseId: RealEstateCaseId): string[] {
  return (REAL_ESTATE_PHASE2_DOCUMENT_LISTS[caseId]?.documents ?? [])
    .map((label) => label.trim())
    .filter(Boolean);
}

export function primaryRealEstatePhase2DocumentLabel(caseId: RealEstateCaseId): string {
  return listRealEstatePhase2RequiredDocuments(caseId)[0] ?? "원본 문서";
}

/** RECOMMENDED ACTIONS ② — 문서명 1회, `…내용을 {doc}의 기재 내용과` */
export function buildRealEstatePhase2PdfCompareAnswersLine(primaryDoc: string): string {
  const trimmed = primaryDoc.trim() || "원본 문서";
  return correctParticlesInSentence(
    `2차에 입력하신 내용을 ${trimmed}의 기재 내용과 대조해 주세요.`,
  );
}
