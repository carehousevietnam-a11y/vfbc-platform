# VERIFY Admin (행정문서) Product Closure — P0 Mission Brief

> **Agent**: ARCHITECT only  
> **Risk**: MEDIUM (QA harness + 최소 gap fix · Master VERIFY 기준선 확정)  
> **Status**: 설계 완료 — IMPLEMENTER/VERIFIER 미실행 · 제품 코드 미변경  
> **Parent**: VERIFY 전체 완성 로드맵 — Master Stitch 1번 서비스 기준선  
> **Frozen baseline**: `/verify/real-estate` P1+-1 Personalized · P1+-2 HOLD(RLS) · 관리자 페이지 구조

---

## Goal (1 sentence)

`/verify/admin` Master VERIFY 흐름(FREE ONE RESULT → Phase 2 → Personalized Result)을 **실제 코드·브라우저 QA 기준으로 Product Closure**하고, 이후 legacy VERIFY·부동산 P1+-2·Phase 2 Restore 설계의 **검증된 reference baseline**을 확정한다.

---

## Engine / Service / CASE

| Item | Value |
|------|-------|
| Engine | VERIFY (직접 검토하기) |
| Route | `/verify/admin` |
| CRM `service_type` | `verify_admin` |
| Landing | `MASTER_LANDING_ADMIN` (`costServiceId: "admin"`) |
| Architecture | Master Stitch (`SHOW_LEGACY_VERIFY_FUNNEL = false`) |
| CASE scope (P0 harness) | **CASE_01** · **CASE_02** · **CASE_06** (대표 3경로) |

---

## Risk: MEDIUM

- `adminVerifyProfiling.ts` (~8.7k lines) · `MasterReviewQuotationReport.tsx` gate coupling — **회귀 주의**
- Phase 2 Restore / meta persist **본 Mission 범위 밖** (RLS Human Boundary)
- IMPLEMENTER는 harness가 찾은 **blocking defect만** 최소 수정

---

## Scope Lock

### In scope

1. **조사 확인 (이미 코드 존재)** — 아래 gate chain이 fresh session에서 동작하는지 harness로 검증
   - Entry Q1 (`adminCaseDocumentKind`) → CASE 분기
   - Phase 1 adaptive questions → Evidence → Signup/member skip
   - **ONE RESULT** (`buildAdminVerifyFirstResult` · `isAdminVerifyFirstResult`)
   - Phase 2 adaptive questions → Evidence → **Personalized Result** (`buildAdminVerifyPersonalizedResult` · `isAdminVerifyPersonalizedResult`)
   - Expert/AI CTA wiring (`onAdminVerifyPersonalizedContinue` → `handleAiReportRequest`)
2. **FREE restore (`?restore=1`)** — CASE_01 ONE RESULT 복원 (read-only meta · `case_resolution_json`)
3. **QA harness 추가** — real-estate 패턴 준수 (`tests/qa/pilot-*.mjs` + Playwright where appropriate)
4. **Blocking bug fix only** — harness FAIL 원인이 제품 gate/builder 오류일 때 Mission 범위 내 최소 수정
5. **`npx tsc --noEmit`** · `/verify/admin` · `/check/trc` smoke regression

### Out of scope

- **P1+-2 Real-estate Restore** · RLS · `crm_activities.meta` client UPDATE 정책
- **Admin Phase 2 mid-progress persist / Phase 2 restore** (Ace RLS 승인 후 별도 Mission)
- **`/verify/real-estate/**` 수정** (P1+-1 frozen · P1+-2 HOLD 코드 유지)
- **Legacy VERIFY** (`fraud` · `tax` · `unclear`) Master migration
- **관리자(/verify/admin 백오피스 아님 — CRM admin UI)** · DB schema · RLS · Auth
- **`adminVerifyProfiling.ts` 대규모 리팩터** · CASE 추가/문구 변경
- commit / push / deploy

### Files (예상)

| Action | Path |
|--------|------|
| Read/reference | `src/app/verify/admin/page.tsx` |
| Read/reference | `src/lib/adminVerifyProfiling.ts` |
| Read/reference | `src/components/cost-check/MasterReviewQuotationReport.tsx` (admin gates only) |
| Read/reference | `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` |
| **Add** | `tests/qa/pilot-admin-verify-p0-closure.mjs` (또는 동등 harness) |
| **Add/extend** | `tests/qa/admin-verify-free-e2e.spec.ts` (CASE_01·02·06 + restore) |
| Fix (if blocked) | 위 reference 파일 중 harness FAIL 지점만 |

---

## Design

### UX/UI (frozen — 변경 금지 unless blocking bug)

Master Stitch layout (`isAdminVerifyStitchLayout`):

```
MasterFunnelLanding (3-tab)
  → MasterReviewQuotationReport
      Phase 1: Entry Q1 + CASE adaptive Q + Evidence
      → Signup slot (guest) / member skip
      → ONE RESULT (AdminVerifyFirstResultPanel)
      → CTA "2차 개인화 검토" → adminVerifyProfilePhase = 2
      Phase 2: case-specific Phase2 Q + Evidence
      → Personalized Result
      → AI Report / Expert handoff
```

Legacy 4-step funnel (`step: incident|form|diagnosis|...`) — **코드 보존 · inactive** (`SHOW_LEGACY_VERIFY_FUNNEL = false`).

### Questions / Profile (reference — 재설계 금지)

| Layer | Source | Notes |
|-------|--------|-------|
| Entry Q1 | `ADMIN_CASE_ENTRY_Q1_KEY` → CASE_01~06 | `getQ1ResolvedCase()` |
| Phase 1 | `buildAdminVerifyProfileQuestions()` | per-CASE adaptive |
| Phase 2 | `appendCase0xPhase2Questions()` | CASE별 Phase2 only Q |
| Situation Profile | `buildCaseResolutionProfile()` | internal · customer-facing 재질문 금지 |
| ONE RESULT | `buildAdminVerifyFirstResult()` | rule-based |
| Personalized | `buildAdminVerifyPersonalizedResult()` | Phase2 evidence filename context |

**Gate reference** (`MasterReviewQuotationReport.tsx`):

```typescript
isAdminVerifyFirstResult =
  isAdminVerifyStitchLayout &&
  adminVerifyPhase1Complete &&
  adminVerifyProfilePhase === 1 &&
  !adminVerifyPhase2QuestionsComplete &&
  !isAdminVerifyAwaitingSignup &&
  !isAdminVerifyAwaitingEvidence;

isAdminVerifyPersonalizedResult =
  isAdminVerifyStitchLayout &&
  isClassifiedAdminVerifyCase &&
  adminVerifyPhase2QuestionsComplete &&
  (adminVerifySkipSignup || adminVerifySignupComplete);
```

### Evidence

- Phase 1/2: `AdminVerifyPhase2EvidencePanel` — optional 1 file
- Signup 시 `buildAdminVerifyPageMeta()` → `case_resolution_json` + optional `submitted_document`
- Restore: `restoreAdminCaseResolutionProfile(meta)` — profile round-trip · **phase=1 default**

### Signup / Restore

| Flow | Implementation | P0 verify |
|------|----------------|-----------|
| Guest signup | lead-submit → `verify_lead` insert | CASE_01 fresh path |
| Member skip | `loadVerifyMemberEntryState` · `insertMemberVerifyLead` | optional smoke |
| FREE restore | `?restore=1` → `applyRestoredVerify` · profile JSON | CASE_01 ONE RESULT |
| Phase 2 restore | **NOT implemented** | **NOT VERIFIED — out of scope** |

### Re-entry impact

- `?start=check` — legacy only (`SHOW_LEGACY=false` → no-op for master path)
- `?restore=1` — FREE profile restore must **NOT regress** (Constitution §5 EXISTING CASE)
- Restored case: signup 재요구 금지 · ONE RESULT 표시 · Phase 2는 신규 CTA로만 진입(현행)

---

## P0 Harness Matrix (IMPLEMENTER minimum)

| ID | CASE | Path | Desktop | Mobile 375 | Assert |
|----|------|------|---------|------------|--------|
| A-P0-01 | CASE_01 | violation_notice fresh → Phase1 ONE RESULT | ✅ | ✅ | ONE RESULT headings · no re-ask Entry Q1 |
| A-P0-02 | CASE_01 | continue → Phase2 → Personalized | ✅ | spot | Personalized panel · Phase2 carry-over lines |
| A-P0-03 | CASE_02 | payment_demand fresh → ONE RESULT | ✅ | ✅ | CASE_02 specific result copy |
| A-P0-04 | CASE_06 | unclear → reclassify path → ONE RESULT | ✅ | ✅ | CASE_06 or reclassified result |
| A-P0-R1 | CASE_01 | signup → `?restore=1` ONE RESULT | ✅ | ✅ | signup skip · no Entry Q1 · ONE RESULT visible |
| A-SMOKE | — | `/verify/admin` first Q load | ✅ | — | existing smoke preserved |
| R-TRC | — | `/check/trc` landing | ✅ | — | no regression |

Harness answer selection: **`adminVerifyProfiling.ts` option values**만 사용 — 임의 문구·不存在 key 금지.

---

## Done Criteria

1. P0 harness matrix **전 항목 PASS** (또는 Human Boundary BLOCKED 명시)
2. `npx tsc --noEmit` **PASS**
3. `/verify/real-estate` 기존 harness **회귀 PASS** (수정 없으면 re-run only)
4. Blocking defect 발견 시 **최소 fix + re-run PASS**
5. Phase 2 restore · RLS · legacy migration **미착수 유지**

---

## Regression Targets

| Target | Requirement |
|--------|-------------|
| `/check/trc` | landing smoke PASS |
| `/verify/real-estate` | 기존 P0/P1/P1+-1 harness PASS (코드 변경 시) |
| `/verify/admin` | P0 matrix PASS |
| Master TRC UI | untouched |

---

## Stop Conditions (Human Boundary)

즉시 중단 · Ace 보고:

- RLS / DB / Auth 변경 필요
- `adminVerifyProfiling.ts` CASE 구조 변경 필요
- Phase 2 restore persist 설계 착수 요구 (별도 Mission)
- Self-Healing 3회 실패
- Constitution §5 re-entry 정책 충돌

---

## P1+-2 RLS HOLD — 본 Mission과의 관계

| 영향 | 설명 |
|------|------|
| **차단 없음** | Fresh session Product Closure · FREE read-only restore |
| **차단 있음** | Phase 2 mid-progress persist · Personalized restore (별도 Mission · Ace RLS 후) |
| **공통 패턴** | Admin Phase 2 restore는 real-estate P1+-2와 **동일 RLS blocker** 예상 — 본 Mission에서 착수 금지 |

---

## CHECK / REGISTER / PROTECT 경계

- VERIFY admin은 `engine: "verify"` · `verifyDiagnosis.ts` legacy diagnosis **Master path 미사용**
- CHECK (`/check/*`) · REGISTER (`/register/*`) 코드 **수정 금지**
- `MasterReviewQuotationReport` 공유 컴포넌트 — admin gate 분기만 touch (real-estate gate 회귀 금지)
- `restoreVerifyLead.ts` — read-only restore 경로만 사용 · persist API 추가 금지

---

## Architect Recommendation

**Risk**: MEDIUM  
**Ready for Ace approval**: YES  
**Next agent**: IMPLEMENTER (after Ace approval) → VERIFIER

**Rationale**: Admin은 코드상 Master VERIFY reference이나 **formal Product Closure QA가 없음**(smoke: first question only). Real-estate PASS series는 admin 패턴을 따랐으므로, admin baseline 확정이 legacy 3서비스 migration 및 P1+-2 unblock 이후 작업의 선행 조건이다.
