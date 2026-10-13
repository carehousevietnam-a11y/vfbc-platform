# 환경 허가 직접 인허가 받기 콘텐츠 설계서

이 문서는 scripts/environment-content-spec.mjs 에서 자동 생성된다. 직접 고치지 않는다. 확인일 2026.10.12.

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
| env_installed | key: secured |
| env_building | key: unsecured |
| env_designing | key: unsecured |
| env_none | key: unsecured |
| env_unknown | key: 비어 있음(추가 확인 필요) |

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

1. 전 과정 대행: `ev_timeline` ∈ {tl_urgent, tl_already} 또는 `ev_registration` ∈ {reg_not_started} 또는 `ev_situation` ∈ {sit_operating}
2. 작성과 제출 동행: `ev_submitter` ∈ {sub_undecided} 또는 `ev_agencyNeed` ∈ {an_office, an_changed, an_zone} 또는 `ev_situation` ∈ {sit_rejected} 또는 `ev_langRoute` ∈ {lr_none}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**어떤 업종의 사업장이고, 환경 절차에서 가장 막막한 부분은 어디인가요?**

① **부품이나 제품을 만드는 공장을** 새로 세우려는데 환경 허가를 받아야 하는지 환경영향평가를 받아야 하는지 사람마다 말이 다릅니다.  
② **식품을 가공하는 공장인데** 생산을 늘리려면 환경 절차를 처음부터 다시 해야 하는지 모르겠습니다.  
③ **화학 원료를 쓰거나 도장 작업을 하는 공장인데** 이미 받은 환경 허가의 갱신 시기가 다가와서 뭘 다시 준비해야 하는지 걱정입니다.  
④ **섬유를 짜거나 염색하는 공장인데** 폐수가 많이 나오는 작업이라 환경 점검이 나오면 어떻게 대비해야 할지 불안합니다.  
⑤ **물건을 보관하고 나누는 물류 창고인데** 공장이 아닌 창고도 환경 절차를 받아야 하는지 아무도 확실히 말해 주지 않습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `ev_industry=in_manufacturing`, `ev_industryFocus=if_new_factory` | 새 제조 공장에 필요한 환경 절차를 확인하려는 상황입니다 |
| ② | `ev_industry=in_food`, `ev_industryFocus=if_expand` | 식품 공장의 규모 확대 시 환경 절차를 확인하려는 상황입니다 |
| ③ | `ev_industry=in_chemical`, `ev_industryFocus=if_renew` | 화학·도장 공장의 환경 허가 갱신 준비를 확인하려는 상황입니다 |
| ④ | `ev_industry=in_textile`, `ev_industryFocus=if_inspection` | 섬유·염색 공장의 환경 점검 대비를 확인하려는 상황입니다 |
| ⑤ | `ev_industry=in_warehouse`, `ev_industryFocus=if_which` | 물류 창고에 환경 절차가 필요한지 확인하려는 상황입니다 |

### 1차 2번 — Q2

**사업자 등록은 지금 어떤 상황이고, 누구 이름으로 환경 허가를 받을 생각이신가요?**

① **법인 등록은 끝났습니다.** 투자한 우리 법인 이름으로 환경 허가를 받으려고 합니다.  
② **개인사업자로 등록했습니다.** 제 이름으로 낸 사업자 등록증이 있어서, 그 이름으로 환경 허가를 받으려고 합니다.  
③ **등록 절차가 아직 진행 중입니다.** 끝나는 대로 베트남 현지 법인 이름으로 환경 허가를 받을 예정입니다.  
④ **등록은 아직 시작도 못 했습니다.** 어떤 이름으로 해야 할지 몰라서, 주변에서 현지인 이름으로 하라는 말도 들었습니다.  
⑤ **지금 어떤 상태인지** 저도 잘 모르겠습니다. 누구 이름으로 환경 허가를 받아야 하는지도 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `ev_registration=reg_company_done`, `ev_owner=own_fdi` | 외국인 투자 법인 등록을 마친 상황입니다 |
| ② | `ev_registration=reg_household_done`, `ev_owner=own_household` | 개인사업자 등록을 마친 상황입니다 |
| ③ | `ev_registration=reg_in_progress`, `ev_owner=own_local` | 현지 법인 등록이 진행 중인 상황입니다 |
| ④ | `ev_registration=reg_not_started`, `ev_owner=own_partner` | 사업자 등록 전이고 현지인 명의를 생각하는 상황입니다 |
| ⑤ | `ev_registration=reg_unsure`, `ev_owner=own_undecided` | 등록 상태와 운영 주체부터 확인해야 하는 상황입니다 |

### 1차 3번 — Q3

**오염을 막는 설비는 어디까지 갖추셨고, 주로 어떤 오염물이 나오나요?**

① **방지 설비는 다 설치했습니다.** 생산 과정에서 나오는 폐수를 그 설비로 처리하고 있습니다.  
② **설비 공사를 하고 있습니다.** 기계에서 나오는 배기가스와 먼지를 줄이려고 하는데 충분할지 모르겠습니다.  
③ **설비를 설계하고 있습니다.** 따로 처리해야 하는 산업 폐기물이 나오는데 어떻게 다뤄야 할지 막막합니다.  
④ **방지 설비를 따로 갖추지 못했습니다.** 기계 소음과 진동이 주변에 들릴 정도로 나서 민원이 올까 걱정입니다.  
⑤ **뭐가 필요한지** 모르겠습니다. 어떤 오염물이 얼마나 나오는지도 몰라서 어떤 설비가 필요한지 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `ev_facility=env_installed`, `ev_emission=em_wastewater` | 방지시설을 갖추고 폐수를 처리하는 상황입니다 |
| ② | `ev_facility=env_building`, `ev_emission=em_air` | 방지시설 공사 중이고 배기가스를 줄이려는 상황입니다 |
| ③ | `ev_facility=env_designing`, `ev_emission=em_waste` | 방지시설 설계 중이고 폐기물을 다룰 상황입니다 |
| ④ | `ev_facility=env_none`, `ev_emission=em_noise` | 방지시설 없이 소음·진동이 나는 상황입니다 |
| ⑤ | `ev_facility=env_unknown`, `ev_emission=em_unknown` | 배출 종류와 필요한 시설을 확인해야 하는 상황입니다 |

### 1차 4번 — Q4

**환경영향평가나 환경 등록 이야기는 들어 보셨고, 우리 사업장 규모는 어느 정도인가요?**

① **환경영향평가는 마쳤습니다.** 하루 생산량이 많은 대규모로 운영하고 있는데 평가 후에 따로 할 일이 있는지 궁금합니다.  
② **환경영향평가를 진행 중입니다.** 중간 정도 규모로 계획하고 있는데 이 규모가 평가 대상이 맞는지 궁금합니다.  
③ **환경 등록만 하면 된다고 들었습니다.** 규모가 작아서 오염물이 많이 나오지 않기 때문이라고 하는데 맞는지 모르겠습니다.  
④ **평가도 등록도 하지 않았습니다.** 우리 사업장 규모가 어느 기준에 해당하는지도 모르겠습니다.  
⑤ **평가 대상인지** 모르겠습니다. 규모가 대규모와 소규모 사이라서 어느 쪽 절차를 따라야 하는지 궁금합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `ev_assessment=as_done`, `ev_scale=sc_large` | 환경영향평가를 마친 대규모 사업장인 상황입니다 |
| ② | `ev_assessment=as_in_progress`, `ev_scale=sc_mid` | 평가가 진행 중인 중간 규모 사업장인 상황입니다 |
| ③ | `ev_assessment=as_registration`, `ev_scale=sc_small` | 환경 등록 대상인 소규모 사업장으로 아는 상황입니다 |
| ④ | `ev_assessment=as_none`, `ev_scale=sc_unknown` | 평가·등록을 하지 않았고 규모 기준을 모르는 상황입니다 |
| ⑤ | `ev_assessment=as_unknown`, `ev_scale=sc_between` | 평가 대상 여부와 규모 기준을 확인해야 하는 상황입니다 |

### 1차 5번 — Q5

**이 일을 하시면서 가장 답답하고 불안한 점은 무엇이고, 지금 어떤 상황인가요?**

① **어디서부터 시작해야 할지** 막막합니다. 검색도 해 봤는데 베트남어 자료라 어떤 말이 맞는지 모르겠습니다.  
② **일이 제대로 되고 있는지** 불안합니다. 베트남 지인이나 직원이 알아서 한다는데 어디까지 됐는지 알 수 없습니다.  
③ **사람마다 말이 달라** 혼란스럽습니다. 건물주, 업체, 지인이 각자 다르게 말해서 누구 말이 맞는지 모르겠습니다.  
④ **담당 기관에서 연락이 올까** 겁이 납니다. 공장 가동을 이미 시작했는데 환경 허가가 아직 확인되지 않았습니다.  
⑤ **이미 한 번 막혀서** 지쳤습니다. 서류를 냈다가 보완하라고 돌려받은 적이 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `ev_feeling=fl_lost`, `ev_situation=sit_search_vn` | 어디서 시작할지 막막하고 베트남어 자료를 이해하기 어려운 상황입니다 |
| ② | `ev_feeling=fl_anxious`, `ev_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 알 수 없어 불안한 상황입니다 |
| ③ | `ev_feeling=fl_confused`, `ev_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 |
| ④ | `ev_feeling=fl_afraid`, `ev_situation=sit_operating` | 허가 확인 전에 시작해 불안한 상황입니다 |
| ⑤ | `ev_feeling=fl_tired`, `ev_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 |

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
| ① | `ev_docs=docs_all`, `ev_langRoute=lr_self` | 서류가 갖춰졌으니 도면의 시설 위치와 실제 설치 위치가 같은지만 확인하고 접수하세요. |
| ② | `ev_docs=docs_most`, `ev_langRoute=lr_interp` | 남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요. 통역한 내용이 서류 원문과 같은지 접수 전에 한 번 더 확인하세요. |
| ③ | `ev_docs=docs_half`, `ev_langRoute=lr_local` | 준비한 서류 목록을 만든 뒤 배출량 자료와 방지시설 설명서가 빠졌는지부터 확인하세요. 직원 설명은 서류 원문과 대조해 확인하세요. |
| ④ | `ev_docs=docs_little`, `ev_langRoute=lr_machine` | 업종과 규모별로 환경 허가·등록·평가 중 무엇이 필요한지 먼저 확인하세요. 인공지능 번역은 법률 용어와 숫자가 틀릴 수 있으니 중요한 서류는 전문가 확인을 받으세요. |
| ⑤ | `ev_docs=docs_unknown`, `ev_langRoute=lr_none` | 업종과 생산량, 배출 종류를 먼저 정리하면 필요한 서류가 정해집니다. 베트남어 서류를 읽어 줄 사람이나 전문 번역부터 정하세요. |

### 2차 7번 — Q7

**공장에서 나오는 폐기물은 어떻게 처리하고 계시고, 어떤 점이 가장 걱정되나요?**

① **허가받은 처리 업체와 계약했습니다.** 계약서에 적힌 폐기물 종류가 우리 공장에서 나오는 것과 맞는지 확인하지 못했습니다.  
② **산업단지가 폐기물을 함께 처리해 줍니다.** 단지 처리에 위험한 폐기물까지 포함되는지 모르겠습니다.  
③ **처리 업체와 계약한 곳이 없습니다.** 어떤 업체가 허가를 받은 업체인지 찾는 방법부터 모르겠습니다.  
④ **폐기물을 직접 처리하거나 버리고** 있습니다. 그렇게 해도 되는지, 기록을 남겨야 하는지 몰라서 불안합니다.  
⑤ **어떻게 처리해야 하는지** 모르겠습니다. 우리 공장 폐기물이 위험 폐기물인지 일반 폐기물인지부터 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_wasteContract=wc_licensed`, `ev_wasteKind=wk_match` | 계약서의 폐기물 종류와 우리 공장의 실제 폐기물을 대조하고 처리 기록을 함께 보관하세요. |
| ② | `ev_wasteContract=wc_landlord`, `ev_wasteKind=wk_hazard` | 산업단지 처리가 우리 폐기물 종류까지 포함하는지 단지 운영 기관에 먼저 확인하세요. |
| ③ | `ev_wasteContract=wc_none`, `ev_wasteKind=wk_find` | 계약이 없으면 허가가 어려울 수 있으니 허가받은 처리 업체 목록을 담당 기관에서 확인하세요. |
| ④ | `ev_wasteContract=wc_self`, `ev_wasteKind=wk_self_rule` | 산업 폐기물은 직접 처리가 제한될 수 있으니 허용 범위와 기록 의무를 먼저 확인하세요. |
| ⑤ | `ev_wasteContract=wc_unknown`, `ev_wasteKind=wk_classify` | 폐기물 종류를 먼저 구분해야 처리 방법이 정해지니 성분 자료를 모아 확인하세요. |

### 2차 8번 — Q8

**사업장은 어떤 지역에 있고, 주변 주민들이 불편해한다는 이야기는 들어 보셨나요?**

① **산업단지 안에 있습니다.** 주변 주민이 불편해한다는 이야기는 들은 적이 없는데 입지 기준은 따로 있는지 궁금합니다.  
② **공업 지구에 있습니다.** 주민들이 냄새나 소음을 걱정한다는 이야기를 몇 번 들었습니다.  
③ **주거 지역 가까이에 있습니다.** 이미 주민 민원이 관할 기관에 한 번 들어온 적이 있습니다.  
④ **농촌 지역에 있습니다.** 주변 주민들이 우리 사업장을 어떻게 생각하는지 아직 모릅니다.  
⑤ **이 지역에서 해도 되는지** 모르겠습니다. 주변에 주거지가 있는지 확인하지 못해서 주민 민원이 생길지도 가늠이 안 됩니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_location=lo_ip`, `ev_neighbors=nb_none` | 산업단지 안이면 단지의 환경 기준과 공용 처리 시설을 먼저 확인하세요. |
| ② | `ev_location=lo_cluster`, `ev_neighbors=nb_concern` | 주민 우려가 있다면 배출 저감 계획을 미리 준비해 두면 절차가 부드러워집니다. |
| ③ | `ev_location=lo_residential`, `ev_neighbors=nb_complaint` | 주거지 인근 민원은 허가에 큰 영향을 줄 수 있으니 민원 내용과 조치를 먼저 정리하세요. |
| ④ | `ev_location=lo_rural`, `ev_neighbors=nb_unknown` | 농촌 지역은 물과 토양 영향이 중요하게 보일 수 있으니 배출 관리 계획을 준비하세요. |
| ⑤ | `ev_location=lo_unknown`, `ev_neighbors=nb_unknown` | 업종에 따라 입지 제한이 있을 수 있으니 사업장 위치가 적합한지 먼저 확인하세요. |

### 2차 9번 — Q9

**허가는 언제까지 받아야 마음이 놓이고, 공장 가동은 언제쯤 시작하고 싶으신가요?**

① **한 달 안에는** 받아야 합니다. 가동 시작 날짜를 이미 정해 놓아서 허가가 늦어지면 미루기 어렵습니다.  
② **두세 달 안에** 받으면 됩니다. 시설 공사가 끝나는 날에 맞춰 공장 가동을 시작하려고 합니다.  
③ **급하진 않습니다.** 서두르다 놓치는 게 없도록 허가가 나온 걸 확인한 뒤에 천천히 공장 가동을 시작하고 싶습니다.  
④ **언제까지인지** 모르겠습니다. 허가가 언제까지 필요한지, 공장 가동을 언제 시작할지도 아직 정하지 못했습니다.  
⑤ **이미 공장을 가동하고 있습니다.** 허가를 못 받은 채 먼저 시작했는데 문제가 되지 않을지 불안합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_timeline=tl_urgent`, `ev_openPlan=op_date` | 한 달은 환경 절차에 매우 빠듯하니 시설 자료와 서류를 바로 준비하세요. |
| ② | `ev_timeline=tl_2_3m`, `ev_openPlan=op_after_fitout` | 시설 공사가 끝나는 날을 기준으로 환경 절차 일정을 거꾸로 계산해 두세요. |
| ③ | `ev_timeline=tl_flexible`, `ev_openPlan=op_after_permit` | 시간 여유가 있으니 설계 단계에서 배출 기준을 먼저 맞추고 공사를 진행하세요. |
| ④ | `ev_timeline=tl_unsure`, `ev_openPlan=op_unsure` | 가동 시작 시점을 정해야 공사와 환경 절차 일정을 맞출 수 있습니다. |
| ⑤ | `ev_timeline=tl_already`, `ev_openPlan=op_running` | 환경 절차 없이 가동 중이라면 제재를 받을 수 있으니 바로 절차를 시작하세요. |

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
| ① | `ev_askedWho=ask_agency_kr`, `ev_answerFeel=ans_unsure_trust` | 여러 곳의 설명이 다르면 같은 질문을 글로 정리해 보내고 답을 나란히 비교하세요. |
| ② | `ev_askedWho=ask_local`, `ev_answerFeel=ans_not_understood` | 현지 업체의 설명은 문서로 받아 통역이나 전문 번역으로 한 번 더 확인하세요. |
| ③ | `ev_askedWho=ask_acquaint`, `ev_answerFeel=ans_not_fit` | 경험담은 시기와 지역, 사업 형태가 같아야 참고가 되니 조건이 같은지 먼저 대조하세요. |
| ④ | `ev_askedWho=ask_authority`, `ev_answerFeel=ans_not_clear_vn` | 기관 안내는 받은 날짜와 담당 부서, 내용을 적어 두고 통역을 거쳐 다시 확인하세요. |
| ⑤ | `ev_askedWho=ask_nobody`, `ev_answerFeel=ans_unknown_who` | 먼저 지역의 담당 기관이 어디인지 확인하고 물어볼 내용을 정리해 두세요. |

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
| ① | `ev_submitter=sub_self`, `ev_submitNeed=sn_account` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `ev_submitter=sub_staff`, `ev_submitNeed=sn_proxy` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `ev_submitter=sub_agency`, `ev_submitNeed=sn_scope` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `ev_submitter=sub_undecided`, `ev_submitNeed=sn_compare` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `ev_submitter=sub_self_lang`, `ev_submitNeed=sn_interpreter` | 직접 제출하되 베트남어가 어렵다면 제출하는 날 통역이 필요한 범위를 미리 정해 두세요. |

### 2차 12번 — Q12

**허가를 받은 뒤 환경 상태를 정기적으로 보고해야 한다는데, 그 일은 누가 맡을 예정인가요?**

① **환경 담당 직원이 맡습니다.** 환경 관련 교육을 받은 직원이 이미 일하고 있습니다.  
② **외부 컨설팅 업체에 맡기려고** 합니다. 회사 안에는 환경 업무를 아는 직원이 없습니다.  
③ **공장장이 함께 맡을 예정입니다.** 환경 업무만 맡을 담당 직원은 아직 없어서 새로 뽑을 계획입니다.  
④ **그런 보고가 있는지** 몰랐습니다. 환경 업무를 맡을 사람을 아직 정하지 못했습니다.  
⑤ **본사에서 원격으로 관리하려고** 합니다. 현지에는 환경 업무를 맡을 직원이 따로 없습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_reporting=rp_staff`, `ev_staff=es_trained` | 담당 직원이 있으니 보고 일정표를 만들어 놓치지 않도록 관리하세요. |
| ② | `ev_reporting=rp_consultant`, `ev_staff=es_none` | 외부에 맡기더라도 회사 안에서 자료를 모아 줄 담당자를 정해 두세요. |
| ③ | `ev_reporting=rp_manager`, `ev_staff=es_hiring` | 공장장이 함께 맡으면 보고 기한을 놓치기 쉬우니 일정 알림을 만들어 두세요. |
| ④ | `ev_reporting=rp_unknown`, `ev_staff=es_none` | 허가 뒤에도 정기 보고 의무가 있을 수 있으니 범위와 기한부터 확인하세요. |
| ⑤ | `ev_reporting=rp_hq`, `ev_staff=es_remote` | 현지 보고는 베트남어로 해야 할 수 있으니 현지 담당자를 함께 두세요. |

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
| ① | `ev_area=area_hanoi`, `ev_agencyNeed=an_online` | 온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요. |
| ② | `ev_area=area_hcm`, `ev_agencyNeed=an_office` | 환경 허가는 규모에 따라 지역 농업환경 담당 기관이나 중앙 부처가 받으니 규모 기준부터 확인하세요. |
| ③ | `ev_area=area_danang`, `ev_agencyNeed=an_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `ev_area=area_other_city`, `ev_agencyNeed=an_visit` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `ev_area=area_ip`, `ev_agencyNeed=an_zone` | 산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `ev_feeling=fl_lost`, `ev_situation=sit_search_vn` | 어디서부터 시작해야 할지 몰라 막막한 상황입니다 | 환경 절차는 업종과 규모에 따라 환경영향평가, 환경 허가, 환경 등록으로 나뉘며, 공장 도면, 배출량 자료, 방지시설 설명서가 기본입니다. |
| `ev_feeling=fl_anxious`, `ev_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 몰라 불안한 상황입니다 | 환경 절차는 서류 검토와 현장 확인에 시간이 걸리고, 방지시설이 갖춰져야 진행할 수 있습니다. 공사 일정과 환경 일정을 함께 맞추세요. |
| `ev_feeling=fl_confused`, `ev_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 | 환경 허가 대상은 업종, 생산량, 배출 종류와 사업장 위치에 따라 정해집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `ev_feeling=fl_afraid`, `ev_situation=sit_operating` | 허가 확인 전에 시작해 불안한 상황입니다 | 환경 허가 과정에서는 담당 기관이 베트남어로 질문하고 보완을 요구할 수 있어, 내용을 이해하지 못한 채 답하면 처리가 길어질 수 있습니다. 접수 전에 통역과 전문가가 서류를 함께 점검하면 보완 요구를 줄일 수 있습니다. |
| `ev_feeling=fl_tired`, `ev_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 | 환경 허가 서류는 이름·번호·숫자가 서로 다르거나 빠진 서류가 있으면 접수가 보류되거나 보완 요구를 받을 수 있습니다. 접수 전에 전문가가 서류를 점검하고 제출하는 날 동행하면 되돌아오는 횟수를 줄일 수 있습니다. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (registration) | `ev_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다 |
| 2 (nominee) | `ev_owner` ∈ {own_partner} | 현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다 |
| 3 (running) | `ev_timeline` ∈ {tl_already} | 허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다 |
| 4 (language) | `ev_langRoute` ∈ {lr_local, lr_machine, lr_none} | 베트남어 서류를 정확히 이해하지 못한 채 진행하면 불리한 조건을 놓칠 수 있어 전문 통역이나 번역 확인이 필요합니다 |
| 5 (answer) | `ev_answerFeel` ∈ {ans_not_understood, ans_not_clear_vn} | 받은 안내를 정확히 이해하지 못한 채 진행하면 필요한 절차를 놓칠 수 있어 안내 내용을 문서로 다시 확인해야 합니다 |
| 6 (facility) | `ev_facility` ∈ {env_designing, env_none, env_unknown} | 배출·방지시설이 갖춰지지 않으면 환경 절차를 진행하기 어려워 시설부터 갖춰야 합니다 |
| 7 (assessment) | `ev_assessment` ∈ {as_none, as_unknown} | 환경영향평가 대상인데 진행하지 않으면 사업이 멈출 수 있어 대상 여부부터 확인하세요 |
| 8 (waste) | `ev_wasteContract` ∈ {wc_none, wc_unknown, wc_self} | 폐기물 처리 계약이 없으면 허가가 어려울 수 있어 허가받은 처리 업체부터 정하세요 |
| 9 (complaint) | `ev_neighbors` ∈ {nb_complaint} | 주민 민원이 있었다면 민원 내용과 조치 기록을 먼저 정리해야 합니다 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 가동 전에 방지시설 작동과 측정 기록을 한 번 더 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 법인설립 확인 | `ev_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다. |
| 소방 허가 확인 | `ev_industryFocus` ∈ {if_new_factory, if_expand} | 공장을 새로 짓거나 늘린다면 소방 허가 직접 인허가 받기에서 소방 준비도 함께 점검해 보실 수 있습니다. |
| 전문가 진행 | `ev_timeline` ∈ {tl_already, tl_urgent} 또는 `ev_situation` ∈ {sit_operating} | 이미 가동 중이거나 민원이 있다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

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
| `as_done` | 환경영향평가 완료 |
| `as_in_progress` | 환경영향평가 진행 중 |
| `as_none` | 평가·등록 안 함 |
| `as_registration` | 환경 등록 대상 |
| `as_unknown` | 평가 대상 여부를 모름 |
| `ask_acquaint` | 지인·경험자에게 문의 |
| `ask_agency_kr` | 한국인 대행사에 문의 |
| `ask_authority` | 담당 기관에 직접 문의 |
| `ask_local` | 베트남 현지 업체에 문의 |
| `ask_nobody` | 아직 아무에게도 문의 못 함 |
| `docs_all` | 기본 서류 모두 준비 |
| `docs_half` | 기본 서류 절반 준비 |
| `docs_little` | 기본 서류 거의 미준비 |
| `docs_most` | 기본 서류 대부분 준비 |
| `docs_unknown` | 필요 서류를 모름 |
| `em_air` | 배기가스·먼지 발생 |
| `em_noise` | 소음·진동 발생 |
| `em_unknown` | 배출 종류를 모름 |
| `em_waste` | 산업 폐기물 발생 |
| `em_wastewater` | 폐수 발생 |
| `env_building` | 방지시설 공사 중 |
| `env_designing` | 방지시설 설계 중 |
| `env_installed` | 배출·방지시설 설치 완료 |
| `env_none` | 방지시설 없음 |
| `env_unknown` | 필요한 시설을 모름 |
| `es_hiring` | undefined |
| `es_none` | undefined |
| `es_remote` | undefined |
| `es_trained` | undefined |
| `fl_afraid` | 담당 기관 연락이 겁남 |
| `fl_anxious` | 진행 상황을 몰라 불안함 |
| `fl_confused` | 사람마다 말이 달라 혼란스러움 |
| `fl_lost` | 어디서 시작할지 막막함 |
| `fl_tired` | 한 번 막혀서 지침 |
| `if_expand` | 규모 확대 시 절차 확인 |
| `if_inspection` | 환경 점검 대비 확인 |
| `if_new_factory` | 새 공장 환경 절차 확인 |
| `if_renew` | 환경 허가 갱신 준비 확인 |
| `if_which` | 창고의 환경 절차 필요 여부 확인 |
| `in_chemical` | 화학·도장 |
| `in_food` | 식품 가공 |
| `in_manufacturing` | 일반 제조 |
| `in_textile` | 섬유·염색 |
| `in_warehouse` | 물류·창고 |
| `lo_cluster` | 공업 지구 |
| `lo_ip` | 산업단지 안 |
| `lo_residential` | 주거 지역 인근 |
| `lo_rural` | 농촌 지역 |
| `lo_unknown` | 입지 기준을 모름 |
| `lr_interp` | 통역사·베트남어 하는 지인이 통역 |
| `lr_local` | 한국어 하는 베트남 직원이 설명 |
| `lr_machine` | 인공지능 번역기로 대략 이해 |
| `lr_none` | 베트남어를 몰라 내용을 알 수 없음 |
| `lr_self` | 베트남어를 직접 읽음 |
| `nb_complaint` | 민원 접수됨 |
| `nb_concern` | 주민 우려 있음 |
| `nb_none` | 주민 민원 없음 |
| `nb_unknown` | 주민 반응을 모름 |
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
| `reg_company_done` | 법인 등록 완료 |
| `reg_household_done` | 개인사업자 등록 완료 |
| `reg_in_progress` | 사업자 등록 진행 중 |
| `reg_not_started` | 사업자 등록 전 |
| `reg_unsure` | 등록 상태를 모름 |
| `rp_consultant` | undefined |
| `rp_hq` | undefined |
| `rp_manager` | undefined |
| `rp_staff` | undefined |
| `rp_unknown` | undefined |
| `sc_between` | undefined |
| `sc_large` | 대규모 사업장 |
| `sc_mid` | 중간 규모 사업장 |
| `sc_small` | 소규모 사업장 |
| `sc_unknown` | 규모 기준을 모름 |
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
| `wc_landlord` | 산업단지가 처리 |
| `wc_licensed` | 허가받은 처리 업체와 계약 |
| `wc_none` | 처리 계약 없음 |
| `wc_self` | 직접 처리·폐기 |
| `wc_unknown` | 처리 방법을 모름 |
| `wk_classify` | 폐기물 종류 구분 확인 |
| `wk_find` | 허가 업체 찾는 방법 확인 |
| `wk_hazard` | 단지의 위험 폐기물 처리 확인 |
| `wk_match` | 계약 폐기물 종류 확인 |
| `wk_self_rule` | 직접 처리 허용 범위 확인 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 환경보호법 (제72/2020/QH14호): 환경영향평가, 환경 허가, 환경 등록 대상 구분 | 베트남 국회 | 보도 기준 | https://thuvienphapluat.vn/hoi-dap-phap-luat/doi-tuong-nao-can-co-giay-phep-moi-truong-138019034.html | 대상 기준과 조문 번호는 공식 원문 대조 필요 |
| 2 | 환경보호법 시행령 (제08/2022/NĐ-CP호, 2025년 개정) | 베트남 정부 | 보도 기준 | 원문 링크 확인 중 | 제05/2025/NĐ-CP호 개정이 있는 사실은 확인함(이차 자료 기준). 개정 내용은 원문 대조 필요 |
