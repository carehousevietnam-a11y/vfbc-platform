# VFBCAI CASE_05 질문·선택지 재작성 마스터 v1.1

| 항목 | 내용 |
|------|------|
| **기준** | v1 (`87b7a91`) + **D03** + **D06** (`VFBCAI_QUESTION_CHOICE_MAX_FIVE_RULE_v1_1.md`) |
| **D06 SoT** | `VFBCAI_QUESTION_CHOICE_FIVE_CAP_INVENTORY_v1_1.md` §1 CASE_05 · §2.9~2.17 |
| **유지** | trajectory 합침 · 기한 4+DI · customerResponse 접수 확인/미확인 분기 |
| **삭제** | `case05_plannedNextStep` (의향 질문 금지) |

---

## A. D03 v1.1 패치 — 문제 질문만

### A.1 `case05_dispositionType` (상황형)

**질문 (유지):** 지금 받은 처분·조치 **안내·통지**를 기준으로, 제 상황에 가장 가까운 것은 무엇인가요?

| slug | v1 (수정 전) | v1.1 (수정 후) |
|------|--------------|----------------|
| `application_denied` | 신청·요청이 거부됐다는 통지를 받았고, **통지서… 가지고 있으며, 거부 사유 문구는 읽었지만 대조하지 못했습니다**. | **신청·요청이 받아들여지지 않았다**는 조치·통지·안내를 받은 상황에 해당합니다. |
| `rights_ended` | …효력 발생·종료 시점이 적혀 있으나 **일부만 이해했습니다**. | **허가·자격·등록·면허가 중단·취소·말소·실효**된다는 조치·통지·안내를 받은 상황에 해당합니다. |
| `business_suspended` | …제한 범위·기간은 문구로 있으나 **실제로 무엇을 멈춰야 하는지 정리하지 못했습니다**. | **일정 기간 특정 행동·활동이 제한**된다는 조치·통지·안내를 받은 상황에 해당합니다. |
| `situation_mismatch` | …다르게 느껴지고, **말로는 설명할 수 있으나 서면으로 정리하지는 못했습니다**. | **안내·통지에 적힌 사실·사유**가 제가 아는 상황과 **다르게 느껴지는** 상황에 해당합니다. |
| `disposition_unclear` | …**사유·효력 문구도 아직 읽지 못했거나 이해하지 못했습니다**. | **어떤 종류의 처분·조치인지**부터 구분하기 어려운 안내·통지를 받은 상황에 해당합니다. |
| `other_disposition` | (DI) | (DI) 동일 |

**제2 사실:** v1.1 전 선택지 **미부착** (조건 3 미충족 — 읽음/대조/이해는 별 질문·별 축 필요).

**fact_dimensions:** `disposition_kind` = denied \| rights_ended \| suspension \| fact_mismatch \| kind_unclear \| other

**impossible_combinations:** (단일 선택) 상호 배타 slug만.

**choice_facts:**

| slug | facts |
|------|-------|
| `application_denied` | disposition_kind=denied |
| `rights_ended` | disposition_kind=rights_ended |
| `business_suspended` | disposition_kind=suspension |
| `situation_mismatch` | disposition_kind=fact_mismatch |
| `disposition_unclear` | disposition_kind=kind_unclear |
| `other_disposition` | disposition_kind=other |

---

### A.2 `case05_confirmGoal` (상황형)

**질문 v1.1:** 이 처분 사건에서 **지금 가장 먼저** 확인·준비하려는 것은 무엇인가요? *(「이미 한 대응」 문구 삭제 — `customerResponse`가 담당)*

| slug | v1 | v1.1 |
|------|-----|------|
| `understand_reason` | …우선이고, **아직 기관에 소명·이의는 하지 않았거나 답을 기다리는 중**입니다. | **처분 사유**를 안내·통지와 대조해 이해하는 것이 우선입니다. |
| `understand_impact` | …**효력·제한 범위 문구는 일부만 읽은 상태**입니다. | **이 조치가 내 권리·활동에 주는 영향**을 먼저 정리하려 합니다. |
| `appeal_possibility` | …**신청은 안 했거나 준비 중**입니다. | **이의·재검토·행정심판 등 가능 여부와 기한**을 먼저 보려 합니다. |
| `what_to_do` | …**통지서의 절차 안내는 아직 끝까지 읽지 못했습니다**. | **지금 당장 할 일(제출·납부·출석 등)** 순서를 정하려 합니다. |
| `unsure` | …**통지·기한·대응 이력** 어느 것도 정리하지 못했습니다. | **무엇부터 확인할지** 아직 정하지 못했습니다. |

**제2 사실:** 미부착 — 대응 이력은 `case05_customerResponse` (조건 1).

**fact_dimensions:** `primary_goal` = understand_reason \| understand_impact \| appeal_possibility \| what_to_do \| unsure \| other

**choice_facts:** slug = `primary_goal` 값 1:1.

---

### A.3 `case05_dispositionReason` (상황형)

| slug | v1 | v1.1 |
|------|-----|------|
| `violation_claimed` | …**읽었지만 제가 그 행위를 했는지 대조하지 못했습니다**. | **특정 위반·규정 위반**이 사유로 적혀 있습니다. |
| `document_issue` | …**어떤 서류인지는 알지만 보완 가능 여부는 모릅니다**. | **제출 서류·신청 정보 오류·누락**이 사유로 적혀 있습니다. |
| `requirement_not_met` | …**제 충족 여부는 정리하지 못했습니다**. | **요건·자격·조건 미충족**이 사유로 적혀 있습니다. |
| `deadline_procedure` | …**부분만 이해했습니다**. | **기한·절차·제출 의무 위반**이 사유로 적혀 있습니다. |
| `no_clear_reason` | (유지) | (유지) |
| `unsure` | (유지) | (유지) |

**제2 사실:** 미부착 — 대조·이해는 `factRelationship`·`dispositionDetail` 등.

**fact_dimensions:** `reason_kind` = violation \| document \| requirement \| deadline_procedure \| no_clear \| interpret_fail \| other

**choice_facts:** slug ↔ `reason_kind` 1:1.

---

### A.4 `case05_factDetail` (상황형 · partial/mismatch만)

| slug | v1 | v1.1 |
|------|-----|------|
| `date_place_certain` | …**확신하고, 반대 근거(일정·사진 등)가 있습니다**. | **날짜·장소·당시 상황**이 안내·통지와 다르다고 봅니다. |
| `date_place_fuzzy` | (유지) | (유지) |
| `content_differs_clear` | …**차이 목록을 메모·자료로 정리** | **사유·사실 관계**가 안내·통지와 다르고, **차이를 말로 설명할 수 있습니다**. |
| `content_differs_vague` | (유지) | (유지) |

**제2 사실:** 미부착 — 증빙 보유는 `case05_evidence`.

**fact_dimensions:** `diff_axis` = date_place_clear \| date_place_fuzzy \| content_clear \| content_vague \| other

**choice_facts:** slug ↔ `diff_axis` 1:1.

---

### A.5 `case05_blockage` (상황형)

**질문 v1.1:** 지금 이 처분·조치 사건에서 **가장 막힌 부분**은 무엇인가요?

| slug | v1 | v1.1 |
|------|-----|------|
| `why_disposition` | …**사유 문단을 읽어도** 이해가 안 됩니다. | **왜 이런 조치인지** 모르겠습니다. |
| `what_disposition` | …**주변에 물어봤거나 인터넷만** 찾아봤습니다. | **조치 종류·효력**이 무엇인지 모르겠습니다. |
| `fact_match` | …**대조할 자료를 아직 모으지 못했습니다**. | **사실이 맞는지** 확인이 어렵습니다. |
| `what_to_do` | …**기한·제출처를 찾지 못했습니다**. | **지금 할 일 순서**를 모르겠습니다. |
| `appeal_method` | …**신청서·양식을 받지 못했습니다**. | **이의·재검토 방법**을 모르겠습니다. |
| `deadline` | …**Phase1에서도 날짜를 못 적었습니다**. | **대응 기한**을 모르겠습니다. |
| `evidence` | …**가진 자료가 충분한지도** | **어떤 증빙이 필요한지** 모르겠습니다. |
| `next_response` | (유지 핵심) | **기관 다음 답변**을 기다리거나 **받은 답을 이해하지 못해** 막혀 있습니다. |
| `unsure` | (유지) | (유지) |

**제2 사실:** 미부착.

**fact_dimensions:** `block_axis` = why \| what \| fact \| steps \| appeal \| deadline \| evidence \| next_reply \| unsure \| other

**choice_facts:** slug ↔ `block_axis` 1:1.

---

### A.6 `case05_authorityTrajectory` — `payment_demand`

| slug | v1 | v1.1 |
|------|-----|------|
| `payment_demand` | …**금액·기한은 일부만 확인했습니다**. | **납부·과태료·벌금** 등을 요구받았습니다. |

**제2 사실:** 미부착 — 금액·기한은 CASE_02·`deadline`·별 질문.

**choice_facts (payment_demand만):** stance=demand; repeat_layer=na; submission_loop=none

*(trajectory 전체 `stance` enum은 v1 유지; `maintained_once` 등에 붙은 「추가 요구 없음」은 v1.2에서 필요 시 **별 slug 분리** 검토 — v1.1은 지시 목록만 수정)*

---

### A.7 `case05_plannedNextStep` — **삭제**

| | |
|--|--|
| v1 | Phase2 `customerResponse=none` 시 의향 질문 6+DI |
| v1.1 | **질문 삭제** — `VFBCAI_SECOND_FACT_ATTACHMENT_RULE_v1_1.md` 의향 금지 · 미대응은 `customerResponse=none` |

**노출 순서:** … → authorityTrajectory → ~~plannedNextStep~~ → blockage → evidence → finalGoal

---

## B. v1.1 확정 선택지 표 (패치 질문 · 운영 SoT)

§A와 동일 문안. **미패치 질문**은 v1 (`87b7a91`) 본문과 동일 — `customerResponse`·`deadline` 4+DI·`explanationDetail` 접수 분기·`authorityTrajectory`(payment_demand 외) 등.

---

## C. QG (v1.1)

| 게이트 | 결과 |
|--------|------|
| QG-01 | **해당 없음** (기한 미변경) |
| QG-02 | **해소함** (confirmGoal 대응 이력 제거) |
| QG-03 | **해당 없음** |
| QG-04 | **해당 없음** |
| **QG-05** | **해소함** — §D · 인벤토리 §2.9~2.17 |
| D03 제2사실 | **해소함** (§A) |

---

## D. D06 — 선택지 최대 5 (v1.1 확정 slug)

인벤토리 **§2.9~2.17** 원문·뺀 목록·DI 빈틈. 요약 slug만:

| 질문 | v1.1 내용 5 |
|------|-------------|
| `customerResponse` | none · inquired_no_answer · explanation_submitted · documents_submitted · appeal_requested |
| `dispositionReason` | violation_claimed · document_issue · requirement_not_met · deadline_procedure · no_clear_reason |
| `explanationDetail` | written_no_receipt · written_receipt_ok · verbal_explanation · both_channels · partial_explanation |
| `submittedDocsDetail` | identity · financial · certificate · application_form · photo_evidence |
| `appealDetail` | filed_no_receipt · filed_pending_result · filed_schedule_known · preparing · considering |
| `authorityTrajectory` | outcome_maintained · outcome_changed · authority_wants_more · review_in_progress · no_clear_followup |
| `blockage` | why_disposition · what_disposition · fact_match · what_to_do · next_response |
| `evidence` | disposition_notice · message_email · submitted_docs · photo_video · none |
| `finalGoal` | why_disposition · what_disposition · fact_match · what_to_do · next_action |

---

*v1.1 — 2026-09-26 · 2번창 · 문서만*
