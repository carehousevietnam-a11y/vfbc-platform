"""Shared immutable DTOs for STEP12 service integration.

This package remains framework-neutral: it performs no HTTP, database, CRM,
Supabase, storage, PDF, or filesystem operations. It only prepares validated
payloads for the existing VFBCAI application to persist or deliver.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

ServiceGroup = Literal["check", "verify", "register"]
Audience = Literal["customer", "expert"]


def require_text(value: str, field_name: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError(f"{field_name} must not be empty")
    return normalized


@dataclass(frozen=True)
class IntegrationContext:
    lead_id: str
    service_type: str
    service_group: ServiceGroup
    case_id: str | None = None
    request_id: str | None = None

    def normalized(self) -> "IntegrationContext":
        case_id = require_text(self.case_id, "case_id") if self.case_id is not None else None
        request_id = require_text(self.request_id, "request_id") if self.request_id is not None else None
        return IntegrationContext(
            lead_id=require_text(self.lead_id, "lead_id"),
            service_type=require_text(self.service_type, "service_type"),
            service_group=self.service_group,
            case_id=case_id,
            request_id=request_id,
        )


@dataclass(frozen=True)
class DeliveryPlan:
    audience: Audience
    targets: tuple[str, ...]
    payload: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return {
            "audience": self.audience,
            "targets": list(self.targets),
            "payload": dict(self.payload),
        }


@dataclass(frozen=True)
class IntegratedReportBundle:
    workflow: ServiceGroup
    context: IntegrationContext
    deliveries: tuple[DeliveryPlan, ...] = field(default_factory=tuple)
    schema_version: str = "step12-service-integration"

    def to_dict(self) -> dict[str, Any]:
        case: dict[str, Any] = {
            "lead_id": self.context.lead_id,
            "service_type": self.context.service_type,
            "service_group": self.context.service_group,
        }
        if self.context.case_id is not None:
            case["case_id"] = self.context.case_id
        if self.context.request_id is not None:
            case["request_id"] = self.context.request_id
        return {
            "schema_version": self.schema_version,
            "workflow": self.workflow,
            "case": case,
            "deliveries": [delivery.to_dict() for delivery in self.deliveries],
        }
