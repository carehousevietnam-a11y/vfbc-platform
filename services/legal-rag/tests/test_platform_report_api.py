from __future__ import annotations

import pytest

from src.customer_report_builder import CustomerReport
from src.expert_report_builder import ExpertReport
from src.report_sections import ReportSection
from src.platform.report_api import PlatformReportContext, build_platform_report_payload


def _customer() -> CustomerReport:
    return CustomerReport(
        status="success",
        language="vi",
        question="Có cần giấy phép lao động không?",
        title="Tóm tắt điều hành",
        sections=[ReportSection("executive_summary", "Tóm tắt điều hành", content="Kết quả")],
    )


def _expert() -> ExpertReport:
    return ExpertReport(
        status="success",
        language="vi",
        question="Có cần giấy phép lao động không?",
        title="VFBCAI Expert Legal Review",
        sections=[ReportSection("internal_notes", "Internal Notes", content="Kiểm tra")],
    )


def test_api_dispatches_customer_report():
    payload = build_platform_report_payload(
        _customer(),
        audience="customer",
        context=PlatformReportContext("lead-3", "check-wp", "case-3"),
    )
    assert payload["audience"] == "customer"
    assert payload["delivery"]["targets"] == ["mypage", "pdf"]


def test_api_dispatches_expert_report():
    payload = build_platform_report_payload(
        _expert(),
        audience="expert",
        context=PlatformReportContext("lead-3", "check-wp", "case-3"),
    )
    assert payload["audience"] == "expert"
    assert payload["delivery"]["targets"] == ["crm", "admin", "pdf"]


def test_api_rejects_expert_report_for_customer_audience():
    with pytest.raises(TypeError, match="CustomerReport"):
        build_platform_report_payload(
            _expert(),
            audience="customer",
            context=PlatformReportContext("lead-3", "check-wp"),
        )


def test_api_rejects_customer_report_for_expert_audience():
    with pytest.raises(TypeError, match="ExpertReport"):
        build_platform_report_payload(
            _customer(),
            audience="expert",
            context=PlatformReportContext("lead-3", "check-wp"),
        )


def test_api_output_is_json_serializable():
    import json

    payload = build_platform_report_payload(
        _customer(),
        audience="customer",
        context=PlatformReportContext("lead-3", "check-wp"),
    )
    encoded = json.dumps(payload, ensure_ascii=False)
    assert "Có cần giấy phép lao động không?" in encoded
