# CASE_01 / CASE_02 — 재사용 패턴 역감사 기술 부채 백로그 v1

| 항목 | 내용 |
|------|------|
| **상태** | **LOCK 유지. 재작업 안 함.** |
| **성격** | 조사 기록. 이 문서 작성 시 제품 코드는 수정하지 않음 |
| **기준** | `VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` §1–§8 |
| **SoT** | `src/lib/adminVerifyProfiling.ts` (조사 시점 작업 트리). CASE_02는 이미 LOCK |
| **확정 수정** | CASE_01 bridge Phase1 선행 게이트 **한 건만** 수정 대상. 적용은 하지 않음. 하단 「적용 보류 diff」 |
| **보류** | 그 외 §7 / §8 / §1–§6 발견은 전부 백로그. CASE_03/04/05 작업에 섞지 않음 |

조사일: 2026-09-24. Ace 결정: bridge 게이트만 확정, 나머지 보류.

---

## 0. 결정

1. **지금 수정 대상으로 확정한 것:** `appendCase01PathQuestions`에 `isCase06BridgedToNativeCase(answers, "CASE_01")` + `isCase01Phase1Complete` 게이트가 없다. CASE_03/04/05와 같은 형태로 넣는다. **이 문서에서는 diff안만 적고, 코드에 적용하지 않는다.** 1번 창이 CASE_03/04 수정을 실행할 때 함께 적용한다.
2. **보류 (재작업 안 함):** 아래 §7 레거시 slug, §8 옵션 수, DI 요약·완료 조건, CASE_02 고객 문장 시드, CASE_02 bridge 조건 함수 차이, FOCUS에 없는 텍스트 후속, QA 시드, confirmGoal 문장. LOCK을 열지 않는다.

---

## 1. §7 레거시 필드

두 CASE 모두 CASE_04/05형 `actualCore`처럼 **KEYS·FOCUS에만 있고 질문이 없는 slug는 없다.** `CASE01_ANSWER_KEYS` 15개, `CASE02_ANSWER_KEYS` 16개는 `appendCase01*` / `appendCase02*`가 만든다.

### 1.1 CASE_01 — 질문은 있는데 KEYS·FOCUS에 없는 텍스트

| 키 | 노출 | KEYS | FOCUS |
|--|--|--|--|
| `case01_factDifferenceDetail` | Phase2 텍스트 | 없음 | 없음 |
| `case01_datePlaceDetail` | Phase2 텍스트 | 없음 | 없음 |
| `case01_deadlineDate` | Phase2 텍스트 | 없음 | 없음 |
| `case01_authorityDemandNote` | DI note이면서, 요구가 불명확하면 Phase2 텍스트 질문 id | 없음 | 없음 |
| `case01_factRelationshipNote` | DI note이면서, `factRelationship === "unknown"`이면 Phase2 텍스트 | 없음 | 없음 |
| `case01_authorityResponseNote` | DI note이면서 `more_required` / `no_reply_yet` / `other` 후속 텍스트 | 없음 | 없음 |

`case01PathFieldsComplete`는 이 텍스트를 `needs*`로 검사한다. `CASE01_FOCUS_ORDER`와 `selectCase01ResolutionFocus`는 검사하지 않는다. 선택지가 채워지고 텍스트만 비면 pathComplete와 nextFocus가 갈라질 수 있다. 체크리스트 §5가 금지하는 조합이다. **보류.**

`case01_factRelationshipNote`와 `case01_authorityDemandNote`는 공식 DI note 키(`getAdminChoiceNoteKey`)와 Phase2 자유 입력이 같은 칸을 쓴다. 새 orphan slug는 아니고, DI와 후속 질문이 한 키를 공유한다. **보류.**

### 1.2 CASE_01 — 현재 옵션에 없는 slug가 분기·시드에 남음

`CASE01_OPTION_LABELS`의 읽기 전용 라벨 중 일부는 표시만이 아니다.

- `verify_payment`: confirmGoal 옵션에 없음. `classifyFromCase01Answers`, `shouldActivateCase02Path`, QA 시드 `runCaseReclassificationHandoffQaScenario`가 이 값을 본다.
- `explained_unresolved` 등 `CASE01_LEGACY_CUSTOMER_RESPONDED_ACTION_VALUES`: 대응 상세·기관 반응 `needs*`를 연다.
- `info_mismatch` / `mismatch` / `partial`: 사실 차이 텍스트를 연다. 현재 fact 옵션에는 없다.
- `normalizeCase01Blockage` / `normalizeCase01FinalGoal`: `facts_why`, `situation_fit` 등을 다른 canonical로 바꾼다. 화면 옵션과 프로파일 값이 다르다.

**보류.** 옵션으로 되돌리거나 restore에서 지우지 않는다.

### 1.3 CASE_02 — 읽기 맵은 유지, 죽은 goal slug는 분기

금액·미납 안내는 읽기 전용 정규화다. 질문은 canonical만 낸다.

- `stated_uncertain` · `amount_calc_unclear` → `amount_stated_basis_unclear`
- `penalty_stated` · `enforcement_stated` → `sanction_enforcement_stated`

아직 분기하는 퇴역 slug:

- `why_pay`: confirmGoal 옵션에 없음. `case02NeedsDeadlinePhase2`, `case02NeedsPaymentBasisPhase2`, `case02NeedsSituationMatchPhase2`가 이 값이면 Phase2를 연다. QA 시나리오 C가 `case02_confirmGoal: "why_pay"`.
- `attendance_related` / `supplement_related` / `disposition_related`: 납부 대상 옵션에 없음. `classifyFromCase02Answers`는 복원 값이 있으면 CASE_03/04/05로 나간다.
- `reason_unclear`: 금액 옵션에 없음. `case02NeedsEvidence`가 이 값이면 증빙 질문을 연다.

restore는 이 키를 지우지 않는다. **보류.**

`CASE02_OPTION_LABELS` 끝의 `other: "위에 없는 다른 부분에서 막혀 있습니다"`는 이 맵에서 공식 DI 라벨을 덮어쓴다. 필드 옵션 조회가 먼저라 질문 카드 문구는 유지되고, 맵 fallback만 짧은 문장으로 간다. **보류.**

---

## 2. §8 옵션 수 + DI

공식 DI(`ADMIN_DIRECT_EXPLAIN_CHOICE`)가 없는 선택 필드는 없다. 번호 그리드에서 DI를 빼고 하단에 한 번 그리는 함수는 `renderAdminClassifiedChoiceQuestion`이다. CASE_01은 `case01_` 분기, CASE_02는 `case02_` 분기가 그 함수로 들어간다.

내용 선택지가 4개 미만인 필드:

| CASE | 필드 | 내용 수 | DI | 판정 |
|--|--|--|--|--|
| 01 | `customerResponded` | 2 (`none`, `has_responded`) | 있음 | **§8 미달. 보류** |
| 01 | `authorityDemandDetail` | 3 | 있음 | **§8 미달. 보류** |
| 02 | `nonPaymentNotice` | 3 | 있음 | **§8 미달. 보류** — `penalty_stated`와 `enforcement_stated`를 한 칸으로 합친 결과 |
| 02 | `demandAuthority`, `paymentAmount`, `paymentBasis`, `paymentMethod`, `evidence`, `finalGoal` | 4 | 있음 | 하한 충족. 변경 없음 |
| 02 | `authorityResponse` | 5 | 있음 | CASE_01 옵션 배열 재사용. 변경 없음 |

CASE_02 Phase2의 `authorityResponse` · `paymentMethod` · `nonPaymentNotice`는 완료 판정이 `isAdminVerifyChoiceFieldComplete`가 아니라 값 존재만 본다. `other`인데 note가 없어도 STOP을 통과할 수 있다. **보류.**

그 외 조사된 선택 필드는 내용 4~5개 + DI다. CASE_01: confirmGoal, violationContent, actualSituation, factRelationship, authorityDemand, paymentDemandScope(4), supplementDemandScope(4), responseDetail(4), authorityResponse, deadline, blockage, evidence, finalGoal. CASE_02: confirmGoal, paymentInfoSource, paymentSubject, situationMatch, paymentStatus, deadline, blockage.

---

## 3. §1–§6 (bridge 게이트 제외 항목은 보류)

| § | CASE_01 | CASE_02 | 처분 |
|--|--|--|--|
| 1 DI | **주의.** 렌더·공식 `other`는 공통. 요약 note는 `violationContent` · `customerResponded` · `factRelationship`만. 나머지 DI는 긴 안내 라벨로 남을 수 있음. note 키 이중 사용은 §1.1 | **PASS에 가까움.** `other`이면 note 우선. `authorityResponse`는 note가 없을 때 CASE_01 라벨로 떨어짐. 완료 조건 공백은 §2 표 | 보류 |
| 2 CTA | **N/A.** 질문 rail CTA는 CASE별 분기가 없고 Admin 질문 화면 공통 | **N/A** | 보류 |
| 3 재분류 | **PASS.** Q1이 `CASE_01`이면 활성화는 Q1 고정. CASE_02/04/06 이탈은 Phase2 `authorityDemand` · scope 이후 | **주의.** `seedCase02AnswersFromCase06Handoff`는 값을 넣지 않음. 이어서 `seedCase02AnswersFromCustomerInput`이 고객 문장에서 `demandAuthority`를 넣고, 있으면 기관 질문을 건너뜀 | 보류. LOCK된 시드 동작을 이번 백로그에서 바꾸지 않음 |
| 4 Bridge | **수정 대상 1건.** `appendCase01PathQuestions`에 Phase1 선행 게이트 없음. Q1=`CASE_06`이고 브릿지 대상이 CASE_01이면 Phase2만 이어짐 | **주의. 보류.** Phase1 선행은 있음. 조건은 `isCase06BridgedToNativeCase`가 아니라 `isCase06ReclassifiedToCase02` (Q1=`CASE_06` + 분류값=`CASE_02`). 스냅샷 커밋·expert terminal 검사는 그 함수 안에 없음. v1.1에서 활성 CASE가 브릿지 후에만 CASE_02가 되면 결과가 겹칠 수 있으나, CASE_03/04/05와 함수가 다름 | CASE_01만 diff안. CASE_02 조건 함수는 교체하지 않음 |
| 5 STOP | **주의.** `case01PathFieldsComplete`는 명시적. 텍스트 후속이 FOCUS에 없음. `case01NeedsDeadlinePhase2`는 Phase1 기한이 비었을 때만 true | **PASS.** `case02PathFieldsComplete`가 Phase1 6필드 + 조건부 Phase2와 맞음. Phase1의 `situationMatch` · `paymentAmount`는 채워지면 Phase2 `needs*`가 false. `case02NeedsBlockage`는 항상 true | 보류 |
| 6 Harness | **주의.** 제품 안 QA 시드가 현재 옵션에 없는 `verify_payment`, `contacted`, `case01_evidence: "yes"`, `case01_blockage: "demand"`를 씀 | **주의.** 시나리오 C가 `why_pay`, D가 `authorityResponse: "unclear"`. 제품 버그로 단정하지 않음 | 보류. harness를 이 기록만으로 고치지 않음 |

---

## 4. confirmGoal 문장 (기록만)

승인된 CASE_03/04/05 문장 틀과의 차이. **CASE_01/02 문구는 수정하지 않는다.**

- CASE_02: `지금 이 비용 문제에서 가장 확인하고 싶은 것은 무엇인가요?` — 승인 틀과 같음.
- CASE_01: `지금 이 문제에서 가장 먼저 확인하고 싶은 것은 무엇인가요?` — 「가장 먼저」가 남아 있음.

CASE_02 confirmGoal은 Phase1 6번째(`paymentSubject` → `paymentInfoSource` → `situationMatch` → `paymentAmount` → `paymentStatus` → `confirmGoal`)다. 슬롯을 CASE_03/04/05에 맞추지 않는다.

---

## 5. 적용 보류 diff — CASE_01 bridge Phase1 선행 게이트

**적용하지 않음.** 1번 창이 CASE_03/04 수정을 실행할 때 이 블록만 같이 넣는다. 다른 백로그 항목은 그 diff에 포함하지 않는다.

줄 번호는 2026-09-24 작업 트리의 `src/lib/adminVerifyProfiling.ts` 기준이다. `appendCase01PathQuestions`는 CASE_05 미커밋 삭제 구간(약 4955행 이후)보다 앞에 있어, 그 삭제와 줄이 겹치지 않는다. 적용 시 함수 본문을 맞추고, 행 번호가 밀렸으면 함수명으로 찾는다.

### 5.1 현재 (게이트 없음)

`appendCase01PathQuestions` — 1502–1512행:

```ts
function appendCase01PathQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  phase: AdminVerifyProfilePhase = 2,
): void {
  if (phase === 1) {
    appendCase01Phase1Questions(questions, answers);
    return;
  }
  appendCase01Phase2Questions(questions, answers);
}
```

`isCase01Phase1Complete`는 이미 1173–1193행에 있다. `isCase06BridgedToNativeCase`는 7821행 함수 선언이다. CASE_03이 더 앞에서 이 함수를 호출하므로, 선언을 옮기지 않는다.

### 5.2 기준 패턴 (그대로 복사할 형태)

CASE_03 `appendCase03PathQuestions` 3651–3665행. CASE_04는 4686–4700행, CASE_05는 5836–5850행이 같은 형태다.

```ts
  if (phase === 1) {
    appendCase03Phase1Questions(questions, answers);
    return;
  }
  if (isCase06BridgedToNativeCase(answers, "CASE_03") && !isCase03Phase1Complete(answers)) {
    appendCase03Phase1Questions(questions, answers);
    if (!isCase03Phase1Complete(answers)) return;
  }
  appendCase03Phase2Questions(questions, answers);
```

CASE_02(2660–2675행)는 선행 Phase1이 있지만 조건이 `isCase06ReclassifiedToCase02`다. **CASE_01에는 그 함수를 쓰지 않는다.** 이번 확정은 `isCase06BridgedToNativeCase(answers, "CASE_01")`이다. CASE_02 조건 함수는 이 diff에서 바꾸지 않는다.

`buildAdminVerifyProfileQuestions`의 CASE_01 호출(7187–7193행)은 그대로 둔다. 게이트는 `appendCase01PathQuestions` 안에만 둔다.

### 5.3 넣을 diff (미적용)

파일: `src/lib/adminVerifyProfiling.ts`  
위치: `appendCase01PathQuestions` 본문, 현재 1510행 `appendCase01Phase2Questions(...)` 직전.

```diff
--- a/src/lib/adminVerifyProfiling.ts
+++ b/src/lib/adminVerifyProfiling.ts
@@ -1507,6 +1507,10 @@ function appendCase01PathQuestions(
   if (phase === 1) {
     appendCase01Phase1Questions(questions, answers);
     return;
   }
+  if (isCase06BridgedToNativeCase(answers, "CASE_01") && !isCase01Phase1Complete(answers)) {
+    appendCase01Phase1Questions(questions, answers);
+    if (!isCase01Phase1Complete(answers)) return;
+  }
   appendCase01Phase2Questions(questions, answers);
 }
```

적용 후 본문:

```ts
function appendCase01PathQuestions(
  questions: ProfileQuestion[],
  answers: ReviewAnswers,
  phase: AdminVerifyProfilePhase = 2,
): void {
  if (phase === 1) {
    appendCase01Phase1Questions(questions, answers);
    return;
  }
  if (isCase06BridgedToNativeCase(answers, "CASE_01") && !isCase01Phase1Complete(answers)) {
    appendCase01Phase1Questions(questions, answers);
    if (!isCase01Phase1Complete(answers)) return;
  }
  appendCase01Phase2Questions(questions, answers);
}
```

동작: Q1이 CASE_01인 일반 경로는 `phase === 1`에서 끝나고, Phase2 호출 시에는 브릿지 조건이 거짓이라 지금처럼 Phase2만 이어진다. Q1=`CASE_06`이고 브릿지 스냅샷 이후 활성 질문이 CASE_01이며 Phase1이 덜 끝났으면 Phase1을 먼저 붙이고, Phase1이 끝날 때까지 Phase2로 내려가지 않는다.

이 diff 밖에 있는 파일·시드·FOCUS·옵션·CASE_02 게이트는 적용 범위가 아니다.

---

*2026-09-24. LOCK 유지. 코드 미변경. bridge diff는 1번 창 CASE_03/04 수정 시 함께 적용.*
