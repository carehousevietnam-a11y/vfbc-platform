# VFBCAI 부동산 문서 검토(verify_real-estate) Content Pack v1 — Clean Build

- 기준: LOCK된 VFBCAI Admin MASTER 엔진·구조·밀도 규칙 그대로. 내용은 전부 새로 작성(행정문서 번역·옛 부동산 로직·복제 엔진 사용 금지).
- 모든 고객 문구: NEW(Ace 확정 필요). 실명 대신 "VFBCAI 전문가팀", 금액은 ○○○.
- 모든 single/multi 질문 끝에는 엔진 공용 "위에 내용이 없거나 설명이 필요합니다 → 직접 입력"이 자동으로 붙는다.
- value는 서비스 전체에서 유일. Value→Label 단일 표로 선택 화면·저장·요약·재방문·결과·My Page·PDF 모두 같은 라벨 사용.
- show_if 표기: `질문id = v1|v2`, AND / OR 결합. 엔진이 단일 조건만 지원하면 Cursor가 조건을 분리해 같은 의미로 구현.
- 판정 집계(전 CASE 공통): 선택된 위험 신호 중 가장 높은 단계가 결과 단계. 단, '주의' 3개 이상이면 '전문가 권장'. 특수 사건 표시 항목 선택 시 "VFBCAI 전문가팀 진행" 안내.

## 공용 Q1 re_entry — 지금 어떤 상황인가요?
| value | 선택지 | CASE |
|---|---|---|
| pre_contract | 집을 빌리거나 사기 전이라, 계약서나 조건이 괜찮은지 먼저 확인하고 싶습니다. | RE01 계약 전 검토 |
| deposit_dispute | 보증금이나 계약금을 돌려받지 못했거나, 돈 문제로 상대방과 다투고 있습니다. | RE02 보증금·계약금 분쟁 |
| termination_notice | 상대방에게서 계약 위반·해지·퇴거 통보를 받았습니다. | RE03 위반·해지·퇴거 통보 |
| living_issue | 살고 있는 집의 수리·하자·관리비·이웃 문제로 상대방과 해결이 안 되고 있습니다. | RE04 거주 중 문제 |
| title_issue | 집을 사는 과정에서 명의 이전이나 핑크북(토지사용권 증서) 같은 권리 서류에 문제가 생겼습니다. | RE05 매매·권리 서류 |
| (직접 입력) | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 | RE06 재구성 또는 전문가 |

## RE06 재구성 또는 전문가
- 직접 입력 내용을 키워드로 RE01~05에 재배정(Admin MASTER CASE_06 방식). 소송 진행 중·형사 문제·다수 당사자 분쟁 등은 "VFBCAI 전문가팀 진행" 안내.

## 1차 마지막 간단 자료(공용) 예시 칩
계약서 / 계약금·보증금 송금 내역 / 상대방 메시지 캡처 / 통지서 / 집 사진 / 상황 메모



---

---

# RE01 계약 전 검토 — Content Pack

- 사건: 고객이 베트남에서 집·아파트·사무실을 빌리거나 사기 직전이며, 서명·송금 전에 계약서나 조건이 괜찮은지 확인하고 싶은 상황
- Q1(공용, 확정): "집을 빌리거나 사기 전이라, 계약서나 조건이 괜찮은지 먼저 확인하고 싶습니다."
- 질문 id 접두사: `re01_` / 선택지 value는 질문별 고유 접두사(ct_, st_, od_ …)를 붙여 전체에서 중복 없음
- 엔진 공용 선택지 "위에 내용이 없거나 설명이 필요합니다 → 직접 입력"은 각 single/multi 질문에 자동으로 붙으므로 아래에 적지 않음

---

## 1. 노드 표

### 1차 (Q1 + CASE 질문 4개)

#### re01_contract_type
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 앞두고 있는 계약은 어떤 계약인가요?
- 선택지:
  - `r1_ct_lease_home` — 살 집(아파트·주택)을 빌리려고 하고, 집주인과 임대차 계약을 앞두고 있습니다.
  - `r1_ct_lease_office` — 사무실이나 상가를 빌리려고 하고, 회사 주소나 영업 장소로 쓸 계획입니다.
  - `r1_ct_purchase_project` — 분양 중인 아파트를 사려고 하고, 개발사(분양사)와 계약을 앞두고 있습니다.
  - `r1_ct_purchase_resale` — 이미 지어진 집이나 아파트를 개인 소유자에게서 사려고 합니다.
  - `r1_ct_deposit_only` — 본계약을 하기 전에, 계약금 약정서(đặt cọc)만 먼저 쓰자는 제안을 받았습니다.

#### re01_progress_stage
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 계약은 지금 어디까지 진행되었나요?
- 선택지:
  - `r1_st_viewing` — 집을 보고 조건만 들었고, 계약서나 서류는 아직 받지 못했습니다.
  - `r1_st_draft` — 계약서 초안을 받았고, 아직 서명이나 송금은 하지 않았습니다.
  - `r1_st_deposit_requested` — 계약서에 서명하기 전에, 계약금부터 먼저 보내라는 요청을 받았습니다.
  - `r1_st_deposit_paid` — 계약금은 이미 보냈고, 본계약 서명이나 잔금 지급을 앞두고 있습니다.
  - `r1_st_sign_scheduled` — 서명 날짜가 정해졌고, 그 전에 계약서를 확인받고 싶습니다.

#### re01_owner_doc_check
- phase: 1 / kind: single / show_if: 항상
- 질문: 계약 상대방이 실제 소유자인지는 어떻게 확인하셨나요?
- 선택지:
  - `r1_od_original_match` — 토지사용권 증서(핑크북) 원본을 직접 봤고, 소유자 이름이 계약 상대방과 같습니다.
  - `r1_od_copy_only` — 핑크북 사본이나 사진만 받았고, 원본은 아직 보지 못했습니다.
  - `r1_od_signer_differs` — 핑크북은 봤지만, 소유자와 계약서에 서명할 사람이 다릅니다.
  - `r1_od_refused_delay` — 핑크북을 보여 달라고 했지만, 계속 미루거나 보여 줄 수 없다고 합니다.
  - `r1_od_project_no_book` — 분양 아파트라 핑크북은 아직 없고, 개발사 계약서와 사업 관련 서류만 받았습니다.

#### re01_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `r1_cg_owner_authority` — 계약 상대방이 진짜 소유자인지, 서명할 권한이 있는 사람인지 먼저 확인하고 싶습니다.
  - `r1_cg_contract_terms` — 계약서에 제게 불리한 조항이나 빠진 조항이 없는지 확인하고 싶습니다.
  - `r1_cg_money_safety` — 계약금이나 보증금을 보내도 안전한지, 돌려받을 수 있는 조건인지 확인하고 싶습니다.
  - `r1_cg_foreigner_fit` — 외국인인 제가 이 계약을 하고, 소유나 거주 신고까지 할 수 있는지 확인하고 싶습니다.
  - `r1_cg_order_unsure` — 상황이 복잡해서, 서명 전에 무엇부터 확인해야 하는지 순서를 알고 싶습니다.

---

### 2차 (전체 23노드, 조건부 후속 포함)

#### re01_info_channel
- phase: 2 / kind: single / show_if: 항상
- 질문: 계약 조건이나 계약서는 누구를 통해 받으셨나요?
- 선택지:
  - `r1_ic_owner_direct` — 집주인(소유자)에게 직접 조건을 들었고, 계약서도 직접 받았습니다.
  - `r1_ic_broker_relay` — 중개인이 집주인 대신 조건을 전달했고, 계약서도 중개인을 통해 받았습니다.
  - `r1_ic_developer_sales` — 개발사 영업 담당자나 분양 대행사에게 조건과 계약서를 안내받았습니다.
  - `r1_ic_acquaintance` — 지인이나 회사 동료의 소개로, 비공식적으로 조건을 전해 들었습니다.
  - `r1_ic_online_only` — 온라인 광고나 SNS 글을 보고 연락했고, 상대방과는 메시지로만 이야기했습니다.

#### re01_broker_role
- phase: 2 / kind: single / show_if: `re01_info_channel = r1_ic_broker_relay|r1_ic_acquaintance` 또는 `re01_transfer_account = r1_ta_broker_account`
- 질문: 이 계약에서 중개인은 어떤 역할을 하고 있나요?
- 선택지:
  - `r1_br_licensed_written` — 중개회사 소속 중개인이고, 수수료와 역할이 서면으로 정해져 있습니다.
  - `r1_br_individual_verbal` — 개인 중개인이고, 수수료와 역할은 말로만 정했습니다.
  - `r1_br_both_sides` — 같은 중개인이 집주인 쪽과 제 쪽 일을 함께 맡고 있습니다.
  - `r1_br_collects_money` — 중개인이 계약금이나 보증금을 소유자 대신 받겠다고 합니다.
  - `r1_br_fee_unclear` — 중개 수수료를 누가, 언제, 얼마 내는지 아직 정해지지 않았습니다.

#### re01_owner_authority
- phase: 2 / kind: single / show_if: `re01_owner_doc_check = r1_od_signer_differs`
- 질문: 소유자가 아닌 사람이 서명한다면, 그 사람의 권한은 어떻게 확인하셨나요?
- 선택지:
  - `r1_oa_notarized_poa` — 공증받은 위임장을 보여 주었고, 위임 범위에 계약 서명과 돈을 받는 일이 포함되어 있습니다.
  - `r1_oa_poa_unseen` — 위임장이 있다고 말로만 들었고, 실제 위임장은 보지 못했습니다.
  - `r1_oa_co_owner_one` — 핑크북에 부부 등 여러 명이 적혀 있는데, 그중 한 사람만 서명한다고 합니다.
  - `r1_oa_relative_no_doc` — 소유자의 가족이 대신 서명한다고 하며, 위임장 이야기는 없었습니다.
  - `r1_oa_company_rep` — 소유자가 회사이고, 대표자가 아닌 직원이 서명한다고 합니다.

#### re01_contract_form
- phase: 2 / kind: single / show_if: 항상
- 질문: 계약서는 어떤 언어로 되어 있고, 공증은 어떻게 하기로 했나요?
- 선택지:
  - `r1_cf_bilingual_notary` — 베트남어와 영어(또는 한국어)가 함께 적힌 계약서이고, 공증사무소에서 공증하기로 했습니다.
  - `r1_cf_bilingual_no_notary` — 두 언어가 함께 적힌 계약서이지만, 공증 없이 서명만 하자고 합니다.
  - `r1_cf_vi_only` — 베트남어로만 된 계약서이고, 공증을 할지는 아직 정해지지 않았습니다.
  - `r1_cf_unofficial_translation` — 중개인이 만든 한국어 번역본만 받았고, 베트남어 원문과 같은지 확인하지 못했습니다.
  - `r1_cf_no_draft` — 아직 계약서 초안을 받지 못했고, 말이나 메시지로 조건만 들었습니다.

#### re01_language_gap
- phase: 2 / kind: single / show_if: `re01_contract_form = r1_cf_vi_only|r1_cf_unofficial_translation`
- 질문: 계약서 내용 중 이해하기 가장 어려운 부분은 무엇인가요?
- 선택지:
  - `r1_lg_penalty_terms` — 계약금 몰수나 위약금 등, 계약을 깰 때 적용되는 조항을 이해하지 못했습니다.
  - `r1_lg_termination` — 중도 해지나 갱신 조건이 어떻게 적혀 있는지 알 수 없습니다.
  - `r1_lg_money_schedule` — 금액과 지급 일정이 제가 들은 내용과 같은지 확인하지 못했습니다.
  - `r1_lg_cost_burden` — 관리비·수리비·세금을 누가 부담하는지 적힌 부분을 이해하지 못했습니다.
  - `r1_lg_version_priority` — 번역본과 원문이 다를 때 어느 쪽을 따르는지 적혀 있는지 모릅니다.

#### re01_condition_compare
- phase: 2 / kind: single / show_if: `re01_contract_form = r1_cf_bilingual_notary|r1_cf_bilingual_no_notary|r1_cf_unofficial_translation`
- 질문: 계약서 내용은 처음 안내받은 조건과 비교하면 어떤가요?
- 선택지:
  - `r1_cc_same` — 금액·기간·포함 항목 등이 처음 안내받은 조건과 거의 같습니다.
  - `r1_cc_amount_diff` — 월세·보증금·매매대금 등 금액이 처음 들은 것과 다르게 적혀 있습니다.
  - `r1_cc_scope_diff` — 가구·관리비·주차 등 포함된다고 들은 항목이 빠져 있거나 다르게 적혀 있습니다.
  - `r1_cc_unit_diff` — 호수·면적·층 등 물건 정보가 제가 직접 본 곳과 다르게 적혀 있습니다.
  - `r1_cc_cannot_compare` — 처음 조건을 말로만 들어서, 계약서와 무엇을 비교해야 할지 정리되지 않았습니다.

#### re01_compare_detail
- phase: 2 / kind: text / show_if: `re01_condition_compare = r1_cc_amount_diff|r1_cc_scope_diff|r1_cc_unit_diff`
- 질문: 처음 들은 조건과 계약서에 적힌 내용이 어떻게 다른지 적어 주세요.
- placeholder: 예) 중개인은 월세 1,800만 동에 관리비 포함이라고 했는데, 계약서에는 월세 2,000만 동, 관리비 별도로 적혀 있습니다.

#### re01_counterparty_reaction
- phase: 2 / kind: single / show_if: `re01_condition_compare = r1_cc_amount_diff|r1_cc_scope_diff|r1_cc_unit_diff`
- 질문: 다른 부분을 상대방이나 중개인에게 말했을 때, 어떤 반응이었나요?
- 선택지:
  - `r1_cr_agreed_fix` — 계약서를 고쳐 주겠다고 했고, 수정본을 받기로 했습니다.
  - `r1_cr_verbal_promise` — 말로는 맞춰 주겠다고 했지만, 계약서는 그대로 두고 서명하자고 합니다.
  - `r1_cr_refused` — 수정은 어렵다며, 그대로 서명하거나 계약을 포기하라고 했습니다.
  - `r1_cr_no_reply` — 다른 부분을 말했지만, 아직 답을 받지 못했습니다.
  - `r1_cr_not_raised` — 아직 상대방에게 다른 부분을 말하지 않았습니다.

#### re01_deposit_months
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_lease_home|r1_ct_lease_office`
- 질문: 보증금과 월세 지급 조건은 어떻게 안내받으셨나요?
- 선택지:
  - `r1_dm_one_month` — 보증금은 월세 1개월분이고, 계약서에 금액과 돌려받는 시점이 적혀 있습니다.
  - `r1_dm_two_months` — 보증금은 월세 2개월분이고, 나갈 때 돌려준다는 말을 들었습니다.
  - `r1_dm_three_plus` — 보증금이 월세 3개월분 이상이거나, 월세를 여러 달치 미리 내라고 합니다.
  - `r1_dm_return_unclear` — 보증금 금액은 정해졌지만, 언제 어떤 조건으로 돌려주는지는 정해지지 않았습니다.
  - `r1_dm_not_settled` — 보증금 금액과 월세 지급 방식은 아직 협의하고 있습니다.

#### re01_payment_schedule
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_purchase_project|r1_ct_purchase_resale`
- 질문: 매매대금은 어떤 순서로 지급하기로 했나요?
- 선택지:
  - `r1_ps_staged_written` — 계약금·중도금·잔금의 단계와 날짜가 계약서나 개발사 일정표에 적혀 있습니다.
  - `r1_ps_deposit_only_fixed` — 계약금 금액만 정해졌고, 중도금과 잔금 일정은 아직 정하지 않았습니다.
  - `r1_ps_lump_sum_first` — 명의 이전이나 핑크북 발급 전에, 대금 대부분이나 전액을 먼저 보내라고 합니다.
  - `r1_ps_mortgage_payoff` — 잔금 일부로 소유자의 은행 대출을 갚고 담보를 풀겠다고 합니다.
  - `r1_ps_price_split` — 계약서에 적는 금액과 실제로 주고받는 금액을 다르게 하자는 제안을 받았습니다.

#### re01_deposit_link
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_deposit_only`
- 질문: 이 계약금 약정은 어떤 본계약으로 이어지기로 했나요?
- 선택지:
  - `r1_dl_lease_fixed_date` — 임대차 본계약으로 이어지고, 본계약 서명 날짜도 정해져 있습니다.
  - `r1_dl_purchase_fixed_date` — 매매 본계약으로 이어지고, 본계약을 공증할 날짜도 정해져 있습니다.
  - `r1_dl_no_date` — 본계약을 한다는 말만 있고, 언제 하는지는 정해지지 않았습니다.
  - `r1_dl_terms_open` — 계약금만 먼저 걸고, 금액이나 세부 조건은 나중에 정하자고 합니다.

#### re01_amount_detail
- phase: 2 / kind: text / show_if: `re01_deposit_months = r1_dm_one_month|r1_dm_two_months|r1_dm_three_plus|r1_dm_return_unclear` 또는 `re01_payment_schedule` 응답 시 또는 `re01_deposit_link` 응답 시
- 질문: 안내받은 금액(월세·보증금·매매대금·계약금)을 적어 주세요.
- placeholder: 예) 매매대금 45억 동, 계약금 4억 5천만 동(10%), 잔금은 공증일에 지급

#### re01_transfer_account
- phase: 2 / kind: single / show_if: `re01_progress_stage = r1_st_deposit_requested|r1_st_deposit_paid` 또는 `re01_contract_type = r1_ct_deposit_only`
- 질문: 계약금이나 보증금은 누구 명의의 계좌로 보내라고 했나요?
- 선택지:
  - `r1_ta_owner_account` — 핑크북에 적힌 소유자(분양이면 개발사) 본인 명의 계좌로 보내라고 했습니다.
  - `r1_ta_broker_account` — 중개인이나 중개회사 명의 계좌로 보내라고 했습니다.
  - `r1_ta_third_party` — 소유자의 가족이나 다른 사람 명의 계좌로 보내라고 했고, 그 이유는 듣지 못했습니다.
  - `r1_ta_cash` — 현금으로 직접 달라고 했고, 영수증을 써 줄지는 확실하지 않습니다.
  - `r1_ta_not_told` — 돈을 보내라는 말은 들었지만, 어느 계좌로 보내는지는 아직 안내받지 못했습니다.

#### re01_deposit_paid_proof
- phase: 2 / kind: single / show_if: `re01_progress_stage = r1_st_deposit_paid`
- 질문: 이미 보낸 계약금에 대해, 받았다는 확인은 어떻게 남아 있나요?
- 선택지:
  - `r1_dp_signed_receipt` — 송금했고, 상대방이 서명한 계약금 영수증이나 약정서를 받았습니다.
  - `r1_dp_transfer_only` — 송금 내역은 있지만, 상대방이 서명한 영수증이나 약정서는 받지 못했습니다.
  - `r1_dp_cash_no_receipt` — 현금으로 건넸고, 받았다는 서면 확인은 받지 못했습니다.
  - `r1_dp_via_broker` — 중개인에게 건넸고, 소유자에게 전달되었는지는 확인하지 못했습니다.

#### re01_penalty_clause
- phase: 2 / kind: single / show_if: `re01_progress_stage = r1_st_deposit_requested|r1_st_deposit_paid|r1_st_sign_scheduled` 또는 `re01_contract_type = r1_ct_deposit_only`
- 질문: 계약을 깨는 경우 계약금을 어떻게 처리한다고 되어 있나요?
- 선택지:
  - `r1_pc_mutual_written` — 제가 포기하면 계약금을 잃고, 상대방이 어기면 배액을 돌려준다고 서면에 적혀 있습니다.
  - `r1_pc_one_sided` — 제가 포기하면 계약금을 잃는다는 내용만 있고, 상대방이 어기는 경우는 적혀 있지 않습니다.
  - `r1_pc_conditional_refund` — 대출 거절이나 서류 문제 등 특정한 경우에는 계약금을 돌려준다는 조건이 적혀 있습니다.
  - `r1_pc_verbal_only` — 몰수나 배액 반환에 대해 말로만 들었고, 서면에는 적혀 있지 않습니다.
  - `r1_pc_not_checked` — 위약 조항이 있는지, 있다면 무슨 뜻인지 아직 확인하지 못했습니다.

#### re01_residence_registration
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_lease_home`
- 질문: 입주 후 공안에 하는 임시거주 신고는 어떻게 하기로 했나요?
- 선택지:
  - `r1_rr_owner_will_do` — 집주인이 입주 후 임시거주 신고를 해 주기로 했고, 계약서에도 적혀 있습니다.
  - `r1_rr_verbal_only` — 집주인이 신고해 준다고 말했지만, 계약서에는 적혀 있지 않습니다.
  - `r1_rr_tenant_self` — 신고는 제가 알아서 하라고 했고, 필요한 서류는 안내받지 못했습니다.
  - `r1_rr_refused_or_fee` — 집주인이 신고를 꺼리거나, 신고해 주는 대신 추가 비용을 요구했습니다.
  - `r1_rr_not_discussed` — 임시거주 신고에 대해서는 아직 이야기해 본 적이 없습니다.

#### re01_commercial_use
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_lease_office`
- 질문: 이 공간을 회사 주소나 영업 장소로 쓰는 것은 어떻게 확인하셨나요?
- 선택지:
  - `r1_cu_registration_ok` — 회사 등록 주소로 써도 된다고 했고, 필요한 서류(핑크북 사본 등)도 주기로 했습니다.
  - `r1_cu_verbal_only` — 사업 용도로 써도 된다고 말로만 들었고, 계약서에는 용도가 적혀 있지 않습니다.
  - `r1_cu_sublease` — 건물주가 아니라, 건물을 먼저 빌린 사람에게서 다시 빌리는 구조입니다.
  - `r1_cu_use_restricted` — 주거용 건물이거나 용도 제한이 있다는 말을 들었지만, 확인하지 못했습니다.
  - `r1_cu_fitout_unclear` — 인테리어 공사와 나갈 때 원상복구 비용을 누가 부담하는지 정해지지 않았습니다.

#### re01_foreign_eligibility
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_purchase_project|r1_ct_purchase_resale` 또는 `re01_deposit_link = r1_dl_purchase_fixed_date`
- 질문: 외국인 명의로 이 집을 살 수 있는지는 어떻게 확인하셨나요?
- 선택지:
  - `r1_fe_quota_written` — 분양 프로젝트의 아파트이고, 외국인 구매 가능 물량이 남아 있다고 서면으로 안내받았습니다.
  - `r1_fe_quota_verbal` — 외국인도 살 수 있다고 말로만 들었고, 물량이나 프로젝트 조건은 확인하지 못했습니다.
  - `r1_fe_landed_house` — 프로젝트 밖의 개인 주택(토지가 딸린 집)이고, 외국인 명의가 가능한지 확인하지 못했습니다.
  - `r1_fe_nominee_name` — 베트남인 지인이나 중개인 명의를 빌려서 사 두자는 제안을 받았습니다.
  - `r1_fe_term_unknown` — 살 수는 있다고 들었지만, 외국인 소유 기간(50년 등)과 연장 조건은 설명받지 못했습니다.

#### re01_sign_deadline
- phase: 2 / kind: single / show_if: 항상
- 질문: 서명이나 송금은 언제까지 결정해야 한다고 들으셨나요?
- 선택지:
  - `r1_sd_date_fixed` — 서명(또는 송금) 날짜가 정해져 있고, 정확한 날짜를 알고 있습니다.
  - `r1_sd_pressure_days` — '며칠 안에 결정하지 않으면 다른 사람에게 넘긴다'는 말을 들었습니다.
  - `r1_sd_move_in_driven` — 입주나 개업 날짜에 맞춰야 해서, 제 쪽 일정이 급합니다.
  - `r1_sd_no_deadline` — 정해진 기한은 없고, 제가 결정하는 대로 진행하면 된다고 합니다.
  - `r1_sd_passed` — 약속한 날짜가 이미 지났고, 상대방이 계속 진행할지 확실하지 않습니다.

#### re01_sign_date
- phase: 2 / kind: text / show_if: `re01_sign_deadline = r1_sd_date_fixed|r1_sd_pressure_days|r1_sd_move_in_driven`
- 질문: 서명하거나 돈을 보내기로 한 날짜는 언제인가요?
- placeholder: 예) 10월 15일 오전 공증사무소에서 서명, 계약금은 서명 당일 송금

#### re01_evidence
- phase: 2 / kind: multi / show_if: `re01_progress_stage = r1_st_draft|r1_st_deposit_paid|r1_st_sign_scheduled`
- 질문: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `r1_ev_contract_draft` — 계약서 초안이나 수정본(파일·사진 포함)
  - `r1_ev_owner_docs` — 핑크북, 상대방 신분증, 위임장의 사본이나 사진
  - `r1_ev_payment_record` — 송금 내역이나 계약금 영수증
  - `r1_ev_messages` — 중개인·상대방과 주고받은 메시지(Zalo·카카오톡 등)
  - `r1_ev_none` — 보관 중인 자료가 없거나, 아직 정리하지 못했습니다.

#### re01_blockage
- phase: 2 / kind: single / show_if: 항상
- 질문: 현재 이 계약을 진행하지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `r1_bl_owner_unverified` — 상대방이 진짜 소유자이거나 권한이 있는 사람인지 확신이 없어, 서명을 미루고 있습니다.
  - `r1_bl_contract_unreadable` — 계약서를 제대로 이해하지 못해, 불리한 조항이 있는지 판단하지 못하고 있습니다.
  - `r1_bl_money_risk` — 돈을 먼저 보내라고 하는데, 돌려받지 못할까 봐 송금을 망설이고 있습니다.
  - `r1_bl_eligibility_unclear` — 외국인인 제가 이 계약으로 소유하거나 거주 신고를 할 수 있는지 몰라 멈춰 있습니다.
  - `r1_bl_time_pressure` — 결정할 시간이 짧아, 무엇부터 확인해야 할지 정리하지 못하고 있습니다.

#### re01_final_goal
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 검토를 통해 이 계약을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `r1_fg_sign_safely` — 확인할 것을 모두 확인한 뒤, 문제가 없으면 그대로 서명하고 싶습니다.
  - `r1_fg_revise_then_sign` — 불리하거나 빠진 조항을 고친 뒤에 서명하고 싶습니다.
  - `r1_fg_protect_deposit` — 이미 보냈거나 앞으로 보낼 계약금을 지킬 수 있는 방법을 정리하고 싶습니다.
  - `r1_fg_withdraw_safely` — 위험이 크다면, 손해를 줄이면서 계약을 하지 않는 쪽으로 정리하고 싶습니다.
  - `r1_fg_expert_handle` — 계약서 검토와 상대방과의 협의를 전문가에게 맡기고 싶습니다.

---

## 2. 결과 신호

### 판정 규칙
- 선택된 신호 중 가장 높은 단계를 최종 판정으로 한다.
- "주의" 신호가 3개 이상이면 "전문가 권장"으로 올린다.
- 신호가 하나도 없으면 "확인 필요"(기본 점검 안내)로 표시한다.

### 전문가 권장
| 선택지 | 결과 화면 위험 문장 |
|---|---|
| `r1_od_refused_delay` | 핑크북 원본을 보여 주지 않는 상대방과는 소유 여부가 확인되기 전까지 서명이나 송금을 멈추는 것이 안전합니다. |
| `r1_oa_poa_unseen` | 위임장을 직접 보지 못한 대리인의 서명은 소유자가 계약을 인정하지 않을 위험이 있어, 공증된 위임장부터 확인해야 합니다. |
| `r1_oa_relative_no_doc` | 가족이라도 위임장 없이 서명하면 소유자 본인에게 계약 효력을 주장하기 어려울 수 있습니다. |
| `r1_oa_co_owner_one` | 핑크북에 적힌 공동 소유자 중 한 명만 서명하면, 나머지 소유자가 계약에 동의하지 않을 위험이 있습니다. |
| `r1_ta_third_party` | 소유자가 아닌 사람 명의 계좌로 돈을 보내면, 분쟁이 생겼을 때 소유자에게 지급했다고 증명하기 어려울 수 있습니다. |
| `r1_ta_cash` / `r1_dp_cash_no_receipt` | 서면 확인 없는 현금 지급은 나중에 계약금을 주었다는 사실 자체를 증명하기 어려울 수 있습니다. |
| `r1_br_collects_money` / `r1_dp_via_broker` | 중개인이 대신 받은 돈이 소유자에게 전달되었는지 확인되지 않으면, 계약금 반환을 요구할 상대가 불분명해질 수 있습니다. |
| `r1_ps_price_split` | 계약서 금액과 실제 금액을 다르게 적으면 세금 문제와 분쟁 시 금액 다툼으로 이어질 수 있어, 서명 전에 검토가 필요합니다. |
| `r1_ps_lump_sum_first` | 명의 이전 전에 대금 대부분을 먼저 보내면, 이전이 지연되거나 무산될 때 돌려받기 어려울 수 있습니다. |
| `r1_fe_nominee_name` | 다른 사람 명의를 빌려 사는 방식은 그 사람이 소유권을 주장할 경우 보호받기 어려울 수 있습니다. |
| `r1_fe_landed_house` | 프로젝트 밖의 개인 주택은 외국인 명의 소유가 제한될 수 있어, 계약 전에 소유 가능 여부부터 확인해야 합니다. |
| `r1_cu_sublease` | 다시 빌리는 구조에서는 원래 임대차가 끝나면 함께 나가야 할 수 있어, 건물주 동의 여부를 먼저 확인해야 합니다. |

### 주의
| 선택지 | 결과 화면 위험 문장 |
|---|---|
| `r1_od_copy_only` | 핑크북 사본만으로는 최근 변동 사항이나 위조 여부를 확인할 수 없어, 서명 전에 원본 대조가 필요합니다. |
| `r1_od_signer_differs` | 소유자와 서명할 사람이 다르므로, 서명할 사람의 권한을 증명하는 서류를 먼저 받아야 합니다. |
| `r1_od_project_no_book` | 분양 아파트는 개발사가 이 프로젝트를 팔 수 있는 조건을 갖췄는지 사업 서류로 먼저 확인해야 합니다. |
| `r1_cf_vi_only` / `r1_cf_unofficial_translation` | 이해하지 못한 언어로 된 계약서에 서명하면, 불리한 조항을 모른 채 계약하게 될 수 있습니다. |
| `r1_cf_bilingual_no_notary` + `r1_ct_purchase_resale` | 개인 간 주택 매매는 일반적으로 공증을 거쳐야 명의 이전을 진행할 수 있어, 공증 없이 서명하는 이유를 확인해야 합니다. |
| `r1_cf_no_draft` + `r1_st_deposit_requested` | 계약서 없이 계약금부터 보내면, 어떤 조건으로 돈을 보냈는지 증명하기 어려울 수 있습니다. |
| `r1_pc_one_sided` | 위약 조항이 한쪽에만 적용되어 있어, 상대방이 계약을 깨는 경우의 배액 반환 조항을 추가로 확인해야 합니다. |
| `r1_pc_verbal_only` / `r1_pc_not_checked` | 계약금 몰수나 배액 반환 조건이 서면으로 확인되지 않아, 계약을 깰 때 기준이 불분명합니다. |
| `r1_ta_broker_account` | 중개인 계좌로 보내는 경우, 소유자가 그 수령을 인정한다는 서면 확인이 함께 필요합니다. |
| `r1_dp_transfer_only` | 송금 내역만 있고 서명된 영수증이 없어, 그 돈이 계약금이라는 점을 따로 확인받아 두는 것이 좋습니다. |
| `r1_dm_three_plus` / `r1_dm_return_unclear` | 보증금 규모나 반환 조건이 불분명하면, 나갈 때 보증금 반환을 두고 다툼이 생길 수 있습니다. |
| `r1_ps_mortgage_payoff` | 은행 담보가 남아 있는 집은 담보 해제 순서와 시점이 계약서에 적혀 있어야 안전합니다. |
| `r1_rr_refused_or_fee` | 임시거주 신고가 되지 않으면 비자·체류 관련 절차에 영향을 줄 수 있어, 신고 책임을 계약서에 적어 두는 것이 좋습니다. |
| `r1_cu_use_restricted` | 용도 제한이 있는 공간은 회사 주소 등록이나 영업이 어려울 수 있어, 계약 전에 용도를 확인해야 합니다. |
| `r1_fe_quota_verbal` | 외국인 구매 가능 물량은 건물마다 한도가 있어, 말로 들은 내용만으로는 명의 등록이 가능한지 알기 어렵습니다. |
| `r1_cc_amount_diff` / `r1_cc_unit_diff` | 계약서의 금액이나 물건 정보가 들은 내용과 달라, 서명 전에 수정 여부를 확인해야 합니다. |
| `r1_cr_verbal_promise` / `r1_cr_refused` | 다른 부분을 계약서에 반영하지 않으면, 나중에 말로 한 약속을 주장하기 어려울 수 있습니다. |
| `r1_br_both_sides` | 중개인이 양쪽 일을 함께 맡고 있어, 중요한 조건은 상대방에게 직접 서면으로 확인받는 것이 좋습니다. |
| `r1_dl_terms_open` | 조건이 정해지지 않은 상태에서 계약금을 걸면, 이후 조건이 맞지 않을 때 계약금 처리를 두고 다툼이 생길 수 있습니다. |
| `r1_sd_pressure_days` | 짧은 기한으로 결정을 재촉받고 있어, 핵심 확인 항목을 먼저 정해 두고 진행하는 것이 좋습니다. |

### 확인 필요
| 선택지 | 결과 화면 위험 문장 |
|---|---|
| `r1_rr_verbal_only` / `r1_rr_tenant_self` / `r1_rr_not_discussed` | 임시거주 신고를 누가 언제 하는지 계약서에 적어 두면, 입주 후 혼선을 줄일 수 있습니다. |
| `r1_cu_verbal_only` / `r1_cu_fitout_unclear` | 사용 용도와 공사·원상복구 비용 부담을 계약서에 적어 두는 것이 좋습니다. |
| `r1_fe_term_unknown` | 외국인 소유 기간과 연장 조건을 서명 전에 확인해 두는 것이 좋습니다. |
| `r1_ps_deposit_only_fixed` / `r1_dl_no_date` | 중도금·잔금이나 본계약 날짜가 정해지지 않아, 일정이 미뤄질 때의 처리 기준을 함께 정해 두는 것이 좋습니다. |
| `r1_dm_not_settled` / `r1_ta_not_told` | 금액과 송금 계좌가 확정되면, 소유자 명의와 일치하는지 다시 확인해야 합니다. |
| `r1_br_individual_verbal` / `r1_br_fee_unclear` | 중개 수수료와 중개인의 역할을 서면으로 정해 두면 이후 다툼을 줄일 수 있습니다. |
| `lg_*` (언어 이해 어려움 항목) | 이해하지 못한 조항은 서명 전에 번역과 함께 의미를 확인받아야 합니다. |
| `r1_cc_scope_diff` | 포함된다고 들은 항목이 계약서에 빠져 있어, 목록으로 추가하는 것이 좋습니다. |
| `r1_sd_passed` | 약속한 날짜가 지났으므로, 상대방이 계속 진행할 의사가 있는지와 계약금 처리를 먼저 확인해야 합니다. |

### 특수 사건 (퍼널 대신 "VFBCAI 전문가팀 진행" 안내로 표시)
- 계약금을 보낸 뒤 상대방과 연락이 끊겼거나, 사기로 의심해 공안 신고를 이미 했거나 하려는 경우
- 같은 물건을 두고 이미 소송이나 분쟁이 진행 중이라고 들은 경우
- 공동 상속인 등 소유자가 여러 명이고 그중 일부와 연락이 되지 않는 경우
- 법인이 여러 건물·여러 호실을 한꺼번에 빌리거나 사는 경우
- 판단: 직접 입력 텍스트에 위 내용이 있거나, `r1_sd_passed` + `r1_dp_cash_no_receipt|r1_dp_via_broker` 조합일 때 전문가팀 안내 배너를 함께 표시

---

## 3. 1차 결과 "핵심 확인 결과" 3칸 문장 규칙

| 칸 | 조합 기준 | 문장 규칙 | 예시 |
|---|---|---|---|
| 상황 | `re01_contract_type` + `re01_progress_stage` | "[계약 종류]를 앞두고 있고, 현재 [진행 단계] 상태입니다." 한 문장 | 살 집을 빌리는 임대차 계약을 앞두고 있고, 계약서 초안을 받은 뒤 아직 서명이나 송금은 하지 않은 상태입니다. |
| 확인 목표 | `re01_confirm_goal` + `re01_owner_doc_check` | "[우선 확인 목표]를 먼저 확인해야 하며, 소유자 확인은 [확인 상태]입니다." 한 문장 | 계약서에 불리한 조항이 없는지 먼저 확인해야 하며, 소유자 확인은 핑크북 사본만 받은 상태라 원본 대조가 남아 있습니다. |
| 대응·자료 | `re01_owner_doc_check` + `re01_progress_stage` | "서명이나 송금 전에 [다음 행동]이 필요하고, [준비할 자료]를 준비해 두세요." 한 문장 | 서명 전에 핑크북 원본과 집주인 신분증을 대조하는 것이 필요하고, 계약서 초안과 중개인 메시지를 함께 준비해 두세요. |

- 단계별 "다음 행동" 문구: `r1_st_viewing` → 계약서 초안을 서면으로 받는 것 / `r1_st_draft`·`r1_st_sign_scheduled` → 조항 검토와 소유자 원본 대조 / `r1_st_deposit_requested` → 송금 전에 계좌 명의와 위약 조항 확인 / `r1_st_deposit_paid` → 계약금 영수증 확보와 본계약 조건 확정
- 법적 결과는 단정하지 않고 "~할 수 있습니다 / ~확인이 필요합니다"로 끝낸다.

---

## 4. "지금 확인해 보세요" STEP 3개

1. **소유자와 서명 권한 확인** — 핑크북 원본의 소유자 이름·주소·변동 사항 페이지를 상대방 신분증과 대조하고, 대리인이 서명한다면 공증된 위임장의 위임 범위를 확인하세요. (분양이면 개발사의 사업 서류와 외국인 구매 가능 물량을 서면으로 받으세요.)
2. **돈을 보내기 전 조건 확인** — 송금 계좌가 소유자(또는 개발사) 본인 명의인지 확인하고, 계약금 몰수와 배액 반환이 양쪽 모두에게 적용된다는 문구와 서명된 영수증을 받을 수 있는지 확인하세요.
3. **서명 전 계약서 마무리** — 계약서를 이해할 수 있는 언어로 받고 어느 언어를 우선하는지 적어 두며, 공증 여부와 함께 [임대: 임시거주 신고 책임 / 상가·사무실: 사용 용도와 회사 주소 등록 / 매매: 명의 이전 일정과 담보 해제 순서]를 계약서에 넣어 두세요.


---

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
  - `r2_role_tenant` — 집을 빌려 살았던 세입자이고, 집주인에게 보증금을 맡겨 두었습니다.
  - `r2_role_company_occupant` — 계약은 회사 명의로 했고, 저는 그 집에 실제로 살았던 사람입니다.
  - `r2_role_landlord` — 집을 빌려준 집주인이고, 세입자에게 보증금을 받아 보관하고 있었습니다.
  - `r2_role_buyer` — 집을 사려던 매수인이고, 매도인에게 계약금(đặt cọc)을 보냈습니다.
  - `r2_role_seller` — 집을 팔려던 매도인이고, 매수인에게 계약금(đặt cọc)을 받았습니다.

#### re02_dispute_type
- phase: 1 / kind: single / show_if: `re02_role = r2_role_tenant|r2_role_company_occupant|r2_role_buyer`
- 질문: 돈 문제는 지금 어떤 상황인가요?
- 선택지:
  - `r2_dt_not_returned` — 계약이 끝났거나 끝내기로 했는데, 맡긴 보증금이나 계약금을 아직 전혀 돌려받지 못했습니다.
  - `r2_dt_partial_deduction` — 일부는 돌려받았지만, 수리비·청소비 등을 이유로 상당한 금액이 공제되었습니다.
  - `r2_dt_deposit_forfeited` — 계약이 진행되지 않자, 상대방이 계약금을 모두 가져가겠다고 하고 있습니다.
  - `r2_dt_extra_claim` — 돌려받기는커녕, 위약금이나 추가 금액을 더 내라는 요구를 받고 있습니다.
  - `r2_dt_contact_avoided` — 돌려주겠다는 말은 들었지만, 그 뒤로 상대방이 연락을 피하거나 답이 없습니다.

#### re02_dispute_type_holder
- phase: 1 / kind: single / show_if: `re02_role = r2_role_landlord|r2_role_seller`
- 질문: 상대방과는 어떤 돈 문제로 다투고 있나요?
- 선택지:
  - `r2_hd_deduct_dispute` — 손상이나 밀린 금액을 공제하고 돌려주려 했는데, 상대방은 전액을 돌려달라고 요구하고 있습니다.
  - `r2_hd_forfeit_dispute` — 상대방이 계약을 포기해 계약금을 돌려주지 않으려 하는데, 상대방은 돌려달라고 요구하고 있습니다.
  - `r2_hd_double_demand` — 제 사정으로 계약을 진행하지 못하게 되자, 상대방이 계약금의 두 배를 돌려달라고 요구하고 있습니다.
  - `r2_hd_extra_claim` — 손해나 밀린 금액이 보증금보다 커서 차액을 요구했지만, 상대방이 지급하지 않고 있습니다.
  - `r2_hd_contact_lost` — 상대방이 밀린 금액을 남긴 채 집을 비웠거나, 연락을 끊었습니다.

#### re02_contract_end
- phase: 1 / kind: single / show_if: 항상
- 질문: 계약은 어떻게 끝났나요?
- 선택지:
  - `r2_end_expired` — 계약서에 정한 기간(임대 기간이나 본계약 체결 기한)이 지나, 계약이 그대로 종료되었습니다.
  - `r2_end_me_with_notice` — 제가 먼저 계약을 끝냈고, 계약서에 정한 기간만큼 미리 알렸습니다.
  - `r2_end_me_short_notice` — 제가 먼저 계약을 끝냈지만, 미리 알린 기간이 계약서보다 짧았거나 따로 알리지 못했습니다.
  - `r2_end_other_first` — 상대방이 먼저 계약을 끝내자고 했거나, 상대방이 계약을 지키지 않아 끝나게 되었습니다.
  - `r2_end_not_ended` — 계약은 아직 끝나지 않았지만, 돈 문제로 이미 다툼이 생겼습니다.

#### re02_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `r2_cg_entitlement` — 이 돈을 돌려받을 수 있는지(또는 돌려주어야 하는지), 계약서와 실제 사정을 기준으로 확인하고 싶습니다.
  - `r2_cg_amount_check` — 공제되거나 요구받은 금액이 어떻게 계산되었는지, 그 금액이 맞는지 확인하고 싶습니다.
  - `r2_cg_forfeit_rule` — 계약금을 돌려주지 않거나 두 배로 돌려달라는 주장이 계약서 조항에 맞는지 확인하고 싶습니다.
  - `r2_cg_how_to_demand` — 상대방에게 언제, 어떤 방법으로 정식 요구를 해야 하는지 확인하고 싶습니다.
  - `r2_cg_unsure` — 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.

---

### 2차 (phase 2) — 사실 추적

#### re02_amount_state
- phase: 2 / kind: single / show_if: 항상
- 질문: 다툼이 되는 금액은 어떻게 정리되어 있나요?
- 선택지:
  - `r2_amt_clear` — 계약서 금액과 실제로 주고받은 금액이 같고, 다툼이 되는 금액도 분명합니다.
  - `r2_amt_differs` — 금액은 알고 있지만, 제가 아는 금액과 상대방이 말하는 금액이 서로 다릅니다.
  - `r2_amt_partial_settled` — 일부는 이미 돌려받았거나 돌려주었고, 남은 금액을 두고 다투고 있습니다.
  - `r2_amt_currency_mixed` — 동(VND)과 달러 등으로 나눠 주고받아, 정확한 금액을 아직 정리하지 못했습니다.
  - `r2_amt_unknown` — 정확한 금액이 기억나지 않고, 금액을 확인할 기록도 찾지 못했습니다.

#### re02_amount_detail
- phase: 2 / kind: text / show_if: `re02_amount_state = r2_amt_clear|r2_amt_differs|r2_amt_partial_settled|r2_amt_currency_mixed`
- 질문: 주고받은 금액과 다툼이 되는 금액을 입력해 주세요.
- placeholder: 예: 보증금 2개월치 30,000,000동을 송금했고, 15,000,000동만 돌려받았습니다. 상대방은 수리비로 15,000,000동을 공제했다고 합니다.

#### re02_deduction_items
- phase: 2 / kind: multi / show_if: `re02_dispute_type = r2_dt_partial_deduction OR re02_dispute_type_holder = r2_hd_deduct_dispute`
- 질문: 공제되었거나 공제하려는 항목을 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `r2_ded_repair_restore` — 벽·바닥·가구·가전 수리비나 원래 상태로 되돌리는 비용
  - `r2_ded_cleaning_paint` — 청소비나 페인트 비용
  - `r2_ded_unpaid_charges` — 밀린 임대료·관리비·전기·수도·인터넷 요금
  - `r2_ded_early_exit` — 계약 기간 전에 집을 비운 데 따른 위약금
  - `r2_ded_no_itemization` — 항목 설명 없이 금액만 공제된(공제한) 부분

#### re02_forfeit_clause
- phase: 2 / kind: single / show_if: `re02_dispute_type = r2_dt_deposit_forfeited OR re02_dispute_type_holder = r2_hd_forfeit_dispute|r2_hd_double_demand`
- 질문: 계약서에는 계약금(đặt cọc)을 어떻게 처리한다고 적혀 있나요?
- 선택지:
  - `r2_fc_both_sides` — 계약금을 낸 쪽이 계약을 깨면 계약금을 잃고, 받은 쪽이 깨면 두 배로 돌려준다고 양쪽 모두 적혀 있습니다.
  - `r2_fc_one_side` — 한쪽이 계약을 깰 때의 처리만 적혀 있고, 반대의 경우는 적혀 있지 않습니다.
  - `r2_fc_condition_clause` — 대출이 나오지 않거나 토지사용권 증서(핑크북) 등 서류에 문제가 있으면 계약금을 돌려준다는 조건이 적혀 있습니다.
  - `r2_fc_no_clause` — 계약서는 있지만, 계약금을 어떻게 처리하는지에 대한 조항은 따로 없습니다.
  - `r2_fc_cannot_read` — 계약서가 베트남어로만 되어 있어, 그런 조항이 있는지 확인하지 못했습니다.

#### re02_extra_claim_detail
- phase: 2 / kind: single / show_if: `re02_dispute_type = r2_dt_extra_claim OR re02_dispute_type_holder = r2_hd_extra_claim`
- 질문: 다툼이 되는 추가 금액은 어떤 명목인가요?
- 선택지:
  - `r2_xc_fixed_penalty` — 계약서에 정한 위약금(예: 임대료 몇 개월치)이고, 해당 조항이 계약서에 적혀 있습니다.
  - `r2_xc_remaining_rent` — 남은 계약 기간의 임대료 전부이고, 계약서에 그렇게 정한 조항이 있는지는 확실하지 않습니다.
  - `r2_xc_damage_over_deposit` — 수리비나 손해가 보증금보다 크다는 이유이고, 견적서나 영수증으로 금액을 맞춰 본 적은 없습니다.
  - `r2_xc_unpaid_period` — 집을 비우기 전까지 밀린 임대료·관리비이고, 몇 달치인지는 서로 알고 있습니다.
  - `r2_xc_unclear_basis` — 명목이나 계산 근거가 정리되지 않은 금액이고, 서로 설명이 엇갈리고 있습니다.

#### re02_handover_record
- phase: 2 / kind: single / show_if: `re02_role = r2_role_tenant|r2_role_company_occupant|r2_role_landlord AND re02_contract_end ≠ r2_end_not_ended`
- 질문: 집을 비우고 넘겨줄 때, 집 상태는 어떻게 기록되었나요?
- 선택지:
  - `r2_ho_joint_signed` — 양쪽이 함께 집 상태를 점검했고, 서명한 인수인계서나 점검표가 있습니다.
  - `r2_ho_photos_only` — 함께 점검하지는 않았지만, 집을 비울 때 사진이나 영상을 찍어 두었습니다.
  - `r2_ho_move_in_only` — 입주할 때의 기록은 있지만, 집을 비울 때는 따로 기록을 남기지 못했습니다.
  - `r2_ho_no_record` — 입주할 때와 집을 비울 때 모두, 집 상태를 기록한 자료가 없습니다.
  - `r2_ho_not_handed` — 아직 열쇠나 집을 넘겨주지 않았거나, 넘겨준 날짜를 두고 다툼이 있습니다.

#### re02_other_reason
- phase: 2 / kind: single / show_if: `re02_dispute_type = r2_dt_not_returned|r2_dt_contact_avoided`
- 질문: 상대방은 돈을 돌려주지 않는 이유를 어떻게 설명했나요?
- 선택지:
  - `r2_or_contract_clause` — 계약서의 특정 조항을 근거로 들었고, 어느 조항인지도 말해 주었습니다.
  - `r2_or_damage_claim` — 집이나 물건이 손상되었다며, 수리비나 손해를 이유로 들었습니다.
  - `r2_or_my_breach` — 제가 먼저 계약을 어겼거나 일찍 끝냈다는 것을 이유로 들었습니다.
  - `r2_or_no_money_now` — 돌려줄 돈인 것은 인정하지만, 지금 돈이 없거나 다음 세입자·매수인을 구한 뒤 주겠다고 합니다.
  - `r2_or_no_reason` — 구체적인 이유를 말하지 않았거나, 들은 설명을 이해하지 못했습니다.

#### re02_money_evidence
- phase: 2 / kind: single / show_if: 항상
- 질문: 돈을 주고받은 사실은 어떤 자료로 확인할 수 있나요?
- 선택지:
  - `r2_me_contract_transfer` — 양쪽이 서명한 계약서가 있고, 은행 송금 내역도 남아 있습니다.
  - `r2_me_transfer_only` — 계약서는 없거나 찾지 못했지만, 은행 송금 내역은 남아 있습니다.
  - `r2_me_cash_message` — 현금으로 주고받았고, 받았다는 메시지나 손으로 쓴 영수증만 남아 있습니다.
  - `r2_me_none` — 계약서·송금 내역·받았다는 메시지 등 확인할 수 있는 자료가 없습니다.

#### re02_contract_form
- phase: 2 / kind: single / show_if: `re02_money_evidence = r2_me_contract_transfer`
- 질문: 계약서는 어떤 형태로 작성되었나요?
- 선택지:
  - `r2_cf_bilingual_signed` — 한국어(또는 영어)와 베트남어가 함께 적힌 계약서에, 양쪽이 서명했습니다.
  - `r2_cf_vn_only` — 베트남어로만 된 계약서에 서명했고, 내용을 모두 이해하지는 못했습니다.
  - `r2_cf_notarized` — 공증사무소에서 공증받은 계약서이고, 공증본을 가지고 있습니다.
  - `r2_cf_broker_form` — 중개인이 준비한 간단한 양식이나 계약금 확인서(giấy đặt cọc) 형태입니다.
  - `r2_cf_signer_doubt` — 계약서는 있지만, 상대방 서명이 빠져 있거나 실제 소유자가 아닌 사람이 서명했습니다.

#### re02_cash_proof
- phase: 2 / kind: single / show_if: `re02_money_evidence = r2_me_cash_message|r2_me_none`
- 질문: 돈을 건넸거나 받은 사실은 지금 무엇으로 확인할 수 있나요?
- 선택지:
  - `r2_cp_admit_message` — 상대방이 돈을 받았다고 인정한 문자나 메신저(Zalo 등) 메시지가 남아 있습니다.
  - `r2_cp_handwritten_signed` — 상대방이 손으로 써 준 영수증이나 메모가 있고, 서명도 되어 있습니다.
  - `r2_cp_witness_broker` — 자료는 없지만, 중개인이나 함께 있던 사람이 확인해 줄 수 있습니다.
  - `r2_cp_withdrawal_only` — 현금을 인출한 은행 기록은 있지만, 상대방에게 건넨 기록은 없습니다.
  - `r2_cp_nothing` — 찾아봤지만, 돈을 주고받은 사실을 확인할 방법이 없습니다.

#### re02_payment_path
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 돈은 누가 주고, 누가 받았나요?
- 선택지:
  - `r2_pp_direct` — 제가 직접 상대방 본인에게 주었거나, 상대방 본인에게서 받았습니다.
  - `r2_pp_agent_my_side` — 제 쪽에서는 회사·가족·지인이 대신 주고받았고, 저는 직접 관여하지 않았습니다.
  - `r2_pp_agent_other_side` — 상대방 쪽에서는 가족이나 관리인 등 다른 사람이 대신 받거나 보냈습니다.
  - `r2_pp_via_broker` — 중개인을 거쳐 주고받았고, 상대방에게 실제로 전달되었는지는 중개인 말로만 알고 있습니다.
  - `r2_pp_unclear` — 누구 명의 계좌로 오갔는지, 실제로 누가 받았는지 확실하지 않습니다.

#### re02_broker_hold
- phase: 2 / kind: single / show_if: `re02_payment_path = r2_pp_via_broker`
- 질문: 중개인을 거친 돈은 지금 어떤 상태인가요?
- 선택지:
  - `r2_bh_delivered_proof` — 중개인이 상대방에게 전달했고, 전달한 영수증이나 송금 내역도 보여 주었습니다.
  - `r2_bh_delivered_word` — 중개인은 전달했다고 하지만, 전달한 기록은 확인하지 못했습니다.
  - `r2_bh_still_holding` — 중개인이 아직 돈을 보관하고 있다고 하지만, 돌려주지 않고 있습니다.
  - `r2_bh_broker_unreachable` — 중개인과도 연락이 잘 되지 않아, 돈이 지금 어디에 있는지 모릅니다.

#### re02_demand_method
- phase: 2 / kind: single / show_if: 항상
- 질문: 지금까지 상대방에게 어떤 방법으로 요구하거나 대응하셨나요?
- 선택지:
  - `r2_dm_not_yet` — 아직 상대방에게 정식으로 요구하거나 대응하지 않았습니다.
  - `r2_dm_verbal_only` — 전화하거나 만나서 말로만 요구했고, 따로 남긴 기록은 없습니다.
  - `r2_dm_written_message` — 문자·Zalo·이메일 등 글로 요구했고, 보낸 기록이 남아 있습니다.
  - `r2_dm_broker_relay` — 중개인이나 관리사무소를 통해 제 요구를 전달했습니다.
  - `r2_dm_formal_letter` — 금액과 기한을 적은 정식 요구 문서를 서명해서 보냈습니다.

#### re02_other_reaction
- phase: 2 / kind: single / show_if: `re02_demand_method ≠ r2_dm_not_yet`
- 질문: 요구하거나 대응한 뒤, 상대방은 어떻게 반응했나요?
- 선택지:
  - `r2_rx_promised_date` — 돌려주거나 정리하겠다고 했고, 구체적인 날짜도 말했습니다.
  - `r2_rx_promised_vague` — 해결하겠다고는 했지만, 날짜나 금액은 정하지 않았습니다.
  - `r2_rx_partial_offer` — 일부 금액만 주겠다고 했거나, 실제로 일부만 보냈습니다.
  - `r2_rx_counter_claim` — 오히려 손해나 위약금을 이유로, 저에게 돈을 더 요구했습니다.
  - `r2_rx_ignored` — 메시지를 읽고도 답이 없거나, 연락을 피하고 있습니다.

#### re02_situation_match
- phase: 2 / kind: single / show_if: 항상
- 질문: 상대방의 주장은 실제 있었던 일과 비교하면 어떤가요?
- 선택지:
  - `r2_sm_match` — 상대방이 말하는 사실은 대체로 맞고, 금액이나 처리 방법만 서로 다릅니다.
  - `r2_sm_partial` — 일부 사실은 맞지만, 손상 정도나 금액 등 중요한 부분이 실제와 다릅니다.
  - `r2_sm_mismatch` — 상대방이 말하는 일은 실제로 없었거나, 책임은 오히려 상대방에게 있다고 생각합니다.
  - `r2_sm_hard_to_judge` — 기록이 남아 있지 않아, 누구 말이 맞는지 비교하기 어렵습니다.
  - `r2_sm_unknown` — 상대방이 무엇을 주장하는지 정확히 알지 못해, 비교할 수 없습니다.

#### re02_deadline
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 돈 문제와 관련해 정해진 기한이 있나요?
- 선택지:
  - `r2_dl_contract_term` — 계약서에 반환 기한(예: 집을 비운 뒤 며칠 이내)이 적혀 있고, 날짜를 계산할 수 있습니다.
  - `r2_dl_promised_date` — 상대방이 특정 날짜까지 돌려주거나 정리하겠다고 약속했습니다.
  - `r2_dl_my_schedule` — 출국·이사·다음 계약 등 제 일정 때문에, 그 전에 정리되어야 합니다.
  - `r2_dl_other_demand` — 상대방이 정한 날짜까지 돈을 보내거나 합의하라고 요구했습니다.
  - `r2_dl_none` — 기한에 대해서는 정해진 것이 없거나, 있는지 확인하지 못했습니다.

#### re02_deadline_date
- phase: 2 / kind: text / show_if: `re02_deadline = r2_dl_contract_term|r2_dl_promised_date|r2_dl_my_schedule|r2_dl_other_demand`
- 질문: 그 기한은 언제인가요?
- placeholder: 예: 2026년 11월 15일(집을 비운 날부터 30일 이내) / 11월 말 출국 예정

#### re02_blockage
- phase: 2 / kind: single / show_if: 항상
- 질문: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `r2_bk_entitlement` — 정말 돌려받을(또는 돌려줘야 할) 돈인지 확신이 없어, 분명하게 요구하지 못하고 있습니다.
  - `r2_bk_amount_basis` — 공제나 위약금이 어떻게 계산되었는지 몰라, 반박할 근거를 정리하지 못하고 있습니다.
  - `r2_bk_evidence` — 계약서·송금 내역·집 상태 기록 등 자료가 부족해, 대응을 시작하지 못하고 있습니다.
  - `r2_bk_contact` — 상대방이 연락을 피하거나 베트남 밖에 있어, 대화 자체가 진행되지 않고 있습니다.
  - `r2_bk_language_process` — 베트남어와 현지 절차를 잘 몰라, 다음에 무엇을 해야 할지 멈춰 있습니다.

#### re02_final_goal
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `r2_fg_full_settlement` — 계약서 기준으로 받을(또는 돌려줄) 금액을 확인하고, 그 금액대로 정리하고 싶습니다.
  - `r2_fg_fair_compromise` — 공제나 위약금 중 타당한 부분은 인정하고, 나머지는 합의로 정리하고 싶습니다.
  - `r2_fg_formal_demand` — 근거를 정리한 정식 요구 문서를 보내고, 기한 안에 답을 받고 싶습니다.
  - `r2_fg_reject_claim` — 상대방의 요구가 타당하지 않다면, 근거를 갖추어 분명하게 거절하고 싶습니다.
  - `r2_fg_expert` — 제 상황을 전문가에게 정확히 전달해, 협상이나 대응을 맡기고 싶습니다.

---

## 결과 신호

### 위험 신호 선택지 → 결과 화면 문장 / 판정 단계

| 선택지 | 결과 화면 위험 문장 | 판정 |
|---|---|---|
| `r2_end_me_short_notice` | 계약서에 정한 사전 통지 기간을 지키지 못한 경우, 상대방이 공제나 위약금을 주장할 여지가 있어 계약서 조항부터 확인해야 합니다. | 주의 |
| `r2_end_not_ended` | 계약이 아직 끝나지 않은 상태라, 지금 돈을 요구하거나 거절하는 방식에 따라 계약 위반 문제로 번질 수 있습니다. | 주의 |
| `r2_dt_deposit_forfeited` / `r2_hd_forfeit_dispute` | 계약금을 돌려주지 않는 것이 정당한지는 누가 먼저 계약을 지키지 않았는지와 계약금 조항에 따라 달라지므로, 사실관계를 먼저 정리해야 합니다. | 주의 |
| `r2_hd_double_demand` | 계약금을 받은 쪽이 계약을 진행하지 못한 경우 두 배 반환 주장이 나올 수 있어, 계약서 조항과 진행하지 못한 사정을 함께 검토해야 합니다. | 전문가 권장 |
| `r2_dt_extra_claim` / `r2_hd_extra_claim` | 보증금을 넘는 추가 금액은 근거 조항과 금액 계산이 맞는지 확인하기 전에 지급하거나 요구하지 않는 것이 안전합니다. | 주의 |
| `r2_dt_contact_avoided` / `r2_hd_contact_lost` / `r2_rx_ignored` | 상대방이 연락을 피하고 있어, 말로 하는 요구보다 기록이 남는 방법으로 요구한 사실을 남겨 두는 것이 중요합니다. | 주의 |
| `r2_ded_no_itemization` / `r2_xc_unclear_basis` | 공제나 추가 금액에 항목별 근거가 없어, 금액을 인정하기 전에 내역과 영수증을 먼저 요구해야 합니다. | 확인 필요 |
| `r2_fc_no_clause` / `r2_fc_one_side` | 계약서에 계약금 처리 기준이 없거나 한쪽만 적혀 있어, 현지 관행만으로 결과를 예측하기 어렵습니다. | 주의 |
| `r2_fc_cannot_read` / `r2_cf_vn_only` | 베트남어 계약 내용을 정확히 이해하지 못한 상태라, 핵심 조항을 번역해 확인한 뒤 대응해야 합니다. | 확인 필요 |
| `r2_cf_signer_doubt` | 실제 소유자가 아닌 사람이 서명했거나 서명이 빠진 계약은 돈을 받은 사람이 누구인지부터 문제가 될 수 있습니다. | 전문가 권장 |
| `r2_me_none` / `r2_cp_nothing` | 돈을 주고받은 사실을 확인할 자료가 없어, 상대방이 받은 사실 자체를 부인하면 대응이 어려워질 수 있습니다. | 전문가 권장 |
| `r2_me_cash_message` / `r2_cp_withdrawal_only` | 현금으로 주고받은 돈은 상대방이 받았다고 인정한 기록이 핵심이므로, 남아 있는 메시지를 지우지 말고 보관해야 합니다. | 주의 |
| `r2_ho_no_record` / `r2_ho_move_in_only` | 집을 비울 때의 상태 기록이 없어, 손상 책임을 두고 서로 주장이 엇갈릴 가능성이 큽니다. | 주의 |
| `r2_ho_not_handed` | 집을 넘겨준 날짜가 정리되지 않으면 반환 기한과 밀린 임대료 계산이 모두 달라질 수 있습니다. | 확인 필요 |
| `r2_pp_via_broker` + `r2_bh_delivered_word` | 중개인이 상대방에게 돈을 전달했는지 기록으로 확인되지 않아, 돈이 실제로 어디에 있는지부터 확인해야 합니다. | 주의 |
| `r2_bh_still_holding` / `r2_bh_broker_unreachable` | 중개인이 돈을 보관한 채 돌려주지 않거나 연락이 되지 않는 상황이라, 중개인과 상대방 중 누구에게 요구할지 정리가 필요합니다. | 전문가 권장 |
| `r2_pp_unclear` / `r2_pp_agent_other_side` | 실제로 돈을 받은 사람이 계약 상대방 본인인지 확실하지 않아, 누구에게 반환을 요구할지부터 확인해야 합니다. | 확인 필요 |
| `r2_rx_counter_claim` | 요구한 뒤 상대방이 오히려 돈을 더 요구하고 있어, 상대방 주장의 근거를 받아 본 뒤 대응 순서를 정해야 합니다. | 주의 |
| `r2_sm_mismatch` / `r2_sm_hard_to_judge` | 상대방 주장과 실제 사정이 다르거나 비교할 기록이 부족해, 날짜별 사실관계를 먼저 정리해야 합니다. | 확인 필요 |
| `r2_dl_other_demand` / `r2_dl_my_schedule` | 기한이 가까운 상태라, 기한 전에 기록이 남는 방법으로 입장을 전달해 두는 것이 안전합니다. | 주의 |

#### 특수 사건 표시 (퍼널 유지, 결과에서 "VFBCAI 전문가팀 진행" 안내만 표시)
- 직접 입력 또는 선택 조합에서 아래가 확인되면 표시: 이미 소송·중재·조정이 진행 중인 경우 / `r2_cf_signer_doubt` + 소유자 확인 불가(사기 의심 등 형사 문제 가능성) / `r2_bh_broker_unreachable`(중개인이 돈을 가지고 연락이 끊긴 경우) / 공동 세입자·공동 매수인 등 당사자가 여러 명이거나 회사·개인 명의가 섞인 경우(`r2_role_company_occupant` + `r2_pp_agent_my_side`).
- 표시 문장: 이 사건은 일반적인 반환 요구 절차보다 확인할 당사자와 쟁점이 많아, VFBCAI 전문가팀이 사실관계를 직접 확인한 뒤 진행하는 것이 적합합니다.

### 1차 결과 "핵심 확인 결과" 3칸 문장 규칙
1. **상황** = `re02_role` + (`re02_dispute_type` 또는 `re02_dispute_type_holder`) + `re02_contract_end`를 한 문장으로 연결.
   - 형식: "{역할}로서 {분쟁 유형 요약}이며, 계약은 {종료 방식 요약} 상태입니다."
   - 예: "세입자로서 보증금 중 일부가 수리비 등으로 공제된 상황이며, 계약은 기간 만료로 종료된 상태입니다."
   - 역할 요약어: r2_role_tenant=세입자 / r2_role_company_occupant=회사 명의 계약의 실제 거주자 / r2_role_landlord=집주인 / r2_role_buyer=매수인 / r2_role_seller=매도인.
   - 종료 요약어: r2_end_expired=기간 만료로 종료 / r2_end_me_with_notice=고객님이 미리 알리고 먼저 종료 / r2_end_me_short_notice=고객님이 먼저 종료했으나 사전 통지가 부족 / r2_end_other_first=상대방 사정으로 종료 / r2_end_not_ended=아직 종료되지 않음.
2. **확인 목표** = `re02_confirm_goal` 선택지를 "~를 확인합니다"로 바꿔 1문장. 결과를 단정하지 않고 확인 대상만 적는다.
   - r2_cg_entitlement → "이 돈을 돌려받을 수 있는지(또는 돌려주어야 하는지)를 계약서와 실제 사정 기준으로 확인합니다."
   - r2_cg_amount_check → "공제·요구 금액의 항목과 계산 방식이 맞는지 확인합니다."
   - r2_cg_forfeit_rule → "계약금 몰수 또는 두 배 반환 주장이 계약서 조항과 계약이 깨진 경위에 맞는지 확인합니다."
   - r2_cg_how_to_demand → "상대방에게 요구할 시점과 기록이 남는 요구 방법을 확인합니다."
   - r2_cg_unsure → "지금 상황에서 먼저 정리할 사실과 진행 순서를 확인합니다."
3. **대응·자료** = 분쟁 유형별로 준비할 자료 1문장(+ r2_end_me_short_notice/r2_end_not_ended면 주의 1구절 추가).
   - r2_dt_not_returned / r2_dt_contact_avoided / r2_hd_contact_lost → "계약서, 송금 내역, 상대방과 주고받은 메시지를 먼저 모아 두세요."
   - r2_dt_partial_deduction / r2_hd_deduct_dispute → "공제 항목별 내역·영수증과 집을 비울 때의 사진·점검 기록을 함께 준비하세요."
   - r2_dt_deposit_forfeited / r2_hd_forfeit_dispute / r2_hd_double_demand → "계약서의 계약금(đặt cọc) 조항과 계약이 진행되지 못한 경위를 날짜순으로 정리하세요."
   - r2_dt_extra_claim / r2_hd_extra_claim → "추가 금액의 근거 조항과 계산 내역을 상대방에게 받아 두고, 확인 전에는 지급이나 요구를 서두르지 마세요."
   - 추가 구절: r2_end_me_short_notice → "계약서의 사전 통지 조항도 함께 확인하세요." / r2_end_not_ended → "계약이 아직 유지 중이므로 대응 방식은 신중히 정하세요."

### "지금 확인해 보세요" STEP 3개
1. **STEP 1 — 계약서의 돈 관련 조항 확인**: 보증금 반환 기한, 공제 조건, 계약금(đặt cọc) 처리, 중도 해지 시 통지 기간이 적힌 조항을 찾아 표시해 두세요.
2. **STEP 2 — 돈이 오간 기록 정리**: 송금 내역·영수증·받았다는 메시지를 날짜와 금액순으로 모으고, 중개인이나 대리인을 거쳤다면 실제로 누가 받았는지도 함께 적어 두세요.
3. **STEP 3 — 요구와 답변을 기록으로 남기기**: 지금까지 말로만 요구했다면 금액·근거·기한을 적어 글로 다시 보내고, 상대방의 답변은 캡처해 보관하세요.

---

## 노드 수 요약
- 1차: 5노드(공용 Q1 별도) — 경로당 Q1 + 4문항 노출(re02_role → dispute_type 또는 dispute_type_holder 중 1개 → contract_end → confirm_goal).
- 2차: 19노드(조건부 후속 11개 포함). 상시 8문항(amount_state, money_evidence, payment_path, demand_method, situation_match, deadline, blockage, final_goal) + 경로별 조건부 3~6문항.
- 전체: 24노드(Q1 제외).


---

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
  - `r3_role_tenant` — 제 이름으로 집을 빌려 살고 있고, 계약서에도 제가 임차인으로 적혀 있습니다.
  - `r3_role_company_staff` — 회사 명의로 계약된 집에 살고 있고, 계약 당사자는 제가 아닌 회사입니다.
  - `r3_role_subtenant` — 원래 세입자에게서 다시 빌려 살고 있고, 집주인과 직접 맺은 계약은 없습니다.
  - `r3_role_landlord` — 제 소유의 집을 빌려주었고, 세입자에게서 통보를 받았습니다.
  - `r3_role_proxy` — 가족이나 지인 대신 확인하고 있고, 계약 당사자는 제가 아닙니다.

### re03_demand_type
- phase: 1 / kind: single / show_if: 항상
- 질문: 상대방은 이번 통보에서 무엇을 가장 중심적으로 요구했나요?
- 선택지:
  - `r3_dm_fix_breach` — 문제가 된 부분을 정해진 기간 안에 바로잡으면, 계약을 계속 유지하겠다는 내용이었습니다.
  - `r3_dm_terminate` — 계약을 끝내겠다는 통보였고, 언제 집을 비워야 하는지는 아직 정해지지 않았습니다.
  - `r3_dm_vacate_date` — 계약을 끝내면서, 정해진 날짜까지 집을 비우라는(또는 비우겠다는) 날짜가 적혀 있었습니다.
  - `r3_dm_money_claim` — 계약 위반을 이유로, 위약금이나 손해배상 명목의 돈을 내라는 요구를 받았습니다.
  - `r3_dm_unclear` — 통보는 받았지만, 상대방이 정확히 무엇을 요구하는지 이해하지 못했습니다.

### re03_response_status
- phase: 1 / kind: single / show_if: 항상
- 질문: 통보를 받은 뒤, 지금까지 어떻게 대응하셨나요?
- 선택지:
  - `r3_rs_none` — 통보만 받았고, 아직 상대방에게 답하거나 연락하지 않았습니다.
  - `r3_rs_inquired` — 상대방이나 중개인에게 이유를 물어봤지만, 제 입장은 아직 정하지 않았습니다.
  - `r3_rs_disputed` — 통보 내용이 사실과 다르거나 계약과 맞지 않는다고, 상대방에게 분명히 말했습니다.
  - `r3_rs_complied_part` — 밀린 금액을 보내거나 문제를 고치는 등, 요구의 일부를 이미 이행했습니다.
  - `r3_rs_negotiating` — 나가는 날짜나 보증금·금액 조건을 두고, 상대방과 협의하고 있습니다.

### re03_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `r3_cg_validity` — 이 통보가 계약서 조항과 통지 기간에 맞는 것인지, 그대로 따라야 하는지 확인하고 싶습니다.
  - `r3_cg_move_timing` — 정말 집을 비워야 하는지(또는 언제 비워 받을 수 있는지), 그 전에 할 일을 확인하고 싶습니다.
  - `r3_cg_money` — 보증금을 어떻게 정리해야 하는지, 위약금이나 손해배상을 내야 하는지 확인하고 싶습니다.
  - `r3_cg_fact_gap` — 상대방이 말한 위반 사유 중 사실과 다른 부분을 정리하고, 어떻게 설명할지 확인하고 싶습니다.
  - `r3_cg_order` — 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.

---

## 2차 (조건부 후속 포함 24개 노드)

### re03_reason_tenant
- phase: 2 / kind: single / show_if: re03_my_role ≠ r3_role_landlord
- 질문: 상대방은 계약 위반이나 해지 이유를 무엇이라고 했나요?
- 선택지:
  - `r3_rt_arrears` — 임대료나 관리비가 밀렸다는 이유였고, 밀린 기간이나 금액이 적혀 있습니다.
  - `r3_rt_noise_misuse` — 소음이나 이웃 민원, 또는 집을 사무실·영업 등 주거 외 용도로 썼다는 이유였습니다.
  - `r3_rt_sublease` — 집주인 동의 없이 다른 사람에게 다시 빌려주었거나, 함께 살게 했다는 이유였습니다.
  - `r3_rt_owner_side` — 제 잘못이 아니라, 집을 팔거나 집주인이 직접 쓰겠다는 상대방 사정 때문이라고 했습니다.
  - `r3_rt_other_unclear` — 위에 없는 다른 이유이거나, 이유가 적혀 있지 않아 알 수 없습니다.

### re03_reason_landlord
- phase: 2 / kind: single / show_if: re03_my_role = r3_role_landlord
- 질문: 세입자는 계약 위반이나 해지 이유를 무엇이라고 했나요?
- 선택지:
  - `r3_rld_repair_claim` — 제가 수리나 시설 관리를 해 주지 않아, 계약을 지키지 않았다고 했습니다.
  - `r3_rld_early_exit` — 귀국·전근 등 세입자 개인 사정으로, 계약 기간 전에 나가겠다고 했습니다.
  - `r3_rld_deposit_claim` — 보증금이나 미리 받은 임대료를 돌려 달라고 하면서, 해지를 통보했습니다.
  - `r3_rld_house_issue` — 누수·곰팡이·소음 등 집 상태가 계약 때 설명과 다르다고 했습니다.
  - `r3_rld_no_reason` — 이유 없이 나가겠다고만 했거나, 그 뒤로 연락이 거의 끊긴 상태입니다.

### re03_arrears_fact
- phase: 2 / kind: single / show_if: re03_reason_tenant = r3_rt_arrears
- 질문: 밀렸다고 한 임대료·관리비는 실제와 비교하면 어떤가요?
- 선택지:
  - `r3_ar_admit_unpaid` — 실제로 밀린 금액이 있고, 그 금액도 상대방 말과 거의 같습니다.
  - `r3_ar_amount_differs` — 밀린 것은 맞지만, 상대방이 말한 금액이나 기간이 실제보다 큽니다.
  - `r3_ar_paid_not_counted` — 이미 송금했는데, 상대방이 받지 못했다고 하거나 반영하지 않았습니다.
  - `r3_ar_mgmt_fee_dispute` — 임대료는 보냈고, 문제가 된 것은 관리사무소 관리비나 전기·수도 요금입니다.
  - `r3_ar_none` — 밀린 금액이 없고, 송금 내역으로 이를 확인할 수 있습니다.

### re03_conduct_fact
- phase: 2 / kind: single / show_if: re03_reason_tenant = r3_rt_noise_misuse|r3_rt_sublease
- 질문: 상대방이 문제 삼은 집 사용 방식은 실제로 어떠했나요?
- 선택지:
  - `r3_cd_admit_fixed` — 그런 일이 있었던 것은 맞지만, 통보를 받은 뒤 이미 그만두거나 고쳤습니다.
  - `r3_cd_admit_ongoing` — 그런 일이 있었던 것은 맞고, 지금도 같은 방식으로 쓰고 있습니다.
  - `r3_cd_consented_before` — 계약 전이나 중간에 집주인이 허락했고, 허락받은 메시지나 서면이 남아 있습니다.
  - `r3_cd_exaggerated` — 비슷한 일은 있었지만, 상대방이 실제보다 훨씬 크게 문제 삼고 있습니다.
  - `r3_cd_deny` — 그런 사용은 없었고, 이웃이나 관리사무소가 사실을 확인해 줄 수 있습니다.

### re03_owner_reason_fact
- phase: 2 / kind: single / show_if: re03_reason_tenant = r3_rt_owner_side
- 질문: 상대방 사정으로 계약을 끝내겠다는 통보는 어떤 내용이었나요?
- 선택지:
  - `r3_ow_sale_new_owner` — 집을 팔았거나 팔 예정이라고 했고, 새 집주인에게 계약이 이어지는지는 듣지 못했습니다.
  - `r3_ow_sale_buyer_wants_empty` — 집을 팔면서, 사는 사람이 빈집을 원한다며 날짜를 정해 나가 달라고 했습니다.
  - `r3_ow_own_use` — 집주인이나 가족이 직접 살겠다며, 계약 기간이 남았는데도 나가 달라고 했습니다.
  - `r3_ow_bank_issue` — 은행 담보나 집주인의 빚 문제로, 집이 다른 사람에게 넘어갈 수 있다는 이야기를 들었습니다.
  - `r3_ow_compensation_offered` — 상대방 사정이라며, 이사비나 위약금 일부를 보상하겠다고 제안했습니다.

### re03_notice_form
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 통보는 어떤 방법으로 받으셨나요?
- 선택지:
  - `r3_nf_written_hand` — 서명된 서면 통지를 직접 건네받았고, 원본을 가지고 있습니다.
  - `r3_nf_post` — 우편이나 등기우편으로 서면 통지를 받았고, 봉투나 수령 기록도 남아 있습니다.
  - `r3_nf_messenger` — Zalo·카카오톡·이메일 등 메시지로 받았고, 화면 캡처나 대화 기록이 있습니다.
  - `r3_nf_oral` — 전화나 방문으로 말로만 들었고, 서면이나 메시지는 받지 못했습니다.
  - `r3_nf_via_middle` — 중개인이나 관리사무소가 대신 전달했고, 상대방에게 직접 들은 것은 아닙니다.

### re03_notice_sender
- phase: 2 / kind: single / show_if: re03_notice_form = r3_nf_oral|r3_nf_via_middle
- 질문: 통보를 실제로 보낸 사람은 누구로 확인되나요?
- 선택지:
  - `r3_sd_party_self` — 계약서에 적힌 상대방 본인이 보낸 것이고, 이름이나 연락처로 확인했습니다.
  - `r3_sd_agent` — 상대방의 가족·회사 담당자·변호사 등 대리인이 보냈고, 위임받았는지는 확인하지 못했습니다.
  - `r3_sd_broker` — 계약을 중개한 중개인이 보냈고, 상대방 본인의 뜻인지는 직접 확인하지 못했습니다.
  - `r3_sd_mgmt_office` — 건물 관리사무소가 보냈고, 계약 상대방 본인의 뜻인지는 분명하지 않습니다.
  - `r3_sd_unknown` — 누가 보낸 것인지, 계약 상대방과 어떤 관계인지 확인하지 못했습니다.

### re03_notice_period
- phase: 2 / kind: single / show_if: 항상
- 질문: 통보에서 준 기간은 계약서의 해지·통지 조항과 비교하면 어떤가요?
- 선택지:
  - `r3_np_meets_clause` — 계약서에 '며칠 전 통지' 조항이 있고, 이번 통보는 그 기간을 지킨 것으로 보입니다.
  - `r3_np_shorter` — 계약서에 통지 기간 조항이 있지만, 이번 통보는 그보다 짧은 기간만 주었습니다.
  - `r3_np_no_clause` — 계약서를 확인했지만, 해지 통지 기간에 관한 조항은 찾지 못했습니다.
  - `r3_np_lang_unread` — 계약서가 베트남어로만 되어 있어, 해당 조항이 있는지 확인하지 못했습니다.
  - `r3_np_no_contract` — 서면 계약서 없이 말이나 메시지로 계약했거나, 계약서 사본을 지금 가지고 있지 않습니다.

### re03_contract_form
- phase: 2 / kind: single / show_if: re03_notice_period = r3_np_shorter|r3_np_no_clause
- 질문: 계약서는 어떤 형태로 작성되어 있나요?
- 선택지:
  - `r3_cf_notarized` — 공증사무소에서 공증받은 계약서이고, 원본이나 공증 사본을 가지고 있습니다.
  - `r3_cf_bilingual` — 공증은 받지 않았고, 베트남어와 한국어(또는 영어)가 함께 적힌 계약서입니다.
  - `r3_cf_vn_only` — 공증은 받지 않았고, 베트남어로만 된 계약서라 일부만 이해하고 있습니다.
  - `r3_cf_foreign_only` — 한국어나 영어로만 작성했고, 베트남어 본은 따로 만들지 않았습니다.
  - `r3_cf_company_held` — 회사나 원래 세입자가 계약서를 보관하고 있어, 저는 내용을 직접 보지 못했습니다.

### re03_move_out_deadline
- phase: 2 / kind: single / show_if: re03_demand_type = r3_dm_terminate|r3_dm_vacate_date
- 질문: 집을 비우는 날짜는 어떻게 안내받으셨나요?
- 선택지:
  - `r3_md_date_written` — 통보에 정확한 날짜가 적혀 있어, 언제까지인지 확인했습니다.
  - `r3_md_period_only` — '통보일부터 30일 이내'처럼 기간만 적혀 있어, 정확한 날짜는 계산하지 못했습니다.
  - `r3_md_immediate` — 날짜 없이, 바로 또는 며칠 안에 집을 비우라는(비우겠다는) 말만 들었습니다.
  - `r3_md_not_stated` — 계약을 끝낸다는 통보는 받았지만, 언제 비워야 하는지는 안내받지 못했습니다.
  - `r3_md_lang_unclear` — 통보가 베트남어로 되어 있어, 날짜가 적혀 있는지조차 확인하지 못했습니다.

### re03_move_out_date
- phase: 2 / kind: text / show_if: re03_move_out_deadline = r3_md_date_written|r3_md_period_only
- 질문: 안내받은 퇴거 날짜나 기간을 적어 주세요.
- placeholder: 예: 2026년 11월 30일까지 집을 비우라고 적혀 있습니다. / 10월 1일 통보, '30일 이내'라고만 적혀 있습니다.

### re03_occupancy_tenant
- phase: 2 / kind: single / show_if: re03_my_role ≠ r3_role_landlord 그리고 (re03_demand_type = r3_dm_vacate_date 또는 re03_move_out_deadline = r3_md_immediate)
- 질문: 지금 그 집에서의 생활은 어떤 상태인가요?
- 선택지:
  - `r3_oc_living_normal` — 아직 그 집에 살고 있고, 출입이나 전기·수도 사용에는 문제가 없습니다.
  - `r3_oc_moving_prep` — 아직 살고 있지만, 새 집을 알아보거나 짐을 일부 옮기고 있습니다.
  - `r3_oc_already_left` — 이미 집을 비웠지만, 열쇠 반납이나 집 상태 확인은 아직 하지 않았습니다.
  - `r3_oc_locked_out` — 상대방이 열쇠를 바꾸거나 전기·수도를 끊어, 집을 제대로 쓰지 못하고 있습니다.
  - `r3_oc_belongings_threat` — 정해진 날까지 나가지 않으면, 짐을 밖으로 내놓겠다는 말을 들었습니다.

### re03_occupancy_landlord
- phase: 2 / kind: single / show_if: re03_my_role = r3_role_landlord
- 질문: 세입자는 지금 그 집을 어떻게 쓰고 있나요?
- 선택지:
  - `r3_ol_still_living` — 세입자가 아직 살고 있고, 나가는 날짜에 대해 연락은 되고 있습니다.
  - `r3_ol_not_leaving` — 계약이 끝났거나 해지됐는데도 세입자가 나가지 않고, 날짜 이야기를 피하고 있습니다.
  - `r3_ol_third_party` — 세입자가 아닌 다른 사람이 살고 있어, 제 동의 없이 다시 빌려준 것으로 보입니다.
  - `r3_ol_left_items` — 세입자는 나간 것 같지만, 짐이 남아 있고 열쇠도 돌려받지 못했습니다.
  - `r3_ol_no_contact` — 세입자와 연락이 끊겼고, 집 안 상태도 확인하지 못했습니다.

### re03_fact_compare
- phase: 2 / kind: single / show_if: 항상
- 질문: 상대방이 통보에서 말한 내용은 실제 있었던 일과 비교하면 어떤가요?
- 선택지:
  - `r3_fc_match` — 상대방이 말한 내용이 실제 있었던 일과 거의 같습니다.
  - `r3_fc_partial` — 그런 일은 있었지만, 날짜·금액·횟수 등 일부가 실제와 다릅니다.
  - `r3_fc_already_solved` — 그런 일은 있었지만, 통보 전에 이미 해결했거나 상대방과 정리한 일입니다.
  - `r3_fc_other_breached` — 상대방이 먼저 계약을 지키지 않았는데, 이번 통보에는 그 사실이 빠져 있습니다.
  - `r3_fc_cannot_compare` — 통보 내용을 이해하지 못했거나 기록이 없어, 지금은 비교하기 어렵습니다.

### re03_fact_gap
- phase: 2 / kind: single / show_if: re03_fact_compare = r3_fc_partial|r3_fc_already_solved|r3_fc_other_breached
- 질문: 상대방 말과 실제가 가장 크게 다른 점은 무엇인가요?
- 선택지:
  - `r3_gp_date_amount` — 날짜나 금액이 다르고, 송금 내역이나 영수증으로 실제를 보여 줄 수 있습니다.
  - `r3_gp_action_itself` — 문제라고 한 행동 자체가 다르고, 당시 상황을 보여 줄 메시지나 증인이 있습니다.
  - `r3_gp_prior_agreement` — 이미 상대방과 합의한 일인데, 그 합의를 없던 일로 하고 있습니다.
  - `r3_gp_counter_breach` — 상대방이 수리·보증금·약속을 먼저 지키지 않았는데, 그 부분이 빠져 있습니다.
  - `r3_gp_no_proof_yet` — 다르다는 것은 분명하지만, 이를 보여 줄 자료를 아직 모으지 못했습니다.

### re03_fact_gap_text
- phase: 2 / kind: text / show_if: re03_fact_compare = r3_fc_partial|r3_fc_other_breached
- 질문: 상대방 주장과 실제가 다른 부분을 날짜와 함께 적어 주세요.
- placeholder: 예: 9월 임대료는 9월 5일에 계좌이체로 보냈는데, 통보에는 9월분이 밀렸다고 적혀 있습니다.

### re03_response_detail
- phase: 2 / kind: single / show_if: re03_response_status = r3_rs_disputed|r3_rs_complied_part|r3_rs_negotiating
- 질문: 상대방에게 대응할 때 어떤 방법으로 하셨고, 기록이 남아 있나요?
- 선택지:
  - `r3_rd_written_kept` — 서면이나 메시지로 답했고, 보낸 내용과 상대방이 읽은 기록이 남아 있습니다.
  - `r3_rd_oral_only` — 전화나 만나서 말로만 했고, 따로 남긴 기록은 없습니다.
  - `r3_rd_paid_with_record` — 밀린 금액이나 요구 금액 일부를 송금했고, 송금 내역을 가지고 있습니다.
  - `r3_rd_fixed_with_photo` — 문제가 된 부분을 고치거나 그만두었고, 사진이나 확인 메시지가 있습니다.
  - `r3_rd_via_broker` — 중개인이나 관리사무소를 통해 전달했고, 상대방에게 제대로 전달됐는지는 모릅니다.

### re03_counter_reaction
- phase: 2 / kind: single / show_if: re03_response_status = r3_rs_inquired|r3_rs_disputed|r3_rs_complied_part|r3_rs_negotiating
- 질문: 대응한 뒤, 상대방은 어떤 반응을 보였나요?
- 선택지:
  - `r3_cr_withdrawn` — 통보를 거두거나, 계약을 그대로 유지하겠다는 답을 받았습니다.
  - `r3_cr_maintained` — 처음 통보를 그대로 유지하겠다며, 같은 날짜와 요구를 다시 말했습니다.
  - `r3_cr_new_terms` — 날짜를 미루거나 금액을 줄이는 등, 새로운 조건을 제시했습니다.
  - `r3_cr_legal_threat` — 법원이나 공안에 신고하겠다고 했거나, 이미 절차를 시작했다고 했습니다.
  - `r3_cr_no_reply` — 아직 답이 없거나, 답을 받았지만 무슨 뜻인지 이해하지 못했습니다.

### re03_deposit_status
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 계약의 보증금은 지금 어떤 상태인가요?
- 선택지:
  - `r3_ds_held_no_talk` — 보증금은 집주인 쪽에 그대로 있고, 돌려주거나 빼는 것에 대한 이야기는 아직 없습니다.
  - `r3_ds_return_promised` — 돌려준다는 말은 오갔지만, 금액이나 날짜는 아직 정해지지 않았습니다.
  - `r3_ds_deduct_listed` — 밀린 금액이나 수리비를 빼고 돌려준다고 했고, 공제 내역도 받았습니다.
  - `r3_ds_deduct_no_list` — 일부를 빼고 돌려준다고 했지만, 무엇을 얼마나 빼는지 내역은 받지 못했습니다.
  - `r3_ds_forfeit` — 계약 위반을 이유로, 보증금을 전혀 돌려주지 않겠다는 이야기가 나왔습니다.

### re03_penalty_clause
- phase: 2 / kind: single / show_if: re03_demand_type = r3_dm_money_claim 또는 re03_deposit_status = r3_ds_deduct_listed|r3_ds_deduct_no_list|r3_ds_forfeit
- 질문: 상대방이 요구한 금액은 계약서의 위약금 조항과 비교하면 어떤가요?
- 선택지:
  - `r3_pc_clause_matches` — 계약서에 위약금 조항(보증금 몰수, 임대료 몇 달치 등)이 있고, 요구 금액도 그 조항과 같습니다.
  - `r3_pc_amount_exceeds` — 위약금 조항은 있지만, 요구받은 금액이 조항보다 크거나 다른 항목이 더 붙어 있습니다.
  - `r3_pc_no_clause` — 계약서에 위약금 조항이 없는데, 상대방이 금액을 정해서 요구했습니다.
  - `r3_pc_damage_claim` — 위약금과 별도로, 수리비·공실 손해 등 손해배상을 추가로 요구받았습니다.
  - `r3_pc_unknown` — 위약금 조항이 있는지, 요구 금액이 어떻게 계산되었는지 모르겠습니다.

### re03_claim_amount
- phase: 2 / kind: text / show_if: re03_penalty_clause = r3_pc_clause_matches|r3_pc_amount_exceeds|r3_pc_no_clause|r3_pc_damage_claim
- 질문: 요구받은 금액과 항목을 통보에 적힌 그대로 적어 주세요.
- placeholder: 예: 위약금으로 임대료 2개월분 3,000만 동, 청소비 200만 동을 보증금에서 빼겠다고 했습니다.

### re03_evidence
- phase: 2 / kind: multi / show_if: 항상
- 질문: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `r3_ev_contract` — 임대차 계약서(공증본·번역본 포함)
  - `r3_ev_notice_chat` — 상대방에게서 받은 통보와 그 뒤 주고받은 메시지 기록
  - `r3_ev_transfer` — 임대료·관리비·보증금 송금 내역이나 영수증
  - `r3_ev_house_photo` — 입주할 때와 지금의 집 상태를 보여 주는 사진·영상
  - `r3_ev_none` — 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.

### re03_blockage
- phase: 2 / kind: single / show_if: 항상
- 질문: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `r3_bk_validity_unknown` — 통보가 계약서 조항에 맞는 것인지 판단하지 못해, 따를지 말지 정하지 못하고 있습니다.
  - `r3_bk_time_pressure` — 집을 비우는 날짜가 너무 가까워, 이사나 다음 세입자 준비가 따라가지 못하고 있습니다.
  - `r3_bk_money_dispute` — 보증금이나 위약금 금액에 서로 의견이 달라, 정리가 멈춰 있습니다.
  - `r3_bk_no_proof` — 상대방 말이 사실과 다르다는 것을 보여 줄 자료가 부족해, 대응을 미루고 있습니다.
  - `r3_bk_no_response` — 상대방이 연락을 피하거나 답이 없어, 다음 단계로 넘어가지 못하고 있습니다.

### re03_final_goal
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `r3_gl_keep_living` — 계약을 그대로 유지하고, 남은 계약 기간 동안 그 집에서 계속 살고 싶습니다.
  - `r3_gl_leave_settle_money` — 나가는 것은 받아들이되, 보증금과 남은 금액을 정확히 정리하고 나가고 싶습니다.
  - `r3_gl_leave_no_penalty` — 계약을 끝내되, 위약금이나 손해배상 없이 정리하고 싶습니다.
  - `r3_gl_recover_house` — 집주인으로서 계약을 정리하고, 집을 비워 돌려받고 싶습니다.

---

## 결과 신호

### 위험 신호 선택지 → 결과 화면 위험 문장 / 판정 단계

**전문가 권장 (일반 퍼널 대신 "VFBCAI 전문가팀 진행" 안내 대상)**
- `r3_oc_locked_out` — 계약 분쟁 중에 출입이나 전기·수도가 막힌 상태여서, 생활과 짐을 지키기 위한 대응을 서둘러 확인해야 합니다.
- `r3_oc_belongings_threat` — 짐을 밖으로 내놓겠다는 말을 들은 상태여서, 그 날짜 전에 대응 방법을 확인하는 것이 좋습니다.
- `r3_cr_legal_threat` — 상대방이 법원이나 공안 절차를 언급했거나 시작한 상태여서, 혼자 답하기 전에 전문가 확인이 필요합니다.
- `r3_ow_bank_issue` — 집이 은행 담보 문제로 넘어갈 수 있다는 이야기가 있어, 보증금과 거주 기간에 미치는 영향을 별도로 확인해야 합니다.
- `r3_role_subtenant` + (`r3_dm_terminate`|`r3_dm_vacate_date`) — 집주인과 직접 계약이 없는 상태에서 퇴거 통보를 받아, 원래 세입자·집주인 사이 계약까지 함께 확인해야 합니다(다수 당사자).

**주의**
- `r3_np_shorter` — 통보에서 준 기간이 계약서 조항보다 짧아 보여, 그 날짜를 그대로 따라야 하는지 확인이 필요합니다.
- `r3_md_immediate` — 날짜 없이 바로 나가라는 통보여서, 계약서와 법에서 정한 통지 기간을 먼저 확인해야 합니다.
- `r3_ds_forfeit` — 보증금을 전혀 돌려주지 않겠다는 이야기가 나온 상태여서, 계약서의 몰수 조항과 실제 위반 여부를 함께 확인해야 합니다.
- `r3_ds_deduct_no_list` — 공제 내역 없이 보증금 일부를 빼겠다고 해, 항목과 금액을 서면으로 받아 두는 것이 좋습니다.
- `r3_pc_amount_exceeds` — 요구 금액이 계약서 위약금 조항보다 큰 것으로 보여, 금액 계산 근거를 확인해야 합니다.
- `r3_pc_no_clause` — 계약서에 위약금 조항이 없는데 금액을 요구받아, 그 금액의 근거를 확인해야 합니다.
- `r3_pc_damage_claim` — 위약금 외에 손해배상까지 요구받아, 항목별로 실제 손해가 있는지 나누어 확인해야 합니다.
- `r3_ar_paid_not_counted` — 이미 보낸 임대료가 반영되지 않은 상태여서, 송금 내역으로 사실관계를 먼저 정리해야 합니다.
- `r3_fc_other_breached` / `r3_gp_counter_breach` — 상대방의 계약 위반이 통보에서 빠져 있어, 양쪽 위반 사실을 날짜순으로 정리해 둘 필요가 있습니다.
- `r3_cd_admit_ongoing` — 문제가 된 사용 방식이 지금도 이어지고 있어, 통보 내용이 그대로 인정될 가능성을 함께 봐야 합니다.
- `r3_ow_sale_buyer_wants_empty` / `r3_ow_own_use` — 계약 기간이 남은 상태에서 상대방 사정으로 나가 달라는 요구여서, 계약이 새 주인에게 이어지는지와 보상 조건을 확인해야 합니다.
- `r3_sd_broker` / `r3_sd_unknown` — 통보가 계약 상대방 본인의 뜻인지 확인되지 않아, 본인에게 직접 확인하는 것이 먼저입니다.
- `r3_ol_not_leaving` / `r3_ol_third_party` — 세입자가 나가지 않거나 다른 사람이 살고 있어, 집을 돌려받는 절차를 서두르기 전에 계약과 통지 기록을 먼저 정리해야 합니다.
- `r3_role_company_staff` — 계약 당사자가 회사여서, 회사가 상대방에게 어떻게 대응하고 있는지부터 확인해야 합니다.

**확인 필요**
- `r3_dm_unclear` — 상대방이 무엇을 요구하는지 정리되지 않아, 통보 원문부터 다시 확인해야 합니다.
- `r3_np_lang_unread` / `r3_md_lang_unclear` — 계약서나 통보가 베트남어라 핵심 조항과 날짜를 아직 확인하지 못했습니다.
- `r3_np_no_contract` — 계약서 사본이 없어, 통지 기간과 위약금 조건을 비교할 기준이 아직 없습니다.
- `r3_nf_oral` — 통보를 말로만 받아, 날짜와 요구 내용을 서면이나 메시지로 다시 받아 둘 필요가 있습니다.
- `r3_md_not_stated` — 퇴거 날짜가 정해지지 않아, 언제까지인지 상대방에게 확인해야 합니다.
- `r3_fc_cannot_compare` — 통보 내용과 실제를 아직 비교하지 못해, 자료를 모아 사실관계부터 정리해야 합니다.
- `r3_gp_no_proof_yet` / `r3_ev_none` — 실제와 다르다는 점을 보여 줄 자료가 아직 없어, 송금 내역과 메시지부터 모아야 합니다.
- `r3_pc_unknown` — 요구 금액의 계산 방법을 모르는 상태여서, 항목별 내역을 상대방에게 받아 둘 필요가 있습니다.
- `r3_cr_no_reply` / `r3_rd_via_broker` — 대응 내용이 상대방에게 전달됐는지 확인되지 않아, 직접 확인 기록을 남겨야 합니다.

판정 규칙: 전문가 권장 신호가 하나라도 있으면 "전문가 권장", 주의 신호 2개 이상이면 "주의", 그 외는 "확인 필요"로 표시한다. 결과 문장은 법적 결과를 단정하지 않고 "~확인이 필요합니다 / ~가능성을 함께 봐야 합니다"로 끝낸다.

### 1차 결과 "핵심 확인 결과" 3칸 문장 규칙
- **상황**: `re03_my_role` + `re03_demand_type`를 한 문장으로 합친다. 형식: "[역할]로서 상대방에게서 [요구 내용] 통보를 받은 상황입니다."
  - 역할: r3_role_tenant "임차인", r3_role_company_staff "회사 명의 계약의 거주자", r3_role_subtenant "원래 세입자에게서 다시 빌린 거주자", r3_role_landlord "집주인", r3_role_proxy "계약 당사자를 대신해 확인하는 분"
  - 요구 내용: r3_dm_fix_breach "기간 내 시정 요구", r3_dm_terminate "계약 해지", r3_dm_vacate_date "날짜를 정한 퇴거", r3_dm_money_claim "위약금·손해배상 요구", r3_dm_unclear "요구 내용이 분명하지 않은"
- **확인 목표**: `re03_confirm_goal`을 한 문장으로 바꾼다.
  - r3_cg_validity "통보가 계약서 조항과 통지 기간에 맞는지 확인하는 것이 먼저입니다."
  - r3_cg_move_timing "집을 비워야 하는 시점과 그 전에 할 일을 확인하는 것이 먼저입니다."
  - r3_cg_money "보증금 정리와 위약금·손해배상 여부를 확인하는 것이 먼저입니다."
  - r3_cg_fact_gap "통보 사유 중 사실과 다른 부분을 정리하는 것이 먼저입니다."
  - r3_cg_order "무엇부터 진행할지 순서를 정하는 것이 먼저입니다."
- **대응·자료**: `re03_response_status`를 한 문장으로 바꾸고, 대응이 있었으면 "그 기록을 남겨 두는 것이 중요합니다."를 붙인다.
  - r3_rs_none "아직 상대방에게 답하지 않은 상태로, 답하기 전에 계약서와 통보 원문을 나란히 확인하는 것이 좋습니다."
  - r3_rs_inquired "이유를 물어본 상태로, 상대방의 답을 서면이나 메시지로 받아 두는 것이 좋습니다."
  - r3_rs_disputed "사실과 다르다고 말한 상태로, 이를 뒷받침할 송금 내역·메시지·사진을 모아야 합니다."
  - r3_rs_complied_part "요구 일부를 이행한 상태로, 이행한 날짜와 내용을 보여 줄 기록이 필요합니다."
  - r3_rs_negotiating "조건을 협의 중인 상태로, 합의한 날짜와 금액은 반드시 서면으로 남겨야 합니다."

### "지금 확인해 보세요" STEP 3개
1. **계약서와 통보를 나란히 놓고 비교하기** — 계약서에서 해지 사유·통지 기간·위약금·보증금 반환 조항을 찾아, 통보에 적힌 날짜와 요구가 그 조항과 맞는지 표시해 보세요. 베트남어 계약서라면 해당 조항만이라도 번역해 두세요.
2. **사실을 보여 줄 자료를 날짜순으로 모으기** — 통보 원본이나 메시지 캡처, 임대료·관리비 송금 내역, 상대방·중개인과 주고받은 대화, 입주 때와 지금의 집 상태 사진을 한곳에 모아 날짜순으로 정리해 두세요.
3. **답변과 합의는 기록이 남는 방법으로 하기** — 상대방에게 답하거나 날짜·금액을 합의할 때는 서면이나 메시지로 남기고, 집을 비우게 된다면 보증금 정리 내용·집 상태 확인·열쇠 반납을 기록으로 남긴 뒤, 새 주소에서 임시거주 신고(공안)를 다시 해야 하는지도 확인해 두세요.


---

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
  - `r4_it_repair_refused` — 누수·전기·에어컨·온수기 같은 설비가 고장 났는데, 상대방이 수리해 주지 않거나 계속 미루고 있습니다.
  - `r4_it_prior_defect_blamed` — 입주하기 전부터 있던 하자인데, 상대방이 제가 망가뜨렸다며 수리비나 책임을 저에게 넘기고 있습니다.
  - `r4_it_fee_dispute` — 관리비·전기·수도 요금의 금액이 이상하거나, 누가 내야 하는지를 두고 상대방과 다투고 있습니다.
  - `r4_it_neighbor_management` — 이웃이나 관리사무소 문제로 생활이 어려운데, 집주인은 계약과 관계없다며 해결하지 않고 있습니다.
  - `r4_it_landlord_entry` — 집주인이나 중개인이 미리 알리지 않고 집에 들어왔거나, 원할 때 들어오겠다고 요구하고 있습니다.

### re04_since_when
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 문제는 언제부터 이어지고 있나요?
- 선택지:
  - `r4_sw_within_week` — 1주일 안쪽에 처음 생긴 문제이고, 아직 상대방에게 한두 번 말해 본 정도입니다.
  - `r4_sw_within_month` — 몇 주 전부터 이어지고 있고, 여러 번 말했지만 아직 해결되지 않았습니다.
  - `r4_sw_over_month` — 한 달 넘게 계속되고 있고, 그동안 생활의 불편이나 비용이 쌓이고 있습니다.
  - `r4_sw_since_movein` — 입주할 때부터 있던 문제이고, 처음부터 계속 말해 왔지만 그대로입니다.
  - `r4_sw_recurring` — 한 번 고쳤거나 정리되었는데, 얼마 지나지 않아 같은 문제가 다시 생겼습니다.

### re04_notify_status
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 문제를 상대방에게 어떻게 알리셨나요?
- 선택지:
  - `r4_nt_not_told` — 아직 상대방에게 정식으로 알리지 않았고, 사진이나 기록만 모아 두었습니다.
  - `r4_nt_verbal_only` — 전화하거나 직접 만나서 말로만 알렸고, 따로 남아 있는 기록은 없습니다.
  - `r4_nt_message_sent` — 잘로(Zalo)·카카오톡·이메일 등 메시지로 알렸고, 보낸 기록이 날짜와 함께 남아 있습니다.
  - `r4_nt_formal_request` — 문제 내용과 해결 기한을 적어, 서면이나 이메일로 정식으로 요청했습니다.
  - `r4_nt_via_agent` — 중개인이나 관리사무소를 통해 전달했고, 상대방에게 직접 말하지는 않았습니다.

### re04_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `r4_cg_who_responsible` — 이 문제를 고치거나 비용을 내야 하는 쪽이 누구인지, 계약서 기준으로 확인하고 싶습니다.
  - `r4_cg_how_to_request` — 상대방에게 어떤 방법과 내용으로 요구해야 기록이 남고 효과가 있는지 확인하고 싶습니다.
  - `r4_cg_self_repair_cost` — 제가 먼저 고치거나 낸 비용을, 월세나 보증금에서 정산받을 수 있는지 확인하고 싶습니다.
  - `r4_cg_deposit_risk` — 이 문제 때문에 나중에 보증금을 돌려받지 못하거나, 계약이 끝날 위험이 있는지 확인하고 싶습니다.
  - `r4_cg_order_unsure` — 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.

---

## 2차 (phase 2)

### A. 문제 유형별 상세 (re04_issue_type 값에 따라 1개만 노출)

### re04_repair_detail
- phase: 2 / kind: single / show_if: re04_issue_type = r4_it_repair_refused
- 질문: 고장 난 곳은 어디이고, 지금 어떤 상태인가요?
- 선택지:
  - `r4_rd_water_leak` — 천장·벽·배관에서 물이 새고 있고, 곰팡이나 가구 손상까지 생기고 있습니다.
  - `r4_rd_electric_fault` — 차단기가 자주 내려가거나 콘센트·조명이 작동하지 않아, 감전이나 화재가 걱정됩니다.
  - `r4_rd_aircon_heater` — 에어컨이나 온수기가 고장 나서, 냉방이나 온수를 전혀 쓰지 못하고 있습니다.
  - `r4_rd_door_window` — 출입문 잠금장치나 창문·방범창이 고장 나, 문단속이 제대로 되지 않습니다.
  - `r4_rd_included_appliance` — 계약에 포함된 냉장고·세탁기·가구가 고장 났고, 수리나 교체를 요청한 상태입니다.

### re04_defect_claim
- phase: 2 / kind: single / show_if: re04_issue_type = r4_it_prior_defect_blamed
- 질문: 상대방은 어떤 하자를 제 책임이라고 말하고 있나요?
- 선택지:
  - `r4_dc_surface_damage` — 벽·바닥·문에 원래 있던 흠집이나 얼룩을, 제가 살면서 생긴 것이라고 합니다.
  - `r4_dc_equipment_breakdown` — 처음부터 상태가 좋지 않던 설비가 고장 나자, 제가 잘못 써서 망가졌다고 합니다.
  - `r4_dc_mold_leak` — 입주 전부터 있던 누수나 곰팡이를, 제가 환기나 관리를 하지 않아 생겼다고 합니다.
  - `r4_dc_missing_items` — 처음부터 없던 비품이나 물건을, 제가 사용하다가 잃어버렸다고 합니다.
  - `r4_dc_deposit_deduction` — 이 하자 비용을 계약이 끝날 때 보증금에서 빼겠다고 이미 말했습니다.

### re04_fee_detail
- phase: 2 / kind: single / show_if: re04_issue_type = r4_it_fee_dispute
- 질문: 어떤 요금이, 어떤 점에서 문제가 되고 있나요?
- 선택지:
  - `r4_fd_electric_rate` — 전기요금이 전력회사 청구 금액보다 높은 단가로 계산되어 청구되고 있습니다.
  - `r4_fd_payer_shift` — 계약상 집주인이 내기로 한 관리비나 요금을, 저에게 내라고 요구하고 있습니다.
  - `r4_fd_unilateral_increase` — 계약 기간 중인데, 관리비나 요금 단가를 미리 합의 없이 올렸습니다.
  - `r4_fd_prior_arrears` — 집주인이나 전 세입자가 밀린 요금 때문에, 전기·수도가 끊기거나 끊긴다는 안내를 받았습니다.
  - `r4_fd_no_breakdown` — 매달 금액만 통보받고, 계량기 수치나 청구서 원본은 받지 못하고 있습니다.

### re04_neighbor_detail
- phase: 2 / kind: single / show_if: re04_issue_type = r4_it_neighbor_management
- 질문: 이웃이나 관리사무소와 관련해 어떤 일이 이어지고 있나요?
- 선택지:
  - `r4_nd_upstairs_leak` — 위층이나 옆집에서 물이 새어 들어오는데, 집주인과 그 집이 서로 책임을 미루고 있습니다.
  - `r4_nd_noise_smell` — 이웃의 소음·담배 냄새·공사가 계속되는데, 관리사무소에 말해도 달라지지 않습니다.
  - `r4_nd_management_restriction` — 관리사무소가 출입카드·주차·이사·택배 등을 막거나 제한하고 있습니다.
  - `r4_nd_common_facility` — 엘리베이터·공용 배관·주차장 같은 공용 시설 고장으로, 생활에 계속 지장이 있습니다.
  - `r4_nd_condition_mismatch` — 계약할 때 설명받은 건물 조건과 실제가 달라 집주인에게 말했지만, 건물 문제라며 관여하지 않습니다.

### re04_entry_detail
- phase: 2 / kind: single / show_if: re04_issue_type = r4_it_landlord_entry
- 질문: 집주인이나 중개인의 출입은 어떻게 이루어졌나요?
- 선택지:
  - `r4_ed_entered_absent` — 제가 없을 때 알리지 않고 들어왔고, 물건이 옮겨져 있거나 들어온 흔적이 남아 있었습니다.
  - `r4_ed_entered_present` — 미리 연락 없이 찾아와, 제가 있는 상태에서 동의 없이 집 안으로 들어왔습니다.
  - `r4_ed_viewing_demand` — 집을 팔거나 다음 세입자를 구한다며, 집을 보여 달라는 요구를 자주 하고 있습니다.
  - `r4_ed_key_retained` — 집주인이 열쇠나 비밀번호를 그대로 가지고 있고, 제가 바꾸지 못하게 하고 있습니다.
  - `r4_ed_unilateral_device` — 집 안이나 현관에 카메라를 달거나 잠금장치를 바꾸는 등, 저와 상의 없이 조치했습니다.

### B. 계약 조항 (근거)

### re04_contract_clause
- phase: 2 / kind: single / show_if: 항상
- 질문: 임대차 계약서에는 이 문제(수리·하자·관리비·요금·출입)에 대해 어떻게 적혀 있나요?
- 선택지:
  - `r4_cl_landlord_clear` — 서면 계약서에, 이 문제는 집주인이 책임지거나 부담한다고 분명히 적혀 있습니다.
  - `r4_cl_tenant_clear` — 서면 계약서에, 이 문제는 임차인이 부담한다고 적혀 있어 제가 불리할 수 있습니다.
  - `r4_cl_vague` — 관련 조항은 있지만, '작은 수리'·'정상적인 사용'처럼 기준이 애매하게 적혀 있습니다.
  - `r4_cl_absent` — 계약서는 있지만, 이 문제에 대한 내용은 없거나 아직 찾지 못했습니다.
  - `r4_cl_cannot_check` — 계약서가 베트남어로만 되어 있거나 사본이 없어, 해당 조항을 직접 확인하지 못했습니다.

### re04_contract_access
- phase: 2 / kind: single / show_if: re04_contract_clause = r4_cl_cannot_check
- 질문: 계약서 내용을 직접 확인하지 못하는 이유는 무엇인가요?
- 선택지:
  - `r4_ca_vn_only` — 계약서는 가지고 있지만, 베트남어로만 되어 있어 조항을 읽지 못했습니다.
  - `r4_ca_company_lease` — 회사 명의로 계약해서, 저는 실제로 사는 사람이지만 계약서는 회사 담당자만 가지고 있습니다.
  - `r4_ca_no_copy` — 서명은 했지만 사본을 받지 못했고, 원본(공증본 포함)은 집주인이나 중개인만 가지고 있습니다.
  - `r4_ca_verbal_only` — 정식 계약서 없이, 메시지나 말로만 월세와 조건을 정했습니다.
  - `r4_ca_sublease` — 원래 임차인에게서 다시 빌린 집이라, 집주인과 맺은 계약서는 본 적이 없습니다.

### C. 상대방 반응 (요청 → 응답 루프)

### re04_not_told_reason
- phase: 2 / kind: single / show_if: re04_notify_status = r4_nt_not_told
- 질문: 아직 상대방에게 정식으로 알리지 않은 이유는 무엇인가요?
- 선택지:
  - `r4_ntr_fear_relation` — 관계가 나빠지거나 계약에 불이익이 생길까 봐, 말을 꺼내지 못하고 있습니다.
  - `r4_ntr_who_to_contact` — 집주인·중개인·관리사무소 중 누구에게 말해야 하는지 몰라 미루고 있습니다.
  - `r4_ntr_language` — 베트남어로 어떻게 설명하고 요구해야 할지 몰라, 아직 연락하지 못했습니다.
  - `r4_ntr_collecting_first` — 먼저 사진과 자료를 모은 뒤, 한 번에 정리해서 알리려고 준비하고 있습니다.

### re04_other_response
- phase: 2 / kind: single / show_if: re04_notify_status = r4_nt_verbal_only|r4_nt_message_sent|r4_nt_formal_request|r4_nt_via_agent
- 질문: 알린 뒤, 상대방은 어떻게 반응했나요?
- 선택지:
  - `r4_or_agreed_stalled` — 해결하겠다고 말은 했지만, 날짜를 정하지 않은 채 지금까지 그대로입니다.
  - `r4_or_partial_offer` — 비용 일부만 부담하겠다거나, 제가 먼저 고치면 나중에 정산해 주겠다고 말로만 했습니다.
  - `r4_or_refused_blame` — 자기 책임이 아니라며 거절했고, 오히려 저에게 비용이나 책임을 넘기고 있습니다.
  - `r4_or_counter_threat` — 계속 문제 삼으면 계약을 끝내거나 보증금을 돌려주지 않겠다는 말을 했습니다.
  - `r4_or_silent_or_relay` — 답이 없거나, 중개인·관리사무소가 전달했다고만 하고 상대방의 답은 듣지 못했습니다.

### re04_threat_detail
- phase: 2 / kind: single / show_if: re04_other_response = r4_or_counter_threat
- 질문: 상대방은 구체적으로 무엇을 하겠다고 했나요?
- 선택지:
  - `r4_td_vacate_early` — 계약 기간이 남았는데, 정해진 날까지 집을 비우라고 했습니다.
  - `r4_td_keep_deposit` — 계약이 끝나면 보증금의 일부나 전부를 돌려주지 않겠다고 했습니다.
  - `r4_td_raise_or_no_renew` — 다음 달부터 월세를 올리거나, 계약이 끝나면 재계약하지 않겠다고 했습니다.
  - `r4_td_cut_utilities` — 전기·수도·인터넷을 끊거나, 출입카드를 막겠다고 했고 일부는 이미 실행했습니다.
  - `r4_td_residence_registration` — 임시거주 신고를 해 주지 않거나, 이미 한 신고를 정리하겠다고 했습니다.

### re04_fact_compare
- phase: 2 / kind: single / show_if: re04_other_response = r4_or_refused_blame|r4_or_counter_threat
- 질문: 상대방이 주장하는 내용은 실제 있었던 일과 비교하면 어떤가요?
- 선택지:
  - `r4_fc_mostly_true` — 상대방 말이 대체로 맞고, 저에게도 일부 책임이 있다고 생각합니다.
  - `r4_fc_partly_true` — 일부는 맞지만, 원인이나 생긴 시점, 금액이 실제와 다르게 말하고 있습니다.
  - `r4_fc_false_with_proof` — 상대방 주장은 실제와 크게 다르고, 이를 보여 줄 날짜 있는 기록이 있습니다.
  - `r4_fc_false_no_proof` — 상대방 주장은 실제와 다르지만, 이를 보여 줄 기록이 부족합니다.
  - `r4_fc_no_specific_claim` — 상대방이 구체적인 이유 없이 거절만 하고 있어, 비교할 내용이 없습니다.

### D. 유형별 근거·비용·영향

### re04_handover_record
- phase: 2 / kind: single / show_if: re04_issue_type = r4_it_prior_defect_blamed
- 질문: 입주할 때 집 상태는 어떻게 기록해 두셨나요?
- 선택지:
  - `r4_hr_signed_checklist` — 집 상태와 비품을 적은 인수인계서(체크리스트)에 저와 상대방이 함께 서명했습니다.
  - `r4_hr_dated_photos_only` — 서명한 문서는 없지만, 입주하던 날 찍은 날짜 있는 사진·영상이 남아 있습니다.
  - `r4_hr_item_list_only` — 비품 목록은 계약서에 있지만, 하자나 상태에 대해서는 적혀 있지 않습니다.
  - `r4_hr_told_verbally` — 입주할 때 하자를 말로만 알렸고, 따로 남긴 기록은 없습니다.
  - `r4_hr_no_record` — 입주할 때 집 상태를 따로 기록하거나 확인하지 않았습니다.

### re04_self_repair
- phase: 2 / kind: single / show_if: re04_issue_type = r4_it_repair_refused
- 질문: 문제를 해결하려고 직접 비용을 쓴 적이 있나요?
- 선택지:
  - `r4_sr_paid_with_receipt` — 제가 먼저 수리업체를 불러 고쳤고, 영수증이나 송금 내역이 남아 있습니다.
  - `r4_sr_paid_no_receipt` — 제가 먼저 고쳤지만, 현금으로 줘서 영수증은 받지 못했습니다.
  - `r4_sr_paid_no_consent` — 상대방의 동의 없이 고쳤고, 상대방은 그 비용을 인정하지 않고 있습니다.
  - `r4_sr_quote_only` — 아직 고치지 않았고, 수리업체에서 견적만 받아 두었습니다.
  - `r4_sr_not_spent` — 아직 제가 직접 쓴 비용은 없고, 상대방이 고쳐 주기를 기다리고 있습니다.

### re04_self_repair_amount
- phase: 2 / kind: text / show_if: re04_self_repair = r4_sr_paid_with_receipt|r4_sr_paid_no_receipt|r4_sr_paid_no_consent|r4_sr_quote_only
- 질문: 지금까지 쓴 비용이나 받은 견적의 날짜·금액·내역을 적어 주세요.
- placeholder: 예: 2026-09-12 욕실 배관 누수 수리 1,500,000동(영수증 있음) / 곰팡이 제거 견적 800,000동, 집주인에게 잘로로 사진과 함께 보냄

### re04_fee_amount
- phase: 2 / kind: text / show_if: re04_issue_type = r4_it_fee_dispute
- 질문: 문제가 되는 요금의 이름과 청구된 금액, 계약서에 적힌 기준을 적어 주세요.
- placeholder: 예: 전기요금 kWh당 4,000동으로 계산되어 9월분 2,800,000동 청구됨 / 계약서에는 '전력회사 청구 금액 기준'이라고 적혀 있음

### re04_living_impact
- phase: 2 / kind: single / show_if: re04_issue_type = r4_it_neighbor_management|r4_it_landlord_entry
- 질문: 이 문제가 지금 생활에 어느 정도 영향을 주고 있나요?
- 선택지:
  - `r4_li_minor` — 불편하지만, 지금 생활하는 데 큰 지장은 없습니다.
  - `r4_li_partial_use` — 방이나 욕실·주방 일부를 쓰지 못하거나, 집에 있는 시간을 줄일 정도로 생활이 바뀌었습니다.
  - `r4_li_safety_privacy` — 안전이나 사생활이 걱정되어, 혼자 있거나 물건을 두고 나가기가 불안합니다.
  - `r4_li_belongings_damaged` — 제 가구·전자제품·옷 같은 물건이 손상되었거나, 없어진 것이 있습니다.
  - `r4_li_staying_elsewhere` — 계속 살기 어려워, 임시로 다른 곳에 머물고 있거나 이사를 고민하고 있습니다.

### E. 월세 보류 위험

### re04_rent_status
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 문제가 생긴 뒤, 월세와 요금은 어떻게 내고 있나요?
- 선택지:
  - `r4_rs_paying_normal` — 문제와 별개로, 월세와 요금은 계약대로 계속 내고 있습니다.
  - `r4_rs_withholding` — 상대방이 해결할 때까지, 월세나 요금의 일부 또는 전부를 내지 않고 있습니다.
  - `r4_rs_deducted_cost` — 제가 쓴 수리비나 잘못 청구된 금액을 빼고, 남은 금액만 월세로 보냈습니다.
  - `r4_rs_considering_withhold` — 아직 내고 있지만, 해결되지 않으면 월세를 멈추려고 생각하고 있습니다.
  - `r4_rs_payment_refused` — 상대방이 제 송금을 받지 않거나, 계약과 다른 금액을 내라고 요구하고 있습니다.

### re04_withhold_notice
- phase: 2 / kind: single / show_if: re04_rent_status = r4_rs_withholding|r4_rs_deducted_cost
- 질문: 월세를 멈추거나 금액을 뺀 사실을 상대방에게 어떻게 알리셨나요?
- 선택지:
  - `r4_wn_agreed_in_writing` — 상대방과 미리 합의했고, 그 합의가 메시지나 서면으로 남아 있습니다.
  - `r4_wn_notified_no_consent` — 이유와 금액을 메시지로 알렸지만, 상대방은 동의하지 않았거나 답이 없습니다.
  - `r4_wn_not_notified` — 따로 알리지 않고, 월세만 덜 보내거나 보내지 않았습니다.
  - `r4_wn_landlord_objected` — 상대방이 이를 연체라고 하며, 계약 해지나 보증금 공제를 언급했습니다.

### F. 기한

### re04_deadline
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 문제와 관련해 정해진 날짜나 다가오는 기한이 있나요?
- 선택지:
  - `r4_dl_promised_date` — 상대방이 수리하거나 정산하겠다고 약속한 날짜가 있고, 그 약속이 기록으로 남아 있습니다.
  - `r4_dl_utility_cutoff` — 요금을 정리하지 않으면 전기·수도가 끊긴다고 안내받은 날짜가 있습니다.
  - `r4_dl_contract_end` — 계약 만료일이 다가오고 있어, 그 전에 이 문제와 보증금 정산을 정리해야 합니다.
  - `r4_dl_vacate_demand` — 상대방이 정한 날짜까지 집을 비우라고 요구하고 있습니다.
  - `r4_dl_none` — 정해진 날짜는 없지만, 시간이 지날수록 문제가 커지고 있습니다.

### re04_deadline_date
- phase: 2 / kind: text / show_if: re04_deadline = r4_dl_promised_date|r4_dl_utility_cutoff|r4_dl_contract_end|r4_dl_vacate_demand
- 질문: 그 날짜와, 그날까지 무엇을 해야 하는지 적어 주세요.
- placeholder: 예: 2026-10-20까지 집주인이 에어컨을 고쳐 주기로 잘로로 약속함 / 계약 만료일 2026-11-30

### G. 자료·막힌 이유·최종 목표

### re04_evidence
- phase: 2 / kind: multi / show_if: 항상
- 질문: 현재 보관하고 있어 바로 확인할 수 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `r4_ev_dated_photos` — 문제 상태를 찍은 날짜 있는 사진·영상(입주 당시 사진 포함)
  - `r4_ev_messages` — 상대방·중개인·관리사무소와 주고받은 잘로·카카오톡·이메일 메시지
  - `r4_ev_receipts_bills` — 수리비 영수증, 관리비·전기·수도 청구서, 송금 내역
  - `r4_ev_contract_handover` — 임대차 계약서와 인수인계서(비품·상태 목록) 사본
  - `r4_ev_none` — 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.

### re04_blockage
- phase: 2 / kind: single / show_if: 항상
- 질문: 현재 이 문제가 해결되지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `r4_bk_responsibility_unclear` — 누가 고치거나 비용을 내야 하는지 기준이 분명하지 않아, 서로 미루고만 있습니다.
  - `r4_bk_no_proof` — 입주 당시 상태나 문제가 생긴 시점을 보여 줄 기록이 부족해, 제 주장을 뒷받침하지 못하고 있습니다.
  - `r4_bk_contact_blocked` — 상대방과 연락이 잘 닿지 않거나, 중개인·관리사무소가 중간에서 말을 제대로 전하지 않습니다.
  - `r4_bk_fear_retaliation` — 강하게 요구하면 계약 해지나 보증금 문제가 생길까 봐, 요구를 망설이고 있습니다.
  - `r4_bk_language_barrier` — 계약서나 상대방의 답변이 베트남어라, 정확히 이해하거나 제 입장을 설명하지 못하고 있습니다.

### re04_final_goal
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `r4_fg_repair_and_stay` — 상대방이 비용을 부담해 수리를 마치게 하고, 계약 기간 동안 계속 살고 싶습니다.
  - `r4_fg_cost_settled` — 제가 쓴 비용이나 잘못 청구된 요금을 정산받고, 그 결과를 기록으로 남기고 싶습니다.
  - `r4_fg_deposit_protected` — 이 문제가 나중에 보증금 공제나 하자 책임으로 이어지지 않도록 지금 정리해 두고 싶습니다.
  - `r4_fg_rules_in_writing` — 수리 방법·요금 기준·출입 방법을 상대방과 서면으로 다시 합의하고 싶습니다.
  - `r4_fg_exit_with_deposit` — 더 이상 살기 어려워, 보증금을 돌려받고 계약을 정리한 뒤 나가고 싶습니다.

---

## 결과 신호

### 위험 신호 선택지와 결과 화면 문장

| 선택지 | 결과 화면 위험 문장 | 판정 단계 |
|---|---|---|
| `re04_notify_status = r4_nt_verbal_only` | 지금까지 말로만 알려, 언제 무엇을 요청했는지 보여 줄 기록이 없습니다. | 확인 필요 |
| `re04_notify_status = r4_nt_via_agent` / `re04_other_response = r4_or_silent_or_relay` | 중개인이나 관리사무소를 거친 요청은 상대방에게 실제로 전달되었는지 확인되지 않습니다. | 확인 필요 |
| `re04_since_when = r4_sw_over_month` / `r4_sw_recurring` | 문제가 오래 이어지거나 반복되고 있어, 손상과 비용이 더 커지기 전에 요청 기록을 정리해야 합니다. | 주의 |
| `re04_repair_detail = r4_rd_electric_fault` / `r4_rd_door_window` | 전기·문단속 문제는 안전과 직결되므로, 수리 책임을 따지기 전에 위험부터 막을 방법을 확인해야 합니다. | 주의 |
| `re04_defect_claim = r4_dc_deposit_deduction` | 상대방이 이미 보증금 공제를 예고해, 계약 종료 전에 하자 책임을 정리하지 않으면 정산 때 다툼이 커질 수 있습니다. | 주의 |
| `re04_handover_record = r4_hr_told_verbally` / `r4_hr_no_record` | 입주 당시 상태 기록이 없어, 기존 하자였다는 점을 다른 자료로 보완해야 합니다. | 주의 |
| `re04_contract_clause = r4_cl_tenant_clear` | 계약서에 임차인 부담으로 적혀 있어, 해당 조항이 이번 문제에 그대로 적용되는지 확인이 필요합니다. | 확인 필요 |
| `re04_contract_access = r4_ca_verbal_only` / `r4_ca_no_copy` | 계약 내용을 서면으로 확인할 수 없어, 메시지와 송금 내역으로 계약 조건을 다시 정리해야 합니다. | 주의 |
| `re04_contract_access = r4_ca_sublease` | 집주인과 직접 계약하지 않은 재임대 관계라, 누구에게 책임을 물을 수 있는지 먼저 정리해야 합니다. | 전문가 권장 |
| `re04_fee_detail = r4_fd_electric_rate` / `r4_fd_unilateral_increase` | 청구된 단가나 인상분이 계약서 기준과 맞는지, 근거 자료로 비교해 봐야 합니다. | 확인 필요 |
| `re04_fee_detail = r4_fd_prior_arrears` / `re04_threat_detail = r4_td_cut_utilities` | 전기·수도가 끊기면 생활이 바로 막히므로, 끊기기 전에 대응 순서를 정해야 합니다. | 전문가 권장 |
| `re04_self_repair = r4_sr_paid_no_receipt` / `r4_sr_paid_no_consent` | 영수증이나 사전 동의가 없는 수리비는 정산을 요구할 때 근거가 약해질 수 있습니다. | 주의 |
| `re04_rent_status = r4_rs_withholding` / `r4_rs_deducted_cost` | 계약 근거나 합의 없이 월세를 멈추거나 빼면, 상대방이 연체를 이유로 계약 해지나 보증금 공제를 주장할 수 있습니다. | 전문가 권장 |
| `re04_rent_status = r4_rs_considering_withhold` | 월세를 멈추기 전에, 계약서와 요청 기록으로 정산 방법을 먼저 확인하는 것이 안전합니다. | 주의 |
| `re04_withhold_notice = r4_wn_not_notified` / `r4_wn_landlord_objected` | 월세를 덜 보낸 이유가 기록으로 남아 있지 않아, 단순 연체로 받아들여질 수 있습니다. | 전문가 권장 |
| `re04_other_response = r4_or_counter_threat` | 상대방이 계약 해지나 보증금을 언급하고 있어, 대응 문장과 순서를 신중하게 정해야 합니다. | 주의 |
| `re04_threat_detail = r4_td_vacate_early` / `re04_deadline = r4_dl_vacate_demand` | 계약 기간 중 집을 비우라는 요구는 계약서의 해지 조항과 함께 확인해야 하며, 날짜 전에 대응해야 합니다. | 전문가 권장 |
| `re04_threat_detail = r4_td_residence_registration` | 임시거주 신고는 체류와 연결되므로, 상대방이 신고를 거부하거나 정리하기 전에 확인이 필요합니다. | 전문가 권장 |
| `re04_entry_detail = r4_ed_entered_absent` / `r4_ed_unilateral_device` | 동의 없는 출입이나 장치 설치가 반복되면, 날짜별 기록을 남기고 출입 규칙을 서면으로 정해야 합니다. | 주의 |
| `re04_living_impact = r4_li_belongings_damaged` | 제 물건의 손상은 수리 책임과 별도로 금액과 사진을 정리해 두어야 합니다. | 확인 필요 |
| `re04_living_impact = r4_li_staying_elsewhere` | 집을 떠나 있는 동안의 월세와 비용 부담은 계약 정리 방법과 함께 확인해야 합니다. | 주의 |
| `re04_fact_compare = r4_fc_false_no_proof` / `re04_evidence = r4_ev_none` | 상대방 주장과 다르다는 점을 보여 줄 자료가 부족해, 지금 남길 수 있는 기록부터 확보해야 합니다. | 주의 |

### 특수 사건 표시 (퍼널 진행 대신 "VFBCAI 전문가팀 진행" 안내)
- 직접 입력 등에서 이미 소송·조정이 진행 중이라고 확인된 경우
- `re04_entry_detail = r4_ed_entered_absent` 이면서 `re04_living_impact = r4_li_belongings_damaged`(물건이 없어짐·손상) — 형사 문제로 이어질 수 있는 출입
- `re04_contract_access = r4_ca_sublease`, 또는 `re04_neighbor_detail = r4_nd_upstairs_leak`처럼 집주인·이웃 세대 등 당사자가 여럿인 경우
- `re04_threat_detail = r4_td_cut_utilities`로 전기·수도가 이미 끊긴 경우

### 1차 결과 "핵심 확인 결과" 3칸 문장 규칙
- 상황: `re04_issue_type` + `re04_since_when`를 한 문장으로 연결한다. 형식: "[문제 유형 요약]이 [기간] 이어지고 있습니다." 예: "누수 수리를 집주인이 미루는 상황이 한 달 넘게 이어지고 있습니다." 법적 책임 판단은 쓰지 않는다.
- 확인 목표: `re04_confirm_goal`을 "~인지 확인합니다"로 바꾼다. 예: `r4_cg_self_repair_cost` → "먼저 쓴 수리비를 월세나 보증금에서 정산받을 수 있는지 확인합니다."
- 대응·자료: `re04_notify_status`로 지금 남아 있는 요청 기록의 수준을 쓰고, 다음에 남길 기록 한 가지를 붙인다. 예: `r4_nt_verbal_only` → "말로만 알린 상태이므로, 날짜와 사진을 붙인 메시지로 다시 요청해 기록을 남기는 것이 먼저입니다." / `r4_nt_formal_request` → "서면 요청 기록이 있으므로, 상대방의 답변과 약속 날짜를 함께 정리합니다."

### "지금 확인해 보세요" STEP 3개
1. STEP 1 — 날짜 있는 기록 모으기: 문제 상태 사진·영상, 입주 당시 사진, 상대방과 주고받은 메시지를 날짜 순서로 한곳에 모아 주세요.
2. STEP 2 — 계약서 조항 찾기: 계약서에서 수리·관리비·요금·출입·보증금 반환과 관련된 조항을 찾아 표시하고, 베트남어라면 해당 부분만 따로 사진으로 남겨 주세요.
3. STEP 3 — 월세는 그대로, 요청은 서면으로: 정산 방법이 확인되기 전까지 월세는 계약대로 보내고, 문제 내용·요청 사항·해결 희망 날짜를 적은 메시지를 상대방에게 직접 보내 기록을 남겨 주세요.

---

## 노드 수
- 1차: Q1(공용) + CASE 4개 = 5
- 2차: 23개 (항상 노출 6, 유형별 1개 노출 5, 조건부 후속 12)


---

# RE05 Content Pack — 매매·권리 서류 문제

- Q1(공용, 확정·수정 불가) 선택지: "집을 사는 과정에서 명의 이전이나 핑크북(토지사용권 증서) 같은 권리 서류에 문제가 생겼습니다."
- 용어 고정: 핑크북(토지사용권 증서) / 명의 이전 / 매도인 / 분양 회사 / 중개인 / 공증사무소 / 토지등록사무소 / 은행 담보 / 계약금(đặt cọc)·중도금·잔금 / 돈은 "지급", 세금만 "납부"
- value는 전체 질문에서 중복 없음(질문별 접두사 사용).
- 노드 수: 1차 4개(Q1 제외) + 2차 20개 = 24개. 경로별 기본 노출 2차 9문항 + 조건부 후속 0~4문항.

---

## 노드 표

### 1차 (phase 1)

#### re05_stage
- phase: 1 / kind: single / show_if: 항상
- 질문: 명의 이전이나 핑크북 서류에서 생긴 문제는 어떤 상황인가요?
- 선택지:
  - `r5_transfer_delay` — 매매 계약은 맺었지만, 약속한 시점이 되어도 제 이름으로 명의 이전이 끝나지 않고 있습니다.
  - `r5_project_book_pending` — 분양 아파트나 신축 주택을 샀지만, 약속한 시점이 지나도 핑크북이 발급되지 않고 있습니다.
  - `r5_book_mismatch` — 핑크북을 확인해 보니, 소유자 이름이나 면적이 계약 내용이나 실제 집과 다릅니다.
  - `r5_foreign_eligibility` — 외국인인 제가 이 집을 제 이름으로 소유할 수 있는지 확실하지 않아, 진행이 멈춰 있습니다.
  - `r5_registration_rejected` — 명의 이전이나 핑크북 발급을 신청했지만, 토지등록사무소에서 받아들이지 않는다는 통지를 받았습니다.

#### re05_paidStage
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 거래에서 지금까지 돈은 어디까지 지급하셨나요?
- 선택지:
  - `r5_paid_deposit` — 계약금(đặt cọc)만 지급했고, 중도금과 잔금은 아직 지급하지 않았습니다.
  - `r5_paid_interim` — 계약금과 중도금까지 지급했고, 잔금은 명의 이전이나 핑크북을 받을 때 지급하기로 했습니다.
  - `r5_paid_balance` — 잔금까지 모두 지급했지만, 아직 제 이름으로 권리가 넘어오지 않았습니다.
  - `r5_paid_via_broker` — 매도인이 아닌 중개인이나 지인 계좌로 돈을 보냈고, 매도인이 실제로 받았는지는 확인하지 못했습니다.
  - `r5_paid_nothing` — 아직 돈을 지급하지 않았고, 계약 전에 서류를 확인하고 있는 단계입니다.

#### re05_counterparty
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 거래의 상대방은 누구인가요?
- 선택지:
  - `r5_cp_individual_seller` — 핑크북을 가진 개인 매도인과 직접 계약했고, 지금도 매도인과 연락이 됩니다.
  - `r5_cp_developer` — 분양 회사와 직접 분양 계약을 맺었고, 회사 담당자를 통해 진행하고 있습니다.
  - `r5_cp_resale_buyer` — 먼저 분양받은 사람에게서 분양 계약을 넘겨받았고, 분양 회사와 직접 계약하지는 않았습니다.
  - `r5_cp_broker_only` — 중개인을 통해서만 진행했고, 매도인을 직접 만나거나 연락한 적은 없습니다.
  - `r5_cp_owner_unclear` — 계약은 했지만, 핑크북상 실제 권리자가 누구인지 확실하지 않습니다.

#### re05_confirmGoal
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `r5_cg_why_stuck` — 명의 이전이나 핑크북 발급이 왜 멈춰 있는지, 그 원인부터 확인하고 싶습니다.
  - `r5_cg_doc_valid` — 받은 핑크북이나 계약서가 진짜인지, 적힌 내용이 맞는지 확인하고 싶습니다.
  - `r5_cg_foreign_ok` — 외국인인 제가 이 집을 제 이름으로 소유할 수 있는지, 어떤 조건이 붙는지 확인하고 싶습니다.
  - `r5_cg_money_safe` — 이미 지급한 돈이 안전한지, 남은 돈을 계속 지급해도 되는지 확인하고 싶습니다.
  - `r5_cg_order` — 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.

---

### 2차 (phase 2) — 단계별 상세 (re05_stage에 따라 1개만 노출)

#### re05_transferDelayDetail
- phase: 2 / kind: single / show_if: re05_stage = r5_transfer_delay
- 질문: 명의 이전은 지금 어느 단계에서 멈춰 있나요?
- 선택지:
  - `r5_td_seller_docs` — 계약은 마쳤지만, 매도인이 핑크북 원본이나 신청에 필요한 서류를 아직 넘겨주지 않았습니다.
  - `r5_td_mortgage` — 매도인의 은행 담보가 아직 풀리지 않아, 명의 이전 신청을 하지 못하고 있습니다.
  - `r5_td_filed_waiting` — 토지등록사무소에 신청서는 접수되었지만, 안내받은 처리 기간이 지나도 결과가 나오지 않았습니다.
  - `r5_td_tax_stage` — 세금 납부 안내까지 받았지만, 누가 세금을 납부할지 정리되지 않아 멈춰 있습니다.
  - `r5_td_stage_unknown` — 절차를 매도인이나 중개인이 맡고 있어, 지금 어느 단계인지 알지 못합니다.

#### re05_projectBookDetail
- phase: 2 / kind: single / show_if: re05_stage = r5_project_book_pending
- 질문: 핑크북이 발급되지 않은 이유를 어떻게 안내받으셨나요?
- 선택지:
  - `r5_pb_not_applied` — 집은 인도받았지만, 분양 회사가 아직 핑크북 발급 신청을 하지 않았다고 합니다.
  - `r5_pb_project_legal` — 분양 회사가 프로젝트 전체의 법적 절차가 끝나지 않아 핑크북 발급이 늦어진다고 설명했습니다.
  - `r5_pb_project_mortgage` — 분양 회사가 프로젝트를 은행 담보로 잡혀 두었고, 그 담보가 풀려야 발급된다고 들었습니다.
  - `r5_pb_applied_no_proof` — 분양 회사는 이미 신청했다고 하지만, 접수증 같은 근거는 받지 못했습니다.
  - `r5_pb_last_payment_hold` — 마지막 잔금(약 5%)은 핑크북을 받을 때 지급하기로 했고, 발급 일정은 따로 안내받지 못했습니다.

#### re05_mismatchDetail
- phase: 2 / kind: multi / show_if: re05_stage = r5_book_mismatch
- 질문: 핑크북에서 계약 내용이나 실제 집과 다른 부분을 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `r5_mm_owner_name` — 소유자 이름(계약한 매도인과 다른 사람이거나, 공동 소유자가 더 있음)
  - `r5_mm_area` — 면적(계약서나 실제 집의 ㎡와 다름)
  - `r5_mm_address_use` — 주소·지번·호수, 또는 토지 용도·사용 기간
  - `r5_mm_forgery_suspect` — 핑크북 자체가 진짜가 아닐 수 있다는 말을 들음
  - `r5_mm_unsure` — 다르다는 말은 들었지만, 어느 부분인지 알지 못함

#### re05_foreignDetail
- phase: 2 / kind: single / show_if: re05_stage = r5_foreign_eligibility
- 질문: 외국인 소유 문제는 어떤 상황에서 생겼나요?
- 선택지:
  - `r5_fe_land_house` — 분양 프로젝트가 아닌, 땅이 딸린 단독주택이나 타운하우스를 사려고 했습니다.
  - `r5_fe_quota_full` — 분양 아파트인데, 그 건물에서 외국인이 살 수 있는 물량이 다 찼다는 말을 들었습니다.
  - `r5_fe_term_limit` — 소유는 가능하지만 기간이 50년으로 정해진다는 설명을 들었고, 그 조건을 아직 확인하지 못했습니다.
  - `r5_fe_nominee` — 외국인 명의가 어렵다고 해서, 베트남인 지인 이름으로 계약하거나 등록하려고 합니다.
  - `r5_fe_told_unclear` — 외국인은 안 된다는 말만 들었고, 정확한 이유는 설명받지 못했습니다.

#### re05_rejectionDetail
- phase: 2 / kind: single / show_if: re05_stage = r5_registration_rejected
- 질문: 토지등록사무소는 신청을 받아들이지 않는 이유를 어떻게 설명했나요?
- 선택지:
  - `r5_rj_docs_missing` — 서류가 빠졌거나 서류끼리 내용이 맞지 않는다며, 고칠 부분을 알려 주었습니다.
  - `r5_rj_foreign_status` — 외국인 명의로는 등록할 수 없는 집이라는 이유를 들었습니다.
  - `r5_rj_seller_side` — 매도인 쪽의 은행 담보·압류·분쟁 기록 때문에 명의 이전을 할 수 없다고 했습니다.
  - `r5_rj_no_reason` — 통지는 받았지만, 이유는 적혀 있지 않았습니다.
  - `r5_rj_not_understood` — 이유가 적혀 있지만, 베트남어나 법률 용어 때문에 이해하지 못했습니다.

---

### 2차 (phase 2) — 권리·금액·계약 확인

#### re05_paidAmount
- phase: 2 / kind: text / show_if: re05_paidStage = r5_paid_deposit|r5_paid_interim|r5_paid_balance|r5_paid_via_broker
- 질문: 지금까지 지급한 금액과 전체 매매 금액을 적어 주세요.
- placeholder: 예: 전체 매매 금액 35억 동 중 계약금 3억 5천만 동과 중도금 10억 동을 매도인 계좌로 송금했습니다.

#### re05_nameOnDocs
- phase: 2 / kind: single / show_if: re05_stage = r5_transfer_delay|r5_foreign_eligibility|r5_registration_rejected
- 질문: 핑크북과 매매계약서에는 각각 누구의 이름이 적혀 있나요?
- 선택지:
  - `r5_nm_match` — 핑크북의 소유자와 계약서의 매도인이 같은 사람이고, 신분증으로도 확인했습니다.
  - `r5_nm_family_coowner` — 핑크북에 매도인 외에 배우자나 가족도 함께 적혀 있는데, 계약서에는 매도인만 서명했습니다.
  - `r5_nm_proxy` — 핑크북 소유자는 따로 있고, 계약은 위임장을 가진 대리인과 맺었습니다.
  - `r5_nm_buyer_vn_name` — 계약서의 매수인이 제가 아니라 베트남인 지인 이름으로 되어 있습니다.
  - `r5_nm_not_seen` — 핑크북 원본이나 사본을 직접 보지 못해, 누구 이름인지 확인하지 못했습니다.

#### re05_mortgage
- phase: 2 / kind: single / show_if: re05_stage = r5_book_mismatch
- 질문: 이 집이 은행 담보로 잡혀 있는지 확인하셨나요?
- 선택지:
  - `r5_mg_none_confirmed` — 핑크북 뒷면 기재란이나 토지등록사무소 조회로, 담보가 없다는 것을 확인했습니다.
  - `r5_mg_release_planned` — 은행 담보가 있고, 제가 지급하는 잔금으로 담보를 풀기로 매도인과 약속했습니다.
  - `r5_mg_release_unclear` — 은행 담보가 있다고 들었지만, 언제 어떻게 풀리는지는 확인하지 못했습니다.
  - `r5_mg_paid_not_released` — 담보를 풀 돈을 이미 지급했지만, 은행에서 담보가 해제되었는지 확인되지 않습니다.
  - `r5_mg_unknown` — 담보 여부를 확인해 본 적이 없거나, 확인하는 방법을 모릅니다.

#### re05_promisedDate
- phase: 2 / kind: single / show_if: re05_stage = r5_transfer_delay|r5_project_book_pending
- 질문: 명의 이전이나 핑크북 발급은 언제까지 해 주기로 약속받으셨나요?
- 선택지:
  - `r5_pd_written_passed` — 계약서에 날짜가 적혀 있고, 그 날짜가 이미 지났습니다.
  - `r5_pd_written_upcoming` — 계약서에 날짜가 적혀 있고, 아직 그 날짜가 되지 않았습니다.
  - `r5_pd_verbal_passed` — 말이나 메시지로만 약속받았고, 그 시점이 이미 지났습니다.
  - `r5_pd_postponed` — 여러 차례 날짜를 다시 미루었고, 지금은 새 날짜도 정해지지 않았습니다.
  - `r5_pd_none` — 언제까지 해 주겠다는 약속은 받은 적이 없습니다.

#### re05_counterpartyExplanation
- phase: 2 / kind: single / show_if: re05_promisedDate = r5_pd_written_passed|r5_pd_verbal_passed|r5_pd_postponed
- 질문: 약속한 날짜가 지난 이유를 상대방은 어떻게 설명했나요?
- 선택지:
  - `r5_ex_procedure` — 기관 절차가 늦어지고 있을 뿐이라며, 조금 더 기다려 달라고 했습니다.
  - `r5_ex_tax_demand` — 명의 이전에 따른 세금을 제가 납부해야 진행된다며, 계약에 없던 금액을 요구했습니다.
  - `r5_ex_extra_cost` — 급행 비용이나 명목이 분명하지 않은 추가 비용을 내야 진행된다고 했습니다.
  - `r5_ex_no_explanation` — 이유를 설명하지 않거나, 연락을 피하고 있습니다.
  - `r5_ex_other_dispute` — 상속·이혼·채무 같은 다른 분쟁이 있어, 그 문제가 먼저 풀려야 한다고 했습니다.

#### re05_contractForm
- phase: 2 / kind: single / show_if: 항상
- 질문: 매매 계약은 어떤 형태로 맺으셨나요?
- 선택지:
  - `r5_cf_notarized_bilingual` — 공증사무소에서 공증받은 매매계약서가 있고, 한국어나 영어 번역도 함께 있습니다.
  - `r5_cf_notarized_vn_only` — 공증사무소에서 공증받은 매매계약서가 있지만, 베트남어로만 되어 있어 내용을 다 이해하지 못했습니다.
  - `r5_cf_developer_contract` — 분양 회사와 맺은 분양 계약서나 이를 넘겨받은 계약서가 있고, 공증은 하지 않았습니다.
  - `r5_cf_deposit_only` — 계약금 약정서만 썼고, 정식 매매계약서는 아직 쓰지 않았습니다.
  - `r5_cf_informal_only` — 직접 쓴 계약서나 메시지 약속만 있고, 공증받은 계약서는 없습니다.

#### re05_handoverCompare
- phase: 2 / kind: single / show_if: re05_stage = r5_project_book_pending
- 질문: 인도받은 집은 분양 계약 내용과 비교하면 어떤가요?
- 선택지:
  - `r5_hc_match` — 인도받은 집의 면적·호수·구조가 분양 계약 내용과 거의 같습니다.
  - `r5_hc_area_diff` — 실제 면적이 계약 면적과 달라, 금액 정산 문제가 남아 있습니다.
  - `r5_hc_spec_diff` — 면적은 비슷하지만, 구조·마감·부대시설이 계약 내용과 다릅니다.
  - `r5_hc_not_handed` — 아직 집을 인도받지 못해, 실제와 비교할 수 없습니다.
  - `r5_hc_no_contract_copy` — 분양 계약서나 도면을 가지고 있지 않아, 비교하기 어렵습니다.

#### re05_infoSource
- phase: 2 / kind: single / show_if: re05_stage = r5_book_mismatch|r5_foreign_eligibility|r5_registration_rejected
- 질문: 이 문제는 어떤 경로로 알게 되셨나요?
- 선택지:
  - `r5_is_office_direct` — 토지등록사무소나 공증사무소에서 직접 안내를 받았습니다.
  - `r5_is_counterparty` — 매도인이나 분양 회사로부터 직접 들었습니다.
  - `r5_is_broker_relay` — 중개인이 전해 주었고, 원래 안내나 서류를 직접 보지는 못했습니다.
  - `r5_is_self_check` — 제가 핑크북 사본과 계약서를 직접 비교하다가 알게 되었습니다.
  - `r5_is_hearsay` — 지인이나 다른 매수인에게 들었고, 아직 공식적으로 확인하지 못했습니다.

---

### 2차 (phase 2) — 대응·자료·막힘·기한·목표

#### re05_customerResponse
- phase: 2 / kind: single / show_if: 항상
- 질문: 문제를 알게 된 뒤, 지금까지 어떻게 대응하셨나요?
- 선택지:
  - `r5_rs_none` — 아직 상대방이나 기관에 따로 연락하지 않았습니다.
  - `r5_rs_asked_counterparty` — 매도인이나 분양 회사에 직접 연락해, 진행 상황을 물어보았습니다.
  - `r5_rs_via_broker` — 중개인을 통해 진행을 재촉했고, 직접 연락하지는 않았습니다.
  - `r5_rs_asked_office` — 토지등록사무소나 공증사무소에 직접 문의했습니다.
  - `r5_rs_hold_and_demand` — 남은 돈의 지급을 멈추고, 서면이나 메시지로 약속을 지켜 달라고 요구했습니다.

#### re05_responseReaction
- phase: 2 / kind: single / show_if: re05_customerResponse = r5_rs_asked_counterparty|r5_rs_via_broker|r5_rs_asked_office|r5_rs_hold_and_demand
- 질문: 대응한 뒤, 상대방이나 기관은 어떻게 반응했나요?
- 선택지:
  - `r5_rr_new_date` — 새 날짜를 약속했지만, 서면으로 받지는 못했습니다.
  - `r5_rr_more_money` — 진행하려면 추가 금액이나 세금을 더 내야 한다고 했습니다.
  - `r5_rr_blame_other` — 서로 책임을 미루며, 누가 처리해야 하는지 분명히 말하지 않았습니다.
  - `r5_rr_no_contact` — 답변이 없거나, 연락이 끊겼습니다.
  - `r5_rr_cancel_mentioned` — 상대방이 계약 해제나 계약금 문제를 먼저 꺼냈습니다.

#### re05_evidence
- phase: 2 / kind: multi / show_if: 항상
- 질문: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `r5_ev_pinkbook` — 핑크북 원본이나 앞·뒷면 사본·사진
  - `r5_ev_contracts` — 매매계약서·분양 계약서·계약금 약정서(공증본 포함)
  - `r5_ev_payment_proof` — 은행 송금 내역이나 돈을 받았다는 영수증
  - `r5_ev_records` — 토지등록사무소 접수증·통지서, 또는 상대방·중개인과 주고받은 메시지
  - `r5_ev_none` — 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.

#### re05_blockage
- phase: 2 / kind: single / show_if: 항상
- 질문: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `r5_bk_cause_unknown` — 무엇 때문에 멈춰 있는지 알 수 없어, 어떻게 대응할지 판단하지 못하고 있습니다.
  - `r5_bk_counterparty` — 상대방이 서류를 넘겨주지 않거나 연락이 되지 않아, 제 쪽에서 진행할 수 없습니다.
  - `r5_bk_money_decision` — 남은 돈을 지급해야 할지 멈춰야 할지 판단하지 못해, 결정을 미루고 있습니다.
  - `r5_bk_eligibility` — 외국인인 제가 소유할 수 있는지 확실하지 않아, 진행 여부를 정하지 못하고 있습니다.
  - `r5_bk_docs_language` — 서류가 베트남어로 되어 있고 절차를 몰라, 무엇을 준비해야 할지 모르겠습니다.

#### re05_deadline
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 일과 관련해 앞으로 지켜야 하거나 다가오는 날짜가 있나요?
- 선택지:
  - `r5_dl_next_payment` — 다음 중도금이나 잔금을 지급해야 하는 날짜가 정해져 있습니다.
  - `r5_dl_notice_period` — 통지서나 기관 안내에 다시 신청하거나 보완할 수 있는 기간이 적혀 있습니다.
  - `r5_dl_personal` — 입주·출국·비자 갱신 같은 제 일정 때문에, 그 전에 마무리해야 합니다.
  - `r5_dl_none` — 정해진 날짜나 기한은 따로 없습니다.
  - `r5_dl_unsure` — 서류가 베트남어로 되어 있어, 기한이 적혀 있는지조차 확인하지 못했습니다.

#### re05_deadlineDate
- phase: 2 / kind: text / show_if: re05_deadline = r5_dl_next_payment|r5_dl_notice_period|r5_dl_personal
- 질문: 확인한 날짜와, 그날까지 해야 하는 일을 적어 주세요.
- placeholder: 예: 2026년 11월 30일까지 잔금 15억 동을 지급해야 하고, 그 전에 명의 이전 신청 접수를 확인하고 싶습니다.

#### re05_finalGoal
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `r5_fg_complete_transfer` — 막힌 원인을 확인하고, 제 이름으로 명의 이전이나 핑크북 발급을 끝까지 마치고 싶습니다.
  - `r5_fg_cancel_refund` — 거래를 계속하기 어렵다면, 계약을 정리하고 지급한 돈을 돌려받는 방법을 확인하고 싶습니다.
  - `r5_fg_safety_check` — 남은 돈을 지급하기 전에, 이 거래가 안전한지 서류와 권리관계를 확인하고 싶습니다.
  - `r5_fg_expert` — 제 상황을 전문가에게 정확히 전달해, 상대방과 기관 대응을 맡기고 싶습니다.

---

## 결과 신호

### 위험 신호 선택지 → 결과 화면 위험 문장 / 판정 단계

| 선택지 | 결과 화면 위험 문장 | 판정 |
|---|---|---|
| `r5_paid_balance` (+ re05_stage = r5_transfer_delay\|r5_project_book_pending) | 잔금까지 지급한 뒤에도 권리가 넘어오지 않아, 남은 협상 수단이 적은 상태일 수 있습니다. | 주의 |
| `r5_paid_via_broker` | 매도인이 아닌 사람에게 보낸 돈은, 실제로 매도인에게 전달되었는지 따로 확인해야 합니다. | 주의 |
| `r5_cp_broker_only` | 매도인을 직접 확인하지 않은 거래는, 계약 상대가 실제 권리자인지부터 확인해야 합니다. | 주의 |
| `r5_cp_resale_buyer` | 분양 계약을 넘겨받은 경우, 분양 회사가 그 이전을 인정했는지에 따라 핑크북 발급 대상이 달라질 수 있습니다. | 확인 필요 |
| `r5_cp_owner_unclear` | 실제 권리자가 확인되지 않으면, 이미 맺은 계약으로 명의 이전이 진행되지 않을 수 있습니다. | 전문가 권장 |
| `r5_td_mortgage` / `r5_mg_release_unclear` | 은행 담보가 풀리지 않으면 명의 이전 신청 자체가 받아들여지지 않을 수 있습니다. | 주의 |
| `r5_mg_paid_not_released` | 담보를 풀 돈을 지급했는데 해제가 확인되지 않으면, 그 돈의 사용처부터 확인해야 합니다. | 전문가 권장 |
| `r5_mg_unknown` | 은행 담보 여부는 핑크북 뒷면 기재란이나 토지등록사무소에서 먼저 확인해야 합니다. | 확인 필요 |
| `r5_td_stage_unknown` / `r5_td_filed_waiting` | 신청 접수 여부와 처리 단계를 확인할 근거(접수증)가 필요합니다. | 확인 필요 |
| `r5_td_tax_stage` / `r5_ex_tax_demand` | 세금을 누가 납부하는지는 계약서 조항에 따라 달라지므로, 계약서 내용과 먼저 대조해야 합니다. | 확인 필요 |
| `r5_pb_project_mortgage` / `r5_pb_project_legal` | 프로젝트 전체의 담보나 법적 절차 문제는 개별 매수인이 앞당기기 어려워, 발급이 길어질 수 있습니다. | 주의 |
| `r5_pb_applied_no_proof` | 신청했다는 말만 있고 접수 근거가 없으면, 실제 신청 여부를 따로 확인해야 합니다. | 확인 필요 |
| `r5_hc_area_diff` | 실제 면적이 계약과 다르면, 핑크북 발급 전에 금액 정산 기준을 계약서로 확인해야 합니다. | 확인 필요 |
| `r5_mm_owner_name` | 핑크북 소유자가 계약 상대와 다르면, 그 사람의 동의 없이 맺은 계약은 명의 이전이 진행되지 않을 수 있습니다. | 전문가 권장 |
| `r5_mm_area` / `r5_mm_address_use` | 핑크북 내용이 계약과 다르면, 어느 쪽을 기준으로 바로잡을지 먼저 정해야 합니다. | 확인 필요 |
| `r5_mm_forgery_suspect` | 핑크북이 진짜가 아닐 가능성이 있다면, 추가 지급을 멈추고 토지등록사무소 기록부터 확인해야 합니다. (특수 사건: VFBCAI 전문가팀 진행) | 전문가 권장 |
| `r5_nm_family_coowner` | 핑크북의 공동 소유자 전원이 동의하지 않으면, 명의 이전이 진행되지 않을 수 있습니다. | 주의 |
| `r5_nm_proxy` | 대리인과 맺은 계약은 위임장이 공증되었는지, 매매 권한이 포함되었는지 확인해야 합니다. | 주의 |
| `r5_nm_not_seen` | 핑크북을 직접 보지 못한 상태라면, 누구의 권리인지부터 확인해야 합니다. | 주의 |
| `r5_nm_buyer_vn_name` / `r5_fe_nominee` | 다른 사람 이름으로 등록한 집은, 그 사람이 권리를 주장할 때 돌려받기 어려울 수 있습니다. | 전문가 권장 |
| `r5_fe_land_house` / `r5_rj_foreign_status` | 외국인은 집의 종류와 위치에 따라 소유가 제한될 수 있어, 거래 전 조건 확인이 필요합니다. | 주의 |
| `r5_fe_quota_full` | 외국인 소유 물량이 찬 건물이라면, 계약을 해도 외국인 명의로 핑크북을 받지 못할 수 있습니다. | 주의 |
| `r5_rj_seller_side` | 매도인 쪽의 압류·분쟁 기록은 매수인이 혼자 풀 수 없는 문제일 수 있습니다. (특수 사건: VFBCAI 전문가팀 진행) | 전문가 권장 |
| `r5_pd_postponed` / `r5_pd_written_passed` | 약속한 날짜가 지난 경우, 계약서의 지연 조항과 해제 조건을 확인해야 합니다. | 주의 |
| `r5_ex_extra_cost` / `r5_rr_more_money` | 계약에 없던 비용 요구는, 명목과 영수증을 서면으로 받은 뒤에 판단해야 합니다. | 주의 |
| `r5_ex_no_explanation` / `r5_rr_no_contact` | 상대방이 연락을 피하면, 그동안의 지급 내역과 연락 기록을 먼저 정리해 두어야 합니다. | 주의 |
| `r5_ex_other_dispute` | 상속·이혼·채무 분쟁은 여러 당사자가 얽혀, 매매 계약만으로 해결되지 않을 수 있습니다. (특수 사건: VFBCAI 전문가팀 진행) | 전문가 권장 |
| `r5_rr_cancel_mentioned` | 상대방이 계약 해제를 먼저 꺼낸 경우, 계약금 몰수나 배액 반환 조항을 확인한 뒤 답해야 합니다. | 전문가 권장 |
| `r5_cf_deposit_only` / `r5_cf_informal_only` | 공증받은 매매계약서가 없으면, 명의 이전 신청에 쓸 수 있는 계약이 아직 없는 상태일 수 있습니다. | 주의 |
| `r5_cf_notarized_vn_only` | 공증 계약서의 명의 이전 기한·세금 부담·해제 조항을 번역해 확인해야 합니다. | 확인 필요 |
| `r5_bk_money_decision` | 남은 돈의 지급 여부는 계약서의 지급 조건과 권리 서류 상태를 함께 보고 정해야 합니다. | 확인 필요 |
| `r5_dl_notice_period` | 통지서에 적힌 기간이 지나면 다시 신청해야 할 수 있어, 날짜부터 확인해야 합니다. | 주의 |
| `r5_ev_none` | 지급 내역과 계약서가 없으면, 지급한 돈과 약속 내용을 증명하기 어려울 수 있습니다. | 확인 필요 |

- 판정 합산 규칙: 전문가 권장 1개 이상 → "전문가 권장" / 주의 2개 이상 → "주의" / 그 외 → "확인 필요".
- 특수 사건 표시(`r5_mm_forgery_suspect`, `r5_rj_seller_side`, `r5_ex_other_dispute`, 직접 입력에 소송·형사 고소 언급): 퍼널 결과 대신 "VFBCAI 전문가팀 진행" 안내.

### 1차 결과 "핵심 확인 결과" 3칸 문장 규칙

1. **상황** = re05_stage 요약 + re05_counterparty 요약 + re05_paidStage 요약
   - 형식: "{상대방}과의 거래에서 {지급 단계} 상태이며, {문제 상황}."
   - stage 요약: r5_transfer_delay "명의 이전이 약속한 시점에 끝나지 않고 있습니다" / r5_project_book_pending "핑크북이 아직 발급되지 않았습니다" / r5_book_mismatch "핑크북 내용이 계약이나 실제 집과 다릅니다" / r5_foreign_eligibility "외국인 소유 가능 여부가 확인되지 않았습니다" / r5_registration_rejected "토지등록사무소에서 신청을 받아들이지 않았습니다"
   - counterparty 요약: 개인 매도인 / 분양 회사 / 분양 계약을 넘겨준 사람 / 중개인을 통한 매도인 / 권리자가 확인되지 않은 상대방
   - paidStage 요약: 계약금만 지급한 / 중도금까지 지급한 / 잔금까지 지급한 / 중개인·지인 계좌로 지급한 / 아직 지급하지 않은
2. **확인 목표** = re05_confirmGoal 문장을 "~확인합니다"로 바꿔 표시
   - r5_cg_why_stuck "멈춰 있는 원인을 확인합니다" / r5_cg_doc_valid "핑크북과 계약서의 진위와 내용을 확인합니다" / r5_cg_foreign_ok "외국인 명의 소유 가능 여부와 조건을 확인합니다" / r5_cg_money_safe "지급한 돈의 안전과 남은 돈의 지급 여부를 확인합니다" / r5_cg_order "진행 순서를 정리합니다"
3. **대응·자료** = 2차 응답 전에는 "2차 질문에서 지금까지의 대응과 보관 자료를 확인합니다." 고정. 2차 응답 후에는 "{re05_customerResponse 요약}, 보관 자료: {re05_evidence 선택 항목}." (r5_ev_none이면 "보관 자료가 아직 확인되지 않았습니다.")

### "지금 확인해 보세요" STEP 3개

- STEP 1. 핑크북 원본이나 앞·뒷면 사본에서 소유자 이름, 면적, 주소, 뒷면의 담보 기재 내용을 확인해 주세요.
  - (re05_stage = r5_project_book_pending이면 대체) 분양 계약서에서 핑크북 발급 기한과 마지막 잔금 지급 조건이 적힌 조항을 찾아 주세요.
  - (re05_stage = r5_foreign_eligibility이면 대체) 이 집이 분양 프로젝트 안의 아파트인지, 땅이 딸린 주택인지 계약서와 분양 자료로 확인해 주세요.
- STEP 2. 계약서에서 명의 이전 기한, 세금 부담자, 잔금 지급 조건, 지연·해제 시 계약금 처리 조항을 찾아 표시해 주세요.
- STEP 3. 지금까지 지급한 금액을 날짜·금액·받은 사람 순으로 정리하고, 상대방에게 현재 진행 단계와 예정일을 메시지로 받아 두세요.
  - (re05_stage = r5_registration_rejected이면 대체) 통지서의 불수리 이유와 다시 신청할 수 있는 기간을 번역해 확인하고, 통지서 원본을 보관해 주세요.

---

## 대표 경로

- 경로 A (개인 매도인·명의 이전 지연): re05_stage(r5_transfer_delay) → re05_paidStage → re05_counterparty → re05_confirmGoal → re05_transferDelayDetail → re05_paidAmount → re05_nameOnDocs → re05_promisedDate → re05_counterpartyExplanation → re05_contractForm → re05_customerResponse → re05_responseReaction → re05_evidence → re05_blockage → re05_deadline → re05_deadlineDate → re05_finalGoal
- 경로 B (분양·핑크북 미발급): re05_stage(r5_project_book_pending) → re05_paidStage → re05_counterparty → re05_confirmGoal → re05_projectBookDetail → re05_paidAmount → re05_promisedDate → re05_counterpartyExplanation → re05_contractForm → re05_handoverCompare → re05_customerResponse → re05_responseReaction → re05_evidence → re05_blockage → re05_deadline → re05_finalGoal


---
# 공용 화면 문구

## 다음 단계 안내(1차 결과 하단)
- 무료: "AI 정리 보기 — 내 상황에 맞는 핵심 내용을 AI가 정리해 드립니다."
- 유료: "개인화 상세 검토하기 — 내 계약 조건과 자료를 바탕으로 더 깊이 확인합니다."

## 2차 자료 제출(/documents)
- 우선 제출: 계약서(서명본) / 토지사용권 증서(핑크북) 등 권리 증빙
- 있으면 제출: 계약금·보증금 송금 내역 / 카카오톡·Zalo·이메일 대화 캡처 / 집 상태 사진·영상 / 받은 통지서 / 기타 참고자료
- 안내: "현재 가지고 있는 계약·권리 서류·송금 관련 자료를 제출해 주세요. 자료가 없어도 종합 결과를 볼 수 있습니다." / "베트남 부동산 관련 절차·서류 기준은 변경될 수 있으므로 최신 기준은 전문가와 확인하시기 바랍니다."

## My Page (Admin MASTER 마이페이지와 같은 구조·같은 단계 규칙)
- 서비스명: 부동산 문서 검토 / 카드 제목: 1차 우선 확인 목표 label(Value→Label 단일 표)
- AI 분석 결과 카드: 1차 판정 헤드라인 + 핵심 확인 결과 요약 2줄(빈 카드 금지, Admin MASTER와 같은 위치·형식)
- 진행 단계·현재 단계·다음 단계: Admin MASTER 규칙 그대로, 서로 일치
- 예상 일정: 전문가 검토 완료 / 상대방·기관 대응 / 검토 결과 안내 · 전문가: VFBCAI 법률전문가팀

## PDF
- Admin MASTER PDF Framework 그대로(무료 1페이지, 유료 ■1차 → ■2차). 문장 원천은 각 CASE의 결과 신호·결과 문장.
