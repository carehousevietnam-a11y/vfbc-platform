# VFBCAI CASE_06 질문·선택지 재작성 마스터 v1.1
> **최종본:** `VFBCAI_CASE06_QUESTION_CHOICE_FINAL_v1_2.md` 로 대체.


| 항목 | 내용 |
|------|------|
| **기준** | v1 (`1ab5c87`) + **D03** (`VFBCAI_SECOND_FACT_ATTACHMENT_RULE_v1_1.md`) |
| **유지** | Phase1 5필드 · 브리지 체인 → CASE_01~05 |

---

## A. D03 v1.1 패치

### A.1 `case06_requiredActionCandidate` (5+DI)

**질문 (유지):** 교통국·관계 기관에서 **무엇을 하라고** 안내한 것에 가장 가깝나요?

| slug | v1 | v1.1 |
|------|-----|------|
| `pay_demand` | …했고 **벌금·비용 등 종류**는 일부만 압니다. | **돈을 내라**고 안내 받았습니다. |
| `attend_explain` | …했고 **일시·장소**는 일부만 압니다. | **출석·방문해 설명**하라고 안내 받았습니다. |
| `submit_supplement` | …했고 **무엇을** 낼지 대략만 압니다. | **서류 제출·보완**하라고 안내 받았습니다. |
| `disposition_notice` | …받았고 **효력**은 일부만 이해했습니다. | **처분·제재** 관련 안내·통지를 받았습니다. |
| `problem_action_unclear` | (핵심 유지) | **문제가 있다**고만 들었고 **무엇을 해야 할지** 모르겠습니다. |

**제2 사실:** 미부착 — 종류·시각·이해 수준은 분기 CASE·`knowledgeSource`·`deadlineActionPair`.

**fact_dimensions:** `action_candidate` = pay_demand \| attend_explain \| submit_supplement \| disposition_notice \| problem_action_unclear \| other

**choice_facts:** slug ↔ `action_candidate` 1:1

**impossible_combinations:** (단일 선택)

---

## B. QG (v1.1)

| D03 | **해소함** |
| QG-05 | **해당 없음** (Phase1 전부 ≤5) |

**미패치:** v1 본문.

---

*v1.1 — 2026-09-26 · 2번창 · 문서만*
