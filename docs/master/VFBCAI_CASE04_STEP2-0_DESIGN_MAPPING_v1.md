# CASE_04 — STEP2-0 설계 매핑 보고 (코드 미변경)

| 항목 | 내용 |
|------|------|
| **전제** | STEP1 DQ-C04-01 ~ DQ-C04-09 **권장안 Ace 승인** (2026-09-24) |
| **SoT** | `VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` § CASE_04 |
| **패턴** | `VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` §1~§8 |
| **구현** | **STEP2-1 보류** — CASE_03 `adminVerifyProfiling.ts` 동시 수정 방지 (Ace 지시) |
| **교차** | DQ-C04-06 `actualCore` 삭제 ↔ CASE_05 DQ-C05-07 — 타 창 조사 결과와 **slug 삭제·classify-only 정리 방향 일치 시** 동시 반영 권장 |

---

## 0. 승인 DQ 요약

| DQ | 결정 |
|----|------|
| C04-01 | `confirmGoal` = 고객 우선 확인 목표 라벨; MASTER Q3 축 → P2 `submissionRelation`·target 분기 |
| C04-02 | Q2 `initialSubmission` P2 이관 유지 |
| C04-03 | Q6 `authorityFollowUp` P2 조건부 유지 |
| C04-04 | `confirmGoal` 5+DI |
| C04-05 | P2 repeat/blockage/evidence/finalGoal 5+DI |
| C04-06 | `case04_actualCore` 삭제 + classify 정리 |
| C04-07 | `submitResponse`/`inquiryResponse` 삭제, authority 단일 축 |
| C04-08 | `case04NeedsTargetDetailPhase2` 삭제 |
| C04-09 | 4필드 골격 + P2 이관; DQ-01 후 progress 재검증 |

---

## 1. 필드·라벨 재정렬 (DQ-C04-01, 02, 03)

### 1.1 Phase1 — AFTER (`CASE04_PHASE1_FIELD_ORDER` 제안)

| 순서 | fieldId | 라벨 (STEP2-1) | MASTER |
|------|---------|----------------|--------|
| 1 | `case04_supplementTarget` | (현행) Q1 | Q1 |
| 2 | `case04_supplementFocus` **신설 또는** `submissionRelation` 승격 검토 | MASTER Q3: «어느 부분을 보완» | Q3 |
| 3 | `case04_customerResponse` | (현행) | Q4 |
| 4 | `case04_confirmGoal` | **«지금 이 보완 요구에서 가장 확인하고 싶은 것은…»** (고객 목표) | 구현 축 |
| 5 | `case04_deadline` | (현행) | Q5 |

**권장 최소 diff (C03 동형):**

- **BEFORE:** P1 `confirmGoal` 라벨 = MASTER Q3, 옵션 = 고객 목표  
- **AFTER:** P1 `confirmGoal` = 고객 목표 라벨만 정정; MASTER Q3 의미는 **P2 `case04_supplementReason` + target 분기(addDoc/modify/evidence/unclear)** 로 이미 커버 — **신설 필드 없이** 라벨·FOCUS·Result 연쇄 수정 (Ace 승인 C04-01 «매핑» 해석)

| MASTER | 구현 (유지·명시) |
|--------|------------------|
| Q2 최초 제출 | P2 `case04_initialSubmission` |
| Q6 제출 후 기관 반응 | P2 `case04_authorityFollowUp` (`case04NeedsAuthorityFollowUpPhase2`) |

### 1.2 Phase2

- Chain 순서 **유지** (`appendCase04Phase2Questions`).
- `case04NeedsTargetDetailPhase2` **삭제** (C04-08).

---

## 2. 옵션 + DI (DQ-C04-04, 05)

| fieldId | 현재 | STEP2-1 |
|---------|------|---------|
| supplementTarget | 5+DI | 유지 |
| confirmGoal | 6, no DI | 5+DI |
| customerResponse | 5+DI | 유지 |
| deadline | 6+DI | 5+DI trim 검토 |
| repeatSupplement | 5, no DI | 5+DI |
| blockage / evidence / finalGoal | no DI | 5+DI |
| authorityFollowUp | 7+DI | 5+DI trim 검토 |

---

## 3. Legacy 삭제 (DQ-C04-06, 07)

| slug | 조치 |
|------|------|
| `case04_actualCore` | `CASE04_ANSWER_KEYS`, `classifyFromCase04Answers`, QA seed 제거; cross-case는 followUp/target 축 유지 |
| `case04_submitResponse`, `case04_inquiryResponse` | 제거; `getCase04AuthorityResponseValue` → `authorityFollowUp` only |
| `case04NeedsTargetDetailPhase2` | 함수 삭제 |

**C05-07 교차:** `case05_actualCore`도 동일 «UI 없음 + classify» 패턴 — 삭제 시 **한 Mission에서 CASE_04·05 actualCore 슬러그를 함께 제거**하면 회귀 범위 명확.

---

## 4. 영향 범위

| 축 | 영향 |
|----|------|
| Profile | `confirmGoal` goal 축; supplement signals unchanged keys |
| Result | `appendCase04Phase1ResultSignals` 라벨·focus 문구 |
| classify | `classifyFromCase04Answers` actualCore 분기 제거 → 02/03/05/06은 **기존 답변 필드**로만 |
| CASE_06 bridge | P1 필드 수 변경 없음(4) — 라벨만 변경 시 bridge 게이트 동일 |
| Harness | `CASE_CONFIGS.CASE_04` phase1 overrides·regression ids |

---

## 5. REUSABLE PATTERNS (STEP2-1 예정)

| § | 판정 | 메모 |
|---|------|------|
| 1 DI | **주의** | confirmGoal + P2 종단 |
| 3 재분류 | **주의** | actualCore 삭제 후 cross-case 경로 단순화 검증 |
| 5 STOP | **주의** | FOCUS vs needs vs append 삼각 (actualCore 제거) |
| 6 Harness | **주의** | strict v2 CASE_04 plan |
| 7 Legacy | **PASS (설계)** | orphan 제거 방향 승인됨 |

---

## 6. STEP2-1 착수 조건

1. CASE_03 STEP2-1 **merge·커밋 완료** (동일 파일 lock 해제)  
2. (선택) CASE_05 DQ-C05-07 결정과 actualCore 삭제 동시 반영 여부 Ace 확인  

---

*2026-09-24. 코드 미변경 — STEP2-1은 CASE_03 완료 후.*
