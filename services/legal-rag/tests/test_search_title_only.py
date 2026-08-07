from src.search_engine import LegalSearchIndex
from src.search_keyword import search_title_only_documents
from src.search_models import Document


def test_title_only_document_found_without_chunks():
    doc = Document(
        document_id="tmquan:101890",
        document_number=["106/2016/QH13"],
        document_type="luat",
        title="Luật Sửa đổi, bổ sung một số điều của Luật Thuế giá trị gia tăng",
        status="repealed",
    )
    results = search_title_only_documents(
        "thuế giá trị gia tăng",
        [doc],
        chunks=[],
    )
    assert len(results) == 1
    assert results[0].document_number == ["106/2016/QH13"]
    assert results[0].score == 75.0
    assert results[0].match_type == "keyword_phrase"


def test_title_only_skips_documents_with_chunks():
    doc = Document(
        document_id="tmquan:1001",
        document_number=["1/2020/NĐ-CP"],
        title="Luật Thuế giá trị gia tăng",
        status="active",
    )
    from src.search_models import Chunk

    chunk = Chunk(
        chunk_id="tmquan:1001#dieu1",
        document_id="tmquan:1001",
        original_text="nội dung",
    )
    results = search_title_only_documents("thuế giá trị gia tăng", [doc], [chunk])
    assert results == []


def test_vat_query_ranks_title_match_above_body_citation():
    documents = [
        {
            "document_id": "tmquan:101890",
            "document_number": ["106/2016/QH13"],
            "document_type": "luat",
            "title": "Luật Sửa đổi, bổ sung một số điều của Luật Thuế giá trị gia tăng",
            "status": "repealed",
        },
        {
            "document_id": "tmquan:169032",
            "document_number": ["27/2023/QH15"],
            "document_type": "luat",
            "title": "Luật Nhà ở số",
            "status": "active",
        },
    ]
    chunks = [
        {
            "chunk_id": "tmquan:169032#full",
            "document_id": "tmquan:169032",
            "original_text": "Căn cứ Luật Thuế giá trị gia tăng ngày 03 tháng 6 năm 2008",
            "normalized_text": "Căn cứ Luật Thuế giá trị gia tăng ngày 03 tháng 6 năm 2008",
            "search_text": "căn cứ luật thuế giá trị gia tăng ngày 03 tháng 6 năm 2008",
        },
    ]
    index = LegalSearchIndex.from_dicts(documents, chunks)
    results = index.search("thuế giá trị gia tăng", limit=5)
    assert len(results) >= 2
    assert results[0].document_number == ["106/2016/QH13"]
    assert results[0].score > results[1].score
