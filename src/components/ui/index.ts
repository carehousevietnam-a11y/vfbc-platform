// STEP12-1: VFBCAI 공통 UI 컴포넌트 라이브러리 진입점.
// 앞으로 CHECK / VERIFY / REGISTER / AI REPORT / CUSTOMER / ADMIN 화면은
// 이 아래 컴포넌트만 사용하도록 단계적으로 전환한다. (이번 STEP에서는 미적용)
export { default as SelectionCard } from "./SelectionCard";
export { default as QuestionSection } from "./QuestionSection";
export { default as SectionHeader } from "./SectionHeader";
export { default as StepBadge } from "./StepBadge";
export { default as PrimaryButton } from "./PrimaryButton";
export { TextField, TextAreaField } from "./InputCard";
export { default as NoticeCard } from "./NoticeCard";
export { default as ResultCard } from "./ResultCard";
export { default as EmptyState } from "./EmptyState";
export { default as StatusBadge } from "./StatusBadge";
export { default as InfoBox } from "./InfoBox";
export { default as Divider } from "./Divider";
export { default as VerifyAnswerGrid } from "./VerifyAnswerGrid";
export { default as OfficialTrustZone } from "./OfficialTrustZone";
export { default as VerifyStepLayout } from "./VerifyStepLayout";
export {
  VERIFY_STEP4_ATTACHMENT_LABEL_CLASS,
  VERIFY_STEP4_ATTACHED_CARD_CLASS,
  VERIFY_STEP4_TEXTAREA_CLASS,
  VerifyAttachedFileNote,
  VerifyAttachmentHint,
  VerifyStep4InputStack,
  VerifyTextareaHint,
} from "./verifyStep4Ui";
export {
  VERIFY_AI_REVIEW_CARD_DESC,
  VERIFY_AI_REVIEW_CTA_FOOTNOTE,
  VERIFY_DIAGNOSIS_LIMIT_NOTICE,
  VERIFY_DIAGNOSIS_NEXT_SUBTITLE,
  VERIFY_DIAGNOSIS_NEXT_TITLE,
  VERIFY_DIRECT_CARD_DESC,
  VERIFY_EXPERT_CARD_DESC,
  VERIFY_EXPERT_CTA_FOOTNOTE,
  VERIFY_EXPERT_GUIDANCE_DESC,
  VerifyDiagnosisContextLine,
  VerifyDiagnosisHeader,
  VerifyDiagnosisPipelineHint,
  VerifyFormFieldsIntro,
  VerifyFormFieldsSection,
  VerifyFormPageHeader,
  VerifyFormPreviewPanel,
  getVerifyFormConsentText,
  getVerifyFormPrivacyText,
} from "./verifyFunnelCopy";
export {
  RiskGauge,
  VerifyDiagnosisNextSteps,
  VerifyResultOverviewCards,
  VerifyResultSummaryCard,
} from "./VerifyDiagnosisUi";
