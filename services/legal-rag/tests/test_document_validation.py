from src.document_validation import validate_document
from src.schema import DocumentStatus


def test_rule_1_superseded_by_with_active_fails():
    doc = {
        "documentId": "a",
        "status": DocumentStatus.ACTIVE.value,
        "supersededBy": ["b"],
        "relatedDocuments": [{"documentId": "b", "relationType": "superseded_by"}],
    }
    errors = validate_document(doc, {"a", "b"}, cyclic_graph={"a": set(), "b": set()})
    assert any(e.rule == "1" for e in errors)


def test_rule_2b_effective_before_issue_fails():
    doc = {
        "documentId": "a",
        "status": DocumentStatus.ACTIVE.value,
        "issueDate": "2020-06-01",
        "effectiveDate": "2020-01-01",
        "relatedDocuments": [],
        "supersededBy": [],
    }
    errors = validate_document(doc, {"a"}, cyclic_graph={"a": set()})
    assert any(e.rule == "2b" for e in errors)


def test_rule_2b_same_day_issue_and_effective_passes():
    doc = {
        "documentId": "a",
        "status": DocumentStatus.ACTIVE.value,
        "issueDate": "2020-06-01",
        "effectiveDate": "2020-06-01",
        "relatedDocuments": [],
        "supersededBy": [],
    }
    errors = validate_document(doc, {"a"}, cyclic_graph={"a": set()})
    assert not any(e.rule == "2b" for e in errors)
