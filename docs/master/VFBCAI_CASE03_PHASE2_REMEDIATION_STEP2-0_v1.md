# CASE_03 Phase2 리메디에이션 — STEP2-0 (설계만)

| 항목 | 내용 |
|------|------|
| **코드** | 수정 없음 |
| **승인** | DQ-C03-R1·R2·R3=A·R4=A. Ace 승인 2026-09-25. 완료 기준 실질 축 5:8 |
| **구현 SoT** | `VFBCAI_CASE03_PHASE2_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md` |
| **기준** | 정보완결성 LOCK (fa4cce9). 1차=2차 FAIL. 실질 축 하한 3:7~4:6 |
| **범위** | CASE_03 Adapter. Admin Master 질문 틀·공통 엔진 재설계 없음 |
| **본보기** | CASE_01 `case01_deadlineDate`, CASE_05 `case05_deadlineDate` + `getCase05FieldLabelFromAnswers`의 `other` note |

현재 실질 축은 1차 5 : 2차 5다. 감사 문서의 장식 3개는 `blockage`, `evidence`, `finalGoal`.

---

## DQ-C03-R1. `specific_date` 날짜 체인을 CASE_05와 같이 CASE 안에 둘 것인가

라벨은 날짜를 확인했다고 하고, 저장은 slug뿐이다. Profile `deadline`(9022–9023행)과 통합문(2041행)은 그 slug만 본다.

권장: CASE_05 `case05_deadlineDate`와 같은 모양을 CASE_03 안에 다시 둔다. 공통 헬퍼로 빼지 않고, CASE_05 함수를 고치지 않는다.

| CASE_05에 있는 것 | CASE_03에 새로 둘 것 |
|-------------------|----------------------|
| `CASE05_DEADLINE_DATE_KEY` (439행) | `CASE03_DEADLINE_DATE_KEY` = `case03_deadlineDate` |
| `case05NeedsDeadlineDateDetail` (5055–5057행) | `case03NeedsDeadlineDateDetail`. `specific_date`이고 문자열이 없을 때만 |
| Phase1 push (5725–5732행) | 3495행 `case03_deadline` 선택 직후 같은 `kind: "text"` |
| Profile 가지 (9015–9017행) | 9022행 CASE_03 가지만 `출석·소명 기한: {문자열}` |
| 완료 조건 | `isCase03Phase1Complete`(3415–3422행)에서 그 문자열이 비면 미완료 |

`effectiveDate`(9008행)와 CASE_01·05 날짜 함수는 그대로 둔다. 통합문 2041행은 CASE_03 날짜 키가 있을 때만 그 문자열을 붙인다.

근거: CASE_05 체인 439·5055·5725·9015행. 공통 추출은 Admin Master 재설계에 해당한다.

## DQ-C03-R2. `getCase03FieldLabelFromAnswers`를 CASE_02·05와 같이 둘 것인가

CASE_02(2172–2189행)와 CASE_05(5395–5430행)는 `other`이면 note를 라벨로 쓰고, note가 있으면 `confirmed`, 없으면 `candidate`다. CASE_03에는 `getCase03FieldOptionLabel`(3228–3231행)만 있다. note를 읽지 않는다.

그래서 CASE_03의 어떤 필드에서 `other`를 골라도 note는 옵션 라벨과 Profile에 안 실린다. 기한만이 아니다. Profile·결과·화면이 이 함수만 부른다.

| 호출 | 행 |
|------|----|
| Profile `deadline` | 9023 |
| 질문 요약 | `adminVerifyProfiling.ts` 6679 |
| 결과 패널 | `AdminVerifyFirstResultPanel.tsx` 1133 |
| 견적 화면 | `MasterReviewQuotationReport.tsx` 1225 |

권장: `getCase03FieldLabelFromAnswers`를 CASE_03 블록 안에 새로 둔다. 본문은 CASE_02 2172–2189행과 같다. `other`면 `getAdminChoiceNoteKey(fieldId)`를 라벨로 쓴다. 공통 함수로 합치지 않고, CASE_02·05 함수는 수정하지 않는다. 위 네 호출의 CASE_03 가지만 이 함수로 바꾼다. `getCase03FieldOptionLabel`은 slug→문장 조회로 남긴다.

근거: 1번창 발견. CASE_05 주석 5394행이 이 함수를 CASE_02와 동형이라고 적는다. CASE_03은 그 동형이 없다.

## DQ-C03-R3. 출석 장소·일시를 저장할 것인가

후속 텍스트가 없다.

| 선택 | 행 | 저장할 키 | Profile |
|------|----|-----------|---------|
| `customerResponse=attendance` | 3020–3022 | `case03_attendancePlace` | `customerAction` 라벨 뒤에 장소 문장 |
| `evidence=attendance_notice` | 3174 | `case03_attendanceWhenWhere` | `evidence` 라벨 뒤에 일시·장소 문장 |
| `prepRequired=attendance_only` | 3100–3102 | `case03_prepAttendanceDate` | 준비 답 라벨 뒤에 날짜 문장. 결과 `prep` 미확인 분기(1018–1020행)와 별도 |

권장: 해당 선택일 때만 `kind: "text"` 한 칸. 공통 `effectiveDate`는 쓰지 않는다. 질문 문장·선택지 배열은 유지한다.

계획 diff: `appendCase03Phase2Questions`에서 그 선택이 완료된 직후 push. Profile은 기존 CASE_03 칸에 접미사만 붙인다. 결과 문장은 그 접미사가 있을 때 한 줄 추가.

근거: CASE_01 텍스트 후속 1397–1406행. CASE_03 감사의 attendance 세 줄.

## DQ-C03-R4. 장식 3개 중 무엇을 실질화해야 하한인가

실질 축으로 세려면 그 질문의 선택지가 다음 질문·증거·결과 중 둘 이상으로 갈라져야 한다. 질문을 새로 만들지 않는다.

산수: 1차 5를 유지하면 2차 실질 8이어야 4:6 비율(2차 60%) 이상이다. 지금 2차 실질 5이므로 **장식 3개를 모두** 갈라지게 연결해야 5:8이 된다. 1개나 2개만 실질화하면 5:6·5:7이라 하한 아래다.

3:7(2차 70%)은 5:8(약 62%)로 닿지 않는다. 장식 3개 밖에는 실질화할 2차 질문이 없다. 3:7은 1차 축을 줄이는 일이라 이 STEP2-0 범위가 아니다.

권장: 3개 모두 실질화하고, 3:7은 이번 설계에서 목표로 두지 않는다.

| 질문 | 연결 |
|------|------|
| `blockage` | 값마다 다른 미확인·행동 문장. 지금은 결과 함수가 이 키를 읽지 않는다 |
| `evidence` | `none`은 증빙 미확인, 자료 종류는 그 라벨이 결과 근거 문장에 들어간다. `attendance_notice`는 DQ-C03-R3 |
| `finalGoal` | 값마다 다른 다음 행동 문장. `confirmGoal`과 같은 문장으로 합치지 않는다 |

근거: CASE_03 감사 ⑤ 표의 장식 3개. LOCK의 4:6 하한.

---

*2026-09-25. R1·R2·R3=A·R4=A 승인. 구현 SoT는 STEP2-1 Mission Brief. 코드 미착수.*
