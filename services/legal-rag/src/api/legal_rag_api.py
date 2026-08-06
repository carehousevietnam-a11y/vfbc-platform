"""STEP14 API boundary for VFBCAI web, CRM, MyPage, Admin, and PDF callers.

The class is HTTP-framework neutral. A Next.js route, FastAPI endpoint, worker,
or internal RPC layer can translate its ApiResponse into the framework response.
"""

from __future__ import annotations

import hmac
from typing import Any, Mapping

from ..integration import IntegrationContext
from ..runtime import LegalRAGRequest, LegalRAGService
from .models import ApiResponse, ParsedApiRequest
from .request_parser import parse_api_request

API_SCHEMA_VERSION = "step14-api"


class LegalRAGApi:
    def __init__(
        self,
        service: LegalRAGService,
        *,
        internal_token: str | None = None,
        openai_api_key: str | None = None,
        model: str | None = None,
    ) -> None:
        self._service = service
        self._internal_token = internal_token
        self._openai_api_key = openai_api_key
        self._model = model

    def health(self) -> ApiResponse:
        return ApiResponse(
            200,
            {
                "ok": True,
                "schema_version": API_SCHEMA_VERSION,
                "service": "vfbcai-legal-rag",
            },
        )

    def review(
        self,
        payload: Any,
        *,
        headers: Mapping[str, str] | None = None,
        client: Any | None = None,
    ) -> ApiResponse:
        if not self._authorized(headers or {}):
            return self._error(401, "unauthorized", "Invalid or missing internal API token")

        try:
            parsed = parse_api_request(payload)
            runtime_request = self._to_runtime_request(parsed)
            result = self._service.run(
                runtime_request,
                api_key=self._openai_api_key,
                model=self._model,
                client=client,
            )
            return ApiResponse(200, self._select_payload(result.to_dict(), parsed.audience))
        except ValueError as exc:
            return self._error(400, "invalid_request", str(exc))
        except Exception:
            # Do not expose SDK credentials, prompts, stack traces, or evidence internals.
            return self._error(500, "internal_error", "Legal review could not be completed")

    def _authorized(self, headers: Mapping[str, str]) -> bool:
        if self._internal_token is None:
            return True
        supplied = ""
        for key, value in headers.items():
            if key.lower() == "x-vfbcai-internal-token":
                supplied = value
                break
        return hmac.compare_digest(supplied, self._internal_token)

    @staticmethod
    def _to_runtime_request(parsed: ParsedApiRequest) -> LegalRAGRequest:
        return LegalRAGRequest(
            question=parsed.question,
            language=parsed.language,
            limit=parsed.limit,
            context=IntegrationContext(
                lead_id=parsed.lead_id,
                service_type=parsed.service_type,
                service_group=parsed.service_group,  # validated by parser
                case_id=parsed.case_id,
                request_id=parsed.request_id,
            ),
        )

    @staticmethod
    def _select_payload(runtime: dict[str, Any], audience: str) -> dict[str, Any]:
        base = {
            "ok": True,
            "schema_version": API_SCHEMA_VERSION,
            "request": runtime["request"],
            "review": runtime["review"],
            "citations": runtime["citations"],
            "confidence": runtime["confidence"],
            "metadata": runtime["metadata"],
        }
        if audience in {"all", "customer"}:
            base["customer"] = {
                "review": runtime["customer_review"],
                "report": runtime["customer_report"],
                "deliveries": [
                    item
                    for item in runtime["integration"]["deliveries"]
                    if item["audience"] == "customer"
                ],
            }
        if audience in {"all", "expert"}:
            base["expert"] = {
                "review": runtime["expert_review"],
                "report": runtime["expert_report"],
                "evidence": runtime["evidence"],
                "search": runtime["search"],
                "deliveries": [
                    item
                    for item in runtime["integration"]["deliveries"]
                    if item["audience"] == "expert"
                ],
            }
        return base

    @staticmethod
    def _error(status_code: int, code: str, message: str) -> ApiResponse:
        return ApiResponse(
            status_code,
            {
                "ok": False,
                "schema_version": API_SCHEMA_VERSION,
                "error": {"code": code, "message": message},
            },
        )
