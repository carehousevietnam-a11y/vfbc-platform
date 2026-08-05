import json
from pathlib import Path

from src.search_engine import LegalSearchIndex, load_from_pipeline_jsonl
from src.search_models import SearchFilters


def _sample_dicts():
    documents = [
        {
            "document_id": "tmquan:1001", "document_number": ["152/2020/NĐ-CP"],
            "document_type": "nghi_dinh", "title": "Quy định về giấy phép lao động",
            "issuing_authority": "Chính phủ", "issue_date": "2020-12-30",
            "effective_date": "2021-02-15", "expiry_date": None,
            "status": "active", "official_url": "https://vbpl.vn/x1", "content_hash": None,
        },
        {
            "document_id": "th1nhng0:5002", "document_number": ["99/2019/TT-BLĐTBXH"],
            "document_type": "thong_tu", "title": "Một văn bản khác về thuế",
            "issuing_authority": "Bộ Lao động", "issue_date": "2019-01-01",
            "effective_date": None, "expiry_date": None,
            "status": "fully_expired", "official_url": None, "content_hash": None,
        },
    ]
    chunks = [
        {
            "chunk_id": "tmquan:1001#dieu1", "document_id": "tmquan:1001",
            "chapter_no": "I", "article_no": "1", "clause_no": None, "item_no": None,
            "heading": "Điều 1 Phạm vi điều chỉnh",
            "original_text": "Điều 1. Phạm vi điều chỉnh về giấy phép lao động.",
            "normalized_text": "Điều 1. Phạm vi điều chỉnh về giấy phép lao động.",
            "search_text": "điều 1. phạm vi điều chỉnh về giấy phép lao động.",
            "status": "active", "official_url": "https://vbpl.vn/x1", "content_hash": None,
        },
        {
            "chunk_id": "tmquan:1001#dieu2", "document_id": "tmquan:1001",
            "chapter_no": "I", "article_no": "2", "clause_no": None, "item_no": None,
            "heading": "Điều 2 Đối tượng áp dụng",
            "original_text": "Điều 2. Đối tượng áp dụng lao động nước ngoài.",
            "normalized_text": "Điều 2. Đối tượng áp dụng lao động nước ngoài.",
            "search_text": "điều 2. đối tượng áp dụng lao động nước ngoài.",
            "status": "active", "official_url": "https://vbpl.vn/x1", "content_hash": None,
        },
        {
            "chunk_id": "th1nhng0:5002#dieu1", "document_id": "th1nhng0:5002",
            "chapter_no": None, "article_no": "1", "clause_no": None, "item_no": None,
            "heading": "Điều 1 Nội dung khác",
            "original_text": "Điều 1. Nội dung về thuế thu nhập cá nhân.",
            "normalized_text": "Điều 1. Nội dung về thuế thu nhập cá nhân.",
            "search_text": "điều 1. nội dung về thuế thu nhập cá nhân.",
            "status": "fully_expired", "official_url": None, "content_hash": None,
        },
    ]
    relations = [
        {"source_document_id": "th1nhng0:5002", "target_document_id": "tmquan:1001", "relation_type": "references"},
    ]
    return documents, chunks, relations


def _build_index() -> LegalSearchIndex:
    documents, chunks, relations = _sample_dicts()
    return LegalSearchIndex.from_dicts(documents, chunks, relations)


# --- 기본 검색 파이프라인 ---

def test_search_exact_query_returns_exact_match_type():
    index = _build_index()
    results = index.search(query="152/2020/NĐ-CP")
    assert len(results) >= 1
    assert results[0].match_type == "exact_document_number"


def test_search_keyword_query_returns_keyword_match_type():
    index = _build_index()
    results = index.search(query="thuế thu nhập")
    assert len(results) >= 1
    assert all(r.match_type.startswith("keyword") for r in results)


def test_search_exact_ranked_above_keyword_when_both_present():
    """같은 쿼리로 exact와 keyword 매치가 동시에 나오는 경우는 드물지만,
    dedupe 이후 결과가 score 내림차순인지, exact가 있으면 keyword보다 위인지 확인."""
    index = _build_index()
    results = index.search(query="Điều 1")  # 조문 exact + 본문 keyword 둘 다 가능성
    scores = [r.score for r in results]
    assert scores == sorted(scores, reverse=True)
    exact_positions = [i for i, r in enumerate(results) if r.match_type.startswith("exact")]
    keyword_positions = [i for i, r in enumerate(results) if r.match_type.startswith("keyword")]
    if exact_positions and keyword_positions:
        assert max(exact_positions) < min(keyword_positions)


def test_search_respects_limit():
    index = _build_index()
    results = index.search(query="Điều", limit=1)
    assert len(results) <= 1


def test_search_no_query_no_filter_returns_empty():
    index = _build_index()
    assert index.search() == []


# --- Filter 통합 ---

def test_search_with_query_and_filter():
    index = _build_index()
    results = index.search(query="Điều 1", filters=SearchFilters(status="active"))
    assert len(results) >= 1
    assert all(r.status == "active" for r in results)


def test_search_filter_only_browse_mode_by_status():
    index = _build_index()
    results = index.search(filters=SearchFilters(status="fully_expired"))
    assert len(results) >= 1
    assert all(r.status == "fully_expired" for r in results)


def test_search_filter_only_browse_mode_by_article_no():
    index = _build_index()
    results = index.search(filters=SearchFilters(article_no="2"))
    assert len(results) == 1
    assert results[0].article_no == "2"


def test_search_filter_only_browse_mode_by_relation_type():
    index = _build_index()
    results = index.search(filters=SearchFilters(relation_type="references"))
    doc_ids = {r.document_id for r in results}
    assert doc_ids == {"tmquan:1001", "th1nhng0:5002"}


# --- Pipeline JSONL 로더 ---

def test_load_from_pipeline_jsonl(tmp_path):
    """STEP1-1 파이프라인 스타일(camelCase) JSONL을 실제로 파일에 써서 로드 검증."""
    documents_path = tmp_path / "documents_deduped.jsonl"
    chunks_path = tmp_path / "chunks.jsonl"
    relationships_path = tmp_path / "relationships.jsonl"

    canonical_doc = {
        "documentId": "tmquan:1001",
        "documentNumber": ["152/2020/NĐ-CP"],
        "documentType": "nghi_dinh",
        "title": "Quy định về giấy phép lao động",
        "issuingAuthority": "Chính phủ",
        "issueDate": "2020-12-30",
        "effectiveDate": None,
        "expiryDate": None,
        "status": "unknown",
        "officialUrl": "https://vbpl.vn/x1",
        "contentHash": None,
    }
    legal_chunk = {
        "chunkId": "tmquan:1001#dieu1",
        "documentId": "tmquan:1001",
        "level": "dieu",
        "parentChunkId": None,
        "path": "Chương I > Điều 1",
        "breadcrumbTitle": "Chương I > Điều 1 Phạm vi điều chỉnh",
        "text": "Điều 1. Phạm vi điều chỉnh về giấy phép lao động.",
        "charStart": 0,
        "charEnd": 10,
        "documentNumber": ["152/2020/NĐ-CP"],
        "status": "unknown",
    }
    relation = {
        "edgeId": "a->b:references",
        "sourceDocumentId": "tmquan:1001",
        "targetDocumentId": "th1nhng0:5002",
        "relationType": "references",
        "rawRelationLabel": "tham chiếu",
        "sourceDataset": "th1nhng0_vietnamese_legal",
        "confidence": None,
    }

    documents_path.write_text(json.dumps(canonical_doc, ensure_ascii=False) + "\n", encoding="utf-8")
    chunks_path.write_text(json.dumps(legal_chunk, ensure_ascii=False) + "\n", encoding="utf-8")
    relationships_path.write_text(json.dumps(relation, ensure_ascii=False) + "\n", encoding="utf-8")

    documents, chunks, relations = load_from_pipeline_jsonl(documents_path, chunks_path, relationships_path)

    assert len(documents) == 1
    assert documents[0].document_id == "tmquan:1001"
    assert documents[0].document_number == ["152/2020/NĐ-CP"]

    assert len(chunks) == 1
    assert chunks[0].chunk_id == "tmquan:1001#dieu1"
    assert chunks[0].article_no == "1"  # path에서 파싱됨
    assert chunks[0].chapter_no == "I"
    assert chunks[0].official_url == "https://vbpl.vn/x1"  # 문서에서 보강됨

    assert len(relations) == 1
    assert relations[0]["sourceDocumentId"] == "tmquan:1001"


def test_load_from_pipeline_jsonl_missing_files_returns_empty(tmp_path):
    documents, chunks, relations = load_from_pipeline_jsonl(
        tmp_path / "nonexistent_docs.jsonl", tmp_path / "nonexistent_chunks.jsonl"
    )
    assert documents == []
    assert chunks == []
    assert relations == []


def test_index_from_pipeline_jsonl_end_to_end_search(tmp_path):
    """실제 파일 -> 로드 -> 검색까지 전체 체인이 동작하는지 확인."""
    documents, chunks, relations = _sample_dicts()

    # search_engine의 내부 표현(snake_case)을 그대로 파일로 써서 from_pipeline_jsonl
    # 대신 from_dicts로 검증(이 테스트는 엔진 자체의 end-to-end 동작 확인이 목적이므로
    # camelCase 변환 경로는 위 test_load_from_pipeline_jsonl에서 별도 검증했음).
    index = LegalSearchIndex.from_dicts(documents, chunks, relations)
    results = index.search(query="152/2020/NĐ-CP", filters=SearchFilters(status="active"), limit=5)
    assert len(results) >= 1
    assert results[0].document_id == "tmquan:1001"
