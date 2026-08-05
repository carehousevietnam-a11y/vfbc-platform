from __future__ import annotations

from src.customer_report_builder import CUSTOMER_REPORT_SCHEMA_VERSION, build_customer_report
from src.customer_review_builder import CustomerLegalBasis, CustomerReview


def _review(language: str = "ko") -> CustomerReview:
    return CustomerReview(
        status="success",
        language=language,
        question="노동허가가 필요한가요?",
        ai_summary="관련 법령에 따라 검토가 필요합니다.",
        confidence_score=88,
        confidence_level="high",
        legal_basis=[CustomerLegalBasis("152/2020/NĐ-CP", "Điều 9", "노동허가 법령", "https://vbpl.vn/doc")],
        risk_factors=["면제 요건 확인 필요"],
        required_documents=["여권", "경력증명서"],
        next_actions=["prepare_required_documents", "request_expert_review"],
        expert_review_required=True,
        expert_review_reason="개별 사실관계 확인",
    )


def test_customer_report_contract_is_stable():
    payload = build_customer_report(_review()).to_dict()
    assert payload["schema_version"] == CUSTOMER_REPORT_SCHEMA_VERSION
    assert payload["report_type"] == "customer"
    assert list(payload) == ["schema_version", "report_type", "status", "language", "question", "title", "sections"]


def test_customer_report_uses_ordered_sections():
    result = build_customer_report(_review())
    assert [section.section_id for section in result.sections] == [
        "executive_summary", "ai_opinion", "confidence", "legal_basis",
        "required_documents", "risk_factors", "recommended_actions", "expert_review",
    ]


def test_customer_report_hides_internal_fields():
    payload = build_customer_report(_review()).to_dict()
    text = str(payload)
    for forbidden in ("prompt_metadata", "top_score", "top_match_type", "breakdown", "reasons", "model"):
        assert forbidden not in text


def test_customer_report_localizes_section_titles():
    result = build_customer_report(_review("vi"))
    assert result.sections[0].title == "Tóm tắt điều hành"
    assert result.sections[-1].title == "Rà soát chuyên gia"


def test_customer_report_maps_actions_to_readable_text():
    result = build_customer_report(_review())
    actions = next(s for s in result.sections if s.section_id == "recommended_actions")
    assert actions.items == ["필요 서류를 준비합니다.", "전문가 검토를 요청합니다."]


def test_customer_report_input_not_mutated():
    review = _review()
    before = review.to_dict()
    build_customer_report(review)
    assert review.to_dict() == before
