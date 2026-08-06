"""VERIFY workflow adapter for STEP12."""

from __future__ import annotations

from ..customer_report_builder import CustomerReport
from ..expert_report_builder import ExpertReport
from ._adapter_utils import customer_delivery, expert_delivery
from .common import IntegratedReportBundle, IntegrationContext


def build_verify_bundle(
    *,
    context: IntegrationContext,
    expert_report: ExpertReport,
    customer_report: CustomerReport | None = None,
) -> IntegratedReportBundle:
    context = context.normalized()
    if context.service_group != "verify":
        raise ValueError("VERIFY adapter requires service_group='verify'")

    deliveries = []
    if customer_report is not None:
        deliveries.append(customer_delivery(customer_report, context, ("mypage", "customer_pdf")))
    deliveries.append(expert_delivery(expert_report, context, ("crm", "admin", "expert_pdf")))
    return IntegratedReportBundle("verify", context, tuple(deliveries))
