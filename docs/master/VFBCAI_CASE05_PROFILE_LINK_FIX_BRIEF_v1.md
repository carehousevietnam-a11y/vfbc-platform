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

## 7. F12 §7 v3 — CASE_03·04·05 (39 slug · Ace 2026-09-25)

**v1·v2 §7 폐기.** v2는 **D03** 유발(제2 사실을 한 방향만 label에 고정 → 맞는 선택지 없음).

| 유형 | 문항 수 | slug 수 | 규칙 |
|------|---------|---------|------|
| **A 목록형** | 7 | **26** | **짧은 이름** · **복수 선택** · 밀도 = **질문 문장** (`EXPRESSION_MASTER` §3.1) |
| **B 상황형** | 5 | **13→22 choice** | **1인칭** · **1 choice = 1 fact** · 행동이 갈라지는 축은 **양쪽 선택지** · 행동 무관 사실 **label에 붙이지 않음** |

**코드 반영:** 별도 Mission — 목록형 multi-value · 상황형 slug 분할 · 질문 문장 7개 · signal/registry.

---

### A. 목록형 — 질문 문장 7개 (LOCK)

| # | 질문 id | 질문 문장 (고객向) |
|---|---------|-------------------|
| 1 | `case05_evidence` | 지금 **처분·조치**와 관련해, 확인하거나 제출에 활용할 **수 있는 자료**를 골라 주세요. **(여러 개 선택 가능)** |
| 2 | `case05_submittedDocsDetail` | 이번에 기관에 **제출한 서류 종류**를 골라 주세요. **(여러 개 선택 가능)** |
| 3 | `case04_addDocDetail` | 보완 안내에서 **추가로 제출해야 하는 서류 종류**를 골라 주세요. **(여러 개 선택 가능)** |
| 4 | `case04_modifyDetail` | 보완 안내에서 **수정·고쳐 써야 하는 항목**을 골라 주세요. **(여러 개 선택 가능)** |
| 5 | `case04_evidenceDetail` | 안내에서 **더 요구하는 증빙·자료 종류**를 골라 주세요. **(여러 개 선택 가능)** |
| 6 | `case04_evidence` | 지금 **보완 요구**와 관련해, 확인하거나 제출에 활용할 **수 있는 자료**를 골라 주세요. **(여러 개 선택 가능)** |
| 7 | `case03_evidence` | 지금 **출석·소명 요구**와 관련해, 확인하거나 제출에 활용할 **수 있는 자료**를 골라 주세요. **(여러 개 선택 가능)** |

**선택지 chip (slug · 짧은 이름)** — 기존 value **유지**, label만 짧게.

| 질문 id | slug | chip label |
|---------|------|------------|
| `case05_evidence` | `disposition_notice` | 처분 통지서 |
| | `message_email` | 기관 문자·이메일 |
| | `submitted_docs` | 제출한 서류 |
| | `payment_proof` | 납부·영수 증빙 |
| | `photo_video` | 사진·영상 |
| | `contract` | 계약·관계 서류 |
| `case05_submittedDocsDetail` | `identity` | 신분·인적 서류 |
| | `financial` | 재무·금액 서류 |
| | `certificate` | 증명서·확인서 |
| `case04_addDocDetail` | `id_doc` | 신분·인적 서류 |
| | `financial_doc` | 재무·금액 서류 |
| | `certificate` | 증명서·확인서 |
| | `translation` | 번역·공증 서류 |
| `case04_modifyDetail` | `name_info` | 이름·인적사항 |
| | `date_info` | 날짜·기간 |
| | `amount_info` | 금액·수치 |
| | `content_info` | 내용·기재사항 |
| `case04_evidenceDetail` | `proof_doc` | 증빙 서류 |
| | `photo` | 사진·이미지 |
| | `statement` | 설명서·소명서 |
| `case04_evidence` | `supplement_notice` | 보완 요구서·안내문 |
| | `message` | 문자·전화·메신저 안내 |
| `case03_evidence` | `notice` | 출석·소명 통지서 |
| | `attendance_notice` | 출석 일시·장소 안내 |
| | `message` | 문자·전화·메신저 안내 |
| | `submitted_docs` | 제출한 서류·소명서 |

각 목록형: `unsure`·`none`(해당 시)·**Direct Input** 기존 패턴 유지. 접수·기한·발급 방법 등은 **chip에 넣지 않음** — 상황형·결과·별도 축.

---

### B. 상황형 — 5문항 · 선택지 전체 (단일 선택)

#### B1 `case05_explanationDetail` (소명·의견 제출 경로)

| slug (v3) | 선택지 (1인칭) | 신호 | downstream |
|-----------|----------------|------|------------|
| `written_no_receipt` | **서면**으로 소명·의견을 제출했고, **접수 확인은 아직** 받지 못했습니다. | `channel_written` · `no_receipt` | **다음 행동:** 접수 확인 |
| `written_receipt_ok` | **서면**으로 소명·의견을 제출했고, **접수·접수번호** 안내를 받았습니다. | `channel_written` · `receipt_ok` | **판단:** 후속 일정 |
| `verbal_no_record` | **전화·방문**으로만 설명했고, **메모·확인서는 없습니다**. | `channel_verbal` · `no_record` | **위험:** 구두만 |
| `verbal_with_record` | **전화·방문**으로 설명했고, **내용을 메모**해 두었습니다. | `channel_verbal` · `has_memo` | **다음 행동:** 메모·기관 대조 |
| `both_unverified` | **서면과 구두** 모두 했는데, **내용이 같은지**는 아직 맞춰 보지 못했습니다. | `channel_both` · `consistency_unverified` | **다음 행동:** 대조 |
| `both_aligned` | **서면과 구두** 모두 했고, **말한 내용은 같다**고 생각합니다. | `channel_both` · `consistency_ok` | **판단:** 일관성 |

**coverage:** 서면/구두/병행 × 접수·기록 분기 — 제출 안 한 경로는 본 질문 **미노출**(needs).

#### B2 `case05_factDetail` (처분 vs 실제 차이)

| slug (v3) | 선택지 (1인칭) | 신호 | downstream |
|-----------|----------------|------|------------|
| `date_place_certain` | 처분에 적힌 **날짜·장소·상황**은 제가 기억하는 것과 **다르다고 확신**합니다. | `mismatch_when_where` · `certain` | **판단:** 쟁점·기한 |
| `date_place_fuzzy` | **날짜·장소·상황**이 다를 **수는 있지만**, 정확히 말하기 **어렵습니다**. | `mismatch_when_where` · `uncertain` | **다음 행동:** 증빙·정리 |
| `content_differs_clear` | 처분 **내용·사유**는 제 사실과 다르고, **차이는 정리**해 두었습니다. | `mismatch_substance` · `articulated` | **다음 행동:** 차이·증빙 |
| `content_differs_vague` | 처분 **내용·사유**가 다른 **것 같지만**, **무엇이 다른지**는 아직 못 정했습니다. | `mismatch_substance` · `vague` | **다음 행동:** 항목 나누기 |

**coverage:** 시점·장소 vs 내용 쟁점 × 확신도.

#### B3 `case05_appealDetail` (이의·재검토)

| slug (v3) | 선택지 (1인칭) | 신호 | downstream |
|-----------|----------------|------|------------|
| `filed_no_schedule` | **이의·재검토를 신청**했고, **접수 안내는** 받았지만 **결과 일정은 모릅니다**. | `appeal_filed` · `schedule_unknown` | **다음 행동:** 일정 문의 |
| `filed_schedule_known` | **이의·재검토를 신청**했고, **결과·다음 안내 일정**을 알고 있습니다. | `appeal_filed` · `schedule_known` | **판단:** 대기·준비 |
| `preparing_deadline_unknown` | **신청을 준비** 중이고, **신청 기한은 아직** 확인하지 못했습니다. | `appeal_prep` · `deadline_unknown` | **위험:** 기한 |
| `preparing_deadline_known` | **신청을 준비** 중이고, **신청 기한은 확인**했습니다. | `appeal_prep` · `deadline_known` | **다음 행동:** 서류·제출 |
| `considering_rules_unread` | **신청 여부를 검토** 중이고, **가능 여부·기한**은 아직 **못 읽었습니다**. | `appeal_undecided` · `rules_unread` | **다음 행동:** 통지서 확인 |
| `considering_rules_read` | **신청 여부를 검토** 중이고, 통지서에 **기한·요건을 읽었습니다**. | `appeal_undecided` · `rules_read` | **판단:** go/no-go |

**coverage:** 단계(신청/준비/검토) × 기한·일정 인지.

#### B4 `case04_unclearFocus` (가장 막힌 점 — 단일 선택)

| slug (v3) | 선택지 (1인칭) | 신호 | downstream |
|-----------|----------------|------|------------|
| `what_submit_list` | **무엇을 제출해야 하는지** 자체가 가장 막막합니다. | `block_what` | **판단:** 범위 |
| `what_submit_apply` | **무엇을 내야 하는지는 대략 보이지만**, **제 상황에 맞는지** 모르겠습니다. | `block_what` · `applicability` | **다음 행동:** 항목 대조 |
| `why_submit_reason` | **왜 보완이 필요한지**가 가장 이해하기 어렵습니다. | `block_why` | **판단:** 사유 |
| `why_submit_apply` | **사유는 읽었지만**, **제 경우에도 해당하는지** 모르겠습니다. | `block_why` · `applicability` | **다음 행동:** 사유·사실 대조 |
| `format_how` | **어떤 형식**으로 제출해야 하는지가 가장 어렵습니다. | `block_format` | **다음 행동:** 형식 확인 |
| `format_where` | **형식은 알겠는데**, **어디로(온라인·방문)** 제출해야 하는지 모르겠습니다. | `block_format` · `channel` | **다음 행동:** 제출 경로 |

**coverage:** what/why/format × 목록 자체 vs 적용·채널.

#### B5 `case04_repeatSupplement` (반복 보완)

| slug (v3) | 선택지 (1인칭) | 신호 | downstream |
|-----------|----------------|------|------------|
| `more_docs_new_kind` | **추가 서류**를 다시 요구했고, **처음과 다른 종류**라고 이해했습니다. | `repeat_docs` · `new_kind` | **위험:** 범위 확대 |
| `more_docs_same_kind` | **추가 서류**를 다시 요구했고, **비슷한 종류**를 또 요구한 것 같습니다. | `repeat_docs` · `same_kind` | **판단:** 누락·오류 |
| `more_modify_reject_prior` | **수정·보완**을 다시 요구했고, **이미 고친 부분**을 또 고치라고 들었습니다. | `repeat_modify` · `reject_prior` | **판단:** 재수정 |
| `more_modify_new_field` | **수정·보완**을 다시 요구했고, **처음과 다른 항목**을 고치라고 들었습니다. | `repeat_modify` · `new_field` | **다음 행동:** 항목 확인 |

**coverage:** 서류 vs 수정 × 동종 반복 vs 신규 항목.

**legacy slug 매핑 (IMPLEMENTER):** v2 `written`→`written_*` 등 **분기**; 읽기 전용 meta에 canonical v3 slug 저장.

---

**양호(본 Mission 외):** CASE_03 `finalGoal` · CASE_05 `authorityFollowUp` · 기타 문장형 Phase1/2 — F12 충족 또는 §2~5 C05 연결.

---

## 8. 완료 조건 (Brief)

- [x] Ace **v1 승인** (2026-09-25)
- [ ] 1번창 IMPLEMENTER — §2~5 구현 · §6 검증
- [ ] F12 **§7 v3** — Ace 승인 후 별도 Mission (목록 multi · 상황형 slug · 질문 7문장)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-09-25 | v1 초안 — C05-01~04 연결 설계 + CASE_03/04/05 F12 목록 |
| 2026-09-25 | **§7 v2** — 1인칭·다중신호 (v1 폐기) → **§7 v3** 목록형 26 + 상황형 22 choice (v2 D03 폐기) |
