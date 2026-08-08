"""VFBCAI Legal Intelligence Platform — Customer Review Builder (STEP9).

STEP6~8의 공통 결과를 고객이 이해하기 쉬운 독립 JSON 계약으로 변환한다.
검색·Evidence·AI 판단·Citation·Confidence를 변경하지 않으며, 내부 점수 산식과
원문 Evidence 상세는 노출하지 않는다.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .ai_review_engine import ReviewResult
from .answer_policy import append_mandatory_disclaimer
from .citation_engine import CitationResult
from .confidence_engine import ConfidenceResult

CUSTOMER_REVIEW_SCHEMA_VERSION = "step9-customer"


@dataclass(frozen=True)
class CustomerLegalBasis:
    document_number: str
    article: str | None
    title: str | None
    official_url: str | None

    def to_dict(self) -> dict[str, Any]:
        return {
            "document_number": self.document_number,
            "article": self.article,
            "title": self.title,
            "official_url": self.official_url,
        }


@dataclass
class CustomerReview:
    status: str
    language: str | None
    question: str
    ai_summary: str | None
    confidence_score: int
    confidence_level: str
    legal_basis: list[CustomerLegalBasis] = field(default_factory=list)
    risk_factors: list[str] = field(default_factory=list)
    required_documents: list[str] = field(default_factory=list)
    next_actions: list[str] = field(default_factory=list)
    expert_review_required: bool = True
    expert_review_reason: str | None = None
    schema_version: str = CUSTOMER_REVIEW_SCHEMA_VERSION

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "audience": "customer",
            "status": self.status,
            "language": self.language,
            "question": self.question,
            "ai_summary": self.ai_summary,
            "confidence": {
                "score": self.confidence_score,
                "level": self.confidence_level,
            },
            "legal_basis": [item.to_dict() for item in self.legal_basis],
            "risk_factors": list(self.risk_factors),
            "required_documents": list(self.required_documents),
            "next_actions": list(self.next_actions),
            "expert_review": {
                "required": self.expert_review_required,
                "reason": self.expert_review_reason,
            },
        }


def _customer_legal_basis(citations: CitationResult) -> list[CustomerLegalBasis]:
    return [
        CustomerLegalBasis(
            document_number=item.document_number,
            article=item.article,
            title=item.title,
            official_url=item.official_url,
        )
        for item in citations.citations
    ]


def _next_actions(review: ReviewResult, confidence: ConfidenceResult) -> list[str]:
    actions: list[str] = []
    if review.required_documents:
        actions.append("prepare_required_documents")
    if review.risk_factors:
        actions.append("review_identified_risks")
    if review.expert_review_required or confidence.expert_review_required:
        actions.append("request_expert_review")
    if review.status == "success" and not actions:
        actions.append("proceed_with_review_result")
    return actions


def build_customer_review(
    review_result: ReviewResult,
    citation_result: CitationResult,
    confidence_result: ConfidenceResult,
) -> CustomerReview:
    """공통 엔진 결과를 고객용 Review로 변환한다.

    Confidence breakdown/reasons, Evidence 원문, 모델명, prompt metadata 등 내부
    운영 정보는 의도적으로 포함하지 않는다.
    """
    expert_required = (
        review_result.expert_review_required or confidence_result.expert_review_required
    )
    reason = review_result.expert_review_reason
    if expert_required and not reason and confidence_result.reasons:
        reason = confidence_result.reasons[0]

    summary = review_result.summary
    if summary:
        summary = append_mandatory_disclaimer(summary)

    return CustomerReview(
        status=review_result.status,
        language=review_result.language,
        question=review_result.question,
        ai_summary=summary,
        confidence_score=confidence_result.score,
        confidence_level=confidence_result.level,
        legal_basis=_customer_legal_basis(citation_result),
        risk_factors=list(review_result.risk_factors),
        required_documents=list(review_result.required_documents),
        next_actions=_next_actions(review_result, confidence_result),
        expert_review_required=expert_required,
        expert_review_reason=reason,
    )
