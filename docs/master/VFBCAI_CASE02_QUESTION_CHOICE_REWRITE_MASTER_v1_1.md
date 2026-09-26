# VFBCAI CASE_02 질문·선택지 재작성 마스터 v1.1
> **최종본:** `VFBCAI_CASE02_QUESTION_CHOICE_FINAL_v1_2.md` 로 대체.


| 항목 | 내용 |
|------|------|
| **기준** | v1 (`04569a6`) + **D03** (`VFBCAI_SECOND_FACT_ATTACHMENT_RULE_v1_1.md`) |

---

## A. D03 v1.1 패치

### A.1 `case02_paymentSubject` — `fine_penalty`

**질문 (유지):** 교통국에서 **무엇에 대한 비용**을 내라고 안내했나요?

| slug | v1 | v1.1 |
|------|-----|------|
| `fine_penalty` | **벌금·과태료**를 내라는 안내를 받았고 **항목 문구**는 일부 읽었습니다. | **벌금·과태료**를 내라는 안내를 받았습니다. |

*(다른 slug — v1 동일)*

**제2 사실:** 미부착 — 문구·항목 이해는 `paymentInfoSource`·Phase2.

**fact_dimensions:** `payment_kind` = fine_penalty \| fee_charge \| tax_or_arrears \| mixed_items \| unclear \| other  
*(v1 `notice_clarity` 축 삭제 — `fine_penalty`만 부분값 고정되어 D03 위반)*

**choice_facts:** slug ↔ `payment_kind` 1:1

**impossible_combinations:** (단일 선택) 상호 배타.

---

## B. QG (v1.1)

| D03 | **해소함** |
| QG-05 | **해소함** — §C |

---

## C. D06

`case02_situationMatch` **6→5:** `hard_to_judge` → **DI**. 인벤토리 §2.2.

---

*v1.1 — 2026-09-26 · 2번창 · 문서만*
