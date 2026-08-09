from src.ai_review_models import (
    ALL_STATUSES,
    STATUS_API_ERROR,
    STATUS_CONFIGURATION_ERROR,
    STATUS_INSUFFICIENT_EVIDENCE,
    STATUS_INVALID_LANGUAGE,
    STATUS_INVALID_RESPONSE,
    STATUS_NO_EVIDENCE,
    STATUS_PARTIAL_EVIDENCE,
    STATUS_SUCCESS,
    SUPPORTED_LANGUAGES,
    AIReviewResult,
    LegalBasisCitation,
)


def test_supported_languages():
    assert SUPPORTED_LANGUAGES == ("ko", "en", "zh", "vi")


def test_all_statuses_contains_eight_codes():
    assert len(ALL_STATUSES) == 8
    assert STATUS_SUCCESS in ALL_STATUSES
    assert STATUS_PARTIAL_EVIDENCE in ALL_STATUSES
    assert STATUS_NO_EVIDENCE in ALL_STATUSES
    assert STATUS_CONFIGURATION_ERROR in ALL_STATUSES
    assert STATUS_INVALID_LANGUAGE in ALL_STATUSES
    assert STATUS_INVALID_RESPONSE in ALL_STATUSES
    assert STATUS_API_ERROR in ALL_STATUSES
    assert STATUS_INSUFFICIENT_EVIDENCE in ALL_STATUSES


def test_legal_basis_citation_to_dict():
    c = LegalBasisCitation(document_number="152/2020/NĐ-CP", article="Điều 9", note="test")
    assert c.to_dict() == {"document_number": "152/2020/NĐ-CP", "article": "Điều 9", "note": "test"}


def test_legal_basis_citation_is_frozen():
    c = LegalBasisCitation(document_number="1/2020")
    try:
        c.document_number = "2/2020"  # type: ignore[misc]
        assert False, "frozen dataclass여야 함"
    except Exception:
        pass


def test_ai_review_result_defaults():
    result = AIReviewResult(status=STATUS_SUCCESS)
    assert result.legal_basis == []
    assert result.risk_factors == []
    assert result.required_documents == []
    assert result.expert_review_required is True
    assert result.source_document_count == 0


def test_ai_review_result_to_dict_roundtrip():
    result = AIReviewResult(
        status=STATUS_SUCCESS,
        language="ko",
        summary="요약",
        legal_basis=[LegalBasisCitation("1/2020", "Điều 1")],
        risk_factors=["위험1"],
        required_documents=["서류1"],
        expert_review_required=False,
        source_document_count=1,
        source_article_count=1,
        model="gpt-4o",
        raw_text='{"summary": "요약"}',
    )
    d = result.to_dict()
    assert d["status"] == STATUS_SUCCESS
    assert d["legal_basis"] == [{"document_number": "1/2020", "article": "Điều 1", "note": None}]
    assert d["model"] == "gpt-4o"
