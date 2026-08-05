# Schema — VFBCAI Legal Intelligence Platform

**상태: 설계 완료 (DDL 미실행, 실제 DB 없음)**

---

## 1. Canonical Document Schema

두 원천 데이터셋의 필드명·구조가 서로 다르므로(`Schema.md` 하단 매핑표 참고), 아래
공통 모델로 정규화합니다. 원본 데이터는 절대 수정하지 않고(`data/raw/`는 불변),
정규화 결과만 `data/normalized/`에 별도 저장합니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `documentId` | string (PK) | 내부 고유 ID. `{sourceDataset}:{sourceDocumentId}` 형태로 생성(예: `tmquan:186739`) |
| `sourceDataset` | enum | `tmquan_vbpl_vn` \| `th1nhng0_vietnamese_legal` \| `th1nhng0_legacy` |
| `sourceRevision` | string | 다운로드 시점 고정한 HF commit revision (Architecture.md 4장 참고) |
| `sourceDocumentId` | string | 원본 데이터셋 내 ID (`doc_name`/`item_id` 또는 `id`) |
| `officialUrl` | string, nullable | vbpl.vn 원문 링크 (`source_url`) |
| `gatewayUrl` | string, nullable | 원문 API 게이트웨이 링크 (`api_url`, tmquan에만 존재) |
| `documentNumber` | string[] | 정규화된 문서번호 목록 (예: `["43/2026/NĐ-CP"]`). 중복판정의 핵심 키 |
| `documentType` | string | ASCII slug (`nghi_dinh`, `thong_tu`, `quyet_dinh` 등) — `Luật Ban hành Văn bản Quy phạm Pháp luật 2015` 체계 기준 |
| `title` | string, nullable | 문서 제목 |
| `issuingAuthority` | string, nullable | 발행기관 |
| `issueDate` | date, nullable | 시행령 공포일. 중복판정의 핵심 키 |
| `effectiveDate` | date, nullable | 발효일 |
| `expiryDate` | date, nullable | 폐지/만료일 |
| `status` | enum | 표준화된 효력상태 (2장 참고) |
| `rawStatus` | string | 원본 효력상태 값 그대로 보존 (표준화 매핑 검증·감사용) |
| `contentHtml` | string, nullable | 원본 HTML 본문(있는 경우만, 주로 `th1nhng0`) |
| `contentText` | string, nullable | 정제된 마크다운/텍스트 본문 (주로 `tmquan`의 `markdown` 필드) |
| `contentHash` | string | 정제된 본문의 SHA-256 해시. 중복판정 보조 키 |
| `importedAt` | timestamp | 정규화 파이프라인 실행 시각 |

**절대 원칙**: 원본 데이터(raw)는 수정하지 않는다 — VFBCAI 마스터문서 16장 "허위 법령
정보" 금지 원칙과 동일한 취지로, 원문 손상/왜곡을 방지하기 위함.

---

## 2. 효력 상태 표준화

| 표준값 | 설명 | `tmquan/vbpl-vn` 원본 매핑(추정, 실 데이터 확인 필요) | `th1nhng0` `tinh_trang_hieu_luc` 매핑 |
|---|---|---|---|
| `active` | 현재 유효 | (structure_json/extracted_json에 직접적 상태 필드 없음 — Audit 단계에서 재확인 필요) | `Còn hiệu lực` |
| `partially_expired` | 일부 조항만 효력 상실 | 〃 | `Hết hiệu lực một phần` |
| `fully_expired` | 전체 효력 상실 | 〃 | `Hết hiệu lực toàn bộ` |
| `amended` | 개정됨(개정본 존재) | 〃 | `Đã sửa đổi` 계열 |
| `replaced` | 대체됨 | 〃 | `Thay thế` 계열 |
| `suspended` | 효력 정지 | 〃 | `Ngưng hiệu lực` |
| `unknown` | 상태 정보 없음/미분류 | 대부분(효력상태 필드 자체가 tmquan 스키마에 없음) | 값 없음 |

**주의**: `tmquan/vbpl-vn`의 공개 Dataset Card 스키마 표에는 효력상태(`tinh_trang_hieu_luc`
상당 필드)가 명시되어 있지 않습니다. Audit 단계(STEP1 재개 시)에서 실제 파케이 파일을
열어 확인이 필요하며, 없다면 `th1nhng0` 쪽 `metadata.tinh_trang_hieu_luc` 값을 우선
소스로 사용하고 tmquan 레코드에는 병합 시 상속시키는 방식을 검토합니다. **원본 상태값
(`rawStatus`)은 표준화 여부와 무관하게 항상 그대로 보존합니다.**

---

## 3. 법률 구조 파싱 계층

```
Nghị định (법령 최상위)
  └─ Phần   (편)       ← 대형 법전(Bộ luật)에만 존재
      └─ Chương  (장)
          └─ Mục    (절)     ← 선택적, 없는 문서 다수
              └─ Điều  (조)   ← Chunk 기본 단위
                  └─ Khoản (항)
                      └─ Điểm (호)
```

- **Chunk 기본 단위는 Điều(조)**. 짧은 조문은 그대로 1개 chunk.
- 긴 조문(예: 임계치 초과 — 구체적 문자수 임계값은 실 데이터 분포 확인 후 Audit
  리포트 기준으로 STEP1 재개 시 확정)은 Khoản/Điểm 단위까지 추가 분리.
- 각 Chunk는 **상위 Context를 breadcrumb 형태로 포함**(예: `Nghị định 152/2020/NĐ-CP >
  Chương III > Điều 9 > Khoản 2`) — 검색 결과에서 조문만 보고도 어느 법령·어느 장의
  일부인지 즉시 알 수 있도록 함.
- `tmquan/vbpl-vn`의 `structure_json`(document→section→paragraph→sentence)은 이
  Phần/Chương/Mục/Điều/Khoản/Điểm 계층과 **1:1로 대응하지 않을 수 있음** — Audit
  단계에서 `structure_json.sections[].kind` 값의 실제 분포를 확인하여 재매핑 규칙을
  정해야 합니다(현재는 설계만, 실데이터 미확인).

---

## 4. Legal Chunk Schema

| 필드 | 타입 | 설명 |
|---|---|---|
| `chunkId` | string (PK) | `{documentId}#{path}` (예: `tmquan:186739#chuong3.dieu9.khoan2`) |
| `documentId` | string (FK) | Canonical Document Schema 참조 |
| `level` | enum | `dieu` \| `khoan` \| `diem` |
| `parentChunkId` | string, nullable | 상위 Chunk (Điều의 부모는 null, Khoản의 부모는 해당 Điều) |
| `path` | string | 계층 경로 (예: `Chương III > Điều 9 > Khoản 2`) |
| `breadcrumbTitle` | string | 사람이 읽을 수 있는 축약 경로 (검색 결과 표시용) |
| `text` | string | Chunk 본문 |
| `charStart` / `charEnd` | int | 원본 `contentText` 내 char-span (tmquan의 `structure_json` 방식과 동일 원칙 채택) |
| `documentNumber` | string[] | 상위 문서의 문서번호 (조인 없이 바로 필터링 가능하도록 비정규화 보존) |
| `status` | enum | 상위 문서의 표준화 효력상태 (비정규화 보존, 검색 필터용) |

---

## 5. Relationship Graph Schema

`th1nhng0/vietnamese-legal-documents`의 `relationships` config(897,890 edges)를
Canonical `documentId` 체계로 재매핑합니다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `edgeId` | string (PK) | `{sourceDocumentId}->{targetDocumentId}:{relationType}` |
| `sourceDocumentId` | string (FK) | 관계의 시작 문서 (Canonical `documentId`) |
| `targetDocumentId` | string (FK) | 관계의 대상 문서 |
| `relationType` | enum | `amends`(개정) \| `cites`(인용) \| `repeals`(폐지) \| `replaces`(대체) \| `references`(참조) \| `unknown`(원본 라벨 미분류) |
| `rawRelationLabel` | string | 원본 `relationship` 라벨 그대로 보존 |
| `sourceDataset` | string | 이 edge가 유래한 데이터셋 (현재는 `th1nhng0` 고정, tmquan에는 구조화된 관계 그래프 없음) |
| `confidence` | float, nullable | 향후 자체 추출 로직 추가 시를 위한 필드 (현재는 원본 그래프 그대로 사용하므로 null) |

**주의**: `relationType`은 원본 `relationship` 라벨(베트남어 자유 텍스트로 추정)을
표준 enum으로 매핑해야 하나, 실제 라벨 종류와 분포는 Audit 단계에서 확인 후 매핑표를
확정합니다(현재는 설계만).

---

## 6. PostgreSQL Schema (설계안, 미실행)

```sql
-- ⚠️ 설계안입니다. 이번 STEP1에서는 실행하지 않습니다.
-- 기존 VFBCAI Supabase 프로젝트와 분리된 별도 DB/스키마를 전제로 합니다.

CREATE SCHEMA IF NOT EXISTS legal_rag;

CREATE TABLE legal_rag.datasets_registry (
    source_dataset      text PRIMARY KEY,
    source_revision     text NOT NULL,
    license             text NOT NULL,
    downloaded_at        timestamptz,
    row_count             integer,
    notes                  text
);

CREATE TABLE legal_rag.legal_documents (
    document_id          text PRIMARY KEY,
    source_dataset       text NOT NULL REFERENCES legal_rag.datasets_registry(source_dataset),
    source_revision      text NOT NULL,
    source_document_id   text NOT NULL,
    official_url          text,
    gateway_url            text,
    document_number       text[],
    document_type          text,
    title                    text,
    issuing_authority       text,
    issue_date               date,
    effective_date          date,
    expiry_date              date,
    status                   text NOT NULL DEFAULT 'unknown',
    raw_status               text,
    content_html             text,
    content_text              text,
    content_hash              text,
    imported_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_legal_documents_doc_number ON legal_rag.legal_documents USING GIN (document_number);
CREATE INDEX idx_legal_documents_issue_date ON legal_rag.legal_documents (issue_date);
CREATE INDEX idx_legal_documents_status ON legal_rag.legal_documents (status);
CREATE INDEX idx_legal_documents_content_hash ON legal_rag.legal_documents (content_hash);

CREATE TABLE legal_rag.legal_chunks (
    chunk_id              text PRIMARY KEY,
    document_id           text NOT NULL REFERENCES legal_rag.legal_documents(document_id),
    level                  text NOT NULL,          -- dieu | khoan | diem
    parent_chunk_id        text REFERENCES legal_rag.legal_chunks(chunk_id),
    path                     text NOT NULL,
    breadcrumb_title        text,
    text                     text NOT NULL,
    char_start                integer,
    char_end                  integer,
    document_number         text[],                 -- 비정규화 보존
    status                    text,                   -- 비정규화 보존
    -- STEP5(pgvector) 이후 추가 예정 컬럼 (이번 단계에서 생성하지 않음):
    -- embedding             vector(2048)
    tsv                        tsvector                -- STEP3(Keyword Search)에서 생성 트리거로 채움
);

CREATE INDEX idx_legal_chunks_document_id ON legal_rag.legal_chunks (document_id);
CREATE INDEX idx_legal_chunks_tsv ON legal_rag.legal_chunks USING GIN (tsv);

CREATE TABLE legal_rag.legal_relationships (
    edge_id                text PRIMARY KEY,
    source_document_id     text NOT NULL REFERENCES legal_rag.legal_documents(document_id),
    target_document_id     text NOT NULL REFERENCES legal_rag.legal_documents(document_id),
    relation_type            text NOT NULL,
    raw_relation_label       text,
    source_dataset            text NOT NULL,
    confidence                 real
);

CREATE INDEX idx_legal_relationships_source ON legal_rag.legal_relationships (source_document_id);
CREATE INDEX idx_legal_relationships_target ON legal_rag.legal_relationships (target_document_id);

-- Pilot Corpus (Work Permit) 전용 뷰/테이블 — STEP1 재개 시 extract_work_permit_corpus.py
-- 결과를 적재할 위치로 예약
CREATE TABLE legal_rag.pilot_work_permit_corpus (
    document_id             text PRIMARY KEY REFERENCES legal_rag.legal_documents(document_id),
    matched_keywords         text[],
    relation_depth             integer,  -- 원 키워드 문서로부터 관계 그래프 몇 단계 떨어져 있는지
    included_reason            text
);
```

**pgvector 확장(embedding 컬럼)은 STEP5에서 도입합니다. 이번 STEP1 설계안에는 포함하되
실제로 컬럼을 생성/활성화하지 않습니다.**

---

## 7. 원본 → Canonical 필드 매핑 참고표

| Canonical | `tmquan/vbpl-vn` | `th1nhng0` `metadata` | `th1nhng0` `content` | `th1nhng0` `legacy/metadata` |
|---|---|---|---|---|
| `sourceDocumentId` | `doc_name`/`item_id` | `id` | `id` | `id` |
| `officialUrl` | `source_url` | (없음, Audit 시 확인 필요) | — | — |
| `gatewayUrl` | `api_url` | — | — | — |
| `documentNumber` | `doc_number` (list) | `so_ky_hieu` (단일 string, 파싱 필요) | — | `document_number` |
| `documentType` | `doc_type` (slug) | `loai_van_ban` (베트남어 전체명, slug화 필요) | — | `legal_type` (영문) |
| `title` | `title` | `title` | — | `title` |
| `issuingAuthority` | `issuing_authority` | `co_quan_ban_hanh` | — | `issuing_authority` |
| `issueDate` | `issue_date` | `ngay_ban_hanh` (`DD/MM/YYYY`, 변환 필요) | — | `issuance_date` (`YYYY-MM-DD`) |
| `effectiveDate` | (없음, Audit 필요) | `ngay_co_hieu_luc` | — | `effect_date` |
| `expiryDate` | (없음) | `ngay_het_hieu_luc` | — | `effectless_date` |
| `rawStatus` | (없음) | `tinh_trang_hieu_luc` | — | `effect_status` |
| `contentHtml` | (없음, `body_html`로만 소스 표시) | — | `content_html` | — |
| `contentText` | `markdown` | — | — | `content` (legacy/content split) |
| `contentHash` | `text_hash` (파이프라인 내부 재계산) | (직접 생성 필요) | (직접 생성 필요) | (직접 생성 필요) |

이 표의 "없음"/"Audit 필요" 항목은 실제 파케이 파일을 열어봐야 확정되며, STEP1 재개 시
`audit_datasets.py`가 이 표를 검증·보완하는 역할을 겸합니다.
