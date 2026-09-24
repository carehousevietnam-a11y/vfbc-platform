# CASE_01 Minimal Remediation — STEP2-0 설계

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **성격** | STEP2-0 설계만. **코드 수정 없음** |
| **전제** | **LOCK CASE_01** — 전면 재작업 금지. 감사 SoT: `VFBCAI_CASE01_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **범위** | **데이터 손실 2건만:** `case01_factDifferenceDetail`, `case01_datePlaceDetail` → Profile·결과 반영 |
| **비범위** | `deadlineDate` 1차 결과 경계, `paymentDemandScope`/`supplementDemandScope`, blockage/evidence 장식 실질화, Master 틀·STOP·bridge·CASE_06 |

조사일: 2026-09-25.

---

## 0. 문제 (감사 0.1 — 확정)

| 키 | 수집 | 현재 Profile (`buildCaseResolutionProfile` ~8750–8791) |
|----|------|--------------------------------------------------------|
| `case01_factDifferenceDetail` | Phase2 text, `case01NeedsFactDifferenceDetail` (~919–924, ~1409–1419) | `getCase01ActualSituationLabel` — choice/infer **만** (~759–767) |
| `case01_datePlaceDetail` | `date_place_wrong` 경로 (~932–935, ~1436–1445) | 동일 — **text 미합성** |

참조 패턴 (합성 라벨, 신규 질문 없음): CASE_05 `case05ActualSituationLabel` = `factRelationship` + `case05FactDetailProfileSuffix` (~8743–8748, ~6102–6111).

---

## 1. 설계 결정

| 항목 | 결정 |
|------|------|
| 신규 질문 | **없음** — 기존 text id·needs*·chain 순서 유지 |
| Profile | `case01ActualSituationProfileLabel(answers)` 신규 helper: `core` = `getCase01ActualSituationLabel`; `diff`/`dp` text가 있으면 `` `${core} — ${diff} · ${dp}` `` (한쪽만 있으면 해당 fragment만) |
| `fact()` source | text가 있으면 `CASE01_FACT_DIFFERENCE_DETAIL_KEY` 또는 `CASE01_DATE_PLACE_DETAIL_KEY` (우선: diff 있으면 diff 키, else datePlace) |
| 결과 UI | `appendCase01Phase2ResultSignals` (~1267+): `diff`/`dp` trim 시 **generic caution 대체·보강** — action 1줄에 사용자 입력 **요약** (전문 인용, 가공 최소) |
| 신호 | `collectCase01Unknowns` / risk — **변경 없음** (최소 범위). text는 Profile·result만 |
| Persist | `CASE01_ANSWER_KEYS` (~418)에 두 키 **명시 추가** (이미 질문으로 저장되나 whitelist 누락 시 meta 손실 방지) |
| STOP | `case01PathFieldsComplete` — **변경 없음** (이미 needs*로 text 필수) |

---

## 2. 계획 diff (STEP2-1)

```diff
--- a/src/lib/adminVerifyProfiling.ts
+++ b/src/lib/adminVerifyProfiling.ts
@@ ~767 (after getCase01ActualSituationLabel)
+function case01ActualSituationProfileLabel(answers: ReviewAnswers): string | null {
+  const core = getCase01ActualSituationLabel(answers);
+  const diff = answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim();
+  const dp = answers[CASE01_DATE_PLACE_DETAIL_KEY]?.trim();
+  const extras = [diff, dp].filter(Boolean);
+  if (!core && extras.length === 0) return null;
+  if (!core) return extras.join(" · ");
+  if (extras.length === 0) return core;
+  return `${core} — ${extras.join(" · ")}`;
+}

@@ buildCaseResolutionProfile actualSituation (~8760)
-        : case01ActualSituationLabel
+        : case01ActualSituationProfileLabel(answers)
@@ source field (~8789)
-        : answers.case01_actualSituation
+        : answers[CASE01_FACT_DIFFERENCE_DETAIL_KEY]?.trim()
+          ? CASE01_FACT_DIFFERENCE_DETAIL_KEY
+          : answers[CASE01_DATE_PLACE_DETAIL_KEY]?.trim()
+            ? CASE01_DATE_PLACE_DETAIL_KEY
+            : answers.case01_actualSituation
             ? "case01_actualSituation"
             : "docs",

@@ CASE01_ANSWER_KEYS (~418)
+  CASE01_FACT_DIFFERENCE_DETAIL_KEY,
+  CASE01_DATE_PLACE_DETAIL_KEY,
```

```diff
--- a/src/components/cost-check/AdminVerifyFirstResultPanel.tsx
+++ b/src/components/cost-check/AdminVerifyFirstResultPanel.tsx
@@ appendCase01Phase2ResultSignals (~1274+)
+  const diffDetail = answers.case01_factDifferenceDetail?.trim();
+  const datePlace = answers.case01_datePlaceDetail?.trim();
+  if (diffDetail) {
+    actions.push(`응답 기준 차이: ${diffDetail.slice(0, 120)}${diffDetail.length > 120 ? "…" : ""}`);
+  }
+  if (datePlace) {
+    actions.push(`확인한 날짜·장소: ${datePlace.slice(0, 120)}${datePlace.length > 120 ? "…" : ""}`);
+  }
```

(기존 `rel === date_place_wrong` caution과 **중복**이면 caution 유지 + action만 추가 — 문구 축소는 STEP2-1에서 조정.)

**터치 외:** `MasterReviewQuotationReport` — text 요약 노출은 **선택** (STEP2-1 VERIFIER가 harness 있으면 추가).

---

## 3. VERIFIER (STEP2-1)

| # | 조건 |
|---|------|
| 1 | 시드: `partial_situation` + `factDifferenceDetail` → Profile `actualSituation.value`에 text 포함 |
| 2 | 시드: `date_place_wrong` + `datePlaceDetail` → 동일 |
| 3 | Phase2 result action에 text 반영 (LEVEL 1 코드 추적) |
| 4 | `npx tsc --noEmit` |
| 5 | CASE_06 bridge · CASE_02/03 회귀 스모크 — **질문 수·순서 동일** |

---

## 4. DQ — **승인 완료 (LOCK)**

**SoT:** `VFBCAI_CASE01_MINIMAL_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md` §1.

| ID | 결정 (2026-09-25) |
|----|-------------------|
| M01 | A — `actualSituation`만 합성 |
| M02 | A — result 120자 truncate |

---

*2026-09-25. STEP2-0. DQ LOCK → STEP2-1 Mission Brief. 코드는 플랫폼 순서 05→06→03→04→01 후 구현.*
