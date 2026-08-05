from src.parse_legal_structure import parse_document_structure

SHORT_DOC = """
Chương I
QUY ĐỊNH CHUNG

Điều 1. Phạm vi điều chỉnh
Nghị định này quy định về giấy phép lao động cho người lao động nước ngoài.

Điều 2. Đối tượng áp dụng
Nghị định này áp dụng đối với người sử dụng lao động.
"""

LONG_DOC = (
    "Chương II\nĐIỀU KIỆN CẤP GIẤY PHÉP\n\n"
    "Điều 9. Điều kiện\n"
    + ("1. Có năng lực hành vi dân sự đầy đủ theo quy định của pháp luật. " * 30)
    + "\n2. Có sức khỏe phù hợp với yêu cầu công việc.\n"
    + "   a) Giấy chứng nhận sức khỏe do cơ quan có thẩm quyền cấp.\n"
    + "   b) Thời hạn không quá 12 tháng.\n"
    + "3. Không thuộc diện đang bị truy cứu trách nhiệm hình sự.\n"
)

NO_STRUCTURE_DOC = "Đây là một văn bản không có cấu trúc Điều/Khoản rõ ràng."


def test_parses_multiple_dieu_with_breadcrumb():
    chunks = parse_document_structure("doc1", SHORT_DOC)
    dieu_chunks = [c for c in chunks if c.level == "dieu"]
    assert len(dieu_chunks) == 2
    assert dieu_chunks[0].chunkId == "doc1#dieu1"
    assert "Chương I" in dieu_chunks[0].breadcrumbTitle
    assert "Điều 1" in dieu_chunks[0].breadcrumbTitle
    assert dieu_chunks[1].chunkId == "doc1#dieu2"


def test_short_article_not_split_into_khoan():
    chunks = parse_document_structure("doc1", SHORT_DOC)
    # 짧은 조문은 Khoản 임계값 미만이므로 Điều 단일 chunk만 존재
    assert all(c.level == "dieu" for c in chunks)


def test_long_article_split_into_khoan_and_diem():
    chunks = parse_document_structure("doc2", LONG_DOC)
    levels = {c.level for c in chunks}
    assert "dieu" in levels
    assert "khoan" in levels or "diem" in levels

    diem_chunks = [c for c in chunks if c.level == "diem"]
    assert len(diem_chunks) == 2  # a), b)
    for c in diem_chunks:
        assert c.parentChunkId is not None
        assert "Khoản" in c.path
        assert "Điểm" in c.path


def test_char_spans_are_valid():
    chunks = parse_document_structure("doc1", SHORT_DOC)
    for c in chunks:
        assert c.charStart < c.charEnd
        assert SHORT_DOC[c.charStart:c.charEnd].strip() == c.text.strip()


def test_no_structure_falls_back_to_full_document():
    chunks = parse_document_structure("doc3", NO_STRUCTURE_DOC)
    assert len(chunks) == 1
    assert chunks[0].chunkId == "doc3#full"
    assert chunks[0].text == NO_STRUCTURE_DOC.strip()


def test_empty_text_returns_no_chunks():
    assert parse_document_structure("doc4", "") == []
    assert parse_document_structure("doc4", None) == []


def test_document_number_and_status_propagated():
    chunks = parse_document_structure(
        "doc1", SHORT_DOC, document_number=["152/2020/NĐ-CP"], status="active"
    )
    assert all(c.documentNumber == ["152/2020/NĐ-CP"] for c in chunks)
    assert all(c.status == "active" for c in chunks)
