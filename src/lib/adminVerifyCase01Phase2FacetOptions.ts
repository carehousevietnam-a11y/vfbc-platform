/** CASE_01 Phase2 facet choice options — Brief v3 부록 A (§7 v3 동형). */

const ADMIN_DIRECT_EXPLAIN_CHOICE = {
  value: "other",
  label: "위에 내용이 없거나 설명이 필요합니다 → 직접 입력",
};

export const CASE01_FACT_CONFLICT_FACET_OPTIONS = [
  { value: "conflict_time", label: "교통국이 말한 날짜·시간이, 제가 기억하는 그날의 일정과 다릅니다." },
  { value: "conflict_place", label: "교통국이 말한 장소가, 그 시간에 제가 있었던 곳과 다릅니다." },
  { value: "conflict_violation_action", label: "그 자리에 있었던 것은 맞지만, 위반이라고 한 행동은 하지 않았습니다." },
  { value: "conflict_vehicle_driver", label: "통지에 적힌 차량이 제 차가 아니거나, 그때 운전한 사람이 제가 아닙니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_SPATIOTEMPORAL_FACET_OPTIONS = [
  { value: "st_has_records", label: "사진·영수증·위치 기록 등 자료가 있고, 지금 바로 보여 줄 수 있습니다." },
  { value: "st_has_records_pending", label: "자료가 있을 것 같지만, 아직 찾거나 모아 두지 못했습니다." },
  { value: "st_witness_only", label: "자료는 없지만, 당시 함께 있던 사람이 확인해 줄 수 있습니다." },
  { value: "st_memory_only", label: "자료나 증인은 없고, 제 기억으로만 설명할 수 있습니다." },
  { value: "st_cannot_verify", label: "찾아봤지만, 당시를 확인할 방법이 없습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_COMPARE_RECORD_GAP_OPTIONS = [
  { value: "cmp_missing_notice", label: "통지서나 안내문 사본" },
  { value: "cmp_missing_calendar", label: "그날의 일정이나 이동 기록" },
  { value: "cmp_missing_receipt", label: "제출·접수 영수증" },
  { value: "cmp_missing_messages", label: "교통국과 주고받은 연락 기록" },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_LANGUAGE_ACCESS_FACT_OPTIONS = [
  { value: "lang_none", label: "통지 내용을 직접 읽고 이해했습니다." },
  { value: "lang_partial_understanding", label: "일부만 이해했지만, 원문을 가지고 있어 다시 확인할 수 있습니다." },
  { value: "lang_partial_no_source", label: "일부만 이해했고, 다시 확인할 원문도 가지고 있지 않습니다." },
  { value: "lang_need_interpreter", label: "베트남어라서 이해하지 못했고, 통역이 필요합니다." },
  { value: "lang_indirect_hearsay", label: "지인이나 대행사를 통해서만 전해 들었고, 교통국 통지를 직접 보지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_UNCLEAR_DEMAND_FACT_OPTIONS = [
  { value: "unclear_what_violation", label: "무엇을 위반했다는 것인지 분명하지 않습니다." },
  { value: "unclear_what_action", label: "위반 내용은 알지만, 지금 무엇을 해야 하는지 분명하지 않습니다." },
  { value: "unclear_deadline", label: "해야 할 일은 알지만, 언제까지 해야 하는지 분명하지 않습니다." },
  { value: "unclear_who_authority", label: "어느 기관이나 부서에 연락해야 하는지 분명하지 않습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_NOTICE_DELIVERY_FACT_OPTIONS = [
  { value: "del_in_person", label: "단속 현장이나 교통국 창구에서 직접 안내를 받았습니다." },
  { value: "del_phone_message", label: "전화나 문자·앱 알림으로 안내를 받았습니다." },
  { value: "del_written", label: "우편이나 직접 전달된 통지서 등 서면으로 받았습니다." },
  { value: "del_not_received_yet", label: "아직 통지를 직접 받지 못했고, 다른 경로로 알게 되었습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_PROCEDURE_STAGE_FACT_OPTIONS = [
  { value: "stage_first_notice", label: "이번이 처음 받은 안내이고, 이전에 관련 연락은 없었습니다." },
  { value: "stage_followup_notice", label: "이전에도 같은 일로 안내를 받았고, 이번은 추가로 받은 안내입니다." },
  { value: "stage_unsure_first", label: "처음인지 확실하지 않지만, 다른 안내를 받은 기억은 없습니다." },
  { value: "stage_unsure_many", label: "여러 번 안내를 받았지만, 지금이 어느 단계인지 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_OFFICE_IDENTITY_FACT_OPTIONS = [
  { value: "office_named_clear", label: "기관과 부서 이름이 통지에 적혀 있어, 어디서 보냈는지 확실히 압니다." },
  { value: "office_name_only", label: "기관 이름은 알지만, 담당 부서나 연락처는 확인하지 못했습니다." },
  { value: "office_unknown", label: "어느 기관에서 보낸 것인지 확인하지 못했습니다." },
  { value: "office_wrong_suspect", label: "교통국이 아닌 다른 기관의 안내일 수도 있다고 생각합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_CORRECT_TARGET_FACT_OPTIONS = [
  { value: "tgt_identity_record", label: "이름·여권번호 등 제 신원이나 등록 정보를 수정하라는 안내였습니다." },
  { value: "tgt_submission_content", label: "제가 제출한 서류나 신청 내용을 수정하라는 안내였습니다." },
  { value: "tgt_vehicle_record", label: "차량 등록이나 운전 관련 기록을 수정하라는 안내였습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_ATTEND_INSTRUCTION_FACT_OPTIONS = [
  { value: "att_date_place_stated", label: "방문 날짜·시간·장소가 모두 적혀 있었습니다." },
  { value: "att_date_place_partial", label: "날짜와 시간은 적혀 있지만, 장소는 확인하지 못했습니다." },
  { value: "att_window_only", label: "정확한 날짜 없이 '며칠 이내'처럼 기간만 적혀 있었습니다." },
  { value: "att_place_unknown", label: "방문하라는 안내만 있고, 날짜와 장소는 적혀 있지 않았습니다." },
  { value: "att_content_unclear", label: "일정은 알지만, 왜 방문해서 설명해야 하는지 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_SUPPLEMENT_INSTRUCTION_FACT_OPTIONS = [
  { value: "sup_missing_docs_list", label: "추가로 낼 서류 목록을 받았고, 무엇을 준비할지 알고 있습니다." },
  { value: "sup_missing_docs_unclear", label: "서류 목록은 받았지만, 제 경우에 맞는지 확실하지 않습니다." },
  { value: "sup_replace_docs", label: "이미 낸 서류를 고치거나 바꿔서 다시 제출하라는 안내였습니다." },
  { value: "sup_content_add", label: "서류에 내용을 더 적거나, 설명을 추가하라는 안내였습니다." },
  { value: "sup_scope_unclear", label: "서류를 내라는 것은 알지만, 무엇을 내야 하는지 전체를 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_PAYMENT_INSTRUCTION_FACT_OPTIONS = [
  { value: "pay_type_fine", label: "교통위반에 대한 벌금을 내라는 안내였습니다." },
  { value: "pay_type_fee", label: "벌금이 아니라, 처리 수수료나 비용을 내라는 안내였습니다." },
  { value: "pay_type_mixed", label: "벌금과 수수료 등 여러 금액이 함께 적혀 있었습니다." },
  { value: "pay_type_unclear", label: "금액은 적혀 있지만, 어떤 성격의 돈인지 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_AUTHORITY_FOLLOW_UP_KIND_OPTIONS = [
  { value: "completed", label: "추가 요구 없이, 처리나 검토가 그대로 진행된다는 안내를 받았습니다." },
  { value: "more_required", label: "추가 서류나 자료를 제출하라는 요청을 받았습니다." },
  { value: "re_attendance", label: "다시 방문하거나, 추가로 설명하라는 안내를 받았습니다." },
  { value: "payment_demand", label: "벌금이나 비용을 납부하라는 안내를 받았습니다." },
  { value: "no_reply_yet", label: "아직 답변을 받지 못했거나, 받은 답변의 의미를 이해하지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_PHASE2_FACET_FIELD_OPTION_MAP: Record<
  string,
  readonly { value: string; label: string }[]
> = {
  case01_factConflictFacet: CASE01_FACT_CONFLICT_FACET_OPTIONS,
  case01_spatiotemporalFacet: CASE01_SPATIOTEMPORAL_FACET_OPTIONS,
  case01_compareRecordGap: CASE01_COMPARE_RECORD_GAP_OPTIONS,
  case01_languageAccessFact: CASE01_LANGUAGE_ACCESS_FACT_OPTIONS,
  case01_unclearDemandFact: CASE01_UNCLEAR_DEMAND_FACT_OPTIONS,
  case01_noticeDeliveryFact: CASE01_NOTICE_DELIVERY_FACT_OPTIONS,
  case01_procedureStageFact: CASE01_PROCEDURE_STAGE_FACT_OPTIONS,
  case01_officeIdentityFact: CASE01_OFFICE_IDENTITY_FACT_OPTIONS,
  case01_correctTargetFact: CASE01_CORRECT_TARGET_FACT_OPTIONS,
  case01_attendInstructionFact: CASE01_ATTEND_INSTRUCTION_FACT_OPTIONS,
  case01_supplementInstructionFact: CASE01_SUPPLEMENT_INSTRUCTION_FACT_OPTIONS,
  case01_paymentInstructionFact: CASE01_PAYMENT_INSTRUCTION_FACT_OPTIONS,
  case01_authorityFollowUpKind: CASE01_AUTHORITY_FOLLOW_UP_KIND_OPTIONS,
};
