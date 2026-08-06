from __future__ import annotations

import copy

import pytest

from src.api import parse_api_request


def _payload():
    return {
        "question": "  노동허가가 필요한가요?  ",
        "language": "ko",
        "limit": 10,
        "audience": "customer",
        "context": {
            "lead_id": " lead-1 ",
            "service_type": " wp ",
            "service_group": "CHECK",
            "case_id": " case-1 ",
            "request_id": " req-1 ",
        },
    }


def test_parser_normalizes_request_without_mutation():
    payload = _payload()
    before = copy.deepcopy(payload)
    parsed = parse_api_request(payload)
    assert parsed.question == "노동허가가 필요한가요?"
    assert parsed.service_group == "check"
    assert parsed.lead_id == "lead-1"
    assert payload == before


def test_parser_defaults_limit_and_audience():
    payload = _payload()
    payload.pop("limit")
    payload.pop("audience")
    parsed = parse_api_request(payload)
    assert parsed.limit == 20
    assert parsed.audience == "all"


def test_parser_rejects_non_object_body():
    with pytest.raises(ValueError, match="JSON object"):
        parse_api_request([])


def test_parser_rejects_missing_context():
    with pytest.raises(ValueError, match="context"):
        parse_api_request({"question": "x"})


def test_parser_rejects_invalid_service_group():
    payload = _payload()
    payload["context"]["service_group"] = "other"
    with pytest.raises(ValueError, match="service_group"):
        parse_api_request(payload)


def test_parser_rejects_invalid_limit_and_bool():
    for value in (0, 101, True, "20"):
        payload = _payload()
        payload["limit"] = value
        with pytest.raises(ValueError, match="limit"):
            parse_api_request(payload)


def test_parser_rejects_invalid_audience():
    payload = _payload()
    payload["audience"] = "admin"
    with pytest.raises(ValueError, match="audience"):
        parse_api_request(payload)
