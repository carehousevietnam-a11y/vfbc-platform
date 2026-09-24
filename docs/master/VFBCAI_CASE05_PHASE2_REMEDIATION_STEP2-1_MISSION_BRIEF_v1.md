# CASE_05 Phase2 실질화 — STEP2-1 Mission Brief (LOCK)

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **LOCK** — Ace 승인 2026-09-25. IMPLEMENTER 착수 조건: 1번창 `adminVerifyProfiling.ts` 5-item 배치 종료 + 단일-writer 해제 |
| **Mission** | CASE_05 네이티브 Phase1·Phase2 **정보완결성 실질화** (버그 수정 + 장식 질문 downstream 연결) |
| **설계 SoT** | `VFBCAI_CASE05_PHASE2_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_CASE05_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준 (LOCK)** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` |
| **헌법** | `docs/VFBCAI_CONSTITUTION.md` §16.6 |
| **질문 MASTER** | `VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` § CASE_05 |

**코드 미착수 (본 문서 작성 시점).** 구현은 이 Brief + STEP2-0만 따른다. DQ는 아래 §1에 **재오픈 금지**.

---

## 0. Mission 한 줄

`specific_date` Profile 저장 수정, 장식 5질문·선택지·blockage/finalGoal/evidence/deadline/reason downstream 실질화, **R04 사유 경로 확장**, **R06 Phase2 실질 축 ≥10** VERIFIER 확정 — Admin Master 틀·STOP·bridge **변경 없음**.

---

## 1. DESIGN QUESTIONS — Ace 승인 LOCK

| ID | 결정 | 구현 요약 |
|----|------|-----------|
| **R01** | **A** | `CASE05_DEADLINE_DATE_KEY` + Phase1 `kind: "text"` 후속. CASE_01 `case01_deadlineDate` 동형. date picker 없음 |
| **R02** | **B** | `case05EffectiveDeadline`으로 slug normalize만. `case05_deadlineDate` 없으면 restore 후 **신규 입력** 요구. legacy 자동 backfill 없음 |
| **R03** | **A** | `submittedDocsDetail`: 신규 저장은 `ADMIN_DIRECT_EXPLAIN_CHOICE` (`other`+note). slug `doc_other`는 **legacy read-only** |
| **R04** | **B** | `case05NeedsDispositionReasonPhase2` 확장 (§2.1). 질문 id·축 개수 1개 유지 |
| **R05** | **B** | `finalGoal` slug·MASTER chain 유지. 값별 `result` / `action` / Profile `goal` override로 실질화. 옵션 슬림화 없음 |
| **R06** | **B** | STEP2-1 VERIFIER **§5 조건 3**: Phase2 **실질 축 ≥10** (3:7·4:6 **둘 다**). five detail 실질화로 11축 목표 (STEP2-0 §3.3) |
| **R07** | **B** | `dispositionDetail` → Profile **합성 라벨** (type + detail). `selectCase05ResolutionFocus` rank는 **`dispositionType` 우선**, detail로 FOCUS 1순위 뺏기 금지 |

---

## 2. IMPLEMENTER — 필수 구현 (STEP2-0 매핑)

### 2.1 P0 — `specific_date` (§1 STEP2-0)

- `CASE05_DEADLINE_DATE_KEY = "case05_deadlineDate"`
- `case05NeedsDeadlineDateDetail` · `appendCase05Phase1Questions` text 후속
- `isCase05Phase1Complete` · `buildCaseResolutionProfile` deadline · `deriveDispositionSignals`
- `CASE05_ANSWER_KEYS` · `AdminVerifyFirstResultPanel` Phase1 signals/actions
- `MasterReviewQuotationReport` 요약 (해당 시)

### 2.2 P1 — 장식 5질문 실질화 (§2.1 STEP2-0)

`dispositionDetail`, `factDetail`, `explanationDetail`, `submittedDocsDetail`, `appealDetail` — 각 선택값별 **Profile · signals/unknowns/risk · result 문장** (감사 표). **R07** 적용.

### 2.3 P2 — Phase1 deadline 4값 분리 (§2.2)

`uncertain` / `period_stated` / `not_stated` / `unsure` / `specific_date`(+date) — 신호·result 문장 분리.

### 2.4 P3 — R04 사유 경로 확장

**파일:** `src/lib/adminVerifyProfiling.ts` — `case05NeedsDispositionReasonPhase2` (~5451).

**유지 (기존 true):**

- `dispositionType` ∈ `{ reason_hard_to_understand, CASE05_DISPOSITION_TYPE_UNCLEAR }` (코드 상 unclear slug 확인)
- `case05EffectiveConfirmGoal(goal)` ∈ `{ understand_reason, maintain_reason }`

**추가 (R04=B):**

- `dispositionType` ∈ `{ application_denied, business_suspended }` **또는** `case05DispositionTypeIsRightsEnded(type)`  
- **그리고** `case05EffectiveConfirmGoal(goal)` ∈ `{ understand_impact, appeal_possibility, what_to_do }`

`case05PathFieldsComplete` · `appendCase05Phase2Questions` chain 순서 변경 없음. 확장 경로 strict/harness 스팟 1건.

### 2.5 P4 — reason 4값 · blockage · finalGoal · evidence (§2.3–2.6)

- `dispositionReason` 4값 downstream (이미 열린·R04로 새로 열린 경로 공통)
- `blockage` 9값+other: `case05ActionsFromAnswers` · `currentBlockage` · FOCUS rank (type 우선과 충돌 없게)
- `finalGoal`: R05=B override만
- `evidence` 6값: result/expert 문장 분기 (upload gate 변경 없음)

### 2.6 P5 — 잔여 감사 권장

`partial` vs `mismatch` result 분리, `modified`/`revoked` outcome, `repeatFollowUp`·`inquired`/`other` customerResponse 문장 (STEP2-0 §2.7).

---

## 3. 금지 (Human Boundary)

- CASE_06 bridge · `isCase06BridgedToNativeCase` · CASE_07 · Q1 document kind 재설계
- Phase1/2 **질문 id 삭제**·MASTER chain 순서 변경
- `authority` 당사자 신규 질문 (감사 권장안 7 — 미승인)
- Evidence **upload gate** 구조 변경
- LOCK 감사 기준 ①–⑤ **완화·재해석**
- 형식적 질문 수만 늘려 비율 채우기 (실질 축 ②–④ 미통과 질문으로 카운트 금지)

---

## 4. 터치 파일 (예상)

| 파일 | 내용 |
|------|------|
| `src/lib/adminVerifyProfiling.ts` | P0–P5 핵심 |
| `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` | CASE_05 result signals/actions |
| `src/components/cost-check/MasterReviewQuotationReport.tsx` | `case05_deadlineDate` 요약 |
| `tests/qa/admin-verify-strict-full-v2*.mjs` | `specific_date` + R04 경로 시드 |
| `tests/qa/case05-phase1-di-browser.mjs` | 날짜 text (LEVEL 3) |

**단일-writer:** 배치 종료 전 `adminVerifyProfiling.ts` 수정 금지.

---

## 5. VERIFIER 완료 조건 (LOCK)

| # | 조건 | DQ |
|---|------|-----|
| 1 | `specific_date` → `case05_deadlineDate` persist · restore · Profile deadline 문자열 | R01, R02 |
| 2 | 장식 5질문: 값 변경 시 signals 또는 result **2개 이상** 코드 추적 상이 | R07 |
| 3 | **Phase2 실질 축 ≥10** (경로 trace ≥2). 현행 6 + detail 5 = 11 목표 | **R06** |
| 4 | R04 경로: denied/rights_ended/suspended × impact/appeal/what_to_do 에서 `dispositionReason` 노출 | R04 |
| 5 | `submittedDocsDetail` 신규 `other`+note; `doc_other` legacy 읽기 | R03 |
| 6 | `finalGoal` slug 유지 + 값별 result/profile 차등 | R05 |
| 7 | `npx tsc --noEmit` PASS | — |
| 8 | CASE_06 bridge · CASE_03/04 strict 스모크 회귀 | — |
| 9 | LOCK 기준 완화 없음 — ①–④ 개선 방향만 | — |

**UI Mission이면** PC + 375px `06-ui-design-responsive-typography-qa.mdc` (본 Mission은 주로 프로파일·신호·문장; 신규 질문 UI는 text 1건).

---

## 6. 실질 축 카운트 (R06 검증용)

**Phase1 실질 (4):** `dispositionType`, `confirmGoal`, `customerResponse`, `deadline` (+ R01은 동일 축 밀도).

**Phase2 실질 — 구현 후 최소 세트 (11):**  
기존 6 (`factRelationship`, `dispositionReason`, `authorityFollowUp`, `dispositionOutcome`, `repeatFollowUp`, `evidence`)  
+ 실질화 5 (`dispositionDetail`, `factDetail`, `explanationDetail`, `submittedDocsDetail`, `appealDetail`).

`blockage` · `finalGoal` 실질화는 **①④**; 비율은 detail 5로 R06 충족.

**장식 제외:** ②–④ 미통과 질문은 비율·완료 조건에 넣지 않음.

---

## 7. Governance

- PASS 후 선택: Master Skill **Verified Lessons — Admin Master** (별도 Mission, CASE LOCK 절차).
- 본 Brief·STEP2-0과 충돌하는 구현 **금지**. 충돌 발견 시 IMPLEMENTER 중단 → Ace.

---

*2026-09-25. DQ-C05-R01~R07 Ace 전건 승인 LOCK. STEP2-1 구현 지시 SoT.*
