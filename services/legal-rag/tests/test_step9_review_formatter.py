from __future__ import annotations

import json

from src.ai_review_engine import ReviewResult
from src.confidence_engine import ConfidenceBreakdown, ConfidenceResult
from src.customer_review_builder import build_customer_review
from src.citation_engine import CitationResult
from src.step9_review_formatter import format_step9_review


def _customer():
    review = ReviewResult(
        status="success",
        language="vi",
        question="Tôi có cần giấy phép lao động không?",
        summary="Cần kiểm tra điều kiện cụ thể.",
        expert_review_required=False,
    )
    citations = CitationResult("success", review.question, "vi")
    confidence = ConfidenceResult(
        score=80,
        level="high",
        breakdown=ConfidenceBreakdown(25, 20, 20, 15),
        expert_review_required=False,
        reasons=(),
        evidence_document_count=1,
        evidence_article_count=1,
        verified_citation_count=0,
    )
    return build_customer_review(review, citations, confidence)


def test_formatter_returns_valid_unicode_json():
    text = format_step9_review(_customer())
    assert "Tôi có cần" in text
    assert "\\u" not in text
    assert json.loads(text)["audience"] == "customer"


def test_formatter_pretty_mode_is_indented():
    text = format_step9_review(_customer(), pretty=True)
    assert "\n  \"schema_version\"" in text
    assert json.loads(text)["schema_version"] == "step9-customer"


def test_formatter_is_deterministic():
    review = _customer()
    assert format_step9_review(review) == format_step9_review(review)
