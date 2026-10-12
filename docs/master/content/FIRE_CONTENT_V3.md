# 소방 허가 직접 인허가 받기 콘텐츠 설계서

이 문서는 scripts/fire-content-spec.mjs 에서 자동 생성된다. 직접 고치지 않는다. 확인일 2026.10.12.

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
| fire_installed | key: secured |
| fire_building_has | key: 비어 있음(추가 확인 필요) |
| fire_partial | key: unsecured |
| fire_none | key: unsecured |
| fire_unknown | key: 비어 있음(추가 확인 필요) |

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

1. 전 과정 대행: `fs_helpWanted` ∈ {help_full} 또는 `fs_timeline` ∈ {tl_urgent, tl_already} 또는 `fs_registration` ∈ {reg_not_started} 또는 `fs_inspection` ∈ {ck_failed}
2. 작성과 제출 동행: `fs_helpWanted` ∈ {help_accompany} 또는 `fs_submitter` ∈ {sub_undecided} 또는 `fs_agencyKnown` ∈ {ag_unknown, ag_changed}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**소방과 관련해 어떤 절차가 필요하고, 건물은 어떤 용도로 쓰이나요?**

① **새 건물이나 매장을** 짓고 있습니다. 손님이 오가는 식당이나 카페로 쓰려고 합니다.  
② **빌린 공간의 내부 공사**를 하고 있습니다. 직원들이 일하는 사무실로 쓰려고 합니다.  
③ **운영 중인 시설의 점검**에 대비하려고 합니다. 물건을 만들거나 보관하는 공장이나 창고입니다.  
④ **건물의 용도를 바꾸려고** 합니다. 손님이 잠을 자고 머무는 숙박 시설로 바꾸려고 합니다.  
⑤ **어떤 절차가 필요한지** 모르겠습니다. 제품을 진열해서 파는 매장이나 쇼룸으로 쓰려고 합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fs_stage=st_new_build`, `fs_buildingUse=bt_restaurant` | 새 식당·카페 공사로 소방 준비가 필요한 상황입니다 |
| ② | `fs_stage=st_fitout`, `fs_buildingUse=bt_office` | 임대 사무실 내부 공사로 소방 준비가 필요한 상황입니다 |
| ③ | `fs_stage=st_operating`, `fs_buildingUse=bt_factory` | 운영 중인 공장·창고의 소방 점검에 대비하는 상황입니다 |
| ④ | `fs_stage=st_change_use`, `fs_buildingUse=bt_hotel` | 숙박 시설로 용도를 바꾸려는 상황입니다 |
| ⑤ | `fs_stage=st_unsure`, `fs_buildingUse=bt_retail` | 매장·쇼룸에 필요한 소방 절차부터 확인할 상황입니다 |

### 1차 2번 — Q2

**사업자 등록은 어디까지 진행되었고, 누구 이름으로 소방 절차를 진행하실 예정인가요?**

① **법인 등록을 이미** 마쳤습니다. 외국인이 투자한 법인 이름으로 허가를 받으려고 합니다.  
② **개인사업자 등록을** 마쳤습니다. 규모가 작아서 개인사업자로 허가를 받으려고 합니다.  
③ **사업자 등록을 진행하고** 있습니다. 베트남 현지 법인 이름으로 허가를 받을 예정입니다.  
④ **사업자 등록을 아직** 시작하지 않았습니다. 베트남 사람 이름으로 등록해서 운영하려고 생각하고 있습니다.  
⑤ **등록 상태를 정확히** 모르겠습니다. 누구 이름으로 허가를 받아야 하는지도 아직 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fs_registration=reg_company_done`, `fs_owner=own_fdi` | 외국인 투자 법인 등록을 마친 상황입니다 |
| ② | `fs_registration=reg_household_done`, `fs_owner=own_household` | 개인사업자 등록을 마친 상황입니다 |
| ③ | `fs_registration=reg_in_progress`, `fs_owner=own_local` | 현지 법인 등록이 진행 중인 상황입니다 |
| ④ | `fs_registration=reg_not_started`, `fs_owner=own_partner` | 사업자 등록 전이고 현지인 명의를 생각하는 상황입니다 |
| ⑤ | `fs_registration=reg_unsure`, `fs_owner=own_undecided` | 등록 상태와 운영 주체부터 확인해야 하는 상황입니다 |

### 1차 3번 — Q3

**소화기·경보·스프링클러 같은 소방시설은 갖추었고, 소방 설계 검토는 받았나요?**

① **소방시설을 모두** 설치했습니다. 공사 전에 소방 설계 검토를 받아 확인서를 가지고 있습니다.  
② **건물의 공용 소방시설만** 있습니다. 우리 공간만의 소방 설계는 지금 진행하고 있습니다.  
③ **일부 소방시설만** 설치했습니다. 규모가 작아서 설계 검토 대상이 아니라고 들었습니다.  
④ **소방시설을 아직** 설치하지 않았습니다. 소방 설계 검토도 받지 않은 채 공사를 시작했습니다.  
⑤ **어떤 소방시설이 필요한지** 모르겠습니다. 설계 검토를 받아야 하는 대상인지도 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fs_facility=fire_installed`, `fs_design=ds_appraised` | 소방시설을 설치했고 설계 검토를 받은 상황입니다 |
| ② | `fs_facility=fire_building_has`, `fs_design=ds_designing` | 공용 소방시설만 있고 설계가 진행 중인 상황입니다 |
| ③ | `fs_facility=fire_partial`, `fs_design=ds_not_needed` | 일부 시설만 있고 설계 검토 대상이 아닌 상황입니다 |
| ④ | `fs_facility=fire_none`, `fs_design=ds_none` | 소방시설과 설계 검토가 모두 남은 상황입니다 |
| ⑤ | `fs_facility=fire_unknown`, `fs_design=ds_unknown` | 필요한 시설과 설계 검토 대상 여부를 확인할 상황입니다 |

### 1차 4번 — Q4

**소방 안전 담당자는 정했고, 소방 계획서와 대피 계획은 준비되었나요?**

① **소방 안전 담당자를** 정했습니다. 소방 계획서와 대피 계획을 모두 만들어 두었습니다.  
② **담당자를 곧** 정할 예정입니다. 소방 계획서는 초안만 만들어 두고 확정하지 않았습니다.  
③ **소방 담당자가 따로** 없습니다. 소방 계획서나 대피 계획을 만들어 본 적이 없습니다.  
④ **담당자가 필요한지** 모르겠습니다. 소방 계획서는 건물 관리 회사에서 받은 것을 쓰고 있습니다.  
⑤ **담당자를 정했지만** 교육은 받지 않았습니다. 소방 계획서가 꼭 있어야 하는지 잘 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fs_manager=mg_appointed`, `fs_plan=pl_ready` | 담당자를 정하고 소방 계획서를 갖춘 상황입니다 |
| ② | `fs_manager=mg_planned`, `fs_plan=pl_draft` | 담당자 지정 전이고 계획서 초안만 있는 상황입니다 |
| ③ | `fs_manager=mg_none`, `fs_plan=pl_none` | 담당자와 소방 계획서가 모두 없는 상황입니다 |
| ④ | `fs_manager=mg_unknown`, `fs_plan=pl_draft` | 담당자 필요 여부를 확인하고 계획서를 보완할 상황입니다 |
| ⑤ | `fs_manager=mg_untrained`, `fs_plan=pl_unknown` | 담당자는 있지만 교육과 계획서가 남은 상황입니다 |

### 1차 5번 — Q5

**지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?**

① **총비용이 얼마인지** 걱정됩니다. 필요한 서류는 제가 만들 수 있도록 안내만 받고 싶습니다.  
② **필요한 서류가 무엇인지** 모르겠습니다. 서류 작성 방법을 하나씩 알려 주면 직접 준비하겠습니다.  
③ **허가가 언제 나올지** 걱정됩니다. 제출하는 날 담당 기관에 통역과 함께 가고 싶습니다.  
④ **우리 시설이 소방 절차 대상인지** 모르겠습니다. 서류 준비부터 제출과 수령까지 모두 맡기고 싶습니다.  
⑤ **받은 견적이 적정한지** 모르겠습니다. 서류는 제가 준비하고 제출할 때만 함께 가고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fs_mainConcern=concern_cost`, `fs_helpWanted=help_guide` | 총비용을 알고 직접 서류를 준비하려는 상황입니다 |
| ② | `fs_mainConcern=concern_docs`, `fs_helpWanted=help_guide` | 필요한 서류부터 알고 싶은 상황입니다 |
| ③ | `fs_mainConcern=concern_time`, `fs_helpWanted=help_accompany` | 허가 일정이 걱정되어 제출 동행을 원하는 상황입니다 |
| ④ | `fs_mainConcern=concern_eligibility`, `fs_helpWanted=help_full` | 허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다 |
| ⑤ | `fs_mainConcern=concern_quote`, `fs_helpWanted=help_accompany` | 받은 견적이 적정한지 확인하려는 상황입니다 |

### 2차 6번 — Q6

**허가 신청 서류는 어디까지 준비되었고, 번역이나 인증이 필요한 서류가 있나요?**

① **사업자 등록증, 건물 서류, 소방시설 도면과 목록을 모두** 준비했습니다. 모든 서류의 베트남어 번역도 이미 끝냈습니다.  
② **대부분 준비**했고 몇 가지만 남았습니다. 해외에서 받은 서류는 번역과 영사 인증이 필요합니다.  
③ **절반쯤 준비**했습니다. 베트남어 번역이 필요한 서류가 있는지 몰라서 확인이 필요합니다.  
④ **거의 준비하지 못했습니다.** 번역과 인증을 어디서 어떻게 하는지도 함께 알고 싶습니다.  
⑤ **무엇이 필요한지 아직 모릅니다.** 준비한 서류가 없어서 번역할 서류도 아직 없는 상태입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fs_docs=docs_all`, `fs_translation=tn_none` | 서류가 갖춰졌으니 도면의 소방시설 위치와 실제 설치 위치가 같은지만 확인하세요. |
| ② | `fs_docs=docs_most`, `fs_translation=tn_needed` | 남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요. |
| ③ | `fs_docs=docs_half`, `fs_translation=tn_unsure` | 준비한 서류 목록을 만든 뒤 소방시설 목록과 설계 서류가 빠졌는지부터 확인하세요. |
| ④ | `fs_docs=docs_little`, `fs_translation=tn_needed` | 건물 용도와 규모별로 필요한 소방 서류가 다르니 그 기준의 목록부터 받으세요. |
| ⑤ | `fs_docs=docs_unknown`, `fs_translation=tn_none` | 건물 용도와 면적, 층수를 먼저 정리하면 필요한 소방 서류가 정해집니다. |

### 2차 7번 — Q7

**직원들은 소방 교육을 받았고, 대피 훈련은 해 보셨나요?**

① **직원 소방 교육을** 마쳤습니다. 대피 훈련도 실제로 한 번 해 보고 기록을 남겼습니다.  
② **소방 교육을 받을** 예정입니다. 대피 훈련은 소방 교육이 끝난 뒤에 해 볼 계획입니다.  
③ **소방 교육을 받은 적이** 없습니다. 대피 훈련도 아직 한 번도 해 보지 않았습니다.  
④ **교육이 필요한지** 모르겠습니다. 대피 훈련을 해야 하는 시설인지도 확인하지 못했습니다.  
⑤ **일부 직원만 교육을** 받았습니다. 대피 훈련은 건물 전체 훈련에 참여해 본 적이 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fs_training=tr_done`, `fs_drill=dr_done` | 교육과 훈련 기록을 날짜별로 보관해 두면 점검 때 바로 보여 줄 수 있습니다. |
| ② | `fs_training=tr_planned`, `fs_drill=dr_planned` | 교육과 훈련 날짜를 정해 두고, 끝나면 참석자 기록을 남기세요. |
| ③ | `fs_training=tr_none`, `fs_drill=dr_none` | 직원이 많거나 손님이 오가는 시설은 교육과 훈련이 필요할 수 있으니 먼저 확인하세요. |
| ④ | `fs_training=tr_unknown`, `fs_drill=dr_unknown` | 시설 용도와 인원에 따라 교육·훈련 대상이 정해지니 그 기준부터 확인하세요. |
| ⑤ | `fs_training=tr_partial`, `fs_drill=dr_done` | 남은 직원의 교육 일정을 잡고, 건물 훈련 참여 기록을 함께 보관하세요. |

### 2차 8번 — Q8

**화재 보험은 가입했고, 최근에 소방 점검을 받은 적이 있나요?**

① **화재 보험에 가입**했습니다. 최근에 소방 점검을 받았고 고칠 점은 지적받지 않았습니다.  
② **화재 보험에 가입할** 예정입니다. 소방 점검을 받아 본 적은 아직 한 번도 없습니다.  
③ **화재 보험이 없습니다.** 지난 소방 점검에서 고쳐야 할 점을 지적받은 적이 있습니다.  
④ **보험이 의무인지** 모르겠습니다. 예전에 점검을 받았는지 기록이 남아 있지 않습니다.  
⑤ **건물 보험에 함께** 들어가 있다고 들었습니다. 올해 건물 전체 점검 때 함께 확인을 받았습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fs_insurance=in_have`, `fs_inspection=ck_recent` | 보험 증서와 점검 기록을 함께 보관해 두면 다음 점검 준비가 쉬워집니다. |
| ② | `fs_insurance=in_planned`, `fs_inspection=ck_never` | 보험 가입 의무 대상인지 확인하고, 첫 점검 전에 시설과 서류를 먼저 맞추세요. |
| ③ | `fs_insurance=in_none`, `fs_inspection=ck_failed` | 지적 사항을 먼저 고치고 고친 기록을 남긴 뒤, 보험 의무 여부도 함께 확인하세요. |
| ④ | `fs_insurance=in_unknown`, `fs_inspection=ck_unknown` | 시설 용도에 따라 화재 보험이 의무일 수 있으니 확인하고, 점검 이력을 건물주에게 물어보세요. |
| ⑤ | `fs_insurance=in_building`, `fs_inspection=ck_recent` | 건물 보험이 우리 공간까지 보장하는지 확인하고 점검 기록은 그대로 보관하세요. |

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
| ① | `fs_timeline=tl_urgent`, `fs_openPlan=op_date` | 한 달은 공사와 점검까지 빠듯하니 소방시설 설치와 서류를 바로 시작하세요. |
| ② | `fs_timeline=tl_2_3m`, `fs_openPlan=op_after_fitout` | 공사가 끝나는 날을 기준으로 소방 점검과 서류 일정을 거꾸로 계산해 두세요. |
| ③ | `fs_timeline=tl_flexible`, `fs_openPlan=op_after_permit` | 시간 여유가 있으니 설계 단계에서 소방 기준을 먼저 확인하고 공사를 진행하세요. |
| ④ | `fs_timeline=tl_unsure`, `fs_openPlan=op_unsure` | 운영 시작 시점을 정해야 공사와 소방 일정을 맞출 수 있습니다. |
| ⑤ | `fs_timeline=tl_already`, `fs_openPlan=op_running` | 소방 요건을 갖추지 않고 운영 중이라면 운영 중지 위험이 있으니 바로 점검하세요. |

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
| ① | `fs_quoteStatus=quote_none`, `fs_quoteScope=qs_na` | 견적을 받기 전에 정부 비용, 서류 준비비, 대행료를 나누어 요청하세요. |
| ② | `fs_quoteStatus=quote_one`, `fs_quoteScope=qs_clear` | 항목이 나뉘어 있으니 설계 검토, 시설 설치, 점검 대응이 각각 포함되는지 확인하세요. |
| ③ | `fs_quoteStatus=quote_several`, `fs_quoteScope=qs_mixed` | 업체마다 포함 항목이 다르므로 같은 기준표로 옮겨 적으면 비교가 쉬워집니다. |
| ④ | `fs_quoteStatus=quote_verbal`, `fs_quoteScope=qs_unknown` | 말로 들은 금액은 문서로 받아 포함 범위와 추가 비용 조건을 확인하세요. |
| ⑤ | `fs_quoteStatus=quote_ad`, `fs_quoteScope=qs_unknown` | 광고 가격은 기본 구성인 경우가 많으니 내 상황에서 더해지는 비용을 직접 물어보세요. |

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
| ① | `fs_nationality=nat_korea`, `fs_submitter=sub_self` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `fs_nationality=nat_china`, `fs_submitter=sub_staff` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `fs_nationality=nat_japan`, `fs_submitter=sub_agency` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `fs_nationality=nat_other_asia`, `fs_submitter=sub_undecided` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `fs_nationality=nat_other`, `fs_submitter=sub_self` | 국적에 따라 서류 인증 방법이 다를 수 있으니 본국 서류의 인증 절차를 먼저 확인하세요. |

### 2차 12번 — Q12

**소방 책임은 건물주와 어떻게 나누기로 했고, 임대차 계약서에 적혀 있나요?**

① **건물주가 소방을** 모두 맡기로 했습니다. 임대차 계약서에 소방 책임이 분명하게 적혀 있습니다.  
② **우리 회사가 소방을** 맡기로 했습니다. 계약서에는 소방 책임이 따로 적혀 있지 않습니다.  
③ **건물주와 나누어** 맡기로 했습니다. 어느 부분을 누가 맡는지 문서로 정리해 두었습니다.  
④ **누가 맡는지** 정하지 않았습니다. 임대차 계약서를 다시 확인해 봐야 할 것 같습니다.  
⑤ **제가 소유한 건물**이라 직접 맡습니다. 남에게 빌린 건물이 아니라서 따로 계약서가 필요하지 않습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fs_duty=ow_landlord`, `fs_leaseTerms=ct_written` | 건물주 담당이라도 우리 공간 안의 시설과 교육은 직접 챙겨야 하는지 확인하세요. |
| ② | `fs_duty=ow_tenant`, `fs_leaseTerms=ct_missing` | 말로 정한 책임은 나중에 다툼이 생길 수 있으니 계약서에 소방 책임을 적어 두세요. |
| ③ | `fs_duty=ow_shared`, `fs_leaseTerms=ct_written` | 나누어 맡는 부분을 도면에 표시해 두면 점검 때 설명하기 쉽습니다. |
| ④ | `fs_duty=ow_unknown`, `fs_leaseTerms=ct_unknown` | 계약 전에 소방 책임을 정하지 않으면 비용이 늘 수 있으니 건물주와 먼저 정하세요. |
| ⑤ | `fs_duty=ow_self`, `fs_leaseTerms=ct_na` | 소유 건물이면 소방 책임이 모두 소유자에게 있으니 시설과 서류를 직접 관리하세요. |

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
| ① | `fs_area=area_hanoi`, `fs_agencyKnown=ag_known` | 온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요. |
| ② | `fs_area=area_hcm`, `fs_agencyKnown=ag_unknown` | 소방 업무는 지역 공안의 소방 담당 부서가 맡는 경우가 많으니 그곳부터 확인하세요. |
| ③ | `fs_area=area_danang`, `fs_agencyKnown=ag_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `fs_area=area_other_city`, `fs_agencyKnown=ag_known` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `fs_area=area_ip`, `fs_agencyKnown=ag_unknown` | 산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `fs_mainConcern=concern_cost`, `fs_helpWanted=help_guide` | 총비용을 확인하고 서류는 직접 준비하려는 상황입니다 | 소방 비용은 설계 검토, 소방시설 설치, 교육과 점검 대응, 대행료로 나뉩니다. 건물 용도와 규모에 따라 필요한 시설이 달라지니 그 기준부터 확인하세요. |
| `fs_mainConcern=concern_docs`, `fs_helpWanted=help_guide` | 필요한 서류부터 확인해 직접 준비하려는 상황입니다 | 소방 서류는 건물 용도와 면적, 층수에 따라 달라지며, 소방시설 목록과 도면, 소방 계획서가 기본입니다. 2026.7.1부터 일부 절차가 바뀌었다는 보도가 있어 시점 기준 확인이 필요합니다. |
| `fs_mainConcern=concern_time`, `fs_helpWanted=help_accompany` | 허가 일정이 걱정되어 제출 동행을 원하는 상황입니다 | 설계 검토 대상이라면 공사 전에 검토를 받아야 하고, 공사가 끝난 뒤 시설 점검이 이어집니다. 공사 일정과 소방 일정을 함께 맞추세요. |
| `fs_mainConcern=concern_eligibility`, `fs_helpWanted=help_full` | 허가 대상인지 걱정되어 전 과정을 맡기려는 상황입니다 | 소방 절차 대상은 건물 용도와 규모, 손님 수에 따라 정해집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `fs_mainConcern=concern_quote`, `fs_helpWanted=help_accompany` | 받은 견적을 확인하고 제출은 함께 하려는 상황입니다 | 견적은 설계 검토, 시설 설치, 점검 대응, 대행료가 각각 포함되는지 먼저 비교해야 합니다. 같은 항목끼리 맞춰 보면 금액 차이가 보입니다. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (registration) | `fs_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다 |
| 2 (nominee) | `fs_owner` ∈ {own_partner} | 현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다 |
| 3 (running) | `fs_timeline` ∈ {tl_already} | 허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다 |
| 4 (facility) | `fs_facility` ∈ {fire_partial, fire_none, fire_unknown} | 소방시설이 갖춰지지 않으면 점검에서 운영 중지 요구를 받을 수 있어 시설부터 갖춰야 합니다 |
| 5 (design) | `fs_design` ∈ {ds_none, ds_unknown} | 설계 검토 대상인데 검토 없이 공사하면 다시 고쳐야 할 수 있어 대상 여부부터 확인하세요 |
| 6 (plan) | `fs_plan` ∈ {pl_none, pl_unknown} | 소방 계획서와 대피 계획이 없으면 점검에서 지적받을 수 있어 먼저 만들어 두세요 |
| 7 (failed) | `fs_inspection` ∈ {ck_failed} | 이전 점검에서 지적받은 사항은 고친 기록이 있어야 하니 먼저 정리하세요 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 운영 전에 소방시설 작동과 서류를 한 번 더 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 식당 허가 확인 | `fs_buildingUse` ∈ {bt_restaurant} | 식당·카페라면 식당 허가 직접 인허가 받기에서 위생 준비도 함께 점검해 보실 수 있습니다. |
| 전문가 진행 | `fs_timeline` ∈ {tl_already, tl_urgent} 또는 `fs_inspection` ∈ {ck_failed} 또는 `fs_helpWanted` ∈ {help_full} | 점검에서 지적받았거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

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
| `bt_factory` | 공장·창고 |
| `bt_hotel` | 숙박 시설 |
| `bt_office` | 사무실 |
| `bt_restaurant` | 식당·카페 |
| `bt_retail` | 매장·쇼룸 |
| `ck_failed` | 점검에서 지적받음 |
| `ck_never` | 점검 받은 적 없음 |
| `ck_recent` | 최근 소방 점검 받음 |
| `ck_unknown` | 점검 이력을 모름 |
| `concern_cost` | 총비용 걱정 |
| `concern_docs` | 필요 서류 걱정 |
| `concern_eligibility` | 허가 대상 여부 걱정 |
| `concern_quote` | 받은 견적의 적정성 걱정 |
| `concern_time` | 허가 일정 걱정 |
| `ct_missing` | 계약서에 책임 없음 |
| `ct_na` | 계약서 불필요 |
| `ct_unknown` | 계약 내용을 모름 |
| `ct_written` | 계약서에 책임 명시 |
| `docs_all` | 기본 서류 모두 준비 |
| `docs_half` | 기본 서류 절반 준비 |
| `docs_little` | 기본 서류 거의 미준비 |
| `docs_most` | 기본 서류 대부분 준비 |
| `docs_unknown` | 필요 서류를 모름 |
| `dr_done` | 대피 훈련 실시 |
| `dr_none` | 대피 훈련 안 함 |
| `dr_planned` | 대피 훈련 예정 |
| `dr_unknown` | 훈련 필요 여부를 모름 |
| `ds_appraised` | 소방 설계 검토 받음 |
| `ds_designing` | 설계 진행 중 |
| `ds_none` | 설계 검토 안 받음 |
| `ds_not_needed` | 설계 검토 대상 아님 |
| `ds_unknown` | 설계 검토 필요 여부를 모름 |
| `fire_building_has` | 건물 공용 소방시설만 있음 |
| `fire_installed` | 소방시설 설치 완료 |
| `fire_none` | 소방시설 설치 전 |
| `fire_partial` | 일부 소방시설만 설치 |
| `fire_unknown` | 필요한 소방시설을 모름 |
| `help_accompany` | 서류 작성과 제출 동행을 원함 |
| `help_full` | 전 과정 대행을 원함 |
| `help_guide` | 서류 작성 안내를 원함 |
| `in_building` | 건물 보험에 포함 |
| `in_have` | 화재 보험 가입 |
| `in_none` | 보험 없음 |
| `in_planned` | 보험 가입 예정 |
| `in_unknown` | 보험 의무 여부를 모름 |
| `mg_appointed` | 소방 안전 담당자 지정 |
| `mg_none` | 담당자 없음 |
| `mg_planned` | 담당자 지정 예정 |
| `mg_unknown` | 담당자 필요 여부를 모름 |
| `mg_untrained` | 담당자 지정, 교육 전 |
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
| `ow_landlord` | 건물주가 소방 담당 |
| `ow_self` | 소유 건물이라 직접 담당 |
| `ow_shared` | 건물주와 나누어 담당 |
| `ow_tenant` | 임차인이 소방 담당 |
| `ow_unknown` | 담당 구분을 모름 |
| `own_fdi` | 외국인 투자 법인 |
| `own_household` | 개인사업자 |
| `own_local` | 베트남 현지 법인 |
| `own_partner` | 현지인 명의로 운영 |
| `own_undecided` | 운영 주체 미정 |
| `pl_draft` | 계획서 초안만 있음 |
| `pl_none` | 계획서 없음 |
| `pl_ready` | 소방 계획서·대피 계획 준비 |
| `pl_unknown` | 계획서 필요 여부를 모름 |
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
| `st_change_use` | 용도 변경 |
| `st_fitout` | 임대 공간 내부 공사 |
| `st_new_build` | 새 건물·매장 공사 |
| `st_operating` | 운영 중 점검 대비 |
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
| `tr_done` | 직원 소방 교육 완료 |
| `tr_none` | 소방 교육 안 함 |
| `tr_partial` | 일부 직원만 교육 |
| `tr_planned` | 소방 교육 예정 |
| `tr_unknown` | 교육 필요 여부를 모름 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 소방·구조법 (제55/2024/QH15호)과 시행령 (제105/2025/NĐ-CP호) | 베트남 국회 / 정부 | 보도 기준 | https://luatvietan.vn/da-co-nghi-dinh-105-2025-huong-dan-luat-phong-chay-chua-chay-2024-moi.html | 건물 용도·규모별 대상은 원문 대조 필요 |
| 2 | 행정 절차 축소 정부 결의 (제66.18/2026/NQ-CP호): 2026.7.1부터 2027.2.28까지 한시 적용, 소방 준공 검사 등 3개 절차 폐지 보도 | 베트남 변호사협회 신문 | 참고 | https://lsvn.vn/bo-thu-tuc-nghiem-thu-phong-chay-chua-chay-tu-01-7-2026-a173592.html | 설계 심사는 폐지 대상이 아니며 대체 절차는 없고 건물주 책임으로 바뀐다는 보도임. 결의 발행일은 한 곳의 보도로만 확인했으므로 원문 대조 필요 |
| 3 | 소방 시행령 개정 (제347/2026/NĐ-CP호, 2026.9.8 공포, 2026.9.15 시행): 투자자는 건물을 사용하기 전에 소방 데이터베이스에 신고, 소방 설계 심사 의무는 유지 | 베트남 정부 | 보도 기준 | https://lsvn.vn/chu-dau-tu-phai-khai-bao-du-lieu-phong-chay-chua-chay-truoc-khi-dua-cong-trinh-vao-hoat-dong-a178875.html , https://dhtaxlaw.com.vn/nghi-dinh-347-2026-nd-cp-sua-doi-quy-dinh-pccc-khoa-hoc-va-an-ninh | 관할기관 완공검사 폐지 여부(시행령 105 제10조)는 확인 못함, 원문 대조 필요 |
