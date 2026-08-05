from __future__ import annotations

from src.ai_review_engine import AIReviewEngine, ReviewResult
from src.ai_review_models import (
    STATUS_CONFIGURATION_ERROR,
    STATUS_INSUFFICIENT_EVIDENCE,
    STATUS_NO_EVIDENCE,
    STATUS_SUCCESS,
    AIReviewResult,
    LegalBasisCitation,
)
from src.evidence_builder import ArticleReference, EvidencePack


def _pack() -> EvidencePack:
    return EvidencePack(
        document_id="doc-1",
        document_number=["152/2020/NĐ-CP"],
        title="Nghị định về lao động nước ngoài",
        issuing_authority="Chính phủ",
        effective_date="2021-02-15",
        status="active",
        official_url="https://example.test/152",
        articles=[ArticleReference("9", None, None, "Điều 9", 90.0, "canonical_concept")],
        search_keywords=["work permit"],
        top_score=90.0,
        top_match_type="canonical_concept",
        original_title="Nghị định về lao động nước ngoài",
        original_headings=["Điều 9"],
    )


def test_engine_builds_prompt_calls_connector_and_returns_review_result():
    calls = {}

    def fake_prompt_builder(packs, user_question, language, max_tokens):
        calls["prompt"] = (packs, user_question, language, max_tokens)
        from src.prompt_builder import build_prompt
        return build_prompt(packs, user_question, language, max_tokens)

    def fake_connector(prompt, evidence_packs, api_key, model, client):
        calls["connector"] = (prompt, evidence_packs, api_key, model, client)
        return AIReviewResult(
            status=STATUS_SUCCESS,
            language="ko",
            summary="검토 결과",
            legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9")],
            source_document_count=1,
            source_article_count=1,
            model="gpt-test",
            expert_review_required=False,
        )

    result = AIReviewEngine(fake_prompt_builder, fake_connector).review(
        [_pack()], "노동허가가 필요한가요?", "ko", api_key="sk-test", model="gpt-test"
    )

    assert isinstance(result, ReviewResult)
    assert result.status == STATUS_SUCCESS
    assert result.question == "노동허가가 필요한가요?"
    assert result.legal_basis[0].document_number == "152/2020/NĐ-CP"
    assert calls["prompt"][2] == "ko"
    assert calls["connector"][1][0].document_id == "doc-1"


def test_engine_preserves_all_four_language_questions_verbatim():
    questions = {
        "ko": "노동허가가 필요한가요?",
        "en": "Do I need a work permit?",
        "zh": "我需要工作许可证吗？",
        "vi": "Tôi có cần giấy phép lao động không?",
    }

    def connector(prompt, evidence_packs, api_key, model, client):
        language = prompt.metadata["language"]
        return AIReviewResult(
            status=STATUS_SUCCESS,
            language=language,
            legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9")],
            source_document_count=1,
            source_article_count=1,
        )

    engine = AIReviewEngine(connector=connector)
    for language, question in questions.items():
        result = engine.review([_pack()], question, language, api_key="x", model="m")
        assert result.language == language
        assert result.question == question


def test_engine_empty_question_does_not_call_dependencies():
    def fail(*args, **kwargs):
        raise AssertionError("dependency must not be called")

    result = AIReviewEngine(fail, fail).review([_pack()], "   ", "ko")
    assert result.status == STATUS_CONFIGURATION_ERROR
    assert result.error_code == "empty_question"
    assert result.expert_review_required is True


def test_engine_no_evidence_passes_connector_status_without_inventing_content():
    result = AIReviewEngine().review([], "질문", "ko")
    assert result.status == STATUS_NO_EVIDENCE
    assert result.summary is None
    assert result.legal_basis == []
    assert result.required_documents == []


def test_success_without_verified_legal_basis_is_downgraded():
    def connector(prompt, evidence_packs, api_key, model, client):
        return AIReviewResult(status=STATUS_SUCCESS, language="en", summary="unsupported")

    result = AIReviewEngine(connector=connector).review(
        [_pack()], "Question", "en", api_key="x", model="m"
    )
    assert result.status == STATUS_INSUFFICIENT_EVIDENCE
    assert result.expert_review_required is True
    assert result.error_code == STATUS_INSUFFICIENT_EVIDENCE


def test_engine_does_not_mutate_evidence_input():
    pack = _pack()
    original = pack.to_dict()

    def connector(prompt, evidence_packs, api_key, model, client):
        return AIReviewResult(
            status=STATUS_SUCCESS,
            language="vi",
            legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9")],
        )

    AIReviewEngine(connector=connector).review([pack], "Câu hỏi", "vi", api_key="x", model="m")
    assert pack.to_dict() == original
