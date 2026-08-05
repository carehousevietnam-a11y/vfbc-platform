from __future__ import annotations

import pytest

from src.expert_report_builder import ExpertReport
from src.report_sections import ReportSection
from src.platform.expert_report_adapter import EXPERT_DTO_SCHEMA_VERSION, adapt_expert_report


def _report() -> ExpertReport:
    return ExpertReport(
        status="success",
        language="en",
        question="Is a work permit required?",
        title="VFBCAI Expert Legal Review",
        sections=[
            ReportSection("confidence_analysis", "Confidence Analysis", items=[{"breakdown": {"evidence": 30}}]),
            ReportSection("internal_notes", "Internal Notes", content="Verify exemption facts"),
        ],
    )


def test_expert_adapter_contract_and_targets():
    payload = adapt_expert_report(
        _report(), lead_id="lead-2", service_type="verify-admin", case_id="case-2"
    ).to_dict()
    assert payload["schema_version"] == EXPERT_DTO_SCHEMA_VERSION
    assert payload["audience"] == "expert"
    assert payload["delivery"] == {
        "targets": ["crm", "admin", "pdf"],
        "customer_visible": False,
        "pdf_ready": True,
    }


def test_expert_adapter_preserves_internal_sections():
    report = _report()
    payload = adapt_expert_report(report, lead_id="lead-2", service_type="verify-admin").to_dict()
    ids = [section["section_id"] for section in payload["report"]["sections"]]
    assert ids == ["confidence_analysis", "internal_notes"]
    assert payload["report"] == report.to_dict()


def test_expert_adapter_rejects_blank_case_id_when_supplied():
    with pytest.raises(ValueError, match="case_id"):
        adapt_expert_report(
            _report(), lead_id="lead-2", service_type="verify-admin", case_id=" "
        )


def test_expert_adapter_does_not_mutate_report():
    report = _report()
    before = report.to_dict()
    adapt_expert_report(report, lead_id="lead-2", service_type="verify-admin")
    assert report.to_dict() == before
