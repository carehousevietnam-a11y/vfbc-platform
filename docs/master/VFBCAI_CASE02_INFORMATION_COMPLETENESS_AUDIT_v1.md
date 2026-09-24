# CASE_02 Information Completeness Audit

| 항목 | 내용 |
|------|------|
| **성격** | **LOCK된 CASE_02**에 대한 정보완결성 감사. **재작업 필요 여부 판단용** — 즉시 수정 Mission 아님 |
| **범위** | 감사만. 코드·문구·선택지·구조 **미변경** |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (`fa4cce9`) |
| **증거** | LEVEL 1. `adminVerifyProfiling.ts`, `AdminVerifyFirstResultPanel.tsx` |
| **대조** | `VFBCAI_CASE05_INFORMATION_COMPLETENESS_AUDIT_v1.md` |

조사일: 2026-09-25.

---

## 0. 질문 구조 (코드)

**Phase1** (`CASE02_PHASE1_FIELD_ORDER`, `appendCase02Phase1Questions` ~2392–2481) — **6개 고정**

1. `case02_paymentSubject`
2. `case02_paymentInfoSource`
3. `case02_situationMatch`
4. `case02_paymentAmount`
5. `case02_paymentStatus`
6. `case02_confirmGoal`

(`case02_demandAuthority`는 Phase1 완료 후 handoff 시드 ~2003–2013, Phase2에서 조건부.)

**Phase2** (`appendCase02Phase2Questions` ~2494–2662)

`demandAuthority`(조건부) → `situationMatch`(재질문, 조건부) → `paymentAmount`(재질문, 조건부) → `paymentBasis`(조건부) → `deadline`(조건부) → (`authorityResponse` +) `paymentMethod` → (`nonPaymentNotice`, 미납 경로) → `blockage`(**항상**) → `evidence`(조건부) → `finalGoal`(조건부)

**Profile 매핑**

| Profile | 소스 |
|---------|------|
| `event` | `paymentSubject` |
| `authorityClaim` | `paymentSubject` 문장 + DI suffix (`paymentAmount`/`paymentMethod`/`demandAuthority` **other** note만 ~2203–2217) |
| `actualSituation` | `situationMatch` |
| `authorityReason` | `paymentBasis` \|\| `nonPaymentNotice` |
| `customerAction` | `paymentStatus` |
| `deadline` | `deadline` **choice 라벨만** (~9024–9025) |
| `authorityResponse` | `authorityResponse` (legacy 라벨 ~1715–1737) |
| `currentBlockage` | `blockage` |
| `evidence` | `evidence` |
| `goal` | `finalGoal` \|\| `confirmGoal` |

**Profile에 없음:** `paymentInfoSource`, `paymentMethod`(non-other), `demandAuthority`(non-other), **구체 납부 금액 text** (`CASE02_DEADLINE_DATE` 키 **없음**).

---

## 0.1 데이터 손실 패턴 (날짜·금액·장소)

| 패턴 | 수집 | Profile / 결과 | 판정 |
|------|------|----------------|------|
| **납부 기한 날짜** | `deadline=confirmed` (~1847). **날짜 text 질문·키 없음** (CASE_01/05 대비) | 라벨만. Phase1/2 result: 통지서 재확인 action (~844–846) | **손실** (CASE_05 `specific_date` 동형) |
| **금액 숫자** | `paymentAmount` choice + **`other`+note만** DI (~1742–1761). `amount_differs` 등은 slug만 | `other`일 때만 `authorityClaim`에 `/ 금액: {note}` (~2205–2207). 그 외 **금액 값 필드 없음** | **의도적 slug화** + **other 외 구체 금액 손실** |
| **납부 방법 상세** | `paymentMethod` | `other`만 authorityClaim suffix (~2209–2211) | other 외는 Profile 단절 |
| **안내 인지 경로** | Phase1 `paymentInfoSource` | Profile **없음**. Phase2 needs **없음** (grep 단일 필드) | **수집만** — 판단 축 단절 |
| **장소** | CASE_02 전용 place text **없음** | `situationMatch` 라벨만 | 장소는 **미수집** (정보완결 ① 이슈이나 손실 패턴은 해당 없음) |

---

## 1. Phase1

### 1.1 `case02_paymentSubject`

Profile: `event`, `authorityClaim` 기반.

| 선택지 | Phase2 | 결과 |
|--------|--------|------|
| `violation_fine` / `admin_fee` / `license_fee` / … | subject unclear 시 basis·match 재질문 가중 (~2313–2314) | subject `unclear` → unconfirmed (~812–813) |
| `additional_related` | match·amount Phase2 (~2300–2307) | caution 추가 납부 (~814–815) |
| `unclear` / `unsure` | basis·blockage 후보 | unconfirmed |
| `other` | DI | note → 라벨 |

**실질 축.**

### 1.2 `case02_paymentInfoSource`

| 선택지 | 다음 질문 | Profile | 결과 |
|--------|-----------|---------|------|
| 5+DI 전부 | **동일** Phase1 진행 | **없음** | **LEVEL 1: result 전용 분기 없음** |

**질문 단위 장식** (②~④ FAIL). FOCUS rank만 존재 (~9487).

### 1.3 `case02_situationMatch`

Profile: `actualSituation`. Phase2에서 **재질문** 가능 (`case02NeedsSituationMatchPhase2` ~2259–2285).

| 선택지 | Phase2 | 결과 |
|--------|--------|------|
| `match` | 재질문 스킵(이미 완료 시) | metric ok |
| `partial` / `not_applicable` | amount·evidence·basis 후보 | caution (~865–867) |
| `hard_to_judge` / `unknown` / `other` | evidence 등 | unconfirmed (~868–869) |

**실질 축** (Phase1·Phase2 라벨 차이는 문구만 다를 수 있음).

### 1.4 `case02_paymentAmount`

Profile: 직접 칸 없음. `other` → authorityClaim suffix.

| 선택지 | Phase2 재질문 | 신호/결과 |
|--------|---------------|-----------|
| `amount_stated_basis_unclear` (canonical) | goal/subject/status에 따라 (~2288–2307) | `PAYMENT_AMOUNT_MISMATCH` (~2813–2815) |
| `amount_differs` / `paid_redemand` | 동상 | distinct cautions (~874–879) |
| `amount_unknown` / legacy | 동상 | unconfirmed |
| `other` | note | authorityClaim + unconfirmed (~883–887) |

**실질 축** (신호·결과). **구체 금액 text 축 없음** → ①.

### 1.5 `case02_paymentStatus`

Profile: `customerAction`.

| 선택지 | Phase2 | 결과 |
|--------|--------|------|
| `not_paid` | method + `nonPaymentNotice` | caution 미납 (~833–834) |
| `partial` / `full` / `paid_unverified` / `paid_by_other` | paid 경로: `authorityResponse`+`paymentMethod` (~2581–2598) | status별 caution (~835–841) |

**실질 축** (Phase2 체인 분기).

### 1.6 `case02_confirmGoal`

| 선택지 | Phase2 needs | 결과 |
|--------|--------------|------|
| `verify_obligation` / `why_pay` | basis, evidence (~2310–2314) | caution (~818–820) |
| `verify_amount` | amount Phase2, evidence | (~821–823) |
| `how_when_where` | **deadline Phase2** (~2245) | action 기한·방법 (~827–828) |
| `payment_processed` | paid 경로 | (~824–826) |
| `unsure` | `finalGoal` (~2345–2347) | unconfirmed |

**실질 축.**

---

## 2. Phase2 (요약)

### 2.1 `demandAuthority` / `paymentBasis` / `deadline`

- `demandAuthority`: Phase2만, seed handoff (~2497–2504). `other` note → authorityClaim suffix.
- `paymentBasis`: Profile `authorityReason`. goal/subject 조건부 (~2545–2560). **실질.**
- `deadline`: Profile 라벨만. `confirmed` **날짜 text 없음** → **0.1 손실**. `uncertain`/`deadline_mentioned`/`not_stated`/`unsure` → result **동일 unconfirmed** (~847–854) → **장식 선택지**.

### 2.2 `paymentMethod` / `nonPaymentNotice`

- `paymentMethod`: paid / unpaid 경로 (~2581–2614). `not_stated` 등 → unconfirmed (~905–907). **부분 실질.**
- `nonPaymentNotice`: `authorityReason` fallback (~8700–8708). canonical merge (~1702–1712). 값 간 result 일부 분기 (~910–914).

### 2.3 `blockage`

`case02NeedsBlockage` **항상 true** (~2317–2318). Profile만 반영. 값별 result **LEVEL 1 미분화** → **장식**.

### 2.4 `evidence` / `finalGoal`

- `evidence`: 조건부 (~2321–2342). `none`류 신호. 종류 값 장식 (CASE_05 동형).
- `finalGoal`: `confirmGoal=unsure`만. goal override — **조건부 실질**.

---

## 3. 판정

### ① 정보완결성 — **FAIL**

납부 **기한 날짜**·**구체 금액**(other 외)이 판단 축에 남지 않는다. `paymentInfoSource`는 수집 후 버려진다. CASE_05/06 감사와 같은 **「안다」slug 패턴**이 `deadline=confirmed`, amount choice에 남아 있다.

### ② 다중신호성 — **FAIL (부분)**

실질: `paymentStatus`→Phase2 paid/unpaid 체인, `situationMatch`/`paymentAmount`/`confirmGoal`→needs, `paymentBasis`, `core` amount 신호.

약함: `paymentInfoSource`, deadline 미확인 4값, blockage, evidence 종류.

### ③ 선택지 판별력 — **FAIL (부분)**

`deadline_mentioned` vs `uncertain` vs `not_stated` vs `unsure` — 동일 unconfirmed·action. `paymentInfoSource` 5+DI — downstream 동일.

### ④ 비장식성 — **FAIL (부분)**

장식 질문: **`paymentInfoSource`**, **`blockage`**(값). 장식 선택지: deadline 미확인 묶음, evidence 종류.

### ⑤ 직접입력 의존성 — **PASS (주의)**

금액·기관·방법은 `other`+note로 **대체 가능**. 다만 **정상 경로는 slug만**으로 완료되며 구체 금액·날짜는 **필수 수집되지 않음** (⑤ PASS이나 ①과 공존).

### ⑥ 1차 vs 2차 — **경계 FAIL 위험** (실질 축 **약 5~6 : 5~7**)

| | |
|--|--|
| 1차 실질 | `paymentSubject`, `situationMatch`, `paymentAmount`, `paymentStatus`, `confirmGoal` = **5**. (`paymentInfoSource` **제외**) |
| 2차 실질 | `demandAuthority`(조건부), `paymentBasis`, `deadline`, `paymentMethod`, `nonPaymentNotice`, `authorityResponse`, `evidence`, `finalGoal` — 경로마다 **5~7** |
| 제외 | `paymentInfoSource`, `blockage`, situation/amount **재질문**은 동일 축 밀도(별도 +1 아님) |

예: **5:6** → 4:6 하한 **PASS**. **5:5** 또는 **6:6** → **1차=2차 무조건 FAIL** (기준 표). Phase2가 짧은 경로(미납·match·basis 스킵)면 **비율 하한 FAIL** 가능.

**LOCK CASE 재작업:** CASE_05급 전면 실질화보다 **deadline date·금액 text·infoSource downstream**이 우선 검토 축. 비율은 경로 설계에 민감.

---

## 4. 권장 (구현하지 않음)

1. `deadline=confirmed` → `CASE02_DEADLINE_DATE_KEY` + text (CASE_01 동형) — **데이터 손실 제거**.
2. 금액: `stated_amount`+text 또는 `other` 외 note 축 — Ace 승인 후 (가격 **표시**는 COST CHECK 정책과 충돌 검토).
3. `paymentInfoSource` → evidence 요구·result·Profile 보조 중 하나에 연결 또는 Phase1 축 축소 검토.
4. `blockage` 값별 action / evidence 종류 분기 (CASE_05 권장 6).
5. Phase2 짧은 경로에서 **실질 축 5 미만**이 되지 않도록 needs* 검토 (비율 가드레일).

---

*2026-09-25. LOCK CASE_02. LEVEL 1. 코드 미변경.*
