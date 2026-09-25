# VFBCAI CASE_03 질문·선택지 재작성 마스터 v1

| 항목 | 내용 |
|------|------|
| **범위** | 출석·소명 CASE — Phase1·Phase2 전 질문 |
| **LOCK** | QG-01~04 · 고밀도 1인칭 |

---

## 0. 구조 변경

| 합침·삭제 | 이유 |
|-----------|------|
| `case03_authorityFollowUp` + `case03_repeatFollowUp` → **`case03_explanationTrajectory`** | 설명·출석 후 기관 반응·반복 요구 **이중 수집** |
| **Phase2 `case03_inquiryFocus` 재노출 삭제** | Phase1 동일 id — **NEVER ASK AGAIN** (추가 가치 없음) |
| `inquiryFocus.unclear` + `inquiryFocus.unsure` → **`focus_not_understood`** | 동의어 |
| `prepRequired.unknown` + `prepRequired.unsure` → **`prep_unknown`** | 동의어 |
| `deadline` 5+DI → **4+DI** | QG-01 |

---

## 1. Phase1 (화면 순서)

### 1.1 `case03_authorityDemand` (상황형)

**질문:** 교통국에서는 이 문제와 관련해 **무엇을 하라고** 안내했나요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `reason_unclear` | **왜 출석·설명**해야 하는지 **모르겠고**, 안내 **문구만** 받았습니다. |
| `specific_incident` | **특정 사건·행동**에 대해 **설명**하라는 요청을 받았고, **그 사건**은 대략 알고 있습니다. |
| `submission_review` | **제출·신청 내용 확인** 때문에 **설명**하라는 요청을 받았습니다. |
| `repeat_demand` | **이미 설명했는데** **다시 출석·설명**을 요구받았습니다. |
| `prep_unclear` | **출석·설명**은 요구됐으나 **무엇을 준비**할지 **모르겠습니다**. |
| (DI) | 직접 설명 |

**fact_dimensions:** `demand_type` · `prior_response` (none \| done \| repeat)

---

### 1.2 `case03_inquiryFocus` (상황형 · Phase1만)

**질문:** 교통국이 **무엇을 확인**하려는 것 같나요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `action_facts` | **제 행동·당시 상황**을 확인하려는 것으로 이해했습니다. |
| `submitted_docs` | **제출 서류·정보**를 확인하려는 것으로 이해했습니다. |
| `specific_event` | **특정 날짜·사건**을 확인하려는 것으로 이해했습니다. |
| `focus_not_understood` | **무엇을 확인**하려는지 **명확하지 않거나** 설명을 **이해하지 못했습니다**. |
| (DI) | 직접 설명 |

**폐기:** `unclear`, `unsure` → `focus_not_understood`

---

### 1.3 `case03_customerResponse` (상황형)

**질문:** 출석·설명 요구 **이후** 제가 한 일과 **기관 반응**을 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `none` | **설명·방문을 하지 않았고**, 기관 **답변도 없습니다**. |
| `phone_no_reply` | **전화·메시지로만** 문의·설명했고 **서면 답변**은 없습니다. |
| `phone_replied` | **전화·메시지**로 문의했고 **답변**은 받았습니다. |
| `attended` | **지정 장소에 방문**해 설명했고 **접수·메모**는 받았거나 없습니다. |
| `explained_with_docs` | **설명과 함께 서류**를 제출했고 **접수 여부**는 확인 중입니다. |
| `other_channel` | **전화·방문 외 방식**으로 대응했습니다. |
| (DI) | 직접 설명 |

**fact_dimensions:** `channel` · `authority_reply` · `docs_submitted`

---

### 1.4 `case03_confirmGoal` (상황형)

**질문:** 이 출석·소명 사건에서 **가장 먼저** 확인하려는 것은 무엇인가요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `prepare_materials` | **준비할 자료·내용**이 우선이고 **목록**은 일부만 압니다. |
| `sufficient_explanation` | **이미 한 설명이 충분한지**가 우선입니다. |
| `deadline_attendance` | **출석 기한·필수 여부**가 우선입니다. |
| `repeat_response` | **다시 무엇을 해야 하는지**가 우선입니다. |
| `unsure` | **무엇부터 할지** 정하지 못했습니다. |
| (DI) | 직접 설명 |

---

### 1.5 `case03_deadline` (상황형)

**질문:** **출석·소명 기한**을 어디까지 확인했나요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `specific_date` | **정확한 날짜**를 확인했고 아래에 적을 수 있습니다. |
| `window_only` | **기간만** 안내됐고 **날짜**는 계산하지 못했습니다. |
| `exists_date_unknown` | **기한은 있다**고만 알고 **언제인지** 못 찾았습니다. |
| `not_checked` | **기한 문구**를 읽지 않았거나 **확인하지 못했습니다**. |
| (DI) | 직접 설명 |

**requires_text_key:** `specific_date` → `case03_deadlineDate`

---

### 1.6 `case03_deadlineDate` (text)

**질문:** 확인한 출석·소명 기한은 언제인가요?

---

## 2. Phase2 (화면 순서)

### 2.1 `case03_attendancePlace` (text · `customerResponse=attendance`)

**질문:** 출석·소명 장소는 어디인가요?

### 2.2 `case03_factRelationship` (상황형)

**질문:** 기관이 확인하려는 내용과 **실제 상황**을 비교하면?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `match` | **대체로 맞고** 차이는 사소합니다. |
| `partial` | **일부가 다르다**고 느낍니다. |
| `mismatch` | **상당히 다릅니다**. |
| `hard_to_judge` | **대조할 기록·증빙**이 없어 **비교 자체가 어렵습니다**. |
| `unknown` | **문장 의미**를 몰라 **판단할 수 없습니다**. |
| (DI) | 직접 설명 |

**QG-04:** `hard_to_judge`/`unknown` 시 **prep·explanation 세부에서 recall 신호 반복 금지**

---

### 2.3 `case03_explanationDetail` (상황형 · responded)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `full_explanation` | **알고 있는 사실**을 **직접 설명**했습니다. |
| `with_submitted_docs` | **설명과 서류**를 **함께 제출**했습니다. |
| `partial_explanation` | **일부만** 설명했고 **충분히 못 했습니다**. |
| `agency_redemand` | **설명 후** **다른 내용·자료**를 **다시 요구**받았습니다. |
| `attended_insufficient` | **출석했으나** **무엇을 설명할지 몰라** 충분히 못 했습니다. |
| (DI) | 직접 설명 |

---

### 2.4 `case03_explanationTrajectory` (상황형 · **신규 합침**)

**질문:** 설명·출석 **이후** 기관 안내·반복 요구를 **한 번에** 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `proceed_no_more` | **추가 없이** 절차 **진행** 안내를 받았습니다. |
| `more_explanation` | **추가 설명·소명**을 요구받았습니다. |
| `more_docs` | **추가 자료**를 요구받았습니다. |
| `re_attendance` | **다시 출석**하라고 했습니다. |
| `other_procedure` | **납부·보완·처분** 등 **다른 절차** 안내를 받았습니다. |
| `repeat_multiple` | **설명·출석·자료**를 **여러 번** 다시 요구받았습니다. |
| `no_response` | **아직 답변**이 없습니다. |
| `guidance_unclear` | **답변은 있으나** 뜻을 **정리하지 못했습니다**. |
| (DI) | 직접 설명 |

**폐기:** `authorityFollowUp`, `repeatFollowUp`

---

### 2.5 `case03_prepRequired` (상황형 · `customerResponse=none` 등)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `documents` | **서류·증빙**을 가져가야 할 것 같습니다. |
| `explanation` | **사실 정리·설명** 준비가 필요합니다. |
| `attendance_only` | **출석만** 하면 될 것 같습니다. |
| `prep_unknown` | **무엇을 준비**할지 **모르겠습니다**. |
| (DI) | 직접 설명 |

**폐기:** `unknown`, `unsure` → `prep_unknown`

---

### 2.6~2.9 text·evidence·blockage·finalGoal

- `case03_attendanceWhenWhere` (text · evidence attendance_notice)
- `case03_prepAttendanceDate` (text · prep attendance_only)
- `case03_blockage` — 상황형 5+DI (고밀도 문안 유지·slug 동일)
- `case03_evidence` — 목록형 multi
- `case03_finalGoal` — 상황형 tail (confirmGoal 중복 slug 제외)

---

## 3. 옛 → 새 slug (요약)

| 옛 | 새 |
|----|-----|
| `deadline.uncertain` | `exists_date_unknown` |
| `deadline.period_stated` | `window_only` |
| `deadline.unsure` | `not_checked` |
| `inquiryFocus.unclear` / `unsure` | `focus_not_understood` |
| `prepRequired.unknown` / `unsure` | `prep_unknown` |
| `customerResponse.phone_message` | `phone_no_reply` / `phone_replied` |
| `authorityFollowUp.*` + `repeatFollowUp.*` | `explanationTrajectory.*` |
| **삭제** Phase2 `inquiryFocus` 재질문 | — |

---

## 4. QG 점검

| 게이트 | 결과 |
|--------|------|
| QG-01 | **해소함** |
| QG-02 | **해소함** — customerResponse 분기 |
| QG-03 | **해소함(문서)** · append return **남음(코드)** |
| QG-04 | **해소함** — inquiryFocus 단일 · recall 단일 출구 |

---

*2번창 — 문서만.*
