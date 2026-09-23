# VFBCAI CASE AUDIT CHECKLIST v1.0

모든 CASE(01~06) 조사·구현·감사에 공통 적용.
CASE를 "LOCK" 상태로 선언하기 전 반드시 통과해야 하는 추적선이다.
개별 CASE 지시문은 이 문서를 참조하는 것으로 대체하고, 매번 항목을 재작성하지 않는다.

## LOCK 선언 전 필수 (Governance + git)

Ace가 CASE **LOCK**을 확정할 때, 아래를 **LOCK 조건**에 포함한다 (제품 QA만으로 LOCK 불가).

- [ ] **LOCK 결정 로그** — `docs/master/VFBCAI_CASE0X_LOCK_DECISION_LOG_v*.md` (검증 근거·핵심 결정·frozen scope)
- [ ] **Lesson 반영 완료 (파일)** — 해당 CASE·cross-domain 교훈이 `.cursor/skills/vfbcai-master-development/SKILL.md` § **Verified Lessons — Admin Master**에 추가·갱신됨 (보조: `.cursor/rules/question-funnel-lessons.mdc`는 Canonical 아님)
- [ ] **Lesson 반영 완료 (git)** — 위 Skill( 및 결정 로그·관련 `.cursor/rules` 변경)이 **`git commit`으로 저장소에 기록**됨 (`git log` / `git status`로 확인). untracked·working tree only = **LOCK 불완료**
- [ ] **LESSON SYNC** — `05-vfbcai-ai-dev-team.mdc` LESSON → GOVERNANCE LOOP: 수정 + QA PASS 확인된 항목만 기록

## A. 설계 기준 비교 (v1.0 대비)
- [ ] MASTER v1.0 해당 CASE Phase1 질문 순서/개수와 현재 구현 비교, 차이 목록화
- [ ] Phase2 adaptive chain이 v1.0의 "질문 수 고정 없음" 원칙을 지키는지
- [ ] 1차(Skeleton)/2차(개인화) 역할 분리 유지 여부
- [ ] fixed question vs conditional question 구분이 v1.0과 일치하는지
- [ ] 선택지 수(4~5개 + Direct Input) 확인
- [ ] Direct Input 문구가 정확히 "위에 내용이 없거나 설명이 필요합니다 → 직접 입력"인지

## B. 질문/선택지 품질
각 질문마다:
- [ ] 실제 상황을 묻는가
- [ ] 전문가 판단에 필요한 정보인가
- [ ] 이전 질문과 중복되지 않는가
- [ ] 선택지가 서로 다른 실제 상황을 나타내는가 (의미 중첩 없음)
- [ ] "기타/모름" 같은 무의미 옵션이 없는가
- [ ] 선택 결과가 Situation Profile에 실제로 들어가는가
- [ ] 선택 결과가 이후 branching/Result에 실제로 영향을 주는가

## C. Direct Input 연결 (UI 존재만으로 종료 금지)
반드시 전체 경로를 확인한다:
- [ ] raw answer 저장 확인
- [ ] normalization/effective value 변환 확인
- [ ] Situation Profile 반영 확인
- [ ] CASE 분류/classification 반영 확인
- [ ] adaptive branching 영향 확인
- [ ] Result 반영 확인

## D. Raw / Effective Value
- [ ] 각 게이트/조건문이 raw value와 effective value 중 무엇을 사용해야 하는지, 해당 CASE의 설계 의도와 비교한다
- [ ] Direct Input/정규화가 존재하는 값은 raw → effective 변환 경로를 확인한다
- [ ] 게이트가 raw value를 사용한다면 그것이 의도된 것인지 확인한다
- [ ] Direct Input("other")이 literal value와 동일한 의미로 처리되어야 하는 지점을 확인한다
- [ ] raw/effective 불일치가 실제 동작에 영향을 주면 [REGRESSION FOUND]로 표기한다

## E. Result 연결
각 Phase2 답변마다:
- [ ] Answer → Profile → (Risk/Unconfirmed/Evidence/Action 중 어디로) → Result Panel 전체 경로 확인
- [ ] 1차 기본 패널과 2차 개인화 패널 각각에서 실제 표시 여부 별도 확인 (구조가 다를 수 있음)
- [ ] 함수 호출 결과 ≠ 브라우저 확인 — 절대 동일시 금지

## F. 검증 레벨 (고정 어휘)
- LEVEL 1 코드 확인함 — 함수/분기/값 연결을 코드에서 확인
- LEVEL 2 실행함 — 스크립트/TypeScript/E2E가 실제 실행됨 (코드 레벨)
- LEVEL 3 브라우저 확인함 — 실제 UI/DOM에서 확인 (텍스트/스크린샷 근거 필수)
- LEVEL 4 미확인 — 위 근거 없음
- QA 판단 표현으로 PASS/FAIL/완료/정상/문제없음 사용 금지
  (단, 코드·로그·브라우저에 실제로 존재하는 문자열을 인용하는 경우 원문은 그대로 인용 가능)

## G. Dead / Legacy Code
- [ ] 현재 UI에서 생성되지 않는 option/value를 참조하는 분기가 있는지 확인
- [ ] 과거 option/value를 위한 legacy compatibility 코드인지 확인
- [ ] 실제 도달 가능한 경로인지 확인
- [ ] 삭제/수정이 필요하면 즉시 구현하지 않고 [DESIGN QUESTION]으로 분리

## H. Regression
- [ ] 이번 CASE 수정이 공용 함수/공용 UI(Result Panel, unconfirmed 정렬, cautions 등)를 건드리는가
- [ ] 건드린다면 다른 CASE(미수정 대상)에서 최소 1개 시나리오로 회귀 확인

## 보고 형식 (STEP1 investigation 공통)

```
CASE_0X
- 구조 차이:
- 질문/선택지 품질 이슈:
- Direct Input 연결 상태:
- Raw/Effective 불일치:
- Dead code:
- Result 연결 상태:
- Browser 검증 필요 항목:
- [DESIGN QUESTION] 목록:
```
