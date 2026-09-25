/** CASE_01 Phase2 facet choice options — Brief v3 §3–§4 (ratio·Layer J). */

const ADMIN_DIRECT_EXPLAIN_CHOICE = {
  value: "other",
  label: "위에 내용이 없거나 설명이 필요합니다 → 직접 입력",
};

export const CASE01_FACT_CONFLICT_FACET_OPTIONS = [
  { value: "conflict_time", label: "쟁점이 시각(날짜·시간) 불일치에 가깝습니다." },
  { value: "conflict_place", label: "쟁점이 장소·위치 불일치에 가깝습니다." },
  {
    value: "conflict_violation_action",
    label: "쟁점이 행동·위반 유무 불일치에 가깝습니다.",
  },
  {
    value: "conflict_vehicle_driver",
    label: "쟁점이 차량·운전자 귀속 불일치에 가깝습니다.",
  },
  { value: "conflict_other", label: "기타 차이 항목이 있습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_SPATIOTEMPORAL_FACET_OPTIONS = [
  { value: "st_has_records", label: "기록·자료로 확인할 수 있습니다." },
  { value: "st_witness_only", label: "증인·동행자 확인만 가능합니다." },
  { value: "st_memory_only", label: "기억·추정에 의존합니다." },
  { value: "st_cannot_verify", label: "지금은 확인할 수 없습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_COMPARE_RECORD_GAP_OPTIONS = [
  { value: "cmp_missing_notice", label: "통지·안내 사본이 없습니다." },
  { value: "cmp_missing_calendar", label: "일정·캘린더 기록이 없습니다." },
  { value: "cmp_missing_receipt", label: "접수·제출 증빙이 없습니다." },
  { value: "cmp_missing_messages", label: "연락·메시지 기록이 없습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_LANGUAGE_ACCESS_FACT_OPTIONS = [
  { value: "lang_none", label: "언어·통역 장벽은 없었습니다." },
  { value: "lang_partial_understanding", label: "부분적으로만 이해했습니다." },
  { value: "lang_need_interpreter", label: "통역·공식 안내가 필요합니다." },
  {
    value: "lang_indirect_hearsay",
    label: "제3자·대행·통역 등 간접 경로로만 들었습니다.",
  },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_UNCLEAR_DEMAND_FACT_OPTIONS = [
  { value: "unclear_what_violation", label: "위반·문제 내용이 불명합니다." },
  { value: "unclear_what_action", label: "해야 할 행동이 불명합니다." },
  { value: "unclear_deadline", label: "기한이 불명합니다." },
  { value: "unclear_who_authority", label: "기관·담당이 불명합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_NOTICE_DELIVERY_FACT_OPTIONS = [
  { value: "del_in_person", label: "대면으로 안내를 받았습니다." },
  { value: "del_phone_message", label: "전화·문자로 안내를 받았습니다." },
  { value: "del_written_only", label: "문서·서면으로만 받았습니다." },
  { value: "del_not_received_yet", label: "아직 통지·안내를 받지 못했습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_PROCEDURE_STAGE_FACT_OPTIONS = [
  { value: "stage_first_notice", label: "최초 통지에 가깝습니다." },
  { value: "stage_followup_notice", label: "추가·재통지에 가깝습니다." },
  { value: "stage_unsure", label: "통지 단계가 불명합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_OFFICE_IDENTITY_FACT_OPTIONS = [
  { value: "office_named_clear", label: "기관·부서가 명확합니다." },
  { value: "office_name_only", label: "이름만 알고 있습니다." },
  { value: "office_unknown", label: "기관을 확인할 수 없습니다." },
  { value: "office_wrong_suspect", label: "다른 기관일 수 있습니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_CORRECT_TARGET_FACT_OPTIONS = [
  { value: "tgt_identity_record", label: "신원·등록 수정이 대상입니다." },
  { value: "tgt_submission_content", label: "제출 내용 수정이 대상입니다." },
  { value: "tgt_vehicle_record", label: "차량·운전 기록이 대상입니다." },
  { value: "tgt_other", label: "기타 수정 대상입니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_ATTEND_INSTRUCTION_FACT_OPTIONS = [
  { value: "att_date_place_stated", label: "출석 일시·장소가 명시되었습니다." },
  { value: "att_window_only", label: "기간만 명시되었습니다." },
  { value: "att_place_unknown", label: "장소가 불명합니다." },
  { value: "att_content_unclear", label: "출석 요지가 불명합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_SUPPLEMENT_INSTRUCTION_FACT_OPTIONS = [
  { value: "sup_missing_docs_list", label: "누락 서류 목록이 있습니다." },
  { value: "sup_replace_docs", label: "교체·정정 제출이 필요합니다." },
  { value: "sup_content_add", label: "내용 추가가 필요합니다." },
  { value: "sup_scope_unclear", label: "보완 범위가 불명합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_PAYMENT_INSTRUCTION_FACT_OPTIONS = [
  { value: "pay_type_fine", label: "벌금·과태료 성격으로 이해합니다." },
  { value: "pay_type_fee", label: "수수료 성격으로 이해합니다." },
  { value: "pay_type_mixed", label: "항목이 혼재되어 있습니다." },
  { value: "pay_type_unclear", label: "납부 종류가 불명합니다." },
  ADMIN_DIRECT_EXPLAIN_CHOICE,
];

export const CASE01_AUTHORITY_FOLLOW_UP_KIND_OPTIONS = [
  { value: "completed", label: "추가 요구 없이 처리되었다고 들었습니다." },
  { value: "more_required", label: "추가 서류나 자료를 요청했습니다." },
  { value: "re_attendance", label: "다시 출석하거나 설명하라고 했습니다." },
  { value: "payment_demand", label: "비용 납부나 다른 조치를 안내했습니다." },
  { value: "no_reply_yet", label: "아직 답변을 받지 못했습니다." },
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
