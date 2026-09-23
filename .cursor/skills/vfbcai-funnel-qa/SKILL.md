---
name: vfbcai-funnel-qa
description: >-
  VFBCAI 질문 퍼널을 실제 브라우저에서 검증한다. VERIFY 행정문서·CHECK/REGISTER 퍼널 QA,
  질문→저장→다음→결과, CASE 분리, 직접 설명하기, Golden Case 회귀 테스트 시 사용.
disable-model-invocation: true
---

# VFBCAI Funnel QA

퍼널 QA 전용. 권위: `docs/VFBCAI_CONSTITUTION.md` §10, `vfbcai-authority.mdc`, `vfbcai-funnel-profile.mdc`, `06-ui-design-responsive-typography-qa.mdc`.

## 사전 조건

- `npx tsc --noEmit` 참고만. **TypeScript 통과 ≠ PASS.**
- 실제 브라우저 실행 (PC + Mobile 375px).
- UI/레이아웃/타이포 범위면 `.cursor/rules/06-ui-design-responsive-typography-qa.mdc` 적용. **깨지지 않음 · 글자 축소로 끼워 넣기**만으로 PASS 금지.
- 미확인 항목 PASS 보고 **금지**.

## 체크리스트 (14항)

1. 최신 헌법·확정 설계 우선
2. 질문 → 선택 → **답변 저장** → 다음 질문 → 결과
3. CASE 간 질문·선택지 혼합 없음
4. 확인된 사실 재질문 없음
5. 1차·2차 혼합 없음 (1차 사실 2차 반복 없음)
6. 직접 설명하기 ≠ numbered option
7. 직접 설명: 클릭 → 입력 → 저장 → 다음 단계
8. 질문·선택지 의미 일치
9. 진행률 = 실제 질문 단계 일치
10. 결과 ↔ 실제 답변 연결
11. Unknown → Risk 자동 판정 없음
12. 답변만으로 법률 결론 확정 없음
13. PC ≠ Mobile 단순 축소 (PC Full / Mobile Focused · 의미 동일)
14. UI FINAL QA: L1–L5 · 한글 줄바꿈 · overflow · Beauty Check — 미충족 = FAIL

## 테스트 세트 (최소 4경로)

- **A** 정상 대표 · **B** 다른 핵심 선택 · **C** Unknown/unclear · **D** 직접 설명하기

**VERIFY 행정문서 Q1**: ① CASE_01 위반·문제 · ② CASE_02 납부 · ③ CASE_03 출석·소명 · ④ CASE_04 보완 · ⑤ CASE_05 처분·조치 · ⑥ CASE_06 불명확

## Golden Case

- **CASE_01, CASE_02** = Golden Case. 영향 가능 시 회귀 테스트 필수.
- Golden Case **명시적 승인 없이 수정 금지**.

## 실행

1. 범위·서비스·CASE 고정 → 2. tsc 기록 → 3. 브라우저 A~D → 4. 체크리스트 판정 → 5. 근거(스크린샷·관측) 기록

## 보고 (항목별 PASS | FAIL | NOT TESTED | BLOCKED)

**TypeScript**: `tsc --noEmit` [PASS|FAIL] — 브라우저와 **별도** 보고.

**Browser QA** [서비스/CASE/경로]: 체크리스트별 결과 + 근거.

**Golden Case 회귀**: CASE_01, CASE_02 각각 결과.

**요약**: PASS/FAIL/NOT TESTED/BLOCKED 건수. 브라우저 미확인 = NOT TESTED. 1회 보고 → 승인 → 다음 1회.
