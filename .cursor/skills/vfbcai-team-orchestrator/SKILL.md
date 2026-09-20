---
name: vfbcai-team-orchestrator
description: >-
  VFBCAI AI Development Team v1.4 오케스트레이션. LESSON → GOVERNANCE LOOP +
  VERIFY MASTER CANONICAL FUNNEL 동기화. EXPERT INVESTIGATIVE PROFILING /
  QUESTION-FIRST + MASTER QUESTION ARCHITECTURE (FINAL/PERMANENT) 유지.
  UI / DESIGN / RESPONSIVE / TYPOGRAPHY FINAL QA 적용.
  Ace Mission을 ARCHITECT → IMPLEMENTER → VERIFIER → [LESSON SYNC] 파이프라인으로 라우팅.
  Mission 시작·핸드오프·승인 게이트 관리 시 사용.
disable-model-invocation: true
---

# VFBCAI Team Orchestrator (v1.4)

Ace가 세부 지시 없이 Mission만 제시해도 팀이 헌법·Master Skill v1.4에 따라 수행한다.

## Pipeline (ROOT CAUSE FIRST)

```
1. ARCHITECT  → Full Funnel 조사 · Root Cause 확정 · Mission Brief
2. [Ace]      → Brief 승인 (HIGH/MEDIUM 필수)
3. IMPLEMENTER → Exact Scope · 1회 구현 + tsc + diff
4. VERIFIER   → Browser · Profile · Branch · 증거 기반 QA (vfbcai-funnel-qa)
5. [Ace]      → 제품 방향·Production 배포 판단
6. [LESSON]   → PASS 확인 시 Master Skill + Agent Governance 영구 반영 (Governance Mission)
```

**금지**: Root Cause 미확정 IMPLEMENTER 착수 · 국소 패치 연쇄 · 제품 문제를 QA/E2E 수정으로 해결 · tsc만으로 완료 선언 · **미검증 Lesson Governance 기록**.

## VERIFY MASTER CANONICAL FUNNEL (Architect·Verifier 공통)

Master Skill § **VERIFY MASTER CANONICAL FUNNEL — FINAL** — **절대 혼동 금지**:

```
1차 질문 → 1차 간단자료(optional) → 가입 → 1차 종합결과 → 개인화 상세검토
→ 2차 질문(디테일/고도화) → 2차 branching → 2차 질문 완료 → 2차 상세자료
→ 2차 종합결과 → AI Report → 전문가 → 재진입
```

| Anti-confusion | 규칙 |
|----------------|------|
| 1차 간단자료 ≠ 2차 상세자료 | state/meta/storage 분리 |
| 1차 결과 ≠ 2차 결과 | builder·판단 깊이 분리 |
| 1차 질문 ≠ 2차 질문 | Phase2 = Phase1 이어받기 · 반복 금지 |
| 2차 evidence | **2차 질문 완료 후에만** · 완료 후 **반드시** 2차 결과 |
| Continuity | 동일 Case/leadId/Profile |

## Step 1 — ARCHITECT

Subagent: `vfbcai-architect`

입력: Ace Mission (자연어 목표)
출력: **Mission Brief** (아래 템플릿)

**조사 순서** (문제 Mission): 현상 → **전체 퍼널** 코드 추적 → Root Cause 확정 → Exact Scope → Brief

**Case Continuity 체크** (질문/Profile/결과/Expert Mission): 헌법 §16 · Master Skill v1.3 **EXPERT INVESTIGATIVE PROFILING** · **MASTER QUESTION ARCHITECTURE** · `vfbcai-funnel-profile.mdc`

**Architect v1.4 사전 검사** (VERIFY Master Mission):
- Master Skill § Verified Lessons (Admin 2026-09) 6항 해당 여부
- Canonical Funnel 12단계 순서·gate 위반 여부
- Phase2 evidence가 Phase2 questions **전**에 노출되지 않는지

**Architect v1.3 필수 검증**:
- Question → Answer → Profile → Branch → Judgment → Next Action
- 1차 Skeleton · 2차 Deepening · Phase1 Known → Phase2 Skip
- Fact Taxonomy (CONFIRMED / CLAIM / DOCUMENT / INFERRED / UNKNOWN / EVIDENCE)
- Evidence **질문** ≠ Upload · Master 질문/branching **재사용** · 서비스별 독립 선형 chain **금지**
- ONE RESULT = 결과 화면 개수 (질문 깊이 축소 **아님**)
- Profiling Stop = 핵심 정보 재구성 기준 (결과 생성 가능만 **아님**)
- NEVER ASK AGAIN · Product vs QA Harness 분리

## Step 2 — Ace 승인

HIGH/MEDIUM: Brief 확인 후 IMPLEMENTER 착수.
LOW: Ace가 IMPLEMENTER 직접 지시 가능 (헌법 §15).

## Step 3 — IMPLEMENTER

Subagent: `vfbcai-implementer`

입력: 승인된 Mission Brief (**Root Cause·Exact Scope 포함**)
출력: **Implementation Report**

**금지**: Root Cause 미확정 코드 수정 · 신규 namespace/선형 question chain · Brief 밖 구조 신설.

## Step 4 — VERIFIER

Subagent: `vfbcai-verifier`

입력: Mission Brief + Implementation Report
Skill: `vfbcai-funnel-qa` (퍼널 QA 시)
출력: **QA Report** — 항목별 PASS | FAIL | NOT VERIFIED | BLOCKED

**완료 인정**: Brief 범위 Browser — Canonical Funnel 단계별 (질문 → 1차 evidence → signup → 1차 결과 → 개인화 → 2차 질문 → 2차 evidence → 2차 결과 → Report → Expert · 해당 시). UI 범위면 **UI FINAL QA** (PC Full vs Mobile Focused · L1–L5 · 한글 wrap · overflow · Beauty Check). **증거 없는 PASS 금지.** 깨지지 않음만으로 UI PASS 금지.

## Step 6 — LESSON → GOVERNANCE (Governance Mission)

Mission: `VFBCAI_LESSON_TO_GOVERNANCE_PERMANENT_SYNC` 또는 Ace 지시 시.

```
PASS 확인 → Master Skill 기록 → 05-rule + 3 Agent 반영 → 다음 Mission 사전 검사 항목화
```

| 규칙 | 내용 |
|------|------|
| 기록 조건 | 수정 + QA PASS **확인된 것만** |
| 금지 | 추측 · 미검증 문제 · Product를 Harness로 대체한 "해결"을 Lesson으로 기록 |
| 범위 | Governance 문서만 — **제품·E2E·DB 수정 금지** |
| tsc | 제품 코드 미변경 시 **실행 불필요** |

## Step 5 — Ace

제품 방향 확정 · commit/push/deploy 승인.

---

## Mission Brief Template

```markdown
# Mission Brief — [제목]

## Goal (1 sentence)
## Engine / Service / CASE
## Risk: HIGH | MEDIUM | LOW
## Root Cause (문제 Mission — 확정 전 IMPLEMENTER 금지)
- Symptom:
- Full funnel trace: (Canonical Funnel 12단계 대조)
- Root cause:
- Exact scope:
- Prior Verified Lessons applicable: (Master Skill § Verified Lessons)
## Scope Lock
- In scope:
- Out of scope:
- Files (예상):
## Design
- UX/UI: **PC = Full Information · Mobile = Focused / Simplified** (단순 축소 아님 · 의미 동일)
- Mobile 축약 vs 절대 숨김 금지 (단계·질문·선택지·핵심 결과·위험·다음 행동·Evidence·AI Report·Expert CTA)
- Typography L1–L5 (PC/Mobile 독립) · 한글 wrap · overflow · font-size 최후
- Questions / Profile / CASE / Branch: **기존 Master·상황추적 구조 재사용** (신규 질문/선택지/namespace 없음 unless Ace 명시)
- Investigative pipeline: Question → Answer → Profile → Branch → Judgment → Next Action
- Case Continuity (§16 · v1.3): Phase1 known → Phase2 skip/drill-down · Document-first · Expert handoff fields
- Question Quality Gate (§16.7): each Q — judgment purpose + GATE ①–⑩
- Fact Taxonomy: CONFIRMED FACT / CUSTOMER CLAIM / COUNTERPARTY CLAIM / DOCUMENT FACT / INFERRED RELATION / UNKNOWN / EVIDENCE
- Evidence: question axis vs upload gate (별개)
- Profiling Stop (v1.3): case reconstructable for judgment — NOT "can generate result" only
- ONE RESULT note: result screen count only — does NOT limit question depth
- Product vs QA Harness:
- Re-entry impact:
## Done Criteria (tsc + Browser — Brief 범위)
## Regression Targets
## Stop Conditions (Mission / Human Boundary — distinct from Profiling Stop)
```

## Implementation Report Template

```markdown
# Implementation Report
## Root Cause / Exact Scope (Brief 대조)
## Modified files
## What changed / NOT changed
## Existing logic preserved (Master structure reused?)
## npx tsc --noEmit: PASS | FAIL
## git diff --name-only / --stat
## Blockers for VERIFIER
```

## QA Report Template

```markdown
# QA Report
## Scope / Risk
## tsc: PASS | FAIL | N/A (tsc PASS ≠ Mission complete)
## Browser QA (PC + 375px): [paths]
## Checklist (14항): [each PASS|FAIL|NOT VERIFIED|BLOCKED]
## UI / DESIGN / RESPONSIVE / TYPOGRAPHY FINAL QA (when UI/layout/typography in scope)
- PC Full Information Experience: PASS|FAIL|NOT VERIFIED|N/A
- Mobile Focused/Simplified (not PC shrink): PASS|FAIL|NOT VERIFIED|N/A
- Mobile never-hide (단계·질문·선택지·핵심 결과·위험·다음 행동·Evidence·AI Report·Expert CTA): PASS|FAIL|NOT VERIFIED|N/A
- Typography L1–L5 distinct (PC + Mobile independent): PASS|FAIL|NOT VERIFIED|N/A
- Korean wrapping / last-word orphan / CTA line break: PASS|FAIL|NOT VERIFIED|N/A
- Text overflow (375px strict): PASS|FAIL|NOT VERIFIED|N/A
- Font-size last (not shrink-to-fit): PASS|FAIL|NOT VERIFIED|N/A
- Mobile Beauty Check (all YES with evidence): PASS|FAIL|NOT VERIFIED|N/A
- PC Beauty Check (all YES with evidence): PASS|FAIL|NOT VERIFIED|N/A
- 1차 vs 2차 결과 시각 구분 (해당 시): PASS|FAIL|NOT VERIFIED|N/A
## v1.4 Canonical Funnel (when VERIFY Master touched)
- Phase1 evidence gate (optional, pre-signup): PASS|FAIL|N/A
- Phase2 evidence after Phase2 questions complete: PASS|FAIL|N/A
- 1차/2차 evidence·result separation: PASS|FAIL|N/A
- AI Report / Expert `/documents` handoff + leadId continuity: PASS|FAIL|N/A
- Member handoff terminal exit (SUCCESS + TIMEOUT): PASS|FAIL|N/A
- Product vs QA Harness: PASS|FAIL|N/A
## v1.3 Investigative Profiling (when funnel/profile touched)
- Full funnel trace (Brief 범위): Question → Profile → Branch → Result → Evidence → Report → Expert
- Question depth adequate for case complexity (not fixed N; reduce-depth regression = FAIL)
- Profile reflects answers · Fact types not conflated
- Phase1→Phase2: carry-over/skip · depth not repeat · no formal-only Phase2
- Branch · Evidence question vs upload · Result linkage (Answer→Profile→Judgment)
- NEVER ASK AGAIN · Expert handoff Profile carry-over
- Product vs QA Harness distinction
## Golden Case regression
## Regression (/verify/admin, /check/trc)
## Summary + evidence (screenshots/logs — no evidence = NOT VERIFIED)
## Recommendation: READY FOR ACE | NEEDS FIX | BLOCKED
```

## Delegation Rules

- ARCHITECT·VERIFIER는 **제품 코드 수정 금지**
- IMPLEMENTER만 Mission Brief 범위 내 코드 수정 — **Root Cause 확정 후**
- 병렬: ARCHITECT 조사 중 IMPLEMENTER 착수 **금지**
- Self-Healing: IMPLEMENTER (tsc/lint) → VERIFIER (QA) — 역할 혼합 금지
- Stop Condition → Ace 보고 후 중단
- Governance-only Mission: 제품·QA/E2E·DB 수정 **금지** — Master Skill + Agent + 05-rule만

## Subagent Invocation

```
Use the vfbcai-architect subagent to [Mission]
Use the vfbcai-implementer subagent to [Brief reference]
Use the vfbcai-verifier subagent to [Reports reference]
```
