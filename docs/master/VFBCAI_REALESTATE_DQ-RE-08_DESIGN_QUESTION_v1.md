# DQ-RE-08 — Real Estate VERIFY 1차 결과 화면 문구 (DESIGN QUESTION)

| 항목 | 내용 |
|------|------|
| **상태** | Ace **결정 대기** (옵션·권장안만 정리). **코드 미구현** |
| **선행** | `VFBCAI_REALESTATE_STEP2-0_DESIGN_MAPPING_v1.md` §3 **DQ-RE-03**이 STEP2-1에 반영된 **이후** 검토 (STEP2-0 §10.4) |
| **범위** | 1차 ONE RESULT의 **`actions`** — `realEstateVerifyFirstResult.ts` `buildActions` (**121–147**) |
| **범위 밖 (본 DQ에서 다루지 않음)** | §3의 `buildSituationSummary` / `keyMetrics` / `buildUnconfirmed` 라벨 — STEP2-1에서 이미 처리 예정. `statusHeadline`·`gradeLabel`·`stageLabel` 전면 개편 |

---

## 1. 배경

### 1.1 STEP2-0에서의 위치

- **DQ-RE-03:** 저장 키 `re_goal` 유지. **표시 라벨**만 경로별 분리 — 사전·서류·UNCLEAR(잠정) → **「확인 목적」**, 사후 `POST_DISPUTE` → **「대응 단계」**.
- **DQ-RE-03 §3.2:** Phase2 이후 Situation Profile의 `actions` / `responses`는 `re2_formalResponse`·`re2_authorityStage`만 (사후 `re_goal` 복사 금지). 이는 **profiling** 객체이며, 1차 결과 패널의 **`AdminVerifyFirstResultData.actions`** 와는 **별 레이어**.
- **DQ-RE-08:** 1차 화면의 **`buildActions` 고정 3문장**은 DQ-RE-03 라벨 반영 **후** 문구를 다시 맞출지 결정. **STEP2-1에서는 `buildActions` 목록을 바꾸지 않음** (STEP2-0 §3, §8).

### 1.2 현재 제품 동작 (조사 스냅샷)

파일: `src/lib/realEstateVerifyFirstResult.ts`

| 함수 | 줄 | 동작 |
|------|-----|------|
| `buildSituationSummary` | **59** | `profile.goal` 있으면 항상 `확인 목적: …` (STEP2-1에서 경로별 라벨로 변경 예정) |
| `buildUnconfirmed` | **114** | goal unknown 시 `확인 목적` 고정 |
| `buildActions` | **121–147** | **경로 4분기만** 사용. `answers` / `re_goal` slug **미참조** |
| `buildRealEstateFirstResult` | **188** | `actions: buildActions(path)` |

**경로별 고정 3문장 (현행):**

| `RealEstateResolutionPath` | actions[0..2] 요지 |
|----------------------------|---------------------|
| `PRE_CONTRACT` | 계약 조항 확인 · 보증금·중도금 대조 · 서명·공증·등기 |
| `POST_DISPUTE` | 분쟁 경과 정리 · 증빙 보관 · 공식 대응 전 상대 안내 확인 |
| `DOCUMENT_REVIEW` | 원본·번역 비교 · 누락 조항·금액·당사자 · 기한·인도 조건 |
| fallback (`UNCLEAR` 등) | 시간순 정리 · 서류 모음 · 어떤 검토가 필요한지 재확인 |

UI 소비: `MasterReviewQuotationReport.tsx` → `buildRealEstateFirstResult` → `AdminVerifyFirstResultPanel` (제목 예: 「부동산 문서 1차 종합 결과」).

### 1.3 정합성 갭 (STEP2-1 이후 체감될 불일치)

1. **라벨 vs 행동:** 사후 경로에서 요약·메트릭은 **「대응 단계」**인데, `buildActions`는 여전히 일반적인 **분쟁 대응 3문장** — 고객이 고른 `re_goal`(예: `preparing_objection`, `authority_filed`)과 **연결되지 않음**.
2. **Admin Master 패턴 차이:** 행정 VERIFY 1차는 `appendCase*Phase1ResultSignals`로 **답변 기반 actions**를 쌓음. RE는 **경로 템플릿만** — Master handoff 원칙 B(답변→프로파일→분기)와 **표현 밀도**가 다름.
3. **FREE 1차 목적:** 과도한 개인화는 2차( PAID )와 역할 겹칠 수 있음. 고정 3문장은 **안정·예측 가능**하나 DQ-RE-03 이후 **용어·목표 축**이 어긋날 수 있음.

---

## 2. DESIGN QUESTION (Ace 결정용)

**「부동산 VERIFY 1차 결과의 `actions` 3줄을, STEP2-1 이후 어떤 정책으로 유지·개선할까?」**

결정 시 함께 고정할 것:

- `re_goal` slug / `profile.goal.value`를 **actions에 반영할지** (얼마나 깊게).
- `POST_DISPUTE`에서 **「대응 단계」** 용어를 actions 문장에 **명시할지** (요약·메트릭과 톤 통일).
- `UNCLEAR`(브릿지 전) fallback 3문장을 **그대로 두지**, 브릿지·fact lock 이후와 **분리할지**.

---

## 3. 옵션

### 옵션 A — 경로별 고정 3문장 **유지** (현 구조, 문구만 최소 톤 수정)

**내용:** `buildActions(path)` 분기 유지. `re_goal` 무시. DQ-RE-03 반영에 맞춰 **문장만** 경로별로 다듬음 (예: `POST_DISPUTE`에서 「확인」→「대응」 어휘, 사전 경로는 「검토·확인」 유지).

**예시 (POST_DISPUTE, illustrative):**

1. 분쟁 경과를 날짜 순으로 정리  
2. 계약서·송금·메시지 등 증빙을 보관  
3. 다음 **대응** 전 상대·기관 안내 내용을 확인  

**장점:** 구현·QA 최소. STEP2-1과 충돌 없음. FREE 1차가 단순 유지.  
**단점:** 고객이 선택한 **대응 단계**(`re_goal`)와 actions **무관** — DQ-RE-03 직후 UX gap 지속.  
**구현 규모:** `realEstateVerifyFirstResult.ts` **121–147** 문자열 교체만.  
**검증:** 경로 4종 × 375px wrap, actions 3줄 유지.

---

### 옵션 B — 경로별 고정 3문장 **재작성** (slug 무시, 경로·라벨 정합 강화)

**내용:** 옵션 A보다 한 단계 — 경로마다 3문장을 **DQ-RE-03 라벨 체계**에 맞게 **전면 재작성** (여전히 `profile` 미참조).  
- PRE / DOCUMENT: 「확인 목적」에 맞는 **서명 전·서류 대조** 행동만.  
- POST: 「대응 단계」 프레이밍 — 협의 중 / 이의 준비 / 기관 접수 등 **단계군을 문장에 포괄** (특정 slug는 쓰지 않음).  
- UNCLEAR: 「상황 파악」용 — fact lock·2차 진입 전 **과도한 구체 행동 금지**.

**장점:** 라벨 분리(DQ-RE-03)와 **톤 일치** without branching explosion.  
**단점:** 여전히 **개인화 없음**; slug별 차이는 2차에만 남음.  
**구현 규모:** 동일 함수 **문자열 세트 4벌** + copy review 1회.  
**검증:** 옵션 A + 사후/사전 스모크 각 1경로.

---

### 옵션 C — **하이브리드** (권장): `actions[0]` = `re_goal` 연동, `[1–2]` = 경로 고정

**내용:**

1. `buildActions(path, profile)` 또는 `buildActions(path, answers)`로 시그니처 확장.  
2. **`actions[0]`:** `re_goal` slug(또는 `profile.goal`) → **짧은 행동 1문장** 맵 (경로별 맵 분리: `RE_PRE_GOAL` / `RE_POST_GOAL`). DI(`other`)는 `re_goalNote` 첫 줄 요약 또는 generic fallback 1문장.  
3. **`actions[1–2]`:** 현행 경로별 고정 2문장 (옵션 B 톤으로 정리).  
4. goal unknown: `[0]`을 경로 default 첫 문장으로 대체하거나 「우선 확인할 단계를 정리」 1문장.

**slug → action 예시 (POST, draft — Ace 승인 시 문구 확정):**

| slug | actions[0] 방향 (예) |
|------|----------------------|
| `before_response` | 공식 대응 전에 확인할 사항·서류부터 목록으로 정리 |
| `negotiating` | 상대·중개인과 주고받은 합의·조건을 날짜순으로 정리 |
| `preparing_objection` | 이의·반박에 넣을 사실·증빙 목록을 먼저 작성 |
| `authority_filed` | 접수·사건번호·기관 안내를 서류와 대조 |

**장점:** DQ-RE-03 **대응 단계**와 1차 CTA가 연결; Admin과 **방향성** 정합 without full signal engine. 변경 범위 **한 파일 + 맵 상수**.  
**단점:** slug 맵 유지 비용; STEP2-2 **옵션 수 변경**(DQ-RE-02) 시 맵 동기 필요.  
**구현 규모:** `realEstateVerifyFirstResult.ts` + (선택) profiling 옆 `RE_*_GOAL_FIRST_ACTION` 상수 — **Admin 복사 금지**, RE 전용.  
**검증:** PRE/POST/DOC 각 goal slug 1개 + `other`+note + goal unknown; strict product spot (LEVEL 3).

---

### 옵션 D — **Admin형** 답변 기반 합성 (최대 3~4문장)

**내용:** `buildCautions` / `buildUnconfirmed`와 유사하게 `re_disputeSubject`, `re_docSubject`, `re_docsMatch`, `re_preStage`, `re_goal` 등에서 **조건부 push** 후 **상위 3개**만 노출. `buildActions(path)` 고정 세트 **제거**.

**장점:** Master 원칙 B에 가장 가깝음; 1차 결과가 **입력 반영**됨.  
**단점:** STEP2-1 직후 **회귀·copy 폭** 큼; 행정 CASE와 **이중 유지보수**; FREE 1차에서 2차 질문과 **정보 중복** 위험.  
**구현 규모:** 신규 `appendRePhase1ResultActions` 수준 — **본 DQ 범위 초과** 권고.  
**검증:** Admin strict에 준하는 시나리오 매트릭스 필요.

---

### 옵션 E — **actions 섹션 축소** (고정 1문장 + unconfirmed/cautions에 역할 이양)

**내용:** `actions`를 경로별 **1문장**만 두거나, 패널에서 actions 블록 **시각적 비중 축소** (UI 변경은 별 DQ). 나머지는 기존 `cautions` / `unconfirmed` / `situationSummary`에 흡수.

**장점:** DQ-RE-03 라벨과 **중복 서술** 감소.  
**단점:** `AdminVerifyFirstResultData` 계약·타 서비스 패널 **동형성** 훼손; UI Mission 분리 필요.  
**권고:** **비권장** (unless Ace가 1차 RE 레이아웃 자체를 줄이기로 결정).

---

## 4. 권장안

| 순위 | 옵션 | 이유 |
|------|------|------|
| **1 (권장)** | **C — 하이브리드** | DQ-RE-03 이후 **「대응 단계」/「확인 목적」**과 1차 행동이 연결됨. STEP2-0이 STEP2-1에서 `buildActions`를 건드리지 않도록 한 이유(리스크 분리)와 맞게, **STEP2-1 다음 소규모 Mission**으로 넣기 좋음. |
| **2 (보수)** | **B — 경로별 재작성** | 맵·slug 유지비를 피하고 라벨 톤만 맞출 때. 개인화 요구가 낮으면 Ace가 C 대신 선택 가능. |
| **3 (현상 유지)** | **A** | 일정·용량 최우선 시. DQ-RE-03 반영 후 **의도적 gap**을 문서에 명시하고 2차에서만 깊이 제공. |

**비권장:** D (범위·회귀), E (패널 계약).

---

## 5. Ace 결정 체크리스트 (한 줄씩)

1. **옵션:** A / B / C / D / E  
2. **POST actions에 「대응 단계」라는 말을 문장에 넣을까?** 예/아니오  
3. **UNCLEAR fallback 3문장:** 유지 / 브릿지 전용 축소 / 브릿지 후 native path와 동일  
4. **DI(`re_goal=other`) actions[0]:** note 첫 문장 인용 / 고정 fallback / 생략  
5. **구현 시점:** RE STEP2-1 **직후 별도 커밋** (Admin 5-item 배치와 **독립** 권장)

---

## 6. 승인 후 구현 스케치 (참고만 — 실행 전)

| 단계 | 작업 |
|------|------|
| 1 | Ace가 옵션·체크리스트 확정 |
| 2 | `realEstateVerifyFirstResult.ts` — `buildActions` (+ 호출부 **188**) |
| 3 | (옵션 C) goal→action 맵 — `RE_PRE_GOAL_OPTIONS` / `RE_POST_GOAL_OPTIONS` slug와 **1:1** 동기 (DQ-RE-02로 제거된 slug는 맵에서도 제외) |
| 4 | `npx tsc --noEmit` |
| 5 | LEVEL 3: `/verify/real-estate` — PRE / POST / DOCUMENT / Entry→UNCLEAR 각 1회, actions 3줄·wrap·L1 제목 유지 |

**수정 없음:** `realEstateVerifyProfiling.ts` STOP·질문 체인 (unless 맵을 profiling으로 옮기기로 한 경우만).

---

## 7. 관련 문서

- `docs/master/VFBCAI_REALESTATE_STEP2-0_DESIGN_MAPPING_v1.md` — §3 DQ-RE-03, §8 `buildActions` 보류, §10.4  
- `docs/master/VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` — §2 CTA (1차 결과 actions는 rail CTA와 별개)

---

*2026-09-24. DESIGN QUESTION only — `src/**` 미변경. CASE_05·Admin 5-item 배치 **대기 중**; CASE_05 신호 시 본 RE 사전 작업은 중단하고 배치 실행으로 전환.*
