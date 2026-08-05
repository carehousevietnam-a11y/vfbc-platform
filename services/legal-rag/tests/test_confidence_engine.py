from __future__ import annotations

from src.ai_review_engine import ReviewResult
from src.ai_review_models import LegalBasisCitation, STATUS_API_ERROR, STATUS_SUCCESS
from src.citation_engine import build_citations
from src.confidence_engine import (
    CONFIDENCE_SCHEMA_VERSION,
    LEVEL_HIGH,
    LEVEL_INSUFFICIENT,
    LEVEL_LOW,
    calculate_confidence,
)
from src.evidence_builder import ArticleReference, EvidencePack


def _pack(*, score=100.0, url="https://vbpl.vn/doc", status="active") -> EvidencePack:
    return EvidencePack(
        document_id="doc-1",
        document_number=["152/2020/NĐ-CP"],
        title="Nghị định",
        issuing_authority="Chính phủ",
        effective_date="2021-02-15",
        status=status,
        official_url=url,
        articles=[
            ArticleReference("9", None, None, "Điều 9", score, "canonical_concept"),
            ArticleReference("10", None, None, "Điều 10", score, "keyword_phrase"),
            ArticleReference("11", None, None, "Điều 11", score, "keyword_all_terms"),
        ],
        search_keywords=["work permit"],
        top_score=score,
        top_match_type="canonical_concept",
        original_title="Nghị định",
        original_headings=["Điều 9", "Điều 10", "Điều 11"],
    )


def _review(*, status=STATUS_SUCCESS, expert=False, basis=True) -> ReviewResult:
    return ReviewResult(
        status=status,
        language="ko",
        question="노동허가가 필요한가요?",
        summary="검토 요약",
        legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9")] if basis else [],
        risk_factors=["위험"],
        required_documents=["서류"],
        expert_review_required=expert,
        source_document_count=1,
        source_article_count=3,
    )


def test_high_confidence_for_complete_verified_review():
    pack = _pack()
    review = _review()
    result = calculate_confidence(review, build_citations(review, [pack]), [pack])
    assert result.score == 100
    assert result.level == LEVEL_HIGH
    assert result.expert_review_required is False
    assert result.reasons == ()


def test_breakdown_maximum_weights_are_stable():
    pack = _pack()
    review = _review()
    result = calculate_confidence(review, build_citations(review, [pack]), [pack])
    assert result.breakdown.to_dict() == {
        "evidence_strength": 35,
        "citation_coverage": 30,
        "source_quality": 20,
        "review_completeness": 15,
    }


def test_no_evidence_produces_insufficient_confidence():
    review = _review(basis=False)
    result = calculate_confidence(review, build_citations(review, []), [])
    assert result.level == LEVEL_INSUFFICIENT
    assert "no_evidence" in result.reasons
    assert result.expert_review_required is True


def test_unverified_legal_basis_is_reported():
    review = _review()
    result = calculate_confidence(review, build_citations(review, []), [])
    assert "no_verified_citations" in result.reasons
    assert result.verified_citation_count == 0


def test_partial_citation_coverage_is_reported():
    pack = _pack()
    review = _review()
    review.legal_basis.append(LegalBasisCitation("999/2099/NĐ-CP", "Điều 1"))
    result = calculate_confidence(review, build_citations(review, [pack]), [pack])
    assert "partial_citation_coverage" in result.reasons
    assert result.breakdown.citation_coverage == 15


def test_missing_official_url_reduces_source_quality():
    pack = _pack(url=None)
    review = _review()
    result = calculate_confidence(review, build_citations(review, [pack]), [pack])
    assert result.breakdown.source_quality == 12
    assert "missing_official_url" in result.reasons


def test_non_success_status_is_safely_capped():
    pack = _pack()
    review = _review(status=STATUS_API_ERROR)
    result = calculate_confidence(review, build_citations(review, [pack]), [pack])
    assert result.score <= 49
    assert result.level == LEVEL_LOW
    assert "review_status:api_error" in result.reasons


def test_existing_expert_requirement_is_preserved():
    pack = _pack()
    review = _review(expert=True)
    result = calculate_confidence(review, build_citations(review, [pack]), [pack])
    assert result.expert_review_required is True


def test_inputs_are_not_mutated():
    pack = _pack()
    review = _review()
    citations = build_citations(review, [pack])
    before_review = review.to_dict()
    before_pack = pack.to_dict()
    before_citations = citations.to_dict()
    calculate_confidence(review, citations, [pack])
    assert review.to_dict() == before_review
    assert pack.to_dict() == before_pack
    assert citations.to_dict() == before_citations


def test_to_dict_contract_is_stable():
    pack = _pack()
    review = _review()
    result = calculate_confidence(review, build_citations(review, [pack]), [pack]).to_dict()
    assert result["schema_version"] == CONFIDENCE_SCHEMA_VERSION
    assert list(result) == [
        "schema_version", "score", "level", "breakdown",
        "expert_review_required", "reasons", "evidence_document_count",
        "evidence_article_count", "verified_citation_count",
    ]
