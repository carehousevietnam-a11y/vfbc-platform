/* AUTO-GENERATED — scripts/parse-real-estate-meta.mjs */
export type PackM45Metric = { template: string; fields: string[]; prepDefault?: string; suffixIfNotNone?: string };
export type PackM45StepVariant = { when: string; text: string };
export type PackM45 = {
  caseId: string;
  rulesRaw: string;
  stepsRaw: string;
  steps: string[];
  lookups: Record<string, string>;
  metrics: PackM45Metric[];
  stepVariants: PackM45StepVariant[];
};
export const REAL_ESTATE_M45: PackM45[] = [
  {
    "caseId": "RE01",
    "rulesRaw": "## 3. 1차 결과 \"핵심 확인 결과\" 3칸 문장 규칙\n\n| 칸 | 조합 기준 | 문장 규칙 | 예시 |\n|---|---|---|---|\n| 상황 | `re01_contract_type` + `re01_progress_stage` | \"[계약 종류]를 앞두고 있고, 현재 [진행 단계] 상태입니다.\" 한 문장 | 살 집을 빌리는 임대차 계약을 앞두고 있고, 계약서 초안을 받은 뒤 아직 서명이나 송금은 하지 않은 상태입니다. |\n| 확인 목표 | `re01_confirm_goal` + `re01_owner_doc_check` | \"[우선 확인 목표]를 먼저 확인해야 하며, 소유자 확인은 [확인 상태]입니다.\" 한 문장 | 계약서에 불리한 조항이 없는지 먼저 확인해야 하며, 소유자 확인은 핑크북 사본만 받은 상태라 원본 대조가 남아 있습니다. |\n| 대응·자료 | `re01_owner_doc_check` + `re01_progress_stage` | \"서명이나 송금 전에 [다음 행동]이 필요하고, [준비할 자료]를 준비해 두세요.\" 한 문장 | 서명 전에 핑크북 원본과 집주인 신분증을 대조하는 것이 필요하고, 계약서 초안과 중개인 메시지를 함께 준비해 두세요. |\n\n- 단계별 \"다음 행동\" 문구: `st_viewing` → 계약서 초안을 서면으로 받는 것 / `st_draft`·`st_sign_scheduled` → 조항 검토와 소유자 원본 대조 / `st_deposit_requested` → 송금 전에 계좌 명의와 위약 조항 확인 / `st_deposit_paid` → 계약금 영수증 확보와 본계약 조건 확정\n- 법적 결과는 단정하지 않고 \"~할 수 있습니다 / ~확인이 필요합니다\"로 끝낸다.\n\n---\n\n",
    "stepsRaw": "## 4. \"지금 확인해 보세요\" STEP 3개\n\n1. **소유자와 서명 권한 확인** — 핑크북 원본의 소유자 이름·주소·변동 사항 페이지를 상대방 신분증과 대조하고, 대리인이 서명한다면 공증된 위임장의 위임 범위를 확인하세요. (분양이면 개발사의 사업 서류와 외국인 구매 가능 물량을 서면으로 받으세요.)\n2. **돈을 보내기 전 조건 확인** — 송금 계좌가 소유자(또는 개발사) 본인 명의인지 확인하고, 계약금 몰수와 배액 반환이 양쪽 모두에게 적용된다는 문구와 서명된 영수증을 받을 수 있는지 확인하세요.\n3. **서명 전 계약서 마무리** — 계약서를 이해할 수 있는 언어로 받고 어느 언어를 우선하는지 적어 두며, 공증 여부와 함께 [임대: 임시거주 신고 책임 / 상가·사무실: 사용 용도와 회사 주소 등록 / 매매: 명의 이전 일정과 담보 해제 순서]를 계약서에 넣어 두세요.\n",
    "steps": [
      "소유자와 서명 권한 확인 — 핑크북 원본의 소유자 이름·주소·변동 사항 페이지를 상대방 신분증과 대조하고, 대리인이 서명한다면 공증된 위임장의 위임 범위를 확인하세요. (분양이면 개발사의 사업 서류와 외국인 구매 가능 물량을 서면으로 받으세요.)",
      "돈을 보내기 전 조건 확인 — 송금 계좌가 소유자(또는 개발사) 본인 명의인지 확인하고, 계약금 몰수와 배액 반환이 양쪽 모두에게 적용된다는 문구와 서명된 영수증을 받을 수 있는지 확인하세요.",
      "서명 전 계약서 마무리 — 계약서를 이해할 수 있는 언어로 받고 어느 언어를 우선하는지 적어 두며, 공증 여부와 함께 [임대: 임시거주 신고 책임 / 상가·사무실: 사용 용도와 회사 주소 등록 / 매매: 명의 이전 일정과 담보 해제 순서]를 계약서에 넣어 두세요."
    ],
    "lookups": {
      "st_sign_scheduled": "조항 검토와 소유자 원본 대조",
      "st_deposit_requested": "송금 전에 계좌 명의와 위약 조항 확인",
      "st_deposit_paid": "계약금 영수증 확보와 본계약 조건 확정",
      "r1_ct_lease_home": "살 집을 빌리는 임대차 계약",
      "r1_st_draft": "계약서 초안을 받은 뒤 아직 서명이나 송금은 하지 않은 상태",
      "r1_ct_lease_office": "사무실·상가 임대차 계약",
      "r1_ct_purchase_project": "분양 아파트 매매 계약",
      "r1_ct_purchase_resale": "기존 주택·아파트 매매 계약",
      "r1_ct_deposit_only": "계약금 약정(đặt cọc) 단계",
      "r1_st_viewing": "집을 보고 조건만 들었고, 계약서나 서류는 아직 받지 못한 상태",
      "r1_st_deposit_requested": "계약서에 서명하기 전에 계약금부터 먼저 보내라는 요청을 받은 상태",
      "r1_st_deposit_paid": "계약금은 이미 보냈고, 본계약 서명이나 잔금 지급을 앞두고 있는 상태",
      "r1_st_sign_scheduled": "서명 날짜가 정해졌고, 그 전에 계약서를 확인받고 싶은 상태",
      "r1_cg_owner_authority": "계약 상대방의 소유자·서명 권한",
      "r1_cg_contract_terms": "계약서에 불리한 조항이 없는지",
      "r1_cg_money_safety": "계약금·보증금 송금의 안전성",
      "r1_cg_foreigner_fit": "외국인 계약·거주 신고 가능 여부",
      "r1_cg_order_unsure": "서명 전 확인 순서",
      "r1_od_original_match": "핑크북 원본과 소유자 이름이 일치한 상태입니다",
      "r1_od_copy_only": "핑크북 사본만 받은 상태라 원본 대조가 남아 있습니다",
      "r1_od_signer_differs": "소유자와 서명할 사람이 달라 권한 확인이 필요한 상태입니다",
      "r1_od_refused_delay": "핑크북 확인이 계속 미뤄지는 상태입니다",
      "r1_od_project_no_book": "분양 단계로 핑크북이 없고 사업 서류만 있는 상태입니다",
      "r1_st_viewing__r1_od_original_match": "계약서·서류는 아직 받지 못했지만, 핑크북 원본을 직접 보고 소유자 이름이 계약 상대방과 일치함을 확인한 상태입니다"
    },
    "metrics": [
      {
        "template": "{contract}을 앞두고 있고, 현재 {stage}입니다.",
        "fields": [
          "re01_contract_type",
          "re01_progress_stage"
        ]
      },
      {
        "template": "{goal}를 먼저 확인해야 하며, 소유자 확인은 {owner_doc}.",
        "fields": [
          "re01_confirm_goal",
          "re01_owner_doc_check"
        ]
      },
      {
        "template": "서명이나 송금 전에 {next_action}이 필요하고, {prep}를 준비해 두세요.",
        "fields": [
          "re01_progress_stage",
          "re01_owner_doc_check"
        ],
        "prepDefault": "계약서 초안과 중개인 메시지"
      }
    ],
    "stepVariants": []
  },
  {
    "caseId": "RE02",
    "rulesRaw": "### 1차 결과 \"핵심 확인 결과\" 3칸 문장 규칙\n1. **상황** = `re02_role` + (`re02_dispute_type` 또는 `re02_dispute_type_holder`) + `re02_contract_end`를 한 문장으로 연결.\n   - 형식: \"{역할}로서 {분쟁 유형 요약}이며, 계약은 {종료 방식 요약} 상태입니다.\"\n   - 예: \"세입자로서 보증금 중 일부가 수리비 등으로 공제된 상황이며, 계약은 기간 만료로 종료된 상태입니다.\"\n   - 역할 요약어: role_tenant=세입자 / role_company_occupant=회사 명의 계약의 실제 거주자 / role_landlord=집주인 / role_buyer=매수인 / role_seller=매도인.\n   - 종료 요약어: end_expired=기간 만료로 종료 / end_me_with_notice=고객님이 미리 알리고 먼저 종료 / end_me_short_notice=고객님이 먼저 종료했으나 사전 통지가 부족 / end_other_first=상대방 사정으로 종료 / end_not_ended=아직 종료되지 않음.\n2. **확인 목표** = `re02_confirm_goal` 선택지를 \"~를 확인합니다\"로 바꿔 1문장. 결과를 단정하지 않고 확인 대상만 적는다.\n   - cg_entitlement → \"이 돈을 돌려받을 수 있는지(또는 돌려주어야 하는지)를 계약서와 실제 사정 기준으로 확인합니다.\"\n   - cg_amount_check → \"공제·요구 금액의 항목과 계산 방식이 맞는지 확인합니다.\"\n   - cg_forfeit_rule → \"계약금 몰수 또는 두 배 반환 주장이 계약서 조항과 계약이 깨진 경위에 맞는지 확인합니다.\"\n   - cg_how_to_demand → \"상대방에게 요구할 시점과 기록이 남는 요구 방법을 확인합니다.\"\n   - cg_unsure → \"지금 상황에서 먼저 정리할 사실과 진행 순서를 확인합니다.\"\n3. **대응·자료** = 분쟁 유형별로 준비할 자료 1문장(+ end_me_short_notice/end_not_ended면 주의 1구절 추가).\n   - dt_not_returned / dt_contact_avoided / hd_contact_lost → \"계약서, 송금 내역, 상대방과 주고받은 메시지를 먼저 모아 두세요.\"\n   - dt_partial_deduction / hd_deduct_dispute → \"공제 항목별 내역·영수증과 집을 비울 때의 사진·점검 기록을 함께 준비하세요.\"\n   - dt_deposit_forfeited / hd_forfeit_dispute / hd_double_demand → \"계약서의 계약금(đặt cọc) 조항과 계약이 진행되지 못한 경위를 날짜순으로 정리하세요.\"\n   - dt_extra_claim / hd_extra_claim → \"추가 금액의 근거 조항과 계산 내역을 상대방에게 받아 두고, 확인 전에는 지급이나 요구를 서두르지 마세요.\"\n   - 추가 구절: end_me_short_notice → \"계약서의 사전 통지 조항도 함께 확인하세요.\" / end_not_ended → \"계약이 아직 유지 중이므로 대응 방식은 신중히 정하세요.\"\n\n",
    "stepsRaw": "### \"지금 확인해 보세요\" STEP 3개\n1. **STEP 1 — 계약서의 돈 관련 조항 확인**: 보증금 반환 기한, 공제 조건, 계약금(đặt cọc) 처리, 중도 해지 시 통지 기간이 적힌 조항을 찾아 표시해 두세요.\n2. **STEP 2 — 돈이 오간 기록 정리**: 송금 내역·영수증·받았다는 메시지를 날짜와 금액순으로 모으고, 중개인이나 대리인을 거쳤다면 실제로 누가 받았는지도 함께 적어 두세요.\n3. **STEP 3 — 요구와 답변을 기록으로 남기기**: 지금까지 말로만 요구했다면 금액·근거·기한을 적어 글로 다시 보내고, 상대방의 답변은 캡처해 보관하세요.\n",
    "steps": [
      "STEP 1 — 계약서의 돈 관련 조항 확인: 보증금 반환 기한, 공제 조건, 계약금(đặt cọc) 처리, 중도 해지 시 통지 기간이 적힌 조항을 찾아 표시해 두세요.",
      "STEP 2 — 돈이 오간 기록 정리: 송금 내역·영수증·받았다는 메시지를 날짜와 금액순으로 모으고, 중개인이나 대리인을 거쳤다면 실제로 누가 받았는지도 함께 적어 두세요.",
      "STEP 3 — 요구와 답변을 기록으로 남기기: 지금까지 말로만 요구했다면 금액·근거·기한을 적어 글로 다시 보내고, 상대방의 답변은 캡처해 보관하세요."
    ],
    "lookups": {
      "cg_entitlement": "이 돈을 돌려받을 수 있는지(또는 돌려주어야 하는지)를 계약서와 실제 사정 기준으로 확인합니다.",
      "cg_amount_check": "공제·요구 금액의 항목과 계산 방식이 맞는지 확인합니다.",
      "cg_forfeit_rule": "계약금 몰수 또는 두 배 반환 주장이 계약서 조항과 계약이 깨진 경위에 맞는지 확인합니다.",
      "cg_how_to_demand": "상대방에게 요구할 시점과 기록이 남는 요구 방법을 확인합니다.",
      "cg_unsure": "지금 상황에서 먼저 정리할 사실과 진행 순서를 확인합니다.",
      "dt_not_returned": "dt_contact_avoided / hd_contact_lost",
      "dt_contact_avoided": "계약서, 송금 내역, 상대방과 주고받은 메시지를 먼저 모아 두세요.",
      "hd_contact_lost": "계약서, 송금 내역, 상대방과 주고받은 메시지를 먼저 모아 두세요.",
      "dt_partial_deduction": "hd_deduct_dispute",
      "hd_deduct_dispute": "공제 항목별 내역·영수증과 집을 비울 때의 사진·점검 기록을 함께 준비하세요.",
      "dt_deposit_forfeited": "hd_forfeit_dispute / hd_double_demand",
      "hd_forfeit_dispute": "계약서의 계약금(đặt cọc) 조항과 계약이 진행되지 못한 경위를 날짜순으로 정리하세요.",
      "hd_double_demand": "계약서의 계약금(đặt cọc) 조항과 계약이 진행되지 못한 경위를 날짜순으로 정리하세요.",
      "dt_extra_claim": "hd_extra_claim",
      "hd_extra_claim": "추가 금액의 근거 조항과 계산 내역을 상대방에게 받아 두고, 확인 전에는 지급이나 요구를 서두르지 마세요.",
      "role_tenant": "세입자",
      "role_company_occupant": "회사 명의 계약의 실제 거주자",
      "role_landlord": "집주인",
      "role_buyer": "매수인",
      "role_seller": "매도인",
      "end_expired": "기간이 지나 종료되었습니다",
      "end_me_with_notice": "고객님이 미리 알리고 먼저 종료했습니다",
      "end_me_short_notice": "고객님이 먼저 종료했으나 사전 통지가 부족했습니다",
      "end_other_first": "상대방 사정으로 종료되었습니다",
      "end_not_ended": "아직 종료되지 않았습니다",
      "sit_dt_not_returned": "맡긴 보증금이나 계약금을 아직 전혀 돌려받지 못한 상황",
      "sit_dt_partial_deduction": "보증금 일부 공제를 주장하는 상황",
      "sit_dt_deposit_forfeited": "계약금을 돌려주지 않는 상황",
      "sit_dt_extra_claim": "보증금을 넘는 추가 금액을 요구하는 상황",
      "sit_dt_contact_avoided": "상대방이 연락을 피하는 상황",
      "sit_hd_deduct_dispute": "공제 금액을 두고 다투는 상황",
      "sit_hd_forfeit_dispute": "계약금 몰수를 두고 다투는 상황",
      "sit_hd_double_demand": "계약금 두 배 반환을 주장하는 상황",
      "sit_hd_extra_claim": "추가 금액을 요구하는 상황",
      "sit_hd_contact_lost": "상대방 연락이 끊긴 상황"
    },
    "metrics": [
      {
        "template": "{role}로서 {dispute}이며, 계약은 {end} 상태입니다.",
        "fields": [
          "re02_role",
          "re02_dispute_type",
          "re02_contract_end"
        ]
      },
      {
        "template": "{goal}",
        "fields": [
          "re02_confirm_goal"
        ]
      },
      {
        "template": "{materials}",
        "fields": [
          "re02_dispute_type"
        ]
      }
    ],
    "stepVariants": []
  },
  {
    "caseId": "RE03",
    "rulesRaw": "### 1차 결과 \"핵심 확인 결과\" 3칸 문장 규칙\n- **상황**: `re03_my_role` + `re03_demand_type`를 한 문장으로 합친다. 형식: \"[역할]로서 상대방에게서 [요구 내용] 통보를 받은 상황입니다.\"\n  - 역할: role_tenant \"임차인\", role_company_staff \"회사 명의 계약의 거주자\", role_subtenant \"원래 세입자에게서 다시 빌린 거주자\", role_landlord \"집주인\", role_proxy \"계약 당사자를 대신해 확인하는 분\"\n  - 요구 내용: dm_fix_breach \"기간 내 시정 요구\", dm_terminate \"계약 해지\", dm_vacate_date \"날짜를 정한 퇴거\", dm_money_claim \"위약금·손해배상 요구\", dm_unclear \"요구 내용이 분명하지 않은\"\n- **확인 목표**: `re03_confirm_goal`을 한 문장으로 바꾼다.\n  - cg_validity \"통보가 계약서 조항과 통지 기간에 맞는지 확인하는 것이 먼저입니다.\"\n  - cg_move_timing \"집을 비워야 하는 시점과 그 전에 할 일을 확인하는 것이 먼저입니다.\"\n  - cg_money \"보증금 정리와 위약금·손해배상 여부를 확인하는 것이 먼저입니다.\"\n  - cg_fact_gap \"통보 사유 중 사실과 다른 부분을 정리하는 것이 먼저입니다.\"\n  - cg_order \"무엇부터 진행할지 순서를 정하는 것이 먼저입니다.\"\n- **대응·자료**: `re03_response_status`를 한 문장으로 바꾸고, 대응이 있었으면 \"그 기록을 남겨 두는 것이 중요합니다.\"를 붙인다.\n  - rs_none \"아직 상대방에게 답하지 않은 상태로, 답하기 전에 계약서와 통보 원문을 나란히 확인하는 것이 좋습니다.\"\n  - rs_inquired \"이유를 물어본 상태로, 상대방의 답을 서면이나 메시지로 받아 두는 것이 좋습니다.\"\n  - rs_disputed \"사실과 다르다고 말한 상태로, 이를 뒷받침할 송금 내역·메시지·사진을 모아야 합니다.\"\n  - rs_complied_part \"요구 일부를 이행한 상태로, 이행한 날짜와 내용을 보여 줄 기록이 필요합니다.\"\n  - rs_negotiating \"조건을 협의 중인 상태로, 합의한 날짜와 금액은 반드시 서면으로 남겨야 합니다.\"\n\n",
    "stepsRaw": "### \"지금 확인해 보세요\" STEP 3개\n1. **계약서와 통보를 나란히 놓고 비교하기** — 계약서에서 해지 사유·통지 기간·위약금·보증금 반환 조항을 찾아, 통보에 적힌 날짜와 요구가 그 조항과 맞는지 표시해 보세요. 베트남어 계약서라면 해당 조항만이라도 번역해 두세요.\n2. **사실을 보여 줄 자료를 날짜순으로 모으기** — 통보 원본이나 메시지 캡처, 임대료·관리비 송금 내역, 상대방·중개인과 주고받은 대화, 입주 때와 지금의 집 상태 사진을 한곳에 모아 날짜순으로 정리해 두세요.\n3. **답변과 합의는 기록이 남는 방법으로 하기** — 상대방에게 답하거나 날짜·금액을 합의할 때는 서면이나 메시지로 남기고, 집을 비우게 된다면 보증금 정리 내용·집 상태 확인·열쇠 반납을 기록으로 남긴 뒤, 새 주소에서 임시거주 신고(공안)를 다시 해야 하는지도 확인해 두세요.\n",
    "steps": [
      "계약서와 통보를 나란히 놓고 비교하기 — 계약서에서 해지 사유·통지 기간·위약금·보증금 반환 조항을 찾아, 통보에 적힌 날짜와 요구가 그 조항과 맞는지 표시해 보세요. 베트남어 계약서라면 해당 조항만이라도 번역해 두세요.",
      "사실을 보여 줄 자료를 날짜순으로 모으기 — 통보 원본이나 메시지 캡처, 임대료·관리비 송금 내역, 상대방·중개인과 주고받은 대화, 입주 때와 지금의 집 상태 사진을 한곳에 모아 날짜순으로 정리해 두세요.",
      "답변과 합의는 기록이 남는 방법으로 하기 — 상대방에게 답하거나 날짜·금액을 합의할 때는 서면이나 메시지로 남기고, 집을 비우게 된다면 보증금 정리 내용·집 상태 확인·열쇠 반납을 기록으로 남긴 뒤, 새 주소에서 임시거주 신고(공안)를 다시 해야 하는지도 확인해 두세요."
    ],
    "lookups": {
      "cg_validity": "통보가 계약서 조항과 통지 기간에 맞는지 확인하는 것이 먼저입니다.",
      "cg_move_timing": "집을 비워야 하는 시점과 그 전에 할 일을 확인하는 것이 먼저입니다.",
      "cg_money": "보증금 정리와 위약금·손해배상 여부를 확인하는 것이 먼저입니다.",
      "cg_fact_gap": "통보 사유 중 사실과 다른 부분을 정리하는 것이 먼저입니다.",
      "cg_order": "무엇부터 진행할지 순서를 정하는 것이 먼저입니다.",
      "rs_none": "아직 상대방에게 답하지 않은 상태로, 답하기 전에 계약서와 통보 원문을 나란히 확인하는 것이 좋습니다.",
      "rs_inquired": "이유를 물어본 상태로, 상대방의 답을 서면이나 메시지로 받아 두는 것이 좋습니다.",
      "rs_disputed": "사실과 다르다고 말한 상태로, 이를 뒷받침할 송금 내역·메시지·사진을 모아야 합니다.",
      "rs_complied_part": "요구 일부를 이행한 상태로, 이행한 날짜와 내용을 보여 줄 기록이 필요합니다.",
      "rs_negotiating": "조건을 협의 중인 상태로, 합의한 날짜와 금액은 반드시 서면으로 남겨야 합니다.",
      "role_tenant": "임차인",
      "r3_role_tenant": "임차인",
      "dm_fix_breach": "기간 내 시정 요구",
      "r3_dm_fix_breach": "기간 내 시정 요구",
      "r3_cg_validity": "통보가 계약서 조항과 통지 기간에 맞는지 확인하는 것이 먼저입니다.",
      "r3_cg_move_timing": "집을 비워야 하는 시점과 그 전에 할 일을 확인하는 것이 먼저입니다.",
      "r3_cg_money": "보증금 정리와 위약금·손해배상 여부를 확인하는 것이 먼저입니다.",
      "r3_cg_fact_gap": "통보 사유 중 사실과 다른 부분을 정리하는 것이 먼저입니다.",
      "r3_cg_order": "무엇부터 진행할지 순서를 정하는 것이 먼저입니다.",
      "r3_rs_none": "아직 상대방에게 답하지 않은 상태로, 답하기 전에 계약서와 통보 원문을 나란히 확인하는 것이 좋습니다.",
      "r3_rs_inquired": "이유를 물어본 상태로, 상대방의 답을 서면이나 메시지로 받아 두는 것이 좋습니다.",
      "r3_rs_disputed": "사실과 다르다고 말한 상태로, 이를 뒷받침할 송금 내역·메시지·사진을 모아야 합니다.",
      "r3_rs_complied_part": "요구 일부를 이행한 상태로, 이행한 날짜와 내용을 보여 줄 기록이 필요합니다.",
      "r3_rs_negotiating": "조건을 협의 중인 상태로, 합의한 날짜와 금액은 반드시 서면으로 남겨야 합니다.",
      "r3_role_company_staff": "회사 명의 계약의 거주자",
      "r3_role_subtenant": "원래 세입자에게서 다시 빌린 거주자",
      "r3_role_landlord": "집주인",
      "r3_role_proxy": "계약 당사자를 대신해 확인하는 분",
      "r3_dm_terminate": "계약 해지",
      "r3_dm_vacate_date": "날짜를 정한 퇴거",
      "r3_dm_money_claim": "위약금·손해배상 요구",
      "r3_dm_unclear": "요구 내용이 분명하지 않은"
    },
    "metrics": [
      {
        "template": "{role}으로서 상대방에게서 {demand} 통보를 받은 상황입니다.",
        "fields": [
          "re03_my_role",
          "re03_demand_type"
        ]
      },
      {
        "template": "{goal}",
        "fields": [
          "re03_confirm_goal"
        ]
      },
      {
        "template": "{response}",
        "fields": [
          "re03_response_status"
        ],
        "suffixIfNotNone": " 그 기록을 남겨 두는 것이 중요합니다."
      }
    ],
    "stepVariants": []
  },
  {
    "caseId": "RE04",
    "rulesRaw": "### 1차 결과 \"핵심 확인 결과\" 3칸 문장 규칙\n- 상황: `re04_issue_type` + `re04_since_when`를 한 문장으로 연결한다. 형식: \"[문제 유형 요약]이 [기간] 이어지고 있습니다.\" 예: \"누수 수리를 집주인이 미루는 상황이 한 달 넘게 이어지고 있습니다.\" 법적 책임 판단은 쓰지 않는다.\n- 확인 목표: `re04_confirm_goal`을 \"~인지 확인합니다\"로 바꾼다. 예: `cg_self_repair_cost` → \"먼저 쓴 수리비를 월세나 보증금에서 정산받을 수 있는지 확인합니다.\"\n- 대응·자료: `re04_notify_status`로 지금 남아 있는 요청 기록의 수준을 쓰고, 다음에 남길 기록 한 가지를 붙인다. [대표 승인 2026-10-07, C1.21]\n  - `nt_not_told` → \"아직 정식 요청 기록이 없으므로, 문제 사진과 날짜를 붙인 메시지로 먼저 요청해 기록을 남기는 것이 우선입니다.\"\n  - `nt_verbal_only` → \"말로만 알린 상태이므로, 날짜와 사진을 붙인 메시지로 다시 요청해 기록을 남기는 것이 먼저입니다.\"\n  - `nt_message_sent` → \"메시지 요청 기록이 있으므로, 상대방의 답변과 약속 날짜를 함께 정리하세요.\"\n  - `nt_formal_request` → \"서면 요청 기록이 있으므로, 상대방의 답변과 약속 날짜를 함께 정리합니다.\"\n  - `nt_via_agent` → \"중개인이나 관리사무소를 거친 요청은 전달 여부가 확인되지 않으므로, 상대방에게 직접 메시지로 다시 요청해 기록을 남기세요.\"\n\n",
    "stepsRaw": "### \"지금 확인해 보세요\" STEP 3개\n1. STEP 1 — 날짜 있는 기록 모으기: 문제 상태 사진·영상, 입주 당시 사진, 상대방과 주고받은 메시지를 날짜 순서로 한곳에 모아 주세요.\n2. STEP 2 — 계약서 조항 찾기: 계약서에서 수리·관리비·요금·출입·보증금 반환과 관련된 조항을 찾아 표시하고, 베트남어라면 해당 부분만 따로 사진으로 남겨 주세요.\n3. STEP 3 — 월세는 그대로, 요청은 서면으로: 정산 방법이 확인되기 전까지 월세는 계약대로 보내고, 문제 내용·요청 사항·해결 희망 날짜를 적은 메시지를 상대방에게 직접 보내 기록을 남겨 주세요.\n",
    "steps": [
      "STEP 1 — 날짜 있는 기록 모으기: 문제 상태 사진·영상, 입주 당시 사진, 상대방과 주고받은 메시지를 날짜 순서로 한곳에 모아 주세요.",
      "STEP 2 — 계약서 조항 찾기: 계약서에서 수리·관리비·요금·출입·보증금 반환과 관련된 조항을 찾아 표시하고, 베트남어라면 해당 부분만 따로 사진으로 남겨 주세요.",
      "STEP 3 — 월세는 그대로, 요청은 서면으로: 정산 방법이 확인되기 전까지 월세는 계약대로 보내고, 문제 내용·요청 사항·해결 희망 날짜를 적은 메시지를 상대방에게 직접 보내 기록을 남겨 주세요."
    ],
    "lookups": {
      "cg_self_repair_cost": "먼저 쓴 수리비를 월세나 보증금에서 정산받을 수 있는지 확인합니다.",
      "it_repair_refused": "누수·설비 수리를 집주인이 미루는 상황",
      "it_prior_defect_blamed": "입주 전 하자를 제 책임으로 돌리는 상황",
      "it_fee_dispute": "관리비·요금 금액을 두고 다투는 상황",
      "it_neighbor_management": "이웃·관리 문제로 생활이 어려운 상황",
      "it_landlord_entry": "동의 없는 출입·출입 요구가 있는 상황",
      "sw_within_week": "1주일 안쪽에",
      "sw_within_month": "몇 주 전부터",
      "sw_over_month": "한 달 넘게",
      "sw_since_movein": "입주할 때부터",
      "sw_recurring": "같은 문제가 반복되면서",
      "nt_not_told": "아직 정식 요청 기록이 없으므로, 문제 사진과 날짜를 붙인 메시지로 먼저 요청해 기록을 남기는 것이 우선입니다.",
      "nt_verbal_only": "말로만 알린 상태이므로, 날짜와 사진을 붙인 메시지로 다시 요청해 기록을 남기는 것이 먼저입니다.",
      "nt_message_sent": "메시지 요청 기록이 있으므로, 상대방의 답변과 약속 날짜를 함께 정리하세요.",
      "nt_formal_request": "서면 요청 기록이 있으므로, 상대방의 답변과 약속 날짜를 함께 정리합니다.",
      "nt_via_agent": "중개인이나 관리사무소를 거친 요청은 전달 여부가 확인되지 않으므로, 상대방에게 직접 메시지로 다시 요청해 기록을 남기세요."
    },
    "metrics": [
      {
        "template": "{issue}이 {since} 이어지고 있습니다.",
        "fields": [
          "re04_issue_type",
          "re04_since_when"
        ]
      },
      {
        "template": "{goal}",
        "fields": [
          "re04_confirm_goal"
        ]
      },
      {
        "template": "{notify}",
        "fields": [
          "re04_notify_status"
        ]
      }
    ],
    "stepVariants": []
  },
  {
    "caseId": "RE05",
    "rulesRaw": "### 1차 결과 \"핵심 확인 결과\" 3칸 문장 규칙\n\n1. **상황** = re05_stage 요약 + re05_counterparty 요약 + re05_paidStage 요약\n   - 형식: \"{상대방}과의 거래에서 {지급 단계} 상태이며, {문제 상황}.\"\n   - stage 요약: transfer_delay \"명의 이전이 약속한 시점에 끝나지 않고 있습니다\" / project_book_pending \"핑크북이 아직 발급되지 않았습니다\" / book_mismatch \"핑크북 내용이 계약이나 실제 집과 다릅니다\" / foreign_eligibility \"외국인 소유 가능 여부가 확인되지 않았습니다\" / registration_rejected \"토지등록사무소에서 신청을 받아들이지 않았습니다\"\n   - counterparty 요약: 개인 매도인 / 분양 회사 / 분양 계약을 넘겨준 사람 / 중개인을 통한 매도인 / 권리자가 확인되지 않은 상대방\n   - paidStage 요약: 계약금만 지급한 / 중도금까지 지급한 / 잔금까지 지급한 / 중개인·지인 계좌로 지급한 / 아직 지급하지 않은\n2. **확인 목표** = re05_confirmGoal 문장을 \"~확인합니다\"로 바꿔 표시\n   - cg_why_stuck \"멈춰 있는 원인을 확인합니다\" / cg_doc_valid \"핑크북과 계약서의 진위와 내용을 확인합니다\" / cg_foreign_ok \"외국인 명의 소유 가능 여부와 조건을 확인합니다\" / cg_money_safe \"지급한 돈의 안전과 남은 돈의 지급 여부를 확인합니다\" / cg_order \"진행 순서를 정리합니다\"\n3. **대응·자료** = `re05_paidStage`별 1문장 (phase1 m3). [대표 승인 2026-10-07, C1.21]\n   - `r5_paid_nothing` → \"계약서 초안, 핑크북 사본, 상대방과 주고받은 메시지를 먼저 모아 두세요.\"\n   - `r5_paid_deposit` → \"계약서, 계약금 송금 내역, 명의 이전 일정에 관한 메시지를 먼저 모아 두세요.\"\n   - `r5_paid_interim` → \"계약서, 계약금·중도금 송금 내역, 명의 이전 일정에 관한 메시지를 먼저 모아 두세요.\"\n   - `r5_paid_balance` → \"계약서, 잔금까지의 송금 내역과 영수증, 인도·명의 이전 관련 서류와 메시지를 먼저 모아 두세요.\"\n   - `r5_paid_via_broker` → \"송금을 받은 계좌의 명의와 송금 영수증, 중개인과 주고받은 메시지를 먼저 모아 두세요.\"\n   - 2차 응답 후 종합 결과는 기존 Pack 규칙(대응·보관 자료 요약)을 따른다.\n\n",
    "stepsRaw": "### \"지금 확인해 보세요\" STEP 3개\n\n- STEP 1. 핑크북 원본이나 앞·뒷면 사본에서 소유자 이름, 면적, 주소, 뒷면의 담보 기재 내용을 확인해 주세요.\n  - (re05_stage = project_book_pending이면 대체) 분양 계약서에서 핑크북 발급 기한과 마지막 잔금 지급 조건이 적힌 조항을 찾아 주세요.\n  - (re05_stage = foreign_eligibility이면 대체) 이 집이 분양 프로젝트 안의 아파트인지, 땅이 딸린 주택인지 계약서와 분양 자료로 확인해 주세요.\n- STEP 2. 계약서에서 명의 이전 기한, 세금 부담자, 잔금 지급 조건, 지연·해제 시 계약금 처리 조항을 찾아 표시해 주세요.\n- STEP 3. 지금까지 지급한 금액을 날짜·금액·받은 사람 순으로 정리하고, 상대방에게 현재 진행 단계와 예정일을 메시지로 받아 두세요.\n  - (re05_stage = registration_rejected이면 대체) 통지서의 불수리 이유와 다시 신청할 수 있는 기간을 번역해 확인하고, 통지서 원본을 보관해 주세요.\n",
    "steps": [
      "핑크북 원본이나 앞·뒷면 사본에서 소유자 이름, 면적, 주소, 뒷면의 담보 기재 내용을 확인해 주세요.",
      "계약서에서 명의 이전 기한, 세금 부담자, 잔금 지급 조건, 지연·해제 시 계약금 처리 조항을 찾아 표시해 주세요.",
      "지금까지 지급한 금액을 날짜·금액·받은 사람 순으로 정리하고, 상대방에게 현재 진행 단계와 예정일을 메시지로 받아 두세요."
    ],
    "lookups": {
      "r5_transfer_delay": "명의 이전이 약속한 시점에 끝나지 않고 있습니다",
      "cg_why_stuck": "멈춰 있는 원인을 확인합니다",
      "r5_project_book_pending": "핑크북이 아직 발급되지 않았습니다",
      "r5_book_mismatch": "핑크북 내용이 계약이나 실제 집과 다릅니다",
      "r5_foreign_eligibility": "외국인 소유 가능 여부가 확인되지 않았습니다",
      "r5_registration_rejected": "토지등록사무소에서 신청을 받아들이지 않았습니다",
      "r5_cg_why_stuck": "멈춰 있는 원인을 확인합니다",
      "cg_doc_valid": "핑크북과 계약서의 진위와 내용을 확인합니다",
      "r5_cg_doc_valid": "핑크북과 계약서의 진위와 내용을 확인합니다",
      "cg_foreign_ok": "외국인 명의 소유 가능 여부와 조건을 확인합니다",
      "r5_cg_foreign_ok": "외국인 명의 소유 가능 여부와 조건을 확인합니다",
      "cg_money_safe": "지급한 돈의 안전과 남은 돈의 지급 여부를 확인합니다",
      "r5_cg_money_safe": "지급한 돈의 안전과 남은 돈의 지급 여부를 확인합니다",
      "cg_order": "진행 순서를 정리합니다",
      "r5_cg_order": "진행 순서를 정리합니다",
      "r5_cp_individual_seller": "개인 매도인",
      "r5_cp_developer": "분양 회사",
      "r5_cp_resale_buyer": "분양 계약을 넘겨준 사람",
      "r5_cp_broker_only": "중개인을 통한 매도인",
      "r5_cp_owner_unclear": "권리자가 확인되지 않은 상대방",
      "r5_paid_deposit": "계약금만 지급한",
      "r5_paid_interim": "중도금까지 지급한",
      "r5_paid_balance": "잔금까지 지급한",
      "r5_paid_via_broker": "중개인·지인 계좌로 지급한",
      "r5_paid_nothing": "아직 지급하지 않은",
      "m3_r5_paid_nothing": "계약서 초안, 핑크북 사본, 상대방과 주고받은 메시지를 먼저 모아 두세요.",
      "m3_r5_paid_deposit": "계약서, 계약금 송금 내역, 명의 이전 일정에 관한 메시지를 먼저 모아 두세요.",
      "m3_r5_paid_interim": "계약서, 계약금·중도금 송금 내역, 명의 이전 일정에 관한 메시지를 먼저 모아 두세요.",
      "m3_r5_paid_balance": "계약서, 잔금까지의 송금 내역과 영수증, 인도·명의 이전 관련 서류와 메시지를 먼저 모아 두세요.",
      "m3_r5_paid_via_broker": "송금을 받은 계좌의 명의와 송금 영수증, 중개인과 주고받은 메시지를 먼저 모아 두세요."
    },
    "metrics": [
      {
        "template": "{cp}과의 거래에서 {paid} 상태이며, {stage}.",
        "fields": [
          "re05_counterparty",
          "re05_paidStage",
          "re05_stage"
        ]
      },
      {
        "template": "{goal}",
        "fields": [
          "re05_confirmGoal"
        ]
      },
      {
        "template": "{m3_prep}",
        "fields": [
          "re05_paidStage"
        ]
      }
    ],
    "stepVariants": []
  }
];
