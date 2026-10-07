# VFBCAI_REAL_ESTATE_CONTENT_PACK_MASTER_v1 (설계 승인본 · 법률 표현 2건 수정 반영)

- 원칙: 법적 조건이 많은 사항은 고객 화면에 법적 결론(숫자·기간)을 넣지 않고, 계약서·거래의 실제 사실을 질문으로 확보한다.

> 이번 작업은 기존 부동산 서비스를 고치는 작업이 아니다. LOCK된 Admin MASTER 엔진을 공용으로 사용하되, 부동산 전문가의 사고방식과 프로파일링 구조를 질문·선택지·조건부 분기만으로 새롭게 구현하는 완전한 Clean Build다. 기존 코드·질문·번역표·Content Pack은 재사용하지 않는다.

## A. CASE 구조
RE01 계약 전 검토 / RE02 보증금·계약금 분쟁 / RE03 위반·해지·퇴거 / RE04 거주 중 문제 / RE05 매매·권리 서류 / RE06 불명확·복합·전문가 재구성. CASE → 상황 → 세부 사건 → 다음 질문 구조(각 CASE F절).

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

# RE01 계약 전 검토 — VFBCAI_REAL_ESTATE_CONTENT_PACK_MASTER_v1

- 사건: 고객이 베트남에서 집·아파트·사무실을 빌리거나 사기 직전이며, 서명·송금 전에 계약서나 조건이 괜찮은지 확인하고 싶은 상황
- Q1(공용, 확정): "집을 빌리거나 사기 전이라, 계약서나 조건이 괜찮은지 먼저 확인하고 싶습니다."
- 기준 파일: pack-RE01.md(v1). v1 질문·선택지 문장과 value는 유지하고, 아래 "변경" 표시가 붙은 곳만 고쳤다.
- 질문 id 접두사 `re01_` / 선택지 value는 질문별 고유 접두사. 이번에 추가한 접두사: `bs_`, `pr_`, `pj_`, `pa_`, `cp_` (기존 접두사와 중복 없음)
- 엔진 공용 선택지 "위에 내용이 없거나 설명이 필요합니다 → 직접 입력"은 각 single/multi 질문에 자동으로 붙으므로 적지 않음
- 노드 수: 1차 4개(Q1 제외) / 2차 28개(v1 23개 + 추가 5개, 삭제 0개)
- meaning 표기: `key=value; key=value`. 같은 key는 CASE 전체에서 같은 뜻으로만 쓴다. text 노드는 입력 원문이 profile_field 값이 된다.

---

## B. 전문가 프로파일링 구조

계약 전 검토에서 전문가가 첫 상담에서 확인하는 순서는 "무슨 계약인가 → 어디까지 왔나 → 상대방이 진짜 권한자인가 → 돈이 어디로, 어떤 조건으로 가나 → 계약서가 들은 조건과 같은가 → 외국인으로서 이 계약의 목적(거주·영업·소유)을 이룰 수 있나 → 언제까지 결정해야 하나"이다. 아래 축이 Situation Profile의 상위 묶음이다.

| 사실 축 | 전문가가 알아야 하는 것 | Situation Profile 필드 | 채우는 질문 id |
|---|---|---|---|
| 목표 | 고객이 가장 먼저 풀고 싶은 확인 사항 | `goal.primary` | re01_confirm_goal |
| 시작점 | 어떤 계약이고, 조건을 누구에게서 어떻게 들었는가 | `contract.type`, `property.use`, `channel.source`, `channel.medium` | re01_contract_type, re01_info_channel |
| 현재 단계 | 서류·서명·송금이 어디까지 진행됐는가 | `stage.current`, `contract.draft`, `payment.deposit`, `contract.main` | re01_progress_stage |
| 당사자 | 소유자·서명자·개발사·고객 측 계약자 명의 | `owner.book_seen`, `owner.name_match`, `signer.is_owner`, `client.party` | re01_owner_doc_check, re01_client_party |
| 관계 | 중개인의 지위·양쪽 대리 여부, 대리 서명자의 권한 | `broker.*`, `signer.authority` | re01_broker_role, re01_owner_authority |
| 계약 | 계약서 언어·공증·내용 일치·위약 조항·용도·외국인 적격 | `contract.language`, `contract.notary`, `contract.match_initial`, `contract.penalty`, `office.*`, `purchase.foreign_eligibility`, `project.docs` | re01_contract_form, re01_language_gap, re01_condition_compare, re01_penalty_clause, re01_commercial_use, re01_foreign_eligibility, re01_project_docs |
| 지급 | 금액 구조, 지급 순서, 송금 계좌 명의, 지급 증명 | `lease.*`, `purchase.schedule`, `deposit_agreement.*`, `amount.text`, `payment.account_holder`, `payment.proof` | re01_deposit_months, re01_payment_schedule, re01_deposit_link, re01_amount_detail, re01_transfer_account, re01_deposit_paid_proof |
| 상대방 행동 | 상대방이 서류를 보여 주는지, 돈을 어떤 방식으로 받으려 하는지 | `owner.book_location`, `counterparty.doc_response`, `payment.account_holder` | re01_owner_doc_check, re01_book_status, re01_transfer_account |
| 고객 행동 | 고객이 이미 송금·이의 제기·원본 요청을 했는가 | `client.action_raised_diff`, `client.action_precheck_request`, `payment.deposit` | re01_counterparty_reaction, re01_precheck_response, re01_progress_stage |
| 증거 | 계약서·소유 서류·지급 기록·메시지 보유 여부 | `evidence.*` | re01_evidence (+ re01_deposit_paid_proof, re01_owner_doc_check) |
| 시간축 | 결정 기한, 서명·송금 예정일, 지급일 | `timeline.deadline_type`, `timeline.sign_date`, `amount.text`(지급일 포함) | re01_sign_deadline, re01_sign_date, re01_amount_detail |
| 상대방 반응 | 이의·요청 후 상대방이 수락/거부/회피/추가 요구/책임 전가/새 조건 중 무엇을 했나 | `counterparty.response_to_diff`, `counterparty.precheck_response`, `counterparty.post_deposit` | re01_counterparty_reaction, re01_precheck_response, re01_post_deposit_status |
| 위험 | 지금 진행을 막는 가장 큰 이유 | `blockage.main` | re01_blockage (+ M 위험 신호 전체) |
| 최종 목표 | 서명/수정 후 서명/계약금 보호/철회/전문가 위임 | `goal.final` | re01_final_goal |

---

## C. 노드 표 — 1차 (Q1 + CASE 질문 4개)

#### re01_contract_type
- phase: 1 / kind: single / show_if: 항상
- profile_field: `contract.type`, `property.use`, `counterparty.type`
- 질문: 지금 앞두고 있는 계약은 어떤 계약인가요?
- 선택지:
  - `r1_ct_lease_home` — 살 집(아파트·주택)을 빌리려고 하고, 집주인과 임대차 계약을 앞두고 있습니다.
    - meaning: `contract.type=lease; property.use=residential; counterparty.type=owner_individual`
  - `r1_ct_lease_office` — 사무실이나 상가를 빌리려고 하고, 회사 주소나 영업 장소로 쓸 계획입니다.
    - meaning: `contract.type=lease; property.use=commercial; office.planned_use=registered_address_or_business`
  - `r1_ct_purchase_project` — 분양 중인 아파트를 사려고 하고, 개발사(분양사)와 계약을 앞두고 있습니다.
    - meaning: `contract.type=purchase; property.kind=project_apartment; counterparty.type=developer`
  - `r1_ct_purchase_resale` — 이미 지어진 집이나 아파트를 개인 소유자에게서 사려고 합니다.
    - meaning: `contract.type=purchase; property.kind=existing; counterparty.type=owner_individual`
  - `r1_ct_deposit_only` — 본계약을 하기 전에, 계약금 약정서(đặt cọc)만 먼저 쓰자는 제안을 받았습니다.
    - meaning: `contract.type=deposit_agreement; contract.main=not_yet; deposit_agreement.proposed_by=counterparty`

#### re01_progress_stage
- phase: 1 / kind: single / show_if: 항상
- profile_field: `stage.current`, `contract.draft`, `payment.deposit`, `contract.main`
- 질문: 이 계약은 지금 어디까지 진행되었나요?
- 선택지:
  - `r1_st_viewing` — 집을 보고 조건만 들었고, 계약서나 서류는 아직 받지 못했습니다.
    - meaning: `stage.current=viewing; contract.draft=none; payment.deposit=not_requested; initial_terms.form=verbal`
  - `r1_st_draft` — 계약서 초안을 받았고, 아직 서명이나 송금은 하지 않았습니다.
    - meaning: `stage.current=draft_received; contract.draft=received; contract.main=unsigned; payment.deposit=not_paid`
  - `r1_st_deposit_requested` — 계약서에 서명하기 전에, 계약금부터 먼저 보내라는 요청을 받았습니다.
    - meaning: `stage.current=deposit_requested; payment.deposit=requested_before_contract; contract.main=unsigned`
  - `r1_st_deposit_paid` — 계약금은 이미 보냈고, 본계약 서명이나 잔금 지급을 앞두고 있습니다.
    - meaning: `stage.current=deposit_paid; payment.deposit=paid; contract.main=pending`
  - `r1_st_sign_scheduled` — 서명 날짜가 정해졌고, 그 전에 계약서를 확인받고 싶습니다.
    - meaning: `stage.current=sign_scheduled; contract.main=scheduled; payment.deposit=not_paid`

#### re01_owner_doc_check
- phase: 1 / kind: single / show_if: 항상
- profile_field: `owner.book_seen`, `owner.name_match`, `signer.is_owner`, `counterparty.doc_response`
- 질문: 계약 상대방이 실제 소유자인지는 어떻게 확인하셨나요?
- 선택지:
  - `r1_od_original_match` — 토지사용권 증서(핑크북) 원본을 직접 봤고, 소유자 이름이 계약 상대방과 같습니다.
    - meaning: `owner.book_seen=original; owner.name_match=yes; signer.is_owner=true`
  - `r1_od_copy_only` — 핑크북 사본이나 사진만 받았고, 원본은 아직 보지 못했습니다.
    - meaning: `owner.book_seen=copy; owner.name_match=unverified`
  - `r1_od_signer_differs` — 핑크북은 봤지만, 소유자와 계약서에 서명할 사람이 다릅니다.
    - meaning: `owner.book_seen=seen; signer.is_owner=false; signer.authority=to_verify`
  - `r1_od_refused_delay` — 핑크북을 보여 달라고 했지만, 계속 미루거나 보여 줄 수 없다고 합니다.
    - meaning: `owner.book_seen=none; client.action_precheck_request=made; counterparty.doc_response=refused_or_delayed`
  - `r1_od_project_no_book` — 분양 아파트라 핑크북은 아직 없고, 개발사 계약서와 사업 관련 서류만 받았습니다.
    - meaning: `owner.book_seen=not_issued; property.kind=project_apartment; project.docs=to_verify`

#### re01_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- profile_field: `goal.primary`
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `r1_cg_owner_authority` — 계약 상대방이 진짜 소유자인지, 서명할 권한이 있는 사람인지 먼저 확인하고 싶습니다.
    - meaning: `goal.primary=verify_owner_authority`
  - `r1_cg_contract_terms` — 계약서에 제게 불리한 조항이나 빠진 조항이 없는지 확인하고 싶습니다.
    - meaning: `goal.primary=review_terms`
  - `r1_cg_money_safety` — 계약금이나 보증금을 보내도 안전한지, 돌려받을 수 있는 조건인지 확인하고 싶습니다.
    - meaning: `goal.primary=payment_safety`
  - `r1_cg_foreigner_fit` — 외국인인 제가 이 계약을 하고, 소유나 거주 신고까지 할 수 있는지 확인하고 싶습니다.
    - meaning: `goal.primary=foreigner_eligibility`
  - `r1_cg_order_unsure` — 상황이 복잡해서, 서명 전에 무엇부터 확인해야 하는지 순서를 알고 싶습니다.
    - meaning: `goal.primary=sequence_guidance`

---

## D. 노드 표 — 2차 ① 정보 경로·당사자·권한

#### re01_info_channel
- phase: 2 / kind: single / show_if: 항상
- profile_field: `channel.source`, `channel.medium`
- 질문: 계약 조건이나 계약서는 누구를 통해 받으셨나요?
- 선택지:
  - `r1_ic_owner_direct` — 집주인(소유자)에게 직접 조건을 들었고, 계약서도 직접 받았습니다.
    - meaning: `channel.source=owner_direct; channel.medium=direct; broker.involved=false`
  - `r1_ic_broker_relay` — 중개인이 집주인 대신 조건을 전달했고, 계약서도 중개인을 통해 받았습니다.
    - meaning: `channel.source=broker; broker.involved=true; owner.direct_contact=none`
  - `r1_ic_developer_sales` — 개발사 영업 담당자나 분양 대행사에게 조건과 계약서를 안내받았습니다.
    - meaning: `channel.source=developer_sales; counterparty.type=developer`
  - `r1_ic_acquaintance` — 지인이나 회사 동료의 소개로, 비공식적으로 조건을 전해 들었습니다.
    - meaning: `channel.source=acquaintance; broker.involved=informal; initial_terms.form=verbal`
  - `r1_ic_online_only` — 온라인 광고나 SNS 글을 보고 연락했고, 상대방과는 메시지로만 이야기했습니다.
    - meaning: `channel.source=online; channel.medium=messages_only; counterparty.met_in_person=false`

#### re01_broker_role
- phase: 2 / kind: single / show_if: `re01_info_channel = r1_ic_broker_relay|r1_ic_acquaintance` 또는 `re01_transfer_account = r1_ta_broker_account`
- profile_field: `broker.type`, `broker.agreement`, `broker.dual_agency`, `broker.collects_money`, `broker.fee`
- 질문: 이 계약에서 중개인은 어떤 역할을 하고 있나요?
- 선택지:
  - `r1_br_licensed_written` — 중개회사 소속 중개인이고, 수수료와 역할이 서면으로 정해져 있습니다.
    - meaning: `broker.type=licensed_company; broker.agreement=written; broker.fee=settled`
  - `r1_br_individual_verbal` — 개인 중개인이고, 수수료와 역할은 말로만 정했습니다.
    - meaning: `broker.type=individual; broker.agreement=verbal`
  - `r1_br_both_sides` — 같은 중개인이 집주인 쪽과 제 쪽 일을 함께 맡고 있습니다.
    - meaning: `broker.dual_agency=true`
  - `r1_br_collects_money` — 중개인이 계약금이나 보증금을 소유자 대신 받겠다고 합니다.
    - meaning: `broker.collects_money=true; payment.handler=broker_proposed`
  - `r1_br_fee_unclear` — 중개 수수료를 누가, 언제, 얼마 내는지 아직 정해지지 않았습니다.
    - meaning: `broker.fee=unsettled; broker.agreement=none`

#### re01_book_status  〔추가〕
- phase: 2 / kind: single / show_if: `re01_owner_doc_check = r1_od_copy_only|r1_od_refused_delay`
- profile_field: `owner.book_location`, `title.mortgage`, `counterparty.doc_response`
- 변경 이유: 원본을 못 본 "이유"가 은행 담보·명의 변경 중·제3자 보관·단순 회피 중 무엇인지에 따라 확인 경로(담보 해제/현 소유자 확인/보관자 확인)와 판정이 갈리는데 v1에는 이 사실을 받는 질문이 없었음.
- 질문: 핑크북 원본은 지금 어디에 있다고 들으셨나요?
- 선택지:
  - `r1_bs_bank_held` — 은행 대출 담보로 은행에 맡겨 두었다고 들었고, 원본은 은행에서 찾아와야 한다고 합니다.
    - meaning: `owner.book_location=bank; title.mortgage=reported; counterparty.doc_response=explained`
  - `r1_bs_reissue_transfer` — 재발급이나 명의 변경 절차 중이라, 원본이 아직 나오지 않았다고 합니다.
    - meaning: `owner.book_location=in_process; owner.current_holder=uncertain`
  - `r1_bs_other_holder` — 가족이나 다른 사람이 원본을 보관하고 있어, 바로 가져올 수 없다고 합니다.
    - meaning: `owner.book_location=third_party; signer.authority=to_verify`
  - `r1_bs_copy_enough` — 사본이면 충분하다며, 원본을 보여 줄 필요가 없다고 합니다.
    - meaning: `owner.book_location=withheld; counterparty.doc_response=refused`
  - `r1_bs_no_reason` — 원본이 어디 있는지 설명 없이, 나중에 보여 주겠다고만 합니다.
    - meaning: `owner.book_location=unexplained; counterparty.doc_response=delayed`

#### re01_owner_authority
- phase: 2 / kind: single / show_if: `re01_owner_doc_check = r1_od_signer_differs`
- profile_field: `signer.authority`, `signer.relation`
- 질문: 소유자가 아닌 사람이 서명한다면, 그 사람의 권한은 어떻게 확인하셨나요?
- 선택지:
  - `r1_oa_notarized_poa` — 공증받은 위임장을 보여 주었고, 위임 범위에 계약 서명과 돈을 받는 일이 포함되어 있습니다.
    - meaning: `signer.authority=notarized_poa; signer.poa_scope=sign_and_receive; evidence.poa=seen`
  - `r1_oa_poa_unseen` — 위임장이 있다고 말로만 들었고, 실제 위임장은 보지 못했습니다.
    - meaning: `signer.authority=poa_claimed_unseen; evidence.poa=none`
  - `r1_oa_co_owner_one` — 핑크북에 부부 등 여러 명이 적혀 있는데, 그중 한 사람만 서명한다고 합니다.
    - meaning: `owner.count=multiple; signer.authority=co_owner_partial; owner.consent_all=unverified`
  - `r1_oa_relative_no_doc` — 소유자의 가족이 대신 서명한다고 하며, 위임장 이야기는 없었습니다.
    - meaning: `signer.relation=relative; signer.authority=none_documented`
  - `r1_oa_company_rep` — 소유자가 회사이고, 대표자가 아닌 직원이 서명한다고 합니다.
    - meaning: `owner.type=company; signer.relation=employee; signer.authority=company_authorization_to_verify`

#### re01_client_party  〔추가〕
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_lease_office|r1_ct_purchase_project|r1_ct_purchase_resale`
- profile_field: `client.party`
- 변경 이유: 고객 쪽 계약자 명의(개인·법인·공동·설립 전·타인)가 회사 주소 등록, 외국인 소유 등록, 명의 차용 위험을 직접 가르는데 v1은 상대방 쪽 당사자만 묻고 고객 쪽 명의를 묻지 않았음.
- 질문: 계약서에 계약자(임차인·매수인)로 누구의 이름이 들어가나요?
- 선택지:
  - `r1_cp_self` — 제 개인 이름으로 계약하고, 이후 사용이나 등록도 제 명의로 할 계획입니다.
    - meaning: `client.party=self_individual`
  - `r1_cp_vn_company` — 이미 베트남에 세운 회사 명의로 계약하고, 대표자가 서명할 예정입니다.
    - meaning: `client.party=vn_company; client.company_status=established`
  - `r1_cp_with_spouse` — 배우자나 가족과 함께 공동 명의로 계약하려고 합니다.
    - meaning: `client.party=joint_with_family`
  - `r1_cp_company_pending` — 회사를 아직 세우기 전이라, 우선 개인 이름으로 하고 나중에 회사로 바꾸려고 합니다.
    - meaning: `client.party=self_individual; client.company_status=pending; contract.assignment_planned=true`
  - `r1_cp_other_name` — 제가 돈을 내지만, 베트남인 지인이나 다른 사람 이름으로 계약하자는 이야기가 있습니다.
    - meaning: `client.party=other_person; client.payer=self; nominee.proposed=true`

---

## E. 노드 표 — 2차 ② 계약서 형태·내용 비교·상대방 반응

#### re01_contract_form
- phase: 2 / kind: single / show_if: 항상
- profile_field: `contract.language`, `contract.notary`, `contract.translation_verified`
- 질문: 계약서는 어떤 언어로 되어 있고, 공증은 어떻게 하기로 했나요?
- 선택지:
  - `r1_cf_bilingual_notary` — 베트남어와 영어(또는 한국어)가 함께 적힌 계약서이고, 공증사무소에서 공증하기로 했습니다.
    - meaning: `contract.language=bilingual; contract.notary=planned`
  - `r1_cf_bilingual_no_notary` — 두 언어가 함께 적힌 계약서이지만, 공증 없이 서명만 하자고 합니다.
    - meaning: `contract.language=bilingual; contract.notary=declined_by_counterparty`
  - `r1_cf_vi_only` — 베트남어로만 된 계약서이고, 공증을 할지는 아직 정해지지 않았습니다.
    - meaning: `contract.language=vi_only; contract.notary=undecided; client.comprehension=limited`
  - `r1_cf_unofficial_translation` — 중개인이 만든 한국어 번역본만 받았고, 베트남어 원문과 같은지 확인하지 못했습니다.
    - meaning: `contract.language=translation_only; contract.translation_verified=false; contract.translation_by=broker`
  - `r1_cf_no_draft` — 아직 계약서 초안을 받지 못했고, 말이나 메시지로 조건만 들었습니다.
    - meaning: `contract.draft=none; initial_terms.form=verbal_or_message`

#### re01_language_gap
- phase: 2 / kind: single / show_if: `re01_contract_form = r1_cf_vi_only|r1_cf_unofficial_translation`
- profile_field: `contract.gap_clause`
- 질문: 계약서 내용 중 이해하기 가장 어려운 부분은 무엇인가요?
- 선택지:
  - `r1_lg_penalty_terms` — 계약금 몰수나 위약금 등, 계약을 깰 때 적용되는 조항을 이해하지 못했습니다.
    - meaning: `contract.gap_clause=penalty; contract.penalty=not_understood`
  - `r1_lg_termination` — 중도 해지나 갱신 조건이 어떻게 적혀 있는지 알 수 없습니다.
    - meaning: `contract.gap_clause=termination_renewal`
  - `r1_lg_money_schedule` — 금액과 지급 일정이 제가 들은 내용과 같은지 확인하지 못했습니다.
    - meaning: `contract.gap_clause=payment_schedule; contract.match_initial=unverified`
  - `r1_lg_cost_burden` — 관리비·수리비·세금을 누가 부담하는지 적힌 부분을 이해하지 못했습니다.
    - meaning: `contract.gap_clause=cost_burden`
  - `r1_lg_version_priority` — 번역본과 원문이 다를 때 어느 쪽을 따르는지 적혀 있는지 모릅니다.
    - meaning: `contract.gap_clause=language_priority; contract.prevailing_language=unknown`

#### re01_condition_compare
- phase: 2 / kind: single / show_if: `re01_contract_form = r1_cf_bilingual_notary|r1_cf_bilingual_no_notary|r1_cf_unofficial_translation`
- profile_field: `contract.match_initial`
- 질문: 계약서 내용은 처음 안내받은 조건과 비교하면 어떤가요?
- 선택지:
  - `r1_cc_same` — 금액·기간·포함 항목 등이 처음 안내받은 조건과 거의 같습니다.
    - meaning: `contract.match_initial=same`
  - `r1_cc_amount_diff` — 월세·보증금·매매대금 등 금액이 처음 들은 것과 다르게 적혀 있습니다.
    - meaning: `contract.match_initial=amount_diff`
  - `r1_cc_scope_diff` — 가구·관리비·주차 등 포함된다고 들은 항목이 빠져 있거나 다르게 적혀 있습니다.
    - meaning: `contract.match_initial=scope_diff`
  - `r1_cc_unit_diff` — 호수·면적·층 등 물건 정보가 제가 직접 본 곳과 다르게 적혀 있습니다.
    - meaning: `contract.match_initial=unit_diff; property.identity=mismatch`
  - `r1_cc_cannot_compare` — 처음 조건을 말로만 들어서, 계약서와 무엇을 비교해야 할지 정리되지 않았습니다.
    - meaning: `contract.match_initial=uncomparable; initial_terms.form=verbal`

#### re01_compare_detail
- phase: 2 / kind: text / show_if: `re01_condition_compare = r1_cc_amount_diff|r1_cc_scope_diff|r1_cc_unit_diff`
- profile_field: `contract.diff_text`
- 질문: 처음 들은 조건과 계약서에 적힌 내용이 어떻게 다른지 적어 주세요.
- placeholder: 예) 중개인은 월세 1,800만 동에 관리비 포함이라고 했는데, 계약서에는 월세 2,000만 동, 관리비 별도로 적혀 있습니다.

#### re01_counterparty_reaction
- phase: 2 / kind: single / show_if: `re01_condition_compare = r1_cc_amount_diff|r1_cc_scope_diff|r1_cc_unit_diff`
- profile_field: `counterparty.response_to_diff`, `client.action_raised_diff`
- 질문: 다른 부분을 상대방이나 중개인에게 말했을 때, 어떤 반응이었나요?
- 선택지:
  - `r1_cr_agreed_fix` — 계약서를 고쳐 주겠다고 했고, 수정본을 받기로 했습니다.
    - meaning: `client.action_raised_diff=true; counterparty.response_to_diff=accepted_fix; contract.revision=pending`
  - `r1_cr_verbal_promise` — 말로는 맞춰 주겠다고 했지만, 계약서는 그대로 두고 서명하자고 합니다.
    - meaning: `client.action_raised_diff=true; counterparty.response_to_diff=partial_verbal_only`
  - `r1_cr_refused` — 수정은 어렵다며, 그대로 서명하거나 계약을 포기하라고 했습니다.
    - meaning: `client.action_raised_diff=true; counterparty.response_to_diff=refused`
  - `r1_cr_no_reply` — 다른 부분을 말했지만, 아직 답을 받지 못했습니다.
    - meaning: `client.action_raised_diff=true; counterparty.response_to_diff=no_reply`
  - `r1_cr_not_raised` — 아직 상대방에게 다른 부분을 말하지 않았습니다.
    - meaning: `client.action_raised_diff=false`

#### re01_precheck_response  〔추가〕
- phase: 2 / kind: single / show_if: `re01_owner_doc_check = r1_od_copy_only|r1_od_refused_delay` 또는 (`re01_progress_stage = r1_st_deposit_requested` 또는 `re01_contract_type = r1_ct_deposit_only`, 단 `re01_contract_type ≠ r1_ct_purchase_project`)
- profile_field: `counterparty.precheck_response`, `client.action_precheck_request`
- 변경 이유: 송금 전 원본·계약서 확인을 요청했을 때 상대방이 "돈부터 보내라/남 탓/값 올리기" 중 무엇으로 반응하는지가 계약 전 단계의 핵심 위험 판단 근거인데 v1은 계약서 불일치에 대한 반응만 물었음. (분양은 re01_project_docs가 같은 역할을 하므로 제외)
- 질문: 송금이나 서명 전에 핑크북 원본이나 계약서를 먼저 보여 달라고 했을 때, 상대방은 어떻게 답했나요?
- 선택지:
  - `r1_pr_accepted` — 원본과 계약서를 먼저 보여 주겠다고 했고, 확인할 날짜를 잡았습니다.
    - meaning: `client.action_precheck_request=made; counterparty.precheck_response=accepted`
  - `r1_pr_pay_first` — 계약금을 먼저 보내야 원본이나 계약서를 보여 줄 수 있다고 했습니다.
    - meaning: `client.action_precheck_request=made; counterparty.precheck_response=pay_first`
  - `r1_pr_shift_blame` — 소유자가 해외에 있다거나 중개인이 알아서 한다며, 직접 확인은 어렵다고 했습니다.
    - meaning: `client.action_precheck_request=made; counterparty.precheck_response=shift_responsibility; owner.direct_contact=none`
  - `r1_pr_new_terms` — 다른 사람이 더 높은 금액을 제시했다며, 금액을 올리거나 바로 결정하라고 했습니다.
    - meaning: `client.action_precheck_request=made; counterparty.precheck_response=new_terms; timeline.pressure=true`
  - `r1_pr_not_asked` — 아직 원본 확인이나 계약서를 먼저 달라고 요청하지 않았습니다.
    - meaning: `client.action_precheck_request=not_made`

---

## G. 노드 표 — 2차 ③ 금액·지급·계약금

#### re01_deposit_months
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_lease_home|r1_ct_lease_office`
- profile_field: `lease.deposit_months`, `lease.deposit_return_terms`, `lease.prepay`
- 질문: 보증금과 월세 지급 조건은 어떻게 안내받으셨나요?
- 선택지:
  - `r1_dm_one_month` — 보증금은 월세 1개월분이고, 계약서에 금액과 돌려받는 시점이 적혀 있습니다.
    - meaning: `lease.deposit_months=1; lease.deposit_return_terms=written`
  - `r1_dm_two_months` — 보증금은 월세 2개월분이고, 나갈 때 돌려준다는 말을 들었습니다.
    - meaning: `lease.deposit_months=2; lease.deposit_return_terms=verbal`
  - `r1_dm_three_plus` — 보증금이 월세 3개월분 이상이거나, 월세를 여러 달치 미리 내라고 합니다.
    - meaning: `lease.deposit_months=3_plus; lease.prepay=multiple_months`
  - `r1_dm_return_unclear` — 보증금 금액은 정해졌지만, 언제 어떤 조건으로 돌려주는지는 정해지지 않았습니다.
    - meaning: `lease.deposit_amount=set; lease.deposit_return_terms=unset`
  - `r1_dm_not_settled` — 보증금 금액과 월세 지급 방식은 아직 협의하고 있습니다.
    - meaning: `lease.deposit_amount=unset; lease.payment_terms=negotiating`

#### re01_payment_schedule
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_purchase_project|r1_ct_purchase_resale`
- profile_field: `purchase.schedule`, `title.mortgage`, `price.dual_declaration`
- 질문: 매매대금은 어떤 순서로 지급하기로 했나요?
- 선택지:
  - `r1_ps_staged_written` — 계약금·중도금·잔금의 단계와 날짜가 계약서나 개발사 일정표에 적혀 있습니다.
    - meaning: `purchase.schedule=staged_written`
  - `r1_ps_deposit_only_fixed` — 계약금 금액만 정해졌고, 중도금과 잔금 일정은 아직 정하지 않았습니다.
    - meaning: `purchase.schedule=deposit_only; purchase.balance_dates=unset`
  - `r1_ps_lump_sum_first` — 명의 이전이나 핑크북 발급 전에, 대금 대부분이나 전액을 먼저 보내라고 합니다.
    - meaning: `purchase.schedule=lump_before_transfer; payment.exposure=high`
  - `r1_ps_mortgage_payoff` — 잔금 일부로 소유자의 은행 대출을 갚고 담보를 풀겠다고 합니다.
    - meaning: `purchase.schedule=mortgage_payoff; title.mortgage=existing`
  - `r1_ps_price_split` — 계약서에 적는 금액과 실제로 주고받는 금액을 다르게 하자는 제안을 받았습니다.
    - meaning: `price.dual_declaration=proposed`

#### re01_deposit_link
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_deposit_only`
- profile_field: `deposit_agreement.main_type`, `deposit_agreement.main_date`, `deposit_agreement.terms`
- 질문: 이 계약금 약정은 어떤 본계약으로 이어지기로 했나요?
- 선택지:
  - `r1_dl_lease_fixed_date` — 임대차 본계약으로 이어지고, 본계약 서명 날짜도 정해져 있습니다.
    - meaning: `deposit_agreement.main_type=lease; deposit_agreement.main_date=fixed`
  - `r1_dl_purchase_fixed_date` — 매매 본계약으로 이어지고, 본계약을 공증할 날짜도 정해져 있습니다.
    - meaning: `deposit_agreement.main_type=purchase; deposit_agreement.main_date=fixed; contract.notary=planned`
  - `r1_dl_no_date` — 본계약을 한다는 말만 있고, 언제 하는지는 정해지지 않았습니다.
    - meaning: `deposit_agreement.main_date=unset`
  - `r1_dl_terms_open` — 계약금만 먼저 걸고, 금액이나 세부 조건은 나중에 정하자고 합니다.
    - meaning: `deposit_agreement.terms=open; deposit_agreement.price=unset`

#### re01_amount_detail  〔변경: 질문·placeholder·show_if〕
- phase: 2 / kind: text / show_if: `re01_deposit_months = r1_dm_one_month|r1_dm_two_months|r1_dm_three_plus|r1_dm_return_unclear` 또는 `re01_payment_schedule` 응답 시 또는 `re01_deposit_link` 응답 시 또는 `re01_progress_stage = r1_st_deposit_paid`
- profile_field: `amount.text`, `timeline.payment_date`
- 변경 이유: 금액만 받고 지급일을 받지 않아 시간축(계약금 지급일·예정일)이 비어 있었고, 계약금을 이미 보낸 고객이 보증금 미정(r1_dm_not_settled)을 고르면 보낸 금액을 적을 칸이 없었음.
- 질문: 안내받은 금액(월세·보증금·매매대금·계약금)과, 이미 보냈거나 보내기로 한 날짜를 적어 주세요.
- placeholder: 예) 매매대금 45억 동, 계약금 4억 5천만 동(10%)은 9월 28일 송금, 잔금은 10월 15일 공증일에 지급 예정

#### re01_transfer_account
- phase: 2 / kind: single / show_if: `re01_progress_stage = r1_st_deposit_requested|r1_st_deposit_paid` 또는 `re01_contract_type = r1_ct_deposit_only`
- profile_field: `payment.account_holder`, `payment.receipt`
- 질문: 계약금이나 보증금은 누구 명의의 계좌로 보내라고 했나요?
- 선택지:
  - `r1_ta_owner_account` — 핑크북에 적힌 소유자(분양이면 개발사) 본인 명의 계좌로 보내라고 했습니다.
    - meaning: `payment.account_holder=owner_or_developer; payment.account_match=yes`
  - `r1_ta_broker_account` — 중개인이나 중개회사 명의 계좌로 보내라고 했습니다.
    - meaning: `payment.account_holder=broker; payment.owner_ack=needed`
  - `r1_ta_third_party` — 소유자의 가족이나 다른 사람 명의 계좌로 보내라고 했고, 그 이유는 듣지 못했습니다.
    - meaning: `payment.account_holder=third_party; payment.reason=unexplained`
  - `r1_ta_cash` — 현금으로 직접 달라고 했고, 영수증을 써 줄지는 확실하지 않습니다.
    - meaning: `payment.method=cash; payment.receipt=uncertain`
  - `r1_ta_not_told` — 돈을 보내라는 말은 들었지만, 어느 계좌로 보내는지는 아직 안내받지 못했습니다.
    - meaning: `payment.account_holder=unknown`

#### re01_deposit_paid_proof
- phase: 2 / kind: single / show_if: `re01_progress_stage = r1_st_deposit_paid`
- profile_field: `payment.proof`, `payment.handler`, `payment.delivery_to_owner`
- 질문: 이미 보낸 계약금에 대해, 받았다는 확인은 어떻게 남아 있나요?
- 선택지:
  - `r1_dp_signed_receipt` — 송금했고, 상대방이 서명한 계약금 영수증이나 약정서를 받았습니다.
    - meaning: `payment.proof=signed_receipt; evidence.payment=strong`
  - `r1_dp_transfer_only` — 송금 내역은 있지만, 상대방이 서명한 영수증이나 약정서는 받지 못했습니다.
    - meaning: `payment.proof=transfer_record_only; payment.purpose_ack=missing`
  - `r1_dp_cash_no_receipt` — 현금으로 건넸고, 받았다는 서면 확인은 받지 못했습니다.
    - meaning: `payment.method=cash; payment.proof=none`
  - `r1_dp_via_broker` — 중개인에게 건넸고, 소유자에게 전달되었는지는 확인하지 못했습니다.
    - meaning: `payment.handler=broker; payment.delivery_to_owner=unconfirmed`

#### re01_post_deposit_status  〔추가〕
- phase: 2 / kind: single / show_if: `re01_progress_stage = r1_st_deposit_paid`
- profile_field: `counterparty.post_deposit`
- 변경 이유: 계약금을 보낸 뒤 상대방이 본계약을 예정대로 진행하는지, 조건 변경·지연·추가 송금 요구·연락 두절 중 무엇인지가 "계약 전 검토"와 "계약금 반환 분쟁(특수 사건)"을 가르는 기준인데 v1은 이를 구조화된 선택지로 받지 못하고 직접 입력에만 의존했음.
- 질문: 계약금을 보낸 뒤, 상대방은 본계약에 대해 어떻게 하고 있나요?
- 선택지:
  - `r1_pa_on_schedule` — 약속한 날짜에 본계약을 하기로 했고, 서류 준비도 진행되고 있습니다.
    - meaning: `counterparty.post_deposit=on_schedule`
  - `r1_pa_terms_changed` — 본계약 전에 금액이나 조건을 바꾸자고 새로 제안했습니다.
    - meaning: `counterparty.post_deposit=new_terms`
  - `r1_pa_delay_excuse` — 서류 준비나 다른 사람 사정을 이유로, 본계약 날짜를 계속 미루고 있습니다.
    - meaning: `counterparty.post_deposit=delay_shift_responsibility; contract.main_date=slipping`
  - `r1_pa_more_money` — 본계약 전에 돈을 더 보내야 진행할 수 있다고 요구합니다.
    - meaning: `counterparty.post_deposit=additional_payment_demand`
  - `r1_pa_unreachable` — 계약금을 받은 뒤로 연락이 잘 되지 않거나, 답이 계속 늦어지고 있습니다.
    - meaning: `counterparty.post_deposit=avoiding_contact`

#### re01_penalty_clause
- phase: 2 / kind: single / show_if: `re01_progress_stage = r1_st_deposit_requested|r1_st_deposit_paid|r1_st_sign_scheduled` 또는 `re01_contract_type = r1_ct_deposit_only`
- profile_field: `contract.penalty`
- 질문: 계약을 깨는 경우 계약금을 어떻게 처리한다고 되어 있나요?
- 선택지:
  - `r1_pc_mutual_written` — 제가 포기하면 계약금을 잃고, 상대방이 어기면 배액을 돌려준다고 서면에 적혀 있습니다.
    - meaning: `contract.penalty=mutual_written`
  - `r1_pc_one_sided` — 제가 포기하면 계약금을 잃는다는 내용만 있고, 상대방이 어기는 경우는 적혀 있지 않습니다.
    - meaning: `contract.penalty=one_sided_against_client`
  - `r1_pc_conditional_refund` — 대출 거절이나 서류 문제 등 특정한 경우에는 계약금을 돌려준다는 조건이 적혀 있습니다.
    - meaning: `contract.penalty=conditional_refund_written`
  - `r1_pc_verbal_only` — 몰수나 배액 반환에 대해 말로만 들었고, 서면에는 적혀 있지 않습니다.
    - meaning: `contract.penalty=verbal_only`
  - `r1_pc_not_checked` — 위약 조항이 있는지, 있다면 무슨 뜻인지 아직 확인하지 못했습니다.
    - meaning: `contract.penalty=unchecked`

---

## H. 노드 표 — 2차 ④ 계약 목적 적합성·기한·자료·막힌 이유·최종 목표

#### re01_project_docs  〔추가〕
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_purchase_project` 또는 `re01_owner_doc_check = r1_od_project_no_book`
- profile_field: `project.docs`, `project.transfer_from_buyer`
- 변경 이유: 분양 아파트는 핑크북 대신 개발사가 팔 수 있는 조건(은행 보증 등)과 계약 단계(예약/정식/전매)를 확인하는 것이 소유자 확인에 해당하는데, v1은 r1_od_project_no_book 이후 이 사실을 받는 질문이 없어 분양 경로가 임대 경로와 같은 질문을 탔음.
- 질문: 개발사(또는 분양 대행사)에게서 받았거나 확인한 서류는 어디까지인가요?
- 선택지:
  - `r1_pj_guarantee_received` — 매매계약서와 함께, 은행이 개발사의 의무를 보증한다는 확인서(은행 보증서)를 받기로 했습니다.
    - meaning: `project.docs=bank_guarantee; project.contract_stage=formal`
  - `r1_pj_permits_only` — 건축 허가나 사업 승인 서류 사본은 받았지만, 은행 보증서 이야기는 없었습니다.
    - meaning: `project.docs=permits_only; project.bank_guarantee=unconfirmed`
  - `r1_pj_reservation_only` — 정식 매매계약 전 단계라며, 예약 계약서(가계약서)와 예약금 안내만 받았습니다.
    - meaning: `project.docs=reservation_only; project.contract_stage=reservation`
  - `r1_pj_brochure_only` — 분양 안내 책자와 영업 담당자 설명만 받았고, 서류는 받지 못했습니다.
    - meaning: `project.docs=brochure_only; initial_terms.form=marketing`
  - `r1_pj_secondary_transfer` — 개발사가 아니라, 먼저 분양받은 사람에게서 계약을 넘겨받는 구조입니다.
    - meaning: `project.transfer_from_buyer=true; counterparty.type=prior_buyer; developer.approval=to_verify`

#### re01_residence_registration  〔변경: show_if〕
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_lease_home` 그리고 `re01_progress_stage = r1_st_viewing|r1_st_draft|r1_st_sign_scheduled`
- profile_field: `lease.residence_registration`
- 변경 이유: 계약금 요청·지급 경로는 송금 계좌·지급 증명·상대방 반응 확인이 우선이고 경로 문항 수를 13 이내로 유지해야 해서, 이 경로에서는 질문 대신 결과 STEP 3(임시거주 신고 책임 기재)으로 안내함.
- 질문: 입주 후 공안에 하는 임시거주 신고는 어떻게 하기로 했나요?
- 선택지:
  - `r1_rr_owner_will_do` — 집주인이 입주 후 임시거주 신고를 해 주기로 했고, 계약서에도 적혀 있습니다.
    - meaning: `lease.residence_registration=owner_in_contract`
  - `r1_rr_verbal_only` — 집주인이 신고해 준다고 말했지만, 계약서에는 적혀 있지 않습니다.
    - meaning: `lease.residence_registration=owner_verbal`
  - `r1_rr_tenant_self` — 신고는 제가 알아서 하라고 했고, 필요한 서류는 안내받지 못했습니다.
    - meaning: `lease.residence_registration=tenant_self; lease.owner_docs_for_registration=not_offered`
  - `r1_rr_refused_or_fee` — 집주인이 신고를 꺼리거나, 신고해 주는 대신 추가 비용을 요구했습니다.
    - meaning: `lease.residence_registration=refused_or_fee`
  - `r1_rr_not_discussed` — 임시거주 신고에 대해서는 아직 이야기해 본 적이 없습니다.
    - meaning: `lease.residence_registration=undiscussed`

#### re01_commercial_use
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_lease_office`
- profile_field: `office.registration_use`, `office.sublease`, `office.fitout_terms`
- 질문: 이 공간을 회사 주소나 영업 장소로 쓰는 것은 어떻게 확인하셨나요?
- 선택지:
  - `r1_cu_registration_ok` — 회사 등록 주소로 써도 된다고 했고, 필요한 서류(핑크북 사본 등)도 주기로 했습니다.
    - meaning: `office.registration_use=confirmed; office.owner_docs=offered`
  - `r1_cu_verbal_only` — 사업 용도로 써도 된다고 말로만 들었고, 계약서에는 용도가 적혀 있지 않습니다.
    - meaning: `office.registration_use=verbal; contract.use_clause=missing`
  - `r1_cu_sublease` — 건물주가 아니라, 건물을 먼저 빌린 사람에게서 다시 빌리는 구조입니다.
    - meaning: `office.sublease=true; counterparty.type=head_tenant; owner.consent=to_verify`
  - `r1_cu_use_restricted` — 주거용 건물이거나 용도 제한이 있다는 말을 들었지만, 확인하지 못했습니다.
    - meaning: `office.registration_use=restricted_unverified`
  - `r1_cu_fitout_unclear` — 인테리어 공사와 나갈 때 원상복구 비용을 누가 부담하는지 정해지지 않았습니다.
    - meaning: `office.fitout_terms=unset`

#### re01_foreign_eligibility
- phase: 2 / kind: single / show_if: `re01_contract_type = r1_ct_purchase_project|r1_ct_purchase_resale` 또는 `re01_deposit_link = r1_dl_purchase_fixed_date`
- profile_field: `purchase.foreign_eligibility`, `property.kind`, `nominee.proposed`
- 질문: 외국인 명의로 이 집을 살 수 있는지는 어떻게 확인하셨나요?
- 선택지:
  - `r1_fe_quota_written` — 분양 프로젝트의 아파트이고, 외국인 구매 가능 물량이 남아 있다고 서면으로 안내받았습니다.
    - meaning: `purchase.foreign_eligibility=quota_written; property.kind=project_apartment`
  - `r1_fe_quota_verbal` — 외국인도 살 수 있다고 말로만 들었고, 물량이나 프로젝트 조건은 확인하지 못했습니다.
    - meaning: `purchase.foreign_eligibility=quota_verbal`
  - `r1_fe_landed_house` — 프로젝트 밖의 개인 주택(토지가 딸린 집)이고, 외국인 명의가 가능한지 확인하지 못했습니다.
    - meaning: `purchase.foreign_eligibility=landed_unverified; property.kind=landed_house`
  - `r1_fe_nominee_name` — 베트남인 지인이나 중개인 명의를 빌려서 사 두자는 제안을 받았습니다.
    - meaning: `purchase.foreign_eligibility=nominee_proposed; nominee.proposed=true`
  - `r1_fe_term_unknown` — 살 수는 있다고 들었지만, 외국인인 제가 소유할 수 있는 기간과 연장 가능 여부는 설명받지 못했습니다.
    - meaning: `purchase.foreign_eligibility=term_unexplained`

#### re01_sign_deadline
- phase: 2 / kind: single / show_if: 항상
- profile_field: `timeline.deadline_type`, `timeline.pressure`
- 질문: 서명이나 송금은 언제까지 결정해야 한다고 들으셨나요?
- 선택지:
  - `r1_sd_date_fixed` — 서명(또는 송금) 날짜가 정해져 있고, 정확한 날짜를 알고 있습니다.
    - meaning: `timeline.deadline_type=fixed_date`
  - `r1_sd_pressure_days` — '며칠 안에 결정하지 않으면 다른 사람에게 넘긴다'는 말을 들었습니다.
    - meaning: `timeline.deadline_type=counterparty_pressure; timeline.pressure=true`
  - `r1_sd_move_in_driven` — 입주나 개업 날짜에 맞춰야 해서, 제 쪽 일정이 급합니다.
    - meaning: `timeline.deadline_type=client_driven`
  - `r1_sd_no_deadline` — 정해진 기한은 없고, 제가 결정하는 대로 진행하면 된다고 합니다.
    - meaning: `timeline.deadline_type=none`
  - `r1_sd_passed` — 약속한 날짜가 이미 지났고, 상대방이 계속 진행할지 확실하지 않습니다.
    - meaning: `timeline.deadline_type=passed; counterparty.intent=uncertain`

#### re01_sign_date
- phase: 2 / kind: text / show_if: `re01_sign_deadline = r1_sd_date_fixed|r1_sd_pressure_days|r1_sd_move_in_driven`
- profile_field: `timeline.sign_date`
- 질문: 서명하거나 돈을 보내기로 한 날짜는 언제인가요?
- placeholder: 예) 10월 15일 오전 공증사무소에서 서명, 계약금은 서명 당일 송금

#### re01_evidence  〔변경: show_if〕
- phase: 2 / kind: multi / show_if: 항상
- profile_field: `evidence.contract`, `evidence.owner_docs`, `evidence.payment`, `evidence.messages`
- 변경 이유: v1은 r1_st_viewing·r1_st_deposit_requested에서 숨겨졌는데, 계약금 요청 경로야말로 메시지·핑크북 사본 보관 여부가 판정과 이후 대응에 필요하고, 물건만 본 단계도 광고·메시지가 처음 조건의 유일한 근거라 항상 표시로 바꿈.
- 질문: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `r1_ev_contract_draft` — 계약서 초안이나 수정본(파일·사진 포함)
    - meaning: `evidence.contract=held`
  - `r1_ev_owner_docs` — 핑크북, 상대방 신분증, 위임장의 사본이나 사진
    - meaning: `evidence.owner_docs=held`
  - `r1_ev_payment_record` — 송금 내역이나 계약금 영수증
    - meaning: `evidence.payment=held`
  - `r1_ev_messages` — 중개인·상대방과 주고받은 메시지(Zalo·카카오톡 등)
    - meaning: `evidence.messages=held`
  - `r1_ev_none` — 보관 중인 자료가 없거나, 아직 정리하지 못했습니다.
    - meaning: `evidence.any=none_or_unorganized`

#### re01_blockage
- phase: 2 / kind: single / show_if: 항상
- profile_field: `blockage.main`
- 질문: 현재 이 계약을 진행하지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `r1_bl_owner_unverified` — 상대방이 진짜 소유자이거나 권한이 있는 사람인지 확신이 없어, 서명을 미루고 있습니다.
    - meaning: `blockage.main=owner_authority_unverified`
  - `r1_bl_contract_unreadable` — 계약서를 제대로 이해하지 못해, 불리한 조항이 있는지 판단하지 못하고 있습니다.
    - meaning: `blockage.main=contract_comprehension`
  - `r1_bl_money_risk` — 돈을 먼저 보내라고 하는데, 돌려받지 못할까 봐 송금을 망설이고 있습니다.
    - meaning: `blockage.main=payment_risk`
  - `r1_bl_eligibility_unclear` — 외국인인 제가 이 계약으로 소유하거나 거주 신고를 할 수 있는지 몰라 멈춰 있습니다.
    - meaning: `blockage.main=foreigner_eligibility`
  - `r1_bl_time_pressure` — 결정할 시간이 짧아, 무엇부터 확인해야 할지 정리하지 못하고 있습니다.
    - meaning: `blockage.main=time_pressure`

#### re01_final_goal
- phase: 2 / kind: single / show_if: 항상
- profile_field: `goal.final`
- 질문: 이번 검토를 통해 이 계약을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `r1_fg_sign_safely` — 확인할 것을 모두 확인한 뒤, 문제가 없으면 그대로 서명하고 싶습니다.
    - meaning: `goal.final=sign_after_check`
  - `r1_fg_revise_then_sign` — 불리하거나 빠진 조항을 고친 뒤에 서명하고 싶습니다.
    - meaning: `goal.final=revise_then_sign`
  - `r1_fg_protect_deposit` — 이미 보냈거나 앞으로 보낼 계약금을 지킬 수 있는 방법을 정리하고 싶습니다.
    - meaning: `goal.final=protect_deposit`
  - `r1_fg_withdraw_safely` — 위험이 크다면, 손해를 줄이면서 계약을 하지 않는 쪽으로 정리하고 싶습니다.
    - meaning: `goal.final=withdraw_minimize_loss`
  - `r1_fg_expert_handle` — 계약서 검토와 상대방과의 협의를 전문가에게 맡기고 싶습니다.
    - meaning: `goal.final=delegate_to_expert`

---

## F. 1차 → 2차 adaptive branching

### 세부 사건 판정 순서
1차 답이 여러 세부 사건에 걸리면 위에서부터 먼저 걸리는 하나를 주 경로로 쓴다. 주 경로에 없는 질문도 show_if가 맞으면 해당 위치에 끼워 넣는다(대괄호 = 조건부).

| 우선 | 1차 답 조합 | 세부 사건 | 2차 질문 순서 | 기본 문항 수 |
|---|---|---|---|---|
| 1 | `r1_st_deposit_paid` | **RE01-C 계약금 지급 후 본계약 대기** — 돈은 이미 건너갔고, 증명·상대방 이행 의사·위약 조건이 핵심 | info_channel → [broker_role] → deposit_paid_proof → transfer_account → post_deposit_status → penalty_clause → contract_form → [language_gap] → [condition_compare → compare_detail → counterparty_reaction] → deposit_months / payment_schedule / deposit_link → amount_detail → [client_party] → [foreign_eligibility / commercial_use / project_docs] → [book_status / owner_authority] → sign_deadline → [sign_date] → evidence → blockage → final_goal | 13 (주거 임대·직거래·두 언어 계약서 기준) |
| 2 | `r1_st_deposit_requested` 또는 `r1_ct_deposit_only` | **RE01-B 계약서 전 송금 요구** — 돈부터 보내라는 요구에 대해, 계좌 명의·원본 확인 요청에 대한 반응·위약 조건을 먼저 확인 | info_channel → [broker_role] → [precheck_response] → transfer_account → penalty_clause → contract_form → [language_gap] → [condition_compare …] → deposit_months / payment_schedule / deposit_link → amount_detail → [project_docs] → [client_party] → [foreign_eligibility / commercial_use] → [book_status / owner_authority] → sign_deadline → [sign_date] → evidence → blockage → final_goal | 12 (주거 임대·중개인·계약서 없음 기준) |
| 3 | `r1_od_copy_only` / `r1_od_signer_differs` / `r1_od_refused_delay` (단계: viewing·draft·sign_scheduled) | **RE01-A 소유자·서명 권한 미확인** — 원본을 못 본 이유, 대리 서명 권한, 확인 요청에 대한 반응을 먼저 추적 | info_channel → [broker_role] → book_status 또는 owner_authority → [precheck_response] → contract_form → [language_gap] → [condition_compare …] → deposit_months / payment_schedule → amount_detail → [client_party] → [residence_registration / commercial_use / foreign_eligibility] → [penalty_clause] → sign_deadline → [sign_date] → evidence → blockage → final_goal | 13 (주거 임대·중개인·사본만 기준) |
| 4 | `r1_ct_purchase_project` (또는 `r1_od_project_no_book`) | **RE01-E 분양 아파트 매수** — 핑크북 대신 개발사 서류·계약 단계·외국인 물량을 확인 | info_channel → project_docs → client_party → contract_form → [language_gap] → [condition_compare …] → payment_schedule → amount_detail → foreign_eligibility → [penalty_clause] → sign_deadline → [sign_date] → evidence → blockage → final_goal | 11 |
| 5 | `r1_ct_purchase_resale` | **RE01-F 기존 주택 개인 간 매수** — 공증·지급 순서·담보 해제·외국인 소유 가능 여부 | info_channel → [broker_role] → client_party → contract_form → [language_gap] → [condition_compare …] → payment_schedule → amount_detail → foreign_eligibility → [penalty_clause] → sign_deadline → [sign_date] → evidence → blockage → final_goal | 12 (공증 예정일 확정 기준) |
| 6 | `r1_ct_lease_office` | **RE01-G 사무실·상가 임차** — 계약자 명의, 회사 주소·영업 용도, 전대 구조, 원상복구 | info_channel → [broker_role] → client_party → commercial_use → contract_form → [language_gap] → [condition_compare …] → deposit_months → amount_detail → [penalty_clause] → sign_deadline → [sign_date] → evidence → blockage → final_goal | 11 |
| 7 | `r1_ct_lease_home` + `r1_od_original_match` (단계: viewing·draft·sign_scheduled) | **RE01-D 주거 임대 조항 검토** — 소유자는 확인됐고, 계약서 내용·보증금 반환·임시거주 신고가 핵심 | info_channel → [broker_role] → contract_form → [language_gap] → [condition_compare …] → deposit_months → amount_detail → residence_registration → [penalty_clause] → sign_deadline → [sign_date] → evidence → blockage → final_goal | 9~12 |

- 문항 수 범위: 기본 경로 9~13. 중개인·계약서 불일치·날짜 입력 등 조건부 후속이 한 경로에서 모두 겹치면 최대 15까지 늘 수 있음(텍스트 입력 2개 포함).
- 정렬 보정(`re01_confirm_goal`): `r1_cg_money_safety` → 주 경로 안에서 transfer_account·penalty_clause를 contract_form보다 앞으로 / `r1_cg_owner_authority` → book_status·owner_authority·precheck_response를 info_channel 바로 뒤로 / `r1_cg_foreigner_fit` → foreign_eligibility·residence_registration·client_party를 contract_form 앞으로 / `r1_cg_contract_terms` → contract_form·language_gap·condition_compare를 info_channel 바로 뒤로 / `r1_cg_order_unsure` → 주 경로 순서 그대로.
- 세부 사건별로 갈라지는 조사 축 요약: C는 지급 증명→상대방 이행 반응, B는 계좌 명의→확인 요청 반응, A는 원본 위치·권한→확인 요청 반응, E는 개발사 서류→외국인 물량, F는 지급 순서·담보→외국인 소유 가능, G는 계약자 명의→용도·전대, D는 계약서 내용→보증금 반환·거주 신고.

---

## I. Evidence structure

| 증거 value | 의미 | 증명하는 사실 | 결과 판정 영향 |
|---|---|---|---|
| `r1_ev_contract_draft` | 계약서 초안·수정본 보유 | 상대방이 제시한 조건(금액·기간·위약·포함 항목)의 내용 | 보유 시 조항 검토 가능 → 1차 "대응·자료" 칸에 첨부 자료로 표시. 미보유 + `r1_st_deposit_requested`면 `r1_cf_no_draft` 조합 주의 신호 강화 |
| `r1_ev_owner_docs` | 핑크북·신분증·위임장 사본 보유 | 상대방이 주장하는 소유자·서명자 신원 | 사본만이면 `r1_od_copy_only` 주의 유지(원본 대조 필요). 미보유 + `r1_od_refused_delay`면 전문가 권장 유지 |
| `r1_ev_payment_record` | 송금 내역·계약금 영수증 보유 | 돈을 언제, 누구에게, 얼마 보냈는지 | `r1_st_deposit_paid`인데 미보유면 `r1_dp_cash_no_receipt`와 같은 수준으로 판단(전문가 권장). 보유 + `r1_dp_transfer_only`면 주의 유지 |
| `r1_ev_messages` | 중개인·상대방 메시지 보유 | 처음 안내받은 조건, 구두 약속, 송금 요구·재촉 정황 | `r1_cr_verbal_promise`·`r1_pc_verbal_only`·`r1_rr_verbal_only`의 유일한 근거. 보유 시 "말로 한 약속"을 계약서 반영 요청 자료로 안내 |
| `r1_ev_none` | 자료 없음·미정리 | — | 단독 선택 시 판정 단계는 올리지 않되, 결과 화면에 "서명·송금 전 자료 확보" 문장 우선 표시 |
| (`r1_od_original_match`) | 핑크북 원본 대조 완료 | 계약 상대방 = 소유자 | 소유 관련 위험 신호 없음 처리 |
| (`r1_oa_notarized_poa`) | 공증 위임장 확인 | 대리 서명자의 서명·수령 권한 | `r1_od_signer_differs` 주의를 확인 필요로 낮출 수 있음(위임 범위 확인 문장 유지) |
| (`r1_dp_signed_receipt`) | 서명된 계약금 영수증 | 돈의 성격이 계약금이고 상대방이 수령했음 | 지급 증명 위험 신호 없음 처리 |
| (`r1_pc_mutual_written` / `r1_pc_conditional_refund`) | 서면 위약·반환 조항 | 계약을 깰 때의 계약금 처리 기준 | 계약금 관련 주의 신호 없음 처리 |
| (`r1_pj_guarantee_received`) | 은행 보증서 수령 예정 | 분양 개발사의 의무 이행 담보 | 분양 관련 위험 신호 없음 처리 |
| (`r1_fe_quota_written`) | 외국인 물량 서면 안내 | 외국인 명의 등록 가능성의 근거 | `r1_fe_quota_verbal` 주의 미적용 |
| (`r1_cu_registration_ok`) | 회사 주소 사용 서면 확인·서류 제공 약속 | 영업 장소·회사 주소로 쓸 수 있다는 상대방 동의 | 용도 관련 신호 없음 처리 |

- 괄호 항목은 re01_evidence 선택지가 아니라 다른 질문의 답이 증거 역할을 하는 경우.

---

## J. Timeline structure

| 순서 | 시간축 이벤트 | Situation Profile 필드 | 채우는 질문 id |
|---|---|---|---|
| 1 | 물건 확인·조건 안내(처음 조건이 정해진 시점과 경로) | `stage.current=viewing`, `channel.source`, `initial_terms.form` | re01_progress_stage, re01_info_channel |
| 2 | 계약서 초안 수령 | `contract.draft`, `contract.language`, `contract.notary` | re01_progress_stage, re01_contract_form |
| 3 | 문제 발생 — 원본 미제시·서명자 불일치·조건 불일치 | `owner.book_seen`, `owner.book_location`, `signer.authority`, `contract.match_initial` | re01_owner_doc_check, re01_book_status, re01_owner_authority, re01_condition_compare, re01_compare_detail |
| 4 | 계약금 요청(통보) | `payment.deposit=requested_before_contract`, `payment.account_holder` | re01_progress_stage, re01_transfer_account |
| 5 | 고객 대응 — 원본·계약서 확인 요청, 불일치 이의 제기 | `client.action_precheck_request`, `client.action_raised_diff` | re01_precheck_response, re01_counterparty_reaction |
| 6 | 상대방 재응답 | `counterparty.precheck_response`, `counterparty.response_to_diff` | re01_precheck_response, re01_counterparty_reaction |
| 7 | 계약금 지급 | `payment.deposit=paid`, `payment.proof`, `timeline.payment_date` | re01_progress_stage, re01_deposit_paid_proof, re01_amount_detail |
| 8 | 지급 후 상대방 행동 | `counterparty.post_deposit` | re01_post_deposit_status |
| 9 | 결정 기한·서명·송금 예정일(또는 기한 경과) | `timeline.deadline_type`, `timeline.sign_date` | re01_sign_deadline, re01_sign_date, re01_deposit_link |
| 10 | 현재 — 막힌 이유와 원하는 마무리 | `blockage.main`, `goal.final` | re01_blockage, re01_final_goal |

- 계약 전 사건이므로 "계약 체결"은 과거 이벤트가 아니라 9번 예정 이벤트로 다룬다. `r1_sd_passed`는 9번이 이미 지난 상태로 기록하고 8번(post_deposit_status)과 함께 특수 사건 판단에 쓴다.

---

## K. Party / Relationship structure

### 당사자 유형
| 역할 | 값 | 채우는 질문 |
|---|---|---|
| 상대방(권리자) | 개인 소유자 `owner_individual` / 개발사 `developer` / 먼저 분양받은 사람 `prior_buyer` / 건물을 먼저 빌린 사람 `head_tenant` / 회사 소유자 `owner.type=company` | re01_contract_type, re01_project_docs, re01_commercial_use, re01_owner_authority |
| 서명자 | 소유자 본인 / 공증 위임 대리인 / 위임장 미확인 대리인 / 공동 소유자 중 1인 / 가족 / 회사 직원 | re01_owner_doc_check, re01_owner_authority |
| 원본 보관자 | 소유자 / 은행(담보) / 가족·제3자 / 미상 | re01_book_status |
| 중개인 | 중개회사 소속·서면 / 개인·구두 / 양쪽 대리 / 돈을 대신 받는 중개인 / 비공식 소개자 | re01_info_channel, re01_broker_role |
| 고객 측 계약자 | 본인 개인 / 베트남 법인 / 가족 공동 / 회사 설립 전 개인 / 타인 명의 | re01_client_party |
| 돈을 받는 사람 | 소유자·개발사 / 중개인 / 제3자 / 현금 수령자 | re01_transfer_account, re01_deposit_paid_proof |

### 관계·명의 처리 규칙
- 대리인: 서명자 ≠ 소유자이면 `signer.authority` 값을 반드시 채운다. `r1_oa_notarized_poa`일 때만 위임 범위(서명·돈 수령)를 확인된 사실로 기록하고, 나머지는 `to_verify` 또는 `none_documented`로 남긴다.
- 공동 소유: `r1_oa_co_owner_one`이면 `owner.count=multiple`로 기록하고 나머지 소유자 동의를 미확인으로 둔다. 공동 상속인 중 일부와 연락이 안 된다는 직접 입력이 있으면 특수 사건으로 넘긴다.
- 중개인: 정보 경로(ic_)와 돈의 경로(ta_/dp_)를 분리해 기록한다. 중개인이 조건만 전달했는지, 돈까지 받는지에 따라 위험 단계가 다르다(`r1_br_collects_money`·`r1_dp_via_broker` = 전문가 권장).
- 회사 명의(상대방): 소유자가 회사이면 대표자 서명 또는 회사 위임 확인이 필요한 사실로 기록(`r1_oa_company_rep`).
- 회사 명의(고객): `r1_cp_vn_company`는 법인 계약, `r1_cp_company_pending`은 개인 계약 후 계약자 변경 예정으로 기록하고 변경에 대한 상대방 동의 여부를 결과 안내에 포함한다. 법인이 여러 호실·여러 건물을 한꺼번에 계약하면 특수 사건.
- 명의 차용: `r1_cp_other_name` 또는 `r1_fe_nominee_name`이면 `nominee.proposed=true`로 통합 기록한다(두 질문 중 하나만 답해도 같은 신호).
- 전매·전대: `r1_pj_secondary_transfer`, `r1_cu_sublease`는 계약 상대방이 원래 권리자가 아닌 구조로 기록하고, 원래 권리자(개발사·건물주)의 승인·동의를 확인할 사실로 남긴다.

---

## L. Goal / Action / Response structure

### 고객 목표 값
| 구분 | 값 |
|---|---|
| 우선 확인 목표(1차) `goal.primary` | verify_owner_authority(`r1_cg_owner_authority`) / review_terms(`r1_cg_contract_terms`) / payment_safety(`r1_cg_money_safety`) / foreigner_eligibility(`r1_cg_foreigner_fit`) / sequence_guidance(`r1_cg_order_unsure`) |
| 최종 목표(2차) `goal.final` | sign_after_check(`r1_fg_sign_safely`) / revise_then_sign(`r1_fg_revise_then_sign`) / protect_deposit(`r1_fg_protect_deposit`) / withdraw_minimize_loss(`r1_fg_withdraw_safely`) / delegate_to_expert(`r1_fg_expert_handle`) |

### 고객 행동 값
| 행동 | 값 | 질문 |
|---|---|---|
| 조건만 들음 | `stage.current=viewing` | re01_progress_stage |
| 계약서 수령 | `contract.draft=received` | re01_progress_stage, re01_contract_form |
| 원본·계약서 확인 요청함 / 안 함 | `client.action_precheck_request=made / not_made` | re01_owner_doc_check(`r1_od_refused_delay`), re01_precheck_response |
| 불일치 이의 제기함 / 안 함 | `client.action_raised_diff=true / false` | re01_counterparty_reaction |
| 계약금 송금(계좌·현금·중개인 경유) | `payment.deposit=paid`, `payment.method`, `payment.handler` | re01_progress_stage, re01_deposit_paid_proof |
| 서명 일정 확정 | `contract.main=scheduled` | re01_progress_stage, re01_sign_date |

### 상대방 반응 값 (7분류)
| 분류 | 해당 선택지 |
|---|---|
| 수락 | `r1_cr_agreed_fix`, `r1_pr_accepted`, `r1_pa_on_schedule` |
| 거부 | `r1_cr_refused`, `r1_od_refused_delay`, `r1_bs_copy_enough` |
| 일부 수용 | `r1_cr_verbal_promise` (말로만 수용, 서면 반영 거부) |
| 연락 회피 | `r1_cr_no_reply`, `r1_pa_unreachable`, `r1_bs_no_reason`(설명 없이 미룸) |
| 추가 요구 | `r1_pr_pay_first`, `r1_pa_more_money`, `r1_rr_refused_or_fee`(신고 대가 비용) |
| 책임 전가 | `r1_pr_shift_blame`, `r1_pa_delay_excuse` |
| 새 조건 | `r1_pr_new_terms`, `r1_pa_terms_changed`, `r1_sd_pressure_days`(기한 압박), `r1_dl_terms_open`(조건 나중에) |

---

## M. 결과 판정 데이터

### 판정 규칙 (v1 유지 + 보완)
- 선택된 신호 중 가장 높은 단계를 최종 판정으로 한다.
- "주의" 신호가 3개 이상이면 "전문가 권장"으로 올린다.
- 신호가 하나도 없으면 "확인 필요"(기본 점검 안내)로 표시한다.
- 〔보완〕 특수 사건 조건에 걸리면 판정 단계와 별도로 "VFBCAI 전문가팀 진행" 배너를 표시하고 퍼널 안내를 대신한다.
- 〔보완〕 `nominee.proposed=true`는 `r1_cp_other_name`·`r1_fe_nominee_name` 중 어느 쪽으로 들어와도 한 번만 센다.

### 판정 단계
| 단계 | 의미 | 결과 화면 처리 |
|---|---|---|
| 확인 필요 | 위험 신호는 없거나 낮고, 계약서에 적어 둘 항목이 남아 있음 | 핵심 확인 결과 3칸 + STEP 3개 |
| 주의 | 서명·송금 전에 반드시 확인하거나 고쳐야 할 사실이 있음 | 위험 문장 상단 표시 + STEP 3개 |
| 전문가 권장 | 권한·돈의 경로·명의 구조에 손해 위험이 있어 전문가 검토가 필요함 | 위험 문장 + 전문가 검토 안내 |
| VFBCAI 전문가팀 진행 | 계약 전 검토 범위를 넘어선 분쟁·다수 당사자·대규모 거래 | 퍼널 대신 전문가팀 안내 배너 |

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
| `r1_fe_nominee_name` / `r1_cp_other_name` 〔보완〕 | 다른 사람 명의를 빌려 계약하거나 사는 방식은 그 사람이 권리를 주장할 경우 보호받기 어려울 수 있습니다. |
| `r1_fe_landed_house` | 프로젝트 밖의 개인 주택은 외국인 명의 소유가 제한될 수 있어, 계약 전에 소유 가능 여부부터 확인해야 합니다. |
| `r1_cu_sublease` | 다시 빌리는 구조에서는 원래 임대차가 끝나면 함께 나가야 할 수 있어, 건물주 동의 여부를 먼저 확인해야 합니다. |
| `r1_pr_pay_first` 〔추가〕 | 원본이나 계약서를 보여 주기 전에 돈부터 요구하는 경우, 소유 여부와 조건이 확인될 때까지 송금하지 않는 것이 안전합니다. |
| `r1_pa_more_money` 〔추가〕 | 본계약 전에 추가 송금을 요구받았다면, 이미 보낸 계약금의 처리 기준을 서면으로 정하기 전까지 더 보내지 않는 것이 안전합니다. |
| `r1_pa_unreachable` 〔추가〕 | 계약금을 받은 뒤 상대방 연락이 어려워졌다면, 지급 증명 자료를 먼저 모아 두고 계약금 반환 가능성을 검토해야 합니다. |

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
| `r1_ps_mortgage_payoff` / `r1_bs_bank_held` 〔보완〕 | 은행 담보가 남아 있는 집은 담보 해제 순서와 시점이 계약서에 적혀 있어야 안전합니다. |
| `r1_rr_refused_or_fee` | 임시거주 신고가 되지 않으면 비자·체류 관련 절차에 영향을 줄 수 있어, 신고 책임을 계약서에 적어 두는 것이 좋습니다. |
| `r1_cu_use_restricted` | 용도 제한이 있는 공간은 회사 주소 등록이나 영업이 어려울 수 있어, 계약 전에 용도를 확인해야 합니다. |
| `r1_fe_quota_verbal` | 외국인 구매 가능 물량은 건물마다 한도가 있어, 말로 들은 내용만으로는 명의 등록이 가능한지 알기 어렵습니다. |
| `r1_cc_amount_diff` / `r1_cc_unit_diff` | 계약서의 금액이나 물건 정보가 들은 내용과 달라, 서명 전에 수정 여부를 확인해야 합니다. |
| `r1_cr_verbal_promise` / `r1_cr_refused` | 다른 부분을 계약서에 반영하지 않으면, 나중에 말로 한 약속을 주장하기 어려울 수 있습니다. |
| `r1_br_both_sides` | 중개인이 양쪽 일을 함께 맡고 있어, 중요한 조건은 상대방에게 직접 서면으로 확인받는 것이 좋습니다. |
| `r1_dl_terms_open` | 조건이 정해지지 않은 상태에서 계약금을 걸면, 이후 조건이 맞지 않을 때 계약금 처리를 두고 다툼이 생길 수 있습니다. |
| `r1_sd_pressure_days` | 짧은 기한으로 결정을 재촉받고 있어, 핵심 확인 항목을 먼저 정해 두고 진행하는 것이 좋습니다. |
| `r1_bs_reissue_transfer` 〔추가〕 | 핑크북이 재발급이나 명의 변경 중이라면, 지금 계약하는 상대방이 현재 소유자로 등록되어 있는지 먼저 확인해야 합니다. |
| `r1_bs_other_holder` 〔추가〕 | 원본을 다른 사람이 보관하고 있다면, 그 사람과 소유자의 관계와 원본을 넘겨받는 시점을 계약 전에 확인해야 합니다. |
| `r1_bs_copy_enough` / `r1_bs_no_reason` 〔추가〕 | 원본 대조를 미루는 이유가 확인되지 않으면, 소유 여부를 확인할 수 없는 상태로 계약하게 될 수 있습니다. |
| `r1_pr_shift_blame` 〔추가〕 | 소유자와 직접 확인할 수 없는 상황이라면, 소유자 본인의 서면 확인이나 공증된 위임장을 먼저 받아야 합니다. |
| `r1_pr_new_terms` 〔추가〕 | 확인을 요청하자 금액이나 기한 조건이 바뀌었다면, 바뀐 조건을 서면으로 받은 뒤 다시 판단하는 것이 좋습니다. |
| `r1_pa_terms_changed` / `r1_pa_delay_excuse` 〔추가〕 | 계약금을 보낸 뒤 조건 변경이나 일정 지연이 생겼다면, 계약금 약정서의 위약 조항에 따라 처리 기준을 서면으로 확인해야 합니다. |
| `r1_pj_reservation_only` 〔추가〕 | 정식 매매계약 전에 받는 예약금은 반환 조건과 정식 계약으로 넘어가는 조건을 서면으로 확인해 두어야 합니다. |
| `r1_pj_brochure_only` 〔추가〕 | 안내 책자와 설명만으로는 개발사의 판매 조건을 확인할 수 없어, 계약 전에 사업 서류를 서면으로 받아야 합니다. |
| `r1_pj_secondary_transfer` 〔추가〕 | 먼저 분양받은 사람에게서 계약을 넘겨받는 경우, 개발사가 명의 변경을 승인하는지와 지금까지 낸 대금 내역을 확인해야 합니다. |
| `r1_ic_online_only` + `r1_st_deposit_requested` 〔추가〕 | 메시지로만 연락한 상대방에게 송금하기 전에, 직접 만나 신분증과 핑크북 원본을 대조해야 합니다. |

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
| `r1_pj_permits_only` 〔추가〕 | 아직 완공되지 않은 분양 아파트라면, 개발사의 은행 보증 여부를 계약 전에 확인해 두는 것이 좋습니다. |
| `r1_cp_company_pending` 〔추가〕 | 회사 설립 전에 개인 이름으로 계약한다면, 설립 후 계약자를 회사로 바꾸는 방법과 상대방 동의를 계약서에 적어 두는 것이 좋습니다. |
| `r1_cp_with_spouse` 〔추가〕 | 공동 명의로 하려면, 계약서와 이후 명의 등록에 두 사람이 모두 적히는지 확인해 두는 것이 좋습니다. |

### 특수 사건 (퍼널 대신 "VFBCAI 전문가팀 진행" 안내로 표시)
- 계약금을 보낸 뒤 상대방과 연락이 끊겼거나, 사기로 의심해 공안 신고를 이미 했거나 하려는 경우
- 같은 물건을 두고 이미 소송이나 분쟁이 진행 중이라고 들은 경우
- 공동 상속인 등 소유자가 여러 명이고 그중 일부와 연락이 되지 않는 경우
- 법인이 여러 건물·여러 호실을 한꺼번에 빌리거나 사는 경우
- 판단(구조화 조건):
  - `r1_sd_passed` + `r1_dp_cash_no_receipt|r1_dp_via_broker` (v1 유지)
  - 〔추가〕 `r1_pa_unreachable` + `r1_dp_cash_no_receipt|r1_dp_via_broker|r1_dp_transfer_only`
  - 〔추가〕 `r1_pa_unreachable` + `r1_sd_passed`
  - 직접 입력 텍스트에 위 4개 상황(연락 두절·공안 신고, 소송·분쟁 진행, 연락 안 되는 공동 소유자, 법인 다수 물건)이 있는 경우
- 1차 결과 "핵심 확인 결과" 3칸 문장 규칙과 "지금 확인해 보세요" STEP 3개는 v1(pack-RE01.md 3·4절) 그대로 쓴다. 단, STEP 3의 [임대: 임시거주 신고 책임]은 계약금 요청·지급 경로에서 re01_residence_registration 질문을 대신하므로 해당 경로에서도 반드시 표시한다.


---

# RE02 보증금·계약금 분쟁 — VFBCAI_REAL_ESTATE_CONTENT_PACK_MASTER_v1

- 입력: pack-RE02.md(Content Pack v1). 기존 질문·선택지 문장과 value는 원칙적으로 유지하고, 바꾼 곳에는 `변경 이유:` 한 줄을 남겼다.
- value 규칙: 영어 snake_case, 질문별 고유 접두사. 질문 간 value 중복 없음. 이번에 새로 쓴 접두사: ph_, dg_, dc_, mi_, rc_, mf_, ur_, pc_, cr_, cn_, cm_, rr_, rd_.
- show_if 표기: `질문id = v1|v2`(그중 하나, multi 질문이면 "그 값을 선택에 포함"), `AND` / `OR` / `NOT` 결합, `≠`는 해당 값이 아닌 경우(응답이 있을 때). 대문자 이름(`PATH_A` 등)은 F절에 정의한 경로 조건이고, 구현할 때는 정의식으로 펼쳐 쓴다.
- meaning 표기: `key=value; key=value`. key는 Situation Profile 필드 경로다. `self`=고객 본인, `counterparty`=계약 상대방.
- 엔진 공용 "위에 내용이 없거나 설명이 필요합니다 → 직접 입력"은 모든 single/multi 질문에 자동으로 붙으므로 아래에는 적지 않았다.
- 문항 수는 선택형(single/multi) 기준으로 센다. 텍스트 입력(금액·날짜)은 별도로 표기한다.

---

## B. 전문가 프로파일링 구조

부동산 전문가가 보증금·계약금 사건의 첫 상담에서 확인하는 사실 축과, 각 축을 채우는 질문 id.

| 축 | 전문가가 확인하는 사실 | Situation Profile 필드 | 채우는 질문 id |
|---|---|---|---|
| 목표 | 고객이 지금 가장 먼저 알고 싶은 것 / 최종적으로 원하는 마무리 | goal.first_check, goal.final | re02_confirm_goal, re02_final_goal |
| 시작점 | 어떤 돈(보증금/계약금)이고, 어떤 다툼으로 들어왔는가 | contract.kind, dispute.type | Q1, re02_role, re02_dispute_type, re02_dispute_type_holder |
| 현재 단계 | 계약 종료 여부, 집 인도 여부, 요구를 했는지, 일부라도 돌려받았는지 | contract.end_type, handover.done, action.demand_method, amount.state | re02_contract_end, re02_handover_record, re02_demand_method, re02_amount_state |
| 당사자 | 고객의 입장, 돈을 낸 쪽/받은 쪽, 실제로 돈을 받은 사람 | party.role, party.side, payment.receiver | re02_role, re02_payment_path, re02_broker_hold |
| 관계 | 회사 명의·대리인·중개인이 끼어 있는지, 서명자가 실제 소유자인지 | contract.signer, payment.via, contract.signer_valid | re02_role, re02_payment_path, re02_contract_form, re02_cancel_form |
| 계약 | 계약서 형태, 계약금·공제·위약금·통지 조항 | contract.form, contract.deposit_clause, penalty.clause | re02_contract_form, re02_forfeit_clause, re02_penalty_clause, re02_contract_end |
| 지급 | 금액, 지급 방법, 지급 증거 | amount.detail, payment.evidence, payment.cash_proof | re02_amount_state, re02_amount_detail, re02_money_evidence, re02_cash_proof |
| 상대방 행동 | 상대방이 돌려주지 않는 이유, 공제·청구 항목과 계산 근거, 계약을 깬 쪽 | counterparty.refusal_reason, deduction.items, claim.*_basis, cancel.initiator | re02_other_reason, re02_refusal_reason, re02_return_demand_basis, re02_deduction_items, re02_extra_claim_detail, re02_claimed_damage, re02_repair_cost_basis, re02_mgmt_fee_basis, re02_unpaid_rent_period, re02_penalty_clause, re02_cancel_reason |
| 고객 행동 | 고객이 남긴 기록, 요구 방법, 취소 의사 표시 방법 | action.demand_method, evidence.exit_photos, evidence.movein_record, cancel.confirmation | re02_demand_method, re02_exit_photos, re02_movein_condition, re02_cancel_form |
| 증거 | 계약·지급·집 상태·조건 발생을 보여 주는 자료 | evidence.* | re02_money_evidence, re02_cash_proof, re02_contract_form, re02_handover_record, re02_exit_photos, re02_movein_condition, re02_repair_cost_basis, re02_condition_met |
| 시간축 | 계약일·지급일·입주일·종료(취소)일·인도일·요구일·기한 | timeline.* | re02_key_dates, re02_contract_end, re02_deadline, re02_deadline_date, re02_unpaid_rent_period |
| 상대방 반응 | 요구한 뒤 상대방이 수락·거부·일부 수용·연락 회피·추가 요구·책임 전가·새 조건 중 어떻게 나왔는가 | counterparty.response | re02_other_reaction |
| 위험 | 사실 다툼의 정도, 기록 공백, 진행이 막힌 이유 | risk.* | re02_situation_match, re02_damage_cause, re02_blockage (+ M절 위험 신호) |
| 최종 목표 | 정산·합의·정식 요구·거절·전문가 위임 중 무엇을 원하는가 | goal.final | re02_final_goal |

---

## C. 1차 노드 (phase 1) — Q1 + 4문항

### 0. 공용 Q1 (확정, 수정 금지)
- 선택된 옵션: "보증금이나 계약금을 돌려받지 못했거나, 돈 문제로 상대방과 다투고 있습니다." → RE02 진입
- meaning: `case=RE02`

### re02_role
- phase: 1 / kind: single / show_if: 항상 / profile_field: `party.role`, `party.side`, `contract.kind`
- 질문: 이번 계약에서 어떤 입장이셨나요?

| value | 선택지 | meaning |
|---|---|---|
| `role_tenant` | 집을 빌려 살았던 세입자이고, 집주인에게 보증금을 맡겨 두었습니다. | party.role=tenant; party.side=payer; contract.kind=lease; contract.signer=self |
| `role_company_occupant` | 계약은 회사 명의로 했고, 저는 그 집에 실제로 살았던 사람입니다. | party.role=occupant; party.side=payer; contract.kind=lease; contract.signer=company |
| `role_landlord` | 집을 빌려준 집주인이고, 세입자에게 보증금을 받아 보관하고 있었습니다. | party.role=landlord; party.side=holder; contract.kind=lease |
| `role_buyer` | 집을 사려던 매수인이고, 매도인에게 계약금(đặt cọc)을 보냈습니다. | party.role=buyer; party.side=payer; contract.kind=sale_deposit |
| `role_seller` | 집을 팔려던 매도인이고, 매수인에게 계약금(đặt cọc)을 받았습니다. | party.role=seller; party.side=holder; contract.kind=sale_deposit |

### re02_dispute_type
- phase: 1 / kind: single / show_if: `re02_role = role_tenant|role_company_occupant|role_buyer` / profile_field: `dispute.type`, `payment.refund_status`
- 질문: 돈 문제는 지금 어떤 상황인가요?

| value | 선택지 | meaning |
|---|---|---|
| `dt_not_returned` | 계약이 끝났거나 끝내기로 했는데, 맡긴 보증금이나 계약금을 아직 전혀 돌려받지 못했습니다. | dispute.type=not_returned; payment.refund_status=none |
| `dt_partial_deduction` | 일부는 돌려받았지만, 수리비·청소비 등을 이유로 상당한 금액이 공제되었습니다. | dispute.type=partial_deduction; payment.refund_status=partial |
| `dt_deposit_forfeited` | 계약이 진행되지 않자, 상대방이 계약금을 모두 가져가겠다고 하고 있습니다. | dispute.type=forfeit_claimed; payment.refund_status=none; counterparty.position=keep_all |
| `dt_extra_claim` | 돌려받기는커녕, 위약금이나 추가 금액을 더 내라는 요구를 받고 있습니다. | dispute.type=extra_claim_against_self; payment.refund_status=none; counterparty.position=demands_more |
| `dt_contact_avoided` | 돌려주겠다는 말은 들었지만, 그 뒤로 상대방이 연락을 피하거나 답이 없습니다. | dispute.type=not_returned; payment.refund_status=none; counterparty.promise=verbal_return; counterparty.contact=avoiding |

### re02_dispute_type_holder
- phase: 1 / kind: single / show_if: `re02_role = role_landlord|role_seller` / profile_field: `dispute.type`, `counterparty.position`
- 질문: 상대방과는 어떤 돈 문제로 다투고 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `hd_deduct_dispute` | 손상이나 밀린 금액을 공제하고 돌려주려 했는데, 상대방은 전액을 돌려달라고 요구하고 있습니다. | dispute.type=deduction_contested; counterparty.position=full_refund |
| `hd_forfeit_dispute` | 상대방이 계약을 포기해 계약금을 돌려주지 않으려 하는데, 상대방은 돌려달라고 요구하고 있습니다. | dispute.type=forfeit_contested; cancel.initiator=counterparty; counterparty.position=full_refund |
| `hd_double_demand` | 제 사정으로 계약을 진행하지 못하게 되자, 상대방이 계약금의 두 배를 돌려달라고 요구하고 있습니다. | dispute.type=double_return_demand; cancel.initiator=self; counterparty.position=double_refund |
| `hd_extra_claim` | 손해나 밀린 금액이 보증금보다 커서 차액을 요구했지만, 상대방이 지급하지 않고 있습니다. | dispute.type=extra_claim_by_self; counterparty.position=refuses_to_pay |
| `hd_contact_lost` | 상대방이 밀린 금액을 남긴 채 집을 비웠거나, 연락을 끊었습니다. | dispute.type=counterparty_absconded; counterparty.contact=lost |

### re02_contract_end
- phase: 1 / kind: single / show_if: 항상 / profile_field: `contract.end_type`, `contract.notice_compliance`
- 질문: 계약은 어떻게 끝났나요?

| value | 선택지 | meaning |
|---|---|---|
| `end_expired` | 계약서에 정한 기간(임대 기간이나 본계약 체결 기한)이 지나, 계약이 그대로 종료되었습니다. | contract.end_type=expired; contract.notice_compliance=not_applicable |
| `end_me_with_notice` | 제가 먼저 계약을 끝냈고, 계약서에 정한 기간만큼 미리 알렸습니다. | contract.end_type=terminated_by_self; contract.notice_compliance=met |
| `end_me_short_notice` | 제가 먼저 계약을 끝냈지만, 미리 알린 기간이 계약서보다 짧았거나 따로 알리지 못했습니다. | contract.end_type=terminated_by_self; contract.notice_compliance=short_or_none |
| `end_other_first` | 상대방이 먼저 계약을 끝내자고 했거나, 상대방이 계약을 지키지 않아 끝나게 되었습니다. | contract.end_type=terminated_by_counterparty |
| `end_not_ended` | 계약은 아직 끝나지 않았지만, 돈 문제로 이미 다툼이 생겼습니다. | contract.end_type=ongoing |

### re02_confirm_goal
- phase: 1 / kind: single / show_if: 항상 / profile_field: `goal.first_check`
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?

| value | 선택지 | meaning |
|---|---|---|
| `cg_entitlement` | 이 돈을 돌려받을 수 있는지(또는 돌려주어야 하는지), 계약서와 실제 사정을 기준으로 확인하고 싶습니다. | goal.first_check=entitlement |
| `cg_amount_check` | 공제되거나 요구받은 금액이 어떻게 계산되었는지, 그 금액이 맞는지 확인하고 싶습니다. | goal.first_check=amount_calculation |
| `cg_forfeit_rule` | 계약금을 돌려주지 않거나 두 배로 돌려달라는 주장이 계약서 조항에 맞는지 확인하고 싶습니다. | goal.first_check=deposit_clause |
| `cg_how_to_demand` | 상대방에게 언제, 어떤 방법으로 정식 요구를 해야 하는지 확인하고 싶습니다. | goal.first_check=demand_method_timing |
| `cg_unsure` | 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다. | goal.first_check=next_step_order |

---

## D. 2차 공통 노드 (phase 2) — 여러 경로가 함께 쓰는 사실 추적

### re02_amount_state
- phase: 2 / kind: single / show_if: `NOT PATH_A AND NOT PATH_B` / profile_field: `amount.state`
- 변경 이유: A·B 경로는 금액 구조가 단순(보증금 전액 미반환 / 계약금 1건)해 금액 텍스트 입력으로 바로 받고, 그 자리에 경로별 사실 질문을 넣었다.
- 질문: 다툼이 되는 금액은 어떻게 정리되어 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `amt_clear` | 계약서 금액과 실제로 주고받은 금액이 같고, 다툼이 되는 금액도 분명합니다. | amount.state=clear; amount.contract_matches_paid=yes |
| `amt_differs` | 금액은 알고 있지만, 제가 아는 금액과 상대방이 말하는 금액이 서로 다릅니다. | amount.state=disputed_figure |
| `amt_partial_settled` | 일부는 이미 돌려받았거나 돌려주었고, 남은 금액을 두고 다투고 있습니다. | amount.state=partially_settled; payment.refund_status=partial |
| `amt_currency_mixed` | 동(VND)과 달러 등으로 나눠 주고받아, 정확한 금액을 아직 정리하지 못했습니다. | amount.state=mixed_currency; amount.currency=multiple |
| `amt_unknown` | 정확한 금액이 기억나지 않고, 금액을 확인할 기록도 찾지 못했습니다. | amount.state=unknown; evidence.amount_record=none |

### re02_amount_detail
- phase: 2 / kind: text / show_if: `re02_amount_state = amt_clear|amt_differs|amt_partial_settled|amt_currency_mixed OR PATH_A OR PATH_B` / profile_field: `amount.detail`
- 변경 이유: A·B 경로에서는 re02_amount_state 없이 바로 보이도록 show_if를 넓혔다.
- 질문: 주고받은 금액과 다툼이 되는 금액을 입력해 주세요.
- placeholder: 예: 보증금 2개월치 30,000,000동을 송금했고, 15,000,000동만 돌려받았습니다. 상대방은 수리비로 15,000,000동을 공제했다고 합니다. / 계약금 200,000,000동을 보냈고, 상대방은 전액을 돌려주지 않겠다고 합니다.

### re02_key_dates (신규)
- phase: 2 / kind: text / show_if: 항상 / profile_field: `timeline.key_dates`
- 추가 이유: 반환 기한·밀린 임대료·통지 기간·계약금 몰수 여부는 모두 날짜 순서로 갈리는데, v1에는 계약·지급·종료·인도 날짜를 받는 칸이 없었다.
- 질문: 이 일과 관련된 주요 날짜를 아는 만큼 입력해 주세요.
- placeholder: 예: 2026년 3월 1일 계약·보증금 송금 / 9월 30일 계약 종료·열쇠 반납 / 10월 3일 집주인이 수리비 공제 통보 (계약금 사건이면: 계약금 보낸 날, 본계약·잔금 예정일, 취소 이야기가 나온 날)

### re02_money_evidence
- phase: 2 / kind: single / show_if: 항상 / profile_field: `payment.evidence`
- 질문: 돈을 주고받은 사실은 어떤 자료로 확인할 수 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `me_contract_transfer` | 양쪽이 서명한 계약서가 있고, 은행 송금 내역도 남아 있습니다. | payment.evidence=contract_and_transfer; contract.written=yes; payment.method=bank_transfer |
| `me_transfer_only` | 계약서는 없거나 찾지 못했지만, 은행 송금 내역은 남아 있습니다. | payment.evidence=transfer_only; contract.written=missing; payment.method=bank_transfer |
| `me_cash_message` | 현금으로 주고받았고, 받았다는 메시지나 손으로 쓴 영수증만 남아 있습니다. | payment.evidence=cash_with_note; payment.method=cash |
| `me_none` | 계약서·송금 내역·받았다는 메시지 등 확인할 수 있는 자료가 없습니다. | payment.evidence=none |

### re02_contract_form
- phase: 2 / kind: single / show_if: `re02_money_evidence = me_contract_transfer` / profile_field: `contract.form`, `contract.signer_valid`
- 질문: 계약서는 어떤 형태로 작성되었나요?

| value | 선택지 | meaning |
|---|---|---|
| `cf_bilingual_signed` | 한국어(또는 영어)와 베트남어가 함께 적힌 계약서에, 양쪽이 서명했습니다. | contract.form=bilingual_signed; contract.language_understood=yes |
| `cf_vn_only` | 베트남어로만 된 계약서에 서명했고, 내용을 모두 이해하지는 못했습니다. | contract.form=vietnamese_only; contract.language_understood=partial |
| `cf_notarized` | 공증사무소에서 공증받은 계약서이고, 공증본을 가지고 있습니다. | contract.form=notarized; evidence.notarized_copy=yes |
| `cf_broker_form` | 중개인이 준비한 간단한 양식이나 계약금 확인서(giấy đặt cọc) 형태입니다. | contract.form=broker_short_form |
| `cf_signer_doubt` | 계약서는 있지만, 상대방 서명이 빠져 있거나 실제 소유자가 아닌 사람이 서명했습니다. | contract.form=signed_doubtful; contract.signer_valid=doubtful |

### re02_cash_proof
- phase: 2 / kind: single / show_if: `re02_money_evidence = me_cash_message|me_none` / profile_field: `payment.cash_proof`
- 질문: 돈을 건넸거나 받은 사실은 지금 무엇으로 확인할 수 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `cp_admit_message` | 상대방이 돈을 받았다고 인정한 문자나 메신저(Zalo 등) 메시지가 남아 있습니다. | payment.cash_proof=admission_message |
| `cp_handwritten_signed` | 상대방이 손으로 써 준 영수증이나 메모가 있고, 서명도 되어 있습니다. | payment.cash_proof=signed_handwritten_receipt |
| `cp_witness_broker` | 자료는 없지만, 중개인이나 함께 있던 사람이 확인해 줄 수 있습니다. | payment.cash_proof=witness_only; party.witness=broker_or_other |
| `cp_withdrawal_only` | 현금을 인출한 은행 기록은 있지만, 상대방에게 건넨 기록은 없습니다. | payment.cash_proof=withdrawal_record_only |
| `cp_nothing` | 찾아봤지만, 돈을 주고받은 사실을 확인할 방법이 없습니다. | payment.cash_proof=none |

### re02_payment_path
- phase: 2 / kind: single / show_if: `PATH_B OR PATH_D1 OR PATH_E OR ((PATH_A OR PATH_C) AND re02_role = role_company_occupant)` / profile_field: `payment.payer`, `payment.receiver`, `payment.via`
- 변경 이유: A·C 경로에서는 보증금을 받은 사람이 집주인 본인이라는 점에 다툼이 거의 없어 기본으로는 숨기고, 회사 명의 계약일 때만 보이게 했다.
- 질문: 이 돈은 누가 주고, 누가 받았나요?

| value | 선택지 | meaning |
|---|---|---|
| `pp_direct` | 제가 직접 상대방 본인에게 주었거나, 상대방 본인에게서 받았습니다. | payment.payer=self; payment.receiver=counterparty; payment.via=direct |
| `pp_agent_my_side` | 제 쪽에서는 회사·가족·지인이 대신 주고받았고, 저는 직접 관여하지 않았습니다. | payment.payer=self_side_agent; payment.via=self_agent |
| `pp_agent_other_side` | 상대방 쪽에서는 가족이나 관리인 등 다른 사람이 대신 받거나 보냈습니다. | payment.receiver=counterparty_agent; payment.via=counterparty_agent |
| `pp_via_broker` | 중개인을 거쳐 주고받았고, 상대방에게 실제로 전달되었는지는 중개인 말로만 알고 있습니다. | payment.via=broker; payment.delivery_confirmed=broker_word_only |
| `pp_unclear` | 누구 명의 계좌로 오갔는지, 실제로 누가 받았는지 확실하지 않습니다. | payment.receiver=unknown |

### re02_broker_hold
- phase: 2 / kind: single / show_if: `re02_payment_path = pp_via_broker` / profile_field: `payment.broker_status`
- 질문: 중개인을 거친 돈은 지금 어떤 상태인가요?

| value | 선택지 | meaning |
|---|---|---|
| `bh_delivered_proof` | 중개인이 상대방에게 전달했고, 전달한 영수증이나 송금 내역도 보여 주었습니다. | payment.broker_status=delivered_documented; payment.receiver=counterparty |
| `bh_delivered_word` | 중개인은 전달했다고 하지만, 전달한 기록은 확인하지 못했습니다. | payment.broker_status=delivered_unverified |
| `bh_still_holding` | 중개인이 아직 돈을 보관하고 있다고 하지만, 돌려주지 않고 있습니다. | payment.broker_status=held_by_broker; payment.receiver=broker |
| `bh_broker_unreachable` | 중개인과도 연락이 잘 되지 않아, 돈이 지금 어디에 있는지 모릅니다. | payment.broker_status=broker_unreachable; payment.receiver=unknown |

### re02_demand_method
- phase: 2 / kind: single / show_if: 항상 / profile_field: `action.demand_method`
- 질문: 지금까지 상대방에게 어떤 방법으로 요구하거나 대응하셨나요?

| value | 선택지 | meaning |
|---|---|---|
| `dm_not_yet` | 아직 상대방에게 정식으로 요구하거나 대응하지 않았습니다. | action.demand_method=none |
| `dm_verbal_only` | 전화하거나 만나서 말로만 요구했고, 따로 남긴 기록은 없습니다. | action.demand_method=verbal; action.demand_recorded=no |
| `dm_written_message` | 문자·Zalo·이메일 등 글로 요구했고, 보낸 기록이 남아 있습니다. | action.demand_method=written_message; action.demand_recorded=yes |
| `dm_broker_relay` | 중개인이나 관리사무소를 통해 제 요구를 전달했습니다. | action.demand_method=via_intermediary; action.demand_recorded=indirect |
| `dm_formal_letter` | 금액과 기한을 적은 정식 요구 문서를 서명해서 보냈습니다. | action.demand_method=formal_signed_letter; action.demand_recorded=yes |

### re02_other_reaction
- phase: 2 / kind: single / show_if: `re02_demand_method ≠ dm_not_yet` / profile_field: `counterparty.response`
- 변경 이유: L절의 상대방 반응 7유형(수락·거부·일부 수용·연락 회피·추가 요구·책임 전가·새 조건)을 받도록, `rx_promised_vague`를 `rx_new_condition`으로 바꾸고 `rx_refused_blame`을 추가했다. 선택지가 6개로 1개 늘었다.
- 질문: 요구하거나 대응한 뒤, 상대방은 어떻게 반응했나요?

| value | 선택지 | meaning |
|---|---|---|
| `rx_promised_date` | 돌려주거나 정리하겠다고 했고, 구체적인 날짜도 말했습니다. | counterparty.response=accepted; counterparty.promise_date=given |
| `rx_new_condition` | 정리하겠다고는 했지만, 다음 세입자·매수인을 구한 뒤나 합의서에 서명하면 주겠다는 등 새 조건을 붙였거나 날짜를 정하지 않았습니다. | counterparty.response=new_condition; counterparty.promise_date=none |
| `rx_partial_offer` | 일부 금액만 주겠다고 했거나, 실제로 일부만 보냈습니다. | counterparty.response=partial_acceptance |
| `rx_refused_blame` | 돌려줄 수 없다고 거절했고, 그 책임을 저나 중개인·관리사무소 등 다른 사람에게 돌렸습니다. | counterparty.response=refused; counterparty.blame=shifted |
| `rx_counter_claim` | 오히려 손해나 위약금을 이유로, 저에게 돈을 더 요구했습니다. | counterparty.response=counter_demand |
| `rx_ignored` | 메시지를 읽고도 답이 없거나, 연락을 피하고 있습니다. | counterparty.response=no_response; counterparty.contact=avoiding |

### re02_situation_match
- phase: 2 / kind: single / show_if: `PATH_D1 OR PATH_E` / profile_field: `risk.fact_gap`
- 변경 이유: A 경로는 re02_damage_cause, B 경로는 re02_cancel_reason·re02_refusal_reason, C 경로는 항목별 후속 질문이 같은 비교를 더 구체적으로 하므로, 일반 비교 질문은 D·E 경로에만 남겼다.
- 질문: 상대방의 주장은 실제 있었던 일과 비교하면 어떤가요?

| value | 선택지 | meaning |
|---|---|---|
| `sm_match` | 상대방이 말하는 사실은 대체로 맞고, 금액이나 처리 방법만 서로 다릅니다. | risk.fact_gap=amount_only |
| `sm_partial` | 일부 사실은 맞지만, 손상 정도나 금액 등 중요한 부분이 실제와 다릅니다. | risk.fact_gap=partial |
| `sm_mismatch` | 상대방이 말하는 일은 실제로 없었거나, 책임은 오히려 상대방에게 있다고 생각합니다. | risk.fact_gap=contradicted; dispute.liability_view=counterparty |
| `sm_hard_to_judge` | 기록이 남아 있지 않아, 누구 말이 맞는지 비교하기 어렵습니다. | risk.fact_gap=unverifiable |
| `sm_unknown` | 상대방이 무엇을 주장하는지 정확히 알지 못해, 비교할 수 없습니다. | risk.fact_gap=claim_unknown |

### re02_deadline
- phase: 2 / kind: single / show_if: 항상 / profile_field: `timeline.deadline_type`
- 질문: 이 돈 문제와 관련해 정해진 기한이 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `dl_contract_term` | 계약서에 반환 기한(예: 집을 비운 뒤 며칠 이내)이 적혀 있고, 날짜를 계산할 수 있습니다. | timeline.deadline_type=contract_refund_term |
| `dl_promised_date` | 상대방이 특정 날짜까지 돌려주거나 정리하겠다고 약속했습니다. | timeline.deadline_type=counterparty_promise |
| `dl_my_schedule` | 출국·이사·다음 계약 등 제 일정 때문에, 그 전에 정리되어야 합니다. | timeline.deadline_type=self_schedule |
| `dl_other_demand` | 상대방이 정한 날짜까지 돈을 보내거나 합의하라고 요구했습니다. | timeline.deadline_type=counterparty_ultimatum |
| `dl_none` | 기한에 대해서는 정해진 것이 없거나, 있는지 확인하지 못했습니다. | timeline.deadline_type=none_or_unknown |

### re02_deadline_date
- phase: 2 / kind: text / show_if: `re02_deadline = dl_contract_term|dl_promised_date|dl_my_schedule|dl_other_demand` / profile_field: `timeline.deadline_date`
- 질문: 그 기한은 언제인가요?
- placeholder: 예: 2026년 11월 15일(집을 비운 날부터 30일 이내) / 11월 말 출국 예정

### re02_blockage
- phase: 2 / kind: single / show_if: `PATH_D1 OR PATH_D2 OR PATH_E` / profile_field: `risk.blockage`
- 변경 이유: A·B·C 경로는 경로별 질문(사진·입주 기록·조항·조건 증명·항목 근거)이 막힌 지점을 이미 구체적으로 확보하므로, 일반형 질문은 D·E 경로에만 남겼다.
- 질문: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?

| value | 선택지 | meaning |
|---|---|---|
| `bk_entitlement` | 정말 돌려받을(또는 돌려줘야 할) 돈인지 확신이 없어, 분명하게 요구하지 못하고 있습니다. | risk.blockage=entitlement_unclear |
| `bk_amount_basis` | 공제나 위약금이 어떻게 계산되었는지 몰라, 반박할 근거를 정리하지 못하고 있습니다. | risk.blockage=calculation_unknown |
| `bk_evidence` | 계약서·송금 내역·집 상태 기록 등 자료가 부족해, 대응을 시작하지 못하고 있습니다. | risk.blockage=evidence_gap |
| `bk_contact` | 상대방이 연락을 피하거나 베트남 밖에 있어, 대화 자체가 진행되지 않고 있습니다. | risk.blockage=no_contact |
| `bk_language_process` | 베트남어와 현지 절차를 잘 몰라, 다음에 무엇을 해야 할지 멈춰 있습니다. | risk.blockage=language_process |

### re02_final_goal
- phase: 2 / kind: single / show_if: 항상 / profile_field: `goal.final`
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?

| value | 선택지 | meaning |
|---|---|---|
| `fg_full_settlement` | 계약서 기준으로 받을(또는 돌려줄) 금액을 확인하고, 그 금액대로 정리하고 싶습니다. | goal.final=settle_per_contract |
| `fg_fair_compromise` | 공제나 위약금 중 타당한 부분은 인정하고, 나머지는 합의로 정리하고 싶습니다. | goal.final=negotiated_compromise |
| `fg_formal_demand` | 근거를 정리한 정식 요구 문서를 보내고, 기한 안에 답을 받고 싶습니다. | goal.final=formal_written_demand |
| `fg_reject_claim` | 상대방의 요구가 타당하지 않다면, 근거를 갖추어 분명하게 거절하고 싶습니다. | goal.final=reject_with_grounds |
| `fg_expert` | 제 상황을 전문가에게 정확히 전달해, 협상이나 대응을 맡기고 싶습니다. | goal.final=delegate_to_expert |

---

## E. 경로 A 노드 — 계약 종료 → 보증금 미반환 → 손상 주장

조사 순서: 돌려주지 않는 이유(손상) → 반환 시 상태 확인 → 사진/영상 → 주장 손상 → 손상 원인 → 입주 당시 상태 → 수리비 산정.

### re02_other_reason (경로 A·D1 진입 질문)
- phase: 2 / kind: single / show_if: `GATE_RENTAL_UNRETURNED` / profile_field: `counterparty.refusal_reason`
- 변경 이유: 매수인은 경로 B의 re02_refusal_reason으로 보내므로 임대 세입자·실거주자로 범위를 좁혔고, 이 답(`or_damage_claim` 여부)이 A와 D1을 가른다.
- 질문: 상대방은 돈을 돌려주지 않는 이유를 어떻게 설명했나요?

| value | 선택지 | meaning |
|---|---|---|
| `or_contract_clause` | 계약서의 특정 조항을 근거로 들었고, 어느 조항인지도 말해 주었습니다. | counterparty.refusal_reason=contract_clause; counterparty.clause_cited=yes |
| `or_damage_claim` | 집이나 물건이 손상되었다며, 수리비나 손해를 이유로 들었습니다. | counterparty.refusal_reason=damage; path=A |
| `or_my_breach` | 제가 먼저 계약을 어겼거나 일찍 끝냈다는 것을 이유로 들었습니다. | counterparty.refusal_reason=self_breach_alleged |
| `or_no_money_now` | 돌려줄 돈인 것은 인정하지만, 지금 돈이 없거나 다음 세입자·매수인을 구한 뒤 주겠다고 합니다. | counterparty.refusal_reason=liquidity; counterparty.liability_admitted=yes |
| `or_no_reason` | 구체적인 이유를 말하지 않았거나, 들은 설명을 이해하지 못했습니다. | counterparty.refusal_reason=none_or_unclear |

### re02_handover_record (반환 시 상태 확인)
- phase: 2 / kind: single / show_if: `PATH_A OR (PATH_C AND re02_deduction_items = ded_repair_restore|ded_cleaning_paint) OR (PATH_E AND re02_extra_claim_detail = xc_damage_over_deposit) OR PATH_D2` / profile_field: `handover.inspection`, `handover.record`, `handover.done`
- 변경 이유: v1 선택지가 "반환 시 점검 방식·퇴거 사진·입주 기록"을 한 질문에 섞어, 전문가가 따로 보는 세 사실이 구분되지 않았다. 이 질문은 반환 시 상태 확인 방식만 묻고, 사진은 re02_exit_photos, 입주 기록은 re02_movein_condition으로 분리했다. `ho_photos_only`·`ho_move_in_only`·`ho_no_record`는 삭제(두 신규 질문으로 이동)했고, `ho_joint_no_paper`·`ho_other_alone`·`ho_keys_only`를 추가했다.
- 질문: 집을 넘겨줄 때(넘겨받을 때), 집 상태는 어떻게 확인했나요?

| value | 선택지 | meaning |
|---|---|---|
| `ho_joint_signed` | 양쪽이 함께 집 상태를 점검했고, 서명한 인수인계서나 점검표가 남아 있습니다. | handover.done=yes; handover.inspection=joint; handover.record=signed_checklist |
| `ho_joint_no_paper` | 양쪽이 함께 둘러보았고 그 자리에서는 별다른 문제 지적이 없었지만, 서명한 문서는 남기지 않았습니다. | handover.done=yes; handover.inspection=joint; handover.record=none; handover.issue_raised_on_site=no |
| `ho_other_alone` | 한쪽이 집을 비운 뒤 다른 한쪽이 혼자 집을 확인했고, 함께 본 사람은 없었습니다. | handover.done=yes; handover.inspection=one_side_only; handover.record=unilateral |
| `ho_keys_only` | 열쇠만 중개인이나 관리사무소에 맡기고 나왔고, 집 상태를 함께 확인하지는 않았습니다. | handover.done=yes; handover.inspection=none; handover.keys_via=broker_or_management |
| `ho_not_handed` | 아직 열쇠나 집을 넘겨주지 않았거나, 넘겨준 날짜를 두고 다툼이 있습니다. | handover.done=no_or_disputed; timeline.handover_date=disputed |

### re02_exit_photos (신규)
- phase: 2 / kind: single / show_if: `PATH_A` / profile_field: `evidence.exit_photos`
- 추가 이유: 손상 주장 사건에서 퇴거 당일 사진·영상의 유무와 날짜 확인 가능성은 반박 가능성을 가르는 1순위 증거인데, v1에서는 다른 기록과 섞여 있었다.
- 질문: 집을 비울 때 집 상태를 찍은 사진이나 영상이 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `ph_dated_full` | 방마다 집 전체를 찍어 두었고, 찍은 날짜가 파일이나 메시지로 확인됩니다. | evidence.exit_photos=full; evidence.exit_photos_dated=yes |
| `ph_sent_to_other` | 사진이나 영상을 찍어, 집을 비운 날 상대방이나 중개인에게 메시지로 보내 두었습니다. | evidence.exit_photos=full; evidence.exit_photos_dated=yes; evidence.exit_photos_shared=yes |
| `ph_partial` | 일부 방이나 물건만 찍어 두었고, 상대방이 문제 삼는 부분은 찍혀 있지 않을 수 있습니다. | evidence.exit_photos=partial |
| `ph_other_side_only` | 제가 찍은 것은 없고, 상대방이 나중에 보낸 손상 사진만 가지고 있습니다. | evidence.exit_photos=none; evidence.counterparty_photos=yes |
| `ph_none` | 집을 비울 때 찍은 사진이나 영상은 남아 있지 않습니다. | evidence.exit_photos=none |

### re02_claimed_damage (신규)
- phase: 2 / kind: multi / show_if: `PATH_A OR (PATH_E AND re02_extra_claim_detail = xc_damage_over_deposit)` / profile_field: `damage.claimed_items`
- 추가 이유: 어떤 손상인지(벽·가전·누수·분실)에 따라 통상 사용 흔적인지, 건물 설비 책임인지, 교체 비용 문제인지가 달라져 전문가가 가장 먼저 묻는 사실이다.
- 질문: 상대방이 문제 삼는 손상은 무엇인가요? (여러 개 선택 가능)

| value | 선택지 | meaning |
|---|---|---|
| `dg_wall_floor` | 벽의 얼룩·못 자국·페인트 벗겨짐이나 바닥 긁힘 | damage.claimed_items+=wall_floor |
| `dg_furniture_appliance` | 집에 딸린 가구나 에어컨·냉장고·세탁기 등 가전의 고장이나 파손 | damage.claimed_items+=furniture_appliance |
| `dg_water_mold` | 누수·곰팡이·배관 막힘 등 물과 관련된 문제 | damage.claimed_items+=water_mold |
| `dg_missing_items` | 계약 때 있던 비품·열쇠·출입카드·리모컨 등이 없어졌다는 주장 | damage.claimed_items+=missing_items |
| `dg_not_specified` | 손상이 있다고만 하고, 어떤 부분인지는 구체적으로 알려 주지 않았습니다 | damage.claimed_items+=not_specified; claim.itemized=no |

### re02_damage_cause (신규)
- phase: 2 / kind: single / show_if: `PATH_A` / profile_field: `damage.cause`, `damage.fault_admitted`
- 추가 이유: 경로 A의 "실제와 비교" 질문. 일반 비교(re02_situation_match) 대신 통상 사용 흔적·일부 과실·입주 전 손상·건물 설비 문제로 나눠야 공제 타당성을 판단할 수 있다.
- 질문: 상대방이 문제 삼는 손상은 실제로 어떻게 생긴 것이라고 보시나요?

| value | 선택지 | meaning |
|---|---|---|
| `dc_normal_wear` | 오래 살면서 자연스럽게 생긴 사용 흔적이고, 제가 부주의해서 생긴 손상은 아니라고 생각합니다. | damage.cause=normal_wear; damage.fault_admitted=no |
| `dc_my_fault_partial` | 일부는 제 부주의로 생긴 것이 맞지만, 상대방이 말하는 범위나 정도는 실제보다 큽니다. | damage.cause=partly_self; damage.fault_admitted=partial |
| `dc_preexisting` | 입주할 때부터 있던 손상이고, 제가 사는 동안 생긴 것이 아닙니다. | damage.cause=preexisting; damage.fault_admitted=no |
| `dc_building_issue` | 건물 배관·방수·전기 설비 문제로 생긴 것이고, 사는 동안 상대방에게 알린 적이 있습니다. | damage.cause=building_defect; damage.reported_during_tenancy=yes |
| `dc_cannot_tell` | 어떤 손상인지 직접 보지 못해서, 언제 어떻게 생긴 것인지 판단할 수 없습니다. | damage.cause=unknown |

### re02_movein_condition (신규)
- phase: 2 / kind: single / show_if: `PATH_A` / profile_field: `evidence.movein_record`
- 추가 이유: 퇴거 상태와 비교할 기준점(입주 당시 상태)이 있어야 손상이 사는 동안 생긴 것인지 판단할 수 있다. v1의 `ho_move_in_only`를 독립 질문으로 확장했다.
- 질문: 입주할 때의 집 상태는 어떻게 기록되어 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `mi_signed_checklist` | 입주할 때 양쪽이 함께 점검표나 인수인계서를 작성해 서명했고, 사진도 첨부되어 있습니다. | evidence.movein_record=signed_checklist_with_photos |
| `mi_photos_only` | 서명한 문서는 없지만, 입주한 날 제가 찍은 사진이나 영상이 남아 있습니다. | evidence.movein_record=own_photos |
| `mi_inventory_list` | 계약서에 가구·가전 목록만 붙어 있고, 각 물건의 상태는 적혀 있지 않습니다. | evidence.movein_record=inventory_without_condition |
| `mi_reported_later` | 입주 직후 발견한 문제를 메시지로 상대방에게 알렸고, 그 기록이 남아 있습니다. | evidence.movein_record=defect_report_message; action.reported_defect=yes |
| `mi_none` | 입주할 때 집 상태를 기록한 자료는 따로 없습니다. | evidence.movein_record=none |

### re02_repair_cost_basis (신규)
- phase: 2 / kind: single / show_if: `PATH_A OR (PATH_C AND re02_deduction_items = ded_repair_restore|ded_cleaning_paint) OR (PATH_E AND re02_extra_claim_detail = xc_damage_over_deposit)` / profile_field: `claim.repair_basis`, `claim.itemized`
- 추가 이유: 손상 자체를 인정하더라도 금액이 견적·영수증 기반인지, 새것 교체 비용인지, 확인 없이 이미 수리했는지에 따라 다툴 범위가 달라진다.
- 질문: 수리비(원래 상태로 되돌리는 비용)는 어떤 근거로 계산되었나요?

| value | 선택지 | meaning |
|---|---|---|
| `rc_quote_receipt` | 수리업체의 견적서나 실제 수리 영수증이 있고, 항목별 금액을 확인할 수 있습니다. | claim.repair_basis=quote_or_receipt; claim.itemized=yes |
| `rc_lump_sum` | 견적서나 영수증 없이, 전체 수리비 금액만 메시지나 말로 전달되었습니다. | claim.repair_basis=lump_sum; claim.itemized=no |
| `rc_replace_new` | 고치는 비용이 아니라, 오래된 물건을 새것으로 바꾸는 비용 전체가 계산되었습니다. | claim.repair_basis=replacement_new |
| `rc_repaired_unilateral` | 한쪽이 다른 쪽에 미리 알리거나 확인받지 않고 이미 수리를 마친 뒤, 그 비용을 청구했습니다. | claim.repair_basis=repaired_without_notice; evidence.pre_repair_state=lost |
| `rc_not_fixed_yet` | 아직 수리 금액이 정해지지 않았고, "수리해 보고 정산하겠다"는 말만 있었습니다. | claim.repair_basis=pending_estimate; amount.state=open |

---

## F. 1차 → 2차 adaptive branching

### 경로 조건 정의 (show_if 매크로)
| 이름 | 정의식 |
|---|---|
| `PATH_B` | `re02_role = role_buyer|role_seller OR re02_dispute_type = dt_deposit_forfeited OR re02_dispute_type_holder = hd_forfeit_dispute|hd_double_demand` |
| `PATH_B_PAYER` | `PATH_B AND re02_role = role_tenant|role_company_occupant|role_buyer` |
| `PATH_B_HOLDER` | `PATH_B AND re02_role = role_landlord|role_seller` |
| `PATH_C` | `NOT PATH_B AND (re02_dispute_type = dt_partial_deduction OR re02_dispute_type_holder = hd_deduct_dispute)` |
| `PATH_E` | `NOT PATH_B AND (re02_dispute_type = dt_extra_claim OR re02_dispute_type_holder = hd_extra_claim)` |
| `GATE_RENTAL_UNRETURNED` | `re02_role = role_tenant|role_company_occupant AND re02_dispute_type = dt_not_returned|dt_contact_avoided` |
| `PATH_A` | `GATE_RENTAL_UNRETURNED AND re02_other_reason = or_damage_claim` |
| `PATH_D1` | `GATE_RENTAL_UNRETURNED AND re02_other_reason ≠ or_damage_claim` |
| `PATH_D2` | `re02_dispute_type_holder = hd_contact_lost` |

- 우선순위: B > C > E > (A·D1) / D2. 정의식이 서로 겹치지 않도록 B를 먼저 제외했다(예: 매수인이 `dt_partial_deduction`을 골라도 B).
- 경로 A와 D1은 1차 조합이 같고, 2차 첫 질문 re02_other_reason의 답으로 갈라진다(조건부 분기 2단).

### 분기 표

| 1차 답 조합 | 2차 경로(세부 사건) | 이어지는 질문 id 순서 ( [ ]=조건부 ) | 선택형 문항 수 |
|---|---|---|---|
| `role_tenant|role_company_occupant` + `dt_not_returned|dt_contact_avoided` → 2차 첫 답 `or_damage_claim` | **A. 계약 종료 → 보증금 미반환 → 손상 주장** | re02_other_reason → re02_handover_record → re02_exit_photos → re02_claimed_damage → re02_damage_cause → re02_movein_condition → re02_repair_cost_basis → re02_amount_detail(입력) → re02_key_dates(입력) → re02_money_evidence → [re02_contract_form 또는 re02_cash_proof] → [re02_payment_path: 회사 명의일 때] → re02_demand_method → [re02_other_reaction] → re02_deadline → [re02_deadline_date(입력)] → re02_final_goal | 11~13 (회사 명의 계약이면 최대 14) |
| `role_buyer|role_seller`(분쟁 유형 무관) 또는 `dt_deposit_forfeited` 또는 `hd_forfeit_dispute|hd_double_demand` | **B. 계약금 지급 → 계약 취소 → 반환 거부** (돈을 받은 쪽이면: 반환·두 배 반환 요구에 대응) | re02_cancel_reason → re02_cancel_form → re02_forfeit_clause → [re02_condition_met] → re02_refusal_reason(낸 쪽) 또는 re02_return_demand_basis(받은 쪽) → re02_amount_detail(입력) → re02_key_dates(입력) → re02_money_evidence → [re02_contract_form 또는 re02_cash_proof] → re02_payment_path → [re02_broker_hold] → re02_demand_method → [re02_other_reaction] → re02_deadline → [re02_deadline_date(입력)] → re02_final_goal | 10~13 |
| `dt_partial_deduction` 또는 `hd_deduct_dispute` (B 아님) | **C. 일부 반환 → 공제 다툼** (공제 항목: 수리비 / 관리비·공과금 / 미납 임대료 / 위약금) | re02_amount_state → [re02_amount_detail(입력)] → re02_deduction_items → [수리비·청소: re02_repair_cost_basis → re02_handover_record] → [관리비: re02_mgmt_fee_basis] → [미납 임대료: re02_unpaid_rent_period] → [위약금: re02_penalty_clause] → re02_key_dates(입력) → re02_money_evidence → [re02_contract_form 또는 re02_cash_proof] → [re02_payment_path: 회사 명의일 때] → re02_demand_method → [re02_other_reaction] → re02_deadline → [re02_deadline_date(입력)] → re02_final_goal | 9~13 (공제 항목 1~2개 선택 시 9~11) |
| `role_tenant|role_company_occupant` + `dt_not_returned|dt_contact_avoided` → 2차 첫 답 `or_damage_claim` 외 | **D1. 보증금 미반환 → 손상 외 사유(조항·위반 주장·자금 사정·이유 없음)·연락 회피** | re02_other_reason → re02_amount_state → [re02_amount_detail(입력)] → re02_key_dates(입력) → re02_money_evidence → [re02_contract_form 또는 re02_cash_proof] → re02_payment_path → [re02_broker_hold] → re02_demand_method → [re02_other_reaction] → re02_situation_match → re02_deadline → [re02_deadline_date(입력)] → re02_blockage → re02_final_goal | 10~13 |
| `hd_contact_lost` | **D2. (집주인) 세입자가 밀린 금액을 남기고 이탈** | re02_amount_state → [re02_amount_detail(입력)] → re02_deduction_items → re02_handover_record → re02_key_dates(입력) → re02_money_evidence → [re02_contract_form 또는 re02_cash_proof] → re02_demand_method → [re02_other_reaction] → re02_deadline → [re02_deadline_date(입력)] → re02_blockage → re02_final_goal | 9~11 |
| `dt_extra_claim` 또는 `hd_extra_claim` (B 아님) | **E. 보증금을 넘는 추가 금액 청구** | re02_extra_claim_detail → [손해 초과: re02_handover_record → re02_claimed_damage → re02_repair_cost_basis] → [위약금·잔여 임대료: re02_penalty_clause] → [밀린 기간: re02_unpaid_rent_period] → re02_amount_state → [re02_amount_detail(입력)] → re02_key_dates(입력) → re02_money_evidence → [re02_contract_form 또는 re02_cash_proof] → re02_payment_path → [re02_broker_hold] → re02_demand_method → [re02_other_reaction] → re02_situation_match → re02_deadline → [re02_deadline_date(입력)] → re02_blockage → re02_final_goal | 10~13 (중개인 경유+손해 초과가 겹치면 최대 15, 이 경우 re02_broker_hold를 생략 가능) |

---

## G. 경로 B 노드 — 계약금 지급 → 계약 취소 → 반환 거부

조사 순서: 취소 직접 이유 → 취소 확인 방식 → 계약서 취소(계약금) 조건 → [조건 발생 증명] → 상대방의 거부 이유(받은 쪽이면 상대방의 반환 요구 근거) → 지급 기록.

### re02_cancel_reason (신규)
- phase: 2 / kind: single / show_if: `PATH_B` / profile_field: `cancel.reason`, `cancel.initiator`
- 추가 이유: 계약금 몰수·두 배 반환은 "누가, 왜 계약을 진행하지 못했는가"로 갈리는데 v1에는 취소 원인을 묻는 질문이 없었다.
- 질문: 계약이 진행되지 못하게 된 직접적인 이유는 무엇인가요?

| value | 선택지 | meaning |
|---|---|---|
| `cr_self_plan_change` | 제 쪽 일정이나 계획이 바뀌어(발령·출국·마음이 바뀜 등), 제가 계약을 진행하지 않기로 했습니다. | cancel.initiator=self; cancel.reason=plan_change |
| `cr_funding_fail` | 대출이 승인되지 않았거나 해외 송금이 늦어져, 정해진 날까지 잔금(다음 지급금)을 마련하지 못했습니다. | cancel.initiator=payer; cancel.reason=funding_failure |
| `cr_document_issue` | 핑크북(토지사용권 증서)·실제 소유자·외국인 명의 가능 여부 등 서류나 권리에 문제가 드러났습니다. | cancel.reason=title_or_document_issue; risk.title_issue=yes |
| `cr_other_terms_change` | 상대방이 가격을 올리거나 조건을 바꾸자고 했거나, 다른 사람과 계약하려 했습니다. | cancel.initiator=counterparty; cancel.reason=terms_change |
| `cr_other_missed_date` | 상대방이 본계약 체결이나 집 인도 날짜를 지키지 않아, 계약이 더 이상 진행되지 않았습니다. | cancel.initiator=counterparty; cancel.reason=missed_date |

### re02_cancel_form (신규)
- phase: 2 / kind: single / show_if: `PATH_B` / profile_field: `cancel.confirmation`
- 추가 이유: 취소가 합의로 확인되었는지, 한쪽 통보인지, 진행만 멈췄는지에 따라 "계약을 깬 쪽"이 누구인지 다툼의 범위가 달라진다.
- 질문: 계약을 취소한다는 사실은 어떻게 확인되었나요?

| value | 선택지 | meaning |
|---|---|---|
| `cn_mutual_written` | 양쪽이 계약을 취소하기로 메시지나 합의서 등 글로 확인했습니다. | cancel.confirmation=mutual_written |
| `cn_one_side_written` | 한쪽이 취소하겠다고 글로 알렸고, 다른 쪽은 아직 동의하지 않았습니다. | cancel.confirmation=unilateral_written |
| `cn_verbal_only` | 만나거나 전화로 취소 이야기를 했고, 글로 남긴 기록은 없습니다. | cancel.confirmation=verbal_only |
| `cn_via_broker` | 취소 이야기는 중개인을 통해서만 오갔고, 상대방에게 직접 들은 적은 없습니다. | cancel.confirmation=via_broker; payment.via_hint=broker |
| `cn_just_stopped` | 누구도 취소한다고 분명히 말하지 않았고, 진행만 멈춰 있는 상태입니다. | cancel.confirmation=not_declared; contract.status=stalled |

### re02_forfeit_clause (계약서 취소 조건)
- phase: 2 / kind: single / show_if: `PATH_B` / profile_field: `contract.deposit_clause`
- 변경 이유: show_if를 경로 B 전체(매수인·매도인 포함)로 넓혔다. v1은 `dt_deposit_forfeited` 등 일부 유형에서만 보여, 매수인이 `dt_not_returned`를 고르면 계약금 조항을 묻지 않았다.
- 질문: 계약서에는 계약금(đặt cọc)을 어떻게 처리한다고 적혀 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `fc_both_sides` | 계약금을 낸 쪽이 계약을 깨면 계약금을 잃고, 받은 쪽이 깨면 두 배로 돌려준다고 양쪽 모두 적혀 있습니다. | contract.deposit_clause=bilateral_forfeit_double |
| `fc_one_side` | 한쪽이 계약을 깰 때의 처리만 적혀 있고, 반대의 경우는 적혀 있지 않습니다. | contract.deposit_clause=one_sided |
| `fc_condition_clause` | 대출이 나오지 않거나 토지사용권 증서(핑크북) 등 서류에 문제가 있으면 계약금을 돌려준다는 조건이 적혀 있습니다. | contract.deposit_clause=refund_condition |
| `fc_no_clause` | 계약서는 있지만, 계약금을 어떻게 처리하는지에 대한 조항은 따로 없습니다. | contract.deposit_clause=absent |
| `fc_cannot_read` | 계약서가 베트남어로만 되어 있어, 그런 조항이 있는지 확인하지 못했습니다. | contract.deposit_clause=unknown; contract.language_understood=no |

### re02_condition_met (신규)
- phase: 2 / kind: single / show_if: `re02_forfeit_clause = fc_condition_clause` / profile_field: `cancel.condition_proof`
- 추가 이유: 반환 조건 조항이 있어도, 그 조건이 실제로 생겼다는 자료가 있는지가 결과를 가른다.
- 질문: 계약서에 적힌 반환 조건이 실제로 생겼다는 것을 보여 줄 자료가 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `cm_written_proof` | 은행의 대출 거절 문서나 서류 문제를 확인한 자료 등, 조건이 생긴 사실을 글로 보여 줄 수 있습니다. | cancel.condition_proof=documented |
| `cm_message_only` | 조건이 생겼다는 것은 상대방과 메시지로 이야기했지만, 은행이나 기관에서 받은 문서는 없습니다. | cancel.condition_proof=message_only |
| `cm_disputed` | 조건이 생긴 것은 맞지만, 상대방은 기한을 넘겼거나 조건에 해당하지 않는다고 주장합니다. | cancel.condition_proof=disputed_by_counterparty |
| `cm_no_proof` | 조건이 생겼다고 생각하지만, 이를 보여 줄 자료는 아직 없습니다. | cancel.condition_proof=none |

### re02_refusal_reason (신규, 돈을 낸 쪽)
- phase: 2 / kind: single / show_if: `PATH_B_PAYER` / profile_field: `counterparty.refusal_reason`
- 추가 이유: 임대용 re02_other_reason의 선택지(손상·다음 세입자 등)는 계약금 사건과 맞지 않아, 계약금 반환 거부 이유를 따로 받는다.
- 질문: 상대방은 계약금을 돌려주지 않는 이유를 어떻게 설명하나요?

| value | 선택지 | meaning |
|---|---|---|
| `rr_cites_clause` | 계약서의 계약금 조항을 들어, 제 쪽이 계약을 깼으니 돌려줄 필요가 없다고 합니다. | counterparty.refusal_reason=clause_forfeit; counterparty.clause_cited=yes |
| `rr_blames_me` | 계약이 깨진 책임이 제 쪽에 있다며, 제가 말한 취소 이유를 인정하지 않습니다. | counterparty.refusal_reason=disputes_cancel_cause |
| `rr_loss_claim` | 그동안 다른 사람과 계약할 기회를 놓쳤다며, 손해를 이유로 들고 있습니다. | counterparty.refusal_reason=opportunity_loss |
| `rr_return_later` | 돌려줄 돈인 것은 인정하지만, 지금은 돈이 없거나 다음 계약자를 찾은 뒤 주겠다고 합니다. | counterparty.refusal_reason=liquidity; counterparty.liability_admitted=yes |
| `rr_no_explanation` | 이유를 설명하지 않거나, 반환 이야기를 꺼내면 답을 하지 않습니다. | counterparty.refusal_reason=none_given; counterparty.contact=avoiding |

### re02_return_demand_basis (신규, 돈을 받은 쪽)
- phase: 2 / kind: single / show_if: `PATH_B_HOLDER` / profile_field: `counterparty.demand_basis`
- 추가 이유: 매도인·집주인이 계약금을 받은 쪽일 때는 "상대방이 무엇을 근거로 반환·두 배 반환을 요구하는가"가 거부 이유에 해당하는 사실이다.
- 질문: 상대방은 무엇을 근거로 계약금 반환(또는 두 배 반환)을 요구하나요?

| value | 선택지 | meaning |
|---|---|---|
| `rd_my_side_broke` | 계약금을 받은 제 쪽이 먼저 계약을 깼다며, 계약서 조항대로 돌려달라고 합니다. | counterparty.demand_basis=holder_breach_alleged |
| `rd_condition_met` | 대출이나 서류 문제 등, 계약서에 적힌 반환 조건에 해당한다고 주장합니다. | counterparty.demand_basis=refund_condition |
| `rd_no_main_contract` | 본계약을 아직 맺지 않았으니, 계약금은 당연히 돌려받아야 한다고 주장합니다. | counterparty.demand_basis=no_main_contract |
| `rd_undisclosed_issue` | 집이나 서류의 문제를 제가 미리 알리지 않았다고 주장합니다. | counterparty.demand_basis=nondisclosure_alleged; risk.title_issue=possible |
| `rd_no_basis` | 구체적인 근거 없이 돌려달라는 요구만 하고 있습니다. | counterparty.demand_basis=none_given |

(지급 기록 단계: D절 re02_money_evidence → re02_contract_form / re02_cash_proof → re02_payment_path → re02_broker_hold를 이어서 사용)

---

## H. 경로 C 노드 — 일부 반환 → 공제 다툼

조사 순서: 남은 금액 → 공제 항목(수리비 / 관리비·공과금 / 미납 임대료 / 위약금) → 항목별 계산 근거.

### re02_deduction_items
- phase: 2 / kind: multi / show_if: `PATH_C OR PATH_D2` / profile_field: `deduction.items`
- 변경 이유: v1의 `ded_unpaid_charges`(임대료·관리비·공과금 묶음)는 미납 임대료와 관리비·공과금이 확인 자료(송금 내역 vs 고지서)와 후속 질문이 달라 `ded_unpaid_rent`와 `ded_mgmt_utility`로 나눴다. D2(세입자 이탈)에서도 밀린 항목을 받도록 show_if를 넓혔다.
- 질문: 공제되었거나 공제하려는 항목을 모두 선택해 주세요. (여러 개 선택 가능)

| value | 선택지 | meaning |
|---|---|---|
| `ded_repair_restore` | 벽·바닥·가구·가전 수리비나 원래 상태로 되돌리는 비용 | deduction.items+=repair_restore |
| `ded_cleaning_paint` | 청소비나 페인트 비용 | deduction.items+=cleaning_paint |
| `ded_mgmt_utility` | 밀린 관리비·전기·수도·인터넷 요금 | deduction.items+=management_utility |
| `ded_unpaid_rent` | 밀린 임대료 | deduction.items+=unpaid_rent |
| `ded_early_exit` | 계약 기간 전에 집을 비운 데 따른 위약금 | deduction.items+=early_exit_penalty |
| `ded_no_itemization` | 항목 설명 없이 금액만 공제된(공제한) 부분 | deduction.items+=unitemized; claim.itemized=no |

### 수리비·청소비 후속
- re02_repair_cost_basis → re02_handover_record (E절 노드를 그대로 사용, show_if에 `PATH_C AND re02_deduction_items = ded_repair_restore|ded_cleaning_paint` 포함)

### re02_mgmt_fee_basis (신규)
- phase: 2 / kind: single / show_if: `PATH_C AND re02_deduction_items = ded_mgmt_utility` / profile_field: `claim.mgmt_utility_basis`
- 추가 이유: 관리비·공과금 공제는 고지서와 거주 기간이 맞는지가 핵심인데, v1에는 이 항목의 근거를 묻는 질문이 없었다.
- 질문: 관리비·전기·수도·인터넷 요금 공제는 어떤 근거로 계산되었나요?

| value | 선택지 | meaning |
|---|---|---|
| `mf_bill_matched` | 관리사무소나 전기·수도 회사의 고지서를 보여 주었고, 실제로 살았던 기간과도 맞습니다. | claim.mgmt_utility_basis=bill_matches_period |
| `mf_period_overlap` | 고지서는 있지만, 이미 낸 달이나 집을 넘긴 뒤의 기간까지 포함되어 있습니다. | claim.mgmt_utility_basis=period_overlap |
| `mf_advance_estimate` | 마지막 달 요금이 아직 나오지 않아 대략 금액을 미리 공제했고, 나중에 정산하겠다고 했습니다. | claim.mgmt_utility_basis=estimate_pending_settlement |
| `mf_no_bill` | 고지서나 계산 내역 없이, 공제한 금액만 알려 주었습니다. | claim.mgmt_utility_basis=no_bill; claim.itemized=no |

### re02_unpaid_rent_period (신규)
- phase: 2 / kind: single / show_if: `(PATH_C AND re02_deduction_items = ded_unpaid_rent) OR (PATH_E AND re02_extra_claim_detail = xc_unpaid_period)` / profile_field: `claim.rent_period`
- 추가 이유: 밀린 임대료는 "몇 날까지 계산했는가"가 인도일·통지 기간과 맞물려 금액이 달라지므로, 기간 비교 질문이 필요하다.
- 질문: 밀린 임대료로 공제(청구)된 기간은 실제와 비교하면 어떤가요?

| value | 선택지 | meaning |
|---|---|---|
| `ur_matches_handover` | 집을 넘겨준 날까지 내지 못한 임대료이고, 그 기간과 금액은 서로 인정하고 있습니다. | claim.rent_period=matches_handover; claim.rent_admitted=yes |
| `ur_after_handover` | 열쇠를 넘겨준 날 이후의 기간까지 임대료로 계산되어 있습니다. | claim.rent_period=beyond_handover |
| `ur_notice_shortfall` | 계약 해지를 미리 알린 기간이 부족했다며, 모자란 기간만큼의 임대료가 계산되어 있습니다. | claim.rent_period=notice_shortfall; contract.notice_compliance=disputed |
| `ur_already_paid` | 이미 낸 달의 임대료가 밀린 것으로 계산되어 있고, 송금 내역으로 확인할 수 있습니다. | claim.rent_period=already_paid; evidence.rent_transfer=yes |

### re02_penalty_clause (신규)
- phase: 2 / kind: single / show_if: `(PATH_C AND re02_deduction_items = ded_early_exit) OR (PATH_E AND re02_extra_claim_detail = xc_fixed_penalty|xc_remaining_rent)` / profile_field: `penalty.clause`, `penalty.calc`
- 추가 이유: 위약금 공제는 조항 유무·계산 일치·조기 종료 원인 세 가지를 확인해야 하는데, v1의 공제 경로에는 위약금 조항을 묻는 질문이 없었다.
- 질문: 위약금으로 공제(청구)된 금액은 계약서와 비교하면 어떤가요?

| value | 선택지 | meaning |
|---|---|---|
| `pc_clause_matches` | 계약서에 중도 해지 위약금 조항이 있고, 계산한 금액도 그 조항과 맞습니다. | penalty.clause=present; penalty.calc=matches |
| `pc_clause_calc_differs` | 조항은 있지만, 몇 개월치인지나 계산 기준이 조항과 다르게 적용되었습니다. | penalty.clause=present; penalty.calc=differs |
| `pc_no_clause` | 계약서에서 위약금 조항을 찾지 못했는데, 위약금이 공제(청구)되었습니다. | penalty.clause=absent_or_not_found |
| `pc_cause_disputed` | 계약이 일찍 끝난 원인이 누구에게 있는지(집 매각·수리 지연·조기 퇴거 등)를 두고 서로 주장이 다릅니다. | penalty.trigger=disputed |
| `pc_cannot_read` | 계약서가 베트남어로만 되어 있어, 위약금 조항이 있는지 확인하지 못했습니다. | penalty.clause=unknown; contract.language_understood=no |

### re02_extra_claim_detail (경로 E 진입 질문, 기존 유지)
- phase: 2 / kind: single / show_if: `PATH_E` / profile_field: `claim.extra_basis`
- 변경 이유: show_if를 PATH_E로 정리(매수인·매도인은 B로 보냄). 선택지에 따라 손해·위약금·밀린 기간 후속 질문으로 갈라지게 했다.
- 질문: 다툼이 되는 추가 금액은 어떤 명목인가요?

| value | 선택지 | meaning |
|---|---|---|
| `xc_fixed_penalty` | 계약서에 정한 위약금(예: 임대료 몇 개월치)이고, 해당 조항이 계약서에 적혀 있습니다. | claim.extra_basis=contract_penalty; penalty.clause=present |
| `xc_remaining_rent` | 남은 계약 기간의 임대료 전부이고, 계약서에 그렇게 정한 조항이 있는지는 확실하지 않습니다. | claim.extra_basis=remaining_term_rent; penalty.clause=uncertain |
| `xc_damage_over_deposit` | 수리비나 손해가 보증금보다 크다는 이유이고, 견적서나 영수증으로 금액을 맞춰 본 적은 없습니다. | claim.extra_basis=damage_exceeds_deposit; claim.itemized=no |
| `xc_unpaid_period` | 집을 비우기 전까지 밀린 임대료·관리비이고, 몇 달치인지는 서로 알고 있습니다. | claim.extra_basis=arrears; claim.rent_admitted=yes |
| `xc_unclear_basis` | 명목이나 계산 근거가 정리되지 않은 금액이고, 서로 설명이 엇갈리고 있습니다. | claim.extra_basis=unclear |

---

## I. Evidence structure

| 증거 항목 | 관련 value | 의미 | 증명하는 사실 | 결과 판정 영향 |
|---|---|---|---|---|
| 양쪽 서명 계약서 | `me_contract_transfer`, `cf_bilingual_signed`, `cf_notarized` | 계약 조건이 문서로 확정됨 | 보증금·계약금 금액, 반환 기한, 공제·위약금·계약금 조항 | 조항 확인이 가능해 판정이 낮아짐(확인 필요 이하) |
| 베트남어 단독·중개인 양식 계약서 | `cf_vn_only`, `cf_broker_form`, `fc_cannot_read`, `pc_cannot_read` | 문서는 있으나 내용 이해·조항 범위가 불확실 | 계약 존재는 증명, 조항 내용은 미확인 | 확인 필요(번역 확인 선행) |
| 서명 의심 계약서 | `cf_signer_doubt` | 서명 누락 또는 소유자가 아닌 서명자 | 계약 상대방이 누구인지 자체가 불확실 | 전문가 권장, 소유자 확인 불가 시 특수 사건 |
| 은행 송금 내역 | `me_contract_transfer`, `me_transfer_only`, `ur_already_paid` | 지급 사실과 금액·날짜가 은행 기록으로 남음 | 돈을 보낸 사실, 받은 계좌 명의, 임대료 지급 여부 | 지급 다툼 위험을 낮춤 |
| 현금 수령 인정 메시지·서명 영수증 | `me_cash_message`, `cp_admit_message`, `cp_handwritten_signed` | 현금 지급을 상대방이 인정한 기록 | 상대방이 돈을 받은 사실 | 주의(원본 보관 필수) |
| 증인·인출 기록만 있음 | `cp_witness_broker`, `cp_withdrawal_only` | 간접 자료뿐 | 돈을 마련한 사실 또는 제3자 진술 | 주의 |
| 지급 자료 없음 | `me_none`, `cp_nothing` | 지급 사실을 보여 줄 자료가 없음 | 없음 | 전문가 권장 |
| 중개인 전달 증빙 | `bh_delivered_proof` / `bh_delivered_word` | 중개인이 상대방에게 넘긴 기록 유무 | 돈이 실제로 상대방에게 갔는지 | 기록 없으면 주의, 중개인 보관·연락 두절이면 전문가 권장 |
| 반환 시 서명 점검표 | `ho_joint_signed` | 인도 당시 상태에 양쪽이 동의 | 인도일, 인도 당시 손상 유무 | 손상 주장 다툼 위험을 크게 낮춤 |
| 함께 확인했으나 문서 없음 | `ho_joint_no_paper` | 현장에서 문제 지적이 없었다는 사실만 있음 | 인도 당시 이의가 없었다는 정황 | 확인 필요 |
| 한쪽 단독 확인·열쇠만 반납 | `ho_other_alone`, `ho_keys_only` | 인도 당시 상태를 함께 본 기록 없음 | 인도 사실만 | 주의 |
| 퇴거 사진·영상 | `ph_dated_full`, `ph_sent_to_other`, `ph_partial` | 퇴거 당시 상태 기록 | 퇴거 시점 집 상태(상대방에게 보냈다면 그 시점도 확정) | 전체·전송 기록이면 판정이 낮아짐, 일부면 확인 필요 |
| 상대방 사진만 있음 / 사진 없음 | `ph_other_side_only`, `ph_none` | 고객 측 퇴거 기록 없음 | 없음(상대방 자료에 의존) | 주의, 입주 기록도 없으면 상향 |
| 입주 점검표·입주 사진·입주 직후 하자 알림 | `mi_signed_checklist`, `mi_photos_only`, `mi_reported_later` | 입주 당시 상태 기준점 | 손상이 입주 전부터 있었는지 | 기존 손상 주장(`dc_preexisting`)을 뒷받침 |
| 비품 목록만 / 입주 기록 없음 | `mi_inventory_list`, `mi_none` | 물건 목록은 있으나 상태 기록 없음 / 기준점 없음 | 물건의 존재만 / 없음 | 주의 |
| 수리 견적서·영수증 | `rc_quote_receipt` | 항목별 금액 근거 | 수리비 금액의 실제성 | 금액 다툼 위험을 낮춤 |
| 금액만 통보·새것 교체·사전 확인 없는 수리 | `rc_lump_sum`, `rc_replace_new`, `rc_repaired_unilateral` | 금액 근거 부족 또는 손상 전 상태가 사라짐 | 없음 또는 일부 | 확인 필요~주의 |
| 관리비·공과금 고지서 | `mf_bill_matched`, `mf_period_overlap`, `mf_no_bill` | 공제 기간·금액의 근거 | 실제 거주 기간 요금인지 | 기간 겹침·고지서 없음이면 확인 필요 |
| 취소 합의 메시지·합의서 | `cn_mutual_written`, `cn_one_side_written` | 취소 경위가 글로 남음 | 누가, 언제 취소했는지 | 판정이 낮아짐 / 한쪽 통보면 확인 필요 |
| 말로만 취소·진행 중단 | `cn_verbal_only`, `cn_just_stopped`, `cn_via_broker` | 취소 경위 기록 없음 | 없음 | 주의 |
| 반환 조건 발생 자료 | `cm_written_proof`, `cm_message_only`, `cm_no_proof` | 대출 거절·서류 문제 등 조건 발생 기록 | 계약서상 반환 조건이 생긴 사실 | 문서 있으면 판정이 낮아짐, 없으면 주의 |
| 글로 남긴 요구 기록 | `dm_written_message`, `dm_formal_letter` | 요구한 사실·날짜·내용 | 고객이 요구한 시점과 내용 | 연락 회피 사건에서 대응 기반 |

---

## J. Timeline structure

| 순서 | 이벤트 | Situation Profile 필드 | 채우는 질문 id |
|---|---|---|---|
| 1 | 계약 체결(임대차 계약 / 계약금 확인서) | timeline.contract_date, contract.form | re02_key_dates, re02_contract_form |
| 2 | 보증금·계약금 지급 | timeline.payment_date, payment.method | re02_key_dates, re02_amount_detail, re02_money_evidence |
| 3 | 입주(임대) / 본계약·잔금 예정일(매매) | timeline.move_in_date, timeline.main_contract_due | re02_key_dates, re02_movein_condition |
| 4 | 문제 발생(손상 발견 / 취소 사유 발생 / 공제 통보 / 추가 청구) | timeline.problem_date, cancel.reason, deduction.items | re02_key_dates, re02_cancel_reason, re02_claimed_damage, re02_deduction_items, re02_extra_claim_detail |
| 5 | 종료·취소 통보 | contract.end_type, contract.notice_compliance, cancel.confirmation | re02_contract_end, re02_cancel_form, re02_unpaid_rent_period(`ur_notice_shortfall`) |
| 6 | 집 인도·열쇠 반납 | timeline.handover_date, handover.done | re02_key_dates, re02_handover_record |
| 7 | 고객 대응(요구) | action.demand_method | re02_demand_method |
| 8 | 상대방 재응답 | counterparty.response | re02_other_reaction |
| 9 | 기한(계약상 반환 기한 / 약속일 / 상대방 최후 기한 / 고객 일정) | timeline.deadline_type, timeline.deadline_date | re02_deadline, re02_deadline_date |
| 10 | 현재 | risk.blockage, goal.final | re02_blockage, re02_final_goal |

- 날짜 계산 규칙(결과 화면용 확인 항목, 결과 단정 아님): 인도일(6) 기준으로 계약상 반환 기한(9)이 지났는지, 밀린 임대료 기간(4·5)이 인도일을 넘는지, 계약금 사건에서 본계약 예정일(3)보다 취소(5)가 먼저인지 확인한다.

---

## K. Party / Relationship structure

| 구분 | 값 | 처리 |
|---|---|---|
| 고객 입장 | `party.role` = tenant / occupant / landlord / buyer / seller | re02_role로 확정. `party.side`(payer=돈을 낸 쪽, holder=돈을 받은 쪽)를 함께 저장해 2차 질문 문구·경로(B_PAYER/B_HOLDER, C·E 홀더 문구)를 정한다. |
| 계약 상대방 | 집주인·세입자·매도인·매수인 | role의 반대편으로 자동 설정(`counterparty.role`). |
| 회사 명의 계약 | `contract.signer=company` (`role_company_occupant`) | 반환 요구 주체가 회사일 수 있어 re02_payment_path를 A·C에서도 표시. `pp_agent_my_side`가 함께 나오면 특수 사건(당사자 혼합). |
| 고객 쪽 대리인 | `payment.via=self_agent` (`pp_agent_my_side`) | 회사·가족·지인 명의 송금 → 누구 이름으로 요구할지 확인 항목으로 표시. |
| 상대방 쪽 대리인 | `payment.via=counterparty_agent` (`pp_agent_other_side`) | 실제 수령인 ≠ 계약 상대방 가능성 → 확인 필요. |
| 중개인 | `payment.via=broker` (`pp_via_broker`), `cancel.confirmation=via_broker` (`cn_via_broker`), `handover.keys_via` (`ho_keys_only`), `cf_broker_form` | 돈·취소 의사·열쇠가 중개인을 거친 경우 re02_broker_hold로 돈의 위치 확인. 중개인 보관·연락 두절은 전문가 권장, `bh_broker_unreachable`은 특수 사건. |
| 관리사무소 | `dm_broker_relay`, `ho_keys_only`, `mf_*` | 요구 전달 경로·열쇠 보관처·관리비 고지서 발행처로만 기록(계약 당사자로 보지 않음). |
| 서명자 정당성 | `contract.signer_valid=doubtful` (`cf_signer_doubt`) | 실제 소유자 확인이 선행 과제. `cr_document_issue`·`rd_undisclosed_issue`와 함께 나오면 전문가 권장, 소유자 확인 불가는 특수 사건. |
| 다수 당사자 | 공동 세입자·공동 매수인 (직접 입력으로 확인) | 특수 사건으로 표시. |

---

## L. Goal / Action / Response structure

### 고객 목표 값
| 단계 | 값 | 의미 |
|---|---|---|
| 1차 우선 확인 | `cg_entitlement` / `cg_amount_check` / `cg_forfeit_rule` / `cg_how_to_demand` / `cg_unsure` | 반환 권리 / 금액 계산 / 계약금 조항 / 요구 방법·시점 / 진행 순서 |
| 2차 최종 목표 | `fg_full_settlement` / `fg_fair_compromise` / `fg_formal_demand` / `fg_reject_claim` / `fg_expert` | 계약서 기준 정산 / 일부 인정 후 합의 / 정식 요구 문서 / 근거 갖춘 거절 / 전문가 위임 |

### 고객 행동 값
| 행동 | 값 |
|---|---|
| 요구 방법 | `dm_not_yet` / `dm_verbal_only` / `dm_written_message` / `dm_broker_relay` / `dm_formal_letter` |
| 계약 종료 방식 | `end_me_with_notice` / `end_me_short_notice` (고객이 먼저 종료) |
| 기록 확보 | `ph_dated_full` / `ph_sent_to_other` / `ph_partial` (퇴거 기록), `mi_reported_later` (입주 하자 알림), `dc_building_issue` (거주 중 설비 문제 알림) |
| 취소 의사 표시 | `cn_mutual_written` / `cn_one_side_written` / `cn_verbal_only` / `cn_via_broker` / `cn_just_stopped`, `cr_self_plan_change` (고객 쪽 사정) |

### 상대방 반응 값 (요구 후: re02_other_reaction)
| 반응 유형 | 값 | 비고 |
|---|---|---|
| 수락 | `rx_promised_date` | 날짜 있는 약속 → re02_deadline `dl_promised_date`와 연결 |
| 거부 | `rx_refused_blame` | 거부 이유는 경로별 질문(`or_*`, `rr_*`, `rd_*`)에서 확보 |
| 일부 수용 | `rx_partial_offer` | |
| 연락 회피 | `rx_ignored` | 1차 `dt_contact_avoided`·`hd_contact_lost`, B `rr_no_explanation`과 같은 신호 |
| 추가 요구 | `rx_counter_claim` | |
| 책임 전가 | `rx_refused_blame` (`counterparty.blame=shifted`) | 거부와 같은 선택지지만 meaning에 책임 전가를 따로 저장 |
| 새 조건 | `rx_new_condition` | 다음 세입자·매수인 확보, 합의서 서명 등 조건부 약속 |

### 요구 전 상대방 입장 값 (경로별)
- 임대 미반환(A·D1): `or_contract_clause` / `or_damage_claim` / `or_my_breach` / `or_no_money_now` / `or_no_reason`
- 계약금 낸 쪽(B): `rr_cites_clause` / `rr_blames_me` / `rr_loss_claim` / `rr_return_later` / `rr_no_explanation`
- 계약금 받은 쪽(B): `rd_my_side_broke` / `rd_condition_met` / `rd_no_main_contract` / `rd_undisclosed_issue` / `rd_no_basis`

---

## M. 결과 판정 데이터

### 위험 신호 표 (v1 유지 + 보완)

| 선택지 | 결과 화면 위험 문장 | 판정 | 상태 |
|---|---|---|---|
| `end_me_short_notice` | 계약서에 정한 사전 통지 기간을 지키지 못한 경우, 상대방이 공제나 위약금을 주장할 여지가 있어 계약서 조항부터 확인해야 합니다. | 주의 | 유지 |
| `end_not_ended` | 계약이 아직 끝나지 않은 상태라, 지금 돈을 요구하거나 거절하는 방식에 따라 계약 위반 문제로 번질 수 있습니다. | 주의 | 유지 |
| `dt_deposit_forfeited` / `hd_forfeit_dispute` | 계약금을 돌려주지 않는 것이 정당한지는 누가 먼저 계약을 지키지 않았는지와 계약금 조항에 따라 달라지므로, 사실관계를 먼저 정리해야 합니다. | 주의 | 유지 |
| `hd_double_demand` | 계약금을 받은 쪽이 계약을 진행하지 못한 경우 두 배 반환 주장이 나올 수 있어, 계약서 조항과 진행하지 못한 사정을 함께 검토해야 합니다. | 전문가 권장 | 유지 |
| `dt_extra_claim` / `hd_extra_claim` | 보증금을 넘는 추가 금액은 근거 조항과 금액 계산이 맞는지 확인하기 전에 지급하거나 요구하지 않는 것이 안전합니다. | 주의 | 유지 |
| `dt_contact_avoided` / `hd_contact_lost` / `rx_ignored` / `rr_no_explanation` | 상대방이 연락을 피하고 있어, 말로 하는 요구보다 기록이 남는 방법으로 요구한 사실을 남겨 두는 것이 중요합니다. | 주의 | 보완(`rr_no_explanation` 추가) |
| `ded_no_itemization` / `xc_unclear_basis` / `mf_no_bill` / `rc_lump_sum` | 공제나 추가 금액에 항목별 근거가 없어, 금액을 인정하기 전에 내역과 영수증을 먼저 요구해야 합니다. | 확인 필요 | 보완(`mf_no_bill`, `rc_lump_sum` 추가) |
| `fc_no_clause` / `fc_one_side` | 계약서에 계약금 처리 기준이 없거나 한쪽만 적혀 있어, 현지 관행만으로 결과를 예측하기 어렵습니다. | 주의 | 유지 |
| `fc_cannot_read` / `cf_vn_only` / `pc_cannot_read` | 베트남어 계약 내용을 정확히 이해하지 못한 상태라, 핵심 조항을 번역해 확인한 뒤 대응해야 합니다. | 확인 필요 | 보완(`pc_cannot_read` 추가) |
| `cf_signer_doubt` | 실제 소유자가 아닌 사람이 서명했거나 서명이 빠진 계약은 돈을 받은 사람이 누구인지부터 문제가 될 수 있습니다. | 전문가 권장 | 유지 |
| `me_none` / `cp_nothing` | 돈을 주고받은 사실을 확인할 자료가 없어, 상대방이 받은 사실 자체를 부인하면 대응이 어려워질 수 있습니다. | 전문가 권장 | 유지 |
| `me_cash_message` / `cp_withdrawal_only` | 현금으로 주고받은 돈은 상대방이 받았다고 인정한 기록이 핵심이므로, 남아 있는 메시지를 지우지 말고 보관해야 합니다. | 주의 | 유지 |
| `ho_other_alone` / `ho_keys_only` | 집을 넘길 때 양쪽이 함께 상태를 확인하지 않아, 그 뒤에 나온 손상 주장을 두고 서로 말이 엇갈릴 수 있습니다. | 주의 | 보완(v1 `ho_no_record`·`ho_move_in_only` 대체) |
| `ph_none` / `ph_other_side_only` | 집을 비울 때의 상태를 고객님 쪽에서 남긴 기록이 없어, 상대방이 보낸 사진만으로 손상 여부가 다퉈질 수 있습니다. | 주의 | 신규 |
| `ph_none` + `mi_none` | 입주할 때와 집을 비울 때 모두 상태 기록이 없어, 손상이 언제 생겼는지를 두고 서로 주장이 엇갈릴 가능성이 큽니다. | 전문가 권장 | 신규(조합) |
| `mi_inventory_list` | 가구·가전 목록은 있지만 상태가 적혀 있지 않아, 입주 당시에도 같은 상태였는지 다른 자료로 확인해야 합니다. | 확인 필요 | 신규 |
| `dg_not_specified` | 상대방이 어떤 손상인지 구체적으로 밝히지 않아, 손상 부위와 사진을 먼저 요구해야 합니다. | 확인 필요 | 신규 |
| `rc_replace_new` / `rc_repaired_unilateral` | 새것 교체 비용이거나 미리 확인하지 않고 이미 수리한 비용이라, 실제 손상 정도와 금액이 맞는지 따져 볼 필요가 있습니다. | 주의 | 신규 |
| `rc_not_fixed_yet` / `mf_advance_estimate` | 금액이 아직 확정되지 않은 상태라, 정산 기한과 최종 내역을 받기로 기록을 남겨 두는 것이 안전합니다. | 확인 필요 | 신규 |
| `mf_period_overlap` / `ur_after_handover` / `ur_already_paid` | 공제 기간이 실제 거주 기간이나 이미 낸 기간과 겹쳐 보여, 날짜별 송금 내역과 고지서를 맞춰 확인해야 합니다. | 확인 필요 | 신규 |
| `ur_notice_shortfall` | 사전 통지 기간이 부족했다는 이유로 임대료가 계산되어 있어, 계약서의 통지 조항과 실제로 알린 날짜를 함께 확인해야 합니다. | 주의 | 신규 |
| `pc_no_clause` / `pc_clause_calc_differs` / `pc_cause_disputed` | 위약금 조항이 없거나 계산·원인을 두고 다툼이 있어, 위약금을 인정하기 전에 조항과 계약이 일찍 끝난 경위를 먼저 확인해야 합니다. | 주의 | 신규 |
| `ho_not_handed` | 집을 넘겨준 날짜가 정리되지 않으면 반환 기한과 밀린 임대료 계산이 모두 달라질 수 있습니다. | 확인 필요 | 유지 |
| `pp_via_broker` + `bh_delivered_word` | 중개인이 상대방에게 돈을 전달했는지 기록으로 확인되지 않아, 돈이 실제로 어디에 있는지부터 확인해야 합니다. | 주의 | 유지 |
| `bh_still_holding` / `bh_broker_unreachable` | 중개인이 돈을 보관한 채 돌려주지 않거나 연락이 되지 않는 상황이라, 중개인과 상대방 중 누구에게 요구할지 정리가 필요합니다. | 전문가 권장 | 유지 |
| `pp_unclear` / `pp_agent_other_side` | 실제로 돈을 받은 사람이 계약 상대방 본인인지 확실하지 않아, 누구에게 반환을 요구할지부터 확인해야 합니다. | 확인 필요 | 유지 |
| `cr_document_issue` / `rd_undisclosed_issue` | 핑크북(토지사용권 증서)이나 소유자 등 권리 문제가 계약 취소와 얽혀 있어, 서류 상태를 먼저 확인한 뒤 계약금 문제를 판단해야 합니다. | 전문가 권장 | 신규 |
| `cn_verbal_only` / `cn_just_stopped` / `cn_via_broker` | 계약 취소가 누구의 뜻으로 언제 확정되었는지 기록이 없어, 계약을 깬 쪽이 누구인지를 두고 다툼이 커질 수 있습니다. | 주의 | 신규 |
| `cm_no_proof` / `cm_disputed` | 계약서의 반환 조건이 실제로 생겼다는 자료가 없거나 상대방이 다투고 있어, 조건 발생을 보여 줄 자료를 먼저 확보해야 합니다. | 주의 | 신규 |
| `rx_counter_claim` | 요구한 뒤 상대방이 오히려 돈을 더 요구하고 있어, 상대방 주장의 근거를 받아 본 뒤 대응 순서를 정해야 합니다. | 주의 | 유지 |
| `rx_refused_blame` / `rx_new_condition` | 상대방이 책임을 다른 사람에게 돌리거나 새 조건을 붙이고 있어, 반환 의무가 누구에게 있는지와 조건의 근거를 글로 확인받아야 합니다. | 확인 필요 | 신규 |
| `sm_mismatch` / `sm_hard_to_judge` / `dc_cannot_tell` | 상대방 주장과 실제 사정이 다르거나 비교할 기록이 부족해, 날짜별 사실관계를 먼저 정리해야 합니다. | 확인 필요 | 보완(`dc_cannot_tell` 추가) |
| `dl_other_demand` / `dl_my_schedule` | 기한이 가까운 상태라, 기한 전에 기록이 남는 방법으로 입장을 전달해 두는 것이 안전합니다. | 주의 | 유지 |

- 삭제된 신호: `ho_no_record` / `ho_move_in_only` (해당 value 삭제 → `ph_none`·`mi_none`·`ho_other_alone`·`ho_keys_only` 신호로 대체).

### 판정 단계
1. 단계: **확인 필요**(사실·자료를 더 확인하면 정리 가능) < **주의**(고객 대응 방식에 따라 결과가 달라질 수 있음) < **전문가 권장**(당사자·권리·증거 공백으로 전문가 검토가 필요).
2. 최종 판정 = 해당하는 위험 신호 중 가장 높은 단계. 위험 신호가 하나도 없으면 "확인 필요"로 표시하고, 결과 문장은 확인할 항목만 안내한다(결과 단정 금지).
3. 상향 규칙: "주의" 신호가 3개 이상이면 "전문가 권장"으로 올린다. 조합 신호(`ph_none` + `mi_none`, `pp_via_broker` + `bh_delivered_word`)는 표에 적힌 단계를 그대로 적용한다.
4. 경로별 핵심 신호 우선 노출: A = 사진·입주 기록·수리비 근거 신호, B = 취소 경위·계약금 조항·조건 증명 신호, C = 항목별 근거 신호, D1·D2 = 연락·지급 자료 신호, E = 추가 금액 근거 신호.

### 특수 사건 표시 (퍼널 유지, 결과에서 "VFBCAI 전문가팀 진행" 안내만 표시)
- 직접 입력 또는 선택 조합에서 아래가 확인되면 표시:
  - 이미 소송·중재·조정이 진행 중인 경우(직접 입력)
  - `cf_signer_doubt` + 소유자 확인 불가, 또는 `cr_document_issue` + `cf_signer_doubt`(사기 의심 등 형사 문제 가능성)
  - `bh_broker_unreachable`(중개인이 돈을 가지고 연락이 끊긴 경우)
  - 공동 세입자·공동 매수인 등 당사자가 여러 명이거나, 회사·개인 명의가 섞인 경우(`role_company_occupant` + `pp_agent_my_side`)
- 표시 문장: 이 사건은 일반적인 반환 요구 절차보다 확인할 당사자와 쟁점이 많아, VFBCAI 전문가팀이 사실관계를 직접 확인한 뒤 진행하는 것이 적합합니다.

### 1차 결과 "핵심 확인 결과" 3칸 문장 규칙 (v1 유지)
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
   - 보완: role_buyer|role_seller이면서 위 유형이 dt_not_returned 등일 때도 경로 B 문장("계약서의 계약금(đặt cọc) 조항과 계약이 진행되지 못한 경위를 날짜순으로 정리하세요.")을 쓴다.
   - 추가 구절: end_me_short_notice → "계약서의 사전 통지 조항도 함께 확인하세요." / end_not_ended → "계약이 아직 유지 중이므로 대응 방식은 신중히 정하세요."

### "지금 확인해 보세요" STEP 3개 (v1 유지 + 경로별 STEP 1 문장)
1. **STEP 1 — 계약서의 돈 관련 조항 확인**: 보증금 반환 기한, 공제 조건, 계약금(đặt cọc) 처리, 중도 해지 시 통지 기간이 적힌 조항을 찾아 표시해 두세요.
   - 경로 A: 입주 때와 집을 비울 때의 사진·점검표를 날짜순으로 나란히 놓고, 상대방이 문제 삼는 부분이 찍혀 있는지 확인하세요.
   - 경로 B: 계약금 조항과 함께, 계약이 취소된 이유와 취소 이야기가 오간 메시지를 날짜순으로 정리하세요.
   - 경로 C: 공제 항목마다 상대방에게 견적서·영수증·고지서를 요청하고, 실제 거주 기간과 맞는지 표시해 두세요.
2. **STEP 2 — 돈이 오간 기록 정리**: 송금 내역·영수증·받았다는 메시지를 날짜와 금액순으로 모으고, 중개인이나 대리인을 거쳤다면 실제로 누가 받았는지도 함께 적어 두세요.
3. **STEP 3 — 요구와 답변을 기록으로 남기기**: 지금까지 말로만 요구했다면 금액·근거·기한을 적어 글로 다시 보내고, 상대방의 답변은 캡처해 보관하세요.

---

## 노드 수 요약
- 1차: 5노드(공용 Q1 별도) — 노출 Q1 + 4문항(유지).
- 2차: 33노드 — 공통 15(텍스트 3 포함: amount_detail, key_dates, deadline_date), 경로 A 7(진입 질문 re02_other_reason 포함, D1과 공유), 경로 B 6, 경로 C·E 5(deduction_items, mgmt_fee_basis, unpaid_rent_period, penalty_clause, extra_claim_detail). v1 19노드 → 신규 14노드 추가, 삭제 노드 없음.
- 경로별 2차 선택형 문항: A 11~13 / B 10~13 / C 9~13 / D1 10~13 / D2 9~11 / E 10~13 (+ 텍스트 입력 2~3).


---

# RE03 계약 위반·해지·퇴거 통보 — REAL_ESTATE_CONTENT_PACK_MASTER v1

- 기준 입력: pack-RE03.md (Content Pack v1). 질문·선택지 문장과 value는 원칙적으로 유지하고, 바꾼 곳에는 `변경:` 한 줄을 남겼다.
- Q1(공용, 확정): "상대방에게서 계약 위반·해지·퇴거 통보를 받았습니다." → 이 CASE 진입
- 대상 계약: 주택 임대차 중심(세입자·집주인 양쪽 진입). 매매 계약금(đặt cọc) 분쟁은 다른 CASE에서 다룬다.
- 엔진 공용 선택지 "위에 내용이 없거나 설명이 필요합니다 → 직접 입력"은 자동으로 붙으므로 쓰지 않았다. 직접 입력 답은 해당 노드의 profile_field에 `*_text`로 저장한다.
- show_if 표기: "≠"는 해당 value가 아닐 때, "|"는 그 값들 중 하나일 때, "그리고"/"또는"은 조건 결합.
- meaning 표기: `key=value; key=value`. 같은 key는 CASE 전체에서 같은 뜻으로만 쓴다.
- value 접두사(질문 간 중복 없음): role_/dm_/rs_/cg_/rt_/rld_/ar_/ac_/cd_/ow_/et_/nf_/sd_/np_/cf_/md_/oc_/ol_/fc_/gp_/cr_/ds_/pc_/ev_/bk_/gl_

---

## B. 전문가 프로파일링 구조

전문가가 퇴거·해지 통보 첫 상담에서 머릿속으로 채우는 순서: "누가(당사자) → 무엇을 요구받았나(현재 단계) → 왜(사유=세부 사건) → 그 사유는 사실인가(실제 비교) → 통보는 계약서에 맞게 왔나(계약·통지) → 언제까지인가(시간축) → 지금 집과 돈은 어떤 상태인가(점유·보증금) → 고객은 무엇을 했고 상대방은 어떻게 나왔나(행동·반응) → 무엇으로 증명하나(증거) → 무엇이 가장 위험한가 → 어떻게 끝내고 싶은가".

| 사실 축 | 전문가가 확인하는 것 | Situation Profile 필드 | 채우는 질문 id |
|---|---|---|---|
| 목표(우선) | 이번 상담에서 먼저 풀어야 할 쟁점 | client.priority_goal | re03_confirm_goal |
| 시작점 | 어떤 통보로 사건이 시작됐나 | notice.demand_type | Q1, re03_demand_type |
| 현재 단계 | 시정 요구 단계인지, 해지 확정·퇴거 날짜 단계인지, 금액 청구 단계인지 | notice.demand_type, notice.vacate_deadline_type, occupancy.status | re03_demand_type, re03_move_out_deadline, re03_occupancy_tenant, re03_occupancy_landlord |
| 당사자 | 고객의 계약상 지위, 실제 통보자 | party.role, notice.sender | re03_my_role, re03_notice_sender |
| 관계 | 직접 계약/회사 명의/재임대/대리 관계, 중개인·관리사무소 개입 | party.role, party.contract_holder, notice.channel | re03_my_role, re03_notice_form, re03_notice_sender, re03_contract_form |
| 계약 | 서면·공증·언어, 통지 조항, 위약금·조기 해지 조항, 계약 종료일 | contract.form, contract.notice_clause, contract.penalty_match, contract.early_exit_clause, timeline.contract_end | re03_notice_period, re03_contract_form, re03_penalty_clause, re03_exit_terms_landlord, re03_key_dates |
| 지급 | 임대료·관리비 지급 상태, 미지급 원인, 보증금 상태 | payment.arrears_fact, payment.arrears_cause, payment.deposit_status | re03_arrears_fact, re03_arrears_cause, re03_deposit_status |
| 상대방 행동 | 통보 사유(세부 사건 결정), 상대방 사정 | notice.reason, counterparty.owner_side_reason | re03_reason_tenant, re03_reason_landlord, re03_owner_reason_fact |
| 고객 행동 | 통보 후 대응, 문제 행동의 현재 상태 | client.action, conduct.fact | re03_response_status, re03_conduct_fact |
| 증거 | 보관 자료 종류, 반박 자료 유무 | evidence.items, facts.gap_type | re03_evidence, re03_fact_gap |
| 시간축 | 통보일·기한·계약 종료일·퇴거일 | timeline.notice_date, timeline.deadline_date, timeline.contract_end | re03_key_dates, re03_move_out_deadline |
| 상대방 반응 | 고객 대응 뒤 수락·거부·새 조건·책임 전가·법적 절차 언급 | counterparty.response | re03_counter_reaction |
| 위험 | 출입 차단·짐 반출 위협·법적 절차·은행 담보·다수 당사자·짧은 통지 | risk.* (M 섹션에서 파생) | re03_occupancy_tenant, re03_counter_reaction, re03_owner_reason_fact, re03_my_role, re03_notice_period |
| 실제 비교 | 상대방 주장과 실제의 차이 | facts.match, facts.gap_type, facts.gap_text | re03_fact_compare, re03_fact_gap, re03_fact_gap_text, re03_arrears_fact, re03_conduct_fact |
| 막힌 이유 | 진행을 멈추게 하는 가장 큰 요인 | process.blockage | re03_blockage |
| 최종 목표 | 계속 거주/정산 후 퇴거/무위약 종료/집 회수/위약금 청구 | client.final_goal | re03_final_goal |

---

## C. 1차 노드 표 (Q1 + CASE 질문 4개)

### re03_my_role
- phase: 1 / kind: single / show_if: 항상
- profile_field: party.role
- 질문: 이 계약에서 고객님은 어떤 위치에 계신가요?
- 선택지:
  - `r3_role_tenant` — 제 이름으로 집을 빌려 살고 있고, 계약서에도 제가 임차인으로 적혀 있습니다.
    - meaning: party.role=tenant; party.contract_holder=self; party.side=tenant
  - `r3_role_company_staff` — 회사 명의로 계약된 집에 살고 있고, 계약 당사자는 제가 아닌 회사입니다.
    - meaning: party.role=occupant_company_lease; party.contract_holder=company; party.side=tenant
  - `r3_role_subtenant` — 원래 세입자에게서 다시 빌려 살고 있고, 집주인과 직접 맺은 계약은 없습니다.
    - meaning: party.role=subtenant; party.contract_holder=original_tenant; party.side=tenant; party.multi=true
  - `r3_role_landlord` — 제 소유의 집(또는 제가 관리를 맡은 가족 소유의 집)을 빌려주었고, 세입자에게서 통보를 받았습니다.
    - meaning: party.role=landlord; party.contract_holder=self; party.side=landlord
    - 변경: 외국인 집주인은 가족 명의 집을 대신 관리하는 경우가 많아, 집주인 쪽 대리인도 이 경로로 들어오도록 문장만 넓혔다.
  - `r3_role_proxy` — 집을 빌려 사는 가족이나 지인 대신 확인하고 있고, 계약 당사자는 제가 아닙니다.
    - meaning: party.role=proxy_for_tenant; party.contract_holder=principal; party.side=tenant
    - 변경: 이후 분기가 세입자 쪽 질문으로 이어지므로, 누구를 대신하는지 문장에 밝혀 경로 오류를 막았다.

### re03_demand_type
- phase: 1 / kind: single / show_if: 항상
- profile_field: notice.demand_type
- 질문: 상대방은 이번 통보에서 무엇을 가장 중심적으로 요구했나요?
- 선택지:
  - `r3_dm_fix_breach` — 문제가 된 부분을 정해진 기간 안에 바로잡으면, 계약을 계속 유지하겠다는 내용이었습니다.
    - meaning: notice.demand_type=cure_request; contract.status=active; notice.cure_period=stated
  - `r3_dm_terminate` — 계약을 끝내겠다는 통보였고, 언제 집을 비워야 하는지는 아직 정해지지 않았습니다.
    - meaning: notice.demand_type=termination; contract.status=termination_notified; notice.vacate_date=unset
  - `r3_dm_vacate_date` — 계약을 끝내면서, 정해진 날짜까지 집을 비우라는(또는 비우겠다는) 날짜가 적혀 있었습니다.
    - meaning: notice.demand_type=termination_with_vacate_date; contract.status=termination_notified; notice.vacate_date=set
  - `r3_dm_money_claim` — 계약 위반을 이유로, 위약금이나 손해배상 명목의 돈을 내라는 요구를 받았습니다.
    - meaning: notice.demand_type=money_claim; claim.exists=true
  - `r3_dm_unclear` — 통보는 받았지만, 상대방이 정확히 무엇을 요구하는지 이해하지 못했습니다.
    - meaning: notice.demand_type=unknown; notice.understood=false

### re03_response_status
- phase: 1 / kind: single / show_if: 항상
- profile_field: client.action
- 질문: 통보를 받은 뒤, 지금까지 어떻게 대응하셨나요?
- 선택지:
  - `r3_rs_none` — 통보만 받았고, 아직 상대방에게 답하거나 연락하지 않았습니다.
    - meaning: client.action=none; client.replied=false
  - `r3_rs_inquired` — 상대방이나 중개인에게 이유를 물어봤지만, 제 입장은 아직 정하지 않았습니다.
    - meaning: client.action=inquired; client.replied=true; client.position=undecided
  - `r3_rs_disputed` — 통보 내용이 사실과 다르거나 계약과 맞지 않는다고, 상대방에게 분명히 말했습니다.
    - meaning: client.action=disputed; client.replied=true; client.position=reject
  - `r3_rs_complied_part` — 밀린 금액을 보내거나 문제를 고치는 등, 요구의 일부를 이미 이행했습니다.
    - meaning: client.action=partial_compliance; client.replied=true; client.position=partial_accept
  - `r3_rs_negotiating` — 나가는 날짜나 보증금·금액 조건을 두고, 상대방과 협의하고 있습니다.
    - meaning: client.action=negotiating; client.replied=true; client.position=negotiate

### re03_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- profile_field: client.priority_goal
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `r3_cg_validity` — 이 통보가 계약서 조항과 통지 기간에 맞는 것인지, 그대로 따라야 하는지 확인하고 싶습니다.
    - meaning: client.priority_goal=notice_validity
  - `r3_cg_move_timing` — 정말 집을 비워야 하는지(또는 언제 비워 받을 수 있는지), 그 전에 할 일을 확인하고 싶습니다.
    - meaning: client.priority_goal=vacate_timing
  - `r3_cg_money` — 보증금을 어떻게 정리해야 하는지, 위약금이나 손해배상을 내야 하는지 확인하고 싶습니다.
    - meaning: client.priority_goal=money_settlement
  - `r3_cg_fact_gap` — 상대방이 말한 위반 사유 중 사실과 다른 부분을 정리하고, 어떻게 설명할지 확인하고 싶습니다.
    - meaning: client.priority_goal=fact_dispute
  - `r3_cg_order` — 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.
    - meaning: client.priority_goal=sequencing

---

## D. 2차 공통 노드 — 통보·계약·기한·점유

### re03_notice_form
- phase: 2 / kind: single / show_if: 항상
- profile_field: notice.form
- 질문: 이번 통보는 어떤 방법으로 받으셨나요?
- 선택지:
  - `r3_nf_written_hand` — 서명된 서면 통지를 직접 건네받았고, 원본을 가지고 있습니다.
    - meaning: notice.form=written_signed; notice.channel=direct; evidence.notice_original=held
  - `r3_nf_post` — 우편이나 등기우편으로 서면 통지를 받았고, 봉투나 수령 기록도 남아 있습니다.
    - meaning: notice.form=written_post; notice.channel=post; evidence.receipt_record=held
  - `r3_nf_messenger` — Zalo·카카오톡·이메일 등 메시지로 받았고, 화면 캡처나 대화 기록이 있습니다.
    - meaning: notice.form=electronic_message; notice.channel=messenger; evidence.notice_capture=held
  - `r3_nf_oral` — 전화나 방문으로 말로만 들었고, 서면이나 메시지는 받지 못했습니다.
    - meaning: notice.form=oral; notice.channel=direct; evidence.notice_record=none
  - `r3_nf_via_middle` — 중개인이나 관리사무소가 대신 전달했고, 상대방에게 직접 들은 것은 아닙니다.
    - meaning: notice.form=relayed; notice.channel=intermediary; notice.sender_verified=false

### re03_notice_sender
- phase: 2 / kind: single / show_if: re03_notice_form = r3_nf_oral|r3_nf_via_middle
- profile_field: notice.sender
- 질문: 통보를 실제로 보낸 사람은 누구로 확인되나요?
- 선택지:
  - `r3_sd_party_self` — 계약서에 적힌 상대방 본인이 보낸 것이고, 이름이나 연락처로 확인했습니다.
    - meaning: notice.sender=counterparty_self; notice.sender_verified=true
  - `r3_sd_agent` — 상대방의 가족·회사 담당자·변호사 등 대리인이 보냈고, 위임받았는지는 확인하지 못했습니다.
    - meaning: notice.sender=agent; notice.sender_verified=false; notice.authority=unconfirmed
  - `r3_sd_broker` — 계약을 중개한 중개인이 보냈고, 상대방 본인의 뜻인지는 직접 확인하지 못했습니다.
    - meaning: notice.sender=broker; notice.sender_verified=false; notice.authority=unconfirmed
  - `r3_sd_mgmt_office` — 건물 관리사무소가 보냈고, 계약 상대방 본인의 뜻인지는 분명하지 않습니다.
    - meaning: notice.sender=management_office; notice.sender_verified=false; notice.authority=unconfirmed
  - `r3_sd_unknown` — 누가 보낸 것인지, 계약 상대방과 어떤 관계인지 확인하지 못했습니다.
    - meaning: notice.sender=unknown; notice.sender_verified=false

### re03_notice_period
- phase: 2 / kind: single / show_if: 항상
- profile_field: contract.notice_clause
- 질문: 통보에서 준 기간은 계약서의 해지·통지 조항과 비교하면 어떤가요?
- 선택지:
  - `r3_np_meets_clause` — 계약서에 '며칠 전 통지' 조항이 있고, 이번 통보는 그 기간을 지킨 것으로 보입니다.
    - meaning: contract.notice_clause=exists; notice.period_vs_clause=meets
  - `r3_np_shorter` — 계약서에 통지 기간 조항이 있지만, 이번 통보는 그보다 짧은 기간만 주었습니다.
    - meaning: contract.notice_clause=exists; notice.period_vs_clause=shorter
  - `r3_np_no_clause` — 계약서를 확인했지만, 해지 통지 기간에 관한 조항은 찾지 못했습니다.
    - meaning: contract.notice_clause=absent; notice.period_vs_clause=no_basis
  - `r3_np_lang_unread` — 계약서가 베트남어로만 되어 있어, 해당 조항이 있는지 확인하지 못했습니다.
    - meaning: contract.notice_clause=unknown; contract.language=vi_only; contract.understood=false
  - `r3_np_no_contract` — 서면 계약서 없이 말이나 메시지로 계약했거나, 계약서 사본을 지금 가지고 있지 않습니다.
    - meaning: contract.notice_clause=unknown; contract.form=no_written_or_no_copy

### re03_contract_form
- phase: 2 / kind: single / show_if: re03_notice_period = r3_np_shorter|r3_np_no_clause
- profile_field: contract.form
- 질문: 계약서는 어떤 형태로 작성되어 있나요?
- 선택지:
  - `r3_cf_notarized` — 공증사무소에서 공증받은 계약서이고, 원본이나 공증 사본을 가지고 있습니다.
    - meaning: contract.form=written; contract.notarized=true; evidence.contract=held
  - `r3_cf_bilingual` — 공증은 받지 않았고, 베트남어와 한국어(또는 영어)가 함께 적힌 계약서입니다.
    - meaning: contract.form=written; contract.notarized=false; contract.language=bilingual
  - `r3_cf_vn_only` — 공증은 받지 않았고, 베트남어로만 된 계약서라 일부만 이해하고 있습니다.
    - meaning: contract.form=written; contract.notarized=false; contract.language=vi_only; contract.understood=partial
  - `r3_cf_foreign_only` — 한국어나 영어로만 작성했고, 베트남어 본은 따로 만들지 않았습니다.
    - meaning: contract.form=written; contract.notarized=false; contract.language=foreign_only
  - `r3_cf_company_held` — 회사나 원래 세입자가 계약서를 보관하고 있어, 저는 내용을 직접 보지 못했습니다.
    - meaning: contract.form=held_by_third; party.contract_holder=company_or_original_tenant; contract.understood=false

### re03_move_out_deadline
- phase: 2 / kind: single / show_if: re03_demand_type = r3_dm_terminate|r3_dm_vacate_date
- profile_field: notice.vacate_deadline_type
- 질문: 집을 비우는 날짜는 어떻게 안내받으셨나요?
- 선택지:
  - `r3_md_date_written` — 통보에 정확한 날짜가 적혀 있어, 언제까지인지 확인했습니다.
    - meaning: notice.vacate_deadline_type=exact_date; timeline.deadline_date=known
  - `r3_md_period_only` — '통보일부터 30일 이내'처럼 기간만 적혀 있어, 정확한 날짜는 계산하지 못했습니다.
    - meaning: notice.vacate_deadline_type=period_only; timeline.deadline_date=derivable
  - `r3_md_immediate` — 날짜 없이, 바로 또는 며칠 안에 집을 비우라는(비우겠다는) 말만 들었습니다.
    - meaning: notice.vacate_deadline_type=immediate; timeline.deadline_date=imminent
  - `r3_md_not_stated` — 계약을 끝낸다는 통보는 받았지만, 언제 비워야 하는지는 안내받지 못했습니다.
    - meaning: notice.vacate_deadline_type=not_stated; timeline.deadline_date=unknown
  - `r3_md_lang_unclear` — 통보가 베트남어로 되어 있어, 날짜가 적혀 있는지조차 확인하지 못했습니다.
    - meaning: notice.vacate_deadline_type=unknown; notice.language=vi_only; notice.understood=false

### re03_key_dates
- phase: 2 / kind: text / show_if: 항상
- profile_field: timeline.notice_date; timeline.deadline_date; timeline.contract_end
- 질문: 통보를 받은 날짜, 통보에 적힌 기한, 계약서에 적힌 계약 종료일을 아는 대로 적어 주세요.
- placeholder: 예: 10월 1일 Zalo로 통보를 받았고, 10월 31일까지 집을 비우라고 적혀 있습니다. 계약은 2027년 3월까지입니다. / 9월 20일 통보, 7일 안에 밀린 임대료를 보내라고 했습니다.
- 변경: 기존 re03_move_out_date(퇴거 날짜 입력, 퇴거 통보에만 노출)를 대체. 통보일·시정 기한·계약 종료일이 없으면 통지 기간 준수와 남은 계약 기간을 판단할 수 없어 모든 경로에 노출되는 날짜 입력으로 넓혔다.

### re03_occupancy_tenant
- phase: 2 / kind: single / show_if: re03_my_role ≠ r3_role_landlord 그리고 (re03_demand_type = r3_dm_vacate_date 또는 re03_move_out_deadline = r3_md_immediate)
- profile_field: occupancy.status
- 질문: 지금 그 집에서의 생활은 어떤 상태인가요?
- 선택지:
  - `r3_oc_living_normal` — 아직 그 집에 살고 있고, 출입이나 전기·수도 사용에는 문제가 없습니다.
    - meaning: occupancy.status=living; occupancy.access=normal
  - `r3_oc_moving_prep` — 아직 살고 있지만, 새 집을 알아보거나 짐을 일부 옮기고 있습니다.
    - meaning: occupancy.status=preparing_to_move; occupancy.access=normal
  - `r3_oc_already_left` — 이미 집을 비웠지만, 열쇠 반납이나 집 상태 확인은 아직 하지 않았습니다.
    - meaning: occupancy.status=vacated; handover.keys=not_returned; handover.inspection=not_done
  - `r3_oc_locked_out` — 상대방이 열쇠를 바꾸거나 전기·수도를 끊어, 집을 제대로 쓰지 못하고 있습니다.
    - meaning: occupancy.status=living; occupancy.access=blocked; risk.self_help_eviction=true
  - `r3_oc_belongings_threat` — 정해진 날까지 나가지 않으면, 짐을 밖으로 내놓겠다는 말을 들었습니다.
    - meaning: occupancy.status=living; occupancy.access=normal; risk.belongings_removal_threat=true

### re03_occupancy_landlord
- phase: 2 / kind: single / show_if: re03_my_role = r3_role_landlord
- profile_field: occupancy.tenant_status
- 질문: 세입자는 지금 그 집을 어떻게 쓰고 있나요?
- 선택지:
  - `r3_ol_still_living` — 세입자가 아직 살고 있고, 나가는 날짜에 대해 연락은 되고 있습니다.
    - meaning: occupancy.tenant_status=living; counterparty.contactable=true
  - `r3_ol_not_leaving` — 계약이 끝났거나 해지됐는데도 세입자가 나가지 않고, 날짜 이야기를 피하고 있습니다.
    - meaning: occupancy.tenant_status=overstaying; counterparty.response=avoiding
  - `r3_ol_third_party` — 세입자가 아닌 다른 사람이 살고 있어, 제 동의 없이 다시 빌려준 것으로 보입니다.
    - meaning: occupancy.tenant_status=third_party_occupying; conduct.unauthorized_sublease=suspected; party.multi=true
  - `r3_ol_left_items` — 세입자는 나간 것 같지만, 짐이 남아 있고 열쇠도 돌려받지 못했습니다.
    - meaning: occupancy.tenant_status=left_with_items; handover.keys=not_returned
  - `r3_ol_no_contact` — 세입자와 연락이 끊겼고, 집 안 상태도 확인하지 못했습니다.
    - meaning: occupancy.tenant_status=unknown; counterparty.contactable=false; handover.inspection=not_done

---

## E. 2차 사유별 노드 — 세부 사건을 가르는 질문

### re03_reason_tenant
- phase: 2 / kind: single / show_if: re03_my_role ≠ r3_role_landlord
- profile_field: notice.reason
- 질문: 상대방은 계약 위반이나 해지 이유를 무엇이라고 했나요?
- 선택지:
  - `r3_rt_arrears` — 임대료나 관리비가 밀렸다는 이유였고, 밀린 기간이나 금액이 적혀 있습니다.
    - meaning: notice.reason=arrears; notice.reason_side=client_fault_alleged; case.sub=A_arrears
  - `r3_rt_noise_misuse` — 소음이나 이웃 민원, 또는 집을 사무실·영업 등 주거 외 용도로 썼다는 이유였습니다.
    - meaning: notice.reason=conduct_noise_or_use; notice.reason_side=client_fault_alleged; case.sub=B_conduct
  - `r3_rt_sublease` — 집주인 동의 없이 다른 사람에게 다시 빌려주었거나, 함께 살게 했다는 이유였습니다.
    - meaning: notice.reason=unauthorized_sublease; notice.reason_side=client_fault_alleged; case.sub=B_conduct
  - `r3_rt_owner_side` — 제 잘못이 아니라, 집을 팔거나 집주인이 직접 쓰겠다는 상대방 사정 때문이라고 했습니다.
    - meaning: notice.reason=owner_circumstance; notice.reason_side=counterparty_circumstance; case.sub=C_owner_side
  - `r3_rt_other_unclear` — 위에 없는 다른 이유이거나, 이유가 적혀 있지 않아 알 수 없습니다.
    - meaning: notice.reason=other_or_unstated; case.sub=F_unclear

### re03_arrears_fact
- phase: 2 / kind: single / show_if: re03_reason_tenant = r3_rt_arrears
- profile_field: payment.arrears_fact
- 질문: 밀렸다고 한 임대료·관리비는 실제와 비교하면 어떤가요?
- 선택지:
  - `r3_ar_admit_unpaid` — 실제로 밀린 금액이 있고, 그 금액도 상대방 말과 거의 같습니다.
    - meaning: payment.arrears_fact=unpaid_admitted; facts.match=match
  - `r3_ar_amount_differs` — 밀린 것은 맞지만, 상대방이 말한 금액이나 기간이 실제보다 큽니다.
    - meaning: payment.arrears_fact=unpaid_amount_disputed; facts.match=partial; facts.gap_type=date_amount
  - `r3_ar_paid_not_counted` — 이미 송금했는데, 상대방이 받지 못했다고 하거나 반영하지 않았습니다.
    - meaning: payment.arrears_fact=paid_not_credited; facts.match=mismatch; facts.gap_type=date_amount
  - `r3_ar_mgmt_fee_dispute` — 임대료는 보냈고, 문제가 된 것은 관리사무소 관리비나 전기·수도 요금입니다.
    - meaning: payment.arrears_fact=rent_paid_fees_disputed; payment.rent=paid; payment.fees=disputed
  - `r3_ar_none` — 밀린 금액이 없고, 송금 내역으로 이를 확인할 수 있습니다.
    - meaning: payment.arrears_fact=no_arrears; facts.match=mismatch; evidence.transfer=held

### re03_arrears_cause
- phase: 2 / kind: single / show_if: re03_arrears_fact = r3_ar_admit_unpaid|r3_ar_mgmt_fee_dispute
- profile_field: payment.arrears_cause
- 질문: 그 금액이 밀리게 된 실제 이유는 무엇인가요?
- 선택지:
  - `r3_ac_temp_shortage` — 일시적으로 돈이 부족했거나 송금을 놓쳤고, 지금은 밀린 금액을 낼 수 있는 상태입니다.
    - meaning: payment.arrears_cause=temporary_shortage; payment.cure_capacity=yes
  - `r3_ac_withheld_repair` — 집주인이 수리나 약속을 지키지 않아, 그 사이 일부러 보내지 않고 있었습니다.
    - meaning: payment.arrears_cause=withheld_for_counter_breach; facts.counter_breach=alleged_by_client
  - `r3_ac_company_delay` — 회사가 대신 내는 임대료인데, 회사 쪽 송금이 늦어졌습니다.
    - meaning: payment.arrears_cause=company_payer_delay; party.payer=company
  - `r3_ac_account_changed` — 집주인이 계좌나 받는 방법을 바꾸었는데, 제대로 안내받지 못해 늦어졌습니다.
    - meaning: payment.arrears_cause=payee_account_changed; facts.counterparty_contribution=possible
  - `r3_ac_fee_unclear` — 관리비·전기·수도 요금이 어떻게 계산되었는지 몰라, 확인될 때까지 보내지 않았습니다.
    - meaning: payment.arrears_cause=fee_calculation_unclear; payment.fees=disputed
- 변경: 신규. 연체를 인정한 경우 전문가는 "왜 밀렸나"(일시 부족/상대방 위반에 따른 보류/회사 지급 지연/계좌 변경)에 따라 시정 가능성과 반박 방향이 완전히 달라지므로 추가했다(기존 r3_fc_other_breached가 연체 경로에서 빠진 부분도 여기서 받는다).

### re03_conduct_fact
- phase: 2 / kind: single / show_if: re03_reason_tenant = r3_rt_noise_misuse|r3_rt_sublease
- profile_field: conduct.fact
- 질문: 상대방이 문제 삼은 집 사용 방식은 실제로 어떠했나요?
- 선택지:
  - `r3_cd_admit_fixed` — 그런 일이 있었던 것은 맞지만, 통보를 받은 뒤 이미 그만두거나 고쳤습니다.
    - meaning: conduct.fact=occurred_cured; conduct.ongoing=false; facts.match=match
  - `r3_cd_admit_ongoing` — 그런 일이 있었던 것은 맞고, 지금도 같은 방식으로 쓰고 있습니다.
    - meaning: conduct.fact=occurred_ongoing; conduct.ongoing=true; facts.match=match
  - `r3_cd_consented_before` — 계약 전이나 중간에 집주인이 허락했고, 허락받은 메시지나 서면이 남아 있습니다.
    - meaning: conduct.fact=consented; facts.gap_type=prior_agreement; evidence.side_agreement=held
  - `r3_cd_exaggerated` — 비슷한 일은 있었지만, 상대방이 실제보다 훨씬 크게 문제 삼고 있습니다.
    - meaning: conduct.fact=occurred_exaggerated; facts.match=partial
  - `r3_cd_deny` — 그런 사용은 없었고, 이웃이나 관리사무소가 사실을 확인해 줄 수 있습니다.
    - meaning: conduct.fact=denied; facts.match=mismatch; evidence.witness=available

### re03_owner_reason_fact
- phase: 2 / kind: single / show_if: re03_reason_tenant = r3_rt_owner_side
- profile_field: counterparty.owner_side_reason
- 질문: 상대방 사정으로 계약을 끝내겠다는 통보는 어떤 내용이었나요?
- 선택지:
  - `r3_ow_sale_new_owner` — 집을 팔았거나 팔 예정이라고 했고, 새 집주인에게 계약이 이어지는지는 듣지 못했습니다.
    - meaning: counterparty.owner_side_reason=sale; contract.assignment_to_buyer=unknown
  - `r3_ow_sale_buyer_wants_empty` — 집을 팔면서, 사는 사람이 빈집을 원한다며 날짜를 정해 나가 달라고 했습니다.
    - meaning: counterparty.owner_side_reason=sale_vacant_possession; contract.remaining_term=likely; notice.vacate_date=set
  - `r3_ow_own_use` — 집주인이나 가족이 직접 살겠다며, 계약 기간이 남았는데도 나가 달라고 했습니다.
    - meaning: counterparty.owner_side_reason=own_use; contract.remaining_term=yes
  - `r3_ow_bank_issue` — 은행 담보나 집주인의 빚 문제로, 집이 다른 사람에게 넘어갈 수 있다는 이야기를 들었습니다.
    - meaning: counterparty.owner_side_reason=mortgage_or_debt; risk.property_transfer=true; party.multi=true
  - `r3_ow_compensation_offered` — 상대방 사정이라며, 이사비나 위약금 일부를 보상하겠다고 제안했습니다.
    - meaning: counterparty.owner_side_reason=owner_circumstance_with_offer; counterparty.response=compensation_offered

### re03_reason_landlord
- phase: 2 / kind: single / show_if: re03_my_role = r3_role_landlord
- profile_field: notice.reason
- 질문: 세입자는 계약 위반이나 해지 이유를 무엇이라고 했나요?
- 선택지:
  - `r3_rld_repair_claim` — 제가 수리나 시설 관리를 해 주지 않아, 계약을 지키지 않았다고 했습니다.
    - meaning: notice.reason=landlord_repair_failure_alleged; notice.reason_side=client_fault_alleged; case.sub=D2_landlord_breach_alleged
  - `r3_rld_early_exit` — 귀국·전근 등 세입자 개인 사정으로, 계약 기간 전에 나가겠다고 했습니다.
    - meaning: notice.reason=tenant_early_exit; notice.reason_side=counterparty_circumstance; case.sub=D1_early_exit
  - `r3_rld_deposit_claim` — 보증금이나 미리 받은 임대료를 돌려 달라고 하면서, 해지를 통보했습니다.
    - meaning: notice.reason=termination_with_refund_demand; claim.refund_demanded=true; case.sub=D1_early_exit
  - `r3_rld_house_issue` — 누수·곰팡이·소음 등 집 상태가 계약 때 설명과 다르다고 했습니다.
    - meaning: notice.reason=house_condition_misrepresented; notice.reason_side=client_fault_alleged; case.sub=D2_landlord_breach_alleged
  - `r3_rld_no_reason` — 이유 없이 나가겠다고만 했거나, 그 뒤로 연락이 거의 끊긴 상태입니다.
    - meaning: notice.reason=unstated; counterparty.contactable=limited; case.sub=D1_early_exit

### re03_exit_terms_landlord
- phase: 2 / kind: single / show_if: re03_reason_landlord = r3_rld_early_exit|r3_rld_deposit_claim|r3_rld_no_reason
- profile_field: contract.early_exit_clause
- 질문: 세입자가 계약 기간 전에 나가는 경우에 대해, 계약서에는 어떻게 정해져 있나요?
- 선택지:
  - `r3_et_forfeit_clause` — 기간 전에 나가면 보증금을 돌려주지 않는다는 조항이 있고, 세입자도 서명했습니다.
    - meaning: contract.early_exit_clause=deposit_forfeit; contract.signed_by_counterparty=true
  - `r3_et_months_penalty` — 기간 전에 나가면 임대료 몇 달치를 위약금으로 낸다는 조항이 있습니다.
    - meaning: contract.early_exit_clause=months_rent_penalty
  - `r3_et_mutual_allowed` — 일정 기간이 지나면 미리 알리기만 하면 위약금 없이 나갈 수 있다는 조항이 있습니다.
    - meaning: contract.early_exit_clause=penalty_free_after_period
  - `r3_et_no_clause` — 기간 전에 나가는 경우에 대한 조항이 없거나, 계약서에서 찾지 못했습니다.
    - meaning: contract.early_exit_clause=absent_or_not_found
  - `r3_et_tenant_disputes` — 조항은 있지만, 세입자가 그 조항을 몰랐다거나 자신에게는 적용되지 않는다고 말합니다.
    - meaning: contract.early_exit_clause=exists; counterparty.response=disputes_clause
- 변경: 신규. 집주인 쪽 조기 해지 사건은 "보증금을 남길 수 있는가/위약금을 받을 수 있는가"가 핵심인데, 기존 re03_penalty_clause는 '고객이 돈을 요구받은' 경우만 다뤄 집주인 경로에서 이 사실을 확보할 질문이 없었다.

### re03_fact_compare
- phase: 2 / kind: single / show_if: re03_reason_tenant = r3_rt_other_unclear 또는 re03_reason_landlord = r3_rld_repair_claim|r3_rld_house_issue
- profile_field: facts.match
- 질문: 상대방이 통보에서 말한 내용은 실제 있었던 일과 비교하면 어떤가요?
- 선택지:
  - `r3_fc_match` — 상대방이 말한 내용이 실제 있었던 일과 거의 같습니다.
    - meaning: facts.match=match
  - `r3_fc_partial` — 그런 일은 있었지만, 날짜·금액·횟수 등 일부가 실제와 다릅니다.
    - meaning: facts.match=partial
  - `r3_fc_already_solved` — 그런 일은 있었지만, 통보 전에 이미 해결했거나 상대방과 정리한 일입니다.
    - meaning: facts.match=resolved_before_notice
  - `r3_fc_other_breached` — 상대방이 먼저 계약을 지키지 않았는데, 이번 통보에는 그 사실이 빠져 있습니다.
    - meaning: facts.match=partial; facts.counter_breach=alleged_by_client
  - `r3_fc_cannot_compare` — 통보 내용을 이해하지 못했거나 기록이 없어, 지금은 비교하기 어렵습니다.
    - meaning: facts.match=unknown
- 변경: show_if를 '항상'에서 좁혔다. 연체(A)·사용 방식(B) 경로는 re03_arrears_fact·re03_conduct_fact가 같은 비교를 더 구체적으로 하고, 상대방 사정(C)·세입자 조기 해지(D1)는 비교할 '위반 주장'이 없어 중복·무의미 질문이 되기 때문이다.

### re03_fact_gap
- phase: 2 / kind: single / show_if: re03_fact_compare = r3_fc_partial|r3_fc_already_solved|r3_fc_other_breached
- profile_field: facts.gap_type
- 질문: 상대방 말과 실제가 가장 크게 다른 점은 무엇인가요?
- 선택지:
  - `r3_gp_date_amount` — 날짜나 금액이 다르고, 송금 내역이나 영수증으로 실제를 보여 줄 수 있습니다.
    - meaning: facts.gap_type=date_amount; evidence.gap_proof=transfer_or_receipt
  - `r3_gp_action_itself` — 문제라고 한 행동 자체가 다르고, 당시 상황을 보여 줄 메시지나 증인이 있습니다.
    - meaning: facts.gap_type=act_itself; evidence.gap_proof=message_or_witness
  - `r3_gp_prior_agreement` — 이미 상대방과 합의한 일인데, 그 합의를 없던 일로 하고 있습니다.
    - meaning: facts.gap_type=prior_agreement; counterparty.response=reneging
  - `r3_gp_counter_breach` — 상대방이 수리·보증금·약속을 먼저 지키지 않았는데, 그 부분이 빠져 있습니다.
    - meaning: facts.gap_type=counter_breach; facts.counter_breach=alleged_by_client
  - `r3_gp_no_proof_yet` — 다르다는 것은 분명하지만, 이를 보여 줄 자료를 아직 모으지 못했습니다.
    - meaning: facts.gap_type=unspecified; evidence.gap_proof=none

### re03_fact_gap_text
- phase: 2 / kind: text / show_if: re03_fact_gap = r3_gp_date_amount|r3_gp_action_itself|r3_gp_prior_agreement|r3_gp_counter_breach 또는 re03_arrears_fact = r3_ar_amount_differs|r3_ar_paid_not_counted 또는 re03_conduct_fact = r3_cd_consented_before|r3_cd_exaggerated|r3_cd_deny
- profile_field: facts.gap_text
- 질문: 상대방 주장과 실제가 다른 부분을 날짜와 함께 적어 주세요.
- placeholder: 예: 9월 임대료는 9월 5일에 계좌이체로 보냈는데, 통보에는 9월분이 밀렸다고 적혀 있습니다. / 3월에 집주인이 Zalo로 사무실 사용을 허락했는데, 이번 통보에는 그 내용이 빠져 있습니다.
- 변경: show_if를 r3_fc_partial|r3_fc_other_breached에서 바꿨다. 연체·사용 방식 경로의 '실제와 다름' 답(금액 차이·미반영 송금·사전 허락·과장·부인)에서도 날짜별 차이를 받아야 하고, 차이를 증명할 자료가 없다고 한 경우(r3_gp_no_proof_yet)는 입력보다 자료 수집 안내가 먼저이기 때문이다.

---

## F. 1차 → 2차 adaptive branching 표

2차 공통 꼬리(모든 경로 끝): re03_deposit_status → (re03_penalty_clause → re03_claim_amount) → re03_evidence → re03_blockage → re03_final_goal
통보 블록(모든 경로): re03_notice_form → (re03_notice_sender) → re03_notice_period → (re03_contract_form) → (re03_move_out_deadline) → re03_key_dates → (점유 질문) → (re03_counter_reaction)

| 1차 답 조합(+ 2차 첫 갈림) | 세부 사건 | 2차 질문 순서 | 기본 노출 수 |
|---|---|---|---|
| role ≠ landlord, r3_dm_fix_breach, r3_rt_arrears → r3_ar_admit_unpaid, r3_rs_none | A-1 임대료 연체 인정 → 시정 요구 | reason_tenant → arrears_fact → arrears_cause → notice_form → notice_period → key_dates → deposit_status → evidence → blockage → final_goal | 10 |
| role ≠ landlord, r3_dm_vacate_date, r3_rs_disputed, r3_rt_arrears → r3_ar_paid_not_counted / r3_ar_amount_differs | A-2 이미 보낸 임대료 미반영·금액 과다 → 퇴거 통보 | reason_tenant → arrears_fact → fact_gap_text → notice_form → notice_period → move_out_deadline → key_dates → occupancy_tenant → counter_reaction → deposit_status → evidence → blockage → final_goal | 13 |
| role ≠ landlord, r3_dm_fix_breach\|r3_dm_terminate, r3_rt_noise_misuse\|r3_rt_sublease | B 집 사용 방식(소음·용도·무단 재임대) 위반 → 시정 요구·해지 | reason_tenant → conduct_fact → (fact_gap_text: r3_cd_consented_before\|r3_cd_exaggerated\|r3_cd_deny) → notice_form → notice_period → (move_out_deadline) → key_dates → (counter_reaction) → deposit_status → evidence → blockage → final_goal | 9~12 |
| role ≠ landlord, r3_dm_vacate_date\|r3_dm_terminate, r3_rt_owner_side | C 집주인 사정(매각·직접 거주·은행 담보) → 기간 중 퇴거 요구 | reason_tenant → owner_reason_fact → notice_form → notice_period → move_out_deadline → key_dates → (occupancy_tenant) → (counter_reaction) → deposit_status → evidence → blockage → final_goal | 10~12 |
| r3_role_landlord, r3_dm_terminate\|r3_dm_vacate_date, r3_rld_early_exit\|r3_rld_deposit_claim\|r3_rld_no_reason | D-1 세입자 조기 해지·보증금 반환 요구 | reason_landlord → exit_terms_landlord → notice_form → notice_period → move_out_deadline → key_dates → occupancy_landlord → (counter_reaction) → deposit_status → (penalty_clause → claim_amount) → evidence → blockage → final_goal | 11~13 |
| r3_role_landlord, r3_rld_repair_claim\|r3_rld_house_issue | D-2 세입자가 집주인 위반(수리·집 상태)을 이유로 해지 | reason_landlord → fact_compare → (fact_gap → fact_gap_text) → notice_form → notice_period → (move_out_deadline) → key_dates → occupancy_landlord → deposit_status → evidence → blockage → final_goal | 10~13 |
| role ≠ landlord, r3_dm_money_claim (사유 A/B 공통) | E 위반을 이유로 한 위약금·손해배상 청구 | reason_tenant → arrears_fact 또는 conduct_fact → notice_form → notice_period → key_dates → (counter_reaction) → deposit_status → penalty_clause → claim_amount → evidence → blockage → final_goal | 11~13 |
| role ≠ landlord, r3_dm_unclear 또는 r3_rt_other_unclear, r3_nf_oral\|r3_nf_via_middle | F 사유·요구 불명확 통보(전달자 경유) | reason_tenant → fact_compare → (fact_gap → fact_gap_text) → notice_form → notice_sender → notice_period → (move_out_deadline) → key_dates → deposit_status → evidence → blockage → final_goal | 10~13 |
| r3_role_subtenant + r3_dm_terminate\|r3_dm_vacate_date / r3_ow_bank_issue / r3_cr_legal_threat / r3_oc_locked_out / r3_oc_belongings_threat | 특수: 다수 당사자·담보 실행·법적 절차·자력 퇴거 | 해당 경로 질문을 끝까지 받되, 결과는 일반 퍼널 대신 "VFBCAI 전문가팀 진행" 안내 | — |

노출 수 규칙: 기본 경로는 2차 9~13문항. 통지 기간이 짧거나 조항이 없을 때의 re03_contract_form, 전달자 경유 통보의 re03_notice_sender, 금액 요구가 겹칠 때의 re03_penalty_clause·re03_claim_amount는 위험 신호 후속 질문이라 기본 수에 더해질 수 있다(최대 +2). 이 후속이 붙는 경우는 대부분 주의 이상 판정 대상이다.

---

## G. 2차 금액·보증금 노드

### re03_deposit_status
- phase: 2 / kind: single / show_if: 항상
- profile_field: payment.deposit_status
- 질문: 이 계약의 보증금은 지금 어떤 상태인가요?
- 선택지:
  - `r3_ds_held_no_talk` — 보증금은 집주인 쪽에 그대로 있고, 돌려주거나 빼는 것에 대한 이야기는 아직 없습니다.
    - meaning: payment.deposit_status=held_undiscussed; payment.deposit_holder=landlord_side
  - `r3_ds_return_promised` — 돌려준다는 말은 오갔지만, 금액이나 날짜는 아직 정해지지 않았습니다.
    - meaning: payment.deposit_status=return_promised; payment.deposit_return_terms=unset
  - `r3_ds_deduct_listed` — 밀린 금액이나 수리비를 빼고 돌려준다고 했고, 공제 내역도 받았습니다.
    - meaning: payment.deposit_status=partial_return_itemized; payment.deduction_list=received
  - `r3_ds_deduct_no_list` — 일부를 빼고 돌려준다고 했지만, 무엇을 얼마나 빼는지 내역은 받지 못했습니다.
    - meaning: payment.deposit_status=partial_return_unitemized; payment.deduction_list=not_received
  - `r3_ds_forfeit` — 계약 위반을 이유로, 보증금을 전혀 돌려주지 않겠다는 이야기가 나왔습니다.
    - meaning: payment.deposit_status=forfeit_asserted
- 비고: r3_role_subtenant는 보증금을 원래 세입자에게 냈을 수 있으므로 payment.deposit_holder=original_tenant로 해석한다(K 참조). r3_role_landlord는 같은 선택지를 "제가 보관 중인 보증금" 기준으로 답한다.

### re03_penalty_clause
- phase: 2 / kind: single / show_if: re03_demand_type = r3_dm_money_claim 또는 re03_deposit_status = r3_ds_deduct_listed|r3_ds_deduct_no_list|r3_ds_forfeit
- profile_field: contract.penalty_match
- 질문: 상대방이 요구한 금액은 계약서의 위약금 조항과 비교하면 어떤가요?
- 선택지:
  - `r3_pc_clause_matches` — 계약서에 위약금 조항(보증금 몰수, 임대료 몇 달치 등)이 있고, 요구 금액도 그 조항과 같습니다.
    - meaning: contract.penalty_clause=exists; contract.penalty_match=matches
  - `r3_pc_amount_exceeds` — 위약금 조항은 있지만, 요구받은 금액이 조항보다 크거나 다른 항목이 더 붙어 있습니다.
    - meaning: contract.penalty_clause=exists; contract.penalty_match=exceeds
  - `r3_pc_no_clause` — 계약서에 위약금 조항이 없는데, 상대방이 금액을 정해서 요구했습니다.
    - meaning: contract.penalty_clause=absent; contract.penalty_match=no_basis
  - `r3_pc_damage_claim` — 위약금과 별도로, 수리비·공실 손해 등 손해배상을 추가로 요구받았습니다.
    - meaning: contract.penalty_match=penalty_plus_damages; claim.damages=true
  - `r3_pc_unknown` — 위약금 조항이 있는지, 요구 금액이 어떻게 계산되었는지 모르겠습니다.
    - meaning: contract.penalty_clause=unknown; contract.penalty_match=unknown

### re03_claim_amount
- phase: 2 / kind: text / show_if: re03_penalty_clause = r3_pc_clause_matches|r3_pc_amount_exceeds|r3_pc_no_clause|r3_pc_damage_claim
- profile_field: claim.amount_text
- 질문: 요구받은 금액과 항목을 통보에 적힌 그대로 적어 주세요.
- placeholder: 예: 위약금으로 임대료 2개월분 3,000만 동, 청소비 200만 동을 보증금에서 빼겠다고 했습니다.

---

## H. 2차 대응·증거·막힌 이유·최종 목표 노드

### re03_counter_reaction
- phase: 2 / kind: single / show_if: re03_response_status = r3_rs_inquired|r3_rs_disputed|r3_rs_complied_part|r3_rs_negotiating
- profile_field: counterparty.response
- 질문: 대응한 뒤, 상대방은 어떤 반응을 보였나요?
- 선택지:
  - `r3_cr_withdrawn` — 통보를 거두거나, 계약을 그대로 유지하겠다는 답을 받았습니다.
    - meaning: counterparty.response=accepted_withdrawn; contract.status=active
  - `r3_cr_maintained` — 처음 통보를 그대로 유지하겠다며, 같은 날짜와 요구를 다시 말했습니다.
    - meaning: counterparty.response=rejected_maintained
  - `r3_cr_new_terms` — 날짜를 미루거나 금액을 줄이는 등, 일부는 받아들이면서 새로운 조건을 제시했습니다.
    - meaning: counterparty.response=partial_accept_new_terms
    - 변경: '일부 수용'과 '새 조건'이 실제로 함께 오는 반응이라, L 구조의 일부 수용 값을 이 선택지가 받도록 문장을 보완했다.
  - `r3_cr_shift_blame` — 자기 문제가 아니라며, 새 집주인·중개인·관리사무소·회사 쪽으로 책임을 돌렸습니다.
    - meaning: counterparty.response=shifted_responsibility; party.multi=possible
    - 변경: 신규. 매각·중개인 경유·회사 명의 계약에서 흔한 '책임 전가' 반응은 상대해야 할 당사자를 바꾸는 사실인데 기존 선택지에 없었다(이 질문만 6개 선택지).
  - `r3_cr_legal_threat` — 법원이나 공안에 신고하겠다고 했거나, 이미 절차를 시작했다고 했습니다.
    - meaning: counterparty.response=legal_action_threatened; risk.legal_proceeding=true
  - `r3_cr_no_reply` — 아직 답이 없거나, 답을 받았지만 무슨 뜻인지 이해하지 못했습니다.
    - meaning: counterparty.response=no_reply_or_unclear

### re03_evidence
- phase: 2 / kind: multi / show_if: 항상
- profile_field: evidence.items
- 질문: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `r3_ev_contract` — 임대차 계약서(공증본·번역본 포함)
    - meaning: evidence.contract=held
  - `r3_ev_notice_chat` — 상대방에게서 받은 통보와 그 뒤 주고받은 메시지 기록
    - meaning: evidence.notice=held; evidence.reply_record=held
  - `r3_ev_transfer` — 임대료·관리비·보증금 송금 내역이나 영수증
    - meaning: evidence.transfer=held
  - `r3_ev_house_photo` — 입주할 때와 지금의 집 상태를 보여 주는 사진·영상, 또는 집 상태 확인서·열쇠 인수 기록
    - meaning: evidence.house_condition=held; evidence.handover=possible
    - 변경: 퇴거 정산의 핵심인 인수인계 기록을 별도 선택지 없이 받기 위해 문장만 넓혔다.
  - `r3_ev_side_agreement` — 집주인(세입자)이 허락하거나 따로 합의한 내용, 또는 수리를 요청한 기록
    - meaning: evidence.side_agreement=held
    - 변경: 신규. 사전 허락(r3_cd_consented_before)·상대방 선위반(r3_gp_counter_breach·r3_ac_withheld_repair)·세입자의 수리 주장(r3_rld_repair_claim)을 뒷받침할 자료 항목이 없었다.
  - `r3_ev_none` — 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.
    - meaning: evidence.items=none
- 규칙: r3_ev_none은 다른 항목과 함께 선택할 수 없다.

### re03_blockage
- phase: 2 / kind: single / show_if: 항상
- profile_field: process.blockage
- 질문: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `r3_bk_validity_unknown` — 통보가 계약서 조항에 맞는 것인지 판단하지 못해, 따를지 말지 정하지 못하고 있습니다.
    - meaning: process.blockage=validity_unknown
  - `r3_bk_time_pressure` — 집을 비우는 날짜가 너무 가까워, 이사나 다음 세입자 준비가 따라가지 못하고 있습니다.
    - meaning: process.blockage=time_pressure
  - `r3_bk_money_dispute` — 보증금이나 위약금 금액에 서로 의견이 달라, 정리가 멈춰 있습니다.
    - meaning: process.blockage=money_dispute
  - `r3_bk_no_proof` — 상대방 말이 사실과 다르다는 것을 보여 줄 자료가 부족해, 대응을 미루고 있습니다.
    - meaning: process.blockage=lack_of_proof
  - `r3_bk_no_response` — 상대방이 연락을 피하거나 답이 없어, 다음 단계로 넘어가지 못하고 있습니다.
    - meaning: process.blockage=counterparty_unresponsive; counterparty.response=avoiding

### re03_final_goal
- phase: 2 / kind: single / show_if: 항상
- profile_field: client.final_goal
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `r3_gl_keep_living` — 계약을 그대로 유지하고, 남은 계약 기간 동안 그 집에서 계속 살고 싶습니다.
    - meaning: client.final_goal=keep_tenancy
  - `r3_gl_leave_settle_money` — 나가는 것은 받아들이되, 보증금과 남은 금액을 정확히 정리하고 나가고 싶습니다.
    - meaning: client.final_goal=vacate_with_settlement
  - `r3_gl_leave_no_penalty` — 계약을 끝내되, 위약금이나 손해배상 없이 정리하고 싶습니다.
    - meaning: client.final_goal=terminate_without_penalty
  - `r3_gl_recover_house` — 집주인으로서 계약을 정리하고, 집을 비워 돌려받고 싶습니다.
    - meaning: client.final_goal=recover_possession
  - `r3_gl_claim_penalty` — 집주인으로서 세입자가 기간 전에 나가는 것에 대해, 계약서대로 위약금이나 보증금 정리를 받고 싶습니다.
    - meaning: client.final_goal=claim_early_exit_penalty
    - 변경: 신규. 집주인 조기 해지 경로(D-1)에서는 '집 회수'가 아니라 '위약금·보증금 정산'이 목표인 경우가 대부분인데 선택지가 없었다.

### 삭제한 노드
- `re03_move_out_date`(text) — re03_key_dates로 대체(통보일·기한·계약 종료일을 한 번에 받음).
- `re03_response_detail`(rd_written_kept / rd_oral_only / rd_paid_with_record / rd_fixed_with_photo / rd_via_broker) — 삭제. 대응 '행동'은 re03_response_status, 대응 '기록'은 re03_evidence(r3_ev_notice_chat·r3_ev_transfer·r3_ev_house_photo), 중개인 경유 전달 위험은 re03_notice_form·re03_notice_sender가 이미 확보해 결과 판정과 다음 질문을 바꾸지 않았고, 경로당 문항 수만 늘렸다.

---

## I. Evidence structure

| value | 의미 | 증명하는 사실 | 결과 판정 영향 |
|---|---|---|---|
| r3_ev_contract | 임대차 계약서(공증본·번역본) 보관 | 통지 기간 조항, 해지 사유 조항, 위약금·조기 해지 조항, 계약 종료일, 당사자 | 없으면 r3_np_no_contract·r3_pc_unknown과 함께 "확인 필요" 문장 강화. 있으면 STEP 1(조항 대조) 바로 안내 |
| r3_ev_notice_chat | 통보 원문과 이후 메시지 기록 | 통보일·통보자·요구 내용, 고객 대응 내용, 상대방 재응답 | r3_nf_oral·r3_cr_no_reply 신호 완화. 없으면 "통보를 서면·메시지로 다시 받아 두기" 문장 우선 |
| r3_ev_transfer | 임대료·관리비·보증금 송금 내역·영수증 | 지급 사실·날짜·금액, 연체 여부, 보증금 액수 | r3_ar_paid_not_counted·r3_ar_none·r3_gp_date_amount의 반박 근거. 없으면 r3_bk_no_proof와 함께 주의 |
| r3_ev_house_photo | 입주·현재 집 상태 사진, 집 상태 확인서·열쇠 인수 기록 | 집 상태 변화(손상·원상), 인수인계 시점 | ds_deduct_*·r3_pc_damage_claim·r3_rld_house_issue 판단 근거. 퇴거 경로에서 없으면 STEP 3(인수인계 기록) 강조 |
| r3_ev_side_agreement | 허락·별도 합의·수리 요청 기록 | 사전 허락(용도·동거·재임대), 상대방 선위반, 수리 요청 시점 | r3_cd_consented_before·r3_gp_prior_agreement·r3_gp_counter_breach·r3_ac_withheld_repair·r3_rld_repair_claim의 핵심 근거. 해당 답인데 미선택이면 주의 문장 추가 |
| r3_ev_none | 자료 없음·미확인 | — | 확인 필요 신호. r3_gp_no_proof_yet·r3_bk_no_proof와 겹치면 STEP 2(자료 수집)를 첫 STEP으로 올림 |

보조 증거 사실(다른 질문에서 확보): evidence.notice_original(r3_nf_written_hand), evidence.receipt_record(r3_nf_post), evidence.notice_capture(r3_nf_messenger), evidence.witness(r3_cd_deny), evidence.gap_proof(re03_fact_gap).

---

## J. Timeline structure

| 순서 | 이벤트 | Situation Profile 필드 | 채우는 질문 id |
|---|---|---|---|
| 1 | 계약 체결·계약 형태(공증·언어) | contract.form, contract.notarized, contract.language | re03_contract_form, re03_notice_period |
| 2 | 계약 종료 예정일(남은 계약 기간) | timeline.contract_end, contract.remaining_term | re03_key_dates, re03_owner_reason_fact |
| 3 | 지급(임대료·관리비·보증금) | payment.arrears_fact, payment.deposit_status | re03_arrears_fact, re03_deposit_status, re03_fact_gap_text(송금일) |
| 4 | 문제 발생(연체·사용 방식·집 상태·상대방 사정) | notice.reason, conduct.fact, payment.arrears_cause | re03_reason_tenant, re03_reason_landlord, re03_conduct_fact, re03_arrears_cause, re03_fact_gap_text |
| 5 | 통보 수령(날짜·방법·통보자) | timeline.notice_date, notice.form, notice.sender | re03_key_dates, re03_notice_form, re03_notice_sender |
| 6 | 통보상 기한(시정 기한·퇴거일·지급 기한) | timeline.deadline_date, notice.vacate_deadline_type, notice.period_vs_clause | re03_key_dates, re03_move_out_deadline, re03_notice_period |
| 7 | 고객 대응 | client.action | re03_response_status |
| 8 | 상대방 재응답 | counterparty.response | re03_counter_reaction |
| 9 | 현재(점유·인수인계·막힌 이유) | occupancy.status, occupancy.tenant_status, handover.*, process.blockage | re03_occupancy_tenant, re03_occupancy_landlord, re03_blockage |

판정에 쓰는 시간 계산: (deadline_date − notice_date) vs 계약서 통지 기간 → r3_np_shorter 재확인 / (contract_end − 현재) → 남은 기간 중 퇴거 요구(r3_ow_own_use·r3_ow_sale_buyer_wants_empty·r3_rld_early_exit) 여부 / deadline_date가 7일 이내 → r3_bk_time_pressure 없이도 시간 압박 문장 추가.

---

## K. Party / Relationship structure

| 당사자 유형 | 판별 값 | 관계·처리 |
|---|---|---|
| 직접 임차인 | r3_role_tenant | 계약 당사자=고객. 기본 경로 |
| 회사 명의 계약 거주자 | r3_role_company_staff | 계약 당사자=회사, 거주자=고객. contract_holder=company. 통보 상대·대응 주체가 회사이므로 "회사가 상대방에게 어떻게 대응하는지" 확인 문장(주의). r3_ac_company_delay·r3_cf_company_held와 연결 |
| 재임차인(전차인) | r3_role_subtenant | 집주인–원래 세입자–고객의 3자 관계(party.multi=true). 보증금 보관자=원래 세입자일 수 있음. 퇴거 통보(r3_dm_terminate·r3_dm_vacate_date)와 결합 시 전문가팀 진행 |
| 집주인 | r3_role_landlord | 고객이 통보를 받은 쪽(세입자가 해지 통보). 가족 소유 집을 관리하는 집주인 쪽 대리도 포함하며, 소유자 본인 위임 여부는 전문가 상담 단계에서 확인 |
| 세입자 쪽 대리 확인자 | r3_role_proxy | 계약 당사자=가족·지인. 세입자 경로 질문에 당사자 기준으로 답하도록 안내. 결과 문장은 "계약 당사자 본인 명의로 대응해야 하는 부분"을 구분 |
| 통보자: 상대방 본인 | r3_sd_party_self (또는 r3_nf_written_hand·r3_nf_post·r3_nf_messenger) | 통보 효력 판단의 기본값 |
| 통보자: 대리인 | r3_sd_agent | 위임 여부 미확인(notice.authority=unconfirmed) → 위임 서면 요청 안내 |
| 중개인 | r3_sd_broker, r3_nf_via_middle, r3_cr_shift_blame | 중개인은 계약 당사자가 아님. 중개인 전달만으로는 상대방 본인의 뜻이 확인되지 않음 → 본인 직접 확인(주의) |
| 관리사무소 | r3_sd_mgmt_office, r3_ar_mgmt_fee_dispute | 관리비·전기·수도는 관리사무소 관계, 임대료는 집주인 관계로 분리해 기록 |
| 새 집주인·매수인 | r3_ow_sale_new_owner, r3_ow_sale_buyer_wants_empty, r3_cr_shift_blame | 계약이 새 주인에게 이어지는지(contract.assignment_to_buyer) 확인 |
| 은행(담보권자) | r3_ow_bank_issue | 제3 이해관계자(party.multi=true) → 전문가팀 진행 |
| 제3 거주자 | r3_ol_third_party | 집주인 경로에서 세입자 외 점유자. 무단 재임대 의심 |
| 지급 주체: 회사 | r3_ac_company_delay | 임대료 지급자와 계약 당사자가 다를 수 있음 |

---

## L. Goal / Action / Response structure

**고객 목표 값**
- 우선 확인(client.priority_goal): notice_validity / vacate_timing / money_settlement / fact_dispute / sequencing — re03_confirm_goal
- 최종 목표(client.final_goal): keep_tenancy / vacate_with_settlement / terminate_without_penalty / recover_possession / claim_early_exit_penalty — re03_final_goal
- 정합성 검사: party.side=landlord인데 keep_tenancy·vacate_with_settlement 선택, 또는 party.side=tenant인데 recover_possession·claim_early_exit_penalty 선택 시 결과 화면에서 목표를 다시 확인하는 문장 표시

**고객 행동 값(client.action)**
- none / inquired / disputed / partial_compliance / negotiating — re03_response_status
- 보조: conduct.ongoing(r3_cd_admit_fixed=false, r3_cd_admit_ongoing=true), occupancy.status(preparing_to_move·vacated), payment.arrears_cause(withheld_for_counter_breach=의도적 보류)

**상대방 반응 값(counterparty.response)**

| L 구조 값 | 대응 value |
|---|---|
| 수락 | r3_cr_withdrawn (accepted_withdrawn) |
| 거부 | r3_cr_maintained (rejected_maintained), r3_et_tenant_disputes (disputes_clause) |
| 일부 수용 | r3_cr_new_terms (partial_accept_new_terms), r3_ow_compensation_offered (compensation_offered) |
| 연락 회피 | r3_cr_no_reply (no_reply_or_unclear), r3_ol_not_leaving·r3_bk_no_response (avoiding), r3_ol_no_contact·r3_rld_no_reason (contactable=false/limited) |
| 추가 요구 | r3_pc_damage_claim (penalty_plus_damages), r3_pc_amount_exceeds (exceeds) — 금액 요구 확대는 re03_claim_amount 원문으로 기록 |
| 책임 전가 | r3_cr_shift_blame (shifted_responsibility) |
| 새 조건 | r3_cr_new_terms (partial_accept_new_terms) |
| 법적 압박 | r3_cr_legal_threat (legal_action_threatened) |
| 합의 번복 | r3_gp_prior_agreement (reneging) |

---

## M. 결과 판정 데이터

### M-1. 위험 신호 표 (유지·보완)

| 판정 단계 | 신호 | 결과 화면 위험 문장 | 상태 |
|---|---|---|---|
| 전문가 권장 | `r3_oc_locked_out` | 계약 분쟁 중에 출입이나 전기·수도가 막힌 상태여서, 생활과 짐을 지키기 위한 대응을 서둘러 확인해야 합니다. | 유지 |
| 전문가 권장 | `r3_oc_belongings_threat` | 짐을 밖으로 내놓겠다는 말을 들은 상태여서, 그 날짜 전에 대응 방법을 확인하는 것이 좋습니다. | 유지 |
| 전문가 권장 | `r3_cr_legal_threat` | 상대방이 법원이나 공안 절차를 언급했거나 시작한 상태여서, 혼자 답하기 전에 전문가 확인이 필요합니다. | 유지 |
| 전문가 권장 | `r3_ow_bank_issue` | 집이 은행 담보 문제로 넘어갈 수 있다는 이야기가 있어, 보증금과 거주 기간에 미치는 영향을 별도로 확인해야 합니다. | 유지 |
| 전문가 권장 | `r3_role_subtenant` + (`r3_dm_terminate`\|`r3_dm_vacate_date`) | 집주인과 직접 계약이 없는 상태에서 퇴거 통보를 받아, 원래 세입자·집주인 사이 계약까지 함께 확인해야 합니다. | 유지 |
| 주의 | `r3_np_shorter` | 통보에서 준 기간이 계약서 조항보다 짧아 보여, 그 날짜를 그대로 따라야 하는지 확인이 필요합니다. | 유지 |
| 주의 | `r3_md_immediate` | 날짜 없이 바로 나가라는 통보여서, 계약서와 법에서 정한 통지 기간을 먼저 확인해야 합니다. | 유지 |
| 주의 | `r3_ds_forfeit` | 보증금을 전혀 돌려주지 않겠다는 이야기가 나온 상태여서, 계약서의 몰수 조항과 실제 위반 여부를 함께 확인해야 합니다. | 유지 |
| 주의 | `r3_ds_deduct_no_list` | 공제 내역 없이 보증금 일부를 빼겠다고 해, 항목과 금액을 서면으로 받아 두는 것이 좋습니다. | 유지 |
| 주의 | `r3_pc_amount_exceeds` | 요구 금액이 계약서 위약금 조항보다 큰 것으로 보여, 금액 계산 근거를 확인해야 합니다. | 유지 |
| 주의 | `r3_pc_no_clause` | 계약서에 위약금 조항이 없는데 금액을 요구받아, 그 금액의 근거를 확인해야 합니다. | 유지 |
| 주의 | `r3_pc_damage_claim` | 위약금 외에 손해배상까지 요구받아, 항목별로 실제 손해가 있는지 나누어 확인해야 합니다. | 유지 |
| 주의 | `r3_ar_paid_not_counted` | 이미 보낸 임대료가 반영되지 않은 상태여서, 송금 내역으로 사실관계를 먼저 정리해야 합니다. | 유지 |
| 주의 | `r3_fc_other_breached` / `r3_gp_counter_breach` | 상대방의 계약 위반이 통보에서 빠져 있어, 양쪽 위반 사실을 날짜순으로 정리해 둘 필요가 있습니다. | 유지 |
| 주의 | `r3_ac_withheld_repair` | 상대방이 약속을 지키지 않아 임대료를 보류한 상태여서, 보류 이유를 알린 기록과 상대방 위반 자료를 함께 확인해야 합니다. | 신규 |
| 주의 | `r3_cd_admit_ongoing` | 문제가 된 사용 방식이 지금도 이어지고 있어, 통보 내용이 그대로 인정될 가능성을 함께 봐야 합니다. | 유지 |
| 주의 | `r3_ow_sale_buyer_wants_empty` / `r3_ow_own_use` | 계약 기간이 남은 상태에서 상대방 사정으로 나가 달라는 요구여서, 계약이 새 주인에게 이어지는지와 보상 조건을 확인해야 합니다. | 유지 |
| 주의 | `r3_sd_broker` / `r3_sd_unknown` | 통보가 계약 상대방 본인의 뜻인지 확인되지 않아, 본인에게 직접 확인하는 것이 먼저입니다. | 유지 |
| 주의 | `r3_cr_shift_blame` | 상대방이 책임을 다른 쪽으로 돌리고 있어, 실제로 누구와 정리해야 하는지 계약서 당사자 기준으로 확인해야 합니다. | 신규 |
| 주의 | `r3_ol_not_leaving` / `r3_ol_third_party` | 세입자가 나가지 않거나 다른 사람이 살고 있어, 집을 돌려받는 절차를 서두르기 전에 계약과 통지 기록을 먼저 정리해야 합니다. | 유지 |
| 주의 | `r3_et_tenant_disputes` | 세입자가 조기 해지 조항의 적용을 다투고 있어, 서명된 조항과 설명한 기록을 함께 확인해야 합니다. | 신규 |
| 주의 | `r3_role_company_staff` | 계약 당사자가 회사여서, 회사가 상대방에게 어떻게 대응하고 있는지부터 확인해야 합니다. | 유지 |
| 확인 필요 | `r3_dm_unclear` | 상대방이 무엇을 요구하는지 정리되지 않아, 통보 원문부터 다시 확인해야 합니다. | 유지 |
| 확인 필요 | `r3_np_lang_unread` / `r3_md_lang_unclear` | 계약서나 통보가 베트남어라 핵심 조항과 날짜를 아직 확인하지 못했습니다. | 유지 |
| 확인 필요 | `r3_np_no_contract` | 계약서 사본이 없어, 통지 기간과 위약금 조건을 비교할 기준이 아직 없습니다. | 유지 |
| 확인 필요 | `r3_nf_oral` | 통보를 말로만 받아, 날짜와 요구 내용을 서면이나 메시지로 다시 받아 둘 필요가 있습니다. | 유지 |
| 확인 필요 | `r3_md_not_stated` | 퇴거 날짜가 정해지지 않아, 언제까지인지 상대방에게 확인해야 합니다. | 유지 |
| 확인 필요 | `r3_fc_cannot_compare` | 통보 내용과 실제를 아직 비교하지 못해, 자료를 모아 사실관계부터 정리해야 합니다. | 유지 |
| 확인 필요 | `r3_gp_no_proof_yet` / `r3_ev_none` | 실제와 다르다는 점을 보여 줄 자료가 아직 없어, 송금 내역과 메시지부터 모아야 합니다. | 유지 |
| 확인 필요 | `r3_pc_unknown` | 요구 금액의 계산 방법을 모르는 상태여서, 항목별 내역을 상대방에게 받아 둘 필요가 있습니다. | 유지 |
| 확인 필요 | `r3_cr_no_reply` | 대응 내용에 상대방 답이 없거나 뜻이 분명하지 않아, 직접 확인한 기록을 남겨야 합니다. | 보완(rd_via_broker 삭제에 따라 단독 신호로 정리) |
| 확인 필요 | `r3_ac_account_changed` / `r3_ac_fee_unclear` | 받는 계좌나 요금 계산이 분명하지 않아, 상대방에게 계좌와 계산 내역을 서면으로 받아 두는 것이 좋습니다. | 신규 |
| 확인 필요 | `r3_et_no_clause` | 계약서에 조기 해지 조항이 보이지 않아, 보증금과 남은 임대료를 어떤 기준으로 정리할지 먼저 확인해야 합니다. | 신규 |

복합 보완 신호(주의 1개로 계산):
- (`r3_cd_consented_before` 또는 `r3_gp_prior_agreement` 또는 `r3_ac_withheld_repair` 또는 `r3_rld_repair_claim`) 그리고 `r3_ev_side_agreement` 미선택 → "허락·합의·수리 요청을 보여 줄 기록이 아직 선택되지 않아, 메시지와 서면을 먼저 찾아 두는 것이 좋습니다."
- re03_key_dates상 기한이 7일 이내 → "통보에 적힌 기한이 가까워, 따를지 다툴지 기한 전에 정리해야 합니다."

### M-2. 판정 단계
1. **전문가 권장** — 전문가 권장 신호가 하나라도 있으면 표시. 일반 퍼널(자가 확인 STEP) 대신 "VFBCAI 전문가팀 진행" 안내를 먼저 보여 준다.
2. **주의** — 전문가 권장 신호가 없고 주의 신호(복합 보완 신호 포함)가 2개 이상.
3. **확인 필요** — 그 외.
- 결과 문장은 법적 결과를 단정하지 않고 "~확인이 필요합니다 / ~가능성을 함께 봐야 합니다 / ~것이 좋습니다"로 끝낸다.
- 위험 문장 노출 순서: 전문가 권장 → 주의 → 확인 필요, 같은 단계 안에서는 client.priority_goal과 관련된 문장을 먼저.

### M-3. 특수 사건 (VFBCAI 전문가팀 진행)
| 특수 사건 | 판별 조건 | 이유 |
|---|---|---|
| 자력 퇴거·생활 차단 | r3_oc_locked_out, r3_oc_belongings_threat | 생활·재산 보호를 위한 즉시 대응이 필요한 상태 |
| 법적 절차 언급·개시 | r3_cr_legal_threat | 소송·공안 절차 진행 가능성 — 고객 단독 답변 위험 |
| 담보 실행·소유권 이전 가능성 | r3_ow_bank_issue | 은행 등 제3 이해관계자 개입(다수 당사자) |
| 3자 임대 구조 퇴거 | r3_role_subtenant + (r3_dm_terminate\|r3_dm_vacate_date) | 집주인–원래 세입자–고객 계약을 함께 검토해야 하는 다수 당사자 사건 |

### M-4. 1차 결과 "핵심 확인 결과" 3칸 문장 규칙 (유지)
- **상황**: `re03_my_role` + `re03_demand_type` → "[역할]로서 상대방에게서 [요구 내용] 통보를 받은 상황입니다."
  - 역할: r3_role_tenant "임차인", r3_role_company_staff "회사 명의 계약의 거주자", r3_role_subtenant "원래 세입자에게서 다시 빌린 거주자", r3_role_landlord "집주인", r3_role_proxy "세입자인 가족·지인을 대신해 확인하는 분"
  - 요구 내용: r3_dm_fix_breach "기간 내 시정 요구", r3_dm_terminate "계약 해지", r3_dm_vacate_date "날짜를 정한 퇴거", r3_dm_money_claim "위약금·손해배상 요구", r3_dm_unclear "요구 내용이 분명하지 않은"
- **확인 목표**: r3_cg_validity "통보가 계약서 조항과 통지 기간에 맞는지 확인하는 것이 먼저입니다." / r3_cg_move_timing "집을 비워야 하는 시점과 그 전에 할 일을 확인하는 것이 먼저입니다." / r3_cg_money "보증금 정리와 위약금·손해배상 여부를 확인하는 것이 먼저입니다." / r3_cg_fact_gap "통보 사유 중 사실과 다른 부분을 정리하는 것이 먼저입니다." / r3_cg_order "무엇부터 진행할지 순서를 정하는 것이 먼저입니다."
- **대응·자료**: r3_rs_none "아직 상대방에게 답하지 않은 상태로, 답하기 전에 계약서와 통보 원문을 나란히 확인하는 것이 좋습니다." / r3_rs_inquired "이유를 물어본 상태로, 상대방의 답을 서면이나 메시지로 받아 두는 것이 좋습니다." / r3_rs_disputed "사실과 다르다고 말한 상태로, 이를 뒷받침할 송금 내역·메시지·사진을 모아야 합니다." / r3_rs_complied_part "요구 일부를 이행한 상태로, 이행한 날짜와 내용을 보여 줄 기록이 필요합니다." / r3_rs_negotiating "조건을 협의 중인 상태로, 합의한 날짜와 금액은 반드시 서면으로 남겨야 합니다." — r3_rs_none 외에는 "그 기록을 남겨 두는 것이 중요합니다."를 붙인다.

### M-5. "지금 확인해 보세요" STEP 3개 (유지)
1. **계약서와 통보를 나란히 놓고 비교하기** — 계약서에서 해지 사유·통지 기간·위약금·보증금 반환 조항을 찾아, 통보에 적힌 날짜와 요구가 그 조항과 맞는지 표시해 보세요. 베트남어 계약서라면 해당 조항만이라도 번역해 두세요.
2. **사실을 보여 줄 자료를 날짜순으로 모으기** — 통보 원본이나 메시지 캡처, 임대료·관리비 송금 내역, 상대방·중개인과 주고받은 대화, 입주 때와 지금의 집 상태 사진을 한곳에 모아 날짜순으로 정리해 두세요.
3. **답변과 합의는 기록이 남는 방법으로 하기** — 상대방에게 답하거나 날짜·금액을 합의할 때는 서면이나 메시지로 남기고, 집을 비우게 된다면 보증금 정리 내용·집 상태 확인·열쇠 반납을 기록으로 남긴 뒤, 새 주소에서 임시거주 신고(공안)를 다시 해야 하는지도 확인해 두세요.
- STEP 순서 조정: r3_ev_none 또는 r3_gp_no_proof_yet이면 STEP 2를 1번으로 올린다. 집주인 경로(party.side=landlord)는 STEP 3의 "새 주소 임시거주 신고" 대신 "세입자 퇴거 뒤 임시거주 신고 정리 여부"를 확인하도록 문장을 바꾼다.


---

# VFBCAI_REAL_ESTATE_CONTENT_PACK_MASTER_v1 — RE04 거주 중 문제

- CASE: RE04 "거주 중 문제"
- Q1(공용, 확정) 선택지: "살고 있는 집의 수리·하자·관리비·이웃 문제로 상대방과 해결이 안 되고 있습니다."
- 입력: pack-RE04.md (Content Pack v1). 질문·선택지 문장과 value는 원칙적으로 유지하고, 바꾼 곳에는 `변경:` 한 줄을 남겼다.
- 구조: 1차 = Q1 + CASE 질문 4개 / 2차 = 노드 24개(항상 노출 8, 유형별 상세 5, 유형별 추가 4, 통보 여부 분기 2, 조건부 후속 5). 대표 경로 2차 노출 11~13문항(조건부 후속이 모두 열리는 최대 경로 15문항).
- value 규칙: 질문별 접두사로 팩 전체에서 중복 없음. 엔진 공용 "위에 내용이 없거나 설명이 필요합니다 → 직접 입력"은 모든 single/multi 질문에 자동으로 붙으므로 표에 쓰지 않는다.
- meaning 표기: `key=value; key=value`. key는 Situation Profile 필드 경로이며, 같은 key는 CASE 전체에서 같은 뜻으로만 쓴다.

---

## B. 전문가 프로파일링 구조

거주 중 분쟁에서 부동산 전문가는 첫 상담에서 "무엇이 고장·문제인지"보다 먼저 "누구에게, 어떤 계약 근거로, 언제 무엇을 요구했고, 상대방이 어떻게 답했으며, 고객이 이미 무엇을 했는지(자비 수리·월세 보류)"를 확인한다. 아래 축이 모두 채워져야 책임 소재와 다음 행동 순서를 판단할 수 있다.

| 사실 축 | 전문가가 확인하는 것 | Profile 필드 | 채우는 질문 id |
|---|---|---|---|
| 목표 | 지금 가장 먼저 알고 싶은 것 | goal.primary_check | re04_confirm_goal |
| 시작점 | 어떤 종류의 거주 중 문제인가 | issue.type | re04_issue_type |
| 현재 단계 | 문제의 세부 상태·심각도 | issue.repair_item / counterparty.claim / issue.fee_problem / issue.third_party_problem / issue.entry_type / impact.living | re04_repair_detail, re04_defect_claim, re04_fee_detail, re04_neighbor_detail, re04_entry_detail, re04_living_impact |
| 당사자 | 고객이 실제로 상대하는 사람(개인 집주인·대행·법인·회사 명의·원 임차인) | party.counterparty_type | re04_counterparty |
| 관계 | 직접 계약인지, 중간에 중개인·관리사무소·회사가 끼어 있는지 | party.counterparty_type, notice.channel, contract.access_barrier | re04_counterparty, re04_notify_status, re04_contract_access |
| 계약 | 서면 여부, 이 문제에 대한 부담 조항, 확인 가능 여부 | contract.clause_allocation, contract.access_barrier | re04_contract_clause, re04_contract_access |
| 지급 | 월세 지급 상태, 고객이 먼저 쓴 비용, 다툼이 된 요금 | payment.rent_status, client.self_repair, payment.self_repair_detail, payment.fee_claim_detail | re04_rent_status, re04_self_repair, re04_self_repair_amount, re04_fee_amount |
| 상대방 행동 | 상대방이 한 주장·행동(책임 전가, 무단 출입, 요금 전가) | counterparty.claim, issue.entry_type, issue.fee_problem | re04_defect_claim, re04_entry_detail, re04_fee_detail |
| 고객 행동 | 알렸는지, 어떻게 알렸는지, 자비 수리·월세 보류를 했는지 | notice.channel, client.not_notified_reason, client.self_repair, payment.rent_status, client.withhold_notice | re04_notify_status, re04_not_told_reason, re04_self_repair, re04_rent_status, re04_withhold_notice |
| 증거 | 입주 당시 상태 기록, 날짜 있는 사진·메시지·영수증, 원인 확인서 | evidence.handover_record, evidence.items | re04_handover_record, re04_evidence |
| 시간축 | 문제 시작, 처음 알린 날, 약속·통보 날짜, 계약 만료 | timeline.problem_start, timeline.deadline_type, timeline.key_dates | re04_since_when, re04_deadline, re04_key_dates |
| 상대방 반응 | 요청 후 수락·거부·일부 수용·회피·보복성 통보 | counterparty.response, counterparty.threat | re04_other_response, re04_threat_detail |
| 위험 | 연체로 몰릴 위험, 단전·단수, 퇴거 요구, 임시거주 신고, 보증금 공제 | payment.rent_status, client.withhold_notice, counterparty.threat, fact.claim_vs_actual | re04_rent_status, re04_withhold_notice, re04_threat_detail, re04_fact_compare |
| 막힌 이유 | 해결이 멈춘 가장 큰 원인 | blockage.main | re04_blockage |
| 최종 목표 | 수리 후 계속 거주 / 비용 정산 / 보증금 보호 / 규칙 재합의 / 퇴거 | goal.final | re04_final_goal |

---

## C. 1차 노드 (phase 1)

### re04_issue_type
- phase: 1 / kind: single / show_if: 항상
- profile_field: issue.type
- 질문: 지금 상대방과 해결되지 않고 있는 문제는 어떤 것인가요?

| value | 선택지 | meaning |
|---|---|---|
| `it_repair_refused` | 누수·전기·에어컨·온수기 같은 설비가 고장 났는데, 상대방이 수리해 주지 않거나 계속 미루고 있습니다. | issue.type=repair_refused; counterparty.response=delay_or_refuse_repair |
| `it_prior_defect_blamed` | 입주하기 전부터 있던 하자인데, 상대방이 제가 망가뜨렸다며 수리비나 책임을 저에게 넘기고 있습니다. | issue.type=prior_defect_blamed; issue.defect_origin=pre_movein(client_claim); counterparty.response=shift_blame |
| `it_fee_dispute` | 관리비·전기·수도 요금의 금액이 이상하거나, 누가 내야 하는지를 두고 상대방과 다투고 있습니다. | issue.type=fee_dispute |
| `it_neighbor_management` | 이웃이나 관리사무소 문제로 생활이 어려운데, 집주인은 계약과 관계없다며 해결하지 않고 있습니다. | issue.type=neighbor_management; party.third_party=neighbor_or_management; counterparty.response=disclaim |
| `it_landlord_entry` | 집주인이나 중개인이 미리 알리지 않고 집에 들어왔거나, 원할 때 들어오겠다고 요구하고 있습니다. | issue.type=landlord_entry; counterparty.action=entry_without_notice |

### re04_since_when
- phase: 1 / kind: single / show_if: 항상
- profile_field: timeline.problem_start
- 질문: 이 문제는 언제부터 이어지고 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `sw_within_week` | 1주일 안쪽에 처음 생긴 문제이고, 아직 상대방에게 한두 번 말해 본 정도입니다. | timeline.problem_start=within_1w; timeline.duration=short |
| `sw_within_month` | 몇 주 전부터 이어지고 있고, 여러 번 말했지만 아직 해결되지 않았습니다. | timeline.problem_start=within_1m; notice.repeated=yes |
| `sw_over_month` | 한 달 넘게 계속되고 있고, 그동안 생활의 불편이나 비용이 쌓이고 있습니다. | timeline.problem_start=over_1m; impact.accumulating=yes |
| `sw_since_movein` | 입주할 때부터 있던 문제이고, 처음부터 계속 말해 왔지만 그대로입니다. | timeline.problem_start=at_movein; issue.defect_origin=pre_movein(client_claim) |
| `sw_recurring` | 한 번 고쳤거나 정리되었는데, 얼마 지나지 않아 같은 문제가 다시 생겼습니다. | timeline.problem_start=recurring; issue.prior_fix=failed |

### re04_notify_status
- phase: 1 / kind: single / show_if: 항상
- profile_field: notice.channel
- 질문: 이 문제를 상대방에게 어떻게 알리셨나요?

| value | 선택지 | meaning |
|---|---|---|
| `nt_not_told` | 아직 상대방에게 정식으로 알리지 않았고, 사진이나 기록만 모아 두었습니다. | notice.channel=none; notice.record=none; evidence.collecting=yes |
| `nt_verbal_only` | 전화하거나 직접 만나서 말로만 알렸고, 따로 남아 있는 기록은 없습니다. | notice.channel=verbal; notice.record=none |
| `nt_message_sent` | 잘로(Zalo)·카카오톡·이메일 등 메시지로 알렸고, 보낸 기록이 날짜와 함께 남아 있습니다. | notice.channel=message; notice.record=dated |
| `nt_formal_request` | 문제 내용과 해결 기한을 적어, 서면이나 이메일로 정식으로 요청했습니다. | notice.channel=formal_written; notice.record=dated; notice.deadline_set=yes |
| `nt_via_agent` | 중개인이나 관리사무소를 통해 전달했고, 상대방에게 직접 말하지는 않았습니다. | notice.channel=via_intermediary; notice.delivery_confirmed=unknown |

### re04_confirm_goal
- phase: 1 / kind: single / show_if: 항상
- profile_field: goal.primary_check
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?

| value | 선택지 | meaning |
|---|---|---|
| `cg_who_responsible` | 이 문제를 고치거나 비용을 내야 하는 쪽이 누구인지, 계약서 기준으로 확인하고 싶습니다. | goal.primary_check=responsibility |
| `cg_how_to_request` | 상대방에게 어떤 방법과 내용으로 요구해야 기록이 남고 효과가 있는지 확인하고 싶습니다. | goal.primary_check=request_method |
| `cg_self_repair_cost` | 제가 먼저 고치거나 낸 비용을, 월세나 보증금에서 정산받을 수 있는지 확인하고 싶습니다. | goal.primary_check=cost_recovery |
| `cg_deposit_risk` | 이 문제 때문에 나중에 보증금을 돌려받지 못하거나, 계약이 끝날 위험이 있는지 확인하고 싶습니다. | goal.primary_check=deposit_contract_risk |
| `cg_order_unsure` | 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다. | goal.primary_check=sequence |

---

## D. 2차 노드 — 문제 유형별 상세 (re04_issue_type 값에 따라 1개만 노출)

### re04_repair_detail
- phase: 2 / kind: single / show_if: re04_issue_type = it_repair_refused
- profile_field: issue.repair_item
- 질문: 고장 난 곳은 어디이고, 지금 어떤 상태인가요?

| value | 선택지 | meaning |
|---|---|---|
| `rd_water_leak` | 천장·벽·배관에서 물이 새고 있고, 곰팡이나 가구 손상까지 생기고 있습니다. | issue.repair_item=water_leak; impact.secondary_damage=yes |
| `rd_electric_fault` | 차단기가 자주 내려가거나 콘센트·조명이 작동하지 않아, 감전이나 화재가 걱정됩니다. | issue.repair_item=electric; risk.safety=yes |
| `rd_aircon_heater` | 에어컨이나 온수기가 고장 나서, 냉방이나 온수를 전혀 쓰지 못하고 있습니다. | issue.repair_item=aircon_heater; impact.essential_use_lost=yes |
| `rd_door_window` | 출입문 잠금장치나 창문·방범창이 고장 나, 문단속이 제대로 되지 않습니다. | issue.repair_item=door_window; risk.safety=yes |
| `rd_included_appliance` | 계약에 포함된 냉장고·세탁기·가구가 고장 났고, 수리나 교체를 요청한 상태입니다. | issue.repair_item=included_appliance; contract.item_included=yes |

### re04_defect_claim
- phase: 2 / kind: single / show_if: re04_issue_type = it_prior_defect_blamed
- profile_field: counterparty.claim
- 질문: 상대방은 어떤 하자를 제 책임이라고 말하고 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `dc_surface_damage` | 벽·바닥·문에 원래 있던 흠집이나 얼룩을, 제가 살면서 생긴 것이라고 합니다. | counterparty.claim=surface_damage_by_tenant |
| `dc_equipment_breakdown` | 처음부터 상태가 좋지 않던 설비가 고장 나자, 제가 잘못 써서 망가졌다고 합니다. | counterparty.claim=misuse_breakdown |
| `dc_mold_leak` | 입주 전부터 있던 누수나 곰팡이를, 제가 환기나 관리를 하지 않아 생겼다고 합니다. | counterparty.claim=poor_maintenance_mold |
| `dc_missing_items` | 처음부터 없던 비품이나 물건을, 제가 사용하다가 잃어버렸다고 합니다. | counterparty.claim=missing_inventory |
| `dc_deposit_deduction` | 이 하자 비용을 계약이 끝날 때 보증금에서 빼겠다고 이미 말했습니다. | counterparty.claim=defect_cost; counterparty.threat=deposit_deduction_announced |

### re04_fee_detail
- phase: 2 / kind: single / show_if: re04_issue_type = it_fee_dispute
- profile_field: issue.fee_problem
- 질문: 어떤 요금이, 어떤 점에서 문제가 되고 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `fd_electric_rate` | 전기요금이 전력회사 청구 금액보다 높은 단가로 계산되어 청구되고 있습니다. | issue.fee_problem=rate_markup; fee.item=electricity |
| `fd_payer_shift` | 계약상 집주인이 내기로 한 관리비나 요금을, 저에게 내라고 요구하고 있습니다. | issue.fee_problem=payer_shift; contract.fee_payer=landlord(client_claim) |
| `fd_unilateral_increase` | 계약 기간 중인데, 관리비나 요금 단가를 미리 합의 없이 올렸습니다. | issue.fee_problem=unilateral_increase; contract.term_status=ongoing |
| `fd_prior_arrears` | 집주인이나 전 세입자가 밀린 요금 때문에, 전기·수도가 끊기거나 끊긴다는 안내를 받았습니다. | issue.fee_problem=third_party_arrears; risk.utility_cut=notified_or_done |
| `fd_no_breakdown` | 매달 금액만 통보받고, 계량기 수치나 청구서 원본은 받지 못하고 있습니다. | issue.fee_problem=no_breakdown; evidence.original_bill=none |

### re04_neighbor_detail
- phase: 2 / kind: single / show_if: re04_issue_type = it_neighbor_management
- profile_field: issue.third_party_problem
- 질문: 이웃이나 관리사무소와 관련해 어떤 일이 이어지고 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `nd_upstairs_leak` | 위층이나 옆집에서 물이 새어 들어오는데, 집주인과 그 집이 서로 책임을 미루고 있습니다. | issue.third_party_problem=neighbor_leak; party.multi=yes; counterparty.response=mutual_blame |
| `nd_noise_smell` | 이웃의 소음·담배 냄새·공사가 계속되는데, 관리사무소에 말해도 달라지지 않습니다. | issue.third_party_problem=nuisance; party.third_party=neighbor; management.response=ineffective |
| `nd_management_restriction` | 관리사무소가 출입카드·주차·이사·택배 등을 막거나 제한하고 있습니다. | issue.third_party_problem=management_restriction; party.third_party=management_office |
| `nd_common_facility` | 엘리베이터·공용 배관·주차장 같은 공용 시설 고장으로, 생활에 계속 지장이 있습니다. | issue.third_party_problem=common_facility; party.third_party=management_office |
| `nd_condition_mismatch` | 계약할 때 설명받은 건물 조건과 실제가 달라 집주인에게 말했지만, 건물 문제라며 관여하지 않습니다. | issue.third_party_problem=condition_mismatch; counterparty.response=disclaim; contract.representation_gap=yes |

### re04_entry_detail
- phase: 2 / kind: single / show_if: re04_issue_type = it_landlord_entry
- profile_field: issue.entry_type
- 질문: 집주인이나 중개인의 출입은 어떻게 이루어졌나요?

| value | 선택지 | meaning |
|---|---|---|
| `ed_entered_absent` | 제가 없을 때 알리지 않고 들어왔고, 물건이 옮겨져 있거나 들어온 흔적이 남아 있었습니다. | issue.entry_type=entered_while_absent; evidence.entry_trace=yes |
| `ed_entered_present` | 미리 연락 없이 찾아와, 제가 있는 상태에서 동의 없이 집 안으로 들어왔습니다. | issue.entry_type=entered_without_consent |
| `ed_viewing_demand` | 집을 팔거나 다음 세입자를 구한다며, 집을 보여 달라는 요구를 자주 하고 있습니다. | issue.entry_type=viewing_demand; counterparty.plan=sale_or_relet |
| `ed_key_retained` | 집주인이 열쇠나 비밀번호를 그대로 가지고 있고, 제가 바꾸지 못하게 하고 있습니다. | issue.entry_type=key_retained; client.lock_change=blocked |
| `ed_unilateral_device` | 집 안이나 현관에 카메라를 달거나 잠금장치를 바꾸는 등, 저와 상의 없이 조치했습니다. | issue.entry_type=unilateral_device; risk.privacy=yes |

---

## E. 2차 노드 — 당사자·계약 근거

### re04_counterparty  (추가)
- phase: 2 / kind: single / show_if: 항상
- profile_field: party.counterparty_type
- 질문: 이 문제로 실제로 이야기하고 있는 상대방은 누구인가요?
- 변경: 추가 — 요구 대상·보증금 반환 주체·회사 명의/재임대 여부는 책임 판단의 출발점인데 v1에는 계약서를 확인 못 한 경우에만 일부 드러났음.

| value | 선택지 | meaning |
|---|---|---|
| `cp_individual_direct` | 개인 집주인과 직접 계약했고, 이 문제도 집주인에게 직접 이야기하고 있습니다. | party.counterparty_type=individual_owner; party.contract_with=owner; party.intermediary=none |
| `cp_agent_managed` | 집주인은 따로 있지만, 중개인이나 관리 대행업체가 월세와 수리를 대신 맡아 관리하고 있습니다. | party.counterparty_type=agent_for_owner; party.contract_with=owner; party.intermediary=agent; party.agent_authority=unverified |
| `cp_company_landlord` | 집주인이 개인이 아니라 임대 회사·법인이고, 그 회사 담당자와 연락하고 있습니다. | party.counterparty_type=corporate_owner; party.contract_with=company |
| `cp_employer_lease` | 제가 다니는 회사 명의로 계약해서, 회사 담당자와 집주인 사이에서 이야기가 오가고 있습니다. | party.counterparty_type=owner_via_employer; party.lessee=employer; party.client_role=occupant |
| `cp_sublease` | 집주인이 아니라 원래 임차인에게서 다시 빌린 집이라, 그 사람과 이야기하고 있습니다. | party.counterparty_type=original_tenant; party.structure=sublease; party.multi=yes |

### re04_contract_clause
- phase: 2 / kind: single / show_if: 항상
- profile_field: contract.clause_allocation
- 질문: 임대차 계약서에는 이 문제(수리·하자·관리비·요금·출입)에 대해 어떻게 적혀 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `cl_landlord_clear` | 서면 계약서에, 이 문제는 집주인이 책임지거나 부담한다고 분명히 적혀 있습니다. | contract.form=written; contract.clause_allocation=landlord |
| `cl_tenant_clear` | 서면 계약서에, 이 문제는 임차인이 부담한다고 적혀 있어 제가 불리할 수 있습니다. | contract.form=written; contract.clause_allocation=tenant |
| `cl_vague` | 관련 조항은 있지만, '작은 수리'·'정상적인 사용'처럼 기준이 애매하게 적혀 있습니다. | contract.form=written; contract.clause_allocation=ambiguous |
| `cl_absent` | 계약서는 있지만, 이 문제에 대한 내용은 없거나 아직 찾지 못했습니다. | contract.form=written; contract.clause_allocation=none_found |
| `cl_cannot_check` | 계약서가 베트남어로만 되어 있거나 사본이 없어, 해당 조항을 직접 확인하지 못했습니다. | contract.clause_allocation=unverified |

### re04_contract_access
- phase: 2 / kind: single / show_if: re04_contract_clause = cl_cannot_check
- profile_field: contract.access_barrier
- 질문: 계약서 내용을 직접 확인하지 못하는 이유는 무엇인가요?
- 변경: `ca_sublease` 삭제 — 재임대 관계는 re04_counterparty `cp_sublease`로 항상 확인하므로 중복 수집 방지.

| value | 선택지 | meaning |
|---|---|---|
| `ca_vn_only` | 계약서는 가지고 있지만, 베트남어로만 되어 있어 조항을 읽지 못했습니다. | contract.form=written; contract.language=vi_only; contract.copy_holder=client |
| `ca_company_lease` | 회사 명의로 계약해서, 저는 실제로 사는 사람이지만 계약서는 회사 담당자만 가지고 있습니다. | contract.form=written; contract.copy_holder=employer; party.lessee=employer |
| `ca_no_copy` | 서명은 했지만 사본을 받지 못했고, 원본(공증본 포함)은 집주인이나 중개인만 가지고 있습니다. | contract.form=written; contract.copy_holder=landlord_or_agent; contract.client_copy=none |
| `ca_verbal_only` | 정식 계약서 없이, 메시지나 말로만 월세와 조건을 정했습니다. | contract.form=verbal_or_message; contract.client_copy=none |

---

## F. 1차 → 2차 adaptive branching

2차 시작은 항상 `re04_issue_type`의 유형별 상세 1개 → `re04_counterparty` → `re04_contract_clause` 순서이고, 이후 경로는 아래 1차 답 조합으로 갈라진다. 마지막 묶음 `re04_rent_status → re04_deadline → re04_key_dates → re04_evidence → re04_blockage → re04_final_goal`은 모든 경로 공통이다.

| 1차 답 조합 | 세부 사건(2차 경로 이름) | 이어지는 질문 id 순서 | 경로 핵심 확인 사실 |
|---|---|---|---|
| it_repair_refused + nt_message_sent/nt_formal_request + (cg_self_repair_cost) | A1. 수리 요청 → 지연·거절 → 자비 수리 → 정산 요구 | re04_repair_detail → re04_counterparty → re04_contract_clause → re04_other_response → re04_self_repair → re04_self_repair_amount → re04_rent_status → (re04_withhold_notice) → re04_deadline → re04_key_dates → re04_evidence → re04_blockage → re04_final_goal | 요청 기록 날짜, 상대방 동의 여부, 영수증, 정산 방식 |
| it_repair_refused + nt_verbal_only/nt_not_told + (sw_over_month/sw_recurring; 1차 경로는 앞 두 항목만) | A2. 말로만 요청 → 장기 방치 → 월세 보류 검토 | re04_repair_detail → re04_counterparty → re04_contract_clause → re04_not_told_reason 또는 re04_other_response → re04_self_repair → re04_rent_status → (re04_withhold_notice) → re04_deadline → re04_key_dates → re04_evidence → re04_blockage → re04_final_goal | 기록 없는 요청, 손상 누적, 연체로 몰릴 위험 |
| it_prior_defect_blamed + (cg_deposit_risk) | B. 입주 전 하자 → 임차인 책임 주장 → 보증금 공제 예고 | re04_defect_claim → re04_counterparty → re04_handover_record → re04_contract_clause → re04_other_response → (re04_fact_compare / re04_threat_detail) → re04_rent_status → re04_deadline → re04_key_dates → re04_evidence → re04_blockage → re04_final_goal | 입주 당시 상태 기록, 상대방 주장과 실제 비교, 계약 만료일 |
| it_fee_dispute | C. 요금 청구 → 단가·부담자 다툼 → 단전·단수 예고 | re04_fee_detail → re04_fee_amount → re04_counterparty → re04_contract_clause → re04_other_response → (re04_threat_detail) → re04_rent_status → (re04_withhold_notice) → re04_deadline → re04_key_dates → re04_evidence → re04_blockage → re04_final_goal | 계약서 요금 기준, 원 청구서, 공제 송금 여부, 끊김 예정일 |
| it_neighbor_management | D. 이웃·관리사무소 문제 → 집주인 관여 거부 → 다수 당사자 | re04_neighbor_detail → re04_living_impact → re04_counterparty → re04_contract_clause → re04_other_response → re04_rent_status → re04_deadline → re04_key_dates → re04_evidence → re04_blockage → re04_final_goal | 원인 제공자(이웃·공용 시설), 집주인 책임 범위, 생활 영향 |
| it_landlord_entry | E. 무단 출입·장치 설치 → 사생활 침해 → 출입 규칙 재합의 | re04_entry_detail → re04_living_impact → re04_counterparty → re04_contract_clause → re04_other_response → (re04_threat_detail) → re04_rent_status → re04_deadline → re04_key_dates → re04_evidence → re04_blockage → re04_final_goal | 출입 날짜·횟수, 손상·분실 여부, 출입 조항 |
| (모든 유형) + re04_other_response = or_counter_threat | X. 요청 → 보복성 통보(퇴거·보증금·단전·임시거주 신고) | … → re04_other_response → re04_threat_detail → re04_rent_status → re04_deadline(dl_vacate_demand 등) → re04_key_dates → … | 통보 내용·날짜, 계약 해지 조항, 체류 영향 |

분기 규칙 요약
- `re04_notify_status = nt_not_told` → `re04_not_told_reason`, 그 외 → `re04_other_response`.
- `re04_other_response = or_counter_threat` → `re04_threat_detail` / `= or_refused_blame` → `re04_fact_compare`.
- `re04_issue_type = it_repair_refused` → `re04_self_repair`(+금액 텍스트) / `= it_prior_defect_blamed` → `re04_handover_record` / `= it_fee_dispute` → `re04_fee_amount` / `= it_neighbor_management|it_landlord_entry` → `re04_living_impact`.
- `re04_rent_status = rs_withholding|rs_deducted_cost` → `re04_withhold_notice`.

---

## G. 2차 노드 — 상대방 반응·유형별 근거·비용·영향

### re04_not_told_reason
- phase: 2 / kind: single / show_if: re04_notify_status = nt_not_told
- profile_field: client.not_notified_reason
- 질문: 아직 상대방에게 정식으로 알리지 않은 이유는 무엇인가요?

| value | 선택지 | meaning |
|---|---|---|
| `ntr_fear_relation` | 관계가 나빠지거나 계약에 불이익이 생길까 봐, 말을 꺼내지 못하고 있습니다. | client.not_notified_reason=fear_retaliation |
| `ntr_who_to_contact` | 집주인·중개인·관리사무소 중 누구에게 말해야 하는지 몰라 미루고 있습니다. | client.not_notified_reason=recipient_unclear; party.counterparty_type=unclear |
| `ntr_language` | 베트남어로 어떻게 설명하고 요구해야 할지 몰라, 아직 연락하지 못했습니다. | client.not_notified_reason=language |
| `ntr_collecting_first` | 먼저 사진과 자료를 모은 뒤, 한 번에 정리해서 알리려고 준비하고 있습니다. | client.not_notified_reason=preparing_evidence; evidence.collecting=yes |

### re04_other_response
- phase: 2 / kind: single / show_if: re04_notify_status = nt_verbal_only|nt_message_sent|nt_formal_request|nt_via_agent
- profile_field: counterparty.response
- 질문: 알린 뒤, 상대방은 어떻게 반응했나요?

| value | 선택지 | meaning |
|---|---|---|
| `or_agreed_stalled` | 해결하겠다고 말은 했지만, 날짜를 정하지 않은 채 지금까지 그대로입니다. | counterparty.response=accept_no_action; counterparty.date_committed=no |
| `or_partial_offer` | 비용 일부만 부담하겠다거나, 제가 먼저 고치면 나중에 정산해 주겠다고 말로만 했습니다. | counterparty.response=partial_accept; counterparty.offer_record=verbal_only |
| `or_refused_blame` | 자기 책임이 아니라며 거절했고, 오히려 저에게 비용이나 책임을 넘기고 있습니다. | counterparty.response=refuse_shift_blame |
| `or_counter_threat` | 계속 문제 삼으면 계약을 끝내거나 보증금을 돌려주지 않겠다는 말을 했습니다. | counterparty.response=retaliation_threat |
| `or_silent_or_relay` | 답이 없거나, 중개인·관리사무소가 전달했다고만 하고 상대방의 답은 듣지 못했습니다. | counterparty.response=no_reply_or_relay_only; notice.delivery_confirmed=no |

### re04_threat_detail
- phase: 2 / kind: single / show_if: re04_other_response = or_counter_threat
- profile_field: counterparty.threat
- 질문: 상대방은 구체적으로 무엇을 하겠다고 했나요?
- 변경: `td_cut_utilities` 문장 수정 — "끊겠다고 했다"와 "이미 끊었다"가 한 선택지에 섞여 특수 사건 판정이 불가능했음. 실행된 경우만 남기고, 끊김 예정 통보는 re04_deadline `dl_utility_cutoff`로 받는다.

| value | 선택지 | meaning |
|---|---|---|
| `td_vacate_early` | 계약 기간이 남았는데, 정해진 날까지 집을 비우라고 했습니다. | counterparty.threat=early_vacate_demand; contract.term_status=ongoing |
| `td_keep_deposit` | 계약이 끝나면 보증금의 일부나 전부를 돌려주지 않겠다고 했습니다. | counterparty.threat=withhold_deposit |
| `td_raise_or_no_renew` | 다음 달부터 월세를 올리거나, 계약이 끝나면 재계약하지 않겠다고 했습니다. | counterparty.threat=rent_raise_or_no_renewal |
| `td_cut_utilities` | 전기·수도·인터넷을 끊거나 출입카드를 막겠다고 했고, 그중 일부는 이미 실제로 끊기거나 막혔습니다. | counterparty.threat=utility_access_cut; counterparty.action=utility_cut_executed |
| `td_residence_registration` | 임시거주 신고를 해 주지 않거나, 이미 한 신고를 정리하겠다고 했습니다. | counterparty.threat=residence_registration; risk.immigration_link=yes |

### re04_fact_compare
- phase: 2 / kind: single / show_if: re04_other_response = or_refused_blame
- profile_field: fact.claim_vs_actual
- 질문: 상대방이 주장하는 내용은 실제 있었던 일과 비교하면 어떤가요?
- 변경: show_if에서 `or_counter_threat` 제외 — 보복성 통보는 사실 주장이 아니라 re04_threat_detail로 확인하며, 한 경로에 두 후속이 겹쳐 문항 수가 13을 넘던 문제 해소.

| value | 선택지 | meaning |
|---|---|---|
| `fc_mostly_true` | 상대방 말이 대체로 맞고, 저에게도 일부 책임이 있다고 생각합니다. | fact.claim_vs_actual=mostly_true; client.admits_partial=yes |
| `fc_partly_true` | 일부는 맞지만, 원인이나 생긴 시점, 금액이 실제와 다르게 말하고 있습니다. | fact.claim_vs_actual=partly_true; fact.dispute_point=cause_time_amount |
| `fc_false_with_proof` | 상대방 주장은 실제와 크게 다르고, 이를 보여 줄 날짜 있는 기록이 있습니다. | fact.claim_vs_actual=false; evidence.counter_proof=dated |
| `fc_false_no_proof` | 상대방 주장은 실제와 다르지만, 이를 보여 줄 기록이 부족합니다. | fact.claim_vs_actual=false; evidence.counter_proof=insufficient |
| `fc_no_specific_claim` | 상대방이 구체적인 이유 없이 거절만 하고 있어, 비교할 내용이 없습니다. | fact.claim_vs_actual=no_specific_claim |

### re04_handover_record
- phase: 2 / kind: single / show_if: re04_issue_type = it_prior_defect_blamed
- profile_field: evidence.handover_record
- 질문: 입주할 때 집 상태는 어떻게 기록해 두셨나요?

| value | 선택지 | meaning |
|---|---|---|
| `hr_signed_checklist` | 집 상태와 비품을 적은 인수인계서(체크리스트)에 저와 상대방이 함께 서명했습니다. | evidence.handover_record=signed_checklist; evidence.mutual_ack=yes |
| `hr_dated_photos_only` | 서명한 문서는 없지만, 입주하던 날 찍은 날짜 있는 사진·영상이 남아 있습니다. | evidence.handover_record=dated_photos; evidence.mutual_ack=no |
| `hr_item_list_only` | 비품 목록은 계약서에 있지만, 하자나 상태에 대해서는 적혀 있지 않습니다. | evidence.handover_record=inventory_only; evidence.condition_noted=no |
| `hr_told_verbally` | 입주할 때 하자를 말로만 알렸고, 따로 남긴 기록은 없습니다. | evidence.handover_record=verbal_only |
| `hr_no_record` | 입주할 때 집 상태를 따로 기록하거나 확인하지 않았습니다. | evidence.handover_record=none |

### re04_self_repair
- phase: 2 / kind: single / show_if: re04_issue_type = it_repair_refused
- profile_field: client.self_repair
- 질문: 문제를 해결하려고 직접 비용을 쓴 적이 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `sr_paid_with_receipt` | 제가 먼저 수리업체를 불러 고쳤고, 영수증이나 송금 내역이 남아 있습니다. | client.self_repair=done; payment.self_repair_proof=receipt |
| `sr_paid_no_receipt` | 제가 먼저 고쳤지만, 현금으로 줘서 영수증은 받지 못했습니다. | client.self_repair=done; payment.self_repair_proof=none; payment.method=cash |
| `sr_paid_no_consent` | 상대방의 동의 없이 고쳤고, 상대방은 그 비용을 인정하지 않고 있습니다. | client.self_repair=done; client.prior_consent=no; counterparty.response=cost_disputed |
| `sr_quote_only` | 아직 고치지 않았고, 수리업체에서 견적만 받아 두었습니다. | client.self_repair=quote_only |
| `sr_not_spent` | 아직 제가 직접 쓴 비용은 없고, 상대방이 고쳐 주기를 기다리고 있습니다. | client.self_repair=none |

### re04_self_repair_amount
- phase: 2 / kind: text / show_if: re04_self_repair = sr_paid_with_receipt|sr_paid_no_receipt|sr_paid_no_consent|sr_quote_only
- profile_field: payment.self_repair_detail
- 질문: 지금까지 쓴 비용이나 받은 견적의 날짜·금액·내역을 적어 주세요.
- placeholder: 예: 2026-09-12 욕실 배관 누수 수리 1,500,000동(영수증 있음) / 곰팡이 제거 견적 800,000동, 집주인에게 잘로로 사진과 함께 보냄
- meaning: payment.self_repair_detail=<text>; (파싱 대상) payment.self_repair_amount, timeline.self_repair_date

### re04_fee_amount
- phase: 2 / kind: text / show_if: re04_issue_type = it_fee_dispute
- profile_field: payment.fee_claim_detail
- 질문: 문제가 되는 요금의 이름과 청구된 금액, 계약서에 적힌 기준을 적어 주세요.
- placeholder: 예: 전기요금 kWh당 4,000동으로 계산되어 9월분 2,800,000동 청구됨 / 계약서에는 '전력회사 청구 금액 기준'이라고 적혀 있음
- meaning: payment.fee_claim_detail=<text>; (파싱 대상) fee.item, fee.claimed_amount, fee.contract_basis

### re04_living_impact
- phase: 2 / kind: single / show_if: re04_issue_type = it_neighbor_management|it_landlord_entry
- profile_field: impact.living
- 질문: 이 문제가 지금 생활에 어느 정도 영향을 주고 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `li_minor` | 불편하지만, 지금 생활하는 데 큰 지장은 없습니다. | impact.living=minor |
| `li_partial_use` | 방이나 욕실·주방 일부를 쓰지 못하거나, 집에 있는 시간을 줄일 정도로 생활이 바뀌었습니다. | impact.living=partial_use_lost |
| `li_safety_privacy` | 안전이나 사생활이 걱정되어, 혼자 있거나 물건을 두고 나가기가 불안합니다. | impact.living=safety_privacy; risk.privacy=yes |
| `li_belongings_damaged` | 제 가구·전자제품·옷 같은 물건이 손상되었거나, 없어진 것이 있습니다. | impact.living=property_damage_or_loss; impact.client_property=damaged_or_missing |
| `li_staying_elsewhere` | 계속 살기 어려워, 임시로 다른 곳에 머물고 있거나 이사를 고민하고 있습니다. | impact.living=relocated_or_considering; client.action=temporary_relocation |

---

## H. 2차 노드 — 월세·기한·자료·막힌 이유·최종 목표

### re04_rent_status
- phase: 2 / kind: single / show_if: 항상
- profile_field: payment.rent_status
- 질문: 이 문제가 생긴 뒤, 월세와 요금은 어떻게 내고 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `rs_paying_normal` | 문제와 별개로, 월세와 요금은 계약대로 계속 내고 있습니다. | payment.rent_status=paid_in_full |
| `rs_withholding` | 상대방이 해결할 때까지, 월세나 요금의 일부 또는 전부를 내지 않고 있습니다. | payment.rent_status=withheld; risk.arrears_claim=yes |
| `rs_deducted_cost` | 제가 쓴 수리비나 잘못 청구된 금액을 빼고, 남은 금액만 월세로 보냈습니다. | payment.rent_status=paid_net_of_offset; client.action=self_offset |
| `rs_considering_withhold` | 아직 내고 있지만, 해결되지 않으면 월세를 멈추려고 생각하고 있습니다. | payment.rent_status=paid_in_full; client.plan=withhold |
| `rs_payment_refused` | 상대방이 제 송금을 받지 않거나, 계약과 다른 금액을 내라고 요구하고 있습니다. | payment.rent_status=tender_refused_or_amount_disputed; counterparty.action=refuse_payment_or_new_amount |

### re04_withhold_notice
- phase: 2 / kind: single / show_if: re04_rent_status = rs_withholding|rs_deducted_cost
- profile_field: client.withhold_notice
- 질문: 월세를 멈추거나 금액을 뺀 사실을 상대방에게 어떻게 알리셨나요?

| value | 선택지 | meaning |
|---|---|---|
| `wn_agreed_in_writing` | 상대방과 미리 합의했고, 그 합의가 메시지나 서면으로 남아 있습니다. | client.withhold_notice=agreed; counterparty.response=accept_offset; evidence.agreement=written |
| `wn_notified_no_consent` | 이유와 금액을 메시지로 알렸지만, 상대방은 동의하지 않았거나 답이 없습니다. | client.withhold_notice=notified; counterparty.response=no_consent_or_silent |
| `wn_not_notified` | 따로 알리지 않고, 월세만 덜 보내거나 보내지 않았습니다. | client.withhold_notice=none |
| `wn_landlord_objected` | 상대방이 이를 연체라고 하며, 계약 해지나 보증금 공제를 언급했습니다. | client.withhold_notice=disputed; counterparty.response=arrears_claim; counterparty.threat=termination_or_deduction |

### re04_deadline
- phase: 2 / kind: single / show_if: 항상
- profile_field: timeline.deadline_type
- 질문: 이 문제와 관련해 정해진 날짜나 다가오는 기한이 있나요?

| value | 선택지 | meaning |
|---|---|---|
| `r4_dl_promised_date` | 상대방이 수리하거나 정산하겠다고 약속한 날짜가 있고, 그 약속이 기록으로 남아 있습니다. | timeline.deadline_type=counterparty_promise; evidence.promise_record=yes |
| `dl_utility_cutoff` | 요금을 정리하지 않으면 전기·수도가 끊긴다고 안내받은 날짜가 있습니다. | timeline.deadline_type=utility_cutoff; risk.utility_cut=scheduled |
| `dl_contract_end` | 계약 만료일이 다가오고 있어, 그 전에 이 문제와 보증금 정산을 정리해야 합니다. | timeline.deadline_type=contract_end; contract.end_near=yes |
| `dl_vacate_demand` | 상대방이 정한 날짜까지 집을 비우라고 요구하고 있습니다. | timeline.deadline_type=vacate_demand; counterparty.threat=early_vacate_demand |
| `r4_dl_none` | 정해진 날짜는 없지만, 시간이 지날수록 문제가 커지고 있습니다. | timeline.deadline_type=none; impact.accumulating=yes |

### re04_key_dates  (v1 re04_deadline_date 확장)
- phase: 2 / kind: text / show_if: 항상
- profile_field: timeline.key_dates
- 질문: 이 문제와 관련된 날짜를 아는 만큼 적어 주세요. (입주일, 문제가 처음 생긴 날, 처음 알린 날, 다시 요청한 날, 약속받거나 통보받은 날짜, 계약 만료일)
- placeholder: 예: 입주 2026-03-01 / 욕실 누수 처음 발견 2026-08-25 / 잘로로 사진 보내 첫 요청 2026-08-26, 다시 요청 2026-09-10 / 집주인이 2026-10-20까지 수리하겠다고 약속 / 계약 만료 2027-02-28
- meaning: timeline.key_dates=<text>; (파싱 대상) timeline.movein_date, timeline.problem_date, timeline.first_notice_date, timeline.last_request_date, timeline.deadline_date, contract.end_date
- 변경: `re04_deadline_date`(기한 있을 때만 날짜 1개)를 대체 — 첫 통보일·재요청일·계약 만료일이 어디에서도 수집되지 않아 시간축을 만들 수 없었음. 노드 수는 그대로.

### re04_evidence
- phase: 2 / kind: multi / show_if: 항상
- profile_field: evidence.items
- 질문: 현재 보관하고 있어 바로 확인할 수 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 변경: `ev_cause_report` 추가 — 고장·하자의 원인(노후·구조 문제 vs 사용 부주의)을 제3자가 확인한 자료는 책임 판정의 핵심인데 v1 목록에 없었음. multi 체크 목록이라 6개로 둠(5개 상한 예외, Ace 확인 필요).

| value | 선택지 | meaning |
|---|---|---|
| `ev_dated_photos` | 문제 상태를 찍은 날짜 있는 사진·영상(입주 당시 사진 포함) | evidence.photos=dated |
| `ev_messages` | 상대방·중개인·관리사무소와 주고받은 잘로·카카오톡·이메일 메시지 | evidence.messages=yes |
| `ev_receipts_bills` | 수리비 영수증, 관리비·전기·수도 청구서, 송금 내역 | evidence.payment_records=yes |
| `ev_contract_handover` | 임대차 계약서와 인수인계서(비품·상태 목록) 사본 | evidence.contract_copy=yes; evidence.handover_doc=yes |
| `ev_cause_report` | 수리기사나 관리사무소가 고장·하자의 원인을 적어 준 확인서나 메시지 | evidence.cause_report=third_party |
| `ev_none` | 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다. | evidence.items=none_or_unchecked |

### re04_blockage
- phase: 2 / kind: single / show_if: 항상
- profile_field: blockage.main
- 질문: 현재 이 문제가 해결되지 못하는 가장 큰 이유는 무엇인가요?

| value | 선택지 | meaning |
|---|---|---|
| `bk_responsibility_unclear` | 누가 고치거나 비용을 내야 하는지 기준이 분명하지 않아, 서로 미루고만 있습니다. | blockage.main=responsibility_unclear |
| `bk_no_proof` | 입주 당시 상태나 문제가 생긴 시점을 보여 줄 기록이 부족해, 제 주장을 뒷받침하지 못하고 있습니다. | blockage.main=insufficient_proof |
| `bk_contact_blocked` | 상대방과 연락이 잘 닿지 않거나, 중개인·관리사무소가 중간에서 말을 제대로 전하지 않습니다. | blockage.main=contact_blocked |
| `bk_fear_retaliation` | 강하게 요구하면 계약 해지나 보증금 문제가 생길까 봐, 요구를 망설이고 있습니다. | blockage.main=fear_retaliation |
| `bk_language_barrier` | 계약서나 상대방의 답변이 베트남어라, 정확히 이해하거나 제 입장을 설명하지 못하고 있습니다. | blockage.main=language |

### re04_final_goal
- phase: 2 / kind: single / show_if: 항상
- profile_field: goal.final
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?

| value | 선택지 | meaning |
|---|---|---|
| `fg_repair_and_stay` | 상대방이 비용을 부담해 수리를 마치게 하고, 계약 기간 동안 계속 살고 싶습니다. | goal.final=repair_and_stay |
| `fg_cost_settled` | 제가 쓴 비용이나 잘못 청구된 요금을 정산받고, 그 결과를 기록으로 남기고 싶습니다. | goal.final=cost_settlement |
| `fg_deposit_protected` | 이 문제가 나중에 보증금 공제나 하자 책임으로 이어지지 않도록 지금 정리해 두고 싶습니다. | goal.final=deposit_protection |
| `fg_rules_in_writing` | 수리 방법·요금 기준·출입 방법을 상대방과 서면으로 다시 합의하고 싶습니다. | goal.final=written_rules |
| `fg_exit_with_deposit` | 더 이상 살기 어려워, 보증금을 돌려받고 계약을 정리한 뒤 나가고 싶습니다. | goal.final=exit_with_deposit |

---

## I. Evidence structure

| 증거 항목 (value) | 의미 | 증명하는 사실 | 결과 판정 영향 |
|---|---|---|---|
| `ev_dated_photos` | 문제 상태·입주 당시 상태를 날짜와 함께 남긴 사진·영상 | 문제의 존재·범위, 생긴 시점, 입주 전부터 있었는지 | 있으면 "기존 하자" 주장과 손상 규모 정리 가능. 없으면 `bk_no_proof`·`fc_false_no_proof`와 함께 "주의" |
| `ev_messages` | 상대방·중개인·관리사무소와 주고받은 메시지 | 요청한 날짜·내용, 상대방의 약속·거절·책임 전가 발언 | `nt_verbal_only`·`nt_via_agent`의 기록 부재 위험을 낮춤. 약속 날짜(`r4_dl_promised_date`) 근거 |
| `ev_receipts_bills` | 수리비 영수증, 요금 청구서, 송금 내역 | 고객이 쓴 비용 금액, 청구 단가, 월세를 계약대로 냈는지 | `sr_paid_no_receipt` 위험 판정, `fd_electric_rate`·`fd_unilateral_increase` 비교 근거, 연체 주장 반박 근거 |
| `ev_contract_handover` | 임대차 계약서·인수인계서 사본 | 수리·요금·출입 부담 조항, 입주 당시 비품·상태 | `cl_*` 판정을 실제 조항으로 확인. 없으면 `ca_no_copy`·`ca_verbal_only`와 함께 "주의" |
| `ev_cause_report` | 수리기사·관리사무소의 원인 확인 | 고장 원인이 노후·구조·공용 시설인지, 사용 부주의인지 | `it_prior_defect_blamed`·`nd_upstairs_leak`에서 책임 소재 판단의 핵심. 있으면 상대방 주장 반박력 강화 |
| `ev_none` | 자료 없음·미확인 | — | `fc_false_no_proof`와 동일하게 "주의", STEP 1(기록 확보) 우선 |
| 보조: `re04_handover_record` 값 | 입주 당시 기록 수준(서명 체크리스트 > 날짜 사진 > 비품 목록 > 말 > 없음) | 하자가 입주 전부터 있었는지 | `hr_told_verbally`·`hr_no_record` → "주의" |
| 보조: `re04_withhold_notice = wn_agreed_in_writing` | 월세 공제·보류 합의 기록 | 월세 보류가 합의된 것인지 | 있으면 `rs_withholding`·`rs_deducted_cost` 위험 완화(전문가 권장 → 주의로 하향 가능) |

---

## J. Timeline structure

| 순서 | 이벤트 | Profile 필드 | 채우는 질문 id |
|---|---|---|---|
| 1 | 계약 체결·입주(입주 당시 상태 확인) | timeline.movein_date, evidence.handover_record, contract.form | re04_key_dates, re04_handover_record, re04_contract_clause / re04_contract_access |
| 2 | 월세·요금 지급(문제 전후 지급 상태) | payment.rent_status | re04_rent_status |
| 3 | 문제 발생(처음 생긴 시점, 반복 여부) | timeline.problem_start, timeline.problem_date | re04_since_when, re04_key_dates |
| 4 | 통보(방법·날짜·전달 경로) | notice.channel, timeline.first_notice_date, timeline.last_request_date | re04_notify_status, re04_not_told_reason, re04_key_dates |
| 5 | 상대방 1차 반응 | counterparty.response, counterparty.claim | re04_other_response, re04_defect_claim, re04_fact_compare |
| 6 | 고객 대응(자비 수리, 월세 보류·공제, 임시 이주) | client.self_repair, payment.self_repair_detail, payment.rent_status, client.withhold_notice, impact.living | re04_self_repair, re04_self_repair_amount, re04_rent_status, re04_withhold_notice, re04_living_impact |
| 7 | 상대방 재응답(보복성 통보, 연체 주장, 단전) | counterparty.threat, counterparty.action | re04_threat_detail, re04_withhold_notice(wn_landlord_objected) |
| 8 | 다가오는 기한(약속일·단전 예정일·퇴거 요구일·계약 만료일) | timeline.deadline_type, timeline.deadline_date, contract.end_date | re04_deadline, re04_key_dates |
| 9 | 현재(막힌 이유·최종 목표) | blockage.main, goal.final | re04_blockage, re04_final_goal |

---

## K. Party / Relationship structure

| 당사자 유형 | 판별 값 | 관계·처리 원칙 |
|---|---|---|
| 개인 집주인(직접 계약) | `cp_individual_direct` | 요구 대상 = 계약 상대방 = 보증금 반환 주체. 표준 퍼널. |
| 집주인 + 중개인·관리 대행 | `cp_agent_managed`, `nt_via_agent`, `or_silent_or_relay` | 중개인은 계약 당사자가 아님. 요청이 집주인에게 실제 전달됐는지 확인 필요(party.agent_authority=unverified). 결과 문장에 "집주인에게도 직접 같은 내용을 남기기" 안내. |
| 임대 회사·법인 집주인 | `cp_company_landlord` | 회사 담당자의 답변이 회사 입장인지 확인, 서면(이메일) 요청 우선. 표준 퍼널. |
| 회사 명의 계약(고객은 실거주자) | `cp_employer_lease`, `ca_company_lease` | 계약 당사자 = 고객의 회사. 고객이 직접 요구할 수 있는 범위와 보증금 반환 대상이 회사인지 확인 → "확인 필요". 회사 담당자에게 계약서 사본 요청을 STEP에 추가. |
| 재임대(원 임차인과 계약) | `cp_sublease` | 실제 집주인·원 임차인·고객 3자 관계. 누구에게 책임을 물을지가 선결 문제 → 특수 사건(VFBCAI 전문가팀 진행). |
| 이웃 세대 | `nd_upstairs_leak`, `nd_noise_smell` | 계약 밖 제3자. `nd_upstairs_leak`는 집주인·이웃 집 다수 당사자 → 특수 사건. |
| 관리사무소 | `nd_management_restriction`, `nd_common_facility`, `nt_via_agent` | 건물 관리 주체(계약 당사자 아님). 공용 시설 문제는 관리사무소 책임 범위와 집주인의 협조 의무를 나누어 확인. |
| 상대방 불명 | `ntr_who_to_contact` | party.counterparty_type=unclear로 기록하고, 결과 화면에서 "계약서상 상대방 확인"을 STEP 1 앞에 둠. |

---

## L. Goal / Action / Response structure

### 고객 목표 값
| 구분 | 값 |
|---|---|
| 1차 확인 목표 (goal.primary_check) | responsibility(`cg_who_responsible`) / request_method(`cg_how_to_request`) / cost_recovery(`cg_self_repair_cost`) / deposit_contract_risk(`cg_deposit_risk`) / sequence(`cg_order_unsure`) |
| 최종 목표 (goal.final) | repair_and_stay(`fg_repair_and_stay`) / cost_settlement(`fg_cost_settled`) / deposit_protection(`fg_deposit_protected`) / written_rules(`fg_rules_in_writing`) / exit_with_deposit(`fg_exit_with_deposit`) |

### 고객 행동 값
| 행동 | 값 |
|---|---|
| 통보 | none(`nt_not_told`) / verbal(`nt_verbal_only`) / message(`nt_message_sent`) / formal_written(`nt_formal_request`) / via_intermediary(`nt_via_agent`) |
| 통보 안 한 이유 | fear_retaliation / recipient_unclear / language / preparing_evidence (`ntr_*`) |
| 자비 수리 | done+receipt / done+no_receipt / done+no_consent / quote_only / none (`sr_*`) |
| 월세 | paid_in_full / withheld / paid_net_of_offset / plan_withhold / tender_refused (`rs_*`) |
| 보류 통지 | agreed / notified / none / disputed (`wn_*`) |
| 임시 이주 | temporary_relocation(`li_staying_elsewhere`) |

### 상대방 반응 값 (기준 7분류 ↔ RE04 value)
| 기준 분류 | RE04 value |
|---|---|
| 수락 | `wn_agreed_in_writing`(공제 합의), `r4_dl_promised_date`(약속일 기록) |
| 수락했으나 미이행 | `or_agreed_stalled` |
| 거부 | `or_refused_blame`(거부 측면), `sr_paid_no_consent`(비용 불인정), `wn_notified_no_consent` |
| 일부 수용 | `or_partial_offer` |
| 연락 회피 | `or_silent_or_relay` |
| 추가 요구 | `rs_payment_refused`(계약과 다른 금액 요구), `fd_payer_shift` |
| 책임 전가 | `or_refused_blame`, `it_prior_defect_blamed`, `dc_*`, `nd_upstairs_leak`(상호 전가), `nd_condition_mismatch`(건물 탓) |
| 새 조건·보복성 통보 | `or_counter_threat` → `td_vacate_early` / `td_keep_deposit` / `td_raise_or_no_renew` / `td_cut_utilities` / `td_residence_registration`, `wn_landlord_objected`, `dl_vacate_demand` |

---

## M. 결과 판정 데이터

### M-1. 위험 신호 표 (v1 유지 + 보완)

| 선택지 | 결과 화면 위험 문장 | 판정 단계 | 비고 |
|---|---|---|---|
| `re04_notify_status = nt_verbal_only` | 지금까지 말로만 알려, 언제 무엇을 요청했는지 보여 줄 기록이 없습니다. | 확인 필요 | 유지 |
| `re04_notify_status = nt_via_agent` / `re04_other_response = or_silent_or_relay` | 중개인이나 관리사무소를 거친 요청은 상대방에게 실제로 전달되었는지 확인되지 않습니다. | 확인 필요 | 유지 |
| `re04_since_when = sw_over_month` / `sw_recurring` | 문제가 오래 이어지거나 반복되고 있어, 손상과 비용이 더 커지기 전에 요청 기록을 정리해야 합니다. | 주의 | 유지 |
| `re04_repair_detail = rd_electric_fault` / `rd_door_window` | 전기·문단속 문제는 안전과 직결되므로, 수리 책임을 따지기 전에 위험부터 막을 방법을 확인해야 합니다. | 주의 | 유지 |
| `re04_defect_claim = dc_deposit_deduction` | 상대방이 이미 보증금 공제를 예고해, 계약 종료 전에 하자 책임을 정리하지 않으면 정산 때 다툼이 커질 수 있습니다. | 주의 | 유지 |
| `re04_handover_record = hr_told_verbally` / `hr_no_record` | 입주 당시 상태 기록이 없어, 기존 하자였다는 점을 다른 자료로 보완해야 합니다. | 주의 | 유지 |
| `re04_contract_clause = cl_tenant_clear` | 계약서에 임차인 부담으로 적혀 있어, 해당 조항이 이번 문제에 그대로 적용되는지 확인이 필요합니다. | 확인 필요 | 유지 |
| `re04_contract_access = ca_verbal_only` / `ca_no_copy` | 계약 내용을 서면으로 확인할 수 없어, 메시지와 송금 내역으로 계약 조건을 다시 정리해야 합니다. | 주의 | 유지 |
| `re04_counterparty = cp_sublease` | 집주인과 직접 계약하지 않은 재임대 관계라, 누구에게 책임을 물을 수 있는지 먼저 정리해야 합니다. | 전문가 권장 | 보완(트리거를 `ca_sublease` → `cp_sublease`로 이동) |
| `re04_counterparty = cp_employer_lease` / `re04_contract_access = ca_company_lease` | 회사 명의 계약이라, 제가 직접 요구할 수 있는 범위와 보증금을 돌려받는 쪽이 회사인지 먼저 확인해야 합니다. | 확인 필요 | 추가 |
| `re04_fee_detail = fd_electric_rate` / `fd_unilateral_increase` | 청구된 단가나 인상분이 계약서 기준과 맞는지, 근거 자료로 비교해 봐야 합니다. | 확인 필요 | 유지 |
| `re04_fee_detail = fd_prior_arrears` / `re04_deadline = dl_utility_cutoff` | 전기·수도가 끊기면 생활이 바로 막히므로, 끊기기 전에 대응 순서를 정해야 합니다. | 전문가 권장 | 보완(`td_cut_utilities`는 실행된 경우로 바뀌어 특수 사건으로 이동, 예고 신호는 `dl_utility_cutoff`로) |
| `re04_self_repair = sr_paid_no_receipt` / `sr_paid_no_consent` | 영수증이나 사전 동의가 없는 수리비는 정산을 요구할 때 근거가 약해질 수 있습니다. | 주의 | 유지 |
| `re04_rent_status = rs_withholding` / `rs_deducted_cost` | 계약 근거나 합의 없이 월세를 멈추거나 빼면, 상대방이 연체를 이유로 계약 해지나 보증금 공제를 주장할 수 있습니다. | 전문가 권장 | 유지(`wn_agreed_in_writing`이면 주의로 하향) |
| `re04_rent_status = rs_considering_withhold` | 월세를 멈추기 전에, 계약서와 요청 기록으로 정산 방법을 먼저 확인하는 것이 안전합니다. | 주의 | 유지 |
| `re04_rent_status = rs_payment_refused` | 상대방이 송금을 받지 않거나 다른 금액을 요구하면, 계약대로 내려고 한 기록을 남겨 두어야 연체로 몰리지 않습니다. | 주의 | 추가 |
| `re04_withhold_notice = wn_not_notified` / `wn_landlord_objected` | 월세를 덜 보낸 이유가 기록으로 남아 있지 않아, 단순 연체로 받아들여질 수 있습니다. | 전문가 권장 | 유지 |
| `re04_other_response = or_counter_threat` | 상대방이 계약 해지나 보증금을 언급하고 있어, 대응 문장과 순서를 신중하게 정해야 합니다. | 주의 | 유지 |
| `re04_other_response = or_partial_offer` | 일부 부담이나 나중 정산 약속이 말로만 되어 있어, 금액과 방법을 메시지로 다시 확인받아야 합니다. | 확인 필요 | 추가 |
| `re04_threat_detail = td_vacate_early` / `re04_deadline = dl_vacate_demand` | 계약 기간 중 집을 비우라는 요구는 계약서의 해지 조항과 함께 확인해야 하며, 날짜 전에 대응해야 합니다. | 전문가 권장 | 유지 |
| `re04_threat_detail = td_residence_registration` | 임시거주 신고는 체류와 연결되므로, 상대방이 신고를 거부하거나 정리하기 전에 확인이 필요합니다. | 전문가 권장 | 유지 |
| `re04_entry_detail = ed_entered_absent` / `ed_unilateral_device` | 동의 없는 출입이나 장치 설치가 반복되면, 날짜별 기록을 남기고 출입 규칙을 서면으로 정해야 합니다. | 주의 | 유지 |
| `re04_living_impact = li_belongings_damaged` | 제 물건의 손상은 수리 책임과 별도로 금액과 사진을 정리해 두어야 합니다. | 확인 필요 | 유지 |
| `re04_living_impact = li_staying_elsewhere` | 집을 떠나 있는 동안의 월세와 비용 부담은 계약 정리 방법과 함께 확인해야 합니다. | 주의 | 유지 |
| `re04_fact_compare = fc_mostly_true` | 일부 책임을 인정하는 경우에도, 어디까지가 제 부담인지 범위와 금액을 나누어 정리해야 합니다. | 확인 필요 | 추가 |
| `re04_fact_compare = fc_false_no_proof` / `re04_evidence = ev_none` | 상대방 주장과 다르다는 점을 보여 줄 자료가 부족해, 지금 남길 수 있는 기록부터 확보해야 합니다. | 주의 | 유지 |
| `re04_deadline = dl_contract_end` + (`re04_issue_type = it_prior_defect_blamed` 또는 `re04_defect_claim = dc_deposit_deduction`) | 계약 만료가 가까워 하자 책임이 정리되지 않으면 보증금 정산 다툼으로 바로 이어질 수 있습니다. | 주의 | 추가(조합 신호) |

### M-2. 판정 단계
1. 위험 신호가 없으면 "확인 완료(일반 안내)" — 1차 결과 3칸 + STEP 3개만 표시.
2. 해당 신호 중 가장 높은 단계를 최종 판정으로 한다: 확인 필요 < 주의 < 전문가 권장.
3. "주의" 신호가 3개 이상 겹치면 "전문가 권장"으로 올린다.
4. 하향 규칙: `re04_withhold_notice = wn_agreed_in_writing`이면 `rs_withholding`/`rs_deducted_cost` 신호를 "주의"로 낮춘다. `re04_evidence`에 `ev_messages`와 `ev_dated_photos`가 함께 있으면 `nt_verbal_only` 신호는 표시하지 않는다.
5. 아래 특수 사건에 해당하면 단계와 관계없이 퍼널 진행 대신 "VFBCAI 전문가팀 진행" 안내를 표시한다.

### M-3. 특수 사건 (VFBCAI 전문가팀 진행)
- 직접 입력 등에서 이미 소송·조정이 진행 중이라고 확인된 경우 (유지)
- `re04_entry_detail = ed_entered_absent` 이면서 `re04_living_impact = li_belongings_damaged` — 물건 분실·손상이 동반된 무단 출입으로 형사 문제로 이어질 수 있는 경우 (유지)
- `re04_counterparty = cp_sublease` — 실제 집주인·원 임차인·고객의 다수 당사자 관계 (보완: v1 `ca_sublease`에서 이동)
- `re04_neighbor_detail = nd_upstairs_leak` — 집주인·이웃 세대 등 당사자가 여럿인 누수 책임 다툼 (유지)
- `re04_threat_detail = td_cut_utilities` — 전기·수도·인터넷·출입이 이미 끊기거나 막힌 경우 (보완: 선택지가 실행된 경우로 명확해짐)

### M-4. 1차 결과 "핵심 확인 결과" 3칸 문장 규칙 (유지)
- 상황: `re04_issue_type` + `re04_since_when`. 형식: "[문제 유형 요약]이 [기간] 이어지고 있습니다." 법적 책임 판단은 쓰지 않는다.
- 확인 목표: `re04_confirm_goal`을 "~인지 확인합니다"로 바꾼다.
- 대응·자료: `re04_notify_status`로 현재 요청 기록 수준을 쓰고, 다음에 남길 기록 한 가지를 붙인다.

### M-5. "지금 확인해 보세요" STEP 3개 (유지)
1. STEP 1 — 날짜 있는 기록 모으기: 문제 상태 사진·영상, 입주 당시 사진, 상대방과 주고받은 메시지를 날짜 순서로 한곳에 모아 주세요.
2. STEP 2 — 계약서 조항 찾기: 계약서에서 수리·관리비·요금·출입·보증금 반환과 관련된 조항을 찾아 표시하고, 베트남어라면 해당 부분만 따로 사진으로 남겨 주세요. (`cp_employer_lease`·`ca_company_lease`이면 "회사 담당자에게 계약서 사본을 요청해 주세요"를 덧붙임)
3. STEP 3 — 월세는 그대로, 요청은 서면으로: 정산 방법이 확인되기 전까지 월세는 계약대로 보내고, 문제 내용·요청 사항·해결 희망 날짜를 적은 메시지를 상대방에게 직접 보내 기록을 남겨 주세요.

---

## 노드 수
- 1차: Q1(공용) + CASE 4개 = 5
- 2차: 24개
  - 항상 노출 8: re04_counterparty, re04_contract_clause, re04_rent_status, re04_deadline, re04_key_dates, re04_evidence, re04_blockage, re04_final_goal
  - 유형별 상세(1개만 노출) 5: re04_repair_detail, re04_defect_claim, re04_fee_detail, re04_neighbor_detail, re04_entry_detail
  - 유형별 추가 4: re04_self_repair(A), re04_handover_record(B), re04_fee_amount(C), re04_living_impact(D·E)
  - 통보 여부 분기(둘 중 1개) 2: re04_not_told_reason, re04_other_response
  - 조건부 후속 5: re04_contract_access, re04_threat_detail, re04_fact_compare, re04_self_repair_amount, re04_withhold_notice
- 경로별 2차 노출: 기본 11~12문항, 조건부 후속이 열리면 13문항, 이론상 최대 15문항(A 경로에서 계약서 미확인 + 보복성 통보 + 월세 보류가 모두 겹칠 때)


---

# VFBCAI_REAL_ESTATE_CONTENT_PACK_MASTER_v1 — RE05 매매·권리 서류 문제

- Q1(공용, 확정·수정 불가) 선택지: "집을 사는 과정에서 명의 이전이나 핑크북(토지사용권 증서) 같은 권리 서류에 문제가 생겼습니다."
- 용어 고정: 핑크북(토지사용권 증서) / 명의 이전 / 매도인 / 분양 회사 / 중개인 / 공증사무소 / 토지등록사무소 / 은행 담보 / 계약금(đặt cọc)·중도금·잔금 / 돈은 "지급", 세금만 "납부"
- value는 전체 질문에서 중복 없음(질문별 접두사 사용). 기존 value는 모두 유지하고, 추가 value만 새 접두사로 만들었다.
- 노드 수: 1차 4개(Q1 제외) + 2차 21개 = 25개(v1 24개 → 1개 추가). 세부 사건별 2차 노출 9~13문항(조건부 후속 포함).
- show_if 표기: `질문id = value1|value2`(OR), 두 조건을 모두 만족해야 하면 `그리고`로 연결.

## A. v1 대비 변경 기록 (한 줄 이유)

| 구분 | 질문 id | 변경 내용 | 이유 |
|---|---|---|---|
| 수정(show_if) | re05_mortgage | r5_book_mismatch → r5_transfer_delay·r5_book_mismatch·r5_registration_rejected | 은행 담보는 개인 매도인 거래에서 명의 이전 지연·불수리의 핵심 원인인데, 지연·불수리 경로에서 확인되지 않았다. |
| 수정(show_if) | re05_nameOnDocs | r5_book_mismatch 추가 | `r5_mm_owner_name`을 고른 경우 공동 소유자·대리인 여부를 확인해야 판정이 갈린다. |
| 수정(show_if) | re05_blockage | 항상 → r5_book_mismatch·r5_foreign_eligibility·r5_registration_rejected | 지연·미발급 경로는 상세 질문(transferDelayDetail·projectBookDetail)이 이미 "멈춘 지점"을 묻기 때문에 같은 사실을 두 번 묻게 된다(점검 ②④ 불충족). |
| 수정(문장) | re05_paidAmount | 질문에 "날짜" 추가, placeholder에 지급일 예시 추가 | 지급 시점이 시간축(J)에 남지 않았다. |
| 수정(선택지) | re05_evidence | `r5_ev_records`를 기관 서류로 좁히고 `r5_ev_messages` 추가(6개) | 기관 접수 기록과 상대방 메시지는 증명하는 사실이 다른데(접수 사실 / 약속 내용), 한 선택지로 묶여 있었다. |
| 수정(선택지) | re05_responseReaction | `r5_rr_partial_progress` 추가(6개) | 상대방 반응 중 "일부 수용"이 빠져 있어, 일부 진행된 경우를 다른 반응으로 잘못 고르게 된다. |
| 추가 | re05_resaleApproval | 분양권을 넘겨받은 경우 분양 회사의 이전 인정 여부 | `r5_cp_resale_buyer`는 위험 신호인데, 판정에 필요한 "분양 회사 인정 여부"를 묻는 질문이 없었다. |
| 삭제 | 없음 | — | 24개 질문 모두 6가지 점검을 통과했다. |

---

## B. 전문가 프로파일링 구조

부동산 전문가가 RE05 첫 상담에서 확인하는 사실 축과, 각 축을 채우는 질문 id.

| 사실 축 | 전문가가 확인하는 내용 | Situation Profile 필드 | 채우는 질문 id |
|---|---|---|---|
| 목표 | 지금 가장 먼저 알고 싶은 것 / 최종적으로 원하는 마무리 | goal.primary / goal.final | re05_confirmGoal / re05_finalGoal |
| 시작점 | 어떤 권리 서류 문제로 상담을 시작했는가 | case.stage | re05_stage |
| 현재 단계 | 절차가 멈춘 지점·이유, 기관 판단 | transfer.blocking_step / project.book_reason / book.mismatch_* / foreign.issue / registration.rejection_reason / blockage.main | re05_transferDelayDetail / re05_projectBookDetail / re05_mismatchDetail / re05_foreignDetail / re05_rejectionDetail / re05_blockage |
| 당사자 | 계약 상대방 유형, 실제 권리자 | party.counterparty_type / title.name_match | re05_counterparty / re05_nameOnDocs |
| 관계 | 매도인-권리자 일치, 공동 소유자, 대리인, 분양권 양도 관계, 명의 차용 | title.name_match / contract.assignment_approval / foreign.issue | re05_nameOnDocs / re05_resaleApproval / re05_foreignDetail |
| 계약 | 계약 형태(공증·언어·분양 계약·계약금 약정서) | contract.form | re05_contractForm |
| 지급 | 지급 단계·경로·금액·날짜 | payment.stage / payment.channel / payment.detail_text | re05_paidStage / re05_paidAmount |
| 권리 상태 | 은행 담보, 핑크북 기재 내용, 인도 상태 | title.mortgage_status / book.mismatch_* / property.handover | re05_mortgage / re05_mismatchDetail / re05_handoverCompare |
| 상대방 행동 | 약속 기한 준수 여부, 지연 설명 | timeline.promise_status / counterparty.explanation | re05_promisedDate / re05_counterpartyExplanation |
| 고객 행동 | 문제를 안 뒤 고객이 한 대응 | client.action | re05_customerResponse |
| 증거 | 보관 중인 서류·기록 | evidence.* | re05_evidence |
| 정보 출처 | 문제를 누구를 통해 알았는가(1차 정보인지) | info.source | re05_infoSource |
| 시간축 | 지급일, 약속일, 다가오는 기한 | payment.detail_text / timeline.promise_status / timeline.deadline_type / timeline.deadline_text | re05_paidAmount / re05_promisedDate / re05_deadline / re05_deadlineDate |
| 상대방 반응 | 고객 대응 이후 상대방·기관의 반응 | counterparty.response | re05_responseReaction |
| 위험 | 판정 단계·특수 사건 여부 | result.level / result.special | M 섹션 규칙으로 산출 |
| 최종 목표 | 이전 완료 / 계약 정리·반환 / 안전 확인 / 전문가 위임 | goal.final | re05_finalGoal |

---

## C. 노드 표 — 1차 (phase 1)

#### re05_stage
- phase: 1 / kind: single / show_if: 항상
- profile_field: case.stage
- 질문: 명의 이전이나 핑크북 서류에서 생긴 문제는 어떤 상황인가요?
- 선택지:
  - `r5_transfer_delay` — 매매 계약은 맺었지만, 약속한 시점이 되어도 제 이름으로 명의 이전이 끝나지 않고 있습니다.
    - meaning: case.stage=transfer_delay; property.market=secondary; transfer.status=not_completed
  - `r5_project_book_pending` — 분양 아파트나 신축 주택을 샀지만, 약속한 시점이 지나도 핑크북이 발급되지 않고 있습니다.
    - meaning: case.stage=project_book_pending; property.market=primary_project; book.status=not_issued
  - `r5_book_mismatch` — 핑크북을 확인해 보니, 소유자 이름이나 면적이 계약 내용이나 실제 집과 다릅니다.
    - meaning: case.stage=book_mismatch; book.status=content_mismatch
  - `r5_foreign_eligibility` — 외국인인 제가 이 집을 제 이름으로 소유할 수 있는지 확실하지 않아, 진행이 멈춰 있습니다.
    - meaning: case.stage=foreign_eligibility; foreign.eligibility=unconfirmed; transfer.status=on_hold
  - `r5_registration_rejected` — 명의 이전이나 핑크북 발급을 신청했지만, 토지등록사무소에서 받아들이지 않는다는 통지를 받았습니다.
    - meaning: case.stage=registration_rejected; registration.filed=yes; registration.result=rejected; notice.received=yes

#### re05_paidStage
- phase: 1 / kind: single / show_if: 항상
- profile_field: payment.stage / payment.channel
- 질문: 이 거래에서 지금까지 돈은 어디까지 지급하셨나요?
- 선택지:
  - `r5_paid_deposit` — 계약금(đặt cọc)만 지급했고, 중도금과 잔금은 아직 지급하지 않았습니다.
    - meaning: payment.stage=deposit; payment.deposit=paid; payment.interim=unpaid; payment.balance=unpaid; payment.channel=direct
  - `r5_paid_interim` — 계약금과 중도금까지 지급했고, 잔금은 명의 이전이나 핑크북을 받을 때 지급하기로 했습니다.
    - meaning: payment.stage=interim; payment.deposit=paid; payment.interim=paid; payment.balance=unpaid; payment.balance_condition=on_title_transfer
  - `r5_paid_balance` — 잔금까지 모두 지급했지만, 아직 제 이름으로 권리가 넘어오지 않았습니다.
    - meaning: payment.stage=full; payment.balance=paid; transfer.status=not_completed; leverage.remaining=low
  - `r5_paid_via_broker` — 매도인이 아닌 중개인이나 지인 계좌로 돈을 보냈고, 매도인이 실제로 받았는지는 확인하지 못했습니다.
    - meaning: payment.stage=unknown; payment.channel=broker_or_third_party; payment.receipt_by_seller=unconfirmed
  - `r5_paid_nothing` — 아직 돈을 지급하지 않았고, 계약 전에 서류를 확인하고 있는 단계입니다.
    - meaning: payment.stage=none; contract.main=pre_signing; case.mode=pre_transaction_check

#### re05_counterparty
- phase: 1 / kind: single / show_if: 항상
- profile_field: party.counterparty_type
- 질문: 이 거래의 상대방은 누구인가요?
- 선택지:
  - `r5_cp_individual_seller` — 핑크북을 가진 개인 매도인과 직접 계약했고, 지금도 매도인과 연락이 됩니다.
    - meaning: party.counterparty_type=individual_seller; party.seller_contact=reachable; party.direct_contract=yes
  - `r5_cp_developer` — 분양 회사와 직접 분양 계약을 맺었고, 회사 담당자를 통해 진행하고 있습니다.
    - meaning: party.counterparty_type=developer; party.direct_contract=yes; party.contact_channel=developer_staff
  - `r5_cp_resale_buyer` — 먼저 분양받은 사람에게서 분양 계약을 넘겨받았고, 분양 회사와 직접 계약하지는 않았습니다.
    - meaning: party.counterparty_type=resale_assignor; party.direct_contract_with_developer=no; contract.assignment=yes
  - `r5_cp_broker_only` — 중개인을 통해서만 진행했고, 매도인을 직접 만나거나 연락한 적은 없습니다.
    - meaning: party.counterparty_type=seller_via_broker; party.seller_identity=unverified; party.broker_role=sole_channel
  - `r5_cp_owner_unclear` — 계약은 했지만, 핑크북상 실제 권리자가 누구인지 확실하지 않습니다.
    - meaning: party.counterparty_type=unclear; title.holder=unconfirmed; contract.main=signed

#### re05_confirmGoal
- phase: 1 / kind: single / show_if: 항상
- profile_field: goal.primary
- 질문: 지금 가장 먼저 확인하고 싶은 것은 무엇인가요?
- 선택지:
  - `r5_cg_why_stuck` — 명의 이전이나 핑크북 발급이 왜 멈춰 있는지, 그 원인부터 확인하고 싶습니다.
    - meaning: goal.primary=find_cause
  - `r5_cg_doc_valid` — 받은 핑크북이나 계약서가 진짜인지, 적힌 내용이 맞는지 확인하고 싶습니다.
    - meaning: goal.primary=verify_documents
  - `r5_cg_foreign_ok` — 외국인인 제가 이 집을 제 이름으로 소유할 수 있는지, 어떤 조건이 붙는지 확인하고 싶습니다.
    - meaning: goal.primary=foreign_eligibility
  - `r5_cg_money_safe` — 이미 지급한 돈이 안전한지, 남은 돈을 계속 지급해도 되는지 확인하고 싶습니다.
    - meaning: goal.primary=payment_safety; decision.pending=next_payment
  - `r5_cg_order` — 상황이 복잡해서, 무엇부터 진행해야 하는지 순서를 확인하고 싶습니다.
    - meaning: goal.primary=action_order

---

## D. 노드 표 — 2차 단계별 상세 (re05_stage에 따라 1개만 노출)

#### re05_transferDelayDetail
- phase: 2 / kind: single / show_if: re05_stage = r5_transfer_delay
- profile_field: transfer.blocking_step
- 질문: 명의 이전은 지금 어느 단계에서 멈춰 있나요?
- 선택지:
  - `r5_td_seller_docs` — 계약은 마쳤지만, 매도인이 핑크북 원본이나 신청에 필요한 서류를 아직 넘겨주지 않았습니다.
    - meaning: transfer.blocking_step=seller_documents; transfer.blocking_party=seller; registration.filed=no
  - `r5_td_mortgage` — 매도인의 은행 담보가 아직 풀리지 않아, 명의 이전 신청을 하지 못하고 있습니다.
    - meaning: transfer.blocking_step=mortgage_release; title.mortgage=exists; registration.filed=no
  - `r5_td_filed_waiting` — 토지등록사무소에 신청서는 접수되었지만, 안내받은 처리 기간이 지나도 결과가 나오지 않았습니다.
    - meaning: transfer.blocking_step=office_processing; registration.filed=yes; registration.processing=overdue
  - `r5_td_tax_stage` — 세금 납부 안내까지 받았지만, 누가 세금을 납부할지 정리되지 않아 멈춰 있습니다.
    - meaning: transfer.blocking_step=tax_allocation; tax.notice=received; tax.payer=disputed
  - `r5_td_stage_unknown` — 절차를 매도인이나 중개인이 맡고 있어, 지금 어느 단계인지 알지 못합니다.
    - meaning: transfer.blocking_step=unknown; transfer.handled_by=seller_or_broker; registration.filed=unknown

#### re05_projectBookDetail
- phase: 2 / kind: single / show_if: re05_stage = r5_project_book_pending
- profile_field: project.book_reason
- 질문: 핑크북이 발급되지 않은 이유를 어떻게 안내받으셨나요?
- 선택지:
  - `r5_pb_not_applied` — 집은 인도받았지만, 분양 회사가 아직 핑크북 발급 신청을 하지 않았다고 합니다.
    - meaning: project.book_reason=not_applied; property.handover=done; registration.filed=no
  - `r5_pb_project_legal` — 분양 회사가 프로젝트 전체의 법적 절차가 끝나지 않아 핑크북 발급이 늦어진다고 설명했습니다.
    - meaning: project.book_reason=project_legal_pending; project.issue_scope=whole_project
  - `r5_pb_project_mortgage` — 분양 회사가 프로젝트를 은행 담보로 잡혀 두었고, 그 담보가 풀려야 발급된다고 들었습니다.
    - meaning: project.book_reason=project_mortgage; title.mortgage=project_level; project.issue_scope=whole_project
  - `r5_pb_applied_no_proof` — 분양 회사는 이미 신청했다고 하지만, 접수증 같은 근거는 받지 못했습니다.
    - meaning: project.book_reason=claimed_applied; registration.filed=claimed; registration.receipt=none
  - `r5_pb_last_payment_hold` — 계약서에 핑크북(증서) 발급 후 지급할 금액이 따로 적혀 있고, 발급 일정은 따로 안내받지 못했습니다.
    - meaning: project.book_reason=schedule_not_given; payment.final_tranche=held_until_book; timeline.issue_schedule=none

#### re05_mismatchDetail
- phase: 2 / kind: multi / show_if: re05_stage = r5_book_mismatch
- profile_field: book.mismatch_fields
- 질문: 핑크북에서 계약 내용이나 실제 집과 다른 부분을 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `r5_mm_owner_name` — 소유자 이름(계약한 매도인과 다른 사람이거나, 공동 소유자가 더 있음)
    - meaning: book.mismatch_owner=yes; title.holder_matches_seller=no
  - `r5_mm_area` — 면적(계약서나 실제 집의 ㎡와 다름)
    - meaning: book.mismatch_area=yes
  - `r5_mm_address_use` — 주소·지번·호수, 또는 토지 용도·사용 기간
    - meaning: book.mismatch_address_or_use=yes
  - `r5_mm_forgery_suspect` — 핑크북 자체가 진짜가 아닐 수 있다는 말을 들음
    - meaning: book.authenticity=suspected_fake; result.special=yes
  - `r5_mm_unsure` — 다르다는 말은 들었지만, 어느 부분인지 알지 못함
    - meaning: book.mismatch_fields=unknown

#### re05_foreignDetail
- phase: 2 / kind: single / show_if: re05_stage = r5_foreign_eligibility
- profile_field: foreign.issue
- 질문: 외국인 소유 문제는 어떤 상황에서 생겼나요?
- 선택지:
  - `r5_fe_land_house` — 분양 프로젝트가 아닌, 땅이 딸린 단독주택이나 타운하우스를 사려고 했습니다.
    - meaning: foreign.issue=non_project_landed_house; property.type=landed_house; property.in_project=no
  - `r5_fe_quota_full` — 분양 아파트인데, 그 건물에서 외국인이 살 수 있는 물량이 다 찼다는 말을 들었습니다.
    - meaning: foreign.issue=quota_full; property.type=project_apartment
  - `r5_fe_term_limit` — 소유는 가능하다고 들었지만, 외국인 개인의 소유기간과 연장 가능 여부는 아직 확인하지 못했습니다.
    - meaning: foreign.issue=term_limit; foreign.eligibility=conditional; foreign.term_condition=unverified
  - `r5_fe_nominee` — 외국인 명의가 어렵다고 해서, 베트남인 지인 이름으로 계약하거나 등록하려고 합니다.
    - meaning: foreign.issue=nominee_plan; party.nominee=vietnamese_acquaintance; result.level_floor=expert
  - `r5_fe_told_unclear` — 외국인은 안 된다는 말만 들었고, 정확한 이유는 설명받지 못했습니다.
    - meaning: foreign.issue=refused_no_reason; foreign.eligibility=unconfirmed

#### re05_rejectionDetail
- phase: 2 / kind: single / show_if: re05_stage = r5_registration_rejected
- profile_field: registration.rejection_reason
- 질문: 토지등록사무소는 신청을 받아들이지 않는 이유를 어떻게 설명했나요?
- 선택지:
  - `r5_rj_docs_missing` — 서류가 빠졌거나 서류끼리 내용이 맞지 않는다며, 고칠 부분을 알려 주었습니다.
    - meaning: registration.rejection_reason=documents_incomplete; registration.fix_guidance=given
  - `r5_rj_foreign_status` — 외국인 명의로는 등록할 수 없는 집이라는 이유를 들었습니다.
    - meaning: registration.rejection_reason=foreign_ineligible; foreign.eligibility=denied_by_office
  - `r5_rj_seller_side` — 매도인 쪽의 은행 담보·압류·분쟁 기록 때문에 명의 이전을 할 수 없다고 했습니다.
    - meaning: registration.rejection_reason=seller_encumbrance; title.encumbrance=mortgage_seizure_or_dispute; result.special=yes
  - `r5_rj_no_reason` — 통지는 받았지만, 이유는 적혀 있지 않았습니다.
    - meaning: registration.rejection_reason=not_stated
  - `r5_rj_not_understood` — 이유가 적혀 있지만, 베트남어나 법률 용어 때문에 이해하지 못했습니다.
    - meaning: registration.rejection_reason=stated_not_understood; client.language_barrier=yes

---

## E. 노드 표 — 2차 권리·금액·계약 확인

#### re05_paidAmount
- phase: 2 / kind: text / show_if: re05_paidStage = r5_paid_deposit|r5_paid_interim|r5_paid_balance|r5_paid_via_broker
- profile_field: payment.detail_text
- 질문: 지금까지 지급한 금액과 날짜, 전체 매매 금액을 적어 주세요. (변경: "날짜" 추가 — 지급 시점을 시간축에 남기기 위함)
- placeholder: 예: 전체 매매 금액 35억 동 중 2026년 3월 10일에 계약금 3억 5천만 동, 5월 20일에 중도금 10억 동을 매도인 계좌로 송금했습니다.
- meaning(입력값): payment.amount_total=<금액>; payment.amount_paid=<금액>; payment.dates=<날짜 목록>; payment.recipient=<받은 사람>

#### re05_nameOnDocs
- phase: 2 / kind: single / show_if: re05_stage = r5_transfer_delay|r5_book_mismatch|r5_foreign_eligibility|r5_registration_rejected (변경: r5_book_mismatch 추가)
- profile_field: title.name_match
- 질문: 핑크북과 매매계약서에는 각각 누구의 이름이 적혀 있나요?
- 선택지:
  - `r5_nm_match` — 핑크북의 소유자와 계약서의 매도인이 같은 사람이고, 신분증으로도 확인했습니다.
    - meaning: title.name_match=match; party.seller_id_checked=yes
  - `r5_nm_family_coowner` — 핑크북에 매도인 외에 배우자나 가족도 함께 적혀 있는데, 계약서에는 매도인만 서명했습니다.
    - meaning: title.name_match=coowner_missing_signature; title.coowners=yes; contract.all_owners_signed=no
  - `r5_nm_proxy` — 핑크북 소유자는 따로 있고, 계약은 위임장을 가진 대리인과 맺었습니다.
    - meaning: title.name_match=via_proxy; party.agent=proxy_holder; party.proxy_authority=unverified
  - `r5_nm_buyer_vn_name` — 계약서의 매수인이 제가 아니라 베트남인 지인 이름으로 되어 있습니다.
    - meaning: title.name_match=buyer_is_nominee; party.nominee=vietnamese_acquaintance; contract.buyer_is_client=no
  - `r5_nm_not_seen` — 핑크북 원본이나 사본을 직접 보지 못해, 누구 이름인지 확인하지 못했습니다.
    - meaning: title.name_match=unverified; evidence.pinkbook_seen=no

#### re05_mortgage
- phase: 2 / kind: single / show_if: re05_stage = r5_transfer_delay|r5_book_mismatch|r5_registration_rejected (변경: r5_transfer_delay·r5_registration_rejected 추가)
- profile_field: title.mortgage_status
- 질문: 이 집이 은행 담보로 잡혀 있는지 확인하셨나요?
- 선택지:
  - `r5_mg_none_confirmed` — 핑크북 뒷면 기재란이나 토지등록사무소 조회로, 담보가 없다는 것을 확인했습니다.
    - meaning: title.mortgage_status=none_confirmed; title.mortgage_check_source=book_or_office
  - `r5_mg_release_planned` — 은행 담보가 있고, 제가 지급하는 잔금으로 담보를 풀기로 매도인과 약속했습니다.
    - meaning: title.mortgage_status=exists_release_planned; payment.balance_use=mortgage_release
  - `r5_mg_release_unclear` — 은행 담보가 있다고 들었지만, 언제 어떻게 풀리는지는 확인하지 못했습니다.
    - meaning: title.mortgage_status=exists_release_unclear
  - `r5_mg_paid_not_released` — 담보를 풀 돈을 이미 지급했지만, 은행에서 담보가 해제되었는지 확인되지 않습니다.
    - meaning: title.mortgage_status=release_paid_unconfirmed; payment.release_funds=paid; title.mortgage_release=unconfirmed
  - `r5_mg_unknown` — 담보 여부를 확인해 본 적이 없거나, 확인하는 방법을 모릅니다.
    - meaning: title.mortgage_status=unchecked

#### re05_resaleApproval (추가)
- phase: 2 / kind: single / show_if: re05_counterparty = r5_cp_resale_buyer 그리고 re05_stage = r5_project_book_pending
- profile_field: contract.assignment_approval
- 추가 이유: 분양 계약을 넘겨받은 경우 핑크북 발급 대상이 분양 회사의 이전 인정 여부로 갈리는데, v1에는 이를 묻는 질문이 없었다.
- 질문: 분양 계약을 넘겨받을 때, 분양 회사가 그 이전을 인정했나요?
- 선택지:
  - `r5_ra_developer_confirmed` — 분양 회사가 계약 이전을 확인해 주었고, 제 이름이 적힌 확인서나 변경된 계약서를 받았습니다.
    - meaning: contract.assignment_approval=developer_confirmed; contract.buyer_of_record=client
  - `r5_ra_notarized_only` — 공증사무소에서 양도 계약서를 공증받았지만, 분양 회사의 확인은 아직 받지 못했습니다.
    - meaning: contract.assignment_approval=notarized_not_confirmed; contract.assignment_form=notarized
  - `r5_ra_private_only` — 먼저 분양받은 사람과 직접 쓴 양도 서류만 있고, 공증이나 분양 회사 확인은 없습니다.
    - meaning: contract.assignment_approval=none; contract.assignment_form=private
  - `r5_ra_unknown` — 중개인이나 먼저 분양받은 사람이 처리했다고 해서, 분양 회사가 인정했는지 알지 못합니다.
    - meaning: contract.assignment_approval=unknown; contract.assignment_handled_by=third_party

#### re05_promisedDate
- phase: 2 / kind: single / show_if: re05_stage = r5_transfer_delay|r5_project_book_pending
- profile_field: timeline.promise_status
- 질문: 명의 이전이나 핑크북 발급은 언제까지 해 주기로 약속받으셨나요?
- 선택지:
  - `r5_pd_written_passed` — 계약서에 날짜가 적혀 있고, 그 날짜가 이미 지났습니다.
    - meaning: timeline.promise_form=written; timeline.promise_status=passed
  - `r5_pd_written_upcoming` — 계약서에 날짜가 적혀 있고, 아직 그 날짜가 되지 않았습니다.
    - meaning: timeline.promise_form=written; timeline.promise_status=upcoming
  - `r5_pd_verbal_passed` — 말이나 메시지로만 약속받았고, 그 시점이 이미 지났습니다.
    - meaning: timeline.promise_form=verbal_or_message; timeline.promise_status=passed
  - `r5_pd_postponed` — 여러 차례 날짜를 다시 미루었고, 지금은 새 날짜도 정해지지 않았습니다.
    - meaning: timeline.promise_status=repeatedly_postponed; timeline.new_date=none
  - `r5_pd_none` — 언제까지 해 주겠다는 약속은 받은 적이 없습니다.
    - meaning: timeline.promise_status=no_promise

#### re05_counterpartyExplanation
- phase: 2 / kind: single / show_if: re05_promisedDate = r5_pd_written_passed|r5_pd_verbal_passed|r5_pd_postponed
- profile_field: counterparty.explanation
- 질문: 약속한 날짜가 지난 이유를 상대방은 어떻게 설명했나요?
- 선택지:
  - `r5_ex_procedure` — 기관 절차가 늦어지고 있을 뿐이라며, 조금 더 기다려 달라고 했습니다.
    - meaning: counterparty.explanation=office_delay; counterparty.stance=asks_to_wait
  - `r5_ex_tax_demand` — 명의 이전에 따른 세금을 제가 납부해야 진행된다며, 계약에 없던 금액을 요구했습니다.
    - meaning: counterparty.explanation=tax_shift_to_buyer; counterparty.stance=new_condition; tax.payer=disputed
  - `r5_ex_extra_cost` — 급행 비용이나 명목이 분명하지 않은 추가 비용을 내야 진행된다고 했습니다.
    - meaning: counterparty.explanation=unclear_extra_cost; counterparty.stance=extra_demand
  - `r5_ex_no_explanation` — 이유를 설명하지 않거나, 연락을 피하고 있습니다.
    - meaning: counterparty.explanation=none; counterparty.stance=avoiding
  - `r5_ex_other_dispute` — 상속·이혼·채무 같은 다른 분쟁이 있어, 그 문제가 먼저 풀려야 한다고 했습니다.
    - meaning: counterparty.explanation=third_party_dispute; title.encumbrance=dispute; result.special=yes

#### re05_contractForm
- phase: 2 / kind: single / show_if: 항상
- profile_field: contract.form
- 질문: 매매 계약은 어떤 형태로 맺으셨나요?
- 선택지:
  - `r5_cf_notarized_bilingual` — 공증사무소에서 공증받은 매매계약서가 있고, 한국어나 영어 번역도 함께 있습니다.
    - meaning: contract.form=notarized_sale; contract.language=vn_with_translation; contract.client_understands=yes
  - `r5_cf_notarized_vn_only` — 공증사무소에서 공증받은 매매계약서가 있지만, 베트남어로만 되어 있어 내용을 다 이해하지 못했습니다.
    - meaning: contract.form=notarized_sale; contract.language=vn_only; contract.client_understands=partial
  - `r5_cf_developer_contract` — 분양 회사와 맺은 분양 계약서나 이를 넘겨받은 계약서가 있고, 공증은 하지 않았습니다.
    - meaning: contract.form=developer_sale; contract.notarized=no
  - `r5_cf_deposit_only` — 계약금 약정서만 썼고, 정식 매매계약서는 아직 쓰지 않았습니다.
    - meaning: contract.form=deposit_agreement_only; contract.main=unsigned
  - `r5_cf_informal_only` — 직접 쓴 계약서나 메시지 약속만 있고, 공증받은 계약서는 없습니다.
    - meaning: contract.form=informal; contract.notarized=no; contract.main=unsigned_formally

#### re05_handoverCompare
- phase: 2 / kind: single / show_if: re05_stage = r5_project_book_pending
- profile_field: property.handover
- 질문: 인도받은 집은 분양 계약 내용과 비교하면 어떤가요?
- 선택지:
  - `r5_hc_match` — 인도받은 집의 면적·호수·구조가 분양 계약 내용과 거의 같습니다.
    - meaning: property.handover=done; property.matches_contract=yes
  - `r5_hc_area_diff` — 실제 면적이 계약 면적과 달라, 금액 정산 문제가 남아 있습니다.
    - meaning: property.handover=done; property.area_diff=yes; payment.settlement=pending
  - `r5_hc_spec_diff` — 면적은 비슷하지만, 구조·마감·부대시설이 계약 내용과 다릅니다.
    - meaning: property.handover=done; property.spec_diff=yes
  - `r5_hc_not_handed` — 아직 집을 인도받지 못해, 실제와 비교할 수 없습니다.
    - meaning: property.handover=not_done
  - `r5_hc_no_contract_copy` — 분양 계약서나 도면을 가지고 있지 않아, 비교하기 어렵습니다.
    - meaning: property.matches_contract=unverifiable; evidence.contract_copy=no

#### re05_infoSource
- phase: 2 / kind: single / show_if: re05_stage = r5_book_mismatch|r5_foreign_eligibility|r5_registration_rejected
- profile_field: info.source
- 질문: 이 문제는 어떤 경로로 알게 되셨나요?
- 선택지:
  - `r5_is_office_direct` — 토지등록사무소나 공증사무소에서 직접 안내를 받았습니다.
    - meaning: info.source=office_direct; info.reliability=primary
  - `r5_is_counterparty` — 매도인이나 분양 회사로부터 직접 들었습니다.
    - meaning: info.source=counterparty; info.reliability=interested_party
  - `r5_is_broker_relay` — 중개인이 전해 주었고, 원래 안내나 서류를 직접 보지는 못했습니다.
    - meaning: info.source=broker_relay; info.reliability=secondhand; evidence.original_seen=no
  - `r5_is_self_check` — 제가 핑크북 사본과 계약서를 직접 비교하다가 알게 되었습니다.
    - meaning: info.source=self_check; evidence.pinkbook_seen=yes
  - `r5_is_hearsay` — 지인이나 다른 매수인에게 들었고, 아직 공식적으로 확인하지 못했습니다.
    - meaning: info.source=hearsay; info.reliability=unverified

---

## F. 1차 → 2차 adaptive branching 표

1차 공통 순서: Q1 → re05_stage → re05_paidStage → re05_counterparty → re05_confirmGoal.
2차는 re05_stage가 세부 사건 묶음을 정하고, re05_paidStage·re05_counterparty가 조건부 질문을 켜고 끈다. (괄호) = 조건부 후속.

| 세부 사건 | 1차 답 조합 | 2차 질문 순서 | 2차 문항 수 |
|---|---|---|---|
| S1 개인 매도인 명의 이전 지연 — 매도인 서류·은행 담보 미해결 | stage=transfer_delay + transferDelayDetail=td_seller_docs\|r5_td_mortgage + counterparty=cp_individual_seller\|r5_cp_broker_only\|r5_cp_owner_unclear + paidStage≠r5_paid_nothing | re05_transferDelayDetail → re05_paidAmount → re05_nameOnDocs → re05_mortgage → re05_promisedDate → (re05_counterpartyExplanation) → re05_contractForm → re05_customerResponse → (re05_responseReaction) → re05_evidence → re05_deadline → (re05_deadlineDate) → re05_finalGoal | 10 + 조건부 3 = 최대 13 |
| S2 개인 매도인 명의 이전 지연 — 접수 후 처리 지연·세금 부담 다툼 | stage=transfer_delay + transferDelayDetail=td_filed_waiting\|r5_td_tax_stage\|r5_td_stage_unknown | S1과 같은 순서. 판정은 접수 근거(ev_office_records)·세금 조항(contractForm)·r5_ex_tax_demand/r5_rr_more_money 중심 | 최대 13 |
| S3 분양 핑크북 미발급 — 분양 회사 직접 계약 | stage=project_book_pending + counterparty=cp_developer | re05_projectBookDetail → re05_paidAmount → re05_promisedDate → (re05_counterpartyExplanation) → re05_contractForm → re05_handoverCompare → re05_customerResponse → (re05_responseReaction) → re05_evidence → re05_deadline → (re05_deadlineDate) → re05_finalGoal | 9 + 조건부 3 = 최대 12 |
| S4 분양 핑크북 미발급 — 분양권을 넘겨받은 매수인 | stage=project_book_pending + counterparty≠cp_developer (개발사만 S3) | re05_projectBookDetail → re05_paidAmount → re05_resaleApproval → re05_promisedDate → (re05_counterpartyExplanation) → re05_contractForm → re05_handoverCompare → re05_customerResponse → (re05_responseReaction) → re05_evidence → re05_deadline → (re05_deadlineDate) → re05_finalGoal | 10 + 조건부 3 = 최대 13 |
| S5 핑크북 내용 불일치 — 소유자·면적·주소 / 위조 의심 | stage=book_mismatch | re05_mismatchDetail → (re05_paidAmount) → re05_nameOnDocs → re05_mortgage → re05_contractForm → re05_infoSource → re05_customerResponse → (re05_responseReaction) → re05_evidence → re05_blockage → re05_deadline → (re05_deadlineDate) → re05_finalGoal. `r5_mm_forgery_suspect` 선택 시 결과는 특수 사건 안내 | 10 + 조건부 3 = 최대 13 |
| S6 외국인 소유 자격 미확정 — 땅이 딸린 주택·물량 초과·소유기간 조건·명의 차용 | stage=foreign_eligibility | re05_foreignDetail → (re05_paidAmount) → re05_nameOnDocs → re05_contractForm → re05_infoSource → re05_customerResponse → (re05_responseReaction) → re05_evidence → re05_blockage → re05_deadline → (re05_deadlineDate) → re05_finalGoal | 9 + 조건부 3 = 최대 12 |
| S7 토지등록사무소 불수리 — 서류 보완 / 외국인 명의 / 매도인 쪽 기록 | stage=registration_rejected | re05_rejectionDetail → (re05_paidAmount) → re05_nameOnDocs → re05_mortgage → re05_contractForm → re05_infoSource → re05_customerResponse → (re05_responseReaction) → re05_evidence → re05_blockage → re05_deadline → (re05_deadlineDate) → re05_finalGoal. `r5_rj_seller_side` 선택 시 결과는 특수 사건 안내 | 10 + 조건부 3 = 최대 13 |

교차 분기(모든 세부 사건 공통):
- paidStage=paid_nothing → re05_paidAmount 숨김, 결과 문장은 "계약 전 안전 확인" 기준(r5_cg_money_safe·r5_fg_safety_check 우선).
- paidStage=paid_via_broker 또는 counterparty=cp_broker_only → 결과 STEP 3에 "실제 수령인 확인"을 우선 표시(M 참조).
- customerResponse=rs_none → re05_responseReaction 숨김.
- promisedDate=pd_written_upcoming|r5_pd_none → re05_counterpartyExplanation 숨김.
- deadline=dl_none|r5_dl_unsure → re05_deadlineDate 숨김.

---

## G. 노드 표 — 2차 대응·자료

#### re05_customerResponse
- phase: 2 / kind: single / show_if: 항상
- profile_field: client.action
- 질문: 문제를 알게 된 뒤, 지금까지 어떻게 대응하셨나요?
- 선택지:
  - `r5_rs_none` — 아직 상대방이나 기관에 따로 연락하지 않았습니다.
    - meaning: client.action=none
  - `r5_rs_asked_counterparty` — 매도인이나 분양 회사에 직접 연락해, 진행 상황을 물어보았습니다.
    - meaning: client.action=asked_counterparty; client.contact_channel=direct
  - `r5_rs_via_broker` — 중개인을 통해 진행을 재촉했고, 직접 연락하지는 않았습니다.
    - meaning: client.action=pushed_via_broker; client.contact_channel=broker
  - `r5_rs_asked_office` — 토지등록사무소나 공증사무소에 직접 문의했습니다.
    - meaning: client.action=asked_office; client.contact_channel=office
  - `r5_rs_hold_and_demand` — 남은 돈의 지급을 멈추고, 서면이나 메시지로 약속을 지켜 달라고 요구했습니다.
    - meaning: client.action=withheld_payment_and_demanded; payment.next=withheld; client.demand_form=written_or_message

#### re05_responseReaction
- phase: 2 / kind: single / show_if: re05_customerResponse = r5_rs_asked_counterparty|r5_rs_via_broker|r5_rs_asked_office|r5_rs_hold_and_demand
- profile_field: counterparty.response
- 질문: 대응한 뒤, 상대방이나 기관은 어떻게 반응했나요?
- 선택지:
  - `r5_rr_new_date` — 새 날짜를 약속했지만, 서면으로 받지는 못했습니다.
    - meaning: counterparty.response=accepted_new_date; counterparty.response_form=verbal
  - `r5_rr_partial_progress` — 서류 일부를 넘겨주거나 신청을 접수하는 등 일부는 진행되었지만, 아직 마무리되지 않았습니다. (추가: "일부 수용" 반응이 없어 다른 선택지로 잘못 고르게 되던 문제 보완)
    - meaning: counterparty.response=partial_compliance; transfer.status=partially_progressed
  - `r5_rr_more_money` — 진행하려면 추가 금액이나 세금을 더 내야 한다고 했습니다.
    - meaning: counterparty.response=extra_demand
  - `r5_rr_blame_other` — 서로 책임을 미루며, 누가 처리해야 하는지 분명히 말하지 않았습니다.
    - meaning: counterparty.response=shifted_responsibility
  - `r5_rr_no_contact` — 답변이 없거나, 연락이 끊겼습니다.
    - meaning: counterparty.response=avoiding; party.counterparty_contact=lost
  - `r5_rr_cancel_mentioned` — 상대방이 계약 해제나 계약금 문제를 먼저 꺼냈습니다.
    - meaning: counterparty.response=raised_cancellation; contract.cancellation_risk=yes

#### re05_evidence
- phase: 2 / kind: multi / show_if: 항상
- profile_field: evidence.items
- 질문: 현재 보관하고 있는 자료를 모두 선택해 주세요. (여러 개 선택 가능)
- 선택지:
  - `r5_ev_pinkbook` — 핑크북 원본이나 앞·뒷면 사본·사진
    - meaning: evidence.pinkbook=held
  - `r5_ev_contracts` — 매매계약서·분양 계약서·계약금 약정서(공증본 포함)
    - meaning: evidence.contracts=held
  - `r5_ev_payment_proof` — 은행 송금 내역이나 돈을 받았다는 영수증
    - meaning: evidence.payment_proof=held
  - `r5_ev_records` — 토지등록사무소 접수증·통지서, 은행 담보 해제 확인서 같은 기관 서류 (변경: 메시지를 분리하고 담보 해제 확인서를 포함 — 기관 기록과 상대방 약속은 증명하는 사실이 다름)
    - meaning: evidence.office_records=held
  - `r5_ev_messages` — 매도인·분양 회사·중개인과 주고받은 메시지나 이메일 (추가)
    - meaning: evidence.messages=held
  - `r5_ev_none` — 보관 중인 자료가 없거나, 있는지 아직 확인하지 못했습니다.
    - meaning: evidence.items=none_or_unchecked

---

## H. 노드 표 — 2차 막힘·기한·목표

#### re05_blockage
- phase: 2 / kind: single / show_if: re05_stage = r5_book_mismatch|r5_foreign_eligibility|r5_registration_rejected (변경: 항상 → 3개 단계 — 지연·미발급 경로는 상세 질문이 같은 사실을 이미 확보)
- profile_field: blockage.main
- 질문: 현재 이 일이 진행되지 못하는 가장 큰 이유는 무엇인가요?
- 선택지:
  - `r5_bk_cause_unknown` — 무엇 때문에 멈춰 있는지 알 수 없어, 어떻게 대응할지 판단하지 못하고 있습니다.
    - meaning: blockage.main=cause_unknown
  - `r5_bk_counterparty` — 상대방이 서류를 넘겨주지 않거나 연락이 되지 않아, 제 쪽에서 진행할 수 없습니다.
    - meaning: blockage.main=counterparty_noncooperation
  - `r5_bk_money_decision` — 남은 돈을 지급해야 할지 멈춰야 할지 판단하지 못해, 결정을 미루고 있습니다.
    - meaning: blockage.main=payment_decision; decision.pending=next_payment
  - `r5_bk_eligibility` — 외국인인 제가 소유할 수 있는지 확실하지 않아, 진행 여부를 정하지 못하고 있습니다.
    - meaning: blockage.main=foreign_eligibility
  - `r5_bk_docs_language` — 서류가 베트남어로 되어 있고 절차를 몰라, 무엇을 준비해야 할지 모르겠습니다.
    - meaning: blockage.main=language_and_procedure; client.language_barrier=yes

#### re05_deadline
- phase: 2 / kind: single / show_if: 항상
- profile_field: timeline.deadline_type
- 질문: 이 일과 관련해 앞으로 지켜야 하거나 다가오는 날짜가 있나요?
- 선택지:
  - `r5_dl_next_payment` — 다음 중도금이나 잔금을 지급해야 하는 날짜가 정해져 있습니다.
    - meaning: timeline.deadline_type=next_payment; decision.pending=next_payment
  - `r5_dl_notice_period` — 통지서나 기관 안내에 다시 신청하거나 보완할 수 있는 기간이 적혀 있습니다.
    - meaning: timeline.deadline_type=office_cure_period
  - `r5_dl_personal` — 입주·출국·비자 갱신 같은 제 일정 때문에, 그 전에 마무리해야 합니다.
    - meaning: timeline.deadline_type=personal_schedule
  - `r5_dl_none` — 정해진 날짜나 기한은 따로 없습니다.
    - meaning: timeline.deadline_type=none
  - `r5_dl_unsure` — 서류가 베트남어로 되어 있어, 기한이 적혀 있는지조차 확인하지 못했습니다.
    - meaning: timeline.deadline_type=unchecked; client.language_barrier=yes

#### re05_deadlineDate
- phase: 2 / kind: text / show_if: re05_deadline = r5_dl_next_payment|r5_dl_notice_period|r5_dl_personal
- profile_field: timeline.deadline_text
- 질문: 확인한 날짜와, 그날까지 해야 하는 일을 적어 주세요.
- placeholder: 예: 2026년 11월 30일까지 잔금 15억 동을 지급해야 하고, 그 전에 명의 이전 신청 접수를 확인하고 싶습니다.
- meaning(입력값): timeline.deadline_date=<날짜>; timeline.deadline_action=<해야 할 일>

#### re05_finalGoal
- phase: 2 / kind: single / show_if: 항상
- profile_field: goal.final
- 질문: 이번 검토를 통해 이 일을 어떻게 마무리하고 싶으신가요?
- 선택지:
  - `r5_fg_complete_transfer` — 막힌 원인을 확인하고, 제 이름으로 명의 이전이나 핑크북 발급을 끝까지 마치고 싶습니다.
    - meaning: goal.final=complete_transfer
  - `r5_fg_cancel_refund` — 거래를 계속하기 어렵다면, 계약을 정리하고 지급한 돈을 돌려받는 방법을 확인하고 싶습니다.
    - meaning: goal.final=cancel_and_refund
  - `r5_fg_safety_check` — 남은 돈을 지급하기 전에, 이 거래가 안전한지 서류와 권리관계를 확인하고 싶습니다.
    - meaning: goal.final=pre_payment_safety_check
  - `r5_fg_expert` — 제 상황을 전문가에게 정확히 전달해, 상대방과 기관 대응을 맡기고 싶습니다.
    - meaning: goal.final=delegate_to_expert

---

## I. Evidence structure

| value | 의미 | 증명하는 사실 | 결과 판정 영향 |
|---|---|---|---|
| `r5_ev_pinkbook` | 핑크북 원본 또는 앞·뒷면 사본·사진 보관 | 권리자 이름, 면적·주소·용도, 뒷면 기재란의 은행 담보·변동 기록 | `r5_nm_not_seen`·`r5_mg_unknown`과 함께 선택되면 "사본으로 먼저 확인 가능" 안내로 전환. 없으면 STEP 1이 "원본 열람 요청"으로 바뀜 |
| `r5_ev_contracts` | 매매계약서·분양 계약서·계약금 약정서(공증본 포함) 보관 | 명의 이전 기한, 세금 부담자, 잔금 지급 조건, 지연·해제 시 계약금 처리 | `r5_pd_written_passed`·`r5_ex_tax_demand`·`r5_rr_cancel_mentioned` 판단의 기준 문서. 없으면 해당 신호를 "계약 근거 미확인"으로 표시 |
| `r5_ev_payment_proof` | 송금 내역·영수증 보관 | 지급 금액·날짜·받은 사람(매도인 본인인지) | `r5_paid_via_broker`일 때 수령인 확인 근거. 없으면 `r5_ev_none`과 같은 수준의 "확인 필요" 문장 추가 |
| `r5_ev_records` | 토지등록사무소 접수증·통지서, 은행 담보 해제 확인서 | 신청 접수 사실·처리 단계, 불수리 이유와 보완 기간, 담보 해제 여부 | `r5_td_filed_waiting`·`r5_pb_applied_no_proof`·`r5_mg_paid_not_released`의 "확인 필요"를 완화(근거 있음)하거나, 없으면 유지 |
| `r5_ev_messages` | 상대방·중개인과의 메시지·이메일 | 말로 한 약속 날짜, 추가 비용 요구, 연락 회피, 해제 언급 | `r5_pd_verbal_passed`·`r5_ex_extra_cost`·`r5_rr_no_contact`·`r5_rr_cancel_mentioned`의 사실 근거. 결과 STEP 3 "메시지 보관" 안내 생략 여부 결정 |
| `r5_ev_none` | 보관 자료 없음 또는 미확인 | — | 위험 문장 "지급 내역과 계약서가 없으면…"(확인 필요) 추가. 다른 ev_ 값과 동시 선택 불가(UI에서 배타 처리) |

---

## J. Timeline structure

| 순서 | 시간축 이벤트 | Situation Profile 필드 | 채우는 질문 id |
|---|---|---|---|
| 1 | 계약 체결(형태·상대방·분양권 양도) | contract.form / party.counterparty_type / contract.assignment_approval | re05_contractForm / re05_counterparty / re05_resaleApproval |
| 2 | 지급(계약금·중도금·잔금, 지급일·받은 사람) | payment.stage / payment.detail_text | re05_paidStage / re05_paidAmount |
| 3 | 인도(분양 주택) | property.handover | re05_handoverCompare / re05_projectBookDetail(`r5_pb_not_applied`) |
| 4 | 약속 기한(명의 이전·핑크북 발급 예정일) | timeline.promise_status | re05_promisedDate |
| 5 | 문제 발생·인지(지연·불일치·자격 문제·불수리) | case.stage / info.source | re05_stage / re05_infoSource / 각 단계별 상세 질문 |
| 6 | 기관 통지(불수리 통지, 보완 기간) | registration.rejection_reason / timeline.deadline_type=office_cure_period | re05_rejectionDetail / re05_deadline(`r5_dl_notice_period`) |
| 7 | 상대방 1차 설명(기한이 지난 이유) | counterparty.explanation | re05_counterpartyExplanation |
| 8 | 고객 대응 | client.action | re05_customerResponse |
| 9 | 상대방·기관 재응답 | counterparty.response | re05_responseReaction |
| 10 | 현재 막힌 지점 | transfer.blocking_step / project.book_reason / blockage.main | re05_transferDelayDetail / re05_projectBookDetail / re05_blockage |
| 11 | 다가오는 기한(다음 지급일·보완 기간·개인 일정) | timeline.deadline_type / timeline.deadline_text | re05_deadline / re05_deadlineDate |

---

## K. Party / Relationship structure

| 당사자 유형 | 역할·관계 | 확인 질문·value | 처리 규칙 |
|---|---|---|---|
| 고객(외국인 매수인) | 매수인 본인 | 전제(Q1) | 계약서 매수인이 고객이 아니면 `r5_nm_buyer_vn_name`으로 분기 |
| 명의를 빌려준 베트남인 지인 | 계약·등록상 매수인(실제 매수인은 고객) | `r5_nm_buyer_vn_name` / `r5_fe_nominee` | 전문가 권장 고정. 결과에서 명의 차용을 권하거나 정당화하는 문장 금지 |
| 개인 매도인 | 핑크북 권리자이자 계약 상대 | `r5_cp_individual_seller` / `r5_nm_match` | 신분증 대조 여부를 함께 기록 |
| 공동 소유자(배우자·가족) | 핑크북에 함께 적힌 권리자 | `r5_nm_family_coowner` / `r5_mm_owner_name` | 전원 서명·동의 여부 확인 대상으로 표시(주의) |
| 대리인(위임장 보유) | 권리자를 대신해 계약한 사람 | `r5_nm_proxy` | 위임장 공증·매매 권한·대금 수령 권한 확인 대상으로 표시 |
| 분양 회사 | 1차 분양 계약 상대, 핑크북 발급 신청 주체 | `r5_cp_developer` / re05_projectBookDetail | 프로젝트 전체 문제(`r5_pb_project_legal`·`r5_pb_project_mortgage`)는 개별 매수인이 앞당기기 어려움으로 표시 |
| 분양권 양도인 | 먼저 분양받고 계약을 넘긴 사람 | `r5_cp_resale_buyer` / re05_resaleApproval | 분양 회사 인정 여부로 판정 분기 |
| 중개인 | 소개·서류 전달·대금 수령 경유 | `r5_cp_broker_only` / `r5_paid_via_broker` / `r5_is_broker_relay` / `r5_rs_via_broker` | 중개인 진술은 2차 정보로 기록(info.reliability=secondhand). 대금 수령 시 실제 매도인 전달 확인 필요 |
| 권리자 불명 | 계약 상대와 실제 권리자 관계 미확인 | `r5_cp_owner_unclear` / `r5_nm_not_seen` | 전문가 권장(r5_cp_owner_unclear) |
| 은행 | 담보권자 | `r5_td_mortgage` / re05_mortgage / `r5_pb_project_mortgage` | 담보 해제 확인서 보유 여부(r5_ev_records)로 확인 |
| 제3 분쟁 당사자(상속인·배우자·채권자) | 매매 밖의 권리 주장자 | `r5_ex_other_dispute` / `r5_rj_seller_side` | 특수 사건(VFBCAI 전문가팀 진행) |
| 공증사무소·토지등록사무소 | 계약 공증·명의 이전 처리 기관 | `r5_is_office_direct` / `r5_rs_asked_office` / re05_rejectionDetail | 기관 안내는 1차 정보(info.reliability=primary)로 기록 |
| 회사 명의 매수 | 고객이 회사 이름으로 사는 경우 | 별도 질문 없음 | 직접 입력에 회사 명의가 나오면 퍼널 판정 대신 "전문가 권장"으로 표시(회사의 부동산 취득은 사업 목적·형태별 확인이 필요해 일반 퍼널 범위를 벗어남) |

---

## L. Goal / Action / Response structure

### 고객 목표 값
| 구분 | value | 의미 |
|---|---|---|
| 1차 확인 목표(goal.primary) | `r5_cg_why_stuck` / `r5_cg_doc_valid` / `r5_cg_foreign_ok` / `r5_cg_money_safe` / `r5_cg_order` | 원인 확인 / 서류 진위·내용 / 외국인 소유 조건 / 지급 안전 / 진행 순서 |
| 최종 목표(goal.final) | `r5_fg_complete_transfer` / `r5_fg_cancel_refund` / `r5_fg_safety_check` / `r5_fg_expert` | 이전 완료 / 계약 정리·반환 / 지급 전 안전 확인 / 전문가 위임 |

### 고객 행동 값(client.action)
| value | 의미 |
|---|---|
| `r5_rs_none` | 대응 없음 |
| `r5_rs_asked_counterparty` | 상대방에 직접 문의 |
| `r5_rs_via_broker` | 중개인 통해 재촉 |
| `r5_rs_asked_office` | 기관에 직접 문의 |
| `r5_rs_hold_and_demand` | 남은 돈 지급 보류 + 서면·메시지 이행 요구 |

### 상대방 반응 값(counterparty.explanation / counterparty.response) — 표준 반응 유형 매핑
| 표준 반응 유형 | 1차 설명(re05_counterpartyExplanation) | 대응 후 재응답(re05_responseReaction) |
|---|---|---|
| 수락 | `r5_ex_procedure`(기다려 달라) | `r5_rr_new_date` |
| 일부 수용 | — | `r5_rr_partial_progress` |
| 거부 | — | `r5_rr_cancel_mentioned`(해제를 먼저 꺼냄) |
| 연락 회피 | `r5_ex_no_explanation` | `r5_rr_no_contact` |
| 추가 요구 | `r5_ex_extra_cost` | `r5_rr_more_money` |
| 책임 전가 | — | `r5_rr_blame_other` |
| 새 조건 | `r5_ex_tax_demand`(세금 부담 전가), `r5_ex_other_dispute`(다른 분쟁 선해결 조건) | `r5_rr_more_money`(세금 포함) |

---

## M. 결과 판정 데이터

### M-1. 위험 신호 표 (v1 유지 + 보완)

| 선택지 | 결과 화면 위험 문장 | 판정 | 비고 |
|---|---|---|---|
| `r5_paid_balance` (+ re05_stage = r5_transfer_delay\|r5_project_book_pending) | 잔금까지 지급한 뒤에도 권리가 넘어오지 않아, 남은 협상 수단이 적은 상태일 수 있습니다. | 주의 | 유지 |
| `r5_paid_via_broker` | 매도인이 아닌 사람에게 보낸 돈은, 실제로 매도인에게 전달되었는지 따로 확인해야 합니다. | 주의 | 유지 |
| `r5_cp_broker_only` | 매도인을 직접 확인하지 않은 거래는, 계약 상대가 실제 권리자인지부터 확인해야 합니다. | 주의 | 유지 |
| `r5_cp_resale_buyer` | 분양 계약을 넘겨받은 경우, 분양 회사가 그 이전을 인정했는지에 따라 핑크북 발급 대상이 달라질 수 있습니다. | 확인 필요 | 유지(`r5_ra_developer_confirmed`이면 표시 생략) |
| `r5_ra_private_only` | 분양 회사 확인 없이 개인끼리 쓴 양도 서류만 있으면, 분양 회사가 고객님을 핑크북 발급 대상으로 보지 않을 수 있습니다. | 주의 | 추가 |
| `r5_ra_notarized_only` / `r5_ra_unknown` | 분양 회사가 계약 이전을 인정했는지 서면으로 확인해야 합니다. | 확인 필요 | 추가 |
| `r5_cp_owner_unclear` | 실제 권리자가 확인되지 않으면, 이미 맺은 계약으로 명의 이전이 진행되지 않을 수 있습니다. | 전문가 권장 | 유지 |
| `r5_td_mortgage` / `r5_mg_release_unclear` | 은행 담보가 풀리지 않으면 명의 이전 신청 자체가 받아들여지지 않을 수 있습니다. | 주의 | 유지(같은 응답에서 두 값이 함께 나오면 1개로 계산) |
| `r5_mg_paid_not_released` | 담보를 풀 돈을 지급했는데 해제가 확인되지 않으면, 그 돈의 사용처부터 확인해야 합니다. | 전문가 권장 | 유지 |
| `r5_mg_unknown` | 은행 담보 여부는 핑크북 뒷면 기재란이나 토지등록사무소에서 먼저 확인해야 합니다. | 확인 필요 | 유지(이제 지연·불수리 경로에도 노출) |
| `r5_td_stage_unknown` / `r5_td_filed_waiting` | 신청 접수 여부와 처리 단계를 확인할 근거(접수증)가 필요합니다. | 확인 필요 | 유지(`r5_ev_records` 선택 시 "보관 중인 접수증으로 처리 단계를 확인할 수 있습니다."로 문장 대체) |
| `r5_td_tax_stage` / `r5_ex_tax_demand` | 세금을 누가 납부하는지는 계약서 조항에 따라 달라지므로, 계약서 내용과 먼저 대조해야 합니다. | 확인 필요 | 유지 |
| `r5_pb_project_mortgage` / `r5_pb_project_legal` | 프로젝트 전체의 담보나 법적 절차 문제는 개별 매수인이 앞당기기 어려워, 발급이 길어질 수 있습니다. | 주의 | 유지 |
| `r5_pb_applied_no_proof` | 신청했다는 말만 있고 접수 근거가 없으면, 실제 신청 여부를 따로 확인해야 합니다. | 확인 필요 | 유지 |
| `r5_hc_area_diff` | 실제 면적이 계약과 다르면, 핑크북 발급 전에 금액 정산 기준을 계약서로 확인해야 합니다. | 확인 필요 | 유지 |
| `r5_mm_owner_name` | 핑크북 소유자가 계약 상대와 다르면, 그 사람의 동의 없이 맺은 계약은 명의 이전이 진행되지 않을 수 있습니다. | 전문가 권장 | 유지 |
| `r5_mm_area` / `r5_mm_address_use` | 핑크북 내용이 계약과 다르면, 어느 쪽을 기준으로 바로잡을지 먼저 정해야 합니다. | 확인 필요 | 유지 |
| `r5_mm_forgery_suspect` | 핑크북이 진짜가 아닐 가능성이 있다면, 추가 지급을 멈추고 토지등록사무소 기록부터 확인해야 합니다. | 전문가 권장 | 유지 · 특수 사건 |
| `r5_nm_family_coowner` | 핑크북의 공동 소유자 전원이 동의하지 않으면, 명의 이전이 진행되지 않을 수 있습니다. | 주의 | 유지 |
| `r5_nm_proxy` | 대리인과 맺은 계약은 위임장이 공증되었는지, 매매 권한이 포함되었는지 확인해야 합니다. | 주의 | 유지 |
| `r5_nm_not_seen` | 핑크북을 직접 보지 못한 상태라면, 누구의 권리인지부터 확인해야 합니다. | 주의 | 유지 |
| `r5_nm_buyer_vn_name` / `r5_fe_nominee` | 다른 사람 이름으로 등록한 집은, 그 사람이 권리를 주장할 때 돌려받기 어려울 수 있습니다. | 전문가 권장 | 유지 |
| `r5_fe_land_house` / `r5_rj_foreign_status` | 외국인은 집의 종류와 위치에 따라 소유가 제한될 수 있어, 거래 전 조건 확인이 필요합니다. | 주의 | 유지 |
| `r5_fe_quota_full` | 외국인 소유 물량이 찬 건물이라면, 계약을 해도 외국인 명의로 핑크북을 받지 못할 수 있습니다. | 주의 | 유지 |
| `r5_rj_seller_side` | 매도인 쪽의 압류·분쟁 기록은 매수인이 혼자 풀 수 없는 문제일 수 있습니다. | 전문가 권장 | 유지 · 특수 사건 |
| `r5_pd_postponed` / `r5_pd_written_passed` | 약속한 날짜가 지난 경우, 계약서의 지연 조항과 해제 조건을 확인해야 합니다. | 주의 | 유지 |
| `r5_ex_extra_cost` / `r5_rr_more_money` | 계약에 없던 비용 요구는, 명목과 영수증을 서면으로 받은 뒤에 판단해야 합니다. | 주의 | 유지 |
| `r5_ex_no_explanation` / `r5_rr_no_contact` | 상대방이 연락을 피하면, 그동안의 지급 내역과 연락 기록을 먼저 정리해 두어야 합니다. | 주의 | 유지 |
| `r5_ex_other_dispute` | 상속·이혼·채무 분쟁은 여러 당사자가 얽혀, 매매 계약만으로 해결되지 않을 수 있습니다. | 전문가 권장 | 유지 · 특수 사건 |
| `r5_rr_cancel_mentioned` | 상대방이 계약 해제를 먼저 꺼낸 경우, 계약금 몰수나 배액 반환 조항을 확인한 뒤 답해야 합니다. | 전문가 권장 | 유지 |
| `r5_cf_deposit_only` / `r5_cf_informal_only` | 공증받은 매매계약서가 없으면, 명의 이전 신청에 쓸 수 있는 계약이 아직 없는 상태일 수 있습니다. | 주의 | 유지(`r5_cf_developer_contract`는 분양 거래의 정상 형태이므로 신호 아님) |
| `r5_cf_notarized_vn_only` | 공증 계약서의 명의 이전 기한·세금 부담·해제 조항을 번역해 확인해야 합니다. | 확인 필요 | 유지 |
| `r5_bk_money_decision` | 남은 돈의 지급 여부는 계약서의 지급 조건과 권리 서류 상태를 함께 보고 정해야 합니다. | 확인 필요 | 유지(지연·미발급 경로에서는 `r5_cg_money_safe` + `r5_dl_next_payment` 조합에 같은 문장 표시) |
| `r5_dl_notice_period` | 통지서에 적힌 기간이 지나면 다시 신청해야 할 수 있어, 날짜부터 확인해야 합니다. | 주의 | 유지 |
| `r5_ev_none` | 지급 내역과 계약서가 없으면, 지급한 돈과 약속 내용을 증명하기 어려울 수 있습니다. | 확인 필요 | 유지 |

### M-2. 판정 단계

| 단계 | 조건 | 결과 화면 안내 성격 |
|---|---|---|
| 확인 필요 | 전문가 권장 0개 그리고 주의 1개 이하 | 고객이 STEP 3개로 직접 확인할 수 있는 단계 |
| 주의 | 전문가 권장 0개 그리고 주의 2개 이상 | 다음 지급·서명 전에 확인을 마쳐야 하는 단계 |
| 전문가 권장 | 전문가 권장 1개 이상 | 혼자 진행하면 권리나 지급한 돈을 잃을 수 있어 전문가 검토가 필요한 단계 |
| VFBCAI 전문가팀 진행(특수 사건) | 아래 M-3 조건 1개 이상 | 퍼널 판정 대신 전문가팀 진행 안내만 표시 |

- 합산 규칙(v1 유지): 전문가 권장 1개 이상 → "전문가 권장" / 주의 2개 이상 → "주의" / 그 외 → "확인 필요".
- 같은 칸에 `/`로 묶인 값이 한 응답에서 함께 나오면 1개로 계산한다(예: `r5_td_mortgage`와 `r5_mg_release_unclear`).
- 판정 하한: `r5_paid_balance` 또는 `r5_paid_interim`이면서 `r5_rr_no_contact`·`r5_ex_no_explanation` 중 하나가 있으면 최소 "주의".

### M-3. 특수 사건 (VFBCAI 전문가팀 진행)

| 조건 | 이유 |
|---|---|
| `r5_mm_forgery_suspect` | 위조 의심은 형사 문제로 이어질 수 있고, 기관 기록 대조가 필요함 |
| `r5_rj_seller_side` | 압류·분쟁 기록은 매도인과 제3자(은행·채권자·법원)가 얽힌 문제 |
| `r5_ex_other_dispute` | 상속·이혼·채무 분쟁은 다수 당사자 사건 |
| 직접 입력에 소송·형사 고소·법원 언급 | 이미 분쟁 절차가 진행 중인 사건 |
| 직접 입력에 회사 명의 매수 언급 | 회사의 부동산 취득은 일반 퍼널 범위 밖(K 참조) — 단, 특수 사건이 아니라 "전문가 권장"으로 표시 |

### M-4. 1차 결과 "핵심 확인 결과" 3칸 (v1 유지)

1. **상황** = "{상대방}과의 거래에서 {지급 단계} 상태이며, {문제 상황}."
   - stage 요약: r5_transfer_delay "명의 이전이 약속한 시점에 끝나지 않고 있습니다" / r5_project_book_pending "핑크북이 아직 발급되지 않았습니다" / r5_book_mismatch "핑크북 내용이 계약이나 실제 집과 다릅니다" / r5_foreign_eligibility "외국인 소유 가능 여부가 확인되지 않았습니다" / r5_registration_rejected "토지등록사무소에서 신청을 받아들이지 않았습니다"
   - counterparty 요약: 개인 매도인 / 분양 회사 / 분양 계약을 넘겨준 사람 / 중개인을 통한 매도인 / 권리자가 확인되지 않은 상대방
   - paidStage 요약: 계약금만 지급한 / 중도금까지 지급한 / 잔금까지 지급한 / 중개인·지인 계좌로 지급한 / 아직 지급하지 않은
2. **확인 목표** = r5_cg_why_stuck "멈춰 있는 원인을 확인합니다" / r5_cg_doc_valid "핑크북과 계약서의 진위와 내용을 확인합니다" / r5_cg_foreign_ok "외국인 명의 소유 가능 여부와 조건을 확인합니다" / r5_cg_money_safe "지급한 돈의 안전과 남은 돈의 지급 여부를 확인합니다" / r5_cg_order "진행 순서를 정리합니다"
3. **대응·자료** = 2차 응답 전 "2차 질문에서 지금까지의 대응과 보관 자료를 확인합니다." 고정. 2차 응답 후 "{re05_customerResponse 요약}, 보관 자료: {re05_evidence 선택 항목}." (r5_ev_none이면 "보관 자료가 아직 확인되지 않았습니다.")

### M-5. "지금 확인해 보세요" STEP 3개 (v1 유지 + 대체 조건 1개 추가)

- STEP 1. 핑크북 원본이나 앞·뒷면 사본에서 소유자 이름, 면적, 주소, 뒷면의 담보 기재 내용을 확인해 주세요.
  - (re05_stage = r5_project_book_pending이면 대체) 분양 계약서에서 핑크북 발급 기한과 마지막 잔금 지급 조건이 적힌 조항을 찾아 주세요.
  - (re05_stage = r5_foreign_eligibility이면 대체) 이 집이 분양 프로젝트 안의 아파트인지, 땅이 딸린 주택인지 계약서와 분양 자료로 확인해 주세요.
- STEP 2. 계약서에서 명의 이전 기한, 세금 부담자, 잔금 지급 조건, 지연·해제 시 계약금 처리 조항을 찾아 표시해 주세요.
- STEP 3. 지금까지 지급한 금액을 날짜·금액·받은 사람 순으로 정리하고, 상대방에게 현재 진행 단계와 예정일을 메시지로 받아 두세요.
  - (re05_stage = r5_registration_rejected이면 대체) 통지서의 불수리 이유와 다시 신청할 수 있는 기간을 번역해 확인하고, 통지서 원본을 보관해 주세요.
  - (re05_paidStage = r5_paid_via_broker이면 대체, 추가) 중개인이나 지인에게 보낸 돈이 매도인에게 전달되었는지, 매도인 이름이 적힌 영수증이나 확인 메시지를 받아 두세요.


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


---
# N. My Page 데이터
- 카드 제목 = 1차 우선 확인 목표 label / AI 분석 결과 = 1차 판정 헤드라인 + 핵심 확인 결과 2줄 / 진행·현재·다음 단계 Admin MASTER 규칙 동일 / 예상 일정: 전문가 검토 완료 · 상대방·기관 대응 · 검토 결과 안내 / 전문가: VFBCAI 법률전문가팀
- 저장: Situation Profile 전체(각 노드 profile_field + 선택지 meaning)를 JSON으로 저장 → My Page·PDF·전문가 화면이 같은 원천을 읽는다.

# O. PDF 데이터
- Admin MASTER PDF Framework(무료 1페이지 / 유료 ■1차 → ■2차). 문장 원천: 각 CASE M절 위험 문장·핵심 확인 결과·STEP. 필수서류 카드 = 2차 자료 제출 목록.

# P. 외국인 고객 표현 기준
- 베트남어·현지 법률 용어 전제 금지, 경험형 쉬운 문장, "익숙한 표현(설명)" 병기(예: 핑크북(토지사용권 증서), 계약금(đặt cọc)).
- 쉬운 말 ≠ 낮은 정보량: 선택지 하나가 상황+관계+상태+행동을 담는다. 법적 결과 단정 금지.

# Q. Domain glossary
상대방(집주인·세입자·매도인·매수인·중개인) / 관련 기관(공증사무소·토지등록사무소·지역 공안·은행) / 보증금 / 계약금(đặt cọc) / 중도금·잔금 / 위약금 / 손해배상금 / 지급 / 공제 / 핑크북(토지사용권 증서) / 명의 이전 / 공증 / 임시거주 신고 / 분양 계약 / 담보(은행 대출) / 해지 / 퇴거 / 시정 / 보낸 사람 / 우편·등기우편.
사용 금지: 행정·교통·벌금·과태료·납부(세금 제외)·출석·소명·처분·발신 기관·등기부·내용증명·제출기관.
