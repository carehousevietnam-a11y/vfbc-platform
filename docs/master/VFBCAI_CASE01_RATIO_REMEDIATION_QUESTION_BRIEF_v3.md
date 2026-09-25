# CASE_01 질문 보강 Brief — LOCK 비율 4:6 (DQ-V04 = C) v3

| 항목 | 내용 |
|------|------|
| **버전** | v3 |
| **상태** | **Brief** — Ace 승인 전 IMPLEMENTER 착수 금지 |
| **선행** | v2(`4364373`) **대체** |
| **Mission** | 사실 기반 노출만으로 Phase2 실질 축·4:6 **측정·표시** (미달 조합 **숨기지 않음**) |
| **승인 방식** | **DQ-V04 = C** |
| **감사·표현·결과** | v2와 동일 SoT |

**v3 변경:** (1) **비율 보정 게이트 전면 삭제** (2) **노출 조건 1줄 확정 + 30조합 표** (3) **선택지별 효과 표** · **제3자/간접 청취 신호 K 단일화**

---

## 0. Mission 한 줄

질문 노출은 **고객 답(사실)만**으로 결정한다. P2 개수로 질문을 **끼워 넣지 않는다**. 30개 조합마다 실질 축을 **정확히 세어** 4:6 **PASS/미달**을 표시하고, 미달은 **추가 사실 질문 설계**로만 해소한다.

---

## 1. DESIGN QUESTION (v2 유지 + v3)

| ID | 결정 |
|----|------|
| **DQ-V04** | **C** |
| **DQ-C01-R01~R06** | v2 동일 |
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

**4:6:** P2 ≥ ⌈P1×6/4⌉ → P1=5 하한 **8**, P1=6 하한 **9**.

| # | R | D | F | P1 | Phase2 실질 축 (기호 순) | P2 | 하한 | 4:6 |
|---|-----|-----|-----|-----|---------------------------|-----|------|-----|
| 1 | has_responded | payment | match | 5 | A,B,G,H,E,Ff,P | 7 | 8 | **미달** |
| 2 | has_responded | payment | date_place | 5 | A,B,C,D,G,H,E,Ff,P | 9 | 8 | PASS |
| 3 | has_responded | payment | cannot_compare | 6 | A,B,D,G,H,J,K,E,Ff,P | 9 | 9 | PASS |
| 4 | has_responded | attend | match | 5 | A,B,G,H,E,Ff,M | 7 | 8 | **미달** |
| 5 | has_responded | attend | date_place | 5 | A,B,C,D,G,H,E,Ff,M | 9 | 8 | PASS |
| 6 | has_responded | attend | cannot_compare | 6 | A,B,D,G,H,J,K,E,Ff,M | 9 | 9 | PASS |
| 7 | has_responded | supplement | match | 5 | A,B,G,H,E,Ff,S | 7 | 8 | **미달** |
| 8 | has_responded | supplement | date_place | 5 | A,B,C,D,G,H,E,Ff,S | 9 | 8 | PASS |
| 9 | has_responded | supplement | cannot_compare | 6 | A,B,D,G,H,J,K,E,Ff,S | 9 | 9 | PASS |
| 10 | has_responded | correct | match | 5 | A,B,G,H,E,Ff,T | 7 | 8 | **미달** |
| 11 | has_responded | correct | date_place | 5 | A,B,C,D,G,H,E,Ff,T | 9 | 8 | PASS |
| 12 | has_responded | correct | cannot_compare | 6 | A,B,D,G,H,J,K,E,Ff,T | 9 | 9 | PASS |
| 13 | has_responded | unclear | match | 5 | A,B,G,H,E,Ff,U,K | 8 | 8 | PASS |
| 14 | has_responded | unclear | date_place | 5 | A,B,C,D,G,H,E,Ff,U,K | 10 | 8 | PASS |
| 15 | has_responded | unclear | cannot_compare | 6 | A,B,D,G,H,J,K,E,Ff,U | 10 | 9 | PASS |
| 16 | no_contact | payment | match | 5 | A,B,G,H,L,Q,O,P | 8 | 8 | PASS |
| 17 | no_contact | payment | date_place | 5 | A,B,C,D,G,H,L,Q,P | 8 | 8 | PASS |
| 18 | no_contact | payment | cannot_compare | 6 | A,B,D,G,H,J,K,L,Q,P | 9 | 9 | PASS |
| 19 | no_contact | attend | match | 5 | A,B,G,H,L,Q,O,M | 8 | 8 | PASS |
| 20 | no_contact | attend | date_place | 5 | A,B,C,D,G,H,L,Q,M | 8 | 8 | PASS |
| 21 | no_contact | attend | cannot_compare | 6 | A,B,D,G,H,J,K,L,Q,M | 9 | 9 | PASS |
| 22 | no_contact | supplement | match | 5 | A,B,G,H,L,Q,O,S | 8 | 8 | PASS |
| 23 | no_contact | supplement | date_place | 5 | A,B,C,D,G,H,L,Q,S | 8 | 8 | PASS |
| 24 | no_contact | supplement | cannot_compare | 6 | A,B,D,G,H,J,K,L,Q,S | 9 | 9 | PASS |
| 25 | no_contact | correct | match | 5 | A,B,G,H,L,Q,O,T | 8 | 8 | PASS |
| 26 | no_contact | correct | date_place | 5 | A,B,C,D,G,H,L,Q,T | 8 | 8 | PASS |
| 27 | no_contact | correct | cannot_compare | 6 | A,B,D,G,H,J,K,L,Q,T | 9 | 9 | PASS |
| 28 | no_contact | unclear | match | 5 | A,B,G,H,L,Q,U,K | 8 | 8 | PASS |
| 29 | no_contact | unclear | date_place | 5 | A,B,C,D,G,H,L,Q,U,K | 9 | 8 | PASS |
| 30 | no_contact | unclear | cannot_compare | 6 | A,B,D,G,H,J,K,L,Q,U | 9 | 9 | PASS |

**요약:** 30조합 중 **PASS 24** · **미달 6** (전부 `has_responded` × `match` × payment/attend/supplement/correct — **#1·4·7·10**).  
**v2 오류 정정:** `has_responded` 행에 **L 없음** · #2 등 **9축은 9로 표기** · Cmp+unclear **10축은 10 표기**.

### 5.1 미달 4조합 — 후속 (Ace 승인 2026-09-25)

**승인:** Brief v3 전체 승인 (`6a57075`). **정확한 축 개수**는 IMPLEMENTER가 `case01Phase2SubstantiveAxisIdsOnPath` 등으로 **코드 전수 계산** · VERIFIER가 §5 표와 대조. **본 문서 §5 표·개수는 더 수정하지 않음.**

| 조합 (#1·4·7·10) | 부족 |
|------------------|------|
| `has_responded` × payment / attend / supplement / correct × `match` | P2=7, P1=5, 하한 8 (**1축**) |

**추가 질문 (LOCK):** `case01_demandFulfillmentFact` — 「기관이 요구한 조치를 **이행했는지**, 그리고 **남아 있는 증빙**은 무엇인가요?」(요구 **이행 완료 여부와 증빙**)

| 항목 | 내용 |
|------|------|
| **노출 (사실만)** | `case01_customerResponded` = `has_responded` **AND** `case01_factRelationship` = `match` **AND** `case01_authorityDemand` ∈ {`payment`, `pay_core_traffic`, `pay_bundled`, `attend_explain`, `attendance`, `supplement`, `supplement_core`, `correct_record`} |
| **비율 게이트** | **없음** — 위 사실 조건일 때만 노출 |

**선택지 (slug · 효과 요약):**

| slug | 판단 | 다음 행동 | 위험도 |
|------|------|-----------|--------|
| `fulfill_complete_with_proof` | 요구 조치 **완료**, 영수증·접수증 등 **증빙 있음** | 기관 제출·대조 | 이중 납부·재부과 **상대적 낮음** |
| `fulfill_complete_no_proof` | 완료했으나 **증빙 없음** | 영수증·접수증·처리 확인서 **확보** | **이중 납부·재부과** |
| `fulfill_partial` | **일부만** 이행 | 미이행 항목·기한·범위 확인 | **기한 경과·재부과** |
| `fulfill_not_yet` | **아직 이행 안 함** | 요구 범위·기한 정리 후 대응 | **미이행·기한 경과** |

**역할 구분 (1줄):** `case01_responseDetail`의 `fulfilled_demand` = 교통국에 **어떤 형태로 대응했는지**(설명·제출·이의·「안내 처리」 등 **행동 유형**). `case01_demandFulfillmentFact` = 그 요구에 대해 **실제 이행이 어디까지 됐고 증빙이 있는지**(완료/부분/미이행 × 증빙). **동시 노출 가능**, 문항·Profile·결과에서 **역할 혼합 금지**.

**금지 (v3):** 미달을 **Q/O/L 강제 노출**로 메우기 · P2 산출 후 질문 추가.

### 5.2 커버리지 규칙 (v3)

1. 노출은 **§3 표만** 사용.  
2. `case01Phase2SubstantiveAxisIdsOnPath(answers)` = §3 조건 충족 id 집합.  
3. 조합 표는 **미달을 PASS로 바꾸지 않음**.  
4. fixture: `fullChainResponded`≈#2 · `fullChainGapUnclear`≈#15 · `briefV1A`≈#19.

---

## 6. Layer A~J · VERIFIER · IMPLEMENTER

v2 §7~9 동일. VERIFIER 추가: **30행 표와 산출 함수 일치** · **미달 6건 회귀 테스트** (PASS로 오표기 금지).

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

*2026-09-25. 2번창 — CASE_01 질문 보강 Brief v3 (문서만).*
