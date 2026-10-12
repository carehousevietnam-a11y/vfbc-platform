# 식당 허가 직접 인허가 받기 콘텐츠 설계서

이 문서는 scripts/restaurant-content-spec.mjs 에서 자동 생성된다. 직접 고치지 않는다. 확인일 2026.10.12.

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
| prem_signed | key: secured |
| prem_owned | key: secured |
| prem_provisional | key: 비어 있음(추가 확인 필요) |
| prem_candidate | key: unsecured |
| prem_undecided | key: unsecured |

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

1. 전 과정 대행: `rs_helpWanted` ∈ {help_full} 또는 `rs_timeline` ∈ {tl_urgent, tl_already} 또는 `rs_registration` ∈ {reg_not_started}
2. 작성과 제출 동행: `rs_helpWanted` ∈ {help_accompany} 또는 `rs_submitter` ∈ {sub_undecided} 또는 `rs_agencyKnown` ∈ {ag_unknown, ag_changed}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**식당과 관련해 어떤 허가가 필요하고, 매장은 어떤 형태로 운영하실 예정인가요?**

① **새로 매장을 열려고** 준비하고 있습니다. 손님이 앉아서 식사하는 일반 식당으로 운영하려고 합니다.  
② **운영 중인 매장의 허가를** 다시 받아야 합니다. 음료와 간단한 디저트를 파는 카페로 운영하고 있습니다.  
③ **다른 사람의 매장을 인수**했습니다. 술을 주로 파는 술집이나 바 형태로 운영하려고 합니다.  
④ **주류 판매를 추가**하려고 합니다. 호텔 안에 있는 식당으로 투숙객과 외부 손님을 함께 받습니다.  
⑤ **어떤 허가가 필요한지** 모르겠습니다. 매장 없이 배달만 하는 주방으로 운영하려고 합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `rs_stage=st_new`, `rs_venue=vn_restaurant` | 새로 일반 식당을 열려고 준비하는 상황입니다 |
| ② | `rs_stage=st_renew`, `rs_venue=vn_cafe` | 운영 중인 카페의 허가를 다시 받는 상황입니다 |
| ③ | `rs_stage=st_takeover`, `rs_venue=vn_bar` | 매장을 인수해 술집 형태로 운영하려는 상황입니다 |
| ④ | `rs_stage=st_add_alcohol`, `rs_venue=vn_hotel` | 호텔 안 식당에 주류 판매를 더하려는 상황입니다 |
| ⑤ | `rs_stage=st_unsure`, `rs_venue=vn_delivery` | 배달 전문 주방에 필요한 허가부터 확인할 상황입니다 |

### 1차 2번 — Q2

**사업자 등록은 어디까지 진행되었고, 누구 이름으로 허가를 받으실 예정인가요?**

① **법인 등록을 이미** 마쳤습니다. 외국인이 투자한 법인 이름으로 허가를 받으려고 합니다.  
② **개인사업자 등록을** 마쳤습니다. 규모가 작아서 개인사업자로 허가를 받으려고 합니다.  
③ **사업자 등록을 진행하고** 있습니다. 베트남 현지 법인 이름으로 허가를 받을 예정입니다.  
④ **사업자 등록을 아직** 시작하지 않았습니다. 베트남 사람 이름으로 등록해서 운영하려고 생각하고 있습니다.  
⑤ **등록 상태를 정확히** 모르겠습니다. 누구 이름으로 허가를 받아야 하는지도 아직 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `rs_registration=reg_company_done`, `rs_owner=own_fdi` | 외국인 투자 법인 등록을 마친 상황입니다 |
| ② | `rs_registration=reg_household_done`, `rs_owner=own_household` | 개인사업자 등록을 마친 상황입니다 |
| ③ | `rs_registration=reg_in_progress`, `rs_owner=own_local` | 현지 법인 등록이 진행 중인 상황입니다 |
| ④ | `rs_registration=reg_not_started`, `rs_owner=own_partner` | 사업자 등록 전이고 현지인 명의를 생각하는 상황입니다 |
| ⑤ | `rs_registration=reg_unsure`, `rs_owner=own_undecided` | 등록 상태와 운영 주체부터 확인해야 하는 상황입니다 |

### 1차 3번 — Q3

**영업할 매장은 확보되었고, 매장의 규모는 어느 정도인가요?**

① **매장 임대 계약을 마쳤습니다.** 손님 좌석이 50석 이하인 작은 규모의 매장으로 운영합니다.  
② **본인이나 회사 소유의 건물**입니다. 좌석이 50석에서 100석 정도 되는 중간 규모입니다.  
③ **가계약만 해 둔 상태**입니다. 손님 좌석이 100석을 넘는 큰 규모의 매장으로 운영합니다.  
④ **후보 매장만** 알아보고 있습니다. 2층 이상으로 된 넓은 매장을 생각하고 있습니다.  
⑤ **매장을 아직** 정하지 못했습니다. 매장의 좌석 수와 규모도 아직 정해지지 않았습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `rs_premises=prem_signed`, `rs_size=sz_small` | 매장 계약을 마친 50석 이하 매장인 상황입니다 |
| ② | `rs_premises=prem_owned`, `rs_size=sz_mid` | 소유 건물에서 중간 규모로 운영하는 상황입니다 |
| ③ | `rs_premises=prem_provisional`, `rs_size=sz_large` | 대형 매장을 가계약한 상황입니다 |
| ④ | `rs_premises=prem_candidate`, `rs_size=sz_multi` | 2층 이상 후보 매장만 있는 상황입니다 |
| ⑤ | `rs_premises=prem_undecided`, `rs_size=sz_unknown` | 매장과 규모부터 정해야 하는 상황입니다 |

### 1차 4번 — Q4

**위생·소방 시설은 어디까지 준비되었고, 주방은 구역이 나뉘어 있나요?**

① **위생·소방 시설 준비를** 마쳤습니다. 조리, 세척, 식재료 보관 구역이 서로 나뉘어 있습니다.  
② **시설 공사를 하고** 있습니다. 주방의 일부 구역만 나누어 두었고 나머지는 공사 중입니다.  
③ **시설 준비를 아직** 시작하지 않았습니다. 주방이 하나로 트여 있어서 구역 구분이 없습니다.  
④ **건물주가 소방을** 맡는다고 들었습니다. 같은 건물의 다른 매장과 주방을 함께 쓰고 있습니다.  
⑤ **어떤 시설이 필요한지** 모르겠습니다. 주방을 어떤 기준으로 나누어야 하는지도 잘 모릅니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `rs_hygieneFire=hf_ready`, `rs_kitchen=kt_separated` | 위생·소방 시설과 주방 구역을 갖춘 상황입니다 |
| ② | `rs_hygieneFire=hf_building`, `rs_kitchen=kt_partial` | 시설 공사 중이고 주방 구역이 일부만 나뉜 상황입니다 |
| ③ | `rs_hygieneFire=hf_not_yet`, `rs_kitchen=kt_open` | 시설 준비 전이고 주방 구역 구분이 없는 상황입니다 |
| ④ | `rs_hygieneFire=hf_landlord`, `rs_kitchen=kt_shared` | 소방은 건물주 담당이고 주방을 함께 쓰는 상황입니다 |
| ⑤ | `rs_hygieneFire=hf_unknown`, `rs_kitchen=kt_unknown` | 필요한 시설과 주방 기준을 확인해야 하는 상황입니다 |

### 1차 5번 — Q5

**지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?**

① **총비용이 얼마인지** 걱정됩니다. 필요한 서류는 제가 만들 수 있도록 안내만 받고 싶습니다.  
② **필요한 서류가 무엇인지** 모르겠습니다. 서류 작성 방법을 하나씩 알려 주면 직접 준비하겠습니다.  
③ **허가가 언제 나올지** 걱정됩니다. 제출하는 날 담당 기관에 통역과 함께 가고 싶습니다.  
④ **우리 매장이 허가 대상인지** 모르겠습니다. 서류 준비부터 제출과 수령까지 모두 맡기고 싶습니다.  
⑤ **받은 견적이 적정한지** 모르겠습니다. 서류는 제가 준비하고 제출할 때만 함께 가고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `rs_mainConcern=concern_cost`, `rs_helpWanted=help_guide` | 총비용을 알고 직접 서류를 준비하려는 상황입니다 |
| ② | `rs_mainConcern=concern_docs`, `rs_helpWanted=help_guide` | 필요한 서류부터 알고 싶은 상황입니다 |
| ③ | `rs_mainConcern=concern_time`, `rs_helpWanted=help_accompany` | 허가 일정이 걱정되어 제출 동행을 원하는 상황입니다 |
| ④ | `rs_mainConcern=concern_eligibility`, `rs_helpWanted=help_full` | 허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다 |
| ⑤ | `rs_mainConcern=concern_quote`, `rs_helpWanted=help_accompany` | 받은 견적이 적정한지 확인하려는 상황입니다 |

### 2차 6번 — Q6

**허가 신청 서류는 어디까지 준비되었고, 번역이나 인증이 필요한 서류가 있나요?**

① **신청서, 사업자 등록증, 임대차 계약서, 시설 도면을 모두** 준비했습니다. 모든 서류의 베트남어 번역도 이미 끝냈습니다.  
② **대부분 준비**했고 몇 가지만 남았습니다. 해외에서 받은 서류는 번역과 영사 인증이 필요합니다.  
③ **절반쯤 준비**했습니다. 베트남어 번역이 필요한 서류가 있는지 몰라서 확인이 필요합니다.  
④ **거의 준비하지 못했습니다.** 번역과 인증을 어디서 어떻게 하는지도 함께 알고 싶습니다.  
⑤ **무엇이 필요한지 아직 모릅니다.** 준비한 서류가 없어서 번역할 서류도 아직 없는 상태입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `rs_docs=docs_all`, `rs_translation=tn_none` | 서류가 갖춰졌으니 도면의 구역 표시와 실제 매장이 같은지만 확인하고 접수하세요. |
| ② | `rs_docs=docs_most`, `rs_translation=tn_needed` | 남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요. |
| ③ | `rs_docs=docs_half`, `rs_translation=tn_unsure` | 준비한 서류 목록을 만든 뒤 시설 도면과 직원 서류가 빠졌는지부터 확인하세요. |
| ④ | `rs_docs=docs_little`, `rs_translation=tn_needed` | 식당 위생 허가에 필요한 기본 서류(신청서, 등록증, 시설 설명, 직원 검진·교육)를 먼저 받으세요. |
| ⑤ | `rs_docs=docs_unknown`, `rs_translation=tn_none` | 매장 규모와 판매 품목에 따라 서류가 달라지니 그 기준부터 확인하세요. |

### 2차 7번 — Q7

**주방 직원의 건강검진은 마쳤고, 식품 위생 교육은 받았나요?**

① **직원 모두 건강검진을** 마쳤습니다. 식품 위생 교육도 받아서 수료 확인서를 가지고 있습니다.  
② **일부 직원만 건강검진을** 받았습니다. 식품 위생 교육은 다음 달에 받을 예정입니다.  
③ **직원 건강검진을 아직** 받지 않았습니다. 식품 위생 교육도 아직 받지 않은 상태입니다.  
④ **아직 직원을 뽑지** 않았습니다. 직원을 뽑은 뒤에 위생 교육을 받게 할 생각입니다.  
⑤ **건강검진이 필요한지** 모르겠습니다. 위생 교육을 받아야 하는지도 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `rs_staffHealth=sh_done`, `rs_foodTraining=ft_done` | 검진 결과서와 교육 확인서의 날짜가 유효한지만 확인해 함께 제출하세요. |
| ② | `rs_staffHealth=sh_some`, `rs_foodTraining=ft_planned` | 남은 직원 검진과 위생 교육 날짜를 정해 신청 전에 모두 마치도록 일정을 잡으세요. |
| ③ | `rs_staffHealth=sh_not_yet`, `rs_foodTraining=ft_none` | 주방 직원은 건강검진과 위생 교육이 필요하니 가장 먼저 일정을 잡으세요. |
| ④ | `rs_staffHealth=sh_no_staff`, `rs_foodTraining=ft_planned` | 채용 직후 검진과 교육을 받도록 채용 일정과 허가 일정을 함께 맞추세요. |
| ⑤ | `rs_staffHealth=sh_unknown`, `rs_foodTraining=ft_unknown` | 음식을 다루는 직원은 검진과 교육 대상이 되는 경우가 많으니 필요한 범위를 먼저 확인하세요. |

### 2차 8번 — Q8

**매장에서 술을 판매하실 예정이고, 영업 시간은 주로 언제인가요?**

① **술은 판매하지** 않습니다. 점심과 낮 시간 위주로 영업하고 저녁 늦게는 문을 닫습니다.  
② **맥주나 와인을 매장에서** 판매하려고 합니다. 저녁부터 밤늦게까지 영업할 예정입니다.  
③ **도수가 높은 술까지** 판매하려고 합니다. 24시간 문을 열고 영업하는 것을 생각하고 있습니다.  
④ **술을 포장해서 파는 것**도 생각하고 있습니다. 낮 시간 위주로 영업하지만 주말에는 늦게까지 엽니다.  
⑤ **술을 팔지 아직** 정하지 못했습니다. 매장의 영업 시간도 아직 정해지지 않은 상태입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `rs_alcohol=al_none`, `rs_hours=hr_day` | 주류를 팔지 않으면 주류 판매 등록은 필요하지 않으니 위생·소방에 집중하세요. |
| ② | `rs_alcohol=al_beer`, `rs_hours=hr_night` | 매장에서 술을 팔면 주류 판매 관련 등록이 필요할 수 있으니 위생 허가와 함께 준비하세요. |
| ③ | `rs_alcohol=al_spirits`, `rs_hours=hr_24h` | 도수가 높은 술과 심야 영업은 조건이 더 까다로울 수 있으니 먼저 가능 여부를 확인하세요. |
| ④ | `rs_alcohol=al_takeaway`, `rs_hours=hr_day` | 포장 판매는 매장 내 판매와 다른 등록이 필요할 수 있으니 판매 방식을 먼저 정하세요. |
| ⑤ | `rs_alcohol=al_unsure`, `rs_hours=hr_unsure` | 주류 판매 여부에 따라 필요한 등록이 달라지니 메뉴 구성을 먼저 정하세요. |

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
| ① | `rs_timeline=tl_urgent`, `rs_openPlan=op_date` | 한 달은 시설 점검까지 빠듯하니 서류와 직원 검진을 바로 시작하세요. |
| ② | `rs_timeline=tl_2_3m`, `rs_openPlan=op_after_fitout` | 공사가 끝나는 날을 기준으로 서류 제출 일정을 거꾸로 계산해 두세요. |
| ③ | `rs_timeline=tl_flexible`, `rs_openPlan=op_after_permit` | 시간 여유가 있으니 시설 기준을 미리 확인하고 공사를 진행하세요. |
| ④ | `rs_timeline=tl_unsure`, `rs_openPlan=op_unsure` | 오픈 날짜를 정해야 공사와 허가 일정을 맞출 수 있습니다. |
| ⑤ | `rs_timeline=tl_already`, `rs_openPlan=op_running` | 허가 없이 영업 중이라면 제재를 받을 수 있으니 허가 신청을 바로 서두르세요. |

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
| ① | `rs_quoteStatus=quote_none`, `rs_quoteScope=qs_na` | 견적을 받기 전에 정부 비용, 서류 준비비, 대행료를 나누어 요청하세요. |
| ② | `rs_quoteStatus=quote_one`, `rs_quoteScope=qs_clear` | 항목이 나뉘어 있으니 위생 허가, 소방, 주류 판매 등록이 각각 포함되는지 확인하세요. |
| ③ | `rs_quoteStatus=quote_several`, `rs_quoteScope=qs_mixed` | 업체마다 포함 항목이 다르므로 같은 기준표로 옮겨 적으면 비교가 쉬워집니다. |
| ④ | `rs_quoteStatus=quote_verbal`, `rs_quoteScope=qs_unknown` | 말로 들은 금액은 문서로 받아 포함 범위와 추가 비용 조건을 확인하세요. |
| ⑤ | `rs_quoteStatus=quote_ad`, `rs_quoteScope=qs_unknown` | 광고 가격은 기본 구성인 경우가 많으니 내 상황에서 더해지는 비용을 직접 물어보세요. |

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
| ① | `rs_nationality=nat_korea`, `rs_submitter=sub_self` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `rs_nationality=nat_china`, `rs_submitter=sub_staff` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `rs_nationality=nat_japan`, `rs_submitter=sub_agency` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `rs_nationality=nat_other_asia`, `rs_submitter=sub_undecided` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `rs_nationality=nat_other`, `rs_submitter=sub_self` | 국적에 따라 서류 인증 방법이 다를 수 있으니 본국 서류의 인증 절차를 먼저 확인하세요. |

### 2차 12번 — Q12

**식재료는 어디서 들여오고, 음식물 쓰레기와 폐유는 어떻게 처리하실 예정인가요?**

① **식재료 납품 계약**을 맺은 곳이 있습니다. 쓰레기와 폐유를 처리하는 업체와도 계약을 맺었습니다.  
② **시장에서 직접** 사 오려고 합니다. 건물에서 쓰레기를 함께 처리해 주는 것으로 알고 있습니다.  
③ **수입 식재료를** 많이 쓸 예정입니다. 쓰레기와 폐유 처리 계약은 아직 맺지 않았습니다.  
④ **여러 곳에서 나누어** 사 오려고 합니다. 음식물 쓰레기를 어떻게 처리해야 하는지 모르겠습니다.  
⑤ **식재료 증빙이 필요한지** 모르겠습니다. 쓰레기 처리 계약도 아직 생각해 보지 않았습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `rs_ingredients=ing_contract`, `rs_waste=ws_contract` | 납품 계약서와 처리 계약서를 함께 보관해 두면 점검 때 바로 보여 줄 수 있습니다. |
| ② | `rs_ingredients=ing_market`, `rs_waste=ws_building` | 직접 구매하면 구입 영수증을 모아 두고, 건물 처리 방식이 매장 폐유도 포함하는지 확인하세요. |
| ③ | `rs_ingredients=ing_import`, `rs_waste=ws_none` | 수입 식재료는 수입 통관과 표시 서류를 받아 두고, 폐유 처리 업체도 미리 정하세요. |
| ④ | `rs_ingredients=ing_mixed`, `rs_waste=ws_unknown` | 구매처마다 영수증이나 계약서를 모아 두고, 지역의 쓰레기 처리 방법을 확인하세요. |
| ⑤ | `rs_ingredients=ing_unknown`, `rs_waste=ws_none` | 식재료 출처를 보여 줄 서류가 요구될 수 있으니 구매 방식부터 정하세요. |

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
| ① | `rs_area=area_hanoi`, `rs_agencyKnown=ag_known` | 온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요. |
| ② | `rs_area=area_hcm`, `rs_agencyKnown=ag_unknown` | 식당 위생 허가는 지역의 보건·식품 안전 담당 기관이 받는 경우가 많으니 그곳부터 확인하세요. |
| ③ | `rs_area=area_danang`, `rs_agencyKnown=ag_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `rs_area=area_other_city`, `rs_agencyKnown=ag_known` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `rs_area=area_ip`, `rs_agencyKnown=ag_unknown` | 산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `rs_mainConcern=concern_cost`, `rs_helpWanted=help_guide` | 총비용을 확인하고 서류는 직접 준비하려는 상황입니다 | 식당 허가 비용은 정부 비용 외에 시설 공사, 직원 검진과 교육, 대행료로 나뉩니다. 서류 목록을 받아 시간이 걸리는 직원 검진부터 시작하세요. |
| `rs_mainConcern=concern_docs`, `rs_helpWanted=help_guide` | 필요한 서류부터 확인해 직접 준비하려는 상황입니다 | 식당은 식품 위생 조건을 갖춘 시설임을 확인받는 증명서가 기본이고, 신청서, 사업자 등록증, 시설 설명, 직원 검진·교육 서류가 필요합니다. 호텔 안 식당 등 일부는 예외가 있습니다. |
| `rs_mainConcern=concern_time`, `rs_helpWanted=help_accompany` | 허가 일정이 걱정되어 제출 동행을 원하는 상황입니다 | 서류가 갖춰진 뒤 현장 확인을 거쳐 허가가 나오며, 시설 공사가 끝나야 확인을 받을 수 있습니다. 공사 일정과 허가 일정을 함께 맞추세요. |
| `rs_mainConcern=concern_eligibility`, `rs_helpWanted=help_full` | 허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다 | 식당은 매장 형태와 규모, 주류 판매 여부에 따라 필요한 허가가 달라집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `rs_mainConcern=concern_quote`, `rs_helpWanted=help_accompany` | 받은 견적을 확인하고 제출은 함께 하려는 상황입니다 | 견적은 위생 허가, 소방, 주류 판매 등록, 대행료가 각각 포함되는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 보입니다. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (registration) | `rs_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다 |
| 2 (nominee) | `rs_owner` ∈ {own_partner} | 현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다 |
| 3 (running) | `rs_timeline` ∈ {tl_already} | 허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다 |
| 4 (premises) | `rs_premises` ∈ {prem_candidate, prem_undecided} | 매장이 확보되지 않으면 시설 확인을 받을 수 없어 매장 계약부터 마쳐야 합니다 |
| 5 (facility) | `rs_hygieneFire` ∈ {hf_not_yet, hf_unknown} | 위생·소방 시설이 준비되지 않으면 현장 확인에서 보완 요구를 받을 수 있습니다 |
| 6 (kitchen) | `rs_kitchen` ∈ {kt_open, kt_shared} | 주방 구역이 나뉘지 않았거나 공유하면 위생 기준에 맞지 않을 수 있어 배치를 먼저 확인하세요 |
| 7 (staff) | `rs_staffHealth` ∈ {sh_not_yet, sh_unknown} | 주방 직원의 건강검진과 위생 교육이 끝나야 신청할 수 있어 일정부터 잡아야 합니다 |
| 8 (alcohol) | `rs_alcohol` ∈ {al_spirits, al_takeaway} | 주류 판매 방식에 따라 별도 등록이 필요할 수 있어 판매 방식을 먼저 정해야 합니다 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 신청 전에 시설과 직원 서류의 날짜를 한 번 더 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 법인설립 확인 | `rs_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다. |
| 전문가 진행 | `rs_timeline` ∈ {tl_already, tl_urgent} 또는 `rs_helpWanted` ∈ {help_full} | 이미 영업 중이거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

## 8. 값 → 고객 표시 문구

| 내부 값 | 고객 화면 표시 |
|---|---|
| `ag_changed` | 기관 통합으로 담당이 불확실함 |
| `ag_known` | 담당 기관을 알고 있음 |
| `ag_unknown` | 담당 기관을 모름 |
| `al_beer` | 맥주·와인을 매장에서 판매 |
| `al_none` | 주류 판매 안 함 |
| `al_spirits` | 도수 높은 술까지 판매 |
| `al_takeaway` | 주류 포장 판매 |
| `al_unsure` | 주류 판매 여부 미정 |
| `area_danang` | 다낭 |
| `area_hanoi` | 하노이 |
| `area_hcm` | 호치민 |
| `area_ip` | 산업단지 |
| `area_other_city` | 그 밖의 도시 |
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
| `ft_done` | 위생 교육 수료 |
| `ft_none` | 위생 교육 안 함 |
| `ft_planned` | 위생 교육 예정 |
| `ft_unknown` | 교육 필요 여부를 모름 |
| `help_accompany` | 서류 작성과 제출 동행을 원함 |
| `help_full` | 전 과정 대행을 원함 |
| `help_guide` | 서류 작성 안내를 원함 |
| `hf_building` | 시설 공사 중 |
| `hf_landlord` | 건물주가 소방 담당 |
| `hf_not_yet` | 시설 준비 전 |
| `hf_ready` | 위생·소방 시설 준비 완료 |
| `hf_unknown` | 필요한 시설을 모름 |
| `hr_24h` | 24시간 영업 |
| `hr_day` | 낮 영업 위주 |
| `hr_night` | 밤늦게까지 영업 |
| `hr_unsure` | 영업 시간 미정 |
| `ing_contract` | 식재료 납품 계약 있음 |
| `ing_import` | 수입 식재료 사용 |
| `ing_market` | 시장에서 직접 구매 |
| `ing_mixed` | 여러 곳에서 구매 |
| `ing_unknown` | 식재료 증빙을 모름 |
| `kt_open` | 주방 구역 구분 없음 |
| `kt_partial` | 일부 구역만 분리 |
| `kt_separated` | 조리·세척·보관 구역 분리 |
| `kt_shared` | 다른 매장과 주방 공유 |
| `kt_unknown` | 주방 기준을 모름 |
| `nat_china` | 중국 국적 |
| `nat_japan` | 일본 국적 |
| `nat_korea` | 대한민국 국적 |
| `nat_other` | 그 밖의 지역 국적 |
| `nat_other_asia` | 그 밖의 아시아 국적 |
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
| `prem_candidate` | 후보 매장만 있음 |
| `prem_owned` | 본인·회사 소유 건물 |
| `prem_provisional` | 매장 가계약 |
| `prem_signed` | 매장 임대 계약 완료 |
| `prem_undecided` | 매장 미정 |
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
| `sh_done` | 직원 건강검진 완료 |
| `sh_no_staff` | 아직 직원 없음 |
| `sh_not_yet` | 직원 검진 전 |
| `sh_some` | 일부 직원만 검진 |
| `sh_unknown` | 검진 필요 여부를 모름 |
| `st_add_alcohol` | 주류 판매 추가 |
| `st_new` | 새로 오픈 준비 |
| `st_renew` | 운영 중 허가 갱신 |
| `st_takeover` | 인수한 매장 명의 변경 |
| `st_unsure` | 어떤 허가인지 모름 |
| `sub_agency` | 대행사가 제출 |
| `sub_self` | 직접 제출 |
| `sub_staff` | 직원이 제출 |
| `sub_undecided` | 제출 방식 미정 |
| `sz_large` | 100석 넘는 대형 |
| `sz_mid` | 50석에서 100석 |
| `sz_multi` | 2층 이상 매장 |
| `sz_small` | 50석 이하 소형 |
| `sz_unknown` | 규모 미정 |
| `tl_2_3m` | 두세 달 안에 허가 |
| `tl_already` | 이미 영업 중 |
| `tl_flexible` | 급하지 않음 |
| `tl_unsure` | 필요 시점 미정 |
| `tl_urgent` | 한 달 안에 허가 필요 |
| `tn_needed` | 번역·인증 필요함 |
| `tn_none` | 번역 필요 없음 |
| `tn_unsure` | 번역 필요 여부 모름 |
| `vn_bar` | 술집·바 |
| `vn_cafe` | 카페 |
| `vn_delivery` | 배달 전문 주방 |
| `vn_hotel` | 호텔 안 식당 |
| `vn_restaurant` | 일반 식당 |
| `ws_building` | 건물에서 함께 처리 |
| `ws_contract` | 쓰레기·폐유 처리 계약 |
| `ws_none` | 처리 계약 없음 |
| `ws_unknown` | 처리 방법을 모름 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 식품안전법 시행령 (제15/2018/NĐ-CP호): 식품 위생 조건 확인 증명서 대상과 예외(호텔 안 식당, 노점 등은 증명서 대신 조건 준수) | 베트남 정부 | 법령(해설 자료로 확인) | https://thuvienphapluat.vn/hoi-dap-phap-luat/10-truong-hop-khong-can-cap-giay-chung-nhan-an-toan-thuc-pham-269611.html | 조문 번호는 공식 원문 대조 필요 |
| 2 | 소방·구조법 (제55/2024/QH15호)과 시행령 (제105/2025/NĐ-CP호) | 베트남 국회 / 정부 | 법령(해설 자료로 확인) | https://luatvietan.vn/da-co-nghi-dinh-105-2025-huong-dan-luat-phong-chay-chua-chay-2024-moi.html | 매장 규모별 소방 대상은 원문 대조 필요 |
