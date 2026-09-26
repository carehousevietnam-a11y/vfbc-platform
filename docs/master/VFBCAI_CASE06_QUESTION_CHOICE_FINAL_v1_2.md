# VFBCAI CASE_06 질문·선택지 FINAL v1.2

| 항목 | 내용 |
|------|------|
| **성격** | v1 재작성안 + v1.1 (D03/D06) **통합 SoT** — 고객向 전문 |
| **LOCK** | 선택지 **최대 5 + DI** · D03 제2 사실은 규칙 충족 시만 |
| **DI** | slug `other` · 「위에 내용이 없거나 설명이 필요합니다 → 직접 입력」 |
| **근거** | REWRITE_MASTER v1/v1_1 · FIVE_CAP_INVENTORY v1_1 · CASE_01 Brief v3 부록 A |

---

## 공통 — 직접 입력

모든 선택형 질문에 **6번째** 선택으로 다음을 둡니다.

| slug | 고객向 문안 |
|------|-------------|
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

## Phase1 (화면 순서)

### `case06_requiredActionCandidate`

| 항목 | 내용 |
|------|------|
| **노출 조건** | CASE_06 Phase1 체인 진입 시 항상 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국·관계 기관에서 **무엇을 하라고** 안내한 것에 가장 가깝나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `pay_demand` | **돈을 내라**고 안내 받았습니다. |
| `attend_explain` | **출석·방문해 설명**하라고 안내 받았습니다. |
| `submit_supplement` | **서류 제출·보완**하라고 안내 받았습니다. |
| `disposition_notice` | **처분·제재** 관련 안내·통지를 받았습니다. |
| `problem_action_unclear` | **문제가 있다**고만 들었고 **무엇을 해야 할지** 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `action_candidate` = pay_demand | attend_explain | submit_supplement | disposition_notice | problem_action_unclear | other

**choice_facts:**

| slug | facts |
|------|-------|
| `pay_demand` | action_candidate=pay_demand |
| `attend_explain` | action_candidate=attend_explain |
| `submit_supplement` | action_candidate=submit_supplement |
| `disposition_notice` | action_candidate=disposition_notice |
| `problem_action_unclear` | action_candidate=problem_action_unclear |

---

### `case06_knowledgeSource`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · requiredActionCandidate 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 그 안내를 **어떻게 알게** 되었나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `doc_read_understood` | **문서를 직접 봤고** 내용을 **어느 정도 이해**했습니다. |
| `doc_read_not_understood` | **문서는 봤지만** 뜻을 **이해하지 못했습니다**. |
| `explained_without_doc` | **문서 없이** 기관·타인 **설명**만 들었습니다. |
| `memory_only_no_doc_now` | **문서는 있었으나** 지금은 없고 **기억**만 있습니다. |
| `path_unclear` | **문서·경로**가 **불분명**합니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `source_kind` · `understanding` (문서 v1 유지)

---

### `case06_sourceChannel`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · knowledgeSource 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 안내를 **어떤 경로**로 받았나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `gov_document_direct` | **정부 문서**를 직접 확인했습니다. |
| `gov_contact_direct` | **기관 전화·문자·방문**으로 직접 받았습니다. |
| `via_agent_or_company` | **대리인·회사**가 전달했습니다. |
| `via_acquaintance_relay` | **지인**이 전달했습니다. |
| `source_unknown` | **출처**를 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case06_deadlineActionPair`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · sourceChannel 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | **언제까지 무엇을** 하라고 안내받았나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `deadline_pay_by_date` | **특정 날짜까지 납부**하라고 했고 **날짜**를 아래에 적을 수 있습니다. |
| `deadline_submit_by_date` | **특정 날짜까지 제출·보완**하라고 했습니다. |
| `deadline_attend_by_date` | **특정 날짜에 출석·설명**하라고 했습니다. |
| `action_unclear_timing` | **할 일은 있으나** **언제·무엇**인지 **모릅니다**. |
| `no_deadline_stated` | **기한 안내**를 받지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**impossible_combinations:**

- `*_by_date` 선택 시 `case06_deadlineDate` 텍스트 필수 (QG-03)

---

### `case06_deadlineDate`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `deadlineActionPair` ∈ {deadline_pay_by_date, deadline_submit_by_date, deadline_attend_by_date} |
| **질문 유형** | 텍스트 입력 |
| **질문 문장** | 확인한 기한·날짜는 언제인가요? |

**placeholder:** 기억나는 날짜·기한을 적어 주세요.

---

### `case06_customerResponse`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · deadlineActionPair(및 조건부 deadlineDate) 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 그 안내에 대해 **지금까지** 한 일을 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `no_response_yet` | **아무 대응도 하지 않았습니다**. |
| `inquired_authority` | **기관에 문의**했습니다. |
| `prepared_or_submitted_docs` | **서류 준비·제출**했습니다. |
| `paid_or_attempted_pay` | **납부했거나** 납부 **시도**했습니다. |
| `attended_then_redemand` | **출석·설명 후** **다시 요구**를 받았습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

## 브리지 체인 (Phase1 이후 · CASE_01~05)

`requiredActionCandidate` 확정 후 **대상 CASE** Master funnel로 이어집니다. 아래는 CASE_06 전용 Phase1만 본 FINAL SoT이며, 분기 후 질문·선택지는 **해당 CASE FINAL v1.2**를 따릅니다.

| 분기 후보 | 대표 chain | 합침 원칙 |
|-----------|------------|-----------|
| 납부 | `case06_paymentResponse` + `paymentAuthorityCheck` | trajectory 단일 |
| 출석 | `attendanceResponse` + `attendanceAuthorityReaction` | trajectory 단일 |
| 보완 | `submissionResponse` + `submissionAuthorityReaction` | trajectory 단일 |
| 처분 | `dispositionResponse` | CASE_05 `authorityTrajectory` 동형 |
| 불명확 | `unclearResponse` + `classificationStatus` | interpret 단일 |

**QG-04:** `hard_to_tell` / `hard_to_recall` 류는 **경로당 1질문** — chain 필드 간 recall **금지**.

---

## QG · D03 · D06 (CASE_06)

| 게이트 / 규칙 | v1.2 판정 |
|---------------|-----------|
| QG-01 | `deadlineActionPair` 기한·행동 묶음 |
| QG-02 | `customerResponse` 복합 — 분기 CASE에서 trajectory |
| QG-03 | `*_by_date` → `case06_deadlineDate` |
| QG-04 | `knowledgeSource` 단일 recall |
| D03 | `requiredActionCandidate` 제2 사실 **미부착** (v1.1) |
| D06 | Phase1 전 필드 **≤5 + DI** |

---

## 옛 slug → 새 slug

| 구분 | 옛 slug | 새 slug | 비고 |
|------|---------|---------|------|
| Legacy | profileAuthorityGuidance.uncertain | deadlineActionPair.action_unclear_timing |  |
| Legacy | profileAuthorityGuidance.specific_date | deadline_*_by_date + case06_deadlineDate |  |
| v1.1 D03 | pay_demand 등 제2 사실 문구 | — | 미부착 · 분기 CASE에서 수집 |

---

*v1.2 FINAL — 문서 SoT · 코드 미반영*
