# VFBCAI CASE_03 질문·선택지 FINAL v1.2

| 항목 | 내용 |
|------|------|
| **성격** | v1 재작성안 + v1.1 (D03/D06) **통합 SoT** — 고객向 전문 |
| **LOCK** | 선택지 **최대 5 + DI** · D03 제2 사실은 규칙 충족 시만 |
| **DI** | slug `other` · 「위에 내용이 없거나 설명이 필요합니다 → 직접 입력」 |
| **근거** | REWRITE_MASTER v1/v1_1 · FIVE_CAP_INVENTORY v1_1 §2.3~2.4 · CASE_03 Phase1/2 설계 |

---

## 공통 — 직접 입력

모든 선택형 질문에 **6번째** 선택으로 다음을 둡니다.

| slug | 고객向 문안 |
|------|-------------|
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

## Phase1 (화면 순서)

### `case03_authorityDemand`

| 항목 | 내용 |
|------|------|
| **노출 조건** | CASE_03 Phase1 체인 진입 시 항상 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국에서는 이 문제와 관련해 **무엇을 하라고** 안내했나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `reason_unclear` | **왜 출석·설명**해야 하는지 **아직 이해하지 못했습니다**. |
| `specific_incident` | **특정 사건·행동**에 대해 **설명**하라는 요청을 받았습니다. |
| `submission_review` | **제출·신청 내용 확인** 때문에 **설명**하라는 요청을 받았습니다. |
| `repeat_demand` | **이미 설명했는데** **다시 출석·설명**을 요구받았습니다. |
| `prep_unclear` | **출석·설명**은 요구됐으나 **무엇을 준비**할지 **모르겠습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `demand_type` = reason_unclear | specific_incident | submission_review | repeat_demand | prep_unclear | other · `prior_response` (repeat 축)

**제2 사실:** 미부착 — 사건 숙지·문구 수준은 `inquiryFocus`·`factRelationship` 등.

**choice_facts:**

| slug | demand_type | prior_response |
|------|-------------|----------------|
| `reason_unclear` | reason_unclear | na |
| `specific_incident` | specific_incident | na |
| `submission_review` | submission_review | na |
| `repeat_demand` | repeat_demand | repeat |
| `prep_unclear` | prep_unclear | na |

**impossible_combinations:**

- `demand_type=repeat_demand` + `customerResponse=none` 동시 확정은 별 검사(경로) — 문서 수준 유지.

---

### `case03_inquiryFocus`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · authorityDemand 답변 후 (**Phase2 재노출 없음**) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국이 **무엇을 확인**하려는 것 같나요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `action_facts` | **제 행동·당시 상황**을 확인하려는 것으로 이해했습니다. |
| `submitted_docs` | **제출 서류·정보**를 확인하려는 것으로 이해했습니다. |
| `specific_event` | **특정 날짜·사건**을 확인하려는 것으로 이해했습니다. |
| `focus_not_understood` | **무엇을 확인**하려는지 **명확하지 않거나** 설명을 **이해하지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `inquiry_focus` = action_facts | submitted_docs | specific_event | focus_not_understood | other

**choice_facts:** slug ↔ `inquiry_focus` 1:1 (`focus_not_understood` ← 구 `unclear` · `unsure` 통합)

---

### `case03_customerResponse`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · inquiryFocus 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 출석·설명 요구 **이후** 제가 한 일과 **기관 반응**을 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `none` | **설명·방문을 하지 않았고**, 기관 **답변도 없습니다**. |
| `phone_inquired` | **전화·문자·메신저**로 문의·설명했고, **서면·접수 확인은 없거나** **구두·문자 답변은 받았을 수도** 있습니다. |
| `attended` | **지정 장소에 방문**해 설명했고 **접수·메모**는 받았거나 없습니다. |
| `explained_with_docs` | **설명과 함께 서류**를 제출했고 **접수 여부**는 확인 중입니다. |
| `other_channel` | **전화·방문 외 방식**으로 대응했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `response_channel` = none | phone | attended | docs | other_channel | other · `authority_reply` · `docs_submitted`

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 전화·메시지 **후 답변 없음**만 (`phone_no_reply`) | `phone_inquired`에 **흡수** — 답변 세부는 **DI** |
| 전화·메시지 **후 답변 수신** (`phone_replied`) | `phone_inquired`에 **흡수** — 답변 내용·서면화는 **DI** |
| **비표준 채널** 세부 (대리인·이메일만 등) | `other_channel` 또는 **DI** |

**choice_facts:**

| slug | facts |
|------|-------|
| `none` | response_channel=none |
| `phone_inquired` | response_channel=phone |
| `attended` | response_channel=attended |
| `explained_with_docs` | response_channel=docs; docs_submitted=yes |
| `other_channel` | response_channel=other_channel |

---

### `case03_confirmGoal`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · customerResponse 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이 출석·소명 사건에서 **가장 먼저** 확인하려는 것은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `prepare_materials` | **준비할 자료·내용**을 먼저 정리하려 합니다. |
| `sufficient_explanation` | **이미 한 설명이 충분한지**가 우선입니다. |
| `deadline_attendance` | **출석 기한·필수 여부**가 우선입니다. |
| `repeat_response` | **다시 무엇을 해야 하는지**가 우선입니다. |
| `unsure` | **무엇부터 할지** 정하지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `primary_goal` = prepare_materials | sufficient_explanation | deadline_attendance | repeat_response | unsure | other

**제2 사실:** 미부착 (`prepare_materials` 목록 일부만 앎 — `prepRequired`·evidence와 분리).

**choice_facts:** slug ↔ `primary_goal` 1:1

---

### `case03_deadline`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · confirmGoal 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | **출석·소명 기한**을 어디까지 확인했나요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `specific_date` | **정확한 날짜**를 확인했고 아래에 적을 수 있습니다. |
| `window_only` | **기간만** 안내됐고 **날짜**는 계산하지 못했습니다. |
| `exists_date_unknown` | **기한은 있다**고만 알고 **언제인지** 못 찾았습니다. |
| `not_checked` | **기한 문구**를 읽지 않았거나 **확인하지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `deadline_certainty` = date | window | exists_unknown | not_checked | other

**impossible_combinations:**

- `specific_date` 선택 시 `case03_deadlineDate` 텍스트 필수 (QG-03)

---

### `case03_deadlineDate`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case03_deadline` = `specific_date` |
| **질문 유형** | 텍스트 입력 |
| **질문 문장** | 확인한 출석·소명 기한은 언제인가요? |

**placeholder:** 기억나는 날짜·기한을 적어 주세요.

---

## Phase2 (화면 순서)

> **NEVER ASK AGAIN:** Phase1에서 답한 `case03_inquiryFocus`는 Phase2에서 **재질문하지 않습니다**.

### `case03_attendancePlace`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case03_customerResponse` = `attended` |
| **질문 유형** | 텍스트 입력 |
| **질문 문장** | 출석·소명 장소는 어디인가요? |

**placeholder:** 안내에 적힌 장소·주소를 적어 주세요.

---

### `case03_factRelationship`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 체인 진입 시 (Phase1 완료 후) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 기관이 확인하려는 내용과 **실제 상황**을 비교하면? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `match` | **대체로 맞고** 차이는 **사소한 표현** 수준입니다. |
| `partial` | **일부는 맞지만** 날짜·장소·행동 등 **핵심이 하나 이상** 다릅니다. |
| `mismatch` | **상당히 다르고**, 그 차이를 **예로 들 수 있습니다**. |
| `hard_to_judge` | **대조할 기록·증빙**이 없어 **비교 자체가 어렵습니다**. |
| `unknown` | **문장 의미**를 몰라 **판단할 수 없습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `alignment` = match | partial | mismatch | hard_to_judge | unknown | other

**QG-04:** `hard_to_judge` / `unknown` 시 prep·explanation 세부에서 **recall 신호 반복 금지** (단일 출구).

---

### `case03_explanationDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `customerResponse` ∈ {`phone_inquired`, `attended`, `explained_with_docs`, `other_channel`} 또는 DI(대응 있음) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국에 **설명하거나 제출한 내용**을 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `full_explanation` | **알고 있는 사실**을 **직접 설명**했습니다. |
| `with_submitted_docs` | **설명과 서류**를 **함께 제출**했습니다. |
| `partial_explanation` | **일부만** 설명했고 **충분히 못 했습니다**. |
| `agency_redemand` | **설명 후** **다른 내용·자료**를 **다시 요구**받았습니다. |
| `attended_insufficient` | **출석했으나** **무엇을 설명할지 몰라** 충분히 못 했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `explanation_depth` = full | with_docs | partial | redemand | insufficient | other

**choice_facts:** slug ↔ `explanation_depth` 1:1 (`with_submitted_docs` → with_docs)

---

### `case03_explanationTrajectory`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `customerResponse` ≠ `none` 또는 설명·출석 **이후** 경로 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 설명·출석 **이후** 기관 안내·반복 요구를 **한 번에** 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `proceed_no_more` | **추가 설명·자료·출석 없이** 절차가 **진행된다**는 안내를 받았고, **종결·다음 단계** 문구를 확인했습니다. |
| `demands_more` | **추가 설명·소명**을 요구받았거나 **추가 서류·증빙**을 요구받았거나 **다시 출석·방문**하라는 안내를 받았고, **아직 하지 않았거나** 제출·참석 후 **결과 대기** 중입니다. |
| `other_procedure` | **납부·과태료·보완 제출·처분** 등 **출석·설명과 다른 절차** 안내를 받았습니다. |
| `repeat_multiple` | **설명·출석·자료 제출**을 **여러 번** 다시 요구받았거나 **같은 요구가 반복**되었습니다. |
| `no_response_or_unclear` | 대응 후 **아직 기관 답변이 없거나**, **답변은 받았으나** 진행·추가 요구·종결 중 **무엇인지 정리하지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `trajectory_class` = proceed | demands_more | other_procedure | repeat_multiple | no_reply_unclear | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **추가 요구 종류**만 구분 (`more_explanation` · `more_docs` · `re_attendance`) | `demands_more`에 **흡수** — 세부는 **DI** (§2.4) |
| **답변 없음**만 (`no_response`) | `no_response_or_unclear`에 **흡수** |
| **답변 있으나 의미 불명** (`guidance_unclear`) | `no_response_or_unclear`에 **흡수** |
| **납부·처분 세부**만 따로 | `other_procedure` 또는 **DI** |

**choice_facts:**

| slug | facts |
|------|-------|
| `proceed_no_more` | trajectory_class=proceed |
| `demands_more` | trajectory_class=demands_more |
| `other_procedure` | trajectory_class=other_procedure |
| `repeat_multiple` | trajectory_class=repeat_multiple |
| `no_response_or_unclear` | trajectory_class=no_reply_unclear |

**폐기 질문:** `case03_authorityFollowUp` · `case03_repeatFollowUp` → 본 질문으로 **합침**.

---

### `case03_prepRequired`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `customerResponse` = `none` 또는 `authorityDemand` ∈ {`prep_unclear`, `reason_unclear`} 등 미대응·준비 불명 경로 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 출석·설명 전 **무엇을 준비**해야 할 것 같나요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `documents` | **서류·증빙**을 가져가야 할 것 같습니다. |
| `explanation` | **사실 정리·설명** 준비가 필요합니다. |
| `attendance_only` | **출석만** 하면 될 것 같습니다. |
| `prep_unknown` | **무엇을 준비**할지 **모르겠습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `prep_kind` = documents | explanation | attendance_only | prep_unknown | other

**choice_facts:** slug ↔ `prep_kind` 1:1 (`prep_unknown` ← 구 `unknown` · `unsure` 통합)

---

### `case03_prepAttendanceDate`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case03_prepRequired` = `attendance_only` |
| **질문 유형** | 텍스트 입력 |
| **질문 문장** | 출석이 필요하다고 이해한 **날짜·시간**은 언제인가요? |

**placeholder:** 안내·기억에 남은 일시를 적어 주세요.

---

### `case03_blockage`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · trajectory(또는 prep) 이후 · 막힘 신호 경로 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 지금 이 출석·소명 사건에서 **가장 막힌 부분**은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `what_explain` | **무엇을 어떻게 설명**해야 하는지 모르겠습니다. |
| `what_docs` | **어떤 서류·증빙**을 준비해야 하는지 모르겠습니다. |
| `why_attend` | **왜 출석·소명**을 요구하는지 이해하지 못했습니다. |
| `when_attend` | **언제까지 출석·제출**해야 하는지 모르겠습니다. |
| `after_explain` | **설명·제출 후** 다음에 **무엇을 해야 하는지** 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `block_axis` = what_explain | what_docs | why_attend | when_attend | after_explain | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **막힘이 여러 가지** (구 `unsure`) | 복합 막힘 — **DI** |
| **기관 답변 대기**만 막힘 | `after_explain` 또는 **DI** |

**choice_facts:** slug ↔ `block_axis` 1:1

---

### `case03_evidence`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · blockage 답변 후 (또는 증빙 필요 경로) |
| **질문 유형** | 목록형 · 복수 선택 |
| **질문 문장** | 출석·소명과 관련해 **지금 활용 가능한 자료**를 골라 주세요. (여러 개 선택 가능) |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `notice` | **출석·소명 통지서**(또는 동일 내용 안내)를 가지고 있습니다. |
| `attendance_notice` | **출석 일시·장소 안내**를 가지고 있습니다. |
| `message` | **문자·전화·메신저** 연락 내용을 가지고 있습니다. |
| `submitted_docs` | **제출한 서류·소명서 사본**을 가지고 있습니다. |
| `none` | **관련 자료가 없습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `evidence_kind` (복수) = notice | attendance_notice | message | submitted_docs | none | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **있는지 아직 확인 못 함** (구 `unsure`) | 보유 여부 미확인 — **DI** |
| **사진·영상** 등 기타 | 종류 다양 — **DI** |

**impossible_combinations:**

- `none`과 다른 slug **동시 선택** 금지 (목록형 규칙)

---

### `case03_attendanceWhenWhere`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case03_evidence`에 `attendance_notice` 포함 |
| **질문 유형** | 텍스트 입력 |
| **질문 문장** | 출석 일시·장소 안내에 적힌 내용은 무엇인가요? |

**placeholder:** 기억나는 날짜·시간·장소를 적어 주세요.

---

### `case03_finalGoal`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 tail · evidence 답변 후 · Phase1 `confirmGoal`과 **동일 slug 제외** |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 아직 덜 확인된 것 중, **이번 검토에서 우선**하고 싶은 것은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `understand_demand` | 기관 **요구·확인 취지**를 이해하고 싶습니다. |
| `prepare_response` | **준비·대응** 순서를 알고 싶습니다. |
| `verify_facts` | **사실관계**를 확인하고 싶습니다. |
| `deadline_compliance` | **출석·제출 기한**과 **필수 여부**를 알고 싶습니다. |
| `after_agency_reply` | **기관 답변 이후** 다음 단계를 알고 싶습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `final_priority` = understand_demand | prepare_response | verify_facts | deadline_compliance | after_agency_reply | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **VFBCAI 전문가팀** 연결 (구 `expert`) | 결과 화면 **전문가 CTA**가 주 출구 — **DI** |
| **우선순위 정하기 어려움** | **DI** |
| Phase1 `confirmGoal`과 **동일 목표** 재선택 | slug **제외** — tail은 **남은 축**만 |

---

## 옛 slug → 새 slug

| 구분 | 옛 slug | 새 slug | 비고 |
|------|---------|---------|------|
| deadline | `uncertain` | `exists_date_unknown` | |
| deadline | `period_stated` | `window_only` | |
| deadline | `not_stated` · `unsure` | `not_checked` | |
| inquiryFocus | `unclear` · `unsure` | `focus_not_understood` | 4+DI |
| prepRequired | `unknown` · `unsure` | `prep_unknown` | 4+DI |
| customerResponse | `phone_no_reply` · `phone_replied` | `phone_inquired` | §2.3 |
| customerResponse | `phone_message` | `phone_inquired` | 코드 동형 |
| customerResponse | `attendance` | `attended` | 문서 slug |
| customerResponse | `explanation_with_docs` | `explained_with_docs` | |
| customerResponse | `other_method` | `other_channel` | |
| authorityDemand | v1 `reason_unclear` 문안 | v1.1 문안 | D03 §A.1 |
| authorityDemand | v1 `specific_incident` 문안 | v1.1 문안 | D03 §A.1 |
| confirmGoal | v1 `prepare_materials` 문안 | v1.1 문안 | D03 §A.2 |
| trajectory | `more_explanation` · `more_docs` · `re_attendance` | `demands_more` | §2.4 |
| trajectory | `no_response` · `guidance_unclear` | `no_response_or_unclear` | §2.4 |
| trajectory | `case03_authorityFollowUp.*` | `case03_explanationTrajectory.*` | 합침 |
| trajectory | `case03_repeatFollowUp.*` | `case03_explanationTrajectory.*` | 합침 |
| evidence | `unsure` | `other` (DI) | §2.4 역할 분리 |
| finalGoal | `expert` · `goal_other` | `other` (DI) | |
| **삭제 질문** | Phase2 `case03_inquiryFocus` | — | NEVER ASK AGAIN |
| **삭제 질문** | `case03_authorityFollowUp` | — | trajectory 합침 |
| **삭제 질문** | `case03_repeatFollowUp` | — | trajectory 합침 |

---

## QG 점검 (문서)

| 게이트 | 결과 |
|--------|------|
| QG-01 | **해소함** — deadline 4+DI · trajectory 5+DI |
| QG-02 | **해소함** — customerResponse 5+DI · 분기는 explanationDetail·trajectory |
| QG-03 | **해소함(문서)** — `specific_date` → deadlineDate |
| QG-04 | **해소함** — inquiryFocus Phase1 단일 · Phase2 재질문 없음 |
| QG-05 | **해소함** — v1.1 D06 (§2.3~2.4) |

---

*v1.2 FINAL — 문서 SoT · 코드 미반영*
