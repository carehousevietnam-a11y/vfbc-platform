from src.search_exact import (
    search_by_article,
    search_by_document_id,
    search_by_document_number,
    search_by_official_url,
    search_exact,
)
from src.search_models import Chunk, Document

DOCS = [
    Document(
        document_id="tmquan:1001",
        document_number=["152/2020/NĐ-CP"],
        document_type="nghi_dinh",
        title="Quy định về giấy phép lao động",
        issuing_authority="Chính phủ",
        issue_date="2020-12-30",
        status="active",
        official_url="https://vbpl.vn/van-ban/chi-tiet/x1",
    ),
    Document(
        document_id="th1nhng0:5002",
        document_number=["99/2019/TT-BLĐTBXH"],
        document_type="thong_tu",
        title="Một văn bản khác",
        status="fully_expired",
        official_url=None,
    ),
]

CHUNKS = [
    Chunk(
        chunk_id="tmquan:1001#dieu1", document_id="tmquan:1001",
        article_no="1", heading="Điều 1", original_text="Điều 1. Phạm vi điều chỉnh",
        status="active", official_url="https://vbpl.vn/van-ban/chi-tiet/x1",
    ),
    Chunk(
        chunk_id="tmquan:1001#dieu2", document_id="tmquan:1001",
        article_no="2", clause_no="1", heading="Điều 2 Khoản 1",
        original_text="Điều 2. Khoản 1", status="active",
        official_url="https://vbpl.vn/van-ban/chi-tiet/x1",
    ),
    Chunk(
        chunk_id="th1nhng0:5002#dieu1", document_id="th1nhng0:5002",
        article_no="1", heading="Điều 1", original_text="Điều 1. Nội dung khác",
        status="fully_expired",
    ),
]
DOCS_BY_ID = {d.document_id: d for d in DOCS}


# --- 법령번호 ---

def test_search_by_document_number_exact_match():
    results = search_by_document_number(DOCS, "152/2020/NĐ-CP")
    assert len(results) == 1
    assert results[0].document_id == "tmquan:1001"
    assert results[0].match_type == "exact_document_number"
    assert results[0].score == 100.0


def test_search_by_document_number_normalizes_prefix():
    """'Nghị định số' 접두어가 붙어도 정규화 후 매치되어야 한다."""
    results = search_by_document_number(DOCS, "Nghị định số: 152/2020/NĐ-CP")
    assert len(results) == 1
    assert results[0].document_id == "tmquan:1001"


def test_search_by_document_number_no_match():
    assert search_by_document_number(DOCS, "999/9999/XX-YY") == []


# --- Document ID ---

def test_search_by_document_id_exact():
    results = search_by_document_id(DOCS, "tmquan:1001")
    assert len(results) == 1
    assert results[0].match_type == "exact_document_id"


def test_search_by_document_id_case_insensitive():
    results = search_by_document_id(DOCS, "TMQUAN:1001")
    assert len(results) == 1


# --- 공식 URL ---

def test_search_by_official_url_matches_document_and_chunks():
    results = search_by_official_url(DOCS, CHUNKS, DOCS_BY_ID, "https://vbpl.vn/van-ban/chi-tiet/x1")
    assert len(results) == 3  # 문서 1 + 그 문서에 속한 chunk 2개
    assert all(r.match_type == "exact_url" for r in results)


def test_search_by_official_url_no_match_for_null_url_doc():
    results = search_by_official_url(DOCS, CHUNKS, DOCS_BY_ID, "https://vbpl.vn/nonexistent")
    assert results == []


# --- 조문 ---

def test_search_by_article_dieu_only():
    results = search_by_article(CHUNKS, DOCS_BY_ID, article_no="1")
    assert len(results) == 2  # 두 문서 모두 Điều 1이 있음
    assert all(r.match_type == "exact_article" for r in results)


def test_search_by_article_with_khoan():
    results = search_by_article(CHUNKS, DOCS_BY_ID, article_no="2", clause_no="1")
    assert len(results) == 1
    assert results[0].chunk_id if hasattr(results[0], "chunk_id") else True
    assert results[0].clause_no == "1"


def test_search_by_article_scoped_to_document_id():
    results = search_by_article(CHUNKS, DOCS_BY_ID, article_no="1", document_id="th1nhng0:5002")
    assert len(results) == 1
    assert results[0].document_id == "th1nhng0:5002"


def test_search_by_article_scoped_to_document_number():
    results = search_by_article(CHUNKS, DOCS_BY_ID, article_no="1", document_number="152/2020/NĐ-CP")
    assert len(results) == 1
    assert results[0].document_id == "tmquan:1001"


def test_search_by_article_no_article_no_returns_empty():
    assert search_by_article(CHUNKS, DOCS_BY_ID, article_no=None) == []


# --- 통합 진입점 자동판별 ---

def test_search_exact_auto_detects_url():
    results = search_exact("https://vbpl.vn/van-ban/chi-tiet/x1", DOCS, CHUNKS)
    assert all(r.match_type == "exact_url" for r in results)
    assert len(results) == 3


def test_search_exact_auto_detects_document_number():
    results = search_exact("152/2020/NĐ-CP", DOCS, CHUNKS)
    assert any(r.match_type == "exact_document_number" for r in results)


def test_search_exact_auto_detects_document_id():
    results = search_exact("th1nhng0:5002", DOCS, CHUNKS)
    assert any(r.match_type == "exact_document_id" for r in results)


def test_search_exact_auto_detects_article_query():
    results = search_exact("Điều 2 Khoản 1", DOCS, CHUNKS)
    assert any(r.match_type == "exact_article" and r.clause_no == "1" for r in results)


def test_search_exact_empty_query_returns_empty():
    assert search_exact("", DOCS, CHUNKS) == []
    assert search_exact("   ", DOCS, CHUNKS) == []


def test_search_exact_unrecognized_query_returns_empty():
    """일반 키워드(예: 자유 텍스트)는 exact 매치가 하나도 없어야 한다 — keyword_search가 담당."""
    results = search_exact("giấy phép lao động thông thường", DOCS, CHUNKS)
    assert results == []
