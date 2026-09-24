# Real Estate VERIFY — STEP2-0 설계 매핑 보고 (코드 미변경)

| 항목 | 내용 |
|------|------|
| **전제** | STEP1 DQ-RE-01 ~ DQ-RE-07 **권장안 Ace 승인** (2026-09-24). DQ-RE-08은 DQ-RE-03 반영 후 재검토 — **이번 매핑·STEP2-1 범위 밖** |
| **SoT** | 제품: `src/lib/realEstateVerifyProfiling.ts`. 원칙: `VFBCAI_MASTER_DEVELOPMENT_SKILL_v1.2.md` §43–§44·§51, `VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` §1~§8, `VFBCAI_MASTER_HANDOFF_PRINCIPLES_v1.md` |
| **패턴** | Admin CASE_06 함수를 RE에 복사하지 않는다. DI 헬퍼(`ADMIN_DIRECT_EXPLAIN_CHOICE`, `getAdminChoiceNoteKey`, `isAdminVerifyChoiceFieldComplete`)는 **호출만** 재사용 |
| **구현** | **STEP2-1 보류** — 2번창 CASE_05, 1번창 CASE_03/04 정합성 수정이 끝난 뒤 |
| **검증** | LEVEL 1 (코드·문서 정합 설계만). 브라우저 QA 없음 |

---

## 0. 승인 DQ 요약

| DQ | 결정 |
|----|------|
| RE-01 | Phase1 `re_*` 선택 + Phase2 선택 문항 = `other` + note. 번호 그리드에 DI 없음. `cannot_classify_yet`는 하단 DI로 흡수. Entry Q1 DI는 두지 않고 `unsure` 경로 유지 |
| RE-02 | `re_disputeSubject`·사전 `re_goal`·`re_docsMatch`를 4–5+DI로 조정. 예외는 근거와 함께 이 문서에 고정 |
| RE-03 | 저장 키 `re_goal` 유지. 사후 경로의 결과·profile **표시 라벨**만 「대응 단계」. `actions`/`responses`에는 Phase2 `formalResponse`·`authorityStage`만 |
| RE-04 | `re_propertyType` = 물건/거래만. 금전·권리는 money/rights. 신규 value는 slug |
| RE-05 | 신규 저장은 slug + 표시 라벨 분리. `other_stage`·`contractStage` `"pre"`/`"post"`·facts 합성 문구·`risk.source` 고정은 **읽기 전용 fallback**. CRM 일괄 이전 없음 |
| RE-06 | `isRealEstatePhase2PathFieldsComplete` 삭제. 라이브 STOP은 `isRealEstatePhase2Complete` 하나. detail 서술은 판단 필요가 있을 때만 |
| RE-07 | UNCLEAR 브릿지 커밋 플래그는 RE 자체 키. CASE_06 bridge 함수 복사 금지. target Phase1 값 시드 금지 |

---

## 1. DQ-RE-01 — DI를 `other` + note로 통일

### 1.1 저장 규칙 (STEP2-1)

| 항목 | AFTER |
|------|--------|
| 선택 value | `"other"` (`ADMIN_DIRECT_EXPLAIN_CHOICE`) |
| note 키 | `getAdminChoiceNoteKey(fieldId)` → `{fieldId}Note` |
| 완료 | `isAdminVerifyChoiceFieldComplete`. `other`이면 note 필수 |
| UI | 번호 카드에서 DI 필터. 하단 1블록. 라벨 `ADMIN_DIRECT_EXPLAIN_LABEL` |
| 위치 | `MasterReviewQuotationReport.tsx` RE 선택 렌더 (`question.id === realEstateSituationEntry \|\| re_ \|\| re2_`) |

**신규 커밋은 `*Detail`만 쓰지 않는다.** 기존 `*Detail`은 §5 읽기 fallback.

### 1.2 Entry — DI 없음 (승인 예외)

| fieldId | 위치 | STEP2-1 |
|---------|------|---------|
| `realEstateSituationEntry` | Phase1 첫 문항, `buildRealEstateVerifyProfileQuestions` | 옵션 4개 유지. 하단 DI 없음. `unsure` = UNCLEAR 경로 |

### 1.3 Phase1 — `other` + `{fieldId}Note`

질문 생성: `buildRealEstateVerifyProfileQuestions`. 렌더: 리포트 RE 분기.

| fieldId | 현재 note 역할 | STEP2-1 note 키 | 현재 하단 DI |
|---------|----------------|-----------------|--------------|
| `re_preStage` | `re_preStageDetail` | `re_preStageNote` | 있음 (detail만 저장) |
| `re_disputeSubject` | `re_disputeSubjectDetail` | `re_disputeSubjectNote` | 있음 |
| `re_docSubject` | `re_docSubjectDetail` | `re_docSubjectNote` | 있음 |
| `re_propertyType` | `re_propertyTypeDetail` | `re_propertyTypeNote` | 있음 |
| `re_counterparty` | `re_counterpartyDetail` | `re_counterpartyNote` | 있음 |
| `re_goal` | `re_goalDetail` | `re_goalNote` | 있음 |
| `re_docsMatch` | `re_docsMatchDetail` | `re_docsMatchNote` | 있음 |
| `re_situationGap` | `re_situationGapDetail` | `re_situationGapNote` | 있음 |

`RE_PHASE1_DIRECT_EXPLAIN_CHOICE_TO_DETAIL`는 신규 쓰기에서 제거. 읽기는 §5.

### 1.4 Phase2 선택 문항 — `other` + `{fieldId}Note`

질문 생성: `pushRealEstatePhase2QuestionForMissing` / `append*Phase2QuestionChain`.

| fieldId | 현재 | STEP2-1 |
|---------|------|---------|
| `re2_registrationConcern` | DI 없음, 4옵션 | 4 + DI |
| `re2_clauseFocus` | 하단 DI → `re2_clauseDetail`, 선택 후 서술 강제 | 4 + DI. 선택 후 항상 서술 **제거** (§6) |
| `re2_moneySituation` | DI 없음. 4옵션 전부 `re2_moneyDetail` 강제 | 4 + DI. 서술은 `amount_unclear`만 (§6) |
| `re2_moneyRecovery` | DI 없음 | 4 + DI |
| `re2_breachFocus` | DI 없음 (분쟁별 4옵션) | 4 + DI |
| `re2_formalResponse` | DI 없음 | 4 + DI |
| `re2_timelineStage` | 하단 DI → `re2_timelineDetail`, 선택 후 서술 강제 | 4 + DI. 항상 서술 **제거** |
| `re2_authorityStage` | DI 없음 | 4 + DI |
| `re2_docReliability` | DI 없음 | 4 + DI |
| `re2_translationIssue` | DI 없음 | 4 + DI |
| `re2_conflictFocus` | 하단 DI → `re2_conflictDetail`, 선택 후 서술 강제 | 4 + DI. 항상 서술 **제거** |
| `re2_unclearFactLock` | DI 없음, 4옵션 | 4 + DI |
| `re2_unclearMoneyIssue` | 번호 카드 `cannot_classify_yet` | 그 카드 **삭제** → 하단 DI. 내용 3 + DI (**§2.4 예외**) |
| `re2_unclearDocAnchor` | 내용 4 + `cannot_classify_yet` | 4 + DI |
| `re2_unclearPartyFocus` | 내용 4 + `cannot_classify_yet` | 4 + DI |
| `re2_unclearTimelineFocus` | 내용 3 + `cannot_classify_yet` | 3 + DI (**§2.4 예외**) |

`RE2_PHASE2_DIRECT_EXPLAIN_CHOICE_TO_DETAIL` (clause / conflict / timeline 3키)는 신규 쓰기에서 제거.

`cannot_classify_yet`를 고른 뒤의 `re2_unclear*Detail` 두 번째 문항은 열지 않는다. 그 문장은 DI note다.

### 1.5 서술 문항으로 남기는 키 (DI 아님)

| 키 | 조건 (§6) |
|----|-----------|
| `re2_registrationDetail` | `re2_registrationConcern === not_checked_yet` 이고 note로 대체되지 않은 경우 |
| `re2_moneyDetail` | `re2_moneySituation === amount_unclear` 만 |

`re2_clauseDetail` · `re2_timelineDetail` · `re2_conflictDetail` · `re2_unclearMoneyDetail` · `re2_unclearDocDetail` · `re2_unclearPartyDetail` · `re2_unclearTimelineDetail`는 **신규 질문으로 생성하지 않는다.** 기존 값은 note fallback (§5).

---

## 2. DQ-RE-02 — 옵션 수

### 2.1 `re_disputeSubject` (현재 6 + 하단 DI)

| 유지 (5) | 그리드에서 제거 |
|----------|-----------------|
| `deposit_return`, `contract_breach`, `rent_increase`, `ownership_dispute`, `damage_penalty` | `eviction` |

**근거:** Phase2 `breachFocusOptionsForDispute("contract_breach")`에 이미 `delivery_refused`(인도·입주·명도 거부)가 있다. 퇴거·점유는 그 축이다.

**읽기:** 저장값 `eviction`은 완료로 인정하고 재질문하지 않는다. `needsMoneyRecoveryPhase2`의 eviction 분기는 구 세션용으로 유지.

**AFTER:** 내용 5 + DI.

### 2.2 사전·서류 `re_goal` (`RE_PRE_GOAL_OPTIONS`, 현재 6 + DI)

| 유지 (5) | 그리드에서 제거 |
|----------|-----------------|
| `requirements`, `missing_docs`, `risk_terms`, `translation`, `notary` | `full_review` |

**근거:** 「처음부터 끝까지 전체 점검」은 단일 축이 아니라 DI가 받는 탈출이다.

**읽기:** 저장값 `full_review`는 완료로 인정. `phase1GoalNeedsClauseDepth` / `phase1GoalNeedsRegistrationDepth` / `phase1PreContractIsLowDepth`의 `full_review` 조건은 **구 slug용으로 유지**.

사후 `RE_POST_GOAL_OPTIONS`는 이미 5개. DI만 §1대로 붙인다. 라벨은 §3.

**AFTER:** 내용 5 + DI.

### 2.3 `re_docsMatch` (현재 3 + DI)

| value | 라벨 방향 (STEP2-1 문구는 기존 문장 톤 유지) |
|-------|-----------------------------------------------|
| `match` | 유지 |
| `partial` | **신설.** 일부 조항·금액·당사자만 다르고 나머지는 같다 |
| `mismatch` | 유지 |
| `unknown` | 유지 |
| DI | `other` + `re_docsMatchNote` |

**근거:** 일치/불일치/미비교는 3치라 4번째를 지어내면 추상 선택지가 된다. `partial`은 전부 불일치와 달라 `needsSituationGapQuestion`을 `mismatch`와 같이 연다. 5번째 내용 선택지는 두지 않는다.

**AFTER:** 내용 4 + DI.

### 2.4 예외 (DQ-RE-01 흡수 결과) — Ace 승인에 포함

| fieldId | AFTER | 근거 |
|---------|-------|------|
| `realEstateSituationEntry` | 내용 4, DI 없음 | DQ-RE-01. `unsure`는 경로 |
| `re2_unclearMoneyIssue` | 내용 3 + DI | 브릿지 축 선택. 4번째 내용 선택지는 없음 |
| `re2_unclearTimelineFocus` | 내용 3 + DI | 동일 |

이 세 필드는 §8 「4–5+DI」의 **명시 예외**다. STEP2-1에서 선택지를 늘려 맞추지 않는다.

---

## 3. DQ-RE-03 — `re_goal` 표시 라벨 분리

저장 키·slug는 유지한다. 질문 문구는 이미 경로별로 맞으므로 바꾸지 않는다.

| 경로 | 질문 (유지) | 옵션 배열 | 표시 라벨 AFTER |
|------|-------------|-----------|-----------------|
| `PRE_CONTRACT`, `DOCUMENT_REVIEW` | `goalQuestionLabel` 「무엇을 가장 먼저 확인하고 싶으신가요?」 | `RE_PRE_GOAL_OPTIONS` (§2.2로 5+DI) | **확인 목적** |
| `POST_DISPUTE` | 「어떤 단계에서 대응하고 있나요?」 | `RE_POST_GOAL_OPTIONS` | **대응 단계** |
| `UNCLEAR` (fact lock 전) | 목표 문항이 경로 확정 후에만 | effective path가 POST이면 **대응 단계**, 그 외 **확인 목적** | |

### 3.1 라벨을 바꿀 호출 (STEP2-1)

| 위치 | 현재 고정 문구 |
|------|----------------|
| `buildRealEstatePhase1CarryOverLines` | 「확인 목적」 |
| `buildRealEstateDiagnosisDescription` | `[확인 목적]` |
| `buildSituationSummary` (`realEstateVerifyFirstResult.ts`) | `확인 목적:` |
| `buildRealEstateFirstResult` keyMetrics | 「확인 목적」 / 「검토 목적」 |
| `buildRealEstatePersonalizedContext` (`realEstateVerifyPersonalizedResult.ts`) | 「확인 목적」 |

경로는 `getRealEstateResolutionPath`. 사후만 「대응 단계」. 내부 필드 이름은 `goal` 유지.

### 3.2 `actions` / `responses`에서 goal 제거

`buildRealEstateSituationProfile` AFTER:

| 필드 | 값 | source |
|------|----|--------|
| `actions` | `re2_formalResponse` 라벨만. 없으면 빈 값 | `re2_formalResponse` |
| `responses` | `re2_authorityStage` 라벨만. 없으면 빈 값 | `re2_authorityStage` |
| `goal` | `re_goal` 라벨 또는 note | `re_goal` / `re_goalNote` |

사후 `re_goal`을 `actions`·`responses`에 복사하지 않는다.

**DQ-RE-08:** 1차 `buildActions` 고정 3문장은 이 라벨 반영 후 별도 검토. STEP2-1에서 그 함수의 문장 목록을 바꾸지 않는다.

---

## 4. DQ-RE-04 — `re_propertyType` 축 분리

### 4.1 신규 선택 (물건/거래만, 4 + DI)

| slug | 표시 (기존 문장 유지·개발 축만 추가) |
|------|--------------------------------------|
| `sale` | 집·토지를 사거나 팔려는 상황입니다 |
| `residential_lease` | 전세·월세로 집을 빌리거나 빌려주는 상황입니다 |
| `commercial_lease` | 상가·사무실 등 비주거 공간 임대가 관련됩니다 |
| `land_development` | 토지·신축·개발이 관련됩니다 |
| `other` | DI → `re_propertyTypeNote` |

**근거:** Skill §43의 개발/건축은 별도 축이다. `계약금`·`소유권`은 물건 유형이 아니다.

그리드에서 제거: value `매매`, `임대`, `상가`, `계약금`, `소유권`.

### 4.2 추론 맵 AFTER

| 맵 | AFTER |
|----|--------|
| `DISPUTE_TO_PROPERTY` | `deposit_return`, `rent_increase` → `residential_lease`. `ownership_dispute`는 **property에 넣지 않음** (rights). `contract_breach`·`damage_penalty`는 추론하지 않고 물건 질문을 연다 |
| `DOC_TO_PROPERTY` | `sale_contract` → `sale`. `lease_contract`는 주거/상가를 가르지 못하므로 **추론하지 않음**. `registration_doc` → property 아님 (rights). `payment_receipt` → property 아님 (money) |
| `PRE_STAGE_TO_PROPERTY` | `deposit_agreed` → property 아님 (money 추론만, 현행 `계약금` 토큰 제거) |

### 4.3 구 value 읽기 (재질문 없음)

| 저장 value | 읽기 |
|------------|------|
| `매매` | slug `sale`로 해석 |
| `임대` | `residential_lease` |
| `상가` | `commercial_lease` |
| `계약금` | property 재질문 없음. money 추론 「계약금·보증금 관련」 유지. 화면 라벨은 구 라벨 |
| `소유권` | property 재질문 없음. rights 「소유권·등기 관련」 |

신규 쓰기는 slug만. Profile 표시는 `optionLabel(slug)`.

---

## 5. DQ-RE-05 — 레거시 / 죽은 slug

CRM 행 이전·일괄 마이그레이션 없음. 신규 스냅샷만 slug를 `profile.value`에 두고, 화면은 `optionLabel` 또는 note 원문.

| 대상 | 신규 저장 | 읽기 전용 fallback |
|------|-----------|-------------------|
| `other_stage` (`seedRealEstateAnswersFromExternal`의 「기타」) | 쓰지 않음. 시드는 `re_goal=other` + note(원문) 또는 note가 없으면 `other`와 빈 note로 두지 않고 **시드 자체를 생략** (재질문 1회는 신규 세션만) | 이미 `re_goal===other_stage`이면 STOP 완료. 표시 「직접 입력 (이전 응답)」. raw `other_stage`를 화면에 내지 않음 |
| `contractStage` `"pre"` / `"post"` | `reviewStage` 토큰을 `contractStage.value`에 넣지 않음. 값은 `re_preStage` 라벨 또는 빈 값 | 복원값이 정확히 `pre` 또는 `post`이면 표시하지 않고 답 키에 다시 쓰지 않음 |
| facts `"서류와 상황 일치 응답"` / `"불일치 응답"` | `facts.value` = `re_docsMatch` slug (`match`/`partial`/`mismatch`/`unknown`) 또는 note | 기존 두 문장 → `match` / `mismatch` (`reverseOptionValue`·`restoreAnswerFromProfileField` 유지) |
| `risk.source` 항상 `re_docsMatch` | source = 값을 만든 키 (`re2_clauseFocus`, `re2_docReliability`, `re_situationGap`, `re_preStage`, `re_docsMatch` 중 실제 출처) | source가 `re_docsMatch`인데 값이 서류 대조 라벨·slug가 아니면 `re_docsMatch`에 대입하지 않음 |
| `claims.source` 기본 `re_disputeSubject` | source = 실제 키 (`re_disputeSubject`, `re_docSubject`, `re_preStage`, `re2_breachFocus`, unclear 키) | 불일치 source면 그 키에 강제 대입하지 않음 |
| `*Detail` (DI로 쓰이던 키) | 신규 쓰기 없음 | choice가 비었고 Detail만 있으면 `other` + 해당 `{fieldId}Note`로 읽어 완료 처리. Detail을 다시 쓰지 않음 |
| 한국어 property 토큰 | §4.3 | §4.3 |

`mapRealEstateAnswersToLegacyState`의 `reviewStage` / `incidentType` / `reviewFocus`는 CRM 호환 **출력**으로만 유지. `incidentType`에는 신규 slug를 넣고, 구 토큰 세션은 읽은 slug를 내보낸다. 레거시 질문을 퍼널 질문으로 되돌리지 않는다.

---

## 6. DQ-RE-06 — STOP 하나

### 6.1 삭제

`isRealEstatePhase2PathFieldsComplete` — 정의만 있고 호출 없음 (`realEstateVerifyProfiling.ts`). 최소 심화(`selectMinimumPhase2DeepeningMissing`)를 포함하지 않아 라이브 STOP과 어긋난다. **함수 삭제.** 두 번째 boolean을 만들지 않는다.

### 6.2 라이브 STOP (유지·조건만 수정)

`isRealEstatePhase2Complete` → `selectRealEstatePhase2MissingInfo`.

Phase1 STOP은 `isRealEstatePhase1Complete` → `isRealEstateProfilingComplete` 유지. 선택 완료는 `isAdminVerifyChoiceFieldComplete` + §5 fallback.

### 6.3 detail `needs*` AFTER

| 함수 | AFTER |
|------|--------|
| `needsRegistrationDetailPhase2` | `not_checked_yet` 이고 `re2_registrationDetail` 비어 있음. 유지 |
| `needsMoneyDetailPhase2` | **`amount_unclear`만.** `verbal_vs_written` / `return_unclear` / `extra_demand`는 서술 문항을 열지 않음 |
| `needsClauseDetailPhase2` | **삭제.** 항상 true 제거 |
| `needsTimelineDetailPhase2` | **삭제.** |
| `needsConflictDetailPhase2` | **삭제.** 선택 후 항상, 그리고 mismatch+gap 강제도 제거 (Phase1 gap 재질문 금지) |
| `needsUnclearBridgeMaterialDetailPhase2` | `cannot_classify_yet` 분기 **삭제.** 브릿지 필드가 `other`이고 note가 비면 그 선택 문항이 미완료 (별도 structured detail 아님) |

`getActiveRealEstatePhase2StructuredDetailKey`는 `re2_registrationDetail`·`re2_moneyDetail`만 반환.

`selectMinimumPhase2DeepeningMissing`은 라이브 selector 안에만 둔다. Phase2 답 0건일 때 경로별 1문항은 유지.

---

## 7. DQ-RE-07 — UNCLEAR 브릿지 커밋 플래그

Admin `isCase06BridgedToNativeCase` / `seedCase02AnswersFromCase06Handoff`는 **호출·복사하지 않는다.**

### 7.1 키

| 키 | 값 | 저장 |
|----|----|------|
| `re2_unclearBridgeCommitted` | `"1"` | `extractRealEstatePhase2Answers`가 `re2_*`를 phase2 JSON에 넣으므로 동일 경로. 별도 CRM 컬럼 없음 |

### 7.2 커밋 조건

경로가 `UNCLEAR`이고 아래가 모두 참일 때만 `"1"`을 쓴다.

1. `re2_unclearFactLock`이 완료 (`other`면 note 포함)
2. fact lock이 요구하는 브릿지 1문항(`re2_unclearMoneyIssue` / `DocAnchor` / `PartyFocus` / `TimelineFocus`)이 완료
3. 그 완료는 내용 slug 또는 `other`+note

target의 `re_disputeSubject`·`re_docSubject`·`re_counterparty`·`re_preStage`는 **시드하지 않는다.**

### 7.3 게이트

`effectivePhase2ResolutionPath`는 **플래그가 `"1"`일 때만** `document_status` → `DOCUMENT_REVIEW`, 그 외 lock → `POST_DISPUTE`를 반환한다. 플래그 전에는 `null`.

그래서 `selectPre/Post/DocumentPhase2MissingInfo`와 `selectMinimumPhase2DeepeningMissing`은 브릿지 미커밋 시 native Phase2를 열지 않는다. 순서는 fact lock → bridge → (note) → **커밋** → native chain.

### 7.4 읽기

phase2 JSON에 브릿지 답이 완료 조건과 같은데 플래그가 없으면, **읽을 때만** 커밋된 것으로 간주하고 재질문하지 않는다. 그 값을 새 쓰기로 되돌리는 마이그레이션은 하지 않는다. 이후 저장이 같은 세션에서 일어나면 그때 `"1"`을 기록해도 된다.

---

## 8. 영향 범위

| 파일 | STEP2-1에서 할 일 | 이번 커밋 |
|------|-------------------|-----------|
| `src/lib/realEstateVerifyProfiling.ts` | §1–§7 | 수정 없음 |
| `src/lib/realEstateVerifyFirstResult.ts` | §3 라벨만. `buildActions` 문장 목록은 DQ-RE-08까지 유지 | 수정 없음 |
| `src/lib/realEstateVerifyPersonalizedResult.ts` | §3 메트릭 라벨 | 수정 없음 |
| `MasterReviewQuotationReport.tsx` | RE DI 커밋을 `other`+Note로 | 수정 없음 |
| `src/app/verify/real-estate/page.tsx` | 레거시 질문 UI를 되살리지 않음. 시드가 `other_stage`를 넣지 않게 §5만 | 수정 없음 |
| `adminVerifyProfiling.ts` CASE_01–06 | **변경 없음** | |
| QA | product URL 흐름. harness 시드가 옛 slug면 §6 절차로 harness 수정. 제품 우회 금지 | 이번 단계 실행 없음 |

---

## 9. REUSABLE PATTERNS (STEP2-1 예정)

| § | 판정 | 메모 |
|---|------|------|
| 1 DI | **PASS (설계)** | §1 필드 목록. Entry는 승인 예외 |
| 2 CTA | **N/A** | `hideVerifyMasterQuestionRailCtas` 유지. 필드 변경으로 rail 정책을 바꾸지 않음 |
| 3 재분류 | **주의** | Q1 경로 고정 유지. 추론 맵은 §4. effective path는 §7 플래그 후 |
| 4 Bridge | **PASS (설계)** | RE 플래그. CASE_06 함수 복사 없음. 미커밋 시 native Phase2 금지 |
| 5 STOP | **PASS (설계)** | 미사용 path-complete 삭제. detail은 §6.3 |
| 6 Harness | **주의** | 구현 후 product vs harness 분리. 이번 문서는 버그 분류 없음 |
| 7 Legacy | **PASS (설계)** | §5 fallback. orphan 신규 쓰기 금지 |
| 8 옵션 수 | **PASS (설계)** | §2. §2.4 세 필드만 예외 |

---

## 10. STEP2-1 착수 조건

1. 2번창 CASE_05 STEP2 완료  
2. 1번창 CASE_03/04 정합성 수정 완료  
3. 그 다음에만 이 문서 §1→§7 순으로 **한 번** 구현  
4. DQ-RE-08은 §3이 코드에 반영된 뒤 별도 검토  
5. `npx tsc --noEmit` + product 브라우저 (LEVEL 3). harness 단독 PASS로 완료 선언 금지  

---

*2026-09-24. STEP2-0 — 구현 없음. STEP2-1은 CASE_05·CASE_03/04 창 이후.*
