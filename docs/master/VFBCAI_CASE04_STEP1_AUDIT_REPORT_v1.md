# CASE_04 — STEP1 조사 보고 (코드 미변경)

| 항목 | 내용 |
|------|------|
| **CASE** | `CASE_04` — 추가 서류·보완 |
| **단계** | STEP1 — `VFBCAI_CASE_AUDIT_CHECKLIST_v1.md` A~H + `VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` §1~§8 |
| **SoT** | `docs/master/VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` § CASE_04 |
| **구현** | `src/lib/adminVerifyProfiling.ts`, `AdminVerifyFirstResultPanel.tsx`, `MasterReviewQuotationReport.tsx` |
| **검증** | 구조·분기·옵션 **LEVEL 1**; Browser **LEVEL 4 (미확인)** |
| **금지** | 애플리케이션 코드 미변경 |

**범위:** Q1=`supplement_request` 네이티브 CASE_04. CASE_06 브릿지 → `CASE_04`는 동일 `case04_*` + `isCase06BridgedToNativeCase(answers, "CASE_04")`.

---

## 체크리스트 요약

```
CASE_04
- 구조 차이: MASTER P1 6문항 vs 구현 P1 4필드; Q2·Q3·Q6 Phase2 이관/혼선
- 질문/선택지 품질 이슈: confirmGoal 라벨·옵션 축 불일치; 일부 P2 DI 누락
- Direct Input: target/response/deadline OK; confirmGoal·P2 다수 미연결
- Raw/Effective: submitResponse/inquiryResponse UI 없음 — authority 신호 fallback만
- Dead code: actualCore, NeedsTargetDetail, submit/inquiry response keys
- Result: P1/P2 시그널 연결됨 (LEVEL 1)
- Browser: LEVEL 4
- [DESIGN QUESTION]: DQ-C04-01 ~ DQ-C04-09 (본문)
```

---

## 1. MASTER vs 코드 — 질문·옵션·문항 수

### Phase1

| MASTER v1.0 | 구현 (`CASE04_PHASE1_FIELD_ORDER`) | 차이 |
|-------------|-----------------------------------|------|
| Q1 무엇을 다시 하라고 | `case04_supplementTarget` — 라벨 일치 | 5+DI |
| Q2 제출 전 무엇을 제출했나요 | **P1 없음** → P2 `case04_initialSubmission` | 이관 |
| Q3 **어느 부분** 보완 | `case04_confirmGoal` — **동일 MASTER Q3 라벨**이지만 옵션은 **고객 확인 목표**(6개, DI 없음) | **DQ-C04-01** (CASE_03 confirmGoal 패턴 동형) |
| Q4 대응 | `case04_customerResponse` | 5+DI |
| Q5 기한 | `case04_deadline` | 6+DI (초과) |
| Q6 제출 후 기관 답변 (조건부) | **P1 없음** → P2 `case04_authorityFollowUp` (`case04NeedsAuthorityFollowUpPhase2`) | 이관 |

**요약:** MASTER **6문항** vs 구현 Phase1 **4필드** (CASE_03·05와 동형 4필드 골격).

### Phase2 adaptive chain

| MASTER | 구현 `appendCase04Phase2Questions` | LEVEL 1 |
|--------|-----------------------------------|---------|
| initialSubmission (조건부) | `case04_initialSubmission` | 일치 |
| submissionRelation | `case04_submissionRelation` (**needs 항상 true**) | 일치 |
| supplementReason | `case04_supplementReason` | 일치 |
| addDocDetail 등 조건부 | target 분기 `addDocDetail` / `modifyDetail` / `evidenceDetail` / `unclearFocus` | 일치 |
| authorityFollowUp | `case04_authorityFollowUp` | 일치 |
| repeatSupplement → blockage → evidence → finalGoal | 동일 | 일치 |

**MASTER chain에 없는 구현 축:** `case04_confirmGoal`이 P1에 있으나 MASTER Q3 문구와 옵션 의미 불일치 (§1).

### 선택지·DI (§8 패턴)

| 필드 | 내용 옵션 (+ DI) | §8 |
|------|------------------|-----|
| supplementTarget | 5 + DI | OK |
| confirmGoal | **6, DI 없음** | FAIL 후보 |
| customerResponse | 5 + DI | OK |
| deadline | 6 + DI | 초과 |
| authorityFollowUp | 7 + DI | 초과 |
| repeatSupplement | 5, **no DI** | FAIL 후보 |
| blockage / evidence / finalGoal | 다수, **no DI** | FAIL 후보 |

---

## 2. Situation Profile 필드·매핑 방향

**키 (`CASE04_ANSWER_KEYS`):** Phase1 4 + Phase2 `supplementReason`, `initialSubmission`, `submissionRelation`, detail fields, `authorityFollowUp`, `repeatSupplement`, `blockage`, `evidence`, `finalGoal`, **`actualCore`**, **`submitResponse`**, **`inquiryResponse`**.

| Profile 축 | 주요 소스 (LEVEL 1) |
|------------|---------------------|
| `caseClassification` | `classifyFromCase04Answers` (+ `case04_actualCore` cross-case) |
| unknowns / risks | `collectCase04Unknowns`, `collectCase04RiskSignals`, `deriveSupplementSignals` |
| authorityResponse | `getCase04AuthorityResponseValue` — followUp 우선, else **submit/inquiry response (UI 없음)** |

**STEP2 매핑 방향 (조사 제안, 미구현):** CASE_03 승인 패턴 참고 — Q3 문구를 **기관 보완 초점** 필드로, 고객 «우선 확인 목표»는 별도 `confirmGoal` 라벨; Q2·Q6는 P2 이관 유지 vs P1 승격은 **DQ 일괄 결정**.

---

## 3. 재분류·분기

- **진입:** Q1 `supplement_request` → CASE_04; `shouldActivateCase04Path`.
- **내부:** adaptive chain + `case04Needs*`; `case04PathFieldsComplete` STOP (§5).
- **CASE_04 → 타 CASE (체인):** `classifyFromCase04Answers` — `case04_actualCore` → 02/03/05/06 (**UI 미생성 시 classify-only**, §7).
- **타 CASE → CASE_04:** `classifyFromCase03Answers` (`more_docs` 등).
- **CASE_06 bridge:** P1 4필드 선행 후 P2 (`appendCase04PathQuestions`).

---

## 4. Result Panel (LEVEL 1)

- `appendCase04Phase1ResultSignals` — target, goal, response, deadline.
- `appendCase04Phase2ResultSignals` — relation, reason, followUp, repeat.
- submission relation metric / cautions — `case04_submissionRelation` 분기 (`AdminVerifyFirstResultPanel.tsx`).
- **격차:** `actualCore`·`submitResponse` Result 전용 노출 **없음** (classify·signals만).

---

## 5. 공용 함수 영향

| 공용 | CASE_04 영향 | 회귀 CASE |
|------|--------------|-----------|
| `classificationFromProfileSignals` | `classifyFromCase04Answers` | 03→04, 06 |
| `getEffectiveAdminVerifyCase` | bridge 후 native 04 | 06 |
| `isAdminVerifyPhase2PathComplete` | `case04PathFieldsComplete` | 06 bridge |
| `selectCase04ResolutionFocus` | `CASE04_FOCUS_ORDER` (actualCore **미포함** — FOCUS는 양호) | — |
| `MasterReviewQuotationReport` | `case04_*` choice render | 공통 DI |

---

## 6. Dead / Legacy (§7)

| 항목 | LEVEL 1 |
|------|---------|
| `case04_actualCore` | `CASE04_ANSWER_KEYS`, `classifyFromCase04Answers`, `case04NeedsActualCore` — **`appendCase04*` UI 없음** (CASE_05 `actualCore` 동형) |
| `case04NeedsTargetDetailPhase2` | **정의만 존재, 호출 0** |
| `case04_submitResponse` / `case04_inquiryResponse` | ANSWER_KEYS + `getCase04AuthorityResponseValue` fallback; **질문 미생성** |
| `case04_confirmGoal` | 라벨=MASTER Q3, 옵션=고객 목표 — **semantic drift** |

---

## 7. REUSABLE PATTERNS (본 CASE 현황 — STEP1)

| § | 판정 | 메모 |
|---|------|------|
| 1 DI | **위반 후보** | confirmGoal, repeatSupplement, blockage, evidence, finalGoal |
| 2 CTA | **PASS** | CASE_04 전용 변경 없음 |
| 3 재분류 | **PASS** | Q1 entry + Phase2 cross via actualCore/classify |
| 4 Bridge | **PASS** | `isCase06BridgedToNativeCase("CASE_04")` 패턴 존재 |
| 5 STOP | **주의** | needs* 대체로 정합; actualCore는 STOP·FOCUS 불일치 |
| 6 Harness | **NOT VERIFIED** | strict trace CASE_04 별도 실행 없음 (본 STEP1) |
| 7 Legacy | **위반 후보** | actualCore, submit/inquiry response, NeedsTargetDetail |
| 8 옵션 | **위반 후보** | confirmGoal 6无DI; deadline/followUp 초과 |

---

## 8. [DESIGN QUESTION] 전체 + 권장안

| ID | 주제 | 요약 | **권장안** |
|----|------|------|------------|
| **DQ-C04-01** | P1 Q3 라벨 vs `confirmGoal` | MASTER Q3 문구인데 옵션은 고객 확인 목표 | **CASE_03 DQ-C03-01 동형:** P1에 기관 보완 초점 필드 신설 또는 `supplementReason`/`unclearFocus` 조기 승격 검토 전, **`confirmGoal` 라벨을 고객 우선 확인 목표로 변경** + **MASTER Q3 축은 P2 `submissionRelation`·target 분기로 매핑** (Profile·needs 연쇄 수정) |
| **DQ-C04-02** | MASTER Q2 P1 누락 | 최초 제출 내용 P2만 | **P2 `initialSubmission` 이관 유지** (CASE_03 Q3→factRelationship 동형); MASTER 부록 매핑표만 갱신 |
| **DQ-C04-03** | MASTER Q6 P1 누락 | 제출 후 기관 반응 P2 only | **조건부 P2 `authorityFollowUp` 유지**; MASTER Q6=제출한 경우 조건은 `case04NeedsAuthorityFollowUpPhase2`와 동일 문서화 |
| **DQ-C04-04** | `confirmGoal` DI | 6옵션, DI 없음 | **5+DI + note** (§8, CASE_03 C03-03 동형) |
| **DQ-C04-05** | P2 DI 누락 | repeat/blockage/evidence/finalGoal | **5+DI 통일**; escape slug → `other`+note (C03-04 동형) |
| **DQ-C04-06** | `case04_actualCore` | classify·needs만, UI 없음 | **삭제 + classify 정리** (CASE_05 DQ-C05-07 권장안 동형). cross-case는 `authorityFollowUp`·`supplementTarget` 등 **기존 답변 축으로만** |
| **DQ-C04-07** | `submitResponse` / `inquiryResponse` | UI 없이 signals fallback | **삭제** 또는 **customerResponse 분기 하위 질문으로 복원** — 권장: **삭제** 후 `getCase04AuthorityResponseValue`를 `authorityFollowUp` 단일 축으로 단순화 (복원 시 5+DI 하위 1문항) |
| **DQ-C04-08** | `case04NeedsTargetDetailPhase2` | dead function | **삭제** (호출 0) |
| **DQ-C04-09** | Phase1 6 vs 4 | MASTER 스켈레ton | **4필드 골격 + P2 이관 유지**; DQ-C04-01 반영 후 P1 필드 순서·Stitch progress 재검증 |

---

## 9. Browser 검증 필요 (LEVEL 4)

- DQ 반영 후 P1 라벨·progress (4 vs 5 필드 결정 후)
- target 분기 P2 addDoc/modify/evidence/unclear 375px
- DI note 완료 게이트
- CASE_06 → CASE_04 bridge P1 선행

---

*조사 일자: 2026-09-24. STEP2는 Ace DQ 일괄 승인 후 CASE_03 우선순위와 별도 진행.*
