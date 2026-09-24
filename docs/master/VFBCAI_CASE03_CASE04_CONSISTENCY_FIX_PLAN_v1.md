# VFBCAI CASE_03 / CASE_04 정합성 수정 실행 계획 v1

**목적:** 3번창 정합성 감사에서 승인된 **DQ-A, DQ-B, DQ-D, DQ-E**를 CASE_05 작업(2번창) 완료 직후 **최소 diff**로 적용하기 위한 실행 패키지.  
**범위:** Admin VERIFY Master (`adminVerifyProfiling.ts` + `AdminVerifyFirstResultPanel.tsx` + 관련 QA harness).  
**금지:** Master 재설계, CASE_07, DB/API 변경.  
**기준 스냅샷:** `main` working tree 조사 시점 — `CASE04_ANSWER_KEYS`에 `actualCore`/`submitResponse`/`inquiryResponse` **이미 제거됨**; `classifyFromCase04Answers`는 **CASE_06(unclear)** + **CASE_04 고정**만 반환.

**실행 순서 권장:** DQ-B (죽은 slug) → DQ-D (restore 삭제) → DQ-A (라벨) → DQ-E (정책 확정) → `npx tsc --noEmit` → `node tests/qa/admin-verify-strict-full-v2.mjs`.

---

## DQ-A — `confirmGoal` 질문 문장 틀 통일

### Canonical (CASE_03, 변경 없음 — 참조만)

| 파일 | 줄 | 현재 라벨 |
|------|-----|-----------|
| `src/lib/adminVerifyProfiling.ts` | **3477** | `지금 이 출석·소명 사건에서 가장 확인하고 싶은 것은 무엇인가요?` |

**틀:** `지금 이 {사건 명칭}에서 가장 확인하고 싶은 것은 무엇인가요?`  
(「가장 **먼저**」 금지 — CASE_02/03/04와 동일 어휘.)

### 변경 대상 (CASE_04 · CASE_05)

| CASE | 파일 | 줄 | 현재 | 변경 후 (안) |
|------|------|-----|------|----------------|
| CASE_04 | `src/lib/adminVerifyProfiling.ts` | **4445** | `지금 이 보완 요구에서 가장 확인하고 싶은 것은 무엇인가요?` | `지금 이 보완 요구 사건에서 가장 확인하고 싶은 것은 무엇인가요?` *(「사건」만 추가 — 틀 정합)* |
| CASE_05 | `src/lib/adminVerifyProfiling.ts` | **5632** | `지금 이 조치와 관련해 가장 먼저 확인하고 싶은 것은 무엇인가요?` | `지금 이 처분·조치 사건에서 가장 확인하고 싶은 것은 무엇인가요?` |

**CASE_04:** 문장 구조는 이미 CASE_03과 동일. DQ-A는 **「사건」 삽입**만으로 충분한지 2번창 CASE_05 합의본과 한 번 더 맞출 것.

**CASE_05:** DQ-A의 **핵심** — 「먼저」 제거 + `{사건}` 명칭 통일.

### QA / 스크립트 (라벨 substring — 구현 후 갱신)

| 파일 | 줄 | 조치 |
|------|-----|------|
| `tests/qa/case05-step21-spot.mjs` *(또는 `_case05-step21-spot.mjs`)* | *(confirmGoal heading assert)* | `가장 먼저` → `가장 확인하고 싶은` |
| `tests/qa/case04-step2-1-spot.mjs` | **~58** | `가장 확인하고 싶은 것` 유지; CASE_04 문구 변경 시 필요 시 전체 문자열 갱신 |
| `docs/master/VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` | **143** | CASE_05 문항을 canonical 틀과 동기 *(문서 Mission, 코드 Mission과 분리 가능)* |

### 예상 diff (CASE_05, 대표)

```diff
--- a/src/lib/adminVerifyProfiling.ts
+++ b/src/lib/adminVerifyProfiling.ts
@@ -5629,7 +5629,7 @@
   pushUnique(questions, {
     id: "case05_confirmGoal",
     kind: "choice",
-    label: "지금 이 조치와 관련해 가장 먼저 확인하고 싶은 것은 무엇인가요?",
+    label: "지금 이 처분·조치 사건에서 가장 확인하고 싶은 것은 무엇인가요?",
     options: CASE05_CONFIRM_GOAL_OPTIONS,
   });
```

```diff
--- a/src/lib/adminVerifyProfiling.ts
+++ b/src/lib/adminVerifyProfiling.ts
@@ -4442,7 +4442,7 @@
   pushUnique(questions, {
     id: "case04_confirmGoal",
     kind: "choice",
-    label: "지금 이 보완 요구에서 가장 확인하고 싶은 것은 무엇인가요?",
+    label: "지금 이 보완 요구 사건에서 가장 확인하고 싶은 것은 무엇인가요?",
     options: CASE04_CONFIRM_GOAL_OPTIONS,
   });
```

---

## DQ-B — 죽은 slug 참조 제거 + restore fallback

### B-1. CASE_03 — `understand_agency_intent`

**상태:** `CASE03_CONFIRM_GOAL_OPTIONS` (**2943–2964**)에 slug **없음**. UI에서 선택 불가. 아래는 **분기·결과·QA·복원 meta**에만 남은 참조.

#### `src/lib/adminVerifyProfiling.ts`

| 줄 | 심볼 / 맥락 | 변경안 |
|-----|-------------|--------|
| **3266** | `case03NeedsFactRelationshipPhase2` — `goal === "understand_agency_intent"` | **삭제** (해당 조건 한 줄). 동일 의도는 `prepare_materials`·`demand === "reason_unclear"` 등으로 이미 커버되는지 diff 후 확인. |
| **3305** | `case03NeedsInquiryFocusPhase2` — `goal === "understand_agency_intent"` | **삭제**. P1 `inquiryFocus` 필수화 이후 legacy P2 fallback용이므로, restore fallback(**아래**)으로 대체. |
| **10559** | `runCase03QaScenario` 시나리오 **B** seed | `case03_confirmGoal: "prepare_materials"` *(또는 B 시나리오 의도에 맞는 living slug)* |
| **10567** | 시나리오 **C** | 동일 — `prepare_materials` 권장 |
| **10586** | 시나리오 **E** | `prepare_materials` 또는 `unsure` (시나리오 납부 안내 교차는 `authorityFollowUp`으로 유지) |

#### `src/components/cost-check/AdminVerifyFirstResultPanel.tsx`

| 줄 | 함수 | 변경안 |
|-----|------|--------|
| **666** | `appendCase03Phase2ResultSignals` *(또는 동일 블록)* | `goal === "understand_agency_intent" \|\|` 제거 → `goal === "prepare_materials"`만 유지 |
| **857** | `appendCase03Phase1ResultSignals` | 동일 |
| **1936** | `buildCase03IntegratedSituation` | `goal === "understand_agency_intent" \|\|` 제거; `demand === "reason_unclear" \|\| demand === "prep_unclear"` 유지 |

#### QA harness 시드 (동일 slug)

| 파일 | 줄 |
|------|-----|
| `tests/qa/investigate-case03-05-pathcomplete.mjs` | **88** |
| `tests/qa/admin-verify-master-profiling-verify.mjs` | **107** |
| `tests/qa/verify-admin-profiling-full.mjs` | **88** |
| `tests/qa/admin-verify-phase2-depth-audit.mjs` | **192** |

**시드 변경 예:**

```diff
-  case03_confirmGoal: "understand_agency_intent",
+  case03_confirmGoal: "prepare_materials",
```

#### Restore fallback (신규 — `restoreAdminProfilingAnswersFromMeta` 내부)

**위치:** `src/lib/adminVerifyProfiling.ts` **9865** 근처 (`delete parsed.case05_*` 바로 **아래**, `Object.keys(parsed).length` **위**).

**정책 (읽기 전용 meta):** 저장된 `case03_confirmGoal === "understand_agency_intent"` 이고 `case03_inquiryFocus`가 비어 있으면, **P1 MASTER Q2를 복원**하기 위해 `inquiryFocus`만 보정. `confirmGoal` slug는 living 값으로 **정규화**(권장: `prepare_materials`).

```diff
@@ restoreAdminProfilingAnswersFromMeta
   delete parsed.case05_actualCore;
   delete parsed.case05_dispositionSource;
+
+  if (parsed.case03_confirmGoal === "understand_agency_intent") {
+    if (!parsed.case03_inquiryFocus?.trim()) {
+      parsed.case03_inquiryFocus = "unsure";
+    }
+    parsed.case03_confirmGoal = "prepare_materials";
+  }
```

**선택:** `case03EffectiveConfirmGoal()` 헬퍼를 `case05EffectiveConfirmGoal` (**5014–5016**) 패턴으로 export하면 Result/label lookup도 legacy-free (2번창 CASE_05와 충돌 없도록 **함수명 분리**).

**검증:** restore 단위 — meta JSON fixture 1건 + `buildAdminVerifyProfileQuestions` P1에 `inquiryFocus` 노출 여부.

---

### B-2. CASE_04 — `confirmGoal === "deadline"` (죽은 slug)

**상태:** `CASE04_CONFIRM_GOAL_OPTIONS` (**3973–3994**)에 `deadline` value **없음**. 분기는 **Result 패널**에만 존재.

#### `src/components/cost-check/AdminVerifyFirstResultPanel.tsx`

| 줄 | 함수 | 변경안 |
|-----|------|--------|
| **522–523** | `appendCase04Phase1ResultSignals` | `else if (goal === "deadline")` 블록 **삭제**. 기한 관련 액션은 아래 `deadline` **필드** (`case04_deadline`, **536–547**)로만 처리. |
| **615–616** | `case04ActionsFromAnswers` | 동일 블록 **삭제**. **618–629** `case04_deadline` 분기 유지. |

#### Restore fallback (CASE_04, 선택)

meta에 `case04_confirmGoal: "deadline"`만 남은 CRM 데이터용:

```diff
+  if (parsed.case04_confirmGoal === "deadline") {
+    parsed.case04_confirmGoal = "unsure";
+    if (!parsed.case04_deadline?.trim()) {
+      parsed.case04_deadline = "uncertain";
+    }
+  }
```

(`restoreAdminProfilingAnswersFromMeta` 동일 블록에 추가.)

#### 예상 diff (Result, 대표)

```diff
--- a/src/components/cost-check/AdminVerifyFirstResultPanel.tsx
+++ b/src/components/cost-check/AdminVerifyFirstResultPanel.tsx
@@ -519,8 +519,6 @@
   } else if (goal === "understand_insufficient" || goal === "repeat_reason") {
     cautions.push("기존 제출 내용 확인이 우선 목표로 선택됨");
     actions.push("처음 제출한 자료와 보완 요구 내용을 함께 확인해 보세요.");
-  } else if (goal === "deadline") {
-    actions.push("보완 제출 기한을 먼저 확인해 보세요.");
   } else if (goal === "unsure") {
```

---

## DQ-D — `restoreAdminProfilingAnswersFromMeta` legacy CASE_04 키 삭제

**배경:** STEP2-1에서 `case04_actualCore` / `case04_submitResponse` / `case04_inquiryResponse`는 엔진·`CASE04_ANSWER_KEYS`에서 제거됨 (**3914–3928**). CRM·meta JSON에는 **과거 lead**에 남을 수 있음. CASE_05는 이미 restore 시 삭제 중 (**9865–9866**).

### 정확한 삽입 위치

| 파일 | 함수 | 줄 |
|------|------|-----|
| `src/lib/adminVerifyProfiling.ts` | `restoreAdminProfilingAnswersFromMeta` | **9865–9867** (`delete parsed.case05_*` 직후) |

### 변경안

```diff
@@ -9865,6 +9865,9 @@ export function restoreAdminProfilingAnswersFromMeta(
   delete parsed.case05_actualCore;
   delete parsed.case05_dispositionSource;
+  delete parsed.case04_actualCore;
+  delete parsed.case04_submitResponse;
+  delete parsed.case04_inquiryResponse;
 
   if (Object.keys(parsed).length === 0) return null;
```

**효과:** 복원 후 `getCase04AuthorityResponseValue` (**4273–4275**, `authorityFollowUp` only)와 profile build가 **유령 필드**에 오염되지 않음.

**검증:** meta fixture에 세 키 + 유효 CASE_04 답변 → `restoreAdminProfilingAnswersFromMeta` → `buildCaseResolutionProfile` classification **CASE_04** 유지.

---

## DQ-E — `classifyFromCase04Answers` 교차 재분류 정책

### 현재 코드 (기준선)

`src/lib/adminVerifyProfiling.ts` **4922–4951**:

- `case04_supplementTarget === "unclear"` && `case04_unclearFocus === "whole_unclear"` → **CASE_06**
- 그 외 활성 CASE_04 경로 → **CASE_04** 고정
- **`case04_actualCore` 교차 분기 없음** (STEP2-1 반영 완료)

참고 — CASE_05 교차 스타일: **6003–6056** (`case05_authorityFollowUp` → CASE_02/03/04/06).

---

### 옵션 1 — CASE_05 동형: `authorityFollowUp` 기반 교차 재분류 추가

**전제:** `CASE04_AUTHORITY_FOLLOWUP_OPTIONS` (**4124–4153**)에는 `payment_demand` / `attendance_explanation` **없음**. 옵션 1을 쓰려면 (a) Phase2 follow-up slug를 CASE_05와 **공유 enum**으로 맞추거나, (b) 아래처럼 **기존 slug만**으로 제한적 교차를 정의해야 함.

**삽입 위치:** `classifyFromCase04Answers` **4940** 직후, CASE_04 return **이전**.

```diff
@@ function classifyFromCase04Answers(answers: ReviewAnswers)
   if (
     answers.case04_supplementTarget === "unclear" &&
     answers.case04_unclearFocus === "whole_unclear"
   ) {
     return { id: "CASE_06", ... };
   }
+
+  const followUp = answers.case04_authorityFollowUp;
+  if (followUp === "more_docs" || followUp === "more_supplement") {
+    return {
+      id: "CASE_05",
+      status: "inferred",
+      confidence: 0.72,
+      reason: "보완 후 기관 반응이 추가 처분·조치 안내로 확인됨",
+    };
+  }
+  // CASE_05 parity slugs — only if CASE04_AUTHORITY_FOLLOWUP_OPTIONS extended:
+  // if (followUp === "payment_demand") return { id: "CASE_02", ... };
+  // if (followUp === "attendance_explanation") return { id: "CASE_03", ... };
 
   if (shouldActivateCase04Path(answers) || answers.case04_supplementTarget) {
     return { id: "CASE_04", ... };
```

**부작용:** 활성 **CASE_04** 질문 중 `classification`이 CASE_05로 튀면 1차 결과·reclassification UX 변경. `resolveCaseClassification` 순서 (**8003–8004**)상 CASE_04 signal이 먼저이므로, **handoff·reclass history** 테스트 필수.

**QA:** `runCase04QaScenario` **E–H** + `admin-verify-strict-full-v2.mjs` CASE_04 / CASE_06_CHAIN_*.

---

### 옵션 2 — 「CASE_04는 다른 CASE로 나가지 않는다」 명시 (권장)

**정책:**

1. **CASE_04 classification**은 항상 **CASE_04**, 예외는 **`unclear` + `whole_unclear` → CASE_06** 만 (현행 코드 유지).
2. CASE_02/03/05로의 이동은 **CASE_06 bridge · Q1 reclass · 타 CASE `authorityFollowUp`**에서만 수행 (CASE_03→04는 `classifyFromCase03Answers` **3875–3884** 등 기존 패턴).
3. 삭제된 `case04_actualCore` 교차는 **복원하지 않음**.

**코드 변경 (문서화 + 회귀 방지 comment only):**

```diff
@@ function classifyFromCase04Answers(answers: ReviewAnswers)
+  // DQ-E: CASE_04 does not cross-classify to CASE_02/03/05 (except CASE_06 unclear whole).
+  // Cross-case uses CASE_06 bridge / other CASE classifiers — not actualCore revival.
   if (!shouldActivateCase04Path(answers) && !answers.case04_supplementTarget) return null;
```

**문서 못박기 (본 파일 §DQ-E 정책 + 선택적으로):**

- `docs/master/VFBCAI_CASE04_STEP2-0_DESIGN_MAPPING_v1.md` §classify 한 줄 추가
- `docs/master/VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` — Adapter CASE는 **domain classify 고정**, 교차는 **upstream CASE**만

**QA:** 현행 `classifyFromCase04Answers` 단위 assert 2건 (CASE_04 default, CASE_06 unclear).

---

### 권장안

| | 옵션 1 (followUp 교차) | 옵션 2 (CASE_04 고정) |
|--|------------------------|------------------------|
| Master handoff 원칙 | CASE_04 내부 Phase2 signal로 타 CASE — **경계 혼동** | CASE_04 = 보완 adapter **고정** — CASE_06 unclear만 예외 |
| 구현 비용 | slug 정합 + strict full 회귀 **대** | comment + restore(DQ-D) **소** |
| CASE_05 2번창 충돌 | `authorityFollowUp` 의미 충돌 위험 | **없음** |

**권장: 옵션 2.** `actualCore` 제거(DQ-C04-06) 이후 교차는 **이미 CASE_03/05/06 classifiers**에 분산되어 있음. 옵션 1은 slug 스키마 합의 없이는 **추측 재분류**에 가깝다.

---

## 실행 체크리스트 (CASE_05 창 종료 후)

| # | DQ | 파일 | 검증 |
|---|-----|------|------|
| 1 | B-1 | `adminVerifyProfiling.ts` 3266, 3305, 10559/67/86, restore block | `tsc` + case03 spot |
| 2 | B-1 | `AdminVerifyFirstResultPanel.tsx` 666, 857, 1936 | strict v2 CASE_03 |
| 3 | B-1 | QA 4 files 시드 | profiling harness |
| 4 | B-2 | `AdminVerifyFirstResultPanel.tsx` 522, 615 (+ optional restore) | CASE_04 spot |
| 5 | D | `restoreAdminProfilingAnswersFromMeta` 9865+ | meta fixture |
| 6 | A | `adminVerifyProfiling.ts` 4445, 5632 | strict v2 CASE_04/05 labelMatch |
| 7 | E | 옵션 2 comment (또는 옵션 1 diff) | classify unit + strict CASE_04/06 |

**완료 조건:** `npx tsc --noEmit` PASS · `node tests/qa/admin-verify-strict-full-v2.mjs` → `lockReady: true` (로컬 `PLAYWRIGHT_BASE_URL`).

---

## Human Boundary

- 2번창에서 `case05_confirmGoal` / `case05_authorityFollowUp` **동시 수정** 중이면 DQ-A·B를 **merge 후** 적용해 conflict 최소화.
- 옵션 1(DQ-E) 선택 시 Ace **명시 승인** 후에만 classify 변경.

---

*문서만 커밋. 제품 코드는 본 계획서 승인·CASE_05 창 종료 후 IMPLEMENTER Mission에서 적용.*
