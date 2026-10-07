# RE02~RE05 metric3(대응·자료) 선택값별 문장 (Pack §3 미정 — C1.18)

임의 작문 금지. Pack §3에 필드별 문장표 추가 시 파서 반영.

## RE05 `re05_confirmGoal` / 2차 전 고정

- 현재 Pack: metric3 고정 「2차 질문에서 지금까지의 대응과 보관 자료를 확인합니다.」(phase1 전 조합 동일)
- 필요: `re05_stage`·`re05_paidStage`·`re05_counterparty` 조합별 1차 m3 문장표

## RE04 `re04_notify_status`

- Pack §3 예시 문장(nt_verbal_only, nt_formal_request 등)은 lookup에 있음
- `suffixIfNotNone` 중복(「…좋습니다」+「…중요합니다」)은 엔진에서 의미 보존 단일 문장으로 합침

## RE02 `re02_dispute_type` → metric3 materials

- materials는 Pack §3 「대응·자료」 조합 규칙(분쟁 유형별 안내) 사용 — 선택별 추가 문장은 Pack 표 필요 시 본 문서에 value 목록만 추가
