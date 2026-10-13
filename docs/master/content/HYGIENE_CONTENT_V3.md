# 식품 위생 허가 직접 인허가 받기 콘텐츠 설계서

이 문서는 scripts/hygiene-content-spec.mjs 에서 자동 생성된다. 직접 고치지 않는다. 확인일 2026.10.12.

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
| fac_done | key: secured |
| fac_partial | key: unsecured |
| fac_building | key: unsecured |
| fac_outsourced | key: 비어 있음(추가 확인 필요) |
| fac_unknown | key: 비어 있음(추가 확인 필요) |

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

1. 전 과정 대행: `hy_timeline` ∈ {tl_urgent, tl_already} 또는 `hy_registration` ∈ {reg_not_started} 또는 `hy_situation` ∈ {sit_operating}
2. 작성과 제출 동행: `hy_submitter` ∈ {sub_undecided} 또는 `hy_agencyNeed` ∈ {an_office, an_changed, an_zone} 또는 `hy_situation` ∈ {sit_rejected} 또는 `hy_langRoute` ∈ {lr_none}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**어떤 식품을 만드시거나 다루시는지, 그리고 허가에서 가장 막막한 부분은 어디인가요?**

① **소스나 반찬 같은 가공식품을** 직접 만들려고 합니다. 시설 허가를 받으려면 서류를 뭘 준비해야 하는지 감이 안 잡힙니다.  
② **빵이나 과자를** 만들어 팔려고 합니다. 식당 허가와 같은 건지, 제과·제빵만 따로 보는 조건이 있는지 모르겠습니다.  
③ **음료나 술을 병에 담아** 팔려고 합니다. 음료와 술은 허가 내는 곳이나 받아야 하는 검사가 다르다는 말을 들어서 헷갈립니다.  
④ **포장된 식품을 들여와** 나눠 팔려고 합니다. 직접 만들지 않고 유통만 해도 위생 허가가 필요한지 사람마다 말이 다릅니다.  
⑤ **여러 매장에 음식을 보내는 중앙 주방**을 하려고 합니다. 식당 허가로 되는지 따로 받아야 하는지 아무도 확실히 말해 주지 않습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `hy_product=pt_processed`, `hy_productFocus=pf_processed_docs` | 가공식품 생산 시설의 허가 서류를 확인하려는 상황입니다 |
| ② | `hy_product=pt_bakery`, `hy_productFocus=pf_bakery_cond` | 제과·제빵 시설에 필요한 허가 조건을 확인하려는 상황입니다 |
| ③ | `hy_product=pt_beverage`, `hy_productFocus=pf_beverage_agency` | 음료·주류 생산의 허가 기관과 검사를 확인하려는 상황입니다 |
| ④ | `hy_product=pt_packaged`, `hy_productFocus=pf_packaged_need` | 포장 식품 유통에 허가가 필요한지 확인하려는 상황입니다 |
| ⑤ | `hy_product=pt_central`, `hy_productFocus=pf_central_permit` | 중앙 주방에 필요한 허가를 확인하려는 상황입니다 |

### 1차 2번 — Q2

**사업자 등록은 지금 어떤 상황이고, 누구 이름으로 식품 생산 시설 허가를 받을 생각이신가요?**

① **법인 등록은 끝났습니다.** 투자한 우리 법인 이름으로 식품 생산 시설 허가를 받으려고 합니다.  
② **개인사업자로 등록했습니다.** 제 이름으로 낸 사업자 등록증이 있어서, 그 이름으로 식품 생산 시설 허가를 받으려고 합니다.  
③ **등록 절차가 아직 진행 중입니다.** 끝나는 대로 베트남 현지 법인 이름으로 식품 생산 시설 허가를 받을 예정입니다.  
④ **등록은 아직 시작도 못 했습니다.** 어떤 이름으로 해야 할지 몰라서, 주변에서 현지인 이름으로 하라는 말도 들었습니다.  
⑤ **지금 어떤 상태인지** 저도 잘 모르겠습니다. 누구 이름으로 식품 생산 시설 허가를 받아야 하는지도 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `hy_registration=reg_company_done`, `hy_owner=own_fdi` | 외국인 투자 법인 등록을 마친 상황입니다 |
| ② | `hy_registration=reg_household_done`, `hy_owner=own_household` | 개인사업자 등록을 마친 상황입니다 |
| ③ | `hy_registration=reg_in_progress`, `hy_owner=own_local` | 현지 법인 등록이 진행 중인 상황입니다 |
| ④ | `hy_registration=reg_not_started`, `hy_owner=own_partner` | 사업자 등록 전이고 현지인 명의를 생각하는 상황입니다 |
| ⑤ | `hy_registration=reg_unsure`, `hy_owner=own_undecided` | 등록 상태와 운영 주체부터 확인해야 하는 상황입니다 |

### 1차 3번 — Q3

**작업장은 어디까지 갖추셨고, 재료가 들어와 제품이 나가는 길은 어떻게 되어 있나요?**

① **시설은 다 갖췄습니다.** 재료가 들어와서 완제품이 나갈 때까지 한 방향으로 배치되어 있습니다.  
② **일부만 갖췄습니다.** 재료가 지나는 길과 완제품이 지나는 길이 일부 겹치는데 괜찮은지 모르겠습니다.  
③ **지금 공사 중입니다.** 다른 업체와 건물을 같이 쓰는 곳이라 구역을 나눌 수 있을지 걱정됩니다.  
④ **직접 짓기보다 다른 공장에 맡기려고** 합니다. 맡길 공장의 작업 구역이 나뉘어 있는지는 제가 직접 확인하지 못했습니다.  
⑤ **뭐가 필요한지** 모르겠습니다. 작업장을 어떻게 나눠야 하는지도 들어 본 적이 없습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `hy_facility=fac_done`, `hy_flow=ln_one_way` | 위생시설과 한 방향 작업 동선을 갖춘 상황입니다 |
| ② | `hy_facility=fac_partial`, `hy_flow=ln_mixed` | 시설이 일부만 있고 동선이 겹치는 상황입니다 |
| ③ | `hy_facility=fac_building`, `hy_flow=ln_shared` | 시설 공사 중이고 공간을 함께 쓰는 상황입니다 |
| ④ | `hy_facility=fac_outsourced`, `hy_flow=ln_none` | 생산을 위탁하며 공장의 구역 구분을 확인해야 하는 상황입니다 |
| ⑤ | `hy_facility=fac_unknown`, `hy_flow=ln_unknown` | 필요한 시설과 동선 기준을 확인해야 하는 상황입니다 |

### 1차 4번 — Q4

**식품을 만질 직원은 구하셨고, 건강검진이나 위생 교육 이야기는 들어 보셨나요?**

① **직원 건강검진은 다 끝났습니다.** 위생 교육도 받아서 수료 확인서를 가지고 있습니다.  
② **일부 직원만 검진을 받았습니다.** 위생 교육은 다음 달에 다 같이 받으려고 합니다.  
③ **검진은 아직 아무도 못 받았습니다.** 위생 교육도 아직이고, 언제 받아야 하는지도 모릅니다.  
④ **아직 직원을 못 구했습니다.** 사람을 구한 뒤에 검진을 받게 하고 위생 교육도 같이 받게 할 생각입니다.  
⑤ **그런 게 필요한지** 몰랐습니다. 음식을 만지는 직원이 검진과 교육을 받아야 하는지 처음 들었습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `hy_staffHealth=sh_done`, `hy_training=ht_done` | 종사자 검진과 위생 교육을 모두 마친 상황입니다 |
| ② | `hy_staffHealth=sh_some`, `hy_training=ht_planned` | 일부만 검진했고 위생 교육을 앞둔 상황입니다 |
| ③ | `hy_staffHealth=sh_not_yet`, `hy_training=ht_none` | 종사자 검진과 위생 교육이 모두 남은 상황입니다 |
| ④ | `hy_staffHealth=sh_no_staff`, `hy_training=ht_planned` | 종사자 채용 전이라 검진과 교육이 남은 상황입니다 |
| ⑤ | `hy_staffHealth=sh_unknown`, `hy_training=ht_unknown` | 검진과 교육 필요 여부를 확인할 상황입니다 |

### 1차 5번 — Q5

**이 일을 하시면서 가장 답답하고 불안한 점은 무엇이고, 지금 어떤 상황인가요?**

① **어디서부터 시작해야 할지** 막막합니다. 검색도 해 봤는데 베트남어 자료라 어떤 말이 맞는지 모르겠습니다.  
② **일이 제대로 되고 있는지** 불안합니다. 베트남 지인이나 직원이 알아서 한다는데 어디까지 됐는지 알 수 없습니다.  
③ **사람마다 말이 달라** 혼란스럽습니다. 건물주, 업체, 지인이 각자 다르게 말해서 누구 말이 맞는지 모르겠습니다.  
④ **담당 기관에서 연락이 올까** 겁이 납니다. 생산·판매를 이미 시작했는데 허가가 아직 확인되지 않았습니다.  
⑤ **이미 한 번 막혀서** 지쳤습니다. 서류를 냈다가 보완하라고 돌려받은 적이 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `hy_feeling=fl_lost`, `hy_situation=sit_search_vn` | 어디서 시작할지 막막하고 베트남어 자료를 이해하기 어려운 상황입니다 |
| ② | `hy_feeling=fl_anxious`, `hy_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 알 수 없어 불안한 상황입니다 |
| ③ | `hy_feeling=fl_confused`, `hy_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 |
| ④ | `hy_feeling=fl_afraid`, `hy_situation=sit_operating` | 허가 확인 전에 시작해 불안한 상황입니다 |
| ⑤ | `hy_feeling=fl_tired`, `hy_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 |

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
| ① | `hy_docs=docs_all`, `hy_langRoute=lr_self` | 서류가 갖춰졌으니 도면의 구역 표시와 실제 시설이 같은지만 확인하고 접수하세요. |
| ② | `hy_docs=docs_most`, `hy_langRoute=lr_interp` | 남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요. 통역한 내용이 서류 원문과 같은지 접수 전에 한 번 더 확인하세요. |
| ③ | `hy_docs=docs_half`, `hy_langRoute=lr_local` | 준비한 서류 목록을 만든 뒤 시설 설명서와 종사자 서류가 빠졌는지부터 확인하세요. 직원 설명은 서류 원문과 대조해 확인하세요. |
| ④ | `hy_docs=docs_little`, `hy_langRoute=lr_machine` | 위생 허가 기본 서류(신청서, 등록증, 시설 설명과 도면, 종사자 검진·교육)를 먼저 받으세요. 인공지능 번역은 법률 용어와 숫자가 틀릴 수 있으니 중요한 서류는 전문가 확인을 받으세요. |
| ⑤ | `hy_docs=docs_unknown`, `hy_langRoute=lr_none` | 식품 종류에 따라 담당 기관과 서류가 달라지니 그 기준부터 확인하세요. 베트남어 서류를 읽어 줄 사람이나 전문 번역부터 정하세요. |

### 2차 7번 — Q7

**제품 검사나 인증은 어떻게 되어 있고, 포장에 붙일 베트남어 표시는 준비하셨나요?**

① **식품 안전 관리 인증은 받았습니다.** 인증서에 적힌 제품 범위에 맞춰 베트남어 표시 문구도 준비해 두었습니다.  
② **제품 검사 결과서는 있습니다.** 그 내용으로 표시 초안은 만들었는데 베트남어가 맞는지 확신이 없어 확정하지 못했습니다.  
③ **검사는 받을 예정입니다.** 결과가 나와야 표시에 뭘 넣을지 정할 수 있다고 해서 아직 손을 못 댔습니다.  
④ **검사나 인증을 받은 적이 없습니다.** 어떤 검사를 받아야 하는지 몰라서 포장에 뭘 적어야 하는지도 모릅니다.  
⑤ **어떤 검사가 필요한지** 모르겠습니다. 검사 항목이 정해져야 표시 기준도 알 수 있다는데 어디에 물어봐야 할지 막막합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `hy_quality=qc_haccp`, `hy_label=lb_ready` | 인증을 이미 받은 시설은 위생 증명서가 면제될 수 있으니 인증서 유효 기간부터 확인하세요. |
| ② | `hy_quality=qc_test`, `hy_label=lb_draft` | 검사 결과서의 날짜와 검사 항목이 제품과 맞는지 확인하고 표시 문안을 확정하세요. |
| ③ | `hy_quality=qc_planned`, `hy_label=lb_none` | 검사 결과가 나와야 표시 문안을 확정할 수 있으니 검사 일정을 먼저 잡으세요. |
| ④ | `hy_quality=qc_none`, `hy_label=lb_unknown` | 제품 종류별로 필요한 검사 항목을 먼저 확인하고 표시 기준도 함께 알아보세요. |
| ⑤ | `hy_quality=qc_unknown`, `hy_label=lb_unknown` | 필요한 검사 항목과 표시 기준을 함께 확인하면 준비 순서를 한 번에 정할 수 있습니다. |

### 2차 8번 — Q8

**생산에 쓰는 물은 어디서 받아 쓰고, 수질 검사를 받아야 한다는 이야기는 들어 보셨나요?**

① **수돗물을 그대로** 씁니다. 수돗물도 생산용으로 따로 검사를 받아야 하는지 모르겠습니다.  
② **지하수를 끌어다** 씁니다. 수질 검사 결과서가 필요한지, 어디서 검사받는지 알아보고 있습니다.  
③ **정수 설비로 걸러서** 씁니다. 정수 설비를 거친 물도 검사 결과서를 내야 하는지 궁금합니다.  
④ **쓸 물을 아직** 정하지 못했습니다. 어떤 물을 쓰면 검사 준비가 쉬운지 먼저 알고 싶습니다.  
⑤ **물을 어디서 받는지** 정확히 모릅니다. 건물주가 연결해 준 물이라 검사를 받아야 하는지, 어디서 받는지도 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `hy_water=wt_city`, `hy_waterCheck=wq_city_check` | 수돗물도 검사를 요구받을 수 있으니 담당 기관에 필요 여부를 먼저 확인하세요. |
| ② | `hy_water=wt_well`, `hy_waterCheck=wq_well_report` | 지하수는 수질 검사가 꼭 필요할 수 있으니 검사 기관부터 확인하고 검사를 받으세요. |
| ③ | `hy_water=wt_filtered`, `hy_waterCheck=wq_filter_report` | 정수 설비의 관리 기록과 수질 검사 결과를 함께 보관해 두면 현장 확인 때 도움이 됩니다. |
| ④ | `hy_water=wt_undecided`, `hy_waterCheck=wq_choose` | 물 종류에 따라 검사 항목이 달라질 수 있으니 시설 계획 단계에서 먼저 정하세요. |
| ⑤ | `hy_water=wt_source_unknown`, `hy_waterCheck=wq_unknown` | 물의 출처를 먼저 확인한 뒤 그 출처에 맞는 수질 검사를 알아보세요. |

### 2차 9번 — Q9

**허가는 언제까지 받아야 마음이 놓이고, 생산·판매는 언제쯤 시작하고 싶으신가요?**

① **한 달 안에는** 받아야 합니다. 판매 시작 날짜를 이미 정해 놓아서 허가가 늦어지면 미루기 어렵습니다.  
② **두세 달 안에** 받으면 됩니다. 공사가 끝나는 날에 맞춰 생산·판매를 시작하려고 합니다.  
③ **급하진 않습니다.** 서두르다 놓치는 게 없도록 허가가 나온 걸 확인한 뒤에 천천히 생산·판매를 시작하고 싶습니다.  
④ **언제까지인지** 모르겠습니다. 허가가 언제까지 필요한지, 생산·판매를 언제 시작할지도 아직 정하지 못했습니다.  
⑤ **이미 생산·판매를 하고 있습니다.** 허가를 못 받은 채 먼저 시작했는데 문제가 되지 않을지 불안합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `hy_timeline=tl_urgent`, `hy_openPlan=op_date` | 한 달은 시설 확인까지 빠듯하니 종사자 검진과 서류를 바로 시작하세요. |
| ② | `hy_timeline=tl_2_3m`, `hy_openPlan=op_after_fitout` | 공사가 끝나는 날을 기준으로 서류 제출 일정을 거꾸로 계산해 두세요. |
| ③ | `hy_timeline=tl_flexible`, `hy_openPlan=op_after_permit` | 시간 여유가 있으니 시설 기준을 미리 확인하고 공사를 진행하세요. |
| ④ | `hy_timeline=tl_unsure`, `hy_openPlan=op_unsure` | 생산 시작 시점을 정해야 공사와 허가 일정을 맞출 수 있습니다. |
| ⑤ | `hy_timeline=tl_already`, `hy_openPlan=op_running` | 허가 없이 생산 중이라면 제재를 받을 수 있으니 허가 신청을 바로 서두르세요. |

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
| ① | `hy_askedWho=ask_agency_kr`, `hy_answerFeel=ans_unsure_trust` | 여러 곳의 설명이 다르면 같은 질문을 글로 정리해 보내고 답을 나란히 비교하세요. |
| ② | `hy_askedWho=ask_local`, `hy_answerFeel=ans_not_understood` | 현지 업체의 설명은 문서로 받아 통역이나 전문 번역으로 한 번 더 확인하세요. |
| ③ | `hy_askedWho=ask_acquaint`, `hy_answerFeel=ans_not_fit` | 경험담은 시기와 지역, 사업 형태가 같아야 참고가 되니 조건이 같은지 먼저 대조하세요. |
| ④ | `hy_askedWho=ask_authority`, `hy_answerFeel=ans_not_clear_vn` | 기관 안내는 받은 날짜와 담당 부서, 내용을 적어 두고 통역을 거쳐 다시 확인하세요. |
| ⑤ | `hy_askedWho=ask_nobody`, `hy_answerFeel=ans_unknown_who` | 먼저 지역의 담당 기관이 어디인지 확인하고 물어볼 내용을 정리해 두세요. |

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
| ① | `hy_submitter=sub_self`, `hy_submitNeed=sn_account` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `hy_submitter=sub_staff`, `hy_submitNeed=sn_proxy` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `hy_submitter=sub_agency`, `hy_submitNeed=sn_scope` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `hy_submitter=sub_undecided`, `hy_submitNeed=sn_compare` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `hy_submitter=sub_self_lang`, `hy_submitNeed=sn_interpreter` | 직접 제출하되 베트남어가 어렵다면 제출하는 날 통역이 필요한 범위를 미리 정해 두세요. |

### 2차 12번 — Q12

**만든 식품은 어디에 팔 생각이고, 팔기 전에 따로 신고해야 한다는 이야기는 들어 보셨나요?**

① **베트남 안에서 직접** 팔 생각입니다. 팔기 전에 제품 신고를 해야 한다는 건 이미 알아봤습니다.  
② **마트나 유통사에** 넣으려고 합니다. 유통사가 따로 요구하는 서류가 있다는데 그게 뭔지 모릅니다.  
③ **해외로 수출**하려고 합니다. 수출할 나라가 요구하는 위생 기준을 아직 확인하지 못했습니다.  
④ **온라인으로** 팔려고 합니다. 인터넷으로 팔기 시작하기 전에 따로 신고해야 하는지 모르겠습니다.  
⑤ **어디에 팔지** 아직 못 정했습니다. 판매 전 제품 신고라는 말도 이번에 처음 들었습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `hy_market=mk_domestic`, `hy_declare=dc_known` | 제품 신고가 필요한 품목이면 위생 허가와 함께 신고 서류도 준비하세요. |
| ② | `hy_market=mk_retail`, `hy_declare=dc_partner` | 유통사는 위생 증명서와 검사 결과서를 요구하는 경우가 많으니 미리 받아 두세요. |
| ③ | `hy_market=mk_export`, `hy_declare=dc_unknown` | 수출국이 요구하는 위생 증명이 따로 있을 수 있으니 수입국 기준부터 확인하세요. |
| ④ | `hy_market=mk_online`, `hy_declare=dc_unknown` | 온라인 판매도 제품 정보와 표시 기준을 지켜야 하니 판매 전 신고 여부를 확인하세요. |
| ⑤ | `hy_market=mk_unsure`, `hy_declare=dc_unknown` | 판매처가 정해지면 필요한 신고와 서류가 정해지니 판매 계획부터 세우세요. |

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
| ① | `hy_area=area_hanoi`, `hy_agencyNeed=an_online` | 온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요. |
| ② | `hy_area=area_hcm`, `hy_agencyNeed=an_office` | 식품 종류에 따라 보건·농업·산업무역 담당 기관 중 어디로 내는지가 달라지니 그것부터 확인하세요. |
| ③ | `hy_area=area_danang`, `hy_agencyNeed=an_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `hy_area=area_other_city`, `hy_agencyNeed=an_visit` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `hy_area=area_ip`, `hy_agencyNeed=an_zone` | 산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `hy_feeling=fl_lost`, `hy_situation=sit_search_vn` | 어디서부터 시작해야 할지 몰라 막막한 상황입니다 | 식품 생산 시설은 위생 조건을 갖춘 시설임을 확인받는 증명서가 기본이고, 신청서, 등록증, 시설 설명과 도면, 종사자 검진·교육 서류가 필요합니다. 식품 종류에 따라 담당 기관이 다릅니다. |
| `hy_feeling=fl_anxious`, `hy_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 몰라 불안한 상황입니다 | 서류가 갖춰진 뒤 현장 확인을 거쳐 증명서가 나오며, 시설 공사가 끝나야 확인을 받을 수 있습니다. 공사 일정과 허가 일정을 함께 맞추세요. |
| `hy_feeling=fl_confused`, `hy_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 | 위생 허가는 식품 종류와 시설 규모, 이미 받은 인증에 따라 대상과 절차가 달라집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `hy_feeling=fl_afraid`, `hy_situation=sit_operating` | 허가 확인 전에 시작해 불안한 상황입니다 | 식품 위생 허가 과정에서는 담당 기관이 베트남어로 질문하고 보완을 요구할 수 있어, 내용을 이해하지 못한 채 답하면 처리가 길어질 수 있습니다. 접수 전에 통역과 전문가가 서류를 함께 점검하면 보완 요구를 줄일 수 있습니다. |
| `hy_feeling=fl_tired`, `hy_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 | 식품 위생 허가 서류는 이름·번호·숫자가 서로 다르거나 빠진 서류가 있으면 접수가 보류되거나 보완 요구를 받을 수 있습니다. 접수 전에 전문가가 서류를 점검하고 제출하는 날 동행하면 되돌아오는 횟수를 줄일 수 있습니다. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (registration) | `hy_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다 |
| 2 (nominee) | `hy_owner` ∈ {own_partner} | 현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다 |
| 3 (running) | `hy_timeline` ∈ {tl_already} | 허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다 |
| 4 (language) | `hy_langRoute` ∈ {lr_local, lr_machine, lr_none} | 베트남어 서류를 정확히 이해하지 못한 채 진행하면 불리한 조건을 놓칠 수 있어 전문 통역이나 번역 확인이 필요합니다 |
| 5 (answer) | `hy_answerFeel` ∈ {ans_not_understood, ans_not_clear_vn} | 받은 안내를 정확히 이해하지 못한 채 진행하면 필요한 절차를 놓칠 수 있어 안내 내용을 문서로 다시 확인해야 합니다 |
| 6 (facility) | `hy_facility` ∈ {fac_partial, fac_building, fac_unknown} | 위생시설이 갖춰지지 않으면 현장 확인에서 보완 요구를 받을 수 있어 시설부터 마쳐야 합니다 |
| 7 (flow) | `hy_flow` ∈ {ln_mixed, ln_shared, ln_none} | 원료와 완제품 동선이 겹치면 위생 기준에 맞지 않을 수 있어 배치를 먼저 확인하세요 |
| 8 (staff) | `hy_staffHealth` ∈ {sh_not_yet, sh_unknown} | 종사자의 건강검진과 위생 교육이 끝나야 신청할 수 있어 일정부터 잡아야 합니다 |
| 9 (water) | `hy_water` ∈ {wt_well} | 지하수를 쓰면 수질 검사가 필요할 수 있어 검사부터 받아야 합니다 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 신청 전에 시설과 종사자 서류의 날짜를 한 번 더 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 법인설립 확인 | `hy_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다. |
| 전문가 진행 | `hy_timeline` ∈ {tl_already, tl_urgent} 또는 `hy_situation` ∈ {sit_operating} | 이미 생산 중이거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

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
| `dc_known` | undefined |
| `dc_partner` | undefined |
| `dc_unknown` | undefined |
| `docs_all` | 기본 서류 모두 준비 |
| `docs_half` | 기본 서류 절반 준비 |
| `docs_little` | 기본 서류 거의 미준비 |
| `docs_most` | 기본 서류 대부분 준비 |
| `docs_unknown` | 필요 서류를 모름 |
| `fac_building` | 시설 공사 중 |
| `fac_done` | 위생시설 구비 완료 |
| `fac_outsourced` | 다른 공장에 생산 위탁 |
| `fac_partial` | 일부 시설만 구비 |
| `fac_unknown` | 필요한 시설을 모름 |
| `fl_afraid` | 담당 기관 연락이 겁남 |
| `fl_anxious` | 진행 상황을 몰라 불안함 |
| `fl_confused` | 사람마다 말이 달라 혼란스러움 |
| `fl_lost` | 어디서 시작할지 막막함 |
| `fl_tired` | 한 번 막혀서 지침 |
| `ht_done` | 위생 교육 수료 |
| `ht_none` | 위생 교육 안 함 |
| `ht_planned` | 위생 교육 예정 |
| `ht_unknown` | 교육 필요 여부를 모름 |
| `lb_draft` | 표시 초안만 있음 |
| `lb_none` | 표시 준비 전 |
| `lb_ready` | 베트남어 표시 준비 |
| `lb_unknown` | 표시 기준을 모름 |
| `ln_mixed` | 동선이 일부 겹침 |
| `ln_none` | 위탁 공장의 구역 구분 미확인 |
| `ln_one_way` | 원료부터 완제품까지 한 방향 동선 |
| `ln_shared` | 공사 중 공간을 함께 사용 |
| `ln_unknown` | 동선 기준을 모름 |
| `lr_interp` | 통역사·베트남어 하는 지인이 통역 |
| `lr_local` | 한국어 하는 베트남 직원이 설명 |
| `lr_machine` | 인공지능 번역기로 대략 이해 |
| `lr_none` | 베트남어를 몰라 내용을 알 수 없음 |
| `lr_self` | 베트남어를 직접 읽음 |
| `mk_domestic` | undefined |
| `mk_export` | undefined |
| `mk_online` | undefined |
| `mk_retail` | undefined |
| `mk_unsure` | undefined |
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
| `pf_bakery_cond` | 제과·제빵 허가 조건 확인 |
| `pf_beverage_agency` | 음료·주류 담당 기관 확인 |
| `pf_central_permit` | 중앙 주방 필요 허가 확인 |
| `pf_packaged_need` | 유통만 해도 허가가 필요한지 확인 |
| `pf_processed_docs` | 가공식품 허가 서류 확인 |
| `pt_bakery` | 제과·제빵 생산 |
| `pt_beverage` | 음료·주류 생산 |
| `pt_central` | 센트럴 키친 |
| `pt_packaged` | 포장 식품 유통 |
| `pt_processed` | 가공식품 제조 |
| `qc_haccp` | 식품 안전 관리 인증 보유 |
| `qc_none` | 검사·인증 없음 |
| `qc_planned` | 검사 예정 |
| `qc_test` | 제품 검사 결과서 보유 |
| `qc_unknown` | 필요한 검사를 모름 |
| `reg_company_done` | 법인 등록 완료 |
| `reg_household_done` | 개인사업자 등록 완료 |
| `reg_in_progress` | 사업자 등록 진행 중 |
| `reg_not_started` | 사업자 등록 전 |
| `reg_unsure` | 등록 상태를 모름 |
| `sh_done` | 종사자 건강검진 완료 |
| `sh_no_staff` | 아직 종사자 없음 |
| `sh_not_yet` | 종사자 검진 전 |
| `sh_some` | 일부 종사자만 검진 |
| `sh_unknown` | 검진 필요 여부를 모름 |
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
| `wq_choose` | 검사에 맞는 물 선택 확인 |
| `wq_city_check` | 수돗물 검사 필요 여부 확인 |
| `wq_filter_report` | 정수 설비 검사 확인 |
| `wq_unknown` | 검사 필요 여부와 기관 확인 |
| `wq_well_report` | 지하수 검사 결과서 확인 |
| `wt_city` | 수돗물 사용 |
| `wt_filtered` | 정수 설비 사용 |
| `wt_source_unknown` | 생산용 물 출처를 모름 |
| `wt_undecided` | 사용할 물 미정 |
| `wt_well` | 지하수 사용 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 식품안전법 시행령 (제15/2018/NĐ-CP호): 식품 위생 조건 확인 증명서 대상과 예외(식품 안전 관리 인증을 받은 시설 등) | 베트남 정부 | 보도 기준 | https://thuvienphapluat.vn/hoi-dap-phap-luat/10-truong-hop-khong-can-cap-giay-chung-nhan-an-toan-thuc-pham-269611.html | 시행령 제46/2026/NĐ-CP호는 결의 제15/2026/NQ-CP호(2026.4.6)로 시행이 정지되어 15/2018이 계속 적용됨. 제12조 제1항 예외는 확인함. 조문 번호와 담당 기관 구분은 공식 원문 대조 필요 |
| 2 | 식품안전법 (제55/2010/QH12호) | 베트남 국회 | 보도 기준 | 원문 링크 확인 중 | 조문 번호는 공식 원문 대조 필요 |
