# CASE_01 Full Enhancement — STEP2-1 Mission Brief

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **LOCK** — Ace 승인 2026-09-25 (§2.2 label·§5 시나리오 반영). §1·§1.1 **재오픈 금지** |
| **Mission** | CASE_01 **전면 질문·선택·표현 고도화** — 압축형 조사 선택지, Profile·분기·결과·증거 **실연결** |
| **설계 SoT** | `VFBCAI_CASE01_FULL_ENHANCEMENT_STEP2-0_v1.md` (STEP2-0 v0.1 승인 내용과 동기화) |
| **감사 SoT** | `VFBCAI_CASE01_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **기준 (LOCK)** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` — **3:7~4:6 하한 재해석·변경 금지** |
| **헌법** | `docs/VFBCAI_CONSTITUTION.md` §16.6 |
| **질문 MASTER** | `VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` — **본 Mission은 Master 문서 미수정**; 구현은 감사 기준·본 Brief만 따름 |

**폐기:** `VFBCAI_CASE01_MINIMAL_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md` (M01/M02) — **본 Mission으로 대체**. CASE_02 최소 리메디에이션도 동일 정책으로 **별도 Mission 대기**.

**코드 미착수 (본 문서 작성 시점).** 구현은 **LOCK된 본 Brief + STEP2-0**만 따른다. §1 DQ·§1.1 **재오픈 금지**(LOCK 후).

---

## 0. Mission 한 줄

CASE_01을 **단답 카테고리·장식 text·Profile 단절**에서 벗겨 **압축 조사 선택지**로 재구성하고, 각 choice가 **Situation Profile · 다음 질문 집합 · 증거 게이트 · 1차/2차 결과**에 관측 가능하게 반영되도록 한다. **완료 증거는 브라우저 실측**(Phase1 → 1차 결과 → Phase2 → 개인화/2차 결과). `tsc` / strict harness / engine spot은 **참고만**.

**비율:** Phase1 **실질 5축 유지**, Phase2 **실질 8~9**로 **4:6 하한** 필수. **3:7(2차≥12) 강제 없음** — 자연 증가 허용, **채우기용 장식 질문 금지**. **4:9·5:8 등 타 CASE Mission 목표치를 CASE_01 목표로 설정 금지**.

---

## 1. DESIGN QUESTIONS — Ace 승인 (2026-09-25)

| ID | 결정 | 구현 요약 |
|----|------|-----------|
| **DQ-C01-E01** | **유지** | Phase1 **실질 축 5** (`violationContent`, `factRelationship`, `customerResponded`, `deadline`, `confirmGoal`) — 질문 id 역할 유지 |
| **DQ-C01-E02** | **흡수** | `case01_paymentDemandScope` / `case01_supplementDemandScope` **질문 축소·제거** → `case01_authorityDemand` **압축 choice**에 scope·재분류(`core_case` / bundled) 반영. `authorityClaim`·`classifyFromCase01Answers`·result **동시** 갱신 |
| **DQ-C01-E03** | **choice + 보조 1줄** | `case01_deadline` 압축 choice가 기한 상태를 담고, **`case01_deadlineDate`는 `deadline_day_known`류에서만** 보조 text **1줄**. textarea 단독 축으로 기한을 채우지 않음 |
| **DQ-C01-E04** | **4:6만 필수** | VERIFIER: 전형 경로 Phase2 **실질 축 8~9** (②~④ 통과). **2차≥12(3:7) Mission 필수 아님**. 12+는 복잡 경로에서 **자연 발생만** 허용 |
| **DQ-C01-E05** | **허용** | M01/M02 (`case01ActualSituationProfileLabel`, text 합성·result truncate-only) **revert 또는 fallback** — choice facet이 1차 소스가 되면 제거 |

### 1.1 추가 결정 — `cannot_compare` 경로 (LOCK)

| 항목 | 결정 |
|------|------|
| **방향** | `case01_factRelationship`의 **비교 불가** 경로에서 `case01_factRelationshipNote` **자유 text를 기본 경로로 두지 않음** |
| **대체** | **4~5개 압축 choice**로 대체(§2.2). 단순 「모름」 금지 — **왜 지금 사실관계를 비교할 수 없는지** 서로 다른 **실제 상황**을 각 choice에 압축 |
| **필수 downstream** | 각 choice: **Profile 구조화 저장** · **다음 질문/needs* 분기** · **결과 화면에서 의미 유지**(1차/2차 해당 시) |
| **금지** | 「검토」만 남기고 Profile·분기·결과 미연결. note-only로 핵심 축 채우기(기준 ⑤ 위반) |

---

## 2. IMPLEMENTER — 필수 구현 범위

### 2.1 P0 — 선택지·표현 고도화 (Phase1)

**파일:** `src/lib/adminVerifyProfiling.ts`, `src/components/cost-check/AdminVerifyFirstResultPanel.tsx`

| 질문 id | 요구 |
|---------|------|
| `case01_violationContent` | STEP2-0 §4.1 압축 label·facet slug. `event`·재분류 힌트·증거/Phase2 톤 분기 |
| `case01_factRelationship` | STEP2-0 §4.2 압축 choice. **§2.2 비교불가 분기** 포함 |
| `case01_customerResponded` | STEP2-0 §4.3 — response 체인 on/off·Profile `customerAction` |
| `case01_deadline` | STEP2-0 §4.4 — **DQ-C01-E03**. Profile `deadline`·source·blockage·1차 result |
| `case01_confirmGoal` | STEP2-0 §4.5 — `goal`·adaptive `finalGoal`/`blockage` 가중 |

**공통:** 선택지는 **행동·기관·상태·상대 반응·불확실·증거·다음 조사**를 한 안에 압축(단답 카테고리 금지). `ADMIN_DIRECT_EXPLAIN_CHOICE`는 예외·보완(기준 ⑤).

### 2.2 P0 — 비교 불가 4~5 choice (§1.1 확정)

**구현 옵션 (IMPLEMENTER는 하나 선택, Brief LOCK 전 ARCHITECT/Ace 확인 가능):**

- **A (LOCK):** `factRelationship` value `cannot_compare_yet` 선택 시 **후속 choice 질문** `case01_factCompareGap` (신규 id, Phase1 `factRelationship` 완료 직후) — **5 option**  
- **B:** (미채택)

**질문 label (LOCK):** 「설명받은 내용과 실제 상황을 지금 바로 비교하기 어려운 가장 큰 이유는 무엇에 가깝나요?」

**고객向 label 전문 (slug 고정):**

| slug | 고객向 label (전문) |
|------|---------------------|
| `gap_notice_incomplete` | 통지서·안내를 봤지만, 문제가 된 **날짜·장소·행동·누구**에 대한 내용이 빠져 있거나 적혀 있지 않아, 지금은 교통국 설명과 제 상황을 **대조할 수 없습니다**. |
| `gap_memory_timeline` | 무엇이 문제라고 들은 것은 대략 기억나지만, **그때가 언제·어디였는지** 일정과 장소가 흐려져, 설명받은 내용과 제가 한 일을 **맞춰 보기 어렵습니다**. |
| `gap_hearsay_channel` | 교통국에서 **직접 설명을 듣거나 문서를 받지 못했고**, 지인·대행·통역 등 **다른 경로로만** 들었기 때문에, 통지 내용과 사실이 같은지 **확인하기 어렵습니다**. |
| `gap_records_not_found` | 교통국이 말하는 내용과 제 **제출·등록·접수 기록**이 맞는지 보려면 자료가 필요한데, 아직 **접수증·등록 내역·제출 증빙**을 찾지 못했습니다. |
| `gap_language_access` | 안내를 받은 것은 기억나지만, **한국어·통역**으로 문구를 제대로 이해하지 못했거나, **무엇이 문제라고 하는지** 핵심 문장을 확인하지 못해 **비교할 수 없습니다**. |

**Profile · 분기 · 결과 (LOCK):**

| slug | Profile (구조화) | 분기 (needs* / 다음 질문) | 결과 (1차/2차) |
|------|------------------|---------------------------|----------------|
| `gap_notice_incomplete` | `unknowns` += 「통지 핵심 문구」; `event` status candidate | `case01_evidence`에서 `notice` 우선 노출·FOCUS; `authorityDemand` `demand_unclear` 가중 | 1차 `unconfirmed` 「통지 핵심 문구」; 2차 action 통지 재확인 |
| `gap_memory_timeline` | `actualSituation` uncertain; `currentBlockage` → `facts_why` 후보 | `actualSituation` 정밀 질문 early; evidence `photo_video` needs | caution 일정·기억 정리; action 당시 일정 대조 |
| `gap_hearsay_channel` | `event` + customerAction 보조(간접 인지); classify CASE_06 후보 가중 | `authorityDemand` unclear·adaptive; evidence `message` 우선 | caution 3자 전달; unconfirmed 안내 경로 |
| `gap_records_not_found` | `authorityClaim` 보조 fragment 「제출·등록 기록 미확보」 | `authorityDemand` `supplement`/`correct_record` 가중; evidence `submitted_docs` | action 기록·접수증 찾기 |
| `gap_language_access` | `currentBlockage` → `content_unclear` | `demand_unclear`·`authorityDemandDetail` 축소·choice화; evidence `notice` | unconfirmed 「안내 문구 확인」; caution 통역·원문 확인 |

**legacy:** `CASE01_FACT_RELATIONSHIP_NOTE_KEY` — **신규 경로 기본 미사용**. restore·DI는 fallback만(DQ-C01-E05).

### 2.3 P1 — Phase2 체인 고도화

| 항목 | 요구 |
|------|------|
| `case01_authorityDemand` | DQ-C01-E02 scope 흡수 압축 choice (STEP2-0 §5.1). `paymentDemandScope`/`supplementDemandScope` **노출 제거 또는 dead gate** |
| `case01_actualSituation` | Phase1 쟁점과 **중복 최소화**·정밀 facet. Profile·evidence·result 분기 |
| `responseDetail` / `authorityResponse` | 압축 choice, Profile `customerAction`/`authorityResponse`, result 분리 |
| `case01_evidence` | 종류별 **needs·result·expert 톤** 차등 (감사 2.7 장식 해소) |
| `blockage` / `finalGoal` | 조건부 유지, value별 Profile·result **실질 분기** |

**흡수·축소:** `case01_factDifferenceDetail`, `case01_datePlaceDetail` **단독 textarea 필수 경로 제거** — facet choice + **필요 시 1줄**만. `authorityDemandDetail` 장식화 해소 또는 축소.

### 2.4 P2 — M01/M02 revert · Profile 1차 소스

- `case01ActualSituationProfileLabel` 등 **text 합성 우선** 로직: **revert 또는 choice facet fallback**  
- result **truncate**는 보조(긴 보조 1줄용). **주 신호는 choice·Profile**

### 2.5 P3 — 데이터 버그 트랙 (고도화와 병렬, 동일 Mission 내 최소)

**대상:** `case01_deadlineDate` (및 동일 패턴 specific_date류)  
**추적:** answer → `buildCaseResolutionProfile` → `CASE01_ANSWER_KEYS` / persist meta → restore → `appendCase01Phase1/2ResultSignals`  
**요구:** 브라우저에서 입력·재진입 후 **문자열 유실 0**. Phase1 1차 결과 경계는 Brief·VERIFIER에 명시(날짜 있으면 1차 action 반영 여부 STEP2-0 §9).

### 2.6 실질 축·비율 (VERIFIER 산정)

| 구분 | 카운트 규칙 |
|------|-------------|
| Phase1 | **5** — DQ-C01-E01 |
| Phase2 | **8~9** 전형 경로 **필수** (4:6: \( \lceil 5 \times 6 / 4 \rceil = 8 \)). **②~④ 통과 질문만** |
| 제외 | 장식 질문, text-only 단독 축, 흡수된 scope 질문 |
| 3:7 | **필수 아님** (DQ-C01-E04) |

경로별 표는 STEP2-1 완료 시 VERIFIER가 **브라우저 경로 4건** 기준으로 작성.

---

## 3. 금지 (Human Boundary)

- **M01/M02 수준** partial patch로 Mission 완료 선언  
- `needs*` / 조건부 질문 **존재**를 화면 질문 수·완료로 간주  
- 감사 **3:7~4:6 하한** 변경, CASE_01 목표를 **4:9·5:8** 등으로 설정  
- **Master LOCK 문서** (`VFBCAI_행정문서_질문_MASTER_…` 등) **편집**  
- CASE_06 bridge · Q1 · 타 CASE 질문 체인 **임의 동기화** (회귀만 VERIFIER)  
- Evidence **upload gate** 구조 변경  
- 형식적 질문·장식 choice로 **비율 채우기**  
- `cannot_compare` 경로를 **note text 검토 상태**로만 남김 (§1.1 위반)

---

## 4. 터치 파일 (예상)

| 파일 | 내용 |
|------|------|
| `src/lib/adminVerifyProfiling.ts` | OPTIONS, needs*, Profile, classify, path complete, (안) `case01_factCompareGap` |
| `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` | Phase1/2 result signals — **choice 기반** |
| `src/components/cost-check/MasterReviewQuotationReport.tsx` | (선택) facet 요약 |
| `tests/qa/*case01*` | **브라우저 시나리오 우선**; strict/engine은 보조 |

---

## 5. VERIFIER — 완료 조건 (**브라우저 최종**)

### 5.1 공통

1. PC + **375px** — `06-ui-design-responsive-typography-qa.mdc` (압축 choice 가독성·wrap)  
2. `npx tsc --noEmit` — **참고** (PASS만으로 Mission 완료 아님)  
3. CASE_06→CASE_01 bridge, CASE_02/03 **회귀 스모크** — 질문 **의미·분기** 훼손 없음

### 5.2 브라우저 필수 경로 (각 1회 이상, 증거: 스크린·질문 id 로그)

공통: `/verify/admin` · Q1 엔진 label 선두 20자 클릭( strict와 동형: `violation_notice` ). 가입 필드는 QA 표준(이름·전화·주소·이메일·카카오·약관). Phase1 evidence gate → 「자료 없이 계속하기」.

---

#### V1 — 사실 부인 + alibi facet (A/B: `factRelationship`만 변경)

**목적:** `deny_with_alibi` vs `partial_core_dispute` — Profile·Phase2 질문 집합·1차/2차 result **관측 차이**.

| 단계 | Phase | 질문 id | Run **V1-A** value | Run **V1-B** value |
|------|-------|---------|-------------------|-------------------|
| 1 | Q1 | `adminCaseDocumentKind` | `violation_notice` | 동일 |
| 2 | 1 | `case01_violationContent` | `conduct_denied_or_partial` | 동일 |
| 3 | 1 | `case01_factRelationship` | `deny_with_alibi` | `partial_core_dispute` |
| 4 | 1 | `case01_customerResponded` | `no_contact_yet` | 동일 |
| 5 | 1 | `case01_deadline` | `deadline_window_only` | 동일 |
| 6 | 1 | `case01_confirmGoal` | `fit_and_facts` | 동일 |
| 7 | — | 가입 → 1차 결과 | 관측 `cautions`/`actions`/`unconfirmed` | 동일 |
| 8 | 2 | 「개인화 상세 검토하기」 | click | click |
| 9 | 2 | `case01_authorityDemand` | `attend_explain` | 동일 |
| 10 | 2 | `case01_actualSituation` | `deny` | `partial` |
| 11 | 2 | `case01_evidence` | `photo_video` | `notice` |
| 12 | 2 | `case01_blockage` (열리면) | `facts_why` | `content_unclear` |
| 13 | 2 | path complete → 2차/개인화 결과 | **alibi·증거 사진** 축 문장 | **부분 일치·통지 대조** 축 문장 |

**PASS:** V1-A vs V1-B에서 단계 10~13 중 **최소 2단계**에서 질문 id 집합 또는 result 문장이 **다름** (엔진 `buildCaseResolutionProfile` + 화면 innerText).

---

#### V2 — demand scope 흡수 (`pay_core_traffic` vs `attend_explain`)

**목적:** `paymentDemandScope`/`supplementDemandScope` **화면 미노출** · `authorityClaim`·재분류·result 차이.

| 단계 | Phase | 질문 id | Run **V2-A** | Run **V2-B** |
|------|-------|---------|--------------|--------------|
| 1 | Q1 | `adminCaseDocumentKind` | `violation_notice` | 동일 |
| 2 | 1 | `case01_violationContent` | `traffic_spatiotemporal_dispute` | 동일 |
| 3 | 1 | `case01_factRelationship` | `align_minor_gap` | 동일 |
| 4 | 1 | `case01_customerResponded` | `no_contact_yet` | 동일 |
| 5 | 1 | `case01_deadline` | `no_deadline_stated` | 동일 |
| 6 | 1 | `case01_confirmGoal` | `what_to_do_now` | 동일 |
| 7 | — | 1차 결과 | 관측 | 관측 |
| 8 | 2 | 「개인화 상세 검토하기」 | click | click |
| 9 | 2 | `case01_authorityDemand` | `pay_core_traffic` | `attend_explain` |
| 10 | 2 | `case01_paymentDemandScope` | **나타나면 FAIL** (흡수 미완) | **나타나면 FAIL** |
| 11 | 2 | `case01_actualSituation` | `partial_similar` | `accept_facts` |
| 12 | 2 | `case01_evidence` | `notice` | `notice` |
| 13 | 2 | `case01_blockage` (열리면) | `how_respond` | `how_respond` |
| 14 | 2 | 결과 | `authorityClaim`에 **납부 핵심**·CASE_02 힌트 | **출석·소명**·CASE_03 힌트 |

**PASS:** V2-A vs V2-B 단계 9·14에서 Profile `authorityClaim`·result **관측 차이**. 단계 10 scope 질문 **0회**.

---

#### V3 — `deadline_day_known` + 보조 1줄 (persist·restore)

| 단계 | Phase | 질문 id | 값 / 입력 |
|------|-------|---------|-----------|
| 1 | Q1 | `adminCaseDocumentKind` | `violation_notice` |
| 2 | 1 | `case01_violationContent` | `traffic_spatiotemporal_dispute` |
| 3 | 1 | `case01_factRelationship` | `align_minor_gap` |
| 4 | 1 | `case01_customerResponded` | `no_contact_yet` |
| 5 | 1 | `case01_deadline` | `deadline_day_known` |
| 6 | 1 | `case01_deadlineDate` (보조 text) | `2026-11-15` |
| 7 | 1 | `case01_confirmGoal` | `what_to_do_now` |
| 8 | — | 1차 결과 | action 또는 caution에 **2026-11-15** (정책: Phase2 전 경계 — 있으면 PASS, 없으면 P3 이슈) |
| 9 | 2 | 「개인화 상세 검토하기」 | click |
| 10 | 2 | `case01_authorityDemand` | `demand_unclear` |
| 11 | 2 | `case01_actualSituation` | `unsure` |
| 12 | 2 | `case01_evidence` | `notice` |
| 13 | — | **재진입** | 동일 lead meta restore 후 Profile `deadline`·result에 **2026-11-15** 유지 |

**PASS:** 단계 6·8·13에서 날짜 문자열 **유실 0** (answer → Profile → persist → restore → result).

---

#### V4 — `case01_factCompareGap` 2종 (A안)

| 단계 | Phase | 질문 id | Run **V4-A** | Run **V4-B** |
|------|-------|---------|--------------|--------------|
| 1 | Q1 | `adminCaseDocumentKind` | `violation_notice` | 동일 |
| 2 | 1 | `case01_violationContent` | `authority_explanation_missing` | 동일 |
| 3 | 1 | `case01_factRelationship` | `cannot_compare_yet` | 동일 |
| 4 | 1 | `case01_factCompareGap` | `gap_notice_incomplete` | `gap_memory_timeline` |
| 5 | 1 | `case01_customerResponded` | `no_contact_yet` | 동일 |
| 6 | 1 | `case01_deadline` | `no_deadline_stated` | 동일 |
| 7 | 1 | `case01_confirmGoal` | `why_and_basis` | 동일 |
| 8 | — | 1차 결과 | `unconfirmed` 「통지 핵심 문구」 | caution 일정·기억 |
| 9 | 2 | 「개인화 상세 검토하기」 | click | click |
| 10 | 2 | `case01_authorityDemand` | `demand_unclear` | 동일 |
| 11 | 2 | `case01_actualSituation` | `unsure` | `partial` (정밀 경로) |
| 12 | 2 | `case01_evidence` | `notice` | `photo_video` |
| 13 | 2 | 결과 | 통지 재확인 action | 일정·사진 대조 action |

**PASS:** V4-A vs V4-B 단계 4·8·11~13에서 Profile·질문 id·result **서로 다름**. 단계 4에서 `case01_factRelationshipNote` text **기본 경로 0회**.

---

| # | 경로 | PASS 조건 (요약) |
|---|------|------------------|
| V1 | §5.2 V1 A/B | alibi vs partial — Phase2·result **관측 차이** |
| V2 | §5.2 V2 A/B | pay_core vs attend — scope 질문 **0** · authorityClaim 차이 |
| V3 | §5.2 V3 | `2026-11-15` persist·restore **유실 0** |
| V4 | §5.2 V4 A/B | gap slug 2종 — Profile·분기·result **차이** |

### 5.3 실질 축

- 전형 완료 경로: Phase1 **5**, Phase2 **8~9** (②~④) — **4:6 하한 PASS**  
- Phase2 **7 이하** 또는 1차≥2차 실질 밀도 → **FAIL**

### 5.4 선택지 판별력 스팟 (각 Phase1 핵심 질문 1회)

동일 질문에서 **2 choice만** 바꿔 다음 화면 질문 label set 또는 result 문장이 **달라야** PASS.

---

## 6. LOCK 절차

1. Ace가 본 Brief **검토·LOCK** (상태 → **LOCK**, §1 재오픈 금지)  
2. `VFBCAI_CASE01_FULL_ENHANCEMENT_STEP2-0_v1.md`와 **문구·DQ 동기화**  
3. IMPLEMENTER 착수 → VERIFIER → Ace 배포 판단  
4. (권장) Governance: QA PASS 후 Master Skill Verified Lessons — **별도 Mission**

---

## 7. 이전 Mission 관계

| 문서 | 상태 |
|------|------|
| `VFBCAI_CASE01_MINIMAL_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md` | **Superseded** — 구현·LOCK 선언 금지 |
| 이미 머지된 M01/M02 코드 | STEP2-1에서 **DQ-C01-E05**에 따라 revert/fallback |

---

*2026-09-25. STEP2-0 v0.1 승인 + DQ-C01-E01~E05·§1.1 반영. 2026-09-25 §2.2 label·§5 시나리오 LOCK — IMPLEMENTER 착수.*
