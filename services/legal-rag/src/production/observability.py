"""Minimal structured observability with deliberate sensitive-data exclusion."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Callable


EventSink = Callable[[str, dict[str, Any]], None]


@dataclass
class ProductionEventLogger:
    sink: EventSink | None = None
    logger: logging.Logger = logging.getLogger("legal_rag.production")

    def emit(self, event: str, **fields: Any) -> None:
        safe = {
            key: value
            for key, value in fields.items()
            if key not in {"question", "payload", "prompt", "api_key", "token", "evidence"}
        }
        if self.sink is not None:
            self.sink(event, dict(safe))
        self.logger.info("%s %s", event, safe)
