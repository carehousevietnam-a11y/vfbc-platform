# 운전면허 전환 직접 확인하기 콘텐츠 설계서

이 문서는 scripts/license-content-spec.mjs 에서 자동 생성된다. 직접 고치지 않는다. 확인일 2026.10.12.

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
| res_trc_long | trc: yes |
| res_trc_short | trc: no |
| res_visa_only | trc: no |
| res_applying | trc: 비어 있음(추가 확인 필요) |
| res_unsure | trc: 비어 있음(추가 확인 필요) |
| hl_valid_long | license: yes |
| hl_valid_short | license: yes |
| hl_intl_only | license: no |
| hl_expired | license: no |
| hl_unsure | license: 비어 있음(추가 확인 필요) |

## 2. 무료·유료 경계

| 구분 | 무료 1차 | 유료 개인화 |
|---|---|---|
| 상황 정리 | 1차 답에서 만든 카드 문장과 상황 정리 | 1차·2차 답을 합친 요약 |
| 안내 | 확인할 점, 다음 확인 | 2차 답에서 고른 안내, 서류·일정 |
| 공식 수수료 | 일반 참고로 표시 | 비용 구성 |
| 판정(가능·조건부·불가) | 표시하지 않음 | 표시(기존 판정 엔진) |
| 점수 | 표시하지 않음 | 표시하지 않음 |
| 서비스 단계 추천 | 표시하지 않음 | 표시 |

## 3. 서비스 단계 추천 규칙 (유료에서만)

1. 전 과정 대행: `lic_situation` ∈ {sit_driving} 또는 `lic_homeLicense` ∈ {hl_expired} 또는 `lic_timeline` ∈ {tl_urgent}
2. 작성과 제출 동행: `lic_situation` ∈ {sit_rejected} 또는 `lic_submitter` ∈ {sm_undecided} 또는 `lic_officeKnown` ∈ {ok_unknown, ok_changed}
3. 서류 작성: 위에 해당하지 않을 때

## 4. 질문과 선택지

### 1차 1번 — Q1

**운전면허와 관련해 어떤 절차가 필요하고, 주로 어떤 차량을 운전하실 예정인가요?**

① **외국 면허를 베트남 면허로 처음** 바꾸려고 합니다. 주로 승용차를 운전하며 출퇴근과 가족 이동에 쓸 예정입니다.  
② **이미 바꾼 베트남 면허를 갱신**하려고 합니다. 오토바이를 주로 타고 다니며 출퇴근할 때 쓰고 있습니다.  
③ **잃어버리거나 훼손된 면허를 다시** 받으려고 합니다. 승용차와 오토바이를 모두 운전해야 하는 상황입니다.  
④ **국제면허로 운전하고 있는데** 바꿔야 하는지 궁금합니다. 회사 업무로 승합차나 화물차를 운전할 일이 있습니다.  
⑤ **어떤 절차가 필요한지** 모르겠습니다. 어떤 차량을 운전하게 될지도 아직 정하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `lic_stage=first_convert`, `lic_vehicle=car` | 외국 면허를 처음 바꾸고 승용차를 운전하려는 상황입니다 |
| ② | `lic_stage=renew_vn`, `lic_vehicle=motorbike` | 베트남 면허를 갱신하고 오토바이를 타는 상황입니다 |
| ③ | `lic_stage=lost_reissue`, `lic_vehicle=both` | 면허를 다시 받고 승용차와 오토바이를 모두 타는 상황입니다 |
| ④ | `lic_stage=intl_only`, `lic_vehicle=van_truck` | 국제면허로 운전하며 승합·화물차가 필요한 상황입니다 |
| ⑤ | `lic_stage=stage_unsure`, `lic_vehicle=vehicle_unsure` | 필요한 절차와 운전할 차량부터 확인해야 하는 상황입니다 |

### 1차 2번 — Q2

**베트남 체류 서류는 어떤 상태이고, 앞으로 얼마나 더 머무를 예정인가요?**

① **거주증이 있고 3개월 넘게** 남아 있습니다. 베트남에는 1년 넘게 계속 머무를 예정입니다.  
② **거주증이 있지만 3개월이 안** 남았습니다. 몇 달 더 머문 뒤 계획을 다시 정할 예정입니다.  
③ **거주증 없이 비자만** 가지고 있습니다. 곧 출국할 예정이라 짧게만 운전하면 됩니다.  
④ **거주증을 지금 신청하는** 중입니다. 본국과 베트남을 자주 오가면서 지내고 있습니다.  
⑤ **체류 서류 상태를** 정확히 모르겠습니다. 얼마나 더 머무를지도 아직 정해지지 않았습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `lic_residence=res_trc_long`, `lic_stayPlan=sp_over_1y` | 거주증이 넉넉히 남아 있고 오래 머물 상황입니다 |
| ② | `lic_residence=res_trc_short`, `lic_stayPlan=sp_months` | 거주증이 3개월 안에 끝나 일정 확인이 필요한 상황입니다 |
| ③ | `lic_residence=res_visa_only`, `lic_stayPlan=sp_leaving` | 비자만 있고 곧 출국할 예정인 상황입니다 |
| ④ | `lic_residence=res_applying`, `lic_stayPlan=sp_frequent` | 거주증을 신청 중이고 자주 오가며 지내는 상황입니다 |
| ⑤ | `lic_residence=res_unsure`, `lic_stayPlan=sp_unsure` | 체류 서류와 체류 계획을 확인해야 하는 상황입니다 |

### 1차 3번 — Q3

**본국에서 받은 운전면허는 어떤 상태이고, 만료일까지는 얼마나 남았나요?**

① **본국 면허가 유효**합니다. 만료일까지 2년 넘게 남아 있어서 기간에는 여유가 있습니다.  
② **본국 면허가 곧 만료**됩니다. 만료일까지 1년이 안 남아서 본국에서 먼저 갱신해야 할지 고민입니다.  
③ **국제면허만** 가지고 있습니다. 본국에서 받은 정식 면허증은 따로 가지고 오지 않았습니다.  
④ **본국 면허가 이미 만료**되었습니다. 만료된 지 얼마 되지 않았지만 갱신은 아직 하지 못했습니다.  
⑤ **본국 면허 상태를** 정확히 모르겠습니다. 면허증의 만료일이 언제인지 확인해 보지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `lic_homeLicense=hl_valid_long`, `lic_licenseExpiry=le_over_2y` | 본국 면허가 유효하고 기간에 여유가 있는 상황입니다 |
| ② | `lic_homeLicense=hl_valid_short`, `lic_licenseExpiry=le_under_1y` | 본국 면허 만료가 1년 안으로 다가온 상황입니다 |
| ③ | `lic_homeLicense=hl_intl_only`, `lic_licenseExpiry=le_na` | 국제면허만 있고 본국 면허증이 없는 상황입니다 |
| ④ | `lic_homeLicense=hl_expired`, `lic_licenseExpiry=le_expired` | 본국 면허가 만료되어 갱신부터 필요한 상황입니다 |
| ⑤ | `lic_homeLicense=hl_unsure`, `lic_licenseExpiry=le_unknown` | 본국 면허 상태와 만료일을 확인해야 하는 상황입니다 |

### 1차 4번 — Q4

**면허증 번역과 공증은 준비했고, 건강검진은 받으셨나요?**

① **번역과 공증을 모두** 마쳤습니다. 지정 병원에서 운전용 건강검진도 받아서 결과서가 있습니다.  
② **번역만 해 두었고** 공증은 아직입니다. 건강검진은 예약해 두었고 곧 받을 예정입니다.  
③ **번역과 공증을 아직** 하지 않았습니다. 운전용 건강검진이 필요한지 잘 모르겠습니다.  
④ **대사관에서 번역 확인을** 받으려고 합니다. 체류 기간에 맞춘 면허라서 검진이 면제되는지 궁금합니다.  
⑤ **번역과 공증이 필요한지** 모르겠습니다. 건강검진도 아직 받지 않았고 어디서 받는지도 모릅니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `lic_translation=tr_done`, `lic_health=hc_done` | 번역 공증과 건강검진을 모두 마친 상황입니다 |
| ② | `lic_translation=tr_partial`, `lic_health=hc_booked` | 번역만 했고 건강검진을 앞둔 상황입니다 |
| ③ | `lic_translation=tr_none`, `lic_health=hc_unknown` | 번역 공증 전이고 검진 필요 여부를 모르는 상황입니다 |
| ④ | `lic_translation=tr_embassy`, `lic_health=hc_exempt_check` | 대사관 번역을 준비하고 검진 면제를 확인할 상황입니다 |
| ⑤ | `lic_translation=tr_unknown`, `lic_health=hc_none` | 번역 공증과 건강검진을 처음부터 확인할 상황입니다 |

### 1차 5번 — Q5

**이 일을 하시면서 가장 답답하고 불안한 점은 무엇이고, 지금 어떤 상황인가요?**

① **어디서부터 시작해야 할지** 막막합니다. 검색해 봤지만 베트남어 자료가 많아 어떤 서류가 맞는지 모르겠습니다.  
② **일이 제대로 되고 있는지** 불안합니다. 회사 직원이나 지인이 알아서 한다고 했는데 어디까지 됐는지 알 수 없습니다.  
③ **사람마다 말이 달라** 혼란스럽습니다. 대행사, 지인, 접수처가 각자 다르게 말해서 누구 말이 맞는지 모르겠습니다.  
④ **본국 면허로 운전해도 되는지** 겁이 납니다. 전환하기 전인데 이미 운전하고 있어서 단속에 걸릴까 걱정됩니다.  
⑤ **이미 한 번 서류가 돌아와** 지쳤습니다. 접수했다가 번역 공증이나 서류가 부족하다고 돌려받은 적이 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 카드 문장 |
|---|---|---|
| ① | `lic_feeling=fl_lost`, `lic_situation=sit_search_vn` | 어디서 시작할지 막막하고 베트남어 자료를 이해하기 어려운 상황입니다 |
| ② | `lic_feeling=fl_anxious`, `lic_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 알 수 없어 불안한 상황입니다 |
| ③ | `lic_feeling=fl_confused`, `lic_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 |
| ④ | `lic_feeling=fl_afraid`, `lic_situation=sit_driving` | 전환 전에 운전하고 있어 단속이 걱정되는 상황입니다 |
| ⑤ | `lic_feeling=fl_tired`, `lic_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 |

### 2차 6번 — Q6

**신청 서류는 어디까지 준비되었고, 여권과 면허증의 이름 철자는 같은가요?**

① **신청서, 번역본, 체류 서류 사본을 모두** 준비했습니다. 여권과 면허증의 이름 철자가 똑같아서 문제가 없습니다.  
② **대부분 준비**했고 몇 가지만 남았습니다. 여권과 면허증의 영문 이름 철자가 조금 다릅니다.  
③ **절반쯤 준비**했습니다. 결혼 등으로 이름을 바꾼 적이 있어서 서류마다 이름이 다릅니다.  
④ **거의 준비하지 못했습니다.** 여권과 면허증의 이름이 같은지 아직 비교해 보지 않았습니다.  
⑤ **무엇이 필요한지 아직 모릅니다.** 여권과 면허증의 이름 철자는 같은 것으로 알고 있습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `lic_docs=docs_all`, `lic_nameMatch=nm_match` | 서류가 갖춰졌으니 체류 서류 사본의 인증 여부만 확인하고 바로 접수하세요. |
| ② | `lic_docs=docs_most`, `lic_nameMatch=nm_spelling` | 이름 철자가 다르면 같은 사람임을 확인하는 서류가 필요할 수 있으니 미리 준비하세요. |
| ③ | `lic_docs=docs_half`, `lic_nameMatch=nm_changed` | 이름이 바뀐 경우 변경 사실을 보여 주는 서류와 그 번역본을 함께 준비하세요. |
| ④ | `lic_docs=docs_little`, `lic_nameMatch=nm_unknown` | 서류를 모으기 전에 여권과 면허증의 이름을 먼저 맞춰 보면 보완 요구를 줄일 수 있습니다. |
| ⑤ | `lic_docs=docs_unknown`, `lic_nameMatch=nm_match` | 신청서, 면허 번역본, 체류 서류 사본, 건강검진서가 기본이니 이 네 가지부터 확인하세요. |

### 2차 7번 — Q7

**가진 면허는 어떤 종류이고, 베트남에서 필요한 면허 종류와 맞는다고 보시나요?**

① **면허 종류를 정확히 알고** 있습니다. 베트남에서 필요한 종류와 맞는 것으로 확인했습니다.  
② **여러 종류의 면허를** 가지고 있습니다. 각각 베트남 어떤 종류로 바뀌는지 확인이 필요합니다.  
③ **오토바이 면허만** 가지고 있습니다. 베트남에서는 승용차도 운전하고 싶어서 더 큰 면허가 필요합니다.  
④ **면허 종류가 무엇인지** 모르겠습니다. 베트남 면허 종류와 맞는지도 확인해 보지 못했습니다.  
⑤ **필요한 종류와 다른 면허**를 가지고 있습니다. 어떤 종류로 대응되는지 정확히 확인하고 싶습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `lic_class=cl_known`, `lic_classMatch=cm_ok` | 면허 종류가 맞다면 바뀌는 종류 표기만 신청서에 정확히 적으면 됩니다. |
| ② | `lic_class=cl_multi`, `lic_classMatch=cm_check` | 여러 종류를 한 번에 바꿀 수 있으니 각 종류가 어떻게 대응되는지 표로 정리해 두세요. |
| ③ | `lic_class=cl_moto_only`, `lic_classMatch=cm_upgrade` | 가진 면허보다 큰 차량을 운전하려면 전환이 아닌 새 시험이 필요할 수 있으니 먼저 확인하세요. |
| ④ | `lic_class=cl_unknown`, `lic_classMatch=cm_unknown` | 면허증 뒷면의 종류 표기를 사진으로 찍어 두면 대응 종류를 확인하기 쉽습니다. |
| ⑤ | `lic_class=cl_mismatch`, `lic_classMatch=cm_check` | 다른 종류라면 전환으로 해결되는지 새로 따야 하는지부터 확인하세요. |

### 2차 8번 — Q8

**베트남 면허는 언제까지 필요하고, 지금은 어떤 방식으로 운전하고 계신가요?**

① **2주 안에** 면허가 필요합니다. 지금은 운전하지 않고 택시나 차량 호출 서비스를 이용합니다.  
② **한 달 안에** 면허가 필요합니다. 지금은 국제면허로 운전하고 있는데 계속 써도 되는지 궁금합니다.  
③ **급하지는 않습니다.** 지금은 본국에서 받은 면허만 가지고 직접 운전을 하고 있습니다.  
④ **필요한 시점이 아직 정해지지** 않았습니다. 회사에서 붙여 준 기사가 대신 운전해 주고 있습니다.  
⑤ **언제 필요할지** 잘 모르겠습니다. 지금 가진 면허로 운전해도 되는지 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `lic_timeline=tl_urgent`, `lic_driveNow=dn_not_driving` | 처리 기간이 있으니 서류를 오늘부터 모아 가능한 빨리 접수하세요. |
| ② | `lic_timeline=tl_month`, `lic_driveNow=dn_intl` | 국제면허를 쓸 수 있는 조건과 기간을 확인하고, 전환 일정을 그에 맞춰 잡으세요. |
| ③ | `lic_timeline=tl_flexible`, `lic_driveNow=dn_home_license` | 본국 면허만으로 운전하면 단속 대상이 될 수 있으니 전환 전까지는 운전을 줄이세요. |
| ④ | `lic_timeline=tl_unsure`, `lic_driveNow=dn_company_driver` | 직접 운전할 계획이 생기면 체류 서류 기간을 보고 전환 일정을 정하세요. |
| ⑤ | `lic_timeline=tl_unknown`, `lic_driveNow=dn_unsure` | 운전 가능 여부부터 확인하고, 필요하면 전환을 서두르는 것이 안전합니다. |

### 2차 9번 — Q9

**신청서는 어디에 접수할 예정이고, 서류는 누가 제출하게 되나요?**

① **동 공안의 접수처**에 내려고 합니다. 제가 직접 서류를 들고 가서 제출할 예정입니다.  
② **교통경찰 사무실**에 내려고 합니다. 회사 담당자가 서류를 대신 제출해 주기로 했습니다.  
③ **온라인 공공서비스**로 신청하려고 합니다. 온라인 신청이 어려우면 대행사에 맡길 생각입니다.  
④ **대행사가 알아서 접수**하기로 했습니다. 어디에 접수하는지는 대행사에 맡기려고 합니다.  
⑤ **어디에 접수하는지** 모르겠습니다. 서류를 누가 제출할지도 아직 정하지 못한 상태입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `lic_office=of_ward`, `lic_submitter=sm_self` | 접수처마다 받는 업무와 시간이 다를 수 있으니 방문 전에 면허 업무를 받는지 확인하세요. |
| ② | `lic_office=of_traffic`, `lic_submitter=sm_company` | 회사 담당자가 제출하면 위임 서류와 결과 수령 방법을 미리 정해 두세요. |
| ③ | `lic_office=of_online`, `lic_submitter=sm_agency` | 온라인 신청은 서류 사본을 파일로 올려야 하니 선명한 스캔본을 먼저 준비하세요. |
| ④ | `lic_office=of_agency`, `lic_submitter=sm_agency` | 대행사에 맡길 때는 접수처와 처리 기간, 원본 보관 방식을 문서로 받아 두세요. |
| ⑤ | `lic_office=of_unknown`, `lic_submitter=sm_undecided` | 사는 곳의 관할 접수처를 먼저 찾고, 직접·회사·대행 중 제출 방식을 정하세요. |

### 2차 10번 — Q10

**지금까지 이 일을 알아보셨다면, 누구에게 어떤 이야기를 들으셨나요?**

① **아직 알아본 곳이 없습니다.** 어디에 물어봐야 하는지, 무엇부터 준비해야 하는지부터 알고 싶습니다.  
② **대행사나 업체**에 물어봤습니다. 필요한 서류와 절차를 들었는데 공식 기준과 맞는지 확인하지 못했습니다.  
③ **베트남 지인이나 직원**에게 물어봤습니다. 예전에 전환해 본 경험을 들었는데 지금도 같은 방식인지 모르겠습니다.  
④ **접수처에 직접** 가 보았습니다. 베트남어로 설명을 들었는데 정확히 무슨 뜻인지 이해하지 못했습니다.  
⑤ **인터넷이나 인공지능**으로 찾아봤습니다. 글마다 내용이 달라서 어느 것이 최신인지 알 수 없습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `lic_helperWho=hw_none`, `lic_toldWhat=tw_nothing` | 먼저 접수 예정 지역의 담당 접수처가 어디인지 확인하고 필요한 서류 목록을 문서로 받으세요. |
| ② | `lic_helperWho=hw_agency`, `lic_toldWhat=tw_unverified` | 업체에서 들은 서류 목록은 접수처의 공식 안내와 한 번 대조해 보세요. |
| ③ | `lic_helperWho=hw_friend`, `lic_toldWhat=tw_old_way` | 제도가 최근 바뀌었을 수 있어 지인의 경험은 접수처의 현재 안내와 대조해 확인하세요. |
| ④ | `lic_helperWho=hw_office`, `lic_toldWhat=tw_not_understood` | 접수처에서 들은 내용은 메모나 사진으로 남겨 서류 목록과 다시 확인하세요. |
| ⑤ | `lic_helperWho=hw_online`, `lic_toldWhat=tw_conflicting` | 인터넷 글과 인공지능 번역은 날짜와 지역이 다를 수 있으니 공식 기관 안내를 기준으로 확인하세요. |

### 2차 11번 — Q11

**신청하시는 분의 국적은 어디이고, 접수할 때 베트남어 소통은 가능하신가요?**

① **대한민국** 국적입니다. 베트남어를 전혀 몰라서 접수처에 갈 때 통역이 꼭 필요합니다.  
② **중국** 국적입니다. 베트남어를 할 수 있는 직원이나 가족이 함께 가 줄 수 있습니다.  
③ **일본** 국적입니다. 영어로는 소통할 수 있지만 베트남어는 전혀 하지 못하는 상황입니다.  
④ **그 밖의 아시아 국가** 국적입니다. 베트남어로 간단한 소통은 할 수 있어서 혼자 가도 괜찮습니다.  
⑤ **그 밖의 지역** 국적입니다. 베트남어를 몰라서 신청할 때 통역이 꼭 필요한 상황입니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `lic_nationality=nat_korea`, `lic_language=lang_need` | 통역이 필요하면 방문 전에 통역 일정을 먼저 잡고 서류를 베트남어 목록으로 준비하세요. |
| ② | `lic_nationality=nat_china`, `lic_language=lang_partner` | 함께 가는 사람에게 서류 목록과 신청 내용을 미리 공유해 두면 접수가 빨라집니다. |
| ③ | `lic_nationality=nat_japan`, `lic_language=lang_english` | 접수처에서는 영어가 통하지 않을 수 있으니 통역이나 온라인 신청을 먼저 검토하세요. |
| ④ | `lic_nationality=nat_other_asia`, `lic_language=lang_ok` | 혼자 방문하더라도 서류 원본과 사본을 나누어 챙기면 한 번에 끝낼 수 있습니다. |
| ⑤ | `lic_nationality=nat_other`, `lic_language=lang_need` | 국적에 따라 면허 번역 확인 방법이 다를 수 있으니 번역 공증 방법을 먼저 확인하세요. |

### 2차 12번 — Q12

**운전할 차량은 어떻게 마련했고, 주로 어떤 용도로 운전하실 예정인가요?**

① **차량을 직접 구입**했습니다. 주로 집과 회사를 오가는 출퇴근할 때 직접 운전하려고 합니다.  
② **차량을 빌려서** 쓰고 있습니다. 회사 업무로 거래처를 다닐 때 제가 직접 운전하게 됩니다.  
③ **회사 차량을** 쓰게 됩니다. 주말에는 가족과 함께 이동할 때도 제가 운전할 예정입니다.  
④ **아직 운전할 차량이** 없습니다. 여행할 때 차를 빌려서 다른 도시까지 직접 운전해 보고 싶습니다.  
⑤ **차량을 어떻게 마련할지** 정하지 못했습니다. 운전할 용도도 아직 정해지지 않았습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `lic_vehicleSource=vs_own`, `lic_drivePurpose=dp_commute` | 직접 산 차량은 면허와 함께 차량 등록과 보험 서류도 챙겨 두어야 합니다. |
| ② | `lic_vehicleSource=vs_rent`, `lic_drivePurpose=dp_work` | 빌린 차량은 계약서에 운전자 조건이 있을 수 있으니 면허 종류와 맞는지 확인하세요. |
| ③ | `lic_vehicleSource=vs_company`, `lic_drivePurpose=dp_family` | 회사 차량은 회사 보험의 운전자 범위에 들어가는지 확인해 두세요. |
| ④ | `lic_vehicleSource=vs_none`, `lic_drivePurpose=dp_travel` | 여행용으로 빌릴 때도 베트남 면허가 있어야 하는 경우가 많으니 전환을 먼저 마치세요. |
| ⑤ | `lic_vehicleSource=vs_unsure`, `lic_drivePurpose=dp_unsure` | 용도가 정해지면 필요한 면허 종류도 정해지니 운전 계획부터 정리해 보세요. |

### 2차 13번 — Q13

**서류를 접수할 지역은 어디이고, 담당 접수처를 알고 계신가요?**

① **하노이**에서 접수합니다. 담당 접수처의 위치와 접수 시간을 이미 알고 있어서 가기만 하면 됩니다.  
② **호치민**에서 접수합니다. 담당 접수처가 어디인지 몰라서 어디로 가야 하는지 알고 싶습니다.  
③ **다낭**에서 접수합니다. 최근 행정구역이 바뀌어 담당 접수처가 달라졌는지 모르겠습니다.  
④ **그 밖의 도시**에서 접수합니다. 가 본 적이 있어서 접수처의 위치는 알고 있지만 시간은 모릅니다.  
⑤ **접수할 지역이 아직** 정해지지 않았습니다. 어느 접수처에 가야 하는지도 확인하지 못했습니다.  
⑥ **직접 입력**

| 선택 | 저장 필드 | 안내 문장 |
|---|---|---|
| ① | `lic_area=area_hanoi`, `lic_officeKnown=ok_known` | 접수 시간과 예약 여부만 한 번 더 확인하면 헛걸음을 줄일 수 있습니다. |
| ② | `lic_area=area_hcm`, `lic_officeKnown=ok_unknown` | 사는 곳 기준으로 면허 업무를 받는 접수처를 먼저 찾아야 접수 시간을 알 수 있습니다. |
| ③ | `lic_area=area_danang`, `lic_officeKnown=ok_changed` | 행정구역 개편으로 담당 기관이 바뀌었을 수 있으니 접수 전에 직접 확인하세요. |
| ④ | `lic_area=area_other_city`, `lic_officeKnown=ok_known` | 지방은 접수 요일이 제한될 수 있으니 방문 전에 전화로 일정을 확인하세요. |
| ⑤ | `lic_area=area_unsure`, `lic_officeKnown=ok_unknown` | 사는 곳 주소를 기준으로 접수 지역이 정해지는 경우가 많으니 주소부터 확인하세요. |

## 5. 1차 상황 정리 (1차 5번 선택별)

| 저장 필드 | 제목 | 안내 |
|---|---|---|
| `lic_feeling=fl_lost`, `lic_situation=sit_search_vn` | 어디서부터 시작해야 할지 몰라 막막한 상황입니다 | 면허 전환에는 신청서, 면허 번역 공증본, 3개월 넘게 남은 체류 서류 사본, 건강검진서가 기본으로 필요합니다. 체류 서류 기간부터 확인하세요. |
| `lic_feeling=fl_anxious`, `lic_situation=sit_unknown_progress` | 맡긴 일이 어디까지 됐는지 몰라 불안한 상황입니다 | 어떤 서류를 언제 접수했는지 문서로 받아 확인하세요. 서류가 갖춰져 접수되면 5일 안에 결과가 나오는 것으로 안내됩니다. |
| `lic_feeling=fl_confused`, `lic_situation=sit_conflicting` | 사람마다 말이 달라 혼란스러운 상황입니다 | 설명이 다를 때는 접수처의 공식 안내와 2025년 3월 시행된 교환 통달을 기준으로 필요한 서류 목록을 다시 대조하세요. |
| `lic_feeling=fl_afraid`, `lic_situation=sit_driving` | 전환 전에 운전하고 있어 단속이 걱정되는 상황입니다 | 본국 면허만으로 운전하면 단속 대상이 될 수 있어 전환 전에는 운전을 삼가는 것이 안전합니다. 국제면허나 만료된 면허는 전환되지 않으니 본국 면허 상태부터 확인하세요. |
| `lic_feeling=fl_tired`, `lic_situation=sit_rejected` | 서류가 한 번 되돌아와 지친 상황입니다 | 서류가 돌아온 이유를 접수처에서 문서나 메모로 받아 번역 공증본과 체류 서류 기간부터 다시 확인하세요. |

## 6. 확인할 점 규칙 (최대 4개, 없으면 기본 문장)

| 번호 | 조건 | 문장 |
|---|---|---|
| 1 (residence) | `lic_residence` ∈ {res_trc_short, res_visa_only, res_applying, res_unsure} | 체류 서류가 3개월 넘게 남아 있어야 전환할 수 있어 체류 서류부터 정리해야 합니다 |
| 2 (home) | `lic_homeLicense` ∈ {hl_intl_only, hl_expired, hl_unsure} | 국제면허나 만료된 면허로는 전환할 수 없어 본국 면허 상태부터 확인해야 합니다 |
| 3 (expiry) | `lic_licenseExpiry` ∈ {le_under_1y} | 본국 면허 만료가 가까우면 전환된 면허 기간도 짧아질 수 있어 갱신 여부를 먼저 정하세요 |
| 4 (translation) | `lic_translation` ∈ {tr_none, tr_unknown, tr_partial} | 면허 번역본은 공증까지 끝나야 접수할 수 있으니 번역 공증을 먼저 마치세요 |
| 5 (name) | `lic_nameMatch` ∈ {nm_spelling, nm_changed} | 여권과 면허의 이름이 다르면 같은 사람임을 보여 주는 서류가 추가로 필요할 수 있습니다 |
| 6 (drive) | `lic_driveNow` ∈ {dn_home_license, dn_unsure} | 본국 면허만으로 운전하면 단속 대상이 될 수 있어 전환 전에는 운전을 삼가는 것이 안전합니다 |
| 7 (class) | `lic_classMatch` ∈ {cm_upgrade} | 가진 면허보다 큰 차량을 운전하려면 전환이 아니라 새로 시험을 봐야 할 수 있습니다 |

기본 문장: 입력하신 내용에서는 뚜렷한 확인 사항이 많지 않지만, 접수 전에 체류 서류 기간과 번역 공증본을 한 번 더 확인하세요

## 7. 다른 검토 연결

| 연결 | 조건 | 문장 |
|---|---|---|
| 거주증 확인 | `lic_residence` ∈ {res_trc_short, res_visa_only, res_applying} | 체류 서류 기간이 부족하다면 거주증 직접 확인에서 먼저 점검해 보실 수 있습니다. |
| 임시 거주 신고 확인 | `lic_stayPlan` ∈ {sp_over_1y} | 오래 머무르신다면 임시 거주 신고가 맞게 되어 있는지 함께 점검해 보실 수 있습니다. |
| 전문가 진행 | `lic_homeLicense` ∈ {hl_expired} 또는 `lic_timeline` ∈ {tl_urgent} 또는 `lic_situation` ∈ {sit_driving} | 본국 면허가 만료되었거나 일정이 급하다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |

## 8. 값 → 고객 표시 문구

| 내부 값 | 고객 화면 표시 |
|---|---|
| `area_danang` | 다낭 |
| `area_hanoi` | 하노이 |
| `area_hcm` | 호치민 |
| `area_other_city` | 그 밖의 도시 |
| `area_unsure` | 지역 미정 |
| `both` | 승용차와 오토바이 |
| `car` | 승용차 |
| `cl_known` | 면허 종류를 알고 있음 |
| `cl_mismatch` | 필요한 종류와 다름 |
| `cl_moto_only` | 오토바이 면허만 보유 |
| `cl_multi` | 여러 종류 면허 보유 |
| `cl_unknown` | 면허 종류를 모름 |
| `cm_check` | 대응 종류 확인 필요 |
| `cm_ok` | 필요한 종류와 맞음 |
| `cm_unknown` | 대응 여부를 모름 |
| `cm_upgrade` | 더 큰 차량 면허 필요 |
| `dn_company_driver` | 회사 기사가 운전 |
| `dn_home_license` | 본국 면허로 운전 중 |
| `dn_intl` | 국제면허로 운전 중 |
| `dn_not_driving` | 지금은 운전하지 않음 |
| `dn_unsure` | 운전 가능 여부를 모름 |
| `docs_all` | 필요 서류 모두 준비 |
| `docs_half` | 필요 서류 절반 준비 |
| `docs_little` | 서류 거의 미준비 |
| `docs_most` | 필요 서류 대부분 준비 |
| `docs_unknown` | 필요 서류를 모름 |
| `dp_commute` | 출퇴근용 |
| `dp_family` | 가족 이동용 |
| `dp_travel` | 여행용 |
| `dp_unsure` | 용도 미정 |
| `dp_work` | 업무용 |
| `first_convert` | 외국 면허를 처음 전환 |
| `fl_afraid` | 무면허 운전 단속이 걱정됨 |
| `fl_anxious` | 진행 상황이 불안함 |
| `fl_confused` | 사람마다 말이 달라 혼란 |
| `fl_lost` | 어디서 시작할지 막막함 |
| `fl_tired` | 서류가 한 번 반려되어 지침 |
| `hc_booked` | 건강검진 예약 |
| `hc_done` | 건강검진 완료 |
| `hc_exempt_check` | 검진 면제 여부 확인 필요 |
| `hc_none` | 건강검진 안 함 |
| `hc_unknown` | 건강검진 필요 여부를 모름 |
| `hl_expired` | 본국 면허 만료 |
| `hl_intl_only` | 국제면허만 있음 |
| `hl_unsure` | 본국 면허 상태를 모름 |
| `hl_valid_long` | 본국 면허 유효(넉넉함) |
| `hl_valid_short` | 본국 면허 곧 만료 |
| `hw_agency` | 대행사·업체에 문의 |
| `hw_friend` | 베트남 지인·직원에게 문의 |
| `hw_none` | 아직 알아본 곳 없음 |
| `hw_office` | 접수처에 직접 방문 |
| `hw_online` | 인터넷·인공지능으로 검색 |
| `intl_only` | 국제면허로 운전 중 |
| `lang_english` | 영어로만 소통 가능 |
| `lang_need` | 통역이 꼭 필요함 |
| `lang_ok` | 베트남어 소통 가능 |
| `lang_partner` | 통역할 사람이 있음 |
| `le_expired` | 이미 만료 |
| `le_na` | 본국 면허 없음 |
| `le_over_2y` | 면허 만료까지 2년 넘음 |
| `le_under_1y` | 면허 만료까지 1년 미만 |
| `le_unknown` | 만료일을 모름 |
| `lost_reissue` | 분실·훼손 재발급 |
| `motorbike` | 오토바이 |
| `nat_china` | 중국 국적 |
| `nat_japan` | 일본 국적 |
| `nat_korea` | 대한민국 국적 |
| `nat_other` | 그 밖의 지역 국적 |
| `nat_other_asia` | 그 밖의 아시아 국적 |
| `nm_changed` | 이름을 바꾼 적 있음 |
| `nm_match` | 여권과 면허 이름 일치 |
| `nm_spelling` | 이름 철자가 다름 |
| `nm_unknown` | 이름 일치 여부를 모름 |
| `of_agency` | 대행사가 접수 |
| `of_online` | 온라인 공공서비스 |
| `of_traffic` | 교통경찰 사무실 |
| `of_unknown` | 접수 방법을 모름 |
| `of_ward` | 동 공안 접수처 |
| `ok_changed` | 행정구역 변경으로 접수처가 불확실함 |
| `ok_known` | 접수처를 알고 있음 |
| `ok_unknown` | 접수처를 모름 |
| `renew_vn` | 베트남 면허 갱신 |
| `res_applying` | 거주증 신청 중 |
| `res_trc_long` | 거주증 3개월 이상 남음 |
| `res_trc_short` | 거주증 3개월 미만 남음 |
| `res_unsure` | 체류 서류 상태를 모름 |
| `res_visa_only` | 비자만 있음 |
| `sit_conflicting` | 안내가 서로 다름 |
| `sit_driving` | 전환 전에 운전하고 있음 |
| `sit_rejected` | 서류가 한 번 반려됨 |
| `sit_search_vn` | 베트남어 자료를 이해하기 어려움 |
| `sit_unknown_progress` | 진행 상황을 알 수 없음 |
| `sm_agency` | 대행사가 제출 |
| `sm_company` | 회사 담당자가 제출 |
| `sm_self` | 직접 제출 |
| `sm_undecided` | 제출 방식 미정 |
| `sp_frequent` | 자주 오가며 머묾 |
| `sp_leaving` | 곧 출국 예정 |
| `sp_months` | 몇 달 머물 예정 |
| `sp_over_1y` | 1년 넘게 머물 예정 |
| `sp_unsure` | 체류 계획 미정 |
| `stage_unsure` | 어떤 절차인지 모름 |
| `tl_flexible` | 급하지 않음 |
| `tl_month` | 한 달 안에 필요 |
| `tl_unknown` | 필요 시점을 모름 |
| `tl_unsure` | 필요 시점 미정 |
| `tl_urgent` | 2주 안에 필요 |
| `tr_done` | 번역 공증 완료 |
| `tr_embassy` | 대사관 번역 확인 예정 |
| `tr_none` | 번역 공증 안 함 |
| `tr_partial` | 번역만 함 |
| `tr_unknown` | 번역 공증 필요 여부를 모름 |
| `tw_conflicting` | 글마다 내용이 다름 |
| `tw_not_understood` | 베트남어 설명을 이해하지 못함 |
| `tw_nothing` | 들은 내용 없음 |
| `tw_old_way` | 예전 방식인지 모름 |
| `tw_unverified` | 공식 기준과 대조하지 못함 |
| `van_truck` | 승합·화물차 |
| `vehicle_unsure` | 운전할 차량 미정 |
| `vs_company` | 회사 차량 |
| `vs_none` | 운전할 차량 없음 |
| `vs_own` | 직접 산 차량 |
| `vs_rent` | 빌린 차량 |
| `vs_unsure` | 차량 마련 계획 미정 |

## 9. 근거·출처 (확인일 2026.10.12)

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 외국인 운전면허 전환 안내 (호치민시 공안 교통경찰과, 2025.3): 3개월 넘게 남은 체류 서류와 유효한 본국 면허 필요, 국제면허·만료 면허는 전환 불가, 접수 후 5일 안에 결과, 수수료 13만5천 동 | 호치민시 공안 / 사이공 해방 신문 | 보도 기준 | https://www.sggp.org.vn/huong-dan-doi-giay-phep-lai-xe-cua-nguoi-nuoc-ngoai-post785467.html | 지역별 접수처는 시행 시점에 다시 확인 |
| 2 | 외국 운전면허 교환에 관한 공안부 통달 (제12/2025/TT-BCA호, 2025.3.1 시행)와 운전 교육·시험·발급에 관한 교통운수부 통달 (제35/2024/TT-BGTVT호, 2025.1.1 시행) | 베트남 공안부 / 교통운수부 | 보도 기준 | 원문 링크 확인 중 | 외국 면허 교환은 공안부 통달 제24조 기준으로 확인함. 이전에 공안부 제35/2024로 적은 번호는 교통운수부 통달이 맞아 바로잡음 |
