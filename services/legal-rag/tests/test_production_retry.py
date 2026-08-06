from __future__ import annotations

from dataclasses import dataclass

import pytest

from src.ai_review_models import STATUS_API_ERROR, STATUS_SUCCESS
from src.production import RetryingLegalRAGService


@dataclass
class Review:
    status: str


@dataclass
class Result:
    review: Review


def test_retry_service_retries_transient_review_status():
    class Service:
        calls = 0
        def run(self):
            self.calls += 1
            return Result(Review(STATUS_API_ERROR if self.calls == 1 else STATUS_SUCCESS))

    service = Service()
    retries = []
    wrapper = RetryingLegalRAGService(
        service, attempts=2, delay_seconds=0, on_retry=lambda attempt, reason: retries.append((attempt, reason))
    )
    result = wrapper.run()
    assert result.review.status == STATUS_SUCCESS
    assert service.calls == 2
    assert retries == [(1, "review_api_error")]


def test_retry_service_retries_exception_then_succeeds():
    class Service:
        calls = 0
        def run(self):
            self.calls += 1
            if self.calls == 1:
                raise RuntimeError("temporary")
            return "ok"

    wrapper = RetryingLegalRAGService(Service(), attempts=2, delay_seconds=0)
    assert wrapper.run() == "ok"


def test_retry_service_raises_final_exception():
    class Service:
        def run(self):
            raise RuntimeError("still broken")

    wrapper = RetryingLegalRAGService(Service(), attempts=2, delay_seconds=0)
    with pytest.raises(RuntimeError, match="still broken"):
        wrapper.run()
