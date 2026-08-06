"""Stable HTTP-neutral DTOs for STEP14 VFBCAI API integration."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

AudienceSelection = Literal["all", "customer", "expert"]


@dataclass(frozen=True)
class ApiResponse:
    status_code: int
    body: dict[str, Any]
    headers: dict[str, str] = field(default_factory=lambda: {"content-type": "application/json; charset=utf-8"})


@dataclass(frozen=True)
class ParsedApiRequest:
    question: str
    language: str | None
    lead_id: str
    service_type: str
    service_group: str
    case_id: str | None
    request_id: str | None
    limit: int
    audience: AudienceSelection
