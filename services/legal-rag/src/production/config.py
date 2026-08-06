"""Production configuration for the VFBCAI Legal RAG service.

The module is intentionally dependency-free and reads from an injected mapping
so tests and hosting adapters do not need to mutate process-wide environment.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Mapping


@dataclass(frozen=True)
class ProductionSettings:
    documents_path: Path
    chunks_path: Path
    relationships_path: Path | None
    openai_api_key: str | None
    openai_model: str | None
    internal_token: str | None
    retry_attempts: int = 2
    retry_delay_seconds: float = 0.25
    log_level: str = "INFO"

    @classmethod
    def from_env(
        cls,
        env: Mapping[str, str],
        *,
        base_dir: Path | None = None,
    ) -> "ProductionSettings":
        root = Path(base_dir or ".").resolve()

        def path_value(name: str, default: str) -> Path:
            raw = (env.get(name) or default).strip()
            value = Path(raw)
            return value if value.is_absolute() else root / value

        relationships_raw = (env.get("LEGAL_RAG_RELATIONSHIPS_PATH") or "data/normalized/internal_relations.jsonl").strip()
        relationships = Path(relationships_raw)
        if not relationships.is_absolute():
            relationships = root / relationships

        attempts_raw = (env.get("LEGAL_RAG_RETRY_ATTEMPTS") or "2").strip()
        delay_raw = (env.get("LEGAL_RAG_RETRY_DELAY_SECONDS") or "0.25").strip()
        try:
            attempts = int(attempts_raw)
        except ValueError as exc:
            raise ValueError("LEGAL_RAG_RETRY_ATTEMPTS must be an integer") from exc
        try:
            delay = float(delay_raw)
        except ValueError as exc:
            raise ValueError("LEGAL_RAG_RETRY_DELAY_SECONDS must be numeric") from exc
        if attempts < 1 or attempts > 5:
            raise ValueError("LEGAL_RAG_RETRY_ATTEMPTS must be between 1 and 5")
        if delay < 0 or delay > 30:
            raise ValueError("LEGAL_RAG_RETRY_DELAY_SECONDS must be between 0 and 30")

        log_level = (env.get("LEGAL_RAG_LOG_LEVEL") or "INFO").strip().upper()
        if log_level not in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
            raise ValueError("LEGAL_RAG_LOG_LEVEL is invalid")

        return cls(
            documents_path=path_value("LEGAL_RAG_DOCUMENTS_PATH", "data/normalized/documents_deduped.jsonl"),
            chunks_path=path_value("LEGAL_RAG_CHUNKS_PATH", "data/normalized/chunks.jsonl"),
            relationships_path=relationships,
            openai_api_key=(env.get("OPENAI_API_KEY") or "").strip() or None,
            openai_model=(env.get("OPENAI_MODEL") or "").strip() or None,
            internal_token=(env.get("LEGAL_RAG_INTERNAL_TOKEN") or "").strip() or None,
            retry_attempts=attempts,
            retry_delay_seconds=delay,
            log_level=log_level,
        )

    def readiness_errors(self) -> list[str]:
        errors: list[str] = []
        if not self.documents_path.is_file():
            errors.append("documents dataset is missing")
        if not self.chunks_path.is_file():
            errors.append("chunks dataset is missing")
        if self.relationships_path is not None and not self.relationships_path.is_file():
            errors.append("relationships dataset is missing")
        if not self.openai_api_key:
            errors.append("OPENAI_API_KEY is not configured")
        if not self.openai_model:
            errors.append("OPENAI_MODEL is not configured")
        if not self.internal_token:
            errors.append("LEGAL_RAG_INTERNAL_TOKEN is not configured")
        return errors
