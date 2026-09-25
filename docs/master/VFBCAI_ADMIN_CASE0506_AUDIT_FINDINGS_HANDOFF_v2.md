# Admin CASE_05 / CASE_06 — 감사 발견 요약 (2번창 공통 자료)

| 항목 | 내용 |
|------|------|
| **용도** | 4번창 CASE_05/06 **개별 조사 중단** 시점 스냅샷. 2번창 통합 감사·수동 QA 입력 |
| **증거** | LEVEL 1 감사 문서 + `adminVerifyProfiling.ts` / `adminVerifyCase06Redesign.ts` / `AdminVerifyFirstResultPanel.tsx` |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (fa4cce9) |
| **코드** | 본 문서는 수정 지시 아님 |

**관련 SoT:** `VFBCAI_CASE05_INFORMATION_COMPLETENESS_AUDIT_v1.md`, `VFBCAI_CASE06_INFORMATION_COMPLETENESS_AUDIT_v1.md`, `VFBCAI_CASE05_PHASE2_REMEDIATION_STEP2-0_v1.md`, `VFBCAI_CASE06_PHASE2_REMEDIATION_STEP2-0_v1.md` (설계·Brief LOCK).

---

## 1. CASE_05 — 핵심 발견

### 1.1 값 누락 (날짜·slug)

| 이슈 | 위치 (LEVEL 1) | 내용 |
|------|----------------|------|
| **`specific_date` 날짜 미저장 (감사 시)** | `adminVerifyProfiling.ts` `appendCase05Phase1Questions` (~5666–5671), `buildCaseResolutionProfile` deadline (~8747–8761), `CASE05_ANSWER_KEYS` (~4957–4972) | choice만 저장. 감사: Profile `deadline`은 라벨만 |
| **리메디 설계·구현 흔적** | `CASE05_DEADLINE_DATE_KEY` `case05_deadlineDate` (~449), `case05NeedsDeadlineDateDetail` (~5908), Phase1 text push (~6770–6770대), `AdminVerifyFirstResultPanel` deadline 분기 (~543–546, ~2985–2987) | STEP2-0/STEP2-1 Mission. **수동 QA:** `specific_date` 선택 후 text 입력 시 1차·Profile에 **원문 날짜**가 보이는지 확인 (미입력 시 「확인됨」만 나오면 FAIL) |
| **기한 4값 장식** | 감사 §1.4 `case05_deadline` | `uncertain` / `period_stated` / `not_stated` / `unsure` — 신호·결과 동일. `AdminVerifyFirstResultPanel` + `deriveDispositionSignals` (~5985–5994) |
| **Profile 단절 5필드** | 감사 18행, `adminVerifyProfiling.ts` CASE_05 detail 키 | `dispositionDetail`, `factDetail`, `explanationDetail`, `submittedDocsDetail`, `appealDetail` — **답만 있고 Profile 칸 미갱신** → ② FAIL. 리메디 STEP2-0 §2.1 |

### 1.2 문장·결과·신호

| 이슈 | 위치 | 내용 |
|------|------|------|
| **결과 문장 동일 합침** | `AdminVerifyFirstResultPanel.tsx` CASE_05 분기 (~261, ~964, ~1022, ~3147, ~3326) | `disposition_unclear` vs `other`, `what_to_do`/`unsure`/`other` confirmGoal 등 **caution·통합문 동일** (감사 §1.1–1.3) |
| **`customerResponse` inquired** | 감사 §1.3 | 다음 질문은 갈라지나 **전용 result 문장 없음** |
| **증거 게이트** | 감사 서두 | `case05_evidence`는 일부 customerResponse/dispositionType에만. 선택지와 upload gate **분리** |

### 1.3 장식·비율 (LOCK)

| 이슈 | 내용 |
|------|------|
| **1차=2차 FAIL 후보** | 감사: Phase1 실질 4, Phase2 실질 6 + detail 5 실질화 전 — **4:6 하한 경계** (리메디 R06 목표 ≥10) |
| **장식 Phase2** | `blockage` / `finalGoal` / 일부 detail — 값 변경 시 result 동일 (감사 §2) |

### 1.4 slug·라벨

| 이슈 | 위치 | 내용 |
|------|------|------|
| **legacy deadline slug** | `CASE05_DEADLINE_LEGACY_TO_CANONICAL` (~5896–5903) | `known_date` → `specific_date` 등. UI 라벨 vs 저장 slug 불일치 시 요약 깨짐 QA |
| **disposition type legacy** | `case05DispositionTypeIsRightsEnded` 등 (~5871+) | 옛 slug 세션 read-only |

---

## 2. CASE_06 — 핵심 발견

### 2.1 값 누락 (Admin `specific_date` 동종)

| 선택 slug | 코드 | 잃는 값 |
|-----------|------|---------|
| `deadline_pay_by_date` / `deadline_submit_by_date` / `deadline_attend_by_date` | `adminVerifyCase06Redesign.ts` `CASE06_DEADLINE_ACTION_PAIR_OPTIONS` (~131–136), Phase1 push (~735) | **날짜 문자열** |
| `exact_amount_known` | `CASE06_PAYMENT_AMOUNT_KNOWN_OPTIONS` (~157–161), `appendPaymentChain` (~636) | **금액** |
| `date_place_method_known` | attendance options (~205–209), (~654) | 날짜·장소·방식 |
| `exact_effective_date` | disposition (~290–294), (~688) | 발효일 |
| 레거시 `profileAuthorityGuidance=specific_date` | `adminVerifyProfiling.ts` `deriveUnclearSignals` (~6833–6838) | slug만. **기한 신호에도 미포함** |

리메디 설계: `case06_deadlineDate` 등 4 text 키 — `VFBCAI_CASE06_PHASE2_REMEDIATION_STEP2-0_v1.md` §1.

### 2.2 브릿지·타겟·결과 단절

| 이슈 | 위치 | 내용 |
|------|------|------|
| **타겟 시드 없음** | `seedCase02AnswersFromCase06Handoff` (~7837–7846) | `case02_*` 등 **미기입** (의도) |
| **체인 답이 결과에 없음** | `AdminVerifyFirstResultPanel.tsx` (grep `case06_payment` **0건**) | v1.1 `case06_payment*` 등 **미표시** |
| **1차 장식 4필드** | v1.1 Phase1 `knowledgeSource` 등 | needs·결과 **불변** → 비율에서 제외·① FAIL |
| **처분 체인 1:0** | `isChainDispositionComplete` (~523), 결과 미연결 | 2차 실질 0 → **1차>2차 FAIL** |

### 2.3 STOP·비율

| 이슈 | 위치 | 내용 |
|------|------|------|
| **`signal_violation` 조기 STOP** | `appendUnclearChain` (~705–707, ~708–714), `isChainUnclearExpertComplete` (~542–544) | 재확인 1개 후 종료 → **1:1 FAIL**. 리메디 R05: 두 질문 추가 후 expert |
| **납부·출석·보완 1:1** | 감사 §3 | 체인 choice가 결과·타겟에 안 감 → 실질 축 1:1 |

### 2.4 slug·재분류

| 이슈 | 위치 | 내용 |
|------|------|------|
| **레거시 5필드** | `inferCase06ReclassificationTarget`, legacy `appendCase06Phase2Questions` | `exactSource`/`keyPhrase`/`receiptPath`는 재분류 맵 **외** |
| **Q1 vs effective case** | `getEffectiveAdminVerifyCase` | Q1=CASE_06 유지 + bridge target 별도 — 수동 QA에서 혼동 포인트 |

---

## 3. 공통 패턴 (CASE_01~04와 묶어 2번창에서 쓸 키워드)

| 패턴 | 대표 | CASE_05/06 |
|------|------|------------|
| **specific_date류** | 날짜 slug without text key | 05(감사·리메디), 06 deadline pair / effective date |
| **합성 result 문장** | 「기한 확인됨」without date | `AdminVerifyFirstResultPanel` integrated situation (~810, ~1213, ~3060) |
| **장식 카드/축** | Profile 1칸만·caution 동일 | 05 detail 5, 06 phase1 4 + disposition 4 |
| **원문 반복** | summary에 같은 문장 2회 | DI note vs choice label 중복 — QA 체크리스트 항목 |
| **slug 불일치** | legacy read map vs UI label | 05 deadline, 06 legacy restore vs v1.1 |

---

## 4. 2번창 권장 액션 (참고)

1. 통합 표: CASE_01~06 **데이터 손실 행**을 위 패턴으로 한 시트에 정리 (본 문서 §1–2 + CASE_01~04 audit §데이터 손실).
2. 수동 QA: `VFBCAI_ADMIN_VERIFY_CASE01-06_MANUAL_QA_SCENARIOS_v1.md` 실행·결과 기록.
3. 코드 수정 Mission은 Brief LOCK 후에만 (05/06 리메디 Brief는 별도 창).

---

*2026-09-25. 4번창 CASE_05/06 개별 조사 중단. push 없음.*
