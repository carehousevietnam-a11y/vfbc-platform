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

1. 전 과정 대행: `pc_timeline` ∈ {tl_urgent, tl_asap} 또는 `pc_foreignDocs` ∈ {fd_not_started} 또는 `pc_situation` ∈ {sit_operating}
2. 작성과 제출 동행: `pc_submitter` ∈ {sub_undecided} 또는 `pc_agencyNeed` ∈ {an_office, an_changed, an_zone} 또는 `pc_situation` ∈ {sit_rejected} 또는 `pc_langRoute` ∈ {lr_none}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**베트남에 법인을 세우려는데, 누가 투자하는 형태이고 가장 막막한 부분은 어디인가요?**

① **한국 본사가 투자해서** 법인을 세우려고 합니다. 본사 서류에 인증이 어디까지 필요한지, 투자 등록(외국인 투자 허가)이 어떻게 진행되는지 모르겠습니다.  
② **제가 개인으로 투자해서** 세우려고 합니다. 개인이 세울 수 있는 업종과 필요한 자본금 기준이 어떻게 되는지 모르겠습니다.  
③ **현지 동업자와 함께 투자합니다.** 지분을 어떻게 나누는지, 외국인 지분에 제한이 있는 업종인지 걱정됩니다.  
④ **대표사무소를 법인으로** 바꾸려고 합니다. 기존 대표사무소를 어떻게 정리하고 법인으로 옮기는지 모르겠습니다.  
⑤ **누가 투자하는 게 좋을지** 아직 못 정했습니다. 어떤 투자 형태가 우리 상황에 맞는지 비교해서 알고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `pc_investor=inv_corporate`, `pc_investorFocus=if_hq_docs` | 본사 법인이 투자하며 본사 서류와 투자 등록 절차를 확인하려는 상황입니다 |
| ② | `pc_investor=inv_individual`, `pc_investorFocus=if_individual_scope` | 개인 투자로 설립 가능한 업종과 자본금 기준을 확인하려는 상황입니다 |
| ③ | `pc_investor=inv_partner`, `pc_investorFocus=if_partner_share` | 현지 동업자와 공동 투자하며 지분 구조를 확인하려는 상황입니다 |
| ④ | `pc_investor=inv_rep_office`, `pc_investorFocus=if_rep_convert` | 대표사무소를 법인으로 전환하는 절차를 확인하려는 상황입니다 |
| ⑤ | `pc_investor=inv_unsure`, `pc_investorFocus=if_compare` | 투자 형태부터 비교해 정해야 하는 상황입니다 |

### 1차 2번 — Q2

**자본금은 얼마로 생각하고 계시고, 그 돈이 있다는 걸 보여 줄 자료는 준비되어 있나요?**

① **자본금을 정했고 준비도 했습니다.** 은행에서 발급한 잔고 증명서를 가지고 있습니다.  
② **자본금은 정했는데 증명이 아직입니다.** 본사의 최근 재무제표로 증명하려고 준비하고 있습니다.  
③ **자본금은 대략만 정했습니다.** 자금을 증명할 자료는 아직 따로 준비하지 못했습니다.  
④ **업종별 기준을 몰라** 자본금을 못 정했습니다. 어떤 자료로 자금을 증명해야 하는지도 모르겠습니다.  
⑤ **자본금을 아직 정하지 않았습니다.** 투자 규모가 정해지면 은행 잔고 증명서를 받을 생각입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `pc_capital=cap_ready`, `pc_capitalProof=cp_bank_letter` | 자본금을 정했고 은행 잔고 증명이 있는 상황입니다 |
| ② | `pc_capital=cap_pending_proof`, `pc_capitalProof=cp_parent_fs` | 자본금은 정했고 재무제표로 증빙하려는 상황입니다 |
| ③ | `pc_capital=cap_rough`, `pc_capitalProof=cp_none` | 자본금을 대략만 정해 증빙이 필요한 상황입니다 |
| ④ | `pc_capital=cap_unknown_min`, `pc_capitalProof=cp_unknown` | 업종별 자본금 기준부터 확인해야 하는 상황입니다 |
| ⑤ | `pc_capital=cap_undecided`, `pc_capitalProof=cp_bank_letter` | 투자 규모와 자본금을 정해야 하는 상황입니다 |

### 1차 3번 — Q3

**회사 주소로 쓸 사무실은 정하셨고, 그 건물이 회사 주소로 써도 되는 곳인지 확인해 보셨나요?**

① **사무실 임대 계약은 했습니다.** 상업용 사무실 건물이라 회사 주소로 써도 문제가 없을 거라고 생각합니다.  
② **가계약만 한 상태입니다.** 가계약한 곳은 공유 오피스의 자리인데 회사 주소로 써도 되는지 모르겠습니다.  
③ **후보 사무실만 알아봤습니다.** 후보 중에 공장이나 창고를 함께 쓰는 건물도 있어서 주소로 써도 되는지 걱정입니다.  
④ **지금 사는 집 주소를 쓰려고** 합니다. 주거용 아파트인데 회사 주소로 쓸 수 있는지 모르겠습니다.  
⑤ **사무실을 아직 못 정했습니다.** 어떤 용도의 건물이어야 회사 주소로 쓸 수 있는지도 잘 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `pc_office=off_signed`, `pc_leaseType=lt_commercial` | 상업용 건물에 사무실 계약을 마친 상황입니다 |
| ② | `pc_office=off_provisional`, `pc_leaseType=lt_shared` | 공유 오피스와 가계약 상태인 상황입니다 |
| ③ | `pc_office=off_candidate`, `pc_leaseType=lt_factory` | 공장·창고 후보만 있고 계약 전인 상황입니다 |
| ④ | `pc_office=off_residential`, `pc_leaseType=lt_apartment` | 주거용 아파트 주소를 쓰려는 상황입니다 |
| ⑤ | `pc_office=off_undecided`, `pc_leaseType=lt_unknown` | 사무실과 건물 용도부터 확인해야 하는 상황입니다 |

### 1차 4번 — Q4

**법인 대표는 베트남에 상주하실 예정이고, 한국에서 가져올 서류의 인증은 어디까지 하셨나요?**

① **대표가 베트남에 상주하며 일합니다.** 본사 서류와 여권 공증·영사 인증은 이미 마쳤습니다.  
② **대표가 오가며 관리할 예정입니다.** 본사 서류의 영사 인증을 지금 진행하고 있는데 얼마나 걸릴지 모르겠습니다.  
③ **현지인을 대표로 세우려고** 합니다. 투자하는 본사나 개인의 해외 서류 인증은 아직 시작하지 않았습니다.  
④ **대표를 누구로 할지** 아직 못 정했습니다. 대표가 정해져야 서류를 준비할 수 있어서 해외 서류 인증도 시작하지 못했습니다.  
⑤ **대표가 상주해야 하는지** 모르겠습니다. 해외 서류에 인증이 필요한지도 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `pc_representative=rep_resident`, `pc_foreignDocs=fd_legalized` | 대표가 상주하고 해외 서류 인증을 마친 상황입니다 |
| ② | `pc_representative=rep_visiting`, `pc_foreignDocs=fd_in_progress` | 대표가 오가며 관리하고 서류 인증이 진행 중인 상황입니다 |
| ③ | `pc_representative=rep_local`, `pc_foreignDocs=fd_not_started` | 현지인 대표를 두고 서류 인증 전인 상황입니다 |
| ④ | `pc_representative=rep_undecided`, `pc_foreignDocs=fd_not_started` | 대표를 정해야 하고 해외 서류 인증도 시작 전인 상황입니다 |
| ⑤ | `pc_representative=rep_unknown`, `pc_foreignDocs=fd_unknown` | 대표 상주와 서류 인증 필요 여부를 확인할 상황입니다 |

### 1차 5번 — Q5

**이 일을 하시면서 가장 답답하고 불안한 점은 무엇이고, 지금 어떤 상황인가요?**

① **어디서부터 시작해야 할지** 막막합니다. 검색도 해 봤는데 베트남어 자료라 어떤 말이 맞는지 모르겠습니다.  
② **일이 제대로 되고 있는지** 불안합니다. 베트남 지인이나 직원이 알아서 한다는데 어디까지 됐는지 알 수 없습니다.  
③ **사람마다 말이 달라** 혼란스럽습니다. 본사, 업체, 지인이 각자 다르게 말해서 누구 말이 맞는지 모르겠습니다.  
④ **담당 기관에서 연락이 올까** 겁이 납니다. 법인을 세우기 전인데 이미 현지에서 거래를 시작했습니다.  
⑤ **이미 한 번 막혀서** 지쳤습니다. 서류를 냈다가 보완하라고 돌려받은 적이 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `pc_feeling=fl_lost`, `pc_situation=sit_search_vn` | 어디서 시작할지 막막하고 베트남어 자료를 이해하기 어려운 상황입니다 |
| ② | `pc_feeling=fl_anxious`, `pc_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 알 수 없어 불안한 상황입니다 |
| ③ | `pc_feeling=fl_confused`, `pc_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 |
| ④ | `pc_feeling=fl_afraid`, `pc_situation=sit_operating` | 허가 확인 전에 시작해 불안한 상황입니다 |
| ⑤ | `pc_feeling=fl_tired`, `pc_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 |

### 2차 6번 — Q6

**허가 서류는 얼마나 모으셨고, 그 서류에 뭐라고 적혀 있는지는 어떻게 알고 계신가요?**

① **신청서, 여권, 자금 증빙, 사무실 계약서를 모두** 준비했습니다. 베트남어를 직접 읽을 수 있어서 내용도 제가 확인했습니다.  
② **거의 모았고 몇 개 남았습니다.** 베트남어를 하는 지인이나 통역해 주는 분이 서류 내용을 읽어 줍니다.  
③ **절반쯤 모았습니다.** 한국어를 하는 베트남 직원이 설명해 주는데 서류 원문과 맞는지는 확인하지 못했습니다.  
④ **거의 모으지 못했습니다.** 번역기로 읽어 보니 필요한 서류가 많아 보이는데 번역이 맞는지 모르겠습니다.  
⑤ **뭐가 필요한지도** 모릅니다. 베트남어를 전혀 몰라서 서류에 뭐가 적혀 있는지 알 수 없고 물어볼 사람도 없습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_docs=docs_all`, `pc_langRoute=lr_self` | 서류가 갖춰졌으니 서류마다 이름·주소·자본금 숫자가 서로 맞는지만 확인하고 접수하세요. |
| ② | `pc_docs=docs_most`, `pc_langRoute=lr_interp` | 남은 서류와 번역·공증이 필요한 서류를 나누어 적고 인증 기간을 먼저 확인하세요. 통역한 내용이 서류 원문과 같은지 접수 전에 한 번 더 확인하세요. |
| ③ | `pc_docs=docs_half`, `pc_langRoute=lr_local` | 준비한 서류 목록을 만든 뒤 해외 발급 서류를 골라내면 번역 대상이 분명해집니다. 직원 설명은 서류 원문과 대조해 확인하세요. |
| ④ | `pc_docs=docs_little`, `pc_langRoute=lr_machine` | 투자자 형태(법인·개인)에 따라 서류가 달라지니 그 기준의 목록부터 받으세요. 인공지능 번역은 법률 용어와 숫자가 틀릴 수 있으니 중요한 서류는 전문가 확인을 받으세요. |
| ⑤ | `pc_docs=docs_unknown`, `pc_langRoute=lr_none` | 서류를 모으기 전에 투자 등록(외국인 투자 허가)과 기업 등록(회사 설립 등록) 두 단계에 필요한 서류를 먼저 확인하세요. 베트남어 서류를 읽어 줄 사람이나 전문 번역부터 정하세요. |

### 2차 7번 — Q7

**투자 자본을 넣을 은행 계좌는 열어 두셨고, 자본금 송금은 언제까지 해야 하는지 알고 계신가요?**

① **투자 자본 계좌는 열었습니다.** 정해진 기한 안에 자본금을 한 번에 보낼 계획입니다.  
② **은행만 정해 두었습니다.** 자본금은 본사 사정에 맞춰 몇 번에 나누어 보내려고 합니다.  
③ **계좌는 아직 열지 못했습니다.** 자본금을 설립 후 언제까지 넣어야 하는지 잘 모르겠습니다.  
④ **투자 자본 계좌가 필요한지** 몰랐습니다. 본국에서 보내는 절차 때문에 송금이 늦어질까 걱정입니다.  
⑤ **계좌는 법인을 세운 뒤에 열려고** 합니다. 설립 직후 계좌를 열고 정해진 기한 안에 자본금을 한 번에 보낼 계획입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_bankAccount=ba_opened`, `pc_capitalTransfer=ct_planned` | 송금할 때 송금 목적을 자본금 납입으로 적어야 나중에 증빙이 쉬워집니다. |
| ② | `pc_bankAccount=ba_bank_chosen`, `pc_capitalTransfer=ct_partial` | 나누어 송금해도 기한 안에 전액을 넣어야 하니 송금 일정을 표로 정리해 두세요. |
| ③ | `pc_bankAccount=ba_not_yet`, `pc_capitalTransfer=ct_unsure_deadline` | 자본금은 설립 후 정해진 기간 안에 넣어야 하니 계좌 개설과 송금 일정을 함께 잡으세요. |
| ④ | `pc_bankAccount=ba_unknown`, `pc_capitalTransfer=ct_delay` | 외국인 투자금은 전용 계좌로 들어와야 하니 계좌부터 열고 송금 지연 사유를 미리 확인하세요. |
| ⑤ | `pc_bankAccount=ba_not_yet_after`, `pc_capitalTransfer=ct_planned` | 설립 직후 계좌를 열 수 있도록 은행이 요구하는 서류를 미리 알아 두세요. |

### 2차 8번 — Q8

**어떤 사업을 하실 예정이고, 법인 말고 따로 받아야 하는 허가가 있다는 이야기는 들어 보셨나요?**

① **무역·유통 사업을** 하려고 합니다. 수출입이나 유통 허가가 따로 필요한지는 아직 확인하지 못했습니다.  
② **서비스나 컨설팅 사업을** 하려고 합니다. 법인 등록 외에 따로 받을 허가는 없다고 들었는데 맞는지 모르겠습니다.  
③ **식당이나 카페를** 하려고 합니다. 법인을 세운 뒤에 식품 위생과 소방 허가를 따로 받아야 한다고 들었습니다.  
④ **공장을 세워 제품을** 만들려고 합니다. 공장을 가동하기 전에 환경 허가를 받아야 한다고 들었습니다.  
⑤ **사업 분야를 아직** 못 정했습니다. 분야가 정해지면 어떤 허가가 더 필요한지도 함께 알아보고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_businessLine=bl_trade`, `pc_subLicense=sl_trade` | 외국인 투자 유통은 별도 허가가 필요할 수 있으니 투자 등록 단계에서 함께 확인하세요. |
| ② | `pc_businessLine=bl_service`, `pc_subLicense=sl_none` | 추가 허가가 없더라도 업종 코드가 실제 사업과 맞는지 등록 전에 확인하세요. |
| ③ | `pc_businessLine=bl_food`, `pc_subLicense=sl_food` | 식당·카페는 설립 후 위생·소방 허가가 필요하니 매장 공사 일정과 함께 준비하세요. |
| ④ | `pc_businessLine=bl_manufacturing`, `pc_subLicense=sl_env` | 제조업은 환경 허가가 공장 설계와 함께 가야 하니 설립과 동시에 준비를 시작하세요. |
| ⑤ | `pc_businessLine=bl_undecided`, `pc_subLicense=sl_unknown` | 사업 분야를 정하면 추가 허가가 정해지니 업종 코드부터 확정하세요. |

### 2차 9번 — Q9

**법인 설립은 언제까지 마쳐야 마음이 놓이고, 영업은 언제쯤 시작하고 싶으신가요?**

① **한 달 안에는** 마쳐야 합니다. 영업 시작일을 이미 정해 놓아서 설립이 늦어지면 미루기 어렵습니다.  
② **두세 달 안에** 마치면 됩니다. 사무실 임대가 시작되는 날에 맞춰 영업을 시작하려고 합니다.  
③ **급하진 않습니다.** 직원을 먼저 뽑고 교육을 마친 뒤에 천천히 영업을 시작할 계획입니다.  
④ **언제까지인지** 모르겠습니다. 설립 시점도, 영업을 언제 시작할지도 아직 정하지 못했습니다.  
⑤ **가능한 빨리** 마치고 싶습니다. 영업 시작을 앞당기고 싶지만 정확한 시작일은 아직 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_timeline=tl_urgent`, `pc_openPlan=op_date` | 투자 등록과 기업 등록에 각각 시간이 걸리니 서류 인증부터 바로 시작해야 합니다. |
| ② | `pc_timeline=tl_2_3m`, `pc_openPlan=op_lease_start` | 임대 시작일 전에 설립이 끝나도록 서류 인증 기간을 거꾸로 계산해 보세요. |
| ③ | `pc_timeline=tl_flexible`, `pc_openPlan=op_after_staff` | 시간 여유가 있으니 외국인 직원 노동허가 일정까지 함께 계획하세요. |
| ④ | `pc_timeline=tl_unsure`, `pc_openPlan=op_unsure` | 설립 시점이 정해져야 사무실 계약과 송금 일정을 맞출 수 있습니다. |
| ⑤ | `pc_timeline=tl_asap`, `pc_openPlan=op_unsure` | 빨리 끝내려면 서류 인증과 번역을 동시에 진행하고 보완 요구를 줄이는 것이 가장 중요합니다. |

### 2차 10번 — Q10

**지금까지 이 일로 누구에게 물어봤고, 그 대답은 어땠나요?**

① **한국 사람이 하는 대행사에** 물어봤습니다. 설명은 들었는데 어디까지 믿어도 되는지 판단이 안 섭니다.  
② **베트남 현지 업체에** 물어봤습니다. 말이 잘 통하지 않아서 제대로 이해했는지 모르겠습니다.  
③ **지인이나 먼저 해 본 분께** 물어봤습니다. 경험담은 들었는데 제 경우에도 맞는지 모르겠습니다.  
④ **담당 기관에 직접 문의**해 봤습니다. 안내는 받았지만 베트남어라 확실히 이해하지 못했습니다.  
⑤ **아직 아무에게도** 못 물어봤습니다. 누구에게 물어봐야 하는지, 어디에 물어봐야 하는지부터 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_askedWho=ask_agency_kr`, `pc_answerFeel=ans_unsure_trust` | 여러 곳의 설명이 다르면 같은 질문을 글로 정리해 보내고 답을 나란히 비교하세요. |
| ② | `pc_askedWho=ask_local`, `pc_answerFeel=ans_not_understood` | 현지 업체의 설명은 문서로 받아 통역이나 전문 번역으로 한 번 더 확인하세요. |
| ③ | `pc_askedWho=ask_acquaint`, `pc_answerFeel=ans_not_fit` | 경험담은 시기와 지역, 사업 형태가 같아야 참고가 되니 조건이 같은지 먼저 대조하세요. |
| ④ | `pc_askedWho=ask_authority`, `pc_answerFeel=ans_not_clear_vn` | 기관 안내는 받은 날짜와 담당 부서, 내용을 적어 두고 통역을 거쳐 다시 확인하세요. |
| ⑤ | `pc_askedWho=ask_nobody`, `pc_answerFeel=ans_unknown_who` | 먼저 지역의 담당 기관이 어디인지 확인하고 물어볼 내용을 정리해 두세요. |

### 2차 11번 — Q11

**서류를 담당 기관에 내는 일은 누가 하게 될 것 같고, 그때 가장 걱정되는 건 뭔가요?**

① **제가 직접** 낼 생각입니다. 온라인 접수는 어떻게 하고 서명은 어떻게 하는지 모르겠습니다.  
② **베트남 직원이** 대신 내기로 했습니다. 위임장은 어떻게 하고, 낸 뒤 연락은 누가 받는지 걱정됩니다.  
③ **대행사에 맡길지** 고민 중입니다. 어디까지 맡기는 건지, 서류 원본은 누가 보관하는지 불안합니다.  
④ **누가 낼지** 아직 못 정했습니다. 직접 하는 것과 직원, 대행사 중 어느 쪽이 나은지 모르겠습니다.  
⑤ **직접 접수하러 가야 하는데** 베트남어가 걱정입니다. 담당 기관 직원이 뭐라고 물어볼지, 통역이 필요한지 막막합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_submitter=sub_self`, `pc_submitNeed=sn_account` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `pc_submitter=sub_staff`, `pc_submitNeed=sn_proxy` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `pc_submitter=sub_agency`, `pc_submitNeed=sn_scope` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `pc_submitter=sub_undecided`, `pc_submitNeed=sn_compare` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `pc_submitter=sub_self_lang`, `pc_submitNeed=sn_interpreter` | 직접 제출하되 베트남어가 어렵다면 제출하는 날 통역이 필요한 범위를 미리 정해 두세요. |

### 2차 12번 — Q12

**법인을 세운 뒤에 가장 먼저 해야 할 일은 알고 계시고, 그 준비는 어디까지 해 두셨나요?**

① **세무와 회계 신고를 먼저** 준비하려고 합니다. 설립 후에 할 일을 이미 순서대로 정리해 두었습니다.  
② **외국인 직원을 채용하려고** 합니다. 채용에 필요한 절차는 일부만 알아본 상태입니다.  
③ **대표의 비자와 거주증을** 준비하려고 합니다. 설립 후 할 일은 아직 생각해 보지 않았습니다.  
④ **회사 계좌와 인보이스를 먼저** 준비하려고 합니다. 설립 후에 해야 할 일을 일부만 정리해 두었습니다.  
⑤ **설립 후에 뭘 해야 하는지** 모르겠습니다. 그 다음 단계는 아직 생각해 보지 않았습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_postSetup=ps_tax`, `pc_postPlan=pf_ready` | 설립 직후 세무 신고 기한이 바로 시작되니 회계 담당을 미리 정해 두세요. |
| ② | `pc_postSetup=ps_hiring`, `pc_postPlan=pf_partial` | 외국인 직원은 노동허가가 필요하니 설립 일정과 함께 노동허가 일정도 잡아 두세요. |
| ③ | `pc_postSetup=ps_visa`, `pc_postPlan=pf_none` | 대표가 상주한다면 법인 설립 후 노동허가와 거주증을 이어서 준비해야 합니다. |
| ④ | `pc_postSetup=ps_bank`, `pc_postPlan=pf_partial` | 운영 계좌와 전자 인보이스는 영업 시작 전에 갖춰야 하니 설립 직후 바로 진행하세요. |
| ⑤ | `pc_postSetup=ps_unknown`, `pc_postPlan=pf_none` | 설립 후 첫 달에 할 일(세무 등록, 계좌, 직원 서류)을 목록으로 받아 두세요. |

### 2차 13번 — Q13

**사업장이 있는 곳은 어디이고, 서류를 어느 기관에 내야 하는지는 알아보셨나요?**

① **하노이**입니다. 어느 기관에 내야 하는지, 온라인으로도 낼 수 있는지 알아보고 있습니다.  
② **호치민**입니다. 어느 기관에 내야 하는지 몰라서 그것부터 알고 싶고 온라인 접수가 되는지도 궁금합니다.  
③ **다낭**입니다. 최근 기관이 합쳐졌다는 말을 들었는데 지금은 어디에 내야 하는지 모르겠습니다.  
④ **그 밖의 도시**입니다. 지방은 방식이 다르다고 해서 직접 가서 내야 하는지 궁금합니다.  
⑤ **산업단지 안**입니다. 단지 관리 기관에 내는지 아니면 다른 곳에 내는지 아는 사람이 없어서 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `pc_area=area_hanoi`, `pc_agencyNeed=an_online` | 온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요. |
| ② | `pc_area=area_hcm`, `pc_agencyNeed=an_office` | 지역 담당 기관을 먼저 확인해야 접수 방법과 처리 기간을 알 수 있습니다. |
| ③ | `pc_area=area_danang`, `pc_agencyNeed=an_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `pc_area=area_other_city`, `pc_agencyNeed=an_visit` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `pc_area=area_ip`, `pc_agencyNeed=an_zone` | 산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `pc_feeling=fl_lost`, `pc_situation=sit_search_vn` | 어디서부터 시작해야 할지 몰라 막막한 상황입니다 | 외국인 법인 설립은 투자 등록과 기업 등록 두 단계로 진행되고, 투자자 신분 서류, 자금 증빙, 사무실 계약서가 기본입니다. 투자자 형태에 따라 서류가 달라집니다. |
| `pc_feeling=fl_anxious`, `pc_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 몰라 불안한 상황입니다 | 서류가 갖춰진 뒤 투자 등록과 기업 등록에 각각 처리 기간이 걸리고, 해외 서류 인증에 시간이 가장 많이 듭니다. 인증부터 시작하면 일정을 줄일 수 있습니다. |
| `pc_feeling=fl_confused`, `pc_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 | 외국인 투자는 업종에 따라 조건이 붙거나 제한될 수 있습니다. 2차 답변으로 사업 분야와 추가 허가를 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `pc_feeling=fl_afraid`, `pc_situation=sit_operating` | 허가 확인 전에 시작해 불안한 상황입니다 | 법인 설립 과정에서는 담당 기관이 베트남어로 질문하고 보완을 요구할 수 있어, 내용을 이해하지 못한 채 답하면 처리가 길어질 수 있습니다. 접수 전에 통역과 전문가가 서류를 함께 점검하면 보완 요구를 줄일 수 있습니다. |
| `pc_feeling=fl_tired`, `pc_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 | 법인 설립 서류는 이름·번호·숫자가 서로 다르거나 빠진 서류가 있으면 접수가 보류되거나 보완 요구를 받을 수 있습니다. 접수 전에 전문가가 서류를 점검하고 제출하는 날 동행하면 되돌아오는 횟수를 줄일 수 있습니다. |

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
| 8 (answer) | `pc_answerFeel` ∈ {ans_not_understood, ans_not_clear_vn} | 받은 안내를 정확히 이해하지 못한 채 진행하면 필요한 절차를 놓칠 수 있어 안내 내용을 문서로 다시 확인해야 합니다 |
| 9 (language) | `pc_langRoute` ∈ {lr_local, lr_machine, lr_none} | 베트남어 서류를 정확히 이해하지 못한 채 진행하면 불리한 조건을 놓칠 수 있어 전문 통역이나 번역 확인이 필요합니다 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 접수 전에 서류의 이름·주소·자본금 숫자가 서로 맞는지 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 노동허가 확인 | `pc_postSetup` ∈ {ps_hiring, ps_visa} 또는 `pc_representative` ∈ {rep_resident} | 대표나 외국인 직원이 일하게 된다면 노동허가 직접 확인에서 이어서 점검해 보실 수 있습니다. |
| 식당 허가 확인 | `pc_businessLine` ∈ {bl_food} 또는 `pc_subLicense` ∈ {sl_food} | 식당·카페를 여신다면 식당 허가 확인에서 위생·소방 준비를 함께 점검해 보실 수 있습니다. |
| 전문가 진행 | `pc_timeline` ∈ {tl_urgent} 또는 `pc_foreignDocs` ∈ {fd_not_started} 또는 `pc_situation` ∈ {sit_operating} | 일정이 급하거나 서류 인증을 시작하지 못했다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

## 8. 값 → 고객 표시 문구

| 내부 값 | 고객 화면 표시 |
|---|---|
| `an_changed` | 기관 통합으로 담당 확인 |
| `an_office` | 접수 기관 확인 |
| `an_online` | 담당 기관과 온라인 접수 확인 |
| `an_visit` | 지방 접수 방식 확인 |
| `an_zone` | 산업단지 관리 기관 확인 |
| `ans_not_clear_vn` | 기관 안내를 베트남어라 이해 못 함 |
| `ans_not_fit` | 경험담이 내 경우에 맞는지 모름 |
| `ans_not_understood` | 말이 통하지 않아 이해 못 함 |
| `ans_unknown_who` | 누구에게 물어볼지 모름 |
| `ans_unsure_trust` | 설명을 어디까지 믿을지 모름 |
| `area_danang` | 다낭 |
| `area_hanoi` | 하노이 |
| `area_hcm` | 호치민 |
| `area_ip` | 산업단지 |
| `area_other_city` | 그 밖의 도시 |
| `ask_acquaint` | 지인·경험자에게 문의 |
| `ask_agency_kr` | 한국인 대행사에 문의 |
| `ask_authority` | 담당 기관에 직접 문의 |
| `ask_local` | 베트남 현지 업체에 문의 |
| `ask_nobody` | 아직 아무에게도 문의 못 함 |
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
| `fd_not_started` | 서류 인증 시작 전 |
| `fd_unknown` | 인증 필요 여부를 모름 |
| `fl_afraid` | 담당 기관 연락이 겁남 |
| `fl_anxious` | 진행 상황을 몰라 불안함 |
| `fl_confused` | 사람마다 말이 달라 혼란스러움 |
| `fl_lost` | 어디서 시작할지 막막함 |
| `fl_tired` | 한 번 막혀서 지침 |
| `if_compare` | 투자 형태 비교 |
| `if_hq_docs` | 본사 서류 인증과 투자 등록 절차 확인 |
| `if_individual_scope` | 개인 투자 가능 업종과 자본금 기준 확인 |
| `if_partner_share` | 지분 구조와 외국인 지분 제한 확인 |
| `if_rep_convert` | 대표사무소 정리와 법인 전환 절차 확인 |
| `inv_corporate` | 본사 법인이 투자 |
| `inv_individual` | 개인이 투자 |
| `inv_partner` | 현지 동업자와 공동 투자 |
| `inv_rep_office` | 대표사무소에서 법인으로 전환 |
| `inv_unsure` | 투자자 형태 미정 |
| `lr_interp` | 통역사·베트남어 하는 지인이 통역 |
| `lr_local` | 한국어 하는 베트남 직원이 설명 |
| `lr_machine` | 인공지능 번역기로 대략 이해 |
| `lr_none` | 베트남어를 몰라 내용을 알 수 없음 |
| `lr_self` | 베트남어를 직접 읽음 |
| `lt_apartment` | 주거용 아파트 |
| `lt_commercial` | 상업용 건물 |
| `lt_factory` | 공장·창고 |
| `lt_shared` | 공유 오피스 |
| `lt_unknown` | 건물 용도를 모름 |
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
| `rep_local` | 현지인을 대표로 선임 |
| `rep_resident` | 대표가 베트남에 상주 |
| `rep_undecided` | 대표 미정 |
| `rep_unknown` | 대표 상주 필요 여부를 모름 |
| `rep_visiting` | 대표가 오가며 관리 |
| `sit_conflicting` | 주변 사람들의 말이 서로 다름 |
| `sit_operating` | 허가 확인 전에 영업 시작 |
| `sit_rejected` | 서류 보완 요구를 받은 적 있음 |
| `sit_search_vn` | 베트남어 자료를 이해하지 못함 |
| `sit_unknown_progress` | 맡긴 일의 진행 정도를 모름 |
| `sl_env` | 환경 허가 필요 |
| `sl_food` | 식품 위생·소방 허가 필요 |
| `sl_none` | 추가 허가 불필요 |
| `sl_trade` | 수출입·유통 허가 필요 |
| `sl_unknown` | 추가 허가 필요 여부를 모름 |
| `sn_account` | 온라인 접수 계정·서명 준비 |
| `sn_compare` | 제출 방식 비교 |
| `sn_interpreter` | 통역 필요 범위 확인 |
| `sn_proxy` | 위임장·연락 방법 준비 |
| `sn_scope` | 대행 범위·원본 보관 확인 |
| `sub_agency` | 대행사가 제출 |
| `sub_self` | 직접 제출 |
| `sub_self_lang` | 직접 제출, 베트남어가 걱정됨 |
| `sub_staff` | 직원이 제출 |
| `sub_undecided` | 제출 방식 미정 |
| `tl_2_3m` | 두세 달 안에 설립 |
| `tl_asap` | 가능한 빨리 설립 |
| `tl_flexible` | 급하지 않음 |
| `tl_unsure` | 설립 시점 미정 |
| `tl_urgent` | 한 달 안에 설립 필요 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 투자법 (제61/2020/QH14호): 외국인 투자자는 투자 등록 후 법인 설립 | 베트남 국회 / 하이퐁시 재무국 안내 | 보도 기준 | https://sotc.haiphong.gov.vn/en/services/hoi-dap-dau-tu | 처리 기간과 조문 번호는 공식 원문 대조 필요 |
| 2 | 기업법 (제59/2020/QH14호): 기업 등록과 자본금 납입 기한 | 베트남 국회 | 보도 기준 | https://thuvienphapluat.vn/hoi-dap-phap-luat/phai-gop-von-du-cho-cong-ty-trong-vong-bao-nhieu-ngay-368437.html | 자본금 납입 기한(90일)은 제47조 2항으로 확인함(이차 자료 기준). 그 외 조문 번호는 공식 원문 대조 필요 |
