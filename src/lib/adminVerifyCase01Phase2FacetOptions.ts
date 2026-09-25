/** CASE_01 Phase2 facet choice options — Brief v3 부록 A (§7 v3 동형). */

const ADMIN_DIRECT_EXPLAIN_CHOICE = {
  value: "other",
  label: "위에 내용이 없거나 설명이 필요합니다 → 직접 입력",
};

export const CASE01_FACT_CONFLICT_FACET_OPTIONS = [
  {
    value: "conflict_time",
    label: "교통국이 말한 날짜·시간이 제가 기억하는 것과 다릅니다.",
  },
  {
    value: "conflict_place",
    label: "교통국이 말한 장소·위치가 제가 있었던 곳과 다릅니다.",
  },
  {
    value: "conflict_violation_action",
    label: "제가 했는지·위반했는지에 대해 교통국 말과 다르게 이해합니다.",
  },
  {
    value: "conflict_vehicle_driver",
    label: "차량·운전자가 누구인지에 대해 교통국 말과 다릅니다.",
  },
  { value: "conflict_other", label: "위에 없는 다른 차이가 있습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_SPATIOTEMPORAL_FACET_OPTIONS = [
  {
    value: "st_has_records",
    label: "기록·자료로 확인할 수 있고, 지금 바로 꺼낼 수 있습니다.",
  },
  {
    value: "st_has_records_pending",
    label: "기록·자료는 있지만, 아직 모아 두지 못했습니다.",
  },
  {
    value: "st_witness_only",
    label: "증인·동행자에게만 물을 수 있고, 이미 연락했습니다.",
  },
  {
    value: "st_witness_only_pending",
    label: "증인·동행자는 있지만, 아직 연락하지 못했습니다.",
  },
  {
    value: "st_memory_only",
    label: "기억에 의존하고, 대략적인 순서는 말할 수 있습니다.",
  },
  {
    value: "st_memory_only_fuzzy",
    label: "기억만 있고, 날짜·순서까지는 말하기 어렵습니다.",
  },
  {
    value: "st_cannot_verify",
    label: "지금은 확인할 방법을 모르겠습니다.",
  },
  {
    value: "st_cannot_verify_tried",
    label: "찾아봤지만 당시를 확인할 자료가 없었습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_COMPARE_RECORD_GAP_OPTIONS = [
  { value: "cmp_missing_notice", label: "통지·안내 사본" },
  { value: "cmp_missing_calendar", label: "일정·캘린더 기록" },
  { value: "cmp_missing_receipt", label: "접수·제출 증빙" },
  { value: "cmp_missing_messages", label: "연락·메시지 기록" },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_LANGUAGE_ACCESS_FACT_OPTIONS = [
  { value: "lang_none", label: "언어·통역 때문에 막힌 부분은 없었습니다." },
  {
    value: "lang_partial_understanding",
    label: "일부만 이해했고, 다시 읽거나 들을 수 있는 자료가 있습니다.",
  },
  {
    value: "lang_partial_no_source",
    label: "일부만 이해했고, 다시 확인할 원문은 없습니다.",
  },
  { value: "lang_need_interpreter", label: "통역·공식 안내가 필요합니다." },
  {
    value: "lang_indirect_hearsay",
    label: "제3자·대행·통역을 통해서만 들었고, 공식 통지 원문은 없습니다.",
  },
  {
    value: "lang_indirect_hearsay_copy",
    label: "제3자·대행을 통해 들었지만, 전달받은 문서·메시지는 있습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_UNCLEAR_DEMAND_FACT_OPTIONS = [
  {
    value: "unclear_what_violation",
    label: "무엇을 위반했다고 하는지는 아직 정확히 모르겠습니다.",
  },
  {
    value: "unclear_what_action",
    label: "지금 무엇을 해야 하는지는 아직 정확히 모르겠습니다.",
  },
  { value: "unclear_deadline", label: "언제까지 해야 하는지는 아직 정확히 모르겠습니다." },
  {
    value: "unclear_who_authority",
    label: "어느 기관·담당인지는 아직 정확히 모르겠습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_NOTICE_DELIVERY_FACT_OPTIONS = [
  { value: "del_in_person", label: "대면으로 안내를 받았습니다." },
  { value: "del_phone_message", label: "전화·문자로 안내를 받았습니다." },
  { value: "del_written", label: "문서·서면으로 안내를 받았습니다." },
  { value: "del_not_received_yet", label: "아직 통지·안내를 받지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_PROCEDURE_STAGE_FACT_OPTIONS = [
  { value: "stage_first_notice", label: "처음 받는 안내에 가깝습니다." },
  {
    value: "stage_followup_notice",
    label: "이전에도 안내를 받았고, 이번은 추가·재통지에 가깝습니다.",
  },
  {
    value: "stage_unsure_first",
    label: "처음인지 추가인지는 모르겠고, 다른 안내를 받은 기억이 없습니다.",
  },
  {
    value: "stage_unsure_many",
    label: "여러 번 안내를 받았지만, 지금이 몇 번째 단계인지 모르겠습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_OFFICE_IDENTITY_FACT_OPTIONS = [
  {
    value: "office_named_clear",
    label: "기관·부서 이름을 알고 있고, 문서·안내에도 같이 적혀 있습니다.",
  },
  {
    value: "office_name_only",
    label: "이름만 알고 있고, 담당·주소·번호는 아직 확인하지 못했습니다.",
  },
  { value: "office_unknown", label: "어느 기관인지 확인하지 못했습니다." },
  { value: "office_wrong_suspect", label: "다른 기관 안내일 수도 있다고 느낍니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_CORRECT_TARGET_FACT_OPTIONS = [
  { value: "tgt_identity_record", label: "제 신원·등록 정보를 고치라는 쪽에 가깝습니다." },
  {
    value: "tgt_submission_content",
    label: "제가 제출한 내용·서류를 고치라는 쪽에 가깝습니다.",
  },
  { value: "tgt_vehicle_record", label: "차량·운전 관련 기록을 고치라는 쪽에 가깝습니다." },
  { value: "tgt_other", label: "위에 없는 다른 대상입니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_ATTEND_INSTRUCTION_FACT_OPTIONS = [
  {
    value: "att_date_place_stated",
    label: "출석 날짜·시간·장소가 모두 안내에 있습니다.",
  },
  {
    value: "att_date_place_partial",
    label: "날짜·시간은 있는데 장소는 아직 모르겠습니다.",
  },
  { value: "att_window_only", label: "기간만 있고 구체 날짜·시간은 없습니다." },
  { value: "att_place_unknown", label: "출석하라는 것은 알겠는데 장소를 모르겠습니다." },
  { value: "att_content_unclear", label: "왜 출석·소명해야 하는지 요지를 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_SUPPLEMENT_INSTRUCTION_FACT_OPTIONS = [
  {
    value: "sup_missing_docs_list",
    label: "빠진 서류 목록이 있고, 무엇을 추가로 낼지 대략 알겠습니다.",
  },
  {
    value: "sup_missing_docs_unclear",
    label: "빠진 서류 목록은 있지만 제 경우에 맞는지 모르겠습니다.",
  },
  {
    value: "sup_replace_docs",
    label: "이미 낸 서류를 바꿔 다시 내야 한다고 이해합니다.",
  },
  {
    value: "sup_content_add",
    label: "내용을 더 적어 넣거나 추가 설명이 필요하다고 이해합니다.",
  },
  { value: "sup_scope_unclear", label: "무엇을 보완해야 하는지 전체가 아직 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_PAYMENT_INSTRUCTION_FACT_OPTIONS = [
  { value: "pay_type_fine", label: "벌금·과태료를 내라는 쪽에 가깝게 이해합니다." },
  { value: "pay_type_fee", label: "수수료·비용을 내라는 쪽에 가깝게 이해합니다." },
  { value: "pay_type_mixed", label: "여러 항목이 섞여 있다고 이해합니다." },
  { value: "pay_type_unclear", label: "무슨 종류의 납부인지는 아직 모르겠습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_AUTHORITY_FOLLOW_UP_KIND_OPTIONS = [
  {
    value: "completed",
    label: "추가 요구 없이 처리·검토가 진행된다고 들었습니다.",
  },
  {
    value: "more_required",
    label: "추가 서류·자료를 요청했고, 무엇인지 대략 알겠습니다.",
  },
  {
    value: "more_required_vague",
    label: "추가 서류·자료를 요청했지만 무엇인지 모르겠습니다.",
  },
  { value: "re_attendance", label: "다시 출석·설명하라고 했습니다." },
  { value: "payment_demand", label: "납부를 안내했습니다." },
  { value: "no_reply_yet", label: "아직 답변을 받지 못했습니다." },
  {
    value: "reply_unclear",
    label: "답변·연락은 있었지만 무슨 뜻인지 모르겠습니다.",
  },
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
