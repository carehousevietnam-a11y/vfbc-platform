"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Lightbulb,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  PrimaryButton,
  QuestionSection,
  SelectionCard,
  VERIFY_STEP4_TEXTAREA_CLASS,
  VerifyAnswerGrid,
  VerifyStep4InputStack,
  VerifyTextareaHint,
} from "@/components/ui";
import OfficialTrustZone from "@/components/ui/OfficialTrustZone";
import type { SelectionCardTone } from "@/components/ui/SelectionCard";
import {
  selectionChipClasses,
  selectionPrimaryActionClasses,
  selectionSecondaryActionClasses,
} from "@/components/ui/selectionInteraction";
import type { MasterLandingConfig } from "@/components/cost-check/MasterFunnelLanding";
import { cn } from "@/lib/cn";
import { CompanySummarySidebar } from "@/components/cost-check/CompanySummarySidebar";
import { DrivingSummarySidebar } from "@/components/cost-check/DrivingSummarySidebar";
import { RegisterSummarySidebar } from "@/components/cost-check/RegisterSummarySidebar";
import { RestaurantSummarySidebar } from "@/components/cost-check/RestaurantSummarySidebar";
import { TamtruSummarySidebar } from "@/components/cost-check/TamtruSummarySidebar";
import { TrcSummarySidebar } from "@/components/cost-check/TrcSummarySidebar";
import { AdminSummarySidebar } from "@/components/cost-check/AdminSummarySidebar";
import {
  AdminVerifyFirstResultPanel,
  buildAdminVerifyPersonalizedResult,
  buildAdminVerifyPersonalizedContext,
  buildAdminVerifyFirstResult,
  formatCase01AnswerSummary,
  type AdminVerifyPersonalizedContext,
} from "@/components/cost-check/AdminVerifyFirstResultPanel";
import { AdminVerifyPhase2EvidencePanel } from "@/components/cost-check/AdminVerifyPhase2EvidencePanel";
import { WpSummarySidebar } from "@/components/cost-check/WpSummarySidebar";
import {
  computeDisplayBubblePercent,
  computeReviewScore,
} from "@/components/cost-check/ReviewScoreGauge";
import { hasMarketPriceData } from "@/components/cost-check/MasterCostFunnel";
import {
  COST_CHECK_DISCLAIMER,
  evaluateCostQuoteReview,
  formatCostAmount,
  type CostCheckService,
  type CostCheckServiceId,
  type ReviewVerdict,
} from "@/lib/costCheck";
import { getPublishedArticleBySlug } from "@/lib/contentPacks/registry";
import type { FunnelEngine } from "@/components/engine/funnelTokens";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  ADMIN_CASE_ENTRY_Q1_LABEL,
  ADMIN_CASE_ENTRY_Q1_OPTIONS,
  ADMIN_CASE_ENTRY_Q1_OPTION_LABELS,
  ADMIN_CASE_ENTRY_Q1_OTHER_KEY,
  CASE01_CUSTOMER_RESPONDED_NOTE_KEY,
  CASE01_FACT_RELATIONSHIP_NOTE_KEY,
  CASE01_VIOLATION_CONTENT_NOTE_KEY,
  ADMIN_SITUATION_OPTIONS,
  attachCaseResolutionSnapshot,
  buildAdminVerifyAnswersPersistMeta,
  buildAdminVerifyProfileQuestions,
  buildCaseResolutionMetaFromAnswers,
  ADMIN_PROFILING_COMPLETE_META_FLAG,
  isAdminVerifyPhase1Complete,
  isAdminVerifyPhase2PathComplete,
  type AdminVerifyProfilePhase,
  ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY,
  ADMIN_PHASE2_EVIDENCE_ATTACHED_ANSWERS_KEY,
  ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY,
  ADMIN_RESTORED_PROFILE_PHASE_KEY,
  resolveAdminPhase2EvidenceFileName,
  CASE01_ANSWER_KEYS,
  CASE01_OPTION_LABELS,
  CASE02_ANSWER_KEYS,
  CASE02_OPTION_LABELS,
  getCase02FieldOptionLabel,
  CASE03_ANSWER_KEYS,
  CASE03_OPTION_LABELS,
  getCase03FieldOptionLabel,
  CASE04_ANSWER_KEYS,
  CASE04_OPTION_LABELS,
  getCase04FieldOptionLabel,
  CASE05_ANSWER_KEYS,
  CASE06_ANSWER_KEYS,
  getCase05FieldOptionLabel,
  getCase06FieldOptionLabel,
  CASE_CUSTOMER_INPUT_KEY,
  applyCustomerInputToAnswers,
  deserializeCaseResolutionProfile,
  getAdminVerifyPhase1VisibleFields,
  getAdminVerifyStitchProgress,
  getAdminChoiceNoteKey,
  ADMIN_DIRECT_EXPLAIN_LABEL,
  isAdminDirectExplainOption,
  isAdminVerifyChoiceFieldComplete,
  deriveStageFromSituation,
  getQ1ResolvedCase,
  getEffectiveAdminVerifyCase,
  applyCase06BridgeSnapshot,
  isCase06AwaitingBridgeSnapshot,
  isCase06ExpertTerminal,
  maybeApplyCase06ExpertTerminalOnAnswer,
  isAdminCaseEntryQ1Complete,
  markFieldAsked,
  mergeCustomerCaseInput,
  type CaseResolutionProfile,
  type ProfileQuestion,
  wasFieldAsked,
} from "@/lib/adminVerifyProfiling";
import {
  REAL_ESTATE_ENTRY_Q1_KEY,
  REAL_ESTATE_OPTION_LABELS,
  applyRealEstateCustomerInputSeed,
  attachRealEstateProfileSnapshot,
  buildRealEstatePhase2ProfileQuestions,
  buildRealEstateVerifyProfileQuestions,
  extractRealEstatePhase2Answers,
  isRealEstatePhase2Complete,
  isRealEstateProfilingComplete,
  REAL_ESTATE_RESTORED_PROFILE_PHASE_KEY,
  RE2_PHASE2_DIRECT_EXPLAIN_CHOICE_TO_DETAIL,
  RE_PHASE1_DIRECT_EXPLAIN_CHOICE_TO_DETAIL,
  RE_PHASE1_EVIDENCE_FILE_NAME_KEY,
  resolveRealEstatePhase2EvidenceFileName,
  seedRealEstateAnswersFromExternal,
  type RealEstateVerifyProfilePhase,
} from "@/lib/realEstateVerifyProfiling";
import { buildRealEstateFirstResult } from "@/lib/realEstateVerifyFirstResult";
import { resolveVerifyPaidTransitionHooks } from "@/lib/verifyPaidTransitionHooks";
import { buildRealEstatePersonalizedResult } from "@/lib/realEstateVerifyPersonalizedResult";

/** OfficialTrustZone과 동일 출처 — 검토 엔진별 관련 공식 기관만 */
const REVIEW_OFFICIAL_AGENCIES: Record<FunnelEngine, string[]> = {
  verify: ["법무부", "국회", "최고인민법원"],
  check: ["공안부(출입국)", "노동보훈사회부", "전자정부 포털"],
  register: ["기획투자부", "보건부", "전자정부 포털"],
};

function ReviewOfficialTrustStrip({ engine }: { engine: FunnelEngine }) {
  const agencies = REVIEW_OFFICIAL_AGENCIES[engine];

  return (
    <div
      className="mt-2 border-t border-[#EEF2F6] pt-2"
      aria-label="공식 기준 안내"
    >
      <p className="break-keep text-[10.5px] font-normal leading-snug text-[#64748B] sm:text-[10px]">
        공식 법령·행정자료 기준 확인
      </p>
      <p className="mt-0.5 break-keep text-[10px] font-normal leading-snug text-[#94A3B8] sm:text-[10px]">
        관련 공식 기관:{" "}
        <span className="text-[#64748B]">{agencies.join(" · ")}</span>
      </p>
    </div>
  );
}

const RE2_PHASE2_DIRECT_EXPLAIN_PLACEHOLDERS: Record<string, string> = {
  re2_clauseFocus:
    "어떤 조항·문구가 걱정되는지 구체적으로 적어 주세요 (누구·어떤 조항·왜 불리한지).",
  re2_conflictFocus:
    "서류와 실제 상황이 어디서·어떻게 다른지 구체적으로 적어 주세요.",
  re2_timelineStage:
    "언제부터·어떤 연락·대응이 있었는지 구체적으로 적어 주세요.",
};

const RE_PHASE1_DIRECT_EXPLAIN_PLACEHOLDERS: Record<string, string> = {
  re_preStage: "지금 어느 단계에 가까운지 — 선택지에 없으면 직접 적어 주세요.",
  re_disputeSubject: "어떤 문제에 가장 가까운지 — 선택지에 없으면 직접 적어 주세요.",
  re_docSubject: "어떤 서류인지 — 선택지에 없으면 직접 적어 주세요.",
  re_propertyType: "어떤 거래·물건인지 — 선택지에 없으면 직접 적어 주세요.",
  re_counterparty: "함께 진행 중인 상대가 누구인지 — 선택지에 없으면 직접 적어 주세요.",
  re_goal: "무엇을 가장 먼저 확인하고 싶은지 — 선택지에 없으면 직접 적어 주세요.",
  re_docsMatch: "서류와 실제 상황이 같은지 — 선택지에 없으면 직접 적어 주세요.",
  re_situationGap: "서류와 실제 상황이 다른 부분 — 선택지에 없으면 직접 적어 주세요.",
};

const VERIFY_QUESTION_REASON_GUIDE_COPY = {
  phase1: {
    title: "질문 하나하나가 다음 판단으로 연결됩니다.",
    body:
      "현재 상황을 파악하고 먼저 확인할 부분을 좁히기 위한 질문입니다. 자세히 답해주실수록 내 상황에 맞는 확인이 가능합니다.",
  },
  phase2: {
    title: "이제 내 상황을 조금 더 깊게 확인합니다.",
    body:
      "1차 답변을 바탕으로 놓치기 쉬운 부분을 추가로 확인합니다. 자세히 답해주실수록 더 정확한 개인화 결과를 받을 수 있습니다.",
  },
} as const;

/** VERIFY 질문 이유 안내 (Official Sources stitch 패널과 동일 디자인 언어). */
function VerifyQuestionReasonGuidePanel({
  className,
  phase,
}: {
  className?: string;
  phase: 1 | 2;
}) {
  const copy = phase === 2 ? VERIFY_QUESTION_REASON_GUIDE_COPY.phase2 : VERIFY_QUESTION_REASON_GUIDE_COPY.phase1;

  return (
    <aside
      className={cn(
        "rounded-xl border border-[#eef2f6] bg-[#fbfcfd] p-4 shadow-sm",
        className,
      )}
      aria-label="질문 이유 안내"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        QUESTION GUIDE
      </p>
      <p className="mt-1 break-keep text-[13px] font-bold leading-snug text-[#0f172a]">
        {copy.title}
      </p>
      <p className="mt-1 break-keep text-[11.5px] leading-normal text-slate-500 [overflow-wrap:normal]">
        {copy.body}
      </p>
    </aside>
  );
}

/** VERIFY Master trust rail — QUESTION GUIDE + OFFICIAL SOURCES only (no CTA). */
function VerifyMasterTrustRailPanel({
  className,
  phase = 1,
  showQuotationReportHeader = false,
  showOfficialReviewPhrase = false,
  officialTrustLayout = "stitch" as "stitch" | "stitch-mobile",
}: {
  className?: string;
  phase?: 1 | 2;
  showQuotationReportHeader?: boolean;
  showOfficialReviewPhrase?: boolean;
  officialTrustLayout?: "stitch" | "stitch-mobile";
}) {
  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {showQuotationReportHeader ? (
        <div className="border-b border-[#E5E7EB] pb-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
            QUOTATION REPORT
          </p>
        </div>
      ) : null}
      {showOfficialReviewPhrase ? (
        <p className="mb-6 text-[12px] font-normal text-slate-400">
          공식 법령·행정자료를 기준으로 검토합니다.
        </p>
      ) : null}
      <VerifyQuestionReasonGuidePanel phase={phase} className="w-full" />
      <OfficialTrustZone
        engine="verify"
        variant="panel"
        layout={officialTrustLayout}
        className="w-full"
      />
    </div>
  );
}

const MOBILE_SECTION_INTRO =
  "mb-2 max-w-[40rem] max-sm:text-[11px] max-[389px]:text-[10.5px] max-sm:font-normal max-sm:leading-none max-sm:tracking-tight max-sm:whitespace-nowrap break-keep text-[13px] font-normal leading-[1.55] text-[#64748B] sm:mb-1.5 sm:text-[13px] sm:leading-[1.65] sm:text-[#475569] sm:whitespace-normal";
const MOBILE_SUBHEAD =
  "text-[13px] font-medium leading-snug text-[#334155] sm:text-[14px] sm:font-semibold sm:text-[#0B2A6B]";
const MOBILE_BODY =
  "break-keep text-[13px] font-normal leading-[1.55] text-[#64748B] sm:text-[12px] sm:leading-relaxed sm:text-[#475569]";
const MOBILE_BODY_TIGHT =
  "text-[13px] font-normal leading-snug text-[#64748B] sm:mt-0.5 sm:text-[12px] sm:font-medium sm:text-[#334155]";
const MOBILE_META =
  "mt-1.5 text-[12px] font-normal leading-[1.5] text-[#94A3B8] sm:mt-1 sm:text-[11.5px] sm:leading-relaxed sm:text-[#64748B]";
const MOBILE_CARD_LABEL =
  "break-keep text-pretty text-[13px] font-medium leading-snug text-[#475569] sm:text-[11.5px] sm:font-medium sm:text-[#0B2A6B]";
const MOBILE_CARD_NOTE =
  "mt-0.5 line-clamp-2 break-keep text-pretty text-[12px] font-medium leading-snug text-[#64748B] sm:mt-0.5 sm:text-[10.5px] sm:leading-snug sm:text-[#475569]";
const MOBILE_CALLOUT =
  "min-w-0 max-w-[40rem] break-keep text-pretty text-[13px] font-normal leading-[1.55] text-[#64748B] sm:text-[12px] sm:leading-[1.65] sm:text-[#334155]";
const MOBILE_GRADE_LABEL =
  "mt-1 text-[13px] font-medium leading-snug text-[#475569] sm:mt-0.5 sm:text-[15px] sm:font-semibold sm:leading-none sm:text-[#0B2A6B]";
const MOBILE_COST_SUMMARY_INTRO =
  "max-w-[40rem] max-sm:text-[11px] max-[389px]:text-[10.5px] max-sm:font-normal max-sm:leading-none max-sm:tracking-tight max-sm:whitespace-nowrap break-keep text-[13px] font-normal leading-[1.55] text-[#64748B] sm:text-[13px] sm:leading-[1.65] sm:text-[#475569] sm:whitespace-normal";
const MOBILE_REPORT_SOURCE =
  "break-keep max-sm:text-[9px] max-[389px]:text-[8.5px] max-sm:font-normal max-sm:leading-none max-sm:tracking-tight max-sm:whitespace-nowrap text-[12.5px] leading-[1.45] text-[#64748B] sm:text-[11px] sm:leading-relaxed sm:whitespace-normal";
type YesNo = "yes" | "no";
type ReviewStage = "prevent" | "case";

const REVIEW_STAGE_CARD_OPTIONS: {
  value: ReviewStage;
  title: string;
  desc: string;
  icon: typeof ShieldCheck;
  tone: SelectionCardTone;
}[] = [
  {
    value: "prevent",
    title: "제출·계약 전 서류 검토",
    desc: "서류를 제출하거나 계약하기 전에 확인하고 싶어요.",
    icon: ShieldCheck,
    tone: "blue",
  },
  {
    value: "case",
    title: "문제 발생 후 대응 검토",
    desc: "서류와 관련해 문제가 생겨 어떻게 대응해야 할지 확인하고 싶어요.",
    icon: AlertTriangle,
    tone: "amber",
  },
];

const ADMIN_SITUATION_CARD_OPTIONS: {
  value: string;
  title: string;
  desc: string;
  icon: typeof ShieldCheck;
  tone: SelectionCardTone;
}[] = [
  {
    value: "pre_submission",
    title: "제출·계약 전 확인",
    desc: "서류를 제출하거나 계약하기 전에 확인하고 있어요.",
    icon: ShieldCheck,
    tone: "blue",
  },
  {
    value: "received_document",
    title: "서류를 받은 상태",
    desc: "기관이나 상대방에게서 서류를 받았어요.",
    icon: FileText,
    tone: "blue",
  },
  {
    value: "post_submission_problem",
    title: "제출 후 문제 발생",
    desc: "서류를 제출했는데 문제가 생겼어요.",
    icon: AlertTriangle,
    tone: "amber",
  },
  {
    value: "unknown_problem",
    title: "문제 원인 불명확",
    desc: "문제가 있다고 느끼지만 무엇이 문제인지 모르겠어요.",
    icon: AlertTriangle,
    tone: "amber",
  },
  {
    value: "unsure",
    title: "잘 모르겠어요",
    desc: "상황을 직접 설명해 주시면 이어서 확인합니다.",
    icon: Lightbulb,
    tone: "slate",
  },
];

const ADMIN_OTHER_OPTION: { value: string; title: string } = {
  value: "other",
  title: "기타 · 직접 입력",
};

function withAdminOtherOption(
  options: { value: string; title: string }[],
): { value: string; title: string }[] {
  return [...options, ADMIN_OTHER_OPTION];
}

const ADMIN_DOCS_FOLLOWUP_MISMATCH_OPTIONS = withAdminOtherOption([
  { value: "address", title: "주소·지역 정보가 실제와 다릅니다" },
  { value: "date", title: "날짜·기간 정보가 실제와 다릅니다" },
  { value: "name", title: "이름·인적사항이 실제와 다릅니다" },
  { value: "amount", title: "금액·수치 정보가 실제와 다릅니다" },
]);

const ADMIN_DOCS_FOLLOWUP_UNKNOWN_OPTIONS = withAdminOtherOption([
  { value: "translation", title: "번역본·원본 대조를 하지 못했습니다" },
  { value: "certification", title: "공증·인증 여부를 확인하지 못했습니다" },
  { value: "details", title: "세부 항목 확인이 어렵습니다" },
]);

const ADMIN_DOCS_FOLLOWUP_OTHER_OPTIONS = withAdminOtherOption([
  { value: "situation", title: "상황 설명이 필요합니다" },
  { value: "document", title: "서류 내용 확인이 필요합니다" },
]);

const ADMIN_CONTENT_CHECK_FOLLOWUP_OPTIONS = withAdminOtherOption([
  { value: "missing", title: "빠진 내용이 있을 수 있습니다" },
  { value: "incorrect", title: "잘못 적힌 내용이 있을 수 있습니다" },
  { value: "unclear", title: "어떤 내용을 확인해야 하는지 모르겠습니다" },
]);

const ADMIN_FORMAT_PROOF_FOLLOWUP_PARTIAL_OPTIONS = withAdminOtherOption([
  { value: "signature", title: "서명·날짜를 확인하지 못했습니다" },
  { value: "translation", title: "번역본 대조를 하지 못했습니다" },
  { value: "certification", title: "공증·인증을 확인하지 못했습니다" },
]);

const ADMIN_FORMAT_PROOF_FOLLOWUP_NOT_CHECKED_OPTIONS = withAdminOtherOption([
  { value: "no_original", title: "원본·번역본이 없습니다" },
  { value: "unknown_requirements", title: "어떤 증빙이 필요한지 모릅니다" },
]);

const ADMIN_FORMAT_PROOF_FOLLOWUP_UNSURE_OPTIONS = withAdminOtherOption([
  { value: "certification_process", title: "공증·인증 절차가 불명확합니다" },
  { value: "document_types", title: "필요 서류 종류를 모릅니다" },
]);

const ADMIN_FORMAT_PROOF_FOLLOWUP_OTHER_OPTIONS = withAdminOtherOption([
  { value: "need_review", title: "형식·증빙 검토가 필요합니다" },
]);

const ADMIN_SUBMISSION_FOLLOWUP_AGENCY_OPTIONS = withAdminOtherOption([
  { value: "method", title: "제출 방법을 확인하지 못했습니다" },
  { value: "documents", title: "제출 서류를 확인하지 못했습니다" },
  { value: "online", title: "온라인 접수 방법을 모릅니다" },
]);

const ADMIN_SUBMISSION_FOLLOWUP_NOT_CHECKED_OPTIONS = withAdminOtherOption([
  { value: "agency", title: "관할기관이 미확정입니다" },
  { value: "procedure", title: "제출 절차 정보가 부족합니다" },
]);

const ADMIN_SUBMISSION_FOLLOWUP_UNSURE_OPTIONS = withAdminOtherOption([
  { value: "target", title: "제출 대상 서류가 불명확합니다" },
  { value: "authority", title: "관할기관을 모릅니다" },
]);

const ADMIN_SUBMISSION_FOLLOWUP_OTHER_OPTIONS = withAdminOtherOption([
  { value: "need_guidance", title: "제출 경로 안내가 필요합니다" },
]);

const ADMIN_DEADLINE_FOLLOWUP_UNCERTAIN_OPTIONS = withAdminOtherOption([
  { value: "submit_date", title: "제출 마감일이 불확실합니다" },
  { value: "validity", title: "서류 유효기간이 불확실합니다" },
  { value: "renewal", title: "갱신·연장 기한이 불확실합니다" },
]);

const ADMIN_DEADLINE_FOLLOWUP_NOT_CHECKED_OPTIONS = withAdminOtherOption([
  { value: "no_info", title: "안내 문서에 기한이 없습니다" },
  { value: "unclear_mark", title: "기한 표기가 불명확합니다" },
]);

const ADMIN_DEADLINE_FOLLOWUP_UNSURE_OPTIONS = withAdminOtherOption([
  { value: "pending_doc", title: "제출 예정 서류의 기한을 모릅니다" },
  { value: "renewal_needed", title: "갱신·연장 필요 여부를 모릅니다" },
]);

const ADMIN_DEADLINE_FOLLOWUP_OTHER_OPTIONS = withAdminOtherOption([
  { value: "need_review", title: "기한·유효기간 검토가 필요합니다" },
]);

const ADMIN_PROFILE_FOLLOW_UP_DEFS: Record<string, ProfileQuestion> = {
  contentCheckFollowUp: {
    id: "contentCheckFollowUp",
    kind: "followUpChoice",
    label: "추가로 확인할 내용을 입력해주세요.",
    options: ADMIN_CONTENT_CHECK_FOLLOWUP_OPTIONS,
    placeholder: "서류 내용과 관련해 직접 확인하고 싶은 부분을 적어주세요.",
  },
  formatProofPartial: {
    id: "formatProofFollowUp",
    kind: "followUpChoice",
    label: "어떤 부분을 아직 확인하지 못하셨나요?",
    options: ADMIN_FORMAT_PROOF_FOLLOWUP_PARTIAL_OPTIONS,
    placeholder: "예: 공증 여부, 번역본 대조, 서명·날짜 등",
  },
  formatProofNotChecked: {
    id: "formatProofFollowUp",
    kind: "followUpChoice",
    label: "서류를 확인하기 어려운 이유가 무엇인가요?",
    options: ADMIN_FORMAT_PROOF_FOLLOWUP_NOT_CHECKED_OPTIONS,
    placeholder: "예: 원본·번역본이 없음, 어떤 증빙이 필요한지 모름 등",
  },
  formatProofUnsure: {
    id: "formatProofFollowUp",
    kind: "followUpChoice",
    label: "어떤 부분이 가장 확인하기 어려우신가요?",
    options: ADMIN_FORMAT_PROOF_FOLLOWUP_UNSURE_OPTIONS,
    placeholder: "예: 공증·인증 절차, 필요 서류 종류 등",
  },
  formatProofOther: {
    id: "formatProofFollowUp",
    kind: "followUpChoice",
    label: "직접 알려주세요.",
    options: ADMIN_FORMAT_PROOF_FOLLOWUP_OTHER_OPTIONS,
    placeholder: "형식·증빙과 관련해 추가로 확인할 내용을 입력해주세요.",
  },
  submissionAgency: {
    id: "submissionFollowUp",
    kind: "followUpChoice",
    label: "제출 방법 중 어떤 부분을 아직 확인하지 못하셨나요?",
    options: ADMIN_SUBMISSION_FOLLOWUP_AGENCY_OPTIONS,
    placeholder: "예: 온라인 접수 방법, 방문 창구, 필요 서류 등",
  },
  submissionNotChecked: {
    id: "submissionFollowUp",
    kind: "followUpChoice",
    label: "제출을 아직 확인하지 못한 이유가 무엇인가요?",
    options: ADMIN_SUBMISSION_FOLLOWUP_NOT_CHECKED_OPTIONS,
    placeholder: "예: 관할기관 미확정, 제출 절차 정보 부족 등",
  },
  submissionUnsure: {
    id: "submissionFollowUp",
    kind: "followUpChoice",
    label: "어떤 서류를 어디에 제출해야 하는지 안내가 필요한가요?",
    options: ADMIN_SUBMISSION_FOLLOWUP_UNSURE_OPTIONS,
    placeholder: "예: 제출 대상 서류, 관할기관, 접수 방법 등",
  },
  submissionOther: {
    id: "submissionFollowUp",
    kind: "followUpChoice",
    label: "추가로 확인할 내용을 입력해주세요.",
    options: ADMIN_SUBMISSION_FOLLOWUP_OTHER_OPTIONS,
    placeholder: "제출 경로와 관련해 직접 확인하고 싶은 부분을 적어주세요.",
  },
  deadlineUncertain: {
    id: "deadlineFollowUp",
    kind: "followUpChoice",
    label: "확인한 기한이나 유효기간 중 어떤 부분이 확실하지 않으신가요?",
    options: ADMIN_DEADLINE_FOLLOWUP_UNCERTAIN_OPTIONS,
    placeholder: "예: 제출 마감일, 서류 유효기간, 갱신 기한 등",
  },
  deadlineNotChecked: {
    id: "deadlineFollowUp",
    kind: "followUpChoice",
    label: "제출기한이나 유효기간을 아직 확인하지 못한 이유가 무엇인가요?",
    options: ADMIN_DEADLINE_FOLLOWUP_NOT_CHECKED_OPTIONS,
    placeholder: "예: 안내 문서 없음, 기한 표기 불명확 등",
  },
  deadlineUnsure: {
    id: "deadlineFollowUp",
    kind: "followUpChoice",
    label: "기한이나 유효기간 확인이 필요한 상황인가요?",
    options: ADMIN_DEADLINE_FOLLOWUP_UNSURE_OPTIONS,
    placeholder: "예: 제출 예정 서류, 갱신·연장 필요 여부 등",
  },
  deadlineOther: {
    id: "deadlineFollowUp",
    kind: "followUpChoice",
    label: "직접 알려주세요.",
    options: ADMIN_DEADLINE_FOLLOWUP_OTHER_OPTIONS,
    placeholder: "기한·유효기간과 관련해 추가로 확인할 내용을 입력해주세요.",
  },
};

const ADMIN_FOLLOW_UP_IDS = new Set([
  "docsFollowUp",
  "contentCheckFollowUp",
  "formatProofFollowUp",
  "submissionFollowUp",
  "deadlineFollowUp",
]);

const ADMIN_DOCS_MATCH_OPTIONS: { value: string; title: string }[] = [
  { value: "yes", title: "네, 실제 상황과 일치합니다" },
  { value: "no", title: "실제 상황과 다른 부분이 있습니다" },
  { value: "unknown", title: "잘 모르겠습니다" },
  ADMIN_OTHER_OPTION,
];

const ADMIN_CONTENT_CHECK_OPTIONS: { value: string; title: string }[] = [
  { value: "ok", title: "확인했고, 문제 없습니다" },
  { value: "has_issue", title: "빠지거나 잘못된 부분이 있습니다" },
  { value: "not_checked", title: "아직 확인하지 못했습니다" },
  { value: "unsure", title: "무엇을 확인해야 하는지 모르겠습니다" },
  ADMIN_OTHER_OPTION,
];

const ADMIN_FORMAT_PROOF_OPTIONS: { value: string; title: string }[] = [
  { value: "complete", title: "필요한 부분까지 확인했습니다" },
  { value: "partial", title: "일부만 확인했습니다" },
  { value: "not_checked", title: "아직 확인하지 못했습니다" },
  { value: "unsure", title: "무엇이 필요한지 모르겠습니다" },
  ADMIN_OTHER_OPTION,
];

const ADMIN_SUBMISSION_CHECK_OPTIONS: { value: string; title: string }[] = [
  { value: "complete", title: "제출기관과 방법까지 확인했습니다" },
  { value: "agency_only", title: "제출기관만 확인했습니다" },
  { value: "not_checked", title: "아직 확인하지 못했습니다" },
  { value: "unsure", title: "어디에 제출해야 하는지 모르겠습니다" },
  ADMIN_OTHER_OPTION,
];

const ADMIN_DEADLINE_CHECK_OPTIONS: { value: string; title: string }[] = [
  { value: "confirmed", title: "확인했습니다" },
  { value: "uncertain", title: "확인했지만 확실하지 않습니다" },
  { value: "not_checked", title: "아직 확인하지 못했습니다" },
  { value: "unsure", title: "기한이나 유효기간이 있는지 모르겠습니다" },
  ADMIN_OTHER_OPTION,
];

type ReviewQuestion =
  | {
      id: string;
      kind: "amount";
      label: string;
      placeholder: string;
    }
  | {
      id: string;
      kind: "yesno";
      label: string;
    }
  | {
      id: string;
      kind: "choice";
      label: string;
      options: { value: string; label: string }[];
    }
  | {
      id: string;
      kind: "text";
      label: string;
      placeholder: string;
    }
  | {
      id: string;
      kind: "followUpChoice";
      label: string;
      options: { value: string; title: string }[];
      placeholder: string;
    };

export type ReviewAnswers = Record<string, string>;

function profileQuestionToReview(question: ProfileQuestion): ReviewQuestion {
  return question as ReviewQuestion;
}

function clearAdminProfileDependentAnswers(next: ReviewAnswers): ReviewAnswers {
  const cleared = { ...next };
  const keysToClear = [
    "situationNote",
    "profileCheckGoal",
    "profileHasDocument",
    "profileDocumentType",
    "profileDocumentSource",
    "profileReceivedReason",
    "profileProcessStage",
    "profileActionsTaken",
    "profileCurrentGoal",
    "profileProblemType",
    "profileProblemDiscovery",
    "profileAuthorityGuidance",
    "profilePerceivedIssue",
    "docs",
    "docsFollowUp",
    "contentCheck",
    "contentCheckFollowUp",
    "formatProofCheck",
    "formatProofFollowUp",
    "submissionCheck",
    "submissionFollowUp",
    "deadline",
    "deadlineFollowUp",
    "stage",
    "_asked_docs",
    "_asked_contentCheck",
    "_asked_formatProofCheck",
    "_asked_submissionCheck",
    "_asked_deadline",
    "_caseResolutionProfileJson",
    "_caseNextFocus",
    "_case01Active",
    "_case02Active",
    "_case03Active",
    "_case04Active",
    "_case05Active",
    "_case06Active",
    "_inferredFields",
    ...CASE01_ANSWER_KEYS,
    ...CASE02_ANSWER_KEYS,
    ...CASE03_ANSWER_KEYS,
    ...CASE04_ANSWER_KEYS,
    ...CASE05_ANSWER_KEYS,
    ...CASE06_ANSWER_KEYS,
  ];
  for (const key of keysToClear) delete cleared[key];
  return attachCaseResolutionSnapshot(cleared);
}

/** Screen 01 → Page2 Case Resolution meta (no DB schema change) */
export function buildAdminCaseResolutionMeta(
  answers: ReviewAnswers,
): Record<string, string> {
  return buildCaseResolutionMetaFromAnswers(answers);
}

export function restoreAdminCaseResolutionProfile(
  meta: Record<string, unknown>,
): CaseResolutionProfile | null {
  return deserializeCaseResolutionProfile(meta);
}

export function applyAdminCaseCustomerInput(
  answers: ReviewAnswers,
  customerInput: string,
): ReviewAnswers {
  return mergeCustomerCaseInput(answers, customerInput);
}

export type ReviewPage1Answers = {
  stage?: string;
  docs?: string;
  translation?: string;
  deadline?: string;
  contentCheck?: string;
  contentCheckFollowUp?: string;
  docsFollowUp?: string;
  formatProofCheck?: string;
  formatProofFollowUp?: string;
  submissionCheck?: string;
  submissionFollowUp?: string;
  deadlineFollowUp?: string;
};

/** Page 1(직접 검토하기) stage → Page 2(내 상황 확인하기) review_stage */
export function mapReviewPage1StageToVerifyStage(
  stage: string
): "pre" | "post" | null {
  if (stage === "prevent") return "pre";
  if (stage === "case") return "post";
  return null;
}

export function buildReviewPage1Meta(
  page1: ReviewPage1Answers | null
): Record<string, string> {
  if (!page1) return {};
  const meta: Record<string, string> = {};
  if (page1.stage) meta.review_check_stage = page1.stage;
  if (page1.docs) meta.review_check_docs = page1.docs;
  if (page1.translation) meta.review_check_translation = page1.translation;
  if (page1.deadline) meta.review_check_deadline = page1.deadline;
  if (page1.deadlineFollowUp) meta.review_check_deadline_followup = page1.deadlineFollowUp;
  if (page1.contentCheck) meta.review_check_content = page1.contentCheck;
  if (page1.contentCheckFollowUp) meta.review_check_content_followup = page1.contentCheckFollowUp;
  if (page1.docsFollowUp) meta.review_check_docs_followup = page1.docsFollowUp;
  if (page1.formatProofCheck) meta.review_check_format_proof = page1.formatProofCheck;
  if (page1.formatProofFollowUp) meta.review_check_format_proof_followup = page1.formatProofFollowUp;
  if (page1.submissionCheck) meta.review_check_submission = page1.submissionCheck;
  if (page1.submissionFollowUp) meta.review_check_submission_followup = page1.submissionFollowUp;
  return meta;
}

/** Merges legacy Page1 meta with Case Resolution V1 snapshot */
export function buildAdminVerifyPageMeta(
  page1: ReviewPage1Answers | null,
  fullAnswers?: ReviewAnswers | null,
): Record<string, string> {
  const meta: Record<string, string> = {
    ...buildReviewPage1Meta(page1),
  };
  if (fullAnswers && Object.keys(fullAnswers).length > 0) {
    Object.assign(meta, buildAdminCaseResolutionMeta(fullAnswers));
    Object.assign(meta, buildAdminVerifyAnswersPersistMeta(fullAnswers));
    if (fullAnswers.situation) meta.review_situation = fullAnswers.situation;
    if (fullAnswers[CASE_CUSTOMER_INPUT_KEY]) {
      meta.case_customer_input = fullAnswers[CASE_CUSTOMER_INPUT_KEY];
    }
  }
  return meta;
}

export function restoreReviewPage1Answers(
  meta: Record<string, unknown>
): ReviewPage1Answers | null {
  const stage =
    typeof meta.review_check_stage === "string" ? meta.review_check_stage : undefined;
  const docs = typeof meta.review_check_docs === "string" ? meta.review_check_docs : undefined;
  const translation =
    typeof meta.review_check_translation === "string" ? meta.review_check_translation : undefined;
  const deadline =
    typeof meta.review_check_deadline === "string" ? meta.review_check_deadline : undefined;
  const contentCheck =
    typeof meta.review_check_content === "string" ? meta.review_check_content : undefined;
  const contentCheckFollowUp =
    typeof meta.review_check_content_followup === "string"
      ? meta.review_check_content_followup
      : undefined;
  const docsFollowUp =
    typeof meta.review_check_docs_followup === "string" ? meta.review_check_docs_followup : undefined;
  const formatProofCheck =
    typeof meta.review_check_format_proof === "string" ? meta.review_check_format_proof : undefined;
  const formatProofFollowUp =
    typeof meta.review_check_format_proof_followup === "string"
      ? meta.review_check_format_proof_followup
      : undefined;
  const submissionCheck =
    typeof meta.review_check_submission === "string" ? meta.review_check_submission : undefined;
  const submissionFollowUp =
    typeof meta.review_check_submission_followup === "string"
      ? meta.review_check_submission_followup
      : undefined;
  const deadlineFollowUp =
    typeof meta.review_check_deadline_followup === "string"
      ? meta.review_check_deadline_followup
      : undefined;
  if (
    !stage &&
    !docs &&
    !translation &&
    !deadline &&
    !contentCheck &&
    !contentCheckFollowUp &&
    !docsFollowUp &&
    !formatProofCheck &&
    !formatProofFollowUp &&
    !submissionCheck &&
    !submissionFollowUp &&
    !deadlineFollowUp
  ) {
    return null;
  }
  return {
    stage,
    docs,
    translation,
    deadline,
    contentCheck,
    contentCheckFollowUp,
    docsFollowUp,
    formatProofCheck,
    formatProofFollowUp,
    submissionCheck,
    submissionFollowUp,
    deadlineFollowUp,
  };
}

type ReviewResult = {
  quotedAmount: number | null;
  verdict: ReviewVerdict;
  title: string;
  summary: string;
  detail: string;
  fairReference: number;
  bubblePercent: number | null;
};

function excessGrade(verdict: ReviewVerdict): { label: string; filled: number; tone: string } {
  if (verdict === "fair") return { label: "낮음", filled: 1, tone: "bg-emerald-500" };
  if (verdict === "caution") return { label: "주의", filled: 3, tone: "bg-amber-500" };
  if (verdict === "very_low") return { label: "확인 필요", filled: 2, tone: "bg-slate-500" };
  return { label: "높음", filled: 4, tone: "bg-red-500" };
}

function analysisHeadline(verdict: ReviewVerdict): string {
  if (verdict === "fair") return "참고 범위와 비슷한 수준입니다.";
  if (verdict === "very_low") return "포함 항목을 확인해 보세요.";
  return "재검토를 권장합니다.";
}

function SectionTitle({
  id,
  number,
  title,
  emphasized = false,
}: {
  id: string;
  number: string;
  title: string;
  emphasized?: boolean;
}) {
  return (
    <h3
      id={id}
      className={`mb-2 flex items-baseline gap-1 border-b border-[#E5E7EB] pb-1.5 text-[14px] sm:mb-1 sm:gap-1.5 sm:pb-1 sm:text-[13.5px] sm:font-semibold sm:leading-relaxed sm:tracking-normal sm:text-[#0B2A6B] ${
        emphasized
          ? "font-medium leading-snug tracking-tight text-[#334155]"
          : "font-medium leading-[1.45] text-[#64748B]"
      }`}
    >
      <span
        className={`tabular-nums sm:font-medium sm:text-[#64748B] ${
          emphasized ? "font-medium text-[#64748B]" : "font-normal text-[#94A3B8]"
        }`}
      >
        {number}.
      </span>
      <span className="min-w-0 break-keep">{title}</span>
    </h3>
  );
}

function shortenNote(text: string, max = 42): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function buildReviewQuestions(service: CostCheckService, hasMarket: boolean): ReviewQuestion[] {
  if (hasMarket) {
    return [
      {
        id: "amount",
        kind: "amount",
        label: `받은 견적 금액 (${service.currency})`,
        placeholder:
          service.currency === "VND"
            ? "예: 8,000,000"
            : `예: ${service.marketUsualFeeAmount || "3,500"}`,
      },
      { id: "prep", kind: "yesno", label: "서류·번역 포함 여부" },
      { id: "officialSplit", kind: "yesno", label: "공식 수수료 구분 여부" },
      { id: "scope", kind: "yesno", label: "대행 범위 명시 여부" },
    ];
  }

  return [
    {
      id: "stage",
      kind: "choice",
      label: "검토 유형",
      options: [
        { value: "prevent", label: "사전 검토" },
        { value: "case", label: "사후 검토" },
      ],
    },
    { id: "docs", kind: "yesno", label: "관련 서류 확보 여부" },
    { id: "translation", kind: "yesno", label: "번역·공증 필요 여부" },
    { id: "deadline", kind: "yesno", label: "제출·대응 기한 여부" },
  ];
}

function buildAdminVerifyQuestions(
  docsAnswer?: string,
  contentCheckAnswer?: string,
  formatProofAnswer?: string,
  submissionAnswer?: string,
  deadlineAnswer?: string,
): ReviewQuestion[] {
  const questions: ReviewQuestion[] = [
    {
      id: "stage",
      kind: "choice",
      label: "검토 유형",
      options: [
        { value: "prevent", label: "사전 검토" },
        { value: "case", label: "사후 검토" },
      ],
    },
    { id: "docs", kind: "yesno", label: "관련 서류 확보 여부" },
  ];

  if (docsAnswer === "no") {
    questions.push({
      id: "docsFollowUp",
      kind: "followUpChoice",
      label: "어떤 부분이 실제 상황과 다른가요?",
      options: ADMIN_DOCS_FOLLOWUP_MISMATCH_OPTIONS,
      placeholder: "예: 주소, 날짜, 이름 등 실제와 다른 항목을 적어주세요.",
    });
  } else if (docsAnswer === "unknown") {
    questions.push({
      id: "docsFollowUp",
      kind: "followUpChoice",
      label: "어떤 부분을 아직 확인하지 못하셨나요?",
      options: ADMIN_DOCS_FOLLOWUP_UNKNOWN_OPTIONS,
      placeholder: "예: 번역본과 원본 대조, 공증 여부 등 확인이 필요한 부분을 적어주세요.",
    });
  } else if (docsAnswer === "other") {
    questions.push({
      id: "docsFollowUp",
      kind: "followUpChoice",
      label: "직접 알려주세요.",
      options: ADMIN_DOCS_FOLLOWUP_OTHER_OPTIONS,
      placeholder: "실제 상황과 관련해 추가로 확인할 내용을 입력해주세요.",
    });
  }

  questions.push({ id: "contentCheck", kind: "yesno", label: "내용 누락·오류 확인" });

  if (contentCheckAnswer === "other") {
    questions.push({
      id: "contentCheckFollowUp",
      kind: "followUpChoice",
      label: "추가로 확인할 내용을 입력해주세요.",
      options: ADMIN_CONTENT_CHECK_FOLLOWUP_OPTIONS,
      placeholder: "서류 내용과 관련해 직접 확인하고 싶은 부분을 적어주세요.",
    });
  }
  questions.push({ id: "formatProofCheck", kind: "yesno", label: "형식·증빙 확인" });

  if (formatProofAnswer === "partial") {
    questions.push({
      id: "formatProofFollowUp",
      kind: "followUpChoice",
      label: "어떤 부분을 아직 확인하지 못하셨나요?",
      options: ADMIN_FORMAT_PROOF_FOLLOWUP_PARTIAL_OPTIONS,
      placeholder: "예: 공증 여부, 번역본 대조, 서명·날짜 등",
    });
  } else if (formatProofAnswer === "not_checked") {
    questions.push({
      id: "formatProofFollowUp",
      kind: "followUpChoice",
      label: "서류를 확인하기 어려운 이유가 무엇인가요?",
      options: ADMIN_FORMAT_PROOF_FOLLOWUP_NOT_CHECKED_OPTIONS,
      placeholder: "예: 원본·번역본이 없음, 어떤 증빙이 필요한지 모름 등",
    });
  } else if (formatProofAnswer === "unsure") {
    questions.push({
      id: "formatProofFollowUp",
      kind: "followUpChoice",
      label: "어떤 부분이 가장 확인하기 어려우신가요?",
      options: ADMIN_FORMAT_PROOF_FOLLOWUP_UNSURE_OPTIONS,
      placeholder: "예: 공증·인증 절차, 필요 서류 종류 등",
    });
  } else if (formatProofAnswer === "other") {
    questions.push({
      id: "formatProofFollowUp",
      kind: "followUpChoice",
      label: "직접 알려주세요.",
      options: ADMIN_FORMAT_PROOF_FOLLOWUP_OTHER_OPTIONS,
      placeholder: "형식·증빙과 관련해 추가로 확인할 내용을 입력해주세요.",
    });
  }

  questions.push({ id: "submissionCheck", kind: "yesno", label: "제출 경로 확인" });

  if (submissionAnswer === "agency_only") {
    questions.push({
      id: "submissionFollowUp",
      kind: "followUpChoice",
      label: "제출 방법 중 어떤 부분을 아직 확인하지 못하셨나요?",
      options: ADMIN_SUBMISSION_FOLLOWUP_AGENCY_OPTIONS,
      placeholder: "예: 온라인 접수 방법, 방문 창구, 필요 서류 등",
    });
  } else if (submissionAnswer === "not_checked") {
    questions.push({
      id: "submissionFollowUp",
      kind: "followUpChoice",
      label: "제출을 아직 확인하지 못한 이유가 무엇인가요?",
      options: ADMIN_SUBMISSION_FOLLOWUP_NOT_CHECKED_OPTIONS,
      placeholder: "예: 관할기관 미확정, 제출 절차 정보 부족 등",
    });
  } else if (submissionAnswer === "unsure") {
    questions.push({
      id: "submissionFollowUp",
      kind: "followUpChoice",
      label: "어떤 서류를 어디에 제출해야 하는지 안내가 필요한가요?",
      options: ADMIN_SUBMISSION_FOLLOWUP_UNSURE_OPTIONS,
      placeholder: "예: 제출 대상 서류, 관할기관, 접수 방법 등",
    });
  } else if (submissionAnswer === "other") {
    questions.push({
      id: "submissionFollowUp",
      kind: "followUpChoice",
      label: "추가로 확인할 내용을 입력해주세요.",
      options: ADMIN_SUBMISSION_FOLLOWUP_OTHER_OPTIONS,
      placeholder: "제출 경로와 관련해 직접 확인하고 싶은 부분을 적어주세요.",
    });
  }

  questions.push({ id: "deadline", kind: "yesno", label: "제출기한·유효기간 확인" });

  if (deadlineAnswer === "uncertain") {
    questions.push({
      id: "deadlineFollowUp",
      kind: "followUpChoice",
      label: "확인한 기한이나 유효기간 중 어떤 부분이 확실하지 않으신가요?",
      options: ADMIN_DEADLINE_FOLLOWUP_UNCERTAIN_OPTIONS,
      placeholder: "예: 제출 마감일, 서류 유효기간, 갱신 기한 등",
    });
  } else if (deadlineAnswer === "not_checked") {
    questions.push({
      id: "deadlineFollowUp",
      kind: "followUpChoice",
      label: "제출기한이나 유효기간을 아직 확인하지 못한 이유가 무엇인가요?",
      options: ADMIN_DEADLINE_FOLLOWUP_NOT_CHECKED_OPTIONS,
      placeholder: "예: 안내 문서 없음, 기한 표기 불명확 등",
    });
  } else if (deadlineAnswer === "unsure") {
    questions.push({
      id: "deadlineFollowUp",
      kind: "followUpChoice",
      label: "기한이나 유효기간 확인이 필요한 상황인가요?",
      options: ADMIN_DEADLINE_FOLLOWUP_UNSURE_OPTIONS,
      placeholder: "예: 제출 예정 서류, 갱신·연장 필요 여부 등",
    });
  } else if (deadlineAnswer === "other") {
    questions.push({
      id: "deadlineFollowUp",
      kind: "followUpChoice",
      label: "직접 알려주세요.",
      options: ADMIN_DEADLINE_FOLLOWUP_OTHER_OPTIONS,
      placeholder: "기한·유효기간과 관련해 추가로 확인할 내용을 입력해주세요.",
    });
  }

  return questions;
}

function isQuestionAnswered(question: ReviewQuestion, answers: ReviewAnswers): boolean {
  if (question.id === ADMIN_CASE_ENTRY_Q1_KEY) {
    return isAdminCaseEntryQ1Complete(answers);
  }
  if (question.kind === "choice" && question.id.startsWith("re2_")) {
    const value = answers[question.id]?.trim() ?? "";
    if (value) return true;
    const detailKey = RE2_PHASE2_DIRECT_EXPLAIN_CHOICE_TO_DETAIL[question.id];
    if (detailKey && (answers[detailKey]?.trim().length ?? 0) >= 20) return true;
    return false;
  }
  if (question.kind === "choice" && question.id.startsWith("re_")) {
    const value = answers[question.id]?.trim() ?? "";
    if (value) return true;
    const detailKey = RE_PHASE1_DIRECT_EXPLAIN_CHOICE_TO_DETAIL[question.id];
    if (detailKey && (answers[detailKey]?.trim().length ?? 0) >= 20) return true;
    return false;
  }
  if (question.kind === "choice" && question.options.length > 0) {
    return isAdminVerifyChoiceFieldComplete(question.id, answers, question.options);
  }
  const value = answers[question.id]?.trim() ?? "";
  if (question.kind === "amount") {
    const amount = Number(value.replace(/,/g, "").replace(/\$/g, ""));
    return Number.isFinite(amount) && amount > 0;
  }
  if (question.kind === "followUpChoice") {
    return value.length > 0 && value !== "other";
  }
  if (question.id.startsWith("re2_") && question.kind === "text") {
    return wasFieldAsked(answers, question.id) && value.length >= 20;
  }
  if (question.id.startsWith("re_") && question.kind === "text") {
    return wasFieldAsked(answers, question.id) && value.length >= 20;
  }
  return value.length > 0;
}

function formatAnswerLabel(question: ReviewQuestion, value: string): string {
  if (question.kind === "choice") {
    return question.options.find((opt) => opt.value === value)?.label ?? value;
  }
  if (question.kind === "followUpChoice") {
    return question.options.find((opt) => opt.value === value)?.title ?? value;
  }
  if (question.kind === "yesno") {
    return value === "yes" ? "예" : value === "no" ? "아니오" : value;
  }
  return value;
}

/** 축약 행 — 선택 카드 제목과 동일하게 표시(값·판정 로직은 변경 없음) */
function formatCollapsedAnswerLabel(
  question: ReviewQuestion,
  value: string,
  answers: ReviewAnswers,
): string {
  if (question.kind === "choice" && question.id === ADMIN_CASE_ENTRY_Q1_KEY) {
    const entry = value;
    if (entry === "other") {
      const note = answers[ADMIN_CASE_ENTRY_Q1_OTHER_KEY]?.trim() ?? "";
      return note.length > 48 ? `${note.slice(0, 45)}…` : note || ADMIN_DIRECT_EXPLAIN_LABEL;
    }
    return ADMIN_CASE_ENTRY_Q1_OPTION_LABELS[entry] ?? formatAnswerLabel(question, value);
  }
  if (question.kind === "choice" && question.id === "situation") {
    return (
      ADMIN_SITUATION_CARD_OPTIONS.find((opt) => opt.value === value)?.title ??
      ADMIN_SITUATION_OPTIONS.find((opt) => opt.value === value)?.label ??
      formatAnswerLabel(question, value)
    );
  }
  if (question.kind === "choice" && question.id.startsWith("case01_")) {
    if (question.id === "case01_violationContent" && value === "other") {
      const note = answers[CASE01_VIOLATION_CONTENT_NOTE_KEY]?.trim() ?? "";
      return note.length > 48 ? `${note.slice(0, 45)}…` : note || ADMIN_DIRECT_EXPLAIN_LABEL;
    }
    if (question.id === "case01_customerResponded" && value === "other") {
      const note = answers[CASE01_CUSTOMER_RESPONDED_NOTE_KEY]?.trim() ?? "";
      return note.length > 48 ? `${note.slice(0, 45)}…` : note || ADMIN_DIRECT_EXPLAIN_LABEL;
    }
    const optionLabel = formatAnswerLabel(question, value);
    const base =
      optionLabel !== value ? optionLabel : CASE01_OPTION_LABELS[value] ?? value;
    if (
      question.id === "case01_factRelationship" &&
      (value === "other" || value === "partial" || value === "partial_situation")
    ) {
      const note = answers[CASE01_FACT_RELATIONSHIP_NOTE_KEY]?.trim() ?? "";
      if (value === "other" && note) {
        return note.length > 48 ? `${note.slice(0, 45)}…` : note;
      }
      if (!note) return base;
      return note.length > 32 ? `${base} (${note.slice(0, 29)}…)` : `${base} (${note})`;
    }
    return base;
  }
  if (question.kind === "choice" && question.id.startsWith("case02_")) {
    if (value === "other") {
      const note = answers[getAdminChoiceNoteKey(question.id)]?.trim() ?? "";
      if (note) return note.length > 48 ? `${note.slice(0, 45)}…` : note;
    }
    if (question.id === "case02_authorityResponse") {
      return CASE01_OPTION_LABELS[value] ?? formatAnswerLabel(question, value);
    }
    const fromQuestion = formatAnswerLabel(question, value);
    if (fromQuestion !== value) return fromQuestion;
    return getCase02FieldOptionLabel(question.id, value);
  }
  if (question.kind === "choice" && question.id.startsWith("case03_")) {
    if (value === "other") {
      const note = answers[getAdminChoiceNoteKey(question.id)]?.trim() ?? "";
      return note.length > 48 ? `${note.slice(0, 45)}…` : note || ADMIN_DIRECT_EXPLAIN_LABEL;
    }
    const fromQuestion = formatAnswerLabel(question, value);
    if (fromQuestion !== value) return fromQuestion;
    return getCase03FieldOptionLabel(question.id, value);
  }
  if (question.kind === "choice" && question.id.startsWith("case04_")) {
    return getCase04FieldOptionLabel(question.id, value);
  }
  if (question.kind === "choice" && question.id.startsWith("case05_")) {
    if (value === "other") {
      const note = answers[getAdminChoiceNoteKey(question.id)]?.trim() ?? "";
      return note.length > 48 ? `${note.slice(0, 45)}…` : note || ADMIN_DIRECT_EXPLAIN_LABEL;
    }
    return getCase05FieldOptionLabel(question.id, value);
  }
  if (
    question.kind === "choice" &&
    (question.id.startsWith("case06_") ||
      question.id === "profileDocumentSource" ||
      question.id === "profileCurrentGoal" ||
      question.id === "profileAuthorityGuidance" ||
      question.id === "profilePerceivedIssue")
  ) {
    if (value === "other") {
      const note = answers[getAdminChoiceNoteKey(question.id)]?.trim() ?? "";
      return note.length > 48 ? `${note.slice(0, 45)}…` : note || ADMIN_DIRECT_EXPLAIN_LABEL;
    }
    return getCase06FieldOptionLabel(question.id, value);
  }
  if (question.kind === "choice" && question.id === "stage") {
    return (
      REVIEW_STAGE_CARD_OPTIONS.find((opt) => opt.value === value)?.title ??
      formatAnswerLabel(question, value)
    );
  }
  if (question.kind === "yesno" && question.id === "docs") {
    return (
      ADMIN_DOCS_MATCH_OPTIONS.find((opt) => opt.value === value)?.title ??
      formatAnswerLabel(question, value)
    );
  }
  if (question.id === "contentCheck") {
    return (
      ADMIN_CONTENT_CHECK_OPTIONS.find((opt) => opt.value === value)?.title ??
      formatAnswerLabel(question, value)
    );
  }
  if (question.kind === "followUpChoice") {
    const preset = question.options.find((opt) => opt.value === value);
    if (preset) return preset.title;
    return shortenNote(value, 48);
  }
  if (question.id === "formatProofCheck") {
    return (
      ADMIN_FORMAT_PROOF_OPTIONS.find((opt) => opt.value === value)?.title ??
      formatAnswerLabel(question, value)
    );
  }
  if (question.id === "submissionCheck") {
    return (
      ADMIN_SUBMISSION_CHECK_OPTIONS.find((opt) => opt.value === value)?.title ??
      formatAnswerLabel(question, value)
    );
  }
  if (question.id === "deadline") {
    const adminDeadlineLabel = ADMIN_DEADLINE_CHECK_OPTIONS.find((opt) => opt.value === value)?.title;
    if (adminDeadlineLabel) return adminDeadlineLabel;
  }
  if (question.kind === "choice" && question.id.startsWith("re2_")) {
    const detailKey = RE2_PHASE2_DIRECT_EXPLAIN_CHOICE_TO_DETAIL[question.id];
    if (detailKey) {
      const note = answers[detailKey]?.trim() ?? "";
      if (note && !value) {
        return note.length > 48 ? `${note.slice(0, 45)}…` : note || ADMIN_DIRECT_EXPLAIN_LABEL;
      }
    }
    const label = REAL_ESTATE_OPTION_LABELS[value] ?? formatAnswerLabel(question, value);
    if (detailKey) {
      const note = answers[detailKey]?.trim() ?? "";
      if (note) {
        return note.length > 32 ? `${label} (${note.slice(0, 29)}…)` : `${label} (${note})`;
      }
    }
    return label;
  }
  if (question.kind === "choice" && question.id.startsWith("re_")) {
    const detailKey = RE_PHASE1_DIRECT_EXPLAIN_CHOICE_TO_DETAIL[question.id];
    if (detailKey) {
      const note = answers[detailKey]?.trim() ?? "";
      if (note && !value) {
        return note.length > 48 ? `${note.slice(0, 45)}…` : note || ADMIN_DIRECT_EXPLAIN_LABEL;
      }
    }
    const label = REAL_ESTATE_OPTION_LABELS[value] ?? formatAnswerLabel(question, value);
    if (detailKey && answers[detailKey]?.trim()) {
      const note = answers[detailKey]?.trim() ?? "";
      return note.length > 48 ? `${note.slice(0, 45)}…` : note || ADMIN_DIRECT_EXPLAIN_LABEL;
    }
    return label;
  }
  return formatAnswerLabel(question, value);
}

function buildReviewResult(
  service: CostCheckService,
  config: MasterLandingConfig,
  answers: ReviewAnswers,
  hasMarket: boolean
): ReviewResult {
  if (hasMarket) {
    const amount = Number((answers.amount ?? "").replace(/,/g, "").replace(/\$/g, ""));
    if (Number.isFinite(amount) && amount > 0) {
      const quoteReview = evaluateCostQuoteReview(service, amount);
      let detail = quoteReview.detail;
      if (answers.prep === "no") {
        detail = `${detail} 서류·번역이 미포함이면 추가 비용이 생길 수 있습니다.`;
      }
      if (answers.officialSplit === "no") {
        detail = `${detail} 공식 수수료가 구분되지 않았다면 항목별 확인이 필요합니다.`;
      }
      return {
        quotedAmount: amount,
        ...quoteReview,
        detail,
      };
    }
  }

  const stage = answers.stage as ReviewStage | undefined;
  const isAdminVerify = service.id === "admin";
  const docsMissing = answers.docs === "no";
  const needsTranslation = !isAdminVerify && answers.translation === "yes";
  const hasDeadline = isAdminVerify
    ? answers.deadline != null &&
      answers.deadline !== "" &&
      answers.deadline !== "confirmed" &&
      answers.deadline !== "other"
    : answers.deadline === "yes";
  const contentCheckIssue =
    isAdminVerify &&
    answers.contentCheck != null &&
    answers.contentCheck !== "" &&
    answers.contentCheck !== "ok" &&
    answers.contentCheck !== "other";
  const formatProofIssue =
    isAdminVerify &&
    answers.formatProofCheck != null &&
    answers.formatProofCheck !== "" &&
    answers.formatProofCheck !== "complete" &&
    answers.formatProofCheck !== "other";
  const submissionIssue =
    isAdminVerify &&
    answers.submissionCheck != null &&
    answers.submissionCheck !== "" &&
    answers.submissionCheck !== "complete" &&
    answers.submissionCheck !== "other";
  let verdict: ReviewVerdict = "fair";
  if (docsMissing && stage === "case") verdict = "risk";
  else if (docsMissing || hasDeadline || contentCheckIssue || formatProofIssue || submissionIssue) {
    verdict = "caution";
  }

  const lead = config.reviewChecks[0];
  const title =
    verdict === "risk"
      ? "추가 확인이 필요합니다"
      : verdict === "caution"
        ? "주의 — 보완 확인 권장"
        : "1차 검토 기준 충족";
  const summary = lead
    ? shortenNote(lead.body, 72)
    : "입력한 내용을 기준으로 1차 검토 결과를 정리했습니다.";
  const detailParts = [
    stage === "prevent"
      ? "제출·계약 전에 요건과 누락을 먼저 확인하는 흐름입니다."
      : stage === "case"
        ? "이미 발생한 문제·통지에 맞춰 대응 방향을 점검하는 흐름입니다."
        : null,
    docsMissing ? "관련 서류가 아직 없으면 검토 범위가 제한될 수 있습니다." : null,
    answers.docsFollowUp?.trim()
      ? `추가 확인: ${shortenNote(answers.docsFollowUp.trim(), 80)}`
      : null,
    needsTranslation ? "번역·공증이 필요하면 일정과 비용을 함께 확인하세요." : null,
    contentCheckIssue
      ? "서류 내용 누락·오류 여부를 추가로 확인하는 것이 좋습니다."
      : null,
    answers.contentCheckFollowUp?.trim()
      ? `내용 확인(기타): ${shortenNote(answers.contentCheckFollowUp.trim(), 80)}`
      : null,
    answers.formatProofFollowUp?.trim()
      ? `형식·증빙 확인: ${shortenNote(answers.formatProofFollowUp.trim(), 80)}`
      : null,
    formatProofIssue
      ? "서류 형식·증빙(서명·날짜·번역·공증·인증 등)을 추가로 확인하는 것이 좋습니다."
      : null,
    answers.submissionFollowUp?.trim()
      ? `제출 경로 확인: ${shortenNote(answers.submissionFollowUp.trim(), 80)}`
      : null,
    submissionIssue
      ? "제출기관·제출 방법을 추가로 확인하는 것이 좋습니다."
      : null,
    answers.deadlineFollowUp?.trim()
      ? `기한·유효기간 확인: ${shortenNote(answers.deadlineFollowUp.trim(), 80)}`
      : null,
    hasDeadline ? "기한이 있으면 우선 확인할 항목부터 정리하는 것이 좋습니다." : null,
  ].filter(Boolean);

  return {
    quotedAmount: null,
    verdict,
    title,
    summary,
    detail: detailParts.join(" "),
    fairReference: 0,
    bubblePercent: null,
  };
}

function ReviewSidebar({
  service,
  config,
  quotedAmount,
  excessLabel,
  onContinue,
  continueEnabled,
}: {
  service: CostCheckService;
  config: MasterLandingConfig;
  quotedAmount: number | null;
  excessLabel: string | null;
  onContinue: () => void;
  continueEnabled?: boolean;
}) {
  const id = service.id;
  if (id === "trc") {
    return (
      <TrcSummarySidebar
        quotedAmount={quotedAmount}
        currency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (id === "wp") {
    return (
      <WpSummarySidebar
        quotedAmount={quotedAmount}
        currency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (id === "tamtru") {
    return (
      <TamtruSummarySidebar
        quotedAmount={quotedAmount}
        currency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (id === "driving-license") {
    return (
      <DrivingSummarySidebar
        quotedAmount={quotedAmount}
        currency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (id === "company") {
    return (
      <CompanySummarySidebar
        quotedAmount={quotedAmount}
        quoteCurrency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (id === "restaurant") {
    return (
      <RestaurantSummarySidebar
        quotedAmount={quotedAmount}
        quoteCurrency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }
  if (
    id === "admin" ||
    id === "real-estate" ||
    id === "fraud" ||
    id === "tax" ||
    id === "notary"
  ) {
    const verifyGlance =
      id === "admin"
        ? {
            procedureLabel: "행정문서",
            reviewTarget: "제출 서류·문서 내용",
            riskSummary: "누락·오류·대응 필요",
          }
        : id === "real-estate"
          ? {
              procedureLabel: "부동산 문서",
              reviewTarget: "계약·권리관계",
              riskSummary: "계약·권리·비용 문제",
            }
          : id === "fraud"
            ? {
                procedureLabel: "사기문서",
                reviewTarget: "상대방·거래·증거",
                riskSummary: "피해·증거·대응 문제",
              }
            : id === "tax"
              ? {
                  procedureLabel: "세무문서",
                  reviewTarget: "세금·신고·증빙",
                  riskSummary: "신고·납부·세무 문제",
                }
              : {
                  procedureLabel: "불확실한 문서",
                  reviewTarget: "문서·발행처·진위",
                  riskSummary: "진위·효력·대응 문제",
                };
    return (
      <AdminSummarySidebar
        excessLabel={excessLabel}
        onContinue={onContinue}
        continueEnabled={continueEnabled ?? false}
        procedureLabel={verifyGlance.procedureLabel}
        reviewTarget={verifyGlance.reviewTarget}
        riskSummary={verifyGlance.riskSummary}
        resultSummary="검토 결과 확인"
        officialLink={{
          name: "국가공공서비스포털",
          url: config.officialUrl,
          detail: config.officialNote,
        }}
      />
    );
  }
  if (
    id === "hygiene" ||
    id === "fire-safety" ||
    id === "environment" ||
    id === "cosmetics" ||
    id === "medical-device" ||
    id === "franchise"
  ) {
    return (
      <RegisterSummarySidebar
        serviceId={id}
        procedureLabel={config.serviceLabel}
        officialName={config.serviceLabel}
        officialUrl={config.officialUrl}
        officialDetail={config.officialNote}
        quotedAmount={quotedAmount}
        quoteCurrency={service.currency}
        excessLabel={excessLabel}
        onContinue={onContinue}
      />
    );
  }

  return null;
}

function serviceHasSummarySidebar(id: CostCheckServiceId): boolean {
  return true;
}

export type RealEstateVerifyMasterGateProps = {
  realEstateVerifySkipSignup?: boolean;
  /** 회원가입(lead capture) 완료 후 FREE ONE RESULT 표시 */
  realEstateVerifySignupComplete?: boolean;
  /** Profiling STOP + 증빙 완료 후 (회원가입 직전) — parent sticky terminal gate */
  realEstateVerifyPhase1EvidenceComplete?: boolean;
  /** Member handoff — submitAsMember in-flight (loading panel gate) */
  realEstateVerifyMemberSubmitting?: boolean;
  onRealEstateVerifyComplete?: (answers: ReviewAnswers, evidenceFile?: File | null) => void;
  /** Phase 2 + evidence 완료 시 Storage upload + CRM meta merge */
  onRealEstateVerifyPhase2EvidenceComplete?: (
    answers: ReviewAnswers,
    evidenceFile?: File | null,
  ) => void;
  /** Phase 2 progress → CRM meta merge persist (requires leadId on page) */
  onRealEstateVerifyMetaPersist?: (
    answers: ReviewAnswers,
    profilePhase: RealEstateVerifyProfilePhase,
  ) => void;
  realEstateVerifyLeadCaptureSlot?: ReactNode;
  onRealEstateVerifyAiReport?: () => void;
  onRealEstateVerifyExpert?: (answers: ReviewAnswers) => void;
  onRealEstateVerifyAiSummary?: () => void;
  realEstateVerifyAiSummaryNavigating?: boolean;
  realEstateVerifyAiReportRequesting?: boolean;
  realEstateVerifyExpertRequesting?: boolean;
  realEstateVerifyAiReportError?: string | null;
  realEstateVerifyExpertError?: string | null;
  onRealEstateVerifyDirect?: () => void;
};

export type AdminVerifyMasterGateProps = {
  /** 로그인 회원 — 회원가입 UI 생략 */
  adminVerifySkipSignup?: boolean;
  /** 회원가입(lead capture) 완료 후 1차 종합결과 표시 */
  adminVerifySignupComplete?: boolean;
  /** Parent latch — Phase1 evidence gate 완료 (restore 포함) */
  adminVerifyPhase1EvidenceComplete?: boolean;
  /** Member handoff — submitAsMember in-flight (loading panel gate) */
  adminVerifyMemberSubmitting?: boolean;
  /** Phase 1 profiling STOP + evidence 후 (회원가입 직전) */
  onAdminVerifyPhase1Complete?: (answers: ReviewAnswers, evidenceFile?: File | null) => void;
  /** Phase 2 진행 중 answers/meta debounced persist */
  onAdminVerifyMetaPersist?: (
    answers: ReviewAnswers,
    profilePhase: AdminVerifyProfilePhase,
  ) => void;
  /** Phase 2 + evidence 완료 시 CRM meta merge */
  onAdminVerifyPhase2Complete?: (answers: ReviewAnswers, evidenceFile?: File | null) => void;
  /** 2차 개인화 결과 CTA — 3차 문서 상세 검토 */
  onAdminVerifyPersonalizedContinue?: () => void;
  onAdminVerifyAiReport?: () => void;
  onAdminVerifyExpert?: (answers: ReviewAnswers) => void;
  onAdminVerifyAiSummary?: () => void;
  adminVerifyAiSummaryNavigating?: boolean;
  onAdminVerifyDirect?: () => void;
  adminVerifyAiReportRequesting?: boolean;
  adminVerifyExpertRequesting?: boolean;
  adminVerifyAiReportError?: string | null;
  adminVerifyExpertError?: string | null;
  /** Phase 1 STOP 후 표시할 회원가입 UI (VerifyAdminLeadCapture 등) */
  adminVerifyLeadCaptureSlot?: ReactNode;
};

export function MasterReviewQuotationReport({
  service,
  config,
  onContinue,
  onLearnMore,
  queryEntry,
  adminVerifySkipSignup = false,
  adminVerifySignupComplete = false,
  adminVerifyPhase1EvidenceComplete = false,
  adminVerifyMemberSubmitting = false,
  onAdminVerifyPhase1Complete,
  onAdminVerifyMetaPersist,
  onAdminVerifyPhase2Complete,
  onAdminVerifyPersonalizedContinue,
  onAdminVerifyAiReport,
  onAdminVerifyExpert,
  onAdminVerifyAiSummary,
  adminVerifyAiSummaryNavigating = false,
  onAdminVerifyDirect,
  adminVerifyAiReportRequesting = false,
  adminVerifyExpertRequesting = false,
  adminVerifyAiReportError = null,
  adminVerifyExpertError = null,
  adminVerifyLeadCaptureSlot,
  realEstateVerifySkipSignup = false,
  realEstateVerifySignupComplete = false,
  realEstateVerifyPhase1EvidenceComplete = false,
  realEstateVerifyMemberSubmitting = false,
  onRealEstateVerifyComplete,
  onRealEstateVerifyPhase2EvidenceComplete,
  onRealEstateVerifyMetaPersist,
  realEstateVerifyLeadCaptureSlot,
  onRealEstateVerifyAiReport,
  onRealEstateVerifyExpert,
  onRealEstateVerifyAiSummary,
  realEstateVerifyAiSummaryNavigating = false,
  realEstateVerifyAiReportRequesting = false,
  realEstateVerifyExpertRequesting = false,
  realEstateVerifyAiReportError = null,
  realEstateVerifyExpertError = null,
  onRealEstateVerifyDirect,
  verifyMasterSeedAnswers,
}: {
  service: CostCheckService;
  config: MasterLandingConfig;
  onContinue: (page1Answers?: ReviewAnswers) => void;
  /** VERIFY 행정문서 — 1차 결과 「자세히 보기」 */
  onLearnMore?: () => void;
  /** 확인 시작용 질문 입력 — CHECK Master UI와 동일 위치 */
  queryEntry?: ReactNode;
  verifyMasterSeedAnswers?: ReviewAnswers;
  adminVerifySkipSignup?: boolean;
  adminVerifySignupComplete?: boolean;
  adminVerifyPhase1EvidenceComplete?: boolean;
  adminVerifyMemberSubmitting?: boolean;
  onAdminVerifyPhase1Complete?: (answers: ReviewAnswers, evidenceFile?: File | null) => void;
  onAdminVerifyMetaPersist?: (
    answers: ReviewAnswers,
    profilePhase: AdminVerifyProfilePhase,
  ) => void;
  onAdminVerifyPhase2Complete?: (answers: ReviewAnswers, evidenceFile?: File | null) => void;
  onAdminVerifyPersonalizedContinue?: () => void;
  onAdminVerifyAiReport?: () => void;
  onAdminVerifyExpert?: (answers: ReviewAnswers) => void;
  onAdminVerifyAiSummary?: () => void;
  adminVerifyAiSummaryNavigating?: boolean;
  onAdminVerifyDirect?: () => void;
  adminVerifyAiReportRequesting?: boolean;
  adminVerifyExpertRequesting?: boolean;
  adminVerifyAiReportError?: string | null;
  adminVerifyExpertError?: string | null;
  adminVerifyLeadCaptureSlot?: ReactNode;
  realEstateVerifySkipSignup?: boolean;
  realEstateVerifySignupComplete?: boolean;
  realEstateVerifyPhase1EvidenceComplete?: boolean;
  realEstateVerifyMemberSubmitting?: boolean;
  onRealEstateVerifyComplete?: (answers: ReviewAnswers, evidenceFile?: File | null) => void;
  onRealEstateVerifyPhase2EvidenceComplete?: (
    answers: ReviewAnswers,
    evidenceFile?: File | null,
  ) => void;
  onRealEstateVerifyMetaPersist?: (
    answers: ReviewAnswers,
    profilePhase: RealEstateVerifyProfilePhase,
  ) => void;
  realEstateVerifyLeadCaptureSlot?: ReactNode;
  onRealEstateVerifyAiReport?: () => void;
  onRealEstateVerifyExpert?: (answers: ReviewAnswers) => void;
  onRealEstateVerifyAiSummary?: () => void;
  realEstateVerifyAiSummaryNavigating?: boolean;
  realEstateVerifyAiReportRequesting?: boolean;
  realEstateVerifyExpertRequesting?: boolean;
  realEstateVerifyAiReportError?: string | null;
  realEstateVerifyExpertError?: string | null;
  onRealEstateVerifyDirect?: () => void;
}) {
  const hasMarket =
    config.engine === "verify" ? false : hasMarketPriceData(service);
  const article = config.guideSlug ? getPublishedArticleBySlug(config.guideSlug) : null;

  const [answers, setAnswers] = useState<ReviewAnswers>({});
  const [section1Collapsed, setSection1Collapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [followUpOtherDraft, setFollowUpOtherDraft] = useState<Record<string, string>>({});
  const [caseEntryDirectExplainOpen, setCaseEntryDirectExplainOpen] = useState(false);
  const [caseEntryDirectExplainDraft, setCaseEntryDirectExplainDraft] = useState("");
  const [adminDirectExplainOpenId, setAdminDirectExplainOpenId] = useState<string | null>(null);
  const [re2DirectExplainOpenId, setRe2DirectExplainOpenId] = useState<string | null>(null);
  const [adminVerifyProfilePhase, setAdminVerifyProfilePhase] = useState<AdminVerifyProfilePhase>(1);
  const [adminVerifyPhase2EvidenceDone, setAdminVerifyPhase2EvidenceDone] = useState(false);
  const [adminVerifyPhase2EvidenceFile, setAdminVerifyPhase2EvidenceFile] = useState<File | null>(
    null,
  );
  const adminVerifyPhase2CompleteNotifiedRef = useRef(false);
  const adminVerifyPhase1CompleteNotifiedRef = useRef(false);
  const [adminPhase1EvidenceDone, setAdminPhase1EvidenceDone] = useState(false);
  const [adminPhase1EvidenceFile, setAdminPhase1EvidenceFile] = useState<File | null>(null);
  const [adminPhase1TerminalReached, setAdminPhase1TerminalReached] = useState(false);
  const adminMetaPersistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adminPhase2CompletePersistRef = useRef(false);
  const [realEstatePhase2EvidenceDone, setRealEstatePhase2EvidenceDone] = useState(false);
  const [realEstatePhase2EvidenceFile, setRealEstatePhase2EvidenceFile] = useState<File | null>(
    null,
  );
  const [realEstatePhase1EvidenceDone, setRealEstatePhase1EvidenceDone] = useState(false);
  const [realEstatePhase1EvidenceFile, setRealEstatePhase1EvidenceFile] = useState<File | null>(
    null,
  );
  /** Phase1 profiling STOP latched — evidence/signup must not regress to question screen. */
  const [realEstatePhase1TerminalReached, setRealEstatePhase1TerminalReached] = useState(false);
  const realEstateCompleteNotifiedRef = useRef(false);
  const realEstatePhase2EvidenceCompleteNotifiedRef = useRef(false);
  const verifyMasterSeedAppliedRef = useRef(false);
  const realEstateMetaPersistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realEstatePhase2CompletePersistRef = useRef(false);
  const [realEstateVerifyProfilePhase, setRealEstateVerifyProfilePhase] =
    useState<RealEstateVerifyProfilePhase>(1);

  useEffect(() => {
    if (service.id !== "admin" || config.engine !== "verify" || hasMarket) return;
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q")?.trim();
    if (!q) return;
    setAnswers((prev) => {
      if (prev[CASE_CUSTOMER_INPUT_KEY]?.trim()) return prev;
      return applyCustomerInputToAnswers(prev, q);
    });
  }, [service.id, config.engine, hasMarket]);

  useEffect(() => {
    if (service.id !== "real-estate" || config.engine !== "verify" || hasMarket) return;
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q")?.trim();
    if (!q) return;
    setAnswers((prev) => {
      if (prev.realEstateCustomerInput?.trim()) return prev;
      return applyRealEstateCustomerInputSeed(prev, q);
    });
  }, [service.id, config.engine, hasMarket]);

  useEffect(() => {
    if (!verifyMasterSeedAnswers || verifyMasterSeedAppliedRef.current) return;
    if (config.engine !== "verify" || hasMarket) return;

    if (service.id === "real-estate") {
      if (realEstateCompleteNotifiedRef.current) {
        verifyMasterSeedAppliedRef.current = true;
        return;
      }
      verifyMasterSeedAppliedRef.current = true;
      const isRestoredProfile =
        verifyMasterSeedAnswers._realEstateProfilingComplete === "1";
      if (isRestoredProfile) {
        setAnswers(attachRealEstateProfileSnapshot({ ...verifyMasterSeedAnswers }));
        setRealEstatePhase1TerminalReached(true);
        if (verifyMasterSeedAnswers[RE_PHASE1_EVIDENCE_FILE_NAME_KEY]?.trim()) {
          setRealEstatePhase1EvidenceDone(true);
        }
        if (verifyMasterSeedAnswers[REAL_ESTATE_RESTORED_PROFILE_PHASE_KEY] === "2") {
          setRealEstateVerifyProfilePhase(2);
          setRealEstatePhase2EvidenceDone(
            verifyMasterSeedAnswers._realEstateEvidenceAttached === "1",
          );
        }
        return;
      }
      setAnswers((prev) =>
        attachRealEstateProfileSnapshot(
          seedRealEstateAnswersFromExternal(prev, {
            customerInput: verifyMasterSeedAnswers.realEstateCustomerInput,
            page1Stage: verifyMasterSeedAnswers.stage,
            reviewStage:
              verifyMasterSeedAnswers._seedReviewStage === "pre" ||
              verifyMasterSeedAnswers._seedReviewStage === "post"
                ? verifyMasterSeedAnswers._seedReviewStage
                : null,
            incidentType: verifyMasterSeedAnswers._seedIncidentType,
            reviewFocus: verifyMasterSeedAnswers._seedReviewFocus,
          }),
        ),
      );
      return;
    }

    if (service.id === "admin") {
      verifyMasterSeedAppliedRef.current = true;
      if (verifyMasterSeedAnswers[ADMIN_PROFILING_COMPLETE_META_FLAG] === "1") {
        setAnswers(attachCaseResolutionSnapshot({ ...verifyMasterSeedAnswers }));
        if (verifyMasterSeedAnswers[ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY]?.trim()) {
          setAdminPhase1EvidenceDone(true);
        }
        if (verifyMasterSeedAnswers[ADMIN_RESTORED_PROFILE_PHASE_KEY] === "2") {
          setAdminVerifyProfilePhase(2);
          setAdminVerifyPhase2EvidenceDone(
            verifyMasterSeedAnswers[ADMIN_PHASE2_EVIDENCE_ATTACHED_ANSWERS_KEY] === "1",
          );
        }
      }
    }
  }, [verifyMasterSeedAnswers, service.id, config.engine, hasMarket]);

  const questions = useMemo(() => {
    const base = buildReviewQuestions(service, hasMarket);
    if (service.id === "admin" && !hasMarket) {
      return buildAdminVerifyProfileQuestions(
        answers,
        ADMIN_PROFILE_FOLLOW_UP_DEFS,
        {
          mismatch: ADMIN_DOCS_FOLLOWUP_MISMATCH_OPTIONS,
          unknown: ADMIN_DOCS_FOLLOWUP_UNKNOWN_OPTIONS,
          other: ADMIN_DOCS_FOLLOWUP_OTHER_OPTIONS,
        },
        adminVerifyProfilePhase,
      ).map(profileQuestionToReview);
    }
    if (service.id === "real-estate" && config.engine === "verify" && !hasMarket) {
      return buildRealEstateVerifyProfileQuestions(answers).map(profileQuestionToReview);
    }
    return base;
  }, [service, hasMarket, answers, adminVerifyProfilePhase, config.engine]);

  const isAdminVerifyStitchLayout =
    service.id === "admin" && config.engine === "verify" && !hasMarket;
  const isRealEstateVerifyMasterLayout =
    service.id === "real-estate" && config.engine === "verify" && !hasMarket;
  const isVerifyMasterStitchLayout =
    isAdminVerifyStitchLayout || isRealEstateVerifyMasterLayout;

  const adminVerifyPhase1Questions = useMemo(() => {
    if (!isAdminVerifyStitchLayout) return [];
    return buildAdminVerifyProfileQuestions(
      answers,
      ADMIN_PROFILE_FOLLOW_UP_DEFS,
      {
        mismatch: ADMIN_DOCS_FOLLOWUP_MISMATCH_OPTIONS,
        unknown: ADMIN_DOCS_FOLLOWUP_UNKNOWN_OPTIONS,
        other: ADMIN_DOCS_FOLLOWUP_OTHER_OPTIONS,
      },
      1,
    ).map(profileQuestionToReview);
  }, [answers, isAdminVerifyStitchLayout]);

  const adminVerifyPhase2OnlyQuestions = useMemo(() => {
    if (!isAdminVerifyStitchLayout) return [];
    const phase1Ids = new Set(adminVerifyPhase1Questions.map((question) => question.id));
    return questions.filter(
      (question) =>
        question.id !== ADMIN_CASE_ENTRY_Q1_KEY && !phase1Ids.has(question.id),
    );
  }, [adminVerifyPhase1Questions, isAdminVerifyStitchLayout, questions]);

  const realEstatePhase2Questions = useMemo(() => {
    if (!isRealEstateVerifyMasterLayout || realEstateVerifyProfilePhase !== 2) return [];
    return buildRealEstatePhase2ProfileQuestions(answers).map(profileQuestionToReview);
  }, [answers, isRealEstateVerifyMasterLayout, realEstateVerifyProfilePhase]);

  const realEstatePhase2IncompleteIndex = realEstatePhase2Questions.findIndex(
    (q) => !isQuestionAnswered(q, answers),
  );
  const realEstatePhase2QuestionsComplete =
    isRealEstateVerifyMasterLayout &&
    realEstateVerifyProfilePhase === 2 &&
    realEstatePhase2IncompleteIndex === -1;
  const isRealEstateAwaitingPhase2Evidence =
    isRealEstateVerifyMasterLayout &&
    realEstateVerifyProfilePhase === 2 &&
    realEstateVerifySignupComplete &&
    realEstatePhase2QuestionsComplete &&
    !realEstatePhase2EvidenceDone;
  const realEstatePhase2GateComplete =
    realEstatePhase2QuestionsComplete && realEstatePhase2EvidenceDone;
  const isRealEstatePersonalizedResult =
    isRealEstateVerifyMasterLayout &&
    realEstateVerifySignupComplete &&
    realEstateVerifyProfilePhase === 2 &&
    realEstatePhase2GateComplete;

  const firstIncompleteIndex = questions.findIndex((q) => !isQuestionAnswered(q, answers));
  const phase2OnlyIncompleteIndex = adminVerifyPhase2OnlyQuestions.findIndex(
    (q) => !isQuestionAnswered(q, answers),
  );
  const isAdminCase06AwaitingBridgeSnapshot =
    isAdminVerifyStitchLayout &&
    adminVerifyProfilePhase === 2 &&
    getQ1ResolvedCase(answers) === "CASE_06" &&
    isCase06AwaitingBridgeSnapshot(answers);
  const isAdminVerifyPhase2QuestionFlow =
    isAdminVerifyStitchLayout &&
    adminVerifyProfilePhase === 2 &&
    !isAdminCase06AwaitingBridgeSnapshot;
  const isRealEstatePhase2QuestionFlow =
    isRealEstateVerifyMasterLayout &&
    realEstateVerifyProfilePhase === 2 &&
    !realEstatePhase2QuestionsComplete;
  const verifyQuestionFlowQuestions = isAdminVerifyPhase2QuestionFlow
    ? adminVerifyPhase2OnlyQuestions
    : isRealEstateVerifyMasterLayout && realEstateVerifyProfilePhase === 2
      ? realEstatePhase2Questions
      : questions;
  const verifyQuestionFlowFirstIncompleteIndex = isAdminVerifyPhase2QuestionFlow
    ? phase2OnlyIncompleteIndex
    : isRealEstateVerifyMasterLayout && realEstateVerifyProfilePhase === 2
      ? realEstatePhase2IncompleteIndex
      : firstIncompleteIndex;
  const adminVerifyQuestionFlowQuestions = verifyQuestionFlowQuestions;
  const adminVerifyQuestionFlowFirstIncompleteIndex = verifyQuestionFlowFirstIncompleteIndex;
  const activeQuestionIndex =
    editingId != null
      ? adminVerifyQuestionFlowQuestions.findIndex((q) => q.id === editingId)
      : adminVerifyQuestionFlowFirstIncompleteIndex;
  const stitchProgress = useMemo(() => {
    if (isRealEstateVerifyMasterLayout && realEstateVerifyProfilePhase === 2) {
      const answeredCount = Object.keys(extractRealEstatePhase2Answers(answers)).length;
      const remaining = Math.max(realEstatePhase2Questions.length, 1);
      const total = Math.max(answeredCount + remaining, answeredCount + 1);
      const current =
        realEstatePhase2IncompleteIndex >= 0
          ? answeredCount + 1
          : Math.max(answeredCount, total);
      return { current, total };
    }
    if (isRealEstateVerifyMasterLayout) {
      const total = Math.max(questions.length, 1);
      const current = activeQuestionIndex >= 0 ? activeQuestionIndex + 1 : 1;
      return { current, total };
    }
    return getAdminVerifyStitchProgress(
      answers,
      adminVerifyQuestionFlowQuestions,
      activeQuestionIndex >= 0 ? activeQuestionIndex : 0,
      adminVerifyProfilePhase,
    );
  }, [
    answers,
    adminVerifyQuestionFlowQuestions,
    activeQuestionIndex,
    adminVerifyProfilePhase,
    isRealEstateVerifyMasterLayout,
    realEstateVerifyProfilePhase,
    realEstatePhase2Questions.length,
    realEstatePhase2IncompleteIndex,
    questions.length,
  ]);
  const activeStepNumber = Math.max(1, stitchProgress.current);
  const stitchProgressTotal = Math.max(1, stitchProgress.total);
  const classifiedQ1Case = getQ1ResolvedCase(answers);
  const isClassifiedAdminVerifyCase =
    classifiedQ1Case === "CASE_01" ||
    classifiedQ1Case === "CASE_02" ||
    classifiedQ1Case === "CASE_03" ||
    classifiedQ1Case === "CASE_04" ||
    classifiedQ1Case === "CASE_05" ||
    classifiedQ1Case === "CASE_06";
  const adminVerifyPhase1Complete =
    isAdminVerifyStitchLayout && isAdminVerifyPhase1Complete(answers);
  const adminVerifyPhase2QuestionsOnlyComplete =
    isAdminVerifyStitchLayout &&
    adminVerifyProfilePhase === 2 &&
    adminVerifySignupComplete &&
    isClassifiedAdminVerifyCase &&
    phase2OnlyIncompleteIndex === -1 &&
    isAdminVerifyPhase2PathComplete(answers);
  const isAdminVerifyAwaitingEvidence =
    isAdminVerifyStitchLayout &&
    adminVerifyProfilePhase === 2 &&
    adminVerifySignupComplete &&
    adminVerifyPhase2QuestionsOnlyComplete &&
    !adminVerifyPhase2EvidenceDone;
  const adminVerifyPhase2QuestionsComplete =
    adminVerifyPhase2QuestionsOnlyComplete && adminVerifyPhase2EvidenceDone;
  const adminPhase1EvidenceComplete =
    adminPhase1EvidenceDone || adminVerifyPhase1EvidenceComplete;
  const adminPhase1Stop =
    isAdminVerifyStitchLayout &&
    (adminVerifyPhase1Complete ||
      adminPhase1EvidenceComplete ||
      adminPhase1TerminalReached);
  const isAdminAwaitingPhase1Evidence =
    isAdminVerifyStitchLayout &&
    adminPhase1Stop &&
    !adminPhase1EvidenceComplete &&
    !adminVerifySignupComplete;
  const realEstateQuestionsComplete =
    isRealEstateVerifyMasterLayout && isRealEstateProfilingComplete(answers);
  const phase1EvidenceComplete =
    realEstatePhase1EvidenceDone || realEstateVerifyPhase1EvidenceComplete;
  const realEstatePhase1Stop =
    isRealEstateVerifyMasterLayout &&
    (realEstateQuestionsComplete ||
      phase1EvidenceComplete ||
      realEstatePhase1TerminalReached);
  const isRealEstateAwaitingPhase1Evidence =
    isRealEstateVerifyMasterLayout &&
    realEstateVerifyProfilePhase === 1 &&
    realEstatePhase1Stop &&
    !phase1EvidenceComplete &&
    !realEstateVerifySignupComplete;
  const isRealEstateAwaitingSignup =
    realEstatePhase1Stop &&
    phase1EvidenceComplete &&
    !realEstateVerifySkipSignup &&
    !realEstateVerifySignupComplete;
  /** 로그인 회원 — Phase1 STOP 후 submitAsMember 전환 중 generic quotation 숨김 */
  const isRealEstateMemberProfilingHandoff =
    isRealEstateVerifyMasterLayout &&
    realEstatePhase1Stop &&
    phase1EvidenceComplete &&
    realEstateVerifySkipSignup &&
    realEstateVerifyMemberSubmitting &&
    !realEstateVerifySignupComplete;
  /** Phase1 evidence/signup/result 전환 중 질문 UI 재노출 금지 (terminal sticky) */
  const isRealEstateQuestionScreenSuppressed =
    isRealEstateVerifyMasterLayout &&
    !realEstateVerifySignupComplete &&
    (realEstatePhase1Stop ||
      realEstatePhase1TerminalReached ||
      phase1EvidenceComplete ||
      isRealEstateMemberProfilingHandoff);
  const isRealEstateFirstResult =
    isRealEstateVerifyMasterLayout &&
    realEstatePhase1Stop &&
    realEstateVerifySignupComplete &&
    realEstateVerifyProfilePhase === 1;
  const isRealEstatePhase2Review =
    isRealEstateVerifyMasterLayout &&
    realEstateVerifyProfilePhase === 2 &&
    realEstatePhase1Stop &&
    realEstateVerifySignupComplete &&
    !isRealEstatePersonalizedResult &&
    !isRealEstateAwaitingPhase2Evidence;
  const isRealEstatePhase2Screen =
    isRealEstateVerifyMasterLayout &&
    isRealEstatePhase2Review &&
    isRealEstatePhase2QuestionFlow;

  const allAnswered =
    isAdminVerifyStitchLayout
      ? adminVerifyProfilePhase === 2
        ? adminVerifyPhase2QuestionsComplete
        : adminPhase1Stop && adminVerifySignupComplete
      : isRealEstateVerifyMasterLayout
        ? realEstateVerifyProfilePhase === 2
          ? realEstatePhase2GateComplete
          : realEstatePhase1Stop && realEstateVerifySignupComplete
        : firstIncompleteIndex === -1;
  const isAdminVerifyAwaitingSignup =
    adminPhase1Stop &&
    adminPhase1EvidenceComplete &&
    adminVerifyProfilePhase === 1 &&
    !adminVerifySkipSignup &&
    !adminVerifySignupComplete;
  /** 로그인 회원 — Phase1 STOP + evidence 후 submitAsMember in-flight 중에만 */
  const isAdminMemberProfilingHandoff =
    isAdminVerifyStitchLayout &&
    adminPhase1Stop &&
    adminPhase1EvidenceComplete &&
    adminVerifyProfilePhase === 1 &&
    adminVerifySkipSignup &&
    !adminVerifySignupComplete &&
    adminVerifyMemberSubmitting;
  const isAdminQuestionScreenSuppressed =
    isAdminVerifyStitchLayout &&
    !adminVerifySignupComplete &&
    (adminPhase1Stop ||
      adminPhase1TerminalReached ||
      adminPhase1EvidenceComplete ||
      isAdminMemberProfilingHandoff);

  useEffect(() => {
    if (!isAdminVerifyStitchLayout) return;
    if (!adminVerifyPhase1EvidenceComplete) return;
    setAdminPhase1EvidenceDone(true);
    setAdminPhase1TerminalReached(true);
    adminVerifyPhase1CompleteNotifiedRef.current = true;
  }, [isAdminVerifyStitchLayout, adminVerifyPhase1EvidenceComplete]);

  useEffect(() => {
    if (!isAdminVerifyStitchLayout) return;
    if (!adminVerifyPhase1Complete) return;
    setAdminPhase1TerminalReached(true);
  }, [isAdminVerifyStitchLayout, adminVerifyPhase1Complete]);

  useEffect(() => {
    if (!isAdminVerifyStitchLayout) return;
    if (adminVerifyPhase1CompleteNotifiedRef.current) return;
    if (adminVerifyPhase1EvidenceComplete) return;
    if (adminVerifyPhase1Complete) return;
    setAdminPhase1TerminalReached(false);
    setAdminPhase1EvidenceDone(false);
    setAdminPhase1EvidenceFile(null);
  }, [
    isAdminVerifyStitchLayout,
    adminVerifyPhase1Complete,
    adminVerifyPhase1EvidenceComplete,
  ]);

  useEffect(() => {
    if (!adminVerifyPhase2QuestionsComplete) {
      adminVerifyPhase2CompleteNotifiedRef.current = false;
      return;
    }
    if (!adminVerifySignupComplete && !adminVerifySkipSignup) return;
    if (adminVerifyPhase2CompleteNotifiedRef.current) return;
    adminVerifyPhase2CompleteNotifiedRef.current = true;
    onAdminVerifyPhase2Complete?.(answers, adminVerifyPhase2EvidenceFile);
  }, [
    adminVerifyPhase2QuestionsComplete,
    adminVerifySignupComplete,
    adminVerifySkipSignup,
    onAdminVerifyPhase2Complete,
    answers,
    adminVerifyPhase2EvidenceFile,
  ]);

  useEffect(() => {
    if (!isRealEstateVerifyMasterLayout) return;
    if (!realEstateVerifyPhase1EvidenceComplete) return;
    setRealEstatePhase1EvidenceDone(true);
    setRealEstatePhase1TerminalReached(true);
    realEstateCompleteNotifiedRef.current = true;
  }, [isRealEstateVerifyMasterLayout, realEstateVerifyPhase1EvidenceComplete]);

  useEffect(() => {
    if (!isRealEstateVerifyMasterLayout) return;
    if (!realEstateQuestionsComplete) return;
    setRealEstatePhase1TerminalReached(true);
  }, [isRealEstateVerifyMasterLayout, realEstateQuestionsComplete]);

  useEffect(() => {
    if (!isRealEstateVerifyMasterLayout) return;
    if (realEstateCompleteNotifiedRef.current) return;
    if (realEstateVerifyPhase1EvidenceComplete) return;
    if (realEstateQuestionsComplete) return;
    setRealEstatePhase1TerminalReached(false);
    setRealEstatePhase1EvidenceDone(false);
    setRealEstatePhase1EvidenceFile(null);
  }, [
    isRealEstateVerifyMasterLayout,
    realEstateQuestionsComplete,
    realEstateVerifyPhase1EvidenceComplete,
  ]);

  useEffect(() => {
    if (!realEstatePhase2GateComplete) {
      realEstatePhase2EvidenceCompleteNotifiedRef.current = false;
      return;
    }
    if (!realEstateVerifySignupComplete) return;
    if (!onRealEstateVerifyPhase2EvidenceComplete) return;
    if (realEstatePhase2EvidenceCompleteNotifiedRef.current) return;
    realEstatePhase2EvidenceCompleteNotifiedRef.current = true;
    onRealEstateVerifyPhase2EvidenceComplete?.(answers, realEstatePhase2EvidenceFile);
  }, [
    answers,
    onRealEstateVerifyPhase2EvidenceComplete,
    realEstatePhase2EvidenceFile,
    realEstatePhase2GateComplete,
    realEstateVerifySignupComplete,
  ]);

  useEffect(() => {
    if (!isRealEstateVerifyMasterLayout || !realEstateVerifySignupComplete) return;
    if (realEstateVerifyProfilePhase !== 2) return;
    if (!onRealEstateVerifyMetaPersist) return;

    if (realEstateMetaPersistTimerRef.current) {
      clearTimeout(realEstateMetaPersistTimerRef.current);
    }
    realEstateMetaPersistTimerRef.current = setTimeout(() => {
      onRealEstateVerifyMetaPersist(answers, 2);
    }, 800);

    return () => {
      if (realEstateMetaPersistTimerRef.current) {
        clearTimeout(realEstateMetaPersistTimerRef.current);
      }
    };
  }, [
    answers,
    isRealEstateVerifyMasterLayout,
    onRealEstateVerifyMetaPersist,
    realEstateVerifyProfilePhase,
    realEstateVerifySignupComplete,
  ]);

  useEffect(() => {
    if (!isRealEstateVerifyMasterLayout || !realEstateVerifySignupComplete) return;
    if (!realEstatePhase2GateComplete) {
      realEstatePhase2CompletePersistRef.current = false;
      return;
    }
    if (!onRealEstateVerifyMetaPersist) return;
    if (realEstatePhase2CompletePersistRef.current) return;
    realEstatePhase2CompletePersistRef.current = true;
    if (realEstateMetaPersistTimerRef.current) {
      clearTimeout(realEstateMetaPersistTimerRef.current);
      realEstateMetaPersistTimerRef.current = null;
    }
    onRealEstateVerifyMetaPersist(answers, 2);
  }, [
    answers,
    isRealEstateVerifyMasterLayout,
    onRealEstateVerifyMetaPersist,
    realEstatePhase2GateComplete,
    realEstateVerifySignupComplete,
  ]);

  useEffect(() => {
    if (!realEstatePhase2EvidenceFile) return;
    setAnswers((prev) =>
      attachRealEstateProfileSnapshot({
        ...prev,
        _realEstateEvidenceAttached: "1",
        _realEstateEvidenceFileName: realEstatePhase2EvidenceFile.name,
      }),
    );
  }, [realEstatePhase2EvidenceFile]);

  useEffect(() => {
    if (!isAdminVerifyStitchLayout || !adminVerifySignupComplete) return;
    if (adminVerifyProfilePhase !== 2) return;
    if (!onAdminVerifyMetaPersist) return;

    if (adminMetaPersistTimerRef.current) {
      clearTimeout(adminMetaPersistTimerRef.current);
    }
    adminMetaPersistTimerRef.current = setTimeout(() => {
      onAdminVerifyMetaPersist(answers, 2);
    }, 800);

    return () => {
      if (adminMetaPersistTimerRef.current) {
        clearTimeout(adminMetaPersistTimerRef.current);
      }
    };
  }, [
    answers,
    adminVerifyProfilePhase,
    adminVerifySignupComplete,
    isAdminVerifyStitchLayout,
    onAdminVerifyMetaPersist,
  ]);

  useEffect(() => {
    if (!isAdminVerifyStitchLayout || !adminVerifySignupComplete) return;
    if (!adminVerifyPhase2QuestionsComplete) {
      adminPhase2CompletePersistRef.current = false;
      return;
    }
    if (!onAdminVerifyMetaPersist) return;
    if (adminPhase2CompletePersistRef.current) return;
    adminPhase2CompletePersistRef.current = true;
    if (adminMetaPersistTimerRef.current) {
      clearTimeout(adminMetaPersistTimerRef.current);
      adminMetaPersistTimerRef.current = null;
    }
    onAdminVerifyMetaPersist(answers, 2);
  }, [
    answers,
    adminVerifyPhase2QuestionsComplete,
    adminVerifySignupComplete,
    isAdminVerifyStitchLayout,
    onAdminVerifyMetaPersist,
  ]);

  useEffect(() => {
    if (!adminVerifyPhase2EvidenceFile) return;
    setAnswers((prev) =>
      attachCaseResolutionSnapshot({
        ...prev,
        [ADMIN_PHASE2_EVIDENCE_ATTACHED_ANSWERS_KEY]: "1",
        [ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY]: adminVerifyPhase2EvidenceFile.name,
      }),
    );
  }, [adminVerifyPhase2EvidenceFile]);

  useEffect(() => {
    if (allAnswered && !isRealEstatePhase2QuestionFlow && !isAdminVerifyPhase2QuestionFlow) {
      setSection1Collapsed(true);
    }
  }, [allAnswered, isAdminVerifyPhase2QuestionFlow, isRealEstatePhase2QuestionFlow]);

  const review = useMemo(() => {
    if (!allAnswered) return null;
    return buildReviewResult(service, config, answers, hasMarket);
  }, [allAnswered, service, config, answers, hasMarket]);

  const hasSidebar = serviceHasSummarySidebar(service.id);
  const verifyDisplayName = config.shortServiceLabel || config.serviceLabel;
  const reportTitle =
    config.engine === "verify"
      ? `${verifyDisplayName} 리뷰 확인서`
      : hasMarket
        ? `${service.label} 비용 확인서`
        : `${service.label} 확인서`;
  const reportShortLabel =
    config.engine === "verify" ? verifyDisplayName : service.shortLabel;
  /** VERIFY: 4문항 완료 전에는 결과·전체 사이드바·공식 안내를 숨김 (CHECK/REGISTER 동작 유지) */
  const isCase01ActivePath =
    isAdminVerifyStitchLayout &&
    (getQ1ResolvedCase(answers) === "CASE_01" || Boolean(answers.case01_violationContent));
  const isAdminVerifyFirstResult =
    isAdminVerifyStitchLayout &&
    adminPhase1Stop &&
    adminVerifySignupComplete &&
    adminVerifyProfilePhase === 1 &&
    !adminVerifyPhase2QuestionsComplete &&
    !isAdminVerifyAwaitingSignup &&
    !isAdminAwaitingPhase1Evidence &&
    !isAdminVerifyAwaitingEvidence &&
    !isAdminMemberProfilingHandoff;
  const isAdminVerifyPersonalizedResult =
    isAdminVerifyStitchLayout &&
    isClassifiedAdminVerifyCase &&
    adminVerifyProfilePhase === 2 &&
    adminVerifyPhase2QuestionsComplete &&
    adminVerifySignupComplete;
  const isAdminVerifyPhase2Review =
    isAdminVerifyStitchLayout &&
    adminVerifyProfilePhase === 2 &&
    adminPhase1Stop &&
    adminVerifySignupComplete &&
    !isAdminVerifyFirstResult &&
    !isAdminVerifyAwaitingSignup &&
    !isAdminAwaitingPhase1Evidence &&
    !isAdminVerifyAwaitingEvidence &&
    !isAdminVerifyPersonalizedResult;
  const adminVerifyUseStitchCards = isVerifyMasterStitchLayout;
  const hideGenericQuotationResult =
    isAdminVerifyPersonalizedResult ||
    isAdminVerifyAwaitingSignup ||
    isAdminAwaitingPhase1Evidence ||
    isAdminVerifyAwaitingEvidence ||
    isAdminMemberProfilingHandoff ||
    isRealEstateAwaitingSignup ||
    isRealEstateAwaitingPhase1Evidence ||
    isRealEstateAwaitingPhase2Evidence ||
    isRealEstateMemberProfilingHandoff ||
    isRealEstateFirstResult ||
    isRealEstatePersonalizedResult ||
    isRealEstatePhase2Review;
  const showResultAreas =
    config.engine !== "verify" ||
    allAnswered ||
    isAdminVerifyFirstResult ||
    isAdminAwaitingPhase1Evidence ||
    isRealEstateAwaitingSignup ||
    isRealEstateAwaitingPhase1Evidence;
  const showSidebar =
    hasSidebar &&
    showResultAreas &&
    !isAdminVerifyFirstResult &&
    !isRealEstateFirstResult &&
    !hideGenericQuotationResult;
  /** VERIFY 질문 중: 오른쪽(PC)·하단(모바일) 행동 CTA 레일 */
  const showVerifyQuestionActions =
    config.engine === "verify" &&
    (!allAnswered || isRealEstatePhase2Screen || isAdminVerifyPhase2Review) &&
    !isAdminVerifyFirstResult &&
    !isAdminVerifyPersonalizedResult &&
    !isRealEstatePersonalizedResult &&
    !isRealEstateAwaitingSignup &&
    !isRealEstateAwaitingPhase1Evidence &&
    !isRealEstateAwaitingPhase2Evidence &&
    !isRealEstateFirstResult &&
    !isAdminAwaitingPhase1Evidence &&
    !isAdminMemberProfilingHandoff &&
    !isRealEstateMemberProfilingHandoff &&
    !isAdminQuestionScreenSuppressed &&
    !isRealEstateQuestionScreenSuppressed &&
    (isRealEstatePhase2Screen || !isRealEstatePhase2Review);
  const showRightColumn = showSidebar || showVerifyQuestionActions;
  /** RE Master question rail — no duplicate funnel CTAs (guide/trust only). */
  const hideRealEstateQuestionRailCtas =
    isRealEstateVerifyMasterLayout && showVerifyQuestionActions;

  const grade = review ? excessGrade(review.verdict) : null;
  const score =
    review && review.quotedAmount != null && review.quotedAmount > 0
      ? computeReviewScore(
          review.verdict,
          review.bubblePercent,
          review.fairReference,
          review.quotedAmount,
          service.marketMin
        )
      : review
        ? review.verdict === "fair"
          ? 78
          : review.verdict === "caution"
            ? 58
            : review.verdict === "very_low"
              ? 62
              : 42
        : 0;
  const displayBubble =
    review && review.bubblePercent != null && review.fairReference > 0
      ? computeDisplayBubblePercent(
          review.bubblePercent,
          review.fairReference,
          review.quotedAmount ?? 0
        )
      : 0;

  const riskCards = config.reviewChecks.slice(0, 4).map((item) => ({
    label: item.title,
    note: item.body,
  }));
  const leftRisks =
    article?.caseLanding.cautions.slice(0, 2) ??
    config.reviewChecks.slice(0, 2).map((item) => shortenNote(item.body, 56));
  const rightRisks =
    article?.caseLanding.cautions.slice(2, 4) ??
    config.reviewChecks.slice(2, 4).map((item) => shortenNote(item.body, 56));
  const recommendation =
    config.reviewRecommendation ||
    config.reviewIntro ||
    service.lookupGuide ||
    "입력 내용을 바탕으로 다음 확인 단계를 진행하세요.";
  const verifyNeedsCards = config.reviewNeeds ?? [];
  function verifyNeedsIcon(title: string, index: number) {
    if (title.includes("권리") || title.includes("증거") || title.includes("효력")) {
      return ShieldCheck;
    }
    if (title.includes("상대방")) return UserRound;
    if (
      title.includes("내용") ||
      title.includes("거래") ||
      title.includes("신고") ||
      title.includes("발행") ||
      title.includes("증빙")
    ) {
      return ClipboardCheck;
    }
    if (title.includes("절차") || title.includes("비용")) return Building2;
    return ([FileText, ClipboardCheck, Building2] as const)[index] ?? FileText;
  }
  const verifyConsultationCostGuide =
    config.engine === "verify" ? service.lookupGuide?.trim() || "" : "";
  const reportSourceNote = verifyConsultationCostGuide
    ? verifyConsultationCostGuide
    : service.source?.trim()
      ? `출처: ${service.source}`
      : service.lookupGuide || config.officialNote;
  /** VERIFY 상담 안내 — 모바일 1줄용 짧은 문구 */
  const reportSourceNoteMobile =
    config.engine === "verify" && verifyConsultationCostGuide
      ? service.id === "admin"
        ? "서류 유형·범위에 따라 상담 비용이 발생할 수 있습니다."
        : service.id === "real-estate"
          ? "계약 유형·조건에 따라 상담 비용이 발생할 수 있습니다."
          : service.id === "fraud"
            ? "사건·증거 범위에 따라 상담 비용이 발생할 수 있습니다."
            : service.id === "tax"
              ? "세금 유형·범위에 따라 상담 비용이 발생할 수 있습니다."
              : service.id === "notary"
                ? "문서 성격·범위에 따라 상담 비용이 발생할 수 있습니다."
                : verifyConsultationCostGuide
      : null;
  const footerNote =
    verifyConsultationCostGuide || service.lookupGuide?.trim() || COST_CHECK_DISCLAIMER;

  function commitAnswer(questionId: string, value: string) {
    const followUpIdsToClear: string[] = [];
    if (questionId === "docs") followUpIdsToClear.push("docsFollowUp");
    if (questionId === "contentCheck") followUpIdsToClear.push("contentCheckFollowUp");
    if (questionId === "formatProofCheck") followUpIdsToClear.push("formatProofFollowUp");
    if (questionId === "submissionCheck") followUpIdsToClear.push("submissionFollowUp");
    if (questionId === "deadline") followUpIdsToClear.push("deadlineFollowUp");
    if (followUpIdsToClear.length > 0) {
      setFollowUpOtherDraft((prev) => {
        const next = { ...prev };
        for (const id of followUpIdsToClear) delete next[id];
        return next;
      });
    }
    if (ADMIN_FOLLOW_UP_IDS.has(questionId)) {
      setFollowUpOtherDraft((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
    setAnswers((prev) => {
      let next: ReviewAnswers;
      if (
        questionId === ADMIN_CASE_ENTRY_Q1_KEY &&
        prev[ADMIN_CASE_ENTRY_Q1_KEY] !== value
      ) {
        next = clearAdminProfileDependentAnswers({
          ...prev,
          [ADMIN_CASE_ENTRY_Q1_KEY]: value,
        });
        setAdminVerifyProfilePhase(1);
        setSection1Collapsed(false);
        setEditingId(null);
        if (value !== "other") {
          delete next[ADMIN_CASE_ENTRY_Q1_OTHER_KEY];
        }
      } else if (questionId === "situation" && prev.situation !== value) {
        next = clearAdminProfileDependentAnswers({ ...prev, situation: value });
      } else {
        next = { ...prev, [questionId]: value };
      }
      next = markFieldAsked(next, questionId);
      if (questionId === "situation") {
        const stage = deriveStageFromSituation(value);
        if (stage) next.stage = stage;
      }
      if (questionId === "docs") {
        if (prev.docs !== value) delete next.docsFollowUp;
        if (value !== "no" && value !== "unknown" && value !== "other") {
          delete next.docsFollowUp;
        }
      }
      if (questionId === "contentCheck") {
        delete next.contentCheckFollowUp;
      }
      if (questionId === "formatProofCheck") {
        delete next.formatProofFollowUp;
      }
      if (questionId === "submissionCheck") {
        delete next.submissionFollowUp;
      }
      if (questionId === "deadline") {
        delete next.deadlineFollowUp;
      }
      if (
        questionId === "situationNote" &&
        value.trim() &&
        !next[CASE_CUSTOMER_INPUT_KEY]?.trim()
      ) {
        next[CASE_CUSTOMER_INPUT_KEY] = value.trim();
      }
      if (questionId === "case01_violationContent" && value !== "other") {
        delete next[CASE01_VIOLATION_CONTENT_NOTE_KEY];
      }
      if (questionId === "case01_customerResponded" && value !== "other") {
        delete next[CASE01_CUSTOMER_RESPONDED_NOTE_KEY];
      }
      if (questionId.startsWith("case02_") && value !== "other") {
        delete next[getAdminChoiceNoteKey(questionId)];
      }
      if (questionId === "case01_factRelationship" && value !== "other") {
        delete next[CASE01_FACT_RELATIONSHIP_NOTE_KEY];
      }
      if (
        questionId === ADMIN_CASE_ENTRY_Q1_KEY &&
        value === "payment_demand" &&
        !next.case02_demandAuthority
      ) {
        const customerText = next[CASE_CUSTOMER_INPUT_KEY]?.trim() ?? "";
        if (/교통국|교통.?관|교통기관|교통|운전|면허|경찰/.test(customerText)) {
          next.case02_demandAuthority = /경찰/.test(customerText) ? "police" : "traffic";
        }
      }
      if (service.id === "admin" && config.engine === "verify" && !hasMarket) {
        next = maybeApplyCase06ExpertTerminalOnAnswer(next, questionId);
        next = attachCaseResolutionSnapshot(next);
      }
      if (service.id === "real-estate" && config.engine === "verify" && !hasMarket) {
        next = attachRealEstateProfileSnapshot(next);
      }
      return next;
    });
    setEditingId(null);
  }

  function handleAdminCase06BridgeSnapshotConfirm() {
    const target = getEffectiveAdminVerifyCase(answers, 2);
    setAnswers((prev) =>
      attachCaseResolutionSnapshot(applyCase06BridgeSnapshot(prev, target)),
    );
  }

  function renderCollapsedQuestion(question: ReviewQuestion): ReactNode {
    const value = answers[question.id] ?? "";
    return (
      <li key={question.id}>
        <button
          type="button"
          onClick={() => setEditingId(question.id)}
          className="w-full rounded-[6px] border border-[#D8DEE8] bg-[#F8FAFC] px-3.5 py-2 text-left transition hover:bg-[#F1F5F9]"
        >
          <p className="text-[12px] font-normal leading-snug text-[#64748B]">{question.label}</p>
          <p className="mt-0.5 break-keep text-[13px] font-medium leading-snug text-[#334155]">
            {formatAnswerLabel(question, value)}
          </p>
        </button>
      </li>
    );
  }

  function renderCompactCollapsedQuestion(question: ReviewQuestion): ReactNode {
    const value = answers[question.id] ?? "";
    return (
      <li key={question.id} className="list-none">
        <button
          type="button"
          onClick={() => {
            setSelectedKey(null);
            setEditingId(question.id);
          }}
          className="flex w-full items-baseline gap-1.5 rounded-[4px] py-0.5 text-left transition hover:bg-[#F8FAFC]"
        >
          <Check className="mt-px h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
          <span className="shrink-0 text-[11px] font-normal leading-snug text-[#94A3B8]">
            {question.label}
          </span>
          <span className="min-w-0 truncate text-[11px] font-medium leading-snug text-[#475569]">
            {formatCollapsedAnswerLabel(question, value, answers)}
          </span>
        </button>
      </li>
    );
  }

  function selectAnswer(questionId: string, value: string) {
    const choiceQuestion = questions.find((q) => q.id === questionId);
    if (
      choiceQuestion?.kind === "choice" &&
      value === "other" &&
      choiceQuestion.options.some(isAdminDirectExplainOption)
    ) {
      setAdminDirectExplainOpenId(questionId);
      setSelectedKey("other");
      return;
    }
    if (ADMIN_FOLLOW_UP_IDS.has(questionId) && value === "other") {
      setSelectedKey(value);
      setAnswers((prev) => ({ ...prev, [questionId]: "other" }));
      return;
    }
    if (ADMIN_FOLLOW_UP_IDS.has(questionId) && value !== "other") {
      setFollowUpOtherDraft((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
    if (questionId === "deadline") {
      commitAnswer(questionId, value);
      setSelectedKey(null);
      return;
    }
    if (questionId === "case01_customerResponded" && value !== "other") {
      setFollowUpOtherDraft((prev) => {
        const next = { ...prev };
        delete next[CASE01_CUSTOMER_RESPONDED_NOTE_KEY];
        return next;
      });
    }
    setSelectedKey(value);
    setTimeout(() => {
      commitAnswer(questionId, value);
      setSelectedKey(null);
    }, 300);
  }

  function renderAdminClassifiedChoiceQuestion(
    question: ReviewQuestion & { kind: "choice"; options: { value: string; label: string }[] },
    questionProps: { variant: "verify"; totalSteps: number; step: number },
    useStitchQuestionLayout: boolean,
    directExplainPlaceholder: string,
  ): ReactNode {
    const value = answers[question.id] ?? "";
    const noteKey = getAdminChoiceNoteKey(question.id);
    const directExplainActive =
      adminDirectExplainOpenId === question.id ||
      (value === "other" &&
        question.options.some(isAdminDirectExplainOption) &&
        !answers[noteKey]?.trim());
    const directDraft = followUpOtherDraft[question.id] ?? answers[noteKey] ?? "";
    const directValid = directDraft.trim().length > 0;
    const gridOptions = question.options.filter((opt) => !isAdminDirectExplainOption(opt));

    return (
      <li key={question.id} className="list-none">
        <QuestionSection
          title={question.label}
          layout={useStitchQuestionLayout ? "stitch" : "default"}
          className={useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined}
          {...questionProps}
        >
          {!directExplainActive ? (
            <>
              <VerifyAnswerGrid
                step={1}
                className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
              >
                {gridOptions.map((opt, index) => (
                  <SelectionCard
                    key={opt.value}
                    variant={useStitchQuestionLayout ? "stitch" : "quiet"}
                    title={opt.label}
                    hideDescriptionOnMobile
                    badgeNumber={
                      useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                    }
                    selected={selectedKey === opt.value || value === opt.value}
                    icon={FileText}
                    tone="blue"
                    className={
                      useStitchQuestionLayout
                        ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                        : undefined
                    }
                    onClick={() => selectAnswer(question.id, opt.value)}
                  />
                ))}
              </VerifyAnswerGrid>
              {question.options.some(isAdminDirectExplainOption) ? (
                <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                  <p className="text-[12px] text-[#64748B]">{directExplainPlaceholder}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminDirectExplainOpenId(question.id);
                      setSelectedKey("other");
                    }}
                    className="mt-2 inline-flex min-h-[40px] items-center rounded-[6px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-medium text-[#0B2A6B] transition hover:bg-[#F8FAFC]"
                  >
                    {ADMIN_DIRECT_EXPLAIN_LABEL}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <VerifyStep4InputStack>
              <p className="text-[12px] text-[#64748B]">{directExplainPlaceholder}</p>
              <textarea
                value={directDraft}
                onChange={(e) =>
                  setFollowUpOtherDraft((prev) => ({ ...prev, [question.id]: e.target.value }))
                }
                placeholder={directExplainPlaceholder}
                rows={4}
                className={VERIFY_STEP4_TEXTAREA_CLASS}
              />
              <VerifyTextareaHint />
              <div className="flex flex-wrap gap-2">
                <PrimaryButton
                  type="button"
                  disabled={!directValid}
                  onClick={() => {
                    const note = directDraft.trim();
                    setAnswers((prev) => {
                      let next: ReviewAnswers = {
                        ...prev,
                        [question.id]: "other",
                        [noteKey]: note,
                      };
                      next = markFieldAsked(next, question.id);
                      if (service.id === "admin" && config.engine === "verify" && !hasMarket) {
                        next = attachCaseResolutionSnapshot(next);
                      }
                      return next;
                    });
                    setFollowUpOtherDraft((prev) => {
                      const next = { ...prev };
                      delete next[question.id];
                      return next;
                    });
                    setAdminDirectExplainOpenId(null);
                    setSelectedKey(null);
                    setEditingId(null);
                  }}
                >
                  다음
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => {
                    setAdminDirectExplainOpenId(null);
                    setFollowUpOtherDraft((prev) => {
                      const next = { ...prev };
                      delete next[question.id];
                      return next;
                    });
                    setSelectedKey(null);
                    setAnswers((prev) => {
                      const next = { ...prev };
                      if (prev[question.id] === "other") {
                        delete next[question.id];
                      }
                      delete next[noteKey];
                      return next;
                    });
                  }}
                  className="inline-flex min-h-[44px] items-center px-3 text-[13px] font-medium text-[#64748B] hover:text-[#334155]"
                >
                  선택지로 돌아가기
                </button>
              </div>
            </VerifyStep4InputStack>
          )}
        </QuestionSection>
      </li>
    );
  }

  function renderVerifyStyleActiveQuestion(question: ReviewQuestion): ReactNode {
    const value = answers[question.id] ?? "";
    const questionProps = {
      variant: "verify" as const,
      totalSteps: stitchProgressTotal,
      step: activeStepNumber,
    };

    if (question.kind === "text") {
      const minLength = question.id.startsWith("re2_") ? 20 : 1;
      const noteValid = value.trim().length >= minLength;
      const useStitchQuestionLayout = adminVerifyUseStitchCards;
      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title={question.label}
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined}
            {...questionProps}
          >
            <VerifyStep4InputStack>
              <textarea
                value={value}
                onChange={(e) => {
                  setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
                }}
                placeholder={question.placeholder}
                rows={4}
                className={VERIFY_STEP4_TEXTAREA_CLASS}
              />
              <VerifyTextareaHint />
              <PrimaryButton
                type="button"
                className="mt-3"
                disabled={!noteValid}
                onClick={() => {
                  const trimmed = (answers[question.id] ?? "").trim();
                  if (trimmed.length >= minLength) {
                    commitAnswer(question.id, trimmed);
                  }
                }}
              >
                다음
              </PrimaryButton>
            </VerifyStep4InputStack>
          </QuestionSection>
        </li>
      );
    }

    if (question.kind === "choice" && question.id === ADMIN_CASE_ENTRY_Q1_KEY) {
      const useStitchQuestionLayout = adminVerifyUseStitchCards;
      const directExplainActive =
        caseEntryDirectExplainOpen || value === "other" || Boolean(answers[ADMIN_CASE_ENTRY_Q1_OTHER_KEY]);
      const directDraft =
        caseEntryDirectExplainDraft || answers[ADMIN_CASE_ENTRY_Q1_OTHER_KEY] || "";
      const directValid = directDraft.trim().length > 0;

      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title={ADMIN_CASE_ENTRY_Q1_LABEL}
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined}
            {...questionProps}
          >
            {!directExplainActive ? (
              <>
                <VerifyAnswerGrid
                  step={1}
                  className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
                >
                  {ADMIN_CASE_ENTRY_Q1_OPTIONS.map((opt, index) => (
                    <SelectionCard
                      key={opt.value}
                      variant={useStitchQuestionLayout ? "stitch" : "quiet"}
                      title={opt.label}
                      hideDescriptionOnMobile
                      badgeNumber={
                        useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                      }
                      selected={selectedKey === opt.value || value === opt.value}
                      icon={FileText}
                      tone="blue"
                      className={
                        useStitchQuestionLayout
                          ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                          : undefined
                      }
                      onClick={() => selectAnswer(question.id, opt.value)}
                    />
                  ))}
                </VerifyAnswerGrid>
                <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                  <p className="text-[12px] text-[#64748B]">선택지에 없는 내용이 있다면</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCaseEntryDirectExplainOpen(true);
                      setSelectedKey("other");
                    }}
                    className="mt-2 inline-flex min-h-[40px] items-center rounded-[6px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-medium text-[#0B2A6B] transition hover:bg-[#F8FAFC]"
                  >
                    {ADMIN_DIRECT_EXPLAIN_LABEL}
                  </button>
                </div>
              </>
            ) : (
              <VerifyStep4InputStack>
                <p className="text-[12px] text-[#64748B]">선택지에 없는 내용이 있다면</p>
                <textarea
                  value={directDraft}
                  onChange={(e) => setCaseEntryDirectExplainDraft(e.target.value)}
                  placeholder="받은 문서나 현재 상황을 편하게 설명해 주세요."
                  rows={4}
                  className={VERIFY_STEP4_TEXTAREA_CLASS}
                />
                <VerifyTextareaHint />
                <div className="flex flex-wrap gap-2">
                  <PrimaryButton
                    type="button"
                    disabled={!directValid}
                    onClick={() => {
                      setAnswers((prev) => {
                        let next = clearAdminProfileDependentAnswers({
                          ...prev,
                          [ADMIN_CASE_ENTRY_Q1_KEY]: "other",
                          [ADMIN_CASE_ENTRY_Q1_OTHER_KEY]: directDraft.trim(),
                        });
                        next = markFieldAsked(next, ADMIN_CASE_ENTRY_Q1_KEY);
                        if (service.id === "admin" && config.engine === "verify" && !hasMarket) {
                          next = attachCaseResolutionSnapshot(next);
                        }
                        return next;
                      });
                      setCaseEntryDirectExplainOpen(false);
                      setCaseEntryDirectExplainDraft("");
                      setSelectedKey(null);
                      setEditingId(null);
                    }}
                  >
                    다음
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => {
                      setCaseEntryDirectExplainOpen(false);
                      setCaseEntryDirectExplainDraft("");
                      setSelectedKey(null);
                    }}
                    className="inline-flex min-h-[44px] items-center px-3 text-[13px] font-medium text-[#64748B] hover:text-[#334155]"
                  >
                    선택지로 돌아가기
                  </button>
                </div>
              </VerifyStep4InputStack>
            )}
          </QuestionSection>
        </li>
      );
    }

    if (
      question.kind === "choice" &&
      isRealEstateVerifyMasterLayout &&
      (question.id === REAL_ESTATE_ENTRY_Q1_KEY ||
        question.id.startsWith("re_") ||
        question.id.startsWith("re2_"))
    ) {
      const useStitchQuestionLayout = adminVerifyUseStitchCards;
      const directExplainDetailKey =
        RE2_PHASE2_DIRECT_EXPLAIN_CHOICE_TO_DETAIL[question.id] ??
        RE_PHASE1_DIRECT_EXPLAIN_CHOICE_TO_DETAIL[question.id];
      const directExplainPlaceholder =
        RE2_PHASE2_DIRECT_EXPLAIN_PLACEHOLDERS[question.id] ??
        RE_PHASE1_DIRECT_EXPLAIN_PLACEHOLDERS[question.id] ??
        "선택지로 설명하기 어려운 상황이라면 직접 알려주세요.";
      const directExplainDraft =
        followUpOtherDraft[question.id] ??
        (directExplainDetailKey ? answers[directExplainDetailKey] : "") ??
        "";
      const directExplainActive =
        Boolean(directExplainDetailKey) &&
        (re2DirectExplainOpenId === question.id ||
          (directExplainDetailKey &&
            !answers[question.id]?.trim() &&
            Boolean(answers[directExplainDetailKey]?.trim())));
      const directExplainValid = directExplainDraft.trim().length >= 20;

      if (directExplainDetailKey && directExplainActive) {
        return (
          <li key={question.id} className="list-none">
            <QuestionSection
              title={question.label}
              layout={useStitchQuestionLayout ? "stitch" : "default"}
              className={useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined}
              {...questionProps}
            >
              <VerifyStep4InputStack>
                <p className="text-[12px] text-[#64748B]">{directExplainPlaceholder}</p>
                <textarea
                  value={directExplainDraft}
                  onChange={(e) =>
                    setFollowUpOtherDraft((prev) => ({ ...prev, [question.id]: e.target.value }))
                  }
                  placeholder={directExplainPlaceholder}
                  rows={4}
                  className={VERIFY_STEP4_TEXTAREA_CLASS}
                />
                <VerifyTextareaHint />
                <div className="flex flex-wrap gap-2">
                  <PrimaryButton
                    type="button"
                    disabled={!directExplainValid}
                    onClick={() => {
                      const note = directExplainDraft.trim();
                      setAnswers((prev) => {
                        let next: ReviewAnswers = {
                          ...prev,
                          [directExplainDetailKey]: note,
                        };
                        next = markFieldAsked(next, question.id);
                        if (service.id === "real-estate" && config.engine === "verify" && !hasMarket) {
                          next = attachRealEstateProfileSnapshot(next);
                        }
                        return next;
                      });
                      setFollowUpOtherDraft((prev) => {
                        const next = { ...prev };
                        delete next[question.id];
                        return next;
                      });
                      setRe2DirectExplainOpenId(null);
                      setSelectedKey(null);
                      setEditingId(null);
                    }}
                  >
                    다음
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => {
                      setRe2DirectExplainOpenId(null);
                      setFollowUpOtherDraft((prev) => {
                        const next = { ...prev };
                        delete next[question.id];
                        return next;
                      });
                      setSelectedKey(null);
                    }}
                    className="inline-flex min-h-[44px] items-center px-3 text-[13px] font-medium text-[#64748B] hover:text-[#334155]"
                  >
                    선택지로 돌아가기
                  </button>
                </div>
              </VerifyStep4InputStack>
            </QuestionSection>
          </li>
        );
      }

      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title={question.label}
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined}
            {...questionProps}
          >
            <VerifyAnswerGrid
              step={1}
              className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
            >
              {question.options.map((opt, index) => (
                <SelectionCard
                  key={opt.value}
                  variant={useStitchQuestionLayout ? "stitch" : "quiet"}
                  title={opt.label}
                  hideDescriptionOnMobile
                  badgeNumber={
                    useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                  }
                  selected={selectedKey === opt.value || value === opt.value}
                  icon={FileText}
                  tone="blue"
                  className={
                    useStitchQuestionLayout
                      ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                      : undefined
                  }
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
            {directExplainDetailKey ? (
              <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                <p className="text-[12px] text-[#64748B]">{directExplainPlaceholder}</p>
                <button
                  type="button"
                  onClick={() => setRe2DirectExplainOpenId(question.id)}
                  className="mt-2 inline-flex min-h-[40px] items-center rounded-[6px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-medium text-[#0B2A6B] transition hover:bg-[#F8FAFC]"
                >
                  {ADMIN_DIRECT_EXPLAIN_LABEL}
                </button>
              </div>
            ) : null}
          </QuestionSection>
        </li>
      );
    }

    if (question.kind === "choice" && question.id.startsWith("case01_")) {
      const useStitchQuestionLayout = adminVerifyUseStitchCards;

      if (question.options.some(isAdminDirectExplainOption)) {
        const directPlaceholder =
          question.id === "case01_violationContent" || question.id === "case01_factRelationship"
            ? "선택지로 설명하기 어려운 상황이라면 직접 알려주세요."
            : "선택지에 없는 내용이 있다면 편하게 설명해 주세요.";
        return renderAdminClassifiedChoiceQuestion(
          question as ReviewQuestion & {
            kind: "choice";
            options: { value: string; label: string }[];
          },
          questionProps,
          useStitchQuestionLayout,
          directPlaceholder,
        );
      }

      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title={question.label}
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined}
            {...questionProps}
          >
            <VerifyAnswerGrid
              step={1}
              className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
            >
              {question.options.map((opt, index) => (
                <SelectionCard
                  key={opt.value}
                  variant={useStitchQuestionLayout ? "stitch" : "quiet"}
                  title={opt.label}
                  hideDescriptionOnMobile
                  badgeNumber={
                    useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                  }
                  selected={selectedKey === opt.value || value === opt.value}
                  icon={FileText}
                  tone="blue"
                  className={
                    useStitchQuestionLayout
                      ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                      : undefined
                  }
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    if (
      question.kind === "choice" &&
      (question.id.startsWith("profile") ||
        question.id.startsWith("case02_") ||
        question.id.startsWith("case03_") ||
        question.id.startsWith("case04_") ||
        question.id.startsWith("case05_") ||
        question.id.startsWith("case06_"))
    ) {
      const useStitchQuestionLayout = adminVerifyUseStitchCards;
      if (question.options.some(isAdminDirectExplainOption)) {
        const directPlaceholder =
          question.id.startsWith("case02_") ||
          question.id.startsWith("case03_") ||
          question.id.startsWith("case04_")
            ? "선택지로 설명하기 어려운 상황이라면 직접 알려주세요."
            : "선택지에 없는 내용이 있다면 편하게 설명해 주세요.";
        return renderAdminClassifiedChoiceQuestion(
          question as ReviewQuestion & {
            kind: "choice";
            options: { value: string; label: string }[];
          },
          questionProps,
          useStitchQuestionLayout,
          directPlaceholder,
        );
      }
      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title={question.label}
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined}
            {...questionProps}
          >
            <VerifyAnswerGrid
              step={1}
              className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
            >
              {question.options.map((opt, index) => (
                <SelectionCard
                  key={opt.value}
                  variant={useStitchQuestionLayout ? "stitch" : "quiet"}
                  title={opt.label}
                  hideDescriptionOnMobile
                  badgeNumber={
                    useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                  }
                  selected={selectedKey === opt.value || value === opt.value}
                  icon={FileText}
                  tone="blue"
                  className={
                    useStitchQuestionLayout
                      ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                      : undefined
                  }
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    if (question.kind === "choice" && question.id === "stage") {
      const useStitchCards = adminVerifyUseStitchCards && !allAnswered;
      const useStitchQuestionLayout = useStitchCards && isVerifyMasterStitchLayout;
      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title="어떤 검토가 필요하신가요?"
            description={
              useStitchQuestionLayout
                ? "현재 진행하시려는 상황에 맞는 항목을 선택해주세요."
                : "현재 상황에 맞는 검토 방식을 선택해주세요."
            }
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={
              useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined
            }
            {...questionProps}
          >
            <VerifyAnswerGrid
              step={1}
              className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
            >
              {REVIEW_STAGE_CARD_OPTIONS.map((opt, index) => (
                <SelectionCard
                  key={opt.value}
                  variant={useStitchCards && isVerifyMasterStitchLayout ? "stitch" : "quiet"}
                  title={opt.title}
                  description={opt.desc}
                  hideDescriptionOnMobile={!useStitchQuestionLayout}
                  badgeNumber={useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined}
                  selected={selectedKey === opt.value || value === opt.value}
                  icon={opt.icon}
                  tone={opt.tone}
                  className={
                    useStitchQuestionLayout
                      ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                      : undefined
                  }
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    if (question.kind === "amount") {
      const amountValid = isQuestionAnswered(question, answers);
      return (
        <li key={question.id} className="list-none">
          <QuestionSection title={question.label} {...questionProps}>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={value}
                  placeholder={question.placeholder}
                  onChange={(e) => {
                    setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
                  }}
                  className="min-h-10 w-full min-w-0 flex-1 rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[15px] text-[#0F172A] outline-none focus:border-[#0B2A6B] focus:ring-2 focus:ring-[#0B2A6B]/12 sm:min-h-9 sm:px-2.5 sm:text-[13px]"
                />
                <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[13px] font-medium text-[#475569] sm:min-h-9">
                  {service.currency}
                </span>
              </div>
              <button
                type="button"
                disabled={!amountValid}
                onClick={() => {
                  if (!amountValid) return;
                  setEditingId(null);
                }}
                className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-[6px] bg-[#0B2A6B] px-3.5 text-[14px] font-medium text-white transition hover:bg-[#082258] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9 sm:w-auto sm:text-[12px]"
              >
                확인
              </button>
            </div>
          </QuestionSection>
        </li>
      );
    }

    if (question.kind === "yesno" && question.id === "docs" && service.id === "admin") {
      const useStitchCards = adminVerifyUseStitchCards && !allAnswered;
      const useStitchQuestionLayout = useStitchCards;
      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title="서류에 적힌 내용이 현재 실제 상황과 일치하나요?"
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={
              useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined
            }
            {...questionProps}
          >
            <VerifyAnswerGrid
              step={1}
              className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
            >
              {ADMIN_DOCS_MATCH_OPTIONS.map((opt, index) => (
                <SelectionCard
                  key={opt.value}
                  variant={useStitchCards ? "stitch" : "quiet"}
                  title={opt.title}
                  badgeNumber={
                    useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                  }
                  selected={selectedKey === opt.value || value === opt.value}
                  hideDescriptionOnMobile
                  className={
                    useStitchQuestionLayout
                      ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                      : undefined
                  }
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    if (question.kind === "followUpChoice" && service.id === "admin") {
      const useStitchQuestionLayout = adminVerifyUseStitchCards && !allAnswered;
      const showingOtherInput = value === "other";
      const otherDraft = followUpOtherDraft[question.id] ?? "";
      const otherTextValid = otherDraft.trim().length > 0;
      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title={question.label}
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={
              useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined
            }
            {...questionProps}
          >
            <VerifyAnswerGrid
              step={1}
              className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
            >
              {question.options.map((opt, index) => (
                <SelectionCard
                  key={opt.value}
                  variant={useStitchQuestionLayout ? "stitch" : "quiet"}
                  title={opt.title}
                  badgeNumber={
                    useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                  }
                  selected={
                    opt.value === "other"
                      ? value === "other" || selectedKey === "other"
                      : selectedKey === opt.value || value === opt.value
                  }
                  hideDescriptionOnMobile
                  className={
                    useStitchQuestionLayout
                      ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                      : undefined
                  }
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
            {showingOtherInput ? (
              <VerifyStep4InputStack className="mt-3">
                <textarea
                  value={otherDraft}
                  onChange={(e) => {
                    setFollowUpOtherDraft((prev) => ({
                      ...prev,
                      [question.id]: e.target.value,
                    }));
                  }}
                  placeholder={question.placeholder}
                  rows={4}
                  className={VERIFY_STEP4_TEXTAREA_CLASS}
                />
                <VerifyTextareaHint />
                <PrimaryButton
                  type="button"
                  className="mt-3"
                  disabled={!otherTextValid}
                  onClick={() => {
                    if (!otherTextValid) return;
                    commitAnswer(question.id, otherDraft.trim());
                    setSelectedKey(null);
                  }}
                >
                  다음
                </PrimaryButton>
              </VerifyStep4InputStack>
            ) : null}
          </QuestionSection>
        </li>
      );
    }

    if (question.id === "contentCheck" && service.id === "admin") {
      const useStitchCards = adminVerifyUseStitchCards && !allAnswered;
      const useStitchQuestionLayout = useStitchCards;
      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title="필요한 내용이 빠지거나 잘못 적힌 부분은 없나요?"
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={
              useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined
            }
            {...questionProps}
          >
            <VerifyAnswerGrid
              step={1}
              className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
            >
              {ADMIN_CONTENT_CHECK_OPTIONS.map((opt, index) => (
                <SelectionCard
                  key={opt.value}
                  variant={useStitchCards ? "stitch" : "quiet"}
                  title={opt.title}
                  badgeNumber={
                    useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                  }
                  selected={selectedKey === opt.value || value === opt.value}
                  hideDescriptionOnMobile
                  className={
                    useStitchQuestionLayout
                      ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                      : undefined
                  }
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    if (question.id === "submissionCheck" && service.id === "admin") {
      const useStitchCards = adminVerifyUseStitchCards && !allAnswered;
      const useStitchQuestionLayout = useStitchCards;
      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title="어디에, 어떻게 제출할지 확인하셨나요?"
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={
              useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined
            }
            {...questionProps}
          >
            <VerifyAnswerGrid
              step={1}
              className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
            >
              {ADMIN_SUBMISSION_CHECK_OPTIONS.map((opt, index) => (
                <SelectionCard
                  key={opt.value}
                  variant={useStitchCards ? "stitch" : "quiet"}
                  title={opt.title}
                  badgeNumber={
                    useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                  }
                  selected={selectedKey === opt.value || value === opt.value}
                  hideDescriptionOnMobile
                  className={
                    useStitchQuestionLayout
                      ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                      : undefined
                  }
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    if (question.id === "deadline" && service.id === "admin") {
      const useStitchCards = adminVerifyUseStitchCards && !allAnswered;
      const useStitchQuestionLayout = useStitchCards;
      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title="제출기한이나 유효기간을 확인하셨나요?"
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={
              useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined
            }
            {...questionProps}
          >
            <VerifyAnswerGrid
              step={1}
              className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
            >
              {ADMIN_DEADLINE_CHECK_OPTIONS.map((opt, index) => (
                <SelectionCard
                  key={opt.value}
                  variant={useStitchCards ? "stitch" : "quiet"}
                  title={opt.title}
                  badgeNumber={
                    useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                  }
                  selected={selectedKey === opt.value || value === opt.value}
                  hideDescriptionOnMobile
                  className={
                    useStitchQuestionLayout
                      ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                      : undefined
                  }
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    if (question.id === "formatProofCheck" && service.id === "admin") {
      const useStitchCards = adminVerifyUseStitchCards && !allAnswered;
      const useStitchQuestionLayout = useStitchCards;
      return (
        <li key={question.id} className="list-none">
          <QuestionSection
            title="서류의 형식과 증빙까지 확인하셨나요?"
            layout={useStitchQuestionLayout ? "stitch" : "default"}
            className={
              useStitchQuestionLayout ? "lg:[&_h3]:!text-[20px]" : undefined
            }
            {...questionProps}
          >
            {useStitchQuestionLayout ? (
              <p className="mb-4 break-keep text-[11px] leading-normal text-slate-500 lg:mb-5">
                서명 · 날짜 · 번역 · 공증 · 인증 등
              </p>
            ) : null}
            <VerifyAnswerGrid
              step={1}
              className={useStitchQuestionLayout ? "max-w-none grid-cols-1 gap-3" : undefined}
            >
              {ADMIN_FORMAT_PROOF_OPTIONS.map((opt, index) => (
                <SelectionCard
                  key={opt.value}
                  variant={useStitchCards ? "stitch" : "quiet"}
                  title={opt.title}
                  badgeNumber={
                    useStitchQuestionLayout ? String(index + 1).padStart(2, "0") : undefined
                  }
                  selected={selectedKey === opt.value || value === opt.value}
                  hideDescriptionOnMobile
                  className={
                    useStitchQuestionLayout
                      ? "lg:[&_p.font-bold]:!text-[14px] lg:[&_p.font-normal]:!text-[11px]"
                      : undefined
                  }
                  onClick={() => selectAnswer(question.id, opt.value)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    if (question.kind === "yesno") {
      return (
        <li key={question.id} className="list-none">
          <QuestionSection title={question.label} {...questionProps}>
            <VerifyAnswerGrid step={1}>
              {(
                [
                  { v: "yes", l: "예", tone: "amber" as SelectionCardTone },
                  { v: "no", l: "아니오", tone: "blue" as SelectionCardTone },
                ] as const
              ).map(({ v, l, tone }) => (
                <SelectionCard
                  key={v}
                  variant="quiet"
                  title={l}
                  selected={selectedKey === v || value === v}
                  tone={tone}
                  hideDescriptionOnMobile
                  onClick={() => selectAnswer(question.id, v)}
                />
              ))}
            </VerifyAnswerGrid>
          </QuestionSection>
        </li>
      );
    }

    return renderActiveQuestion(question);
  }

  function renderActiveQuestion(question: ReviewQuestion): ReactNode {
    const value = answers[question.id] ?? "";

    if (question.kind === "amount") {
      const amountValid = isQuestionAnswered(question, answers);
      return (
        <li
          key={question.id}
          className="rounded-[6px] border border-[#D8DEE8] bg-white px-3.5 py-2.5"
        >
          <p className="text-[14px] font-medium leading-snug text-[#334155]">{question.label}</p>
          <div className="mt-2 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                inputMode="decimal"
                value={value}
                placeholder={question.placeholder}
                onChange={(e) => {
                  setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }));
                }}
                className="min-h-10 w-full min-w-0 flex-1 rounded-[6px] border border-[#CBD5E1] bg-white px-3 text-[15px] text-[#0F172A] outline-none focus:border-[#0B2A6B] focus:ring-2 focus:ring-[#0B2A6B]/12 sm:min-h-9 sm:px-2.5 sm:text-[13px]"
              />
              <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] px-3 text-[13px] font-medium text-[#475569] sm:min-h-9">
                {service.currency}
              </span>
            </div>
            <button
              type="button"
              disabled={!amountValid}
              onClick={() => {
                if (!amountValid) return;
                setEditingId(null);
              }}
              className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-[6px] bg-[#0B2A6B] px-3.5 text-[14px] font-medium text-white transition hover:bg-[#082258] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9 sm:w-auto sm:text-[12px]"
            >
              확인
            </button>
          </div>
        </li>
      );
    }

    if (question.kind === "choice") {
      return (
        <li
          key={question.id}
          className="rounded-[6px] border border-[#D8DEE8] bg-white px-3.5 py-2.5"
        >
          <p className="text-[14px] font-medium leading-snug text-[#334155]">{question.label}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {question.options.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex min-h-10 cursor-pointer items-center justify-center px-3 text-[13px]",
                  selectionChipClasses(value === opt.value),
                )}
              >
                <input
                  type="radio"
                  name={`review-${question.id}`}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => commitAnswer(question.id, opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </li>
      );
    }

    return (
      <li
        key={question.id}
        className="rounded-[6px] border border-[#D8DEE8] bg-white px-3.5 py-2.5"
      >
        <p className="text-[14px] font-medium leading-snug text-[#334155]">{question.label}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              { v: "yes", l: "예" },
              { v: "no", l: "아니오" },
            ] as const
          ).map(({ v, l }) => (
            <label
              key={v}
              className={cn(
                "flex min-h-10 min-w-[5.5rem] flex-1 cursor-pointer items-center justify-center px-3 text-[13px] sm:flex-none",
                selectionChipClasses(value === v),
              )}
            >
              <input
                type="radio"
                name={`review-${question.id}`}
                value={v}
                checked={value === v}
                onChange={() => commitAnswer(question.id, v)}
                className="sr-only"
              />
              {l}
            </label>
          ))}
        </div>
      </li>
    );
  }

  function renderProgressiveQuestions(): ReactNode {
    if (section1Collapsed && allAnswered && !isRealEstatePhase2QuestionFlow) {
      return null;
    }

    const flowQuestions = adminVerifyQuestionFlowQuestions;
    const flowFirstIncomplete = adminVerifyQuestionFlowFirstIncompleteIndex;
    const activeIndex =
      editingId != null
        ? flowQuestions.findIndex((q) => q.id === editingId)
        : flowFirstIncomplete;

    if (
      isAdminVerifyPhase2QuestionFlow &&
      flowQuestions.length === 0 &&
      !adminVerifyPhase2EvidenceDone
    ) {
      return null;
    }

    if (
      isRealEstatePhase2QuestionFlow &&
      flowQuestions.length === 0 &&
      !realEstatePhase2EvidenceDone
    ) {
      return null;
    }

    if (config.engine === "verify") {
      if (isAdminCase06AwaitingBridgeSnapshot) {
        const targetCase = getEffectiveAdminVerifyCase(answers, 2);
        const expertOnly = isCase06ExpertTerminal(answers);
        return (
          <div className="rounded-[12px] border border-[#CBD5E1] bg-[#F8FAFC] p-4 sm:p-5">
            <h3 className="text-[16px] font-semibold text-[#0B2A6B] sm:text-[18px]">
              CASE_06 심화 검토 완료
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-[#334155]">
              {expertOnly
                ? "문서·안내 내용이 여전히 불명확합니다. 전문가 확인이 필요한 상태로 정리되었습니다."
                : `지금까지 확인한 내용을 기준으로 다음 단계(${targetCase ?? "재분류"}) 상세 질문으로 이어갑니다.`}
            </p>
            <div className="mt-4">
              <PrimaryButton type="button" onClick={handleAdminCase06BridgeSnapshotConfirm}>
                {expertOnly ? "전문가 확인 경로로 진행" : "확인하고 다음 질문으로 진행"}
              </PrimaryButton>
            </div>
          </div>
        );
      }

      return (
        <ul className="space-y-1.5">
          {flowQuestions.map((question, index) => {
            const answered = isQuestionAnswered(question, answers);
            const isEditing = editingId === question.id;
            const isActive = activeIndex === index;

            if (isEditing || (isActive && !answered)) {
              return renderVerifyStyleActiveQuestion(question);
            }

            if (
              answered &&
              (isAdminVerifyPhase2Review ||
                isRealEstatePhase2QuestionFlow ||
                (index < flowFirstIncomplete || allAnswered))
            ) {
              if (
                !isAdminVerifyPhase2Review &&
                !isRealEstatePhase2QuestionFlow &&
                !(index < flowFirstIncomplete || allAnswered)
              ) {
                return null;
              }
              return renderCompactCollapsedQuestion(question);
            }

            return null;
          })}
        </ul>
      );
    }

    return (
      <ul className="space-y-2">
        {questions.map((question, index) => {
          const answered = isQuestionAnswered(question, answers);
          const isEditing = editingId === question.id;
          const isActive = activeIndex === index;

          if (isEditing || (isActive && !answered)) {
            return renderActiveQuestion(question);
          }

          if (answered && (index < firstIncompleteIndex || allAnswered)) {
            return renderCollapsedQuestion(question);
          }

          return null;
        })}
      </ul>
    );
  }

  const collapsedSummary = isCase01ActivePath
    ? formatCase01AnswerSummary(answers)
    : questions
        .map((q) => `${q.label}: ${formatAnswerLabel(q, answers[q.id] ?? "—")}`)
        .join(" · ");

  function handleAdminPhase1EvidenceContinue() {
    if (adminPhase1EvidenceDone || !adminPhase1Stop) return;
    const file = adminPhase1EvidenceFile;
    const nextAnswers: ReviewAnswers = { ...answers };
    if (file?.name) {
      nextAnswers[ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY] = file.name;
    } else {
      delete nextAnswers[ADMIN_PHASE1_EVIDENCE_FILE_NAME_KEY];
    }
    const snapshotted = attachCaseResolutionSnapshot(nextAnswers);
    setAdminPhase1TerminalReached(true);
    setAdminPhase1EvidenceDone(true);
    setAnswers(snapshotted);
    if (!adminVerifyPhase1CompleteNotifiedRef.current) {
      adminVerifyPhase1CompleteNotifiedRef.current = true;
      onAdminVerifyPhase1Complete?.(snapshotted, file);
    }
  }

  function handleAdminPhase2EvidenceContinue() {
    if (adminVerifyPhase2EvidenceDone || !adminVerifyPhase2QuestionsOnlyComplete) return;
    const file = adminVerifyPhase2EvidenceFile;
    const nextAnswers: ReviewAnswers = { ...answers };
    if (file?.name) {
      nextAnswers[ADMIN_PHASE2_EVIDENCE_ATTACHED_ANSWERS_KEY] = "1";
      nextAnswers[ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY] = file.name;
    } else {
      delete nextAnswers[ADMIN_PHASE2_EVIDENCE_ATTACHED_ANSWERS_KEY];
      delete nextAnswers[ADMIN_PHASE2_EVIDENCE_FILE_NAME_ANSWERS_KEY];
    }
    const snapshotted = attachCaseResolutionSnapshot(nextAnswers);
    setAnswers(snapshotted);
    setAdminVerifyPhase2EvidenceDone(true);
  }

  function handleRealEstatePhase1EvidenceContinue() {
    if (realEstatePhase1EvidenceDone || !realEstatePhase1Stop) return;
    const file = realEstatePhase1EvidenceFile;
    const nextAnswers: ReviewAnswers = { ...answers };
    if (file?.name) {
      nextAnswers[RE_PHASE1_EVIDENCE_FILE_NAME_KEY] = file.name;
    } else {
      delete nextAnswers[RE_PHASE1_EVIDENCE_FILE_NAME_KEY];
    }
    const snapshotted = attachRealEstateProfileSnapshot(nextAnswers);
    setRealEstatePhase1TerminalReached(true);
    setRealEstatePhase1EvidenceDone(true);
    setAnswers(snapshotted);
    if (!realEstateCompleteNotifiedRef.current) {
      realEstateCompleteNotifiedRef.current = true;
      onRealEstateVerifyComplete?.(snapshotted, file);
    }
  }

  function handleRealEstatePhase2EvidenceContinue() {
    if (realEstatePhase2EvidenceDone || !realEstatePhase2QuestionsComplete) return;
    const file = realEstatePhase2EvidenceFile;
    const nextAnswers: ReviewAnswers = { ...answers };
    if (file?.name) {
      nextAnswers._realEstateEvidenceAttached = "1";
      nextAnswers._realEstateEvidenceFileName = file.name;
    } else {
      delete nextAnswers._realEstateEvidenceAttached;
      delete nextAnswers._realEstateEvidenceFileName;
    }
    const snapshotted = attachRealEstateProfileSnapshot(nextAnswers);
    setAnswers(snapshotted);
    setRealEstatePhase2EvidenceDone(true);
  }

  function handleContinueClick() {
    if (config.engine === "verify") {
      if (isAdminVerifyFirstResult) {
        setAdminVerifyProfilePhase(2);
        setAdminVerifyPhase2EvidenceDone(false);
        setAdminVerifyPhase2EvidenceFile(null);
        onAdminVerifyMetaPersist?.(answers, 2);
        setSection1Collapsed(false);
        setEditingId(null);
        return;
      }
      if (isRealEstateFirstResult) {
        setRealEstateVerifyProfilePhase(2);
        setRealEstatePhase2EvidenceDone(false);
        setRealEstatePhase2EvidenceFile(null);
        onRealEstateVerifyMetaPersist?.(answers, 2);
        setSection1Collapsed(false);
        setEditingId(null);
        return;
      }
      if (isRealEstatePersonalizedResult) {
        onRealEstateVerifyAiReport?.();
        return;
      }
      if (isAdminVerifyPersonalizedResult) {
        onAdminVerifyPersonalizedContinue?.();
        return;
      }
      if (isAdminVerifyStitchLayout) {
        return;
      }
      if (!allAnswered) return;
      onContinue(answers);
      return;
    }
    onContinue();
  }

  const isVerifyLandingQuestions =
    config.engine === "verify" &&
    (!allAnswered || isRealEstatePhase2Screen || isAdminVerifyPhase2Review) &&
    !isAdminVerifyFirstResult &&
    !isAdminVerifyAwaitingEvidence &&
    !isAdminAwaitingPhase1Evidence &&
    !isAdminVerifyAwaitingSignup &&
    !isRealEstateAwaitingPhase2Evidence &&
    !isRealEstateAwaitingPhase1Evidence &&
    !isRealEstateAwaitingSignup &&
    !isRealEstatePersonalizedResult &&
    !isRealEstateMemberProfilingHandoff &&
    !isAdminMemberProfilingHandoff &&
    !isRealEstateQuestionScreenSuppressed &&
    !isAdminQuestionScreenSuppressed &&
    (isRealEstatePhase2Screen ||
      !isRealEstatePhase2Review ||
      isAdminVerifyPhase2Review);
  const isVerifyMasterScreen01 =
    isVerifyMasterStitchLayout &&
    isVerifyLandingQuestions &&
    !isAdminVerifyPhase2Review &&
    !isRealEstatePhase2Review &&
    !isRealEstateAwaitingPhase2Evidence &&
    !isRealEstateAwaitingPhase1Evidence;
  const isAdminVerifyScreen01 = isVerifyMasterScreen01 && isAdminVerifyStitchLayout;
  const isAdminVerifyPhase2Screen =
    isAdminVerifyStitchLayout && isVerifyLandingQuestions && isAdminVerifyPhase2Review;
  const isRealEstatePhase2QuestionScreen =
    isRealEstateVerifyMasterLayout && isVerifyLandingQuestions && isRealEstatePhase2Screen;
  const adminFirstResult = useMemo(() => {
    if (!isAdminVerifyFirstResult) return null;
    return buildAdminVerifyFirstResult(answers);
  }, [isAdminVerifyFirstResult, answers]);
  const adminPersonalizedResult = useMemo(() => {
    if (!isAdminVerifyPersonalizedResult) return null;
    const personalizedContext = buildAdminVerifyPersonalizedContext(
      answers,
      adminVerifyPhase2EvidenceFile?.name ?? resolveAdminPhase2EvidenceFileName(answers) ?? undefined,
    );
    return buildAdminVerifyPersonalizedResult(answers, personalizedContext);
  }, [
    isAdminVerifyPersonalizedResult,
    answers,
    adminVerifyPhase1Questions,
    adminVerifyPhase2OnlyQuestions,
    adminVerifyPhase2EvidenceFile,
  ]);
  const realEstateFirstResult = useMemo(() => {
    if (!isRealEstateFirstResult) return null;
    const phase1FileName =
      answers[RE_PHASE1_EVIDENCE_FILE_NAME_KEY]?.trim() ||
      realEstatePhase1EvidenceFile?.name ||
      null;
    return buildRealEstateFirstResult(answers, phase1FileName);
  }, [isRealEstateFirstResult, answers, realEstatePhase1EvidenceFile]);
  const realEstatePersonalizedResult = useMemo(() => {
    if (!isRealEstatePersonalizedResult) return null;
    const evidenceFileName =
      realEstatePhase2EvidenceFile?.name ?? resolveRealEstatePhase2EvidenceFileName(answers);
    return buildRealEstatePersonalizedResult(answers, evidenceFileName);
  }, [isRealEstatePersonalizedResult, answers, realEstatePhase2EvidenceFile]);
  const adminFirstResultTransition = useMemo(() => {
    if (!adminFirstResult) return null;
    return resolveVerifyPaidTransitionHooks({
      domain: "admin",
      answers,
      firstResultData: adminFirstResult,
    });
  }, [adminFirstResult, answers]);
  const realEstateFirstResultTransition = useMemo(() => {
    if (!realEstateFirstResult) return null;
    return resolveVerifyPaidTransitionHooks({
      domain: "real-estate",
      answers,
      firstResultData: realEstateFirstResult,
    });
  }, [realEstateFirstResult, answers]);
  const stitchProgressPercent = Math.min(
    100,
    Math.round((activeStepNumber / stitchProgressTotal) * 100),
  );
  const isVerifyFirstOrPersonalizedResult =
    isAdminVerifyFirstResult ||
    isRealEstateFirstResult ||
    isAdminVerifyPersonalizedResult ||
    isRealEstatePersonalizedResult;

  const reportCardFooter = (
    <footer
      className={cn(
        "border-t bg-white text-center",
        isVerifyMasterStitchLayout
          ? "border-slate-100 bg-slate-50/50 px-4 py-3 lg:bg-white lg:px-6 lg:py-3.5"
          : "mt-auto border-[#E5E7EB] px-3.5 py-2 sm:px-4 sm:py-2",
        !isVerifyMasterStitchLayout && config.engine === "verify" && "bg-[#F8FAFC] lg:bg-white",
        !isVerifyMasterStitchLayout && config.engine !== "verify" && "bg-[#F8FAFC]",
      )}
    >
      <p
        className={cn(
          "break-keep leading-tight tracking-wide text-slate-400",
          isVerifyMasterStitchLayout
            ? "text-[10px] font-medium lg:text-[10.5px]"
            : "text-[11px] sm:text-[10px] sm:leading-relaxed",
        )}
      >
        VFBCAI · www.vfbcai.com · Check. Verify. Register. Protect.
      </p>
      <p
        className={cn(
          "mt-1 break-keep text-center leading-tight",
          isAdminVerifyStitchLayout
            ? "mt-0.5 text-[11px] font-normal text-slate-500 lg:mt-1 lg:text-[11.5px]"
            : reportSourceNoteMobile
              ? "text-[9px] leading-none tracking-tight whitespace-nowrap text-[#64748B] sm:text-[10.5px] sm:leading-relaxed sm:tracking-normal sm:whitespace-normal"
              : "text-[11px] leading-[1.45] text-[#64748B] sm:mt-1 sm:text-[10.5px] sm:leading-relaxed",
        )}
      >
        {isAdminVerifyStitchLayout ? (
          "행정문서 검토는 서류 유형·검토 범위에 따라 비용이 발생할 수 있습니다."
        ) : reportSourceNoteMobile ? (
          <>
            <span className="sm:hidden">{reportSourceNoteMobile}</span>
            <span className="hidden sm:inline">{footerNote}</span>
          </>
        ) : (
          footerNote
        )}
      </p>
    </footer>
  );

  return (
    <div className={cn(isAdminVerifyStitchLayout ? "mt-0" : "mt-2.5 space-y-2.5 sm:mt-3 sm:space-y-3")}>
      {queryEntry ? (
        <section
          aria-labelledby="review-query-start"
          className="rounded-[4px] border border-[#D8DEE8] bg-white px-3.5 py-3 sm:px-4 sm:py-3.5"
        >
          <h3
            id="review-query-start"
            className="mb-2 text-[12px] font-medium tracking-tight text-[#0B2A6B] sm:mb-1.5"
          >
            확인 시작
          </h3>
          {queryEntry}
        </section>
      ) : null}

      {isRealEstateMemberProfilingHandoff || isAdminMemberProfilingHandoff ? (
        <div
          data-purpose={
            isAdminMemberProfilingHandoff
              ? "admin-phase1-member-handoff"
              : isRealEstateMemberProfilingHandoff
                ? "re-phase1-member-handoff"
                : undefined
          }
          className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white px-6 py-10 text-center shadow-sm"
          role="status"
          aria-live="polite"
        >
          <p className="text-[15px] font-semibold text-[#0B2A6B]">회원 정보를 확인하고 있습니다</p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
            {adminVerifyMemberSubmitting || realEstateVerifyMemberSubmitting
              ? "잠시만 기다려 주세요. 완료되면 1차 종합 결과가 표시됩니다."
              : "접수를 준비하고 있습니다."}
          </p>
        </div>
      ) : (
      <div
        className={cn(
          "overflow-hidden border bg-white",
          isAdminVerifyPersonalizedResult
            ? "overflow-visible border-0 bg-transparent shadow-none"
            : isRealEstatePersonalizedResult
              ? "overflow-visible border-0 bg-transparent shadow-none"
              : isVerifyMasterStitchLayout
              ? "rounded-2xl border-[#e2e8f0] shadow-sm"
              : "rounded-[4px] border-[#D8DEE8] shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        )}
      >
        <div
          className={cn(
            "flex flex-col",
            showRightColumn &&
              (isVerifyMasterScreen01
                ? "lg:grid lg:grid-cols-12 lg:items-stretch"
                : isVerifyLandingQuestions
                  ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(248px,292px)] lg:items-stretch"
                  : "lg:grid lg:grid-cols-[minmax(0,1fr)_270px] lg:items-stretch"),
          )}
        >
          <div
            className={cn(
              "flex min-w-0 flex-col bg-white",
              isAdminVerifyFirstResult || isRealEstateFirstResult
                ? "px-5 py-6 sm:px-6 sm:py-7 lg:flex lg:flex-col lg:items-center lg:px-10 lg:py-9"
                : showRightColumn &&
                  (isVerifyMasterScreen01
                    ? "border-slate-100 px-3 py-4 lg:col-span-8 lg:border-r lg:p-8"
                    : isAdminVerifyPersonalizedResult
                      ? "bg-transparent p-0 lg:items-stretch"
                      : isRealEstatePersonalizedResult
                        ? "bg-transparent p-0 lg:items-stretch"
                        : isAdminVerifyPhase2Screen ||
                          isRealEstatePhase2QuestionScreen
                        ? "border-slate-100 px-3 py-4 lg:border-r lg:p-8"
                        : "border-[#E5E7EB] lg:border-r"),
            )}
          >
            <article
              className={cn(
                "flex h-full min-h-0 flex-col",
                isVerifyMasterStitchLayout && "min-h-full",
              )}
            >
              {(!isVerifyLandingQuestions || !isVerifyMasterStitchLayout) &&
              !isAdminVerifyFirstResult &&
              !isAdminVerifyPersonalizedResult &&
              !isRealEstatePersonalizedResult &&
              !isRealEstatePhase2Review ? (
              <header
                className={cn(
                  "border-b border-[#E5E7EB]",
                  "px-3.5 py-2.5 sm:px-4 sm:py-3",
                )}
              >
                <div
                  className={cn(
                    "flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium tracking-[0.06em] text-[#64748B] sm:text-[10px] sm:tracking-[0.1em]">
                      {config.engine === "verify" ? "VFBCAI · VERIFY" : "VFBCAI · CHECK"}
                    </p>
                    <h2
                      className={cn(
                        "mt-1 font-semibold leading-snug tracking-tight text-[#0B2A6B] sm:mt-0.5",
                        "text-[18px] sm:text-[17px]",
                      )}
                    >
                      {reportTitle}
                    </h2>
                    <p className="mt-0.5 break-words text-[12px] font-normal leading-snug tracking-[0.02em] text-[#64748B] sm:mt-0.5 sm:text-[10px] sm:leading-relaxed sm:tracking-[0.06em]">
                      {config.engine === "verify"
                        ? "QUOTATION REPORT"
                        : `QUOTATION REPORT · ${reportShortLabel}`}
                    </p>
                  </div>
                  {config.engine === "verify" ? null : (
                  <div className="min-w-0 text-left max-sm:w-full sm:max-w-[14rem] sm:pt-0.5 sm:text-right">
                    <p className={MOBILE_REPORT_SOURCE}>
                      {reportSourceNoteMobile ? (
                        <>
                          <span className="sm:hidden">{reportSourceNoteMobile}</span>
                          <span className="hidden sm:inline">{reportSourceNote}</span>
                        </>
                      ) : (
                        reportSourceNote
                      )}
                    </p>
                  </div>
                  )}
                </div>
              </header>
              ) : null}

              <div
                className={cn(
                  isVerifyMasterStitchLayout
                    ? "flex-1"
                    : "flex-1 space-y-4",
                  isVerifyLandingQuestions && !isVerifyMasterStitchLayout
                    ? "px-4 py-4 sm:space-y-5 sm:px-5 sm:py-5"
                    : !isVerifyMasterStitchLayout
                      ? "px-3.5 py-3 sm:space-y-4 sm:px-4 sm:py-3.5"
                      : undefined,
                )}
              >
                {isAdminVerifyAwaitingSignup && adminVerifyLeadCaptureSlot ? (
                  <div className="w-full">{adminVerifyLeadCaptureSlot}</div>
                ) : null}
                {isAdminAwaitingPhase1Evidence ? (
                  <AdminVerifyPhase2EvidencePanel
                    evidenceTier="phase1"
                    file={adminPhase1EvidenceFile}
                    onFileChange={setAdminPhase1EvidenceFile}
                    onContinue={handleAdminPhase1EvidenceContinue}
                  />
                ) : null}
                {isRealEstateAwaitingPhase1Evidence ? (
                  <AdminVerifyPhase2EvidencePanel
                    evidenceTier="phase1"
                    file={realEstatePhase1EvidenceFile}
                    onFileChange={setRealEstatePhase1EvidenceFile}
                    onContinue={handleRealEstatePhase1EvidenceContinue}
                  />
                ) : null}
                {isRealEstateAwaitingSignup && realEstateVerifyLeadCaptureSlot ? (
                  <div className="w-full">{realEstateVerifyLeadCaptureSlot}</div>
                ) : null}
                {isAdminVerifyAwaitingEvidence ? (
                  <AdminVerifyPhase2EvidencePanel
                    evidenceTier="phase2"
                    domain="admin"
                    file={adminVerifyPhase2EvidenceFile}
                    onFileChange={setAdminVerifyPhase2EvidenceFile}
                    onContinue={handleAdminPhase2EvidenceContinue}
                  />
                ) : null}
                {isRealEstateAwaitingPhase2Evidence ? (
                  <AdminVerifyPhase2EvidencePanel
                    evidenceTier="phase2"
                    domain="real-estate"
                    file={realEstatePhase2EvidenceFile}
                    onFileChange={setRealEstatePhase2EvidenceFile}
                    onContinue={handleRealEstatePhase2EvidenceContinue}
                  />
                ) : null}
                {(isAdminVerifyPhase2Screen ||
                  isAdminVerifyAwaitingEvidence ||
                  isRealEstatePhase2Review ||
                  isRealEstateAwaitingPhase2Evidence) ? (
                  <div className="mb-4 rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3.5 lg:mb-5 lg:rounded-lg lg:px-4 lg:py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-[#0f172a]/10 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0f172a]">
                        2차 · 개인화 검토
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        1차에서 확인한 내용을 바탕으로 필요한 부분만 추가 확인합니다
                      </span>
                    </div>
                    <p className="mt-2 break-keep text-[12px] leading-relaxed text-slate-600 lg:text-[11.5px]">
                      설문을 다시 시작하는 단계가 아니라, 내 상황을 함께 정리하는 검토 단계입니다.
                    </p>
                  </div>
                ) : null}
                {isAdminVerifyStitchLayout &&
                !isAdminVerifyFirstResult &&
                !isAdminVerifyPersonalizedResult &&
                !isRealEstatePersonalizedResult &&
                !isRealEstateFirstResult &&
                !isRealEstatePhase2Review &&
                !isAdminVerifyAwaitingSignup &&
                !isAdminVerifyAwaitingEvidence ? (
                  <div className="hidden lg:block">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      VFBCAI · VERIFY
                    </p>
                    <h2 className="mt-1 text-[18px] font-bold tracking-tight text-slate-900">
                      {reportTitle}
                    </h2>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      QUOTATION REPORT
                    </p>
                    <div className="my-5 h-px bg-slate-100" />
                  </div>
                ) : null}

                {isAdminVerifyFirstResult && adminFirstResult ? (
                  <AdminVerifyFirstResultPanel
                    data={adminFirstResult}
                    onContinue={handleContinueClick}
                    transitionHooks={adminFirstResultTransition ?? undefined}
                    onAiSummaryNavigate={onAdminVerifyAiSummary}
                    aiSummaryNavigating={adminVerifyAiSummaryNavigating}
                  />
                ) : null}
                {isRealEstateFirstResult && realEstateFirstResult ? (
                  <AdminVerifyFirstResultPanel
                    data={realEstateFirstResult}
                    onContinue={handleContinueClick}
                    transitionHooks={realEstateFirstResultTransition ?? undefined}
                    onAiSummaryNavigate={onRealEstateVerifyAiSummary}
                    aiSummaryNavigating={realEstateVerifyAiSummaryNavigating}
                    domain="real-estate"
                  />
                ) : null}
                {isRealEstatePersonalizedResult && realEstatePersonalizedResult ? (
                  <AdminVerifyFirstResultPanel
                    data={realEstatePersonalizedResult}
                    onContinue={handleContinueClick}
                    domain="real-estate"
                    variant="personalized"
                    onAiReport={onRealEstateVerifyAiReport}
                    onExpert={() => onRealEstateVerifyExpert?.(answers)}
                    onDirect={onRealEstateVerifyDirect}
                    aiReportRequesting={realEstateVerifyAiReportRequesting}
                    expertRequesting={realEstateVerifyExpertRequesting}
                    aiReportError={realEstateVerifyAiReportError}
                    expertError={realEstateVerifyExpertError}
                  />
                ) : null}
                {isAdminVerifyPersonalizedResult && adminPersonalizedResult ? (
                  <AdminVerifyFirstResultPanel
                    data={adminPersonalizedResult}
                    onContinue={handleContinueClick}
                    onAiReport={onAdminVerifyAiReport}
                    onExpert={() => onAdminVerifyExpert?.(answers)}
                    onDirect={onAdminVerifyDirect}
                    aiReportRequesting={adminVerifyAiReportRequesting}
                    expertRequesting={adminVerifyExpertRequesting}
                    aiReportError={adminVerifyAiReportError}
                    expertError={adminVerifyExpertError}
                    variant="personalized"
                  />
                ) : null}
                {!isAdminVerifyFirstResult &&
                !isAdminVerifyPersonalizedResult &&
                !isRealEstatePersonalizedResult &&
                !isRealEstateFirstResult &&
                !isAdminVerifyAwaitingSignup &&
                !isAdminVerifyAwaitingEvidence &&
                !isRealEstateAwaitingSignup &&
                !isRealEstateAwaitingPhase1Evidence &&
                !isRealEstateAwaitingPhase2Evidence &&
                !isRealEstateMemberProfilingHandoff &&
                !isAdminMemberProfilingHandoff &&
                !isRealEstateQuestionScreenSuppressed ? (
                <div>
                <section aria-labelledby="review-check-summary">
                  {!isAdminVerifyScreen01 ? (
                    <div
                      className={cn(
                        "mb-3 flex flex-col gap-1 sm:flex-row sm:items-center",
                        !isVerifyLandingQuestions && "sm:mb-3",
                      )}
                    >
                      {(isAdminVerifyPhase2Screen || isRealEstatePhase2QuestionScreen) ? (
                        <>
                          <h3
                            id="review-check-summary"
                            className="shrink-0 text-[17px] font-semibold leading-snug tracking-tight text-[#0B2A6B] sm:text-[13.5px] sm:leading-relaxed sm:tracking-normal"
                          >
                            <span className="tabular-nums font-medium text-[#64748B]">2.</span>{" "}
                            추가 상황 확인
                          </h3>
                          <p className={MOBILE_COST_SUMMARY_INTRO}>
                            1차에서 확인한 내용을 바탕으로, 현재 상황만 추가로 확인합니다.
                          </p>
                        </>
                      ) : (
                        <>
                          <h3
                            id="review-check-summary"
                            className="shrink-0 text-[17px] font-semibold leading-snug tracking-tight text-[#0B2A6B] sm:text-[13.5px] sm:leading-relaxed sm:tracking-normal"
                          >
                            <span className="tabular-nums font-medium text-[#64748B]">1.</span>{" "}
                            검토 내용 체크
                          </h3>
                          {!isVerifyLandingQuestions ? (
                            <p className={MOBILE_COST_SUMMARY_INTRO}>
                              {hasMarket
                                ? "짧은 질문에 답하면 검토 결과를 확인할 수 있습니다."
                                : "4개 질문에 답하면 검토 결과가 표시됩니다."}
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : (
                    <h3 id="review-check-summary" className="sr-only">
                      {isAdminVerifyPhase2Screen || isRealEstatePhase2QuestionScreen
                        ? "추가 상황 확인"
                        : "검토 내용 체크"}
                    </h3>
                  )}

                  {isVerifyMasterScreen01 ||
                  isAdminVerifyPhase2Screen ||
                  isRealEstatePhase2QuestionScreen ? (
                    <div className="mb-4 flex items-center justify-between gap-3 lg:mb-5 lg:justify-start">
                      <div className="flex items-center gap-2.5 lg:gap-3">
                        <span
                          className={cn(
                            "font-bold tabular-nums leading-none text-[#0f172a]",
                            activeStepNumber === 1 || activeStepNumber === 2
                              ? "text-[12px] lg:text-[14px]"
                              : "text-[12px]",
                          )}
                        >
                          {String(activeStepNumber).padStart(2, "0")} /{" "}
                          {String(stitchProgressTotal).padStart(2, "0")}
                        </span>
                        <div
                          className={cn(
                            "flex items-center overflow-hidden rounded-full bg-slate-100",
                            "h-[4px] w-[80px] lg:h-[3.5px] lg:w-[100px]",
                          )}
                        >
                          <div
                            className="h-full rounded-full bg-[#0f172a] transition-[width] duration-300 ease-out"
                            style={{ width: `${stitchProgressPercent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 sm:hidden">
                        {isAdminVerifyPhase2Screen || isRealEstatePhase2QuestionScreen
                          ? "2단계 · 개인화 검토"
                          : "1단계 · 검토 방향"}
                      </span>
                    </div>
                  ) : null}

                  {section1Collapsed && allAnswered ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSection1Collapsed(false);
                        setEditingId(null);
                      }}
                      className={`w-full rounded-[6px] border border-[#D8DEE8] px-3.5 py-2.5 text-left ${
                        config.engine === "verify"
                          ? "bg-[#F8FAFC] lg:bg-white"
                          : "bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#0B2A6B]">
                            <ClipboardCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                            검토 완료
                          </p>
                          <p className="mt-1 break-keep text-[12px] leading-relaxed text-[#64748B]">
                            {collapsedSummary}
                          </p>
                        </div>
                        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden />
                      </div>
                    </button>
                  ) : (
                    renderProgressiveQuestions()
                  )}
                  {showResultAreas ? (
                    <ReviewOfficialTrustStrip engine={config.engine} />
                  ) : null}
                  {isVerifyMasterScreen01 && showVerifyQuestionActions ? (
                    <>
                      <div
                        className={cn(
                          "mt-3.5 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-500 sm:hidden",
                          isRealEstateVerifyMasterLayout && "mb-0",
                        )}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        <span>공식 법령·행정자료를 기준으로 검토합니다.</span>
                      </div>
                      <p
                        className={cn(
                          "mt-5 hidden text-[12px] font-normal text-slate-400 lg:block",
                          isRealEstateVerifyMasterLayout && "lg:hidden",
                        )}
                      >
                        공식 법령·행정자료를 기준으로 검토합니다.
                      </p>
                      <div
                        className={cn(
                          "flex flex-col gap-3 lg:hidden",
                          isRealEstateVerifyMasterLayout && "mt-6",
                        )}
                      >
                        <VerifyQuestionReasonGuidePanel phase={1} className="w-full" />
                        <OfficialTrustZone
                          engine="verify"
                          variant="panel"
                          layout="stitch-mobile"
                          className="w-full"
                        />
                      </div>
                    </>
                  ) : null}
                  {showVerifyQuestionActions && !isVerifyMasterScreen01 ? (
                    <div className="mt-4 flex flex-col gap-3 lg:hidden">
                      {(isAdminVerifyPhase2Screen || isRealEstatePhase2QuestionScreen) ? (
                        <VerifyQuestionReasonGuidePanel phase={2} className="w-full" />
                      ) : null}
                      <OfficialTrustZone
                        engine="verify"
                        variant="panel"
                        layout={
                          isAdminVerifyPhase2Screen || isRealEstatePhase2QuestionScreen
                            ? "stitch"
                            : undefined
                        }
                        className="w-full"
                      />
                    </div>
                  ) : null}
                </section>

                {showVerifyQuestionActions && !isVerifyMasterScreen01 ? (
                  <div className="mt-6 flex flex-col gap-2 lg:hidden">
                    <button
                      type="button"
                      disabled
                      onClick={handleContinueClick}
                      className={selectionPrimaryActionClasses(true)}
                    >
                      내 상황 검토하기 →
                    </button>
                    <button type="button" disabled className={selectionSecondaryActionClasses(true)}>
                      이 결과 공유하기
                    </button>
                    <p className="break-keep text-center text-[11px] leading-tight text-slate-400">
                      모든 질문에 답하면 결과를 확인할 수 있습니다.
                    </p>
                  </div>
                ) : null}

                {review && !hideGenericQuotationResult ? (
                  <section aria-labelledby="review-result">
                    <SectionTitle id="review-result" number="2" title="검토 결과" emphasized />
                    <p className={MOBILE_SECTION_INTRO}>
                      입력한 내용을 기준으로 1차 검토 결과입니다.
                    </p>
                    <div
                        className={`rounded-[6px] border px-3 py-2.5 sm:px-3 sm:py-2.5 ${
                          review.verdict === "fair"
                            ? "border-emerald-200 bg-emerald-50/60"
                            : review.verdict === "very_low"
                              ? "border-slate-200 bg-slate-50"
                              : "border-red-200 bg-red-50/50"
                        }`}
                      >
                        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between lg:gap-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2.5">
                              <AlertTriangle
                                className={`mt-0.5 h-4 w-4 shrink-0 ${
                                  review.verdict === "fair"
                                    ? "text-emerald-600"
                                    : review.verdict === "very_low"
                                      ? "text-slate-500"
                                      : "text-red-600"
                                }`}
                                aria-hidden
                              />
                              <div className="min-w-0">
                                <div className="sm:hidden">
                                  <p className={MOBILE_BODY_TIGHT}>{review.title}</p>
                                  <p className={`mt-1 ${MOBILE_BODY} line-clamp-3`}>
                                    {[review.summary, review.detail].filter(Boolean).join(" ")}
                                  </p>
                                </div>
                                <div className="hidden sm:block">
                                  <p className={MOBILE_SUBHEAD}>{analysisHeadline(review.verdict)}</p>
                                  <p className={`mt-1 ${MOBILE_BODY_TIGHT}`}>{review.title}</p>
                                  <p className={`mt-1 ${MOBILE_BODY}`}>{review.summary}</p>
                                  <p className={`mt-1 ${MOBILE_BODY}`}>{review.detail}</p>
                                </div>
                                {review.quotedAmount != null && review.fairReference > 0 ? (
                                  <p className={MOBILE_META}>
                                    참고 적정 범위:{" "}
                                    {formatCostAmount(review.fairReference, service.currency)}
                                    {displayBubble !== 0 ? (
                                      <>
                                        {" "}
                                        · 차이{" "}
                                        <span className="font-medium tabular-nums text-[#0F172A]">
                                          {displayBubble > 0 ? "+" : ""}
                                          {displayBubble.toFixed(0)}%
                                        </span>
                                      </>
                                    ) : null}
                                    {" · "}
                                    적정성 점수 {Math.round(score)} / 100
                                  </p>
                                ) : (
                                  <p className={MOBILE_META}>
                                    1차 검토 점수 {Math.round(score)} / 100
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          {grade ? (
                            <div className="shrink-0 rounded-[6px] border border-white/80 bg-white/80 px-3 py-2 sm:px-3 sm:py-2 lg:min-w-[8.5rem]">
                              <p className="text-[12px] font-normal text-[#64748B] sm:text-[10px]">
                                {review.quotedAmount != null && review.fairReference > 0
                                  ? "과다 가능성 등급"
                                  : "주의 등급"}
                              </p>
                              <p className={MOBILE_GRADE_LABEL}>{grade.label}</p>
                              <div className="mt-1.5 flex gap-0.5 sm:mt-1" aria-hidden>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-sm ${
                                      i < grade.filled ? grade.tone : "bg-slate-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                  </section>
                ) : null}

                {showResultAreas && !hideGenericQuotationResult ? (
                  <>
                <section aria-labelledby="review-risks">
                  <SectionTitle id="review-risks" number="3" title="주요 위험 요인" emphasized />
                  <p className={MOBILE_SECTION_INTRO}>
                    검토 시 자주 확인하는 위험 요인입니다.
                  </p>
                  <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-1.5 lg:grid-cols-4">
                    {riskCards.map((item) => (
                      <li
                        key={item.label}
                        className={`min-w-0 rounded-[6px] border border-[#E5E7EB] px-2.5 py-2 sm:px-2 sm:py-2 ${
                          config.engine === "verify"
                            ? "bg-[#F8FAFC] lg:bg-white"
                            : "bg-[#F8FAFC]"
                        }`}
                      >
                        <p className={MOBILE_CARD_LABEL}>{item.label}</p>
                        <p className={MOBILE_CARD_NOTE}>{item.note}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby="review-needs">
                  <SectionTitle
                    id="review-needs"
                    number="4"
                    title="확인이 필요한 사항"
                    emphasized
                  />
                  <p className={MOBILE_SECTION_INTRO}>
                    {config.engine === "verify"
                      ? "서류를 제출하기 전에 아래 3가지를 확인합니다."
                      : "놓치면 재제출·지연이 생길 수 있는 항목입니다."}
                  </p>
                  {config.engine === "verify" ? (
                    <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-3 lg:gap-2">
                      {verifyNeedsCards.map(({ title, items }, index) => {
                        const Icon = verifyNeedsIcon(title, index);
                        return (
                          <div
                            key={title}
                            className="h-full rounded-[6px] border border-[#D6E4FB] bg-[#F5F8FF] px-3 py-1.5 sm:px-3 sm:py-1.5 lg:bg-white"
                          >
                            <div className="mb-0.5 flex items-start gap-2 sm:gap-1.5">
                              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0B2A6B]">
                                <Icon className="h-3.5 w-3.5" aria-hidden />
                              </span>
                              <p className={`min-w-0 ${MOBILE_CARD_LABEL}`}>{title}</p>
                            </div>
                            <ul className="space-y-0.5">
                              {items.map((text) => (
                                <li
                                  key={text}
                                  className="flex items-start gap-2 break-keep text-[12.5px] font-normal leading-[1.45] text-[#64748B] sm:text-[11px] sm:leading-snug sm:text-[#475569] lg:whitespace-nowrap lg:text-[10.5px]"
                                >
                                  <span
                                    className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#64748B] sm:mt-[0.35rem]"
                                    aria-hidden
                                  />
                                  <span className="min-w-0">{text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2 lg:gap-2">
                        <div className="h-auto self-start rounded-[6px] border border-[#FECACA] bg-[#FEF2F2]/60 px-3 py-2.5 sm:px-3 sm:py-2.5">
                          <div className="mb-1.5 flex items-start gap-2 sm:mb-1.5 sm:gap-1.5">
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                              <UserRound className="h-3.5 w-3.5" aria-hidden />
                            </span>
                            <p className={`min-w-0 ${MOBILE_CARD_LABEL}`}>
                              직접 진행 시 놓치기 쉬운 항목
                            </p>
                          </div>
                          <ul className="space-y-1">
                            {leftRisks.map((text, index) => (
                              <li key={`${text}-${index}`} className={`flex gap-1.5 ${MOBILE_BODY}`}>
                                <span className="shrink-0 tabular-nums text-[#94A3B8]" aria-hidden>
                                  {index === 0 ? "①" : "②"}
                                </span>
                                <span>{text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="h-auto self-start rounded-[6px] border border-[#BFDBFE] bg-[#EFF6FF]/70 px-3 py-2.5 sm:px-3 sm:py-2.5">
                          <div className="mb-1.5 flex items-start gap-2 sm:mb-1.5 sm:gap-1.5">
                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0B2A6B]">
                              <Building2 className="h-3.5 w-3.5" aria-hidden />
                            </span>
                            <p className={`min-w-0 ${MOBILE_CARD_LABEL}`}>
                              대행·안내를 받을 때 확인할 항목
                            </p>
                          </div>
                          <ul className="space-y-1">
                            {rightRisks.map((text, index) => (
                              <li key={`${text}-${index}`} className={`flex gap-1.5 ${MOBILE_BODY}`}>
                                <span className="shrink-0 tabular-nums text-[#94A3B8]" aria-hidden>
                                  {index === 0 ? "①" : "②"}
                                </span>
                                <span>{text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                  )}
                  <p className={`mt-1.5 ${MOBILE_META} sm:mt-1.5`}>
                    {config.engine === "verify"
                      ? "법률 판단이나 확정된 비용·벌금이 아니라, 검토 과정에서 확인하는 주요 항목입니다."
                      : "확정된 법률·벌금 금액이 아니라, 검토 진행에서 확인하는 참고 안내입니다."}
                  </p>
                </section>

                <section aria-labelledby="review-action">
                  <SectionTitle id="review-action" number="5" title="권장 대응" emphasized />
                  <div className="rounded-[6px] border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5 sm:px-3 sm:py-2.5">
                    <div className="flex items-start gap-2.5 sm:gap-2">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" aria-hidden />
                      <p className={MOBILE_CALLOUT}>{recommendation}</p>
                    </div>
                  </div>
                </section>
                  </>
                ) : null}

                {review && !hideGenericQuotationResult ? (
                  <div className="mt-2.5 flex flex-col gap-1.5 lg:hidden">
                    <button
                      type="button"
                      onClick={handleContinueClick}
                      className={selectionPrimaryActionClasses()}
                    >
                      {config.engine === "verify" ? "내 상황 검토하기 →" : "내 상황 자세히 확인하기 →"}
                    </button>
                    <button
                      type="button"
                      className={selectionSecondaryActionClasses()}
                    >
                      이 결과 공유하기
                    </button>
                  </div>
                ) : null}
                </div>
                ) : null}
              </div>

              {!isVerifyMasterStitchLayout ? reportCardFooter : null}
              {isVerifyMasterStitchLayout && isVerifyFirstOrPersonalizedResult ? reportCardFooter : null}
            </article>
          </div>

          {showSidebar ? (
            <ReviewSidebar
              service={service}
              config={config}
              quotedAmount={review?.quotedAmount ?? null}
              excessLabel={grade?.label ?? null}
              onContinue={handleContinueClick}
              continueEnabled={config.engine === "verify" ? allAnswered : undefined}
            />
          ) : null}

          {showVerifyQuestionActions &&
          (isVerifyMasterScreen01 ||
            isAdminVerifyPhase2Screen ||
            isRealEstatePhase2QuestionScreen) ? (
            <aside
              className={cn(
                "hidden w-full min-w-0 flex-col lg:flex lg:border-t-0",
                isVerifyMasterScreen01
                  ? "h-full min-h-0 bg-slate-50/40 p-6 lg:col-span-4"
                  : "h-full min-h-0 border-t border-[#E5E7EB] bg-[#F8FAFC] p-4 lg:w-auto lg:p-4",
              )}
            >
              <div className="flex w-full flex-col gap-4">
                <div className="border-b border-[#E5E7EB] pb-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
                    QUOTATION REPORT
                  </p>
                </div>
                <VerifyQuestionReasonGuidePanel
                  phase={
                    isAdminVerifyPhase2Screen || isRealEstatePhase2QuestionScreen ? 2 : 1
                  }
                  className="w-full"
                />
                <OfficialTrustZone
                  engine="verify"
                  variant="panel"
                  layout="stitch"
                  className="w-full"
                />
                {hideRealEstateQuestionRailCtas ? null : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled
                    onClick={handleContinueClick}
                    className={selectionPrimaryActionClasses(true)}
                  >
                    내 상황 검토하기 →
                  </button>
                  <button type="button" disabled className={selectionSecondaryActionClasses(true)}>
                    {isAdminVerifyPhase2Screen || isRealEstatePhase2QuestionScreen
                      ? "이 결과 공유하기"
                      : "자세히 보기"}
                  </button>
                  <p className="break-keep text-center text-[11.5px] leading-relaxed text-[#64748B] sm:text-[11px]">
                    모든 질문에 답하면 결과를 확인할 수 있습니다.
                  </p>
                </div>
                )}
              </div>
            </aside>
          ) : null}
        </div>
        {isVerifyMasterStitchLayout && !isVerifyFirstOrPersonalizedResult ? reportCardFooter : null}
      </div>
      )}
    </div>
  );
}
