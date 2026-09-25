# 질문별 선택지 개수 인벤토리 v1.1 (CASE_01~06)

| 항목 | 내용 |
|------|------|
| **LOCK** | `VFBCAI_QUESTION_CHOICE_MAX_FIVE_RULE_v1_1.md` |
| **D03** | `VFBCAI_SECOND_FACT_ATTACHMENT_RULE_v1_1.md` (5개 안에서만 제2 사실) |
| **SoT** | v1 재작성안 + 본 문서 v1.1 열 |

**DI:** 모든 질문 공통 1개 — 「위에 내용이 없거나 설명이 필요합니다 → 직접 입력」(표 **미포함**).

---

## 1. 전 질문 개수 표

### CASE_01

| 질문 id | 현재(v1/Brief) | v1.1 | 비고 |
|---------|----------------|------|------|
| `case01_violationContent` | 4 | 4 | |
| `case01_factRelationship` | 5 | 5 | |
| `case01_factCompareGap` | 3 | 3 | |
| `case01_customerResponded` | 2 | 2 | |
| `case01_deadline` | 5 | 5 | 상한 |
| `case01_confirmGoal` | 5 | 5 | 상한 |
| `case01_deadlineDate` | text | text | |
| `case01_evidence` (G) | 5 | 5 | 목록형 상한 |
| `case01_compareRecordGap` (J) | 4 | 4 | |
| `case01_factConflictFacet` (C) | 5 | 5 | 상한 |
| `case01_spatiotemporalFacet` (D) | **8** | **5** | §2.1 |
| `case01_languageAccessFact` (K) | 5 | 5 | Brief §4.3·B |
| `case01_responseDetail` (E) | 5 | 5 | |
| `case01_authorityFollowUpKind` (Ff) | 5 | 5 | |
| `case01_noticeDeliveryFact` (L) | 4 | 4 | |
| `case01_procedureStageFact` (Q) | 5 | 5 | |
| `case01_officeIdentityFact` (O) | 5 | 5 | |
| `case01_paymentInstructionFact` (P) | 5 | 5 | |
| `case01_attendInstructionFact` (M) | 5 | 5 | |
| `case01_supplementInstructionFact` (S) | 5 | 5 | |
| `case01_correctTargetFact` (T) | 5 | 5 | |
| `case01_unclearDemandFact` (U) | 5 | 5 | |
| `case01_blockage` (H) | 5 | 5 | |
| tail goal | 5 | 5 | |

### CASE_02

| 질문 id | 현재 | v1.1 |
|---------|------|------|
| `case02_paymentSubject` | 5 | 5 |
| `case02_paymentInfoSource` | 5 | 5 |
| `case02_situationMatch` | **6** | **5** | §2.2 |
| `case02_paymentAmount` | 5 | 5 |
| `case02_paymentStatus` | 5 | 5 |
| `case02_confirmGoal` | 5 | 5 |
| `case02_demandAuthority` | 5 | 5 |
| `case02_noticeAccessFact` | 5 | 5 |
| `case02_paymentBasis` | 5 | 5 |
| `case02_deadline` | 5 | 5 |
| `case02_authorityResponse` | 5 | 5 |
| `case02_nonPaymentNotice` | 5 | 5 |
| `case02_blockage` | 5 | 5 |
| `case02_evidence` | 5 | 5 |
| `case02_finalGoal` | 5 | 5 |

### CASE_03

| 질문 id | 현재 | v1.1 |
|---------|------|------|
| `case03_authorityDemand` | 5 | 5 |
| `case03_inquiryFocus` | 4 | 4 |
| `case03_customerResponse` | **6** | **5** | §2.3 |
| `case03_confirmGoal` | 5 | 5 |
| `case03_deadline` | 4 | 4 |
| `case03_factRelationship` | 5 | 5 |
| `case03_explanationDetail` | 5 | 5 |
| `case03_explanationTrajectory` | **8** | **5** | §2.4 |
| `case03_prepRequired` | 4 | 4 |
| `case03_blockage` | 5 | 5 |
| `case03_evidence` | 5 | 5 |
| `case03_finalGoal` | 5 | 5 |

### CASE_04

| 질문 id | 현재 | v1.1 |
|---------|------|------|
| `case04_supplementTarget` | 5 | 5 |
| `case04_confirmGoal` | 5 | 5 |
| `case04_customerResponse` | **7** | **5** | §2.5 |
| `case04_deadline` | 4 | 4 |
| `case04_initialSubmission` | 3 | 3 |
| `case04_submissionRelation` | 4 | 4 |
| `case04_supplementReason` | 5 | 5 |
| `case04_addDocDetail` | 5 | 5 |
| `case04_modifyDetail` | 5 | 5 |
| `case04_evidenceDetail` | 4 | 4 |
| `case04_unclearFocus` | **6** | **5** | §2.6 |
| `case04_supplementTrajectory` | **8** | **5** | §2.7 |
| `case04_blockage` | 5 | 5 |
| `case04_evidence` | **6** | **5** | §2.8 |
| `case04_finalGoal` | 4 | 4 |

### CASE_05

| 질문 id | 현재 | v1.1 |
|---------|------|------|
| `case05_dispositionType` | 5 | 5 | D03 §A |
| `case05_confirmGoal` | 5 | 5 | D03 §A |
| `case05_customerResponse` | **6** | **5** | §2.9 |
| `case05_deadline` | 4 | 4 |
| `case05_factRelationship` | 5 | 5 |
| `case05_dispositionReason` | **6** | **5** | §2.10 |
| `case05_dispositionDetail` | 4 | 4 |
| `case05_factDetail` | 4 | 4 | D03 §A |
| `case05_explanationDetail` | **6** | **5** | §2.11 |
| `case05_submittedDocsDetail` | 6 | **5** | §2.12 |
| `case05_appealDetail` | **7** | **5** | §2.13 |
| `case05_authorityTrajectory` | **12** | **5** | §2.14 |
| `case05_plannedNextStep` | 6 | **삭제** | D03 의향 |
| `case05_blockage` | **9** | **5** | §2.15 |
| `case05_evidence` | **8** | **5** | §2.16 |
| `case05_finalGoal` | **8** | **5** | §2.17 |

### CASE_06 (Phase1)

| 질문 id | 현재 | v1.1 |
|---------|------|------|
| `case06_requiredActionCandidate` | 5 | 5 |
| `case06_knowledgeSource` | 5 | 5 |
| `case06_sourceChannel` | 5 | 5 |
| `case06_deadlineActionPair` | 5 | 5 |
| `case06_customerResponse` | 5 | 5 |

---

## 2. 축소 상세 (6+ → 5)

### 2.1 `case01_spatiotemporalFacet` (8→5)

**v1.1 slug (1인칭 요지):**

| slug | 문안 요지 |
|------|-----------|
| `st_records` | **기록·자료**로 확인할 수 있습니다. |
| `st_witness` | **증인·동행자**에게 확인할 수 있습니다. |
| `st_memory` | **기억**에만 의존합니다. |
| `st_no_path` | **지금은** 확인 방법을 모르겠습니다. |
| `st_searched_empty` | **찾아봤지만** 당시를 확인할 자료가 없었습니다. |

**뺀 slug → DI 이유**

| 뺀 slug | 이유 |
|---------|------|
| `st_has_records_pending` | `ready` vs `pending` — **수집 단계**는 판단보다 DI·evidence(G) |
| `st_witness_only_pending` | 증인 **연락 전/후** — `st_witness` + DI |
| `st_memory_only_fuzzy` | 기억 **선명도** — `st_memory` + DI |
| `st_cannot_verify` | `st_no_path`와 **탐색 전** 구분 희소 — DI |

**fact_dimensions:** `verify_mode` = records \| witness \| memory \| no_path \| searched_empty \| other  
**DI 커버:** `ready`/`pending`/`contacted`/`fuzzy` 등 — **직접 입력으로 받음** (이유: 5개로 `verify_mode` enum 전체 커버, 준비·연락 상태는 판단 축 아님).

---

### 2.2 `case02_situationMatch` (6→5)

**유지 5:** `match` · `amount_differs` · `reason_differs` · `both_differs` · `paid_redemand`  
**뺀:** `hard_to_judge` → **DI** (대조 자료 없음 — QG-04 단일 recall은 `factRelationship`/`blockage`와 중복 방지, 희소 경로).

---

### 2.3 `case03_customerResponse` (6→5)

**유지 5:** `none` · `phone_inquired` · `attended` · `explained_with_docs` · `other_channel`  
**뺀:** `phone_no_reply`/`phone_replied` → **`phone_inquired`** (접수·답변 세부는 DI; QG-02는 trajectory·explanationDetail에서 분기)  
**뺀:** (없음 — 6번째 `explained` 분리는 유지, phone 2→1)

*수정:* v1 had 6: none, phone_no_reply, phone_replied, attended, explained_with_docs, other_channel. Merge phone → phone_inquired = 5.

---

### 2.4 `case03_explanationTrajectory` (8→5)

| v1.1 slug | 흡수 |
|-----------|------|
| `proceed_no_more` | 동일 |
| `demands_more` | `more_explanation` · `more_docs` · `re_attendance` |
| `other_procedure` | `other_procedure` |
| `repeat_multiple` | 동일 |
| `no_response_or_unclear` | `no_response` · `guidance_unclear` |

**역할 분리 의견:** 5개로 충분 — **추가 요구 종류**는 `demands_more` + DI; 납부·처분은 `other_procedure`.

---

### 2.5 `case04_customerResponse` (7→5)

**유지 5:** `not_started` · `preparing` · `submitted_no_receipt` · `submitted_receipt_ok` · `inquired_no_answer`  
**뺀:** `inquired_answered` · `acted_other_channel` → **DI** (답변만 받음·비표준 채널 — 희소·채널 다양).

---

### 2.6 `case04_unclearFocus` (6→5)

**유지 5:** `what_submit_list` · `what_submit_apply` · `why_submit` · `format_how` · `format_where`  
**뺀:** `why_submit_reason` · `why_submit_apply` → **`why_submit`** (사유 이해 막힘 단일)  
*(slug `what_submit_apply` 유지 — 「목록은 보이나 적용」 축)*

---

### 2.7 `case04_supplementTrajectory` (8→5)

| v1.1 slug | 흡수 |
|-----------|------|
| `accepted_waiting` | 동일 |
| `more_after_accept` | `accepted_more_docs` · `accepted_more_same` · `modify_again_*` |
| `receipt_unconfirmed` | 동일 |
| `no_response` | 동일 |
| `guidance_unclear` | 동일 |

---

### 2.8 `case04_evidence` (6→5)

**유지 5:** `supplement_notice` · `message` · `original_submission` · `supplement_submission` · `none`  
**뺀:** `unsure` → **DI** (보유 여부 미확인).

---

### 2.9 `case05_customerResponse` (6→5)

**유지 5:** `none` · `inquired_no_answer` · `explanation_submitted` · `documents_submitted` · `appeal_requested`  
**뺀:** `inquired_answered` · `acted_other_channel` → **DI** (CASE_04 동형).

---

### 2.10 `case05_dispositionReason` (6→5)

**유지 5:** `violation_claimed` · `document_issue` · `requirement_not_met` · `deadline_procedure` · `no_clear_reason`  
**뺀:** `unsure` → **DI** (해석 실패 — `dispositionDetail`·blockage와 연계).

---

### 2.11 `case05_explanationDetail` (6→5)

**유지 5:** `written_no_receipt` · `written_receipt_ok` · `verbal_explanation` · `both_channels` · `partial_explanation`  
**뺀:** `verbal_no_record`/`verbal_with_record` → **`verbal_explanation`** · `both_unverified`/`both_aligned` → **`both_channels`**

**DI:** 접수·메모 **세부** (제2 사실 — 5개 내 미커버).

---

### 2.12 `case05_submittedDocsDetail` (6→5)

**유지 5:** `identity` · `financial` · `certificate` · `application_form` · `photo_evidence`  
**뺀:** `unsure` → **DI**

---

### 2.13 `case05_appealDetail` (7→5)

| v1.1 slug | 흡수 |
|-----------|------|
| `filed_no_receipt` | 동일 |
| `filed_pending_result` | `filed_no_schedule` |
| `filed_schedule_known` | 동일 |
| `preparing` | `preparing_deadline_*` |
| `considering` | `considering_rules_*` |

**DI:** 기한·요건 **읽음 정도** (제2 사실 — enum `deadline_known`/`rules_read` 미커버).

---

### 2.14 `case05_authorityTrajectory` (12→5)

| v1.1 slug | 흡수 |
|-----------|------|
| `outcome_maintained` | `maintained_once` · `maintained_repeated` |
| `outcome_changed` | `modified` · `revoked` |
| `authority_wants_more` | `more_docs_open` · `attend_explain` |
| `review_in_progress` | `review_ongoing` · `review_repeat_notice` |
| `no_clear_followup` | `no_reply_yet` · `reply_unclear` |

**뺀 → DI**

| slug | 이유 |
|------|------|
| `payment_demand` | 납부 축 — **CASE_02**·`deadline` (조건 1) |
| `additional_action` | 희소·유형 다양 |

**역할 분리 의견:** v1.1은 **5축 접힘** 유지. 접힘 후에도 DI 비율이 높으면 **stance 1차(유지/변경/대기)** + **요구 2차(자료/출석)** **2질문 분리** 검토 (IMPLEMENTER).

**fact_dimensions:** `trajectory_class` = maintained \| changed \| wants_more \| review_pending \| unclear_reply \| other

---

### 2.15 `case05_blockage` (9→5)

| v1.1 slug | 흡수 |
|-----------|------|
| `why_disposition` | 동일 (D03 문안) |
| `what_disposition` | 동일 |
| `fact_match` | 동일 |
| `what_to_do` | `what_to_do` · `deadline` · `appeal_method` |
| `next_response` | 동일 |

**뺀 → DI:** `evidence` · `unsure` (막힘 **종류** 희소·복합 — evidence는 목록형 G).

---

### 2.16 `case05_evidence` (8→5)

**유지 5:** `disposition_notice` · `message_email` · `submitted_docs` · `photo_video` · `none`  
**뺀:** `payment_proof` · `contract` · `unsure` → **DI**

---

### 2.17 `case05_finalGoal` (8→5)

**유지 5:** `why_disposition` · `what_disposition` · `fact_match` · `what_to_do` · `next_action`  
**뺀:** `evidence` · `expert` · `unsure` → **DI** (`expert` — 결과 화면 **전문가 CTA**가 주 출구).

---

## 3. v1.1 변경 없음 (≤5) — 요약

Phase1·Phase2 **대부분** 질문은 이미 ≤5. 표 §1에서 **현재=v1.1** 행.

---

## 4. fact_dimensions · DI 빈틈 (상황형)

| 질문 | dimension 값 | 처리 |
|------|----------------|------|
| `case05_appealDetail` | `rules_read` · `deadline_known` (구 2차원) | **DI** — 5 slug는 `appeal_stage`만 |
| `case05_explanationDetail` | `receipt` · `channel_detail` | **DI** |
| `case04_customerResponse` | `inquired_answered` · `other_channel` | **DI** |
| `case01_spatiotemporalFacet` | `ready`/`pending`/`contacted` | **DI** — §2.1 |
| trajectory 계열 | `payment_demand` · `additional_action` | **DI** — §2.14 |

**이유 없는 빈틈 금지** — 위 표 + 각 §「뺀」 테이블.

---

## 5. QG

| 게이트 | 결과 |
|--------|------|
| D06 | **해소함(문서)** — §1·§2 |
| D03 | **유지** — 5개 내 제2 사실만 |

---

*2026-09-26 · 2번창 · 문서만*
