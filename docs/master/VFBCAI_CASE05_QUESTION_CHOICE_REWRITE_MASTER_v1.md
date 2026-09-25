# VFBCAI CASE_05 질문·선택지 재작성 마스터 v1

| 항목 | 내용 |
|------|------|
| **성격** | 1단계 전체 재작성안 — **문서 SoT** (2번창, 코드 미반영) |
| **범위** | CASE_05 Phase1·Phase2 전 질문 (주·세부·텍스트 보조) |
| **LOCK** | Ace 2026-09-25 — 고밀도 1인칭 · 빈틈은 **선택지**로 메움 · 중복 질문 **합침** · 모순 경로 제거 · 목록형 예외만 종류 질문 |
| **구현** | 별도 IMPLEMENTER Mission — slug·needs*·Layer J 동시 |
| **자동 검사** | 상황형 = `fact_dimensions` + `impossible_combinations` + `choice_facts` (1번창) · **선택 공간 커버리지** (D03 v2) |

**폐기·대체:** `VFBCAI_CASE05_PROFILE_LINK_FIX_BRIEF_v1.md` §7 v2/v3 선택지 문안은 **본 문서로 대체** (구조·합침은 본 문서 우선).

---

## 0. 구조 변경 (질문 수 축소)

| 변경 | 내용 |
|------|------|
| **합침** | `case05_authorityFollowUp` + `case05_dispositionOutcome` + `case05_repeatFollowUp` → **`case05_authorityTrajectory`** (단일 상황형) |
| **근거** | 「유지·변경·철회」 및 「후속 결과」「반복 대응」이 동일 사실 축을 세 번 묻음 (LOCK 원칙 4) |
| **노출** | `case05_customerResponse` ∈ {inquired, explanation_submitted, documents_submitted, appeal_requested, other_method} 일 때만 |
| **legacy** | 구 slug는 `case05NormalizeAuthorityTrajectory()` 단일 출구로 canonical 매핑 (IMPLEMENTER) |

| 변경 | 내용 |
|------|------|
| **축소** | `case05_deadline` 선택지 5+DI → **4+DI** (`uncertain`≈`period_stated`≈`unsure` 통합) |
| **축소** | `case05_confirmGoal` ↔ `case05_finalGoal` — Phase1 목표에 **진행 상태**를 담고, Phase2 `finalGoal`은 **미답 목표만** (F08 유지, 문안만 고밀도) |

---

## 1. Phase1

### 1.1 `case05_dispositionType` (상황형 · single)

**질문:** 지금 받은 처분·조치 통지를 기준으로, 제 상황에 가장 가까운 것은 무엇인가요?

| slug | 고객向 선택지 (1인칭 · 고밀도) |
|------|-------------------------------|
| `application_denied` | **신청·요청이 거부됐다**는 통지를 받았고, **통지서(또는 동일 내용 안내)** 는 가지고 있으며, **거부 사유 문구**는 읽었지만 제 사실과 맞는지는 아직 대조하지 못했습니다. |
| `rights_ended` | **허가·자격·등록·면허가 중단·취소·말소·실효**됐다는 통지를 받았고, **효력 발생·종료 시점**이 적혀 있으나 그 부분은 **일부만** 이해했습니다. |
| `business_suspended` | **일정 기간 특정 행동·활동이 제한**된다는 통지를 받았고, **제한 범위·기간**은 문구로 있으나 **실제로 무엇을 멈춰야 하는지**는 아직 정리하지 못했습니다. |
| `situation_mismatch` | **통지에 적힌 사실·날짜·사유**가 제가 아는 상황과 **다르게 느껴지고**, 그 차이를 **말로는 설명할 수 있으나** 서면으로 정리하지는 못했습니다. |
| `disposition_unclear` | **처분·조치라는 안내**는 받았지만 **무슨 종류의 조치인지**부터 구분하기 어렵고, **사유·효력** 문구도 아직 읽지 못했거나 이해하지 못했습니다. |
| `other_disposition` | (DI) 위에 없는 **다른 종류의 처분·조치** 안내를 받았습니다. |

**fact_dimensions**

| dimension | 가능 값 |
|-----------|---------|
| `disposition_kind` | denied \| rights_ended \| suspension \| fact_mismatch \| kind_unclear \| other |
| `notice_hold` | yes_partial \| yes_unread \| no \| unsure |
| `self_understanding` | reason_read_not_matched \| effect_partial \| scope_unclear \| kind_unknown \| mismatch_articulated |

**impossible_combinations (자동 검사)**

| 조합 | 근거 |
|------|------|
| `disposition_kind=kind_unclear` + `self_understanding=reason_read_not_matched` | 사유를 읽고 대조했다고 하면 kind_unclear와 모순 — 선택지 문안에 「사유 미독」 분리 |
| `disposition_kind=fact_mismatch` + `notice_hold=no` | 불일치를 느끼려면 통지·안내 원문이 있어야 함 |
| `disposition_kind=denied` + `disposition_kind=rights_ended` | 단일 선택 상호 배타 |

**choice_facts (요약)**

| slug | facts |
|------|-------|
| `application_denied` | disposition_kind=denied; notice_hold=yes_partial; self_understanding=reason_read_not_matched |
| `rights_ended` | disposition_kind=rights_ended; notice_hold=yes_partial; self_understanding=effect_partial |
| `business_suspended` | disposition_kind=suspension; notice_hold=yes_partial; self_understanding=scope_unclear |
| `situation_mismatch` | disposition_kind=fact_mismatch; notice_hold=yes_partial; self_understanding=mismatch_articulated |
| `disposition_unclear` | disposition_kind=kind_unclear; notice_hold=yes_unread\|unsure; self_understanding=kind_unknown |

---

### 1.2 `case05_confirmGoal` (상황형 · single)

**질문:** 이 처분 사건에서 **지금 가장 먼저** 확인·준비하려는 것은 무엇인가요? (이미 한 대응도 함께 골라 주세요)

| slug | 고객向 선택지 |
|------|----------------|
| `understand_reason` | **처분 사유**를 통지서와 대조해 이해하는 것이 우선이고, 아직 **기관에 소명·이의는 하지 않았거나** 답을 기다리는 중입니다. |
| `understand_impact` | **이 조치가 내 권리·활동에 주는 영향**을 먼저 정리하려 하고, **효력·제한 범위 문구**는 일부만 읽은 상태입니다. |
| `appeal_possibility` | **이의·재검토·행정심판 등 가능 여부와 기한**을 먼저 보려 하고, **신청은 안 했거나 준비 중**입니다. |
| `what_to_do` | **지금 당장 할 일(제출·납부·출석 등)** 순서를 정하려 하고, **통지서의 절차 안내**는 아직 끝까지 읽지 못했습니다. |
| `unsure` | **무엇부터 확인할지** 정하지 못했고, **통지·기한·대응 이력** 어느 것도 아직 정리하지 못했습니다. |
| (DI) | 직접 설명 |

**fact_dimensions:** `primary_goal` · `response_stage` (none \| waiting \| in_progress)

**impossible_combinations:** `primary_goal=unsure` + `response_stage=in_progress` with completed appeal — appeal 완료 고객은 `appeal_possibility` 또는 trajectory 질문으로 흡수; 본 선택지 문안에 「신청은 안 했거나 준비 중」으로 appeal과 구분

**choice_facts:** goal 축 + `customer_has_not_finalized_plan` boolean

---

### 1.3 `case05_customerResponse` (상황형 · single)

**질문:** 이 조치에 대해 **지금까지** 한 일과 **기관 반응**을 함께 골라 주세요.

| slug | 고객向 선택지 |
|------|----------------|
| `none` | **소명·서류·이의·재검토 요청을 하지 않았고**, 기관 **연락·답변도 없습니다**. |
| `inquired_no_answer` | **문의·확인만** 했고, **접수번호·서면 답변**은 아직 받지 못했습니다. |
| `inquired_answered` | **문의했고 답변**(전화·서면·방문 안내)은 받았지만, **소명·이의까지는 하지 않았습니다**. |
| `explanation_submitted` | **소명·의견을 제출**했고, **접수 확인**은 받았거나 아직 못 받은 상태입니다 (세부는 2차 `explanationDetail`). |
| `documents_submitted` | **서류·증빙을 제출**했고, **추가 요구 여부**는 아직 모르거나 대기 중입니다 (세부는 `submittedDocsDetail`). |
| `appeal_requested` | **이의·재검토·심판 등을 신청**했거나 신청 절차를 진행 중입니다 (세부는 `appealDetail`). |
| (DI) | 다른 방식으로 대응 |

**변경:** `inquired` → `inquired_no_answer` / `inquired_answered` 분리 (정보 밀도·trajectory 모순 방지)

**fact_dimensions:** `action_taken` · `authority_reply` · `formal_submission`

**impossible_combinations:** `action_taken=none` + `authority_reply=yes` — 없음 선택지에 「연락·답변 없음」 고정

**needs* 갱신:** `case05NeedsAuthorityFollowUpPhase2` → `inquired_answered` 포함, `inquired` 제거

---

### 1.4 `case05_deadline` (상황형 · single)

**질문:** 이 조치와 관련해 **대응 기한**을 지금 어디까지 확인했나요?

| slug | 고객向 선택지 |
|------|----------------|
| `specific_date` | **정확한 날짜(또는 마감일)** 를 통지·안내에서 확인했고, 아래 칸에 적을 수 있습니다. → `case05_deadlineDate` text |
| `window_only` | **「N일 이내」 등 기간만** 안내됐고 **달력 날짜**는 아직 계산·확인하지 못했습니다. |
| `exists_date_unknown` | **기한이 있다는 것만** 알고 **언제인지**는 못 찾았거나 여러 문구가 충돌합니다. |
| `not_checked` | **기한 문구를 아직 읽지 않았거나**, 통지에 기한이 있는지 **확인하지 못했습니다**. |
| (DI) | 직접 설명 |

**폐기 slug:** `uncertain`, `period_stated`, `unsure` → `window_only` / `exists_date_unknown` / `not_checked` 로 매핑

**fact_dimensions:** `deadline_certainty` (date \| window \| exists_unknown \| not_checked)

---

### 1.5 `case05_deadlineDate` (text · 조건부)

**질문:** 확인한 대응 기한은 언제인가요?  
**placeholder:** 기억나는 날짜·기한을 적어 주세요.

---

## 2. Phase2

### 2.1 `case05_factRelationship` (상황형)

**질문:** 처분 통지에 적힌 내용과 제가 아는 **실제 상황**을 비교하면 어떤가요?

| slug | 고객向 선택지 |
|------|----------------|
| `match` | 통지 **날짜·사실·사유**가 제 기억·자료와 **거의 같고**, 남은 차이는 **사소한 표현** 수준입니다. |
| `partial` | **일부는 맞지만** 날짜·장소·금액·사실 관계 등 **핵심이 하나 이상** 다릅니다. |
| `mismatch` | 통지 **사유·사실 관계 전체**가 제 상황과 **크게 다르고**, 그 차이를 **예로 들 수 있습니다**. |
| `hard_to_judge` | **그때 상황 기록·증빙**이 없어 통지와 **대조 자체가 어렵습니다**. |
| `unknown` | 통지 **문장 의미**를 이해하지 못해, 맞는지 **판단할 수 없습니다**. |
| (DI) | 직접 설명 |

**fact_dimensions:** `alignment` · `evidence_to_compare`

---

### 2.2 `case05_dispositionReason` (상황형)

**질문:** 통지·안내에 적힌 **처분 사유**를 제가 이해한 수준으로 골라 주세요.

| slug | 고객向 선택지 |
|------|----------------|
| `violation_claimed` | **특정 위반·규정 위반**이 사유로 적혀 있고, **해당 조항·행위**는 읽었지만 **제가 그 행위를 했는지**는 아직 대조하지 못했습니다. |
| `document_issue` | **제출 서류·신청 정보 오류·누락**이 사유로 적혀 있고, **어떤 서류**인지는 알지만 **보완 가능 여부**는 모릅니다. |
| `requirement_not_met` | **요건·자격·조건 미충족**이 사유로 적혀 있고, **어떤 요건**인지 문구는 있으나 **제 충족 여부**는 정리하지 못했습니다. |
| `deadline_procedure` | **기한·절차·제출 의무 위반**이 사유로 적혀 있고, **어느 기한**을 말하는지는 **부분만** 이해했습니다. |
| `no_clear_reason` | **사유란은 비어 있거나** 「규정에 따라」 등 **구체 사실 없이**만 적혀 있습니다. |
| `unsure` | **사유 문구를 읽었으나** 무엇을 말하는지 **해석하지 못했습니다**. |
| (DI) | 직접 설명 |

---

### 2.3 `case05_dispositionDetail` (상황형 · 조건부)

**질문:** 이 조치로 **실제 생기는 제한·변화**를 제가 이해한 수준으로 골라 주세요.

| slug | 고객向 선택지 |
|------|----------------|
| `wording_unclear` | **무엇이 금지·중단되는지** 문구가 모호하고, **일상 활동 중 어디까지 막히는지** 정리하지 못했습니다. |
| `scope_unclear` | **제한·조치 범위·기간**이 통지에 있으나 **숫자·날짜·지역**이 서로 맞지 않거나 이해가 안 됩니다. |
| `partially_understood` | **일부 영향(예: 특정 활동만)** 은 이해했지만 **전체 효력·연쇄 영향**은 확실하지 않습니다. |
| `unsure` | **영향 자체**를 아직 파악하지 못했고 **통지 핵심 문단**을 다시 읽지 못했습니다. |

---

### 2.4 `case05_factDetail` (상황형 · 조건부)

**노출 (QG-04):** `case05_factRelationship` ∈ **`partial` · `mismatch` 만**. `hard_to_judge` · `unknown` 이면 **본 질문 skip** (기억·해석 어려움은 relationship 한 곳에서만 수집).

**질문:** 통지와 다른 부분을 **사실·날짜·내용** 중심으로 골라 주세요.

| slug | 고객向 선택지 |
|------|----------------|
| `date_place_certain` | **날짜·장소·당시 상황**이 통지와 다르다고 **확신**하고, **반대 근거(일정·사진 등)** 가 있습니다. |
| `date_place_fuzzy` | **날짜·장소**가 다를 **가능성**은 있으나 **정확히 말하기 어렵습니다**. |
| `content_differs_clear` | **사유·사실 관계**가 다르고, **차이 목록**을 메모·자료로 정리해 두었습니다. |
| `content_differs_vague` | **내용이 다른 것 같지만** 무엇이 다른지 **아직 못 정했습니다**. |
| (DI) | 직접 설명 |

---

### 2.5 `case05_explanationDetail` (상황형 · 조건부)

**질문:** 제출한 **소명·의견**의 방식과 **접수 상태**를 골라 주세요.

(기존 6선택 유지 — 이미 접수·채널 복합. 문안만 「제가」 일관)

| slug | label (동일 구조, 1인칭 통일) |
|------|------------------------------|
| `written_no_receipt` | 서면으로 소명·의견을 **제출했고**, **접수 확인은 아직** 받지 못했습니다. |
| `written_receipt_ok` | 서면으로 제출했고 **접수·접수번호 안내**를 받았습니다. |
| `verbal_no_record` | 전화·방문으로만 설명했고 **메모·확인서는 없습니다**. |
| `verbal_with_record` | 전화·방문으로 설명했고 **내용을 메모**해 두었습니다. |
| `both_unverified` | 서면과 구두 **모두 했는데** 내용이 같은지 **맞춰 보지 못했습니다**. |
| `both_aligned` | 서면과 구두 **모두 했고** 말한 내용은 **같다고 생각합니다**. |

---

### 2.6 `case05_submittedDocsDetail` (목록형 · multi)

**질문:** 이번에 기관에 **제출한 서류 종류**를 골라 주세요. (여러 개 선택 가능)

| slug | chip |
|------|------|
| `identity` | 신분·인적 서류 |
| `financial` | 재무·금액 서류 |
| `certificate` | 증명서·확인서 |
| `application_form` | 신청서·양식 |
| `photo_evidence` | 사진·현장 자료 |
| `unsure` | 종류를 구분하기 어렵습니다 |
| (DI) | 기타 |

---

### 2.7 `case05_appealDetail` (상황형 · 조건부 · `customerResponse=appeal_requested`)

**질문:** **이의·재검토·심판** 신청 상태를 골라 주세요.

| slug | 고객 1인칭 원문 |
|------|-----------------|
| `filed_no_schedule` | 이의·재검토를 **신청했고**, 접수 안내는 받았지만 **결과 일정은 모릅니다**. |
| `filed_no_receipt` | 이의·재검토를 **신청했지만**, 접수 확인·접수번호는 **아직 받지 못했습니다**. |
| `filed_schedule_known` | 이의·재검토를 **신청했고**, 결과·다음 안내 **일정을 알고 있습니다**. |
| `preparing_deadline_unknown` | 신청을 **준비 중**이고, 신청 **기한은 아직 확인하지 못했습니다**. |
| `preparing_deadline_known` | 신청을 **준비 중**이고, 신청 **기한은 확인했습니다**. |
| `considering_rules_unread` | 신청 여부를 **검토 중**이고, 가능 여부·기한은 **아직 못 읽었습니다**. |
| `considering_rules_read` | 신청 여부를 **검토 중**이고, 통지서에 **기한·요건을 읽었습니다**. |
| (DI) | 직접 설명 |

**fact_dimensions:** `appeal_stage` (filed \| preparing \| considering) · `receipt` · `schedule_known` · `deadline_known`

**impossible_combinations:** `appeal_stage=filed` + `receipt=none` + `filed_schedule_known` slug — 접수 미확인이면 `filed_no_receipt` 또는 `filed_no_schedule`만

**choice_facts:** slug별 위 dimension 값 1:1

---

### 2.8 `case05_authorityTrajectory` (상황형 · **신규 합침**)

**질문:** 기관에 대응한 **이후** 받은 안내·결과·반복 요구를 **한 번에** 골라 주세요.

| slug | 고객向 선택지 |
|------|----------------|
| `maintained_once` | **처분 유지** 안내를 **한 번** 받았고, **추가 소명·자료 요구는 없었습니다**. |
| `maintained_repeated` | **처분 유지** 안내를 **여러 번** 받았거나 **같은 유지 안내가 반복**되었습니다. |
| `modified` | **처분 내용 변경** 안내를 받았고, **변경 전·후**를 통지·답변에서 확인했습니다. |
| `revoked` | **처분 철회·취소** 안내를 받았고, **효력 종료·복원** 관련 문구를 봤습니다. |
| `more_docs_open` | **추가 서류·증빙**을 요구받았고 **아직 제출하지 않았거나** 제출 후 **결과 대기** 중입니다. |
| `attend_explain` | **출석·추가 설명·면담**을 요구받았고 **일정은 잡혔거나** 조율 중입니다. |
| `review_ongoing` | **재검토·심사 중**이라는 안내만 있고 **유지·변경·종료** 결과는 아직 없습니다. |
| `review_repeat_notice` | **재검토가 계속된다**는 안내를 **반복** 받았고 **종료 시점**은 모릅니다. |
| `payment_demand` | **납부·과태료·벌금** 등을 요구받았고 **금액·기한**은 일부만 확인했습니다. |
| `additional_action` | **새 조치·추가 제재** 안내를 받았습니다 (유지·변경·철회와 별도). |
| `no_reply_yet` | 대응 후 **아직 답변·결과 안내가 없습니다**. |
| `reply_unclear` | **답변은 받았으나** 유지·변경·철회·요구 중 **무엇인지 정리하지 못했습니다**. |
| (DI) | 직접 설명 |

**legacy 매핑 (요약)**

| 구 필드 | 구 slug | → `authorityTrajectory` |
|---------|---------|---------------------------|
| authorityFollowUp | maintained | maintained_once |
| dispositionOutcome | maintained | maintained_once / maintained_repeated (repeatFollowUp로 구분) |
| repeatFollowUp | maintained_again | maintained_repeated |
| … | (전체 표 IMPLEMENTER 부록) | … |

**fact_dimensions:** `stance` (maintain\|modify\|revoke\|pending\|demand\|silent\|unclear) · `repeat_layer` (once\|repeated\|na) · `submission_loop` (docs\|attend\|review\|none)

**impossible_combinations:** `stance=revoked` + `repeat_layer=repeated` with maintained_again only — 철회 후 유지 반복 안내는 `reply_unclear` 또는 `additional_action`

**폐기 질문 id:** `case05_authorityFollowUp`, `case05_dispositionOutcome`, `case05_repeatFollowUp`

---

### 2.9 `case05_plannedNextStep` (상황형 · `customerResponse=none`)

**질문:** 아직 대응하지 않았다면, **지금 검토 중인 다음 일**은 무엇인가요?

| slug | 고객向 선택지 |
|------|----------------|
| `inquire_authority` | **기관에 문의**해 사유·절차를 확인할 계획이고 **질문 목록은 아직** 없습니다. |
| `prepare_explanation` | **소명·보완 서류**를 준비하려 하고 **필요 자료 목록**은 통지·인터넷에서 **일부만** 확인했습니다. |
| `appeal_or_review` | **이의·재검토** 가능 여부를 보고 **신청 시한**을 먼저 찾을 계획입니다. |
| `wait_for_deadline` | **기한을 먼저 확인**한 뒤 그때 조치할 계획이고 **기한은 아직** 못 찾았습니다. |
| `no_concrete_plan` | **구체 계획 없이** 통지만 보고 **막막한 상태**입니다. |
| `unsure` | **무엇부터 할지** 정하지 못했습니다. |
| (DI) | 직접 설명 |

---

### 2.10 `case05_blockage` (상황형)

**질문:** 지금 **가장 막힌 부분**과 **이미 시도한 것**을 함께 골라 주세요.

| slug | 고객向 선택지 |
|------|----------------|
| `why_disposition` | **왜 이런 조치인지** 모르겠고, 통지 **사유 문단**을 읽어도 이해가 안 됩니다. |
| `what_disposition` | **조치 종류·효력**이 무엇인지 모르겠고, **주변에 물어봤거나** 인터넷만 찾아봤습니다. |
| `fact_match` | **사실이 맞는지** 확인이 어렵고, **대조할 자료**를 아직 모으지 못했습니다. |
| `what_to_do` | **지금 할 일 순서**를 모르겠고, **기한·제출처**를 찾지 못했습니다. |
| `appeal_method` | **이의·재검토 방법**을 모르겠고, **신청서·양식**을 받지 못했습니다. |
| `deadline` | **대응 기한**을 모르겠고, Phase1에서도 **날짜를 못 적었습니다**. |
| `evidence` | **어떤 증빙이 필요한지** 모르겠고, **가진 자료**가 충분한지도 모릅니다. |
| `next_response` | **기관 다음 답변**을 기다리거나, **받은 답을 이해하지 못해** 막혀 있습니다. |
| `unsure` | **가장 막힌 것**을 한 가지로 말하기 어렵습니다. |
| (DI) | 직접 설명 |

**모순 제거:** `confirmGoal=understand_reason`만 막힘인 고객은 `why_disposition`에 **사유 문단 읽음** 포함 — `no_clear_reason` 답과 병행 시 blockage는 **해석** 쪽으로

---

### 2.11 `case05_evidence` (목록형 · multi)

**질문:** 처분·조치와 관련해 **지금 활용 가능한 자료**를 골라 주세요. (여러 개 선택 가능)

| slug | chip |
|------|------|
| `disposition_notice` | 처분 통지서 |
| `message_email` | 기관 문자·이메일 |
| `submitted_docs` | 제출한 서류 사본 |
| `payment_proof` | 납부·영수 증빙 |
| `photo_video` | 사진·영상 |
| `contract` | 계약·관계 서류 |
| `none` | 관련 자료 없음 |
| `unsure` | 있는지 아직 확인 못 함 |
| (DI) | 기타 |

---

### 2.12 `case05_finalGoal` (상황형 · tail)

**질문:** 아직 덜 확인된 것 중, **이번 검토에서 우선**하고 싶은 것은 무엇인가요?  
**옵션:** Phase1 `confirmGoal`과 **동일 slug 제외** (기존 `CASE05_CONFIRM_GOAL_TO_FINAL_GOAL_DUPE` 유지)

| slug | 고객向 선택지 (1인칭, 「해요」→「합니다」) |
|------|------------------------------------------|
| `why_disposition` | 처분 **사유**를 통지와 대조해 이해하고 싶습니다. |
| `what_disposition` | 처분 **내용·효력**이 정확히 무엇인지 알고 싶습니다. |
| `fact_match` | **실제 상황과 통지**가 맞는지 확인하고 싶습니다. |
| `what_to_do` | **지금 할 일** 순서를 알고 싶습니다. |
| `next_action` | **이의·소명·재검토** 다음 단계를 알고 싶습니다. |
| `evidence` | **필요 서류·증빙**을 확인하고 싶습니다. |
| `expert` | **VFBCAI 전문가팀**에 상황을 전달하고 싶습니다. |
| `unsure` | 우선순위를 정하기 어렵습니다. |
| (DI) | 직접 설명 |

---

## 3. 질문 노출 순서 (참고 · 코드 동형)

Phase1: dispositionType → confirmGoal → customerResponse → deadline → (deadlineDate)  
Phase2: factRelationship → dispositionReason → dispositionDetail → factDetail → explanationDetail → submittedDocsDetail → appealDetail → **authorityTrajectory** → plannedNextStep (none만) → blockage → evidence → finalGoal

---

## 3.1 전 CASE 공통 품질 게이트 (필수)

`VFBCAI_QUESTION_CHOICE_REWRITE_CROSS_CASE_QUALITY_GATES_v1.md` — 재작성안 제출 전 **QG-01~04** PASS.

| 게이트 | CASE_05 본 문서 반영 |
|--------|----------------------|
| QG-01 | **해소함** — §1.4 `uncertain`·`period_stated`·`unsure` 통합 |
| QG-02 | **해소함** — §1.3 `inquired` 분리 · §2.8 authority 3합1 |
| QG-03 | **해소함(문서)** — `specific_date`→`case05_deadlineDate` · IMPLEMENTER append `return` 정렬 **남음(코드)** |
| QG-04 | **해소함** — §2.4 `factDetail` partial/mismatch만 |

---

## 6. 옛 slug → 새 slug (CASE_05)

| 구분 | 옛 (field.slug) | 새 | 비고 |
|------|-----------------|-----|------|
| deadline | `uncertain` | `exists_date_unknown` | 원문 표시로 처리 가능 |
| deadline | `period_stated` | `window_only` | |
| deadline | `unsure` | `not_checked` | |
| customerResponse | `inquired` | `inquired_no_answer` 또는 `inquired_answered` | 답변 여부로 분기 |
| authority | `case05_authorityFollowUp.*` | `case05_authorityTrajectory.*` | 아래 세부 |
| authority | `maintained` | `maintained_once` | |
| authority | `modified` | `modified` | 동일 |
| authority | `revoked` | `revoked` | 동일 |
| authority | `more_docs` | `more_docs_open` | |
| authority | `attendance_explanation` | `attend_explain` | |
| authority | `under_review` | `review_ongoing` | |
| authority | `payment_demand` | `payment_demand` | 동일 |
| authority | `no_response` | `no_reply_yet` | |
| authority | `unsure` | `reply_unclear` | |
| outcome | `dispositionOutcome.maintained` | `maintained_once` / `maintained_repeated` | repeat 여부로 |
| outcome | `dispositionOutcome.additional_action` | `additional_action` | |
| outcome | `dispositionOutcome.more_docs_required` | `more_docs_open` | |
| outcome | `dispositionOutcome.no_result` | `no_reply_yet` | |
| repeat | `repeatFollowUp.maintained_again` | `maintained_repeated` | |
| repeat | `repeatFollowUp.more_explanation` | `more_docs_open` 또는 `attend_explain` | 원문 표시로 처리 |
| repeat | `repeatFollowUp.more_docs` | `more_docs_open` | |
| repeat | `repeatFollowUp.under_review_again` | `review_repeat_notice` | |
| repeat | `repeatFollowUp.not_applicable` | (질문 삭제) | trajectory 미노출 경로 |
| **삭제 질문** | `case05_dispositionOutcome` | — | §2.8 합침 |
| **삭제 질문** | `case05_repeatFollowUp` | — | §2.8 합침 |
| **삭제 질문** | `case05_authorityFollowUp` | — | §2.8 합침 |

---

## 4. 1번창 자동 검사 체크리스트 (CASE_05)

| 검사 | 입력 |
|------|------|
| 선택 공간 커버리지 | 각 상황형 질문의 `fact_dimensions` Cartesian vs choice `facts` — **미커버 셀 0** |
| 모순 경로 | Phase1 `none` → trajectory 금지 · `revoked` trajectory → `maintained_once` 단독 금지 (answers fixture) |
| slug parity | 본 문서 slug = `CASE05_*_OPTIONS` (IMPLEMENTER 후) |
| 합침 | 구 3질문 slug가 answers에 있으면 normalize → `authorityTrajectory` |

---

## 5. 변경 이력

| 일자 | 내용 |
|------|------|
| 2026-09-26 | v1 — CASE_05 전 질문 재작성 · authority 3합1 · deadline 축소 · customerResponse 분기 |
| 2026-09-26 | §3.1 — `VFBCAI_QUESTION_CHOICE_REWRITE_CROSS_CASE_QUALITY_GATES_v1.md` 연동 · QG-04 factDetail 노출 |

---

*2번창 — 문서만. 구현·push는 별도 지시.*
