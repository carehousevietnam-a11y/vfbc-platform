# VFBCAI CASE_05 질문·선택지 FINAL v1.2

| 항목 | 내용 |
|------|------|
| **성격** | v1 재작성안 + v1.1 (D03/D06) **통합 SoT** — 고객向 전문 |
| **LOCK** | 선택지 **최대 5 + DI** · D03 제2 사실은 규칙 충족 시만 |
| **DI** | slug `other` · 「위에 내용이 없거나 설명이 필요합니다 → 직접 입력」 |
| **근거** | REWRITE_MASTER v1/v1_1 · FIVE_CAP_INVENTORY v1_1 §2.9~2.17 · CASE_05 Phase1/2 설계 |

---

## 공통 — 직접 입력

모든 선택형 질문에 **6번째** 선택으로 다음을 둡니다.

| slug | 고객向 문안 |
|------|-------------|
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

## Phase1 (화면 순서)

### `case05_dispositionType`

| 항목 | 내용 |
|------|------|
| **노출 조건** | CASE_05 Phase1 체인 진입 시 항상 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 지금 받은 처분·조치 **안내·통지**를 기준으로, 제 상황에 가장 가까운 것은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `application_denied` | **신청·요청이 받아들여지지 않았다**는 조치·통지·안내를 받은 상황에 해당합니다. |
| `rights_ended` | **허가·자격·등록·면허가 중단·취소·말소·실효**된다는 조치·통지·안내를 받은 상황에 해당합니다. |
| `business_suspended` | **일정 기간 특정 행동·활동이 제한**된다는 조치·통지·안내를 받은 상황에 해당합니다. |
| `situation_mismatch` | **안내·통지에 적힌 사실·사유**가 제가 아는 상황과 **다르게 느껴지는** 상황에 해당합니다. |
| `disposition_unclear` | **어떤 종류의 처분·조치인지**부터 구분하기 어려운 안내·통지를 받은 상황에 해당합니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `disposition_kind` = denied | rights_ended | suspension | fact_mismatch | kind_unclear | other

**choice_facts:**

| slug | facts |
|------|-------|
| `application_denied` | disposition_kind=denied |
| `rights_ended` | disposition_kind=rights_ended |
| `business_suspended` | disposition_kind=suspension |
| `situation_mismatch` | disposition_kind=fact_mismatch |
| `disposition_unclear` | disposition_kind=kind_unclear |

---

### `case05_confirmGoal`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · dispositionType 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이 처분 사건에서 **지금 가장 먼저** 확인·준비하려는 것은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `understand_reason` | **처분 사유**를 안내·통지와 대조해 이해하는 것이 우선입니다. |
| `understand_impact` | **이 조치가 내 권리·활동에 주는 영향**을 먼저 정리하려 합니다. |
| `appeal_possibility` | **이의·재검토·행정심판 등 가능 여부와 기한**을 먼저 보려 합니다. |
| `what_to_do` | **지금 당장 할 일(제출·납부·출석 등)** 순서를 정하려 합니다. |
| `unsure` | **무엇부터 확인할지** 아직 정하지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `primary_goal` = understand_reason | understand_impact | appeal_possibility | what_to_do | unsure | other

**choice_facts:** slug 값 = `primary_goal` (1:1)

---

### `case05_customerResponse`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · confirmGoal 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이 조치에 대해 **지금까지** 한 일을 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `none` | **소명·서류·이의·재검토 요청을 하지 않았고**, 기관 **연락·답변도 없습니다**. |
| `inquired_no_answer` | **문의·확인만** 했고, **접수번호·서면 답변**은 아직 받지 못했습니다. |
| `explanation_submitted` | **소명·의견을 제출**했고, **접수 확인**은 받았거나 아직 못 받은 상태입니다. |
| `documents_submitted` | **서류·증빙을 제출**했고, **추가 요구 여부**는 아직 모르거나 대기 중입니다. |
| `appeal_requested` | **이의·재검토·심판 등을 신청**했거나 신청 절차를 진행 중입니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `action_taken` = none | inquired_pending | explanation | documents | appeal | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 문의 후 **답변**(전화·서면·방문)은 받았으나 소명·이의까지는 하지 않음 (`inquired_answered`) | 답변 수신·미제출 세부는 **제2 사실** — 5 slug는 **대응 종류**만 |
| **다른 방식**으로 대응 (`acted_other_channel`) | 경로·방식 다양 — CASE_04 동형 **DI** |

**choice_facts:**

| slug | facts |
|------|-------|
| `none` | action_taken=none |
| `inquired_no_answer` | action_taken=inquired_pending |
| `explanation_submitted` | action_taken=explanation |
| `documents_submitted` | action_taken=documents |
| `appeal_requested` | action_taken=appeal |

---

### `case05_deadline`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · customerResponse 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이 조치와 관련해 **대응 기한**을 지금 어디까지 확인했나요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `specific_date` | **정확한 날짜(또는 마감일)** 를 통지·안내에서 확인했고, 아래 칸에 적을 수 있습니다. |
| `window_only` | **「N일 이내」 등 기간만** 안내됐고 **달력 날짜**는 아직 계산·확인하지 못했습니다. |
| `exists_date_unknown` | **기한이 있다는 것만** 알고 **언제인지**는 못 찾았거나 여러 문구가 충돌합니다. |
| `not_checked` | **기한 문구를 아직 읽지 않았거나**, 통지에 기한이 있는지 **확인하지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `deadline_certainty` = date | window | exists_unknown | not_checked | other

**impossible_combinations:**

- `specific_date` 선택 시 `case05_deadlineDate` 텍스트 필수 (QG-03)

---

### `case05_deadlineDate`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case05_deadline` = `specific_date` |
| **질문 유형** | 텍스트 입력 |
| **질문 문장** | 확인한 대응 기한은 언제인가요? |

**placeholder:** 기억나는 날짜·기한을 적어 주세요.

---

## Phase2 (화면 순서)

### `case05_factRelationship`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 체인 진입 시 (Phase1 완료 후) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 처분 통지에 적힌 내용과 제가 아는 **실제 상황**을 비교하면 어떤가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `match` | 통지 **날짜·사실·사유**가 제 기억·자료와 **거의 같고**, 남은 차이는 **사소한 표현** 수준입니다. |
| `partial` | **일부는 맞지만** 날짜·장소·금액·사실 관계 등 **핵심이 하나 이상** 다릅니다. |
| `mismatch` | 통지 **사유·사실 관계 전체**가 제 상황과 **크게 다르고**, 그 차이를 **예로 들 수 있습니다**. |
| `hard_to_judge` | **그때 상황 기록·증빙**이 없어 통지와 **대조 자체가 어렵습니다**. |
| `unknown` | 통지 **문장 의미**를 이해하지 못해, 맞는지 **판단할 수 없습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `alignment` = match | partial | mismatch | hard_to_judge | unknown | other

---

### `case05_dispositionReason`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · factRelationship 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 통지·안내에 적힌 **처분 사유**를 제가 이해한 수준으로 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `violation_claimed` | **특정 위반·규정 위반**이 사유로 적혀 있습니다. |
| `document_issue` | **제출 서류·신청 정보 오류·누락**이 사유로 적혀 있습니다. |
| `requirement_not_met` | **요건·자격·조건 미충족**이 사유로 적혀 있습니다. |
| `deadline_procedure` | **기한·절차·제출 의무 위반**이 사유로 적혀 있습니다. |
| `no_clear_reason` | **사유란은 비어 있거나** 「규정에 따라」 등 **구체 사실 없이**만 적혀 있습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `reason_kind` = violation | document | requirement | deadline_procedure | no_clear | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 사유 문구는 읽었으나 **해석하지 못함** (구 `unsure`) | 해석·대조는 `dispositionDetail`·`blockage`와 연계 — **DI** |

**choice_facts:** slug ↔ `reason_kind` 1:1 (`no_clear_reason` → no_clear)

---

### `case05_dispositionDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · dispositionReason 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이 조치로 **실제 생기는 제한·변화**를 제가 이해한 수준으로 골라 주세요. |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `wording_unclear` | **무엇이 금지·중단되는지** 문구가 모호하고, **일상 활동 중 어디까지 막히는지** 정리하지 못했습니다. |
| `scope_unclear` | **제한·조치 범위·기간**이 통지에 있으나 **숫자·날짜·지역**이 서로 맞지 않거나 이해가 안 됩니다. |
| `partially_understood` | **일부 영향(예: 특정 활동만)** 은 이해했지만 **전체 효력·연쇄 영향**은 확실하지 않습니다. |
| `unsure` | **영향 자체**를 아직 파악하지 못했고 **통지 핵심 문단**을 다시 읽지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `impact_understanding` = wording_unclear | scope_unclear | partial | unsure | other

---

### `case05_factDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case05_factRelationship` ∈ {`partial`, `mismatch`} (QG-04) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 통지와 다른 부분을 **사실·날짜·내용** 중심으로 골라 주세요. |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `date_place_certain` | **날짜·장소·당시 상황**이 안내·통지와 다르다고 봅니다. |
| `date_place_fuzzy` | **날짜·장소**가 다를 **가능성**은 있으나 **정확히 말하기 어렵습니다**. |
| `content_differs_clear` | **사유·사실 관계**가 안내·통지와 다르고, **차이를 말로 설명할 수 있습니다**. |
| `content_differs_vague` | **내용이 다른 것 같지만** 무엇이 다른지 **아직 못 정했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `diff_axis` = date_place_clear | date_place_fuzzy | content_clear | content_vague | other

**choice_facts:** slug ↔ `diff_axis` 1:1 (`date_place_certain` → date_place_clear)

---

### `case05_explanationDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case05_customerResponse` = `explanation_submitted` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 제출한 **소명·의견**의 방식과 **접수 상태**를 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `written_no_receipt` | **서면**으로 소명·의견을 제출했고, **접수 확인은 아직** 받지 못했습니다. |
| `written_receipt_ok` | **서면**으로 제출했고 **접수·접수번호 안내**를 받았습니다. |
| `verbal_explanation` | **전화·방문**으로만 소명·의견을 설명했고, **메모·확인서는 없을 수도** 있으며 **내용을 메모해 두었을 수도** 있습니다. |
| `both_channels` | **서면과 구두 모두** 소명·의견을 전달했고, 말한 내용이 **서면과 같지 않을 수도** 있으며 **같다고 생각할 수도** 있습니다. |
| `partial_explanation` | **질문받은 내용 중 일부만** 소명·의견을 제출했고 **아직 충분히 설명하지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `explanation_channel` = written | verbal | both | partial | other · `receipt` · `channel_detail` (세부)

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 접수번호·접수 시각 등 **접수 세부** | 제2 사실 — 5 slug는 **채널·접수 여부 축**만 |
| 구두 **메모 유무**·서면·구두 **내용 일치 여부**만 따로 구분 | `verbal_explanation`·`both_channels`에 **흡수** — 미세 구분은 **DI** |

**choice_facts:**

| slug | facts |
|------|-------|
| `written_no_receipt` | explanation_channel=written; receipt=pending |
| `written_receipt_ok` | explanation_channel=written; receipt=confirmed |
| `verbal_explanation` | explanation_channel=verbal |
| `both_channels` | explanation_channel=both |
| `partial_explanation` | explanation_channel=partial |

---

### `case05_submittedDocsDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case05_customerResponse` = `documents_submitted` |
| **질문 유형** | 목록형 · 복수 선택 |
| **질문 문장** | 이번에 기관에 **제출한 서류 종류**를 골라 주세요. (여러 개 선택 가능) |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `identity` | **신분·인적** 관련 서류를 제출했습니다. |
| `financial` | **재무·금액** 관련 서류를 제출했습니다. |
| `certificate` | **증명서·확인서**를 제출했습니다. |
| `application_form` | **신청서·양식**을 제출했습니다. |
| `photo_evidence` | **사진·현장** 자료를 제출했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `doc_kind` (복수) = identity | financial | certificate | application_form | photo_evidence | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 제출 서류 **종류를 구분하기 어려움** (구 `unsure`) | 종류·명칭 **직접 입력** — **DI** |

---

### `case05_appealDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case05_customerResponse` = `appeal_requested` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | **이의·재검토·심판** 신청 상태를 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `filed_no_receipt` | 이의·재검토를 **신청했지만**, 접수 확인·접수번호는 **아직 받지 못했습니다**. |
| `filed_pending_result` | 이의·재검토를 **신청했고**, 접수 안내는 받았지만 **결과·다음 안내 일정은 아직 모릅니다**. |
| `filed_schedule_known` | 이의·재검토를 **신청했고**, 결과·다음 안내 **일정을 알고 있습니다**. |
| `preparing` | 신청을 **준비 중**이고, 신청 **기한을 확인했거나 아직 확인하지 못했습니다**. |
| `considering` | 신청 여부를 **검토 중**이고, 통지서의 **기한·요건을 읽었거나 아직 읽지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `appeal_stage` = filed | filed_pending | filed_scheduled | preparing | considering | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| 신청 **기한만** 확인·미확인 (`preparing_deadline_known` / `preparing_deadline_unknown`) | `preparing` slug에 **흡수** — 기한 숫자·날짜는 **DI** |
| **요건·규정 읽음** 여부 (`considering_rules_read` / `considering_rules_unread`) | `considering` slug에 **흡수** — 읽은 조항·기한 문구는 **DI** |

**choice_facts:**

| slug | facts |
|------|-------|
| `filed_no_receipt` | appeal_stage=filed; receipt=none |
| `filed_pending_result` | appeal_stage=filed; receipt=yes; schedule_known=no |
| `filed_schedule_known` | appeal_stage=filed; schedule_known=yes |
| `preparing` | appeal_stage=preparing |
| `considering` | appeal_stage=considering |

---

### `case05_authorityTrajectory`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `customerResponse` ∈ {`inquired_no_answer`, `explanation_submitted`, `documents_submitted`, `appeal_requested`} 또는 DI(문의 답변·기타 대응) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 기관에 대응한 **이후** 받은 안내·결과·반복 요구를 **한 번에** 골라 주세요. |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `outcome_maintained` | **처분 유지** 안내를 받았고, **한 번이거나 같은 유지 안내가 여러 번** 반복되었으며 **추가 소명·자료 요구는 없었거나** 유지 안내와 함께만 있었습니다. |
| `outcome_changed` | **처분 내용 변경** 또는 **처분 철회·취소** 안내를 받았고, **변경 전·후** 또는 **효력 종료·복원** 관련 문구를 확인했습니다. |
| `authority_wants_more` | **추가 서류·증빙**을 요구받았거나 **출석·추가 설명·면담**을 요구받았고, **아직 제출·참석하지 않았거나** 제출·면담 후 **결과 대기** 중입니다. |
| `review_in_progress` | **재검토·심사 중**이라는 안내를 받았거나 **재검토가 계속된다**는 안내를 **반복** 받았고, **유지·변경·종료 결과**는 아직 없습니다. |
| `no_clear_followup` | 대응 후 **아직 답변·결과 안내가 없거나**, **답변은 받았으나** 유지·변경·철회·추가 요구 중 **무엇인지 정리하지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `trajectory_class` = maintained | changed | wants_more | review_pending | unclear_reply | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **납부·과태료·벌금** 요구 (구 `payment_demand`) | 납부 축 — CASE_02·`deadline` 등 **별 질문** (조건 1) |
| **새 조치·추가 제재** 안내 (구 `additional_action`) | 유형 희소·다양 — **DI** |

**choice_facts:**

| slug | facts |
|------|-------|
| `outcome_maintained` | trajectory_class=maintained |
| `outcome_changed` | trajectory_class=changed |
| `authority_wants_more` | trajectory_class=wants_more |
| `review_in_progress` | trajectory_class=review_pending |
| `no_clear_followup` | trajectory_class=unclear_reply |

---

### `case05_blockage`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · authorityTrajectory(또는 미노출 경로) 이후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 지금 이 처분·조치 사건에서 **가장 막힌 부분**은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `why_disposition` | **왜 이런 조치인지** 모르겠습니다. |
| `what_disposition` | **조치 종류·효력**이 무엇인지 모르겠습니다. |
| `fact_match` | **사실이 맞는지** 확인이 어렵습니다. |
| `what_to_do` | **지금 할 일 순서**를 모르겠고, **대응 기한**을 찾지 못했거나 **이의·재검토 방법·신청 양식**을 알지 못해 막혀 있습니다. |
| `next_response` | **기관 다음 답변**을 기다리거나 **받은 답을 이해하지 못해** 막혀 있습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `block_axis` = why | what | fact | steps | next_reply | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **어떤 증빙이 필요한지** 모름 (구 `evidence`) | 증빙 **목록**은 `case05_evidence` — 막힘 **종류** 희소·복합 **DI** |
| **가장 막힌 것**을 한 가지로 말하기 어려움 (구 `unsure`) | 복합 막힘 — **DI** |
| **대응 기한**만 막힘 (구 `deadline`) | `what_to_do`에 **흡수** |
| **이의·재검토 방법**만 막힘 (구 `appeal_method`) | `what_to_do`에 **흡수** |

**choice_facts:** slug ↔ `block_axis` 1:1 (`what_to_do` → steps)

---

### `case05_evidence`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 · blockage 답변 후 |
| **질문 유형** | 목록형 · 복수 선택 |
| **질문 문장** | 처분·조치와 관련해 **지금 활용 가능한 자료**를 골라 주세요. (여러 개 선택 가능) |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `disposition_notice` | **처분 통지서**(또는 동일 내용 안내)를 가지고 있습니다. |
| `message_email` | **기관 문자·이메일** 등 연락 내용을 가지고 있습니다. |
| `submitted_docs` | **제출한 서류 사본**을 가지고 있습니다. |
| `photo_video` | **사진·영상** 자료를 가지고 있습니다. |
| `none` | **관련 자료가 없습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `evidence_kind` (복수) = notice | message | submitted | photo | none | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **납부·영수** 증빙 (구 `payment_proof`) | 금액·납부 축 — **DI** |
| **계약·관계** 서류 (구 `contract`) | 서류 종류 다양 — **DI** |
| **있는지 아직 확인 못 함** (구 `unsure`) | 보유 여부 미확인 — **DI** |

---

### `case05_finalGoal`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase2 tail · evidence 답변 후 · Phase1 `confirmGoal`과 **동일 slug 제외** |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 아직 덜 확인된 것 중, **이번 검토에서 우선**하고 싶은 것은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `why_disposition` | 처분 **사유**를 안내·통지와 대조해 이해하고 싶습니다. |
| `what_disposition` | 처분 **내용·효력**이 정확히 무엇인지 알고 싶습니다. |
| `fact_match` | **실제 상황과 통지**가 맞는지 확인하고 싶습니다. |
| `what_to_do` | **지금 할 일** 순서를 알고 싶습니다. |
| `next_action` | **이의·소명·재검토** 다음 단계를 알고 싶습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `final_priority` = why_disposition | what_disposition | fact_match | what_to_do | next_action | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| **필요 서류·증빙** 확인 (구 `evidence`) | `case05_evidence`와 역할 분리 — 우선순위 **DI** |
| **VFBCAI 전문가팀** 연결 (구 `expert`) | 결과 화면 **전문가 CTA**가 주 출구 — **DI** |
| **우선순위 정하기 어려움** (구 `unsure`) | **DI** |

---

## 옛 slug → 새 slug

| 구분 | 옛 slug | 새 slug | 비고 |
|------|---------|---------|------|
| deadline | `uncertain` | `exists_date_unknown` | |
| deadline | `period_stated` | `window_only` | |
| deadline | `unsure` | `not_checked` | |
| customerResponse | `inquired` | `inquired_no_answer` 또는 DI | 답변 수신은 DI |
| customerResponse | `inquired_answered` | `other` (DI) | §2.9 |
| customerResponse | `acted_other_channel` | `other` (DI) | §2.9 |
| dispositionReason | `unsure` | `other` (DI) | §2.10 |
| explanationDetail | `verbal_no_record` · `verbal_with_record` | `verbal_explanation` | §2.11 |
| explanationDetail | `both_unverified` · `both_aligned` | `both_channels` | §2.11 |
| submittedDocsDetail | `unsure` | `other` (DI) | §2.12 |
| appealDetail | `filed_no_schedule` | `filed_pending_result` | §2.13 |
| appealDetail | `preparing_deadline_known` · `preparing_deadline_unknown` | `preparing` | 기한 세부 DI |
| appealDetail | `considering_rules_read` · `considering_rules_unread` | `considering` | 요건 세부 DI |
| authority | `maintained_once` · `maintained_repeated` | `outcome_maintained` | §2.14 |
| authority | `modified` · `revoked` | `outcome_changed` | §2.14 |
| authority | `more_docs_open` · `attend_explain` | `authority_wants_more` | §2.14 |
| authority | `review_ongoing` · `review_repeat_notice` | `review_in_progress` | §2.14 |
| authority | `no_reply_yet` · `reply_unclear` | `no_clear_followup` | §2.14 |
| authority | `payment_demand` | `other` (DI) | §2.14 |
| authority | `additional_action` | `other` (DI) | §2.14 |
| authority | `case05_authorityFollowUp.*` | `case05_authorityTrajectory.*` | 3질문 합침 |
| authority | `case05_dispositionOutcome.*` | `case05_authorityTrajectory.*` | 3질문 합침 |
| authority | `case05_repeatFollowUp.*` | `case05_authorityTrajectory.*` | 3질문 합침 |
| blockage | `deadline` · `appeal_method` | `what_to_do` | §2.15 |
| blockage | `evidence` · `unsure` | `other` (DI) | §2.15 |
| evidence | `payment_proof` · `contract` · `unsure` | `other` (DI) | §2.16 |
| finalGoal | `evidence` · `expert` · `unsure` | `other` (DI) | §2.17 |
| dispositionType DI | `other_disposition` | `other` | slug 통일 |
| **삭제 질문** | `case05_plannedNextStep` | — | v1.1 의향 금지 |
| **삭제 질문** | `case05_dispositionOutcome` | — | trajectory 합침 |
| **삭제 질문** | `case05_repeatFollowUp` | — | trajectory 합침 |
| **삭제 질문** | `case05_authorityFollowUp` | — | trajectory 합침 |

---

*v1.2 FINAL — 문서 SoT · 코드 미반영*
