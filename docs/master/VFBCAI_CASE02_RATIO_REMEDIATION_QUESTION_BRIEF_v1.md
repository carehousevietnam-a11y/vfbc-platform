# CASE_02 질문 보강 Brief — LOCK 비율 4:6 (DQ-V04 = C) v1

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **폐기** — `VFBCAI_CASE02_RATIO_REMEDIATION_QUESTION_BRIEF_v2.md` (구 4:6 기준) |
| **Mission** | 납부·금액·기한 CASE **사실 기반 노출만**으로 Phase2 실질 축·4:6 **측정·표시** (미달 **숨기지 않음**) |
| **승인 방식** | **DQ-V04 = C** (CASE_01 v3 동형) |
| **감사 SoT** | `VFBCAI_CASE02_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **표현·결과** | `VFBCAI_QUESTION_CHOICE_EXPRESSION_MASTER_EXECUTION_RULE_v1.md` · 공통 감사 Layer A~J v1.1 |
| **패턴 SoT** | `VFBCAI_CASE01_RATIO_REMEDIATION_QUESTION_BRIEF_v3.md` (`6a57075`) |

**폐기:** `VFBCAI_CASE02_MINIMAL_REMEDIATION_STEP2-0_v1.md` · `VFBCAI_CASE02_MINIMAL_REMEDIATION_STEP2-1_MISSION_BRIEF_v1.md` (G1~G3 최소 패치) — **본 Brief + CASE_02 전면 고도화 Mission으로 대체**. deadline date·금액 text·infoSource 연결은 **본 Brief 축**에 포함하며 **별도 최소 Mission 착수 금지**.

---

## 0. Mission 한 줄

질문 노출은 **고객 답(사실)만**. P2 개수로 질문을 **끼워 넣지 않는다**. 대표 **30조합**마다 실질 축을 나열·집계해 4:6 **PASS/미달**을 표시하고, 미달은 **추가 사실 질문·장식→실질 전환**으로만 해소한다. **정확 전수**는 구현 코드 산출이 최종 SoT.

---

## 1. DESIGN QUESTION

| ID | 결정 |
|----|------|
| **DQ-V04** | **C** — 장식 **실질 전환** 우선 · 부족 시만 신규 사실 질문 |
| **DQ-C02-R01** | Phase1 실질 **6** — `paymentSubject`, `paymentInfoSource`, `situationMatch`, `paymentAmount`, `paymentStatus`, `confirmGoal` (`paymentInfoSource` **Profile·needs·결과 연결** 후 축 인정) |
| **DQ-C02-R02** | **4:6만** 게이트 — 3:7·P2≥N **강제 없음** |
| **DQ-C02-R03** | DI textarea **단독 실질 축 금지** — `deadlineDate`·`paymentAmountDetail`은 **choice 게이트 뒤 보조 1줄** |
| **DQ-C02-R04** | **가격 생성·환율·신규 금액 제안 UI 금지** — 통지·기억 **인용 text**만 |
| **DQ-C02-R05** | Phase2 **목표·의향** 중복 금지 — `confirmGoal` vs `finalGoal` 역할 분리 유지 |
| **DQ-C02-R06** | `blockage`·`evidence`·deadline 미확인 slug — **값별** 판단·행동·위험 **분화** 또는 **축 통합·삭제** (장식 유지 금지) |
| **DQ-C02-R07** | **P2&lt;N 보정 노출·질문 개수 조건 게이트** 전면 **금지** |
| **DQ-C02-R08** | **제3자·간접 안내** 신호 = **`case02_noticeAccessFact`(Nc) 단일** — `paymentInfoSource`는 **인지 경로 사실**(P1), 간접 위험·행동은 **Nc** |

---

## 2. 실질 축 인정 기준

CASE_01 v3 §2 (S1~S4) 동형.

| CASE_02 추가 | 내용 |
|--------------|------|
| **S5** | Phase1·Phase2 **동일 id 재질문**은 실질 축 **1개**만 (예: `situationMatch`·`paymentAmount` Phase2 재노출은 **축 +1 아님**) |
| **S6** | `case02_deadlineDate`·`case02_paymentAmountDetail`은 **해당 choice 조건 충족 시** 보조 축 **1개** (R3 단독 축 아님) |

---

## 3. Phase2 노출 조건 — 1줄 확정 (사실만)

**P1 실질 N = 6** (§1 DQ-C02-R01).  
**4:6:** P2 ≥ ⌈P1×6/4⌉ → **하한 9**.

| 기호 | id | 노출 조건 (사실) |
|------|-----|------------------|
| **Da** | `case02_demandAuthority` | CASE_02 Phase2 진입 **AND** `!case02_demandAuthority` (handoff 시드 후 스킵) |
| **Bs** | `case02_paymentBasis` | `confirmGoal` ∈ {`verify_obligation`, `why_pay`} **OR** `paymentSubject` ∈ {`unclear`, `unsure`} **OR** `situationMatch` = `not_applicable` |
| **Dl** | `case02_deadline` | `case02_deadline` 미완료 **AND** (`confirmGoal` = `how_when_where` **OR** `paymentStatus` ∈ {`not_paid`, `partial`} **OR** `confirmGoal` ∈ {`verify_obligation`, `verify_amount`, `payment_processed`, `why_pay`}) |
| **Dd** | `case02_deadlineDate` | `case02_deadline` = `confirmed` **AND** `case02_deadlineDate` 비어 있음 |
| **Ad** | `case02_paymentAmountDetail` | `paymentAmount` 완료 **AND** effective amount ∈ {`amount_differs`, `paid_redemand`, `amount_stated_basis_unclear`} **AND** `paymentAmount` ≠ `other` **AND** detail 비어 있음 |
| **Pm** | `case02_paymentMethod` | Phase2 체인에서 `deadline`·`Dd` 블록 통과 후 **AND** (미납 경로 **OR** 기납부 경로) — **현행 체인 위치 유지** |
| **Np** | `case02_nonPaymentNotice` | `paymentStatus` ∈ {`not_paid`, `partial`} |
| **Ar** | `case02_authorityResponse` | `paymentStatus` ∈ {`partial`, `full`, `paid_unverified`, `paid_by_other`} |
| **Ev** | `case02_evidence` | `case02NeedsEvidence(answers)` 동치: `paymentInfoSource` ∈ {`third_party`, `recall_unclear`} **OR** 기납부 **OR** `confirmGoal` ∈ {`verify_obligation`, `verify_amount`} **OR** amount ∈ {`amount_differs`, `amount_unknown`, `reason_unclear`, `amount_stated_basis_unclear`} **OR** `situationMatch` ∈ {`partial`, `not_applicable`, `hard_to_judge`, `unknown`} |
| **Bl** | `case02_blockage` | CASE_02 Phase2 체인 **항상** (값별 downstream **실질화** — DQ-C02-R06) |
| **Fg** | `case02_finalGoal` | `confirmGoal` = `unsure` |
| **Nc** | `case02_noticeAccessFact` | `paymentInfoSource` ∈ {`third_party`, `recall_unclear`} |
| **Pp** | `case02_paidProcessingFact` | `paymentStatus` ∈ {`paid_unverified`, `paid_by_other`} **OR** `authorityResponse` ∈ {`more_required`, `no_reply_yet`, `procedure_unknown`, `unclear`} |
| **Ms** | `case02_amountSanctionFact` | `nonPaymentNotice` 완료 **AND** `paymentStatus` ∈ {`not_paid`, `partial`} |

**P1 `paymentInfoSource`:** Phase1 필수 유지. **인지 경로**만 — 간접 위험·「원문 확보」행동은 **Nc** (DQ-C02-R08).

**흡수·정리 (전환):**

| 제거·축소 | 대체 |
|-----------|------|
| deadline `uncertain` / `deadline_mentioned` / `not_stated` / `unsure` **동일 unconfirmed** | `Dl` choice **실질 분화** 또는 `case02_deadlineUncertaintyFact` (Brief 후보 — **미달 해소용**, 게이트는 `Dl` ∈ 미확정 slug만) |
| `blockage` 값 무차별 | slug별 action·risk (§4.10) |
| `evidence` 종류 장식 | `Ev` choice **보유·부재·준비 가능** 사실 + 첨부 게이트 |

**신규 id (`Pp`, `Ms`, `Nc`)** — IMPLEMENTER Mission 별도 승인 후 추가. 노출은 **위 표만**.

---

## 4. 선택지별 효과 (판단 · 다음 행동 · 위험도)

### 4.1 `case02_paymentInfoSource` (P1 — If)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `official_notice` | **공식 통지·문서**로 인지 | 문서 원문·번호 대조 | 상대적 낮음 |
| `in_person_or_call` | **대면·전화** 안내 | 안내 내용 메모·기록 | 구두 오해 |
| `message_app` | **문자·메신저** | 스크린샷·발신 번호 보존 | 위조·오발 |
| `third_party` | **제3자 전달** | **Nc** · 공식 통지 확보 | **간접·오해** |
| `recall_unclear` | **기억만·출처 불명** | **Nc** · 통지 사본 탐색 | **내용 불명** |

### 4.2 `case02_noticeAccessFact` (Nc)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `access_have_copy` | 간접이나 **사본 있음** | 원문·발신처 확인 | 중간 |
| `access_no_copy` | **사본 없음** | 발급·재전송 요청 | 입증 공백 |
| `access_sender_unknown` | **누가 전달했는지 불명** | 경로·대행 확인 | 사칭·오전달 |
| `access_language_barrier` | **언어·통역** 이슈 | 통역·원문 요청 | 오해·기한 |

### 4.3 `case02_paymentBasis` (Bs)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `basis_violation_cited` | **위반·사실** 인용 | 사실관계 대조 | 쟁점 명확 |
| `basis_fee_schedule` | **수수료·고시** 인용 | 고시·항목 확인 | 과다 청구 의심 |
| `basis_prior_case` | **이전 건 연결** | 이전 처리·영수증 대조 | 이중·중복 |
| `basis_not_explained` | **근거 설명 없음** | 근거 문구 요청 | **부당 청구 의심** |

### 4.4 `case02_deadline` (Dl) + `case02_deadlineDate` (Dd)

| slug (Dl) | 판단 | 다음 행동 | 위험도 |
|-----------|------|-----------|--------|
| `confirmed` | **일자 확인** → **Dd** | 기한 일정 반영 | 기한 준수 |
| `uncertain` | 기한 **있으나 일자 미확인** | 통지 문구·재확인 | **기한 경과** |
| `deadline_mentioned` | **기한 언급만** | 구체 일자 확인 | 기한 불명 |
| `not_stated` | **기한 언급 없음** | 기한 문의 | 미납 가산 |
| `unsure` | **정보 거의 없음** | 공식 안내 요청 | **가산·제재** |

**Dd (text):** 통지·기억상 **납부 기한 일자** 인용 — 판단: 기한 압박 수준 · 행동: 일정·알림 · 위험: 경과 시 가산.

### 4.5 `case02_paymentAmount` (P1 Am) · `case02_paymentAmountDetail` (Ad)

| slug (Am) | 판단 | 다음 행동 | 위험도 |
|-----------|------|-----------|--------|
| `amount_stated_basis_unclear` | 금액 **인지**, 근거 불명 | **Ad** · 고지 대조 | 오납 |
| `amount_differs` | **금액 불일치** | **Ad** · 이전 고지 대조 | 과다·이중 |
| `paid_redemand` | **납부 후 재요구** | **Ad** · 영수증·처리 확인 | **이중 납부** |
| `amount_unknown` | 금액 **불명** | 고지·문자 재확인 | 잘못된 납부 |

### 4.6 `case02_paymentMethod` (Pm)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `method_stated` | **방법·계좌** 안내됨 | 안내와 동일 경로로 납부 | 착오 낮음 |
| `method_partial` | **일부만** 안내 | 미안내 항목 문의 | 오납 |
| `method_not_stated` | **방법 불명** | 공식 납부 채널 확인 | 사기 계좌 |
| `method_suspect` | **비공식·개인 계좌** 의심 | **공식 연락처로 진위 확인** | **사기·사칭 상승** |

### 4.7 `case02_nonPaymentNotice` (Np) · `case02_amountSanctionFact` (Ms)

| slug (Np) | 판단 | 다음 행동 | 위험도 |
|-----------|------|-----------|--------|
| `sanction_enforcement_stated` | **제재·강제징수** 안내 | 기한 내 대응 계획 | **가산·징수** |
| `interest_stated` | **이자·가산** 안내 | 기한·금액 재확인 | 누적 부담 |
| `no_notice` | **미납 결과 미안내** | **Ms** · 공식 안내 요청 | 불확실성 |

### 4.8 `case02_authorityResponse` (Ar) · `case02_paidProcessingFact` (Pp)

| slug (Ar) | 판단 | 다음 행동 | 위험도 |
|-----------|------|-----------|--------|
| `processed_confirmed` | **처리 완료** 확인 | 보관 | 낮음 |
| `more_required` | **추가 요구** | **Pp** · 요구 범위 확인 | 누적 부담 |
| `no_reply_yet` | **미회신** | **Pp** · 회신·접수 확인 | **재부과** |
| `procedure_unknown` | **절차 불명** | 공식 절차 문의 | 지연 |

### 4.9 `case02_evidence` (Ev)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `yes` | **자료 있음** | 제출·대조 | 입증 유리 |
| `partial` | **일부만** | 부족분 목록화 | 부분 입증 |
| `no` | **없음** | 확보 가능 자료 탐색 | 입증 공백 |
| `unsure` | **무엇을 준비할지 불명** | 요구 자료 문의 | 반려 |

### 4.10 `case02_blockage` (Bl)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `obligation` | **의무 여부** 막힘 | 근거·통지 확인 | 부당 청구 |
| `amount` | **금액** 막힘 | 고지·산정 문의 | 오납 |
| `basis` | **근거** 막힘 | **Bs** 연계 | 쟁점 |
| `method` | **방법** 막힘 | **Pm** 연계 | 사기 |
| `deadline` | **기한·처리** 막힘 | **Dl/Dd/Pp** 연계 | **가산** |

### 4.11 `case02_finalGoal` (Fg)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `verify_obligation` | 의무 확인 우선 | 근거·상황 대조 | — |
| `verify_amount` | 금액 확인 우선 | **Ad**·고지 | — |
| `complete_payment` | **올바른 납부** 완료 | **Pm**·영수증 | 이중 방지 |
| `expert` | **전문가 연결** | handoff | — |

---

## 5. 조합 표 — 30 전체 (2×3×5)

**축:** 납부 상태 **Ps** (`unpaid` = `not_paid` | `paid_track` = `partial` \| `full` \| `paid_unverified` \| `paid_by_other`) × 상황 일치 **Sm** (`match` | `mismatch` = `partial` \| `not_applicable` | `compare_gap` = `hard_to_judge` \| `unknown`) × 확인 목표 **Cg** (`obligation` = `verify_obligation` \| `why_pay` · `amount` = `verify_amount` · `timing` = `how_when_where` · `processed` = `payment_processed` · `unsure` = `unsure`)

**표준 Phase1 (조합 공통):** `paymentSubject` = `traffic_fine` · `paymentInfoSource` = `official_notice` · `paymentAmount` = `amount_stated_basis_unclear` · `demandAuthority` = `traffic` (시드) · `Dl` = `confirmed` + `Dd` 답 완료(해당 행에 Dl on-path일 때).

**집계 규칙:** §3 노출 조건으로 **나타나는 Phase2 실질 축만** 기호로 나열 · **개수 = P2**. P1 **6** 고정 · **하한 9**.  
**재질문** (`situationMatch`·`paymentAmount` Phase2)은 Phase1 완료 가정으로 **목록에 넣지 않음**.

| # | Ps | Sm | Cg | Phase2 실질 축 (기호 순) | P2 | 4:6 |
|---|-----|-----|-----|---------------------------|-----|-----|
| 1 | unpaid | match | obligation | Bs,Dl,Dd,Pm,Np,Ev,Bl | 7 | **미달** |
| 2 | unpaid | match | amount | Dl,Dd,Pm,Np,Ev,Bl,Ad | 7 | **미달** |
| 3 | unpaid | match | timing | Dl,Dd,Pm,Np,Bl | 5 | **미달** |
| 4 | unpaid | match | processed | Bs,Dl,Dd,Pm,Np,Ev,Bl | 7 | **미달** |
| 5 | unpaid | match | unsure | Bs,Dl,Dd,Pm,Np,Ev,Bl,Fg | 8 | **미달** |
| 6 | unpaid | mismatch | obligation | Bs,Dl,Dd,Pm,Np,Ev,Bl | 7 | **미달** |
| 7 | unpaid | mismatch | amount | Dl,Dd,Pm,Np,Ev,Bl,Ad | 7 | **미달** |
| 8 | unpaid | mismatch | timing | Dl,Dd,Pm,Np,Bl | 5 | **미달** |
| 9 | unpaid | mismatch | processed | Bs,Dl,Dd,Pm,Np,Ev,Bl | 7 | **미달** |
| 10 | unpaid | mismatch | unsure | Bs,Dl,Dd,Pm,Np,Ev,Bl,Fg | 8 | **미달** |
| 11 | unpaid | compare_gap | obligation | Bs,Dl,Dd,Pm,Np,Ev,Bl | 7 | **미달** |
| 12 | unpaid | compare_gap | amount | Dl,Dd,Pm,Np,Ev,Bl,Ad | 7 | **미달** |
| 13 | unpaid | compare_gap | timing | Dl,Dd,Pm,Np,Bl | 5 | **미달** |
| 14 | unpaid | compare_gap | processed | Bs,Dl,Dd,Pm,Np,Ev,Bl | 7 | **미달** |
| 15 | unpaid | compare_gap | unsure | Bs,Dl,Dd,Pm,Np,Ev,Bl,Fg | 8 | **미달** |
| 16 | paid_track | match | obligation | Bs,Dl,Dd,Pm,Ar,Ev,Bl | 7 | **미달** |
| 17 | paid_track | match | amount | Dl,Dd,Pm,Ar,Ev,Bl,Ad | 7 | **미달** |
| 18 | paid_track | match | timing | Dl,Dd,Pm,Ar,Bl | 5 | **미달** |
| 19 | paid_track | match | processed | Bs,Dl,Dd,Pm,Ar,Ev,Bl,Pp | 8 | **미달** |
| 20 | paid_track | match | unsure | Bs,Dl,Dd,Pm,Ar,Ev,Bl,Fg | 8 | **미달** |
| 21 | paid_track | mismatch | obligation | Bs,Dl,Dd,Pm,Ar,Ev,Bl | 7 | **미달** |
| 22 | paid_track | mismatch | amount | Dl,Dd,Pm,Ar,Ev,Bl,Ad | 7 | **미달** |
| 23 | paid_track | mismatch | timing | Dl,Dd,Pm,Ar,Bl | 5 | **미달** |
| 24 | paid_track | mismatch | processed | Bs,Dl,Dd,Pm,Ar,Ev,Bl,Pp | 8 | **미달** |
| 25 | paid_track | compare_gap | obligation | Bs,Dl,Dd,Pm,Ar,Ev,Bl | 7 | **미달** |
| 26 | paid_track | compare_gap | amount | Dl,Dd,Pm,Ar,Ev,Bl,Ad | 7 | **미달** |
| 27 | paid_track | compare_gap | timing | Dl,Dd,Pm,Ar,Bl | 5 | **미달** |
| 28 | paid_track | compare_gap | processed | Bs,Dl,Dd,Pm,Ar,Ev,Bl,Pp | 8 | **미달** |
| 29 | paid_track | compare_gap | unsure | Bs,Dl,Dd,Pm,Ar,Ev,Bl,Fg | 8 | **미달** |
| 30 | unpaid | match | obligation | Bs,Dl,Dd,Pm,Np,Ev,Bl,**Nc**,**Ms** | 9 | PASS |

**요약 (목표 설계 축):** 위 표는 **전환·신규 축 반영 후** 산출. **#30** = `paymentInfoSource` = `third_party`로 **Nc** 추가 + 미납 **Ms** 예시 **PASS**. 그 외 **#1~#29는 현재 §3만으로 P2&lt;9 → 미달** — **숨기지 않음**. IMPLEMENTER는 **장식→실질·신규 사실 축**으로 미달 해소(게이트 **사실만**).

**보조 조합 (Nc on-path):** `paymentInfoSource` ∈ {`third_party`, `recall_unclear`}이면 해당 행에 **Nc** +1 (Ev needs와 **중복 질문 금지** — Nc는 **접근·사본** 사실, Ev는 **보유·제출 준비**).

### 5.1 미달 해소 방향 (사실만 · 게이트 없음)

| 부족 패턴 | 방향 |
|-----------|------|
| P2=5~8, 하한 9 | §3 **Nc·Pp·Ms** 및 blockage/evidence **값 실질화** · `timing` 경로에 **기한·방법 사실** 축 추가 검토 (`case02_paymentChannelFact` 등) — **P2 산출 후 끼워 넣기 금지** |
| `paid_track` + `processed` | **Pp** (`paid_unverified` 표준) — §4.8 |
| 미납 + 제재 안내 | **Ms** — §4.7 |

### 5.2 커버리지 규칙

1. 노출은 **§3만**.  
2. `case02Phase2SubstantiveAxisIdsOnPath(answers)` = §3 충족 id 집합 (구현).  
3. 조합 표 **미달을 PASS로 바꾸지 않음**.  
4. fixture (구현 후): typical unpaid+obligation+match ≈ #1 · third_party ≈ #30 변형 · `paid_unverified`+processed ≈ #19.

---

## 6. Layer A~J · VERIFIER · IMPLEMENTER

| 역할 | 요구 |
|------|------|
| **IMPLEMENTER** | CASE_01 전면 고도화 **PASS 후** 플랫폼 순서에 CASE_02 차례일 때 · **본 Brief + 전면 Mission**만 |
| **VERIFIER** | 30행·코드 산출 일치 · **미달 행 PASS 오표기 금지** · PC+375 UI FINAL QA |
| **Layer** | 금액·기한 text = Layer A 인용 · choice = J manifest |

---

## 7. 최소 리메디에이션 → 본 Brief

| 폐기 문서 | 본 Brief |
|-----------|----------|
| STEP2-0 G1 deadlineDate | §3 **Dd** |
| G2 paymentAmountDetail | §3 **Ad** |
| G3 paymentInfoSource | §1 R01 · §3 **Nc** · §4.1 |

---

*2026-09-25. 2번창 — CASE_02 질문 보강 Brief v1 (문서만).*
