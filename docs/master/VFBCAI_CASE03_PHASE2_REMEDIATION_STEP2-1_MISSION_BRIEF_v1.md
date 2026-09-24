# CASE_03 Phase2 리메디에이션 — STEP2-1 Mission Brief (LOCK)

| 항목 | 내용 |
|------|------|
| **상태** | **LOCK** — Ace 승인 2026-09-25. R1·R2·R3=A·R4=A |
| **완료 기준** | 실질 축 **5:8**. 4:6 하한 충족. 3:7은 구조상 한계로 이번 Mission 목표에서 제외 |
| **착수** | **지금 금지.** 순서 3번째: CASE_05 STEP2-1 → CASE_06 STEP2-1 → 이 Brief |
| **설계 SoT** | `VFBCAI_CASE03_PHASE2_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_CASE03_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (fa4cce9) |

코드 미착수. 구현은 이 Brief만 따른다. R1~R4는 재오픈하지 않는다.

---

## 0. Mission 한 줄

날짜·DI note·출석 장소/일시를 CASE_03 안에만 저장하고, `blockage`·`evidence`·`finalGoal`을 결과까지 갈라 실질 축 5:8을 맞춘다. Admin Master 틀·공통 헬퍼·CASE_05 함수는 수정하지 않는다. 질문을 새로 만들거나 1차 축을 줄이지 않는다.

---

## 1. 승인 LOCK

| ID | 결정 |
|----|------|
| **R1** | `CASE03_DEADLINE_DATE_KEY` = `case03_deadlineDate`. `case03NeedsDeadlineDateDetail`, Phase1 `kind: "text"`, `isCase03Phase1Complete`, Profile CASE_03 `deadline` 가지, 통합문. CASE_05 함수를 호출하거나 공통 함수로 빼지 않는다. `effectiveDate`는 그대로 |
| **R2** | `getCase03FieldLabelFromAnswers`를 CASE_03 블록에 추가. CASE_02 2172–2189행과 같은 `other`+note. 호출은 Profile·질문 요약·결과 패널·견적 화면의 CASE_03 가지만. `getCase03FieldOptionLabel`은 유지 |
| **R3=A** | `attendance` → `case03_attendancePlace`. `attendance_notice` → `case03_attendanceWhenWhere`. `attendance_only` → `case03_prepAttendanceDate`. 그 선택일 때만 텍스트. Profile 기존 칸 뒤에 문장. `effectiveDate`는 쓰지 않음 |
| **R4=A** | `blockage`·`evidence`·`finalGoal` 세 질문의 값이 결과 문장과 Profile에서 갈라진다. 선택지 문구는 유지. `evidence=none`만 증빙 미확인. `attendance_notice`는 R3 텍스트를 결과에 붙인다. `finalGoal`은 `confirmGoal`과 같은 문장으로 합치지 않는다 |

완료 시 1차 실질 5, 2차 실질 8. 2차 8은 기존 5축에 R4의 3축을 더한 것이다. R3 텍스트는 새 질문 축으로 세지 않는다.

## 2. 착수 금지

`adminVerifyProfiling.ts`는 CASE_05 STEP2-1, 이어서 CASE_06 STEP2-1이 끝난 뒤에만 연다. 이 문서만으로 IMPLEMENTER를 시작하지 않는다.

---

*2026-09-25. R1·R2·R3=A·R4=A 승인 LOCK. 완료 기준 5:8. 코드 미착수.*
