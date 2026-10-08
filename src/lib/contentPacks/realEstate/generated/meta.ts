/* AUTO-GENERATED — scripts/parse-real-estate-meta.mjs */
import type { FPathRow } from "../../engine/types";

export type { FPathRow };

export const REAL_ESTATE_F_PATHS: Record<string, FPathRow[]> = {
  "RE01": [
    {
      "pathId": "C",
      "condition": "re01_progress_stage = r1_st_deposit_paid",
      "label": "**RE01-C 계약금 지급 후 본계약 대기** — 돈은 이미 건너갔고, 증명·상대방 이행 의사·위약 조건이 핵심",
      "chain": [
        "re01_info_channel",
        "re01_broker_role",
        "re01_deposit_paid_proof",
        "re01_transfer_account",
        "re01_post_deposit_status",
        "re01_penalty_clause",
        "re01_contract_form",
        "re01_language_gap",
        "re01_condition_compare",
        "re01_compare_detail",
        "re01_counterparty_reaction",
        "re01_deposit_months",
        "re01_payment_schedule",
        "re01_deposit_link",
        "re01_amount_detail",
        "re01_client_party",
        "re01_foreign_eligibility",
        "re01_commercial_use",
        "re01_project_docs",
        "re01_book_status",
        "re01_owner_authority",
        "re01_sign_deadline",
        "re01_sign_date",
        "re01_evidence",
        "re01_blockage",
        "re01_final_goal"
      ],
      "priority": 1
    },
    {
      "pathId": "B",
      "condition": "re01_progress_stage = r1_st_deposit_requested|r1_ct_deposit_only",
      "label": "**RE01-B 계약서 전 송금 요구** — 돈부터 보내라는 요구에 대해, 계좌 명의·원본 확인 요청에 대한 반응·위약 조건을 먼저 확인",
      "chain": [
        "re01_info_channel",
        "re01_broker_role",
        "re01_precheck_response",
        "re01_transfer_account",
        "re01_penalty_clause",
        "re01_contract_form",
        "re01_language_gap",
        "re01_condition_compare",
        "re01_deposit_months",
        "re01_payment_schedule",
        "re01_deposit_link",
        "re01_amount_detail",
        "re01_project_docs",
        "re01_client_party",
        "re01_foreign_eligibility",
        "re01_commercial_use",
        "re01_book_status",
        "re01_owner_authority",
        "re01_sign_deadline",
        "re01_sign_date",
        "re01_evidence",
        "re01_blockage",
        "re01_final_goal"
      ],
      "priority": 2
    },
    {
      "pathId": "A",
      "condition": "re01_owner_doc_check = r1_od_copy_only|r1_od_signer_differs|r1_od_refused_delay AND re01_progress_stage = r1_st_viewing|r1_st_draft|r1_st_sign_scheduled",
      "label": "**RE01-A 소유자·서명 권한 미확인** — 원본을 못 본 이유, 대리 서명 권한, 확인 요청에 대한 반응을 먼저 추적",
      "chain": [
        "re01_info_channel",
        "re01_broker_role",
        "re01_book_status",
        "re01_owner_authority",
        "re01_precheck_response",
        "re01_contract_form",
        "re01_language_gap",
        "re01_condition_compare",
        "re01_deposit_months",
        "re01_payment_schedule",
        "re01_amount_detail",
        "re01_client_party",
        "re01_residence_registration",
        "re01_commercial_use",
        "re01_foreign_eligibility",
        "re01_penalty_clause",
        "re01_sign_deadline",
        "re01_sign_date",
        "re01_evidence",
        "re01_blockage",
        "re01_final_goal"
      ],
      "priority": 3
    },
    {
      "pathId": "E",
      "condition": "(re01_contract_type = r1_ct_purchase_project) OR re01_owner_doc_check = r1_od_project_no_book",
      "label": "**RE01-E 분양 아파트 매수** — 핑크북 대신 개발사 서류·계약 단계·외국인 물량을 확인",
      "chain": [
        "re01_info_channel",
        "re01_project_docs",
        "re01_client_party",
        "re01_contract_form",
        "re01_language_gap",
        "re01_condition_compare",
        "re01_payment_schedule",
        "re01_amount_detail",
        "re01_foreign_eligibility",
        "re01_penalty_clause",
        "re01_sign_deadline",
        "re01_sign_date",
        "re01_evidence",
        "re01_blockage",
        "re01_final_goal"
      ],
      "priority": 4
    },
    {
      "pathId": "F",
      "condition": "re01_contract_type = r1_ct_purchase_resale",
      "label": "**RE01-F 기존 주택 개인 간 매수** — 공증·지급 순서·담보 해제·외국인 소유 가능 여부",
      "chain": [
        "re01_info_channel",
        "re01_broker_role",
        "re01_client_party",
        "re01_contract_form",
        "re01_language_gap",
        "re01_condition_compare",
        "re01_payment_schedule",
        "re01_amount_detail",
        "re01_foreign_eligibility",
        "re01_penalty_clause",
        "re01_sign_deadline",
        "re01_sign_date",
        "re01_evidence",
        "re01_blockage",
        "re01_final_goal"
      ],
      "priority": 5
    },
    {
      "pathId": "G",
      "condition": "re01_contract_type = r1_ct_lease_office",
      "label": "**RE01-G 사무실·상가 임차** — 계약자 명의, 회사 주소·영업 용도, 전대 구조, 원상복구",
      "chain": [
        "re01_info_channel",
        "re01_broker_role",
        "re01_client_party",
        "re01_commercial_use",
        "re01_contract_form",
        "re01_language_gap",
        "re01_condition_compare",
        "re01_deposit_months",
        "re01_amount_detail",
        "re01_penalty_clause",
        "re01_sign_deadline",
        "re01_sign_date",
        "re01_evidence",
        "re01_blockage",
        "re01_final_goal"
      ],
      "priority": 6
    },
    {
      "pathId": "D",
      "condition": "re01_contract_type = r1_ct_lease_home AND re01_owner_doc_check = r1_od_original_match AND re01_progress_stage = r1_st_viewing|r1_st_draft|r1_st_sign_scheduled",
      "label": "**RE01-D 주거 임대 조항 검토** — 소유자는 확인됐고, 계약서 내용·보증금 반환·임시거주 신고가 핵심",
      "chain": [
        "re01_info_channel",
        "re01_broker_role",
        "re01_contract_form",
        "re01_language_gap",
        "re01_condition_compare",
        "re01_deposit_months",
        "re01_amount_detail",
        "re01_residence_registration",
        "re01_penalty_clause",
        "re01_sign_deadline",
        "re01_sign_date",
        "re01_evidence",
        "re01_blockage",
        "re01_final_goal"
      ],
      "priority": 7
    }
  ],
  "RE02": [
    {
      "pathId": "PATH_A",
      "condition": "PATH_A",
      "label": "**A. 계약 종료 → 보증금 미반환 → 손상 주장**",
      "chain": [
        "re02_other_reason",
        "re02_handover_record",
        "re02_exit_photos",
        "re02_claimed_damage",
        "re02_damage_cause",
        "re02_movein_condition",
        "re02_repair_cost_basis",
        "re02_amount_detail",
        "re02_key_dates",
        "re02_money_evidence",
        "re02_contract_form",
        "re02_cash_proof",
        "re02_payment_path",
        "re02_demand_method",
        "re02_other_reaction",
        "re02_deadline",
        "re02_deadline_date",
        "re02_final_goal"
      ]
    },
    {
      "pathId": "PATH_B",
      "condition": "PATH_B",
      "label": "**B. 계약금 지급 → 계약 취소 → 반환 거부** (돈을 받은 쪽이면: 반환·두 배 반환 요구에 대응)",
      "chain": [
        "re02_cancel_reason",
        "re02_cancel_form",
        "re02_forfeit_clause",
        "re02_condition_met",
        "re02_refusal_reason",
        "re02_return_demand_basis",
        "re02_amount_detail",
        "re02_key_dates",
        "re02_money_evidence",
        "re02_contract_form",
        "re02_cash_proof",
        "re02_payment_path",
        "re02_broker_hold",
        "re02_demand_method",
        "re02_other_reaction",
        "re02_deadline",
        "re02_deadline_date",
        "re02_final_goal"
      ]
    },
    {
      "pathId": "PATH_C",
      "condition": "PATH_C",
      "label": "**C. 일부 반환 → 공제 다툼** (공제 항목: 수리비 / 관리비·공과금 / 미납 임대료 / 위약금)",
      "chain": [
        "re02_amount_state",
        "re02_amount_detail",
        "re02_deduction_items",
        "re02_repair_cost_basis",
        "re02_handover_record",
        "re02_mgmt_fee_basis",
        "re02_unpaid_rent_period",
        "re02_penalty_clause",
        "re02_key_dates",
        "re02_money_evidence",
        "re02_contract_form",
        "re02_cash_proof",
        "re02_payment_path",
        "re02_demand_method",
        "re02_other_reaction",
        "re02_deadline",
        "re02_deadline_date",
        "re02_final_goal"
      ]
    },
    {
      "pathId": "PATH_D1",
      "condition": "PATH_D1",
      "label": "**D1. 보증금 미반환 → 손상 외 사유(조항·위반 주장·자금 사정·이유 없음)·연락 회피**",
      "chain": [
        "re02_other_reason",
        "re02_amount_state",
        "re02_amount_detail",
        "re02_key_dates",
        "re02_money_evidence",
        "re02_contract_form",
        "re02_cash_proof",
        "re02_payment_path",
        "re02_broker_hold",
        "re02_demand_method",
        "re02_other_reaction",
        "re02_situation_match",
        "re02_deadline",
        "re02_deadline_date",
        "re02_blockage",
        "re02_final_goal"
      ]
    },
    {
      "pathId": "PATH_D2",
      "condition": "PATH_D2",
      "label": "**D2. (집주인) 세입자가 밀린 금액을 남기고 이탈**",
      "chain": [
        "re02_amount_state",
        "re02_amount_detail",
        "re02_deduction_items",
        "re02_handover_record",
        "re02_key_dates",
        "re02_money_evidence",
        "re02_contract_form",
        "re02_cash_proof",
        "re02_demand_method",
        "re02_other_reaction",
        "re02_deadline",
        "re02_deadline_date",
        "re02_blockage",
        "re02_final_goal"
      ]
    },
    {
      "pathId": "PATH_E",
      "condition": "PATH_E",
      "label": "**E. 보증금을 넘는 추가 금액 청구**",
      "chain": [
        "re02_extra_claim_detail",
        "re02_handover_record",
        "re02_claimed_damage",
        "re02_repair_cost_basis",
        "re02_penalty_clause",
        "re02_unpaid_rent_period",
        "re02_amount_state",
        "re02_amount_detail",
        "re02_key_dates",
        "re02_money_evidence",
        "re02_contract_form",
        "re02_cash_proof",
        "re02_payment_path",
        "re02_broker_hold",
        "re02_demand_method",
        "re02_other_reaction",
        "re02_situation_match",
        "re02_deadline",
        "re02_deadline_date",
        "re02_blockage",
        "re02_final_goal"
      ]
    }
  ],
  "RE03": [
    {
      "pathId": "A-1",
      "condition": "re03_my_role ≠ r3_role_landlord AND re03_demand_type = r3_dm_fix_breach",
      "label": "A-1 임대료 연체 인정 → 시정 요구",
      "chain": [
        "re03_reason_tenant",
        "re03_arrears_fact",
        "re03_arrears_cause",
        "re03_notice_form",
        "re03_notice_period",
        "re03_key_dates",
        "re03_deposit_status",
        "re03_evidence",
        "re03_blockage",
        "re03_final_goal"
      ]
    },
    {
      "pathId": "A-2",
      "condition": "re03_my_role ≠ r3_role_landlord AND re03_demand_type = r3_dm_vacate_date AND re03_response_status = r3_rs_disputed",
      "label": "A-2 이미 보낸 임대료 미반영·금액 과다 → 퇴거 통보",
      "chain": [
        "re03_reason_tenant",
        "re03_arrears_fact",
        "re03_fact_gap_text",
        "re03_notice_form",
        "re03_notice_period",
        "re03_move_out_deadline",
        "re03_key_dates",
        "re03_occupancy_tenant",
        "re03_counter_reaction",
        "re03_deposit_status",
        "re03_evidence",
        "re03_blockage",
        "re03_final_goal"
      ]
    },
    {
      "pathId": "B",
      "condition": "re03_my_role ≠ r3_role_landlord AND (re03_demand_type = r3_dm_fix_breach OR re03_demand_type = r3_dm_terminate)",
      "label": "B 집 사용 방식(소음·용도·무단 재임대) 위반 → 시정 요구·해지",
      "chain": [
        "re03_reason_tenant",
        "re03_conduct_fact",
        "re03_fact_gap_text",
        "re03_notice_form",
        "re03_notice_period",
        "re03_move_out_deadline",
        "re03_key_dates",
        "re03_counter_reaction",
        "re03_deposit_status",
        "re03_evidence",
        "re03_blockage",
        "re03_final_goal"
      ]
    },
    {
      "pathId": "C",
      "condition": "re03_my_role ≠ r3_role_landlord AND (re03_demand_type = r3_dm_vacate_date OR re03_demand_type = r3_dm_terminate)",
      "label": "C 집주인 사정(매각·직접 거주·은행 담보) → 기간 중 퇴거 요구",
      "chain": [
        "re03_reason_tenant",
        "re03_owner_reason_fact",
        "re03_notice_form",
        "re03_notice_period",
        "re03_move_out_deadline",
        "re03_key_dates",
        "re03_occupancy_tenant",
        "re03_counter_reaction",
        "re03_deposit_status",
        "re03_evidence",
        "re03_blockage",
        "re03_final_goal"
      ]
    },
    {
      "pathId": "D-1",
      "condition": "re03_my_role = r3_role_landlord AND (re03_demand_type = r3_dm_terminate OR re03_demand_type = r3_dm_vacate_date)",
      "label": "D-1 세입자 조기 해지·보증금 반환 요구",
      "chain": [
        "re03_reason_landlord",
        "re03_exit_terms_landlord",
        "re03_notice_form",
        "re03_notice_period",
        "re03_move_out_deadline",
        "re03_key_dates",
        "re03_occupancy_landlord",
        "re03_counter_reaction",
        "re03_deposit_status",
        "re03_penalty_clause",
        "re03_claim_amount",
        "re03_evidence",
        "re03_blockage",
        "re03_final_goal"
      ]
    },
    {
      "pathId": "D-2",
      "condition": "re03_my_role = r3_role_landlord",
      "label": "D-2 세입자가 집주인 위반(수리·집 상태)을 이유로 해지",
      "chain": [
        "re03_reason_landlord",
        "re03_fact_compare",
        "re03_fact_gap",
        "re03_fact_gap_text",
        "re03_notice_form",
        "re03_notice_period",
        "re03_move_out_deadline",
        "re03_key_dates",
        "re03_occupancy_landlord",
        "re03_deposit_status",
        "re03_evidence",
        "re03_blockage",
        "re03_final_goal"
      ]
    },
    {
      "pathId": "E",
      "condition": "re03_my_role ≠ r3_role_landlord AND re03_demand_type = r3_dm_money_claim",
      "label": "E 위반을 이유로 한 위약금·손해배상 청구",
      "chain": [
        "re03_reason_tenant",
        "re03_arrears_fact",
        "re03_conduct_fact",
        "re03_notice_form",
        "re03_notice_period",
        "re03_key_dates",
        "re03_counter_reaction",
        "re03_deposit_status",
        "re03_penalty_clause",
        "re03_claim_amount",
        "re03_evidence",
        "re03_blockage",
        "re03_final_goal"
      ]
    },
    {
      "pathId": "F",
      "condition": "re03_my_role ≠ r3_role_landlord AND re03_demand_type = r3_dm_unclear",
      "label": "F 사유·요구 불명확 통보(전달자 경유)",
      "chain": [
        "re03_reason_tenant",
        "re03_fact_compare",
        "re03_fact_gap",
        "re03_fact_gap_text",
        "re03_notice_form",
        "re03_notice_sender",
        "re03_notice_period",
        "re03_move_out_deadline",
        "re03_key_dates",
        "re03_deposit_status",
        "re03_evidence",
        "re03_blockage",
        "re03_final_goal"
      ]
    }
  ],
  "RE04": [
    {
      "pathId": "A1",
      "condition": "re04_issue_type = it_repair_refused AND (re04_notify_status = nt_message_sent OR re04_notify_status = nt_formal_request OR re04_notify_status = nt_via_agent)",
      "label": "A1. 수리 요청 → 지연·거절 → 자비 수리 → 정산 요구",
      "chain": [
        "re04_repair_detail",
        "re04_counterparty",
        "re04_contract_clause",
        "re04_other_response",
        "re04_self_repair",
        "re04_self_repair_amount",
        "re04_rent_status",
        "re04_withhold_notice",
        "re04_deadline",
        "re04_key_dates",
        "re04_evidence",
        "re04_blockage",
        "re04_final_goal"
      ]
    },
    {
      "pathId": "A2",
      "condition": "re04_issue_type = it_repair_refused AND (re04_notify_status = nt_verbal_only OR re04_notify_status = nt_not_told)",
      "label": "A2. 말로만 요청 → 장기 방치 → 월세 보류 검토",
      "chain": [
        "re04_repair_detail",
        "re04_counterparty",
        "re04_contract_clause",
        "re04_not_told_reason",
        "re04_other_response",
        "re04_self_repair",
        "re04_rent_status",
        "re04_withhold_notice",
        "re04_deadline",
        "re04_key_dates",
        "re04_evidence",
        "re04_blockage",
        "re04_final_goal"
      ]
    },
    {
      "pathId": "B",
      "condition": "re04_issue_type = it_prior_defect_blamed",
      "label": "B. 입주 전 하자 → 임차인 책임 주장 → 보증금 공제 예고",
      "chain": [
        "re04_defect_claim",
        "re04_counterparty",
        "re04_handover_record",
        "re04_contract_clause",
        "re04_other_response",
        "re04_fact_compare",
        "re04_threat_detail",
        "re04_rent_status",
        "re04_deadline",
        "re04_key_dates",
        "re04_evidence",
        "re04_blockage",
        "re04_final_goal"
      ]
    },
    {
      "pathId": "C",
      "condition": "re04_issue_type = it_fee_dispute",
      "label": "C. 요금 청구 → 단가·부담자 다툼 → 단전·단수 예고",
      "chain": [
        "re04_fee_detail",
        "re04_fee_amount",
        "re04_counterparty",
        "re04_contract_clause",
        "re04_other_response",
        "re04_threat_detail",
        "re04_rent_status",
        "re04_withhold_notice",
        "re04_deadline",
        "re04_key_dates",
        "re04_evidence",
        "re04_blockage",
        "re04_final_goal"
      ]
    },
    {
      "pathId": "D",
      "condition": "re04_issue_type = it_neighbor_management",
      "label": "D. 이웃·관리사무소 문제 → 집주인 관여 거부 → 다수 당사자",
      "chain": [
        "re04_neighbor_detail",
        "re04_living_impact",
        "re04_counterparty",
        "re04_contract_clause",
        "re04_other_response",
        "re04_rent_status",
        "re04_deadline",
        "re04_key_dates",
        "re04_evidence",
        "re04_blockage",
        "re04_final_goal"
      ]
    },
    {
      "pathId": "E",
      "condition": "re04_issue_type = it_landlord_entry",
      "label": "E. 무단 출입·장치 설치 → 사생활 침해 → 출입 규칙 재합의",
      "chain": [
        "re04_entry_detail",
        "re04_living_impact",
        "re04_counterparty",
        "re04_contract_clause",
        "re04_other_response",
        "re04_threat_detail",
        "re04_rent_status",
        "re04_deadline",
        "re04_key_dates",
        "re04_evidence",
        "re04_blockage",
        "re04_final_goal"
      ]
    },
    {
      "pathId": "X",
      "condition": "re04_other_response = or_counter_threat",
      "label": "X. 요청 → 보복성 통보(퇴거·보증금·단전·임시거주 신고)",
      "chain": [
        "re04_other_response",
        "re04_threat_detail",
        "re04_rent_status",
        "re04_deadline",
        "re04_key_dates"
      ]
    }
  ],
  "RE05": [
    {
      "pathId": "S1",
      "condition": "re05_stage = r5_transfer_delay  + re05_transferDelayDetail = r5_td_seller_docs|r5_td_mortgage  + re05_counterparty = r5_cp_individual_seller|r5_cp_broker_only|r5_cp_owner_unclear  + re05_paidStage ≠ r5_paid_nothing",
      "label": "S1 개인 매도인 명의 이전 지연 — 매도인 서류·은행 담보 미해결",
      "chain": [
        "re05_transferDelayDetail",
        "re05_paidAmount",
        "re05_nameOnDocs",
        "re05_mortgage",
        "re05_promisedDate",
        "re05_counterpartyExplanation",
        "re05_contractForm",
        "re05_customerResponse",
        "re05_responseReaction",
        "re05_evidence",
        "re05_deadline",
        "re05_deadlineDate",
        "re05_finalGoal"
      ]
    },
    {
      "pathId": "S2",
      "condition": "re05_stage = r5_transfer_delay  + re05_transferDelayDetail = r5_td_filed_waiting|r5_td_tax_stage|r5_td_stage_unknown",
      "label": "S2 개인 매도인 명의 이전 지연 — 접수 후 처리 지연·세금 부담 다툼",
      "chain": [
        "re05_transferDelayDetail",
        "re05_paidAmount",
        "re05_nameOnDocs",
        "re05_mortgage",
        "re05_promisedDate",
        "re05_counterpartyExplanation",
        "re05_contractForm",
        "re05_customerResponse",
        "re05_responseReaction",
        "re05_evidence",
        "re05_deadline",
        "re05_deadlineDate",
        "re05_finalGoal"
      ]
    },
    {
      "pathId": "S3",
      "condition": "re05_stage = r5_project_book_pending AND re05_counterparty = r5_cp_developer",
      "label": "S3 분양 핑크북 미발급 — 분양 회사 직접 계약",
      "chain": [
        "re05_projectBookDetail",
        "re05_paidAmount",
        "re05_promisedDate",
        "re05_counterpartyExplanation",
        "re05_contractForm",
        "re05_handoverCompare",
        "re05_customerResponse",
        "re05_responseReaction",
        "re05_evidence",
        "re05_deadline",
        "re05_deadlineDate",
        "re05_finalGoal"
      ]
    },
    {
      "pathId": "S4",
      "condition": "re05_stage = r5_project_book_pending AND re05_counterparty ≠ r5_cp_developer",
      "label": "S4 분양 핑크북 미발급 — 분양권을 넘겨받은 매수인",
      "chain": [
        "re05_projectBookDetail",
        "re05_paidAmount",
        "re05_resaleApproval",
        "re05_promisedDate",
        "re05_counterpartyExplanation",
        "re05_contractForm",
        "re05_handoverCompare",
        "re05_customerResponse",
        "re05_responseReaction",
        "re05_evidence",
        "re05_deadline",
        "re05_deadlineDate",
        "re05_finalGoal"
      ]
    },
    {
      "pathId": "S5",
      "condition": "re05_stage = r5_book_mismatch",
      "label": "S5 핑크북 내용 불일치 — 소유자·면적·주소 / 위조 의심",
      "chain": [
        "re05_mismatchDetail",
        "re05_paidAmount",
        "re05_nameOnDocs",
        "re05_mortgage",
        "re05_contractForm",
        "re05_infoSource",
        "re05_customerResponse",
        "re05_responseReaction",
        "re05_evidence",
        "re05_blockage",
        "re05_deadline",
        "re05_deadlineDate",
        "re05_finalGoal"
      ]
    },
    {
      "pathId": "S6",
      "condition": "re05_stage = r5_foreign_eligibility",
      "label": "S6 외국인 소유 자격 미확정 — 땅이 딸린 주택·물량 초과·소유기간 조건·명의 차용",
      "chain": [
        "re05_foreignDetail",
        "re05_paidAmount",
        "re05_nameOnDocs",
        "re05_contractForm",
        "re05_infoSource",
        "re05_customerResponse",
        "re05_responseReaction",
        "re05_evidence",
        "re05_blockage",
        "re05_deadline",
        "re05_deadlineDate",
        "re05_finalGoal"
      ]
    },
    {
      "pathId": "S7",
      "condition": "re05_stage = r5_registration_rejected",
      "label": "S7 토지등록사무소 불수리 — 서류 보완 / 외국인 명의 / 매도인 쪽 기록",
      "chain": [
        "re05_rejectionDetail",
        "re05_paidAmount",
        "re05_nameOnDocs",
        "re05_mortgage",
        "re05_contractForm",
        "re05_infoSource",
        "re05_customerResponse",
        "re05_responseReaction",
        "re05_evidence",
        "re05_blockage",
        "re05_deadline",
        "re05_deadlineDate",
        "re05_finalGoal"
      ]
    }
  ]
};

export const REAL_ESTATE_RE01_GOAL_ADJUST_RAW = "`r1_cg_money_safety` → 주 경로 안에서 transfer_account·penalty_clause를 contract_form보다 앞으로 / `r1_cg_owner_authority` → book_status·owner_authority·precheck_response를 info_channel 바로 뒤로 / `r1_cg_foreigner_fit` → foreign_eligibility·residence_registration·client_party를 contract_form 앞으로 / `r1_cg_contract_terms` → contract_form·language_gap·condition_compare를 info_channel 바로 뒤로 / `r1_cg_order_unsure` → 주 경로 순서 그대로.";

export const REAL_ESTATE_PATH_ALIASES: Record<string, Record<string, string>> = {
  "RE02": {
    "PATH_B": "re02_role = role_buyer|role_seller OR re02_dispute_type = dt_deposit_forfeited OR re02_dispute_type_holder = hd_forfeit_dispute|hd_double_demand",
    "PATH_B_PAYER": "PATH_B AND re02_role = role_tenant|role_company_occupant|role_buyer",
    "PATH_B_HOLDER": "PATH_B AND re02_role = role_landlord|role_seller",
    "PATH_C": "NOT PATH_B AND (re02_dispute_type = dt_partial_deduction OR re02_dispute_type_holder = hd_deduct_dispute)",
    "PATH_E": "NOT PATH_B AND (re02_dispute_type = dt_extra_claim OR re02_dispute_type_holder = hd_extra_claim)",
    "GATE_RENTAL_UNRETURNED": "re02_role = role_tenant|role_company_occupant AND re02_dispute_type = dt_not_returned|dt_contact_avoided",
    "PATH_A": "GATE_RENTAL_UNRETURNED AND re02_other_reason = or_damage_claim",
    "PATH_D1": "GATE_RENTAL_UNRETURNED AND re02_other_reason ≠ or_damage_claim",
    "PATH_D2": "re02_dispute_type_holder = hd_contact_lost"
  }
};

export const REAL_ESTATE_RE02_PATH_PRIORITY = ["PATH_B","PATH_C","PATH_E","PATH_D2","PATH_A","PATH_D1"];

export const PARSE_UNPARSED_CHAIN_TOKENS: string[] = [];

export type FirstResultPackMeta = {
  firstResultCautionsSectionSubtitle: string;
  phase1VerdictBoost: string[];
  firstResultVerdictFloor: boolean;
  firstResultNoRiskFloorTitle: string;
  firstResultNoRiskFloorBody: string;
  personalizedStageLabel: string;
  personalizedIntegratedOk: string;
  personalizedIntegratedCaution: string;
  personalizedPhase2Empty: string;
  personalizedDocumentsNeededNote: string;
  personalizedCoreJudgmentOk: string;
  personalizedCoreJudgmentCaution: string;
  personalizedCoreJudgmentExpert: string;
  personalizedPhase2MaintainedSummary: string;
  personalizedPhase2ElevatedSummary: string;
  personalizedHeadlineMaintained: string;
  personalizedHeadlineElevated: string;
  personalizedHeadlineOk: string;
  phase2Facts: Record<string, string>;
  personalizedPhase2MaintainedSentence2: string;
  personalizedPhase2ElevatedSentence2: string;
  phase2Fact2: Record<string, string>;
  semanticConflicts: { left: string; right: string; label: string }[];
};

export const REAL_ESTATE_FIRST_RESULT_PACK_META: Record<string, FirstResultPackMeta> = {
  "RE01": {
    "firstResultCautionsSectionSubtitle": "| 계약 전 확인 핵심 포인트",
    "phase1VerdictBoost": [],
    "firstResultVerdictFloor": false,
    "firstResultNoRiskFloorTitle": "",
    "firstResultNoRiskFloorBody": "",
    "personalizedStageLabel": "계약 전 2차 종합 검토",
    "personalizedIntegratedOk": "계약 전 확인 목표와 2차에서 추가로 확인한 조건을 함께 정리했습니다.",
    "personalizedIntegratedCaution": "1차·2차 답변을 바탕으로, 서명·송금 전에 직접 대조할 부분이 남아 있습니다.",
    "personalizedPhase2Empty": "2차 답변만으로 새로 드러난 위험 신호는 현재 보이지 않습니다.",
    "personalizedDocumentsNeededNote": "계약서·핑크북·송금 내역 등 원본을 대조하면 확인 범위를 넓힐 수 있습니다.",
    "personalizedCoreJudgmentOk": "현재까지 답변으로는 계약 전 확인 범위에서 큰 불일치가 보이지 않습니다.",
    "personalizedCoreJudgmentCaution": "일부 조항·상대방 반응은 추가 대조가 필요한 상태입니다.",
    "personalizedCoreJudgmentExpert": "복합 이슈가 겹쳐 VFBCAI 전문가팀 확인이 필요한 단계입니다.",
    "personalizedPhase2MaintainedSummary": "2차 답변에서는 1차보다 더 나쁜 사정은 확인되지 않았고, 1차에서 확인된 {phase1Core} 상태가 그대로 유지됩니다.",
    "personalizedPhase2ElevatedSummary": "1차에서 {phase1Core} 또한 2차에서는 {phase2Fact}",
    "personalizedPhase2MaintainedSentence2": "2차 답변에서도 이보다 나빠진 사정은 확인되지 않아, 1차 판정이 유지됩니다.",
    "personalizedPhase2ElevatedSentence2": "2차 답변에서 {fact2}이 확인되어, 추가 확인이 필요한 부분이 더 늘었습니다.",
    "personalizedHeadlineMaintained": "1차에서 확인된 주의 사항이 유지되는 상태입니다",
    "personalizedHeadlineElevated": "2차 답변으로 추가 확인이 필요한 부분이 더 드러났습니다",
    "personalizedHeadlineOk": "현재 확인한 범위에서는 큰 문제가 보이지 않습니다",
    "phase2Facts": {
      "re01_final_goal=fg_sign_safely": "2차에서는 확인을 마친 뒤 문제 없으면 서명하는 것이 최종 목표로 확인되었습니다.",
      "re01_price_terms": "2차에서는 계약서에 적힌 금액·지급 조건을 다시 대조하는 단계로 확인되었습니다."
    },
    "phase2Fact2": {
      "re01_sign_deadline=r1_sd_passed": "약속한 서명·진행 일정이 이미 지난 상태라는 점",
      "re01_owner_doc_check=r1_od_refused_delay": "핑크북 원본 확인을 계속 미루거나 거절당했다는 점",
      "re01_owner_authority=r1_oa_poa_unseen": "위임장을 말로만 들었고 실물은 보지 못했다는 점",
      "re01_owner_authority=r1_oa_relative_no_doc": "가족이 대신 서명한다고 했으나 위임장은 없었다는 점",
      "re01_owner_authority=r1_oa_co_owner_one": "공동 소유자 중 한 사람만 서명한다고 했다는 점",
      "re01_transfer_account=r1_ta_third_party": "소유자가 아닌 제3자 명의 계좌로 송금하라는 요청을 받았다는 점",
      "re01_payment_schedule=r1_ps_price_split": "계약서 금액과 실제 주고받는 금액을 다르게 적자는 제안을 받았다는 점",
      "re01_payment_schedule=r1_ps_lump_sum_first": "명의 이전 전 대금 대부분 선지급을 요청받았다는 점",
      "re01_foreign_eligibility=r1_fe_landed_house": "개인 주택의 외국인 명의 가능 여부를 확인하지 못했다는 점",
      "re01_commercial_use=r1_cu_sublease": "건물주가 아닌 전대인에게서 다시 빌린 상태라는 점",
      "re01_owner_doc_check=r1_od_copy_only": "핑크북 원본은 보지 못하고 사본만 받았다는 점",
      "re01_owner_doc_check=r1_od_signer_differs": "핑크북 소유자와 계약 서명자가 다르다는 점",
      "re01_owner_doc_check=r1_od_project_no_book": "분양 단계라 핑크북 없이 개발사 서류만 받았다는 점",
      "re01_penalty_clause=r1_pc_one_sided": "계약금 몰수 조항이 한쪽에게만 유리하게 적혀 있다는 점",
      "re01_transfer_account=r1_ta_broker_account": "중개인·중개회사 명의 계좌로 송금하라는 요청을 받았다는 점",
      "re01_deposit_paid_proof=r1_dp_transfer_only": "송금은 했으나 상대방 서명 영수증은 받지 못했다는 점",
      "re01_residence_registration=r1_rr_refused_or_fee": "임시거주 신고를 거부하거나 추가 비용을 요구했다는 점",
      "re01_commercial_use=r1_cu_use_restricted": "주거용·용도 제한 이야기를 들었으나 확인하지 못했다는 점",
      "re01_foreign_eligibility=r1_fe_quota_verbal": "외국인 구매 가능을 말로만 들었고 문서 확인이 없다는 점",
      "re01_broker_role=r1_br_both_sides": "같은 중개인이 양쪽 일을 함께 맡고 있다는 점",
      "re01_deposit_link=r1_dl_terms_open": "계약금만 먼저 걸고 세부 조건은 나중에 정하자는 요청을 받았다는 점",
      "re01_sign_deadline=r1_sd_pressure_days": "며칠 안 결정 압박과 다른 사람에게 넘기겠다는 말을 들었다는 점",
      "re01_progress_stage=r1_st_deposit_requested": "서명 전 계약금 선지급을 요청받았다는 점",
      "re01_foreign_eligibility=r1_fe_term_unknown": "외국인 소유 기간·연장 조건을 설명받지 못했다는 점",
      "re01_condition_compare=r1_cc_scope_diff": "처음 들은 포함 항목이 계약서와 다르게 적혀 있다는 점",
      "re01_deposit_paid_proof=r1_dp_cash_no_receipt": "계약금을 현금으로 보냈으나 영수증·확인 문서가 없다는 점",
      "re01_deposit_paid_proof=r1_dp_via_broker": "계약금을 중개인 계좌로만 보냈다는 점",
      "sd_passed": "약속한 서명·진행 일정이 이미 지난 상태라는 점",
      "dp_cash_no_receipt": "계약금을 현금으로 보냈으나 영수증·확인 문서가 없다는 점",
      "dp_via_broker": "계약금을 중개인 계좌로만 보냈다는 점"
    },
    "semanticConflicts": []
  },
  "RE02": {
    "firstResultCautionsSectionSubtitle": "| 분쟁 대응 핵심 포인트",
    "phase1VerdictBoost": [
      "dt_not_returned",
      "dt_deposit_forfeited",
      "dt_contact_avoided",
      "hd_forfeit_dispute",
      "hd_double_demand"
    ],
    "firstResultVerdictFloor": true,
    "firstResultNoRiskFloorTitle": "먼저 확인할 사항",
    "firstResultNoRiskFloorBody": "계약서의 보증금 반환 조항과 송금 내역을 먼저 맞춰 보세요. 반환 시기와 금액이 어떻게 정해져 있는지가 출발점입니다.",
    "personalizedStageLabel": "보증금·계약금 2차 종합 검토",
    "personalizedIntegratedOk": "분쟁 경로와 2차에서 추가로 확인한 반환·증빙 조건을 함께 정리했습니다.",
    "personalizedIntegratedCaution": "1차·2차 답변을 바탕으로, 돈·서면 조건을 직접 대조할 부분이 남아 있습니다.",
    "personalizedPhase2Empty": "2차 답변만으로 새로 드러난 위험 신호는 현재 보이지 않습니다.",
    "personalizedDocumentsNeededNote": "계약서·송금·대화 기록 등 원본을 대조하면 반환 주장 확인 범위를 넓힐 수 있습니다.",
    "personalizedCoreJudgmentOk": "현재까지 답변으로는 반환 경로에서 큰 불일치가 보이지 않습니다.",
    "personalizedCoreJudgmentCaution": "반환 조건·상대방 반응은 추가 대조가 필요한 상태입니다.",
    "personalizedCoreJudgmentExpert": "복합 분쟁이 겹쳐 VFBCAI 전문가팀 확인이 필요한 단계입니다.",
    "personalizedPhase2MaintainedSummary": "2차 답변에서는 1차보다 더 나쁜 사정은 확인되지 않았고, 1차에서 확인된 {phase1Core} 상태가 그대로 유지됩니다.",
    "personalizedPhase2ElevatedSummary": "1차에서 {phase1Core} 또한 2차에서는 {phase2Fact}",
    "personalizedPhase2MaintainedSentence2": "2차 답변에서도 이보다 나빠진 사정은 확인되지 않아, 1차 판정이 유지됩니다.",
    "personalizedPhase2ElevatedSentence2": "2차 답변에서 {fact2}이 확인되어, 추가 확인이 필요한 부분이 더 늘었습니다.",
    "personalizedHeadlineMaintained": "1차에서 확인된 주의 사항이 유지되는 상태입니다",
    "personalizedHeadlineElevated": "2차 답변으로 반환·증빙 쪽 추가 확인이 필요합니다",
    "personalizedHeadlineOk": "현재 확인한 범위에서는 큰 문제가 보이지 않습니다",
    "phase2Facts": {
      "re02_amount_state=amt_clear": "2차에서는 주고받은 금액과 다툼 금액이 서로 맞는 것으로 확인되었습니다.",
      "re02_money_evidence=me_contract_transfer": "2차에서는 계약서와 송금 내역으로 지급 사실을 대조할 수 있는 상태입니다.",
      "re02_payment_path=pp_direct": "2차에서는 돈이 상대방 본인과 직접 오갔다고 확인되었습니다.",
      "re02_demand_method=dm_not_yet": "2차에서는 아직 정식 요구나 대응을 시작하지 않은 상태입니다.",
      "re02_situation_match=sm_match": "2차에서는 상대방 주장이 대체로 사실과 맞고 처리 방법만 다른 것으로 확인되었습니다.",
      "re02_deadline=dl_contract_term": "2차에서는 계약서에 적힌 반환 기한을 기준으로 일정을 잡을 수 있는 상태입니다.",
      "re02_blockage=bk_entitlement": "2차에서는 받을 권리에 대한 확신이 부족해 진행이 막힌 것으로 확인되었습니다.",
      "re02_final_goal=fg_full_settlement": "2차에서는 계약 기준 금액대로 정리하는 것이 목표로 확인되었습니다."
    },
    "phase2Fact2": {
      "re02_role=role_company_occupant": "계약은 회사 명의인데 실제 거주자가 따로 있다는 점",
      "re02_payment_path=pp_agent_my_side": "돈을 회사·가족·지인이 대신 주고받았다는 점",
      "re02_dispute_type_holder=hd_double_demand": "계약이 무산된 뒤 계약금 두 배 반환을 요구받았다는 점",
      "re02_contract_form=cf_signer_doubt": "계약서 서명자가 소유자와 다르거나 서명이 빠져 있다는 점",
      "re02_money_evidence=me_none": "돈을 주고받은 사실을 확인할 자료가 없다는 점",
      "re02_cash_proof=cp_nothing": "돈을 주고받은 사실을 확인할 방법이 없다는 점",
      "re02_broker_hold=bh_still_holding": "중개인이 돈을 아직 보관하고 있다는 점",
      "re02_broker_hold=bh_broker_unreachable": "중개인과 연락이 끊겨 돈 위치를 모른다는 점",
      "re02_contract_end=end_me_short_notice": "먼저 계약을 끝냈으나 통지 기간이 짧았거나 알리지 못했다는 점",
      "re02_contract_end=end_not_ended": "계약이 끝나지 않았는데 돈 문제로 다투고 있다는 점",
      "re02_dispute_type=dt_deposit_forfeited": "상대방이 계약금을 모두 가져가겠다고 한다는 점",
      "re02_dispute_type_holder=hd_forfeit_dispute": "계약금 반환을 서로 다르게 주장하고 있다는 점",
      "re02_dispute_type=dt_extra_claim": "보증금 반환 대신 추가 금액을 요구받았다는 점",
      "re02_dispute_type_holder=hd_extra_claim": "차액을 요구했으나 상대방이 지급하지 않는다는 점",
      "re02_dispute_type=dt_contact_avoided": "반환 약속 후 상대방이 연락을 피한다는 점",
      "re02_dispute_type_holder=hd_contact_lost": "상대방이 집을 비우고 연락이 끊겼다는 점",
      "re02_other_reaction=rx_ignored": "메시지에 답이 없거나 연락을 피한다는 점",
      "re02_forfeit_clause=fc_no_clause": "계약금 처리 조항이 계약서에 없다는 점",
      "re02_forfeit_clause=fc_one_side": "계약금 조항이 한쪽에게만 적혀 있다는 점",
      "re02_money_evidence=me_cash_message": "현금 거래에 메시지·손글씨 영수만 남았다는 점",
      "re02_cash_proof=cp_withdrawal_only": "현금 인출 기록만 있고 상대방 전달 기록이 없다는 점",
      "re02_payment_path=pp_via_broker": "중개인을 거쳐 주고받았고 전달 여부는 말로만 알고 있다는 점",
      "re02_broker_hold=bh_delivered_word": "중개인이 전달했다고만 하고 기록은 없다는 점",
      "re02_other_reaction=rx_counter_claim": "상대방이 손해·위약금을 이유로 돈을 더 요구했다는 점",
      "re02_deadline=dl_other_demand": "상대방이 정한 기한까지 돈이나 합의를 요구받았다는 점",
      "re02_deadline=dl_my_schedule": "출국·이사 등 일정 때문에 그 전에 정리가 필요하다는 점",
      "re02_deduction_items=ded_no_itemization": "공제 항목 설명 없이 금액만 빼겠다고 한다는 점",
      "re02_extra_claim_detail=xc_unclear_basis": "추가 요구 금액의 명목·근거가 정리되지 않았다는 점",
      "re02_forfeit_clause=fc_cannot_read": "베트남어 계약서라 몰수 조항을 읽지 못했다는 점",
      "re02_contract_form=cf_vn_only": "베트남어 계약서만 있고 내용을 모두 이해하지 못했다는 점",
      "re02_handover_record=ho_not_handed": "열쇠·인도 날짜가 아직 정리되지 않았다는 점",
      "re02_payment_path=pp_unclear": "누가 실제로 돈을 받았는지 확실하지 않다는 점",
      "re02_payment_path=pp_agent_other_side": "상대방 쪽 대리인이 대신 받거나 보냈다는 점",
      "re02_situation_match=sm_mismatch": "상대방 주장과 실제 경험이 다르다고 보는 상황이라는 점",
      "re02_situation_match=sm_hard_to_judge": "날짜별 사실을 비교할 기록이 부족하다는 점"
    },
    "semanticConflicts": []
  },
  "RE03": {
    "firstResultCautionsSectionSubtitle": "| 통보 대응 핵심 포인트",
    "phase1VerdictBoost": [
      "r3_dm_terminate",
      "r3_dm_money_claim",
      "r3_dm_vacate_date"
    ],
    "firstResultVerdictFloor": true,
    "firstResultNoRiskFloorTitle": "먼저 확인할 사항",
    "firstResultNoRiskFloorBody": "받은 통보문 원문과 계약서의 해지·통지 조항을 나란히 놓고, 통지 기간과 방식이 맞는지 먼저 보세요.",
    "personalizedStageLabel": "위반·해지·퇴거 2차 종합 검토",
    "personalizedIntegratedOk": "통보 경로와 2차에서 추가로 확인한 대응 조건을 함께 정리했습니다.",
    "personalizedIntegratedCaution": "1차·2차 답변을 바탕으로, 통보·계약 조항을 직접 대조할 부분이 남아 있습니다.",
    "personalizedPhase2Empty": "2차 답변만으로 새로 드러난 위험 신호는 현재 보이지 않습니다.",
    "personalizedDocumentsNeededNote": "통보문·계약서·대화 기록 등 원본을 대조하면 대응 범위를 넓힐 수 있습니다.",
    "personalizedCoreJudgmentOk": "현재까지 답변으로는 통보 대응 범위에서 큰 불일치가 보이지 않습니다.",
    "personalizedCoreJudgmentCaution": "통보 내용·기한·조항 일치는 추가 대조가 필요한 상태입니다.",
    "personalizedCoreJudgmentExpert": "복합 통보 이슈가 겹쳐 VFBCAI 전문가팀 확인이 필요한 단계입니다.",
    "personalizedPhase2MaintainedSummary": "2차 답변에서는 1차보다 더 나쁜 사정은 확인되지 않았고, 1차에서 확인된 {phase1Core} 상태가 그대로 유지됩니다.",
    "personalizedPhase2ElevatedSummary": "1차에서 {phase1Core} 또한 2차에서는 {phase2Fact}",
    "personalizedPhase2MaintainedSentence2": "2차 답변에서도 이보다 나빠진 사정은 확인되지 않아, 1차 판정이 유지됩니다.",
    "personalizedPhase2ElevatedSentence2": "2차 답변에서 {fact2}이 확인되어, 추가 확인이 필요한 부분이 더 늘었습니다.",
    "personalizedHeadlineMaintained": "1차에서 확인된 주의 사항이 유지되는 상태입니다",
    "personalizedHeadlineElevated": "2차 답변으로 통보·대응 쪽 추가 확인이 필요합니다",
    "personalizedHeadlineOk": "현재 확인한 범위에서는 큰 문제가 보이지 않습니다",
    "phase2Facts": {
      "re03_final_goal=gl_keep_living": "2차에서는 계약을 유지하고 계속 거주하는 것이 목표로 확인되었습니다.",
      "re03_notice_form=nf_written_hand": "2차에서는 서명된 서면 통지를 직접 받은 것으로 확인되었습니다."
    },
    "phase2Fact2": {
      "re03_occupancy_tenant=r3_oc_locked_out": "열쇠·전기·수도 때문에 집을 쓰지 못하고 있다는 점",
      "re03_occupancy_tenant=r3_oc_belongings_threat": "짐을 밖으로 내놓겠다는 말을 들었다는 점",
      "re03_counter_reaction=r3_cr_legal_threat": "법원·공안 신고를 하겠다고 했다는 점",
      "re03_owner_reason_fact=r3_ow_bank_issue": "집주인 빚·담보로 권리가 넘어갈 우려를 들었다는 점",
      "re03_my_role=r3_role_subtenant": "집주인과 직접 계약 없이 전세에서 다시 빌려 살고 있다는 점",
      "re03_notice_period=r3_np_shorter": "통보 기간이 계약서보다 짧게 잡혀 있다는 점",
      "re03_move_out_deadline=r3_md_immediate": "날짜 없이 곧 집을 비우라는 말만 들었다는 점",
      "re03_deposit_status=r3_ds_forfeit": "보증금을 전혀 돌려주지 않겠다는 이야기가 나왔다는 점",
      "re03_deposit_status=r3_ds_deduct_no_list": "공제 내역 없이 보증금 일부를 빼겠다고 한다는 점",
      "re03_penalty_clause=r3_pc_amount_exceeds": "요구 위약금이 계약 조항보다 크다는 점",
      "re03_penalty_clause=r3_pc_no_clause": "위약금 조항 없이 금액을 정해 요구받았다는 점",
      "re03_penalty_clause=r3_pc_damage_claim": "위약금 외 수리·공실 손해를 추가로 요구받았다는 점",
      "re03_arrears_fact=r3_ar_paid_not_counted": "이미 낸 돈이 상대방 기록에 반영되지 않았다는 점",
      "re03_conduct_fact=r3_cd_admit_ongoing": "지적된 행위가 있었고 같은 방식으로 쓰고 있다는 점",
      "re03_my_role=r3_role_company_staff": "회사 명의 계약 집에 거주 중이고 당사자가 회사인 상태라는 점",
      "re03_demand_type=r3_dm_terminate": "계약 종료 통보를 받았고 퇴거 날짜는 아직 없다는 점",
      "re03_demand_type=r3_dm_money_claim": "위약금·손해배상 명목의 돈을 요구받았다는 점",
      "re03_demand_type=r3_dm_vacate_date": "계약 종료와 함께 정해진 퇴거 날짜가 있다는 점"
    },
    "semanticConflicts": []
  },
  "RE04": {
    "firstResultCautionsSectionSubtitle": "| 하자·관리 대응 핵심 포인트",
    "phase1VerdictBoost": [
      "it_repair_refused",
      "it_prior_defect_blamed",
      "sw_over_month"
    ],
    "firstResultVerdictFloor": true,
    "firstResultNoRiskFloorTitle": "먼저 확인할 사항",
    "firstResultNoRiskFloorBody": "문제가 된 부분의 사진·메시지·수리 요청 기록을 날짜순으로 모아 두세요. 누가 언제 무엇을 요청했는지가 핵심입니다.",
    "personalizedStageLabel": "거주 중 문제 2차 종합 검토",
    "personalizedIntegratedOk": "거주 중 이슈와 2차에서 추가로 확인한 조치 조건을 함께 정리했습니다.",
    "personalizedIntegratedCaution": "1차·2차 답변을 바탕으로, 수리·관리·이웃 이슈를 직접 확인할 부분이 남아 있습니다.",
    "personalizedPhase2Empty": "2차 답변만으로 새로 드러난 위험 신호는 현재 보이지 않습니다.",
    "personalizedDocumentsNeededNote": "사진·대화·관리비 내역 등 원본을 대조하면 조치 범위를 넓힐 수 있습니다.",
    "personalizedCoreJudgmentOk": "현재까지 답변으로는 거주 중 대응 범위에서 큰 불일치가 보이지 않습니다.",
    "personalizedCoreJudgmentCaution": "조치 요청·상대방 반응은 추가 확인이 필요한 상태입니다.",
    "personalizedCoreJudgmentExpert": "복합 거주 이슈가 겹쳐 VFBCAI 전문가팀 확인이 필요한 단계입니다.",
    "personalizedPhase2MaintainedSummary": "2차 답변에서는 1차보다 더 나쁜 사정은 확인되지 않았고, 1차에서 확인된 {phase1Core} 상태가 그대로 유지됩니다.",
    "personalizedPhase2ElevatedSummary": "1차에서 {phase1Core} 또한 2차에서는 {phase2Fact}",
    "personalizedPhase2MaintainedSentence2": "2차 답변에서도 이보다 나빠진 사정은 확인되지 않아, 1차 판정이 유지됩니다.",
    "personalizedPhase2ElevatedSentence2": "2차 답변에서 {fact2}이 확인되어, 추가 확인이 필요한 부분이 더 늘었습니다.",
    "personalizedHeadlineMaintained": "1차에서 확인된 주의 사항이 유지되는 상태입니다",
    "personalizedHeadlineElevated": "2차 답변으로 거주 중 조치 쪽 추가 확인이 필요합니다",
    "personalizedHeadlineOk": "현재 확인한 범위에서는 큰 문제가 보이지 않습니다",
    "phase2Facts": {
      "re04_final_goal=fg_repair_and_stay": "2차에서는 수리를 마치고 계속 거주하는 것이 목표로 확인되었습니다.",
      "re04_issue_type=it_repair_refused": "2차에서는 설비 수리 거부·지연 문제로 좁혀 확인되었습니다."
    },
    "phase2Fact2": {
      "re04_contract_access=ca_sublease": "집주인과 직접 맺지 않은 재임대로 거주하는 상황이라는 점",
      "re04_fee_detail=fd_prior_arrears": "전기·수도가 밀려 끊기거나 끊긴다는 안내를 받았다는 점",
      "re04_threat_detail=td_cut_utilities": "전기·수도·출입을 끊거나 막겠다고 했다는 점",
      "re04_rent_status=rs_withholding": "월세나 요금 일부·전부를 내지 않고 있다는 점",
      "re04_rent_status=rs_deducted_cost": "수리비 등을 빼고 남은 금액만 월세로 보냈다는 점",
      "re04_withhold_notice=wn_not_notified": "알리지 않고 월세를 덜 보냈다는 점",
      "re04_withhold_notice=wn_landlord_objected": "월세 삭감에 상대방이 해지·공제를 언급했다는 점",
      "re04_threat_detail=td_vacate_early": "계약 기간 중 집을 비우라는 요구를 받았다는 점",
      "re04_deadline=dl_vacate_demand": "상대방이 정한 날까지 집을 비우라는 요구를 받았다는 점",
      "re04_threat_detail=td_residence_registration": "임시거주 신고를 거부하거나 정리하겠다고 했다는 점",
      "re04_since_when=sw_over_month": "같은 문제가 한 달 넘게 이어지고 있다는 점",
      "re04_since_when=sw_recurring": "고쳤으나 같은 문제가 다시 생겼다는 점",
      "re04_repair_detail=rd_electric_fault": "전기·조명이 불안정해 생활이 어렵다는 점",
      "re04_repair_detail=rd_door_window": "문·창문 잠금이 고장 나 출입이 불안하다는 점",
      "re04_defect_claim=dc_deposit_deduction": "하자 비용을 보증금에서 빼겠다고 이미 말했다는 점",
      "re04_handover_record=hr_told_verbally": "입주 때 하자를 말로만 알렸고 기록이 없다는 점",
      "re04_handover_record=hr_no_record": "입주 때 집 상태를 따로 기록하지 않았다는 점",
      "re04_contract_access=ca_verbal_only": "정식 계약서 없이 말·메시지로만 조건을 정했다는 점",
      "re04_contract_access=ca_no_copy": "서명했으나 계약 사본을 받지 못했다는 점",
      "re04_self_repair=sr_paid_no_receipt": "먼저 수리했으나 영수증을 받지 못했다는 점",
      "re04_self_repair=sr_paid_no_consent": "동의 없이 수리했고 비용을 인정받지 못했다는 점",
      "re04_rent_status=rs_considering_withhold": "월세 지급을 멈추려는 상황이라는 점",
      "re04_other_response=or_counter_threat": "문제 제기에 계약 종료·보증금 미반환을 언급했다는 점",
      "re04_entry_detail=ed_entered_absent": "부재 중 무단 출입 흔적이 있다는 점",
      "re04_entry_detail=ed_unilateral_device": "상의 없이 잠금·카메라 등을 설치했다는 점",
      "re04_living_impact=li_staying_elsewhere": "집에 살기 어려워 다른 곳에 머물고 있다는 점",
      "re04_fact_compare=fc_false_no_proof": "상대 주장과 다르지만 입증 자료가 부족하다는 점",
      "re04_evidence=ev_none": "문제를 보여 줄 자료가 없거나 아직 모은 상태라는 점",
      "re04_notify_status=nt_verbal_only": "전화·대면으로만 알렸고 남은 기록이 없다는 점",
      "re04_notify_status=nt_via_agent": "중개인·관리실을 통해 전달했고 직접 말하지 않았다는 점",
      "re04_other_response=or_silent_or_relay": "답이 없거나 전달만 되고 상대 답은 없다는 점",
      "re04_contract_clause=cl_tenant_clear": "계약서에 임차인 단독 부담으로 적혀 있다는 점",
      "re04_fee_detail=fd_electric_rate": "전기요금이 단가가 높게 청구되고 있다는 점",
      "re04_fee_detail=fd_unilateral_increase": "관리비·요금이 합의 없이 올랐다는 점",
      "re04_living_impact=li_belongings_damaged": "가구·물건이 손상되었거나 없어졌다는 점"
    },
    "semanticConflicts": []
  },
  "RE05": {
    "firstResultCautionsSectionSubtitle": "| 권리·지급 확인 핵심 포인트",
    "phase1VerdictBoost": [],
    "firstResultVerdictFloor": true,
    "firstResultNoRiskFloorTitle": "먼저 확인할 사항",
    "firstResultNoRiskFloorBody": "계약서·지급 영수증과 권리 서류(명의 이전·핑크북) 현재 상태를 먼저 대조해 보세요. 지급한 돈과 서류 상태가 맞는지가 출발점입니다.",
    "personalizedStageLabel": "매매·권리 서류 2차 종합 검토",
    "personalizedIntegratedOk": "권리 확인 경로와 2차에서 추가로 확인한 이전·서류 조건을 함께 정리했습니다.",
    "personalizedIntegratedCaution": "1차·2차 답변을 바탕으로, 명의·핑크북·담보 조건을 직접 대조할 부분이 남아 있습니다.",
    "personalizedPhase2Empty": "2차 답변만으로 새로 드러난 위험 신호는 현재 보이지 않습니다.",
    "personalizedDocumentsNeededNote": "핑크북·등기·매매 계약 등 원본을 대조하면 권리 확인 범위를 넓힐 수 있습니다.",
    "personalizedCoreJudgmentOk": "현재까지 답변으로는 권리 확인 범위에서 큰 불일치가 보이지 않습니다.",
    "personalizedCoreJudgmentCaution": "명의·담보·서류 상태는 추가 대조가 필요한 상태입니다.",
    "personalizedCoreJudgmentExpert": "복합 권리 이슈가 겹쳐 VFBCAI 전문가팀 확인이 필요한 단계입니다.",
    "personalizedPhase2MaintainedSummary": "2차 답변에서는 1차보다 더 나쁜 사정은 확인되지 않았고, 1차에서 확인된 {phase1Core} 상태가 그대로 유지됩니다.",
    "personalizedPhase2ElevatedSummary": "1차에서 {phase1Core} 또한 2차에서는 {phase2Fact}",
    "personalizedPhase2MaintainedSentence2": "2차 답변에서도 이보다 나빠진 사정은 확인되지 않아, 1차 판정이 유지됩니다.",
    "personalizedPhase2ElevatedSentence2": "2차 답변에서 {fact2}이 확인되어, 추가 확인이 필요한 부분이 더 늘었습니다.",
    "personalizedHeadlineMaintained": "1차에서 확인된 주의 사항이 유지되는 상태입니다",
    "personalizedHeadlineElevated": "2차 답변으로 권리·서류 쪽 추가 확인이 필요합니다",
    "personalizedHeadlineOk": "현재 확인한 범위에서는 큰 문제가 보이지 않습니다",
    "phase2Facts": {
      "re05_finalGoal=fg_complete_transfer": "2차에서는 명의 이전·핑크북 발급을 끝까지 마치는 것이 목표로 확인되었습니다.",
      "re05_blockage=bk_cause_unknown": "2차에서는 멈춤 원인을 특정하지 못해 대응이 막힌 것으로 확인되었습니다."
    },
    "phase2Fact2": {
      "re05_counterparty=r5_cp_owner_unclear": "핑크북상 실제 권리자가 누구인지 확실하지 않다는 점",
      "re05_mortgage=r5_mg_paid_not_released": "담보 해제 비용을 냈으나 해제 확인이 안 된다는 점",
      "re05_mismatchDetail=r5_mm_owner_name": "핑크북 소유자와 계약 상대가 다르거나 공동 소유가 있다는 점",
      "re05_mismatchDetail=r5_mm_forgery_suspect": "핑크북 위조가 의심된다는 점",
      "re05_nameOnDocs=r5_nm_buyer_vn_name": "매수인 명의가 베트남인 지인으로 적혀 있다는 점",
      "re05_foreignDetail=r5_fe_nominee": "지인 명의로 등록하자는 이야기가 나왔다는 점",
      "re05_rejectionDetail=r5_rj_seller_side": "매도인 쪽 담보·압류 때문에 이전이 막혔다는 점",
      "re05_counterpartyExplanation=r5_ex_other_dispute": "상속·이혼 등 다른 분쟁이 먼저라는 설명을 들었다는 점",
      "re05_responseReaction=r5_rr_cancel_mentioned": "상대방이 계약 해제·계약금 문제를 먼저 꺼냈다는 점",
      "re05_paidStage=r5_paid_via_broker": "매도인이 아닌 계좌로 돈을 보냈다는 점",
      "re05_counterparty=r5_cp_broker_only": "매도인을 직접 만나지 않고 중개인 경로로만 진행했다는 점",
      "re05_transferDelayDetail=r5_td_mortgage": "매도인 은행 담보 때문에 이전 신청을 못 하고 있다는 점",
      "re05_mortgage=r5_mg_release_unclear": "담보 해제 시점·방법을 확인하지 못했다는 점",
      "re05_projectBookDetail=r5_pb_project_mortgage": "프로젝트 담보 때문에 핑크북 발급이 지연된다는 점",
      "re05_projectBookDetail=r5_pb_project_legal": "프로젝트 법적 절차 때문에 발급이 늦어진다는 점",
      "re05_nameOnDocs=r5_nm_family_coowner": "공동 소유자가 있는데 한 사람만 서명했다는 점",
      "re05_nameOnDocs=r5_nm_proxy": "대리인과 계약했고 위임 범위를 확인하지 못했다는 점",
      "re05_nameOnDocs=r5_nm_not_seen": "핑크북을 직접 확인하지 못했다는 점",
      "re05_foreignDetail=r5_fe_land_house": "분양이 아닌 단독·타운하우스를 사려는 상황이라는 점",
      "re05_rejectionDetail=r5_rj_foreign_status": "외국인 명의로 등록할 수 없다는 이유를 들었다는 점",
      "re05_foreignDetail=r5_fe_quota_full": "외국인 구매 물량이 찼다는 말을 들었다는 점",
      "re05_promisedDate=r5_pd_postponed": "약속 날짜가 여러 번 미뤄졌다는 점",
      "re05_promisedDate=r5_pd_written_passed": "계약서상 날짜가 이미 지났다는 점",
      "re05_counterpartyExplanation=r5_ex_extra_cost": "명목 불명의 추가 비용 요구를 들었다는 점",
      "re05_responseReaction=r5_rr_more_money": "추가 금액·세금 지급을 요구받았다는 점",
      "re05_counterpartyExplanation=r5_ex_no_explanation": "이유 설명 없이 연락을 피한다는 점",
      "re05_responseReaction=r5_rr_no_contact": "답이 없거나 연락이 끊겼다는 점",
      "re05_contractForm=r5_cf_deposit_only": "정식 매매계약서 없이 계약금 약정만 있다는 점",
      "re05_contractForm=r5_cf_informal_only": "공증 매매계약서 없이 글자 약정만 체결했다는 점",
      "re05_deadline=r5_dl_notice_period": "통지서·기관 안내에 보완 기한이 적혀 있다는 점",
      "re05_stage=r5_registration_rejected": "토지등록사무소에서 이전·발급이 거절됐다는 점",
      "re05_stage=r5_book_mismatch": "핑크북 내용이 계약·실제와 다르다는 점",
      "re05_paidStage=r5_paid_balance": "잔금까지 냈으나 명의가 넘어오지 않았다는 점",
      "re05_counterparty=r5_cp_resale_buyer": "분양권을 넘겨받았고 분양사와 직접 계약하지 않았다는 점",
      "re05_mortgage=r5_mg_unknown": "담보 여부를 확인하지 못했다는 점",
      "re05_transferDelayDetail=r5_td_stage_unknown": "이전 절차가 어느 단계인지 모른다는 점",
      "re05_transferDelayDetail=r5_td_filed_waiting": "신청은 했으나 결과가 나오지 않았다는 점",
      "re05_transferDelayDetail=r5_td_tax_stage": "세금 납부 주체가 정리되지 않아 멈춰 있다는 점",
      "re05_counterpartyExplanation=r5_ex_tax_demand": "계약에 없던 세금 지급을 요구받았다는 점",
      "re05_projectBookDetail=r5_pb_applied_no_proof": "핑크북 신청했다는 말만 있고 접수증이 없다는 점",
      "re05_handoverCompare=r5_hc_area_diff": "실제 면적과 계약 면적이 달라 정산 문제가 남았다는 점",
      "re05_mismatchDetail=r5_mm_area": "핑크북·계약·실제 면적이 다르다는 점",
      "re05_mismatchDetail=r5_mm_address_use": "주소·호수·토지 용도가 계약과 다르다는 점",
      "re05_contractForm=r5_cf_notarized_vn_only": "베트남어 공증 계약만 있고 내용을 다 이해하지 못했다는 점",
      "re05_blockage=r5_bk_money_decision": "추가 지급을 멈출지 결정하지 못하고 있다는 점",
      "re05_evidence=r5_ev_none": "대조할 자료가 없거나 아직 모은 상태라는 점"
    },
    "semanticConflicts": []
  }
};

export const REAL_ESTATE_PHASE2_FALLBACK_CHAIN: Record<string, string[]> = {
  "RE01": [
    "re01_price_terms",
    "re01_final_goal"
  ],
  "RE02": [
    "re02_amount_state",
    "re02_money_evidence",
    "re02_final_goal"
  ],
  "RE03": [
    "re03_notice_form",
    "re03_final_goal"
  ],
  "RE04": [
    "re04_repair_request",
    "re04_final_goal"
  ],
  "RE05": [
    "re05_transfer_status",
    "re05_confirmGoal"
  ]
};

export type RealEstatePhase2DocumentList = {
  documents: string[];
  optionalDocuments: string[];
  exampleTags: string[];
};

export const REAL_ESTATE_PHASE2_DOCUMENT_LISTS: Record<string, RealEstatePhase2DocumentList> = {
  "RE01": {
    "documents": [
      "계약서 초안 또는 매매·임대차 계약서",
      "등기부등본·권리 확인 서류"
    ],
    "optionalDocuments": [
      "중개 메시지·내용증명 자료"
    ],
    "exampleTags": [
      "계약서",
      "등기"
    ]
  },
  "RE02": {
    "documents": [
      "매매·임대차 계약서",
      "보증금·계약금 송금·영수 내역"
    ],
    "optionalDocuments": [
      "주고받은 메시지·통지 자료"
    ],
    "exampleTags": [
      "계약서",
      "송금확인"
    ]
  },
  "RE03": {
    "documents": [
      "받은 통보문·해지 통지 원문",
      "계약서 해지·통지 조항이 보이는 부분"
    ],
    "optionalDocuments": [
      "주고받은 메시지·대화 기록"
    ],
    "exampleTags": [
      "통보문",
      "계약서"
    ]
  },
  "RE04": {
    "documents": [
      "문제 부분 사진·영상",
      "수리 요청·응답 메시지 기록"
    ],
    "optionalDocuments": [
      "입주·퇴거 상태 확인 자료"
    ],
    "exampleTags": [
      "사진",
      "메시지"
    ]
  },
  "RE05": {
    "documents": [
      "계약서·지급 영수증",
      "권리 서류(명의 이전·핑크북) 사본"
    ],
    "optionalDocuments": [
      "중개·분양 관련 메시지"
    ],
    "exampleTags": [
      "계약서",
      "핑크북"
    ]
  }
};
