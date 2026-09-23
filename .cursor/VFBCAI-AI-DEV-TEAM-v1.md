# VFBCAI AI Development Team v1.2

> 제품 코드가 아닌 Cursor Agent 인프라. Production deploy 전 팀 운영 레이어.
> **v1.2 (2026-09-18)**: MASTER QUESTION ARCHITECTURE — FINAL / PERMANENT 동기화.

## 목표

Ace가 세부 개발 지시 없이 Mission만 제시하면, 전문 Agent가 헌법·Skill에 따라
**기획 → 질문/프로파일 설계 → UX/UI → 구현 → QA → 회귀검증**을 수행하고,
**제품 방향**과 **Production 배포**만 Ace가 승인한다.

## 레이어 구조

```
┌─────────────────────────────────────────────────────────┐
│  Ace — Mission · Brief 승인 · 제품 방향 · Deploy 승인    │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Parent Agent + vfbcai-team-orchestrator Skill          │
└───────────────────────────┬─────────────────────────────┘
                            │
     ┌──────────────────────┼──────────────────────┐
     ▼                      ▼                      ▼
 ARCHITECT              IMPLEMENTER              VERIFIER
 (설계·Brief)            (코드·tsc)              (QA·회귀·UI FINAL QA)
```

**UI 전담 4번째 Subagent 없음 (2026-09-23 Ace 판단):** `06-ui-design-responsive-typography-qa.mdc` + 3 Agent에 UI FINAL QA 책임 분산. VERIFIER가 UI 미션에서 FINAL QA 누락 사례가 나오면 재검토.

## 파일 맵

| 유형 | 경로 | 역할 |
|------|------|------|
| 헌법 | `docs/VFBCAI_CONSTITUTION.md` | 최우선 MASTER Constitution |
| Rule | `.cursor/rules/00`–`06` | 항상/도메인 규칙 |
| Rule | `.cursor/rules/05-vfbcai-ai-dev-team.mdc` | 팀 3역할·파이프라인·LESSON → GOVERNANCE |
| Rule | `.cursor/rules/06-ui-design-responsive-typography-qa.mdc` | UI FINAL QA (PC Full / Mobile Focused) |
| Skill | `.cursor/skills/vfbcai-master-development/` | MASTER Development Skill **v1.4** — **Verified Lessons (Canonical)** |
| Rule (보조) | `.cursor/rules/question-funnel-lessons.mdc` | 질문 퍼널 보조 메모 (LOCK 교훈은 Skill 우선) |
| Skill | `.cursor/skills/vfbcai-team-orchestrator/` | Mission 라우팅·템플릿 |
| Skill | `.cursor/skills/vfbcai-funnel-qa/` | VERIFIER 퍼널 QA |
| Agent | `.cursor/agents/vfbcai-architect.md` | ARCHITECT |
| Agent | `.cursor/agents/vfbcai-implementer.md` | IMPLEMENTER |
| Agent | `.cursor/agents/vfbcai-verifier.md` | VERIFIER |

## 사용 예

```
Mission: VERIFY fraud FREE Funnel CASE_03 E2E 구현

1. vfbcai-architect → Mission Brief
2. Ace Brief 승인
3. vfbcai-implementer → Implementation Report
4. vfbcai-verifier → QA Report (vfbcai-funnel-qa)
5. Ace → commit / deploy 판단
```

## v1.0 → v1.2 범위

- ✅ Rules / Skills / Subagents 3역할 (v1.0)
- ✅ **v1.2 (2026-09-18)**: MASTER QUESTION ARCHITECTURE — FINAL / PERMANENT
  - ONE RESULT = 결과 화면 개수 (질문 깊이 축소 **아님**)
  - 복잡도 → 질문량 · Branch · Profiling Stop · Fact Taxonomy · 1차/2차 깊이 · 질문 체인
  - Agent 역할: Architect 설계 검증 · Implementer 승인 설계만 · Verifier 깊이/Profile/Evidence/결과 연결
- ✅ UI FINAL QA (2026-09-20): `06` rule + 3 Agent — **별도 UI-only Subagent 없음** (Ace 2026-09-23)
- ⬜ v1.3+: FUNNEL ENGINEER 등 추가 역할 · Cursor hooks / automation (PRODUCT DESIGNER Subagent는 현재 미채택)

## 현재 제품 상태 (2026-09-17)

- CHECK / VERIFY / REGISTER / PROTECT · Master Funnel · Situation Profile 확정
- VERIFY 행정문서 MASTER · 부동산 FREE Funnel + Restore + Evidence upload E2E PASS
- Desktop/Mobile 375px · /verify/admin · /check/trc regression PASS · tsc PASS
- Production deploy: **미실행**
