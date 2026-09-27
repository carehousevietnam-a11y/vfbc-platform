/**
 * CASE_05 choice copy — docs/master/VFBCAI_CASE05_CHOICE_FINAL_v3_CLAUDE.md (verbatim, v3 — v2 대체).
 */
const ADMIN_DIRECT_EXPLAIN_CHOICE = {
  value: "other",
  label: "위에 내용이 없거나 설명이 필요합니다 → 직접 입력",
};

export const CASE05_V2_QUESTION_LABELS = {
  case05_dispositionType: "교통국으로부터 어떤 통지를 받으셨나요?",
  case05_confirmGoal: "지금 가장 먼저 확인하고 싶은 것은 무엇인가요?",
  case05_customerResponse: "통지를 받은 뒤, 현재 어디까지 진행하셨나요?",
  case05_deadline: "이 일과 관련해 언제까지 무엇을 해야 하는지 안내받으셨나요?",
  case05_deadlineDate: "안내받은 날짜를 입력해 주세요.",
  case05_deadlineDatePlaceholder: "통지서에 적힌 그대로 입력해 주세요. 예) 2026년 10월 15일까지",
  case05_factRelationship: "통지서에 적힌 내용은 실제 있었던 일과 비교하면 어떤가요?",
  case05_factDetail: "실제와 다른 부분은 무엇인가요?",
  case05_dispositionReason: "통지서에는 조치 이유가 어떻게 적혀 있었나요?",
  case05_dispositionDetail: "이 조치로 실제로 무엇이 달라지는지 알고 계신가요?",
  case05_explanationDetail: "어떤 방법으로 설명하셨고, 교통국에서 접수 확인을 받으셨나요?",
  case05_submittedDocsDetail: "교통국에 제출한 서류를 모두 선택해 주세요. (여러 개 선택 가능)",
  case05_appealDetail: "재검토 요청은 현재 어디까지 진행되었나요?",
  case05_authorityFollowUp: "교통국에 문의하거나 서류를 제출한 뒤, 어떤 답변을 받으셨나요?",
  case05_blockage: "현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?",
  case05_evidence: "현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)",
  case05_finalGoal: "이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?",
} as const;

export const CASE05_DISPOSITION_TYPE_OPTIONS_V2 = [
  { value: "application_denied", label: "신청한 허가나 등록이 승인되지 않았다는 통지를 받았습니다." },
  { value: "rights_ended", label: "이미 받은 면허나 허가가 정지되거나 취소된다는 통지를 받았습니다." },
  { value: "business_suspended", label: "일정 기간 동안 운행이나 영업을 하지 말라는 통지를 받았습니다." },
  { value: "situation_mismatch", label: "통지를 받았지만, 적힌 내용이 실제 있었던 일과 다릅니다." },
  { value: "disposition_unclear", label: "통지를 받았지만, 어떤 조치이고 무엇을 해야 하는지 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_CONFIRM_GOAL_OPTIONS_V2 = [
  { value: "understand_reason", label: "이런 통지를 받은 이유를 알 수 없어, 그 이유부터 확인하고 싶습니다." },
  { value: "understand_impact", label: "이 조치로 앞으로 무엇을 할 수 없게 되는지, 업무나 생활에 미치는 영향을 확인하고 싶습니다." },
  { value: "appeal_possibility", label: "이 결정을 다시 검토해 달라고 요청할 수 있는지, 기한은 언제까지인지 확인하고 싶습니다." },
  { value: "what_to_do", label: "서류 제출·납부·방문 등 지금 바로 해야 할 일을 확인하고 싶습니다." },
  { value: "unsure", label: "상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_CUSTOMER_RESPONSE_OPTIONS_V2 = [
  { value: "none", label: "통지만 받았고, 아직 교통국에 문의하거나 서류를 제출하지 않았습니다." },
  { value: "inquired", label: "교통국에 전화하거나 방문해 문의했지만, 서류나 요청서는 제출하지 않았습니다." },
  { value: "explanation_submitted", label: "제 사정을 서면으로 제출했거나, 직접 방문해 설명했습니다." },
  { value: "documents_submitted", label: "교통국이 요청한 서류나 증빙을 준비해 제출했습니다." },
  { value: "appeal_requested", label: "결정을 다시 검토해 달라고 교통국에 정식으로 요청했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_DEADLINE_OPTIONS_V2 = [
  { value: "specific_date", label: "통지서나 안내문에 적힌 정확한 날짜를 확인했습니다." },
  { value: "period_stated", label: "'통지받은 날부터 며칠 이내'처럼 기간만 적혀 있어, 정확한 날짜는 계산하지 못했습니다." },
  { value: "uncertain", label: "기한이 있다는 안내는 받았지만, 정확한 날짜는 확인하지 못했습니다." },
  { value: "not_stated", label: "통지서를 확인했지만, 기한에 관한 내용은 찾지 못했습니다." },
  { value: "unsure", label: "통지서가 베트남어로 되어 있어, 기한이 적혀 있는지조차 확인하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_FACT_RELATIONSHIP_OPTIONS_V2 = [
  { value: "match", label: "통지서에 적힌 내용이 실제 있었던 일과 거의 같습니다." },
  { value: "partial", label: "대부분 맞지만, 날짜·장소·금액 등 일부 내용이 실제와 다릅니다." },
  { value: "mismatch", label: "통지서에 적힌 일 자체가 실제 있었던 일과 크게 다릅니다." },
  { value: "hard_to_judge", label: "기록이 없거나 시간이 오래 지나, 실제와 비교하기 어렵습니다." },
  { value: "unknown", label: "통지서의 내용을 이해하지 못해, 비교할 수 없습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_FACT_DETAIL_OPTIONS_V2 = [
  { value: "date_place_certain", label: "날짜·장소·상황이 실제와 다르며, 이를 분명히 기억하고 있습니다." },
  { value: "date_place_fuzzy", label: "날짜·장소가 다른 것 같지만, 정확히 기억나지 않습니다." },
  { value: "content_differs_clear", label: "제 행동이나 사유가 다르게 적혀 있으며, 무엇이 다른지 설명할 수 있습니다." },
  { value: "content_differs_vague", label: "내용이 다른 것 같지만, 무엇이 다른지 아직 정리하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_DISPOSITION_REASON_OPTIONS_V2 = [
  { value: "violation_claimed", label: "제가 특정 규정을 위반했다고 적혀 있습니다." },
  { value: "document_issue", label: "제출한 서류나 신청 내용이 틀렸거나 빠졌다고 적혀 있습니다." },
  { value: "requirement_not_met", label: "필요한 조건이나 자격을 갖추지 못했다고 적혀 있습니다." },
  { value: "deadline_procedure", label: "정해진 기한이나 절차를 지키지 않았다고 적혀 있습니다." },
  { value: "no_clear_reason", label: "이유가 적혀 있지 않거나, 적혀 있어도 무슨 뜻인지 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_DISPOSITION_DETAIL_OPTIONS_V2 = [
  { value: "wording_unclear", label: "통지서 문구가 모호해서, 무엇이 금지되는지 알기 어렵습니다." },
  { value: "scope_unclear", label: "금지되는 일은 알지만, 기간과 범위는 확인하지 못했습니다." },
  { value: "partially_understood", label: "일부는 이해했지만, 업무나 생활에 미치는 영향은 확실하지 않습니다." },
  { value: "unsure", label: "이 조치로 무엇이 달라지는지 아직 전혀 알지 못합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_EXPLANATION_DETAIL_OPTIONS_V2 = [
  { value: "written_no_receipt", label: "서면으로 제출했지만, 접수 확인이나 접수번호는 받지 못했습니다." },
  { value: "written_receipt_ok", label: "서면으로 제출했고, 접수 확인(접수번호 등)을 받았습니다." },
  { value: "verbal_no_record", label: "전화나 방문으로 설명만 했고, 따로 남긴 기록은 없습니다." },
  { value: "verbal_with_record", label: "전화나 방문으로 설명했고, 설명한 내용을 메모해 두었습니다." },
  { value: "both_aligned", label: "서면으로도 제출하고 직접 설명도 했으며, 두 설명의 내용은 같습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS_V2 = [
  { value: "identity", label: "여권·신분증 같은 신분 서류" },
  { value: "financial", label: "통장 내역·영수증 같은 금액 관련 서류" },
  { value: "certificate", label: "기관이나 회사가 발급한 증명서·확인서" },
  { value: "unsure", label: "서류를 제출했지만, 어떤 서류였는지 정확히 알지 못합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_APPEAL_DETAIL_OPTIONS_V2 = [
  { value: "filed_no_receipt", label: "재검토 요청서를 제출했지만, 접수 확인은 아직 받지 못했습니다." },
  { value: "filed_no_schedule", label: "재검토 요청서가 접수되었지만, 결과가 언제 나오는지는 안내받지 못했습니다." },
  { value: "filed_schedule_known", label: "재검토 요청서가 접수되었고, 결과가 나오는 시점도 안내받았습니다." },
  { value: "preparing_deadline_unknown", label: "재검토 요청을 준비하고 있지만, 아직 제출하지 않았습니다." },
  { value: "considering", label: "재검토를 요청할지 아직 결정하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_AUTHORITY_FOLLOWUP_OPTIONS_V2 = [
  { value: "maintained", label: "처음 결정을 그대로 유지한다는 답변을 받았습니다." },
  { value: "changed", label: "결정이 변경되었거나 취소되었다는 답변을 받았습니다." },
  { value: "wants_more", label: "서류를 추가로 제출하거나, 직접 방문해 설명하라는 안내를 받았습니다." },
  { value: "no_response", label: "아직 최종 답변은 받지 못했고, 결과를 기다리고 있습니다." },
  { value: "unsure", label: "답변을 받았지만, 무슨 의미인지 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_BLOCKAGE_OPTIONS_V2 = [
  { value: "why_disposition", label: "조치를 받은 이유를 이해하지 못해, 어떻게 대응할지 판단하지 못하고 있습니다." },
  { value: "what_disposition", label: "이 조치가 정확히 무엇인지 몰라, 어디서부터 시작해야 할지 모르겠습니다." },
  { value: "fact_match", label: "통지 내용이 실제와 맞는지 확인할 방법이 없어, 진행이 멈춰 있습니다." },
  { value: "what_to_do", label: "해야 할 일과 준비해야 할 서류를 알지 못해, 진행하지 못하고 있습니다." },
  { value: "next_response", label: "교통국의 답변을 기다리고 있거나, 받은 답변을 이해하지 못해 멈춰 있습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_EVIDENCE_OPTIONS_V2 = [
  { value: "disposition_notice", label: "교통국에서 받은 통지서나 안내문" },
  { value: "message_email", label: "교통국과 주고받은 문자·이메일·메신저" },
  { value: "submitted_docs", label: "제가 제출한 서류나 납부 영수증(사본 포함)" },
  { value: "photo_video", label: "당시 상황을 보여 주는 사진·영상" },
  { value: "none", label: "보관 중인 자료가 없습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_FINAL_GOAL_OPTIONS_V2 = [
  { value: "why_disposition", label: "조치 이유를 정확히 확인하고, 제 잘못이 맞는지 판단하고 싶습니다." },
  { value: "what_disposition", label: "이 조치로 달라지는 점을 확인하고, 업무나 생활을 미리 조정하고 싶습니다." },
  { value: "fact_match", label: "통지 내용이 사실과 맞는지 확인하고, 다르다면 바로잡고 싶습니다." },
  { value: "what_to_do", label: "해야 할 일과 준비할 서류를 순서대로 확인해, 기한 내에 처리하고 싶습니다." },
  { value: "next_action", label: "결정을 다시 검토해 달라고 요청하는 방법을 확인하고, 진행하고 싶습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

/** v2 screen — removed fields; restore/display only */
export const CASE05_LEGACY_AUTHORITY_FOLLOWUP_LABELS: Record<string, string> = {
  modified: "처분 내용이 변경되었다고 안내받았습니다",
  revoked: "처분이 철회·취소되었다고 안내받았습니다",
  more_docs: "추가 서류·증빙을 요구받았습니다",
  attendance_explanation: "추가 설명이나 출석을 요구받았습니다",
  payment_demand: "납부를 요구받았습니다",
  under_review: "다시 검토하고 있으니 기다리라고 했습니다.",
};

export const CASE05_LEGACY_BLOCKAGE_LABELS: Record<string, string> = {
  appeal_method: "이의제기·재검토·소명 방법을 모르겠습니다.",
  deadline: "대응 기한이 언제인지 모르겠습니다.",
  unsure: "가장 막힌 부분을 정확히 말하기 어렵습니다.",
  evidence: "어떤 서류나 증빙을 준비해야 하는지 몰라서 막혀 있습니다.",
};

export const CASE05_LEGACY_EVIDENCE_LABELS: Record<string, string> = {
  contract: "계약·관계 서류",
  payment_proof: "돈을 낸 영수증이나 이체 기록",
  unsure: "지금 확인할 수 있는 자료가 있는지 아직 확인하지 못했습니다.",
};

export const CASE05_LEGACY_FINAL_GOAL_LABELS: Record<string, string> = {
  expert: "전문가에게 상황을 전달하고 싶어요",
  evidence: "준비해야 할 서류나 증빙을 알고 싶습니다.",
  unsure: "지금 가장 먼저 확인하고 싶은 것이 무엇인지 정확히 말하기 어렵습니다.",
};

export const CASE05_LEGACY_APPEAL_DETAIL_LABELS: Record<string, string> = {
  considering_rules_unread: "신청 여부를 검토 중이고, 가능 여부·기한은 아직 못 읽었습니다.",
  considering_rules_read: "신청 여부를 검토 중이고, 통지서에 기한·요건을 읽었습니다.",
  preparing_deadline_known: "요청하려고 준비 중이고, 언제까지 내야 하는지 알고 있습니다.",
};

export const CASE05_LEGACY_DISPOSITION_REASON_LABELS: Record<string, string> = {
  unsure: "이유가 적혀 있는 것 같지만, 무슨 뜻인지 이해하지 못했습니다.",
};

export const CASE05_LEGACY_EXPLANATION_DETAIL_LABELS: Record<string, string> = {
  both_unverified: "글로도 내고 말로도 설명했는데, 두 내용이 같은지는 확인하지 못했습니다.",
};

export const CASE05_AUTHORITY_FOLLOWUP_LEGACY_TO_CANONICAL: Record<string, string> = {
  modified: "changed",
  revoked: "changed",
  more_docs: "wants_more",
  attendance_explanation: "wants_more",
  under_review: "no_response",
};

export const CASE05_APPEAL_DETAIL_LEGACY_TO_CANONICAL: Record<string, string> = {
  considering_rules_unread: "considering",
  considering_rules_read: "considering",
  preparing_deadline_known: "preparing_deadline_unknown",
};

export const CASE05_BLOCKAGE_LEGACY_TO_CANONICAL: Record<string, string> = {
  appeal_method: "what_to_do",
  evidence: "what_to_do",
};

export const CASE05_DISPOSITION_REASON_LEGACY_TO_CANONICAL: Record<string, string> = {
  unsure: "no_clear_reason",
};

export const CASE05_EVIDENCE_LEGACY_TO_CANONICAL: Record<string, string> = {
  payment_proof: "submitted_docs",
};

export const CASE05_FINAL_GOAL_LEGACY_TO_CANONICAL: Record<string, string> = {
  evidence: "what_to_do",
};

export function case05EffectiveAuthorityFollowUp(value: string | undefined): string | undefined {
  if (!value) return value;
  return CASE05_AUTHORITY_FOLLOWUP_LEGACY_TO_CANONICAL[value] ?? value;
}

export function case05EffectiveAppealDetail(value: string | undefined): string | undefined {
  if (!value) return value;
  return CASE05_APPEAL_DETAIL_LEGACY_TO_CANONICAL[value] ?? value;
}

export function case05EffectiveBlockageSlug(value: string | undefined): string | undefined {
  if (!value) return value;
  return CASE05_BLOCKAGE_LEGACY_TO_CANONICAL[value] ?? value;
}

export const CASE05_V2_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  case05_dispositionType: CASE05_DISPOSITION_TYPE_OPTIONS_V2,
  case05_confirmGoal: CASE05_CONFIRM_GOAL_OPTIONS_V2,
  case05_customerResponse: CASE05_CUSTOMER_RESPONSE_OPTIONS_V2,
  case05_deadline: CASE05_DEADLINE_OPTIONS_V2,
  case05_dispositionReason: CASE05_DISPOSITION_REASON_OPTIONS_V2,
  case05_factRelationship: CASE05_FACT_RELATIONSHIP_OPTIONS_V2,
  case05_authorityFollowUp: CASE05_AUTHORITY_FOLLOWUP_OPTIONS_V2,
  case05_blockage: CASE05_BLOCKAGE_OPTIONS_V2,
  case05_evidence: CASE05_EVIDENCE_OPTIONS_V2,
  case05_finalGoal: CASE05_FINAL_GOAL_OPTIONS_V2,
  case05_dispositionDetail: CASE05_DISPOSITION_DETAIL_OPTIONS_V2,
  case05_factDetail: CASE05_FACT_DETAIL_OPTIONS_V2,
  case05_explanationDetail: CASE05_EXPLANATION_DETAIL_OPTIONS_V2,
  case05_submittedDocsDetail: CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS_V2,
  case05_appealDetail: CASE05_APPEAL_DETAIL_OPTIONS_V2,
};
