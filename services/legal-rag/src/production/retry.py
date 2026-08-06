"""Bounded retry wrapper for transient AI review failures."""

from __future__ import annotations

import time
from typing import Any, Callable

from ..ai_review_models import STATUS_API_ERROR


class RetryingLegalRAGService:
    def __init__(
        self,
        service: Any,
        *,
        attempts: int,
        delay_seconds: float,
        sleeper: Callable[[float], None] = time.sleep,
        on_retry: Callable[[int, str], None] | None = None,
    ) -> None:
        self._service = service
        self._attempts = attempts
        self._delay_seconds = delay_seconds
        self._sleeper = sleeper
        self._on_retry = on_retry

    def run(self, *args: Any, **kwargs: Any) -> Any:
        last_result: Any | None = None
        last_error: Exception | None = None
        for attempt in range(1, self._attempts + 1):
            try:
                result = self._service.run(*args, **kwargs)
                last_result = result
                status = getattr(getattr(result, "review", None), "status", None)
                if status != STATUS_API_ERROR or attempt >= self._attempts:
                    return result
                reason = "review_api_error"
            except Exception as exc:  # retried, then sanitized by STEP14 API boundary
                last_error = exc
                if attempt >= self._attempts:
                    raise
                reason = type(exc).__name__

            if self._on_retry is not None:
                self._on_retry(attempt, reason)
            if self._delay_seconds:
                self._sleeper(self._delay_seconds)

        if last_error is not None:
            raise last_error
        return last_result
