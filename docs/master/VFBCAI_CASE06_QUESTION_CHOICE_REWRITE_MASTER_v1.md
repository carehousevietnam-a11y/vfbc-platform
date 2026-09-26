# VFBCAI CASE_06 질문·선택지 재작성 마스터 v1
> **최종본:** `VFBCAI_CASE06_QUESTION_CHOICE_FINAL_v1_2.md` 로 대체.


| 항목 | 내용 |
|------|------|
| **범위** | 불명확 CASE — **v1.1 Phase1** + **브리지 체인** (CASE_01~05 분기) |
| **SoT 코드** | `adminVerifyCase06Redesign.ts` (체인) · Phase1 5필드 |
| **LOCK** | QG-01~04 · 브리지 후 **대상 CASE 마스터**와 slug 정합 |

---

## 0. 구조 변경

| 변경 | 이유 |
|------|------|
| Legacy `profileAuthorityGuidance` **uncertain** 단일화 vs v1.1 `deadlineActionPair` | 기한·행동 **한 질문**에 묶음 (이미 v1.1) |
| `hard_to_tell` / `hard_to_classify` / `hard_to_point` / `hard_to_recall` → **경로당 1질문** | QG-04 |
| 각 분기 `*AuthorityReaction` + repeat 류 → **`*AuthorityTrajectory`** (01~05 동형) | 후속 중복 |

---

## 1. Phase1 v1.1 (화면 순서)

### 1.1 `case06_requiredActionCandidate` (상황형)

**질문:** 교통국·관계 기관에서 **무엇을 하라고** 안내한 것에 가장 가깝나요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `pay_demand` | **돈을 내라**고 했고 **벌금·비용 등 종류**는 일부만 압니다. |
| `attend_explain` | **출석·방문해 설명**하라고 했고 **일시·장소**는 일부만 압니다. |
| `submit_supplement` | **서류 제출·보완**하라고 했고 **무엇을** 낼지 대략만 압니다. |
| `disposition_notice` | **처분·제재 통지**를 받았고 **효력**은 일부만 이해했습니다. |
| `problem_action_unclear` | **문제가 있다**고만 들었고 **무엇을 해야 할지** 모르겠습니다. |
| (DI) | 직접 설명 |

**fact_dimensions:** `action_candidate` · `clarity`

---

### 1.2 `case06_knowledgeSource` (상황형)

**질문:** 그 안내를 **어떻게 알게** 되었나요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `doc_read_understood` | **문서를 직접 봤고** 내용을 **어느 정도 이해**했습니다. |
| `doc_read_not_understood` | **문서는 봤지만** 뜻을 **이해하지 못했습니다**. |
| `explained_without_doc` | **문서 없이** 기관·타인 **설명**만 들었습니다. |
| `memory_only_no_doc_now` | **문서는 있었으나** 지금은 없고 **기억**만 있습니다. |
| `path_unclear` | **문서·경로**가 **불분명**합니다. |
| (DI) | 직접 설명 |

**QG-04:** `memory_only` + `path_unclear` — **본 질문만** recall, unclear 분기에서 `hard_to_recall` **중복 금지**

---

### 1.3 `case06_sourceChannel` (상황형)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `gov_document_direct` | **정부 문서**를 직접 확인했습니다. |
| `gov_contact_direct` | **기관 전화·문자·방문**으로 직접 받았습니다. |
| `via_agent_or_company` | **대리인·회사**가 전달했습니다. |
| `via_acquaintance_relay` | **지인**이 전달했습니다. |
| `source_unknown` | **출처**를 모르겠습니다. |
| (DI) | 직접 설명 |

---

### 1.4 `case06_deadlineActionPair` (상황형)

**질문:** **언제까지 무엇을** 하라고 안내받았나요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `deadline_pay_by_date` | **특정 날짜까지 납부**하라고 했고 **날짜**를 아래에 적을 수 있습니다. |
| `deadline_submit_by_date` | **특정 날짜까지 제출·보완**하라고 했습니다. |
| `deadline_attend_by_date` | **특정 날짜에 출석·설명**하라고 했습니다. |
| `action_unclear_timing` | **할 일은 있으나** **언제·무엇**인지 **모릅니다**. |
| `no_deadline_stated` | **기한 안내**를 받지 못했습니다. |
| (DI) | 직접 설명 |

**requires_text_key:** `*_by_date` slugs → `case06_deadlineDate` (`case06NeedsDeadlineDate`)

---

### 1.5 `case06_customerResponse` (상황형)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `no_response_yet` | **아무 대응도 하지 않았습니다**. |
| `inquired_authority` | **기관에 문의**했습니다. |
| `prepared_or_submitted_docs` | **서류 준비·제출**했습니다. |
| `paid_or_attempted_pay` | **납부했거나** 납부 **시도**했습니다. |
| `attended_then_redemand` | **출석·설명 후** **다시 요구**를 받았습니다. |
| (DI) | 직접 설명 |

---

## 2. 브리지 체인 (분기별 · 재작성 원칙)

분기 확정 후 **해당 CASE 마스터**와 **동일 QG** 적용. CASE_06 전용 필드는 **고밀도 1인칭**으로 `CASE06_V11_CHAIN_FIELD_KEYS` 각 id별 표를 IMPLEMENTER가 본 문서 부록으로 확장.

| 분기 | 대표 chain id | 합침 |
|------|---------------|------|
| 납부 | `case06_paymentResponse` + `paymentAuthorityCheck` | trajectory |
| 출석 | `attendanceResponse` + `attendanceAuthorityReaction` | trajectory |
| 보완 | `submissionResponse` + `submissionAuthorityReaction` | trajectory |
| 처분 | `dispositionResponse` | CASE_05 trajectory 동형 |
| 불명확 | `unclearResponse` + `classificationStatus` | interpret 단일 |

---

## 3. Legacy Phase1 (restore 경로)

`profileAuthorityGuidance` + `CASE06_DEADLINE_PRESENCE_OPTIONS` — **not_stated** vs **not_checked** 통합 → v1.1 `deadlineActionPair`로 **마이그레이션** (원문 표시로 처리)

---

## 4. 옛 → 새 (Phase1 v1.1)

| 옛 | 새 |
|----|-----|
| `profileAuthorityGuidance.uncertain` | `deadlineActionPair.action_unclear_timing` |
| `profileAuthorityGuidance.specific_date` | `deadline_*_by_date` + text |
| `hard_to_tell` (다수 필드) | **해당 경로 단일 id** — 원문 표시로 처리 |

---

## 5. QG 점검

| 게이트 | 결과 |
|--------|------|
| QG-01 | **해소함** — deadlineActionPair |
| QG-02 | **해소함** — customerResponse |
| QG-03 | **해소함(문서)** — by_date+text · 코드 **해소함**(case06 loop) |
| QG-04 | **남음(이유)** — chain 필드 전수 표는 **부록 미작성** · 원칙만 LOCK |

---

*2번창 — 문서만. chain 전수 표는 IMPLEMENTER 부록 Mission.*
