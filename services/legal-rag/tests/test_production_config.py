from __future__ import annotations

from pathlib import Path

import pytest

from src.production import ProductionSettings


def test_settings_resolve_relative_paths(tmp_path: Path):
    settings = ProductionSettings.from_env({}, base_dir=tmp_path)
    assert settings.documents_path == tmp_path / "data/normalized/documents_deduped.jsonl"
    assert settings.chunks_path == tmp_path / "data/normalized/chunks.jsonl"
    assert settings.retry_attempts == 2


def test_settings_read_secrets_without_exposing_defaults(tmp_path: Path):
    settings = ProductionSettings.from_env(
        {
            "OPENAI_API_KEY": " key ",
            "OPENAI_MODEL": " model ",
            "LEGAL_RAG_INTERNAL_TOKEN": " token ",
        },
        base_dir=tmp_path,
    )
    assert settings.openai_api_key == "key"
    assert settings.openai_model == "model"
    assert settings.internal_token == "token"


def test_retry_attempts_are_bounded(tmp_path: Path):
    with pytest.raises(ValueError, match="between 1 and 5"):
        ProductionSettings.from_env({"LEGAL_RAG_RETRY_ATTEMPTS": "6"}, base_dir=tmp_path)


def test_readiness_errors_report_missing_runtime_requirements(tmp_path: Path):
    settings = ProductionSettings.from_env({}, base_dir=tmp_path)
    errors = settings.readiness_errors()
    assert "documents dataset is missing" in errors
    assert "OPENAI_API_KEY is not configured" in errors
    assert "LEGAL_RAG_INTERNAL_TOKEN is not configured" in errors
