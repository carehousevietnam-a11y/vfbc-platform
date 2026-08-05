from src.dataset_validator import (
    run_validation,
    validate_content,
    validate_document_number,
    validate_official_url,
    validate_status,
    validate_title,
    ValidationReport,
)


def _doc(**kwargs):
    base = {
        "documentId": "x", "documentNumber": [], "officialUrl": None,
        "issueDate": None, "effectiveDate": None, "status": "unknown",
        "rawStatus": None, "title": None, "normalizedText": None,
    }
    base.update(kwargs)
    return base


def test_validate_official_url_passes_valid_url():
    report = ValidationReport()
    validate_official_url([_doc(officialUrl="https://vbpl.vn/x")], report)
    cat = report.cat("official_url")
    assert cat.passed == 1 and cat.missing == 0 and cat.malformed == 0


def test_validate_official_url_missing():
    report = ValidationReport()
    validate_official_url([_doc(officialUrl=None)], report)
    assert report.cat("official_url").missing == 1


def test_validate_official_url_malformed():
    report = ValidationReport()
    validate_official_url([_doc(officialUrl="not-a-url")], report)
    assert report.cat("official_url").malformed == 1


def test_validate_document_number_malformed_format():
    report = ValidationReport()
    validate_document_number([_doc(documentNumber=["이상한번호형식"])], report)
    assert report.cat("document_number").malformed == 1


def test_validate_document_number_valid_format():
    report = ValidationReport()
    validate_document_number([_doc(documentNumber=["152/2020/NĐ-CP"])], report)
    assert report.cat("document_number").passed == 1


def test_validate_document_number_khong_so_is_valid():
    report = ValidationReport()
    validate_document_number([_doc(documentNumber=["Không số"])], report)
    assert report.cat("document_number").passed == 1


def test_validate_status_known_value_passes():
    report = ValidationReport()
    validate_status([_doc(status="active", rawStatus="Còn hiệu lực")], report)
    assert report.cat("status").passed == 1


def test_validate_status_unmapped_raw_status_flagged():
    report = ValidationReport()
    validate_status([_doc(status="unknown", rawStatus="이상한 상태값")], report)
    assert report.cat("status").malformed == 1


def test_validate_status_no_raw_status_is_missing_not_malformed():
    report = ValidationReport()
    validate_status([_doc(status="unknown", rawStatus=None)], report)
    assert report.cat("status").missing == 1


def test_validate_title_missing():
    report = ValidationReport()
    validate_title([_doc(title=None), _doc(title="  ")], report)
    assert report.cat("title").missing == 2


def test_validate_content_detects_html_residue():
    report = ValidationReport()
    validate_content([_doc(normalizedText="<div>정규화 실패로 남은 태그</div>")], report)
    assert report.cat("html_residue").malformed == 1


def test_validate_content_clean_text_passes_html_check():
    report = ValidationReport()
    validate_content([_doc(normalizedText="정상적인 본문 텍스트")], report)
    assert report.cat("html_residue").passed == 1


def test_validate_content_missing():
    report = ValidationReport()
    validate_content([_doc(normalizedText=None)], report)
    assert report.cat("content").missing == 1


# --- 통합: run_validation ---

def test_run_validation_detects_duplicates():
    docs = [
        _doc(
            documentId="a", documentNumber=["1/2020/ND-CP"], issueDate="2020-01-01",
            issuingAuthority="Chính phủ", title="X",
        ),
        _doc(
            documentId="b", documentNumber=["1/2020/ND-CP"], issueDate="2020-01-01",
            issuingAuthority="Chính phủ", title="Y",
        ),
    ]
    report = run_validation(docs)
    assert report.duplicate_group_count == 1


def test_run_validation_relationship_unmapped_label():
    docs = [_doc(documentId="th1nhng0:1"), _doc(documentId="th1nhng0:2")]
    relationships = [{"doc_id": "1", "other_doc_id": "2", "relationship": "??????"}]
    report = run_validation(docs, relationships)
    assert report.cat("relationship").malformed == 1


def test_run_validation_relationship_missing_ids():
    docs = [_doc(documentId="th1nhng0:1")]
    relationships = [{"doc_id": None, "other_doc_id": "2", "relationship": "x"}]
    report = run_validation(docs, relationships)
    assert report.cat("relationship").missing == 1


def test_run_validation_relationship_references_unknown_document():
    docs = [_doc(documentId="th1nhng0:1")]
    relationships = [{"doc_id": "1", "other_doc_id": "999", "relationship": "Sửa đổi"}]
    report = run_validation(docs, relationships)
    assert report.cat("relationship").malformed == 1


def test_run_validation_produces_all_categories():
    docs = [_doc(documentId="a", title="T", officialUrl="https://x.com", normalizedText="본문")]
    report = run_validation(docs)
    expected_categories = {
        "official_url", "document_number", "issue_date", "effective_date",
        "status", "title", "content", "html_residue", "metadata_completeness",
    }
    assert expected_categories.issubset(report.categories.keys())
