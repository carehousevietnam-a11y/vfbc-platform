from __future__ import annotations

from src.ai_review_engine import ReviewResult
from src.ai_review_models import LegalBasisCitation, STATUS_SUCCESS
from src.citation_engine import build_citations
from src.confidence_engine import calculate_confidence
from src.evidence_builder import ArticleReference, EvidencePack
from src.expert_review_builder import EXPERT_REVIEW_SCHEMA_VERSION, build_expert_review


def _pack() -> EvidencePack:
    return EvidencePack(
        document_id="doc-1",
        document_number=["152/2020/NĐ-CP"],
        title="Nghị định",
        issuing_authority="Chính phủ",
        effective_date="2021-02-15",
        status="active",
        official_url="https://vbpl.vn/doc",
        articles=[
            ArticleReference("9", "1", "a", "Điều 9", 98.0, "canonical_concept"),
            ArticleReference("10", None, None, "Điều 10", 90.0, "keyword_phrase"),
        ],
        search_keywords=["工作许可证"],
        top_score=98.0,
        top_match_type="canonical_concept",
        original_title="Nghị định",
        original_headings=["Điều 9", "Điều 10"],
    )


def _objects():
    pack = _pack()
    review = ReviewResult(
        status=STATUS_SUCCESS,
        language="zh",
        question="需要工作许可证吗？",
        summary="需要根据具体情况审查。",
        legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9 Khoản 1 Điểm a", "依据")],
        risk_factors=["豁免条件"],
        required_documents=["护照"],
        expert_review_required=True,
        expert_review_reason="需要核实事实",
        source_document_count=1,
        source_article_count=2,
        model="gpt-test",
        prompt_metadata={"language": "zh"},
    )
    citations = build_citations(review, [pack])
    confidence = calculate_confidence(review, citations, [pack])
    return pack, review, citations, confidence


def test_expert_contract_contains_full_common_results():
    pack, review, citations, confidence = _objects()
    payload = build_expert_review(review, citations, confidence, [pack]).to_dict()
    assert payload["schema_version"] == EXPERT_REVIEW_SCHEMA_VERSION
    assert payload["audience"] == "expert"
    assert payload["review"] == review.to_dict()
    assert payload["citations"] == citations.to_dict()
    assert payload["confidence"] == confidence.to_dict()


def test_expert_output_preserves_evidence_metadata():
    pack, review, citations, confidence = _objects()
    evidence = build_expert_review(review, citations, confidence, [pack]).to_dict()["evidence"][0]
    assert evidence["document_id"] == "doc-1"
    assert evidence["top_score"] == 98.0
    assert evidence["top_match_type"] == "canonical_concept"
    assert evidence["search_keywords"] == ["工作许可证"]
    assert len(evidence["articles"]) == 2


def test_expert_verification_counts_are_derived_from_inputs():
    pack, review, citations, confidence = _objects()
    verification = build_expert_review(review, citations, confidence, [pack]).to_dict()["verification"]
    assert verification == {
        "review_legal_basis_count": 1,
        "verified_citation_count": 1,
        "evidence_document_count": 1,
        "evidence_article_count": 2,
        "expert_review_required": True,
    }


def test_expert_evidence_index_follows_input_order():
    first, review, citations, confidence = _objects()
    second = _pack()
    second.document_id = "doc-2"
    second.document_number = ["12/2022/NĐ-CP"]
    result = build_expert_review(review, citations, confidence, [first, second])
    assert [item.evidence_index for item in result.evidence] == [1, 2]


def test_expert_inputs_are_not_mutated():
    pack, review, citations, confidence = _objects()
    before = (pack.to_dict(), review.to_dict(), citations.to_dict(), confidence.to_dict())
    build_expert_review(review, citations, confidence, [pack])
    after = (pack.to_dict(), review.to_dict(), citations.to_dict(), confidence.to_dict())
    assert after == before
