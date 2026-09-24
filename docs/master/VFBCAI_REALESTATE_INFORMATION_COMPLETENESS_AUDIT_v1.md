# Real Estate VERIFY — Information Completeness Audit

| 항목 | 내용 |
|------|------|
| **범위** | 감사만. 코드 미변경 |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (`fa4cce9`). 완화·재해석 없음 |
| **증거** | LEVEL 1. `src/lib/realEstateVerifyProfiling.ts` (질문·`needs*`·Profile·Phase2 STOP), `realEstateVerifyFirstResult.ts` / `realEstateVerifyPersonalizedResult.ts` (1·2차 결과 문장) |
| **설계 참고** | `VFBCAI_REALESTATE_STEP2-0_DESIGN_MAPPING_v1.md` §11 (갭 ID 동일). **승인 STEP2-1(§1~§7)** 은 본 감사의 **수정 범위가 아님** — 구현 후 §8.2 재평가 |
| **브라우저** | 하지 않음 |

조사일: 2026-09-25. Admin CASE_05·CASE_06 감사와 동일 축으로 추적한다.

**증거 게이트:** Phase1·Phase2 **파일 첨부**는 `_realEstateEvidenceAttached` / `RE_PHASE1_EVIDENCE_FILE_NAME_KEY` / Phase2 meta (`REAL_ESTATE_PHASE2_EVIDENCE_*`). 선택지가 “어떤 파일을 요구”하는 gate는 없다. 표의 「증거」는 Profile `evidence` 칸·첨부 여부·미확인 목록에 미치는지이다.

**Profile SoT:** `buildRealEstateSituationProfile`. 1차 결과 `buildRealEstateFirstResult`는 Profile 요약·`buildCautions`·`buildUnconfirmed`·고정 `buildActions`(경로별 3문장)를 쓴다. **개별 `re2_*` 선택마다 다른 caution 문장**이 나오는 구조가 아니다.

**Phase2 UI:** `buildRealEstatePhase2ProfileQuestions`는 `selectRealEstatePhase2MissingInfo` **한 focus**만 push한다 (Admin Master 단일 focus). 완료는 답을 채운 뒤 다음 missing을 반복한다. `selectMinimumPhase2DeepeningMissing`은 Phase2 답이 **0건**일 때만 최소 1문항을 연다.

---

## 0. 현행 Phase1 / Phase2 질문 목록

### 0.1 공통·경로

| 단계 | fieldId | kind | 조건 |
|------|---------|------|------|
| Phase1 | `realEstateSituationEntry` | choice 4 | 항상 첫 문항 |
| Phase1 | `realEstateCustomerInput` | text | `unsure` 또는 `needsCustomerInputQuestion` |
| Phase1 | `re_preStage` | choice 4+DI | `PRE_CONTRACT` |
| Phase1 | `re_disputeSubject` | choice 6+DI | `POST_DISPUTE` |
| Phase1 | `re_docSubject` | choice | `DOCUMENT_REVIEW` |
| Phase1 | `re_propertyType` | choice 5+DI (한글 토큰 legacy) | 추론 불가 시 |
| Phase1 | `re_counterparty` | choice | PRE·POST |
| Phase1 | `re_goal` | choice 6+DI (PRE/POST 옵션 분기) | goal 미해결 |
| Phase1 | `re_docsMatch` | choice 3+DI | `needsDocsMatchQuestion` |
| Phase1 | `re_situationGap` | choice 5+DI | `re_docsMatch === mismatch` 만 |

Phase1 evidence: signup 전 간이 첨부 파일명 키 (`RE_PHASE1_EVIDENCE_FILE_NAME_KEY`) — 질문 체인 밖.

### 0.2 Phase2 — 경로별 체인 (`append*Phase2QuestionChain` / `select*Phase2MissingInfo`)

**UNCLEAR** (`effectivePhase2ResolutionPath`는 fact lock·`re2_unclearBridgeCommitted` 전 `null`):

1. `re2_unclearFactLock`
2. 브릿지 1문항: `re2_unclearMoneyIssue` / `DocAnchor` / `PartyFocus` / `TimelineFocus` (lock에 따름)
3. `cannot_classify_yet` 시 structured detail (`re2_unclear*Detail`) — 현행
4. 브릿지 커밋 후 native path 체인

**PRE_CONTRACT** (`selectPrePhase2MissingInfo` 순):

`re2_registrationConcern` → `re2_registrationDetail`(조건부) → `re2_clauseFocus` → `re2_clauseDetail`(조건부) → `re2_moneySituation` → `re2_moneyDetail`(조건부) → `re2_conflictFocus` → `re2_conflictDetail`(조건부)

**POST_DISPUTE**:

`re2_moneyRecovery` → `re2_breachFocus` → `re2_formalResponse` → `re2_timelineStage` → `re2_timelineDetail`(조건부) → `re2_authorityStage` → `re2_conflictFocus` → `re2_conflictDetail`(조건부)

**DOCUMENT_REVIEW**:

`re2_docReliability` → `re2_translationIssue` → `re2_conflictFocus` → `re2_conflictDetail`(조건부)

각 `needs*`는 경로·Phase1·이미 채운 `re2_*`에 따라 **문항 자체가 안 열리는** 경우가 많다. 화면 최대 문항 수 ≠ 모든 사용자에게 동일.

---

## 1. Phase1 — 선택지 downstream (요약 표)

감사 표 열: Profile · 다음 질문(`needs*`·Phase2 path) · 증거(첨부/Profile `evidence`) · 결과(`buildRealEstateFirstResult` caution/unconfirmed/summary).

### 1.1 `realEstateSituationEntry`

| 선택지 | Profile | 다음 질문 | 증거 | 결과 |
|--------|---------|-----------|------|------|
| `pre_contract` / `post_dispute` / `document_review` | `transaction` 라벨 | 해당 path Phase1 질문 세트 | 첨부만 | `pathStageLabel`·`buildActions` 경로 분기 |
| `unsure` | transaction | `customerInput` → 텍스트 추론 또는 `UNCLEAR` | 동일 | UNCLEAR는 고정 actions 3문장 |

**실질 축:** 4값은 경로를 갈라 Phase1·Phase2 전체를 바꾼다 → **실질 1**.

### 1.2 `re_disputeSubject` (POST)

| 선택지 | Profile `claims`·`money` 추론 | Phase2 `needs*` | 결과 |
|--------|------------------------------|-----------------|------|
| `deposit_return` | 보증금 분쟁 라벨 | `moneyRecovery` 항상, `breachFocus` 없음, `timeline` 종종 | POST caution: claims 라벨 + 동일 템플릿 |
| `contract_breach` / `damage_penalty` / `rent_increase` | 분쟁 라벨 | `breachFocus` (옵션 세트 분기), `moneyRecovery` 보통 false | 동일 템플릿 |
| `ownership_dispute` / `eviction` | 라벨 | breach/recovery 조합 다름 | 동일 템플릿 |
| DI (`*Detail`) | note 문장 | 동일 축 | 동일 |

**판별력:** Phase2 **열림**은 갈라진다. **1차 결과 문장**은 `profile.claims` 라벨만 바뀌고 caution 문장 골격은 같다 → ② **주의**.

### 1.3 `re_docsMatch`

| 선택지 | Profile | 다음 질문 | 결과 |
|--------|---------|-----------|------|
| `match` | documents 라벨 | `situationGap` **안 열림**. PRE에서 registration/clause 조건 축소 | summary에 서류 상태 |
| `mismatch` | facts 합성 「불일치 응답」 | `situationGap` **열림**. Phase2 `conflictFocus` 후보 | `buildCautions` facts·DOCUMENT 경로 caution |
| `unknown` | 미비교 | `customerInput` 길이 조건 | documents 미확인 |
| DI | note | 동일 | 동일 |

`partial` slug는 **현행 코드에 없음** (STEP2-0 §2.3 예정).

### 1.4 `re_situationGap` (mismatch 시만)

| 선택지 | Profile `facts`·`money`·`dates` | Phase2 | 결과 |
|--------|-----------------------------------|--------|------|
| `amount_diff` | gap 라벨 | `moneySituation`·`moneyRecovery` 후보 | facts caution에 gap 라벨 |
| `deadline_dispute` | dates: 「기한·인도 시점 분쟁」 **slug 고정 문구** | `needsDisputeTimelinePhase2` true | **날짜 원문 없음** → GAP-RE-DL-01 |
| `party_denies` / `missing_doc` / `translation_error` | gap 라벨 | doc reliability / translation / clause·money 조건 | gap 라벨 수준 |

**장식 후보:** gap 5값 중 일부는 같은 Phase2·같은 caution → ③·④ 후보.

### 1.5 `re_goal` · `re_preStage` · `re_docSubject` · `re_propertyType` · `re_counterparty`

- **`re_goal`:** `needsFormalResponsePhase2`·`phase1GoalNeedsClauseDepth`·`phase1GoalNeedsRegistrationDepth`·PRE low depth 등 **Phase2 needs 다수 분기**. Profile `goal`·`actions`/`responses` 합성. 결과 `buildActions`는 **경로만** 보며 goal slug별 문장 차등 **없음** (DQ-RE-08).
- **`re_preStage`:** `needsDocsMatch`·`needsClauseFocus`·`needsMoneySituation`·contractStage Profile.
- **`re_docSubject`:** DOCUMENT Phase2 doc reliability 조건·documents Profile.
- **`re_propertyType`:** 추론·money inferred 「계약금·보증금」·property Profile. **금액 숫자 키 없음**.
- **`re_counterparty`:** `needsAuthorityStagePhase2` (`authority_court`). parties Profile.

Phase1 **실질 축(경로당 대표):** entry(1) + path anchor(1) + property(0~1) + counterparty(1) + goal(1) + docsMatch(0~1) + situationGap(0~1) ≈ **5~7** (UNCLEAR는 entry + customerInput text 중심으로 **choice 실질 1~2**).

---

## 2. Phase2 — 선택지 downstream (요약)

### 2.1 POST — `re2_moneyRecovery` / `re2_breachFocus` / `re2_formalResponse`

| fieldId | Profile | 다음 `needs*` | 결과 차등 |
|---------|---------|---------------|-----------|
| `re2_moneyRecovery` | `money` 라벨 | timeline·authority 조건 | caution 직접 분기 **약함** |
| `re2_breachFocus` | `claims` | timeline (breach 시) | POST claims caution (템플릿 동일) |
| `re2_formalResponse` | `actions` | authority 일부 | summary `actions` 합성 |

### 2.2 `re2_timelineStage` + `re2_timelineDetail`

- Stage 4 slug: `dates`에 **라벨만** (`just_started` … `legal_started`).
- `needsTimelineDetailPhase2`: stage 있으면 **항상** detail text 요구 (현행).
- **날짜·기한 숫자/원문 키 없음** — detail은 자유 서술 1칸. GAP-RE-DL-04.

### 2.3 `re2_moneySituation` + `re2_moneyDetail`

- 현행: `verbal_vs_written` · `return_unclear` · `extra_demand` · `amount_unclear` **네 값 모두** `moneyDetail` 강제.
- Profile `money`: situation 라벨 ± detail 문자열.
- **금액 숫자 전용 키 없음** — GAP-RE-DL-05 (승인 STEP2-1 §6.3은 4→1로 축소 예정).

### 2.4 `re2_translationIssue`

| slug | Profile `facts` | 값 저장 |
|------|-----------------|--------|
| `amount_diff` / `date_diff` | translation 라벨 | slug만 — GAP-RE-DL-02 |
| `party_name_diff` | 라벨 | 주소·명의 문자열 키 없음 — GAP-RE-DL-08 |
| `obligation_diff` | 라벨 | slug만 |

### 2.5 `re2_conflictFocus` + `re2_conflictDetail`

- Focus 4값: `facts`·risk 합성. `amount_written_diff` / `timeline_written_diff`는 **구조화 금액·날짜 없음** — GAP-RE-DL-03.
- 현행: focus 선택 시 **항상** `conflictDetail` text. mismatch+gap만으로도 detail 강제 가능.

### 2.6 PRE — `re2_registrationConcern`

- `not_checked_yet` → `re2_registrationDetail` text (**양호 패턴**, GAP-RE-DL-06).
- 그 외 slug는 detail 없이 완료.

### 2.7 UNCLEAR 브릿지

- `re2_unclearFactLock` → bridge choice → `cannot_classify_yet` 시 `re2_unclear*Detail` (현행).
- `resolvedDisputeSubject` 등은 **Phase2 bridge slug를 Phase1 `re_*`에 시드하지 않음** (원칙 F 유사). 타겟 질문 skip 없음.
- 브릿지 미커밋 시 `effectivePhase2ResolutionPath === null` → native POST/PRE/DOC Phase2 **잠금** → 2차 깊이가 브릿지+lock에 묶임.

---

## 3. 증거 (Evidence)

| 항목 | 내용 |
|------|------|
| Phase1 첨부 | 파일명/플래그만 Profile `evidence` 「첨부 자료 있음」 |
| Phase2 첨부 | meta 키로 restore. **질문 완료 조건과 choice 무관** |
| 감사 ② | 증거 요구가 선택지별로 갈라지지 않음 → **해당 열은 대부분 동일** |

---

## 4. 결과 문장 (`realEstateVerifyFirstResult.ts`)

| 소스 | choice별 분기 |
|------|----------------|
| `buildSituationSummary` | Profile 필드 조합. `re2_*` 개별 slug 직접 참조 없음 |
| `buildCautions` | `risk`·`facts`·path·`claims`·documents 부분 문자열. **breach/money recovery 옵션별 고유 caution 없음** |
| `buildUnconfirmed` | property/parties/documents/goal/customerInput 공백·unknown |
| `buildActions` | **경로 4종 고정 3문장** (goal·Phase2 무관, DQ-RE-08) |
| keyMetrics | property·parties·goal·documents — Phase2 세부 slug 미반영 |

**결론:** 많은 Phase2 choice는 Profile **라벨 1칸**만 바꾸고, 1차 결과의 caution/action **문장 집합은 거의 동일** → Admin CASE_06 체인과 유사한 ②·④ **FAIL 압력**.

---

## 5. LOCK — 1차 vs 2차 실질 축·비율

비율은 **②~④ 통과 실질 축**만 센다. text detail(`re2_*Detail`, `customerInput`)은 해당 **choice 질문의 밀도**로만 취급하고, 별도 실질 축 +1은 **원칙상** CASE_05 §3.2와 같이 slug 질문을 늘리지 않는다.

### 5.1 실질 축으로 인정하는 것 (코드 추적)

- Phase1: 경로 분기·Phase2 `needs*`를 바꾸는 choice (`entry`, dispute/doc/pre, goal, docsMatch, situationGap, property/counterparty가 needs를 바꿀 때).
- Phase2: `needs*` 체인에서 **다음 문항**을 바꾸는 choice. Profile `claims`/`money`/`dates`/`facts` **소스 키**가 바뀌는 것.

### 5.2 실질 축 제외·장식 후보

- `re2_timelineStage` 4값: 서로 다른 needs는 같고 `dates` 라벨만 미세 변경 → **1 실질 축** 또는 장식.
- `re2_formalResponse` 4값: `actions` 라벨만, `buildActions` 고정.
- Phase1 `re_docsMatch`의 `uncertain` vs `unknown`: Phase2 동일.
- 결과 caution이 동일한 dispute slug들.

### 5.3 대표 경로 비 (LEVEL 1 추정)

| 경로 | Phase1 실질 축 (추정) | Phase2 실질 축 (최소~전형) | LOCK 관계 |
|------|----------------------|----------------------------|-----------|
| POST `deposit_return`, mismatch+amount_diff, goal 협의 중 | 6~7 | 4~6 (recovery, timeline+detail, formal, conflict…) | **3:7 후보** — 전형 경로는 2차가 더 깊을 수 있음. caution 동일하면 ②는 여전히 주의 |
| POST `contract_breach`, match, gap 없음 | 5~6 | 2~4 (breach, timeline+detail, formal…) | **1:1~1:2 FAIL 후보** (2차 최소 deepening만 채우고 조기 종료 시) |
| PRE `draft_received`, mismatch | 6~7 | 3~7 (reg, clause+detail, money+detail, conflict…) | 비는 경로 의존. registration skip 시 얕음 |
| DOCUMENT mismatch | 5~6 | 2~4 (doc, translation, conflict+detail) | translation `date_diff` slug만 → ①·갭 |
| UNCLEAR (lock+bridge 후 POST 전환) | 1~2 (+ customerInput) | 3~5 (lock, bridge, native 일부) | 브릿지 전 Phase2 **0** — Phase1만으로 signup 가능. **1차>2차·비율** 위험 |

**조기 Phase2 종료:** `selectMinimumPhase2DeepeningMissing` 이후 **하나의** `re2_*`만 답하고 `select*Phase2MissingInfo`가 연속으로 `null`이 되는 조합이 있으면 2차 실질 축이 1에 머무를 수 있다 → **1차 = 2차 무조건 FAIL** 후보.

**3:7~4:6 하한:** 전 경로 **PASS 확정 불가** (NOT VERIFIED). 전형 POST 분쟁 경로는 문항 수상 2차가 많아 **하한을 넘을 가능성**은 있으나, **장식·결과 미분기**가 많으면 실질 축 카운트는 하한 **아래**로 떨어질 수 있다.

---

## 6. 기준 ①~⑤ (현행 코드)

| 기준 | 판정 | 근거 |
|------|------|------|
| ① 정보 완결성 | **FAIL** | 금액·날짜·장소·일정을 「안다/다르다」는 **slug·라벨**에서 끝남. §7 갭. expert가 숫자·날짜·주소를 답변 키에서 읽을 수 없음 |
| ② 다중 신호성 | **FAIL** | Phase2 다수 choice가 Profile 라벨 1칸·`needs*` 일부만 바꿈. 결과 caution/actions는 경로 수준. 증거 gate choice 무관 |
| ③ 선택지 판별력 | **FAIL** | 동일 질문 내 옵션이 같은 다음 질문·같은 caution 템플릿으로 합쳐짐 (timeline stage, formal response, dispute caution 등) |
| ④ 비장식성 | **FAIL** | ③ 미분기 옵션 다수. Phase1 `docsMatch` unknown·일부 goal slug |
| ⑤ 직접입력 의존 | **주의** | 하단 DI·`*Detail`·`customerInput`이 보완 경로. **정상 numbered만**으로 핵심 금액·날짜가 구조화되지 않음 → ①과 연동 |

**종합:** 현행 RE VERIFY 정보완결성 **PASS 불가** (LOCK).

---

## 7. 데이터 손실·구조화 갭 (리메디 입력)

Admin CASE_03/04/05/06 `specific_date` / `exact_*` **동종**: choice는 했는데 **전용 값 키에 저장되지 않음**.

| 갭 ID | 위치 | 선택(주장) | 실제 저장 | Profile/결과 | 비고 |
|-------|------|------------|-----------|--------------|------|
| **GAP-RE-DL-01** | `re_situationGap` | `amount_diff`, `deadline_dispute` | slug(+DI note만) | money/dates 라벨·고정 문구 | STEP2-0 §11.3 |
| **GAP-RE-DL-02** | `re2_translationIssue` | `amount_diff`, `date_diff` | slug | `facts` 라벨 | |
| **GAP-RE-DL-03** | `re2_conflictFocus` | `amount_written_diff`, `timeline_written_diff` | slug; detail은 별도 text | `facts` | 승인 STEP2-1 §6.3 detail 삭제 시 **악화** |
| **GAP-RE-DL-04** | `re2_timelineStage`, `re2_moneyRecovery`=`deadline_passed`, `re2_authorityStage`=`hearing_scheduled` | 일정·기한·출석 | stage/recovery slug; detail은 자유 text 1개(현행 timeline만) | `dates`/`responses` 라벨 | **날짜·장소 구조화 키 없음** |
| **GAP-RE-DL-05** | `re2_moneySituation` | 4 money slug | 현행 4종 detail 강제; 승인 후 `amount_unclear`만 | `money` 문자열 | **금액 숫자 키 없음** |
| **GAP-RE-DL-06** | `re2_registrationConcern` | `not_checked_yet` | `re2_registrationDetail` text | `rights` | **모범** — 리메디 참고 패턴 |
| **GAP-RE-DL-07** | `re2_clauseFocus` | `delivery_handover` | slug; §6.3 후 detail 없음 | `risk` | 인도·장소 text 없음 |
| **GAP-RE-DL-08** | `re2_translationIssue` / gap | `party_name_diff` 등 | slug | parties/facts 라벨 | 주소 원문 키 없음 |

**추가 (감사 중 확인, ID 부여):**

| 갭 ID | 위치 | 내용 |
|-------|------|------|
| **GAP-RE-DL-09** | `re_docsMatch`=`match` + `deadline_dispute` 없음 | 기한 분쟁은 gap mismatch에만 열림 — match 경로에서 Phase1 기한 축 **부재** (의도일 수 있음) |
| **GAP-RE-DL-10** | Profile `facts` | `match`/`mismatch` 시 합성 문자열 「서류와 상황 일치 응답」/「불일치 응답」 — slug 대신 **고정 문구** (STEP2-0 §5 legacy read) |
| **GAP-RE-DL-11** | `buildRealEstateSituationProfile` `actions`/`responses` | Phase2 `formalResponse`/`authorityStage` 없으면 Phase1 `re_goal`이 **actions·responses에 복사** — STEP2-0 §3.1에서 사후 분리 예정 (완결성 혼선) |

---

## 8. STEP2-0·STEP2-1과의 관계

### 8.1 유지 (Ace 승인)

- **STEP2-1 범위:** `VFBCAI_REALESTATE_STEP2-0_DESIGN_MAPPING_v1.md` **§1~§7** (DQ-RE-01~07)만. 본 감사 FAIL을 **이 Mission만으로 닫지 않음**.

### 8.2 STEP2-1 구현 후 재평가 포인트

| 변경 | 완결성 영향 |
|------|-------------|
| §1 DI `other`+note | ⑤ 개선. 갭 01·08의 DI 경로는 note로 밀도 확보 가능 — **numbered만** 경로는 동일 |
| §2.3 `partial` | `needsSituationGap`·facts 분기 **추가 필요** — 미구현 시 ③ FAIL 유지 |
| §6.3 detail 축소 | GAP-03·04·05·07 **악화** — 리메디에서 text 키 또는 downstream 실질화 필수 |
| §7 브릿지 플래그 | UNCLEAR 2차 깊이·비율 변동 — 별도 경로 재카운트 |

### 8.3 권장 후속 (구현 없음)

1. **RE Phase2 리메디 STEP2-0** — CASE_06 유형: GAP-RE-DL-01~08 우선순위·RE-native text 키·`needs*`·result 문장 (Admin deadline 체인 **복사 금지**, §11.2).  
2. STEP2-1 PASS 후 **본 문서 v1.1** 또는 재감사 — 경로별 실질 축 표·비율 **VERIFIER 확정**.  
3. DQ-RE-08 — `buildActions` goal 반영; ②·④와 별도.  

---

*2026-09-25. LOCK `fa4cce9`. 코드 없음. STEP2-1(§1~§7) 착수 전·후 리메디 설계 입력용.*
