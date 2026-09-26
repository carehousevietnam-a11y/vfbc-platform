# VFBCAI CASE_01 질문·선택지 재작성 마스터 v1
> **최종본:** `VFBCAI_CASE01_QUESTION_CHOICE_FINAL_v1_2.md` 로 대체.


| 항목 | 내용 |
|------|------|
| **범위** | 교통·행정 요구 CASE — Phase1·Phase2 |
| **LOCK** | `VFBCAI_CASE01_RATIO_REMEDIATION_QUESTION_BRIEF_v3.md` **부록 A** = Phase2 facet **원문 SoT** (본 문서는 Phase1·구조·QG) |
| **노출** | Brief v3 §3 표 (사실만 · 비율 게이트 없음) |

---

## 0. 구조 변경

| 변경 | 이유 |
|------|------|
| `case01_deadline` — `deadline_day_known` vs `confirmed` **통합 검토** → **`date_known`** 단일 + text | 동일 「날짜 확인」 (QG-03) |
| `uncertain` vs `deadline_window_only` — **배타 문안** 강화 | QG-01 |
| Phase2 facet **C/D/J/K/L/Q/O/P/M/S/T/Ff/H/G** — 부록 A **slug 유지** · 문안 고밀도 **이미 LOCK** | F12 |
| `confirmGoal` vs tail 목표 — F08 **중복 slug 제외** | |

---

## 1. Phase1 (화면 순서)

### 1.1 `case01_violationContent` (상황형)

**질문:** 교통국에서 **무엇이 문제**라고 안내했는지, 제가 이해한 수준으로 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `violation_stated` | **특정 위반·행위**가 문제라고 들었고 **그 행위 문구**는 읽었습니다. |
| `situation_disputed` | **제가 하지 않았거나 다르다**고 느끼는 **행위**가 문제라고 들었습니다. |
| `demand_unclear` | **무엇이 문제**인지 **핵심 문장**을 확인하지 못했습니다. |
| `multiple_issues` | **여러 가지** 문제가 동시에 언급되었습니다. |
| (DI) | 직접 설명 |

**fact_dimensions:** `issue_clarity` · `dispute` (yes \| no \| unknown)

---

### 1.2 `case01_factRelationship` (상황형)

**질문:** 안내 내용과 **실제 상황**을 비교하면?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `match` | **거의 같고** 차이는 사소합니다. |
| `date_place_wrong` | **날짜·장소·당시 상황**이 다릅니다. |
| `content_wrong` | **사실·사유 관계**가 다릅니다. |
| `cannot_compare_yet` | **대조할 기록**이 없어 **아직 비교 못 했습니다**. |
| `hard_to_explain` | **설명은 들었으나** 같은 기준으로 **비교하기 어렵습니다**. |
| (DI) | 직접 설명 |

**impossible_combinations:** `cannot_compare_yet` + facet C에서 「차이 확정」 slug — C는 **날짜·장소 축만**

**QG-04:** `cannot_compare_yet` · `hard_to_explain` — **compare/recall 단일 출구** (K·J 분리 유지 Brief v3)

---

### 1.3 `case01_factCompareGap` (상황형 · `cannot_compare_yet` 등)

**질문:** **아직 비교하지 못한** 주된 이유는?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `gap_no_records` | **당시 기록·증빙**이 없습니다. |
| `gap_hearsay_channel` | **간접 경로**로만 들었습니다. *(K로 이어짐)* |
| `gap_language_access` | **언어·통역** 때문에 문구를 **확인 못 했습니다**. |
| (DI) | 직접 설명 |

---

### 1.4 `case01_customerResponded` (상황형)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `no_contact_yet` | **기관에 대응하지 않았습니다**. |
| `has_responded` | **문의·제출·출석 등**으로 **대응했습니다**. |
| (DI) | 직접 설명 |

---

### 1.5 `case01_deadline` (상황형)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `date_known` | **연·월·일 또는 마감일**을 확인했고 아래에 적을 수 있습니다. |
| `window_only` | **「N일·이번 달」 등 기간만** 들었습니다. |
| `exists_unknown` | **기한은 있다**고만 알고 **날짜**는 모릅니다. |
| `no_deadline_stated` | **기한 언급**이 없었거나 **기억나지 않습니다**. |
| `asap` | **가능한 한 빨리**만 안내했습니다. |
| (DI) | 직접 설명 |

**requires_text_key:** `date_known` → `case01_deadlineDate`  
**폐기·매핑:** `deadline_day_known`·`confirmed` → `date_known` · `uncertain` → `exists_unknown`

---

### 1.6 `case01_deadlineDate` (text)

**질문:** 확인한 대응 기한은 언제인가요?

---

### 1.7 `case01_confirmGoal` (상황형)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `understand_demand` | **요구 내용**을 이해하려 합니다. |
| `verify_facts` | **사실 관계**를 확인하려 합니다. |
| `next_steps` | **다음 조치**를 알려 합니다. |
| `deadline` | **기한**을 확인하려 합니다. |
| `unsure` | **우선순위**를 정하지 못했습니다. |
| (DI) | 직접 설명 |

---

## 2. Phase2 — facet 질문 (부록 A 전문)

**화면 순서:** Brief v3 §3 표 (A → … → U) · **선택지 원문·slug·fact metadata** =  
`VFBCAI_CASE01_RATIO_REMEDIATION_QUESTION_BRIEF_v3.md` **부록 A B1~B13** (목록형 B1~B2 · 상황형 B3~B13).

각 상황형 facet: 부록 A 표에 **신호·downstream** 열 = `choice_facts` 입력.  
**impossible_combinations:** Brief v3 §3.0~3.6 (C/D 분리 · 금액 slug 금지) 유지.

### 2.1 목록형 (부록 A)

| id | 질문 (요지) |
|----|-------------|
| `case01_evidence` (G) | 활용 가능 자료 multi |
| `case01_authorityDemand` 보조 목록 | (해당 시) |

### 2.2 상황형 id 목록 (부록 A 원문 적용)

`case01_factConflictFacet` (C) · `case01_spatiotemporalFacet` (D) · `case01_compareRecordGap` (J) · `case01_languageAccessFact` (K) · `case01_responseDetail` (E) · `case01_authorityFollowUpKind` (Ff) · `case01_noticeDeliveryFact` (L) · `case01_procedureStageFact` (Q) · `case01_officeIdentityFact` (O) · `case01_paymentInstructionFact` (P) · `case01_attendInstructionFact` (M) · `case01_supplementInstructionFact` (S) · `case01_correctTargetFact` (T) · `case01_unclearDemandFact` (U) · `case01_blockage` (H) · tail goal

---

## 3. 합침·삭제

| 삭제·금지 | 이유 |
|-----------|------|
| L `del_third_party` | K `lang_indirect_hearsay` **단일** (Brief v3) |
| 비율 맞춤 **임의 질문** | DQ-C01-R07 |
| Phase2 **confirmGoal 재질문** | F08 |

---

## 4. 옛 → 새 slug (Phase1)

| 옛 | 새 |
|----|-----|
| `deadline.confirmed` / `deadline_day_known` | `date_known` |
| `deadline.uncertain` | `exists_unknown` |
| `deadline.no_stated` / `no_deadline_stated` | `no_deadline_stated` |
| Phase2 facet slug | **부록 A와 동일** — 변경 시 Brief v4 승인 필요 |

---

## 5. QG 점검

| 게이트 | 결과 |
|--------|------|
| QG-01 | **해소함** — Phase1 deadline · 부록 A facet coverage |
| QG-02 | **해소함** — customerResponded 2갈래 + E/Ff |
| QG-03 | **해소함(문서)** · 코드 return **해소함**(CASE_01) |
| QG-04 | **해소함** — K/L 분리 · compare gap 단일 |

---

*2번창 — Phase2 선택지 전문은 Brief v3 부록 A (LOCK).*
