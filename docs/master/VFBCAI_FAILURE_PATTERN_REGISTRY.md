# VFBCAI 실패 패턴 레지스트리

| 항목 | 내용 |
|------|------|
| **성격** | 제품·설계·절차 **재발 방지** 카탈로그 (감사·Mission·VERIFIER 공통) |
| **범위** | 행정 VERIFY(CASE_01~06) + **부동산·사기·세무·불명확** 등 동일 엔진·결과 스택 |
| **갱신** | 검증된 사례만 추가 (`05-vfbcai-ai-dev-team.mdc` LESSON 동형) |

**항목 열:** ID · 증상 · 근본 원인 · 발견 CASE·날짜 · 재발방지 규칙 · 자동 검사 · 검사 위치

---

## 1. 제품 버그 (F)

| ID | 증상 | 근본 원인 | 발견 CASE·날짜 | 재발방지 규칙 | 자동 검사 | 검사 위치 |
|----|------|-----------|----------------|--------------|-----------|-----------|
| **F01** | 입력·선택은 되는데 **결과·요약·Profile**에서 값이 사라짐 | 답 키 persist 누락 · Profile 매핑 단절 · principleF/Layer A **whitelist** 누락 · Phase 게이트로 **렌더 전 차단** | CASE_01·03·04·05·06 — 2026-09 (공통 감사 v1.1) | **Answer → Profile → Layer A/J → 화면** 단방향 추적 필수. text·note·date는 **전용 키** + 결과 함수 **읽기** 동시 PR. DI는 `other`+note **정식 경로**만 | **만들 수 있음** | `adminVerifyProfiling.ts` persist/`CASE0x_ANSWER_KEYS` · `AdminVerifyFirstResultPanel.tsx` `buildCaseResolutionProfile` · `admin-verify-pipeline-af-check.mjs` · Layer A 감사 COM-01 |
| **F02** | 선택지 문장을 **문장 중간에 끼워** 깨짐 (`…입니다 입니다`, `…했습니다. 상태로`) | 판단문·요약이 **slug label을 조사 없이 concat** · Layer J clause가 **완결문+완결문** 이중 결합 | CASE_01~06 — 2026-09 (Layer J manifest 감사) | **완결문 단위**만 삽입. fragment는 `{placeholder}` **한 슬롯**. `VFBCAI_QUESTION_CHOICE_EXPRESSION_MASTER_EXECUTION_RULE_v1.md` 준수 | **만들 수 있음** | `adminVerifyJudgmentClauses.data.ts` · `scripts/build-layer-j-manifest.ts` · 정규식: 연속 `입니다`·`状态로`·`. 상태` |
| **F03** | 판단 문장이 **고객 답과 반대** (`no_contact_yet` → 「대응 이력 있음」) | Phase1/2 **필드 혼동** · `customerResponded` vs `responseDetail` vs `authorityResponse` **잘못된 소스** · legacy slug 분기 | CASE_01 — 2026-09 | 질문 id ↔ Profile field ↔ clause 키 **1:1 레지스트리**. `case01_responseDetail`은 **has_responded만** (`adminVerifyJudgmentFieldRegistry`) | **만들 수 있음** | `adminVerifyJudgmentFieldRegistry.ts` · fixture별 clause golden · `case01-step2-1-spot.mjs` |
| **F04** | 답과 **무관한 고정 문장** · 의미 **뭉개짐** · **조용한 누락** | integrated builder **generic fallback** · keyMetrics **미연결** · caution/action **경로 무시** | CASE_02·04·06 — 2026-09 | 선택지 변경 시 **result signal diff** 필수. generic path는 **명시 CASE만** · 미연결 시 **unconfirmed 아님 FAIL** | **만들 수 있음** | `AdminVerifyFirstResultPanel.tsx` `appendCase0x*ResultSignals` · `admin-verify-strict-full-v2.impl.mjs` |
| **F05** | **장식 카드** (제목·내용 불일치, 「공증 및 영사」 등 무관 카피) | 템플릿 **CASE 공용** 복사 · FOCUS/rail **고정 문구** · evidence/goal과 **미연결** | CASE_03·05 — 2026-09 | 카드 **입력 필드 1개 이상** 바인딩 없으면 **미노출**. Master Funnel rail은 **QUESTION GUIDE / OFFICIAL SOURCES**만 (`02-ui-ux-rules.mdc`) | **부분 있음** | `MasterReviewQuotationReport.tsx` · `admin-ui-rail-di-spot.mjs` · 수동 Beauty Check |
| **F06** | **같은 원문**이 여러 섹션에 반복 | Layer A·principleF·footnote·J clause에 **동일 note 이중 삽입** | 전 CASE — 2026-09 (Layer A~J 감사) | **선택은 카드 각주 1회** · Layer A는 **DI+파일명만** · J는 **판단문**만 (v1.1 §5) | **만들 수 있음** | `buildAdminResponseSummaryBlock` vs `buildCase0xPrincipleFStateLines` diff 스냅샷 |
| **F07** | **옛 slug ↔ 새 slug** 불일치로 **문단 통째 누락** | normalize 미적용 · integrated **legacy value** · manifest 키 **구버전** | CASE_04·06 — 2026-09 | `case0xNormalize*` **단일 출구** · Layer J 키 = **canonical slug** · STEP2-1 후 **grep legacy** | **만들 수 있음** | `adminVerifyProfiling.ts` normalize · `adminVerifyJudgmentClauses.data.ts` · `chain05-label-capture.mjs` |
| **F08** | **1차·2차 목표 질문 중복** (`confirmGoal` vs `finalGoal`·의향형 Phase2) | 동일 「무엇을 확인하고 싶은지」를 **Phase2에서 재질문** · Brief v1 `clarityRecoveryStep` 류 | CASE_01·02 — 2026-09 | Phase1 **목표** · Phase2 **미확정 사실**만 (`unclearDemandFact` 등). DQ-C01-R06 · DQ-C02-R05 | **만들 수 있음** | `appendCase0xPhase2Questions` needs* · Brief §3 노출 표와 id 중복 금지 리스트 |
| **F09** | **같은 신호**(통역·제3자)를 **여러 질문**에서 반복 | hearsay·language를 L·gap·K·blockage에 **분산** | CASE_01 — 2026-09 (Brief v3 R08) | **신호 유형당 단일 질문 id** (예: K `lang_indirect_hearsay`, CASE_02 Nc) | **만들 수 있음** | Brief §3 · grep 동의어 slug across `case0x_` ids |
| **F10** | context에 값 있는데 **화면 미렌더** (`evidenceNote` 등) | `buildAdminVerifyPersonalizedContext` **설정만** · JSX **미참조** | 전 CASE — 2026-09 (COM-01) | Layer H: **`첨부 자료: {파일명}`** Layer A **내부** (감사 v1.1 LOCK) | **만들 수 있음** | `AdminVerifyFirstResultPanel.tsx` ~3379·~4500 · `admin-regression-h-spot.mjs` |
| **F11** | **진행 표시 카운터** 불일치 (질문 수·단계 vs 실제 화면) | `getAdminVerifyStitchProgress` vs **suppressed**·handoff·Phase2 **동적 체인** 불일치 | CASE_01·RE — 2026-09 (백로그) | progress **표시 필드** = 사용자가 보는 question id 집합과 **동일 소스** · suppression 시 total **재계산** | **만들 수 있음** | `adminVerifyProfiling.ts` `getAdminVerifyStitchProgress` · `pilot-question-guide-count.mjs` · E2E step assert |

---

## 2. 설계 규칙 (D)

| ID | 증상 | 근본 원인 | 발견 CASE·날짜 | 재발방지 규칙 | 자동 검사 | 검사 위치 |
|----|------|-----------|----------------|--------------|-----------|-----------|
| **D01** | **비율 공식**과 **비장식성** 충돌 → 질문 **채우기·삭제 순환** | ⌈P×6/4⌉이 **질문 수**를 목표로 삼음 · 장식 전환 없이 **축만 증가** | CASE_01·02 — 2026-09-25 | **2026-09-25 Ace:** P2 실질 **>** P1 실질만. **비율 맞추기 질문 추가 금지**. 밀도는 **선택지**에서 (`VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md`) | **만들 수 있음** | `case01-phase2-substantive-depth-combinations.mjs` · Brief 30조합 · 감사 §6 `P2>P1` 열 |
| **D02** | **질문 수·P2&lt;N**을 조건으로 질문 **띄우는 보정 게이트** | Ratio remediation Brief v2 §5.2 · `procedureStageFact` **보정 노출** | CASE_01 — 2026-09-25 | **노출 = 고객 답(사실)만**. DQ-C01-R07 · DQ-C02-R07 **금지** | **만들 수 있음** | `case01Needs*` / `case02Needs*` grep `P2`·`ratio`·`보정` · Brief §3 only |
| **D03** | **선택지 하나**에 **서로 다른 사실 두 개** | 압축 과다 · facet **혼합 slug** (속도+금액 등) | CASE_01 — 2026-09 | **1 choice = 1 fact** (Brief v2 §3.2). EXPRESSION_MASTER **다중신호는 downstream**에서 갈라짐 | **만들 수 있음** | Option label lint · `conflict_speed_amount` 금지 목록 |
| **D04** | **fixture 몇 개**만 보고 「전 경로 통과」 | QA harness **대표 경로**만 · 조합 **미전수** | CASE_01 — 2026-09 | **2×5×3 등 조합 표** + 코드 `*OnPath(answers)` **일치** (Brief LOCK). 미달 **표시** | **만들 수 있음** | `case01-phase2-substantive-depth-combinations.impl.mjs` · CASE_02 v2 §5 미달 6건 |
| **D05** | **CASE마다 따로 패치** → 공통 원인 **미수정** | Layer A·persist·note **CASE별 if**만 수정 | CASE_01~06 — 2026-09 | **COM-01~** 공통 레이어 먼저 · `VFBCAI_ADMIN_VERIFY_COMMON_RESULT_AUDIT_v1.md` §5 | **부분 있음** | `admin-verify-pipeline-af-check.mjs` · Mission Brief **cross-domain** 절 |

---

## 3. 절차 (P)

| ID | 증상 | 근본 원인 | 발견 CASE·날짜 | 재발방지 규칙 | 자동 검사 | 검사 위치 |
|----|------|-----------|----------------|--------------|-----------|-----------|
| **P01** | **구현 창**이 만든 테스트를 **독립 검증**으로 보고 | IMPLEMENTER = VERIFIER **동일 세션** · harness가 **제품 버그를 흡수** | 다수 — 2026-09 | **Product vs Harness** 분리 (`03-qa-self-loop.mdc`). VERIFIER **별도 실행**·로그 첨부 | **불가** (프로세스) | Mission 완료 보고 템플릿 · `05-vfbcai-ai-dev-team.mdc` No False Completion |
| **P02** | 구현 창이 **테스트 기준을 새 동작에 맞게 변경** | assertion **완화** · fixture를 **새 버그에 맞춤** | 다수 — 2026-09 | QA 변경은 **VERIFIER 승인** 또는 **별도 QA Mission**. 제품 수정과 **동일 PR 금지**(원칙) | **만들 수 있음** | `git diff tests/` vs `src/` 분리 리뷰 · CI diff gate |
| **P03** | 「완료」 보고 vs **실제 화면** 불일치 | `tsc` / engine spot **PASS** ≠ Browser · PC만 확인 | RE·Admin — 2026-09 | **UI FINAL QA** 375px (`06-ui-design-responsive-typography-qa.mdc`). engine PASS **≠ Mission 완료** | **부분 있음** | Playwright `admin-verify-free-e2e.spec.ts` · VERIFIER checklist |
| **P04** | **옛 지시**로 작업 (지시 **개정 후**에도 이전 Brief) | 문서 **LOCK/폐기** 미표기 · v1/v2 **동시 존재** | CASE_02 minimal vs v2 — 2026-09-25 | Brief 헤더 **폐기·대체** · 헌법 **최신 우선** (`vfbcai-authority.mdc`) | **만들 수 있음** | `grep "폐기\|대체"` in `docs/master/*BRIEF*` · commit 메시지 SoT |
| **P05** | **작업 순서** 뒤바뀜 (보류·신규 혼동) | 플랫폼 순서 05→06→… **무시** | CASE_02 — 2026-09 | Mission **플랫폼 순서**·**의존성** Brief 상단 LOCK | **불가** (프로세스) | `VFBCAI_CASE02_MINIMAL_*` 폐기 · Master handoff |
| **P06** | 출처 불명 코드 수정이 작업 트리에 남음 | 병렬 창·실험 **미정리** | — | **이름 붙여 stash** · Mission 외 diff **revert 금지 대신** Ace 보고 (`04-autonomous-mission-loop.mdc`) | **불가** | `git status` · Agent Human Boundary |
| **P07** | 보고에 **전문 없이** 「파일 참조」만 | 토큰 절약 · 검토 **불가** | 2번창 지시 — 2026-09-25 | Ace 명시 시 **해시+요약**; LOCK Brief 승인 시 **§핵심 전문** 또는 diff 범위 | **불가** | Cursor user rule · Mission 보고 형식 |
| **P08** | 문서 **표 숫자** 손계산 오류 | 조합표 **P2·하한** 오타 (CASE_01 v2 #2=9 표기 8) | CASE_01 — 2026-09-25 | 표는 **구현 함수**와 대조 · 「코드 전수 계산」 (`Brief v3` LOCK) | **만들 수 있음** | `*combinations.impl.mjs` vs markdown table codegen |
| **P09** | **LOCK 규칙**을 대표 승인 없이 **해석·변경** | Agent **완화**·구 기준 혼용 | CRITERIA 4:6 — 2026-09-25 | **Ace 승인 + 변경 이력**만 (`VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md`) | **불가** | Authority chain · `P09` Human Boundary |
| **P10** | **수동 검사**가 **수정 중인 작업 폴더**·동일 dev 서버를 사용 | 구현 창이 **미커밋·반쯤 고친 코드**를 HMR로 서빙하는데, 다른 창(VERIFIER·수동 QA)이 **같은 `npm run dev`** 로 브라우저 검사 → **원인 불명** 오류·질문 초기화 등 | **CASE_04** 질문 초기화 — **2026-09-25** | **수동·브라우저 검사**는 **커밋된 코드**로 띄운 **별도 git worktree** 서버에서만. 구현 중인 트리·포트 **공유 금지**. QA·VERIFIER **보고에 검사한 커밋 해시 필수** (`git rev-parse HEAD`). 구현 창 dev 중 타 창 **동일 폴더 수동 검사 금지** | **불가** (프로세스) · worktree 스크립트는 **만들 수 있음** | `git worktree` · Cursor `best-of-n-runner` · `03-qa-self-loop.mdc` · Mission 완료 보고 **검증 커밋** 필드 |

---

## 4. 자동 검사로 바꿀 항목 (구현은 별도 Mission)

| 우선 | 패턴 | 제안 테스트 (카테고리 공통) | 입력 |
|------|------|------------------------------|------|
| P0 | F01·F10 | **`profile-layer-a-roundtrip`**: answers fixture → Profile → Layer A/H 문자열 → **필수 키 substring assert** | `answerFixtures[]`, `requiredKeys[]`, `layerABuilder` id |
| P0 | F02 | **`judgment-clause-grammar`**: clause 텍스트 **중복 종결·깨진 조사** regex FAIL | `adminVerifyJudgmentClauses.data.ts` 또는 manifest export |
| P0 | F03·F07 | **`choice-clause-alignment`**: (caseId, fieldId, slug) → clause 존재 · **negation consistency** (no_contact ⊄ responded) | slug map, clause registry |
| P1 | D01·D04 | **`substantive-depth-combinations`**: Cartesian 조합 → `*SubstantiveAxisIdsOnPath` → **P2>P1** | exposure table §3, axis counter fn |
| P1 | D02 | **`no-ratio-gates`**: needs* / append* **금지 패턴** grep CI | repo scan rules |
| P1 | F06 | **`summary-dedup`**: Layer A vs principleF **n-gram overlap** threshold | panel builders |
| P2 | F04 | **`result-signal-diff`**: 동일 질문에서 slug A vs B → signals **집합 diff non-empty** | CASE signal fns |
| P2 | F11 | **`stitch-progress-consistency`**: questions[] vs progress total | profiling + UI harness |
| P2 | D03 | **`one-fact-per-choice`**: 금지 혼합 slug list | CASE Brief §4 |

**이미 있음 (확장 권장):** `admin-verify-pipeline-af-check.mjs`, `case01-phase2-substantive-depth-combinations.mjs`, `admin-verify-strict-full-v2.impl.mjs`, `chain05-label-capture.mjs`.

---

## 5. 카테고리 공통 검사 (행정 · 부동산 · 사기 · 세무 · 불명확)

동일 엔진 스택: **Answer → Profile → needs* → Result (Layer A~J) → Browser**. CASE id·질문 id만 바뀐다.

### 5.1 검사별 입력 매트릭스

| 검사 id | 설명 | 행정 (VERIFY admin) | 부동산 (RE) | 사기 / 세무 / 불명확 |
|---------|------|---------------------|-------------|----------------------|
| **CAT-01** | Answer persist roundtrip | `CASE0x_ANSWER_KEYS`, `adminVerifyProfiling.ts` | `re*_*` keys, RE profiling module | fraud/tax/unclear answer keys (도입 시 동일 패턴) |
| **CAT-02** | Substantive P2>P1 combinations | Brief §3 노출 + `case01Phase2SubstantiveAxisIdsOnPath` | RE STEP2-0 경로 표 + `re*OnPath` | Brief 확정 후 `*OnPath` |
| **CAT-03** | Clause ↔ slug alignment | `adminVerifyJudgmentClauses.data.ts` + registry | RE judgment clauses (if split) | 동형 파일 |
| **CAT-04** | No ratio gates | `case0xNeeds*` sources | `re*Needs*` | 동형 |
| **CAT-05** | Layer A + attachment | `buildAdminResponseSummaryBlock` | RE result panel summary | 동형 |
| **CAT-06** | Goal question dedup | Phase1 goal id vs Phase2 ids set | RE confirm vs deepen ids | 동형 |
| **CAT-07** | Signal singleton | Brief «단일 출구» 표 (K, Nc, …) | RE hearsay/language id | Brief § |
| **CAT-08** | Browser smoke | `/verify/admin` fixtures | `/verify/real-estate` | `/verify/fraud` 등 |

**실행 형태:** `tests/qa/category-common/` (제안) — 각 검사가 **config JSON**: `{ "namespace": "admin|re|fraud|tax|unclear", "axisCounterExport": "...", "fixtures": "..." }`.

### 5.2 신규 카테고리 Brief — 「실패 패턴 점검」절 템플릿

```markdown
## N. 실패 패턴 점검 (VFBCAI_FAILURE_PATTERN_REGISTRY.md)

| 점검 | Applicable IDs | 이 카테고리 입력 (채우기) | PASS 조건 |
|------|----------------|---------------------------|-----------|
| CAT-01 persist | F01 | ANSWER_KEYS: `…` · Profile fields: `…` | fixture 전항목 Layer A 또는 Profile에 반영 |
| CAT-02 P2>P1 | D01, D04 | §조합 표 행 수 · `*OnPath` 함수명 | 미달 행 목록 = §표와 코드 일치 · 비율 게이트 0 |
| CAT-03 clauses | F02, F03, F07 | clause 파일 · canonical slug表 | 모든 on-path slug에 clause · grammar lint PASS |
| CAT-04 ratio gates | D02 | needs* 파일 경로 | `P2<`·`보정`·`ratio` 게이트 없음 |
| CAT-05 summary | F06, F10 | summary builder 함수명 | evidenceNote·DI 원문 Layer A 내 1회 |
| CAT-06 goals | F08 | Phase1 goal id · Phase2 금지 id 목록 | 교집합 ∅ |
| CAT-07 signal | F09 | 단일 출구 질문 id 표 | 동의어 신호 2질문 이상 금지 |
| CAT-08 browser | P03 | 스모크 스크립트 경로 | PC+375 핵심 assert (VERIFIER) |

**VERIFIER:** CAT-02·CAT-08 **실행 증거** 없으면 Mission PASS 금지.
```

---

## 6. 변경 이력

| 일자 | 내용 |
|------|------|
| 2026-09-25 | 초판 — F01~F11, D01~D05, P01~P09 · 자동검사 제안 · CAT 공통 · Brief 템플릿 |
| 2026-09-25 | **P10** — 수정 중 작업 폴더·공유 dev 서버 수동 검사 (CASE_04, 2026-09-25) |

---

*2번창 — 실패 패턴 레지스트리 (문서만).*
