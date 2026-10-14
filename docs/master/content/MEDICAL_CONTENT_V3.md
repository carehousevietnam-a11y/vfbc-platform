# 의료기기 허가 직접 인허가 받기 콘텐츠 설계서

이 문서는 scripts/medical-content-spec.mjs 에서 자동 생성된다. 직접 고치지 않는다. 확인일 2026.10.12.

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
| reg_company_done | registration: confirmed |
| reg_household_done | registration: confirmed |
| reg_in_progress | registration: unconfirmed |
| reg_not_started | registration: unconfirmed |
| reg_unsure | registration: 비어 있음(추가 확인 필요) |
| wh_own | key: secured |
| wh_3pl | key: secured |
| wh_planned | key: unsecured |
| wh_none | key: unsecured |
| wh_unknown | key: 비어 있음(추가 확인 필요) |

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

1. 전 과정 대행: `md_timeline` ∈ {tl_urgent, tl_already} 또는 `md_registration` ∈ {reg_not_started} 또는 `md_situation` ∈ {sit_operating}
2. 작성과 제출 동행: `md_submitter` ∈ {sub_undecided} 또는 `md_agencyNeed` ∈ {an_office, an_changed, an_zone} 또는 `md_situation` ∈ {sit_rejected} 또는 `md_langRoute` ∈ {lr_none}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**어떤 의료기기를 어떻게 다루시려고 하고, 지금 가장 막막한 점은 무엇인가요?**

① **거즈나 붕대 같은 소모품을 수입해서** 팔려고 합니다. 위험이 가장 낮은 제품인데도 등록이 필요한지 모르겠습니다.  
② **혈압계 같은 일반 기기를 베트남에서 만들어** 팔려고 합니다. 위험이 낮은 기기인데 어떤 절차를 밟아야 하는지 감이 안 잡힙니다.  
③ **초음파 진단기 같은 장비를 유통만** 하려고 합니다. 위험이 중간 이상인 장비라 절차가 더 복잡할까 걱정입니다.  
④ **임플란트처럼 몸속에 넣는 제품을 이미 등록했는데** 내용을 바꿔야 합니다. 가장 위험한 등급이라 등록 내용을 어떻게 바꿔야 하는지 모르겠습니다.  
⑤ **어떤 절차가 필요한지조차** 모르겠습니다. 우리 제품이 어느 위험 등급인지도 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `md_stage=st_import`, `md_class=cl_a` | 가장 낮은 등급 의료기기를 수입하려는 상황입니다 |
| ② | `md_stage=st_local_make`, `md_class=cl_b` | 낮은 등급의 국내 생산 기기를 팔려는 상황입니다 |
| ③ | `md_stage=st_trade`, `md_class=cl_c` | 중간 이상 등급 장비를 유통하려는 상황입니다 |
| ④ | `md_stage=st_change`, `md_class=cl_d` | 가장 높은 등급 장비의 등록 내용을 바꾸는 상황입니다 |
| ⑤ | `md_stage=st_unsure`, `md_class=cl_unknown` | 필요한 절차와 위험 등급부터 확인할 상황입니다 |

### 1차 2번 — Q2

**사업자 등록은 지금 어떤 상황이고, 누구 이름으로 의료기기 등록 번호를 받을 생각이신가요?**

① **법인 등록은 끝났습니다.** 투자한 우리 법인 이름으로 의료기기 등록 번호를 받으려고 합니다.  
② **개인사업자로 등록했습니다.** 제 이름으로 낸 사업자 등록증이 있어서, 그 이름으로 의료기기 등록 번호를 받으려고 합니다.  
③ **등록 절차가 아직 진행 중입니다.** 끝나는 대로 베트남 현지 법인 이름으로 의료기기 등록 번호를 받을 예정입니다.  
④ **등록은 아직 시작도 못 했습니다.** 어떤 이름으로 해야 할지 몰라서, 주변에서 현지인 이름으로 하라는 말도 들었습니다.  
⑤ **지금 어떤 상태인지** 저도 잘 모르겠습니다. 누구 이름으로 의료기기 등록 번호를 받아야 하는지도 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `md_registration=reg_company_done`, `md_owner=own_fdi` | 외국인 투자 법인 등록을 마친 상황입니다 |
| ② | `md_registration=reg_household_done`, `md_owner=own_household` | 개인사업자 등록을 마친 상황입니다 |
| ③ | `md_registration=reg_in_progress`, `md_owner=own_local` | 현지 법인 등록이 진행 중인 상황입니다 |
| ④ | `md_registration=reg_not_started`, `md_owner=own_partner` | 사업자 등록 전이고 현지인 명의를 생각하는 상황입니다 |
| ⑤ | `md_registration=reg_unsure`, `md_owner=own_undecided` | 등록 상태와 운영 주체부터 확인해야 하는 상황입니다 |

### 1차 3번 — Q3

**제품을 보관할 창고는 마련하셨고, 보관할 때 온도 같은 조건은 어떻게 관리하고 계신가요?**

① **자체 보관 창고가 있습니다.** 온도와 습도를 매일 기록하며 관리하고 있는데 이 기록을 등록 때 내야 하는지 궁금합니다.  
② **물류 회사 창고에 맡기고 있습니다.** 일반 상온 창고에서 다른 화물과 나누어 보관하는데 의료기기 기준에 맞는지 모르겠습니다.  
③ **창고를 곧 계약할 예정입니다.** 아직 계약 전이라 의료기기 보관 기준에 맞는 창고인지 확인하고 싶습니다.  
④ **창고 없이 사무실에 두고** 있습니다. 의료기기를 어떤 조건으로 보관해야 하는지 모르겠습니다.  
⑤ **창고가 꼭 필요한지** 모르겠습니다. 지금은 보관 조건을 따로 관리하지 않고 일반적으로 두고 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `md_warehouse=wh_own`, `md_storage=wc_controlled` | 자체 창고에서 온도·습도를 관리하는 상황입니다 |
| ② | `md_warehouse=wh_3pl`, `md_storage=wc_basic` | 물류 위탁 창고에 일반 보관하는 상황입니다 |
| ③ | `md_warehouse=wh_planned`, `md_storage=wc_unknown` | 창고 계약 전이라 보관 기준에 맞는 창고를 확인해야 하는 상황입니다 |
| ④ | `md_warehouse=wh_none`, `md_storage=wc_unknown` | 창고 없이 보관 조건을 확인해야 하는 상황입니다 |
| ⑤ | `md_warehouse=wh_unknown`, `md_storage=wc_basic` | 보관 시설 필요 여부를 확인할 상황입니다 |

### 1차 4번 — Q4

**제조사의 품질 서류는 받으셨고, 판매를 맡긴다는 위임장도 받으셨나요?**

① **품질 경영 인증서를 받아 두었습니다.** 제조사로부터 판매를 맡긴다는 위임장도 가지고 있습니다.  
② **품질 서류를 일부만 가지고 있습니다.** 제조사에 위임장을 보내 달라고 요청해 둔 상태입니다.  
③ **제조사에 서류를 요청하고 있습니다.** 위임장은 아직 받지 못했고 받을 수 있을지도 모릅니다.  
④ **우리 회사가 직접 만든 제품입니다.** 그래서 위임장은 필요 없지만 품질 경영 인증서는 아직 없습니다.  
⑤ **어떤 서류가 필요한지** 모르겠습니다. 제조사 위임장이 필요한지도 아직 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `md_qualityDocs=qd_iso`, `md_authorization=ma_loa` | 품질 인증서와 위임장을 모두 갖춘 상황입니다 |
| ② | `md_qualityDocs=qd_partial`, `md_authorization=ma_pending` | 품질 서류가 일부만 있고 위임장을 기다리는 상황입니다 |
| ③ | `md_qualityDocs=qd_requested`, `md_authorization=ma_none` | 품질 서류와 위임장을 모두 기다리는 상황입니다 |
| ④ | `md_qualityDocs=qd_none`, `md_authorization=ma_own` | 자사 제품이지만 품질 서류가 없는 상황입니다 |
| ⑤ | `md_qualityDocs=qd_unknown`, `md_authorization=ma_unknown` | 필요한 품질 서류와 위임장 여부를 확인할 상황입니다 |

### 1차 5번 — Q5

**이 일을 하시면서 가장 답답하고 불안한 점은 무엇이고, 지금 어떤 상황인가요?**

① **어디서부터 시작해야 할지** 막막합니다. 검색도 해 봤는데 베트남어 자료라 어떤 말이 맞는지 모르겠습니다.  
② **일이 제대로 되고 있는지** 불안합니다. 베트남 지인이나 직원이 알아서 한다는데 어디까지 됐는지 알 수 없습니다.  
③ **사람마다 말이 달라** 혼란스럽습니다. 제조사, 업체, 지인이 각자 다르게 말해서 누구 말이 맞는지 모르겠습니다.  
④ **담당 기관에서 연락이 올까** 겁이 납니다. 판매를 이미 시작했는데 등록이 아직 확인되지 않았습니다.  
⑤ **이미 한 번 막혀서** 지쳤습니다. 서류를 냈다가 보완하라고 돌려받은 적이 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `md_feeling=fl_lost`, `md_situation=sit_search_vn` | 어디서 시작할지 막막하고 베트남어 자료를 이해하기 어려운 상황입니다 |
| ② | `md_feeling=fl_anxious`, `md_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 알 수 없어 불안한 상황입니다 |
| ③ | `md_feeling=fl_confused`, `md_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 |
| ④ | `md_feeling=fl_afraid`, `md_situation=sit_operating` | 허가 확인 전에 시작해 불안한 상황입니다 |
| ⑤ | `md_feeling=fl_tired`, `md_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 |

### 2차 6번 — Q6

**허가 서류는 얼마나 모으셨고, 그 서류에 뭐라고 적혀 있는지는 어떻게 알고 계신가요?**

① **서류는 다 모았습니다.** 베트남어를 직접 읽을 수 있어서 내용도 제가 확인했습니다.  
② **거의 모았고 몇 개 남았습니다.** 베트남어를 하는 지인이나 통역해 주는 분이 서류 내용을 읽어 줍니다.  
③ **절반쯤 모았습니다.** 한국어를 하는 베트남 직원이 설명해 주는데 서류 원문과 맞는지는 확인하지 못했습니다.  
④ **거의 모으지 못했습니다.** 번역기로 읽어 보니 필요한 서류가 많아 보이는데 번역이 맞는지 모르겠습니다.  
⑤ **뭐가 필요한지도** 모릅니다. 베트남어를 전혀 몰라서 서류에 뭐가 적혀 있는지 알 수 없고 물어볼 사람도 없습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `md_docs=docs_all`, `md_langRoute=lr_self` | 서류가 갖춰졌으니 제품명과 모델명이 서류마다 같은지만 확인하고 접수하세요. |
| ② | `md_docs=docs_most`, `md_langRoute=lr_interp` | 남은 서류와 번역이 필요한 서류를 나누어 적고 영사 인증 기간을 먼저 확인하세요. 통역한 내용이 서류 원문과 같은지 접수 전에 한 번 더 확인하세요. |
| ③ | `md_docs=docs_half`, `md_langRoute=lr_local` | 준비한 서류 목록을 만든 뒤 등급 분류 결과와 기술 자료가 빠졌는지부터 확인하세요. 직원 설명은 서류 원문과 대조해 확인하세요. |
| ④ | `md_docs=docs_little`, `md_langRoute=lr_machine` | 위험 등급에 따라 신고와 등록 절차가 다르니 등급 분류부터 받으세요. 인공지능 번역은 법률 용어와 숫자가 틀릴 수 있으니 중요한 서류는 전문가 확인을 받으세요. |
| ⑤ | `md_docs=docs_unknown`, `md_langRoute=lr_none` | 제품의 위험 등급을 먼저 정하면 필요한 서류와 절차가 정해집니다. 베트남어 서류를 읽어 줄 사람이나 전문 번역부터 정하세요. |

### 2차 7번 — Q7

**수입 제품이면 자유판매증명서가 필요하다는데, 증명서와 베트남 안의 보증·수리 거점은 어떻게 되어 있나요?**

① **증명서를 받아 영사 인증까지 마쳤습니다.** 베트남 안에 제품 보증과 수리를 맡을 거점도 있습니다.  
② **증명서는 받았지만 인증은 아직입니다.** 보증과 수리는 베트남의 전문 업체와 계약했습니다.  
③ **증명서를 제조사에 요청해 두었습니다.** 베트남 안에 보증이나 수리 거점이 아직 없어서 걱정입니다.  
④ **증명서가 없습니다.** 한 번 쓰고 버리는 제품이라 보증이 필요 없다고 들었는데 맞는지 모르겠습니다.  
⑤ **증명서가 필요한지** 모르겠습니다. 보증이나 수리 거점에 어떤 요건이 있는지도 모릅니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `md_cfs=cfs_legalized`, `md_warranty=ws_vn` | 증명서 유효 기간과 보증 거점 서류를 함께 준비하면 신청이 빨라집니다. |
| ② | `md_cfs=cfs_issued`, `md_warranty=ws_contract` | 영사 인증에 시간이 걸리니 바로 신청하고, 보증 계약서도 함께 준비하세요. |
| ③ | `md_cfs=cfs_requested`, `md_warranty=ws_none` | 보증 거점이 없으면 신청이 어려울 수 있으니 보증 업체와 계약부터 검토하세요. |
| ④ | `md_cfs=cfs_none`, `md_warranty=ws_single_use` | 수입 제품은 생산국 판매 증명이 필요한 경우가 많으니 제조사에 먼저 요청하세요. |
| ⑤ | `md_cfs=cfs_unknown`, `md_warranty=ws_unknown` | 수입 여부와 제품 종류에 따라 요건이 정해지니 그 기준부터 확인하세요. |

### 2차 8번 — Q8

**제품은 주로 어디에 공급하실 예정이고, 쓰는 사람에게 사용법을 따로 가르쳐야 하는 제품인가요?**

① **병원에 공급**하려고 합니다. 의료진이 사용법을 따로 교육받아야 하는 전문 장비입니다.  
② **의원이나 치과에 공급**하려고 합니다. 사용법이 간단해서 따로 교육은 필요 없다고 생각합니다.  
③ **약국이나 매장에서** 팔려고 합니다. 누구나 쓰기 쉬운 가정용 제품 위주로 판매합니다.  
④ **개인 고객에게 직접** 팔려고 합니다. 사용자 교육이 필요한지 아직 확인하지 못했습니다.  
⑤ **공급처를 아직** 정하지 못했습니다. 의료진이 사용법을 배워야 하는 장비도 일부 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `md_customer=cu_hospital`, `md_training=tn_needed_tech` | 병원 공급은 입찰 서류와 교육 계획을 함께 요구받는 경우가 많으니 미리 준비하세요. |
| ② | `md_customer=cu_clinic`, `md_training=tn_simple` | 의원·치과 공급도 제품 등록 번호를 확인하니 판매 전에 등록을 마치세요. |
| ③ | `md_customer=cu_pharmacy`, `md_training=tn_simple` | 매장 판매 제품은 베트남어 사용 설명과 표시가 필요하니 문안을 먼저 준비하세요. |
| ④ | `md_customer=cu_home`, `md_training=tn_unknown` | 개인 판매는 광고와 표시 기준이 중요하니 판매 문구를 먼저 점검하세요. |
| ⑤ | `md_customer=cu_unsure`, `md_training=tn_needed_tech` | 공급처가 정해지면 필요한 서류가 정해지니 판매 계획부터 세우세요. |

### 2차 9번 — Q9

**허가는 언제까지 받아야 마음이 놓이고, 판매는 언제쯤 시작하고 싶으신가요?**

① **한 달 안에는** 받아야 합니다. 판매 시작 날짜를 이미 정해 놓아서 허가가 늦어지면 미루기 어렵습니다.  
② **두세 달 안에** 받으면 됩니다. 창고와 제품 준비가 끝나는 날에 맞춰 판매를 시작하려고 합니다.  
③ **급하진 않습니다.** 서두르다 놓치는 게 없도록 허가가 나온 걸 확인한 뒤에 천천히 판매를 시작하고 싶습니다.  
④ **언제까지인지** 모르겠습니다. 허가가 언제까지 필요한지, 판매를 언제 시작할지도 아직 정하지 못했습니다.  
⑤ **이미 판매를 하고 있습니다.** 허가를 못 받은 채 먼저 시작했는데 문제가 되지 않을지 불안합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `md_timeline=tl_urgent`, `md_openPlan=op_date` | 한 달은 해외 서류 인증까지 빠듯하니 위임장과 증명서를 바로 요청하세요. |
| ② | `md_timeline=tl_2_3m`, `md_openPlan=op_after_fitout` | 제품이 들어오는 날을 기준으로 신고·등록 일정을 거꾸로 계산해 두세요. |
| ③ | `md_timeline=tl_flexible`, `md_openPlan=op_after_permit` | 시간 여유가 있으니 등급 분류부터 받아 서류를 하나씩 완성하세요. |
| ④ | `md_timeline=tl_unsure`, `md_openPlan=op_unsure` | 판매 시작 시점을 정해야 수입과 신고 일정을 맞출 수 있습니다. |
| ⑤ | `md_timeline=tl_already`, `md_openPlan=op_running` | 신고나 등록 없이 판매 중이라면 제재를 받을 수 있으니 바로 절차를 시작하세요. |

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
| ① | `md_askedWho=ask_agency_kr`, `md_answerFeel=ans_unsure_trust` | 여러 곳의 설명이 다르면 같은 질문을 글로 정리해 보내고 답을 나란히 비교하세요. |
| ② | `md_askedWho=ask_local`, `md_answerFeel=ans_not_understood` | 현지 업체의 설명은 문서로 받아 통역이나 전문 번역으로 한 번 더 확인하세요. |
| ③ | `md_askedWho=ask_acquaint`, `md_answerFeel=ans_not_fit` | 경험담은 시기와 지역, 사업 형태가 같아야 참고가 되니 조건이 같은지 먼저 대조하세요. |
| ④ | `md_askedWho=ask_authority`, `md_answerFeel=ans_not_clear_vn` | 기관 안내는 받은 날짜와 담당 부서, 내용을 적어 두고 통역을 거쳐 다시 확인하세요. |
| ⑤ | `md_askedWho=ask_nobody`, `md_answerFeel=ans_unknown_who` | 먼저 지역의 담당 기관이 어디인지 확인하고 물어볼 내용을 정리해 두세요. |

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
| ① | `md_submitter=sub_self`, `md_submitNeed=sn_account` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `md_submitter=sub_staff`, `md_submitNeed=sn_proxy` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `md_submitter=sub_agency`, `md_submitNeed=sn_scope` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `md_submitter=sub_undecided`, `md_submitNeed=sn_compare` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `md_submitter=sub_self_lang`, `md_submitNeed=sn_interpreter` | 직접 제출하되 베트남어가 어렵다면 제출하는 날 통역이 필요한 범위를 미리 정해 두세요. |

### 2차 12번 — Q12

**등록할 제품은 어디까지이고, 그 제품에서 사고가 나면 누가 어떻게 보고하는지 정해 두셨나요?**

① **모델 한두 개만** 등록하려고 합니다. 이 모델에서 사고가 나면 바로 보고할 담당자를 정해 두었습니다.  
② **모델 여러 개를 함께** 등록하려고 합니다. 모델별 사고 보고는 제조사의 방식을 따르려고 합니다.  
③ **제품군 전체를** 들여오려고 합니다. 제품군에서 사고가 나면 어떻게 보고해야 하는지 모르겠습니다.  
④ **부속품까지 함께** 등록해야 합니다. 부속품을 포함한 제품의 사고 보고 담당자는 곧 정할 예정입니다.  
⑤ **몇 개를 등록할지** 아직 모르겠습니다. 등록한 뒤 사고 보고가 의무인지도 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `md_models=mo_few`, `md_incident=ir_ready` | 모델이 적으면 서류를 한 번에 완성할 수 있고, 사고 보고 담당자를 서류에 적어 두세요. |
| ② | `md_models=mo_several`, `md_incident=ir_maker` | 모델이 여러 개면 모델별 기술 자료를 정리하고, 베트남 보고 기준도 함께 확인하세요. |
| ③ | `md_models=mo_family`, `md_incident=ir_unknown` | 제품군 단위로 묶을 수 있는지 확인하고, 사고 보고 의무와 기한을 먼저 알아보세요. |
| ④ | `md_models=mo_accessories`, `md_incident=ir_planned` | 부속품도 따로 등록이 필요한지 확인하고, 담당자를 정해 연락처를 남겨 두세요. |
| ⑤ | `md_models=mo_unsure`, `md_incident=ir_unknown` | 판매할 모델 목록이 정해져야 등록 범위와 비용을 정할 수 있습니다. |

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
| ① | `md_area=area_hanoi`, `md_agencyNeed=an_online` | 온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요. |
| ② | `md_area=area_hcm`, `md_agencyNeed=an_office` | 낮은 등급은 지역 보건 담당 기관, 높은 등급은 보건부가 받는 경우가 많으니 등급부터 확인하세요. |
| ③ | `md_area=area_danang`, `md_agencyNeed=an_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `md_area=area_other_city`, `md_agencyNeed=an_visit` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `md_area=area_ip`, `md_agencyNeed=an_zone` | 산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `md_feeling=fl_lost`, `md_situation=sit_search_vn` | 어디서부터 시작해야 할지 몰라 막막한 상황입니다 | 의료기기는 위험 등급에 따라 낮은 등급은 기준 적용 신고, 높은 등급은 판매 등록이 필요하며, 품질 인증서, 위임장, 기술 자료, 수입 제품의 자유판매증명서가 기본입니다. |
| `md_feeling=fl_anxious`, `md_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 몰라 불안한 상황입니다 | 낮은 등급 신고는 비교적 빠르지만 높은 등급 등록은 심사에 시간이 걸리고, 해외 서류 인증이 일정에 큰 영향을 줍니다. 등급과 인증부터 시작하세요. |
| `md_feeling=fl_confused`, `md_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 | 의료기기 해당 여부와 등급은 제품 용도와 위험도에 따라 정해집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `md_feeling=fl_afraid`, `md_situation=sit_operating` | 허가 확인 전에 시작해 불안한 상황입니다 | 의료기기 신고·등록 과정에서는 담당 기관이 베트남어로 질문하고 보완을 요구할 수 있어, 내용을 이해하지 못한 채 답하면 처리가 길어질 수 있습니다. 접수 전에 통역과 전문가가 서류를 함께 점검하면 보완 요구를 줄일 수 있습니다. |
| `md_feeling=fl_tired`, `md_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 | 의료기기 신고·등록 서류는 이름·번호·숫자가 서로 다르거나 빠진 서류가 있으면 접수가 보류되거나 보완 요구를 받을 수 있습니다. 접수 전에 전문가가 서류를 점검하고 제출하는 날 동행하면 되돌아오는 횟수를 줄일 수 있습니다. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (registration) | `md_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다 |
| 2 (nominee) | `md_owner` ∈ {own_partner} | 현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다 |
| 3 (running) | `md_timeline` ∈ {tl_already} | 허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다 |
| 4 (language) | `md_langRoute` ∈ {lr_local, lr_machine, lr_none} | 베트남어 서류를 정확히 이해하지 못한 채 진행하면 불리한 조건을 놓칠 수 있어 전문 통역이나 번역 확인이 필요합니다 |
| 5 (answer) | `md_answerFeel` ∈ {ans_not_understood, ans_not_clear_vn} | 받은 안내를 정확히 이해하지 못한 채 진행하면 필요한 절차를 놓칠 수 있어 안내 내용을 문서로 다시 확인해야 합니다 |
| 6 (class) | `md_class` ∈ {cl_c, cl_d, cl_unknown} | 위험 등급이 높거나 모르면 등록 심사가 길어질 수 있어 등급 분류부터 받아야 합니다 |
| 7 (warehouse) | `md_warehouse` ∈ {wh_planned, wh_none} | 보관 시설이 확보되지 않으면 판매 조건을 갖추기 어려워 창고부터 정해야 합니다 |
| 8 (auth) | `md_authorization` ∈ {ma_none, ma_unknown} | 제조사 위임장이 없으면 수입 의료기기를 신고할 수 없어 위임장부터 받아야 합니다 |
| 9 (warranty) | `md_warranty` ∈ {ws_none, ws_unknown} | 베트남 안의 보증 거점이 없으면 신청이 어려울 수 있어 보증 업체 계약을 검토하세요 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 신청 전에 제품명과 모델명이 서류마다 같은지 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 법인설립 확인 | `md_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다. |
| 전문가 진행 | `md_timeline` ∈ {tl_already, tl_urgent} 또는 `md_situation` ∈ {sit_operating} | 높은 등급 제품이거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

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
| `cfs_issued` | 증명서 발급, 인증 전 |
| `cfs_legalized` | 자유판매증명서 인증 완료 |
| `cfs_none` | 증명서 없음 |
| `cfs_requested` | 증명서 요청 중 |
| `cfs_unknown` | 증명서 필요 여부를 모름 |
| `cl_a` | 가장 낮은 위험 등급(가) |
| `cl_b` | 낮은 위험 등급(나) |
| `cl_c` | 중간 이상 위험 등급(다) |
| `cl_d` | 가장 높은 위험 등급(라) |
| `cl_unknown` | 등급을 모름 |
| `cu_clinic` | 의원·치과 공급 |
| `cu_home` | 개인 고객 판매 |
| `cu_hospital` | 병원 공급 |
| `cu_pharmacy` | 약국·매장 판매 |
| `cu_unsure` | 판매처 미정 |
| `docs_all` | 기본 서류 모두 준비 |
| `docs_half` | 기본 서류 절반 준비 |
| `docs_little` | 기본 서류 거의 미준비 |
| `docs_most` | 기본 서류 대부분 준비 |
| `docs_unknown` | 필요 서류를 모름 |
| `fl_afraid` | 담당 기관 연락이 겁남 |
| `fl_anxious` | 진행 상황을 몰라 불안함 |
| `fl_confused` | 사람마다 말이 달라 혼란스러움 |
| `fl_lost` | 어디서 시작할지 막막함 |
| `fl_tired` | 한 번 막혀서 지침 |
| `ir_maker` | undefined |
| `ir_planned` | undefined |
| `ir_ready` | undefined |
| `ir_unknown` | undefined |
| `lr_interp` | 통역사·베트남어 하는 지인이 통역 |
| `lr_local` | 한국어 하는 베트남 직원이 설명 |
| `lr_machine` | 인공지능 번역기로 대략 이해 |
| `lr_none` | 베트남어를 몰라 내용을 알 수 없음 |
| `lr_self` | 베트남어를 직접 읽음 |
| `ma_loa` | 제조사 위임장 보유 |
| `ma_none` | 위임장 없음 |
| `ma_own` | 자사 제품 |
| `ma_pending` | 위임장 요청 중 |
| `ma_unknown` | 위임장 필요 여부를 모름 |
| `mo_accessories` | undefined |
| `mo_family` | undefined |
| `mo_few` | undefined |
| `mo_several` | undefined |
| `mo_unsure` | undefined |
| `op_after_fitout` | 공사 후 영업 |
| `op_after_permit` | 허가 후 영업 |
| `op_date` | 영업 시작일 정해짐 |
| `op_running` | 허가 없이 영업 중 |
| `op_unsure` | 영업 시작일 미정 |
| `own_fdi` | 외국인 투자 법인 |
| `own_household` | 개인사업자 |
| `own_local` | 베트남 현지 법인 |
| `own_partner` | 현지인 명의로 운영 |
| `own_undecided` | 운영 주체 미정 |
| `qd_iso` | 품질 경영 인증서 보유 |
| `qd_none` | 품질 서류 없음 |
| `qd_partial` | 일부 품질 서류만 있음 |
| `qd_requested` | 제조사에 요청 중 |
| `qd_unknown` | 필요한 서류를 모름 |
| `reg_company_done` | 법인 등록 완료 |
| `reg_household_done` | 개인사업자 등록 완료 |
| `reg_in_progress` | 사업자 등록 진행 중 |
| `reg_not_started` | 사업자 등록 전 |
| `reg_unsure` | 등록 상태를 모름 |
| `sit_conflicting` | 주변 사람들의 말이 서로 다름 |
| `sit_operating` | 허가 확인 전에 영업 시작 |
| `sit_rejected` | 서류 보완 요구를 받은 적 있음 |
| `sit_search_vn` | 베트남어 자료를 이해하지 못함 |
| `sit_unknown_progress` | 맡긴 일의 진행 정도를 모름 |
| `sn_account` | 온라인 접수 계정·서명 준비 |
| `sn_compare` | 제출 방식 비교 |
| `sn_interpreter` | 통역 필요 범위 확인 |
| `sn_proxy` | 위임장·연락 방법 준비 |
| `sn_scope` | 대행 범위·원본 보관 확인 |
| `st_change` | 등록 내용 변경 |
| `st_import` | 의료기기 수입 판매 |
| `st_local_make` | 베트남 생산 의료기기 |
| `st_trade` | 의료기기 유통만 |
| `st_unsure` | 어떤 절차인지 모름 |
| `sub_agency` | 대행사 제출을 고민 중 |
| `sub_self` | 직접 제출 |
| `sub_self_lang` | 직접 제출, 베트남어가 걱정됨 |
| `sub_staff` | 직원이 제출 |
| `sub_undecided` | 제출 방식 미정 |
| `tl_2_3m` | 두세 달 안에 허가 |
| `tl_already` | 이미 영업 중 |
| `tl_flexible` | 급하지 않음 |
| `tl_unsure` | 필요 시점 미정 |
| `tl_urgent` | 한 달 안에 허가 필요 |
| `tn_needed_tech` | 기술 교육 필요 |
| `tn_simple` | 사용법이 간단함 |
| `tn_unknown` | 교육 필요 여부를 모름 |
| `wc_basic` | 일반 보관 |
| `wc_controlled` | 온도·습도 관리 |
| `wc_unknown` | 보관 조건을 모름 |
| `wh_3pl` | 물류 위탁 창고 |
| `wh_none` | 창고 없음 |
| `wh_own` | 자체 보관 창고 |
| `wh_planned` | 창고 계약 예정 |
| `wh_unknown` | 보관 시설 필요 여부를 모름 |
| `ws_contract` | 보증 업체와 계약 |
| `ws_none` | 보증 거점 없음 |
| `ws_single_use` | 일회용 제품이라 보증 불필요 |
| `ws_unknown` | 보증 요건을 모름 |
| `ws_vn` | 베트남 내 보증 거점 있음 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 의료기기 관리 시행령 (제98/2021/NĐ-CP호): 위험 등급별 기준 적용 신고와 판매 등록, 신청 조건(보증 거점 등) | 베트남 정부 | 보도 기준 | https://luatvietan.vn/luu-hanh-trang-thiet-bi-y-te-loai-ab.html | 등급별 처리 기간과 조문 번호는 공식 원문 대조 필요 |
| 2 | 의료기기 관리 시행령 개정 (제07/2023/NĐ-CP호, 제04/2025/NĐ-CP호) | 베트남 정부 | 보도 기준 | https://vbpl.moj.gov.vn/TW/Lists/vbpq/Attachments/160120/07_2023_ND-CP_557403.doc , https://caselaw.vn/van-ban-phap-luat/411561-nghi-dinh-so-04-2025-nd-cp-ngay-01-01-2025-cua-chinh-phu-sua-doi-nghi-dinh-98-2021-nd-cp-ve-quan-ly-thiet-bi-y-te-da-duoc-sua-doi-theo-nghi-dinh-07-2023-nd-cp | 제07/2023호와 제04/2025호(2025.1.1 시행)로 개정된 사실은 확인함(이차 자료 기준). 2025년 개정 세부 내용은 원문 대조 필요 |
