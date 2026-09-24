# CASE_06 Phase2 실질화 — STEP2-1 Mission Brief (LOCK)

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **LOCK** — Ace 승인 2026-09-25. IMPLEMENTER 착수 조건: 1번창 CASE_05 STEP2-1 종료 + `adminVerifyProfiling.ts` 단일-writer 해제. **본 문서 작성 시점 코드 미착수** |
| **Mission** | CASE_06 v1.1 Phase2 **정보완결성 실질화** (날짜·금액 저장 + 체인 downstream + `signal_violation` 조기 STOP 해제) |
| **설계 SoT** | `VFBCAI_CASE06_PHASE2_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_CASE06_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준 (LOCK)** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` |
| **헌법** | `docs/VFBCAI_CONSTITUTION.md` §16.6 |
| **질문 MASTER** | `VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` § CASE_06 · `VFBCAI_CASE06_DESIGN_DECISIONS_v1.1.md` |

**코드 미착수 (본 문서 작성 시점).** 구현은 이 Brief + STEP2-0만 따른다. DQ는 아래 §1에 **재오픈 금지**.

---

## 0. Mission 한 줄

`deadline_*_by_date` · `exact_amount_known` · `date_place_method_known` · `exact_effective_date` 값 저장, 납부·출석·보완·처분 기존 질문 downstream 실질화, 원칙 F 읽기 전용 상태 줄, 레거시 `specific_date` 한 번 재질문, **`signal_violation` 조기 STOP 제거 후 기존 두 질문** — Admin Master 틀·전역 STOP 계약·bridge 순서·타겟 질문 skip **변경 없음**.

---

## 1. DESIGN QUESTIONS — Ace 승인 LOCK

| ID | 결정 | 구현 요약 |
|----|------|-----------|
| **R01** | **A** | 네 값 모두 `kind: "text"`. date picker·금액 숫자 칸 없음. CASE_05 R01 · CASE_01 `case01_deadlineDate` 동형 |
| **R02** | **A** | `knowledgeSource` · `sourceChannel` · `deadlineActionPair` · `customerResponse`는 결과 분기 **없음**. 1차 실질 축은 `requiredActionCandidate` **1** 고정. 날짜 text는 같은 질문의 밀도 (축 +1 아님) |
| **R03** | **C** | 상태 줄은 타겟 **질문 화면**(첫 Phase1 질문 위 L5) **과** 타겟 **1차 결과**(상황 요약 첫 단락 위) **같은 문장**. `case0N_*` 미기입. rail CTA 정책 유지 |
| **R04** | **A** | 레거시 `profileAuthorityGuidance = specific_date`이고 날짜 키가 없으면 `case06_deadlineDate`를 **한 번** 묻는다. 비어 있으면 「기한 확인됨」 금지. 자동 backfill 없음 |
| **R05** | **A** | `signal_violation` 전용 조기 `return`과, 체인 5를 끝내 버리는 다음 `return`을 **함께** 제거. 기존 `unclearFactRelation` · `unclearResponse`를 연다. 값마다 결과 문장 분기. expert terminal은 그 **다음**. CASE_01 재분류·타겟 skip 없음. 전역 `isAdminVerifyPhase2PathComplete` 구조 유지 |

---

## 2. IMPLEMENTER — 필수 구현 (STEP2-0 매핑)

착수 전 `adminVerifyCase06Redesign.ts` 줄 번호를 다시 찍는다. 아래 `~`는 STEP2-0 작성 시점이다.

### 2.1 P0 — 날짜·금액 text (R01, R04)

**파일:** `src/lib/adminVerifyCase06Redesign.ts`

| 키 | 게이트 |
|----|--------|
| `case06_deadlineDate` | `deadline_pay_by_date` / `deadline_submit_by_date` / `deadline_attend_by_date` 이고 텍스트가 빔 |
| `case06_paymentAmountText` | `case06_paymentAmountKnown === exact_amount_known` |
| `case06_attendanceNoticeText` | `case06_attendanceNoticeDetail === date_place_method_known` |
| `case06_dispositionEffectiveDateText` | `case06_dispositionEffectiveDate === exact_effective_date` |

- 삽입: deadline은 `customerResponse` **앞**. 금액·출석 안내·발효일은 해당 choice 직후.
- `isCase06RedesignPhase1Complete` · `isChainPaymentComplete` · `isChainAttendanceComplete` · `isChainDispositionComplete`는 needs가 참이면 false.
- Persist: `CASE06_V11_PERSIST_ANSWER_KEYS`만. `PHASE1_FIELD_ORDER` / `CHAIN_FIELD_KEYS` choice 목록에는 넣지 않음.
- 레거시 복원 경로: slug `specific_date`만 있으면 같은 `case06_deadlineDate` 1회 (R04).
- `deriveUnclearSignals`: `specific_date`이고 날짜 문자열 없음 → `UNCLEAR_DEADLINE`. 문자열이 있으면 그 신호를 만들지 않음. slug만으로 「기한 확인됨」「금액 확인됨」 금지.
- `seedCase02AnswersFromCase06Handoff`: **변경 없음** (시드 금지).

### 2.2 P1 — 체인 downstream 실질화 (R02와 함께)

1차 실질은 **1**로 유지. 아래 기존 id만 Profile · signals · result 문장에 연결. **질문 id 추가 없음.** 선택값이 바뀌면 결과 문장이 달라야 한다.

| 체인 | 기존 id | 목표 비 (1차:2차) |
|------|---------|-------------------|
| 납부 | `paymentNature`, `paymentAmountKnown`, `paymentSituationMatch`, `paymentAuthorityCheck`, `paymentResponse`, (조건부) `paymentNonPaymentNotice` | 1:5 또는 1:6 |
| 출석 | `attendanceSubject`, `attendanceFactMatch`, `attendanceNoticeDetail`, `attendanceResponse`, (조건부) `attendanceAuthorityReaction` | 1:4 또는 1:5 |
| 보완 | `submissionRequirement`, `submissionReason`, `submissionRelation`, `submissionResponse`, `submissionAuthorityReaction`, (조건부) `submissionEvidence` | 1:5 또는 1:6 |
| 처분 | `dispositionTypeCandidate`, `dispositionReason`, `dispositionFactMatch`, `dispositionEffectiveDate`, `dispositionResponse` | 1:4 |

조건부 문항은 기존 `case06Needs*`가 연다. `exact_effective_date` 결과의 「발효일: …」은 §2.1 문자열이 있을 때만.

### 2.3 P2 — 원칙 F 상태 줄 (R03=C)

읽기 전용. 값 없으면 그 줄 생략. 최대 구성:

1. 「앞서 분류: 납부 / 출석 / 보완 / 처분」 — `case06_bridgeTargetCase`
2. 「문서에서 들은 요구: …」 — `requiredActionCandidate` 라벨
3. 「적어 둔 날짜·기한: …」 / 「적어 둔 금액: …」 — §2.1 text
4. 레거시 5필드가 복원돼 있을 때만 필드당 1줄

**위치:** `MasterReviewQuotationReport` 타겟 Phase1 첫 질문 위 L5 **그리고** `AdminVerifyFirstResultPanel` 상황 요약 첫 단락 위. 문장은 같다. 타겟 `case02_*`~`case05_*`에 쓰지 않음. 타겟 Phase1은 처음부터. `isCase06BridgedToNativeCase`의 Phase1 선행 게이트 유지.

### 2.4 P3 — `signal_violation` (R05=A)

**파일:** `src/lib/adminVerifyCase06Redesign.ts`

- `appendUnclearChain`: `signal_violation` 즉시 `return` 제거.
- 그 다음 재확인→체인 전환 블록이 **체인 5(`signal_violation`)에서도 `return`하면** 사실관계·대응이 열리지 않는다. 체인 5는 전환으로 끝내지 않고 `unclearFactRelation` → `unclearResponse`를 연다.
- `isChainUnclearExpertComplete`: `signal_violation`만으로 true 금지. 두 답이 있고, expert terminal은 그 **다음**.
- `signal_payment` / `signal_attendance` / `signal_submission` / `signal_disposition`의 체인 1~4 전환은 유지.
- 1차 `pay_demand` / `attend_explain` / `submit_supplement` / `disposition_notice`는 이 함수를 타지 않음.
- 두 질문은 값마다 결과 문장 분기 (2차 실질 3 → **1:3**). CASE_01로 재분류하지 않음.

### 2.5 P4 — 결과 패널

`AdminVerifyFirstResultPanel`: v1.1 체인 선택값·날짜/금액 문자열이 있을 때만 CASE_06 문장에 넣음. slug만으로 확인 문장 금지.

`MasterReviewQuotationReport`: 해당 choice가 날짜·금액 slug이면 text 키를 짧게 표시.

---

## 3. 금지 (Human Boundary)

- Admin Master 틀: Q1, `getEffectiveAdminVerifyCase`, CASE_01~05 질문 순서, CASE_07
- `isCase06BridgedToNativeCase` 순서 · 타겟 Phase1 선행 게이트
- 전역 `isAdminVerifyPhase2PathComplete`의 CASE_06 **분기 구조** (완료 판정식 본문만)
- `seedCase02AnswersFromCase06Handoff`에 `case0N_*` 대입
- 레거시 `exactSource` / `keyPhrase` / `requiredAction` / `receiptPath` / `actualCore`를 v1.1 질문으로 부활
- 1차 장식 4필드를 실질 축으로 승격 (R02=A. 올리면 1차 5 vs 2차 최장 6 = 5:6 FAIL)
- `/verify/unclear`
- LOCK 감사 기준 ①–⑤ **완화·재해석**
- 형식적 질문만 추가해 비율 채우기 (실질 축은 ②–④ 통과 질문만)
- **착수 전** `adminVerifyProfiling.ts` 수정 (CASE_05 STEP2-1 단일-writer)

---

## 4. 터치 파일 (예상)

| 파일 | 내용 |
|------|------|
| `src/lib/adminVerifyCase06Redesign.ts` | P0 text 게이트, P1은 질문 정의 유지, P3 STOP 본문 |
| `src/lib/adminVerifyProfiling.ts` | `deriveUnclearSignals`만. 시드 함수는 대입 추가 금지. **CASE_05 writer 해제 후** |
| `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` | CASE_06 문장 + R03 결과 상태 줄 |
| `src/components/cost-check/MasterReviewQuotationReport.tsx` | text 요약 + R03 질문 위 L5 |

harness가 옛 slug만 보면 제품이 맞게 harness를 고친다. 제품 로직을 harness에 맞추지 않음.

**단일-writer:** CASE_05 STEP2-1이 `adminVerifyProfiling.ts`를 끝낼 때까지 이 파일 수정 금지. CASE_06 전용 `adminVerifyCase06Redesign.ts`도 본 Brief 착수 지시 전에는 수정하지 않음.

---

## 5. VERIFIER 완료 조건 (LOCK)

| # | 조건 | DQ |
|---|------|-----|
| 1 | 네 text 키가 해당 slug에서만 필수 · persist · restore. date picker 없음 | R01 |
| 2 | 1차 실질 축은 `requiredActionCandidate` 1. 장식 4필드는 결과 분기 없음 | R02 |
| 3 | 상태 줄이 타겟 질문 화면과 1차 결과에 같은 문장. `case02_*`~`case05_*` diff 없음. 타겟 Phase1은 처음부터 | R03 |
| 4 | 레거시 `specific_date`만 있으면 날짜 text 1회. 빈 값으로 「기한 확인됨」 없음 | R04 |
| 5 | `signal_violation` 경로에서 `unclearFactRelation` · `unclearResponse` 노출 후 expert terminal. 체인 1~4 조기 종료 없음. 2차 실질 3 (1:3) | R05 |
| 6 | 납부·출석·보완·처분 각 1경로: 값 변경 시 result 문장 상이, 2차 실질 ≥3 (처분 4) | §2.2 |
| 7 | `npx tsc --noEmit` PASS | — |
| 8 | CASE_05 · CASE_02~04 strict 스모크 회귀 (bridge 순서·시드 없음) | — |
| 9 | LOCK 기준 완화 없음. 1차=2차 · 1차>2차 경로가 구현 후에도 남아 있으면 FAIL | — |

**UI:** R03 L5와 text 입력. PC + 375px `06-ui-design-responsive-typography-qa.mdc`. 질문 rail CTA는 숨김 유지.

---

## 6. 실질 축 카운트 (검증용)

**Phase1 실질 (1):** `requiredActionCandidate`만. R01 날짜 text · R02 장식 4필드는 비율에 넣지 않음.

**Phase2 실질 — 구현 후 (경로별, 3:7 하한 = 2차 ≥3):**

| 경로 | 실질 축 | 비 |
|------|---------|-----|
| 납부 | 5 또는 6 | 1:5 / 1:6 |
| 출석 | 4 또는 5 | 1:4 / 1:5 |
| 보완 | 5 또는 6 | 1:5 / 1:6 |
| 처분 | 4 | 1:4 |
| 불명확 + `signal_violation` | `recheck` + `unclearFactRelation` + `unclearResponse` = 3 | 1:3 |
| 불명확 + `other` | 기존 사실관계·대응 (실질화 포함) | 2차 ≥3 |

1:4와 1:3은 3:7(약 1:2.33)보다 2차가 깊다.

**장식 제외:** ②–④ 미통과 질문은 비율·완료 조건에 넣지 않음.

---

## 7. Governance

- PASS 후 선택: Master Skill **Verified Lessons — Admin Master** (별도 Mission, CASE LOCK 절차).
- 본 Brief·STEP2-0과 충돌하는 구현 **금지**. 충돌 발견 시 IMPLEMENTER 중단 → Ace.
- **지금 착수 금지.** 1번창 CASE_05 STEP2-1이 끝난 뒤 Ace가 CASE_06 STEP2-1을 지시한다.

---

*2026-09-25. DQ-C06-R01~R05 Ace 전건 승인 LOCK (R01=A, R02=A, R03=C, R04=A, R05=A). STEP2-1 구현 지시 SoT. 코드 미착수.*
