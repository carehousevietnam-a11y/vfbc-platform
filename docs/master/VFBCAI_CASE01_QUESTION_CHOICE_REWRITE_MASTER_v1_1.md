# VFBCAI CASE_01 질문·선택지 재작성 마스터 v1.1
> **최종본:** `VFBCAI_CASE01_QUESTION_CHOICE_FINAL_v1_2.md` 로 대체.


| 항목 | 내용 |
|------|------|
| **기준** | v1 + Brief v3 부록 A + **D06** |
| **Phase2 원문 SoT** | Brief v3 부록 A — **본 v1.1은 D06 패치만** (B2 spatiotemporal) |

---

## A. D06 — `case01_spatiotemporalFacet` (8→5)

**질문 (유지):** 그 날짜·장소·상황을 지금 어떤 방식으로 확인할 수 있나요?

| slug | v1.1 (1인칭 요지) |
|------|-------------------|
| `st_records` | **기록·자료**로 확인할 수 있습니다. |
| `st_witness` | **증인·동행자**에게 확인할 수 있습니다. |
| `st_memory` | **기억**에만 의존합니다. |
| `st_no_path` | **지금은** 확인 방법을 모르겠습니다. |
| `st_searched_empty` | **찾아봤지만** 당시를 확인할 자료가 없었습니다. |

**뺀 slug → DI:** `st_has_records_pending` · `st_witness_only_pending` · `st_memory_only_fuzzy` · `st_cannot_verify` — 인벤토리 §2.1.

**fact_dimensions:** `verify_mode` = records \| witness \| memory \| no_path \| searched_empty \| other

**DI 커버 + 이유:** 수집·연락·선명도·탐색 전/후 — **5개 `verify_mode`로 판단 축은 완결**, 세부는 DI.

**legacy 매핑:** `st_has_records`/`st_has_records_pending` → `st_records` · `st_witness_only`/*_pending` → `st_witness` · `st_memory_only`/*_fuzzy` → `st_memory` · `st_cannot_verify`/`st_cannot_verify_tried` → `st_no_path`/`st_searched_empty` (IMPLEMENTER 표).

---

## B. QG (v1.1)

| QG-05 | **해소함** (§A) · 나머지 질문 ≤5 — 인벤토리 §1 CASE_01 |

---

*v1.1 — 2026-09-26 · 2번창 · 문서만*
