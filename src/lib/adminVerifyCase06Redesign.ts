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

export const CASE06_DEADLINE_DATE_KEY = "case06_deadlineDate";
export const CASE06_PAYMENT_AMOUNT_TEXT_KEY = "case06_paymentAmountText";
export const CASE06_ATTENDANCE_NOTICE_TEXT_KEY = "case06_attendanceNoticeText";
export const CASE06_DISPOSITION_EFFECTIVE_DATE_TEXT_KEY = "case06_dispositionEffectiveDateText";

const CASE06_DEADLINE_BY_DATE_SLUGS = new Set([
  "deadline_pay_by_date",
  "deadline_submit_by_date",
  "deadline_attend_by_date",
]);

const CASE06_BRIDGE_TARGET_LABELS: Record<string, string> = {
  CASE_02: "납부",
  CASE_03: "출석",
  CASE_04: "보완",
  CASE_05: "처분",
  CASE_06: "불명확",
};

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
  { value: "pay_demand", label: "벌금이나 수수료 등, 어떤 돈을 내라는 내용으로 이해했습니다." },
  { value: "attend_explain", label: "교통국 등에 직접 가서, 상황을 설명하라는 내용으로 이해했습니다." },
  { value: "submit_supplement", label: "서류를 새로 내거나, 빠진 내용을 채워서 다시 내라는 내용으로 이해했습니다." },
  { value: "disposition_notice", label: "면허 정지나 제재처럼, 이미 결정된 조치를 알리는 내용으로 이해했습니다." },
  { value: "problem_action_unclear", label: "문제가 있다는 것은 알지만, 무엇을 해야 하는지는 알 수 없었습니다." },
]);

export const CASE06_KNOWLEDGE_SOURCE_OPTIONS = withDi([
  { value: "doc_read_understood", label: "문서를 직접 읽었고, 적힌 내용을 대부분 이해했습니다." },
  { value: "doc_read_not_understood", label: "문서는 직접 봤지만, 베트남어나 행정 용어 때문에 뜻을 이해하지 못했습니다." },
  { value: "explained_without_doc", label: "문서는 보지 못했고, 기관이나 다른 사람의 설명으로만 알게 되었습니다." },
  { value: "memory_only_no_doc_now", label: "문서를 받았지만 지금은 가지고 있지 않아, 기억나는 내용만 알고 있습니다." },
  { value: "path_unclear", label: "문서를 봤는지, 누구에게 들었는지 확인 경로가 분명하지 않습니다." },
]);

export const CASE06_SOURCE_CHANNEL_OPTIONS = withDi([
  { value: "gov_document_direct", label: "교통국 등 정부기관이 보낸 문서나 공식 안내를 제가 직접 받았습니다." },
  { value: "gov_contact_direct", label: "정부기관 담당자에게 전화·문자·방문으로 직접 안내받았습니다." },
  { value: "via_agent_or_company", label: "회사나 대행사, 중개인이 기관 내용을 대신 전달해 주었습니다." },
  { value: "via_acquaintance_relay", label: "지인이 기관에서 들은 내용을 다시 설명해 주었습니다." },
  { value: "source_unknown", label: "어느 기관에서, 누구를 통해 나온 내용인지 알 수 없습니다." },
]);

export const CASE06_DEADLINE_ACTION_PAIR_OPTIONS = withDi([
  { value: "deadline_pay_by_date", label: "정해진 날짜까지 돈을 내라는 안내를 받았습니다." },
  { value: "deadline_submit_by_date", label: "정해진 날짜까지 서류를 제출하거나 보완하라는 안내를 받았습니다." },
  { value: "deadline_attend_by_date", label: "정해진 날짜에 직접 가서 설명하라는 안내를 받았습니다." },
  { value: "action_unclear_timing", label: "해야 할 일은 있는 것 같지만, 무엇을 언제까지 해야 하는지 모릅니다." },
  { value: "no_deadline_stated", label: "날짜나 기한에 대한 안내는 받지 못했습니다." },
]);

export const CASE06_CUSTOMER_RESPONSE_OPTIONS = withDi([
  { value: "no_response_yet", label: "안내만 받았고, 아직 아무 대응도 하지 않았습니다." },
  { value: "inquired_authority", label: "기관에 연락해 내용을 다시 물어봤지만, 아직 다른 조치는 하지 않았습니다." },
  { value: "prepared_or_submitted_docs", label: "요구받은 것으로 보이는 서류나 자료를 준비하거나 제출했습니다." },
  { value: "paid_or_attempted_pay", label: "돈을 납부했거나, 납부하려고 시도했습니다." },
  { value: "attended_then_redemand", label: "직접 가서 설명했지만, 그 뒤 다시 추가 요구를 받았습니다." },
]);

const CASE06_PAYMENT_NATURE_OPTIONS = withDi([
  { value: "violation_fine", label: "교통위반에 대한 벌금이나 과태료라고 안내받았습니다." },
  { value: "application_fee", label: "면허나 허가를 신청하면서 내야 하는 수수료라고 안내받았습니다." },
  { value: "prior_tax_or_debt", label: "예전에 발생한 세금이나 미납 비용이라고 안내받았습니다." },
  { value: "not_explained", label: "돈을 내라는 안내만 받았고, 무엇에 대한 비용인지는 설명받지 못했습니다." },
]);

const CASE06_PAYMENT_AMOUNT_KNOWN_OPTIONS = withDi([
  { value: "exact_amount_known", label: "정확한 금액이 문서에 적혀 있거나, 담당자에게 분명히 들었습니다." },
  { value: "approx_amount_known", label: "대략적인 금액만 들었고, 정확한 금액은 모릅니다." },
  { value: "conflicting_amounts", label: "안내받을 때마다 금액이 달라, 어느 금액이 맞는지 모르겠습니다." },
  { value: "amount_not_given", label: "돈을 내라는 말은 들었지만, 금액은 아직 안내받지 못했습니다." },
]);

const CASE06_PAYMENT_SITUATION_MATCH_OPTIONS = withDi([
  { value: "match", label: "실제 있었던 일과 맞고, 내야 하는 돈이라고 생각합니다." },
  { value: "amount_or_reason_mismatch", label: "그런 일은 있었지만, 금액이나 이유가 실제와 다릅니다." },
  { value: "insufficient_info", label: "안내 내용이 부족해, 실제와 맞는지 판단하기 어렵습니다." },
  { value: "redemand_after_paid", label: "이미 낸 적이 있는데, 같은 일로 다시 내라는 안내를 받았습니다." },
]);

const CASE06_PAYMENT_AUTHORITY_CHECK_OPTIONS = withDi([
  { value: "clear_answer", label: "기관에 확인했고, 무엇을 얼마나 내야 하는지 분명한 답을 받았습니다." },
  { value: "unclear_answer", label: "기관에 확인했지만, 답변이 분명하지 않았습니다." },
  { value: "not_checked_yet", label: "아직 기관에 확인해 보지 않았습니다." },
  { value: "cannot_reach", label: "확인하려고 했지만, 기관과 연락이 닿지 않았습니다." },
]);

const CASE06_PAYMENT_RESPONSE_OPTIONS = withDi([
  { value: "already_paid", label: "안내받은 금액을 이미 납부했습니다." },
  { value: "preparing_payment", label: "납부하려고 준비하고 있지만, 아직 내지는 않았습니다." },
  { value: "dispute_or_recheck", label: "내기 전에, 금액이나 이유를 다시 확인해 달라고 요청했습니다." },
  { value: "no_action", label: "아직 아무것도 하지 않았습니다." },
]);

const CASE06_PAYMENT_NON_PAYMENT_NOTICE_OPTIONS = withDi([
  { value: "enforcement_warning", label: "제재를 받거나 강제로 징수될 수 있다는 안내를 받았습니다." },
  { value: "interest_surcharge_warning", label: "기한이 지나면 가산금이나 이자가 붙는다는 안내를 받았습니다." },
  { value: "no_notice", label: "미납 시 어떻게 되는지는 안내받지 못했습니다." },
]);

const CASE06_ATTENDANCE_SUBJECT_OPTIONS = withDi([
  { value: "specific_violation", label: "특정 위반 행위에 대해, 직접 설명하라고 했습니다." },
  { value: "submitted_docs_review", label: "제출한 서류나 신청 내용에 확인할 부분이 있다고 했습니다." },
  { value: "ongoing_investigation", label: "진행 중인 조사와 관련해, 추가로 확인할 것이 있다고 했습니다." },
  { value: "not_explained", label: "가서 설명하라는 안내만 받았고, 무엇에 대한 것인지는 설명받지 못했습니다." },
]);

const CASE06_ATTENDANCE_FACT_MATCH_OPTIONS = withDi([
  { value: "match", label: "실제 있었던 일과 거의 같습니다." },
  { value: "partial", label: "일부는 맞지만, 중요한 부분이 실제와 다릅니다." },
  { value: "mismatch", label: "실제 있었던 일과 전혀 다릅니다." },
  { value: "insufficient_info", label: "무엇을 문제로 보는지 몰라, 비교하기 어렵습니다." },
]);

const CASE06_ATTENDANCE_NOTICE_DETAIL_OPTIONS = withDi([
  { value: "date_place_method_known", label: "날짜·장소·방법을 모두 정확히 안내받았습니다." },
  { value: "approx_time_only", label: "대략적인 시기만 들었고, 정확한 날짜와 장소는 모릅니다." },
  { value: "method_only", label: "어떤 방법으로 안내받았는지만 기억나고, 내용은 기억나지 않습니다." },
  { value: "no_memory", label: "안내받은 내용이 전혀 기억나지 않습니다." },
]);

const CASE06_ATTENDANCE_RESPONSE_OPTIONS = withDi([
  { value: "attended_or_explained", label: "이미 직접 가서 설명했습니다." },
  { value: "submitted_docs", label: "가는 대신, 관련 서류나 자료를 제출했습니다." },
  { value: "no_response", label: "아직 아무 대응도 하지 않았습니다." },
  { value: "cannot_due_to_unknown", label: "어떻게 해야 하는지 몰라, 대응하지 못하고 있습니다." },
]);

const CASE06_ATTENDANCE_AUTHORITY_REACTION_OPTIONS = withDi([
  { value: "no_issue_reply", label: "문제가 없다는 답변을 받았습니다." },
  { value: "more_docs_or_reattend", label: "추가 자료를 내거나, 다시 와서 설명하라는 요구를 받았습니다." },
  { value: "no_reply_yet", label: "아직 답변을 받지 못했습니다." },
  { value: "adverse_notice", label: "오히려 불리한 조치를 하겠다는 통보를 받았습니다." },
]);

const CASE06_SUBMISSION_REQUIREMENT_OPTIONS = withDi([
  { value: "add_missing_docs", label: "처음에 내지 않은 서류를 추가로 제출하라고 했습니다." },
  { value: "correct_existing", label: "이미 낸 서류의 잘못된 내용을 고쳐서 다시 내라고 했습니다." },
  { value: "retranslate_or_certify", label: "번역을 다시 하거나, 공증·인증을 다시 받아 오라고 했습니다." },
  { value: "extra_explanation_evidence", label: "내용을 뒷받침할 설명이나 증빙을 더 내라고 했습니다." },
  { value: "not_explained", label: "다시 내라는 안내만 받았고, 무엇을 내야 하는지는 설명받지 못했습니다." },
]);

const CASE06_SUBMISSION_REASON_OPTIONS = withDi([
  { value: "requirements_insufficient", label: "신청할 때 필요한 조건이 처음부터 부족했다고 설명했습니다." },
  { value: "doc_error_mismatch", label: "제출한 서류에 오류가 있거나, 서류끼리 맞지 않는다고 설명했습니다." },
  { value: "policy_change_extra", label: "규정이 바뀌어서, 추가 서류가 필요하다고 설명했습니다." },
  { value: "reason_not_explained", label: "이유는 구체적으로 설명하지 않았습니다." },
]);

const CASE06_SUBMISSION_RELATION_OPTIONS = withDi([
  { value: "match", label: "맞습니다. 실제로 서류가 부족했거나 잘못된 부분이 있었습니다." },
  { value: "partial", label: "지적받은 것 중 일부만 실제 문제입니다." },
  { value: "mismatch", label: "이미 제출했거나 문제가 없던 내용이라, 실제와 다릅니다." },
  { value: "insufficient_info", label: "판단할 정보가 부족해, 맞는지 알 수 없습니다." },
]);

const CASE06_SUBMISSION_RESPONSE_OPTIONS = withDi([
  { value: "submitted_all", label: "요구받은 서류를 모두 준비해서 제출했습니다." },
  { value: "submitted_partial", label: "일부만 준비해서 제출했고, 나머지는 아직입니다." },
  { value: "not_submitted_yet", label: "아직 아무것도 제출하지 않았습니다." },
  { value: "blocked_unknown_how", label: "무엇을 어떻게 제출해야 할지 몰라, 제출하지 못했습니다." },
]);

const CASE06_SUBMISSION_AUTHORITY_REACTION_OPTIONS = withDi([
  { value: "no_issue_reply", label: "문제가 없다는 답변을 받았습니다." },
  { value: "more_docs_requested", label: "추가 서류를 내거나, 다시 보완하라는 요구를 받았습니다." },
  { value: "no_reply_yet", label: "아직 답변을 받지 못했습니다." },
  { value: "adverse_notice", label: "신청이 거절되는 등 불리한 통보를 받았습니다." },
]);

const CASE06_SUBMISSION_EVIDENCE_OPTIONS = withDi([
  { value: "has_original_or_copy", label: "제출한 서류의 원본이나 사본을 가지고 있습니다." },
  { value: "has_messages", label: "기관과 주고받은 문자·이메일이나 메모가 있습니다." },
  { value: "has_call_record", label: "담당자와 통화하거나 상담한 기록이 있습니다." },
  { value: "no_evidence", label: "확인할 수 있는 자료가 없습니다." },
]);

const CASE06_DISPOSITION_TYPE_CANDIDATE_OPTIONS = withDi([
  { value: "business_suspension", label: "일정 기간 운행이나 영업을 할 수 없는 정지 조치라고 들었습니다." },
  { value: "license_or_registration_revoked", label: "면허나 허가·등록이 취소되는 조치라고 들었습니다." },
  { value: "fine_type_disposition", label: "벌금을 부과하는 조치라고 들었습니다." },
  { value: "adverse_unnamed", label: "조치 이름은 모르지만, 불리한 결정이라는 것만 알고 있습니다." },
]);

const CASE06_DISPOSITION_REASON_OPTIONS = withDi([
  { value: "specific_violation", label: "특정 위반 행위 때문이라고 설명했습니다." },
  { value: "docs_or_requirements_gap", label: "서류나 조건이 부족하기 때문이라고 설명했습니다." },
  { value: "heard_not_understood", label: "이유를 설명해 주었지만, 이해하지 못했습니다." },
  { value: "not_explained", label: "이유는 설명받지 못했습니다." },
]);

const CASE06_DISPOSITION_FACT_MATCH_OPTIONS = withDi([
  { value: "match", label: "실제 있었던 일과 거의 같습니다." },
  { value: "partial", label: "일부는 맞지만, 중요한 부분이 실제와 다릅니다." },
  { value: "mismatch", label: "실제 있었던 일과 전혀 다릅니다." },
  { value: "insufficient_info", label: "이유를 정확히 몰라, 비교하기 어렵습니다." },
]);

const CASE06_DISPOSITION_EFFECTIVE_DATE_OPTIONS = withDi([
  { value: "exact_effective_date", label: "적용되는 정확한 날짜를 안내받았습니다." },
  { value: "approx_effective_date", label: "대략적인 시기만 들었고, 정확한 날짜는 모릅니다." },
  { value: "already_effective", label: "이미 적용이 시작되었다고 들었습니다." },
  { value: "not_stated", label: "언제부터 적용되는지는 안내받지 못했습니다." },
]);

const CASE06_DISPOSITION_RESPONSE_OPTIONS = withDi([
  { value: "appeal_or_review_requested", label: "결정을 다시 검토해 달라고 요청했습니다." },
  { value: "submitted_requested_docs", label: "기관이 요구한 서류나 자료를 제출했습니다." },
  { value: "no_action", label: "아직 아무것도 하지 않았습니다." },
  { value: "appeal_method_unknown", label: "다시 검토를 요청하고 싶지만, 방법을 모릅니다." },
]);

const CASE06_UNCLEAR_CONTENT_RECHECK_OPTIONS = withDi([
  { value: "signal_violation", label: "위반이나 문제가 있다는 내용이 언급되어 있었습니다." },
  { value: "signal_payment", label: "돈이나 금액과 관련된 내용이 언급되어 있었습니다." },
  { value: "signal_submission", label: "서류 제출과 관련된 내용이 언급되어 있었습니다." },
  { value: "signal_attendance", label: "직접 오거나 설명하라는 내용이 언급되어 있었습니다." },
  { value: "signal_disposition", label: "이미 결정된 조치에 대한 내용이 언급되어 있었습니다." },
]);

const CASE06_UNCLEAR_FACT_RELATION_OPTIONS = withDi([
  { value: "actually_related", label: "실제로 있었던 일과 관련된 내용입니다." },
  { value: "partially_related", label: "일부만 실제 있었던 일과 관련이 있습니다." },
  { value: "unrelated", label: "저와는 전혀 관계없는 일입니다." },
  { value: "insufficient_info", label: "내용을 이해하지 못해, 관계를 판단할 수 없습니다." },
]);

const CASE06_UNCLEAR_RESPONSE_OPTIONS = withDi([
  { value: "inquired", label: "기관에 연락해서, 무슨 내용인지 물어봤습니다." },
  { value: "prepared_docs", label: "필요할 것 같은 서류나 자료를 준비했습니다." },
  { value: "no_action", label: "아직 아무것도 하지 않았습니다." },
  { value: "blocked_unknown_action", label: "무엇을 해야 할지 몰라, 아무것도 하지 못하고 있습니다." },
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
  CASE06_DEADLINE_DATE_KEY,
  CASE06_PAYMENT_AMOUNT_TEXT_KEY,
  CASE06_ATTENDANCE_NOTICE_TEXT_KEY,
  CASE06_DISPOSITION_EFFECTIVE_DATE_TEXT_KEY,
];

export function case06DeadlineActionIsByDateSlug(value: string | undefined): boolean {
  const slug = value?.trim();
  return Boolean(slug && CASE06_DEADLINE_BY_DATE_SLUGS.has(slug));
}

export function case06NeedsDeadlineDate(answers: ReviewAnswers): boolean {
  const pair = answers.case06_deadlineActionPair?.trim();
  if (pair && CASE06_DEADLINE_BY_DATE_SLUGS.has(pair)) {
    return !answers[CASE06_DEADLINE_DATE_KEY]?.trim();
  }
  if (
    isCase06LegacyRestorePath(answers) &&
    answers.profileAuthorityGuidance === "specific_date"
  ) {
    return !answers[CASE06_DEADLINE_DATE_KEY]?.trim();
  }
  return false;
}

export function case06NeedsPaymentAmountText(answers: ReviewAnswers): boolean {
  return (
    answers.case06_paymentAmountKnown === "exact_amount_known" &&
    !answers[CASE06_PAYMENT_AMOUNT_TEXT_KEY]?.trim()
  );
}

export function case06NeedsAttendanceNoticeText(answers: ReviewAnswers): boolean {
  return (
    answers.case06_attendanceNoticeDetail === "date_place_method_known" &&
    !answers[CASE06_ATTENDANCE_NOTICE_TEXT_KEY]?.trim()
  );
}

export function case06NeedsDispositionEffectiveDateText(answers: ReviewAnswers): boolean {
  return (
    answers.case06_dispositionEffectiveDate === "exact_effective_date" &&
    !answers[CASE06_DISPOSITION_EFFECTIVE_DATE_TEXT_KEY]?.trim()
  );
}

export function getCase06RequiredActionCandidateLabel(answers: ReviewAnswers): string | null {
  const value = answers.case06_requiredActionCandidate?.trim();
  if (!value) return null;
  if (value === "other") {
    const note = answers[getAdminChoiceNoteKey("case06_requiredActionCandidate")]?.trim();
    return note || ADMIN_DIRECT_EXPLAIN_LABEL;
  }
  const opt = CASE06_REQUIRED_ACTION_CANDIDATE_OPTIONS.find((o) => o.value === value);
  return opt?.label ?? value;
}

/** R03=C — read-only state lines (question screen + 1st result). No case02~05 keys. */
export function buildCase06PrincipleFStateLines(answers: ReviewAnswers): string[] {
  const lines: string[] = [];
  const target = answers[CASE06_BRIDGE_TARGET_CASE_KEY]?.trim();
  if (
    target &&
    CASE06_BRIDGE_TARGET_LABELS[target] &&
    !(isCase06LaunchSimplifiedSession(answers) && target === "CASE_06")
  ) {
    lines.push(`앞서 분류: ${CASE06_BRIDGE_TARGET_LABELS[target]}`);
  }
  const actionLabel = getCase06RequiredActionCandidateLabel(answers);
  if (actionLabel) {
    lines.push(`문서에서 들은 요구: ${actionLabel}`);
  }
  const deadlineText = answers[CASE06_DEADLINE_DATE_KEY]?.trim();
  if (deadlineText) {
    lines.push(`적어 둔 날짜·기한: ${deadlineText}`);
  }
  if (!isCase06LaunchSimplifiedSession(answers)) {
    const amountText = answers[CASE06_PAYMENT_AMOUNT_TEXT_KEY]?.trim();
    if (amountText) {
      lines.push(`적어 둔 금액: ${amountText}`);
    }
  }
  if (isCase06LegacyRestorePath(answers)) {
    if (answers.profileDocumentSource) {
      lines.push(
        `문서 출처(복원): ${answers.profileDocumentSource}`,
      );
    }
    if (answers.profileCurrentGoal) {
      lines.push(`확인 목표(복원): ${answers.profileCurrentGoal}`);
    }
    if (answers.profileAuthorityGuidance && answers.profileAuthorityGuidance !== "specific_date") {
      lines.push(`기한 인식(복원): ${answers.profileAuthorityGuidance}`);
    }
    if (answers.profilePerceivedIssue) {
      lines.push(`이해 어려운 부분(복원): ${answers.profilePerceivedIssue}`);
    }
    if (answers.case06_documentNature) {
      lines.push(`문서 성격(복원): ${answers.case06_documentNature}`);
    }
  }
  return lines;
}

function textFieldComplete(key: string, answers: ReviewAnswers): boolean {
  return Boolean(answers[key]?.trim());
}

function pushDeadlineDateText(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!case06NeedsDeadlineDate(answers)) return;
  pushUnique(questions, {
    id: CASE06_DEADLINE_DATE_KEY,
    kind: "text",
    label: "안내받은 날짜나 기한은 언제인가요?",
    placeholder: "문서에 적힌 그대로 입력해 주세요. 예) 2026년 10월 15일까지",
  });
}

function pushPaymentAmountText(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!case06NeedsPaymentAmountText(answers)) return;
  pushUnique(questions, {
    id: CASE06_PAYMENT_AMOUNT_TEXT_KEY,
    kind: "text",
    label: "안내받은 금액을 입력해 주세요.",
    placeholder: "문서나 문자에 적힌 금액과 단위를 그대로 입력해 주세요. 예) 800,000동",
  });
}

function pushAttendanceNoticeText(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!case06NeedsAttendanceNoticeText(answers)) return;
  pushUnique(questions, {
    id: CASE06_ATTENDANCE_NOTICE_TEXT_KEY,
    kind: "text",
    label: "안내받은 날짜·장소·방법을 입력해 주세요.",
    placeholder: "기억나는 날짜와 시간, 장소를 입력해 주세요.",
  });
}

function pushDispositionEffectiveDateText(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!case06NeedsDispositionEffectiveDateText(answers)) return;
  pushUnique(questions, {
    id: CASE06_DISPOSITION_EFFECTIVE_DATE_TEXT_KEY,
    kind: "text",
    label: "조치가 적용되는 날짜를 입력해 주세요.",
    placeholder: "문서에 적힌 그대로 입력해 주세요. 예) 2026년 10월 15일부터",
  });
}

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

/** 개인화 퍼널 v1 — 문서를 직접 확인하지 않은 고객에게만 전달 주체를 묻는다 */
const CASE06_SOURCE_CHANNEL_KNOWLEDGE = new Set([
  "explained_without_doc",
  "memory_only_no_doc_now",
  "path_unclear",
]);

export function case06NeedsSourceChannel(answers: ReviewAnswers): boolean {
  return CASE06_SOURCE_CHANNEL_KNOWLEDGE.has(answers.case06_knowledgeSource?.trim() ?? "");
}

/** 개인화 퍼널 v1 — 1번(해야 할 일)과 맞는 '정해진 날짜까지 ○○' 선택지만. 저장된 값은 유지 */
const CASE06_ACTION_TO_BY_DATE: Record<string, string> = {
  pay_demand: "deadline_pay_by_date",
  attend_explain: "deadline_attend_by_date",
  submit_supplement: "deadline_submit_by_date",
};

export function case06DeadlineActionPairOptionsFor(
  answers: ReviewAnswers,
): { value: string; label: string }[] {
  const options = CASE06_V11_FIELD_OPTIONS.case06_deadlineActionPair ?? [];
  const keep = CASE06_ACTION_TO_BY_DATE[answers.case06_requiredActionCandidate?.trim() ?? ""];
  if (!keep) return options;
  const saved = answers.case06_deadlineActionPair?.trim();
  return options.filter(
    (o) => o.value === saved || !CASE06_DEADLINE_BY_DATE_SLUGS.has(o.value) || o.value === keep,
  );
}

/** 개인화 퍼널 v1 — 1번과 명백히 맞지 않는 진행 상황만 제외. 저장된 값은 유지 */
export function case06CustomerResponseOptionsFor(
  answers: ReviewAnswers,
): { value: string; label: string }[] {
  const options = CASE06_V11_FIELD_OPTIONS.case06_customerResponse ?? [];
  const action = answers.case06_requiredActionCandidate?.trim() ?? "";
  const saved = answers.case06_customerResponse?.trim();
  return options.filter((o) => {
    if (o.value === saved) return true;
    if (o.value === "paid_or_attempted_pay") {
      return action !== "attend_explain" && action !== "submit_supplement";
    }
    if (o.value === "attended_then_redemand") {
      return action !== "pay_demand";
    }
    return true;
  });
}

export function isCase06RedesignPhase1Complete(answers: ReviewAnswers): boolean {
  for (const fieldId of CASE06_V11_PHASE1_FIELD_ORDER) {
    if (fieldId === "case06_sourceChannel" && !case06NeedsSourceChannel(answers)) continue;
    const options = CASE06_V11_FIELD_OPTIONS[fieldId];
    if (!options || !choiceComplete(fieldId, answers, options)) return false;
  }
  if (case06NeedsDeadlineDate(answers)) return false;
  return true;
}

/** Legacy Phase1 or v1.1 — single deadline text gate (R04). */
export function appendCase06DeadlineDateTextIfNeeded(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
): void {
  pushDeadlineDateText(questions, answers);
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
  if (case06NeedsPaymentAmountText(answers)) return false;
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
  if (case06NeedsAttendanceNoticeText(answers)) return false;
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
  if (case06NeedsDispositionEffectiveDateText(answers)) return false;
  return true;
}

function isChainUnclearExpertComplete(answers: ReviewAnswers): boolean {
  if (!choiceComplete("case06_unclearContentRecheck", answers, CASE06_UNCLEAR_CONTENT_RECHECK_OPTIONS)) {
    return false;
  }
  const recheck = answers.case06_unclearContentRecheck?.trim();
  if (recheck === "signal_violation") {
    if (
      !choiceComplete("case06_unclearFactRelation", answers, CASE06_UNCLEAR_FACT_RELATION_OPTIONS)
    ) {
      return false;
    }
    if (!choiceComplete("case06_unclearResponse", answers, CASE06_UNCLEAR_RESPONSE_OPTIONS)) {
      return false;
    }
    return isCase06ExpertTerminal(answers);
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
  if (isCase06LaunchSimplifiedSession(answers)) return false;
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

export function applyExpertTerminalFields(answers: ReviewAnswers): ReviewAnswers {
  return {
    ...answers,
    case06_classificationStatus: "unresolved",
    case06_unresolvedReason: "document_action_nature_unclear",
    case06_expertHandoffRequired: "true",
  };
}

/** 출시 간소화 — 신규 CASE_06은 Phase1만, Phase2·브릿지 타 CASE 미사용. */
export const CASE06_LAUNCH_SIMPLIFIED_ENABLED = true;

export function isCase06LaunchSimplifiedSession(answers: ReviewAnswers): boolean {
  return CASE06_LAUNCH_SIMPLIFIED_ENABLED && !isCase06LegacyRestorePath(answers);
}

export function maybeApplyCase06LaunchExpertHandoff(answers: ReviewAnswers): ReviewAnswers {
  if (!isCase06LaunchSimplifiedSession(answers)) return answers;
  if (!isCase06RedesignPhase1Complete(answers)) return answers;
  if (isCase06ExpertTerminal(answers)) return answers;
  let next = applyExpertTerminalFields(answers);
  return {
    ...next,
    [CASE06_BRIDGE_SNAPSHOT_COMMITTED_KEY]: "1",
    [CASE06_BRIDGE_TARGET_CASE_KEY]: "CASE_06",
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
  if (!pushChoice(questions, answers, "case06_paymentNature", "무엇에 대한 비용이라고 안내받으셨나요?", CASE06_PAYMENT_NATURE_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_paymentAmountKnown", "내야 할 금액은 어떻게 안내받으셨나요?", CASE06_PAYMENT_AMOUNT_KNOWN_OPTIONS)) return;
  pushPaymentAmountText(questions, answers);
  if (case06NeedsPaymentAmountText(answers)) return;
  if (!pushChoice(questions, answers, "case06_paymentSituationMatch", "그 금액과 이유는 실제 상황과 맞나요?", CASE06_PAYMENT_SITUATION_MATCH_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_paymentAuthorityCheck", "이 납부 안내에 대해 기관에 확인한 결과는 어땠나요?", CASE06_PAYMENT_AUTHORITY_CHECK_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_paymentResponse", "지금까지 이 납부에 대해 어떻게 하셨나요?", CASE06_PAYMENT_RESPONSE_OPTIONS)) return;
  if (case06NeedsPaymentNonPaymentNotice(answers)) {
    pushChoice(
      questions,
      answers,
      "case06_paymentNonPaymentNotice",
      "기한 안에 내지 않으면 어떻게 된다고 안내받으셨나요?",
      CASE06_PAYMENT_NON_PAYMENT_NOTICE_OPTIONS,
    );
  }
}

function appendAttendanceChain(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!pushChoice(questions, answers, "case06_attendanceSubject", "무엇에 대해 가서 설명하라고 했나요?", CASE06_ATTENDANCE_SUBJECT_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_attendanceFactMatch", "기관이 문제로 보는 내용은 실제 있었던 일과 비교하면 어떤가요?", CASE06_ATTENDANCE_FACT_MATCH_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_attendanceNoticeDetail", "언제, 어디로, 어떻게 가라는 안내를 받으셨나요?", CASE06_ATTENDANCE_NOTICE_DETAIL_OPTIONS)) return;
  pushAttendanceNoticeText(questions, answers);
  if (case06NeedsAttendanceNoticeText(answers)) return;
  if (!pushChoice(questions, answers, "case06_attendanceResponse", "지금까지 어떻게 대응하셨나요?", CASE06_ATTENDANCE_RESPONSE_OPTIONS)) return;
  if (case06NeedsAttendanceAuthorityReaction(answers)) {
    pushChoice(
      questions,
      answers,
      "case06_attendanceAuthorityReaction",
      "그 뒤 기관에서는 어떤 답변이 있었나요?",
      CASE06_ATTENDANCE_AUTHORITY_REACTION_OPTIONS,
    );
  }
}

function appendSubmissionChain(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!pushChoice(questions, answers, "case06_submissionRequirement", "기관은 어떤 서류나 내용을 다시 내라고 했나요?", CASE06_SUBMISSION_REQUIREMENT_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_submissionReason", "다시 내야 하는 이유를 기관은 어떻게 설명했나요?", CASE06_SUBMISSION_REASON_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_submissionRelation", "그 설명은 실제 상황과 비교하면 어떤가요?", CASE06_SUBMISSION_RELATION_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_submissionResponse", "안내를 받은 뒤, 실제로 무엇을 제출하셨나요?", CASE06_SUBMISSION_RESPONSE_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_submissionAuthorityReaction", "그 뒤 기관에서는 어떤 답변이 있었나요?", CASE06_SUBMISSION_AUTHORITY_REACTION_OPTIONS)) return;
  if (case06NeedsSubmissionEvidence(answers)) {
    pushChoice(
      questions,
      answers,
      "case06_submissionEvidence",
      "이 내용을 확인할 수 있는 자료 중 가지고 계신 것은 무엇인가요?",
      CASE06_SUBMISSION_EVIDENCE_OPTIONS,
    );
  }
}

function appendDispositionChain(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (!pushChoice(questions, answers, "case06_dispositionTypeCandidate", "어떤 조치라고 안내받으셨나요?", CASE06_DISPOSITION_TYPE_CANDIDATE_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_dispositionReason", "그 조치의 이유를 기관은 어떻게 설명했나요?", CASE06_DISPOSITION_REASON_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_dispositionFactMatch", "그 이유는 실제 있었던 일과 비교하면 어떤가요?", CASE06_DISPOSITION_FACT_MATCH_OPTIONS)) return;
  if (!pushChoice(questions, answers, "case06_dispositionEffectiveDate", "이 조치는 언제부터 적용된다고 안내받으셨나요?", CASE06_DISPOSITION_EFFECTIVE_DATE_OPTIONS)) return;
  pushDispositionEffectiveDateText(questions, answers);
  if (case06NeedsDispositionEffectiveDateText(answers)) return;
  pushChoice(questions, answers, "case06_dispositionResponse", "지금까지 이 조치에 어떻게 대응하셨나요?", CASE06_DISPOSITION_RESPONSE_OPTIONS);
}

function appendUnclearChain(questions: ProfileQuestion[], answers: ReviewAnswers): void {
  if (
    !pushChoice(
      questions,
      answers,
      "case06_unclearContentRecheck",
      "문서나 안내에서 교통국이 언급한 내용은 무엇에 가장 가까웠나요?",
      CASE06_UNCLEAR_CONTENT_RECHECK_OPTIONS,
    )
  ) {
    return;
  }
  const recheck = answers.case06_unclearContentRecheck?.trim();
  if (recheck && recheck !== "other" && recheck !== "signal_violation" && CASE06_RECHECK_SIGNAL_TO_CHAIN[recheck]) {
    const chain = CASE06_RECHECK_SIGNAL_TO_CHAIN[recheck];
    if (chain === 1) appendPaymentChain(questions, answers);
    else if (chain === 2) appendAttendanceChain(questions, answers);
    else if (chain === 3) appendSubmissionChain(questions, answers);
    else if (chain === 4) appendDispositionChain(questions, answers);
    return;
  }
  if (!pushChoice(questions, answers, "case06_unclearFactRelation", "교통국이 지적한 내용은 실제 있었던 일과 어떤 관계가 있나요?", CASE06_UNCLEAR_FACT_RELATION_OPTIONS)) {
    return;
  }
  if (!pushChoice(questions, answers, "case06_unclearResponse", "지금까지 이 일에 대해 어떻게 하셨나요?", CASE06_UNCLEAR_RESPONSE_OPTIONS)) {
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
      label: "문서나 설명을 통해, 교통국이 무엇을 하라고 한 것으로 이해하셨나요?",
    },
    { id: "case06_knowledgeSource", label: "이 내용을 어떻게 확인하셨나요?" },
    { id: "case06_sourceChannel", label: "이 내용은 누구를 통해 전달받으셨나요?" },
    { id: "case06_deadlineActionPair", label: "언제까지 무엇을 하라는 안내를 받으셨나요?" },
    { id: "case06_customerResponse", label: "안내를 받은 뒤, 현재 어디까지 진행하셨나요?" },
  ];
  for (const field of phase1) {
    const options = CASE06_V11_FIELD_OPTIONS[field.id];
    if (!options) return;
    if (field.id === "case06_sourceChannel" && !case06NeedsSourceChannel(answers)) continue;
    const shown =
      field.id === "case06_deadlineActionPair"
        ? case06DeadlineActionPairOptionsFor(answers)
        : field.id === "case06_customerResponse"
          ? case06CustomerResponseOptionsFor(answers)
          : options;
    pushUnique(questions, { id: field.id, kind: "choice", label: field.label, options: shown });
    if (!choiceComplete(field.id, answers, options)) return;
    if (field.id === "case06_deadlineActionPair") {
      pushDeadlineDateText(questions, answers);
      if (case06NeedsDeadlineDate(answers)) return;
    }
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
  if (isCase06LaunchSimplifiedSession(answers)) {
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
      if (fieldId === "case06_sourceChannel" && !case06NeedsSourceChannel(answers)) continue;
      const options = CASE06_V11_FIELD_OPTIONS[fieldId];
      if (!options || choiceComplete(fieldId, answers, options)) continue;
      return { questionId: fieldId, focus: "caseClassification", reason: "CASE_06 Phase1" };
    }
    if (case06NeedsDeadlineDate(answers)) {
      return {
        questionId: CASE06_DEADLINE_DATE_KEY,
        focus: "deadline",
        reason: "CASE_06 Phase1 deadline date",
      };
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
    if (fieldId === "case06_paymentAmountKnown" && case06NeedsPaymentAmountText(answers)) {
      return {
        questionId: CASE06_PAYMENT_AMOUNT_TEXT_KEY,
        focus: "authorityClaim",
        reason: "CASE_06 payment amount text",
      };
    }
    if (fieldId === "case06_attendanceNoticeDetail" && case06NeedsAttendanceNoticeText(answers)) {
      return {
        questionId: CASE06_ATTENDANCE_NOTICE_TEXT_KEY,
        focus: "actualSituation",
        reason: "CASE_06 attendance notice text",
      };
    }
    if (
      fieldId === "case06_dispositionEffectiveDate" &&
      case06NeedsDispositionEffectiveDateText(answers)
    ) {
      return {
        questionId: CASE06_DISPOSITION_EFFECTIVE_DATE_TEXT_KEY,
        focus: "deadline",
        reason: "CASE_06 disposition effective date text",
      };
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
  const recheck = answers.case06_unclearContentRecheck?.trim();
  if (recheck !== "other" && recheck !== "signal_violation") return answers;
  if (
    !choiceComplete("case06_unclearFactRelation", answers, CASE06_UNCLEAR_FACT_RELATION_OPTIONS) ||
    !choiceComplete("case06_unclearResponse", answers, CASE06_UNCLEAR_RESPONSE_OPTIONS)
  ) {
    return answers;
  }
  return applyExpertTerminalFields(answers);
}
