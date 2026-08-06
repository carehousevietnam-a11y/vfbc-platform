from __future__ import annotations

from ..customer_report_builder import CustomerReport
from ..expert_report_builder import ExpertReport
from ..platform.report_api import PlatformReportContext, build_platform_report_payload
from .common import DeliveryPlan, IntegrationContext


def customer_delivery(report: CustomerReport, context: IntegrationContext, targets: tuple[str, ...]) -> DeliveryPlan:
    payload = build_platform_report_payload(
        report,
        audience="customer",
        context=PlatformReportContext(context.lead_id, context.service_type, context.case_id),
    )
    return DeliveryPlan("customer", targets, payload)


def expert_delivery(report: ExpertReport, context: IntegrationContext, targets: tuple[str, ...]) -> DeliveryPlan:
    payload = build_platform_report_payload(
        report,
        audience="expert",
        context=PlatformReportContext(context.lead_id, context.service_type, context.case_id),
    )
    return DeliveryPlan("expert", targets, payload)
