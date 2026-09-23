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
  deriveStageFromSituation,
  getQ1ResolvedCase,
  getAdminChoiceNoteKey,
  getAdminVerifyPhase1VisibleFields,
  CASE02_NON_PAYMENT_SANCTION_STATED,
  CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR,
  case02EffectivePaymentAmount,
  case02NormalizeNonPaymentNoticeValue,
  getCase02FieldOptionLabel,
  getCase03FieldOptionLabel,
  getCase04FieldOptionLabel,
  getCase05FieldOptionLabel,
  getCase06FieldOptionLabel,
  CASE03_OPTION_LABELS,
  isCase01Phase1Complete,
  isCase02Phase1Complete,
  isCase03Phase1Complete,
  isCase04Phase1Complete,
  isCase05Phase1Complete,
  isCase05DispositionTypeUnclear,
  case05DispositionTypeIsRightsEnded,
  isCase06Phase1Complete,
  isCase06ExpertTerminal,
  MASTER_CASE_LABELS,
  wasFieldAsked,
  type CaseResolutionProfile,
  type FieldAssessment,
} from "@/lib/adminVerifyProfiling";
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
  return { footnote: skippedText, status: "ok" };
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

function appendCase06Phase1ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  if (!isCase06Phase1Complete(answers)) return;

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

function appendCase06Phase2ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
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
  } else if (isCase05DispositionTypeUnclear(type) || type === "unsure") {
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
  }

  if (deadline === "specific_date" || deadline === "known_date") {
    cautions.push("처분 관련 대응 기한이 확인된 상태 — 기한 내 대응이 필요함");
    actions.push("처분 관련 대응 기한을 다시 확인해 보세요.");
  } else if (deadline === "past_possible") {
    cautions.push("기한이 지났을 가능성이 있음 — 즉시 확인이 필요함");
    actions.push("처분 관련 기한과 현재 날짜를 대조해 보세요.");
  } else if (
    deadline === "uncertain" ||
    deadline === "unsure" ||
    deadline === "not_stated" ||
    deadline === "period_stated"
  ) {
    unconfirmed.push("처분 관련 대응 기한");
    actions.push("처분과 관련한 기한이 적혀 있는지 확인해 보세요.");
  }
}

function appendCase05Phase2ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  const rel = answers.case05_factRelationship;
  if (rel === "partial" || rel === "mismatch") {
    cautions.push("처분 내용과 실제 상황이 다를 수 있음 — 사실관계 확인 필요");
    actions.push("처분 내용과 실제 상황을 대조해 보세요.");
  } else if (rel === "hard_to_judge" || rel === "unknown") {
    unconfirmed.push("처분 내용과 실제 상황의 관계");
  }

  const reason = answers.case05_dispositionReason;
  if (reason === "no_clear_reason" || reason === "unsure") {
    unconfirmed.push("처분 사유");
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
  } else if (outcome === "no_result") {
    unconfirmed.push("기관 후속 결과");
  }

  const repeat = answers.case05_repeatFollowUp;
  if (repeat && repeat !== "not_applicable") {
    cautions.push("처분 후 추가 대응이 반복됨 — 동일 사건 내 후속 확인 필요");
    actions.push("이전 대응 내용과 기관의 후속 안내를 함께 확인해 보세요.");
  }

  if (answers.case05_blockage) {
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
  } else if (goal === "deadline") {
    actions.push("보완 제출 기한을 먼저 확인해 보세요.");
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
    cautions.push("보완 제출 기한이 확인된 상태 — 기한 내 대응이 필요함");
    actions.push("보완 제출 기한을 다시 확인해 보세요.");
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
  } else if (goal === "deadline") {
    actions.push("보완 제출 기한을 먼저 확인해 보세요.");
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
  if (goal === "understand_agency_intent" || goal === "prepare_materials") {
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
    cautions.push("이미 납부했으나 처리 여부 확인이 필요한 상태임");
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
  const goal = answers.case03_confirmGoal;
  const response = answers.case03_customerResponse;
  const deadline = answers.case03_deadline;

  if (demand === "reason_unclear" || demand === "prep_unclear") {
    unconfirmed.push("기관 요구 내용");
  } else if (demand === "repeat_demand") {
    cautions.push("이미 대응했으나 추가 출석·소명 요구가 있는 상태임");
    actions.push("이전에 설명·출석한 내용과 이번 추가 요구를 함께 확인해 보세요.");
  }

  if (goal === "understand_agency_intent" || goal === "prepare_materials") {
    actions.push("기관이 확인하려는 내용과 준비할 자료를 먼저 정리해 보세요.");
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
    cautions.push("출석·소명 기한이 확인된 상태 — 기한 내 대응이 필요함");
    actions.push("출석·소명 기한을 다시 확인해 보세요.");
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
  }

  const repeat = answers.case03_repeatFollowUp;
  if (repeat && repeat !== "not_applicable") {
    cautions.push("추가 설명·출석·자료 요구가 있음 — 반복 대응 확인 필요");
    actions.push("이전 설명·출석 내용과 기관의 추가 요구를 함께 확인해 보세요.");
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
      return getCase03FieldOptionLabel(fieldId, value);
    case "CASE_04":
      return getCase04FieldOptionLabel(fieldId, value);
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
  const footnotes = fields
    .map((fieldId) => {
      const value = answers[fieldId]?.trim();
      if (!value) return null;
      const label = classifiedFieldOptionLabel(q1Case, fieldId, value, answers);
      return label;
    })
    .filter((item): item is string => Boolean(item));

  if (footnotes.length === 0) return keyMetrics;

  const metrics = keyMetrics.map((metric) => ({ ...metric }));
  const chunkSize = Math.max(1, Math.ceil(footnotes.length / 4));
  for (let index = 0; index < 4; index += 1) {
    const chunk = footnotes.slice(index * chunkSize, (index + 1) * chunkSize);
    if (chunk.length === 0) continue;
    const hasCaution = fields
      .slice(index * chunkSize, (index + 1) * chunkSize)
      .some((fieldId) => {
        const value = answers[fieldId]?.trim();
        return value ? CLASSIFIED_CAUTION_ANSWER_VALUES.has(value) : false;
      });
    metrics[index] = {
      ...metrics[index],
      footnote: chunk.join(" · "),
      status: hasCaution ? "caution" : "ok",
    };
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

  if (goal === "fact_difference" || goal === "verify_violation") {
    cautions.push("사실관계 차이 확인이 우선 목표로 선택됨");
    actions.push("알고 있는 사실과 기관 확인 내용을 대조해 보세요.");
  } else if (goal === "what_when") {
    actions.push("이 통지 후 필요한 대응과 기한을 먼저 확인해 보세요.");
  } else if (goal === "unsure") {
    unconfirmed.push("우선 확인할 항목");
  }

  if (responded === "none") {
    cautions.push("아직 기관에 설명하거나 자료를 제출하지 않은 상태임");
    actions.push("통지서 원문과 요구 내용을 먼저 확인해 보세요.");
  } else if (responded === "more_demand") {
    cautions.push("기관에서 추가 대응을 요구한 상태임");
    unconfirmed.push("기관이 요구한 추가 대응 내용");
  } else if (responded === "waiting_response" || responded === "explained_unresolved") {
    unconfirmed.push("기관 답변·후속 안내");
  }

  if (deadline === "confirmed") {
    cautions.push("대응 기한이 확인된 상태 — 기한 내 확인이 필요함");
    actions.push("통지서에 적힌 대응 기한을 다시 확인해 보세요.");
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

function appendCase01Phase2ResultSignals(
  answers: ReviewAnswers,
  cautions: string[],
  unconfirmed: string[],
  actions: string[],
): void {
  const rel = answers.case01_factRelationship;
  if (rel === "deny_action") {
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

  const authorityResponse = answers.case01_authorityResponse;
  if (authorityResponse === "more_required") {
    cautions.push("기관에서 추가 자료·설명을 요구함");
    unconfirmed.push("기관이 요구한 추가 자료·설명");
  } else if (authorityResponse === "no_reply_yet") {
    unconfirmed.push("기관 답변");
  } else if (authorityResponse === "procedure_unknown") {
    unconfirmed.push("현재 진행 중인 절차");
  }
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
    const violationLabel =
      violation === "other"
        ? answers[CASE01_VIOLATION_CONTENT_NOTE_KEY]?.trim() || "직접 설명한 상황"
        : case01Label(violation);
    if (violationLabel) {
      metrics[0] = {
        ...metrics[0],
        footnote: violationLabel,
        status:
          violation === "unsure" || violation === "situation_mismatch" ? "caution" : "ok",
      };
    }
  }

  if (goal) {
    const goalLabel = case01Label(goal);
    if (goalLabel) {
      metrics[1] = {
        ...metrics[1],
        footnote: `우선 확인 목표: ${goalLabel}`,
        status: goal === "unsure" ? "caution" : "ok",
      };
    }
  }

  const progressParts: string[] = [];
  if (responded === "none") progressParts.push("아직 설명·자료 제출 전");
  else if (responded) {
    const label = case01Label(responded);
    if (label) progressParts.push(label);
  }
  if (deadline === "confirmed") progressParts.push("대응 기한 확인됨");
  else if (deadline) {
    const label = case01Label(deadline);
    if (label) progressParts.push(label);
  }
  if (progressParts.length > 0) {
    const needsCaution =
      responded === "none" ||
      responded === "more_demand" ||
      deadline === "overdue_concern" ||
      deadline === "not_checked" ||
      deadline === "unknown";
    metrics[2] = {
      ...metrics[2],
      footnote: progressParts.join(" · "),
      status: needsCaution ? "caution" : "ok",
    };
  }

  if (rel) {
    const relLabel = case01Label(rel);
    if (relLabel) {
      metrics[3] = {
        ...metrics[3],
        footnote: relLabel,
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
    }
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
      : answers.case01_factRelationship === "mismatch" || answers.case01_factRelationship === "partial"
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
    "이번 상황에서는 별도 확인하지 않았습니다",
  );
  const contentMetric = metricFromAssessment(
    contentAssessment,
    "기본 서류 내용 확인",
    "서류 내용 누락·오류 확인 필요",
    "서류 내용 추가 확인 필요",
    "이번 상황에서는 별도 확인하지 않았습니다",
  );
  const formatMetric = metricFromAssessment(
    formatAssessment,
    "형식·증빙 확인",
    "일부 증빙 확인 필요",
    "형식·증빙 추가 확인 필요",
    "이번 상황에서는 별도 확인하지 않았습니다",
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
    "이번 상황에서는 별도 확인하지 않았습니다",
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

  if (case01Active && isCase01Phase1Complete(answers)) {
    keyMetrics = applyCase01KeyMetrics(answers, keyMetrics);
  } else if (
    q1Case &&
    q1Case !== "UNIVERSAL" &&
    isClassifiedCasePhase1CompleteForResult(q1Case, answers)
  ) {
    keyMetrics = applyGenericClassifiedCaseKeyMetrics(q1Case, answers, keyMetrics);
  }

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
  const situationSummary = situationSummaryFromProfile(
    profile,
    situation,
    situationNote,
    hasIssues,
  );

  const stageLabel =
    stage === "prevent" ? "사전 검토" : stage === "case" ? "사후 검토" : "검토";

  const caseClassId = profile.caseClassification.value ?? "UNIVERSAL";

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
    unconfirmed: [...new Set(unconfirmed)].slice(0, 4),
    actions: [...new Set(actions)].slice(0, 3),
    referenceDateLabel: formatReferenceDateLabel(),
    caseClassificationLabel: MASTER_CASE_LABELS[caseClassId],
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

function buildCase01IntegratedSituation(answers: ReviewAnswers): string {
  const violation = answers.case01_violationContent;
  const goal = answers.case01_confirmGoal;
  const responded = answers.case01_customerResponded;
  const deadline = answers.case01_deadline;

  let opening =
    "현재는 받은 통지 내용을 바탕으로 상황을 정리한 상태입니다.";
  if (
    violation === "situation_mismatch" ||
    goal === "verify_violation" ||
    goal === "fact_difference"
  ) {
    opening =
      "현재는 통지에서 지적한 내용이 실제 본인의 상황에 해당하는지 먼저 확인할 필요가 있는 상태입니다.";
  } else if (violation === "unsure") {
    opening =
      "현재는 통지에서 어떤 부분이 문제라고 지적되었는지 먼저 파악할 필요가 있는 상태입니다.";
  } else if (goal === "what_when") {
    opening = "현재는 이 통지 후 필요한 대응과 기한을 먼저 확인할 필요가 있는 상태입니다.";
  }

  const middle =
    responded === "none"
      ? describeCustomerResponseNone()
      : responded === "contacted" || responded === "attended"
        ? describeCustomerResponseActive("기관에 문의하거나 설명·출석")
        : responded === "resubmitted"
          ? describeCustomerResponseActive("자료 제출")
          : responded === "waiting_response" || responded === "explained_unresolved"
            ? "이미 일부 대응을 했으나 기관 답변·후속 안내 확인이 필요한 상태이며"
            : responded === "more_demand"
              ? "기관에서 추가 대응을 요구한 상태이며"
              : null;

  const closing =
    deadline === "confirmed"
      ? describeDeadlineConfirmed()
      : deadline === "overdue_concern"
        ? describeDeadlineOverdueConcern()
        : deadline === "uncertain" ||
            deadline === "not_checked" ||
            deadline === "unknown" ||
            deadline === "unsure" ||
            deadline === "not_stated" ||
            deadline === "not_advised"
          ? describeDeadlineUncertain()
          : null;

  return joinNarrative([opening, middle, closing]);
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
    opening = "현재는 이미 납부했으나 기관 처리 여부를 확인할 필요가 있는 상태입니다.";
  }

  const middle =
    status === "not_paid"
      ? describeCustomerResponseNone().replace("설명하거나 자료를 제출", "납부")
      : status === "paid_unverified"
        ? "이미 납부했으나 기관 처리 여부가 확인되지 않은 상태이며"
        : status === "partial"
          ? "일부만 납부한 상태이며"
          : null;

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
  if (goal === "understand_agency_intent" || demand === "reason_unclear" || demand === "prep_unclear") {
    opening =
      "현재는 기관이 확인하려는 내용과 실제 상황의 관계를 먼저 확인할 필요가 있는 상태입니다.";
  } else if (goal === "sufficient_explanation" || goal === "repeat_response" || demand === "repeat_demand") {
    opening = "현재는 이전 대응 내용과 기관의 추가 요구를 함께 확인할 필요가 있는 상태입니다.";
  }

  const middle =
    response === "none"
      ? describeCustomerResponseNone().replace("설명하거나 자료를 제출", "설명하거나 방문")
      : response === "phone_message" || response === "attendance"
        ? describeCustomerResponseActive("일부 문의·출석")
        : response === "explanation_with_docs"
          ? describeCustomerResponseActive("설명과 자료 제출")
          : null;

  const closing =
    deadline === "specific_date"
      ? "출석·소명 기한은 확인된 상태입니다."
      : deadline === "uncertain" || deadline === "period_stated" || deadline === "not_stated" || deadline === "unsure"
        ? "출석·소명 기한은 아직 명확히 확인되지 않았습니다."
        : null;

  return joinNarrative([opening, middle, closing]);
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

  const middle =
    response === "none"
      ? describeCustomerResponseNone()
      : response === "partial_submitted" || response === "resubmitted"
        ? describeCustomerResponseActive("일부 또는 전체 보완 제출")
        : null;

  const closing =
    deadline === "confirmed" || deadline === "specific_date"
      ? "보완 제출 기한은 확인된 상태입니다."
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
  if (type === "situation_mismatch" || goal === "understand_impact") {
    opening = "현재는 처분 내용이 실제 상황에 어떤 영향을 주는지 먼저 확인할 필요가 있는 상태입니다.";
  } else if (type === "reason_hard_to_understand" || goal === "understand_reason") {
    opening = "현재는 처분 사유를 먼저 이해할 필요가 있는 상태입니다.";
  } else if (goal === "appeal_possibility") {
    opening = "현재는 이의·재검토 가능 여부를 먼저 확인할 필요가 있는 상태입니다.";
  }

  const middle =
    response === "none"
      ? describeCustomerResponseNone()
      : response === "explanation_submitted" || response === "documents_submitted"
        ? describeCustomerResponseActive("설명·자료 제출")
        : response === "appeal_requested"
          ? describeCustomerResponseActive("이의·재검토 요청")
          : null;

  const closing =
    deadline === "specific_date" || deadline === "known_date"
      ? "처분 관련 대응 기한은 확인된 상태입니다."
      : deadline === "past_possible"
        ? describeDeadlineOverdueConcern()
        : deadline === "uncertain" || deadline === "unsure" || deadline === "not_stated" || deadline === "period_stated"
          ? "처분 관련 대응 기한은 아직 명확히 확인되지 않았습니다."
          : null;

  return joinNarrative([opening, middle, closing]);
}

function buildCase06IntegratedSituation(answers: ReviewAnswers, profile: CaseResolutionProfile): string {
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
  const q1Case = getQ1ResolvedCase(answers);
  const parts: string[] = [];

  if (profile.event.value) {
    parts.push(`통지·안내의 핵심은 ${profile.event.value} 쪽으로 파악됩니다.`);
  }
  if (profile.authorityClaim.value && profile.authorityClaim.status === "confirmed") {
    parts.push(`기관 요구는 ${profile.authorityClaim.value} 흐름으로 정리됩니다.`);
  }
  if (profile.customerAction.value && profile.customerAction.status === "confirmed") {
    const action = profile.customerAction.value;
    if (action.includes("아직") || action.includes("없음") || answers.case01_customerResponded === "none" || answers.case03_customerResponse === "none" || answers.case05_customerResponse === "none") {
      parts.push("아직 별도 대응은 진행되지 않은 상태입니다.");
    } else {
      parts.push(`현재까지의 대응은 ${action} 상태로 확인됩니다.`);
    }
  }
  if (profile.deadline.value?.includes("확인 완료") || ["confirmed", "specific_date", "known_date"].includes(answers.case01_deadline ?? answers.case02_deadline ?? answers.case03_deadline ?? "")) {
    parts.push("대응 기한은 확인된 범위 안에서 추적할 수 있습니다.");
  }

  if (parts.length === 0) {
    if (q1Case === "CASE_06") {
      return "1차 확인에서는 문서의 기본 성격과 현재 이해 수준을 정리한 상태입니다.";
    }
    return "1차 확인에서는 기본적인 상황 정리가 완료된 상태입니다.";
  }
  return parts.join(" ");
}

function buildPhase2RiskSummary(answers: ReviewAnswers, profile: CaseResolutionProfile): string {
  const q1Case = getQ1ResolvedCase(answers);
  const rel = profile.actualSituation.value;
  const blockage = profile.currentBlockage.value;
  const evidence = profile.evidence.value;

  if (q1Case === "CASE_01" && answers.case01_factRelationship) {
    const relValue = answers.case01_factRelationship;
    if (relValue === "deny_action") {
      return "2차 추가 확인에서는 기관이 문제라고 보는 행동을 실제로 하지 않았다는 점이 핵심입니다. 통지 내용과 실제 상황을 대조할 필요가 있습니다.";
    }
    if (relValue === "partial_situation" || relValue === "partial") {
      return "2차 추가 확인에서는 행동 자체는 맞지만 기관이 알고 있는 상황과 차이가 있을 수 있다는 점이 핵심입니다.";
    }
    if (relValue === "date_place_wrong") {
      return "2차 추가 확인에서는 날짜·장소 정보가 실제와 다를 수 있다는 점이 핵심입니다.";
    }
    if (relValue === "info_mismatch") {
      return "2차 추가 확인에서는 제출·등록 정보와 기관 확인 내용의 불일치 가능성이 핵심입니다.";
    }
  }

  if (q1Case === "CASE_02") {
    if (answers.case02_situationMatch) {
      if (
        answers.case02_situationMatch === "partial" ||
        answers.case02_situationMatch === "not_applicable"
      ) {
        return "2차 추가 확인에서는 납부 요구와 실제 상황이 다르게 느껴진다는 점이 핵심입니다.";
      }
      if (
        answers.case02_paymentAmount === "amount_differs" ||
        answers.case02_paymentAmount === "paid_redemand"
      ) {
        return "2차 추가 확인에서는 안내 금액과 알고 있는 금액의 차이, 또는 재요구 가능성이 핵심입니다.";
      }
    }
    const noticeForPhase2Summary = case02NormalizeNonPaymentNoticeValue(
      answers.case02_nonPaymentNotice,
    );
    if (
      noticeForPhase2Summary === "interest_stated" ||
      noticeForPhase2Summary === CASE02_NON_PAYMENT_SANCTION_STATED
    ) {
      return "2차 추가 확인에서는 미납 시 추가 조치 안내가 있음 — 기한·내용 확인이 필요합니다.";
    }
  }

  if (q1Case === "CASE_03" && answers.case03_factRelationship) {
    if (answers.case03_factRelationship === "partial" || answers.case03_factRelationship === "mismatch") {
      return "2차 추가 확인에서는 기관이 확인하려는 내용과 실제 상황이 다르게 느껴진다는 점이 핵심입니다.";
    }
    if (answers.case03_explanationDetail === "agency_redemand") {
      return "2차 추가 확인에서는 설명 후 기관이 다시 다른 내용을 요구했다는 점이 핵심입니다.";
    }
  }

  if (q1Case === "CASE_04" && answers.case04_submissionRelation) {
    if (answers.case04_submissionRelation === "partial" || answers.case04_submissionRelation === "mismatch") {
      return "2차 추가 확인에서는 보완 요구 내용과 실제 제출 상황의 차이가 핵심입니다.";
    }
  }

  if (q1Case === "CASE_05" && answers.case05_factRelationship) {
    if (answers.case05_factRelationship === "partial" || answers.case05_factRelationship === "mismatch") {
      return "2차 추가 확인에서는 처분 내용과 실제 상황의 차이 가능성이 핵심입니다.";
    }
    if (answers.case05_authorityFollowUp === "maintained" || answers.case05_dispositionOutcome === "maintained") {
      return "2차 추가 확인에서는 처분 유지 또는 추가 요구가 이어지고 있다는 점이 핵심입니다.";
    }
  }

  if (q1Case === "CASE_06") {
    if (answers.case06_actualCore === "still_unclear") {
      return "2차 추가 확인에서는 문서의 핵심 내용이 아직 명확하지 않다는 점이 핵심입니다.";
    }
    if (answers.case06_requiredAction === "hard_to_tell") {
      return "2차 추가 확인에서는 기관이 요구하는 조치가 아직 명확하지 않다는 점이 핵심입니다.";
    }
  }

  if (rel && rel !== "서류 내용과 실제 상황이 일치한다고 응답") {
    return `2차 추가 확인에서는 ${rel} 쪽으로 정리됩니다.`;
  }
  if (blockage) {
    return `2차 추가 확인에서는 ${blockage} 부분이 현재 가장 막혀 있는 상태입니다.`;
  }
  if (evidence && (evidence.includes("없") || evidence.includes("부족"))) {
    return "2차 추가 확인에서는 확인 가능한 자료가 제한적인 상태입니다.";
  }

  return "2차 답변에서 추가로 확인된 위험 요인은 현재 보이지 않습니다.";
}

export function buildAdminVerifyPersonalizedContext(
  answers: ReviewAnswers,
  evidenceFileName?: string,
): AdminVerifyPersonalizedContext {
  const profile = buildCaseResolutionProfile(answers);
  const integratedSituation = buildIntegratedSituationFromProfile(answers, profile);
  const phase1Summary = buildPhase1RiskSummary(answers, profile);
  const phase2Summary = buildPhase2RiskSummary(answers, profile);

  return {
    integratedSituation,
    phase1Facts: [phase1Summary],
    phase2Additions: [phase2Summary],
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

  return {
    ...base,
    statusHeadline: hasIssues ? "추가 확인이 필요한 상태입니다" : base.statusHeadline,
    statusTone: hasIssues ? "caution" : base.statusTone,
    situationSummary: personalizedSummary,
    gradeFilled: hasIssues ? Math.max(base.gradeFilled, 2) : base.gradeFilled,
    gradeLabel: hasIssues ? "주의 요망 (2단계)" : base.gradeLabel,
    cautions: [...new Set(cautions)].slice(0, 6),
    unconfirmed: [...new Set(unconfirmed)].slice(0, 6),
    actions: [...new Set(actions)].slice(0, 4),
    personalizedContext: personalizedContext ?? {
      integratedSituation,
      phase1Facts: [],
      phase2Additions: [],
      documentsNeededNote: DOCUMENTS_NEEDED_NOTE,
    },
    case06ExpertHandoffRequired: q1Case === "CASE_06" && isCase06ExpertTerminal(answers),
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
    <div className={cn("mb-3 flex items-center justify-between lg:mb-1.5", className)}>
      <div className="flex items-center gap-2 lg:gap-1.5">
        <h2
          className={cn(
            "text-xs font-bold uppercase tracking-wide text-slate-900 sm:text-sm",
            SECTION_TITLE_TONE_CLASSES[titleTone],
          )}
        >
          {title}
        </h2>
        {badge}
        {subtitle ? (
          <span className="text-xs font-normal text-slate-400 lg:text-[11px] lg:font-normal lg:text-slate-400">
            {subtitle}
          </span>
        ) : null}
      </div>
      {meta}
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
  if (trimmed === "이번 상황에서는 별도 확인하지 않았습니다") {
    return refinePhrase("이번 상황에서는 별도 확인하지 않았습니다.");
  }
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
  return (
    <div
      className={cn(
        "flex min-h-[148px] flex-col rounded-lg border bg-white p-5 shadow-sm transition-all lg:h-full lg:min-h-[168px] lg:p-[1.125rem] lg:shadow-none",
        isOk
          ? "border-slate-200/80 hover:border-slate-300 lg:border-slate-200/60"
          : "border border-amber-200/80 bg-amber-50/15 hover:border-amber-300/90 lg:border-amber-200/60",
      )}
    >
      <div className="lg:min-h-[4.25rem]">
        <div className="mb-2.5 flex items-center justify-between lg:mb-2">
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
          "mt-4 border-t pt-3 lg:mt-auto lg:pt-3",
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
  const hasIssues =
    data.cautions.length > 0 ||
    data.unconfirmed.length > 0 ||
    data.keyMetrics.some((metric) => metric.status === "caution");
  const isCaution = data.statusTone === "caution";

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
            {isCaution ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-50">
                <span className="text-[10px] font-bold leading-tight text-amber-700">
                  보완
                  <br />
                  <span className="text-[9px] font-normal">권장</span>
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
                isCaution ? "text-amber-700" : "text-emerald-700",
              )}
            >
              {isCaution ? "주의 수준" : "양호 수준"}
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
          <span className="text-[11px] text-slate-400">호치민·하노이 심사 기준</span>
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
              {hasIssues ? "조건부 부합" : "부합"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">증빙 양식 점검 필요</span>
        </div>

        <div className={cn(metricCardClass, STITCH_CARD_SUBTLE_SHADOW)}>
          <div className="flex w-full items-center justify-between">
            <span className={numberBadgeClass}>4</span>
            <span className="text-xs font-semibold text-slate-500">필수 보완 서류</span>
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
              {supplementCount > 0 ? `${supplementCount}개 서류 보완` : "보완 없음"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {personalized?.documentsNeededNote || "번역공증본 및 관할양식"}
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

function stitchPersonalizedKeyConfirmationBadge(
  metric: AdminVerifyKeyMetric,
  index: number,
  total: number,
): { label: string; className: string } {
  if (metric.status === "ok") {
    if (index === total - 1) {
      return {
        label: "적합",
        className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      };
    }
    return {
      label: "확인 완료",
      className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    };
  }
  if (index === 2) {
    return {
      label: "보완 권장",
      className: "bg-amber-50 text-amber-700 border border-amber-200",
    };
  }
  return {
    label: "추가 확인",
    className: "bg-blue-50 text-blue-600 border border-blue-200",
  };
}

function StitchPersonalizedKeyConfirmationCard({
  metric,
  index,
  total,
}: {
  metric: AdminVerifyKeyMetric;
  index: number;
  total: number;
}) {
  const badge = stitchPersonalizedKeyConfirmationBadge(metric, index, total);

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="min-w-0 space-y-0.5">
        <span className="block text-[11px] font-medium text-slate-400">{metric.label}</span>
        <span className="text-sm font-bold text-slate-800">{metric.title}</span>
      </div>
      <span className={cn("shrink-0 px-2.5 py-1 text-xs font-semibold rounded", badge.className)}>
        {badge.label}
      </span>
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
          title: "AI 리포트 요청하기",
          description: isRealEstate
            ? "현재 확인한 내용을 바탕으로 관련 문서를 제출하면 AI 리포트로 이어집니다."
            : "현재 2차 개인화 결과를 바탕으로 실제 문서를 확인하고 더 자세한 3차 AI 리포트로 이어집니다.",
          buttonLabel: "AI 검토 상세 리포트",
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
          buttonLabel: "전문가 진행하기",
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
              : "1·2차 검토 데이터를 바탕으로 3차 AI 리포트 발급 또는 전담 전문가 자문으로 바로 연계됩니다."
        }
        cards={cards}
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
      <div className="mb-4 max-w-2xl">
        <span className="mb-1.5 inline-block rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          무료 · 1차 종합 결과
        </span>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-slate-600">
          <li>
            <span className="font-medium text-slate-700">왜: </span>
            {transitionHooks.hookWhy}
          </li>
          <li>
            <span className="font-medium text-slate-700">누구에게: </span>
            {transitionHooks.hookWho}
          </li>
          <li>
            <span className="font-medium text-slate-700">더 확인: </span>
            {transitionHooks.hookWhatMore}
          </li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">{transitionHooks.trustLine}</p>
      </div>
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
            buttonLabel: aiSummaryNavigating
              ? "이동 중..."
              : !onAiSummaryNavigate && aiSummaryOpen
                ? "AI 정보 접기"
                : "AI 정보 보기",
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
      {aiSummaryOpen ? <VerifyFirstResultAiSummaryPanel data={data} /> : null}
      {onAiSummaryNavigate ? (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setAiSummaryOpen((open) => !open)}
            className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
          >
            {aiSummaryOpen ? "AI 정리 접기" : "AI 정리 미리보기"}
          </button>
        </div>
      ) : null}
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
            <p className="text-sm font-normal text-slate-500 sm:text-base">{resultIntro}</p>
          </div>

          <section
            className={cn(
              "space-y-8 rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-9",
              STITCH_ELEVATED_SHADOW,
            )}
            data-purpose="primary-result-card"
          >
          <div className="border-b border-slate-100 pb-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
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
                : "입력하신 관할 지역 및 서류 세부 조건과 최신 행정청 심사 기준을 반영한 2차 종합 소견입니다."}
            </p>
          </div>

          <StitchPersonalizedMetricRibbon data={data} />

          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6" data-purpose="ai-analysis-details">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-bold tracking-wide text-white">
                  2차 검토
                </span>
                <h3 className="text-base font-bold text-slate-900">2차 개인화 정밀 소견</h3>
              </div>
              <span className="text-xs font-medium text-slate-400">1차 기본 확인 + 2차 추가 조건 종합</span>
            </div>

            <div className="pt-5">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
                <div className="mb-2 flex items-center space-x-2">
                  <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-800">
                    {section01Label}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{section01Meta}</span>
                </div>
                <p
                  className={cn(
                    "text-sm font-medium leading-relaxed text-slate-800",
                    FIRST_RESULT_READABLE_CLASS,
                  )}
                >
                  {personalized.integratedSituation}
                </p>
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
                    index={index}
                    total={data.keyMetrics.length}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <span className="mb-2.5 block text-xs font-bold uppercase tracking-tight text-slate-400">
                03 주요 위험 요인
              </span>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 rounded-lg border border-slate-200/70 bg-slate-50/60 p-3">
                  <span className="mt-0.5 min-w-[70px] text-xs font-bold text-slate-600">1차 확인:</span>
                  <span
                    className={cn(
                      "text-xs text-slate-600 sm:text-sm",
                      FIRST_RESULT_READABLE_CLASS,
                    )}
                  >
                    {phase1RiskText}
                  </span>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                  <span className="mt-0.5 min-w-[70px] text-xs font-bold text-amber-700">2차 추가:</span>
                  <span
                    className={cn(
                      "text-xs font-medium leading-relaxed text-slate-800 sm:text-sm",
                      FIRST_RESULT_READABLE_CLASS,
                    )}
                  >
                    {phase2RiskText}
                  </span>
                </div>
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
                      <span className="mb-1 block text-xs font-bold text-slate-800">
                        {unconfirmedColumnLabels[index] ?? "추가 확인"}
                      </span>
                      <p className={cn("leading-relaxed text-slate-500", FIRST_RESULT_READABLE_CLASS)}>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50/40 p-3.5">
                  <p className={cn("leading-relaxed text-slate-500", FIRST_RESULT_READABLE_CLASS)}>
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
              <div className="mb-2.5 flex items-center justify-between text-xs lg:mb-1.5">
                <span className="font-medium text-slate-500 lg:text-[11px]">주의 판독 등급</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs font-bold lg:px-2 lg:py-0.5 lg:text-[10px] lg:font-medium",
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
          subtitle="| 총 4개 핵심 영역 진단"
          meta={
            <span className="font-mono text-xs text-slate-500 lg:text-[10px]">입력 답변 기반 판독</span>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:items-stretch lg:gap-3">
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
            <span className="rounded border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 lg:border-orange-300/70 lg:bg-orange-100/45 lg:px-1.5 lg:text-[10px] lg:text-orange-800">
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
