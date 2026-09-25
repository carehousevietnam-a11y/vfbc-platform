# 선택지 최대 5개 규칙 v1.1 (LOCK · 대표 마스터)

| 항목 | 내용 |
|------|------|
| **권위** | `VFBCAI_QUESTION_CHOICE_EXPRESSION_MASTER_EXECUTION_RULE_v1.md` §3 (4~5개 대표 상황) |
| **적용** | CASE_01~06 재작성 마스터 v1.1+ · 목록형·상황형 동일 |
| **연계** | D03 (`VFBCAI_SECOND_FACT_ATTACHMENT_RULE_v1_1.md`) · D06 (`VFBCAI_FAILURE_PATTERN_REGISTRY.md`) |

## LOCK

- **내용 선택지:** 질문당 **최대 5개**.
- **직접 입력:** **항상 1개** — 문구 고정: **「위에 내용이 없거나 설명이 필요합니다 → 직접 입력」** (`EXPRESSION_MASTER` DI 규칙).
- **목록형(multi):** chip도 **최대 5개** + 동일 DI. 가장 흔한 **자료·항목 종류**만 chip, 나머지는 DI.
- **기준:** 실제로 **가장 많이 고를** 상황 5개 + **판단·다음 행동**이 크게 갈리는 축 우선.
- **D03:** 제2 사실은 **5개 안에서만** 부착. 5개로 enum 전체를 덮지 못하면 **제2 사실 붙이지 않음** · 미커버 값은 **DI + 이유** (`FIVE_CAP_INVENTORY` §4).

## 자동 검사 (1번창)

- 질문 id별 **내용 선택지 수 ≤ 5** (DI·text 질문 제외).
- `fact_dimensions` 값 ⊄ choice_facts ∪ {DI} → **FAIL** (이유 문구 필수).

## trajectory 합침

합친 질문도 **5개 제한**. 5개로 대표 축을 담을 수 없으면 **역할 분리** 검토 (인벤토리 §6 한 줄 의견).

---

*2026-09-26 · 2번창*
