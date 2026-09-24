# CASE_03 Phase2 리메디에이션 — STEP2-1 Mission Brief (LOCK)

| 항목 | 내용 |
|------|------|
| **상태** | **LOCK** — Ace 승인 2026-09-25은 **R1·R2만**. R3·R4는 미승인 |
| **착수** | **지금 금지.** 순서: 1번창 CASE_05 STEP2-1 → 4번창 CASE_06 STEP2-1 → 그 다음 Ace가 이 Brief를 지시 |
| **설계 SoT** | `VFBCAI_CASE03_PHASE2_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_CASE03_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (fa4cce9) |

코드 미착수. 구현은 이 Brief의 §1만 따른다. R1·R2는 재오픈하지 않는다.

---

## 0. Mission 한 줄

`case03_deadlineDate`를 CASE_05와 같이 CASE_03 안에만 두고, `getCase03FieldLabelFromAnswers`로 `other` note를 라벨·Profile에 싣는다. Admin Master 틀·공통 헬퍼·CASE_05 함수는 수정하지 않는다.

---

## 1. 승인 LOCK — 구현 범위

| ID | 결정 |
|----|------|
| **R1** | `CASE03_DEADLINE_DATE_KEY` = `case03_deadlineDate`. `case03NeedsDeadlineDateDetail`, Phase1 `kind: "text"`, `isCase03Phase1Complete`, Profile CASE_03 `deadline` 가지, 통합문. CASE_05 함수를 호출하거나 공통 함수로 빼지 않는다. `effectiveDate` 공통 칸은 그대로 |
| **R2** | `getCase03FieldLabelFromAnswers`를 CASE_03 블록에 추가. CASE_02 2172–2189행과 같은 `other`+note. 호출은 Profile·질문 요약·결과 패널·견적 화면의 CASE_03 가지만. `getCase03FieldOptionLabel`은 유지 |

## 2. 미승인 — 이번 STEP2-1에 넣지 않음

| ID | STEP2-0 권장 | 이유 |
|----|----------------|------|
| **R3** | `attendance` / `attendance_notice` / `attendance_only` 뒤에 CASE 전용 텍스트 | Ace 미승인 |
| **R4** | `blockage`·`evidence`·`finalGoal` 세 질문 실질화 → 실질 축 5:8 (4:6 하한). 3:7은 이 3개로 불가 | Ace 미승인. 승인 없이 하한을 맞추려고 질문을 추가하거나 1차 축을 줄이지 않는다 |

R3·R4를 구현하면 이 LOCK을 넘는 것이다.

## 3. 착수 금지

`adminVerifyProfiling.ts`는 CASE_05 STEP2-1, 이어서 CASE_06 STEP2-1이 끝난 뒤에만 연다. 이 문서만으로 IMPLEMENTER를 시작하지 않는다.

---

*2026-09-25. R1·R2 승인 LOCK. R3·R4 미승인. 코드 미착수.*
