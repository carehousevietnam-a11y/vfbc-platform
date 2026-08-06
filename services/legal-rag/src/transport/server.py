"""Standard-library server entrypoint for STEP16.

Production deployments may replace ``wsgiref`` with gunicorn or another WSGI
host without changing the transport application.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Mapping, MutableMapping
from wsgiref.simple_server import WSGIServer, make_server

from ..production import ProductionLegalRAGApp, ProductionSettings
from .wsgi import LegalRAGWSGIApp, WSGITransportSettings


def load_env_file(
    path: Path,
    *,
    environ: MutableMapping[str, str] | None = None,
    override: bool = False,
) -> bool:
    """Load simple KEY=VALUE pairs from ``path`` into the process environment.

    This intentionally uses only the Python standard library so STEP16 does not
    require ``python-dotenv``. Existing process environment values take
    precedence unless ``override`` is explicitly enabled.
    """

    target = environ if environ is not None else os.environ
    if not path.is_file():
        return False

    for line_number, raw_line in enumerate(
        path.read_text(encoding="utf-8-sig").splitlines(),
        start=1,
    ):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        if line.startswith("export "):
            line = line[7:].lstrip()

        if "=" not in line:
            raise ValueError(
                f"Invalid environment entry at {path}:{line_number}: expected KEY=VALUE"
            )

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if not key or not key.replace("_", "").isalnum() or key[0].isdigit():
            raise ValueError(
                f"Invalid environment variable name at {path}:{line_number}"
            )

        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]

        if override or key not in target:
            target[key] = value

    return True


@dataclass(frozen=True)
class ServerSettings:
    host: str = "127.0.0.1"
    port: int = 8080
    max_body_bytes: int = 1_048_576
    allow_origin: str | None = None

    @classmethod
    def from_env(cls, env: Mapping[str, str]) -> "ServerSettings":
        host = (env.get("LEGAL_RAG_HOST") or "127.0.0.1").strip()
        if not host:
            raise ValueError("LEGAL_RAG_HOST must be non-empty")
        try:
            port = int((env.get("LEGAL_RAG_PORT") or "8080").strip())
        except ValueError as exc:
            raise ValueError("LEGAL_RAG_PORT must be an integer") from exc
        if port < 1 or port > 65535:
            raise ValueError("LEGAL_RAG_PORT must be between 1 and 65535")
        try:
            max_body = int((env.get("LEGAL_RAG_MAX_BODY_BYTES") or "1048576").strip())
        except ValueError as exc:
            raise ValueError("LEGAL_RAG_MAX_BODY_BYTES must be an integer") from exc
        allow_origin = (env.get("LEGAL_RAG_ALLOW_ORIGIN") or "").strip() or None
        transport = WSGITransportSettings(max_body_bytes=max_body, allow_origin=allow_origin)
        return cls(host=host, port=port, max_body_bytes=transport.max_body_bytes, allow_origin=allow_origin)


def create_wsgi_application(
    *,
    env: Mapping[str, str] | None = None,
    base_dir: Path | None = None,
    production_app: ProductionLegalRAGApp | None = None,
) -> LegalRAGWSGIApp:
    values = env or os.environ
    server_settings = ServerSettings.from_env(values)
    app = production_app
    if app is None:
        production_settings = ProductionSettings.from_env(values, base_dir=base_dir)
        app = ProductionLegalRAGApp.create(production_settings)
    return LegalRAGWSGIApp(
        app,
        settings=WSGITransportSettings(
            max_body_bytes=server_settings.max_body_bytes,
            allow_origin=server_settings.allow_origin,
        ),
    )


def create_server(
    application: LegalRAGWSGIApp,
    settings: ServerSettings,
) -> WSGIServer:
    return make_server(settings.host, settings.port, application)


def main() -> None:
    base_dir = Path.cwd()
    load_env_file(base_dir / ".env")

    settings = ServerSettings.from_env(os.environ)
    application = create_wsgi_application(env=os.environ, base_dir=base_dir)
    server = create_server(application, settings)
    print(f"VFBCAI Legal RAG listening on http://{settings.host}:{settings.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
