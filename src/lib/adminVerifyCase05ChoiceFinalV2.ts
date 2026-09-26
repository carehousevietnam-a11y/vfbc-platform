/**
 * CASE_05 choice copy — docs/master/VFBCAI_CASE05_CHOICE_FINAL_v2_CLAUDE.md (verbatim).
 */
const ADMIN_DIRECT_EXPLAIN_CHOICE = {
  value: "other",
  label: "위에 내용이 없거나 설명이 필요합니다 → 직접 입력",
};

export const CASE05_V2_QUESTION_LABELS = {
  case05_dispositionType: "기관에서 받은 통지나 안내는 어떤 내용이었나요?",
  case05_confirmGoal: "이 일에서 지금 가장 먼저 알고 싶은 것은 무엇인가요?",
  case05_customerResponse: "통지를 받은 뒤, 지금까지 기관에 무엇을 해 보셨나요?",
  case05_deadline: "이 일과 관련해 언제까지 무엇을 해야 하는지 알고 계신가요?",
  case05_deadlineDate: "확인한 날짜를 적어 주세요.",
  case05_deadlineDatePlaceholder: "통지에 적힌 그대로 적어 주세요. 예) 2026년 10월 15일까지",
  case05_factRelationship: "통지에 적힌 내용과 실제로 있었던 일을 비교하면 어떤가요?",
  case05_factDetail: "실제와 다른 부분은 어떤 것인가요?",
  case05_dispositionReason: "통지에는 왜 이런 조치를 한다고 적혀 있었나요?",
  case05_dispositionDetail: "이 조치 때문에 실제로 무엇이 달라지는지 알고 계신가요?",
  case05_explanationDetail: "어떤 방법으로 설명하셨고, 기관에서 받았다는 확인을 받으셨나요?",
  case05_submittedDocsDetail: "기관에 낸 서류는 어떤 것인가요? 해당하는 것을 모두 골라 주세요.",
  case05_appealDetail: "다시 봐 달라는 요청은 지금 어디까지 진행되었나요?",
  case05_authorityFollowUp: "기관에 연락하거나 서류를 낸 뒤, 기관에서는 어떻게 답했나요?",
  case05_blockage: "지금 이 일을 진행하지 못하고 있다면, 가장 큰 이유는 무엇인가요?",
  case05_evidence: "지금 가지고 있는 자료를 모두 골라 주세요.",
  case05_finalGoal:
    "지금까지 답해 주신 내용에서, 이번 검토로 가장 먼저 해결하고 싶은 것은 무엇인가요?",
} as const;

export const CASE05_DISPOSITION_TYPE_OPTIONS_V2 = [
  {
    value: "application_denied",
    label: "신청하거나 요청한 것이 받아들여지지 않았다는 통지를 받았습니다.",
  },
  {
    value: "rights_ended",
    label:
      "가지고 있던 허가·자격·등록(면허 포함)이 중단되거나 취소된다는 통지를 받았습니다.",
  },
  {
    value: "business_suspended",
    label: "정해진 기간 동안 영업이나 특정 활동을 하지 말라는 통지를 받았습니다.",
  },
  {
    value: "situation_mismatch",
    label: "통지를 받았는데, 적힌 내용이 제가 실제로 겪은 일과 다릅니다.",
  },
  {
    value: "disposition_unclear",
    label: "통지를 받았지만, 어떤 조치인지·무엇을 하라는 것인지 알아보기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_CONFIRM_GOAL_OPTIONS_V2 = [
  { value: "understand_reason", label: "왜 이런 통지를 받았는지부터 알고 싶습니다." },
  {
    value: "understand_impact",
    label:
      "앞으로 무엇을 할 수 없게 되는지, 제 일이나 생활에 어떤 영향이 있는지 알고 싶습니다.",
  },
  {
    value: "appeal_possibility",
    label: "이 결정을 다시 봐 달라고 요청할 수 있는지, 언제까지 해야 하는지 알고 싶습니다.",
  },
  {
    value: "what_to_do",
    label: "지금 당장 무엇을 해야 하는지(서류 제출·납부·방문 등) 알고 싶습니다.",
  },
  { value: "unsure", label: "무엇부터 알아봐야 할지 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_CUSTOMER_RESPONSE_OPTIONS_V2 = [
  {
    value: "none",
    label: "아직 기관에 연락하거나, 서류를 내거나, 다시 봐 달라고 요청하지 않았습니다.",
  },
  {
    value: "inquired",
    label: "기관에 전화하거나 찾아가서 물어봤지만, 서류나 요청서를 내지는 않았습니다.",
  },
  {
    value: "explanation_submitted",
    label: "제 사정이나 입장을 글로 써서 냈거나, 직접 가서 말로 설명했습니다.",
  },
  { value: "documents_submitted", label: "기관이 달라고 한 서류나 증빙을 냈습니다." },
  {
    value: "appeal_requested",
    label: "이 결정을 다시 봐 달라고 정식으로 요청했습니다(이의 신청 등).",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_DEADLINE_OPTIONS_V2 = [
  {
    value: "specific_date",
    label: "통지나 안내에 적힌 날짜를 확인했습니다. (다음 화면에서 날짜를 적어 주세요)",
  },
  {
    value: "period_stated",
    label:
      '"통지받은 날부터 며칠 이내"처럼 기간만 적혀 있어서, 정확한 날짜는 계산하지 못했습니다.',
  },
  { value: "uncertain", label: "기한이 있다는 말은 들었지만, 날짜는 모릅니다." },
  { value: "not_stated", label: "통지를 읽어 봤지만, 기한에 대한 내용을 찾지 못했습니다." },
  { value: "unsure", label: "통지를 아직 자세히 읽지 못해서, 기한이 있는지 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_FACT_RELATIONSHIP_OPTIONS_V2 = [
  { value: "match", label: "통지에 적힌 내용이 실제로 있었던 일과 거의 같습니다." },
  {
    value: "partial",
    label: "대부분은 맞지만, 날짜·장소·금액 같은 일부 내용이 실제와 다릅니다.",
  },
  { value: "mismatch", label: "통지에 적힌 일 자체가 실제로 있었던 일과 크게 다릅니다." },
  {
    value: "hard_to_judge",
    label: "기록이 없거나 오래돼서, 실제로 어땠는지 비교하기 어렵습니다.",
  },
  { value: "unknown", label: "통지에 무슨 내용이 적혀 있는지부터 이해하기 어렵습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_FACT_DETAIL_OPTIONS_V2 = [
  {
    value: "date_place_certain",
    label: "날짜·장소·상황이 실제와 다르다는 것을 분명히 기억합니다.",
  },
  {
    value: "date_place_fuzzy",
    label: "날짜·장소가 다른 것 같지만, 정확히 기억나지 않습니다.",
  },
  {
    value: "content_differs_clear",
    label: "제가 한 일이나 이유가 다르게 적혀 있고, 무엇이 다른지 설명할 수 있습니다.",
  },
  {
    value: "content_differs_vague",
    label: "내용이 다른 것 같지만, 무엇이 다른지 아직 정리하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_DISPOSITION_REASON_OPTIONS_V2 = [
  { value: "violation_claimed", label: "제가 어떤 규정을 어겼다고 적혀 있습니다." },
  {
    value: "document_issue",
    label: "제가 낸 서류나 신청 내용이 틀렸거나 빠졌다고 적혀 있습니다.",
  },
  { value: "requirement_not_met", label: "조건이나 자격이 맞지 않는다고 적혀 있습니다." },
  {
    value: "deadline_procedure",
    label: "정해진 기한이나 절차를 지키지 않았다고 적혀 있습니다.",
  },
  {
    value: "no_clear_reason",
    label: '이유가 없거나, "규정에 따라"처럼 짧게만 적혀 있습니다.',
  },
  { value: "unsure", label: "이유가 적혀 있는 것 같지만, 무슨 뜻인지 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_DISPOSITION_DETAIL_OPTIONS_V2 = [
  {
    value: "wording_unclear",
    label: "무엇을 하면 안 되는지, 통지 문구가 애매해서 알기 어렵습니다.",
  },
  {
    value: "scope_unclear",
    label: "하면 안 되는 일은 알겠지만, 언제까지·어디까지인지 모르겠습니다.",
  },
  {
    value: "partially_understood",
    label: "일부는 알겠지만, 제 일이나 생활에 어떤 영향이 더 있을지 확실하지 않습니다.",
  },
  { value: "unsure", label: "이 조치로 무엇이 달라지는지 아직 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_EXPLANATION_DETAIL_OPTIONS_V2 = [
  {
    value: "written_no_receipt",
    label: "글로 써서 냈지만, 잘 받았다는 확인이나 번호는 아직 받지 못했습니다.",
  },
  {
    value: "written_receipt_ok",
    label: "글로 써서 냈고, 잘 받았다는 확인(접수번호 등)을 받았습니다.",
  },
  {
    value: "verbal_no_record",
    label: "전화나 방문으로 말로만 설명했고, 남겨 둔 기록은 없습니다.",
  },
  {
    value: "verbal_with_record",
    label: "전화나 방문으로 설명했고, 무엇을 말했는지 메모해 두었습니다.",
  },
  {
    value: "both_unverified",
    label: "글로도 내고 말로도 설명했는데, 두 내용이 같은지는 확인하지 못했습니다.",
  },
  {
    value: "both_aligned",
    label: "글로도 내고 말로도 설명했고, 같은 내용으로 설명했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_SUBMITTED_DOCS_DETAIL_OPTIONS_V2 = [
  { value: "identity", label: "여권·신분증 등 신분 서류" },
  { value: "financial", label: "통장·영수증 등 돈과 관련된 서류" },
  { value: "certificate", label: "기관이나 회사가 발급한 증명서·확인서" },
  { value: "unsure", label: "무슨 서류였는지 정확히 모르겠습니다" },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_APPEAL_DETAIL_OPTIONS_V2 = [
  {
    value: "filed_no_receipt",
    label: "요청서를 냈지만, 잘 받았다는 확인은 아직 받지 못했습니다.",
  },
  {
    value: "filed_no_schedule",
    label: "요청서를 냈고 받았다는 확인도 받았지만, 결과가 언제 나오는지는 모릅니다.",
  },
  {
    value: "filed_schedule_known",
    label: "요청서를 냈고, 결과나 다음 연락이 언제 오는지 안내받았습니다.",
  },
  {
    value: "preparing_deadline_unknown",
    label: "요청하려고 준비 중인데, 언제까지 내야 하는지 모릅니다.",
  },
  {
    value: "preparing_deadline_known",
    label: "요청하려고 준비 중이고, 언제까지 내야 하는지 알고 있습니다.",
  },
  { value: "considering", label: "요청할지 아직 고민하고 있습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_AUTHORITY_FOLLOWUP_OPTIONS_V2 = [
  { value: "maintained", label: "처음 결정은 그대로라는 답을 받았습니다." },
  { value: "changed", label: "결정이 바뀌었거나 취소되었다는 답을 받았습니다." },
  {
    value: "wants_more",
    label: "서류를 더 내라고 하거나, 직접 와서 설명하라고 했습니다.",
  },
  { value: "under_review", label: "다시 검토하고 있으니 기다리라고 했습니다." },
  { value: "no_response", label: "아직 아무 답도 받지 못했습니다." },
  { value: "unsure", label: "답은 받았는데, 무슨 뜻인지 잘 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_BLOCKAGE_OPTIONS_V2 = [
  {
    value: "why_disposition",
    label: "왜 이런 조치를 받았는지 이해가 안 돼서, 무엇을 해야 할지 판단하지 못하고 있습니다.",
  },
  {
    value: "what_disposition",
    label: "이 조치가 정확히 무엇인지 몰라서, 어디서부터 시작해야 할지 모르겠습니다.",
  },
  {
    value: "fact_match",
    label: "통지 내용이 실제와 맞는지 확인할 방법이 없어서 막혀 있습니다.",
  },
  {
    value: "what_to_do",
    label:
      "무엇을 해야 하는지, 다시 봐 달라고 하려면 어떻게 해야 하는지 몰라서 진행하지 못하고 있습니다.",
  },
  {
    value: "evidence",
    label: "어떤 서류나 증빙을 준비해야 하는지 몰라서 막혀 있습니다.",
  },
  {
    value: "next_response",
    label: "기관의 답을 기다리고 있거나, 받은 답을 이해하지 못해서 멈춰 있습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_EVIDENCE_OPTIONS_V2 = [
  { value: "disposition_notice", label: "기관에서 받은 통지서나 안내문" },
  { value: "message_email", label: "기관과 주고받은 문자·이메일·메신저" },
  { value: "submitted_docs", label: "제가 기관에 낸 서류의 사본" },
  { value: "payment_proof", label: "돈을 낸 영수증이나 이체 기록" },
  { value: "photo_video", label: "당시 상황을 보여주는 사진·영상" },
  {
    value: "none",
    label: "가지고 있는 자료가 없습니다 (다른 항목과 함께 고를 수 없음)",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE05_FINAL_GOAL_OPTIONS_V2 = [
  { value: "why_disposition", label: "왜 이런 조치를 받았는지 정확히 알고 싶습니다." },
  { value: "what_disposition", label: "이 조치로 무엇이 달라지는지 정확히 알고 싶습니다." },
  { value: "fact_match", label: "통지 내용이 실제와 맞는지 확인하고 싶습니다." },
  { value: "what_to_do", label: "지금 해야 할 일을 순서대로 알고 싶습니다." },
  {
    value: "next_action",
    label: "다시 봐 달라고 요청하거나 설명하는 다음 단계를 알고 싶습니다.",
  },
  { value: "evidence", label: "준비해야 할 서류나 증빙을 알고 싶습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

/** v2 screen — removed fields; restore/display only */
export const CASE05_LEGACY_AUTHORITY_FOLLOWUP_LABELS: Record<string, string> = {
  modified: "처분 내용이 변경되었다고 안내받았습니다",
  revoked: "처분이 철회·취소되었다고 안내받았습니다",
  more_docs: "추가 서류·증빙을 요구받았습니다",
  attendance_explanation: "추가 설명이나 출석을 요구받았습니다",
  payment_demand: "납부를 요구받았습니다",
};

export const CASE05_LEGACY_BLOCKAGE_LABELS: Record<string, string> = {
  appeal_method: "이의제기·재검토·소명 방법을 모르겠습니다.",
  deadline: "대응 기한이 언제인지 모르겠습니다.",
  unsure: "가장 막힌 부분을 정확히 말하기 어렵습니다.",
};

export const CASE05_LEGACY_EVIDENCE_LABELS: Record<string, string> = {
  contract: "계약·관계 서류",
  unsure: "지금 확인할 수 있는 자료가 있는지 아직 확인하지 못했습니다.",
};

export const CASE05_LEGACY_FINAL_GOAL_LABELS: Record<string, string> = {
  expert: "전문가에게 상황을 전달하고 싶어요",
  unsure: "지금 가장 먼저 확인하고 싶은 것이 무엇인지 정확히 말하기 어렵습니다.",
};

export const CASE05_LEGACY_APPEAL_DETAIL_LABELS: Record<string, string> = {
  considering_rules_unread: "신청 여부를 검토 중이고, 가능 여부·기한은 아직 못 읽었습니다.",
  considering_rules_read: "신청 여부를 검토 중이고, 통지서에 기한·요건을 읽었습니다.",
};

export const CASE05_AUTHORITY_FOLLOWUP_LEGACY_TO_CANONICAL: Record<string, string> = {
  modified: "changed",
  revoked: "changed",
  more_docs: "wants_more",
  attendance_explanation: "wants_more",
};

export const CASE05_APPEAL_DETAIL_LEGACY_TO_CANONICAL: Record<string, string> = {
  considering_rules_unread: "considering",
  considering_rules_read: "considering",
};

export const CASE05_BLOCKAGE_LEGACY_TO_CANONICAL: Record<string, string> = {
  appeal_method: "what_to_do",
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
