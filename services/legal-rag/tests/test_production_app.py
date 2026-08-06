from __future__ import annotations

import json
from pathlib import Path

from src.ai_review_engine import AIReviewEngine
from src.ai_review_models import AIReviewResult, LegalBasisCitation, STATUS_SUCCESS
from src.production import ProductionEventLogger, ProductionLegalRAGApp, ProductionSettings


def _write_dataset(root: Path) -> None:
    data = root / "data/normalized"
    data.mkdir(parents=True)
    document = {
        "documentId": "doc-152",
        "documentNumber": ["152/2020/NĐ-CP"],
        "documentType": "decree",
        "title": "Foreign workers",
        "issuingAuthority": "Government",
        "issueDate": None,
        "effectiveDate": "2021-02-15",
        "expiryDate": None,
        "status": "active",
        "officialUrl": "https://example.test/152",
        "contentHash": "hash",
    }
    chunk = {
        "chunkId": "chunk-9",
        "documentId": "doc-152",
        "path": "Điều 9",
        "breadcrumbTitle": "Điều 9",
        "text": "Hồ sơ giấy phép lao động",
        "status": "active",
    }
    (data / "documents_deduped.jsonl").write_text(json.dumps(document, ensure_ascii=False) + "\n", encoding="utf-8")
    (data / "chunks.jsonl").write_text(json.dumps(chunk, ensure_ascii=False) + "\n", encoding="utf-8")
    (data / "internal_relations.jsonl").write_text("", encoding="utf-8")


def _connector(prompt_package, evidence_packs, **kwargs):
    return AIReviewResult(
        status=STATUS_SUCCESS,
        language="ko",
        summary="검토 완료",
        legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9", "근거")],
        risk_factors=[],
        required_documents=["여권"],
        expert_review_required=False,
        source_document_count=1,
        source_article_count=1,
        model="test-model",
    )


def _create_app(tmp_path: Path, events=None):
    _write_dataset(tmp_path)
    settings = ProductionSettings.from_env(
        {
            "OPENAI_API_KEY": "key",
            "OPENAI_MODEL": "model",
            "LEGAL_RAG_INTERNAL_TOKEN": "secret",
            "LEGAL_RAG_RETRY_DELAY_SECONDS": "0",
        },
        base_dir=tmp_path,
    )
    return ProductionLegalRAGApp.create(
        settings,
        review_engine=AIReviewEngine(connector=_connector),
        event_logger=ProductionEventLogger(sink=(lambda event, fields: events.append((event, fields))) if events is not None else None),
    )


def _payload():
    return {
        "question": "152/2020/NĐ-CP",
        "language": "ko",
        "audience": "customer",
        "context": {
            "lead_id": "lead-1",
            "service_type": "wp",
            "service_group": "check",
            "request_id": "req-1",
        },
    }


def test_health_is_liveness_only(tmp_path: Path):
    app = _create_app(tmp_path)
    response = app.handle_http(method="GET", path="/health")
    assert response.status_code == 200
    assert response.body["schema_version"] == "step15-production"


def test_readiness_verifies_index_and_configuration(tmp_path: Path):
    app = _create_app(tmp_path)
    response = app.handle_http(method="GET", path="/ready")
    assert response.status_code == 200
    assert response.body["index"]["documents"] == 1
    assert response.body["index"]["chunks"] == 1


def test_review_endpoint_executes_step14_contract(tmp_path: Path):
    app = _create_app(tmp_path)
    response = app.handle_http(
        method="POST",
        path="/review",
        body=_payload(),
        headers={"X-VFBCAI-Internal-Token": "secret"},
    )
    assert response.status_code == 200
    assert response.body["ok"] is True
    assert "customer" in response.body
    assert "expert" not in response.body


def test_review_accepts_json_text_body(tmp_path: Path):
    app = _create_app(tmp_path)
    response = app.handle_http(
        method="POST",
        path="review",
        body=json.dumps(_payload(), ensure_ascii=False),
        headers={"x-vfbcai-internal-token": "secret"},
    )
    assert response.status_code == 200


def test_invalid_json_returns_400(tmp_path: Path):
    app = _create_app(tmp_path)
    response = app.handle_http(method="POST", path="/review", body="{")
    assert response.status_code == 400
    assert response.body["error"]["code"] == "invalid_json"


def test_unknown_route_and_wrong_method_are_explicit(tmp_path: Path):
    app = _create_app(tmp_path)
    assert app.handle_http(method="GET", path="/missing").status_code == 404
    response = app.handle_http(method="GET", path="/review")
    assert response.status_code == 405
    assert response.headers["allow"] == "POST"


def test_structured_events_exclude_question_and_payload(tmp_path: Path):
    events = []
    app = _create_app(tmp_path, events)
    app.handle_http(
        method="POST",
        path="/review",
        body=_payload(),
        headers={"X-VFBCAI-Internal-Token": "secret"},
    )
    assert [event for event, fields in events] == [
        "legal_rag.request.started",
        "legal_rag.request.completed",
    ]
    serialized = json.dumps(events, ensure_ascii=False)
    assert "152/2020" not in serialized
    assert "secret" not in serialized
