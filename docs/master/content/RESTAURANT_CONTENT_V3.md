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

1. 전 과정 대행: `rs_timeline` ∈ {tl_urgent, tl_already} 또는 `rs_registration` ∈ {reg_not_started} 또는 `rs_situation` ∈ {sit_operating}
2. 작성과 제출 동행: `rs_submitter` ∈ {sub_undecided} 또는 `rs_agencyNeed` ∈ {an_office, an_changed, an_zone} 또는 `rs_situation` ∈ {sit_rejected} 또는 `rs_langRoute` ∈ {lr_none}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**식당을 준비하시면서 지금 어떤 상황이고, 가장 막막한 부분은 어디인가요?**

① **새로 가게를 열려고** 준비 중입니다. 처음이라 무슨 허가를 어떤 순서로 받아야 하는지 감이 안 잡힙니다.  
② **운영 중인 가게인데** 갱신 시기가 다가왔습니다. 기한을 놓쳐 문제가 생기지 않을지 걱정됩니다.  
③ **가게를 인수했습니다.** 전 주인 허가가 그대로 이어지는지 새로 받아야 하는지 아무도 확실히 말해 주지 않습니다.  
④ **술도 같이 팔고 싶습니다.** 지금 허가에 추가하면 되는지 따로 받아야 하는지 모르겠습니다.  
⑤ **무슨 허가가 필요한지조차** 모르겠습니다. 주변에 물어봐도 말이 다 달라 우리 가게에 뭐가 필요한지 정리가 안 됩니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `rs_stage=st_new`, `rs_stageFocus=sf_order` | 새로 매장을 열며 허가 준비 순서를 확인하려는 상황입니다 |
| ② | `rs_stage=st_renew`, `rs_stageFocus=sf_renew` | 운영 중인 매장의 허가를 다시 받으며 제출 서류를 확인하려는 상황입니다 |
| ③ | `rs_stage=st_takeover`, `rs_stageFocus=sf_takeover` | 매장을 인수해 허가를 이어받을 수 있는지 확인하려는 상황입니다 |
| ④ | `rs_stage=st_add_alcohol`, `rs_stageFocus=sf_alcohol` | 주류 판매를 더하며 필요한 등록을 확인하려는 상황입니다 |
| ⑤ | `rs_stage=st_unsure`, `rs_stageFocus=sf_which` | 필요한 허가의 종류부터 확인해야 하는 상황입니다 |

### 1차 2번 — Q2

**사업자 등록은 지금 어떤 상황이고, 누구 이름으로 가게를 열 생각이신가요?**

① **법인 등록은 끝났습니다.** 투자한 우리 법인 이름으로 식당 허가를 받으려고 합니다.  
② **개인사업자로 등록했습니다.** 제 이름으로 낸 사업자 등록증이 있어서, 그 이름으로 식당 허가를 받으려고 합니다.  
③ **등록 절차가 아직 진행 중입니다.** 끝나는 대로 베트남 현지 법인 이름으로 허가를 받을 예정입니다.  
④ **등록은 아직 시작도 못 했습니다.** 어떤 이름으로 해야 할지 몰라서, 주변에서 현지인 이름으로 하라는 말도 들었습니다.  
⑤ **지금 어떤 상태인지** 저도 잘 모르겠습니다. 누구 이름으로 허가를 받아야 하는지도 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `rs_registration=reg_company_done`, `rs_owner=own_fdi` | 외국인 투자 법인 등록을 마친 상황입니다 |
| ② | `rs_registration=reg_household_done`, `rs_owner=own_household` | 개인사업자 등록을 마친 상황입니다 |
| ③ | `rs_registration=reg_in_progress`, `rs_owner=own_local` | 현지 법인 등록이 진행 중인 상황입니다 |
| ④ | `rs_registration=reg_not_started`, `rs_owner=own_partner` | 사업자 등록 전이고 현지인 명의를 생각하는 상황입니다 |
| ⑤ | `rs_registration=reg_unsure`, `rs_owner=own_undecided` | 등록 상태와 운영 주체부터 확인해야 하는 상황입니다 |

### 1차 3번 — Q3

**가게 자리는 어떻게 되어 있고, 거기서 식당을 해도 되는지 확인해 보셨나요?**

① **임대 계약은 했습니다.** 그런데 음식점으로 써도 되는 건물인지는 확인하지 못했습니다.  
② **제 건물이라 안심했습니다.** 건물 용도가 식당으로 써도 되는 용도인지, 면적은 충분한지는 아직 모릅니다.  
③ **가계약금만 낸 상태입니다.** 본계약 전인데, 나중에 허가가 안 나오는 자리로 밝혀지면 어쩌나 불안합니다.  
④ **후보 몇 곳을 보고 있습니다.** 어디가 허가받기 좋은지 고르는 기준을 모르겠습니다.  
⑤ **자리를 아직 못 정했습니다.** 계약하기 전에 어떤 조건이어야 하는지부터 알고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `rs_premises=prem_signed`, `rs_premisesCheck=pk_contract_use` | 매장 계약을 마치고 음식점으로 써도 되는 건물인지 확인하려는 상황입니다 |
| ② | `rs_premises=prem_owned`, `rs_premisesCheck=pk_owned_use` | 소유 건물의 용도와 면적을 확인하려는 상황입니다 |
| ③ | `rs_premises=prem_provisional`, `rs_premisesCheck=pk_provisional_check` | 가계약 상태에서 허가 가능 여부를 확인하려는 상황입니다 |
| ④ | `rs_premises=prem_candidate`, `rs_premisesCheck=pk_candidate_fit` | 후보 매장 중 허가 가능한 곳을 고르려는 상황입니다 |
| ⑤ | `rs_premises=prem_undecided`, `rs_premisesCheck=pk_unknown_need` | 허가에 맞는 매장 조건부터 확인해야 하는 상황입니다 |

### 1차 4번 — Q4

**위생이나 소방 준비는 어디까지 되어 있고, 주방 구조는 어떻게 되어 있나요?**

① **위생·소방 준비는 끝났습니다.** 조리, 세척, 식재료 보관 자리가 따로 나뉘어 있습니다.  
② **지금 공사 중입니다.** 주방 일부만 나눴고 나머지는 공사 중이라 점검받을 때 괜찮을지 모르겠습니다.  
③ **아직 손도 못 댔습니다.** 주방이 한 공간으로 트여 있어서 어떻게 나눠야 하는지 모르겠습니다.  
④ **소방은 건물주가 한다고 들었습니다.** 같은 건물 다른 가게와 주방과 소방 설비를 같이 쓰는데 우리 책임이 어디까지인지 모르겠습니다.  
⑤ **뭐가 필요한지** 모르겠습니다. 주방을 어떤 기준으로 나눠야 하는지도 들어 본 적이 없습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `rs_hygieneFire=hf_ready`, `rs_kitchen=kt_separated` | 위생·소방 시설과 주방 구역을 갖춘 상황입니다 |
| ② | `rs_hygieneFire=hf_building`, `rs_kitchen=kt_partial` | 시설 공사 중이고 주방 구역이 일부만 나뉜 상황입니다 |
| ③ | `rs_hygieneFire=hf_not_yet`, `rs_kitchen=kt_open` | 시설 준비 전이고 주방 구역 구분이 없는 상황입니다 |
| ④ | `rs_hygieneFire=hf_landlord`, `rs_kitchen=kt_shared` | 소방은 건물주 담당이고 주방을 함께 쓰는 상황입니다 |
| ⑤ | `rs_hygieneFire=hf_unknown`, `rs_kitchen=kt_unknown` | 필요한 시설과 주방 기준을 확인해야 하는 상황입니다 |

### 1차 5번 — Q5

**이 일을 하시면서 가장 답답하고 불안한 점은 무엇이고, 지금 어떤 상황인가요?**

① **어디서부터 시작해야 할지** 막막합니다. 검색도 해 봤는데 베트남어 자료라 어떤 말이 맞는지 모르겠습니다.  
② **일이 제대로 되고 있는지** 불안합니다. 베트남 지인이나 직원이 알아서 한다는데 어디까지 됐는지 알 수 없습니다.  
③ **사람마다 말이 달라** 혼란스럽습니다. 건물주, 업체, 지인이 각자 다르게 말해서 누구 말이 맞는지 모르겠습니다.  
④ **담당 기관에서 연락이 올까** 겁이 납니다. 영업을 이미 시작했는데 허가가 아직 확인되지 않았습니다.  
⑤ **이미 한 번 막혀서** 지쳤습니다. 서류를 냈다가 보완하라고 돌려받은 적이 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `rs_feeling=fl_lost`, `rs_situation=sit_search_vn` | 어디서 시작할지 막막하고 베트남어 자료를 이해하기 어려운 상황입니다 |
| ② | `rs_feeling=fl_anxious`, `rs_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 알 수 없어 불안한 상황입니다 |
| ③ | `rs_feeling=fl_confused`, `rs_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 |
| ④ | `rs_feeling=fl_afraid`, `rs_situation=sit_operating` | 허가 확인 전에 영업을 시작해 불안한 상황입니다 |
| ⑤ | `rs_feeling=fl_tired`, `rs_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 |

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
| ① | `rs_docs=docs_all`, `rs_langRoute=lr_self` | 서류가 갖춰졌으니 도면의 구역 표시와 실제 매장이 같은지만 확인하고 접수하세요. |
| ② | `rs_docs=docs_most`, `rs_langRoute=lr_interp` | 남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요. 통역한 내용이 서류 원문과 같은지 접수 전에 한 번 더 확인하세요. |
| ③ | `rs_docs=docs_half`, `rs_langRoute=lr_local` | 준비한 서류 목록을 만든 뒤 시설 도면과 직원 서류가 빠졌는지부터 확인하세요. 직원 설명은 서류 원문과 대조해 확인하세요. |
| ④ | `rs_docs=docs_little`, `rs_langRoute=lr_machine` | 식당 위생 허가에 필요한 기본 서류(신청서, 등록증, 시설 설명, 직원 검진·교육)를 먼저 받으세요. 인공지능 번역은 법률 용어와 숫자가 틀릴 수 있으니 중요한 서류는 전문가 확인을 받으세요. |
| ⑤ | `rs_docs=docs_unknown`, `rs_langRoute=lr_none` | 매장 규모와 판매 품목에 따라 서류가 달라지니 그 기준부터 확인하세요. 베트남어 서류를 읽어 줄 사람이나 전문 번역부터 정하세요. |

### 2차 7번 — Q7

**주방에서 일할 직원은 구하셨고, 건강검진이나 위생 교육 이야기는 들어 보셨나요?**

① **직원 건강검진은 다 끝났습니다.** 위생 교육도 받아서 수료 확인서를 가지고 있습니다.  
② **일부 직원만 검진을 받았습니다.** 위생 교육은 다음 달에 다 같이 받으려고 합니다.  
③ **검진은 아직 아무도 못 받았습니다.** 위생 교육도 아직이고, 언제 받아야 하는지도 모릅니다.  
④ **아직 직원을 못 구했습니다.** 사람을 구한 뒤에 검진을 받게 하고 위생 교육도 같이 받게 할 생각입니다.  
⑤ **그런 게 필요한지** 몰랐습니다. 음식을 만지는 직원이 검진과 교육을 받아야 하는지 처음 들었습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `rs_staffHealth=sh_done`, `rs_foodTraining=ft_done` | 검진 결과서와 교육 확인서의 날짜가 유효한지만 확인해 함께 제출하세요. |
| ② | `rs_staffHealth=sh_some`, `rs_foodTraining=ft_planned` | 남은 직원 검진과 위생 교육 날짜를 정해 신청 전에 모두 마치도록 일정을 잡으세요. |
| ③ | `rs_staffHealth=sh_not_yet`, `rs_foodTraining=ft_none` | 주방 직원은 건강검진과 위생 교육이 필요하니 가장 먼저 일정을 잡으세요. |
| ④ | `rs_staffHealth=sh_no_staff`, `rs_foodTraining=ft_planned` | 채용 직후 검진과 교육을 받도록 채용 일정과 허가 일정을 함께 맞추세요. |
| ⑤ | `rs_staffHealth=sh_unknown`, `rs_foodTraining=ft_unknown` | 음식을 다루는 직원은 검진과 교육 대상이 되는 경우가 많으니 필요한 범위를 먼저 확인하세요. |

### 2차 8번 — Q8

**어떤 가게를 생각하고 계시고, 술은 어떻게 하실 계획인가요?**

① **일반 식당**을 생각합니다. 식사하는 손님에게 맥주나 와인을 같이 팔고 싶은데 따로 허가가 필요한지 궁금합니다.  
② **커피와 디저트 중심 카페**입니다. 술은 팔 생각이 없고 음료와 간단한 디저트만 팔 계획입니다.  
③ **술집이나 바**를 생각합니다. 도수 높은 술도 팔고 밤늦게까지 영업하고 싶은데 가능한지 모릅니다.  
④ **호텔 안 식당**입니다. 투숙객과 외부 손님에게 술을 팔지는 아직 정하지 못했습니다.  
⑤ **배달 전문 주방**입니다. 손님이 주문한 음식과 함께 술도 포장이나 배달로 팔 수 있는지 궁금합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `rs_venue=vn_restaurant`, `rs_alcohol=al_beer` | 매장에서 술을 팔면 주류 판매 관련 등록이 필요할 수 있으니 위생 허가와 함께 준비하세요. |
| ② | `rs_venue=vn_cafe`, `rs_alcohol=al_none` | 주류를 팔지 않으면 주류 판매 등록은 필요하지 않으니 위생·소방에 집중하세요. |
| ③ | `rs_venue=vn_bar`, `rs_alcohol=al_spirits` | 도수가 높은 술과 심야 영업은 조건이 더 까다로울 수 있으니 먼저 가능 여부를 확인하세요. |
| ④ | `rs_venue=vn_hotel`, `rs_alcohol=al_unsure` | 주류 판매 여부에 따라 필요한 등록이 달라지니 메뉴 구성을 먼저 정하세요. |
| ⑤ | `rs_venue=vn_delivery`, `rs_alcohol=al_takeaway` | 포장 판매는 매장 내 판매와 다른 등록이 필요할 수 있으니 판매 방식을 먼저 정하세요. |

### 2차 9번 — Q9

**허가는 언제까지 받아야 마음이 놓이고, 영업은 언제쯤 시작하고 싶으신가요?**

① **한 달 안에는** 받아야 합니다. 오픈 날짜를 이미 정해 놓아서 허가가 늦어지면 미루기 어렵습니다.  
② **두세 달 안에** 받으면 됩니다. 공사가 끝나는 날에 맞춰 영업을 시작하려고 합니다.  
③ **급하진 않습니다.** 서두르다 놓치는 게 없도록 허가가 나온 걸 확인한 뒤에 천천히 영업을 시작하고 싶습니다.  
④ **언제까지인지** 모르겠습니다. 허가가 언제까지 필요한지, 영업을 언제 시작할지도 아직 정하지 못했습니다.  
⑤ **이미 영업을 하고 있습니다.** 허가를 못 받은 채 먼저 시작했는데 문제가 되지 않을지 불안합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `rs_timeline=tl_urgent`, `rs_openPlan=op_date` | 한 달은 시설 점검까지 빠듯하니 서류와 직원 검진을 바로 시작하세요. |
| ② | `rs_timeline=tl_2_3m`, `rs_openPlan=op_after_fitout` | 공사가 끝나는 날을 기준으로 서류 제출 일정을 거꾸로 계산해 두세요. |
| ③ | `rs_timeline=tl_flexible`, `rs_openPlan=op_after_permit` | 시간 여유가 있으니 시설 기준을 미리 확인하고 공사를 진행하세요. |
| ④ | `rs_timeline=tl_unsure`, `rs_openPlan=op_unsure` | 오픈 날짜를 정해야 공사와 허가 일정을 맞출 수 있습니다. |
| ⑤ | `rs_timeline=tl_already`, `rs_openPlan=op_running` | 허가 없이 영업 중이라면 제재를 받을 수 있으니 허가 신청을 바로 서두르세요. |

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
| ① | `rs_askedWho=ask_agency_kr`, `rs_answerFeel=ans_unsure_trust` | 여러 곳의 설명이 다르면 같은 질문을 글로 정리해 보내고 답을 나란히 비교하세요. |
| ② | `rs_askedWho=ask_local`, `rs_answerFeel=ans_not_understood` | 현지 업체의 설명은 문서로 받아 통역이나 전문 번역으로 한 번 더 확인하세요. |
| ③ | `rs_askedWho=ask_acquaint`, `rs_answerFeel=ans_not_fit` | 경험담은 시기와 지역, 매장 형태가 같아야 참고가 되니 조건이 같은지 먼저 대조하세요. |
| ④ | `rs_askedWho=ask_authority`, `rs_answerFeel=ans_not_clear_vn` | 기관 안내는 받은 날짜와 담당 부서, 내용을 적어 두고 통역을 거쳐 다시 확인하세요. |
| ⑤ | `rs_askedWho=ask_nobody`, `rs_answerFeel=ans_unknown_who` | 먼저 지역의 보건·식품 안전 담당 기관이 어디인지 확인하고 물어볼 내용을 정리해 두세요. |

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
| ① | `rs_submitter=sub_self`, `rs_submitNeed=sn_account` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `rs_submitter=sub_staff`, `rs_submitNeed=sn_proxy` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `rs_submitter=sub_agency`, `rs_submitNeed=sn_scope` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `rs_submitter=sub_undecided`, `rs_submitNeed=sn_compare` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `rs_submitter=sub_self_lang`, `rs_submitNeed=sn_interpreter` | 직접 제출하되 베트남어가 어렵다면 제출하는 날 통역이 필요한 범위를 미리 정해 두세요. |

### 2차 12번 — Q12

**식당 재료는 어디서 구하실 거고, 점검 나왔을 때 보여 줄 서류는 어떻게 하실 건가요?**

① **납품 계약한 곳이 있습니다.** 계약서와 거래 내역은 점검 때 보여 줄 수 있게 잘 모아 두려고 합니다.  
② **시장에서 직접** 사 옵니다. 영수증을 어디까지 모아 둬야 점검 때 문제가 없는지 모르겠습니다.  
③ **수입 재료를 많이** 쓸 겁니다. 통관 서류나 베트남어 표시가 없는 재료는 어떻게 해야 하는지 모릅니다.  
④ **여러 곳에서 나눠** 삽니다. 곳마다 증빙이 달라서 어떻게 정리해야 할지 막막합니다.  
⑤ **재료 출처까지 서류가 필요한지** 몰랐습니다. 점검 나오면 뭘 보여 달라고 하는지 궁금합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `rs_ingredients=ing_contract`, `rs_proof=ev_contract` | 납품 계약서와 거래 명세서를 함께 보관해 두면 점검 때 바로 보여 줄 수 있습니다. |
| ② | `rs_ingredients=ing_market`, `rs_proof=ev_receipt` | 직접 구매하면 구입 영수증을 모아 두세요. 점검 때 식재료 출처를 보여 줄 수 있습니다. |
| ③ | `rs_ingredients=ing_import`, `rs_proof=ev_import` | 수입 식재료는 수입 통관과 표시 서류를 받아 두고 보관하세요. |
| ④ | `rs_ingredients=ing_mixed`, `rs_proof=ev_mixed` | 구매처마다 영수증이나 계약서를 모아 두고 한곳에 정리하세요. |
| ⑤ | `rs_ingredients=ing_unknown`, `rs_proof=ev_unknown` | 식재료 출처를 보여 줄 서류가 요구될 수 있으니 구매 방식부터 정하세요. |

### 2차 13번 — Q13

**가게가 있는 곳은 어디이고, 서류를 어느 기관에 내야 하는지는 알아보셨나요?**

① **하노이**입니다. 어느 기관에 내야 하는지, 온라인으로도 낼 수 있는지 알아보고 있습니다.  
② **호치민**입니다. 어느 기관에 내야 하는지 몰라서 그것부터 알고 싶고 온라인 접수가 되는지도 궁금합니다.  
③ **다낭**입니다. 최근 기관이 합쳐졌다는 말을 들었는데 지금은 어디에 내야 하는지 모르겠습니다.  
④ **그 밖의 도시**입니다. 지방은 방식이 다르다고 해서 직접 가서 내야 하는지 궁금합니다.  
⑤ **산업단지 안**입니다. 단지 관리 기관에 내는지 아니면 다른 곳에 내는지 아는 사람이 없어서 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `rs_area=area_hanoi`, `rs_agencyNeed=an_online` | 온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요. |
| ② | `rs_area=area_hcm`, `rs_agencyNeed=an_office` | 식당 위생 허가는 지역의 보건·식품 안전 담당 기관이 받는 경우가 많으니 그곳부터 확인하세요. |
| ③ | `rs_area=area_danang`, `rs_agencyNeed=an_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `rs_area=area_other_city`, `rs_agencyNeed=an_visit` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `rs_area=area_ip`, `rs_agencyNeed=an_zone` | 산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `rs_feeling=fl_lost`, `rs_situation=sit_search_vn` | 어디서부터 시작해야 할지 몰라 막막한 상황입니다 | 식당은 식품 위생 조건을 갖춘 시설임을 확인받는 증명서가 기본이고, 신청서, 사업자 등록증, 시설 설명, 직원 검진·교육 서류가 필요합니다. 호텔 안 식당 등 일부는 예외가 있습니다. |
| `rs_feeling=fl_anxious`, `rs_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 몰라 불안한 상황입니다 | 서류가 갖춰진 뒤 현장 확인을 거쳐 허가가 나오며, 시설 공사가 끝나야 확인을 받을 수 있습니다. 진행 상황은 접수 번호와 현재 단계를 문서로 받아 확인하세요. |
| `rs_feeling=fl_confused`, `rs_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 | 식당은 매장 형태와 규모, 주류 판매 여부에 따라 필요한 허가가 달라 사람마다 답이 다를 수 있습니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `rs_feeling=fl_afraid`, `rs_situation=sit_operating` | 허가 확인 전에 영업을 시작해 불안한 상황입니다 | 허가 없이 영업하는 중에 점검이 나오면 제재를 받을 수 있습니다. 담당 기관의 연락은 베트남어로 올 수 있어 내용을 정확히 이해한 채 대응하는 것이 중요합니다. |
| `rs_feeling=fl_tired`, `rs_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 | 서류를 보완하라고 돌려받았다면 어느 항목이 문제였는지부터 확인해야 합니다. 이름·번호·숫자가 서로 다른 서류가 있으면 접수가 보류될 수 있어 접수 전 점검이 도움이 됩니다. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (registration) | `rs_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다 |
| 2 (nominee) | `rs_owner` ∈ {own_partner} | 현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다 |
| 3 (running) | `rs_timeline` ∈ {tl_already} | 허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다 |
| 4 (language) | `rs_langRoute` ∈ {lr_local, lr_machine, lr_none} | 베트남어 서류를 정확히 이해하지 못한 채 진행하면 불리한 조건을 놓칠 수 있어 전문 통역이나 번역 확인이 필요합니다 |
| 5 (answer) | `rs_answerFeel` ∈ {ans_not_understood, ans_not_clear_vn} | 받은 안내를 정확히 이해하지 못한 채 진행하면 필요한 절차를 놓칠 수 있어 안내 내용을 문서로 다시 확인해야 합니다 |
| 6 (premises) | `rs_premises` ∈ {prem_candidate, prem_undecided} | 매장이 확보되지 않으면 시설 확인을 받을 수 없어 매장 계약부터 마쳐야 합니다 |
| 7 (facility) | `rs_hygieneFire` ∈ {hf_not_yet, hf_unknown} | 위생·소방 시설이 준비되지 않으면 현장 확인에서 보완 요구를 받을 수 있습니다 |
| 8 (kitchen) | `rs_kitchen` ∈ {kt_open, kt_shared} | 주방 구역이 나뉘지 않았거나 공유하면 위생 기준에 맞지 않을 수 있어 배치를 먼저 확인하세요 |
| 9 (staff) | `rs_staffHealth` ∈ {sh_not_yet, sh_unknown} | 주방 직원의 건강검진과 위생 교육이 끝나야 신청할 수 있어 일정부터 잡아야 합니다 |
| 10 (alcohol) | `rs_alcohol` ∈ {al_spirits, al_takeaway} | 주류 판매 방식에 따라 별도 등록이 필요할 수 있어 판매 방식을 먼저 정해야 합니다 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 신청 전에 시설과 직원 서류의 날짜를 한 번 더 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 법인설립 확인 | `rs_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다. |
| 전문가 진행 | `rs_timeline` ∈ {tl_already, tl_urgent} 또는 `rs_situation` ∈ {sit_operating} | 이미 영업 중이거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

## 8. 값 → 고객 표시 문구

| 내부 값 | 고객 화면 표시 |
|---|---|
| `al_beer` | 맥주·와인을 매장에서 판매 |
| `al_none` | 주류 판매 안 함 |
| `al_spirits` | 도수 높은 술까지 판매 |
| `al_takeaway` | 주류 포장 판매 |
| `al_unsure` | 주류 판매 여부 미정 |
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
| `docs_all` | 기본 서류 모두 준비 |
| `docs_half` | 기본 서류 절반 준비 |
| `docs_little` | 기본 서류 거의 미준비 |
| `docs_most` | 기본 서류 대부분 준비 |
| `docs_unknown` | 필요 서류를 모름 |
| `ev_contract` | 납품 계약서·거래 명세서 보관 |
| `ev_import` | 수입 통관·표시 서류 확인 |
| `ev_mixed` | 구매처별 증빙 정리 필요 |
| `ev_receipt` | 구입 영수증 보관 범위 확인 |
| `ev_unknown` | 요구 서류를 모름 |
| `fl_afraid` | 담당 기관 연락이 겁남 |
| `fl_anxious` | 진행 상황을 몰라 불안함 |
| `fl_confused` | 사람마다 말이 달라 혼란스러움 |
| `fl_lost` | 어디서 시작할지 막막함 |
| `fl_tired` | 한 번 막혀서 지침 |
| `ft_done` | 위생 교육 수료 |
| `ft_none` | 위생 교육 안 함 |
| `ft_planned` | 위생 교육 예정 |
| `ft_unknown` | 교육 필요 여부를 모름 |
| `hf_building` | 시설 공사 중 |
| `hf_landlord` | 건물주가 소방 담당 |
| `hf_not_yet` | 시설 준비 전 |
| `hf_ready` | 위생·소방 시설 준비 완료 |
| `hf_unknown` | 필요한 시설을 모름 |
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
| `lr_interp` | 통역사·베트남어 하는 지인이 통역 |
| `lr_local` | 한국어 하는 베트남 직원이 설명 |
| `lr_machine` | 인공지능 번역기로 대략 이해 |
| `lr_none` | 베트남어를 몰라 내용을 알 수 없음 |
| `lr_self` | 베트남어를 직접 읽음 |
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
| `pk_candidate_fit` | 허가 가능한 매장 기준 확인 |
| `pk_contract_use` | 계약서의 영업 용도 표기 확인 |
| `pk_owned_use` | 건물 용도와 면적 확인 |
| `pk_provisional_check` | 본계약 전 허가 가능 여부 확인 |
| `pk_unknown_need` | 허가에 맞는 매장 조건 확인 |
| `prem_candidate` | 후보 매장만 있음 |
| `prem_owned` | 본인·회사 소유 건물 |
| `prem_provisional` | 매장 가계약 |
| `prem_signed` | 매장 임대 계약 완료 |
| `prem_undecided` | 매장 미정 |
| `reg_company_done` | 법인 등록 완료 |
| `reg_household_done` | 개인사업자 등록 완료 |
| `reg_in_progress` | 사업자 등록 진행 중 |
| `reg_not_started` | 사업자 등록 전 |
| `reg_unsure` | 등록 상태를 모름 |
| `sf_alcohol` | 주류 판매 추가 방법 확인 |
| `sf_order` | 처음 허가의 준비 순서 확인 |
| `sf_renew` | 갱신 때 다시 낼 서류 확인 |
| `sf_takeover` | 인수 후 허가 승계 여부 확인 |
| `sf_which` | 필요한 허가 종류 확인 |
| `sh_done` | 직원 건강검진 완료 |
| `sh_no_staff` | 아직 직원 없음 |
| `sh_not_yet` | 직원 검진 전 |
| `sh_some` | 일부 직원만 검진 |
| `sh_unknown` | 검진 필요 여부를 모름 |
| `sit_conflicting` | 건물주·업체·지인의 말이 서로 다름 |
| `sit_operating` | 허가 확인 전에 영업 시작 |
| `sit_rejected` | 서류 보완 요구를 받은 적 있음 |
| `sit_search_vn` | 베트남어 자료를 이해하지 못함 |
| `sit_unknown_progress` | 맡긴 일의 진행 정도를 모름 |
| `sn_account` | 온라인 접수 계정·서명 준비 |
| `sn_compare` | 제출 방식 비교 |
| `sn_interpreter` | 통역 필요 범위 확인 |
| `sn_proxy` | 위임장·연락 방법 준비 |
| `sn_scope` | 대행 범위·원본 보관 확인 |
| `st_add_alcohol` | 주류 판매 추가 |
| `st_new` | 새로 오픈 준비 |
| `st_renew` | 운영 중 허가 갱신 |
| `st_takeover` | 인수한 매장 명의 변경 |
| `st_unsure` | 어떤 허가인지 모름 |
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
| `vn_bar` | 술집·바 |
| `vn_cafe` | 카페 |
| `vn_delivery` | 배달 전문 주방 |
| `vn_hotel` | 호텔 안 식당 |
| `vn_restaurant` | 일반 식당 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 식품안전법 시행령 (제15/2018/NĐ-CP호): 식품 위생 조건 확인 증명서 대상과 예외(호텔 안 식당, 노점 등은 증명서 대신 조건 준수) | 베트남 정부 | 보도 기준 | https://thuvienphapluat.vn/hoi-dap-phap-luat/10-truong-hop-khong-can-cap-giay-chung-nhan-an-toan-thuc-pham-269611.html | 시행령 제46/2026/NĐ-CP호는 결의 제15/2026/NQ-CP호(2026.4.6)로 시행이 정지되어 15/2018이 계속 적용됨. 조문 번호는 공식 원문 대조 필요 |
| 2 | 소방·구조법 (제55/2024/QH15호)과 시행령 (제105/2025/NĐ-CP호) | 베트남 국회 / 정부 | 보도 기준 | https://luatvietan.vn/da-co-nghi-dinh-105-2025-huong-dan-luat-phong-chay-chua-chay-2024-moi.html | 매장 규모별 소방 대상은 원문 대조 필요 |
