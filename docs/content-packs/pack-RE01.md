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
  - `ct_lease_home` — 살 집(아파트·주택)을 빌리려고 하고, 집주인과 임대차 계약을 앞두고 있습니다.
  - `ct_lease_office` — 사무실이나 상가를 빌리려고 하고, 회사 주소나 영업 장소로 쓸 계획입니다.
  - `ct_purchase_project` — 분양 중인 아파트를 사려고 하고, 개발사(분양사)와 계약을 앞두고 있습니다.
  - `ct_purchase_resale` — 이미 지어진 집이나 아파트를 개인 소유자에게서 사려고 합니다.
  - `ct_deposit_only` — 본계약을 하기 전에, 계약금 약정서(đặt cọc)만 먼저 쓰자는 제안을 받았습니다.

#### re01_progress_stage
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 계약은 지금 어디까지 진행되었나요?
- 선택지:
  - `st_viewing` — 집을 보고 조건만 들었고, 계약서나 서류는 아직 받지 못했습니다.
  - `st_draft` — 계약서 초안을 받았고, 아직 서명이나 송금은 하지 않았습니다.
  - `st_deposit_requested` — 계약서에 서명하기 전에, 계약금부터 먼저 보내라는 요청을 받았습니다.
  - `st_deposit_paid` — 계약금은 이미 보냈고, 본계약 서명이나 잔금 지급을 앞두고 있습니다.
  - `st_sign_scheduled` — 서명 날짜가 정해졌고, 그 전에 계약서를 확인받고 싶습니다.

#### re01_owner_doc_check
- phase: 1 / kind: single / show_if: 항상
- 질문: 계약 상대방이 실제 소유자인지는 어떻게 확인하셨나요?
- 선택지:
  - `od_original_match` — 토지사용권 증서(핑크북) 원본을 직접 봤고, 소유자 이름이 계약 상대방과 같습니다.
  - `od_copy_only` — 핑크북 사본이나 사진만 받았고, 원본은 아직 보지 못했습니다.
  - `od_signer_differs` — 핑크북은 봤지만, 소유자와 계약서에 서명할 사람이 다릅니다.
  - `od_refused_delay` — 핑크북을 보여 달라고 했지만, 계속 미루거나 보여 줄 수 없다고 합니다.
  - `od_project_no_book` — 분양 아파트라 핑크북은 아직 없고, 개발사 계약서와 사업 관련 서류만 받았습니다.

#### re01_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `cg_owner_authority` — 계약 상대방이 진짜 소유자인지, 서명할 권한이 있는 사람인지 먼저 확인하고 싶습니다.
  - `cg_contract_terms` — 계약서에 제게 불리한 조항이나 빠진 조항이 없는지 확인하고 싶습니다.
  - `cg_money_safety` — 계약금이나 보증금을 보내도 안전한지, 돌려받을 수 있는 조건인지 확인하고 싶습니다.
  - `cg_foreigner_fit` — 외국인인 제가 이 계약을 하고, 소유나 거주 신고까지 할 수 있는지 확인하고 싶습니다.
  - `cg_order_unsure` — 상황이 복잡해서, 서명 전에 무엇부터 확인해야 하는지 순서를 알고 싶습니다.

---

### 2차 (전체 23노드, 조건부 후속 포함)

#### re01_info_channel
- phase: 2 / kind: single / show_if: 항상
- 질문: 계약 조건이나 계약서는 누구를 통해 받으셨나요?
- 선택지:
  - `ic_owner_direct` — 집주인(소유자)에게 직접 조건을 들었고, 계약서도 직접 받았습니다.
  - `ic_broker_relay` — 중개인이 집주인 대신 조건을 전달했고, 계약서도 중개인을 통해 받았습니다.
  - `ic_developer_sales` — 개발사 영업 담당자나 분양 대행사에게 조건과 계약서를 안내받았습니다.
  - `ic_acquaintance` — 지인이나 회사 동료의 소개로, 비공식적으로 조건을 전해 들었습니다.
  - `ic_online_only` — 온라인 광고나 SNS 글을 보고 연락했고, 상대방과는 메시지로만 이야기했습니다.

#### re01_broker_role
- phase: 2 / kind: single / show_if: `re01_info_channel = ic_broker_relay|ic_acquaintance` 또는 `re01_transfer_account = ta_broker_account`
- 질문: 이 계약에서 중개인은 어떤 역할을 하고 있나요?
- 선택지:
  - `br_licensed_written` — 중개회사 소속 중개인이고, 수수료와 역할이 서면으로 정해져 있습니다.
  - `br_individual_verbal` — 개인 중개인이고, 수수료와 역할은 말로만 정했습니다.
  - `br_both_sides` — 같은 중개인이 집주인 쪽과 제 쪽 일을 함께 맡고 있습니다.
  - `br_collects_money` — 중개인이 계약금이나 보증금을 소유자 대신 받겠다고 합니다.
  - `br_fee_unclear` — 중개 수수료를 누가, 언제, 얼마 내는지 아직 정해지지 않았습니다.

#### re01_owner_authority
- phase: 2 / kind: single / show_if: `re01_owner_doc_check = od_signer_differs`
- 질문: 소유자가 아닌 사람이 서명한다면, 그 사람의 권한은 어떻게 확인하셨나요?
- 선택지:
  - `oa_notarized_poa` — 공증받은 위임장을 보여 주었고, 위임 범위에 계약 서명과 돈을 받는 일이 포함되어 있습니다.
  - `oa_poa_unseen` — 위임장이 있다고 말로만 들었고, 실제 위임장은 보지 못했습니다.
  - `oa_co_owner_one` — 핑크북에 부부 등 여러 명이 적혀 있는데, 그중 한 사람만 서명한다고 합니다.
  - `oa_relative_no_doc` — 소유자의 가족이 대신 서명한다고 하며, 위임장 이야기는 없었습니다.
  - `oa_company_rep` — 소유자가 회사이고, 대표자가 아닌 직원이 서명한다고 합니다.

#### re01_contract_form
- phase: 2 / kind: single / show_if: 항상
- 질문: 계약서는 어떤 언어로 되어 있고, 공증은 어떻게 하기로 했나요?
- 선택지:
  - `cf_bilingual_notary` — 베트남어와 영어(또는 한국어)가 함께 적힌 계약서이고, 공증사무소에서 공증하기로 했습니다.
  - `cf_bilingual_no_notary` — 두 언어가 함께 적힌 계약서이지만, 공증 없이 서명만 하자고 합니다.
  - `cf_vi_only` — 베트남어로만 된 계약서이고, 공증을 할지는 아직 정해지지 않았습니다.
  - `cf_unofficial_translation` — 중개인이 만든 한국어 번역본만 받았고, 베트남어 원문과 같은지 확인하지 못했습니다.
  - `cf_no_draft` — 아직 계약서 초안을 받지 못했고, 말이나 메시지로 조건만 들었습니다.

#### re01_language_gap
- phase: 2 / kind: single / show_if: `re01_contract_form = cf_vi_only|cf_unofficial_translation`
- 질문: 계약서 내용 중 이해하기 가장 어려운 부분은 무엇인가요?
- 선택지:
  - `lg_penalty_terms` — 계약금 몰수나 위약금 등, 계약을 깰 때 적용되는 조항을 이해하지 못했습니다.
  - `lg_termination` — 중도 해지나 갱신 조건이 어떻게 적혀 있는지 알 수 없습니다.
  - `lg_money_schedule` — 금액과 지급 일정이 제가 들은 내용과 같은지 확인하지 못했습니다.
  - `lg_cost_burden` — 관리비·수리비·세금을 누가 부담하는지 적힌 부분을 이해하지 못했습니다.
  - `lg_version_priority` — 번역본과 원문이 다를 때 어느 쪽을 따르는지 적혀 있는지 모릅니다.

#### re01_condition_compare
- phase: 2 / kind: single / show_if: `re01_contract_form = cf_bilingual_notary|cf_bilingual_no_notary|cf_unofficial_translation`
- 질문: 계약서 내용은 처음 안내받은 조건과 비교하면 어떤가요?
- 선택지:
  - `cc_same` — 금액·기간·포함 항목 등이 처음 안내받은 조건과 거의 같습니다.
  - `cc_amount_diff` — 월세·보증금·매매대금 등 금액이 처음 들은 것과 다르게 적혀 있습니다.
  - `cc_scope_diff` — 가구·관리비·주차 등 포함된다고 들은 항목이 빠져 있거나 다르게 적혀 있습니다.
  - `cc_unit_diff` — 호수·면적·층 등 물건 정보가 제가 직접 본 곳과 다르게 적혀 있습니다.
  - `cc_cannot_compare` — 처음 조건을 말로만 들어서, 계약서와 무엇을 비교해야 할지 정리되지 않았습니다.

#### re01_compare_detail
- phase: 2 / kind: text / show_if: `re01_condition_compare = cc_amount_diff|cc_scope_diff|cc_unit_diff`
- 질문: 처음 들은 조건과 계약서에 적힌 내용이 어떻게 다른지 적어 주세요.
- placeholder: 예) 중개인은 월세 1,800만 동에 관리비 포함이라고 했는데, 계약서에는 월세 2,000만 동, 관리비 별도로 적혀 있습니다.

#### re01_counterparty_reaction
- phase: 2 / kind: single / show_if: `re01_condition_compare = cc_amount_diff|cc_scope_diff|cc_unit_diff`
- 질문: 다른 부분을 상대방이나 중개인에게 말했을 때, 어떤 반응이었나요?
- 선택지:
  - `cr_agreed_fix` — 계약서를 고쳐 주겠다고 했고, 수정본을 받기로 했습니다.
  - `cr_verbal_promise` — 말로는 맞춰 주겠다고 했지만, 계약서는 그대로 두고 서명하자고 합니다.
  - `cr_refused` — 수정은 어렵다며, 그대로 서명하거나 계약을 포기하라고 했습니다.
  - `cr_no_reply` — 다른 부분을 말했지만, 아직 답을 받지 못했습니다.
  - `cr_not_raised` — 아직 상대방에게 다른 부분을 말하지 않았습니다.

#### re01_deposit_months
- phase: 2 / kind: single / show_if: `re01_contract_type = ct_lease_home|ct_lease_office`
- 질문: 보증금과 월세 지급 조건은 어떻게 안내받으셨나요?
- 선택지:
  - `dm_one_month` — 보증금은 월세 1개월분이고, 계약서에 금액과 돌려받는 시점이 적혀 있습니다.
  - `dm_two_months` — 보증금은 월세 2개월분이고, 나갈 때 돌려준다는 말을 들었습니다.
  - `dm_three_plus` — 보증금이 월세 3개월분 이상이거나, 월세를 여러 달치 미리 내라고 합니다.
  - `dm_return_unclear` — 보증금 금액은 정해졌지만, 언제 어떤 조건으로 돌려주는지는 정해지지 않았습니다.
  - `dm_not_settled` — 보증금 금액과 월세 지급 방식은 아직 협의하고 있습니다.

#### re01_payment_schedule
- phase: 2 / kind: single / show_if: `re01_contract_type = ct_purchase_project|ct_purchase_resale`
- 질문: 매매대금은 어떤 순서로 지급하기로 했나요?
- 선택지:
  - `ps_staged_written` — 계약금·중도금·잔금의 단계와 날짜가 계약서나 개발사 일정표에 적혀 있습니다.
  - `ps_deposit_only_fixed` — 계약금 금액만 정해졌고, 중도금과 잔금 일정은 아직 정하지 않았습니다.
  - `ps_lump_sum_first` — 명의 이전이나 핑크북 발급 전에, 대금 대부분이나 전액을 먼저 보내라고 합니다.
  - `ps_mortgage_payoff` — 잔금 일부로 소유자의 은행 대출을 갚고 담보를 풀겠다고 합니다.
  - `ps_price_split` — 계약서에 적는 금액과 실제로 주고받는 금액을 다르게 하자는 제안을 받았습니다.

#### re01_deposit_link
- phase: 2 / kind: single / show_if: `re01_contract_type = ct_deposit_only`
- 질문: 이 계약금 약정은 어떤 본계약으로 이어지기로 했나요?
- 선택지:
  - `dl_lease_fixed_date` — 임대차 본계약으로 이어지고, 본계약 서명 날짜도 정해져 있습니다.
  - `dl_purchase_fixed_date` — 매매 본계약으로 이어지고, 본계약을 공증할 날짜도 정해져 있습니다.
  - `dl_no_date` — 본계약을 한다는 말만 있고, 언제 하는지는 정해지지 않았습니다.
  - `dl_terms_open` — 계약금만 먼저 걸고, 금액이나 세부 조건은 나중에 정하자고 합니다.

#### re01_amount_detail
- phase: 2 / kind: text / show_if: `re01_deposit_months = dm_one_month|dm_two_months|dm_three_plus|dm_return_unclear` 또는 `re01_payment_schedule` 응답 시 또는 `re01_deposit_link` 응답 시
- 질문: 안내받은 금액(월세·보증금·매매대금·계약금)을 적어 주세요.
- placeholder: 예) 매매대금 45억 동, 계약금 4억 5천만 동(10%), 잔금은 공증일에 지급

#### re01_transfer_account
- phase: 2 / kind: single / show_if: `re01_progress_stage = st_deposit_requested|st_deposit_paid` 또는 `re01_contract_type = ct_deposit_only`
- 질문: 계약금이나 보증금은 누구 명의의 계좌로 보내라고 했나요?
- 선택지:
  - `ta_owner_account` — 핑크북에 적힌 소유자(분양이면 개발사) 본인 명의 계좌로 보내라고 했습니다.
  - `ta_broker_account` — 중개인이나 중개회사 명의 계좌로 보내라고 했습니다.
  - `ta_third_party` — 소유자의 가족이나 다른 사람 명의 계좌로 보내라고 했고, 그 이유는 듣지 못했습니다.
  - `ta_cash` — 현금으로 직접 달라고 했고, 영수증을 써 줄지는 확실하지 않습니다.
  - `ta_not_told` — 돈을 보내라는 말은 들었지만, 어느 계좌로 보내는지는 아직 안내받지 못했습니다.

#### re01_deposit_paid_proof
- phase: 2 / kind: single / show_if: `re01_progress_stage = st_deposit_paid`
- 질문: 이미 보낸 계약금에 대해, 받았다는 확인은 어떻게 남아 있나요?
- 선택지:
  - `dp_signed_receipt` — 송금했고, 상대방이 서명한 계약금 영수증이나 약정서를 받았습니다.
  - `dp_transfer_only` — 송금 내역은 있지만, 상대방이 서명한 영수증이나 약정서는 받지 못했습니다.
  - `dp_cash_no_receipt` — 현금으로 건넸고, 받았다는 서면 확인은 받지 못했습니다.
  - `dp_via_broker` — 중개인에게 건넸고, 소유자에게 전달되었는지는 확인하지 못했습니다.

#### re01_penalty_clause
- phase: 2 / kind: single / show_if: `re01_progress_stage = st_deposit_requested|st_deposit_paid|st_sign_scheduled` 또는 `re01_contract_type = ct_deposit_only`
- 질문: 계약을 깨는 경우 계약금을 어떻게 처리한다고 되어 있나요?
- 선택지:
  - `pc_mutual_written` — 제가 포기하면 계약금을 잃고, 상대방이 어기면 배액을 돌려준다고 서면에 적혀 있습니다.
  - `pc_one_sided` — 제가 포기하면 계약금을 잃는다는 내용만 있고, 상대방이 어기는 경우는 적혀 있지 않습니다.
  - `pc_conditional_refund` — 대출 거절이나 서류 문제 등 특정한 경우에는 계약금을 돌려준다는 조건이 적혀 있습니다.
  - `pc_verbal_only` — 몰수나 배액 반환에 대해 말로만 들었고, 서면에는 적혀 있지 않습니다.
  - `pc_not_checked` — 위약 조항이 있는지, 있다면 무슨 뜻인지 아직 확인하지 못했습니다.

#### re01_residence_registration
- phase: 2 / kind: single / show_if: `re01_contract_type = ct_lease_home`
- 질문: 입주 후 공안에 하는 임시거주 신고는 어떻게 하기로 했나요?
- 선택지:
  - `rr_owner_will_do` — 집주인이 입주 후 임시거주 신고를 해 주기로 했고, 계약서에도 적혀 있습니다.
  - `rr_verbal_only` — 집주인이 신고해 준다고 말했지만, 계약서에는 적혀 있지 않습니다.
  - `rr_tenant_self` — 신고는 제가 알아서 하라고 했고, 필요한 서류는 안내받지 못했습니다.
  - `rr_refused_or_fee` — 집주인이 신고를 꺼리거나, 신고해 주는 대신 추가 비용을 요구했습니다.
  - `rr_not_discussed` — 임시거주 신고에 대해서는 아직 이야기해 본 적이 없습니다.

#### re01_commercial_use
- phase: 2 / kind: single / show_if: `re01_contract_type = ct_lease_office`
- 질문: 이 공간을 회사 주소나 영업 장소로 쓰는 것은 어떻게 확인하셨나요?
- 선택지:
  - `cu_registration_ok` — 회사 등록 주소로 써도 된다고 했고, 필요한 서류(핑크북 사본 등)도 주기로 했습니다.
  - `cu_verbal_only` — 사업 용도로 써도 된다고 말로만 들었고, 계약서에는 용도가 적혀 있지 않습니다.
  - `cu_sublease` — 건물주가 아니라, 건물을 먼저 빌린 사람에게서 다시 빌리는 구조입니다.
  - `cu_use_restricted` — 주거용 건물이거나 용도 제한이 있다는 말을 들었지만, 확인하지 못했습니다.
  - `cu_fitout_unclear` — 인테리어 공사와 나갈 때 원상복구 비용을 누가 부담하는지 정해지지 않았습니다.

#### re01_foreign_eligibility
- phase: 2 / kind: single / show_if: `re01_contract_type = ct_purchase_project|ct_purchase_resale` 또는 `re01_deposit_link = dl_purchase_fixed_date`
- 질문: 외국인 명의로 이 집을 살 수 있는지는 어떻게 확인하셨나요?
- 선택지:
  - `fe_quota_written` — 분양 프로젝트의 아파트이고, 외국인 구매 가능 물량이 남아 있다고 서면으로 안내받았습니다.
  - `fe_quota_verbal` — 외국인도 살 수 있다고 말로만 들었고, 물량이나 프로젝트 조건은 확인하지 못했습니다.
  - `fe_landed_house` — 프로젝트 밖의 개인 주택(토지가 딸린 집)이고, 외국인 명의가 가능한지 확인하지 못했습니다.
  - `fe_nominee_name` — 베트남인 지인이나 중개인 명의를 빌려서 사 두자는 제안을 받았습니다.
  - `fe_term_unknown` — 살 수는 있다고 들었지만, 외국인 소유 기간(50년 등)과 연장 조건은 설명받지 못했습니다.

#### re01_sign_deadline
- phase: 2 / kind: single / show_if: 항상
- 질문: 서명이나 송금은 언제까지 결정해야 한다고 들으셨나요?
- 선택지:
  - `sd_date_fixed` — 서명(또는 송금) 날짜가 정해져 있고, 정확한 날짜를 알고 있습니다.
  - `sd_pressure_days` — '며칠 안에 결정하지 않으면 다른 사람에게 넘긴다'는 말을 들었습니다.
  - `sd_move_in_driven` — 입주나 개업 날짜에 맞춰야 해서, 제 쪽 일정이 급합니다.
  - `sd_no_deadline` — 정해진 기한은 없고, 제가 결정하는 대로 진행하면 된다고 합니다.
  - `sd_passed` — 약속한 날짜가 이미 지났고, 상대방이 계속 진행할지 확실하지 않습니다.

#### re01_sign_date
- phase: 2 / kind: text / show_if: `re01_sign_deadline = sd_date_fixed|sd_pressure_days|sd_move_in_driven`
- 질문: 서명하거나 돈을 보내기로 한 날짜는 언제인가요?
- placeholder: 예) 10월 15일 오전 공증사무소에서 서명, 계약금은 서명 당일 송금

#### re01_evidence
- phase: 2 / kind: multi / show_if: `re01_progress_stage = st_draft|st_deposit_paid|st_sign_scheduled`
- 질문: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `ev_contract_draft` — 계약서 초안이나 수정본(파일·사진 포함)
  - `ev_owner_docs` — 핑크북, 상대방 신분증, 위임장의 사본이나 사진
  - `ev_payment_record` — 송금 내역이나 계약금 영수증
  - `ev_messages` — 중개인·상대방과 주고받은 메시지(Zalo·카카오톡 등)
  - `ev_none` — 보관 중인 자료가 없거나, 아직 정리하지 못했습니다.

#### re01_blockage
- phase: 2 / kind: single / show_if: 항상
- 질문: 현재 이 계약을 진행하지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `bl_owner_unverified` — 상대방이 진짜 소유자이거나 권한이 있는 사람인지 확신이 없어, 서명을 미루고 있습니다.
  - `bl_contract_unreadable` — 계약서를 제대로 이해하지 못해, 불리한 조항이 있는지 판단하지 못하고 있습니다.
  - `bl_money_risk` — 돈을 먼저 보내라고 하는데, 돌려받지 못할까 봐 송금을 망설이고 있습니다.
  - `bl_eligibility_unclear` — 외국인인 제가 이 계약으로 소유하거나 거주 신고를 할 수 있는지 몰라 멈춰 있습니다.
  - `bl_time_pressure` — 결정할 시간이 짧아, 무엇부터 확인해야 할지 정리하지 못하고 있습니다.

#### re01_final_goal
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 검토를 통해 이 계약을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `fg_sign_safely` — 확인할 것을 모두 확인한 뒤, 문제가 없으면 그대로 서명하고 싶습니다.
  - `fg_revise_then_sign` — 불리하거나 빠진 조항을 고친 뒤에 서명하고 싶습니다.
  - `fg_protect_deposit` — 이미 보냈거나 앞으로 보낼 계약금을 지킬 수 있는 방법을 정리하고 싶습니다.
  - `fg_withdraw_safely` — 위험이 크다면, 손해를 줄이면서 계약을 하지 않는 쪽으로 정리하고 싶습니다.
  - `fg_expert_handle` — 계약서 검토와 상대방과의 협의를 전문가에게 맡기고 싶습니다.

---

## 2. 결과 신호

### 판정 규칙
- 선택된 신호 중 가장 높은 단계를 최종 판정으로 한다.
- "주의" 신호가 3개 이상이면 "전문가 권장"으로 올린다.
- 신호가 하나도 없으면 "확인 필요"(기본 점검 안내)로 표시한다.

### 전문가 권장
| 선택지 | 결과 화면 위험 문장 |
|---|---|
| `od_refused_delay` | 핑크북 원본을 보여 주지 않는 상대방과는 소유 여부가 확인되기 전까지 서명이나 송금을 멈추는 것이 안전합니다. |
| `oa_poa_unseen` | 위임장을 직접 보지 못한 대리인의 서명은 소유자가 계약을 인정하지 않을 위험이 있어, 공증된 위임장부터 확인해야 합니다. |
| `oa_relative_no_doc` | 가족이라도 위임장 없이 서명하면 소유자 본인에게 계약 효력을 주장하기 어려울 수 있습니다. |
| `oa_co_owner_one` | 핑크북에 적힌 공동 소유자 중 한 명만 서명하면, 나머지 소유자가 계약에 동의하지 않을 위험이 있습니다. |
| `ta_third_party` | 소유자가 아닌 사람 명의 계좌로 돈을 보내면, 분쟁이 생겼을 때 소유자에게 지급했다고 증명하기 어려울 수 있습니다. |
| `ta_cash` / `dp_cash_no_receipt` | 서면 확인 없는 현금 지급은 나중에 계약금을 주었다는 사실 자체를 증명하기 어려울 수 있습니다. |
| `br_collects_money` / `dp_via_broker` | 중개인이 대신 받은 돈이 소유자에게 전달되었는지 확인되지 않으면, 계약금 반환을 요구할 상대가 불분명해질 수 있습니다. |
| `ps_price_split` | 계약서 금액과 실제 금액을 다르게 적으면 세금 문제와 분쟁 시 금액 다툼으로 이어질 수 있어, 서명 전에 검토가 필요합니다. |
| `ps_lump_sum_first` | 명의 이전 전에 대금 대부분을 먼저 보내면, 이전이 지연되거나 무산될 때 돌려받기 어려울 수 있습니다. |
| `fe_nominee_name` | 다른 사람 명의를 빌려 사는 방식은 그 사람이 소유권을 주장할 경우 보호받기 어려울 수 있습니다. |
| `fe_landed_house` | 프로젝트 밖의 개인 주택은 외국인 명의 소유가 제한될 수 있어, 계약 전에 소유 가능 여부부터 확인해야 합니다. |
| `cu_sublease` | 다시 빌리는 구조에서는 원래 임대차가 끝나면 함께 나가야 할 수 있어, 건물주 동의 여부를 먼저 확인해야 합니다. |

### 주의
| 선택지 | 결과 화면 위험 문장 |
|---|---|
| `od_copy_only` | 핑크북 사본만으로는 최근 변동 사항이나 위조 여부를 확인할 수 없어, 서명 전에 원본 대조가 필요합니다. |
| `od_signer_differs` | 소유자와 서명할 사람이 다르므로, 서명할 사람의 권한을 증명하는 서류를 먼저 받아야 합니다. |
| `od_project_no_book` | 분양 아파트는 개발사가 이 프로젝트를 팔 수 있는 조건을 갖췄는지 사업 서류로 먼저 확인해야 합니다. |
| `cf_vi_only` / `cf_unofficial_translation` | 이해하지 못한 언어로 된 계약서에 서명하면, 불리한 조항을 모른 채 계약하게 될 수 있습니다. |
| `cf_bilingual_no_notary` + `ct_purchase_resale` | 개인 간 주택 매매는 일반적으로 공증을 거쳐야 명의 이전을 진행할 수 있어, 공증 없이 서명하는 이유를 확인해야 합니다. |
| `cf_no_draft` + `st_deposit_requested` | 계약서 없이 계약금부터 보내면, 어떤 조건으로 돈을 보냈는지 증명하기 어려울 수 있습니다. |
| `pc_one_sided` | 위약 조항이 한쪽에만 적용되어 있어, 상대방이 계약을 깨는 경우의 배액 반환 조항을 추가로 확인해야 합니다. |
| `pc_verbal_only` / `pc_not_checked` | 계약금 몰수나 배액 반환 조건이 서면으로 확인되지 않아, 계약을 깰 때 기준이 불분명합니다. |
| `ta_broker_account` | 중개인 계좌로 보내는 경우, 소유자가 그 수령을 인정한다는 서면 확인이 함께 필요합니다. |
| `dp_transfer_only` | 송금 내역만 있고 서명된 영수증이 없어, 그 돈이 계약금이라는 점을 따로 확인받아 두는 것이 좋습니다. |
| `dm_three_plus` / `dm_return_unclear` | 보증금 규모나 반환 조건이 불분명하면, 나갈 때 보증금 반환을 두고 다툼이 생길 수 있습니다. |
| `ps_mortgage_payoff` | 은행 담보가 남아 있는 집은 담보 해제 순서와 시점이 계약서에 적혀 있어야 안전합니다. |
| `rr_refused_or_fee` | 임시거주 신고가 되지 않으면 비자·체류 관련 절차에 영향을 줄 수 있어, 신고 책임을 계약서에 적어 두는 것이 좋습니다. |
| `cu_use_restricted` | 용도 제한이 있는 공간은 회사 주소 등록이나 영업이 어려울 수 있어, 계약 전에 용도를 확인해야 합니다. |
| `fe_quota_verbal` | 외국인 구매 가능 물량은 건물마다 한도가 있어, 말로 들은 내용만으로는 명의 등록이 가능한지 알기 어렵습니다. |
| `cc_amount_diff` / `cc_unit_diff` | 계약서의 금액이나 물건 정보가 들은 내용과 달라, 서명 전에 수정 여부를 확인해야 합니다. |
| `cr_verbal_promise` / `cr_refused` | 다른 부분을 계약서에 반영하지 않으면, 나중에 말로 한 약속을 주장하기 어려울 수 있습니다. |
| `br_both_sides` | 중개인이 양쪽 일을 함께 맡고 있어, 중요한 조건은 상대방에게 직접 서면으로 확인받는 것이 좋습니다. |
| `dl_terms_open` | 조건이 정해지지 않은 상태에서 계약금을 걸면, 이후 조건이 맞지 않을 때 계약금 처리를 두고 다툼이 생길 수 있습니다. |
| `sd_pressure_days` | 짧은 기한으로 결정을 재촉받고 있어, 핵심 확인 항목을 먼저 정해 두고 진행하는 것이 좋습니다. |

### 확인 필요
| 선택지 | 결과 화면 위험 문장 |
|---|---|
| `rr_verbal_only` / `rr_tenant_self` / `rr_not_discussed` | 임시거주 신고를 누가 언제 하는지 계약서에 적어 두면, 입주 후 혼선을 줄일 수 있습니다. |
| `cu_verbal_only` / `cu_fitout_unclear` | 사용 용도와 공사·원상복구 비용 부담을 계약서에 적어 두는 것이 좋습니다. |
| `fe_term_unknown` | 외국인 소유 기간과 연장 조건을 서명 전에 확인해 두는 것이 좋습니다. |
| `ps_deposit_only_fixed` / `dl_no_date` | 중도금·잔금이나 본계약 날짜가 정해지지 않아, 일정이 미뤄질 때의 처리 기준을 함께 정해 두는 것이 좋습니다. |
| `dm_not_settled` / `ta_not_told` | 금액과 송금 계좌가 확정되면, 소유자 명의와 일치하는지 다시 확인해야 합니다. |
| `br_individual_verbal` / `br_fee_unclear` | 중개 수수료와 중개인의 역할을 서면으로 정해 두면 이후 다툼을 줄일 수 있습니다. |
| `lg_*` (언어 이해 어려움 항목) | 이해하지 못한 조항은 서명 전에 번역과 함께 의미를 확인받아야 합니다. |
| `cc_scope_diff` | 포함된다고 들은 항목이 계약서에 빠져 있어, 목록으로 추가하는 것이 좋습니다. |
| `sd_passed` | 약속한 날짜가 지났으므로, 상대방이 계속 진행할 의사가 있는지와 계약금 처리를 먼저 확인해야 합니다. |

### 특수 사건 (퍼널 대신 "VFBCAI 전문가팀 진행" 안내로 표시)
- 계약금을 보낸 뒤 상대방과 연락이 끊겼거나, 사기로 의심해 공안 신고를 이미 했거나 하려는 경우
- 같은 물건을 두고 이미 소송이나 분쟁이 진행 중이라고 들은 경우
- 공동 상속인 등 소유자가 여러 명이고 그중 일부와 연락이 되지 않는 경우
- 법인이 여러 건물·여러 호실을 한꺼번에 빌리거나 사는 경우
- 판단: 직접 입력 텍스트에 위 내용이 있거나, `sd_passed` + `dp_cash_no_receipt|dp_via_broker` 조합일 때 전문가팀 안내 배너를 함께 표시

---

### 1차 결과 §03 소제목 [대표 승인 2026-10-07, C1.21]
- firstResultCautionsSectionSubtitle: `| 계약 전 확인 핵심 포인트`

## 3. 1차 결과 "핵심 확인 결과" 3칸 문장 규칙

| 칸 | 조합 기준 | 문장 규칙 | 예시 |
|---|---|---|---|
| 상황 | `re01_contract_type` + `re01_progress_stage` | "[계약 종류]를 앞두고 있고, 현재 [진행 단계] 상태입니다." 한 문장 | 살 집을 빌리는 임대차 계약을 앞두고 있고, 계약서 초안을 받은 뒤 아직 서명이나 송금은 하지 않은 상태입니다. |
| 확인 목표 | `re01_confirm_goal` + `re01_owner_doc_check` | "[우선 확인 목표]를 먼저 확인해야 하며, 소유자 확인은 [확인 상태]입니다." 한 문장 | 계약서에 불리한 조항이 없는지 먼저 확인해야 하며, 소유자 확인은 핑크북 사본만 받은 상태라 원본 대조가 남아 있습니다. |
| 대응·자료 | `re01_owner_doc_check` + `re01_progress_stage` | "서명이나 송금 전에 [다음 행동]이 필요하고, [준비할 자료]를 준비해 두세요." 한 문장 | 서명 전에 핑크북 원본과 집주인 신분증을 대조하는 것이 필요하고, 계약서 초안과 중개인 메시지를 함께 준비해 두세요. |

- 단계별 "다음 행동" 문구: `st_viewing` → 계약서 초안을 서면으로 받는 것 / `st_draft`·`st_sign_scheduled` → 조항 검토와 소유자 원본 대조 / `st_deposit_requested` → 송금 전에 계좌 명의와 위약 조항 확인 / `st_deposit_paid` → 계약금 영수증 확보와 본계약 조건 확정
- 법적 결과는 단정하지 않고 "~할 수 있습니다 / ~확인이 필요합니다"로 끝낸다.

---

## 4. "지금 확인해 보세요" STEP 3개

1. **소유자와 서명 권한 확인** — 핑크북 원본의 소유자 이름·주소·변동 사항 페이지를 상대방 신분증과 대조하고, 대리인이 서명한다면 공증된 위임장의 위임 범위를 확인하세요. (분양이면 개발사의 사업 서류와 외국인 구매 가능 물량을 서면으로 받으세요.)
2. **돈을 보내기 전 조건 확인** — 송금 계좌가 소유자(또는 개발사) 본인 명의인지 확인하고, 계약금 몰수와 배액 반환이 양쪽 모두에게 적용된다는 문구와 서명된 영수증을 받을 수 있는지 확인하세요.
3. **서명 전 계약서 마무리** — 계약서를 이해할 수 있는 언어로 받고 어느 언어를 우선하는지 적어 두며, 공증 여부와 함께 [임대: 임시거주 신고 책임 / 상가·사무실: 사용 용도와 회사 주소 등록 / 매매: 명의 이전 일정과 담보 해제 순서]를 계약서에 넣어 두세요.
