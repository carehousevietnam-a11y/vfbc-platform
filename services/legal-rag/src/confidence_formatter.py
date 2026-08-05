"""STEP8 ConfidenceResult JSON formatter."""

from __future__ import annotations

import json

from .confidence_engine import ConfidenceResult


def confidence_to_dict(result: ConfidenceResult) -> dict:
    return result.to_dict()


def confidence_to_json(
    result: ConfidenceResult,
    *,
    ensure_ascii: bool = False,
    indent: int | None = 2,
) -> str:
    return json.dumps(result.to_dict(), ensure_ascii=ensure_ascii, indent=indent)
