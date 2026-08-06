from __future__ import annotations

import json

import pytest

from src.customer_report_builder import CustomerReport
from src.expert_report_builder import ExpertReport
from src.integration.check_adapter import build_check_bundle
from src.integration.common import IntegrationContext
from src.integration.register_adapter import build_register_bundle
from src.integration.verify_adapter import build_verify_bundle
from src.report_sections import ReportSection


def customer() -> CustomerReport:
    return CustomerReport(
        status="success",
        language="ko",
        question="노동허가가 필요한가요?",
        title="Executive Summary",
        sections=[ReportSection("executive_summary", "Executive Summary", content="고객 결과")],
    )


def expert() -> ExpertReport:
    return ExpertReport(
        status="success",
        language="ko",
        question="노동허가가 필요한가요?",
        title="VFBCAI Expert Legal Review",
        sections=[ReportSection("internal_notes", "Internal Notes", content="전문가 결과")],
    )


def context(group: str) -> IntegrationContext:
    return IntegrationContext(" lead-12 ", f"{group}-wp", group, " case-12 ", " request-12 ")


def test_check_builds_customer_delivery():
    payload = build_check_bundle(context=context("check"), customer_report=customer()).to_dict()
    assert payload["workflow"] == "check"
    assert payload["deliveries"][0]["targets"] == ["mypage", "customer_pdf"]
    assert payload["deliveries"][0]["payload"]["audience"] == "customer"


def test_check_optionally_builds_expert_delivery():
    payload = build_check_bundle(
        context=context("check"), customer_report=customer(), expert_report=expert()
    ).to_dict()
    assert [item["audience"] for item in payload["deliveries"]] == ["customer", "expert"]


def test_verify_requires_expert_and_can_include_customer():
    payload = build_verify_bundle(
        context=context("verify"), expert_report=expert(), customer_report=customer()
    ).to_dict()
    assert payload["deliveries"][0]["audience"] == "customer"
    assert payload["deliveries"][1]["targets"] == ["crm", "admin", "expert_pdf"]


def test_register_builds_customer_and_optional_expert():
    payload = build_register_bundle(
        context=context("register"), customer_report=customer(), expert_report=expert()
    ).to_dict()
    assert payload["workflow"] == "register"
    assert len(payload["deliveries"]) == 2


@pytest.mark.parametrize(
    ("builder", "expected"),
    [
        (lambda: build_check_bundle(context=context("verify"), customer_report=customer()), "check"),
        (lambda: build_verify_bundle(context=context("check"), expert_report=expert()), "verify"),
        (lambda: build_register_bundle(context=context("check"), customer_report=customer()), "register"),
    ],
)
def test_adapters_reject_wrong_service_group(builder, expected):
    with pytest.raises(ValueError, match=expected):
        builder()


def test_context_is_normalized_and_serializable():
    payload = build_check_bundle(context=context("check"), customer_report=customer()).to_dict()
    assert payload["case"]["lead_id"] == "lead-12"
    assert payload["case"]["case_id"] == "case-12"
    assert "노동허가" in json.dumps(payload, ensure_ascii=False)


def test_context_rejects_empty_required_fields():
    bad = IntegrationContext(" ", "check-wp", "check")
    with pytest.raises(ValueError, match="lead_id"):
        build_check_bundle(context=bad, customer_report=customer())
