/** CASE_02~06 Layer J explicit slug→clause (key: `CC|outlet|fieldId|slug`). */

type ClauseMap = Record<string, string>;

function k(caseCode: string, outlet: string, fieldId: string, slug: string): string {
  return `${caseCode}|${outlet}|${fieldId}|${slug}`;
}

function add(
  map: ClauseMap,
  caseCode: string,
  outlet: string,
  fieldId: string,
  slug: string,
  clause: string,
): void {
  map[k(caseCode, outlet, fieldId, slug)] = clause;
}

const P1 = "1차 확인에서는";
const P2 = "2차 추가 확인에서는";

export function buildLayerJCase0206ClauseMap(): ClauseMap {
  const m: ClauseMap = {};

  // ── CASE_02 ──
  add(m, "02", "§03·1차", "case02_paymentSubject", "traffic_fine", `${P1} 납부 요구가 교통위반 벌금·과태료 성격으로 파악됩니다.`);
  add(m, "02", "§03·1차", "case02_paymentSubject", "license_fee", `${P1} 납부 요구가 면허 발급·갱신·변경 비용으로 파악됩니다.`);
  add(m, "02", "§03·1차", "case02_paymentSubject", "vehicle_reg_fee", `${P1} 납부 요구가 차량 등록·검사 관련 비용으로 파악됩니다.`);
  add(m, "02", "§03·1차", "case02_paymentSubject", "additional_related", `${P1} 이전 처리와 연결된 추가 납부 요구로 파악됩니다.`);
  add(m, "02", "§03·1차", "case02_paymentSubject", "unclear", `${P1} 납부 사유·근거가 아직 명확히 정리되지 않은 상태입니다.`);

  add(m, "02", "§03·1차", "case02_confirmGoal", "verify_obligation", `${P1} 납부 의무가 실제 상황에 해당하는지부터 짚어볼 필요가 있습니다.`);
  add(m, "02", "§03·1차", "case02_confirmGoal", "verify_amount", `${P1} 통지 금액·산정 근거를 우선 대조할 필요가 있습니다.`);
  add(m, "02", "§03·1차", "case02_confirmGoal", "how_when_where", `${P1} 납부 시기·장소·방법을 우선 확인할 필요가 있습니다.`);
  add(m, "02", "§03·1차", "case02_confirmGoal", "payment_processed", `${P1} 기납부 처리 여부와 재요구 사유를 우선 확인할 필요가 있습니다.`);
  add(m, "02", "§03·1차", "case02_confirmGoal", "unsure", `${P1} 무엇부터 확인할지 방향이 아직 정리되지 않은 상태입니다.`);

  add(m, "02", "§03·1차", "case02_demandAuthority", "traffic", `${P1} 교통·교통국 계열 기관의 납부 요구로 파악됩니다.`);
  add(m, "02", "§03·1차", "case02_demandAuthority", "police", `${P1} 경찰 등 교통 관련 기관의 납부 요구로 파악됩니다.`);
  add(m, "02", "§03·1차", "case02_demandAuthority", "vehicle_reg", `${P1} 차량 등록·검사 관련 기관의 납부 요구로 파악됩니다.`);
  add(m, "02", "§03·1차", "case02_demandAuthority", "other_agency", `${P1} 특정 기관명이 불분명한 납부 요구로 파악됩니다.`);

  add(m, "02", "§03·1차", "case02_paymentStatus", "not_paid", `${P1} 아직 납부가 이루어지지 않은 상태로 정리됩니다.`);
  add(m, "02", "§03·1차", "case02_paymentStatus", "partial", `${P1} 일부만 납부된 상태로 정리됩니다.`);
  add(m, "02", "§03·1차", "case02_paymentStatus", "full", `${P1} 요구 금액 전액 납부가 완료된 상태로 정리됩니다.`);
  add(m, "02", "§03·1차", "case02_paymentStatus", "paid_unverified", `${P1} 납부는 했으나 기관 처리 확인이 되지 않은 상태입니다.`);
  add(m, "02", "§03·1차", "case02_paymentStatus", "paid_by_other", `${P1} 대리 납부가 있었으나 본인 처리 여부 확인이 필요합니다.`);

  add(m, "02", "§03·1차", "case02_deadline", "confirmed", `${P1} 납부 기한 일자를 확인한 상태입니다.`);
  add(m, "02", "§03·1차", "case02_deadline", "uncertain", `${P1} 납부 기한이 있으나 구체 일자 확인이 필요합니다.`);
  add(m, "02", "§03·1차", "case02_deadline", "deadline_mentioned", `${P1} 기한 안내는 있으나 구체 일자 확인이 필요합니다.`);
  add(m, "02", "§03·1차", "case02_deadline", "not_stated", `${P1} 납부 기한 안내가 확인되지 않은 상태입니다.`);
  add(m, "02", "§03·1차", "case02_deadline", "unsure", `${P1} 납부 기한 정보가 거의 없는 상태입니다.`);

  add(m, "02", "§03·2차", "case02_situationMatch", "match", `${P2} 납부 요구와 실제 상황이 대체로 맞는 방향으로 정리됩니다.`);
  add(m, "02", "§03·2차", "case02_situationMatch", "partial", `${P2} 납부 요구와 실제 상황이 다르게 느껴진다는 점이 핵심입니다.`);
  add(m, "02", "§03·2차", "case02_situationMatch", "not_applicable", `${P2} 납부 의무 자체가 내 상황과 맞지 않을 수 있다는 점이 핵심입니다.`);
  add(m, "02", "§03·2차", "case02_situationMatch", "hard_to_judge", `${P2} 문서와 실제 상황을 대조하기 어렵다는 점이 핵심입니다.`);
  add(m, "02", "§03·2차", "case02_situationMatch", "unknown", `${P2} 판단에 필요한 정보가 부족하다는 점이 핵심입니다.`);

  add(m, "02", "§03·2차", "case02_paymentAmount", "amount_stated_basis_unclear", `${P2} 금액은 안내되었으나 산정 근거가 불분명하다는 점이 핵심입니다.`);
  add(m, "02", "§03·2차", "case02_paymentAmount", "amount_differs", `${P2} 안내 금액과 알고 있는 금액의 차이가 핵심입니다.`);
  add(m, "02", "§03·2차", "case02_paymentAmount", "paid_redemand", `${P2} 납부 후 다시 요구받은 상황이 핵심입니다.`);
  add(m, "02", "§03·2차", "case02_paymentAmount", "amount_unknown", `${P2} 요구 금액 자체가 불명확하다는 점이 핵심입니다.`);

  add(m, "02", "§03·2차", "case02_nonPaymentNotice", "sanction_enforcement_stated", `${P2} 미납 시 추가 제재·강제징수 안내가 핵심입니다.`);
  add(m, "02", "§03·2차", "case02_nonPaymentNotice", "interest_stated", `${P2} 이자·가산금 안내가 핵심입니다.`);
  add(m, "02", "§03·2차", "case02_nonPaymentNotice", "no_notice", `${P2} 미납 시 결과 안내가 없어 재확인이 필요합니다.`);

  // ── CASE_03 ──
  add(m, "03", "§03·1차", "case03_authorityDemand", "reason_unclear", `${P1} 기관 요구·확인 목적이 아직 명확히 정리되지 않은 상태입니다.`);
  add(m, "03", "§03·1차", "case03_authorityDemand", "specific_incident", `${P1} 특정 사건·행동에 대한 확인·소명 요구로 정리됩니다.`);
  add(m, "03", "§03·1차", "case03_authorityDemand", "submission_review", `${P1} 제출·등록 내용에 대한 검토·확인 요구로 정리됩니다.`);
  add(m, "03", "§03·1차", "case03_authorityDemand", "repeat_demand", `${P1} 이미 대응했으나 다시 요구된 상황으로 정리됩니다.`);
  add(m, "03", "§03·1차", "case03_authorityDemand", "prep_unclear", `${P1} 무엇을 준비해야 하는지 아직 불분명한 상태입니다.`);

  add(m, "03", "§03·1차", "case03_confirmGoal", "prepare_materials", `${P1} 준비할 자료·내용을 먼저 정리할 필요가 있습니다.`);
  add(m, "03", "§03·1차", "case03_confirmGoal", "sufficient_explanation", `${P1} 이미 한 설명이 충분한지 확인할 필요가 있습니다.`);
  add(m, "03", "§03·1차", "case03_confirmGoal", "deadline_attendance", `${P1} 출석·소명 기한과 필수 출석 여부를 우선 확인할 필요가 있습니다.`);
  add(m, "03", "§03·1차", "case03_confirmGoal", "repeat_response", `${P1} 추가 대응이 왜 필요한지 확인할 필요가 있습니다.`);
  add(m, "03", "§03·1차", "case03_confirmGoal", "unsure", `${P1} 무엇부터 준비·대응할지 방향이 아직 정리되지 않은 상태입니다.`);

  add(m, "03", "§03·1차", "case03_customerResponse", "none", `${P1} 아직 공식 대응·연락이 진행되지 않은 상태로 확인됩니다.`);
  add(m, "03", "§03·1차", "case03_customerResponse", "phone_message", `${P1} 전화·메시지 등으로 일부 대응한 상태로 확인됩니다.`);
  add(m, "03", "§03·1차", "case03_customerResponse", "attendance", `${P1} 출석·방문 등으로 대응한 상태로 확인됩니다.`);
  add(m, "03", "§03·1차", "case03_customerResponse", "explanation_with_docs", `${P1} 설명과 함께 자료를 제출한 상태로 확인됩니다.`);
  add(m, "03", "§03·1차", "case03_customerResponse", "other_method", `${P1} 다른 방식으로 대응한 상태로 확인됩니다.`);

  add(m, "03", "§03·1차", "case03_deadline", "specific_date", `${P1} 출석·소명 기한 일자를 확인한 상태입니다.`);
  add(m, "03", "§03·1차", "case03_deadline", "uncertain", `${P1} 기한이 있으나 구체 일자 확인이 필요합니다.`);
  add(m, "03", "§03·1차", "case03_deadline", "period_stated", `${P1} 기한은 기간만 안내된 상태로 구체 일자 확인이 필요합니다.`);
  add(m, "03", "§03·1차", "case03_deadline", "not_stated", `${P1} 별도 기한 안내가 확인되지 않은 상태입니다.`);
  add(m, "03", "§03·1차", "case03_deadline", "unsure", `${P1} 기한 관련 정보가 거의 없는 상태입니다.`);

  add(m, "03", "§03·2차", "case03_factRelationship", "match", `${P2} 기관이 확인하려는 내용과 실제 상황이 대체로 맞는 방향으로 정리됩니다.`);
  add(m, "03", "§03·2차", "case03_factRelationship", "partial", `${P2} 기관 확인 내용과 실제 상황이 일부 다르게 느껴진다는 점이 핵심입니다.`);
  add(m, "03", "§03·2차", "case03_factRelationship", "mismatch", `${P2} 기관 확인 내용과 실제 상황이 다르게 느껴진다는 점이 핵심입니다.`);
  add(m, "03", "§03·2차", "case03_factRelationship", "hard_to_judge", `${P2} 안내와 실제 상황을 같은 기준으로 비교하기 어렵다는 점이 핵심입니다.`);
  add(m, "03", "§03·2차", "case03_factRelationship", "unknown", `${P2} 일치 여부를 아직 판단하기 어렵다는 점이 핵심입니다.`);

  add(m, "03", "§03·2차", "case03_explanationDetail", "full_explanation", `${P2} 충분히 설명·소명한 상태로 정리됩니다.`);
  add(m, "03", "§03·2차", "case03_explanationDetail", "with_submitted_docs", `${P2} 설명과 함께 자료를 제출한 상태로 정리됩니다.`);
  add(m, "03", "§03·2차", "case03_explanationDetail", "partial_explanation", `${P2} 일부만 설명한 상태로 추가 소명 여부가 핵심입니다.`);
  add(m, "03", "§03·2차", "case03_explanationDetail", "agency_redemand", `${P2} 설명 후 기관이 다시 다른 내용을 요구했다는 점이 핵심입니다.`);
  add(m, "03", "§03·2차", "case03_explanationDetail", "attended_insufficient", `${P2} 출석했으나 설명이 충분하지 않다고 안내받은 상태가 핵심입니다.`);

  // ── CASE_04 ──
  add(m, "04", "§03·1차", "case04_supplementTarget", "additional_docs", `${P1} 빠진 자료 추가 제출 요구로 정리됩니다.`);
  add(m, "04", "§03·1차", "case04_supplementTarget", "add_content_evidence", `${P1} 제출 내용·정보 부족을 이유로 한 보완 요구로 정리됩니다.`);
  add(m, "04", "§03·1차", "case04_supplementTarget", "modify_existing", `${P1} 형식·작성 방법 문제로 인한 재제출 요구로 정리됩니다.`);
  add(m, "04", "§03·1차", "case04_supplementTarget", "repeat_demand", `${P1} 이미 보완 후 재요구된 상황으로 정리됩니다.`);
  add(m, "04", "§03·1차", "case04_supplementTarget", "unclear", `${P1} 보완 대상이 아직 명확하지 않은 상태입니다.`);

  add(m, "04", "§03·1차", "case04_confirmGoal", "understand_materials", `${P1} 어떤 자료를 더 원하는지부터 확인할 필요가 있습니다.`);
  add(m, "04", "§03·1차", "case04_confirmGoal", "understand_insufficient", `${P1} 기존 제출이 왜 부족한지 확인할 필요가 있습니다.`);
  add(m, "04", "§03·1차", "case04_confirmGoal", "prepare_materials", `${P1} 추가 자료 준비 방법을 정리할 필요가 있습니다.`);
  add(m, "04", "§03·1차", "case04_confirmGoal", "repeat_reason", `${P1} 재요구 사유를 확인할 필요가 있습니다.`);
  add(m, "04", "§03·1차", "case04_confirmGoal", "unsure", `${P1} 무엇부터 준비할지 방향이 아직 정리되지 않은 상태입니다.`);

  add(m, "04", "§03·1차", "case04_customerResponse", "not_started", `${P1} 보완 대응이 아직 시작되지 않은 상태로 확인됩니다.`);
  add(m, "04", "§03·1차", "case04_customerResponse", "preparing", `${P1} 자료를 준비 중인 상태로 확인됩니다.`);
  add(m, "04", "§03·1차", "case04_customerResponse", "submitted", `${P1} 보완 제출을 완료한 상태로 확인됩니다.`);
  add(m, "04", "§03·1차", "case04_customerResponse", "inquired", `${P1} 기관에 문의·확인한 상태로 확인됩니다.`);
  add(m, "04", "§03·1차", "case04_customerResponse", "other_method", `${P1} 다른 방식으로 대응한 상태로 확인됩니다.`);

  add(m, "04", "§03·1차", "case04_deadline", "specific_date", `${P1} 보완 제출 기한 일자를 확인한 상태입니다.`);
  add(m, "04", "§03·1차", "case04_deadline", "uncertain", `${P1} 보완 기한이 있으나 구체 일자 확인이 필요합니다.`);
  add(m, "04", "§03·1차", "case04_deadline", "period_stated", `${P1} 보완 기한은 기간만 안내된 상태로 구체 일자 확인이 필요합니다.`);
  add(m, "04", "§03·1차", "case04_deadline", "not_stated", `${P1} 보완 기한 안내가 확인되지 않은 상태입니다.`);
  add(m, "04", "§03·1차", "case04_deadline", "unsure", `${P1} 보완 기한 정보가 거의 없는 상태입니다.`);

  add(m, "04", "§03·2차", "case04_submissionRelation", "add_missing", `${P2} 빠진 항목을 추가하는 방향으로 제출 관계가 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_submissionRelation", "modify_content", `${P2} 기존 제출 내용을 수정·보완하는 방향이 핵심입니다.`);
  add(m, "04", "§03·2차", "case04_submissionRelation", "support_existing", `${P2} 기존 제출을 뒷받침하는 자료가 핵심입니다.`);
  add(m, "04", "§03·2차", "case04_submissionRelation", "mismatch_request", `${P2} 보완 요구와 준비·제출 상황이 맞지 않을 수 있다는 점이 핵심입니다.`);
  add(m, "04", "§03·2차", "case04_submissionRelation", "hard_to_judge", `${P2} 요구와 제출 상황을 대조하기 어렵다는 점이 핵심입니다.`);

  // ── CASE_05 ──
  add(m, "05", "§03·1차", "case05_dispositionType", "application_denied", `${P1} 신청·요청이 거부된 처분·조치로 정리됩니다.`);
  add(m, "05", "§03·1차", "case05_dispositionType", "rights_ended", `${P1} 권리·자격 종료·취소 등 처분으로 정리됩니다.`);
  add(m, "05", "§03·1차", "case05_dispositionType", "business_suspended", `${P1} 운영·업무 중단·정지 조치로 정리됩니다.`);
  add(m, "05", "§03·1차", "case05_dispositionType", "situation_mismatch", `${P1} 처분 내용이 실제 상황과 맞지 않을 수 있다는 전제로 정리됩니다.`);
  add(m, "05", "§03·1차", "case05_dispositionType", "disposition_unclear", `${P1} 처분·조치 유형이 아직 명확히 정리되지 않은 상태입니다.`);

  add(m, "05", "§03·1차", "case05_confirmGoal", "understand_reason", `${P1} 처분 사유·근거를 먼저 확인할 필요가 있습니다.`);
  add(m, "05", "§03·1차", "case05_confirmGoal", "understand_impact", `${P1} 처분이 실제 생활·권리에 미치는 영향을 확인할 필요가 있습니다.`);
  add(m, "05", "§03·1차", "case05_confirmGoal", "appeal_possibility", `${P1} 이의·재심 등 대응 가능 여부를 확인할 필요가 있습니다.`);
  add(m, "05", "§03·1차", "case05_confirmGoal", "what_to_do", `${P1} 지금 취해야 할 조치를 정리할 필요가 있습니다.`);
  add(m, "05", "§03·1차", "case05_confirmGoal", "unsure", `${P1} 무엇부터 확인할지 방향이 아직 정리되지 않은 상태입니다.`);

  add(m, "05", "§03·1차", "case05_customerResponse", "none", `${P1} 처분 통지 이후 공식 대응이 진행되지 않은 상태로 확인됩니다.`);
  add(m, "05", "§03·1차", "case05_customerResponse", "inquired", `${P1} 기관에 문의·확인한 상태로 확인됩니다.`);
  add(m, "05", "§03·1차", "case05_customerResponse", "explanation_submitted", `${P1} 소명·설명을 제출한 상태로 확인됩니다.`);
  add(m, "05", "§03·1차", "case05_customerResponse", "documents_submitted", `${P1} 관련 서류를 제출한 상태로 확인됩니다.`);
  add(m, "05", "§03·1차", "case05_customerResponse", "appeal_requested", `${P1} 이의·재심 등 formal 대응을 요청한 상태로 확인됩니다.`);

  add(m, "05", "§03·1차", "case05_deadline", "specific_date", `${P1} 처분 관련 대응 기한 일자를 확인한 상태입니다.`);
  add(m, "05", "§03·1차", "case05_deadline", "uncertain", `${P1} 대응 기한이 있으나 구체 일자 확인이 필요합니다.`);
  add(m, "05", "§03·1차", "case05_deadline", "period_stated", `${P1} 대응 기한은 기간만 안내된 상태로 구체 일자 확인이 필요합니다.`);
  add(m, "05", "§03·1차", "case05_deadline", "not_stated", `${P1} 대응 기한 안내가 확인되지 않은 상태입니다.`);
  add(m, "05", "§03·1차", "case05_deadline", "unsure", `${P1} 대응 기한 정보가 거의 없는 상태입니다.`);

  add(m, "05", "§03·2차", "case05_factRelationship", "match", `${P2} 처분 내용과 실제 상황이 대체로 맞는 방향으로 정리됩니다.`);
  add(m, "05", "§03·2차", "case05_factRelationship", "partial", `${P2} 처분 내용과 실제 상황의 차이 가능성이 핵심입니다.`);
  add(m, "05", "§03·2차", "case05_factRelationship", "mismatch", `${P2} 처분 내용과 실제 상황의 차이 가능성이 핵심입니다.`);
  add(m, "05", "§03·2차", "case05_factRelationship", "hard_to_judge", `${P2} 처분과 실제 상황을 대조하기 어렵다는 점이 핵심입니다.`);
  add(m, "05", "§03·2차", "case05_factRelationship", "unknown", `${P2} 일치 여부를 아직 판단하기 어렵다는 점이 핵심입니다.`);

  add(m, "05", "§03·2차", "case05_authorityFollowUp", "maintained", `${P2} 기관이 기존 처분·요구를 유지하는 방향으로 정리됩니다.`);
  add(m, "05", "§03·2차", "case05_authorityFollowUp", "modified", `${P2} 기관이 처분·요구 내용을 조정한 상태가 핵심입니다.`);
  add(m, "05", "§03·2차", "case05_authorityFollowUp", "revoked", `${P2} 처분·요구가 취소·철회된 상태가 핵심입니다.`);
  add(m, "05", "§03·2차", "case05_authorityFollowUp", "more_docs", `${P2} 추가 서류·자료 요구가 이어지는 상태가 핵심입니다.`);
  add(m, "05", "§03·2차", "case05_authorityFollowUp", "attendance_explanation", `${P2} 출석·추가 소명 요구가 이어지는 상태가 핵심입니다.`);
  add(m, "05", "§03·2차", "case05_authorityFollowUp", "under_review", `${P2} 기관 검토·심사가 진행 중인 상태가 핵심입니다.`);
  add(m, "05", "§03·2차", "case05_authorityFollowUp", "payment_demand", `${P2} 비용·납부 관련 추가 안내가 핵심입니다.`);
  add(m, "05", "§03·2차", "case05_authorityFollowUp", "no_response", `${P2} 아직 기관 답변·반응이 없는 상태가 핵심입니다.`);
  add(m, "05", "§03·2차", "case05_authorityFollowUp", "unsure", `${P2} 기관 후속 반응이 아직 명확하지 않은 상태가 핵심입니다.`);

  add(m, "05", "§03·2차", "case05_dispositionOutcome", "maintained", `${P2} 처분·조치가 유지된 결과로 정리됩니다.`);
  add(m, "05", "§03·2차", "case05_dispositionOutcome", "modified", `${P2} 처분·조치가 일부 변경된 결과로 정리됩니다.`);
  add(m, "05", "§03·2차", "case05_dispositionOutcome", "revoked", `${P2} 처분·조치가 취소·철회된 결과로 정리됩니다.`);
  add(m, "05", "§03·2차", "case05_dispositionOutcome", "additional_action", `${P2} 추가 조치·요구가 이어지는 결과로 정리됩니다.`);
  add(m, "05", "§03·2차", "case05_dispositionOutcome", "more_docs_required", `${P2} 추가 자료 제출이 필요한 결과로 정리됩니다.`);
  add(m, "05", "§03·2차", "case05_dispositionOutcome", "no_result", `${P2} 아직 결과·결론이 없는 상태로 정리됩니다.`);
  add(m, "05", "§03·2차", "case05_dispositionOutcome", "unsure", `${P2} 처분 결과가 아직 명확하지 않은 상태로 정리됩니다.`);

  // ── CASE_06 ──
  add(m, "06", "§03·1차", "case06_documentNature", "violation_notice", `${P1} 문서는 위반·문제 통지 성격으로 파악됩니다.`);
  add(m, "06", "§03·1차", "case06_documentNature", "payment_demand", `${P1} 문서는 납부 요구 성격으로 파악됩니다.`);
  add(m, "06", "§03·1차", "case06_documentNature", "attendance_explain", `${P1} 문서는 출석·소명 요구 성격으로 파악됩니다.`);
  add(m, "06", "§03·1차", "case06_documentNature", "supplement_docs", `${P1} 문서는 보완·추가 제출 요구 성격으로 파악됩니다.`);
  add(m, "06", "§03·1차", "case06_documentNature", "disposition_action", `${P1} 문서는 처분·조치 통지 성격으로 파악됩니다.`);
  add(m, "06", "§03·1차", "case06_documentNature", "hard_to_classify", `${P1} 문서 성격이 아직 분류하기 어려운 상태입니다.`);

  add(m, "06", "§03·1차", "case06_requiredActionCandidate", "pay_demand", `${P1} 문서에서 요구 조치는 납부로 파악됩니다.`);
  add(m, "06", "§03·1차", "case06_requiredActionCandidate", "attend_explain", `${P1} 문서에서 요구 조치는 출석·소명으로 파악됩니다.`);
  add(m, "06", "§03·1차", "case06_requiredActionCandidate", "submit_supplement", `${P1} 문서에서 요구 조치는 보완·추가 제출로 파악됩니다.`);
  add(m, "06", "§03·1차", "case06_requiredActionCandidate", "disposition_notice", `${P1} 문서에서 요구 조치는 처분·조치 통지 수용으로 파악됩니다.`);
  add(m, "06", "§03·1차", "case06_requiredActionCandidate", "problem_action_unclear", `${P1} 문서에서 요구 조치가 아직 명확하지 않은 상태입니다.`);

  add(m, "06", "§03·1차", "case06_customerResponse", "no_response_yet", `${P1} 문서 수령 후 아직 대응이 진행되지 않은 상태입니다.`);
  add(m, "06", "§03·1차", "case06_customerResponse", "inquired_authority", `${P1} 기관에 문의·확인한 상태로 정리됩니다.`);
  add(m, "06", "§03·1차", "case06_customerResponse", "prepared_or_submitted_docs", `${P1} 자료를 준비하거나 제출한 상태로 정리됩니다.`);
  add(m, "06", "§03·1차", "case06_customerResponse", "paid_or_attempted_pay", `${P1} 납부를 했거나 시도한 상태로 정리됩니다.`);
  add(m, "06", "§03·1차", "case06_customerResponse", "attended_then_redemand", `${P1} 출석·대응 후 다시 요구받은 상태로 정리됩니다.`);

  add(m, "06", "§03·2차", "case06_paymentNature", "violation_fine", `${P2} 비용 요구는 위반·벌금 성격으로 정리됩니다.`);
  add(m, "06", "§03·2차", "case06_paymentNature", "application_fee", `${P2} 비용 요구는 신청·수수료 성격으로 정리됩니다.`);
  add(m, "06", "§03·2차", "case06_paymentNature", "prior_tax_or_debt", `${P2} 비용 요구는 기존 세금·미납 성격으로 정리됩니다.`);
  add(m, "06", "§03·2차", "case06_paymentNature", "not_explained", `${P2} 무엇에 대한 비용인지 설명이 부족한 상태가 핵심입니다.`);

  add(m, "06", "§03·2차", "case06_paymentAmountKnown", "exact_amount_known", `${P2} 납부 금액이 구체적으로 안내된 상태가 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_paymentAmountKnown", "approx_amount_known", `${P2} 대략적인 금액만 안내된 상태가 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_paymentAmountKnown", "conflicting_amounts", `${P2} 금액이 여러 번 다르게 안내된 상태가 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_paymentAmountKnown", "amount_not_given", `${P2} 금액 자체가 안내되지 않은 상태가 핵심입니다.`);

  add(m, "06", "§03·2차", "case06_paymentSituationMatch", "match", `${P2} 납부 요구가 실제 상황과 대체로 맞는 방향으로 정리됩니다.`);
  add(m, "06", "§03·2차", "case06_paymentSituationMatch", "amount_or_reason_mismatch", `${P2} 금액·사유가 실제 상황과 다르게 느껴진다는 점이 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_paymentSituationMatch", "insufficient_info", `${P2} 상황과 금액을 맞추기 위한 정보가 부족하다는 점이 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_paymentSituationMatch", "redemand_after_paid", `${P2} 납부 후 다시 요구받은 상황이 핵심입니다.`);

  add(m, "06", "§03·2차", "case06_paymentNonPaymentNotice", "enforcement_warning", `${P2} 미납 시 강제징수·제재 경고가 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_paymentNonPaymentNotice", "interest_surcharge_warning", `${P2} 이자·가산금 경고가 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_paymentNonPaymentNotice", "no_notice", `${P2} 미납 시 결과 안내가 없어 재확인이 필요합니다.`);

  add(m, "06", "§03·2차", "case06_attendanceFactMatch", "match", `${P2} 출석·확인 대상 내용이 실제 상황과 대체로 맞는 방향입니다.`);
  add(m, "06", "§03·2차", "case06_attendanceFactMatch", "partial", `${P2} 일부만 맞고 핵심이 다를 수 있다는 점이 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_attendanceFactMatch", "mismatch", `${P2} 문제 삼는 내용이 실제와 다르다는 점이 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_attendanceFactMatch", "insufficient_info", `${P2} 비교에 필요한 정보가 부족하다는 점이 핵심입니다.`);

  add(m, "06", "§03·2차", "case06_submissionRelation", "match", `${P2} 보완 요구와 준비·제출이 대체로 맞는 방향입니다.`);
  add(m, "06", "§03·2차", "case06_submissionRelation", "partial", `${P2} 일부만 맞고 보완 범위가 다를 수 있다는 점이 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_submissionRelation", "mismatch", `${P2} 보완 요구와 준비 상황이 맞지 않을 수 있다는 점이 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_submissionRelation", "insufficient_info", `${P2} 제출 관계를 판단할 정보가 부족하다는 점이 핵심입니다.`);

  add(m, "06", "§03·2차", "case06_dispositionFactMatch", "match", `${P2} 처분 내용과 실제 상황이 대체로 맞는 방향입니다.`);
  add(m, "06", "§03·2차", "case06_dispositionFactMatch", "partial", `${P2} 처분과 실제 상황이 일부 다를 수 있다는 점이 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_dispositionFactMatch", "mismatch", `${P2} 처분과 실제 상황이 다를 수 있다는 점이 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_dispositionFactMatch", "insufficient_info", `${P2} 처분·사실 비교 정보가 부족하다는 점이 핵심입니다.`);

  add(m, "06", "§03·2차", "case06_unclearFactRelation", "actually_related", `${P2} 문서 내용이 실제 상황과 관련 있다는 방향으로 정리됩니다.`);
  add(m, "06", "§03·2차", "case06_unclearFactRelation", "partially_related", `${P2} 문서와 실제 상황이 부분적으로만 관련 있다는 점이 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_unclearFactRelation", "unrelated", `${P2} 문서가 실제 상황과 무관할 수 있다는 점이 핵심입니다.`);
  add(m, "06", "§03·2차", "case06_unclearFactRelation", "insufficient_info", `${P2} 문서와 사실 관계를 판단할 정보가 부족하다는 점이 핵심입니다.`);

  // ── §7 v3 목록형·상황형 (CASE_03~05) ──
  const chip = (cc: string, field: string, slug: string, clause: string) =>
    add(m, cc, "§03·2차", field, slug, clause);

  chip("03", "case03_evidence", "notice", `${P2} 출석·소명 통지서를 확보한 상태로 정리됩니다.`);
  chip("03", "case03_evidence", "attendance_notice", `${P2} 출석 일시·장소 안내를 확보한 상태로 정리됩니다.`);
  chip("03", "case03_evidence", "message", `${P2} 문자·연락 안내를 확보한 상태로 정리됩니다.`);
  chip("03", "case03_evidence", "submitted_docs", `${P2} 제출·소명 서류를 확보한 상태로 정리됩니다.`);
  chip("03", "case03_evidence", "none", `${P2} 관련 자료가 없는 상태로 정리됩니다.`);
  chip("03", "case03_evidence", "unsure", `${P2} 확보 가능 자료가 아직 정리되지 않은 상태입니다.`);

  chip("04", "case04_evidence", "supplement_notice", `${P2} 보완 요구 안내문을 확보한 상태로 정리됩니다.`);
  chip("04", "case04_evidence", "message", `${P2} 연락·메신저 안내를 확보한 상태로 정리됩니다.`);
  chip("04", "case04_evidence", "original_submission", `${P2} 최초 제출 서류를 확보한 상태로 정리됩니다.`);
  chip("04", "case04_evidence", "supplement_submission", `${P2} 보완 제출 서류를 확보한 상태로 정리됩니다.`);
  chip("04", "case04_evidence", "none", `${P2} 관련 자료가 없는 상태로 정리됩니다.`);
  chip("04", "case04_evidence", "unsure", `${P2} 확보 가능 자료가 아직 정리되지 않은 상태입니다.`);

  chip("04", "case04_addDocDetail", "id_doc", `${P2} 추가 제출 대상에 신분·인적 서류가 포함됩니다.`);
  chip("04", "case04_addDocDetail", "financial_doc", `${P2} 추가 제출 대상에 재무·금액 서류가 포함됩니다.`);
  chip("04", "case04_addDocDetail", "certificate", `${P2} 추가 제출 대상에 증명서·확인서가 포함됩니다.`);
  chip("04", "case04_addDocDetail", "translation", `${P2} 추가 제출 대상에 번역·공증 서류가 포함됩니다.`);
  chip("04", "case04_addDocDetail", "unsure", `${P2} 추가 서류 범위가 아직 정리되지 않은 상태입니다.`);

  chip("04", "case04_modifyDetail", "name_info", `${P2} 수정 대상에 인적사항이 포함됩니다.`);
  chip("04", "case04_modifyDetail", "date_info", `${P2} 수정 대상에 날짜·기간이 포함됩니다.`);
  chip("04", "case04_modifyDetail", "amount_info", `${P2} 수정 대상에 금액·수치가 포함됩니다.`);
  chip("04", "case04_modifyDetail", "content_info", `${P2} 수정 대상에 기재 내용이 포함됩니다.`);
  chip("04", "case04_modifyDetail", "unsure", `${P2} 수정 항목이 아직 정리되지 않은 상태입니다.`);

  chip("04", "case04_evidenceDetail", "proof_doc", `${P2} 추가 증빙에 서류가 포함됩니다.`);
  chip("04", "case04_evidenceDetail", "photo", `${P2} 추가 증빙에 사진·이미지가 포함됩니다.`);
  chip("04", "case04_evidenceDetail", "statement", `${P2} 추가 증빙에 설명·소명서가 포함됩니다.`);
  chip("04", "case04_evidenceDetail", "unsure", `${P2} 추가 증빙 범위가 아직 정리되지 않은 상태입니다.`);

  add(m, "04", "§03·2차", "case04_unclearFocus", "what_submit_list", `${P2} 제출 범위 자체가 가장 막힌 점으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_unclearFocus", "what_submit_apply", `${P2} 제출 항목의 적용 여부가 막힌 점으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_unclearFocus", "why_submit_reason", `${P2} 보완 사유 이해가 막힌 점으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_unclearFocus", "why_submit_apply", `${P2} 사유의 본인 해당 여부가 막힌 점으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_unclearFocus", "format_how", `${P2} 제출 형식이 막힌 점으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_unclearFocus", "format_where", `${P2} 제출 경로·채널이 막힌 점으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_unclearFocus", "what_submit", `${P2} 무엇을 제출해야 하는지가 막힌 점으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_unclearFocus", "why_submit", `${P2} 왜 제출해야 하는지가 막힌 점으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_unclearFocus", "format", `${P2} 어떤 형식으로 제출해야 하는지가 막힌 점으로 정리됩니다.`);

  add(m, "04", "§03·2차", "case04_repeatSupplement", "more_docs_new_kind", `${P2} 반복 보완에서 서류 종류가 확대된 것으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_repeatSupplement", "more_docs_same_kind", `${P2} 반복 보완에서 유사 서류가 다시 요구된 것으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_repeatSupplement", "more_modify_reject_prior", `${P2} 이미 수정한 항목을 다시 고치라는 요구로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_repeatSupplement", "more_modify_new_field", `${P2} 새 수정 항목이 추가된 요구로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_repeatSupplement", "more_docs", `${P2} 추가 서류를 다시 요구한 것으로 정리됩니다.`);
  add(m, "04", "§03·2차", "case04_repeatSupplement", "more_modify", `${P2} 수정·보완을 다시 요구한 것으로 정리됩니다.`);

  chip("05", "case05_evidence", "disposition_notice", `${P2} 처분 통지서를 확보한 상태로 정리됩니다.`);
  chip("05", "case05_evidence", "message_email", `${P2} 기관 연락·이메일을 확보한 상태로 정리됩니다.`);
  chip("05", "case05_evidence", "submitted_docs", `${P2} 제출 서류를 확보한 상태로 정리됩니다.`);
  chip("05", "case05_evidence", "payment_proof", `${P2} 납부·영수 증빙을 확보한 상태로 정리됩니다.`);
  chip("05", "case05_evidence", "photo_video", `${P2} 사진·영상을 확보한 상태로 정리됩니다.`);
  chip("05", "case05_evidence", "contract", `${P2} 계약·관계 서류를 확보한 상태로 정리됩니다.`);
  chip("05", "case05_evidence", "none", `${P2} 관련 자료가 없는 상태로 정리됩니다.`);
  chip("05", "case05_evidence", "unsure", `${P2} 확보 가능 자료가 아직 정리되지 않은 상태입니다.`);

  chip("05", "case05_submittedDocsDetail", "identity", `${P2} 제출 서류에 신분·인적 서류가 포함됩니다.`);
  chip("05", "case05_submittedDocsDetail", "financial", `${P2} 제출 서류에 재무·금액 서류가 포함됩니다.`);
  chip("05", "case05_submittedDocsDetail", "certificate", `${P2} 제출 서류에 증명서·확인서가 포함됩니다.`);
  chip("05", "case05_submittedDocsDetail", "unsure", `${P2} 제출 서류 종류가 아직 정리되지 않은 상태입니다.`);

  add(m, "05", "§03·2차", "case05_explanationDetail", "written_no_receipt", `${P2} 서면 소명은 했으나 접수 확인이 없는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_explanationDetail", "written_receipt_ok", `${P2} 서면 소명과 접수 확인이 있는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_explanationDetail", "verbal_no_record", `${P2} 구두 설명만 있고 기록이 없는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_explanationDetail", "verbal_with_record", `${P2} 구두 설명과 메모·기록이 있는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_explanationDetail", "both_unverified", `${P2} 서면·구두 병행이나 내용 대조가 안 된 상태입니다.`);
  add(m, "05", "§03·2차", "case05_explanationDetail", "both_aligned", `${P2} 서면·구두 내용이 일치한다고 보는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_explanationDetail", "written", `${P2} 서면으로 소명·의견을 제출한 경험이 있는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_explanationDetail", "verbal", `${P2} 전화·방문 등으로 설명한 경험이 있는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_explanationDetail", "both", `${P2} 서면과 구두 설명을 함께 한 경험이 있는 상태입니다.`);

  add(m, "05", "§03·2차", "case05_factDetail", "date_place_certain", `${P2} 시점·장소 차이에 확신이 있는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_factDetail", "date_place_fuzzy", `${P2} 시점·장소 차이가 있으나 불명확한 상태입니다.`);
  add(m, "05", "§03·2차", "case05_factDetail", "content_differs_clear", `${P2} 내용 차이가 정리된 상태입니다.`);
  add(m, "05", "§03·2차", "case05_factDetail", "content_differs_vague", `${P2} 내용 차이가 있으나 항목이 불명한 상태입니다.`);
  add(m, "05", "§03·2차", "case05_factDetail", "date_place", `${P2} 날짜·장소·상황이 다르다고 보는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_factDetail", "content_differs", `${P2} 내용·사실관계가 다르다고 보는 상태입니다.`);

  add(m, "05", "§03·2차", "case05_appealDetail", "filed_no_schedule", `${P2} 이의·재검토 신청 후 일정이 불명한 상태입니다.`);
  add(m, "05", "§03·2차", "case05_appealDetail", "filed_no_receipt", `${P2} 이의·재검토 신청 후 접수 확인이 없는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_appealDetail", "filed_schedule_known", `${P2} 이의·재검토 신청과 일정 인지가 있는 상태입니다.`);
  add(m, "05", "§03·2차", "case05_appealDetail", "preparing_deadline_unknown", `${P2} 신청 준비 중이며 기한 미확인 상태입니다.`);
  add(m, "05", "§03·2차", "case05_appealDetail", "preparing_deadline_known", `${P2} 신청 준비 중이며 기한을 확인한 상태입니다.`);
  add(m, "05", "§03·2차", "case05_appealDetail", "considering_rules_unread", `${P2} 신청 검토 중이며 요건·기한 미확인 상태입니다.`);
  add(m, "05", "§03·2차", "case05_appealDetail", "considering_rules_read", `${P2} 신청 검토 중이며 요건·기한을 읽은 상태입니다.`);
  add(m, "05", "§03·2차", "case05_appealDetail", "filed", `${P2} 이의제기·재검토를 신청한 상태입니다.`);
  add(m, "05", "§03·2차", "case05_appealDetail", "preparing", `${P2} 이의제기·재검토 신청을 준비 중인 상태입니다.`);
  add(m, "05", "§03·2차", "case05_appealDetail", "considering", `${P2} 이의제기·재검토 신청 여부를 검토 중인 상태입니다.`);

  return m;
}
