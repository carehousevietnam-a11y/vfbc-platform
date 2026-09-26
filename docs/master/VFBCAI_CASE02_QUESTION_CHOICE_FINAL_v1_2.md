# VFBCAI CASE_02 질문·선택지 FINAL v1.2

| 항목 | 내용 |
|------|------|
| **성격** | v1 재작성안 + v1.1 (D03/D06) **통합 SoT** — 고객向 전문 |
| **LOCK** | 선택지 **최대 5 + DI** · D03 제2 사실은 규칙 충족 시만 |
| **DI** | slug `other` · 「위에 내용이 없거나 설명이 필요합니다 → 직접 입력」 |
| **근거** | REWRITE_MASTER v1/v1_1 · FIVE_CAP_INVENTORY v1_1 §2.2 · CASE_02 Phase1/2 설계 |

---

## 공통 — 직접 입력

모든 선택형 질문에 **6번째** 선택으로 다음을 둡니다.

| slug | 고객向 문안 |
|------|-------------|
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

## Phase1 (화면 순서)

### `case02_paymentSubject`

| 항목 | 내용 |
|------|------|
| **노출 조건** | CASE_02 Phase1 체인 진입 시 항상 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국에서 **무엇에 대한 비용**을 내라고 안내했나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `fine_penalty` | **벌금·과태료**를 내라는 안내를 받았습니다. |
| `fee_charge` | **수수료·비용**을 내라는 안내를 받았습니다. |
| `tax_or_arrears` | **세금·체납·기존 부담**을 내라는 안내로 이해했습니다. |
| `mixed_items` | **여러 항목**이 섞여 있다고 이해했습니다. |
| `unclear` | **무슨 종류의 납부**인지 **아직 모르겠습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `payment_kind` = fine_penalty \| fee_charge \| tax_or_arrears \| mixed_items \| unclear \| other

**제2 사실 (D03):** `fine_penalty`에 **항목·문구 이해** 부착 **금지** — `paymentInfoSource`·Phase2 `paymentBasis`에서 수집.

**choice_facts:**

| slug | facts |
|------|-------|
| `fine_penalty` | payment_kind=fine_penalty |
| `fee_charge` | payment_kind=fee_charge |
| `tax_or_arrears` | payment_kind=tax_or_arrears |
| `mixed_items` | payment_kind=mixed_items |
| `unclear` | payment_kind=unclear |

---

### `case02_paymentInfoSource`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · paymentSubject 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | **납부 안내**를 어떻게 알게 되었나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `official_notice` | **공식 통지·문서**를 직접 받았습니다. |
| `phone_message` | **전화·문자**로 안내를 받았습니다. |
| `in_person` | **방문·창구**에서 안내를 받았습니다. |
| `indirect` | **대행·지인·회사**를 통해 들었고 **원문**은 아직 못 봤습니다. |
| `unsure` | **경로**를 정확히 말하기 **어렵습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `info_channel` = official_notice \| phone_message \| in_person \| indirect \| unsure \| other

**choice_facts:** slug ↔ `info_channel` 1:1

---

### `case02_situationMatch`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · paymentInfoSource 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 안내 **금액·사유**와 제 **실제 상황**을 비교하면? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `match` | **대체로 맞고** 차이는 사소합니다. |
| `amount_differs` | **금액**이 제가 아는 것과 **다릅니다**. |
| `reason_differs` | **사유**가 제 상황과 **다릅니다**. |
| `both_differs` | **금액과 사유 모두** 다르게 느껴집니다. |
| `paid_redemand` | **이미 낸 적** 있는데 **다시** 내라고 들었습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `situation_alignment` = match \| amount_differs \| reason_differs \| both_differs \| paid_redemand \| other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **대조할 자료**가 없어 판단하기 어려움 (구 `hard_to_judge`) | FIVE_CAP §2.2 — 6→5 · QG-04 단일 recall은 Phase2 `blockage`와 분리 · **DI** |

**choice_facts:** slug ↔ `situation_alignment` 1:1

---

### `case02_paymentAmount`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · situationMatch 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 안내 **금액**을 제가 아는 수준으로 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `amount_stated_clear` | **통지·안내에 금액**이 있고 **그 숫자**를 알고 있습니다. |
| `amount_approx` | **대략적인 금액**만 알고 **정확한 숫자**는 모릅니다. |
| `amount_conflicting` | **여러 번 다른 금액**으로 안내를 받았습니다. |
| `amount_not_given` | **금액 안내**를 아직 받지 못했습니다. |
| `amount_differs` | **안내 금액**이 제가 아는 것과 **다릅니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `amount_knowledge` = stated_clear \| approx \| conflicting \| not_given \| differs \| other

**impossible_combinations:**

- `amount_stated_clear` · `amount_differs` 등 정책 slug → `case02_paymentAmountDetail` 텍스트 **필수** (QG-03 · IMPLEMENTER SoT 유지)

**choice_facts:** slug ↔ `amount_knowledge` 1:1

---

### `case02_paymentAmountDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case02_paymentAmount` ∈ {`amount_stated_clear`, `amount_differs`, …} (정책 slug) |
| **질문 유형** | 텍스트 입력 |
| **질문 문장** | 안내·기억나는 **금액**(또는 차이)을 적어 주세요. |

**placeholder:** 통지·안내에 적힌 숫자, 또는 제가 아는 금액을 적어 주세요. (환율·추정 **생성 금지**)

---

### `case02_paymentStatus`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · paymentAmount(·Detail) 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | **납부**를 한 상태와 **기관 확인**을 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `not_paid` | **아직 납부하지 않았습니다**. |
| `paid_unverified` | **납부했지만** 기관 **처리·접수**는 확인하지 못했습니다. |
| `paid_verified` | **납부했고** 접수·영수 **확인**을 받았습니다. |
| `partial` | **일부만** 납부했습니다. |
| `disputing` | **납부 여부·금액**을 **다투는 중**입니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `payment_state` = not_paid \| paid_unverified \| paid_verified \| partial \| disputing \| other

**choice_facts:** slug ↔ `payment_state` 1:1

---

### `case02_confirmGoal`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · paymentStatus 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이 납부 사건에서 **가장 먼저** 확인하려는 것은? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `verify_amount` | **금액·항목**이 맞는지 확인하려 합니다. |
| `verify_reason` | **납부 사유**가 맞는지 확인하려 합니다. |
| `how_to_pay` | **납부 방법·절차**를 알려 합니다. |
| `deadline_risk` | **기한·미납 후속**을 확인하려 합니다. |
| `unsure` | **무엇부터** 할지 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `primary_goal` = verify_amount \| verify_reason \| how_to_pay \| deadline_risk \| unsure \| other

**choice_facts:** slug ↔ `primary_goal` 1:1

---

## Phase2 (주요 순서)

Phase1 Known **NEVER ASK AGAIN**. 아래는 v1 §2 표 순서·분기 기준.

### `case02_demandAuthority`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 체인 · Phase1 완료 후 (미기입 시 handoff 보강 가능) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | **납부를 요구한 기관**은 어디로 보이나요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `traffic` | **교통국·교통 관련 행정기관**에서 요구한 것으로 보입니다. |
| `police` | **경찰 등 교통 관련 기관**에서 요구한 것으로 보입니다. |
| `vehicle_reg` | **차량 등록·검사 관련 기관**에서 요구한 것으로 보입니다. |
| `other_agency` | **위에 없는 다른 기관**에서 요구한 것으로 보입니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `demand_authority` = traffic \| police \| vehicle_reg \| other_agency \| other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **어디서 요구했는지 모름** (구 `unsure`) | 발신처 불명 — **DI** |

**choice_facts:** slug ↔ `demand_authority` 1:1

---

### `case02_noticeAccessFact`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 `paymentInfoSource` ∈ {`indirect`, `unsure`} 등 **간접·불명** 경로 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 간접으로 들은 납부 안내 — **지금 자료**는 어떤 상태인가요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `access_have_copy` | 간접으로 들었지만, 지금 **안내 문서·메시지 사본**을 가지고 있습니다. |
| `access_no_copy` | 안내를 들었지만 **사본·스크린샷**을 남기지 못했습니다. |
| `access_sender_unknown` | **누가·어떤 경로**로 전달했는지 확실하지 않습니다. |
| `access_language_barrier` | **언어·통역** 때문에 안내 내용을 제대로 확인하지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `notice_access` = have_copy \| no_copy \| sender_unknown \| language_barrier \| other

**choice_facts:** slug ↔ `notice_access` 1:1

---

### `case02_paymentBasis`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · demandAuthority(·noticeAccessFact) 이후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 기관이 말하거나 적어 준 **납부 사유·근거**를 제가 이해한 수준으로 골라 주세요. |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `basis_violation_cited` | **위반 사실·행위**를 이유로 납부하라고 구체적으로 말하거나 적어 주었습니다. |
| `basis_fee_schedule` | **수수료·고시·항목 번호** 등 규정·고시를 들거나 적어 주었습니다. |
| `basis_prior_case` | **이전에 처리한 건**과 연결해 추가 납부하라고 했습니다. |
| `basis_not_explained` | **왜 이 금액을 내야 하는지** 설명이 없거나 이해하지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `payment_basis` = violation_cited \| fee_schedule \| prior_case \| not_explained \| other

**choice_facts:** slug ↔ `payment_basis` 1:1 (`basis_*` prefix 유지)

---

### `case02_deadline`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · paymentBasis 답변 후 (또는 Phase1 `deadline_risk` 등 분기) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | **납부 기한**을 지금 어디까지 확인했나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `confirmed` | **납부 마감일**을 확인했고 아래에 적을 수 있습니다. |
| `window_only` | **기간만** 안내됐고 **날짜**는 모릅니다. |
| `exists_date_unknown` | **기한은 있다**고만 알고 **언제인지** 못 찾았습니다. |
| `not_checked` | **기한**을 **확인하지 못했습니다**. |
| `unsure_total` | **기한 관련**을 **전혀 모릅니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `deadline_certainty` = confirmed \| window_only \| exists_date_unknown \| not_checked \| unsure_total \| other

**impossible_combinations:**

- `confirmed` 선택 시 `case02_deadlineDate` 텍스트 **필수** (QG-03)

**choice_facts:** slug ↔ `deadline_certainty` 1:1

---

### `case02_deadlineDate`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case02_deadline` = `confirmed` |
| **질문 유형** | 텍스트 입력 |
| **질문 문장** | 확인한 **납부 마감일**은 언제인가요? |

**placeholder:** 통지·안내에 적힌 날짜, 또는 기억나는 마감일을 적어 주세요.

---

### `case02_authorityResponse`

| 항목 | 내용 |
|------|------|
| **노출 조건** | 문의·납부 등 **기관 접촉** 이력이 있는 경로 (Phase1 status·goal 분기) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 문의·납부 등 이후 **기관 답변·반응**을 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `completed` | **추가 요구 없이 처리되었다**고 들었습니다. |
| `more_required` | **추가 서류나 자료**를 요청했습니다. |
| `re_attendance` | **다시 출석하거나 설명**하라고 했습니다. |
| `payment_demand` | **비용 납부나 다른 조치**를 안내했습니다. |
| `no_reply_yet` | **아직 답변**을 받지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `authority_reply` = completed \| more_required \| re_attendance \| payment_demand \| no_reply_yet \| other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 답변은 받았으나 **내용 이해 못함** (구 `unclear`) | 해석·절차 불명 — **DI** |
| **이후 절차**를 확인 못함 (구 `procedure_unknown`) | trajectory 세부 — **DI** |

**choice_facts:** slug ↔ `authority_reply` 1:1

---

### `case02_nonPaymentNotice`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · deadline·authorityResponse 이후 (미납·기한 축) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | **미납 시** 기관이 안내한 **후속·제재**를 골라 주세요. |

#### 선택지 (내용 3 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `sanction_enforcement_stated` | **기한 내 미납 시 추가 벌금·제재**가 있거나, **강제징수·추심** 등 후속 조치가 있다고 안내합니다. |
| `interest_stated` | **이자·가산금**이 붙는다고 안내합니다. |
| `no_notice` | **미납 시 어떻게 되는지** 안내가 없거나 **결과를 정확히 모르겠습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `non_payment_notice` = sanction_enforcement \| interest \| no_notice \| other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **벌금만**·**집행만** 따로 안내 (구 `penalty_stated` · `enforcement_stated`) | canonical **`sanction_enforcement_stated`** 로 통합 — 세부는 **DI** |

**choice_facts:** slug ↔ `non_payment_notice` 1:1

---

### `case02_blockage`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · nonPaymentNotice(·paymentMethod) 이후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 지금 이 납부 사건에서 **가장 막힌 부분**은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `obligation` | **제가 정말 납부해야 하는지**부터 확신이 없습니다. |
| `amount` | **얼마를 내야 하는지**가 가장 막힙니다. |
| `basis` | **왜 납부해야 하는지 근거**가 불분명합니다. |
| `method` | **어디서 어떻게 납부**해야 하는지 모르겠습니다. |
| `deadline` | **언제까지 납부**해야 하는지 모르거나, **이미 납부했는데 처리 여부**를 확인하지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `block_axis` = obligation \| amount \| basis \| method \| deadline \| other

**choice_facts:** slug ↔ `block_axis` 1:1

---

### `case02_evidence`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · blockage 답변 후 |
| **질문 유형** | 목록형 · 복수 선택 (v1 §2) |
| **질문 문장** | 납부 요구와 관련해 **지금 활용 가능한 자료**를 골라 주세요. (여러 개 선택 가능) |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `notice_docs` | **납부 요구서·통지서·안내문** 등을 가지고 있습니다. |
| `receipt_partial` | **영수증·이체 확인** 등 납부 관련 자료가 **일부** 있습니다. |
| `message_trail` | **문자·이메일·통화** 등 연락 내용을 가지고 있습니다. |
| `none` | **지금 확인할 수 있는 자료**가 없습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `evidence_kind` (복수) = notice_docs \| receipt_partial \| message_trail \| none \| other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **일부만 있고 무엇이 더 필요한지 모름** (구 `partial`) | 필요 목록은 전문가·결과 화면 — **DI** |
| **어떤 자료를 준비해야 하는지 모름** (구 `unsure`) | 준비 상태 미확정 — **DI** |
| **있음** 단일 (구 `yes`) | `notice_docs`·`receipt_partial`·`message_trail`로 **분해** |

---

### `case02_finalGoal`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 tail · evidence 답변 후 · Phase1 `confirmGoal`과 **동일 slug 제외** |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 아직 덜 확인된 것 중, **이번 검토에서 우선**하고 싶은 것은 무엇인가요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `verify_obligation` | **납부 의무 여부**부터 확인하고 싶습니다. |
| `verify_amount` | **금액이 맞는지** 확인하고 싶습니다. |
| `complete_payment` | **올바른 방법으로 납부**를 마치고 싶습니다. |
| `resolve_redemand` | **이미 낸 돈·재요구**가 왜 생겼는지 정리하고 싶습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `final_priority` = verify_obligation \| verify_amount \| complete_payment \| resolve_redemand \| other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **VFBCAI 전문가팀** 연결 (구 `expert`) | 결과 화면 **전문가 CTA**가 주 출구 — **DI** |
| **우선순위 정하기 어려움** | 복합 막힘 — **DI** |

---

## 부록 — 조건부 Phase2 (needs* · v1 표)

Phase1 `paymentStatus`·`confirmGoal`에 따라 **추가** 노출될 수 있는 필드입니다. 본문 §Phase2 표 순서 **뒤**에 게이트 삽입.

| id | 노출 조건 (요약) |
|----|------------------|
| `case02_paidProcessingFact` | `paymentStatus` ∈ {`paid_unverified`, `partial`, `paid_by_other`} |
| `case02_paymentMethod` | `confirmGoal` = `how_to_pay` 또는 납부 방법 불명 blockage |
| `case02_paymentConfirmationFact` | `paymentStatus` = `paid_unverified` 또는 `confirmGoal` = `payment_processed` |

각 필드 선택지·문안은 IMPLEMENTER Mission에서 v1 rewrite 고밀도 1인칭으로 **전수 확정** (본 FINAL §Phase2 주 질문이 SoT).

---

## QG · D03 · D06 요약

| 게이트 / 규칙 | v1.2 판정 |
|---------------|-----------|
| QG-01 deadline 동의어 | `window_only` / `exists_date_unknown` / `not_checked` / `unsure_total` |
| QG-02 paymentStatus 복합 | Phase1 단일 trajectory — Phase2 `paidProcessingFact`·`paymentConfirmationFact` |
| QG-03 `confirmed`+date · amount detail | `deadlineDate` · `paymentAmountDetail` |
| QG-04 situationMatch recall | `hard_to_judge` **제거** → **DI** (§2.2) |
| D03 `fine_penalty` | 제2 사실 **미부착** — v1.1 문안 단순화 |
| D06 situationMatch | **5 + DI** (`paid_redemand` 유지) |

---

## 옛 slug → 새 slug

| 구분 | 옛 slug | 새 slug | 비고 |
|------|---------|---------|------|
| paymentSubject | `traffic_fine` | `fine_penalty` | v1 rewrite |
| paymentSubject | `license_fee` | `fee_charge` | 운전면허·수수료 축 |
| paymentInfoSource | `written_notice` | `official_notice` | |
| paymentInfoSource | `third_party` | `indirect` | |
| situationMatch | `hard_to_judge` | `other` (DI) | §2.2 |
| paymentAmount | `amount_stated_basis_unclear` | `amount_approx` 또는 Detail | |
| paymentStatus | `full` | `paid_verified` | |
| confirmGoal | `how_when_where` | `how_to_pay` | |
| deadline | `uncertain` | `exists_date_unknown` | v1 §3 |
| deadline | `deadline_mentioned` | `window_only` | |
| deadline | `not_stated` | `not_checked` | |
| deadline | `unsure` | `unsure_total` | |
| nonPaymentNotice | `penalty_stated` · `enforcement_stated` | `sanction_enforcement_stated` | 코드 canonical |
| paymentBasis | `violation_stated` | `basis_violation_cited` | |
| paymentBasis | `license_admin` | `basis_fee_schedule` | |
| paymentBasis | `vehicle_related` | `basis_prior_case` | |
| paymentBasis | `unclear` | `basis_not_explained` | |
| evidence | `yes` | `notice_docs` 등 분해 | |
| evidence | `partial` · `unsure` | `other` (DI) | |
| finalGoal | `expert` | `other` (DI) | CTA 분리 |
| authorityResponse | `unclear` · `procedure_unknown` | `other` (DI) | |

---

*v1.2 FINAL — 문서 SoT · 코드 미반영*
