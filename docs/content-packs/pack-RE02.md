# RE02 보증금·계약금 분쟁 — Content Pack (admin MASTER case02 밀도 기준)

- 구조 견본: admin-CASE_02(돈 지급 요구) — 1차 3~4문항 + 2차 사실 추적(금액/금액 상세 입력/근거/경로/상대방 반응/처리 사실/기한+날짜 입력/실제와 비교/막힌 이유/최종 목표).
- value 규칙: 영어 snake_case, 질문별 고유 접두사(role_, dt_, hd_, end_, cg_, amt_, ded_, fc_, xc_, ho_, or_, me_, cf_, cp_, pp_, bh_, dm_, rx_, sm_, dl_, bk_, fg_). 질문 간 value 중복 없음.
- show_if 표기: `질문id = v1|v2` (그중 하나), `AND` / `OR` 결합, `≠`는 해당 값이 아닌 경우(응답이 있을 때).
- 엔진 공용 "위에 내용이 없거나 설명이 필요합니다 → 직접 입력"은 모든 single/multi 질문에 자동 부착(아래에는 적지 않음).

---

## 노드 표

### 0. 공용 Q1 (확정, 수정 금지)
- 선택된 옵션: "보증금이나 계약금을 돌려받지 못했거나, 돈 문제로 상대방과 다투고 있습니다." → RE02 진입

---

### 1차 (phase 1) — 경로당 Q1 + 4문항

#### re02_role
- phase: 1 / kind: single / show_if: 항상
- 질문: 이번 계약에서 어떤 입장이셨나요?
- 선택지:
  - `role_tenant` — 집을 빌려 살았던 세입자이고, 집주인에게 보증금을 맡겨 두었습니다.
  - `role_company_occupant` — 계약은 회사 명의로 했고, 저는 그 집에 실제로 살았던 사람입니다.
  - `role_landlord` — 집을 빌려준 집주인이고, 세입자에게 보증금을 받아 보관하고 있었습니다.
  - `role_buyer` — 집을 사려던 매수인이고, 매도인에게 계약금(đặt cọc)을 보냈습니다.
  - `role_seller` — 집을 팔려던 매도인이고, 매수인에게 계약금(đặt cọc)을 받았습니다.

#### re02_dispute_type
- phase: 1 / kind: single / show_if: `re02_role = role_tenant|role_company_occupant|role_buyer`
- 질문: 돈 문제는 지금 어떤 상황인가요?
- 선택지:
  - `dt_not_returned` — 계약이 끝났거나 끝내기로 했는데, 맡긴 보증금이나 계약금을 아직 전혀 돌려받지 못했습니다.
  - `dt_partial_deduction` — 일부는 돌려받았지만, 수리비·청소비 등을 이유로 상당한 금액이 공제되었습니다.
  - `dt_deposit_forfeited` — 계약이 진행되지 않자, 상대방이 계약금을 모두 가져가겠다고 하고 있습니다.
  - `dt_extra_claim` — 돌려받기는커녕, 위약금이나 추가 금액을 더 내라는 요구를 받고 있습니다.
  - `dt_contact_avoided` — 돌려주겠다는 말은 들었지만, 그 뒤로 상대방이 연락을 피하거나 답이 없습니다.

#### re02_dispute_type_holder
- phase: 1 / kind: single / show_if: `re02_role = role_landlord|role_seller`
- 질문: 상대방과는 어떤 돈 문제로 다투고 있나요?
- 선택지:
  - `hd_deduct_dispute` — 손상이나 밀린 금액을 공제하고 돌려주려 했는데, 상대방은 전액을 돌려달라고 요구하고 있습니다.
  - `hd_forfeit_dispute` — 상대방이 계약을 포기해 계약금을 돌려주지 않으려 하는데, 상대방은 돌려달라고 요구하고 있습니다.
  - `hd_double_demand` — 제 사정으로 계약을 진행하지 못하게 되자, 상대방이 계약금의 두 배를 돌려달라고 요구하고 있습니다.
  - `hd_extra_claim` — 손해나 밀린 금액이 보증금보다 커서 차액을 요구했지만, 상대방이 지급하지 않고 있습니다.
  - `hd_contact_lost` — 상대방이 밀린 금액을 남긴 채 집을 비웠거나, 연락을 끊었습니다.

#### re02_contract_end
- phase: 1 / kind: single / show_if: 항상
- 질문: 계약은 어떻게 끝났나요?
- 선택지:
  - `end_expired` — 계약서에 정한 기간(임대 기간이나 본계약 체결 기한)이 지나, 계약이 그대로 종료되었습니다.
  - `end_me_with_notice` — 제가 먼저 계약을 끝냈고, 계약서에 정한 기간만큼 미리 알렸습니다.
  - `end_me_short_notice` — 제가 먼저 계약을 끝냈지만, 미리 알린 기간이 계약서보다 짧았거나 따로 알리지 못했습니다.
  - `end_other_first` — 상대방이 먼저 계약을 끝내자고 했거나, 상대방이 계약을 지키지 않아 끝나게 되었습니다.
  - `end_not_ended` — 계약은 아직 끝나지 않았지만, 돈 문제로 이미 다툼이 생겼습니다.

#### re02_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `cg_entitlement` — 이 돈을 돌려받을 수 있는지(또는 돌려주어야 하는지), 계약서와 실제 사정을 기준으로 확인하고 싶습니다.
  - `cg_amount_check` — 공제되거나 요구받은 금액이 어떻게 계산되었는지, 그 금액이 맞는지 확인하고 싶습니다.
  - `cg_forfeit_rule` — 계약금을 돌려주지 않거나 두 배로 돌려달라는 주장이 계약서 조항에 맞는지 확인하고 싶습니다.
  - `cg_how_to_demand` — 상대방에게 언제, 어떤 방법으로 정식 요구를 해야 하는지 확인하고 싶습니다.
  - `cg_unsure` — 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.

---

### 2차 (phase 2) — 사실 추적

#### re02_amount_state
- phase: 2 / kind: single / show_if: 항상
- 질문: 다툼이 되는 금액은 어떻게 정리되어 있나요?
- 선택지:
  - `amt_clear` — 계약서 금액과 실제로 주고받은 금액이 같고, 다툼이 되는 금액도 분명합니다.
  - `amt_differs` — 금액은 알고 있지만, 제가 아는 금액과 상대방이 말하는 금액이 서로 다릅니다.
  - `amt_partial_settled` — 일부는 이미 돌려받았거나 돌려주었고, 남은 금액을 두고 다투고 있습니다.
  - `amt_currency_mixed` — 동(VND)과 달러 등으로 나눠 주고받아, 정확한 금액을 아직 정리하지 못했습니다.
  - `amt_unknown` — 정확한 금액이 기억나지 않고, 금액을 확인할 기록도 찾지 못했습니다.

#### re02_amount_detail
- phase: 2 / kind: text / show_if: `re02_amount_state = amt_clear|amt_differs|amt_partial_settled|amt_currency_mixed`
- 질문: 주고받은 금액과 다툼이 되는 금액을 입력해 주세요.
- placeholder: 예: 보증금 2개월치 30,000,000동을 송금했고, 15,000,000동만 돌려받았습니다. 상대방은 수리비로 15,000,000동을 공제했다고 합니다.

#### re02_deduction_items
- phase: 2 / kind: multi / show_if: `re02_dispute_type = dt_partial_deduction OR re02_dispute_type_holder = hd_deduct_dispute`
- 질문: 공제되었거나 공제하려는 항목을 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `ded_repair_restore` — 벽·바닥·가구·가전 수리비나 원래 상태로 되돌리는 비용
  - `ded_cleaning_paint` — 청소비나 페인트 비용
  - `ded_unpaid_charges` — 밀린 임대료·관리비·전기·수도·인터넷 요금
  - `ded_early_exit` — 계약 기간 전에 집을 비운 데 따른 위약금
  - `ded_no_itemization` — 항목 설명 없이 금액만 공제된(공제한) 부분

#### re02_forfeit_clause
- phase: 2 / kind: single / show_if: `re02_dispute_type = dt_deposit_forfeited OR re02_dispute_type_holder = hd_forfeit_dispute|hd_double_demand`
- 질문: 계약서에는 계약금(đặt cọc)을 어떻게 처리한다고 적혀 있나요?
- 선택지:
  - `fc_both_sides` — 계약금을 낸 쪽이 계약을 깨면 계약금을 잃고, 받은 쪽이 깨면 두 배로 돌려준다고 양쪽 모두 적혀 있습니다.
  - `fc_one_side` — 한쪽이 계약을 깰 때의 처리만 적혀 있고, 반대의 경우는 적혀 있지 않습니다.
  - `fc_condition_clause` — 대출이 나오지 않거나 토지사용권 증서(핑크북) 등 서류에 문제가 있으면 계약금을 돌려준다는 조건이 적혀 있습니다.
  - `fc_no_clause` — 계약서는 있지만, 계약금을 어떻게 처리하는지에 대한 조항은 따로 없습니다.
  - `fc_cannot_read` — 계약서가 베트남어로만 되어 있어, 그런 조항이 있는지 확인하지 못했습니다.

#### re02_extra_claim_detail
- phase: 2 / kind: single / show_if: `re02_dispute_type = dt_extra_claim OR re02_dispute_type_holder = hd_extra_claim`
- 질문: 다툼이 되는 추가 금액은 어떤 명목인가요?
- 선택지:
  - `xc_fixed_penalty` — 계약서에 정한 위약금(예: 임대료 몇 개월치)이고, 해당 조항이 계약서에 적혀 있습니다.
  - `xc_remaining_rent` — 남은 계약 기간의 임대료 전부이고, 계약서에 그렇게 정한 조항이 있는지는 확실하지 않습니다.
  - `xc_damage_over_deposit` — 수리비나 손해가 보증금보다 크다는 이유이고, 견적서나 영수증으로 금액을 맞춰 본 적은 없습니다.
  - `xc_unpaid_period` — 집을 비우기 전까지 밀린 임대료·관리비이고, 몇 달치인지는 서로 알고 있습니다.
  - `xc_unclear_basis` — 명목이나 계산 근거가 정리되지 않은 금액이고, 서로 설명이 엇갈리고 있습니다.

#### re02_handover_record
- phase: 2 / kind: single / show_if: `re02_role = role_tenant|role_company_occupant|role_landlord AND re02_contract_end ≠ end_not_ended`
- 질문: 집을 비우고 넘겨줄 때, 집 상태는 어떻게 기록되었나요?
- 선택지:
  - `ho_joint_signed` — 양쪽이 함께 집 상태를 점검했고, 서명한 인수인계서나 점검표가 있습니다.
  - `ho_photos_only` — 함께 점검하지는 않았지만, 집을 비울 때 사진이나 영상을 찍어 두었습니다.
  - `ho_move_in_only` — 입주할 때의 기록은 있지만, 집을 비울 때는 따로 기록을 남기지 못했습니다.
  - `ho_no_record` — 입주할 때와 집을 비울 때 모두, 집 상태를 기록한 자료가 없습니다.
  - `ho_not_handed` — 아직 열쇠나 집을 넘겨주지 않았거나, 넘겨준 날짜를 두고 다툼이 있습니다.

#### re02_other_reason
- phase: 2 / kind: single / show_if: `re02_dispute_type = dt_not_returned|dt_contact_avoided`
- 질문: 상대방은 돈을 돌려주지 않는 이유를 어떻게 설명했나요?
- 선택지:
  - `or_contract_clause` — 계약서의 특정 조항을 근거로 들었고, 어느 조항인지도 말해 주었습니다.
  - `or_damage_claim` — 집이나 물건이 손상되었다며, 수리비나 손해를 이유로 들었습니다.
  - `or_my_breach` — 제가 먼저 계약을 어겼거나 일찍 끝냈다는 것을 이유로 들었습니다.
  - `or_no_money_now` — 돌려줄 돈인 것은 인정하지만, 지금 돈이 없거나 다음 세입자·매수인을 구한 뒤 주겠다고 합니다.
  - `or_no_reason` — 구체적인 이유를 말하지 않았거나, 들은 설명을 이해하지 못했습니다.

#### re02_money_evidence
- phase: 2 / kind: single / show_if: 항상
- 질문: 돈을 주고받은 사실은 어떤 자료로 확인할 수 있나요?
- 선택지:
  - `me_contract_transfer` — 양쪽이 서명한 계약서가 있고, 은행 송금 내역도 남아 있습니다.
  - `me_transfer_only` — 계약서는 없거나 찾지 못했지만, 은행 송금 내역은 남아 있습니다.
  - `me_cash_message` — 현금으로 주고받았고, 받았다는 메시지나 손으로 쓴 영수증만 남아 있습니다.
  - `me_none` — 계약서·송금 내역·받았다는 메시지 등 확인할 수 있는 자료가 없습니다.

#### re02_contract_form
- phase: 2 / kind: single / show_if: `re02_money_evidence = me_contract_transfer`
- 질문: 계약서는 어떤 형태로 작성되었나요?
- 선택지:
  - `cf_bilingual_signed` — 한국어(또는 영어)와 베트남어가 함께 적힌 계약서에, 양쪽이 서명했습니다.
  - `cf_vn_only` — 베트남어로만 된 계약서에 서명했고, 내용을 모두 이해하지는 못했습니다.
  - `cf_notarized` — 공증사무소에서 공증받은 계약서이고, 공증본을 가지고 있습니다.
  - `cf_broker_form` — 중개인이 준비한 간단한 양식이나 계약금 확인서(giấy đặt cọc) 형태입니다.
  - `cf_signer_doubt` — 계약서는 있지만, 상대방 서명이 빠져 있거나 실제 소유자가 아닌 사람이 서명했습니다.

#### re02_cash_proof
- phase: 2 / kind: single / show_if: `re02_money_evidence = me_cash_message|me_none`
- 질문: 돈을 건넸거나 받은 사실은 지금 무엇으로 확인할 수 있나요?
- 선택지:
  - `cp_admit_message` — 상대방이 돈을 받았다고 인정한 문자나 메신저(Zalo 등) 메시지가 남아 있습니다.
  - `cp_handwritten_signed` — 상대방이 손으로 써 준 영수증이나 메모가 있고, 서명도 되어 있습니다.
  - `cp_witness_broker` — 자료는 없지만, 중개인이나 함께 있던 사람이 확인해 줄 수 있습니다.
  - `cp_withdrawal_only` — 현금을 인출한 은행 기록은 있지만, 상대방에게 건넨 기록은 없습니다.
  - `cp_nothing` — 찾아봤지만, 돈을 주고받은 사실을 확인할 방법이 없습니다.

#### re02_payment_path
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 돈은 누가 주고, 누가 받았나요?
- 선택지:
  - `pp_direct` — 제가 직접 상대방 본인에게 주었거나, 상대방 본인에게서 받았습니다.
  - `pp_agent_my_side` — 제 쪽에서는 회사·가족·지인이 대신 주고받았고, 저는 직접 관여하지 않았습니다.
  - `pp_agent_other_side` — 상대방 쪽에서는 가족이나 관리인 등 다른 사람이 대신 받거나 보냈습니다.
  - `pp_via_broker` — 중개인을 거쳐 주고받았고, 상대방에게 실제로 전달되었는지는 중개인 말로만 알고 있습니다.
  - `pp_unclear` — 누구 명의 계좌로 오갔는지, 실제로 누가 받았는지 확실하지 않습니다.

#### re02_broker_hold
- phase: 2 / kind: single / show_if: `re02_payment_path = pp_via_broker`
- 질문: 중개인을 거친 돈은 지금 어떤 상태인가요?
- 선택지:
  - `bh_delivered_proof` — 중개인이 상대방에게 전달했고, 전달한 영수증이나 송금 내역도 보여 주었습니다.
  - `bh_delivered_word` — 중개인은 전달했다고 하지만, 전달한 기록은 확인하지 못했습니다.
  - `bh_still_holding` — 중개인이 아직 돈을 보관하고 있다고 하지만, 돌려주지 않고 있습니다.
  - `bh_broker_unreachable` — 중개인과도 연락이 잘 되지 않아, 돈이 지금 어디에 있는지 모릅니다.

#### re02_demand_method
- phase: 2 / kind: single / show_if: 항상
- 질문: 지금까지 상대방에게 어떤 방법으로 요구하거나 대응하셨나요?
- 선택지:
  - `dm_not_yet` — 아직 상대방에게 정식으로 요구하거나 대응하지 않았습니다.
  - `dm_verbal_only` — 전화하거나 만나서 말로만 요구했고, 따로 남긴 기록은 없습니다.
  - `dm_written_message` — 문자·Zalo·이메일 등 글로 요구했고, 보낸 기록이 남아 있습니다.
  - `dm_broker_relay` — 중개인이나 관리사무소를 통해 제 요구를 전달했습니다.
  - `dm_formal_letter` — 금액과 기한을 적은 정식 요구 문서를 서명해서 보냈습니다.

#### re02_other_reaction
- phase: 2 / kind: single / show_if: `re02_demand_method ≠ dm_not_yet`
- 질문: 요구하거나 대응한 뒤, 상대방은 어떻게 반응했나요?
- 선택지:
  - `rx_promised_date` — 돌려주거나 정리하겠다고 했고, 구체적인 날짜도 말했습니다.
  - `rx_promised_vague` — 해결하겠다고는 했지만, 날짜나 금액은 정하지 않았습니다.
  - `rx_partial_offer` — 일부 금액만 주겠다고 했거나, 실제로 일부만 보냈습니다.
  - `rx_counter_claim` — 오히려 손해나 위약금을 이유로, 저에게 돈을 더 요구했습니다.
  - `rx_ignored` — 메시지를 읽고도 답이 없거나, 연락을 피하고 있습니다.

#### re02_situation_match
- phase: 2 / kind: single / show_if: 항상
- 질문: 상대방의 주장은 실제 있었던 일과 비교하면 어떤가요?
- 선택지:
  - `sm_match` — 상대방이 말하는 사실은 대체로 맞고, 금액이나 처리 방법만 서로 다릅니다.
  - `sm_partial` — 일부 사실은 맞지만, 손상 정도나 금액 등 중요한 부분이 실제와 다릅니다.
  - `sm_mismatch` — 상대방이 말하는 일은 실제로 없었거나, 책임은 오히려 상대방에게 있다고 생각합니다.
  - `sm_hard_to_judge` — 기록이 남아 있지 않아, 누구 말이 맞는지 비교하기 어렵습니다.
  - `sm_unknown` — 상대방이 무엇을 주장하는지 정확히 알지 못해, 비교할 수 없습니다.

#### re02_deadline
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 돈 문제와 관련해 정해진 기한이 있나요?
- 선택지:
  - `dl_contract_term` — 계약서에 반환 기한(예: 집을 비운 뒤 며칠 이내)이 적혀 있고, 날짜를 계산할 수 있습니다.
  - `dl_promised_date` — 상대방이 특정 날짜까지 돌려주거나 정리하겠다고 약속했습니다.
  - `dl_my_schedule` — 출국·이사·다음 계약 등 제 일정 때문에, 그 전에 정리되어야 합니다.
  - `dl_other_demand` — 상대방이 정한 날짜까지 돈을 보내거나 합의하라고 요구했습니다.
  - `dl_none` — 기한에 대해서는 정해진 것이 없거나, 있는지 확인하지 못했습니다.

#### re02_deadline_date
- phase: 2 / kind: text / show_if: `re02_deadline = dl_contract_term|dl_promised_date|dl_my_schedule|dl_other_demand`
- 질문: 그 기한은 언제인가요?
- placeholder: 예: 2026년 11월 15일(집을 비운 날부터 30일 이내) / 11월 말 출국 예정

#### re02_blockage
- phase: 2 / kind: single / show_if: 항상
- 질문: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `bk_entitlement` — 정말 돌려받을(또는 돌려줘야 할) 돈인지 확신이 없어, 분명하게 요구하지 못하고 있습니다.
  - `bk_amount_basis` — 공제나 위약금이 어떻게 계산되었는지 몰라, 반박할 근거를 정리하지 못하고 있습니다.
  - `bk_evidence` — 계약서·송금 내역·집 상태 기록 등 자료가 부족해, 대응을 시작하지 못하고 있습니다.
  - `bk_contact` — 상대방이 연락을 피하거나 베트남 밖에 있어, 대화 자체가 진행되지 않고 있습니다.
  - `bk_language_process` — 베트남어와 현지 절차를 잘 몰라, 다음에 무엇을 해야 할지 멈춰 있습니다.

#### re02_final_goal
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `fg_full_settlement` — 계약서 기준으로 받을(또는 돌려줄) 금액을 확인하고, 그 금액대로 정리하고 싶습니다.
  - `fg_fair_compromise` — 공제나 위약금 중 타당한 부분은 인정하고, 나머지는 합의로 정리하고 싶습니다.
  - `fg_formal_demand` — 근거를 정리한 정식 요구 문서를 보내고, 기한 안에 답을 받고 싶습니다.
  - `fg_reject_claim` — 상대방의 요구가 타당하지 않다면, 근거를 갖추어 분명하게 거절하고 싶습니다.
  - `fg_expert` — 제 상황을 전문가에게 정확히 전달해, 협상이나 대응을 맡기고 싶습니다.

---

## 결과 신호

### 위험 신호 선택지 → 결과 화면 문장 / 판정 단계

| 선택지 | 결과 화면 위험 문장 | 판정 |
|---|---|---|
| `end_me_short_notice` | 계약서에 정한 사전 통지 기간을 지키지 못한 경우, 상대방이 공제나 위약금을 주장할 여지가 있어 계약서 조항부터 확인해야 합니다. | 주의 |
| `end_not_ended` | 계약이 아직 끝나지 않은 상태라, 지금 돈을 요구하거나 거절하는 방식에 따라 계약 위반 문제로 번질 수 있습니다. | 주의 |
| `dt_deposit_forfeited` / `hd_forfeit_dispute` | 계약금을 돌려주지 않는 것이 정당한지는 누가 먼저 계약을 지키지 않았는지와 계약금 조항에 따라 달라지므로, 사실관계를 먼저 정리해야 합니다. | 주의 |
| `hd_double_demand` | 계약금을 받은 쪽이 계약을 진행하지 못한 경우 두 배 반환 주장이 나올 수 있어, 계약서 조항과 진행하지 못한 사정을 함께 검토해야 합니다. | 전문가 권장 |
| `dt_extra_claim` / `hd_extra_claim` | 보증금을 넘는 추가 금액은 근거 조항과 금액 계산이 맞는지 확인하기 전에 지급하거나 요구하지 않는 것이 안전합니다. | 주의 |
| `dt_contact_avoided` / `hd_contact_lost` / `rx_ignored` | 상대방이 연락을 피하고 있어, 말로 하는 요구보다 기록이 남는 방법으로 요구한 사실을 남겨 두는 것이 중요합니다. | 주의 |
| `ded_no_itemization` / `xc_unclear_basis` | 공제나 추가 금액에 항목별 근거가 없어, 금액을 인정하기 전에 내역과 영수증을 먼저 요구해야 합니다. | 확인 필요 |
| `fc_no_clause` / `fc_one_side` | 계약서에 계약금 처리 기준이 없거나 한쪽만 적혀 있어, 현지 관행만으로 결과를 예측하기 어렵습니다. | 주의 |
| `fc_cannot_read` / `cf_vn_only` | 베트남어 계약 내용을 정확히 이해하지 못한 상태라, 핵심 조항을 번역해 확인한 뒤 대응해야 합니다. | 확인 필요 |
| `cf_signer_doubt` | 실제 소유자가 아닌 사람이 서명했거나 서명이 빠진 계약은 돈을 받은 사람이 누구인지부터 문제가 될 수 있습니다. | 전문가 권장 |
| `me_none` / `cp_nothing` | 돈을 주고받은 사실을 확인할 자료가 없어, 상대방이 받은 사실 자체를 부인하면 대응이 어려워질 수 있습니다. | 전문가 권장 |
| `me_cash_message` / `cp_withdrawal_only` | 현금으로 주고받은 돈은 상대방이 받았다고 인정한 기록이 핵심이므로, 남아 있는 메시지를 지우지 말고 보관해야 합니다. | 주의 |
| `ho_no_record` / `ho_move_in_only` | 집을 비울 때의 상태 기록이 없어, 손상 책임을 두고 서로 주장이 엇갈릴 가능성이 큽니다. | 주의 |
| `ho_not_handed` | 집을 넘겨준 날짜가 정리되지 않으면 반환 기한과 밀린 임대료 계산이 모두 달라질 수 있습니다. | 확인 필요 |
| `pp_via_broker` + `bh_delivered_word` | 중개인이 상대방에게 돈을 전달했는지 기록으로 확인되지 않아, 돈이 실제로 어디에 있는지부터 확인해야 합니다. | 주의 |
| `bh_still_holding` / `bh_broker_unreachable` | 중개인이 돈을 보관한 채 돌려주지 않거나 연락이 되지 않는 상황이라, 중개인과 상대방 중 누구에게 요구할지 정리가 필요합니다. | 전문가 권장 |
| `pp_unclear` / `pp_agent_other_side` | 실제로 돈을 받은 사람이 계약 상대방 본인인지 확실하지 않아, 누구에게 반환을 요구할지부터 확인해야 합니다. | 확인 필요 |
| `rx_counter_claim` | 요구한 뒤 상대방이 오히려 돈을 더 요구하고 있어, 상대방 주장의 근거를 받아 본 뒤 대응 순서를 정해야 합니다. | 주의 |
| `sm_mismatch` / `sm_hard_to_judge` | 상대방 주장과 실제 사정이 다르거나 비교할 기록이 부족해, 날짜별 사실관계를 먼저 정리해야 합니다. | 확인 필요 |
| `dl_other_demand` / `dl_my_schedule` | 기한이 가까운 상태라, 기한 전에 기록이 남는 방법으로 입장을 전달해 두는 것이 안전합니다. | 주의 |

#### 특수 사건 표시 (퍼널 유지, 결과에서 "VFBCAI 전문가팀 진행" 안내만 표시)
- 직접 입력 또는 선택 조합에서 아래가 확인되면 표시: 이미 소송·중재·조정이 진행 중인 경우 / `cf_signer_doubt` + 소유자 확인 불가(사기 의심 등 형사 문제 가능성) / `bh_broker_unreachable`(중개인이 돈을 가지고 연락이 끊긴 경우) / 공동 세입자·공동 매수인 등 당사자가 여러 명이거나 회사·개인 명의가 섞인 경우(`role_company_occupant` + `pp_agent_my_side`).
- 표시 문장: 이 사건은 일반적인 반환 요구 절차보다 확인할 당사자와 쟁점이 많아, VFBCAI 전문가팀이 사실관계를 직접 확인한 뒤 진행하는 것이 적합합니다.

### 1차 결과 §03 소제목 [대표 승인 2026-10-07, C1.21]
- firstResultCautionsSectionSubtitle: `| 분쟁 대응 핵심 포인트`

### 1차 판정 하한 [대표 승인 2026-10-07, C1.22]
- firstResultVerdictFloor: true
- 계약 이후 돈·분쟁 상태 서비스: 1차 판정 최소 주의 요망(2단계). Pack 합산이 더 높은 단계(주의·전문가)면 그대로 유지.

### 1차 결과 §03 위험 0건 + 판정 하한 [대표 승인 2026-10-07, C1.25]
- firstResultNoRiskFloorTitle: `먼저 확인할 사항`
- firstResultNoRiskFloorBody: `계약서의 보증금 반환 조항과 송금 내역을 먼저 맞춰 보세요. 반환 시기와 금액이 어떻게 정해져 있는지가 출발점입니다.`

### 1차 판정 상향 (phase1 주의 헤드라인) [대표 승인 2026-10-07, C1.21]
다음 phase1 선택값이 하나라도 있으면 1차 헤드라인·등급·02 카드 톤을 주의 단계로 올린다(그 외 조합은 변경 없음).
- `dt_not_returned`
- `dt_deposit_forfeited`
- `dt_contact_avoided`
- `hd_forfeit_dispute`
- `hd_double_demand`

### 1차 결과 "핵심 확인 결과" 3칸 문장 규칙
1. **상황** = `re02_role` + (`re02_dispute_type` 또는 `re02_dispute_type_holder`) + `re02_contract_end`를 한 문장으로 연결.
   - 형식: "{역할}로서 {분쟁 유형 요약}이며, 계약은 {종료 방식 요약} 상태입니다."
   - 예: "세입자로서 보증금 중 일부가 수리비 등으로 공제된 상황이며, 계약은 기간 만료로 종료된 상태입니다."
   - 역할 요약어: role_tenant=세입자 / role_company_occupant=회사 명의 계약의 실제 거주자 / role_landlord=집주인 / role_buyer=매수인 / role_seller=매도인.
   - 종료 요약어: end_expired=기간 만료로 종료 / end_me_with_notice=고객님이 미리 알리고 먼저 종료 / end_me_short_notice=고객님이 먼저 종료했으나 사전 통지가 부족 / end_other_first=상대방 사정으로 종료 / end_not_ended=아직 종료되지 않음.
2. **확인 목표** = `re02_confirm_goal` 선택지를 "~를 확인합니다"로 바꿔 1문장. 결과를 단정하지 않고 확인 대상만 적는다.
   - cg_entitlement → "이 돈을 돌려받을 수 있는지(또는 돌려주어야 하는지)를 계약서와 실제 사정 기준으로 확인합니다."
   - cg_amount_check → "공제·요구 금액의 항목과 계산 방식이 맞는지 확인합니다."
   - cg_forfeit_rule → "계약금 몰수 또는 두 배 반환 주장이 계약서 조항과 계약이 깨진 경위에 맞는지 확인합니다."
   - cg_how_to_demand → "상대방에게 요구할 시점과 기록이 남는 요구 방법을 확인합니다."
   - cg_unsure → "지금 상황에서 먼저 정리할 사실과 진행 순서를 확인합니다."
3. **대응·자료** = 분쟁 유형별로 준비할 자료 1문장(+ end_me_short_notice/end_not_ended면 주의 1구절 추가).
   - dt_not_returned / dt_contact_avoided / hd_contact_lost → "계약서, 송금 내역, 상대방과 주고받은 메시지를 먼저 모아 두세요."
   - dt_partial_deduction / hd_deduct_dispute → "공제 항목별 내역·영수증과 집을 비울 때의 사진·점검 기록을 함께 준비하세요."
   - dt_deposit_forfeited / hd_forfeit_dispute / hd_double_demand → "계약서의 계약금(đặt cọc) 조항과 계약이 진행되지 못한 경위를 날짜순으로 정리하세요."
   - dt_extra_claim / hd_extra_claim → "추가 금액의 근거 조항과 계산 내역을 상대방에게 받아 두고, 확인 전에는 지급이나 요구를 서두르지 마세요."
   - 추가 구절: end_me_short_notice → "계약서의 사전 통지 조항도 함께 확인하세요." / end_not_ended → "계약이 아직 유지 중이므로 대응 방식은 신중히 정하세요."

### "지금 확인해 보세요" STEP 3개
1. **STEP 1 — 계약서의 돈 관련 조항 확인**: 보증금 반환 기한, 공제 조건, 계약금(đặt cọc) 처리, 중도 해지 시 통지 기간이 적힌 조항을 찾아 표시해 두세요.
2. **STEP 2 — 돈이 오간 기록 정리**: 송금 내역·영수증·받았다는 메시지를 날짜와 금액순으로 모으고, 중개인이나 대리인을 거쳤다면 실제로 누가 받았는지도 함께 적어 두세요.
3. **STEP 3 — 요구와 답변을 기록으로 남기기**: 지금까지 말로만 요구했다면 금액·근거·기한을 적어 글로 다시 보내고, 상대방의 답변은 캡처해 보관하세요.

---

## 노드 수 요약
- 1차: 5노드(공용 Q1 별도) — 경로당 Q1 + 4문항 노출(re02_role → dispute_type 또는 dispute_type_holder 중 1개 → contract_end → confirm_goal).
- 2차: 19노드(조건부 후속 11개 포함). 상시 8문항(amount_state, money_evidence, payment_path, demand_method, situation_match, deadline, blockage, final_goal) + 경로별 조건부 3~6문항.
- 전체: 24노드(Q1 제외).
