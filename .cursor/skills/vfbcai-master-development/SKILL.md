---
name: vfbcai-master-development
description: >-
  VFBCAI MASTER Development Skill v1.4. 모든 Mission·Agent·QA의 최우선 기준.
  EXPERT INVESTIGATIVE PROFILING / QUESTION-FIRST, MASTER QUESTION ARCHITECTURE
  (FINAL/PERMANENT), UI / DESIGN / RESPONSIVE / TYPOGRAPHY FINAL QA,
  CHECK/VERIFY/REGISTER/PROTECT, Master Funnel, Situation Profile,
  Case Continuity / Expert Handoff, Re-entry, Risk-based QA 적용 시 사용.
disable-model-invocation: true
---

# VFBCAI MASTER Development Skill (v1.4)

**권위**: `docs/VFBCAI_CONSTITUTION.md` — 모든 Agent·Skill·Rule보다 우선.
**v1.4 확정**: `LESSON → GOVERNANCE LOOP` + `VERIFY MASTER CANONICAL FUNNEL — FINAL` (Admin Master 2026-09 검증 반영) + `UI / DESIGN / RESPONSIVE / TYPOGRAPHY FINAL QA — FINAL` (Ace 2026-09-20).
**v1.3 유지**: `EXPERT INVESTIGATIVE PROFILING / QUESTION-FIRST` + `MASTER QUESTION ARCHITECTURE — FINAL / PERMANENT`. v1.2·v1.1 원칙 유지·강화.

## EXPERT INVESTIGATIVE PROFILING / QUESTION-FIRST (Governance — Agent 공통)

VFBCAI 질문 퍼널은 단순 UX 설문이 **아니다**. 사용자가 답하는 과정 자체가 **전문가의 investigative reasoning**(관계·사실·진술·시간·행동·증거·모순·미확인 추적)을 구조화하는 과정이다. 범죄 프로파일링 **UI·표현 복제 금지** — **추적 사고방식만** 적용.

**핵심 자산**: AI 답변·문서가 아니라, 질문/선택 과정에서 축적되는 **Situation Profile / Case Profile** (Question-First Data Asset).

**필수 파이프라인** (연결 없는 질문 = VFBCAI 핵심 질문 **아님**):

```
Question → Answer → Profile Field → Fact/Claim/Unknown/Evidence 상태
         → Branch → Judgment → Next Action
```

| 원칙 | 요약 |
|------|------|
| 선택지 = 데이터 | 서로 다른 **실제 상황** · 가능하면 **다음 질문 / Skip / Branch**에 영향 |
| NEVER ASK AGAIN | 확인된 정보 재질문 금지 — drill-down(심화)과 **반복** 구분 |
| 1차 / 2차 | 1차 = **Situation Skeleton** · 2차 = **Investigative Deepening** (1차 재분류 **아님**) |
| Phase2 carry-over | Phase1 Known → Skip · Unknown/Conflict/Risk → Drill-down |
| 질문 수 | **줄이기가 목표 아님** — 불필요 제거 · 필요 시 **깊게** (Investigative Coverage = Quality) |
| Master 재사용 | 확정된 Master / 상황추적 질문·선택지·Profile·branching·resolver **우선 재사용** |
| 신규 체계 금지 | 서비스별 **독립 선형 question chain** 임의 신설 **금지** — Master 구조 + 서비스별 field |
| 고도화 | 기존 구조를 **연결·분기·carry-over**로 고도화 — 새 namespace/체계는 Brief·Ace 승인 없이 **금지** |

### Evidence: Question ≠ Upload

- **Evidence Question**: 어떤 자료가 있는지 · 무엇으로 확인 가능한지 — Profile **Evidence axis** 구조화
- **Evidence Upload**: 실제 파일 제출 — 별도 gate
- 둘은 **중복 기능 아님** — 질문으로 axis, 업로드로 attachment

### ROOT CAUSE FIRST · ONE-TIME IMPLEMENTATION

문제 발생 시 **국소 패치 연쇄 금지**. 순서:

```
현상 → 전체 흐름 조사 → 실제 코드·데이터 추적 → Root Cause 확정
     → Exact Scope 확정 → [Ace 승인] IMPLEMENTER 1회 구현 → VERIFIER 검증
```

- **Root Cause 미확정 시 IMPLEMENTER 코드 수정 금지**
- Mission당: Architect 조사 → Root Cause → Scope → Implementer **1회** → Verifier — 중간 발견 이슈는 **제품 / QA·E2E / 환경** 분리

### VERIFY MASTER CANONICAL FUNNEL — FINAL (절대 혼동 금지)

**검증 기준 퍼널** (Admin Master 2026-09 Playwright desktop 12/12 PASS):

```
1차 질문/선택
→ 1차 간단자료 업로드 (optional gate, signup 직전)
→ 가입
→ 1차 종합결과
→ 개인화 상세검토 (CTA → Phase2 진입)
→ 2차 질문/선택 (디테일/고도화 — Phase1 Profile 이어받음)
→ 2차 branching (needs* / Focus — Master 구조)
→ 2차 질문 완료
→ 2차 상세자료 업로드 (Phase2 evidence gate)
→ 2차 종합결과 (Phase1 + Phase2 + 2차 상세자료 종합)
→ AI Report (/documents?mode=ai_report, 동일 leadId)
→ 전문가 진행 (/documents?mode=expert, 동일 leadId)
→ 재진입 (?restore=1, Case/Profile continuity)
```

| 구분 | 규칙 |
|------|------|
| 1차 간단자료 ≠ 2차 상세자료 | state · metadata · storage · restore **분리** |
| 1차 결과 ≠ 2차 결과 | builder·화면·판단 깊이 **분리** |
| 1차 질문 ≠ 2차 질문 | Phase2 = Phase1 **디테일/고도화** — 단순 반복 **금지** |
| Phase2 진입 | 개인화 CTA 후 · **동일 Case/leadId/Profile** 이어받기 |
| Phase1 Known | Phase2에서 **NEVER ASK AGAIN** (충돌·missing만 예외) |
| 2차 evidence gate | **2차 질문 완료 후에만** 노출 · 완료 전 업로드 **금지** |
| 2차 evidence 후 | **반드시** 2차 종합결과로 이동 (역방향 **금지**) |
| Continuity | answers · Profile · evidence tier · leadId **단일 Case** 유지 |

### FULL FUNNEL 검증 (국소 수정 전)

특정 화면 이슈라도 **먼저 위 Canonical Funnel** 전체 코드 추적.

각 단계: Route · State · Answer · Profile · Evidence tier · Lead · Restore · Result · Report · Expert handoff

### 완료 정의 (tsc만으로 완료 **아님**)

Mission 완료 = 아래 **범위 내** 실제 검증 후에만:

- 코드 · `tsc` · **브라우저** (질문 → Profile → Branching → 결과 → 자료 → Report · Expert — Brief 범위)
- Phase1→Phase2 continuity · 정상/복잡 상황 · regression
- **증거 없는 PASS / 완료 선언 금지** (No False Completion)

### 제품 vs QA

- **제품 문제**를 QA/E2E 수정으로 해결 **금지**
- Harness 이슈와 Product 이슈 **분리 보고**
- 제품에 evidence gate·CTA·handoff가 있으면 E2E helper를 **제품 퍼널에 맞게** 최소 수정 — 제품을 E2E에 맞추지 **않음**

## LESSON → GOVERNANCE LOOP — PERMANENT

**목적**: 해결·검증된 문제가 다음 Mission에서 **반복되지 않도록** 즉시 Governance에 기록.

```
문제 발견 → 실제 원인 확인 → 최소 수정 → 실제 QA 검증 → PASS 확인
→ Master Skill 기록 → Architect/Implementer/Verifier Agent 반영
→ 다음 Mission 사전 검사
```

| 규칙 | 내용 |
|------|------|
| 기록 조건 | **수정 + QA PASS 확인된 것만** Lesson으로 기록 |
| 금지 | 미검증 문제 · 추측 · "아마" 원인을 Governance에 추가 |
| 분류 | Product vs QA Harness **반드시** 구분 기록 |
| 범위 | cross-domain(Admin+RE 등) vs domain-specific 명시 |
| 충돌 | 기존 Governance와 충돌 시 **최신 검증 Lesson** 우선 정리 |
| 구조 | 새 Question Architecture **생성 금지** — 기존 Master에 Lesson **누적** |

### Verified Lessons — Admin Master (2026-09, cross-domain)

아래는 **실제 수정·Playwright PASS** 확인된 교정 원칙 (추측 아님):

1. **Phase1 evidence gate** — 질문 완료 후 signup **직전** optional gate; continue = answers snapshot + File|null terminal transition.
2. **Phase2 evidence gate** — `Phase2 questions complete` **이후에만** upload panel; Phase1 `storagePath` **덮어쓰기 금지**.
3. **Member handoff** — `is*MemberProfilingHandoff`는 `*MemberSubmitting===true` 동안만; page-level **45s bounded timeout** + `releaseMemberHandoffToSignupRetry` backup.
4. **AI Report / Expert handoff** — fresh path: `/documents?leadId=…&mode=ai_report|expert` (+ auto-login when needed); **동일 leadId** 유지.
5. **E2E harness (QA)** — Phase1 runner에 evidence skip **필수**; 1차 CTA `개인화 상세검토 하기`; `/documents` assertion은 **실제 h1** (`… · AI 리포트 진행`) 기준 — MODE_COPY heading과 혼동 금지.
6. **Product vs Harness** — evidence gate 추가 후 E2E가 questions→signup 직행 가정하면 **Harness FAIL** — Product 되돌리지 않음.

다음 Mission **Architect 사전 검사**: 위 6항 해당 여부 + Canonical Funnel 12단계 순서 위반 여부.

## 불변 원칙 (요약)

- Engine: **CHECK → VERIFY → REGISTER → PROTECT** (이름·순서 변경 금지)
- 고객 UI 가격 노출 금지 · 전문가 라벨 `VFBCAI 전문가팀`만
- 법률 확정 표현·미확인 사실 생성 금지
- **One Change → One Scope** · **MINIMUM CHANGE / FILES / RISK**

## Mission 시작 체크

1. 목표 **한 가지** 고정
2. Engine·서비스·CASE·Re-entry 영향 확인
3. Risk: HIGH | MEDIUM | LOW (헌법 §15)
4. 금지: unrelated refactor, cross-service 복사, TRC(d0378ee) 임의 변경

## Re-entry (고정)

NEW CASE / EXISTING CASE / `?start=check` / `?restore=1` / Landing CTA / Result CTA — 헌법 §5. 임의 변경 금지.

## Situation Profile · Funnel

- `vfbcai-funnel-profile.mdc` 준수
- Situation Profile ≠ 고객-facing 설문 · 확인된 사실 재질문 금지
- 직접 설명하기 = 별도 UX (numbered option 아님)

## Case Continuity / Expert Handoff (헌법 §16)

**최종 목적**: 질문 수가 아니라 **Case Profile 축적 → 반복 설명 없는 전문가 연결**.

| 원칙 | 요약 |
|------|------|
| Single Source of Case Truth | 자연어·1차/2차 답·직접입력·증거·문서 추출·쟁점·CASE 등 → Case Profile 자산 |
| NEVER ASK AGAIN | 1차·문서·직접입력으로 확보된 사실 재질문 금지 (충돌·범위 확인·필수 missing은 예외, 이유 명시) |
| Depth not Repeat | 2차 = 1차 기반 **깊이** 추적, 단순 반복·세분화 금지 |
| Document-First | 문서로 확인된 사실은 Profile 반영 후 **다음 판단** 질문만 |
| Phase density | 1차 < 2차 정보 밀도 · 질문 수 고정 금지 |
| Data pipeline | 입력 → Profile → 결과 → Expert handoff (Profile 근거 판단) |

**Expert handoff 성공**: 전문가 단계에서 "처음부터 설명해주세요"류 **재수집 금지** (Profile 기반 미확인·쟁점만).

**MASTER 범위**: Real Estate = 검증 Master → VERIFY/CHECK/REGISTER/PROTECT 확장. 서비스별 questions/CASE/fields만 변경.

**구현 시**: 확정된 Admin Phase2 등 기존 구조 **재사용·확장** 우선 · 임의 신규 설계 금지 (헌법 §16.12).

### 질문 품질 GATE (§16.7 — 설계·구현 전 필수)

① 재질문 없음 ② 결과 판단 용도 ③ 이전 답/문서 연결 ④ 상황 구분 가능
⑤ 선택지 충분 ⑥ 추상 축약 금지 ⑦ 직접 입력 가능 ⑧ Profile 저장
⑨ 후속 질문/결과 활용 ⑩ Expert handoff 도움

**하나라도 NO → 질문 구현·Brief 포함 금지.**

## MASTER QUESTION ARCHITECTURE — FINAL / PERMANENT (v1.2)

### ONE RESULT (오해 금지)

- **ONE RESULT** = **결과 화면 개수** 원칙 (Phase 1 결과 화면 1개 등). 질문 깊이·정보 수집·프로파일링 깊이를 줄이라는 의미 **아님**.

### 최종 목표 (단순 결과 생성 아님)

고객 상황 → Situation Profile → 사건/상황 추적 → 필요한 사실 → 증거 → 관계/시간/행위 → 핵심 쟁점 → 해결 목표 → **전문가 수준 Case Profile 축적** → Expert Handoff 시 **같은 사건을 처음부터 다시 설명하지 않음**.

### 복잡도 → 질문량 (고정 금지)

- 단순 사건: 짧게 종료 가능.
- 복잡 사건: **10/15/20개 이상** 질문 · **다중 Branch** 허용.
- CASE 수·질문 수 **고정 금지**. 복잡도가 결정.

### 조사/프로파일링 사고방식 (UI 복제 아님)

범죄 수사 UI를 복제하지 않되, 아래 축을 **추적**한다:

목표/주장 → 사건 시작 → 시간순서 → 당사자 → 행동 → 상대방 반응 → 문서/계약 → 금액 → 사실 → 주장 → 증거 → 일치/불일치 → 관계 → 현재 상태 → 핵심 쟁점 → 해결 목표

### Fact Taxonomy (추측을 사실로 저장 금지)

| 유형 | 저장 규칙 |
|------|-----------|
| **CONFIRMED FACT** | 고객이 직접 확인했거나 자료와 대조된 사실 |
| **CUSTOMER CLAIM** | 고객 주장·기억 — 확인 전 |
| **COUNTERPARTY CLAIM** | 상대·기관 주장 — 확인 전 |
| **DOCUMENT FACT** | 문서·계약서 **기재** — 원본 대조 전 확정 아님 |
| **INFERRED RELATION** | 답변 조합 추론 — 사실 아님 |
| **UNKNOWN** | 미확인 — 2차 drill-down 대상 |
| **EVIDENCE** | 해당 사실 확인 경로·자료 **유형** (upload attachment와 구분) |

AI가 Claim·Inference를 Confirmed처럼 취급 **금지**.

### Profiling Stop Condition (Mission Stop과 구분)

- **Profiling Stop** ≠ "결과를 만들 수 있음"만으로 판단.
- 해당 사건을 **판단/대응하는 데 필요한 핵심 정보가 충분히 재구성**되었는지로 판단.
- **최소 질문** = 불필요한 질문 제거 · **필요한 질문 생략 금지**.

### 1차 / 2차 (질문 수 분할 아님)

| Phase | 역할 |
|-------|------|
| **1차 (Situation Skeleton)** | 사건 **기본 골격** — 상황·단계·목적·문서·당사자·1차 gap → Phase 1 ONE RESULT |
| **2차 (Investigative Deepening)** | 1차 Known **carry-over/skip** · Unknown/Conflict/Risk **drill-down** — 1차 **재분류·재질문 아님** |

- 1차 < 2차 **정보 밀도·판단 수준** 구분. 2차를 형식적 추가 질문으로 취급 **금지**.
- 정상 사건: 짧게 종료 가능 · 복잡 사건: **필요한 만큼** 깊게 (고정 N **금지**).

### NEVER ASK AGAIN (유지)

이미 확보된 사실 재질문 **금지**. 예외: 충돌·변경·범위 확대·판단상 material missing — **이유 명시**.

### 질문 연결 체인 (필수)

모든 질문은 아래 연결을 가져야 한다:

**질문 목적 → Profile field → Branch → Result/Judgment → Next Action**

결과와 연결되지 않는 질문 **금지**.

### 선택지 (짧게 줄이기 아님 · Branching 필수)

- 선택지는 **짧게** 만드는 것이 목표 **아님** — **서로 다른 실제 상황**을 의미해야 함.
- 각 선택지는 가능한 경우: Profile 값 · Fact Type · **다음 질문 / Skip / 추가 추적 / 결과 판단** 중 하나 이상 발생.
- **모든 선택지가 동일 후속 질문** → 상황추적 관점 **미설계** — 구현 전 기존 branching 사용 여부 **먼저 확인**.
- 맞지 않으면 **직접 설명 입력** → Profile 보존 (numbered option 아님).

### Result 생성 파이프라인

**Answer → Profile → Judgment → Result**

- 1차 결과와 2차 개인화 결과의 **정보 깊이·판단 수준** 구분.

### 유지·발전 (삭제 금지)

Question Library · Situation Profile · CASE · Resolution Path · Adaptive Branch · Evidence · Expert Handoff · Case Continuity — **모두 유지·발전**.

**UX 단순화**를 이유로 전문가 판단에 필요한 정보를 삭제 **금지**.

### 금지 해석 (Agent 공통 — 검색·교정 대상)

- ONE RESULT 때문에 질문을 줄인다
- 결과 생성 가능 여부만으로 Profiling Stop
- 2차를 형식적 추가 질문으로 취급
- 질문 수·CASE 수 고정
- 짧은 질문/짧은 선택지 우선
- 확보 사실 재질문 (예외 없이)
- 결과·Profile·Judgment와 연결되지 않는 질문 허용

## 검증 기준

| Risk | tsc | diff | Browser QA |
|------|-----|------|------------|
| HIGH | 필수 | 필수 | 필수 (PC + Mobile 375px) |
| MEDIUM | 필수 | 필수 | 필요 시 |
| LOW | 필수 | 권장 | 스크린샷 |

- `npx tsc --noEmit` — TypeScript 통과 ≠ Browser PASS
- UI/레이아웃 범위: `.cursor/rules/06-ui-design-responsive-typography-qa.mdc` — 깨지지 않음만으로 PASS 금지
- Golden Case (VERIFY CASE_01, CASE_02): 명시 승인 없이 수정 금지
- 회귀: `/verify/admin`, `/check/trc` 영향 시 필수

## Git / Deploy

Agent는 Ace 명시 승인 없이 `git commit`, `git push`, Production deploy **금지**.

## RESULT CTA ARCHITECTURE — FINAL

1. 1차 종합 결과 하단 CTA는 단순 inline button 나열이 아니다.
2. 무료 AI 정리와 유료 개인화 상세검토의 "얻는 가치"를 각각 설명하는 **선택 박스 구조**를 사용한다.
3. 1차 CTA는 2차 결과 CTA(`VerifyResultDualActionCards` 계열)와 **동일한 디자인 언어**를 사용하되 목적과 route는 분리한다.
4. 1차 CTA의 핵심 목적: 사용자가 "지금 확인된 것"과 "더 깊이 확인하면 얻을 수 있는 것"을 구분하도록 돕는 것.
5. 유료 CTA에는 실제 Profile/결과와 연결되는 **예방적** 후킹 메시지를 사용할 수 있다.
6. 확인되지 않은 위험을 확정적인 위험처럼 표현하지 않는다.
7. CTA 변경 시 기존 business logic / route / CRM / data flow는 유지한다.
8. Result 하단 CTA / 안내 / footer의 container 구조는 서로 시각적으로 단절되지 않도록 한다.
9. 하단 UI 수정은 임의 margin 조정이 아니라 **실제 DOM/container 구조**를 먼저 확인한다.
10. 1차/2차 결과 CTA는 서로 다른 목적을 가지며 UI만 통일한다.

## MASTER RESULT FUNNEL STATE TRANSITION — FINAL

1. Phase1 질문 완료 후 Phase1 간단 자료는 **회원가입 직전 optional evidence gate**다.
2. Phase1 evidence gate 정상 경로: **자료 첨부 → signup** · **자료 없이 계속 → signup** 뿐이다.
3. Phase1 evidence continue 이후 질문 화면 / Q1 / evidence panel 재노출 **금지**.
4. evidence continue = **answers snapshot + File|null** parent/page terminal transition.
5. 파일 첨부 여부와 관계없이 **evidence gate → signup → 1차 결과** 순서 유지.
6. UI 존재만으로 transition 정상 판단 금지 — handler → parent → page → signup → result 전 경로 검증.
7. 각 gate는 **단방향** 전환; accidental re-render로 이전 질문 화면 복귀 허용하지 않음.
8. Phase1 evidence와 Phase2 evidence는 state / metadata / storage / restore에서 **분리**.
9. RE Master 오른쪽 QUOTATION REPORT rail에 「내 상황 검토하기」/「자세히 보기」 **중복 CTA 금지**.
10. Master side rail = 정보·신뢰 보조; 실제 Funnel CTA와 **중복 행동 버튼 금지**.
11. 한번 해결된 Funnel transition은 이후 UI Mission에서도 **regression 대상**.

## MASTER FUNNEL UI / STATE CONTINUITY — FINAL

1. 질문 Funnel과 Evidence Funnel은 서로 다른 단계다.
2. Evidence CTA를 클릭했다고 해서 완료된 질문 화면을 다시 렌더링하지 않는다.
3. 질문 완료 → Evidence → Signup → Result는 명확한 단방향 State Transition이다.
4. 이미 완료된 질문 단계는 Evidence 단계에서 다시 mount/re-enter되지 않아야 한다.
5. Evidence CTA 문제는 CSS/visibility로 숨기지 않고 CTA → handler → state → parent → route → render 전체를 추적하여 해결한다.
6. 「자료제출」/「자료 포함하고 계속하기」/「자료 없이 계속하기」/파일 첨부 label 등 동일 표현이 여러 화면에 있을 수 있으므로 실제 클릭 위치와 연결된 handler를 확인하지 않고 수정하지 않는다.
7. Phase1 Evidence와 Phase2 Evidence는 서로 다른 state와 transition으로 관리한다.
8. Phase1 Evidence 완료 후: signup → 1차 result. Phase2 Evidence 완료 후: 2차 result.
9. Evidence 단계에서 이전 질문을 재질문하거나 질문 화면을 다시 노출하는 것은 Funnel Regression이다.
10. Phase1 STOP은 `realEstatePhase1TerminalReached` / `realEstatePhase1EvidenceDone` latch로 evidence·signup gate 동안 유지한다.
11. Result 화면의 보조 안내 영역은 Master Result 확정 정보 구조와 중복되면 제거 대상으로 검토한다.
12. Real Estate Master에서 확정 제거 UI: 질문 rail 「내 상황 검토하기」/「자세히 보기」; 1차 결과 하단 `getMasterLandingPageHeader(review)` duplicate header(「검토 항목 안내」).
13. 위 UI 제거는 다른 서비스/Admin/TRC에 전파하지 않는다.
14. Code PASS는 Browser PASS가 아니다.
15. 실제 브라우저에서 확인하지 않은 Funnel Transition은 NOT VERIFIED로 기록한다.

## MASTER FUNNEL TRANSITION INTEGRITY — FINAL

1. Evidence 완료 후 이전 Question 화면이 다시 렌더링되면 Funnel Regression이다.
2. Evidence → Signup → Result 전환 중 transient state 때문에 이전 단계 UI가 사용자에게 노출되어서는 안 된다.
3. terminal gate가 완료된 이후 parent seed synchronization, useEffect, answer restoration 등이 terminal state를 되돌려서는 안 된다.
4. `setTimeout`, 임의 loading delay, CSS visibility 등으로 transient regression을 감추는 것은 해결책으로 인정하지 않는다.
5. Funnel transition bug는 CTA → handler → state → parent → child → effect → render 전체 체인을 추적하여 ROOT CAUSE를 해결한다.
6. 실제 브라우저에서 0초에 가까운 정상적인 transition이어야 하며, 이전 단계 화면이 잠시라도 사용자에게 보이는 경우 PASS가 아니다.
7. "최종 결과가 정상적으로 나온다"만으로 transition PASS를 선언하지 않는다.
8. 모든 terminal gate는 단방향이어야 한다.
9. Phase1: Question → Evidence → Signup → First Result.
10. Phase2: First Result → Personalized Questions → Evidence → Second Result.
11. 이미 완료된 단계로 reverse transition 금지.
12. Result 화면에서 확정적으로 제거된 보조 UI는 다른 서비스에 임의 전파하지 않는다.
13. Real Estate 1차 Result에서 제거: 미리보기; 비용/진행 방식 안내 문구 영역; 「검토 항목 안내 - 베트남 법률전문 AI」 영역.
14. 위 삭제 항목은 Real Estate Master Result에만 적용한다.
15. 실제 브라우저에서 발견된 Funnel Regression은 원인과 수정 원칙을 Agent Skill/Rule에 누적하여 다음 Mission에서 재발하지 않도록 한다.
16. Phase1 evidence 완료 시 `realEstateVerifyPhase1EvidenceComplete` parent sticky gate와 `isRealEstateQuestionScreenSuppressed`로 member handoff·signup·result 전환 중 질문 UI 재노출을 차단한다.
17. funnel 단계 전환 중 어떤 intermediate async state에서도 이전 질문 화면을 fallback으로 렌더하지 않는다.
18. evidence → member handoff → result는 단방향 terminal transition이다.
19. `isAwaitingSignup=false`만으로 question UI fallback 렌더 금지 — member handoff / `submitAsMember()` async 구간은 question suppression 대상이다.
20. 병렬 boolean gate 구조에서는 terminal transition 중 **vacuum state**(모든 awaiting=false)를 `isRealEstateQuestionScreenSuppressed` 등으로 명시 차단한다.
21. transition bug는 state 추가보다 render guard와 state transition 체인을 먼저 추적한다.
22. Browser E2E에서 transition 중간 화면(question title / progress / QUESTION GUIDE / OFFICIAL SOURCES) 0회 확인 없이 PASS 금지.

## MASTER MEMBER HANDOFF ASYNC TERMINAL EXIT — FINAL

**Mission 근거**: `MASTER-MEMBER-HANDOFF-HANG-FINAL-FIX` — Real Estate·Admin 실제 브라우저 trace로 ONE ROOT CAUSE 확정.

### ONE ROOT CAUSE (재발 방지 — UI guard만으로 해결 불가)

1. MEMBER_HANDOFF(`skipSignup=true`) → `submitAsMember()` → `setSubmitting(true)` → `await insertMemberVerifyLead(...)` (leads → crm → `/api/lead-submit` chain).
2. 해당 await가 **resolve/reject 없이 무한 pending**이면 `setSubmitting(false)` · `set*MasterSignupComplete(true)` · FIRST_RESULT gate 개방에 **도달하지 못함**.
3. 결과: `submitting===true` + handoff===true → **loading panel 영구 유지** → FIRST_RESULT 미개방.
4. render guard·question suppression만 추가해도 **async chain terminal exit 없으면** infinite loading은 해결되지 않음.

### Terminal Exit (필수 — 4종)

모든 비동기 MEMBER_HANDOFF는 아래 **terminal exit 중 하나**로 반드시 종료한다.

| Exit | UI 종료 상태 | 금지 |
|------|-------------|------|
| **SUCCESS** | `submitting=false` → signupComplete → FIRST_RESULT | — |
| **FAILURE** | `releaseMemberHandoffToSignupRetry()` → SIGNUP RETRY + error | signupComplete 위조 금지 |
| **EXCEPTION** | 동일 — 기존 failure UX 재사용 | 새 UI 금지 |
| **TIMEOUT** | bounded timeout 후 FAILURE와 동일 terminal | DB/CRM 성공 간주 금지 |

**절대 금지**: MEMBER_HANDOFF → loading visible → **계속 visible** (infinite loading).

### Loading State 원칙

1. UI loading state를 pending promise의 **성공적 resolve에만** 의존시키지 않는다.
2. `submitting=true` 설정 시 **반드시** SUCCESS / FAILURE / EXCEPTION / TIMEOUT / `finally` 중 하나로 `submitting=false` 또는 동등 terminal release를 보장한다.
3. timeout은 **UI unlock용 terminal failure**일 뿐 — 백엔드 성공으로 간주하지 않는다.
4. bounded timeout(`Promise.race` · `AbortSignal` 등) 또는 **동등한 안전 탈출 경로**를 `insertMemberVerifyLead` await(또는 동등 member attach chain)에 둔다.
5. page-level `submitAsMember()`에서 해결 우선 — shared lib(`restoreVerifyLead.ts` 등) 변경은 page-level로 불가능할 때만, 사유 명시.

### Terminal Transition (단방향)

1. evidence → member handoff → (SUCCESS) FIRST_RESULT — **단방향**.
2. evidence → member handoff → (FAILURE|EXCEPTION|TIMEOUT) **기존 SIGNUP RETRY UX** — 질문 UI·이전 단계 UI로 되돌아가면 **FAIL**.
3. 실패 경로에서도 질문 화면 flash 0회 — suppression guard는 보조, **async terminal exit가 1차**.
4. SUCCESS 경로의 기존 정상 흐름(`signupComplete` · `landingDone` · FIRST_RESULT)을 **절대 깨뜨리지 않는다**.

### Cross-Domain Master Funnel (공통 원칙)

Real Estate · Admin 등 **모든 Master VERIFY funnel**에 동일 적용:

- `submitAsMember()` + member attach async chain = **동일 terminal exit 패턴**
- 한 서비스만 guard 추가하고 다른 서비스 pending hang 방치 **금지**
- reference: `src/app/verify/real-estate/page.tsx` · `src/app/verify/admin/page.tsx` — `awaitMemberVerifyLeadInsert` + `releaseMemberHandoffToSignupRetry` + `finally` safety

### 실패 패턴 (Architect·Verifier 검색 대상)

- E2E SUCCESS만 PASS하고 **forced hang/timeout 경로 미검증**
- loading panel 조건 추가만 하고 `submitAsMember` await terminal exit 미구현
- timeout 후 `signupComplete=true` 위조
- failure 시 question UI 일시 노출 (Funnel Regression)
- localhost 빠른 완료(≈1–2s)만 보고 production hang 재현 경로 무시

### Browser QA (MEMBER_HANDOFF Mission 필수)

각 Master funnel(RE · Admin 등)에서 **SUCCESS와 TIMEOUT 두 경로**를 실제 브라우저로 구분 검증:

| Path | 확인 |
|------|------|
| A SUCCESS | loading → FIRST_RESULT |
| B TIMEOUT/HANG | loading visible → timeout 이내 hidden → signup retry + error · FIRST_RESULT 없음 |
| 공통 | transition 중 question flash 0회 |

**PASS 조건**: loading visible → (success 또는 timeout) → **loading hidden**. loading → 계속 visible = **FAIL**.

## UI / DESIGN / RESPONSIVE / TYPOGRAPHY FINAL QA — FINAL

**권위**: Ace 확정 제품 방향 (2026-09-20). 헌법 §10 UI QA. Rule: `.cursor/rules/06-ui-design-responsive-typography-qa.mdc`.
**적용**: UI·레이아웃·타이포·반응형 Mission. 미충족 시 **UI QA PASS 금지**. 깨지지 않음만으로 PASS 금지.

### Responsive Design (불변)

PC와 Mobile은 **동일한 화면을 단순 축소하는 관계가 아니다.**
**Business logic과 정보의 의미는 동일**하게 유지한다. 표현 방식만 달라야 한다.

| | PC — Full Information Experience | Mobile — Focused / Simplified Experience |
|---|---|---|
| 목적 | 한 화면에서 더 많은 정보를 이해 | 필요한 정보만 가장 읽기 좋게 |
| 허용 | 넓은 화면 · 2-column / rail / 상세 정보 | 세로 재구성 · 장식·반복 시각 축약 |
| 금지 | 과한 content width · 정보가 너무 작음 · 어색한 공백 | PC 전 요소 복제 · 중요 글자 무조건 축소 |

Mobile 재구성 예:

```
PC:     [Title] [Description] [Metadata] [Card] [Secondary Card] [Sidebar] [CTA]
Mobile: [Title] [핵심 내용] [핵심 Card] [필요한 보조 정보] [CTA]
```

### Mobile — 축약 vs 절대 숨김 금지

**축약·제거 검토** (PC에 있다고 Mobile에 동일 표시 금지):
중복 설명 · 긴 helper text · 반복 metadata · 장식 · PC-only side rail · 과한 card structure · 불필요 secondary.

**절대 숨기지 않음**:
현재 단계 · 핵심 질문 · 선택지 · 핵심 결과 · 중요한 위험/확인 사항 · 다음 행동 · Evidence 핵심 정보 · AI Report · Expert CTA.

확정된 핵심 결과 섹션을 “답이 없다”는 이유로 제거하는 것은 기존 UX 보호 규칙과 충돌 — **의미 삭제 금지**, 시각 축약만 허용.

### Typography Hierarchy (L1–L5)

폰트 크기는 **화면마다 독립 설계**. 숫자 차이보다 **무엇이 중요한지 즉시 이해**되게 한다. 각 단계는 시각적으로 충분히 구분.

| Level | 역할 |
|-------|------|
| **L1** | Page / Main Title — 가장 큰 정보 |
| **L2** | Section Title — 주요 section |
| **L3** | Question / Important Heading — 현재 질문 또는 핵심 정보 |
| **L4** | Body / Answer / Main Content — 실제 읽는 내용 |
| **L5** | Helper / Metadata / Secondary — 보조 정보 |

**Mobile typography**: 글자를 무조건 축소하지 않는다. 질문 · 선택지 · 결과 핵심 문장 · CTA는 **충분히 읽기 쉬운 크기**. metadata / helper / secondary만 상대적으로 낮춘다.

### 한글 줄바꿈 · Overflow · Font-size

**FAIL (적극 수정)**:
1. 어색한 분절 — 허용: `"행정문서 검토가" / "필요합니다."` · FAIL: `"행정문서" / "검토가 필요합" / "니다."` · `"개인화된" / "검토"` 같은 마지막 단어만 낙오
2. 제목 마지막 단어만 다음 줄
3. 버튼 문구 어색한 2줄 (의미 유지하며 font-size / padding / width / min-width / letter-spacing)
4. 한글+영어+숫자 비정상 wrapping
5. 긴 단어 / URL / 영문 card overflow

자연스러운 줄바꿈: 제목 1~2줄 · 핵심 질문 2~3줄 · 본문 문단 · CTA 1줄 우선. 한 줄 맞추려 **font-size 과축소 금지**.

**Text overflow FAIL** (특히 375px): card/button/heading 침범 · horizontal scrollbar · 긴 단어로 layout 폭 증가 · badge 깨짐 · 숫자 잘림 · 의미 훼손 ellipsis · 고정 높이로 text 잘림.

**Font-size 우선순위** (문제 시 무조건 축소 금지):
1. container width → 2. padding → 3. line-height → 4. letter-spacing → 5. text width → 6. 적절한 font-size.
Mobile 성공 = **읽기 좋은 크기로 자연스럽게 배치**. 글자를 줄여 넣은 것은 성공이 아님.

### Beauty Check (UI QA 필수 — 전부 YES여야 PASS)

**Mobile**: 첫 화면 복잡하지 않음 · 할 일이 바로 보임 · 제목 크기 적절 · 질문 읽기 쉬움 · 선택지 충분히 큼 · card가 과하지 않음 · 불필요 설명이 핵심을 밀어내지 않음 · 줄바꿈 자연 · 마지막 단어만 낙오 없음 · 버튼 문구 깨지지 않음 · 화면 밖 요소 없음 · 좌우 여백 균형 · 상하 spacing 일정 · 1차/2차 결과 시각 구분 · 하나의 제품처럼 정리됨.

**PC**: 넓은 화면 적절 활용 · content width 과하지 않음 · 제목/본문 hierarchy 명확 · sidebar/rail이 본문 방해 안 함 · 카드 과반복 없음 · section spacing 일관 · CTA hierarchy 명확 · 정보가 너무 작지 않음 · 빈 공간 어색하지 않음 · SaaS 수준 정돈.

### Agent 적용

| Agent | 의무 |
|-------|------|
| **ARCHITECT** | Brief Design에 PC Full vs Mobile Focused · Mobile 축약 목록 vs 절대 숨김 금지 · L1–L5 · 375px wrap/overflow done criteria |
| **IMPLEMENTER** | Brief 범위 UI에서 PC 축소 복제 금지 · 절대 숨김 항목 유지 · font-size는 최후 수단 · 한글 wrap/overflow 수정 |
| **VERIFIER** | PC + 375px Beauty Check · 한글 줄바꿈 · overflow. 미확인 = NOT VERIFIED. 미충족 = FAIL. 깨지지 않음만으로 PASS **금지** |

## 참조

- Funnel QA: `.cursor/skills/vfbcai-funnel-qa/SKILL.md`
- Team: `.cursor/skills/vfbcai-team-orchestrator/SKILL.md`
- UI QA Rule: `.cursor/rules/06-ui-design-responsive-typography-qa.mdc`
