"""Customer-facing Executive Report builder (STEP10).

Transforms a STEP9 CustomerReview into a stable report JSON contract suitable for
future HTML/PDF rendering. Internal confidence calculations and evidence details
remain excluded.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .customer_review_builder import CustomerReview
from .report_sections import ReportLink, ReportMetric, ReportSection

CUSTOMER_REPORT_SCHEMA_VERSION = "step10-customer-report"

_SECTION_TITLES = {
    "ko": {
        "summary": "Executive Summary",
        "opinion": "AI 종합 의견",
        "confidence": "판단 신뢰도",
        "legal_basis": "핵심 법적 근거",
        "documents": "준비 서류",
        "risks": "주의 사항",
        "actions": "권장 조치",
        "expert": "전문가 검토",
    },
    "en": {
        "summary": "Executive Summary",
        "opinion": "AI Review Opinion",
        "confidence": "Review Confidence",
        "legal_basis": "Key Legal Basis",
        "documents": "Required Documents",
        "risks": "Key Risks",
        "actions": "Recommended Actions",
        "expert": "Expert Review",
    },
    "zh": {
        "summary": "执行摘要",
        "opinion": "AI综合意见",
        "confidence": "判断可信度",
        "legal_basis": "核心法律依据",
        "documents": "所需材料",
        "risks": "注意事项",
        "actions": "建议措施",
        "expert": "专家审查",
    },
    "vi": {
        "summary": "Tóm tắt điều hành",
        "opinion": "Ý kiến tổng hợp của AI",
        "confidence": "Độ tin cậy đánh giá",
        "legal_basis": "Căn cứ pháp lý chính",
        "documents": "Hồ sơ cần chuẩn bị",
        "risks": "Điểm cần lưu ý",
        "actions": "Hành động đề xuất",
        "expert": "Rà soát chuyên gia",
    },
}

_ACTION_LABELS = {
    "ko": {
        "prepare_required_documents": "필요 서류를 준비합니다.",
        "review_identified_risks": "확인된 위험요인을 점검합니다.",
        "request_expert_review": "전문가 검토를 요청합니다.",
        "proceed_with_review_result": "검토 결과에 따라 다음 절차를 진행합니다.",
    },
    "en": {
        "prepare_required_documents": "Prepare the required documents.",
        "review_identified_risks": "Review the identified risks.",
        "request_expert_review": "Request an expert review.",
        "proceed_with_review_result": "Proceed based on the review result.",
    },
    "zh": {
        "prepare_required_documents": "准备所需材料。",
        "review_identified_risks": "核查已识别的风险。",
        "request_expert_review": "申请专家审查。",
        "proceed_with_review_result": "根据审查结果进入下一程序。",
    },
    "vi": {
        "prepare_required_documents": "Chuẩn bị các hồ sơ cần thiết.",
        "review_identified_risks": "Kiểm tra các rủi ro đã xác định.",
        "request_expert_review": "Yêu cầu chuyên gia rà soát.",
        "proceed_with_review_result": "Tiếp tục theo kết quả rà soát.",
    },
}


@dataclass
class CustomerReport:
    status: str
    language: str | None
    question: str
    title: str
    sections: list[ReportSection] = field(default_factory=list)
    schema_version: str = CUSTOMER_REPORT_SCHEMA_VERSION

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "report_type": "customer",
            "status": self.status,
            "language": self.language,
            "question": self.question,
            "title": self.title,
            "sections": [section.to_dict() for section in self.sections],
        }


def _language(value: str | None) -> str:
    return value if value in _SECTION_TITLES else "en"


def _legal_basis_items(review: CustomerReview) -> tuple[list[dict[str, Any]], list[ReportLink]]:
    items: list[dict[str, Any]] = []
    links: list[ReportLink] = []
    for basis in review.legal_basis:
        items.append({
            "document_number": basis.document_number,
            "article": basis.article,
            "title": basis.title,
            "formatted_line": basis.formatted_line,
        })
        if basis.official_url:
            links.append(ReportLink(basis.document_number, basis.official_url))
    return items, links


def build_customer_report(review: CustomerReview) -> CustomerReport:
    """Build a customer-safe Executive Report without exposing internal metadata."""
    language = _language(review.language)
    titles = _SECTION_TITLES[language]
    action_labels = _ACTION_LABELS[language]
    legal_items, legal_links = _legal_basis_items(review)

    sections = [
        ReportSection("executive_summary", titles["summary"], content=review.ai_summary),
        ReportSection("ai_opinion", titles["opinion"], content=review.ai_summary),
        ReportSection(
            "confidence",
            titles["confidence"],
            metrics=[
                ReportMetric("score", "score", review.confidence_score, "%"),
                ReportMetric("level", "level", review.confidence_level),
            ],
        ),
    ]
    if legal_items:
        sections.append(ReportSection("legal_basis", titles["legal_basis"], items=legal_items, links=legal_links))
    if review.required_documents:
        sections.append(ReportSection("required_documents", titles["documents"], items=list(review.required_documents)))
    if review.risk_factors:
        sections.append(ReportSection("risk_factors", titles["risks"], items=list(review.risk_factors)))
    if review.next_actions:
        sections.append(ReportSection(
            "recommended_actions",
            titles["actions"],
            items=[action_labels.get(action, action) for action in review.next_actions],
        ))
    sections.append(ReportSection(
        "expert_review",
        titles["expert"],
        content=review.expert_review_reason,
        metrics=[ReportMetric("required", "required", review.expert_review_required)],
    ))

    return CustomerReport(
        status=review.status,
        language=review.language,
        question=review.question,
        title=titles["summary"],
        sections=sections,
    )
