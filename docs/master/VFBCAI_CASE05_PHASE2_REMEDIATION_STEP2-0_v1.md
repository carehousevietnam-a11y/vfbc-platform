# CASE_05 Phase2 실질화 — STEP2-0 설계 (Remediation)

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **성격** | STEP2-0 설계만. **코드 수정 없음** (1번창 배치 작업 종료 후 STEP2-1 착수) |
| **범위** | Admin VERIFY **CASE_05 네이티브** (`case05_*`) 필드·분기·Profile·결과 신호. Phase1/2 틀·STOP·bridge·CASE_06 구조 **재설계 금지** |
| **SoT 감사** | `docs/master/VFBCAI_CASE05_INFORMATION_COMPLETENESS_AUDIT_v1.md` (LEVEL 1, 2026-09-25) |
| **SoT 기준 (LOCK)** | `docs/master/VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (LOCK 2026-09-25) |
| **SoT 헌법** | `docs/VFBCAI_CONSTITUTION.md` §16.6 |
| **SoT 질문** | `docs/master/VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` § CASE_05 2차 Adaptive Chain |
| **코드 SoT (조사)** | `src/lib/adminVerifyProfiling.ts`, `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` |

---

## 0. 현재 상태 요약 (감사·코드 일치)

| 구분 | 내용 |
|------|------|
| Phase1 | 4 필드 고정: `dispositionType` → `confirmGoal` → `customerResponse` → `deadline` (`CASE05_PHASE1_FIELD_ORDER`, `appendCase05Phase1Questions` ~5625–5671) |
| Phase2 후보 | 최대 13 질문 id (`appendCase05Phase2Questions` ~5674+). 경로별 부분 노출 |
| 감사 판정 | ①~④ **FAIL**, ⑤ PASS, ⑥ **1차<2차 PASS 후보** (실질 축 4:6, 하한 경계) |
| Profile 단절 | `dispositionDetail` · `factDetail` · `explanationDetail` · `submittedDocsDetail` · `appealDetail` — 답변 키만 존재 (`CASE05_INFORMATION_COMPLETENESS_AUDIT` 18행) |
| 기한 날짜 | `specific_date` 선택 시 **날짜 전용 키·후속 text 질문 없음**. Profile `deadline`은 선택 라벨만 (`buildCaseResolutionProfile` ~8747–8761, 감사 1.4) |

**비목표 (이 STEP2-0에서 하지 않음)**

- CASE_06 bridge / `isCase06BridgedToNativeCase` 변경
- Q1·`adminCaseDocumentKind`·CASE_07
- `authority` 당사자 축 신규 질문 (감사 권장안 7 — 별도 Ace 승인)
- Master UI rail·evidence upload gate 구조 변경 (증거 게이트는 선택지와 분리 유지)

---

## 1. `specific_date` 저장 버그 — 수정 설계

### 1.1 원인 (LEVEL 1)

| 관측 | 근거 |
|------|------|
| `case05_deadline === "specific_date"`이면 완료 판정은 choice value만으로 통과 | `isAdminVerifyChoiceFieldComplete` (~1875–1898): `other`가 아니면 note 없이 `true` |
| Phase1에 날짜 text 후속 없음 | `appendCase05Phase1Questions` (~5666–5671)이 `case05_deadline` choice만 push |
| Profile에 날짜 문자열 미반영 | `buildCaseResolutionProfile` deadline 분기 (~8750–8752): `getCase05FieldLabelFromAnswers` / option label만 사용. `case01`만 `CASE01_DEADLINE_DATE_KEY` 조합 (~8760–8761) |
| `CASE05_ANSWER_KEYS`에 날짜 키 없음 | ~4957–4972 |
| 참조 패턴 존재 | `CASE01_DEADLINE_DATE_KEY = "case01_deadlineDate"` (~438), `case01NeedsDeadlineDateDetail` (~1021–1024), Phase2 text 질문 (~1396–1405) |

**결론:** CASE_05는 `specific_date` slug를 쓰지만, CASE_01의 `confirmed` + `case01_deadlineDate` 패턴이 **이관되지 않음**.

### 1.2 설계 결정 (STEP2-1 구현)

| 항목 | 결정 |
|------|------|
| 신규 키 | `export const CASE05_DEADLINE_DATE_KEY = "case05_deadlineDate"` (`CASE01_DEADLINE_DATE_KEY` 옆 ~438) |
| 게이트 | `case05NeedsDeadlineDateDetail(answers)`: `case05EffectiveDeadline(answers.case05_deadline) === "specific_date"` && `!answers[CASE05_DEADLINE_DATE_KEY]?.trim()` |
| 질문 순서 | Phase1: `case05_deadline` choice **완료 직후** conditional `kind: "text"` (CASE_01 ~1396–1405 동형). label 예: 「확인한 대응 기한은 언제인가요?」, placeholder: 「기억나는 날짜·기한을 적어 주세요.」 |
| Phase1 완료 | `isCase05Phase1Complete` (~5615): `CASE05_PHASE1_FIELD_ORDER` 순회 후, `case05NeedsDeadlineDateDetail`이면 **false** |
| Phase2 STOP | `case05PathFieldsComplete` (~5873): Phase1 완료에 날짜 포함되므로 별도 Phase2 게이트 불필요. text 질문이 Phase1 체인에 있으면 `appendCase05Phase1Questions` early-return에 날짜 미입력 시 Phase2 미진입 |
| Profile | `buildCaseResolutionProfile` deadline (~8747): `specific_date` && `CASE05_DEADLINE_DATE_KEY` → ``처분 관련 대응 기한: ${date}`` (CASE_01 문장 패턴 동형). source field: `CASE05_DEADLINE_DATE_KEY` (choice는 `case05_deadline`) |
| 신호 | `deriveDispositionSignals` (~5985–5994): `specific_date` + date 있음 → `DISPOSITION_DEADLINE_UNCLEAR` **미발생**. date 없으면 Phase1 완료 불가이므로 런타임 불일치 제거 |
| 결과 UI | `AdminVerifyFirstResultPanel.tsx` `appendCase05Phase1ResultSignals` (~364–367): date 있으면 action에 **실제 날짜** 반영(또는 profile.deadline 사용). `case05ActionsFromAnswers` (~462–466) 동일 |
| Persist | `CASE05_ANSWER_KEYS`에 `case05_deadlineDate` 추가 (~4957). `buildAdminVerifyAnswersPersistMeta`는 whitelist 경유 (~9826) |
| Restore | `restoreAdminProfilingAnswersFromMeta` / meta JSON — whitelist에 포함되면 자동 복원 |
| UI 요약 | `MasterReviewQuotationReport.tsx` choice 요약 (~1228–1233): `case05_deadline` + `specific_date`일 때 `case05_deadlineDate` shorten 표시 (CASE_01 text 요약 패턴 참고) |

### 1.3 계획 diff (STEP2-1 — 파일·위치만, 적용 안 함)

```diff
--- a/src/lib/adminVerifyProfiling.ts
+++ b/src/lib/adminVerifyProfiling.ts
@@ ~438
 export const CASE01_DEADLINE_DATE_KEY = "case01_deadlineDate";
+export const CASE05_DEADLINE_DATE_KEY = "case05_deadlineDate";

@@ CASE05_ANSWER_KEYS (~4960)
   ...CASE05_PHASE1_FIELD_ORDER,
+  CASE05_DEADLINE_DATE_KEY,  // 또는 배열에 문자열 "case05_deadlineDate" — PHASE1_FIELD_ORDER에는 넣지 않음 (CASE_01 동형)

@@ isCase05Phase1Complete (~5622)
+  if (case05NeedsDeadlineDateDetail(answers)) return false;

@@ appendCase05Phase1Questions (~5670)
+  if (!isAdminVerifyChoiceFieldComplete("case05_deadline", answers, CASE05_DEADLINE_OPTIONS)) return;
+  if (case05NeedsDeadlineDateDetail(answers)) {
+    pushUnique(questions, { id: CASE05_DEADLINE_DATE_KEY, kind: "text", label: "...", placeholder: "..." });
+    return;
+  }

@@ buildCaseResolutionProfile deadline branch (~8750)
+  // case05: specific_date + case05_deadlineDate → 날짜 문자열

@@ deriveDispositionSignals (~5985)
+  // specific_date + date filled → skip DISPOSITION_DEADLINE_UNCLEAR for that path
```

**회귀:** CASE_06 bridge → CASE_05, strict harness `case05_deadline: "uncertain"` 시드 — 날짜 키 없음 유지. `specific_date` 시나리오 harness 1건 추가 (STEP2-1 QA).

### 1.4 DQ (날짜)

| ID | 질문 | 권장안 |
|----|------|--------|
| **DQ-C05-R01** | 날짜 입력을 `text` vs `date` input | **text** (CASE_01 동형, Master 질문 렌더 재사용). 별도 date picker는 STEP2-1 범위 밖 |
| **DQ-C05-R02** | `known_date` legacy | `case05EffectiveDeadline`이 `specific_date`로 읽힘 (~5020–5027) — date 키는 **신규 입력만** 요구, legacy meta에 날짜 없으면 restore 후 재질문 |

---

## 2. 장식 질문·선택지 실질화 설계

원칙: **질문 id·MASTER chain 순서 유지**. 삭제보다 **Profile · needs* · signals · result · (해당 시) evidence 요구 · expert handoff focus** 연결. LOCK 기준 ②~④ 통과가 “실질 축” 판정 기준.

공통 구현 레이어 (STEP2-1):

1. `getCase05FieldLabelFromAnswers` / 전용 helper — detail 필드 note·slug → Profile 보조 fact
2. `deriveDispositionSignals` / `collectCase05Unknowns` / `collectCase05RiskSignals` — 선택값별 신호 분기
3. `appendCase05Phase2ResultSignals` / `case05ActionsFromAnswers` — 결과 문장·행동 분기
4. `buildCaseResolutionProfile` — `actualSituation` / `authorityClaim` / `customerAction` / `evidence` / `goal` / `currentBlockage`에 detail 반영 (기존 CASE_01 `case01_actualSituation` 패턴)
5. `selectCase05ResolutionFocus` / `CASE05_FOCUS_ORDER` — blockage·detail이 FOCUS rank에 영향 (이미 id 등록 ~9227–9232, **값은 미사용**)
6. 필요 시 `case05Needs*` — detail 값에 따라 `repeatFollowUp` · `evidence` · `finalGoal` 게이트 **미세 조정** (STOP 함수화 유지)

### 2.1 질문 전체 장식 (감사 2.3–2.7) — 필드별 downstream

#### `case05_dispositionDetail` (~5714, 옵션 ~5196)

| 선택값 | Profile | 다음 질문/needs* | 증거/위험 | 결과/전문가 |
|--------|---------|------------------|-----------|-------------|
| `wording_unclear` | `authorityClaim` 보조: 「문구 불명확」 | `case05NeedsBlockage` 가중 없음 · `dispositionReason` 유지 | 신호 `DISPOSITION_TYPE_UNCLEAR` 유지·강화 | unconfirmed: 「조치 문구·범위」 · action: 통지 **제목·핵심 문구** |
| `scope_unclear` | 「범위·기간 불명확」 | 동일 | risk: 「정지·제한 범위 미확인」 | action: **범위·기간** 확인 |
| `partially_understood` | 「부분 이해」 | `case05NeedsEvidence` **유지** (불명확 경로) | caution: 부분 이해 | action: **영향 범위** 재확인 |
| `unsure` | 「영향 미이해」 | `blockage` 이미 열린 경로에서 `finalGoal` 후보 | `DISPOSITION_TYPE_UNCLEAR` | unconfirmed: 「처분 영향」 |

**FOCUS:** `authorityClaim` 중복은 **값별 서브라벨**로 `buildCaseResolutionProfile` event/authorityClaim에 합성 (type 라벨 + detail 라벨).

#### `case05_factDetail` (~5725, ~5206)

| 선택값 | Profile | 다음 질문 | 증거 | 결과 |
|--------|---------|-----------|------|------|
| `date_place` | `actualSituation` 서브: 날짜·장소 불일치 | `hard_to_judge`와 동일 needs* 유지 | evidence 유지 | unknown: 「날짜·장소 불일치」 · action: **그 시점·장소** 대조 |
| `content_differs` | 「내용·사실관계」 | partial/mismatch와 **다른** result 문장 | risk: 사실관계 차이 | caution 문장 **mismatch 전용** (partial과 분리 — 감사 2.1) |
| `hard_to_verify` | 「확인 곤란」 | `unknown` 경로와 분기 | `FACT_UNVERIFIED` | unconfirmed: 「당시 상황 확인」 |
| `unsure` | 「차이 설명 곤란」 | `blockage` 연계 | evidence | unconfirmed: 「처분과 실제 차이」 |

**연계:** `partial` vs `mismatch` 결과 문장 분리는 **factRelationship** 신호는 유지하고, **factDetail**이 있을 때만 2차 요약 문장 갈라짐 (`appendCase05Phase2ResultSignals` ~387–390).

#### `case05_explanationDetail` (~5206)

| 선택값 | Profile `customerAction` 심화 | downstream |
|--------|------------------------------|------------|
| `written` | 「서면 소명 제출」 | followUp `more_docs` 확률 가중 없음 · result: **서면 제출 시점·기관 접수** 확인 action |
| `verbal` | 「구두 설명」 | risk: 「구두만 — 기록 없음」 |
| `both` | 「서면+구두」 | evidence: `submitted_docs` CTA 강조 |
| `unsure` | DI 없음 — `unsure` | unconfirmed: 「소명 형태」 |

#### `case05_submittedDocsDetail` (~5223)

| 선택값 | Profile | evidence 질문 | 결과 |
|--------|---------|---------------|------|
| `identity` / `financial` / `certificate` | `evidence` 라벨 + **종류** | `case05_evidence` 기본 open 유지 · 값별 **권장 첨부** 문구 | action: 해당 **서류 유형** 재확인 |
| `doc_other` | note 없음 — **DQ-C05-R03** | `other`+note로 흡수 검토 | |
| `unsure` | | | unconfirmed: 「제출 서류 종류」 |

#### `case05_appealDetail` (~5231)

| 선택값 | Profile | downstream |
|--------|---------|------------|
| `filed` | 「이의 신청 완료」 | outcome 대기 강조 · risk: 기한 |
| `preparing` | 「준비 중」 | action: **신청 기한·서류** |
| `considering` | 「검토 중」 | action: **이의 가능 여부** 안내 확인 |
| `unsure` | | unconfirmed: 「이의·재검토 진행 상태」 |

### 2.2 Phase1 `case05_deadline` — 기한 미확인 4값 (~5172, 감사 1.4)

| 선택값 | 통합 설계 |
|--------|-----------|
| `uncertain` | 신호 `DISPOSITION_DEADLINE_UNCLEAR` (현행) |
| `period_stated` | 신호 **`DISPOSITION_DEADLINE_PERIOD_ONLY`** (신규 코드) — 「기한 존재·날짜 미상」 |
| `not_stated` | 신호 **`DISPOSITION_DEADLINE_NOT_MENTIONED`** |
| `unsure` | `uncertain`과 **동일 신호** · Profile 라벨만 구분 |
| `specific_date` | §1 날짜 키 + **날짜 있으면** CLEAR 신호 |

**판별력:** `deriveDispositionSignals` + `appendCase05Phase1ResultSignals` (~370–377)에서 4값 **문장·unconfirmed 분리**. `unsure`/`uncertain` 동일 신호는 허용, **action 문구**는 다르게.

### 2.3 `case05_dispositionReason` — 사유 4값 (~5135, 감사 2.2)

| 선택값 | Profile `authorityReason` | 신호/결과 |
|--------|---------------------------|-----------|
| `violation_claimed` | 유지 | risk: 「위반 주장 — 사실관계 대조」 (factRelationship issue 시 강화) |
| `document_issue` | 유지 | action: **서류·형식** 확인 |
| `requirement_not_met` | 유지 | action: **요건·자격** 확인 |
| `deadline_procedure` | 유지 | action: **절차·기한** 확인 · deadline 축 cross-link |

`no_clear_reason` / `unsure` — 현행 유지 (이미 실질).

**경로 확장 (감사 권장안 1, LOCK 완화 아님):** `case05NeedsDispositionReasonPhase2` (~5451)에 `rights_ended` · `business_suspended` · `application_denied` + goal `understand_impact` | `appeal_possibility` | `what_to_do` 시 **사유 질문 열기** — **DQ-C05-R04** (질문 수 증가 vs 정보완결성).

### 2.4 `case05_blockage` — 9값 + `other` (감사 2.11)

각 값 → **고유 `case05ActionsFromAnswers` 1줄** + `currentBlockage` 라벨 + `selectCase05ResolutionFocus`에서 **해당 focus rank 상승** (deadline/evidence/appeal_method 등).

| 값 | 결과 action (예) | expert handoff |
|----|------------------|----------------|
| `why_disposition` | 사유 문구 확인 | goal 축: 사유 |
| `what_disposition` | 조치 내용 확인 | authorityClaim |
| `fact_match` | 사실 대조 | actualSituation |
| `what_to_do` | 다음 조치 | goal |
| `appeal_method` | 이의 절차 | appeal |
| `deadline` | 기한 확인 | deadline |
| `evidence` | 증빙 종류 | evidence |
| `next_response` | 기관 후속 | authorityResponse |
| `unsure` / `other` | 기존 통합 unconfirmed | |

**needs*:** 값 자체로 새 질문을 열지 않음 (장식 재발 방지). **결과·FOCUS·Profile**만 갈라짐.

### 2.5 `case05_finalGoal` (감사 2.13)

| 방향 | 설계 |
|------|------|
| A (권장) | `confirmGoal`과 **주제 중복 최소화**: `finalGoal`은 **종단 조치 의도**만 (expert / next_action / evidence). `why_disposition` 등은 `blockage`·Phase1 goal로 흡수 — 옵션 **슬림화는 DQ-C05-R05** (문구·slug LOCK) |
| B | 값별로 `case05ActionsFromAnswers` + Profile `goal` override + AI Report 한 줄 **다르게** (구현 최소) |

### 2.6 `case05_evidence` — 자료 6값 (감사 2.12)

| 값 | downstream |
|----|------------|
| `disposition_notice` | unknowns 없음 · expert: 「통지서 원본」 |
| `message_email` | 「전자 안내」 |
| `submitted_docs` | customerResponse `documents_submitted`와 **교차** 문장 |
| `payment_proof` | CASE_02 재분류 경로 시 납부 연계 문장 |
| `photo_video` | 「현장·상황」 |
| `contract` | 「계약·관계」 |
| `none` / `unsure` | 현행 신호 유지 |

업로드 gate 변경 없음 (감사 12행).

### 2.7 기타 감사 권장 (STEP2-1 포함 후보)

| 항목 | 설계 |
|------|------|
| `partial` vs `mismatch` | `appendCase05Phase2ResultSignals` 문장 분리 + factDetail 연동 |
| `modified` / `revoked` outcome | 전용 caution (~221) |
| `repeatFollowUp` 4+`other` | 값별 **라운드 설명** 문장 1줄 차이 |
| `inquired` / customer `other` | result 전용 문장 1줄 추가 |

---

## 3. 1차<2차 · 최소 비율 가드레일 계산

LOCK `[신규 확정 — 2026-09-25]` (`VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` 138–142):

- 실질 축 = ②~④ 통과 **질문 단위** (장식 질문 제외)
- 하한: 1차:2차 = **3:7 ~ 4:6** (2차가 더 많아야 함 — 상한 없음)

### 3.1 현재 (감사 §3.6, 코드 동의)

| | 실질 축 수 | 질문 id |
|--|------------|---------|
| **Phase1** | **4** | `dispositionType`, `confirmGoal`, `customerResponse`, `deadline` |
| **Phase2 실질** | **6** | `factRelationship`, `dispositionReason`, `authorityFollowUp`, `dispositionOutcome`, `repeatFollowUp`, `evidence` |
| **Phase2 장식** | **7** | `dispositionDetail`, `factDetail`, `explanationDetail`, `submittedDocsDetail`, `appealDetail`, `blockage`, `finalGoal` |

**비율:** 4:6 → **4:6 하한선에 정확히 걸침** (감사 340행). 3:7 엄격 하한: \( \lceil 4 \times 7 / 3 \rceil = 10 \) → **Phase2 실질 ≥10** 필요 시 3:7도 만족.

**1차=2차 / 1차>2차:** 해당 없음 (4<6). **무조건 FAIL** 조건 회피.

### 3.2 `specific_date` 수정의 축 계산 영향

- 날짜 text는 **Phase1 `deadline` 축의 정보 밀도 강화**. 별도 “실질 축 +1”로 세지 않음 (동일 질문 id, LOCK 「질문 개수」 아님 「밀도」).
- ① 정보완결성 개선에 기여.

### 3.3 장식 실질화 후 재계산 (목표)

| 시나리오 | Phase2 실질 | 비율 | 4:6 | 3:7 |
|----------|-------------|------|-----|-----|
| **현행** | 6 | 4:6 | 경계 OK | **FAIL** (6<10) |
| **§2.1 다섯 detail만 실질화** | 6+5=**11** | 4:11 | OK | OK |
| **+ blockage·finalGoal 실질화** | 11+2=**13** (경로 상한) | 4:13 | OK | OK |
| **DQ-C05-R04 사유 경로 확장** | 질문 수 동일, **열리는 경로**에서 reason 축이 더 자주 채워짐 — 축 개수는 reason 질문 1개 유지 |

**결론 (STEP2-0):**

1. **신규 질문 id 추가 없이** MASTER chain上的 **장식 5질문 실질화**만으로 3:7 하한(**10**) 충족 가능 (11).
2. `blockage` · `finalGoal` 실질화는 **품질·①④** 목적; 비율은 이미 11로 충분.
3. **형식적 4:5 같은 겉질문 수**로 하한 채우기 **금지** (LOCK 가드레일).
4. Phase2 실질 축이 **5 이하**로 줄어드는 리팩터(질문 삭제·게이트 축소)는 **4:6 하한 FAIL** → STEP2-1에서 **금지**.

### 3.4 부족분 채우기 우선순위 (STEP2-1)

| 순위 | 작업 | 비율/완결성 |
|------|------|-------------|
| P0 | §1 `specific_date` | ① 시간/기한 |
| P1 | §2.1 five detail → Profile+signals+result | ②③④ + 실질 축 +5 |
| P2 | §2.2 deadline 4값 분리 | ③ Phase1 내 판별력 |
| P3 | §2.3 reason 4값 + (승인 시) R04 경로 | ① 원인 축 |
| P4 | §2.4 blockage · §2.5 finalGoal · §2.6 evidence | ②③④ |
| P5 | outcome/repeat/customerResponse 잔여 | ③ |

---

## 4. STEP2-1 구현 터치 리스트 (예상)

| 파일 | 변경 요약 |
|------|-----------|
| `src/lib/adminVerifyProfiling.ts` | CASE05_DEADLINE_DATE_KEY, Phase1 text, Profile, signals, needs*, pathComplete, CASE05_ANSWER_KEYS, detail→profile helpers |
| `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` | `appendCase05Phase1/2ResultSignals`, `case05ActionsFromAnswers`, fact metric |
| `src/components/cost-check/MasterReviewQuotationReport.tsx` | 요약 라벨 `case05_deadlineDate` |
| `tests/qa/admin-verify-strict-full-v2*.mjs` | `specific_date` + date 시드 (제품 문구 SoT) |
| `tests/qa/case05-phase1-di-browser.mjs` | 날짜 text 노출 스팟 (LEVEL 3) |

**패턴 체크:** `VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` §5 STOP · §1 DI · §8 옵션 수 (내용 4~5+DI 유지).

---

## 5. DESIGN QUESTIONS (Ace 승인 전 IMPLEMENTER 착수 금지)

| ID | 모호점 | 권장안 | 근거 |
|----|--------|--------|------|
| **DQ-C05-R03** | `submittedDocsDetail.doc_other` | `ADMIN_DIRECT_EXPLAIN_CHOICE`로 통합, slug `doc_other` legacy 읽기만 | REUSABLE §1 |
| **DQ-C05-R04** | 사유 질문을 거부·권리종료·활동제한 경로에서도 열까 | **열기** (goal이 understand_impact 등일 때) | 감사 ①·권장안 1 |
| **DQ-C05-R05** | `finalGoal` 옵션 슬림화 | **B 우선** (값별 result만) — slug 삭제는 LOCK 문구 영향 | MASTER § CASE_05 chain 유지 |
| **DQ-C05-R06** | 3:7 vs 4:6 운영 기준 | 감사·LOCK **둘 다 만족**을 STEP2-1 PASS 조건 (실질 ≥10) | 신규 가드레일 138–142 |
| **DQ-C05-R07** | `dispositionDetail` FOCUS `authorityClaim` 중복 | Profile **합성 라벨**만; FOCUS rank는 type 우선 | FOCUS_ORDER ~9231 |

---

## 6. STEP2-1 완료 조건 (VERIFIER)

| # | 조건 |
|---|------|
| 1 | `specific_date` 경로: `case05_deadlineDate` persist → restore → Profile deadline 문자열 (LEVEL 1+3) |
| 2 | 장식 5질문: 선택값 변경 시 signals 또는 result 문장 **코드 추적**으로 2개 이상 달라짐 (LEVEL 1, 감사 표 재현) |
| 3 | 실질 축 재계산 **Phase2 ≥10** (경로 예시 2개 이상 trace) |
| 4 | `npx tsc --noEmit` PASS |
| 5 | CASE_06 bridge · CASE_03/04 회귀 스모크 (기존 strict 시드) |
| 6 | LOCK 감사 기준 **완화·재해석 없음** — ①~④ 개선 방향만 |

---

*2026-09-25. CASE_05 Phase2 실질화 STEP2-0. 코드 미변경. 1번창 배치 종료 후 STEP2-1 Mission Brief로 승격.*
