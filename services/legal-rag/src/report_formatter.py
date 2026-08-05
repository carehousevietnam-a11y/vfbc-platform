"""Deterministic Unicode JSON formatter for STEP10 report contracts."""

from __future__ import annotations

import json
from typing import Any, Protocol


class ReportOutput(Protocol):
    def to_dict(self) -> dict[str, Any]: ...


def format_report(result: ReportOutput, *, pretty: bool = False) -> str:
    return json.dumps(
        result.to_dict(),
        ensure_ascii=False,
        indent=2 if pretty else None,
        separators=None if pretty else (",", ":"),
    )
