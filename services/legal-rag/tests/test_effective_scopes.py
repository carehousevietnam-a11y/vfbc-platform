from src.effective_scopes import _extract_article_ids, build_effective_scopes


def test_extract_article_ids_from_path():
    chunk = {"path": "Chương I > Điều 9 > Khoản 2 > Điểm a"}
    dieu, khoan, diem = _extract_article_ids(chunk)
    assert dieu == "9"
    assert khoan == "2"
    assert diem == "a"


def test_extract_article_ids_dieu_only():
    chunk = {"path": "Điều 1"}
    dieu, khoan, diem = _extract_article_ids(chunk)
    assert dieu == "1"
    assert khoan is None
    assert diem is None


def test_build_effective_scopes_no_relations_inherits_document_status():
    chunks = [{"documentId": "doc1", "path": "Điều 1"}]
    documents_by_id = {
        "doc1": {"status": "active", "issueDate": "2020-01-01", "effectiveDate": None}
    }
    scopes = build_effective_scopes(chunks, documents_by_id, relationships=[])
    assert len(scopes) == 1
    scope = scopes[0]
    assert scope.status == "active"
    assert scope.effective_from == "2020-01-01"
    assert scope.effective_to is None
    assert scope.source_relation_id is None


def test_build_effective_scopes_with_repealing_relation():
    chunks = [
        {"documentId": "doc1", "path": "Điều 1"},
        {"documentId": "doc1", "path": "Điều 2"},
    ]
    documents_by_id = {
        "doc1": {
            "status": "repealed",
            "issueDate": "2015-01-01",
            "effectiveDate": "2015-02-01",
            "expiryDate": "2020-12-31",
        }
    }
    relationships = [
        {
            "edgeId": "docX->doc1:repeals",
            "sourceDocumentId": "docX",
            "targetDocumentId": "doc1",
            "relationType": "repeals",
        }
    ]
    scopes = build_effective_scopes(chunks, documents_by_id, relationships)
    assert len(scopes) == 2
    for scope in scopes:
        assert scope.effective_to == "2020-12-31"
        assert scope.source_relation_id == "docX->doc1:repeals"


def test_build_effective_scopes_missing_document_defaults_to_unknown():
    chunks = [{"documentId": "missing_doc", "path": "Điều 1"}]
    scopes = build_effective_scopes(chunks, documents_by_id={}, relationships=[])
    assert scopes[0].status == "unknown"
    assert scopes[0].effective_from is None
