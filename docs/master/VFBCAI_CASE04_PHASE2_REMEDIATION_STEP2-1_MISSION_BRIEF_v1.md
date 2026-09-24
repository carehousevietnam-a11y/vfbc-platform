# CASE_04 Phase2 리메디에이션 — STEP2-1 Mission Brief (LOCK)

| 항목 | 내용 |
|------|------|
| **상태** | **LOCK** — Ace 승인 2026-09-25은 **R1·R2만**. R3는 미승인 |
| **착수** | **지금 금지.** 순서: 1번창 CASE_05 STEP2-1 → 4번창 CASE_06 STEP2-1 → 그 다음 Ace가 이 Brief를 지시 |
| **설계 SoT** | `VFBCAI_CASE04_PHASE2_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_CASE04_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (fa4cce9) |

코드 미착수. 구현은 이 Brief의 §1만 따른다. R1·R2는 재오픈하지 않는다. 출석 장소·일시는 CASE_04에 없다.

---

## 0. Mission 한 줄

`case04_deadlineDate`를 CASE_05와 같이 CASE_04 안에만 두고, `getCase04FieldLabelFromAnswers`로 `other` note를 라벨·Profile에 싣는다. Admin Master 틀·공통 헬퍼·CASE_03·05 함수는 수정하지 않는다.

---

## 1. 승인 LOCK — 구현 범위

| ID | 결정 |
|----|------|
| **R1** | `CASE04_DEADLINE_DATE_KEY` = `case04_deadlineDate`. `case04NeedsDeadlineDateDetail`, Phase1 `kind: "text"`, `isCase04Phase1Complete`, Profile CASE_04 `deadline` 가지, 통합문. 공통 헬퍼 없음. `effectiveDate`는 그대로 |
| **R2** | `getCase04FieldLabelFromAnswers`를 CASE_04 블록에 추가. CASE_02 2172–2189행과 같은 `other`+note. 호출은 Profile·질문 요약·결과 패널·견적 화면의 CASE_04 가지만. `getCase04FieldOptionLabel`은 유지 |

## 2. 미승인 — 이번 STEP2-1에 넣지 않음

| ID | STEP2-0 권장 | 이유 |
|----|----------------|------|
| **R3** | `addDocDetail`·`modifyDetail`·`evidenceDetail`·`evidence`를 실질화해 4:8 다음 4:9. `blockage`·`finalGoal`·`unclearFocus`는 장식 유지 | Ace 미승인. 승인 없이 상세 질문을 결과 분기에 연결하지 않는다 |

현재 실질 축 4:5는 하한 4:6 미달이다. R1·R2는 날짜·note 저장이고 축 개수를 늘리지 않는다. 하한은 R3 승인 전엔 그대로다.

## 3. 착수 금지

`adminVerifyProfiling.ts`는 CASE_05 STEP2-1, 이어서 CASE_06 STEP2-1이 끝난 뒤에만 연다. 이 문서만으로 IMPLEMENTER를 시작하지 않는다.

---

*2026-09-25. R1·R2 승인 LOCK. R3 미승인. 코드 미착수.*
