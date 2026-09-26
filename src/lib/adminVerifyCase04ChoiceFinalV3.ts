/**
 * CASE_04 choice copy — docs/master/VFBCAI_CASE04_CHOICE_FINAL_v3_CLAUDE.md (verbatim).
 */
const ADMIN_DIRECT_EXPLAIN_CHOICE = {
  value: "other",
  label: "위에 내용이 없거나 설명이 필요합니다 → 직접 입력",
};

export const CASE04_V3_QUESTION_LABELS = {
  case04_supplementTarget: "교통국에 서류를 낸 뒤, 무엇을 다시 해 오라는 안내를 받았나요?",
  case04_confirmGoal: "지금 가장 먼저 알고 싶은 것은 무엇인가요?",
  case04_customerResponse: "안내를 받은 뒤, 지금까지 어디까지 해 보셨나요?",
  case04_deadline: "다시 내야 하는 기한은 어떻게 안내받으셨나요?",
  case04_initialSubmission: "처음 교통국에 서류를 낼 때는 어떻게 준비하셨나요?",
  case04_submissionRelation: "이번에 요구받은 것은 처음 낸 서류와 비교하면 어떤가요?",
  case04_supplementReason: "교통국은 다시 해 와야 하는 이유를 어떻게 설명했나요?",
  case04_addDocDetail: "추가로 가져오라고 한 서류는 어떤 종류인가요? (여러 개 선택 가능)",
  case04_modifyDetail: "고쳐서 다시 내라고 한 부분은 어디인가요? (여러 개 선택 가능)",
  case04_evidenceDetail: "더 내라고 한 설명이나 증빙은 어떤 종류인가요? (여러 개 선택 가능)",
  case04_unclearFocus: "안내를 이해하는 과정에서 어디서 막혔나요?",
  case04_authorityFollowUp: "다시 내거나 문의한 뒤, 교통국에서는 어떤 반응이 있었나요?",
  case04_repeatSupplement: "또 요구받은 내용은 처음 요구와 비교하면 어떤가요?",
  case04_blockage: "지금 이 일이 앞으로 나가지 못하는 가장 큰 이유는 무엇인가요?",
  case04_evidence:
    "지금 가지고 있어서 보여 줄 수 있는 자료를 모두 골라 주세요. (여러 개 선택 가능)",
  case04_finalGoal: "이 일이 어떻게 마무리되기를 원하시나요?",
} as const;

export const CASE04_SUPPLEMENT_TARGET_OPTIONS_V3 = [
  {
    value: "additional_docs",
    label:
      "서류를 냈지만, 처음에 내지 않은 서류를 더 가져오라는 안내를 받았습니다.",
  },
  {
    value: "add_content_evidence",
    label:
      "서류는 받아 주었지만, 내용을 뒷받침할 설명이나 증빙이 부족하다는 안내를 받았습니다.",
  },
  {
    value: "modify_existing",
    label: "서류를 냈지만, 작성 방법이나 형식이 틀려서 고쳐서 다시 내라는 안내를 받았습니다.",
  },
  {
    value: "repeat_demand",
    label: "한 번 보완해서 다시 냈는데, 또 다른 자료를 더 요구받았습니다.",
  },
  {
    value: "unclear",
    label: "다시 해 오라는 말은 들었지만, 무엇을 해야 하는지 설명을 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_CONFIRM_GOAL_OPTIONS_V3 = [
  {
    value: "understand_materials",
    label: "교통국이 정확히 어떤 서류를 원하는지 몰라서, 그것부터 알고 싶습니다.",
  },
  {
    value: "understand_insufficient",
    label: "필요한 서류를 냈다고 생각하는데, 왜 부족하다고 하는지 알고 싶습니다.",
  },
  {
    value: "prepare_materials",
    label: "필요한 서류는 알지만, 어디서 어떻게 받아야 하는지 알고 싶습니다.",
  },
  {
    value: "repeat_reason",
    label: "이미 한 번 보완했는데, 왜 또 요구하는지 알고 싶습니다.",
  },
  {
    value: "unsure",
    label: "상황이 복잡해서, 무엇부터 해야 하는지 순서를 알고 싶습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_CUSTOMER_RESPONSE_OPTIONS_V3 = [
  {
    value: "not_started",
    label: "안내만 받았고, 아직 서류 준비나 문의를 시작하지 못했습니다.",
  },
  {
    value: "preparing",
    label: "요구받은 서류를 준비하기 시작했지만, 아직 다시 내지는 않았습니다.",
  },
  {
    value: "submitted",
    label: "요구받은 서류를 준비해서 교통국에 다시 냈습니다.",
  },
  {
    value: "inquired",
    label: "서류를 내기 전에, 교통국에 전화하거나 찾아가서 무엇이 필요한지 물어봤습니다.",
  },
  {
    value: "other_method",
    label: "대행사나 회사 담당자, 지인에게 맡겼고, 그쪽에서 처리하고 있습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_DEADLINE_OPTIONS_V3 = [
  {
    value: "specific_date",
    label: "안내문이나 담당자에게서 정확한 마감 날짜를 받았습니다.",
  },
  {
    value: "period_stated",
    label: "'며칠 안에'처럼 기간만 들었고, 정확한 날짜는 받지 못했습니다.",
  },
  {
    value: "uncertain",
    label: "기한이 있다는 말은 들었지만, 언제까지인지 확인하지 못했습니다.",
  },
  {
    value: "not_stated",
    label: "기한에 대해서는 아무 안내도 받지 못했습니다.",
  },
  {
    value: "unsure",
    label: "안내문이 베트남어라서 기한이 적혀 있는지조차 확인하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_INITIAL_SUBMISSION_OPTIONS_V3 = [
  {
    value: "complete",
    label: "안내받은 목록대로 서류를 모두 준비해서 냈습니다.",
  },
  {
    value: "partial",
    label: "일부 서류가 준비되지 않아서, 우선 있는 서류만 먼저 냈습니다.",
  },
  {
    value: "hard_to_confirm",
    label: "무엇을 냈는지 정확히 기억나지 않고, 낸 서류의 사본도 없습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_SUBMISSION_RELATION_OPTIONS_V3 = [
  {
    value: "add_missing",
    label: "처음에 내지 않은 서류를 새로 요구받았고, 처음 낸 서류는 그대로 인정되었습니다.",
  },
  {
    value: "modify_content",
    label: "처음 낸 서류 중 일부를 고쳐서 다시 내라고 했고, 새 서류는 요구하지 않았습니다.",
  },
  {
    value: "support_existing",
    label: "처음 낸 서류는 맞다고 했지만, 그 내용을 뒷받침할 설명이나 증빙을 더 요구했습니다.",
  },
  {
    value: "mismatch_request",
    label: "이미 처음에 낸 서류인데, 같은 서류를 다시 내라는 요구를 받았습니다.",
  },
  {
    value: "hard_to_judge",
    label: "처음에 무엇을 냈는지 확인할 수 없어서, 새로 요구한 것인지 판단하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_SUPPLEMENT_REASON_OPTIONS_V3 = [
  {
    value: "missing_info",
    label: "서류나 정보 중 빠진 부분이 있다고, 어느 부분인지 짚어서 설명해 주었습니다.",
  },
  {
    value: "incorrect_content",
    label: "적은 내용이 틀렸거나 서류끼리 맞지 않는다고, 고칠 부분을 알려 주었습니다.",
  },
  {
    value: "insufficient_proof",
    label: "적은 내용은 맞지만, 그것을 증명할 자료가 부족하다고 했습니다.",
  },
  {
    value: "no_reason",
    label: "이유는 설명하지 않고, 다시 해 오라는 말만 했습니다.",
  },
  {
    value: "unsure",
    label: "이유를 설명해 주었지만, 베트남어나 행정 용어라서 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_ADD_DOC_DETAIL_OPTIONS_V3 = [
  { value: "id_doc", label: "여권·비자·임시거주 등록 같은 신분 서류" },
  { value: "financial_doc", label: "계약서·영수증·세금 납부 증명 같은 금액 서류" },
  { value: "certificate", label: "기관이나 회사에서 발급받는 증명서·확인서" },
  { value: "translation", label: "베트남어 번역본이나 공증받은 서류" },
  { value: "unsure", label: "서류 이름은 들었지만, 무엇을 말하는지 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_MODIFY_DETAIL_OPTIONS_V3 = [
  { value: "name_info", label: "이름·생년월일·여권번호 같은 인적 정보" },
  { value: "date_info", label: "날짜·기간" },
  { value: "amount_info", label: "금액·숫자" },
  { value: "content_info", label: "신청 내용이나 적어 낸 문장" },
  { value: "unsure", label: "고치라는 말은 들었지만, 어느 부분인지 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_EVIDENCE_DETAIL_OPTIONS_V3 = [
  { value: "proof_doc", label: "사실을 증명하는 서류(계약서·확인서 등)" },
  { value: "photo", label: "사진·이미지" },
  { value: "statement", label: "상황을 설명하는 글(설명서·경위서)" },
  { value: "unsure", label: "증빙을 더 내라는 말만 들었고, 어떤 것인지 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_UNCLEAR_FOCUS_OPTIONS_V3 = [
  {
    value: "what_submit_list",
    label: "안내를 받았지만, 무엇을 내야 하는지 목록 자체를 알 수 없었습니다.",
  },
  {
    value: "what_submit_apply",
    label: "안내 내용은 대략 알지만, 제 상황에도 해당하는지 모르겠습니다.",
  },
  {
    value: "why_submit_reason",
    label: "무엇을 내야 하는지는 알지만, 왜 다시 내야 하는지 이해하지 못했습니다.",
  },
  {
    value: "format_how",
    label: "무엇을 낼지는 알지만, 어떤 양식이나 형식으로 만들어야 하는지 모르겠습니다.",
  },
  {
    value: "format_where",
    label: "서류는 준비할 수 있지만, 온라인으로 내는지 직접 찾아가는지 모르겠습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_AUTHORITY_FOLLOWUP_OPTIONS_V3 = [
  {
    value: "accepted",
    label: "교통국이 서류를 받아 주었고, 이제 결과를 기다리면 된다고 했습니다.",
  },
  {
    value: "more_supplement",
    label: "교통국이 또 다른 서류를 더 내거나 고쳐 오라고 했습니다.",
  },
  {
    value: "receipt_unconfirmed",
    label: "서류를 냈지만, 교통국이 받았는지 확인을 받지 못했습니다.",
  },
  {
    value: "no_response",
    label: "제출하거나 문의했지만, 교통국에서 아직 아무 답이 없습니다.",
  },
  {
    value: "unsure",
    label: "교통국에서 답을 들었지만, 무슨 뜻인지 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_REPEAT_SUPPLEMENT_OPTIONS_V3 = [
  {
    value: "more_docs_new_kind",
    label: "다시 서류를 요구받았는데, 처음 요구와는 다른 종류의 서류입니다.",
  },
  {
    value: "more_docs_same_kind",
    label: "다시 서류를 요구받았는데, 이미 낸 것과 같거나 비슷한 서류입니다.",
  },
  {
    value: "more_modify_reject_prior",
    label: "다시 고치라고 했는데, 이미 고쳐서 낸 부분을 또 고치라고 했습니다.",
  },
  {
    value: "more_modify_new_field",
    label: "다시 고치라고 했는데, 처음에는 말하지 않았던 다른 부분입니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_BLOCKAGE_OPTIONS_V3 = [
  {
    value: "what_submit",
    label: "무엇을 더 내거나 고쳐야 하는지 몰라서, 준비를 시작하지 못하고 있습니다.",
  },
  {
    value: "why_submit",
    label: "왜 다시 내야 하는지 납득이 되지 않아서, 그대로 준비해야 할지 망설이고 있습니다.",
  },
  {
    value: "format",
    label: "필요한 서류는 알지만, 발급받거나 형식에 맞게 만드는 방법을 몰라 멈춰 있습니다.",
  },
  {
    value: "deadline",
    label: "언제까지 내야 하는지 몰라서, 얼마나 서둘러야 할지 판단하지 못하고 있습니다.",
  },
  {
    value: "after_submit",
    label: "서류는 다시 냈지만, 그다음 무엇을 해야 하는지 몰라 기다리고만 있습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_EVIDENCE_OPTIONS_V3 = [
  { value: "supplement_notice", label: "교통국에서 받은 보완 안내문이나 통지서" },
  { value: "message", label: "교통국 담당자와 주고받은 문자·메신저·통화 기록" },
  { value: "original_submission", label: "처음 냈던 서류(사본이나 사진 포함)" },
  { value: "supplement_submission", label: "보완해서 다시 낸 서류(사본이나 사진 포함)" },
  {
    value: "none",
    label: "가지고 있는 자료가 없거나, 있는지 아직 확인하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_FINAL_GOAL_OPTIONS_V3 = [
  {
    value: "what_supplement",
    label: "필요한 서류를 정확히 알고, 제가 직접 준비해서 다시 내고 싶습니다.",
  },
  {
    value: "why_supplement",
    label: "요구가 맞는 것인지 확인하고, 맞지 않다면 교통국에 설명하고 싶습니다.",
  },
  {
    value: "how_supplement",
    label: "어떻게 준비하고 어디에 내야 하는지 안내받아, 기한 안에 제출을 끝내고 싶습니다.",
  },
  {
    value: "next_step",
    label: "이미 다시 냈으니, 다음 절차와 결과가 언제 나오는지 확인하고 싶습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_UNCLEAR_FOCUS_LEGACY_TO_CANONICAL: Record<string, string> = {
  why_submit_apply: "what_submit_apply",
};

export const CASE04_AUTHORITY_FOLLOWUP_LEGACY_TO_CANONICAL: Record<string, string> = {
  awaiting_review: "accepted",
  more_docs: "more_supplement",
};

export const CASE04_EVIDENCE_LEGACY_TO_CANONICAL: Record<string, string> = {
  unsure: "none",
};

export const CASE04_LEGACY_UNCLEAR_FOCUS_LABELS: Record<string, string> = {
  why_submit_apply:
    "사유는 읽었지만, 제 경우에도 해당하는지 모르겠습니다.",
};

export const CASE04_LEGACY_AUTHORITY_FOLLOWUP_LABELS: Record<string, string> = {
  awaiting_review: "추가 요구 없이 검토를 기다리는 중입니다.",
  more_docs: "추가 서류나 증빙을 다시 요구받았습니다.",
};

export const CASE04_LEGACY_EVIDENCE_LABELS: Record<string, string> = {
  unsure: "지금 확인할 수 있는 자료가 있는지 아직 확인하지 못했습니다.",
};

export function case04EffectiveAuthorityFollowUp(value: string | undefined): string | undefined {
  if (!value) return value;
  return CASE04_AUTHORITY_FOLLOWUP_LEGACY_TO_CANONICAL[value] ?? value;
}

export const CASE04_V3_FIELD_OPTION_MAP: Record<string, { value: string; label: string }[]> = {
  case04_supplementTarget: CASE04_SUPPLEMENT_TARGET_OPTIONS_V3,
  case04_confirmGoal: CASE04_CONFIRM_GOAL_OPTIONS_V3,
  case04_customerResponse: CASE04_CUSTOMER_RESPONSE_OPTIONS_V3,
  case04_deadline: CASE04_DEADLINE_OPTIONS_V3,
  case04_initialSubmission: CASE04_INITIAL_SUBMISSION_OPTIONS_V3,
  case04_submissionRelation: CASE04_SUBMISSION_RELATION_OPTIONS_V3,
  case04_supplementReason: CASE04_SUPPLEMENT_REASON_OPTIONS_V3,
  case04_addDocDetail: CASE04_ADD_DOC_DETAIL_OPTIONS_V3,
  case04_modifyDetail: CASE04_MODIFY_DETAIL_OPTIONS_V3,
  case04_evidenceDetail: CASE04_EVIDENCE_DETAIL_OPTIONS_V3,
  case04_unclearFocus: CASE04_UNCLEAR_FOCUS_OPTIONS_V3,
  case04_authorityFollowUp: CASE04_AUTHORITY_FOLLOWUP_OPTIONS_V3,
  case04_repeatSupplement: CASE04_REPEAT_SUPPLEMENT_OPTIONS_V3,
  case04_blockage: CASE04_BLOCKAGE_OPTIONS_V3,
  case04_evidence: CASE04_EVIDENCE_OPTIONS_V3,
  case04_finalGoal: CASE04_FINAL_GOAL_OPTIONS_V3,
};
