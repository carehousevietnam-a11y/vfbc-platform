from __future__ import annotations

import json

from src.citation_engine import CitationResult
from src.citation_formatter import format_citation_dict, format_citation_json


def _result(language: str, question: str) -> CitationResult:
    return CitationResult(
        review_status="success",
        question=question,
        language=language,
        source_document_count=0,
        source_article_count=0,
    )


def test_format_citation_dict_matches_result_contract():
    result = _result("ko", "노동허가")
    assert format_citation_dict(result) == result.to_dict()


def test_formatter_preserves_four_language_unicode():
    questions = {
        "ko": "노동허가가 필요한가요?",
        "en": "Do I need a work permit?",
        "zh": "我需要工作许可证吗？",
        "vi": "Tôi có cần giấy phép lao động không?",
    }
    for language, question in questions.items():
        rendered = format_citation_json(_result(language, question))
        assert question in rendered
        assert json.loads(rendered)["language"] == language


def test_compact_json_has_no_pretty_print_newlines():
    rendered = format_citation_json(_result("en", "Question"))
    assert "\n" not in rendered
    assert ": " not in rendered


def test_pretty_json_is_valid_and_indented():
    rendered = format_citation_json(_result("vi", "Câu hỏi"), indent=2)
    assert "\n" in rendered
    assert json.loads(rendered)["schema_version"] == "step7"
