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

1. 전 과정 대행: `fs_timeline` ∈ {tl_urgent, tl_already} 또는 `fs_registration` ∈ {reg_not_started} 또는 `fs_situation` ∈ {sit_operating}
2. 작성과 제출 동행: `fs_submitter` ∈ {sub_undecided} 또는 `fs_agencyNeed` ∈ {an_office, an_changed, an_zone} 또는 `fs_situation` ∈ {sit_rejected} 또는 `fs_langRoute` ∈ {lr_none}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**소방을 준비하는 건물은 어떤 용도로 쓰이고, 가장 막막한 부분은 어디인가요?**

① **식당이나 카페를** 열려는 건물인데 손님이 오가는 곳이라 소방시설과 절차를 뭘 해야 하는지 감이 안 잡힙니다.  
② **사무실로 빌린 공간인데** 내부 공사를 하면서 건물 소방시설과 어디까지 맞춰야 하는지 모르겠습니다.  
③ **공장이나 창고인데** 물건을 만들고 보관하는 곳이라 소방 점검이 나오면 뭘 준비해야 하는지 몰라서 불안합니다.  
④ **다른 용도의 건물을 숙박 시설로** 바꾸려는데 용도가 바뀌면 소방 절차도 달라진다는데 어떻게 달라지는지 모르겠습니다.  
⑤ **제품을 파는 매장이나 쇼룸인데** 진열해 파는 공간에 어떤 소방 절차가 필요한지부터 모르겠습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fs_buildingUse=bt_restaurant`, `fs_useFocus=uf_customer` | 식당·카페에 필요한 소방시설과 절차를 확인하려는 상황입니다 |
| ② | `fs_buildingUse=bt_office`, `fs_useFocus=uf_fitout` | 사무실 내부 공사의 소방 기준을 확인하려는 상황입니다 |
| ③ | `fs_buildingUse=bt_factory`, `fs_useFocus=uf_inspection` | 공장·창고의 소방 점검 대비를 확인하려는 상황입니다 |
| ④ | `fs_buildingUse=bt_hotel`, `fs_useFocus=uf_change_use` | 숙박 시설로 바꿀 때의 소방 절차를 확인하려는 상황입니다 |
| ⑤ | `fs_buildingUse=bt_retail`, `fs_useFocus=uf_which` | 매장·쇼룸에 필요한 소방 절차의 종류를 확인하려는 상황입니다 |

### 1차 2번 — Q2

**사업자 등록은 지금 어떤 상황이고, 누구 이름으로 소방 승인를 받을 생각이신가요?**

① **법인 등록은 끝났습니다.** 투자한 우리 법인 이름으로 소방 승인를 받으려고 합니다.  
② **개인사업자로 등록했습니다.** 제 이름으로 낸 사업자 등록증이 있어서, 그 이름으로 소방 승인를 받으려고 합니다.  
③ **등록 절차가 아직 진행 중입니다.** 끝나는 대로 베트남 현지 법인 이름으로 소방 승인를 받을 예정입니다.  
④ **등록은 아직 시작도 못 했습니다.** 어떤 이름으로 해야 할지 몰라서, 주변에서 현지인 이름으로 하라는 말도 들었습니다.  
⑤ **지금 어떤 상태인지** 저도 잘 모르겠습니다. 누구 이름으로 소방 승인를 받아야 하는지도 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fs_registration=reg_company_done`, `fs_owner=own_fdi` | 외국인 투자 법인 등록을 마친 상황입니다 |
| ② | `fs_registration=reg_household_done`, `fs_owner=own_household` | 개인사업자 등록을 마친 상황입니다 |
| ③ | `fs_registration=reg_in_progress`, `fs_owner=own_local` | 현지 법인 등록이 진행 중인 상황입니다 |
| ④ | `fs_registration=reg_not_started`, `fs_owner=own_partner` | 사업자 등록 전이고 현지인 명의를 생각하는 상황입니다 |
| ⑤ | `fs_registration=reg_unsure`, `fs_owner=own_undecided` | 등록 상태와 운영 주체부터 확인해야 하는 상황입니다 |

### 1차 3번 — Q3

**소화기나 경보 같은 소방시설은 어디까지 갖추셨고, 공사 전에 소방 도면 검토는 받으셨나요?**

① **소방시설은 다 설치했습니다.** 공사 전에 소방 도면 검토를 받아 확인서를 가지고 있습니다.  
② **건물 공용 소방시설만 있습니다.** 우리 공간만의 소방 도면은 지금 만드는 중인데 이대로 되는지 불안합니다.  
③ **일부만 설치했습니다.** 규모가 작아서 도면 검토는 안 받아도 된다고 들었는데 맞는지 모르겠습니다.  
④ **아직 설치하지 못했습니다.** 도면 검토도 받지 않은 채 공사를 시작해서 문제가 되지 않을지 걱정됩니다.  
⑤ **뭐가 필요한지** 모르겠습니다. 소방 도면 검토를 받아야 하는 건물인지도 아무도 알려 주지 않았습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fs_facility=fire_installed`, `fs_design=ds_appraised` | 소방시설을 설치했고 설계 검토를 받은 상황입니다 |
| ② | `fs_facility=fire_building_has`, `fs_design=ds_designing` | 공용 소방시설만 있고 설계가 진행 중인 상황입니다 |
| ③ | `fs_facility=fire_partial`, `fs_design=ds_not_needed` | 일부 시설만 있고 설계 검토 대상이 아닌 상황입니다 |
| ④ | `fs_facility=fire_none`, `fs_design=ds_none` | 소방시설과 설계 검토가 모두 남은 상황입니다 |
| ⑤ | `fs_facility=fire_unknown`, `fs_design=ds_unknown` | 필요한 시설과 설계 검토 대상 여부를 확인할 상황입니다 |

### 1차 4번 — Q4

**소방을 책임질 담당자는 정하셨고, 불이 났을 때의 대피 계획 같은 건 준비하셨나요?**

① **소방 담당자를 정했습니다.** 그분이 소방 계획서와 대피 계획도 함께 만들어 두었습니다.  
② **담당자를 곧 정할 예정입니다.** 소방 계획서는 초안만 만들어 두었고 담당자가 정해지면 확정하려고 합니다.  
③ **소방 담당자가 따로 없습니다.** 그래서 소방 계획서나 대피 계획은 만들어 본 적이 없습니다.  
④ **담당자가 꼭 필요한지** 모르겠습니다. 건물 관리 회사가 만든 소방 계획서가 있는데 우리 공간에도 써도 되는지 궁금합니다.  
⑤ **담당자는 정했는데 교육은 못 받았습니다.** 교육 전이라 소방 계획서가 꼭 필요한지도 아직 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fs_manager=mg_appointed`, `fs_plan=pl_ready` | 담당자를 정하고 소방 계획서를 갖춘 상황입니다 |
| ② | `fs_manager=mg_planned`, `fs_plan=pl_draft` | 담당자 지정 전이고 계획서 초안만 있는 상황입니다 |
| ③ | `fs_manager=mg_none`, `fs_plan=pl_none` | 담당자와 소방 계획서가 모두 없는 상황입니다 |
| ④ | `fs_manager=mg_unknown`, `fs_plan=pl_building` | 담당자 필요 여부와 건물 계획서의 적용 범위를 확인할 상황입니다 |
| ⑤ | `fs_manager=mg_untrained`, `fs_plan=pl_unknown` | 담당자는 있지만 교육과 계획서가 남은 상황입니다 |

### 1차 5번 — Q5

**이 일을 하시면서 가장 답답하고 불안한 점은 무엇이고, 지금 어떤 상황인가요?**

① **어디서부터 시작해야 할지** 막막합니다. 검색도 해 봤는데 베트남어 자료라 어떤 말이 맞는지 모르겠습니다.  
② **일이 제대로 되고 있는지** 불안합니다. 베트남 지인이나 직원이 알아서 한다는데 어디까지 됐는지 알 수 없습니다.  
③ **사람마다 말이 달라** 혼란스럽습니다. 건물주, 업체, 지인이 각자 다르게 말해서 누구 말이 맞는지 모르겠습니다.  
④ **담당 기관에서 연락이 올까** 겁이 납니다. 운영을 이미 시작했는데 소방 확인을 아직 받지 못했습니다.  
⑤ **이미 한 번 막혀서** 지쳤습니다. 서류를 냈다가 보완하라고 돌려받은 적이 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `fs_feeling=fl_lost`, `fs_situation=sit_search_vn` | 어디서 시작할지 막막하고 베트남어 자료를 이해하기 어려운 상황입니다 |
| ② | `fs_feeling=fl_anxious`, `fs_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 알 수 없어 불안한 상황입니다 |
| ③ | `fs_feeling=fl_confused`, `fs_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 |
| ④ | `fs_feeling=fl_afraid`, `fs_situation=sit_operating` | 허가 확인 전에 시작해 불안한 상황입니다 |
| ⑤ | `fs_feeling=fl_tired`, `fs_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 |

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
| ① | `fs_docs=docs_all`, `fs_langRoute=lr_self` | 서류가 갖춰졌으니 도면의 소방시설 위치와 실제 설치 위치가 같은지만 확인하세요. |
| ② | `fs_docs=docs_most`, `fs_langRoute=lr_interp` | 남은 서류와 번역이 필요한 서류를 나누어 적고 인증에 걸리는 기간을 먼저 확인하세요. 통역한 내용이 서류 원문과 같은지 접수 전에 한 번 더 확인하세요. |
| ③ | `fs_docs=docs_half`, `fs_langRoute=lr_local` | 준비한 서류 목록을 만든 뒤 소방시설 목록과 설계 서류가 빠졌는지부터 확인하세요. 직원 설명은 서류 원문과 대조해 확인하세요. |
| ④ | `fs_docs=docs_little`, `fs_langRoute=lr_machine` | 건물 용도와 규모별로 필요한 소방 서류가 다르니 그 기준의 목록부터 받으세요. 인공지능 번역은 법률 용어와 숫자가 틀릴 수 있으니 중요한 서류는 전문가 확인을 받으세요. |
| ⑤ | `fs_docs=docs_unknown`, `fs_langRoute=lr_none` | 건물 용도와 면적, 층수를 먼저 정리하면 필요한 소방 서류가 정해집니다. 베트남어 서류를 읽어 줄 사람이나 전문 번역부터 정하세요. |

### 2차 7번 — Q7

**직원들은 소방 교육을 받았고, 불이 났을 때의 대피 훈련은 해 보셨나요?**

① **직원 소방 교육은 마쳤습니다.** 대피 훈련도 실제로 한 번 해 보고 기록을 남겼습니다.  
② **소방 교육은 받을 예정입니다.** 대피 훈련은 교육이 끝난 뒤에 직원들과 함께 해 볼 계획인데 일정은 못 잡았습니다.  
③ **소방 교육은 받은 적이 없습니다.** 대피 훈련도 아직 한 번도 해 보지 않았습니다.  
④ **교육이 필요한지** 몰랐습니다. 대피 훈련을 해야 하는 시설인지도 확인하지 못했습니다.  
⑤ **일부 직원만 교육을 받았습니다.** 건물 전체 대피 훈련에 참여해 본 적은 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fs_training=tr_done`, `fs_drill=dr_done` | 교육과 훈련 기록을 날짜별로 보관해 두면 점검 때 바로 보여 줄 수 있습니다. |
| ② | `fs_training=tr_planned`, `fs_drill=dr_planned` | 교육과 훈련 날짜를 정해 두고, 끝나면 참석자 기록을 남기세요. |
| ③ | `fs_training=tr_none`, `fs_drill=dr_none` | 직원이 많거나 손님이 오가는 시설은 교육과 훈련이 필요할 수 있으니 먼저 확인하세요. |
| ④ | `fs_training=tr_unknown`, `fs_drill=dr_unknown` | 시설 용도와 인원에 따라 교육·훈련 대상이 정해지니 그 기준부터 확인하세요. |
| ⑤ | `fs_training=tr_partial`, `fs_drill=dr_done` | 남은 직원의 교육 일정을 잡고, 건물 훈련 참여 기록을 함께 보관하세요. |

### 2차 8번 — Q8

**최근에 소방 점검을 받아 보셨고, 점검에서 고치라고 한 부분은 어떻게 되었나요?**

① **최근에 소방 점검을 받았습니다.** 지적받은 내용이 없어서 고칠 점은 없었는데 다음 점검 때 서류가 더 필요한지 궁금합니다.  
② **점검에서 지적을 받았습니다.** 아직 고치지 못했는데 다시 점검받기 전에 어떻게 해야 할지 막막합니다.  
③ **건물 전체 점검 때 같이 받았습니다.** 우리 공간만 따로 지적받은 내용이 있는지는 확인하지 못했습니다.  
④ **점검을 받은 적이 없습니다.** 처음 받기 전에 어떤 시설과 서류를 맞춰야 하는지 알고 싶습니다.  
⑤ **점검 이력을 모르겠습니다.** 예전 점검 기록이 남아 있는지 건물주에게 물어봐야 하는 상황입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fs_inspection=ck_recent`, `fs_fixStatus=fx_none` | 점검 결과서와 기록을 보관해 두면 다음 점검과 서류 제출 때 바로 쓸 수 있습니다. |
| ② | `fs_inspection=ck_failed`, `fs_fixStatus=fx_open` | 지적 사항을 먼저 고치고 고친 기록을 남긴 뒤 다시 점검을 받을 수 있는지 확인하세요. |
| ③ | `fs_inspection=ck_building`, `fs_fixStatus=fx_unknown` | 건물 점검 결과서에 우리 공간 내용이 있는지 건물주에게 받아 확인하세요. |
| ④ | `fs_inspection=ck_never`, `fs_fixStatus=fx_prepare` | 첫 점검 전에 소방시설 작동과 계획서, 교육 기록을 먼저 맞추세요. |
| ⑤ | `fs_inspection=ck_unknown`, `fs_fixStatus=fx_ask` | 건물주나 관리 회사에 이전 점검 기록이 있는지 먼저 물어보세요. |

### 2차 9번 — Q9

**허가는 언제까지 받아야 마음이 놓이고, 운영은 언제쯤 시작하고 싶으신가요?**

① **한 달 안에는** 받아야 합니다. 오픈 날짜를 이미 정해 놓아서 허가가 늦어지면 미루기 어렵습니다.  
② **두세 달 안에** 받으면 됩니다. 공사가 끝나는 날에 맞춰 운영을 시작하려고 합니다.  
③ **급하진 않습니다.** 서두르다 놓치는 게 없도록 허가가 나온 걸 확인한 뒤에 천천히 운영을 시작하고 싶습니다.  
④ **언제까지인지** 모르겠습니다. 허가가 언제까지 필요한지, 운영을 언제 시작할지도 아직 정하지 못했습니다.  
⑤ **이미 운영을 하고 있습니다.** 허가를 못 받은 채 먼저 시작했는데 문제가 되지 않을지 불안합니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fs_timeline=tl_urgent`, `fs_openPlan=op_date` | 한 달은 공사와 점검까지 빠듯하니 소방시설 설치와 서류를 바로 시작하세요. |
| ② | `fs_timeline=tl_2_3m`, `fs_openPlan=op_after_fitout` | 공사가 끝나는 날을 기준으로 소방 점검과 서류 일정을 거꾸로 계산해 두세요. |
| ③ | `fs_timeline=tl_flexible`, `fs_openPlan=op_after_permit` | 시간 여유가 있으니 설계 단계에서 소방 기준을 먼저 확인하고 공사를 진행하세요. |
| ④ | `fs_timeline=tl_unsure`, `fs_openPlan=op_unsure` | 운영 시작 시점을 정해야 공사와 소방 일정을 맞출 수 있습니다. |
| ⑤ | `fs_timeline=tl_already`, `fs_openPlan=op_running` | 소방 요건을 갖추지 않고 운영 중이라면 운영 중지 위험이 있으니 바로 점검하세요. |

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
| ① | `fs_askedWho=ask_agency_kr`, `fs_answerFeel=ans_unsure_trust` | 여러 곳의 설명이 다르면 같은 질문을 글로 정리해 보내고 답을 나란히 비교하세요. |
| ② | `fs_askedWho=ask_local`, `fs_answerFeel=ans_not_understood` | 현지 업체의 설명은 문서로 받아 통역이나 전문 번역으로 한 번 더 확인하세요. |
| ③ | `fs_askedWho=ask_acquaint`, `fs_answerFeel=ans_not_fit` | 경험담은 시기와 지역, 사업 형태가 같아야 참고가 되니 조건이 같은지 먼저 대조하세요. |
| ④ | `fs_askedWho=ask_authority`, `fs_answerFeel=ans_not_clear_vn` | 기관 안내는 받은 날짜와 담당 부서, 내용을 적어 두고 통역을 거쳐 다시 확인하세요. |
| ⑤ | `fs_askedWho=ask_nobody`, `fs_answerFeel=ans_unknown_who` | 먼저 지역의 담당 기관이 어디인지 확인하고 물어볼 내용을 정리해 두세요. |

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
| ① | `fs_submitter=sub_self`, `fs_submitNeed=sn_account` | 직접 제출한다면 온라인 접수 계정과 서명 방법을 미리 준비하세요. |
| ② | `fs_submitter=sub_staff`, `fs_submitNeed=sn_proxy` | 직원이 제출하면 위임장과 제출 후 연락 방법을 정해 두세요. |
| ③ | `fs_submitter=sub_agency`, `fs_submitNeed=sn_scope` | 대행사에 맡길 때는 맡기는 업무 범위와 서류 원본 보관 방식을 문서로 정하세요. |
| ④ | `fs_submitter=sub_undecided`, `fs_submitNeed=sn_compare` | 제출 방식을 정하려면 직접·직원·대행 세 가지의 비용과 일정을 비교해 보세요. |
| ⑤ | `fs_submitter=sub_self_lang`, `fs_submitNeed=sn_interpreter` | 직접 제출하되 베트남어가 어렵다면 제출하는 날 통역이 필요한 범위를 미리 정해 두세요. |

### 2차 12번 — Q12

**소방 책임은 건물주와 어떻게 나누기로 했고, 그 내용이 임대 계약서에 있는지 확인해 보셨나요?**

① **건물주가 소방을 다 맡기로 했습니다.** 계약서에도 그렇게 적혀 있는 걸 확인했습니다.  
② **우리가 소방을 맡기로 했습니다.** 계약서를 보니 소방 책임에 대한 내용이 따로 없어서 불안합니다.  
③ **건물주와 나누어 맡기로 했습니다.** 어느 부분을 누가 맡는지 문서로 정리해 두었습니다.  
④ **누가 맡는지 정하지 않았습니다.** 계약서가 베트남어라 소방 책임이 어떻게 적혀 있는지 제가 확인하지 못했습니다.  
⑤ **제가 소유한 건물이라** 직접 맡습니다. 남에게 빌린 건물이 아니라서 따로 계약서가 필요하지 않습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `fs_duty=ow_landlord`, `fs_leaseTerms=ct_written` | 건물주 담당이라도 우리 공간 안의 시설과 교육은 직접 챙겨야 하는지 확인하세요. |
| ② | `fs_duty=ow_tenant`, `fs_leaseTerms=ct_missing` | 말로 정한 책임은 나중에 다툼이 생길 수 있으니 계약서에 소방 책임을 적어 두세요. |
| ③ | `fs_duty=ow_shared`, `fs_leaseTerms=ct_written` | 나누어 맡는 부분을 도면에 표시해 두면 점검 때 설명하기 쉽습니다. |
| ④ | `fs_duty=ow_unknown`, `fs_leaseTerms=ct_unknown` | 계약 전에 소방 책임을 정하지 않으면 비용이 늘 수 있으니 건물주와 먼저 정하세요. |
| ⑤ | `fs_duty=ow_self`, `fs_leaseTerms=ct_na` | 소유 건물이면 소방 책임이 모두 소유자에게 있으니 시설과 서류를 직접 관리하세요. |

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
| ① | `fs_area=area_hanoi`, `fs_agencyNeed=an_online` | 온라인 접수 후 원본 제출이나 현장 확인이 필요한지만 한 번 더 확인하세요. |
| ② | `fs_area=area_hcm`, `fs_agencyNeed=an_office` | 소방 업무는 지역 공안의 소방 담당 부서가 맡는 경우가 많으니 그곳부터 확인하세요. |
| ③ | `fs_area=area_danang`, `fs_agencyNeed=an_changed` | 기관 통합으로 담당이 바뀌었을 수 있으니 접수 전에 해당 기관에 직접 확인하세요. |
| ④ | `fs_area=area_other_city`, `fs_agencyNeed=an_visit` | 지방은 접수 방식이 다를 수 있으니 방문 전에 접수 방법을 확인하세요. |
| ⑤ | `fs_area=area_ip`, `fs_agencyNeed=an_zone` | 산업단지 안이라면 관리 기관이 일부 허가를 맡는 경우가 있으니 그곳에 먼저 문의하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `fs_feeling=fl_lost`, `fs_situation=sit_search_vn` | 어디서부터 시작해야 할지 몰라 막막한 상황입니다 | 소방 서류는 건물 용도와 면적, 층수에 따라 달라지며, 소방시설 목록과 도면, 소방 계획서가 기본입니다. 2026.7.1부터 일부 절차가 바뀌었다는 보도가 있어 시점 기준 확인이 필요합니다. |
| `fs_feeling=fl_anxious`, `fs_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 몰라 불안한 상황입니다 | 설계 검토 대상이라면 공사 전에 검토를 받아야 하고, 공사가 끝난 뒤 시설 점검이 이어집니다. 공사 일정과 소방 일정을 함께 맞추세요. |
| `fs_feeling=fl_confused`, `fs_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 | 소방 절차 대상은 건물 용도와 규모, 손님 수에 따라 정해집니다. 2차 답변으로 상황을 더 정리한 뒤 전문가 확인으로 이어갈 수 있습니다. |
| `fs_feeling=fl_afraid`, `fs_situation=sit_operating` | 허가 확인 전에 시작해 불안한 상황입니다 | 소방 절차 과정에서는 담당 기관이 베트남어로 질문하고 보완을 요구할 수 있어, 내용을 이해하지 못한 채 답하면 처리가 길어질 수 있습니다. 접수 전에 통역과 전문가가 서류를 함께 점검하면 보완 요구를 줄일 수 있습니다. |
| `fs_feeling=fl_tired`, `fs_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 | 소방 절차 서류는 이름·번호·숫자가 서로 다르거나 빠진 서류가 있으면 접수가 보류되거나 보완 요구를 받을 수 있습니다. 접수 전에 전문가가 서류를 점검하고 제출하는 날 동행하면 되돌아오는 횟수를 줄일 수 있습니다. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (registration) | `fs_registration` ∈ {reg_not_started, reg_unsure} | 사업자 등록이 끝나지 않으면 허가를 신청할 수 없어 등록부터 마쳐야 합니다 |
| 2 (nominee) | `fs_owner` ∈ {own_partner} | 현지인 명의로 운영하면 나중에 권리 문제가 생길 수 있어 운영 주체를 신중히 정해야 합니다 |
| 3 (running) | `fs_timeline` ∈ {tl_already} | 허가 없이 먼저 영업하면 제재를 받을 수 있어 허가 신청을 바로 서둘러야 합니다 |
| 4 (language) | `fs_langRoute` ∈ {lr_local, lr_machine, lr_none} | 베트남어 서류를 정확히 이해하지 못한 채 진행하면 불리한 조건을 놓칠 수 있어 전문 통역이나 번역 확인이 필요합니다 |
| 5 (answer) | `fs_answerFeel` ∈ {ans_not_understood, ans_not_clear_vn} | 받은 안내를 정확히 이해하지 못한 채 진행하면 필요한 절차를 놓칠 수 있어 안내 내용을 문서로 다시 확인해야 합니다 |
| 6 (facility) | `fs_facility` ∈ {fire_partial, fire_none, fire_unknown} | 소방시설이 갖춰지지 않으면 점검에서 운영 중지 요구를 받을 수 있어 시설부터 갖춰야 합니다 |
| 7 (design) | `fs_design` ∈ {ds_none, ds_unknown} | 설계 검토 대상인데 검토 없이 공사하면 다시 고쳐야 할 수 있어 대상 여부부터 확인하세요 |
| 8 (plan) | `fs_plan` ∈ {pl_none, pl_unknown} | 소방 계획서와 대피 계획이 없으면 점검에서 지적받을 수 있어 먼저 만들어 두세요 |
| 9 (failed) | `fs_inspection` ∈ {ck_failed} | 이전 점검에서 지적받은 사항은 고친 기록이 있어야 하니 먼저 정리하세요 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 운영 전에 소방시설 작동과 서류를 한 번 더 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 식당 허가 확인 | `fs_buildingUse` ∈ {bt_restaurant} | 식당·카페라면 식당 허가 직접 인허가 받기에서 위생 준비도 함께 점검해 보실 수 있습니다. |
| 전문가 진행 | `fs_timeline` ∈ {tl_already, tl_urgent} 또는 `fs_situation` ∈ {sit_operating} | 점검에서 지적받았거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

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
| `bt_factory` | 공장·창고 |
| `bt_hotel` | 숙박 시설 |
| `bt_office` | 사무실 |
| `bt_restaurant` | 식당·카페 |
| `bt_retail` | 매장·쇼룸 |
| `ck_building` | 건물 전체 점검에 포함 |
| `ck_failed` | 점검에서 지적받음 |
| `ck_never` | 점검 받은 적 없음 |
| `ck_recent` | 최근 소방 점검 받음 |
| `ck_unknown` | 점검 이력을 모름 |
| `ct_missing` | undefined |
| `ct_na` | undefined |
| `ct_unknown` | undefined |
| `ct_written` | undefined |
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
| `fl_afraid` | 담당 기관 연락이 겁남 |
| `fl_anxious` | 진행 상황을 몰라 불안함 |
| `fl_confused` | 사람마다 말이 달라 혼란스러움 |
| `fl_lost` | 어디서 시작할지 막막함 |
| `fl_tired` | 한 번 막혀서 지침 |
| `fx_ask` | 이전 점검 기록 확인 |
| `fx_none` | 지적 사항 없음 |
| `fx_open` | 지적 사항 미조치 |
| `fx_prepare` | 첫 점검 준비 확인 |
| `fx_unknown` | 우리 공간 지적 여부 미확인 |
| `lr_interp` | 통역사·베트남어 하는 지인이 통역 |
| `lr_local` | 한국어 하는 베트남 직원이 설명 |
| `lr_machine` | 인공지능 번역기로 대략 이해 |
| `lr_none` | 베트남어를 몰라 내용을 알 수 없음 |
| `lr_self` | 베트남어를 직접 읽음 |
| `mg_appointed` | 소방 안전 담당자 지정 |
| `mg_none` | 담당자 없음 |
| `mg_planned` | 담당자 지정 예정 |
| `mg_unknown` | 담당자 필요 여부를 모름 |
| `mg_untrained` | undefined |
| `op_after_fitout` | 공사 후 영업 |
| `op_after_permit` | 허가 후 영업 |
| `op_date` | 영업 시작일 정해짐 |
| `op_running` | 허가 없이 영업 중 |
| `op_unsure` | 영업 시작일 미정 |
| `ow_landlord` | 건물주가 소방 담당 |
| `ow_self` | undefined |
| `ow_shared` | 건물주와 나누어 담당 |
| `ow_tenant` | 임차인이 소방 담당 |
| `ow_unknown` | 담당 구분을 모름 |
| `own_fdi` | 외국인 투자 법인 |
| `own_household` | 개인사업자 |
| `own_local` | 베트남 현지 법인 |
| `own_partner` | 현지인 명의로 운영 |
| `own_undecided` | 운영 주체 미정 |
| `pl_building` | 건물 관리 회사 계획서 사용 |
| `pl_draft` | 계획서 초안만 있음 |
| `pl_none` | 계획서 없음 |
| `pl_ready` | 소방 계획서·대피 계획 준비 |
| `pl_unknown` | 계획서 필요 여부를 모름 |
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
| `tr_done` | 직원 소방 교육 완료 |
| `tr_none` | 소방 교육 안 함 |
| `tr_partial` | undefined |
| `tr_planned` | 소방 교육 예정 |
| `tr_unknown` | 교육 필요 여부를 모름 |
| `uf_change_use` | 용도 변경 소방 절차 확인 |
| `uf_customer` | 손님이 오가는 매장의 소방 절차 확인 |
| `uf_fitout` | 임대 공간 내부 공사 기준 확인 |
| `uf_inspection` | 소방 점검 대비 확인 |
| `uf_which` | 필요한 소방 절차 종류 확인 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 소방·구조법 (제55/2024/QH15호)과 시행령 (제105/2025/NĐ-CP호) | 베트남 국회 / 정부 | 보도 기준 | https://luatvietan.vn/da-co-nghi-dinh-105-2025-huong-dan-luat-phong-chay-chua-chay-2024-moi.html | 건물 용도·규모별 대상은 원문 대조 필요 |
| 2 | 행정 절차 축소 정부 결의 (제66.18/2026/NQ-CP호): 2026.7.1부터 2027.2.28까지 한시 적용, 소방 준공 검사 등 3개 절차 폐지 보도 | 베트남 변호사협회 신문 | 참고 | https://lsvn.vn/bo-thu-tuc-nghiem-thu-phong-chay-chua-chay-tu-01-7-2026-a173592.html | 설계 심사는 폐지 대상이 아니며 대체 절차는 없고 건물주 책임으로 바뀐다는 보도임. 결의 발행일은 한 곳의 보도로만 확인했으므로 원문 대조 필요 |
| 3 | 소방 시행령 개정 (제347/2026/NĐ-CP호, 2026.9.8 공포, 2026.9.15 시행): 투자자는 건물을 사용하기 전에 소방 데이터베이스에 신고, 소방 설계 심사 의무는 유지 | 베트남 정부 | 보도 기준 | https://lsvn.vn/chu-dau-tu-phai-khai-bao-du-lieu-phong-chay-chua-chay-truoc-khi-dua-cong-trinh-vao-hoat-dong-a178875.html , https://dhtaxlaw.com.vn/nghi-dinh-347-2026-nd-cp-sua-doi-quy-dinh-pccc-khoa-hoc-va-an-ninh | 관할기관 완공검사 폐지 여부(시행령 105 제10조)는 확인 못함, 원문 대조 필요 |
