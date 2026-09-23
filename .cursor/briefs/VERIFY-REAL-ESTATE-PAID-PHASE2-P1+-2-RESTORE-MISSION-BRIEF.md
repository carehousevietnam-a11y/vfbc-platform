# VERIFY Real Estate PAID Phase 2 — P1+-2 Restore Mission Brief

> **Agent**: ARCHITECT only  
> **Risk**: HIGH (CRM meta persistence + restore state machine + FREE regression)  
> **Prerequisite**: P0 · P1a · P1b · P1c PASS · **P1+-1 Personalized Result Product Closure PASS**  
> **Status**: 설계 완료 — IMPLEMENTER/VERIFIER 미실행 · 제품 코드 미변경  
> **Parent**: `.cursor/briefs/VERIFY-REAL-ESTATE-PAID-PHASE2-PERSONALIZED-RESULT-MISSION-BRIEF.md`  
> **Frozen baseline**: P1+-1 gate · builder · panel (VERIFIER Product Closure PASS)

---

## Executive Summary

P1+-2는 Phase 2 진행 중 이탈한 사용자가 `?restore=1` 또는 Landing 복원 흐름으로 재진입했을 때, **Phase 2 현재 상태**와 **Personalized Result**까지 정확히 복원하는 Mission이다.

**현재 gap**: CRM `verify_lead` meta는 **signup 시점 FREE profile만** 저장한다. `re2_*` Phase 2 answers · `realEstateVerifyProfilePhase` · Phase 2 mid-progress는 **세션 전용**이라 restore 시 Phase 1 ONE RESULT만 복원된다.

**설계 결론**: DB schema migration **불필요**. 기존 `crm_activities.meta` jsonb에 **신규 meta key 2~3개**를 추가하고, Phase 2 진행 중 **동일 verify_lead row meta merge update**로 persist → restore 시 merge한다.

**Human Boundary (Ace 승인 필수)**: CRM meta key 추가 + client-side `crm_activities` update 권한(RLS) 검증. schema migration은 요청하지 않음.

---

## 1. 현재 Restore 구조 (조사 결과)

### 1.1 진입·복원 파이프라인

| Layer | File | Behavior |
|-------|------|----------|
| Entry | `src/lib/restoreVerifyLead.ts` | `loadVerifyMemberEntryState(serviceType, { allowRestore })` — loggedIn + `?restore=1` 시 `restoreLatestVerifyLead` |
| Lead pick | `restoreLatestVerifyLead` | `/api/mypage-data` → 해당 `service_type` 최신 lead → `crm_activities` (`action=verify_lead`, latest) `meta` |
| Page apply | `src/app/verify/real-estate/page.tsx` `applyRestoredVerify()` | page1 meta · legacy fields · `restoreRealEstateProfilingAnswersFromMeta` · evidence meta · `setRealEstateMasterSignupComplete(true)` |
| Seed | `MasterReviewQuotationReport.tsx` | `verifyMasterSeedAnswers._realEstateProfilingComplete === "1"` → answers seed + `setRealEstateEvidenceDone(true)` |
| QA | `tests/qa/real-estate-restore-e2e.spec.ts` | FREE ONE RESULT only (PRE desktop · UNCLEAR mobile 375) |

### 1.2 Constitution 정책 (`docs/VFBCAI_CONSTITUTION.md` §5)

- `?restore=1`: 기존 Case 있으면 복원, 없으면 신규
- EXISTING CASE / restore: **질문·Signup·Documents 재요구 금지**
- RESULT CTA: 복원 Case → `/mypage` (본 Mission은 result screen 복원 범위)

### 1.3 CRM meta write (signup 시점만)

`buildRealEstateVerifyPageMeta()` → 저장 키:

- `real_estate_situation_profile_json` — `buildRealEstateSituationProfile(answers)` snapshot
- `real_estate_resolution_path`
- `review_stage` · `review_focus` · `incident_*` · page1 keys
- `storagePath` · `file_name` · `submitted_document` (evidence)

**저장되지 않음**:

- Raw `re_*` / `re2_*` answer keys
- `real_estate_verify_profile_phase`
- `_realEstatePhase2Complete` (session snapshot only)

### 1.4 CRM meta restore (FREE round-trip)

`restoreRealEstateProfilingAnswersFromMeta()`:

- `real_estate_situation_profile_json` → profile field labels → **FREE `re_*` keys** reverse mapping
- Evidence: `storagePath` / `file_name` → `_realEstateEvidenceAttached` · `_realEstateEvidenceFileName`
- `attachRealEstateProfileSnapshot()` → session flags 재계산
- **`re2_*` 복원 없음** · **phase 복원 없음**

### 1.5 UI state (restore 후)

| State | Restore today | Location |
|-------|---------------|----------|
| `realEstateMasterSignupComplete` | `true` (page) | `page.tsx` |
| `realEstateVerifyProfilePhase` | **always `1`** (default) | `MasterReviewQuotationReport.tsx` |
| `answers` (FREE) | profile JSON round-trip | Master seed effect |
| `answers` (`re2_*`) | **empty** | — |
| `realEstateEvidenceDone` | `true` if restored profile | Master seed effect |
| `realEstateEvidenceFile` | **null** (blob 미복원) | — |
| Personalized gate | **false** | phase=1 + no re2 |

### 1.6 Admin reference (비목표)

Admin VERIFY도 `case_resolution_json` profile restore만 있고 **`adminVerifyProfilePhase` Phase 2 restore 없음**. Real-estate는 admin 패턴 copy가 아니라 **domain-specific Phase 2 persist**가 필요.

---

## 2. Phase 2에서 저장/복원되어야 하는 것

### 2.1 Persist 대상 (CRM meta jsonb keys — schema 변경 없음)

| Meta key (신규) | Type | When write | Restore use |
|-----------------|------|------------|-------------|
| `real_estate_verify_profile_phase` | `"1"` \| `"2"` | Phase 2 CTA 클릭 · Phase 2 answer 변경 · complete | `setRealEstateVerifyProfilePhase` |
| `real_estate_phase2_answers_json` | JSON string | Phase 2 answer 변경 (debounced) · complete | merge into `answers` (`re2_*` + detail keys only) |
| `real_estate_situation_profile_json` | existing | Phase 2 progress 시 **re-merge update** | FREE restore (existing) + enriched profile |
| `real_estate_resolution_path` | existing | Phase 2 progress update | existing |

**Optional (진단용, non-blocking)**:

| Meta key | Value |
|----------|-------|
| `real_estate_phase2_complete` | `"1"` when `isRealEstatePhase2Complete` |

### 2.2 `real_estate_phase2_answers_json` payload

Whitelist **only** keys starting with `re2_` from `ReviewAnswers`:

```
re2_registrationConcern, re2_clauseFocus, re2_moneySituation,
re2_registrationDetail, re2_moneyDetail, re2_clauseDetail,
re2_moneyRecovery, re2_breachFocus, re2_formalResponse,
re2_timelineStage, re2_authorityStage, re2_docReliability,
re2_translationIssue, re2_conflictFocus, re2_conflictDetail,
re2_timelineDetail, re2_unclearFactLock, re2_unclearMoneyIssue,
re2_unclearDocAnchor, re2_unclearPartyFocus, re2_unclearTimelineFocus
```

**금지**: FREE `re_*` keys를 phase2 JSON에 중복 저장 (FREE는 profile JSON round-trip 유지).

### 2.3 Session-only (meta 불필요, restore 시 recompute)

- `_realEstateProfilingComplete` · `_realEstatePhase2Complete` · `_realEstatePhase2NextMissing`
- `_realEstateRestoredProfilePhase` (restore seed hint — answers or seed object only, CRM 미저장)

### 2.4 Evidence / storage

| Item | Persist | Restore |
|------|---------|---------|
| `storagePath` · `file_name` | signup 시 저장 (existing) | existing path |
| File blob | Storage (existing) | **재다운로드 금지** (constitution Documents 재요구 금지) |
| Display name | `file_name` in meta | `_realEstateEvidenceFileName` + `buildRealEstate*Result(..., fileName)` existing pattern |
| `realEstateEvidenceDone` | N/A | `true` on restored profile (existing) |

### 2.5 Signup state

Restore Case → `realEstateVerifySignupComplete=true` · signup form 숨김 (existing, 유지).

---

## 3. 필요한 Profile / Phase / Answer 상태

### 3.1 Restore 시나리오별 목표 UI

| Scenario | Meta condition | Target screen |
|----------|----------------|---------------|
| R1 FREE only (regression) | no `real_estate_verify_profile_phase=2` | Phase 1 ONE RESULT (unchanged) |
| R2 Phase 2 entered, 0 answers | phase=2, empty phase2 JSON | Phase 2 Gate / first Phase 2 Q |
| R3 Phase 2 mid-progress | phase=2, partial re2 JSON | Resume at first incomplete Phase 2 Q |
| R4 Phase 2 complete | phase=2, complete re2 + `isRealEstatePhase2Complete` | **Personalized Result** |
| R5 Phase 1 + restore then user clicks 2차 | R1 → local phase=2 (no meta yet until persist) | Out of restore scope (fresh session action) |

### 3.2 Answer merge order (restore)

```
1. restoreRealEstateProfilingAnswersFromMeta(meta)     → FREE re_* + evidence flags
2. mergeRealEstatePhase2AnswersFromMeta(meta, answers) → re2_* overlay (NEW helper)
3. attachRealEstateProfileSnapshot(merged)             → session flags
4. Master seed effect                                  → setAnswers + evidenceDone
5. if restored phase === 2                             → setRealEstateVerifyProfilePhase(2)
```

### 3.3 Phase inference rules

Primary: `meta.real_estate_verify_profile_phase === "2"`  
Fallback (backward compat): `real_estate_phase2_answers_json` non-empty → phase 2  
Default: phase 1 (FREE restore preserved)

---

## 4. Personalized Result 복원 조건

Existing gate (**P1+-1 FROZEN — 변경 금지**):

```typescript
isRealEstatePersonalizedResult =
  isRealEstateVerifyMasterLayout &&
  realEstateVerifySignupComplete &&
  realEstateVerifyProfilePhase === 2 &&
  isRealEstatePhase2Complete(answers);
```

Restore success requires **all four** after meta merge:

1. `realEstateVerifySignupComplete` — page `applyRestoredVerify` (existing)
2. `realEstateVerifyProfilePhase === 2` — **NEW** from meta
3. `isRealEstatePhase2Complete(answers)` — requires **raw `re2_*` keys**, profile JSON alone insufficient
4. `buildRealEstatePersonalizedResult(answers, fileName)` — existing builder, **no semantic change**

**NOT acceptable**: profile-only reverse mapping to fake `re2_*` (lossy · selector/bridge 위험 · P1c FROZEN).

---

## 5. CRM meta 영향

### 5.1 충분성 판단

| Question | Answer |
|----------|--------|
| 기존 jsonb meta로 Phase 2 persist 가능? | **Yes** — new keys in same `verify_lead.meta` |
| DB migration 필요? | **No** |
| API route 필요? | **Prefer no** — mirror signup `crm_activities.update` merge pattern |
| RLS/client update 가능? | **NOT VERIFIED** — IMPLEMENTER must test; fail → Human Boundary |

### 5.2 Persist trigger (IMPLEMENTER)

| Event | Action |
|-------|--------|
| User clicks "2차 개인화" (`setRealEstateVerifyProfilePhase(2)`) | persist phase=2 + current re2 (empty ok) |
| Phase 2 answer change | debounced persist phase2 JSON + refreshed profile JSON |
| Phase 2 complete | persist complete flag + final JSON |
| FREE Phase 1 only | **no new keys** (regression) |

**Wiring**: `page.tsx` owns `leadId` → pass `realEstateVerifyLeadId` + `onRealEstateVerifyMetaPersist` callback to Master gate (mirror `onAdminVerifyPhase2Complete` pattern, but **update not insert**).

**Helper (new)**: `persistRealEstateVerifyLeadMeta(leadId, partialMeta)` in `restoreVerifyLead.ts` or `realEstateVerifyProfiling.ts`:

- fetch latest `crm_activities.id` for `lead_id` + `verify_lead`
- merge `{ ...existingMeta, ...partialMeta }`
- update row

### 5.3 Ace 승인 사항 (구현 전)

1. 신규 CRM meta key 이름 확정 (위 표)
2. Client-side `crm_activities.meta` update 허용 여부 (RLS)
3. Persist debounce interval (권장 800ms, max 1 write/sec)

---

## 6. DB / API 변경 필요 여부

| Area | Required? | Notes |
|------|-----------|-------|
| Supabase table schema | **No** | jsonb key extension only |
| RLS policies | **Maybe** | If member cannot update own verify_lead meta → Ace approval for policy or API |
| New API route | **Avoid** | Only if RLS blocks client update |
| `/api/mypage-data` | **No** | restore reads existing verify_lead meta |
| `/api/lead-submit` | **No** | |
| Storage bucket | **No** | existing `documents` path |
| Personalized builder | **No** | |
| P0/P1a/P1b/P1c selectors | **No** | FROZEN |

---

## 7. 변경 파일 후보 (IMPLEMENTER)

| File | Change |
|------|--------|
| `src/lib/realEstateVerifyProfiling.ts` | Meta key constants · `extractRealEstatePhase2Answers()` · `mergeRealEstatePhase2AnswersFromMeta()` · extend `buildRealEstateVerifyPageMeta` optional phase2 merge · **NO selector/bridge change** |
| `src/lib/restoreVerifyLead.ts` | `persistRealEstateVerifyLeadMeta()` · optional `parseRealEstateRestoredProfilePhase()` |
| `src/app/verify/real-estate/page.tsx` | `handleRealEstateVerifyMetaPersist` · wire gate props · restore phase hint in `verifyMasterSeedAnswers` |
| `src/components/cost-check/MasterReviewQuotationReport.tsx` | Restore `setRealEstateVerifyProfilePhase(2)` · persist callbacks on phase transition + Phase 2 answer changes · **minimal** Personalized gate touch |
| `src/components/cost-check/MasterFunnelLanding.tsx` | Pass-through new gate props (if needed) |
| `tests/qa/real-estate-restore-e2e.spec.ts` | Extend: Phase 2 mid + Personalized restore cases |
| `tests/qa/pilot-real-estate-phase2-restore.mjs` | **NEW** harness (optional, post-approval) |

**Explicitly forbidden**:

- `realEstateVerifyPersonalizedResult.ts` semantic change
- `buildRealEstateFirstResult.ts` change
- P1c selector / bridge / `selectRealEstatePhase2MissingInfo` change
- FREE restore behavior change for meta without phase2 keys

---

## 8. QA 시나리오 (VERIFIER)

### 8.1 Regression (must PASS)

| ID | Scenario |
|----|----------|
| RR-1 | Existing `real-estate-restore-e2e` PRE desktop ONE RESULT |
| RR-2 | Existing UNCLEAR mobile 375 ONE RESULT |
| RR-3 | P1+-1 personalized harness still PASS |
| RR-4 | P0/P1a/P1b/P1c harness PASS |

### 8.2 Phase 2 restore (NEW)

| ID | Setup | Restore assert |
|----|-------|----------------|
| PR-1 | PRE → signup → ONE RESULT → 2차 → answer 1 Phase 2 Q → leave | `?restore=1` → Phase 2 Q flow resumes (not ONE RESULT) |
| PR-2 | POST → complete Phase 2 → Personalized visible → leave | `?restore=1` → Personalized Result panel (not Phase 2 Q, not ONE RESULT) |
| PR-3 | DOCUMENT path mid-progress | Resume at correct incomplete Q |
| PR-4 | UNCLEAR bridge mid-progress | Resume bridge/chain state |
| PR-5 | Evidence with file at signup | Restored Personalized shows file name; no re-upload prompt |
| PR-6 | Mobile 375 | PR-2 or PR-1 at 375px, no horizontal overflow |

### 8.3 Negative

| ID | Assert |
|----|--------|
| NG-1 | No signup form on restore |
| NG-2 | FREE profiling questions not re-asked |
| NG-3 | Phase 1 meta-only lead does not show Personalized |

### 8.4 Commands

```
npx tsc --noEmit
npx playwright test tests/qa/real-estate-restore-e2e.spec.ts
# + existing phase2 personalized harness
```

---

## 9. Mission 범위 / 비범위

### 9.1 In scope

- Phase 2 progress persist to existing CRM meta
- Restore Phase 2 mid-progress + Personalized Result
- FREE ONE RESULT restore regression preservation
- Evidence meta/display name restore (existing storage path)
- QA harness extension

### 9.2 Out of scope

- Payment gate before Phase 2
- Multi-document / OCR
- Deep AI Report backend
- Admin VERIFY Phase 2 restore
- File blob re-download to `File` object
- CRM schema migration
- P0/P1a/P1b/P1c selector·bridge changes
- Personalized Result copy/builder semantics change
- commit / push / deploy (unless Ace instructs)

---

## 10. IMPLEMENTER 실행 지침

### 10.1 Sub-steps (권장)

```
PR-1: Meta constants + extract/merge helpers + persistRealEstateVerifyLeadMeta (unit-safe)
PR-2: page.tsx persist handler + leadId wiring
PR-3: MasterReviewQuotationReport restore phase + persist hooks
PR-4: extend restoreRealEstateProfilingAnswersFromMeta merge path
PR-5: QA harness + tsc + regression matrix
```

### 10.2 Self-Healing boundaries

- RLS update fails → **stop**, report Ace (Human Boundary)
- FREE restore regression → fix before Phase 2 cases
- Do not patch by weakening `isRealEstatePhase2Complete`

### 10.3 VERIFIER handoff

Formal browser QA on PR-1..PR-6 matrix. **No False Completion** — mid-progress restore must show evidence of resumed Q index.

### 10.4 착수 조건

1. **Ace explicit approval** of this Brief + CRM meta keys  
2. P1+-1 VERIFIER Product Closure PASS (current: satisfied)  
3. IMPLEMENTER scope = **P1+-2 only**  
4. No parallel P1c / Personalized edits  

---

## Appendix A — Gap diagram

```
[Today]
Signup → CRM meta (FREE profile only)
Phase 2 answers → session only
?restore=1 → FREE ONE RESULT (phase=1)

[Target]
Signup → CRM meta (FREE)
Phase 2 progress → CRM meta merge update (re2 JSON + phase + profile refresh)
?restore=1 → phase 1 ONE RESULT | phase 2 Q resume | Personalized Result
```

## Appendix B — Meta key constants (proposed)

```typescript
export const REAL_ESTATE_VERIFY_PROFILE_PHASE_META_KEY = "real_estate_verify_profile_phase";
export const REAL_ESTATE_PHASE2_ANSWERS_META_JSON_KEY = "real_estate_phase2_answers_json";
export const REAL_ESTATE_PHASE2_COMPLETE_META_KEY = "real_estate_phase2_complete"; // optional
```

---

**Architect sign-off**: 설계 완료. IMPLEMENTER 착수 전 Ace CRM meta 승인 필요.
