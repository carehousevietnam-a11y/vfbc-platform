# RE02~RE05 위험 신호 → 1차 판정 매핑 (제안)

## 배경

`pack-RE0N.md` §「위험 신호 선택지」 표와 합산 규칙(전문가 권장 1+ → 전문가 권장 / 주의 2+ → 주의 / 그 외 확인 필요)을 `REAL_ESTATE_RISKS`에 반영했다.

## NEEDS_ACE — RE04 phase1 `it_prior_defect_blamed`

Pack §3(M-1)에는 `re04_issue_type = it_prior_defect_blamed` 단독 행이 없고, `re04_deadline = dl_contract_end` 조합 행만 있습니다. 1차에서 issue만 선택한 경우 attention 기준을 Pack에 추가할지 Ace 확인 필요.

## C1.17 임시 추가 (RE05 phase1)

| value | 권장 1차 attention |
|---|---|
| `r5_registration_rejected` | 주의 (통지·재신청 기한 확인) |

표에 단독 행이 없어 파서에 1건 임시 추가. Pack 표에 `registration_rejected` 단독 행 추가 시 제거.

## C1.17 — RE01 `r1_st_deposit_requested`

Master §주의 `r1_cf_no_draft` + `r1_st_deposit_requested` 조합 문장을 단독 `r1_st_deposit_requested` caution 트리거로 반영(문장 동일). Pack 단독 행 추가 시 트리거 정리.

## RE05 metric3 (1차)

Pack §3: 2차 응답 전 고정 문장. 선택값별 1차 문장이 필요하면 Pack §3에 필드별 문장표를 추가한 뒤 파서에 반영.
