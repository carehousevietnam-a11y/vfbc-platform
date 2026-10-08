import type { VerifySimpleEvidenceTier } from "@/components/cost-check/AdminVerifyPhase2EvidencePanel";

/** Admin 마스터 체인 — 서비스 중립 내용 주입 슬롯 (미지정 = Admin 기본값) */
export type VerifyMasterEvidenceContentSlots = {
  exampleTags?: readonly string[];
  detailNoteByTier?: Partial<Record<VerifySimpleEvidenceTier, string>>;
  footerNoteByTier?: Partial<Record<VerifySimpleEvidenceTier, string>>;
};

export type VerifyMasterFirstResultContentSlots = {
  firstResultTitle?: string;
  firstResultIntro?: string;
  personalizedResultTitle?: string;
  personalizedResultIntro?: string;
  /** 다음 단계 유료 CTA 설명 — 미지정 시 Admin 기본(행정문서) */
  paidDetailReviewDescription?: string;
  /** §03 주요 위험 요인 소제목 — 미지정 시 Admin 기본 */
  firstResultCautionsSectionSubtitle?: string;
  /** §03 위험 카드 0건 시 제목 — 미지정 시 Admin 기본(「주의할 위험 요인이 보이지 않습니다」) */
  firstResultNoRiskTitle?: string;
  /** §03 위험 카드 0건 시 본문 — 미지정 시 Admin 기본 */
  firstResultNoRiskBody?: string;
};

export type VerifyMasterContentSlots = {
  evidence?: VerifyMasterEvidenceContentSlots;
  firstResult?: VerifyMasterFirstResultContentSlots;
};
