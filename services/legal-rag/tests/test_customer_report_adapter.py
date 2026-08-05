from __future__ import annotations

import pytest

from src.customer_report_builder import CustomerReport
from src.report_sections import ReportSection
from src.platform.customer_report_adapter import (
    CUSTOMER_DTO_SCHEMA_VERSION,
    adapt_customer_report,
)


def _report() -> CustomerReport:
    return CustomerReport(
        status="success",
        language="ko",
        question="노동허가가 필요한가요?",
        title="Executive Summary",
        sections=[ReportSection("executive_summary", "Executive Summary", content="검토 결과")],
    )


def test_customer_adapter_contract_and_targets():
    payload = adapt_customer_report(
        _report(), lead_id="lead-1", service_type="wp", case_id="case-1"
    ).to_dict()
    assert payload["schema_version"] == CUSTOMER_DTO_SCHEMA_VERSION
    assert payload["audience"] == "customer"
    assert payload["case"] == {"lead_id": "lead-1", "service_type": "wp", "case_id": "case-1"}
    assert payload["delivery"] == {
        "targets": ["mypage", "pdf"],
        "customer_visible": True,
        "pdf_ready": True,
    }


def test_customer_adapter_preserves_step10_report():
    report = _report()
    payload = adapt_customer_report(report, lead_id="lead-1", service_type="wp").to_dict()
    assert payload["report"] == report.to_dict()
    assert payload["report"]["report_type"] == "customer"


def test_customer_adapter_omits_optional_case_id():
    payload = adapt_customer_report(_report(), lead_id="lead-1", service_type="wp").to_dict()
    assert "case_id" not in payload["case"]


def test_customer_adapter_normalizes_operational_ids():
    payload = adapt_customer_report(
        _report(), lead_id=" lead-1 ", service_type=" wp ", case_id=" case-1 "
    ).to_dict()
    assert payload["case"] == {"lead_id": "lead-1", "service_type": "wp", "case_id": "case-1"}


@pytest.mark.parametrize("field,value", [("lead_id", " "), ("service_type", "")])
def test_customer_adapter_rejects_empty_required_context(field: str, value: str):
    kwargs = {"lead_id": "lead-1", "service_type": "wp"}
    kwargs[field] = value
    with pytest.raises(ValueError, match=field):
        adapt_customer_report(_report(), **kwargs)


def test_customer_adapter_does_not_mutate_report():
    report = _report()
    before = report.to_dict()
    adapt_customer_report(report, lead_id="lead-1", service_type="wp")
    assert report.to_dict() == before
