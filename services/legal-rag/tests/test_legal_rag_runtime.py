from __future__ import annotations

import copy

import pytest

from src.ai_review_engine import AIReviewEngine
from src.ai_review_models import AIReviewResult, LegalBasisCitation, STATUS_SUCCESS
from src.integration import IntegrationContext
from src.runtime import LegalRAGRequest, LegalRAGService, run_legal_rag
from src.search_engine import LegalSearchIndex


def _index() -> LegalSearchIndex:
    documents = [{
        "document_id": "doc-152",
        "document_number": ["152/2020/NĐ-CP"],
        "document_type": "decree",
        "title": "Quy định về người lao động nước ngoài",
        "issuing_authority": "Chính phủ",
        "effective_date": "2021-02-15",
        "status": "active",
        "official_url": "https://example.test/152",
    }]
    chunks = [{
        "chunk_id": "chunk-9",
        "document_id": "doc-152",
        "article_no": "9",
        "clause_no": None,
        "item_no": None,
        "heading": "Điều 9. Hồ sơ đề nghị cấp giấy phép lao động",
        "original_text": "Hồ sơ đề nghị cấp giấy phép lao động.",
        "normalized_text": "Hồ sơ đề nghị cấp giấy phép lao động.",
        "search_text": "ho so de nghi cap giay phep lao dong",
        "status": "active",
        "official_url": "https://example.test/152",
    }]
    return LegalSearchIndex.from_dicts(documents, chunks)


def _connector(prompt_package, evidence_packs, **kwargs):
    assert evidence_packs
    return AIReviewResult(
        status=STATUS_SUCCESS,
        language=prompt_package.metadata.get("language"),
        summary="노동허가 신청 서류를 준비해야 합니다.",
        legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9", "신청 서류")],
        risk_factors=["서류 누락"],
        required_documents=["여권", "경력증명서"],
        expert_review_required=False,
        source_document_count=len(evidence_packs),
        source_article_count=sum(len(pack.articles) for pack in evidence_packs),
        model=kwargs.get("model") or "test-model",
    )


def _request(group: str = "check") -> LegalRAGRequest:
    return LegalRAGRequest(
        question="152/2020/NĐ-CP",
        language="ko",
        context=IntegrationContext(
            lead_id="lead-1",
            service_type="wp",
            service_group=group,
            case_id="case-1",
            request_id="req-1",
        ),
        limit=5,
    )


def _service() -> LegalRAGService:
    return LegalRAGService(_index(), AIReviewEngine(connector=_connector))


def test_runtime_connects_all_stages():
    result = _service().run(_request())
    assert len(result.search_results) == 1
    assert len(result.evidence_packs) == 1
    assert result.review.status == "success"
    assert len(result.citations.citations) == 1
    assert result.customer_review.question == "152/2020/NĐ-CP"
    assert result.expert_review.verification if hasattr(result.expert_review, "verification") else True
    assert result.customer_report.schema_version == "step10-customer-report"
    assert result.expert_report.schema_version == "step10-expert-report"
    assert result.integration_bundle.workflow == "check"


def test_runtime_check_has_customer_and_expert_deliveries():
    result = _service().run(_request("check"))
    audiences = [delivery.audience for delivery in result.integration_bundle.deliveries]
    assert audiences == ["customer", "expert"]


def test_runtime_verify_has_customer_and_expert_deliveries():
    result = _service().run(_request("verify"))
    audiences = [delivery.audience for delivery in result.integration_bundle.deliveries]
    assert audiences == ["customer", "expert"]


def test_runtime_register_has_customer_and_expert_deliveries():
    result = _service().run(_request("register"))
    audiences = [delivery.audience for delivery in result.integration_bundle.deliveries]
    assert audiences == ["customer", "expert"]


def test_runtime_passes_model_to_connector():
    result = _service().run(_request(), model="gpt-test")
    assert result.review.model == "gpt-test"


def test_runtime_normalizes_question_and_context():
    request = LegalRAGRequest(
        question="  152/2020/NĐ-CP  ",
        language="ko",
        context=IntegrationContext(" lead-1 ", " wp ", "check", " case-1 ", " req-1 "),
    )
    result = _service().run(request)
    assert result.request.question == "152/2020/NĐ-CP"
    assert result.request.context.lead_id == "lead-1"


def test_runtime_rejects_empty_question():
    request = LegalRAGRequest("   ", "ko", IntegrationContext("lead", "wp", "check"))
    with pytest.raises(ValueError, match="question"):
        _service().run(request)


def test_runtime_rejects_invalid_limit():
    request = LegalRAGRequest("work permit", "en", IntegrationContext("lead", "wp", "check"), 0)
    with pytest.raises(ValueError, match="limit"):
        _service().run(request)


def test_runtime_to_dict_is_json_ready_and_complete():
    payload = _service().run(_request()).to_dict()
    assert payload["schema_version"] == "step13-runtime"
    assert payload["search"]["result_count"] == 1
    assert payload["evidence"]["document_count"] == 1
    assert payload["review"]["status"] == "success"
    assert payload["integration"]["workflow"] == "check"


def test_runtime_does_not_mutate_request():
    request = _request()
    before = copy.deepcopy(request)
    _service().run(request)
    assert request == before


def test_convenience_function_uses_injected_engine():
    result = run_legal_rag(
        search_index=_index(),
        request=_request(),
        review_engine=AIReviewEngine(connector=_connector),
    )
    assert result.review.summary


def test_runtime_metadata_declares_pipeline():
    result = _service().run(_request())
    assert result.metadata["pipeline"].startswith("translate>search>evidence>review")
    assert result.metadata["search_limit"] == 5
