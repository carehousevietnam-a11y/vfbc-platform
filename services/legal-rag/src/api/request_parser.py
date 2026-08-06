"""Strict JSON request parsing for the Legal RAG API boundary."""

from __future__ import annotations

from typing import Any

from .models import ParsedApiRequest

_ALLOWED_GROUPS = {"check", "verify", "register"}
_ALLOWED_AUDIENCES = {"all", "customer", "expert"}


def _required_text(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} must be a non-empty string")
    return value.strip()


def _optional_text(value: Any, field_name: str) -> str | None:
    if value is None:
        return None
    return _required_text(value, field_name)


def parse_api_request(payload: Any) -> ParsedApiRequest:
    if not isinstance(payload, dict):
        raise ValueError("request body must be a JSON object")

    context = payload.get("context")
    if not isinstance(context, dict):
        raise ValueError("context must be a JSON object")

    question = _required_text(payload.get("question"), "question")
    language = _optional_text(payload.get("language"), "language")
    lead_id = _required_text(context.get("lead_id"), "context.lead_id")
    service_type = _required_text(context.get("service_type"), "context.service_type")
    service_group = _required_text(context.get("service_group"), "context.service_group").lower()
    if service_group not in _ALLOWED_GROUPS:
        raise ValueError("context.service_group must be check, verify, or register")

    case_id = _optional_text(context.get("case_id"), "context.case_id")
    request_id = _optional_text(context.get("request_id"), "context.request_id")

    limit = payload.get("limit", 20)
    if isinstance(limit, bool) or not isinstance(limit, int) or limit < 1 or limit > 100:
        raise ValueError("limit must be an integer between 1 and 100")

    audience = payload.get("audience", "all")
    if not isinstance(audience, str) or audience.lower() not in _ALLOWED_AUDIENCES:
        raise ValueError("audience must be all, customer, or expert")

    return ParsedApiRequest(
        question=question,
        language=language,
        lead_id=lead_id,
        service_type=service_type,
        service_group=service_group,
        case_id=case_id,
        request_id=request_id,
        limit=limit,
        audience=audience.lower(),
    )
