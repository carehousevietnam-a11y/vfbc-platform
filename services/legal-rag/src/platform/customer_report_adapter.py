"""Customer report adapter for VFBCAI platform consumers (STEP11).

The adapter preserves the STEP10 customer-safe report and adds only operational
case metadata required by MyPage and PDF delivery. It never exposes expert-only
analysis.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..customer_report_builder import CustomerReport

CUSTOMER_DTO_SCHEMA_VERSION = "step11-customer-report-dto"
CUSTOMER_DELIVERY_TARGETS = ("mypage", "pdf")


def _require_text(value: str, field_name: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError(f"{field_name} must not be empty")
    return normalized


@dataclass(frozen=True)
class CustomerReportDTO:
    lead_id: str
    service_type: str
    report: dict[str, Any]
    case_id: str | None = None
    schema_version: str = CUSTOMER_DTO_SCHEMA_VERSION

    def to_dict(self) -> dict[str, Any]:
        case: dict[str, Any] = {
            "lead_id": self.lead_id,
            "service_type": self.service_type,
        }
        if self.case_id is not None:
            case["case_id"] = self.case_id
        return {
            "schema_version": self.schema_version,
            "audience": "customer",
            "case": case,
            "delivery": {
                "targets": list(CUSTOMER_DELIVERY_TARGETS),
                "customer_visible": True,
                "pdf_ready": True,
            },
            "report": dict(self.report),
        }


def adapt_customer_report(
    report: CustomerReport,
    *,
    lead_id: str,
    service_type: str,
    case_id: str | None = None,
) -> CustomerReportDTO:
    """Convert a STEP10 CustomerReport into the stable STEP11 platform DTO."""
    lead_id = _require_text(lead_id, "lead_id")
    service_type = _require_text(service_type, "service_type")
    normalized_case_id = _require_text(case_id, "case_id") if case_id is not None else None

    payload = report.to_dict()
    if payload.get("report_type") != "customer":
        raise ValueError("customer adapter requires a customer report")

    return CustomerReportDTO(
        lead_id=lead_id,
        service_type=service_type,
        case_id=normalized_case_id,
        report=payload,
    )
