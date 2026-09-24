# CASE_01 Information Completeness Audit

| 항목 | 내용 |
|------|------|
| **성격** | **LOCK된 CASE_01**에 대한 정보완결성 감사. **재작업 필요 여부 판단용** — 즉시 수정 Mission 아님 |
| **범위** | 감사만. 코드·문구·선택지·구조 **미변경**. 기존 PASS/QA 미재실행 |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (커밋 `fa4cce9`). 재해석 없음 |
| **증거** | LEVEL 1. `adminVerifyProfiling.ts` 질문·needs·`buildCaseResolutionProfile`·신호, `AdminVerifyFirstResultPanel.tsx` 결과 문장 |
| **대조** | 형식: `VFBCAI_CASE05_INFORMATION_COMPLETENESS_AUDIT_v1.md` |

조사일: 2026-09-25.

업로드 증거 게이트는 선택지와 분리된다. 표의 「증거 요구」는 `case01_evidence` 노출·`none`/`unsure` 신호를 뜻한다.

---

## 0. 질문 구조 (코드)

**Phase1** (`isCase01Phase1Complete`, `appendCase01Phase1Questions` ~1196–1264) — **5개 고정**

1. `case01_violationContent`
2. `case01_factRelationship`
3. `case01_customerResponded`
4. `case01_deadline`
5. `case01_confirmGoal`

**Phase2** (`appendCase01Phase2Questions` ~1321–1500) — 조건부 체인

`authorityDemand` → (`paymentDemandScope` \| `supplementDemandScope`) → `actualSituation` → (`deadline` 재질문) → `case01_deadlineDate` text → `case01_factDifferenceDetail` text → `case01_factRelationshipNote` text → `case01_datePlaceDetail` text → `responseDetail` → `authorityResponse` → `authorityDemandDetail` → `evidence` → adaptive(`authorityDemand` note, `authorityResponse` note, `blockage`, `finalGoal`)

**Profile에 매핑되는 CASE_01 칸** (`buildCaseResolutionProfile`)

| Profile | 주 소스 |
|---------|---------|
| `event` | `violationContent` (+ `other` note) |
| `authorityClaim` | `authorityDemand` 라벨만 |
| `goal` | `finalGoal` \|\| `confirmGoal` |
| `customerAction` | `responseDetail` \|\| `customerResponded` |
| `deadline` | `deadline`; `confirmed` + `case01_deadlineDate` → `대응 기한: {date}` |
| `actualSituation` | `actualSituation` \|\| `factRelationship`에서 infer 라벨 |
| `factRelationship` | slug |
| `authorityResponse` | `authorityResponse` (+ note follow-up은 별도 키) |
| `currentBlockage` | `blockage` |
| `evidence` | `evidence` |

**답변 키만 있고 Profile 칸을 덮지 않음:** `paymentDemandScope`, `supplementDemandScope`, `authorityDemandDetail`, **`case01_factDifferenceDetail`**, **`case01_datePlaceDetail`**. (`paymentDemandScope`/`supplementDemandScope`는 **재분류** `classifyFromCase01Answers` ~8137–8151에만 사용.)

---

## 0.1 데이터 손실 패턴 (날짜·장소·차이 텍스트)

03/04/05/06과 동일 패턴을 CASE_01에서 추적한다.

| 패턴 | 수집 | Profile / 1차 결과 | 판정 |
|------|------|-------------------|------|
| **기한 날짜** | Phase1 `deadline=confirmed` 가능. **날짜 text는 Phase2만** (`CASE01_DEADLINE_DATE_KEY`, `case01NeedsDeadlineDateDetail` ~1022–1024) | Phase2 완료 전: `deadline`은 choice 라벨만 (~9027–9029). 1차 결과 `appendCase01Phase1ResultSignals`: `confirmed` 시 통지서 재확인 action만, **입력 날짜 미반영** | **경계 손실** (1차 결과 시점). Phase2 완료 후 Profile에는 날짜 반영 — **완료 경로 OK** |
| **사실 차이 텍스트** | `partial_situation` / `deny_action` 등 → `case01_factDifferenceDetail` text 필수 (~1409–1419) | `getCase01ActualSituationLabel`은 choice·infer만 (~759–767). **text 미합성** | **손실** (수집 후 Profile·결과 문장에 미반영) |
| **날짜·장소 텍스트** | `date_place_wrong` → `case01_datePlaceDetail` (~1436–1445) | Profile `actualSituation` / `factRelationship`에 **미반영** | **손실** |
| **납부·보완 범위** | `paymentDemandScope` / `supplementDemandScope` | Profile `authorityClaim` 미반영. `core_case`만 CASE_02/04 재분류 | **정보 단절** (재분류 외 판단 축 약함) |

CASE_05 `specific_date`와 달리 CASE_01은 **날짜 수집·Profile 경로가 존재**하나, **1차 종합 결과 전**에는 날짜가 비는 구조가 같다.

---

## 1. Phase1

### 1.1 `case01_violationContent`

Profile: `event`.

| 선택지 | Profile | 다음 질문 | 증거 | 결과 |
|--------|---------|-----------|------|------|
| `traffic` / `administrative` / `labor_tax` / `other_stated` | 각 라벨 | 동일 Phase1 진행 | 없음 | `other` 외 `actions`에 라벨 인용 (~1224–1226) |
| `explanation_unknown` | 불명 라벨 | 동일. Phase2에서 CASE_06 재분류 후보 (~8113–8125) | 없음 | `unsure`와 유사 미확인 축 |
| `other` | note → event | 동일 | 없음 | note 의존 |

내용 4+DI는 **이벤트 라벨·재분류**에 실질. 세부 위반 유형 간 Phase2 게이트 차이는 작다.

### 1.2 `case01_factRelationship`

Profile: `factRelationship`, `actualSituation`(infer).

| 선택지 | Profile | 다음 Phase2 | 증거 | 결과 |
|--------|---------|-------------|------|------|
| `match` | 일치 | text follow-up **없음**. `blockage`는 다른 조건 (~1027–1040) | 없음 | Phase2 `rel=match` metric (~1694+) |
| `date_place_wrong` | 라벨 | **`datePlaceDetail` text** | 없음 | caution 날짜·장소 (~1279–1280). **text는 Profile 손실** |
| `deny_action` / `partial_situation` | 라벨 | **`factDifferenceDetail` text** | 없음 | caution·action (~1274–1278). **text 손실** |
| `unknown` | 라벨 | `factRelationshipNote` text **또는** `factDifference` 경로 아님 (~1422–1433) | 없음 | `unknown` → `blockage` (~1028–1029) |
| `other` | note | text needs에 따라 | 없음 | `hard_to_explain`류 caution |

**실질 축.** `match` vs 불일치 계열은 text·blockage·결과가 갈라진다.

### 1.3 `case01_customerResponded`

Profile: `customerAction`(Phase1 단계).

| 선택지 | Profile | Phase2 | 결과 |
|--------|---------|--------|------|
| `none` | 미대응 | `responseDetail` / `authorityResponse` **스킵** (~938–947) | caution 미대응 (~1238–1240) |
| `has_responded` | 대응함 | `responseDetail` → `authorityResponse` 체인 | legacy slug는 result에 잔존 참조 (~1241–1246) |
| `other` | note/DI | `case01CustomerRespondedImpliesAction`에 따라 response 체인 | DI note 필요 |

**실질 축** (대응 트랙 on/off).

### 1.4 `case01_deadline`

Profile: `deadline` (날짜는 Phase2 text).

| 선택지 | Profile | Phase2 | 결과 |
|--------|---------|--------|------|
| `confirmed` | 확인 라벨 | **`case01_deadlineDate` text** | Phase1 signal: 기한 확인 caution (~1248–1250). **날짜 없이** |
| `uncertain` / `asap` / `no_stated` / `unknown` | 각 라벨 | 재질문은 `case01NeedsDeadlinePhase2`만 (이미 완료면 스킵) | `uncertain`·`no_stated`·`unknown`·`unsure`류 **미확인 묶음** (~1254–1263). `asap`/`overdue_concern`은 `blockage` (~1031–1034) |
| `other` | note | 동일 | legacy `overdue_concern` 등 result 분기 잔존 |

**부분 실질:** `confirmed` vs 미확인 묶음 vs `asap`(blockage). **미확인 4값**은 신호·문장 **동일**에 가깝다 → 장식 선택지.

### 1.5 `case01_confirmGoal`

Profile: `goal`.

| 선택지 | Phase2 adaptive | 결과 |
|--------|-----------------|------|
| `verify_applicability` / `why_notice` / `fact_difference` / `what_when` / `procedure_followup` | `finalGoal`는 **`other`·불명 goal만** (~1012–1019) | goal별 caution/action (~1229–1236) |
| `other` | `finalGoal` + `blockage` 후보 | `unsure`류 미확인 |

**실질 축** (결과 문장 분기). `what_when` vs `procedure_followup` 등 일부는 문장만 다름.

---

## 2. Phase2 (요약 표)

### 2.1 `case01_authorityDemand`

Profile: `authorityClaim`. 재분류: `payment`+`core_case`→CASE_02, `supplement`+`core_case`→CASE_04, 불명→CASE_06 (~8137–8164).

| 값 | 다음 질문 | 결과/신호 |
|----|-----------|-----------|
| `payment` | `paymentDemandScope` | scope `core_case`만 재분류 강함 |
| `supplement` | `supplementDemandScope` | 동형 |
| `attendance` / `correct_record` | scope 없음 | demand 라벨만 authorityClaim |
| `demand_unclear` / `other` | unclear note 또는 `authorityDemandDetail` | blockage (~1036–1037) |

**실질 축.**

### 2.2 `paymentDemandScope` / `supplementDemandScope`

Profile **미반영**. `core_case`만 재분류·FOCUS rank (~9545–9546).

| 값 | downstream |
|----|------------|
| `core_case` | CASE_02 / CASE_04 inferred |
| `included_with_other` / `additional_guidance` / `unsure` | 다음 질문 동일. 결과 동일 |

**질문 단위: 장식에 가깝음** (재분류 1값만 실질).

### 2.3 `case01_actualSituation`

Profile: `actualSituation` (explicit 우선 ~754–767).

Phase2에서 **항상 노출** (~1375–1382). choice는 Profile·risk에 반영. 세부 값 간 **needs* 추가 분기는 제한적** → 일부 선택지는 라벨만 다름.

**실질 축** (Profile 칸 직접).

### 2.4 text follow-up (`deadlineDate`, `factDifferenceDetail`, `datePlaceDetail`, notes)

| id | 수집 | Profile | 판정 |
|----|------|---------|------|
| `case01_deadlineDate` | `confirmed` | **반영** | 실질 (날짜 축) |
| `case01_factDifferenceDetail` | 불일치 경로 | **미반영** | **장식 질문** (④) |
| `case01_datePlaceDetail` | `date_place_wrong` | **미반영** | **장식 질문** (④) |
| `case01_factRelationshipNote` | `unknown` | note는 Profile 직접 칸 없음 | 미확인 보조 — Profile 단절 |

### 2.5 `responseDetail` / `authorityResponse`

Profile: `customerAction`, `authorityResponse`. follow-up text on `more_required` / `no_reply_yet` / `other` (~1287–1295, ~992–1009).

**실질 축** (대응 트랙).

### 2.6 `authorityDemandDetail`

불명 demand의 `other` 등에서만 (~956–971). Profile **미반영**. 값(`clear_guidance` / `partial_guidance` / …) 간 needs·result **동일** → **장식**.

### 2.7 `case01_evidence`

Profile: `evidence`. `none` → unknowns (~8367–8369).

자료 종류(`notice` / `message` / …) 간 **다음 질문 동일**. 결과 문장 차이 **LEVEL 1 미추적** → 종류 값은 **장식 선택지** (CASE_05 2.12 동형).

### 2.8 `blockage` / `finalGoal`

`blockage`: 조건부 (~1027–1040). Profile `currentBlockage`. 값별 result **약함** → **장식에 가깝음**.

`finalGoal`: `confirmGoal` unclear일 때만. Profile `goal` override — **조건부 실질**.

---

## 3. 판정 (LOCK 기준)

### ① 정보완결성 — **FAIL (경미~중등)**

LOCK CASE이나 기준 자체는 동일 적용. 사실 차이·날짜·장소를 **text로 받은 뒤 Profile에서 다시 물어야 하는** 구조가 `factDifferenceDetail` / `datePlaceDetail`에 남아 있다. 기한은 Phase2 완료 시 복구.

| 축 | CASE_01 |
|----|---------|
| 원인·위반 내용 | `violationContent` + Phase2 `authorityDemand` |
| 사실·쟁점 | `factRelationship` + `actualSituation`; **차이·장소 text 손실** |
| 기한 | slug + (조건부) 날짜 text |
| 기관 요구·대응 | demand + response 트랙 |
| 증거 | `evidence` (종류 세분은 약함) |

**재작업 판단:** CASE_05 수준의 전면 Phase2 실질화 **필수는 아님**. text→Profile 합성·1차 결과 기한 표시는 **개선 후보**.

### ② 다중신호성 — **FAIL (부분)**

실질 분기: `factRelationship`, `customerResponded`, `authorityDemand`, `payment`/`supplement` scope `core_case`, response 트랙, `confirmed` deadline+date.

라벨만: 기한 미확인 묶음, evidence 종류, `authorityDemandDetail`, blockage 값, scope 비-core.

### ③ 선택지 판별력 — **FAIL (부분)**

`partial_situation` vs `deny_action`은 text는 다르게 받으나 **Profile·결과 동일 패턴**. `uncertain`/`no_stated`/`unknown` deadline.

### ④ 비장식성 — **FAIL (부분)**

질문 단위 장식: `factDifferenceDetail`, `datePlaceDetail`, `authorityDemandDetail`, blockage(값), evidence(종류). scope 질문은 재분류 1값 외 장식.

### ⑤ 직접입력 의존성 — **PASS**

정상 경로는 choice로 축 구성. `other`+note는 `isAdminVerifyChoiceFieldComplete`로 완료 게이트. 핵심 사실이 **자유텍스트만**인 축은 없음 (단, text follow-up은 **선택 후 사라짐**이지 DI-only는 아님).

### ⑥ 1차 vs 2차 — **1차 < 2차 PASS 후보**. 실질 축 비율 **약 5 : 7~9** (4:6 **PASS**, 3:7 **경계~미달**)

| 구분 | 실질 축 (②~④ 통과 질문) |
|------|-------------------------|
| 1차 **5** | `violationContent`, `factRelationship`, `customerResponded`, `deadline`, `confirmGoal` |
| 2차 **7~9** (경로별) | `authorityDemand`, `actualSituation`, `evidence`, `responseDetail`, `authorityResponse`, (`deadlineDate`는 동일 deadline 축 밀도), `finalGoal`(조건부). **제외:** `factDifference`/`datePlace` 질문(장식), `authorityDemandDetail`, scope·blockage |

`5:7` → 3:7 하한(⌈5×7/3⌉=**12**) **미달**. `5:9`도 12 미달. **4:6 하한(⌉5×6/4⌉=8)** 은 **충족** 가능.

**LOCK CASE 재작업:** 비율만으로 CASE_01 **전면 재설계** 근거는 약함. **text Profile 손실**은 CASE_05 STEP2-1과 **동형 개선** 후보.

---

## 4. 권장 (구현하지 않음 — 재작업 검토용)

1. `factDifferenceDetail` · `datePlaceDetail` → `actualSituation` / 결과 문장 합성 (CASE_05 `factDetail` 실질화 동형).
2. 1차 결과에서 `confirmed` + `deadlineDate` 있으면 action에 날짜 반영 (Phase2 완료 전에는 미요구 유지 가능).
3. `paymentDemandScope` / `supplementDemandScope` → `authorityClaim` 보조 또는 재분류 외 result 분기.
4. evidence 종류·blockage 값별 result (CASE_05 권장안 6 동형).
5. 3:7 가드레일까지 올리려면 **장식 Phase2 질문 실질화** 또는 **정보 밀도 축** 추가 — LOCK CASE는 Ace 승인 후 Mission.

---

*2026-09-25. LOCK CASE_01. LEVEL 1. 코드 미변경.*
