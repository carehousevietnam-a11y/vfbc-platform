---
name: vfbcai-adapter-builder
description: >-
  VFBCAI Adapter builder. Fraud, Tax, Unclear 등 새 VERIFY를 Admin Master와
  CASE_06 위에 Adapter로 얹을 때 사용. 공통 Master 재설계 금지.
disable-model-invocation: true
---

# VFBCAI Adapter Builder

공통 Master 재설계 금지. 추가하는 것은 그 서비스의 domain 질문·값·규칙뿐이다.

## 시작 시 읽을 순서

1. `docs/VFBCAI_CONSTITUTION.md` §16 — 1차/2차 정보밀도 원칙
2. `docs/master/VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` — 질문개수 비고정, Situation Skeleton vs 심화추적 원칙
3. `docs/master/VFBCAI_MASTER_HANDOFF_PRINCIPLES_v1.md` — Adapter 원칙 A–P, §4–§5
4. `docs/master/VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` — 패턴 8개. §8 각주: 이분법 라우팅 필드는 내용 개수 대상이 아니고 DI 불요
5. `docs/master/VFBCAI_CASE_AUDIT_CHECKLIST_v1.md` — LEVEL 1–4 증거 기준
6. `.cursor/skills/vfbcai-master-development/SKILL.md` — 기존 마스터 스킬
7. `docs/master/VFBCAI_QUESTION_CHOICE_EXPRESSION_MASTER_EXECUTION_RULE_v1.md`
8. `docs/master/VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md`
9. 해당 서비스의 승인된 STEP1·STEP2-0 (`docs/master/`)

역할이 조사면 `vfbcai-architect`, 구현이면 `vfbcai-implementer`, 검증이면 `vfbcai-verifier`를 같이 따른다.

## 체크리스트

- 행정 CASE_01~06과 CASE_06 함수 본문을 복사하지 않는다. CASE_07을 만들지 않는다.
- DI·완료 판정·질문 렌더는 기존 헬퍼를 호출한다. `ADMIN_DIRECT_EXPLAIN_CHOICE`와 다른 DI를 만들지 않는다.
- `isCase06BridgedToNativeCase`로 새 서비스를 행정 CASE에 붙이지 않는다. 목표 CASE 값을 시드하지 않는다.
- 질문 체인에는 결과·분기를 바꾸는 domain 사실만 둔다. 결과 뒤 안내·기관 안내는 질문에 넣지 않는다.
- 저장은 slug, 화면은 표시 라벨. 옛 한글·기타 값은 읽기 전용이다.
- 이분법 라우팅(사전/사후처럼 경로만 나누는 필드)에는 DI를 붙이지 않는다.
- 이미 받은 답을 다시 묻지 않는다. 문항 수를 고정하지 않는다.
- 구현 후 `npx tsc --noEmit`. PASS / LOCK은 Verifier의 LEVEL 표가 있을 때만.
