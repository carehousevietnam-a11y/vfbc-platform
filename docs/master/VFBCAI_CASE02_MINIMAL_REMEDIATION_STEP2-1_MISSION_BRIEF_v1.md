# CASE_02 Minimal Remediation — STEP2-1 Mission Brief (LOCK)

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **LOCK** — Ace 승인 2026-09-25 (DQ-C02-M01=A, M02=A, M03=A). §1 재오픈 금지 |
| **플랫폼 구현 순서** | **CASE_05 → CASE_06 → CASE_03 → CASE_04 → CASE_01 → CASE_02** (본 Mission = **마지막**) |
| **IMPLEMENTER 착수** | 위 순서 완료 후 CASE_02 차례일 때만 |
| **Mission** | G1 `case02_deadlineDate` · G2 `case02_paymentAmountDetail` · G3 `paymentInfoSource` Profile/needs/result |
| **설계 SoT** | `VFBCAI_CASE02_MINIMAL_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_CASE02_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (LOCK `fa4cce9`) |

---

## 0. Mission 한 줄

Phase1 필드 수·STOP·bridge **유지**. 사용자 기억·통지 인용 **text만** (가격 생성·환율 UI 금지). G1→G2→G3, M01~M03 승인값 적용.

---

## 1. DESIGN QUESTIONS — Ace 승인 LOCK

| ID | 결정 | 구현 요약 |
|----|------|-----------|
| **M01** | **A** | `amount_unknown` / `unsure`에는 **금액 text 질문 없음**. text needs: `amount_differs` · `paid_redemand` · `CASE02_PAYMENT_AMOUNT_STATED_BASIS_UNCLEAR`; `other`는 기존 note |
| **M02** | **A** | `case02_paymentAmountDetail` → **`authorityClaim` suffix** (`appendCase02DirectInputAuthorityClaimParts`, `other`+note와 병렬) |
| **M03** | **A** | **(1)** Profile `event` = subject + `(안내 인지: {paymentInfoSource label})` **(2)** `case02NeedsEvidence`: `third_party` \| `recall_unclear` **(3)** `appendCase02Phase1ResultSignals`: third_party caution, recall_unclear unconfirmed |

---

## 2. IMPLEMENTER (STEP2-0 §1–3, P0→P2)

| 순위 | G | 내용 |
|------|---|------|
| P0 | G1 | `CASE02_DEADLINE_DATE_KEY`, Phase2 text after `deadline`, `case02PathFieldsComplete`, Profile deadline |
| P1 | G2 | `CASE02_PAYMENT_AMOUNT_DETAIL_KEY`, `case02NeedsPaymentAmountDetail` (M01), M02 suffix + result (truncate 120 권장, C01 M02 동형) |
| P2 | G3 | M03 event · evidence needs · Phase1 result |

---

## 3. 터치 파일

`src/lib/adminVerifyProfiling.ts` · `AdminVerifyFirstResultPanel.tsx` · (선택) `MasterReviewQuotationReport.tsx` · `tests/qa/*case02*`

---

## 4. VERIFIER (STEP2-0 §5)

1. G1: `confirmed` + `case02_deadlineDate` → Profile deadline 문자열  
2. G2: `amount_differs` + detail → `authorityClaim` fragment; `other`+note 회귀  
3. G3: `recall_unclear` → evidence needs; event에 인지 경로  
4. `npx tsc --noEmit`  
5. CASE_06→CASE_02 bridge 스모크  

---

*2026-09-25. DQ-C02-M01~M03 LOCK. 플랫폼 순서: 05→06→03→04→01→02.*
