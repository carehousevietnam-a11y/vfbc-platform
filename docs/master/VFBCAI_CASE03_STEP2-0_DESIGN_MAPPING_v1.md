# CASE_03 — STEP2-0 설계 매핑 보고 (코드 미변경)

| 항목 | 내용 |
|------|------|
| **전제** | STEP1 DQ-C03-01 ~ DQ-C03-08 **권장안 전부 Ace 승인** (2026-09-24) |
| **SoT** | `VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` § CASE_03 |
| **패턴** | `VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` §1~§8 |
| **구현 대상 (STEP2-1)** | `adminVerifyProfiling.ts`, `AdminVerifyFirstResultPanel.tsx`, `MasterReviewQuotationReport.tsx`, `tests/qa/admin-verify-strict-full-v2.mjs` (harness 정합 시) |
| **검증** | LEVEL 1 (코드·문서 정합 설계만) |

---

## 0. 승인 DQ 요약

| DQ | 결정 |
|----|------|
| C03-01 | Phase1 Q2 = `case03_inquiryFocus` (MASTER Q2 문구); `case03_confirmGoal` = **고객 우선 확인 목표** (라벨·의미 분리) |
| C03-02 | MASTER Q3 → Phase2 `case03_factRelationship` 유지 (전용 P1 문항 신설 없음) |
| C03-03 | `confirmGoal` 5+DI + note |
| C03-04 | Phase2 `blockage`·`evidence`·`finalGoal`·`repeatFollowUp` 등 DI 통일; escape slug → `other`+note |
| C03-05 | MASTER 5축 ↔ 구현 매핑 문서화 (P1 5필드 + Q3는 P2) |
| C03-06 | Cross-case 재분류 **체인 유지**; Result classification 타이밍 문서화 |
| C03-07 | `authorityFollowUp` 대응 후 필수 유지 |
| C03-08 | CASE_06 bridge Phase1 선행 유지 |

---

## 1. 필드·라벨 재정렬 (DQ-C03-01, C03-02)

### 1.1 Phase1 — AFTER (`CASE03_PHASE1_FIELD_ORDER` 제안)

| 순서 | fieldId | 라벨 (STEP2-1 적용 문구) | MASTER v1.0 대응 |
|------|---------|--------------------------|------------------|
| 1 | `case03_authorityDemand` | 교통국에서는 이 문제와 관련해 무엇을 하라고 안내했나요? | Q1 |
| 2 | `case03_inquiryFocus` | 교통국에서는 무엇을 확인하려는 것 같나요? | Q2 |
| 3 | `case03_customerResponse` | 교통국의 설명이나 출석 요구를 받은 뒤 이미 어떤 대응을 하셨나요? | Q4 |
| 4 | `case03_confirmGoal` | 지금 이 출석·소명 사건에서 **가장 확인하고 싶은 것**은 무엇인가요? | (구현 축 — CASE_05 `confirmGoal` 역할; MASTER Q2와 분리) |
| 5 | `case03_deadline` | 교통국에서는 언제까지 무엇을 해야 한다고 안내했나요? | Q5 |

**BEFORE → AFTER 키 이동**

| BEFORE | AFTER |
|--------|--------|
| P1 `confirmGoal`에 MASTER Q2 라벨 + 고객 목표 옵션 | P1 `inquiryFocus`에 MASTER Q2 라벨 + `CASE03_INQUIRY_FOCUS_OPTIONS` |
| P1 `confirmGoal` 의미 혼선 | P1 `confirmGoal` = 고객 우선 확인 목표 (`CASE03_CONFIRM_GOAL_OPTIONS` 유지·5+DI로 정리) |
| P2 `inquiryFocus` (조건부) | **P1에서 이미 complete면 P2에서 생략** (`case03NeedsInquiryFocusPhase2` → false when P1 filled) |
| MASTER Q3 (상황 인지) | P2 `case03_factRelationship` (라벨·체인 유지) |

### 1.2 Phase2 — 변경 요약

- `appendCase03Phase2Questions`: **inquiryFocus 블록 제거 조건** = Phase1 `case03_inquiryFocus` complete.
- `factRelationship` → `prepRequired` / `explanationDetail` → `authorityFollowUp` → … 종단 체인 **유지** (DQ-C03-07/08).
- `case03NeedsFactRelationshipPhase2` / `case03NeedsInquiryFocusPhase2`: P1 승격 후 **중복 질문·이중 complete** 방지용으로 조정 (inquiryFocus는 P1 필수 시 needs P2 = false).

### 1.3 `CASE03_FOCUS_ORDER` (rank 제안)

| rank | fieldId | focus |
|------|---------|-------|
| 1 | authorityDemand | authorityClaim |
| 2 | **inquiryFocus** | **authorityReason** |
| 3 | customerResponse | customerAction |
| 4 | **confirmGoal** | **goal** |
| 5 | deadline | deadline |
| 6+ | factRelationship … finalGoal | (현행과 동일, inquiryFocus P2 항목 제거 또는 P1 완료 시 skip) |

---

## 2. 옵션 + DI 통일 (DQ-C03-03, C03-04)

### 2.1 Phase1

| fieldId | 현재 | STEP2-1 목표 | 비고 |
|---------|------|--------------|------|
| authorityDemand | 5 + DI | 5 + DI | 유지 |
| inquiryFocus | 5 + DI (P2 only) | 5 + DI (P1) | 옵션 slug 유지 |
| customerResponse | 5 + DI | 5 + DI | 유지 |
| confirmGoal | **6, DI 없음** | **5 + DI** | 6번째 축 1개 흡수 또는 MASTER 정합 DQ에서 선택한 5개 고정 (권장: `deadline_attendance` 유지·`unsure`는 uncertainty 축으로 유지 시 6개 → `repeat_response`와 의미 검토 후 1개 축소) |
| deadline | 5 + DI | 5 + DI | 유지 |

### 2.2 Phase2 — DI 누락 필드

| fieldId | 현재 | STEP2-1 |
|---------|------|---------|
| repeatFollowUp | 5 options, **no DI** | 4~5 content + `ADMIN_DIRECT_EXPLAIN_CHOICE`; `not_applicable` 유지 |
| blockage | 7, no DI | 5 + DI (`demand_unclear`·`unsure` 등 도메인 슬러그는 유지·초과분은 STEP2-1에서 5+DI로 trim) |
| evidence | 9, no DI | 5 + DI; `evidence_other` → DI `other`+note |
| finalGoal | 5, no DI; `goal_other` | 4 + DI; `goal_other` 제거 → `other`+note |
| prepRequired | 6 + DI; `prep_other` | 5 + DI; `prep_other` → `other`+note |

**공통:** `getAdminChoiceNoteKey(fieldId)` · `isAdminVerifyChoiceFieldComplete` · Result note 라벨 helper (CASE_02 패턴) 연결.

---

## 3. 영향 범위 (Profile · Result · classify · bridge)

### 3.1 `buildCaseResolutionProfile` / unknowns / risks

| 축 | 영향 |
|----|------|
| `goal` | P1 `confirmGoal` (고객 목표) — 시점만 명확화 |
| `authorityReason` / inquiry | P1 `inquiryFocus` 조기 반영 — `collectCase03Unknowns`·`deriveFactSignals`에서 focus 불명확 판단 **P1 답변 사용** |
| `actualSituation` | P2 `factRelationship` 유지 |
| Legacy `profile*` | 변경 없음 (CASE_03 단독 경로) |

### 3.2 `AdminVerifyFirstResultPanel.tsx`

- `appendCase03Phase1ResultSignals`: **inquiryFocus** 시그널 추가·confirmGoal 문구를 고객 목표 축으로 정리.
- `case03FactMetric` / fact 카드: `factRelationship` (P2) 유지.
- 1차 Result `caseClassification`: Q1 `CASE_03` 고정 + DQ-C03-06 (2차에서 `classifyFromCase03Answers` 갱신) **문서화 유지**.

### 3.3 `classifyFromCase03Answers`

| 로직 | 조정 |
|------|------|
| CASE_06 unclear combo | `case03_inquiryFocus` P1에서도 동일 slug 사용 — **조건 변경 없음** |
| CASE_02 / CASE_04 | `authorityFollowUp`·`explanationDetail` — **변경 없음** |
| CASE_03 candidate confidence | `confirmGoal` 여부 — **키 유지**, 의미만 고객 목표로 통일 |

### 3.4 CASE_06 bridge

- `appendCase03PathQuestions`: bridge 시 **P1 5필드** 선행 (`isCase03Phase1Complete` 갱신).
- `isCase06BridgedToNativeCase(answers, "CASE_03")` 게이트 **유지** (DQ-C03-08).
- `getEffectiveAdminVerifyCase` / handoff: CASE_03 native 수정만; CASE_06 v1.1 STOP·bridge 커밋 순서 **변경 없음**.

### 3.5 공용·회귀

| 공용 | 회귀 확인 CASE |
|------|----------------|
| `classificationFromProfileSignals` | 02·04·06 |
| `selectCase03ResolutionFocus` | FOCUS rank 변경 후 nextFocus |
| `isAdminVerifyPhase2PathComplete` | CASE_03 path complete |
| Strict QA seeds | `runCase03QaScenario` · v2 trace **필드 순서** |

### 3.6 Restore / meta 호환 (STEP2-1 메모)

- 기존 저장: P1에 `confirmGoal`만 있고 `inquiryFocus` 비어 있는 세션 → P1 complete false → **P2에서 inquiryFocus 1회 유도** (한시적 fallback, Ace 승인 없이 STEP2-0에서 권장: **2주 read fallback** 후 제거는 별도 DQ).

---

## 4. REUSABLE PATTERNS 준수 체크 (CASE_03 STEP2-1 예정)

| § | 패턴 | 판정 | 근거 |
|---|------|------|------|
| 1 | DI | **PASS (설계)** | confirmGoal·P2 4필드 DI 통일 계획이 공식 `other`+note와 일치 |
| 2 | CTA 숨김 | **N/A** | CASE_03 필드 변경만; rail CTA 정책 미변경 |
| 3 | 재분류 2항 | **주의** | `inquiryFocus` P1 승격 시 bridge P1 complete 5필드; effective case 스택 회귀 |
| 4 | Bridge | **PASS** | `isCase06BridgedToNativeCase` + P1 선행 패턴 유지 |
| 5 | STOP | **주의** | `case03PathFieldsComplete`·`case03NeedsInquiryFocusPhase2` 동기; FOCUS rank 갱신 |
| 6 | Harness | **주의** | strict v2 trace·progress — product 변경 시 §6 절차로 분류 |
| 7 | Legacy | **PASS** | 신규 orphan slug 없음; 키 재사용만 |
| 8 | 옵션 수 | **PASS (설계)** | 5+DI 매핑표 §2 준수 목표 |

---

## 5. STEP2-1 구현 체크리스트 (Ace 확인 후)

1. `CASE03_PHASE1_FIELD_ORDER` · `appendCase03Phase1Questions` 순서·라벨
2. `appendCase03Phase2Questions` · `case03NeedsInquiryFocusPhase2`
3. `CASE03_FIELD_OPTIONS` / `CASE03_CONFIRM_GOAL_OPTIONS` (+ DI)
4. P2 옵션 배열 DI·slug 정리
5. `CASE03_FOCUS_ORDER` · `selectCase03ResolutionFocus`
6. `AdminVerifyFirstResultPanel` Phase1 signals
7. `npx tsc --noEmit`
8. Product Browser: P1 5문항 순서·DI·bridge smoke (LEVEL 3)

---

*2026-09-24. STEP2-0 — 구현 없음. Ace 확인 후 STEP2-1 착수.*
