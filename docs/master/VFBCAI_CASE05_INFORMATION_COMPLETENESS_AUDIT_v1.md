# CASE_05 Information Completeness Audit (파일럿)

| 항목 | 내용 |
|------|------|
| **범위** | 감사만. 코드·문구·선택지·구조 미변경. 기존 PASS/QA 미재실행 |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (커밋 fa4cce9). 재해석 없음 |
| **증거** | LEVEL 1. `adminVerifyProfiling.ts` 질문·needs·프로파일·신호, `AdminVerifyFirstResultPanel.tsx` 결과 문장 |
| **전제 교정** | 요청의 Phase1 6 / Phase2 6은 현재 코드와 다르다. 아래 0절 |

조사일: 2026-09-25.

업로드 증거 게이트(Phase1 제출 전, Phase2 질문 완료 후 첨부)는 선택지에 따라 갈리지 않는다. 표의 「증거 요구」는 `case05_evidence` 질문을 여는지, `none`/`unsure`가 미확인 신호를 만드는지이다.

프로파일에 실제로 들어가는 CASE_05 칸은 다음뿐이다.

`event`·`authorityClaim` ← `dispositionType` (같은 라벨), `goal` ← `confirmGoal` 또는 `finalGoal`, `customerAction` ← `customerResponse`, `deadline`, `actualSituation`·`factRelationship`, `authorityReason` ← `dispositionReason`, `authorityResponse` ← `dispositionOutcome`이 있으면 그것, 없으면 `authorityFollowUp`, `currentBlockage`, `evidence`, 라운드, 재분류.

`dispositionDetail` · `factDetail` · `explanationDetail` · `submittedDocsDetail` · `appealDetail`은 답변 키로만 남고 프로파일 칸을 덮어쓰지 않는다.

---

## 0. 질문 수

MASTER 1차 6문항은 조치, 사유, 사실 비교, 고객 대응, 확인 목표, 기한이다.

코드 Phase1 (`CASE05_PHASE1_FIELD_ORDER`, `appendCase05Phase1Questions`)은 4개다.

1. `case05_dispositionType`
2. `case05_confirmGoal`
3. `case05_customerResponse`
4. `case05_deadline` — 조건부 아님. Phase1이면 항상 묻는다.

사유와 사실 비교는 Phase2로 가 있다. 사유는 조건부, 사실 비교는 현재 선택지에서는 항상 나온다.

Phase2는 고정 6개가 아니다. `appendCase05Phase2Questions` 후보는 13개이고, 경로마다 일부만 나온다.

`factRelationship` → `dispositionReason` → `dispositionDetail` → `factDetail` / `explanationDetail` / `submittedDocsDetail` / `appealDetail` → `authorityFollowUp` → `dispositionOutcome` → `repeatFollowUp` → `blockage` → `evidence` → `finalGoal`

아래 표는 코드가 낼 수 있는 질문 전부다.

---

## 1. Phase1

### 1.1 `case05_dispositionType`

프로파일: `event`, `authorityClaim`.

| 선택지 | Profile 변화 | 다음 질문 영향 | 증거 요구 변화 | 결과 문장 변화 |
|---|---|---|---|---|
| `application_denied` | 거부 라벨 | 사실비교 열림. 사유는 목표가 `understand_reason`일 때만. `dispositionDetail`은 항상 | 이 값만으로는 `case05_evidence`를 열지 않음 | 행동: 거부 내용과 사유 확인 |
| `rights_ended` | 중단·취소·말소 라벨. 옛 `license_revoked`·`registration_cancelled`도 이 값 | 사실비교 열림. 사유는 목표 조건. `dispositionDetail` 안 열림 | 이 값만으로는 증거 질문 없음 | 주의: 권리 중단·취소. 행동: 취소·말소 확인 |
| `business_suspended` | 활동 제한 라벨 | `rights_ended`와 같은 갈래 | 이 값만으로는 증거 질문 없음 | 주의: 활동 제한. 행동: 정지 범위·기간 |
| `situation_mismatch` | 불일치 라벨 | 사실비교 열림. 사유는 목표 조건. `repeatFollowUp`은 대응 여부와 무관하게 열림. 그 반복 조건 때문에 `case05_evidence`도 열림 | 증거 질문이 열림 | 주의: 통지와 상황이 다르게 느껴짐. 통합문 첫 문장도 영향 확인으로 바뀜. 행동: 대조 |
| `disposition_unclear` | 불명확 라벨 | 사실비교·사유·`dispositionDetail`·`blockage`·증거 질문이 열림. `finalGoal`은 이 slug만으로 안 열림 (`unclear` 옛 값만 연다) | 증거 질문이 열림 | 미확인: 처분·조치 내용. 행동: 제목·발신·문구 |
| `other` | note가 있으면 그 문장·confirmed. 없으면 DI 라벨·candidate | 사실비교·`dispositionDetail`·`blockage`·증거 질문. 사유는 목표가 `understand_reason`일 때만 | 증거 질문이 열림 | `disposition_unclear`와 같은 미확인·행동 문장 |

현재 내용 선택지 다섯 개는 모두 사실비교를 연다. 조치 종류가 사실비교 여부를 가르지 않는다. 갈라지는 것은 상세 질문, 반복 질문, 증거 질문, 결과 문장이다. `disposition_unclear`와 `other`의 결과 문장은 같다.

### 1.2 `case05_confirmGoal`

프로파일: `goal`. 나중에 `finalGoal`이 있으면 그 라벨이 이긴다.

Phase1 진행 게이트는 값만 본다 (`if (!answers.case05_confirmGoal)`). 완료 게이트는 `isAdminVerifyChoiceFieldComplete`라 `other`는 note 없이 Phase1 완료가 되지 않는다. `other`만 골라도 다음 Phase1 질문은 나온다.

| 선택지 | Profile 변화 | 다음 질문 영향 | 증거 요구 변화 | 결과 문장 변화 |
|---|---|---|---|---|
| `understand_reason` | 사유 확인 라벨 | `dispositionReason`이 열린다. 조치가 이미 불명확이면 목표와 무관하게 열린다 | 없음 | 행동: 사유가 적힌 부분. 통합문: 사유를 먼저 이해 |
| `understand_impact` | 영향 확인 라벨 | 사유 질문을 이 값만으로 열지 않음. `blockage`·`finalGoal`도 아님 | 없음 | 행동: 실제 영향. 통합문: 영향 확인 (`situation_mismatch`와 같은 첫 문장) |
| `appeal_possibility` | 이의·재검토 라벨 | 사유·막힘·최종목표를 열지 않음 | 없음 | 행동: 이의·재검토 안내 확인. 통합문: 가능 여부 |
| `what_to_do` | 지금 할 일 라벨 | `blockage`가 열린다. 사유·`finalGoal`은 아님 | 없음 | 미확인: 우선 확인할 항목. `unsure`·`other`와 같은 문장 |
| `unsure` | 모름 라벨 | `blockage`와 `finalGoal`이 열린다 | 없음 | `what_to_do`와 같은 미확인 문장 |
| `other` | note 또는 DI 라벨 | 사유·막힘·최종목표를 열지 않음 | 없음 | `what_to_do`와 같은 미확인 문장 |

`understand_impact`와 `appeal_possibility`는 다음 질문이 같고 결과 문장만 다르다. `what_to_do`·`unsure`·`other`의 결과 문장은 같다. `unsure`만 `finalGoal`을 연다.

### 1.3 `case05_customerResponse`

프로파일: `customerAction`. `none`이 아니면 대응 라운드 1. `unsure`는 현재 선택지에 없고, 있으면 라운드를 올리지 않는다.

| 선택지 | Profile 변화 | 다음 질문 영향 | 증거 요구 변화 | 결과 문장 변화 |
|---|---|---|---|---|
| `none` | 미대응 라벨. 라운드 0 | 소명·서류·이의 상세와 `authorityFollowUp`·`dispositionOutcome`이 안 열림. `situation_mismatch`이면 반복 질문은 그대로 열림 | 제출 완료 경로의 증거 강제는 없음 | 주의: 아직 설명·제출·재검토를 하지 않음 |
| `inquired` | 문의 라벨. 라운드 1 | `authorityFollowUp` 이후 `dispositionOutcome` | 이 값만으로는 증거 질문 없음 | 이 값 전용 문장 없음 |
| `explanation_submitted` | 소명 제출 라벨. 라운드 1 | `explanationDetail` + 기관 후속 | 이 값만으로는 증거 질문 없음 | 주의: 이미 자료를 제출 — 기관 반응 확인. `documents_submitted`와 같은 문장 |
| `documents_submitted` | 서류 제출 라벨. 라운드 1 | `submittedDocsDetail` + 기관 후속 | `case05_evidence`가 열린다 | `explanation_submitted`와 같은 주의 문장 |
| `appeal_requested` | 이의 요청 라벨. 라운드 1 | `appealDetail` + 기관 후속 | 이 값만으로는 증거 질문 없음 | 주의: 이의·재검토를 요청 — 진행 결과 |
| `other` | note 또는 DI 라벨. 라운드 1 (`none`이 아니므로) | 후속·상세를 열지 않음. `other_method` 옛 값만 후속을 연다 | 없음 | 이 값 전용 문장 없음 |

`inquired`는 다음 질문은 갈리고 결과 문장은 안 갈린다. `other`는 후속 질문도 결과 문장도 `none`과 같이 비어 있고, 프로파일 문장만 다르다.

### 1.4 `case05_deadline`

프로파일: `deadline` 라벨. 날짜 필드는 없다. `specific_date`를 골라도 날짜는 저장되지 않는다.

다음 질문은 어떤 값을 골라도 같다. Phase2 입구를 가르지 않는다.

| 선택지 | Profile 변화 | 다음 질문 영향 | 증거 요구 변화 | 결과 문장 변화 |
|---|---|---|---|---|
| `specific_date` | 날짜를 확인했다는 라벨 | 없음 | 없음 | 주의: 기한 내 대응. 행동: 기한을 다시 확인. 통합문: 기한은 확인됨. 미확인 신호는 없음 |
| `uncertain` | 날짜 미확인 라벨 | 없음 | 없음 | 미확인 신호 `DISPOSITION_DEADLINE_UNCLEAR`. 미확인: 대응 기한. 행동: 기한이 적혀 있는지. 통합문: 아직 명확하지 않음 |
| `period_stated` | 안내만 받았다는 라벨 | 없음 | 없음 | `uncertain`과 같은 신호·문장 |
| `not_stated` | 기한 유무 미확인 라벨 | 없음 | 없음 | `uncertain`과 같은 신호·문장 |
| `unsure` | 기한 미확인 라벨 | 없음 | 없음 | `uncertain`과 같은 신호·문장 |
| `other` | note 또는 DI 라벨 | 없음 | 없음 | 신호·주의·미확인·통합문 분기 없음 |

`uncertain` · `period_stated` · `not_stated` · `unsure`는 서로 장식이다. 옛 `past_possible`만 코드에 「지났을 가능성」문장이 남아 있고, 현재 선택지에는 없다. `known_date`는 `specific_date`로 읽힌다.

---

## 2. Phase2

### 2.1 `case05_factRelationship`

현재 Phase1 선택지에서는 이 질문이 항상 나온다. `case05NeedsFactRelationshipPhase2`가 조치 다섯 개와 `other`에서 모두 참이다.

프로파일: `actualSituation` 라벨, `factRelationship` slug. 1차 결과의 사실 지표: `match`=ok, `partial`·`mismatch`=issue, 그 외 응답=unknown.

| 선택지 | Profile 변화 | 다음 질문 영향 | 증거 요구 변화 | 결과 문장 변화 |
|---|---|---|---|---|
| `match` | 거의 같음 | `factDetail` 안 열림. 막힘·증거는 이 값만으로 안 열림 | 없음 | 사실 지표 ok. 「같다고 응답」요약. Phase2 주의 문장 없음 |
| `partial` | 일부 다름 | `factDetail`·`blockage` | 증거 질문이 열림 | 신호 `FACT_MISMATCH_PARTIAL`. 주의·행동: 대조. 2차 요약: 차이 가능성 |
| `mismatch` | 크게 다름 | `partial`과 같음 | 증거 질문이 열림 | 신호만 `FACT_MISMATCH`. 주의·행동·2차 요약 문장은 `partial`과 같음 |
| `hard_to_judge` | 대조 어려움 | `factDetail`·`blockage` | 증거 질문이 열림 | 신호 `FACT_UNVERIFIED`. 미확인: 처분과 실제 상황의 관계. 대조 주의 문장은 아님 |
| `unknown` | 통지 이해 어려움 | `factDetail`은 안 열림. `blockage`는 열림 | 증거 질문이 열림 | `hard_to_judge`와 같은 신호·미확인 문장 |
| `other` | note 또는 DI 라벨 | 상세·막힘·증거를 이 값으로 열지 않음 | 없음 | 신호·주의·미확인 분기 없음 |

`partial`과 `mismatch`는 다음 질문·결과 문장이 같고 신호 코드만 다르다. `hard_to_judge`와 `unknown`은 결과 문장이 같고, 상세 질문만 `hard_to_judge`가 연다.

### 2.2 `case05_dispositionReason`

열리는 때: 조치가 `disposition_unclear`(또는 옛 `reason_hard_to_understand`)이거나, 목표가 `understand_reason`(또는 옛 `maintain_reason`)일 때. 권리 중단·활동 제한·신청 거부이면서 목표가 영향·이의·할 일이면 사유를 묻지 않는다.

프로파일: `authorityReason`. 사유가 있으면 분류 confidence 0.75, 없으면 0.5. 사건 ID는 그대로 CASE_05다.

| 선택지 | Profile 변화 | 다음 질문 영향 | 증거 요구 변화 | 결과 문장 변화 |
|---|---|---|---|---|
| `violation_claimed` | 위반 라벨 | 없음 | 없음 | 없음 |
| `document_issue` | 서류 문제 라벨 | 없음 | 없음 | 없음 |
| `requirement_not_met` | 요건 미충족 라벨 | 없음 | 없음 | 없음 |
| `deadline_procedure` | 기한·절차 라벨 | 없음 | 없음 | 없음 |
| `no_clear_reason` | 설명 부족 라벨 | `blockage`·`finalGoal` | 없음 | 신호 `DISPOSITION_REASON_UNCLEAR`. 미확인: 처분 사유. 행동: 사유가 적힌 부분 |
| `unsure` | 파악 못함 라벨 | `no_clear_reason`과 같음 | 없음 | `no_clear_reason`과 같은 신호·문장 |
| `other` | note 또는 DI 라벨 | 막힘·최종목표를 열지 않음 | 없음 | 없음 |

이유 네 개(`violation_claimed`부터 `deadline_procedure`)는 서로 장식이다. 프로파일 라벨만 바뀐다.

### 2.3 `case05_dispositionDetail`

열리는 때: 조치가 불명확·`other`·`application_denied`(또는 옛 `reason_hard_to_understand`)일 때.

선택지 `wording_unclear` · `scope_unclear` · `partially_understood` · `unsure`는 DI가 없다.

네 값 모두 프로파일 칸, 다음 질문, 증거 질문, 신호, 결과 문장을 바꾸지 않는다. 답변 키만 채우고 경로 완료에 필요하다. 질문 전체가 장식이다. FOCUS는 `authorityClaim`이라고 적혀 있으나 `authorityClaim`은 `dispositionType`이 이미 차지한다.

### 2.4 `case05_factDetail`

열리는 때: 사실비교가 `partial` · `mismatch` · `hard_to_judge`일 때. `unknown`은 열지 않는다.

선택지 `date_place` · `content_differs` · `hard_to_verify` · `unsure`. DI 없음.

네 값 모두 이후 분기·증거·결과 문장이 없다. `actualSituation`은 앞 질문 라벨 그대로다. 질문 전체가 장식이다.

### 2.5 `case05_explanationDetail`

열리는 때: `customerResponse === explanation_submitted`만.

선택지 `written` · `verbal` · `both` · `unsure`. DI 없음.

`customerAction`은 앞의 소명 제출 라벨을 유지한다. 네 값은 이후를 가르지 않는다. 질문 전체가 장식이다.

### 2.6 `case05_submittedDocsDetail`

열리는 때: `documents_submitted`만.

선택지 `identity` · `financial` · `certificate` · `doc_other` · `unsure`. DI 없음. `doc_other`는 공식 `other`+note가 아니다.

증거 질문은 이 상세 값이 아니라 `documents_submitted`가 연다. 다섯 값은 이후를 가르지 않는다. 질문 전체가 장식이다.

### 2.7 `case05_appealDetail`

열리는 때: `appeal_requested`만.

선택지 `filed` · `preparing` · `considering` · `unsure`. DI 없음.

네 값은 이후를 가르지 않는다. 질문 전체가 장식이다.

### 2.8 `case05_authorityFollowUp`

열리는 때: `inquired` · `explanation_submitted` · `documents_submitted` · `appeal_requested` · 옛 `other_method`. `none`과 공식 `other`는 열지 않는다.

값이 있으면 `dispositionOutcome`이 이어서 열린다. 프로파일 `authorityResponse`는 outcome이 있으면 outcome 라벨로 바뀐다.

| 선택지 | Profile 변화 | 다음 질문 영향 | 증거 요구 변화 | 결과 문장 변화 |
|---|---|---|---|---|
| `maintained` | 유지 안내. 라운드 2 | `repeatFollowUp` | 반복 조건이라 증거 질문이 열림 | 주의: 유지 안내. 행동: 이전 대응과 유지 안내. 2차 요약: 처분 유지 (사실비교가 있을 때, outcome 유지와 같은 문장) |
| `modified` | 변경 안내. 라운드 1 (유지·반복이 아니면 2가 아님) | `repeatFollowUp` | 증거 질문이 열림 | 이 값 전용 문장 없음 |
| `revoked` | 철회 안내. 라운드는 `modified`와 같음 | `repeatFollowUp` | 증거 질문이 열림 | 이 값 전용 문장 없음 |
| `more_docs` | 추가 서류. 재분류 CASE_04 | `repeatFollowUp` | 증거 질문이 열림 | 주의: 추가 요구. 행동: 추가 요구 확인. 분류가 CASE_04면 보완 확인 행동 추가 |
| `attendance_explanation` | 출석·설명. 재분류 CASE_03 | `repeatFollowUp` | 증거 질문이 열림 | `more_docs`와 같은 추가 요구 문장. 분류가 CASE_03면 출석·소명 행동 추가 |
| `under_review` | 재검토 중 | `repeatFollowUp` | 증거 질문이 열림 | 주의: 재검토 진행 |
| `payment_demand` | 납부 요구. 재분류 CASE_02 | `repeatFollowUp` | 증거 질문이 열림 | 분류가 CASE_02면 납부 금액·기한 확인 행동 |
| `no_response` | 무응답. 라운드 1 | 반복 질문 안 열림 (`under_review`와 반복 집합 밖) | 이 값만으로는 증거 질문 없음 | 신호 `DISPOSITION_RESPONSE_UNCLEAR`. 미확인: 기관 답변. 위험: 기관 반응 미확인 |
| `unsure` | 모름 | 반복 질문 안 열림 | 없음 | 신호만 `DISPOSITION_RESPONSE_UNCLEAR`. 전용 주의 문장 없음 |
| `other` | note 또는 DI 라벨 | outcome은 열린다 (값이 있으므로). 반복은 안 열림. 재분류 없음 | 없음 | 전용 문장 없음 |

`modified`와 `revoked`는 다음 질문이 같고 결과 문장이 없다. `more_docs`와 `attendance_explanation`은 주의 문장이 같고, 재분류된 사건의 행동 문장만 다르다.

### 2.9 `case05_dispositionOutcome`

DI 없음. 후속 질문이 있고 그 답이 있을 때만 나온다.

| 선택지 | Profile 변화 | 다음 질문 영향 | 증거 요구 변화 | 결과 문장 변화 |
|---|---|---|---|---|
| `maintained` | `authorityResponse`가 이 라벨로 바뀜. 라운드 2 | 반복은 앞의 followUp이 결정. 이 값이 반복을 새로 열지는 않음 | 없음 | 주의: 처분이 유지됨. 2차 요약은 followUp 유지와 같은 문장 |
| `modified` | 변경 라벨로 교체 | 없음 | 없음 | 없음 |
| `revoked` | 철회 라벨로 교체 | 없음 | 없음 | 없음 |
| `additional_action` | 추가 조치 라벨 | 없음 | 없음 | 없음 |
| `more_docs_required` | 추가 자료 라벨 | 없음. 재분류는 followUp `more_docs`만 한다 | 없음 | 없음 |
| `no_result` | 결과 없음 라벨 | 없음 | 없음 | 신호 `DISPOSITION_RESPONSE_UNCLEAR`. 미확인: 기관 후속 결과 |
| `unsure` | 파악 못함 라벨 | 없음 | 없음 | 신호만 같음. 미확인 목록 문장은 `no_result`의 「기관 후속 결과」가 아님 |

`modified` · `revoked` · `additional_action` · `more_docs_required`는 결과 문장 기준으로 장식이다. 프로파일 라벨만 바뀐다.

### 2.10 `case05_repeatFollowUp`

열리는 때: 목표가 옛 `maintain_reason`, 또는 조치가 `situation_mismatch`, 또는 followUp이 유지·변경·철회·추가서류·출석·납부·재검토일 때.

| 선택지 | Profile 변화 | 다음 질문 영향 | 증거 요구 변화 | 결과 문장 변화 |
|---|---|---|---|---|
| `more_explanation` | 라운드 2 | 없음 | 없음 (이미 반복 조건으로 열려 있음) | 주의: 추가 대응 반복. 행동: 이전 대응과 후속 안내 |
| `more_docs` | 라운드 2 | 없음 | 없음 | 위와 같은 문장 |
| `maintained_again` | 라운드 2 | 없음 | 없음 | 위와 같은 문장 |
| `under_review_again` | 라운드 2 | 없음 | 없음 | 위와 같은 문장 |
| `not_applicable` | 라운드를 이 값으로 올리지 않음 | 없음 | 없음 | 반복 주의 문장 없음 |
| `other` | 라운드 2 (`not_applicable`·`unsure`가 아니므로) | 없음 | 없음 | 내용 네 개와 같은 반복 주의·행동 |

내용 네 개와 `other`는 결과 문장이 같다. 갈라지는 것은 `not_applicable`뿐이다.

### 2.11 `case05_blockage`

열리는 때: 목표 `what_to_do`·`unsure`, 조치 불명확, 사유 불명확, 사실비교가 불일치·판단 어려움·모름, 또는 반복 조건이면서 followUp이 있을 때.

어떤 값이든 프로파일 `currentBlockage` 라벨만 바뀐다. 다음 질문과 증거 질문은 값이 아니라 이 질문을 열었는지로 이미 결정된다. 결과는 값이 있으면 모두 「미확인: 현재 막힌 부분」이다.

해당 선택지: `why_disposition` · `what_disposition` · `fact_match` · `what_to_do` · `appeal_method` · `deadline` · `evidence` · `next_response` · `unsure` · `other`.

아홉 개 내용 선택지와 `other`는 분기·증거·결과 문장 기준으로 장식이다.

### 2.12 `case05_evidence`

열리는 때: 조치 불명확, 사실비교가 불일치·판단 어려움·모름, `documents_submitted`, 또는 반복 조건. `match` + 미제출 + 반복 없음 + 조치가 명확하면 묻지 않는다.

업로드 게이트는 이 답과 무관하다.

| 선택지 | Profile 변화 | 다음 질문 영향 | 증거 요구 변화 | 결과 문장 변화 |
|---|---|---|---|---|
| `disposition_notice` · `message_email` · `submitted_docs` · `payment_proof` · `photo_video` · `contract` | `evidence` 라벨만 해당 자료명 | 없음 | 질문 자체일 뿐, 업로드 요구는 불변. 미확인 신호 없음 | 없음 |
| `none` | 없음 라벨 | 없음 | 신호 `DISPOSITION_EVIDENCE_UNCLEAR` (이 질문이 필요한 경로에서만) | 미확인 목록에 증빙 확인 문장. 패널 주의 문장에는 이 필드를 넣지 않음 |
| `unsure` | 미확인 라벨 | 없음 | `none`과 같은 신호 | `none`과 같음 |
| `other` | note 또는 DI 라벨. 옛 `evidence_other`는 라벨만 confirmed | 없음 | 신호 없음 | 없음 |

자료 종류 여섯 개는 서로 장식이다.

### 2.13 `case05_finalGoal`

열리는 때: 조치 옛 slug `unclear`, 사유 `unsure`·`no_clear_reason`, 또는 목표 `unsure`. 정식 `disposition_unclear`만으로는 안 열린다.

프로파일 `goal`이 `confirmGoal` 대신 이 라벨이 된다. 다음 질문은 없다. 증거·결과 문장은 값으로 갈리지 않는다.

선택지 `why_disposition` · `what_disposition` · `fact_match` · `what_to_do` · `next_action` · `evidence` · `expert` · `unsure` · `other`는 라벨만 다르다. 분기 기준으로 장식이다. Phase1 `confirmGoal`과 주제가 겹친다.

---

## 3. 판정

### ① 정보완결성 — FAIL

질문을 마쳐도 원인·당사자·날짜·쟁점의 차이를 다시 물어야 한다. 기준 문서의 FAIL 조건이다.

Phase1 4개와, 열리는 Phase2를 모두 채워도 아래는 비거나 상태 단어만 남는다.

| 축 | CASE_05에서 필요한가 | 채워지는 방식 |
|----|----------------------|----------------|
| 사건 시작/원인 | 필요. MASTER 역할이 조치의 이유 | `dispositionReason`이 조건부. 영향·이의·할 일 목표의 거부·제한·권리종료 경로에서는 안 묻는다 |
| 목표/주장 | 필요 | `confirmGoal`은 항상. 주장의 내용은 없고 확인하고 싶은 종류만 있다 |
| 당사자 | 필요. 누가 조치했는지 | CASE_05 답은 `authority`를 안 채운다. 질문 문장만 교통국이다 |
| 상대방 행동 | 필요 | 최초 조치는 `dispositionType`. 그 뒤 기관 반응은 고객이 이미 대응했을 때만 |
| 현재상태 | 필요 | 대응 여부·기한 상태·outcome. 효력이 지금 살아 있는지는 조치 종류 라벨로만 갈린다 |
| 시간/기한 | 필요 | 기한의 상태만. `specific_date`여도 날짜가 없다 |
| 핵심증거 | 필요 | 깨끗한 경로(`match`, 미제출, 반복 없음, 조치 명확)에서는 증거 질문을 안 한다. 업로드 파일은 별도 게이트 |
| 사용자 조치 | 필요 | `customerResponse`는 항상. 소명 방식·서류 종류·이의 상태는 저장만 되고 판단에 안 들어간다 |
| 상대방 대응 | 필요 | `none`이면 followUp·outcome이 없다. 대응했다면 followUp이 받는다 |
| 핵심쟁점 | 필요 | 사실비교는 사실상 항상. 어디가 다른지(`factDetail`)는 저장 후 버려진다 |

### ② 다중신호성 — FAIL

한 칸 라벨만 바꾸고 다음 질문·증거·결과가 같은 선택지가 한 질문 안에 여러 개다. 기준은 그 경우를 주의 또는 FAIL로 둔다. CASE_05는 그 선택이 질문 단위로 반복되므로 FAIL이다.

동시에 다음 질문·증거 질문·신호·결과 문장 중 둘 이상으로 가는 값: `situation_mismatch`, `disposition_unclear`, `application_denied`(상세 질문+결과), `understand_reason`, `what_to_do`, `unsure`(목표), `documents_submitted`, `partial`/`mismatch`/`hard_to_judge`, `no_clear_reason`, followUp의 `maintained`·`more_docs`·`attendance_explanation`·`payment_demand`·`under_review`·`no_response`.

한 칸 라벨만 바꾸는 값: 사유 네 개, 기한 미확인 묶음, 자료 종류 여섯 개, 막힘 전부, 최종목표 전부, 그리고 2.3~2.7 상세 질문 전부.

### ③ 선택지 판별력 — FAIL

다른 라벨이 같은 다음 질문·같은 결과로 합쳐진다. 기준의 FAIL 후보다.

갈라지는 질문: 조치 종류(상세·반복·증거·결과), 확인 목표(사유 질문과 결과), 고객 대응(후속 질문), 사실비교(`match` / 불일치 / 판단 어려움), 기관 후속(재분류·반복·무응답).

안 갈라지거나 문장까지 같은 묶음: 기한 4개, 사유 4개, `partial`/`mismatch`의 결과 문장, 반복 내용 4개+`other`, 막힘 전부, 자료 종류 6개, outcome의 변경·철회·추가조치·추가자료.

### ④ 비장식성 — FAIL

③에서 갈라지지 않는 선택지는 장식이다. 질문 전체가 장식인 것은 비율 계산에서 뺀다.

질문 전체: `dispositionDetail`, `factDetail`, `explanationDetail`, `submittedDocsDetail`, `appealDetail`, `blockage`, `finalGoal`.

질문 안의 장식 선택지: 기한 `uncertain`·`period_stated`·`not_stated`·`unsure`, 사유 `violation_claimed`·`document_issue`·`requirement_not_met`·`deadline_procedure`, `blockage`의 모든 값, `finalGoal`의 모든 값, `evidence`의 자료 6개, `repeatFollowUp`의 내용 4개와 `other`, `dispositionOutcome`의 `modified`·`revoked`·`additional_action`·`more_docs_required`.

`inquired`와 고객대응 `other`는 결과 문장이 없다. `inquired`는 후속 질문을 열므로 질문 단위 장식은 아니다. 고객대응 `other`는 후속도 결과도 없어서 장식에 가깝다.

### ⑤ 직접입력 의존성 — PASS

정상 경로의 핵심 사실이 자유텍스트에만 있지 않다. 비어 있는 축은 ①의 FAIL이고, ⑤의 직접입력 의존이 아니다.

내용 선택지만으로 조치·목표·대응·기한 상태·사실비교를 채울 수 있다. `other`는 그 필드의 note 없이는 완료되지 않지만, 정상 케이스가 `other`를 골라야만 하는 축은 없다.

비어 있는 축(당사자, 날짜, 조건부 사유, 상세 쟁점)은 DI로도 안 채워진다. 그 질문을 열지 않거나, 열어도 프로파일로 옮기지 않기 때문이다. `confirmGoal`만 예외로, `other`는 note 없이도 다음 Phase1 질문이 나온다. Phase1 완료는 note를 기다린다.

### ⑥ 1차 vs 2차 — 1차 < 2차 (PASS 후보). 실질 축 비율 4:6 (하한 경계)

LOCK 판정: 1차 = 2차와 1차 > 2차는 무조건 FAIL. 1차 < 2차는 질문 개수가 아니라 실질 정보 밀도로 본다. 실질 축은 ②~④를 통과한 질문만 센다. 장식 질문은 빼며, 하한은 1차:2차 = 3:7~4:6이다.

| 구분 | 질문 | 비율 포함 |
|------|------|-----------|
| 1차 실질 축 4 | `dispositionType`, `confirmGoal`, `customerResponse`, `deadline` | 포함. 각 질문이 다음 질문 또는 결과 문장을 가른다 |
| 2차 실질 축 6 | `factRelationship`, `dispositionReason`, `authorityFollowUp`, `dispositionOutcome`, `repeatFollowUp`, `evidence` | 포함. 프로파일에 1차에 없는 사실비교·사유·기관 반응·라운드·증거 유무가 들어간다 |
| 2차 장식 7 | `dispositionDetail`, `factDetail`, `explanationDetail`, `submittedDocsDetail`, `appealDetail`, `blockage`, `finalGoal` | 제외. 값을 바꿔도 다음 질문·증거·결과 문장이 같다 |

실질 축 4:6은 하한 4:6 위가 아니다. 하한 아래(1차 4에 2차 실질 5 이하, 또는 1차=2차, 1차>2차)도 아니다. 겉질문 4:13으로 세지 않는다.

1차 4축은 조치·목표·대응·기한 상태다. 2차 6축은 그 위에 사실 대조, 사유, 기관 후속, 후속 결과, 반복, 증거 유무를 더한다. 정보 밀도는 1차 < 2차다. 이 부등식은 PASS 후보이며, ①~④ FAIL을 지우지 않는다.

---

## 4. 권장안 (이번 감사에서 수정하지 않음)

1. 사유를 권리종료·활동제한·신청거부 경로에서도 묻는다. 원인 축이 목표 한 개에만 매달려 있다.
2. `factDetail`을 프로파일·결과로 연결하거나 질문을 뺀다. 날짜/내용/확인불가가 같은 미확인으로 합쳐진다.
3. `dispositionDetail` · `explanationDetail` · `submittedDocsDetail` · `appealDetail`도 같다. 결과에 쓸 문장이 없으면 완료 조건에서 뺀다.
4. 기한 미확인 4개를 한 상태로 묶거나, 지남/임박/날짜 없음이 서로 다른 신호를 갖게 한다. `specific_date`는 날짜를 받거나, 날짜 없이 「확인했다」고 저장하지 않는다.
5. `partial`과 `mismatch`의 결과 문장을 신호 코드만큼 나눈다. 기관 후속의 `modified`·`revoked`에는 유지와 다른 문장을 둔다.
6. `blockage`·`finalGoal`·증거 종류는 값마다 결과나 다음 요구가 생기게 하거나, 질문 수를 줄인다. `finalGoal`은 `confirmGoal`과 겹친다.
7. 당사자(`authority`)는 CASE_05 답으로 채울 출처가 없다. 조치 주체를 물을지는 별도 승인 항목이다.
8. 장식 질문을 늘려 개수를 맞추지 않는다. 실질 축은 지금 4:6으로 하한 경계다. 2차 실질 축이 줄면 하한 아래가 되어 FAIL이다.

---

*2026-09-25. CASE_05 정보완결성 파일럿. LOCK 기준 fa4cce9 적용. LEVEL 1. 코드 미변경.*
