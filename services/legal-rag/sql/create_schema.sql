-- ============================================================================
-- VFBCAI Legal Intelligence Platform — Legal Knowledge Base Schema
-- STEP2: 검색 가능한 Legal DB 데이터 모델
--
-- ⚠️ 이 SQL은 이번 단계에서 Supabase나 VFBCAI 운영 DB에 실행되지 않는다.
--    services/legal-rag 전용 별도 스키마(legal_rag)를 전제로 설계했으며,
--    기존 VFBCAI(public 스키마 등)에는 어떤 영향도 주지 않는다.
--
-- 기준: docs/Schema.md(STEP1 Canonical Schema) + src/schema.py의 dataclass 정의.
--       컬럼은 STEP2 지시사항에 명시된 목록을 그대로 따르며, 추측으로 컬럼을
--       추가하지 않았다. legal_articles만 STEP2 지시사항에 구체적 컬럼 목록이
--       없어(“문서→장→조→항→호 계층 저장”이라는 목적만 명시됨) STEP1의
--       Phần/Chương/Mục/Điều/Khoản/Điểm 6단계 계층 설계를 근거로 직접
--       설계했다 — 이 부분은 추측이 아니라 STEP1에서 이미 확정된 설계의
--       구현이며, README.md "legal_articles 설계 근거"에 동일 내용을 명시했다.
--
-- Migration 프레임워크(Alembic/Prisma 등) 없이 순수 SQL만 사용한다.
-- ============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS legal_rag;
SET search_path TO legal_rag, public;

-- pg_trgm: docs/Schema.md에서 설계한 PostgreSQL FTS 전략(simple config + pg_trgm)의
-- 사전 준비. 이번 단계에서 실제 검색 인덱스(GIN on search_text)는 만들지 않는다
-- (Hybrid Search/BM25는 이번 STEP2 범위에서 명시적으로 금지됨) — 확장만 활성화해
-- 다음 단계(STEP3 Keyword Search)에서 바로 쓸 수 있도록 준비한다.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ----------------------------------------------------------------------------
-- 공통: updated_at 자동 갱신 트리거 함수
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION legal_rag.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. legal_dataset_versions
--    다운로드한 원천 데이터셋의 버전(리비전) 이력. download_datasets.py의
--    manifest, docs/Architecture.md 4장의 revision 고정값과 대응.
-- ----------------------------------------------------------------------------

CREATE TABLE legal_rag.legal_dataset_versions (
    dataset_name    text NOT NULL,
    revision        text NOT NULL,
    download_date   timestamptz,
    sha256          text,
    license         text,
    verified        boolean NOT NULL DEFAULT false,
    PRIMARY KEY (dataset_name, revision)
);

COMMENT ON TABLE legal_rag.legal_dataset_versions IS
    '다운로드한 원천 Hugging Face 데이터셋의 revision별 이력. dataset_name+revision이 자연키.';

-- ----------------------------------------------------------------------------
-- 2. legal_documents
--    Canonical Document (docs/Schema.md 1장, src/schema.py CanonicalDocument).
--    STEP2 지시사항 컬럼 목록을 그대로 사용 — gatewayUrl/originalText/
--    normalizedText/searchText/importedAt은 이번 테이블에 포함하지 않는다
--    (importedAt은 created_at으로 대체되고, 본문 3종은 legal_chunks로 이동).
-- ----------------------------------------------------------------------------

CREATE TABLE legal_rag.legal_documents (
    internal_id             text PRIMARY KEY,               -- CanonicalDocument.documentId
    source_dataset          text NOT NULL,                   -- CanonicalDocument.sourceDataset
    source_revision         text NOT NULL,                    -- CanonicalDocument.sourceRevision
    official_document_id    text NOT NULL,                     -- CanonicalDocument.sourceDocumentId
    official_url            text,                               -- CanonicalDocument.officialUrl
    document_number         text[] NOT NULL DEFAULT '{}',        -- CanonicalDocument.documentNumber
    document_type           text,                                  -- CanonicalDocument.documentType
    title                    text,
    issuing_authority        text,
    issue_date                date,
    effective_date            date,
    expiry_date                date,
    status                     text NOT NULL DEFAULT 'unknown'
        CHECK (status IN (
            'active', 'partially_expired', 'fully_expired',
            'amended', 'replaced', 'suspended', 'unknown'
        )),                                                          -- src/schema.py DocumentStatus
    raw_status                 text,                                  -- CanonicalDocument.rawStatus (원본 값 그대로 보존)
    content_hash                text,                                   -- 정규화된 본문(legal_chunks 결합본 기준)의 SHA-256
    created_at                   timestamptz NOT NULL DEFAULT now(),
    updated_at                    timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_legal_documents_dataset_version
        FOREIGN KEY (source_dataset, source_revision)
        REFERENCES legal_rag.legal_dataset_versions (dataset_name, revision)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE legal_rag.legal_documents IS
    'STEP1 Canonical Document Schema의 실제 테이블. 원본 데이터를 절대 변형하지 않고 정규화된 메타데이터만 저장.';
COMMENT ON COLUMN legal_rag.legal_documents.content_hash IS
    'legal_chunks에 속한 chunk들의 normalized_text를 문서 순서대로 이어붙인 뒤 계산한 SHA-256 (dedup 보조키, 문서 단위).';

CREATE TRIGGER trg_legal_documents_updated_at
    BEFORE UPDATE ON legal_rag.legal_documents
    FOR EACH ROW EXECUTE FUNCTION legal_rag.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. legal_articles
--    문서 → 장(Chương) → 조(Điều) → 항(Khoản) → 호(Điểm) 계층 저장.
--    (STEP2 지시사항에 구체 컬럼 목록이 없어 STEP1의 Phần/Chương/Mục/Điều/
--     Khoản/Điểm 6단계 설계를 그대로 옮겨 자기참조(self-referencing) 트리로
--     구현했다. legal_chunks와 달리 "구조 자체"를 표현하는 노드 테이블이며,
--     검색 가능한 본문(text)은 legal_chunks가 담당한다 — 두 테이블은 의도적으로
--     느슨하게 연결되어 있다(FK 없이 document_id+번호 조합으로만 대응).)
-- ----------------------------------------------------------------------------

CREATE TABLE legal_rag.legal_articles (
    article_id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id          text NOT NULL,
    parent_article_id     bigint,
    level                  text NOT NULL
        CHECK (level IN ('phan', 'chuong', 'muc', 'dieu', 'khoan', 'diem')),  -- src/schema.py ChunkLevel
    phan_no                 text,
    chuong_no                text,
    muc_no                    text,
    dieu_no                    text,
    khoan_no                    text,
    diem_no                      text,
    heading                       text,
    path                           text NOT NULL,               -- breadcrumb, 예: "Chương I > Điều 9 > Khoản 2"
    created_at                      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_legal_articles_document
        FOREIGN KEY (document_id) REFERENCES legal_rag.legal_documents (internal_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_legal_articles_parent
        FOREIGN KEY (parent_article_id) REFERENCES legal_rag.legal_articles (article_id)
        ON DELETE CASCADE
);

COMMENT ON TABLE legal_rag.legal_articles IS
    'Phần/Chương/Mục/Điều/Khoản/Điểm 계층 구조 자체를 표현하는 자기참조 트리. article_id는 대리키(형식이 명시되지 않아 IDENTITY로 설계).';

-- ----------------------------------------------------------------------------
-- 4. legal_chunks
--    검색 가능한 Chunk 단위 (docs/Schema.md 4장, src/schema.py LegalChunk).
--    STEP2 지시사항 컬럼 목록 그대로 사용 — legal_articles에 대한 FK는
--    지시사항에 없으므로 추가하지 않는다(chapter_no/article_no/clause_no/
--    item_no로만 상위 구조를 느슨하게 표시).
-- ----------------------------------------------------------------------------

CREATE TABLE legal_rag.legal_chunks (
    chunk_id          text PRIMARY KEY,                  -- src/schema.py LegalChunk.chunkId
    document_id        text NOT NULL,
    chapter_no          text,                               -- Chương 번호
    article_no            text,                               -- Điều 번호
    clause_no              text,                               -- Khoản 번호
    item_no                  text,                               -- Điểm 번호
    heading                    text,                              -- breadcrumbTitle 중 사람이 읽는 축약 제목
    original_text               text NOT NULL,                     -- 원본 그대로(가공 없음)
    normalized_text               text,                               -- NFC 정규화 + 스캐폴딩 제거본
    search_text                     text,                                -- FTS/trigram 대상(소문자)
    status                            text
        CHECK (status IS NULL OR status IN (
            'active', 'partially_expired', 'fully_expired',
            'amended', 'replaced', 'suspended', 'unknown'
        )),
    official_url                        text,
    content_hash                          text,

    CONSTRAINT fk_legal_chunks_document
        FOREIGN KEY (document_id) REFERENCES legal_rag.legal_documents (internal_id)
        ON DELETE CASCADE
);

COMMENT ON TABLE legal_rag.legal_chunks IS
    'Điều 단위 기본, 긴 조문은 Khoản/Điểm까지 분리된 검색 대상 Chunk. src/parse_legal_structure.py 산출물과 1:1 대응.';

-- ----------------------------------------------------------------------------
-- 5. legal_relations
--    문서 간 관계 (docs/Schema.md 5장, src/schema.py RelationshipEdge).
-- ----------------------------------------------------------------------------

CREATE TABLE legal_rag.legal_relations (
    relation_id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_document_id     text NOT NULL,
    target_document_id       text NOT NULL,
    relation_type               text NOT NULL
        CHECK (relation_type IN (
            'amends', 'repeals', 'replaces', 'supersedes',
            'references', 'implements', 'unknown'
        )),                                                          -- src/schema.py RelationType
    source_article                text,          -- 원본 소스가 문서 단위 관계만 제공하므로 대부분 NULL
                                                    -- (docs/Pipeline.md, src/effective_scopes.py 한계 참고)
    target_article                  text,
    effective_from                    date,
    effective_to                        date,
    verified                              boolean NOT NULL DEFAULT false,

    CONSTRAINT fk_legal_relations_source
        FOREIGN KEY (source_document_id) REFERENCES legal_rag.legal_documents (internal_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_legal_relations_target
        FOREIGN KEY (target_document_id) REFERENCES legal_rag.legal_documents (internal_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_legal_relations_not_self
        CHECK (source_document_id IS DISTINCT FROM target_document_id)
);

COMMENT ON TABLE legal_rag.legal_relations IS
    '문서 간 개정/폐지/대체/인용 등 관계. 원본 방향(source->target)을 그대로 보존(src/normalize_relations.py).';
COMMENT ON COLUMN legal_rag.legal_relations.verified IS
    '전문가(Linda 대표 등)의 수동 검수 여부. 기본 false — VFBCAI 마스터문서 0장 원칙 5(법령 로직 전문가 검수)와 동일 취지.';

-- ----------------------------------------------------------------------------
-- 6. legal_effective_scopes
--    부분 실효 지원 (docs/Schema.md 6장 pilot 테이블 설계 확장, src/schema.py
--    EffectiveScope, src/effective_scopes.py).
-- ----------------------------------------------------------------------------

CREATE TABLE legal_rag.legal_effective_scopes (
    scope_id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id         text NOT NULL,
    article_no            text,           -- NULL이면 문서 전체 범위
    clause_no              text,
    item_no                  text,
    status                     text NOT NULL
        CHECK (status IN (
            'active', 'partially_expired', 'fully_expired',
            'amended', 'replaced', 'suspended', 'unknown'
        )),
    effective_from               date,
    effective_to                    date,
    relation_id                        bigint,   -- 이 scope 변경의 근거가 된 관계 (없으면 문서 자체 상태 상속)

    CONSTRAINT fk_legal_effective_scopes_document
        FOREIGN KEY (document_id) REFERENCES legal_rag.legal_documents (internal_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_legal_effective_scopes_relation
        FOREIGN KEY (relation_id) REFERENCES legal_rag.legal_relations (relation_id)
        ON DELETE SET NULL
);

COMMENT ON TABLE legal_rag.legal_effective_scopes IS
    'article/khoản/điểm 단위 부분 실효 표현. 현재 소스 데이터는 문서 단위 관계만 제공하므로 '
    'article_no가 채워져도 실제로는 문서 전체에 동일 scope가 반복 생성되는 경우가 많음 '
    '(src/effective_scopes.py docstring의 데이터 한계 참고).';

-- ----------------------------------------------------------------------------
-- 7. legal_import_history
--    파이프라인 실행(다운로드/정규화 등) 이력.
-- ----------------------------------------------------------------------------

CREATE TABLE legal_rag.legal_import_history (
    import_id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dataset                text NOT NULL,
    revision                 text NOT NULL,
    started_at                 timestamptz NOT NULL,
    finished_at                   timestamptz,
    success                         boolean,
    imported_documents                integer,
    warnings                             jsonb NOT NULL DEFAULT '[]'::jsonb,
    errors                                  jsonb NOT NULL DEFAULT '[]'::jsonb,

    CONSTRAINT fk_legal_import_history_dataset_version
        FOREIGN KEY (dataset, revision)
        REFERENCES legal_rag.legal_dataset_versions (dataset_name, revision)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE legal_rag.legal_import_history IS
    'download_datasets.py / normalize_documents.py 등 파이프라인 각 실행의 성공/실패 이력.';

-- ============================================================================
-- Index 설계
-- STEP2 지시사항: 문서번호 / 공식 URL / 문서상태 / 시행일 / article_no /
-- relation_type / content_hash + 모든 FK Index.
-- ============================================================================

-- 문서번호 (배열 컬럼 → GIN)
CREATE INDEX idx_legal_documents_document_number
    ON legal_rag.legal_documents USING GIN (document_number);

-- 공식 URL
CREATE INDEX idx_legal_documents_official_url
    ON legal_rag.legal_documents (official_url);

-- 문서상태
CREATE INDEX idx_legal_documents_status
    ON legal_rag.legal_documents (status);

-- 시행일 (issue_date=공포일, effective_date=시행일 — 둘 다 검색 빈도가 높아 함께 색인)
CREATE INDEX idx_legal_documents_issue_date
    ON legal_rag.legal_documents (issue_date);
CREATE INDEX idx_legal_documents_effective_date
    ON legal_rag.legal_documents (effective_date);

-- content_hash (문서/청크 양쪽 — 중복 판정에 사용, src/deduplicate_documents.py tier5)
CREATE INDEX idx_legal_documents_content_hash
    ON legal_rag.legal_documents (content_hash);
CREATE INDEX idx_legal_chunks_content_hash
    ON legal_rag.legal_chunks (content_hash);

-- article_no (legal_chunks, legal_articles, legal_effective_scopes 전부)
CREATE INDEX idx_legal_chunks_article_no
    ON legal_rag.legal_chunks (article_no);
CREATE INDEX idx_legal_articles_dieu_no
    ON legal_rag.legal_articles (dieu_no);
CREATE INDEX idx_legal_effective_scopes_article_no
    ON legal_rag.legal_effective_scopes (article_no);

-- relation_type
CREATE INDEX idx_legal_relations_relation_type
    ON legal_rag.legal_relations (relation_type);

-- ---- 모든 FK 컬럼 Index (Postgres는 FK 컬럼을 자동 색인하지 않음) ----

-- legal_documents.(source_dataset, source_revision) -> legal_dataset_versions
CREATE INDEX idx_legal_documents_source_dataset_revision
    ON legal_rag.legal_documents (source_dataset, source_revision);

-- legal_articles.document_id -> legal_documents
CREATE INDEX idx_legal_articles_document_id
    ON legal_rag.legal_articles (document_id);
-- legal_articles.parent_article_id -> legal_articles (self FK)
CREATE INDEX idx_legal_articles_parent_article_id
    ON legal_rag.legal_articles (parent_article_id);

-- legal_chunks.document_id -> legal_documents
CREATE INDEX idx_legal_chunks_document_id
    ON legal_rag.legal_chunks (document_id);

-- legal_relations.source_document_id / target_document_id -> legal_documents
CREATE INDEX idx_legal_relations_source_document_id
    ON legal_rag.legal_relations (source_document_id);
CREATE INDEX idx_legal_relations_target_document_id
    ON legal_rag.legal_relations (target_document_id);

-- legal_effective_scopes.document_id -> legal_documents
CREATE INDEX idx_legal_effective_scopes_document_id
    ON legal_rag.legal_effective_scopes (document_id);
-- legal_effective_scopes.relation_id -> legal_relations
CREATE INDEX idx_legal_effective_scopes_relation_id
    ON legal_rag.legal_effective_scopes (relation_id);

-- legal_import_history.(dataset, revision) -> legal_dataset_versions
CREATE INDEX idx_legal_import_history_dataset_revision
    ON legal_rag.legal_import_history (dataset, revision);

COMMIT;
