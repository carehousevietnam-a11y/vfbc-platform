# CASE_04 Phase2 리메디에이션 — STEP2-1 Mission Brief (LOCK)

| 항목 | 내용 |
|------|------|
| **상태** | **LOCK** — Ace 승인 2026-09-25. R1·R2·R3=A |
| **완료 기준** | 실질 축 **4:9** |
| **착수** | **지금 금지.** 순서 3번째: CASE_05 STEP2-1 → CASE_06 STEP2-1 → 이 Brief |
| **설계 SoT** | `VFBCAI_CASE04_PHASE2_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_CASE04_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (fa4cce9) |

코드 미착수. 구현은 이 Brief만 따른다. R1~R3는 재오픈하지 않는다. 출석 장소·일시는 CASE_04에 없다.

---

## 0. Mission 한 줄

날짜와 DI note를 CASE_04 안에만 저장하고, 상세 3개와 `evidence`를 결과까지 갈라 실질 축 4:9를 맞춘다. `blockage`·`finalGoal`·`unclearFocus`는 장식으로 둔다. Admin Master 틀·공통 헬퍼·CASE_03·05 함수는 수정하지 않는다.

---

## 1. 승인 LOCK

| ID | 결정 |
|----|------|
| **R1** | `CASE04_DEADLINE_DATE_KEY` = `case04_deadlineDate`. `case04NeedsDeadlineDateDetail`, Phase1 `kind: "text"`, `isCase04Phase1Complete`, Profile CASE_04 `deadline` 가지, 통합문. 공통 헬퍼 없음. `effectiveDate`는 그대로 |
| **R2** | `getCase04FieldLabelFromAnswers`를 CASE_04 블록에 추가. CASE_02 2172–2189행과 같은 `other`+note. 호출은 Profile·질문 요약·결과 패널·견적 화면의 CASE_04 가미만. `getCase04FieldOptionLabel`은 유지 |
| **R3=A** | `addDocDetail`·`modifyDetail`·`evidenceDetail`·`evidence`의 값이 결과 행동 문장과 Profile에 라벨로 들어간다. `evidence=none`만 미확인. `doc_other`·`modify_other`·`evidence_detail_other`는 공식 DI로 바꾸지 않는다. `blockage`·`finalGoal`·`unclearFocus`는 연결하지 않는다 |

완료 시 1차 실질 4, 2차 실질 9. 기존 5축에 상세 3축과 `evidence` 1축을 더한 것이다. 한 경로에는 상세가 하나만 열린다. 축 개수는 질문 정의 기준이다.

## 2. 착수 금지

`adminVerifyProfiling.ts`는 CASE_05 STEP2-1, 이어서 CASE_06 STEP2-1이 끝난 뒤에만 연다. 이 문서만으로 IMPLEMENTER를 시작하지 않는다.

---

*2026-09-25. R1·R2·R3=A 승인 LOCK. 완료 기준 4:9. 코드 미착수.*
