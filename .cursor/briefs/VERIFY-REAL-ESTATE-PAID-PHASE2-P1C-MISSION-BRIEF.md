# VERIFY Real Estate PAID Phase 2 — P1c Mission Brief

> **Agent**: ARCHITECT only  
> **Risk**: HIGH (UNCLEAR bridge architecture + direct explanation + selector predicate refactor + UI integration)  
> **Prerequisite**: P0 PASS · P1a PRE PASS · P1b POST/DOCUMENT/UNCLEAR PASS  
> **Status**: 설계 완료 — IMPLEMENTER/VERIFIER 미실행 · 제품 코드 미변경  
> **Parent**: `.cursor/briefs/VERIFY-REAL-ESTATE-PAID-PHASE2-P1-MISSION-BRIEF.md`

---

## Executive Summary

P1c는 **Phase 2 adaptive architecture를 완성**하는 Mission이다.

P1a/P1b에서 구현된 choice 기반 adaptive 질문·Gate Shell·Stop Condition·`re2_*` namespace를 **유지**하면서, 다음을 추가한다.

1. **Direct Explanation (`structuredDetail`)** — `re2_*Detail` text keys + 별도 UX  
2. **UNCLEAR bridge** — `unclearFactLock` 이후 Profile gap을 `re2_*`로만 보강한 뒤 POST/DOCUMENT chain 진입  
3. **Full Phase 2 state architecture** — selector · question builder · profile snapshot · interim completion 통합  
4. **P1c QA harness** — PRE/POST/DOCUMENT/UNCLEAR + direct explain + regression 전체

**P1c에서 구현하지 않음**: Personalized Result · payment · multi-doc · OCR · Deep AI Report · CRM Phase 2 meta · Phase 2 restore

---

## 0. Baseline (P1b VERIFIER 확인)

| Item | Status |
|------|--------|
| P0 Gate Shell | PASS |
| P1a PRE adaptive | PASS |
| P1b POST/DOCUMENT choice adaptive | PASS |
| FREE re-ask block | PASS |
| `re_*` carry-over | PASS |
| `re2_*` namespace | PASS |
| Stop → interim completion | PASS |
| PRE `re2_registrationDetail` / `re2_moneyDetail` | **Implemented** (selector + text Q) |
| POST/DOC `structuredDetail` (clause/conflict/timeline detail) | **Not implemented** |
| UNCLEAR → sub-chain (browser) | **Gap** — pure UNCLEAR FREE profile lacks `re_disputeSubject` / `re_docSubject`; lock 후 즉시 completion |
| Direct explain UI (Phase 2) | **Not wired** — admin pattern exists; real-estate Phase 2 choice Q only |

---

## 1. UNCLEAR 경계 — A/B 비교 및 채택안

### 1.1 현상 (P1b VERIFIER)

Pure UNCLEAR FREE flow:

```
Entry unsure + ambiguous text (≥20 chars, inferEntryFromText = null)
→ FREE profiling stops (no dispute/doc/counterparty questions)
→ Phase 2 Gate
→ unclearFactLock (1 question)
→ effectivePhase2ResolutionPath() = POST or DOCUMENT
→ path predicates require FREE keys (re_disputeSubject, re_docSubject, …)
→ no Phase 2 questions fire
→ selector = null → "2차 추가 확인 완료"
```

**원인**: P1b path predicates가 **FREE `re_*` keys만** 읽음. Phase 2는 FREE keys write 금지.

### 1.2 Option A — Bridge 후 chain 진입

**정의**: `unclearFactLock` 답변으로 routing intent를 확정한 뒤, **Profile에 없는 precision fact**를 **`re2_*` bridge 질문**으로만 보강하고, enriched profile 기준으로 POST/DOCUMENT Phase 2 chain 실행.

**장점**

- Situation Tracking 원칙과 일치: missing information 기준 질문  
- 사용자가 `money_status` / `document_status`를 고른 경우 **실질적 Phase 2 가치** 제공  
- 질문 수 adaptive 유지 (bridge 0~N + chain 0~M)  
- FREE 재질문 없이 Phase 2-only precision 확보 가능  
- P1+ Personalized Result를 위한 Profile enrichment 선행

**단점**

- selector · profile merge 복잡도 증가  
- bridge 질문 설계 실수 시 FREE 질문과 **의미 중복** 위험  
- IMPLEMENTER가 predicate helper layer 필수

**사용자 흐름 (A)**

```
FREE ambiguous narrative → ONE RESULT → Phase 2 Gate
→ "가장 먼저 확인해야 할 사실" (unclearFactLock)
→ [필요 시] Phase 2 bridge 1~2 questions (re2_* only)
→ POST or DOCUMENT adaptive chain (기존 P1b)
→ [필요 시] structuredDetail (direct explain)
→ Stop → interim completion
```

### 1.3 Option B — 정보 부족 시 즉시 completion

**정의**: lock 이후 chain에 필요한 fact가 없으면 **추가 질문 없이** completion.

**장점**

- 구현 단순 · P1b 현행 유지  
- "답할 수 없는 것을 억지로 묻지 않음"에 literal하게 부합  
- QA 범위 작음

**단점**

- `money_status` / `document_status` lock이 **행동과 결과 불일치** (선택 의미 없음)  
- Profile enrichment 거의 없음 → P1+ Personalized Result 입력 빈약  
- Situation Tracking 원칙 위배: **missing information이 있는데 질문하지 않음**  
- VERIFIER가 NOT VERIFIED로 기록한 UNCLEAR enriched chain 미해결

### 1.4 VFBCAI Profiling 원칙 대조

| Principle | A (Bridge) | B (Immediate stop) |
|-----------|------------|---------------------|
| Missing information 기준 질문 | ✅ bridge가 gap만 질문 | ❌ gap 있어도 skip |
| 질문 수 비고정 | ✅ | ✅ (항상 0~1) |
| 전문가 판단 필요 정보만 | ✅ guard로 제한 | ⚠️ lock만으로 stop |
| 답 못하는 것 억지로 묻지 않음 | ✅ optional skip value | ✅ |
| CASE 출발점 아님 | ✅ re2 bridge | ✅ |
| 확보 fact 재질문 금지 | ✅ | ✅ |
| Stop = materially no change | ✅ chain+bridge exhausted | ⚠️ lock 직후 stop |
| 내 상황 입력 = Profile 보강 | ✅ re2 text/detail | ❌ lock label only |

### 1.5 **Architect 채택안: A (Bridge + Material Stop)**

**Pure B는 채택하지 않는다.** P1b VERIFIER gap과 profiling 원칙 모두 A를 요구한다.

단, A는 **무한 bridge 금지**. 다음 **Material Stop** guard를 함께 적용한다.

```
After unclearFactLock + bridge attempts:
  IF no bridge question would change any path-specific predicate
  AND no chain question would change profile.status from unknown → confirmed
  THEN selector = null (completion)
```

**Bridge upper bound**: UNCLEAR path에서 bridge missing ID **최대 2개** (lock 포함 총 Phase 2 choice/text 상한은 path chain과 합산 adaptive).

**FREE keys**: bridge answers는 **`re2_*` only**. `re_disputeSubject`, `re_docSubject` 등 **write 금지**.  
Predicates는 **`resolvePhase2Field(answers, profile)`** helper로 FREE + re2 bridge composite 판단.

---

## 2. UNCLEAR Bridge Architecture (P1c 신규)

### 2.1 New missing ID

```typescript
export type RealEstatePhase2MissingId =
  | /* existing P1a/P1b IDs */
  | "unclearBridge"       // re2 bridge choice — ONE active bridge per evaluation
  | "structuredDetail";   // existing — text follow-up
```

### 2.2 `effectivePhase2ResolutionPath` (unchanged intent)

| `re2_unclearFactLock` | Routed chain |
|----------------------|--------------|
| `document_status` | `DOCUMENT_REVIEW` |
| `who_obligated`, `money_status`, `timeline_status` | `POST_DISPUTE` |

No second path pick. No Entry Q1.

### 2.3 Bridge question map

Bridge는 **lock value + profile gap**으로 선택. **FREE label 재사용 금지** — Phase 2 sentence-style.

| Lock | Profile gap | Bridge key | Question (summary) | Fills profile |
|------|-------------|------------|-------------------|---------------|
| `money_status` | money/dispute unknown | `re2_unclearMoneyIssue` | "돈·보증금 문제에서 지금 가장 급한 쪽은?" | `money`, `claims` |
| `document_status` | doc anchor unknown | `re2_unclearDocAnchor` | "지금 핵심으로 봐야 할 서류는?" | `documents`, `claims` |
| `who_obligated` | parties/actions unknown | `re2_unclearPartyFocus` | "누구와의 관계·의무가 먼저 불분명한가요?" | `parties`, `actions` |
| `timeline_status` | dates unknown | `re2_unclearTimelineFocus` | "시간 순서에서 가장 먼저 확인할 것은?" | `dates` |

**Bridge options** (examples — IMPLEMENTER implements as constants):

`re2_unclearMoneyIssue`: `deposit_not_returned` | `payment_dispute` | `penalty_or_fee` | `cannot_classify_yet`  
`re2_unclearDocAnchor`: `lease_contract` | `sale_contract` | `notice_or_letter` | `registration_doc` | `cannot_classify_yet`  
`re2_unclearPartyFocus`: `landlord_seller` | `tenant_buyer` | `agent_manager` | `authority` | `cannot_classify_yet`  
`re2_unclearTimelineFocus`: `when_started` | `deadline_passed` | `procedure_stage` | `cannot_classify_yet`

**`cannot_classify_yet`**: 사용자가 분류 불가 시 선택. Bridge stop — chain predicates는 profile enrichment 없이 진행; chain도 trigger 없으면 **Material Stop → completion**. (억지 추가 질문 금지)

### 2.4 Predicate refactor (required)

P1b functions like `needsMoneyRecoveryPhase2` **must not rely on FREE `re_disputeSubject` alone**.

Introduce internal resolvers (names illustrative):

```typescript
function resolvedDisputeSubject(answers, profile): string | null
function resolvedDocSubject(answers, profile): string | null
function resolvedCounterparty(answers, profile): string | null
```

Resolution order:

1. Confirmed FREE `re_*` (read-only) if present  
2. Else `re2_*` bridge mapping → synthetic profile field (snapshot only)  
3. Else `profile.*.status === confirmed` from customerInput parse (existing, no new FREE write)  
4. Else null → predicate false

**Example**: `needsMoneyRecoveryPhase2` true when  
`resolvedDisputeSubject === "deposit_return"` OR `re2_unclearMoneyIssue === "deposit_not_returned"`.

### 2.5 UNCLEAR selector priority

```
1. unclearFactLock        (path === UNCLEAR && !re2_unclearFactLock)
2. unclearBridge          (path === UNCLEAR && lock set && bridge gap exists)
3. effectivePhase2ResolutionPath → PRE | POST | DOCUMENT chain (P1a/P1b)
4. cross-path conflictFocus / structuredDetail
5. null → Stop
```

**Note**: PRE chain on UNCLEAR is rare (path stays UNCLEAR). If `effectivePhase2ResolutionPath` returns null before lock, only lock+bridge apply.

---

## 3. Direct Explanation Architecture

### 3.1 Principle

Direct explanation is **not a memo**. It is **structured Profile enrichment** triggered when:

- Choice options cannot capture required precision, OR  
- User selects **직접 설명하기** (separate UX — not numbered grid), OR  
- A prior `re2_*` choice explicitly requires detail (`structuredDetail` missing ID)

**Hard rules**

- Write target: **`re2_*Detail` keys only**  
- Never write `realEstateCustomerInput` in Phase 2  
- Min length: **20 chars** (existing UI rule for `re2_*` text)  
- Placeholder must request **who / when / how much / which document / which clause**  
- After save → `attachRealEstateProfileSnapshot` updates profile field to `confirmed`

### 3.2 Detail keys — full spec

| Key | Trigger | Min | Profile field | Expert use | Selector after save |
|-----|---------|-----|---------------|------------|---------------------|
| `re2_registrationDetail` | `re2_registrationConcern=not_checked_yet` | 20 | `rights` | 등기·권리 확인 순서 | `structuredDetail` cleared → next PRE ID |
| `re2_moneyDetail` | `re2_moneySituation=amount_unclear` | 20 | `money` | 금액·지급·반환 방식 | next PRE/POST money chain |
| `re2_clauseDetail` | clauseFocus answered **OR** direct explain on clause Q | 20 | `risk`, `facts` | 불리·불명확 조항 pinpoint | skip re-ask clauseFocus |
| `re2_conflictDetail` | `re2_conflictFocus` answered **OR** direct explain on conflict Q | 20 | `facts` | 불일치 구체 서술 | skip conflict re-ask |
| `re2_timelineDetail` | `re2_timelineStage=months_stalled` **OR** direct explain on timeline Q | 20 | `dates` | 교착·장기 흐름 구체 | skip timeline re-ask |
| `re2_breachDetail` | (optional P1c) breachFocus + direct explain | 20 | `claims`, `facts` | 상대 주장 구체 | only if breachFocus already set |

**P1c minimum scope**: implement **`re2_clauseDetail`**, **`re2_conflictDetail`**, **`re2_timelineDetail`** + wire existing **`re2_registrationDetail`**, **`re2_moneyDetail`** in completion lines (already partial).

**`re2_breachDetail`**: OPTIONAL — include only if direct explain on breach Q is wired without scope creep; otherwise defer to P1+.

### 3.3 Direct explain vs numbered choice

| Situation | UX | Missing ID |
|-----------|-----|------------|
| Discrete expert categories exist | Numbered choice cards | `moneyRecovery`, `docReliability`, … |
| Category known but specifics needed | Choice first → `structuredDetail` text | `structuredDetail` |
| No option fits / user prefers narrative | **직접 설명하기** button → text | `structuredDetail` (same detail key) |
| User cannot classify | Choice includes `cannot_classify_yet` (bridge only) | Material Stop |

**UI pattern** (reuse, do not reinvent):

- Mirror admin Phase 2 / FREE real-estate **직접 설명하기** in `MasterReviewQuotationReport.tsx`  
- Separate button below choice grid · **not** a numbered option  
- On submit: set target `re2_*Detail`, collapse question, re-run selector

### 3.4 `structuredDetail` selector logic

```typescript
function selectStructuredDetailMissing(answers): {
  detailKey: string;
  profileFields: string[];
} | null
```

Priority (first unresolved):

1. `re2_registrationDetail` (PRE)  
2. `re2_moneyDetail` (PRE)  
3. `re2_clauseDetail` (PRE)  
4. `re2_conflictDetail` (any path, mismatch)  
5. `re2_timelineDetail` (POST)  

Return as single missing ID `structuredDetail`; builder emits **one** text question for the active detail key.

**Integration with path priority**:

```
path-specific choices (incl. bridge)
→ structuredDetail (if pending)
→ null
```

Do **not** ask detail before its parent choice is answered (except direct explain replacing parent choice when product allows — P1c: **parent choice required first**, then detail OR direct explain on same step).

---

## 4. P1a/P1b Integration

### 4.1 Unified rules (all paths)

| Rule | Enforcement |
|------|-------------|
| No FREE question IDs in Phase 2 builder | Hard block list (P1 brief §2) |
| No FREE key writes | Code review + snapshot diff QA |
| Phase 2 answers `re2_*` only | Namespace test |
| Same direct explain UX | Shared render path in Master UI |
| Same Stop Condition | `selectRealEstatePhase2MissingInfo === null` |
| Same interim completion | `buildRealEstatePhase2CompletionLines` extended |
| No duplicate dimension | FREE gap category ≠ Phase 2 precision re-ask |

### 4.2 Path-specific chain (preserve P1a/P1b)

| Path | Choice chain (unchanged order) | P1c additions |
|------|-------------------------------|---------------|
| PRE | registrationConcern → reg detail → clauseFocus → moneySituation → money detail | clauseDetail + direct explain |
| POST | moneyRecovery → breach → formal → timeline → authority → conflict | timelineDetail, conflictDetail + direct explain |
| DOCUMENT | docRel → translation → conflict | conflictDetail + direct explain |
| UNCLEAR | lock → **bridge** → inherited chain | bridge keys + detail |

### 4.3 Profile snapshot extensions

Extend `attachRealEstateProfileSnapshot`:

```typescript
_realEstatePhase2Complete: "0" | "1"
_realEstatePhase2LastMissing: string  // debug only, no CRM write
```

Merge bridge + detail into `buildRealEstateSituationProfile` field `source` = respective `re2_*` key.

---

## 5. Full Phase 2 State Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ FREE Phase 1 (frozen)                                       │
│  re_* answers + customerInput + ONE RESULT                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ isRealEstatePhase1Complete
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Phase 2 Gate Shell (P0 — frozen)                            │
│  carry-over read-only · CTA already clicked                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ realEstateVerifyProfilePhase = 2
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ selectRealEstatePhase2MissingInfo(answers)                  │
│  ┌ UNCLEAR: unclearFactLock                                 │
│  ┌ UNCLEAR: unclearBridge (P1c)                             │
│  ├ PRE / POST / DOCUMENT path chain (P1a/P1b + resolvers)   │
│  └ structuredDetail (P1c)                                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ missing !== null
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ buildRealEstatePhase2ProfileQuestions → ONE active question   │
│  choice OR text OR choice + 직접 설명하기                     │
└───────────────────────────┬─────────────────────────────────┘
                            │ answer commit
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ attachRealEstateProfileSnapshot (re2_* merge)               │
└───────────────────────────┬─────────────────────────────────┘
                            │ loop until missing === null
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ Interim completion (P1a — extend lines)                     │
│  "2차 추가 확인 완료" + read-only re2 chips                   │
│  NO Personalized Result (P1+)                                │
└─────────────────────────────────────────────────────────────┘
```

**Session state**: Phase 2 remains session-only (no restore extension in P1c).

---

## 6. Question vs Direct Input Decision Matrix

| Dimension | Prefer choice | Prefer direct explain (`re2_*Detail`) |
|-----------|---------------|--------------------------------------|
| Money status (recovery stage) | ✅ `re2_moneyRecovery` options | ❌ unless `amount_unclear` path |
| Document trust category | ✅ `re2_docReliability` | ❌ |
| Translation mismatch type | ✅ `re2_translationIssue` | ❌ |
| Conflict **which dimension** dominates | ✅ `re2_conflictFocus` | ✅ detail for specifics |
| Clause **which type** worries | ✅ `re2_clauseFocus` | ✅ detail for clause text |
| Timeline **stage** | ✅ `re2_timelineStage` | ✅ detail when `months_stalled` |
| Registration **which anxiety** | ✅ `re2_registrationConcern` | ✅ detail when `not_checked_yet` |
| UNCLEAR **routing intent** | ✅ `re2_unclearFactLock` | ❌ |
| UNCLEAR **anchor** after lock | ✅ bridge choices | ❌ (use `cannot_classify_yet`) |
| Narrative spanning multiple fields | ❌ | ✅ direct explain on active Q |

**Rule of thumb**: Choice = **classification** for expert routing; Direct explain = **precision fact** that changes handling within that class.

---

## 7. P1c Scope vs P1+ Deferral

### 7.1 P1c — IMPLEMENTER MAY build

| Item | Notes |
|------|-------|
| `resolvePhase2Field` / bridge resolvers | `realEstateVerifyProfiling.ts` |
| `unclearBridge` missing ID + questions | same |
| `re2_unclearMoneyIssue`, `re2_unclearDocAnchor`, … constants | same |
| `re2_clauseDetail`, `re2_conflictDetail`, `re2_timelineDetail` | same |
| `selectStructuredDetailMissing` unified | same |
| POST/DOC/PRE detail append in builders | same |
| `buildRealEstatePhase2CompletionLines` extend | same |
| `buildRealEstateSituationProfile` re2 bridge merge | same |
| Phase 2 direct explain UI | `MasterReviewQuotationReport.tsx` |
| QA harness | `tests/qa/pilot-real-estate-phase2-p1c-*.mjs` |

### 7.2 P1+ — defer

| Item | Reason |
|------|--------|
| `buildRealEstatePersonalizedResult` | Separate Mission |
| Payment gate before/during Phase 2 | No payment infra |
| Multi-document / evidence bridge | CRM + uploads |
| OCR / PDF analysis | Out of GOAL1 |
| Deep AI Report content change | P1+ |
| CRM `_realEstatePhase2*` meta persist | Human Boundary |
| Phase 2 restore (`?restore=1`) | CRM approval |
| `re2_breachDetail` | Optional; defer if scope tight |

---

## 8. Protected Areas (DO NOT CHANGE)

| Area | Rule |
|------|------|
| FREE funnel questions / labels / adaptive | **Frozen** |
| FREE ONE RESULT builder | **Frozen** |
| P0 Gate Shell structure | **Frozen** |
| P1a PRE choice questions (wording/order) | **Frozen** unless detail wiring requires label-neutral hook |
| P1b POST/DOCUMENT/UNCLEAR choice questions | **Frozen** — P1c adds bridge/detail only |
| Existing restore (FREE round-trip) | **Frozen** |
| `/verify/admin`, `/check/trc` | **No regression** |
| DB / Supabase / RLS / Auth / Storage / CRM schema | **Human Boundary** |

**Allowed**: extend predicates to **read** FREE keys; add `re2_*`; extend snapshot JSON **internally** (no new CRM writes).

---

## 9. 변경 예정 파일

| File | Change level |
|------|--------------|
| `src/lib/realEstateVerifyProfiling.ts` | **Primary** — bridge, resolvers, detail selectors, profile merge, completion lines |
| `src/components/cost-check/MasterReviewQuotationReport.tsx` | **Medium** — Phase 2 direct explain UX, detail text rendering |
| `tests/qa/pilot-real-estate-phase2-p1c-bridge.mjs` | **New** — UNCLEAR bridge scenarios |
| `tests/qa/pilot-real-estate-phase2-p1c-detail.mjs` | **New** — structuredDetail + direct explain |
| `tests/qa/pilot-real-estate-phase2-p1c-verifier.mjs` | **New** — formal VERIFIER bundle |
| `tests/qa/pilot-real-estate-phase2-p0-verify.mjs` | **Run only** — regression |
| `tests/qa/pilot-real-estate-phase2-p1a-pre.mjs` | **Run only** |
| `tests/qa/pilot-real-estate-phase2-p1b-paths.mjs` | **Run only** |
| `tests/qa/real-estate-free-e2e.spec.ts` | **Run only** |

### Forbidden touch

- `src/app/check/trc/**`  
- `src/app/verify/admin/**`  
- `src/lib/buildRealEstateFirstResult.ts` (FREE)  
- `supabase/**`

---

## 10. QA Architecture (P1c VERIFIER)

### 10.1 Regression (every P1c VERIFIER run)

| # | Command | Expect |
|---|---------|--------|
| R1 | `npx tsc --noEmit` | PASS |
| R2 | `node tests/qa/pilot-real-estate-phase2-p0-verify.mjs` | PASS |
| R3 | `node tests/qa/pilot-real-estate-phase2-p1a-pre.mjs` | PASS |
| R4 | `node tests/qa/pilot-real-estate-phase2-p1b-paths.mjs` | PASS |
| R5 | `/verify/admin` smoke | PASS |
| R6 | `/check/trc` smoke | PASS |
| R7 | `npx playwright test tests/qa/real-estate-free-e2e.spec.ts --project=desktop` | PASS |

### 10.2 P1c functional matrix

| ID | Area | Scenario | Assert |
|----|------|----------|--------|
| C-PRE-D1 | PRE detail | `not_checked_yet` → reg detail text ≥20 | completion includes 등기 확인 상세 |
| C-PRE-D2 | PRE detail | `amount_unclear` → money detail | money chip enriched |
| C-PRE-D3 | PRE direct | clauseFocus Q → 직접 설명하기 → `re2_clauseDetail` | not numbered option |
| C-POST-D1 | POST detail | `months_stalled` → timeline detail | dates enriched |
| C-POST-D2 | POST direct | conflictFocus → 직접 설명하기 | `re2_conflictDetail` |
| C-DOC-D1 | DOCUMENT | mismatch conflict → detail optional path | no FREE gap re-ask |
| C-UNC-PURE | UNCLEAR | ambiguous FREE → lock only → **bridge or material stop** | Entry Q1 = 0 |
| C-UNC-DOC | UNCLEAR | lock `document_status` → bridge doc anchor → docRel chain | ≥2 Phase 2 Qs; no path re-pick |
| C-UNC-POST | UNCLEAR | lock `money_status` → bridge money issue → moneyRecovery | POST chain visible |
| C-UNC-SHORT | UNCLEAR | bridge `cannot_classify_yet` → material stop | completion, no forced Q |
| C-ADAPT-PRE | PRE | viewing vs ready_to_sign | question count differs |
| C-ADAPT-POST | POST | deposit vs breach | moneyRecovery vs breachFocus first |
| C-ADAPT-DOC | DOC | match vs translation+mismatch | 1 vs 3 questions |
| C-NOREASK | all | Phase 2 active | Entry Q1 visible = 0; FREE snippets = 0 |
| C-STOP | all | after completion | selector null; no extra Q |
| C-NS | namespace | Phase 2 answers | only `re2_*` new writes |
| C-CARRY | all | carry-over | FREE labels unchanged |
| C-MOB-PRE | mobile 375 | active detail text | no overflow |
| C-MOB-UNC | mobile 375 | bridge + chain | no clipped choices |

### 10.3 UNCLEAR QA buckets (mandatory separation)

| Bucket | FREE setup | Phase 2 expectation |
|--------|------------|---------------------|
| **Pure ambiguous** | unsure + non-inferring text | lock → (bridge if A) → stop or short chain |
| **DOCUMENT-identified** | lock `document_status` + bridge fills doc anchor | docRel → … → completion |
| **POST-identified** | lock `money_status` + bridge fills money issue | moneyRecovery → … → completion |
| **Insufficient → completion** | bridge `cannot_classify_yet` + no predicates | immediate material stop |

### 10.4 PASS criteria (P1c Mission done)

- [ ] All R1–R7 regression PASS  
- [ ] C-PRE/POST/DOC detail scenarios PASS (desktop)  
- [ ] C-UNC-DOC and C-UNC-POST PASS (desktop) — **P1c gate**  
- [ ] C-NOREASK, C-STOP, C-NS PASS  
- [ ] Mobile 375: at least one detail + one UNCLEAR scenario PASS  
- [ ] No FREE funnel code diff except accidental — git scope check  
- [ ] IMPLEMENTER reports files touched ⊆ §9

---

## 11. IMPLEMENTER Sub-Missions (recommended order)

```
P1c-1: resolvePhase2Field helpers + bridge selector + profile merge
P1c-2: structuredDetail (clause/conflict/timeline) + completion lines
P1c-3: Master UI direct explain wiring
P1c-4: QA harness + self-check
```

Single IMPLEMENTER Mission acceptable if Ace prefers one approval.

---

## 12. Risks & Human Boundary

| Risk | Level | Mitigation |
|------|-------|------------|
| Bridge questions feel like FREE re-ask | HIGH | New sentences + `re2_*` keys only; QA C-NOREASK |
| Predicate refactor breaks P1b POST/DOC | HIGH | R4 + path-specific unit tests in harness |
| Scope creep into Personalized Result | MEDIUM | Explicit P1+ fence in PR description |
| Direct explain duplicated as numbered option | MEDIUM | UI review + vfbcai-funnel-profile rule |
| CRM snapshot size | LOW | Internal JSON only; no CRM write |
| UNCLEAR bridge over-questioning | MEDIUM | Max 2 bridge + Material Stop |

**Human Boundary triggers**

- Any `re_*` write in Phase 2  
- CRM / restore schema changes  
- FREE question text changes  
- Payment / OCR hooks

---

## Architect Recommendation

### P1c 권장 구조

**A-Bridge + Material Stop + unified `structuredDetail` + direct explain UX** 로 Phase 2 architecture를 완성한다. P1b choice layer는 frozen; P1c는 resolver layer + bridge + detail + UI만 추가.

### UNCLEAR 채택안

| Option | Decision |
|--------|----------|
| **A** — bridge → chain | **✅ CHOSEN** |
| **B** — immediate completion | **❌ REJECTED** (superseded by Material Stop within A) |

### 변경 예정 파일

- `src/lib/realEstateVerifyProfiling.ts` (primary)  
- `src/components/cost-check/MasterReviewQuotationReport.tsx` (direct explain)  
- `tests/qa/pilot-real-estate-phase2-p1c-*.mjs` (new harness)

### QA 시나리오

§10.2 matrix (C-PRE-D* … C-MOB-*) + §10.1 regression R1–R7 + UNCLEAR four buckets §10.3.

### P1+로 미루는 항목

Personalized Result · payment · multi-doc · OCR · Deep AI Report · CRM Phase 2 meta · Phase 2 restore · optional `re2_breachDetail`.

### Risk

**HIGH** — Ace approval required before IMPLEMENTER.

---

```
Risk: HIGH
Ready for Ace approval: YES
Next agent: IMPLEMENTER (P1c, after Ace approves this Brief)
VERIFIER: after IMPLEMENTER completes P1c
Product code: NOT MODIFIED (this document only)
```

---

*Document: `.cursor/briefs/VERIFY-REAL-ESTATE-PAID-PHASE2-P1C-MISSION-BRIEF.md`*
