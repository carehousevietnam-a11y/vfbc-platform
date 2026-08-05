from __future__ import annotations

from src.ai_review_engine import ReviewResult
from src.ai_review_models import LegalBasisCitation
from src.citation_engine import CitationResult
from src.confidence_engine import ConfidenceBreakdown, ConfidenceResult
from src.expert_report_builder import EXPERT_REPORT_SCHEMA_VERSION, build_expert_report
from src.expert_review_builder import ExpertEvidenceRecord, ExpertReview


def _review() -> ExpertReview:
    common = ReviewResult(
        status="success",
        language="zh",
        question="需要工作许可证吗？",
        summary="需要根据具体情况审查。",
        legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9", "依据")],
        risk_factors=["豁免条件"],
        required_documents=["护照"],
        expert_review_required=True,
        expert_review_reason="需要核实事实",
        model="gpt-test",
        prompt_metadata={"language": "zh"},
    )
    citations = CitationResult("success", common.question, "zh")
    confidence = ConfidenceResult(
        score=70,
        level="medium",
        breakdown=ConfidenceBreakdown(25, 15, 15, 15),
        expert_review_required=True,
        reasons=("partial_citation_coverage",),
        evidence_document_count=1,
        evidence_article_count=1,
        verified_citation_count=0,
    )
    evidence = ExpertEvidenceRecord(
        evidence_index=1,
        document_id="doc-1",
        document_number=("152/2020/NĐ-CP",),
        title="Nghị định",
        issuing_authority="Chính phủ",
        effective_date="2021-02-15",
        status="active",
        official_url="https://vbpl.vn/doc",
        top_score=98.0,
        top_match_type="canonical_concept",
        search_keywords=("工作许可证",),
        articles=({"article": "9"},),
    )
    return ExpertReview(common, citations, confidence, [evidence])


def test_expert_report_contract_is_stable():
    payload = build_expert_report(_review()).to_dict()
    assert payload["schema_version"] == EXPERT_REPORT_SCHEMA_VERSION
    assert payload["report_type"] == "expert"
    assert payload["title"] == "VFBCAI Expert Legal Review"


def test_expert_report_contains_all_operational_sections():
    result = build_expert_report(_review())
    ids = [section.section_id for section in result.sections]
    assert ids == [
        "executive_summary", "case_overview", "verification_metrics",
        "confidence_analysis", "legal_analysis", "citation_summary",
        "evidence_summary", "risk_analysis", "required_documents",
        "recommended_actions", "internal_notes",
    ]


def test_expert_report_preserves_internal_analysis():
    payload = build_expert_report(_review()).to_dict()
    case = next(section for section in payload["sections"] if section["section_id"] == "case_overview")
    assert case["items"][0]["model"] == "gpt-test"
    assert case["items"][0]["prompt_metadata"] == {"language": "zh"}


def test_expert_report_preserves_evidence_and_confidence():
    payload = build_expert_report(_review()).to_dict()
    evidence = next(section for section in payload["sections"] if section["section_id"] == "evidence_summary")
    confidence = next(section for section in payload["sections"] if section["section_id"] == "confidence_analysis")
    assert evidence["items"][0]["top_score"] == 98.0
    assert confidence["items"][0]["breakdown"]["evidence_strength"] == 25


def test_expert_report_input_not_mutated():
    review = _review()
    before = review.to_dict()
    build_expert_report(review)
    assert review.to_dict() == before
