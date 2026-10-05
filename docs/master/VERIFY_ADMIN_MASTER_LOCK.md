# verify_admin VERIFY MASTER — LOCK Record

**Status**: LOCK (Ace, 2026-10-05)  
**Scope**: Documentation and governance only in H-10. Product code frozen at commits listed below unless a new Mission explicitly unlocks.

## 1. Lock scope

| Area | Includes |
|------|----------|
| Free AI report PDF | Phase-1-only executive shell, F-18 copy, no phase-2 block |
| Paid AI report PDF | Phase-1 + phase-2 evidence, 7-line EVIDENCE budget, G-1–G-5 ordering |
| Mypage — free (aiOnly) | Slim aside, wallet footer, rolling strip (F-8–F-17) |
| Mypage — expert flow | `VerifyAdminExpertFlowDashboard`, pre-phase2 expert request |
| Mypage — paid (phase2 complete) | Paid dual-card layout, paid status copy (F-7) |
| Phase-2 gate | Expert-page AI PDF: UI + `POST /api/mypage-pdf` 403 (H-3) |
| Expert mypage truthfulness | No fabricated dates/notifications (H-9) |

**Out of LOCK scope (P2 backlog)**: payment system, global confidence banner, header badge counts, non-admin services StepProgress mock dates, legacy leads with null meta.

## 2. Related commits (reference)

| Track | Commits (newest first within track) |
|-------|-------------------------------------|
| **H** | `3f49192` H-9 · `1d93ab4` H-3 · `ed7b7b7` H-1 |
| **G** | `aa257a6` G-5 · `aec04dd` G-4 · `ad54eb6` G-3b · `2ead7ad` G-3 · `ea0a935` G-2 · `32b0231` G-1 |
| **F-18** | `5c5ae9d` F-18f · `2590e28` F-18e · `08cade8` F-18d · `365f401`/`6ced304` F-18c · `4dbf8c1` F-18b · `5106585` F-18 |
| **F-15–F-17** | `9fd5d09` F-17 · `a05aec3`/`194578d` F-16 · `6495017`/`8053c5f` F-15 |
| **F expert/paid layout** | `94f75e7` · `564e639` · `d6fe995` · `d2871f8` F-7 · earlier F-8–F-11 in `5c81c56`–`fa1bcee` |
| **Governance** | H-10 doc commit (this file + SKILL lessons) — no `src/` change |

H-2 (state model: expert vs phase2 vs payment) is **documented in investigation**; no single product commit — see SKILL lesson 25.

## 3. Ace-approved copy constants (location)

**File**: `src/lib/adminVerifyMypageFields.ts` (client-safe — no Node PDF imports).

| Constant | Purpose |
|----------|---------|
| `VERIFY_ADMIN_EXPERT_PHASE2_INCOMPLETE_STATUS_GUIDE` | Expert flow, phase2 incomplete status (H-9 ㉠) |
| `VERIFY_ADMIN_EXPERT_REQUEST_TIMELINE_LABEL` | Timeline/notifications label for expert request (H-9 ㉡) |
| `VERIFY_ADMIN_MYPAGE_NOTIFICATION_EMPTY` | Empty notification center (H-9 ㉢) |
| `VERIFY_ADMIN_EXPERT_PHASE2_ENTRY_BUTTON_LABEL` | Phase2 entry CTA (H-3) |
| `VERIFY_ADMIN_EXPERT_PHASE2_PDF_LOCKED_NOTICE` | Locked PDF notice (H-3) |
| `VERIFY_ADMIN_EXPERT_PHASE2_PDF_GATE_ERROR_MESSAGE` | API 403 message (H-3) |
| `VERIFY_ADMIN_PHASE2_AI_REPORT_RECEIVE_LABEL` | Phase2 complete PDF button |
| `VERIFY_ADMIN_PHASE2_QUESTION_RESUME_HREF` | `/verify/admin?restore=1` |
| `ADMIN_VERIFY_FREE_PDF_*` | Free PDF shell (F-18d+) |
| `ADMIN_VERIFY_PAID_PDF_*` | Paid PDF shell + evidence budget (G-1+) |
| `VERIFY_ADMIN_PAID_STATUS_*` | Paid mypage status card (F-7) — **unchanged by H-9** |

Customer-facing strings **must not** be edited without Ace approval.

## 4. Verification summary

| Check | Result (2026-10-05) |
|-------|---------------------|
| `npx tsc --noEmit` | PASS |
| `node tests/qa/admin-verify-2step-result.mjs` | `ok: true` |
| `npx next build` | PASS (post H-9) |
| Browser mypage H-7/H-9 | Real leads S1–S4; captures under `tests/qa/_output/` (**not committed**) |
| PDF golden | `tests/qa/_output/golden-*-32b0231.json` regression in QA harness |

**Test leads** (Supabase dev — do not delete):

| Role | Receipt | Full lead UUID (prefix) |
|------|---------|-------------------------|
| Free verify_admin | VF7946DFD1 | `7946dfd1-…` |
| Expert, phase2 incomplete | VF377841CE | `377841ce-…` |
| Phase2 complete (“paid” layout) | VFF64C6805 | `f64c6805-…` |
| Other service (TRC) | VFB69EBDBB | `b69ebdbb-…` |

## 5. Port checklist — other services

**Replicate (structure)**:

- Separate free vs paid PDF pipelines; phase-2 block only on paid path
- 1-page paid PDF, 7-line evidence cap, no ellipsis truncation policy (G-series)
- Phase-2 **UI + API** gate for gated PDFs
- Mypage: activity-backed timeline/step dates; no sample notifications
- `serviceType`-scoped changes when editing shared mypage/PDF code
- Verification: tsc, QA harness, build, 375/1280 browser, real PDF bytes

**Do not copy verbatim (service-specific)**:

- Question IDs, CASE branches, option labels
- Ace-approved prose (must be re-approved per service)
- Institution/document wording unless derived from that service’s profile

**Master rule**: `verify_admin` is the reference implementation. One service per Mission; before/after golden diff; admin regression = FAIL.

## 6. P2 backlog (not LOCK blockers)

1. Global **ConfidenceBanner** “정상 진행 중” — always green when no yellow/red actions (not activity-backed).
2. **TopHeader** notification badge `"3"` — fixed decoration, not real count.
3. **Non–verify_admin** expert mypage **StepProgress** mock dates (`07.29 09:12` …) still present.
4. **AiResultCard** “AI 분석 결과” five fixed display lines (verify_admin expert flow).
5. **Legacy leads** with `verify_lead.meta === null` → old PDF template path (H-6).
6. **Payment system not implemented** — paid PDF opens on `admin_phase2_documents_upload_complete` only; real payment Mission required before production.
7. **~475 test leads** cleanup / hygiene (ops).
8. Free mypage **wallet card title** bottom clip (typography).
9. Profile/PDF **“교통국·운전면허 관련 기관”** fixed phrase — separate Mission (F-18c class).

## 7. Governance references

- Verified lessons: `.cursor/skills/vfbcai-master-development/SKILL.md` § **verify_admin VERIFY MASTER — PDF · Mypage · LOCK (2026-10)** items 21–34
- QA harness: `tests/qa/admin-verify-2step-result.mjs`
- Constitution: `docs/VFBCAI_CONSTITUTION.md` — no false completion, Ace copy authority

---

*H-10: LOCK record only. No product code changes in this Mission.*
