/**
 * CASE_06 v1.1 redesign — Phase1 + 5 Phase2 chains, bridge snapshot, chain completion.
 * Legacy restore path remains in adminVerifyProfiling.ts.
 */
import type { ReviewAnswers } from "../components/cost-check/MasterReviewQuotationReport";

export type AdminVerifyProfilePhase = 1 | 2;

export type MasterCaseId =
  | "CASE_01"
  | "CASE_02"
  | "CASE_03"
  | "CASE_04"
  | "CASE_05"
  | "CASE_06"
  | "UNIVERSAL";

export type ProfileQuestion =
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

const ADMIN_DIRECT_EXPLAIN_LABEL =
  "위에 내용이 없거나 설명이 필요합니다 → 직접 입력";

const ADMIN_DIRECT_EXPLAIN_CHOICE = {
  value: "other",
  label: ADMIN_DIRECT_EXPLAIN_LABEL,
};

function getAdminChoiceNoteKey(questionId: string): string {
  return `${questionId}Note`;
}

function isAdminDirectExplainOption(opt: { value: string; label: string }): boolean {
  return opt.value === "other" && opt.label === ADMIN_DIRECT_EXPLAIN_LABEL;
}

export const CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY = "case06_bridgeSnapshotCommitted";
export const CASE06_BRIDGE_TARGET_CASE_KEY = "case06_bridgeTargetCase";

export const CASE06_V11_PHASE1_FIELD_ORDER = [
  "case06_requiredActionCandidate",
  "case06_knowledgeSource",
  "case06_sourceChannel",
  "case06_deadlineActionPair",
  "case06_customerResponse",
] as const;

export const CASE06_V11_CHAIN_FIELD_KEYS = [
  "case06_paymentNature",
  "case06_paymentAmountKnown",
  "case06_paymentSituationMatch",
  "case06_paymentAuthorityCheck",
  "case06_paymentResponse",
  "case06_paymentNonPaymentNotice",
  "case06_attendanceSubject",
  "case06_attendanceFactMatch",
  "case06_attendanceNoticeDetail",
  "case06_attendanceResponse",
  "case06_attendanceAuthorityReaction",
  "case06_submissionRequirement",
  "case06_submissionReason",
  "case06_submissionRelation",
  "case06_submissionResponse",
  "case06_submissionAuthorityReaction",
  "case06_submissionEvidence",
  "case06_dispositionTypeCandidate",
  "case06_dispositionReason",
  "case06_dispositionFactMatch",
  "case06_dispositionEffectiveDate",
  "case06_dispositionResponse",
  "case06_unclearContentRecheck",
  "case06_unclearFactRelation",
  "case06_unclearResponse",
  "case06_classificationStatus",
  "case06_unresolvedReason",
  "case06_expertHandoffRequired",
  CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY,
  CASE06_BRIDGE_TARGET_CASE_KEY,
] as const;

const withDi = (options: { value: string; label: string }[]) => [...options, ADMIN_DIRECT_EXPLAIN_CHOICE];

export const CASE06_REQUIRED_ACTION_CANDIDATE_OPTIONS = withDi([
  { value: "pay_demand", label: "돈을 내라고 했습니다 (벌금·과태료·비용 등)" },
  { value: "attend_explain", label: "어디로 가거나 출석해서 설명하라고 했습니다" },
  { value: "submit_supplement", label: "서류를 제출하거나 빠진 내용을 보완하라고 했습니다" },
  { value: "disposition_notice", label: "이미 내려진 처분이나 제재를 통보받았습니다" },
  {
    value: "problem_action_unclear",
    label: "문제·위반이 있다고 했지만 무엇을 해야 하는지는 정확히 모릅니다",
  },
]);

export const CASE06_KNOWLEDGE_SOURCE_OPTIONS = withDi([
  { value: "doc_read_understood", label: "문서를 직접 확인했고, 적힌 내용을 어느 정도 이해하고 있습니다" },
  { value: "doc_read_not_understood", label: "문서는 직접 봤지만, 무슨 뜻인지 정확히 이해하지 못했습니다" },
  { value: "explained_without_doc", label: "문서는 보지 못했고, 기관이나 다른 사람이 설명해 주었습니다" },
  {
    value: "memory_only_no_doc_now",
    label: "문서가 있었지만 지금은 확인할 수 없어서 기억나는 내용만 압니다",
  },
  { value: "path_unclear", label: "문서를 봤는지 누구에게 들었는지 등 경로가 불분명합니다" },
]);

export const CASE06_SOURCE_CHANNEL_OPTIONS = withDi([
  { value: "gov_document_direct", label: "정부기관에서 받은 문서·공식 안내를 직접 확인했습니다" },
  { value: "gov_contact_direct", label: "정부기관에서 전화·문자·방문 등으로 직접 안내받았습니다" },
  { value: "via_agent_or_company", label: "회사·중개인·대리인이 기관 내용을 전달했습니다" },
  { value: "via_acquaintance_relay", label: "지인이 기관에서 들은 내용을 다시 설명해 주었습니다" },
  { value: "source_unknown", label: "어느 기관·누구에게서 나온 내용인지 알 수 없습니다" },
]);

export const CASE06_DEADLINE_ACTION_PAIR_OPTIONS = withDi([
  { value: "deadline_pay_by_date", label: "특정 날짜까지 돈을 내라고 안내했습니다" },
  { value: "deadline_submit_by_date", label: "특정 날짜까지 서류 제출·보완을 안내했습니다" },
  { value: "deadline_attend_by_date", label: "특정 날짜에 출석·설명을 안내했습니다" },
  { value: "action_unclear_timing", label: "해야 할 일은 있으나 언제·무엇인지 정확히 모릅니다" },
  { value: "no_deadline_stated", label: "기한 안내 자체를 받은 적이 없습니다" },
]);

export const CASE06_CUSTOMER_RESPONSE_OPTIONS = withDi([
  { value: "no_response_yet", label: "아직 아무 대응도 하지 않았습니다" },
  { value: "inquired_authority", label: "기관에 문의·재확인했습니다" },
  { value: "prepared_or_submitted_docs", label: "요구받은 서류·자료를 준비·제출했습니다" },
  { value: "paid_or_attempted_pay", label: "돈을 납부했거나 납부하려 했습니다" },
  {
    value: "attended_then_redemand",
    label: "출석·설명했지만, 그 뒤 다시 안내·보완·추가 요구를 받았습니다",
  },
]);

const CASE06_PAYMENT_NATURE_OPTIONS = withDi([
  { value: "violation_fine", label: "위반·과태료" },
  { value: "application_fee", label: "신청·허가 수수료" },
  { value: "prior_tax_or_debt", label: "기존 발생 비용(세금 등)" },
  { value: "not_explained", label: "설명 못 받음" },
]);

const CASE06_PAYMENT_AMOUNT_KNOWN_OPTIONS = withDi([
  { value: "exact_amount_known", label: "정확한 금액 앎" },
  { value: "approx_amount_known", label: "대략만 앎" },
  { value: "conflicting_amounts", label: "여러 번 다르게 안내됨" },
  { value: "amount_not_given", label: "아직 안내 못 받음" },
]);

const CASE06_PAYMENT_SITUATION_MATCH_OPTIONS = withDi([
  { value: "match", label: "맞음" },
  { value: "amount_or_reason_mismatch", label: "금액·사유가 실제와 다름" },
  { value: "insufficient_info", label: "판단 정보 부족" },
  { value: "redemand_after_paid", label: "이미 낸 적 있는데 재요구" },
]);

const CASE06_PAYMENT_AUTHORITY_CHECK_OPTIONS = withDi([
  { value: "clear_answer", label: "확인해서 명확한 답 받음" },
  { value: "unclear_answer", label: "확인했지만 불명확" },
  { value: "not_checked_yet", label: "아직 확인 안 함" },
  { value: "cannot_reach", label: "연락 안 됨" },
]);

const CASE06_PAYMENT_RESPONSE_OPTIONS = withDi([
  { value: "already_paid", label: "이미 납부" },
  { value: "preparing_payment", label: "납부 준비 중" },
  { value: "dispute_or_recheck", label: "이의제기·재확인 요청" },
  { value: "no_action", label: "아무것도 안 함" },
]);

const CASE06_PAYMENT_NON_PAYMENT_NOTICE_OPTIONS = withDi([
  { value: "enforcement_warning", label: "제재·강제징수 안내" },
  { value: "interest_surcharge_warning", label: "이자·가산금 안내" },
  { value: "no_notice", label: "안내 못 받음" },
]);

const CASE06_ATTENDANCE_SUBJECT_OPTIONS = withDi([
  { value: "specific_violation", label: "특정 위반행위 설명" },
  { value: "submitted_docs_review", label: "제출서류·신청내용 확인" },
  { value: "ongoing_investigation", label: "진행 중 사안 추가조사" },
  { value: "not_explained", label: "설명 못 받음" },
]);

const CASE06_ATTENDANCE_FACT_MATCH_OPTIONS = withDi([
  { value: "match", label: "맞음(실제 있었음)" },
  { value: "partial", label: "일부만 맞음" },
  { value: "mismatch", label: "전혀 다름" },
  { value: "insufficient_info", label: "판단 정보 부족" },
]);

const CASE06_ATTENDANCE_NOTICE_DETAIL_OPTIONS = withDi([
  { value: "date_place_method_known", label: "정확한 날짜·장소·방식 앎" },
  { value: "approx_time_only", label: "대략 시기만 앎" },
  { value: "method_only", label: "통지 방식만 기억" },
  { value: "no_memory", label: "기억 안 남" },
]);

const CASE06_ATTENDANCE_RESPONSE_OPTIONS = withDi([
  { value: "attended_or_explained", label: "이미 출석·설명함" },
  { value: "submitted_docs", label: "서류·자료 제출함" },
  { value: "no_response", label: "아직 대응 안 함" },
  { value: "cannot_due_to_unknown", label: "방법 몰라 못 함" },
]);

const CASE06_ATTENDANCE_AUTHORITY_REACTION_OPTIONS = withDi([
  { value: "no_issue_reply", label: "문제없다는 답변" },
  { value: "more_docs_or_reattend", label: "추가자료·재출석 재요구" },
  { value: "no_reply_yet", label: "아직 답변 없음" },
  { value: "adverse_notice", label: "오히려 불리한 통보" },
]);

const CASE06_SUBMISSION_REQUIREMENT_OPTIONS = withDi([
  { value: "add_missing_docs", label: "빠진 서류 추가 제출" },
  { value: "correct_existing", label: "기존 서류 잘못된 내용 수정" },
  { value: "retranslate_or_certify", label: "번역·인증 재요구" },
  { value: "extra_explanation_evidence", label: "추가 설명·증빙 자료" },
  { value: "not_explained", label: "설명 못 받음" },
]);

const CASE06_SUBMISSION_REASON_OPTIONS = withDi([
  { value: "requirements_insufficient", label: "신청 요건 자체가 원래 부족했다고 설명함" },
  { value: "doc_error_mismatch", label: "제출한 서류에 오류·불일치가 있다고 설명함" },
  { value: "policy_change_extra", label: "정책·규정이 바뀌어서 추가로 필요하다고 설명함" },
  { value: "reason_not_explained", label: "이유를 구체적으로 설명받지 못함" },
]);

const CASE06_SUBMISSION_RELATION_OPTIONS = withDi([
  { value: "match", label: "맞습니다(실제로 그 요건·서류가 부족했거나 잘못되었습니다)" },
  { value: "partial", label: "일부만 맞습니다(지적된 것 중 일부만 실제 문제입니다)" },
  { value: "mismatch", label: "전혀 다릅니다(이미 제출했거나 문제가 없던 내용입니다)" },
  { value: "insufficient_info", label: "판단할 정보가 부족합니다" },
]);

const CASE06_SUBMISSION_RESPONSE_OPTIONS = withDi([
  { value: "submitted_all", label: "요구받은 서류를 모두 준비해서 제출했습니다" },
  { value: "submitted_partial", label: "일부만 준비해서 제출했습니다" },
  { value: "not_submitted_yet", label: "아직 아무것도 제출하지 않았습니다" },
  { value: "blocked_unknown_how", label: "무엇을 어떻게 제출해야 할지 몰라서 못했습니다" },
]);

const CASE06_SUBMISSION_AUTHORITY_REACTION_OPTIONS = withDi([
  { value: "no_issue_reply", label: "문제없다는 답변을 받았습니다" },
  { value: "more_docs_requested", label: "추가 서류·보완을 다시 요구받았습니다" },
  { value: "no_reply_yet", label: "아직 답변을 받지 못했습니다" },
  { value: "adverse_notice", label: "오히려 불리한 통보(반려·거부 등)를 받았습니다" },
]);

const CASE06_SUBMISSION_EVIDENCE_OPTIONS = withDi([
  { value: "has_original_or_copy", label: "원본 서류·사본을 가지고 있습니다" },
  { value: "has_messages", label: "기관과 주고받은 문자·이메일·메모가 있습니다" },
  { value: "has_call_record", label: "담당자와 통화·상담한 기록이 있습니다" },
  { value: "no_evidence", label: "확인할 수 있는 자료가 없습니다" },
]);

const CASE06_DISPOSITION_TYPE_CANDIDATE_OPTIONS = withDi([
  { value: "business_suspension", label: "영업·업무정지" },
  { value: "license_or_registration_revoked", label: "허가·등록 취소" },
  { value: "fine_type_disposition", label: "벌금형 처분" },
  { value: "adverse_unnamed", label: "명칭은 모르고 안 좋은 조치라는 것만 앎" },
]);

const CASE06_DISPOSITION_REASON_OPTIONS = withDi([
  { value: "specific_violation", label: "특정 위반행위 때문" },
  { value: "docs_or_requirements_gap", label: "서류·요건 미비 때문" },
  { value: "heard_not_understood", label: "들었지만 이해 못함" },
  { value: "not_explained", label: "설명 못 받음" },
]);

const CASE06_DISPOSITION_FACT_MATCH_OPTIONS = withDi([
  { value: "match", label: "맞음" },
  { value: "partial", label: "일부만 맞음" },
  { value: "mismatch", label: "전혀 다름" },
  { value: "insufficient_info", label: "판단 정보 부족" },
]);

const CASE06_DISPOSITION_EFFECTIVE_DATE_OPTIONS = withDi([
  { value: "exact_effective_date", label: "정확한 발효일 앎" },
  { value: "approx_effective_date", label: "대략 시기만 앎" },
  { value: "already_effective", label: "이미 효력 시작됐다고 들음" },
  { value: "not_stated", label: "안내 못 받음" },
]);

const CASE06_DISPOSITION_RESPONSE_OPTIONS = withDi([
  { value: "appeal_or_review_requested", label: "이의신청·재검토 요청" },
  { value: "submitted_requested_docs", label: "요구자료 제출" },
  { value: "no_action", label: "아무것도 안 함" },
  { value: "appeal_method_unknown", label: "이의제기 방법조차 모름" },
]);

const CASE06_UNCLEAR_CONTENT_RECHECK_OPTIONS = withDi([
  { value: "signal_violation", label: "위반·문제 언급" },
  { value: "signal_payment", label: "돈 관련 언급" },
  { value: "signal_submission", label: "서류·제출 관련 언급" },
  { value: "signal_attendance", label: "출석·설명 요구 언급" },
  { value: "signal_disposition", label: "이미 결정된 조치 언급" },
]);

const CASE06_UNCLEAR_FACT_RELATION_OPTIONS = withDi([
  { value: "actually_related", label: "실제 있었음" },
  { value: "partially_related", label: "일부만 관련" },
  { value: "unrelated", label: "전혀 무관" },
  { value: "insufficient_info", label: "판단 정보 없음" },
]);

const CASE06_UNCLEAR_RESPONSE_OPTIONS = withDi([
  { value: "inquired", label: "기관에 문의" },
  { value: "prepared_docs", label: "서류·자료 준비" },
  { value: "no_action", label: "아무것도 안 함" },
  { value: "blocked_unknown_action", label: "뭘 해야 할지 몰라 못 함" },
]);

export const CASE06_V11_FIELD_OPTIONS: Record<string, { value: string; label: string }[]> = {
  case06_requiredActionCandidate: CASE06_REQUIRED_ACTION_CANDIDATE_OPTIONS,
  case06_knowledgeSource: CASE06_KNOWLEDGE_SOURCE_OPTIONS,
  case06_sourceChannel: CASE06_SOURCE_CHANNEL_OPTIONS,
  case06_deadlineActionPair: CASE06_DEADLINE_ACTION_PAIR_OPTIONS,
  case06_customerResponse: CASE06_CUSTOMER_RESPONSE_OPTIONS,
  case06_paymentNature: CASE06_PAYMENT_NATURE_OPTIONS,
  case06_paymentAmountKnown: CASE06_PAYMENT_AMOUNT_KNOWN_OPTIONS,
  case06_paymentSituationMatch: CASE06_PAYMENT_SITUATION_MATCH_OPTIONS,
  case06_paymentAuthorityCheck: CASE06_PAYMENT_AUTHORITY_CHECK_OPTIONS,
  case06_paymentResponse: CASE06_PAYMENT_RESPONSE_OPTIONS,
  case06_paymentNonPaymentNotice: CASE06_PAYMENT_NON_PAYMENT_NOTICE_OPTIONS,
  case06_attendanceSubject: CASE06_ATTENDANCE_SUBJECT_OPTIONS,
  case06_attendanceFactMatch: CASE06_ATTENDANCE_FACT_MATCH_OPTIONS,
  case06_attendanceNoticeDetail: CASE06_ATTENDANCE_NOTICE_DETAIL_OPTIONS,
  case06_attendanceResponse: CASE06_ATTENDANCE_RESPONSE_OPTIONS,
  case06_attendanceAuthorityReaction: CASE06_ATTENDANCE_AUTHORITY_REACTION_OPTIONS,
  case06_submissionRequirement: CASE06_SUBMISSION_REQUIREMENT_OPTIONS,
  case06_submissionReason: CASE06_SUBMISSION_REASON_OPTIONS,
  case06_submissionRelation: CASE06_SUBMISSION_RELATION_OPTIONS,
  case06_submissionResponse: CASE06_SUBMISSION_RESPONSE_OPTIONS,
  case06_submissionAuthorityReaction: CASE06_SUBMISSION_AUTHORITY_REACTION_OPTIONS,
  case06_submissionEvidence: CASE06_SUBMISSION_EVIDENCE_OPTIONS,
  case06_dispositionTypeCandidate: CASE06_DISPOSITION_TYPE_CANDIDATE_OPTIONS,
  case06_dispositionReason: CASE06_DISPOSITION_REASON_OPTIONS,
  case06_dispositionFactMatch: CASE06_DISPOSITION_FACT_MATCH_OPTIONS,
  case06_dispositionEffectiveDate: CASE06_DISPOSITION_EFFECTIVE_DATE_OPTIONS,
  case06_dispositionResponse: CASE06_DISPOSITION_RESPONSE_OPTIONS,
  case06_unclearContentRecheck: CASE06_UNCLEAR_CONTENT_RECHECK_OPTIONS,
  case06_unclearFactRelation: CASE06_UNCLEAR_FACT_RELATION_OPTIONS,
  case06_unclearResponse: CASE06_UNCLEAR_RESPONSE_OPTIONS,
};

/** v1.1 choice fields that may have Direct Input notes (`{fieldId}Note`). */
export const CASE06_V11_ANSWER_NOTE_KEYS = (
  Object.keys(CASE06_V11_FIELD_OPTIONS) as (keyof typeof CASE06_V11_FIELD_OPTIONS)[]
).map((fieldId) => getAdminChoiceNoteKey(fieldId));

/** Persist whitelist: approved snake_case slugs + DI notes + terminal/bridge keys. */
export const CASE06_V11_PERSIST_ANSWER_KEYS: readonly string[] = [
  ...CASE06_V11_PHASE1_FIELD_ORDER,
  ...CASE06_V11_CHAIN_FIELD_KEYS,
  ...CASE06_V11_ANSWER_NOTE_KEYS,
];

const CASE06_CANDIDATE_TO_CHAIN: Record<string, 1 | 2 | 3 | 4 | 5> = {
  pay_demand: 1,
  attend_explain: 2,
  submit_supplement: 3,
  disposition_notice: 4,
  problem_action_unclear: 5,
  other: 5,
};

const CASE06_RECHECK_SIGNAL_TO_CHAIN: Record<string, 1 | 2 | 3 | 4 | 5> = {
  signal_payment: 1,
  signal_attendance: 2,
  signal_submission: 3,
  signal_disposition: 4,
  signal_violation: 5,
};

export const CASE06_CANDIDATE_TO_TARGET_CASE: Partial<Record<string, MasterCaseId>> = {
  pay_demand: "CASE_02",
  attend_explain: "CASE_03",
  submit_supplement: "CASE_04",
  disposition_notice: "CASE_05",
  problem_action_unclear: "CASE_06",
};

function choiceComplete(
  fieldId: string,
  answers: ReviewAnswers,
  options: { value: string; label: string }[],
): boolean {
  const value = answers[fieldId]?.trim() ?? "";
  if (!value) return false;
  if (value !== "other") return true;
  const otherOption = options.find((opt) => opt.value === "other");
  if (!otherOption || !isAdminDirectExplainOption(otherOption)) return true;
  return Boolean(answers[getAdminChoiceNoteKey(fieldId)]?.trim());
}

export function isCase06LegacyRestorePath(answers: ReviewAnswers): boolean {
  if (answers.case06_requiredActionCandidate?.trim()) return false;
  return Boolean(
    answers.case06_documentNature ||
      answers.profilePerceivedIssue ||
      answers.profileCurrentGoal,
  );
}

export function isCase06RedesignPhase1Complete(answers: ReviewAnswers): boolean {
  for (const fieldId of CASE06_V11_PHASE1_FIELD_ORDER) {
    const options = CASE06_V11_FIELD_OPTIONS[fieldId];
    if (!options || !choiceComplete(fieldId, answers, options)) return false;
  }
  return true;
}

export function resolveCase06Phase2ChainId(answers: ReviewAnswers): 1 | 2 | 3 | 4 | 5 {
  const recheck = answers.case06_unclearContentRecheck?.trim();
  if (recheck && CASE06_RECHECK_SIGNAL_TO_CHAIN[recheck]) {
    return CASE06_RECHECK_SIGNAL_TO_CHAIN[recheck];
  }
  const cand = answers.case06_requiredActionCandidate?.trim();
  if (cand && CASE06_CANDIDATE_TO_CHAIN[cand]) {
    return CASE06_CANDIDATE_TO_CHAIN[cand];
  }
  return 5;
}

export function case06NeedsPaymentNonPaymentNotice(answers: ReviewAnswers): boolean {
  const status = answers.case06_paymentResponse?.trim();
  return Boolean(status && status !== "already_paid");
}

export function case06NeedsAttendanceAuthorityReaction(answers: ReviewAnswers): boolean {
  const r = answers.case06_attendanceResponse?.trim();
  return r === "attended_or_explained" || r === "submitted_docs";
}

export function case06NeedsSubmissionEvidence(answers: ReviewAnswers): boolean {
  const r = answers.case06_submissionResponse?.trim();
  return Boolean(r && r !== "not_submitted_yet");
}

export function isCase06ExpertTerminal(answers: ReviewAnswers): boolean {
  return (
    answers.case06_expertHandoffRequired === "true" &&
    answers.case06_classificationStatus === "unresolved" &&
    answers.case06_unresolvedReason === "document_action_nature_unclear"
  );
}

function isChainPaymentComplete(answers: ReviewAnswers): boolean {
  const fields: { id: string; options: { value: string; label: string }[] }[] = [
    { id: "case06_paymentNature", options: CASE06_PAYMENT_NATURE_OPTIONS },
    { id: "case06_paymentAmountKnown", options: CASE06_PAYMENT_AMOUNT_KNOWN_OPTIONS },
    { id: "case06_paymentSituationMatch", options: CASE06_PAYMENT_SITUATION_MATCH_OPTIONS },
    { id: "case06_paymentAuthorityCheck", options: CASE06_PAYMENT_AUTHORITY_CHECK_OPTIONS },
    { id: "case06_paymentResponse", options: CASE06_PAYMENT_RESPONSE_OPTIONS },
  ];
  for (const f of fields) {
    if (!choiceComplete(f.id, answers, f.options)) return false;
  }
  if (case06NeedsPaymentNonPaymentNotice(answers)) {
    if (!choiceComplete("case06_paymentNonPaymentNotice", answers, CASE06_PAYMENT_NON_PAYMENT_NOTICE_OPTIONS)) {
      return false;
    }
  }
  return true;
}

function isChainAttendanceComplete(answers: ReviewAnswers): boolean {
  const base = [
    ["case06_attendanceSubject", CASE06_ATTENDANCE_SUBJECT_OPTIONS],
    ["case06_attendanceFactMatch", CASE06_ATTENDANCE_FACT_MATCH_OPTIONS],
    ["case06_attendanceNoticeDetail", CASE06_ATTENDANCE_NOTICE_DETAIL_OPTIONS],
    ["case06_attendanceResponse", CASE06_ATTENDANCE_RESPONSE_OPTIONS],
  ] as const;
  for (const [id, opts] of base) {
    if (!choiceComplete(id, answers, opts)) return false;
  }
  if (case06NeedsAttendanceAuthorityReaction(answers)) {
    if (
      !choiceComplete(
        "case06_attendanceAuthorityReaction",
        answers,
        CASE06_ATTENDANCE_AUTHORITY_REACTION_OPTIONS,
      )
    ) {
      return false;
    }
  }
  return true;
}

function isChainSubmissionComplete(answers: ReviewAnswers): boolean {
  const base = [
    ["case06_submissionRequirement", CASE06_SUBMISSION_REQUIREMENT_OPTIONS],
    ["case06_submissionReason", CASE06_SUBMISSION_REASON_OPTIONS],
    ["case06_submissionRelation", CASE06_SUBMISSION_RELATION_OPTIONS],
    ["case06_submissionResponse", CASE06_SUBMISSION_RESPONSE_OPTIONS],
    ["case06_submissionAuthorityReaction", CASE06_SUBMISSION_AUTHORITY_REACTION_OPTIONS],
  ] as const;
  for (const [id, opts] of base) {
    if (!choiceComplete(id, answers, opts)) return false;
  }
  if (case06NeedsSubmissionEvidence(answers)) {
    if (!choiceComplete("case06_submissionEvidence", answers, CASE06_SUBMISSION_EVIDENCE_OPTIONS)) {
      return false;
    }
  }
  return true;
}

function isChainDispositionComplete(answers: ReviewAnswers): boolean {
  const base = [
    ["case06_dispositionTypeCandidate", CASE06_DISPOSITION_TYPE_CANDIDATE_OPTIONS],
    ["case06_dispositionReason", CASE06_DISPOSITION_REASON_OPTIONS],
    ["case06_dispositionFactMatch", CASE06_DISPOSITION_FACT_MATCH_OPTIONS],
    ["case06_dispositionEffectiveDate", CASE06_DISPOSITION_EFFECTIVE_DATE_OPTIONS],
    ["case06_dispositionResponse", CASE06_DISPOSITION_RESPONSE_OPTIONS],
  ] as const;
  for (const [id, opts] of base) {
    if (!choiceComplete(id, answers, opts)) return false;
  }
  return true;
}

function isChainUnclearExpertComplete(answers: ReviewAnswers): boolean {
  if (!choiceComplete("case06_unclearContentRecheck", answers, CASE06_UNCLEAR_CONTENT_RECHECK_OPTIONS)) {
    return false;
  }
  const recheck = answers.case06_unclearContentRecheck?.trim();
  if (recheck === "signal_violation") {
    return true;
  }
  if (recheck && recheck !== "other" && CASE06_RECHECK_SIGNAL_TO_CHAIN[recheck]) {
    return false;
  }
  if (!choiceComplete("case06_unclearFactRelation", answers, CASE06_UNCLEAR_FACT_RELATION_OPTIONS)) {
    return false;
  }
  if (!choiceComplete("case06_unclearResponse", answers, CASE06_UNCLEAR_RESPONSE_OPTIONS)) {
    return false;
  }
  return isCase06ExpertTerminal(answers);
}

export function isCase06Phase2ChainComplete(answers: ReviewAnswers): boolean {
  if (!isCase06RedesignPhase1Complete(answers)) return false;
  const chain = resolveCase06Phase2ChainId(answers);
  switch (chain) {
    case 1:
      return isChainPaymentComplete(answers);
    case 2:
      return isChainAttendanceComplete(answers);
    case 3:
      return isChainSubmissionComplete(answers);
    case 4:
      return isChainDispositionComplete(answers);
    case 5:
      return isChainUnclearExpertComplete(answers);
    default:
      return false;
  }
}

export function isCase06BridgeSnapshotCommitted(answers: ReviewAnswers): boolean {
  return answers[CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY] === "1";
}

export function isCase06AwaitingBridgeSnapshot(answers: ReviewAnswers): boolean {
  return isCase06Phase2ChainComplete(answers) && !isCase06BridgeSnapshotCommitted(answers);
}

function pushUnique(questions: ProfileQuestion[], question: ProfileQuestion): void {
  if (!questions.some((q) => q.id === question.id)) {
    questions.push(question);
  }
}

function pushChoice(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  id: string,
  label: string,
  options: { value: string; label: string }[],
): boolean {
  pushUnique(questions, { id, kind: "choice", label, options });
  return choiceComplete(id, answers, options);
}

function applyExpertTerminalFields(answers: ReviewAnswers): ReviewAnswers {
  return {
    ...answers,
    case06_classificationStatus: "unresolved",
    case06_unresolvedReason: "document_action_nature_unclear",
    case06_expertHandoffRequired: "true",
  };
}

export function applyCase06BridgeSnapshot(
  answers: ReviewAnswers,
  targetCase: MasterCaseId | null,
): ReviewAnswers {
  const chain = resolveCase06Phase2ChainId(answers);
  let next = { ...answers };
  if (chain === 5 && isCase06ExpertTerminal(next)) {
    return {
      ...next,
      [CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY]: "1",
      [CASE06_BRIDGE_TARGET_CASE_KEY]: "CASE_06",
    };
  }
  const resolved =
    targetCase ??
    (CASE06_CANDIDATE_TO_TARGET_CASE[next.case06_requiredActionCandidate ?? ""] as MasterCaseId) ??
    "CASE_06";
  return {
    ...next,
    [CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY]: "1",
    [CASE06_BRIDGE_TARGET_CASE_KEY]: resolved,
  };
}

function appendPaymentChain(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!pushChoice(questions, answers, "case06_paymentNature", "무엇에 대한 비용이라고 안내받았나요?", CASE06_PAYMENT_NATURE_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_paymentAmountKnown", "얼마를 내라고 안내받았나요?", CASE06_PAYMENT_AMOUNT_KNOWN_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_paymentSituationMatch", "그 금액이 실제 본인 상황과 맞다고 생각하시나요?", CASE06_PAYMENT_SITUATION_MATCH_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_paymentAuthorityCheck", "기관에 직접 확인해 보셨나요?", CASE06_PAYMENT_AUTHORITY_CHECK_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_paymentResponse", "지금까지 실제로 어떻게 하셨나요?", CASE06_PAYMENT_RESPONSE_OPTIONS)) return;
  if (case06NeedsPaymentNonPaymentNotice(answers)) {
    pushChoice(
      questions,
      answers,
      "case06_paymentNonPaymentNotice",
      "기한 내 내지 않으면 어떻게 된다고 안내받았나요?",
      CASE06_PAYMENT_NON_PAYMENT_NOTICE_OPTIONS,
    );
  }
}

function appendAttendanceChain(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!pushChoice(questions, answers, "case06_attendanceSubject", "무엇에 대해 출석하거나 설명하라고 했나요?", CASE06_ATTENDANCE_SUBJECT_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_attendanceFactMatch", "기관이 문제 삼는 내용이 실제 상황과 맞다고 생각하시나요?", CASE06_ATTENDANCE_FACT_MATCH_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_attendanceNoticeDetail", "언제, 어디서, 어떤 방식으로 통지받았나요?", CASE06_ATTENDANCE_NOTICE_DETAIL_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_attendanceResponse", "지금까지 실제로 어떻게 대응하셨나요?", CASE06_ATTENDANCE_RESPONSE_OPTIONS)) return;
  if (case06NeedsAttendanceAuthorityReaction(answers)) {
    pushChoice(
      questions,
      answers,
      "case06_attendanceAuthorityReaction",
      "대응 이후 기관은 어떻게 반응했나요?",
      CASE06_ATTENDANCE_AUTHORITY_REACTION_OPTIONS,
    );
  }
}

function appendSubmissionChain(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!pushChoice(questions, answers, "case06_submissionRequirement", "기관에서는 어떤 서류나 내용을 다시 제출·보완하라고 했나요?", CASE06_SUBMISSION_REQUIREMENT_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_submissionReason", "그 보완을 요구받은 이유를 기관에서는 어떻게 설명했나요?", CASE06_SUBMISSION_REASON_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_submissionRelation", "그 설명이 실제 본인 상황과 어떻게 연결된다고 알고 계신가요?", CASE06_SUBMISSION_RELATION_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_submissionResponse", "안내를 받은 뒤 실제로 무엇을 제출·설명하셨나요?", CASE06_SUBMISSION_RESPONSE_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_submissionAuthorityReaction", "그 후 기관에서는 어떻게 답변하거나 다시 요구했나요?", CASE06_SUBMISSION_AUTHORITY_REACTION_OPTIONS)) return;
  if (case06NeedsSubmissionEvidence(answers)) {
    pushChoice(
      questions,
      answers,
      "case06_submissionEvidence",
      "현재 가지고 있는 자료 중 이 내용을 확인할 수 있는 것은 무엇인가요?",
      CASE06_SUBMISSION_EVIDENCE_OPTIONS,
    );
  }
}

function appendDispositionChain(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!pushChoice(questions, answers, "case06_dispositionTypeCandidate", "어떤 처분이라고 안내받았나요?", CASE06_DISPOSITION_TYPE_CANDIDATE_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_dispositionReason", "그 처분의 이유를 기관에서는 어떻게 설명했나요?", CASE06_DISPOSITION_REASON_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_dispositionFactMatch", "그 이유가 실제 본인 상황과 맞다고 생각하시나요?", CASE06_DISPOSITION_FACT_MATCH_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_dispositionEffectiveDate", "이 처분은 언제부터 효력이 생긴다고 안내받았나요?", CASE06_DISPOSITION_EFFECTIVE_DATE_OPTIONS)) return;
  pushChoice(questions, answers, "case06_dispositionResponse", "지금까지 실제로 어떻게 대응하셨나요?", CASE06_DISPOSITION_RESPONSE_OPTIONS);
}

function appendUnclearChain(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (
    !pushChoice(
      questions,
      answers,
      "case06_unclearContentRecheck",
      "그 문서나 안내에서 기관이 실제로 언급한 내용은 무엇인가요?",
      CASE06_UNCLEAR_CONTENT_RECHECK_OPTIONS,
    )
  ) {
    return;
  }
  const recheck = answers.case06_unclearContentRecheck?.trim();
  if (recheck === "signal_violation") {
    return;
  }
  if (recheck && recheck !== "other" && CASE06_RECHECK_SIGNAL_TO_CHAIN[recheck]) {
    const chain = CASE06_RECHECK_SIGNAL_TO_CHAIN[recheck];
    if (chain === 1) appendPaymentChain(questions, answers);
    else if (chain === 2) appendAttendanceChain(questions, answers);
    else if (chain === 3) appendSubmissionChain(questions, answers);
    else if (chain === 4) appendDispositionChain(questions, answers);
    return;
  }
  if (!pushChoice(questions, answers, "case06_unclearFactRelation", "기관이 지적한 내용이 실제 본인 상황과 어떤 관계가 있다고 생각하시나요?", CASE06_UNCLEAR_FACT_RELATION_OPTIONS)) {
    return;
  }
  if (!pushChoice(questions, answers, "case06_unclearResponse", "지금까지 이 건에 대해 실제로 무엇을 하셨나요?", CASE06_UNCLEAR_RESPONSE_OPTIONS)) {
    return;
  }
  if (answers.case06_unclearContentRecheck === "other" && isChainUnclearExpertComplete(applyExpertTerminalFields(answers))) {
    // terminal fields applied on answer commit in UI layer
  }
}

export function appendCase06RedesignPhase1Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  const phase1: { id: string; label: string }[] = [
    {
      id: "case06_requiredActionCandidate",
      label: "문서에서 실제로 하라고 적혀 있거나, 상대방에게 설명받은 내용은 무엇인가요?",
    },
    { id: "case06_knowledgeSource", label: "이 내용을 실제로 어떻게 확인하셨나요?" },
    { id: "case06_sourceChannel", label: "이 내용은 어디에서 어떻게 전달받으셨나요?" },
    { id: "case06_deadlineActionPair", label: "기관에서는 언제까지 무엇을 하라고 안내했나요?" },
    { id: "case06_customerResponse", label: "그 안내를 받은 뒤 지금까지 실제로 어떻게 대응하셨나요?" },
  ];
  for (const field of phase1) {
    const options = CASE06_V11_FIELD_OPTIONS[field.id];
    if (!options) return;
    if (!pushChoice(questions, answers, field.id, field.label, options)) return;
  }
}

export function appendCase06RedesignPhase2Questions(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  const chain = resolveCase06Phase2ChainId(answers);
  switch (chain) {
    case 1:
      appendPaymentChain(questions, answers);
      break;
    case 2:
      appendAttendanceChain(questions, answers);
      break;
    case 3:
      appendSubmissionChain(questions, answers);
      break;
    case 4:
      appendDispositionChain(questions, answers);
      break;
    case 5:
      appendUnclearChain(questions, answers);
      break;
    default:
      break;
  }
}

export function appendCase06RedesignPathQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  phase: AdminVerifyProfilePhase,
): void {
  if (phase === 1) {
    appendCase06RedesignPhase1Questions(questions, answers);
    return;
  }
  appendCase06RedesignPhase2Questions(questions, answers);
}

export type CaseResolutionQuestionFocus =
  | "caseClassification"
  | "authorityClaim"
  | "customerAction"
  | "actualSituation"
  | "deadline"
  | "evidence"
  | "goal"
  | "currentBlockage"
  | "authorityReason"
  | "authorityResponse";

export function selectCase06RedesignResolutionFocus(
  answers: ReviewAnswers,
): { questionId: string; focus: CaseResolutionQuestionFocus; reason: string } | null {
  if (isCase06Phase2ChainComplete(answers)) return null;
  if (!isCase06RedesignPhase1Complete(answers)) {
    for (const fieldId of CASE06_V11_PHASE1_FIELD_ORDER) {
      const options = CASE06_V11_FIELD_OPTIONS[fieldId];
      if (!options || choiceComplete(fieldId, answers, options)) continue;
      return { questionId: fieldId, focus: "caseClassification", reason: "CASE_06 Phase1" };
    }
  }
  const chain = resolveCase06Phase2ChainId(answers);
  const chainFieldOrder: Record<number, string[]> = {
    1: [
      "case06_paymentNature",
      "case06_paymentAmountKnown",
      "case06_paymentSituationMatch",
      "case06_paymentAuthorityCheck",
      "case06_paymentResponse",
      "case06_paymentNonPaymentNotice",
    ],
    2: [
      "case06_attendanceSubject",
      "case06_attendanceFactMatch",
      "case06_attendanceNoticeDetail",
      "case06_attendanceResponse",
      "case06_attendanceAuthorityReaction",
    ],
    3: [
      "case06_submissionRequirement",
      "case06_submissionReason",
      "case06_submissionRelation",
      "case06_submissionResponse",
      "case06_submissionAuthorityReaction",
      "case06_submissionEvidence",
    ],
    4: [
      "case06_dispositionTypeCandidate",
      "case06_dispositionReason",
      "case06_dispositionFactMatch",
      "case06_dispositionEffectiveDate",
      "case06_dispositionResponse",
    ],
    5: ["case06_unclearContentRecheck", "case06_unclearFactRelation", "case06_unclearResponse"],
  };
  for (const fieldId of chainFieldOrder[chain] ?? []) {
    const options = CASE06_V11_FIELD_OPTIONS[fieldId];
    if (!options) continue;
    if (fieldId === "case06_paymentNonPaymentNotice" && !case06NeedsPaymentNonPaymentNotice(answers)) {
      continue;
    }
    if (fieldId === "case06_attendanceAuthorityReaction" && !case06NeedsAttendanceAuthorityReaction(answers)) {
      continue;
    }
    if (fieldId === "case06_submissionEvidence" && !case06NeedsSubmissionEvidence(answers)) {
      continue;
    }
    if (!choiceComplete(fieldId, answers, options)) {
      return { questionId: fieldId, focus: "caseClassification", reason: "CASE_06 Phase2 chain" };
    }
  }
  return null;
}

/** On answer commit: set expert terminal profile when unclear chain ends with DI. */
export function maybeApplyCase06ExpertTerminalOnAnswer(
  answers: ReviewAnswers,
  questionId: string,
): ReviewAnswers {
  if (questionId !== "case06_unclearResponse") return answers;
  if (resolveCase06Phase2ChainId(answers) !== 5) return answers;
  if (answers.case06_unclearContentRecheck !== "other") return answers;
  if (
    !choiceComplete("case06_unclearFactRelation", answers, CASE06_UNCLEAR_FACT_RELATION_OPTIONS) ||
    !choiceComplete("case06_unclearResponse", answers, CASE06_UNCLEAR_RESPONSE_OPTIONS)
  ) {
    return answers;
  }
  return applyExpertTerminalFields(answers);
}
