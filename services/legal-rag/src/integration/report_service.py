"""Single STEP12 dispatch service for CHECK, VERIFY, and REGISTER.

The service validates audience requirements and delegates to workflow-specific
adapters. It deliberately does not perform external side effects.
"""

from __future__ import annotations

from ..customer_report_builder import CustomerReport
from ..expert_report_builder import ExpertReport
from .check_adapter import build_check_bundle
from .common import IntegratedReportBundle, IntegrationContext
from .register_adapter import build_register_bundle
from .verify_adapter import build_verify_bundle


def build_service_integration_bundle(
    *,
    context: IntegrationContext,
    customer_report: CustomerReport | None = None,
    expert_report: ExpertReport | None = None,
) -> IntegratedReportBundle:
    if context.service_group == "check":
        if customer_report is None:
            raise ValueError("CHECK workflow requires customer_report")
        return build_check_bundle(
            context=context,
            customer_report=customer_report,
            expert_report=expert_report,
        )

    if context.service_group == "verify":
        if expert_report is None:
            raise ValueError("VERIFY workflow requires expert_report")
        return build_verify_bundle(
            context=context,
            expert_report=expert_report,
            customer_report=customer_report,
        )

    if context.service_group == "register":
        if customer_report is None:
            raise ValueError("REGISTER workflow requires customer_report")
        return build_register_bundle(
            context=context,
            customer_report=customer_report,
            expert_report=expert_report,
        )

    raise ValueError(f"unsupported service_group: {context.service_group}")
