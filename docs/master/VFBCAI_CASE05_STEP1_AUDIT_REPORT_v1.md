# CASE_05 STEP1 — 조사 보고 (코드 미변경)

| 항목 | 내용 |
|------|------|
| **CASE** | `CASE_05` — 면허 행정조치 / **처분·조치 통지** |
| **단계** | STEP1 — `VFBCAI_CASE_AUDIT_CHECKLIST_v1.md` A~H |
| **SoT (설계)** | `docs/master/VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` § CASE_05 |
| **구현 조사** | `src/lib/adminVerifyProfiling.ts` (주), `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` |
| **검증** | 대부분 **LEVEL 1 (코드 확인함)**. 브라우저 DOM **LEVEL 4 (미확인)** — 본 STEP1에서 실행하지 않음. |
| **금지 준수** | 애플리케이션 코드·질문 문구·선택지·branch **미수정**. |

**범위 구분:** Q1=`disposition_notice`로 진입하는 **네이티브 CASE_05**만 본 보고의 주 대상. `CASE_06` 체인④ → 브릿지 → `CASE_05`는 **동일 `case05_*` 필드**를 쓰지만 진입·Phase1 선행은 `isCase06BridgedToNativeCase` 분기 — STEP2에서 별도 시나리오로 검증 필요.

---

## 보고 형식 (체크리스트 요약)

```
CASE_05
- 구조 차이: (아래 A)
- 질문/선택지 품질 이슈: (아래 B)
- Direct Input 연결 상태: (아래 C)
- Raw/Effective 불일치: (아래 D)
- Dead code: (아래 G)
- Result 연결 상태: (아래 E)
- Browser 검증 필요 항목: (아래 F·H)
- [DESIGN QUESTION] 목록: (말미)
```

---

## A. 설계 기준 비교 (MASTER v1.0 대비)

### A-1. Phase1 — 순서·개수

| # | MASTER v1.0 (1차) | 현재 구현 (`CASE05_PHASE1_FIELD_ORDER` + `appendCase05Phase1Questions`) | LEVEL 1 |
|---|-------------------|------------------------------------------------------------------------|---------|
| 1 | 어떤 조치에 관한 안내 | `case05_dispositionType` — 라벨 동형 | 일치 |
| 2 | **왜** 이런 조치 (처분 사유) | **Phase1 없음** → Phase2 `case05_dispositionReason` (`case05NeedsDispositionReasonPhase2`) | **구조 차이** |
| 3 | 조치 이유 vs 실제 상황 비교 | **Phase1 없음** → Phase2 `case05_factRelationship` (`case05NeedsFactRelationshipPhase2`) | **구조 차이** |
| 4 | 지금까지 대응 | `case05_customerResponse` (Phase1 **3번째**) | 순서 차이 |
| 5 | 가장 먼저 확인하고 싶은 것 | `case05_confirmGoal` (Phase1 **2번째**) | 순서 차이 |
| 6 | 기한 (조건부) | `case05_deadline` (Phase1 **4번째**, 조건 없이 항상 push) | MASTER는 조건부 명시 · 구현은 항상 노출 |

**요약:** MASTER **6문항** 스켈레ton vs 구현 Phase1 **4필드**. 사유·사실관계 비교는 **2차 adaptive**로 이관된 패턴 (CASE_03 factRelationship 이관과 유사).

### A-2. Phase2 adaptive chain

| MASTER v1.0 chain | 구현 `appendCase05Phase2Questions` 순서 | LEVEL 1 |
|-------------------|----------------------------------------|---------|
| factRelationship | 1 (조건부) | 일치 축 |
| dispositionReason | 2 (조건부) | 일치 축 |
| dispositionDetail | 3 (조건부) | 일치 |
| 조건부 세부 | factDetail, explanationDetail, submittedDocsDetail, appealDetail | 일치 (customerResponse 분기) |
| authorityFollowUp | 이후 (대응 있을 때) | 일치 |
| dispositionOutcome | followUp 이후 | 일치 |
| repeatFollowUp | 조건부 | 일치 |
| blockage → evidence → finalGoal | 동일 종단 | 일치 |

**고정 문항 수:** `case05Needs*` 다수가 goal·type·response·followUp에 의존 — MASTER 「질문 수 고정 없음」 원칙과 **코드상 정합** (LEVEL 1).

### A-3. 1차 / 2차 역할

- Phase1: type · goal · response · deadline — 사건 골격 (LEVEL 1).
- Phase2: 사유·사실관계·기관 반응·반복·막힘·증빙·목표 — **Phase1 반복이 아닌** 심화 축 (LEVEL 1, 코드 분기 기준).

### A-4. Direct Input 문구

- `ADMIN_DIRECT_EXPLAIN_CHOICE` — value `other`, 라벨 `위에 내용이 없거나 설명이 필요합니다 → 직접 입력` (LEVEL 1).
- Phase1 DI 노출 필드: `dispositionType`, `customerResponse`, `deadline` (**`confirmGoal`에는 DI 없음**).
- Phase2 DI: `factRelationship` 등 일부만 DI 포함; `dispositionReason` 옵션 배열에 **DI 없음** (LEVEL 1).

### A-5. 선택지 개수 (4~5 + DI)

| 필드 | 내용 옵션 수 (+ DI) | MASTER 4~5+DI | LEVEL 1 |
|------|---------------------|---------------|---------|
| dispositionType | 7 + 1 DI = 8 | 초과 | 이슈 후보 |
| confirmGoal | 7, DI 없음 | 4~5+DI 불일치 | 이슈 후보 |
| customerResponse | 6 + 1 DI | 초과 | 이슈 후보 |
| deadline | 6 + 1 DI | 초과 | 이슈 후보 |

---

## B. 질문/선택지 품질 (코드 기준)

- **실제 상황 / 전문가 판단:** type·reason·factRelationship·followUp·outcome 등은 처분 도메인 축으로 분리됨 (LEVEL 1).
- **중복:** `confirmGoal` vs `finalGoal` — 서로 다른 단계(Phase1 목표 vs Phase2 종단 목표)이나 일부 value 축 유사 (`what_to_do`, `unsure` 등) — **표현 중복 의심**, branch·Result 사용처는 분리 (LEVEL 1, **미확인** depth audit).
- **무의미 기타:** 전용 `기타` value 대신 `unsure`·`unclear` 다수 — MASTER §5 「추상 기타 금지」와의 정합은 **STEP2 문구 검토** 필요.
- **Profile 반영:** `buildCaseResolutionProfile` — `case05_dispositionType`(+ DI note), goal, response, deadline, fact 등 (LEVEL 1).
- **Branch 영향:** `case05Needs*` 전반이 이후 질문·`case05PathFieldsComplete`에 연결 (LEVEL 1).

**도메인 문구:** Phase1 Q1 라벨이 「교통국」 고정 — MASTER 동일. Q1 진입 `disposition_notice`는 면허·교통 맥락과 일치 (LEVEL 1).

---

## C. Direct Input 연결 (전체 경로)

| 필드 | raw `other` | note key (`getAdminChoiceNoteKey`) | Profile | Branch | Result | LEVEL |
|------|-------------|-----------------------------------|---------|--------|--------|-------|
| case05_dispositionType | 있음 | 있음 | `event` fact — note 시 confirmed (LEVEL 1) | type 분기 | `appendCase05Phase1ResultSignals` — `other` 미참조, **`other_disposition` 참조** | **불일치 의심** |
| case05_factRelationship | 있음 | (공용 DI 패턴) | FOCUS / actualSituation | needs* | Phase2 signals | LEVEL 1 — note→label helper **case02 패턴 주석만**, case05 전 필드 **미확인** |
| case05_customerResponse | 있음 | 공용 | customerAction | followUp chain | Phase1 signals | LEVEL 1 partial |
| case05_deadline | 있음 | 공용 | deadline | signals | Phase1 signals | LEVEL 1 partial |

**[REGRESSION FOUND 후보 — LEVEL 1]:** UI value는 `other`인데 Result·일부 분기는 `other_disposition` 문자열 사용 (`AdminVerifyFirstResultPanel.tsx`, `deriveDispositionSignals`는 `other_disposition` 미포함). DI `other` 선택 시 `other_disposition` 분기 **미타격 가능**.

---

## D. Raw / Effective

- CASE_05 전용 **effective 변환 함수 없음** (CASE_02 `case02EffectiveSituationMatch` 같은 패턴 **없음**) — 게이트·signals는 **raw value** 기준 (LEVEL 1).
- `isAdminVerifyChoiceFieldComplete` — DI `other`는 note 완료 시 complete (공용, LEVEL 1).
- **의도 vs raw:** `unsure`/`unclear` 다수가 unknown·signal에 매핑 — 의도된 불확실성 축으로 보임 (LEVEL 1, Ace 확인은 STEP2).

---

## E. Result 연결

| 경로 | LEVEL 1 요약 |
|------|----------------|
| `deriveDispositionSignals` → `collectCase05Unknowns` | type/reason/source/fact/deadline/followUp/evidence |
| `collectCase05RiskSignals` | fact mismatch, rounds≥2, no_response |
| `appendCase05Phase1ResultSignals` / `appendCase05Phase2ResultSignals` | First result panel |
| `case05ActionsFromAnswers` | CTA 문구 |
| Phase2 개인화 Result | `AdminVerifyFirstResultPanel` 외 2차 패널 — **본 STEP1에서 전수 추적 안 함** (LEVEL 4) |

**함수 호출 ≠ 브라우저:** 1차·2차 패널 각각 DOM 표시 **미확인**.

---

## F. 검증 레벨 (본 Mission)

| 항목 | 레벨 |
|------|------|
| Phase1/2 builder, needs*, path complete | LEVEL 1 |
| Strict harness `CASE_05` 시나리오 존재 | LEVEL 1 (`admin-verify-strict-full-v2.mjs`) |
| Harness `phase2Overrides: {}` — 엔진 클릭 플랜만으로 path complete 주장 | LEVEL 2 (과거 lock JSON에 CASE_05 `finalPathComplete: true`) |
| PC/375px DI·overflow·CTA | LEVEL 4 |
| 선택지 의미 분리 4단계 (CASE_02 depth audit 동형) | **미수행** — STEP2 후보 |

---

## G. Dead / Legacy Code

| 항목 | 상태 | LEVEL 1 |
|------|------|---------|
| `case05_dispositionSource` | `CASE05_ANSWER_KEYS`·`CASE05_FIELD_OPTION_MAP`·`deriveDispositionSignals`·Profile authority fallback에 존재. **`appendCase05Phase1/2Questions`에서 미생성** | **Dead path (UI 미도달)** unless external seed |
| `case05_actualCore` | `case05NeedsActualCore` → **항상 false** | 옵션·FOCUS만 유지, 질문 **미노출** |
| `other_disposition` | `CASE05_OPTION_LABELS`·Result 분기·테스트 seed에 등장. **`CASE05_DISPOSITION_TYPE_OPTIONS`에 value 없음** | Legacy value 참조 |
| `known_date` | `CASE05_OPTION_LABELS` only; deadline options use `specific_date` | Label alias dead? |
| `CASE05` strict chain④ overrides (CASE_06) | `violation_stated`, `notice` 등 — **네이티브 옵션 set과 불일치 값**이 harness에 존재 (CHAIN 시나리오) | Harness·product 구분 필요 |

**삭제/수정:** STEP1에서 하지 않음 → [DESIGN QUESTION]으로 이관.

---

## H. Regression (타 CASE)

- CASE_06 LOCK이 `appendCase05PathQuestions`에 `isCase06BridgedToNativeCase` + Phase1 선행 추가 — **standalone Q1=CASE_05에는 해당 분기 false** (LEVEL 1).
- CASE_05 고도화 시 `AdminVerifyFirstResultPanel`·`buildCaseResolutionProfile`·공용 persist는 **CASE_01~04·06 회귀** 필요 (LEVEL 4 until tested).

---

## Browser 검증 필요 항목 (STEP2+)

1. Q1 `disposition_notice` → Phase1 4문항 라벨·progress·DI 패널 커밋.
2. Phase2 대표 분기 3종 이상: (a) `situation_mismatch` + fact chain, (b) `customerResponse`≠`none` + followUp→outcome, (c) blockage→evidence→finalGoal 종단.
3. DI `other` on `dispositionType` → Profile event 문구 + Result unconfirmed/CTA.
4. Bridged entry only: CASE_06 chain④ STOP → bridge → **Phase1 4문항 먼저** → Phase2.
5. 375px overflow on 7+1 choice lists.

---

## [DESIGN QUESTION] 목록

| ID | 주제 | 요약 |
|----|------|------|
| **DQ-C05-01** | Phase1 6 vs 4 | MASTER 1차에 사유·사실관계 포함 vs 구현 Phase2 이관 — **의도적 재배치인지** 확정 필요. |
| **DQ-C05-02** | Phase1 순서 | MASTER 4·5·6 vs 구현 goal→response→deadline — 확정 순서는 MASTER reorder인지 구현 우선인지. |
| **DQ-C05-03** | `case05_dispositionSource` | 옵션·signal만 있고 질문 없음 — 삭제 vs Phase1/2 복원 vs CASE_06 이관만. |
| **DQ-C05-04** | `other` vs `other_disposition` | **확정 수정 (2026-09-23)** — `getCase05FieldLabelFromAnswers` · `isCase05DispositionTypeUnclear` · Result/signals/Profile |
| **DQ-C05-05** | `confirmGoal` DI | **확정 수정 (2026-09-23)** — `ADMIN_DIRECT_EXPLAIN_CHOICE` 추가 · `goalValue`/Profile `case05_confirmGoal` 연결 |
| **DQ-C05-06** | 선택지 7+1 → 5+DI | **확정 구현 (2026-09-23)** — `VFBCAI_CASE05_PHASE1_REDESIGN_v1.md` · legacy `case05Effective*` |
| **DQ-C05-07** | `case05_actualCore` | FOCUS/keys 유지 vs dead code 제거. |
| **DQ-C05-08** | deadline 조건부 | MASTER 조건부 6번 vs 항상 노출. |

---

## DQ-C05-06 — Phase1 4필드 선택지 원문 (코드 추출, 2026-09-23)

SoT: `src/lib/adminVerifyProfiling.ts` — `CASE05_*_OPTIONS` (DI 라벨: `위에 내용이 없거나 설명이 필요합니다 → 직접 입력`, value `other`).

### `case05_dispositionType` (7 + DI)

1. 신청이나 요청이 받아들여지지 않았다는 조치를 받은 상황입니다. (`application_denied`)
2. 기존에 가지고 있던 허가·자격·권리가 중단되거나 취소되었다는 조치를 받은 상황입니다. (`license_revoked`)
3. 일정 기간 동안 특정 행동이나 활동이 제한되었다는 조치를 받은 상황입니다. (`business_suspended`)
4. 등록·자격·면허 등이 말소되거나 실효되었다는 조치를 받은 상황입니다. (`registration_cancelled`)
5. 처분 내용은 알지만 왜 이런 조치가 내려졌는지 이해하기 어려운 상황입니다. (`reason_hard_to_understand`)
6. 통지 내용과 실제 본인의 상황이 서로 다르게 느껴지는 상황입니다. (`situation_mismatch`)
7. 어떤 처분·조치인지 자체를 정확히 이해하기 어려운 상황입니다. (`unclear`)
8. 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 (`other`)

### `case05_confirmGoal` (7 + DI, DQ-C05-05 반영 후)

1. 처분이 왜 내려졌는지 먼저 확인하고 싶습니다. (`understand_reason`)
2. 이 처분이 실제로 어떤 영향을 주는지 확인하고 싶습니다. (`understand_impact`)
3. 언제부터 이 처분의 효력이 발생하는지 확인하고 싶습니다. (`understand_effective`)
4. 이의제기나 재검토가 가능한지 확인하고 싶습니다. (`appeal_possibility`)
5. 이미 대응했는데도 처분이 유지되는 이유를 확인하고 싶습니다. (`maintain_reason`)
6. 지금 무엇을 해야 하는지 먼저 확인하고 싶습니다. (`what_to_do`)
7. 지금 무엇부터 확인하고 준비해야 할지 모르겠습니다. (`unsure`)
8. 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 (`other`)

### `case05_customerResponse` (6 + DI)

1. 아직 기관에 설명하거나 자료를 제출하거나 재검토를 요청하지 않았습니다. (`none`)
2. 기관에 문의하거나 상황을 확인했습니다. (`inquired`)
3. 소명·의견을 제출했습니다. (`explanation_submitted`)
4. 서류나 증빙을 제출했습니다. (`documents_submitted`)
5. 이의제기·재검토 등을 요청했습니다. (`appeal_requested`)
6. 위에 없는 다른 방법으로 대응했습니다. (`other_method`)
7. 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 (`other`)

### `case05_deadline` (6 + DI)

1. 처분과 관련해 대응해야 하는 날짜를 확인했습니다. (`specific_date`)
2. 기한은 있다는 것은 알지만 정확한 날짜는 아직 확인하지 못했습니다. (`uncertain`)
3. 기한이 있다는 안내만 받았고, 정확한 날짜는 확인하지 못했습니다. (`period_stated`)
4. 기한이 있는지 자체를 아직 확인하지 못했습니다. (`not_stated`)
5. 이미 기한이 지났을 가능성이 있어 보입니다. (`past_possible`)
6. 처분 관련 기한을 아직 확인하지 못했습니다. (`unsure`)
7. 위에 내용이 없거나 설명이 필요합니다 → 직접 입력 (`other`)

---

## STEP1-B 추가 조사 (DQ-C05-01/02/03/07/08 — 결정 보류)

**LEVEL 1 (코드 확인함).** 임의 설계·구현 결정 없음.

### DQ-C05-01 — Phase1 6 vs 4

| MASTER v1.0 1차 | 구현 Phase1 | Phase2 이관 |
|---------------|-------------|-------------|
| dispositionReason | 없음 | `case05_dispositionReason` (`case05NeedsDispositionReasonPhase2`) |
| factRelationship | 없음 | `case05_factRelationship` (`case05NeedsFactRelationshipPhase2`) |

**추가 확인:** CASE_03 STEP1에서 factRelationship Phase2 이관과 동형 패턴. MASTER 원문이 “1차 고정 6문항”인지 “스켈레ton 축”인지 Ace 판정 필요. `appendCase05Phase1Questions`에 조건부 게이트 **없음** (deadline 항상 push).

### DQ-C05-02 — Phase1 순서

| MASTER 순서 | 구현 `CASE05_PHASE1_FIELD_ORDER` |
|-------------|----------------------------------|
| type → reason → factRel → response → goal → deadline(조건부) | type → **goal** → **response** → **deadline** |

**추가 확인:** Stitch progress는 `getAdminVerifyPhase1VisibleFields` → 4필드 순서와 일치. MASTER reorder가 의도인지 구현 drift인지 **USER DECISION REQUIRED**.

### DQ-C05-03 — `case05_dispositionSource`

- **UI:** `appendCase05Phase1/2Questions`에서 **미생성** (LEVEL 1).
- **참조:** `CASE05_ANSWER_KEYS`, `deriveDispositionSignals` (`unsure` → `DISPOSITION_AUTHORITY_UNCLEAR`), `buildCaseResolutionProfile` authority fallback (`case05_dispositionSource`가 있으면 `authorityClaim`에 사용), QA seed `case05_dispositionSource: "immigration"` (`adminVerifyProfiling.ts` ~10766).
- **추가 확인:** restore/meta에만 값이 있을 때 Profile·signal만 반응하는 **silent path** 가능. 삭제 vs 질문 복원 vs CASE_06 이관만 — **USER DECISION REQUIRED**.

### DQ-C05-07 — `case05_actualCore`

- `case05NeedsActualCore` → **항상 `false`** (LEVEL 1).
- `CASE05_ACTUAL_CORE_OPTIONS`·`CASE05_FOCUS_ORDER` rank 15·`CASE05_ANSWER_KEYS`에 slug 존재.
- **추가 확인:** 과거 체인 잔재 vs 향후 CASE_06 bridge 이관 축 — **USER DECISION REQUIRED**.

### DQ-C05-08 — deadline 조건부

- MASTER: 6번째 1차 문항 “(조건부)”.
- 구현: `appendCase05Phase1Questions`가 `case05_deadline`을 **항상** push (`getCase05Phase1VisibleFields`도 항상 4필드).
- **추가 확인:** MASTER 조건(어떤 선행 답에서만 노출) 문구가 v1.0에 **명시 slug 없음** — 조건부 규칙 정의 필요 (**USER DECISION REQUIRED**).

---

## 다음 단계 (Ace 방향)

1. STEP1 본 보고 검토 → [DESIGN QUESTION] 판정.
2. CASE_06 템플릿 **복사 금지** — 위 DQ와 MASTER § CASE_05 도메인 기준으로 STEP2-0(매핑·이관·게이트 제안) 후 구현.
3. 감사 프로세스: 동일 `CASE_AUDIT_CHECKLIST_v1` A~H + 1차 5문항 철학(구현은 4필드+조건부 2차) + 후보별 심화 체인.

---

*조사 일자: 2026-09-23. DQ-C05-04/05 확정 수정 이후 본 문서·`adminVerifyProfiling.ts`·`AdminVerifyFirstResultPanel.tsx` 갱신.*
