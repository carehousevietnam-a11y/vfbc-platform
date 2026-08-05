from src.build_schema import parse_create_indexes, parse_create_tables, validate

VALID_SQL = """
CREATE TABLE legal_documents (
    internal_id text PRIMARY KEY,
    source_dataset text NOT NULL,
    source_revision text NOT NULL,
    official_document_id text NOT NULL,
    official_url text,
    document_number text[] NOT NULL DEFAULT '{}',
    document_type text,
    title text,
    issuing_authority text,
    issue_date date,
    effective_date date,
    expiry_date date,
    status text NOT NULL DEFAULT 'unknown',
    raw_status text,
    content_hash text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE legal_chunks (
    chunk_id text PRIMARY KEY,
    document_id text NOT NULL,
    chapter_no text,
    article_no text,
    clause_no text,
    item_no text,
    heading text,
    original_text text NOT NULL,
    normalized_text text,
    search_text text,
    status text,
    official_url text,
    content_hash text,
    CONSTRAINT fk_chunks_doc FOREIGN KEY (document_id) REFERENCES legal_documents (internal_id)
);

CREATE INDEX idx_legal_documents_document_number ON legal_documents USING GIN (document_number);
CREATE INDEX idx_legal_documents_official_url ON legal_documents (official_url);
CREATE INDEX idx_legal_documents_status ON legal_documents (status);
CREATE INDEX idx_legal_documents_content_hash ON legal_documents (content_hash);
CREATE INDEX idx_legal_chunks_article_no ON legal_chunks (article_no);
CREATE INDEX idx_legal_chunks_document_id ON legal_chunks (document_id);
"""


def test_parse_create_tables_extracts_columns_and_pk():
    tables = parse_create_tables(VALID_SQL)
    assert "legal_documents" in tables
    assert "internal_id" in tables["legal_documents"].columns
    assert tables["legal_documents"].primary_key_columns == ["internal_id"]


def test_parse_create_tables_extracts_inline_and_constraint_fk():
    tables = parse_create_tables(VALID_SQL)
    fks = tables["legal_chunks"].foreign_keys
    assert len(fks) == 1
    local_cols, ref_table, ref_cols = fks[0]
    assert local_cols == ["document_id"]
    assert ref_table == "legal_documents"
    assert ref_cols == ["internal_id"]


def test_parse_create_indexes():
    indexes = parse_create_indexes(VALID_SQL)
    names = {idx.name for idx in indexes}
    assert "idx_legal_documents_status" in names
    gin_idx = next(i for i in indexes if i.name == "idx_legal_documents_document_number")
    assert gin_idx.table == "legal_documents"
    assert gin_idx.columns == ["document_number"]


def test_validate_clean_sql_produces_relevant_errors_only():
    """
    VALID_SQL은 legal_documents/legal_chunks 2개 테이블만 포함하므로,
    EXPECTED_COLUMNS에 정의된 나머지 4개 테이블(legal_relations 등)에 대한
    '테이블 없음' 오류는 당연히 발생한다. 여기서는 그 테이블들을 제외하고
    legal_documents/legal_chunks 자체에는 컬럼/FK/인덱스 오류가 없는지만 확인한다.
    """
    report = validate(VALID_SQL)
    relevant = [
        i for i in report.issues
        if "legal_documents" in i.message or "legal_chunks" in i.message
    ]
    relevant = [i for i in relevant if "테이블이 SQL에 없습니다" not in i.message]
    assert relevant == [], f"예상치 못한 오류: {relevant}"


def test_validate_detects_missing_primary_key():
    sql = """
    CREATE TABLE broken_table (
        id text,
        name text
    );
    """
    report = validate(sql)
    assert any("PRIMARY KEY가 없습니다" in i.message for i in report.issues)


def test_validate_detects_fk_to_nonexistent_table():
    sql = """
    CREATE TABLE child (
        id text PRIMARY KEY,
        parent_id text,
        CONSTRAINT fk_x FOREIGN KEY (parent_id) REFERENCES nonexistent_table (id)
    );
    """
    report = validate(sql)
    assert any("존재하지 않는 테이블" in i.message for i in report.issues)


def test_validate_detects_index_on_nonexistent_column():
    sql = """
    CREATE TABLE t (
        id text PRIMARY KEY
    );
    CREATE INDEX idx_t_ghost ON t (ghost_column);
    """
    report = validate(sql)
    assert any("존재하지 않는 컬럼" in i.message and "ghost_column" in i.message for i in report.issues)


def test_validate_detects_fk_without_index():
    sql = """
    CREATE TABLE parent (
        id text PRIMARY KEY
    );
    CREATE TABLE child (
        id text PRIMARY KEY,
        parent_id text,
        CONSTRAINT fk_x FOREIGN KEY (parent_id) REFERENCES parent (id)
    );
    """
    report = validate(sql)
    assert any("FK 컬럼 'parent_id'에 대응하는 INDEX가 없습니다" in i.message for i in report.issues)


def test_validate_detects_unexpected_extra_column_in_step2_table():
    sql = """
    CREATE TABLE legal_documents (
        internal_id text PRIMARY KEY,
        source_dataset text,
        source_revision text,
        official_document_id text,
        official_url text,
        document_number text[],
        document_type text,
        title text,
        issuing_authority text,
        issue_date date,
        effective_date date,
        expiry_date date,
        status text,
        raw_status text,
        content_hash text,
        created_at timestamptz,
        updated_at timestamptz,
        totally_made_up_column text
    );
    """
    report = validate(sql)
    assert any(
        "추측 금지 위반" in i.message and "totally_made_up_column" in i.message
        for i in report.issues
    )
