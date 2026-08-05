# VFBCAI Legal Intelligence Platform — `services/legal-rag`

**이 프로젝트는 VFBCAI 메인 플랫폼(`vfbc-platform`)과 완전히 독립적인 서브프로젝트입니다.**
DB/API/CRM/OpenAI 연동/Storage/Business Logic 등 기존 서비스는 이 작업으로 절대 수정되지
않습니다.

---

## 현재 단계: STEP3-1 — 실제 VBPL 데이터셋 기준 Search Engine 검증·보완

**STEP1, STEP1-1, STEP2, STEP3가 승인되어, 이번 STEP3-1에서 STEP3의 Exact +
Keyword Search Engine을 실제 Hugging Face VBPL 데이터셋(`tmquan/vbpl-vn` +
`th1nhng0/vietnamese-legal-documents`) 구조에 맞춰 검증·보완했습니다.**

### 실행 상태 요약 (정직하게 구분)

| 항목 | 상태 |
|---|---|
| `dataset_loader.py`/`dataset_mapper.py`/`dataset_validator.py`/`validate_real_dataset.py`/`search_quality_report.py` | **완료** — 스텁이 아니라 실제 로직 |
| 단위 테스트(`tests/test_{dataset_loader,dataset_mapper,dataset_validator,validate_real_dataset,search_quality_report}.py` 5개, 48개 신규 테스트) | **완료·통과** — 전체 **178개 테스트** 전부 통과 |
| `--fixture`(실 스키마를 충실히 모사한 합성 데이터, 의도적 결함 7종 포함) 전체 파이프라인 실행 | **완료·실행됨** — `reports/real-dataset-pipeline.md/json`, `reports/dataset-validation.md/json`, `reports/search-quality.md/json` 실제 생성 |
| 실제 Hugging Face VBPL 데이터 다운로드/실행 | **미실행** — 샌드박스가 `huggingface.co`에 접근할 수 없음(`403 host_not_allowed`, STEP1에서 이미 확인됨). `dataset_loader.py --download`는 사용자 로컬 PC에서 실행하도록 구현만 완료 |
| 이번 검증 과정에서 발견 및 수정한 버그 2건 | **완료** — 아래 "이번 단계에서 발견·수정한 버그" 절 참고 |
| PostgreSQL 실제 적재 / Supabase / pgvector / Embedding / Hybrid Search / BM25 / RRF / FastAPI / OpenAI / RAG / 기존 VFBCAI 연결 | **구현 안 함** — STEP3-1 지시사항에서 명시적으로 제외된 범위 |

**합성 데이터는 삭제하지 않고 회귀 테스트 전용으로 유지합니다.** STEP3의
`search_cli.py --fixture`/`--validate`는 그대로 남아있으며, 이번 STEP3-1의
`validate_real_dataset.py --fixture`는 **더 정교하고 실제 스키마에 가까운
별도의 합성 데이터셋**(`build_realistic_fixture_rows()`)을 사용합니다 —
두 합성 데이터는 목적이 다르므로 분리했습니다(전자는 검색 로직 자체의 회귀
테스트, 후자는 실제 데이터 구조 대응력 검증).

**STEP1-1/STEP2/STEP3 상태(변경 없음, 유지)**: 이전 산출물은 이번 STEP3-1에서
전혀 수정하지 않았습니다(단, `search_engine.py`/`search_models.py` 등은 이번
단계에서 발견된 버그 수정 대상으로 명시적으로 허용되었으나 — 실제로는 새
모듈(`dataset_mapper.py`, `search_quality_report.py`) 내부의 버그만 발견되어
고쳤고, STEP3 기존 검색 엔진 파일 자체는 수정하지 않았습니다). 이 문서 하단
"STEP1-1/STEP2/STEP3 요약(과거 기록)" 참고.

---

## STEP3-1 — 실제 데이터셋 연결 아키텍처

### 데이터 원칙

`tmquan/vbpl-vn` + `th1nhng0/vietnamese-legal-documents`를 VFBCAI Legal
Knowledge Base의 **Primary Data Source**로 사용합니다(STEP3-1 지시사항 그대로).
Revision은 STEP1에서 고정한 값을 그대로 사용합니다(`docs/Architecture.md` 4장).

### 신규 모듈 5종과 역할 분담

```
dataset_loader.py     — 로컬 파일 로드(포맷 자동 인식) + 다운로드(사용자 PC 전용)
        ↓
dataset_mapper.py     — 실제 컬럼 → Canonical Schema (alias 기반, 컬럼 누락/차이에 강건)
        ↓
dataset_validator.py  — 필드/관계/메타데이터 품질 검증 (dataset-validation.md/json)
        ↓
validate_real_dataset.py — Normalize→Dedup→Điều/Khoản/Điểm Parsing→Chunk→
                            Relationship→EffectiveScope→검색 가능 여부까지
                            전체 파이프라인을 엔드투엔드로 실행 (기존 STEP1-1/
                            STEP2/STEP3 파일들을 그대로 재사용/조립)
        ↓
search_quality_report.py — Exact/Keyword 성공률, Document/Article/Relationship/
                            Status Match, Parsing/누락/중복/HTML 오류 집계
                            (search-quality.md/json)
```

- `dataset_loader.py`는 STEP1-1의 `download_datasets.py`(다운로드 전용)를 그대로
  재사용하고, `audit_datasets.py`의 파일 discovery/파싱 유틸을 재사용해 중복
  구현을 피했습니다. 다운로드 함수 자체는 huggingface.co 접근이 가능한
  **사용자 로컬 PC에서만** 실행되도록 설계했으며, 이 문서 작성 과정에서
  실행하지 않았습니다.
- `dataset_mapper.py`는 STEP1-1의 `normalize_documents.py`와 달리, 컬럼명이
  문서화된 것과 다를 수 있다는 전제로 **alias(후보 컬럼명) 목록을 우선순위대로
  시도**합니다. 어떤 alias도 매치되지 않으면 에러 없이 `None`으로 채우고 어떤
  필드가 비었는지 `MappingReport`로 남깁니다.
- `validate_real_dataset.py`는 기존 STEP1-1/STEP2/STEP3 파일(`deduplicate_documents.py`,
  `parse_legal_structure.py`, `normalize_relations.py`, `effective_scopes.py`,
  `search_engine.py`)을 **수정 없이 그대로 import**해서 조립합니다 — "필요 시
  Search Engine 수정"이 허용되었지만, 실제로는 새로 만든 모듈(`dataset_mapper.py`)
  안에서만 버그가 발견되어 기존 STEP1-1/STEP2/STEP3 파일은 하나도 고치지
  않았습니다.

### 이번 단계에서 발견·수정한 버그 (실제 실행 중 발견됨)

`--fixture`(실 스키마를 모사한 합성 데이터, 의도적 결함 7종 포함)로
`validate_real_dataset.py`를 실제 실행하는 과정에서 **`dataset_mapper.py`
자체의 버그 1건**과 **`search_quality_report.py` 자체의 버그 2건**을
발견하고 그 자리에서 수정했습니다(전부 이번 STEP3-1 신규 파일 내부 버그이며,
STEP1-1/STEP2/STEP3 기존 파일은 무관합니다):

1. **`dataset_mapper.py`의 본문(body) 필드 매핑 카운팅 오류**: th1nhng0처럼
   본문이 별도 `content` config에 있고 metadata에서 join으로 채워지는
   경우, join 성공 여부와 무관하게 "1차 alias 조회 실패"만으로 무조건
   `bodyRaw` 필드를 "누락"으로 잘못 카운트하고 있었습니다. 실제로는 join이
   성공해 본문이 채워졌는데도 리포트에는 누락으로 표시되는 오류였습니다.
   → join 결과까지 반영한 뒤 최종적으로 값이 있는지 없는지로 hit/miss를
   판정하도록 수정했습니다.
2. **`search_quality_report.py`의 Article Match가 항상 0/0으로 나오는 버그**:
   STEP1-1의 `LegalChunk`(`src/schema.py`)에는 `article_no` 필드가 없고
   `path`(breadcrumb 문자열) 안에만 조번호 정보가 들어있는데, 조번호를
   `chunk.get("article_no")`로 직접 읽으려 시도해 항상 실패하고 있었습니다.
   → `search_models.parse_locators_from_path()`(STEP3에서 이미 만든 함수)를
   재사용해 `path`에서 실제로 파싱하도록 수정했습니다.
3. **`search_quality_report.py`의 중복 문서 카운트가 항상 0으로 나오는 버그**:
   중복 검사를 dedup **이후** 문서 목록으로 수행해, 이미 중복이 제거된
   목록에서는 항상 0건이 나올 수밖에 없었습니다. → dedup **이전** 원본
   문서 목록(`pre_dedup_documents`)을 별도로 받아 그 기준으로 중복을
   계산하도록 수정했습니다.

세 버그 모두 `tests/test_dataset_mapper.py`(`test_map_row_content_join_missing_counts_as_miss_not_hit`)와
`tests/test_search_quality_report.py`(`test_compute_quality_article_match_uses_path_locators`,
`test_compute_quality_duplicate_count_uses_pre_dedup_set`)에 회귀 테스트로
추가했습니다 — 다시 발생하면 테스트가 실패합니다.

---

## `--fixture` 실행 결과 (실제로 실행함)

```bash
python -m src.validate_real_dataset --fixture --reports-dir reports
python -m src.search_quality_report --fixture --output-dir reports
```

`build_realistic_fixture_rows()`는 두 데이터셋의 공개 Dataset Card 스키마를
최대한 충실히 모사하면서, 실제 데이터에서 흔할 것으로 예상되는 결함 7종을
의도적으로 포함합니다: ① 법령번호 복수 표기(`"và"`로 나열) ② th1nhng0
metadata의 `officialUrl` 필드 부재 ③ th1nhng0 content의 raw HTML ④
관계(relationship) 미분류 라벨 1건 ⑤ tmquan/th1nhng0 양쪽에 동일 법령이
다른 ID로 존재(중복 시나리오) ⑥ Khoản/Điểm 분리가 실제 발동해야 하는 장문
조항 ⑦ 서로 다른 소스의 날짜 포맷.

**`reports/real-dataset-pipeline.md` 실제 실행 결과 요약**:
- 7단계(normalize/dataset_validation/deduplicate/parse_structure/
  parse_structure.khoan_diem_split/relationships/effective_scopes) **전부 성공**
- 중복 시나리오(⑤) → `deduplicate` 단계에서 4건→3건으로 정확히 병합됨(tier4:
  제목+시행일+발행기관 일치)
- 장문 조항(⑥) → Khoản/Điểm 분리 3건 확인됨
- 미분류 관계 라벨(④) → "발견된 문제"에 정확히 기록됨
- 검색 스모크 테스트 3종(문서번호/Document ID/status 필터) **전부 통과**

**`reports/dataset-validation.md` 실제 실행 결과 요약**: `officialUrl` 누락
2건(②), `content` 누락 1건(본문 없는 문서), 중복 그룹 1건(⑤), 관계 미분류
1건(④) — 전부 의도한 결함과 정확히 일치하게 검출됨.

**`reports/search-quality.md` 실제 실행 결과 요약** (버그 수정 후 최종):

| 지표 | 결과 |
|---|---|
| Exact 성공률 | 2/2 = 100% |
| Keyword 성공률 | 6/6 = 100% |
| Document Match | 3/3 = 100% |
| Article Match | 6/6 = 100% |
| Relationship Match | 1/1 = 100% |
| Status Match | 2/2 = 100% |
| Parsing 오류 | 0건 |
| 누락 문서 | 1건 (의도한 결함, 본문 없는 문서) |
| 중복 문서(그룹) | 1건 (의도한 결함 ⑤) |
| HTML 오류 | 0건 (정규화가 HTML을 정상적으로 제거함) |

이 100% 수치는 **합성 데이터가 의도적으로 "깨끗하게 매핑 가능하도록" 설계되었기
때문**이며, 실제 158,822/153,420건 규모의 실 데이터에서는 이보다 낮을 가능성이
높습니다 — 실제 수치는 사용자 로컬 PC에서 `--fixture` 없이 실행해야 확인
가능합니다(아래 "실제 데이터 연결 방법" 참고).

---

## STEP3 — Legal Search Engine 구조 (과거 기록, 변경 없음)

### 설계 원칙: 검색 인덱스는 어떤 DB에도 연결하지 않는다

STEP3 지시사항이 "PostgreSQL 실제 적재"를 명시적으로 금지하므로, 검색 인덱스는
Postgres/Supabase에 연결하지 않고 **순수 in-memory 구조**로 구현했습니다. 대신
필드 이름과 구조는 STEP2에서 확정한 `sql/create_schema.sql`의
`legal_documents`/`legal_chunks`/`legal_relations` 컬럼명을 그대로 따릅니다
(`document_id`, `article_no`, `official_url` 등 — snake_case, STEP2 SQL과 동일).

데이터 소스는 두 가지 중 선택합니다:
1. **STEP1-1 파이프라인 산출물** (`data/normalized/documents_deduped.jsonl`,
   `chunks.jsonl`, `relationships.jsonl`) — `load_from_pipeline_jsonl()`이
   STEP1-1의 camelCase(`documentId` 등) 표현을 STEP2/STEP3의 snake_case로
   변환해 로드합니다. 이는 로컬 파일 → 메모리 로드일 뿐, DB 적재가 아닙니다.
2. **내장 합성 데이터** (`--fixture` 플래그, `search_cli.build_sample_data()`) —
   실제 vbpl.vn 데이터 없이 전체 파이프라인 동작을 확인하기 위한 것입니다.

### 검색 순서 (STEP3 지시사항 그대로)

```
Exact Search
    ↓
Keyword Search
    ↓
Filter
    ↓
Ranking (단순 점수 — Exact 우선, Keyword 다음. RRF는 이번 단계에 없음)
```

`LegalSearchIndex.search(query, filters, limit)`가 이 순서를 그대로 구현합니다
(`src/search_engine.py`):

1. **Exact Search** (`search_exact.py`) — 쿼리 문자열 하나로 다음 중 어떤 유형의
   정확 매치인지 자동 판별합니다: 법령번호(`152/2020/NĐ-CP` 형태, `normalize_document_number()`
   재사용으로 "Nghị định số 152/..." 같은 변주도 흡수) → Document ID
   (`tmquan:1001` 형태) → 조문(`Điều 9`, `Điều 9 Khoản 2`, `Điều 9 Khoản 2 Điểm a`) →
   공식 URL(`http(s)://`로 시작). 여러 유형이 동시에 매치될 수 있으며 이는 정상입니다.
2. **Keyword Search** (`search_keyword.py`) — `title`/`original_text`/
   `normalized_text`/`search_text` 4개 필드 대상, phrase(다중 키워드 전체 포함) >
   prefix(단어 접두어) > substring(부분일치) 순으로 판정. Unicode NFC 정규화 +
   소문자 변환으로 대소문자/정서법 변주를 흡수합니다.
3. **Filter** (`search_filters.py`) — `status`/`document_type`/`issuing_authority`/
   `effective_date`/`issue_date`/`article_no`/`relation_type` 지원. 쿼리 없이
   필터만으로도 검색 가능("browse 모드").
4. **Ranking** — Exact 매치는 고정 고득점(90~100점), Keyword는 매치 유형별
   기본점수(20~50점)×필드가중치. 최종 정렬은 score 내림차순 하나뿐이며, Exact가
   항상 Keyword보다 높은 점수를 가지므로 "Exact 우선, Keyword 다음"이 자연히
   만족됩니다. **RRF(Reciprocal Rank Fusion)는 구현하지 않았습니다** — 다음
   단계(Vector Search 도입 이후) 몫입니다.

### 검색 결과 필드

STEP3 지시사항이 "반드시 포함"하라고 명시한 12개 필드를 그대로 담습니다:
`document_id`, `document_number`, `document_type`, `title`, `article_no`,
`clause_no`, `item_no`, `heading`, `status`, `official_url`, `score`, `match_type`.
여기에 결과 추적용으로 `chunk_id`를 추가했습니다(문서화된 확장 — 필수 목록 외
추측으로 채운 필드 아님).

### 알려진 설계 판단 (추측이 아니라 명시적 근거가 있는 선택)

- **`effective_date`/`issue_date` 필터는 정확값과 범위(`_from`/`_to`) 둘 다
  지원합니다.** STEP3 지시사항이 정확일치인지 범위인지 규정하지 않아, 실무적으로
  더 유용한 범위 검색까지 포함했습니다(`src/search_filters.py` 상단 docstring에
  동일 근거 명시).
- **`original_text`와 `normalized_text`가 현재 같은 값을 공유합니다.** STEP1-1의
  `LegalChunk`(`src/schema.py`)에는 정규화된 본문(`text`)만 chunk 단위로 저장되고
  "가공 전 원본"은 별도 보존하지 않기 때문입니다. 완전히 분리하려면
  `parse_legal_structure.py` 자체를 수정해야 하며 이는 STEP3 범위 밖이라 손대지
  않았습니다(`src/search_engine.py`의 `_legal_chunk_to_row()`에 동일 내용 명시).
- **조번호 파싱은 STEP1-1의 `parse_legal_structure.py`를 재사용하지 않고
  `search_models.py`에 독립적으로 재구현했습니다.** "승인된 이전 단계 파일은
  건드리지 않는다"는 원칙과 "services/legal-rag 내부만 수정한다"는 지시를 함께
  만족시키기 위한 선택입니다(정규식 패턴 자체는 동일).

---

## CLI 사용 예시 (전부 실제 실행하여 출력 확인함)

```bash
# 법령번호로 정확 검색
python -m src.search_cli --fixture --query "152/2020/NĐ-CP"
# [ 100.0] (exact_document_number) tmquan:1001 — Quy định về giấy phép lao động [active]

# 조문 필터(browse 모드, query 없이 --article만)
python -m src.search_cli --fixture --article 2
# [   0.0] (filter_only) tmquan:1001 Điều 2 — Quy định về giấy phép lao động [active]

# 키워드 검색 + status 필터
python -m src.search_cli --fixture --query "lao động" --status active
# [  75.0] (keyword_phrase) tmquan:1001 Điều 1 — ...
# [  75.0] (keyword_phrase) tmquan:1001 Điều 2 — ...

# document_type 필터만 (browse 모드)
python -m src.search_cli --fixture --doc-type thong_tu

# JSON 출력
python -m src.search_cli --fixture --query "tmquan:1001" --json

# 실제 파이프라인 산출물 사용(기본값, data/normalized/*.jsonl 필요)
python -m src.search_cli --query "152/2020/NĐ-CP" --status active --limit 5

# 자체 검증 + 리포트 생성 (합성 데이터, 네트워크/DB 불필요)
python -m src.search_cli --validate
```

`--data-dir`(기본 `data/normalized`)에 STEP1-1 파이프라인 산출물이 없으면 빈
인덱스로 "(결과 없음)"을 출력합니다(에러로 죽지 않음 — 실 데이터가 아직 없는
현재 상태가 정상이기 때문).

### Validation 실행 결과 (실제로 실행함)

```bash
python -m src.search_cli --validate --reports-dir reports
```

`reports/search-validation.md`/`.json` 실제 생성 결과: **13건 검사 중 13건 통과**
(Exact 4종, Keyword 5종, Filter 3종, Ranking 2종을 각각 합성 데이터로 실제 실행).

---

## STEP2 요약 (과거 기록, 변경 없음)

STEP2에서 설계한 PostgreSQL 스키마(`sql/*.sql`, `src/build_schema.py`)는 이번
STEP3에서 전혀 수정하지 않았습니다. STEP2 산출물 요약: 단위 테스트
`tests/test_build_schema.py`(9개, 전체 71개 중 일부로 당시 통과 확인), SQL
스키마 자체는 아래 "STEP2 — Legal Knowledge Base 스키마" 절에 그대로
보존했습니다. `PostgreSQL 실제 적재(Supabase 연결) / pgvector / Embedding /
Hybrid Search / BM25 / RRF / FastAPI / OpenAI / RAG / 기존 VFBCAI 연결`은
STEP2에서도 구현하지 않았고 이번 STEP3에서도 구현하지 않았습니다.

---

## STEP2 — Legal Knowledge Base 스키마

### 테이블 구성 (7개)

| 테이블 | 역할 | STEP1 Canonical Schema 대응 |
|---|---|---|
| `legal_dataset_versions` | 원천 데이터셋 revision 이력 | Architecture.md 4장 revision 고정값 |
| `legal_documents` | 문서 메타데이터 | `src/schema.py` `CanonicalDocument` |
| `legal_articles` | Phần/Chương/Mục/Điều/Khoản/Điểm **구조 트리** (자기참조) | Schema.md 3장 법률구조 파싱 계층 |
| `legal_chunks` | 검색 대상 **본문 Chunk** (Điều 단위 기본) | `src/schema.py` `LegalChunk` |
| `legal_relations` | 문서 간 관계(개정/폐지/대체 등) | `src/schema.py` `RelationshipEdge` |
| `legal_effective_scopes` | article/khoản/điểm 단위 부분 실효 | `src/schema.py` `EffectiveScope` |
| `legal_import_history` | 파이프라인 실행 이력 | (신규, STEP2에서 추가) |

**컬럼은 STEP2 지시사항에 명시된 목록을 그대로 사용했습니다.** `src/build_schema.py`가
`legal_documents`/`legal_chunks`/`legal_relations`/`legal_effective_scopes`/
`legal_dataset_versions`/`legal_import_history` 6개 테이블의 실제 컬럼 집합을 STEP2
지시사항 목록과 **정확히 일치**하는지 기계적으로 검증하며(추측 컬럼 추가 시 검증 실패),
이번 제출에서 실제로 실행해 0건의 불일치를 확인했습니다.

**`legal_articles`만 예외입니다.** STEP2 지시사항은 이 테이블에 "문서→장→조→항→호 계층
저장"이라는 목적만 명시하고 구체적 컬럼 목록을 주지 않았습니다. 추측으로 임의 컬럼을
넣지 않기 위해, STEP1에서 이미 확정된 Phần/Chương/Mục/Điều/Khoản/Điểm 6단계 계층
설계(`docs/Schema.md` 3장)를 그대로 SQL 컬럼으로 옮겼습니다 — `level`(6단계 enum),
`phan_no`/`chuong_no`/`muc_no`/`dieu_no`/`khoan_no`/`diem_no`(레벨별 번호),
`parent_article_id`(자기참조 FK로 트리 구성), `heading`/`path`(breadcrumb).
`article_id`/`relation_id`/`scope_id`/`import_id`처럼 STEP2 지시사항에 이름만 있고
형식이 정해지지 않은 대리키(surrogate key)는 전부 `bigint GENERATED ALWAYS AS IDENTITY`로
설계했습니다(가장 보수적인 선택 — 특정 문자열 포맷을 임의로 발명하지 않음).

### ERD (테이블 관계)

```
legal_dataset_versions (dataset_name, revision) PK
        │  1
        │  (source_dataset, source_revision)
        ▼  N
legal_documents (internal_id) PK
        │  1                              │ 1                    │ 1
        │ N                                │ N                     │ N
        ▼                                   ▼                        ▼
legal_articles                    legal_chunks              legal_relations (source/target 양쪽)
(document_id FK,                  (document_id FK)          (source_document_id FK,
 parent_article_id                                            target_document_id FK)
 자기참조 FK)                                                        │ 1
                                                                       │ N (nullable)
                                                                       ▼
                                                          legal_effective_scopes
                                                          (document_id FK,
                                                           relation_id FK nullable)

legal_dataset_versions (dataset_name, revision) PK
        │  1
        │  (dataset, revision)
        ▼  N
legal_import_history
```

**테이블 관계 설명**:
- `legal_documents`는 `legal_dataset_versions`를 복합키(`source_dataset`+`source_revision`)로
  참조합니다 — 어느 데이터셋의 어느 스냅샷에서 왔는지 항상 추적 가능해야 한다는
  `docs/Architecture.md` 4장 원칙을 DB 제약으로 강제한 것입니다.
- `legal_articles`는 **구조 자체**(트리)를, `legal_chunks`는 **검색 가능한 본문**을
  담당하며 서로 FK로 연결되지 않고 `document_id`와 조번호(chapter_no/article_no 등)만
  공유합니다 — STEP2 지시사항에 `legal_chunks.article_id` 같은 FK가 명시되지 않아
  추가하지 않았습니다(의도적으로 느슨한 결합).
- `legal_relations`는 `source_document_id`→`target_document_id` **원본 방향을 그대로
  보존**합니다(뒤집지 않음, `src/normalize_relations.py`와 동일 원칙).
- `legal_effective_scopes.relation_id`는 nullable FK입니다 — 관계 근거 없이 문서 자체
  상태를 그대로 상속한 scope(예: 관련 폐지/개정 이력이 없는 문서)는 `NULL`을 가집니다.
- `legal_import_history`도 `legal_dataset_versions`를 복합키로 참조해, 어느 파이프라인
  실행이 어느 revision을 대상으로 했는지 추적합니다.

### SQL 실행 검증 방법과 결과 (실제로 실행함)

이번 제출을 준비하며 `sql/*.sql`을 **로컬 disposable PostgreSQL 16 인스턴스**(이
샌드박스 안에서 `apt-get install postgresql`로 설치, Supabase나 VFBCAI 운영 DB가
아님)에 실제로 실행해 검증했습니다:

```bash
createdb legal_rag_schema_test
psql -d legal_rag_schema_test -v ON_ERROR_STOP=1 -f sql/create_schema.sql   # 오류 없이 완료
psql -d legal_rag_schema_test -v ON_ERROR_STOP=1 -f sql/seed.sql            # 오류 없이 완료
# 확인한 것:
#   - 7개 테이블, 27개 인덱스(PK 인덱스 7 + 명시적 인덱스 20) 전부 생성됨
#   - 9개 FOREIGN KEY 제약 전부 정상 등록됨
#   - legal_articles 자기참조 트리 조회(self-join) 정상 동작
#   - 존재하지 않는 document_id로 INSERT 시 FK 위반 에러 정상 발생
#   - status 컬럼에 CHECK 제약 위반 값 INSERT 시 에러 정상 발생
#   - legal_documents UPDATE 시 updated_at 트리거 정상 동작(값이 갱신됨)
psql -d legal_rag_schema_test -v ON_ERROR_STOP=1 -f sql/drop_schema.sql    # 오류 없이 완료, 9개 객체 CASCADE 삭제 확인
dropdb legal_rag_schema_test                                                # 테스트 DB 완전 폐기
```

**이것은 "PostgreSQL 실제 적재"가 아닙니다** — Supabase에 연결하지 않았고, 실제
vbpl.vn 데이터는 전혀 사용하지 않았으며(seed.sql은 STEP1-1 테스트 픽스처와 동일한
합성 예시), 검증 후 테스트 DB 자체를 완전히 삭제했습니다. SQL 문법과 제약조건이
실제 PostgreSQL 엔진에서 오류 없이 동작함을 확인하기 위한 개발 중 검증 절차입니다.

### `src/build_schema.py` 실행 결과 (DB 연결 없는 정적 검증, 제출물)

```bash
python -m src.build_schema --sql-dir sql --output-dir reports
```

이 스크립트는 **어떤 DB에도 연결하지 않고** `sql/create_schema.sql` 텍스트를 파싱해
PK/FK/Index 정합성과 STEP2 컬럼 목록 일치 여부를 검증합니다. 실제 실행 결과
(`reports/schema-validation.md`/`.json`에 저장됨):

- 검사한 테이블: 7개, 인덱스: 20개
- **오류 0건, 경고 0건**

---



## 실행 방법

### 0. 사전 준비 (huggingface.co 접근 가능한 로컬 PC 기준)

```bash
cd services/legal-rag
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # 필요 시 HF_TOKEN 채우기 (공개 데이터셋이라 없어도 됨)
```

### 1. Download 실행 방법

**Sample 실행** (앞 N개 행만 빠르게 받아서 파이프라인 검증용):

```bash
python -m src.download_datasets --sample 1000
python -m src.download_datasets --sample 1000 --dataset vbpl        # vbpl만
python -m src.download_datasets --sample 1000 --dataset th1nhng0    # th1nhng0만
```

**Full 실행** (전체 데이터셋, 합산 약 7.85GB):

```bash
python -m src.download_datasets --full
python -m src.download_datasets --full --dataset vbpl
python -m src.download_datasets --full --resume            # 기본값이 resume이므로 사실 --no-resume의 반대
python -m src.download_datasets --full --no-resume          # 캐시 무시하고 처음부터
```

다운로드 결과는 기본적으로 `data/raw/{vbpl,th1nhng0}/` 아래 저장되고,
`data/raw/download_manifest.json`에 각 파일의 SHA256과 크기가 기록됩니다(재실행 시
손상 여부 자동 검증).

### 2. Audit 실행 방법

```bash
python -m src.audit_datasets --input-dir data/raw --output-dir reports
```

`reports/dataset-audit.md`, `reports/dataset-audit.json`이 생성됩니다. Sample/Full
어느 모드로 받은 데이터든(jsonl/parquet 자동 판별) 그대로 실행 가능합니다.

### 3. Normalize → Deduplicate → Parse → Relations → EffectiveScopes

```bash
python -m src.normalize_documents --input-dir data/raw --output-dir data/normalized
python -m src.deduplicate_documents \
    --input data/normalized/documents.jsonl \
    --output-dir data/normalized --reports-dir reports
python -m src.parse_legal_structure \
    --input data/normalized/documents_deduped.jsonl \
    --output data/normalized/chunks.jsonl
python -m src.normalize_relations \
    --relationships-raw data/raw/th1nhng0/relationships.parquet \
    --chunks data/normalized/chunks.jsonl \
    --output-dir data/normalized --reports-dir reports
python -m src.effective_scopes \
    --chunks data/normalized/chunks.jsonl \
    --documents data/normalized/documents_deduped.jsonl \
    --relationships data/normalized/relationships.jsonl \
    --output data/normalized/effective_scopes.jsonl
```

(Full 다운로드 시 `relationships` 파일의 실제 경로/확장자는 `download_datasets.py`가
snapshot한 repo 구조에 따라 달라질 수 있습니다 — `data/raw/th1nhng0/` 아래를
`find`로 확인 후 `--relationships-raw` 값을 맞춰 지정하세요.)

### Revision 변경 방법

각 소스 데이터셋이 갱신되어 다른 시점의 스냅샷을 받아야 하는 경우, 아래 두 곳의 상수를
**동일한 값으로** 함께 수정해야 합니다(하나만 바꾸면 다운로드본과 정규화 로직의 revision
표기가 어긋납니다):

1. `src/download_datasets.py`의 `VBPL_VN_REVISION` / `VIETNAMESE_LEGAL_DOCS_REVISION`
2. `src/normalize_documents.py`의 동일 이름 상수
3. `.env.example`의 `VBPL_VN_REVISION` / `VIETNAMESE_LEGAL_DOCS_REVISION` (문서화 목적)

새 revision(commit SHA)은 `https://huggingface.co/datasets/<repo>/tree/main`에서
"History: N commits" 링크로 확인할 수 있습니다.

### 4. Schema 빌드/검증 (네트워크 불필요, DB 불필요, 지금 바로 실행 가능)

```bash
python -m src.build_schema --sql-dir sql --output-dir reports
```

`reports/schema-validation.md`/`.json`이 생성됩니다. 이 명령은 DB 연결 없이도
항상 실행 가능합니다.

**실제 PostgreSQL에 스키마를 적용하려면** (huggingface.co와 무관하게 로컬/스테이징
PostgreSQL만 있으면 실행 가능):

```bash
createdb <원하는 DB 이름>
psql -d <DB 이름> -f sql/create_schema.sql
psql -d <DB 이름> -f sql/seed.sql          # 선택 사항 — 합성 검증 데이터
# 되돌리려면:
psql -d <DB 이름> -f sql/drop_schema.sql
```

**주의**: 위 명령은 사용자가 지정한 PostgreSQL(로컬 또는 스테이징)에 대한 것이며,
STEP2에서 Supabase 연결은 명시적으로 금지되어 있으므로 Supabase 접속 정보로
실행하지 않습니다.

### 5. 테스트 실행 (네트워크 불필요, 지금 바로 실행 가능)

```bash
pip install pytest
python -m pytest tests/ -v
```

178개 테스트가 전부 통과해야 정상입니다(합성 데이터 기반이므로 huggingface.co 접근이
없어도 실행됩니다). 이 중 48개(`test_dataset_loader.py`/`test_dataset_mapper.py`/
`test_dataset_validator.py`/`test_validate_real_dataset.py`/
`test_search_quality_report.py`)가 이번 STEP3-1에서 추가되었습니다.

### 6. Legal Search Engine 실행 (네트워크 불필요, DB 불필요, 지금 바로 실행 가능)

```bash
python -m src.search_cli --fixture --query "152/2020/NĐ-CP"    # 내장 합성 데이터로 검색
python -m src.search_cli --query "..." --status active           # 실제 파이프라인 산출물로 검색
python -m src.search_cli --validate                                 # 자체 검증 + 리포트 생성
```

자세한 사용법과 검색 순서는 위 "STEP3 — Legal Search Engine 구조" / "CLI 사용 예시"
절 참고.

### 7. 실제 VBPL 데이터셋 연결 방법 (STEP3-1 신규 — 전체 순서)

**7-1. Local Download** (huggingface.co 접근 가능한 로컬 PC에서만):

```bash
python -m src.dataset_loader --dataset all --download --print-summary
# 샘플만 빠르게 받아 파이프라인 검증하려면:
python -m src.dataset_loader --dataset all --download --sample 1000 --print-summary
```

내부적으로 STEP1-1 `download_datasets.py`의 revision 고정/resume/SHA256 검증을
그대로 사용합니다(중복 구현 없음).

**7-2. Normalize (Mapping)**:

```bash
python -m src.dataset_mapper --data-dir data/raw --dataset all \
    --output data/normalized/documents_mapped.jsonl --reports-dir reports
```

실제 컬럼명이 문서화된 것과 다르거나 일부 누락되어 있어도 alias 매핑으로
최대한 흡수하며, `reports/dataset-mapping.json`에 어떤 필드가 몇 건이나
누락되었는지 남습니다.

**7-3. Validation**:

```bash
python -m src.dataset_validator --documents data/normalized/documents_mapped.jsonl \
    --relationships-raw data/raw/th1nhng0/relationships.parquet \
    --output-dir reports
```

`reports/dataset-validation.md`/`.json` 생성(Official URL/문서번호/날짜/Status/
Title/Relationship/Content/Metadata/중복/누락/형식오류 전 카테고리).

**7-4. 전체 파이프라인 검증** (Normalize→Dedup→구조파싱→Chunk→Relationship→
EffectiveScope→검색 가능 여부까지 한 번에):

```bash
python -m src.validate_real_dataset --data-dir data/raw --dataset all --reports-dir reports
```

**7-5. Search Quality Report**:

```bash
python -m src.search_quality_report --data-dir data/raw --dataset all --output-dir reports
```

`reports/search-quality.md`/`.json` 생성(Exact/Keyword 성공률, Document/Article/
Relationship/Status Match, Parsing/누락/중복/HTML 오류).

**합성 데이터로 전체 순서를 미리 확인해보려면** (네트워크 불필요, 이번 제출에서
실제로 실행한 방법과 동일):

```bash
python -m src.validate_real_dataset --fixture --reports-dir reports
python -m src.search_quality_report --fixture --output-dir reports
```

---

## STEP1-1/STEP2 요약 (과거 기록, 변경 없음)

STEP1-1에서 구현한 Download → Audit → Normalize → Deduplicate → Parse → Relations →
EffectiveScopes 파이프라인과 STEP2에서 설계한 PostgreSQL 스키마는 이번 STEP3에서
전혀 수정하지 않았습니다. 실행 상태는 이전과 동일합니다: 코드 구현·71개 테스트(현재는
search 테스트 59개가 추가되어 130개)·CLI 6종(STEP1-1) + build_schema(STEP2) +
search_cli(STEP3) end-to-end 검증까지 완료, 실제 Hugging Face 다운로드만 미실행
(`huggingface.co` `403 host_not_allowed`).

---

## 데이터셋 조사 결과 (공개 README/Dataset Card 기준)

### 1. `tmquan/vbpl-vn`

- **실제 위치**: `https://huggingface.co/datasets/tmquan/vbpl-vn` (GitHub 아님)
- **고정 Revision (commit)**: `11c902856b7a389788853fdd39b4998a5effa490`
- **규모**: 158,822 문서, 단일 `documents` config (train split), 총 3.86 GB (parquet)
- **라이선스**: CC-BY-4.0 (원본은 vbpl.vn, robots.txt `Allow: /` 공개 포털)
- **특징**:
  - 문서 단위 1행, 베트남어 정규화(NFC + 1984년 이후 현대 정서법) 마크다운 본문 포함
  - **계층 구조 내장**: `structure_json` 필드에 document → section → paragraph →
    sentence 4단계 구조, 각 단위마다 char-span 백포인터 포함
  - `extracted_json` 필드에 일반 NER + 법령 참조(statute_refs) 추출 결과 포함
  - `doc_type`(ASCII slug) + `legal_type`(베트남어 전체명) 이중 표기
  - `scope`: `trung_uong`(중앙, 34.3%) / `dia_phuong`(지방 63개 성/시, 65.7%)
  - **관계(개정/인용/폐지) 그래프는 없음**
  - 효력상태 필드가 공개 스키마 표에 없음 — Audit 단계에서 실 데이터로 재확인 필요

### 2. `th1nhng0/vietnamese-legal-documents`

- **실제 위치**: `https://huggingface.co/datasets/th1nhng0/vietnamese-legal-documents`
  (GitHub 아님)
- **고정 Revision (commit)**: `0a39ad7eae8e6c188cb225c4b1443c3b346461d8`
- **규모**: 4개 config, 총 3.99 GB
  - `metadata` (153,420행, 16개 필드)
  - `content` (178,665행, raw HTML 본문)
  - `relationships` (897,890행, 문서 간 방향성 edge — 개정/인용/폐지 등)
  - `legacy` (metadata 518,601행 + content 518,235행, 영문 필드명)
- **라이선스**: 원문 Public Domain, **편집본은 CC-BY-4.0**
- **특징**:
  - **관계 그래프가 핵심 강점** — tmquan에는 없는 구조화된 edge 테이블
  - `content`는 원본 HTML 그대로 — 정규화 안 됨(정제는 `normalize_vietnamese_text`가 담당)
  - 일부 문서는 `metadata`에는 있으나 `content`가 없음

### 두 데이터셋 간 관계

둘 다 동일 원천(`vbpl.vn`)을 크롤링한 것이라 문서 ID 체계가 다르고 상당 부분 중복됩니다.
`src/deduplicate_documents.py`가 5단계 우선순위(Official URL → sourceDocumentId →
문서번호+시행일+발행기관 → 제목+시행일+발행기관 → contentHash 보조키)로 이를 해소합니다
(합성 데이터로 5단계 전부 테스트 완료, `tests/test_deduplicate_documents.py` 참고).

---

## 폴더 구조

```
services/legal-rag/
├── README.md                     ← 본 문서
├── requirements.txt                ← 실제 설치·테스트된 의존성 버전
├── .env.example                     ← HF_TOKEN, Revision 등 환경변수 예시
├── sql/                               ← STEP2 신규
│   ├── create_schema.sql               ← 순수 DDL, 로컬 disposable PG로 실행 검증됨
│   ├── drop_schema.sql                  ← legal_rag 스키마 전체 삭제(CASCADE)
│   └── seed.sql                          ← 합성 검증 데이터(STEP1-1 테스트 픽스처와 동일 예시)
├── docs/
│   ├── Architecture.md              ← STEP1(설계) 산출물, 변경 없음
│   ├── Schema.md                     ← STEP1(설계) 산출물, 변경 없음
│   └── Pipeline.md                    ← STEP1(설계) 산출물, 변경 없음
├── data/
│   ├── raw/           (.gitignore 처리 대상, 현재 비어있음 — download_datasets.py 실행 후 채워짐)
│   ├── normalized/    (현재 비어있음)
│   └── pilot/          (현재 비어있음, extract_work_permit_corpus.py는 아직 스텁)
├── reports/             (Audit/Dedup/Schema/Search/Dataset Validation 리포트 저장 위치)
│   ├── schema-validation.md/.json      ← STEP2 산출물(보존)
│   ├── search-validation.md/.json      ← STEP3 산출물(보존)
│   ├── dataset-validation.md/.json     ← STEP3-1 신규
│   ├── real-dataset-pipeline.md/.json  ← STEP3-1 신규
│   ├── search-quality.md/.json         ← STEP3-1 신규
│   └── dataset-mapping.json             ← STEP3-1 신규 (dataset_mapper.py 단독 실행 시)
├── tests/                (178개 테스트, 전부 실행·통과 확인됨)
│   ├── conftest.py
│   ├── test_utils.py
│   ├── test_audit_datasets.py
│   ├── test_normalize_documents.py
│   ├── test_deduplicate_documents.py
│   ├── test_parse_legal_structure.py
│   ├── test_normalize_relations.py
│   ├── test_effective_scopes.py
│   ├── test_build_schema.py            ← STEP2 (9개 테스트)
│   ├── test_integration_pipeline.py    ← 전체 체인 end-to-end 통합 테스트
│   ├── test_search_exact.py             ← STEP3 (18개 테스트)
│   ├── test_search_keyword.py            ← STEP3 (14개 테스트)
│   ├── test_search_filters.py             ← STEP3 (15개 테스트)
│   ├── test_search_engine.py               ← STEP3 (12개 테스트)
│   ├── test_dataset_loader.py               ← STEP3-1 신규 (6개 테스트)
│   ├── test_dataset_mapper.py                ← STEP3-1 신규 (9개 테스트)
│   ├── test_dataset_validator.py              ← STEP3-1 신규 (18개 테스트)
│   ├── test_validate_real_dataset.py           ← STEP3-1 신규 (7개 테스트)
│   └── test_search_quality_report.py            ← STEP3-1 신규 (8개 테스트)
└── src/
    ├── schema.py                        ← Canonical Schema 공유 dataclass (STEP1-1)
    ├── utils.py                          ← 실제 구현 (해시/날짜/문서번호/베트남어 정규화)
    ├── download_datasets.py              ← 실제 구현 (미실행, huggingface.co 접근 필요)
    ├── audit_datasets.py                  ← 실제 구현
    ├── normalize_documents.py             ← 실제 구현
    ├── deduplicate_documents.py            ← 실제 구현 (5단계 우선순위)
    ├── parse_legal_structure.py            ← 실제 구현 (Phần/Chương/Mục/Điều/Khoản/Điểm)
    ├── normalize_relations.py              ← 실제 구현 (cross-document + internal relation)
    ├── effective_scopes.py                  ← 실제 구현 (부분실효 지원)
    ├── build_schema.py                       ← STEP2 — SQL 정적 검증(DB 연결 없음)
    ├── search_models.py                       ← STEP3 — Document/Chunk/SearchResult/SearchFilters
    ├── search_exact.py                         ← STEP3 — 법령번호/조문/URL/Document ID
    ├── search_keyword.py                        ← STEP3 — phrase/prefix/substring
    ├── search_filters.py                         ← STEP3 — Filter Engine
    ├── search_engine.py                           ← STEP3 — Exact→Keyword→Filter→Ranking 통합
    ├── search_cli.py                               ← STEP3 — CLI + Validation
    ├── dataset_loader.py                            ← STEP3-1 신규 — 로드(포맷 자동인식)+다운로드(로컬 PC 전용)
    ├── dataset_mapper.py                             ← STEP3-1 신규 — alias 기반 Canonical 매핑
    ├── dataset_validator.py                           ← STEP3-1 신규 — 필드/관계/메타데이터 품질 검증
    ├── validate_real_dataset.py                        ← STEP3-1 신규 — 전체 파이프라인 오케스트레이터
    ├── search_quality_report.py                         ← STEP3-1 신규 — 검색 품질 지표
    └── extract_work_permit_corpus.py                     ← 아직 스텁 (STEP1-1/STEP2/STEP3/STEP3-1 범위 밖)
```

---

## 알려진 한계 (정직하게 명시)

### STEP3-1 신규

- **실제 Hugging Face 데이터로 단 한 번도 실행해보지 못했습니다.** 이 문서의 모든
  실행 결과("100% 성공률" 포함)는 `build_realistic_fixture_rows()`가 만든
  합성 데이터 기준입니다. 실제 158,822/153,420건 규모 데이터에는 이 fixture가
  예상하지 못한 형식 변주(예: 로마숫자 Khoản, 여러 줄에 걸친 Điều 제목,
  더 다양한 relationship 라벨)가 존재할 가능성이 높습니다.
- **`dataset_mapper.py`의 alias 목록은 두 데이터셋의 공개 Dataset Card 스키마
  표만 근거로 작성했습니다.** 실제 parquet 파일을 열어보면 컬럼명이 다를 수
  있으며, 그 경우 해당 alias 목록에 실제 컬럼명을 추가해야 합니다(코드 구조상
  `FIELD_ALIASES` dict에 항목만 추가하면 되도록 설계했습니다).
- **`dataset_validator.py`의 relationship 검증은 th1nhng0의 numeric ID
  체계(`doc_id`/`other_doc_id`)만 지원합니다.** tmquan 쪽에는애초에 관계
  그래프가 없으므로(STEP1 조사 결과) 이 부분은 설계상 의도된 범위입니다.
- **Article Match/Keyword 성공률 계산은 "chunk의 첫 단어/조번호로 역질의"
  방식입니다.** 이는 "인덱싱된 내용이 그 자체로 검색 가능한가"를 확인하는
  것이지, 사용자가 실제로 입력할 법한 자연어 쿼리에 대한 품질 지표가
  아닙니다 — 진짜 검색 품질 평가(재현율/정밀도)는 실제 사용자 쿼리 로그나
  전문가가 만든 골드 쿼리셋이 있어야 가능하며, 이는 이번 단계 범위 밖입니다.
- **`validate_real_dataset.py`가 사용하는 임시 디렉토리(`tempfile.TemporaryDirectory`)
  방식은 대용량 실 데이터(수십만 건)에서는 메모리/디스크 사용량이 클 수
  있습니다.** 이번 STEP3-1은 "정확성 검증"이 목표이므로 성능 최적화는
  하지 않았습니다(STEP3의 "정확성 우선, 성능은 다음 단계" 원칙과 동일).

### STEP3에서 이월(변경 없음)

- RRF는 구현하지 않았습니다. Ranking은 "Exact 우선, Keyword 다음" 단순 점수
  정렬만 구현했습니다.
- `original_text`와 `normalized_text`가 동일한 값을 공유합니다(STEP1-1의
  `LegalChunk`가 정규화된 본문만 chunk 단위로 보존하기 때문).
- Keyword Search는 선형 스캔입니다(실 데이터 규모에서 성능 문제 가능 — STEP3의
  목표는 "정확성"이지 "성능"이 아니므로 의도적으로 단순하게 구현했습니다).
- `normalize_relations.py`의 relation_type 매핑이 잠정 패턴이라는 한계가
  Filter Engine의 `relation_type` 필터와 `dataset_validator.py`의 relationship
  검증에도 그대로 전파됩니다.
- CLI의 필터 전용 browse 모드는 `match_type="filter_only"`, `score=0.0`으로
  표시됩니다(추측이 아니라 의도적 표기).

### STEP1-1/STEP2에서 이월(변경 없음)

- `extract_work_permit_corpus.py`는 여전히 스텁 상태입니다.
- `legal_effective_scopes`는 문서 단위 관계만으로 생성되며, article 단위 정밀도는
  없습니다.
- `Điều/Khoản/Điểm` 정규식 파서는 합성 샘플로만 검증되었습니다.
- `sql/seed.sql`은 실제 vbpl.vn 데이터가 아니라 합성 예시입니다.
- `legal_articles`의 컬럼 설계는 STEP2 지시사항에 명시되지 않아 STEP1 설계를
  근거로 직접 채운 것입니다(위 "STEP2 — Legal Knowledge Base 스키마" 절 참고).
- `article_id`/`relation_id`/`scope_id`/`import_id` 대리키는 형식이 정해지지
  않아 `bigint IDENTITY`로 설계했습니다.
- `legal_relations.source_article`/`target_article`은 대부분 NULL로 채워질
  것으로 예상됩니다(문서 단위 관계만 확보 가능하기 때문).
- PostgreSQL FTS(`search_text` 컬럼의 GIN/tsvector 인덱스)는 아직 만들지
  않았습니다. `pg_trgm` 확장만 활성화되어 있습니다.

---

## 절대 수정 금지 (재확인)

이번 작업 및 향후 STEP2~9 전체에서 아래는 절대 건드리지 않습니다:

DB Schema(기존 Supabase) · CRM · CHECK · VERIFY · REGISTER · PROTECT · Storage ·
OpenAI 연결 · AI Report · Documents · Routing · Authentication · Email · Admin
Workspace · 기존 API

`services/legal-rag/`는 독립 프로젝트이며, 향후 통합 시에도 **Search API 형태로만**
기존 VFBCAI와 연결됩니다(자세한 통합 경계는 `docs/Architecture.md` 참고).

---

## 다음 단계

| STEP | 내용 | 상태 |
|---|---|---|
| STEP1 | 설계 (Architecture/Schema/Pipeline 문서) | 완료 |
| STEP1-1 | 실행 가능한 Data Pipeline 코드 구현 | 완료 — 실제 다운로드만 미실행 |
| STEP1 재개 | huggingface.co 접근 가능 환경에서 실제 Download(Sample→Full) + Audit + 정규화 실행, "알려진 한계" 항목 검증·보강 | 미착수 |
| STEP2 | Legal Knowledge Base SQL Schema 설계 + 정적 검증 | 완료 — 실제 데이터 적재는 미실행, Supabase 미연결 |
| STEP2 재개 | STEP1 재개로 확보한 실 데이터를 정규화 파이프라인으로 처리 후 SQL 로더로 실제 적재(로컬/스테이징 PG) | 미착수 |
| STEP3 | Legal Search Engine (Exact + Keyword, 정확한 검색) | 완료 — 합성 데이터로 검증 |
| STEP3-1 | 실제 VBPL 데이터셋 구조 기준 Search Engine 검증·보완 | **완료 (본 문서)** — 실 스키마 모사 합성 데이터(fixture)로 검증, 실제 다운로드는 사용자 로컬 PC 몫 |
| STEP3-1 재개 | huggingface.co 접근 가능한 로컬 PC에서 `dataset_loader.py --download` 실행 → `validate_real_dataset.py`/`search_quality_report.py`를 `--fixture` 없이 실제 데이터로 재실행 → alias 목록/relation_type 매핑/파서 보강 | 미착수 |
| STEP4 | Hybrid Search | 미착수 |
| STEP5 | pgvector / Embedding | 미착수 |
| STEP6 | RRF Ranking | 미착수 |
| STEP7 | Legal Search API (FastAPI) | 미착수 |
| STEP8 | OpenAI AI Document Review | 미착수 |
| STEP9 | Admin AI Workspace 연동 | 미착수 |
