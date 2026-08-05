from __future__ import annotations

import json

from src.customer_report_builder import build_customer_report
from src.customer_review_builder import CustomerReview
from src.report_formatter import format_report
from src.report_sections import ReportMetric, ReportSection


def _report():
    return build_customer_report(CustomerReview(
        status="success",
        language="vi",
        question="Tôi có cần giấy phép lao động không?",
        ai_summary="Cần kiểm tra điều kiện cụ thể.",
        confidence_score=80,
        confidence_level="high",
        expert_review_required=False,
    ))


def test_report_section_omits_empty_optional_fields():
    assert ReportSection("id", "Title").to_dict() == {"section_id": "id", "title": "Title"}


def test_report_metric_contract_is_stable():
    assert ReportMetric("score", "Score", 90, "%").to_dict() == {
        "key": "score", "label": "Score", "value": 90, "unit": "%"
    }


def test_formatter_preserves_unicode():
    text = format_report(_report())
    assert "Tôi có cần" in text
    assert "\\u" not in text
    assert json.loads(text)["report_type"] == "customer"


def test_formatter_pretty_and_deterministic():
    report = _report()
    pretty = format_report(report, pretty=True)
    assert '\n  "schema_version"' in pretty
    assert format_report(report) == format_report(report)
