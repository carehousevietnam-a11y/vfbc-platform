"""Gunicorn WSGI entrypoint for production deployments."""

from __future__ import annotations

import os
from pathlib import Path

from src.transport.server import create_wsgi_application, load_env_file

# Docker/env_file injects variables directly; load .env only when present locally.
load_env_file(Path(__file__).resolve().parent / ".env", environ=os.environ)

application = create_wsgi_application(base_dir=Path(__file__).resolve().parent)
