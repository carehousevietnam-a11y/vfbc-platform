# VFBCAI CASE_02 질문·선택지 재작성 마스터 v1

| 항목 | 내용 |
|------|------|
| **범위** | 납부·비용 CASE — Phase1·Phase2 |
| **LOCK** | QG-01~04 · 금액은 **기억·안내 상태**만 (환율·추정 금액 생성 금지) |

---

## 0. 구조 변경

| 변경 | 이유 |
|------|------|
| `case02_deadline.uncertain` + `deadline_mentioned` → **`window_only`** / **`exists_date_unknown`** | QG-01 동의어 쌍 |
| `case02_customerResponse` (Phase2) 고밀도 — 접수·납부·확인 **복합** | QG-02 |
| `case02_authorityResponse` + 후속 납부 확인 **단일 trajectory** (해당 경로) | 반복 신호 축소 |

---

## 1. Phase1 (화면 순서)

### 1.1 `case02_paymentSubject` (상황형)

**질문:** 교통국에서 **무엇에 대한 비용**을 내라고 안내했나요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `fine_penalty` | **벌금·과태료**를 내라는 안내를 받았고 **항목 문구**는 일부 읽었습니다. |
| `fee_charge` | **수수료·비용**을 내라는 안내를 받았습니다. |
| `tax_or_arrears` | **세금·체납·기존 부담**을 내라는 안내로 이해했습니다. |
| `mixed_items` | **여러 항목**이 섞여 있다고 이해했습니다. |
| `unclear` | **무슨 종류의 납부**인지 **아직 모르겠습니다**. |
| (DI) | 직접 설명 |

**fact_dimensions:** `payment_kind` · `notice_clarity`

---

### 1.2 `case02_paymentInfoSource` (상황형)

**질문:** **납부 안내**를 어떻게 알게 되었나요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `official_notice` | **공식 통지·문서**를 직접 받았습니다. |
| `phone_message` | **전화·문자**로 안내를 받았습니다. |
| `in_person` | **방문·창구**에서 안내를 받았습니다. |
| `indirect` | **대행·지인·회사**를 통해 들었고 **원문**은 아직 못 봤습니다. |
| `unsure` | **경로**를 정확히 말하기 **어렵습니다**. |
| (DI) | 직접 설명 |

---

### 1.3 `case02_situationMatch` (상황형)

**질문:** 안내 **금액·사유**와 제 **실제 상황**을 비교하면?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `match` | **대체로 맞고** 차이는 사소합니다. |
| `amount_differs` | **금액**이 제가 아는 것과 **다릅니다**. |
| `reason_differs` | **사유**가 제 상황과 **다릅니다**. |
| `both_differs` | **금액과 사유 모두** 다르게 느껴집니다. |
| `hard_to_judge` | **대조할 자료**가 없어 **판단하기 어렵습니다**. |
| `paid_redemand` | **이미 낸 적** 있는데 **다시** 내라고 들었습니다. |
| (DI) | 직접 설명 |

**QG-04:** `hard_to_judge` 단일 — Phase2에서 동일 recall **금지**

---

### 1.4 `case02_paymentAmount` (상황형)

**질문:** 안내 **금액**을 제가 아는 수준으로 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `amount_stated_clear` | **통지·안내에 금액**이 있고 **그 숫자**를 알고 있습니다. |
| `amount_approx` | **대략적인 금액**만 알고 **정확한 숫자**는 모릅니다. |
| `amount_conflicting` | **여러 번 다른 금액**으로 안내를 받았습니다. |
| `amount_not_given` | **금액 안내**를 아직 받지 못했습니다. |
| `amount_differs` | **안내 금액**이 제가 아는 것과 **다릅니다**. |
| (DI) | 직접 설명 |

**requires_text_key:** `amount_stated_clear`·`amount_differs` 등 정책 slug → `case02_paymentAmountDetail` (IMPLEMENTER SoT 유지)

---

### 1.5 `case02_paymentStatus` (상황형)

**질문:** **납부**를 한 상태와 **기관 확인**을 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `not_paid` | **아직 납부하지 않았습니다**. |
| `paid_unverified` | **납부했지만** 기관 **처리·접수**는 확인하지 못했습니다. |
| `paid_verified` | **납부했고** 접수·영수 **확인**을 받았습니다. |
| `partial` | **일부만** 납부했습니다. |
| `disputing` | **납부 여부·금액**을 **다투는 중**입니다. |
| (DI) | 직접 설명 |

---

### 1.6 `case02_confirmGoal` (상황형)

**질문:** 이 납부 사건에서 **가장 먼저** 확인하려는 것은?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `verify_amount` | **금액·항목**이 맞는지 확인하려 합니다. |
| `verify_reason` | **납부 사유**가 맞는지 확인하려 합니다. |
| `how_to_pay` | **납부 방법·절차**를 알려 합니다. |
| `deadline_risk` | **기한·미납 후속**을 확인하려 합니다. |
| `unsure` | **무엇부터** 할지 모르겠습니다. |
| (DI) | 직접 설명 |

---

## 2. Phase2 (주요 순서 · 상황형 metadata 동형)

| id | 유형 | 질문 요지 |
|----|------|-----------|
| `case02_demandAuthority` | 상황형 | 요구 기관 |
| `case02_noticeAccessFact` | 상황형 | 간접 안내 시 자료 상태 |
| `case02_paymentBasis` | 상황형 | 납부 사유 문구 이해 |
| `case02_deadline` | 상황형 | 기한 4+DI (`confirmed`→text) |
| `case02_deadlineDate` | text | `confirmed` 시 필수 |
| `case02_authorityResponse` | 상황형 | 문의·납부 후 기관 답변 |
| `case02_nonPaymentNotice` | 상황형 | 미납 시 후속 안내 |
| `case02_blockage` | 상황형 | 막힘 |
| `case02_evidence` | 목록형 multi | 자료 |
| `case02_finalGoal` | 상황형 | tail |

### `case02_deadline` (상황형) — 재작성 선택지

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `confirmed` | **납부 마감일**을 확인했고 아래에 적을 수 있습니다. |
| `window_only` | **기간만** 안내됐고 **날짜**는 모릅니다. |
| `exists_date_unknown` | **기한은 있다**고만 알고 **언제인지** 못 찾았습니다. |
| `not_checked` | **기한**을 **확인하지 못했습니다**. |
| `unsure_total` | **기한 관련**을 **전혀 모릅니다**. |
| (DI) | 직접 설명 |

**requires_text_key:** `confirmed` → `case02_deadlineDate`

---

## 3. 옛 → 새 slug

| 옛 | 새 |
|----|-----|
| `deadline.uncertain` | `exists_date_unknown` |
| `deadline.deadline_mentioned` | `window_only` |
| `deadline.unsure` | `unsure_total` |
| `deadline.not_stated` | `not_checked` |

---

## 4. QG 점검

| 게이트 | 결과 |
|--------|------|
| QG-01 | **해소함** — §2 deadline |
| QG-02 | **해소함** — paymentStatus 복합 |
| QG-03 | **해소함(문서)** · `confirmed`+text · 코드 return **해소함**(CASE_02) |
| QG-04 | **해소함** — situationMatch 단일 recall |

---

*2번창 — 문서만.*
