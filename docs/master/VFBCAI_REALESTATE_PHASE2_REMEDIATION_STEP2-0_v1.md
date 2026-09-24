# Real Estate VERIFY Phase2 실질화 — STEP2-0 설계 (Remediation)

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **성격** | STEP2-0 설계만. **코드 수정 없음** |
| **선행** | `VFBCAI_REALESTATE_STEP2-0_DESIGN_MAPPING_v1.md` **§1~§7 STEP2-1** 구현·PASS 후 착수. DQ R01~R06 → `VFBCAI_REALESTATE_PHASE2_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md` **LOCK** |
| **범위** | `/verify/real-estate` RE **adapter** — `realEstateVerifyProfiling.ts`, `realEstateVerifyFirstResult.ts`, `realEstateVerifyPersonalizedResult.ts`, `MasterReviewQuotationReport.tsx` RE 분기 |
| **금지** | Admin Master·CASE_01~07·`adminVerifyProfiling.ts`·`adminVerifyCase06Redesign.ts` 틀/STOP/bridge 복사. `caseNN_*` / `case06_*` 키 이름 이식 |
| **SoT 감사** | `VFBCAI_REALESTATE_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **SoT 기준 (LOCK)** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (`fa4cce9`) |
| **원칙** | **RE-native** 키·게이트·삽입 (`re_*` / `re2_*` / `re_gap*`). 입력은 `kind: "text"` (date picker 없음). text 후속은 **동일 choice 질문의 밀도** — 실질 축 +1로 세지 않음 (CASE_05/06 §3.2) |

---

## 0. 현재 (감사·STEP2-1 직후 전제)

| 구분 | 내용 |
|------|------|
| 감사 ①~④ | **FAIL** — slug·라벨만, Phase2 choice가 결과 caution/`buildActions`에 거의 미반영 |
| 감사 ⑤ | **주의** — STEP2-1 DI `other`+note로 개선 예정, numbered만 경로는 갭 유지 |
| 비율 | 조기 Phase2 종료·UNCLEAR 브릿지 전 2차 0 — **1차=2차 / 1차>2차 FAIL 후보** |
| STEP2-1 §6.3 | `clause`/`timeline`/`conflict` **항상 detail** 제거, `moneyDetail`은 `amount_unclear`만 → GAP-03·04·05·07 **악화** — 본 리메디에서 상쇄 |
| STEP2-1 §3.1 | `actions`/`responses`에서 `re_goal` 복사 제거 — **GAP-RE-DL-11**은 STEP2-1에서 처리, 리메디는 회귀 검증만 |
| STOP | `isRealEstatePhase2Complete` → `selectRealEstatePhase2MissingInfo` 유지. **본문 조건만** 확장 |

**비목표:** Entry Q1 4값 재설계, evidence upload gate 구조 변경, Fraud/Tax/Unclear, DQ-RE-08(`buildActions` 문장 목록) — 별도 Mission.

---

## 1. 데이터 손실 — GAP-RE-DL-01 ~ 08 (text 키)

공통 규칙:

- 상수 export `RE_*_TEXT_KEY` / `RE2_*_TEXT_KEY` (`realEstateVerifyProfiling.ts` 상단 키 블록).
- `extractRealEstatePhase2Answers` / Phase1 persist whitelist에 text 키 추가 (choice 목록 배열에는 넣지 않음).
- Phase1 완료·Phase2 완료·`selectRealEstateMissingInfo` / `selectRealEstatePhase2MissingInfo` early-return: 해당 `needs*Text(answers)` 참이면 **미완료**.
- Profile: `buildRealEstateSituationProfile`에서 slug 라벨 **대신** 또는 **「라벨 · text」** (text 있을 때만).
- 결과: `buildCautions` / `buildUnconfirmed` / `buildSituationSummary` — text 없으면 「확인됨」「금액 확인」류 **금지** (slug만으로 확정 표현 금지).
- UI 요약: `MasterReviewQuotationReport` RE 분기에서 parent choice + text 한 줄.

### 1.1 GAP-RE-DL-01 — `re_situationGap`

| 키 | 게이트 | 삽입 |
|----|--------|------|
| `re_gapAmountText` | `re_situationGap === amount_diff` && text 비음 | `buildRealEstateVerifyProfileQuestions`: `re_situationGap` choice 직후 |
| `re_gapDeadlineText` | `=== deadline_dispute` && text 비음 | 동일 |

label 예: 「서류와 다르게 알고 있는 금액·보증금을 적어 주세요.」 / 「겨루는 기한·인도·해지 시점을 적어 주세요.」

Profile: `money` / `dates` — text가 source field. `deadline_dispute` 고정 문구 「기한·인도 시점 분쟁」은 text 없을 때만 fallback, 있으면 text 우선.

### 1.2 GAP-RE-DL-02 — `re2_translationIssue`

| 키 | 게이트 | 삽입 |
|----|--------|------|
| `re2_translationAmountText` | `amount_diff` | `appendDocumentPhase2QuestionChain` translation choice 직후 |
| `re2_translationDateText` | `date_diff` | 동일 |

Profile `facts`: translation 라벨 + text. 결과 caution에 번역 금액/날짜 차이 **구체 문자열** 1줄 (text 있을 때).

### 1.3 GAP-RE-DL-03 — `re2_conflictFocus` (STEP2-1 §6.3 이후)

blanket `re2_conflictDetail` 대신 **slug 게이트 text**:

| 키 | 게이트 |
|----|--------|
| `re2_conflictAmountText` | `amount_written_diff` |
| `re2_conflictTimelineText` | `timeline_written_diff` |

`verbal_promise_denied` / `party_wrong_on_doc`는 STEP2-1에서 conflict detail 제거 후 **text 없이** 완료 허용 (주장 수준 slug만). ② 실질화는 §2.3 value별 **result 문장**으로 충족.

삽입: conflict focus choice 직후, `needsConflictFocusPhase2` false 이후.

### 1.4 GAP-RE-DL-04 — 일정·기한·출석

| 키 | 게이트 | 삽입 |
|----|--------|------|
| `re2_timelineAnchorText` | `re2_timelineStage` 완료 && text 비음 | timeline stage 직후 (STEP2-1에서 `needsTimelineDetailPhase2` **삭제됨** → 이 키로 대체) |
| `re2_recoveryDeadlineText` | `re2_moneyRecovery === deadline_passed` | money recovery 직후 |
| `re2_hearingScheduleText` | `re2_authorityStage === hearing_scheduled` | authority stage 직후 |

label: timeline 「기억나는 시점·경과를 적어 주세요.」 / recovery 「약속한 반환일(또는 지난 날짜)을 적어 주세요.」 / hearing 「출석·심문 일시·장소를 적어 주세요.」(장소+일시 한 칸 — **DQ-RE-R02**)

Profile `dates` / `responses`: text 우선. `re2_timelineDetail` 키는 **신규 쓰기 사용 안 함** (legacy read-only).

### 1.5 GAP-RE-DL-05 — `re2_moneySituation`

STEP2-1: `needsMoneyDetailPhase2`는 `amount_unclear`만.

| 키 | 게이트 |
|----|--------|
| `re2_moneyAmountText` | `verbal_vs_written` \| `return_unclear` \| `extra_demand` |

`amount_unclear`는 기존 `re2_moneyDetail` 유지 (모범 GAP-06 패턴).

Profile `money`: situation 라벨 + amount text 또는 moneyDetail.

### 1.6 GAP-RE-DL-06 — 유지

`not_checked_yet` → `re2_registrationDetail`. 리메디에서 **변경 없음**. 회귀만.

### 1.7 GAP-RE-DL-07 — `re2_clauseFocus`

| 키 | 게이트 |
|----|--------|
| `re2_handoverPlaceText` | `delivery_handover` |

Profile `risk`: clause 라벨 + text. 다른 clause slug는 §2.2 result 분기.

### 1.8 GAP-RE-DL-08 — 당사자·주소

| 키 | 게이트 |
|----|--------|
| `re2_partyAddressText` | `re2_translationIssue === party_name_diff` |

(Phase1 gap에 party_denies만 있고 주소 slug 없음 — translation·conflict `party_wrong_on_doc`는 §2.3 result만.)

Profile `parties` 또는 `facts`에 text 반영.

---

## 2. GAP-RE-DL-09 ~ 11 및 ①~④ 실질화

### 2.1 GAP-RE-DL-09 — match 경로 기한 축

| 옵션 | 내용 |
|------|------|
| **A (권장)** | `re_docsMatch === match`일 때는 `re_gapDeadlineText` **열지 않음**. 기한은 Phase2 `re2_timelineAnchorText`·`re2_recoveryDeadlineText`로만 구조화 |
| B | match이고 `re_goal`이 `before_response` 등일 때 Phase1 `re_deadlineConcernText` 1문항 추가 |

**권장 A** — Phase1 실질 축을 늘리지 않음.

### 2.2 GAP-RE-DL-10 — `facts` 합성 문구

| BEFORE | AFTER |
|--------|--------|
| `match` → 「서류와 상황 일치 응답」 | `docsMatch` option label 또는 `partial` label (STEP2-1 §2.3) |
| `mismatch` → 「불일치 응답」 | `re_situationGap` / `re2_conflictFocus` / translation 라벨 우선. 없으면 mismatch 라벨 |

`buildRealEstateSituationProfile` `factsValue` 합성 고정 문자열 **삭제**. legacy CRM read는 §5 fallback.

**②~④:** `partial` vs `mismatch` vs `match`가 `needsSituationGap`·`needsConflictFocus`·caution **서로 다르게** 열리도록 STEP2-1 §2.3 구현을 전제.

### 2.3 GAP-RE-DL-11 — actions/responses

STEP2-1 §3.1 구현 후: `actions` = `re2_formalResponse`만, `responses` = `re2_authorityStage`만. 리메디에서 **로직 재변경 없음**. Profile 기반 caution이 goal 없이 비면 `buildUnconfirmed`에 「공식 대응 단계」 등 **미확인 1줄** (장식 아님).

### 2.4 Phase2 기존 choice — downstream 실질화 (질문 id 추가 없음)

각 선택값이 **다음 `needs*`·Profile source·`buildCautions`/`buildUnconfirmed` 중 2개 이상** 달라져야 실질 축(②~④).

| fieldId | 실질화 요약 |
|---------|-------------|
| `re2_moneyRecovery` | 4값 → `money` 문장·caution 4종 (partial_paid / deadline_passed는 §1.4 text 연동) |
| `re2_breachFocus` | dispute별 옵션 세트 + 값별 `claims`·caution |
| `re2_formalResponse` | 4값 → `actions`·unconfirmed·caution 분기 |
| `re2_timelineStage` | 4값 → `dates` 라벨 + §1.4 anchor text 게이트 + caution 4종 |
| `re2_authorityStage` | 4값 → `responses` + hearing 시 §1.4 |
| `re2_registrationConcern` | 4값 → `rights`·다음 registration detail 게이트 |
| `re2_clauseFocus` | 4값 → `risk`·`needsMoneySituation` 분기 + §1.7 |
| `re2_moneySituation` | 4값 → money text 게이트(§1.5) + `needsMoneyRecovery` 조건 |
| `re2_docReliability` | 4값 → `documents`·caution |
| `re2_translationIssue` | 4값 → text 게이트(§1.2·1.8) + facts |
| `re2_conflictFocus` | 4값 → text 게이트(§1.3) + facts·caution |
| `re2_unclearFactLock` / bridge | bridge slug → `effectivePhase2ResolutionPath` (기존 §7). 값별 carry-over 라벨 |

신규 helper (설계): `buildRealEstatePhase2ResultCautions(answers)` — `buildCautions`가 Profile만 보던 것을 **re2 slug 직접 분기** 1층 추가. `realEstateVerifyFirstResult.ts`.

Phase1 (`re_disputeSubject`, `re_goal`, `re_docsMatch`, `re_situationGap`): 이미 `needs*` 분기 있음 → **result caution/value별 문장**만 보강 (Phase1 실질 축 +1 금지).

---

## 3. 1차=2차 · 조기 Phase2 종료

### 3.1 원인 (LEVEL 1)

`selectMinimumPhase2DeepeningMissing` (~2290): `REAL_ESTATE_PHASE2_ANSWER_KEYS` 중 **하나라도** 있으면 `null` → `selectPre/Post/Doc`가 전부 false일 때 Phase2 **즉시 완료**.

PRE 저깊이 예: `clauseFocus` 1답 후 money/conflict needs false → **2차 실질 1 vs 1차 5+**.

### 3.2 설계 — `realEstatePhase2DepthComplete(answers)`

`isRealEstatePhase2Complete` 마지막에 AND:

1. **Applicable needs:** 경로별 `needs*Phase2`가 하나라도 true면 false (기존 selector와 동일).
2. **Structured text gates:** §1 모든 `needs*Text` false.
3. **최소 깊이 (신규):** `countRealEstatePhase2SubstantiveAxes(answers) >= realEstatePhase2MinimumSubstantiveAxes(answers)`.

`countRealEstatePhase2SubstantiveAxes`: ②~④ 통과한 Phase2 **choice fieldId** 개수 (같은 id는 1). detail/text-only 키는 부모 choice 밀도.

`realEstatePhase2MinimumSubstantiveAxes(answers)`:

| effective path | 최소 Phase2 실질 축 |
|----------------|---------------------|
| `POST_DISPUTE` | **4** |
| `PRE_CONTRACT` | **4** |
| `DOCUMENT_REVIEW` | **3** |
| `UNCLEAR` (lock+bridge+native 일부) | **3** (lock, bridge, native 1+) |

`selectMinimumPhase2DeepeningMissing` **수정:** `hasPhase2Answer` 조기 `null` **삭제**. 대신 minimum 미달이면 경로별 **다음 미답 substantive 후보** 1개 반환 (`clauseFocus` → `moneySituation` → … 순은 기존 `select*Phase2MissingInfo` 우선).

UNCLEAR: Phase1 signup 전 Phase2 0 — **브릿지 미커밋 시 Phase2 incomplete** 유지 (`effectivePhase2ResolutionPath === null`이면 `isRealEstatePhase2Complete` false). (이미 부분 동작 — 명시 고정.)

### 3.3 LOCK 비율 (실질 축)

Phase1 실질 축 **보수 카운트** (리메디 설계용, VERIFIER가 경로 trace로 확정):

- **항상:** `realEstateSituationEntry`, 경로 anchor (`re_disputeSubject` / `re_docSubject` / `re_preStage` / UNCLEAR `customerInput`+lock), `re_goal`.
- **조건부 1개씩만:** `re_counterparty`, `re_propertyType`, `re_docsMatch`, `re_situationGap` — 해당 질문이 실제로 열렸고 needs/result를 바꿀 때만.

대표 POST mismatch: Phase1 실질 **5~6**. Phase2 최소 **4** + 전형 체인 **6~8** → 비 **약 1:1.3 ~ 1:1.6** (6:8) ~ **1:2** (5:10) — 3:7(≈1:2.33) **목표**는 전형 경로에서 `count` ≥ ceil(P1×7/3) 검증 (예: P1=6 → P2≥14는 **과도** — P1 보수 4로 잡으면 P2≥10 목표). **DQ-RE-R04**.

목표: VERIFIER 스팟 3경로(POST deposit+mismatch, PRE draft+mismatch, DOCUMENT mismatch)에서 실질 축 비 **3:7 하한 이상**.

---

## 4. 터치 파일 (STEP2-1 리메디)

| 파일 | 내용 |
|------|------|
| `src/lib/realEstateVerifyProfiling.ts` | §1 키·needs·질문 push·Profile·`realEstatePhase2DepthComplete`·`count*` |
| `src/lib/realEstateVerifyFirstResult.ts` | §2.4 cautions/unconfirmed/summary 분기 |
| `src/lib/realEstateVerifyPersonalizedResult.ts` | Profile 메트릭·2차 요약 동기화 |
| `MasterReviewQuotationReport.tsx` | RE text 요약·Phase2 single-focus 유지 |

**금지:** `adminVerifyProfiling.ts`, Admin 결과 패널.

---

## 5. 레거시 읽기

- 구 `re2_timelineDetail` / `re2_conflictDetail` / `re2_clauseDetail` 값 있으면: 해당 RE §1 text 키로 **읽기만** 매핑해 완료 처리. 신규 쓰기는 text 키만.
- `re_situationGapDetail` (DI): `other`+`re_situationGapNote` (STEP2-1) 우선. Detail만 있으면 note fallback.

---

## 6. DESIGN QUESTIONS — Ace 승인 LOCK (2026-09-25)

**R01=A, R02=A, R03=A, R04=A, R05=A, R06=A.** 구현 SoT는 Mission Brief. 아래는 결정 기록.

### DQ-RE-R01 — text 입력

**문제.** §1 모든 갭 키의 입력 형식.

| | 내용 |
|--|------|
| **A (권장)** | 전부 `kind: "text"`. date/number picker 없음 |
| B | 날짜·금액 전용 컨트롤 |

**권장 A.**

### DQ-RE-R02 — `hearing_scheduled` 장소·일시

**문제.** GAP-RE-DL-04 `re2_hearingScheduleText` 한 칸 vs 분리.

| | 내용 |
|--|------|
| **A (권장)** | **한 text** (일시·장소 함께). 질문 1개 유지 |
| B | `re2_hearingDateText` + `re2_hearingPlaceText` |

**권장 A.**

### DQ-RE-R03 — GAP-RE-DL-09 (match 경로 기한)

**문제.** §2.1.

| | 내용 |
|--|------|
| **A (권장)** | match 시 Phase1 기한 text 없음. Phase2만 |
| B | match + 특정 goal 시 `re_deadlineConcernText` |

**권장 A.**

### DQ-RE-R04 — 비율·Phase1 실질 축 기준

**문제.** §3.3 — P1=6이면 P2≥14가 부담.

| | 내용 |
|--|------|
| **A (권장)** | Phase1 실질 축은 **경로당 4~5(보수)** 만 카운트 (inferred property·미열림 질문 제외). Phase2는 §3.2 최소 3~4 + downstream 실질화로 **전형 경로 P2≥9~11** VERIFIER 목표 |
| B | 감사 상한 6~7 전부 P1로 세고 P2 질문 **신규 id 추가** |

**권장 A** — 질문 개수 비고정·장식 추가 금지 (LOCK).

### DQ-RE-R05 — `verbal_promise_denied` / `party_wrong_on_doc` conflict

**문제.** STEP2-1 후 conflict detail 없음.

| | 내용 |
|--|------|
| **A (권장)** | §1.3 text **없음**. §2.3 value별 caution·facts 문장만으로 실질화 |
| B | 모든 conflict focus에 공통 `re2_conflictNarrativeText` |

**권장 A.**

### DQ-RE-R06 — UNCLEAR Phase2 0 during bridge

**문제.** signup이 Phase1만으로 가능한지.

| | 내용 |
|--|------|
| **A (권장)** | **Phase2 incomplete** until lock+bridge+`re2_unclearBridgeCommitted` (기존 §7). 1차 결과는 Phase1만, 2차는 paid gate |
| B | UNCLEAR도 Phase1 완료 시 Phase2 최소 1문항 |

**권장 A** — funnel 정합 (STEP2-0 §7).

---

## 7. STEP2-1 착수 조건 (리메디)

1. RE STEP2-1 (DQ-RE-01~07) Ace 완료·`tsc` PASS  
2. §6 DQ LOCK — `VFBCAI_REALESTATE_PHASE2_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md`  
3. `npx tsc --noEmit` + product `/verify/real-estate` 브라우저 (LEVEL 3). harness는 제품 우선  
4. 감사 v1.1 또는 VERIFIER 표 — 실질 축·비율 **증거**  

---

## 8. 계획 diff 요약 (미적용)

```diff
--- a/src/lib/realEstateVerifyProfiling.ts
+++ b/src/lib/realEstateVerifyProfiling.ts
@@ keys
+export const RE_GAP_AMOUNT_TEXT_KEY = "re_gapAmountText";
+export const RE_GAP_DEADLINE_TEXT_KEY = "re_gapDeadlineText";
+export const RE2_TRANSLATION_AMOUNT_TEXT_KEY = "re2_translationAmountText";
+... (§1 전체)

@@ buildRealEstateVerifyProfileQuestions / append*Phase2QuestionChain
+  after parent choice: if needsXText(answers) push kind:text early-return

@@ buildRealEstateSituationProfile
-  synthetic match/mismatch facts strings
+  slug labels + §1 text fields; GAP-10

@@ selectMinimumPhase2DeepeningMissing
-  if (hasPhase2Answer) return null;
+  if (!realEstatePhase2DepthComplete(answers)) return nextSubstantiveCandidate(...);

@@ isRealEstatePhase2Complete
+  return ... && realEstatePhase2DepthComplete(answers);
```

```diff
--- a/src/lib/realEstateVerifyFirstResult.ts
+++ b/src/lib/realEstateVerifyFirstResult.ts
@@ buildCautions / buildUnconfirmed
+  re2_* / re_gap* value-specific lines (§2.4)
```

---

*2026-09-25. DQ-RE-R01~R06 승인 LOCK. 구현 SoT는 STEP2-1 Mission Brief. RE STEP2-1(§1~§7) PASS 후 리메디 착수. 코드 미착수.*
