# Search Validation Report

- 총 검사: 13건
- 통과: 13건 / 실패: 0건

## 검사 항목
- ✅ `exact.document_number` — 1건 반환
- ✅ `exact.article` — 1건 반환
- ✅ `exact.official_url` — 3건 반환
- ✅ `exact.document_id` — 1건 반환
- ✅ `keyword.substring_or_phrase` — 1건 반환
- ✅ `keyword.prefix` — 2건 반환
- ✅ `keyword.multi_keyword_phrase` — 2건 반환
- ✅ `keyword.case_insensitive` — lower=3건, upper=3건
- ✅ `filter.status` — 1건 반환, 전부 status=fully_expired
- ✅ `filter.document_type` — 2건 반환
- ✅ `filter.relation_type` — 3건 반환
- ✅ `ranking.exact_before_keyword` — exact_scores=[100.0], keyword_scores=[]
- ✅ `ranking.sorted_desc` — scores=[30.0, 30.0, 30.0]

이 리포트는 실제 vbpl.vn 데이터가 아니라 `build_sample_data()`의 합성 데이터로 실제 실행하여 생성되었습니다(STEP3 지시사항: 검색은 합성 데이터 기반으로 테스트).