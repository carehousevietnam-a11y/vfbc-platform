from src.search_keyword import (
    match_multi_keyword,
    match_phrase,
    match_prefix,
    match_substring,
    search_keyword,
)
from src.search_models import Chunk, Document

DOC = Document(
    document_id="tmquan:1001",
    document_number=["152/2020/NĐ-CP"],
    title="Quy định về giấy phép lao động",
    status="active",
)
DOCS_BY_ID = {DOC.document_id: DOC}

CHUNKS = [
    Chunk(
        chunk_id="tmquan:1001#dieu1", document_id="tmquan:1001",
        article_no="1", heading="Điều 1 Phạm vi điều chỉnh",
        original_text="Điều 1. Phạm vi điều chỉnh\nNghị định này quy định về giấy phép lao động cho người lao động nước ngoài.",
        normalized_text="Điều 1. Phạm vi điều chỉnh\nNghị định này quy định về giấy phép lao động cho người lao động nước ngoài.",
        search_text="điều 1. phạm vi điều chỉnh\nnghị định này quy định về giấy phép lao động cho người lao động nước ngoài.",
        status="active",
    ),
    Chunk(
        chunk_id="tmquan:1001#dieu2", document_id="tmquan:1001",
        article_no="2", heading="Điều 2 Đối tượng áp dụng",
        original_text="Điều 2. Đối tượng áp dụng\n1. Người lao động nước ngoài.\n2. Người sử dụng lao động.",
        normalized_text="Điều 2. Đối tượng áp dụng\n1. Người lao động nước ngoài.\n2. Người sử dụng lao động.",
        search_text="điều 2. đối tượng áp dụng\n1. người lao động nước ngoài.\n2. người sử dụng lao động.",
        status="active",
    ),
]


# --- 매치 함수 단위 테스트 ---

def test_match_substring():
    assert match_substring("hello world", "world")
    assert not match_substring("hello world", "xyz")
    assert not match_substring("hello world", "")


def test_match_prefix_word_boundary():
    assert match_prefix("giấy phép lao động", "lao")
    assert match_prefix("giấy phép lao động", "gi")
    assert not match_prefix("giấy phép lao động", "xyz")


def test_match_phrase():
    assert match_phrase("giấy phép lao động", "phép lao")
    assert not match_phrase("giấy phép lao động", "lao phép")


def test_match_multi_keyword_all_mode():
    assert match_multi_keyword("giấy phép lao động", ["giấy", "lao"], mode="all")
    assert not match_multi_keyword("giấy phép lao động", ["giấy", "xyz"], mode="all")


def test_match_multi_keyword_any_mode():
    assert match_multi_keyword("giấy phép lao động", ["giấy", "xyz"], mode="any")
    assert not match_multi_keyword("giấy phép lao động", ["abc", "xyz"], mode="any")


# --- 통합 검색 ---

def test_keyword_search_substring_in_title():
    results = search_keyword("giấy phép", CHUNKS, DOCS_BY_ID)
    assert len(results) == 2  # 두 chunk 모두 같은 문서(title에 매치)에 속함
    assert all(r.match_type in ("keyword_phrase", "keyword_prefix", "keyword_substring") for r in results)


def test_keyword_search_specific_to_one_chunk():
    results = search_keyword("Đối tượng áp dụng", CHUNKS, DOCS_BY_ID)
    doc_ids_articles = {(r.document_id, r.article_no) for r in results}
    assert ("tmquan:1001", "2") in doc_ids_articles


def test_keyword_search_case_insensitive():
    lower = search_keyword("điều 1", CHUNKS, DOCS_BY_ID)
    upper = search_keyword("ĐIỀU 1", CHUNKS, DOCS_BY_ID)
    assert len(lower) == len(upper) and len(lower) > 0


def test_keyword_search_prefix_match():
    results = search_keyword("ngo", CHUNKS, DOCS_BY_ID)  # "người"/"ngoài"의 접두어
    assert len(results) > 0


def test_keyword_search_multi_keyword_requires_all_terms():
    results = search_keyword("giấy phép lao động", CHUNKS, DOCS_BY_ID)
    assert len(results) >= 1
    assert any(r.match_type == "keyword_phrase" for r in results)


def test_keyword_search_no_match_returns_empty():
    assert search_keyword("xyzxyz_존재하지않는단어", CHUNKS, DOCS_BY_ID) == []


def test_keyword_search_empty_query_returns_empty():
    assert search_keyword("", CHUNKS, DOCS_BY_ID) == []
    assert search_keyword("   ", CHUNKS, DOCS_BY_ID) == []


def test_keyword_search_title_field_included():
    """title은 Document에만 있으므로 document join을 통해 검색되어야 한다."""
    results = search_keyword("Quy định về giấy phép", CHUNKS, DOCS_BY_ID)
    assert len(results) > 0


def test_keyword_search_score_is_positive():
    results = search_keyword("lao động", CHUNKS, DOCS_BY_ID)
    assert all(r.score > 0 for r in results)


def test_keyword_search_early_termination_respects_limit():
    results = search_keyword("lao động", CHUNKS, DOCS_BY_ID, limit=1)
    assert len(results) == 1


def test_keyword_search_fast_reject_skips_non_matching_chunks():
    results = search_keyword("xyzxyz_nonexistent_phrase", CHUNKS, DOCS_BY_ID)
    assert results == []
