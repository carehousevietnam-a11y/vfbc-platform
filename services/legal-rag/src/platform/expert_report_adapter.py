"""Expert report adapter for VFBCAI platform consumers (STEP11).

The adapter preserves STEP10 expert detail for CRM/Admin/PDF consumers while
keeping the Legal RAG package independent from application and database code.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..expert_report_builder import ExpertReport

EXPERT_DTO_SCHEMA_VERSION = "step11-expert-report-dto"
EXPERT_DELIVERY_TARGETS = ("crm", "admin", "pdf")


def _require_text(value: str, field_name: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError(f"{field_name} must not be empty")
    return normalized


@dataclass(frozen=True)
class ExpertReportDTO:
    lead_id: str
    service_type: str
    report: dict[str, Any]
    case_id: str | None = None
    schema_version: str = EXPERT_DTO_SCHEMA_VERSION

    def to_dict(self) -> dict[str, Any]:
        case: dict[str, Any] = {
            "lead_id": self.lead_id,
            "service_type": self.service_type,
        }
        if self.case_id is not None:
            case["case_id"] = self.case_id
        return {
            "schema_version": self.schema_version,
            "audience": "expert",
            "case": case,
            "delivery": {
                "targets": list(EXPERT_DELIVERY_TARGETS),
                "customer_visible": False,
                "pdf_ready": True,
            },
            "report": dict(self.report),
        }


def adapt_expert_report(
    report: ExpertReport,
    *,
    lead_id: str,
    service_type: str,
    case_id: str | None = None,
) -> ExpertReportDTO:
    """Convert a STEP10 ExpertReport into the stable STEP11 platform DTO."""
    lead_id = _require_text(lead_id, "lead_id")
    service_type = _require_text(service_type, "service_type")
    normalized_case_id = _require_text(case_id, "case_id") if case_id is not None else None

    payload = report.to_dict()
    if payload.get("report_type") != "expert":
        raise ValueError("expert adapter requires an expert report")

    return ExpertReportDTO(
        lead_id=lead_id,
        service_type=service_type,
        case_id=normalized_case_id,
        report=payload,
    )
