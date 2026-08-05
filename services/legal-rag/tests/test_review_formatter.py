import json

from src.ai_review_engine import ReviewResult
from src.ai_review_models import LegalBasisCitation
from src.review_formatter import format_review_dict, format_review_json


def _result(language="ko", question="노동허가가 필요한가요?") -> ReviewResult:
    return ReviewResult(
        status="success",
        language=language,
        question=question,
        summary="검토 결과입니다.",
        legal_basis=[LegalBasisCitation("152/2020/NĐ-CP", "Điều 9", "판단 근거")],
        risk_factors=["체류 자격 확인 필요"],
        required_documents=["여권"],
        expert_review_required=False,
        source_document_count=1,
        source_article_count=1,
        model="gpt-test",
        prompt_metadata={"language": language, "prompt_builder_version": "step5-2"},
    )


def test_format_review_dict_has_stable_top_level_contract():
    data = format_review_dict(_result())
    assert list(data) == [
        "schema_version", "status", "language", "question", "summary",
        "legal_basis", "risk_factors", "required_documents",
        "expert_review_required", "expert_review_reason", "sources",
        "model", "error_code", "prompt_metadata",
    ]
    assert data["schema_version"] == "step6"
    assert data["sources"] == {"document_count": 1, "article_count": 1}


def test_format_review_json_is_valid_and_preserves_unicode():
    text = format_review_json(_result(), ensure_ascii=False)
    assert "노동허가가 필요한가요?" in text
    decoded = json.loads(text)
    assert decoded["legal_basis"][0]["document_number"] == "152/2020/NĐ-CP"


def test_formatter_preserves_korean_english_chinese_vietnamese():
    samples = {
        "ko": "노동허가가 필요한가요?",
        "en": "Do I need a work permit?",
        "zh": "我需要工作许可证吗？",
        "vi": "Tôi có cần giấy phép lao động không?",
    }
    for language, question in samples.items():
        decoded = json.loads(format_review_json(_result(language, question)))
        assert decoded["language"] == language
        assert decoded["question"] == question


def test_formatter_returns_copies_of_mutable_collections():
    result = _result()
    data = format_review_dict(result)
    data["risk_factors"].append("외부 변경")
    data["prompt_metadata"]["changed"] = True
    assert result.risk_factors == ["체류 자격 확인 필요"]
    assert "changed" not in result.prompt_metadata


def test_pretty_json_option():
    text = format_review_json(_result(), indent=2)
    assert "\n" in text
    assert json.loads(text)["status"] == "success"
