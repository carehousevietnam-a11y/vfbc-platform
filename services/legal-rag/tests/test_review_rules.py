from src.ai_review_models import (
    STATUS_INSUFFICIENT_EVIDENCE,
    STATUS_PARTIAL_EVIDENCE,
    STATUS_SUCCESS,
    AIReviewResult,
    LegalBasisCitation,
)
from src.evidence_builder import ArticleReference, EvidencePack
from src.review_rules import apply_review_rules


def _pack(*, article_no: str | None = "9") -> EvidencePack:
    return EvidencePack(
        document_id="doc-1",
        document_number=["152/2020/NĐ-CP"],
        title="Nghị định về lao động nước ngoài",
        issuing_authority="Chính phủ",
        effective_date="2021-02-15",
        status="active",
        official_url="https://example.test/152",
        articles=[
            ArticleReference(article_no, None, None, "Điều 9", 90.0, "canonical_concept")
        ],
        search_keywords=["work permit"],
        top_score=90.0,
        top_match_type="canonical_concept",
        original_title="Nghị định về lao động nước ngoài",
        original_headings=["Điều 9"],
    )


def test_success_with_article_citation_stays_grade_a():
    result = AIReviewResult(
        status=STATUS_SUCCESS,
        language="ko",
        summary="요약",
        legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9")],
    )
    ruled = apply_review_rules(result, evidence_packs=[_pack()], question="질문", service_group="check")
    assert ruled.status == STATUS_SUCCESS


def test_success_without_articles_becomes_partial_evidence_when_documents_exist():
    result = AIReviewResult(status=STATUS_SUCCESS, language="ko", summary=None)
    ruled = apply_review_rules(
        result,
        evidence_packs=[_pack()],
        question="노동허가가 필요한가요?",
        service_group="check",
    )
    assert ruled.status == STATUS_PARTIAL_EVIDENCE
    assert ruled.summary
    assert "152/2020/NĐ-CP" in ruled.summary
    assert ruled.expert_review_required is True


def test_insufficient_evidence_with_documents_becomes_partial_evidence():
    result = AIReviewResult(status=STATUS_INSUFFICIENT_EVIDENCE, language="ko")
    ruled = apply_review_rules(
        result,
        evidence_packs=[_pack()],
        question="노동허가",
        service_group="check",
    )
    assert ruled.status == STATUS_PARTIAL_EVIDENCE


def test_success_without_evidence_becomes_insufficient():
    result = AIReviewResult(status=STATUS_SUCCESS, language="ko")
    ruled = apply_review_rules(result, evidence_packs=[], question="노동허가 경력 요건", service_group="check", service_type="wp")
    assert ruled.status == STATUS_INSUFFICIENT_EVIDENCE
    assert ruled.summary
    assert "노동허가" in ruled.summary
    assert "전문가" in ruled.summary
