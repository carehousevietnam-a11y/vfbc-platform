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

1. 전 과정 대행: `ev_helpWanted` ∈ {help_full} 또는 `ev_timeline` ∈ {tl_urgent, tl_already} 또는 `ev_registration` ∈ {reg_not_started} 또는 `ev_neighbors` ∈ {nb_complaint}
2. 작성과 제출 동행: `ev_helpWanted` ∈ {help_accompany} 또는 `ev_submitter` ∈ {sub_undecided} 또는 `ev_agencyKnown` ∈ {ag_unknown, ag_changed}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**환경과 관련해 어떤 절차가 필요하고, 어떤 업종의 사업장인가요?**

① **새 공장이나 사업장**을 준비하고 있습니다. 부품이나 제품을 만드는 일반 제조 공장입니다.  
② **생산 규모를 늘리려고** 합니다. 원료를 가공해 식품을 만드는 공장을 운영하고 있습니다.  
③ **기존 환경 허가를 갱신**해야 합니다. 화학 원료를 쓰거나 도장 작업을 하는 공장입니다.  
④ **환경 점검에 대비**하려고 합니다. 섬유를 짜거나 물들이는 염색 작업을 하고 있습니다.  
⑤ **어떤 절차가 필요한지** 모르겠습니다. 물건을 보관하고 나누는 물류 창고를 운영하려고 합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `ev_stage=st_new_project`, `ev_industry=in_manufacturing` | 새 제조 공장의 환경 절차를 준비하는 상황입니다 |
| ② | `ev_stage=st_expand`, `ev_industry=in_food` | 식품 가공 공장의 규모를 늘리려는 상황입니다 |
| ③ | `ev_stage=st_renew`, `ev_industry=in_chemical` | 화학·도장 공장의 환경 허가를 갱신하는 상황입니다 |
| ④ | `ev_stage=st_check`, `ev_industry=in_textile` | 섬유·염색 공장의 환경 점검에 대비하는 상황입니다 |
| ⑤ | `ev_stage=st_unsure`, `ev_industry=in_warehouse` | 물류 창고에 필요한 환경 절차부터 확인할 상황입니다 |

### 1차 2번 — Q2

**사업자 등록은 어디까지 진행되었고, 누구 이름으로 환경 절차를 진행하실 예정인가요?**

① **법인 등록을 이미** 마쳤습니다. 외국인이 투자한 법인 이름으로 허가를 받으려고 합니다.  
② **개인사업자 등록을** 마쳤습니다. 규모가 작아서 개인사업자로 허가를 받으려고 합니다.  
③ **사업자 등록을 진행하고** 있습니다. 베트남 현지 법인 이름으로 허가를 받을 예정입니다.  
④ **사업자 등록을 아직** 시작하지 않았습니다. 베트남 사람 이름으로 등록해서 운영하려고 생각하고 있습니다.  
⑤ **등록 상태를 정확히** 모르겠습니다. 누구 이름으로 허가를 받아야 하는지도 아직 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `ev_registration=reg_company_done`, `ev_owner=own_fdi` | 외국인 투자 법인 등록을 마친 상황입니다 |
| ② | `ev_registration=reg_household_done`, `ev_owner=own_household` | 개인사업자 등록을 마친 상황입니다 |
| ③ | `ev_registration=reg_in_progress`, `ev_owner=own_local` | 현지 법인 등록이 진행 중인 상황입니다 |
| ④ | `ev_registration=reg_not_started`, `ev_owner=own_partner` | 사업자 등록 전이고 현지인 명의를 생각하는 상황입니다 |
| ⑤ | `ev_registration=reg_unsure`, `ev_owner=own_undecided` | 등록 상태와 운영 주체부터 확인해야 하는 상황입니다 |

### 1차 3번 — Q3

**배출·방지시설은 갖추었고, 사업장에서 주로 어떤 오염물이 나오나요?**

① **배출·방지시설을 모두** 설치했습니다. 생산 과정에서 폐수가 나와서 폐수 처리 시설을 갖추었습니다.  
② **방지시설 공사를 하고** 있습니다. 기계가 돌아가는 동안 배기가스와 먼지가 많이 나옵니다.  
③ **방지시설을 설계**하고 있습니다. 생산 과정에서 따로 처리해야 하는 산업 폐기물이 나옵니다.  
④ **방지시설을 따로** 갖추지 않았습니다. 기계 소음과 진동이 주변에 들릴 정도로 납니다.  
⑤ **어떤 시설이 필요한지** 모르겠습니다. 어떤 오염물이 얼마나 나오는지도 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `ev_facility=env_installed`, `ev_emission=em_wastewater` | 방지시설을 갖추었고 폐수가 나오는 상황입니다 |
| ② | `ev_facility=env_building`, `ev_emission=em_air` | 방지시설 공사 중이고 배기가스가 나오는 상황입니다 |
| ③ | `ev_facility=env_designing`, `ev_emission=em_waste` | 방지시설 설계 중이고 폐기물이 나오는 상황입니다 |
| ④ | `ev_facility=env_none`, `ev_emission=em_noise` | 방지시설 없이 소음·진동이 나는 상황입니다 |
| ⑤ | `ev_facility=env_unknown`, `ev_emission=em_unknown` | 배출 종류와 필요한 시설을 확인해야 하는 상황입니다 |

### 1차 4번 — Q4

**환경영향평가나 환경 등록은 진행했고, 사업장 규모는 어느 정도인가요?**

① **환경영향평가를** 마쳤습니다. 하루 생산량이 많은 대규모 사업장으로 운영하고 있습니다.  
② **환경영향평가를 진행**하고 있습니다. 중간 정도 규모의 생산 시설을 계획하고 있습니다.  
③ **환경 등록만 하면** 되는 것으로 알고 있습니다. 작은 규모라서 오염물 배출이 많지 않습니다.  
④ **평가나 등록을** 하지 않았습니다. 사업장 규모가 어느 기준에 해당하는지 모르겠습니다.  
⑤ **평가 대상인지** 모르겠습니다. 중간 정도 규모라서 어떤 환경 절차가 맞는지 궁금합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `ev_assessment=as_done`, `ev_scale=sc_large` | 환경영향평가를 마친 대규모 사업장인 상황입니다 |
| ② | `ev_assessment=as_in_progress`, `ev_scale=sc_mid` | 평가가 진행 중인 중간 규모 사업장인 상황입니다 |
| ③ | `ev_assessment=as_registration`, `ev_scale=sc_small` | 환경 등록 대상인 소규모 사업장으로 아는 상황입니다 |
| ④ | `ev_assessment=as_none`, `ev_scale=sc_unknown` | 평가·등록을 하지 않았고 규모 기준을 모르는 상황입니다 |
| ⑤ | `ev_assessment=as_unknown`, `ev_scale=sc_mid` | 평가 대상 여부를 확인해야 하는 상황입니다 |

### 1차 5번 — Q5

**지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?**

① **총비용이 얼마인지** 걱정됩니다. 필요한 서류는 제가 만들 수 있도록 안내만 받고 싶습니다.  
② **필요한 서류가 무엇인지** 모르겠습니다. 서류 작성 방법을 하나씩 알려 주면 직접 준비하겠습니다.  
③ **허가가 언제 나올지** 걱정됩니다. 제출하는 날 담당 기관에 통역과 함께 가고 싶습니다.  
④ **우리 사업장이 환경 허가 대상인지** 모르겠습니다. 서류 준비부터 제출과 수령까지 모두 맡기고 싶습니다.  
⑤ **받은 견적이 적정한지** 모르겠습니다. 서류는 제가 준비하고 제출할 때만 함께 가고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `ev_mainConcern=concern_cost`, `ev_helpWanted=help_guide` | 총비용을 알고 직접 서류를 준비하려는 상황입니다 |
| ② | `ev_mainConcern=concern_docs`, `ev_helpWanted=help_guide` | 필요한 서류부터 알고 싶은 상황입니다 |
| ③ | `ev_mainConcern=concern_time`, `ev_helpWanted=help_accompany` | 허가 일정이 걱정되어 제출 동행을 원하는 상황입니다 |
| ④ | `ev_mainConcern=concern_eligibility`, `ev_helpWanted=help_full` | 허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다 |
| ⑤ | `ev_mainConcern=concern_quote`, `ev_helpWanted=help_accompany` | 받은 견적이 적정한지 확인하려는 상황입니다 |

### 2차 6번 — Q6

**허가 신청 서류는 어디까지 준비되었고, 번역이나 인증이 필요한 서류가 있나요?**

① **사업자 등록증, 공장 도면, 배출·방지시설 설명서를 모두** 준비했습니다. 모든 서류의 베트남어 번역도 이미 끝냈습니다.  
② **대부분 준비**했고 몇 가지만 남았습니다. 해외에서 받은 서류는 번역과 영사 인증이 필요합니다.  
③ **절반쯤 준비**했습니다. 베트남어 번역이 필요한 서류가 있는지 몰라서 확인이 필요합니다.  
④ **거의 준비하지 못했습니다.** 번역과 인증을 어디서 어떻게 하는지도 함께 알고 싶습니다.  
⑤ **무엇이 필요한지 아직 모릅니다.** 준비한 서류가 없어서 번역할 서류도 아직 없는 상태입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_docs=docs_all`, `ev_translation=tn_none` | 서류가 갖춰졌으니 도면의 시설 위치와 실제 설치 위치가 같은지만 확인하고 접수하세요. |
| ② | `ev_docs=docs_most`, `ev_translation=tn_needed` | 남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요. |
| ③ | `ev_docs=docs_half`, `ev_translation=tn_unsure` | 준비한 서류 목록을 만든 뒤 배출량 자료와 방지시설 설명서가 빠졌는지부터 확인하세요. |
| ④ | `ev_docs=docs_little`, `ev_translation=tn_needed` | 업종과 규모별로 환경 허가·등록·평가 중 무엇이 필요한지 먼저 확인하세요. |
| ⑤ | `ev_docs=docs_unknown`, `ev_translation=tn_none` | 업종과 생산량, 배출 종류를 먼저 정리하면 필요한 서류가 정해집니다. |

### 2차 7번 — Q7

**오염물 측정은 어떻게 하고 있고, 폐기물은 어떤 업체가 처리하나요?**

① **자동 측정 장비를** 설치했습니다. 정부 허가를 받은 폐기물 처리 업체와 계약을 맺었습니다.  
② **측정 업체와 정기 측정** 계약을 맺었습니다. 산업단지에서 폐기물을 함께 처리해 주고 있습니다.  
③ **측정 계획을 아직** 세우지 않았습니다. 폐기물 처리 업체와 계약을 맺지 않았습니다.  
④ **측정 의무가 있는지** 모르겠습니다. 폐기물을 어떻게 처리해야 하는지도 잘 모릅니다.  
⑤ **자동 측정 장비 설치를** 검토하고 있습니다. 폐기물 처리 계약은 허가받은 업체와 맺어 두었습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_monitoring=mo_auto`, `ev_wasteContract=wc_licensed` | 측정 기록과 처리 계약서를 함께 보관해 두면 점검 때 바로 보여 줄 수 있습니다. |
| ② | `ev_monitoring=mo_periodic`, `ev_wasteContract=wc_landlord` | 산업단지 처리가 우리 폐기물 종류까지 포함하는지 확인하고 측정 결과를 보관하세요. |
| ③ | `ev_monitoring=mo_none`, `ev_wasteContract=wc_none` | 측정과 폐기물 처리 계약이 없으면 허가가 어려울 수 있으니 업체부터 정하세요. |
| ④ | `ev_monitoring=mo_unknown`, `ev_wasteContract=wc_unknown` | 업종과 규모에 따라 측정 의무가 정해지니 그 기준부터 확인하고 처리 방법을 정하세요. |
| ⑤ | `ev_monitoring=mo_reviewing`, `ev_wasteContract=wc_licensed` | 자동 측정이 의무인지 먼저 확인하고, 의무라면 설치 일정을 허가 일정에 맞추세요. |

### 2차 8번 — Q8

**사업장은 어떤 지역에 있고, 주변 주민의 민원이나 우려가 있나요?**

① **산업단지 안**에 있습니다. 사업장 주변 주민의 민원이나 걱정은 들은 적이 없습니다.  
② **공업 지구**에 있습니다. 주민들이 냄새나 소음을 걱정한다는 이야기를 몇 번 들었습니다.  
③ **주거 지역 가까이**에 있습니다. 이미 주민 민원이 관할 기관에 한 번 들어온 적이 있습니다.  
④ **농촌 지역**에 있습니다. 주변 주민들이 우리 사업장을 어떻게 생각하는지 아직 모릅니다.  
⑤ **입지 기준이 있는지** 모르겠습니다. 지금까지 주민 민원이나 걱정은 들어 본 적이 없습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_location=lo_ip`, `ev_neighbors=nb_none` | 산업단지 안이면 단지의 환경 기준과 공용 처리 시설을 먼저 확인하세요. |
| ② | `ev_location=lo_cluster`, `ev_neighbors=nb_concern` | 주민 우려가 있다면 배출 저감 계획을 미리 준비해 두면 절차가 부드러워집니다. |
| ③ | `ev_location=lo_residential`, `ev_neighbors=nb_complaint` | 주거지 인근 민원은 허가에 큰 영향을 줄 수 있으니 민원 내용과 조치를 먼저 정리하세요. |
| ④ | `ev_location=lo_rural`, `ev_neighbors=nb_unknown` | 농촌 지역은 물과 토양 영향이 중요하게 보일 수 있으니 배출 관리 계획을 준비하세요. |
| ⑤ | `ev_location=lo_unknown`, `ev_neighbors=nb_none` | 업종에 따라 입지 제한이 있을 수 있으니 사업장 위치가 적합한지 먼저 확인하세요. |

### 2차 9번 — Q9

**허가는 언제까지 필요하고, 실제 영업이나 판매는 언제 시작할 예정인가요?**

① **한 달 안에** 허가가 필요합니다. 영업 시작일이 이미 정해져 있어서 미루기 어렵습니다.  
② **두세 달 안에** 받으면 됩니다. 시설 공사를 모두 마친 뒤에 영업을 시작할 계획입니다.  
③ **급하지는 않습니다.** 허가가 나온 것을 직접 확인한 뒤에 영업을 시작하려고 합니다.  
④ **필요한 시점을 아직** 정하지 못했습니다. 영업이나 판매를 언제 시작할지도 정해지지 않았습니다.  
⑤ **이미 영업을 하고** 있습니다. 허가를 받지 못한 채 먼저 운영을 시작한 상태입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_timeline=tl_urgent`, `ev_openPlan=op_date` | 한 달은 환경 절차에 매우 빠듯하니 시설 자료와 서류를 바로 준비하세요. |
| ② | `ev_timeline=tl_2_3m`, `ev_openPlan=op_after_fitout` | 시설 공사가 끝나는 날을 기준으로 환경 절차 일정을 거꾸로 계산해 두세요. |
| ③ | `ev_timeline=tl_flexible`, `ev_openPlan=op_after_permit` | 시간 여유가 있으니 설계 단계에서 배출 기준을 먼저 맞추고 공사를 진행하세요. |
| ④ | `ev_timeline=tl_unsure`, `ev_openPlan=op_unsure` | 가동 시작 시점을 정해야 공사와 환경 절차 일정을 맞출 수 있습니다. |
| ⑤ | `ev_timeline=tl_already`, `ev_openPlan=op_running` | 환경 절차 없이 가동 중이라면 제재를 받을 수 있으니 바로 절차를 시작하세요. |

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
| ① | `ev_quoteStatus=quote_none`, `ev_quoteScope=qs_na` | 견적을 받기 전에 정부 비용, 서류 준비비, 대행료를 나누어 요청하세요. |
| ② | `ev_quoteStatus=quote_one`, `ev_quoteScope=qs_clear` | 항목이 나뉘어 있으니 평가 보고서 작성, 측정, 허가 신청이 각각 포함되는지 확인하세요. |
| ③ | `ev_quoteStatus=quote_several`, `ev_quoteScope=qs_mixed` | 업체마다 포함 항목이 다르므로 같은 기준표로 옮겨 적으면 비교가 쉬워집니다. |
| ④ | `ev_quoteStatus=quote_verbal`, `ev_quoteScope=qs_unknown` | 말로 들은 금액은 문서로 받아 포함 범위와 추가 비용 조건을 확인하세요. |
| ⑤ | `ev_quoteStatus=quote_ad`, `ev_quoteScope=qs_unknown` | 광고 가격은 기본 구성인 경우가 많으니 내 상황에서 더해지는 비용을 직접 물어보세요. |

### 2차 11번 — Q11

**신청하시는 분의 국적은 어디이고, 신청서는 누가 제출하게 될 예정인가요?**

① **대한민국** 국적입니다. 제가 직접 담당 기관에 서류를 제출하려고 준비하고 있습니다.  
② **중국** 국적입니다. 베트남 직원이 담당 기관에 서류를 대신 제출해 주기로 했습니다.  
③ **일본** 국적입니다. 대행사에 서류 제출을 맡기려고 어느 업체가 좋을지 알아보는 중입니다.  
④ **그 밖의 아시아 국가** 국적입니다. 누가 제출할지 아직 정하지 못해서 방법별로 비교해 보고 싶습니다.  
⑤ **그 밖의 지역** 국적입니다. 직접 제출하지만 베트남어를 몰라서 통역이 꼭 필요한 상황입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_nationality=nat_korea`, `ev_submitter=sub_self` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `ev_nationality=nat_china`, `ev_submitter=sub_staff` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `ev_nationality=nat_japan`, `ev_submitter=sub_agency` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `ev_nationality=nat_other_asia`, `ev_submitter=sub_undecided` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `ev_nationality=nat_other`, `ev_submitter=sub_self` | 국적에 따라 서류 인증 방법이 다를 수 있으니 본국 서류의 인증 절차를 먼저 확인하세요. |

### 2차 12번 — Q12

**허가를 받은 뒤 정기 보고는 누가 맡을 예정이고, 담당 직원이 있나요?**

① **환경 담당 직원**이 정기 보고를 맡습니다. 환경 관련 교육을 받은 직원이 이미 일하고 있습니다.  
② **외부 컨설팅 업체**에 맡기려고 합니다. 회사 안에는 환경 업무를 아는 직원이 없습니다.  
③ **공장장이 함께** 맡을 예정입니다. 환경 업무를 맡을 담당 직원을 새로 뽑을 계획입니다.  
④ **정기 보고가 있는지** 몰랐습니다. 환경 업무를 맡을 사람을 아직 정하지 못했습니다.  
⑤ **본사에서 원격으로** 관리하려고 합니다. 현지에는 환경 업무를 맡을 직원이 따로 없습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_reporting=rp_staff`, `ev_staff=es_trained` | 담당 직원이 있으니 보고 일정표를 만들어 놓치지 않도록 관리하세요. |
| ② | `ev_reporting=rp_consultant`, `ev_staff=es_none` | 외부에 맡기더라도 회사 안에서 자료를 모아 줄 담당자를 정해 두세요. |
| ③ | `ev_reporting=rp_manager`, `ev_staff=es_hiring` | 공장장이 함께 맡으면 보고 기한을 놓치기 쉬우니 일정 알림을 만들어 두세요. |
| ④ | `ev_reporting=rp_unknown`, `ev_staff=es_none` | 허가 뒤에도 정기 보고 의무가 있을 수 있으니 범위와 기한부터 확인하세요. |
| ⑤ | `ev_reporting=rp_hq`, `ev_staff=es_remote` | 현지 보고는 베트남어로 해야 할 수 있으니 현지 담당자를 함께 두세요. |

### 2차 13번 — Q13

**사업장이 있는 지역은 어디이고, 허가 신청을 받는 담당 기관을 알고 계신가요?**

① **하노이**에 있습니다. 신청을 받는 담당 기관의 위치와 온라인 접수 방법을 이미 알고 있습니다.  
② **호치민**에 있습니다. 어느 기관에 신청서를 내야 하는지 몰라서 그것부터 알고 싶습니다.  
③ **다낭**에 있습니다. 최근 기관이 통합되어 신청을 받는 담당 기관이 바뀌었는지 모르겠습니다.  
④ **그 밖의 도시**에 있습니다. 담당 기관은 알고 있지만 온라인 접수 방법은 아직 모르는 상태입니다.  
⑤ **산업단지 안**에 있습니다. 산업단지 관리 기관이 신청을 받는지 다른 곳이 받는지 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `ev_area=area_hanoi`, `ev_agencyKnown=ag_known` | 온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요. |
| ② | `ev_area=area_hcm`, `ev_agencyKnown=ag_unknown` | 환경 허가는 규모에 따라 지역 농업환경 담당 기관이나 중앙 부처가 받으니 규모 기준부터 확인하세요. |
| ③ | `ev_area=area_danang`, `ev_agencyKnown=ag_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `ev_area=area_other_city`, `ev_agencyKnown=ag_known` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `ev_area=area_ip`, `ev_agencyKnown=ag_unknown` | 산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `ev_mainConcern=concern_cost`, `ev_helpWanted=help_guide` | 총비용을 확인하고 서류는 직접 준비하려는 상황입니다 | 환경 절차 비용은 평가 보고서 작성, 측정, 방지시설, 대행료로 나뉩니다. 업종과 규모에 따라 허가·등록·평가 중 필요한 것이 달라지니 그 기준부터 확인하세요. |
| `ev_mainConcern=concern_docs`, `ev_helpWanted=help_guide` | 필요한 서류부터 확인해 직접 준비하려는 상황입니다 | 환경 절차는 업종과 규모에 따라 환경영향평가, 환경 허가, 환경 등록으로 나뉘며, 공장 도면, 배출량 자료, 방지시설 설명서가 기본입니다. |
| `ev_mainConcern=concern_time`, `ev_helpWanted=help_accompany` | 허가 일정이 걱정되어 제출 동행을 원하는 상황입니다 | 환경 절차는 서류 검토와 현장 확인에 시간이 걸리고, 방지시설이 갖춰져야 진행할 수 있습니다. 공사 일정과 환경 일정을 함께 맞추세요. |
| `ev_mainConcern=concern_eligibility`, `ev_helpWanted=help_full` | 허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다 | 환경 허가 대상은 업종, 생산량, 배출 종류와 사업장 위치에 따라 정해집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `ev_mainConcern=concern_quote`, `ev_helpWanted=help_accompany` | 받은 견적을 확인하고 제출은 함께 하려는 상황입니다 | 견적은 평가 보고서, 측정, 허가 신청, 대행료가 각각 포함되는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 보입니다. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (registration) | `ev_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다 |
| 2 (nominee) | `ev_owner` ∈ {own_partner} | 현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다 |
| 3 (running) | `ev_timeline` ∈ {tl_already} | 허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다 |
| 4 (facility) | `ev_facility` ∈ {env_designing, env_none, env_unknown} | 배출·방지시설이 갖춰지지 않으면 환경 절차를 진행하기 어려워 시설부터 갖춰야 합니다 |
| 5 (assessment) | `ev_assessment` ∈ {as_none, as_unknown} | 환경영향평가 대상인데 진행하지 않으면 사업이 멈출 수 있어 대상 여부부터 확인하세요 |
| 6 (waste) | `ev_wasteContract` ∈ {wc_none, wc_unknown} | 폐기물 처리 계약이 없으면 허가가 어려울 수 있어 허가받은 처리 업체부터 정하세요 |
| 7 (complaint) | `ev_neighbors` ∈ {nb_complaint} | 주민 민원이 있었다면 민원 내용과 조치 기록을 먼저 정리해야 합니다 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 가동 전에 방지시설 작동과 측정 기록을 한 번 더 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 법인설립 확인 | `ev_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다. |
| 소방 허가 확인 | `ev_stage` ∈ {st_new_project, st_expand} | 공장을 새로 짓거나 늘린다면 소방 허가 직접 인허가 받기에서 소방 준비도 함께 점검해 보실 수 있습니다. |
| 전문가 진행 | `ev_timeline` ∈ {tl_already, tl_urgent} 또는 `ev_neighbors` ∈ {nb_complaint} 또는 `ev_helpWanted` ∈ {help_full} | 이미 가동 중이거나 민원이 있다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

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
| `as_done` | 환경영향평가 완료 |
| `as_in_progress` | 환경영향평가 진행 중 |
| `as_none` | 평가·등록 안 함 |
| `as_registration` | 환경 등록 대상 |
| `as_unknown` | 평가 대상 여부를 모름 |
| `concern_cost` | 총비용 걱정 |
| `concern_docs` | 필요 서류 걱정 |
| `concern_eligibility` | 허가 대상 여부 걱정 |
| `concern_quote` | 받은 견적의 적정성 걱정 |
| `concern_time` | 허가 일정 걱정 |
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
| `es_hiring` | 담당 직원 채용 예정 |
| `es_none` | 담당 직원 없음 |
| `es_remote` | 현지 담당 직원 없음 |
| `es_trained` | 교육받은 담당 직원 있음 |
| `help_accompany` | 서류 작성과 제출 동행을 원함 |
| `help_full` | 전 과정 대행을 원함 |
| `help_guide` | 서류 작성 안내를 원함 |
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
| `mo_auto` | 자동 측정 장비 설치 |
| `mo_none` | 측정 계획 없음 |
| `mo_periodic` | 정기 측정 계약 |
| `mo_reviewing` | 자동 측정 장비 검토 중 |
| `mo_unknown` | 측정 의무를 모름 |
| `nat_china` | 중국 국적 |
| `nat_japan` | 일본 국적 |
| `nat_korea` | 대한민국 국적 |
| `nat_other` | 그 밖의 지역 국적 |
| `nat_other_asia` | 그 밖의 아시아 국적 |
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
| `qs_clear` | 정부 비용과 대행료가 구분됨 |
| `qs_mixed` | 항목이 섞여 비교 어려움 |
| `qs_na` | 비교할 견적 없음 |
| `qs_unknown` | 포함 범위를 모름 |
| `quote_ad` | 광고 가격만 봄 |
| `quote_none` | 받은 견적 없음 |
| `quote_one` | 서면 견적 1건 |
| `quote_several` | 여러 곳의 견적 |
| `quote_verbal` | 말로만 들은 금액 |
| `reg_company_done` | 법인 등록 완료 |
| `reg_household_done` | 개인사업자 등록 완료 |
| `reg_in_progress` | 사업자 등록 진행 중 |
| `reg_not_started` | 사업자 등록 전 |
| `reg_unsure` | 등록 상태를 모름 |
| `rp_consultant` | 외부 업체가 보고 |
| `rp_hq` | 본사에서 원격 관리 |
| `rp_manager` | 공장장이 보고 |
| `rp_staff` | 환경 담당 직원이 보고 |
| `rp_unknown` | 정기 보고를 모름 |
| `sc_large` | 대규모 사업장 |
| `sc_mid` | 중간 규모 사업장 |
| `sc_small` | 소규모 사업장 |
| `sc_unknown` | 규모 기준을 모름 |
| `st_check` | 현재 시설 점검 대비 |
| `st_expand` | 생산 규모 확대 |
| `st_new_project` | 새 공장·사업장 준비 |
| `st_renew` | 환경 허가 갱신 |
| `st_unsure` | 어떤 절차인지 모름 |
| `sub_agency` | 대행사가 제출 |
| `sub_self` | 직접 제출 |
| `sub_staff` | 직원이 제출 |
| `sub_undecided` | 제출 방식 미정 |
| `tl_2_3m` | 두세 달 안에 허가 |
| `tl_already` | 이미 영업 중 |
| `tl_flexible` | 급하지 않음 |
| `tl_unsure` | 필요 시점 미정 |
| `tl_urgent` | 한 달 안에 허가 필요 |
| `tn_needed` | 번역·인증 필요함 |
| `tn_none` | 번역 필요 없음 |
| `tn_unsure` | 번역 필요 여부 모름 |
| `wc_landlord` | 산업단지가 처리 |
| `wc_licensed` | 허가받은 처리 업체와 계약 |
| `wc_none` | 처리 계약 없음 |
| `wc_unknown` | 처리 방법을 모름 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 환경보호법 (제72/2020/QH14호): 환경영향평가, 환경 허가, 환경 등록 대상 구분 | 베트남 국회 | 법령(해설 자료로 확인) | https://thuvienphapluat.vn/hoi-dap-phap-luat/doi-tuong-nao-can-co-giay-phep-moi-truong-138019034.html | 대상 기준과 조문 번호는 공식 원문 대조 필요 |
| 2 | 환경보호법 시행령 (제08/2022/NĐ-CP호, 2025년 개정) | 베트남 정부 | 법령(이차 자료로 확인) | 원문 링크 확인 중 | 제05/2025/NĐ-CP호 개정이 있는 사실은 확인함(이차 자료 기준). 개정 내용은 원문 대조 필요 |
