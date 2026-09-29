"use client";

import { useState, type ReactNode } from "react";
import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  ADMIN_CASE_ENTRY_Q1_LABEL,
  ADMIN_CASE_ENTRY_Q1_OPTION_LABELS,
  CASE_CUSTOMER_INPUT_KEY,
  assessLegacyField,
  buildCaseResolutionProfile,
  CASE01_OPTION_LABELS,
  CASE01_VIOLATION_CONTENT_NOTE_KEY,
  CASE01_FACT_DIFFERENCE_DETAIL_KEY,
  CASE01_DATE_PLACE_DETAIL_KEY,
  CASE01_FACT_COMPARE_GAP_KEY,
  CASE01_DEADLINE_DATE_KEY,
  CASE01_CUSTOMER_RESPONDED_NOTE_KEY,
  CASE01_FACT_RELATIONSHIP_NOTE_KEY,
  deriveStageFromSituation,
  getQ1ResolvedCase,
  getAdminChoiceNoteKey,
  getAdminVerifyPhase1VisibleFields,
  CASE02_NON_PAYMENT_SANCTION_STATED,
  CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR,
  CASE02_DEADLINE_DATE_KEY,
  CASE02_PAYMENT_AMOUNT_DETAIL_KEY,
  case02EffectivePaymentAmount,
  case02NormalizeNonPaymentNoticeValue,
  getCase02FieldOptionLabel,
  getCase03FieldOptionLabel,
  getCase03FieldLabelFromAnswers,
  CASE03_DEADLINE_DATE_KEY,
  CASE03_ATTENDANCE_WHEN_WHERE_KEY,
  CASE03_PREP_ATTENDANCE_DATE_KEY,
  getCase04FieldOptionLabel,
  getCase04FieldLabelFromAnswers,
  CASE04_DEADLINE_DATE_KEY,
  getCase05FieldOptionLabel,
  getCase05FieldLabelFromAnswers,
  effectiveAdminVerifyChoiceSlug,
  adminVerifyFieldHasSlug,
  getCase06FieldOptionLabel,
  CASE03_OPTION_LABELS,
  isCase01Phase1Complete,
  isCase02Phase1Complete,
  isCase03Phase1Complete,
  isAdminVerifyPhase2PathComplete,
  isCase04Phase1Complete,
  isCase05Phase1Complete,
  isCase05DispositionTypeUnclear,
  CASE05_DISPOSITION_TYPE_UNCLEAR,
  case05DispositionTypeIsRightsEnded,
  case05EffectiveDeadline,
  CASE05_DEADLINE_DATE_KEY,
  getCase01EffectiveAuthorityResponse,
  getCase01EffectiveAuthorityResponseNote,
  isCase06Phase1Complete,
  isCase06ExpertTerminal,
  MASTER_CASE_LABELS,
  wasFieldAsked,
  type CaseResolutionProfile,
  type FieldAssessment,
  type MasterCaseId,
} from "@/lib/adminVerifyProfiling";
import { buildAdminVerifyResponseSummaryBlock } from "@/lib/adminVerifyResponseSummary";
import { LAYER_J_CLAUSE_MAP } from "@/lib/adminVerifyJudgmentClauses.data";
import {
  buildPhase1RiskSummaryFromManifest,
  buildPhase2RiskSummaryFromManifest,
  buildPhase2RiskSummaryLinesFromManifest,
  resolveIntegratedSituationFragment,
} from "@/lib/adminVerifyJudgmentRuntime";
import {
  ADMIN_VERIFY_KEY_METRIC_MANIFEST,
  shortenKeyMetricFootnote,
} from "@/lib/adminVerifyKeyMetricManifest";
import {
  buildAdminVerifyClassifiedKeyMetrics,
  resolveAdminVerifyStitchRibbonState,
  resolveKeyMetricBadgeTiers,
  type KeyMetricBadgeTier,
} from "@/lib/adminVerifyKeyMetricsBuild";
import {
  CASE06_ATTENDANCE_NOTICE_TEXT_KEY,
  CASE06_DEADLINE_DATE_KEY,
  CASE06_DISPOSITION_EFFECTIVE_DATE_TEXT_KEY,
  CASE06_PAYMENT_AMOUNT_TEXT_KEY,
  case06DeadlineActionIsByDateSlug,
  case06NeedsDeadlineDate,
  getCase06RequiredActionCandidateLabel,
  isCase06LegacyRestorePath,
  resolveCase06Phase2ChainId,
  buildCase06PrincipleFStateLines,
  isCase06LaunchSimplifiedSession,
} from "@/lib/adminVerifyCase06Redesign";
import { PrimaryButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  buildVerifyFirstResultAiSummary,
  type VerifyFirstResultTransition,
} from "@/lib/verifyPaidTransitionHooks";

export type AdminVerifyKeyMetric = {
  label: string;
  title: string;
  footnote: string;
  status: "ok" | "caution";
};

export type AdminVerifyPersonalizedContext = {
  integratedSituation: string;
  phase1Facts: string[];
  phase2Additions: string[];
  evidenceNote?: string;
  documentsNeededNote: string;
  /** Real-estate Phase 2 personalized — §02 핵심 판단 narrative */
  coreJudgment?: string;
};

export type AdminVerifyFirstResultData = {
  stageLabel: string;
  statusHeadline: string;
  statusTone: "ok" | "caution";
  situationSummary: string;
  gradeFilled: number;
  gradeLabel: string;
  keyMetrics: AdminVerifyKeyMetric[];
  cautions: string[];
  unconfirmed: string[];
  actions: string[];
  /** 입력 답변 기반 1차 자가진단 기준일 — 고정값 사용하지 않음 */
  referenceDateLabel: string;
  caseClassificationLabel: string;
  personalizedContext?: AdminVerifyPersonalizedContext;
  case06ExpertHandoffRequired?: boolean;
  /** 2차 결과 UI — CASE_06 출시 간소화(legacy restore 제외) */
  case06LaunchSimplifiedSession?: boolean;
  /** R03=C — CASE_06 bridge hints above situation summary (same text as question L5). */
  /** Layer A — §01 「응답 요약」 (DI·note·첨부만) */
  adminResponseSummaryLines?: string[];
  /** 2차 Stitch 카드 배지 — 표시 전용 (hasIssues/statusTone 미사용) */
  keyMetricBadgeTiers?: KeyMetricBadgeTier[];
};

function metricFootnote(
  isOk: boolean,
  okText: string,
  cautionText: string,
): string {
  return isOk ? okText : cautionText;
}

function metricFromAssessment(
  assessment: FieldAssessment,
  okText: string,
  issueText: string,
  unknownText: string,
  skippedText: string,
): { footnote: string; status: "ok" | "caution" } {
  if (assessment === "ok") return { footnote: okText, status: "ok" };
  if (assessment === "issue") return { footnote: issueText, status: "caution" };
  if (assessment === "unknown") return { footnote: unknownText, status: "caution" };
  return { footnote: skippedText.trim(), status: "ok" };
}

const FOLLOW_UP_VALUE_LABELS: Record<string, string> = {
  address: "주소·지역 정보가 실제와 다릅니다",
  date: "날짜·기간 정보가 실제와 다릅니다",
  name: "이름·인적사항이 실제와 다릅니다",
  amount: "금액·수치 정보가 실제와 다릅니다",
  translation: "번역본·원본 대조를 하지 못했습니다",
  certification: "공증·인증 여부를 확인하지 못했습니다",
  details: "세부 항목 확인이 어렵습니다",
  situation: "상황 설명이 필요합니다",
  document: "서류 내용 확인이 필요합니다",
  missing: "빠진 내용이 있을 수 있습니다",
  incorrect: "잘못 적힌 내용이 있을 수 있습니다",
  unclear: "어떤 내용을 확인해야 하는지 모르겠습니다",
  signature: "서명·날짜를 확인하지 못했습니다",
  no_original: "원본·번역본이 없습니다",
  unknown_requirements: "어떤 증빙이 필요한지 모릅니다",
  certification_process: "공증·인증 절차가 불명확합니다",
  document_types: "필요 서류 종류를 모릅니다",
  need_review: "형식·증빙 검토가 필요합니다",
  method: "제출 방법을 확인하지 못했습니다",
  documents: "제출 서류를 확인하지 못했습니다",
  online: "온라인 접수 방법을 모릅니다",
  agency: "관할 기관 또는 안내 기관을 확인할 필요가 있습니다.",
  procedure: "제출 절차 정보가 부족합니다",
  target: "제출 대상 서류가 불명확합니다",
  authority: "관할기관을 모릅니다",
  need_guidance: "제출 경로 안내가 필요합니다",
  submit_date: "제출일 또는 제출 마감일을 확인할 필요가 있습니다.",
  validity: "서류 유효기간이 불확실합니다",
  renewal: "갱신·연장 기한이 불확실합니다",
  no_info: "안내 문서에 기한이 없습니다",
  unclear_mark: "기한 표기가 불명확합니다",
  pending_doc: "제출 예정 서류의 기한을 모릅니다",
  renewal_needed: "갱신·연장 필요 여부를 모릅니다",
};

function isInternalFollowUpKey(value: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(value);
}

function followUpValueToCustomerText(value: string, followUpId: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed === "need_review" && followUpId === "deadlineFollowUp") {
    return "기한·유효기간 검토가 필요합니다";
  }
  const mapped = FOLLOW_UP_VALUE_LABELS[trimmed];
  if (mapped) return mapped;
  if (!isInternalFollowUpKey(trimmed)) return trimmed;
  return "추가 확인이 필요한 항목";
}

const CASE01_CONFIRM_GOAL_ACTIONS: Record<string, string> = {
  verify_applicability: "이 통지가 본인 상황에 해당하는지 통지 내용부터 확인해 보세요.",
  verify_violation: "통지 내용과 실제 상황이 같은지 대조해 보세요.",
  fact_difference: "알고 있는 사실과 기관 확인 내용의 차이를 대조해 보세요.",
  why_notice: "통지를 받은 사유와 기관 안내를 확인해 보세요.",
  what_when: "기관이 요구한 행동과 기한을 먼저 확인해 보세요.",
  verify_payment: "납부 요구 내용과 금액·기한을 확인해 보세요.",
  unsure: "통지서 전체 내용을 한 번 더 훑어보세요.",
};

const CASE02_CONFIRM_GOAL_PAYMENT_PROCESSED_CLAUSE_KEY =
  "02|§03·1차|case02_confirmGoal|payment_processed";
const CASE02_CONFIRM_GOAL_PAYMENT_PROCESSED_FULL_CLAUSE_KEY =
  "02|§03·1차|case02_confirmGoal|payment_processed_after_full";

function applyCase02PaymentProcessedFullPhase1JudgmentClause(
  answers: ReviewAnswers,
  summary: string | null,
): string | null {
  if (!summary) return summary;
  if (
    answers.case02_confirmGoal !== "payment_processed" ||
    answers.case02_paymentStatus !== "full"
  ) {
    return summary;
  }
  const from = LAYER_J_CLAUSE_MAP[CASE02_CONFIRM_GOAL_PAYMENT_PROCESSED_CLAUSE_KEY];
  const to = LAYER_J_CLAUSE_MAP[CASE02_CONFIRM_GOAL_PAYMENT_PROCESSED_FULL_CLAUSE_KEY];
  if (!from || !to || !summary.includes(from)) return summary;
  return summary.replace(from, to);
}

const CASE02_CONFIRM_GOAL_ACTIONS: Record<string, string> = {
  verify_obligation: "납부 의무가 본인 상황에 해당하는지 통지 내용부터 확인해 보세요.",
  verify_amount: "통지서에 적힌 금액과 납부 안내를 대조해 보세요.",
  why_pay: "납부 요구의 사유·근거가 적혀 있는 부분을 확인해 보세요.",
  how_when_where: "통지서에 적힌 납부 기한과 방법을 확인해 보세요.",
  payment_processed: "납부 증빙과 기관 반응을 함께 확인해 보세요.",
  unsure: "납부 요구서 전체 내용을 한 번 더 훑어보세요.",
};

function case06ActionsFromAnswers(answers: ReviewAnswers, profile: CaseResolutionProfile): string[] {
  const actions: string[] = [];
  const issue = answers.profilePerceivedIssue;
  const nature = answers.case06_documentNature;
  if (
    issue === "overall_unclear" ||
    issue === "why_received" ||
    nature === "hard_to_classify"
  ) {
    actions.push("문서 제목·발신 기관·주요 문구를 먼저 확인해 보세요.");
  }
  if (issue === "what_to_do" || answers.profileCurrentGoal === "hard_to_tell") {
    actions.push("문서에 적힌 요구 조치·절차를 찾아보세요.");
  }
  if (
    issue === "why_received" ||
    answers.profileDocumentSource === "unknown_agency" ||
    answers.profileDocumentSource === "cannot_identify"
  ) {
    actions.push("발신 기관·연락처가 적혀 있는 부분을 확인해 보세요.");
  }
  if (
    answers.profileAuthorityGuidance === "uncertain" ||
    answers.profileAuthorityGuidance === "not_stated" ||
    answers.profileAuthorityGuidance === "past_possible" ||
    issue === "deadline_unclear"
  ) {
    actions.push("대응·제출 기한이 적혀 있는지 확인해 보세요.");
  }
  if (
    answers.case06_evidence === "no_materials" ||
    answers.case06_evidence === "hard_to_tell"
  ) {
    actions.push("지금 가지고 있는 문서·자료를 먼저 정리해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_01") {
    actions.push("문서에 적힌 문제·위반 내용을 먼저 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_02") {
    actions.push("납부 요구 내용과 금액·기한을 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_03") {
    actions.push("문서에 적힌 출석·소명 요구 내용을 먼저 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_04") {
    actions.push("요구된 보완·추가 제출 내용을 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_05") {
    actions.push("처분·조치 통지 내용을 확인해 보세요.");
  }
  return actions;
}

function appendCase06V11Phase1ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (!isCase06Phase1Complete(answers) || isCase06LegacyRestorePath(answers)) return;
  if (isCase06ExpertTerminal(answers) && isCase06LaunchSimplifiedSession(answers)) {
    return;
  }

  const deadlineText = answers[CASE06_DEADLINE_DATE_KEY]?.trim();
  if (case06NeedsDeadlineDate(answers)) {
    unconfirmed.push("대응·제출 기한");
    actions.push("안내에 적힌 날짜·기한을 직접 적어 두세요.");
  } else if (deadlineText) {
    cautions.push(`적어 둔 기한: ${deadlineText}`);
  } else if (case06DeadlineActionIsByDateSlug(answers.case06_deadlineActionPair)) {
    unconfirmed.push("대응·제출 기한");
  }

  const response = answers.case06_customerResponse;
  if (response === "no_response_yet") {
    cautions.push("아직 기관 안내에 대한 별도 대응이 없는 상태로 응답함");
  } else if (response === "paid_or_attempted_pay") {
    cautions.push("납부 또는 납부 시도가 있었던 상태 — 기관 반응 확인이 필요함");
  }
}

function appendCase06Phase1ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (!isCase06Phase1Complete(answers)) return;

  if (!isCase06LegacyRestorePath(answers)) {
    appendCase06V11Phase1ResultSignals(answers, cautions, unconfirmed, actions);
    return;
  }

  const issue = answers.profilePerceivedIssue;
  const goal = answers.profileCurrentGoal;
  const deadline = answers.profileAuthorityGuidance;
  const nature = answers.case06_documentNature;

  if (nature === "hard_to_classify") {
    unconfirmed.push("문서 성격");
  }
  if (goal === "hard_to_tell") {
    unconfirmed.push("문서가 요구하는 조치");
  }
  if (issue === "overall_unclear") {
    unconfirmed.push("문서 내용·문제 원인");
  }
  if (issue === "why_received") {
    unconfirmed.push("문서를 받은 이유");
  }
  if (issue === "what_to_do") {
    unconfirmed.push("필요한 조치·절차");
  }
  if (issue === "situation_relation") {
    unconfirmed.push("문서와 실제 상황의 관계");
  }
  if (issue === "mismatch_authority") {
    cautions.push("기관 설명과 실제 상황이 다르게 느껴지는 상태로 응답함");
  }
  if (
    answers.profileDocumentSource === "unknown_agency" ||
    answers.profileDocumentSource === "cannot_identify"
  ) {
    unconfirmed.push("발신 기관·연락 대상");
  }
  if (
    deadline === "uncertain" ||
    deadline === "not_stated" ||
    deadline === "past_possible"
  ) {
    unconfirmed.push("대응·제출 기한");
    actions.push("대응·제출 기한이 적혀 있는지 확인해 보세요.");
  }
  if (deadline === "not_checked") {
    actions.push("기한 안내가 있는지 문서를 다시 확인해 보세요.");
  }
}

function appendCase06V11Phase2ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (isCase06LegacyRestorePath(answers)) return;

  const chain = resolveCase06Phase2ChainId(answers);
  if (chain === 1) {
    const nature = answers.case06_paymentNature;
    if (nature === "not_explained") unconfirmed.push("납부 요구 성격");
    if (answers.case06_paymentAmountKnown === "exact_amount_known") {
      const amount = answers[CASE06_PAYMENT_AMOUNT_TEXT_KEY]?.trim();
      if (amount) cautions.push(`안내받은 금액: ${amount}`);
      else unconfirmed.push("납부 금액");
    } else if (answers.case06_paymentAmountKnown === "approx_amount_known") {
      const amount = answers[CASE06_PAYMENT_AMOUNT_TEXT_KEY]?.trim();
      if (amount) cautions.push(`기억나는 대략 금액: ${amount}`);
      else unconfirmed.push("납부 금액");
    } else if (answers.case06_paymentAmountKnown === "conflicting_amounts") {
      const amount = answers[CASE06_PAYMENT_AMOUNT_TEXT_KEY]?.trim();
      if (amount) cautions.push(`안내 받은 금액(정리): ${amount}`);
      else cautions.push("납부 금액이 여러 번 다르게 안내된 상태로 응답함");
    }
    const match = answers.case06_paymentSituationMatch;
    if (match === "amount_or_reason_mismatch" || match === "redemand_after_paid") {
      cautions.push("납부 금액·사유가 실제 상황과 다르게 느껴지는 상태로 응답함");
    }
    if (answers.case06_paymentResponse === "dispute_or_recheck") {
      actions.push("납부 요구에 대한 이의·재확인 요청 내용을 정리해 보세요.");
    }
    if (answers.case06_paymentNonPaymentNotice === "enforcement_warning") {
      cautions.push("미납 시 제재·강제징수 안내를 받은 상태로 응답함");
    }
    return;
  }
  if (chain === 2) {
    if (answers.case06_attendanceFactMatch === "mismatch") {
      cautions.push("출석·설명 요구 내용이 실제 상황과 다르게 느껴지는 상태로 응답함");
    }
    if (answers.case06_attendanceNoticeDetail === "date_place_method_known") {
      const notice = answers[CASE06_ATTENDANCE_NOTICE_TEXT_KEY]?.trim();
      if (notice) cautions.push(`출석·통지 안내: ${notice}`);
      else unconfirmed.push("출석 일시·장소·방식");
    }
    if (answers.case06_attendanceResponse === "no_response") {
      cautions.push("아직 출석·설명하지 않은 상태로 응답함");
    }
    return;
  }
  if (chain === 3) {
    if (answers.case06_submissionReason === "reason_not_explained") unconfirmed.push("보완 요구 사유");
    const rel = answers.case06_submissionRelation;
    if (rel === "insufficient_info" || rel === "mismatch") {
      cautions.push("보완 요구 설명이 실제 상황과 연결되기 어렵다고 응답함");
    }
    if (answers.case06_submissionResponse === "not_submitted_yet") {
      cautions.push("아직 보완·추가 제출을 하지 않은 상태로 응답함");
    }
    return;
  }
  if (chain === 4) {
    const type = answers.case06_dispositionTypeCandidate;
    if (type === "business_suspension" || type === "license_or_registration_revoked") {
      cautions.push("권리·자격에 영향을 주는 처분으로 응답함");
    }
    if (answers.case06_dispositionFactMatch === "mismatch") {
      cautions.push("처분 사유가 실제 상황과 맞지 않는다고 응답함");
    }
    if (answers.case06_dispositionEffectiveDate === "exact_effective_date") {
      const effective = answers[CASE06_DISPOSITION_EFFECTIVE_DATE_TEXT_KEY]?.trim();
      if (effective) cautions.push(`발효일: ${effective}`);
      else unconfirmed.push("처분 발효일");
    }
    if (answers.case06_dispositionResponse === "appeal_or_review_requested") {
      actions.push("이의·재검토 요청 내용과 기관 반응을 함께 확인해 보세요.");
    }
    return;
  }
  if (chain === 5) {
    const recheck = answers.case06_unclearContentRecheck?.trim();
    if (recheck === "signal_violation") {
      const relation = answers.case06_unclearFactRelation;
      if (relation === "unrelated") {
        cautions.push("기관 지적 내용이 실제와 무관하다고 응답함");
      } else if (relation === "partially_related") {
        cautions.push("기관 지적과 실제 상황이 일부만 연결된다고 응답함");
      }
      const response = answers.case06_unclearResponse;
      if (response === "no_action") {
        cautions.push("아직 별도 대응이 없는 상태로 응답함");
      } else if (response === "prepared_docs") {
        cautions.push("설명·자료를 준비한 상태 — 제출·기관 반응 확인이 필요함");
      }
    }
  }
}

function appendCase06Phase2ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (!isCase06LegacyRestorePath(answers)) {
    appendCase06V11Phase2ResultSignals(answers, cautions, unconfirmed, actions);
    return;
  }
  if (answers.case06_exactSource === "cannot_tell") {
    unconfirmed.push("정확한 발신처");
  }
  if (answers.case06_keyPhrase) {
    actions.push("문서에서 가장 먼저 확인하려는 부분을 찾아보세요.");
  }
  if (answers.case06_requiredAction === "hard_to_tell") {
    unconfirmed.push("기관이 요구하는 조치");
  }
  if (answers.case06_receiptPath === "hard_to_recall") {
    unconfirmed.push("문서를 받은 경위");
  }
  if (answers.case06_blockage === "which_authority") {
    unconfirmed.push("연락해야 할 기관");
  }
  if (
    answers.case06_evidence === "no_materials" ||
    answers.case06_evidence === "hard_to_tell"
  ) {
    unconfirmed.push("확인 가능한 자료");
  }
  if (answers.case06_actualCore === "still_unclear") {
    unconfirmed.push("문서의 핵심 내용");
  }
}

function appendCase05Phase1ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (!isCase05Phase1Complete(answers)) return;

  const type = answers.case05_dispositionType;
  const goal = answers.case05_confirmGoal;
  const response = answers.case05_customerResponse;
  const deadline = answers.case05_deadline;

  if (type === "application_denied") {
    actions.push("신청·요청이 거부된 내용과 사유를 확인해 보세요.");
  } else if (case05DispositionTypeIsRightsEnded(type)) {
    cautions.push("허가·자격·권리 중단·취소 조치가 확인된 상태임");
    actions.push("처분 통지서에 적힌 취소·말소 내용을 확인해 보세요.");
  } else if (type === "business_suspended") {
    cautions.push("일정 기간 활동 제한 조치가 확인된 상태임");
    actions.push("처분 통지서에 적힌 정지 범위와 기간을 확인해 보세요.");
  } else if (type === "reason_hard_to_understand") {
    unconfirmed.push("처분 사유");
    actions.push("처분 내용과 사유가 적힌 부분을 함께 확인해 보세요.");
  } else if (type === "situation_mismatch") {
    cautions.push("통지 내용과 실제 상황이 다르게 느껴지는 상태로 응답함");
    actions.push("처분 통지 내용과 실제 상황을 대조해 보세요.");
  } else if (type === "disposition_unclear" || type === CASE05_DISPOSITION_TYPE_UNCLEAR) {
    unconfirmed.push("처분·조치 내용");
    actions.push("처분 통지서 제목·발신·주요 문구를 확인해 보세요.");
  } else if (type === "other") {
    const otherNote = answers[getAdminChoiceNoteKey("case05_dispositionType")]?.trim();
    if (otherNote) {
      cautions.push("통지와 직접 설명이 일치하는지 확인이 필요함");
      actions.push(`${otherNote} — 통지서와 대조해 보세요.`);
    } else {
      unconfirmed.push("직접 설명한 조치 내용");
      actions.push("고객이 적은 조치 설명과 통지서를 대조해 보세요.");
    }
  } else if (type === "unsure") {
    unconfirmed.push("처분·조치 내용");
    actions.push("처분 통지서 제목·발신 기관·주요 문구를 먼저 확인해 보세요.");
  } else if (isCase05DispositionTypeUnclear(type)) {
    unconfirmed.push("처분·조치 내용");
    actions.push("처분 통지서 제목·발신 기관·주요 문구를 먼저 확인해 보세요.");
  }

  if (goal === "understand_reason" || goal === "maintain_reason") {
    actions.push("기관이 안내한 처분 사유가 적혀 있는 부분을 확인해 보세요.");
  } else if (goal === "understand_impact" || goal === "understand_effective") {
    actions.push("처분이 실제로 어떤 영향을 주는지 통지서 내용을 확인해 보세요.");
  } else if (goal === "appeal_possibility") {
    actions.push("이의제기·재검토 관련 안내가 있는지 확인해 보세요.");
  } else if (goal === "what_to_do" || goal === "unsure" || goal === "other") {
    unconfirmed.push("우선 확인할 항목");
  }

  if (response === "none") {
    cautions.push("아직 기관에 설명·자료 제출·재검토 요청을 하지 않은 상태임");
  } else if (response === "explanation_submitted" || response === "documents_submitted") {
    cautions.push("이미 대응 자료를 제출한 상태 — 기관 반응 확인이 필요함");
  } else if (response === "appeal_requested") {
    cautions.push("이의·재검토를 요청한 상태 — 진행 결과 확인이 필요함");
  } else if (response === "inquired") {
    cautions.push("문의만 진행 — 접수·답변 내용 확인이 필요함");
    actions.push("기관 문의 내용과 답변·접수 여부를 확인해 보세요.");
  } else if (response === "other_method") {
    unconfirmed.push("기관에 한 대응 방식");
    actions.push("지금까지 한 대응 내용을 정리해 두세요.");
  }

  const effectiveDeadline = case05EffectiveDeadline(deadline);
  const deadlineDate = answers[CASE05_DEADLINE_DATE_KEY]?.trim();
  if (effectiveDeadline === "specific_date" && deadlineDate) {
    cautions.push("처분 관련 대응 기한이 확인된 상태 — 기한 내 대응이 필요함");
    actions.push(`확인한 대응 기한(${deadlineDate})을 통지서와 대조해 보세요.`);
  } else if (effectiveDeadline === "specific_date" || deadline === "known_date") {
    unconfirmed.push("처분 관련 대응 기한(날짜)");
    actions.push("처분 관련 대응 기한을 적어 두고 통지서와 대조해 보세요.");
  } else if (deadline === "past_possible") {
    cautions.push("기한이 지났을 가능성이 있음 — 즉시 확인이 필요함");
    actions.push("처분 관련 기한과 현재 날짜를 대조해 보세요.");
  } else if (effectiveDeadline === "period_stated") {
    unconfirmed.push("처분 관련 대응 기한(날짜 미상)");
    actions.push("통지서에 적힌 기한 기간·날짜를 다시 확인해 보세요.");
  } else if (effectiveDeadline === "not_stated") {
    unconfirmed.push("처분 통지의 기한 표기");
    actions.push("처분 통지에 기한이 명시되어 있는지 확인해 보세요.");
  } else if (effectiveDeadline === "uncertain" || deadline === "uncertain") {
    unconfirmed.push("처분 관련 대응 기한(날짜)");
    actions.push("통지서에서 날짜를 확인해 보세요.");
  } else if (deadline === "unsure") {
    unconfirmed.push("처분 관련 대응 기한");
    actions.push("기한이 적혀 있는지 확인해 보세요.");
  }
}

function appendCase05Phase2ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  const rel = answers.case05_factRelationship;
  const factDetail = effectiveAdminVerifyChoiceSlug(answers, "case05_factDetail");
  if (rel === "partial") {
    cautions.push("처분 내용과 실제 상황이 일부 다를 수 있음 — 사실관계 확인 필요");
    actions.push(
      factDetail === "date_place_certain" || factDetail === "date_place_fuzzy"
        ? "처분 내용과 당시 날짜·장소를 대조해 보세요."
        : "처분 내용과 실제 상황의 다른 부분을 구체적으로 대조해 보세요.",
    );
  } else if (rel === "mismatch") {
    cautions.push("처분 내용과 실제 상황이 다를 수 있음 — 사실관계 확인 필요");
    actions.push(
      factDetail === "content_differs_clear" || factDetail === "content_differs_vague"
        ? "처분 사유와 실제 사실관계가 다른 부분을 정리해 보세요."
        : "처분 내용과 실제 상황을 대조해 보세요.",
    );
  } else if (rel === "hard_to_judge" || rel === "unknown") {
    unconfirmed.push("처분 내용과 실제 상황의 관계");
  }
  if (factDetail === "date_place_fuzzy") {
    unconfirmed.push("당시 상황 재구성");
    cautions.push("과거 사실 확인이 어려운 상태 — 증빙·기억 정리가 필요함");
  } else if (factDetail === "content_differs_vague") {
    unconfirmed.push("처분 사유와 실제 상황의 차이");
    actions.push("알고 있는 사실만 목록으로 적어 보세요.");
  }

  const dispositionDetail = answers.case05_dispositionDetail;
  if (dispositionDetail === "wording_unclear") {
    unconfirmed.push("처분 문구·범위");
    actions.push("통지서 제목·핵심 문구를 다시 확인해 보세요.");
  } else if (dispositionDetail === "scope_unclear") {
    unconfirmed.push("처분 영향 범위·기간");
    actions.push("정지·제한 범위·기간을 확인해 보세요.");
  } else if (dispositionDetail === "partially_understood") {
    cautions.push("처분 영향을 일부만 이해한 상태");
    actions.push("이해한 부분과 불명확한 부분을 통지서에 표시해 구분해 보세요.");
  } else if (dispositionDetail === "unsure") {
    unconfirmed.push("처분이 주는 실제 영향");
    actions.push("통지서와 함께 영향 요약을 적어 두세요.");
  }

  const explanationDetail = effectiveAdminVerifyChoiceSlug(answers, "case05_explanationDetail");
  if (answers.case05_customerResponse === "explanation_submitted" && explanationDetail) {
    if (
      explanationDetail === "written_no_receipt" ||
      explanationDetail === "written_receipt_ok"
    ) {
      cautions.push("서면 소명·의견 제출 — 접수·기한 확인 필요");
      actions.push("제출본·접수 확인을 해 보세요.");
    } else if (
      explanationDetail === "verbal_no_record" ||
      explanationDetail === "verbal_with_record"
    ) {
      cautions.push("구두·방문 설명 — 기록·확인서 부재 시 재확인 필요");
      actions.push("설명 요지 메모·기관 확인을 해 보세요.");
    } else if (
      explanationDetail === "both_unverified" ||
      explanationDetail === "both_aligned"
    ) {
      cautions.push("서면·구두 병행 — 내용 일치 여부 확인");
      actions.push("서면과 구두 설명을 대조해 보세요.");
    }
  }

  const submittedDocsRaw = answers.case05_submittedDocsDetail;
  if (answers.case05_customerResponse === "documents_submitted" && submittedDocsRaw) {
    if (adminVerifyFieldHasSlug(answers, "case05_submittedDocsDetail", "identity")) {
      actions.push("신분·인적 서류 제출 — 통지 요구 항목과 대조해 보세요.");
    } else if (adminVerifyFieldHasSlug(answers, "case05_submittedDocsDetail", "financial")) {
      actions.push("재무·금액 서류 제출 — 금액·기간 표기와 통지를 대조해 보세요.");
    } else if (adminVerifyFieldHasSlug(answers, "case05_submittedDocsDetail", "certificate")) {
      actions.push("증명서·확인서 제출 — 발급 기관·유효기간을 확인해 보세요.");
    } else if (adminVerifyFieldHasSlug(answers, "case05_submittedDocsDetail", "unsure")) {
      unconfirmed.push("제출 서류 종류");
      actions.push("제출한 파일·접수증부터 정리해 보세요.");
    }
  }

  const appealDetail = effectiveAdminVerifyChoiceSlug(answers, "case05_appealDetail");
  if (answers.case05_customerResponse === "appeal_requested" && appealDetail) {
    if (
      appealDetail === "filed_no_schedule" ||
      appealDetail === "filed_no_receipt" ||
      appealDetail === "filed_schedule_known"
    ) {
      cautions.push("이의·재검토 신청 완료 — 접수·기한·번호 확인");
      actions.push("신청 접수증·기한을 확인해 보세요.");
    } else if (
      appealDetail === "preparing_deadline_unknown" ||
      appealDetail === "preparing_deadline_known"
    ) {
      cautions.push("신청 준비 중 — 기한 초과 위험");
      actions.push("신청 기한·서류 체크리스트를 확인해 보세요.");
    } else if (
      appealDetail === "considering_rules_unread" ||
      appealDetail === "considering_rules_read"
    ) {
      unconfirmed.push("신청 여부·시기");
      actions.push("이의 가능 기한·요건을 통지서에서 확인해 보세요.");
    }
  }

  const plannedNext = answers.case05_plannedNextStep;
  if (plannedNext === "appeal_or_review") {
    cautions.push("이의·재검토를 검토하거나 진행할 계획으로 응답함");
    actions.push("이의·재검토 신청 방법·기한 안내를 통지서에서 확인해 보세요.");
  } else if (plannedNext === "prepare_explanation") {
    actions.push("소명·의견 또는 보완 서류에 필요한 항목을 통지서와 대조해 보세요.");
  } else if (plannedNext === "inquire_authority") {
    actions.push("기관 문의 전에 통지서·처분 사유를 정리해 두세요.");
  } else if (plannedNext === "wait_for_deadline") {
    actions.push("대응 기한까지 남은 일정과 필요한 준비를 확인해 보세요.");
  } else if (plannedNext === "no_concrete_plan" || plannedNext === "unsure") {
    unconfirmed.push("다음 조치 계획");
  }

  const reason = answers.case05_dispositionReason;
  if (reason === "no_clear_reason" || reason === "unsure") {
    unconfirmed.push("처분 사유");
  } else if (reason === "violation_claimed") {
    actions.push("위반·규정 위반으로 적힌 부분과 실제 상황을 대조해 보세요.");
  } else if (reason === "document_issue") {
    actions.push("서류·신청 정보 문제로 지적된 부분을 확인해 보세요.");
  } else if (reason === "requirement_not_met") {
    actions.push("요건·자격 관련 지적 내용을 확인해 보세요.");
  } else if (reason === "deadline_procedure") {
    actions.push("기한·절차 관련 지적 내용과 대응 기한을 함께 확인해 보세요.");
  }

  const followUp = answers.case05_authorityFollowUp;
  if (followUp === "maintained") {
    cautions.push("기관이 처분 유지를 안내함 — 추가 대응 검토가 필요할 수 있음");
    actions.push("이전 대응 내용과 기관의 유지 안내를 함께 확인해 보세요.");
  } else if (followUp === "more_docs" || followUp === "attendance_explanation") {
    cautions.push("처분 후 기관에서 추가 요구가 있음 — 후속 대응 확인 필요");
    actions.push("기관의 추가 요구 내용을 확인해 보세요.");
  } else if (followUp === "no_response") {
    unconfirmed.push("기관 답변·접수 여부");
  } else if (followUp === "under_review") {
    cautions.push("재검토 진행 중 — 결과 확인이 필요함");
  }

  const outcome = answers.case05_dispositionOutcome;
  if (outcome === "maintained") {
    cautions.push("처분이 유지된 상태로 응답함");
  } else if (outcome === "modified") {
    cautions.push("처분 내용이 변경된 안내를 받은 상태임");
    actions.push("변경된 처분 내용이 통지서·안내에 어떻게 반영되었는지 확인해 보세요.");
  } else if (outcome === "revoked") {
    cautions.push("처분이 철회·취소된 안내를 받은 상태임");
    actions.push("철회·취소 안내 문구와 후속 절차를 확인해 보세요.");
  } else if (outcome === "no_result") {
    unconfirmed.push("기관 후속 결과");
  }

  const repeat = answers.case05_repeatFollowUp;
  if (repeat && repeat !== "not_applicable" && repeat !== "unsure") {
    cautions.push("처분 후 추가 대응이 반복됨 — 동일 사건 내 후속 확인 필요");
    actions.push("이전 대응 내용과 기관의 후속 안내를 함께 확인해 보세요.");
  } else if (repeat === "other") {
    unconfirmed.push("반복 대응 내용");
    actions.push("기관이 반복 요구한 내용을 정리해 보세요.");
  }

  const evidence = answers.case05_evidence;
  if (evidence === "disposition_notice") {
    actions.push("처분 통지서 원본을 준비해 두세요.");
  } else if (evidence === "message_email") {
    actions.push("기관 문자·이메일 안내를 확인해 보세요.");
  } else if (evidence === "submitted_docs") {
    actions.push("이미 제출한 서류 목록과 접수 여부를 확인해 보세요.");
  } else if (evidence === "payment_proof") {
    actions.push("납부·영수 증빙과 처분 내용의 연결을 확인해 보세요.");
  } else if (evidence === "photo_video") {
    actions.push("현장·상황 사진·영상과 처분 사유를 대조해 보세요.");
  } else if (evidence === "contract") {
    actions.push("계약·관계 서류와 처분 내용을 함께 확인해 보세요.");
  }

  const finalGoal = answers.case05_finalGoal;
  if (finalGoal === "expert") {
    actions.push("확인한 처분 통지·대응 내역을 정리해 전문가 상담에 활용해 보세요.");
  } else if (finalGoal === "next_action") {
    actions.push("이의·소명 등 다음 대응 절차 안내가 있는지 확인해 보세요.");
  } else if (finalGoal === "evidence") {
    actions.push("필요한 서류·증빙 종류를 통지서와 대조해 보세요.");
  }

  const blockage = answers.case05_blockage;
  if (blockage === "why_disposition") {
    actions.push("처분 사유가 적힌 문구를 확인해 보세요.");
  } else if (blockage === "what_disposition") {
    actions.push("처분·조치 내용이 무엇인지 통지서에서 확인해 보세요.");
  } else if (blockage === "fact_match") {
    actions.push("실제 상황과 처분 사유를 나란히 대조해 보세요.");
  } else if (blockage === "what_to_do") {
    actions.push("통지서에 안내된 우선 조치를 확인해 보세요.");
  } else if (blockage === "appeal_method") {
    actions.push("이의·재검토 신청 방법·기한 안내를 확인해 보세요.");
  } else if (blockage === "deadline") {
    actions.push("대응 기한이 적힌 부분을 확인해 보세요.");
  } else if (blockage === "evidence") {
    actions.push("요구·권장 서류·증빙 종류를 확인해 보세요.");
  } else if (blockage === "next_response") {
    unconfirmed.push("기관의 다음 답변·조치");
  } else if (blockage === "unsure" || blockage === "other") {
    unconfirmed.push("현재 막힌 부분");
  }
}

function case05ActionsFromAnswers(answers: ReviewAnswers, profile: CaseResolutionProfile): string[] {
  const actions: string[] = [];
  const type = answers.case05_dispositionType;
  if (case05DispositionTypeIsRightsEnded(type)) {
    actions.push("처분 통지서에 적힌 취소·말소 내용을 확인해 보세요.");
  }
  if (type === "business_suspended") {
    actions.push("처분 통지서에 적힌 정지 범위와 기간을 확인해 보세요.");
  }
  if (type === "application_denied") {
    actions.push("신청·요청이 거부된 내용과 사유를 확인해 보세요.");
  }
  if (type === "situation_mismatch") {
    actions.push("처분 통지 내용과 실제 상황을 대조해 보세요.");
  }
  if (isCase05DispositionTypeUnclear(type) || type === "unsure") {
    actions.push("처분 통지서 제목·발신 기관·주요 문구를 먼저 확인해 보세요.");
  }
  if (
    answers.case05_factRelationship === "partial" ||
    answers.case05_factRelationship === "mismatch"
  ) {
    actions.push("처분 내용과 실제 상황을 대조해 보세요.");
  }
  if (
    answers.case05_dispositionReason === "no_clear_reason" ||
    answers.case05_dispositionReason === "unsure"
  ) {
    actions.push("기관이 안내한 처분 사유가 적혀 있는 부분을 확인해 보세요.");
  }
  if (
    answers.case05_deadline === "uncertain" ||
    answers.case05_deadline === "unsure" ||
    answers.case05_deadline === "not_stated" ||
    answers.case05_deadline === "period_stated" ||
    answers.case05_deadline === "past_possible"
  ) {
    actions.push("처분과 관련한 기한이 적혀 있는지 확인해 보세요.");
  }
  if (
    answers.case05_repeatFollowUp &&
    answers.case05_repeatFollowUp !== "not_applicable"
  ) {
    actions.push("이전 대응 내용과 기관의 후속 안내를 함께 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_02") {
    actions.push("납부 요구 내용과 금액·기한을 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_03") {
    actions.push("문서에 적힌 출석·소명 요구 내용을 먼저 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_04") {
    actions.push("요구된 보완·추가 제출 내용을 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_06") {
    actions.push("처분 통지서 제목·발신 기관·주요 문구를 먼저 확인해 보세요.");
  }
  return actions;
}

function appendCase04Phase1ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (!isCase04Phase1Complete(answers)) return;

  const target = answers.case04_supplementTarget;
  const goal = answers.case04_confirmGoal;
  const response = answers.case04_customerResponse;
  const deadline = answers.case04_deadline;

  if (target === "unclear") {
    unconfirmed.push("보완 요구 내용");
  } else if (target === "repeat_demand") {
    cautions.push("이미 보완했으나 추가 자료 요구가 있는 상태임");
    actions.push("이전 보완 제출 내용과 이번 추가 요구를 함께 확인해 보세요.");
  } else if (target === "additional_docs") {
    actions.push("기관이 요구한 추가 서류 목록을 확인해 보세요.");
  } else if (target === "modify_existing") {
    actions.push("기관이 지적한 수정 항목을 기존 제출 서류와 대조해 보세요.");
  } else if (target === "add_content_evidence") {
    actions.push("요구된 추가 내용·증빙을 정리해 보세요.");
  }

  if (goal === "understand_materials" || goal === "prepare_materials") {
    actions.push("기관이 요구한 자료와 준비할 내용을 먼저 정리해 보세요.");
  } else if (goal === "understand_insufficient" || goal === "repeat_reason") {
    cautions.push("기존 제출 내용 확인이 우선 목표로 선택됨");
    actions.push("처음 제출한 자료와 보완 요구 내용을 함께 확인해 보세요.");
  } else if (goal === "unsure") {
    unconfirmed.push("우선 확인할 항목");
  }

  if (response === "not_started") {
    cautions.push("아직 보완 자료를 준비하거나 제출하지 않은 상태임");
  } else if (response === "preparing") {
    cautions.push("보완 자료를 준비 중 — 제출 전 요구 내용 재확인이 필요함");
  } else if (response === "submitted") {
    cautions.push("보완 자료를 제출한 상태 — 기관 반응 확인이 필요함");
  }

  if (deadline === "specific_date") {
    const dateText = answers[CASE04_DEADLINE_DATE_KEY]?.trim();
    if (dateText) {
      cautions.push("보완 제출 기한이 확인된 상태 — 기한 내 대응이 필요함");
      actions.push(`확인한 보완 제출 기한(${dateText})을 다시 한번 점검해 보세요.`);
    } else {
      unconfirmed.push("보완 제출 기한 (날짜)");
      actions.push("보완 제출 기한 날짜를 먼저 확인해 보세요.");
    }
  } else if (
    deadline === "uncertain" ||
    deadline === "period_stated" ||
    deadline === "not_stated" ||
    deadline === "unsure"
  ) {
    unconfirmed.push("보완 제출 기한");
    actions.push("보완 제출 기한이 적혀 있는지 확인해 보세요.");
  }
}

function appendCase04Phase2ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  const rel = answers.case04_submissionRelation;
  if (rel === "mismatch_request") {
    cautions.push("이미 제출한 자료를 다시 요구받은 상태로 응답함");
    actions.push("이전 제출 내용과 기관의 추가 요구를 함께 확인해 보세요.");
  } else if (rel === "hard_to_judge") {
    unconfirmed.push("처음 제출 내용과 보완 요구의 관계");
  }

  const reason = answers.case04_supplementReason;
  if (reason === "no_reason" || reason === "unsure") {
    unconfirmed.push("보완이 필요한 이유");
  }

  const followUp = answers.case04_authorityFollowUp;
  if (followUp === "more_supplement" || followUp === "more_docs") {
    cautions.push("보완 제출 후 기관에서 다시 다른 자료를 요구함");
    actions.push("이전 보완 제출 내용과 기관의 추가 요구를 함께 확인해 보세요.");
  } else if (followUp === "receipt_unconfirmed" || followUp === "no_response") {
    unconfirmed.push("기관 답변·접수 여부");
  } else if (followUp === "unsure") {
    unconfirmed.push("기관 후속 반응");
  } else if (followUp === "awaiting_review") {
    cautions.push("보완 제출 후 검토 대기 중 — 진행 상태 확인이 필요함");
  }

  const repeat = answers.case04_repeatSupplement;
  if (repeat && repeat !== "not_applicable") {
    cautions.push("추가 보완 요구가 있음 — 반복 대응 확인 필요");
    actions.push("이전 보완 제출 내용과 기관의 추가 요구를 함께 확인해 보세요.");
  }

  if (answers.case04_initialSubmission === "hard_to_confirm") {
    unconfirmed.push("처음 제출한 내용");
  }

  const addDoc = answers.case04_addDocDetail;
  if (addDoc === "id_doc" || addDoc === "certificate") {
    actions.push("요구된 신분·증명 관련 서류를 통지서와 대조해 보세요.");
  } else if (addDoc === "financial_doc") {
    actions.push("요구된 재무·금액 관련 서류를 준비해 보세요.");
  } else if (addDoc === "translation") {
    actions.push("번역·공증 관련 요구 문구를 확인해 보세요.");
  } else if (addDoc === "unsure") {
    unconfirmed.push("추가로 제출할 서류 종류");
  }

  const modify = answers.case04_modifyDetail;
  if (modify === "name_info" || modify === "date_info" || modify === "amount_info") {
    actions.push("기관이 지적한 수정 항목이 적힌 부분을 기존 서류와 대조해 보세요.");
  } else if (modify === "content_info") {
    actions.push("내용·기재사항 수정 요구를 기존 제출본과 나란히 확인해 보세요.");
  } else if (modify === "unsure") {
    unconfirmed.push("수정해야 할 항목");
  }

  const evidenceDetail = answers.case04_evidenceDetail;
  if (evidenceDetail === "proof_doc" || evidenceDetail === "statement") {
    actions.push("요구된 증빙·소명 자료를 정리해 보세요.");
  } else if (evidenceDetail === "photo") {
    actions.push("요구된 사진·이미지 증빙을 준비해 보세요.");
  } else if (evidenceDetail === "unsure") {
    unconfirmed.push("추가로 제출할 증빙 종류");
  }

  const evidence = answers.case04_evidence;
  if (evidence === "none") {
    unconfirmed.push("확인 가능한 자료·증빙");
  } else if (evidence === "supplement_notice") {
    actions.push("보완 요구서·안내문 원본을 준비해 두세요.");
  } else if (evidence === "original_submission") {
    actions.push("처음 제출했던 서류와 보완 요구 내용을 함께 확인해 보세요.");
  } else if (evidence === "supplement_submission") {
    actions.push("보완 제출본과 기관 반응을 함께 확인해 보세요.");
  } else if (evidence === "message") {
    actions.push("기관 문자·메신저·전화 안내 내역을 확인해 보세요.");
  }
}

function case04ActionsFromAnswers(answers: ReviewAnswers, profile: CaseResolutionProfile): string[] {
  const actions: string[] = [];
  const target = answers.case04_supplementTarget;
  const goal = answers.case04_confirmGoal;
  if (target === "additional_docs") {
    actions.push("기관이 요구한 추가 서류 목록을 확인해 보세요.");
  }
  if (target === "modify_existing") {
    actions.push("기관이 지적한 수정 항목을 기존 제출 서류와 대조해 보세요.");
  }
  if (target === "add_content_evidence") {
    actions.push("요구된 추가 내용·증빙을 정리해 보세요.");
  }
  if (target === "unclear") {
    actions.push("보완 요구 안내에서 무엇을 더 제출해야 하는지 먼저 정리해 보세요.");
  }
  if (target === "repeat_demand") {
    actions.push("이전 보완 제출 내용과 이번 추가 요구를 함께 확인해 보세요.");
  }
  if (goal === "understand_materials" || goal === "prepare_materials") {
    actions.push("기관이 요구한 자료와 준비할 내용을 먼저 정리해 보세요.");
  } else if (goal === "understand_insufficient" || goal === "repeat_reason") {
    actions.push("처음 제출한 자료와 보완 요구 내용을 함께 확인해 보세요.");
  }
  if (
    answers.case04_submissionRelation === "mismatch_request" ||
    answers.case04_submissionRelation === "hard_to_judge"
  ) {
    actions.push("보완 요구 내용과 기존 제출 내용을 대조해 보세요.");
  }
  if (
    answers.case04_deadline === "uncertain" ||
    answers.case04_deadline === "unsure" ||
    answers.case04_deadline === "not_stated" ||
    answers.case04_deadline === "period_stated"
  ) {
    actions.push("보완 제출 기한이 적혀 있는지 확인해 보세요.");
  }
  if (
    answers.case04_repeatSupplement &&
    answers.case04_repeatSupplement !== "not_applicable"
  ) {
    actions.push("이전 보완 제출 내용과 기관의 추가 요구를 함께 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_02") {
    actions.push("납부 요구 내용과 금액·기한을 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_03") {
    actions.push("문서에 적힌 출석·소명 요구 내용을 먼저 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_05") {
    actions.push("처분·조치 통지 내용을 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_06") {
    actions.push("보완 요구서 제목·발신 기관·주요 문구를 먼저 확인해 보세요.");
  }
  return actions;
}

function case03ActionsFromAnswers(answers: ReviewAnswers, profile: CaseResolutionProfile): string[] {
  const actions: string[] = [];
  const demand = answers.case03_authorityDemand;
  const goal = answers.case03_confirmGoal;
  if (demand === "reason_unclear" || demand === "prep_unclear") {
    actions.push("기관이 무엇을 확인하려는지와 준비할 내용을 먼저 정리해 보세요.");
  }
  if (demand === "specific_incident" || demand === "submission_review") {
    actions.push("기관이 확인하려는 사건·제출 내용과 실제 상황을 대조해 보세요.");
  }
  if (demand === "repeat_demand") {
    actions.push("이전에 설명·출석한 내용과 이번 추가 요구를 함께 확인해 보세요.");
  }
  if (goal === "prepare_materials") {
    actions.push("기관이 확인하려는 내용과 준비할 자료를 먼저 정리해 보세요.");
  } else if (goal === "sufficient_explanation" || goal === "repeat_response") {
    actions.push("이전에 전달한 설명·자료와 기관 반응을 함께 확인해 보세요.");
  } else if (goal === "deadline_attendance") {
    actions.push("출석·소명 기한과 방문 방법을 먼저 확인해 보세요.");
  }
  if (
    answers.case03_factRelationship === "partial" ||
    answers.case03_factRelationship === "mismatch"
  ) {
    actions.push("기관이 확인하려는 내용과 실제 상황을 대조해 보세요.");
  }
  if (answers.case03_inquiryFocus === "unsure" || answers.case03_inquiryFocus === "unclear") {
    actions.push("기관이 무엇을 확인하려는지 먼저 정리해 보세요.");
  }
  if (
    answers.case03_deadline === "uncertain" ||
    answers.case03_deadline === "unsure" ||
    answers.case03_deadline === "not_stated" ||
    answers.case03_deadline === "period_stated"
  ) {
    actions.push("출석·소명 기한을 먼저 확인해 보세요.");
  }
  if (
    answers.case03_repeatFollowUp &&
    answers.case03_repeatFollowUp !== "not_applicable"
  ) {
    actions.push("이전 설명·출석 내용과 기관의 추가 요구를 함께 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_02") {
    actions.push("납부 요구 내용과 금액·기한을 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_04") {
    actions.push("요구된 보완·추가 제출 내용을 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_05") {
    actions.push("처분·조치 통지 내용을 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_06") {
    actions.push("문서 제목·발신 기관·주요 문구를 먼저 확인해 보세요.");
  }
  return actions;
}

function appendCase02Phase1ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (!isCase02Phase1Complete(answers)) return;

  const subject = answers.case02_paymentSubject;
  const goal = answers.case02_confirmGoal;
  const status = answers.case02_paymentStatus;
  const deadline = answers.case02_deadline;
  const infoSource = answers.case02_paymentInfoSource;

  if (infoSource === "third_party") {
    cautions.push("다른 사람을 통해 납부 안내를 알게 된 상태임");
  } else if (infoSource === "recall_unclear") {
    unconfirmed.push("납부 안내를 받은 경로");
  }

  if (subject === "unclear") {
    unconfirmed.push("납부 요구 사유");
  } else if (subject === "additional_related") {
    cautions.push("이전 처리와 관련해 추가 납부를 요구받은 상태임");
  }

  if (goal === "verify_obligation" || goal === "why_pay") {
    cautions.push("납부 의무·사유 확인이 우선 목표로 선택됨");
    actions.push("납부 요구 내용과 실제 상황을 대조해 보세요.");
  } else if (goal === "verify_amount") {
    cautions.push("금액 확인이 우선 목표로 선택됨");
    actions.push("통지서에 적힌 금액을 다시 확인해 보세요.");
  } else if (goal === "payment_processed") {
    if (status === "full") {
      cautions.push(
        "납부와 처리 완료를 확인하셨으나 다시 납부 요구를 받으셨습니다. 재요구 사유와 기준을 확인할 필요가 있습니다.",
      );
    } else {
      cautions.push("이미 납부했으나 처리 여부 확인이 필요한 상태임");
    }
    actions.push("납부 증빙과 기관 반응을 함께 확인해 보세요.");
  } else if (goal === "how_when_where") {
    actions.push("통지서에 적힌 납부 기한과 방법을 확인해 보세요.");
  } else if (goal === "unsure") {
    unconfirmed.push("우선 확인할 항목");
  }

  if (status === "not_paid") {
    cautions.push("아직 납부하지 않은 상태임");
  } else if (status === "paid_unverified") {
    cautions.push("납부했으나 기관 처리 여부가 확인되지 않음");
    unconfirmed.push("기관의 납부 처리 결과");
  } else if (status === "partial") {
    cautions.push("일부만 납부한 상태 — 남은 금액 확인 필요");
  } else if (status === "paid_by_other") {
    unconfirmed.push("대리 납부 처리 상태");
  }

  if (deadline === "confirmed") {
    cautions.push("납부 기한이 확인된 상태 — 기한 내 확인이 필요함");
    actions.push("통지서에 적힌 납부 기한을 다시 확인해 보세요.");
  } else if (
    deadline === "uncertain" ||
    deadline === "deadline_mentioned" ||
    deadline === "not_stated" ||
    deadline === "unsure"
  ) {
    unconfirmed.push("납부 기한");
    actions.push("통지서에 적힌 납부 기한을 확인해 보세요.");
  }
}

function appendCase02Phase2ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  const deadlineDate = answers[CASE02_DEADLINE_DATE_KEY]?.trim();
  if (answers.case02_deadline === "confirmed" && deadlineDate) {
    actions.push(`확인한 납부 기한: ${case01TruncateResultDetailText(deadlineDate)}`);
  }

  const amountDetail = answers[CASE02_PAYMENT_AMOUNT_DETAIL_KEY]?.trim();
  if (amountDetail) {
    actions.push(`안내 금액(기억): ${case01TruncateResultDetailText(amountDetail)}`);
  }

  const match = answers.case02_situationMatch;
  if (match === "partial" || match === "not_applicable") {
    cautions.push("납부 요구와 실제 상황이 다르다고 응답함");
    actions.push("납부 요구 내용과 실제 상황을 대조해 보세요.");
  } else if (match === "hard_to_judge" || match === "unknown" || match === "other") {
    unconfirmed.push("납부 요구와 실제 상황의 관계");
  }

  const amount = answers.case02_paymentAmount;
  const amountEffective = case02EffectivePaymentAmount(amount);
  if (amount === "amount_differs") {
    cautions.push("안내 금액과 알고 있는 금액이 다르다고 응답함");
    actions.push("안내 금액과 기존 안내·영수증을 대조해 보세요.");
  } else if (amount === "paid_redemand") {
    cautions.push("이미 납부했거나 일부 납부했는데 다른 금액을 다시 요구받음");
    actions.push("납부 증빙과 기관 반응을 함께 확인해 보세요.");
  } else if (amount === "reason_unclear") {
    unconfirmed.push("납부 사유·근거");
  } else if (
    amount === "other" ||
    amountEffective === "amount_unknown" ||
    amountEffective === CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR
  ) {
    unconfirmed.push("납부 금액·사유");
  }

  const basis = answers.case02_paymentBasis;
  if (basis === "unclear" || basis === "unsure") {
    unconfirmed.push("납부 사유·근거");
  }

  const authorityResponse = answers.case02_authorityResponse;
  if (authorityResponse === "more_required") {
    cautions.push("납부 후 기관에서 추가 자료·설명을 요구함");
    unconfirmed.push("기관이 요구한 추가 대응");
  } else if (authorityResponse === "no_reply_yet") {
    unconfirmed.push("기관 답변");
  } else if (authorityResponse === "procedure_unknown" || authorityResponse === "unclear") {
    unconfirmed.push("현재 진행 중인 절차");
  }

  const method = answers.case02_paymentMethod;
  if (method === "not_stated" || method === "unclear" || method === "unsure") {
    unconfirmed.push("납부 방법");
  }

  const notice = case02NormalizeNonPaymentNoticeValue(answers.case02_nonPaymentNotice);
  if (notice === CASE02_NON_PAYMENT_SANCTION_STATED || notice === "interest_stated") {
    cautions.push("미납 시 추가 조치 안내가 있음 — 기한·내용 확인 필요");
  } else if (notice === "no_notice") {
    unconfirmed.push("미납 시 기관 안내·결과");
  }
}

function appendCase03Phase1ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (!isCase03Phase1Complete(answers)) return;

  const demand = answers.case03_authorityDemand;
  const focus = answers.case03_inquiryFocus;
  const goal = answers.case03_confirmGoal;
  const response = answers.case03_customerResponse;
  const deadline = answers.case03_deadline;

  if (demand === "reason_unclear" || demand === "prep_unclear") {
    unconfirmed.push("기관 요구 내용");
  } else if (demand === "repeat_demand") {
    cautions.push("이미 대응했으나 추가 출석·소명 요구가 있는 상태임");
    actions.push("이전에 설명·출석한 내용과 이번 추가 요구를 함께 확인해 보세요.");
  }

  if (focus === "unclear" || focus === "unsure") {
    unconfirmed.push("기관이 확인하려는 내용");
  } else if (focus === "submitted_docs" || focus === "action_facts") {
    actions.push("기관이 확인하려는 내용과 준비할 자료를 먼저 정리해 보세요.");
  }

  if (goal === "prepare_materials") {
    actions.push("준비할 자료와 우선 확인할 항목을 정리해 보세요.");
  } else if (goal === "sufficient_explanation" || goal === "repeat_response") {
    cautions.push("이전 대응 내용 확인이 우선 목표로 선택됨");
    actions.push("이전에 전달한 설명·자료와 기관 반응을 함께 확인해 보세요.");
  } else if (goal === "deadline_attendance") {
    actions.push("출석·소명 기한과 방문 방법을 먼저 확인해 보세요.");
  } else if (goal === "unsure") {
    unconfirmed.push("우선 확인할 항목");
  }

  if (response === "none") {
    cautions.push("아직 기관에 설명하거나 방문하지 않은 상태임");
  } else if (response === "phone_message" || response === "attendance") {
    cautions.push("이미 일부 대응을 한 상태 — 기관 반응 확인이 필요함");
  } else if (response === "explanation_with_docs") {
    cautions.push("설명과 자료를 제출한 상태 — 기관 처리 여부 확인이 필요함");
  }

  if (deadline === "specific_date") {
    const dateText = answers[CASE03_DEADLINE_DATE_KEY]?.trim();
    if (dateText) {
      cautions.push("출석·소명 기한이 확인된 상태 — 기한 내 대응이 필요함");
      actions.push(`확인한 출석·소명 기한(${dateText})을 다시 한번 점검해 보세요.`);
    } else {
      unconfirmed.push("출석·소명 기한 (날짜)");
      actions.push("출석·소명 기한 날짜를 먼저 확인해 보세요.");
    }
  } else if (
    deadline === "uncertain" ||
    deadline === "period_stated" ||
    deadline === "not_stated" ||
    deadline === "unsure"
  ) {
    unconfirmed.push("출석·소명 기한");
    actions.push("출석·소명 기한을 먼저 확인해 보세요.");
  }
}

function appendCase03Phase2ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  const rel = answers.case03_factRelationship;
  if (rel === "partial" || rel === "mismatch") {
    cautions.push("기관이 확인하려는 내용과 실제 상황이 다르다고 응답함");
    actions.push("기관이 확인하려는 내용과 실제 상황을 대조해 보세요.");
  } else if (rel === "hard_to_judge" || rel === "unknown") {
    unconfirmed.push("기관 확인 내용과 실제 상황의 관계");
  }

  const focus = answers.case03_inquiryFocus;
  if (focus === "unclear" || focus === "unsure") {
    unconfirmed.push("기관이 확인하려는 내용");
  }

  const explanation = answers.case03_explanationDetail;
  if (explanation === "partial_explanation" || explanation === "attended_insufficient") {
    cautions.push("설명·출석이 충분하지 않았다고 응답함");
    unconfirmed.push("추가로 전달할 설명·자료");
  } else if (explanation === "agency_redemand") {
    cautions.push("설명 후 기관에서 다시 다른 내용을 요구함");
    actions.push("이전 설명·자료와 기관의 추가 요구를 함께 확인해 보세요.");
  }

  const followUp = answers.case03_authorityFollowUp;
  if (followUp === "more_explanation" || followUp === "re_attendance" || followUp === "more_docs") {
    cautions.push("기관에서 추가 설명·출석·자료를 다시 요구함");
    unconfirmed.push("기관이 요구한 추가 대응");
  } else if (followUp === "no_response") {
    unconfirmed.push("기관 답변");
  } else if (followUp === "unsure") {
    unconfirmed.push("기관 후속 반응");
  } else if (followUp === "other_procedure") {
    cautions.push("기관이 다른 절차를 안내함 — 요구 내용 확인 필요");
  }

  const prep = answers.case03_prepRequired;
  if (prep === "unknown" || prep === "unsure") {
    unconfirmed.push("준비해야 할 내용");
  } else if (prep === "attendance_only") {
    const prepDate = answers[CASE03_PREP_ATTENDANCE_DATE_KEY]?.trim();
    if (prepDate) {
      actions.push(`준비한 출석·소명 예정일(${prepDate})과 기관 안내를 대조해 보세요.`);
    }
  }

  const repeat = answers.case03_repeatFollowUp;
  if (repeat && repeat !== "not_applicable") {
    cautions.push("추가 설명·출석·자료 요구가 있음 — 반복 대응 확인 필요");
    actions.push("이전 설명·출석 내용과 기관의 추가 요구를 함께 확인해 보세요.");
  }

  const blockage = answers.case03_blockage;
  if (blockage === "what_explain") {
    actions.push("기관에 설명해야 할 내용이 적힌 부분을 확인해 보세요.");
  } else if (blockage === "what_docs") {
    actions.push("요구·권장 서류·증빙 종류를 통지서와 대조해 보세요.");
  } else if (blockage === "why_attend") {
    unconfirmed.push("출석·소명 요구 사유");
    actions.push("출석·소명을 요구한 사유가 적힌 문구를 확인해 보세요.");
  } else if (blockage === "when_attend") {
    actions.push("출석·제출 기한이 적힌 부분을 확인해 보세요.");
  } else if (blockage === "after_explain") {
    unconfirmed.push("설명·제출 후 다음 조치");
    actions.push("설명·제출 후 기관이 안내한 다음 단계를 확인해 보세요.");
  }

  const evidence = answers.case03_evidence;
  if (evidence === "none") {
    unconfirmed.push("확인 가능한 자료·증빙");
  } else if (evidence === "notice") {
    actions.push("출석·소명 요구 통지서 원본을 준비해 두세요.");
  } else if (evidence === "attendance_notice") {
    actions.push("출석 일시·장소 안내를 다시 확인해 보세요.");
    const whenWhere = answers[CASE03_ATTENDANCE_WHEN_WHERE_KEY]?.trim();
    if (whenWhere) {
      actions.push(`확인한 출석 일시·장소: ${whenWhere}`);
    }
  } else if (evidence === "message") {
    actions.push("기관 문자·메신저·전화 안내 내역을 확인해 보세요.");
  } else if (evidence === "submitted_docs") {
    actions.push("이미 제출한 서류·소명서와 접수 여부를 확인해 보세요.");
  }

  const finalGoal = answers.case03_finalGoal;
  if (finalGoal === "understand_demand") {
    actions.push("기관 요구 문구와 본인 상황을 나란히 정리해 보세요.");
  } else if (finalGoal === "prepare_response") {
    actions.push("준비할 설명·서류 목록을 통지서와 대조해 보세요.");
  } else if (finalGoal === "verify_facts") {
    actions.push("기관이 확인하려는 사실과 실제 상황을 대조해 보세요.");
  } else if (finalGoal === "expert") {
    actions.push("확인한 출석·소명 요구와 대응 내역을 정리해 전문가 상담에 활용해 보세요.");
  }
}

function case02ActionsFromAnswers(answers: ReviewAnswers, profile: CaseResolutionProfile): string[] {
  const actions: string[] = [];
  const goal = answers.case02_confirmGoal;
  if (goal && CASE02_CONFIRM_GOAL_ACTIONS[goal]) {
    actions.push(CASE02_CONFIRM_GOAL_ACTIONS[goal]);
  }
  if (
    answers.case02_situationMatch === "partial" ||
    answers.case02_situationMatch === "not_applicable"
  ) {
    actions.push("납부 요구 내용과 실제 상황을 대조해 보세요.");
  }
  const paymentAmountEffective = case02EffectivePaymentAmount(answers.case02_paymentAmount);
  if (
    answers.case02_paymentAmount === "amount_differs" ||
    answers.case02_paymentAmount === "other" ||
    paymentAmountEffective === "amount_unknown" ||
    paymentAmountEffective === CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR
  ) {
    actions.push("안내 받은 금액과 기존 안내·영수증을 대조해 보세요.");
  }
  if (answers.case02_paymentAmount === "paid_redemand") {
    actions.push("납부 증빙과 기관 반응을 함께 확인해 보세요.");
  }
  if (
    answers.case02_deadline === "uncertain" ||
    answers.case02_deadline === "unsure" ||
    answers.case02_deadline === "not_stated"
  ) {
    actions.push("통지서에 적힌 납부 기한을 확인해 보세요.");
  }
  if (
    answers.case02_paymentStatus === "paid_unverified" ||
    answers.case02_authorityResponse === "more_required" ||
    answers.case02_authorityResponse === "no_reply_yet" ||
    answers.case02_authorityResponse === "procedure_unknown" ||
    answers.case02_authorityResponse === "unclear"
  ) {
    actions.push("납부 증빙과 기관 반응을 함께 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_03") {
    actions.push("문서에 적힌 출석·소명 요구 내용을 먼저 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_06") {
    actions.push("납부 요구서 제목·발신 기관·주요 문구를 먼저 확인해 보세요.");
  }
  return actions;
}

function case01Label(value: string | undefined): string | null {
  if (!value) return null;
  return CASE01_OPTION_LABELS[value] ?? value;
}

const CLASSIFIED_CAUTION_ANSWER_VALUES = new Set([
  "unsure",
  "unknown",
  "unclear",
  "partial",
  "mismatch",
  "hard_to_judge",
  "not_stated",
  "not_advised",
  "uncertain",
  "yes_unclear",
  "none",
  "no",
]);

function isClassifiedCasePhase1CompleteForResult(
  q1Case: string,
  answers: ReviewAnswers,
): boolean {
  switch (q1Case) {
    case "CASE_01":
      return isCase01Phase1Complete(answers);
    case "CASE_02":
      return isCase02Phase1Complete(answers);
    case "CASE_03":
      return isCase03Phase1Complete(answers);
    case "CASE_04":
      return isCase04Phase1Complete(answers);
    case "CASE_05":
      return isCase05Phase1Complete(answers);
    case "CASE_06":
      return isCase06Phase1Complete(answers);
    default:
      return false;
  }
}

function classifiedFieldOptionLabel(
  q1Case: string,
  fieldId: string,
  value: string,
  answers?: ReviewAnswers,
): string {
  switch (q1Case) {
    case "CASE_01":
      return CASE01_OPTION_LABELS[value] ?? value;
    case "CASE_02":
      return getCase02FieldOptionLabel(fieldId, value);
    case "CASE_03":
      if (value === "other" && answers) {
        const note = answers[getAdminChoiceNoteKey(fieldId)]?.trim();
        return (
          note ||
          getCase03FieldLabelFromAnswers(fieldId, answers)?.label ||
          getCase03FieldOptionLabel(fieldId, "other")
        );
      }
      return (
        getCase03FieldLabelFromAnswers(fieldId, answers ?? {})?.label ??
        getCase03FieldOptionLabel(fieldId, value)
      );
    case "CASE_04":
      if (value === "other" && answers) {
        const note = answers[getAdminChoiceNoteKey(fieldId)]?.trim();
        return (
          note ||
          getCase04FieldLabelFromAnswers(fieldId, answers)?.label ||
          getCase04FieldOptionLabel(fieldId, "other")
        );
      }
      return (
        getCase04FieldLabelFromAnswers(fieldId, answers ?? {})?.label ??
        getCase04FieldOptionLabel(fieldId, value)
      );
    case "CASE_05":
      if (value === "other" && answers) {
        const note = answers[getAdminChoiceNoteKey(fieldId)]?.trim();
        return note || getCase05FieldOptionLabel(fieldId, "other");
      }
      return getCase05FieldOptionLabel(fieldId, value);
    case "CASE_06":
      return getCase06FieldOptionLabel(fieldId, value);
    default:
      return value;
  }
}

function applyGenericClassifiedCaseKeyMetrics(
  q1Case: string,
  answers: ReviewAnswers,
  keyMetrics: AdminVerifyKeyMetric[],
): AdminVerifyKeyMetric[] {
  const fields = getAdminVerifyPhase1VisibleFields(answers, q1Case);
  const metrics = keyMetrics.map((metric) => ({ ...metric }));
  for (let index = 0; index < 4 && index < fields.length; index += 1) {
    const fieldId = fields[index];
    const value = answers[fieldId]?.trim();
    if (!value) continue;
    const noteKey = getAdminChoiceNoteKey(fieldId);
    const note = answers[noteKey]?.trim();
    const hasCaution = CLASSIFIED_CAUTION_ANSWER_VALUES.has(value);
    metrics[index] = {
      ...metrics[index],
      status: hasCaution ? "caution" : metrics[index].status,
    };
    if (value === "other" && note) {
      metrics[index] = { ...metrics[index], footnote: note };
    }
  }
  return metrics;
}

function appendGenericClassifiedPhase1ResultSignals(
  q1Case: string,
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
): void {
  const fields = getAdminVerifyPhase1VisibleFields(answers, q1Case);
  for (const fieldId of fields) {
    const value = answers[fieldId]?.trim();
    if (!value) continue;
    const label = classifiedFieldOptionLabel(q1Case, fieldId, value, answers);
    if (CLASSIFIED_CAUTION_ANSWER_VALUES.has(value)) {
      if (!unconfirmed.includes(label)) unconfirmed.push(label);
    }
    if (value === "mismatch" || value === "partial" || value === "has_issue") {
      const caution = `${label} — 추가 대조 필요`;
      if (!cautions.includes(caution)) cautions.push(caution);
    }
  }
}

function appendCase01Phase1ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (!isCase01Phase1Complete(answers)) return;

  const violation = answers.case01_violationContent;
  const goal = answers.case01_confirmGoal;
  const responded = answers.case01_customerResponded;
  const deadline = answers.case01_deadline;

  if (violation === "unsure") {
    unconfirmed.push("어떤 부분이 문제라고 하는지");
  } else if (violation === "situation_mismatch") {
    cautions.push("알고 있는 상황과 기관 안내 내용이 다르다고 응답함");
  } else if (violation && violation !== "other") {
    const label = case01Label(violation);
    if (label) actions.push(`응답 기준: ${label}`);
  }

  if (
    goal === "fact_difference" ||
    goal === "verify_violation" ||
    goal === "fit_and_facts"
  ) {
    cautions.push("사실관계 차이 확인이 우선 목표로 선택됨");
    actions.push("알고 있는 사실과 기관 확인 내용을 대조해 보세요.");
  } else if (goal === "what_when" || goal === "what_to_do_now") {
    actions.push("이 통지 후 필요한 대응과 기한을 먼저 확인해 보세요.");
  } else if (goal === "why_and_basis") {
    actions.push("통지·문서에 적힌 근거와 문제라고 하는 부분을 확인해 보세요.");
  } else if (goal === "unsure") {
    unconfirmed.push("우선 확인할 항목");
  }

  const compareGap = answers[CASE01_FACT_COMPARE_GAP_KEY];
  if (compareGap === "gap_notice_incomplete") {
    unconfirmed.push("통지 핵심 문구");
    actions.push("통지서·안내에 적힌 날짜·행동·대상 문구를 다시 확인해 보세요.");
  } else if (compareGap === "gap_memory_timeline") {
    cautions.push("당시 일정·장소 기억이 흐려 사실 대조가 어려운 상태임");
    actions.push("기억나는 일정·장소를 메모하고 통지 내용과 맞춰 보세요.");
  } else if (compareGap === "gap_hearsay_channel") {
    cautions.push("다른 사람을 통해 안내를 알게 된 상태임");
    actions.push("직접 받은 통지·문자·대화가 있는지 확인해 보세요.");
  } else if (compareGap === "gap_records_not_found") {
    actions.push("제출·접수·등록 증빙을 찾아 통지 내용과 대조해 보세요.");
  } else if (compareGap === "gap_language_access") {
    unconfirmed.push("안내 문구 확인");
    actions.push("통지 원문·통역·핵심 문장을 다시 확인해 보세요.");
  }

  const rel = answers.case01_factRelationship;
  if (rel === "deny_with_alibi") {
    cautions.push("지적한 행동을 하지 않았다고 응답함 — 반박 단서 확인이 필요함");
    actions.push("당시 일정·장소·증빙과 통지 내용을 대조해 보세요.");
  } else if (rel === "partial_core_dispute") {
    cautions.push("핵심 사실관계가 다르게 안내된 것으로 응답함");
  }

  if (responded === "none" || responded === "no_contact_yet") {
    cautions.push("아직 기관에 설명하거나 자료를 제출하지 않은 상태임");
    actions.push("통지서 원문과 요구 내용을 먼저 확인해 보세요.");
  } else if (responded === "more_demand") {
    cautions.push("기관에서 추가 대응을 요구한 상태임");
    unconfirmed.push("기관이 요구한 추가 대응 내용");
  } else if (responded === "waiting_response" || responded === "explained_unresolved") {
    unconfirmed.push("기관 답변·후속 안내");
  }

  const deadlineDate = answers[CASE01_DEADLINE_DATE_KEY]?.trim();
  if (
    (deadline === "confirmed" || deadline === "deadline_day_known") &&
    deadlineDate
  ) {
    cautions.push("대응 기한이 확인된 상태 — 기한 내 확인이 필요함");
    actions.push(`확인한 대응 기한(${case01TruncateResultDetailText(deadlineDate)})을 통지서와 대조해 보세요.`);
  } else if (deadline === "confirmed" || deadline === "deadline_day_known") {
    cautions.push("대응 기한이 확인된 상태 — 기한 내 확인이 필요함");
    actions.push("통지서에 적힌 대응 기한을 다시 확인해 보세요.");
  } else if (deadline === "deadline_window_only") {
    unconfirmed.push("대응 기한(구체 일자)");
    actions.push("안내에 적힌 기간·날짜를 다시 확인해 보세요.");
  } else if (deadline === "overdue_concern") {
    cautions.push("기한 경과 가능성에 대한 우려가 있음");
    actions.push("통지서의 기한과 현재 날짜를 대조해 보세요.");
  } else if (
    deadline === "uncertain" ||
    deadline === "not_checked" ||
    deadline === "unknown" ||
    deadline === "unsure" ||
    deadline === "not_stated" ||
    deadline === "not_advised"
  ) {
    unconfirmed.push("통지서 대응 기한");
    actions.push("통지서에 적힌 기한을 확인해 보세요.");
  }
}

function case01TruncateResultDetailText(text: string, maxLen = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen)}…`;
}

function appendCase01Phase2ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  const demand = answers.case01_authorityDemand;
  if (demand === "pay_core_traffic" || demand === "pay_bundled") {
    cautions.push("이번 건 핵심이 납부·벌금 요구로 확인됨");
    actions.push("납부 고지·금액·기한이 이번 위반 통지와 맞는지 대조해 보세요.");
    actions.push("납부 요구 사건(CASE_02) 검토 흐름과 비교해 보세요.");
  } else if (demand === "attend_explain" || demand === "attendance") {
    cautions.push("출석·소명·추가 설명 요구가 핵심으로 확인됨");
    actions.push("출석 일시·장소·준비 자료를 통지·문자와 대조해 보세요.");
    actions.push("출석·소명 사건(CASE_03) 검토 흐름과 비교해 보세요.");
  } else if (demand === "supplement_core" || demand === "supplement") {
    actions.push("보완·재제출 요구가 핵심인지 통지 문구와 대조해 보세요.");
  }

  const actual = answers.case01_actualSituation;
  if (actual === "deny") {
    cautions.push("실제로 해당 행동·상황이 없었다고 정리됨");
    actions.push("반박 단서(일정·사진·동행)와 통지 내용을 함께 대조해 보세요.");
  } else if (actual === "partial" || actual === "partial_similar") {
    cautions.push("일부는 맞지만 전체 상황은 통지·안내와 다르게 정리됨");
    actions.push("어느 부분이 같고 다른지 통지서 문구와 나란히 적어 보세요.");
  } else if (actual === "accept_facts") {
    actions.push("인정한 사실과 기관 안내의 차이가 있는지 통지서와 대조해 보세요.");
  } else if (actual === "unsure") {
    unconfirmed.push("당시 실제 상황 정리");
  }

  const rel = answers.case01_factRelationship;
  if (rel === "deny_with_alibi") {
    cautions.push("지적 행동 부인·알리바이 단서가 Phase2에서도 유지됨");
  } else if (rel === "partial_core_dispute") {
    cautions.push("핵심 사실(누가·무엇·언제) 불일치가 Phase2에서도 유지됨");
  } else if (rel === "deny_action") {
    cautions.push("기관에서 문제라고 보는 행동을 실제로 하지 않았다고 응답함");
    actions.push("당시 상황을 확인할 수 있는 자료와 통지 내용을 대조해 보세요.");
  } else if (rel === "partial_situation" || rel === "partial") {
    cautions.push("행동은 맞지만 기관이 알고 있는 상황과 차이가 있다고 응답함");
  } else if (rel === "date_place_wrong") {
    cautions.push("날짜·장소가 실제 상황과 다르다고 응답함");
  } else if (rel === "info_mismatch") {
    cautions.push("제출·등록 정보와 기관 확인 내용이 다르다고 응답함");
  } else if (rel === "hard_to_explain" || rel === "other") {
    unconfirmed.push("실제 상황과 기관 안내의 차이");
  }

  const compareGap = answers[CASE01_FACT_COMPARE_GAP_KEY];
  if (compareGap === "gap_notice_incomplete") {
    actions.push("통지·안내의 핵심 문구(날짜·행동·대상)를 다시 확인해 보세요.");
  } else if (compareGap === "gap_memory_timeline") {
    actions.push("기억나는 일정·장소를 메모한 뒤 통지 내용과 맞춰 보세요.");
  } else if (compareGap === "gap_records_not_found") {
    actions.push("접수·제출·등록 기록을 찾아 통지 내용과 대조해 보세요.");
  }

  const evidence = answers.case01_evidence;
  if (evidence === "photo_video") {
    cautions.push("사진·영상 등 확인 자료가 응답에 있습니다.");
    actions.push("사진·영상 자료로 당시 일정·장소·행동을 통지 내용과 대조해 보세요.");
  } else if (evidence === "notice") {
    actions.push("보유한 통지·안내 문서의 날짜·행동·요구 문구를 확인해 보세요.");
  } else if (evidence === "message") {
    actions.push("문자·메시지 기록으로 안내 경로와 내용을 대조해 보세요.");
  } else if (evidence === "submitted_docs") {
    actions.push("제출·접수 증빙과 기관이 말하는 내용이 같은지 대조해 보세요.");
  } else if (evidence === "none") {
    unconfirmed.push("확인 가능한 자료");
    cautions.push("관련 자료가 없다고 응답함 — 확보 가능한 증빙을 먼저 정리하는 것이 좋음");
  }

  const blockage = answers.case01_blockage;
  if (blockage === "facts_why") {
    cautions.push("어떤 사실을 어떤 순서로 설명·소명할지 정리가 필요한 상태임");
    actions.push("통지 쟁점·당시 일정·반박 포인트를 순서대로 메모해 보세요.");
  } else if (blockage === "content_unclear") {
    cautions.push("안내 내용을 제 상황에 맞게 이해·정리하기 어려운 상태임");
    actions.push("통지 원문·통역·핵심 문장을 다시 확인해 보세요.");
  } else if (blockage === "how_respond") {
    unconfirmed.push("다음 대응 방법");
    actions.push("통지에 적힌 요구(출석·제출·납부)와 기한을 먼저 확인해 보세요.");
  } else if (blockage === "evidence") {
    unconfirmed.push("준비할 자료 종류");
  }

  const responseDetail = answers.case01_responseDetail;
  if (responseDetail === "disputed_facts") {
    cautions.push("기관에 사실관계 차이를 이미 설명한 경험이 있음");
  } else if (responseDetail === "submitted_materials") {
    actions.push("이전에 제출한 자료와 현재 통지·요구를 대조해 보세요.");
  }

  const authorityResponse = getCase01EffectiveAuthorityResponse(answers);
  if (authorityResponse === "more_required") {
    const responseNote = getCase01EffectiveAuthorityResponseNote(answers);
    if (responseNote) {
      cautions.push("교통국에서 추가 자료·설명을 요구한 상태입니다.");
      unconfirmed.push(
        `추가 요구 내용: ${case01TruncateResultDetailText(responseNote)}`,
      );
    } else {
      cautions.push("기관에서 추가 자료·설명을 요구함");
      unconfirmed.push("기관이 요구한 추가 자료·설명");
    }
  } else if (authorityResponse === "no_reply_yet") {
    unconfirmed.push("기관 답변");
  } else if (authorityResponse === "procedure_unknown") {
    unconfirmed.push("현재 진행 중인 절차");
  } else if (authorityResponse === "re_attendance") {
    cautions.push("기관에서 다시 출석·소명을 요구한 상태임");
  } else if (authorityResponse === "payment_demand") {
    cautions.push("기관 답변에 납부·비용 안내가 포함된 상태임");
  }

  const finalGoal = answers.case01_finalGoal;
  if (finalGoal === "what_deadline" || finalGoal === "situation_fit") {
    actions.push("기한·대응 방법과 상황 해당 여부를 통지서와 함께 확인해 보세요.");
  }
}

function applyKeyMetricManifestSlots(
  caseId: MasterCaseId,
  keyMetrics: AdminVerifyKeyMetric[],
): AdminVerifyKeyMetric[] {
  const slots = ADMIN_VERIFY_KEY_METRIC_MANIFEST[caseId];
  if (!slots) return keyMetrics;
  return keyMetrics.map((metric, index) => ({
    ...metric,
    label: slots[index]?.label ?? metric.label,
    title: slots[index]?.title ?? metric.title,
    footnote: metric.footnote ? shortenKeyMetricFootnote(metric.footnote) : metric.footnote,
  }));
}

function applyCase01PersonalizedKeyMetricTitles(
  keyMetrics: AdminVerifyKeyMetric[],
): AdminVerifyKeyMetric[] {
  return keyMetrics.map((metric, index) => ({
    ...metric,
    label:
      index === 0
        ? "01. 통지·상황"
        : index === 1
          ? "02. 확인 목표"
          : index === 2
            ? "03. 대응·자료"
            : index === 3
              ? "04. 기한·사실관계"
              : metric.label,
    title:
      index === 0
        ? "통지 내용과 실제 상황"
        : index === 1
          ? "우선 확인 목표"
          : index === 2
            ? "대응 이력과 보유 자료"
            : index === 3
              ? "기한·날짜·장소 정리"
              : metric.title,
  }));
}

function applyCase01KeyMetrics(
  answers: ReviewAnswers,
  keyMetrics: AdminVerifyKeyMetric[],
): AdminVerifyKeyMetric[] {
  if (!isCase01Phase1Complete(answers)) return keyMetrics;

  const metrics = keyMetrics.map((metric) => ({ ...metric }));
  const violation = answers.case01_violationContent;
  const goal = answers.case01_confirmGoal;
  const rel = answers.case01_factRelationship;
  const responded = answers.case01_customerResponded;
  const deadline = answers.case01_deadline;

  if (violation) {
    const violationNote = answers[CASE01_VIOLATION_CONTENT_NOTE_KEY]?.trim();
    metrics[0] = {
      ...metrics[0],
      status:
        violation === "unsure" || violation === "situation_mismatch" ? "caution" : "ok",
    };
    if (violation === "other" && violationNote) {
      metrics[0] = { ...metrics[0], footnote: violationNote };
    }
  }

  if (goal) {
    const goalNote = answers[getAdminChoiceNoteKey("case01_confirmGoal")]?.trim();
    metrics[1] = {
      ...metrics[1],
      status: goal === "unsure" || goal === "other" ? "caution" : "ok",
    };
    if (goal === "other" && goalNote) {
      metrics[1] = { ...metrics[1], footnote: goalNote };
    }
  }

  const progressParts: string[] = [];
  const respondedNote = answers[CASE01_CUSTOMER_RESPONDED_NOTE_KEY]?.trim();
  if (responded === "other" && respondedNote) {
    progressParts.push(respondedNote);
  }
  const deadlineDate = answers[CASE01_DEADLINE_DATE_KEY]?.trim();
  if (deadlineDate) progressParts.push(deadlineDate);
  if (progressParts.length > 0) {
    metrics[2] = {
      ...metrics[2],
      footnote: progressParts.join(" · "),
      status:
        responded === "none" ||
        responded === "more_demand" ||
        deadline === "overdue_concern" ||
        deadline === "not_checked" ||
        deadline === "unknown"
          ? "caution"
          : metrics[2].status,
    };
  } else if (responded || deadline) {
    metrics[2] = {
      ...metrics[2],
      status:
        responded === "none" ||
        responded === "more_demand" ||
        deadline === "overdue_concern" ||
        deadline === "not_checked" ||
        deadline === "unknown"
          ? "caution"
          : metrics[2].status,
    };
  }

  if (rel) {
    const relNote = answers[CASE01_FACT_RELATIONSHIP_NOTE_KEY]?.trim();
    metrics[3] = {
      ...metrics[3],
      status:
        rel === "deny_action" ||
        rel === "partial_situation" ||
        rel === "date_place_wrong" ||
        rel === "info_mismatch" ||
        rel === "hard_to_explain" ||
        rel === "other"
          ? "caution"
          : "ok",
    };
    if (rel === "other" && relNote) {
      metrics[3] = { ...metrics[3], footnote: relNote };
    }
  }

  return metrics;
}

function applyCase01Phase2KeyMetrics(
  answers: ReviewAnswers,
  keyMetrics: AdminVerifyKeyMetric[],
): AdminVerifyKeyMetric[] {
  const metrics = keyMetrics.map((metric) => ({ ...metric }));
  const evidence = answers.case01_evidence?.trim();
  if (evidence) {
    const priorFootnote = metrics[2].footnote?.trim();
    const evidenceNote =
      evidence === "none"
        ? "확인 가능한 자료가 없다고 응답했습니다."
        : "대응 이력과 함께 확인 가능한 자료가 응답에 있습니다.";
    metrics[2] = {
      ...metrics[2],
      footnote: priorFootnote ? `${priorFootnote} · ${evidenceNote}` : evidenceNote,
      status: evidence === "none" ? "caution" : "ok",
    };
  }
  const datePlace = answers[CASE01_DATE_PLACE_DETAIL_KEY]?.trim();
  const diffDetail = answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim();
  const deadlineDate = answers[CASE01_DEADLINE_DATE_KEY]?.trim();
  const rel = answers.case01_factRelationship;
  if (datePlace || diffDetail || rel === "date_place_wrong") {
    metrics[3] = {
      ...metrics[3],
      footnote:
        "날짜·장소·사실관계 관련 추가 답변이 정리되었습니다. 통지 내용과의 대조가 필요합니다.",
      status: "caution",
    };
  } else if (deadlineDate) {
    metrics[3] = {
      ...metrics[3],
      footnote: "대응 기한 관련 답변이 정리되었습니다.",
      status: "ok",
    };
  }
  return metrics;
}

function applyCase03KeyMetrics(
  answers: ReviewAnswers,
  keyMetrics: AdminVerifyKeyMetric[],
): AdminVerifyKeyMetric[] {
  if (!isCase03Phase1Complete(answers)) return keyMetrics;

  const metrics = keyMetrics.map((metric, index) => ({
    ...metric,
    label:
      index === 0
        ? "01. 요구·확인 초점"
        : index === 1
          ? "02. 대응·사실관계"
          : index === 2
            ? "03. 증빙·준비"
            : index === 3
              ? "04. 기한·목표"
              : metric.label,
    title:
      index === 0
        ? "기관 요구와 확인 초점"
        : index === 1
          ? "대응 이력·사실관계"
          : index === 2
            ? "자료·준비 상태"
            : index === 3
              ? "기한·검토 목표"
              : metric.title,
  }));

  const demandLabel = getCase03FieldLabelFromAnswers("case03_authorityDemand", answers);
  const focusLabel = getCase03FieldLabelFromAnswers("case03_inquiryFocus", answers);
  if (demandLabel?.label || focusLabel?.label) {
    metrics[0] = {
      ...metrics[0],
      footnote: [demandLabel?.label, focusLabel?.label].filter(Boolean).join(" · "),
      status:
        answers.case03_authorityDemand === "reason_unclear" ||
        answers.case03_authorityDemand === "prep_unclear" ||
        answers.case03_inquiryFocus === "unclear" ||
        answers.case03_inquiryFocus === "unsure"
          ? "caution"
          : "ok",
    };
  }

  const responseLabel = getCase03FieldLabelFromAnswers("case03_customerResponse", answers);
  const relLabel = getCase03FieldLabelFromAnswers("case03_factRelationship", answers);
  const relParts = [responseLabel?.label, relLabel?.label].filter(Boolean);
  if (relParts.length > 0) {
    metrics[1] = {
      ...metrics[1],
      footnote: relParts.join(" · "),
      status:
        answers.case03_customerResponse === "none" ||
        answers.case03_factRelationship === "partial" ||
        answers.case03_factRelationship === "mismatch" ||
        answers.case03_factRelationship === "hard_to_judge"
          ? "caution"
          : "ok",
    };
  }

  const evidenceLabel = getCase03FieldLabelFromAnswers("case03_evidence", answers);
  const prepLabel = getCase03FieldLabelFromAnswers("case03_prepRequired", answers);
  const evidenceParts = [evidenceLabel?.label, prepLabel?.label].filter(Boolean);
  if (evidenceParts.length > 0) {
    metrics[2] = {
      ...metrics[2],
      footnote: evidenceParts.join(" · "),
      status:
        answers.case03_evidence === "none" ||
        answers.case03_prepRequired === "unknown" ||
        answers.case03_prepRequired === "unsure"
          ? "caution"
          : "ok",
    };
  } else if (answers.case03_explanationDetail) {
    const explanationLabel = getCase03FieldLabelFromAnswers("case03_explanationDetail", answers);
    if (explanationLabel?.label) {
      metrics[2] = {
        ...metrics[2],
        footnote: explanationLabel.label,
        status:
          answers.case03_explanationDetail === "partial_explanation" ||
          answers.case03_explanationDetail === "attended_insufficient" ||
          answers.case03_explanationDetail === "agency_redemand"
            ? "caution"
            : "ok",
      };
    }
  }

  const deadlineText = answers[CASE03_DEADLINE_DATE_KEY]?.trim();
  const deadlineLabel = getCase03FieldLabelFromAnswers("case03_deadline", answers);
  const goalLabel = getCase03FieldLabelFromAnswers("case03_finalGoal", answers);
  const deadlineParts = [
    deadlineText ? `기한 ${deadlineText}` : deadlineLabel?.label,
    goalLabel?.label,
  ].filter(Boolean);
  if (deadlineParts.length > 0) {
    metrics[3] = {
      ...metrics[3],
      footnote: deadlineParts.join(" · "),
      status:
        !deadlineText &&
        (answers.case03_deadline === "uncertain" ||
          answers.case03_deadline === "unsure" ||
          answers.case03_deadline === "not_stated")
          ? "caution"
          : "ok",
    };
  }

  return metrics;
}

function applyCase04KeyMetrics(
  answers: ReviewAnswers,
  keyMetrics: AdminVerifyKeyMetric[],
): AdminVerifyKeyMetric[] {
  if (!isCase04Phase1Complete(answers)) return keyMetrics;

  const metrics = keyMetrics.map((metric, index) => ({
    ...metric,
    label:
      index === 0
        ? "01. 보완 요구·목표"
        : index === 1
          ? "02. 제출·대응 이력"
          : index === 2
            ? "03. 자료·증빙"
            : index === 3
              ? "04. 기한·검토 목표"
              : metric.label,
    title:
      index === 0
        ? "보완 요구와 확인 목표"
        : index === 1
          ? "제출·대응 상황"
          : index === 2
            ? "보완 자료·증빙"
            : index === 3
              ? "기한·검토 목표"
              : metric.title,
  }));

  const targetLabel = getCase04FieldLabelFromAnswers("case04_supplementTarget", answers);
  const goalLabel = getCase04FieldLabelFromAnswers("case04_confirmGoal", answers);
  if (targetLabel?.label || goalLabel?.label) {
    metrics[0] = {
      ...metrics[0],
      footnote: [targetLabel?.label, goalLabel?.label].filter(Boolean).join(" · "),
      status:
        answers.case04_supplementTarget === "unclear" ||
        answers.case04_confirmGoal === "unsure"
          ? "caution"
          : "ok",
    };
  }

  const responseLabel = getCase04FieldLabelFromAnswers("case04_customerResponse", answers);
  const relationLabel = getCase04FieldLabelFromAnswers("case04_submissionRelation", answers);
  const initialLabel = getCase04FieldLabelFromAnswers("case04_initialSubmission", answers);
  const responseParts = [responseLabel?.label, relationLabel?.label, initialLabel?.label].filter(
    Boolean,
  );
  if (responseParts.length > 0) {
    metrics[1] = {
      ...metrics[1],
      footnote: responseParts.join(" · "),
      status:
        answers.case04_customerResponse === "not_started" ||
        answers.case04_submissionRelation === "mismatch_request" ||
        answers.case04_submissionRelation === "hard_to_judge"
          ? "caution"
          : "ok",
    };
  }

  const evidenceLabel = getCase04FieldLabelFromAnswers("case04_evidence", answers);
  const addDocLabel = getCase04FieldLabelFromAnswers("case04_addDocDetail", answers);
  const modifyLabel = getCase04FieldLabelFromAnswers("case04_modifyDetail", answers);
  const evidenceDetailLabel = getCase04FieldLabelFromAnswers("case04_evidenceDetail", answers);
  const evidenceParts = [
    evidenceLabel?.label,
    addDocLabel?.label,
    modifyLabel?.label,
    evidenceDetailLabel?.label,
  ].filter(Boolean);
  if (evidenceParts.length > 0) {
    metrics[2] = {
      ...metrics[2],
      footnote: evidenceParts.join(" · "),
      status:
        answers.case04_evidence === "none" || answers.case04_evidence === "unsure"
          ? "caution"
          : "ok",
    };
  } else if (answers.case04_supplementReason) {
    const reasonLabel = getCase04FieldLabelFromAnswers("case04_supplementReason", answers);
    if (reasonLabel?.label) {
      metrics[2] = {
        ...metrics[2],
        footnote: reasonLabel.label,
        status:
          answers.case04_supplementReason === "no_reason" ||
          answers.case04_supplementReason === "unsure"
            ? "caution"
            : "ok",
      };
    }
  }

  const deadlineText = answers[CASE04_DEADLINE_DATE_KEY]?.trim();
  const deadlineLabel = getCase04FieldLabelFromAnswers("case04_deadline", answers);
  const finalGoalLabel = getCase04FieldLabelFromAnswers("case04_finalGoal", answers);
  const deadlineParts = [
    deadlineText ? `기한 ${deadlineText}` : deadlineLabel?.label,
    finalGoalLabel?.label,
  ].filter(Boolean);
  if (deadlineParts.length > 0) {
    metrics[3] = {
      ...metrics[3],
      footnote: deadlineParts.join(" · "),
      status:
        !deadlineText &&
        (answers.case04_deadline === "uncertain" ||
          answers.case04_deadline === "unsure" ||
          answers.case04_deadline === "not_stated")
          ? "caution"
          : "ok",
    };
  }

  return metrics;
}

function applyCase05KeyMetrics(
  answers: ReviewAnswers,
  keyMetrics: AdminVerifyKeyMetric[],
): AdminVerifyKeyMetric[] {
  if (!isCase05Phase1Complete(answers)) return keyMetrics;

  const metrics = keyMetrics.map((metric, index) => ({
    ...metric,
    label:
      index === 0
        ? "01. 처분·확인 목표"
        : index === 1
          ? "02. 대응·사실관계"
          : index === 2
            ? "03. 자료·처분 이유"
            : index === 3
              ? "04. 기한·검토 목표"
              : metric.label,
    title:
      index === 0
        ? "처분 유형과 확인 목표"
        : index === 1
          ? "대응 이력·사실관계"
          : index === 2
            ? "증빙·처분 사유"
            : index === 3
              ? "기한·검토 목표"
              : metric.title,
  }));

  const typeLabel = getCase05FieldLabelFromAnswers("case05_dispositionType", answers);
  const confirmGoalLabel = getCase05FieldLabelFromAnswers("case05_confirmGoal", answers);
  if (typeLabel?.label || confirmGoalLabel?.label) {
    metrics[0] = {
      ...metrics[0],
      footnote: [typeLabel?.label, confirmGoalLabel?.label].filter(Boolean).join(" · "),
      status:
        answers.case05_dispositionType === "unclear" ||
        answers.case05_dispositionType === "unsure" ||
        answers.case05_confirmGoal === "unsure"
          ? "caution"
          : "ok",
    };
  }

  const responseLabel = getCase05FieldLabelFromAnswers("case05_customerResponse", answers);
  const relLabel = getCase05FieldLabelFromAnswers("case05_factRelationship", answers);
  const plannedLabel = getCase05FieldLabelFromAnswers("case05_plannedNextStep", answers);
  const relParts = [responseLabel?.label, relLabel?.label, plannedLabel?.label].filter(Boolean);
  if (relParts.length > 0) {
    metrics[1] = {
      ...metrics[1],
      footnote: relParts.join(" · "),
      status:
        answers.case05_customerResponse === "none" ||
        answers.case05_factRelationship === "partial" ||
        answers.case05_factRelationship === "mismatch"
          ? "caution"
          : "ok",
    };
  }

  const evidenceLabel = getCase05FieldLabelFromAnswers("case05_evidence", answers);
  const reasonLabel = getCase05FieldLabelFromAnswers("case05_dispositionReason", answers);
  const evidenceParts = [evidenceLabel?.label, reasonLabel?.label].filter(Boolean);
  if (evidenceParts.length > 0) {
    metrics[2] = {
      ...metrics[2],
      footnote: evidenceParts.join(" · "),
      status:
        adminVerifyFieldHasSlug(answers, "case05_evidence", "none") ||
        adminVerifyFieldHasSlug(answers, "case05_evidence", "unsure") ||
        answers.case05_dispositionReason === "unsure"
          ? "caution"
          : "ok",
    };
  }

  const deadlineText = answers[CASE05_DEADLINE_DATE_KEY]?.trim();
  const deadlineLabel = getCase05FieldLabelFromAnswers("case05_deadline", answers);
  const finalGoalLabel = getCase05FieldLabelFromAnswers("case05_finalGoal", answers);
  const deadlineParts = [
    deadlineText ? `기한 ${deadlineText}` : deadlineLabel?.label,
    finalGoalLabel?.label,
  ].filter(Boolean);
  if (deadlineParts.length > 0) {
    metrics[3] = {
      ...metrics[3],
      footnote: deadlineParts.join(" · "),
      status:
        !deadlineText &&
        (case05EffectiveDeadline(answers.case05_deadline) === "uncertain" ||
          answers.case05_deadline === "unsure" ||
          answers.case05_deadline === "not_stated")
          ? "caution"
          : "ok",
    };
  }

  return metrics;
}

function case01ActionsFromAnswers(answers: ReviewAnswers, profile: CaseResolutionProfile): string[] {
  const actions: string[] = [];
  const goal = answers.case01_confirmGoal;
  if (goal && CASE01_CONFIRM_GOAL_ACTIONS[goal]) {
    actions.push(CASE01_CONFIRM_GOAL_ACTIONS[goal]);
  }
  if (!isCase01Phase1Complete(answers)) {
    if (
      answers.case01_factRelationship === "mismatch" ||
      answers.case01_factRelationship === "deny_action" ||
      answers.case01_actualSituation === "deny"
    ) {
      actions.push("확인 가능한 자료와 통지 내용을 대조해 보세요.");
    }
    if (
      answers.case01_deadline === "uncertain" ||
      answers.case01_deadline === "unsure" ||
      answers.case01_deadline === "not_stated"
    ) {
      actions.push("통지서에 적힌 기한을 확인해 보세요.");
    }
  }
  if (profile.caseClassification.value === "CASE_02") {
    actions.push("납부 요구 금액·기한·납부 방법을 확인해 보세요.");
  }
  if (profile.caseClassification.value === "CASE_06") {
    actions.push("통지서 제목·발신 기관·주요 문구를 먼저 확인해 보세요.");
  }
  return actions;
}

function defaultActionForSituation(
  situation: string | undefined,
  stage: string | undefined,
): string {
  if (situation === "received_document") {
    return "받은 서류의 요청 내용과 대응 방법을 확인해 보세요.";
  }
  if (situation === "pre_submission") {
    return "제출 전 서류를 한 번 더 훑어보기";
  }
  if (situation === "post_submission_problem") {
    return "현재 상황에 맞는 다음 조치를 정리해 보기";
  }
  if (situation === "unknown_problem" || situation === "unsure") {
    return "문제 원인과 현재 상황을 먼저 확인해 보세요.";
  }
  if (stage === "case") {
    return "현재 상황에 맞는 다음 조치를 정리해 보기";
  }
  return "제출 전 서류를 한 번 더 훑어보기";
}

function appendFollowUpNote(
  answers: ReviewAnswers,
  fieldId: string,
  followUpId: string,
  cautions: string[],
  unconfirmed: string[],
): void {
  const followUp = answers[followUpId]?.trim();
  if (!followUp || !wasFieldAsked(answers, fieldId)) return;
  const customerText = followUpValueToCustomerText(followUp, followUpId);
  if (fieldId === "docs" && answers.docs === "no") {
    cautions.push(`실제 상황과 다른 부분: ${customerText}`);
    return;
  }
  unconfirmed.push(customerText);
}

function formatReferenceDateLabel(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}.${m}`;
}

function situationSummaryFromProfile(
  profile: CaseResolutionProfile,
  situation: string | undefined,
  situationNote: string | undefined,
  hasIssues: boolean,
): string {
  const caseLabel = profile.caseClassification.value
    ? MASTER_CASE_LABELS[profile.caseClassification.value]
    : null;
  const anchor = profile.caseAnchor.value;

  if (situationNote || profile.customerStatement.value) {
    const prefix = anchor ? `입력하신 내용(${anchor})` : "입력하신 상황";
    return hasIssues
      ? `${prefix}을 바탕으로 1차 자가진단한 결과, 일부 항목은 추가 확인이 필요합니다.`
      : `${prefix}을 바탕으로 1차 자가진단한 결과, 현재 확인한 범위에서는 특별히 걸리는 부분이 보이지 않습니다.`;
  }
  if (caseLabel && profile.caseClassification.status !== "unknown") {
    return hasIssues
      ? `현재 파악된 사건 유형(${caseLabel}) 기준으로 보면, 일부 항목은 추가 확인이 필요합니다.`
      : `현재 파악된 사건 유형(${caseLabel}) 기준으로 보면, 확인한 범위에서는 큰 불일치가 보이지 않습니다.`;
  }
  if (situation === "pre_submission") {
    return hasIssues
      ? "제출·계약 전 확인 중이며, 확인한 항목 중 일부는 추가 점검이 필요합니다."
      : "제출·계약 전 확인 중이며, 현재까지 확인한 범위에서는 크게 걸리는 부분이 보이지 않습니다.";
  }
  if (situation === "received_document") {
    return hasIssues
      ? "받은 서류를 검토 중이며, 일부 항목은 추가 확인이 필요합니다."
      : "받은 서류를 검토했으며, 현재 확인한 범위에서는 큰 불일치가 보이지 않습니다.";
  }
  if (situation === "post_submission_problem") {
    return hasIssues
      ? "제출 후 발생한 문제를 점검 중이며, 일부 항목은 추가 확인이 필요합니다."
      : "제출 후 발생한 문제를 점검했으며, 현재까지 확인한 범위에서는 추가로 급한 확인 항목이 보이지 않습니다.";
  }
  if (situation === "unknown_problem" || situation === "unsure") {
    return hasIssues
      ? "문제 원인을 파악하는 단계이며, 몇 가지는 직접 한 번 더 확인해 보시는 편이 좋겠습니다."
      : "문제 원인을 파악하는 단계이며, 현재 확인한 범위에서는 특별히 걸리는 부분이 보이지 않습니다.";
  }
  return hasIssues
    ? "입력하신 내용을 바탕으로 1차 자가진단한 결과, 몇 가지는 직접 한 번 더 확인해 보시는 편이 좋겠습니다."
    : "입력하신 내용을 바탕으로 1차 자가진단한 결과, 현재 확인한 범위에서는 특별히 걸리는 부분이 보이지 않습니다.";
}

const DEADLINE_UNCONFIRMED_CANONICAL = "처분·대응 기한(날짜 확인 필요)";

function dedupeAdminVerifyResultUnconfirmed(items: string[]): string[] {
  const out: string[] = [];
  let deadlineClusterUsed = false;
  const isDeadlineCluster = (item: string) =>
    /기한/.test(item) &&
    (/불명|미상|날짜가 불명확|날짜\)/.test(item) || item.includes(DEADLINE_UNCONFIRMED_CANONICAL));

  for (const item of items) {
    if (isDeadlineCluster(item)) {
      if (deadlineClusterUsed) continue;
      deadlineClusterUsed = true;
      out.push(DEADLINE_UNCONFIRMED_CANONICAL);
      continue;
    }
    if (!out.includes(item)) out.push(item);
  }
  return out;
}

export function buildAdminVerifyFirstResult(answers: ReviewAnswers): AdminVerifyFirstResultData {
  const profile = buildCaseResolutionProfile(answers);
  const stage = answers.stage || deriveStageFromSituation(answers.situation);
  const situation = answers.situation;
  const situationNote = answers.situationNote?.trim();

  const docsAssessment = assessLegacyField(answers, "docs", answers.docs);
  const contentAssessment = assessLegacyField(answers, "contentCheck", answers.contentCheck);
  const formatAssessment = assessLegacyField(answers, "formatProofCheck", answers.formatProofCheck);
  const submissionAssessment = assessLegacyField(answers, "submissionCheck", answers.submissionCheck);
  const deadlineAssessment = assessLegacyField(answers, "deadline", answers.deadline);

  const cautions: string[] = [];
  const unconfirmed: string[] = [];
  const actions: string[] = [];

  if (docsAssessment === "issue") cautions.push("실제 상황과 다른 부분 확인 필요");
  else if (docsAssessment === "unknown") unconfirmed.push("서류 내용과 실제 상황 대조");

  if (contentAssessment === "issue") cautions.push("서류 내용 누락·오류 확인 필요");
  else if (contentAssessment === "unknown") unconfirmed.push("서류 내용");

  if (formatAssessment === "issue") cautions.push("일부 증빙 확인 필요");
  else if (formatAssessment === "unknown") unconfirmed.push("필요한 증빙");

  if (submissionAssessment === "issue") cautions.push("제출 방법 확인 필요");
  else if (submissionAssessment === "unknown") unconfirmed.push("제출방법");

  if (deadlineAssessment === "issue") cautions.push("제출기한 확인 필요");
  else if (deadlineAssessment === "unknown") unconfirmed.push("제출기한");

  if (answers.profileProblemType === "rejected") {
    cautions.push("반려·보완 요청에 대한 대응 확인 필요");
  }
  if (answers.profileAuthorityGuidance === "yes_unclear") {
    unconfirmed.push("기관·상대방 안내 내용");
  }
  if (answers.profileAuthorityGuidance === "no") {
    unconfirmed.push("기관·상대방 안내");
  }
  if (answers.profilePerceivedIssue === "unknown") {
    unconfirmed.push("문제 원인");
  }

  for (const signal of profile.riskSignals) {
    if (!cautions.includes(signal)) cautions.push(signal);
  }
  for (const item of profile.unknown) {
    if (!unconfirmed.includes(item)) unconfirmed.push(item);
  }

  appendFollowUpNote(answers, "docs", "docsFollowUp", cautions, unconfirmed);
  appendFollowUpNote(answers, "contentCheck", "contentCheckFollowUp", cautions, unconfirmed);
  appendFollowUpNote(answers, "formatProofCheck", "formatProofFollowUp", cautions, unconfirmed);
  appendFollowUpNote(answers, "submissionCheck", "submissionFollowUp", cautions, unconfirmed);
  appendFollowUpNote(answers, "deadline", "deadlineFollowUp", cautions, unconfirmed);

  if (docsAssessment === "issue" || docsAssessment === "unknown") {
    actions.push("서류 내용과 실제 상황이 같은지 확인");
  }
  if (formatAssessment === "issue" || formatAssessment === "unknown") {
    actions.push("필요한 증빙이 모두 준비되었는지 확인");
  }
  if (
    submissionAssessment === "issue" ||
    submissionAssessment === "unknown" ||
    deadlineAssessment === "issue" ||
    deadlineAssessment === "unknown"
  ) {
    actions.push("제출기한과 접수 방법 확인");
  }
  if (answers.profileCurrentGoal === "deadline" || answers.profileProblemType === "deadline") {
    actions.push("기한·유효기간을 먼저 확인");
  }
  const q1Case = getQ1ResolvedCase(answers);
  const case01Active =
    q1Case === "CASE_01" ||
    Boolean(answers.case01_violationContent || answers.case01_confirmGoal || answers._case01Active === "1");
  const case02Active =
    q1Case === "CASE_02" ||
    Boolean(answers.case02_paymentSubject || answers.case02_confirmGoal || answers._case02Active === "1");
  const case03Active =
    q1Case === "CASE_03" ||
    Boolean(
      answers.case03_authorityDemand || answers.case03_confirmGoal || answers._case03Active === "1",
    );
  const case04Active =
    q1Case === "CASE_04" ||
    Boolean(
      answers.case04_supplementTarget || answers.case04_confirmGoal || answers._case04Active === "1",
    );
  const case05Active =
    q1Case === "CASE_05" ||
    Boolean(
      answers.case05_dispositionType || answers.case05_confirmGoal || answers._case05Active === "1",
    );
  const case06Active =
    q1Case === "CASE_06" ||
    Boolean(
      answers.case06_requiredActionCandidate ||
        (answers.profilePerceivedIssue &&
          answers.profileDocumentSource &&
          answers.case06_documentNature) ||
        answers._case06Active === "1",
    );

  if (case02Active) {
    for (const action of case02ActionsFromAnswers(answers, profile)) {
      if (!actions.includes(action)) actions.push(action);
    }
    if (isCase02Phase1Complete(answers)) {
      appendCase02Phase1ResultSignals(answers, cautions, unconfirmed, actions);
    }
  } else if (case03Active) {
    for (const action of case03ActionsFromAnswers(answers, profile)) {
      if (!actions.includes(action)) actions.push(action);
    }
    if (isCase03Phase1Complete(answers)) {
      appendCase03Phase1ResultSignals(answers, cautions, unconfirmed, actions);
    }
  } else if (case04Active) {
    for (const action of case04ActionsFromAnswers(answers, profile)) {
      if (!actions.includes(action)) actions.push(action);
    }
    if (isCase04Phase1Complete(answers)) {
      appendCase04Phase1ResultSignals(answers, cautions, unconfirmed, actions);
    }
  } else if (case05Active) {
    for (const action of case05ActionsFromAnswers(answers, profile)) {
      if (!actions.includes(action)) actions.push(action);
    }
    if (isCase05Phase1Complete(answers)) {
      appendCase05Phase1ResultSignals(answers, cautions, unconfirmed, actions);
    }
  } else if (case06Active) {
    for (const action of case06ActionsFromAnswers(answers, profile)) {
      if (!actions.includes(action)) actions.push(action);
    }
    if (isCase06Phase1Complete(answers)) {
      appendCase06Phase1ResultSignals(answers, cautions, unconfirmed, actions);
    }
  } else if (case01Active) {
    for (const action of case01ActionsFromAnswers(answers, profile)) {
      if (!actions.includes(action)) actions.push(action);
    }
    if (isCase01Phase1Complete(answers)) {
      appendCase01Phase1ResultSignals(answers, cautions, unconfirmed, actions);
    }
  }
  if (actions.length === 0) {
    actions.push(defaultActionForSituation(situation, stage));
  }

  const case04FactMetric: FieldAssessment =
    answers.case04_submissionRelation === "add_missing" ||
    answers.case04_submissionRelation === "modify_content" ||
    answers.case04_submissionRelation === "support_existing"
      ? "ok"
      : answers.case04_submissionRelation === "mismatch_request"
        ? "issue"
        : answers.case04_submissionRelation === "hard_to_judge" ||
            answers.case04_submissionRelation === "unknown"
          ? "unknown"
          : docsAssessment;

  const case03FactMetric: FieldAssessment =
    answers.case03_factRelationship === "match"
      ? "ok"
      : answers.case03_factRelationship === "partial"
        ? "issue"
        : answers.case03_factRelationship === "mismatch"
          ? "issue"
          : answers.case03_factRelationship
            ? "unknown"
            : docsAssessment;

  const case02FactMetric: FieldAssessment =
    answers.case02_situationMatch === "match"
      ? "ok"
      : answers.case02_situationMatch === "partial" ||
          answers.case02_situationMatch === "not_applicable"
        ? "issue"
        : answers.case02_situationMatch
          ? "unknown"
          : docsAssessment;

  const case01FactMetric: FieldAssessment =
    answers.case01_factRelationship === "match"
      ? "ok"
      : answers.case01_factRelationship === "mismatch" ||
          answers.case01_factRelationship === "partial" ||
          answers.case01_factRelationship === "date_place_wrong" ||
          answers.case01_factRelationship === "deny_action" ||
          answers.case01_factRelationship === "partial_situation" ||
          answers.case01_factRelationship === "info_mismatch"
        ? "issue"
        : answers.case01_factRelationship
          ? "unknown"
          : docsAssessment;

  const case05FactMetric: FieldAssessment =
    answers.case05_factRelationship === "match"
      ? "ok"
      : answers.case05_factRelationship === "partial" || answers.case05_factRelationship === "mismatch"
        ? "issue"
        : answers.case05_factRelationship
          ? "unknown"
          : docsAssessment;

  const factMetric = case02Active
    ? case02FactMetric
    : case03Active
      ? case03FactMetric
      : case04Active
        ? case04FactMetric
        : case05Active
          ? case05FactMetric
          : case01Active
            ? case01FactMetric
            : docsAssessment;

  let docsOkText = "서류 내용과 실제 상황이 일치한다고 확인했습니다";
  let docsIssueText = "통지 내용과 실제 상황이 다르다고 응답 — 대조 필요";
  let docsUnknownText = "통지 내용과 실제 상황 비교가 필요합니다";
  if (case05Active) {
    docsOkText = "처분 내용과 실제 상황이 같다고 응답했습니다";
    docsIssueText = "처분 내용과 실제 상황이 다를 수 있음 — 대조 필요";
    docsUnknownText = "처분 내용과 실제 상황 비교가 필요합니다";
  } else if (case04Active) {
    docsOkText = "보완 요구와 기존 제출 내용의 관계가 확인되었습니다";
    docsIssueText = "보완 요구와 기존 제출 내용이 다를 수 있음 — 대조 필요";
    docsUnknownText = "보완 요구와 기존 제출 내용 비교가 필요합니다";
  } else if (case03Active) {
    docsOkText = "기관이 확인하려는 내용과 실제 상황이 같다고 응답했습니다";
    docsIssueText = "기관이 확인하려는 내용과 실제 상황이 다르다고 응답 — 대조 필요";
    docsUnknownText = "기관이 확인하려는 내용과 실제 상황 비교가 필요합니다";
  } else if (case02Active) {
    docsOkText = "납부 요구와 실제 상황이 맞는다고 응답했습니다";
    docsIssueText = "납부 요구와 실제 상황이 다르다고 응답 — 대조 필요";
    docsUnknownText = "납부 요구와 실제 상황 비교가 필요합니다";
  } else if (case01Active && answers.case01_factRelationship === "match") {
    docsOkText = "통지 내용과 실제 상황이 같다고 응답했습니다";
  }

  const docsMetric = metricFromAssessment(
    factMetric,
    docsOkText,
    docsIssueText,
    docsUnknownText,
    "",
  );
  const contentMetric = metricFromAssessment(
    contentAssessment,
    "기본 서류 내용 확인",
    "서류 내용 누락·오류 확인 필요",
    "서류 내용 추가 확인 필요",
    "",
  );
  const formatMetric = metricFromAssessment(
    formatAssessment,
    "형식·증빙 확인",
    "일부 증빙 확인 필요",
    "형식·증빙 추가 확인 필요",
    "",
  );
  const submissionDeadlineAssessment: FieldAssessment =
    submissionAssessment === "not_assessed" && deadlineAssessment === "not_assessed"
      ? "not_assessed"
      : submissionAssessment === "issue" || deadlineAssessment === "issue"
        ? "issue"
        : submissionAssessment === "unknown" || deadlineAssessment === "unknown"
          ? "unknown"
          : submissionAssessment === "ok" && deadlineAssessment === "ok"
            ? "ok"
            : "unknown";
  const submissionMetric = metricFromAssessment(
    submissionDeadlineAssessment,
    "제출기관·방법·기한 확인",
    "제출 경로·기한 추가 확인 필요",
    "제출 경로·기한 추가 확인 필요",
    "",
  );

  let keyMetrics: AdminVerifyKeyMetric[] = [
    {
      label: "01. 현황 대조",
      title: "실제 상황과 서류",
      footnote: docsMetric.footnote,
      status: docsMetric.status,
    },
    {
      label: "02. 내용 기재",
      title: "서류 내용 및 기재",
      footnote: contentMetric.footnote,
      status: contentMetric.status,
    },
    {
      label: "03. 공증 및 영사",
      title: "형식 · 증빙",
      footnote: formatMetric.footnote,
      status: formatMetric.status,
    },
    {
      label: "04. 접수처 기준",
      title: "제출처 · 기한",
      footnote: submissionMetric.footnote,
      status: submissionMetric.status,
    },
  ];

  if (
    q1Case &&
    q1Case !== "UNIVERSAL" &&
    isClassifiedCasePhase1CompleteForResult(q1Case, answers)
  ) {
    keyMetrics = buildAdminVerifyClassifiedKeyMetrics(q1Case as MasterCaseId, answers);
  }

  keyMetrics = keyMetrics.filter((metric) => metric.footnote?.trim());

  if (
    q1Case &&
    q1Case !== "UNIVERSAL" &&
    q1Case !== "CASE_01" &&
    q1Case !== "CASE_06" &&
    isClassifiedCasePhase1CompleteForResult(q1Case, answers)
  ) {
    appendGenericClassifiedPhase1ResultSignals(q1Case, answers, cautions, unconfirmed);
  }

  const hasMetricCaution = keyMetrics.some((metric) => metric.status === "caution");
  const hasIssues = cautions.length > 0 || unconfirmed.length > 0 || hasMetricCaution;
  const classifiedPhase1ManifestSummary =
    q1Case &&
    q1Case !== "UNIVERSAL" &&
    (q1Case === "CASE_01"
      ? isCase01Phase1Complete(answers)
      : isClassifiedCasePhase1CompleteForResult(q1Case, answers))
      ? applyCase02PaymentProcessedFullPhase1JudgmentClause(
          answers,
          buildPhase1RiskSummaryFromManifest(answers, profile),
        )
      : null;
  const situationSummary =
    classifiedPhase1ManifestSummary ??
    situationSummaryFromProfile(profile, situation, situationNote, hasIssues);

  const stageLabel =
    stage === "prevent" ? "사전 검토" : stage === "case" ? "사후 검토" : "검토";

  const caseClassId = profile.caseClassification.value ?? "UNIVERSAL";
  const responseSummaryBlock = buildAdminVerifyResponseSummaryBlock(answers);
  const adminResponseSummaryLines =
    responseSummaryBlock.length > 0 ? responseSummaryBlock : undefined;

  if (
    q1Case === "CASE_06" &&
    isCase06ExpertTerminal(answers) &&
    isCase06LaunchSimplifiedSession(answers)
  ) {
    const stateLines = buildCase06PrincipleFStateLines(answers);
    const expertReason =
      "안내·문서에 여러 종류의 요구가 섞여 있거나, 무엇을 먼저 해야 할지 한 가지로 특정하기 어렵다고 응답하셨습니다. 이 상태에서는 자동 판단 대신 VFBCAI 전문가팀이 자료와 입력 내용을 함께 확인하는 것이 안전합니다.";
    return {
      stageLabel,
      statusHeadline: "입력하신 내용을 바탕으로 정리했습니다",
      statusTone: "caution" as const,
      situationSummary:
        stateLines.length > 0 ? stateLines.join(" ") : expertReason,
      gradeFilled: 2,
      gradeLabel: "전문가 확인 권장",
      keyMetrics,
      cautions: [expertReason],
      unconfirmed: [],
      actions: [],
      referenceDateLabel: formatReferenceDateLabel(),
      caseClassificationLabel: MASTER_CASE_LABELS[caseClassId],
      adminResponseSummaryLines,
      case06ExpertHandoffRequired: true,
    };
  }

  return {
    stageLabel,
    statusHeadline: hasIssues
      ? "확인이 필요한 부분이 있습니다"
      : "현재 확인한 범위에서는 큰 문제가 보이지 않습니다",
    statusTone: hasIssues ? "caution" : "ok",
    situationSummary,
    gradeFilled: hasIssues ? 2 : 1,
    gradeLabel: hasIssues ? "주의 요망 (2단계)" : "양호 (1단계)",
    keyMetrics,
    cautions: [...new Set(cautions)].slice(0, 4),
    unconfirmed: dedupeAdminVerifyResultUnconfirmed([...new Set(unconfirmed)]).slice(0, 4),
    actions: [...new Set(actions)].slice(0, 3),
    referenceDateLabel: formatReferenceDateLabel(),
    caseClassificationLabel: MASTER_CASE_LABELS[caseClassId],
    adminResponseSummaryLines,
  };
}

const CASE01_PHASE1_SUMMARY_FIELDS: { key: string; label: string }[] = [
  { key: "case01_violationContent", label: "통지서에는 어떤 문제나 위반이 있었다고 적혀 있나요?" },
  { key: "case01_factRelationship", label: "통지서에 적힌 내용과 실제 상황은 어떻게 다른가요?" },
  { key: "case01_authorityDemand", label: "기관에서는 이 통지를 받은 뒤 무엇을 하라고 안내했나요?" },
  { key: "case01_customerResponded", label: "이 통지를 받은 뒤 이미 어떤 대응을 하셨나요?" },
  { key: "case01_deadline", label: "통지서에 언제까지 대응해야 하는지 적혀 있나요?" },
];

const CASE01_PHASE2_SUMMARY_FIELDS: { key: string; label: string }[] = [
  { key: "case01_blockage", label: "지금 가장 확인하기 어려운 부분은 무엇인가요?" },
  { key: "case01_evidence", label: "지금 확인할 수 있는 자료가 있나요?" },
];

export function formatCase01AnswerSummary(answers: ReviewAnswers): string {
  const parts: string[] = [];
  const q1 = answers[ADMIN_CASE_ENTRY_Q1_KEY];
  if (q1) {
    const q1Label = ADMIN_CASE_ENTRY_Q1_OPTION_LABELS[q1] ?? q1;
    parts.push(`${ADMIN_CASE_ENTRY_Q1_LABEL} ${q1Label}`);
  }
  for (const field of CASE01_PHASE1_SUMMARY_FIELDS) {
    const value = answers[field.key];
    if (!value) continue;
    const answerLabel = CASE01_OPTION_LABELS[value] ?? value;
    parts.push(`${field.label} ${answerLabel}`);
  }
  for (const field of CASE01_PHASE2_SUMMARY_FIELDS) {
    const value = answers[field.key];
    if (!value) continue;
    const answerLabel = CASE01_OPTION_LABELS[value] ?? value;
    parts.push(`${field.label} ${answerLabel}`);
  }
  return parts.join(" · ");
}

export function buildAdminVerifyCase01PersonalizedResult(
  answers: ReviewAnswers,
): AdminVerifyFirstResultData {
  return buildAdminVerifyPersonalizedResult(answers);
}

const DOCUMENTS_NEEDED_NOTE =
  "현재 답변만으로 기본적인 상황은 확인할 수 있습니다. 다만 통지서의 실제 내용·금액·기한·기관의 요구사항까지 정확하게 검토하려면 관련 자료가 필요합니다.";

function joinNarrative(parts: Array<string | null | undefined>): string {
  return parts.filter((part): part is string => Boolean(part?.trim())).join(" ");
}

function describeCustomerResponseNone(): string {
  return "아직 기관에 설명하거나 자료를 제출한 대응은 없으며";
}

function describeCustomerResponseActive(label: string): string {
  return `이미 ${label} 대응을 한 상태이며`;
}

function describeDeadlineConfirmed(): string {
  return "대응해야 할 날짜는 확인된 상태입니다.";
}

function describeDeadlineUncertain(): string {
  return "대응 기한은 아직 명확히 확인되지 않았습니다.";
}

function describeDeadlineOverdueConcern(): string {
  return "기한 경과 가능성에 대한 우려가 있는 상태입니다.";
}

const CASE01_CONFIRM_GOAL_OPENING: Record<string, string> = {
  fit_and_facts:
    "현재는 내 상황에 해당하는지와 사실·날짜·행동이 맞는지부터 확인할 필요가 있는 상태입니다.",
  why_and_basis:
    "현재는 왜 이런 통지·판단이 나왔는지와 근거·기록을 먼저 확인할 필요가 있는 상태입니다.",
  what_to_do_now:
    "현재는 지금 무엇을·언제까지·어떻게 해야 하는지부터 확인할 필요가 있는 상태입니다.",
  after_my_response:
    "현재는 이미 한 대응의 결과와 다음 절차·재요구를 먼저 확인할 필요가 있는 상태입니다.",
  verify_applicability:
    "현재는 이 통지가 실제 본인 상황에 해당하는지 먼저 확인할 필요가 있는 상태입니다.",
  why_notice:
    "현재는 왜 이런 문제라고 판단했는지와 통지 근거를 먼저 확인할 필요가 있는 상태입니다.",
  fact_difference:
    "현재는 실제 상황과 교통국 설명 중 무엇이 다른지부터 확인할 필요가 있는 상태입니다.",
  what_when:
    "현재는 이 통지 후 필요한 대응과 기한을 먼저 확인할 필요가 있는 상태입니다.",
  verify_violation:
    "현재는 통지에서 지적한 위반·문제 내용이 실제와 맞는지 먼저 확인할 필요가 있는 상태입니다.",
  verify_payment: "현재는 납부·비용 요구가 실제 상황에 맞는지 먼저 확인할 필요가 있는 상태입니다.",
  unsure: "현재는 무엇부터 확인할지 방향을 먼저 정리할 필요가 있는 상태입니다.",
};

function buildCase01IntegratedSituation(answers: ReviewAnswers): string {
  const violation = answers.case01_violationContent;
  const goal = answers.case01_confirmGoal;
  const responded = answers.case01_customerResponded;
  const deadline = answers.case01_deadline;

  let opening =
    "현재는 받은 통지 내용을 바탕으로 상황을 정리한 상태입니다.";
  if (goal === "other") {
    const goalNote = answers[getAdminChoiceNoteKey("case01_confirmGoal")]?.trim();
    if (goalNote) {
      opening = `현재는 확인 목표(${goalNote})를 중심으로 상황을 정리할 필요가 있는 상태입니다.`;
    }
  } else if (goal && CASE01_CONFIRM_GOAL_OPENING[goal]) {
    opening = CASE01_CONFIRM_GOAL_OPENING[goal];
  } else if (violation === "situation_mismatch") {
    opening =
      "현재는 통지 내용과 알고 있는 상황이 다르다고 보이므로, 어느 부분이 다른지부터 확인할 필요가 있는 상태입니다.";
  } else if (violation === "unsure") {
    opening =
      "현재는 통지에서 어떤 부분이 문제라고 지적되었는지 먼저 파악할 필요가 있는 상태입니다.";
  }

  const integratedMiddle = resolveIntegratedSituationFragment(answers, "01", "case01_customerResponded");
  const middle =
    integratedMiddle ??
    (responded === "none" || responded === "no_contact_yet"
      ? describeCustomerResponseNone()
      : responded === "contacted" || responded === "attended"
        ? describeCustomerResponseActive("기관에 문의하거나 설명·출석")
        : responded === "resubmitted"
          ? describeCustomerResponseActive("자료 제출")
          : responded === "waiting_response" || responded === "explained_unresolved"
            ? "이미 일부 대응을 했으나 기관 답변·후속 안내 확인이 필요한 상태이며"
            : responded === "more_demand"
              ? "기관에서 추가 대응을 요구한 상태이며"
              : null);

  const closing =
    deadline === "confirmed" || deadline === "deadline_day_known"
      ? describeDeadlineConfirmed()
      : deadline === "overdue_concern"
        ? describeDeadlineOverdueConcern()
        : deadline === "uncertain" ||
            deadline === "not_checked" ||
            deadline === "unknown" ||
            deadline === "unsure" ||
            deadline === "not_stated" ||
            deadline === "not_advised" ||
            deadline === "deadline_window_only"
          ? describeDeadlineUncertain()
          : null;

  const phase2Tail =
    isAdminVerifyPhase2PathComplete(answers) &&
    (answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim() ||
      answers[CASE01_DATE_PLACE_DETAIL_KEY]?.trim())
      ? "2차에서 정리한 사실 차이·날짜·장소 답변을 통지 내용과 대조할 필요가 있습니다."
      : null;

  return joinNarrative([opening, middle, phase2Tail, closing]);
}

function buildCase02IntegratedSituation(answers: ReviewAnswers): string {
  const goal = answers.case02_confirmGoal;
  const status = answers.case02_paymentStatus;
  const deadline = answers.case02_deadline;

  let opening = "현재는 납부 요구 내용을 바탕으로 상황을 정리한 상태입니다.";
  if (goal === "verify_obligation" || goal === "why_pay") {
    opening = "현재는 납부 의무와 사유가 실제 상황에 맞는지 먼저 확인할 필요가 있는 상태입니다.";
  } else if (goal === "verify_amount") {
    opening = "현재는 안내 금액이 맞는지 먼저 확인할 필요가 있는 상태입니다.";
  } else if (goal === "payment_processed") {
    opening =
      status === "full"
        ? "현재는 납부와 처리 완료를 확인하셨으나 다시 납부 요구를 받아, 재요구 사유와 기준을 확인할 필요가 있는 상태입니다."
        : "현재는 이미 납부했으나 기관 처리 여부를 확인할 필요가 있는 상태입니다.";
  }

  const integratedMiddle = resolveIntegratedSituationFragment(answers, "02", "case02_paymentStatus");
  const middle =
    integratedMiddle ??
    (status === "not_paid"
      ? describeCustomerResponseNone().replace("설명하거나 자료를 제출", "납부")
      : status === "paid_unverified"
        ? "이미 납부했으나 기관 처리 여부가 확인되지 않은 상태이며"
        : status === "partial"
          ? "일부만 납부한 상태이며"
          : null);

  const closing =
    deadline === "confirmed"
      ? "납부 기한은 확인된 상태입니다."
      : deadline === "uncertain" || deadline === "deadline_mentioned" || deadline === "not_stated" || deadline === "unsure"
        ? "납부 기한은 아직 명확히 확인되지 않았습니다."
        : null;

  return joinNarrative([opening, middle, closing]);
}

function buildCase03IntegratedSituation(answers: ReviewAnswers): string {
  const demand = answers.case03_authorityDemand;
  const goal = answers.case03_confirmGoal;
  const response = answers.case03_customerResponse;
  const deadline = answers.case03_deadline;

  let opening = "현재는 출석·소명 요구와 관련해 상황을 정리한 상태입니다.";
  if (demand === "reason_unclear" || demand === "prep_unclear") {
    opening =
      "현재는 기관이 확인하려는 내용과 실제 상황의 관계를 먼저 확인할 필요가 있는 상태입니다.";
  } else if (goal === "sufficient_explanation" || goal === "repeat_response" || demand === "repeat_demand") {
    opening = "현재는 이전 대응 내용과 기관의 추가 요구를 함께 확인할 필요가 있는 상태입니다.";
  }

  const integratedMiddle = resolveIntegratedSituationFragment(answers, "03", "case03_customerResponse");
  const middle =
    integratedMiddle ??
    (response === "none"
      ? describeCustomerResponseNone().replace("설명하거나 자료를 제출", "설명하거나 방문")
      : response === "phone_message" || response === "attendance"
        ? describeCustomerResponseActive("일부 문의·출석")
        : response === "explanation_with_docs"
          ? describeCustomerResponseActive("설명과 자료 제출")
          : null);

  const deadlineText = answers[CASE03_DEADLINE_DATE_KEY]?.trim();
  const deadlineClause =
    deadline === "specific_date" && deadlineText
      ? `적어 둔 출석·소명 기한은 ${deadlineText} 입니다.`
      : deadline === "specific_date"
        ? "출석·소명 기한 날짜는 아직 적어 두지 않았습니다."
        : deadline === "uncertain" ||
            deadline === "period_stated" ||
            deadline === "not_stated" ||
            deadline === "unsure"
          ? "출석·소명 기한은 아직 명확히 확인되지 않았습니다."
          : null;

  return joinNarrative([opening, middle, deadlineClause]);
}

function buildCase04IntegratedSituation(answers: ReviewAnswers): string {
  const target = answers.case04_supplementTarget;
  const goal = answers.case04_confirmGoal;
  const response = answers.case04_customerResponse;
  const deadline = answers.case04_deadline;

  let opening = "현재는 보완·추가 제출 요구를 바탕으로 상황을 정리한 상태입니다.";
  if (goal === "understand_materials" || target === "unclear") {
    opening = "현재는 어떤 서류를 보완해야 하는지 먼저 확인할 필요가 있는 상태입니다.";
  } else if (goal === "prepare_materials") {
    opening = "현재는 보완 제출 준비 상태를 먼저 점검할 필요가 있는 상태입니다.";
  } else if (goal === "repeat_reason" || target === "repeat_demand") {
    opening = "현재는 이미 보완했는데 다시 요구받은 이유를 먼저 확인할 필요가 있는 상태입니다.";
  }

  const integratedMiddle = resolveIntegratedSituationFragment(answers, "04", "case04_customerResponse");
  const middle =
    integratedMiddle ??
    (response === "not_started"
      ? describeCustomerResponseNone()
      : response === "preparing"
        ? "보완 자료를 준비 중인 상태이며"
        : response === "submitted"
          ? describeCustomerResponseActive("보완 제출")
          : null);

  const deadlineText = answers[CASE04_DEADLINE_DATE_KEY]?.trim();
  const closing =
    (deadline === "confirmed" || deadline === "specific_date") && deadlineText
      ? `적어 둔 보완 제출 기한은 ${deadlineText} 입니다.`
      : deadline === "confirmed" || deadline === "specific_date"
        ? "보완 제출 기한 날짜는 아직 적어 두지 않았습니다."
        : deadline === "uncertain" || deadline === "not_stated" || deadline === "unsure"
          ? "보완 제출 기한은 아직 명확히 확인되지 않았습니다."
          : null;

  return joinNarrative([opening, middle, closing]);
}

function buildCase05IntegratedSituation(answers: ReviewAnswers): string {
  const type = answers.case05_dispositionType;
  const goal = answers.case05_confirmGoal;
  const response = answers.case05_customerResponse;
  const deadline = answers.case05_deadline;

  let opening = "현재는 처분·조치 통지를 바탕으로 상황을 정리한 상태입니다.";
  if (type === "disposition_unclear" || type === CASE05_DISPOSITION_TYPE_UNCLEAR) {
    opening = "현재는 어떤 처분·조치인지부터 파악할 필요가 있는 상태입니다.";
  } else if (type === "other") {
    const typeNote = answers[getAdminChoiceNoteKey("case05_dispositionType")]?.trim();
    opening = typeNote
      ? `현재는 확인 목표(${typeNote})를 중심으로 통지서와 대조할 필요가 있는 상태입니다.`
      : "현재는 고객이 설명한 조치 내용을 통지서와 대조할 필요가 있는 상태입니다.";
  } else if (type === "situation_mismatch" || goal === "understand_impact") {
    opening = "현재는 처분 내용이 실제 상황에 어떤 영향을 주는지 먼저 확인할 필요가 있는 상태입니다.";
  } else if (type === "reason_hard_to_understand" || goal === "understand_reason") {
    opening = "현재는 처분 사유를 먼저 이해할 필요가 있는 상태입니다.";
  } else if (goal === "appeal_possibility") {
    opening = "현재는 이의·재검토 가능 여부를 먼저 확인할 필요가 있는 상태입니다.";
  }

  const integratedMiddle = resolveIntegratedSituationFragment(answers, "05", "case05_customerResponse");
  const explanationMiddle =
    response === "explanation_submitted"
      ? (() => {
          const detail = effectiveAdminVerifyChoiceSlug(answers, "case05_explanationDetail");
          if (
            detail === "written_no_receipt" ||
            detail === "written_receipt_ok"
          ) {
            return "서면으로 소명·의견을 제출한 경험이 있는 상태입니다.";
          }
          if (
            detail === "verbal_no_record" ||
            detail === "verbal_with_record"
          ) {
            return "전화·방문으로 설명한 경험이 있는 상태입니다.";
          }
          if (detail === "both_unverified" || detail === "both_aligned") {
            return "서면과 구두로 모두 설명한 경험이 있는 상태입니다.";
          }
          return describeCustomerResponseActive("소명·의견 제출");
        })()
      : null;
  const middle =
    integratedMiddle ??
    (response === "none"
      ? describeCustomerResponseNone()
      : explanationMiddle
        ? explanationMiddle
        : response === "documents_submitted"
          ? describeCustomerResponseActive("설명·자료 제출")
          : response === "appeal_requested"
            ? describeCustomerResponseActive("이의·재검토 요청")
            : response === "inquired"
              ? "기관에 문의하거나 상황을 확인한 상태이며, 아직 소명·자료 제출이나 이의·재검토 신청까지는 진행하지 않은 것으로 응답했습니다."
              : null);

  const deadlineText = answers[CASE05_DEADLINE_DATE_KEY]?.trim();
  const closing =
    (deadline === "specific_date" || deadline === "known_date") && deadlineText
      ? `적어 둔 처분 관련 대응 기한은 ${deadlineText} 입니다.`
      : deadline === "specific_date" || deadline === "known_date"
        ? "처분 관련 대응 기한 날짜는 아직 적어 두지 않았습니다."
        : deadline === "past_possible"
          ? describeDeadlineOverdueConcern()
          : deadline === "uncertain"
            ? "처분 관련 대응 기한이 있다는 것은 알고 있으나, 정확한 날짜는 아직 확인하지 못한 상태입니다."
            : deadline === "period_stated"
              ? "기한이 있다는 안내는 받았으나, 통지서에 적힌 기간·일자를 아직 확인하지 못한 상태입니다."
              : deadline === "not_stated"
                ? "처분 통지에 기한이 적혀 있는지부터 아직 확인하지 못한 상태입니다."
                : deadline === "unsure"
                  ? "처분과 관련한 대응 기한 전반을 아직 확인하지 못한 상태입니다."
                  : null;

  return joinNarrative([opening, middle, closing]);
}

function buildCase06IntegratedSituation(answers: ReviewAnswers, profile: CaseResolutionProfile): string {
  if (!isCase06LegacyRestorePath(answers) && answers.case06_requiredActionCandidate) {
    const actionLabel = getCase06RequiredActionCandidateLabel(answers);
    const deadlineText = answers[CASE06_DEADLINE_DATE_KEY]?.trim();
    const response = answers.case06_customerResponse;
    let opening = actionLabel
      ? `문서·안내에서 들은 요구는 「${actionLabel}」 쪽으로 파악됩니다.`
      : "현재는 문서·안내에서 요구 내용을 정리하는 단계입니다.";
    const middle =
      response === "no_response_yet"
        ? "아직 기관 안내에 대한 별도 대응은 진행되지 않은 상태입니다."
        : profile.customerAction.value
          ? `현재까지 ${profile.customerAction.value} 상태이며`
          : null;
    const amountText = answers[CASE06_PAYMENT_AMOUNT_TEXT_KEY]?.trim();
    const amountClause = amountText ? `적어 둔 금액은 ${amountText} 입니다.` : null;
    const closing = deadlineText
      ? `적어 둔 기한·날짜는 ${deadlineText} 입니다.`
      : case06NeedsDeadlineDate(answers)
        ? describeDeadlineUncertain()
        : null;
    return joinNarrative([opening, middle, amountClause, closing]);
  }

  const issue = answers.profilePerceivedIssue;
  const goal = answers.profileCurrentGoal;
  const deadline = answers.profileAuthorityGuidance;

  let opening = "현재는 받은 문서·통지의 의미를 파악하는 단계입니다.";
  if (issue === "situation_relation" || issue === "mismatch_authority") {
    opening =
      "현재는 문서 내용이 실제 상황과 어떻게 연결되는지 먼저 확인할 필요가 있는 상태입니다.";
  } else if (issue === "what_to_do" || goal === "hard_to_tell") {
    opening = "현재는 문서가 요구하는 조치가 무엇인지 먼저 확인할 필요가 있는 상태입니다.";
  } else if (issue === "overall_unclear" || issue === "why_received") {
    opening = "현재는 문서의 핵심 내용과 받은 이유를 먼저 파악할 필요가 있는 상태입니다.";
  }

  const middle =
    profile.customerAction.value?.includes("아직") || profile.customerAction.value?.includes("없음")
      ? describeCustomerResponseNone().replace("기관에", "아직 기관에")
      : profile.customerAction.status === "confirmed" && profile.customerAction.value
        ? `현재까지 ${profile.customerAction.value} 상태이며`
        : null;

  const closing =
    deadline === "yes_clear" || deadline === "confirmed"
      ? describeDeadlineConfirmed()
      : deadline === "past_possible"
        ? describeDeadlineOverdueConcern()
        : deadline === "uncertain" || deadline === "not_stated" || deadline === "not_checked"
          ? describeDeadlineUncertain()
          : null;

  return joinNarrative([opening, middle, closing]);
}

function buildIntegratedSituationFromProfile(
  answers: ReviewAnswers,
  profile: CaseResolutionProfile,
): string {
  const q1Case = getQ1ResolvedCase(answers);
  switch (q1Case) {
    case "CASE_01":
      return buildCase01IntegratedSituation(answers);
    case "CASE_02":
      return buildCase02IntegratedSituation(answers);
    case "CASE_03":
      return buildCase03IntegratedSituation(answers);
    case "CASE_04":
      return buildCase04IntegratedSituation(answers);
    case "CASE_05":
      return buildCase05IntegratedSituation(answers);
    case "CASE_06":
      return buildCase06IntegratedSituation(answers, profile);
    default:
      break;
  }

  const anchor = profile.caseAnchor.value;
  if (anchor && profile.customerStatement.value) {
    return joinNarrative([
      `입력하신 내용을 바탕으로 현재 상황을 정리했습니다.`,
      profile.authorityClaim.value ? `기관 안내는 ${profile.authorityClaim.value} 방향으로 파악됩니다.` : null,
      profile.deadline.value?.includes("확인")
        ? "대응 기한 관련 정보는 일부 확인된 상태입니다."
        : null,
    ]);
  }
  return "1차에서 확인한 내용과 2차에서 추가로 확인한 내용을 함께 정리했습니다.";
}

function buildPhase1RiskSummary(answers: ReviewAnswers, profile: CaseResolutionProfile): string {
  return applyCase02PaymentProcessedFullPhase1JudgmentClause(
    answers,
    buildPhase1RiskSummaryFromManifest(answers, profile),
  )!;
}

function buildPhase2RiskSummary(answers: ReviewAnswers, profile: CaseResolutionProfile): string {
  return buildPhase2RiskSummaryFromManifest(answers, profile);
}

export function buildAdminVerifyPersonalizedContext(
  answers: ReviewAnswers,
  evidenceFileName?: string,
): AdminVerifyPersonalizedContext {
  const profile = buildCaseResolutionProfile(answers);
  const integratedSituation = buildIntegratedSituationFromProfile(answers, profile);
  const phase1Summary = buildPhase1RiskSummary(answers, profile);
  const phase2Lines = buildPhase2RiskSummaryLinesFromManifest(answers, profile);
  const q1Case = getQ1ResolvedCase(answers);
  const case06SimplifiedNoPhase2Additions =
    q1Case === "CASE_06" &&
    isCase06LaunchSimplifiedSession(answers) &&
    !isCase06LegacyRestorePath(answers);
  const phase2Additions = case06SimplifiedNoPhase2Additions
    ? []
    : phase2Lines.filter((line) => line.trim());

  return {
    integratedSituation,
    phase1Facts: [phase1Summary],
    phase2Additions,
    evidenceNote: evidenceFileName ? `첨부 자료: ${evidenceFileName}` : undefined,
    documentsNeededNote: DOCUMENTS_NEEDED_NOTE,
  };
}

export function buildAdminVerifyPersonalizedResult(
  answers: ReviewAnswers,
  personalizedContext?: AdminVerifyPersonalizedContext,
): AdminVerifyFirstResultData {
  const base = buildAdminVerifyFirstResult(answers);
  const cautions = [...base.cautions];
  const unconfirmed = [...base.unconfirmed];
  const actions = [...base.actions];
  const q1Case = getQ1ResolvedCase(answers);
  if (q1Case === "CASE_01") {
    appendCase01Phase2ResultSignals(answers, cautions, unconfirmed, actions);
  }
  if (q1Case === "CASE_02") {
    appendCase02Phase2ResultSignals(answers, cautions, unconfirmed, actions);
    const case02NoNoticeUnconfirmed = "미납 시 기관 안내·결과";
    if (
      case02NormalizeNonPaymentNoticeValue(answers.case02_nonPaymentNotice) === "no_notice"
    ) {
      const noNoticeIdx = unconfirmed.indexOf(case02NoNoticeUnconfirmed);
      if (noNoticeIdx >= 0) {
        unconfirmed.splice(noNoticeIdx, 1);
        unconfirmed.unshift(case02NoNoticeUnconfirmed);
      }
    }
  }
  if (q1Case === "CASE_03") {
    appendCase03Phase2ResultSignals(answers, cautions, unconfirmed, actions);
  }
  if (q1Case === "CASE_04") {
    appendCase04Phase2ResultSignals(answers, cautions, unconfirmed, actions);
  }
  if (q1Case === "CASE_05") {
    appendCase05Phase2ResultSignals(answers, cautions, unconfirmed, actions);
  }
  if (q1Case === "CASE_06") {
    appendCase06Phase2ResultSignals(answers, cautions, unconfirmed, actions);
    if (isCase06ExpertTerminal(answers)) {
      const expertLine =
        "문서·안내에서 요구 내용을 특정하기 어려워 VFBCAI 전문가팀 확인이 필요한 상태입니다.";
      if (!cautions.includes(expertLine)) cautions.unshift(expertLine);
      if (!unconfirmed.includes("요구 조치·문서 성격")) unconfirmed.unshift("요구 조치·문서 성격");
    }
  }

  const hasMetricCaution = base.keyMetrics.some((metric) => metric.status === "caution");
  const hasIssues = cautions.length > 0 || unconfirmed.length > 0 || hasMetricCaution;

  const anchor = answers[CASE_CUSTOMER_INPUT_KEY]?.trim();
  const integratedSituation =
    personalizedContext?.integratedSituation ||
    (anchor
      ? `입력하신 내용(${anchor})과 1차·2차 답변을 통합해 현재까지 파악된 상황을 정리했습니다.`
      : "1차에서 확인한 내용과 2차에서 추가로 확인한 내용을 함께 정리했습니다.");

  const personalizedSummary = hasIssues
    ? anchor
      ? `입력하신 내용(${anchor})과 1차·2차 답변을 바탕으로, 아직 직접 확인할 부분이 남아 있습니다.`
      : "1차·2차 답변을 바탕으로, 아직 직접 확인할 부분이 남아 있습니다."
    : integratedSituation;

  const dedupedCautions = [...new Set(cautions)].slice(0, 6);
  const dedupedUnconfirmed = [...new Set(unconfirmed)].slice(0, 6);
  const keyMetricBadgeTiers =
    q1Case && q1Case !== "CASE_06"
      ? resolveKeyMetricBadgeTiers({
          caseId: q1Case as MasterCaseId,
          answers,
          unconfirmed: dedupedUnconfirmed,
          cautions: dedupedCautions,
        }).tiers
      : undefined;

  return {
    ...base,
    statusHeadline: hasIssues ? "추가 확인이 필요한 상태입니다" : base.statusHeadline,
    statusTone: hasIssues ? "caution" : base.statusTone,
    situationSummary: personalizedSummary,
    gradeFilled: hasIssues ? Math.max(base.gradeFilled, 2) : base.gradeFilled,
    gradeLabel: hasIssues ? "주의 요망 (2단계)" : base.gradeLabel,
    cautions: dedupedCautions,
    unconfirmed: dedupedUnconfirmed,
    actions: [...new Set(actions)].slice(0, 4),
    personalizedContext: personalizedContext ?? {
      integratedSituation,
      phase1Facts: [],
      phase2Additions: [],
      documentsNeededNote: DOCUMENTS_NEEDED_NOTE,
    },
    case06ExpertHandoffRequired: q1Case === "CASE_06" && isCase06ExpertTerminal(answers),
    case06LaunchSimplifiedSession:
      q1Case === "CASE_06" && isCase06LaunchSimplifiedSession(answers),
    keyMetricBadgeTiers,
  };
}

const SECTION_TITLE_TONE_CLASSES = {
  default: "lg:text-[15px] lg:font-extrabold lg:text-slate-950",
  risk: "lg:text-[14px] lg:font-bold lg:text-slate-900",
  calm: "lg:text-[13px] lg:font-bold lg:text-slate-800",
} as const;

function StitchSectionHeading({
  title,
  badge,
  subtitle,
  meta,
  className,
  titleTone = "default",
}: {
  title: string;
  badge?: ReactNode;
  subtitle?: string;
  meta: ReactNode;
  className?: string;
  titleTone?: keyof typeof SECTION_TITLE_TONE_CLASSES;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex flex-col gap-2 sm:gap-2.5 lg:mb-1.5 lg:flex-row lg:items-start lg:justify-between lg:gap-3",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1 lg:min-w-0 lg:flex-1 lg:gap-1.5">
        <h2
          className={cn(
            "text-xs font-bold uppercase tracking-wide text-slate-900 sm:text-sm",
            FIRST_RESULT_READABLE_CLASS,
            SECTION_TITLE_TONE_CLASSES[titleTone],
          )}
        >
          {title}
        </h2>
        {badge ? <div className="flex shrink-0 flex-wrap items-center">{badge}</div> : null}
        {subtitle ? (
          <span
            className={cn(
              "text-xs font-normal text-slate-400 lg:text-[11px] lg:font-normal lg:text-slate-400",
              FIRST_RESULT_READABLE_CLASS,
            )}
          >
            {subtitle.startsWith("|") ? (
              <>
                <span className="hidden sm:inline text-slate-300/90">{subtitle.charAt(0)} </span>
                <span>{subtitle.replace(/^\|\s*/, "")}</span>
              </>
            ) : (
              subtitle
            )}
          </span>
        ) : null}
      </div>
      {meta ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">{meta}</div>
      ) : null}
    </div>
  );
}

function StepCheckIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-slate-400 lg:h-3 lg:w-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function SegmentMeter({
  filled,
  tone,
}: {
  filled: number;
  tone: "ok" | "caution";
}) {
  const activeClass = tone === "ok" ? "bg-emerald-500" : "bg-amber-500";
  return (
    <div className="flex gap-[3px] py-1 lg:py-0.5" title={`${filled}/5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-[6px] flex-1 rounded-full lg:h-[5px]",
            index < filled ? activeClass : "bg-slate-200",
          )}
        />
      ))}
    </div>
  );
}

/** 1차 결과 화면 — 한국어 줄바꿈·가독성 (표시 레이어 only) */
const FIRST_RESULT_READABLE_CLASS =
  "break-keep text-pretty [word-break:keep-all] [overflow-wrap:anywhere]";

const FIRST_RESULT_PHRASE_LABELS: Record<string, string> = {
  "일부 내용이나 금액이 실제 상황과 다릅니다.": "내용·금액이 실제 상황과 다름",
  "기한은 있지만 정확한 날짜를 모르겠습니다.": "기한은 있으나 날짜 불명확",
  "일부 내용이 실제와 다릅니다.": "일부 내용이 실제와 다름",
  "실제 상황과 문서 내용을 대조하기 어렵습니다.": "실제와 문서 내용 대조 어려움",
  "맞는지 판단할 정보가 부족합니다.": "판단 정보가 부족함",
  "제가 이 납부 의무와 관련된 상황인지 의문이 있습니다.": "납부 의무 관련 여부 불명확",
  "왜 돈을 내야 하는지 설명이 없거나 정확히 이해하기 어렵습니다.": "납부 사유 설명 불명확",
  "통지 내용과 실제 상황이 대체로 같다고 응답함": "통지 내용과 실제 상황 대체로 일치",
  "통지서에 특정 교통위반 내용이 포함되어 있음": "통지서에 교통위반 내용 포함",
  "통지서 위반·문제 내용 추가 확인 필요": "통지 위반·문제 내용 확인 필요",
  "직접 설명한 통지 내용 확인 필요": "직접 설명한 통지 내용 확인 필요",
  "별도 대응 방법이 명시되지 않음": "별도 대응 방법 미명시",
  "기관 요구 내용 확인 필요": "기관 요구 내용 확인 필요",
  "아직 대응하지 않은 상태": "아직 대응 전",
  "대응 기한이 확인됨": "대응 기한 확인됨",
  "납부할 금액이 명확하게 적혀 있습니다.": "납부 금액 명시됨",
  "금액은 보이지만 제가 맞게 확인했는지 확신이 없습니다.": "금액은 보이나 확인 불확실",
  "특정 교통위반이나 과태료·벌금 사유가 적혀 있습니다.": "교통위반·과태료 사유 기재",
  "왜 납부해야 하는지 문서만으로 이해하기 어렵습니다.": "납부 사유 문서상 불명확",
  "납부 사유를 정확히 파악하지 못했습니다.": "납부 사유 파악 어려움",
  "실제 상황과 대체로 맞습니다.": "실제 상황과 대체로 일치",
  "기한 안내를 문서에서 찾지 못했습니다.": "기한 안내 문서에서 미확인",
  "잘 모르겠습니다.": "확인 어려움",
  "교통위반에 대한 벌금·과태료라고 안내받았습니다.": "교통위반 벌금·과태료 안내",
  "아직 납부하지 않았습니다.": "아직 납부 전",
  "납부 기한 날짜를 확인했습니다.": "납부 기한 날짜 확인",
};

const FIRST_RESULT_PARAGRAPH_REPLACEMENTS: [RegExp, string][] = [
  [/을 바탕으로 1차 자가진단한 결과,\s*/g, " 기준 1차 진단 결과, "],
  [/을 바탕으로 1차 자가진단한 결과\s*/g, " 기준 1차 진단 결과 "],
  [
    /현재 확인한 범위에서는 특별히 걸리는 부분이 보이지 않습니다\.?/g,
    "현재까지 큰 문제는 보이지 않습니다.",
  ],
  [
    /현재 확인한 범위에서는 큰 불일치가 보이지 않습니다\.?/g,
    "현재까지 큰 불일치는 보이지 않습니다.",
  ],
  [
    /현재까지 확인한 범위에서는 추가로 급한 확인 항목이 보이지 않습니다\.?/g,
    "현재까지 급한 추가 확인 항목은 없습니다.",
  ],
  [/몇 가지는 직접 한 번 더 확인해 보시는 편이 좋겠습니다\.?/g, "일부 항목은 직접 한 번 더 확인해 보세요."],
];

function refineFirstResultPhrase(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const withoutSuffix = trimmed.replace(/\s*—\s*추가 대조 필요$/, "");
  return FIRST_RESULT_PHRASE_LABELS[withoutSuffix] ?? FIRST_RESULT_PHRASE_LABELS[trimmed] ?? withoutSuffix;
}

function refineFirstResultParagraph(text: string): string {
  let refined = text.trim();
  for (const [pattern, replacement] of FIRST_RESULT_PARAGRAPH_REPLACEMENTS) {
    refined = refined.replace(pattern, replacement);
  }
  return refined;
}

/** 결과 카드 표시용 — 판단/생성 로직은 변경하지 않고 화면 분량만 정리 */
function formatMetricFootnoteForDisplay(
  footnote: string,
  refinePhrase: (text: string) => string = (text) => text,
): string {
  const trimmed = footnote.trim();
  if (!trimmed) return trimmed;
  const parts = trimmed
    .split(" · ")
    .map((part) => refinePhrase(part.trim()))
    .filter(Boolean);
  if (parts.length <= 2) return parts.join(" · ");
  return `${parts[0]} · ${parts[1]}`;
}

function KeyMetricCard({
  metric,
  refinePhrase,
}: {
  metric: AdminVerifyKeyMetric;
  refinePhrase: (text: string) => string;
}) {
  const isOk = metric.status === "ok";
  const displayFootnote = formatMetricFootnoteForDisplay(metric.footnote, refinePhrase);
  if (!displayFootnote.trim()) return null;
  return (
    <div
      className={cn(
        "flex min-h-[148px] flex-col rounded-lg border bg-white p-5 shadow-sm transition-all lg:h-full lg:min-h-[168px] lg:p-[1.125rem] lg:shadow-none",
        isOk
          ? "border-slate-200/80 hover:border-slate-300 lg:border-slate-200/60"
          : "border border-amber-200/80 bg-amber-50/15 hover:border-amber-300/90 lg:border-amber-200/60",
      )}
    >
      <div className="min-w-0">
        <div className="mb-2 flex items-center justify-between lg:mb-2">
          <span
            className={cn(
              "text-[11px] font-mono font-semibold uppercase tracking-wider lg:text-[10px] lg:font-normal",
              isOk ? "text-slate-400" : "text-amber-800",
            )}
          >
            {metric.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-bold lg:px-1.5 lg:text-[10px] lg:font-medium",
              isOk
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-300 bg-amber-100 text-amber-800",
            )}
          >
            {isOk ? "✓ 확인 완료" : "⚠️ 확인 필요"}
          </span>
        </div>
        <h4
          className={cn(
            "text-sm font-semibold tracking-tight text-slate-900 sm:text-base lg:text-[13px] lg:font-medium lg:leading-snug",
            FIRST_RESULT_READABLE_CLASS,
          )}
        >
          {refinePhrase(metric.title)}
        </h4>
      </div>
      <div
        className={cn(
          "mt-3 border-t pt-3 lg:mt-3",
          isOk ? "border-slate-100" : "border-amber-200/60",
        )}
      >
        <p
          className={cn(
            "text-xs leading-normal lg:text-[11px] lg:leading-[1.45]",
            FIRST_RESULT_READABLE_CLASS,
            isOk
              ? "text-slate-500 lg:text-slate-500"
              : "font-medium text-slate-700 lg:font-normal lg:text-slate-600",
          )}
        >
          {displayFootnote}
        </p>
      </div>
    </div>
  );
}

function PersonalizedFactList({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <p className={cn("text-[13px] text-slate-500 lg:text-[12px]", FIRST_RESULT_READABLE_CLASS)}>
        {emptyLabel}
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex gap-2 text-[13px] leading-relaxed text-slate-700 lg:text-[12px]",
            FIRST_RESULT_READABLE_CLASS,
          )}
        >
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const STITCH_ELEVATED_SHADOW =
  "shadow-[0_8px_30px_-4px_rgba(15,23,42,0.06),0_2px_8px_-2px_rgba(15,23,42,0.03)]";
const STITCH_CARD_SUBTLE_SHADOW =
  "shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_1px_2px_0_rgba(0,0,0,0.02)]";

function StitchCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AdminVerifyPersonalizedStitchHeaderSteps() {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-1.5 text-xs"
      aria-label="검토 단계"
    >
      <span className="flex items-center font-normal text-slate-400">
        <StitchCheckIcon className="mr-1 inline-block h-3.5 w-3.5 text-emerald-500" />
        1차 기본 확인
      </span>
      <span className="mx-1 text-slate-300">→</span>
      <span className="flex items-center rounded border border-slate-200 bg-white px-2 py-0.5 font-bold text-blue-600 shadow-sm">
        <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-600" aria-hidden />
        2차 개인화 검토
      </span>
      <span className="mx-1 text-slate-300">→</span>
      <span className="font-normal text-slate-400">3차 문서 정밀 분석</span>
    </div>
  );
}

function AdminVerifyPersonalizedStitchFooterSteps() {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500"
      data-purpose="workflow-stepper"
    >
      <span className="flex items-center font-medium text-slate-500">
        <StitchCheckIcon className="mr-1 inline-block h-3.5 w-3.5 text-emerald-500" />
        완료 · 1차 기본 확인
      </span>
      <span className="text-slate-300">→</span>
      <span className="flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 font-bold text-slate-900 shadow-sm">
        <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-600" aria-hidden />
        지금 · 2차 개인화 검토
      </span>
      <span className="text-slate-300">→</span>
      <span className="flex items-center font-medium text-slate-400">다음 · 3차 문서 정밀 분석</span>
    </div>
  );
}

function StitchPersonalizedMetricRibbon({ data }: { data: AdminVerifyFirstResultData }) {
  const personalized = data.personalizedContext;
  const supplementCount = data.unconfirmed.length;
  const ribbonState = resolveAdminVerifyStitchRibbonState(data.unconfirmed, data.cautions);
  const ribbonStateA = ribbonState === "A";
  const ribbonStateB = ribbonState === "B";
  const ribbonStateC = ribbonState === "C";
  const showRibbonCaution = ribbonStateA || ribbonStateB;

  const metricCardClass =
    "flex min-h-[160px] flex-col items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-4 text-center";
  const numberBadgeClass =
    "flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold leading-none text-white";

  return (
    <div className="relative overflow-visible pt-2">
      <div
        className="grid grid-cols-1 gap-2 overflow-visible rounded-xl border border-slate-200/70 bg-slate-50/70 p-2 sm:gap-2 sm:p-2.5 md:grid-cols-5"
        data-purpose="metric-flow-ribbon"
      >
        <div className={cn(metricCardClass, STITCH_CARD_SUBTLE_SHADOW)}>
          <div className="flex w-full items-center justify-between">
            <span className={numberBadgeClass}>1</span>
            <span className="text-xs font-semibold text-slate-500">종합 위험도</span>
            <span className="w-4" aria-hidden />
          </div>
          <div className="my-auto flex flex-col items-center py-1">
            {showRibbonCaution ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-50">
                <span className="text-[10px] font-bold leading-tight text-amber-700">
                  {ribbonStateA ? (
                    <>
                      보완
                      <br />
                      <span className="text-[9px] font-normal">권장</span>
                    </>
                  ) : (
                    <>
                      주의
                      <br />
                      <span className="text-[9px] font-normal">필요</span>
                    </>
                  )}
                </span>
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
                <StitchCheckIcon className="h-4 w-4" />
              </div>
            )}
            <span
              className={cn(
                "mt-1.5 text-sm font-bold",
                showRibbonCaution ? "text-amber-700" : "text-emerald-700",
              )}
            >
              {showRibbonCaution ? "주의 수준" : "양호 수준"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">개인별 교차 검토 반영</span>
        </div>

        <div className={cn(metricCardClass, STITCH_CARD_SUBTLE_SHADOW)}>
          <div className="flex w-full items-center justify-between">
            <span className={numberBadgeClass}>2</span>
            <span className="text-xs font-semibold text-slate-500">개인 맞춤 요인</span>
            <span className="w-4" aria-hidden />
          </div>
          <div className="my-auto flex flex-col items-center py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 shadow-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="mt-1.5 text-sm font-bold text-slate-800">{data.caseClassificationLabel}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {data.caseClassificationLabel?.includes("출석")
              ? "출석·소명 사건 기준"
              : "사건 유형 기준"}
          </span>
        </div>

        <div className={cn(metricCardClass, STITCH_CARD_SUBTLE_SHADOW)}>
          <div className="flex w-full items-center justify-between">
            <span className={numberBadgeClass}>3</span>
            <span className="text-xs font-semibold text-slate-500">정밀 분석 소견</span>
            <span className="w-4" aria-hidden />
          </div>
          <div className="my-auto flex flex-col items-center py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-300 bg-indigo-50/50 text-indigo-700 shadow-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="mt-1.5 text-sm font-bold text-slate-800">
              {ribbonStateC ? "부합" : "조건부 부합"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {ribbonStateA
              ? "원본 자료 대조 필요"
              : ribbonStateB
                ? "위험 요인 확인 필요"
                : "현재 입력 기준 특이사항 없음"}
          </span>
        </div>

        <div className={cn(metricCardClass, STITCH_CARD_SUBTLE_SHADOW)}>
          <div className="flex w-full items-center justify-between">
            <span className={numberBadgeClass}>4</span>
            <span className="text-xs font-semibold text-slate-500">추가 확인 항목</span>
            <span className="w-4" aria-hidden />
          </div>
          <div className="my-auto flex flex-col items-center py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 shadow-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className={cn("mt-1.5 text-sm font-bold", supplementCount > 0 ? "text-red-600" : "text-slate-800")}>
              {supplementCount > 0 ? `${supplementCount}건 확인 필요` : "추가 확인 없음"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {ribbonStateA
              ? personalized?.documentsNeededNote || "제출 전 원본·기재사항 대조"
              : "제출 전 원본·기재사항 대조"}
          </span>
        </div>

        <div className="flex min-h-[160px] flex-col items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-3.5 py-4 text-center">
          <div className="flex w-full items-center justify-between">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[10px] font-bold leading-none text-white">
              5
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-medium text-slate-400">다음 단계</span>
              <span className="text-xs font-bold text-slate-600">3차 실사</span>
            </div>
            <span className="w-4" aria-hidden />
          </div>
          <div className="my-auto flex flex-col items-center py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mt-1.5 rounded-full border border-dashed border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
              문서 원본 AI 실사
            </div>
          </div>
          <span className="text-[11px] text-slate-400">법적 실무 리스크 대조</span>
        </div>
      </div>
    </div>
  );
}

function stitchPersonalizedKeyConfirmationBadge(tier: KeyMetricBadgeTier): {
  label: string;
  className: string;
} {
  switch (tier) {
    case "missing":
      return {
        label: "미확인",
        className: "bg-slate-50 text-slate-600 border border-slate-200",
      };
    case "unconfirmed":
      return {
        label: "추가 확인",
        className: "bg-blue-50 text-blue-600 border border-blue-200",
      };
    case "caution":
      return {
        label: "보완 권장",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
      };
    case "ok":
    default:
      return {
        label: "확인 완료",
        className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      };
  }
}

function StitchPersonalizedKeyConfirmationCard({
  metric,
  badgeTier,
}: {
  metric: AdminVerifyKeyMetric;
  badgeTier: KeyMetricBadgeTier;
}) {
  const badge = stitchPersonalizedKeyConfirmationBadge(badgeTier);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <span className="min-w-0 text-[11px] font-medium text-slate-400">{metric.label}</span>
        <span className={cn("shrink-0 px-2.5 py-1 text-xs font-semibold rounded", badge.className)}>
          {badge.label}
        </span>
      </div>
      <div className="min-w-0 space-y-0.5">
        <span className={cn("block text-sm font-bold text-slate-800", FIRST_RESULT_READABLE_CLASS)}>
          {metric.title}
        </span>
        {metric.footnote?.trim() ? (
          <span
            className={cn(
              "block text-[11px] font-normal leading-snug text-slate-500",
              FIRST_RESULT_READABLE_CLASS,
            )}
          >
            {metric.footnote}
          </span>
        ) : null}
      </div>
    </div>
  );
}

type VerifyResultActionCardTone = "report" | "expert" | "free" | "paid";

type VerifyResultActionCardConfig = {
  tone: VerifyResultActionCardTone;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  error?: string | null;
  buttonVariant?: "primary" | "secondary";
  buttonBadge?: string;
};

function VerifyResultActionArrowIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerifyResultActionCardBadge({ tone }: { tone: VerifyResultActionCardTone }) {
  if (tone === "report") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden />
        정밀 리포트
      </div>
    );
  }
  if (tone === "expert") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" aria-hidden />
        전문가 자문
      </div>
    );
  }
  if (tone === "free") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
        무료
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
      유료
    </div>
  );
}

function VerifyResultDualActionCards({
  sectionLabel,
  headline,
  subcopy,
  cards,
  className,
}: {
  sectionLabel: string;
  headline: string;
  subcopy: string;
  cards: VerifyResultActionCardConfig[];
  className?: string;
}) {
  return (
    <div className={cn("pt-2", className)} data-purpose="action-selection-section">
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-tight text-slate-400">{sectionLabel}</span>
        </div>
        <h3 className="mt-1 text-base font-bold tracking-tight text-slate-900 sm:text-lg">{headline}</h3>
        <p className="mt-0.5 text-xs font-normal text-slate-500 sm:text-sm">{subcopy}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.title}
            className={cn(
              "flex flex-col justify-between rounded-xl border border-slate-300 bg-white p-6",
              STITCH_CARD_SUBTLE_SHADOW,
            )}
          >
            <div className="mb-6 space-y-3">
              <VerifyResultActionCardBadge tone={card.tone} />
              <h4 className="text-lg font-bold tracking-tight text-slate-900">{card.title}</h4>
              <p className="text-xs font-normal leading-relaxed text-slate-600 sm:text-sm">{card.description}</p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={card.onClick}
                disabled={card.disabled || card.loading}
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-semibold shadow-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70",
                  card.buttonVariant === "secondary"
                    ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                    : "space-x-2 bg-slate-900 text-white hover:bg-slate-800",
                )}
              >
                {card.loading ? (
                  <span>{card.loadingLabel ?? "처리 중..."}</span>
                ) : (
                  <>
                    <span>{card.buttonLabel}</span>
                    {card.buttonBadge ? (
                      <span className="rounded border border-blue-200/80 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                        {card.buttonBadge}
                      </span>
                    ) : null}
                    {card.buttonVariant !== "secondary" ? <VerifyResultActionArrowIcon /> : null}
                  </>
                )}
              </button>
              {card.error ? <p className="text-center text-[11px] text-red-600">{card.error}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminVerifyPersonalizedNextSteps({
  onAiReport,
  onExpert,
  onDirect,
  aiReportRequesting,
  expertRequesting,
  aiReportError,
  expertError,
  mode = "admin",
  case06ExpertHandoffOnly = false,
}: {
  onAiReport?: () => void;
  onExpert?: () => void;
  onDirect?: () => void;
  aiReportRequesting?: boolean;
  expertRequesting?: boolean;
  aiReportError?: string | null;
  expertError?: string | null;
  mode?: "admin" | "real-estate";
  case06ExpertHandoffOnly?: boolean;
}) {
  const isRealEstate = mode === "real-estate";
  const cards: VerifyResultActionCardConfig[] = case06ExpertHandoffOnly
    ? [
        {
          tone: "expert",
          title: "전문가 확인 요청하기",
          description:
            "문서·안내 내용이 불명확한 상태입니다. VFBCAI 전문가팀이 확인한 내용을 바탕으로 다음 대응을 안내합니다.",
          buttonLabel: "전문가 진행하기",
          onClick: () => onExpert?.(),
          loading: expertRequesting,
          loadingLabel: "요청 중...",
          error: expertError,
          buttonVariant: "primary",
        },
      ]
    : [
        {
          tone: "report",
          title: isRealEstate ? "AI 리포트 요청하기" : "최종 AI 리포트",
          description: isRealEstate
            ? "현재 확인한 내용을 바탕으로 관련 문서를 제출하면 AI 리포트로 이어집니다."
            : "2차까지 반영한 검토 내용을 바탕으로 AI 최종 리포트를 요청합니다. 완료 후 마이페이지에서 확인할 수 있습니다.",
          buttonLabel: "최종 리포트 보기",
          onClick: () => onAiReport?.(),
          loading: aiReportRequesting,
          loadingLabel: "이동 중...",
          error: aiReportError,
          buttonVariant: "primary",
        },
        {
          tone: "expert",
          title: "전문가 진행하기",
          description:
            "현재 검토 상황과 데이터를 전담 전문가에게 전달하여 1:1 심층 상담 및 검토를 진행합니다.",
          buttonLabel: "전문가에게 요청하기",
          onClick: () => onExpert?.(),
          loading: expertRequesting,
          loadingLabel: "요청 중...",
          error: expertError,
          buttonVariant: "secondary",
        },
      ];
  return (
    <>
      <VerifyResultDualActionCards
        sectionLabel={isRealEstate ? "다음 검토 연계" : "05 다음 단계 액션"}
        headline={
          case06ExpertHandoffOnly
            ? "전문가 확인이 필요한 상태입니다"
            : isRealEstate
              ? "AI 리포트 또는 VFBCAI 전문가팀 검토로 이어갈 수 있습니다"
              : "상황에 맞는 검토 방식을 선택해 보세요"
        }
        subcopy={
          case06ExpertHandoffOnly
            ? "AI 리포트 전에 전문가가 문서·안내 내용을 함께 확인하는 경로를 권장합니다."
            : isRealEstate
              ? "1차 검토 결과를 바탕으로 관련 문서를 추가 확인하거나 전문가 검토로 이어갈 수 있습니다."
              : "2차 검토 데이터를 바탕으로 최종 AI 리포트를 요청하거나 전문가 검토로 연계할 수 있습니다."
        }
        cards={cards}
        className="border-t border-slate-100 pt-5"
      />
      {onDirect ? (
        <div className="mt-4 flex justify-center border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onDirect()}
            className="text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            자세히 보기
          </button>
        </div>
      ) : null}
    </>
  );
}

function VerifyFirstResultAiSummaryPanel({ data }: { data: AdminVerifyFirstResultData }) {
  const summary = buildVerifyFirstResultAiSummary(data);
  return (
    <div className="mt-4 rounded-lg border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">AI 정리</p>
      <p className="mt-2 text-base font-bold leading-snug text-slate-900">{summary.headline}</p>
      {summary.paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          className={cn("mt-2 text-sm leading-relaxed text-slate-700", FIRST_RESULT_READABLE_CLASS)}
        >
          {paragraph}
        </p>
      ))}
      {summary.bullets.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {summary.bullets.map((bullet) => (
            <li key={bullet.slice(0, 48)} className="flex gap-2 text-sm text-slate-700">
              <span className="text-slate-400" aria-hidden>
                ·
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function VerifyFirstResultTransitionSection({
  transitionHooks,
  data,
  onContinue,
  onAiSummaryNavigate,
  aiSummaryNavigating,
  ctaPrimaryClasses,
  ctaSecondaryClasses,
  domain = "admin",
}: {
  transitionHooks: VerifyFirstResultTransition;
  data: AdminVerifyFirstResultData;
  onContinue: () => void;
  onAiSummaryNavigate?: () => void;
  aiSummaryNavigating?: boolean;
  ctaPrimaryClasses: string;
  ctaSecondaryClasses: string;
  domain?: "admin" | "real-estate";
}) {
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false);
  const isRealEstate = domain === "real-estate";

  const handleAiSummaryClick = () => {
    if (onAiSummaryNavigate) {
      onAiSummaryNavigate();
      return;
    }
    setAiSummaryOpen((open) => !open);
  };

  const transitionNotice = (
    <div className="mt-5 flex items-center gap-2 border-t border-slate-100/80 pt-3.5 lg:mt-4 lg:pt-3">
      <span className="text-[11px] font-medium text-slate-400 lg:text-[10px]">안내:</span>
      <p className="text-xs text-slate-400 lg:text-[11px] lg:leading-relaxed">
        검토 범위·서류 유형에 따라 비용이 발생할 수 있습니다. 가격은 별도 안내 없이 진행 방식만
        선택합니다.
      </p>
    </div>
  );

  if (isRealEstate) {
    return (
      <section className="border-t border-slate-100 pt-6 lg:pt-5" data-purpose="first-result-transition">
        <VerifyResultDualActionCards
          sectionLabel="다음 단계"
          headline="지금 더 깊이 확인하면, 놓칠 수 있는 위험을 미리 줄일 수 있습니다."
          subcopy="AI와 전문가의 관점에서 계약 조건·조항·금액을 더 꼼꼼하게 확인해 드립니다."
          className="pt-0"
          cards={[
            {
              tone: "free",
              title: "AI 정리 보기",
              description: "내 상황에 맞는 핵심 내용을 AI가 정리해 드립니다.",
              buttonLabel: aiSummaryNavigating
                ? "이동 중..."
                : !onAiSummaryNavigate && aiSummaryOpen
                  ? "AI 정리 접기"
                  : "AI 정리 보기",
              onClick: handleAiSummaryClick,
              loading: aiSummaryNavigating,
              loadingLabel: "이동 중...",
              buttonVariant: "secondary",
            },
            {
              tone: "paid",
              title: "개인화 상세검토 하기",
              description: "내 상황과 자료를 바탕으로 계약 조건을 더 깊이 확인합니다.",
              buttonLabel: "개인화 상세검토 하기",
              onClick: onContinue,
              buttonVariant: "primary",
              buttonBadge: "유료",
            },
          ]}
        />
        {aiSummaryOpen ? <VerifyFirstResultAiSummaryPanel data={data} /> : null}
      </section>
    );
  }

  return (
    <section className="border-t border-slate-100 pt-6 lg:pt-5" data-purpose="admin-first-result-transition">
      <VerifyResultDualActionCards
        sectionLabel="다음 단계"
        headline={transitionHooks.hookHeadline}
        subcopy={transitionHooks.hookWhatMore}
        className="pt-0"
        cards={[
          {
            tone: "free",
            title: "AI 정보 보기",
            description: "내 상황에 맞는 핵심 내용을 AI가 정리해 드립니다.",
            buttonLabel: aiSummaryNavigating ? "이동 중..." : "AI 정보 보기",
            onClick: handleAiSummaryClick,
            loading: aiSummaryNavigating,
            loadingLabel: "이동 중...",
            buttonVariant: "secondary",
          },
          {
            tone: "paid",
            title: "개인화 상세 검토하기",
            description: "내 상황과 자료를 바탕으로 행정문서 관련 내용을 더 깊이 확인합니다.",
            buttonLabel: "개인화 상세 검토하기",
            onClick: onContinue,
            buttonVariant: "primary",
            buttonBadge: "유료",
          },
        ]}
      />
      {transitionNotice}
    </section>
  );
}

export function AdminVerifyFirstResultPanel({
  data,
  onContinue,
  onAiReport,
  onExpert,
  onDirect,
  onAiSummaryNavigate,
  aiSummaryNavigating,
  aiReportRequesting,
  expertRequesting,
  aiReportError,
  expertError,
  variant = "first",
  domain = "admin",
  transitionHooks,
}: {
  data: AdminVerifyFirstResultData;
  onContinue: () => void;
  onAiReport?: () => void;
  onExpert?: () => void;
  onDirect?: () => void;
  onAiSummaryNavigate?: () => void;
  aiSummaryNavigating?: boolean;
  aiReportRequesting?: boolean;
  expertRequesting?: boolean;
  aiReportError?: string | null;
  expertError?: string | null;
  variant?: "first" | "personalized";
  domain?: "admin" | "real-estate";
  transitionHooks?: VerifyFirstResultTransition;
}) {
  const isCaution = data.statusTone === "caution";
  const isPersonalized = variant === "personalized";
  const isRealEstate = domain === "real-estate";
  const hideAdminFirstResultExtraSections = !isRealEstate && !isPersonalized;
  const personalized = data.personalizedContext;
  const resultTitle = isRealEstate
    ? isPersonalized
      ? "부동산 문서 2차 개인화 결과"
      : "부동산 문서 1차 종합 결과"
    : isPersonalized
      ? "행정문서 개인화 검토 결과"
      : "행정문서 1차 종합 결과";
  const resultIntro = isRealEstate
    ? isPersonalized
      ? "1차 확인과 2차 추가 답변을 통합해 현재 상황에 맞게 정리한 검토 결과입니다."
      : "입력하신 답변과 상황 정보를 바탕으로 정리한 1차 검토 결과입니다."
    : isPersonalized
      ? "1차 기본 확인과 추가 상황을 결합한 맞춤 검토 소견입니다."
      : "입력하신 답변을 바탕으로 정리한 1차 진단 결과입니다. 핵심만 골라 직접 확인할 수 있게 정돈했습니다.";
  const refinePhrase = isPersonalized
    ? (text: string) => text
    : refineFirstResultPhrase;
  const visibleMetricCount = data.keyMetrics.filter((metric) =>
    formatMetricFootnoteForDisplay(metric.footnote, refinePhrase).trim(),
  ).length;
  const firstResultMetricGridColsClass =
    visibleMetricCount <= 1
      ? "lg:grid-cols-1"
      : visibleMetricCount === 2
        ? "lg:grid-cols-2"
        : visibleMetricCount === 3
          ? "lg:grid-cols-3"
          : "lg:grid-cols-4";
  const refineParagraph = isPersonalized
    ? (text: string) => text
    : refineFirstResultParagraph;
  const displayStatusHeadline = refinePhrase(data.statusHeadline);
  const displaySituationSummary = refineParagraph(data.situationSummary);

  const ctaPrimaryClasses =
    "inline-flex items-center justify-center rounded-lg bg-[#0f172a] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 lg:px-6 lg:py-2.5 lg:text-[13px] lg:shadow-none";
  const ctaSecondaryClasses =
    "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 lg:px-5 lg:py-2.5 lg:text-[13px] lg:shadow-none";

  if (isPersonalized && personalized) {
    const phase1RiskText =
      personalized.phase1Facts.length > 0
        ? personalized.phase1Facts.join(" · ")
        : "1차 확인에서는 기본적인 상황 정리가 완료된 상태입니다.";
    const phase2RiskText =
      personalized.phase2Additions.length > 0
        ? personalized.phase2Additions.join(" ")
        : "2차 답변에서 추가로 확인된 위험 요인은 현재 보이지 않습니다.";
    const hideCase06EmptyPhase2RiskRow =
      !isRealEstate &&
      Boolean(data.case06LaunchSimplifiedSession) &&
      personalized.phase2Additions.filter((line) => line.trim()).length === 0;
    const hasPhase2UploadedDocs = Boolean(personalized.evidenceNote?.trim());
    const adminPersonalizedIntroSubtitle = hideCase06EmptyPhase2RiskRow
      ? hasPhase2UploadedDocs
        ? "1차 검토와 입력하신 내용·첨부 자료를 반영한 종합 소견입니다."
        : "1차 검토와 입력하신 내용을 반영한 종합 소견입니다."
      : hasPhase2UploadedDocs
        ? "1차 검토와 2차 추가 확인 답변·첨부 자료를 반영한 종합 소견입니다."
        : "1차 검토와 2차 추가 확인 답변을 반영한 종합 소견입니다.";
    const unconfirmedColumnLabels = isRealEstate
      ? ["원본 서류 대조", "추가 확인 사항", "기한·조건 확인"]
      : ["필요한 서류 원본 대조", "세부 기재사항 및 스펠링", "제출 기한 및 관할 예약"];
    const section01Label = isRealEstate ? "01 현재 상황" : "01 전체 판단";
    const section01Meta = isRealEstate
      ? "1차 확인 + 2차 추가 답변 통합"
      : "1차 기본 내용 + 2차 추가 상황 결합";
    const section02Label = isRealEstate ? "02 핵심 판단" : "02 핵심 확인 결과";
    const section05Label = isRealEstate ? "05 지금 해야 할 일" : "05 다음 단계 액션";
    const section05Title = isRealEstate
      ? "지금 우선 확인·준비할 일"
      : "상황에 맞는 검토 방식을 선택해 보세요";
    const breadcrumbService = isRealEstate ? "부동산 VERIFY" : "베트남 행정서류";
    const breadcrumbPhase = isRealEstate ? "2차 개인화 검토" : "2차 심화 분석";
    const pageMetaLabel = isRealEstate ? "부동산 VERIFY" : "직접검토하기";
    const pageMetaSuffix = isRealEstate ? "부동산 문서 검토" : "베트남 행정·법률 전용 AI";

    return (
      <div className="w-full flex-1 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[960px] px-4 sm:px-6">
          <div className="mb-7" data-purpose="page-title-area">
            <div className="mb-1.5 flex items-center space-x-1.5 text-xs font-medium text-slate-400">
              <span>{pageMetaLabel}</span>
              <span>·</span>
              <span>{pageMetaSuffix}</span>
              <span>·</span>
              <span className="font-semibold text-blue-600">{breadcrumbPhase}</span>
            </div>
            <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{resultTitle}</h1>
          </div>

          <section
            className={cn(
              "space-y-6 rounded-2xl border border-slate-200/90 bg-white p-4 sm:space-y-8 sm:p-9",
              STITCH_ELEVATED_SHADOW,
            )}
            data-purpose="primary-result-card"
          >
          <div className="border-b border-slate-100 pb-5">
            <div className="mb-3 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500">
                <span>{breadcrumbService}</span>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-blue-600">{breadcrumbPhase}</span>
              </div>
              <AdminVerifyPersonalizedStitchHeaderSteps />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">{resultIntro}</h2>
            <p className="mt-1 text-xs font-normal text-slate-500 sm:text-sm">
              {isRealEstate
                ? "1차 FREE 검토와 2차 추가 확인 답변을 반영한 종합 소견입니다."
                : adminPersonalizedIntroSubtitle}
            </p>
          </div>

          <StitchPersonalizedMetricRibbon data={data} />

          <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-6" data-purpose="ai-analysis-details">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2.5">
                <span className="w-fit shrink-0 rounded bg-slate-900 px-2 py-0.5 text-xs font-bold tracking-wide text-white">
                  2차 검토
                </span>
                <h3 className={cn("text-base font-bold text-slate-900", FIRST_RESULT_READABLE_CLASS)}>
                  2차 개인화 정밀 소견
                </h3>
              </div>
              <span
                className={cn(
                  "shrink-0 text-xs font-medium text-slate-400 sm:max-w-[14rem] sm:text-right lg:max-w-none lg:text-left",
                  FIRST_RESULT_READABLE_CLASS,
                )}
              >
                1차 기본 확인 + 2차 추가 조건 종합
              </span>
            </div>

            <div className="pt-4 sm:pt-5">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 sm:p-5">
                <div className="mb-2 flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                  <span className="w-fit shrink-0 whitespace-nowrap rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-800">
                    {section01Label}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium text-slate-500",
                      FIRST_RESULT_READABLE_CLASS,
                    )}
                  >
                    {section01Meta}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm font-medium leading-relaxed text-slate-800",
                    FIRST_RESULT_READABLE_CLASS,
                  )}
                >
                  {personalized.integratedSituation}
                </p>
                {!isRealEstate && data.adminResponseSummaryLines?.length ? (
                  <div className="mt-3 space-y-1 border-t border-slate-200/80 pt-3">
                    <p className="text-xs font-semibold text-slate-700">응답 요약</p>
                    {data.adminResponseSummaryLines.map((line) => (
                      <p
                        key={line}
                        className={cn(
                          "text-xs font-normal leading-snug text-slate-600 sm:text-[13px]",
                          FIRST_RESULT_READABLE_CLASS,
                        )}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pt-5" data-purpose="key-confirmation-section">
              <span className="mb-2.5 block text-xs font-bold uppercase tracking-tight text-slate-400">
                {section02Label}
              </span>
              {isRealEstate && personalized.coreJudgment ? (
                <div className="mb-4 rounded-lg border border-slate-200/70 bg-white p-3.5 sm:p-4">
                  <p
                    className={cn(
                      "text-sm font-medium leading-relaxed text-slate-800",
                      FIRST_RESULT_READABLE_CLASS,
                    )}
                  >
                    {personalized.coreJudgment}
                  </p>
                </div>
              ) : null}
              <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                data-purpose="key-confirmation-results"
              >
                {data.keyMetrics.map((metric, index) => (
                  <StitchPersonalizedKeyConfirmationCard
                    key={metric.label}
                    metric={metric}
                    badgeTier={
                      data.keyMetricBadgeTiers?.[index] ??
                      (metric.footnote?.trim() ? "ok" : "missing")
                    }
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <span className="mb-2.5 block text-xs font-bold uppercase tracking-tight text-slate-400">
                03 주요 위험 요인
              </span>
              <div className="space-y-2.5">
                <div className="flex flex-col gap-1.5 rounded-lg border border-slate-200/70 bg-slate-50/60 p-3 sm:flex-row sm:items-start sm:gap-3">
                  <span className="shrink-0 text-xs font-bold text-slate-600 sm:min-w-[4.5rem]">1차 확인:</span>
                  <span
                    className={cn(
                      "text-xs text-slate-600 sm:text-sm",
                      FIRST_RESULT_READABLE_CLASS,
                    )}
                  >
                    {phase1RiskText}
                  </span>
                </div>
                {hideCase06EmptyPhase2RiskRow ? null : (
                <div className="flex flex-col gap-1.5 rounded-lg border border-amber-200 bg-amber-50/60 p-3 sm:flex-row sm:items-start sm:gap-3">
                  <span className="shrink-0 text-xs font-bold text-amber-700 sm:min-w-[4.5rem]">2차 추가:</span>
                  <span
                    className={cn(
                      "text-xs font-medium leading-relaxed text-slate-800 sm:text-sm",
                      FIRST_RESULT_READABLE_CLASS,
                    )}
                  >
                    {phase2RiskText}
                  </span>
                </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-tight text-slate-400">
                  04 확인이 필요한 사항
                </span>
                {data.unconfirmed.length > 0 ? (
                  <span className="text-[11px] font-medium text-blue-600">
                    실제 문서 원본 확인 시 확정 판정 가능
                  </span>
                ) : null}
              </div>
              {data.unconfirmed.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
                  {data.unconfirmed.slice(0, 3).map((item, index) => (
                    <div
                      key={item}
                      className="rounded-lg border border-slate-200 bg-slate-50/40 p-3.5"
                    >
                      {!isRealEstate ? (
                        <p className={cn("leading-relaxed text-slate-500", FIRST_RESULT_READABLE_CLASS)}>
                          {item}
                        </p>
                      ) : (
                        <>
                          <span className="mb-1 block text-xs font-bold text-slate-800">
                            {unconfirmedColumnLabels[index] ?? "추가 확인"}
                          </span>
                          <p className={cn("leading-relaxed text-slate-500", FIRST_RESULT_READABLE_CLASS)}>
                            {item}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3.5">
                  <p
                    className={cn(
                      "text-sm leading-relaxed text-slate-500",
                      FIRST_RESULT_READABLE_CLASS,
                    )}
                  >
                    현재 답변 범위에서는 별도로 확인이 필요한 항목이 보이지 않습니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          <AdminVerifyPersonalizedStitchFooterSteps />

          {isRealEstate && data.actions.length > 0 ? (
            <div className="pt-2" data-purpose="real-estate-personalized-actions">
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-tight text-slate-400">
                    {section05Label}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  {section05Title}
                </h3>
              </div>
              <ul className="space-y-2.5">
                {data.actions.map((action) => (
                  <li
                    key={action}
                    className="flex items-start gap-2.5 rounded-lg border border-slate-200/80 bg-slate-50/60 px-3.5 py-3 text-sm leading-relaxed text-slate-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" aria-hidden />
                    <span className={FIRST_RESULT_READABLE_CLASS}>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <AdminVerifyPersonalizedNextSteps
            onAiReport={onAiReport ?? onContinue}
            onExpert={onExpert}
            onDirect={onDirect}
            aiReportRequesting={aiReportRequesting}
            expertRequesting={expertRequesting}
            aiReportError={aiReportError}
            expertError={expertError}
            mode={domain}
            case06ExpertHandoffOnly={Boolean(data.case06ExpertHandoffRequired)}
          />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[950px] flex-1 flex-col px-0",
        isPersonalized
          ? "gap-8 py-6 sm:gap-9 sm:py-8 lg:max-w-[925px] lg:gap-7 lg:py-6"
          : "gap-8 py-0 sm:gap-9 lg:max-w-[925px] lg:gap-7",
      )}
    >
      <section className="flex flex-col gap-3.5 lg:gap-3">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-3 text-xs text-slate-500 lg:pb-2 lg:text-[11px]">
          <div className="flex items-center gap-1.5">
            <span>VERIFY</span>
            <span>·</span>
            <span>{data.stageLabel}</span>
            <span>&gt;</span>
            <span className="text-slate-800 font-medium">{resultTitle}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-400 lg:gap-2 lg:text-[10px]">
            <span>사건 유형: {data.caseClassificationLabel}</span>
            <span>|</span>
            <span>기준일: {data.referenceDateLabel}</span>
          </div>
        </div>
        <div className="mt-1 lg:mt-0">
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-[28px] lg:text-[22px]">
            {resultTitle}
          </h1>
          <p
            className={cn(
              "mt-2 text-sm text-slate-600 sm:text-[15px] lg:mt-1 lg:text-[13px]",
              FIRST_RESULT_READABLE_CLASS,
            )}
          >
            {resultIntro}
          </p>
        </div>
      </section>

      <section className="lg:pb-0.5">
        <StitchSectionHeading
          className="mb-3 lg:mb-3.5"
          title="01 / 현재 상황 한눈에 보기"
          badge={
            <span className="rounded border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 lg:px-1.5 lg:text-[10px]">
              1차 판정 결과
            </span>
          }
          meta={
            <span className="font-mono text-xs font-medium text-slate-500 lg:text-[10px]">
              ANALYSIS VERDICT
            </span>
          }
        />
        <div
          className={cn(
            "rounded-xl border p-6 shadow-sm sm:p-7 lg:rounded-lg lg:p-6 lg:shadow-none",
            isCaution
              ? "border-amber-200/70 bg-gradient-to-r from-amber-50/90 via-[#fffbeb] to-white lg:border-amber-200/80"
              : "border-emerald-200/70 bg-gradient-to-r from-emerald-50/90 via-white to-white lg:border-emerald-200/80",
          )}
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center lg:gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:gap-2.5 lg:text-lg lg:font-medium">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg leading-none lg:h-7 lg:w-7 lg:text-base",
                    isCaution
                      ? "border-amber-300 bg-amber-100 text-amber-700"
                      : "border-emerald-300 bg-emerald-100 text-emerald-700",
                  )}
                  aria-hidden
                >
                  {isCaution ? "⚠️" : "✓"}
                </span>
                <h3 className={FIRST_RESULT_READABLE_CLASS}>{displayStatusHeadline}</h3>
              </div>
              {data.adminResponseSummaryLines?.length ? (
                <div className="mt-3 space-y-1 border-t border-slate-200/80 pt-3">
                  <p className="text-xs font-semibold text-slate-700">응답 요약</p>
                  {data.adminResponseSummaryLines.map((line) => (
                    <p
                      key={line}
                      className={cn(
                        "text-[12px] font-normal leading-snug text-slate-500 sm:text-[13px]",
                        FIRST_RESULT_READABLE_CLASS,
                      )}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}
              <p
                className={cn(
                  "mt-3 text-sm font-normal text-slate-700 sm:mt-3.5 sm:text-[15px] lg:mt-2.5 lg:text-[13px] lg:text-slate-600",
                  FIRST_RESULT_READABLE_CLASS,
                )}
              >
                {displaySituationSummary}
              </p>
            </div>
            <div
              className={cn(
                "flex min-w-[220px] shrink-0 flex-col justify-center rounded-lg border bg-white p-5 shadow-sm lg:min-w-[190px] lg:p-4 lg:shadow-none",
                isCaution ? "border-amber-200/70 lg:border-amber-200/60" : "border-emerald-200/70 lg:border-emerald-200/60",
              )}
            >
              <div className="mb-2.5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between lg:mb-1.5">
                <span className="shrink-0 font-medium text-slate-500 lg:text-[11px]">주의 판독 등급</span>
                <span
                  className={cn(
                    "inline-flex w-fit max-w-full items-center gap-1 whitespace-nowrap rounded border px-2.5 py-1 text-xs font-bold lg:px-2 lg:py-0.5 lg:text-[10px] lg:font-medium",
                    isCaution
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800",
                  )}
                >
                  {data.gradeLabel}
                </span>
              </div>
              <SegmentMeter filled={data.gradeFilled} tone={data.statusTone} />
              <div className="mt-2.5 flex items-center justify-between border-t border-slate-100/80 pt-2.5 text-[11px] text-slate-400 lg:mt-1.5 lg:pt-1.5 lg:text-[10px]">
                <span>입력 답변 기반 판독</span>
                <span className="font-mono font-medium text-slate-600 lg:font-normal">1차 요약</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-8 sm:gap-9 lg:gap-5">
      <section>
        <StitchSectionHeading
          className="mb-3 lg:mb-3.5"
          titleTone="calm"
          title="02 / 핵심 확인 결과"
          subtitle={
            visibleMetricCount > 0
              ? `| 총 ${visibleMetricCount}개 핵심 영역 진단`
              : undefined
          }
          meta={
            <span className="font-mono text-xs text-slate-500 lg:text-[10px]">입력 답변 기반 판독</span>
          }
        />
        <div
          className={cn(
            "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:items-stretch lg:gap-3",
            firstResultMetricGridColsClass,
          )}
        >
          {data.keyMetrics.map((metric) => (
            <KeyMetricCard key={metric.label} metric={metric} refinePhrase={refinePhrase} />
          ))}
        </div>
      </section>

      <section>
        <StitchSectionHeading
          titleTone="risk"
          className="lg:mb-2"
          title="03 / 주요 위험 요인"
          subtitle="| 반려 방지 핵심 포인트"
          meta={
            <span className="shrink-0 whitespace-nowrap rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 lg:border-orange-300/70 lg:bg-orange-100/45 lg:px-1.5 lg:text-[10px] lg:text-orange-800">
              현지 실무 경험
            </span>
          }
        />
        <div className="flex flex-col gap-3.5 lg:gap-1.5">
          {data.cautions.length > 0 ? (
            data.cautions.map((caution) => (
              <div
                key={caution}
                className="flex items-start gap-4 rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 sm:p-6 lg:gap-2.5 lg:border-orange-300/70 lg:bg-orange-50/25 lg:p-3 lg:shadow-none lg:ring-1 lg:ring-orange-200/55"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-200/80 bg-amber-100 text-sm font-bold text-amber-700 lg:h-7 lg:w-7 lg:border-orange-300/80 lg:bg-orange-100 lg:text-orange-700 lg:text-xs lg:font-semibold">
                  !
                </div>
                <div className="flex-1">
                  <h4
                    className={cn(
                      "text-sm font-semibold text-slate-900 sm:text-base lg:text-[13px] lg:font-medium lg:leading-snug",
                      FIRST_RESULT_READABLE_CLASS,
                    )}
                  >
                    {refinePhrase(caution)}
                  </h4>
                  <p
                    className={cn(
                      "mt-2 text-xs text-slate-600 sm:text-sm lg:mt-1 lg:text-[12px] lg:font-normal lg:text-slate-500",
                      FIRST_RESULT_READABLE_CLASS,
                    )}
                  >
                    {isPersonalized
                      ? "입력하신 답변을 바탕으로 추가 확인이 필요한 항목입니다."
                      : "답변 기준 추가 확인이 필요한 항목입니다."}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-start gap-4 rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:gap-2.5 lg:p-3 lg:shadow-none">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50 text-sm font-bold text-emerald-700 lg:h-7 lg:w-7 lg:text-xs lg:font-semibold">
                ✓
              </div>
              <div className="flex-1">
                <h4
                  className={cn(
                    "text-sm font-semibold text-slate-900 sm:text-base lg:text-[13px] lg:font-medium lg:leading-snug",
                    FIRST_RESULT_READABLE_CLASS,
                  )}
                >
                  현재 확인한 답변에서는 주의할 위험 요인이 보이지 않습니다.
                </h4>
                <p
                  className={cn(
                    "mt-2 text-xs text-slate-600 sm:text-sm lg:mt-1 lg:text-[12px] lg:font-normal lg:text-slate-500",
                    FIRST_RESULT_READABLE_CLASS,
                  )}
                >
                  답변에 근거한 추가 주의 항목이 없습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 행정문서 1차 결과는 01~03만 표시 (04·05 숨김) */}
      {hideAdminFirstResultExtraSections ? null : (
      <>
      <section>
        <StitchSectionHeading
          titleTone="calm"
          title="04 / 확인이 필요한 사항"
          subtitle="| 아직 서류상 확정되지 않은 항목"
          meta={
            <span className="rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 lg:px-1.5 lg:text-[10px]">
              미확인 항목 정리
            </span>
          }
        />
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 lg:gap-1.5">
          {data.unconfirmed.length > 0 ? (
            data.unconfirmed.map((item) => (
              <div
                key={item}
                className="flex min-h-[110px] flex-col justify-between rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 lg:min-h-0 lg:border-slate-200/60 lg:p-3 lg:shadow-none"
              >
                <div>
                  <div className="mb-2 flex items-center justify-between lg:mb-1 lg:items-center lg:gap-1.5">
                    <div className="flex items-start gap-2 text-sm font-semibold text-slate-900 sm:text-base lg:min-w-0 lg:flex-1 lg:gap-1 lg:text-[12px] lg:font-medium lg:leading-snug">
                      <span
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-400 text-[10px] font-bold leading-none lg:mt-0 lg:h-3.5 lg:w-3.5 lg:text-[9px]"
                        aria-hidden
                      />
                      <span className={FIRST_RESULT_READABLE_CLASS}>{refinePhrase(item)}</span>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 lg:px-1.5 lg:text-[10px] lg:font-medium",
                        FIRST_RESULT_READABLE_CLASS,
                      )}
                    >
                      추가 확인
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-2 pl-6 text-xs text-slate-600 sm:text-[13px] lg:mt-1 lg:pl-5 lg:text-[11px] lg:font-normal lg:text-slate-500",
                      FIRST_RESULT_READABLE_CLASS,
                    )}
                  >
                    답변만으로는 확정하기 어려운 항목입니다.
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex min-h-[110px] flex-col justify-between rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm lg:min-h-0 lg:border-slate-200/60 lg:p-3 lg:shadow-none">
              <div>
                <div className="mb-2 flex items-center justify-between lg:mb-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 sm:text-base lg:gap-1.5 lg:text-[13px] lg:font-medium">
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-emerald-400 bg-emerald-50 text-[10px] font-bold leading-none text-emerald-700 lg:h-3.5 lg:w-3.5 lg:text-[9px]"
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span>추가 확인 항목 없음</span>
                  </div>
                  <span className="rounded border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 lg:px-1.5 lg:text-[10px] lg:font-medium">
                    ✓ 확인
                  </span>
                </div>
                <p className="mt-2 pl-6 text-xs leading-relaxed text-slate-600 sm:text-[13px] lg:mt-1 lg:pl-5 lg:text-[11px] lg:font-normal lg:leading-relaxed lg:text-slate-500">
                  현재 답변 범위에서는 별도로 확인이 필요한 항목이 보이지 않습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <StitchSectionHeading
          titleTone="calm"
          title="05 / 지금 확인해 보세요"
          subtitle="| 대행 전 자가 확인 권장"
          meta={
            <span className="rounded border border-slate-200/80 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[#0f172a] lg:px-2 lg:text-[10px]">
              먼저 직접 확인
            </span>
          }
        />
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3 lg:gap-1.5">
          {data.actions.map((action, index) => (
            <div
              key={action}
              className="flex min-h-[180px] flex-col justify-between rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-slate-300 sm:p-6 lg:min-h-0 lg:border-slate-200/60 lg:p-3 lg:shadow-none"
            >
              <div>
                <div className="mb-2.5 flex items-center justify-between lg:mb-1">
                  <span className="rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-[#0f172a] lg:px-1.5 lg:text-[10px] lg:font-medium">
                    STEP {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 lg:text-[10px]">자가 확인</span>
                </div>
                <h4
                  className={cn(
                    "mt-1 text-sm font-semibold tracking-tight text-slate-900 sm:text-base lg:mt-0 lg:text-[13px] lg:font-medium lg:leading-snug",
                    FIRST_RESULT_READABLE_CLASS,
                  )}
                >
                  {refineParagraph(action)}
                </h4>
                <p
                  className={cn(
                    "mt-2 text-xs text-slate-600 sm:text-sm lg:mt-1 lg:text-[12px] lg:font-normal lg:text-slate-500",
                    FIRST_RESULT_READABLE_CLASS,
                  )}
                >
                  {isPersonalized
                    ? "현재 상황에 맞게 먼저 직접 확인해 보시는 것을 권장합니다."
                    : "먼저 직접 확인해 보시는 것을 권장합니다."}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100/80 pt-3.5 text-xs font-medium text-slate-500 lg:mt-2 lg:pt-2 lg:text-[11px] lg:font-normal lg:text-slate-400">
                <StepCheckIcon />
                <span>대행 전 자가 확인</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      </>
      )}

      {transitionHooks ? (
        <VerifyFirstResultTransitionSection
          transitionHooks={transitionHooks}
          data={data}
          onContinue={onContinue}
          onAiSummaryNavigate={onAiSummaryNavigate}
          aiSummaryNavigating={aiSummaryNavigating}
          ctaPrimaryClasses={ctaPrimaryClasses}
          ctaSecondaryClasses={ctaSecondaryClasses}
          domain={domain}
        />
      ) : null}
      </div>
    </div>
  );
}
