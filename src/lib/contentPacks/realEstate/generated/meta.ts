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
};

export const REAL_ESTATE_FIRST_RESULT_PACK_META: Record<string, FirstResultPackMeta> = {
  "RE01": {
    "firstResultCautionsSectionSubtitle": "| 계약 전 확인 핵심 포인트",
    "phase1VerdictBoost": [],
    "firstResultVerdictFloor": false,
    "firstResultNoRiskFloorTitle": "",
    "firstResultNoRiskFloorBody": ""
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
    "firstResultNoRiskFloorBody": "계약서의 보증금 반환 조항과 송금 내역을 먼저 맞춰 보세요. 반환 시기와 금액이 어떻게 정해져 있는지가 출발점입니다."
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
    "firstResultNoRiskFloorBody": "받은 통보문 원문과 계약서의 해지·통지 조항을 나란히 놓고, 통지 기간과 방식이 맞는지 먼저 보세요."
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
    "firstResultNoRiskFloorBody": "문제가 된 부분의 사진·메시지·수리 요청 기록을 날짜순으로 모아 두세요. 누가 언제 무엇을 요청했는지가 핵심입니다."
  },
  "RE05": {
    "firstResultCautionsSectionSubtitle": "| 권리·지급 확인 핵심 포인트",
    "phase1VerdictBoost": [],
    "firstResultVerdictFloor": true,
    "firstResultNoRiskFloorTitle": "먼저 확인할 사항",
    "firstResultNoRiskFloorBody": "계약서·지급 영수증과 권리 서류(명의 이전·핑크북) 현재 상태를 먼저 대조해 보세요. 지급한 돈과 서류 상태가 맞는지가 출발점입니다."
  }
};
