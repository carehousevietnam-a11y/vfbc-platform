# VFBCAI 행정 VERIFY Master — 인수인계 v2

| 항목 | 내용 |
|------|------|
| **버전** | v2 |
| **갱신일** | 2026-09-25 |
| **목적** | 새 채팅·새 창이 **이 문서 하나**로 Admin Master(CASE_01~06) 작업을 이어가도록 함 |
| **v1 정정** | 과거 인수인계에 「CASE_01 풀 체인 **비율 충족**」처럼 적힌 기록은 **착오**였음 — **화면/경로 개수**(풀 체인 시나리오)와 **실질 축 P2&gt;P1** 판정을 혼동한 것. CASE_01 비율 SoT는 `VFBCAI_CASE01_RATIO_REMEDIATION_QUESTION_BRIEF_v3.md` **LOCK** + `case01-phase2-substantive-depth-combinations.mjs` **30/30** (커밋 `a164f36` 계열). |
| **push** | 별도 Ace 지시 시만 |

---

## 1. 역할 구분 (창·Agent)

| 역할 | 담당 | 할 일 | 금지 |
|------|------|--------|------|
| **2번창** | 설계·감사·Brief | LEVEL 1 코드 추적, 문서, F12·비율·공통 감사 | **제품 코드** 수정 |
| **1번창** | IMPLEMENTER | 승인 Brief·Mission 범위 **최소 구현**, `tsc` | Brief 미승인 착수, 범위 초과 |
| **3·4번창** | VERIFIER·수동 QA | **독립** Browser·시나리오 | 구현 창과 **동일 세션**에서 PASS 선언 (P01) |
| **Ace** | 승인·배포 | Brief LOCK, 배포, 헌법·비율 개정 | — |

**검증 원칙**

| 레벨 | 의미 | 용도 |
|------|------|------|
| **LEVEL 1** | 코드 추적 (Profile · needs · result 신호) | 감사·Brief · **PASS ≠ 출시** |
| **LEVEL 2** | `tsc`, engine spot, harness (`*.mjs`) | Self-Healing · 회귀 |
| **LEVEL 3** | **Product** Browser (PC + 375px UI FINAL QA) | Mission 완료·LOCK **필수** |

- **독립 검증 (P01):** VERIFIER는 IMPLEMENTER가 만든 harness를 **그대로 신뢰하지 않음**. Product 경로·로그·커밋 해시를 보고에 명시.
- **P10 (2026-09-25):** 수동·브라우저 QA는 **커밋된 코드**만. `git worktree add` → 해당 HEAD에서 `npm ci` / `npm run dev` → 검사. **구현 중인 dirty tree·동일 dev 서버 공유 금지**. 보고에 `git rev-parse HEAD` **필수**.

---

## 2. 비율·품질 LOCK (2026-09-25)

**SoT:** `docs/master/VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` **LOCK**

| 변경 | 내용 |
|------|------|
| **폐기** | Phase2 ≥ ⌈Phase1×6/4⌉, 3:7~4:6 **질문 수** 맞추기 |
| **현행** | Phase2 **실질 축** **>** Phase1 **실질 축** (엄격 부등식). 단순 사건 3:4 등 **허용** |
| **금지** | 비율 맞추기 **질문·축 추가** (D01·D02) |
| **유지** | ①~⑤ 감사 원칙 · 선택지 **다중신호**(②) · 헌법 **§16.6** 「2차 정보 밀도 &gt; 1차」 · `VFBCAI_QUESTION_CHOICE_EXPRESSION_MASTER_EXECUTION_RULE_v1.md` |

**예외 (의도적):** **CASE_06 출시판 A안** — Phase2 없음, 전문가 연결 전용 (`VFBCAI_CASE06_LAUNCH_SIMPLIFIED_BRIEF_v1.md`, `42f2019`). P2&gt;P1 **미적용**; 출시 후 v1.1 재설계.

---

## 3. 공통 결과 구조 (Layer A~J)

**SoT:** `docs/master/VFBCAI_ADMIN_VERIFY_COMMON_RESULT_AUDIT_v1.md` §5

| Layer | 한 줄 |
|-------|--------|
| **A** | `buildAdminResponseSummaryBlock` — **DI·note 원문 + 첨부 파일명**만. 선택지 full label **금지** |
| **B** | keyMetrics **footnote** vs 판단문 **분리** (동일 원문 반복 금지, F06) |
| **C** | `formatJudgmentClause` — label 끼워넣기 금지 (F02) |
| **D** | CASE별 metric title manifest |
| **E** | note 키 · `ANSWER_KEYS` 동기 |
| **F** | Profile field manifest (CASE_05 detail 등) |
| **G** | integrated slug registry · `effective*()` |
| **H** | `evidenceNote` → Layer A에 `첨부 자료: {파일명}` (F10) |
| **I** | Phase2 risk slug ↔ OPTIONS |
| **J** | Judgment clause manifest — slug별 clause, fallback 금지 (F03·F04) |

**응답 요약 규칙 (LOCK):** 선택지는 카드 **footnote 1회**(짧은 요약). §01 응답 요약 = **DI `항목명: 원문`** + Layer H 파일명. Phase2 complete **게이트로 요약 숨기지 않음** (J4).

**구현 순서 (1번창):** 공통 감사 §8 표 1~6 → CASE_05 profile link → CASE_06 출시 A → (출시 후) CASE_06 v1.1.

---

## 4. CASE별 상태 · SoT ·커밋 (2026-09-25)

| CASE | 상태 | SoT 문서 | 코드·커밋 참고 |
|------|------|----------|----------------|
| **01** | Ratio Brief **v3 LOCK** · Layer J facet | `VFBCAI_CASE01_RATIO_REMEDIATION_QUESTION_BRIEF_v3.md` (`a164f36` LOCK) | `66ad0ed` Layer J facet · 30조합 PASS |
| **02** | Brief **v3 승인** (Cf·Ev, Ch 삭제, F12) | `VFBCAI_CASE02_RATIO_REMEDIATION_QUESTION_BRIEF_v3.md` | `32ea12d` |
| **03** | STEP2-0·감사 | `VFBCAI_CASE03_*` · `VFBCAI_CASE03_INFORMATION_COMPLETENESS_AUDIT_v1.md` | F12 §7.3 (evidence 단답) |
| **04** | STEP2-0·감사 · LEVEL3 이슈(반복·요약) | `VFBCAI_CASE04_*` · 공통 감사 C04-xx | F12 §7.2 |
| **05** | Profile link Brief **v1 승인** (`33ec831`) | `VFBCAI_CASE05_PROFILE_LINK_FIX_BRIEF_v1.md` §2~5 구현 대기 | 감사 `VFBCAI_CASE05_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **06** | **출시 A안** (P1만·전문가 CTA) | `VFBCAI_CASE06_LAUNCH_SIMPLIFIED_BRIEF_v1.md` (`42f2019`) | v1.1 redesign **출시 후** · `VFBCAI_CASE06_MASTER_REDESIGN_v1.1.md` |

**공통**

| 문서 | 커밋·역할 |
|------|-----------|
| `VFBCAI_FAILURE_PATTERN_REGISTRY.md` | `95f1311` + `e8f8dd9` P10 · `32ea12d` F12 |
| `VFBCAI_ADMIN_VERIFY_CASE01-06_MANUAL_QA_SCENARIOS_v2.md` | `b28c2f7` (P10·CASE06·CASE02 v3) |
| `VFBCAI_ADMIN_VERIFY_COMMON_RESULT_AUDIT_v1.md` | Layer A~J · 수정 순서 §8 |
| 질문 MASTER (LOCK) | `VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` — **질문 방향 재설계 금지** (§8) |

---

## 5. 실패 패턴 레지스트리

**파일:** `docs/master/VFBCAI_FAILURE_PATTERN_REGISTRY.md`

| 계열 | ID | 용도 |
|------|-----|------|
| 제품 버그 | **F01~F12** | Brief·Mission·VERIFIER 체크리스트 (F12=선택지 단답 퇴보) |
| 설계 | **D01~D05** | 비율·장식·공통 레이어 우선 |
| 절차 | **P01~P10** | 독립 QA·LOCK·**P10 worktree** |
| 공통 검사 | **CAT-01~08** | §5 카테고리 |

**사용법:** Mission Brief 말미 「실패 패턴 점검」 — 해당 F/D/P ID **명시** · 미검증 PASS 금지 · QA PASS 후에만 Master Skill Lesson 반영.

---

## 6. 남은 작업 · 권장 순서

1. **1번창 현재 작업** 완료 후 **`VFBCAI_CASE05_PROFILE_LINK_FIX_BRIEF_v1.md` §2~5** (C05-01~04, 코드만).
2. **공통 결과** `VFBCAI_ADMIN_VERIFY_COMMON_RESULT_AUDIT_v1.md` §8 **1~6** (Layer A·J·H·G·D·E).
3. **CASE_06 출시 A** — `VFBCAI_CASE06_LAUNCH_SIMPLIFIED_BRIEF_v1.md` (Phase2 숨김·전문가 CTA).
4. **CASE_02 v3** — `case02_paymentConfirmationFact`(Cf)·Ev 확장 (Brief §3).
5. **F12 §7** (C03/04/05 선택지 label) — **문구 승인 후** 별도 Mission.
6. **CASE_06 v1.1** · STEP2-1 · ratio — **출시 후**.
7. **RE · Fraud · Tax · Unclear** — 행정 Master **PASS 후** (Skill 순서).

---

## 7. 목표일 — 2026-09-28 (월) 행정문서 Master

**목표:** `/verify/admin` CASE_01~06 **출시 가능** 퍼널 — 질문 MASTER 정합·결과 Layer A~J **1차 완료**·대표 수동 QA 시나리오 v2 **통과**.

**완료 조건 (체크리스트)**

| # | 조건 |
|---|------|
| 1 | `npx tsc --noEmit` **PASS** (검증 커밋 고정) |
| 2 | CASE_01~05 경로 **P2&gt;P1** (실질 축, 장식 제외) — 감사 §6 · 조합 스크립트 |
| 3 | 공통 감사 §8 **1~6** 반영 (응답 요약·DI·첨부·integrated·keyMetrics) |
| 4 | CASE_05 **§2~5** Browser — detail 5필드·unclear/other·inquired·deadline 4값 |
| 5 | CASE_06 **출시 A** — Phase1 5+조건부 1·간소 1차 결과·**전문가 진행하기** CRM handoff |
| 6 | `VFBCAI_ADMIN_VERIFY_CASE01-06_MANUAL_QA_SCENARIOS_v2.md` — CASE별 **가/나/다** (CASE_06은 출시 절) **LEVEL 3** |
| 7 | 수동 QA **P10** — worktree HEAD **해시 보고** |
| 8 | UI FINAL QA — PC Full · Mobile 375px (`06-ui-design-responsive-typography-qa.mdc`) |

**미포함 (월요일 이후·보류):** 아래 §8.

---

## 8. 보류·백로그

| 항목 | 메모 |
|------|------|
| **git stash** | `WIP-unverified-step2-1-before-layerJ-20260925` — 미검증 실험. **임의 pop/삭제 금지** (P06) |
| **진행 카운터 UI** | F11 — `getAdminVerifyStitchProgress` vs suppression 불일치 |
| **H04-X-1** | 재진입 `/verify/admin?start=check` 진행 초기화 — 헌법 §5-C 정합 (공통 감사 §9) |
| **RE · Fraud · Tax · Unclear** | 행정 Master 완료 후 Adapter (STEP1 문서 존재) |
| **CASE_06 v1.1** full chain · 브릿지 · P2&gt;P1 | 출시 A 이후 Mission |

---

## 9. 새 채팅 빠른 시작

1. 이 문서 + `docs/VFBCAI_CONSTITUTION.md` + Mission Brief(있으면) 읽기.
2. `git status` — 구현은 **1번창** dirty 가능; QA는 **worktree + 커밋 해시**.
3. 비율 판단은 **항상** `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (P2&gt;P1).
4. 결과/UI Mission은 **Layer A~J** + **FAILURE_PATTERN_REGISTRY** 교차 확인.

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-09-25 | v2 신규 — 역할·P10·비율·Layer·CASE SoT·9/28 목표·v1 착오 정정·보류 목록 |
