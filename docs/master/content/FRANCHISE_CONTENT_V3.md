# 프랜차이즈 등록 직접 인허가 받기 콘텐츠 설계서

이 문서는 scripts/franchise-content-spec.mjs 에서 자동 생성된다. 직접 고치지 않는다. 확인일 2026.10.12.

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
| oh_over1y | key: secured |
| oh_home_over1y | key: secured |
| oh_under1y | key: unsecured |
| oh_new | key: unsecured |
| oh_unknown | key: 비어 있음(추가 확인 필요) |

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

1. 전 과정 대행: `fr_helpWanted` ∈ {help_full} 또는 `fr_timeline` ∈ {tl_urgent, tl_already} 또는 `fr_registration` ∈ {reg_not_started} 또는 `fr_recruit` ∈ {rc_started}
2. 작성과 제출 동행: `fr_helpWanted` ∈ {help_accompany} 또는 `fr_submitter` ∈ {sub_undecided} 또는 `fr_agencyKnown` ∈ {ag_unknown, ag_changed}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**프랜차이즈와 관련해 어떤 절차가 필요하고, 어떤 업종의 브랜드인가요?**

① **해외 브랜드를 베트남에** 가맹으로 들여오려고 합니다. 음식이나 음료를 파는 외식 브랜드입니다.  
② **베트남 전체 가맹권을** 받는 계약을 하려고 합니다. 편의점이나 소매점 형태의 브랜드입니다.  
③ **베트남에서 키운 브랜드**를 가맹으로 늘리려고 합니다. 학원이나 교육 서비스를 하는 브랜드입니다.  
④ **등록한 내용을 바꿔야** 합니다. 미용실이나 피부 관리실 같은 뷰티 서비스 브랜드입니다.  
⑤ **어떤 절차가 필요한지** 모르겠습니다. 세탁이나 청소처럼 생활 서비스를 하는 브랜드입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fr_stage=st_inbound`, `fr_business=bz_food` | 해외 외식 브랜드를 가맹으로 들여오려는 상황입니다 |
| ② | `fr_stage=st_master`, `fr_business=bz_retail` | 소매 브랜드의 베트남 전체 가맹권을 받으려는 상황입니다 |
| ③ | `fr_stage=st_local_brand`, `fr_business=bz_education` | 베트남 교육 브랜드를 가맹으로 늘리려는 상황입니다 |
| ④ | `fr_stage=st_change`, `fr_business=bz_beauty` | 뷰티 브랜드의 등록 내용을 바꾸려는 상황입니다 |
| ⑤ | `fr_stage=st_unsure`, `fr_business=bz_service` | 서비스 브랜드에 필요한 절차부터 확인할 상황입니다 |

### 1차 2번 — Q2

**사업자 등록은 어디까지 진행되었고, 누구 이름으로 가맹 사업을 하실 예정인가요?**

① **법인 등록을 이미** 마쳤습니다. 외국인이 투자한 법인 이름으로 허가를 받으려고 합니다.  
② **개인사업자 등록을** 마쳤습니다. 규모가 작아서 개인사업자로 허가를 받으려고 합니다.  
③ **사업자 등록을 진행하고** 있습니다. 베트남 현지 법인 이름으로 허가를 받을 예정입니다.  
④ **사업자 등록을 아직** 시작하지 않았습니다. 베트남 사람 이름으로 등록해서 운영하려고 생각하고 있습니다.  
⑤ **등록 상태를 정확히** 모르겠습니다. 누구 이름으로 허가를 받아야 하는지도 아직 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fr_registration=reg_company_done`, `fr_owner=own_fdi` | 외국인 투자 법인 등록을 마친 상황입니다 |
| ② | `fr_registration=reg_household_done`, `fr_owner=own_household` | 개인사업자 등록을 마친 상황입니다 |
| ③ | `fr_registration=reg_in_progress`, `fr_owner=own_local` | 현지 법인 등록이 진행 중인 상황입니다 |
| ④ | `fr_registration=reg_not_started`, `fr_owner=own_partner` | 사업자 등록 전이고 현지인 명의를 생각하는 상황입니다 |
| ⑤ | `fr_registration=reg_unsure`, `fr_owner=own_undecided` | 등록 상태와 운영 주체부터 확인해야 하는 상황입니다 |

### 1차 3번 — Q3

**가맹하려는 브랜드는 직영으로 얼마나 운영해 왔고, 매장은 몇 곳인가요?**

① **베트남에서 1년 넘게** 직영으로 운영했습니다. 베트남에 직영 매장을 여러 곳 운영하고 있습니다.  
② **본국에서 1년 넘게** 운영해 왔습니다. 베트남에는 아직 직영 매장이 한 곳뿐입니다.  
③ **운영한 지 1년이 안** 되었습니다. 행사장이나 쇼핑몰의 임시 매장으로만 운영해 보았습니다.  
④ **아직 운영을 시작하지** 않았습니다. 본사가 직접 운영하는 매장은 아직 한 곳도 없습니다.  
⑤ **운영 기간을 정확히** 모르겠습니다. 본사가 매장을 몇 곳 운영하는지도 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fr_history=oh_over1y`, `fr_outlets=ou_many` | 베트남에서 1년 넘게 여러 매장을 운영한 상황입니다 |
| ② | `fr_history=oh_home_over1y`, `fr_outlets=ou_one` | 본국에서 1년 넘게 운영했고 베트남 매장은 한 곳인 상황입니다 |
| ③ | `fr_history=oh_under1y`, `fr_outlets=ou_popup` | 운영 1년 미만이고 임시 매장만 운영한 상황입니다 |
| ④ | `fr_history=oh_new`, `fr_outlets=ou_none` | 운영 전이라 직영 매장이 없는 상황입니다 |
| ⑤ | `fr_history=oh_unknown`, `fr_outlets=ou_unknown` | 운영 기간과 매장 수를 확인해야 하는 상황입니다 |

### 1차 4번 — Q4

**가맹계약서와 운영 매뉴얼은 준비했고, 브랜드 상표는 베트남에 등록했나요?**

① **가맹계약서와 운영 매뉴얼을** 모두 준비했습니다. 브랜드 상표를 베트남에 이미 등록해 두었습니다.  
② **가맹계약서만** 준비했습니다. 베트남에 상표를 출원해서 지금 심사를 기다리고 있습니다.  
③ **계약서와 매뉴얼 초안**만 있습니다. 상표는 본국에만 등록되어 있고 베트남에는 없습니다.  
④ **계약서와 매뉴얼을 아직** 만들지 않았습니다. 상표 등록을 따로 해 본 적이 없습니다.  
⑤ **어떤 서류가 필요한지** 모르겠습니다. 상표가 어디에 등록되어 있는지도 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fr_contract=cm_ready`, `fr_trademark=tm_registered_vn` | 계약서·매뉴얼과 베트남 상표 등록을 갖춘 상황입니다 |
| ② | `fr_contract=cm_contract_only`, `fr_trademark=tm_applied_vn` | 계약서만 있고 상표 심사를 기다리는 상황입니다 |
| ③ | `fr_contract=cm_draft`, `fr_trademark=tm_home_only` | 서류 초안만 있고 베트남 상표가 없는 상황입니다 |
| ④ | `fr_contract=cm_none`, `fr_trademark=tm_none` | 계약서·매뉴얼과 상표 등록이 모두 남은 상황입니다 |
| ⑤ | `fr_contract=cm_unknown`, `fr_trademark=tm_unknown` | 필요한 서류와 상표 상태를 확인해야 하는 상황입니다 |

### 1차 5번 — Q5

**지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?**

① **총비용이 얼마인지** 걱정됩니다. 필요한 서류는 제가 만들 수 있도록 안내만 받고 싶습니다.  
② **필요한 서류가 무엇인지** 모르겠습니다. 서류 작성 방법을 하나씩 알려 주면 직접 준비하겠습니다.  
③ **허가가 언제 나올지** 걱정됩니다. 제출하는 날 담당 기관에 통역과 함께 가고 싶습니다.  
④ **우리 사업이 프랜차이즈 등록 대상인지** 모르겠습니다. 서류 준비부터 제출과 수령까지 모두 맡기고 싶습니다.  
⑤ **받은 견적이 적정한지** 모르겠습니다. 서류는 제가 준비하고 제출할 때만 함께 가고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fr_mainConcern=concern_cost`, `fr_helpWanted=help_guide` | 총비용을 알고 직접 서류를 준비하려는 상황입니다 |
| ② | `fr_mainConcern=concern_docs`, `fr_helpWanted=help_guide` | 필요한 서류부터 알고 싶은 상황입니다 |
| ③ | `fr_mainConcern=concern_time`, `fr_helpWanted=help_accompany` | 허가 일정이 걱정되어 제출 동행을 원하는 상황입니다 |
| ④ | `fr_mainConcern=concern_eligibility`, `fr_helpWanted=help_full` | 허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다 |
| ⑤ | `fr_mainConcern=concern_quote`, `fr_helpWanted=help_accompany` | 받은 견적이 적정한지 확인하려는 상황입니다 |

### 2차 6번 — Q6

**허가 신청 서류는 어디까지 준비되었고, 번역이나 인증이 필요한 서류가 있나요?**

① **등록 신청서, 가맹 소개서, 본사 사업자 서류를 모두** 준비했습니다. 모든 서류의 베트남어 번역도 이미 끝냈습니다.  
② **대부분 준비**했고 몇 가지만 남았습니다. 해외에서 받은 서류는 번역과 영사 인증이 필요합니다.  
③ **절반쯤 준비**했습니다. 베트남어 번역이 필요한 서류가 있는지 몰라서 확인이 필요합니다.  
④ **거의 준비하지 못했습니다.** 번역과 인증을 어디서 어떻게 하는지도 함께 알고 싶습니다.  
⑤ **무엇이 필요한지 아직 모릅니다.** 준비한 서류가 없어서 번역할 서류도 아직 없는 상태입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fr_docs=docs_all`, `fr_translation=tn_none` | 서류가 갖춰졌으니 브랜드명과 회사명이 서류마다 같은지만 확인하고 접수하세요. |
| ② | `fr_docs=docs_most`, `fr_translation=tn_needed` | 남은 서류와 번역이 필요한 서류를 나누어 적고 영사 인증 기간을 먼저 확인하세요. |
| ③ | `fr_docs=docs_half`, `fr_translation=tn_unsure` | 준비한 서류 목록을 만든 뒤 가맹 소개서와 상표 서류가 빠졌는지부터 확인하세요. |
| ④ | `fr_docs=docs_little`, `fr_translation=tn_needed` | 해외 브랜드를 들여오는 등록 기본 서류(신청서, 가맹 소개서, 본사 서류, 상표 서류)를 먼저 받으세요. |
| ⑤ | `fr_docs=docs_unknown`, `fr_translation=tn_none` | 해외 브랜드인지 베트남 브랜드인지에 따라 등록 여부가 달라지니 그 기준부터 확인하세요. |

### 2차 7번 — Q7

**가맹 희망자에게 줄 가맹 소개서는 준비했고, 가맹비와 로열티는 정했나요?**

① **가맹 소개서를** 준비했습니다. 가맹비와 매달 받을 로열티 구조를 이미 정해 두었습니다.  
② **가맹 소개서 초안**만 있습니다. 가맹비와 로열티는 초안만 있고 아직 확정하지 않았습니다.  
③ **가맹 소개서가 아직** 없습니다. 가맹비와 로열티를 어떻게 정해야 할지 모르겠습니다.  
④ **소개서가 필요한지** 모르겠습니다. 가맹비와 로열티는 본사가 정한 금액을 그대로 씁니다.  
⑤ **본사 소개서를 번역**하고 있습니다. 가맹비는 베트남 시장에 맞춰 다시 정하려고 합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fr_disclosure=ds_ready`, `fr_fees=fee_set` | 소개서의 가맹비 내용과 계약서의 금액이 같은지만 확인하세요. |
| ② | `fr_disclosure=ds_draft`, `fr_fees=fee_draft` | 가맹비가 확정되어야 소개서를 완성할 수 있으니 금액 구조부터 정하세요. |
| ③ | `fr_disclosure=ds_none`, `fr_fees=fee_unknown` | 해외 브랜드 등록에는 가맹 소개서가 필요하니 가맹비 구조와 함께 만들어야 합니다. |
| ④ | `fr_disclosure=ds_unknown`, `fr_fees=fee_set` | 본사 금액을 쓰더라도 베트남 상황에 맞는지 확인하고 소개서 필요 여부를 알아보세요. |
| ⑤ | `fr_disclosure=ds_translating`, `fr_fees=fee_draft` | 번역할 때 가맹비와 지원 내용이 베트남 계약 조건과 맞는지 함께 고치세요. |

### 2차 8번 — Q8

**등록을 받는 기관을 알고 계시고, 가맹점 모집은 언제 시작하실 예정인가요?**

① **등록 기관을 알고** 있습니다. 등록을 모두 마친 뒤에 가맹점 모집을 시작할 예정입니다.  
② **등록 기관을 모릅니다.** 가맹점 모집을 이미 시작해서 희망자 상담을 받고 있습니다.  
③ **산업무역부에 등록한다고** 들었습니다. 가맹점을 언제부터 모집할지는 아직 정하지 않았습니다.  
④ **베트남 브랜드라 등록이 필요 없다고** 들었습니다. 가맹점 모집을 다음 달부터 시작하려고 합니다.  
⑤ **등록이 필요한지** 모르겠습니다. 가맹점을 언제부터 모집해야 할지도 아직 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fr_registry=rg_known`, `fr_recruit=rc_after` | 등록이 끝나야 해외 브랜드 가맹을 시작할 수 있으니 순서를 그대로 지키세요. |
| ② | `fr_registry=rg_unknown`, `fr_recruit=rc_started` | 등록 전에 모집을 시작하면 문제가 될 수 있으니 등록 기관부터 확인하고 서두르세요. |
| ③ | `fr_registry=rg_ministry`, `fr_recruit=rc_unsure` | 해외 브랜드는 산업무역부 등록 대상인 경우가 많으니 서류를 그 기준으로 준비하세요. |
| ④ | `fr_registry=rg_domestic`, `fr_recruit=rc_soon` | 베트남 안에서만 하는 가맹은 등록이 필요 없을 수 있지만 계약 조건은 법을 따라야 합니다. |
| ⑤ | `fr_registry=rg_unsure`, `fr_recruit=rc_unknown` | 브랜드가 어디서 시작했는지에 따라 등록 여부가 정해지니 그 기준부터 확인하세요. |

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
| ① | `fr_timeline=tl_urgent`, `fr_openPlan=op_date` | 한 달은 해외 서류 인증까지 빠듯하니 본사 서류를 바로 요청하세요. |
| ② | `fr_timeline=tl_2_3m`, `fr_openPlan=op_after_fitout` | 첫 가맹점 개점일을 기준으로 등록 일정을 거꾸로 계산해 두세요. |
| ③ | `fr_timeline=tl_flexible`, `fr_openPlan=op_after_permit` | 시간 여유가 있으니 상표 등록과 가맹 소개서를 먼저 완성하세요. |
| ④ | `fr_timeline=tl_unsure`, `fr_openPlan=op_unsure` | 가맹 사업 시작 시점을 정해야 등록과 모집 일정을 맞출 수 있습니다. |
| ⑤ | `fr_timeline=tl_already`, `fr_openPlan=op_running` | 등록 없이 가맹 사업을 하고 있다면 제재를 받을 수 있으니 바로 등록하세요. |

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
| ① | `fr_quoteStatus=quote_none`, `fr_quoteScope=qs_na` | 견적을 받기 전에 정부 비용, 서류 준비비, 대행료를 나누어 요청하세요. |
| ② | `fr_quoteStatus=quote_one`, `fr_quoteScope=qs_clear` | 항목이 나뉘어 있으니 등록 신청, 상표 등록, 계약서 검토가 각각 포함되는지 확인하세요. |
| ③ | `fr_quoteStatus=quote_several`, `fr_quoteScope=qs_mixed` | 업체마다 포함 항목이 다르므로 같은 기준표로 옮겨 적으면 비교가 쉬워집니다. |
| ④ | `fr_quoteStatus=quote_verbal`, `fr_quoteScope=qs_unknown` | 말로 들은 금액은 문서로 받아 포함 범위와 추가 비용 조건을 확인하세요. |
| ⑤ | `fr_quoteStatus=quote_ad`, `fr_quoteScope=qs_unknown` | 광고 가격은 기본 구성인 경우가 많으니 내 상황에서 더해지는 비용을 직접 물어보세요. |

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
| ① | `fr_nationality=nat_korea`, `fr_submitter=sub_self` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `fr_nationality=nat_china`, `fr_submitter=sub_staff` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `fr_nationality=nat_japan`, `fr_submitter=sub_agency` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `fr_nationality=nat_other_asia`, `fr_submitter=sub_undecided` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `fr_nationality=nat_other`, `fr_submitter=sub_self` | 국적에 따라 서류 인증 방법이 다를 수 있으니 본국 서류의 인증 절차를 먼저 확인하세요. |

### 2차 12번 — Q12

**가맹점에 어떤 지원을 할 계획이고, 가맹점 관리는 누가 맡을 예정인가요?**

① **교육과 매장 운영 지원**을 모두 하려고 합니다. 본사 직원이 베트남에 상주하며 가맹점을 관리합니다.  
② **초기 교육만** 제공하려고 합니다. 베트남 협력 회사에 가맹점 관리를 맡기려고 합니다.  
③ **원재료 공급까지** 함께 하려고 합니다. 본사에서 원격으로 가맹점을 관리할 예정입니다.  
④ **브랜드 사용권만** 주려고 합니다. 가맹점 관리를 누가 맡을지 아직 정하지 못했습니다.  
⑤ **어떤 지원을 할지** 아직 정하지 않았습니다. 마스터 가맹 회사가 관리를 맡을 예정입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fr_support=sp_full`, `fr_manager=mg_hq_resident` | 지원 내용을 계약서와 소개서에 똑같이 적어 두면 분쟁을 줄일 수 있습니다. |
| ② | `fr_support=sp_training`, `fr_manager=mg_partner` | 협력 회사에 맡기면 관리 권한과 책임 범위를 계약으로 정해 두세요. |
| ③ | `fr_support=sp_supply`, `fr_manager=mg_remote` | 원재료를 공급하면 수입·유통 허가가 따로 필요할 수 있으니 함께 확인하세요. |
| ④ | `fr_support=sp_brand_only`, `fr_manager=mg_unsure` | 브랜드만 빌려주는 방식이 가맹에 해당하는지 먼저 확인하는 것이 좋습니다. |
| ⑤ | `fr_support=sp_unsure`, `fr_manager=mg_master` | 지원 범위가 정해져야 가맹비와 계약서를 정할 수 있으니 운영 방식부터 정리하세요. |

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
| ① | `fr_area=area_hanoi`, `fr_agencyKnown=ag_known` | 온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요. |
| ② | `fr_area=area_hcm`, `fr_agencyKnown=ag_unknown` | 해외 브랜드 가맹 등록은 산업무역부가 받는 경우가 많으니 그 기준부터 확인하세요. |
| ③ | `fr_area=area_danang`, `fr_agencyKnown=ag_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `fr_area=area_other_city`, `fr_agencyKnown=ag_known` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `fr_area=area_ip`, `fr_agencyKnown=ag_unknown` | 산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `fr_mainConcern=concern_cost`, `fr_helpWanted=help_guide` | 총비용을 확인하고 서류는 직접 준비하려는 상황입니다 | 프랜차이즈 비용은 등록 신청, 해외 서류 인증·번역, 상표 등록, 계약서 검토, 대행료로 나뉩니다. 해외 브랜드인지에 따라 등록 여부가 달라지니 그 기준부터 확인하세요. |
| `fr_mainConcern=concern_docs`, `fr_helpWanted=help_guide` | 필요한 서류부터 확인해 직접 준비하려는 상황입니다 | 해외 브랜드를 베트남에 가맹으로 들여오면 등록이 필요하고, 등록 신청서, 가맹 소개서, 본사 사업자 서류, 상표 서류가 기본입니다. 베트남 안의 가맹은 등록이 필요 없을 수 있습니다. |
| `fr_mainConcern=concern_time`, `fr_helpWanted=help_accompany` | 허가 일정이 걱정되어 제출 동행을 원하는 상황입니다 | 서류가 갖춰지면 등록 처리는 빠른 편이지만, 본사 서류의 영사 인증과 상표 등록에 시간이 걸립니다. 인증과 상표부터 시작하세요. |
| `fr_mainConcern=concern_eligibility`, `fr_helpWanted=help_full` | 허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다 | 해외 브랜드 가맹은 직영 운영 이력 등 조건이 있어 운영 기간을 먼저 확인해야 합니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `fr_mainConcern=concern_quote`, `fr_helpWanted=help_accompany` | 받은 견적을 확인하고 제출은 함께 하려는 상황입니다 | 견적은 등록 신청, 상표 등록, 계약서 검토, 대행료가 각각 포함되는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 보입니다. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (registration) | `fr_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다 |
| 2 (nominee) | `fr_owner` ∈ {own_partner} | 현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다 |
| 3 (running) | `fr_timeline` ∈ {tl_already} | 허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다 |
| 4 (history) | `fr_history` ∈ {oh_under1y, oh_new, oh_unknown} | 가맹 사업은 일정 기간 이상 운영한 이력이 필요할 수 있어 운영 기간부터 확인해야 합니다 |
| 5 (trademark) | `fr_trademark` ∈ {tm_home_only, tm_none, tm_unknown} | 베트남에 상표가 등록되지 않으면 브랜드를 지키기 어려워 상표 출원을 먼저 하세요 |
| 6 (contract) | `fr_contract` ∈ {cm_none, cm_unknown} | 가맹계약서와 운영 매뉴얼이 없으면 등록과 모집이 어려워 먼저 만들어야 합니다 |
| 7 (recruit) | `fr_recruit` ∈ {rc_started} | 등록 전에 가맹점 모집을 시작했다면 문제가 될 수 있어 등록부터 서둘러야 합니다 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 등록 전에 브랜드명과 회사명이 서류마다 같은지 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 법인설립 확인 | `fr_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 아직이라면 법인설립 직접 인허가 받기에서 먼저 점검해 보실 수 있습니다. |
| 식당 허가 확인 | `fr_business` ∈ {bz_food} | 외식 브랜드라면 매장마다 식당 허가가 필요하니 식당 허가 직접 인허가 받기에서 함께 점검해 보실 수 있습니다. |
| 전문가 진행 | `fr_timeline` ∈ {tl_already, tl_urgent} 또는 `fr_recruit` ∈ {rc_started} 또는 `fr_helpWanted` ∈ {help_full} | 이미 모집을 시작했거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

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
| `bz_beauty` | 미용·뷰티 |
| `bz_education` | 교육·학원 |
| `bz_food` | 음식·음료 |
| `bz_retail` | 소매·편의점 |
| `bz_service` | 그 밖의 서비스 |
| `cm_contract_only` | 계약서만 있음 |
| `cm_draft` | 초안만 있음 |
| `cm_none` | 계약서·매뉴얼 없음 |
| `cm_ready` | 가맹계약서·운영 매뉴얼 준비 |
| `cm_unknown` | 필요한 서류를 모름 |
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
| `ds_draft` | 소개서 초안 |
| `ds_none` | 소개서 없음 |
| `ds_ready` | 가맹 소개서 준비 |
| `ds_translating` | 본사 소개서 번역 중 |
| `ds_unknown` | 소개서 필요 여부를 모름 |
| `fee_draft` | 가맹비 초안 |
| `fee_set` | 가맹비·로열티 확정 |
| `fee_unknown` | 가맹비 구조를 모름 |
| `help_accompany` | 서류 작성과 제출 동행을 원함 |
| `help_full` | 전 과정 대행을 원함 |
| `help_guide` | 서류 작성 안내를 원함 |
| `mg_hq_resident` | 본사 직원 상주 관리 |
| `mg_master` | 마스터 가맹사가 관리 |
| `mg_partner` | 협력 회사가 관리 |
| `mg_remote` | 본사 원격 관리 |
| `mg_unsure` | 관리 담당 미정 |
| `nat_china` | 중국 국적 |
| `nat_japan` | 일본 국적 |
| `nat_korea` | 대한민국 국적 |
| `nat_other` | 그 밖의 지역 국적 |
| `nat_other_asia` | 그 밖의 아시아 국적 |
| `oh_home_over1y` | 본국에서 1년 이상 운영 |
| `oh_new` | 아직 운영 전 |
| `oh_over1y` | 운영 1년 이상 |
| `oh_under1y` | 운영 1년 미만 |
| `oh_unknown` | 운영 기간을 모름 |
| `op_after_fitout` | 공사 후 영업 |
| `op_after_permit` | 허가 후 영업 |
| `op_date` | 영업 시작일 정해짐 |
| `op_running` | 허가 없이 영업 중 |
| `op_unsure` | 영업 시작일 미정 |
| `ou_many` | 여러 매장 운영 |
| `ou_none` | 운영 매장 없음 |
| `ou_one` | 매장 한 곳 운영 |
| `ou_popup` | 임시 매장만 운영 |
| `ou_unknown` | 매장 수를 모름 |
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
| `rc_after` | 등록 후 모집 |
| `rc_soon` | 다음 달 모집 시작 |
| `rc_started` | 모집 이미 시작 |
| `rc_unknown` | 모집 시기를 모름 |
| `rc_unsure` | 모집 시기 미정 |
| `reg_company_done` | 법인 등록 완료 |
| `reg_household_done` | 개인사업자 등록 완료 |
| `reg_in_progress` | 사업자 등록 진행 중 |
| `reg_not_started` | 사업자 등록 전 |
| `reg_unsure` | 등록 상태를 모름 |
| `rg_domestic` | 국내 브랜드라 등록 불필요로 앎 |
| `rg_known` | 등록 기관을 알고 있음 |
| `rg_ministry` | 산업무역부 등록으로 앎 |
| `rg_unknown` | 등록 기관을 모름 |
| `rg_unsure` | 등록 필요 여부를 모름 |
| `sp_brand_only` | 브랜드 사용권만 |
| `sp_full` | 교육·운영 지원 |
| `sp_supply` | 원재료 공급 지원 |
| `sp_training` | 초기 교육만 지원 |
| `sp_unsure` | 지원 내용 미정 |
| `st_change` | 등록 내용 변경 |
| `st_inbound` | 해외 브랜드를 베트남에 가맹 |
| `st_local_brand` | 베트남 브랜드 가맹 확장 |
| `st_master` | 베트남 마스터 가맹 계약 |
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
| `tm_applied_vn` | 베트남 상표 출원 중 |
| `tm_home_only` | 본국 상표만 등록 |
| `tm_none` | 상표 등록 안 함 |
| `tm_registered_vn` | 베트남 상표 등록 |
| `tm_unknown` | 상표 등록 상태를 모름 |
| `tn_needed` | 번역·인증 필요함 |
| `tn_none` | 번역 필요 없음 |
| `tn_unsure` | 번역 필요 여부 모름 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 프랜차이즈 시행령 (제35/2006/NĐ-CP호): 가맹 사업 조건(운영 1년 이상)과 해외 가맹 등록(산업무역부) | 베트남 정부 | 법령(해설 자료로 확인) | https://luatvietan.vn/nhuong-quyen-thuong-mai-nuoc-ngoai-tai-viet-nam.html | 2018년 개정(08/2018) 반영 여부와 조문 번호는 공식 원문 대조 필요 |
| 2 | 상법 (제36/2005/QH11호): 프랜차이즈 정의와 계약 | 베트남 국회 | 법령(이차 자료로 확인) | 원문 링크 확인 중 | 조문 번호는 공식 원문 대조 필요 |
