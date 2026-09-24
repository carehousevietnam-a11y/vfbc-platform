# Real Estate VERIFY Phase2 실질화 — STEP2-1 Mission Brief (LOCK)

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **LOCK** — Ace 승인 2026-09-25 (DQ-RE-R01~R06 전건 A). **본 문서 작성 시점 코드 미착수** |
| **Mission** | RE VERIFY Phase2 **정보완결성 리메디** — GAP-RE-DL-01~11 text·downstream·조기 STOP 해소 |
| **선행 (필수)** | `VFBCAI_REALESTATE_STEP2-0_DESIGN_MAPPING_v1.md` **§1~§7 STEP2-1** 구현·PASS — **먼저** |
| **IMPLEMENTER 착수** | 선행 PASS + Ace **리메디 STEP2-1** 지시. Admin CASE_01~06·`adminVerifyProfiling.ts`와 **무관** (RE adapter만) |
| **설계 SoT** | `VFBCAI_REALESTATE_PHASE2_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_REALESTATE_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준 (LOCK)** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (`fa4cce9`) |
| **헌법** | `docs/VFBCAI_CONSTITUTION.md` §16.6 |

**코드 미착수.** 구현은 이 Brief + 리메디 STEP2-0만 따른다. DQ는 §1 **재오픈 금지**.

---

## 0. Mission 한 줄

RE-native text 키로 GAP-RE-DL-01~08 저장·Profile/결과 연결, DL-09~11·기존 `re2_*` downstream 실질화, `selectMinimumPhase2DeepeningMissing` 조기 완료 제거 + 경로별 Phase2 최소 깊이 — **Admin Master·CASE_01~07 미변경**, `re_*`/`re2_*` 질문 id **신규 choice 추가 없음** (text 후속·결과 분기만).

---

## 1. DESIGN QUESTIONS — Ace 승인 LOCK

| ID | 결정 | 구현 요약 |
|----|------|-----------|
| **R01** | **A** | §1 전체 text 키 `kind: "text"`. date/number picker 없음 |
| **R02** | **A** | `re2_hearingScheduleText` **한 칸** (일시·장소 함께) |
| **R03** | **A** | `re_docsMatch === match` 시 Phase1 `re_gapDeadlineText` **없음**. 기한은 Phase2 text만 |
| **R04** | **A** | Phase1 실질 축 **보수 4~5** (미열림·inferred property 제외). 전형 경로 Phase2 실질 **≥9~11** VERIFIER 목표. **신규 choice id 없음** |
| **R05** | **A** | `verbal_promise_denied` / `party_wrong_on_doc` — conflict text 없음. value별 caution·facts만 |
| **R06** | **A** | UNCLEAR: lock+bridge+`re2_unclearBridgeCommitted` 전 **Phase2 incomplete**. signup은 Phase1만 |

---

## 2. IMPLEMENTER — 필수 구현 (리메디 STEP2-0)

**파일:** `src/lib/realEstateVerifyProfiling.ts` 중심. Admin 함수·키 **복사 금지**.

### 2.1 P0 — text 키 상수·persist (R01)

| 상수 키 | 게이트 slug |
|---------|-------------|
| `re_gapAmountText` | `re_situationGap === amount_diff` |
| `re_gapDeadlineText` | `re_situationGap === deadline_dispute` |
| `re2_translationAmountText` | `re2_translationIssue === amount_diff` |
| `re2_translationDateText` | `date_diff` |
| `re2_conflictAmountText` | `re2_conflictFocus === amount_written_diff` |
| `re2_conflictTimelineText` | `timeline_written_diff` |
| `re2_timelineAnchorText` | `re2_timelineStage` 완료 후 text 비음 |
| `re2_recoveryDeadlineText` | `re2_moneyRecovery === deadline_passed` |
| `re2_hearingScheduleText` | `re2_authorityStage === hearing_scheduled` |
| `re2_moneyAmountText` | `re2_moneySituation` ∈ `verbal_vs_written` \| `return_unclear` \| `extra_demand` |
| `re2_handoverPlaceText` | `re2_clauseFocus === delivery_handover` |
| `re2_partyAddressText` | `re2_translationIssue === party_name_diff` |

- `amount_unclear` → 기존 `re2_moneyDetail` 유지 (GAP-06).
- `not_checked_yet` → `re2_registrationDetail` 유지.
- persist: Phase1/Phase2 extract·meta whitelist. choice 순서 배열에 text 키 **넣지 않음**.
- 삽입: parent choice 직후, single-focus early-return 유지.

### 2.2 P1 — Profile · GAP-10 (R03, R05)

- `buildRealEstateSituationProfile`: 합성 「서류와 상황 일치 응답」/「불일치 응답」 **삭제**. `partial`/`match`/`mismatch` 라벨·gap·conflict 우선.
- `money` / `dates` / `facts` / `parties` / `risk`: §2.1 text 있으면 「라벨 · text」. slug만으로 「확인됨」류 **금지**.
- GAP-11: STEP2-1 §3.1 적용 확인만 — `actions`/`responses`에 `re_goal` 복사 **없음**.

### 2.3 P2 — 결과 (`realEstateVerifyFirstResult.ts`)

- `buildCautions` / `buildUnconfirmed` / `buildSituationSummary`: §2.4 표의 `re2_*`·gap text **값별** 분기 (Profile만으로 동일하면 slug 직접 분기 1층 추가).
- `buildActions` 목록 변경 **없음** (DQ-RE-08 별도).

### 2.4 P3 — Phase2 downstream (질문 id 추가 없음)

기존 choice id마다 값 변경 시 **Profile source·다음 needs·caution/unconfirmed 중 2개 이상** 상이 (감사 ②~④).

대상: `re2_moneyRecovery`, `re2_breachFocus`, `re2_formalResponse`, `re2_timelineStage`, `re2_authorityStage`, `re2_registrationConcern`, `re2_clauseFocus`, `re2_moneySituation`, `re2_docReliability`, `re2_translationIssue`, `re2_conflictFocus`, unclear lock/bridge.

Phase1: `re_disputeSubject`, `re_goal`, `re_docsMatch`, `re_situationGap` — caution/value 문장 보강만 (**Phase1 실질 축 +1 금지**).

### 2.5 P4 — 조기 Phase2 종료 (R04, R06)

- `selectMinimumPhase2DeepeningMissing`: `hasPhase2Answer` → 즉시 `null` **삭제**.
- `realEstatePhase2DepthComplete(answers)`:
  - applicable `needs*Phase2` 없음
  - §2.1 text gates 없음
  - `countRealEstatePhase2SubstantiveAxes` ≥ `realEstatePhase2MinimumSubstantiveAxes` (POST/PRE **4**, DOCUMENT **3**, UNCLEAR **3**)
- `isRealEstatePhase2Complete`: 위 depth AND 기존 selector.
- `effectivePhase2ResolutionPath === null` → Phase2 **false** (R06).

### 2.6 P5 — UI · 레거시

- `MasterReviewQuotationReport.tsx`: RE parent choice + text shorten.
- `realEstateVerifyPersonalizedResult.ts`: 2차 메트릭·요약 동기화.
- Legacy `re2_timelineDetail` / `re2_conflictDetail` / `re2_clauseDetail`: read-only → §2.1 키 매핑. 신규 쓰기는 text 키만.

---

## 3. 금지 (Human Boundary)

- `adminVerifyProfiling.ts`, `adminVerifyCase06Redesign.ts`, Admin 결과 패널
- `caseNN_*` / `case06_*` 키명·게이트 이식
- Entry Q1·evidence upload gate·`getRealEstateResolutionPath` 골격 재설계
- 장식용 **신규 choice** id로 비율 채우기
- LOCK 감사 ①~⑤ **완화**
- **선행 미완:** RE STEP2-1 (DQ-RE-01~07) 없이 본 Mission 착수

---

## 4. 터치 파일

| 파일 | P0~P5 |
|------|-------|
| `src/lib/realEstateVerifyProfiling.ts` | 전부 |
| `src/lib/realEstateVerifyFirstResult.ts` | P2 |
| `src/lib/realEstateVerifyPersonalizedResult.ts` | P5 |
| `MasterReviewQuotationReport.tsx` | P5 |

---

## 5. VERIFIER 완료 조건 (LOCK)

| # | 조건 | DQ |
|---|------|-----|
| 1 | §2.1 각 text 키: 게이트 slug에서만 필수·persist·restore | R01 |
| 2 | `hearing_scheduled` → `re2_hearingScheduleText` 1문항 | R02 |
| 3 | `match` 경로에 `re_gapDeadlineText` 없음 | R03 |
| 4 | 3 스팟 경로(POST deposit+mismatch, PRE draft+mismatch, DOC mismatch) 실질 축 표 + **3:7 하한** | R04 |
| 5 | conflict `verbal_promise_denied` / `party_wrong_on_doc` text 없이 caution 분기 | R05 |
| 6 | UNCLEAR bridge 미커밋 시 `_realEstatePhase2Complete` ≠ 완료 | R06 |
| 7 | GAP-RE-DL-01~08 slug만으로 「금액/기한 확인됨」 문장 없음 | — |
| 8 | 조기 1답 Phase2 완료 **불가** (depth gate) | P4 |
| 9 | `npx tsc --noEmit` PASS | — |
| 10 | product `/verify/real-estate` PC + 375px (UI text 1건 다수) | `06-ui-design-responsive-typography-qa.mdc` |
| 11 | 감사 ①~④ **개선 방향** — LOCK 완화 없음 | — |

---

## 6. 실질 축 (R04 검증)

**Phase1 (보수):** entry + path anchor + goal + (열린 경우만) counterparty / property / docsMatch / situationGap → **4~5**.

**Phase2 (전형):** recovery, breach, formal, timeline, authority, conflict, money, registration, clause, doc, translation, unclear — 경로별 부분집합. **목표 ≥9** substantive (②~④ 통과 choice id).

text 키는 부모 choice **밀도** — 비율 +1 아님.

---

## 7. Governance · 착수 순서

```
Admin CASE_01~06 STEP2-1 (Ace 순서)
  → RE STEP2-1 (DQ-RE-01~07) — VFBCAI_REALESTATE_STEP2-0_DESIGN_MAPPING §1~§7
  → [Ace 리메디 지시]
  → 본 Brief STEP2-1 (DQ-RE-R01~R06)
  → 감사 v1.1 / VERIFIER
```

- PASS 후 선택: Master Skill Verified Lessons (별도 Mission).
- Brief·리메디 STEP2-0과 충돌 구현 **금지**.

---

*2026-09-25. DQ-RE-R01~R06 Ace 전건 승인 LOCK (전부 A). RE STEP2-1(§1~§7) PASS 후 착수. 코드 미착수.*
