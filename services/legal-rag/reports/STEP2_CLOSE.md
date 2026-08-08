# STEP 2 — 큐레이션 수집 공식 종료

**일자**: 2026-08-08  
**최종 코퍼스**: **8,327건** / 9,999 quota (Immigration Option B 반영)

---

## 확장 사다리 완료

```
200 → 1,000 → 3,000 → 10,000 (Immigration Option B) ✅
```

## 최종 카테고리 배분

| 카테고리 | 수집 | Quota | 비고 |
|---|---:|---:|---|
| Administrative | 1,517 | 1,517 | ✅ |
| Immigration | **661** | 1,300 | Option B: +189 quyet_dinh (biên giới 제외) |
| Labor | 1,062 | 1,300 | corpus ceiling |
| RealEstate | 590 | 1,083 | corpus ceiling |
| Tax | 867 | 867 | ✅ |
| Company | 867 | 867 | ✅ |
| Licensing | 650 | 650 | ✅ |
| Civil | 255 | 433 | corpus ceiling |
| Commercial | 408 | 433 | corpus ceiling |
| Investment | 433 | 433 | ✅ |
| Banking | 433 | 433 | ✅ |
| Customs | 433 | 433 | ✅ |
| Criminal | 151 | 250 | corpus ceiling (force-fill 없음) |
| **합계** | **8,327** | **9,999** | |

## Immigration Option B 적용 내역

| | 값 |
|---|---:|
| 기존 (4 doc types) | 472 |
| quyet_dinh 추가 (on-topic, biên giới 단독 제외) | **+189** |
| **최종 Immigration** | **661 / 1,300 (50.8%)** |
| 제외된 biên giới noise | 74건 (미적용) |

## 검증 스냅샷

- **hard-fail**: 0
- **청크**: 108,597
- **authorityWeight=100**: 218건 (+ quyet_dinh 189건 @ weight 60)
- **빈 본문**: ~6% (report spot-checks 참고)
- **10만자+ 단일 청크**: 16건 → 다음 단계 이월
- **핵심 법전 후보**: 13 카테고리 전부 포함

## STEP 1/2에서 해결 확인된 버그

- authorityWeight 미인식 (doc_type snake_case)
- 검색 랭킹 VAT spot-check
- 대형 법전 단일 청크 (데이터 유실 방지 fallback)
- category 미분류 처리

## 다음 단계

`docs/STEP2-NEXT-PHASE.md` — Banking all-terms 완화, 랭킹 공식, CategoryMatch, query_date, 대형 청크, relationType 추론.
