# CASE_05 Profile·결과 연결 Brief v1

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **Brief** — Ace 승인 전 IMPLEMENTER(1번창) 착수 금지 |
| **Mission** | C05-01~04 **값 누락·뭉개짐** 수정 — **기존 질문만** Profile·결과에 연결 |
| **금지** | 신규 질문·신규 Phase2 축 · 비율 맞추기 질문 추가 |
| **선행** | `VFBCAI_CASE05_INFORMATION_COMPLETENESS_AUDIT_v1.md` · `VFBCAI_ADMIN_VERIFY_COMMON_RESULT_AUDIT_v1.md` C05-01~04 |
| **SoT 코드** | `adminVerifyProfiling.ts` · `AdminVerifyFirstResultPanel.tsx` (조사 시점: main `32ea12d` 이후 dirty tree에 **부분 suffix** 존재 — Brief는 **목표 동작** LOCK) |

**범위:** 문서만. C05-05(legacy deadline slug)·C05-06(원문 반복)은 본 Brief **참고만** — IMPLEMENTER 1차 착수는 C05-01~04.

---

## 0. Root cause (확정)

| ID | 문제 | 현재 |
|----|------|------|
| **C05-01** | `dispositionDetail` · `factDetail` · `explanationDetail` · `submittedDocsDetail` · `appealDetail` | 답변 키·경로 완료만. Profile은 **일부 축약 suffix**(`case05DispositionDetailProfileSuffix` 등) 또는 `customerAction` **꼬리 문자열**만. **2차 결과 신호·통합문·응답 요약**은 대부분 미연결 |
| **C05-02** | `disposition_unclear` vs `other` | Phase1 신호·통합 opening이 **동일 분기**(`isCase05DispositionTypeUnclear`만). `other`+note는 `authorityClaim`에 type 라벨만 |
| **C05-03** | `inquired` | Phase1 `actions` 1줄만. 통합 middle은 `describeCustomerResponseActive("기관 문의·확인")` — **소명·제출·이의**와 구분 없음 |
| **C05-04** | deadline `uncertain` · `period_stated` · `not_stated` · `unsure` | Phase1은 `period_stated`/`not_stated` **일부 분기**. 통합 closing은 **4값 동일 문장** |

---

## 1. IMPLEMENTER 공통 규칙

1. **Profile** — 고객이 고른 **선택지 label 원문**( `getCase05FieldOptionLabel` / DI note) 우선. 내부 요약 맵(`문구 불명확` 등)은 **제거·대체**.
2. **결과** — `appendCase05Phase1ResultSignals` · `appendCase05Phase2ResultSignals` · `buildCase05IntegratedSituation` · (있으면) Phase2 **응답 요약** 블록에 slug별 **판단 1문장** 이상.
3. **신호 코드** — 기존 `DispositionSignalCode` 재사용. slug마다 **다른** `unconfirmed`/`cautions`/`actions` 또는 통합문 **원문**.
4. **질문·needs·branch** — 변경 없음. **연결 로직·문장만**.

---

## 2. C05-01 — detail 5필드 연결 (필드별)

### 2.1 `case05_dispositionDetail`

| 항목 | 연결 |
|------|------|
| **Profile `authorityClaim`** | `dispositionType` 라벨 + ` — {dispositionDetail 원문}` (DI `other`는 note). **축약 4글자 맵 금지** |
| **Profile `event`** | 변경 없음 (type 유지) |
| **1차 결과** | 변경 최소 (type 주도) |
| **2차 결과** | 아래 slug별 **주의·미확인·행동** (기존 `wording_unclear`/`scope_unclear` 확장) |
| **통합문** | `disposition_unclear`/`other` 경로일 때 middle에 **영향·문구 이해** 한 줄 반영 |
| **응답 요약** | Phase2 요약에 `처분 이해 상세: {원문}` |

| slug | 판단·결과 문장 (2차 cautions / unconfirmed / actions 중 1+1) |
|------|----------------------------------------------------------------|
| `wording_unclear` | 미확인: 처분 문구·범위 · 행동: 통지서 제목·핵심 문구 재확인 *(기존 유지)* |
| `scope_unclear` | 미확인: 처분 영향 범위·기간 · 행동: 정지·제한 범위·기간 확인 *(기존 유지)* |
| `partially_understood` | 주의: 처분 영향을 일부만 이해한 상태 · 행동: 이해한 부분과 불명확한 부분을 통지서에 표시해 구분 |
| `unsure` | 미확인: 처분이 주는 실제 영향 · 행동: 통지서와 함께 영향 요약을 적어 두기 |

---

### 2.2 `case05_factDetail`

| 항목 | 연결 |
|------|------|
| **Profile `actualSituation`** | `factRelationship` 라벨 + ` — {factDetail 원문}` |
| **Profile `factRelationship`** | slug 유지 (변경 없음) |
| **2차 결과** | `partial`/`mismatch` 행동 분기 **유지** + 아래 slug 전용 |
| **통합문** | `partial`/`mismatch`/`hard_to_judge`일 때 closing 또는 middle에 **차이 유형** 한 줄 |
| **응답 요약** | `사실 대조 상세: {원문}` |

| slug | 판단·결과 문장 |
|------|----------------|
| `date_place` | 행동: 처분 내용과 당시 날짜·장소·상황 대조 *(기존)* |
| `content_differs` | 행동: 처분 사유와 실제 사실관계 차이 정리 *(기존)* |
| `hard_to_verify` | 미확인: 당시 상황 재구성 · 주의: 과거 사실 확인이 어려운 상태 — 증빙·기억 정리 필요 |
| `unsure` | 미확인: 처분 사유와 실제 상황의 차이 · 행동: 알고 있는 사실만 목록으로 적기 |

**신호:** `appendCase05DetailDispositionSignals`의 `hard_to_verify` → `FACT_UNVERIFIED` **유지**. `content_differs`+`partial` 승격 **유지**.

---

### 2.3 `case05_explanationDetail`

| 항목 | 연결 |
|------|------|
| **Profile `customerAction`** | `explanation_submitted` 라벨을 **대체하지 않고** 앞에 결합: `{explanationDetail 원문} ({customerResponse 라벨})` 또는 동등 한 문장 |
| **2차 결과** | `explanation_submitted`일 때만 slug별 주의·행동 |
| **통합문** | `customerResponse === explanation_submitted`이면 generic `설명·자료 제출` **대신** slug middle |
| **응답 요약** | `소명·의견 형태: {원문}` |

| slug | 판단·결과 문장 |
|------|----------------|
| `written` | 주의: 서면 소명·의견 제출 — 접수·기한 확인 필요 · 행동: 제출본·접수 확인 |
| `verbal` | 주의: 구두·방문 설명 — 기록·확인서 부재 시 재확인 필요 · 행동: 설명 요지 메모·기관 확인 |
| `both` | 주의: 서면·구두 병행 — 내용 일치 여부 확인 · 행동: 서면과 구두 설명 대조 |
| `unsure` | 미확인: 제출한 소명·의견의 형태 · 행동: 제출 경로·일자부터 정리 |

---

### 2.4 `case05_submittedDocsDetail`

| 항목 | 연결 |
|------|------|
| **Profile `customerAction`** | `documents_submitted` + ` — {submittedDocsDetail 원문}` (`doc_other`+note 포함) |
| **Profile `evidence`** | (선택) `case05_evidence`와 별개 — 요약에 **제출 유형** 한 줄만 (칸 덮어쓰기 금지) |
| **2차 결과** | `documents_submitted` 경로 slug별 **행동** |
| **통합문** | middle: 제출한 서류 **유형** 반영 |
| **응답 요약** | `제출 서류 유형: {원문}` |

| slug | 판단·결과 문장 |
|------|----------------|
| `identity` | 행동: 신분·인적 서류 제출 — 통지 요구 항목과 대조 |
| `financial` | 행동: 재무·금액 서류 제출 — 금액·기간 표기와 통지 대조 |
| `certificate` | 행동: 증명서·확인서 제출 — 발급 기관·유효기간 확인 |
| `doc_other` | 행동: 기타 제출 서류 목록·접수 여부 확인 |
| `unsure` | 미확인: 제출 서류 종류 · 행동: 제출한 파일·접수증부터 정리 |

---

### 2.5 `case05_appealDetail`

| 항목 | 연결 |
|------|------|
| **Profile `customerAction`** | `appeal_requested` + ` — {appealDetail 원문}` (꼬리만이 아닌 **주 문장**에 반영) |
| **2차 결과** | `appeal_requested` 공통 주의 **유지** + slug 분기 |
| **통합문** | middle: 이의·재검토 **진행 단계** |
| **응답 요약** | `이의·재검토 단계: {원문}` |

| slug | 판단·결과 문장 |
|------|----------------|
| `filed` | 주의: 이의·재검토 **신청 완료** — 접수·기한·번호 확인 · 행동: 신청 접수증·기한 |
| `preparing` | 주의: 신청 **준비 중** — 기한 초과 위험 · 행동: 신청 기한·서류 체크리스트 |
| `considering` | 미확인: 신청 여부·시기 · 행동: 이의 가능 기한·요건 통지서 확인 |
| `unsure` | 미확인: 이의·재검토 신청 상태 · 행동: 기관 안내·접수 여부 문의 |

**신호:** `filed` → `DISPOSITION_RESPONSE_UNCLEAR` (접수 미확인) **유지·문장만 강화**.

---

## 3. C05-02 — `disposition_unclear` vs `other` (slug별 문장)

**Phase1 `appendCase05Phase1ResultSignals`**

| slug | 미확인 | 주의 | 행동 | 통합 opening (추가·대체) |
|------|--------|------|------|-------------------------|
| `disposition_unclear` | 처분·조치 **내용** | — | 통지서 **제목·발신·주요 문구** 확인 | 「어떤 처분·조치인지부터 파악할 필요가 있는 상태」 |
| `other` (note 없음) | 직접 설명한 조치 **내용**(candidate) | — | 고객이 적은 조치 설명과 통지서 대조 | 「고객이 설명한 조치 내용을 통지서와 대조할 필요가 있는 상태」 |
| `other` (note 있음) | — | 통지와 직접 설명이 **일치하는지** 확인 필요 | note 원문을 통지서와 대조 | opening에 **note 1절 인용**(ellipsis 금지) |

**규칙:** `isCase05DispositionTypeUnclear(type)` 분기와 `type === "other"` **분리**. `unsure`(legacy type)는 `disposition_unclear`에 **병합하지 말고** audit C05-05와 함께 canonical만.

---

## 4. C05-03 — `case05_customerResponse` = `inquired`

| surface | 문장 (전용) |
|---------|-------------|
| **통합 middle** | 「기관에 문의하거나 상황을 확인한 상태이며, 아직 소명·자료 제출이나 이의·재검토 신청까지는 진행하지 않은 것으로 응답했습니다.」 |
| **주의** | (선택) 「문의만 진행 — 접수·답변 내용 확인이 필요함」 |
| **행동** | *(기존 유지)* 「기관 문의 내용과 답변·접수 여부를 확인해 보세요.」 |
| **vs `explanation_submitted`** | 주의 문장 **공유 금지** (`이미 대응 자료를 제출` 사용 금지) |

`authorityFollowUp`/`dispositionOutcome` 연결은 기존 needs **유지**.

---

## 5. C05-04 — deadline 4값 (slug별 문장)

**통합 closing (`buildCase05IntegratedSituation`) — `specific_date`+날짜 없음 분기 유지**

| slug | 통합 closing (원문) |
|------|---------------------|
| `uncertain` | 「처분 관련 대응 기한이 있다는 것은 알고 있으나, **정확한 날짜는 아직 확인하지 못한** 상태입니다.」 |
| `period_stated` | 「기한이 있다는 **안내는 받았으나**, 통지서에 적힌 **기간·일자를 아직 확인하지 못한** 상태입니다.」 |
| `not_stated` | 「처분 통지에 **기한이 적혀 있는지부터** 아직 확인하지 못한 상태입니다.」 |
| `unsure` | 「처분과 관련한 **대응 기한 전반**을 아직 확인하지 못한 상태입니다.」 |

**Phase1 신호 — `DISPOSITION_DEADLINE_UNCLEAR`**

| slug | unconfirmed | actions |
|------|-------------|---------|
| `uncertain` | 처분 관련 대응 기한(날짜) | 통지서에서 **날짜** 확인 |
| `period_stated` | 처분 관련 대응 기한(기간·일자) | 안내한 **기간·일자** 재확인 *(기존 행동 유지)* |
| `not_stated` | 처분 통지의 기한 표기 | 기한 **명시 여부** 확인 *(기존 유지)* |
| `unsure` | 처분 관련 대응 기한 | 기한이 **적혀 있는지** 확인 *(기존 `uncertain`과 동일 목록 문구 분리)* |

**주의:** `uncertain`/`period_stated`/`not_stated`/`unsure`를 **한 조건으로 묶는 closing 분기 제거**.

---

## 6. IMPLEMENTER 파일·함수 (최소)

| 파일 | 함수·위치 |
|------|-----------|
| `adminVerifyProfiling.ts` | `case05DispositionDetailProfileSuffix` · `case05FactDetailProfileSuffix` → **원문 label**; `buildCaseResolutionProfile` `customerAction` 합성; `appendCase05DetailDispositionSignals` (submittedDocs slug 신호는 **필요 시만**) |
| `AdminVerifyFirstResultPanel.tsx` | `appendCase05Phase1ResultSignals` (C05-02·03·04) · `appendCase05Phase2ResultSignals` (C05-01) · `buildCase05IntegratedSituation` |

**검증:** `npx tsc --noEmit` · CASE_05 경로 **Browser** — detail 5필드 각 1회 · `disposition_unclear`/`other` · `inquired` · deadline 4값 · 통합문·Profile 스크린샷.

---

## 7. F12 점검 v2 — CASE_03·04·05 (단답 39건)

**v1 §7 표(꼬리 붙이기·3인칭 응답형) 폐기.** 본 절만 SoT.

**재작성 기준 (LOCK)**

1. **1인칭 사실** (`~했습니다` · `~가 있습니다` · `~인지 모르겠습니다`). 결과 화면용 「~라고 응답했습니다」 **금지**.
2. **카테고리 + 신호 ≥2** — 보유(원본/사본/없음) · 기관 명시 여부 · 기한 인지 · 불확실성 · 이미 한 행동 중 **해당 질문에 가장 영향 큰** 축.
3. **선택지 개수 고정** (39 slug 유지). slug 분할·합침 없음.
4. 표 열 **담은 신호(v2)** = 내부 신호 id(footnote용 약어). **downstream** = 판단 · 다음 행동 · 위험도 중 **무엇이 갈라지는지** 한 줄.

**코드 반영:** Ace §7 v2 승인 후 **별도 Mission** (OPTIONS label 교체 + Layer J·result signal diff).

**단답형 개수:** CASE_05 **17** · CASE_04 **18** · CASE_03 **4** · 합계 **39**.

| CASE | 질문 id | slug | 현재 선택지 원문 | 담은 신호(현재) | 수정 문구 제안 v2 (1인칭) | 담은 신호(v2) | downstream |
|------|---------|------|------------------|-----------------|---------------------------|---------------|--------------|
| 05 | `case05_evidence` | `disposition_notice` | 처분 통지서 | 증거 종류 1개 | 처분 통지서 **원본**을 갖고 있고, 처분 사유와 대응 기한이 적혀 있습니다. | `hold_original` · `authority_stated_reason_deadline` | **다음 행동:** 통지서·기한·사유 대조 |
| 05 | | `message_email` | 기관 문자/이메일 | 동상 | 기관에서 온 **문자·이메일**을 저장해 두었지만, 공식 통지와 같은 내용인지는 확실하지 않습니다. | `hold_informal_copy` · `uncertain_official_match` | **위험:** 비공식 안내·오해 |
| 05 | | `submitted_docs` | 제출 서류 | 동상 | **이미 제출한 서류**는 정리해 두었지만, 기관 **접수·열람** 여부는 아직 확인하지 못했습니다. | `action_submitted` · `receipt_unknown` | **다음 행동:** 접수·목록 확인 |
| 05 | | `payment_proof` | 영수증/납부 증빙 | 동상 | **납부·영수 증빙**은 있지만, 그 금액이 **이번 처분**과 직접 연결되는지는 모르겠습니다. | `hold_payment_proof` · `link_to_disposition_uncertain` | **판단:** 처분·납부 연결 |
| 05 | | `photo_video` | 사진/영상 | 동상 | **사진·영상**을 갖고 있지만, 처분에 적힌 **사건·시점**과 같은 때·장소인지는 확실하지 않습니다. | `hold_media` · `match_to_notice_uncertain` | **다음 행동:** 시점·장소 대조 |
| 05 | | `contract` | 계약서 | 동상 | **계약·관계 서류**를 갖고 있고, 처분 사유가 그와 관련된다고는 이해했지만 **아직 대조하지 못했습니다**. | `hold_contract` · `relation_claimed_not_verified` | **다음 행동:** 사유·계약 대조 |
| 05 | `case05_submittedDocsDetail` | `identity` | 신분·인적 관련 서류 | 저장만 | **신분·인적 서류**를 제출했고, 통지에 적힌 **요구 항목명**은 확인했습니다. | `submitted_id` · `authority_named_items` | **판단:** 요구·제출 일치 |
| 05 | | `financial` | 재무·금액 관련 서류 | 동상 | **재무·금액 서류**를 제출했는데, 금액·기간이 **통지 내용과 맞는지**는 아직 확인하지 못했습니다. | `submitted_financial` · `amount_period_unverified` | **다음 행동:** 금액·기간 대조 |
| 05 | | `certificate` | 증명서·확인서 | 동상 | **증명서·확인서**를 제출했고, **발급일·유효기간**은 봤지만 기관이 받아들였는지는 모르겠습니다. | `submitted_cert` · `validity_checked` · `acceptance_unknown` | **다음 행동:** 유효기간·접수 |
| 05 | `case05_explanationDetail` | `written` | 서면으로 소명·의견을 제출했습니다 | 저장만 | **서면**으로 소명·의견을 제출했고, **제출일**은 기억하지만 **접수 확인**은 받지 못했습니다. | `channel_written` · `submitted` · `no_receipt` | **다음 행동:** 접수·기한 |
| 05 | | `verbal` | 전화·방문 등으로 설명했습니다 | 동상 | **전화·방문**으로 설명했지만, 그때 말한 내용을 **적어 둔 메모나 확인서**는 없습니다. | `channel_verbal` · `no_written_record` | **위험:** 구두만·재확인 필요 |
| 05 | | `both` | 서면과 구두 설명을 함께 했습니다 | 동상 | **서면과 구두**로 모두 설명했는데, 두 경로에서 말한 내용이 **같은지**는 아직 맞춰 보지 못했습니다. | `channel_both` · `consistency_unverified` | **다음 행동:** 서면·구두 대조 |
| 05 | `case05_factDetail` | `date_place` | 날짜·장소·상황이 다릅니다 | 행동 1개 | 처분에 적힌 **날짜·장소·상황**은 제가 기억하는 그때와 **다르다고 확신**합니다. | `mismatch_datetime_place` · `customer_certain` | **판단:** 사실관계 쟁점·기한 |
| 05 | | `content_differs` | 내용·사실관계가 다릅니다 | 동상 | 처분 **사유·내용**은 제가 아는 사실과 다르고, **차이가 무엇인지**는 정리해 두었습니다. | `mismatch_substance` · `diff_articulated` | **다음 행동:** 차이 목록·증빙 |
| 05 | `case05_appealDetail` | `filed` | 이의제기·재검토를 신청했습니다 | 신호 1개 | **이의·재검토를 신청**했고, **접수·번호** 안내는 받았지만 **결과 일정**은 모르겠습니다. | `appeal_filed` · `receipt_ok` · `outcome_schedule_unknown` | **다음 행동:** 일정·기한 |
| 05 | | `preparing` | 신청을 준비하고 있습니다 | 없음 | **이의제기를 준비**하고 있지만, **신청 기한**이 언제까지인지는 아직 확인하지 못했습니다. | `appeal_in_prep` · `deadline_unknown` | **위험:** 기한 초과 |
| 05 | | `considering` | 신청 여부를 검토하고 있습니다 | 없음 | **신청 여부를 검토** 중이고, 통지서에 **가능 여부·기한**을 읽었는지는 확실하지 않습니다. | `appeal_undecided` · `rules_read_uncertain` | **다음 행동:** 이의 요건·기한 확인 |
| 04 | `case04_addDocDetail` | `id_doc` | 신분·인적 관련 서류 | 저장·suffix | 보완 안내에 **신분·인적 서류**가 적혀 있고, **무엇을 새로 발급**받아야 하는지도 알고 있습니다. | `demand_id_doc` · `issuance_known` | **다음 행동:** 발급·제출 |
| 04 | | `financial_doc` | 재무·금액 관련 서류 | 동상 | **재무·금액 서류**를 더 내야 한다고 이해했지만, **어느 연도·항목**인지는 아직 특정하지 못했습니다. | `demand_financial` · `scope_unspecified` | **판단:** 보완 범위 |
| 04 | | `certificate` | 증명서·확인서 | 동상 | **증명서·확인서**를 추가로 요구하는 것으로 이해했고, **어디서 발급**받는지는 알고 있습니다. | `demand_cert` · `issuance_channel_known` | **다음 행동:** 발급·첨부 |
| 04 | | `translation` | 번역·공증 관련 서류 | 동상 | **번역·공증**이 필요하다고 안내에 나와 있지만, **공증까지 마쳤는지**는 아직입니다. | `demand_translation` · `notarization_incomplete` | **다음 행동:** 공증·번역 완료 |
| 04 | `case04_modifyDetail` | `name_info` | 이름·인적사항 | 저장·suffix | **이름·인적사항**을 고쳐서 다시 내야 한다고 이해했고, **잘못된 항목**이 무엇인지도 확인했습니다. | `modify_identity` · `error_field_known` | **다음 행동:** 수정본 작성 |
| 04 | | `date_info` | 날짜·기간 | 동상 | **날짜·기간**을 수정해야 한다고 이해했지만, **올바른 날짜**가 무엇인지는 아직 확정하지 못했습니다. | `modify_dates` · `correct_value_unknown` | **판단:** 기한·사실 |
| 04 | | `amount_info` | 금액·수치 | 동상 | **금액·수치**를 고쳐야 한다고 이해했고, 안내 **금액과 제 서류 금액이 다릅니다**. | `modify_amount` · `amount_mismatch_seen` | **다음 행동:** 금액 대조·수정 |
| 04 | | `content_info` | 내용·기재사항 | 동상 | **내용·기재**를 바꿔야 한다고 이해했지만, **어떤 문장을 어떻게** 바꿀지는 아직 정리하지 못했습니다. | `modify_content` · `edit_plan_unknown` | **다음 행동:** 수정안 작성 |
| 04 | `case04_evidenceDetail` | `proof_doc` | 증빙 서류 | 저장 | **추가 증빙**이 필요하다고 이해했고, 비슷한 서류는 있지만 **안내 명칭과 같은지**는 모르겠습니다. | `need_proof` · `hold_similar` · `name_match_uncertain` | **판단:** 증빙 적합 |
| 04 | | `photo` | 사진·이미지 | 동상 | **사진·이미지**를 더 내야 한다고 이해했고, **당시 사진은 있지만** 제출 **형식·매수**는 모르겠습니다. | `need_photo` · `hold_photo` · `format_unknown` | **다음 행동:** 형식·제출 경로 |
| 04 | | `statement` | 설명서·소명서 | 동상 | **설명서·소명서**를 더 써야 한다고 이해했지만, **어떤 항목을 써야 하는지**는 아직 못 정했습니다. | `need_statement` · `outline_unknown` | **다음 행동:** 항목·초안 |
| 04 | `case04_unclearFocus` | `what_submit` | 무엇을 제출해야 하는지 | 분기만 | **무엇을 제출해야 하는지**가 가장 막막하고, 목록은 있지만 **제 상황에 해당하는지**는 모르겠습니다. | `block_what` · `list_not_mapped_to_self` | **판단:** 보완 범위 |
| 04 | | `why_submit` | 왜 제출해야 하는지 | 동상 | **왜 보완이 필요한지**가 가장 어렵고, 사유 문구를 읽었지만 **제 경우에 맞는지**는 확실하지 않습니다. | `block_why` · `reason_applicability_uncertain` | **판단:** 사유·요건 |
| 04 | | `format` | 어떤 형식이어야 하는지 | 동상 | **형식·제출 방법**이 가장 어렵고, **온라인·방문** 중 어디로 내야 하는지도 모르겠습니다. | `block_format` · `channel_unknown` | **다음 행동:** 제출 채널 확인 |
| 04 | `case04_repeatSupplement` | `more_docs` | 추가 서류를 다시 요구했습니다 | 반복 공통 | 기관이 **추가 서류를 다시** 요구했고, **처음과 다른 종류**라고 이해했습니다. | `repeat_docs` · `diff_from_first_round` | **위험:** 반복 보완·기한 |
| 04 | | `more_modify` | 수정/보완을 다시 요구했습니다 | 동상 | **수정·보완을 다시** 요구했고, **이미 한 번 고쳐 냈는데도** 같은 부분이라고 들었습니다. | `repeat_modify` · `prior_fix_rejected` | **판단:** 재수정 범위 |
| 04 | `case04_evidence` | `supplement_notice` | 보완 요구서·안내문 | 증거 1종 | **보완 요구서·안내문 원본**을 갖고 있고, **제출 기한**이 적혀 있습니다. | `hold_notice` · `deadline_on_doc` | **다음 행동:** 기한·항목 대조 |
| 04 | | `message` | 기관 문자·메신저·전화 안내 내역 | 동상 | **문자·전화 안내**는 있지만, **요구서 원본**과 내용이 같은지는 확인하지 못했습니다. | `hold_message` · `parity_with_notice_unverified` | **위험:** 안내 불일치 |
| 03 | `case03_evidence` | `notice` | 출석·소명 요구 통지서·안내문 | 증거 1종 | **출석·소명 요구 통지서**를 갖고 있고, **출석·제출 기한**이 적혀 있습니다. | `hold_notice` · `deadline_on_doc` | **다음 행동:** 기한·장소 |
| 03 | | `attendance_notice` | 출석 일시·장소가 적힌 별도 안내 | 동상 | **출석 일시·장소 안내**를 따로 받았고, **통지서와 날짜가 같은지**는 맞춰 보지 못했습니다. | `hold_schedule_notice` · `cross_doc_unverified` | **다음 행동:** 일시·장소 대조 |
| 03 | | `message` | 기관 문자·메신저·전화 안내 내역 | 동상 | **문자·전화 안내**는 저장해 두었지만, **공식 통지와 같은 요구**인지는 확실하지 않습니다. | `hold_informal` · `uncertain_official` | **위험:** 비공식·오해 |
| 03 | | `submitted_docs` | 이미 제출한 서류·소명서 | 동상 | **이미 제출한 서류·소명서**는 있지만, 기관이 **받고 검토 중인지**는 모르겠습니다. | `action_submitted` · `review_status_unknown` | **다음 행동:** 접수·검토 확인 |

**양호(39건 외):** CASE_03 `finalGoal` · CASE_05 `authorityFollowUp`·`repeatFollowUp`(more_docs) · 기타 CASE_03/04/05 주요 Phase1·Phase2 문장형 선택지 — F12 충족 또는 C05-04 별도.

---

## 8. 완료 조건 (Brief)

- [x] Ace **v1 승인** (2026-09-25)
- [ ] 1번창 IMPLEMENTER — §2~5 구현 · §6 검증
- [ ] F12 **§7 v2** — Ace 승인 후 별도 Mission(OPTIONS label · signal diff)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-09-25 | v1 초안 — C05-01~04 연결 설계 + CASE_03/04/05 F12 목록 |
| 2026-09-25 | **§7 v2** — 1인칭·다중신호 수정 문구 39건 (v1 §7 폐기) |
