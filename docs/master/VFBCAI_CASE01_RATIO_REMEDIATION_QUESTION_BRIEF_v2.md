# CASE_01 질문 보강 Brief — LOCK 비율 4:6 (DQ-V04 = C) v2

| 항목 | 내용 |
|------|------|
| **버전** | v2 |
| **상태** | **Brief** — Ace 승인 전 IMPLEMENTER 착수 금지 |
| **선행** | v1(`0813342`) **대체** — 검토 「수정 필요」 반영 |
| **Mission** | CASE_01 **조건 조합 전체**에서 LOCK **4:6 실질 축 하한** 충족 |
| **승인 방식** | **DQ-V04 = C** — 장식 **실질 전환** 우선 · 부족 시만 신규 질문 |
| **감사 SoT** | `VFBCAI_ADMIN_VERIFY_COMMON_RESULT_AUDIT_v1.md` §6 · CASE_01 LEVEL1 감사 |
| **비율 LOCK** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` |
| **표현** | `VFBCAI_QUESTION_CHOICE_EXPRESSION_MASTER_EXECUTION_RULE_v1.md` |
| **결과** | 공통 감사 Layer A~J (v1.1) |
| **관계** | STEP2-1 Full Enhancement LOCK **유지** · typical **흡수·구조화** 방향 **유지** |

**v2 변경 요약:** 신호 중복 제거 · `confirmGoal`형 목표 질문 삭제 · facet 역할 분리 · R3 보조 원문 · 조건 조합 커버리지 표 · 실질 축 인정 기준 명시.

---

## 0. Mission 한 줄

장식 text·scope·note-only·의향-only 질문을 없애고, **사실 구조화 choice + R3 보조 1줄**로 Profile·needs*·**판단·위험·다음 행동**(의향과 구분)을 갈라 **모든 Phase2 경로**가 4:6 하한을 만족하게 한다.

---

## 1. DESIGN QUESTION

| ID | 결정 |
|----|------|
| **DQ-V04** | **C** — 실질 전환 우선 · 부족만 신규 |
| **DQ-C01-R01** | P1 실질 **5** 또는 **6**(`case01_factCompareGap` 경로) — P1 축 증가 없음 |
| **DQ-C01-R02** | **4:6만** 게이트 |
| **DQ-C01-R03** | DI textarea **단독 실질 축 금지** |
| **DQ-C01-R04 (v2)** | **통역·언어·간접 청취** 신호는 **`case01_languageAccessFact` 1문항**에서만 |
| **DQ-C01-R05 (v2)** | **날짜·장소·사실 차이 원문** = R3 보조 키 3종 · Layer A에 **원문** 표시 · 비율 **미포함** |
| **DQ-C01-R06 (v2)** | **목표·우선순위·다음에 무엇을 하겠다** = Phase1 `confirmGoal` 영역 — Phase2 **금지** (중복 버그 패턴) |

---

## 2. 실질 축 인정 기준 (v2 — CASE_02/06 Brief 공통 패턴)

| 규칙 | 내용 |
|------|------|
| **S1** | LOCK ②~④ 통과 **질문 1개 = 실질 축 1개** (값 장식이면 질문 전환 후 재판정) |
| **S2** | **의향·계획**(`~하시겠습니까`, `먼저 하려는 일`)만 바뀌고 판단·위험·행동이 동일 → **장식** |
| **S3** | 다른 질문·Phase1에서 **이미 구조화된 신호**와 동일하면 **축 인정 안 함** — §3 각 항목 **비중복 근거** 필수 |
| **S4** | R3 보조 text는 **축 아님** — choice 축의 밀도만 높임 |

---

## 3. Phase2 질문 카탈로그 (전환·신규·유지)

**공통 열:** 비중복 근거 = 다른 질문에서 **얻지 않는** 신호.

### 3.0 흡수·제거 (v1 유지)

| 대상 | 처리 |
|------|------|
| `case01_paymentDemandScope` / `supplementDemandScope` | → `case01_authorityDemand` 압축 choice (STEP2-1 DQ-C01-E02) |
| `case01_factDifferenceDetail` / `datePlaceDetail` (textarea 축) | → §3.2·3.3 facet + **R3 보조** (§5) |
| `case01_authorityResponseNote` | → `case01_authorityFollowUpKind` + R3 `case01_authorityFollowUpAux` |
| v1 삭제 | `clarityRecoveryStep` · `firstMovePriority` · `attendanceReadiness` · `noticeHoldStatus` · `evidenceUsability` · `hearsayVerifyStep` · `compareReadiness` · blockage `language_barrier` 값 |

### 3.1 `case01_authorityDemand` (유지·흡수)

| 항목 | 내용 |
|------|------|
| **역할** | 기관 요구 **유형·범위** (납부가 핵심인지·묶음인지·보완·출석·불명) |
| **비중복** | Phase1 `violationContent`·`customerResponded`와 **다른 축** — 「무엇을 하라 했는가」 |
| **Layer** | G · J · B |

### 3.2 `case01_factConflictFacet` (전환)

| 항목 | 내용 |
|------|------|
| **질문** | 「교통국이 말한 내용과 실제로 **다르다고 보는 점**은 무엇에 가장 가깝나요?」 |
| **노출** | `case01NeedsFactDisputeFacets` — `date_place_wrong` · `deny_*` · `partial_*` 등 **비교 가능 쟁점** 경로. `match` · 단독 `cannot_compare_yet`에서는 **미노출** |
| **선택지 (slug, 사실 1개만)** | `conflict_time` · `conflict_place` · `conflict_violation_action` · `conflict_vehicle_driver` · `conflict_other` + DI |
| **금지** | `conflict_speed_amount` 등 **속도+금액 혼합** · **금액·과태료** slug (→ CASE_02, `authorityDemand` 납부 축) |
| **선택별 차이** | Profile fragment · evidence needs · **위험 신호** slug별 분리 |
| **비중복** | `spatiotemporalFacet`은 **확인 수준**만 — **무엇이 다른지**는 본 축만 |
| **R3** | `case01_factDifferenceAux` — 항상 노출(해당 경로) · Layer A 원문 |
| **Layer** | F · J · A |

**label 예 (`conflict_violation_action`):**  
「통지·설명에서는 제가 하지 않은 **행동·위반**을 문제라고 했는데, 그 행동 자체가 없었거나 제가 한 일이 아닙니다.」

### 3.3 `case01_spatiotemporalFacet` (전환)

| 항목 | 내용 |
|------|------|
| **질문** | 「그 날짜·장소·상황을 **지금 어떤 방식으로 확인할 수 있나요?」 |
| **노출** | `case01NeedsSpatiotemporalFacet` — `factConflictFacet` on-path **또는** `date_place_wrong` **또는** `cannot_compare_yet` |
| **선택지** | `st_has_records` · `st_witness_only` · `st_memory_only` · `st_cannot_verify` + DI |
| **선택별 차이** | evidence gate · expert 톤 · **판단** 「확인 가능/불가」 clause |
| **비중복** | `factConflictFacet`은 **쟁점 유형** · 본 축은 **입증 수준**만 |
| **R3** | `case01_datePlaceAux` — 항상(노출 경로) · Layer A 원문 |
| **Layer** | J · I · A |

### 3.4 `case01_actualSituation` · `responseDetail` · `case01_authorityFollowUpKind` (유지·정리)

| id | 비중복 |
|----|--------|
| `actualSituation` | Phase1 `factRelationship` **라벨**과 별개 — 「실제로 무슨 일이 있었나」 정밀 facet |
| `responseDetail` | Phase1 `customerResponded`가 **대응함**일 때만 · **행동 사실** (의향 아님) |
| `authorityFollowUpKind` | `authorityResponse` choice **흡수 또는 직후 1축** · 기관 **회신·재요구 유형** (note → R3) |

### 3.5 `case01_evidence` (유지·정리 — notice 중복 해소)

| 항목 | 내용 |
|------|------|
| **변경** | v1 `noticeHoldStatus` **삭제** — **보유 자료 형태**는 evidence choice로만 |
| **선택지 (사실 1개)** | `ev_notice_original` · `ev_notice_copy` · `ev_message_thread` · `ev_photo_video` · `ev_submitted_docs` · `ev_none_yet` + DI |
| **비중복** | `noticeDeliveryFact`(§3.8)는 **받은 경로** · evidence는 **지금 손에 있는 것** |
| **Layer** | D · J · H(첨부) |

### 3.6 `case01_blockage` (유지·값 정리)

| 항목 | 내용 |
|------|------|
| **변경** | `language_barrier` **삭제** → §3.7 전용 |
| **선택지** | `facts_why` · `content_unclear` · `deadline_unclear` · `afraid_mistake` · `procedure_unclear` + DI |
| **비중복** | `unclearDemandFact`는 **요구 내용** 불명 · blockage는 **대응 막힘 유형** |
| **Layer** | J · C |

### 3.7 `case01_languageAccessFact` (신규 — **통역·언어 단일 질문**)

| 항목 | 내용 |
|------|------|
| **질문** | 「안내를 이해하거나 확인할 때 **언어·통역** 때문에 막힌 부분이 있나요?」 |
| **노출** | `case01NeedsLanguageAccessFact` = P1 `factCompareGap` ∈ {`gap_hearsay_channel`,`gap_language_access`} **OR** `demand_unclear` **OR** evidence `ev_message_thread`+interpreter flag **단일 OR 게이트** |
| **선택지** | `lang_none` · `lang_partial_understanding` · `lang_need_interpreter` · `lang_third_party_only` + DI |
| **선택별 차이** | risk · action(통역·원문 확보) · CASE_06 가중 **한 곳에서만** |
| **비중복** | blockage·attendance·evidence·compare·hearsay v1 문항에 **언어 신호 분산 금지** |
| **Layer** | J · A · C |

### 3.8 `case01_noticeDeliveryFact` (신규 — 사실)

| 항목 | 내용 |
|------|------|
| **질문** | 「교통국 안내를 **처음 어떤 방식으로** 받았나요?」 |
| **노출** | `customerResponded=no_contact_yet` **AND** Phase2 진입 |
| **선택지** | `del_in_person` · `del_phone_message` · `del_written_only` · `del_third_party` + DI |
| **비중복** | evidence는 **현재 보유물** · 본 축은 **수신 경로 사실** |
| **Layer** | F · J |

### 3.9 `case01_unclearDemandFact` (신규 — 사실, 목표 아님)

| 항목 | 내용 |
|------|------|
| **질문** | 「안내 중 **지금도 확실하지 않은 내용**은 무엇에 가장 가깝나요?」 |
| **노출** | `authorityDemand=demand_unclear` (또는 legacy unclear slug) |
| **선택지** | `unclear_what_violation` · `unclear_what_action` · `unclear_deadline` · `unclear_who_authority` + DI |
| **대체** | v1 `clarityRecoveryStep` (**confirmGoal 중복**) **삭제** |
| **비중복** | Phase1 `confirmGoal`은 **고객이 원하는 검토 목표** · 본 축은 **요구 내용 중 미확정 사실** |
| **Layer** | J · F |

### 3.10 `case01_compareRecordGap` (신규 — 사실)

| 항목 | 내용 |
|------|------|
| **질문** | 「통지·설명과 비교하려면 **지금 무엇이 아직 없나요?」 |
| **노출** | Phase1 `factRelationship=cannot_compare_yet` |
| **선택지** | `cmp_missing_notice` · `cmp_missing_calendar` · `cmp_missing_receipt` · `cmp_missing_messages` + DI |
| **대체** | v1 `compareReadiness`·`hearsayVerifyStep` (**의향/절차**) **삭제** |
| **비중복** | P1 `factCompareGap`은 **비교 불가 이유** · 본 축은 **부재 중인 자료 사실** |
| **Layer** | F · J · evidence needs |

### 3.11 요구 유형 보조 사실 (신규 — 의향 금지)

「무엇을 하라고 **적혀/말해** 졌는지」만 구조화.

| id | 노출 | 비중복 |
|----|------|--------|
| `case01_attendInstructionFact` (M) | demand ∈ {`attend_explain`,`attendance`} | `authorityDemand` **유형** vs **출석·소명 문구 사실** |
| `case01_supplementInstructionFact` (S) | demand ∈ {`supplement`,`supplement_core`} | **제출 대상·회차** 사실 |
| `case01_paymentInstructionFact` (P) | demand ∈ {`payment`,`pay_*`} | **납부 종류**(과태료/수수료 등) — **금액·과태료 쟁점 숫자는 CASE_02** |

### 3.12 깊이 보조 사실 (신규 — 미대응·match 보정, 의향 금지)

| id | 질문 요지 | 노출 | 비중복 |
|----|-----------|------|--------|
| `case01_procedureStageFact` (Q) | 「이 안내가 **처음 통지**에 가깝나요, **추가·재통지**에 가깝나요?」 | `no_contact_yet` **OR** P2 산출 <8 보정 게이트 | `noticeDeliveryFact` **수신 경로** vs **통지 단계** |
| `case01_officeIdentityFact` (O) | 「어느 **교통국·부서** 안내인지 **확인된 수준**은?」 | `no_contact_yet` + (match 또는 supplement/payment **without** C) | `authorityDemand` **행동 유형** vs **기관 식별** |
| `case01_correctTargetFact` (T) | 「수정·확인하라고 한 **대상**에 가깝은 것은?」 | `correct_record` | supplement·payment **대상**과 분리 |

---

## 4. R3 보조 입력 (축 미포함 · Layer A 원문)

| 키 | 노출 | Layer A 표시 |
|----|------|----------------|
| `case01_factDifferenceAux` | `factConflictFacet` on-path | `사실 차이 원문: …` |
| `case01_datePlaceAux` | `spatiotemporalFacet` on-path | `날짜·장소 원문: …` |
| `case01_authorityFollowUpAux` | `authorityFollowUpKind` + follow-up slug | `기관 추가 요구 원문: …` |

**IMPLEMENTER:** persist · `CASE01_ANSWER_KEYS` · restore · **J4** (값 존재 시 요약).

---

## 5. 노출 조건 조합 — Phase2 실질 축·4:6

**축 기호:** A=authorityDemand · B=actualSituation · C=factConflictFacet · D=spatiotemporalFacet · E=responseDetail · F=authorityFollowUpKind · G=evidence · H=blockage · K=languageAccessFact · L=noticeDeliveryFact · U=unclearDemandFact · J=compareRecordGap · M=attendInstructionFact · S=supplementInstructionFact · P=paymentInstructionFact

**P1:** 기본 **5**. `cannot_compare_yet` + `factCompareGap` 답 시 **6**.

**하한:** P1=5 → P2≥**8** · P1=6 → P2≥**9**

### 5.1 조합 표 (대표 — 전 조합은 동일 게이트 함수로 산출)

**축:** 대응 **R** × 요구 **D** × Phase1 사실관계 **F**

| # | R | D (요구) | F (Phase1) | P1 | Phase2 실질 축 (기호) | P2 | 하한 | 4:6 |
|---|-----|----------|------------|-----|------------------------|-----|------|-----|
| 1 | has_responded | payment | date_place_wrong | 5 | A,B,C,D,E,F,G,H | 8 | 8 | PASS |
| 2 | has_responded | payment | match | 5 | A,B,D,E,F,G,H,P,Q | 8 | 8 | PASS |
| 3 | has_responded | attend_explain | match | 5 | A,B,E,F,G,H,M,L,Q | 8 | 8 | PASS |
| 4 | has_responded | supplement | match | 5 | A,B,E,F,G,H,S,L,Q | 8 | 8 | PASS |
| 5 | has_responded | correct_record | match | 5 | A,B,E,F,G,H,L,Q,T | 8 | 8 | PASS |
| 6 | has_responded | demand_unclear | cannot_compare + gap | 6 | A,B,D,E,F,G,H,U,J,K | 9 | 9 | PASS |
| 7 | no_contact | payment | date_place_wrong | 5 | A,B,C,D,G,H,P,L,Q | 8 | 8 | PASS |
| 8 | no_contact | attend_explain | match | 5 | A,B,G,H,M,L,Q,O | 8 | 8 | PASS |
| 9 | no_contact | payment | match | 5 | A,B,G,H,P,L,Q,O | 8 | 8 | PASS |
| 10 | no_contact | supplement | match | 5 | A,B,G,H,S,L,Q,O | 8 | 8 | PASS |
| 11 | no_contact | demand_unclear | cannot_compare + gap | 6 | A,B,D,G,H,U,J,K,L | 9 | 9 | PASS |
| 12 | no_contact | demand_unclear | match | 5 | A,B,G,H,U,L,Q,O | 8 | 8 | PASS |

**D (요구) 축:** `payment` = `payment`·`pay_core_traffic`·`pay_bundled` · `attend_explain` = `attend_explain`·`attendance` · `supplement` = `supplement`·`supplement_core` · `correct_record` · `demand_unclear`

**F (Phase1):** `date_place_wrong` 등 쟁점 · `match` · `cannot_compare_yet` + `factCompareGap` 답변

### 5.2 커버리지 규칙 (하한 미달 조합 0)

1. **`case01Phase2SubstantiveAxisIdsOnPath(answers)`** — §3·5.1 게이트의 **합집합**으로 IMPLEMENTER 구현.  
2. **미대응(`no_contact_yet`)** 이고 P2<8이면 **자동** `L`+`Q`+`O` 후보 — **목표 질문 금지**.  
3. **대응함** 이고 P2<8이면 `E`+`F` 후 **`P`/`M`/`S`/`T`** 중 demand 해당 1개 + `Q` + (`C`+`D` 또는 `D` 단독).  
4. **`cannot_compare_yet`** 이면 **필수** `J`+`D`; gap이 hearsay/language이면 **필수** `K` (다른 문항에 언어 신호 **금지**).  
5. **fixture 3개** (`fullChainResponded`·`fullChainGapUnclear`·`briefV1A`) = 표 **#1·#6·#8**에 매핑 — QA는 **조합 게이트** assert.
6. **`case01NeedsSpatiotemporalFacet`:** `#2` 등 match+payment에서 **D** on — `violationContent`가 시공간 쟁점이거나 게이트 §5.2-2에 의해 P2<8이면 **D** 자동 on (**의향 질문으로 채우지 않음**).

### 5.3 gap 사유 (`factCompareGap`) — P1=6 유지, Phase2 추가 분기 없음

P1 `factCompareGap` 5 slug는 **이유**만 저장. Phase2 `J`·`K`·`D`가 **자료·언어·확인 수준**을 담당 — **같은 신호 중복 없음**.

---

## 6. 경로별 요약 (현재 → v2 보강 후)

| 조합 클래스 | P1 | P2 (현재) | P2 (v2) | 4:6 |
|-------------|-----|-----------|---------|-----|
| typical (#1) | 5 | 6 | **8** | PASS |
| gap (#6/#11) | 6 | 6 | **9** | PASS |
| brief (#8) | 5 | 4 | **8** | PASS |

---

## 7. 결과 Layer A~J (v2)

| Layer | 연결 |
|-------|------|
| **A** | R3 **원문 3키** + 첨부 파일명 · choice full label **금지** |
| **B** | facet 짧은 footnote |
| **C** | slug→clause · **의향 문장 금지** |
| **D** | evidence·facet 카드 제목 |
| **E** | R3·note persist |
| **F** | 신규 facet·O·Q·T → Profile |
| **G** | authority 흡수 slug |
| **H** | 첨부 |
| **I** | Phase2 risk = facet |
| **J** | manifest — **코드 반영 전** 대표 검토 |

---

## 8. VERIFIER

1. §5.1 **12조합** + `case01Phase2SubstantiveAxisIdsOnPath` **자동 산출** 일치.  
2. **K** 노출 경로에서 다른 질문 choice에 **통역 신호 0**.  
3. **confirmGoal** 문구와 **동일 의미** Phase2 질문 **0**.  
4. R3 원문 **Layer A** 스크린샷.  
5. PC + 375px.

---

## 9. IMPLEMENTER 터치 (참고)

`adminVerifyProfiling.ts` · `AdminVerifyFirstResultPanel.tsx` · `tests/qa/case01-phase2-chain-count.mjs` — **조합 게이트** 테스트 추가.

**금지:** 비율 채우기 장식 · v1 삭제 id 재도입 · Master LOCK 편집.

---

## 10. v1 대비 변경 목록

| v1 | v2 |
|----|-----|
| 통역 5곳 분산 | **K 단일** |
| noticeHoldStatus + evidence notice | **G만** |
| clarityRecoveryStep · firstMovePriority | **삭제** → U·L·Q·O·T **사실** |
| conflict_speed_amount | **분리** · 금액은 P·CASE_02 |
| facet 역할 혼재 | **C=무엇이 다른가 · D=확인 수준** |
| fixture 3개만 | **§5.1 조합 표 + 게이트** |
| text 축 | **R3 보조 + Layer A 원문** |

---

*2026-09-25. 2번창 — CASE_01 질문 보강 Brief v2 (문서만).*
