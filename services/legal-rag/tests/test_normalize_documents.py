from src.normalize_documents import (
    normalize_th1nhng0_legacy_row,
    normalize_th1nhng0_metadata_row,
    normalize_vbpl_row,
    standardize_status,
)
from src.schema import DocumentStatus


def test_standardize_status_active():
    assert standardize_status("Còn hiệu lực") == DocumentStatus.ACTIVE


def test_standardize_status_fully_expired():
    assert standardize_status("Hết hiệu lực toàn bộ") == DocumentStatus.FULLY_EXPIRED


def test_standardize_status_unknown_for_unmapped():
    assert standardize_status("Một trạng thái lạ") == DocumentStatus.UNKNOWN


def test_standardize_status_none():
    assert standardize_status(None) == DocumentStatus.UNKNOWN


def test_normalize_vbpl_row_basic_fields():
    row = {
        "doc_name": "186739",
        "source_url": "https://vbpl.vn/van-ban/chi-tiet/x",
        "api_url": "https://vbpl-bientap-gateway.moj.gov.vn/api/qtdc/public/doc/186739",
        "title": "Ban hành Quy chế quản lý ngân sách",
        "doc_type": "quyet_dinh",
        "doc_number": ["143/QĐ-KHTC"],
        "issue_date": "2018-01-29",
        "issuing_authority": "Bộ Tư pháp",
        "markdown": "Điều 1. Phạm vi điều chỉnh\nQuyết định này quy định...",
    }
    doc = normalize_vbpl_row(row)
    assert doc.documentId == "tmquan:186739"
    assert doc.sourceDataset == "tmquan_vbpl_vn"
    assert doc.documentNumber == ["143/QĐ-KHTC"]
    assert doc.issueDate == "2018-01-29"
    assert doc.status == "unknown"  # tmquan에는 효력상태 필드 없음
    assert doc.originalText == row["markdown"]
    assert doc.normalizedText is not None
    assert doc.contentHash is not None


def test_normalize_vbpl_row_handles_null_body():
    row = {"doc_name": "1", "markdown": None, "doc_number": None}
    doc = normalize_vbpl_row(row)
    assert doc.originalText is None
    assert doc.normalizedText is None
    assert doc.contentHash is None
    assert doc.documentNumber == []


def test_normalize_th1nhng0_metadata_row_with_content_join():
    row = {
        "id": "4260",
        "title": "Quyết định về việc...",
        "so_ky_hieu": "115/NQ-HĐBCQG",
        "ngay_ban_hanh": "15/12/2014",
        "co_quan_ban_hanh": "HĐND Tỉnh Phú Thọ",
        "tinh_trang_hieu_luc": "Còn hiệu lực",
    }
    content_by_id = {"4260": "<p>Nội dung quyết định...</p>"}
    doc = normalize_th1nhng0_metadata_row(row, content_by_id)
    assert doc.documentId == "th1nhng0:4260"
    assert doc.issueDate == "2014-12-15"
    assert doc.status == "active"
    assert doc.rawStatus == "Còn hiệu lực"
    assert doc.originalText == content_by_id["4260"]
    assert "<p>" not in doc.normalizedText


def test_normalize_th1nhng0_metadata_row_without_content():
    row = {"id": "1", "title": "T", "tinh_trang_hieu_luc": "Hết hiệu lực toàn bộ"}
    doc = normalize_th1nhng0_metadata_row(row)
    assert doc.originalText is None
    assert doc.status == "fully_expired"


def test_normalize_th1nhng0_legacy_row():
    row = {
        "id": "999",
        "title": "Legacy doc",
        "document_number": "20/2013/QĐ-UBND",
        "legal_type": "Decision",
        "issuing_authority": "UBND tỉnh Phú Yên",
        "issuance_date": "2015-12-04",
        "effect_date": "2016-01-01",
        "effectless_date": "",
        "effect_status": "In effect",
    }
    doc = normalize_th1nhng0_legacy_row(row)
    assert doc.documentId == "th1nhng0-legacy:999"
    assert doc.issueDate == "2015-12-04"
    assert doc.effectiveDate == "2016-01-01"
    assert doc.expiryDate is None
    assert doc.status == "active"
