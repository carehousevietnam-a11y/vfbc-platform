# CASE_04 Phase2 리메디에이션 — STEP2-0 (설계만)

| 항목 | 내용 |
|------|------|
| **코드** | 수정 없음 |
| **승인** | DQ-C04-R1·R2 Ace 승인 2026-09-25. R3는 권장안이며 미승인 |
| **구현 SoT** | `VFBCAI_CASE04_PHASE2_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md` — 착수 범위는 R1·R2만 |
| **기준** | 정보완결성 LOCK (fa4cce9). 1차<2차는 밀도 PASS 후보였고, 실질 축 4:5는 하한 4:6 미달 |
| **범위** | CASE_04 Adapter. Admin Master 질문 틀·공통 엔진 재설계 없음 |
| **본보기** | CASE_05 `case05_deadlineDate`, `getCase05FieldLabelFromAnswers`의 `other` note |
| **해당 없음** | 출석 장소·일시. 그 선택은 CASE_03만 있다 |

현재 실질 축은 1차 4 : 2차 5다. 장식 7개는 `addDocDetail`, `modifyDetail`, `evidenceDetail`, `unclearFocus`, `blockage`, `evidence`, `finalGoal`.

---

## DQ-C04-R1. `specific_date` 날짜 체인을 CASE_05와 같이 CASE 안에 둘 것인가

라벨은 보완 날짜를 확인했다고 하고, 저장은 slug뿐이다. Profile `deadline`(9020–9021행)과 통합문(2073행)은 그 slug만 본다.

권장: CASE_05 `case05_deadlineDate`와 같은 모양을 CASE_04 안에 다시 둔다. 공통 헬퍼로 빼지 않고, CASE_03·05 함수를 고치지 않는다.

| CASE_05에 있는 것 | CASE_04에 새로 둘 것 |
|-------------------|----------------------|
| `CASE05_DEADLINE_DATE_KEY` (439행) | `CASE04_DEADLINE_DATE_KEY` = `case04_deadlineDate` |
| `case05NeedsDeadlineDateDetail` (5055–5057행) | `case04NeedsDeadlineDateDetail` |
| Phase1 push (5725–5732행) | 4478행 `case04_deadline` 선택 직후 같은 `kind: "text"` |
| Profile 가지 (9015–9017행) | 9020행 CASE_04 가지만 `보완 제출 기한: {문자열}` |
| 완료 조건 | `isCase04Phase1Complete`(4415–4422행)에서 문자열이 비면 미완료 |

`effectiveDate`(9008행)는 그대로 둔다. 통합문 2073행은 CASE_04 날짜 키가 있을 때만 그 문자열을 붙인다.

근거: CASE_05 체인. 공통 추출은 Admin Master 재설계에 해당한다.

## DQ-C04-R2. `getCase04FieldLabelFromAnswers`를 CASE_02·05와 같이 둘 것인가

CASE_02(2172–2189행)와 CASE_05(5395–5430행)는 `other`이면 note를 라벨로 쓰고, note가 있으면 `confirmed`, 없으면 `candidate`다. CASE_04에는 `getCase04FieldOptionLabel`(4259–4262행)만 있다. note를 읽지 않는다.

CASE_04의 `other`는 기한만이 아니다. 보완 대상·목표·대응·사유·증거·막힘의 note도 라벨과 Profile에 안 실린다.

| 호출 | 행 |
|------|----|
| Profile `supplementTarget`·`deadline`·`customerResponse`·`evidence`·`blockage` 등 | 8589, 8627, 8906, 9021, 9073, 9138 |
| 질문 요약 | `adminVerifyProfiling.ts` 6681 |
| 결과 패널 | `AdminVerifyFirstResultPanel.tsx` 1135 |
| 견적 화면 | `MasterReviewQuotationReport.tsx` 1228 |

권장: `getCase04FieldLabelFromAnswers`를 CASE_04 블록 안에 새로 둔다. 본문은 CASE_02 2172–2189행과 같다. 공통 함수로 합치지 않고, CASE_02·03·05 함수는 수정하지 않는다. 위 호출의 CASE_04 가미만 이 함수로 바꾼다. `getCase04FieldOptionLabel`은 slug→문장 조회로 남긴다.

근거: 1번창 발견. CASE_05 5394행 주석의 동형이 CASE_04에는 없다.

## DQ-C04-R3. 장식 7개 중 무엇을 실질화해야 하한인가

질문을 새로 만들지 않는다. 선택지가 결과 문장과 Profile에서 갈라져야 실질 축으로 센다.

산수: 1차 4를 유지하면 2차 실질 6이 4:6 하한이다. 지금 5이므로 **최소 1개**다. 3:7(2차 약 70%)에 가까이 가려면 2차 9개(4:9, 1차 약 31%)가 필요하다. 그건 장식 중 **4개**를 실질화하는 수다 (5+4=9). 7개를 모두 살리면 4:12로 3:7을 지나 질문만 늘어난다.

권장:

| 순서 | 질문 | 이유 |
|------|------|------|
| 하한에 포함 | `addDocDetail`, `modifyDetail`, `evidenceDetail` | 보완 대상이 고른 뒤의 「무엇을」이다. 지금은 답 키만 있고 결과 함수가 읽지 않는다. 셋은 경로가 달라 한 번에 하나만 열린다. 정의는 3개라 실질 축 +3 → 4:8. 4:6을 넘고 3:7 쪽이다 |
| 3:7에 가깝게 | `evidence` | `none`과 자료 종류가 결과의 증빙 미확인으로 갈라지게 한다. +1 → 4:9 |
| 이번엔 장식 유지 | `blockage`, `finalGoal`, `unclearFocus` | 1차 목표·막힘과 같은 뜻의 반복이다. 하한과 3:7은 위 4개로 맞춘다 |

`addDocDetail`만 실질화하면 다른 대상(`modify_existing`, `add_content_evidence`) 경로는 그대로 장식이다. 하한 숫자만 맞추려고 하나만 고르지 않는다.

연결: 각 상세 값은 결과 행동 문장에 그 서류·수정·증빙 라벨이 들어간다. `evidence=none`은 미확인, 그 외 종류는 보유 자료 문장. 선택지 문구는 바꾸지 않는다.

근거: CASE_04 감사 장식 7개. `appendCase04Phase2Questions` 4538–4601행은 대상별 상세를 이미 연다. `appendCase04Phase2ResultSignals`(640–679행)는 그 키를 읽지 않는다.

---

*2026-09-25. R1·R2 승인. R3 미승인. 구현 SoT는 STEP2-1 Mission Brief. 코드 미착수.*
