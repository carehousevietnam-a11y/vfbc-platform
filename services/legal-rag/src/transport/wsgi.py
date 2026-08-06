"""WSGI transport for the production Legal RAG application.

The adapter contains no framework dependency and can run behind IIS, nginx,
Apache, gunicorn, or Python's standard-library WSGI server.  It translates a
WSGI request into the stable STEP15 ``ProductionLegalRAGApp`` contract.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from http import HTTPStatus
from typing import Any, Callable, Iterable, Mapping
from uuid import uuid4

from ..api import ApiResponse
from ..production import ProductionLegalRAGApp

StartResponse = Callable[[str, list[tuple[str, str]]], Any]


@dataclass(frozen=True)
class WSGITransportSettings:
    max_body_bytes: int = 1_048_576
    allow_origin: str | None = None

    def __post_init__(self) -> None:
        if self.max_body_bytes < 1 or self.max_body_bytes > 10_485_760:
            raise ValueError("max_body_bytes must be between 1 and 10485760")
        if self.allow_origin is not None and not self.allow_origin.strip():
            raise ValueError("allow_origin must be non-empty when configured")


class LegalRAGWSGIApp:
    def __init__(
        self,
        app: ProductionLegalRAGApp,
        *,
        settings: WSGITransportSettings | None = None,
    ) -> None:
        self._app = app
        self._settings = settings or WSGITransportSettings()

    def __call__(self, environ: Mapping[str, Any], start_response: StartResponse) -> Iterable[bytes]:
        request_id = self._request_id(environ)
        try:
            response = self._dispatch(environ)
        except Exception:
            response = ApiResponse(
                500,
                {
                    "ok": False,
                    "schema_version": "step16-wsgi",
                    "error": {
                        "code": "transport_error",
                        "message": "Request could not be processed",
                    },
                },
            )
        payload = json.dumps(response.body, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        headers = {key.lower(): value for key, value in response.headers.items()}
        headers.setdefault("content-type", "application/json; charset=utf-8")
        headers["content-length"] = str(len(payload))
        headers["x-request-id"] = request_id
        headers["cache-control"] = "no-store"
        self._apply_cors(headers)
        status = f"{response.status_code} {self._reason(response.status_code)}"
        start_response(status, [(self._canonical_header(k), v) for k, v in headers.items()])
        return [payload]

    def _dispatch(self, environ: Mapping[str, Any]) -> ApiResponse:
        method = str(environ.get("REQUEST_METHOD") or "GET").upper()
        path = str(environ.get("PATH_INFO") or "/")
        if method == "OPTIONS":
            return self._options(path)

        headers = self._extract_headers(environ)
        body: Any = None
        if method in {"POST", "PUT", "PATCH"}:
            content_type = headers.get("content-type", "").split(";", 1)[0].strip().lower()
            if content_type != "application/json":
                return ApiResponse(
                    415,
                    {
                        "ok": False,
                        "schema_version": "step16-wsgi",
                        "error": {
                            "code": "unsupported_media_type",
                            "message": "Use application/json",
                        },
                    },
                )
            raw = self._read_body(environ)
            if isinstance(raw, ApiResponse):
                return raw
            body = raw
        return self._app.handle_http(method=method, path=path, body=body, headers=headers)

    def _read_body(self, environ: Mapping[str, Any]) -> bytes | ApiResponse:
        raw_length = str(environ.get("CONTENT_LENGTH") or "").strip()
        if raw_length:
            try:
                length = int(raw_length)
            except ValueError:
                return self._bad_request("invalid_content_length", "Content-Length is invalid")
            if length < 0:
                return self._bad_request("invalid_content_length", "Content-Length is invalid")
            if length > self._settings.max_body_bytes:
                return ApiResponse(
                    413,
                    {
                        "ok": False,
                        "schema_version": "step16-wsgi",
                        "error": {"code": "payload_too_large", "message": "Request body is too large"},
                    },
                )
        else:
            length = self._settings.max_body_bytes + 1

        stream = environ.get("wsgi.input")
        if stream is None:
            return b""
        data = stream.read(min(length, self._settings.max_body_bytes + 1))
        if len(data) > self._settings.max_body_bytes:
            return ApiResponse(
                413,
                {
                    "ok": False,
                    "schema_version": "step16-wsgi",
                    "error": {"code": "payload_too_large", "message": "Request body is too large"},
                },
            )
        return data

    def _options(self, path: str) -> ApiResponse:
        allowed = {
            "/health": "GET, OPTIONS",
            "/ready": "GET, OPTIONS",
            "/review": "POST, OPTIONS",
        }.get("/" + path.strip().strip("/"))
        if allowed is None:
            return ApiResponse(
                404,
                {
                    "ok": False,
                    "schema_version": "step16-wsgi",
                    "error": {"code": "not_found", "message": "Endpoint not found"},
                },
            )
        return ApiResponse(204, {}, headers={"allow": allowed})

    def _apply_cors(self, headers: dict[str, str]) -> None:
        if self._settings.allow_origin is None:
            return
        headers["access-control-allow-origin"] = self._settings.allow_origin
        headers["access-control-allow-headers"] = "Content-Type, X-VFBCAI-Internal-Token, X-Request-ID"
        headers["access-control-allow-methods"] = "GET, POST, OPTIONS"
        headers["vary"] = "Origin"

    @staticmethod
    def _extract_headers(environ: Mapping[str, Any]) -> dict[str, str]:
        headers: dict[str, str] = {}
        for key, value in environ.items():
            if key.startswith("HTTP_"):
                name = key[5:].replace("_", "-").lower()
                headers[name] = str(value)
        if environ.get("CONTENT_TYPE"):
            headers["content-type"] = str(environ["CONTENT_TYPE"])
        if environ.get("CONTENT_LENGTH"):
            headers["content-length"] = str(environ["CONTENT_LENGTH"])
        return headers

    @staticmethod
    def _request_id(environ: Mapping[str, Any]) -> str:
        supplied = str(environ.get("HTTP_X_REQUEST_ID") or "").strip()
        return supplied[:128] if supplied else str(uuid4())

    @staticmethod
    def _bad_request(code: str, message: str) -> ApiResponse:
        return ApiResponse(
            400,
            {
                "ok": False,
                "schema_version": "step16-wsgi",
                "error": {"code": code, "message": message},
            },
        )

    @staticmethod
    def _canonical_header(name: str) -> str:
        return "-".join(part.capitalize() for part in name.split("-"))

    @staticmethod
    def _reason(status_code: int) -> str:
        try:
            return HTTPStatus(status_code).phrase
        except ValueError:
            return "Unknown"
