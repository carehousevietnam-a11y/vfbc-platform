# VFBCAI CASE_06 — 출시용 간소화 Brief v1

| 항목 | 내용 |
|------|------|
| **대표 결정** | 이번 출시에서 CASE_06 **전면 재설계·2차 재분류 체인**은 하지 않음. 질문 **최소화** 후 **「전문가 진행 요청」**으로 연결. **출시 후** v1.1 Master 재설계·STEP2-1 리메디 재개. |
| **구현 창** | 1번창 (IMPLEMENTER) |
| **검사 창** | 4번창 — `VFBCAI_ADMIN_VERIFY_CASE01-06_MANUAL_QA_SCENARIOS` CASE_06 절 **갱신안 §5** 적용 후 검사 |
| **금지** | 새 질문 문구·새 선택지·새 Profile slug 생성 |
| **SoT (현행 질문 원문)** | `src/lib/adminVerifyCase06Redesign.ts` · `docs/master/VFBCAI_CASE06_MASTER_REDESIGN_v1.1.md` |

---

## 0. 출시 퍼널 목표 (한 줄)

Q1 `unclear` → **Phase1만** (아래 §1) → **【대표 직접 클릭】** 간이 증거(선택) → 가입 → **간소화 1차 결과** → **전문가 진행하기** → 기존 CRM `expert_review_request` · 접수 완료 도장 UX.

**출시에서 하지 않음:** Phase2 체인(납부·출석·보완·처분·재확인 분기), CASE_02~05 **브릿지 재분류**, 2차 상세 질문 퍼널, AI 판단·판정 문장 생성.

---

## 1. 남길 질문 (기존 1차만 · 새 질문 없음)

출시 경로는 **v1.1 Phase1 고정 5문항** + 조건부 **단답형 1개**만 노출한다.  
**2차(Phase2) 질문은 출시에서 전부 숨김** (§4). Phase1 완료 시 프로필에 전문가 핸드오프 터미널 값을 기록하고 결과·CTA로 진행한다 (구현 상세는 1번창).

### 1.1 Phase1 선택형 (5)

각 문항은 **질문 문장·선택지 라벨을 코드/export 원문 그대로** 유지한다. 모든 선택형 공통: 마지막 선택지 **「위에 내용이 없거나 설명이 필요합니다 → 직접 입력」** (`value: other`) + `{fieldId}Note` 단답.

| # | Profile key | 질문 (원문) | 남기는 이유 (한 줄) |
|---|-------------|-------------|---------------------|
| P1-1 | `case06_requiredActionCandidate` | 문서에서 실제로 하라고 적혀 있거나, 상대방에게 설명받은 내용은 무엇인가요? | 전문가가 **무엇을 요구받았다고 인지**하는지 1차로 고정해야 접수·검토 범위를 잡을 수 있음. |
| P1-2 | `case06_knowledgeSource` | 이 내용을 실제로 어떻게 확인하셨나요? | **문서 직접 확인 vs 전달 설명 vs 기억**에 따라 증거·신뢰도가 달라짐. |
| P1-3 | `case06_sourceChannel` | 이 내용은 어디에서 어떻게 전달받으셨나요? | **발신·전달 경로**(기관 직접·대리·지인 등) 없이는 기관 확인·연락 전략을 세울 수 없음. |
| P1-4 | `case06_deadlineActionPair` | 기관에서는 언제까지 무엇을 하라고 안내했나요? | **기한·행위 결합**이 불명확 CASE의 공통 막힘 축이라 최소 1회 확보 필요. |
| P1-5 | `case06_customerResponse` | 그 안내를 받은 뒤 지금까지 실제로 어떻게 대응하셨나요? | **이미 한 행동**(미대응·문의·제출·납부 시도 등)이 다음 조치·리스크 판단의 전제. |

**P1-1 선택지 (원문 유지):**

1. 돈을 내라고 했습니다 (벌금·과태료·비용 등) — `pay_demand`
2. 어디로 가거나 출석해서 설명하라고 했습니다 — `attend_explain`
3. 서류를 제출하거나 빠진 내용을 보완하라고 했습니다 — `submit_supplement`
4. 이미 내려진 처분이나 제재를 통보받았습니다 — `disposition_notice`
5. 문제·위반이 있다고 했지만 무엇을 해야 하는지는 정확히 모릅니다 — `problem_action_unclear`
6. DI — `other` + `case06_requiredActionCandidateNote`

**P1-2 선택지:** `CASE06_KNOWLEDGE_SOURCE_OPTIONS` — `adminVerifyCase06Redesign.ts` L131–140 (5 + DI).

**P1-3 선택지:** `CASE06_SOURCE_CHANNEL_OPTIONS` — L142–148 (5 + DI).

**P1-4 선택지:** `CASE06_DEADLINE_ACTION_PAIR_OPTIONS` — L150–156 (5 + DI).

**P1-5 선택지:** `CASE06_CUSTOMER_RESPONSE_OPTIONS` — L158–167 (5 + DI).

### 1.2 Phase1 조건부 단답형 (기존 text 1종만)

| Profile key | 노출 조건 | 질문 (원문) | kind | 남기는 이유 |
|-------------|-----------|-------------|------|-------------|
| `case06_deadlineDate` | P1-4가 `deadline_pay_by_date` · `deadline_submit_by_date` · `deadline_attend_by_date` | 그 날짜·기한을 적어 주세요. | **단답형 text** | 기한 관련 안내를 골랐을 때 **원문 날짜·기한**이 CRM·전문가 인수에 필수. |

**출시에서 숨김 (Phase1):** `case06_paymentAmountText`, `case06_attendanceNoticeText`, `case06_dispositionEffectiveDateText` — 모두 **Phase2 체인 조건부 text**이므로 §4와 함께 비노출.

### 1.3 Phase2 — 출시에서 남기지 않음

v1.1의 2차 체인·재확인·브릿지용 질문은 **전부 숨김** (§4 목록).  
「전문가가 꼭 필요한 사실」은 **Phase1 + 증거 파일 + DI note**로 충족하고, 세부 재구성은 **전문가 인수 후** 진행.

### 1.4 자동 기록 필드 (질문 UI 없음 · 기존 slug 재사용)

Phase1 완료(및 구현에서 정의한 커밋 시점)에 아래를 설정해 `case06ExpertHandoffRequired` 결과·CTA와 맞춘다. **새 slug 없음.**

| key | 출시 값 | 용도 |
|-----|---------|------|
| `case06_classificationStatus` | `unresolved` | 분류 미완료·전문가 인수 |
| `case06_unresolvedReason` | `document_action_nature_unclear` | 불명확·혼재 사유 코드 |
| `case06_expertHandoffRequired` | `true` | 결과 패널 **전문가 전용 CTA** (`case06ExpertHandoffOnly`) |
| `case06_bridgeTargetCaseKey` | `CASE_06` (브릿지 스냅샷 시) | 타 CASE 재분류 **하지 않음** 고정 |

참고: 현행 터미널 판정 — `isCase06ExpertTerminal()` · `applyExpertTerminalFields()` — `adminVerifyCase06Redesign.ts` L621–627, L780–787.

### 1.5 레거시 복원 세션

`isCase06LegacyRestorePath()` — `case06_requiredActionCandidate` 없고 `case06_documentNature` / `profilePerceivedIssue` / `profileCurrentGoal` 등 존재 시 — **기존 답변 복원만** 허용. **신규 유입**은 v1.1 Phase1만. 레거시 Phase1·2 질문 세트는 신규 노출 금지 (§4.2).

---

## 2. 결과 화면 (출시 구성)

### 2.1 원칙

| # | 규칙 |
|---|------|
| S1 | **AI 판단·판정 문장 생성 금지** — `adminVerifyJudgment*` 기반 CASE_06 판단 클로즈·키 메트릭 **노출하지 않음**. |
| S2 | **확정 표현 금지** — 「반드시」「불법」「처벌 확정」 등. 안내·요약 톤만. |
| S3 | **가격 표시 금지** — 고객 UI 금액·견적·환율 없음 (헌법). |
| S4 | **응답 요약** — 통합 QA **R1** 동일: 직접 입력(날짜·금액·장소·DI note) + `첨부 자료: {파일명}`; **선택지 라벨 문장만의 요약 금지**. |
| S5 | **원문 최소 1회** — 통합 QA **R2**: 고객이 적은 text·note가 결과 어딘가에 그대로. |
| S6 | 선택지 라벨은 카드/필드에 **짧게 1회** — **R3** (동일 문장 반복 FAIL). |
| S7 | **문장 깨짐·제목≠내용** — **R4·R5** 동일 FAIL. |
| S8 | 출시 CASE_06은 **「판단 vs 선택 반대」 R6** 대신 **S1(판단 문장 없음)** 으로 검사. |

### 2.2 권장 섹션 구조 (1차 결과 · Phase2 생략)

1. **제목 (L1)** — 예: 「입력하신 내용을 바탕으로 정리했습니다」 (문구는 1번창이 기존 Admin 결과 톤에 맞춰 고정).
2. **입력 요약 (L3–L4)** — Phase1 답·DI note·`case06_deadlineDate` 원문·첨부 파일명. `buildCase06PrincipleFStateLines()`의 **직접 입력·날짜·금액 text** 성격만 활용 가능; **「앞서 분류: 납부」 등 재분류 암시 라인은 출시에서 제거·비노출** (브릿지 미사용).
3. **전문가 확인이 필요한 이유 (L4)** — 고정 설명 블록 (템플릿). 예시 방향:
   - 「안내·문서에 **여러 종류의 요구가 섞여 있거나**, 무엇을 먼저 해야 할지 **한 가지로 특정하기 어렵다**고 응답하셨습니다.」
   - 「이 상태에서는 자동 판단 대신 **VFBCAI 전문가팀**이 자료와 입력 내용을 함께 확인하는 것이 안전합니다.」
   - P1-1이 `problem_action_unclear` 또는 DI인 경우 위 문장과 **모순 없이** 연결 (반대 의미 문장 금지).
4. **다음 단계 (L3)** — `AdminVerifyPersonalizedNextSteps` **`case06ExpertHandoffOnly`** 단일 카드:
   - 제목: 「전문가 확인 요청하기」
   - 버튼: 「전문가 진행하기」
   - **AI 리포트 카드 숨김** (기존 prop · `AdminVerifyFirstResultPanel.tsx` L3972–3986).
5. **출시에서 제거·축소할 결과 신호** — `appendCase06V11Phase2ResultSignals` 전체·체인별 cautions; Phase1의 **선택지 기반 cautions** (예: 「아직 기관 안내에 대한 별도 대응이 없는 상태로 응답함」)는 **판단 문장에 해당하면 제거**하고, 필요 시 **입력 요약으로 대체**.

### 2.3 참고 코드 (읽기 전용)

| 역할 | 위치 |
|------|------|
| Phase1 결과 신호 | `AdminVerifyFirstResultPanel.tsx` — `appendCase06V11Phase1ResultSignals` L270–294 |
| Phase2 결과 신호 (출시 미사용) | 동일 파일 `appendCase06V11Phase2ResultSignals` L354–451 |
| 전문가 전용 CTA | `AdminVerifyPersonalizedNextSteps` · `case06ExpertHandoffOnly` L3950–4032 |
| 상태 라인 | `buildCase06PrincipleFStateLines` — `adminVerifyCase06Redesign.ts` L445–484 |
| 응답 요약 매핑 | `adminVerifyResponseSummary.ts` (CASE_06 필드) |

---

## 3. 「전문가 진행 요청」 연결 (기존 흐름 유지)

변경 없이 **현행 Admin VERIFY 전문가 요청**을 사용한다.

| 단계 | 동작 | 코드·API |
|------|------|----------|
| 1 | 결과 화면 **「전문가 진행하기」** 클릭 | `onAdminVerifyExpert` → `handleExpertRequest` |
| 2 | CRM 활동 insert | `supabase.from("crm_activities").insert` — `action: "expert_review_request"`, `tag: "VERIFY_ADMIN"`, `meta`: `expert_brief` + `buildAdminExpertHandoffMeta(...)` |
| 3 | 세션·리다이렉트 | `ensureBrowserSessionForResultToken` · 복원 리드 시 `/mypage` |
| 4 | 접수 완료 UX | 레거시 퍼널 `step === "completed"` — `/vfbc-seal.png` · 「전문가 검토 요청이 접수되었습니다」 (`verify/admin/page.tsx` L2266–2285). Master 퍼널은 동일 핸드오프 메타·마이페이지·관리자 **「접수 완료」** 도장 흐름 유지. |

**금지:** 신규 CRM action 타입, 별도 결제·가격 단계, CASE_06 전용 expert API.

**구현 체크:** `leadId` 존재 후 버튼 활성; `case06_expertHandoffRequired` 시 UI가 이미 `case06ExpertHandoffOnly` 경로를 지원함 (`AdminVerifyFirstResultPanel.tsx` L4539).

---

## 4. 제거·숨길 질문 및 코드 위치 (조사만 · 2026-09-25)

### 4.1 v1.1 Phase2 — 체인 ①~⑤ 전부 (신규 CASE_06 출시 경로)

**파일:** `src/lib/adminVerifyCase06Redesign.ts`

| 체인 | 질문 id | 질문 라벨 (원문) |
|------|---------|------------------|
| ① 납부 | `case06_paymentNature` | 무엇에 대한 비용이라고 안내받았나요? |
| | `case06_paymentAmountKnown` | 얼마를 내라고 안내받았나요? |
| | `case06_paymentSituationMatch` | 그 금액이 실제 본인 상황과 맞다고 생각하시나요? |
| | `case06_paymentAuthorityCheck` | 기관에 직접 확인해 보셨나요? |
| | `case06_paymentResponse` | 지금까지 실제로 어떻게 하셨나요? |
| | `case06_paymentNonPaymentNotice` | 기한 내 내지 않으면 어떻게 된다고 안내받았나요? (조건부) |
| ② 출석 | `case06_attendanceSubject` | 무엇에 대해 출석하거나 설명하라고 했나요? |
| | `case06_attendanceFactMatch` | 기관이 문제 삼는 내용이 실제 상황과 맞다고 생각하시나요? |
| | `case06_attendanceNoticeDetail` | 언제, 어디서, 어떤 방식으로 통지받았나요? |
| | `case06_attendanceResponse` | 지금까지 실제로 어떻게 대응하셨나요? |
| | `case06_attendanceAuthorityReaction` | 대응 이후 기관은 어떻게 반응했나요? (조건부) |
| ③ 보완 | `case06_submissionRequirement` | 기관에서는 어떤 서류나 내용을 다시 제출·보완하라고 했나요? |
| | `case06_submissionReason` | 그 보완을 요구받은 이유를 기관에서는 어떻게 설명했나요? |
| | `case06_submissionRelation` | 그 설명이 실제 본인 상황과 어떻게 연결된다고 알고 계신가요? |
| | `case06_submissionResponse` | 안내를 받은 뒤 실제로 무엇을 제출·설명하셨나요? |
| | `case06_submissionAuthorityReaction` | 그 후 기관에서는 어떻게 답변하거나 다시 요구했나요? |
| | `case06_submissionEvidence` | 현재 가지고 있는 자료 중 이 내용을 확인할 수 있는 것은 무엇인가요? (조건부) |
| ④ 처분 | `case06_dispositionTypeCandidate` | 어떤 처분이라고 안내받았나요? |
| | `case06_dispositionReason` | 그 처분의 이유를 기관에서는 어떻게 설명했나요? |
| | `case06_dispositionFactMatch` | 그 이유가 실제 본인 상황과 맞다고 생각하시나요? |
| | `case06_dispositionEffectiveDate` | 이 처분은 언제부터 효력이 생긴다고 안내받았나요? |
| | `case06_dispositionResponse` | 지금까지 실제로 어떻게 대응하셨나요? |
| ⑤ 불명확·재분류 | `case06_unclearContentRecheck` | 그 문서나 안내에서 기관이 실제로 언급한 내용은 무엇인가요? |
| | `case06_unclearFactRelation` | 기관이 지적한 내용이 실제 본인 상황과 어떤 관계가 있다고 생각하시나요? |
| | `case06_unclearResponse` | 지금까지 이 건에 대해 실제로 무엇을 하셨나요? |

**Phase2 조건부 text (출시 숨김):**

| key | 라벨 |
|-----|------|
| `case06_paymentAmountText` | 안내받은 금액을 적어 주세요. |
| `case06_attendanceNoticeText` | 출석·설명 날짜·장소·방식을 적어 주세요. |
| `case06_dispositionEffectiveDateText` | 처분 발효일을 적어 주세요. |

**진입·완료 게이트 (출시에서 Phase2 완료 요구 제거 대상):**

| 함수 | 파일 | 줄(대략) |
|------|------|----------|
| `appendCase06RedesignPhase2Questions` | `adminVerifyCase06Redesign.ts` | L931–952 |
| `appendPaymentChain` / `Attendance` / `Submission` / `Disposition` / `appendUnclearChain` | 동일 | L813–907 |
| `isCase06Phase2ChainComplete` | 동일 | L736–753 |
| `isCase06AwaitingBridgeSnapshot` · `applyCase06BridgeSnapshot` | 동일 | L755–811 |
| `isAdminVerifyPhase2PathComplete` CASE_06 분기 | `adminVerifyProfiling.ts` | L11097–11105 |
| `resolveCase06Phase2ChainId` · `CASE06_CANDIDATE_TO_CHAIN` | `adminVerifyCase06Redesign.ts` | L530–604, L594–604 |

**브릿지·타 CASE 이어하기 (출시 비활성):** `CASE06_CANDIDATE_TO_TARGET_CASE`, `getAdminVerifyActiveQuestionCase` CASE_02~05 스킵 로직 — `adminVerifyProfiling.ts` (CASE_06 브릿지 이후 분기).

### 4.2 레거시 Phase1·Phase2 (신규 노출 금지 · 복원만)

**파일:** `src/lib/adminVerifyProfiling.ts` — `appendCase06Phase1Questions` L8201–8247, `appendCase06Phase2Questions` L8249–8327, `appendCase06PathQuestions` L8330–8344.

| id | 질문 라벨 |
|----|-----------|
| `case06_documentNature` | 교통국에서 받은 문서는 어떤 내용이라고 들으셨나요? |
| `profilePerceivedIssue` | 지금 이 문서에서 가장 먼저 확인하고 싶은 것은 무엇인가요? |
| `profileDocumentSource` | 이 문서의 내용을 어떻게 알게 되셨나요? |
| `profileCurrentGoal` | 교통국에서는 이 문서를 받은 뒤 무엇을 하라고 안내했나요? |
| `profileAuthorityGuidance` | 언제까지 무엇을 해야 한다고 안내받으셨나요? |
| `case06_exactSource` | 이 문서·통지는 어디에서 보낸 것으로 알고 계신가요? |
| `case06_keyPhrase` | 문서나 설명에서 기억나는 핵심 내용은 무엇인가요? |
| `case06_requiredAction` | 이 문서를 받은 뒤 실제로 무엇을 해야 한다고 이해하셨나요? |
| `case06_receiptPath` | 이 문서·통지는 어떤 상황에서 받게 되셨나요? |
| `case06_actualCore` | 이 문서를 받기 직전에 실제로 어떤 일이 있었나요? |
| `case06_blockage` | 지금 이 문서 사건에서 가장 막혀 있는 부분은 무엇인가요? |
| `case06_evidence` | 지금 확인할 수 있는 자료가 있나요? |
| `case06_finalGoal` | 이 문서 사건에서 어떤 결과를 원하시나요? |

### 4.3 결과·요약·테스트 (출시 조정 참고)

| 파일 | 비고 |
|------|------|
| `AdminVerifyFirstResultPanel.tsx` | `appendCase06V11Phase2ResultSignals`, 체인별 cautions |
| `adminVerifyResponseSummary.ts` | Phase2 필드 요약 매핑 축소 |
| `adminVerifyKeyMetricManifest.ts` / `adminVerifyJudgmentRuntime.ts` | CASE_06 판단 노출 시 제거 |
| `tests/qa/case06-step2-1-spot.mjs` 등 | 출시 후 리메디·회귀용 — 출시 검사는 §5 수동 시나리오 |

### 4.4 출시 후 재개 (참고만 · 이번 Brief 범위 밖)

- `VFBCAI_CASE06_PHASE2_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md`
- `VFBCAI_CASE06_MASTER_REDESIGN_v1.1.md` 전체 체인

---

## 5. 통합 검사 시나리오 v2 — CASE_06 갱신안

**대상:** `docs/master/VFBCAI_ADMIN_VERIFY_CASE01-06_MANUAL_QA_SCENARIOS_v2.md` §H · §D6 · §I (구현·Brief 반영 후 **v2.1 또는 CASE_06 부록**으로 병합 권장).

### 5.1 A.2 질문 규칙 — CASE_06 예외

| # | 기존 | 출시 CASE_06 |
|---|------|----------------|
| Q1 | 2차 실질 질문 > 1차 | **예외:** Phase2 **미노출**이면 「Phase2 질문 0개」가 정상. **FAIL 아님.** |
| Q2 | 목표 두 번 금지 | `case06_finalGoal`·타 CASE `confirmGoal` **노출 없음** → **예** |
| Q3 | 동일 신호 반복 금지 | Phase1만이면 P1-2·P1-3·P1-1 **중복 의미 재질문 없음** 확인 |

### 5.2 §H 경로 (4종 유지 · 내용 교체)

| 코드 | 출시 시나리오 |
|------|----------------|
| **가** | Q1 `unclear` → P1-1 `problem_action_unclear` → P1-2~5 번호 선택 완료 → P1-4 `deadline_submit_by_date` → text **`CASE06-LAUNCH-DEADLINE-2026-11-15`** → 가입 → **1차 간소화 결과** → **전문가 진행하기** 클릭 → 접수 완료(도장 또는 마이페이지) 확인. **Phase2·pay_demand 체인 없음.** |
| **나** | P1-1 **DI** → note **`CASE06-LAUNCH-DI-ACTION-OMEGA`** → 나머지 P1 번호 → 결과에서 **note 원문 1회 이상** |
| **다** | P1-4 `deadline_pay_by_date` 선택 후 **`case06_deadlineDate` 비움** → 진행 **불가** 확인 (기존 게이트 유지) |
| **라** | P1 완료 전/후 퍼널 **【대표 직접 클릭】** `CASE06-UPLOAD-REPRESENTATIVE.pdf` → 결과 요약 **`첨부 자료: CASE06-UPLOAD-REPRESENTATIVE.pdf`** |

### 5.3 §D6 체크리스트 (예/아니오 · 출시版)

| # | 항목 | 예 |
|---|------|-----|
| 1 | Phase1 **5문항만** 노출되고 Phase2 체인 질문이 **없음** | |
| 2 | **R1** 응답 요약 = 직접 입력 + 첨부 파일명 (선택지 라벨만 요약 **아님**) | |
| 3 | **R2** `CASE06-LAUNCH-*` 원문이 결과에 **≥1회** | |
| 4 | **R3·R4·R5** (반복·깨짐·제목≠내용) 통과 | |
| 5 | **AI 판단·판정 문장 블록 없음** (S1) | |
| 6 | **가격·확정 표현 없음** (S3) | |
| 7 | 「여러 요구·특정 어려움」**전문가 필요 이유** 문단 표시 | |
| 8 | **AI 리포트 CTA 없음** · **전문가 진행하기**만 (또는 동등 단일 카드) | |
| 9 | 전문가 클릭 후 **CRM 접수·접수 완료** 기존 흐름 동작 | |
| 10 | **case02_* 등 타 CASE 필드로 답 복사 UI 없음** (구 브릿지 원칙 F → 출시는 브릿지 없음) | |

**삭제:** v2 §H의 `pay_demand`·납부 P2 chain·「타겟 질문 skip」·§D6 항목 9(구 원칙 F) 단독 — 위 10번으로 대체.

### 5.4 §I 매트릭스

CASE_06 행은 동일; **「2차 결과」열 검사 없음** — **1차 간소화 결과 + 전문가 CTA**만 PASS 조건.

---

## 6. 1번창 구현 체크리스트 (요약)

- [ ] 신규 `unclear` 세션: `appendCase06RedesignPhase1Questions` only; Phase2 append **no-op** 또는 게이트 우회.
- [ ] Phase1 complete → `applyExpertTerminalFields` (또는 동등) + bridge `CASE_06` only.
- [ ] `isAdminVerifyPhase2PathComplete` CASE_06: 체인·브릿지 **요구 제거**.
- [ ] 결과: S1–S7 · §2.2 섹션; `case06ExpertHandoffOnly` true.
- [ ] `handleExpertRequest` 변경 없음.
- [ ] `npx tsc --noEmit` · 4번창 §5 수동 QA.

---

## 7. 문서 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| v1 | 2026-09-25 | 출시 간소화 Brief 초안 (4번창 · 문서만) |

---

*v1 · 문서만 · push 없음 · 구현은 1번창*
