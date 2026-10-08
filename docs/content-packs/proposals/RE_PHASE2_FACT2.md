# RE phase2 fact2 (C2.3e — 수작업 원본)

Pack `personalizedPhase2Fact2` 와 1:1 동기화. 자동 생성 금지.

## RE01

| field=value | 선택지 라벨 | fact2 | 비고 |
|---|---|---|---|
| `re01_sign_deadline=r1_sd_passed` | 약속한 날짜가 이미 지났고, 상대방이 계속 진행할지 확실하지 않습니다. | 약속한 서명·진행 일정이 이미 지난 상태라는 점 | |
| `re01_owner_doc_check=r1_od_refused_delay` | 핑크북을 보여 달라고 했지만, 계속 미루거나 보여 줄 수 없다고 합니다. | 핑크북 원본 확인을 계속 미루거나 거절당했다는 점 | |
| `re01_owner_authority=r1_oa_poa_unseen` | 위임장이 있다고 말로만 들었고, 실제 위임장은 보지 못했습니다. | 위임장을 말로만 들었고 실물은 보지 못했다는 점 | |
| `re01_owner_authority=r1_oa_relative_no_doc` | 소유자의 가족이 대신 서명한다고 하며, 위임장 이야기는 없었습니다. | 가족이 대신 서명한다고 했으나 위임장은 없었다는 점 | |
| `re01_owner_authority=r1_oa_co_owner_one` | 핑크북에 부부 등 여러 명이 적혀 있는데, 그중 한 사람만 서명한다고 합니다. | 공동 소유자 중 한 사람만 서명한다고 했다는 점 | |
| `re01_transfer_account=r1_ta_third_party` | 소유자의 가족이나 다른 사람 명의 계좌로 보내라고 했고, 그 이유는 듣지 못했습니다. | 소유자가 아닌 제3자 명의 계좌로 송금하라는 요청을 받았다는 점 | |
| `re01_payment_schedule=r1_ps_price_split` | 계약서에 적는 금액과 실제로 주고받는 금액을 다르게 하자는 제안을 받았습니다. | 계약서 금액과 실제 주고받는 금액을 다르게 적자는 제안을 받았다는 점 | |
| `re01_payment_schedule=r1_ps_lump_sum_first` | 명의 이전이나 핑크북 발급 전에, 대금 대부분이나 전액을 먼저 보내라고 합니다. | 명의 이전 전 대금 대부분 선지급을 요청받았다는 점 | |
| `re01_foreign_eligibility=r1_fe_landed_house` | 프로젝트 밖의 개인 주택(토지가 딸린 집)이고, 외국인 명의가 가능한지 확인하지 못했습니다. | 개인 주택의 외국인 명의 가능 여부를 확인하지 못했다는 점 | |
| `re01_commercial_use=r1_cu_sublease` | 건물주가 아니라, 건물을 먼저 빌린 사람에게서 다시 빌리는 구조입니다. | 건물주가 아닌 전대인에게서 다시 빌린 상태라는 점 | |
| `re01_owner_doc_check=r1_od_copy_only` | 핑크북 사본이나 사진만 받았고, 원본은 아직 보지 못했습니다. | 핑크북 원본은 보지 못하고 사본만 받았다는 점 | |
| `re01_owner_doc_check=r1_od_signer_differs` | 핑크북은 봤지만, 소유자와 계약서에 서명할 사람이 다릅니다. | 핑크북 소유자와 계약 서명자가 다르다는 점 | |
| `re01_owner_doc_check=r1_od_project_no_book` | 분양 아파트라 핑크북은 아직 없고, 개발사 계약서와 사업 관련 서류만 받았습니다. | 분양 단계라 핑크북 없이 개발사 서류만 받았다는 점 | |
| `re01_penalty_clause=r1_pc_one_sided` | 제가 포기하면 계약금을 잃는다는 내용만 있고, 상대방이 어기는 경우는 적혀 있지 않습니다. | 계약금 몰수 조항이 한쪽에게만 유리하게 적혀 있다는 점 | |
| `re01_transfer_account=r1_ta_broker_account` | 중개인이나 중개회사 명의 계좌로 보내라고 했습니다. | 중개인·중개회사 명의 계좌로 송금하라는 요청을 받았다는 점 | |
| `re01_deposit_paid_proof=r1_dp_transfer_only` | 송금 내역은 있지만, 상대방이 서명한 영수증이나 약정서는 받지 못했습니다. | 송금은 했으나 상대방 서명 영수증은 받지 못했다는 점 | |
| `re01_residence_registration=r1_rr_refused_or_fee` | 집주인이 신고를 꺼리거나, 신고해 주는 대신 추가 비용을 요구했습니다. | 임시거주 신고를 거부하거나 추가 비용을 요구했다는 점 | |
| `re01_commercial_use=r1_cu_use_restricted` | 주거용 건물이거나 용도 제한이 있다는 말을 들었지만, 확인하지 못했습니다. | 주거용·용도 제한 이야기를 들었으나 확인하지 못했다는 점 | |
| `re01_foreign_eligibility=r1_fe_quota_verbal` | 외국인도 살 수 있다고 말로만 들었고, 물량이나 프로젝트 조건은 확인하지 못했습니다. | 외국인 구매 가능을 말로만 들었고 문서 확인이 없다는 점 | |
| `re01_broker_role=r1_br_both_sides` | 같은 중개인이 집주인 쪽과 제 쪽 일을 함께 맡고 있습니다. | 같은 중개인이 양쪽 일을 함께 맡고 있다는 점 | |
| `re01_deposit_link=r1_dl_terms_open` | 계약금만 먼저 걸고, 금액이나 세부 조건은 나중에 정하자고 합니다. | 계약금만 먼저 걸고 세부 조건은 나중에 정하자는 요청을 받았다는 점 | |
| `re01_sign_deadline=r1_sd_pressure_days` | '며칠 안에 결정하지 않으면 다른 사람에게 넘긴다'는 말을 들었습니다. | 며칠 안 결정 압박과 다른 사람에게 넘기겠다는 말을 들었다는 점 | |
| `re01_progress_stage=r1_st_deposit_requested` | 계약서에 서명하기 전에, 계약금부터 먼저 보내라는 요청을 받았습니다. | 서명 전 계약금 선지급을 요청받았다는 점 | |
| `re01_foreign_eligibility=r1_fe_term_unknown` | 살 수는 있다고 들었지만, 외국인인 제가 소유할 수 있는 기간과 연장 가능 여부는 설명받지 못했습니다. | 외국인 소유 기간·연장 조건을 설명받지 못했다는 점 | |
| `re01_condition_compare=r1_cc_scope_diff` | 가구·관리비·주차 등 포함된다고 들은 항목이 빠져 있거나 다르게 적혀 있습니다. | 처음 들은 포함 항목이 계약서와 다르게 적혀 있다는 점 | |
| `re01_deposit_paid_proof=r1_dp_cash_no_receipt` | 계약금을 현금으로 보냈지만 영수증이 없습니다. | 계약금을 현금으로 보냈으나 영수증·확인 문서가 없다는 점 | |
| `re01_deposit_paid_proof=r1_dp_via_broker` | 중개인 계좌로 계약금을 보냈습니다. | 계약금을 중개인 계좌로만 보냈다는 점 | |
| `sd_passed` | (alias) | 약속한 서명·진행 일정이 이미 지난 상태라는 점 | → `re01_sign_deadline=r1_sd_passed` |
| `dp_cash_no_receipt` | (alias) | 계약금을 현금으로 보냈으나 영수증·확인 문서가 없다는 점 | → `re01_deposit_paid_proof=r1_dp_cash_no_receipt` |
| `dp_via_broker` | (alias) | 계약금을 중개인 계좌로만 보냈다는 점 | → `re01_deposit_paid_proof=r1_dp_via_broker` |

## RE02

| field=value | 선택지 라벨 | fact2 | 비고 |
|---|---|---|---|
| `re02_role=role_company_occupant` | 계약은 회사 명의로 했고, 저는 그 집에 실제로 살았던 사람입니다. | 계약은 회사 명의인데 실제 거주자가 따로 있다는 점 | |
| `re02_payment_path=pp_agent_my_side` | 제 쪽에서는 회사·가족·지인이 대신 주고받았고, 저는 직접 관여하지 않았습니다. | 돈을 회사·가족·지인이 대신 주고받았다는 점 | |
| `re02_dispute_type_holder=hd_double_demand` | 제 사정으로 계약을 진행하지 못하게 되자, 상대방이 계약금의 두 배를 돌려달라고 요구하고 있습니다. | 계약이 무산된 뒤 계약금 두 배 반환을 요구받았다는 점 | |
| `re02_contract_form=cf_signer_doubt` | 계약서는 있지만, 상대방 서명이 빠져 있거나 실제 소유자가 아닌 사람이 서명했습니다. | 계약서 서명자가 소유자와 다르거나 서명이 빠져 있다는 점 | |
| `re02_money_evidence=me_none` | 계약서·송금 내역·받았다는 메시지 등 확인할 수 있는 자료가 없습니다. | 돈을 주고받은 사실을 확인할 자료가 없다는 점 | |
| `re02_cash_proof=cp_nothing` | 찾아봤지만, 돈을 주고받은 사실을 확인할 방법이 없습니다. | 돈을 주고받은 사실을 확인할 방법이 없다는 점 | |
| `re02_broker_hold=bh_still_holding` | 중개인이 아직 돈을 보관하고 있다고 하지만, 돌려주지 않고 있습니다. | 중개인이 돈을 아직 보관하고 있다는 점 | |
| `re02_broker_hold=bh_broker_unreachable` | 중개인과도 연락이 잘 되지 않아, 돈이 지금 어디에 있는지 모릅니다. | 중개인과 연락이 끊겨 돈 위치를 모른다는 점 | |
| `re02_contract_end=end_me_short_notice` | 제가 먼저 계약을 끝냈지만, 미리 알린 기간이 계약서보다 짧았거나 따로 알리지 못했습니다. | 먼저 계약을 끝냈으나 통지 기간이 짧았거나 알리지 못했다는 점 | |
| `re02_contract_end=end_not_ended` | 계약은 아직 끝나지 않았지만, 돈 문제로 이미 다툼이 생겼습니다. | 계약이 끝나지 않았는데 돈 문제로 다투고 있다는 점 | |
| `re02_dispute_type=dt_deposit_forfeited` | 계약이 진행되지 않자, 상대방이 계약금을 모두 가져가겠다고 하고 있습니다. | 상대방이 계약금을 모두 가져가겠다고 한다는 점 | |
| `re02_dispute_type_holder=hd_forfeit_dispute` | 상대방이 계약을 포기해 계약금을 돌려주지 않으려 하는데, 상대방은 돌려달라고 요구하고 있습니다. | 계약금 반환을 서로 다르게 주장하고 있다는 점 | |
| `re02_dispute_type=dt_extra_claim` | 돌려받기는커녕, 위약금이나 추가 금액을 더 내라는 요구를 받고 있습니다. | 보증금 반환 대신 추가 금액을 요구받았다는 점 | |
| `re02_dispute_type_holder=hd_extra_claim` | 손해나 밀린 금액이 보증금보다 커서 차액을 요구했지만, 상대방이 지급하지 않고 있습니다. | 차액을 요구했으나 상대방이 지급하지 않는다는 점 | |
| `re02_dispute_type=dt_contact_avoided` | 돌려주겠다는 말은 들었지만, 그 뒤로 상대방이 연락을 피하거나 답이 없습니다. | 반환 약속 후 상대방이 연락을 피한다는 점 | |
| `re02_dispute_type_holder=hd_contact_lost` | 상대방이 밀린 금액을 남긴 채 집을 비웠거나, 연락을 끊었습니다. | 상대방이 집을 비우고 연락이 끊겼다는 점 | |
| `re02_other_reaction=rx_ignored` | 메시지를 읽고도 답이 없거나, 연락을 피하고 있습니다. | 메시지에 답이 없거나 연락을 피한다는 점 | |
| `re02_forfeit_clause=fc_no_clause` | 계약서는 있지만, 계약금을 어떻게 처리하는지에 대한 조항은 따로 없습니다. | 계약금 처리 조항이 계약서에 없다는 점 | |
| `re02_forfeit_clause=fc_one_side` | 한쪽이 계약을 깰 때의 처리만 적혀 있고, 반대의 경우는 적혀 있지 않습니다. | 계약금 조항이 한쪽에게만 적혀 있다는 점 | |
| `re02_money_evidence=me_cash_message` | 현금으로 주고받았고, 받았다는 메시지나 손으로 쓴 영수증만 남아 있습니다. | 현금 거래에 메시지·손글씨 영수만 남았다는 점 | |
| `re02_cash_proof=cp_withdrawal_only` | 현금을 인출한 은행 기록은 있지만, 상대방에게 건넨 기록은 없습니다. | 현금 인출 기록만 있고 상대방 전달 기록이 없다는 점 | |
| `re02_payment_path=pp_via_broker` | 중개인을 거쳐 주고받았고, 상대방에게 실제로 전달되었는지는 중개인 말로만 알고 있습니다. | 중개인을 거쳐 주고받았고 전달 여부는 말로만 알고 있다는 점 | |
| `re02_broker_hold=bh_delivered_word` | 중개인은 전달했다고 하지만, 전달한 기록은 확인하지 못했습니다. | 중개인이 전달했다고만 하고 기록은 없다는 점 | |
| `re02_other_reaction=rx_counter_claim` | 오히려 손해나 위약금을 이유로, 저에게 돈을 더 요구했습니다. | 상대방이 손해·위약금을 이유로 돈을 더 요구했다는 점 | |
| `re02_deadline=dl_other_demand` | 상대방이 정한 날짜까지 돈을 보내거나 합의하라고 요구했습니다. | 상대방이 정한 기한까지 돈이나 합의를 요구받았다는 점 | |
| `re02_deadline=dl_my_schedule` | 출국·이사·다음 계약 등 제 일정 때문에, 그 전에 정리되어야 합니다. | 출국·이사 등 일정 때문에 그 전에 정리가 필요하다는 점 | |
| `re02_deduction_items=ded_no_itemization` | 항목 설명 없이 금액만 공제된(공제한) 부분 | 공제 항목 설명 없이 금액만 빼겠다고 한다는 점 | |
| `re02_extra_claim_detail=xc_unclear_basis` | 명목이나 계산 근거가 정리되지 않은 금액이고, 서로 설명이 엇갈리고 있습니다. | 추가 요구 금액의 명목·근거가 정리되지 않았다는 점 | |
| `re02_forfeit_clause=fc_cannot_read` | 계약서가 베트남어로만 되어 있어, 그런 조항이 있는지 확인하지 못했습니다. | 베트남어 계약서라 몰수 조항을 읽지 못했다는 점 | |
| `re02_contract_form=cf_vn_only` | 베트남어로만 된 계약서에 서명했고, 내용을 모두 이해하지는 못했습니다. | 베트남어 계약서만 있고 내용을 모두 이해하지 못했다는 점 | |
| `re02_handover_record=ho_not_handed` | 아직 열쇠나 집을 넘겨주지 않았거나, 넘겨준 날짜를 두고 다툼이 있습니다. | 열쇠·인도 날짜가 아직 정리되지 않았다는 점 | |
| `re02_payment_path=pp_unclear` | 누구 명의 계좌로 오갔는지, 실제로 누가 받았는지 확실하지 않습니다. | 누가 실제로 돈을 받았는지 확실하지 않다는 점 | |
| `re02_payment_path=pp_agent_other_side` | 상대방 쪽에서는 가족이나 관리인 등 다른 사람이 대신 받거나 보냈습니다. | 상대방 쪽 대리인이 대신 받거나 보냈다는 점 | |
| `re02_situation_match=sm_mismatch` | 상대방이 말하는 일은 실제로 없었거나, 책임은 오히려 상대방에게 있다고 생각합니다. | 상대방 주장과 실제 경험이 다르다고 보는 상황이라는 점 | |
| `re02_situation_match=sm_hard_to_judge` | 기록이 남아 있지 않아, 누구 말이 맞는지 비교하기 어렵습니다. | 날짜별 사실을 비교할 기록이 부족하다는 점 | |

## RE03

| field=value | 선택지 라벨 | fact2 | 비고 |
|---|---|---|---|
| `re03_occupancy_tenant=r3_oc_locked_out` | 상대방이 열쇠를 바꾸거나 전기·수도를 끊어, 집을 제대로 쓰지 못하고 있습니다. | 열쇠·전기·수도 때문에 집을 쓰지 못하고 있다는 점 | |
| `re03_occupancy_tenant=r3_oc_belongings_threat` | 정해진 날까지 나가지 않으면, 짐을 밖으로 내놓겠다는 말을 들었습니다. | 짐을 밖으로 내놓겠다는 말을 들었다는 점 | |
| `re03_counter_reaction=r3_cr_legal_threat` | 법원이나 공안에 신고하겠다고 했거나, 이미 절차를 시작했다고 했습니다. | 법원·공안 신고를 하겠다고 했다는 점 | |
| `re03_owner_reason_fact=r3_ow_bank_issue` | 은행 담보나 집주인의 빚 문제로, 집이 다른 사람에게 넘어갈 수 있다는 이야기를 들었습니다. | 집주인 빚·담보로 권리가 넘어갈 우려를 들었다는 점 | |
| `re03_my_role=r3_role_subtenant` | 원래 세입자에게서 다시 빌려 살고 있고, 집주인과 직접 맺은 계약은 없습니다. | 집주인과 직접 계약 없이 전세에서 다시 빌려 살고 있다는 점 | |
| `re03_notice_period=r3_np_shorter` | 계약서에 통지 기간 조항이 있지만, 이번 통보는 그보다 짧은 기간만 주었습니다. | 통보 기간이 계약서보다 짧게 잡혀 있다는 점 | |
| `re03_move_out_deadline=r3_md_immediate` | 날짜 없이, 바로 또는 며칠 안에 집을 비우라는(비우겠다는) 말만 들었습니다. | 날짜 없이 곧 집을 비우라는 말만 들었다는 점 | |
| `re03_deposit_status=r3_ds_forfeit` | 계약 위반을 이유로, 보증금을 전혀 돌려주지 않겠다는 이야기가 나왔습니다. | 보증금을 전혀 돌려주지 않겠다는 이야기가 나왔다는 점 | |
| `re03_deposit_status=r3_ds_deduct_no_list` | 일부를 빼고 돌려준다고 했지만, 무엇을 얼마나 빼는지 내역은 받지 못했습니다. | 공제 내역 없이 보증금 일부를 빼겠다고 한다는 점 | |
| `re03_penalty_clause=r3_pc_amount_exceeds` | 위약금 조항은 있지만, 요구받은 금액이 조항보다 크거나 다른 항목이 더 붙어 있습니다. | 요구 위약금이 계약 조항보다 크다는 점 | |
| `re03_penalty_clause=r3_pc_no_clause` | 계약서에 위약금 조항이 없는데, 상대방이 금액을 정해서 요구했습니다. | 위약금 조항 없이 금액을 정해 요구받았다는 점 | |
| `re03_penalty_clause=r3_pc_damage_claim` | 위약금과 별도로, 수리비·공실 손해 등 손해배상을 추가로 요구받았습니다. | 위약금 외 수리·공실 손해를 추가로 요구받았다는 점 | |
| `re03_arrears_fact=r3_ar_paid_not_counted` | 이미 송금했는데, 상대방이 받지 못했다고 하거나 반영하지 않았습니다. | 이미 낸 돈이 상대방 기록에 반영되지 않았다는 점 | |
| `re03_conduct_fact=r3_cd_admit_ongoing` | 그런 일이 있었던 것은 맞고, 지금도 같은 방식으로 쓰고 있습니다. | 지적된 행위가 있었고 같은 방식으로 쓰고 있다는 점 | |
| `re03_my_role=r3_role_company_staff` | 회사 명의로 계약된 집에 살고 있고, 계약 당사자는 제가 아닌 회사입니다. | 회사 명의 계약 집에 거주 중이고 당사자가 회사인 상태라는 점 | |
| `re03_demand_type=r3_dm_terminate` | 계약을 끝내겠다는 통보였고, 언제 집을 비워야 하는지는 아직 정해지지 않았습니다. | 계약 종료 통보를 받았고 퇴거 날짜는 아직 없다는 점 | |
| `re03_demand_type=r3_dm_money_claim` | 계약 위반을 이유로, 위약금이나 손해배상 명목의 돈을 내라는 요구를 받았습니다. | 위약금·손해배상 명목의 돈을 요구받았다는 점 | |
| `re03_demand_type=r3_dm_vacate_date` | 계약을 끝내면서, 정해진 날짜까지 집을 비우라는(또는 비우겠다는) 날짜가 적혀 있었습니다. | 계약 종료와 함께 정해진 퇴거 날짜가 있다는 점 | |

## RE04

| field=value | 선택지 라벨 | fact2 | 비고 |
|---|---|---|---|
| `re04_contract_access=ca_sublease` |  | 집주인과 직접 맺지 않은 재임대로 거주하는 상황이라는 점 | |
| `re04_fee_detail=fd_prior_arrears` | 집주인이나 전 세입자가 밀린 요금 때문에, 전기·수도가 끊기거나 끊긴다는 안내를 받았습니다. | 전기·수도가 밀려 끊기거나 끊긴다는 안내를 받았다는 점 | |
| `re04_threat_detail=td_cut_utilities` | 전기·수도·인터넷을 끊거나 출입카드를 막겠다고 했고, 그중 일부는 이미 실제로 끊기거나 막혔습니다. | 전기·수도·출입을 끊거나 막겠다고 했다는 점 | |
| `re04_rent_status=rs_withholding` | 상대방이 해결할 때까지, 월세나 요금의 일부 또는 전부를 내지 않고 있습니다. | 월세나 요금 일부·전부를 내지 않고 있다는 점 | |
| `re04_rent_status=rs_deducted_cost` | 제가 쓴 수리비나 잘못 청구된 금액을 빼고, 남은 금액만 월세로 보냈습니다. | 수리비 등을 빼고 남은 금액만 월세로 보냈다는 점 | |
| `re04_withhold_notice=wn_not_notified` | 따로 알리지 않고, 월세만 덜 보내거나 보내지 않았습니다. | 알리지 않고 월세를 덜 보냈다는 점 | |
| `re04_withhold_notice=wn_landlord_objected` | 상대방이 이를 연체라고 하며, 계약 해지나 보증금 공제를 언급했습니다. | 월세 삭감에 상대방이 해지·공제를 언급했다는 점 | |
| `re04_threat_detail=td_vacate_early` | 계약 기간이 남았는데, 정해진 날까지 집을 비우라고 했습니다. | 계약 기간 중 집을 비우라는 요구를 받았다는 점 | |
| `re04_deadline=dl_vacate_demand` | 상대방이 정한 날짜까지 집을 비우라고 요구하고 있습니다. | 상대방이 정한 날까지 집을 비우라는 요구를 받았다는 점 | |
| `re04_threat_detail=td_residence_registration` | 임시거주 신고를 해 주지 않거나, 이미 한 신고를 정리하겠다고 했습니다. | 임시거주 신고를 거부하거나 정리하겠다고 했다는 점 | |
| `re04_since_when=sw_over_month` | 한 달 넘게 계속되고 있고, 그동안 생활의 불편이나 비용이 쌓이고 있습니다. | 같은 문제가 한 달 넘게 이어지고 있다는 점 | |
| `re04_since_when=sw_recurring` | 한 번 고쳤거나 정리되었는데, 얼마 지나지 않아 같은 문제가 다시 생겼습니다. | 고쳤으나 같은 문제가 다시 생겼다는 점 | |
| `re04_repair_detail=rd_electric_fault` | 차단기가 자주 내려가거나 콘센트·조명이 작동하지 않아, 감전이나 화재가 걱정됩니다. | 전기·조명이 불안정해 생활이 어렵다는 점 | |
| `re04_repair_detail=rd_door_window` | 출입문 잠금장치나 창문·방범창이 고장 나, 문단속이 제대로 되지 않습니다. | 문·창문 잠금이 고장 나 출입이 불안하다는 점 | |
| `re04_defect_claim=dc_deposit_deduction` | 이 하자 비용을 계약이 끝날 때 보증금에서 빼겠다고 이미 말했습니다. | 하자 비용을 보증금에서 빼겠다고 이미 말했다는 점 | |
| `re04_handover_record=hr_told_verbally` | 입주할 때 하자를 말로만 알렸고, 따로 남긴 기록은 없습니다. | 입주 때 하자를 말로만 알렸고 기록이 없다는 점 | |
| `re04_handover_record=hr_no_record` | 입주할 때 집 상태를 따로 기록하거나 확인하지 않았습니다. | 입주 때 집 상태를 따로 기록하지 않았다는 점 | |
| `re04_contract_access=ca_verbal_only` | 정식 계약서 없이, 메시지나 말로만 월세와 조건을 정했습니다. | 정식 계약서 없이 말·메시지로만 조건을 정했다는 점 | |
| `re04_contract_access=ca_no_copy` | 서명은 했지만 사본을 받지 못했고, 원본(공증본 포함)은 집주인이나 중개인만 가지고 있습니다. | 서명했으나 계약 사본을 받지 못했다는 점 | |
| `re04_self_repair=sr_paid_no_receipt` | 제가 먼저 고쳤지만, 현금으로 줘서 영수증은 받지 못했습니다. | 먼저 수리했으나 영수증을 받지 못했다는 점 | |
| `re04_self_repair=sr_paid_no_consent` | 상대방의 동의 없이 고쳤고, 상대방은 그 비용을 인정하지 않고 있습니다. | 동의 없이 수리했고 비용을 인정받지 못했다는 점 | |
| `re04_rent_status=rs_considering_withhold` | 아직 내고 있지만, 해결되지 않으면 월세를 멈추려고 생각하고 있습니다. | 월세 지급을 멈추려는 상황이라는 점 | |
| `re04_other_response=or_counter_threat` | 계속 문제 삼으면 계약을 끝내거나 보증금을 돌려주지 않겠다는 말을 했습니다. | 문제 제기에 계약 종료·보증금 미반환을 언급했다는 점 | |
| `re04_entry_detail=ed_entered_absent` | 제가 없을 때 알리지 않고 들어왔고, 물건이 옮겨져 있거나 들어온 흔적이 남아 있었습니다. | 부재 중 무단 출입 흔적이 있다는 점 | |
| `re04_entry_detail=ed_unilateral_device` | 집 안이나 현관에 카메라를 달거나 잠금장치를 바꾸는 등, 저와 상의 없이 조치했습니다. | 상의 없이 잠금·카메라 등을 설치했다는 점 | |
| `re04_living_impact=li_staying_elsewhere` | 계속 살기 어려워, 임시로 다른 곳에 머물고 있거나 이사를 고민하고 있습니다. | 집에 살기 어려워 다른 곳에 머물고 있다는 점 | |
| `re04_fact_compare=fc_false_no_proof` | 상대방 주장은 실제와 다르지만, 이를 보여 줄 기록이 부족합니다. | 상대 주장과 다르지만 입증 자료가 부족하다는 점 | |
| `re04_evidence=ev_none` | 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다. | 문제를 보여 줄 자료가 없거나 아직 모은 상태라는 점 | |
| `re04_notify_status=nt_verbal_only` | 전화하거나 직접 만나서 말로만 알렸고, 따로 남아 있는 기록은 없습니다. | 전화·대면으로만 알렸고 남은 기록이 없다는 점 | |
| `re04_notify_status=nt_via_agent` | 중개인이나 관리사무소를 통해 전달했고, 상대방에게 직접 말하지는 않았습니다. | 중개인·관리실을 통해 전달했고 직접 말하지 않았다는 점 | |
| `re04_other_response=or_silent_or_relay` | 답이 없거나, 중개인·관리사무소가 전달했다고만 하고 상대방의 답은 듣지 못했습니다. | 답이 없거나 전달만 되고 상대 답은 없다는 점 | |
| `re04_contract_clause=cl_tenant_clear` | 서면 계약서에, 이 문제는 임차인이 부담한다고 적혀 있어 제가 불리할 수 있습니다. | 계약서에 임차인 단독 부담으로 적혀 있다는 점 | |
| `re04_fee_detail=fd_electric_rate` | 전기요금이 전력회사 청구 금액보다 높은 단가로 계산되어 청구되고 있습니다. | 전기요금이 단가가 높게 청구되고 있다는 점 | |
| `re04_fee_detail=fd_unilateral_increase` | 계약 기간 중인데, 관리비나 요금 단가를 미리 합의 없이 올렸습니다. | 관리비·요금이 합의 없이 올랐다는 점 | |
| `re04_living_impact=li_belongings_damaged` | 제 가구·전자제품·옷 같은 물건이 손상되었거나, 없어진 것이 있습니다. | 가구·물건이 손상되었거나 없어졌다는 점 | |

## RE05

| field=value | 선택지 라벨 | fact2 | 비고 |
|---|---|---|---|
| `re05_counterparty=r5_cp_owner_unclear` | 계약은 했지만, 핑크북상 실제 권리자가 누구인지 확실하지 않습니다. | 핑크북상 실제 권리자가 누구인지 확실하지 않다는 점 | |
| `re05_mortgage=r5_mg_paid_not_released` | 담보를 풀 돈을 이미 지급했지만, 은행에서 담보가 해제되었는지 확인되지 않습니다. | 담보 해제 비용을 냈으나 해제 확인이 안 된다는 점 | |
| `re05_mismatchDetail=r5_mm_owner_name` | 소유자 이름(계약한 매도인과 다른 사람이거나, 공동 소유자가 더 있음) | 핑크북 소유자와 계약 상대가 다르거나 공동 소유가 있다는 점 | |
| `re05_mismatchDetail=r5_mm_forgery_suspect` | 핑크북 자체가 진짜가 아닐 수 있다는 말을 들음 | 핑크북 위조가 의심된다는 점 | |
| `re05_nameOnDocs=r5_nm_buyer_vn_name` | 계약서의 매수인이 제가 아니라 베트남인 지인 이름으로 되어 있습니다. | 매수인 명의가 베트남인 지인으로 적혀 있다는 점 | |
| `re05_foreignDetail=r5_fe_nominee` | 외국인 명의가 어렵다고 해서, 베트남인 지인 이름으로 계약하거나 등록하려고 합니다. | 지인 명의로 등록하자는 이야기가 나왔다는 점 | |
| `re05_rejectionDetail=r5_rj_seller_side` | 매도인 쪽의 은행 담보·압류·분쟁 기록 때문에 명의 이전을 할 수 없다고 했습니다. | 매도인 쪽 담보·압류 때문에 이전이 막혔다는 점 | |
| `re05_counterpartyExplanation=r5_ex_other_dispute` | 상속·이혼·채무 같은 다른 분쟁이 있어, 그 문제가 먼저 풀려야 한다고 했습니다. | 상속·이혼 등 다른 분쟁이 먼저라는 설명을 들었다는 점 | |
| `re05_responseReaction=r5_rr_cancel_mentioned` | 상대방이 계약 해제나 계약금 문제를 먼저 꺼냈습니다. | 상대방이 계약 해제·계약금 문제를 먼저 꺼냈다는 점 | |
| `re05_paidStage=r5_paid_via_broker` | 매도인이 아닌 중개인이나 지인 계좌로 돈을 보냈고, 매도인이 실제로 받았는지는 확인하지 못했습니다. | 매도인이 아닌 계좌로 돈을 보냈다는 점 | |
| `re05_counterparty=r5_cp_broker_only` | 중개인을 통해서만 진행했고, 매도인을 직접 만나거나 연락한 적은 없습니다. | 매도인을 직접 만나지 않고 중개인 경로로만 진행했다는 점 | |
| `re05_transferDelayDetail=r5_td_mortgage` | 매도인의 은행 담보가 아직 풀리지 않아, 명의 이전 신청을 하지 못하고 있습니다. | 매도인 은행 담보 때문에 이전 신청을 못 하고 있다는 점 | |
| `re05_mortgage=r5_mg_release_unclear` | 은행 담보가 있다고 들었지만, 언제 어떻게 풀리는지는 확인하지 못했습니다. | 담보 해제 시점·방법을 확인하지 못했다는 점 | |
| `re05_projectBookDetail=r5_pb_project_mortgage` | 분양 회사가 프로젝트를 은행 담보로 잡혀 두었고, 그 담보가 풀려야 발급된다고 들었습니다. | 프로젝트 담보 때문에 핑크북 발급이 지연된다는 점 | |
| `re05_projectBookDetail=r5_pb_project_legal` | 분양 회사가 프로젝트 전체의 법적 절차가 끝나지 않아 핑크북 발급이 늦어진다고 설명했습니다. | 프로젝트 법적 절차 때문에 발급이 늦어진다는 점 | |
| `re05_nameOnDocs=r5_nm_family_coowner` | 핑크북에 매도인 외에 배우자나 가족도 함께 적혀 있는데, 계약서에는 매도인만 서명했습니다. | 공동 소유자가 있는데 한 사람만 서명했다는 점 | |
| `re05_nameOnDocs=r5_nm_proxy` | 핑크북 소유자는 따로 있고, 계약은 위임장을 가진 대리인과 맺었습니다. | 대리인과 계약했고 위임 범위를 확인하지 못했다는 점 | |
| `re05_nameOnDocs=r5_nm_not_seen` | 핑크북 원본이나 사본을 직접 보지 못해, 누구 이름인지 확인하지 못했습니다. | 핑크북을 직접 확인하지 못했다는 점 | |
| `re05_foreignDetail=r5_fe_land_house` | 분양 프로젝트가 아닌, 땅이 딸린 단독주택이나 타운하우스를 사려고 했습니다. | 분양이 아닌 단독·타운하우스를 사려는 상황이라는 점 | |
| `re05_rejectionDetail=r5_rj_foreign_status` | 외국인 명의로는 등록할 수 없는 집이라는 이유를 들었습니다. | 외국인 명의로 등록할 수 없다는 이유를 들었다는 점 | |
| `re05_foreignDetail=r5_fe_quota_full` | 분양 아파트인데, 그 건물에서 외국인이 살 수 있는 물량이 다 찼다는 말을 들었습니다. | 외국인 구매 물량이 찼다는 말을 들었다는 점 | |
| `re05_promisedDate=r5_pd_postponed` | 여러 차례 날짜를 다시 미루었고, 지금은 새 날짜도 정해지지 않았습니다. | 약속 날짜가 여러 번 미뤄졌다는 점 | |
| `re05_promisedDate=r5_pd_written_passed` | 계약서에 날짜가 적혀 있고, 그 날짜가 이미 지났습니다. | 계약서상 날짜가 이미 지났다는 점 | |
| `re05_counterpartyExplanation=r5_ex_extra_cost` | 급행 비용이나 명목이 분명하지 않은 추가 비용을 내야 진행된다고 했습니다. | 명목 불명의 추가 비용 요구를 들었다는 점 | |
| `re05_responseReaction=r5_rr_more_money` | 진행하려면 추가 금액이나 세금을 더 내야 한다고 했습니다. | 추가 금액·세금 지급을 요구받았다는 점 | |
| `re05_counterpartyExplanation=r5_ex_no_explanation` | 이유를 설명하지 않거나, 연락을 피하고 있습니다. | 이유 설명 없이 연락을 피한다는 점 | |
| `re05_responseReaction=r5_rr_no_contact` | 답변이 없거나, 연락이 끊겼습니다. | 답이 없거나 연락이 끊겼다는 점 | |
| `re05_contractForm=r5_cf_deposit_only` | 계약금 약정서만 썼고, 정식 매매계약서는 아직 쓰지 않았습니다. | 정식 매매계약서 없이 계약금 약정만 있다는 점 | |
| `re05_contractForm=r5_cf_informal_only` | 직접 쓴 계약서나 메시지 약속만 있고, 공증받은 계약서는 없습니다. | 공증 매매계약서 없이 글자 약정만 체결했다는 점 | |
| `re05_deadline=r5_dl_notice_period` | 통지서나 기관 안내에 다시 신청하거나 보완할 수 있는 기간이 적혀 있습니다. | 통지서·기관 안내에 보완 기한이 적혀 있다는 점 | |
| `re05_stage=r5_registration_rejected` | 명의 이전이나 핑크북 발급을 신청했지만, 토지등록사무소에서 받아들이지 않는다는 통지를 받았습니다. | 토지등록사무소에서 이전·발급이 거절됐다는 점 | |
| `re05_stage=r5_book_mismatch` | 핑크북을 확인해 보니, 소유자 이름이나 면적이 계약 내용이나 실제 집과 다릅니다. | 핑크북 내용이 계약·실제와 다르다는 점 | |
| `re05_paidStage=r5_paid_balance` | 잔금까지 모두 지급했지만, 아직 제 이름으로 권리가 넘어오지 않았습니다. | 잔금까지 냈으나 명의가 넘어오지 않았다는 점 | |
| `re05_counterparty=r5_cp_resale_buyer` | 먼저 분양받은 사람에게서 분양 계약을 넘겨받았고, 분양 회사와 직접 계약하지는 않았습니다. | 분양권을 넘겨받았고 분양사와 직접 계약하지 않았다는 점 | |
| `re05_mortgage=r5_mg_unknown` | 담보 여부를 확인해 본 적이 없거나, 확인하는 방법을 모릅니다. | 담보 여부를 확인하지 못했다는 점 | |
| `re05_transferDelayDetail=r5_td_stage_unknown` | 절차를 매도인이나 중개인이 맡고 있어, 지금 어느 단계인지 알지 못합니다. | 이전 절차가 어느 단계인지 모른다는 점 | |
| `re05_transferDelayDetail=r5_td_filed_waiting` | 토지등록사무소에 신청서는 접수되었지만, 안내받은 처리 기간이 지나도 결과가 나오지 않았습니다. | 신청은 했으나 결과가 나오지 않았다는 점 | |
| `re05_transferDelayDetail=r5_td_tax_stage` | 세금 납부 안내까지 받았지만, 누가 세금을 납부할지 정리되지 않아 멈춰 있습니다. | 세금 납부 주체가 정리되지 않아 멈춰 있다는 점 | |
| `re05_counterpartyExplanation=r5_ex_tax_demand` | 명의 이전에 따른 세금을 제가 납부해야 진행된다며, 계약에 없던 금액을 요구했습니다. | 계약에 없던 세금 지급을 요구받았다는 점 | |
| `re05_projectBookDetail=r5_pb_applied_no_proof` | 분양 회사는 이미 신청했다고 하지만, 접수증 같은 근거는 받지 못했습니다. | 핑크북 신청했다는 말만 있고 접수증이 없다는 점 | |
| `re05_handoverCompare=r5_hc_area_diff` | 실제 면적이 계약 면적과 달라, 금액 정산 문제가 남아 있습니다. | 실제 면적과 계약 면적이 달라 정산 문제가 남았다는 점 | |
| `re05_mismatchDetail=r5_mm_area` | 면적(계약서나 실제 집의 ㎡와 다름) | 핑크북·계약·실제 면적이 다르다는 점 | |
| `re05_mismatchDetail=r5_mm_address_use` | 주소·지번·호수, 또는 토지 용도·사용 기간 | 주소·호수·토지 용도가 계약과 다르다는 점 | |
| `re05_contractForm=r5_cf_notarized_vn_only` | 공증사무소에서 공증받은 매매계약서가 있지만, 베트남어로만 되어 있어 내용을 다 이해하지 못했습니다. | 베트남어 공증 계약만 있고 내용을 다 이해하지 못했다는 점 | |
| `re05_blockage=r5_bk_money_decision` | 남은 돈을 지급해야 할지 멈춰야 할지 판단하지 못해, 결정을 미루고 있습니다. | 추가 지급을 멈출지 결정하지 못하고 있다는 점 | |
| `re05_evidence=r5_ev_none` | 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다. | 대조할 자료가 없거나 아직 모은 상태라는 점 | |

