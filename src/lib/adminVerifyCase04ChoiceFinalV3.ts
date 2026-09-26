/**
 * CASE_04 choice copy — docs/master/VFBCAI_CASE04_CHOICE_FINAL_v3_CLAUDE.md (v3.1 verbatim).
 */
const ADMIN_DIRECT_EXPLAIN_CHOICE = {
  value: "other",
  label: "위에 내용이 없거나 설명이 필요합니다 → 직접 입력",
};

export const CASE04_V3_QUESTION_LABELS = {
  case04_supplementTarget:
    "교통국에 서류를 제출한 뒤, 무엇을 다시 제출하라는 안내를 받았나요?",
  case04_confirmGoal: "지금 가장 먼저 확인하고 싶은 것은 무엇인가요?",
  case04_customerResponse: "안내를 받은 뒤, 현재 어디까지 진행하셨나요?",
  case04_deadline: "다시 제출해야 하는 기한은 어떻게 안내받으셨나요?",
  case04_deadlineDate: "안내받은 제출 마감일은 언제인가요?",
  case04_initialSubmission: "처음 교통국에 서류를 제출할 때는 어떻게 준비하셨나요?",
  case04_submissionRelation:
    "이번에 요청받은 내용은 처음 제출한 서류와 비교하면 어떤가요?",
  case04_supplementReason: "교통국은 다시 제출해야 하는 이유를 어떻게 설명했나요?",
  case04_addDocDetail:
    "추가로 제출하라고 요청받은 서류는 어떤 종류인가요? (여러 개 선택 가능)",
  case04_modifyDetail:
    "수정해서 다시 제출하라고 요청받은 부분은 어디인가요? (여러 개 선택 가능)",
  case04_evidenceDetail:
    "추가로 요청받은 설명이나 증빙은 어떤 종류인가요? (여러 개 선택 가능)",
  case04_unclearFocus: "안내 내용을 이해하는 과정에서 어느 부분이 가장 어려웠나요?",
  case04_authorityFollowUp:
    "다시 제출하거나 문의한 뒤, 교통국에서는 어떤 답변이 있었나요?",
  case04_repeatSupplement: "추가로 요청받은 내용은 처음 요청과 비교하면 어떤가요?",
  case04_blockage: "현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?",
  case04_evidence:
    "현재 보관하고 있어 확인할 수 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)",
  case04_finalGoal: "이 일이 어떻게 마무리되기를 원하시나요?",
} as const;

export const CASE04_SUPPLEMENT_TARGET_OPTIONS_V3 = [
  {
    value: "additional_docs",
    label:
      "서류를 제출했지만, 처음에 제출하지 않은 서류를 추가로 제출하라는 안내를 받았습니다.",
  },
  {
    value: "add_content_evidence",
    label:
      "서류는 접수되었지만, 내용을 뒷받침할 설명이나 증빙이 부족하다는 안내를 받았습니다.",
  },
  {
    value: "modify_existing",
    label:
      "서류를 제출했지만, 작성 방법이나 형식이 맞지 않아 수정해서 다시 제출하라는 안내를 받았습니다.",
  },
  {
    value: "repeat_demand",
    label: "요청받은 서류를 한 차례 다시 제출했지만, 추가 자료를 또 요청받았습니다.",
  },
  {
    value: "unclear",
    label:
      "다시 제출하라는 안내는 받았지만, 무엇을 준비해야 하는지 정확히 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_CONFIRM_GOAL_OPTIONS_V3 = [
  {
    value: "understand_materials",
    label:
      "교통국이 요구하는 서류가 정확히 무엇인지 알 수 없어, 그것부터 확인하고 싶습니다.",
  },
  {
    value: "understand_insufficient",
    label:
      "필요한 서류를 모두 제출했다고 생각하는데, 왜 부족하다고 하는지 확인하고 싶습니다.",
  },
  {
    value: "prepare_materials",
    label:
      "필요한 서류는 알고 있지만, 어디에서 어떻게 발급받아야 하는지 확인하고 싶습니다.",
  },
  {
    value: "repeat_reason",
    label: "이미 한 차례 다시 제출했는데, 왜 추가로 요청하는지 확인하고 싶습니다.",
  },
  {
    value: "unsure",
    label: "상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_CUSTOMER_RESPONSE_OPTIONS_V3 = [
  {
    value: "not_started",
    label: "안내만 받았고, 아직 서류 준비나 문의는 시작하지 않았습니다.",
  },
  {
    value: "preparing",
    label: "요청받은 서류를 준비하고 있지만, 아직 제출하지는 않았습니다.",
  },
  {
    value: "submitted",
    label: "요청받은 서류를 준비해 교통국에 다시 제출했습니다.",
  },
  {
    value: "inquired",
    label: "제출하기 전에, 교통국에 전화하거나 방문해 필요한 서류를 문의했습니다.",
  },
  {
    value: "other_method",
    label: "대행사, 회사 담당자 또는 지인에게 맡겨 그쪽에서 진행하고 있습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_DEADLINE_OPTIONS_V3 = [
  {
    value: "specific_date",
    label: "안내문이나 담당자를 통해 정확한 마감일을 안내받았습니다.",
  },
  {
    value: "period_stated",
    label: "'며칠 이내'처럼 기간만 안내받았고, 정확한 날짜는 받지 못했습니다.",
  },
  {
    value: "uncertain",
    label: "기한이 있다는 안내는 받았지만, 정확히 언제까지인지 확인하지 못했습니다.",
  },
  {
    value: "not_stated",
    label: "기한에 대해서는 별도의 안내를 받지 못했습니다.",
  },
  {
    value: "unsure",
    label: "안내문이 베트남어로 되어 있어, 기한이 적혀 있는지조차 확인하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_INITIAL_SUBMISSION_OPTIONS_V3 = [
  {
    value: "complete",
    label: "안내받은 목록에 따라 필요한 서류를 모두 준비해 제출했습니다.",
  },
  {
    value: "partial",
    label: "일부 서류가 준비되지 않아, 준비된 서류만 먼저 제출했습니다.",
  },
  {
    value: "hard_to_confirm",
    label: "무엇을 제출했는지 정확히 기억나지 않고, 제출한 서류의 사본도 없습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_SUBMISSION_RELATION_OPTIONS_V3 = [
  {
    value: "add_missing",
    label:
      "처음 제출한 서류는 그대로 인정되었고, 제출하지 않았던 서류를 새로 요청받았습니다.",
  },
  {
    value: "modify_content",
    label:
      "새로운 서류 요청은 없었고, 처음 제출한 서류 중 일부를 수정해 다시 제출하라고 했습니다.",
  },
  {
    value: "support_existing",
    label:
      "처음 제출한 서류는 맞다고 했지만, 그 내용을 뒷받침할 설명이나 증빙을 추가로 요청했습니다.",
  },
  {
    value: "mismatch_request",
    label: "이미 처음에 제출한 서류인데, 같은 서류를 다시 제출하라는 요청을 받았습니다.",
  },
  {
    value: "hard_to_judge",
    label:
      "처음에 무엇을 제출했는지 확인할 수 없어, 새로 요청한 서류인지 판단하기 어렵습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_SUPPLEMENT_REASON_OPTIONS_V3 = [
  {
    value: "missing_info",
    label: "서류나 정보 중 빠진 부분이 있다며, 해당 부분을 구체적으로 알려 주었습니다.",
  },
  {
    value: "incorrect_content",
    label:
      "기재한 내용이 틀렸거나 서류 간에 일치하지 않는다며, 수정할 부분을 알려 주었습니다.",
  },
  {
    value: "insufficient_proof",
    label: "기재한 내용은 맞지만, 이를 증명할 자료가 부족하다고 했습니다.",
  },
  {
    value: "no_reason",
    label: "이유에 대한 설명 없이, 다시 제출하라는 안내만 받았습니다.",
  },
  {
    value: "unsure",
    label: "이유를 설명해 주었지만, 베트남어나 행정 용어 때문에 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_ADD_DOC_DETAIL_OPTIONS_V3 = [
  { value: "id_doc", label: "여권·비자·임시거주 등록 같은 신분 서류" },
  { value: "financial_doc", label: "계약서·영수증·세금 납부 증명 같은 금액 서류" },
  { value: "certificate", label: "기관이나 회사에서 발급받는 증명서·확인서" },
  { value: "translation", label: "베트남어 번역본이나 공증받은 서류" },
  {
    value: "unsure",
    label: "서류 이름은 안내받았지만, 어떤 서류인지 알지 못합니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_MODIFY_DETAIL_OPTIONS_V3 = [
  { value: "name_info", label: "이름·생년월일·여권번호 같은 인적 정보" },
  { value: "date_info", label: "날짜·기간" },
  { value: "amount_info", label: "금액·숫자" },
  { value: "content_info", label: "신청 내용이나 기재한 문장" },
  {
    value: "unsure",
    label: "수정하라는 안내는 받았지만, 어느 부분인지 알지 못합니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_EVIDENCE_DETAIL_OPTIONS_V3 = [
  { value: "proof_doc", label: "사실을 증명하는 서류(계약서·확인서 등)" },
  { value: "photo", label: "사진·이미지" },
  { value: "statement", label: "상황을 설명하는 글(설명서·경위서)" },
  {
    value: "unsure",
    label: "증빙을 추가하라는 안내만 받았고, 어떤 자료인지 알지 못합니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_UNCLEAR_FOCUS_OPTIONS_V3 = [
  {
    value: "what_submit_list",
    label: "안내는 받았지만, 제출해야 할 서류 목록 자체를 파악하지 못했습니다.",
  },
  {
    value: "what_submit_apply",
    label: "안내 내용은 대략 이해했지만, 제 상황에도 해당하는지 확신하지 못합니다.",
  },
  {
    value: "why_submit_reason",
    label: "제출할 서류는 알고 있지만, 왜 다시 제출해야 하는지 이해하지 못했습니다.",
  },
  {
    value: "format_how",
    label: "제출할 서류는 알고 있지만, 어떤 양식이나 형식으로 작성해야 하는지 모릅니다.",
  },
  {
    value: "format_where",
    label:
      "서류는 준비할 수 있지만, 온라인으로 제출해야 하는지 직접 방문해야 하는지 모릅니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_AUTHORITY_FOLLOWUP_OPTIONS_V3 = [
  {
    value: "accepted",
    label: "서류가 접수되었고, 이제 결과를 기다리면 된다는 안내를 받았습니다.",
  },
  {
    value: "more_supplement",
    label: "다른 서류를 추가로 제출하거나, 수정해서 다시 제출하라는 안내를 받았습니다.",
  },
  {
    value: "receipt_unconfirmed",
    label: "서류를 제출했지만, 접수되었는지 확인을 받지 못했습니다.",
  },
  {
    value: "no_response",
    label: "제출하거나 문의했지만, 아직 교통국으로부터 답변을 받지 못했습니다.",
  },
  {
    value: "unsure",
    label: "교통국의 답변을 받았지만, 무슨 의미인지 이해하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_REPEAT_SUPPLEMENT_OPTIONS_V3 = [
  {
    value: "more_docs_new_kind",
    label: "서류를 다시 요청받았고, 처음 요청과는 다른 종류의 서류입니다.",
  },
  {
    value: "more_docs_same_kind",
    label: "서류를 다시 요청받았고, 이미 제출한 것과 같거나 비슷한 서류입니다.",
  },
  {
    value: "more_modify_reject_prior",
    label: "수정을 다시 요청받았고, 이미 수정해 제출한 부분을 또 수정하라고 했습니다.",
  },
  {
    value: "more_modify_new_field",
    label: "수정을 다시 요청받았고, 처음에는 언급하지 않았던 다른 부분입니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_BLOCKAGE_OPTIONS_V3 = [
  {
    value: "what_submit",
    label:
      "무엇을 추가하거나 수정해야 하는지 알 수 없어, 준비를 시작하지 못하고 있습니다.",
  },
  {
    value: "why_submit",
    label: "다시 제출해야 하는 이유에 납득이 되지 않아, 그대로 준비해야 할지 망설이고 있습니다.",
  },
  {
    value: "format",
    label:
      "필요한 서류는 알고 있지만, 발급받거나 형식에 맞게 작성하는 방법을 몰라 진행이 멈춰 있습니다.",
  },
  {
    value: "deadline",
    label: "제출 기한을 알 수 없어, 얼마나 서둘러야 할지 판단하지 못하고 있습니다.",
  },
  {
    value: "after_submit",
    label: "서류는 다시 제출했지만, 다음 절차를 알 수 없어 기다리고만 있습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_EVIDENCE_OPTIONS_V3 = [
  { value: "supplement_notice", label: "교통국에서 받은 안내문이나 통지서" },
  { value: "message", label: "교통국 담당자와 주고받은 문자·메신저·통화 기록" },
  { value: "original_submission", label: "처음 제출한 서류(사본이나 사진 포함)" },
  { value: "supplement_submission", label: "다시 제출한 서류(사본이나 사진 포함)" },
  {
    value: "none",
    label: "보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE04_FINAL_GOAL_OPTIONS_V3 = [
  {
    value: "what_supplement",
    label: "필요한 서류를 정확히 확인한 뒤, 직접 준비해서 다시 제출하고 싶습니다.",
  },
  {
    value: "why_supplement",
    label: "요청이 타당한지 확인하고, 타당하지 않다면 교통국에 설명하고 싶습니다.",
  },
  {
    value: "how_supplement",
    label: "준비 방법과 제출처를 안내받아, 기한 내에 제출을 마치고 싶습니다.",
  },
  {
    value: "next_step",
    label: "이미 다시 제출했으므로, 다음 절차와 결과가 나오는 시점을 확인하고 싶습니다.",
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
