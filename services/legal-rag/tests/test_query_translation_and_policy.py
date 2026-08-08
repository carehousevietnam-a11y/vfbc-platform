from __future__ import annotations

import json

from src.answer_policy import (
    MANDATORY_DISCLAIMER,
    append_mandatory_disclaimer,
    build_expert_referral_summary,
    contains_forbidden_definitive_phrasing,
)
from src.customer_review_builder import build_customer_review
from src.ai_review_engine import ReviewResult
from src.citation_engine import CitationResult
from src.confidence_engine import ConfidenceBreakdown, ConfidenceResult
from src.answer_tier import (
    ANSWER_TIER_EXPERT_REFERRAL,
    classify_answer_tier,
    reconcile_answer_tier,
)
from src.ai_review_models import STATUS_INSUFFICIENT_EVIDENCE
from src.search_models import MatchType, SearchResult
from src.multilingual_legal_terms import extract_partial_ontology_matches
from src.query_translation import should_skip_translation, translate_query_terms
from src.search_with_fallback import search_with_fallback, should_search_original_question
from src.search_engine import LegalSearchIndex
from src.runtime import LegalRAGRequest, LegalRAGService
from src.integration import IntegrationContext
from src.ai_review_engine import AIReviewEngine
from src.ai_review_models import AIReviewResult, STATUS_NO_EVIDENCE


class _FakeMessage:
    def __init__(self, content: str):
        self.content = content


class _FakeChoice:
    def __init__(self, content: str):
        self.message = _FakeMessage(content)


class _FakeResponse:
    def __init__(self, content: str):
        self.choices = [_FakeChoice(content)]


class _FakeCompletions:
    def __init__(self, content: str):
        self._content = content
        self.calls: list[dict] = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return _FakeResponse(self._content)


class _FakeChat:
    def __init__(self, content: str):
        self.completions = _FakeCompletions(content)


class FakeTranslationClient:
    def __init__(self, content: str):
        self.chat = _FakeChat(content)


def test_append_mandatory_disclaimer_is_idempotent():
    base = "해석 가이드입니다."
    once = append_mandatory_disclaimer(base)
    twice = append_mandatory_disclaimer(once)
    assert MANDATORY_DISCLAIMER in once
    assert once == twice


def test_expert_referral_summary_includes_disclaimer():
    summary = build_expert_referral_summary("노동허가 경력 요건이 어떻게 되나요?", language="ko")
    assert "노동허가 경력 요건" in summary
    assert "전문가 상담" in summary
    assert MANDATORY_DISCLAIMER in summary


def test_forbidden_definitive_phrasing_detection():
    assert contains_forbidden_definitive_phrasing("이 계약은 무효입니다.")
    assert not contains_forbidden_definitive_phrasing("해석될 수 있습니다.")


def test_skip_translation_for_vietnamese():
    assert should_skip_translation("vi") is True
    result = translate_query_terms("giấy phép lao động", language="vi", api_key="sk-test")
    assert result.skipped is True
    assert result.terms == []


def test_translate_query_terms_parses_json():
    payload = json.dumps({"terms": ["giấy phép lao động", "kinh nghiệm làm việc"]}, ensure_ascii=False)
    client = FakeTranslationClient(payload)
    result = translate_query_terms(
        "노동허가 경력 요건이 어떻게 되나요?",
        language="ko",
        api_key="sk-test",
        client=client,
    )
    assert result.skipped is False
    assert result.terms == ["giấy phép lao động", "kinh nghiệm làm việc"]
    assert client.chat.completions.calls


def test_partial_ontology_matches_compound_korean_query():
    terms = extract_partial_ontology_matches("노동허가 경력 요건이 어떻게 되나요?")
    assert "giấy phép lao động" in terms


def test_search_fallback_finds_wp_terms_without_translation():
    from src.search_models import Chunk, Document

    doc = Document.from_dict(
        {
            "document_id": "doc-1",
            "document_number": ["152/2020/NĐ-CP"],
            "document_type": "decree",
            "title": "Giấy phép lao động",
            "issuing_authority": "Gov",
            "issue_date": None,
            "effective_date": None,
            "expiry_date": None,
            "status": "active",
            "official_url": None,
            "content_hash": None,
        }
    )
    chunk = Chunk.from_dict(
        {
            "chunk_id": "c1",
            "document_id": "doc-1",
            "chapter_no": None,
            "article_no": "9",
            "clause_no": None,
            "item_no": None,
            "heading": "Điều 9",
            "original_text": "kinh nghiệm làm việc tối thiểu",
            "normalized_text": "kinh nghiệm làm việc tối thiểu",
            "search_text": "kinh nghiệm làm việc tối thiểu",
            "status": "active",
            "official_url": None,
            "content_hash": None,
        }
    )
    index = LegalSearchIndex([doc], [chunk])
    results, meta = search_with_fallback(
        index,
        question="노동허가 경력 요건이 어떻게 되나요?",
        language="ko",
        translated_terms=[],
        limit=10,
    )
    assert results
    assert meta["search_stage"] == "ontology_partial"


def test_customer_review_always_appends_disclaimer():
    review = ReviewResult(
        status="success",
        language="ko",
        question="test",
        summary="관련 조문에 따르면 해석될 수 있습니다.",
        expert_review_required=True,
    )
    citations = CitationResult(
        review_status="success",
        question="test",
        language="ko",
        citations=[],
    )
    confidence = ConfidenceResult(
        score=80,
        level="high",
        breakdown=ConfidenceBreakdown(20, 20, 20, 20),
        expert_review_required=True,
        reasons=(),
        evidence_document_count=1,
        evidence_article_count=1,
        verified_citation_count=0,
    )
    customer = build_customer_review(review, citations, confidence)
    assert customer.ai_summary is not None
    assert MANDATORY_DISCLAIMER in customer.ai_summary


def test_translate_query_terms_detects_no_legal_terms():
    payload = json.dumps({"terms": [], "no_legal_terms": True}, ensure_ascii=False)
    client = FakeTranslationClient(payload)
    result = translate_query_terms(
        "베트남 날씨는 어떤가요?",
        language="ko",
        api_key="sk-test",
        client=client,
    )
    assert result.terms == []
    assert result.no_legal_terms is True


def test_should_not_scan_original_question_for_korean():
    assert should_search_original_question("ko") is False
    assert should_search_original_question("ko", "베트남 날씨는 어떤가요?") is False
    assert should_search_original_question("vi") is True
    assert should_search_original_question("ko", "152/2020/NĐ-CP") is True


def test_search_fallback_skips_original_question_for_korean():
    index = LegalSearchIndex([], [])
    results, meta = search_with_fallback(
        index,
        question="베트남 날씨는 어떤가요?",
        language="ko",
        translated_terms=[],
        limit=10,
    )
    assert results == []
    assert meta["search_stage"] == "none"
    assert meta["search_stages_attempted"] == []


def test_reconcile_answer_tier_downgrades_insufficient_evidence():
    hit = SearchResult(
        document_id="doc-1",
        document_number=["152/2020/NĐ-CP"],
        document_type="decree",
        title="WP",
        article_no="9",
        clause_no=None,
        item_no=None,
        heading="Điều 9",
        status="active",
        official_url=None,
        score=85.0,
        match_type=MatchType.CANONICAL_CONCEPT.value,
    )
    assert classify_answer_tier([hit]) == "direct"
    assert (
        reconcile_answer_tier(
            [hit],
            review_status=STATUS_INSUFFICIENT_EVIDENCE,
            verified_citation_count=0,
        )
        == ANSWER_TIER_EXPERT_REFERRAL
    )


def test_runtime_skips_translation_when_ontology_matches():
    from src.search_models import Chunk, Document

    doc = Document.from_dict(
        {
            "document_id": "doc-1",
            "document_number": ["152/2020/NĐ-CP"],
            "document_type": "decree",
            "title": "Giấy phép lao động",
            "issuing_authority": "Gov",
            "issue_date": None,
            "effective_date": None,
            "expiry_date": None,
            "status": "active",
            "official_url": None,
            "content_hash": None,
        }
    )
    chunk = Chunk.from_dict(
        {
            "chunk_id": "c1",
            "document_id": "doc-1",
            "chapter_no": None,
            "article_no": "9",
            "clause_no": None,
            "item_no": None,
            "heading": "Điều 9",
            "original_text": "kinh nghiệm làm việc",
            "normalized_text": "kinh nghiệm làm việc",
            "search_text": "kinh nghiệm làm việc",
            "status": "active",
            "official_url": None,
            "content_hash": None,
        }
    )
    index = LegalSearchIndex([doc], [chunk])

    class ExplodingClient:
        def __init__(self):
            self.chat = self

        @property
        def completions(self):
            raise AssertionError("translation API must not be called when ontology matches")

    def connector(prompt_package, evidence_packs, **kwargs):
        return AIReviewResult(
            status=STATUS_NO_EVIDENCE,
            language="ko",
            expert_review_required=True,
            source_document_count=len(evidence_packs),
            source_article_count=1,
            model="test",
        )

    service = LegalRAGService(index, AIReviewEngine(connector=connector))
    result = service.run(
        LegalRAGRequest(
            question="노동허가 경력 요건이 어떻게 되나요?",
            language="ko",
            context=IntegrationContext("lead-1", "wp", "check"),
            limit=5,
        ),
        api_key="sk-test",
        client=ExplodingClient(),
    )
    assert result.metadata["translation_skipped"] is True
    assert result.metadata["search_stage"] == "ontology_partial"
    assert result.search_results
