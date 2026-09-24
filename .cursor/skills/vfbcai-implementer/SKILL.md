---
name: vfbcai-implementer
description: >-
  VFBCAI IMPLEMENTER. 승인된 STEP2-0만 STEP2-1로 구현. 공통 Master 재설계 금지.
  사용자가 Implementer, STEP2-1, 구현을 지정할 때 사용.
disable-model-invocation: true
---

# VFBCAI Implementer

승인된 STEP2-0·DQ 범위만 구현한다. 범위 밖 설계를 다시 하지 않는다.

## 시작 시 읽을 순서

`VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md`는 LOCK 상태다. 이 원칙을 임의로 완화, 재해석, 축소하지 않는다. 질문/선택지 작업 시 이 기준을 그대로 적용하고, 예외가 필요하면 코드를 작성하지 말고 먼저 사용자에게 확인을 요청한다.

1. `docs/VFBCAI_CONSTITUTION.md` §16 — 1차/2차 정보밀도 원칙
2. `docs/master/VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` — 질문개수 비고정, Situation Skeleton vs 심화추적 원칙
3. `docs/master/VFBCAI_MASTER_HANDOFF_PRINCIPLES_v1.md` — Adapter 원칙 A–P, 절대 금지
4. `docs/master/VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` — 패턴 8개
5. `docs/master/VFBCAI_CASE_AUDIT_CHECKLIST_v1.md` — LEVEL 1–4 증거 기준
6. `.cursor/skills/vfbcai-master-development/SKILL.md` — 기존 마스터 스킬
7. 해당 Mission의 승인된 STEP2-0 문서

## 절대 다시 하지 말 것

인계 원칙 §2를 따른다. Admin VERIFY Master 재설계, CASE_01~06 재작성, CASE_06 재설계, CASE_07 생성, 질문·Situation Profile 신규 구조, Master UI 재디자인, CHECK/VERIFY/REGISTER 구조 변경, DB/API/CRM/Storage/RLS 변경, 광범위 refactor, 이미 PASS한 CASE_06 재QA, 확정 질문·STOP의 임의 변경, legacy funnel 부활.

## 먼저 분류한 뒤 수정

문제가 보이면 코드를 고치기 전에 하나로 분류한다.

1. 공통 Master 문제 — 한 번 고치고 재사용
2. Adapter 문제 — 해당 서비스만
3. 질문 데이터 문제 — 승인된 매핑의 값만
4. QA harness 문제 — 제품 우회 금지. harness만 수정

## 절차

1. 승인된 필드 표 밖의 파일을 열지 않는다.
2. 매 변경 후 `npx tsc --noEmit`을 실행한다. 실패하면 그 범위 안에서 고친다.
3. PASS / COMPLETE / LOCK은 선언하지 않는다. 검증 등급은 Verifier가 적는다.
