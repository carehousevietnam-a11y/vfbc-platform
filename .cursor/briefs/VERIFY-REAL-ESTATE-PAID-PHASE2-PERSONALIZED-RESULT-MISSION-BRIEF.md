# VERIFY Real Estate PAID Phase 2 — P1+-1 Personalized Result Mission Brief

> **Agent**: ARCHITECT only  
> **Risk**: HIGH (결과 해석 레이어 + Master UI 3rd screen + Admin 패턴 이식)  
> **Prerequisite**: P0 PASS · P1a PASS · P1b PASS · P1c PASS · FREE textarea hotfix PASS  
> **Status**: 설계 완료 — IMPLEMENTER/VERIFIER 미실행 · 제품 코드 미변경  
> **Parent**: `.cursor/briefs/VERIFY-REAL-ESTATE-PAID-PHASE2-P1-MISSION-BRIEF.md`  
> **Frozen baseline**: P1 Architecture Complete (selector · bridge · structuredDetail · Material Stop)

---

## Executive Summary

P1+-1은 Phase 2에서 확보한 **`re2_*` precision facts**와 FREE **`re_*` Situation Profile**을 **통합 해석**하여, 사용자에게 **개인화된 2차 종합 결과(Personalized Result)**를 제공하는 Mission이다.

현재 Phase 2 완료 시 `RealEstatePhase2GateShell`의 interim block(`2차 추가 확인 완료` + `buildRealEstatePhase2CompletionLines`)만 표시되며, placeholder 문구(`개인화 결과는 다음 단계(P1+)에서 이어집니다`)로 종료된다.  
본 Mission은 Admin VERIFY의 **Phase 2 → Personalized Result** 패턴을 real-estate domain에 **최소 이식**한다.

**구현**: `buildRealEstatePersonalizedResult` + UI gate + `AdminVerifyFirstResultPanel` `variant="personalized"`  
**미구현**: payment · restore · CRM meta · Deep AI backend · multi-doc · OCR · FREE/P1 selector 변경

---

## 1. 기존 구현 조사 결과

### 1.1 Result builder (real-estate)

| File | Role | P1+-1 관련 |
|------|------|------------|
| `src/lib/realEstateVerifyFirstResult.ts` | `buildRealEstateFirstResult()` — FREE profile only → `AdminVerifyFirstResultData` | **Base layer — FROZEN semantics**. Personalized는 wrap/enrich, rewrite 금지 |
| `src/lib/realEstateVerifyProfiling.ts` | `buildRealEstateSituationProfile()` — **already merges `re2_*`** into 15 profile fields | **Read-only input** for result builder. P1c selector/bridge **FROZEN** |
| `src/lib/realEstateVerifyProfiling.ts` | `buildRealEstatePhase2CompletionLines()` | Phase 2 fact list → `phase2Additions` source |
| `src/lib/realEstateVerifyProfiling.ts` | `buildRealEstatePhase1CarryOverLines()` | Phase 1 read-only chips |
| `src/lib/realEstateVerifyProfiling.ts` | `isRealEstatePhase2Complete()` / `attachRealEstateProfileSnapshot()` | Gate + `_realEstatePhase2Complete` flag (session snapshot only) |

**조사 결론**: Profile merge for `re2_*` **이미 P1c에서 구현됨**. Personalized Result builder는 **새 해석 레이어**만 추가하면 되며, profiling selector를 다시 건드릴 필요 없음.

### 1.2 UI state machine (real-estate)

`MasterReviewQuotationReport.tsx` 현재 gate:

| Flag | Condition | Screen |
|------|-----------|--------|
| `isRealEstateFirstResult` | signup complete · `realEstateVerifyProfilePhase === 1` · profiling stop | FREE ONE RESULT (`buildRealEstateFirstResult`) |
| `isRealEstatePhase2Review` | signup complete · phase === 2 · profiling stop | Gate shell + Phase 2 questions |
| `isRealEstatePhase2QuestionFlow` | phase2 review · missing selector ≠ null | Active Phase 2 Q |
| **`isRealEstatePersonalizedResult`** | **❌ 없음** | **본 Mission에서 추가** |

Admin reference (동일 파일):

```typescript
isAdminVerifyPersonalizedResult =
  isAdminVerifyStitchLayout &&
  isClassifiedAdminVerifyCase &&
  adminVerifyPhase2QuestionsComplete &&
  (adminVerifySkipSignup || adminVerifySignupComplete);
```

Real-estate equivalent (설계):

```typescript
isRealEstatePersonalizedResult =
  isRealEstateVerifyMasterLayout &&
  realEstateVerifySignupComplete &&
  realEstateVerifyProfilePhase === 2 &&
  isRealEstatePhase2Complete(answers);
```

### 1.3 Admin Personalized Result (reference pattern)

| File | Pattern |
|------|---------|
| `AdminVerifyFirstResultPanel.tsx` | `buildAdminVerifyPersonalizedResult()` = `buildAdminVerifyFirstResult()` + CASE별 `appendCase*Phase2ResultSignals()` |
| | `buildAdminVerifyPersonalizedContext()` → `phase1Facts` / `phase2Additions` / `integratedSituation` |
| | `variant="personalized"` → Stitch layout sections 01–05 + AI/Expert CTA |
| `MasterReviewQuotationReport.tsx` | Phase 2 complete → hide question flow → render personalized panel |

**Real-estate는 CASE_01–06 대신 PRE/POST/DOCUMENT/UNCLEAR path** 기반 signal appenders 필요.

### 1.4 AI Report / page wiring

| File | Status |
|------|--------|
| `src/app/verify/real-estate/page.tsx` | `handleAiReportRequest()` · `recordAiReportRequestAndNotify()` · gate props `onRealEstateVerifyAiReport` **이미 존재** |
| `AdminVerifyFirstResultPanel` | `domain="real-estate"` on first result — AI/Expert CTA wired |
| Personalized variant | Admin only today — real-estate personalized에 **동일 handler reuse** |

### 1.5 Restore / CRM

| Area | Status |
|------|--------|
| `restoreVerifyLead.ts` / real-estate restore | FREE ONE RESULT restore only — Phase 2 / Personalized **session-only** |
| CRM meta write | `_realEstatePhase2Complete` in snapshot JSON only — **no CRM schema change in this Mission** |

### 1.6 verifyDiagnosis.ts

- `real-estate` domain entry exists (reference notes only).
- **본 Mission에서 verifyDiagnosis 변경 불필요** — Personalized Result는 profiling builder 출력 사용.

### 1.7 Placeholder to replace

`RealEstatePhase2GateShell` L1604–1605:

> "개인화 결과는 다음 단계(P1+)에서 이어집니다."

→ Phase 2 complete + Personalized gate active 시 **이 interim block은 personalized panel로 대체** (Admin과 동일: question flow 종료 후 result panel).

---

## 2. Personalized Result 진입 Gate

### 2.1 Flow (확정)

```
FREE profiling → Evidence → Signup
  → Phase 1 ONE RESULT (buildRealEstateFirstResult)     [FROZEN]
  → CTA "2차 개인화" → realEstateVerifyProfilePhase = 2
  → Phase 2 adaptive Q (P1a–P1c FROZEN)
  → isRealEstatePhase2Complete(answers) === true
  → Personalized Result (buildRealEstatePersonalizedResult)   [NEW]
```

### 2.2 Gate rules

1. **Phase 2 질문 UI 숨김** — `isRealEstatePersonalizedResult === true` 이면 `isRealEstatePhase2QuestionFlow === false`
2. **FREE ONE RESULT 재표시 금지** — Entry Q1 · FREE choice grid · FREE question section DOM = 0
3. **Phase 2 질문 재시작 금지** — `buildRealEstatePhase2ProfileQuestions` 호출 경로 차단
4. **Gate shell interim → full result** — `phase2Complete` placeholder 문구 제거; personalized panel이 SSOT
5. **Signup 선행** — Admin과 동일: signup complete 없으면 personalized 미표시

### 2.3 Phase state (설계)

| State | `realEstateVerifyProfilePhase` | Display |
|-------|-------------------------------|---------|
| FREE + Phase 1 result | `1` | ONE RESULT |
| Phase 2 active | `2` + missing ≠ null | Gate shell + questions |
| Phase 2 personalized | `2` + `isRealEstatePhase2Complete` | Personalized Result |

**Phase 3 신설 금지** — Admin과 동일하게 phase `2` 유지 + completion flag로 분기.

---

## 3. FREE + Phase 2 Profile 통합 구조

### 3.1 Input layers (read-only for builder)

```
ReviewAnswers
  ├── FREE re_*           (read-only — never write in result builder)
  ├── realEstateCustomerInput
  ├── re2_*               (Phase 2 answers — read-only)
  └── snapshot flags      (_realEstatePhase2Complete, etc.)
           ↓
buildRealEstateSituationProfile(answers)   [EXISTING — P1c merged]
           ↓
buildRealEstatePersonalizedContext(answers) [NEW]
           ↓
buildRealEstatePersonalizedResult(answers, ctx) [NEW]
           ↓
AdminVerifyFirstResultData + personalizedContext
           ↓
AdminVerifyFirstResultPanel variant="personalized" domain="real-estate"
```

### 3.2 Context object (신규 type)

Admin `AdminVerifyPersonalizedContext` 재사용 또는 real-estate alias:

```typescript
type RealEstatePersonalizedContext = {
  integratedSituation: string;   // §01 현재 상황 — narrative
  coreJudgment: string;          // §02 핵심 판단 — single paragraph
  phase1Facts: string[];       // FREE-derived bullets
  phase2Additions: string[];     // re2_* / completion lines
  evidenceNote?: string;
  documentsNeededNote: string;   // static guidance (no OCR)
  path: RealEstateResolutionPath | null;
  materialStopApplied: boolean;  // bridge cannot_classify_yet
};
```

### 3.3 Phase 1 vs Phase 2 fact separation

| Source | Builder function | Use |
|--------|------------------|-----|
| Phase 1 | `buildRealEstatePhase1CarryOverLines(answers)` | `phase1Facts[]` |
| Phase 2 | `buildRealEstatePhase2CompletionLines(answers)` | `phase2Additions[]` |
| Profile narrative | `buildSituationSummary(profile)` (from first result) | `integratedSituation` base |

**직접 설명(`re2_*Detail`)** — raw key 노출 금지; profile field 또는 completion line label로만 표시.

---

## 4. Profile field → Result 판단 mapping

### 4.1 Field → Section mapping

| Profile field | Primary section | Judgment use |
|---------------|-----------------|--------------|
| `transaction` + `contractStage` | §01 현재 상황 | Path + stage narrative |
| `claims` + `money` + `rights` | §02 핵심 판단 | Cross-field synthesis |
| `risk` + `facts` + `documents` | §03 주요 위험 요인 | `status: confirmed` → bullet; `inferred` → caution tone |
| `property` · `parties` · `goal` · `dates` · `responses` | §02 metrics + §04 gaps | `unknown` → unconfirmed |
| `evidence` | §04 (conditional) | file attached note only |
| `customerInput` | §01 anchor | truncate + integrate, never re-ask |
| UNCLEAR bridge keys (`re2_unclear*`) | §01 + §02 | routing intent only — no path re-select |

### 4.2 Status → tone rules (헌법 준수)

| Profile field status | Result treatment |
|---------------------|------------------|
| `confirmed` | OK metric / factual bullet — **단정적 법률 판단 표현 금지** |
| `inferred` | Caution metric · footnote "선택 답변에서 추론" |
| `unknown` | §04 unconfirmed · **확정 판단 금지** |
| `candidate` | §03 soft risk · "추가 확인 필요" framing |

### 4.3 Cross-field conflict detection (신규 logic)

Builder must detect and **soften** (not resolve legally):

| Conflict pattern | Output |
|------------------|--------|
| FREE `re_docsMatch=match` but `re2_conflictFocus` present | §04 "서류 일치 응답과 2차 불일치 확인이 공존 — 원본 대조 필요" |
| PRE path but `re2_moneyRecovery` populated (UNCLEAR bridge) | §02 "사전 검토 경로이나 금전 회수 이슈가 2차에서 확인됨 — 초점 재정리 필요" |
| `cannot_classify_yet` in any bridge key | `materialStopApplied=true` · §02 "분류 정보가 아직 부족" · §05 limited actions |
| Phase 2 detail `< 20 chars` in answers (stale) | **must not happen** if P1c `wasFieldAsked` respected — if detected, treat as unknown |

---

## 5. PRE / POST / DOCUMENT / UNCLEAR별 개인화 결과

### 5.1 PRE_CONTRACT

**§02 핵심 판단 focus**: 등기·조항·금액 조건 교차

| Phase 2 signal | Result emphasis |
|----------------|-----------------|
| `re2_registrationConcern` + `re2_registrationDetail` | §03 등기/소유권 risk · §04 위임장/등기부 원본 |
| `re2_clauseFocus` / `re2_clauseDetail` (direct explain) | §03 조항 risk — detail text as primary |
| `re2_moneySituation` / `re2_moneyDetail` | §03 금액·반환 조건 · §05 서명 전 대조 |

**§05 actions (max 4)**: 계약서·등기부 대조 · 보증금 조건 확인 · 불리한 조항 전문가 검토 · 서명 전 서류 확보

### 5.2 POST_DISPUTE

**§02 focus**: 회수 상태 · 공식 대응 · timeline · conflict

| Phase 2 signal | Result emphasis |
|----------------|-----------------|
| `re2_moneyRecovery` | §02 core — 반환 거부/부분/상계 |
| `re2_formalResponse` · `re2_timelineStage` · `re2_timelineDetail` | §01 timeline narrative · §03 stalled risk |
| `re2_conflictFocus` / `re2_conflictDetail` | §03 fact mismatch |
| `re2_authorityStage` | §05 institution-facing next step (non-legal) |

**§05 actions**: 서면·증빙 정리 · 공식 연락 경로 확인 · 기한·기록 보존 · 전문가팀 상담

### 5.3 DOCUMENT_REVIEW

**§02 focus**: 서류 신뢰 · 번역 · 불일치

| Phase 2 signal | Result emphasis |
|----------------|-----------------|
| `re2_docReliability` | §03 authenticity concern |
| `re2_translationIssue` | §04 translation/original |
| `re2_conflictFocus` / `re2_conflictDetail` | §03 written vs actual |

**§05 actions**: 원본·번역본 대조 · 핵심 조항 하이라이트 · 상대방 확인 요청 · 전문가 검토

### 5.4 UNCLEAR (bridge enriched)

**Path resolution for result**: `getRealEstateResolutionPath(answers)` stays `UNCLEAR` unless chain enriched enough for effective POST/DOC signals — **do not change path label to POST/DOC in UI**; instead §02 states "우선 확인 사실 기준으로 ○○ 쪽 정리".

| Bridge outcome | Result |
|----------------|--------|
| Lock → bridge → POST/DOC chain completed | §02 reflects enriched chain (moneyRecovery / docRel) under UNCLEAR entry framing |
| Material Stop (`cannot_classify_yet`) | §02 "추가 분류 정보 부족" · §05 1–2 generic safe actions · **no fabricated precision** |
| `re2_unclearFactLock` only | §04 priority fact list |

**Hard rule**: Entry Q1 · FREE dispute/doc questions **never reappear** in result copy as prompts.

---

## 6. Direct Explanation 반영 방법

### 6.1 Keys

| Choice key | Detail key | Profile absorption (existing) |
|------------|------------|-------------------------------|
| `re2_clauseFocus` | `re2_clauseDetail` | `profile.risk` |
| `re2_conflictFocus` | `re2_conflictDetail` | `profile.facts` |
| `re2_timelineStage` | `re2_timelineDetail` | `profile.dates` |
| (text Q) | `re2_registrationDetail` | `profile.rights` |
| (text Q) | `re2_moneyDetail` | `profile.money` |

### 6.2 Builder rules

1. **Detail text ≥ 20 chars + field asked** — only then include in §02/§03 narrative (mirror `isQuestionAnswered` predicate)
2. **Choice skipped via direct explain** — §02 cites detail only; choice label omitted
3. **Display** — use completion line labels (`조항 상세`, `불일치 상세`, etc.) not raw answer keys
4. **No re-ask** — result text must not contain choice option labels as questions

---

## 7. 판단 상태와 정보 부족 처리 기준

### 7.1 Judgment states (internal enum — builder only)

```typescript
type RealEstateResultConfidence = "sufficient" | "partial" | "insufficient" | "conflict";
```

| State | Trigger | §02 headline tone | §04 behavior |
|-------|---------|-------------------|--------------|
| `sufficient` | All critical fields for path `confirmed` | neutral summary | empty or minimal |
| `partial` | Mix confirmed + unknown/inferred | "추가 확인이 필요한 상태" | list unknowns |
| `insufficient` | Material Stop or >2 unknown critical | "아직 정리 중인 상태" | explicit gaps |
| `conflict` | Cross-field conflict detected | "확인이 엇갈리는 상태" | name conflicting dimensions |

### 7.2 Forbidden expressions (헌법)

- 법률 효력 확정 ("위법입니다", "승소합니다", "무효입니다")
- `정부 데이터베이스` 과장
- 가격·비용 생성
- 실명·외부 기관명
- Phase 2에서 묻지 않은 fact를 confirmed로 승격

### 7.3 Safe phrasing templates

- "입력·확인된 내용 기준으로 …"
- "아직 직접 확인되지 않은 부분 …"
- "서류 원본 대조 후 판단 가능 …"
- Expert label: **`VFBCAI 전문가팀`** only

---

## 8. 기존 ONE RESULT와 Personalized Result의 관계

| Aspect | Phase 1 ONE RESULT | Phase 2 Personalized Result |
|--------|-------------------|----------------------------|
| Builder | `buildRealEstateFirstResult` | `buildRealEstatePersonalizedResult` (wraps base) |
| Profile input | FREE `re_*` only | FREE + merged `re2_*` via `buildRealEstateSituationProfile` |
| UI variant | default `AdminVerifyFirstResultPanel` | `variant="personalized"` |
| When shown | After signup · phase 1 | After phase 2 complete · phase 2 |
| Mutability | **FROZEN output** — regression must still pass | New screen — does not alter first result builder |
| User navigation | "2차 개인화" leaves first result | No return to Phase 2 questions without new session |
| Carry-over | N/A | Phase 1 facts in §03 "1차 확인" + metrics from enriched profile |

**Regression contract**: FREE path ending at Phase 1 ONE RESULT — **byte-level behavior unchanged**.

---

## 9. UI 재사용 계획

### 9.1 Reuse (mandatory)

| Component | Reuse |
|-----------|-------|
| `AdminVerifyFirstResultPanel` | `variant="personalized"` + `domain="real-estate"` |
| `AdminVerifyPersonalizedStitchHeaderSteps` / FooterSteps | As-is |
| `StitchPersonalizedMetricRibbon` | Enriched `keyMetrics` from personalized builder |
| `AdminVerifyPersonalizedNextSteps` | §05 CTA — AI Report + Expert |
| First result CTA styling | Existing real-estate first result AI/Expert wiring |

### 9.2 Domain-specific label mapping (minimal)

Admin personalized uses `01 전체 판단` — real-estate requires Ace §01–§05 labels:

| Admin section | Real-estate label (IMPLEMENTER) |
|---------------|--------------------------------|
| 01 전체 판단 | **01 현재 상황** |
| 02 핵심 확인 결과 | **02 핵심 판단** |
| 03 주요 위험 요인 | **03 주요 위험 요인** (same) |
| 04 확인이 필요한 사항 | **04 확인이 필요한 사항** (same) |
| NextSteps block | **05 지금 해야 할 일** heading |

**Implementation path**: `domain="real-estate"` + `variant="personalized"` conditional section titles in panel — **no new stitch component**.

### 9.3 MasterReviewQuotationReport changes (scope)

1. Add `isRealEstatePersonalizedResult` gate
2. Add `realEstatePersonalizedResult` useMemo → `buildRealEstatePersonalizedResult`
3. Render block mirroring admin personalized (L3903–3915 pattern)
4. Extend `hideGenericQuotationResult` / `showVerifyQuestionActions` to exclude personalized
5. Remove/update P1+ placeholder in `RealEstatePhase2GateShell` when personalized active
6. **`handleContinueClick`**: personalized CTA → `onRealEstateVerifyAiReport` or noop continue (match admin)

### 9.4 Forbidden UI changes

- Master Funnel Landing redesign
- New result component parallel to AdminVerifyFirstResultPanel
- Phase 2 question UX changes
- Price display

---

## 10. AI Report CTA interface

### 10.1 Existing wiring (preserve)

```
page.tsx handleAiReportRequest()
  → recordAiReportRequestAndNotify({ ... })
  → gate: onRealEstateVerifyAiReport
  → AdminVerifyFirstResultPanel onAiReport
```

### 10.2 Personalized Result requirements

| CTA | Behavior |
|-----|----------|
| AI 1차/2차 분석 신청 | Same handler as first result — **no new API contract** |
| VFBCAI 전문가팀 상담 | `onRealEstateVerifyExpert` — unchanged |
| Primary button label | Match admin personalized ("다음 단계 진행하기" or domain copy per existing real-estate first result) |

### 10.3 Payload for AI Report (read-only enrichment)

Builder should ensure `buildRealEstateDiagnosisDescription(answers)` or extended variant includes Phase 2 lines when submitting — **page meta already uses profiling answers**. IMPLEMENTER verifies meta includes `re2_*` reflection via existing `buildRealEstateVerifyPageMeta` — **extend only if gap found, no CRM write**.

---

## 11. Desktop / Mobile 375 QA matrix

### 11.1 Functional (VERIFIER browser)

| ID | Path | Steps | Assert |
|----|------|-------|--------|
| PR-PRE-1 | PRE full | FREE → P1 → 2차 → reg+clause → complete | Personalized visible · §01–§05 · no Entry Q1 |
| PR-PRE-2 | PRE direct explain | clause direct explain path | Detail in §03 · no choice re-ask text |
| PR-POST-1 | POST deposit | moneyRecovery + timeline | §02 money focus · POST actions |
| PR-POST-2 | POST conflict | conflict direct explain | Detail in §03 |
| PR-DOC-1 | DOCUMENT | docRel + translation | DOCUMENT actions |
| PR-UNC-1 | UNCLEAR → POST chain | bridge → moneyRecovery | UNCLEAR framing · no FREE re-ask |
| PR-UNC-2 | UNCLEAR Material Stop | cannot_classify_yet | §02 insufficient · done · no extra Q |
| PR-GATE-1 | Gate transition | Phase 2 last answer → result | Question UI gone · personalized shown |
| PR-NOREASK | all | DOM scan Phase 2 result | Entry Q1=0 · FREE grid=0 |
| PR-FIRST-1 | Phase 1 only | Stop at ONE RESULT | **Unchanged** first result |

### 11.2 Mobile 375

| ID | Assert |
|----|--------|
| PR-MOB-1 | PRE personalized — no overflowX |
| PR-MOB-2 | POST personalized — textarea sections N/A · CTA not clipped |
| PR-MOB-3 | UNCLEAR Material Stop completion → personalized |
| PR-MOB-4 | §03/§04 cards stack single column |

### 11.3 Harness (IMPLEMENTER new — committed after Ace approval)

Recommended: `tests/qa/pilot-real-estate-phase2-personalized-result.mjs`  
+ extend or separate Playwright spec `tests/qa/real-estate-paid-phase2-personalized.spec.ts` (optional)

---

## 12. P0 / P1a / P1b / P1c regression matrix

| Harness | Required | Gate |
|---------|----------|------|
| `pilot-real-estate-phase2-p0-verify.mjs` | **PASS** | Gate shell · carry-over |
| `pilot-real-estate-phase2-p1a-pre.mjs` | **PASS** | PRE adaptive |
| `pilot-real-estate-phase2-p1b-paths.mjs` | **PASS** | POST/DOC |
| `pilot-real-estate-phase2-p1c-bridge.mjs` | **PASS** | UNCLEAR bridge |
| `pilot-real-estate-phase2-p1c-detail.mjs` | **PASS** | structuredDetail |
| `real-estate-free-e2e.spec.ts` desktop | **PASS** | FREE 4-path · admin/trc smoke |
| `npx tsc --noEmit` | **PASS** | Types |

**Critical regression**: FREE ONE RESULT content/regression for paths stopping at Phase 1 — **must not change**.

---

## 13. 보호 범위 (Frozen / Out of scope)

### 13.1 Frozen (IMPLEMENTER must not modify logic)

- `selectRealEstatePhase2MissingInfo` · bridge resolvers · Material Stop
- `buildRealEstatePhase2ProfileQuestions` · FREE question constants
- P1c direct explain wiring predicate (`wasFieldAsked + ≥20`)
- `buildRealEstateFirstResult` output for Phase 1-only paths
- FREE funnel · Entry Q1 · ONE RESULT Phase 1 layout semantics
- `/check/trc/**` · `/verify/admin/**` behavior

### 13.2 Out of scope (this Mission)

Payment · Subscription · Multi-document · OCR/PDF · Deep AI Report backend · CRM Phase 2 meta · Phase 2 restore · DB/Auth/Storage/RLS · `re2_breachDetail` (optional P1+ later)

### 13.3 Allowed files (expected)

| File | Change |
|------|--------|
| `src/lib/realEstateVerifyPersonalizedResult.ts` | **NEW** — builder + path appenders + context |
| `src/lib/realEstateVerifyFirstResult.ts` | Optional export re-exports only — **no Phase 1 logic change** |
| `src/components/cost-check/MasterReviewQuotationReport.tsx` | Gate + render personalized |
| `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` | Domain section title conditionals only |
| `tests/qa/pilot-real-estate-phase2-personalized-result.mjs` | **NEW** QA (post-approval) |

---

## 14. Human Boundary / NOT VERIFIED

### 14.1 Human Boundary (IMPLEMENTER stops → Ace approval)

- Any change to `realEstateVerifyProfiling.ts` selector / bridge / FREE constants
- CRM / Supabase schema / RLS / restore meta
- `buildRealEstateFirstResult` semantic change affecting Phase 1 regression
- New customer-facing prices
- Legal conclusion wording beyond templates in §7

### 14.2 VERIFIER NOT VERIFIED (acceptable at Mission end)

- Storage-level `re_*` immutability proof
- Deep AI Report backend content
- Restore → Personalized resume
- lint/build if not in CI
- Every PRE/POST/DOC/UNCLEAR combinatorial path — matrix sampling sufficient

---

## 15. P1+ 후속 작업 (after this Mission)

| ID | Mission | Dependency |
|----|---------|------------|
| P1+-2 | Phase 2 Restore (`?restore=1`) | CRM meta approval |
| P1+-3 | Multi-doc / evidence bridge | `/documents` + CRM |
| P1+-4 | Deep AI Report content | Backend + legal review |
| P1+-5 | Payment gate before Phase 2 | Payment infra |
| P1+-6 | `re2_breachDetail` direct explain (optional) | Low priority |
| P1+-7 | SERVICE-layer `/answers/*` profile link | SEO track |

---

## 16. Risk

| Risk | Level | Mitigation |
|------|-------|------------|
| Personalized copy sounds like legal verdict | **HIGH** | §7 templates · VERIFIER phrase scan |
| Phase 1 ONE RESULT regression | **HIGH** | Separate builder file · FREE E2E gate |
| Admin panel coupling | **MEDIUM** | domain prop only · no admin CASE logic import |
| UNCLEAR result over-specifies | **MEDIUM** | Material Stop branch · conflict softening |
| Scope creep into restore/CRM | **MEDIUM** | §13 fence · Human Boundary |
| Mobile stitch layout break | **LOW** | Reuse admin personalized layout · 375 QA |

**Overall Risk: HIGH** — Ace approval required before IMPLEMENTER.

---

## 17. IMPLEMENTER 착수 조건

1. **Ace explicit approval** of this Brief  
2. P0 · P1a · P1b · P1c VERIFIER **PASS** on target branch (current: satisfied)  
3. IMPLEMENTER Mission scope = **P1+-1 only** — one builder + gate + UI wire + QA harness  
4. No parallel edits to P1c profiling selectors  
5. Self-QA: `tsc` + regression matrix §12 + new PR-* scenarios §11  
6. VERIFIER Formal QA before Ace deploy decision  
7. **No commit/push/deploy** until Ace instructs

### Recommended IMPLEMENTER sub-steps

```
PR-1: realEstateVerifyPersonalizedResult.ts builder + unit smoke
PR-2: MasterReviewQuotationReport gate + panel render
PR-3: AdminVerifyFirstResultPanel domain section labels
PR-4: QA harness + regression
```

Single IMPLEMENTER Mission acceptable if Ace prefers one approval.

---

## Architect Recommendation

P1 Architecture(P0→P1c)는 **frozen baseline**으로 유지하고, Admin VERIFY Personalized Result 패턴을 real-estate domain에 **builder + gate + panel reuse**로 이식한다. Profile merge는 이미 `buildRealEstateSituationProfile`에 존재하므로 **해석·표현 레이어만 신규** 추가한다. Phase 1 ONE RESULT 회귀 보호가 최우선 regression gate이다.

```
Risk: HIGH
Ready for Ace approval: YES
Next agent: IMPLEMENTER (after Ace approves this Brief)
VERIFIER: after IMPLEMENTER completes P1+-1
Product code: NOT MODIFIED (this ARCHITECT session)
QA harness: NOT MODIFIED (this ARCHITECT session)
commit / push / deploy: NOT PERFORMED
```
