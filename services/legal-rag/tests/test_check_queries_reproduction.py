"""DESIGN v3 §8-1 — reproduce CHECK queries 1, 2, 4, 5 (title-only match → grade B)."""

from __future__ import annotations

import pytest

from src.ai_review_engine import AIReviewEngine
from src.ai_review_models import STATUS_PARTIAL_EVIDENCE, STATUS_SUCCESS, AIReviewResult
from src.integration import IntegrationContext
from src.runtime import LegalRAGRequest, LegalRAGService
from src.search_engine import LegalSearchIndex
from src.search_models import Chunk, Document

CHECK_QUERIES = [
    pytest.param(
        {
            "id": 1,
            "question": "노동허가 경력 요건이 어떻게 되나요?",
            "service_type": "wp",
            "canonical_vi": "giấy phép lao động",
            "document_number": "77/2022/NĐ-CP",
            "title": "Nghị định quy định chi tiết về giấy phép lao động cho người nước ngoài",
            "legal_area": "Lao động, tiền lương, tiền công",
        },
        id="query-01-wp-experience",
    ),
    pytest.param(
        {
            "id": 2,
            "question": "외국인 노동허가 신청 서류가 뭐예요?",
            "service_type": "wp",
            "canonical_vi": "giấy phép lao động",
            "document_number": "152/2020/NĐ-CP",
            "title": "Nghị định về lao động nước ngoài làm việc tại Việt Nam",
            "legal_area": "Lao động, tiền lương, tiền công",
        },
        id="query-02-wp-documents",
    ),
    pytest.param(
        {
            "id": 4,
            "question": "TRC 발급 조건 알려주세요",
            "service_type": "trc",
            "canonical_vi": "thẻ tạm thường trú",
            "document_number": "31/2021/NĐ-CP",
            "title": "Nghị định quy định chi tiết Luật Xuất nhập cảnh về thẻ tạm thường trú",
            "legal_area": "Đăng ký, quản lý cư trú",
        },
        id="query-04-trc-conditions",
    ),
    pytest.param(
        {
            "id": 5,
            "question": "임시거주등록 기한 연장 가능한가요?",
            "service_type": "tamtru",
            "canonical_vi": "tạm trú",
            "document_number": "56/2022/NĐ-CP",
            "title": "Nghị định quy định về đăng ký tạm trú, tạm vắng",
            "legal_area": "Đăng ký, quản lý cư trú",
        },
        id="query-05-tamtru-extension",
    ),
]


def _title_only_index(case: dict) -> LegalSearchIndex:
    document_id = f"tmquan:CHECK-{case['id']:02d}"
    doc = Document.from_dict(
        {
            "document_id": document_id,
            "document_number": [case["document_number"]],
            "document_type": "nghi_dinh",
            "title": case["title"],
            "issuing_authority": "Chính phủ",
            "issue_date": "2022-01-01",
            "effective_date": "2022-03-01",
            "expiry_date": None,
            "status": "active",
            "official_url": "https://example.test/doc",
            "content_hash": None,
            "legal_area": case["legal_area"],
        }
    )
    chunk = Chunk.from_dict(
        {
            "chunk_id": f"{document_id}#title",
            "document_id": document_id,
            "chapter_no": None,
            "article_no": None,
            "clause_no": None,
            "item_no": None,
            "heading": case["title"],
            "original_text": case["canonical_vi"],
            "normalized_text": case["canonical_vi"],
            "search_text": case["canonical_vi"],
            "status": "active",
            "official_url": doc.official_url,
            "content_hash": None,
        }
    )
    return LegalSearchIndex([doc], [chunk])


def _no_article_connector(prompt_package, evidence_packs, **kwargs) -> AIReviewResult:
    """Simulate model success without verified article citations (title-only evidence)."""
    return AIReviewResult(
        status=STATUS_SUCCESS,
        language="ko",
        summary=None,
        legal_basis=[],
        expert_review_required=False,
        source_document_count=len(evidence_packs),
        source_article_count=0,
        model="test",
    )


@pytest.mark.parametrize("case", CHECK_QUERIES)
def test_check_query_title_only_match_becomes_partial_evidence(case: dict):
    index = _title_only_index(case)
    service = LegalRAGService(index, AIReviewEngine(connector=_no_article_connector))
    result = service.run(
        LegalRAGRequest(
            question=case["question"],
            language="ko",
            context=IntegrationContext(f"lead-check-{case['id']:02d}", case["service_type"], "check"),
            limit=5,
        ),
        api_key="sk-test",
    )

    assert result.review.status == STATUS_PARTIAL_EVIDENCE
    assert result.search_results

    summary = result.customer_review.ai_summary or result.review.summary or ""
    assert case["document_number"] in summary

    legal_basis = result.customer_review.to_dict()["legal_basis"]
    assert legal_basis
    assert all(item["article"] is None for item in legal_basis)
    assert any(case["document_number"] in (item["formatted_line"] or "") for item in legal_basis)
