# CASE_02 질문 보강 Brief — LOCK (DQ-V04 = C) v3

| 항목 | 내용 |
|------|------|
| **버전** | v3 |
| **상태** | **Brief** — Ace 승인 전 IMPLEMENTER 착수 금지 |
| **선행** | v2(`a164f36` 계열) **대체** |
| **Mission** | timing 미달 6조합 **사실 보강** · **F12** 선택지 원문 정렬 |
| **비율 SoT** | P2 실질 **>** P1 실질 · **비율 맞추기 질문 추가 금지** |

**v3 변경:** timing 경로 **Cf·Ev(확장)** · **Ch 삭제**(Pm·Cf로 역할 분리) · §4 **고객向 원문+신호** · F12 점검표.

---

## 0. timing 미달 6조합 — 사실 분석 (#3·8·13·18·23·27)

**현재 (v2):** P1=6 · P2=5 (`Dl,Dd,Pm,Np|Ar,Bl`) — `confirmGoal`=`how_when_where`.

| 빠진 사실? | 판단 | v3 처리 |
|------------|------|---------|
| **언제·어디·어떤 방법**으로 납부 | **일부 있음** — `Dl`/`Dd`·`Pm`(코드에 다중신호 label). Brief v2 §4.6은 **요약 slug**(F12)로 **코드와 불일치** | **Pm** IMPLEMENTER는 **코드 slug 유지** · Brief §4.6 **원문+신호** LOCK |
| **납부 안내를 뒷받침할 자료** (고지·계좌 문자) | **있음** — timing인데 `Ev` off → ①·증거 게이트 공백 | **`Ev`**: `confirmGoal`=`how_when_where` **OR** 기존 `case02NeedsEvidence` |
| **납부 후 처리·접수 확인 방법** | **있음** — 기한·방법만 있고 **「납부했을 때 어떻게 확인」** 축 없음 | **신규 `case02_paymentConfirmationFact`(Cf)** — timing 전용 |
| **1차 질문 축소** | `confirmGoal`=`how_when_where`는 **고객 목표** — Phase2 `Dl`/`Pm`과 **중복 아님**(목표 vs 사실). **제거 제안 없음** | — |

**Ch(`paymentChannelFact`) 삭제:** `Pm`이 **채널 유형**(계좌·창구·온라인)을 이미 수집. Ch는 **비율 +1**에 가깝고 Cf·Ev로 timing **사실** 충족.

---

## 1. DESIGN QUESTION (v2 유지 + v3)

| ID | 결정 |
|----|------|
| **DQ-C02-R09 (v3)** | timing(`how_when_where`)에 **Cf** 필수 · **Ev** needs 확장 (§3) |
| **DQ-C02-R10 (v3)** | Brief §4 모든 choice = **고객向 원문** + **footnote slug** 열 · 요약 라벨만 **금지**(F12) |

---

## 2. §3 Phase2 노출 (v2 대비 변경분)

| 기호 | id | 노출 조건 (사실) |
|------|-----|------------------|
| **Ev** | `case02_evidence` | v2 `case02NeedsEvidence` **OR** `confirmGoal` = `how_when_where` |
| **Cf** | `case02_paymentConfirmationFact` | `confirmGoal` = `how_when_where` |
| ~~**Ch**~~ | ~~`case02_paymentChannelFact`~~ | **v3 삭제** (§0) |

**v2 §3 나머지** (Da,Bs,Dl,Dd,Ad,Pm,Np,Ar,Bl,Fg,Nc,Pp) **동일**.

---

## 3. F12 점검 — v2에서 요약·slug만 있던 질문

| 질문 id | v2 문제 | v3 |
|---------|---------|-----|
| `case02_paymentMethod` (Pm) | §4.6 `method_stated` 등 — **코드 없음** (`bank_transfer`…) | §4.6 **원문 표** |
| `case02_paymentInfoSource` (P1) | §4.1 `official_notice` — **코드** `written_notice`… | §4.1 **원문 표** |
| `case02_noticeAccessFact` (Nc) | slug만 · 원문 없음 | §4.2 **원문 표** |
| `case02_paymentBasis` (Bs) | slug만 | §4.3 **원문 표** |
| `case02_paidProcessingFact` (Pp) | slug만 | §4.4 **원문 표** |
| ~~`case02_paymentChannelFact` (Ch)~~ | slug만 · **축 삭제** | — |
| `case02_paymentConfirmationFact` (Cf) | (신규) | §4.5 **원문+신호** |

**코드와 이미 다중신호(양호):** `case02_confirmGoal`, `case02_deadline`, `case02_paymentStatus`, `case02_nonPaymentNotice`, `case02_blockage`, `case02_evidence` — Brief는 **코드 label 인용** 유지.

---

## 4. 선택지 — 고객向 원문 · slug(footnote) · 판단 · 다음 행동 · 위험도

표 열: **slug** | **고객向 label (원문)** | 판단 | 다음 행동 | 위험도

### 4.1 `case02_paymentInfoSource` (P1)

| slug | 고객向 label (원문) | 판단 | 다음 행동 | 위험도 |
|------|---------------------|------|-----------|--------|
| `written_notice` | 교통국에서 받은 통지서·안내문·문자 등 문서나 메시지로 알게 되었습니다. | 문서·메시지 경로 | 원문·번호 보존 | 낮음 |
| `verbal_authority` | 교통국 방문·전화·구두 안내 또는 통역을 통해 들었습니다. | 구두·통역 경로 | 내용 메모·재확인 | 오해 |
| `third_party` | 지인·대행·통역 도움 등 다른 사람이 알려 주었습니다. | 간접 | **Nc** · 공식 통지 | 간접·오해 |
| `online_channel` | 인터넷·앱·전자납부 안내 등 온라인 경로로 알게 되었습니다. | 온라인 인지 | URL·발신 확인 | 사칭 |
| `recall_unclear` | 납부 안내를 받은 것은 기억나지만, 어떻게 알게 되었는지는 정확히 말하기 어렵습니다. | 출처 불명 | **Nc** | 불명 |

### 4.2 `case02_noticeAccessFact` (Nc)

| slug | 고객向 label (원문) | 판단 | 다음 행동 | 위험도 |
|------|---------------------|------|-----------|--------|
| `access_have_copy` | 간접으로 들었지만, 지금 **안내 문서·메시지 사본**을 가지고 있습니다. | 사본 있음 | 발신·내용 확인 | 중간 |
| `access_no_copy` | 안내를 들었지만 **사본·스크린샷**을 남기지 못했습니다. | 사본 없음 | 재발급·재전송 | 공백 |
| `access_sender_unknown` | **누가·어떤 경로로** 전달했는지 확실하지 않습니다. | 경로 불명 | 대행·발신 확인 | 오전달 |
| `access_language_barrier` | **언어·통역** 때문에 안내 내용을 제대로 확인하지 못했습니다. | 언어 장벽 | 통역·원문 | 기한·오해 |

### 4.3 `case02_paymentBasis` (Bs)

| slug | 고객向 label (원문) | 판단 | 다음 행동 | 위험도 |
|------|---------------------|------|-----------|--------|
| `basis_violation_cited` | 위반 사실·행위를 이유로 납부하라고 **구체적으로 말하거나 적어** 주었습니다. | 사실 인용 | 사실관계 대조 | 쟁점 |
| `basis_fee_schedule` | 수수료·고시·항목 번호 등 **규정·고시**를 들거나 적어 주었습니다. | 고시 인용 | 항목 확인 | 과다 |
| `basis_prior_case` | **이전에 처리한 건**과 연결해 추가 납부하라고 했습니다. | 연속 건 | 이전 영수증 대조 | 이중 |
| `basis_not_explained` | 왜 이 금액을 내야 하는지 **설명이 없거나** 이해하지 못했습니다. | 근거 없음 | 근거 문구 요청 | 부당 청구 의심 |

### 4.4 `case02_paymentMethod` (Pm) — **코드 slug LOCK**

| slug | 고객向 label (원문) | 판단 | 다음 행동 | 위험도 |
|------|---------------------|------|-----------|--------|
| `bank_transfer` | 지정 계좌 이체·은행 창구에서 납부하라고 안내받았습니다. | 계좌·창구 | 고지 계좌 대조 | 사기 계좌 |
| `office_visit` | 기관 방문·창구에서 직접 납부하라고 안내받았습니다. | 대면 납부 | 위치·시간 | 착오 |
| `online_portal` | 인터넷·전자납부·앱 등 온라인으로 납부하라고 안내받았습니다. | 온라인 | 공식 URL | 사칭 |
| `not_stated` | 어디서 어떻게 내라는 안내를 받지 못했거나, 안내를 받았어도 방법을 정확히 이해하지 못했습니다. | 방법 불명 | 공식 채널 문의 | 오납·사기 |

### 4.5 `case02_paymentConfirmationFact` (Cf) — **신규**

**질문:** 「납부한 뒤 **기관에서 처리·접수됐는지** 어떻게 확인하라고 안내했나요?」(미납이면 **안내 받은 확인 방법** / 기납부면 **실제 확인 시도**)

| slug | 고객向 label (원문) | 판단 | 다음 행동 | 위험도 |
|------|---------------------|------|-----------|--------|
| `cf_receipt_official` | **영수증·접수증·전자 확인번호**로 확인하라고 안내했습니다. | 공식 확인 수단 | 번호·서류 보관 | 낮음 |
| `cf_portal_status` | **인터넷·앱**에서 납부·처리 상태를 보라고 안내했습니다. | 온라인 조회 | 로그인·캡처 | 미반영 |
| `cf_call_office` | **전화·방문**으로 처리 여부를 확인하라고 안내했습니다. | 수동 확인 | 연락·방문 | 지연 |
| `cf_no_instruction` | 납부 후 **어떻게 확인**하라는 안내를 받지 못했습니다. | 확인 절차 없음 | 공식 조회 요청 | **재부과·이중** |

### 4.6 `case02_paidProcessingFact` (Pp)

| slug | 고객向 label (원문) | 판단 | 다음 행동 | 위험도 |
|------|---------------------|------|-----------|--------|
| `proc_receipt_pending` | 납부는 했지만 **접수·처리가 됐는지** 아직 확인하지 못했습니다. | 미확인 | 조회·영수증 | 재부과 |
| `proc_partial_credit` | **일부만** 처리된 것으로 보이거나 나머지가 남아 있습니다. | 부분 반영 | 잔액 문의 | 이중 |
| `proc_other_case` | **다른 건·다른 금액**으로 처리된 것 같습니다. | 건 혼동 | 건번·금액 대조 | 오납 |
| `proc_unknown` | 처리 여부를 **전혀** 확인하지 못했습니다. | 불명 | 공식 조회 | 가산 |

### 4.7~4.11

`case02_deadline`·`nonPaymentNotice`·`authorityResponse`·`evidence`·`blockage`·`finalGoal` — **v1 §4.4·4.7~4.11** 및 **코드 label** 동일. `evidence` timing 경로: **고지·계좌 안내 자료** 보유 수준으로 해석.

---

## 5. 조합 표 — timing 6건 (v3 재판정)

**집계:** §3 · P1=6 · **P2 > P1**

| # | Ps | Sm | Phase2 실질 축 (기호 순) | P2 | P2>P1 |
|---|-----|-----|---------------------------|-----|--------|
| 3 | unpaid | match | Dl,Dd,Pm,Np,Bl,Ev,Cf | 7 | **PASS** |
| 8 | unpaid | mismatch | 동일 | 7 | **PASS** |
| 13 | unpaid | compare_gap | 동일 | 7 | **PASS** |
| 18 | paid_track | match | Dl,Dd,Pm,Ar,Bl,Ev,Cf | 7 | **PASS** |
| 23 | paid_track | mismatch | 동일 | 7 | **PASS** |
| 27 | paid_track | compare_gap | 동일 | 7 | **PASS** |

**요약:** timing 6건 **전부 PASS**. 30조합 전체 **30/30 PASS** (v3 §3·코드 전수로 재확인).

### 5.1 미달

**0건** (v3). IMPLEMENTER: `case02Phase2SubstantiveDepthCombinations` **CASE_02 30행** 추가 시 동일 규칙.

---

## 6. VERIFIER

- Cf·Ev 확장 **노출이 사실 조건인지** (goal=timing만, P2 개수 게이트 **없음**).
- §4 **원문**이 Layer J·UI choice와 **slug 일치**.
- F12: Brief에 **요약 slug만** 있는 choice **0**.

---

## 7. v2 → v3

| v2 | v3 |
|----|-----|
| timing 미달 6 | **PASS** (Cf + Ev) |
| Ch | **삭제** |
| §4 요약 slug | **원문+신호** |
| Pm `method_*` | **`bank_transfer` 등 코드 LOCK** |

---

*2026-09-25. 2번창 — CASE_02 Brief v3.*
