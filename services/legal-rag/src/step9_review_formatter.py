"""STEP9 고객용/전문가용 Review JSON formatter."""

from __future__ import annotations

import json
from typing import Any, Protocol


class ReviewOutput(Protocol):
    def to_dict(self) -> dict[str, Any]: ...


def format_step9_review(
    result: ReviewOutput,
    *,
    pretty: bool = False,
) -> str:
    """Unicode를 보존하는 결정적 JSON 문자열을 반환한다."""
    return json.dumps(
        result.to_dict(),
        ensure_ascii=False,
        indent=2 if pretty else None,
        separators=None if pretty else (",", ":"),
    )
