# VFBCAI CASE_04 질문·선택지 재작성 마스터 v1.1

| 항목 | 내용 |
|------|------|
| **기준** | v1 (`1fdce2b`) + **D03** (`VFBCAI_SECOND_FACT_ATTACHMENT_RULE_v1_1.md`) |
| **유지** | supplementTrajectory 합침 · 기한 4+DI · customerResponse 접수 분기 |

---

## A. D03 v1.1 패치

### A.1 `case04_supplementTarget` (5+DI)

**질문 (유지):** 교통국에서 **기존 제출분에 대해 무엇을 다시 하라고** 안내했는지, 제가 이해한 수준으로 골라 주세요.

| slug | v1 (수정 전) | v1.1 (수정 후) |
|------|--------------|----------------|
| `additional_docs` | …받았고, **어떤 종류**인지는 일부만 읽었습니다. | **빠진 서류·자료를 추가**하라는 안내를 받았습니다. |
| `add_content_evidence` | …받았고, **어느 항목**인지는 아직 대조하지 못했습니다. | **내용·정보·증빙이 부족**하다는 안내를 받았습니다. |
| `modify_existing` | (핵심만 — 제2 사실 없음) | **형식·작성 방법·기재 오류** 때문에 **다시 제출·수정**하라는 안내를 받았습니다. |
| `repeat_demand` | …요구받았고, **이전 제출 접수**는 확인했거나 아직 모릅니다. | **이미 보완 제출했는데** 또 **추가·수정**을 요구받았습니다. |
| `unclear` | …어렵고, **요구 목록**을 정리하지 못했습니다. | **무엇을 보완해야 하는지** 문구부터 이해하기 어렵습니다. |

**제2 사실:** 미부착 (읽음·대조·접수 확인은 `customerResponse`·Phase2 상세).

**fact_dimensions:** `demand_kind` = add_doc \| add_content \| modify \| repeat \| unclear \| other

**impossible_combinations:** `demand_kind=unclear` + 구체 서류 종류 slug 단독 확정 (별 질문)

**choice_facts:** slug ↔ `demand_kind` 1:1

---

### A.2 `case04_confirmGoal` (5+DI)

**질문 (유지):** 이 보완 사건에서 **지금 가장 먼저** 확인·준비하려는 것은 무엇인가요?

| slug | v1 | v1.1 |
|------|-----|------|
| `understand_materials` | …우선이고, **안내 문구**는 일부만 읽었습니다. | **어떤 자료를 더 내야 하는지**가 우선입니다. |
| `understand_insufficient` | …우선이고, **대조한 서류**는 아직 없습니다. | **이미 낸 자료가 왜 부족한지**가 우선입니다. |
| `prepare_materials` | …우선이고, **양식·번역 요건**은 확인 중입니다. | **추가 자료 준비 방법**이 우선입니다. |
| `repeat_reason` | …우선이고, **이전 보완 접수** 이력은 있습니다. | **다시 요구하는 이유**가 우선입니다. |
| `unsure` | …정하지 못했고, **요구서·기한·제출 이력**을 정리하지 못했습니다. | **무엇부터 할지** 아직 정하지 못했습니다. |

**제2 사실:** 미부착 (대응·제출 이력은 `customerResponse`).

**fact_dimensions:** `primary_goal` = understand_materials \| understand_insufficient \| prepare_materials \| repeat_reason \| unsure \| other  
*(v1 `prep_stage` 축 삭제 — 선택지가 enum 전체를 덮지 못함)*

**choice_facts:** slug ↔ `primary_goal` 1:1

---

## B. QG (v1.1)

| 게이트 | 결과 |
|--------|------|
| QG-02 | **해소함** (confirmGoal 대응·읽음 고정 제거) |
| D03 | **해소함** (§A) |

**미패치 질문:** v1 본문 동일.

---

*v1.1 — 2026-09-26 · 2번창 · 문서만*
