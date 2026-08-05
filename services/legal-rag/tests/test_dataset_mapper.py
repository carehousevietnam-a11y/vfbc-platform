from src.dataset_mapper import MappingReport, map_dataset, map_row


def test_map_row_vbpl_all_fields_present():
    report = MappingReport()
    row = {
        "doc_name": "186739",
        "source_url": "https://vbpl.vn/x",
        "api_url": "https://api.vbpl.vn/x",
        "title": "Quy định về giấy phép lao động",
        "doc_type": "nghi_dinh",
        "doc_number": ["152/2020/NĐ-CP"],
        "issue_date": "30/12/2020",
        "issuing_authority": "Chính phủ",
        "markdown": "Điều 1. Nội dung.",
    }
    canonical = map_row(row, "vbpl", report)
    assert canonical["documentId"] == "tmquan:186739"
    assert canonical["sourceDataset"] == "tmquan_vbpl_vn"
    assert canonical["officialUrl"] == "https://vbpl.vn/x"
    assert canonical["documentNumber"] == ["152/2020/NĐ-CP"]
    assert canonical["issueDate"] == "2020-12-30"
    assert canonical["originalText"] == "Điều 1. Nội dung."
    assert canonical["contentHash"] is not None


def test_map_row_missing_source_document_id_returns_none():
    report = MappingReport()
    row = {"title": "제목만 있음"}
    canonical = map_row(row, "vbpl", report)
    assert canonical is None
    assert any(i.canonical_field == "sourceDocumentId" for i in report.issues)


def test_map_row_th1nhng0_metadata_without_url_field():
    """th1nhng0 metadata 공개 스키마에는 URL 필드가 없음 — None으로 처리되어야 하며 크래시하지 않아야 함."""
    report = MappingReport()
    row = {
        "id": "5001",
        "title": "T",
        "so_ky_hieu": "1/2020/TT",
        "ngay_ban_hanh": "01/01/2020",
        "co_quan_ban_hanh": "A",
        "tinh_trang_hieu_luc": "Còn hiệu lực",
    }
    canonical = map_row(row, "th1nhng0_metadata", report)
    assert canonical["officialUrl"] is None
    assert canonical["status"] == "active"
    assert report.field_miss_counts.get("officialUrl", 0) >= 1


def test_map_row_content_join_from_separate_source():
    report = MappingReport()
    row = {"id": "5001", "title": "T"}
    content_by_id = {"5001": "<p>본문 내용</p>"}
    canonical = map_row(row, "th1nhng0_metadata", report, content_by_id)
    assert canonical["originalText"] == "<p>본문 내용</p>"
    assert "<p>" not in canonical["normalizedText"]  # HTML 태그 제거됨


def test_map_row_content_join_missing_counts_as_miss_not_hit():
    """content_by_id에도 없으면 bodyRaw가 진짜로 없는 것 — hit으로 잘못 카운트되면 안 됨(회귀 테스트)."""
    report = MappingReport()
    row = {"id": "9999", "title": "T"}
    canonical = map_row(row, "th1nhng0_metadata", report, content_by_id={"5001": "내용"})
    assert canonical["originalText"] is None
    assert report.field_miss_counts.get("bodyRaw", 0) == 1
    assert report.field_hit_counts.get("bodyRaw", 0) == 0


def test_map_row_multiple_document_numbers_normalized():
    report = MappingReport()
    row = {"doc_name": "1", "doc_number": ["152/2020/NĐ-CP và 70/2023/NĐ-CP"]}
    canonical = map_row(row, "vbpl", report)
    assert canonical["documentNumber"] == ["152/2020/NĐ-CP", "70/2023/NĐ-CP"]


def test_map_row_unknown_source_key_returns_none():
    report = MappingReport()
    canonical = map_row({"id": "1"}, "some_unknown_source", report)
    assert canonical is None


def test_map_dataset_joins_content_across_rows():
    rows = [
        ("th1nhng0_metadata", {"id": "1", "title": "A"}),
        ("th1nhng0_content", {"id": "1", "content_html": "<p>내용</p>"}),
        ("th1nhng0_metadata", {"id": "2", "title": "B"}),  # content 없음
    ]
    mapped, report = map_dataset(rows)
    assert len(mapped) == 2
    doc1 = next(d for d in mapped if d["documentId"] == "th1nhng0:1")
    doc2 = next(d for d in mapped if d["documentId"] == "th1nhng0:2")
    assert doc1["originalText"] == "<p>내용</p>"
    assert doc2["originalText"] is None
    assert report.total_rows == 2  # content/relationships는 total_rows에 포함 안 됨
    assert report.mapped_rows == 2


def test_map_dataset_skips_relationship_rows():
    rows = [
        ("th1nhng0_metadata", {"id": "1", "title": "A"}),
        ("th1nhng0_relationships", {"doc_id": "1", "other_doc_id": "2", "relationship": "x"}),
    ]
    mapped, report = map_dataset(rows)
    assert len(mapped) == 1
    assert report.total_rows == 1
