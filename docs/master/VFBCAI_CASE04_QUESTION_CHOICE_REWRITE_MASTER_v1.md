# VFBCAI CASE_04 질문·선택지 재작성 마스터 v1

| 항목 | 내용 |
|------|------|
| **성격** | 1단계 재작성안 SoT (2번창 · 코드 미반영) |
| **범위** | CASE_04 Phase1·Phase2 전 질문 |
| **LOCK** | `VFBCAI_QUESTION_CHOICE_REWRITE_CROSS_CASE_QUALITY_GATES_v1.md` QG-01~04 |
| **자동 검사** | 상황형: `fact_dimensions` · `impossible_combinations` · `choice_facts` |

---

## 0. 구조 변경 (합침·삭제)

| 변경 | 이유 |
|------|------|
| `case04_authorityFollowUp` + `case04_repeatSupplement` → **`case04_supplementTrajectory`** | 제출 후 기관 반응·반복 보완 요구를 **두 질문**에서 묻음 (`more_supplement`≈`more_docs` 중복) |
| `case04_submissionRelation` **`hard_to_judge` 제거** | `initialSubmission.hard_to_confirm`과 **RECALL 중복** (QG-04) — 기억 어려움은 **initialSubmission 한 곳** |
| `case04_deadline` **5+DI → 4+DI** | `uncertain`≈`period_stated` (QG-01) |
| `case04_customerResponse` **5+DI → 6+DI** | `inquired` vs `other_method` 겹침 해소 (QG-02) |

---

## 1. 화면 순서 — Phase1

### 1.1 `case04_supplementTarget` (상황형 · single)

**질문:** 교통국에서 **기존 제출분에 대해 무엇을 다시 하라고** 안내했는지, 제가 이해한 수준으로 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `additional_docs` | **빠진 서류·자료를 추가**하라는 안내를 받았고, **어떤 종류**인지는 일부만 읽었습니다. |
| `add_content_evidence` | **내용·정보·증빙이 부족**하다는 안내를 받았고, **어느 항목**인지는 아직 대조하지 못했습니다. |
| `modify_existing` | **형식·작성 방법·기재 오류** 때문에 **다시 제출·수정**하라는 안내를 받았습니다. |
| `repeat_demand` | **이미 보완 제출했는데** 또 **추가·수정**을 요구받았고, **이전 제출 접수**는 확인했거나 아직 모릅니다. |
| `unclear` | **무엇을 보완해야 하는지** 문구부터 이해하기 어렵고, **요구 목록**을 정리하지 못했습니다. |
| (DI) | 직접 설명 |

**fact_dimensions:** `demand_kind` (add_doc \| add_content \| modify \| repeat \| unclear \| other)

**impossible_combinations:** `demand_kind=unclear` + 구체 서류 종류 확정 — unclear 선택지 문안에 「목록 미정리」 유지

**choice_facts:** slug = `demand_kind` 값

---

### 1.2 `case04_confirmGoal` (상황형 · single)

**질문:** 이 보완 사건에서 **지금 가장 먼저** 확인·준비하려는 것은 무엇인가요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `understand_materials` | **어떤 자료를 더 내야 하는지**가 우선이고, **안내 문구**는 일부만 읽었습니다. |
| `understand_insufficient` | **이미 낸 자료가 왜 부족한지**가 우선이고, **대조한 서류**는 아직 없습니다. |
| `prepare_materials` | **추가 자료 준비 방법**이 우선이고, **양식·번역 요건**은 확인 중입니다. |
| `repeat_reason` | **다시 요구하는 이유**가 우선이고, **이전 보완 접수** 이력은 있습니다. |
| `unsure` | **무엇부터 할지** 정하지 못했고, **요구서·기한·제출 이력**을 정리하지 못했습니다. |
| (DI) | 직접 설명 |

**fact_dimensions:** `primary_goal` · `prep_stage` (reading \| comparing \| preparing \| blocked)

---

### 1.3 `case04_customerResponse` (상황형 · single)

**질문:** 보완 안내를 받은 **이후** 제가 한 일과 **기관 반응**을 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `not_started` | **준비·재제출을 하지 않았고**, 기관 **연락·답변도 없습니다**. |
| `preparing` | **보완 자료를 준비 중**이고, **아직 제출하지 않았습니다**. |
| `submitted_no_receipt` | **보완 자료를 제출했지만** 접수 확인·접수번호는 **아직 못 받았습니다**. |
| `submitted_receipt_ok` | **보완 자료를 제출했고** 접수·접수번호 **안내를 받았습니다**. |
| `inquired_no_answer` | **문의만** 했고, **서면·접수 답변**은 아직 없습니다. |
| `inquired_answered` | **문의했고 답변**은 받았지만, **보완 제출까지는 하지 않았습니다**. |
| `acted_other_channel` | **재제출·전화 문의와 다른 방식**(방문·대행·온라인 등)으로 **대응했습니다**. |
| (DI) | 직접 설명 |

**fact_dimensions:** `action` · `authority_reply` · `submission_receipt`

**impossible_combinations:** `action=not_started` + `authority_reply=yes`

**choice_facts:** slug별 위 3축

---

### 1.4 `case04_deadline` (상황형 · single)

**질문:** 보완 **제출 기한**을 지금 어디까지 확인했나요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `specific_date` | **정확한 마감일**을 안내·통지에서 확인했고, 아래에 적을 수 있습니다. |
| `window_only` | **「N일 이내」 등 기간만** 안내됐고 **달력 날짜**는 아직 계산하지 못했습니다. |
| `exists_date_unknown` | **기한이 있다는 것만** 알고 **언제인지**는 못 찾았습니다. |
| `not_checked` | **기한 문구를 읽지 않았거나** 기한 존재를 **확인하지 못했습니다**. |
| (DI) | 직접 설명 |

**requires_text_key:** `specific_date` → `case04_deadlineDate`

**fact_dimensions:** `deadline_certainty` (date \| window \| exists_unknown \| not_checked)

---

### 1.5 `case04_deadlineDate` (text · `specific_date`)

**질문:** 확인한 보완 제출 기한은 언제인가요?  
**placeholder:** 기억나는 날짜·기한을 적어 주세요.

---

## 2. 화면 순서 — Phase2

### 2.1 `case04_initialSubmission` (상황형 · 조건부)

**질문:** **처음** 교통국에 제출했던 범위를 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `complete` | **필요 서류를 모두** 제출했다고 생각하고, **제출 목록**은 일부 기억합니다. |
| `partial` | **일부만** 제출했고, **빠진 것이 있을 수** 있다고 느낍니다. |
| `hard_to_confirm` | **무엇을 제출했는지** 정확히 기억하기 어렵고, **사본·접수증**을 아직 찾지 못했습니다. |
| (DI) | 직접 설명 |

**fact_dimensions:** `first_submit_scope` · `recall_difficulty` (clear \| partial \| hard)

**QG-04:** `hard_to_confirm` 선택 시 **`case04_submissionRelation` 노출 skip**

---

### 2.2 `case04_submissionRelation` (상황형 · `initialSubmission` ≠ `hard_to_confirm`)

**질문:** 이번 보완 요구가 **처음 제출**과 비교하면 어떤 상황인가요?

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `add_missing` | **처음 안 낸 새 자료**를 추가하라는 요구입니다. |
| `modify_content` | **이미 낸 자료를 수정·재제출**하라는 요구입니다. |
| `support_existing` | **기존 자료는 맞지만** 설명·증빙을 **더** 하라는 요구입니다. |
| `mismatch_request` | **같은 자료를 이미 냈는데** 다시 제출하라고 들었습니다. |
| (DI) | 직접 설명 |

**폐기 slug:** `hard_to_judge` → `initialSubmission.hard_to_confirm`으로 흡수

---

### 2.3 `case04_supplementReason` (상황형)

**질문:** 교통국이 말한 **보완 이유**를 제가 이해한 수준으로 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `missing_info` | **빠진 정보·서류**가 있다고 들었고, **어느 항목**인지는 부분만 압니다. |
| `incorrect_content` | **내용·기재 오류**가 있다고 들었고, **수정 위치**는 찾는 중입니다. |
| `insufficient_proof` | **증빙이 부족**하다고 들었고, **어떤 증빙**인지는 일부만 압니다. |
| `no_reason` | **이유 없이** 보완만 요구했거나, **구체 사유**가 없습니다. |
| `unsure` | **이유 문구**를 읽었으나 **해석하지 못했습니다**. |
| (DI) | 직접 설명 |

---

### 2.4 `case04_addDocDetail` (목록형 · multi · `supplementTarget=additional_docs`)

**질문:** 추가로 제출해야 하는 **서류 종류**를 골라 주세요. (여러 개 선택 가능)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `id_doc` | 신분·인적 서류 |
| `financial_doc` | 재무·금액 서류 |
| `certificate` | 증명서·확인서 |
| `translation` | 번역·공증 서류 |
| `unsure` | 어떤 서류를 추가해야 하는지 **아직 모르겠습니다**. |
| (DI) | 기타 |

---

### 2.5 `case04_modifyDetail` (목록형 · multi · `modify_existing`)

**질문:** 수정·고쳐 써야 하는 **항목**을 골라 주세요. (여러 개 선택 가능)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `name_info` | 이름·인적사항 |
| `date_info` | 날짜·기간 |
| `amount_info` | 금액·수치 |
| `content_info` | 내용·기재사항 |
| `unsure` | 무엇을 수정해야 하는지 **모르겠습니다**. |
| (DI) | 기타 |

---

### 2.6 `case04_evidenceDetail` (목록형 · multi · `add_content_evidence`)

**질문:** 더 요구하는 **증빙·자료 종류**를 골라 주세요. (여러 개 선택 가능)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `proof_doc` | 증빙 서류 |
| `photo` | 사진·이미지 |
| `statement` | 설명서·소명서 |
| `unsure` | 어떤 증빙을 더 넣어야 하는지 **모르겠습니다**. |
| (DI) | 기타 |

---

### 2.7 `case04_unclearFocus` (상황형 · `supplementTarget=unclear`)

**질문:** 보완 안내에서 **가장 막힌 점**을 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `what_submit_list` | **무엇을 제출해야 하는지** 자체가 가장 막막합니다. |
| `what_submit_apply` | **대략 보이지만** 제 상황에 맞는지 **모르겠습니다**. |
| `why_submit_reason` | **왜 보완이 필요한지**가 가장 어렵습니다. |
| `why_submit_apply` | **사유는 읽었지만** 제 경우 해당인지 **모르겠습니다**. |
| `format_how` | **형식**이 가장 어렵습니다. |
| `format_where` | **형식은 알겠는데 제출처**(온라인·방문)를 **모르겠습니다**. |
| (DI) | 직접 설명 |

---

### 2.8 `case04_supplementTrajectory` (상황형 · **신규 합침**)

**노출:** `customerResponse` ∈ {submitted_*, inquired_answered, acted_other_channel}

**질문:** 보완 **제출·문의 이후** 기관 안내·반복 요구를 **한 번에** 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `accepted_waiting` | **접수됐다**는 안내를 받고 **추가 요구 없이** 검토 대기 중입니다. |
| `accepted_more_docs` | **접수 후** **다른 종류 서류**를 또 요구받았습니다. |
| `accepted_more_same` | **접수 후** **비슷한 서류**를 또 요구받았습니다. |
| `modify_again_prior` | **이미 고친 부분**을 **다시** 고치라고 들었습니다. |
| `modify_again_new_field` | **처음과 다른 항목**을 고치라고 들었습니다. |
| `receipt_unconfirmed` | **제출했으나** 접수 여부를 **확인하지 못했습니다**. |
| `no_response` | **아직 기관 답변**이 없습니다. |
| `guidance_unclear` | **답변은 있으나** 무엇을 하라는지 **정리하지 못했습니다**. |
| (DI) | 직접 설명 |

**fact_dimensions:** `receipt` · `review_state` · `repeat_demand` (none \| docs \| modify)

**폐기 질문:** `case04_authorityFollowUp`, `case04_repeatSupplement`

---

### 2.9 `case04_blockage` (상황형)

**질문:** 지금 **가장 막힌 부분**을 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `what_submit` | **무엇을 추가·수정**해야 하는지 모르겠습니다. |
| `why_submit` | **왜 보완이 필요한지** 이해하지 못했습니다. |
| `format` | **형식·제출 방법**을 모르겠습니다. |
| `deadline` | **언제까지**인지 모르겠습니다. |
| `after_submit` | **제출 후 다음 절차**를 모르겠습니다. |
| (DI) | 직접 설명 |

---

### 2.10 `case04_evidence` (목록형 · multi)

**질문:** 보완 요구와 관련해 **활용 가능한 자료**를 골라 주세요. (여러 개 선택 가능)

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `supplement_notice` | 보완 요구서·안내문 |
| `message` | 문자·전화·메신저 안내 |
| `original_submission` | 처음 제출 서류 |
| `supplement_submission` | 보완 제출 서류 |
| `none` | 관련 자료 없음 |
| `unsure` | 있는지 **아직 확인하지 못했습니다**. |
| (DI) | 기타 |

---

### 2.11 `case04_finalGoal` (상황형 · tail)

**질문:** 이 보완 사건에서 **우선 확인하고 싶은 결과**를 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `what_supplement` | **무엇을 보완해야 하는지** 확인하고 싶습니다. |
| `why_supplement` | **왜 보완이 필요한지** 확인하고 싶습니다. |
| `how_supplement` | **어떻게 보완·제출**해야 하는지 확인하고 싶습니다. |
| `next_step` | **제출 후 다음 절차**를 확인하고 싶습니다. |
| (DI) | 직접 설명 |

---

## 3. 옛 slug → 새 slug (CASE_04)

| 옛 | 새 | 비고 |
|----|-----|------|
| `deadline.uncertain` | `exists_date_unknown` | |
| `deadline.period_stated` | `window_only` | |
| `deadline.unsure` | `not_checked` | |
| `customerResponse.not_started` | `not_started` | 동일 |
| `customerResponse.preparing` | `preparing` | 동일 |
| `customerResponse.submitted` | `submitted_no_receipt` 또는 `submitted_receipt_ok` | 접수 여부 분기 |
| `customerResponse.inquired` | `inquired_no_answer` / `inquired_answered` | |
| `customerResponse.other_method` | `acted_other_channel` | |
| `submissionRelation.hard_to_judge` | — | **삭제** → `initialSubmission.hard_to_confirm` |
| `authorityFollowUp.*` + `repeatSupplement.*` | `supplementTrajectory.*` | §2.8 표 |
| `authorityFollowUp.more_supplement` | `supplementTrajectory.accepted_more_docs` | 원문 표시로 처리 가능 |
| `authorityFollowUp.more_docs` | `supplementTrajectory.accepted_more_docs` | 합침 |
| `repeatSupplement.more_docs_new_kind` | `accepted_more_docs` | |
| `repeatSupplement.more_docs_same_kind` | `accepted_more_same` | |
| `repeatSupplement.more_modify_reject_prior` | `modify_again_prior` | |
| `repeatSupplement.more_modify_new_field` | `modify_again_new_field` | |

---

## 4. QG-01~04 점검 (CASE_04)

| 게이트 | 결과 |
|--------|------|
| QG-01 | **해소함** — §1.4 기한 4+DI |
| QG-02 | **해소함** — §1.3 대응 6+DI |
| QG-03 | **해소함(문서)** — `specific_date`→`case04_deadlineDate` · append `return` **남음(코드)** |
| QG-04 | **해소함** — `hard_to_judge` 제거 · initialSubmission 단일 recall |

---

*2번창 — 문서만.*
