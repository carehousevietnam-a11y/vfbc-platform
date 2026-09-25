# CASE_02 Minimal Remediation — STEP2-0 설계

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **폐기** — `VFBCAI_CASE02_RATIO_REMEDIATION_QUESTION_BRIEF_v1.md` (전면 고도화)로 대체. IMPLEMENTER 착수 금지 |
| **성격** | STEP2-0 설계만. **코드 수정 없음** |
| **전제** | **LOCK CASE_02** — 감사 SoT: `VFBCAI_CASE02_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **범위** | 감사 **핵심 갭 3건:** (1) `deadline=confirmed` 날짜 미저장 (2) 금액이 `other`+note 외 Profile에 없음 (3) `paymentInfoSource` Profile/needs 단절 |
| **비범위** | blockage/evidence 장식 실질화, Phase1 필드 재배치, `demandAuthority` 구조 변경, bridge·CASE_06, 가격 추정·환율·신규 금액 **생성** |

조사일: 2026-09-25.

---

## 0. 갭 요약 (LEVEL 1)

| # | 현상 | 코드 근거 |
|---|------|-----------|
| G1 | `case02_deadline === "confirmed"` → Profile choice 라벨만 | `buildCaseResolutionProfile` deadline ~9024–9025. **`CASE02_DEADLINE_DATE_KEY` 없음** (CASE_01 `CASE01_DEADLINE_DATE_KEY` ~438, ~9027–9028 대비) |
| G2 | 구체 금액 문자열 없음 | `appendCase02DirectInputAuthorityClaimParts` — `paymentAmount === "other"`만 suffix (~2205–2207). slug(`amount_differs`, `amount_stated_basis_unclear`, …)는 Profile·claim **무금액** |
| G3 | `paymentInfoSource` | Phase1 필수 (~2412) · FOCUS (~9487) · **Profile/needs/evidence 게이트 미사용** |

---

## 1. G1 — 납부 기한 날짜 (CASE_01 `deadlineDate` 동형)

### 1.1 설계

| 항목 | 결정 |
|------|------|
| 키 | `export const CASE02_DEADLINE_DATE_KEY = "case02_deadlineDate"` (`CASE01_DEADLINE_DATE_KEY` 옆) |
| 게이트 | `case02NeedsDeadlineDateDetail(answers)`: `answers.case02_deadline === "confirmed"` && `!answers[CASE02_DEADLINE_DATE_KEY]?.trim()` |
| 질문 | Phase2: `appendCase02Phase2Questions` 내 `case02_deadline` choice **완료 직후** (~2563–2578 다음) `kind: "text"` — CASE_01 ~1397–1405 문구 동형(납부 기한 wording) |
| STOP | `case02PathFieldsComplete` (~2682+): `case02NeedsDeadlineDateDetail` → false |
| Profile | deadline 분기: `confirmed` && date → ``납부 기한: ${date}`` (source `CASE02_DEADLINE_DATE_KEY`) |
| 결과 | `appendCase02Phase1ResultSignals`는 Phase1에 deadline 없음 — **`appendCase02Phase2ResultSignals`**: `confirmed`+date 시 action에 날짜 |
| Persist | `CASE02_ANSWER_KEYS` (~1576)에 키 추가 |

**Phase1:** `CASE02_PHASE1_FIELD_ORDER`에 deadline **넣지 않음** (LOCK 틀 유지).

### 1.2 계획 diff

```diff
@@ ~438
+export const CASE02_DEADLINE_DATE_KEY = "case02_deadlineDate";

@@ appendCase02Phase2Questions (~2578)
+  if (case02NeedsDeadlineDateDetail(answers)) {
+    pushUnique(questions, { id: CASE02_DEADLINE_DATE_KEY, kind: "text", label: "...", placeholder: "..." });
+    return;
+  }

@@ case02PathFieldsComplete
+  if (case02NeedsDeadlineDateDetail(answers)) return false;

@@ buildCaseResolutionProfile deadline (~9024)
+  // case02: confirmed + case02_deadlineDate → 날짜 문자열, source CASE02_DEADLINE_DATE_KEY
```

---

## 2. G2 — 안내 금액 text (사용자 기억·통지 인용, 가격 생성 아님)

### 2.1 설계

| 항목 | 결정 |
|------|------|
| 키 | `export const CASE02_PAYMENT_AMOUNT_DETAIL_KEY = "case02_paymentAmountDetail"` |
| 게이트 | `case02NeedsPaymentAmountDetail(answers)`: `case02_paymentAmount` 완료 후, `other`가 **아니고**, effective amount ∈ `{ amount_differs, paid_redemand, amount_stated_basis_unclear }` (canonical `CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR`) && detail 비어 있음. **`amount_unknown` / `other`:** `other`는 기존 `getAdminChoiceNoteKey("case02_paymentAmount")` 유지; `amount_unknown`은 text **요구 안 함** (모름 slug 유지) |
| 질문 | Phase2: Phase1 `paymentAmount` 완료 후 **또는** `case02NeedsPaymentAmountPhase2` 재질문 직후, needs true면 text 1회 — label 예: 「안내 받은 금액을 기억나는 대로 적어 주세요.」 placeholder: 「통지서·메시지에 적힌 금액·단위를 적어 주세요.」 (**새 금액 제안·환율 계산 UI 금지**) |
| Profile | `authorityClaim`: 기존 `paymentSubject` 문장 + (detail 있으면) ` / 안내 금액: {detail}` — `other`+note 경로와 **병렬** (~2203–2217 helper 확장) |
| 결과 | `appendCase02Phase2ResultSignals` (~872+): detail 있으면 action 1줄 (truncate 120) |
| 신호 | `derivePaymentSignals` — **변경 없음** (slug 신호 유지) |
| Persist | `CASE02_ANSWER_KEYS`에 키 추가 |

### 2.2 계획 diff

```diff
@@ appendCase02Phase1Questions (~2458) 또는 Phase2 amount block (~2543)
+  if (case02NeedsPaymentAmountDetail(seeded)) { push text; return; }

@@ case02PathFieldsComplete
+  if (case02NeedsPaymentAmountDetail(answers)) return false;

@@ appendCase02DirectInputAuthorityClaimParts (~2203)
+  if (answers[CASE02_PAYMENT_AMOUNT_DETAIL_KEY]?.trim()) {
+    result += ` / 안내 금액: ${answers[CASE02_PAYMENT_AMOUNT_DETAIL_KEY].trim()}`;
+  }
```

---

## 3. G3 — `paymentInfoSource` Profile + 최소 needs

### 3.1 설계 (최소)

| 항목 | 결정 |
|------|------|
| Profile | `event` 라벨 합성: `getCase02FieldOptionLabel(paymentSubject)` + ` (안내 인지: {paymentInfoSource label})` — CASE_02 active 시만 (~8591–8593 분기) |
| needs | `case02NeedsEvidence(answers)` (~2321): **추가 조건** — `paymentInfoSource` ∈ `{ third_party, recall_unclear }` → evidence 질문 열림 (문서·출처 불명 경로) |
| 결과 | `appendCase02Phase1ResultSignals` (~807+): `third_party` → caution 1줄; `recall_unclear` → unconfirmed 「납부 안내를 받은 경로」 |
| 신규 질문 | **없음** |

**하지 않음:** Phase1 필드 삭제·순서 변경, `paymentInfoSource`별 Phase2 질문 체인 추가.

### 3.2 계획 diff

```diff
@@ buildCaseResolutionProfile event (~8591)
+  // case02: append paymentInfoSource label to event when present

@@ case02NeedsEvidence (~2321)
+  if (answers.case02_paymentInfoSource === "third_party" || answers.case02_paymentInfoSource === "recall_unclear") return true;

@@ appendCase02Phase1ResultSignals (~812)
+  // third_party / recall_unclear branches
```

---

## 4. STEP2-1 터치 파일

| 파일 | 변경 |
|------|------|
| `src/lib/adminVerifyProfiling.ts` | G1–G3 핵심 |
| `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` | Phase2 deadline·amount·Phase1 infoSource signals |
| `src/components/cost-check/MasterReviewQuotationReport.tsx` | (선택) `case02_deadlineDate` / amount detail shorten |
| `tests/qa/*case02*` 또는 strict 시드 | `confirmed`+date, amount detail, `recall_unclear` evidence gate |

---

## 5. VERIFIER

| # | 조건 |
|---|------|
| 1 | G1: `confirmed` + `case02_deadlineDate` → Profile deadline 문자열 |
| 2 | G2: `amount_differs` + detail → `authorityClaim`에 금액 fragment |
| 3 | G3: `recall_unclear` → `case02NeedsEvidence` true; Profile event에 인지 경로 |
| 4 | `other`+note 금액 경로 **회귀** (기존 suffix 유지) |
| 5 | `npx tsc --noEmit` · CASE_06→CASE_02 bridge 스모크 |

---

## 6. DQ — **승인 완료 (LOCK)**

**SoT:** `VFBCAI_CASE02_MINIMAL_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md` §1.

| ID | 결정 (2026-09-25) |
|----|-------------------|
| M01 | A — `amount_unknown` text 없음 |
| M02 | A — `authorityClaim` suffix |
| M03 | A — event + evidence needs + Phase1 result |

---

## 7. 우선순위 (CASE_02 Mission 내부)

1. **P0** G1 `case02_deadlineDate`  
2. **P1** G2 `case02_paymentAmountDetail`  
3. **P2** G3 `paymentInfoSource` Profile/needs/result  

---

*2026-09-25. STEP2-0. 플랫폼 구현 순서: CASE_05→06→03→04→01→**02**. DQ LOCK → STEP2-1 Brief.*
