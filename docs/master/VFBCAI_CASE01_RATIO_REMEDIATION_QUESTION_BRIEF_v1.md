# CASE_01 질문 보강 Brief — LOCK 비율 4:6 (DQ-V04 = C)

| 항목 | 내용 |
|------|------|
| **버전** | v1 |
| **상태** | **Brief** — Ace 승인 전 IMPLEMENTER 착수 금지 |
| **Mission** | CASE_01 **3개 검증 경로** 모두 LOCK **4:6 실질 축 하한** 충족 (3:7 필수 아님) |
| **승인 방식** | **DQ-V04 = C** — (1) 기존 장식 질문 **실질 전환** 우선 (2) 부족 경로만 신규 질문 |
| **감사 SoT** | `VFBCAI_ADMIN_VERIFY_COMMON_RESULT_AUDIT_v1.md` §6 · `VFBCAI_CASE01_INFORMATION_COMPLETENESS_AUDIT_v1.md` |
| **비율 LOCK** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` — 실질 축만, 장식 제외 |
| **표현** | `VFBCAI_QUESTION_CHOICE_EXPRESSION_MASTER_EXECUTION_RULE_v1.md` — 다중신호 압축 문장 |
| **결과 연동** | `VFBCAI_ADMIN_VERIFY_COMMON_RESULT_AUDIT_v1.md` Layer A~J (구현은 별도 Mission과 병행 가능) |
| **관계** | `VFBCAI_CASE01_FULL_ENHANCEMENT_STEP2-1_MISSION_BRIEF_v1.md`와 **동일 방향** — 본 Brief는 **비율 FAIL 해소**에 필요한 질문·축을 경로 3건으로 **고정 표** |

**폐기·대체 아님:** STEP2-1 Full Enhancement LOCK은 유지. 본 Brief는 §6 **FAIL 확정** 이후 **질문 보강 전용** 산출물.

---

## 0. Mission 한 줄

장식 text·scope·note-only·값 미분화 choice를 **구조화 choice + 보조 1줄**로 바꿔 Profile·needs*·결과·다음 행동이 **선택마다 달라지게** 하고, **C01-P1-typical / gap / brief** 각각 Phase2 실질 축이 4:6 하한 이상이 되도록 한다.

---

## 1. DESIGN QUESTION — Ace 승인 전제

| ID | 결정 | 요약 |
|----|------|------|
| **DQ-V04** | **C** | 장식 → 실질 전환 **먼저** · 부족분만 신규 질문 |
| **DQ-C01-R01** | **P1 유지** | Phase1 실질 **5** (typical·brief) / **6** (gap, `case01_factCompareGap` 포함) — P1 축 **증가 없음** |
| **DQ-C01-R02** | **4:6만 게이트** | 3:7(⌈N×7/3⌉) Mission **필수 아님** (Full Enhancement DQ-C01-E04 동일) |
| **DQ-C01-R03** | **text 축 금지** | DI textarea **단독 실질 축** 불가. choice가 축; DI는 `other`·특정 slug **보조 1줄**만 |

---

## 2. 경로별 비율 — 현재 → 보강 후

**하한:** P2 ≥ ⌈P1×6/4⌉ · **PASS:** 보강 후 P2 ≥ 하한 **이고** 각 경로에서 ②~④ 통과 축만 합산.

| 경로 ID | 시나리오 (SoT) | P1 (현재) | P2 (현재) | 4:6 하한 | P2 (보강 후) | 4:6 |
|---------|----------------|-----------|-----------|----------|--------------|-----|
| **C01-P1-typical** | `fullChainResponded` / FULL_CHAIN rich | 5 | 6 | **8** | **8** | **PASS** |
| **C01-P1-gap** | `fullChainGapUnclear` / V4-B + `factCompareGap` | 6 | 6 | **9** | **9** | **PASS** |
| **C01-P1-brief** | `briefV1A` — `no_contact_yet` · Phase2 4스텝 | 5 | 4 | **8** | **8** | **PASS** |

**보강 후 P2 산정 요약 (실질 축 id):**

| 경로 | 보강 후 Phase2 실질 축 (8 또는 9개) |
|------|-------------------------------------|
| typical | `authorityDemand` · `actualSituation` · `case01_spatiotemporalFacet` · `case01_factConflictFacet` · `responseDetail` · `case01_authorityFollowUpKind` · `evidence` · `blockage` |
| gap | `authorityDemand` · `actualSituation` · `responseDetail` · `case01_authorityFollowUpKind` · `case01_clarityRecoveryStep` · `case01_hearsayVerifyStep` · `evidence` · `blockage` · `case01_compareReadiness` |
| brief | `authorityDemand` · `actualSituation` · `case01_attendanceReadiness` · `case01_noticeHoldStatus` · `evidence` · `case01_evidenceUsability` · `blockage` · `case01_firstMovePriority` |

**제거·흡수 (화면 walk 감소, 비율은 실질화로 상쇄):** `case01_paymentDemandScope` · `case01_supplementDemandScope` (→ `authorityDemand` choice) · 단독 `case01_factDifferenceDetail` · `case01_datePlaceDetail` · `case01_authorityResponseNote` textarea 축.

---

## 3. 전환 — 장식 → 실질 (공통·경로별)

표 열: **현재** → **바뀐 질문** → **선택지(slug 요약)** → **선택별 판단·다음 행동·위험도** → **결과 Layer**.

### 3.1 `case01_paymentDemandScope` (typical 등) — **흡수·제거**

| 항목 | 내용 |
|------|------|
| **현재** | 별도 choice 「핵심 vs 추가 요구」 — `core_case` 외 **장식** |
| **바뀐 질문** | `case01_authorityDemand` **압축 choice**에 scope 포함 (STEP2-1 DQ-C01-E02) |
| **새 선택지 (예)** | `payment_core_case` · `payment_bundled_guidance` · `payment_scope_unsure` — 각 label은 납부·벌금·핵심 사건·추가 안내를 **한 문장**에 압축 |
| **선택별 차이** | `payment_core_case` → 재분류 CASE_02 가중 · result action 「납부·금액·기한 대조」 · risk 「핵심 사건 납부」 / `bundled` → CASE_02 약화 · action 「안내 묶음 확인」 / `unsure` → blockage `content_unclear` · unconfirmed 「요구 범위」 |
| **Layer** | **G** integrated slug · **J** authority clause · **B** footnote 짧게 |

### 3.2 `case01_factDifferenceDetail` (text) → `case01_factConflictFacet` (choice + 보조 1줄)

| 항목 | 내용 |
|------|------|
| **현재** | textarea — Profile·분기 없음 (**④ 장식**) |
| **바뀐 질문** | 「교통국이 말한 내용과 실제로 달랐다고 느끼는 부분은 무엇에 가장 가깝나요?」 |
| **선택지** | `conflict_speed_amount` · `conflict_location` · `conflict_action_not_done` · `conflict_time_window` · `conflict_mixed` + DI 보조 1줄 (`other`) |
| **선택별 차이** | 각 slug → `actualSituation`/`factRelationship` **구조화 fragment** · `evidence` needs (`photo_video` vs `message`) · Phase2 `blockage` 가중 (`facts_why` vs `content_unclear`) · result caution/action **slug별 분리** (속도·장소·미행·시간대) |
| **경로** | **typical** on (`date_place_wrong` / deny paths). **gap/brief** off-path 시 **미노출** (축 미카운트) |
| **Layer** | **A** 보조 1줄만 요약 · **F** Profile manifest · **J** fact clause |

**고객向 label (다중신호 예 — `conflict_speed_amount`):**  
「통지나 설명에서는 속도·금액·과태료처럼 **수치·비용**이 문제라고 들었는데, 제가 기억하는 그 시간대 운행·납부 상황과 맞지 않습니다.」

### 3.3 `case01_datePlaceDetail` (text) → `case01_spatiotemporalFacet` (choice + 보조 1줄)

| 항목 | 내용 |
|------|------|
| **현재** | textarea — Profile 미반영 (**④**) |
| **바뀐 질문** | 「그날 실제로 있었던 곳·한 일을 지금 어떤 수준까지 확인할 수 있나요?」 |
| **선택지** | `st_has_alibi_place` · `st_date_wrong_place_ok` · `st_place_wrong_date_ok` · `st_calendar_uncertain` · `st_no_records_yet` + DI 1줄 |
| **선택별 차이** | `st_has_alibi_place` → evidence `photo_video`·`message` 우선 · action 「일정·동행·사진 대조」 · risk 「반박 단서 확보」 / `st_no_records_yet` → action 「기록·접수증 확보」 · `currentBlockage` → `facts_why` / … |
| **경로** | **typical** (`date_place_wrong`). others off |
| **Layer** | **A** · **J** · **I** Phase2 risk slug |

### 3.4 `case01_authorityResponse` + `case01_authorityResponseNote` → `case01_authorityFollowUpKind`

| 항목 | 내용 |
|------|------|
| **현재** | choice + note text — note는 **별도 walk**, 실질 축 이중·미분화 |
| **바뀐 질문** | 「교통국이 그 뒤 다시 요구하거나 답한 내용은 무엇에 가장 가깝나요?」 (`more_required` 등 **선행** `authorityResponse` 유지 또는 **흡수** — IMPLEMENTER는 **한 축**으로 카운트) |
| **선택지** | `followup_more_docs` · `followup_reexplain` · `followup_schedule` · `followup_payment_repeat` · `followup_no_clear_reply` · `followup_other` + DI 1줄 |
| **선택별 차이** | `more_docs` → evidence gate · action 「제출 목록 정리」 · expert 톤 / `payment_repeat` → CASE_02 재분류 가중 · `no_clear_reply` → risk 「기관 무응」 · `repeatFollowUp` 유사 신호 |
| **경로** | typical · gap (`has_responded`). brief **off** |
| **Layer** | **H** 첨부와 병기 · **J** authority response clause |

### 3.5 `case01_evidence` — 값별 실질화 (질문 id **유지**, 축 **1개**이나 ②~④ PASS)

| 항목 | 내용 |
|------|------|
| **현재** | 종류만 바꿔도 needs·result 동일 (**④** 값 장식) |
| **바뀐 질문** | 동일 id — **label·options** 압축 재작성 (STEP2-0 §5) |
| **선택지** | `photo_video` · `notice` · `message` · `submitted_docs` · `witness` · `none_yet` + DI |
| **선택별 차이** | `photo_video` → needs `date_place` facet · action 「촬영·위치 대조」 / `notice` → action 「통지 문구 확인」 / `none_yet` → risk 「증거 공백」 · blockage 가중 / … |
| **경로** | **전 경로** |
| **Layer** | **D** metric title · **J** evidence clause |

### 3.6 `case01_blockage` — 값별 실질화

| 항목 | 내용 |
|------|------|
| **현재** | Profile만 · result 값 미분화 |
| **바뀐 질문** | 동일 id — options를 **막힘 유형**별 다음 행동과 연결 |
| **선택지** | `facts_why` · `content_unclear` · `deadline_unclear` · `language_barrier` · `afraid_mistake` + DI |
| **선택별 차이** | 각각 **다른** `actions[]` 1순위 · `unconfirmed[]` · Phase2 `finalGoal` 조건부 on/off |
| **경로** | **전 경로** |
| **Layer** | **J** blockage slot · **C** narrative slot |

### 3.7 `case01_authorityDemand` on **gap** — `demand_unclear` 실질화

| 항목 | 내용 |
|------|------|
| **현재** | unclear → `authorityDemandDetail` 장식 |
| **바뀐 질문** | `case01_clarityRecoveryStep` **신규** (§4.1) — unclear·gap 경로 전용 |
| **관계** | `authorityDemand` 축은 유지; **추가 축 1**은 §4에서 카운트 |

---

## 4. 신규 질문 (부족 경로만)

### 4.1 Gap 경로 전용 (+3 실질 축, P2 6→9)

| id | 질문 문구 | 노출 조건 | 선택지 (slug) | 판단·행동·위험 차이 | Layer |
|----|-----------|-----------|---------------|---------------------|-------|
| `case01_clarityRecoveryStep` | 「지금 가장 먼저 밝혀야 할 것은 무엇에 가깝나요?」 | `authorityDemand=demand_unclear` 또는 gap P1 | `recv_what_violation` · `recv_what_to_do` · `recv_deadline` · `recv_whether_applies` | unconfirmed·action·risk **4갈래** | J · A |
| `case01_hearsayVerifyStep` | 「간접으로 들은 안내를 확인하려면 무엇부터 하시겠나요?」 | `factCompareGap=gap_hearsay_channel` | `verify_get_notice` · `verify_call_authority` · `verify_ask_interpreter` · `verify_compare_message` | evidence needs · CASE_06 가중 해제/유지 | G · J |
| `case01_compareReadiness` | 「통지·설명과 제 기억을 맞춰 볼 준비는 어디까지 되었나요?」 | `cannot_compare_yet` + Phase2 tail | `ready_with_calendar` · `need_documents` · `need_interpreter` · `not_ready_yet` | Phase2 complete gate · expert handoff 톤 | J · F |

### 4.2 Brief 경로 전용 (+4 실질 축, P2 4→8)

| id | 질문 문구 | 노출 조건 | 선택지 (slug) | 판단·행동·위험 차이 | Layer |
|----|-----------|-----------|---------------|---------------------|-------|
| `case01_attendanceReadiness` | 「출석·소명 요구를 받은 뒤, 지금 실제로 가능한 상태에 가장 가깝나요?」 | `authorityDemand=attend_explain` · `no_contact_yet` | `can_attend_with_notice` · `need_schedule` · `need_interpreter` · `cannot_attend_yet` | action 출석 준비 vs 기한 리스크 | J · C |
| `case01_noticeHoldStatus` | 「교통국 통지·문자·안내 자료는 지금 어떤 상태인가요?」 | brief tail | `hold_original` · `hold_photo_copy` · `hold_message_only` · `hold_lost` | evidence `notice`/`message` · unconfirmed | A · H |
| `case01_evidenceUsability` | 「가진 자료로 지금 당장 설명을 시작할 수 있나요?」 | evidence answered | `use_now` · `need_translate` · `need_organize` · `not_usable_yet` | action·blockage 연동 | J |
| `case01_firstMovePriority` | 「아직 연락하지 않은 상태에서 가장 먼저 하려는 일은 무엇인가요?」 | `no_contact_yet` · before `blockage` | `move_call` · `move_gather_docs` · `move_ask_help` · `move_wait_deadline` | customerAction 보조 · risk 미대응 | J · C |

**typical 경로:** §3.2·3.3 전환만으로 +2 축 (`factConflictFacet` · `spatiotemporalFacet`) — **신규 id 없음**.

---

## 5. 결과 화면 반영 (Layer A~J)

| Layer | 본 Brief 구현 시 |
|-------|------------------|
| **A** | 구조화 choice의 **보조 1줄**·첨부 파일명만 「응답 요약」; full label은 카드 footnote 1회 |
| **B** | keyMetrics footnote = 짧은 facet 라벨; §03 판단 = clause |
| **C** | `formatJudgmentClause` — facet slug→문장 (판단 문장 목록 **코드 반영 전** Ace 검토) |
| **D** | facet별 카드 제목 manifest (`spatiotemporalFacet` 등) |
| **E** | `{fieldId}Note` · 보조 text 키 persist whitelist |
| **F** | 신규 facet → `buildCaseResolutionProfile` 칸 매핑 테이블 **필수** |
| **G** | integrated·재분류는 `authorityDemand` 흡수 slug만 |
| **H** | `첨부 자료: 파일명` in A |
| **I** | Phase2 risk = facet slug 정렬 |
| **J** | 전 field slug coverage; **표현만 바꾼 장식 금지** — needs* diff CI |

---

## 6. IMPLEMENTER 범위 (참고)

| 파일 | 내용 |
|------|------|
| `adminVerifyProfiling.ts` | OPTIONS · needs* · Profile · `CASE01_ANSWER_KEYS` · path complete · 신규 id |
| `AdminVerifyFirstResultPanel.tsx` | signals · integrated · Layer J 연동 |
| `tests/qa/case01-phase2-chain-count.mjs` | 3경로 **실질 축** assert (≥8 / ≥9 / ≥8) |

**금지:** 화면 질문 수만 늘리기 · truncate-only result · Master LOCK 문서 편집 · CASE_06 bridge 변경.

---

## 7. VERIFIER 완료 조건

1. **브라우저** 3경로 — PC + 375px.  
2. 각 경로 **Phase2 실질 축** 카운트 (②~④, v1.1 §6 규칙) ≥ 하한.  
3. 장식 전환 축: 선택 A/B 바꿨을 때 **서로 다른** action 또는 risk 또는 unconfirmed **1개 이상** diff (스크린·로그).  
4. `npx tsc --noEmit` — 참고.

| 경로 | 실질 P2 최소 | 증거 fixture |
|------|--------------|--------------|
| C01-P1-typical | **8** | `fullChainResponded` 갱신 |
| C01-P1-gap | **9** | `fullChainGapUnclear` / V4-B |
| C01-P1-brief | **8** | `briefV1A` |

---

## 8. 인용 — 비율 FAIL 확정

`VFBCAI_ADMIN_VERIFY_COMMON_RESULT_AUDIT_v1.md` §6.1 — C01-P1-typical **4:6 부족 2** · gap **3** · brief **4**. 본 Brief는 **보강 후 PASS**를 목표로 한다.

---

*2026-09-25. 2번창 — CASE_01 질문 보강 Brief v1 (문서만).*
