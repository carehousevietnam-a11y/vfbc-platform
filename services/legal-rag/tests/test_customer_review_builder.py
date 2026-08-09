from __future__ import annotations

from src.ai_review_engine import ReviewResult
from src.ai_review_models import LegalBasisCitation, STATUS_SUCCESS
from src.citation_engine import build_citations
from src.confidence_engine import calculate_confidence
from src.customer_review_builder import (
    CUSTOMER_REVIEW_SCHEMA_VERSION,
    build_customer_review,
)
from src.evidence_builder import ArticleReference, EvidencePack


def _pack() -> EvidencePack:
    return EvidencePack(
        document_id="doc-1",
        document_number=["152/2020/NĐ-CP"],
        title="Nghị định về lao động nước ngoài",
        issuing_authority="Chính phủ",
        effective_date="2021-02-15",
        status="active",
        official_url="https://vbpl.vn/doc",
        articles=[ArticleReference("9", None, None, "Điều 9", 95.0, "canonical_concept")],
        search_keywords=["work permit"],
        top_score=95.0,
        top_match_type="canonical_concept",
        original_title="Nghị định về lao động nước ngoài",
        original_headings=["Điều 9"],
    )


def _review(*, expert=False) -> ReviewResult:
    return ReviewResult(
        status=STATUS_SUCCESS,
        language="ko",
        question="노동허가가 필요한가요?",
        summary="관련 법령에 따라 검토가 필요합니다.",
        legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9", "판단 근거")],
        risk_factors=["면제 요건 확인 필요"],
        required_documents=["여권", "경력증명서"],
        expert_review_required=expert,
        expert_review_reason="개별 사실관계 확인" if expert else None,
        source_document_count=1,
        source_article_count=1,
        model="gpt-test",
        prompt_metadata={"internal": True},
    )


def _build(*, expert=False):
    pack = _pack()
    review = _review(expert=expert)
    citations = build_citations(review, [pack])
    confidence = calculate_confidence(review, citations, [pack])
    return build_customer_review(review, citations, confidence), review, citations, confidence


def test_customer_contract_is_separate_and_stable():
    result, *_ = _build()
    payload = result.to_dict()
    assert payload["schema_version"] == CUSTOMER_REVIEW_SCHEMA_VERSION
    assert payload["audience"] == "customer"
    assert list(payload) == [
        "schema_version", "audience", "status", "language", "question",
        "ai_summary", "confidence", "legal_basis", "risk_factors",
        "required_documents", "next_actions", "expert_review",
    ]


def test_customer_output_hides_internal_review_metadata():
    result, *_ = _build()
    payload = result.to_dict()
    assert "model" not in payload
    assert "prompt_metadata" not in payload
    assert "breakdown" not in payload["confidence"]
    assert "reasons" not in payload["confidence"]
    assert "evidence" not in payload


def test_customer_legal_basis_contains_only_public_fields():
    result, *_ = _build()
    basis = result.to_dict()["legal_basis"][0]
    assert list(basis) == ["document_number", "article", "title", "official_url", "formatted_line"]
    assert "note" not in basis
    assert "document_id" not in basis
    assert "evidence_index" not in basis


def test_customer_legal_basis_grade_a_uses_structured_citation_line():
    result, *_ = _build()
    basis = result.to_dict()["legal_basis"][0]
    assert basis["formatted_line"] == "Nghị định về lao động nước ngoài (152/2020/NĐ-CP) 제9조"


def test_customer_legal_basis_grade_b_document_only_line():
    from src.ai_review_models import STATUS_PARTIAL_EVIDENCE
    from src.confidence_engine import calculate_confidence

    pack = _pack()
    review = ReviewResult(
        status=STATUS_PARTIAL_EVIDENCE,
        language="ko",
        question="노동허가가 필요한가요?",
        summary="관련 문서 확인",
        expert_review_required=True,
        source_document_count=1,
        source_article_count=0,
        model="gpt-test",
        prompt_metadata={},
    )
    citations = build_citations(review, [pack])
    confidence = calculate_confidence(review, citations, [pack])
    result = build_customer_review(review, citations, confidence, [pack])
    basis = result.to_dict()["legal_basis"][0]
    assert basis["article"] is None
    assert basis["formatted_line"] == "Nghị định về lao động nước ngoài (152/2020/NĐ-CP)"


def test_customer_next_actions_are_deterministic():
    result, *_ = _build(expert=True)
    assert result.next_actions == [
        "prepare_required_documents",
        "review_identified_risks",
        "request_expert_review",
    ]


def test_customer_expert_requirement_combines_review_and_confidence():
    result, *_ = _build(expert=True)
    assert result.expert_review_required is True
    assert result.expert_review_reason == "개별 사실관계 확인"


def test_customer_inputs_are_not_mutated():
    result, review, citations, confidence = _build()
    before_review = review.to_dict()
    before_citations = citations.to_dict()
    before_confidence = confidence.to_dict()
    build_customer_review(review, citations, confidence)
    assert review.to_dict() == before_review
    assert citations.to_dict() == before_citations
    assert confidence.to_dict() == before_confidence
    assert result.question == review.question
