from src.utils import (
    build_search_text,
    normalize_date,
    normalize_document_number,
    normalize_vietnamese_text,
    sha256_text,
    slugify_vi,
)


def test_sha256_text_deterministic():
    assert sha256_text("hello") == sha256_text("hello")
    assert sha256_text("hello") != sha256_text("world")
    assert len(sha256_text("hello")) == 64


def test_normalize_vietnamese_text_strips_html():
    raw = "<p>Điều 1. Phạm vi   điều chỉnh</p><style>.a{color:red}</style>"
    result = normalize_vietnamese_text(raw)
    assert "<p>" not in result
    assert "Điều 1" in result


def test_normalize_vietnamese_text_collapses_whitespace():
    raw = "Điều   1.\n\n\n\nPhạm vi"
    result = normalize_vietnamese_text(raw)
    assert "   " not in result
    assert "\n\n\n" not in result


def test_build_search_text_lowercases():
    normalized = "Điều 1. Phạm Vi Điều Chỉnh"
    search_text = build_search_text(normalized)
    assert search_text == search_text.lower()
    assert "điều" in search_text


def test_normalize_document_number_strips_prefix():
    assert normalize_document_number("Nghị quyết số: 528/2018/UBTVQH14") == ["528/2018/UBTVQH14"]


def test_normalize_document_number_strips_trailing_annotation():
    assert normalize_document_number("109/2005/QĐ-BCA (A11)") == ["109/2005/QĐ-BCA"]


def test_normalize_document_number_strips_trailing_date():
    result = normalize_document_number("49/2007/TTLT-BTC-BGD ngày 18/5/2007")
    assert result == ["49/2007/TTLT-BTC-BGD"]


def test_normalize_document_number_splits_multiple():
    result = normalize_document_number("142/2009/QĐ-TTg và 49/2012/QĐ-TTg")
    assert result == ["142/2009/QĐ-TTg", "49/2012/QĐ-TTg"]


def test_normalize_document_number_preserves_khong_so():
    assert normalize_document_number("Không số") == ["Không số"]


def test_normalize_document_number_empty():
    assert normalize_document_number(None) == []
    assert normalize_document_number("") == []


def test_normalize_date_various_formats():
    assert normalize_date("27/03/1950") == "1950-03-27"
    assert normalize_date("2026-05-19") == "2026-05-19"
    assert normalize_date("2026-05-19T10:37:41") == "2026-05-19"


def test_normalize_date_invalid_returns_none():
    assert normalize_date("not-a-date") is None
    assert normalize_date(None) is None
    assert normalize_date("") is None


def test_slugify_vi():
    assert slugify_vi("Nghị định") == "nghi_dinh"
    assert slugify_vi("Thông tư liên tịch") == "thong_tu_lien_tich"
    assert slugify_vi("Quyết định") == "quyet_dinh"
