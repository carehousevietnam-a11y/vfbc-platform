from __future__ import annotations

import pytest

from src.transport import ServerSettings, create_wsgi_application


class StubProductionApp:
    def handle_http(self, **kwargs):
        raise AssertionError("not called")


def test_server_settings_defaults_are_private_and_safe():
    settings = ServerSettings.from_env({})
    assert settings.host == "127.0.0.1"
    assert settings.port == 8080
    assert settings.max_body_bytes == 1_048_576
    assert settings.allow_origin is None


def test_server_settings_read_explicit_values():
    settings = ServerSettings.from_env(
        {
            "LEGAL_RAG_HOST": "0.0.0.0",
            "LEGAL_RAG_PORT": "9090",
            "LEGAL_RAG_MAX_BODY_BYTES": "2048",
            "LEGAL_RAG_ALLOW_ORIGIN": "https://vfbcai.example",
        }
    )
    assert settings.host == "0.0.0.0"
    assert settings.port == 9090
    assert settings.max_body_bytes == 2048
    assert settings.allow_origin == "https://vfbcai.example"


def test_server_settings_reject_invalid_port_and_body_limit():
    with pytest.raises(ValueError):
        ServerSettings.from_env({"LEGAL_RAG_PORT": "abc"})
    with pytest.raises(ValueError):
        ServerSettings.from_env({"LEGAL_RAG_PORT": "70000"})
    with pytest.raises(ValueError):
        ServerSettings.from_env({"LEGAL_RAG_MAX_BODY_BYTES": "0"})


def test_create_wsgi_application_accepts_injected_production_app():
    application = create_wsgi_application(
        env={"LEGAL_RAG_PORT": "8081"},
        production_app=StubProductionApp(),
    )
    assert application is not None
