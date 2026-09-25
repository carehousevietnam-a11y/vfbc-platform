# CASE_02 질문 보강 Brief — LOCK (DQ-V04 = C) v2

| 항목 | 내용 |
|------|------|
| **버전** | v2 |
| **상태** | **폐기** — `VFBCAI_CASE02_RATIO_REMEDIATION_QUESTION_BRIEF_v3.md` |
| **선행** | v1(`1812272`) **대체** |
| **Mission** | 납부 CASE — 사실 기반 노출 · **P2 &gt; P1** 측정 (미달 **숨기지 않음**) |
| **비율 SoT** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (2026-09-25 Ace 승인) |
| **패턴** | `VFBCAI_CASE01_RATIO_REMEDIATION_QUESTION_BRIEF_v3.md` (LOCK) |

**v2 변경:** 구 ⌈P×6/4⌉·**Ms** 삭제 · **Nc·Pp** 사실 필요성 확정 · 30조합 **P2&gt;P1** 재판정 · **미달 행만** §5 표.

---

## 0. Mission 한 줄

질문 노출은 **고객 답(사실)만**. **비율 맞추기 질문 추가 금지**. 30조합을 §3로 집계해 **P2 &gt; P1** PASS/미달을 표시하고, 미달은 **장식→실질·정보 밀도**로만 해소한다.

---

## 1. DESIGN QUESTION

| ID | 결정 |
|----|------|
| **DQ-V04** | **C** |
| **DQ-C02-R01** | Phase1 실질 **6** (`paymentInfoSource` **Profile·needs·결과** 연결 후 축 인정) |
| **DQ-C02-R02** | **P2 실질 &gt; P1 실질** (4:6 ⌈식 **폐기**) |
| **DQ-C02-R03~R06** | v1 동일 (text 보조 · 가격 생성 금지 · finalGoal 분리 · blockage/evidence 실질화) |
| **DQ-C02-R07** | P2&lt;N·질문 개수 **보정 게이트 금지** |
| **DQ-C02-R08** | 간접 안내 = **`case02_noticeAccessFact`(Nc)** 단일 |

### 1.1 신규 축 판단 (v1 → v2)

| id | v1 | v2 판단 |
|----|-----|---------|
| **Nc** `case02_noticeAccessFact` | 미달 메우기 | **유지** — `third_party`/`recall_unclear` 시 **사본·경로·발신** 사실 (감사 G3·② FAIL 해소). **비율 목적 아님** |
| **Pp** `case02_paidProcessingFact` | 미달 메우기 | **유지** — `paid_unverified`·기관 **미회신/추가요구** 처리 사실. **비율 목적 아님** |
| **Ms** `case02_amountSanctionFact` | Np 후 +1축 | **삭제** — `nonPaymentNotice` choice **효과 분화**(§4.7)로 대체. v1에서 **P2 끼워 넣기** 성격 |

---

## 2. 실질 축 인정 기준

v1 §2 (S1~S6) 동형.

---

## 3. Phase2 노출 조건 — 1줄 확정 (사실만)

**판정:** P2 **>** P1 · P1 = **6**.

| 기호 | id | 노출 조건 (사실) |
|------|-----|------------------|
| **Da** | `case02_demandAuthority` | Phase2 진입 **AND** `!case02_demandAuthority` |
| **Bs** | `case02_paymentBasis` | `confirmGoal` ∈ {`verify_obligation`, `why_pay`} **OR** `paymentSubject` ∈ {`unclear`, `unsure`} **OR** `situationMatch` = `not_applicable` |
| **Dl** | `case02_deadline` | `case02_deadline` 미완료 **AND** (timing goal **OR** 미납/부분납 **OR** obligation/amount/processed/why_pay goal) |
| **Dd** | `case02_deadlineDate` | `deadline` = `confirmed` **AND** date 비어 있음 |
| **Ad** | `case02_paymentAmountDetail` | amount ∈ {`amount_differs`, `paid_redemand`, `amount_stated_basis_unclear`} **AND** detail 비어 있음 (`other` 제외) |
| **Pm** | `case02_paymentMethod` | deadline·Dd 블록 통과 후 (미납 **OR** 기납부 경로) |
| **Np** | `case02_nonPaymentNotice` | `paymentStatus` ∈ {`not_paid`, `partial`} |
| **Ar** | `case02_authorityResponse` | `paymentStatus` ∈ {`partial`, `full`, `paid_unverified`, `paid_by_other`} |
| **Ev** | `case02_evidence` | `case02NeedsEvidence` 동치 (v1 §3) |
| **Bl** | `case02_blockage` | Phase2 **항상** (값별 실질화) |
| **Fg** | `case02_finalGoal` | `confirmGoal` = `unsure` |
| **Nc** | `case02_noticeAccessFact` | `paymentInfoSource` ∈ {`third_party`, `recall_unclear`} |
| **Pp** | `case02_paidProcessingFact` | `paymentStatus` ∈ {`paid_unverified`, `paid_by_other`} **OR** `authorityResponse` ∈ {`more_required`, `no_reply_yet`, `procedure_unknown`, `unclear`} |
| **Ch** | `case02_paymentChannelFact` | `confirmGoal` = `how_when_where` **AND** (`paymentMethod` 완료 **OR** `method_not_stated` \| `method_suspect` on-path) |

**Ch:** timing 전용 **납부 채널·장소 사실** (기한·방법 목표). **비율용 아님** — §5 `timing` 미달 해소 후보.

---

## 4. 선택지별 효과 (판단 · 다음 행동 · 위험도)

v1 §4.1~4.11 **동일**. **Ms** 절 **삭제**. **4.7** `nonPaymentNotice` — 제재·이자·미안내 slug별 **판단·행동·위험** (Ms 대체).

### 4.12 `case02_noticeAccessFact` (Nc) — v1 §4.2 동일

### 4.13 `case02_paidProcessingFact` (Pp)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `proc_receipt_pending` | 납부했으나 **접수 미확인** | 접수·처리 조회 | **재부과** |
| `proc_partial_credit` | **일부만** 반영 | 미반영분 문의 | 이중·잔액 |
| `proc_other_case` | **다른 건**과 혼동 | 건번호·금액 대조 | 오납 |
| `proc_unknown` | 처리 **불명** | 공식 조회 | 가산 |

### 4.14 `case02_paymentChannelFact` (Ch)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `ch_office_counter` | **창구** 안내 | 위치·시간 확인 | 착오 |
| `ch_online_portal` | **온라인** | 공식 URL·수수료 확인 | 사칭 URL |
| `ch_bank_transfer` | **계좌 이체** | 고지 계좌와 대조 | 사기 계좌 |
| `ch_unknown` | **채널 불명** | 공식 납부 안내 요청 | 오납·사기 |

---

## 5. 조합 표 — **미달만** (30조합 중 6건)

**축:** Ps × Sm × Cg — v1 §5와 동일. **표준 Phase1:** v1 동일 (`official_notice`, `traffic_fine`, …). **P1=6**.

**집계:** §3 충족 축만 · **P2 &gt; P1** PASS. **전체 30조합 중 PASS 24 · 미달 6** (전부 **`timing`** = `how_when_where`).

| # | Ps | Sm | Cg | P1 | Phase2 실질 축 (기호 순) | P2 | P2&gt;P1 |
|---|-----|-----|-----|-----|---------------------------|-----|--------|
| 3 | unpaid | match | timing | 6 | Dl,Dd,Pm,Np,Bl | 5 | **미달** |
| 8 | unpaid | mismatch | timing | 6 | Dl,Dd,Pm,Np,Bl | 5 | **미달** |
| 13 | unpaid | compare_gap | timing | 6 | Dl,Dd,Pm,Np,Bl | 5 | **미달** |
| 18 | paid_track | match | timing | 6 | Dl,Dd,Pm,Ar,Bl | 5 | **미달** |
| 23 | paid_track | mismatch | timing | 6 | Dl,Dd,Pm,Ar,Bl | 5 | **미달** |
| 27 | paid_track | compare_gap | timing | 6 | Dl,Dd,Pm,Ar,Bl | 5 | **미달** |

**미달 목록:** #3 · #8 · #13 · #18 · #23 · #27 (`confirmGoal` = `how_when_where`, P2=5, P1=6).

**PASS 예 (참고, 표 미기재):** #1 obligation unpaid match — Bs,Dl,Dd,Pm,Np,Ev,Bl → P2=7. #19 processed paid — …,Pp → P2=8. #× + `third_party` → **+Nc** (Ev와 역할 분리).

### 5.1 미달 6 — 해소 (사실만)

| 패턴 | 방향 |
|------|------|
| timing · P2=5 | **`case02_paymentChannelFact`(Ch)** — §3·§4.14 (goal=timing **사실**). **또는** `Dl`/`Pm`/`Bl` choice **밀도 상향**(②~④)으로 동일 축 수에서 깊이 확보 — **질문 개수만 늘리지 않음** |
| 금지 | Ms류 **비율 +1** · P2 산출 후 축 추가 |

### 5.2 커버리지

1. §3만 노출. 2. 코드 `case02Phase2SubstantiveAxisIdsOnPath`. 3. **미달 숨김 금지**.

---

## 6. VERIFIER · IMPLEMENTER

- **30조합** 코드 전수 · **미달 6** 고정 · timing+Ch 적용 후 **PASS** 재실측.
- **Nc·Pp**는 third_party / paid_unverified 경로 **필수** — 없으면 ① FAIL.

---

## 7. v1 → v2

| v1 | v2 |
|----|-----|
| 하한 9 (4:6) | **P2&gt;P1** |
| Ms | **삭제** |
| 29 미달 | **6 미달** (timing) |
| #30 인위 PASS | **삭제** |

---

*2026-09-25. 2번창 — CASE_02 Brief v2 (비율 개정 반영).*
