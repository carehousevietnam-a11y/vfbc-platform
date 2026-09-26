# VFBCAI CASE_04 질문·선택지 FINAL v1.2

| 항목 | 내용 |
|------|------|
| **성격** | v1 재작성안 + v1.1 (D03/D06) **통합 SoT** — 고객向 전문 |
| **LOCK** | 선택지 **최대 5 + DI** · D03 제2 사실은 규칙 충족 시만 |
| **DI** | slug `other` · 「위에 내용이 없거나 설명이 필요합니다 → 직접 입력」 |
| **근거** | REWRITE_MASTER v1/v1_1 · FIVE_CAP_INVENTORY v1_1 §2.5~2.8 · CASE_04 Phase1/2 설계 |

---

## 공통 — 직접 입력

모든 선택형 질문에 **6번째** 선택으로 다음을 둡니다.

| slug | 고객向 문안 |
|------|-------------|
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

## Phase1 (화면 순서)

### `case04_supplementTarget`

| 항목 | 내용 |
|------|------|
| **노출 조건** | CASE_04 Phase1 체인 진입 시 항상 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국에서 **기존 제출분에 대해 무엇을 다시 하라고** 안내했는지, 제가 이해한 수준으로 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `additional_docs` | **빠진 서류·자료를 추가**하라는 안내를 받았습니다. |
| `add_content_evidence` | **내용·정보·증빙이 부족**하다는 안내를 받았습니다. |
| `modify_existing` | **형식·작성 방법·기재 오류** 때문에 **다시 제출·수정**하라는 안내를 받았습니다. |
| `repeat_demand` | **이미 보완 제출했는데** 또 **추가·수정**을 요구받았습니다. |
| `unclear` | **무엇을 보완해야 하는지** 문구부터 이해하기 어렵습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `demand_kind` = add_doc | add_content | modify | repeat | unclear | other

**impossible_combinations:**

- `demand_kind=unclear` + 구체 서류 종류 slug 단독 확정 (별 질문·상세에서 처리)

**choice_facts:**

| slug | facts |
|------|-------|
| `additional_docs` | demand_kind=add_doc |
| `add_content_evidence` | demand_kind=add_content |
| `modify_existing` | demand_kind=modify |
| `repeat_demand` | demand_kind=repeat |
| `unclear` | demand_kind=unclear |

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 안내 **종류·항목**을 일부만 읽음 · **이전 접수** 확인 여부 등 | **제2 사실** — 5 slug는 **요구 유형**만 (`customerResponse`·Phase2) |

---

### `case04_confirmGoal`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · supplementTarget 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이 보완 사건에서 **지금 가장 먼저** 확인·준비하려는 것은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `understand_materials` | **어떤 자료를 더 내야 하는지**가 우선입니다. |
| `understand_insufficient` | **이미 낸 자료가 왜 부족한지**가 우선입니다. |
| `prepare_materials` | **추가 자료 준비 방법**이 우선입니다. |
| `repeat_reason` | **다시 요구하는 이유**가 우선입니다. |
| `unsure` | **무엇부터 할지** 아직 정하지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `primary_goal` = understand_materials | understand_insufficient | prepare_materials | repeat_reason | unsure | other

**choice_facts:** slug ↔ `primary_goal` 1:1

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 안내 **읽음 정도** · **양식·번역** 확인 단계 · **요구서·기한·제출 이력** 미정리 | **제2 사실** — `customerResponse`·`deadline`·Phase2 |

---

### `case04_customerResponse`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · confirmGoal 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 보완 안내를 받은 **이후** 제가 한 일을 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `not_started` | **준비·재제출을 하지 않았고**, 기관 **연락·답변도 없습니다**. |
| `preparing` | **보완 자료를 준비 중**이고, **아직 제출하지 않았습니다**. |
| `submitted_no_receipt` | **보완 자료를 제출했지만** 접수 확인·접수번호는 **아직 못 받았습니다**. |
| `submitted_receipt_ok` | **보완 자료를 제출했고** 접수·접수번호 **안내를 받았습니다**. |
| `inquired_no_answer` | **문의만** 했고, **서면·접수 답변**은 아직 없습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `action_taken` = not_started | preparing | submitted_pending_receipt | submitted_receipt_ok | inquired_pending | other

**impossible_combinations:**

- `action_taken=not_started` + 기관 **답변 수신** 확정 (별 축)

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 문의 후 **답변**은 받았으나 보완 제출까지는 하지 않음 (`inquired_answered`) | 답변 수신·미제출 세부는 **제2 사실** — 5 slug는 **대응 종류**만 |
| **재제출·전화 문의와 다른 방식**으로 대응 (`acted_other_channel`) | 방문·대행·온라인 등 경로 다양 — **DI** |

**choice_facts:**

| slug | facts |
|------|-------|
| `not_started` | action_taken=not_started |
| `preparing` | action_taken=preparing |
| `submitted_no_receipt` | action_taken=submitted_pending_receipt |
| `submitted_receipt_ok` | action_taken=submitted_receipt_ok |
| `inquired_no_answer` | action_taken=inquired_pending |

---

### `case04_deadline`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · customerResponse 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 보완 **제출 기한**을 지금 어디까지 확인했나요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `specific_date` | **정확한 마감일**을 안내·통지에서 확인했고, 아래 칸에 적을 수 있습니다. |
| `window_only` | **「N일 이내」 등 기간만** 안내됐고 **달력 날짜**는 아직 계산·확인하지 못했습니다. |
| `exists_date_unknown` | **기한이 있다는 것만** 알고 **언제인지**는 못 찾았거나 여러 문구가 충돌합니다. |
| `not_checked` | **기한 문구를 아직 읽지 않았거나**, 통지에 기한이 있는지 **확인하지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `deadline_certainty` = date | window | exists_unknown | not_checked | other

**impossible_combinations:**

- `specific_date` 선택 시 `case04_deadlineDate` 텍스트 필수 (QG-03)

---

### `case04_deadlineDate`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case04_deadline` = `specific_date` |
| **질문 유형** | 텍스트 입력 |
| **질문 문장** | 확인한 보완 제출 기한은 언제인가요? |

**placeholder:** 기억나는 날짜·기한을 적어 주세요.

---

## Phase2 (화면 순서)

### `case04_initialSubmission`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 체인 진입 시 (Phase1 완료 후) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | **처음** 교통국에 제출했던 범위를 골라 주세요. |

#### 선택지 (내용 3 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `complete` | **필요 서류를 모두** 제출했다고 생각하고, **제출 목록**은 일부 기억합니다. |
| `partial` | **일부만** 제출했고, **빠진 것이 있을 수** 있다고 느낍니다. |
| `hard_to_confirm` | **무엇을 제출했는지** 정확히 기억하기 어렵고, **사본·접수증**을 아직 찾지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `first_submit_scope` = complete | partial | hard | other · `recall_difficulty` (clear | partial | hard)

**QG-04:** `hard_to_confirm` 선택 시 **`case04_submissionRelation` 노출 skip**

**choice_facts:**

| slug | facts |
|------|-------|
| `complete` | first_submit_scope=complete; recall_difficulty=clear |
| `partial` | first_submit_scope=partial; recall_difficulty=partial |
| `hard_to_confirm` | first_submit_scope=hard; recall_difficulty=hard |

---

### `case04_submissionRelation`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case04_initialSubmission` ≠ `hard_to_confirm` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이번 보완 요구가 **처음 제출**과 비교하면 어떤 상황인가요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `add_missing` | **처음 안 낸 새 자료**를 추가하라는 요구입니다. |
| `modify_content` | **이미 낸 자료를 수정·재제출**하라는 요구입니다. |
| `support_existing` | **기존 자료는 맞지만** 설명·증빙을 **더** 하라는 요구입니다. |
| `mismatch_request` | **같은 자료를 이미 냈는데** 다시 제출하라고 들었습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `relation_kind` = add_missing | modify | support | mismatch | other

**폐기 slug:** `hard_to_judge` → `initialSubmission.hard_to_confirm`으로 흡수 (QG-04)

**choice_facts:** slug ↔ `relation_kind` 1:1 (`modify_content` → modify)

---

### `case04_supplementReason`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · initialSubmission(및 조건부 submissionRelation) 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국이 말한 **보완 이유**를 제가 이해한 수준으로 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `missing_info` | **빠진 정보·서류**가 있다고 들었고, **어느 항목**인지는 부분만 압니다. |
| `incorrect_content` | **내용·기재 오류**가 있다고 들었고, **수정 위치**는 찾는 중입니다. |
| `insufficient_proof` | **증빙이 부족**하다고 들었고, **어떤 증빙**인지는 일부만 압니다. |
| `no_reason` | **이유 없이** 보완만 요구했거나, **구체 사유**가 없습니다. |
| `unsure` | **이유 문구**를 읽었으나 **해석하지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `reason_kind` = missing | incorrect | insufficient_proof | no_reason | unsure | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 사유 **항목명**·**문단 위치**만 알고 대조는 못 함 | **제2 사실** — `addDocDetail`·`blockage`·**DI** |

**choice_facts:** slug ↔ `reason_kind` 1:1

---

### `case04_addDocDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case04_supplementTarget` = `additional_docs` |
| **질문 유형** | 목록형 · 복수 선택 |
| **질문 문장** | 추가로 제출해야 하는 **서류 종류**를 골라 주세요. (여러 개 선택 가능) |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `id_doc` | **신분·인적** 관련 서류를 추가로 내야 한다고 이해했습니다. |
| `financial_doc` | **재무·금액** 관련 서류를 추가로 내야 한다고 이해했습니다. |
| `certificate` | **증명서·확인서**를 추가로 내야 한다고 이해했습니다. |
| `translation` | **번역·공증** 관련 서류를 추가로 내야 한다고 이해했습니다. |
| `unsure` | **어떤 서류를 추가**해야 하는지 아직 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `add_doc_kind` (복수) = id | financial | certificate | translation | unsure | other

---

### `case04_modifyDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case04_supplementTarget` = `modify_existing` |
| **질문 유형** | 목록형 · 복수 선택 |
| **질문 문장** | 수정·고쳐 써야 하는 **항목**을 골라 주세요. (여러 개 선택 가능) |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `name_info` | **이름·인적사항**을 고쳐 써야 한다고 이해했습니다. |
| `date_info` | **날짜·기간**을 고쳐 써야 한다고 이해했습니다. |
| `amount_info` | **금액·수치**를 고쳐 써야 한다고 이해했습니다. |
| `content_info` | **내용·기재사항**을 고쳐 써야 한다고 이해했습니다. |
| `unsure` | **무엇을 수정**해야 하는지 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `modify_axis` (복수) = name | date | amount | content | unsure | other

---

### `case04_evidenceDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case04_supplementTarget` = `add_content_evidence` |
| **질문 유형** | 목록형 · 복수 선택 |
| **질문 문장** | 더 요구하는 **증빙·자료 종류**를 골라 주세요. (여러 개 선택 가능) |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `proof_doc` | **증빙 서류**를 더 넣어야 한다고 이해했습니다. |
| `photo` | **사진·이미지** 자료를 더 넣어야 한다고 이해했습니다. |
| `statement` | **설명서·소명서**를 더 넣어야 한다고 이해했습니다. |
| `unsure` | **어떤 증빙을 더** 넣어야 하는지 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `evidence_detail_kind` (복수) = proof_doc | photo | statement | unsure | other

---

### `case04_unclearFocus`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case04_supplementTarget` = `unclear` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 보완 안내에서 **가장 막힌 점**을 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `what_submit_list` | **무엇을 제출해야 하는지** 자체가 가장 막막하고, **요구 목록**을 아직 정리하지 못했습니다. |
| `what_submit_apply` | **대략 무엇을 내야 하는지는 보이지만**, 제 상황에 **맞는지 판단하지 못했습니다**. |
| `why_submit` | **왜 보완이 필요한지**가 가장 어렵거나, **사유는 읽었지만** 제 경우에 **해당하는지 모르겠습니다**. |
| `format_how` | **양식·작성 형식**이 가장 어렵고, **어떻게 작성·첨부**해야 할지 정리하지 못했습니다. |
| `format_where` | **형식은 어느 정도 알겠지만**, **어디로·어떤 경로**(온라인·방문 등)로 제출해야 하는지 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `unclear_axis` = what_list | what_apply | why | format_how | format_where | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **사유 문장만** 막힘 (`why_submit_reason`) · **사유 적용** 막힘 (`why_submit_apply`) | `why_submit` slug에 **흡수** — 구체 문단·사례는 **DI** |

**choice_facts:**

| slug | facts |
|------|-------|
| `what_submit_list` | unclear_axis=what_list |
| `what_submit_apply` | unclear_axis=what_apply |
| `why_submit` | unclear_axis=why |
| `format_how` | unclear_axis=format_how |
| `format_where` | unclear_axis=format_where |

---

### `case04_supplementTrajectory`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `customerResponse` ∈ {`submitted_no_receipt`, `submitted_receipt_ok`} 또는 DI(문의 답변·기타 대응) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 보완 **제출·문의 이후** 기관 안내·반복 요구를 **한 번에** 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `accepted_waiting` | **접수됐다**는 안내를 받고 **추가 요구 없이** 검토·처리 **대기** 중입니다. |
| `more_after_accept` | **접수·제출 이후** **다른 종류 서류**를 또 요구받았거나 **비슷한 서류**를 다시 요구받았고, **이미 고친 부분을 다시** 고치라는 말을 들었거나 **처음과 다른 항목**을 고치라는 말을 들었습니다. |
| `receipt_unconfirmed` | **보완을 제출했으나** 접수 여부·접수번호를 **아직 확인하지 못했습니다**. |
| `no_response` | **제출·문의 이후 아직** 기관 **답변·안내가 없습니다**. |
| `guidance_unclear` | **답변·안내는 받았으나** 무엇을 추가·수정·재제출해야 하는지 **정리하지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `trajectory_class` = waiting | more_after_accept | receipt_unconfirmed | no_response | guidance_unclear | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 접수 후 **다른 종류** 추가 (`accepted_more_docs`) | `more_after_accept`에 **흡수** |
| 접수 후 **같은·유사 종류** 반복 (`accepted_more_same`) | `more_after_accept`에 **흡수** |
| **이미 수정한 부분** 재수정 (`modify_again_prior`) | `more_after_accept`에 **흡수** |
| **다른 항목** 수정 요구 (`modify_again_new_field`) | `more_after_accept`에 **흡수** |
| **납부·과태료** 등 보완 외 요구 | 유형 희소·다양 — **DI** |

**choice_facts:**

| slug | facts |
|------|-------|
| `accepted_waiting` | trajectory_class=waiting |
| `more_after_accept` | trajectory_class=more_after_accept |
| `receipt_unconfirmed` | trajectory_class=receipt_unconfirmed |
| `no_response` | trajectory_class=no_response |
| `guidance_unclear` | trajectory_class=guidance_unclear |

**폐기 질문:** `case04_authorityFollowUp` · `case04_repeatSupplement` → 본 질문으로 합침

---

### `case04_blockage`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · supplementTrajectory(또는 미노출 경로) 이후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 지금 이 보완 사건에서 **가장 막힌 부분**은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `what_submit` | **무엇을 추가·수정**해야 하는지 모르겠습니다. |
| `why_submit` | **왜 보완이 필요한지** 이해하지 못했습니다. |
| `format` | **형식·제출 방법**(양식·온라인·방문)을 모르겠습니다. |
| `deadline` | **언제까지** 제출해야 하는지 모르겠습니다. |
| `after_submit` | **제출 후 다음 절차**·기관 답변을 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `block_axis` = what | why | format | deadline | after_submit | other

**choice_facts:** slug ↔ `block_axis` 1:1

---

### `case04_evidence`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · blockage 답변 후 |
| **질문 유형** | 목록형 · 복수 선택 |
| **질문 문장** | 보완 요구와 관련해 **지금 활용 가능한 자료**를 골라 주세요. (여러 개 선택 가능) |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `supplement_notice` | **보완 요구서·안내문**(또는 동일 내용 통지)을 가지고 있습니다. |
| `message` | **기관 문자·전화·이메일·메신저** 등 연락 내용을 가지고 있습니다. |
| `original_submission` | **처음 제출한 서류 사본**을 가지고 있습니다. |
| `supplement_submission` | **보완으로 제출한 서류 사본**을 가지고 있습니다. |
| `none` | **관련 자료가 없습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `evidence_kind` (복수) = notice | message | original | supplement | none | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **있는지 아직 확인 못 함** (`unsure`) | 보유 여부 미확인 — **DI** |
| **접수증·영수증**만 별도 보유 | 종류 다양 — **DI** |

---

### `case04_finalGoal`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 tail · evidence 답변 후 · Phase1 `confirmGoal`과 **동일 slug 제외** |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 아직 덜 확인된 것 중, **이번 검토에서 우선**하고 싶은 것은 무엇인가요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `what_supplement` | **무엇을 보완해야 하는지** 확인하고 싶습니다. |
| `why_supplement` | **왜 보완이 필요한지** 확인하고 싶습니다. |
| `how_supplement` | **어떻게 보완·제출**해야 하는지 확인하고 싶습니다. |
| `next_step` | **제출 후 다음 절차**를 확인하고 싶습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `final_priority` = what_supplement | why_supplement | how_supplement | next_step | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **기한·마감**만 우선 (`deadline`) | `case04_deadline`·`blockage.deadline`과 역할 분리 — **DI** |
| **VFBCAI 전문가팀** 연결 | 결과 화면 **전문가 CTA** — **DI** |
| **우선순위 정하기 어려움** | 복합 — **DI** |

---

## 옛 slug → 새 slug

| 구분 | 옛 slug | 새 slug | 비고 |
|------|---------|---------|------|
| deadline | `uncertain` | `exists_date_unknown` | |
| deadline | `period_stated` | `window_only` | |
| deadline | `unsure` | `not_checked` | |
| supplementTarget v1 | 제2 사실 문구 (읽음·대조·접수) | — | v1.1 D03 미부착 |
| confirmGoal v1 | `prep_stage` 축 | — | v1.1 삭제 |
| customerResponse | `inquired_answered` | `other` (DI) | §2.5 |
| customerResponse | `acted_other_channel` | `other` (DI) | §2.5 |
| customerResponse | `submitted` | `submitted_no_receipt` 또는 `submitted_receipt_ok` | 접수 분기 |
| customerResponse | `inquired` | `inquired_no_answer` 또는 DI | 답변 수신 DI |
| customerResponse | `other_method` | `other` (DI) | `acted_other_channel` 동형 |
| submissionRelation | `hard_to_judge` | — | `initialSubmission.hard_to_confirm` |
| unclearFocus | `why_submit_reason` · `why_submit_apply` | `why_submit` | §2.6 |
| trajectory | `accepted_more_docs` · `accepted_more_same` | `more_after_accept` | §2.7 |
| trajectory | `modify_again_prior` · `modify_again_new_field` | `more_after_accept` | §2.7 |
| trajectory | `authorityFollowUp.*` · `repeatSupplement.*` | `supplementTrajectory.*` | 2질문 합침 |
| authorityFollowUp | `more_supplement` · `more_docs` | `more_after_accept` | |
| repeatSupplement | `more_docs_new_kind` | `more_after_accept` | |
| repeatSupplement | `more_docs_same_kind` | `more_after_accept` | |
| repeatSupplement | `more_modify_reject_prior` | `more_after_accept` | |
| repeatSupplement | `more_modify_new_field` | `more_after_accept` | |
| evidence | `unsure` | `other` (DI) | §2.8 |
| **삭제 질문** | `case04_authorityFollowUp` | — | trajectory 합침 |
| **삭제 질문** | `case04_repeatSupplement` | — | trajectory 합침 |

---

*v1.2 FINAL — 문서 SoT · 코드 미반영*
