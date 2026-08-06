from __future__ import annotations

from src.ai_review_engine import AIReviewEngine
from src.ai_review_models import AIReviewResult, LegalBasisCitation, STATUS_SUCCESS
from src.api import LegalRAGApi
from src.runtime import LegalRAGService
from src.search_engine import LegalSearchIndex


def _index():
    return LegalSearchIndex.from_dicts(
        [{
            "document_id": "doc-152",
            "document_number": ["152/2020/NĐ-CP"],
            "document_type": "decree",
            "title": "Foreign workers",
            "issuing_authority": "Government",
            "effective_date": "2021-02-15",
            "status": "active",
            "official_url": "https://example.test/152",
        }],
        [{
            "chunk_id": "chunk-9",
            "document_id": "doc-152",
            "article_no": "9",
            "heading": "Điều 9",
            "original_text": "Hồ sơ giấy phép lao động",
            "normalized_text": "Hồ sơ giấy phép lao động",
            "search_text": "ho so giay phep lao dong",
            "status": "active",
            "official_url": "https://example.test/152",
        }],
    )


def _connector(prompt_package, evidence_packs, **kwargs):
    return AIReviewResult(
        status=STATUS_SUCCESS,
        language="ko",
        summary="검토 완료",
        legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9", "근거")],
        risk_factors=["서류 누락"],
        required_documents=["여권"],
        expert_review_required=False,
        source_document_count=1,
        source_article_count=1,
        model=kwargs.get("model") or "test-model",
    )


def _api(token=None):
    service = LegalRAGService(_index(), AIReviewEngine(connector=_connector))
    return LegalRAGApi(service, internal_token=token, model="gpt-test")


def _payload(audience="all"):
    return {
        "question": "152/2020/NĐ-CP",
        "language": "ko",
        "audience": audience,
        "context": {
            "lead_id": "lead-1",
            "service_type": "wp",
            "service_group": "check",
            "case_id": "case-1",
            "request_id": "req-1",
        },
    }


def test_health_contract():
    response = _api().health()
    assert response.status_code == 200
    assert response.body == {"ok": True, "schema_version": "step14-api", "service": "vfbcai-legal-rag"}


def test_review_all_returns_customer_and_expert():
    response = _api().review(_payload())
    assert response.status_code == 200
    assert response.body["ok"] is True
    assert "customer" in response.body
    assert "expert" in response.body
    assert response.body["confidence"]["score"] >= 0


def test_customer_response_does_not_expose_expert_evidence_or_search():
    response = _api().review(_payload("customer"))
    assert "customer" in response.body
    assert "expert" not in response.body
    assert "evidence" not in response.body
    assert "search" not in response.body


def test_expert_response_includes_evidence_and_search_only_under_expert():
    response = _api().review(_payload("expert"))
    assert "customer" not in response.body
    assert response.body["expert"]["evidence"]["document_count"] == 1
    assert response.body["expert"]["search"]["result_count"] == 1


def test_internal_token_is_required_when_configured():
    api = _api("secret")
    response = api.review(_payload())
    assert response.status_code == 401
    assert response.body["error"]["code"] == "unauthorized"


def test_internal_token_is_case_insensitive_header_name():
    api = _api("secret")
    response = api.review(_payload(), headers={"X-VFBCAI-Internal-Token": "secret"})
    assert response.status_code == 200


def test_validation_error_maps_to_400():
    payload = _payload()
    payload["question"] = " "
    response = _api().review(payload)
    assert response.status_code == 400
    assert response.body["error"]["code"] == "invalid_request"


def test_unexpected_error_is_sanitized():
    class BrokenService:
        def run(self, *args, **kwargs):
            raise RuntimeError("secret-key-and-stack")

    response = LegalRAGApi(BrokenService()).review(_payload())
    assert response.status_code == 500
    assert "secret-key" not in str(response.body)
    assert response.body["error"]["code"] == "internal_error"
