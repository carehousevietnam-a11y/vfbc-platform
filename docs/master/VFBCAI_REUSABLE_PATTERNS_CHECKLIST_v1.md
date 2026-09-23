# VFBCAI REUSABLE PATTERNS CHECKLIST v1.0

VERIFY → 행정문서(`/verify/admin`) Master funnel에서 **CASE_01~06** 구현·감사·STEP2 설계 시 공통으로 재사용하는 8개 패턴.
`VFBCAI_CASE_AUDIT_CHECKLIST_v1.md` A~H와 함께 참조한다. **위반 시 STEP2-1 구현 전에 설계 보고서에 예외·근거를 명시**해야 한다.

| # | 패턴 | 핵심 SoT (코드·규칙) |
|---|------|---------------------|
| 1 | DI 렌더링 규칙 | `adminVerifyProfiling.ts` · `MasterReviewQuotationReport.tsx` |
| 2 | CTA 숨김 규칙 | `MasterReviewQuotationReport.tsx` (`hideVerifyMasterQuestionRailCtas`) |
| 3 | 재분류 원칙 (2항) | §3-1 Q1 entry · §3-2 Effective case / handoff |
| 4 | 브릿지 체크포인트 | `isCase06BridgedToNativeCase` · bridge snapshot |
| 5 | STOP 조건 명시적 함수화 | `caseNNPathFieldsComplete` · `isAdminVerifyPhase2PathComplete` |
| 6 | Harness-bug vs Real-bug | QA protocol · `03-qa-self-loop.mdc` |
| 7 | 레거시 필드 처리 | `ANSWER_KEYS` / FOCUS / classify-only slug |
| 8 | 옵션 개수 규칙 | MASTER v1.0 §5 · `ADMIN_DIRECT_EXPLAIN_CHOICE` |

---

## 1. DI 렌더링 규칙

- **고정 DI 선택지:** `value: "other"`, 라벨 `위에 내용이 없거나 설명이 필요합니다 → 직접 입력` (`ADMIN_DIRECT_EXPLAIN_CHOICE` / `ADMIN_DIRECT_EXPLAIN_LABEL`).
- **번호 카드 vs DI:** numbered choice 그리드에 DI를 **중복 노출하지 않음**. Entry Q1은 `ADMIN_CASE_ENTRY_Q1_OPTIONS`에서 DI 필터 후 하단 전용 DI 블록 (`entryQ1GridOptions` 패턴).
- **완료 조건:** `isAdminVerifyChoiceFieldComplete` — `other` 선택 시 `{questionId}Note` (`getAdminChoiceNoteKey`) 필수.
- **「기타」≠ DI:** 일반 `기타` slug와 공식 DI `other`를 혼용하지 않음 (`isAdminDirectExplainOption`).
- **Result/UI 요약:** DI note가 있으면 note 텍스트로 요약; 없으면 `ADMIN_DIRECT_EXPLAIN_LABEL` fallback.

**STEP2 체크:** 신규·이동 필드가 `renderAdminClassifiedChoiceQuestion` / `CASENN_FIELD_OPTIONS`에 DI·note 키를 연결했는가?

---

## 2. CTA 숨김 규칙

- **질문 화면 (Admin + RE Master):** `hideVerifyMasterQuestionRailCtas === true` → 사이드 rail에 **QUESTION GUIDE / OFFICIAL SOURCES(Trust)만**; 「내 상황 검토하기」·「자세히 보기」 등 **landing 중복 CTA 숨김**.
- **조건:** `showVerifyQuestionActions && (isRealEstateVerifyMasterLayout || isAdminVerifyStitchLayout)`.
- **결과 화면:** 1차/2차 Result에서는 기존 CTA·dual action cards **유지** (질문 suppression과 분리).

**STEP2 체크:** CASE 필드 재배치만으로 rail CTA 정책을 바꾸지 않았는가?

---

## 3. 재분류 원칙 (2항)

### 3-1 — Q1 entry 고정

- Q1 `adminCaseDocumentKind`로 **진입 CASE**를 좁힌다. Phase1 progress·Stitch 카운트는 `getQ1ResolvedCase` + `getAdminVerifyPhase1VisibleFields` 기준.
- Q1 직후 **즉시 타 CASE로 바꾸지 않음** — cross-case `classifyFromCaseNNAnswers`는 **해당 CASE 답변 축이 채워진 뒤** (대부분 Phase2) inferred 재분류.

**STEP2 체크:** Phase1 필드 이동이 Q1 resolved case 로직을 깨지 않는가?

---

### 3-2 — Effective case · handoff

- **Phase2 Question Builder / pathComplete:** Q1=`CASE_06`이어도 Profile 재분류가 있으면 **`getEffectiveAdminVerifyCase(answers, 2)`** 및 `getAdminVerifyActiveQuestionCase`가 **target native CASE** (`CASE_02` 등) 질문·`caseNNPathFieldsComplete`를 따른다.
- **CASE_06 → native handoff:** `seedCase02AnswersFromCase06Handoff` — **원칙 2:** CASE_06 상태는 힌트만; target CASE 값·질문을 **임의 시드·스킵으로 채우지 않음** (브릿지 커밋 후 native append만).
- **`classificationFromProfileSignals`:** 다수 `classifyFromCaseNN` 신호의 **우선순위 스택** — 단일 CASE 수정 시 전체 스택 회귀 검토.

**STEP2 체크:** `inquiryFocus` Phase1 승격 등이 CASE_06 bridge·CASE_02 handoff와 충돌하지 않는가?

---

## 4. 브릿지 체크포인트

- **활성 조건:** `isCase06BridgedToNativeCase(answers, "CASE_0N")` = Q1 `CASE_06` + v1.1 경로 + **bridge snapshot committed** + expert terminal 아님 + active question case = target.
- **순서:** native CASE **Phase1 선행 완료** (`isCase0NPhase1Complete`) 후 Phase2 adaptive chain.
- **금지:** bridge 미커밋 상태에서 native Phase2만 단독 오픈.

**STEP2 체크:** `appendCase03PathQuestions` 등 bridge 분기가 Phase1 필드 순서 변경 후에도 동일 게이트를 쓰는가?

---

## 5. STOP 조건 명시적 함수화

- **CASE 종료:** `caseNNPathFieldsComplete` — Phase1 complete + 각 `caseNNNeeds*`가 true인 필드만 `isAdminVerifyChoiceFieldComplete` 검사.
- **전역 Phase2 STOP:** `isAdminVerifyPhase2PathComplete` — CASE_06은 chain + bridge 후 **effective case**의 `isClassifiedCasePathComplete`.
- **금지:** `pathComplete`와 `selectNextCaseResolutionFocus`의 nextFocus가 **서로 다른 CASE 기준**으로 동시 참 (과거 CASE_06_E 버그 클래스).
- **FOCUS vs UI:** `CASENN_FOCUS_ORDER` 항목마다 append·needs·complete **삼각 정합** (phantom focus 금지).

**STEP2 체크:** Phase1에 올린 필드는 `needs*`에서 Phase2 중복 요구를 제거했는가? FOCUS rank 갱신했는가?

---

## 6. Harness-bug vs Real-bug 구분 절차

1. **증상 재현** — Product URL·실제 funnel vs `tests/qa/*.mjs` harness.
2. **분류**
   - **Harness-bug:** assert 셀렉터·시드 답변·phase plan이 **현재 제품 SoT와 불일치** (제품이 맞으면 harness만 수정).
   - **Real-bug:** `adminVerifyProfiling.ts` / Result / UI가 MASTER·확정 DQ·Verified Lesson과 불일치.
3. **수정 범위:** Real-bug는 **제품 코드**; Harness-bug는 **QA 스크립트** — Product fix를 harness 우회로 대체 금지.
4. **보고:** LEVEL 3 Browser PASS는 **product** 경로만; harness PASS 단독으로 Mission 완료 선언 금지 (`03-qa-self-loop.mdc`).

**STEP2 체크:** strict trace·seed key 변경이 harness vs product 중 어디에 해당하는지 STEP2-1 PR 메모에 기록.

---

## 7. 레거시 필드 처리

- **정의:** `CASENN_ANSWER_KEYS` / FOCUS / classify에만 존재하고 **`appendCaseNN*`가 생성하지 않는** slug (예: `case05_dispositionSource`, `case05_actualCore`, `case04_actualCore` — LEVEL 1 현황).
- **처리 옵션 (STEP1 DQ에서 Ace 승인 후 하나만):** (A) 삭제 + FOCUS·classify 정리 (B) 질문 복원 (C) CASE_06 handoff 전용 유지 — **임의 (B) 없이 orphan 유지 금지**.
- **DI raw vs legacy slug:** Result 분기가 `other` vs `other_disposition` 등 **이중 slug**를 쓰면 REGRESSION 후보로 STEP1에 기록.

**STEP2 체크:** 필드 이동 시 **기존 meta·restore** 키 호환 전략(읽기 전용 fallback vs migration)을 STEP2-0에 명시.

---

## 8. 옵션 개수 규칙 (MASTER §5)

- **목표:** 내용 선택지 **4~5개 + 공식 DI 1개** (도메인상 6번째가 필요하면 STEP1 DQ + Ace 승인).
- **구현:** 옵션 배열에 `ADMIN_DIRECT_EXPLAIN_CHOICE` append; `prep_other` / `goal_other` / `evidence_other` 등은 **DI `other`+note로 흡수** (DQ-C03-04 방향).
- **초과·DI 누락:** STEP1에 이슈로 목록화; STEP2-1에서 승인된 매핑표만 반영.

**STEP2 체크:** 필드별 before/after 옵션 수 + DI 유무를 매핑표 부록에 포함.

---

## 사용 방법 (CASE 작업 시)

1. STEP1 보고 말미: 「본 CASE 변경이 §1~§8 중 위반 후보」 목록.
2. STEP2-0: 승인된 DQ 반영 매핑표 + **패턴별 PASS / 주의 / N/A** 표.
3. STEP2-1: 구현 diff 후 §1·§5·§8 재확인 + tsc + product Browser (LEVEL 3).

---

*작성: 2026-09-24. VERIFY Admin Master — Oct open 병렬 CASE 감사용.*
