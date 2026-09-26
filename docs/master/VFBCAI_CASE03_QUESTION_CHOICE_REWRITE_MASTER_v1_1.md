# VFBCAI CASE_03 질문·선택지 재작성 마스터 v1.1
> **최종본:** `VFBCAI_CASE03_QUESTION_CHOICE_FINAL_v1_2.md` 로 대체.


| 항목 | 내용 |
|------|------|
| **기준** | v1 (`dac4697`) + **D03** (`VFBCAI_SECOND_FACT_ATTACHMENT_RULE_v1_1.md`) |
| **유지** | explanationTrajectory · 기한 4+DI · customerResponse |

---

## A. D03 v1.1 패치

### A.1 `case03_authorityDemand`

**질문 (유지):** 교통국에서는 이 문제와 관련해 **무엇을 하라고** 안내했나요?

| slug | v1 | v1.1 |
|------|-----|------|
| `reason_unclear` | **왜 출석·설명**해야 하는지 **모르겠고**, 안내 **문구만** 받았습니다. | **왜 출석·설명**해야 하는지 **아직 이해하지 못했습니다**. |
| `specific_incident` | …요청을 받았고, **그 사건**은 대략 알고 있습니다. | **특정 사건·행동**에 대해 **설명**하라는 요청을 받았습니다. |

*(나머지 slug — v1 동일)*

**제2 사실:** 미부착 — 사건 숙지·문구 수준은 `inquiryFocus`·`factRelationship` 등.

**fact_dimensions:** `demand_type` = reason_unclear \| specific_incident \| submission_review \| repeat_demand \| prep_unclear \| other  
*(v1 `prior_response` 축 — `repeat_demand` slug가 repeat 담당; 타 slug는 `prior_response=na` in choice_facts)*

**choice_facts:**

| slug | demand_type | prior_response |
|------|-------------|----------------|
| `reason_unclear` | reason_unclear | na |
| `specific_incident` | specific_incident | na |
| `submission_review` | submission_review | na |
| `repeat_demand` | repeat_demand | repeat |
| `prep_unclear` | prep_unclear | na |

**impossible_combinations:** `demand_type=repeat_demand` + `customerResponse=none` 동시 확정은 별 검사(경로) — 문서 수준 유지.

---

### A.2 `case03_confirmGoal` — `prepare_materials`

| slug | v1 | v1.1 |
|------|-----|------|
| `prepare_materials` | **준비할 자료·내용**이 우선이고 **목록**은 일부만 압니다. | **준비할 자료·내용**을 먼저 정리하려 합니다. |

**제2 사실:** 미부착.

**fact_dimensions:** `primary_goal` (slug enum · v1 유지)

**choice_facts:** slug ↔ `primary_goal` 1:1

---

## B. QG (v1.1)

| D03 | **해소함** (§A) |
| QG-05 | **해소함** — §C |

**미패치:** v1 본문.

---

## C. D06

- `customerResponse` **6→5:** `phone_inquired` (phone_no_reply + phone_replied 흡수) — §2.3  
- `explanationTrajectory` **8→5:** `proceed_no_more` · `demands_more` · `other_procedure` · `repeat_multiple` · `no_response_or_unclear` — §2.4

---

*v1.1 — 2026-09-26 · 2번창 · 문서만*
