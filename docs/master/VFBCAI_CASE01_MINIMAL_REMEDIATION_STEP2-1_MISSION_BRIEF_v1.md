# CASE_01 Minimal Remediation — STEP2-1 Mission Brief

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **DQ LOCK 대기** — Ace가 채팅에서 DQ-C01-M01·M02 **권장안 승인** 시 §1 최종 LOCK. 그 전 IMPLEMENTER 착수 금지 |
| **구현 순서** | **CASE_05 → CASE_06 → CASE_03 → CASE_04** Mission 완료 **후** CASE_01 (본 Brief) |
| **Mission** | 감사 데이터 손실 **2건**만: `factDifferenceDetail` · `datePlaceDetail` → Profile·Phase2 result |
| **설계 SoT** | `VFBCAI_CASE01_MINIMAL_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_CASE01_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (LOCK `fa4cce9`) |

---

## 0. Mission 한 줄

신규 질문·Master 틀·STOP·bridge **변경 없음**. `case01ActualSituationProfileLabel` 합성 + `CASE01_ANSWER_KEYS` + `appendCase01Phase2ResultSignals` — **M01·M02 승인값만** 적용.

---

## 1. DESIGN QUESTIONS — (승인 후 LOCK)

| ID | 결정 (승인 시 기입) | 구현 요약 |
|----|---------------------|-----------|
| **M01** | _pending_ | Profile 합성 칸 — STEP2-0 §1 |
| **M02** | _pending_ | Result action truncate — STEP2-0 §2 |

**권장안 SoT:** 아래 Ace 승인 표와 동일. 승인 문구 예: `DQ-C01-M01·M02 권장안 승인`.

---

## 2. IMPLEMENTER (STEP2-0 §1–2)

1. `case01ActualSituationProfileLabel` → `buildCaseResolutionProfile` `actualSituation` + source field  
2. `CASE01_FACT_DIFFERENCE_DETAIL_KEY` · `CASE01_DATE_PLACE_DETAIL_KEY` → `CASE01_ANSWER_KEYS`  
3. `AdminVerifyFirstResultPanel` `appendCase01Phase2ResultSignals` — **M02** 길이  
4. **금지:** `deadlineDate` 1차 경계, scope/blockage/evidence 실질화, 질문 id·chain 변경  

---

## 3. 터치 파일

`src/lib/adminVerifyProfiling.ts` · `AdminVerifyFirstResultPanel.tsx` · (선택) `MasterReviewQuotationReport.tsx` · CASE_01 strict/harness 스팟

---

## 4. VERIFIER (STEP2-0 §3)

1. `partial_situation` + factDifference → Profile text  
2. `date_place_wrong` + datePlace → Profile text  
3. Phase2 result action  
4. `npx tsc --noEmit`  
5. CASE_06 bridge · CASE_02/03 회귀 — 질문 수·순서 동일  

---

*2026-09-25. STEP2-1 Brief. DQ LOCK은 Ace 승인 후 §1 갱신 + 커밋.*
