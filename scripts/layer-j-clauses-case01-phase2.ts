/** CASE_01 Phase2 facet judgment clauses — Brief v3 §4 */

function key(caseCode: string, outlet: string, fieldId: string, slug: string): string {
  return `${caseCode}|${outlet}|${fieldId}|${slug}`;
}

export function buildLayerJCase01Phase2ClauseMap(): Record<string, string> {
  const o = "§03·2차";
  const c = "01";
  const m: Record<string, string> = {};
  const put = (fieldId: string, slug: string, clause: string) => {
    m[key(c, o, fieldId, slug)] = clause;
  };

  put("case01_factConflictFacet", "conflict_time", "쟁점이 시각 불일치로 정리됩니다.");
  put("case01_factConflictFacet", "conflict_place", "쟁점이 장소 불일치로 정리됩니다.");
  put(
    "case01_factConflictFacet",
    "conflict_violation_action",
    "쟁점이 행동·위반 유무 불일치로 정리됩니다.",
  );
  put(
    "case01_factConflictFacet",
    "conflict_vehicle_driver",
    "쟁점이 차량·운전자 귀속 불일치로 정리됩니다.",
  );
  put("case01_factConflictFacet", "conflict_other", "쟁점이 기타 차이 항목으로 정리됩니다.");

  put("case01_spatiotemporalFacet", "st_has_records", "날짜·장소·상황을 기록으로 확인할 수 있는 상태입니다.");
  put("case01_spatiotemporalFacet", "st_has_records_pending", "확인 자료는 있으나 아직 모으지 못한 상태입니다.");
  put("case01_spatiotemporalFacet", "st_witness_only", "증인·동행 확인에 의존하는 상태입니다.");
  put("case01_spatiotemporalFacet", "st_witness_only_pending", "증인·동행 연락이 아직 이뤄지지 않은 상태입니다.");
  put("case01_spatiotemporalFacet", "st_memory_only", "기억·추정에 의존하는 상태입니다.");
  put("case01_spatiotemporalFacet", "st_memory_only_fuzzy", "기억만 있고 시점·순서가 불명확한 상태입니다.");
  put("case01_spatiotemporalFacet", "st_cannot_verify", "지금은 확인할 수 없는 상태입니다.");
  put("case01_spatiotemporalFacet", "st_cannot_verify_tried", "확인을 시도했으나 자료가 없는 상태입니다.");

  put("case01_languageAccessFact", "lang_none", "언어·통역 장벽은 없는 것으로 정리됩니다.");
  put("case01_languageAccessFact", "lang_partial_understanding", "안내를 부분적으로만 이해한 상태입니다.");
  put("case01_languageAccessFact", "lang_partial_no_source", "부분 이해했으나 원문 재확인이 어려운 상태입니다.");
  put("case01_languageAccessFact", "lang_need_interpreter", "통역·공식 안내가 필요한 상태입니다.");
  put(
    "case01_languageAccessFact",
    "lang_indirect_hearsay",
    "제3자·간접 경로로만 안내를 알게 된 상태입니다.",
  );
  put(
    "case01_languageAccessFact",
    "lang_indirect_hearsay_copy",
    "간접 경로이나 전달 문서가 있는 상태입니다.",
  );

  put("case01_unclearDemandFact", "unclear_what_violation", "위반·문제 내용이 불명한 상태입니다.");
  put("case01_unclearDemandFact", "unclear_what_action", "해야 할 행동이 불명한 상태입니다.");
  put("case01_unclearDemandFact", "unclear_deadline", "기한이 불명한 상태입니다.");
  put("case01_unclearDemandFact", "unclear_who_authority", "기관·담당이 불명한 상태입니다.");

  put("case01_compareRecordGap", "cmp_missing_notice", "통지 사본이 없어 비교가 어렵습니다.");
  put("case01_compareRecordGap", "cmp_missing_calendar", "일정 기록이 없어 시간 입증이 약합니다.");
  put("case01_compareRecordGap", "cmp_missing_receipt", "접수·제출 기록이 없습니다.");
  put("case01_compareRecordGap", "cmp_missing_messages", "연락·메시지 기록이 없습니다.");

  put("case01_evidence", "notice", "교통국 통지·안내 문서를 확보한 상태입니다.");
  put("case01_evidence", "message", "연락·메시지 기록을 확보한 상태입니다.");
  put("case01_evidence", "submitted_docs", "제출·접수·납부 증빙을 확보한 상태입니다.");
  put("case01_evidence", "photo_video", "사진·영상 등 자료를 확보한 상태입니다.");
  put("case01_evidence", "none", "관련 자료가 없는 상태입니다.");

  put("case01_noticeDeliveryFact", "del_in_person", "안내를 대면으로 받은 것으로 정리됩니다.");
  put("case01_noticeDeliveryFact", "del_phone_message", "안내를 전화·문자로 받은 것으로 정리됩니다.");
  put("case01_noticeDeliveryFact", "del_written", "문서·서면으로 안내를 받은 것으로 정리됩니다.");
  put("case01_noticeDeliveryFact", "del_written_only", "문서·서면으로 안내를 받은 것으로 정리됩니다.");
  put("case01_noticeDeliveryFact", "del_written_read", "문서·서면으로 안내를 받은 것으로 정리됩니다.");
  put("case01_noticeDeliveryFact", "del_not_received_yet", "아직 통지·안내를 받지 못한 상태입니다.");

  put("case01_procedureStageFact", "stage_first_notice", "최초 통지 단계로 정리됩니다.");
  put("case01_procedureStageFact", "stage_followup_notice", "추가·재통지 단계로 정리됩니다.");
  put("case01_procedureStageFact", "stage_unsure_first", "통지 단계가 불명하고 이전 안내 기억이 없는 상태입니다.");
  put("case01_procedureStageFact", "stage_unsure_many", "여러 통지가 있으나 현재 단계가 불명한 상태입니다.");
  put("case01_procedureStageFact", "stage_unsure", "통지 단계가 불명한 상태입니다.");

  put("case01_officeIdentityFact", "office_named_clear", "기관·부서가 명확한 상태입니다.");
  put("case01_officeIdentityFact", "office_name_only", "담당 이름만 알고 있는 상태입니다.");
  put("case01_officeIdentityFact", "office_unknown", "기관을 확인할 수 없는 상태입니다.");
  put("case01_officeIdentityFact", "office_wrong_suspect", "다른 기관일 수 있다는 의심이 있습니다.");

  put("case01_correctTargetFact", "tgt_identity_record", "신원·등록 수정이 요구 대상입니다.");
  put("case01_correctTargetFact", "tgt_submission_content", "제출 내용 수정이 요구 대상입니다.");
  put("case01_correctTargetFact", "tgt_vehicle_record", "차량·운전 기록 수정이 요구 대상입니다.");
  put("case01_correctTargetFact", "tgt_other", "기타 수정 대상으로 정리됩니다.");

  put("case01_attendInstructionFact", "att_date_place_stated", "출석 일시·장소가 명시된 안내입니다.");
  put("case01_attendInstructionFact", "att_date_place_partial", "출석 일시는 있으나 장소가 불명한 안내입니다.");
  put("case01_attendInstructionFact", "att_window_only", "출석 기간만 명시된 안내입니다.");
  put("case01_attendInstructionFact", "att_place_unknown", "출석 장소가 불명한 안내입니다.");
  put("case01_attendInstructionFact", "att_content_unclear", "출석 요지가 불명한 안내입니다.");

  put("case01_supplementInstructionFact", "sup_missing_docs_list", "누락 서류 목록이 있는 보완 요구입니다.");
  put("case01_supplementInstructionFact", "sup_missing_docs_unclear", "누락 목록은 있으나 적용 범위가 불명한 보완 요구입니다.");
  put("case01_supplementInstructionFact", "sup_replace_docs", "교체·정정 제출이 필요한 보완 요구입니다.");
  put("case01_supplementInstructionFact", "sup_content_add", "내용 추가가 필요한 보완 요구입니다.");
  put("case01_supplementInstructionFact", "sup_scope_unclear", "보완 범위가 불명한 요구입니다.");

  put("case01_paymentInstructionFact", "pay_type_fine", "벌금·과태료 성격의 납부 안내로 정리됩니다.");
  put("case01_paymentInstructionFact", "pay_type_fee", "수수료 성격의 납부 안내로 정리됩니다.");
  put("case01_paymentInstructionFact", "pay_type_mixed", "항목이 혼재된 납부 안내로 정리됩니다.");
  put("case01_paymentInstructionFact", "pay_type_unclear", "납부 종류가 불명한 안내입니다.");

  put("case01_authorityFollowUpKind", "completed", "기관 회신은 추가 요구 없이 처리된 것으로 들었습니다.");
  put("case01_authorityFollowUpKind", "more_required", "기관이 추가 서류·자료를 요청했습니다.");
  put("case01_authorityFollowUpKind", "more_required_vague", "추가 자료 요청이 있으나 항목이 불명한 상태입니다.");
  put("case01_authorityFollowUpKind", "re_attendance", "기관이 다시 출석·설명을 요구했습니다.");
  put("case01_authorityFollowUpKind", "reply_unclear", "기관 회신이 있으나 의미가 불명한 상태입니다.");
  put("case01_authorityFollowUpKind", "payment_demand", "기관이 납부 등 다른 조치를 안내했습니다.");
  put("case01_authorityFollowUpKind", "no_reply_yet", "기관 답변을 아직 받지 못했습니다.");

  return m;
}
