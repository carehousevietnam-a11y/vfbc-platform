import type { VerifySimpleEvidenceTier } from "@/components/cost-check/AdminVerifyPhase2EvidencePanel";

/** Admin 마스터 체인 — 서비스 중립 내용 주입 슬롯 (미지정 = Admin 기본값) */
export type VerifyMasterEvidenceContentSlots = {
  exampleTags?: readonly string[];
  detailNoteByTier?: Partial<Record<VerifySimpleEvidenceTier, string>>;
  footerNoteByTier?: Partial<Record<VerifySimpleEvidenceTier, string>>;
};

/** 다른 서비스 진입 경로로 보내는 결과 화면 버튼. 대상 서비스 코드는 바꾸지 않는다. */
export type VerifyMasterResultServiceLink = {
  label: string;
  targetServiceEntryPath: string;
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
  /**
   * 결과 영역 연결 버튼.
   * Pack이 항목을 넘길 때만 표시한다. 없거나 빈 배열이면 렌더하지 않는다.
   */
  serviceLinks?: readonly VerifyMasterResultServiceLink[];
  /**
   * 결과 맨 위 긴급 안내 문구.
   * 표시 여부는 Pack이 판정하고, 문구가 있을 때만 넘긴다.
   */
  urgentNotice?: string;
};

export type VerifyMasterContentSlots = {
  evidence?: VerifyMasterEvidenceContentSlots;
  firstResult?: VerifyMasterFirstResultContentSlots;
};
