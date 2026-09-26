# VFBCAI CASE_01 질문·선택지 FINAL v1.2

| 항목 | 내용 |
|------|------|
| **성격** | v1 재작성안 + v1.1 (D06) + Brief v3 **통합 SoT** — 고객向 전문 |
| **LOCK** | 선택지 **최대 5 + DI** · Phase2 facet **Brief v3 §3** 노출 |
| **DI** | slug `other` · 「위에 내용이 없거나 설명이 필요합니다 → 직접 입력」 |
| **근거** | REWRITE_MASTER v1/v1_1 · RATIO_REMEDIATION_QUESTION_BRIEF v3 · FIVE_CAP_INVENTORY v1_1 · Layer J manifest (draft) |

---

## 공통 — 직접 입력

모든 선택형 질문에 **6번째** 선택으로 다음을 둡니다.

| slug | 고객向 문안 |
|------|-------------|
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

## Phase1 (화면 순서)

### `case01_violationContent`

| 항목 | 내용 |
|------|------|
| **노출 조건** | CASE_01 Phase1 체인 진입 시 항상 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국에서 **무엇이 문제**라고 안내했는지, 제가 이해한 수준으로 골라 주세요. |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `violation_stated` | **특정 위반·행위**가 문제라고 들었고 **그 행위 문구**는 읽었습니다. |
| `situation_disputed` | **제가 하지 않았거나 다르다**고 느끼는 **행위**가 문제라고 들었습니다. |
| `demand_unclear` | **무엇이 문제**인지 **핵심 문장**을 확인하지 못했습니다. |
| `multiple_issues` | **여러 가지** 문제가 동시에 언급되었습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `issue_clarity` · `dispute` (yes | no | unknown)

---

### `case01_factRelationship`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · violationContent 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 안내 내용과 **실제 상황**을 비교하면? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `match` | **거의 같고** 차이는 사소합니다. |
| `date_place_wrong` | **날짜·장소·당시 상황**이 다릅니다. |
| `content_wrong` | **사실·사유 관계**가 다릅니다. |
| `cannot_compare_yet` | **대조할 기록**이 없어 **아직 비교 못 했습니다**. |
| `hard_to_explain` | **설명은 들었으나** 같은 기준으로 **비교하기 어렵습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `alignment` = match | date_place | content | compare_blocked | hard_compare | other

**impossible_combinations:**

- `cannot_compare_yet` — facet C에서 「차이 확정」 slug 금지 (QG-04)
- `cannot_compare_yet` · `hard_to_explain` — compare/recall **단일 출구** (K·J 분리, Brief v3)

---

### `case01_factCompareGap`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case01_factRelationship` = `cannot_compare_yet` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | **아직 비교하지 못한** 주된 이유는? |

#### 선택지 (내용 3 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `gap_no_records` | **당시 기록·증빙**이 없습니다. |
| `gap_hearsay_channel` | **간접 경로**로만 들었습니다. *(K로 이어짐)* |
| `gap_language_access` | **언어·통역** 때문에 문구를 **확인 못 했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case01_customerResponded`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · factRelationship(·factCompareGap) 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이 안내를 받은 뒤 교통국에 **대응한 경험**이 있나요? |

#### 선택지 (내용 2 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `no_contact_yet` | **기관에 대응하지 않았습니다**. |
| `has_responded` | **문의·제출·출석 등**으로 **대응했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `responded` = no | yes | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| `none` (legacy) | `no_contact_yet` |

---

### `case01_deadline`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · customerResponded 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국에서 **대응 기한**을 어떻게 안내했나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `date_known` | **연·월·일 또는 마감일**을 확인했고 아래에 적을 수 있습니다. |
| `window_only` | **「N일·이번 달」 등 기간만** 들었습니다. |
| `exists_unknown` | **기한은 있다**고만 알고 **날짜**는 모릅니다. |
| `no_deadline_stated` | **기한 언급**이 없었거나 **기억나지 않습니다**. |
| `asap` | **가능한 한 빨리**만 안내했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| `deadline_day_known` · `confirmed` | `date_known` |
| `uncertain` | `exists_unknown` |
| `deadline_window_only` | `window_only` |
| `no_stated` | `no_deadline_stated` |

**impossible_combinations:**

- `date_known` → `case01_deadlineDate` 텍스트 필수 (QG-03)

---

### `case01_deadlineDate`

| 항목 | 내용 |
|------|------|
| **노출 조건** | `case01_deadline` = `date_known` |
| **질문 유형** | 텍스트 입력 |
| **질문 문장** | 확인한 대응 기한은 언제인가요? |

**placeholder:** 기억나는 날짜·기한을 적어 주세요.

---

### `case01_confirmGoal`

| 항목 | 내용 |
|------|------|
| **노출 조건** | Phase1 · deadline(·deadlineDate) 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이번 검토에서 **가장 먼저** 확인·준비하려는 것은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `understand_demand` | **요구 내용**을 이해하려 합니다. |
| `verify_facts` | **사실 관계**를 확인하려 합니다. |
| `next_steps` | **다음 조치**를 알려 합니다. |
| `deadline` | **기한**을 확인하려 합니다. |
| `unsure` | **우선순위**를 정하지 못했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

## Phase2 (화면 순서 · Brief v3 §3)

**공통 진입:** CASE_01 Phase2 체인 (Phase1 완료 후).

### Phase2 노출 기호 — 1줄 (LOCK)

| 기호 | id | 노출 조건 (사실) |
|------|-----|------------------|
| **A** | `case01_authorityDemand` | CASE_01 Phase2 체인 진입 |
| **B** | `case01_actualSituation` | CASE_01 Phase2 체인 진입 (A와 함께) |
| **C** | `case01_factConflictFacet` | `factRelationship` = `date_place_wrong` |
| **D** | `case01_spatiotemporalFacet` | `factRelationship` ∈ {`date_place_wrong`, `cannot_compare_yet`} |
| **J** | `case01_compareRecordGap` | `factRelationship` = `cannot_compare_yet` |
| **K** | `case01_languageAccessFact` | `factCompareGap` ∈ {`gap_hearsay_channel`, `gap_language_access`} **OR** `authorityDemand` = `demand_unclear` |
| **E** | `case01_responseDetail` | `customerResponded` = `has_responded` |
| **Ff** | `case01_authorityFollowUpKind` | `customerResponded` = `has_responded` |
| **L** | `case01_noticeDeliveryFact` | `customerResponded` = `no_contact_yet` |
| **Q** | `case01_procedureStageFact` | `no_contact_yet` **AND** `noticeDelivery` ∈ {`del_phone_message`, `del_written_only`} |
| **O** | `case01_officeIdentityFact` | `no_contact_yet` **AND** `factRelationship` = `match` |
| **P** | `case01_paymentInstructionFact` | `authorityDemand` ∈ {`payment`, `pay_core_traffic`, `pay_bundled`} |
| **M** | `case01_attendInstructionFact` | `authorityDemand` ∈ {`attend_explain`, `attendance`} |
| **S** | `case01_supplementInstructionFact` | `authorityDemand` ∈ {`supplement`, `supplement_core`} |
| **T** | `case01_correctTargetFact` | `authorityDemand` = `correct_record` |
| **U** | `case01_unclearDemandFact` | `authorityDemand` = `demand_unclear` |
| **G** | `case01_evidence` | Phase2 facet 체인 완료 후 (증거 목록) |
| **H** | `case01_blockage` | Phase2 · evidence 이전 또는 체인 tail 직전 (게이트 동형) |
| **tail** | `case01_finalGoal` | Phase2 tail · Phase1 `confirmGoal`에서 이미 고른 slug **제외** |

**P1 실질 N:** `factRelationship` ≠ `cannot_compare_yet` → **5**. `cannot_compare_yet` **AND** `factCompareGap` 완료 → **6**.

---

### `case01_authorityDemand`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **A** — Phase2 체인 진입 시 항상 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국에서는 이 안내를 받은 뒤 구체적으로 **무엇을 하라고** 안내했나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `pay_core_traffic` | 이번 교통·위반 문제의 **핵심으로 납부·벌금**을 요구했고, **다른 안내와 섞여 있지 않습니다**. |
| `supplement_core` | 이번 건 **핵심이 서류 보완·재제출**이고, **납부·출석 요구는 아직 아닙니다**. |
| `attend_explain` | **출석·소명·추가 설명**을 요구했고, **제출만으로 끝나지 않습니다**. |
| `correct_record` | **기존 제출 내용이나 기록**을 수정하거나 확인하라고 안내했습니다. |
| `demand_unclear` | **구체적으로 무엇을 하라는지** 안내하지 않았거나, **설명은 들었지만** 무엇을 해야 하는지 **정확히 이해하지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `demand_class` = pay_core | supplement_core | attend | correct | unclear | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| `pay_bundled` | **다른 안내와 묶인 납부** — `pay_core_traffic` + **DI** (CASE_02) |
| `payment` · `supplement` · `attendance` (legacy) | `pay_core_traffic` · `supplement_core` · `attend_explain` |

---

### `case01_actualSituation`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **B** — authorityDemand 답변 후 |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국의 설명과 별개로, **실제로 어떤 일이 있었는지** 가장 가까운 것은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `accept_facts` | **실제로 그런 행동이나 상황**이 있었고, 교통국이 문제라고 보는 **쟁점과 겹치는 부분**이 있습니다. |
| `partial_similar` | **비슷한 일**은 있었지만 **날짜·장소·행동·당사자** 등 **중요한 부분**이 다릅니다. |
| `deny` | **그런 행동이나 상황**이 **실제로는 없었습니다**. |
| `partial` | **일부는 맞지만** 전체 상황은 **설명받은 내용과 다릅니다**. |
| `unsure` | **당시 상황**을 **정확히 정리**하거나 **한 문장으로 설명하기 어렵습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `actual_stance` = accept | partial_similar | deny | partial | unsure | other

---

### `case01_factConflictFacet`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **C** — `factRelationship` = `date_place_wrong` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국이 말한 내용과 실제로 다르다고 보는 점은 무엇에 가장 가깝나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `conflict_time` | 교통국이 말한 **날짜·시간**이 제가 기억하는 것과 **다릅니다**. |
| `conflict_place` | 교통국이 말한 **장소·위치**가 제가 있었던 곳과 **다릅니다**. |
| `conflict_violation_action` | **제가 했는지·위반했는지**에 대해 교통국 말과 **다르게 이해**합니다. |
| `conflict_vehicle_driver` | **차량·운전자**가 누구인지에 대해 교통국 말과 **다릅니다**. |
| `conflict_other` | 위에 없는 **다른 차이**가 있습니다. *(→ R3 aux)* |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `axis` = time | place | action | attribution | other

---

### `case01_spatiotemporalFacet`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **D** — `factRelationship` ∈ {`date_place_wrong`, `cannot_compare_yet`} (v1.1 D06) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 그 날짜·장소·상황을 지금 어떤 방식으로 확인할 수 있나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `st_records` | **기록·자료**로 확인할 수 있고, **지금 바로 꺼낼 수 있거나** 곧 모을 수 있습니다. |
| `st_witness` | **증인·동행자**에게 확인할 수 있고, **이미 연락했거나** 아직 **연락하지 못했을 수** 있습니다. |
| `st_memory` | **기억**에만 의존하고, **대략적인 순서**는 말할 수 있거나 **날짜·순서**까지는 **어렵습니다**. |
| `st_no_path` | **지금은** 확인할 방법을 **모르겠습니다**. |
| `st_searched_empty` | **찾아봤지만** 당시를 확인할 자료가 **없었습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `verify_mode` = records | witness | memory | no_path | searched_empty | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| `st_has_records` · `st_has_records_pending` | `st_records` |
| `st_witness_only` · `st_witness_only_pending` | `st_witness` |
| `st_memory_only` · `st_memory_only_fuzzy` | `st_memory` |
| `st_cannot_verify` | `st_no_path` |
| `st_cannot_verify_tried` | `st_searched_empty` |
| 수집·연락·선명도 세부 | **DI** — §2.1 FIVE_CAP |

---

### `case01_compareRecordGap`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **J** — `factRelationship` = `cannot_compare_yet` |
| **질문 유형** | 목록형 · 복수 선택 |
| **질문 문장** | 통지·안내 내용과 **비교·대조**하려면, 지금 **특히 없거나 부족한 것**을 골라 주세요. **(여러 개 선택 가능)** |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `cmp_missing_notice` | 통지·안내 **사본** |
| `cmp_missing_calendar` | **일정·캘린더** 기록 |
| `cmp_missing_receipt` | **접수·제출** 증빙 |
| `cmp_missing_messages` | **연락·메시지** 기록 |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `gap_kind` (복수) = notice | calendar | receipt | messages | other

---

### `case01_languageAccessFact`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **K** — `factCompareGap` ∈ {`gap_hearsay_channel`, `gap_language_access`} **OR** `authorityDemand` = `demand_unclear` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 안내를 이해하거나 확인할 때 **언어·통역** 때문에 막힌 부분이 있나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `lang_none` | **언어·통역** 때문에 막힌 부분은 **없었습니다**. |
| `lang_partial_understanding` | **일부만** 이해했고, **다시 읽거나 들을 수 있는** 자료가 **있거나 없을 수** 있습니다. |
| `lang_need_interpreter` | **통역·공식 안내**가 필요합니다. |
| `lang_indirect_hearsay` | **제3자·대행·통역**을 통해서만 들었고, **공식 통지 원문**은 없습니다. |
| `lang_indirect_forwarded` | **제3자·대행**을 통해 들었지만, **전달받은 문서·메시지**는 있습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `lang` = ok | partial | interpreter | hearsay | forwarded | other

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| `lang_partial_no_source` | `lang_partial_understanding` 흡수 |

---

### `case01_unclearDemandFact`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **U** — `authorityDemand` = `demand_unclear` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 기관 요구에서 **가장 불명확한 부분**은 무엇인가요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `unclear_what_violation` | **무엇을 위반했다고 하는지**는 아직 **정확히 모르겠습니다**. |
| `unclear_what_action` | **지금 무엇을 해야 하는지**는 아직 **정확히 모르겠습니다**. |
| `unclear_deadline` | **언제까지** 해야 하는지는 아직 **정확히 모르겠습니다**. |
| `unclear_who_authority` | **어느 기관·담당**인지는 아직 **정확히 모르겠습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**fact_dimensions:** `unclear_axis` = violation | action | deadline | authority | other

---

### `case01_noticeDeliveryFact`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **L** — `customerResponded` = `no_contact_yet` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국 안내를 **처음 어떤 방식**으로 받았나요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `del_in_person` | **대면**으로 안내를 받았습니다. |
| `del_phone_message` | **전화·문자**로 안내를 받았습니다. |
| `del_written_only` | **문서·서면**으로 안내를 받았고, **요지를 일부만 이해했거나** **읽었습니다**. |
| `del_not_received_yet` | **아직** 통지·안내를 **받지 못했습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| `del_written_read` (부록 분할) | `del_written_only` 흡수 |
| L `del_third_party` | **삭제** — 간접 수신은 **K**만 (Brief v3) |

---

### `case01_procedureStageFact`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **Q** — `no_contact_yet` **AND** `noticeDelivery` ∈ {`del_phone_message`, `del_written_only`} |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 이 안내가 **처음 통지**에 가깝나요, **추가·재통지**에 가깝나요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `stage_first_notice` | **처음 받는** 안내에 가깝습니다. |
| `stage_followup_notice` | **이전에도** 안내를 받았고, **이번은 추가·재통지**에 가깝습니다. |
| `stage_unsure_first` | **처음인지 추가인지**는 **모르겠고**, 다른 안내를 **받은 기억이 없습니다**. |
| `stage_unsure_many` | **여러 번** 안내를 받았지만, **지금이 몇 번째 단계인지** 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case01_officeIdentityFact`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **O** — `no_contact_yet` **AND** `factRelationship` = `match` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 안내를 준 **기관·부서·담당**을 어떻게 확인하고 있나요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `office_named_clear` | **기관·부서 이름**을 알고 있고, **문서·안내에도 같이** 적혀 있습니다. |
| `office_name_only` | **이름만** 알고 있고, **담당·주소·번호**는 아직 확인하지 못했습니다. |
| `office_unknown` | **어느 기관**인지 **확인하지 못했습니다**. |
| `office_wrong_suspect` | **다른 기관** 안내일 **수도 있다**고 느낍니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case01_paymentInstructionFact`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **P** — `authorityDemand` ∈ {`payment`, `pay_core_traffic`, `pay_bundled`} |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 납부 안내의 **성격**은 무엇에 가깝나요? *(금액·방법은 CASE_02)* |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `pay_type_fine` | **벌금·과태료**를 내라는 쪽에 가깝게 이해합니다. |
| `pay_type_fee` | **수수료·비용**을 내라는 쪽에 가깝게 이해합니다. |
| `pay_type_mixed` | **여러 항목**이 섞여 있다고 이해합니다. |
| `pay_type_unclear` | **무슨 종류의 납부**인지는 아직 **모르겠습니다**. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case01_attendInstructionFact`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **M** — `authorityDemand` ∈ {`attend_explain`, `attendance`} |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 출석·소명 안내에서 **가장 분명한 내용**은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `att_date_place_stated` | **출석 날짜·시간·장소**가 **모두** 안내에 있습니다. |
| `att_date_place_partial` | **날짜·시간**은 있는데 **장소**는 아직 **모르겠습니다**. |
| `att_window_only` | **기간만** 있고 **구체 날짜·시간**은 없습니다. |
| `att_place_unknown` | **출석하라는 것**은 알겠는데 **장소**를 **모르겠습니다**. |
| `att_content_unclear` | **왜 출석·소명**해야 하는지 **요지**를 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case01_supplementInstructionFact`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **S** — `authorityDemand` ∈ {`supplement`, `supplement_core`} |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 보완·재제출 안내의 **핵심**은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `sup_missing_docs_list` | **빠진 서류 목록**이 있고, **무엇을 추가로 낼지** 대략 알겠습니다. |
| `sup_missing_docs_unclear` | **빠진 서류 목록**은 있지만 **제 경우에 맞는지** 모르겠습니다. |
| `sup_replace_docs` | **이미 낸 서류를 바꿔** 다시 내야 한다고 이해합니다. |
| `sup_content_add` | **내용을 더 적어** 넣거나 **추가 설명**이 필요하다고 이해합니다. |
| `sup_scope_unclear` | **무엇을 보완**해야 하는지 **전체가** 아직 모르겠습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case01_correctTargetFact`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **T** — `authorityDemand` = `correct_record` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 수정·확인하라고 한 **대상**은 무엇에 가깝나요? |

#### 선택지 (내용 4 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `tgt_identity_record` | **제 신원·등록 정보**를 고치라는 쪽에 가깝습니다. |
| `tgt_submission_content` | **제가 제출한 내용·서류**를 고치라는 쪽에 가깝습니다. |
| `tgt_vehicle_record` | **차량·운전 관련 기록**을 고치라는 쪽에 가깝습니다. |
| `tgt_other` | 위에 없는 **다른 대상**입니다. *(DI)* |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case01_authorityFollowUpKind`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **Ff** — `customerResponded` = `has_responded` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 대응 후 교통국에서 어떤 **회신·재요구**를 받았나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `completed` | **추가 요구 없이** 처리·검토가 **진행된다**고 들었습니다. |
| `more_required` | **추가 서류·자료**를 요청했고, **무엇인지** 대략 알겠거나 **아직 모르겠습니다**. |
| `re_attendance` | **다시 출석·설명**하라고 했습니다. |
| `no_clear_followup` | **아직 답변**이 없거나, **답변·연락**은 있었지만 **무슨 뜻인지** 모르겠습니다. |
| `payment_demand` | **납부·다른 조치**를 안내했습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

**DI로 커버하는 조합 (이유):**

| 조합 | 이유 |
|------|------|
| `more_required_vague` | `more_required` 흡수 |
| `no_reply_yet` · `reply_unclear` | `no_clear_followup` |
| 구 `case01_authorityResponse` | Ff로 **통합** (legacy 호환) |

---

### `case01_responseDetail`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **E** — `customerResponded` = `has_responded` |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 교통국에 **어떤 형태로** 대응했나요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `explained_situation` | **당시 상황**을 설명했습니다. |
| `submitted_materials` | **관련 서류나 자료**를 제출했습니다. |
| `disputed_facts` | **설명받은 내용**과 **실제 상황**이 다르다고 이야기했습니다. |
| `fulfilled_demand` | **안내받은 내용**을 처리했습니다. |
| `inquired_only` | **문의·연락**만 했고, **제출·출석·이행**까지는 하지 않았습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case01_evidence`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **G** — Phase2 (facet·E 이후) |
| **질문 유형** | 목록형 · 복수 선택 |
| **질문 문장** | 지금 이 교통·행정 안내와 관련해, 확인하거나 제출에 활용할 **수 있는 자료**를 골라 주세요. **(여러 개 선택 가능)** |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `notice` | 교통국 **통지·안내문** |
| `message` | **문자·메시지·이메일** |
| `submitted_docs` | **제출·접수·납부** 증빙 |
| `photo_video` | **사진·영상·기타** 자료 |
| `none` | **관련 자료 없음** *(단독 선택)* |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case01_blockage`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **H** — Phase2 · evidence 이전/이후 (체인 tail 직전) |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 지금 이 문제에서 **다음 대응**을 하기 **가장 어려운 이유**는 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `content_unclear` | 받은 안내를 **제 상황에 맞게 이해·정리**하기 어렵습니다. |
| `how_respond` | **어떻게 대응**해야 할지 **다음 조치**가 불분명합니다. |
| `next_step` | **이미 문의·제출**했는데 **다음에 무엇을** 해야 할지 모르겠습니다. |
| `facts_why` | **어떤 사실을 어떤 순서로** 설명·소명해야 할지 정리되지 않았습니다. |
| `evidence` | **어떤 자료**로 확인·제출해야 할지 막혀 있습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

### `case01_finalGoal`

| 항목 | 내용 |
|------|------|
| **노출 조건** | **tail** — Phase2 · blockage 답변 후 · Phase1 `confirmGoal` **동일 slug 제외** |
| **질문 유형** | 상황형 · 단일 선택 |
| **질문 문장** | 아직 덜 확인된 것 중, **이번 검토에서 우선**하고 싶은 것은 무엇인가요? |

#### 선택지 (내용 5 + DI)

| slug | 고객向 문안 (1인칭) |
|------|---------------------|
| `situation_fit` | 이 안내가 **제 상황에 해당하는지**, 안내와 **실제 상황**이 맞는지 확인하고 싶습니다. |
| `why_notice` | **왜 이런 안내**를 받았는지 확인하고 싶습니다. |
| `what_deadline` | **지금 무엇을·언제까지·어떻게** 해야 하는지 확인하고 싶습니다. |
| `followup` | **이미 한 대응의 결과**와 **다음 단계**를 확인하고 싶습니다. |
| `fact_difference` | **실제 상황**과 교통국 설명 **무엇이 다른지** 확인하고 싶습니다. |
| `other` | 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 |

---

## 옛 slug → 새 slug

| 구분 | 옛 slug | 새 slug | 비고 |
|------|---------|---------|------|
| deadline | `deadline_day_known` · `confirmed` | `date_known` | QG-03 |
| deadline | `uncertain` | `exists_unknown` | |
| deadline | `deadline_window_only` | `window_only` | |
| deadline | `no_stated` | `no_deadline_stated` | |
| customerResponded | `none` | `no_contact_yet` | |
| authorityDemand | `payment` | `pay_core_traffic` | legacy 읽기 호환 |
| authorityDemand | `supplement` | `supplement_core` | |
| authorityDemand | `attendance` | `attend_explain` | |
| authorityDemand | `pay_bundled` | `other` (DI) 또는 `pay_core_traffic` + DI | |
| spatiotemporal (D) | `st_has_records*` · `st_witness_only*` · `st_memory_only*` · `st_cannot_verify*` | `st_records` · `st_witness` · `st_memory` · `st_no_path` · `st_searched_empty` | v1.1 D06 |
| language (K) | `lang_partial_no_source` | `lang_partial_understanding` | |
| language (K) | `lang_indirect_hearsay_copy` | `lang_indirect_forwarded` | slug 정리 |
| notice (L) | `del_third_party` | — | **삭제** → K |
| notice (L) | `del_written` · `del_written_read` | `del_written_only` | |
| Ff | `more_required_vague` | `more_required` | |
| Ff | `no_reply_yet` · `reply_unclear` | `no_clear_followup` | |
| Ff | `case01_authorityResponse.*` | `case01_authorityFollowUpKind.*` | |
| factRelationship | legacy 9 slug | rewrite **5 slug** | Phase1 |
| violationContent | manifest legacy `traffic` 등 | rewrite **4 slug** 또는 **DI** | |
| **제외** | `case01_demandFulfillmentFact` | — | Brief v3 §5.1 미구현 |

---

*v1.2 FINAL — 문서 SoT · 코드 미반영*
