# RE 1차 결과 M-4 짧은 표현 제안 (Pack 반영 전)

`pack-RE01.md` §3에는 **예시 1조합**과 `st_*` 다음 행동만 값별로 정의되어 있고, `re01_confirm_goal`·`re01_owner_doc_check`·`re01_contract_type` 값별 짧은 표현 표는 **없다**. 아래는 §3 문장 틀·예시 문장·§1 선택지 의미를 근거로 한 **제안**이다. 대표 승인 후 `pack-RE01.md` §3에 동일 표를 추가하고 `parse-real-estate-meta.mjs` 재생성으로 `m45.ts`에 반영한다.

## RE01 — `re01_contract_type` (틀: `[계약 종류]를 앞두고`)

| value | 제안 짧은 표현 | 근거 |
|-------|----------------|------|
| `r1_ct_lease_home` | 살 집을 빌리는 임대차 계약 | pack-RE01 §3 예시·기존 `m45` lookup |
| `r1_ct_lease_office` | 사무실·상가 임대차 계약 | §1 `ct_lease_office` 의미 |
| `r1_ct_purchase_project` | 분양 아파트 매매 계약 | §1 `ct_purchase_project` 의미 |
| `r1_ct_purchase_resale` | 기존 주택·아파트 매매 계약 | §1 `ct_purchase_resale` 의미 |
| `r1_ct_deposit_only` | 계약금 약정(đặt cọc) 단계 | §1 `ct_deposit_only` 의미 |

## RE01 — `re01_progress_stage` (틀: `현재 [진행 단계] 상태입니다`)

| value | 제안 짧은 표현 | 근거 |
|-------|----------------|------|
| `r1_st_viewing` | 집을 보고 조건만 들었고, 계약서나 서류는 아직 받지 못한 상태 | §3 `st_viewing` 다음 행동·§1 선택지 |
| `r1_st_draft` | 계약서 초안을 받은 뒤 아직 서명이나 송금은 하지 않은 상태 | §3 예시 문장 |
| `r1_st_deposit_requested` | 계약서에 서명하기 전에 계약금부터 먼저 보내라는 요청을 받은 상태 | §1 선택지 요약 |
| `r1_st_deposit_paid` | 계약금은 이미 보냈고, 본계약 서명이나 잔금 지급을 앞두고 있는 상태 | §1 선택지 요약 |
| `r1_st_sign_scheduled` | 서명 날짜가 정해졌고, 그 전에 계약서를 확인받고 싶은 상태 | §1 선택지 요약 |

## RE01 — `re01_confirm_goal` (틀: `{goal}를 먼저 확인해야`)

| value | 제안 짧은 표현 | 근거 |
|-------|----------------|------|
| `r1_cg_owner_authority` | 계약 상대방의 소유자·서명 권한 | §3 예시 목표 칸 패턴(명사구) |
| `r1_cg_contract_terms` | 계약서에 불리한 조항이 없는지 | §3 예시 문장 직접 |
| `r1_cg_money_safety` | 계약금·보증금 송금의 안전성 | §3 예시·§1 `cg_money_safety` |
| `r1_cg_foreigner_fit` | 외국인 계약·거주 신고 가능 여부 | §1 `cg_foreigner_fit` |
| `r1_cg_order_unsure` | 서명 전 확인 순서 | §1 `cg_order_unsure` |

## RE01 — `re01_owner_doc_check` (틀: `소유자 확인은 {owner_doc}입니다`)

| value | 제안 짧은 표현 | 근거 |
|-------|----------------|------|
| `r1_od_original_match` | 핑크북 원본과 소유자 이름이 일치한 상태 | §1·§3 소유 확인 맥락 |
| `r1_od_copy_only` | 핑크북 사본만 받은 상태라 원본 대조가 남아 있습니다 | §3 예시 문장 직접 |
| `r1_od_signer_differs` | 소유자와 서명할 사람이 달라 권한 확인이 필요한 상태 | §1 `od_signer_differs` |
| `r1_od_refused_delay` | 핑크북 확인이 계속 미뤄지는 상태 | §1 `od_refused_delay` |
| `r1_od_project_no_book` | 분양 단계로 핑크북이 없고 사업 서류만 있는 상태 | §1 `od_project_no_book` |

## RE01 — metric3 `prep` (틀: `{prep}를 준비`)

| 조합 | 제안 | 근거 |
|------|------|------|
| 기본(phase1) | 계약서 초안과 중개인 메시지 | §3 예시·`m45` `prepDefault` |

---

## RE05 — `m45` lookup 부족 (Pack §3 rulesRaw에 요약 정의, generated lookup 미추출)

`pack-RE05.md` §3 및 `m45` `rulesRaw`에 stage·counterparty·paid·cg 요약이 있으나 `lookups`에 `r5_project_book_pending` 등 **다수 누락**. Pack 문서 수정 전까지는 `parse-real-estate-meta.mjs`가 `rulesRaw` 인라인 요약을 파싱해 lookup을 채우는 것을 권장한다(본 제안서는 RE01 값 표만 상세 기재).
