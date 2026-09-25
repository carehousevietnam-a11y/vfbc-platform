# Admin VERIFY CASE_01~06 — 통합 수동 검사 고정 시나리오

| 항목 | 내용 |
|------|------|
| **용도** | 사람이 브라우저로 **직접 클릭** 검사. 자동화·스크립트 **금지** |
| **환경** | 로컬 또는 스테이징. 로그인 가능한 테스트 회원 1계정 준비 |
| **기본 URL** | `https://<HOST>/verify/admin` (엔진: VERIFY · 행정문서 Master) |
| **Q1 공통** | 질문 키 `adminCaseDocumentKind` (`adminVerifyProfiling.ts` ~93–115). 아래 CASE별 **Q1 선택**으로 native CASE 고정 |
| **기록** | 각 경로 PASS/FAIL + 스크린샷·비고. 실패 시 「어떤 화면·어떤 문장」 |

**공통 퍼널 (확인만, 순서 변경 시 FAIL):**  
Phase1 질문 → (간이 증거 optional) → 가입/로그인 → **1차 종합 결과** → 개인화 상세검토(Phase2) → **2차 결과** (해당 CASE가 Phase2를 쓰는 경우).

**공통 결과 확인 위치**

- **1차:** `AdminVerifyFirstResultPanel` — 상황 요약, 주의/미확인, keyMetrics, CTA 카드.
- **질문 중 요약:** `MasterReviewQuotationReport` choice 요약(해당 시).

---

## 공통 통과 기준 (모든 CASE·모든 경로)

1. **입력 원문 보존:** 직접 입력·text 칸에 넣은 **고유 문장**이 1차(또는 2차) **상황 요약·주의·미확인** 어딘가에 **잘리지 않고** 보이거나, 의도적으로 숨긴 경로(다)에서는 **「확인됨」 등 빈 확정 문장이 slug만으로 나오지 않음**.
2. **문장 깨짐 없음:** 한글 줄바꿈·카드 밖 overflow·`undefined`·빈 제목·CTA 2줄 깨짐 없음 (PC + **375px** 각 1회 이상 권장).
3. **카드 제목·내용 일치:** 결과 카드/섹션 제목(L2)과 본문(L4)이 **서로 다른 CASE 문구**가 섞이지 않음 (예: CASE_03 화면에 CASE_05 처분 문구).
4. **원문 반복:** 동일 고유 문장이 요약에 **의미 없이 2회 이상** 붙여 넣기되지 않음 (라벨 + note 정상 병기는 허용).
5. **slug 노출 금지:** 고객 UI에 `specific_date`, `deposit_return` 등 **내부 slug**가 그대로 보이지 않음.

경로 **(다)** 추가: 의도적으로 비운 칸에 대해 **질문이 다시 열리거나** 완료가 막히면 PASS. 비워 두었는데 완료·「확인됨」만 나오면 **FAIL (값 누락)**.

---

## CASE_01 — 교통·위반 통지 (Q1: `violation_notice`)

| | |
|--|--|
| **Q1** | 「교통위반이나 문제를 알리는 통지라고 들었습니다」 (`violation_notice`) |
| **Phase1 (5)** | `case01_violationContent` → `case01_factRelationship` → `case01_customerResponded` → `case01_deadline` → `case01_confirmGoal` |
| **감사 참고** | `case01_factDifferenceDetail` / `case01_datePlaceDetail` Profile 미반영 (`VFBCAI_CASE01_INFORMATION_COMPLETENESS_AUDIT_v1.md` §0.1) |

### 경로 (가) 풀 체인

| 단계 | 화면 | 입력 (번호 선택 요약) |
|------|------|------------------------|
| Q1 | 진입 | `violation_notice` |
| P1-1 | 위반 내용 | 교통위반 계열 **첫 번째** 내용 선택지 |
| P1-2 | 사실 관계 | 「부분적으로 다름」류 (`partial_situation` 계열) |
| P1-3 | 고객 대응 | 「아직 대응 안 함」류 (`none`) |
| P1-4 | 기한 | 「기한을 확인했다」류 (`confirmed`) |
| P1-5 | 확인 목표 | 「사유를 이해하고 싶다」류 |
| 증거/가입 | 간이 증거 | 파일명 `CASE01-FULL-EV-01` (또는 스킵) |
| 1차 결과 | 확인 | 상황 요약·주의에 **위반·사실관계** 반영 |
| P2 | Phase2 | 화면이 열리는 질문 **순서대로 전부** 응답. `case01_deadlineDate` text: **`CASE01-MANUAL-DATE-2026-04-15`** |
| P2 text | 사실 차이 | **`CASE01-MANUAL-FACTDIFF-불일치내용고유문장`** |
| P2 text | 날짜·장소 | **`CASE01-MANUAL-PLACE-호치민1구`** |

**1차 결과 확인:** `confirmed`만고 **날짜 원문 없이** 「기한 확인됨」만 있으면 기록 (감사상 경계). **2차 완료 후** `CASE01-MANUAL-DATE-2026-04-15`가 요약/주의에 있는지.

### 경로 (나) 직접 입력(other)

| 단계 | 입력 |
|------|------|
| P1-1 | 하단 **직접 설명하기** + note **`CASE01-DI-OTHER-위반내용-고유ALPHA`** |
| P1-4 | 기한 **직접 설명** + **`CASE01-DI-DEADLINE-고유BETA`** (UI가 other 허용 시) |
| 나머지 | (가)와 동일하게 진행 가능한 만큼 |

**확인:** note **`CASE01-DI-OTHER-위반내용-고유ALPHA`**가 1차 요약에 노출. **없고** 일반 라벨만 있으면 FAIL.

### 경로 (다) 선택·text 일부 비움

| 단계 | 입력 |
|------|------|
| P1-2 | `partial_situation` 선택 |
| P2 | `case01_factDifferenceDetail` **비움** → 다음 불가해야 PASS |
| 또는 | P1-4 `confirmed` 후 Phase2 `case01_deadlineDate` **비움** → 완료 불가 PASS |

**FAIL:** text 비었는데 Phase2/1차 완료·「확인됨」만 표시.

### CASE_01 통과 기준 (한 줄)

Phase1·Phase2를 설계대로 마친 뒤, **고유 입력 문장**이 결과에 반영되고, 비운 text는 **완료가 막히며**, CASE_02~06 문구가 섞이지 않는다.

---

## CASE_02 — 납부 요구 (Q1: `payment_demand`)

| | |
|--|--|
| **Q1** | 「벌금이나 비용을 납부하라는 내용」 (`payment_demand`) |
| **Phase1 (6)** | `case02_paymentSubject` → `paymentInfoSource` → `situationMatch` → `paymentAmount` → `paymentStatus` → `confirmGoal` |
| **감사 참고** | `paymentInfoSource` Profile 없음 (~CASE02 audit §1.2). `deadline=confirmed` 날짜 키 없음 |

### 경로 (가) 풀 체인

| 단계 | 입력 |
|------|------|
| P1 | 납부 대상: 벌금/행정료류 · 안내 경로: **첫 번째** · 일치: 부분 불일치 · 금액: **금액이 다름** · 상태: 미납 · 목표: 납부 방법 확인 |
| P1-4 other | 금액 **직접 입력** **`CASE02-MANUAL-AMOUNT-1500000VND`** |
| P2 | 열리는 chain 전부. `deadline`에서 「날짜 확인」류 선택 |
| 1차/2차 | 요약에 납부·불일치 반영 |

### 경로 (나) DI

| 단계 | 입력 |
|------|------|
| P1-1 | 납부 대상 **직접 설명** **`CASE02-DI-SUBJECT-고유GAMMA`** |
| P1-2 | 안내 경로 **직접 설명** **`CASE02-DI-SOURCE-고유DELTA`** |

### 경로 (다) 비움

| 단계 | 입력 |
|------|------|
| P1-4 | `other` 선택 후 note **비움** → Phase1 완료 불가 PASS |
| P2 | `paymentMethod` 등 조건부 text/DI **비움** 시 동일 |

### CASE_02 통과 기준

**`CASE02-MANUAL-AMOUNT-1500000VND`** 또는 DI 문장이 authority/요약에 반영(또는 other 경로 명시). `confirmed` 기한 **날짜 숫자 없이** 「확인」만 나오면 **결함 기록** (감사 동종). slug UI 노출 없음.

---

## CASE_03 — 출석·소명 (Q1: `attendance_demand`)

| | |
|--|--|
| **Q1** | `attendance_demand` |
| **Phase1 (5)** | `authorityDemand` → `inquiryFocus` → `customerResponse` → `confirmGoal` → `deadline` |
| **감사 참고** | `case03_deadline` `specific_date` 날짜 키 없음 (`AdminVerifyFirstResultPanel` `buildCase03IntegratedSituation`) |

### 경로 (가) 풀 체인

| 단계 | 입력 |
|------|------|
| P1 | 출석 요구 확인 · 초점: 일시·장소 · 대응: **출석함** · 목표: 일정 확인 · 기한: **특정 날짜 확인** (`specific_date`) |
| P2 | factRelationship → explanationDetail → … 열리는 만큼 전부 |
| 1차 결과 | 출석·기한 관련 문장 |

**확인:** `specific_date` 후 **날짜 text 칸이 없으면** 감사 동종 — 「출석·소명 기한은 확인된 상태」만 있고 **`CASE03-MANUAL-DATE` 없으면 FAIL 기록**.

### 경로 (나) DI

| | |
|--|--|
| P1-1 | 요구 내용 **직접 설명** **`CASE03-DI-DEMAND-고유EPSILON`** |
| P1-5 | 기한 **직접 설명** **`CASE03-DI-DEADLINE-2026-05-20`** (note가 기한 칸에 안 가면 FAIL — 감사 §데이터손실) |

### 경로 (다) 비움

| | |
|--|--|
| P2 | `explanationDetail` text **비움** → 진행 불가 PASS |

### CASE_03 통과 기준

출석·기한·장소 **고유 문장** 보존 또는 (감사已知) **누락을 결함으로 명시 기록**. 카드·문장 깨짐 없음.

---

## CASE_04 — 보완·제출 (Q1: `supplement_demand`)

| | |
|--|--|
| **Q1** | `supplement_demand` |
| **Phase1 (4)** | `supplementTarget` → `confirmGoal` → `customerResponse` → `deadline` |
| **감사 참고** | `case04_deadline` `specific_date` 동종. `addDocDetail` 등 결과 미반영 |

### 경로 (가) 풀 체인

| 단계 | 입력 |
|------|------|
| P1 | 보완 대상: 서류 추가 · 목표: 제출 요건 · 대응: 일부 제출 · 기한: **specific_date** |
| P2 | initialSubmission → submissionRelation → supplementReason → … |
| text | addDocDetail 등 열리면 **`CASE04-MANUAL-DOCDETAIL-보완서류목록`** |

### 경로 (나) DI

| | |
|--|--|
| P1-1 | 보완 대상 **직접 설명** **`CASE04-DI-TARGET-고유ZETA`** |

### 경로 (다) 비움

| | |
|--|--|
| P2 | `modifyDetail` / `evidenceDetail` **비움** (열린 경우) → 불가 PASS |
| P1-4 | `specific_date` without any date text → 「보완 제출 기한 확인」만 → **FAIL 기록** |

### CASE_04 통과 기준

보완·기한 맥락 유지. 상세 text 입력 시 요약 반영(없으면 감사 결함 기록). 원문 반복·slug 없음.

---

## CASE_05 — 처분·조치 통지 (Q1: `disposition_notice`)

| | |
|--|--|
| **Q1** | `disposition_notice` |
| **Phase1 (4)** | `case05_dispositionType` → `case05_confirmGoal` → `case05_customerResponse` → `case05_deadline` |
| **감사·코드** | `case05_deadlineDate` (`CASE05_DEADLINE_DATE_KEY` ~449, push ~6770). detail 5필드 Profile 단절 |

### 경로 (가) 풀 체인

| 단계 | 입력 |
|------|------|
| P1 | 조치: **허가 거부/취소**류 · 목표: **사유 이해** · 대응: **문의함** · 기한: **특정 날짜 확인** (`specific_date`) |
| P1-4 text | **`CASE05-MANUAL-DEADLINE-2026-06-01`** (text 칸 나오면 필수 입력) |
| P2 | factRelationship → dispositionReason → dispositionDetail → … 조건 충족 시 전부 |
| 1차 | `CASE05-MANUAL-DEADLINE-2026-06-01` in summary/caution |

### 경로 (나) DI

| | |
|--|--|
| P1-1 | 조치 유형 **직접 설명** **`CASE05-DI-DISPOSITION-고유ETA`** |
| P1-3 | 대응 **직접 설명** **`CASE05-DI-RESPONSE-고유THETA`** |

### 경로 (다) 비움

| | |
|--|--|
| P1-4 | `specific_date` 선택 후 **`case05_deadlineDate` 비움** → Phase1 완료 불가 PASS (리메디 후). 완료되면 **FAIL** |
| P2 | `dispositionDetail` other note 비움 → 불가 PASS |

### CASE_05 통과 기준

날짜 원문·DI 문장이 결과에 남음. `disposition_unclear` vs `other` **동일 caution만** 나오면 감사 동종 **결함 기록**. detail 선택 변경 시 주의 문장 **동일하면** 장식 결함 기록.

---

## CASE_06 — 불명확·브릿지 (Q1: `unclear`)

| | |
|--|--|
| **Q1** | 「무슨 내용인지 잘 모르겠습니다」 (`unclear`) → **CASE_06** v1.1 |
| **Phase1 (5)** | `case06_requiredActionCandidate` → `knowledgeSource` → `sourceChannel` → `deadlineActionPair` → `customerResponse` |
| **Phase2** | 체인별 4~6 + 불명확 `signal_violation` 조기 STOP (리메디 전) |
| **감사 참고** | `adminVerifyCase06Redesign.ts` ~131–136, ~705–707. 결과 패널 `case06_payment*` 미사용 |

### 경로 (가) 풀 체인 — 납부 체인 예

| 단계 | 입력 |
|------|------|
| Q1 | `unclear` |
| P1-1 | 요구 후보: **납부 요구** (`pay_demand`) |
| P1-2~4 | 각 **첫 번째** 내용 선택지 |
| P1-4 | 기한: **특정 날짜까지 납부** (`deadline_pay_by_date`) |
| P1-4 text | (리메디 후) **`CASE06-MANUAL-PAYDATE-2026-07-01`** — **미구현 시** slug만 완료 → **FAIL 기록** |
| P2 | paymentNature → … paymentResponse 전부 |
| 브릿지 | 타겟 CASE_02 등 전환 시 **타겟 Phase1이 처음부터** (시드 없음) |

### 경로 (나) DI

| | |
|--|--|
| P1-1 | 요구 후보 **직접 설명** **`CASE06-DI-ACTION-고유IOTA`** |
| P2 | payment 등 **직접 설명** **`CASE06-DI-PAYMENT-고유KAPPA`** |

### 경로 (다) 비움 / 조기 STOP

| | |
|--|--|
| 불명확 체인 | `problem_action_unclear` → 재확인 **위반·문제 언급** (`signal_violation`) → **1문항만** 끝나면 감사 동종 **FAIL 기록** |
| text | `deadline_pay_by_date` 후 날짜 text **비움** → (리메디 후) 완료 불가 PASS |

### CASE_06 통과 기준

브릿지 후 타겟 질문 **skip 없음**. CASE_06에서 말한 금액·날짜가 **타겟 answer에 복사되지 않음**(원칙 F). v1.1 체인 답이 1차 결과에 **안 보이면** 감사 동종 기록. 상태 줄(리메디 R03)은 타겟 화면·결과 **동일 문장**.

---

## 실행 체크리스트 (검사자용)

| CASE | (가) | (나) | (다) | PC | 375px |
|------|------|------|------|-----|-------|
| 01 | ☐ | ☐ | ☐ | ☐ | ☐ |
| 02 | ☐ | ☐ | ☐ | ☐ | ☐ |
| 03 | ☐ | ☐ | ☐ | ☐ | ☐ |
| 04 | ☐ | ☐ | ☐ | ☐ | ☐ |
| 05 | ☐ | ☐ | ☐ | ☐ | ☐ |
| 06 | ☐ | ☐ | ☐ | ☐ | ☐ |

**전체 PASS:** 위 공통 통과 기준 5항 + CASE별 한 줄 기준 충족. 일부만 통과 시 **CASE 단위 PASS 금지**.

---

## 참고 문서

- 감사: `VFBCAI_CASE01_INFORMATION_COMPLETENESS_AUDIT_v1.md` ~ `CASE06_…`
- CASE_05/06 handoff: `VFBCAI_ADMIN_CASE0506_AUDIT_FINDINGS_HANDOFF_v2.md`
- UI QA: `.cursor/rules/06-ui-design-responsive-typography-qa.mdc`

---

*2026-09-25. 문서만. 코드·자동화·push 없음. 4번창은 검사 실행 역할.*
