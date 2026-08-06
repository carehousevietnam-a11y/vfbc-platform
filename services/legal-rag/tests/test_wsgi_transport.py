from __future__ import annotations

import io
import json

import pytest

from src.api import ApiResponse
from src.transport import LegalRAGWSGIApp, WSGITransportSettings


class StubProductionApp:
    def handle_http(self, *, method, path, body=None, headers=None, client=None):
        if path == "/health":
            return ApiResponse(200, {"ok": True, "route": "health"})
        if path == "/ready":
            return ApiResponse(503, {"ok": False, "route": "ready"})
        if path == "/review":
            return ApiResponse(200, {"ok": True, "body": json.loads(body), "token": headers.get("x-vfbcai-internal-token")})
        return ApiResponse(404, {"ok": False})


def invoke(app, *, method="GET", path="/health", body=b"", content_type=None, headers=None, content_length=None):
    captured = {}

    def start_response(status, response_headers):
        captured["status"] = status
        captured["headers"] = {key.lower(): value for key, value in response_headers}

    environ = {
        "REQUEST_METHOD": method,
        "PATH_INFO": path,
        "wsgi.input": io.BytesIO(body),
    }
    if content_type is not None:
        environ["CONTENT_TYPE"] = content_type
    if content_length is not None:
        environ["CONTENT_LENGTH"] = str(content_length)
    elif body:
        environ["CONTENT_LENGTH"] = str(len(body))
    for key, value in (headers or {}).items():
        environ["HTTP_" + key.upper().replace("-", "_")] = value
    payload = b"".join(app(environ, start_response))
    captured["body"] = json.loads(payload.decode("utf-8")) if payload else None
    return captured


def test_get_health_translates_wsgi_request_and_response():
    result = invoke(LegalRAGWSGIApp(StubProductionApp()))
    assert result["status"] == "200 OK"
    assert result["body"] == {"ok": True, "route": "health"}
    assert result["headers"]["content-type"].startswith("application/json")
    assert result["headers"]["cache-control"] == "no-store"


def test_ready_preserves_non_200_status():
    result = invoke(LegalRAGWSGIApp(StubProductionApp()), path="/ready")
    assert result["status"] == "503 Service Unavailable"


def test_review_requires_json_content_type():
    result = invoke(LegalRAGWSGIApp(StubProductionApp()), method="POST", path="/review", body=b"{}")
    assert result["status"] == "415 Unsupported Media Type"
    assert result["body"]["error"]["code"] == "unsupported_media_type"


def test_review_forwards_body_and_internal_token():
    body = json.dumps({"question": "노동허가"}, ensure_ascii=False).encode("utf-8")
    result = invoke(
        LegalRAGWSGIApp(StubProductionApp()),
        method="POST",
        path="/review",
        body=body,
        content_type="application/json; charset=utf-8",
        headers={"X-VFBCAI-Internal-Token": "secret"},
    )
    assert result["status"] == "200 OK"
    assert result["body"]["body"]["question"] == "노동허가"
    assert result["body"]["token"] == "secret"


def test_payload_larger_than_limit_is_rejected_before_reading_all():
    app = LegalRAGWSGIApp(StubProductionApp(), settings=WSGITransportSettings(max_body_bytes=4))
    result = invoke(app, method="POST", path="/review", body=b"12345", content_type="application/json")
    assert result["status"].startswith("413 ")
    assert result["body"]["error"]["code"] == "payload_too_large"


def test_invalid_content_length_is_rejected():
    app = LegalRAGWSGIApp(StubProductionApp())
    result = invoke(app, method="POST", path="/review", body=b"{}", content_type="application/json", content_length="abc")
    assert result["status"] == "400 Bad Request"
    assert result["body"]["error"]["code"] == "invalid_content_length"


def test_request_id_is_preserved_when_supplied():
    result = invoke(LegalRAGWSGIApp(StubProductionApp()), headers={"X-Request-ID": "req-123"})
    assert result["headers"]["x-request-id"] == "req-123"


def test_request_id_is_generated_when_missing():
    result = invoke(LegalRAGWSGIApp(StubProductionApp()))
    assert len(result["headers"]["x-request-id"]) >= 32


def test_options_returns_allowed_methods_and_cors_headers():
    app = LegalRAGWSGIApp(
        StubProductionApp(),
        settings=WSGITransportSettings(allow_origin="https://vfbcai.example"),
    )
    result = invoke(app, method="OPTIONS", path="/review")
    assert result["status"] == "204 No Content"
    assert result["headers"]["allow"] == "POST, OPTIONS"
    assert result["headers"]["access-control-allow-origin"] == "https://vfbcai.example"
    assert result["headers"]["vary"] == "Origin"


def test_options_unknown_route_returns_404():
    result = invoke(LegalRAGWSGIApp(StubProductionApp()), method="OPTIONS", path="/missing")
    assert result["status"] == "404 Not Found"


def test_transport_hides_unexpected_exception():
    class BrokenApp:
        def handle_http(self, **kwargs):
            raise RuntimeError("secret stack trace")

    result = invoke(LegalRAGWSGIApp(BrokenApp()))
    assert result["status"] == "500 Internal Server Error"
    assert result["body"]["error"]["code"] == "transport_error"
    assert "secret" not in json.dumps(result["body"])


def test_transport_settings_validate_body_limit():
    with pytest.raises(ValueError):
        WSGITransportSettings(max_body_bytes=0)
    with pytest.raises(ValueError):
        WSGITransportSettings(max_body_bytes=10_485_761)
