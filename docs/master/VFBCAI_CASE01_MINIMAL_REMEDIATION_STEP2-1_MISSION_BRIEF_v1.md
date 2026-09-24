# CASE_01 Minimal Remediation — STEP2-1 Mission Brief (LOCK)

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **LOCK** — Ace 승인 2026-09-25 (DQ-C01-M01=A, M02=A). §1 재오픈 금지 |
| **플랫폼 구현 순서** | **CASE_05 → CASE_06 → CASE_03 → CASE_04 → CASE_01** (본 Mission) **→ CASE_02** |
| **IMPLEMENTER 착수** | 위 순서에서 CASE_01 차례일 때만. `adminVerifyProfiling.ts` 단일-writer·타 CASE Mission 완료 후 |
| **Mission** | 감사 데이터 손실 **2건**만: `factDifferenceDetail` · `datePlaceDetail` → Profile·Phase2 result |
| **설계 SoT** | `VFBCAI_CASE01_MINIMAL_REMEDIATION_STEP2-0_v1.md` |
| **감사 SoT** | `VFBCAI_CASE01_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (LOCK `fa4cce9`) |

구현은 이 Brief + STEP2-0만 따른다.

---

## 0. Mission 한 줄

신규 질문·Master 틀·STOP·bridge **변경 없음**. `case01ActualSituationProfileLabel` 합성 + `CASE01_ANSWER_KEYS` + `appendCase01Phase2ResultSignals` (M02=120자 truncate).

---

## 1. DESIGN QUESTIONS — Ace 승인 LOCK

| ID | 결정 | 구현 요약 |
|----|------|-----------|
| **M01** | **A** | Profile 합성은 **`actualSituation`만** — `case01ActualSituationProfileLabel` (core + diff/datePlace text). `factRelationship` slug·라벨 칸 **미합성** |
| **M02** | **A** | Phase2 result `action`에 text 반영 시 **120자 truncate** + `…`. Profile에는 full text 유지 |

---

## 2. IMPLEMENTER (STEP2-0 §1–2)

1. `case01ActualSituationProfileLabel` → `buildCaseResolutionProfile` `actualSituation` + source (`CASE01_FACT_DIFFERENCE_DETAIL_KEY` / `CASE01_DATE_PLACE_DETAIL_KEY` 우선)  
2. `CASE01_FACT_DIFFERENCE_DETAIL_KEY` · `CASE01_DATE_PLACE_DETAIL_KEY` → `CASE01_ANSWER_KEYS`  
3. `AdminVerifyFirstResultPanel` `appendCase01Phase2ResultSignals` — M02 truncate  
4. **금지:** `deadlineDate` 1차 경계, scope/blockage/evidence 실질화, 질문 id·chain 변경  

---

## 3. 터치 파일

`src/lib/adminVerifyProfiling.ts` · `AdminVerifyFirstResultPanel.tsx` · (선택) `MasterReviewQuotationReport.tsx` · CASE_01 strict/harness 스팟

---

## 4. VERIFIER (STEP2-0 §3)

1. `partial_situation` + factDifference → Profile `actualSituation.value`에 text  
2. `date_place_wrong` + datePlace → 동일  
3. Phase2 result action (≤120자 표시)  
4. `npx tsc --noEmit`  
5. CASE_06 bridge · CASE_02/03 회귀 — 질문 수·순서 동일  

---

*2026-09-25. DQ-C01-M01·M02 LOCK. 플랫폼 순서: 05→06→03→04→01→02.*
