# CASE_06 Phase2 실질화 — STEP2-0 설계 (Remediation)

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **성격** | STEP2-0 설계. **코드 수정 없음.** DQ R01~R05는 2026-09-25 Ace 승인 → `VFBCAI_CASE06_PHASE2_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md` **LOCK**. 구현은 CASE_05 단일-writer 해제 후 |
| **범위** | Admin VERIFY **CASE_06 v1.1 재설계 경로** (`adminVerifyCase06Redesign.ts`). 레거시 5필드는 복원 전용 |
| **금지** | Admin Master 틀 재설계 (Phase1/2 골격, `isCase06BridgedToNativeCase` 순서, 전역 STOP 계약, CASE_07, Q1 변경). 타겟 CASE(`case02_*`~`case05_*`) 질문 skip·값 시드 |
| **SoT 감사** | `docs/master/VFBCAI_CASE06_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **SoT 기준 (LOCK)** | `docs/master/VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (`fa4cce9`) |
| **패턴** | `docs/master/VFBCAI_CASE05_PHASE2_REMEDIATION_STEP2-0_v1.md` §1 (`specific_date` → 날짜 키 + text, 축 +1로 세지 않음) |
| **코드 SoT** | `src/lib/adminVerifyCase06Redesign.ts`, `src/lib/adminVerifyProfiling.ts`, `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` |

---

## 0. 현재 (감사와 동일)

| 구분 | 내용 |
|------|------|
| 현행 1차 | 5필드. 실질 축은 `case06_requiredActionCandidate` **1** (체인 선택) |
| 1차 장식 | `knowledgeSource`, `sourceChannel`, `deadlineActionPair`, `customerResponse` — 다음 질문·결과 문장 불변 |
| 2차 | 체인별 4~6문항. 결과 패널은 `case06_payment*` 등을 **읽지 않음**. 실질 축은 응답 1개 또는 처분 0 |
| 비율 | 납부·출석·보완 **1:1 무조건 FAIL**. 처분 **1:0 무조건 FAIL**. 3:7~4:6 미달 |
| 시드 | `seedCase02AnswersFromCase06Handoff` (~7837–7846)는 answers를 그대로 반환 |

날짜·금액 text는 CASE_05 §3.2와 같이 **기존 질문의 밀도**다. 실질 축 +1이 아니다.

1차 장식 4필드를 결과 분기로 실질화하면 1차 실질이 5가 되고, 2차는 최장 6이라 **5:6**이 된다. 그건 4:6 하한 아래다. 이 STEP2-0은 그 4필드를 새 실질 축으로 올리지 않는다.

---

## 1. 데이터 손실 — CASE_05 `specific_date`와 같은 수정

### 1.1 원인

| 선택 | 위치 | 잃는 값 |
|------|------|---------|
| `deadline_pay_by_date` / `deadline_submit_by_date` / `deadline_attend_by_date` | `CASE06_DEADLINE_ACTION_PAIR_OPTIONS` ~131–136. 질문 push ~735 | 날짜 |
| 레거시 `profileAuthorityGuidance = specific_date` | `CASE06_DEADLINE_PRESENCE_OPTIONS` ~6208–6212. `deriveUnclearSignals` ~6833–6838은 이 slug를 기한 신호에서 제외 | 날짜 |
| `exact_amount_known` | `CASE06_PAYMENT_AMOUNT_KNOWN_OPTIONS` ~157–161. push ~636 | 금액 |
| `date_place_method_known` | `CASE06_ATTENDANCE_NOTICE_DETAIL_OPTIONS` ~205–209. push ~654 | 날짜·장소·방식 |
| `exact_effective_date` | `CASE06_DISPOSITION_EFFECTIVE_DATE_OPTIONS` ~290–294. push ~688 | 발효일 |

완료 판정은 choice만 보면 `other`가 아닐 때 note 없이 통과한다 (`choiceComplete` ~396–407).

### 1.2 키·게이트 (STEP2-1)

| 키 | 게이트 | 질문 삽입 |
|----|--------|-----------|
| `case06_deadlineDate` | 위 세 `deadline_*_by_date` 중 하나이고 날짜 텍스트가 비어 있음 | `appendCase06RedesignPhase1Questions`에서 `case06_deadlineActionPair` 완료 직후, `customerResponse` **앞** (~735) |
| `case06_paymentAmountText` | `case06_paymentAmountKnown === exact_amount_known` | `appendPaymentChain` ~636 직후 |
| `case06_attendanceNoticeText` | `case06_attendanceNoticeDetail === date_place_method_known` | `appendAttendanceChain` ~654 직후 |
| `case06_dispositionEffectiveDateText` | `case06_dispositionEffectiveDate === exact_effective_date` | `appendDispositionChain` ~688 직후 |

입력은 CASE_05 **DQ-C05-R01**과 같이 `kind: "text"`. label 예: 「그 날짜·기한을 적어 주세요.」 금액은 「안내받은 금액을 적어 주세요.」

체인 완료(`isChainPaymentComplete` ~461, 출석 ~480, 처분 ~523)와 1차 완료(`isCase06RedesignPhase1Complete` ~418)는 해당 needs가 참이면 false.

레거시 `specific_date`: v1.1 질문으로 되돌리지 않는다. 복원 세션에 slug만 있고 날짜 키가 없으면 **레거시 경로에서** 같은 `case06_deadlineDate`를 한 번 묻는다. 없으면 기한 「확인됨」으로 결과 문장을 쓰지 않는다 (`deriveUnclearSignals` ~6833).

Persist: `CASE06_V11_PERSIST_ANSWER_KEYS` (~365–369)에 네 text 키. `PHASE1_FIELD_ORDER` / `CHAIN_FIELD_KEYS`의 choice 목록에는 넣지 않는다 (CASE_05가 `PHASE1_FIELD_ORDER`에 날짜 키를 넣지 않은 것과 같음).

### 1.3 계획 diff (적용 안 함)

```diff
--- a/src/lib/adminVerifyCase06Redesign.ts
+++ b/src/lib/adminVerifyCase06Redesign.ts
@@ ~55
 export const CASE06_BRIDGE_TARGET_CASE_KEY = "case06_bridgeTargetCase";
+export const CASE06_DEADLINE_DATE_KEY = "case06_deadlineDate";
+export const CASE06_PAYMENT_AMOUNT_TEXT_KEY = "case06_paymentAmountText";
+export const CASE06_ATTENDANCE_NOTICE_TEXT_KEY = "case06_attendanceNoticeText";
+export const CASE06_DISPOSITION_EFFECTIVE_DATE_TEXT_KEY = "case06_dispositionEffectiveDateText";

@@ CASE06_V11_PERSIST_ANSWER_KEYS (~365)
   ...CASE06_V11_ANSWER_NOTE_KEYS,
+  CASE06_DEADLINE_DATE_KEY,
+  CASE06_PAYMENT_AMOUNT_TEXT_KEY,
+  CASE06_ATTENDANCE_NOTICE_TEXT_KEY,
+  CASE06_DISPOSITION_EFFECTIVE_DATE_TEXT_KEY,

@@ isCase06RedesignPhase1Complete (~418)
+  if (case06NeedsDeadlineDate(answers)) return false;

@@ appendCase06RedesignPhase1Questions, after deadlineActionPair (~735)
+  if (case06NeedsDeadlineDate(answers)) { push text case06_deadlineDate; return; }

@@ isChainPaymentComplete (~461)
+  if (case06NeedsPaymentAmountText(answers)) return false;
@@ appendPaymentChain (~636)
+  if (case06NeedsPaymentAmountText) { push text; return; }

@@ isChainAttendanceComplete / appendAttendanceChain (~480, ~654)
+  date_place_method_known → case06_attendanceNoticeText

@@ isChainDispositionComplete / appendDispositionChain (~523, ~688)
+  exact_effective_date → case06_dispositionEffectiveDateText
```

```diff
--- a/src/lib/adminVerifyProfiling.ts
+++ b/src/lib/adminVerifyProfiling.ts
@@ deriveUnclearSignals (~6833)
-  not_stated | uncertain | past_possible 만 UNCLEAR_DEADLINE
+  specific_date 이고 case06_deadlineDate 없음 → UNCLEAR_DEADLINE
+  날짜 문자열이 있으면 그 신호를 만들지 않음

@@ seedCase02AnswersFromCase06Handoff (~7837)
   (변경 없음 — 타겟 키 시드 금지)
```

```diff
--- a/src/components/cost-check/AdminVerifyFirstResultPanel.tsx
+++ b/src/components/cost-check/AdminVerifyFirstResultPanel.tsx
@@ case06 legacy hooks (~288, ~309)
+  v1.1 체인 선택값·날짜/금액 문자열이 있을 때만 CASE_06 결과 문장에 그 문자열을 넣음
+  slug만으로 「기한 확인됨」「금액 확인됨」을 쓰지 않음
```

`MasterReviewQuotationReport.tsx` 선택 요약: CASE_01/05와 같이 해당 choice가 날짜·금액 slug이면 text 키를 짧게 표시. 줄 번호는 STEP2-1에서 choice 요약 분기를 다시 찍는다.

---

## 2. 실질 축 — 3:7~4:6

LOCK: 실질 축 = ②~④를 통과한 질문. 하한 1차:2차 = **3:7~4:6**. 2차가 더 적어도 그 비보다 얕으면 FAIL. 상한은 없다.

1차 실질은 **1** (`requiredActionCandidate`)로 고정한다. 그러면 3:7은 2차 실질 **≥3**, 4:6은 **≥2**다. 목표은 CASE_05가 고른 쪽과 같이 **3:7**이다.

### 2.1 납부·출석·보완 (지금 1:1)

이미 있는 2차 문항을 Profile 칸·신호·결과 문장에 연결한다. 질문 id는 추가하지 않는다. 선택값이 바뀌면 **다음 조건 또는 결과 문장 중 결과 문장은 반드시** 달라지게 한다. 지금은 결과 문장이 안 달라서 ②가 실패한다.

| 체인 | 실질화할 기존 id | 실질 축 (1차:2차) |
|------|------------------|-------------------|
| 납부 | `paymentNature`, `paymentAmountKnown`, `paymentSituationMatch`, `paymentAuthorityCheck`, `paymentResponse`, (조건부) `paymentNonPaymentNotice` | 1:5 또는 1:6 |
| 출석 | `attendanceSubject`, `attendanceFactMatch`, `attendanceNoticeDetail`, `attendanceResponse`, (조건부) `attendanceAuthorityReaction` | 1:4 또는 1:5 |
| 보완 | `submissionRequirement`, `submissionReason`, `submissionRelation`, `submissionResponse`, `submissionAuthorityReaction`, (조건부) `submissionEvidence` | 1:5 또는 1:6 |

각 값은 `appendCase06Phase2ResultSignals` (신규, 결과 패널)에서 서로 다른 주의·행동 한 줄을 만든다. 조건부 문항은 지금처럼 `case06Needs*` (~438–450)가 연다. STOP 함수 이름 `isCase06Phase2ChainComplete`는 유지하고, 본문만 text 게이트를 포함한다.

1:4는 3:7(약 1:2.33)보다 2차가 깊다. 하한 통과다.

### 2.2 처분 (지금 1:0)

처분 4문항은 조건 분기가 없고 결과도 안 읽는다. 네 id를 전부 2.1과 같이 결과·신호에 연결하면 2차 실질 **4**다. 비는 **1:4**. 3:7 하한을 넘는다. 질문 추가 없이 된다.

| id | 연결 |
|----|------|
| `case06_dispositionTypeCandidate` | 처분 종류별 결과 첫 문장 |
| `case06_dispositionReason` | 사유 주의 문장 |
| `case06_dispositionFactMatch` | 일치/불일치 미확인 |
| `case06_dispositionEffectiveDate` | 발효 상태. `exact_effective_date`는 §1 날짜 문자열일 때만 「발효일: …」 |
| `case06_dispositionResponse` | 대응 상태 문장 |

---

## 3. 원칙 F — 재분류 힌트는 넘기고, 사실값은 시드하지 않음

CASE_06은 bridge다. 이 설계는 bridge 순서와 「타겟 고유 질문은 생략하지 않음」을 유지한다.

`exactSource` / `keyPhrase` / `requiredAction` / `receiptPath` / `actualCore`는 v1.1이 묻지 않는다. 재분류 맵에 있는 것은 `requiredAction`·`actualCore`뿐이다. 시드 함수는 어떤 필드도 `case0N_*`에 쓰지 않는다.

### 3.1 넘길 것 (상태)

브릿지 커밋 후 타겟 질문 화면·1차 결과에 **읽기 전용** 줄만 붙인다. 타겟 answer 키는 그대로다.

| 상태 줄 | 출처 | 타겟에 쓰지 않는 것 |
|---------|------|---------------------|
| 재분류된 CASE | `case06_bridgeTargetCase` (이미 있음) | 타겟 Q1을 이 값으로 확정 저장하지 않음. Q1은 타겟이 다시 묻거나, 기존 Q1=`CASE_06` 유지 + effective case는 지금 게이트 |
| 고객이 들은 요구 | `case06_requiredActionCandidate` 라벨 | `case02_paymentSubject` 등에 복사 금지 |
| 날짜·금액·발효일 원문 | §1 text 키 | 타겟 `*_deadline` / 금액 필드에 복사 금지. 타겟은 자기 기한·금액 질문을 처음부터 진행 |
| 레거시 5필드 | 복원 세션에 키가 있을 때만 각 1줄 | 질문 부활·시드·skip 금지 |

타겟 Phase1 `caseNNPathFieldsComplete`와 `isCase06BridgedToNativeCase`의 「Phase1 선행」은 수정하지 않는다.

### 3.2 넘기지 말 것

- 체인 slug를 타겟 선택값으로 변환하는 매핑 표
- `seedCase02AnswersFromCase06Handoff`에 대입문 추가
- 다섯 레거시 필드를 v1.1 2차 체인에 다시 넣는 것

---

## 4. 틀 밖 (하지 않음)

- `getEffectiveAdminVerifyCase` / Q1 / CASE_01~05 질문 순서
- 전역 `isAdminVerifyPhase2PathComplete`의 CASE_06 분기 구조 (내부 `isCase06Phase2ChainComplete` 조건만 text 게이트 추가)
- Unclear 서비스 `/verify/unclear`
- 1차 4장식 필드를 실질 축으로 승격 (비율이 5:6으로 깨짐)

---

## 5. DESIGN QUESTIONS (승인 전 구현 없음)

형식은 CASE_05 R01~R07과 같다. **2026-09-25 Ace 승인 LOCK:** R01=A, R02=A, R03=C, R04=A, R05=A. 구현 SoT는 Mission Brief. 본 절 옵션은 결정 기록으로 유지한다.

### DQ-C06-R01 — 날짜·금액 입력 컨트롤

**문제.** `deadline_*_by_date`, `exact_amount_known`, `date_place_method_known`, `exact_effective_date`는 slug만 저장한다. CASE_05 `specific_date`와 같이 값 칸이 없다.

**옵션.**

| | 내용 |
|--|------|
| **A (권장)** | `kind: "text"`. CASE_01 `case01_deadlineDate` · CASE_05 R01과 같음. 질문 렌더를 그대로 쓴다 |
| B | `<input type="date">` / 금액 전용 숫자 칸. Master 질문 렌더에 새 컨트롤 |

**권장 A.** date picker는 STEP2-1 밖이다.

### DQ-C06-R02 — 1차 장식 4필드를 실질 축으로 올릴지

**문제.** `knowledgeSource`, `sourceChannel`, `deadlineActionPair`, `customerResponse`는 체인·결과 문장을 바꾸지 않아 감사에서 장식이다. 결과 분기를 넣으면 ②~④를 통과해 **1차 실질 축이 1에서 5**가 된다. 2차 최장 6이면 비는 **5:6**이라 4:6 하한 FAIL이다.

**옵션.**

| | 내용 |
|--|------|
| **A (권장)** | 이번 미션에서 결과 분기 **없음**. 답은 저장만. `deadlineActionPair`의 날짜 text(§1)는 같은 질문의 밀도이고 축 +1이 아니다 (CASE_05 §3.2) |
| B | 4필드 모두 결과 문장을 갈라 실질 축으로 센다. 그러면 2차 질문을 더 추가해야 3:7이 된다 |

**권장 A.**

### DQ-C06-R03 — 상태 줄을 화면에 어디에 둘지

**문제.** 원칙 F상 타겟 `case0N_*`에는 쓰지 않는다. 고객이 CASE_06에서 말한 요구·날짜·금액은 타겟 질문을 건너뛰지 않는 읽기 전용 줄로만 남긴다. 위치를 정해야 한다.

줄 내용(공통, 최대 4줄, 값 없으면 그 줄 생략):

1. 「앞서 분류: 납부 / 출석 / 보완 / 처분」( `case06_bridgeTargetCase` 라벨 )
2. 「문서에서 들은 요구: …」( `requiredActionCandidate` 라벨 )
3. 「적어 둔 날짜·기한: …」 / 「적어 둔 금액: …」(§1 text. 있을 때만)
4. 레거시 5필드가 복원돼 있으면 필드당 1줄. 없으면 생략

**옵션.**

| | 화면 | 동작 |
|--|------|------|
| A | 타겟 **질문 화면만** | `MasterReviewQuotationReport`에서 타겟 Phase1 첫 질문 **위**에 L5 보조 블록. 1차 결과에는 없음. 질문 중에는 보이지만 결과 요약에는 안 남음 |
| B | 타겟 **1차 결과만** | `AdminVerifyFirstResultPanel` 상황 요약 맨 위. 질문 중에는 안 보임. 고객은 타겟 질문을 다 한 뒤에야 CASE_06에서 말한 내용을 다시 봄 |
| **C (권장)** | **둘 다, 같은 문장** | 질문 중: 첫 타겟 질문 위 L5. 1차 결과: 상황 요약 첫 단락 위 같은 줄. 선택 카드·answer 키 아님. 질문 rail CTA는 그대로 숨김 |

**권장 C.** A는 결과가 그 사실을 잃고, B는 질문 중에 앞선 말이 사라진다. C도 타겟 질문은 처음부터 진행한다.

### DQ-C06-R04 — 레거시 `specific_date`만 있는 세션

**문제.** 예전 `profileAuthorityGuidance = specific_date`는 날짜 키가 없다. `deriveUnclearSignals`는 이 slug를 기한 불명으로도 안 본다. 결과 문구가 「기한 확인됨」이 되면 없는 날짜를 있는 것처럼 말한다.

**옵션.**

| | 내용 |
|--|------|
| **A (권장)** | v1.1로 승격하지 않음. 레거시 복원이고 slug만 있으면 `case06_deadlineDate` text를 **한 번** 묻는다. 비어 있으면 「기한 확인됨」 문장 금지 |
| B | 재질문 없음. slug를 모르는 기한으로만 표시 |

**권장 A.** CASE_05 R02(날짜 없으면 다시 입력)와 같다. 자동 backfill 없음.

### DQ-C06-R05 — `signal_violation` 조기 STOP

**문제.** 불명확 체인(5)에서 재확인 답이 `signal_violation`(「위반·문제 언급」)이면 2차가 그 질문에서 끝난다.

코드:

- `appendUnclearChain` ~705–707: 이 값이면 `return`
- 그 다음 ~708–714는 `signal_payment` 등을 납부·출석·보완·처분 체인으로 넘긴 뒤 `return`. `signal_violation`은 맵상 체인 5라, **앞의 return을 지워도** 이 블록이 다시 `return` 한다. 사실관계·대응 질문은 여전히 안 열린다
- `isChainUnclearExpertComplete` ~542–544: 이 값이면 추가 질문 없이 **완료 true**. expert terminal 플래그도 요구하지 않음

**이 경로만의 조건.** 1차가 `problem_action_unclear` 또는 `other`라 체인 5로 들어온 뒤, 재확인에서 `signal_violation`을 고른 경우. 1차 실질 1, 2차 실질 1 → **1차 = 2차 무조건 FAIL**.

**영향 없는 경로 (제거해도 질문 구성이 그대로).**

- 1차 `pay_demand` / `attend_explain` / `submit_supplement` / `disposition_notice` → 체인 1~4. `appendUnclearChain`을 타지 않음
- 재확인 `signal_payment` / `signal_attendance` / `signal_submission` / `signal_disposition` → 해당 체인으로 전환 후 그 체인 STOP. §2 실질화 대상
- 재확인 `other` → 이미 `unclearFactRelation` + `unclearResponse` 후 expert terminal

**옵션.**

| | STOP | 비율 |
|--|------|------|
| **A (권장)** | `signal_violation` 전용 조기 `return`과, 체인 전환 블록이 체인 5를 끝내 버리는 `return`을 함께 고친다. 이어서 기존 두 질문을 연다: `unclearFactRelation`, `unclearResponse`. §2와 같이 값마다 결과 문장이 갈라져야 실질 축이다. 2차 실질 3 → **1:3**. 3:7(약 1:2.33)보다 2차가 깊다. 전역 `isAdminVerifyPhase2PathComplete` 구조는 그대로이고, `isCase06Phase2ChainComplete`가 이 두 답 다음에 true가 된다. **CASE_01로 재분류하거나 타겟 질문을 건너뛰지 않음.** expert terminal(미해결·전문가 연결)은 두 질문 **다음**에만 둔다. 지금은 질문 없이 완료된다 |
| B | 조기 STOP 유지 | 납부·출석·보완·처분은 §2로 하한을 맞출 수 있다. **이 한 경로만** 1:1 FAIL로 남는다. 새 질문 id는 없다 |

**권장 A.** B를 고르면 그 경로의 정보 완전성 FAIL은 이번 리메디에이션에서 닫히지 않는다. A는 질문 id를 새로 만들지 않고, 이미 있는 두 질문을 이 slug에도 연다.

---

## 6. STEP2-1 착수 조건

1. §5 DQ 승인  
2. 터치: `adminVerifyCase06Redesign.ts`, `adminVerifyProfiling.ts` (신호·시드 함수는 시드 추가 없이 신호만), `AdminVerifyFirstResultPanel.tsx`, 요약이 필요하면 `MasterReviewQuotationReport.tsx`  
3. 완료 판정: 네 text 키가 해당 slug에서만 필수, 타겟 `case0N_*` diff 없음, 납부·출석·보완·처분 각 1경로에서 2차 실질 ≥3, `signal_violation`은 R05 승인 시에만 ≥3  
4. `npx tsc --noEmit`. harness가 옛 slug만 보면 제품이 맞게 harness를 고친다  

---

*2026-09-25. DQ R01=A, R02=A, R03=C, R04=A, R05=A 승인. 구현 SoT는 STEP2-1 Mission Brief. 코드 미착수. LOCK 재해석 없음.*
