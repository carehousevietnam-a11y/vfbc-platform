# VFBCAI 질문 재작성 — 전 CASE 공통 품질 게이트 v1

| 항목 | 내용 |
|------|------|
| **성격** | 1단계 재작성안 **필수 점검** (2번창 · 문서만) |
| **적용** | `VFBCAI_CASE0x_QUESTION_CHOICE_REWRITE_MASTER_v1.md` 작성·갱신 시 **매 CASE 동일 점검** |
| **LOCK** | Ace 2026-09-26 — CASE_04·05 화면 확인에서 확인된 유형을 **전 CASE에 잔존 금지** |
| **자동 검사 (1번창)** | 게이트 ID별 스크립트 훅 (§6) |

**관련:** `VFBCAI_FAILURE_PATTERN_REGISTRY.md` D03 · F09 · P11 · §3.1 통합 PASS

---

## QG-01 기한 질문 — 동의어 선택지 중복

### 증상

같은 **사실 차원**(`deadline_certainty`)을 두 선택지가 나눠 가짐. 고객은 어느 쪽을 골라도 되어 **선택 공간이 인위적으로 쪼개짐** (D03 빈틈의 반대 — **중복 슬롯**).

**대표 문구 쌍 (현행 코드):**

| slug A | slug B | 의미 |
|--------|--------|------|
| `uncertain` | `period_stated` | 「기한은 있다는 것은 알지만 날짜 모름」 ≈ 「기한 안내만 받고 날짜 모름」 |
| `deadline_mentioned` (CASE_02) | `uncertain` | 동일 축 |

### CASE별 현행 스캔 (2026-09-26 · `adminVerifyProfiling.ts`)

| CASE | 필드 id | 중복·유사 쌍 | 재작성안 목표 slug (4단계) |
|------|---------|--------------|---------------------------|
| **01** | `case01_deadline` | `deadline_day_known` vs `confirmed` (둘 다 **날짜 확인** + text) · `uncertain` vs `deadline_window_only` 경계 모호 | `date_known` · `window_only` · `exists_unknown` · `not_checked` · (+ `asap`/`no_stated`는 **별 축**이면 유지) |
| **02** | `case02_deadline` | `uncertain` + `deadline_mentioned` **동일 쌍** | `date_known`(confirmed) · `window_only` · `exists_unknown` · `not_checked` · `unsure_total` |
| **03** | `case03_deadline` | `uncertain` + `period_stated` | CASE_05와 **동일 4+DI** |
| **04** | `case04_deadline` | `uncertain` + `period_stated` (Ace 확인) | `specific_date` · `window_only` · `exists_unknown` · `not_stated` · `unsure_total` — **02·03 중복 제거** |
| **05** | `case05_deadline` | `uncertain` + `period_stated` + `unsure` 3중 | `VFBCAI_CASE05_QUESTION_CHOICE_REWRITE_MASTER_v1.md` §1.4 **이미 반영** |
| **06** | `profileAuthorityGuidance` | `uncertain` 단일 (양호) · `not_stated` vs `not_checked` **부분 겹침** | `date_known` · `window_or_exists_unknown` · `not_checked` · `past_possible` |

### 재작성 규칙 (LOCK)

1. **기한 질문당** `deadline_certainty` 값은 **상호 배타** 한 세트만.
2. 「날짜를 안다」= **반드시** `requires_text_key` (§QG-03)와 한 쌍.
3. 「기간만 안다」(`window_only`)와 「있다는 것만 안다」(`exists_unknown`)는 **문안으로 구분** — 한쪽은 **N일/이번 달** 언급, 한쪽은 **기한 존재만** 언급.
4. 재작성 마스터 각 CASE에 **「QG-01 PASS」** 행: 중복 쌍 **0건** 명시.

---

## QG-02 대응 질문 — 뜻 겹치는 선택지

### 증상

`customerResponse` (또는 동등 필드)에서 **행동 단계**가 겹침.

### CASE_04 (Ace 확인 · 선택지 04/05)

| # | slug | 현행 label 요지 |
|---|------|-----------------|
| 04 | `inquired` | 전화·메시지로 **문의·확인** |
| 05 | `other_method` | 전화·재제출과 **다른 방법**으로 대응 |

**겹침:** 전화 문의만 한 고객은 04. 이메일·방문만 한 고객은 04 vs 05 **경계 불명**. 「문의 + 다른 채널」은 **한 선택지로 흡수** 불가 시 **채널+접수 상태** 복합 문안으로 04/05 **합치거나** 04를 `inquired_no_submission` / 05를 `acted_nonstandard_channel` 등 **사실 차원 분리**.

### 전 CASE 스캔 (대응 필드)

| CASE | 필드 | 겹침·리스크 | 재작성 방향 |
|------|------|-------------|-------------|
| **01** | `case01_responseDetail` 등 | 다채널·미접수 분산 | Brief v3 **단일 출구** (F09) 유지 |
| **02** | `case02_customerResponse` | 납부 확인 vs 문의 | 채널·접수 **복합 1인칭** |
| **03** | `case03_customerResponse` | 출석 vs 서면 vs 문의 | 동일 |
| **04** | `case04_customerResponse` | **04/05** + `preparing` vs `not_started` (경계: 준비만) | **행동 완료 여부** + **기관 답변** 2축을 **한 질문 선택지**에 담기 (CASE_05 `customerResponse` 분기 모델) |
| **05** | `case05_customerResponse` | 구 `inquired` 단일 | `inquired_no_answer` / `inquired_answered` (**마스터 반영**) |
| **06** | `profileCustomerAction` 등 | 문서 CASE — Phase1 action vs goal | 동형 점검 |

### 재작성 규칙

- **단일 선택 상황형:** 선택지 = **서로 다른 (action_stage × authority_reply)** 조합의 **최소 완전 커버**.
- 겹치는 두 문장 → **합치거나** fact dimension을 바꿔 **배타** 만들기 (질문 추가 금지 — D03).

---

## QG-03 「날짜 확인」 선택 ↔ 날짜 입력칸

### 증상

「날짜를 확인했습니다」류 slug를 고른 뒤 **text 비어 있어도** 다음 단계로 넘어가는 것처럼 보이거나, Profile에 날짜 없이 **확인됨**으로 표시.

### 제품 규칙 (재작성안 · IMPLEMENTER LOCK)

| 항목 | 규칙 |
|------|------|
| **바인딩** | `requires_date_text_slugs` 집합에 포함된 slug → **필수** `case0x_deadlineDate` (또는 CASE 키) **non-empty trim** |
| **완료 게이트** | `isCase0xPhase1Complete` / Phase 해당 구간 = choice complete **AND** `!needsDeadlineDateDetail(answers)` |
| **질문 체인** | text 질문 push 후 **`needsDeadlineDateDetail`이면 `return`** (다음 choice 노출 금지) — **CASE_01·02 패턴** |
| **결과·Layer A** | 날짜 text 없으면 label에 「확인했습니다」만 쓰지 않음 — **unconfirmed** 또는 기한 slug label만 |

### 현행 코드 정합 (문서 SoT · 2026-09-26)

| CASE | date 필수 slug | `*NeedsDeadlineDateDetail` | append 후 `return` |
|------|----------------|------------------------------|-------------------|
| **01** | `confirmed`, `deadline_day_known` | 있음 | **있음** ✓ |
| **02** | `confirmed` | 있음 | **있음** ✓ |
| **03** | `specific_date` | 있음 | **없음** — IMPLEMENTER 정렬 |
| **04** | `specific_date` | 있음 | **없음** — IMPLEMENTER 정렬 |
| **05** | `specific_date` | 있음 | **없음** — IMPLEMENTER 정렬 |
| **06** | `specific_date`, `case06_deadlineActionPair` date slugs | `case06NeedsDeadlineDate` | Phase1 loop **return** ✓ |

**재작성 마스터 필수 표:**

```markdown
| slug | requires_text_key | gate_function |
|------|-------------------|---------------|
| specific_date | case0x_deadlineDate | case0xNeedsDeadlineDateDetail |
```

**자동 검사:** fixture `deadline=specific_date`, `deadlineDate=""` → Phase1 complete **false** · question list **다음 choice 없음** · harness `return` 패턴 grep.

---

## QG-04 Phase2 「기억·대조 어려움」 신호 반복 (F09 확장)

### 증상

동일 경로에서 **recall / compare_difficulty** 신호가 여러 질문에 등장 → 전문가가 같은 불확실성을 **중복 수집**.

### 신호 유형 (canonical)

| signal_id | 의미 | 금지 |
|-----------|------|------|
| `RECALL_DIFFICULTY` | 무엇을 제출·당시 상황 **기억 못 함** | 2차에서 **2질문 이상** |
| `COMPARE_DIFFICULTY` | 통지 vs 실제 **대조 자체 어려움** | `factRelationship` + `submissionRelation` **동시** |
| `INTERPRET_DIFFICULTY` | 문구 **해석** 불가 | `disposition_unclear` + `unknown` relationship **중복** |

### CASE별 현행 중복 (요지)

| CASE | 질문 A | 질문 B | 중복 신호 |
|------|--------|--------|-----------|
| **01** | `case01_factRelationship` (`hard_to_explain`/`hard_to_judge`) | facet·compare follow-ups | COMPARE + RECALL 분산 |
| **02** | `case02_situationMatch` `hard_to_judge` | Phase2 match follow-up | COMPARE |
| **03** | `case03_factRelationship` | attendance·evidence | COMPARE |
| **04** | `case04_initialSubmission` **`hard_to_confirm`** | `case04_submissionRelation` **`hard_to_judge`** | **RECALL×2** (동일 「처음 제출 기억 어려움」) |
| **05** | `case05_factRelationship` `hard_to_judge` | `case05_factDetail` `date_place_fuzzy` / `content_differs_vague` | COMPARE + RECALL |
| **05** | `disposition_unclear` (type) | `factRelationship` `unknown` | INTERPRET×2 |
| **06** | `hard_to_classify` / `hard_to_tell` / `hard_to_point` / `hard_to_recall` | blockage·finalGoal | **다중 RECALL/INTERPRET** |

### 재작성 규칙 (LOCK)

1. **경로당** `RECALL_DIFFICULTY` **단일 질문 id** — 이미 답했으면 Phase2 **skip** (NEVER ASK AGAIN).
2. `hard_to_judge`를 relationship에서 고르면 → `initialSubmission`의 `hard_to_confirm` **노출 금지** (CASE_04).
3. `factDetail`의 fuzzy/vague는 **relationship이 partial/mismatch일 때만** — `hard_to_judge`면 **factDetail 생략** 또는 한 질문으로 **합침** (CASE_05).
4. 각 CASE 재작성 마스터 §에 **「QG-04 신호 출구 표」** (signal → sole question id).

---

## §5. CASE 재작성안 체크리스트 (매 커밋)

| 게이트 | PASS 조건 |
|--------|-----------|
| **QG-01** | 기한 질문에 `uncertain`≈`period_stated` 쌍 **0** · CASE 표에 4단계 certainty 명시 |
| **QG-02** | 대응 질문 선택지 pairwise **의미 중복 0** (04/05 유형) |
| **QG-03** | date 필수 slug 표 + text 키 · 모순 문안 없음 |
| **QG-04** | recall/compare/interpret **경로당 1질문** · skip 규칙 표 |

**미충족 시:** 통합 PASS **금지** (레지스트리 §3.1) — 「재작성안 초안」으로만 기록.

---

## §6. 자동 검사 훅 (제안 · 1번창)

| id | 입력 | FAIL |
|----|------|------|
| `qg01-deadline-synonym` | OPTIONS label pairwise similarity / 금지 slug 쌍 registry | forbidden pair both present |
| `qg02-response-overlap` | customerResponse options embedding cluster | same cluster >1 choice |
| `qg03-date-text-gate` | slug set + fixtures empty text | phase complete true |
| `qg04-recall-singleton` | on-path question ids per signal | same signal ≥2 ids |

---

## §7. 변경 이력

| 일자 | 내용 |
|------|------|
| 2026-09-26 | v1 — QG-01~04 · CASE_01~06 스캔 · QG-03 append `return` 갭 문서화 |

---

*2번창 — 문서만. push 금지.*
