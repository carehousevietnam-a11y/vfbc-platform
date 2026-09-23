# VERIFY Real Estate PAID Phase 2 — P1 Mission Brief

> **Agent**: ARCHITECT only  
> **Risk**: HIGH (신규 adaptive 질문 + Profile 확장 + Master UI Phase 2 flow)  
> **Prerequisite**: P0 PASS (Phase state machine + gate shell + VERIFIER QA)  
> **Status**: 설계 완료 — IMPLEMENTER/VERIFIER 미실행 · 제품 코드 미변경  
> **Baseline**: FREE 4-path E2E PASS · Restore PASS · P0 Phase 2 gate PASS

---

## Executive Summary

P1은 **Critical Missing Information을 Profile gap 기준으로 adaptive하게 추가 확보**하는 Mission이다.  
질문 수는 고정하지 않으며, **FREE `RealEstateSituationProfile`에서 `unknown` / `inferred`인 필드**와 **전문가 판단에 필요한 precision fact**만 Phase 2에서 채운다.

**P1에서 구현**: `selectRealEstatePhase2MissingInfo` + `buildRealEstatePhase2ProfileQuestions` + Phase 2 UI 질문 렌더링 + Profile snapshot 확장  
**P1+로 미룸**: Personalized Result · multi-doc · CRM meta · Deep AI Report · payment gate

---

## 1. FREE Profile → Phase 2 Profile Carry-over

### 현재 구조 (P0 확인)

| Layer | Mechanism |
|-------|-----------|
| FREE answers | `re_*`, `realEstateSituationEntry`, `realEstateCustomerInput` |
| Profile object | `buildRealEstateSituationProfile(answers)` → 15 fields + path + customerInput |
| Snapshot | `attachRealEstateProfileSnapshot` → `real_estate_situation_profile_json` |
| Phase gate | `realEstateVerifyProfilePhase: 1 \| 2` in `MasterReviewQuotationReport` |
| P0 carry-over UI | `buildRealEstatePhase1CarryOverLines` (read-only) |

### P1 carry-over 규칙

1. **FREE answer keys는 Phase 2에서 write 금지** — UI에 FREE 질문 재노출 금지 (P0 guard 유지)
2. **Phase 2 answers는 `re2_*` namespace만 사용** — FREE keys와 충돌 방지
3. **`buildRealEstateSituationProfile` 확장** — FREE fields 유지 + `re2_*` 반영 시 해당 Profile field를 `confirmed`로 승격
4. **`attachRealEstateProfileSnapshot` 확장** — internal flags 추가:
   - `_realEstatePhase2Complete: "0" | "1"`
   - `_realEstatePhase2NextMissing: string` (debug/restore prep, CRM write 없음)
5. **Phase 2 UI 상단** — P0 carry-over banner + read-only chips **항상 유지** (질문 진행 중에도)

### Profile field → Phase 2 answer mapping (신규)

| Profile field | FREE typical status | Phase 2 fills via |
|-------------|---------------------|-------------------|
| `money` | unknown / inferred | `re2_moneySituation`, `re2_moneyDetail?` |
| `dates` | unknown | `re2_timelineStage`, `re2_timelineDetail?` |
| `responses` | unknown (PRE) / partial (POST) | `re2_formalResponse`, `re2_authorityStage?` |
| `rights` | unknown / partial | `re2_registrationConcern`, `re2_registrationDetail?` |
| `facts` | category only | `re2_conflictFocus`, `re2_conflictDetail?` |
| `documents` | match label only | `re2_docReliability`, `re2_translationIssue?` |
| `evidence` | 1-file flag | P1+ (multi-doc) — P1에서 질문만 |
| `risk` | candidate | enriched from Phase 2 answers (derived, not re-asked) |

---

## 2. FREE 정보 재질문 금지 규칙

### Hard block (Phase 2 question builder)

`buildRealEstatePhase2ProfileQuestions` **must never emit**:

| Blocked IDs | Reason |
|-------------|--------|
| `realEstateSituationEntry` | Entry Q1 |
| `re_preStage`, `re_disputeSubject`, `re_docSubject` | Path entry |
| `re_propertyType`, `re_counterparty`, `re_goal` | FREE core |
| `re_docsMatch`, `re_situationGap` | FREE docs/gap |
| `realEstateCustomerInput` | FREE narrative (Phase 2 uses `re2_*` text only) |

### Soft block (selector)

`selectRealEstatePhase2MissingInfo` **must not return** a missing ID if FREE answer already **confirmed** that dimension — even if Profile field is `inferred`, prefer **precision follow-up** (`re2_*`) not FREE re-ask.

### UI guard (existing P0 — preserve)

- `isRealEstatePhase2Review` → FREE question section hidden
- `buildRealEstateVerifyProfileQuestions` **not called** when `realEstateVerifyProfilePhase === 2`
- Restore: `_realEstateProfilingComplete === "1"` → FREE skip; Phase 2 state **session-only in P1** (restore extension = P1+)

---

## 3. `selectRealEstatePhase2MissingInfo` 설계

### Signature

```typescript
export type RealEstatePhase2MissingId =
  | "moneySituation"      // cross-path money precision
  | "registrationConcern" // rights / 등기
  | "clauseFocus"         // PRE risk clause
  | "formalResponse"      // POST response stage
  | "disputeTimeline"     // POST dates
  | "breachFocus"         // POST breach detail
  | "moneyRecovery"       // POST deposit return
  | "authorityStage"      // POST authority
  | "docReliability"      // DOCUMENT trust
  | "translationIssue"    // DOCUMENT translation
  | "conflictFocus"       // mismatch precision (any path)
  | "unclearFactLock"     // UNCLEAR residual unknown
  | "structuredDetail";   // text follow-up for prior re2 choice

export function selectRealEstatePhase2MissingInfo(
  answers: ReviewAnswers,
): RealEstatePhase2MissingId | null;
```

### Preconditions

- `isRealEstatePhase1Complete(answers) === true`
- `realEstateVerifyProfilePhase === 2` (UI layer; selector is pure on answers)

### Algorithm

1. `profile = buildRealEstateSituationProfile(answers)`
2. `path = profile.resolutionPath`
3. Evaluate **path-specific** missing IDs (see §4–7)
4. Evaluate **cross-path** missing IDs
5. If choice answer requires structured detail → `structuredDetail`
6. Return **first** unresolved ID in priority order below
7. Return `null` → Phase 2 questions complete

### Priority order (adaptive — not fixed count)

```
PATH-SPECIFIC (highest first):
  PRE:     registrationConcern → clauseFocus → moneySituation
  POST:    moneyRecovery → breachFocus → formalResponse → disputeTimeline → authorityStage
  DOCUMENT: docReliability → translationIssue → conflictFocus
  UNCLEAR: unclearFactLock → (then inherit path-specific once path locked)

CROSS-PATH:
  conflictFocus (if docsMatch=mismatch && !re2_conflictFocus)
  moneySituation (if money.status unknown && path needs money)
  structuredDetail (if pending detail for answered re2 choice)

STOP: null
```

### Helper predicates (examples)

```typescript
needsMoneySituation(profile, answers):
  profile.money.status === "unknown"
  OR (profile.money.status === "inferred" && !answers.re2_moneySituation)
  OR (answers.re_situationGap === "amount_diff" && !answers.re2_moneySituation)

needsConflictFocus(profile, answers):
  answers.re_docsMatch === "mismatch" && !answers.re2_conflictFocus

needsStructuredDetail(answers):
  answers.re2_moneySituation === "amount_unclear" && !answers.re2_moneyDetail?.trim()
  OR answers.re2_conflictFocus === "need_detail" && !answers.re2_conflictDetail?.trim()
  // ... per-option detail triggers
```

---

## 4. PRE — Critical Missing Information

**FREE already knows**: preStage, property, counterparty, goal, docsMatch, situationGap  
**Profile gaps**: `money` (precision), `rights` (등기), `risk` (clause-level), `dates` (usually unknown)

### Missing ID: `registrationConcern`

| Item | Value |
|------|-------|
| **Trigger** | `property.value` includes 매매/소유권 OR `re_goal` ∈ {notary, full_review, risk_terms} OR `re_preStage` ∈ {draft_received, ready_to_sign} |
| **Skip if** | `re2_registrationConcern` answered |
| **Profile field** | `rights` |
| **Why needed** | FREE only knows transaction type; expert needs **which registration anxiety** before sign |

**Question** (`re2_registrationConcern`):

> 서명·납부 전에 등기·소유권 쪽에서 가장 먼저 확인하고 싶은 부분은 무엇인가요?

| Value | Label (sentence-style) |
|-------|-------------------------|
| `owner_mismatch` | 등기부등본상 소유자·권리자와 계약 상대가 다릅니다 |
| `encumbrance` | 근저당·가압류·가등기 같은 제한이 걱정됩니다 |
| `authority_unclear` | 매도인·임대인의 처분권한(위임·대리)이 불분명합니다 |
| `not_checked_yet` | 아직 등기 확인 전이라 무엇을 봐야 할지 모르겠습니다 |

**Links FREE**: `re_propertyType`, `re_preStage`, `re_goal`  
**Next impact**: may trigger `structuredDetail` if `not_checked_yet` → `re2_registrationDetail` text  
**Result use**: Phase 2 §02 권리·등기 bullet; P1+ personalized context

---

### Missing ID: `clauseFocus`

| Item | Value |
|------|-------|
| **Trigger** | `re_goal` ∈ {risk_terms, full_review} OR `re_preStage` ∈ {draft_received, deposit_agreed} |
| **Skip if** | `re2_clauseFocus` answered |
| **Profile field** | `risk`, `facts` |

**Question** (`re2_clauseFocus`):

> 계약서·초안에서 지금 가장 걸리는 조항 유형은 무엇에 가깝나요?

| Value | Label |
|-------|-------|
| `deposit_terms` | 보증금·계약금·중도금 조건이 걱정됩니다 |
| `termination_penalty` | 해지·위약·손해배상 조항이 불리합니다 |
| `delivery_handover` | 인도·원상복구·특약 기준이 불명확합니다 |
| `hidden_obligation` | 추가 부담·관리비·수선 의무가 숨어 있습니다 |

**Direct input**: option `need_clause_detail` → `re2_clauseDetail` text (min 20 chars) via `structuredDetail`

---

### Missing ID: `moneySituation` (PRE branch)

| Item | Value |
|------|-------|
| **Trigger** | `re_propertyType=계약금` OR `re_preStage=deposit_agreed` OR `re_goal` involves deposit OR `re_situationGap=amount_diff` |
| **Profile field** | `money` |

**Question** (`re2_moneySituation`):

> 계약금·보증금·중도금 조건을 다시 짚어보면 — 지금 가장 걸리는 부분은 무엇인가요?

| Value | Label |
|-------|-------|
| `verbal_vs_written` | 말로 한 금액·조건과 서류 내용이 다릅니다 |
| `extra_demand` | 처음 합의와 달리 추가 납부를 요구받았습니다 |
| `return_unclear` | 반환·환불 조건·시점이 불명확합니다 |
| `amount_unclear` | 금액 자체는 맞지만 지급·반환 방식이 불분명합니다 |

**Detail**: `amount_unclear` → `re2_moneyDetail` text

### PRE Stop Condition

`selectRealEstatePhase2MissingInfo` returns null when all triggered PRE IDs resolved + no pending `structuredDetail`.

---

## 5. POST — Critical Missing Information

**FREE already knows**: disputeSubject, counterparty, goal, docsMatch, situationGap  
**Profile gaps**: `money` precision, `dates`, `responses` detail, `rights` (if not ownership dispute)

### Missing ID: `moneyRecovery`

| Trigger | `re_disputeSubject === "deposit_return"` |
| Question | 보증금·계약금을 돌려받지 못한 상황 — 지금 상태는 무엇에 가깝나요? |
| Key | `re2_moneyRecovery` |
| Options | `full_denial` 상대가 반환 자체를 거부합니다 / `partial_paid` 일부만 받았습니다 / `offset_claim` 상대가 다른 채무로 상계합니다 / `deadline_passed` 약속한 반환일이 지났습니다 |
| Profile | `money`, `dates` |

### Missing ID: `breachFocus`

| Trigger | `re_disputeSubject` ∈ {contract_breach, damage_penalty, rent_increase} |
| Key | `re2_breachFocus` |
| Question | 계약 위반·손해배상·조건 변경 문제에서 상대 주장의 핵심은 무엇인가요? |
| Options | sentence-style per dispute type (해지 정당성 / 위약금 정당성 / 임대료 인상 근거 / 추가 과금 근거) |
| Profile | `claims`, `facts` |

### Missing ID: `formalResponse`

| Trigger | `re_goal` ∈ {before_response, negotiating, preparing_objection} |
| Key | `re2_formalResponse` |
| Question | 문제가 생긴 뒤 공식 대응을 어느 단계까지 하셨나요? |
| Options | `no_formal_yet` 아직 서면·공식 연락 없음 / `sent_notice` 내용증명·해지통지·요구서 발송 / `negotiating` 협의 중이나 합의 없음 / `received_counter` 상대·기관 답변 받았으나 불충분 |
| Profile | `responses`, `actions` |

### Missing ID: `disputeTimeline`

| Trigger | any POST with `re_disputeSubject` answered |
| Key | `re2_timelineStage` |
| Question | 문제가 시작된 시점과 지금까지의 흐름 — 어느 설명이 가장 가깝나요? |
| Options | `just_started` 최근 발생·아직 초기 / `weeks_ongoing` 수주간 연락·협의 반복 / `months_stalled` 수개월 이상 교착 / `legal_started` 기관·법원 절차 시작 |
| Profile | `dates` |

### Missing ID: `authorityStage`

| Trigger | `re_counterparty=authority_court` OR `re_goal` ∈ {authority_filed, after_decision} |
| Key | `re2_authorityStage` |
| Question | 경찰·검찰·법원·행정기관 관련 절차는 어느 단계인가요? |
| Options | `preparing_filing` 접수 준비 중 / `filed_waiting` 접수 후 대기 / `hearing_scheduled` 출석·심문·조사 예정 / `decision_issued` 결정·판결·처분 통보 받음 |
| Profile | `responses` |

### POST Stop

All triggered POST IDs + `structuredDetail` resolved → null

---

## 6. DOCUMENT — Critical Missing Information

**FREE already knows**: docSubject, property, goal, docsMatch, situationGap  
**Profile gaps**: document content trust, translation, conflict stance

### Missing ID: `docReliability`

| Trigger | `re_docSubject` ∈ {notice_letter, registration_doc, sale_contract, lease_contract} |
| Key | `re2_docReliability` |
| Question | 받은 서류 자체를 신뢰할 수 있는지 — 어떤 의심이 가장 큽니까? |
| Options | `wrong_party` 문서상 당사자·명의가 다릅니다 / `outdated_record` 등기·날짜·버전이 오래되었습니다 / `unofficial_copy` 공식 원본·인증이 아닌 것 같습니다 / `content_surprise` 예상과 다른 의무·금액이 추가되었습니다 |
| Profile | `documents`, `risk` |

### Missing ID: `translationIssue`

| Trigger | `re_goal=translation` OR `re_situationGap=translation_error` |
| Key | `re2_translationIssue` |
| Question | 원본과 번역본을 대조할 때 — 어떤 차이가 가장 걱정되나요? |
| Options | `amount_diff` 금액·보증금 표현이 다릅니다 / `party_name_diff` 당사자·주소 표기가 다릅니다 / `obligation_diff` 의무·해지 조항 해석이 다릅니다 / `date_diff` 날짜·기한 표현이 다릅니다 |
| Profile | `documents`, `facts` |

### Missing ID: `conflictFocus` (DOCUMENT priority)

| Trigger | `re_docsMatch=mismatch` (already have gap category from FREE) |
| Key | `re2_conflictFocus` |
| Question | 서류 내용과 실제 겪은 상황이 다를 때 — 무엇이 가장 크게 다릅니까? |
| Options | reuse precision from FREE gap types but **narrower situational sentences** — NOT same labels as `re_situationGap` |
| Note | FREE answered gap **category**; Phase 2 asks **which dimension dominates for expert** |

**Important**: Do NOT re-ask `re_situationGap` options. New sentences, new key.

---

## 7. UNCLEAR — Critical Missing Information

**FREE already knows**: customerInput (≥20), inferred path  
**Profile gaps**: path may be inferred; money/dates/parties often still unknown

### Missing ID: `unclearFactLock`

| Trigger | `resolutionPath=UNCLEAR` OR entry was `unsure` then inferred |
| Key | `re2_unclearFactLock` |
| Question | 설명해 주신 내용을 바탕으로 — 지금 가장 먼저 확인해야 할 사실은 무엇인가요? |
| Options | `who_obligated` 누가 무엇을 해야 하는지 / `money_status` 돈·보증금·계약금 상태 / `document_status` 어떤 서류가 핵심인지 / `timeline_status` 언제·어떤 순서로 일이 벌어졌는지 |
| Profile | routes to next path-specific missing ID |

After `unclearFactLock`, selector **re-evaluates path** (already locked in FREE) and continues with PRE/POST/DOCUMENT-specific chain — **no second path pick question**.

---

## 8. "내 상황 입력" — 구조화된 Profile 보강

### Pattern (Admin reference — do not copy admin keys)

| Pattern | Phase 2 usage |
|---------|---------------|
| `kind: "choice"` | Primary situational options (sentence-style) |
| `kind: "text"` via `structuredDetail` | Triggered when choice needs precision |
| Separate **직접 설명하기** button | NOT in numbered grid — reuse `renderVerifyStyleActiveQuestion` admin pattern for Phase 2 only |

### Phase 2 text keys (structured detail)

| Key | Trigger | Min length | Profile target |
|-----|---------|------------|----------------|
| `re2_moneyDetail` | moneySituation=`amount_unclear` | 20 | `money.value` append |
| `re2_registrationDetail` | registrationConcern=`not_checked_yet` | 20 | `rights.value` |
| `re2_clauseDetail` | clauseFocus=`need_clause_detail` or direct explain | 20 | `risk.value` |
| `re2_conflictDetail` | conflictFocus=`need_detail` | 20 | `facts.value` |
| `re2_timelineDetail` | timelineStage=`months_stalled` + optional | 20 | `dates.value` |

### Rules

- Text is **not a memo field** — placeholder must ask for structured facts (who/when/how much/which document)
- On commit → `attachRealEstateProfileSnapshot` (extended) updates JSON snapshot
- **Never** write to `realEstateCustomerInput` in Phase 2

---

## 9. Phase 2 답변 → Result 사용 (P1 scope)

P1 **does not ship** `buildRealEstatePersonalizedResult` (P1+). Phase 2 answers still must be designed for downstream use.

| Phase 2 answer | Profile field | P1 UI effect | P1+ Result effect |
|----------------|---------------|--------------|-------------------|
| `re2_moneySituation` | `money` confirmed | carry-over chip update optional | §03 위험 · §02 금액 |
| `re2_registrationConcern` | `rights` confirmed | — | §02 권리·등기 |
| `re2_formalResponse` | `responses` confirmed | — | §04 대응 경로 |
| `re2_conflictFocus` | `facts` precision | — | §02·§03 불일치 |
| `re2_*Detail` text | field value enriched | — | personalizedContext |

### P1 interim completion UI

When `selectRealEstatePhase2MissingInfo === null`:

- Replace placeholder `"P1+에서 이어집니다"` with **"2차 추가 확인 완료"** summary block
- List Phase 2 answers as read-only chips (mirror carry-over)
- **Do not** show personalized result panel yet
- CTAs remain AI Report / Expert (existing) — unchanged

---

## 10. Protected Areas

| Area | P1 rule |
|------|---------|
| FREE question defs / labels / adaptive logic | **No change** |
| FREE stop / evidence / signup | **No change** |
| FREE ONE RESULT builder | **No change** |
| Restore meta round-trip | **No change** (Phase 2 session-only) |
| `/verify/admin` | **No change** |
| `/check/trc` | **No change** |
| P0 Phase 2 gate shell | **Preserve** (banner + carry-over) |
| DB / Supabase / RLS / Auth / Storage | **No change** |
| CRM schema / new meta keys | **P1+** (Human Boundary) |
| Payment / OCR / AI backend | **Out of scope** |

---

## 11. P1 구현 가능 vs P1+ 미룸

### P1 — IMPLEMENTER may build

| Item | Files |
|------|-------|
| `RealEstatePhase2MissingId` type + selector | `realEstateVerifyProfiling.ts` |
| `buildRealEstatePhase2ProfileQuestions` | same |
| Extend `buildRealEstateSituationProfile` for `re2_*` | same |
| Extend `attachRealEstateProfileSnapshot` Phase 2 flags | same |
| Phase 2 question flow in Master UI | `MasterReviewQuotationReport.tsx` |
| Phase 2 completion summary (interim) | same |
| Direct explain for Phase 2 text | same (reuse render pattern) |
| QA spec draft | `tests/qa/real-estate-paid-phase2-p1.spec.ts` |

### P1+ — defer

| Item | Reason |
|------|--------|
| `buildRealEstatePersonalizedResult` | Separate Mission |
| Multi-doc / evidence bridge | `/documents` + CRM |
| Restore Phase 2 meta | CRM approval |
| Payment gate before Phase 2 | No payment infra |
| Document relationship engine | Needs uploads |
| legalRag citations | Not verified for real-estate |
| SERVICE-layer 자세히 보기 profile link | P7 in roadmap |

### Recommended IMPLEMENTER sub-phases

```
P1a: selector + buildRealEstatePhase2ProfileQuestions + PRE questions + UI wiring
P1b: POST + DOCUMENT + UNCLEAR question defs
P1c: structuredDetail text + completion summary + QA
```

One IMPLEMENTER Mission per sub-phase (Ace approval each).

---

## 12. 변경 예정 파일

| File | Change |
|------|--------|
| `src/lib/realEstateVerifyProfiling.ts` | **Primary** — selector, Phase 2 questions, profile merge, snapshot flags |
| `src/components/cost-check/MasterReviewQuotationReport.tsx` | Phase 2 question flow (mirror `adminVerifyPhase2OnlyQuestions`), keep P0 shell |
| `tests/qa/real-estate-paid-phase2-p1.spec.ts` | **New** — P1 QA |
| `tests/qa/pilot-real-estate-phase2-p0-verify.mjs` | Extend or keep separate |

### Reuse unchanged

| File | Reason |
|------|--------|
| `buildRealEstateFirstResult.ts` | FREE frozen |
| `AdminVerifyFirstResultPanel.tsx` | P1+ personalized |
| `page.tsx` | No new handlers until P1+ CRM |
| `adminVerifyProfiling.ts` | Reference only |
| `restoreVerifyLead.ts` | P1+ |

### Forbidden

- `src/app/check/trc/**`
- `src/app/verify/admin/**`
- `supabase/**`

---

## 13. QA 시나리오

### Harness: `tests/qa/real-estate-paid-phase2-p1.spec.ts`

| ID | Path | Steps | Assert |
|----|------|-------|--------|
| P1-PRE-1 | PRE deposit | FREE → Phase 2 → answer moneySituation | no Entry Q1; `re2_*` saved |
| P1-PRE-2 | PRE draft+risk | triggers clauseFocus | clause options visible |
| P1-PRE-3 | PRE ownership | triggers registrationConcern | rights question |
| P1-POST-1 | POST deposit_return | moneyRecovery question | not moneyRecovery on PRE |
| P1-POST-2 | POST before_response | formalResponse | POST-only |
| P1-DOC-1 | DOCUMENT mismatch | conflictFocus | not re_situationGap UI |
| P1-UNC-1 | UNCLEAR | unclearFactLock then path chain | no entry Q1 |
| P1-CARRY | all | Phase 2 top chips show FREE profile | FREE labels present |
| P1-NOREASK | all | Entry Q1 DOM = 0 in Phase 2 | P0 regression |
| P1-DETAIL | PRE amount_unclear | text detail required | min 20 chars |
| P1-ADAPT | PRE viewing only | fewer questions than PRE ready_to_sign | adaptive count |
| P1-DONE | PRE full | completion summary | no personalized variant |
| P1-FREE-REG | all paths | free E2E | PASS |
| P1-RESTORE | PRE | restore → ONE RESULT | no Phase 2 auto |
| P1-SMOKE | — | admin + trc | PASS |
| P1-MOB | PRE | 375px | no overflow |

### vfbcai-funnel-qa checklist mapping

- #2 answer save → Phase 2 commitAnswer
- #4 no re-ask confirmed facts
- #6 direct explain ≠ numbered option
- #9 progress = actual step
- Golden Case: N/A real-estate (admin only)

---

## IMPLEMENTER HANDOFF (P1a first Mission)

### Goal

Implement `selectRealEstatePhase2MissingInfo` + PRE-branch questions + Phase 2 UI question rendering. POST/DOCUMENT/UNCLEAR stubs return early in selector until P1b.

### Acceptance criteria

- [ ] Phase 2 shows adaptive PRE questions below P0 carry-over banner
- [ ] FREE questions never visible in Phase 2
- [ ] Each question traceable to Profile gap (comment metadata in code)
- [ ] `attachRealEstateProfileSnapshot` updates profile after Phase 2 answers
- [ ] Phase 2 completion shows interim summary (not personalized panel)
- [ ] FREE E2E + P0 verify + admin/trc smoke PASS
- [ ] `npx tsc --noEmit` PASS

### Architect Recommendation

```
Risk: HIGH
Ready for Ace approval: YES (P1a scope)
Next agent: IMPLEMENTER (P1a only after Ace approves this Brief)
VERIFIER: after P1a IMPLEMENTER
Product code: NOT MODIFIED (this document only)
```

---

## Appendix: Admin Phase 2 pattern reference

| Admin | Real-estate P1 equivalent |
|-------|---------------------------|
| `adminVerifyProfilePhase` | `realEstateVerifyProfilePhase` ✅ P0 |
| `buildAdminVerifyProfileQuestions(..., phase)` | `buildRealEstatePhase2ProfileQuestions` |
| `adminVerifyPhase2OnlyQuestions` | filter Phase 2 IDs only |
| `appendCaseXXPhase2Questions` | path branches in selector |
| `caseXXNeeds*Phase2` predicates | `needs*Phase2(profile, answers)` |
| `isAdminVerifyPhase2Review` | `isRealEstatePhase2Review` ✅ P0 |
| Personalized result | P1+ |

---

*Document: `.cursor/briefs/VERIFY-REAL-ESTATE-PAID-PHASE2-P1-MISSION-BRIEF.md`*
