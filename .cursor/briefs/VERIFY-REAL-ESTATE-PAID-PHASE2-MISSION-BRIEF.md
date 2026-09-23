# VFBCAI VERIFY Real Estate PAID Phase 2 — Mission Brief

> **Agent**: ARCHITECT only · **Risk**: HIGH (신규 Phase 2 + Profile 확장 + Result UI + /documents 연동)  
> **Status**: 설계 완료 — IMPLEMENTER/VERIFIER 미실행 · 제품 코드 미변경  
> **Baseline**: FREE 4-path E2E PASS · Restore PASS · `/verify/admin` · `/check/trc` regression PASS

---

## 1. Current FREE Architecture

### Active path
- `SHOW_LEGACY_VERIFY_FUNNEL = false` → Master Funnel only (`MasterFunnelLanding` → `MasterReviewQuotationReport`)
- Legacy 4-step incident funnel preserved in `page.tsx` but inactive

### FREE flow (confirmed in code)
```
Entry Q1 → path-specific questions (adaptive via selectRealEstateMissingInfo)
  → AdminVerifyPhase2EvidencePanel (optional 1 file)
  → Signup (guest) / submitAsMember (member skip)
  → buildRealEstateFirstResult → AdminVerifyFirstResultPanel (domain="real-estate")
  → CTA: AI Report / Expert → /documents?mode=ai_report|expert
```

### Key files
| Layer | File |
|-------|------|
| Profiling | `src/lib/realEstateVerifyProfiling.ts` |
| ONE RESULT | `src/lib/realEstateVerifyFirstResult.ts` |
| UI gates | `src/components/cost-check/MasterReviewQuotationReport.tsx` |
| Landing | `src/components/cost-check/MasterFunnelLanding.tsx` (`MASTER_LANDING_REAL_ESTATE`) |
| Page | `src/app/verify/real-estate/page.tsx` |
| Result panel | `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` |

### FREE answer keys (10 + internal)
`realEstateSituationEntry`, `re_preStage`, `re_disputeSubject`, `re_docSubject`, `re_propertyType`, `re_counterparty`, `re_goal`, `re_docsMatch`, `re_situationGap`, `realEstateCustomerInput`  
Internal: `_realEstateEvidenceAttached`, `_realEstateEvidenceFileName`, `_realEstateProfilingComplete`

### CRM meta (on `verify_lead`)
`real_estate_situation_profile_json`, `real_estate_resolution_path`, legacy `review_stage`/`incident_*`, optional `submitted_document` (single file → `documents` bucket `verify-real-estate/{leadId}.{ext}`)

---

## 2. Reusable MASTER Components

| Component | Admin VERIFY (reference) | Real-estate FREE (today) | PAID reuse |
|-----------|-------------------------|--------------------------|------------|
| `ProfileQuestion` type | ✅ `adminVerifyProfiling.ts` | ✅ same type imported | Extend with Phase 2 IDs |
| Phase split | `AdminVerifyProfilePhase 1\|2` | ❌ single phase | **Add `RealEstateVerifyProfilePhase`** |
| Missing-info selector | per-case Phase 1/2 | `selectRealEstateMissingInfo` | **Add `selectRealEstatePhase2MissingInfo`** |
| Gate chain | `isAdminVerifyFirstResult` → Phase2 Q → evidence → signup → personalized | profiling → evidence → signup → first result | **Mirror admin gate flags** |
| Evidence panel | `AdminVerifyPhase2EvidencePanel` (1 file) | same panel after FREE questions | Phase 2: **multi-file bridge** then `/documents` |
| Result builder | `buildAdminVerifyFirstResult` + `buildAdminVerifyPersonalizedResult` | `buildRealEstateFirstResult` only | **Add `buildRealEstatePersonalizedResult`** |
| Result UI | `AdminVerifyFirstResultPanel` `variant="personalized"` | `domain="real-estate"` first only | **Reuse panel + new variant data** |
| Gate props | `AdminVerifyMasterGateProps` | `RealEstateVerifyMasterGateProps` | **Extend with Phase2 callbacks** |
| Multi-doc upload | `/documents/page.tsx` | handoff only | **Primary PAID doc layer** |
| AI Report | `recordAiReportRequestAndNotify` → `/documents` | same | Deep AI Report terminus |
| 자세히 보기 | `MasterServiceGuidePanel` + `REAL_ESTATE_GUIDE_SLUG` | tab `direct` | Profile-linked SERVICE layer |
| Restore | `restoreRealEstateProfilingAnswersFromMeta` | ✅ 4 paths QA | Extend for Phase 2 meta |

**Admin pattern to copy (not copy-paste code):** `admin/page.tsx` gate wiring + `MasterReviewQuotationReport` phase state machine.

---

## 3. Current Situation Profile

### Schema (`RealEstateSituationProfile`)
15 fields + `resolutionPath` + `customerInput`. Each field: `{ value, status, source }`.

| Field | FREE population (actual) | Typical status after FREE |
|-------|-------------------------|---------------------------|
| `property` | `re_propertyType` or inferred | confirmed/inferred |
| `transaction` | entry path label | confirmed |
| `contractStage` | `re_preStage` (PRE) | confirmed/unknown |
| `parties` | `re_counterparty` | confirmed/unknown |
| `claims` | dispute/doc/pre label | confirmed |
| `facts` | `re_situationGap` or docsMatch | confirmed/unknown |
| `documents` | docsMatch or docSubject | confirmed/unknown |
| `money` | **inferred only** if deposit path | mostly **unknown** |
| `dates` | **only** `deadline_dispute` gap | mostly **unknown** |
| `actions` | goal label | confirmed |
| `responses` | POST goal only | partial |
| `rights` | ownership dispute only | partial |
| `evidence` | 1-file flag only | partial |
| `risk` | mismatch/dispute candidate | candidate/confirmed |
| `goal` | `re_goal` | confirmed |
| `resolutionPath` | entry/inference | confirmed |
| `customerInput` | text | optional |

**Gap:** FREE captures judgment core, not precision facts (amounts, dates, multi-evidence, formal procedure status, registration verification).

---

## 4. FREE → PAID Handoff Map

| FREE에서 이미 아는 정보 | PAID에서 다시 묻지 않는 정보 |
|------------------------|------------------------------|
| Entry path (PRE/POST/DOC/UNCLEAR) | Entry Q1, path re-selection |
| `re_preStage` | "어느 시점인가" (same stage) |
| `re_disputeSubject` | dispute category |
| `re_docSubject` | document type received |
| `re_propertyType` (confirmed) | property type question |
| `re_counterparty` | counterparty question |
| `re_goal` (PRE or POST goal set) | same goal list |
| `re_docsMatch` = match | "일치 여부" re-ask |
| `re_situationGap` (when answered) | same gap category |
| `realEstateCustomerInput` (≥20 chars UNCLEAR) | full re-narration |
| FREE 1-file evidence filename | re-upload same file if already in meta |

| 부족한 정보 | PAID에서 확인할 방법 |
|------------|---------------------|
| `money` unknown | Phase 2 choice + optional direct input (amount band) |
| `dates` unknown | Phase 2 timeline questions |
| `evidence` partial (1 file) | Multi-doc upload (`/documents` + bridge) |
| `rights` partial | Registration/ownership verification questions |
| `responses` partial (POST) | Formal response / authority status |
| Document content details | Upload + relationship analysis (not more abstract Q) |
| Contradiction specifics | Follow-up from FREE `mismatch` + doc upload |
| Risk precision | Derived from Phase 2 answers, not re-ask FREE risk |

| 문서로 확인 가능한 정보 | 질문 대신 문서로 확인 |
|------------------------|----------------------|
| Contract amounts, parties, dates | 계약서 upload → extract/compare |
| Registration status | 등기부등본 upload |
| Payment proof | 송금증/영수증 upload |
| Communication promises | 메시지 캡처 upload |
| Translation accuracy | 원본+번역본 pair upload |

| 질문으로만 확인 가능한 정보 | 추가 질문 |
|------------------------------|-----------|
| Actual vs agreed amount (without doc) | money band choice |
| Whether formal response sent | POST response status |
| Current negotiation stage | POST action detail |
| Which document is authoritative when conflict | doc priority choice |
| User's intended next action | goal refinement (Phase 2 only) |

| 직접 입력이 필요한 정보 | "내 상황 입력" |
|------------------------|----------------|
| Amount mismatch detail | `re2_moneyDetail` text |
| Timeline narrative | `re2_timelineInput` text |
| Party statement summary | `re2_partyStatement` text |
| Non-standard clause concern | `re2_clauseConcern` text |

| Result에 영향을 주는 정보 | 최종 분석 연결 |
|--------------------------|----------------|
| money + dates | Deep Report § 금액·기한 쟁점 |
| multi-doc + relationships | Deep Report § 문서 대조 |
| responses + authority | Deep Report § 대응 경로 |
| rights + registration docs | Deep Report § 권리·등기 |
| Phase 2 direct input | personalizedContext.integratedSituation |

---

## 5. Critical Missing Information

Phase 2 selector **`selectRealEstatePhase2MissingInfo(answers, freeProfile)`** — only runs when `isRealEstatePhase1Complete` (FREE profiling stop + first result shown path).

Priority: **judgment need × profile field status unknown/inferred × path**

### Cross-path (all)
| Missing ID | Trigger | Profile field |
|------------|---------|---------------|
| `moneyDetail` | `money.status === unknown` OR deposit/dispute/계약금 path | `money` |
| `timelineDetail` | `dates.status === unknown` OR POST or mismatch | `dates` |
| `evidenceMulti` | always after FREE (1 file insufficient for PAID) | `evidence` |
| `docRelationship` | ≥2 uploads OR mismatch in FREE | `documents`, `facts` |

### PRE-specific
| Missing ID | Trigger |
|------------|---------|
| `registrationCheck` | property=소유권 OR goal=notary/full_review |
| `clauseRisk` | goal=risk_terms OR preStage=draft_received |
| `depositCondition` | property=계약금 OR preStage=deposit_agreed |

### POST-specific
| Missing ID | Trigger |
|------------|---------|
| `formalResponseStatus` | goal=before_response/negotiating/preparing_objection |
| `authorityStage` | counterparty=authority_court OR goal=authority_filed |
| `breachSpecifics` | disputeSubject=contract_breach/damage_penalty |

### DOCUMENT-specific
| Missing ID | Trigger |
|------------|---------|
| `docAuthenticity` | docSubject=registration_doc/notice_letter |
| `translationPair` | goal=translation OR gap=translation_error |
| `conflictPriority` | docsMatch=mismatch + gap answered |

### UNCLEAR-specific
| Missing ID | Trigger |
|------------|---------|
| `pathConfirmation` | resolutionPath inferred, not explicit entry |
| `coreFactLock` | customerInput present but money/dates still unknown |

**Stop Condition (Phase 2):** `selectRealEstatePhase2MissingInfo === null` AND multi-doc minimum met (see §12).

---

## 6. PAID Question Architecture

### Engine reuse (no new funnel)
- Same `MasterReviewQuotationReport` + `buildRealEstateVerifyProfileQuestions` **split by phase**
- New: `buildRealEstatePhase2ProfileQuestions(answers, freeProfileSnapshot)`
- Question type: reuse `ProfileQuestion` (`choice` | `text` | `followUpChoice`)
- Adaptive: **each question appended only if missing ID active** — no fixed count
- Direct explain: reuse admin pattern (`직접 설명하기` separate UX) for `re2_*_other` keys

### Per-question documentation rule (mandatory in implementation)
Every Phase 2 question definition must include internal metadata:
```typescript
{
  id, kind, label, options,
  profileField: keyof RealEstateSituationProfile,
  rationale: string,        // 왜 필요한가
  linksToFree: string[],      // 연결 FREE keys
  affectsNext: string[],      // 다음 missing IDs
  resultSection: "01"|"02"|"03"|"04"|"05"|"deep",
}
```
(Metadata in profiling file — not customer-facing.)

### Phase transition UX
1. FREE ONE RESULT → CTA **"2차 개인화 검토"** (mirror admin `handleContinueClick` → phase 2)
2. Banner: **"2차 · 개인화 검토"** (reuse admin copy pattern)
3. Profile continuity chip: **"1차에서 확인한 내용 유지"** — show read-only summary from FREE profile (not re-question)

### Payment gate (NOT VERIFIED — see §23)
- Design hook: `onRealEstatePaidPhase2Start` — **Human Boundary** until payment infra exists
- LOW interim: Ace manual flag or member tier placeholder

---

## 7. PRE PAID Flow

**FREE already knows:** preStage, property, counterparty, goal, docsMatch, situationGap

### Phase 2 questions (adaptive — not all users see all)

#### Q-PRE-1: Deposit/amount clarity (if `moneyDetail`)
- **Label:** "계약금·보증금·중도금 조건을 다시 확인합니다 — 지금 가장 걸리는 금액 문제는 무엇에 가깝나요?"
- **Options (sentence-style):**
  - "서류에 적힌 금액과 구두로 들은 금액이 다릅니다"
  - "추가로 더 내라는 요구를 받았습니다"
  - "반환·환불 조건이 불명확합니다"
  - "아직 금액 자체는 문제없지만 조건 확인이 필요합니다"
- **Why:** FREE only infers `money`; PAID needs actionable amount dispute type
- **Profile:** `money` → confirmed
- **Links FREE:** `re_preStage`, `re_propertyType`, `re_goal`
- **Next:** may unlock `re2_moneyDetail` text if "다릅니다"

#### Q-PRE-2: Registration/ownership (if `registrationCheck`)
- **Label:** "소유권·등기 확인이 필요합니다 — 지금 가장 불안한 부분은 무엇인가요?"
- **Options:**
  - "등기부등본과 계약서의 명의·권리가 다릅니다"
  - "담보·근저당·가압류 같은 제한이 걱정됩니다"
  - "매도인/임대인의 처분권한이 불분명합니다"
  - "아직 등기 확인 전이라 무엇을 봐야 할지 모르겠습니다"
- **Profile:** `rights`
- **Document instead:** 등기부등본 upload → reduce questions

#### Q-PRE-3: Clause risk (if `clauseRisk`)
- **Label:** "계약서 조항 중 지금 가장 확인하고 싶은 부분은 무엇인가요?"
- **Options:** sentence-style for 해지/위약/특약/인도/원상복구
- **Profile:** `risk`, `facts`
- **Direct input:** `re2_clauseConcern` if "직접 설명하기"

#### Q-PRE-4: Multi-doc (if `evidenceMulti`)
- Bridge to upload: 계약서 + 등기 + 송금증 slots
- **Stop:** min 1 required doc OR explicit "아직 없음" + reason text

**PRE Stop:** money OR explicitly N/A + registration addressed + ≥1 Phase2 doc path resolved

---

## 8. POST PAID Flow

**FREE already knows:** disputeSubject, counterparty, goal, docsMatch, situationGap

#### Q-POST-1: Formal response status (if `formalResponseStatus`)
- **Label:** "문제가 생긴 뒤 지금까지 어떤 공식 대응을 하셨나요?"
- **Options:**
  - "아직 서면·공식 연락을 보내지 않았습니다"
  - "내용증명·해지통지·요구서를 보냈습니다"
  - "상대/기관과 협의 중이지만 합의는 없습니다"
  - "이미 기관·법원에 접수했습니다"
- **Profile:** `responses`, `actions`
- **Links FREE:** `re_goal` (before_response vs authority_filed)

#### Q-POST-2: Breach specifics (if `breachSpecifics`)
- **Label:** "계약 위반·손해배상 문제에서 상대가 주장하는 핵심은 무엇에 가깝나요?"
- **Options:** sentence-style (해지 valid? penalty? deposit forfeit?)
- **Profile:** `claims`, `facts`

#### Q-POST-3: Timeline (if `timelineDetail`)
- **Label:** "문제가 시작된 시점과 지금까지의 순서를 확인합니다 — 어느 설명이 가장 가깝나요?"
- **Options:** sentence-style milestones
- **Profile:** `dates`
- **Direct input:** `re2_timelineInput` for complex cases

#### Q-POST-4: Money recovery (if `moneyDetail` + deposit_return)
- **Label:** "돌려받지 못한 금액 문제 — 현재 상황은 무엇에 가깝나요?"
- **Options:** partial payment, denial, offset claim, deadline passed
- **Profile:** `money`

#### Q-POST-5: Multi-doc + contradiction
- Upload: 계약서, 통지/메시지, 송금증
- **Relationship analysis trigger:** if ≥2 docs → `docRelationship` step

**POST Stop:** response status known + timeline + money path resolved + evidence minimum

---

## 9. DOCUMENT PAID Flow

**FREE already knows:** docSubject, property, goal, docsMatch, situationGap

#### Q-DOC-1: Authenticity/trust (if `docAuthenticity`)
- **Label:** "받은 서류 자체를 믿을 수 있는지 확인합니다 — 어떤 의심이 가장 큽니까?"
- **Options:** fake stamp, wrong party, outdated registration, unclear authority

#### Q-DOC-2: Translation pair (if `translationPair`)
- **Label:** "원본과 번역본을 대조해야 합니다 — 어떤 차이가 걱정되나요?"
- **Options:** amount, party name, date, obligation wording
- **Document:** 원본+번역본 upload pair

#### Q-DOC-3: Conflict priority (if `conflictPriority`)
- **Label:** "서류와 실제 상황이 다를 때 — 무엇이 더 맞다고 보시나요?"
- **Options:** document correct, my experience correct, both partially wrong, unknown
- **Profile:** `facts`, `documents`

#### Q-DOC-4: Multi-doc relationship
- Required uploads per `requiredDocuments.ts` verify_real-estate slots
- Auto-skip questions when upload provides field (e.g. amount from contract OCR — future; **NOT VERIFIED**)

**DOCUMENT Stop:** authenticity addressed + conflict priority + ≥2 docs OR gap fully explained

---

## 10. UNCLEAR PAID Flow

**FREE already knows:** customerInput (≥20), inferred path

#### Q-UNC-1: Path confirmation (if `pathConfirmation`)
- **Label:** "설명해 주신 내용을 바탕으로 보면 — 지금 검토는 어디에 더 가깝나요?"
- **Options:** PRE / POST / DOCUMENT sentence-style (not raw entry labels)
- **Profile:** `resolutionPath` confirmation — **does not re-ask entry Q1**

#### Q-UNC-2: Core fact lock
- Target first unknown among money/dates/parties from profile
- Reuse path-specific Q above once path locked

#### Q-UNC-3: Direct input expansion
- **Label:** "아직 정리되지 않은 핵심 사실을 적어 주세요"
- **Kind:** text (structured prompt: who / when / how much / what document)
- **Profile:** enriches `customerInput` + targeted fields

**UNCLEAR Stop:** path confirmed + judgment core complete at Phase 2 precision

---

## 11. Direct Input Design

### Pattern (from admin + FREE)
- **Not** numbered choice — separate button **"직접 설명하기"** (admin: `ADMIN_DIRECT_EXPLAIN_LABEL`)
- **Not** simple memo — maps to Phase 2 answer keys + profile fields

### Phase 2 text keys (proposed)
| Key | Profile target | When |
|-----|----------------|------|
| `re2_moneyDetail` | `money` | amount mismatch selected |
| `re2_timelineInput` | `dates` | complex POST/DOC timeline |
| `re2_partyStatement` | `parties`, `facts` | party_denies gap |
| `re2_clauseConcern` | `risk`, `facts` | PRE clause risk |
| `re2_docConflictNote` | `documents`, `facts` | multi-doc contradiction |

### Validation
- Min length 20 chars for standalone text questions
- Must commit to profile snapshot on save (same as FREE `attachRealEstateProfileSnapshot`)

---

## 12. Multi-document / Image Design

### What exists today
| Layer | Capability |
|-------|------------|
| FREE evidence | 1 file, `AdminVerifyPhase2EvidencePanel`, `verify-real-estate/{leadId}.{ext}` |
| `/documents` | **Multi-file** per slot, `document-upload/{leadId}/{uuid}.ext`, CRM `document_upload` |
| Config | `requiredDocuments.ts` → `verify_real-estate` 2 required + 3 optional slots |
| Image | `.jpg,.jpeg,.png` accepted in both panels |

### PAID design (implementable now)
1. **Phase 2 in-funnel bridge:** extend evidence step to **multi-slot mini-upload** (reuse `/documents` upload helpers) OR redirect to `/documents` with `mode=phase2` query
2. **Minimum for PAID complete:** at least **1 required slot filled** OR waived with structured reason
3. **Images:** map to optional slot "사진·영수증·송금증" — same storage path as documents
4. **Do not** invent OCR — filename + slot label + user context only for v1

### Recommended approach (minimal risk)
- **Phase 2 completion** → `onRealEstatePhase2Complete(answers, evidenceFiles[])` 
- Persist file list in CRM meta extension: `real_estate_phase2_documents_json` (**Human Boundary** — new meta key, no schema migration if JSON in existing meta)
- Deep handoff → existing `/documents?leadId=&service=verify_real-estate&mode=ai_report`

---

## 13. Document Relationship Analysis

### v1 (rule-based — no new AI service assumed)
Build `buildRealEstateDocumentRelationships(profile, uploads, answers)` returning:

| Relation type | Detection rule (v1) |
|---------------|---------------------|
| Same fact | Same amount/date/party string in filename notes + answers |
| Contradiction | FREE `docsMatch=mismatch` + Phase2 conflict priority |
| Date relation | `dates` field + gap `deadline_dispute` |
| Amount relation | `money` + gap `amount_diff` |
| Party relation | `parties` + `party_denies` |
| Contract/doc relation | slot type pairs (계약서 + 등기부등본) |

### Result connection
- FREE ONE RESULT §03 위험 → Phase 2 enriches with **document-linked bullets**
- Deep Report §02 핵심 확인 → adds "문서 A vs B" lines
- Display in `personalizedContext.phase2Additions` (mirror admin)

**NOT VERIFIED:** automated content extraction from PDF — treat as v2

---

## 14. PAID 자세히 보기

### Current (FREE)
- Tab **"자세히 보기"** → `MasterServiceGuidePanel` with `REAL_ESTATE_GUIDE_SLUG`
- Content: PUBLIC guide article + generic verify items — **not profile-linked**

### PAID 3-layer design

| Layer | Source | PAID behavior |
|-------|--------|---------------|
| **PUBLIC** | `getPublishedArticleBySlug(REAL_ESTATE_GUIDE_SLUG)` | unchanged — SEO/AEO general knowledge |
| **SERVICE** | New profile-aware sections in guide tab OR inline panel | Show sections matching `resolutionPath` + `goal` + Phase2 gaps (e.g. 보증금 반환 절차 when POST+deposit_return) |
| **REPORT** | Deep AI Report only | personalized — not in guide tab |

### Rule
- PAID SERVICE content **must reference** FREE profile labels (read-only chips)
- **Must not** repeat FREE questions as guide text
- **Must not** expose prices

### Implementation note
- Extend `MasterServiceGuidePanel` with optional `profileContext` prop — **new work**, reuse article shell

---

## 15. Deep AI Report

### Current
- CTA triggers `recordAiReportRequestAndNotify` → `/documents?mode=ai_report`
- `/documents` TODO: AI analysis not implemented — CRM + notify only

### Target (PAID)
```
Deep AI Report =
  FREE Profile (real_estate_situation_profile_json)
  + Phase 2 answers (re2_* keys)
  + Phase 2 profile delta
  + direct inputs
  + multi-doc metadata (CRM document_upload rows)
  + document relationship summary
  + SERVICE layer citations (legalRag when available — **NOT VERIFIED for real-estate**)
  → personalized report artifact
```

### UI
- Reuse `AdminVerifyFirstResultPanel` `variant="personalized"` layout
- Title: **"부동산 문서 2차 개인화 결과"** → final **"Deep AI Report"** on `/documents` completion
- Expert label: **VFBCAI 전문가팀** only

### v1 scope lock
- Rule-based personalized result (like admin) **first**
- Generative Deep Report **depends on `/documents` backend** — separate sub-phase

---

## 16. Result Architecture

| Stage | Builder | Panel | User sees |
|-------|---------|-------|-----------|
| FREE | `buildRealEstateFirstResult` | `variant="first"`, domain real-estate | 1차 종합 결과 (5 sections) |
| PAID Phase 2 mid | (optional progress) | profiling UI | 2차 질문 + upload |
| PAID final | **`buildRealEstatePersonalizedResult`** (new) | `variant="personalized"` | 1차+2차 통합 |
| Deep AI Report | `/documents` completion (future) | documents result view | full analysis |

### Reuse vs new
| Reuse | New |
|-------|-----|
| `AdminVerifyFirstResultPanel` layout/stitch UI | `buildRealEstatePersonalizedResult` |
| Section 01–05 structure | Phase2-specific cautions/unconfirmed |
| `AdminVerifyPersonalizedNextSteps` CTAs | real-estate CTA copy |
| Key metrics cards | metrics from Phase 2 fields |
| — | `RealEstatePersonalizedContext` type |
| — | Document relationship block in §02 |

### FREE → PAID continuity (user-visible)
- Badge: **1차 기본 확인 ✓ → 2차 개인화 검토 → Deep AI Report**
- §01 현재 상황: prepend FREE summary read-only
- §02: append "2차 추가 확인" block (admin pattern lines 3069–3080)

---

## 17. CRM / Restore Considerations

### CRM meta extensions (proposed — Human Boundary)
```typescript
real_estate_phase2_complete: "1"
real_estate_phase2_profile_json: string  // extended snapshot
real_estate_phase2_documents_json: string
real_estate_paid_tier: "phase2" | "deep_report"  // when payment exists
```

### Restore behavior (must preserve constitution §5)
- EXISTING CASE + restore: **skip FREE questions** (already works via `_realEstateProfilingComplete`)
- **New:** if Phase 2 complete in meta → skip to personalized result or `/documents`
- **New:** if FREE complete only → show ONE RESULT, offer Phase 2 (not re-signup)
- `?restore=1` + Phase 2 partial → resume Phase 2 questions (not from entry)

### Restore implementation
- Extend `restoreRealEstateProfilingAnswersFromMeta` + new `restoreRealEstatePhase2FromMeta`
- Update `scripts/qa-real-estate-restore-check.ts` + new Phase 2 restore cases

---

## 18. Protected Areas

**Do not change without explicit Mission:**
- DB schema / Supabase migrations / RLS
- Auth/session (`establishBrowserSessionFromResultToken` pattern)
- `service_type: verify_real-estate`
- FREE question defs/labels (Golden baseline)
- FREE E2E paths behavior
- `/verify/admin` Master funnel
- `/check/trc` (d0378ee baseline)
- TRC Master UI
- Legacy funnel code paths (preserve)
- Engine order CHECK→VERIFY→REGISTER→PROTECT

**FREE baseline tests must stay PASS after every implementation phase.**

---

## 19. Required Files

### Modify (expected)
| File | Purpose |
|------|---------|
| `src/lib/realEstateVerifyProfiling.ts` | Phase 2 questions, selector, profile extend, meta |
| `src/lib/realEstateVerifyFirstResult.ts` | Keep FREE builder untouched |
| **NEW** `src/lib/realEstateVerifyPhase2Result.ts` | Personalized + relationship builders |
| `src/components/cost-check/MasterReviewQuotationReport.tsx` | Phase gates, Phase 2 UI flags |
| `src/app/verify/real-estate/page.tsx` | Gate props, handlers, restore |
| `src/components/cost-check/MasterFunnelLanding.tsx` | Pass extended gate props (minimal) |
| `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` | real-estate personalized copy tweaks only if needed |
| `src/lib/restoreVerifyLead.ts` | Only if meta merge helpers needed |
| `tests/qa/real-estate-paid-phase2-e2e.spec.ts` | **NEW** QA |
| `tests/qa/real-estate-free-e2e.spec.ts` | Regression only — no behavior change |
| `scripts/qa-real-estate-restore-check.ts` | Extend restore cases |

### Reuse unchanged
| File | Reason |
|------|--------|
| `AdminVerifyPhase2EvidencePanel.tsx` | v1 bridge; multi-doc via `/documents` |
| `src/app/documents/page.tsx` | Multi-upload infra |
| `src/lib/requiredDocuments.ts` | Slot definitions |
| `src/lib/aiReportRequest.ts` | CTA handoff |
| `adminVerifyProfiling.ts` | Reference only — do not sync copy |

### Forbidden
- `src/app/check/trc/*`
- `src/app/verify/admin/page.tsx` logic changes (unless shared extract approved)
- DB migrations (Phase 1 implementation)

---

## 20. Implementation Phases

| Phase | Scope | Risk | Ace approval |
|-------|-------|------|--------------|
| **P0** | Phase state machine + gates in MasterReviewQuotationReport (no new questions) | MEDIUM | Required |
| **P1** | `selectRealEstatePhase2MissingInfo` + PRE path questions only | HIGH | Required |
| **P2** | POST + DOCUMENT + UNCLEAR Phase 2 questions | HIGH | Required |
| **P3** | `buildRealEstatePersonalizedResult` + panel variant | HIGH | Required |
| **P4** | Multi-doc bridge + CRM meta extension | HIGH | Human Boundary |
| **P5** | `/documents` Deep Report output (depends on backend) | HIGH | Human Boundary |
| **P6** | Payment gate | BLOCKED | Human Boundary — **no payment infra** |
| **P7** | SERVICE-layer 자세히 보기 profile linking | MEDIUM | Required |
| **P8** | Restore Phase 2 + QA harness | MEDIUM | Required |

**One Change → One Scope:** each phase = separate IMPLEMENTER Mission.

---

## 21. QA Plan

### New spec: `tests/qa/real-estate-paid-phase2-e2e.spec.ts`

| Case | Path | Assert |
|------|------|--------|
| PAID-PRE-1 | PRE → FREE result → Phase 2 → personalized | no FREE Q repeat |
| PAID-POST-1 | POST | formal response question appears |
| PAID-DOC-1 | DOCUMENT | conflict + multi-doc |
| PAID-UNC-1 | UNCLEAR | path confirm only, no entry Q1 |
| Carry-over | all | profile JSON contains FREE fields |
| Re-ask block | all | entry Q1 count = 0 after Phase 2 start |
| Direct input | POST | text saves + advances |
| Multi-file | DOCUMENT | ≥2 slots in `/documents` or bridge |
| Image | POST | png upload in optional slot |
| Contradiction | DOCUMENT mismatch | relationship bullet in result |
| Deep Report CTA | all | navigates `/documents?mode=ai_report` |
| Restore Phase 2 | PRE | meta round-trip |
| Desktop | all | 1280 |
| Mobile | all | 375px, no overflow |
| FREE regression | all paths | existing spec PASS |
| Admin smoke | — | `/verify/admin` loads |
| TRC smoke | — | `/check/trc` loads |

### Harness retention
- Keep `tests/qa/pilot-question-guide-count.mjs` during Pilot evolution

---

## 22. Risks

| Risk | Mitigation |
|------|------------|
| FREE regression | Phase-gated changes; run free E2E every phase |
| Profile restore drift | Extend `qa-real-estate-restore-check.ts` before P8 |
| Payment absent | P6 blocked; design hook only |
| `/documents` AI stub | P5 labeled NOT VERIFIED; rule-based result in P3 |
| DOM dual-mount (QUESTION GUIDE) | Known pattern — not a blocker |
| Scope creep to admin | Real-estate files only |
| CRM meta without migration | JSON keys in existing meta object only |
| legalRag for real-estate | NOT VERIFIED — do not assume |

---

## 23. NOT VERIFIED

| Item | Status |
|------|--------|
| Payment / subscription / tier gating | **No code in repo** |
| Stripe or billing integration | **Not found** |
| PDF/OCR content extraction | **Not implemented** |
| `/documents` AI analysis output | **TODO in page.tsx** |
| legalRag integration for real-estate Deep Report | **Not confirmed** |
| CRM meta new keys in production | **Needs Ace approval** |
| Multi-file in Master funnel (in-panel) | **Design choice P4 — `/documents` proven** |
| Exact Phase 2 question copy (Vietnamese legal accuracy) | **Needs product review** |

---

## 24. Scope Lock

### In scope (future IMPLEMENTER Missions)
- Real-estate VERIFY Phase 2 profiling + personalized result
- Profile carry-over from FREE
- Multi-doc handoff via existing `/documents`
- QA harness for PAID paths
- Restore extension for Phase 2 meta

### Out of scope
- New Engine or `/verify/real-estate-paid` route
- Payment processing (until infra Mission)
- DB schema migration
- Admin verify changes
- TRC / other VERIFY services
- Generative AI pipeline (separate Mission)
- FREE funnel behavior changes
- Price display on customer UI

---

# IMPLEMENTER HANDOFF

> **Do not start until Ace approves this Brief.** IMPLEMENTER executes **one phase at a time**.

## Exact change scope (P0 first Mission)

**Goal:** Add Phase 1/2 state to real-estate Master gate without new questions.

### Change files
1. `src/lib/realEstateVerifyProfiling.ts` — add `RealEstateVerifyProfilePhase` type + `isRealEstatePhase1Complete()` (= current `isRealEstateProfilingComplete`)
2. `src/components/cost-check/MasterReviewQuotationReport.tsx` — add `realEstateVerifyProfilePhase` state; wire `isRealEstateFirstResult` → continue → phase 2 shell (banner only)
3. `src/app/verify/real-estate/page.tsx` — extend `RealEstateVerifyMasterGateProps` usage if new callbacks needed
4. `src/components/cost-check/MasterReviewQuotationReport.tsx` — extend `RealEstateVerifyMasterGateProps` type

### New files (P1+)
- `src/lib/realEstateVerifyPhase2Result.ts`
- `tests/qa/real-estate-paid-phase2-e2e.spec.ts`

### Reuse files (no rewrite)
- `AdminVerifyPhase2EvidencePanel.tsx`
- `AdminVerifyFirstResultPanel.tsx` (layout)
- `buildRealEstateFirstResult` (FREE — frozen)
- `/documents/page.tsx`
- `requiredDocuments.ts`

### Forbidden files/areas
- `src/app/check/trc/**`
- `src/app/verify/admin/**` (behavior)
- `supabase/**`
- FREE question labels/options in `realEstateVerifyProfiling.ts` (existing constants)
- `git commit/push/deploy` without Ace

### Implementation order
```
P0 gates → P1 PRE Phase2 Q → P2 other paths → P3 personalized result
→ P4 multi-doc meta → P8 restore/QA → P7 guide linking → P5 Deep Report (blocked on backend) → P6 payment (blocked)
```

### QA acceptance criteria (P0)
- [ ] FREE 4-path E2E still PASS (desktop + mobile)
- [ ] Restore E2E still PASS
- [ ] `/verify/admin`, `/check/trc` smoke PASS
- [ ] `npx tsc --noEmit` PASS
- [ ] Phase 2 banner visible after FREE continue (no questions yet)
- [ ] No FREE question re-display on Phase 2 entry

---

## Architect Recommendation

```
Risk: HIGH (overall program) — first IMPLEMENTER Mission P0: MEDIUM
Ready for Ace approval: YES
Next agent: IMPLEMENTER (P0 only, after Ace approves Brief)
IMPLEMENTER: NOT RUN
VERIFIER: NOT RUN
Product code: NOT MODIFIED
```
