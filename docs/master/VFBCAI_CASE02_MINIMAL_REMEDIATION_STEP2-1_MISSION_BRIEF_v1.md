# CASE_02 Minimal Remediation — STEP2-1 Mission Brief

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **DQ LOCK 대기** — Ace가 DQ-C02-M01~M03 **권장안 승인** 시 §1 최종 LOCK |
| **구현 순서** | **CASE_05 → CASE_06 → CASE_03 → CASE_04 → CASE_01** 후 **CASE_02** (본 Brief) |
| **Mission** | G1 `case02_deadlineDate` · G2 `case02_paymentAmountDetail` · G3 `paymentInfoSource` Profile/needs/result |
| **설계 SoT** | `VFBCAI_CASE02_MINIMAL_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_CASE02_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (LOCK `fa4cce9`) |

---

## 0. Mission 한 줄

CASE_01 최소 Mission **후** 착수. Phase1 필드 수·STOP·bridge **유지**. 가격 **생성·환율 UI 금지** (사용자 기억·통지 인용 text만). **M01~M03** 승인값 적용.

---

## 1. DESIGN QUESTIONS — (승인 후 LOCK)

| ID | 결정 (승인 시 기입) | 구현 요약 |
|----|---------------------|-----------|
| **M01** | _pending_ | `amount_unknown` text — STEP2-0 §6 |
| **M02** | _pending_ | 금액 detail Profile 칸 — STEP2-0 §2 |
| **M03** | _pending_ | `paymentInfoSource` downstream — STEP2-0 §3 |

---

## 2. IMPLEMENTER (STEP2-0 §1–3, P0→P2)

| 순위 | G | 내용 |
|------|---|------|
| P0 | G1 | `CASE02_DEADLINE_DATE_KEY`, Phase2 text, pathComplete, Profile deadline |
| P1 | G2 | `CASE02_PAYMENT_AMOUNT_DETAIL_KEY`, needs, `appendCase02DirectInputAuthorityClaimParts`, result |
| P2 | G3 | event 합성, `case02NeedsEvidence`, Phase1 result signals |

---

## 3. 터치 파일

`adminVerifyProfiling.ts` · `AdminVerifyFirstResultPanel.tsx` · (선택) `MasterReviewQuotationReport.tsx` · `tests/qa/*case02*`

---

## 4. VERIFIER (STEP2-0 §5)

G1–G3 + `other`+note 회귀 + tsc + CASE_06→CASE_02 bridge

---

*2026-09-25. STEP2-1 Brief. DQ LOCK은 Ace 승인 후 §1 갱신.*
