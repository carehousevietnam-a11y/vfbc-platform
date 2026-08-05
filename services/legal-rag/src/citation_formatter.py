"""VFBCAI Legal Intelligence Platform — Citation Formatter (STEP7)."""

from __future__ import annotations

import json
from typing import Any

from .citation_engine import CitationResult


def format_citation_dict(result: CitationResult) -> dict[str, Any]:
    """CitationResult를 안정적인 API/PDF용 dict로 변환한다."""
    return result.to_dict()


def format_citation_json(
    result: CitationResult,
    *,
    ensure_ascii: bool = False,
    indent: int | None = None,
) -> str:
    """4개 지원 언어의 Unicode를 보존해 JSON 문자열로 직렬화한다."""
    return json.dumps(
        format_citation_dict(result),
        ensure_ascii=ensure_ascii,
        indent=indent,
        separators=None if indent is not None else (",", ":"),
    )
