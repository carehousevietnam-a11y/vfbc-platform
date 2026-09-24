# CASE_06 Information Completeness Audit

| 항목 | 내용 |
|------|------|
| **범위** | 감사만. 코드 미변경 |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (`fa4cce9`). 완화·재해석 없음 |
| **증거** | LEVEL 1. `src/lib/adminVerifyCase06Redesign.ts` (현행 질문), `src/lib/adminVerifyProfiling.ts` (레거시 5필드·재분류·시드), `AdminVerifyFirstResultPanel.tsx` (결과 문장) |
| **브라우저** | 하지 않음 |

이 창의 이전 산출은 Unclear STEP1이었다. CASE_06 감사는 그때 하지 않았고, 이 문서가 첫 감사다.

현행 질문 경로는 `isCase06LegacyRestorePath === false`일 때 `appendCase06RedesignPathQuestions`다. `case06_requiredActionCandidate`가 있으면 레거시 경로가 아니다.

---

## 0. 현행 1차 / 2차 질문 수

1차 (`CASE06_V11_PHASE1_FIELD_ORDER`) 5개. 항상 이 순서다.

1. `case06_requiredActionCandidate`
2. `case06_knowledgeSource`
3. `case06_sourceChannel`
4. `case06_deadlineActionPair`
5. `case06_customerResponse`

2차는 `resolveCase06Phase2ChainId`가 고른 체인 하나다. 후보 slug → 체인: `pay_demand`→납부, `attend_explain`→출석, `submit_supplement`→보완, `disposition_notice`→처분, 그 외·`problem_action_unclear`→불명확(5).

| 체인 | 2차 질문 수 (코드) |
|------|-------------------|
| 납부 | 5, `paymentResponse !== already_paid`이면 +1 (`paymentNonPaymentNotice`) |
| 출석 | 4, 출석·서류 제출 응답이면 +1 |
| 보완 | 5, 미제출이 아니면 +1 (`submissionEvidence`) |
| 처분 | 4. 조건부 추가 없음 |
| 불명확 | `unclearContentRecheck` 1개 후, `signal_violation`이면 **즉시 종료**. 다른 signal이면 해당 체인으로 전환. 그 외는 사실관계·대응 후 expert terminal |

`case06_exactSource` / `keyPhrase` / `requiredAction` / `receiptPath` / `actualCore`는 이 1차·2차 목록에 없다. `appendCase06Phase2Questions`에만 있고, 그 함수는 레거시 복원(`isCase06LegacyRestorePath`)에서만 호출된다.

---

## 1. 재분류와 타겟 전달

### 1.1 다섯 필드는 재분류 힌트이고, 타겟 답변으로 복사되지 않는다

`inferCase06ReclassificationTarget`은 `case06_requiredAction`, `case06_actualCore`를 CASE id로만 바꾼다. `exactSource`, `keyPhrase`, `receiptPath`는 이 함수에 없다.

`seedCase02AnswersFromCase06Handoff`는 주석 그대로 타겟 값을 시드하지 않고 `answers`를 그대로 반환한다. 브릿지 커밋은 `case06_bridgeSnapshotCommitted`와 `case06_bridgeTargetCase`만 쓴다 (`applyCase06BridgeSnapshot`). `case02_*` 등 타겟 필드에 CASE_06 선택값을 넣지 않는다.

그래서 이 다섯 필드는 **재분류(또는 레거시 질문)에서 끝나고, 타겟 CASE의 실제 답변값이 되지 않는다.** 타겟에 들어간 뒤에는 그 CASE 질문을 처음부터 묻는다. 질문 skip은 이 시드 함수가 하지 않는다.

`case06NeedsActualCore`는 재분류 타겟이 이미 있으면 `false`다. 레거시에서도 분류가 되면 `actualCore` 질문 자체가 열리지 않는다.

### 1.2 현행 2차 체인도 타겟 필드로 넘어가지 않는다

납부·출석·보완·처분 체인의 `case06_payment*` / `attendance*` / `submission*` / `disposition*`는 결과 패널(`AdminVerifyFirstResultPanel.tsx`)에서 참조되지 않는다. 브릿지 스냅샷에도 타겟 slug로 복사되지 않는다. 체인 답은 CASE_06 세션에 남고, 타겟 CASE의 사실 칸을 채우지 않는다.

---

## 2. `specific_date`류 데이터 손실

### 2.1 레거시 `profileAuthorityGuidance = specific_date`

선택지 라벨은 「정확한 날짜를 알고 있습니다」다. 저장되는 값은 slug `specific_date`뿐이다. 날짜 문자열을 받는 후속 필드가 없다.

`deriveUnclearSignals`의 `UNCLEAR_DEADLINE`은 `not_stated` / `uncertain` / `past_possible`만 본다. `specific_date`는 기한 신호에도 안 들어간다. 알고 있다고 한 날짜는 신호로도, 값으로도 남지 않는다.

### 2.2 현행 `case06_deadlineActionPair`

`deadline_pay_by_date`, `deadline_submit_by_date`, `deadline_attend_by_date`도 「특정 날짜」를 말할 뿐 날짜를 받지 않는다. 이 키는 2차 `needs*`와 결과 문장에 없다. 1차 완료 조건으로만 존재한다.

같은 유형:

| 선택 | 주장하는 사실 | 실제로 저장되는 것 |
|------|----------------|-------------------|
| `exact_amount_known` | 정확한 금액 | slug만 |
| `date_place_method_known` | 정확한 날짜·장소·방식 | slug만 |
| `exact_effective_date` | 정확한 발효일 | slug만 |

결과 패널이 네이티브 CASE 기한 slug `specific_date`를 「기한이 확인된 상태」로 쓰는 곳(`buildCase03IntegratedSituation` 등)도 날짜 원문은 없다. CASE_06 현행 쌍 필드는 그 분기조차 타지 않는다.

---

## 3. LOCK 판정 — 1차 vs 2차

비율은 화면 질문 수가 아니라, 기준 ②~④를 통과한 실질 축만 센다.

2차 체인 선택지를 바꿔도 `AdminVerifyFirstResultPanel` 문장은 변하지 않는다. 다음 질문이 갈라지는 현행 필드는 아래뿐이다.

- 1차: `case06_requiredActionCandidate` (체인 선택)
- 2차: `case06_paymentResponse`, `case06_attendanceResponse`, `case06_submissionResponse`, `case06_unclearContentRecheck`

`knowledgeSource`, `sourceChannel`, `deadlineActionPair`, `customerResponse`와 처분 체인 4문항, 납부 성격·금액·일치·기관확인은 다음 질문과 결과 문장을 갈라지 않는다. 비율에서 제외한다.

| 경로 | 실질 축 (1차 : 2차) | 판정 |
|------|---------------------|------|
| 납부·출석·보완 | 1 : 1 | **1차 = 2차 → 무조건 FAIL** |
| 처분 | 1 : 0 | **1차 > 2차 → 무조건 FAIL** |
| 불명확 + `signal_violation` | 1 : 1 (재확인 1문항 후 STOP) | **1차 = 2차 → 무조건 FAIL** |
| 하한 3:7~4:6 | 어떤 현행 경로도 이 비에 닿지 않음 | **FAIL** |

질문 개수만 보면 1차 5, 2차 4~6이다. 처분 4는 1차 5보다 적다. 납부 6은 1차 5보다 하나 많다. LOCK은 그 개수 비교를 통과로 보지 않는다. 4:5 형태는 하한 아래로 적혀 있다.

---

## 4. 기준 ①~⑤ (현행 경로)

| 기준 | 판정 | 근거 |
|------|------|------|
| ① 정보 완결성 | **FAIL** | 날짜·금액·장소는 「안다」는 slug에서 끝난다. 타겟 CASE는 그 사실을 받지 않아, 브릿지 후에도 같은 사실을 다시 물어야 구조가 성립한다 |
| ② 다중 신호성 | **FAIL** | 체인 답은 결과 문장·타겟 필드·증거 게이트로 이어지지 않는다. 갈라지는 것은 체인 내부 다음 질문 일부뿐이다 |
| ③ 선택지 판별력 | **FAIL** | 1차 4필드와 처분 체인 선택지는 후속 `needs*`·결과가 같다. 다섯 레거시 필드 중 `exactSource`·`keyPhrase`·`receiptPath`는 재분류 맵에도 없다 |
| ④ 비장식성 | **FAIL** | ③에서 갈라지지 않는 1차 4필드·처분 4문항 |
| ⑤ 직접입력 의존 | **주의** | 선택지에는 `other`+note가 있다. 다만 날짜·금액의 정상 경로는 자유텍스트가 아니라 slug 단정이다. 핵심 값이 note가 아니면 비어 있다 |

---

## 5. 권장 (구현하지 않음)

- 다섯 레거시 필드를 현행 2차로 되돌리지 않는다. 재분류 힌트로 두고, 타겟 질문 skip·시드는 계속 금지한다.
- 날짜·금액·장소를 「있다」가 아니라 값으로 남길지는 별도 승인 후에만 설계한다. 이번 감사는 손실 사실만 기록한다.
- 2차 실질 축이 1차 실질 축보다 깊고, 비가 3:7~4:6 이상인 경로가 되기 전에는 CASE_06 정보 완전성 PASS로 두지 않는다.

---

*2026-09-25. LOCK `fa4cce9` 적용. 코드 없음.*
