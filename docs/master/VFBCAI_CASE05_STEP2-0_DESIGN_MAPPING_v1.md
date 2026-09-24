# CASE_05 — STEP2-0 설계 매핑 (삭제 승인 + DI 후속 분리)

| 항목 | 내용 |
|------|------|
| **전제** | DQ-C05-03 · DQ-C05-07 **삭제 승인** (2026-09-24). CASE_04 DQ-C04-06과 동일 방향 |
| **SoT** | `VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` § CASE_05 · § CASE_06 |
| **패턴** | `VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` §1~§8 |
| **이번 커밋** | `case05_actualCore` · `case05_dispositionSource` 삭제만 |
| **제외** | DQ-C Phase2 DI 통일은 **이 문서에만 계획**하고 **별도 후속 커밋** |

---

## 0. 승인 결정

| ID | 결정 |
|----|------|
| **DQ-C05-03** | `case05_dispositionSource` **삭제**. 질문 복원·CASE_06 handoff 전용 유지 안 함 |
| **DQ-C05-07** | `case05_actualCore` **삭제**. CASE_05에 재분류 질문을 만들지 않음. MASTER의 `actualCore`는 CASE_06 `case06_actualCore`에 이미 있음 |
| **DQ-E** | 교차 재분류 축은 **기관 followUp**으로 통일. `payment_demand` → CASE_02, `attendance_explanation` → CASE_03, `more_docs` → CASE_04 **유지**. `actualCore`의 `violation_notice` → CASE_01 분기는 **복원하지 않음** |

canonical `disposition_unclear`는 CASE_06으로 나가지 않고 CASE_05에 남고, 레거시 slug `unclear`만 CASE_06으로 나간다.

Q1이 완료된 제품 경로에서는 `classifyFromCaseEntryQ1`이 `classifyFromCase05Answers`보다 앞선다. followUp 재분류는 Q1이 없는 경로에서만 사건 ID를 바꾼다. 이번 삭제는 그 순서를 바꾸지 않는다.

---

## 1. 이번 커밋 — 삭제 매핑

### 1.1 `case05_actualCore` (DQ-C05-07)

| 위치 | 처리 |
|------|------|
| `CASE05_ANSWER_KEYS` | 제거 |
| `CASE05_FOCUS_ORDER` | 제거 후 뒤 rank 당김 |
| `CASE05_ACTUAL_CORE_OPTIONS` · `CASE05_FIELD_OPTION_MAP` · flat label spread | 제거 |
| `case05NeedsActualCore` | 제거 (항상 false) |
| `selectCase05ResolutionFocus` | skip 분기 제거 |
| `classifyFromCase05Answers` | `core` 분기 제거. followUp 3축만 유지 |
| `runCase05QaScenario` D~H 시드 | `case05_actualCore` 제거 |

### 1.2 `case05_dispositionSource` (DQ-C05-03)

| 위치 | 처리 |
|------|------|
| `CASE05_ANSWER_KEYS` · FOCUS rank 7 | 제거 (phantom focus 해소) |
| `CASE05_DISPOSITION_SOURCE_OPTIONS` · option map · flat label spread | 제거 |
| `deriveDispositionSignals` | `unsure` → `DISPOSITION_AUTHORITY_UNCLEAR` 분기와 신호 코드·라벨 제거 |
| `buildCaseResolutionProfile` `authority` | 체인에서 이 필드 제거. 남은 순서: `case06_exactSource` → `case02_demandAuthority` → CASE_01 교통 문맥 → `profileDocumentSource` |
| QA 시드 | `runCase05QaScenario`, `admin-verify-master-profiling-verify.mjs`, `investigate-case03-05-pathcomplete.mjs`에서 키 제거 |

### 1.3 옛 meta

`restoreAdminProfilingAnswersFromMeta`가 JSON을 펼치기 전에 `case05_actualCore` · `case05_dispositionSource`를 **삭제**한다. 질문으로 되살리지 않는다. 다음 저장은 `CASE05_ANSWER_KEYS` whitelist에 없으므로 다시 쓰지 않는다.

### 1.4 패턴 (삭제 커밋)

| # | 판정 |
|---|------|
| 1 DI | 삭제 필드 미노출. 이번 커밋에서 DI 추가 없음 |
| 2 CTA | N/A |
| 3 재분류 | followUp 3축 유지. `violation_notice`→CASE_01 제거. Q1 우선 유지 |
| 4 브릿지 | N/A. CASE_06 `exactSource` / `case06_actualCore` 유지 |
| 5 STOP | phantom focus 제거. pathComplete는 두 필드를 요구하지 않음 |
| 6 Harness | 시드 키 제거. 제품 우회 없음 |
| 7 레거시 | 두 orphan slug 제거 |
| 8 옵션 수 | 죽은 7개·9개 배열 제거. Phase2 DI 미달은 §2 |

---

## 2. 후속 커밋 — DQ-C Phase2 DI 통일 (이번 커밋 제외)

**이 절은 계획이다. 삭제 커밋 코드에 넣지 않는다.**

대상 6필드에 `ADMIN_DIRECT_EXPLAIN_CHOICE`를 붙인다. `case05_evidence`의 `evidence_other`는 공식 DI `other`+note로 흡수하고, 옛 값 읽기 fallback만 둔다.

| fieldId | 현재 내용 선택지 | DI | 완료 게이트 (후속 시) |
|---------|------------------|----|------------------------|
| `case05_dispositionReason` | 6 | 없음 | 이미 `isAdminVerifyChoiceFieldComplete` |
| `case05_authorityFollowUp` | 9 | 없음 | 이미 choice-complete |
| `case05_repeatFollowUp` | 5 | 없음 | `!answers` → choice-complete 로 전환 |
| `case05_blockage` | 9 | 없음 | 이미 choice-complete |
| `case05_evidence` | 9 (`evidence_other` 포함) | 없음 | choice-complete 유지 + `evidence_other` 흡수 |
| `case05_finalGoal` | 8 | 없음 | `!answers` → choice-complete 로 전환 |

4~5개로 줄이는 트리밍은 이 DQ-C 범위에 넣지 않는다. DI를 붙인 뒤에도 5개를 넘는 필드는 §8 **주의**로 남긴다.

CASE_03 · CASE_04의 DQ-A/B/D/E는 이 문서와 이 커밋 범위가 아니다.
