from __future__ import annotations

import json

from src.confidence_engine import ConfidenceBreakdown, ConfidenceResult
from src.confidence_formatter import confidence_to_dict, confidence_to_json


def _result() -> ConfidenceResult:
    return ConfidenceResult(
        score=82,
        level="high",
        breakdown=ConfidenceBreakdown(30, 25, 15, 12),
        expert_review_required=False,
        reasons=(),
        evidence_document_count=2,
        evidence_article_count=4,
        verified_citation_count=2,
    )


def test_formatter_returns_independent_dict():
    payload = confidence_to_dict(_result())
    payload["reasons"].append("changed")
    assert _result().reasons == ()


def test_json_preserves_unicode():
    result = ConfidenceResult(
        score=30,
        level="insufficient",
        breakdown=ConfidenceBreakdown(10, 0, 10, 10),
        expert_review_required=True,
        reasons=("전문가 검토 필요", "需要专家审查", "Cần chuyên gia"),
        evidence_document_count=1,
        evidence_article_count=1,
        verified_citation_count=0,
    )
    text = confidence_to_json(result)
    assert "전문가 검토 필요" in text
    assert "需要专家审查" in text
    assert "Cần chuyên gia" in text


def test_compact_json_is_valid():
    text = confidence_to_json(_result(), indent=None)
    assert json.loads(text)["score"] == 82
