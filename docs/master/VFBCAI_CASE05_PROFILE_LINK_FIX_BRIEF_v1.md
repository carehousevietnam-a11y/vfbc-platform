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

## 7. F12 점검 — CASE_03·04·05 (단답·신호 ≤1)

**기준:** 선택지가 **카테고리 라벨만**이거나, 결과·Profile에 **고유 판단 1개 이하** — 고객向 **완전 문장** + slug + 판단/행동 제안 필요. **코드 반영은 별도 지시 후.**

### 7.1 CASE_05

| 질문 id | slug | 현재 선택지 원문 | 담은 신호(현재) | 수정 문구 제안 (고객向) |
|---------|------|------------------|----------------|-------------------------|
| `case05_evidence` | `disposition_notice` | 처분 통지서 | 증거 종류 1개 | 처분 통지서 **원본**을 지금 확인하거나 준비할 수 있습니다. |
| | `message_email` | 기관 문자/이메일 | 동상 | 기관이 보낸 **문자·이메일 안내**를 확인할 수 있습니다. |
| | `submitted_docs` | 제출 서류 | 동상 | 이미 **제출한 서류**를 목록으로 정리해 둘 수 있습니다. |
| | `payment_proof` | 영수증/납부 증빙 | 동상 | **납부·영수 증빙**이 처분과 연결되는지 확인할 수 있습니다. |
| | `photo_video` | 사진/영상 | 동상 | **사진·영상**으로 당시 상황을 설명할 수 있습니다. |
| | `contract` | 계약서 | 동상 | **계약·관계 서류**와 처분 내용을 대조할 수 있습니다. |
| `case05_submittedDocsDetail` | `identity` | 신분·인적 관련 서류 | 저장만·Profile 약함 | **신분·인적 관련 서류**를 제출한 것으로 응답했습니다. |
| | `financial` | 재무·금액 관련 서류 | 동상 | **재무·금액 관련 서류**를 제출한 것으로 응답했습니다. |
| | `certificate` | 증명서·확인서 | 동상 | **증명서·확인서**를 제출한 것으로 응답했습니다. |
| `case05_explanationDetail` | `written` | 서면으로 소명·의견을 제출했습니다 | 저장만 | **서면**으로 소명·의견을 제출한 것으로 응답했습니다. *(문장 유지·결과 연결 §2.3)* |
| | `verbal` | 전화·방문 등으로 설명했습니다 | 동상 | **전화·방문 등 구두**로 설명한 것으로 응답했습니다. |
| | `both` | 서면과 구두 설명을 함께 했습니다 | 동상 | *(원문 유지)* |
| `case05_factDetail` | `date_place` | 날짜·장소·상황이 다릅니다 | 행동 1개만 | 처분 내용과 **날짜·장소·상황**이 다르다고 응답했습니다. |
| | `content_differs` | 내용·사실관계가 다릅니다 | 동상 | 처분 **내용·사실관계**가 다르다고 응답했습니다. |
| `case05_appealDetail` | `filed` | 이의제기·재검토를 신청했습니다 | 신호 1개 | **이의제기·재검토를 신청한** 것으로 응답했습니다. |
| | `preparing` | 신청을 준비하고 있습니다 | 없음 | **신청을 준비 중**인 것으로 응답했습니다. |
| | `considering` | 신청 여부를 검토하고 있습니다 | 없음 | **신청 여부를 검토 중**인 것으로 응답했습니다. |
| `case05_authorityFollowUp` | `maintained` | 처분이 그대로 유지된다고 안내받았습니다 | 다중 | *(원문 양호 — 판단 문장은 결과 패널 유지)* |
| `case05_repeatFollowUp` | `more_docs` | 추가 서류를 다시 요구받았습니다. | 반복 공통 | *(원문 양호)* |

### 7.2 CASE_04

| 질문 id | slug | 현재 선택지 원문 | 담은 신호 | 수정 문구 제안 |
|---------|------|------------------|-----------|----------------|
| `case04_addDocDetail` | `id_doc` | 신분·인적 관련 서류 | 저장·suffix | **신분·인적 관련 서류**를 추가로 제출해야 한다고 이해했습니다. |
| | `financial_doc` | 재무·금액 관련 서류 | 동상 | **재무·금액 관련 서류**를 추가로 제출해야 한다고 이해했습니다. |
| | `certificate` | 증명서·확인서 | 동상 | **증명서·확인서**를 추가로 제출해야 한다고 이해했습니다. |
| | `translation` | 번역·공증 관련 서류 | 동상 | **번역·공증 관련 서류**를 추가로 제출해야 한다고 이해했습니다. |
| `case04_modifyDetail` | `name_info` | 이름·인적사항 | 저장·suffix | **이름·인적사항**을 수정·보완해야 한다고 이해했습니다. |
| | `date_info` | 날짜·기간 | 동상 | **날짜·기간**을 수정·보완해야 한다고 이해했습니다. |
| | `amount_info` | 금액·수치 | 동상 | **금액·수치**를 수정·보완해야 한다고 이해했습니다. |
| | `content_info` | 내용·기재사항 | 동상 | **내용·기재사항**을 수정·보완해야 한다고 이해했습니다. |
| `case04_evidenceDetail` | `proof_doc` | 증빙 서류 | 저장 | **증빙 서류**를 더 제출해야 한다고 이해했습니다. |
| | `photo` | 사진·이미지 | 동상 | **사진·이미지**를 더 제출해야 한다고 이해했습니다. |
| | `statement` | 설명서·소명서 | 동상 | **설명서·소명서**를 더 제출해야 한다고 이해했습니다. |
| `case04_unclearFocus` | `what_submit` | 무엇을 제출해야 하는지 | 분기만 | **무엇을 제출해야 하는지**가 가장 이해하기 어렵습니다. |
| | `why_submit` | 왜 제출해야 하는지 | 동상 | **왜 제출해야 하는지**가 가장 이해하기 어렵습니다. |
| | `format` | 어떤 형식이어야 하는지 | 동상 | **어떤 형식으로 제출해야 하는지**가 가장 이해하기 어렵습니다. |
| `case04_repeatSupplement` | `more_docs` | 추가 서류를 다시 요구했습니다 | 반복 공통 | 기관이 **추가 서류**를 다시 요구한 것으로 응답했습니다. |
| | `more_modify` | 수정/보완을 다시 요구했습니다 | 동상 | 기관이 **수정·보완**을 다시 요구한 것으로 응답했습니다. |
| `case04_evidence` | `supplement_notice` | 보완 요구서·안내문 | 증거 1종 | **보완 요구서·안내문**을 확인할 수 있습니다. |
| | `message` | 기관 문자·메신저·전화 안내 내역 | 동상 | **기관 문자·메신저·전화 안내**를 확인할 수 있습니다. |

### 7.3 CASE_03

| 질문 id | slug | 현재 선택지 원문 | 담은 신호 | 수정 문구 제안 |
|---------|------|------------------|-----------|----------------|
| `case03_evidence` | `notice` | 출석·소명 요구 통지서·안내문 | 증거 1종 | **출석·소명 요구 통지서·안내문**을 확인할 수 있습니다. |
| | `attendance_notice` | 출석 일시·장소가 적힌 별도 안내 | 동상 | **출석 일시·장소 안내**를 확인할 수 있습니다. |
| | `message` | 기관 문자·메신저·전화 안내 내역 | 동상 | **기관 문자·메신저·전화 안내**를 확인할 수 있습니다. |
| | `submitted_docs` | 이미 제출한 서류·소명서 | 동상 | **이미 제출한 서류·소명서**를 정리해 둘 수 있습니다. |
| `case03_finalGoal` | `understand_demand` | 기관 요구를 이해하고 싶습니다 | 목표 1개 | *(원문 양호)* |
| | `expert` | 전문가 확인이 필요합니다 | 동상 | *(원문 양호)* |

**양호(본 표 제외):** CASE_03 `authorityDemand` · `customerResponse` · `explanationDetail` · `authorityFollowUp` · CASE_04 `customerResponse` · `authorityFollowUp` · `deadline` · CASE_05 `dispositionType` · `confirmGoal` · `customerResponse`(none·제출류) · `factRelationship` · `deadline`(문장형 label) — **F12 충족 또는 C05-04로 별도 처리**.

---

## 8. 완료 조건 (Brief)

- [x] Ace **v1 승인** (2026-09-25)
- [ ] 1번창 IMPLEMENTER — §2~5 구현 · §6 검증
- [ ] F12 §7 — **문구 승인 후** 별도 Mission(선택지 label 변경)

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-09-25 | v1 초안 — C05-01~04 연결 설계 + CASE_03/04/05 F12 목록 |
