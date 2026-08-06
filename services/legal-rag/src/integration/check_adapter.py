"""CHECK workflow adapter for STEP12."""

from __future__ import annotations

from ..customer_report_builder import CustomerReport
from ..expert_report_builder import ExpertReport
from ._adapter_utils import customer_delivery, expert_delivery
from .common import IntegratedReportBundle, IntegrationContext


def build_check_bundle(
    *,
    context: IntegrationContext,
    customer_report: CustomerReport,
    expert_report: ExpertReport | None = None,
) -> IntegratedReportBundle:
    context = context.normalized()
    if context.service_group != "check":
        raise ValueError("CHECK adapter requires service_group='check'")

    deliveries = [customer_delivery(customer_report, context, ("mypage", "customer_pdf"))]
    if expert_report is not None:
        deliveries.append(expert_delivery(expert_report, context, ("crm", "admin", "expert_pdf")))
    return IntegratedReportBundle("check", context, tuple(deliveries))
