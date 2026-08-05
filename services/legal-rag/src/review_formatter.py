"""VFBCAI Legal Intelligence Platform — Review Formatter (STEP6).

``ReviewResult``를 API/PDF 단계에서 사용할 수 있는 결정적 JSON 형태로
직렬화한다. 법률 내용의 생성, 번역 또는 요약은 수행하지 않는다.
"""

from __future__ import annotations

import json
from typing import Any

from .ai_review_engine import ReviewResult


def format_review_dict(result: ReviewResult) -> dict[str, Any]:
    """최종 Review JSON 계약과 동일한 dict를 반환한다."""
    return result.to_dict()


def format_review_json(
    result: ReviewResult,
    *,
    ensure_ascii: bool = False,
    indent: int | None = None,
) -> str:
    """한국어/영어/중국어/베트남어를 보존하여 JSON 문자열로 직렬화한다."""
    return json.dumps(
        format_review_dict(result),
        ensure_ascii=ensure_ascii,
        indent=indent,
        separators=None if indent is not None else (",", ":"),
    )
