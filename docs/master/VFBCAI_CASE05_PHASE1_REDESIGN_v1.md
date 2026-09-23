# CASE_05 Phase1 — 4필드 선택지 재설계 v1.0 (DQ-C05-06)

| 항목 | 내용 |
|------|------|
| **승인** | Ace — STEP1 DQ-C05-06 구현 지시 (2026-09-23) |
| **범위** | 네이티브 `CASE_05` Phase1만: `dispositionType`, `confirmGoal`, `customerResponse`, `deadline` |
| **규칙** | 내용 옵션 **5개 + Direct Input 1개** (`ADMIN_DIRECT_EXPLAIN_CHOICE`) |
| **구현** | `src/lib/adminVerifyProfiling.ts` — UI 옵션 배열 + legacy slug·label 유지 |

---

## 1. `case05_dispositionType` (5 + DI)

| # | value (신규 UI) | 라벨 (원문) |
|---|-----------------|-------------|
| 1 | `application_denied` | 신청이나 요청이 받아들여지지 않았다는 조치를 받은 상황입니다. |
| 2 | `rights_ended` | 기존에 가지고 있던 허가·자격·권리가 중단·취소되었거나, 등록·자격·면허가 말소·실효되었다는 조치를 받은 상황입니다. |
| 3 | `business_suspended` | 일정 기간 동안 특정 행동이나 활동이 제한되었다는 조치를 받은 상황입니다. |
| 4 | `situation_mismatch` | 통지 내용과 실제 본인의 상황이 서로 다르게 느껴지는 상황입니다. |
| 5 | `disposition_unclear` | 어떤 처분·조치인지 자체를 정확히 이해하기 어려운 상황입니다. |
| DI | `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

### Legacy persist (회귀 없음)

| 구 value | 신규 canonical (게이트·effective) | 라벨 |
|----------|-----------------------------------|------|
| `license_revoked` | `rights_ended` | (기존 license_revoked 라벨 유지) |
| `registration_cancelled` | `rights_ended` | (기존 registration_cancelled 라벨 유지) |
| `reason_hard_to_understand` | `disposition_unclear` | (기존 reason_hard_to_understand 라벨 유지) |
| `unclear` | `disposition_unclear` | (기존 unclear 라벨 유지) |
| `other_disposition` | (raw 유지) | 위에 없는 다른 처분·조치가 안내되어 있습니다 |

---

## 2. `case05_confirmGoal` (5 + DI)

| # | value | 라벨 |
|---|-------|------|
| 1 | `understand_reason` | 처분이 왜 내려졌는지 먼저 확인하고 싶습니다. |
| 2 | `understand_impact` | 이 처분이 실제로 어떤 영향을 주는지 확인하고 싶습니다. |
| 3 | `appeal_possibility` | 이의제기나 재검토가 가능한지 확인하고 싶습니다. |
| 4 | `what_to_do` | 지금 무엇을 해야 하는지 먼저 확인하고 싶습니다. |
| 5 | `unsure` | 지금 무엇부터 확인하고 준비해야 할지 모르겠습니다. |
| DI | `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

### Legacy persist

| 구 value | effective | 비고 |
|----------|-----------|------|
| `understand_effective` | `understand_impact` | 게이트·Result는 구 value 직접 참조도 유지 |
| `maintain_reason` | (raw 유지) | Phase2 `case05Needs*`에서 유지 |

---

## 3. `case05_customerResponse` (5 + DI)

| # | value | 라벨 |
|---|-------|------|
| 1 | `none` | 아직 기관에 설명하거나 자료를 제출하거나 재검토를 요청하지 않았습니다. |
| 2 | `inquired` | 기관에 문의하거나 상황을 확인했습니다. |
| 3 | `explanation_submitted` | 소명·의견을 제출했습니다. |
| 4 | `documents_submitted` | 서류나 증빙을 제출했습니다. |
| 5 | `appeal_requested` | 이의제기·재검토 등을 요청했습니다. |
| DI | `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

### Legacy persist

| 구 value | 비고 |
|----------|------|
| `other_method` | UI 제거; `case05NeedsAuthorityFollowUpPhase2` 등 raw 참조 유지 |

---

## 4. `case05_deadline` (5 + DI) — CASE_03/04 축 정렬

| # | value | 라벨 |
|---|-------|------|
| 1 | `specific_date` | 처분과 관련해 대응해야 하는 날짜를 확인했습니다. |
| 2 | `uncertain` | 기한은 있다는 것은 알지만 정확한 날짜는 아직 확인하지 못했습니다. |
| 3 | `period_stated` | 기한이 있다는 안내만 받았고, 정확한 날짜는 확인하지 못했습니다. |
| 4 | `not_stated` | 기한이 있는지 자체를 아직 확인하지 못했습니다. |
| 5 | `unsure` | 처분 관련 기한을 아직 확인하지 못했습니다. |
| DI | `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

### Legacy persist

| 구 value | effective (signals) | 라벨 |
|----------|---------------------|------|
| `past_possible` | `uncertain` (deadline unclear signal 축) | (기존 past_possible 라벨 유지) |
| `known_date` | `specific_date` | (CASE05_OPTION_LABELS alias 유지) |
