from src.search_filters import apply_filters, filter_documents
from src.search_models import Document, SearchFilters, SearchResult

DOCS = [
    Document(
        document_id="tmquan:1001", document_number=["152/2020/NĐ-CP"],
        document_type="nghi_dinh", title="Doc A",
        issuing_authority="Chính phủ", issue_date="2020-12-30",
        effective_date="2021-02-15", status="active",
        official_url="https://vbpl.vn/x1",
    ),
    Document(
        document_id="th1nhng0:5002", document_number=["99/2019/TT-BLĐTBXH"],
        document_type="thong_tu", title="Doc B",
        issuing_authority="Bộ Lao động", issue_date="2019-01-01",
        effective_date=None, status="fully_expired",
        official_url=None,
    ),
]
DOCS_BY_ID = {d.document_id: d for d in DOCS}

RESULTS = [
    SearchResult(
        document_id="tmquan:1001", document_number=["152/2020/NĐ-CP"],
        document_type="nghi_dinh", title="Doc A", article_no="1",
        clause_no=None, item_no=None, heading="Điều 1", status="active",
        official_url="https://vbpl.vn/x1", score=50.0, match_type="keyword_phrase",
    ),
    SearchResult(
        document_id="th1nhng0:5002", document_number=["99/2019/TT-BLĐTBXH"],
        document_type="thong_tu", title="Doc B", article_no="1",
        clause_no=None, item_no=None, heading="Điều 1", status="fully_expired",
        official_url=None, score=30.0, match_type="keyword_substring",
    ),
]

RELATIONS = [
    {"source_document_id": "th1nhng0:5002", "target_document_id": "tmquan:1001", "relation_type": "references"},
]


def test_apply_filters_no_filter_returns_all():
    assert apply_filters(RESULTS, None) == RESULTS
    assert apply_filters(RESULTS, SearchFilters()) == RESULTS


def test_apply_filters_status():
    filtered = apply_filters(RESULTS, SearchFilters(status="active"))
    assert len(filtered) == 1
    assert filtered[0].document_id == "tmquan:1001"


def test_apply_filters_document_type():
    filtered = apply_filters(RESULTS, SearchFilters(document_type="thong_tu"))
    assert len(filtered) == 1
    assert filtered[0].document_id == "th1nhng0:5002"


def test_apply_filters_article_no():
    filtered = apply_filters(RESULTS, SearchFilters(article_no="1"))
    assert len(filtered) == 2  # 둘 다 article_no="1"


def test_apply_filters_issuing_authority_requires_documents_by_id():
    filtered = apply_filters(RESULTS, SearchFilters(issuing_authority="Chính phủ"), DOCS_BY_ID)
    assert len(filtered) == 1
    assert filtered[0].document_id == "tmquan:1001"


def test_apply_filters_issuing_authority_without_documents_by_id_excludes_all():
    """documents_by_id가 없으면 문서를 찾을 수 없으므로 issuing_authority 필터는 전부 제외해야 한다."""
    filtered = apply_filters(RESULTS, SearchFilters(issuing_authority="Chính phủ"))
    assert filtered == []


def test_apply_filters_issue_date_exact():
    filtered = apply_filters(RESULTS, SearchFilters(issue_date="2020-12-30"), DOCS_BY_ID)
    assert len(filtered) == 1
    assert filtered[0].document_id == "tmquan:1001"


def test_apply_filters_issue_date_range():
    filtered = apply_filters(
        RESULTS, SearchFilters(issue_date_from="2020-01-01", issue_date_to="2020-12-31"), DOCS_BY_ID
    )
    assert len(filtered) == 1
    assert filtered[0].document_id == "tmquan:1001"


def test_apply_filters_effective_date_excludes_null():
    """effective_date가 없는(None) 문서는 effective_date 필터가 걸리면 제외되어야 한다."""
    filtered = apply_filters(RESULTS, SearchFilters(effective_date="2021-02-15"), DOCS_BY_ID)
    assert len(filtered) == 1
    assert filtered[0].document_id == "tmquan:1001"


def test_apply_filters_relation_type():
    filtered = apply_filters(RESULTS, SearchFilters(relation_type="references"), DOCS_BY_ID, RELATIONS)
    assert len(filtered) == 2  # 두 문서 모두 관계에 참여(source/target)


def test_apply_filters_relation_type_no_match():
    filtered = apply_filters(RESULTS, SearchFilters(relation_type="repeals"), DOCS_BY_ID, RELATIONS)
    assert filtered == []


def test_apply_filters_combined_conditions():
    filtered = apply_filters(
        RESULTS, SearchFilters(status="active", document_type="nghi_dinh"), DOCS_BY_ID
    )
    assert len(filtered) == 1
    assert filtered[0].document_id == "tmquan:1001"


# --- filter_documents (browse 모드) ---

def test_filter_documents_no_filter_returns_all():
    assert filter_documents(DOCS, None) == DOCS


def test_filter_documents_status():
    filtered = filter_documents(DOCS, SearchFilters(status="fully_expired"))
    assert len(filtered) == 1
    assert filtered[0].document_id == "th1nhng0:5002"


def test_filter_documents_relation_type():
    filtered = filter_documents(DOCS, SearchFilters(relation_type="references"), RELATIONS)
    assert len(filtered) == 2
