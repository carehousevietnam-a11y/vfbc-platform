# CASE_01 질문 보강 Brief — LOCK (DQ-V04 = C) v3

| 항목 | 내용 |
|------|------|
| **버전** | v3 |
| **상태** | **LOCK** — Ace 승인 (비율 `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` 2026-09-25 개정) |
| **선행** | v2(`4364373`) **대체** |
| **Mission** | 사실 기반 노출 · Phase2 실질 **>** Phase1 실질 **측정·표시** |
| **승인 방식** | **DQ-V04 = C** |
| **비율 SoT** | P2 실질 **>** P1 실질 (⌈P×6/4⌉ **폐기**) |
| **감사·표현·결과** | v2와 동일 SoT |

**v3 변경:** (1) **비율 보정 게이트 전면 삭제** (2) **노출 조건 1줄 확정 + 30조합 표** (3) **선택지별 효과 표** · **제3자/간접 청취 신호 K 단일화**

---

## 0. Mission 한 줄

질문 노출은 **고객 답(사실)만**으로 결정한다. P2 개수로 질문을 **끼워 넣지 않는다**. 30개 조합마다 실질 축을 **정확히 세어** **P2 &gt; P1** **PASS/미달**을 표시한다. **정확 전수**는 구현 코드 산출이 최종 SoT.

---

## 1. DESIGN QUESTION (v2 유지 + v3)

| ID | 결정 |
|----|------|
| **DQ-V04** | **C** |
| **DQ-C01-R01~R06** | v2 동일 (**R02** = P2&gt;P1) |
| **DQ-C01-R07 (v3)** | **P2&lt;N 보정 노출·자동 L/Q/O·violationContent로 D 강제 on** 등 **금지** |
| **DQ-C01-R08 (v3)** | **간접 청취·제3자 전달** 신호 = **`case01_languageAccessFact`(K) 단일** (L·P1 gap과 **역할 분리**) |

---

## 2. 실질 축 인정 기준

v2 §2 동일 (S1~S4).

---

## 3. Phase2 노출 조건 — 1줄 확정 (사실만)

| 기호 | id | 노출 조건 (사실) |
|------|-----|------------------|
| **A** | `case01_authorityDemand` | CASE_01 Phase2 체인 진입 |
| **B** | `case01_actualSituation` | 동일 |
| **G** | `case01_evidence` | 동일 |
| **H** | `case01_blockage` | 동일 |
| **C** | `case01_factConflictFacet` | `case01_factRelationship` = `date_place_wrong` |
| **D** | `case01_spatiotemporalFacet` | `factRelationship` ∈ {`date_place_wrong`, `cannot_compare_yet`} |
| **J** | `case01_compareRecordGap` | `factRelationship` = `cannot_compare_yet` |
| **K** | `case01_languageAccessFact` | `case01_factCompareGap` ∈ {`gap_hearsay_channel`, `gap_language_access`} **OR** `authorityDemand` = `demand_unclear` |
| **E** | `case01_responseDetail` | `case01_customerResponded` = `has_responded` |
| **Ff** | `case01_authorityFollowUpKind` | `customerResponded` = `has_responded` |
| **L** | `case01_noticeDeliveryFact` | `customerResponded` = `no_contact_yet` |
| **Q** | `case01_procedureStageFact` | `no_contact_yet` **AND** `noticeDelivery` ∈ {`del_phone_message`, `del_written_only`} |
| **O** | `case01_officeIdentityFact` | `no_contact_yet` **AND** `factRelationship` = `match` |
| **P** | `case01_paymentInstructionFact` | `authorityDemand` ∈ {`payment`, `pay_core_traffic`, `pay_bundled`} |
| **M** | `case01_attendInstructionFact` | `authorityDemand` ∈ {`attend_explain`, `attendance`} |
| **S** | `case01_supplementInstructionFact` | `authorityDemand` ∈ {`supplement`, `supplement_core`} |
| **T** | `case01_correctTargetFact` | `authorityDemand` = `correct_record` |
| **U** | `case01_unclearDemandFact` | `authorityDemand` = `demand_unclear` |

**P1 실질 N:** `factRelationship` ≠ `cannot_compare_yet` → **5**. `cannot_compare_yet` **AND** `case01_factCompareGap` 답 완료 → **6**.

**제3자·간접 청취 통합 (v3):**

| 제거 | 대체 |
|------|------|
| L 선택지 `del_third_party` | **삭제** — 간접 수신은 **K**에서만 (`lang_indirect_hearsay`) |
| K `lang_third_party_only` | → **`lang_indirect_hearsay`** (제3자·대행·통역으로만 들음) |
| P1 `gap_hearsay_channel` | **비교 불가 이유**만 — **간접 청취 판단·위험·행동은 K** |

**L 선택지 (v3):** `del_in_person` · `del_phone_message` · `del_written_only` · `del_not_received_yet` + DI

**흡수·R3·facet 정의:** v2 §3.0~3.6·§4 동일 (C/D 역할 분리·금액 slug 금지 유지).

---

## 4. 선택지별 효과 (판단 · 다음 행동 · 위험도)

### 4.1 `case01_factConflictFacet` (C)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `conflict_time` | 쟁점이 **시각** 불일치 | 일정·기록 대조 | 시간대 불일치 추적 |
| `conflict_place` | 쟁점이 **장소** 불일치 | 위치·경로 증거 확보 | 장소 불일치 |
| `conflict_violation_action` | **행동·위반 유무** 불일치 | 행동 경위 소명 | 부인·반박 필요 |
| `conflict_vehicle_driver` | **차량·운전자** 귀속 불일치 | 등록·탑승 정보 확인 | 귀속 오류 가능 |
| `conflict_other` | 기타 차이 (R3 원문) | 차이 항목별 확인 | case별 |

### 4.2 `case01_spatiotemporalFacet` (D)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `st_has_records` | **기록으로** 확인 가능 | 자료 제출·대조 | 상대적으로 낮음 |
| `st_witness_only` | **증인·동행**만 | 연락·확인서 | 증인 의존 |
| `st_memory_only` | **기억만** | 메모·일정 재구성 | 기억 불일치 |
| `st_cannot_verify` | **지금은 확인 불가** | 확보 가능 자료 탐색 | 입증 공백 |

### 4.3 `case01_languageAccessFact` (K)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `lang_none` | 언어·통역 **장벽 없음** | (다른 축 우선) | — |
| `lang_partial_understanding` | **부분 이해** | 원문·통역 재확인 | 오해 가능 |
| `lang_need_interpreter` | **통역 필요** | 통역·공식 안내 요청 | 절차 지연 |
| `lang_indirect_hearsay` | **제3자·간접**으로만 들음 | **공식 통지·원문** 확보 | **간접 전달·오해** (hearsay 단일 출구) |

### 4.4 `case01_unclearDemandFact` (U)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `unclear_what_violation` | **위반 내용** 불명 | 통지 문구 확인 | 쟁점 불명 |
| `unclear_what_action` | **해야 할 일** 불명 | 요구 행위 재확인 | 미대응·기한 |
| `unclear_deadline` | **기한** 불명 | 기한 문구 확인 | 기한 경과 |
| `unclear_who_authority` | **기관·담당** 불명 | 공식 연락처 확인 | 사칭·착오 |

### 4.5 `case01_compareRecordGap` (J)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `cmp_missing_notice` | **통지 사본** 없음 | 통지 확보 | 비교 불가 |
| `cmp_missing_calendar` | **일정 기록** 없음 | 일정·로그 확보 | 시간 입증 약함 |
| `cmp_missing_receipt` | **접수·제출** 기록 없음 | 접수증 탐색 | 제출 여부 불명 |
| `cmp_missing_messages` | **메시지** 없음 | 연락 기록 확보 | 대화 입증 약함 |

### 4.6 `case01_noticeDeliveryFact` (L)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `del_in_person` | **대면** 안내 | 대면 내용 메모·확인 | 구두 오해 |
| `del_phone_message` | **전화·문자** | Q(통지 단계) 후속 | 기록 보존 |
| `del_written_only` | **문서만** | Q 후속 · 문구 확인 | 문구 해석 |
| `del_not_received_yet` | **아직 못 받음** | 수령 경로 확인 | 안내 부재 |

### 4.7 `case01_procedureStageFact` (Q)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `stage_first_notice` | **최초 통지** | 1차 대응 기준 정리 | 초기 기한 |
| `stage_followup_notice` | **추가·재통지** | 이전 안내와 대조 | 누적 요구 |
| `stage_unsure` | **단계 불명** | 통지 이력 정리 | 중복·누락 |

### 4.8 `case01_officeIdentityFact` (O)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `office_named_clear` | **기관·부서 명확** | 해당 부서 연락 | 상대적으로 낮음 |
| `office_name_only` | **이름만** 알음 | 담당·주소 확인 | 착오 가능 |
| `office_unknown` | **기관 확인 불가** | **공식 연락처로 통지 진위 확인** | **사칭 통지 가능성 상승** |
| `office_wrong_suspect` | **다른 기관 의심** | 문서·번호 대조 | 사칭·오배달 |

### 4.9 `case01_correctTargetFact` (T)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `tgt_identity_record` | **신원·등록** 수정 | 등록 서류 확인 | 등록 오류 |
| `tgt_submission_content` | **제출 내용** 수정 | 제출본 대조 | 내용 불일치 |
| `tgt_vehicle_record` | **차량·운전** 기록 | 차량 정보 확인 | 귀속 |
| `tgt_other` | 기타 (R3) | 대상별 확인 | — |

### 4.10 `case01_attendInstructionFact` (M)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `att_date_place_stated` | **일시·장소** 명시 | 일정·장소 확인 | 기한·불참 |
| `att_window_only` | **기간만** 명시 | 구체 일정 재확인 | 일정 불명 |
| `att_place_unknown` | **장소 불명** | 장소 문의 | 착오·지연 |
| `att_content_unclear` | **출석 요지** 불명 | 소명 범위 확인 | 준비 부족 |

### 4.11 `case01_supplementInstructionFact` (S)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `sup_missing_docs_list` | **누락 서류** 목록 | 목록 대조 제출 | 보완 기한 |
| `sup_replace_docs` | **교체·정정** | 기존 제출 대조 | 이중 제출 |
| `sup_content_add` | **내용 추가** | 추가분 작성 | 형식 오류 |
| `sup_scope_unclear` | **범위 불명** | 보완 범위 문의 | 반려 |

### 4.12 `case01_paymentInstructionFact` (P)

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `pay_type_fine` | **벌금·과태료** 성격 (금액은 CASE_02) | 납부 고지 대조 | 미납·이의 |
| `pay_type_fee` | **수수료** 성격 | 항목·고지 확인 | 과다 청구 의심 |
| `pay_type_mixed` | **항목 혼재** | 항목 분리 확인 | 이중 납부 |
| `pay_type_unclear` | **납부 종류** 불명 | 고지 문구 확인 | 잘못된 납부 |

---

## 5. 조합 표 — 30 전체 (2×5×3)

**축:** 대응 **R** (`no_contact_yet` | `has_responded`) × 요구 **D** (payment | attend | supplement | correct | unclear) × 1차 사실 **F** (`match` | `date_place_wrong` | `cannot_compare_yet`)

**집계 규칙:** 각 행은 §3 노출 조건을 적용해 **나타나는 축만** 기호로 나열하고 **개수 = P2**.  
**NC 행 Q 포함:** 표준 완료 답에서 `noticeDelivery` = `del_phone_message` (Q 노출). **Cmp 행 P1=6:** `factCompareGap` 답 완료. **Cmp+K:** `factCompareGap` = `gap_hearsay_channel` (표준).

**판정:** P2 **>** P1 (실질 축). 본 표 산수: **최소 P1=5 · P2=7** (#1·4·7·10).

| # | R | D | F | P1 | Phase2 실질 축 (기호 순) | P2 | P2&gt;P1 |
|---|-----|-----|-----|-----|---------------------------|-----|--------|
| 1 | has_responded | payment | match | 5 | A,B,G,H,E,Ff,P | 7 | PASS |
| 2 | has_responded | payment | date_place | 5 | A,B,C,D,G,H,E,Ff,P | 9 | PASS |
| 3 | has_responded | payment | cannot_compare | 6 | A,B,D,G,H,J,K,E,Ff,P | 9 | PASS |
| 4 | has_responded | attend | match | 5 | A,B,G,H,E,Ff,M | 7 | PASS |
| 5 | has_responded | attend | date_place | 5 | A,B,C,D,G,H,E,Ff,M | 9 | PASS |
| 6 | has_responded | attend | cannot_compare | 6 | A,B,D,G,H,J,K,E,Ff,M | 9 | PASS |
| 7 | has_responded | supplement | match | 5 | A,B,G,H,E,Ff,S | 7 | PASS |
| 8 | has_responded | supplement | date_place | 5 | A,B,C,D,G,H,E,Ff,S | 9 | PASS |
| 9 | has_responded | supplement | cannot_compare | 6 | A,B,D,G,H,J,K,E,Ff,S | 9 | PASS |
| 10 | has_responded | correct | match | 5 | A,B,G,H,E,Ff,T | 7 | PASS |
| 11 | has_responded | correct | date_place | 5 | A,B,C,D,G,H,E,Ff,T | 9 | PASS |
| 12 | has_responded | correct | cannot_compare | 6 | A,B,D,G,H,J,K,E,Ff,T | 9 | PASS |
| 13 | has_responded | unclear | match | 5 | A,B,G,H,E,Ff,U,K | 8 | PASS |
| 14 | has_responded | unclear | date_place | 5 | A,B,C,D,G,H,E,Ff,U,K | 10 | PASS |
| 15 | has_responded | unclear | cannot_compare | 6 | A,B,D,G,H,J,K,E,Ff,U | 10 | PASS |
| 16 | no_contact | payment | match | 5 | A,B,G,H,L,Q,O,P | 8 | PASS |
| 17 | no_contact | payment | date_place | 5 | A,B,C,D,G,H,L,Q,P | 8 | PASS |
| 18 | no_contact | payment | cannot_compare | 6 | A,B,D,G,H,J,K,L,Q,P | 9 | PASS |
| 19 | no_contact | attend | match | 5 | A,B,G,H,L,Q,O,M | 8 | PASS |
| 20 | no_contact | attend | date_place | 5 | A,B,C,D,G,H,L,Q,M | 8 | PASS |
| 21 | no_contact | attend | cannot_compare | 6 | A,B,D,G,H,J,K,L,Q,M | 9 | PASS |
| 22 | no_contact | supplement | match | 5 | A,B,G,H,L,Q,O,S | 8 | PASS |
| 23 | no_contact | supplement | date_place | 5 | A,B,C,D,G,H,L,Q,S | 8 | PASS |
| 24 | no_contact | supplement | cannot_compare | 6 | A,B,D,G,H,J,K,L,Q,S | 9 | PASS |
| 25 | no_contact | correct | match | 5 | A,B,G,H,L,Q,O,T | 8 | PASS |
| 26 | no_contact | correct | date_place | 5 | A,B,C,D,G,H,L,Q,T | 8 | PASS |
| 27 | no_contact | correct | cannot_compare | 6 | A,B,D,G,H,J,K,L,Q,T | 9 | PASS |
| 28 | no_contact | unclear | match | 5 | A,B,G,H,L,Q,U,K | 8 | PASS |
| 29 | no_contact | unclear | date_place | 5 | A,B,C,D,G,H,L,Q,U,K | 9 | PASS |
| 30 | no_contact | unclear | cannot_compare | 6 | A,B,D,G,H,J,K,L,Q,U | 9 | PASS |

**요약 (신규 기준 P2&gt;P1):** **30/30 PASS**. 표상 최소 **P1=5 · P2=7** (#1·4·7·10).  
**v2 오류 정정:** `has_responded` 행에 **L 없음** · 축 개수는 **코드 전수**가 최종.

### 5.1 `case01_demandFulfillmentFact` — **이번 범위 제외**

구 ⌈P×6/4⌉ 미달(#1·4·7·10) 대응으로 설계했으나, **2026-09-25 비율 규칙 개정** 후 §5 **30조합 전부 PASS** — **IMPLEMENTER 이번 Mission에 포함하지 않음**. 아래는 **후속 Mission 참고용**만 보관.

| 항목 | 참고 (미구현) |
|------|----------------|
| id | `case01_demandFulfillmentFact` |
| 노출 | `has_responded` + `match` + payment/attend/supplement/correct |
| 역할 | `responseDetail`/`fulfilled_demand`=**대응 형태** vs 본 축=**이행·증빙** (혼합 금지) |
| 선택지 | `fulfill_complete_with_proof` · `fulfill_complete_no_proof` · `fulfill_partial` · `fulfill_not_yet` |

**금지 (LOCK):** 비율 맞추기 위해 본 축 **추가 구현 금지**.

### 5.2 커버리지 규칙 (v3)

1. 노출은 **§3 표만** 사용.  
2. `case01Phase2SubstantiveAxisIdsOnPath(answers)` = §3 조건 충족 id 집합.  
3. 조합 표는 **미달을 PASS로 바꾸지 않음**.  
4. fixture: `fullChainResponded`≈#2 · `fullChainGapUnclear`≈#15 · `briefV1A`≈#19.

---

## 6. Layer A~J · VERIFIER · IMPLEMENTER

v2 §7~9 동일. VERIFIER: **30행·P2&gt;P1** · 코드 전수 일치 · `demandFulfillmentFact` **미구현** 회귀.

---

## 7. v2 → v3 변경

| v2 | v3 |
|----|-----|
| §5.2 P2&lt;8 보정 | **삭제** |
| Q 노출에 보정 게이트 | **L 답이 phone/written일 때만** |
| 12행·개수 오류 | **30행·정확 집계** |
| 제3자 신호 3곳 | **K `lang_indirect_hearsay` 단일** |
| 효과 예시 수준 | **§4 선택지별 표** |

---

## 부록 A — F12 선택지 원문 (§7 v3 동형 · 2026-09-25)

**본문 §1~7 LOCK — 변경은 본 부록·코드만.** SoT: `adminVerifyCase01Phase2FacetOptions.ts` · `adminVerifyProfiling.ts` (`CASE01_EVIDENCE_OPTIONS` · `CASE01_BLOCKAGE_UI_OPTIONS`). 표현 예외: `VFBCAI_QUESTION_CHOICE_EXPRESSION_MASTER_EXECUTION_RULE_v1.md` §3.1.

| 유형 | 기준 |
|------|------|
| **A 목록형** | 짧은 chip · **복수 선택** · 밀도 = **질문 문장** |
| **B 상황형** | 1인칭 · **1 choice = 1 fact** · 행동 갈라지는 축은 **양쪽 선택지** · `other`+aux(R3) 유지 |

**slug:** 값은 **가능하면 유지**. 분할 slug는 **신규** 열에 표기 (Layer J·manifest 동시 Mission).

---

### A1 `case01_evidence` (G) — 목록형

**질문 문장 (LOCK):** 지금 이 교통·행정 안내와 관련해, 확인하거나 제출에 활용할 **수 있는 자료**를 골라 주세요. **(여러 개 선택 가능)**

| slug | chip (짧은 이름) |
|------|------------------|
| `notice` | 교통국 통지·안내문 |
| `message` | 문자·메시지·이메일 |
| `submitted_docs` | 제출·접수·납부 증빙 |
| `photo_video` | 사진·영상·기타 자료 |
| `none` | 관련 자료 없음 *(단독 선택 — 구현 시 다른 chip과 상호 배타)* |

---

### A2 `case01_compareRecordGap` (J) — 목록형

**질문 문장 (LOCK):** 통지·안내 내용과 **비교·대조**하려면, 지금 **특히 없거나 부족한 것**을 골라 주세요. **(여러 개 선택 가능)**

| slug | chip |
|------|------|
| `cmp_missing_notice` | 통지·안내 사본 |
| `cmp_missing_calendar` | 일정·캘린더 기록 |
| `cmp_missing_receipt` | 접수·제출 증빙 |
| `cmp_missing_messages` | 연락·메시지 기록 |

---

### B1 `case01_factConflictFacet` (C) — 상황형 · 단일 선택

**질문:** 교통국이 말한 내용과 실제로 다르다고 보는 점은 무엇에 가장 가깝나요? *(기존 문장 유지)*

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `conflict_time` | 교통국이 말한 **날짜·시간**이 제가 기억하는 것과 **다릅니다**. | `axis_time` | **다음 행동:** 일정·기록 대조 |
| `conflict_place` | 교통국이 말한 **장소·위치**가 제가 있었던 곳과 **다릅니다**. | `axis_place` | **다음 행동:** 위치·경로 증거 |
| `conflict_violation_action` | **제가 했는지·위반했는지**에 대해 교통국 말과 **다르게 이해**합니다. | `axis_action` | **판단:** 행위 쟁점 |
| `conflict_vehicle_driver` | **차량·운전자**가 누구인지에 대해 교통국 말과 **다릅니다**. | `axis_attribution` | **다음 행동:** 등록·탑승 확인 |
| `conflict_other` | 위에 없는 **다른 차이**가 있습니다. *(→ R3 aux)* | `axis_other` | **다음 행동:** aux 원문 정리 |

**coverage:** 축 4종 + 기타(DI) — 날짜만/장소만/행동/귀속 분리.

---

### B2 `case01_spatiotemporalFacet` (D) — 상황형

**질문:** 그 날짜·장소·상황을 지금 어떤 방식으로 확인할 수 있나요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `st_has_records` | **기록·자료**로 확인할 수 있고, **지금 바로** 꺼낼 수 있습니다. | `verify_records` · `ready` | **다음 행동:** 자료 대조 |
| `st_has_records_pending` *(신규)* | **기록·자료**는 있지만, **아직 모아 두지 못했습니다**. | `verify_records` · `pending` | **다음 행동:** 수집·제출 |
| `st_witness_only` | **증인·동행자**에게만 물을 수 있고, **이미 연락했습니다**. | `verify_witness` · `contacted` | **판단:** 증언 확보 |
| `st_witness_only_pending` *(신규)* | **증인·동행자**는 있지만, **아직 연락하지 못했습니다**. | `verify_witness` · `not_contacted` | **다음 행동:** 연락·확인서 |
| `st_memory_only` | **기억**에 의존하고, **대략적인 순서**는 말할 수 있습니다. | `verify_memory` · `partial` | **다음 행동:** 메모·일정 |
| `st_memory_only_fuzzy` *(신규)* | **기억**만 있고, **날짜·순서**까지는 말하기 어렵습니다. | `verify_memory` · `fuzzy` | **위험:** 입증 공백 |
| `st_cannot_verify` | **지금은** 확인할 방법을 **모르겠습니다**. | `verify_blocked` · `no_path` | **다음 행동:** 확보 경로 탐색 |
| `st_cannot_verify_tried` *(신규)* | **찾아봤지만** 당시를 확인할 자료가 **없었습니다**. | `verify_blocked` · `searched_empty` | **판단:** 공백·대안 |

**분할 이유:** `st_has_records` vs `pending` · 증인 연락 여부 · 기억 선명도 · 미확인 vs 탐색 실패 — **다음 행동**이 갈라짐. *(구 4 slug는 읽기 호환 매핑 표 IMPLEMENTER)*

---

### B3 `case01_languageAccessFact` (K) — 상황형

**질문:** 안내를 이해하거나 확인할 때 언어·통역 때문에 막힌 부분이 있나요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `lang_none` | **언어·통역** 때문에 막힌 부분은 **없었습니다**. | `lang_ok` | — |
| `lang_partial_understanding` | **일부만** 이해했고, **다시 읽거나 들을 수 있는** 자료가 있습니다. | `lang_partial` · `can_recheck` | **다음 행동:** 원문·통역 재확인 |
| `lang_partial_no_source` *(신규)* | **일부만** 이해했고, **다시 확인할 원문**은 없습니다. | `lang_partial` · `no_source` | **위험:** 오해·추측 |
| `lang_need_interpreter` | **통역·공식 안내**가 필요합니다. | `lang_interpreter` | **다음 행동:** 통역·공식 문의 |
| `lang_indirect_hearsay` | **제3자·대행·통역**을 통해서만 들었고, **공식 통지 원문**은 없습니다. | `hearsay` · `no_official_copy` | **다음 행동:** 공식 통지 확보 |
| `lang_indirect_hearsay_copy` *(신규)* | **제3자·대행**을 통해 들었지만, **전달받은 문서·메시지**는 있습니다. | `hearsay` · `has_forwarded_copy` | **판단:** 전달본 vs 원문 |

**coverage:** 부분 이해 × 재확인 가능 · 간접 × 원문 유무 (R08 **K 단일 축** 유지).

---

### B4 `case01_unclearDemandFact` (U) — 상황형

**질문:** 기관 요구에서 가장 불명확한 부분은 무엇인가요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `unclear_what_violation` | **무엇을 위반했다고 하는지**는 아직 **정확히 모르겠습니다**. | `block_violation` | **판단:** 쟁점 |
| `unclear_what_action` | **지금 무엇을 해야 하는지**는 아직 **정확히 모르겠습니다**. | `block_action` | **다음 행동:** 요구 행위 확인 |
| `unclear_deadline` | **언제까지** 해야 하는지는 아직 **정확히 모르겠습니다**. | `block_deadline` | **위험:** 기한 |
| `unclear_who_authority` | **어느 기관·담당**인지는 아직 **정확히 모르겠습니다**. | `block_authority` | **위험:** 사칭·착오 |

---

### B5 `case01_noticeDeliveryFact` (L) — 상황형

**질문:** 교통국 안내를 처음 어떤 방식으로 받았나요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `del_in_person` | **대면**으로 안내를 받았습니다. | `channel_in_person` | **다음 행동:** 내용 메모·대조 |
| `del_phone_message` | **전화·문자**로 안내를 받았습니다. | `channel_remote` | **다음 행동:** Q(단계)·기록 보존 |
| `del_written_only` | **문서·서면**만 받았고, **내용은 일부만** 이해했습니다. | `channel_written` · `partial_read` | **다음 행동:** 문구·통역 |
| `del_written_read` *(신규)* | **문서·서면**을 받았고, **요지는 읽었습니다**. | `channel_written` · `read_ok` | **판단:** Q(단계) 후속 |
| `del_not_received_yet` | **아직** 통지·안내를 **받지 못했습니다**. | `channel_none` | **다음 행동:** 수령 경로 |

---

### B6 `case01_procedureStageFact` (Q) — 상황형

**질문:** 이 안내가 처음 통지에 가깝나요, 추가·재통지에 가깝나요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `stage_first_notice` | **처음 받는** 안내에 가깝습니다. | `stage_first` | **판단:** 초기 기한 |
| `stage_followup_notice` | **이전에도** 안내를 받았고, **이번은 추가·재통지**에 가깝습니다. | `stage_followup` | **다음 행동:** 이전 안내 대조 |
| `stage_unsure_first` *(신규)* | **처음인지 추가인지**는 **모르겠고**, 다른 안내를 **받은 기억이 없습니다**. | `stage_unknown` · `no_prior_memory` | **다음 행동:** 이력 정리 |
| `stage_unsure_many` *(신규)* | **여러 번** 안내를 받았지만, **지금이 몇 번째 단계인지** 모르겠습니다. | `stage_unknown` · `prior_exists` | **위험:** 누적·중복 |

*(구 `stage_unsure` → 위 2 slug 분할)*

---

### B7 `case01_officeIdentityFact` (O) — 상황형

**질문:** 안내를 준 기관·부서·담당을 어떻게 확인하고 있나요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `office_named_clear` | **기관·부서 이름**을 알고 있고, **문서·안내에도 같이** 적혀 있습니다. | `office_clear` | **다음 행동:** 해당 부서 연락 |
| `office_name_only` | **이름만** 알고 있고, **담당·주소·번호**는 아직 확인하지 못했습니다. | `office_name_only` | **다음 행동:** 연락처 확인 |
| `office_unknown` | **어느 기관**인지 **확인하지 못했습니다**. | `office_unknown` | **위험:** 사칭 |
| `office_wrong_suspect` | **다른 기관** 안내일 **수도 있다**고 느낍니다. | `office_mismatch` | **다음 행동:** 문서·번호 대조 |

---

### B8 `case01_correctTargetFact` (T) — 상황형

**질문:** 수정·확인하라고 한 대상은 무엇에 가깝나요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `tgt_identity_record` | **제 신원·등록 정보**를 고치라는 쪽에 가깝습니다. | `tgt_identity` | **다음 행동:** 등록 서류 |
| `tgt_submission_content` | **제가 제출한 내용·서류**를 고치라는 쪽에 가깝습니다. | `tgt_submission` | **다음 행동:** 제출본 대조 |
| `tgt_vehicle_record` | **차량·운전 관련 기록**을 고치라는 쪽에 가깝습니다. | `tgt_vehicle` | **다음 행동:** 차량 정보 |
| `tgt_other` | 위에 없는 **다른 대상**입니다. *(DI)* | `tgt_other` | **다음 행동:** aux |

---

### B9 `case01_attendInstructionFact` (M) — 상황형

**질문:** 출석·소명 안내에서 가장 분명한 내용은 무엇인가요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `att_date_place_stated` | **출석 날짜·시간·장소**가 **모두** 안내에 있습니다. | `att_full` | **다음 행동:** 일정·장소 확인 |
| `att_date_place_partial` *(신규)* | **날짜·시간**은 있는데 **장소**는 아직 **모르겠습니다**. | `att_date_ok` · `place_unknown` | **다음 행동:** 장소 문의 |
| `att_window_only` | **기간만** 있고 **구체 날짜·시간**은 없습니다. | `att_window` | **다음 행동:** 일정 재확인 |
| `att_place_unknown` | **출석하라는 것**은 알겠는데 **장소**를 **모르겠습니다**. | `att_place_unknown` | **다음 행동:** 장소 문의 |
| `att_content_unclear` | **왜 출석·소명**해야 하는지 **요지**를 모르겠습니다. | `att_purpose_unknown` | **다음 행동:** 범위 확인 |

**coverage:** 일시·장소·기간·요지 분리 — `att_date_place_stated` vs `partial` 행동 갈림.

---

### B10 `case01_supplementInstructionFact` (S) — 상황형

**질문:** 보완·재제출 안내의 핵심은 무엇인가요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `sup_missing_docs_list` | **빠진 서류 목록**이 있고, **무엇을 추가로 낼지** 대략 알겠습니다. | `sup_list` · `scope_ok` | **다음 행동:** 목록 대조 제출 |
| `sup_missing_docs_unclear` *(신규)* | **빠진 서류 목록**은 있지만 **제 경우에 맞는지** 모르겠습니다. | `sup_list` · `scope_unclear` | **판단:** 보완 범위 |
| `sup_replace_docs` | **이미 낸 서류를 바꿔** 다시 내야 한다고 이해합니다. | `sup_replace` | **다음 행동:** 기존 제출 대조 |
| `sup_content_add` | **내용을 더 적어** 넣거나 **추가 설명**이 필요하다고 이해합니다. | `sup_add` | **다음 행동:** 추가분 작성 |
| `sup_scope_unclear` | **무엇을 보완**해야 하는지 **전체가** 아직 모르겠습니다. | `sup_scope_unknown` | **다음 행동:** 범위 문의 |

---

### B11 `case01_paymentInstructionFact` (P) — 상황형

**질문:** 납부 안내의 성격은 무엇에 가깝나요? *(금액·방법은 CASE_02)*

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `pay_type_fine` | **벌금·과태료**를 내라는 쪽에 가깝게 이해합니다. | `pay_fine` | **판단:** 이의·납부 |
| `pay_type_fee` | **수수료·비용**을 내라는 쪽에 가깝게 이해합니다. | `pay_fee` | **판단:** 항목 확인 |
| `pay_type_mixed` | **여러 항목**이 섞여 있다고 이해합니다. | `pay_mixed` | **다음 행동:** 항목 분리 |
| `pay_type_unclear` | **무슨 종류의 납부**인지는 아직 **모르겠습니다**. | `pay_unclear` | **다음 행동:** 고지 문구 |

---

### B12 `case01_authorityFollowUpKind` (Ff) — 상황형

**질문:** 대응 후 교통국에서 어떤 회신·재요구를 받았나요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `completed` | **추가 요구 없이** 처리·검토가 **진행된다**고 들었습니다. | `followup_complete` | **판단:** 대기·결과 |
| `more_required` | **추가 서류·자료**를 요청했고, **무엇인지** 대략 알겠습니다. | `followup_more_docs` · `clear` | **다음 행동:** 제출 |
| `more_required_vague` *(신규)* | **추가 서류·자료**를 요청했지만 **무엇인지** 모르겠습니다. | `followup_more_docs` · `vague` | **다음 행동:** 요구 확인 |
| `re_attendance` | **다시 출석·설명**하라고 했습니다. | `followup_attend` | **다음 행동:** 일정·장소 |
| `payment_demand` | **납부·다른 조치**를 안내했습니다. | `followup_payment` | **판단:** CASE_02 연계 |
| `no_reply_yet` | **아직 답변**을 받지 못했습니다. | `followup_silent` | **다음 행동:** 접수·재문의 |
| `reply_unclear` *(신규)* | **답변·연락**은 있었지만 **무슨 뜻인지** 모르겠습니다. | `followup_reply` · `unclear` | **판단:** 해석·재확인 |

---

### B13 `case01_blockage` (H) — 상황형

**질문:** 지금 이 문제에서 다음 대응을 하기 가장 어려운 이유는 무엇인가요?

| slug | 선택지 (1인칭) | 신호 | downstream |
|------|----------------|------|------------|
| `content_unclear` | 받은 안내를 **제 상황에 맞게 이해·정리**하기 어렵습니다. | `block_understand` | **판단:** U·K 연계 |
| `how_respond` | **어떻게 대응**해야 할지 **다음 조치**가 불분명합니다. | `block_how` | **다음 행동:** 요구 확인 |
| `next_step` | **이미 문의·제출**했는데 **다음에 무엇을** 해야 할지 모르겠습니다. | `block_after_action` | **판단:** Ff 연계 |
| `facts_why` | **어떤 사실을 어떤 순서로** 설명·소명해야 할지 정리되지 않았습니다. | `block_facts` | **다음 행동:** 사실 목록 |
| `evidence` | **어떤 자료**로 확인·제출해야 할지 막혀 있습니다. | `block_evidence` | **다음 행동:** G·J 연계 |

*(현행 문장형 유지·slug 동일 — F12 「단답 카테고리」 아님)*

---

### 부록 A 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-09-25 | 부록 A v1 — F12 §7 v3 동형 선택지 원문 (목록 2 · 상황 11문항) |

---

*2026-09-25. 2번창 — CASE_01 질문 보강 Brief v3 (문서만).*
