# STEP 2 Legal RAG Pilot — 핸드오프 문서

**작성일**: 2026-08-08  
**상태**: STEP 2 큐레이션 **종료** (Immigration Option B 반영 완료)  
**담당 브랜치**: `cursor/legal-rag-pilot-10000-5df7`  
**PR**: https://github.com/carehousevietnam-a11y/vfbc-platform/pull/5 (base: `main`, **OPEN**)

---

## 1. 한 줄 요약

Legal RAG STEP 2에서 200→1,000→3,000→**10,000 quota** 확장 파이프라인을 구축·실행했고, tmquan 코퍼스 한도로 **8,327건** 수집 후 Immigration `quyet_dinh` Option B(+189)까지 반영해 **공식 종료**했다. 다음 단계는 **수집이 아닌 검색/랭킹 개선**부터 시작한다.

---

## 2. PR / 브랜치 관계

| PR | 브랜치 | 내용 | 상태 |
|---|---|---|---|
| [#3](https://github.com/carehousevietnam-a11y/vfbc-platform/pull/3) | `cursor/legal-rag-schema-v2-d576` | Schema V2 + Pilot 200 | OPEN (미 merge) |
| [#4](https://github.com/cwarehousevietnam-a11y/vfbc-platform/pull/4) | `cursor/legal-rag-pilot-3000-d576` | 3k pilot (13 categories) | OPEN (미 merge) |
| **[#5](https://github.com/carehousevietnam-a11y/vfbc-platform/pull/5)** | **`cursor/legal-rag-pilot-10000-5df7`** | **10k close — 8,327건, Immigration 661** | **OPEN** |

- 10k 작업은 **PR #4 브랜치에서 분기**했으며, `main`에는 아직 merge되지 않음.
- 신규 작업 시 **#5 브랜치**에서 이어가거나, merge 후 `main` 기준으로 분기.

---

## 3. 확장 사다리 (완료)

```
Pilot 200  →  Pilot 1,000  →  Pilot 3,000  →  Pilot 10,000 (quota)
   ✅              ✅               ✅              ✅ (8,327 collected)
```

| 단계 | 목표 | 실제 | 리포트 |
|---|---:|---:|---|
| 200 | 200 | 200 (rework) | `reports/pilot_200_report.md` |
| 1,000 | 1,000 | ~1,000 | `reports/pilot_1000_report.md` |
| 3,000 | 3,000 | 2,857 | `reports/pilot_3000_report.md` |
| **10,000** | **9,999 quota** | **8,327** | `reports/pilot_10000_report.md` |

---

## 4. 최종 코퍼스 스냅샷 (8,327건)

### 4.1 카테고리별

| 카테고리 | 수집 | Quota | 비고 |
|---|---:|---:|---|
| Administrative | 1,517 | 1,517 | ✅ quota 충족 |
| Immigration | **661** | 1,300 | Option B: +189 `quyet_dinh` |
| Labor | 1,062 | 1,300 | corpus ceiling (−238) |
| RealEstate | 590 | 1,083 | corpus ceiling (−493) |
| Tax | 867 | 867 | ✅ |
| Company | 867 | 867 | ✅ |
| Licensing | 650 | 650 | ✅ |
| Civil | 255 | 433 | corpus ceiling (−178) |
| Commercial | 408 | 433 | corpus ceiling (−25) |
| Investment | 433 | 433 | ✅ |
| Banking | 433 | 433 | ✅ |
| Customs | 433 | 433 | ✅ |
| Criminal | 151 | 250 | **의도적 미 force-fill** (−99) |
| **합계** | **8,327** | **9,999** | |

### 4.2 검증·품질

| 지표 | 값 |
|---|---|
| hard-fail | **0** |
| 청크 수 | **108,597** |
| 단일 청크 / 다중 청크 문서 | 1,793 / 6,034 |
| authorityWeight | {60: 189, 80: 5,926, 90: 1,994, 100: 218} |
| 빈 본문 (markdown empty) | 500건 (6.0%) — 청크 0개와 동일 |
| 10만자+ 단일 청크 | **16건** (0.2%) — 다음 단계 이월 |
| relatedDocuments / relationType | **없음** (tmquan 소스 한계) |
| 핵심 법전 후보 | 13 카테고리 전부 포함 (report §5 참고) |

---

## 5. 주요 의사결정 로그

### 5.1 Criminal quota 250 — force-fill 금지

- 3k 비율 스케일업 시 Criminal quota를 **250**으로 낮춤.
- `tài sản` 등 느슨한 키워드로 억지 채우기 **하지 않음**.
- 최종 **151/250** — corpus ceiling 수용.

### 5.2 Immigration `quyet_dinh` — Option B 채택

**배경**: Immigration만 `doc_type`에 `quyet_dinh` 추가 probe.

| 단계 | Immigration | 전체 |
|---|---:|---:|
| 4 doc types 기준 | 472 | 8,138 |
| raw +263 (biên giới 포함) | ~735 예상 | — |
| **Option B 적용** (+189, biên giới 단독 74건 제외) | **661** | **8,327** |

- **Option B**: `IMMIGRATION_EXCLUDED_KEYWORDS`로 standalone `biên giới` 매치 제외.
- 263건 중 ~28% noise → on-topic **189건만** 반영.
- quota 1,300 미달(639)은 trung_uong Immigration corpus 한도 — **추가 채우기 중단**.

상세: `reports/pilot_10000_immigration_quyet_dinh_report.md`

### 5.3 Banking 검색 0 hit — 수집 문제 아님

- 질의 `mở tài khoản ngân hàng người nước ngoài` → **0건** (Banking 433건 확대 후에도).
- `ngân hàng`, `tài khoản ngân hàng`, `người nước ngoài mở tài khoản` → 각 5건.
- 원인: `search_keyword`의 **`keyword_all_terms`(전체 토큰 AND)** 과엄격.
- **다음 단계**: 검색/랭킹 수정 (`docs/STEP2-NEXT-PHASE.md` §1).

### 5.4 대형 단일 청크 16건 — 분석만, 수정 없음

- 주로 Thông tư: `Điều` 마커·개행 붕괴 → `parse_document_structure` fallback → 문서 전체 1 chunk.
- 3k에서 관측된 2건 재확인:
  - `130/2008/TT-BTC`: Phần 헤더만, `Điều` 0, 개행 9
  - `28/2004/TT-BTNMT`: 산문 blob, `Điều`가 줄 중간에만 등장
- Law급 대형 법전은 다중 청크 정상 (예: `12/2017/QH14` 264k자 → 12 chunks).

---

## 6. 코드·데이터 아티팩트

### 6.1 핵심 스크립트

| 파일 | 역할 |
|---|---|
| `src/run_pilot_10000_pipeline.py` | 10k end-to-end (curate → raw → normalize → report) |
| `src/run_immigration_quyet_dinh_probe.py` | Immigration quyet_dinh probe / `--apply` Option B |
| `src/curate_pilot_200.py` | 공유 큐레이션 (Phase 3 `legal_area` backfill, keyword fix) |
| `src/run_pilot_3000_pipeline.py` | 3k 파이프라인 (선행) |
| `src/run_pilot_1000_pipeline.py` | 1k 파이프라인 |
| `src/run_pilot_200_pipeline.py` | 200 파이프라인 |
| `src/search_keyword.py` | 키워드 검색 (all-terms AND 이슈 위치) |
| `src/parse_legal_structure.py` | 청킹 (`Điều` 마커 의존) |

### 6.2 설정·매니페스트

| 파일 | Git | 설명 |
|---|---|---|
| `data/pilot/pilot_10000_targets.json` | ✅ | quota·키워드·doc_numbers |
| `data/pilot/pilot_10000_collected.json` | ✅ | ~3.7MB 수집 매니페스트 |
| `data/raw/pilot/pilot_10000.jsonl` | ❌ gitignore | ~1.1GB raw |
| `data/normalized/pilot_10000/` | ❌ gitignore | documents.jsonl + chunks.jsonl |

`.gitignore` (repo root):
```
services/legal-rag/data/raw/pilot/pilot_10000.jsonl
services/legal-rag/data/normalized/pilot_10000/
```

### 6.3 리포트

| 파일 | 내용 |
|---|---|
| `reports/STEP2_CLOSE.md` | STEP 2 공식 종료 선언 |
| `reports/pilot_10000_report.md` | 수집·정규화·검색 spot-check |
| `reports/pilot_10000_report.json` | 전체 메트릭 JSON |
| `reports/pilot_10000_search_samples.json` | 검색 샘플 raw |
| `reports/pilot_10000_immigration_quyet_dinh_report.md` | Immigration probe |
| `reports/pilot_10000_immigration_quyet_dinh_probe.json` | probe raw |
| `docs/STEP2-NEXT-PHASE.md` | 다음 단계 백로그 |

---

## 7. 로컬 재현 명령

```bash
cd services/legal-rag

# 전체 10k 파이프라인 (curate + normalize + report)
python3 -m src.run_pilot_10000_pipeline

# Immigration Option B — 이미 적용됨; 재적용 시:
python3 -m src.run_immigration_quyet_dinh_probe --apply

# curate 스킵, normalize/report만:
python3 -m src.run_pilot_10000_pipeline --skip-curate

# probe만 (dry-run):
python3 -m src.run_immigration_quyet_dinh_probe

# 테스트
python3 -m pytest tests/ -q
```

**전제**: tmquan raw 코퍼스가 로컬에 존재해야 curate 가능 (기존 pilot 파이프라인과 동일).

---

## 8. STEP 1/2에서 해결된 버그 (회귀 주의)

1. **authorityWeight** — `doc_type` snake_case (`luat`, `bo_luat`) 미인식 수정
2. **VAT 검색** — title phrase ranking spot-check 통과
3. **대형 법전 단일 청크** — 데이터 유실 방지 fallback (Law급)
4. **category 미분류** — `legal_area` backfill + filled-category skip 버그 수정
   - `_pick_keyword_match`, `_match_all_categories_by_keywords` — quota 미달 카테고리 우선 스캔

---

## 9. 다음 단계 백로그 (미착수 — 별도 지시 대기)

우선순위 후보 (`docs/STEP2-NEXT-PHASE.md`):

| # | 항목 | 범위 | 비고 |
|---|---|---|---|
| 1 | Banking / all-terms AND 완화 | `search_keyword`, ranking | **최우선 후보** |
| 2 | 랭킹 공식 | `Similarity × Authority × Freshness × CategoryMatch` | |
| 3 | CategoryMatch | 질의→카테고리 추론 | |
| 4 | query_date 필터 | temporal filtering | schema 존재, API TBD |
| 5 | 대형 단일 청크 16건 | `parse_legal_structure` | Thông tư 우선순위 낮음 |
| 6 | relationType 추론 | `relatedDocuments` | th1nhng0 또는 별도 소스 |

**명시적 지시 없이는 STEP 3 구현 시작하지 않음** (ace 확인).

---

## 10. 새 채팅 / 에이전트 시작 체크리스트

1. 브랜치 확인: `git checkout cursor/legal-rag-pilot-10000-5df7`
2. STEP 2 종료 확인: `reports/STEP2_CLOSE.md`
3. 최종 숫자: **8,327건**, Immigration **661**, hard-fail **0**
4. PR #5 상태 확인 (OPEN, merge 전)
5. raw/normalized 10k 아티팩트는 gitignore — 필요 시 pipeline 재실행
6. 다음 작업은 `docs/STEP2-NEXT-PHASE.md` 또는 사용자 지시 파일 참조

---

## 11. 관련 문서 링크

- 아키텍처: `docs/Architecture.md`, `docs/Pipeline.md`, `docs/Schema.md`
- Schema V2 설계: `docs/STEP1-Schema-V2-Design.md`
- STEP 2 종료: `reports/STEP2_CLOSE.md`
- STEP 2 이후: `docs/STEP2-NEXT-PHASE.md`

---

*이 문서는 STEP 2 세션 핸드오프용입니다. 수치·상태 변경 시 `reports/pilot_10000_report.md` 및 `STEP2_CLOSE.md`와 함께 갱신하세요.*
