"""STEP15 production application boundary.

This is still framework-neutral. It can be called from a Next.js server-side
proxy, FastAPI/ASGI adapter, container worker, or an internal RPC bridge.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Mapping

from ..api import ApiResponse, LegalRAGApi
from ..runtime import LegalRAGService
from .config import ProductionSettings
from .index_loader import LoadedSearchIndex, load_production_index
from .observability import ProductionEventLogger
from .retry import RetryingLegalRAGService

PRODUCTION_SCHEMA_VERSION = "step15-production"


@dataclass
class ProductionLegalRAGApp:
    settings: ProductionSettings
    loaded_index: LoadedSearchIndex
    api: LegalRAGApi
    events: ProductionEventLogger

    @classmethod
    def create(
        cls,
        settings: ProductionSettings,
        *,
        review_engine: Any | None = None,
        event_logger: ProductionEventLogger | None = None,
        sleeper: Any | None = None,
    ) -> "ProductionLegalRAGApp":
        events = event_logger or ProductionEventLogger()
        loaded = load_production_index(settings)
        base_service = LegalRAGService(
            loaded.index,
            review_engine,
            translation_model=settings.translation_model,
        )

        retry_kwargs: dict[str, Any] = {}
        if sleeper is not None:
            retry_kwargs["sleeper"] = sleeper
        service = RetryingLegalRAGService(
            base_service,
            attempts=settings.retry_attempts,
            delay_seconds=settings.retry_delay_seconds,
            on_retry=lambda attempt, reason: events.emit(
                "legal_rag.retry", attempt=attempt, reason=reason
            ),
            **retry_kwargs,
        )
        api = LegalRAGApi(
            service,
            internal_token=settings.internal_token,
            openai_api_key=settings.openai_api_key,
            model=settings.openai_model,
            translation_model=settings.translation_model,
        )
        return cls(settings=settings, loaded_index=loaded, api=api, events=events)

    def health(self) -> ApiResponse:
        return ApiResponse(
            200,
            {
                "ok": True,
                "schema_version": PRODUCTION_SCHEMA_VERSION,
                "service": "vfbcai-legal-rag",
            },
        )

    def readiness(self) -> ApiResponse:
        errors = self.settings.readiness_errors()
        if self.loaded_index.document_count == 0:
            errors.append("legal document index is empty")
        if self.loaded_index.chunk_count == 0:
            errors.append("legal chunk index is empty")
        body = {
            "ok": not errors,
            "schema_version": PRODUCTION_SCHEMA_VERSION,
            "service": "vfbcai-legal-rag",
            "index": {
                "documents": self.loaded_index.document_count,
                "chunks": self.loaded_index.chunk_count,
                "relations": self.loaded_index.relation_count,
            },
        }
        if errors:
            body["errors"] = errors
            return ApiResponse(503, body)
        return ApiResponse(200, body)

    def review(
        self,
        payload: Any,
        *,
        headers: Mapping[str, str] | None = None,
        client: Any | None = None,
    ) -> ApiResponse:
        context = payload.get("context", {}) if isinstance(payload, dict) else {}
        self.events.emit(
            "legal_rag.request.started",
            request_id=context.get("request_id") if isinstance(context, dict) else None,
            lead_id=context.get("lead_id") if isinstance(context, dict) else None,
            service_group=context.get("service_group") if isinstance(context, dict) else None,
        )
        response = self.api.review(payload, headers=headers, client=client)
        if response.status_code == 200 and isinstance(response.body, dict):
            metadata = response.body.get("metadata") or {}
            self.events.emit(
                "legal_rag.translation",
                skipped=metadata.get("translation_skipped"),
                duration_ms=metadata.get("translation_duration_ms"),
                term_count=len(metadata.get("translation_terms") or []),
                error=metadata.get("translation_error"),
            )
            self.events.emit(
                "legal_rag.answer",
                answer_tier=metadata.get("answer_tier"),
                search_stage=metadata.get("search_stage"),
                top_search_score=metadata.get("top_search_score"),
            )
        self.events.emit(
            "legal_rag.request.completed",
            request_id=context.get("request_id") if isinstance(context, dict) else None,
            status_code=response.status_code,
            ok=response.body.get("ok"),
        )
        return response

    def handle_http(
        self,
        *,
        method: str,
        path: str,
        body: Any = None,
        headers: Mapping[str, str] | None = None,
        client: Any | None = None,
    ) -> ApiResponse:
        method = method.upper().strip()
        normalized_path = "/" + path.strip().strip("/")
        if normalized_path == "/health":
            if method != "GET":
                return self._method_not_allowed("GET")
            return self.health()
        if normalized_path == "/ready":
            if method != "GET":
                return self._method_not_allowed("GET")
            return self.readiness()
        if normalized_path == "/review":
            if method != "POST":
                return self._method_not_allowed("POST")
            payload = body
            if isinstance(body, (str, bytes, bytearray)):
                try:
                    payload = json.loads(body)
                except (json.JSONDecodeError, UnicodeDecodeError):
                    return ApiResponse(
                        400,
                        {
                            "ok": False,
                            "schema_version": PRODUCTION_SCHEMA_VERSION,
                            "error": {"code": "invalid_json", "message": "Request body is not valid JSON"},
                        },
                    )
            return self.review(payload, headers=headers, client=client)
        return ApiResponse(
            404,
            {
                "ok": False,
                "schema_version": PRODUCTION_SCHEMA_VERSION,
                "error": {"code": "not_found", "message": "Endpoint not found"},
            },
        )

    @staticmethod
    def _method_not_allowed(allowed: str) -> ApiResponse:
        return ApiResponse(
            405,
            {
                "ok": False,
                "schema_version": PRODUCTION_SCHEMA_VERSION,
                "error": {"code": "method_not_allowed", "message": f"Use {allowed}"},
            },
            headers={
                "content-type": "application/json; charset=utf-8",
                "allow": allowed,
            },
        )
