from __future__ import annotations

import pytest

from src.integration import IntegrationContext
from src.runtime import LegalRAGRequest, RUNTIME_SCHEMA_VERSION


def test_runtime_schema_version():
    assert RUNTIME_SCHEMA_VERSION == "step13-runtime"


def test_request_normalized_preserves_language():
    request = LegalRAGRequest("  work permit  ", "en", IntegrationContext("lead", "wp", "check"))
    normalized = request.normalized()
    assert normalized.question == "work permit"
    assert normalized.language == "en"


def test_request_normalized_validates_context():
    request = LegalRAGRequest("work permit", "en", IntegrationContext(" ", "wp", "check"))
    with pytest.raises(ValueError, match="lead_id"):
        request.normalized()
