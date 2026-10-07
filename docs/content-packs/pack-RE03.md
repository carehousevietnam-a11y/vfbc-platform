# RE03 계약 위반·해지·퇴거 통보 — Content Pack

- Q1(공용, 확정): "상대방에게서 계약 위반·해지·퇴거 통보를 받았습니다." → 이 Pack 진입
- 대상 계약: 주택 임대차 중심(세입자·집주인 양쪽 모두 진입 가능). 매매 계약금(đặt cọc) 분쟁은 다른 CASE에서 다룬다.
- 엔진 공용 선택지 "위에 내용이 없거나 설명이 필요합니다 → 직접 입력"은 자동으로 붙으므로 아래에 쓰지 않았다.
- value는 질문별 고유 접두사를 사용해 질문 간 중복이 없다(role_/dm_/rs_/cg_/rt_/rld_/ar_/cd_/ow_/nf_/sd_/np_/cf_/md_/oc_/ol_/fc_/gp_/rd_/cr_/ds_/pc_/ev_/bk_/gl_).
- show_if에서 "≠"는 해당 value가 아닐 때, "또는"은 두 조건 중 하나라도 맞을 때 노출한다.

---

## 1차 (Q1 + CASE 질문 4개)

### re03_my_role
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 계약에서 고객님은 어떤 위치에 계신가요?
- 선택지:
  - `role_tenant` — 제 이름으로 집을 빌려 살고 있고, 계약서에도 제가 임차인으로 적혀 있습니다.
  - `role_company_staff` — 회사 명의로 계약된 집에 살고 있고, 계약 당사자는 제가 아닌 회사입니다.
  - `role_subtenant` — 원래 세입자에게서 다시 빌려 살고 있고, 집주인과 직접 맺은 계약은 없습니다.
  - `role_landlord` — 제 소유의 집을 빌려주었고, 세입자에게서 통보를 받았습니다.
  - `role_proxy` — 가족이나 지인 대신 확인하고 있고, 계약 당사자는 제가 아닙니다.

### re03_demand_type
- phase: 1 / kind: single / show_if: 항상
- 질문: 상대방은 이번 통보에서 무엇을 가장 중심적으로 요구했나요?
- 선택지:
  - `dm_fix_breach` — 문제가 된 부분을 정해진 기간 안에 바로잡으면, 계약을 계속 유지하겠다는 내용이었습니다.
  - `dm_terminate` — 계약을 끝내겠다는 통보였고, 언제 집을 비워야 하는지는 아직 정해지지 않았습니다.
  - `dm_vacate_date` — 계약을 끝내면서, 정해진 날짜까지 집을 비우라는(또는 비우겠다는) 날짜가 적혀 있었습니다.
  - `dm_money_claim` — 계약 위반을 이유로, 위약금이나 손해배상 명목의 돈을 내라는 요구를 받았습니다.
  - `dm_unclear` — 통보는 받았지만, 상대방이 정확히 무엇을 요구하는지 이해하지 못했습니다.

### re03_response_status
- phase: 1 / kind: single / show_if: 항상
- 질문: 통보를 받은 뒤, 지금까지 어떻게 대응하셨나요?
- 선택지:
  - `rs_none` — 통보만 받았고, 아직 상대방에게 답하거나 연락하지 않았습니다.
  - `rs_inquired` — 상대방이나 중개인에게 이유를 물어봤지만, 제 입장은 아직 정하지 않았습니다.
  - `rs_disputed` — 통보 내용이 사실과 다르거나 계약과 맞지 않는다고, 상대방에게 분명히 말했습니다.
  - `rs_complied_part` — 밀린 금액을 보내거나 문제를 고치는 등, 요구의 일부를 이미 이행했습니다.
  - `rs_negotiating` — 나가는 날짜나 보증금·금액 조건을 두고, 상대방과 협의하고 있습니다.

### re03_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `cg_validity` — 이 통보가 계약서 조항과 통지 기간에 맞는 것인지, 그대로 따라야 하는지 확인하고 싶습니다.
  - `cg_move_timing` — 정말 집을 비워야 하는지(또는 언제 비워 받을 수 있는지), 그 전에 할 일을 확인하고 싶습니다.
  - `cg_money` — 보증금을 어떻게 정리해야 하는지, 위약금이나 손해배상을 내야 하는지 확인하고 싶습니다.
  - `cg_fact_gap` — 상대방이 말한 위반 사유 중 사실과 다른 부분을 정리하고, 어떻게 설명할지 확인하고 싶습니다.
  - `cg_order` — 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.

---

## 2차 (조건부 후속 포함 24개 노드)

### re03_reason_tenant
- phase: 2 / kind: single / show_if: re03_my_role ≠ role_landlord
- 질문: 상대방은 계약 위반이나 해지 이유를 무엇이라고 했나요?
- 선택지:
  - `rt_arrears` — 임대료나 관리비가 밀렸다는 이유였고, 밀린 기간이나 금액이 적혀 있습니다.
  - `rt_noise_misuse` — 소음이나 이웃 민원, 또는 집을 사무실·영업 등 주거 외 용도로 썼다는 이유였습니다.
  - `rt_sublease` — 집주인 동의 없이 다른 사람에게 다시 빌려주었거나, 함께 살게 했다는 이유였습니다.
  - `rt_owner_side` — 제 잘못이 아니라, 집을 팔거나 집주인이 직접 쓰겠다는 상대방 사정 때문이라고 했습니다.
  - `rt_other_unclear` — 위에 없는 다른 이유이거나, 이유가 적혀 있지 않아 알 수 없습니다.

### re03_reason_landlord
- phase: 2 / kind: single / show_if: re03_my_role = role_landlord
- 질문: 세입자는 계약 위반이나 해지 이유를 무엇이라고 했나요?
- 선택지:
  - `rld_repair_claim` — 제가 수리나 시설 관리를 해 주지 않아, 계약을 지키지 않았다고 했습니다.
  - `rld_early_exit` — 귀국·전근 등 세입자 개인 사정으로, 계약 기간 전에 나가겠다고 했습니다.
  - `rld_deposit_claim` — 보증금이나 미리 받은 임대료를 돌려 달라고 하면서, 해지를 통보했습니다.
  - `rld_house_issue` — 누수·곰팡이·소음 등 집 상태가 계약 때 설명과 다르다고 했습니다.
  - `rld_no_reason` — 이유 없이 나가겠다고만 했거나, 그 뒤로 연락이 거의 끊긴 상태입니다.

### re03_arrears_fact
- phase: 2 / kind: single / show_if: re03_reason_tenant = rt_arrears
- 질문: 밀렸다고 한 임대료·관리비는 실제와 비교하면 어떤가요?
- 선택지:
  - `ar_admit_unpaid` — 실제로 밀린 금액이 있고, 그 금액도 상대방 말과 거의 같습니다.
  - `ar_amount_differs` — 밀린 것은 맞지만, 상대방이 말한 금액이나 기간이 실제보다 큽니다.
  - `ar_paid_not_counted` — 이미 송금했는데, 상대방이 받지 못했다고 하거나 반영하지 않았습니다.
  - `ar_mgmt_fee_dispute` — 임대료는 보냈고, 문제가 된 것은 관리사무소 관리비나 전기·수도 요금입니다.
  - `ar_none` — 밀린 금액이 없고, 송금 내역으로 이를 확인할 수 있습니다.

### re03_conduct_fact
- phase: 2 / kind: single / show_if: re03_reason_tenant = rt_noise_misuse|rt_sublease
- 질문: 상대방이 문제 삼은 집 사용 방식은 실제로 어떠했나요?
- 선택지:
  - `cd_admit_fixed` — 그런 일이 있었던 것은 맞지만, 통보를 받은 뒤 이미 그만두거나 고쳤습니다.
  - `cd_admit_ongoing` — 그런 일이 있었던 것은 맞고, 지금도 같은 방식으로 쓰고 있습니다.
  - `cd_consented_before` — 계약 전이나 중간에 집주인이 허락했고, 허락받은 메시지나 서면이 남아 있습니다.
  - `cd_exaggerated` — 비슷한 일은 있었지만, 상대방이 실제보다 훨씬 크게 문제 삼고 있습니다.
  - `cd_deny` — 그런 사용은 없었고, 이웃이나 관리사무소가 사실을 확인해 줄 수 있습니다.

### re03_owner_reason_fact
- phase: 2 / kind: single / show_if: re03_reason_tenant = rt_owner_side
- 질문: 상대방 사정으로 계약을 끝내겠다는 통보는 어떤 내용이었나요?
- 선택지:
  - `ow_sale_new_owner` — 집을 팔았거나 팔 예정이라고 했고, 새 집주인에게 계약이 이어지는지는 듣지 못했습니다.
  - `ow_sale_buyer_wants_empty` — 집을 팔면서, 사는 사람이 빈집을 원한다며 날짜를 정해 나가 달라고 했습니다.
  - `ow_own_use` — 집주인이나 가족이 직접 살겠다며, 계약 기간이 남았는데도 나가 달라고 했습니다.
  - `ow_bank_issue` — 은행 담보나 집주인의 빚 문제로, 집이 다른 사람에게 넘어갈 수 있다는 이야기를 들었습니다.
  - `ow_compensation_offered` — 상대방 사정이라며, 이사비나 위약금 일부를 보상하겠다고 제안했습니다.

### re03_notice_form
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 통보는 어떤 방법으로 받으셨나요?
- 선택지:
  - `nf_written_hand` — 서명된 서면 통지를 직접 건네받았고, 원본을 가지고 있습니다.
  - `nf_post` — 우편이나 등기우편으로 서면 통지를 받았고, 봉투나 수령 기록도 남아 있습니다.
  - `nf_messenger` — Zalo·카카오톡·이메일 등 메시지로 받았고, 화면 캡처나 대화 기록이 있습니다.
  - `nf_oral` — 전화나 방문으로 말로만 들었고, 서면이나 메시지는 받지 못했습니다.
  - `nf_via_middle` — 중개인이나 관리사무소가 대신 전달했고, 상대방에게 직접 들은 것은 아닙니다.

### re03_notice_sender
- phase: 2 / kind: single / show_if: re03_notice_form = nf_oral|nf_via_middle
- 질문: 통보를 실제로 보낸 사람은 누구로 확인되나요?
- 선택지:
  - `sd_party_self` — 계약서에 적힌 상대방 본인이 보낸 것이고, 이름이나 연락처로 확인했습니다.
  - `sd_agent` — 상대방의 가족·회사 담당자·변호사 등 대리인이 보냈고, 위임받았는지는 확인하지 못했습니다.
  - `sd_broker` — 계약을 중개한 중개인이 보냈고, 상대방 본인의 뜻인지는 직접 확인하지 못했습니다.
  - `sd_mgmt_office` — 건물 관리사무소가 보냈고, 계약 상대방 본인의 뜻인지는 분명하지 않습니다.
  - `sd_unknown` — 누가 보낸 것인지, 계약 상대방과 어떤 관계인지 확인하지 못했습니다.

### re03_notice_period
- phase: 2 / kind: single / show_if: 항상
- 질문: 통보에서 준 기간은 계약서의 해지·통지 조항과 비교하면 어떤가요?
- 선택지:
  - `np_meets_clause` — 계약서에 '며칠 전 통지' 조항이 있고, 이번 통보는 그 기간을 지킨 것으로 보입니다.
  - `np_shorter` — 계약서에 통지 기간 조항이 있지만, 이번 통보는 그보다 짧은 기간만 주었습니다.
  - `np_no_clause` — 계약서를 확인했지만, 해지 통지 기간에 관한 조항은 찾지 못했습니다.
  - `np_lang_unread` — 계약서가 베트남어로만 되어 있어, 해당 조항이 있는지 확인하지 못했습니다.
  - `np_no_contract` — 서면 계약서 없이 말이나 메시지로 계약했거나, 계약서 사본을 지금 가지고 있지 않습니다.

### re03_contract_form
- phase: 2 / kind: single / show_if: re03_notice_period = np_shorter|np_no_clause
- 질문: 계약서는 어떤 형태로 작성되어 있나요?
- 선택지:
  - `cf_notarized` — 공증사무소에서 공증받은 계약서이고, 원본이나 공증 사본을 가지고 있습니다.
  - `cf_bilingual` — 공증은 받지 않았고, 베트남어와 한국어(또는 영어)가 함께 적힌 계약서입니다.
  - `cf_vn_only` — 공증은 받지 않았고, 베트남어로만 된 계약서라 일부만 이해하고 있습니다.
  - `cf_foreign_only` — 한국어나 영어로만 작성했고, 베트남어 본은 따로 만들지 않았습니다.
  - `cf_company_held` — 회사나 원래 세입자가 계약서를 보관하고 있어, 저는 내용을 직접 보지 못했습니다.

### re03_move_out_deadline
- phase: 2 / kind: single / show_if: re03_demand_type = dm_terminate|dm_vacate_date
- 질문: 집을 비우는 날짜는 어떻게 안내받으셨나요?
- 선택지:
  - `md_date_written` — 통보에 정확한 날짜가 적혀 있어, 언제까지인지 확인했습니다.
  - `md_period_only` — '통보일부터 30일 이내'처럼 기간만 적혀 있어, 정확한 날짜는 계산하지 못했습니다.
  - `md_immediate` — 날짜 없이, 바로 또는 며칠 안에 집을 비우라는(비우겠다는) 말만 들었습니다.
  - `md_not_stated` — 계약을 끝낸다는 통보는 받았지만, 언제 비워야 하는지는 안내받지 못했습니다.
  - `md_lang_unclear` — 통보가 베트남어로 되어 있어, 날짜가 적혀 있는지조차 확인하지 못했습니다.

### re03_move_out_date
- phase: 2 / kind: text / show_if: re03_move_out_deadline = md_date_written|md_period_only
- 질문: 안내받은 퇴거 날짜나 기간을 적어 주세요.
- placeholder: 예: 2026년 11월 30일까지 집을 비우라고 적혀 있습니다. / 10월 1일 통보, '30일 이내'라고만 적혀 있습니다.

### re03_occupancy_tenant
- phase: 2 / kind: single / show_if: re03_my_role ≠ role_landlord 그리고 (re03_demand_type = dm_vacate_date 또는 re03_move_out_deadline = md_immediate)
- 질문: 지금 그 집에서의 생활은 어떤 상태인가요?
- 선택지:
  - `oc_living_normal` — 아직 그 집에 살고 있고, 출입이나 전기·수도 사용에는 문제가 없습니다.
  - `oc_moving_prep` — 아직 살고 있지만, 새 집을 알아보거나 짐을 일부 옮기고 있습니다.
  - `oc_already_left` — 이미 집을 비웠지만, 열쇠 반납이나 집 상태 확인은 아직 하지 않았습니다.
  - `oc_locked_out` — 상대방이 열쇠를 바꾸거나 전기·수도를 끊어, 집을 제대로 쓰지 못하고 있습니다.
  - `oc_belongings_threat` — 정해진 날까지 나가지 않으면, 짐을 밖으로 내놓겠다는 말을 들었습니다.

### re03_occupancy_landlord
- phase: 2 / kind: single / show_if: re03_my_role = role_landlord
- 질문: 세입자는 지금 그 집을 어떻게 쓰고 있나요?
- 선택지:
  - `ol_still_living` — 세입자가 아직 살고 있고, 나가는 날짜에 대해 연락은 되고 있습니다.
  - `ol_not_leaving` — 계약이 끝났거나 해지됐는데도 세입자가 나가지 않고, 날짜 이야기를 피하고 있습니다.
  - `ol_third_party` — 세입자가 아닌 다른 사람이 살고 있어, 제 동의 없이 다시 빌려준 것으로 보입니다.
  - `ol_left_items` — 세입자는 나간 것 같지만, 짐이 남아 있고 열쇠도 돌려받지 못했습니다.
  - `ol_no_contact` — 세입자와 연락이 끊겼고, 집 안 상태도 확인하지 못했습니다.

### re03_fact_compare
- phase: 2 / kind: single / show_if: 항상
- 질문: 상대방이 통보에서 말한 내용은 실제 있었던 일과 비교하면 어떤가요?
- 선택지:
  - `fc_match` — 상대방이 말한 내용이 실제 있었던 일과 거의 같습니다.
  - `fc_partial` — 그런 일은 있었지만, 날짜·금액·횟수 등 일부가 실제와 다릅니다.
  - `fc_already_solved` — 그런 일은 있었지만, 통보 전에 이미 해결했거나 상대방과 정리한 일입니다.
  - `fc_other_breached` — 상대방이 먼저 계약을 지키지 않았는데, 이번 통보에는 그 사실이 빠져 있습니다.
  - `fc_cannot_compare` — 통보 내용을 이해하지 못했거나 기록이 없어, 지금은 비교하기 어렵습니다.

### re03_fact_gap
- phase: 2 / kind: single / show_if: re03_fact_compare = fc_partial|fc_already_solved|fc_other_breached
- 질문: 상대방 말과 실제가 가장 크게 다른 점은 무엇인가요?
- 선택지:
  - `gp_date_amount` — 날짜나 금액이 다르고, 송금 내역이나 영수증으로 실제를 보여 줄 수 있습니다.
  - `gp_action_itself` — 문제라고 한 행동 자체가 다르고, 당시 상황을 보여 줄 메시지나 증인이 있습니다.
  - `gp_prior_agreement` — 이미 상대방과 합의한 일인데, 그 합의를 없던 일로 하고 있습니다.
  - `gp_counter_breach` — 상대방이 수리·보증금·약속을 먼저 지키지 않았는데, 그 부분이 빠져 있습니다.
  - `gp_no_proof_yet` — 다르다는 것은 분명하지만, 이를 보여 줄 자료를 아직 모으지 못했습니다.

### re03_fact_gap_text
- phase: 2 / kind: text / show_if: re03_fact_compare = fc_partial|fc_other_breached
- 질문: 상대방 주장과 실제가 다른 부분을 날짜와 함께 적어 주세요.
- placeholder: 예: 9월 임대료는 9월 5일에 계좌이체로 보냈는데, 통보에는 9월분이 밀렸다고 적혀 있습니다.

### re03_response_detail
- phase: 2 / kind: single / show_if: re03_response_status = rs_disputed|rs_complied_part|rs_negotiating
- 질문: 상대방에게 대응할 때 어떤 방법으로 하셨고, 기록이 남아 있나요?
- 선택지:
  - `rd_written_kept` — 서면이나 메시지로 답했고, 보낸 내용과 상대방이 읽은 기록이 남아 있습니다.
  - `rd_oral_only` — 전화나 만나서 말로만 했고, 따로 남긴 기록은 없습니다.
  - `rd_paid_with_record` — 밀린 금액이나 요구 금액 일부를 송금했고, 송금 내역을 가지고 있습니다.
  - `rd_fixed_with_photo` — 문제가 된 부분을 고치거나 그만두었고, 사진이나 확인 메시지가 있습니다.
  - `rd_via_broker` — 중개인이나 관리사무소를 통해 전달했고, 상대방에게 제대로 전달됐는지는 모릅니다.

### re03_counter_reaction
- phase: 2 / kind: single / show_if: re03_response_status = rs_inquired|rs_disputed|rs_complied_part|rs_negotiating
- 질문: 대응한 뒤, 상대방은 어떤 반응을 보였나요?
- 선택지:
  - `cr_withdrawn` — 통보를 거두거나, 계약을 그대로 유지하겠다는 답을 받았습니다.
  - `cr_maintained` — 처음 통보를 그대로 유지하겠다며, 같은 날짜와 요구를 다시 말했습니다.
  - `cr_new_terms` — 날짜를 미루거나 금액을 줄이는 등, 새로운 조건을 제시했습니다.
  - `cr_legal_threat` — 법원이나 공안에 신고하겠다고 했거나, 이미 절차를 시작했다고 했습니다.
  - `cr_no_reply` — 아직 답이 없거나, 답을 받았지만 무슨 뜻인지 이해하지 못했습니다.

### re03_deposit_status
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 계약의 보증금은 지금 어떤 상태인가요?
- 선택지:
  - `ds_held_no_talk` — 보증금은 집주인 쪽에 그대로 있고, 돌려주거나 빼는 것에 대한 이야기는 아직 없습니다.
  - `ds_return_promised` — 돌려준다는 말은 오갔지만, 금액이나 날짜는 아직 정해지지 않았습니다.
  - `ds_deduct_listed` — 밀린 금액이나 수리비를 빼고 돌려준다고 했고, 공제 내역도 받았습니다.
  - `ds_deduct_no_list` — 일부를 빼고 돌려준다고 했지만, 무엇을 얼마나 빼는지 내역은 받지 못했습니다.
  - `ds_forfeit` — 계약 위반을 이유로, 보증금을 전혀 돌려주지 않겠다는 이야기가 나왔습니다.

### re03_penalty_clause
- phase: 2 / kind: single / show_if: re03_demand_type = dm_money_claim 또는 re03_deposit_status = ds_deduct_listed|ds_deduct_no_list|ds_forfeit
- 질문: 상대방이 요구한 금액은 계약서의 위약금 조항과 비교하면 어떤가요?
- 선택지:
  - `pc_clause_matches` — 계약서에 위약금 조항(보증금 몰수, 임대료 몇 달치 등)이 있고, 요구 금액도 그 조항과 같습니다.
  - `pc_amount_exceeds` — 위약금 조항은 있지만, 요구받은 금액이 조항보다 크거나 다른 항목이 더 붙어 있습니다.
  - `pc_no_clause` — 계약서에 위약금 조항이 없는데, 상대방이 금액을 정해서 요구했습니다.
  - `pc_damage_claim` — 위약금과 별도로, 수리비·공실 손해 등 손해배상을 추가로 요구받았습니다.
  - `pc_unknown` — 위약금 조항이 있는지, 요구 금액이 어떻게 계산되었는지 모르겠습니다.

### re03_claim_amount
- phase: 2 / kind: text / show_if: re03_penalty_clause = pc_clause_matches|pc_amount_exceeds|pc_no_clause|pc_damage_claim
- 질문: 요구받은 금액과 항목을 통보에 적힌 그대로 적어 주세요.
- placeholder: 예: 위약금으로 임대료 2개월분 3,000만 동, 청소비 200만 동을 보증금에서 빼겠다고 했습니다.

### re03_evidence
- phase: 2 / kind: multi / show_if: 항상
- 질문: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `ev_contract` — 임대차 계약서(공증본·번역본 포함)
  - `ev_notice_chat` — 상대방에게서 받은 통보와 그 뒤 주고받은 메시지 기록
  - `ev_transfer` — 임대료·관리비·보증금 송금 내역이나 영수증
  - `ev_house_photo` — 입주할 때와 지금의 집 상태를 보여 주는 사진·영상
  - `ev_none` — 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.

### re03_blockage
- phase: 2 / kind: single / show_if: 항상
- 질문: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `bk_validity_unknown` — 통보가 계약서 조항에 맞는 것인지 판단하지 못해, 따를지 말지 정하지 못하고 있습니다.
  - `bk_time_pressure` — 집을 비우는 날짜가 너무 가까워, 이사나 다음 세입자 준비가 따라가지 못하고 있습니다.
  - `bk_money_dispute` — 보증금이나 위약금 금액에 서로 의견이 달라, 정리가 멈춰 있습니다.
  - `bk_no_proof` — 상대방 말이 사실과 다르다는 것을 보여 줄 자료가 부족해, 대응을 미루고 있습니다.
  - `bk_no_response` — 상대방이 연락을 피하거나 답이 없어, 다음 단계로 넘어가지 못하고 있습니다.

### re03_final_goal
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `gl_keep_living` — 계약을 그대로 유지하고, 남은 계약 기간 동안 그 집에서 계속 살고 싶습니다.
  - `gl_leave_settle_money` — 나가는 것은 받아들이되, 보증금과 남은 금액을 정확히 정리하고 나가고 싶습니다.
  - `gl_leave_no_penalty` — 계약을 끝내되, 위약금이나 손해배상 없이 정리하고 싶습니다.
  - `gl_recover_house` — 집주인으로서 계약을 정리하고, 집을 비워 돌려받고 싶습니다.

---

## 결과 신호

### 위험 신호 선택지 → 결과 화면 위험 문장 / 판정 단계

**전문가 권장 (일반 퍼널 대신 "VFBCAI 전문가팀 진행" 안내 대상)**
- `oc_locked_out` — 계약 분쟁 중에 출입이나 전기·수도가 막힌 상태여서, 생활과 짐을 지키기 위한 대응을 서둘러 확인해야 합니다.
- `oc_belongings_threat` — 짐을 밖으로 내놓겠다는 말을 들은 상태여서, 그 날짜 전에 대응 방법을 확인하는 것이 좋습니다.
- `cr_legal_threat` — 상대방이 법원이나 공안 절차를 언급했거나 시작한 상태여서, 혼자 답하기 전에 전문가 확인이 필요합니다.
- `ow_bank_issue` — 집이 은행 담보 문제로 넘어갈 수 있다는 이야기가 있어, 보증금과 거주 기간에 미치는 영향을 별도로 확인해야 합니다.
- `role_subtenant` + (`dm_terminate`|`dm_vacate_date`) — 집주인과 직접 계약이 없는 상태에서 퇴거 통보를 받아, 원래 세입자·집주인 사이 계약까지 함께 확인해야 합니다(다수 당사자).

**주의**
- `np_shorter` — 통보에서 준 기간이 계약서 조항보다 짧아 보여, 그 날짜를 그대로 따라야 하는지 확인이 필요합니다.
- `md_immediate` — 날짜 없이 바로 나가라는 통보여서, 계약서와 법에서 정한 통지 기간을 먼저 확인해야 합니다.
- `ds_forfeit` — 보증금을 전혀 돌려주지 않겠다는 이야기가 나온 상태여서, 계약서의 몰수 조항과 실제 위반 여부를 함께 확인해야 합니다.
- `ds_deduct_no_list` — 공제 내역 없이 보증금 일부를 빼겠다고 해, 항목과 금액을 서면으로 받아 두는 것이 좋습니다.
- `pc_amount_exceeds` — 요구 금액이 계약서 위약금 조항보다 큰 것으로 보여, 금액 계산 근거를 확인해야 합니다.
- `pc_no_clause` — 계약서에 위약금 조항이 없는데 금액을 요구받아, 그 금액의 근거를 확인해야 합니다.
- `pc_damage_claim` — 위약금 외에 손해배상까지 요구받아, 항목별로 실제 손해가 있는지 나누어 확인해야 합니다.
- `ar_paid_not_counted` — 이미 보낸 임대료가 반영되지 않은 상태여서, 송금 내역으로 사실관계를 먼저 정리해야 합니다.
- `fc_other_breached` / `gp_counter_breach` — 상대방의 계약 위반이 통보에서 빠져 있어, 양쪽 위반 사실을 날짜순으로 정리해 둘 필요가 있습니다.
- `cd_admit_ongoing` — 문제가 된 사용 방식이 지금도 이어지고 있어, 통보 내용이 그대로 인정될 가능성을 함께 봐야 합니다.
- `ow_sale_buyer_wants_empty` / `ow_own_use` — 계약 기간이 남은 상태에서 상대방 사정으로 나가 달라는 요구여서, 계약이 새 주인에게 이어지는지와 보상 조건을 확인해야 합니다.
- `sd_broker` / `sd_unknown` — 통보가 계약 상대방 본인의 뜻인지 확인되지 않아, 본인에게 직접 확인하는 것이 먼저입니다.
- `ol_not_leaving` / `ol_third_party` — 세입자가 나가지 않거나 다른 사람이 살고 있어, 집을 돌려받는 절차를 서두르기 전에 계약과 통지 기록을 먼저 정리해야 합니다.
- `role_company_staff` — 계약 당사자가 회사여서, 회사가 상대방에게 어떻게 대응하고 있는지부터 확인해야 합니다.

**확인 필요**
- `dm_unclear` — 상대방이 무엇을 요구하는지 정리되지 않아, 통보 원문부터 다시 확인해야 합니다.
- `np_lang_unread` / `md_lang_unclear` — 계약서나 통보가 베트남어라 핵심 조항과 날짜를 아직 확인하지 못했습니다.
- `np_no_contract` — 계약서 사본이 없어, 통지 기간과 위약금 조건을 비교할 기준이 아직 없습니다.
- `nf_oral` — 통보를 말로만 받아, 날짜와 요구 내용을 서면이나 메시지로 다시 받아 둘 필요가 있습니다.
- `md_not_stated` — 퇴거 날짜가 정해지지 않아, 언제까지인지 상대방에게 확인해야 합니다.
- `fc_cannot_compare` — 통보 내용과 실제를 아직 비교하지 못해, 자료를 모아 사실관계부터 정리해야 합니다.
- `gp_no_proof_yet` / `ev_none` — 실제와 다르다는 점을 보여 줄 자료가 아직 없어, 송금 내역과 메시지부터 모아야 합니다.
- `pc_unknown` — 요구 금액의 계산 방법을 모르는 상태여서, 항목별 내역을 상대방에게 받아 둘 필요가 있습니다.
- `cr_no_reply` / `rd_via_broker` — 대응 내용이 상대방에게 전달됐는지 확인되지 않아, 직접 확인 기록을 남겨야 합니다.

판정 규칙: 전문가 권장 신호가 하나라도 있으면 "전문가 권장", 주의 신호 2개 이상이면 "주의", 그 외는 "확인 필요"로 표시한다. 결과 문장은 법적 결과를 단정하지 않고 "~확인이 필요합니다 / ~가능성을 함께 봐야 합니다"로 끝낸다.

### 1차 결과 §03 소제목 [대표 승인 2026-10-07, C1.21]
- firstResultCautionsSectionSubtitle: `| 통보 대응 핵심 포인트`

### 1차 판정 하한 [대표 승인 2026-10-07, C1.22]
- firstResultVerdictFloor: true
- 계약 이후 통보·분쟁 상태 서비스: 1차 판정 최소 주의 요망(2단계). Pack 합산이 더 높은 단계면 유지.

### 1차 결과 §03 위험 0건 + 판정 하한 [대표 승인 2026-10-07, C1.25]
- firstResultNoRiskFloorTitle: `먼저 확인할 사항`
- firstResultNoRiskFloorBody: `받은 통보문 원문과 계약서의 해지·통지 조항을 나란히 놓고, 통지 기간과 방식이 맞는지 먼저 보세요.`

### 1차 판정 상향 (phase1 주의 헤드라인) [대표 승인 2026-10-07, C1.21]
다음 phase1 선택값이 하나라도 있으면 1차 헤드라인·등급·02 카드 톤을 주의 단계로 올린다(그 외 조합은 변경 없음).
- `r3_dm_terminate`
- `r3_dm_money_claim`
- `r3_dm_vacate_date`

### 1차 결과 "핵심 확인 결과" 3칸 문장 규칙
- **상황**: `re03_my_role` + `re03_demand_type`를 한 문장으로 합친다. 형식: "[역할]로서 상대방에게서 [요구 내용] 통보를 받은 상황입니다."
  - 역할: role_tenant "임차인", role_company_staff "회사 명의 계약의 거주자", role_subtenant "원래 세입자에게서 다시 빌린 거주자", role_landlord "집주인", role_proxy "계약 당사자를 대신해 확인하는 분"
  - 요구 내용: dm_fix_breach "기간 내 시정 요구", dm_terminate "계약 해지", dm_vacate_date "날짜를 정한 퇴거", dm_money_claim "위약금·손해배상 요구", dm_unclear "요구 내용이 분명하지 않은"
- **확인 목표**: `re03_confirm_goal`을 한 문장으로 바꾼다.
  - cg_validity "통보가 계약서 조항과 통지 기간에 맞는지 확인하는 것이 먼저입니다."
  - cg_move_timing "집을 비워야 하는 시점과 그 전에 할 일을 확인하는 것이 먼저입니다."
  - cg_money "보증금 정리와 위약금·손해배상 여부를 확인하는 것이 먼저입니다."
  - cg_fact_gap "통보 사유 중 사실과 다른 부분을 정리하는 것이 먼저입니다."
  - cg_order "무엇부터 진행할지 순서를 정하는 것이 먼저입니다."
- **대응·자료**: `re03_response_status`를 한 문장으로 바꾸고, 대응이 있었으면 "그 기록을 남겨 두는 것이 중요합니다."를 붙인다.
  - rs_none "아직 상대방에게 답하지 않은 상태로, 답하기 전에 계약서와 통보 원문을 나란히 확인하는 것이 좋습니다."
  - rs_inquired "이유를 물어본 상태로, 상대방의 답을 서면이나 메시지로 받아 두는 것이 좋습니다."
  - rs_disputed "사실과 다르다고 말한 상태로, 이를 뒷받침할 송금 내역·메시지·사진을 모아야 합니다."
  - rs_complied_part "요구 일부를 이행한 상태로, 이행한 날짜와 내용을 보여 줄 기록이 필요합니다."
  - rs_negotiating "조건을 협의 중인 상태로, 합의한 날짜와 금액은 반드시 서면으로 남겨야 합니다."

### "지금 확인해 보세요" STEP 3개
1. **계약서와 통보를 나란히 놓고 비교하기** — 계약서에서 해지 사유·통지 기간·위약금·보증금 반환 조항을 찾아, 통보에 적힌 날짜와 요구가 그 조항과 맞는지 표시해 보세요. 베트남어 계약서라면 해당 조항만이라도 번역해 두세요.
2. **사실을 보여 줄 자료를 날짜순으로 모으기** — 통보 원본이나 메시지 캡처, 임대료·관리비 송금 내역, 상대방·중개인과 주고받은 대화, 입주 때와 지금의 집 상태 사진을 한곳에 모아 날짜순으로 정리해 두세요.
3. **답변과 합의는 기록이 남는 방법으로 하기** — 상대방에게 답하거나 날짜·금액을 합의할 때는 서면이나 메시지로 남기고, 집을 비우게 된다면 보증금 정리 내용·집 상태 확인·열쇠 반납을 기록으로 남긴 뒤, 새 주소에서 임시거주 신고(공안)를 다시 해야 하는지도 확인해 두세요.
