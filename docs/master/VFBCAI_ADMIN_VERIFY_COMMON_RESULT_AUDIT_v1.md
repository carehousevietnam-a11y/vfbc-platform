# VFBCAI Admin VERIFY — 공통 결과 파이프라인 통합 감사 v1.1

| 항목 | 내용 |
|------|------|
| **범위** | `/verify/admin` Master funnel · CASE_01~06 · 1차/2차 종합·개인화 결과 |
| **성격** | 감사·설계만. **코드 수정 지시 아님** (별도 Mission에서 구현) |
| **증거** | LEVEL 1 코드 추적 + LEVEL 3 브라우저 (CASE_04, 3번창 2026-09-25) · STEP2-1 spot QA (`case0x-step2-1-spot.mjs`, `case01-phase2-chain-count.mjs`, 2026-09-25 재실행) |
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (LOCK), `docs/VFBCAI_CONSTITUTION.md` §5·§16 |
| **입력** | 2번창 통합 감사, `VFBCAI_ADMIN_CASE0506_AUDIT_FINDINGS_HANDOFF_v2.md` (a27a5fc), CASE_01~06 LEVEL1 감사 문서, 3번창 CASE_04 수동 QA |

**주요 코드 경로**

- `src/lib/adminVerifyProfiling.ts` — 질문·Profile·persist·신호·CASE05/06 질문 체인
- `src/lib/adminVerifyCase06Redesign.ts` — CASE_06 v1.1 체인
- `src/components/cost-check/AdminVerifyFirstResultPanel.tsx` — 1차/개인화 결과·통합문·판단문·keyMetrics
- `src/components/cost-check/MasterReviewQuotationReport.tsx` — 퍼널·meta persist·결과 호출
- `src/app/verify/admin/page.tsx` — 진입·복원·Master 랜딩

---

## 1. 요약 — 공통 원인

**다출구 판단 조립 (One Profile, Many Narrators).** 동일 `answers`가 `buildCaseResolutionProfile` 한 번 거친 뒤, `buildCase0xIntegratedSituation` · `buildPhase1RiskSummary` / `buildCase01Phase1RiskSummary` · `buildPhase2RiskSummary` · `applyCase0xKeyMetrics` · `buildCase0xPrincipleFStateLines` · `appendCase0x*ResultSignals`로 **서로 다른 if/else**를 탄다. slug·라벨·text follow-up이 한 출구에서만 반영되면 다른 출구는 legacy slug·고정 문장·빈 middle을 남긴다. CASE_04 integrated `none` vs `not_started`, CASE_01 `no_contact_yet` vs `none`이 대표다.

**선택지 full label을 판단문에 삽입.** `buildPhase1RiskSummary`(generic)은 `profile.event.value`·`authorityClaim`·`customerAction` **전체 라벨**을 문장 괄호에 넣는다 (`AdminVerifyFirstResultPanel.tsx` ~3221–3232). CASE_01 전용 빌더는 event를 **고정 한 줄**, 대응은 `none`만 미대응으로 처리해 **반대·뭉개짐**이 난다 (~3168–3211). keyMetrics footnote와 §03 1차 확인이 **같은 라벨**을 반복한다 (CASE_04 LEVEL 3: 원문 반복 5건).

**응답 요약·첨부·DI 원문의 이중 게이트와 미렌더.** `buildCase0xPrincipleFStateLines`는 CASE별로 다른 필드만 whitelist하고, CASE_01은 **Phase2 complete**일 때만 노출 (~2745–2749). `buildAdminVerifyPersonalizedContext`의 `evidenceNote`(파일명)는 **context에만 설정**되고 personalized JSX에서 **렌더 0** (~3392, ~4500–4723). `other`+note는 Profile·footnote에는 들어가도 **「항목명: 원문」 전용 블록**이 없으면 화면에서 “없음”으로 체감된다 (CASE_04 supplementTarget LEVEL 3).

**Profile에 안 들어가는 Phase2 답.** CASE_05 `dispositionDetail`·`factDetail`·`explanationDetail`·`submittedDocsDetail`·`appealDetail`은 persist 키로만 존재하고 **Profile 칸 미갱신** (감사 18행). CASE_06 `case06_payment*` 등 체인 답은 persist되나 **Profile·통합문·principleF에 미연결**; caution/Phase2 요약 일부만 반영 (`appendCase06V11Phase2ResultSignals` ~351–386). 정보는 “답했는데 결과에 없다”로 보인다.

**비율·장식은 결과 문장 수정만으로 해결 불가.** LOCK 하한(실질 축 3:7~4:6)에서 CASE_05는 **4:6 경계**, CASE_06은 **signal_violation 1:1**·체인 **1:1/1:0** FAIL (handoff v2, CASE_06 감사 §3). 이는 **CASE별 질문 보강** 트랙이며, Layer J(문장 매핑)와 분리한다.

---

## 2. 데이터 흐름표 (CASE_01~06)

**공통 경로**

```
질문 UI answers
  → buildAdminVerifyAnswersPersistMeta (CASE0x_ANSWER_KEYS whitelist)
  → lead meta JSON
  → restoreAdminProfilingAnswersFromMeta
  → buildCaseResolutionProfile
  → buildAdminVerifyFirstResult / buildAdminVerifyPersonalizedContext
  → UI §01 integrated + principleF + §02 keyMetrics + §03 phase1/2 판단 + cautions
```

| CASE | answer 저장 | Profile | 복원 | Phase2 | 결과 문장 | 결과 카드 | 날짜·금액·장소·DI·파일명 손실 지점 |
|------|-------------|---------|------|--------|-----------|-----------|-----------------------------------|
| **01** | `CASE01_ANSWER_KEYS`, text: `case01_deadlineDate`, `case01_factDifferenceDetail`, `case01_datePlaceDetail`, `{field}Note` | `buildCaseResolutionProfile` ~9656+; event=violation 라벨; deadline=choice 라벨, **date text는 Phase2 후** | meta whitelist; note 키 누락 시 note 유실 | `appendCase01Phase2Questions` | integrated ~2867; Phase1 **전용** ~3168; generic 미사용 | `applyCase01KeyMetrics` ~1790 | **날짜:** 1차 결과 시 choice만 (~감사 CASE_01); **DI:** principleF에 일부만 (~3677); **파일명:** evidenceNote 미렌더; **장소:** `datePlaceDetail` principleF만, 판단문 고정 event |
| **02** | `CASE02_ANSWER_KEYS` | payment·deadline 라벨; DI authority parts | 동일 패턴 | case02 Phase2 | integrated ~2927; **generic** Phase1 ~3214 | **generic** `applyGenericClassifiedCaseKeyMetrics` ~1474 | 금액·납부 DI는 Profile 일부; **판단문**에 long label 삽입 |
| **03** | `CASE03_ANSWER_KEYS`, text deadline/출석 | CASE03 라벨 축 | 동일 | case03 Phase2 | integrated ~2960; generic Phase1 | `applyCase03KeyMetrics` ~1915 | **날짜 text** principleF (~3726); integrated에 text 반영; Phase2 summary slug `mismatch` 불일치 ~3308 |
| **04** | `CASE04_ANSWER_KEYS`, `case04_deadlineDate`, note keys | event=**initialSubmission**; authority=**supplementTarget**(+suffix) ~9799 | 동일 | case04 Phase2 | integrated ~2999 (**legacy slug**); generic Phase1 | `applyCase04KeyMetrics` ~2032 | **DI other:** principleF **없음** (~3704); **파일명:** evidenceNote 미렌더; **날짜:** integrated·principleF에 text; **대응:** integrated middle **null** (`not_started`≠`none`) |
| **05** | `CASE05_ANSWER_KEYS`, `case05_deadlineDate`(리메디) | detail 5필드 **미반영**; deadline 라벨 | `case05EffectiveDeadline` legacy | case05 Phase2 13 후보 | integrated ~3034; cautions 다수 | `applyCase05KeyMetrics` ~2153 | **날짜:** specific_date+text는 설계·일부 UI; **detail 5:** 결과·Profile 단절; **DI:** suffix 경로만 principleF |
| **06** | `CASE06_V11_PERSIST` + redesign 체인 keys | v1.1: `requiredActionCandidate` 등; **payment\*** 체인 Profile 미매핑 | legacy `profileAuthorityGuidance` | `appendCase06RedesignPhase2` 체인 | integrated ~3076; generic Phase1; chain signals ~351 | principleF ~451; payment는 **caution만** | **날짜·금액·장소·발효:** slug만 (`deadline_*_by_date`, `exact_amount_known` 등); text 키 리메디 설계; **브릿지:** 타겟 CASE 시드 없음 |

**공통 손실 패턴**

| 패턴 | 손실 내용 | 대표 |
|------|-----------|------|
| specific_date류 | 날짜·금액·장소 “안다” slug without text | 05 deadline, 06 deadline pair / payment |
| whitelist gap | `{fieldId}Note` persist 누락 | 전 CASE `other` |
| 미렌더 | `evidenceNote`, `personalized.evidenceNote` | 전 CASE 첨부 파일명 |
| 다출구 불일치 | A출구에만 반영 | 04 integrated vs Profile vs Phase1 |
| Profile 단절 | Phase2 choice만 저장 | 05 detail 5, 06 payment chain |

---

## 3. 코드 구조

### 3.1 공통 함수 (CASE 공유)

| 함수 | 파일 | 대략 줄 | 역할 |
|------|------|---------|------|
| `buildCaseResolutionProfile` | `adminVerifyProfiling.ts` | ~9656 | Situation Profile 단일 소스 |
| `buildAdminVerifyAnswersPersistMeta` | `adminVerifyProfiling.ts` | ~11395 | meta whitelist persist |
| `restoreAdminProfilingAnswersFromMeta` | `adminVerifyProfiling.ts` | ~11448 | 복원 |
| `buildAdminVerifyFirstResult` | `AdminVerifyFirstResultPanel.tsx` | ~2379 | 1차·개인화 공통 데이터 |
| `buildAdminVerifyPersonalizedContext` | `AdminVerifyFirstResultPanel.tsx` | ~3379 | integrated + phase1/2 + evidenceNote |
| `buildIntegratedSituationFromProfile` | `AdminVerifyFirstResultPanel.tsx` | ~3133 | CASE switch → integrated |
| `buildPhase1RiskSummary` | `AdminVerifyFirstResultPanel.tsx` | ~3214 | CASE_01 위임, 그 외 generic |
| `buildPhase2RiskSummary` | `AdminVerifyFirstResultPanel.tsx` | ~3248 | CASE별 분기 + generic fallback |
| `getAdminChoiceNoteKey` | `adminVerifyProfiling.ts` | (공통) | `other` note 키 |
| `MasterReviewQuotationReport` persist | `MasterReviewQuotationReport.tsx` | ~787, ~4215–4219 | meta + 결과 빌드 |

### 3.2 CASE별 전용 함수

| CASE | integrated | Phase1 판단 | keyMetrics | principleF / 응답 요약 | result signals |
|------|------------|-------------|------------|-------------------------|----------------|
| 01 | `buildCase01IntegratedSituation` ~2867 | `buildCase01Phase1RiskSummary` ~3168 | `applyCase01*` ~1790–1760 | `buildCase01PrincipleFStateLines` ~3677 (profiling) | `appendCase01Phase1/2*` |
| 02 | `buildCase02IntegratedSituation` ~2927 | generic | `applyGenericClassifiedCaseKeyMetrics` | (없음) | case02 cautions |
| 03 | `buildCase03IntegratedSituation` ~2960 | generic | `applyCase03KeyMetrics` ~1915 | `buildCase03PrincipleFStateLines` ~3726 | appendCase03* |
| 04 | `buildCase04IntegratedSituation` ~2999 | generic | `applyCase04KeyMetrics` ~2032 | `buildCase04PrincipleFStateLines` ~3704 | appendCase04* |
| 05 | `buildCase05IntegratedSituation` ~3034 | generic | `applyCase05KeyMetrics` ~2153 | `buildCase05PrincipleFStateLines` ~3717 | appendCase05* |
| 06 | `buildCase06IntegratedSituation` ~3076 | generic | generic / case06 titles | `buildCase06PrincipleFStateLines` ~451 (redesign) | `appendCase06V11Phase2*` ~351 |

### 3.3 중복·분산 (리팩터 후보 — 이번 Mission 아님)

| 패턴 | 위치 | 비고 |
|------|------|------|
| integrated 6종 | `AdminVerifyFirstResultPanel.tsx` ~2867–3131 | slug 분기 각각 복사 |
| principleF 5종 + CASE06 redesign | profiling ~3677–3744, case06Redesign ~451 | 게이트 조건 불일치 |
| keyMetrics apply 01/03/04/05 + generic 02/06 | ~1790–2153, ~1474 | footnote에 동일 라벨 |
| Phase1/2 risk | ~3168–3376 | CASE_01만 전용, 04 slug 오류 공유 |
| legacy slug maps | `CASE05_DEADLINE_LEGACY_TO_CANONICAL` ~5896; CASE04 integrated legacy values | canonical vs UI 불일치 |
| 날짜 text needs | `case0xNeedsDeadlineDateDetail` 분산 | CASE_01/04/05/06 각각 |

---

## 4. 문제 매트릭스

**LEVEL:** `L1` = 코드 확인 · `L3` = 화면 확인 (3번창)

| ID | CASE | 유형 | 요약 | LEVEL |
|----|------|------|------|-------|
| C01-01 | 01 | 반대 의미 | `no_contact_yet` → Phase1 「일부 대응」 (`none`만 미대응) | L1 |
| C01-02 | 01 | 고정 문장 | Phase1 event 항상 「날짜·장소·행동 쟁점」 | L1 |
| C01-03 | 01 | 뭉개짐 | authority `pay_core_traffic` 등 → 「방향 확인」; responseDetail → 「일부 대응」 | L1 |
| C01-04 | 01 | 조용한 누락 | deadline `no_deadline_stated`·`uncertain`·`other` 등 Phase1 문장 없음 | L1 |
| C01-05 | 01 | slug 불일치 | integrated `none` vs `no_contact_yet` / `has_responded` | L1 |
| C01-06 | 01 | 조용한 누락 | principleF Phase2 complete 게이트 (~2745) | L1 |
| C01-07 | 01 | 원문 반복 | 라벨 ↔ metrics ↔ Phase1 risk | L1 |
| C02-01 | 02 | 문장 깨짐 | generic Phase1 long label 삽입 | L1 |
| C02-02 | 02 | 장식 카드 | generic 4카드 「공증 및 영사」 (~2657) | L1 |
| C03-01 | 03 | slug 불일치 | Phase2 `mismatch` vs 실제 slug | L1 |
| C03-02 | 03 | 조용한 누락 | integrated `inquired` 등 middle null | L1 |
| C04-01 | 04 | slug 불일치 | integrated `none`/`partial_submitted` vs `not_started`/`submitted` | L1·**L3** |
| C04-02 | 04 | 값 누락 | supplementTarget `other` 원문 — principleF·전용 라인 없음 | L1·**L3** |
| C04-03 | 04 | 값 누락 | evidenceNote / 파일명 미렌더 | L1·**L3** |
| C04-04 | 04 | 문장 깨짐 | integrated 기한·generic Phase1 4패턴 | L1·**L3** |
| C04-05 | 04 | 원문 반복 | 카드 01·02 ↔ §03 1차 (5건) | **L3** |
| C04-06 | 04 | slug 불일치 | Phase2 `partial`/`mismatch` vs `mismatch_request` | L1 |
| C05-01 | 05 | 값 누락 | detail 5필드 Profile 단절 | L1 |
| C05-02 | 05 | 뭉개짐 | disposition_unclear vs other 동일 문장 | L1 |
| C05-03 | 05 | 조용한 누락 | `inquired` 전용 result 없음 | L1 |
| C05-04 | 05 | 장식 | deadline 4값 동일 신호·문장 | L1 |
| C05-05 | 05 | slug 불일치 | `CASE05_DEADLINE_LEGACY_TO_CANONICAL` | L1 |
| C05-06 | 05 | 원문 반복 | metrics vs integrated vs cautions | L1 |
| C06-01 | 06 | 값 누락 | payment\* 체인 → Profile·통합 단절 | L1 |
| C06-02 | 06 | specific_date류 | deadline pair·amount·attendance·effective slug only | L1 |
| C06-03 | 06 | slug 불일치 | legacy `profileAuthorityGuidance=specific_date` | L1 |
| C06-04 | 06 | 미사용 필드 | legacy 5필드 재분류 맵 외 | L1 |
| C06-05 | 06 | 문장 깨짐 | generic Phase1; integrated profile 삽입 | L1 |
| COM-01 | 전체 | 값 누락 | `evidenceNote` 설정만, UI 0 | L1·L3 |
| COM-02 | 전체 | 문장 깨짐 | `buildPhase1RiskSummary` label-in-slot | L1 |
| COM-03 | 전체 | 추측 분기 | manifest 없는 if/else 판단 | L1 |
| COM-04 | 전체 | 조용한 누락 | `{field}Note` persist whitelist gap | L1 |
| H04-X-1 | 04·전체 | (백로그) | 재진입 시 진행 초기화 — §9 | L3 |

---

## 5. 공통 수정안 (Layer A~J)

각 Layer는 **처음 읽는 사람용 정의** + **해결하는 문제 ID**.

### Layer A — `buildAdminResponseSummaryBlock(answers)`

**정의:** Phase1/2·CASE 무관 §01 하단 「응답 요약」 단일 블록.

| 계층 | 규칙 |
|------|------|
| **응답 요약 본문** | **직접 입력(DI)·note 원문** + **첨부 파일명**만. 선택지 full label은 **넣지 않음** |
| **선택지 표시** | 해당 keyMetrics 카드 **footnote에 1회**, 짧은 요약 라벨만 (Layer B와 동일) |
| **형식** | DI·note: `항목명: 원문` (Layer J2). 파일명은 Layer H와 동일 문장 (`첨부 자료: 파일명`) |

**해결:** C01-06, C04-02, C04-03, COM-01, C05-01(부분), C06-01(부분).

### Layer B — Judgment vs Display 분리

**정의:** keyMetrics·카드는 **짧은 footnote**; §01·§03 판단문은 **요약 clause**만. 동일 full label을 두 계층에 넣지 않음.

**해결:** C01-07, C04-05, C04-04, C05-06, COM-02.

### Layer C — `formatJudgmentClause` / narrative slots

**정의:** 판단문은 enum slot(미대응/기한확인/…) + manifest; **명사 자리에 choice label 전문 금지**.

**해결:** C01-02~04, COM-02, C04-04, C06-05.

### Layer D — CASE metric label map

**정의:** 01~06 전용 카드 제목·라벨 manifest; CASE_02 generic 「공증 및 영사」 제거.

**해결:** C02-02.

### Layer E — Persist·note completeness

**정의:** `getAdminChoiceNoteKey` 대응 키를 `CASE0x_ANSWER_KEYS`·meta whitelist에 **자동 동기** 검증.

**해결:** COM-04, C04-02, C01-06.

### Layer F — Profile field manifest (CASE_05 detail 등)

**정의:** Phase2 substantive 필드 → Profile 축 매핑 테이블; detail 5 → `authorityReason` 보조 등 **명시 칸**.

**해결:** C05-01 (질문 보강과 병행).

### Layer G — Integrated situation slug registry

**정의:** integrated builder는 **options catalog slug만** 참조; legacy alias는 `effective*()` 한 곳.

**해결:** C01-05, C04-01, C04-06, C05-05.

### Layer H — `evidenceNote` / attachment UI

**정의:** `buildAdminVerifyPersonalizedContext`의 `evidenceNote`(파일명)를 **Layer A 응답 요약 안**에 반드시 포함. 형식: `첨부 자료: {파일명}` (별도 고아 블록·context-only 금지).

**해결:** COM-01, C04-03.

### Layer I — Phase2 risk slug alignment

**정의:** `buildPhase2RiskSummary` 분기를 `CASE0x_OPTION_LABELS` 키와 CI coverage로 동기.

**해결:** C03-01, C04-06.

### Layer J — Judgment Clause Manifest (판단 문장 매핑)

| 규칙 | 내용 |
|------|------|
| **J1** | 판단에 쓰는 field마다 **모든 slug**에 clause; 뭉뚱 fallback 금지 |
| **J2** | 미매핑·`other` → `항목명: 라벨 또는 note 원문` |
| **J3** | event/authority/customer/deadline 축은 slug 의미 반영 (고정 boilerplate 금지) |
| **J4** | 응답 요약 = **값 존재** 시 표시; Phase2 complete 게이트 아님 |

**해결:** C01-01~04, C04-04, COM-02, COM-03, C05-02~03.

### 5.1 공통으로 한 번 고칠 것

- Layer A + J2/J4 (응답 요약·DI 표시)
- **판단 문장 목록은 코드 반영 전 대표 검토** — CASE별 slug→clause manifest 초안을 Ace·검토자가 먼저 합의한 뒤 IMPLEMENTER가 `buildPhase1RiskSummary` / `buildCase01Phase1RiskSummary`에 반영 (코드 선반영 금지)
- Layer J manifest + `buildPhase1RiskSummary` / `buildCase01Phase1RiskSummary` 통합
- Layer G integrated slug registry (6 CASE)
- Layer H evidenceNote
- Layer E note persist

### 5.2 CASE별 예외로 남길 것

| CASE | 예외 | 이유 |
|------|------|------|
| 01 | violation·교통국 도메인 copy | CASE anchor; manifest **문구**만 CASE_01 테이블 |
| 02 | 납부·금액 축 naming | CASE_02 MASTER LOCK; generic 카드만 공통화 |
| 03 | 출석·소명 text 3키 principleF | 이미 패턴 확정; A블록에 **키 목록**만 등록 |
| 04 | `case04SupplementDetailSuffix` 3갈래 | target별 detail 질문 구조 유지 |
| 05 | disposition 신호 `deriveDispositionSignals` | 도메인 신호 코드; 문장은 J manifest로 |
| 06 | v1.1 체인 5종 + redesign 파일 분리 | `adminVerifyCase06Redesign.ts` 유지; **결과 연동**만 공통 레이어 |

### 5.3 커밋 `8f9ea08` (CASE_01 personalized) 처리 방향

**판정: 흡수 + 수정 (폐기 아님).**

- **흡수:** CASE_01 전용 keyMetrics title·Phase2 metrics·cautions 패턴 → Layer D·B의 **CASE_01 manifest 행**으로 이전.
- **수정:** per-CASE if/else 복제 **금지**; `buildCase01PrincipleFStateLines`·`buildCase01Phase1RiskSummary`를 Layer J·A의 **첫 번째 구현 인스턴스**로 리팩터.
- **폐기하지 않음:** 8f9ea08의 **제품 문구·축 이름**은 MASTER/LOCK과 충돌 없으면 유지.

---

## 6. 비율 (LOCK — 실질 축, 장식 제외)

**산정 규칙 (v1.1)**

- **실질 축:** `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` ②~④ + CASE별 LEVEL1 감사 (`VFBCAI_CASE0x_INFORMATION_COMPLETENESS_AUDIT_v1.md`).
- **CASE_03~05 Phase2:** 코드 `CASE0x_PHASE2_SUBSTANTIVE_AXIS_IDS` + `case0xListPhase2SubstantiveAxesOnPath(answers)` (STEP2-1). **R3:** `case0x_deadlineDate` 등 text follow-up은 **별도 축으로 세지 않음** (날짜는 `deadline` 축 밀도).
- **CASE_01 Phase2:** `buildCase01Phase2RenderedChainAudit`의 **고유 `informationAxis`** 중 LOCK 장식 질문 축 제외 (§6.2·부록).
- **CASE_01 Phase1:** `violationContent` · `factRelationship` · (`case01_factCompareGap` — `cannot_compare_yet` 경로만) · `customerResponded` · `deadline` · `confirmGoal`. `case01_deadlineDate`는 R3 동형(축 미포함).
- **CASE_02 Phase1:** 감사 정의 **5** (`paymentInfoSource` 제외). 코드 `CASE02_PHASE1_FIELD_ORDER`는 6필드 — 비율 표는 **감사 실질 5** 기준.
- **CASE_06 v1.1:** `VFBCAI_CASE06_INFORMATION_COMPLETENESS_AUDIT_v1.md` §3 — 1차 실질 **1** (`case06_requiredActionCandidate`만), 2차는 결과·다음 질문을 갈라는 필드만.

**하한 (4:6):** P2 ≥ ⌈N×6/4⌉ · **부족:** max(0, ⌈N×6/4⌉ − M)  
**하한 (3:7):** P2 ≥ ⌈N×7/3⌉ · **부족:** max(0, ⌈N×7/3⌉ − M)

### 6.1 경로별 실측표

#### CASE_01

| 경로 ID | 조건 요약 | P1 | P2 | 4:6 최소 | 4:6 부족 | 3:7 최소 | 3:7 부족 |
|---------|-----------|----|----|----------|----------|----------|----------|
| C01-P1-typical | `FULL_CHAIN` / `fullChainResponded` — 대응함·날짜장소 불일치·납부 demand | 5 | 6 | 8 | 2 | 12 | 6 |
| C01-P1-gap | `fullChainGapUnclear` / `V4-B` — `cannot_compare_yet` + `case01_factCompareGap` | 6 | 6 | 9 | 3 | 14 | 8 |
| C01-P1-brief | `briefV1A` — 미대응·출석 demand·Phase2 4스텝 | 5 | 4 | 8 | 4 | 12 | 8 |

P2 **6** (C01-P1-typical): `authorityDemand` · `actualSituation` · `responseDetail` · `authorityResponse` · `evidence` · `blockage` (장식 4문항·scope·note text 제외).  
P2 **렌더 스텝 10** (`phase2WalkCount`): 장식·text 질문 포함 화면 walk — **LOCK 실질 축과 다름** (§6.3).

#### CASE_02 (LEVEL1 감사 경로명)

| 경로 ID | 조건 요약 | P1 | P2 | 4:6 최소 | 4:6 부족 | 3:7 최소 | 3:7 부족 |
|---------|-----------|----|----|----------|----------|----------|----------|
| C02-paid-short | `paymentStatus=paid` · match · basis·demandAuthority 스킵 | 5 | 5 | 8 | 3 | 12 | 7 |
| C02-unpaid-mid | 미납 · match · `paymentBasis` 포함 | 5 | 6 | 8 | 2 | 12 | 6 |
| C02-unpaid-full | 미납 · mismatch · basis · `authorityResponse` · evidence · `finalGoal`(조건부) | 5 | 7 | 8 | 1 | 12 | 5 |

`paymentStatus=paid` vs `unpaid`는 Phase2 체인 on/off — **실질 축** 기준 (화면 필드 수 6 ≠ 실질 5).

#### CASE_03

| 경로 ID | 조건 요약 | P1 | P2 | 4:6 최소 | 4:6 부족 | 3:7 최소 | 3:7 부족 |
|---------|-----------|----|----|----------|----------|----------|----------|
| C03-attendance-tail | spot: 출석·`specific_date`+text · Phase2 tail 완료 (`case03-step2-1-spot`) | 5 | 8 | 8 | 0 | 12 | 4 |

카탈로그 실질 축 상한: **9** (`case03Phase2SubstantiveAxisCatalogCount()`). `case03_prepRequired` on-path 최대 **9** — spot 외 경로는 `case03ListPhase2SubstantiveAxesOnPath`로 Mission 전 재실측.

#### CASE_04

| 경로 ID | 조건 요약 | P1 | P2 | 4:6 최소 | 4:6 부족 | 3:7 최소 | 3:7 부족 |
|---------|-----------|----|----|----------|----------|----------|----------|
| C04-add-spot | `additional_docs` · 미시작 · spot tail (`authorityFollowUp` **없음**) | 4 | 8 | 6 | 0 | 10 | 2 |
| C04-add-followup | 동일 + `case04_authorityFollowUp` 답변 | 4 | 9 | 6 | 0 | 10 | 1 |
| C04-modify-tail | `supplementTarget=modify_existing` · `case04_modifyDetail` on-path | 4 | 8 | 6 | 0 | 10 | 2 |
| C04-evidence-tail | `supplementTarget=add_content_evidence` · `case04_evidenceDetail` on-path | 4 | 8 | 6 | 0 | 10 | 2 |

카탈로그 실질 축 상한: **11** (`case04Phase2SubstantiveAxisCatalogCount()`, STEP2-1). (구 LEVEL1 감사 **4:5** 표는 STEP2-1 이전 장식 분류 — §6.3.)

#### CASE_05

| 경로 ID | 조건 요약 | P1 | P2 | 4:6 최소 | 4:6 부족 | 3:7 최소 | 3:7 부족 |
|---------|-----------|----|----|----------|----------|----------|----------|
| C05-none-tail | `customerResponse=none` · spot tail (`case05-step2-1-spot`) | 4 | 8 | 6 | 0 | 10 | 2 |
| C05-explanation | `explanation_submitted` · spot `explanationAxisCount` | 4 | 9 | 6 | 0 | 10 | 1 |

카탈로그 실질 축 상한: **14** (`case05Phase2SubstantiveAxisCatalogCount()`, detail 5 실질화 포함).

#### CASE_06 (v1.1 redesign, legacy 제외)

| 경로 ID | 체인 | P1 | P2 | 4:6 최소 | 4:6 부족 | 3:7 최소 | 3:7 부족 |
|---------|------|----|----|----------|----------|----------|----------|
| C06-pay | 납부 | 1 | 1 | 2 | 1 | 3 | 2 |
| C06-attend | 출석 | 1 | 1 | 2 | 1 | 3 | 2 |
| C06-submit | 보완 | 1 | 1 | 2 | 1 | 3 | 2 |
| C06-disposition | 처분 | 1 | 0 | 2 | 2 | 3 | 3 |
| C06-unclear-sv | 불명확 + `signal_violation` (현행 조기 STOP) | 1 | 1 | 2 | 1 | 3 | 2 |
| C06-unclear-r05 | 불명확 + R05 적용 후 (`unclearFactRelation`+`unclearResponse`) | 1 | 3 | 2 | 0 | 3 | 0 |

P2 **1** (납부·출석·보완): 감사 §3 — `paymentResponse` / `attendanceResponse` / `submissionResponse` / `unclearContentRecheck`만 결과·분기 실질. 나머지 체인 문항은 장식(부록).

표의 **「CASE별 질문 보강」**은 Layer A~J 범위 밖 — `VFBCAI_CASE05/06_PHASE2_REMEDIATION_STEP2-0_v1.md` · STEP2-1 Mission.

### 6.2 장식으로 제외한 질문 (대표)

| CASE | 질문·선택 (대표) | 장식 판정 이유 |
|------|------------------|----------------|
| **01** | `case01_factDifferenceDetail`, `case01_datePlaceDetail` | text 수집 후 Profile·결과 분기 없음 (CASE_01 감사 §2.4) |
| **01** | `case01_paymentDemandScope`, `case01_supplementDemandScope` | `core_case` 재분류 1값만 실질, 그 외 downstream 동일 |
| **01** | `case01_authorityDemandDetail`, `case01_blockage` 값, `case01_evidence` 종류 | needs*·결과 문장 미분화 |
| **01** | deadline `uncertain`/`no_stated`/`unknown` 묶음 | 동일 신호·문장 |
| **02** | `case02_paymentInfoSource` | FOCUS만, Profile·Phase2·결과 분기 없음 |
| **02** | `case02_blockage`, evidence 종류, deadline 미확인 묶음 | 결과 동일 unconfirmed |
| **03** | (STEP2-1 이전) `prepRequired` 등 일부 | R4에서 실질화된 축은 표에서 **제외** — 카탈로그에 포함 |
| **04** | (STEP2-1 이전 감사) `blockage`·`evidence`·`finalGoal` 등 7문항 | 구 감사 장식; **현행 코드**는 `CASE04_PHASE2_SUBSTANTIVE_AXIS_IDS` 11축에 포함 |
| **05** | `dispositionDetail`·`factDetail`·`explanationDetail`·`submittedDocsDetail`·`appealDetail` (STEP2-1 **전**) | persist만; STEP2-1 후 카탈로그 **실질 축**으로 승격 |
| **05** | `dispositionReason` 4값 묶음 (`violation_claimed`~`deadline_procedure`) | 라벨만 상이 |
| **06** | `knowledgeSource`, `sourceChannel`, `deadlineActionPair`, `customerResponse` | 체인·결과·타겟 필드 분기 없음 (감사 §3) |
| **06** | 납부 체인 `paymentNature`~`paymentAuthorityCheck`, 처분 4문항 | 동일 — `paymentResponse` 등 1필드만 실질 |

### 6.3 3번창 실측과의 차이 (CASE_01 · CASE_04)

| 3번창 (보고) | v1.1 코드·LOCK 재측정 | 차이 이유 |
|--------------|----------------------|-----------|
| CASE_01 **1차 6** | **5** (typical) 또는 **6** (`factCompareGap` 경로) | 3번창이 **`cannot_compare_yet`+gap** 또는 **진입 Q1·문서종류를 1차 실질에 합산**한 경우 6이 됨. `FULL_CHAIN` rich(날짜·장소 불일치)만이면 LOCK **5** |
| CASE_01 **2차 10** | **6** (실질) / **10** (렌더 walk) | 10 = `fullChainResponded.phase2WalkCount` (장식 text·scope·note 포함). LOCK 비율은 **6** |
| CASE_04 **1차 6** | **4** | 3번창이 **4 Phase1 + `specific_date` + `deadlineDate` 텍스트** 또는 **Q1·문서종류**를 각각 축으로 센 경우. STEP2-1 R3는 날짜 text **축 제외** |
| CASE_04 **2차 9** | **8** (spot) / **9** (`authorityFollowUp` 포함) | spot fixture는 follow-up 미답 **8**; L3 전체 tail에 기관 후속 1축 추가 시 **9** — 3번창과 일치 가능 |

### 6.4 CASE_06 — 1차 실질 1개인 이유와 설계 의견

**이유 (LOCK):** v1.1 Phase1 5문항 중 **`case06_requiredActionCandidate`만**이 Phase2 체인 선택·결과 narrative를 바꾼다. `knowledgeSource` · `sourceChannel` · `deadlineActionPair` · `customerResponse`는 완료 게이트·라벨만 채우고 Profile·`AdminVerifyFirstResultPanel` 분기·타겟 시드에 연결되지 않는다 (`VFBCAI_CASE06_INFORMATION_COMPLETENESS_AUDIT_v1.md` §3).

**질문 추가만으로 충분한가?**  
- **부분적으로 예.** R05(`signal_violation` 두 질문)·STEP2-1 text 키·detail 실질화는 **같은 1차 골격** 안에서 2차 깊이를 올린다.  
- **전면 재설계는 아님.** 1차를 5→N으로 늘리기만 하면 장식 필드가 더 생길 위험이 있다. 우선순위는 (1) 체인 답→Profile·integrated·principleF 연동, (2) 장식 4필드를 **실질화하거나 축으로 합치기**, (3) `requiredActionCandidate` 외 1차 축을 늘리는 것은 **브릿지·재분류 정책**과 함께 Ace 승인 후.

**판정:** 현행 **1:0~1:1 FAIL**은 질문 **개수**가 아니라 **실질 축 정의** 문제. Mission은 `CASE06_PHASE2_REMEDIATION` + 결과 Layer F·연동이 선행; 1차 질문 수만 늘리는 것으로 LOCK PASS 기대 **금지**.

---

## 7. 재발방지 규칙 초안

| # | 문제 | 근본 원인 | 잘못된 패턴 | 올바른 패턴 | 규칙 |
|---|------|-----------|-------------|-------------|------|
| R1 | 반대·뭉개 판단문 | Phase1 builder가 legacy slug·else fallback | `if (none)` 하나만 미대응 | `effectiveCustomerResponded` Set = 질문 `impliesAction`과 동일 | J1 + polarity CI |
| R2 | integrated middle 빈칸 | integrated가 catalog 갱신 안 됨 | `none`/`resubmitted` 하드코드 | integrated는 **options JSON만** | G + PR checklist |
| R3 | 원문 반복 | label을 footnote·판단에 동시 삽입 | `profile.x.value` in sentence | 카드=footnote; 판단=clause | B + C |
| R4 | DI·파일 안 보임 | 별도 게이트·미렌더 | principleF only Phase2 | A: any input → 요약 블록; H: file name | J4 + H |
| R5 | Phase2 답 증발 | Profile map 누락 | persist만 추가 | F: field→Profile manifest | STEP2 Mission gate |
| R6 | slug drift | legacy map 분산 | integrated≠Phase2≠UI | single `effectiveSlug()` | G + I tests |
| R7 | 비율 FAIL | 장식 Phase2 | 개수만 늘림 | 실질 축·결과 연동 후 카운트 | LOCK 감사 기준 ②~④ |

---

## 8. 수정 순서 제안 (1번창 단일 작성자)

| 순서 | 커밋 묶음 | 내용 | Layer / ID |
|------|-----------|------|------------|
| 1 | `admin-verify: judgment manifest scaffold + J2 formatter` | manifest 타입·`formatJudgmentClause`·CI slug coverage 스켈레톤 | J, COM-03 |
| 2 | `admin-verify: response summary block + note persist` | Layer A, E, J4; principleF 게이트 제거 | COM-01, C01-06, C04-02 |
| 3 | `admin-verify: phase1 risk + case01 dedicated merge` | `buildCase01Phase1RiskSummary` → manifest; generic 동일 | C01-01~04, COM-02 |
| 4 | `admin-verify: integrated slug registry CASE_01-06` | G; CASE_04 L3 middle | C04-01, C01-05 |
| 5 | `admin-verify: evidenceNote UI + phase2 slug align` | H, I | C04-03, C03-01, C04-06 |
| 6 | `admin-verify: keyMetrics label map CASE_02-06` | D, B footnote shorten | C02-02, C04-05 |
| 7 | (별도 Mission) `case05 profile detail + ratio R06` | F + 질문 보강 | C05-01, C05-06 |
| 8 | (별도 Mission) `case06 chain→result + ratio R05` | redesign 연동 | C06-01~05 |

**권장 커밋 수:** 공통 결과 **6개** + CASE_05 **1~2** + CASE_06 **1~2** (Brief 승인 후).

---

## 9. 범위 밖 (백로그)

### H04-X-1 — 재진입 시 진행 초기화

| 항목 | 내용 |
|------|------|
| **현상** | `/verify/admin?start=check` 재진입 시 Q1부터 (3번창 L3) |
| **코드** | `SHOW_LEGACY_VERIFY_FUNNEL=false` → `start=check` **no-op** (`page.tsx` ~83, ~897). 진행 답은 React state; full load 시 `?restore=1` 또는 lead meta 복원 없으면 초기화 |
| **헌법** | §5-C: Landing 생략·신규 시작·자동 복원 없음 — **Master Admin에 C 미구현**과 정책·체감 충돌 |
| **이번 수정** | **제외** — Layer A~J·질문 보강과 무관 |
| **백로그** | mid-funnel persist 정책·`start=check` Master 구현·헌법 §5 정합 |

---

## 부록 — QA·증거

- 수동: `VFBCAI_ADMIN_VERIFY_CASE01-06_MANUAL_QA_SCENARIOS_v1.md`
- CASE_05/06 handoff: `VFBCAI_ADMIN_CASE0506_AUDIT_FINDINGS_HANDOFF_v2.md`
- Polarity QA (제안): slug→`NO_ACTION`/`ACTION_*` 금지 패턴; manifest coverage per CASE

---

*2026-09-25. 2번창 통합 감사 v1.1 (v1 승인 + Layer A/H·§6 경로별 재측정). 문서만; 구현은 Ace Mission 승인 후.*
