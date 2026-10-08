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
  - `transfer_delay` — 매매 계약은 맺었지만, 약속한 시점이 되어도 제 이름으로 명의 이전이 끝나지 않고 있습니다.
  - `project_book_pending` — 분양 아파트나 신축 주택을 샀지만, 약속한 시점이 지나도 핑크북이 발급되지 않고 있습니다.
  - `book_mismatch` — 핑크북을 확인해 보니, 소유자 이름이나 면적이 계약 내용이나 실제 집과 다릅니다.
  - `foreign_eligibility` — 외국인인 제가 이 집을 제 이름으로 소유할 수 있는지 확실하지 않아, 진행이 멈춰 있습니다.
  - `registration_rejected` — 명의 이전이나 핑크북 발급을 신청했지만, 토지등록사무소에서 받아들이지 않는다는 통지를 받았습니다.

#### re05_paidStage
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 거래에서 지금까지 돈은 어디까지 지급하셨나요?
- 선택지:
  - `paid_deposit` — 계약금(đặt cọc)만 지급했고, 중도금과 잔금은 아직 지급하지 않았습니다.
  - `paid_interim` — 계약금과 중도금까지 지급했고, 잔금은 명의 이전이나 핑크북을 받을 때 지급하기로 했습니다.
  - `paid_balance` — 잔금까지 모두 지급했지만, 아직 제 이름으로 권리가 넘어오지 않았습니다.
  - `paid_via_broker` — 매도인이 아닌 중개인이나 지인 계좌로 돈을 보냈고, 매도인이 실제로 받았는지는 확인하지 못했습니다.
  - `paid_nothing` — 아직 돈을 지급하지 않았고, 계약 전에 서류를 확인하고 있는 단계입니다.

#### re05_counterparty
- phase: 1 / kind: single / show_if: 항상
- 질문: 이 거래의 상대방은 누구인가요?
- 선택지:
  - `cp_individual_seller` — 핑크북을 가진 개인 매도인과 직접 계약했고, 지금도 매도인과 연락이 됩니다.
  - `cp_developer` — 분양 회사와 직접 분양 계약을 맺었고, 회사 담당자를 통해 진행하고 있습니다.
  - `cp_resale_buyer` — 먼저 분양받은 사람에게서 분양 계약을 넘겨받았고, 분양 회사와 직접 계약하지는 않았습니다.
  - `cp_broker_only` — 중개인을 통해서만 진행했고, 매도인을 직접 만나거나 연락한 적은 없습니다.
  - `cp_owner_unclear` — 계약은 했지만, 핑크북상 실제 권리자가 누구인지 확실하지 않습니다.

#### re05_confirmGoal
- phase: 1 / kind: single / show_if: 항상
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `cg_why_stuck` — 명의 이전이나 핑크북 발급이 왜 멈춰 있는지, 그 원인부터 확인하고 싶습니다.
  - `cg_doc_valid` — 받은 핑크북이나 계약서가 진짜인지, 적힌 내용이 맞는지 확인하고 싶습니다.
  - `cg_foreign_ok` — 외국인인 제가 이 집을 제 이름으로 소유할 수 있는지, 어떤 조건이 붙는지 확인하고 싶습니다.
  - `cg_money_safe` — 이미 지급한 돈이 안전한지, 남은 돈을 계속 지급해도 되는지 확인하고 싶습니다.
  - `cg_order` — 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.

---

### 2차 (phase 2) — 단계별 상세 (re05_stage에 따라 1개만 노출)

#### re05_transferDelayDetail
- phase: 2 / kind: single / show_if: re05_stage = transfer_delay
- 질문: 명의 이전은 지금 어느 단계에서 멈춰 있나요?
- 선택지:
  - `td_seller_docs` — 계약은 마쳤지만, 매도인이 핑크북 원본이나 신청에 필요한 서류를 아직 넘겨주지 않았습니다.
  - `td_mortgage` — 매도인의 은행 담보가 아직 풀리지 않아, 명의 이전 신청을 하지 못하고 있습니다.
  - `td_filed_waiting` — 토지등록사무소에 신청서는 접수되었지만, 안내받은 처리 기간이 지나도 결과가 나오지 않았습니다.
  - `td_tax_stage` — 세금 납부 안내까지 받았지만, 누가 세금을 납부할지 정리되지 않아 멈춰 있습니다.
  - `td_stage_unknown` — 절차를 매도인이나 중개인이 맡고 있어, 지금 어느 단계인지 알지 못합니다.

#### re05_projectBookDetail
- phase: 2 / kind: single / show_if: re05_stage = project_book_pending
- 질문: 핑크북이 발급되지 않은 이유를 어떻게 안내받으셨나요?
- 선택지:
  - `pb_not_applied` — 집은 인도받았지만, 분양 회사가 아직 핑크북 발급 신청을 하지 않았다고 합니다.
  - `pb_project_legal` — 분양 회사가 프로젝트 전체의 법적 절차가 끝나지 않아 핑크북 발급이 늦어진다고 설명했습니다.
  - `pb_project_mortgage` — 분양 회사가 프로젝트를 은행 담보로 잡혀 두었고, 그 담보가 풀려야 발급된다고 들었습니다.
  - `pb_applied_no_proof` — 분양 회사는 이미 신청했다고 하지만, 접수증 같은 근거는 받지 못했습니다.
  - `pb_last_payment_hold` — 마지막 잔금(약 5%)은 핑크북을 받을 때 지급하기로 했고, 발급 일정은 따로 안내받지 못했습니다.

#### re05_mismatchDetail
- phase: 2 / kind: multi / show_if: re05_stage = book_mismatch
- 질문: 핑크북에서 계약 내용이나 실제 집과 다른 부분을 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `mm_owner_name` — 소유자 이름(계약한 매도인과 다른 사람이거나, 공동 소유자가 더 있음)
  - `mm_area` — 면적(계약서나 실제 집의 ㎡와 다름)
  - `mm_address_use` — 주소·지번·호수, 또는 토지 용도·사용 기간
  - `mm_forgery_suspect` — 핑크북 자체가 진짜가 아닐 수 있다는 말을 들음
  - `mm_unsure` — 다르다는 말은 들었지만, 어느 부분인지 알지 못함

#### re05_foreignDetail
- phase: 2 / kind: single / show_if: re05_stage = foreign_eligibility
- 질문: 외국인 소유 문제는 어떤 상황에서 생겼나요?
- 선택지:
  - `fe_land_house` — 분양 프로젝트가 아닌, 땅이 딸린 단독주택이나 타운하우스를 사려고 했습니다.
  - `fe_quota_full` — 분양 아파트인데, 그 건물에서 외국인이 살 수 있는 물량이 다 찼다는 말을 들었습니다.
  - `fe_term_limit` — 소유는 가능하지만 기간이 50년으로 정해진다는 설명을 들었고, 그 조건을 아직 확인하지 못했습니다.
  - `fe_nominee` — 외국인 명의가 어렵다고 해서, 베트남인 지인 이름으로 계약하거나 등록하려고 합니다.
  - `fe_told_unclear` — 외국인은 안 된다는 말만 들었고, 정확한 이유는 설명받지 못했습니다.

#### re05_rejectionDetail
- phase: 2 / kind: single / show_if: re05_stage = registration_rejected
- 질문: 토지등록사무소는 신청을 받아들이지 않는 이유를 어떻게 설명했나요?
- 선택지:
  - `rj_docs_missing` — 서류가 빠졌거나 서류끼리 내용이 맞지 않는다며, 고칠 부분을 알려 주었습니다.
  - `rj_foreign_status` — 외국인 명의로는 등록할 수 없는 집이라는 이유를 들었습니다.
  - `rj_seller_side` — 매도인 쪽의 은행 담보·압류·분쟁 기록 때문에 명의 이전을 할 수 없다고 했습니다.
  - `rj_no_reason` — 통지는 받았지만, 이유는 적혀 있지 않았습니다.
  - `rj_not_understood` — 이유가 적혀 있지만, 베트남어나 법률 용어 때문에 이해하지 못했습니다.

---

### 2차 (phase 2) — 권리·금액·계약 확인

#### re05_paidAmount
- phase: 2 / kind: text / show_if: re05_paidStage = paid_deposit|paid_interim|paid_balance|paid_via_broker
- 질문: 지금까지 지급한 금액과 전체 매매 금액을 적어 주세요.
- placeholder: 예: 전체 매매 금액 35억 동 중 계약금 3억 5천만 동과 중도금 10억 동을 매도인 계좌로 송금했습니다.

#### re05_nameOnDocs
- phase: 2 / kind: single / show_if: re05_stage = transfer_delay|foreign_eligibility|registration_rejected
- 질문: 핑크북과 매매계약서에는 각각 누구의 이름이 적혀 있나요?
- 선택지:
  - `nm_match` — 핑크북의 소유자와 계약서의 매도인이 같은 사람이고, 신분증으로도 확인했습니다.
  - `nm_family_coowner` — 핑크북에 매도인 외에 배우자나 가족도 함께 적혀 있는데, 계약서에는 매도인만 서명했습니다.
  - `nm_proxy` — 핑크북 소유자는 따로 있고, 계약은 위임장을 가진 대리인과 맺었습니다.
  - `nm_buyer_vn_name` — 계약서의 매수인이 제가 아니라 베트남인 지인 이름으로 되어 있습니다.
  - `nm_not_seen` — 핑크북 원본이나 사본을 직접 보지 못해, 누구 이름인지 확인하지 못했습니다.

#### re05_mortgage
- phase: 2 / kind: single / show_if: re05_stage = book_mismatch
- 질문: 이 집이 은행 담보로 잡혀 있는지 확인하셨나요?
- 선택지:
  - `mg_none_confirmed` — 핑크북 뒷면 기재란이나 토지등록사무소 조회로, 담보가 없다는 것을 확인했습니다.
  - `mg_release_planned` — 은행 담보가 있고, 제가 지급하는 잔금으로 담보를 풀기로 매도인과 약속했습니다.
  - `mg_release_unclear` — 은행 담보가 있다고 들었지만, 언제 어떻게 풀리는지는 확인하지 못했습니다.
  - `mg_paid_not_released` — 담보를 풀 돈을 이미 지급했지만, 은행에서 담보가 해제되었는지 확인되지 않습니다.
  - `mg_unknown` — 담보 여부를 확인해 본 적이 없거나, 확인하는 방법을 모릅니다.

#### re05_promisedDate
- phase: 2 / kind: single / show_if: re05_stage = transfer_delay|project_book_pending
- 질문: 명의 이전이나 핑크북 발급은 언제까지 해 주기로 약속받으셨나요?
- 선택지:
  - `pd_written_passed` — 계약서에 날짜가 적혀 있고, 그 날짜가 이미 지났습니다.
  - `pd_written_upcoming` — 계약서에 날짜가 적혀 있고, 아직 그 날짜가 되지 않았습니다.
  - `pd_verbal_passed` — 말이나 메시지로만 약속받았고, 그 시점이 이미 지났습니다.
  - `pd_postponed` — 여러 차례 날짜를 다시 미루었고, 지금은 새 날짜도 정해지지 않았습니다.
  - `pd_none` — 언제까지 해 주겠다는 약속은 받은 적이 없습니다.

#### re05_counterpartyExplanation
- phase: 2 / kind: single / show_if: re05_promisedDate = pd_written_passed|pd_verbal_passed|pd_postponed
- 질문: 약속한 날짜가 지난 이유를 상대방은 어떻게 설명했나요?
- 선택지:
  - `ex_procedure` — 기관 절차가 늦어지고 있을 뿐이라며, 조금 더 기다려 달라고 했습니다.
  - `ex_tax_demand` — 명의 이전에 따른 세금을 제가 납부해야 진행된다며, 계약에 없던 금액을 요구했습니다.
  - `ex_extra_cost` — 급행 비용이나 명목이 분명하지 않은 추가 비용을 내야 진행된다고 했습니다.
  - `ex_no_explanation` — 이유를 설명하지 않거나, 연락을 피하고 있습니다.
  - `ex_other_dispute` — 상속·이혼·채무 같은 다른 분쟁이 있어, 그 문제가 먼저 풀려야 한다고 했습니다.

#### re05_contractForm
- phase: 2 / kind: single / show_if: 항상
- 질문: 매매 계약은 어떤 형태로 맺으셨나요?
- 선택지:
  - `cf_notarized_bilingual` — 공증사무소에서 공증받은 매매계약서가 있고, 한국어나 영어 번역도 함께 있습니다.
  - `cf_notarized_vn_only` — 공증사무소에서 공증받은 매매계약서가 있지만, 베트남어로만 되어 있어 내용을 다 이해하지 못했습니다.
  - `cf_developer_contract` — 분양 회사와 맺은 분양 계약서나 이를 넘겨받은 계약서가 있고, 공증은 하지 않았습니다.
  - `cf_deposit_only` — 계약금 약정서만 썼고, 정식 매매계약서는 아직 쓰지 않았습니다.
  - `cf_informal_only` — 직접 쓴 계약서나 메시지 약속만 있고, 공증받은 계약서는 없습니다.

#### re05_handoverCompare
- phase: 2 / kind: single / show_if: re05_stage = project_book_pending
- 질문: 인도받은 집은 분양 계약 내용과 비교하면 어떤가요?
- 선택지:
  - `hc_match` — 인도받은 집의 면적·호수·구조가 분양 계약 내용과 거의 같습니다.
  - `hc_area_diff` — 실제 면적이 계약 면적과 달라, 금액 정산 문제가 남아 있습니다.
  - `hc_spec_diff` — 면적은 비슷하지만, 구조·마감·부대시설이 계약 내용과 다릅니다.
  - `hc_not_handed` — 아직 집을 인도받지 못해, 실제와 비교할 수 없습니다.
  - `hc_no_contract_copy` — 분양 계약서나 도면을 가지고 있지 않아, 비교하기 어렵습니다.

#### re05_infoSource
- phase: 2 / kind: single / show_if: re05_stage = book_mismatch|foreign_eligibility|registration_rejected
- 질문: 이 문제는 어떤 경로로 알게 되셨나요?
- 선택지:
  - `is_office_direct` — 토지등록사무소나 공증사무소에서 직접 안내를 받았습니다.
  - `is_counterparty` — 매도인이나 분양 회사로부터 직접 들었습니다.
  - `is_broker_relay` — 중개인이 전해 주었고, 원래 안내나 서류를 직접 보지는 못했습니다.
  - `is_self_check` — 제가 핑크북 사본과 계약서를 직접 비교하다가 알게 되었습니다.
  - `is_hearsay` — 지인이나 다른 매수인에게 들었고, 아직 공식적으로 확인하지 못했습니다.

---

### 2차 (phase 2) — 대응·자료·막힘·기한·목표

#### re05_customerResponse
- phase: 2 / kind: single / show_if: 항상
- 질문: 문제를 알게 된 뒤, 지금까지 어떻게 대응하셨나요?
- 선택지:
  - `rs_none` — 아직 상대방이나 기관에 따로 연락하지 않았습니다.
  - `rs_asked_counterparty` — 매도인이나 분양 회사에 직접 연락해, 진행 상황을 물어보았습니다.
  - `rs_via_broker` — 중개인을 통해 진행을 재촉했고, 직접 연락하지는 않았습니다.
  - `rs_asked_office` — 토지등록사무소나 공증사무소에 직접 문의했습니다.
  - `rs_hold_and_demand` — 남은 돈의 지급을 멈추고, 서면이나 메시지로 약속을 지켜 달라고 요구했습니다.

#### re05_responseReaction
- phase: 2 / kind: single / show_if: re05_customerResponse = rs_asked_counterparty|rs_via_broker|rs_asked_office|rs_hold_and_demand
- 질문: 대응한 뒤, 상대방이나 기관은 어떻게 반응했나요?
- 선택지:
  - `rr_new_date` — 새 날짜를 약속했지만, 서면으로 받지는 못했습니다.
  - `rr_more_money` — 진행하려면 추가 금액이나 세금을 더 내야 한다고 했습니다.
  - `rr_blame_other` — 서로 책임을 미루며, 누가 처리해야 하는지 분명히 말하지 않았습니다.
  - `rr_no_contact` — 답변이 없거나, 연락이 끊겼습니다.
  - `rr_cancel_mentioned` — 상대방이 계약 해제나 계약금 문제를 먼저 꺼냈습니다.

#### re05_evidence
- phase: 2 / kind: multi / show_if: 항상
- 질문: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `ev_pinkbook` — 핑크북 원본이나 앞·뒷면 사본·사진
  - `ev_contracts` — 매매계약서·분양 계약서·계약금 약정서(공증본 포함)
  - `ev_payment_proof` — 은행 송금 내역이나 돈을 받았다는 영수증
  - `ev_records` — 토지등록사무소 접수증·통지서, 또는 상대방·중개인과 주고받은 메시지
  - `ev_none` — 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.

#### re05_blockage
- phase: 2 / kind: single / show_if: 항상
- 질문: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `bk_cause_unknown` — 무엇 때문에 멈춰 있는지 알 수 없어, 어떻게 대응할지 판단하지 못하고 있습니다.
  - `bk_counterparty` — 상대방이 서류를 넘겨주지 않거나 연락이 되지 않아, 제 쪽에서 진행할 수 없습니다.
  - `bk_money_decision` — 남은 돈을 지급해야 할지 멈춰야 할지 판단하지 못해, 결정을 미루고 있습니다.
  - `bk_eligibility` — 외국인인 제가 소유할 수 있는지 확실하지 않아, 진행 여부를 정하지 못하고 있습니다.
  - `bk_docs_language` — 서류가 베트남어로 되어 있고 절차를 몰라, 무엇을 준비해야 할지 모르겠습니다.

#### re05_deadline
- phase: 2 / kind: single / show_if: 항상
- 질문: 이 일과 관련해 앞으로 지켜야 하거나 다가오는 날짜가 있나요?
- 선택지:
  - `dl_next_payment` — 다음 중도금이나 잔금을 지급해야 하는 날짜가 정해져 있습니다.
  - `dl_notice_period` — 통지서나 기관 안내에 다시 신청하거나 보완할 수 있는 기간이 적혀 있습니다.
  - `dl_personal` — 입주·출국·비자 갱신 같은 제 일정 때문에, 그 전에 마무리해야 합니다.
  - `dl_none` — 정해진 날짜나 기한은 따로 없습니다.
  - `dl_unsure` — 서류가 베트남어로 되어 있어, 기한이 적혀 있는지조차 확인하지 못했습니다.

#### re05_deadlineDate
- phase: 2 / kind: text / show_if: re05_deadline = dl_next_payment|dl_notice_period|dl_personal
- 질문: 확인한 날짜와, 그날까지 해야 하는 일을 적어 주세요.
- placeholder: 예: 2026년 11월 30일까지 잔금 15억 동을 지급해야 하고, 그 전에 명의 이전 신청 접수를 확인하고 싶습니다.

#### re05_finalGoal
- phase: 2 / kind: single / show_if: 항상
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `fg_complete_transfer` — 막힌 원인을 확인하고, 제 이름으로 명의 이전이나 핑크북 발급을 끝까지 마치고 싶습니다.
  - `fg_cancel_refund` — 거래를 계속하기 어렵다면, 계약을 정리하고 지급한 돈을 돌려받는 방법을 확인하고 싶습니다.
  - `fg_safety_check` — 남은 돈을 지급하기 전에, 이 거래가 안전한지 서류와 권리관계를 확인하고 싶습니다.
  - `fg_expert` — 제 상황을 전문가에게 정확히 전달해, 상대방과 기관 대응을 맡기고 싶습니다.

---

## 결과 신호

### 위험 신호 선택지 → 결과 화면 위험 문장 / 판정 단계

| 선택지 | 결과 화면 위험 문장 | 판정 |
|---|---|---|
| `paid_balance` (+ re05_stage = transfer_delay\|project_book_pending) | 잔금까지 지급한 뒤에도 권리가 넘어오지 않아, 남은 협상 수단이 적은 상태일 수 있습니다. | 주의 |
| `paid_via_broker` | 매도인이 아닌 사람에게 보낸 돈은, 실제로 매도인에게 전달되었는지 따로 확인해야 합니다. | 주의 |
| `cp_broker_only` | 매도인을 직접 확인하지 않은 거래는, 계약 상대가 실제 권리자인지부터 확인해야 합니다. | 주의 |
| `cp_resale_buyer` | 분양 계약을 넘겨받은 경우, 분양 회사가 그 이전을 인정했는지에 따라 핑크북 발급 대상이 달라질 수 있습니다. | 확인 필요 |
| `cp_owner_unclear` | 실제 권리자가 확인되지 않으면, 이미 맺은 계약으로 명의 이전이 진행되지 않을 수 있습니다. | 전문가 권장 |
| `td_mortgage` / `mg_release_unclear` | 은행 담보가 풀리지 않으면 명의 이전 신청 자체가 받아들여지지 않을 수 있습니다. | 주의 |
| `mg_paid_not_released` | 담보를 풀 돈을 지급했는데 해제가 확인되지 않으면, 그 돈의 사용처부터 확인해야 합니다. | 전문가 권장 |
| `mg_unknown` | 은행 담보 여부는 핑크북 뒷면 기재란이나 토지등록사무소에서 먼저 확인해야 합니다. | 확인 필요 |
| `td_stage_unknown` / `td_filed_waiting` | 신청 접수 여부와 처리 단계를 확인할 근거(접수증)가 필요합니다. | 확인 필요 |
| `td_tax_stage` / `ex_tax_demand` | 세금을 누가 납부하는지는 계약서 조항에 따라 달라지므로, 계약서 내용과 먼저 대조해야 합니다. | 확인 필요 |
| `pb_project_mortgage` / `pb_project_legal` | 프로젝트 전체의 담보나 법적 절차 문제는 개별 매수인이 앞당기기 어려워, 발급이 길어질 수 있습니다. | 주의 |
| `pb_applied_no_proof` | 신청했다는 말만 있고 접수 근거가 없으면, 실제 신청 여부를 따로 확인해야 합니다. | 확인 필요 |
| `hc_area_diff` | 실제 면적이 계약과 다르면, 핑크북 발급 전에 금액 정산 기준을 계약서로 확인해야 합니다. | 확인 필요 |
| `mm_owner_name` | 핑크북 소유자가 계약 상대와 다르면, 그 사람의 동의 없이 맺은 계약은 명의 이전이 진행되지 않을 수 있습니다. | 전문가 권장 |
| `mm_area` / `mm_address_use` | 핑크북 내용이 계약과 다르면, 어느 쪽을 기준으로 바로잡을지 먼저 정해야 합니다. | 확인 필요 |
| `mm_forgery_suspect` | 핑크북이 진짜가 아닐 가능성이 있다면, 추가 지급을 멈추고 토지등록사무소 기록부터 확인해야 합니다. (특수 사건: VFBCAI 전문가팀 진행) | 전문가 권장 |
| `nm_family_coowner` | 핑크북의 공동 소유자 전원이 동의하지 않으면, 명의 이전이 진행되지 않을 수 있습니다. | 주의 |
| `nm_proxy` | 대리인과 맺은 계약은 위임장이 공증되었는지, 매매 권한이 포함되었는지 확인해야 합니다. | 주의 |
| `nm_not_seen` | 핑크북을 직접 보지 못한 상태라면, 누구의 권리인지부터 확인해야 합니다. | 주의 |
| `nm_buyer_vn_name` / `fe_nominee` | 다른 사람 이름으로 등록한 집은, 그 사람이 권리를 주장할 때 돌려받기 어려울 수 있습니다. | 전문가 권장 |
| `fe_land_house` / `rj_foreign_status` | 외국인은 집의 종류와 위치에 따라 소유가 제한될 수 있어, 거래 전 조건 확인이 필요합니다. | 주의 |
| `fe_quota_full` | 외국인 소유 물량이 찬 건물이라면, 계약을 해도 외국인 명의로 핑크북을 받지 못할 수 있습니다. | 주의 |
| `rj_seller_side` | 매도인 쪽의 압류·분쟁 기록은 매수인이 혼자 풀 수 없는 문제일 수 있습니다. (특수 사건: VFBCAI 전문가팀 진행) | 전문가 권장 |
| `pd_postponed` / `pd_written_passed` | 약속한 날짜가 지난 경우, 계약서의 지연 조항과 해제 조건을 확인해야 합니다. | 주의 |
| `ex_extra_cost` / `rr_more_money` | 계약에 없던 비용 요구는, 명목과 영수증을 서면으로 받은 뒤에 판단해야 합니다. | 주의 |
| `ex_no_explanation` / `rr_no_contact` | 상대방이 연락을 피하면, 그동안의 지급 내역과 연락 기록을 먼저 정리해 두어야 합니다. | 주의 |
| `ex_other_dispute` | 상속·이혼·채무 분쟁은 여러 당사자가 얽혀, 매매 계약만으로 해결되지 않을 수 있습니다. (특수 사건: VFBCAI 전문가팀 진행) | 전문가 권장 |
| `rr_cancel_mentioned` | 상대방이 계약 해제를 먼저 꺼낸 경우, 계약금 몰수나 배액 반환 조항을 확인한 뒤 답해야 합니다. | 전문가 권장 |
| `cf_deposit_only` / `cf_informal_only` | 공증받은 매매계약서가 없으면, 명의 이전 신청에 쓸 수 있는 계약이 아직 없는 상태일 수 있습니다. | 주의 |
| `cf_notarized_vn_only` | 공증 계약서의 명의 이전 기한·세금 부담·해제 조항을 번역해 확인해야 합니다. | 확인 필요 |
| `bk_money_decision` | 남은 돈의 지급 여부는 계약서의 지급 조건과 권리 서류 상태를 함께 보고 정해야 합니다. | 확인 필요 |
| `dl_notice_period` | 통지서에 적힌 기간이 지나면 다시 신청해야 할 수 있어, 날짜부터 확인해야 합니다. | 주의 |
| `ev_none` | 지급 내역과 계약서가 없으면, 지급한 돈과 약속 내용을 증명하기 어려울 수 있습니다. | 확인 필요 |

- 판정 합산 규칙: 전문가 권장 1개 이상 → "전문가 권장" / 주의 2개 이상 → "주의" / 그 외 → "확인 필요".
- 특수 사건 표시(`mm_forgery_suspect`, `rj_seller_side`, `ex_other_dispute`, 직접 입력에 소송·형사 고소 언급): 퍼널 결과 대신 "VFBCAI 전문가팀 진행" 안내.

### 1차 판정 하한 [대표 승인 2026-10-07, C1.22]
- firstResultVerdictFloor: true
- 계약 이후 명의·지급 문제 서비스: 1차 판정 최소 주의 요망(2단계). Pack 합산이 더 높은 단계면 유지.

### 1차 결과 §03 위험 0건 + 판정 하한 [대표 승인 2026-10-07, C1.25]
- firstResultNoRiskFloorTitle: `먼저 확인할 사항`
- firstResultNoRiskFloorBody: `계약서·지급 영수증과 권리 서류(명의 이전·핑크북) 현재 상태를 먼저 대조해 보세요. 지급한 돈과 서류 상태가 맞는지가 출발점입니다.`

### 1차 결과 §03 소제목 [대표 승인 2026-10-07, C1.21]
- firstResultCautionsSectionSubtitle: `| 권리·지급 확인 핵심 포인트`

### 1차 결과 "핵심 확인 결과" 3칸 문장 규칙

1. **상황** = re05_stage 요약 + re05_counterparty 요약 + re05_paidStage 요약
   - 형식: "{상대방}과의 거래에서 {지급 단계} 상태이며, {문제 상황}."
   - stage 요약: transfer_delay "명의 이전이 약속한 시점에 끝나지 않고 있습니다" / project_book_pending "핑크북이 아직 발급되지 않았습니다" / book_mismatch "핑크북 내용이 계약이나 실제 집과 다릅니다" / foreign_eligibility "외국인 소유 가능 여부가 확인되지 않았습니다" / registration_rejected "토지등록사무소에서 신청을 받아들이지 않았습니다"
   - counterparty 요약: 개인 매도인 / 분양 회사 / 분양 계약을 넘겨준 사람 / 중개인을 통한 매도인 / 권리자가 확인되지 않은 상대방
   - paidStage 요약: 계약금만 지급한 / 중도금까지 지급한 / 잔금까지 지급한 / 중개인·지인 계좌로 지급한 / 아직 지급하지 않은
2. **확인 목표** = re05_confirmGoal 문장을 "~확인합니다"로 바꿔 표시
   - cg_why_stuck "멈춰 있는 원인을 확인합니다" / cg_doc_valid "핑크북과 계약서의 진위와 내용을 확인합니다" / cg_foreign_ok "외국인 명의 소유 가능 여부와 조건을 확인합니다" / cg_money_safe "지급한 돈의 안전과 남은 돈의 지급 여부를 확인합니다" / cg_order "진행 순서를 정리합니다"
3. **대응·자료** = `re05_paidStage`별 1문장 (phase1 m3). [대표 승인 2026-10-07, C1.21]
   - `r5_paid_nothing` → "계약서 초안, 핑크북 사본, 상대방과 주고받은 메시지를 먼저 모아 두세요."
   - `r5_paid_deposit` → "계약서, 계약금 송금 내역, 명의 이전 일정에 관한 메시지를 먼저 모아 두세요."
   - `r5_paid_interim` → "계약서, 계약금·중도금 송금 내역, 명의 이전 일정에 관한 메시지를 먼저 모아 두세요."
   - `r5_paid_balance` → "계약서, 잔금까지의 송금 내역과 영수증, 인도·명의 이전 관련 서류와 메시지를 먼저 모아 두세요."
   - `r5_paid_via_broker` → "송금을 받은 계좌의 명의와 송금 영수증, 중개인과 주고받은 메시지를 먼저 모아 두세요."
   - 2차 응답 후 종합 결과는 기존 Pack 규칙(대응·보관 자료 요약)을 따른다.

### "지금 확인해 보세요" STEP 3개

- STEP 1. 핑크북 원본이나 앞·뒷면 사본에서 소유자 이름, 면적, 주소, 뒷면의 담보 기재 내용을 확인해 주세요.
  - (re05_stage = project_book_pending이면 대체) 분양 계약서에서 핑크북 발급 기한과 마지막 잔금 지급 조건이 적힌 조항을 찾아 주세요.
  - (re05_stage = foreign_eligibility이면 대체) 이 집이 분양 프로젝트 안의 아파트인지, 땅이 딸린 주택인지 계약서와 분양 자료로 확인해 주세요.
- STEP 2. 계약서에서 명의 이전 기한, 세금 부담자, 잔금 지급 조건, 지연·해제 시 계약금 처리 조항을 찾아 표시해 주세요.
- STEP 3. 지금까지 지급한 금액을 날짜·금액·받은 사람 순으로 정리하고, 상대방에게 현재 진행 단계와 예정일을 메시지로 받아 두세요.
  - (re05_stage = registration_rejected이면 대체) 통지서의 불수리 이유와 다시 신청할 수 있는 기간을 번역해 확인하고, 통지서 원본을 보관해 주세요.

---

## 대표 경로

- 경로 A (개인 매도인·명의 이전 지연): re05_stage(transfer_delay) → re05_paidStage → re05_counterparty → re05_confirmGoal → re05_transferDelayDetail → re05_paidAmount → re05_nameOnDocs → re05_promisedDate → re05_counterpartyExplanation → re05_contractForm → re05_customerResponse → re05_responseReaction → re05_evidence → re05_blockage → re05_deadline → re05_deadlineDate → re05_finalGoal
- 경로 B (분양·핑크북 미발급): re05_stage(project_book_pending) → re05_paidStage → re05_counterparty → re05_confirmGoal → re05_projectBookDetail → re05_paidAmount → re05_promisedDate → re05_counterpartyExplanation → re05_contractForm → re05_handoverCompare → re05_customerResponse → re05_responseReaction → re05_evidence → re05_blockage → re05_deadline → re05_finalGoal

### 2차 F-path fallback (C2.1 초안)
- phase2FallbackChain: `re05_transfer_status,re05_confirmGoal`

### 2차 개인화 결과 문구 (C2.3 초안)
- personalizedStageLabel: `매매·권리 서류 2차 종합 검토`
- personalizedIntegratedOk: `권리 확인 경로와 2차에서 추가로 확인한 이전·서류 조건을 함께 정리했습니다.`
- personalizedIntegratedCaution: `1차·2차 답변을 바탕으로, 명의·핑크북·담보 조건을 직접 대조할 부분이 남아 있습니다.`
- personalizedPhase2Empty: `2차 답변만으로 새로 드러난 위험 신호는 현재 보이지 않습니다.`
- personalizedDocumentsNeededNote: `핑크북·등기·매매 계약 등 원본을 대조하면 권리 확인 범위를 넓힐 수 있습니다.`
- personalizedCoreJudgmentOk: `현재까지 답변으로는 권리 확인 범위에서 큰 불일치가 보이지 않습니다.`
- personalizedCoreJudgmentCaution: `명의·담보·서류 상태는 추가 대조가 필요한 상태입니다.`
- personalizedCoreJudgmentExpert: `복합 권리 이슈가 겹쳐 VFBCAI 전문가팀 확인이 필요한 단계입니다.`
- personalizedPhase2MaintainedSummary: `2차 답변에서는 1차보다 더 나쁜 사정은 확인되지 않았고, 1차에서 확인된 {phase1Core} 상태가 그대로 유지됩니다.`
- personalizedPhase2ElevatedSummary: `1차에서 {phase1Core} 또한 2차에서는 {phase2Fact}`
- personalizedHeadlineMaintained: `1차에서 확인된 주의 사항이 유지되는 상태입니다`
- personalizedHeadlineElevated: `2차 답변으로 권리·서류 쪽 추가 확인이 필요합니다`
- personalizedHeadlineOk: `현재 확인한 범위에서는 큰 문제가 보이지 않습니다`
- personalizedPhase2Fact: `re05_finalGoal=fg_complete_transfer|2차에서는 명의 이전·핑크북 발급을 끝까지 마치는 것이 목표로 확인되었습니다.`
- personalizedPhase2Fact: `re05_blockage=bk_cause_unknown|2차에서는 멈춤 원인을 특정하지 못해 대응이 막힌 것으로 확인되었습니다.`

### 2차 개인화 요약 구조 (C2.3c 초안)
- personalizedPhase2MaintainedSentence2: `2차 답변에서도 이보다 나빠진 사정은 확인되지 않아, 1차 판정이 유지됩니다.`
- personalizedPhase2ElevatedSentence2: `2차 답변에서 {fact2}이 확인되어, 추가 확인이 필요한 부분이 더 늘었습니다.`
- personalizedPhase2Fact2: `re05_counterparty=r5_cp_owner_unclear|핑크북상 실제 권리자가 누구인지 확실하지 않다는 점`
- personalizedPhase2Fact2: `re05_mortgage=r5_mg_paid_not_released|담보 해제 비용을 냈으나 해제 확인이 안 된다는 점`
- personalizedPhase2Fact2: `re05_mismatchDetail=r5_mm_owner_name|핑크북 소유자와 계약 상대가 다르거나 공동 소유가 있다는 점`
- personalizedPhase2Fact2: `re05_mismatchDetail=r5_mm_forgery_suspect|핑크북 위조가 의심된다는 점`
- personalizedPhase2Fact2: `re05_nameOnDocs=r5_nm_buyer_vn_name|매수인 명의가 베트남인 지인으로 적혀 있다는 점`
- personalizedPhase2Fact2: `re05_foreignDetail=r5_fe_nominee|지인 명의로 등록하자는 이야기가 나왔다는 점`
- personalizedPhase2Fact2: `re05_rejectionDetail=r5_rj_seller_side|매도인 쪽 담보·압류 때문에 이전이 막혔다는 점`
- personalizedPhase2Fact2: `re05_counterpartyExplanation=r5_ex_other_dispute|상속·이혼 등 다른 분쟁이 먼저라는 설명을 들었다는 점`
- personalizedPhase2Fact2: `re05_responseReaction=r5_rr_cancel_mentioned|상대방이 계약 해제·계약금 문제를 먼저 꺼냈다는 점`
- personalizedPhase2Fact2: `re05_paidStage=r5_paid_via_broker|매도인이 아닌 계좌로 돈을 보냈다는 점`
- personalizedPhase2Fact2: `re05_counterparty=r5_cp_broker_only|매도인을 직접 만나지 않고 중개인 경로로만 진행했다는 점`
- personalizedPhase2Fact2: `re05_transferDelayDetail=r5_td_mortgage|매도인 은행 담보 때문에 이전 신청을 못 하고 있다는 점`
- personalizedPhase2Fact2: `re05_mortgage=r5_mg_release_unclear|담보 해제 시점·방법을 확인하지 못했다는 점`
- personalizedPhase2Fact2: `re05_projectBookDetail=r5_pb_project_mortgage|프로젝트 담보 때문에 핑크북 발급이 지연된다는 점`
- personalizedPhase2Fact2: `re05_projectBookDetail=r5_pb_project_legal|프로젝트 법적 절차 때문에 발급이 늦어진다는 점`
- personalizedPhase2Fact2: `re05_nameOnDocs=r5_nm_family_coowner|공동 소유자가 있는데 한 사람만 서명했다는 점`
- personalizedPhase2Fact2: `re05_nameOnDocs=r5_nm_proxy|대리인과 계약했고 위임 범위를 확인하지 못했다는 점`
- personalizedPhase2Fact2: `re05_nameOnDocs=r5_nm_not_seen|핑크북을 직접 확인하지 못했다는 점`
- personalizedPhase2Fact2: `re05_foreignDetail=r5_fe_land_house|분양이 아닌 단독·타운하우스를 사려는 상황이라는 점`
- personalizedPhase2Fact2: `re05_rejectionDetail=r5_rj_foreign_status|외국인 명의로 등록할 수 없다는 이유를 들었다는 점`
- personalizedPhase2Fact2: `re05_foreignDetail=r5_fe_quota_full|외국인 구매 물량이 찼다는 말을 들었다는 점`
- personalizedPhase2Fact2: `re05_promisedDate=r5_pd_postponed|약속 날짜가 여러 번 미뤄졌다는 점`
- personalizedPhase2Fact2: `re05_promisedDate=r5_pd_written_passed|계약서상 날짜가 이미 지났다는 점`
- personalizedPhase2Fact2: `re05_counterpartyExplanation=r5_ex_extra_cost|명목 불명의 추가 비용 요구를 들었다는 점`
- personalizedPhase2Fact2: `re05_responseReaction=r5_rr_more_money|추가 금액·세금 지급을 요구받았다는 점`
- personalizedPhase2Fact2: `re05_counterpartyExplanation=r5_ex_no_explanation|이유 설명 없이 연락을 피한다는 점`
- personalizedPhase2Fact2: `re05_responseReaction=r5_rr_no_contact|답이 없거나 연락이 끊겼다는 점`
- personalizedPhase2Fact2: `re05_contractForm=r5_cf_deposit_only|정식 매매계약서 없이 계약금 약정만 있다는 점`
- personalizedPhase2Fact2: `re05_contractForm=r5_cf_informal_only|공증 매매계약서 없이 글자 약정만 체결했다는 점`
- personalizedPhase2Fact2: `re05_deadline=r5_dl_notice_period|통지서·기관 안내에 보완 기한이 적혀 있다는 점`
- personalizedPhase2Fact2: `re05_stage=r5_registration_rejected|토지등록사무소에서 이전·발급이 거절됐다는 점`
- personalizedPhase2Fact2: `re05_stage=r5_book_mismatch|핑크북 내용이 계약·실제와 다르다는 점`
- personalizedPhase2Fact2: `re05_paidStage=r5_paid_balance|잔금까지 냈으나 명의가 넘어오지 않았다는 점`
- personalizedPhase2Fact2: `re05_counterparty=r5_cp_resale_buyer|분양권을 넘겨받았고 분양사와 직접 계약하지 않았다는 점`
- personalizedPhase2Fact2: `re05_mortgage=r5_mg_unknown|담보 여부를 확인하지 못했다는 점`
- personalizedPhase2Fact2: `re05_transferDelayDetail=r5_td_stage_unknown|이전 절차가 어느 단계인지 모른다는 점`
- personalizedPhase2Fact2: `re05_transferDelayDetail=r5_td_filed_waiting|신청은 했으나 결과가 나오지 않았다는 점`
- personalizedPhase2Fact2: `re05_transferDelayDetail=r5_td_tax_stage|세금 납부 주체가 정리되지 않아 멈춰 있다는 점`
- personalizedPhase2Fact2: `re05_counterpartyExplanation=r5_ex_tax_demand|계약에 없던 세금 지급을 요구받았다는 점`
- personalizedPhase2Fact2: `re05_projectBookDetail=r5_pb_applied_no_proof|핑크북 신청했다는 말만 있고 접수증이 없다는 점`
- personalizedPhase2Fact2: `re05_handoverCompare=r5_hc_area_diff|실제 면적과 계약 면적이 달라 정산 문제가 남았다는 점`
- personalizedPhase2Fact2: `re05_mismatchDetail=r5_mm_area|핑크북·계약·실제 면적이 다르다는 점`
- personalizedPhase2Fact2: `re05_mismatchDetail=r5_mm_address_use|주소·호수·토지 용도가 계약과 다르다는 점`
- personalizedPhase2Fact2: `re05_contractForm=r5_cf_notarized_vn_only|베트남어 공증 계약만 있고 내용을 다 이해하지 못했다는 점`
- personalizedPhase2Fact2: `re05_blockage=r5_bk_money_decision|추가 지급을 멈출지 결정하지 못하고 있다는 점`
- personalizedPhase2Fact2: `re05_evidence=r5_ev_none|대조할 자료가 없거나 아직 모은 상태라는 점`

### 2차 자료 제출 체크리스트 (승인됨 2026-10-07)
- phase2DocumentRequired: `계약서·지급 영수증`
- phase2DocumentRequired: `권리 서류(명의 이전·핑크북) 사본`
- phase2DocumentOptional: `중개·분양 관련 메시지`
- phase2DocumentExampleTag: `계약서`
- phase2DocumentExampleTag: `핑크북`
