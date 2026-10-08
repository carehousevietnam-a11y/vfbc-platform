# RE04 거주 중 문제 — Content Pack (admin MASTER 밀도 기준)

- CASE: RE04 "거주 중 문제"
- Q1(공용, 확정) 선택지: "살고 있는 집의 수리·하자·관리비·이웃 문제로 상대방과 해결이 안 되고 있습니다."
- 구조: 1차 = Q1 + CASE 질문 4개 / 2차 = 노드 23개(조건부 후속 포함), 경로당 8~10문항 노출
- value 규칙: 모든 value는 질문별 접두사를 붙여 팩 전체에서 중복 없음(덮어쓰기 방지)
- 엔진 공용 "위에 내용이 없거나 설명이 필요합니다 → 직접 입력"은 모든 single/multi 질문에 자동으로 붙으므로 아래에 쓰지 않음

---

## 1차 (phase 1)

### re04_issue_type
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 상대방과 해결되지 않고 있는 문제는 어떤 것인가요?
- 선택지:
  - `it_repair_refused` — 누수·전기·에어컨·온수기 같은 설비가 고장 났는데, 상대방이 수리해 주지 않거나 계속 미루고 있습니다.
  - `it_prior_defect_blamed` — 입주하기 전부터 있던 하자인데, 상대방이 제가 망가뜨렸다며 수리비나 책임을 저에게 넘기고 있습니다.
  - `it_fee_dispute` — 관리비·전기·수도 요금의 금액이 이상하거나, 누가 내야 하는지를 두고 상대방과 다투고 있습니다.
  - `it_neighbor_management` — 이웃이나 관리사무소 문제로 생활이 어려운데, 집주인은 계약과 관계없다며 해결하지 않고 있습니다.
  - `it_landlord_entry` — 집주인이나 중개인이 미리 알리지 않고 집에 들어왔거나, 원할 때 들어오겠다고 요구하고 있습니다.

### re04_since_when
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 문제는 언제부터 이어지고 있나요?
- 선택지:
  - `sw_within_week` — 1주일 안쪽에 처음 생긴 문제이고, 아직 상대방에게 한두 번 말해 본 정도입니다.
  - `sw_within_month` — 몇 주 전부터 이어지고 있고, 여러 번 말했지만 아직 해결되지 않았습니다.
  - `sw_over_month` — 한 달 넘게 계속되고 있고, 그동안 생활의 불편이나 비용이 쌓이고 있습니다.
  - `sw_since_movein` — 입주할 때부터 있던 문제이고, 처음부터 계속 말해 왔지만 그대로입니다.
  - `sw_recurring` — 한 번 고쳤거나 정리되었는데, 얼마 지나지 않아 같은 문제가 다시 생겼습니다.

### re04_notify_status
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 문제를 상대방에게 어떻게 알리셨나요?
- 선택지:
  - `nt_not_told` — 아직 상대방에게 정식으로 알리지 않았고, 사진이나 기록만 모아 두었습니다.
  - `nt_verbal_only` — 전화하거나 직접 만나서 말로만 알렸고, 따로 남아 있는 기록은 없습니다.
  - `nt_message_sent` — 잘로(Zalo)·카카오톡·이메일 등 메시지로 알렸고, 보낸 기록이 날짜와 함께 남아 있습니다.
  - `nt_formal_request` — 문제 내용과 해결 기한을 적어, 서면이나 이메일로 정식으로 요청했습니다.
  - `nt_via_agent` — 중개인이나 관리사무소를 통해 전달했고, 상대방에게 직접 말하지는 않았습니다.

### re04_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `cg_who_responsible` — 이 문제를 고치거나 비용을 내야 하는 쪽이 누구인지, 계약서 기준으로 확인하고 싶습니다.
  - `cg_how_to_request` — 상대방에게 어떤 방법과 내용으로 요구해야 기록이 남고 효과가 있는지 확인하고 싶습니다.
  - `cg_self_repair_cost` — 제가 먼저 고치거나 낸 비용을, 월세나 보증금에서 정산받을 수 있는지 확인하고 싶습니다.
  - `cg_deposit_risk` — 이 문제 때문에 나중에 보증금을 돌려받지 못하거나, 계약이 끝날 위험이 있는지 확인하고 싶습니다.
  - `cg_order_unsure` — 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.

---

## 2차 (phase 2)

### A. 문제 유형별 상세 (re04_issue_type 값에 따라 1개만 노출)

### re04_repair_detail
- phase: 2 / kind: single / show_if: re04_issue_type = it_repair_refused
- 질문: 고장 난 곳은 어디이고, 지금 어떤 상태인가요?
- 선택지:
  - `rd_water_leak` — 천장·벽·배관에서 물이 새고 있고, 곰팡이나 가구 손상까지 생기고 있습니다.
  - `rd_electric_fault` — 차단기가 자주 내려가거나 콘센트·조명이 작동하지 않아, 감전이나 화재가 걱정됩니다.
  - `rd_aircon_heater` — 에어컨이나 온수기가 고장 나서, 냉방이나 온수를 전혀 쓰지 못하고 있습니다.
  - `rd_door_window` — 출입문 잠금장치나 창문·방범창이 고장 나, 문단속이 제대로 되지 않습니다.
  - `rd_included_appliance` — 계약에 포함된 냉장고·세탁기·가구가 고장 났고, 수리나 교체를 요청한 상태입니다.

### re04_defect_claim
- phase: 2 / kind: single / show_if: re04_issue_type = it_prior_defect_blamed
- 질문: 상대방은 어떤 하자를 제 책임이라고 말하고 있나요?
- 선택지:
  - `dc_surface_damage` — 벽·바닥·문에 원래 있던 흠집이나 얼룩을, 제가 살면서 생긴 것이라고 합니다.
  - `dc_equipment_breakdown` — 처음부터 상태가 좋지 않던 설비가 고장 나자, 제가 잘못 써서 망가졌다고 합니다.
  - `dc_mold_leak` — 입주 전부터 있던 누수나 곰팡이를, 제가 환기나 관리를 하지 않아 생겼다고 합니다.
  - `dc_missing_items` — 처음부터 없던 비품이나 물건을, 제가 사용하다가 잃어버렸다고 합니다.
  - `dc_deposit_deduction` — 이 하자 비용을 계약이 끝날 때 보증금에서 빼겠다고 이미 말했습니다.

### re04_fee_detail
- phase: 2 / kind: single / show_if: re04_issue_type = it_fee_dispute
- 질문: 어떤 요금이, 어떤 점에서 문제가 되고 있나요?
- 선택지:
  - `fd_electric_rate` — 전기요금이 전력회사 청구 금액보다 높은 단가로 계산되어 청구되고 있습니다.
  - `fd_payer_shift` — 계약상 집주인이 내기로 한 관리비나 요금을, 저에게 내라고 요구하고 있습니다.
  - `fd_unilateral_increase` — 계약 기간 중인데, 관리비나 요금 단가를 미리 합의 없이 올렸습니다.
  - `fd_prior_arrears` — 집주인이나 전 세입자가 밀린 요금 때문에, 전기·수도가 끊기거나 끊긴다는 안내를 받았습니다.
  - `fd_no_breakdown` — 매달 금액만 통보받고, 계량기 수치나 청구서 원본은 받지 못하고 있습니다.

### re04_neighbor_detail
- phase: 2 / kind: single / show_if: re04_issue_type = it_neighbor_management
- 질문: 이웃이나 관리사무소와 관련해 어떤 일이 이어지고 있나요?
- 선택지:
  - `nd_upstairs_leak` — 위층이나 옆집에서 물이 새어 들어오는데, 집주인과 그 집이 서로 책임을 미루고 있습니다.
  - `nd_noise_smell` — 이웃의 소음·담배 냄새·공사가 계속되는데, 관리사무소에 말해도 달라지지 않습니다.
  - `nd_management_restriction` — 관리사무소가 출입카드·주차·이사·택배 등을 막거나 제한하고 있습니다.
  - `nd_common_facility` — 엘리베이터·공용 배관·주차장 같은 공용 시설 고장으로, 생활에 계속 지장이 있습니다.
  - `nd_condition_mismatch` — 계약할 때 설명받은 건물 조건과 실제가 달라 집주인에게 말했지만, 건물 문제라며 관여하지 않습니다.

### re04_entry_detail
- phase: 2 / kind: single / show_if: re04_issue_type = it_landlord_entry
- 질문: 집주인이나 중개인의 출입은 어떻게 이루어졌나요?
- 선택지:
  - `ed_entered_absent` — 제가 없을 때 알리지 않고 들어왔고, 물건이 옮겨져 있거나 들어온 흔적이 남아 있었습니다.
  - `ed_entered_present` — 미리 연락 없이 찾아와, 제가 있는 상태에서 동의 없이 집 안으로 들어왔습니다.
  - `ed_viewing_demand` — 집을 팔거나 다음 세입자를 구한다며, 집을 보여 달라는 요구를 자주 하고 있습니다.
  - `ed_key_retained` — 집주인이 열쇠나 비밀번호를 그대로 가지고 있고, 제가 바꾸지 못하게 하고 있습니다.
  - `ed_unilateral_device` — 집 안이나 현관에 카메라를 달거나 잠금장치를 바꾸는 등, 저와 상의 없이 조치했습니다.

### B. 계약 조항 (근거)

### re04_contract_clause
- phase: 2 / kind: single / show_if: 항상
- 질문: 임대차 계약서에는 이 문제(수리·하자·관리비·요금·출입)에 대해 어떻게 적혀 있나요?
- 선택지:
  - `cl_landlord_clear` — 서면 계약서에, 이 문제는 집주인이 책임지거나 부담한다고 분명히 적혀 있습니다.
  - `cl_tenant_clear` — 서면 계약서에, 이 문제는 임차인이 부담한다고 적혀 있어 제가 불리할 수 있습니다.
  - `cl_vague` — 관련 조항은 있지만, '작은 수리'·'정상적인 사용'처럼 기준이 애매하게 적혀 있습니다.
  - `cl_absent` — 계약서는 있지만, 이 문제에 대한 내용은 없거나 아직 찾지 못했습니다.
  - `cl_cannot_check` — 계약서가 베트남어로만 되어 있거나 사본이 없어, 해당 조항을 직접 확인하지 못했습니다.

### re04_contract_access
- phase: 2 / kind: single / show_if: re04_contract_clause = cl_cannot_check
- 질문: 계약서 내용을 직접 확인하지 못하는 이유는 무엇인가요?
- 선택지:
  - `ca_vn_only` — 계약서는 가지고 있지만, 베트남어로만 되어 있어 조항을 읽지 못했습니다.
  - `ca_company_lease` — 회사 명의로 계약해서, 저는 실제로 사는 사람이지만 계약서는 회사 담당자만 가지고 있습니다.
  - `ca_no_copy` — 서명은 했지만 사본을 받지 못했고, 원본(공증본 포함)은 집주인이나 중개인만 가지고 있습니다.
  - `ca_verbal_only` — 정식 계약서 없이, 메시지나 말로만 월세와 조건을 정했습니다.
  - `ca_sublease` — 원래 임차인에게서 다시 빌린 집이라, 집주인과 맺은 계약서는 본 적이 없습니다.

### C. 상대방 반응 (요청 → 응답 루프)

### re04_not_told_reason
- phase: 2 / kind: single / show_if: re04_notify_status = nt_not_told
- 질문: 아직 상대방에게 정식으로 알리지 않은 이유는 무엇인가요?
- 선택지:
  - `ntr_fear_relation` — 관계가 나빠지거나 계약에 불이익이 생길까 봐, 말을 꺼내지 못하고 있습니다.
  - `ntr_who_to_contact` — 집주인·중개인·관리사무소 중 누구에게 말해야 하는지 몰라 미루고 있습니다.
  - `ntr_language` — 베트남어로 어떻게 설명하고 요구해야 할지 몰라, 아직 연락하지 못했습니다.
  - `ntr_collecting_first` — 먼저 사진과 자료를 모은 뒤, 한 번에 정리해서 알리려고 준비하고 있습니다.

### re04_other_response
- phase: 2 / kind: single / show_if: re04_notify_status = nt_verbal_only|nt_message_sent|nt_formal_request|nt_via_agent
- 질문: 알린 뒤, 상대방은 어떻게 반응했나요?
- 선택지:
  - `or_agreed_stalled` — 해결하겠다고 말은 했지만, 날짜를 정하지 않은 채 지금까지 그대로입니다.
  - `or_partial_offer` — 비용 일부만 부담하겠다거나, 제가 먼저 고치면 나중에 정산해 주겠다고 말로만 했습니다.
  - `or_refused_blame` — 자기 책임이 아니라며 거절했고, 오히려 저에게 비용이나 책임을 넘기고 있습니다.
  - `or_counter_threat` — 계속 문제 삼으면 계약을 끝내거나 보증금을 돌려주지 않겠다는 말을 했습니다.
  - `or_silent_or_relay` — 답이 없거나, 중개인·관리사무소가 전달했다고만 하고 상대방의 답은 듣지 못했습니다.

### re04_threat_detail
- phase: 2 / kind: single / show_if: re04_other_response = or_counter_threat
- 질문: 상대방은 구체적으로 무엇을 하겠다고 했나요?
- 선택지:
  - `td_vacate_early` — 계약 기간이 남았는데, 정해진 날까지 집을 비우라고 했습니다.
  - `td_keep_deposit` — 계약이 끝나면 보증금의 일부나 전부를 돌려주지 않겠다고 했습니다.
  - `td_raise_or_no_renew` — 다음 달부터 월세를 올리거나, 계약이 끝나면 재계약하지 않겠다고 했습니다.
  - `td_cut_utilities` — 전기·수도·인터넷을 끊거나, 출입카드를 막겠다고 했고 일부는 이미 실행했습니다.
  - `td_residence_registration` — 임시거주 신고를 해 주지 않거나, 이미 한 신고를 정리하겠다고 했습니다.

### re04_fact_compare
- phase: 2 / kind: single / show_if: re04_other_response = or_refused_blame|or_counter_threat
- 질문: 상대방이 주장하는 내용은 실제 있었던 일과 비교하면 어떤가요?
- 선택지:
  - `fc_mostly_true` — 상대방 말이 대체로 맞고, 저에게도 일부 책임이 있다고 생각합니다.
  - `fc_partly_true` — 일부는 맞지만, 원인이나 생긴 시점, 금액이 실제와 다르게 말하고 있습니다.
  - `fc_false_with_proof` — 상대방 주장은 실제와 크게 다르고, 이를 보여 줄 날짜 있는 기록이 있습니다.
  - `fc_false_no_proof` — 상대방 주장은 실제와 다르지만, 이를 보여 줄 기록이 부족합니다.
  - `fc_no_specific_claim` — 상대방이 구체적인 이유 없이 거절만 하고 있어, 비교할 내용이 없습니다.

### D. 유형별 근거·비용·영향

### re04_handover_record
- phase: 2 / kind: single / show_if: re04_issue_type = it_prior_defect_blamed
- 질문: 입주할 때 집 상태는 어떻게 기록해 두셨나요?
- 선택지:
  - `hr_signed_checklist` — 집 상태와 비품을 적은 인수인계서(체크리스트)에 저와 상대방이 함께 서명했습니다.
  - `hr_dated_photos_only` — 서명한 문서는 없지만, 입주하던 날 찍은 날짜 있는 사진·영상이 남아 있습니다.
  - `hr_item_list_only` — 비품 목록은 계약서에 있지만, 하자나 상태에 대해서는 적혀 있지 않습니다.
  - `hr_told_verbally` — 입주할 때 하자를 말로만 알렸고, 따로 남긴 기록은 없습니다.
  - `hr_no_record` — 입주할 때 집 상태를 따로 기록하거나 확인하지 않았습니다.

### re04_self_repair
- phase: 2 / kind: single / show_if: re04_issue_type = it_repair_refused
- 질문: 문제를 해결하려고 직접 비용을 쓴 적이 있나요?
- 선택지:
  - `sr_paid_with_receipt` — 제가 먼저 수리업체를 불러 고쳤고, 영수증이나 송금 내역이 남아 있습니다.
  - `sr_paid_no_receipt` — 제가 먼저 고쳤지만, 현금으로 줘서 영수증은 받지 못했습니다.
  - `sr_paid_no_consent` — 상대방의 동의 없이 고쳤고, 상대방은 그 비용을 인정하지 않고 있습니다.
  - `sr_quote_only` — 아직 고치지 않았고, 수리업체에서 견적만 받아 두었습니다.
  - `sr_not_spent` — 아직 제가 직접 쓴 비용은 없고, 상대방이 고쳐 주기를 기다리고 있습니다.

### re04_self_repair_amount
- phase: 2 / kind: text / show_if: re04_self_repair = sr_paid_with_receipt|sr_paid_no_receipt|sr_paid_no_consent|sr_quote_only
- 질문: 지금까지 쓴 비용이나 받은 견적의 날짜·금액·내역을 적어 주세요.
- placeholder: 예: 2026-09-12 욕실 배관 누수 수리 1,500,000동(영수증 있음) / 곰팡이 제거 견적 800,000동, 집주인에게 잘로로 사진과 함께 보냄

### re04_fee_amount
- phase: 2 / kind: text / show_if: re04_issue_type = it_fee_dispute
- 질문: 문제가 되는 요금의 이름과 청구된 금액, 계약서에 적힌 기준을 적어 주세요.
- placeholder: 예: 전기요금 kWh당 4,000동으로 계산되어 9월분 2,800,000동 청구됨 / 계약서에는 '전력회사 청구 금액 기준'이라고 적혀 있음

### re04_living_impact
- phase: 2 / kind: single / show_if: re04_issue_type = it_neighbor_management|it_landlord_entry
- 질문: 이 문제가 지금 생활에 어느 정도 영향을 주고 있나요?
- 선택지:
  - `li_minor` — 불편하지만, 지금 생활하는 데 큰 지장은 없습니다.
  - `li_partial_use` — 방이나 욕실·주방 일부를 쓰지 못하거나, 집에 있는 시간을 줄일 정도로 생활이 바뀌었습니다.
  - `li_safety_privacy` — 안전이나 사생활이 걱정되어, 혼자 있거나 물건을 두고 나가기가 불안합니다.
  - `li_belongings_damaged` — 제 가구·전자제품·옷 같은 물건이 손상되었거나, 없어진 것이 있습니다.
  - `li_staying_elsewhere` — 계속 살기 어려워, 임시로 다른 곳에 머물고 있거나 이사를 고민하고 있습니다.

### E. 월세 보류 위험

### re04_rent_status
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 문제가 생긴 뒤, 월세와 요금은 어떻게 내고 있나요?
- 선택지:
  - `rs_paying_normal` — 문제와 별개로, 월세와 요금은 계약대로 계속 내고 있습니다.
  - `rs_withholding` — 상대방이 해결할 때까지, 월세나 요금의 일부 또는 전부를 내지 않고 있습니다.
  - `rs_deducted_cost` — 제가 쓴 수리비나 잘못 청구된 금액을 빼고, 남은 금액만 월세로 보냈습니다.
  - `rs_considering_withhold` — 아직 내고 있지만, 해결되지 않으면 월세를 멈추려고 생각하고 있습니다.
  - `rs_payment_refused` — 상대방이 제 송금을 받지 않거나, 계약과 다른 금액을 내라고 요구하고 있습니다.

### re04_withhold_notice
- phase: 2 / kind: single / show_if: re04_rent_status = rs_withholding|rs_deducted_cost
- 질문: 월세를 멈추거나 금액을 뺀 사실을 상대방에게 어떻게 알리셨나요?
- 선택지:
  - `wn_agreed_in_writing` — 상대방과 미리 합의했고, 그 합의가 메시지나 서면으로 남아 있습니다.
  - `wn_notified_no_consent` — 이유와 금액을 메시지로 알렸지만, 상대방은 동의하지 않았거나 답이 없습니다.
  - `wn_not_notified` — 따로 알리지 않고, 월세만 덜 보내거나 보내지 않았습니다.
  - `wn_landlord_objected` — 상대방이 이를 연체라고 하며, 계약 해지나 보증금 공제를 언급했습니다.

### F. 기한

### re04_deadline
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 문제와 관련해 정해진 날짜나 다가오는 기한이 있나요?
- 선택지:
  - `dl_promised_date` — 상대방이 수리하거나 정산하겠다고 약속한 날짜가 있고, 그 약속이 기록으로 남아 있습니다.
  - `dl_utility_cutoff` — 요금을 정리하지 않으면 전기·수도가 끊긴다고 안내받은 날짜가 있습니다.
  - `dl_contract_end` — 계약 만료일이 다가오고 있어, 그 전에 이 문제와 보증금 정산을 정리해야 합니다.
  - `dl_vacate_demand` — 상대방이 정한 날짜까지 집을 비우라고 요구하고 있습니다.
  - `dl_none` — 정해진 날짜는 없지만, 시간이 지날수록 문제가 커지고 있습니다.

### re04_deadline_date
- phase: 2 / kind: text / show_if: re04_deadline = dl_promised_date|dl_utility_cutoff|dl_contract_end|dl_vacate_demand
- 질문: 그 날짜와, 그날까지 무엇을 해야 하는지 적어 주세요.
- placeholder: 예: 2026-10-20까지 집주인이 에어컨을 고쳐 주기로 잘로로 약속함 / 계약 만료일 2026-11-30

### G. 자료·막힌 이유·최종 목표

### re04_evidence
- phase: 2 / kind: multi / show_if: 항상
- 질문: 현재 보관하고 있어 바로 확인할 수 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `ev_dated_photos` — 문제 상태를 찍은 날짜 있는 사진·영상(입주 당시 사진 포함)
  - `ev_messages` — 상대방·중개인·관리사무소와 주고받은 잘로·카카오톡·이메일 메시지
  - `ev_receipts_bills` — 수리비 영수증, 관리비·전기·수도 청구서, 송금 내역
  - `ev_contract_handover` — 임대차 계약서와 인수인계서(비품·상태 목록) 사본
  - `ev_none` — 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.

### re04_blockage
- phase: 2 / kind: single / show_if: 항상
- 질문: 현재 이 문제가 해결되지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `bk_responsibility_unclear` — 누가 고치거나 비용을 내야 하는지 기준이 분명하지 않아, 서로 미루고만 있습니다.
  - `bk_no_proof` — 입주 당시 상태나 문제가 생긴 시점을 보여 줄 기록이 부족해, 제 주장을 뒷받침하지 못하고 있습니다.
  - `bk_contact_blocked` — 상대방과 연락이 잘 닿지 않거나, 중개인·관리사무소가 중간에서 말을 제대로 전하지 않습니다.
  - `bk_fear_retaliation` — 강하게 요구하면 계약 해지나 보증금 문제가 생길까 봐, 요구를 망설이고 있습니다.
  - `bk_language_barrier` — 계약서나 상대방의 답변이 베트남어라, 정확히 이해하거나 제 입장을 설명하지 못하고 있습니다.

### re04_final_goal
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `fg_repair_and_stay` — 상대방이 비용을 부담해 수리를 마치게 하고, 계약 기간 동안 계속 살고 싶습니다.
  - `fg_cost_settled` — 제가 쓴 비용이나 잘못 청구된 요금을 정산받고, 그 결과를 기록으로 남기고 싶습니다.
  - `fg_deposit_protected` — 이 문제가 나중에 보증금 공제나 하자 책임으로 이어지지 않도록 지금 정리해 두고 싶습니다.
  - `fg_rules_in_writing` — 수리 방법·요금 기준·출입 방법을 상대방과 서면으로 다시 합의하고 싶습니다.
  - `fg_exit_with_deposit` — 더 이상 살기 어려워, 보증금을 돌려받고 계약을 정리한 뒤 나가고 싶습니다.

---

## 결과 신호

### 위험 신호 선택지와 결과 화면 문장

| 선택지 | 결과 화면 위험 문장 | 판정 단계 |
|---|---|---|
| `re04_notify_status = nt_verbal_only` | 지금까지 말로만 알려, 언제 무엇을 요청했는지 보여 줄 기록이 없습니다. | 확인 필요 |
| `re04_notify_status = nt_via_agent` / `re04_other_response = or_silent_or_relay` | 중개인이나 관리사무소를 거친 요청은 상대방에게 실제로 전달되었는지 확인되지 않습니다. | 확인 필요 |
| `re04_since_when = sw_over_month` / `sw_recurring` | 문제가 오래 이어지거나 반복되고 있어, 손상과 비용이 더 커지기 전에 요청 기록을 정리해야 합니다. | 주의 |
| `re04_repair_detail = rd_electric_fault` / `rd_door_window` | 전기·문단속 문제는 안전과 직결되므로, 수리 책임을 따지기 전에 위험부터 막을 방법을 확인해야 합니다. | 주의 |
| `re04_defect_claim = dc_deposit_deduction` | 상대방이 이미 보증금 공제를 예고해, 계약 종료 전에 하자 책임을 정리하지 않으면 정산 때 다툼이 커질 수 있습니다. | 주의 |
| `re04_handover_record = hr_told_verbally` / `hr_no_record` | 입주 당시 상태 기록이 없어, 기존 하자였다는 점을 다른 자료로 보완해야 합니다. | 주의 |
| `re04_contract_clause = cl_tenant_clear` | 계약서에 임차인 부담으로 적혀 있어, 해당 조항이 이번 문제에 그대로 적용되는지 확인이 필요합니다. | 확인 필요 |
| `re04_contract_access = ca_verbal_only` / `ca_no_copy` | 계약 내용을 서면으로 확인할 수 없어, 메시지와 송금 내역으로 계약 조건을 다시 정리해야 합니다. | 주의 |
| `re04_contract_access = ca_sublease` | 집주인과 직접 계약하지 않은 재임대 관계라, 누구에게 책임을 물을 수 있는지 먼저 정리해야 합니다. | 전문가 권장 |
| `re04_fee_detail = fd_electric_rate` / `fd_unilateral_increase` | 청구된 단가나 인상분이 계약서 기준과 맞는지, 근거 자료로 비교해 봐야 합니다. | 확인 필요 |
| `re04_fee_detail = fd_prior_arrears` / `re04_threat_detail = td_cut_utilities` | 전기·수도가 끊기면 생활이 바로 막히므로, 끊기기 전에 대응 순서를 정해야 합니다. | 전문가 권장 |
| `re04_self_repair = sr_paid_no_receipt` / `sr_paid_no_consent` | 영수증이나 사전 동의가 없는 수리비는 정산을 요구할 때 근거가 약해질 수 있습니다. | 주의 |
| `re04_rent_status = rs_withholding` / `rs_deducted_cost` | 계약 근거나 합의 없이 월세를 멈추거나 빼면, 상대방이 연체를 이유로 계약 해지나 보증금 공제를 주장할 수 있습니다. | 전문가 권장 |
| `re04_rent_status = rs_considering_withhold` | 월세를 멈추기 전에, 계약서와 요청 기록으로 정산 방법을 먼저 확인하는 것이 안전합니다. | 주의 |
| `re04_withhold_notice = wn_not_notified` / `wn_landlord_objected` | 월세를 덜 보낸 이유가 기록으로 남아 있지 않아, 단순 연체로 받아들여질 수 있습니다. | 전문가 권장 |
| `re04_other_response = or_counter_threat` | 상대방이 계약 해지나 보증금을 언급하고 있어, 대응 문장과 순서를 신중하게 정해야 합니다. | 주의 |
| `re04_threat_detail = td_vacate_early` / `re04_deadline = dl_vacate_demand` | 계약 기간 중 집을 비우라는 요구는 계약서의 해지 조항과 함께 확인해야 하며, 날짜 전에 대응해야 합니다. | 전문가 권장 |
| `re04_threat_detail = td_residence_registration` | 임시거주 신고는 체류와 연결되므로, 상대방이 신고를 거부하거나 정리하기 전에 확인이 필요합니다. | 전문가 권장 |
| `re04_entry_detail = ed_entered_absent` / `ed_unilateral_device` | 동의 없는 출입이나 장치 설치가 반복되면, 날짜별 기록을 남기고 출입 규칙을 서면으로 정해야 합니다. | 주의 |
| `re04_living_impact = li_belongings_damaged` | 제 물건의 손상은 수리 책임과 별도로 금액과 사진을 정리해 두어야 합니다. | 확인 필요 |
| `re04_living_impact = li_staying_elsewhere` | 집을 떠나 있는 동안의 월세와 비용 부담은 계약 정리 방법과 함께 확인해야 합니다. | 주의 |
| `re04_fact_compare = fc_false_no_proof` / `re04_evidence = ev_none` | 상대방 주장과 다르다는 점을 보여 줄 자료가 부족해, 지금 남길 수 있는 기록부터 확보해야 합니다. | 주의 |

### 특수 사건 표시 (퍼널 진행 대신 "VFBCAI 전문가팀 진행" 안내)
- 직접 입력 등에서 이미 소송·조정이 진행 중이라고 확인된 경우
- `re04_entry_detail = ed_entered_absent` 이면서 `re04_living_impact = li_belongings_damaged`(물건이 없어짐·손상) — 형사 문제로 이어질 수 있는 출입
- `re04_contract_access = ca_sublease`, 또는 `re04_neighbor_detail = nd_upstairs_leak`처럼 집주인·이웃 세대 등 당사자가 여럿인 경우
- `re04_threat_detail = td_cut_utilities`로 전기·수도가 이미 끊긴 경우

### 1차 결과 §03 소제목 [대표 승인 2026-10-07, C1.21]
- firstResultCautionsSectionSubtitle: `| 하자·관리 대응 핵심 포인트`

### 1차 판정 하한 [대표 승인 2026-10-07, C1.22]
- firstResultVerdictFloor: true
- 계약 이후 거주·하자 문제 서비스: 1차 판정 최소 주의 요망(2단계). Pack 합산이 더 높은 단계면 유지.

### 1차 결과 §03 위험 0건 + 판정 하한 [대표 승인 2026-10-07, C1.25]
- firstResultNoRiskFloorTitle: `먼저 확인할 사항`
- firstResultNoRiskFloorBody: `문제가 된 부분의 사진·메시지·수리 요청 기록을 날짜순으로 모아 두세요. 누가 언제 무엇을 요청했는지가 핵심입니다.`

### 1차 판정 상향 (phase1 주의 헤드라인) [대표 승인 2026-10-07, C1.21]
다음 phase1 선택값이 하나라도 있으면 1차 헤드라인·등급·02 카드 톤을 주의 단계로 올린다(그 외 조합은 변경 없음).
- `it_repair_refused`
- `it_prior_defect_blamed`
- `sw_over_month`

### 1차 결과 "핵심 확인 결과" 3칸 문장 규칙
- 상황: `re04_issue_type` + `re04_since_when`를 한 문장으로 연결한다. 형식: "[문제 유형 요약]이 [기간] 이어지고 있습니다." 예: "누수 수리를 집주인이 미루는 상황이 한 달 넘게 이어지고 있습니다." 법적 책임 판단은 쓰지 않는다.
- 확인 목표: `re04_confirm_goal`을 "~인지 확인합니다"로 바꾼다. 예: `cg_self_repair_cost` → "먼저 쓴 수리비를 월세나 보증금에서 정산받을 수 있는지 확인합니다."
- 대응·자료: `re04_notify_status`로 지금 남아 있는 요청 기록의 수준을 쓰고, 다음에 남길 기록 한 가지를 붙인다. [대표 승인 2026-10-07, C1.21]
  - `nt_not_told` → "아직 정식 요청 기록이 없으므로, 문제 사진과 날짜를 붙인 메시지로 먼저 요청해 기록을 남기는 것이 우선입니다."
  - `nt_verbal_only` → "말로만 알린 상태이므로, 날짜와 사진을 붙인 메시지로 다시 요청해 기록을 남기는 것이 먼저입니다."
  - `nt_message_sent` → "메시지 요청 기록이 있으므로, 상대방의 답변과 약속 날짜를 함께 정리하세요."
  - `nt_formal_request` → "서면 요청 기록이 있으므로, 상대방의 답변과 약속 날짜를 함께 정리합니다."
  - `nt_via_agent` → "중개인이나 관리사무소를 거친 요청은 전달 여부가 확인되지 않으므로, 상대방에게 직접 메시지로 다시 요청해 기록을 남기세요."

### "지금 확인해 보세요" STEP 3개
1. STEP 1 — 날짜 있는 기록 모으기: 문제 상태 사진·영상, 입주 당시 사진, 상대방과 주고받은 메시지를 날짜 순서로 한곳에 모아 주세요.
2. STEP 2 — 계약서 조항 찾기: 계약서에서 수리·관리비·요금·출입·보증금 반환과 관련된 조항을 찾아 표시하고, 베트남어라면 해당 부분만 따로 사진으로 남겨 주세요.
3. STEP 3 — 월세는 그대로, 요청은 서면으로: 정산 방법이 확인되기 전까지 월세는 계약대로 보내고, 문제 내용·요청 사항·해결 희망 날짜를 적은 메시지를 상대방에게 직접 보내 기록을 남겨 주세요.

---

### 2차 F-path fallback (C2.1 초안)
- phase2FallbackChain: `re04_repair_request,re04_final_goal`

### 2차 개인화 결과 문구 (C2.3 초안)
- personalizedStageLabel: `거주 중 문제 2차 종합 검토`
- personalizedIntegratedOk: `거주 중 이슈와 2차에서 추가로 확인한 조치 조건을 함께 정리했습니다.`
- personalizedIntegratedCaution: `1차·2차 답변을 바탕으로, 수리·관리·이웃 이슈를 직접 확인할 부분이 남아 있습니다.`
- personalizedPhase2Empty: `2차 답변만으로 새로 드러난 위험 신호는 현재 보이지 않습니다.`
- personalizedDocumentsNeededNote: `사진·대화·관리비 내역 등 원본을 대조하면 조치 범위를 넓힐 수 있습니다.`
- personalizedCoreJudgmentOk: `현재까지 답변으로는 거주 중 대응 범위에서 큰 불일치가 보이지 않습니다.`
- personalizedCoreJudgmentCaution: `조치 요청·상대방 반응은 추가 확인이 필요한 상태입니다.`
- personalizedCoreJudgmentExpert: `복합 거주 이슈가 겹쳐 VFBCAI 전문가팀 확인이 필요한 단계입니다.`
- personalizedPhase2MaintainedSummary: `2차 답변에서는 1차보다 더 나쁜 사정은 확인되지 않았고, 1차에서 확인된 {phase1Core} 상태가 그대로 유지됩니다.`
- personalizedPhase2ElevatedSummary: `1차에서 {phase1Core} 또한 2차에서는 {phase2Fact}`
- personalizedHeadlineMaintained: `1차에서 확인된 주의 사항이 유지되는 상태입니다`
- personalizedHeadlineElevated: `2차 답변으로 거주 중 조치 쪽 추가 확인이 필요합니다`
- personalizedHeadlineOk: `현재 확인한 범위에서는 큰 문제가 보이지 않습니다`
- personalizedPhase2Fact: `re04_final_goal=fg_repair_and_stay|2차에서는 수리를 마치고 계속 거주하는 것이 목표로 확인되었습니다.`
- personalizedPhase2Fact: `re04_issue_type=it_repair_refused|2차에서는 설비 수리 거부·지연 문제로 좁혀 확인되었습니다.`

### 2차 개인화 요약 구조 (C2.3c 초안)
- personalizedPhase2MaintainedSentence2: `2차 답변에서도 이보다 나빠진 사정은 확인되지 않아, 1차 판정이 유지됩니다.`
- personalizedPhase2ElevatedSentence2: `2차 답변에서 {fact2}이 확인되어, 추가 확인이 필요한 부분이 더 늘었습니다.`
- personalizedPhase2Fact2: `re04_contract_access=ca_sublease|집주인과 직접 맺지 않은 재임대로 거주하는 상황이라는 점`
- personalizedPhase2Fact2: `re04_fee_detail=fd_prior_arrears|전기·수도가 밀려 끊기거나 끊긴다는 안내를 받았다는 점`
- personalizedPhase2Fact2: `re04_threat_detail=td_cut_utilities|전기·수도·출입을 끊거나 막겠다고 했다는 점`
- personalizedPhase2Fact2: `re04_rent_status=rs_withholding|월세나 요금 일부·전부를 내지 않고 있다는 점`
- personalizedPhase2Fact2: `re04_rent_status=rs_deducted_cost|수리비 등을 빼고 남은 금액만 월세로 보냈다는 점`
- personalizedPhase2Fact2: `re04_withhold_notice=wn_not_notified|알리지 않고 월세를 덜 보냈다는 점`
- personalizedPhase2Fact2: `re04_withhold_notice=wn_landlord_objected|월세 삭감에 상대방이 해지·공제를 언급했다는 점`
- personalizedPhase2Fact2: `re04_threat_detail=td_vacate_early|계약 기간 중 집을 비우라는 요구를 받았다는 점`
- personalizedPhase2Fact2: `re04_deadline=dl_vacate_demand|상대방이 정한 날까지 집을 비우라는 요구를 받았다는 점`
- personalizedPhase2Fact2: `re04_threat_detail=td_residence_registration|임시거주 신고를 거부하거나 정리하겠다고 했다는 점`
- personalizedPhase2Fact2: `re04_since_when=sw_over_month|같은 문제가 한 달 넘게 이어지고 있다는 점`
- personalizedPhase2Fact2: `re04_since_when=sw_recurring|고쳤으나 같은 문제가 다시 생겼다는 점`
- personalizedPhase2Fact2: `re04_repair_detail=rd_electric_fault|전기·조명이 불안정해 생활이 어렵다는 점`
- personalizedPhase2Fact2: `re04_repair_detail=rd_door_window|문·창문 잠금이 고장 나 출입이 불안하다는 점`
- personalizedPhase2Fact2: `re04_defect_claim=dc_deposit_deduction|하자 비용을 보증금에서 빼겠다고 이미 말했다는 점`
- personalizedPhase2Fact2: `re04_handover_record=hr_told_verbally|입주 때 하자를 말로만 알렸고 기록이 없다는 점`
- personalizedPhase2Fact2: `re04_handover_record=hr_no_record|입주 때 집 상태를 따로 기록하지 않았다는 점`
- personalizedPhase2Fact2: `re04_contract_access=ca_verbal_only|정식 계약서 없이 말·메시지로만 조건을 정했다는 점`
- personalizedPhase2Fact2: `re04_contract_access=ca_no_copy|서명했으나 계약 사본을 받지 못했다는 점`
- personalizedPhase2Fact2: `re04_self_repair=sr_paid_no_receipt|먼저 수리했으나 영수증을 받지 못했다는 점`
- personalizedPhase2Fact2: `re04_self_repair=sr_paid_no_consent|동의 없이 수리했고 비용을 인정받지 못했다는 점`
- personalizedPhase2Fact2: `re04_rent_status=rs_considering_withhold|월세 지급을 멈추려는 상황이라는 점`
- personalizedPhase2Fact2: `re04_other_response=or_counter_threat|문제 제기에 계약 종료·보증금 미반환을 언급했다는 점`
- personalizedPhase2Fact2: `re04_entry_detail=ed_entered_absent|부재 중 무단 출입 흔적이 있다는 점`
- personalizedPhase2Fact2: `re04_entry_detail=ed_unilateral_device|상의 없이 잠금·카메라 등을 설치했다는 점`
- personalizedPhase2Fact2: `re04_living_impact=li_staying_elsewhere|집에 살기 어려워 다른 곳에 머물고 있다는 점`
- personalizedPhase2Fact2: `re04_fact_compare=fc_false_no_proof|상대 주장과 다르지만 입증 자료가 부족하다는 점`
- personalizedPhase2Fact2: `re04_evidence=ev_none|문제를 보여 줄 자료가 없거나 아직 모은 상태라는 점`
- personalizedPhase2Fact2: `re04_notify_status=nt_verbal_only|전화·대면으로만 알렸고 남은 기록이 없다는 점`
- personalizedPhase2Fact2: `re04_notify_status=nt_via_agent|중개인·관리실을 통해 전달했고 직접 말하지 않았다는 점`
- personalizedPhase2Fact2: `re04_other_response=or_silent_or_relay|답이 없거나 전달만 되고 상대 답은 없다는 점`
- personalizedPhase2Fact2: `re04_contract_clause=cl_tenant_clear|계약서에 임차인 단독 부담으로 적혀 있다는 점`
- personalizedPhase2Fact2: `re04_fee_detail=fd_electric_rate|전기요금이 단가가 높게 청구되고 있다는 점`
- personalizedPhase2Fact2: `re04_fee_detail=fd_unilateral_increase|관리비·요금이 합의 없이 올랐다는 점`
- personalizedPhase2Fact2: `re04_living_impact=li_belongings_damaged|가구·물건이 손상되었거나 없어졌다는 점`

### 2차 자료 제출 체크리스트 (승인됨 2026-10-07)
- phase2DocumentRequired: `문제 부분 사진·영상`
- phase2DocumentRequired: `수리 요청·응답 메시지 기록`
- phase2DocumentOptional: `입주·퇴거 상태 확인 자료`
- phase2DocumentExampleTag: `사진`
- phase2DocumentExampleTag: `메시지`

## 노드 수
- 1차: Q1(공용) + CASE 4개 = 5
- 2차: 23개 (항상 노출 6, 유형별 1개 노출 5, 조건부 후속 12)
