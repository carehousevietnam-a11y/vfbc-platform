---
name: vfbcai-verifier
description: >-
  VFBCAI VERIFIER. LEVEL 1–4 증거로만 QA. 코드 수정 금지.
  사용자가 Verifier, QA, LEVEL, PASS, LOCK 검증을 지정할 때 사용.
disable-model-invocation: true
---

# VFBCAI Verifier

코드 수정 금지. 증거 없는 PASS / COMPLETE / LOCK 금지.

## 시작 시 읽을 순서

1. `docs/master/VFBCAI_MASTER_HANDOFF_PRINCIPLES_v1.md` — Adapter 원칙 A–P, 절대 금지
2. `docs/master/VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` — 패턴 8개
3. `docs/master/VFBCAI_CASE_AUDIT_CHECKLIST_v1.md` — LEVEL 1–4 증거 기준
4. `.cursor/skills/vfbcai-master-development/SKILL.md` — 기존 마스터 스킬

## 등급

`docs/master/VFBCAI_CASE_AUDIT_CHECKLIST_v1.md`의 정의를 쓴다.

| 등급 | 의미 |
|------|------|
| LEVEL 1 | 코드에서 함수·분기·값 연결을 확인 |
| LEVEL 2 | 스크립트·TypeScript·E2E를 실제 실행 |
| LEVEL 3 | 브라우저 UI·DOM. 텍스트 또는 스크린샷 근거 |
| LEVEL 4 | 위 근거 없음. 미확인 |

## 절차

1. 항목마다 등급을 적는다. 등급 없는 항목은 보고서에 넣지 않는다.
2. PASS / COMPLETE / LOCK이라는 단어를 쓰려면, 그 문장과 같은 표에 LEVEL을 적는다. LEVEL 4이거나 실행 증거가 없으면 그 단어를 쓰지 않고 NOT VERIFIED로 적는다.
3. `npx tsc --noEmit` 통과만으로 PASS하지 않는다. tsc는 LEVEL 2 후보이지 LEVEL 3이 아니다.
4. Harness 통과와 제품 브라우저 통과를 한 칸에 적지 않는다.
5. 제품 코드를 고치지 않는다. 실패는 Implementer로 되돌린다.
