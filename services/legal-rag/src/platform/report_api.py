"""Framework-neutral report API facade for STEP11.

This module intentionally contains no HTTP, database, CRM, or filesystem code.
It provides one dispatch point that a future FastAPI/Next.js bridge can call.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal, overload

from ..customer_report_builder import CustomerReport
from ..expert_report_builder import ExpertReport
from .customer_report_adapter import adapt_customer_report
from .expert_report_adapter import adapt_expert_report

ReportAudience = Literal["customer", "expert"]


@dataclass(frozen=True)
class PlatformReportContext:
    lead_id: str
    service_type: str
    case_id: str | None = None


@overload
def build_platform_report_payload(
    report: CustomerReport,
    *,
    audience: Literal["customer"],
    context: PlatformReportContext,
) -> dict[str, Any]: ...


@overload
def build_platform_report_payload(
    report: ExpertReport,
    *,
    audience: Literal["expert"],
    context: PlatformReportContext,
) -> dict[str, Any]: ...


def build_platform_report_payload(
    report: CustomerReport | ExpertReport,
    *,
    audience: ReportAudience,
    context: PlatformReportContext,
) -> dict[str, Any]:
    """Build a transport-safe DTO and reject cross-audience report leakage."""
    if audience == "customer":
        if not isinstance(report, CustomerReport):
            raise TypeError("customer audience requires CustomerReport")
        return adapt_customer_report(
            report,
            lead_id=context.lead_id,
            service_type=context.service_type,
            case_id=context.case_id,
        ).to_dict()

    if audience == "expert":
        if not isinstance(report, ExpertReport):
            raise TypeError("expert audience requires ExpertReport")
        return adapt_expert_report(
            report,
            lead_id=context.lead_id,
            service_type=context.service_type,
            case_id=context.case_id,
        ).to_dict()

    raise ValueError(f"unsupported audience: {audience}")
