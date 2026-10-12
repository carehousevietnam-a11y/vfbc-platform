# 법인설립 직접 인허가 받기 콘텐츠 설계서

이 문서는 scripts/company-content-spec.mjs 에서 자동 생성된다. 직접 고치지 않는다. 확인일 2026.10.12.

## 0. 구조 요약

| 항목 | 값 |
|---|---|
| 1차 질문 | 5개 |
| 2차 질문 | 8개 (2차 비율 61.5%, 기준 60% 이상) |
| 선택지 | 질문마다 5개 + 직접 입력(개수에서 제외) |
| 저장 필드 | 선택지마다 2개(첫째 정보, 별개의 둘째 정보), 질문 13개의 필드 26개가 모두 다름 |
| 경로 | 1개 |

## 1. 기존 판정 엔진 연결 (판정 함수는 바꾸지 않는다)

| 새 저장값 | 기존 판정 입력 |
|---|---|
| cap_ready | capital: confirmed |
| cap_pending_proof | capital: confirmed |
| cap_rough | capital: unconfirmed |
| cap_unknown_min | capital: unconfirmed |
| cap_undecided | capital: unconfirmed |
| off_signed | office: secured |
| off_provisional | office: 비어 있음(추가 확인 필요) |
| off_candidate | office: unsecured |
| off_residential | office: unsecured |
| off_undecided | office: unsecured |

## 2. 무료·유료 경계

| 구분 | 무료 1차 | 유료 개인화 |
|---|---|---|
| 상황 정리 | 1차 답에서 만든 카드 문장과 상황 정리 | 1차·2차 답을 합친 요약 |
| 안내 | 확인할 점, 다음 확인 | 2차 답에서 고른 안내, 서류·일정 |
| 정부 비용 | 일반 참고로 표시 | 비용 구성 |
| 판정(가능·조건부·불가) | 표시하지 않음 | 표시(기존 판정 엔진) |
| 점수 | 표시하지 않음 | 표시하지 않음 |
| 서비스 단계 추천 | 표시하지 않음 | 표시 |

## 3. 서비스 단계 추천 규칙 (유료에서만)

1. 전 과정 대행: `pc_helpWanted` ∈ {help_full} 또는 `pc_timeline` ∈ {tl_urgent, tl_asap} 또는 `pc_foreignDocs` ∈ {fd_not_started}
2. 작성과 제출 동행: `pc_helpWanted` ∈ {help_accompany} 또는 `pc_submitter` ∈ {sub_undecided} 또는 `pc_agencyKnown` ∈ {ag_unknown, ag_changed}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**베트남 법인은 누가 투자해서 세우는지, 어떤 분야의 사업을 하실 예정인가요?**

① **한국 본사 법인이 투자**해서 세웁니다. 본사 제품을 들여와 파는 무역·유통 사업을 하려고 합니다.  
② **제가 개인으로 투자**해서 세웁니다. 작은 규모로 서비스나 컨설팅 사업을 시작하려고 합니다.  
③ **현지 동업자와 함께** 투자합니다. 식당이나 카페처럼 음식을 파는 사업을 하려고 합니다.  
④ **대표사무소를 법인으로** 바꾸려고 합니다. 공장을 세워 직접 제품을 만드는 제조 사업을 하려고 합니다.  
⑤ **누가 투자할지** 아직 정하지 못했습니다. 어떤 분야의 사업을 할지도 함께 정리하고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `pc_investor=inv_corporate`, `pc_businessLine=bl_trade` | 본사 법인이 투자해 무역·유통 법인을 세우려는 상황입니다 |
| ② | `pc_investor=inv_individual`, `pc_businessLine=bl_service` | 개인 투자로 서비스 법인을 세우려는 상황입니다 |
| ③ | `pc_investor=inv_partner`, `pc_businessLine=bl_food` | 현지 동업자와 함께 음식 사업 법인을 세우려는 상황입니다 |
| ④ | `pc_investor=inv_rep_office`, `pc_businessLine=bl_manufacturing` | 대표사무소를 제조 법인으로 바꾸려는 상황입니다 |
| ⑤ | `pc_investor=inv_unsure`, `pc_businessLine=bl_undecided` | 투자 주체와 사업 분야부터 정해야 하는 상황입니다 |

### 1차 2번 — Q2

**자본금은 얼마로 정했고, 그 돈이 있다는 것을 어떤 자료로 증명할 수 있나요?**

① **자본금을 정했고** 증빙도 준비했습니다. 은행에서 발급한 잔고 증명서를 가지고 있습니다.  
② **자본금은 정했지만** 증빙은 아직입니다. 본사의 최근 재무제표로 증명하려고 준비하고 있습니다.  
③ **자본금을 대략만** 정했습니다. 자금을 증명할 자료는 아직 따로 준비하지 못한 상태입니다.  
④ **업종별 기준을 몰라** 자본금을 못 정했습니다. 어떤 자료로 자금을 증명해야 하는지도 모르겠습니다.  
⑤ **자본금을 아직** 정하지 않았습니다. 투자 규모가 정해지면 은행 잔고 증명서를 받을 생각입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `pc_capital=cap_ready`, `pc_capitalProof=cp_bank_letter` | 자본금을 정했고 은행 잔고 증명이 있는 상황입니다 |
| ② | `pc_capital=cap_pending_proof`, `pc_capitalProof=cp_parent_fs` | 자본금은 정했고 재무제표로 증빙하려는 상황입니다 |
| ③ | `pc_capital=cap_rough`, `pc_capitalProof=cp_none` | 자본금을 대략만 정해 증빙이 필요한 상황입니다 |
| ④ | `pc_capital=cap_unknown_min`, `pc_capitalProof=cp_unknown` | 업종별 자본금 기준부터 확인해야 하는 상황입니다 |
| ⑤ | `pc_capital=cap_undecided`, `pc_capitalProof=cp_bank_letter` | 투자 규모와 자본금을 정해야 하는 상황입니다 |

### 1차 3번 — Q3

**본사 주소로 쓸 사무실은 정해졌고, 그 건물은 어떤 용도의 건물인가요?**

① **사무실 임대 계약을 마쳤습니다.** 상업용 사무실 건물이라 회사 주소로 쓰는 데 문제가 없어 보입니다.  
② **가계약이나 임대 약정서**만 있습니다. 공유 오피스의 자리를 빌려 회사 주소로 쓰려고 합니다.  
③ **후보 사무실만** 알아본 상태입니다. 공장이나 창고를 함께 쓸 수 있는 곳을 찾고 있습니다.  
④ **지금 사는 집 주소**를 쓰려고 합니다. 주거용 아파트라 회사 주소로 쓸 수 있는지 모르겠습니다.  
⑤ **사무실을 아직** 정하지 못했습니다. 어떤 용도의 건물이어야 하는지도 잘 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `pc_office=off_signed`, `pc_leaseType=lt_commercial` | 상업용 건물에 사무실 계약을 마친 상황입니다 |
| ② | `pc_office=off_provisional`, `pc_leaseType=lt_shared` | 공유 오피스와 가계약 상태인 상황입니다 |
| ③ | `pc_office=off_candidate`, `pc_leaseType=lt_factory` | 공장·창고 후보만 있고 계약 전인 상황입니다 |
| ④ | `pc_office=off_residential`, `pc_leaseType=lt_apartment` | 주거용 아파트 주소를 쓰려는 상황입니다 |
| ⑤ | `pc_office=off_undecided`, `pc_leaseType=lt_unknown` | 사무실과 건물 용도부터 확인해야 하는 상황입니다 |

### 1차 4번 — Q4

**법인 대표는 베트남에 상주하나요, 그리고 해외 서류의 인증은 어디까지 했나요?**

① **대표가 베트남에 상주**하며 일합니다. 본사 서류와 여권 공증·영사 인증을 이미 마쳤습니다.  
② **대표가 오가며** 관리할 예정입니다. 본사 서류의 영사 인증을 지금 진행하고 있습니다.  
③ **현지인을 대표로** 선임하려고 합니다. 본사나 개인의 해외 서류 인증은 아직 시작하지 않았습니다.  
④ **대표를 누구로 할지** 아직 정하지 않았습니다. 개인 투자라서 인증할 해외 법인 서류는 없습니다.  
⑤ **대표가 상주해야 하는지** 모르겠습니다. 해외 서류에 인증이 필요한지도 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `pc_representative=rep_resident`, `pc_foreignDocs=fd_legalized` | 대표가 상주하고 해외 서류 인증을 마친 상황입니다 |
| ② | `pc_representative=rep_visiting`, `pc_foreignDocs=fd_in_progress` | 대표가 오가며 관리하고 서류 인증이 진행 중인 상황입니다 |
| ③ | `pc_representative=rep_local`, `pc_foreignDocs=fd_not_started` | 현지인 대표를 두고 서류 인증 전인 상황입니다 |
| ④ | `pc_representative=rep_undecided`, `pc_foreignDocs=fd_na` | 대표를 정해야 하고 해외 법인 서류는 없는 상황입니다 |
| ⑤ | `pc_representative=rep_unknown`, `pc_foreignDocs=fd_unknown` | 대표 상주와 서류 인증 필요 여부를 확인할 상황입니다 |

### 1차 5번 — Q5

**지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?**

① **총비용이 얼마인지** 걱정됩니다. 필요한 서류는 제가 만들 수 있도록 안내만 받고 싶습니다.  
② **필요한 서류가 무엇인지** 모르겠습니다. 서류 작성 방법을 하나씩 알려 주면 직접 준비하겠습니다.  
③ **설립이 언제 끝날지** 걱정됩니다. 제출하는 날 담당 기관에 통역과 함께 가고 싶습니다.  
④ **외국인이 할 수 있는 업종인지** 모르겠습니다. 서류 준비부터 제출과 수령까지 모두 맡기고 싶습니다.  
⑤ **받은 견적이 적정한지** 모르겠습니다. 서류는 제가 준비하고 제출할 때만 함께 가고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `pc_mainConcern=concern_cost`, `pc_helpWanted=help_guide` | 총비용을 알고 직접 서류를 준비하려는 상황입니다 |
| ② | `pc_mainConcern=concern_docs`, `pc_helpWanted=help_guide` | 필요한 서류부터 알고 싶은 상황입니다 |
| ③ | `pc_mainConcern=concern_time`, `pc_helpWanted=help_accompany` | 설립 일정이 걱정되어 제출 동행을 원하는 상황입니다 |
| ④ | `pc_mainConcern=concern_eligibility`, `pc_helpWanted=help_full` | 업종 가능 여부가 걱정되어 전 과정을 맡기려는 상황입니다 |
| ⑤ | `pc_mainConcern=concern_quote`, `pc_helpWanted=help_accompany` | 받은 견적이 적정한지 확인하려는 상황입니다 |

### 2차 6번 — Q6

**설립 신청 서류는 어디까지 준비되었고, 베트남어 번역이 필요한 서류가 있나요?**

① **신청서, 여권, 자금 증빙, 사무실 계약서를 모두** 준비했습니다. 모든 서류의 베트남어 번역도 이미 끝냈습니다.  
② **대부분 준비**했고 몇 가지만 남았습니다. 해외에서 받은 서류는 번역과 공증이 필요합니다.  
③ **절반쯤 준비**했습니다. 베트남어 번역이 필요한 서류가 있는지 몰라서 확인이 필요합니다.  
④ **거의 준비하지 못했습니다.** 번역과 공증을 어디서 어떻게 하는지도 함께 알고 싶습니다.  
⑤ **무엇이 필요한지 아직 모릅니다.** 준비한 서류가 없어서 번역할 서류도 아직 없는 상태입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_docs=docs_all`, `pc_translation=tn_none` | 서류가 갖춰졌으니 서류마다 이름·주소·자본금 숫자가 서로 맞는지만 확인하고 접수하세요. |
| ② | `pc_docs=docs_most`, `pc_translation=tn_needed` | 남은 서류와 번역·공증이 필요한 서류를 나누어 적고 인증 기간을 먼저 확인하세요. |
| ③ | `pc_docs=docs_half`, `pc_translation=tn_unsure` | 준비한 서류 목록을 만든 뒤 해외 발급 서류를 골라내면 번역 대상이 분명해집니다. |
| ④ | `pc_docs=docs_little`, `pc_translation=tn_needed` | 투자자 형태(법인·개인)에 따라 서류가 달라지니 그 기준의 목록부터 받으세요. |
| ⑤ | `pc_docs=docs_unknown`, `pc_translation=tn_none` | 서류를 모으기 전에 투자 등록과 기업 등록 두 단계에 필요한 서류를 먼저 확인하세요. |

### 2차 7번 — Q7

**투자 자본을 넣을 은행 계좌는 열었고, 자본금은 언제까지 송금할 계획인가요?**

① **투자 자본 계좌를 이미** 열었습니다. 정해진 기한 안에 자본금을 한 번에 송금할 계획입니다.  
② **은행만 정해** 두었습니다. 자본금은 본사 사정에 맞춰 몇 번에 나누어 송금하려고 합니다.  
③ **계좌를 아직** 열지 않았습니다. 자본금을 설립 후 언제까지 넣어야 하는지 잘 모르겠습니다.  
④ **투자 자본 계좌가 필요한지** 모르겠습니다. 본국 송금 절차 때문에 송금이 늦어질 수 있어 걱정입니다.  
⑤ **계좌는 법인 설립 후** 열 예정입니다. 정해진 기한 안에 한 번에 송금할 생각입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_bankAccount=ba_opened`, `pc_capitalTransfer=ct_planned` | 송금할 때 송금 목적을 자본금 납입으로 적어야 나중에 증빙이 쉬워집니다. |
| ② | `pc_bankAccount=ba_bank_chosen`, `pc_capitalTransfer=ct_partial` | 나누어 송금해도 기한 안에 전액을 넣어야 하니 송금 일정을 표로 정리해 두세요. |
| ③ | `pc_bankAccount=ba_not_yet`, `pc_capitalTransfer=ct_unsure_deadline` | 자본금은 설립 후 정해진 기간 안에 넣어야 하니 계좌 개설과 송금 일정을 함께 잡으세요. |
| ④ | `pc_bankAccount=ba_unknown`, `pc_capitalTransfer=ct_delay` | 외국인 투자금은 전용 계좌로 들어와야 하니 계좌부터 열고 송금 지연 사유를 미리 확인하세요. |
| ⑤ | `pc_bankAccount=ba_not_yet_after`, `pc_capitalTransfer=ct_planned` | 설립 직후 계좌를 열 수 있도록 은행이 요구하는 서류를 미리 알아 두세요. |

### 2차 8번 — Q8

**법인 설립 외에 업종별로 추가로 받아야 할 허가가 있고, 그 순서를 알고 계신가요?**

① **추가 허가 없이** 바로 영업할 수 있는 업종입니다. 추가 허가의 순서를 따로 정할 필요가 없습니다.  
② **식품 위생이나 소방 허가**가 따로 필요합니다. 법인 설립을 마친 뒤에 진행할 예정입니다.  
③ **수출입이나 유통 허가**가 필요합니다. 법인 설립과 어떤 순서로 받아야 하는지 잘 모르겠습니다.  
④ **환경 관련 허가**가 필요할 것 같습니다. 공장 가동 전에 받아야 하는 것으로 알고 있습니다.  
⑤ **추가 허가가 필요한지** 모르겠습니다. 필요하다면 어떤 순서로 하는지도 알고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_subLicense=sl_none`, `pc_subOrder=sc_known` | 추가 허가가 없더라도 업종 코드가 실제 사업과 맞는지 등록 전에 확인하세요. |
| ② | `pc_subLicense=sl_food`, `pc_subOrder=sc_after` | 식당·카페는 설립 후 위생·소방 허가가 필요하니 매장 공사 일정과 함께 준비하세요. |
| ③ | `pc_subLicense=sl_trade`, `pc_subOrder=sc_unknown` | 외국인 투자 유통은 별도 허가가 필요할 수 있으니 투자 등록 단계에서 함께 확인하세요. |
| ④ | `pc_subLicense=sl_env`, `pc_subOrder=sc_known` | 제조업은 환경 허가가 공장 설계와 함께 가야 하니 설립과 동시에 준비를 시작하세요. |
| ⑤ | `pc_subLicense=sl_unknown`, `pc_subOrder=sc_unknown` | 사업 분야를 정하면 추가 허가가 정해지니 업종 코드부터 확정하세요. |

### 2차 9번 — Q9

**법인 설립은 언제까지 마쳐야 하고, 실제 영업은 언제 시작할 예정인가요?**

① **한 달 안에** 설립을 마쳐야 합니다. 영업 시작일이 이미 정해져 있어서 미루기 어렵습니다.  
② **두세 달 안에** 마치면 됩니다. 사무실 임대가 시작되는 날에 맞춰 영업하려고 합니다.  
③ **급하지는 않습니다.** 직원을 먼저 뽑고 교육을 마친 뒤에 영업을 시작할 계획입니다.  
④ **설립 시점을 아직** 정하지 못했습니다. 영업을 언제 시작할지도 아직 정하지 않았습니다.  
⑤ **가능한 빨리** 마치고 싶습니다. 사무실 임대가 시작되는 날에 맞춰 바로 영업하려고 합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_timeline=tl_urgent`, `pc_openPlan=op_date` | 투자 등록과 기업 등록에 각각 시간이 걸리니 서류 인증부터 바로 시작해야 합니다. |
| ② | `pc_timeline=tl_2_3m`, `pc_openPlan=op_lease_start` | 임대 시작일 전에 설립이 끝나도록 서류 인증 기간을 거꾸로 계산해 보세요. |
| ③ | `pc_timeline=tl_flexible`, `pc_openPlan=op_after_staff` | 시간 여유가 있으니 외국인 직원 노동허가 일정까지 함께 계획하세요. |
| ④ | `pc_timeline=tl_unsure`, `pc_openPlan=op_unsure` | 설립 시점이 정해져야 사무실 계약과 송금 일정을 맞출 수 있습니다. |
| ⑤ | `pc_timeline=tl_asap`, `pc_openPlan=op_lease_start` | 빨리 끝내려면 서류 인증과 번역을 동시에 진행하고 보완 요구를 줄이는 것이 가장 중요합니다. |

### 2차 10번 — Q10

**받아 본 견적은 몇 건이고, 정부 비용과 대행 범위가 구분되어 있나요?**

① **견적을 받은 적이 없습니다.** 비교할 금액이 없어서 무엇을 확인해야 하는지도 아직 모르겠습니다.  
② **한 곳에서 서면 견적**을 받았습니다. 정부 비용과 대행료가 따로 적혀 있어서 금액을 확인하기 쉽습니다.  
③ **여러 곳에서 견적**을 받았습니다. 항목이 섞여 있어서 업체마다 무엇이 다른지 비교하기 어렵습니다.  
④ **말로만 금액**을 들었습니다. 어디까지 포함인지 확인하지 못했고 문서로 받은 것도 없습니다.  
⑤ **광고에 나온 가격**만 보았습니다. 추가 비용이 붙는지 알아보지 못해서 실제 금액이 얼마일지 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_quoteStatus=quote_none`, `pc_quoteScope=qs_na` | 견적을 받기 전에 정부 비용, 인증·번역비, 대행료를 나누어 요청하세요. |
| ② | `pc_quoteStatus=quote_one`, `pc_quoteScope=qs_clear` | 항목이 나뉘어 있으니 투자 등록과 기업 등록, 인장·계좌 개설까지 포함되는지 확인하세요. |
| ③ | `pc_quoteStatus=quote_several`, `pc_quoteScope=qs_mixed` | 업체마다 포함 항목이 다르므로 같은 기준표로 옮겨 적으면 비교가 쉬워집니다. |
| ④ | `pc_quoteStatus=quote_verbal`, `pc_quoteScope=qs_unknown` | 말로 들은 금액은 문서로 받아 포함 범위와 추가 비용 조건을 확인하세요. |
| ⑤ | `pc_quoteStatus=quote_ad`, `pc_quoteScope=qs_unknown` | 광고 가격은 기본 구성인 경우가 많으니 내 업종에서 더해지는 허가 비용을 직접 물어보세요. |

### 2차 11번 — Q11

**투자하시는 분의 국적은 어디이고, 신청서는 누가 제출하게 될 예정인가요?**

① **대한민국** 국적입니다. 제가 직접 담당 기관에 서류를 제출하려고 준비하고 있습니다.  
② **중국** 국적입니다. 베트남 직원이 담당 기관에 서류를 대신 제출해 주기로 했습니다.  
③ **일본** 국적입니다. 대행사에 서류 제출을 맡기려고 어느 업체가 좋을지 알아보는 중입니다.  
④ **그 밖의 아시아 국가** 국적입니다. 누가 제출할지 아직 정하지 못해서 방법별로 비교해 보고 싶습니다.  
⑤ **그 밖의 지역** 국적입니다. 직접 제출하지만 베트남어를 몰라서 통역이 꼭 필요한 상황입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_nationality=nat_korea`, `pc_submitter=sub_self` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `pc_nationality=nat_china`, `pc_submitter=sub_staff` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `pc_nationality=nat_japan`, `pc_submitter=sub_agency` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `pc_nationality=nat_other_asia`, `pc_submitter=sub_undecided` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `pc_nationality=nat_other`, `pc_submitter=sub_self` | 국적에 따라 서류 인증 방법이 다를 수 있으니 본국 서류의 인증 절차를 먼저 확인하세요. |

### 2차 12번 — Q12

**법인을 세운 뒤에 가장 먼저 할 일은 무엇이고, 그 준비는 어디까지 정리했나요?**

① **세무와 회계 신고**를 먼저 준비하려고 합니다. 설립 후에 할 일을 이미 순서대로 정리해 두었습니다.  
② **외국인 직원을 채용**하려고 합니다. 채용에 필요한 절차는 일부만 알아본 상태입니다.  
③ **대표의 비자와 거주증**을 준비하려고 합니다. 설립 후 할 일은 아직 생각해 보지 않았습니다.  
④ **회사 계좌와 인보이스**를 먼저 준비하려고 합니다. 설립 후에 해야 할 일을 일부만 정리해 두었습니다.  
⑤ **설립 후에 무엇을 해야 하는지** 모르겠습니다. 그 다음 단계는 아직 생각해 보지 않았습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_postSetup=ps_tax`, `pc_postPlan=pf_ready` | 설립 직후 세무 신고 기한이 바로 시작되니 회계 담당을 미리 정해 두세요. |
| ② | `pc_postSetup=ps_hiring`, `pc_postPlan=pf_partial` | 외국인 직원은 노동허가가 필요하니 설립 일정과 함께 노동허가 일정도 잡아 두세요. |
| ③ | `pc_postSetup=ps_visa`, `pc_postPlan=pf_none` | 대표가 상주한다면 법인 설립 후 노동허가와 거주증을 이어서 준비해야 합니다. |
| ④ | `pc_postSetup=ps_bank`, `pc_postPlan=pf_partial` | 운영 계좌와 전자 인보이스는 영업 시작 전에 갖춰야 하니 설립 직후 바로 진행하세요. |
| ⑤ | `pc_postSetup=ps_unknown`, `pc_postPlan=pf_none` | 설립 후 첫 달에 할 일(세무 등록, 계좌, 직원 서류)을 목록으로 받아 두세요. |

### 2차 13번 — Q13

**법인을 세울 지역은 어디이고, 신청서를 받는 담당 기관을 알고 계신가요?**

① **하노이**에 세웁니다. 신청을 받는 담당 기관의 위치와 온라인 접수 방법을 이미 알고 있습니다.  
② **호치민**에 세웁니다. 어느 기관에 신청서를 내야 하는지 몰라서 그것부터 알고 싶습니다.  
③ **다낭**에 세웁니다. 최근 기관이 통합되어 신청을 받는 담당 기관이 바뀌었는지 모르겠습니다.  
④ **그 밖의 도시**에 세웁니다. 담당 기관은 알고 있지만 온라인 접수 방법은 아직 모르는 상태입니다.  
⑤ **산업단지 안**에 세웁니다. 산업단지 관리 기관이 신청을 받는지 다른 곳이 받는지 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_area=area_hanoi`, `pc_agencyKnown=ag_known` | 온라인 접수 후 원본 제출이 필요한지만 한 번 더 확인하세요. |
| ② | `pc_area=area_hcm`, `pc_agencyKnown=ag_unknown` | 지역 담당 기관을 먼저 확인해야 접수 방법과 처리 기간을 알 수 있습니다. |
| ③ | `pc_area=area_danang`, `pc_agencyKnown=ag_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `pc_area=area_other_city`, `pc_agencyKnown=ag_known` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `pc_area=area_ip`, `pc_agencyKnown=ag_unknown` | 산업단지 안이라면 산업단지 관리 기관이 담당하는 경우가 많으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `pc_mainConcern=concern_cost`, `pc_helpWanted=help_guide` | 총비용을 확인하고 서류는 직접 준비하려는 상황입니다 | 법인 설립 비용은 정부 비용 외에 서류 인증·번역, 사무실 임대, 대행료로 나뉩니다. 투자자 형태별 서류 목록을 받아 인증이 오래 걸리는 서류부터 준비하세요. |
| `pc_mainConcern=concern_docs`, `pc_helpWanted=help_guide` | 필요한 서류부터 확인해 직접 준비하려는 상황입니다 | 외국인 법인 설립은 투자 등록과 기업 등록 두 단계로 진행되고, 투자자 신분 서류, 자금 증빙, 사무실 계약서가 기본입니다. 투자자 형태에 따라 서류가 달라집니다. |
| `pc_mainConcern=concern_time`, `pc_helpWanted=help_accompany` | 설립 일정이 걱정되어 제출 동행을 원하는 상황입니다 | 서류가 갖춰진 뒤 투자 등록과 기업 등록에 각각 처리 기간이 걸리고, 해외 서류 인증에 시간이 가장 많이 듭니다. 인증부터 시작하면 일정을 줄일 수 있습니다. |
| `pc_mainConcern=concern_eligibility`, `pc_helpWanted=help_full` | 업종 가능 여부가 걱정되어 전 과정을 맡기려는 상황입니다 | 외국인 투자는 업종에 따라 조건이 붙거나 제한될 수 있습니다. 2차 답변으로 사업 분야와 추가 허가를 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `pc_mainConcern=concern_quote`, `pc_helpWanted=help_accompany` | 받은 견적을 확인하고 제출은 함께 하려는 상황입니다 | 견적은 투자 등록, 기업 등록, 인장·계좌 개설, 인증·번역이 각각 포함되는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 보입니다. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (capital) | `pc_capital` ∈ {cap_rough, cap_unknown_min, cap_undecided} | 자본금이 정해지지 않으면 투자 등록을 신청할 수 없어 업종 기준에 맞춰 자본금부터 정해야 합니다 |
| 2 (proof) | `pc_capitalProof` ∈ {cp_none, cp_unknown} | 자금을 증명할 자료가 없으면 보완 요구를 받을 수 있어 은행 잔고 증명이나 재무제표를 준비하세요 |
| 3 (office) | `pc_office` ∈ {off_candidate, off_residential, off_undecided} | 회사 주소로 쓸 사무실이 확정되지 않으면 신청이 어려워 계약 가능한 사무실부터 정해야 합니다 |
| 4 (apartment) | `pc_leaseType` ∈ {lt_apartment} | 주거용 아파트는 회사 주소로 인정되지 않을 수 있어 건물 용도를 먼저 확인해야 합니다 |
| 5 (legal) | `pc_foreignDocs` ∈ {fd_not_started, fd_unknown} | 해외 서류는 영사 인증과 번역에 시간이 걸리니 가장 먼저 인증을 시작하세요 |
| 6 (transfer) | `pc_capitalTransfer` ∈ {ct_unsure_deadline, ct_delay} | 자본금은 설립 후 정해진 기간 안에 송금해야 하니 송금 일정과 계좌를 미리 정해야 합니다 |
| 7 (sublicense) | `pc_subLicense` ∈ {sl_trade, sl_unknown} | 업종에 따라 별도 허가가 필요할 수 있어 투자 등록 단계에서 함께 확인해야 합니다 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 접수 전에 서류의 이름·주소·자본금 숫자가 서로 맞는지 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 노동허가 확인 | `pc_postSetup` ∈ {ps_hiring, ps_visa} 또는 `pc_representative` ∈ {rep_resident} | 대표나 외국인 직원이 일하게 된다면 노동허가 직접 확인에서 이어서 점검해 보실 수 있습니다. |
| 식당 허가 확인 | `pc_businessLine` ∈ {bl_food} 또는 `pc_subLicense` ∈ {sl_food} | 식당·카페를 여신다면 식당 허가 확인에서 위생·소방 준비를 함께 점검해 보실 수 있습니다. |
| 전문가 진행 | `pc_timeline` ∈ {tl_urgent} 또는 `pc_foreignDocs` ∈ {fd_not_started} 또는 `pc_helpWanted` ∈ {help_full} | 일정이 급하거나 서류 인증을 시작하지 못했다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

## 8. 값 → 고객 표시 문구

| 내부 값 | 고객 화면 표시 |
|---|---|
| `ag_changed` | 기관 통합으로 담당이 불확실함 |
| `ag_known` | 담당 기관을 알고 있음 |
| `ag_unknown` | 담당 기관을 모름 |
| `area_danang` | 다낭 |
| `area_hanoi` | 하노이 |
| `area_hcm` | 호치민 |
| `area_ip` | 산업단지 |
| `area_other_city` | 그 밖의 도시 |
| `ba_bank_chosen` | 은행만 정함 |
| `ba_not_yet` | 계좌 개설 전 |
| `ba_not_yet_after` | 설립 후 계좌 개설 예정 |
| `ba_opened` | 투자 자본 계좌 개설 |
| `ba_unknown` | 계좌 필요 여부를 모름 |
| `bl_food` | 식당·카페 |
| `bl_manufacturing` | 제조 |
| `bl_service` | 서비스·컨설팅 |
| `bl_trade` | 무역·유통 |
| `bl_undecided` | 사업 분야 미정 |
| `cap_pending_proof` | 자본금 확정, 잔고 증명 전 |
| `cap_ready` | 자본금 확정, 잔고 증명 준비 |
| `cap_rough` | 자본금을 대략만 정함 |
| `cap_undecided` | 자본금 미정 |
| `cap_unknown_min` | 업종별 기준을 몰라 미정 |
| `concern_cost` | 총비용 걱정 |
| `concern_docs` | 필요 서류 걱정 |
| `concern_eligibility` | 투자 가능 업종 걱정 |
| `concern_quote` | 받은 견적의 적정성 걱정 |
| `concern_time` | 설립 일정 걱정 |
| `cp_bank_letter` | 은행 잔고 증명서 보유 |
| `cp_none` | 증빙 자료 없음 |
| `cp_parent_fs` | 본사 재무제표 보유 |
| `cp_unknown` | 필요한 증빙을 모름 |
| `ct_delay` | 송금이 늦어질 수 있음 |
| `ct_partial` | 나누어 송금 예정 |
| `ct_planned` | 기한 안 송금 계획 |
| `ct_unsure_deadline` | 송금 기한을 모름 |
| `docs_all` | 기본 서류 모두 준비 |
| `docs_half` | 기본 서류 절반 준비 |
| `docs_little` | 기본 서류 거의 미준비 |
| `docs_most` | 기본 서류 대부분 준비 |
| `docs_unknown` | 필요 서류를 모름 |
| `fd_in_progress` | 서류 인증 진행 중 |
| `fd_legalized` | 본사·개인 서류 인증 완료 |
| `fd_na` | 인증할 해외 서류 없음 |
| `fd_not_started` | 서류 인증 시작 전 |
| `fd_unknown` | 인증 필요 여부를 모름 |
| `help_accompany` | 서류 작성과 제출 동행을 원함 |
| `help_full` | 전 과정 대행을 원함 |
| `help_guide` | 서류 작성 안내를 원함 |
| `inv_corporate` | 본사 법인이 투자 |
| `inv_individual` | 개인이 투자 |
| `inv_partner` | 현지 동업자와 공동 투자 |
| `inv_rep_office` | 대표사무소에서 법인으로 전환 |
| `inv_unsure` | 투자자 형태 미정 |
| `lt_apartment` | 주거용 아파트 |
| `lt_commercial` | 상업용 건물 |
| `lt_factory` | 공장·창고 |
| `lt_shared` | 공유 오피스 |
| `lt_unknown` | 건물 용도를 모름 |
| `nat_china` | 중국 국적 |
| `nat_japan` | 일본 국적 |
| `nat_korea` | 대한민국 국적 |
| `nat_other` | 그 밖의 지역 국적 |
| `nat_other_asia` | 그 밖의 아시아 국적 |
| `off_candidate` | 후보 사무실만 있음 |
| `off_provisional` | 사무실 가계약·약정서 |
| `off_residential` | 주거용 집 주소를 쓰려 함 |
| `off_signed` | 사무실 임대 계약 완료 |
| `off_undecided` | 사무실 미정 |
| `op_after_staff` | 직원 채용 후 영업 |
| `op_date` | 영업 시작일 정해짐 |
| `op_lease_start` | 임대 시작에 맞춰 영업 |
| `op_unsure` | 영업 시작일 미정 |
| `pf_none` | 아직 생각하지 않음 |
| `pf_partial` | 일부만 정리함 |
| `pf_ready` | 설립 후 할 일을 정리함 |
| `ps_bank` | 회사 운영 계좌·인보이스 준비 |
| `ps_hiring` | 외국인 직원 채용 |
| `ps_tax` | 세무·회계 신고 준비 |
| `ps_unknown` | 설립 후 할 일을 모름 |
| `ps_visa` | 대표 비자·거주증 준비 |
| `qs_clear` | 정부 비용과 대행료가 구분됨 |
| `qs_mixed` | 항목이 섞여 비교 어려움 |
| `qs_na` | 비교할 견적 없음 |
| `qs_unknown` | 포함 범위를 모름 |
| `quote_ad` | 광고 가격만 봄 |
| `quote_none` | 받은 견적 없음 |
| `quote_one` | 서면 견적 1건 |
| `quote_several` | 여러 곳의 견적 |
| `quote_verbal` | 말로만 들은 금액 |
| `rep_local` | 현지인을 대표로 선임 |
| `rep_resident` | 대표가 베트남에 상주 |
| `rep_undecided` | 대표 미정 |
| `rep_unknown` | 대표 상주 필요 여부를 모름 |
| `rep_visiting` | 대표가 오가며 관리 |
| `sc_after` | 설립 후 진행 예정 |
| `sc_known` | 추가 허가 순서를 알고 있음 |
| `sc_unknown` | 추가 허가 순서를 모름 |
| `sl_env` | 환경 허가 필요 |
| `sl_food` | 식품 위생·소방 허가 필요 |
| `sl_none` | 추가 허가 불필요 |
| `sl_trade` | 수출입·유통 허가 필요 |
| `sl_unknown` | 추가 허가 필요 여부를 모름 |
| `sub_agency` | 대행사가 제출 |
| `sub_self` | 직접 제출 |
| `sub_staff` | 직원이 제출 |
| `sub_undecided` | 제출 방식 미정 |
| `tl_2_3m` | 두세 달 안에 설립 |
| `tl_asap` | 가능한 빨리 설립 |
| `tl_flexible` | 급하지 않음 |
| `tl_unsure` | 설립 시점 미정 |
| `tl_urgent` | 한 달 안에 설립 필요 |
| `tn_needed` | 번역 필요함 |
| `tn_none` | 번역 필요 없음 |
| `tn_unsure` | 번역 필요 여부 모름 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 투자법 (제61/2020/QH14호): 외국인 투자자는 투자 등록 후 법인 설립 | 베트남 국회 / 하이퐁시 재무국 안내 | 법령(공식 기관 안내로 확인) | https://sotc.haiphong.gov.vn/en/services/hoi-dap-dau-tu | 처리 기간과 조문 번호는 공식 원문 대조 필요 |
| 2 | 기업법 (제59/2020/QH14호): 기업 등록과 자본금 납입 기한 | 베트남 국회 | 법령(이차 자료로 확인) | https://thuvienphapluat.vn/hoi-dap-phap-luat/phai-gop-von-du-cho-cong-ty-trong-vong-bao-nhieu-ngay-368437.html | 자본금 납입 기한(90일)은 제47조 2항으로 확인함(이차 자료 기준). 그 외 조문 번호는 공식 원문 대조 필요 |
