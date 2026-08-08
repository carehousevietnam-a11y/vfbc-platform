# STEP 2 이후 — 다음 단계 백로그

STEP 2(큐레이션 수집) 완료 후 논의·구현 예정 항목.

## 1. 검색 랭킹 / Banking 질의 (우선)

**문제**: `mở tài khoản ngân hàng người nước ngoài` 등 4~6단어 질의에서
`keyword_all_terms`(전체 토큰 AND)가 과엄격 → Banking 433건 확대 후에도 0 hit.

**증거** (10k pilot):
- 승인 질의 `mở tài khoản ngân hàng người nước ngoài` → 0건
- `ngân hàng`, `tài khoản ngân hàng`, `người nước ngoài mở tài khoản` → 각 5건

**방향**: 전체 단어 AND 대신 **부분 매칭 + 점수화** (phrase boost, term coverage,
category boost). 수집 변경 아님 — `search_keyword` / ranking formula 수정.

## 2. CategoryMatch

카테고리별 검색 부스트·필터 (질의→카테고리 추론).

## 3. query_date 필터

유효일/개정일 기준 temporal filtering.

## 4. relationType / relatedDocuments

tmquan 코퍼스에 edge 없음 → th1nhng0 또는 별도 relation 소스 연동.

## 5. 대형 단일 청크 (16건, 0.2%)

Thông tư급, Điều 마커·개행 붕괴. Law급 아님 → chunker 개선은 건수·우선순위 판단 후.
