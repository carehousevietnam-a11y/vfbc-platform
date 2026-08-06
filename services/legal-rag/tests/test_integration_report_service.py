from __future__ import annotations

import pytest

from src.customer_report_builder import CustomerReport
from src.expert_report_builder import ExpertReport
from src.integration.common import IntegrationContext
from src.integration.report_service import build_service_integration_bundle
from src.report_sections import ReportSection


def customer() -> CustomerReport:
    return CustomerReport("success", "en", "Question", "Summary", [ReportSection("s", "S")])


def expert() -> ExpertReport:
    return ExpertReport("success", "en", "Question", "Expert", [ReportSection("s", "S")])


def ctx(group: str) -> IntegrationContext:
    return IntegrationContext("lead", f"{group}-service", group)


def test_service_dispatches_check():
    bundle = build_service_integration_bundle(context=ctx("check"), customer_report=customer())
    assert bundle.workflow == "check"


def test_service_dispatches_verify():
    bundle = build_service_integration_bundle(context=ctx("verify"), expert_report=expert())
    assert bundle.workflow == "verify"
    assert bundle.deliveries[0].audience == "expert"


def test_service_dispatches_register():
    bundle = build_service_integration_bundle(context=ctx("register"), customer_report=customer())
    assert bundle.workflow == "register"


def test_check_requires_customer_report():
    with pytest.raises(ValueError, match="CHECK workflow requires customer_report"):
        build_service_integration_bundle(context=ctx("check"), expert_report=expert())


def test_verify_requires_expert_report():
    with pytest.raises(ValueError, match="VERIFY workflow requires expert_report"):
        build_service_integration_bundle(context=ctx("verify"), customer_report=customer())


def test_register_requires_customer_report():
    with pytest.raises(ValueError, match="REGISTER workflow requires customer_report"):
        build_service_integration_bundle(context=ctx("register"), expert_report=expert())


def test_bundle_does_not_mutate_source_reports():
    c = customer()
    e = expert()
    c_before = c.to_dict()
    e_before = e.to_dict()
    build_service_integration_bundle(context=ctx("register"), customer_report=c, expert_report=e)
    assert c.to_dict() == c_before
    assert e.to_dict() == e_before


def test_customer_and_expert_payloads_remain_separated():
    payload = build_service_integration_bundle(
        context=ctx("check"), customer_report=customer(), expert_report=expert()
    ).to_dict()
    customer_delivery, expert_delivery = payload["deliveries"]
    assert customer_delivery["payload"]["report"]["report_type"] == "customer"
    assert expert_delivery["payload"]["report"]["report_type"] == "expert"
    assert customer_delivery["payload"]["delivery"]["customer_visible"] is True
    assert expert_delivery["payload"]["delivery"]["customer_visible"] is False
