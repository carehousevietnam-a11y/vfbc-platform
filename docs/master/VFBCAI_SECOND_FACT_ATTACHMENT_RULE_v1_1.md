# D03 — 제2 사실 부착 규칙 v1.1 (LOCK · 전 CASE)

| 항목 | 내용 |
|------|------|
| **적용** | `VFBCAI_CASE0x_QUESTION_CHOICE_REWRITE_MASTER_v1_1.md` 및 이후 재작성안 |
| **관계** | `VFBCAI_FAILURE_PATTERN_REGISTRY.md` D03 · `VFBCAI_QUESTION_CHOICE_REWRITE_CROSS_CASE_QUALITY_GATES_v1.md` |

## LOCK

**제2 사실**을 선택지 문안에 붙이려면 **아래 1~3을 모두** 충족한다. **하나라도 아니면 붙이지 않는다.** (사실 **하나만** 담은 선택지 허용.)

1. **같은 경로의 다른 질문**이 이미 묻는 사실이 **아니다**.
2. **판단·다음 행동·위험도**를 실제로 **바꾼다**.
3. 그 사실의 **가능한 값**을 **같은 질문 안** 선택지가 **모두 덮는다**.

## 자동 검사 (1번창)

- `fact_dimensions` 각 dimension의 enum 값 ⊆ ⋃ `choice_facts` (표에만 있고 선택지에 없는 값 **금지**).
- 제2 dimension이 있는 slug → 해당 dimension 전체 enum이 다른 slug들의 union으로 커버되는지 검사.

## 통지서 보유

**통지서·원문 보유**는 **`evidence`(목록형)** 질문이 묻는다. 다른 질문 선택지에 「통지서를 가지고 있다」 등 **부착 금지**.

## 의향 질문

「다음에 무엇을 **할 계획**인지」만 묻는 질문(예: `plannedNextStep`) — **금지** (`customerResponse=none`은 **미대응 사실**만으로 충분).

---

*2026-09-26 · 2번창*
