"""Stable request/result DTOs for the STEP13 end-to-end Legal RAG runtime."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ..ai_review_engine import ReviewResult
from ..citation_engine import CitationResult
from ..confidence_engine import ConfidenceResult
from ..customer_report_builder import CustomerReport
from ..customer_review_builder import CustomerReview
from ..evidence_builder import EvidencePack
from ..expert_report_builder import ExpertReport
from ..expert_review_builder import ExpertReview
from ..integration.common import IntegratedReportBundle, IntegrationContext
from ..search_models import SearchResult

RUNTIME_SCHEMA_VERSION = "step13-runtime"


@dataclass(frozen=True)
class LegalRAGRequest:
    question: str
    language: str | None
    context: IntegrationContext
    limit: int = 20

    def normalized(self) -> "LegalRAGRequest":
        question = self.question.strip()
        if not question:
            raise ValueError("question must not be empty")
        if self.limit < 1:
            raise ValueError("limit must be at least 1")
        return LegalRAGRequest(
            question=question,
            language=self.language,
            context=self.context.normalized(),
            limit=self.limit,
        )


@dataclass
class LegalRAGRuntimeResult:
    request: LegalRAGRequest
    search_results: list[SearchResult]
    evidence_packs: list[EvidencePack]
    review: ReviewResult
    citations: CitationResult
    confidence: ConfidenceResult
    customer_review: CustomerReview
    expert_review: ExpertReview
    customer_report: CustomerReport
    expert_report: ExpertReport
    integration_bundle: IntegratedReportBundle
    schema_version: str = RUNTIME_SCHEMA_VERSION
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Return one JSON-ready object without mutating any stage output."""
        return {
            "schema_version": self.schema_version,
            "request": {
                "question": self.request.question,
                "language": self.request.language,
                "limit": self.request.limit,
                "context": {
                    "lead_id": self.request.context.lead_id,
                    "service_type": self.request.context.service_type,
                    "service_group": self.request.context.service_group,
                    "case_id": self.request.context.case_id,
                    "request_id": self.request.context.request_id,
                },
            },
            "search": {
                "result_count": len(self.search_results),
                "results": [item.to_dict() for item in self.search_results],
            },
            "evidence": {
                "document_count": len(self.evidence_packs),
                "article_count": sum(len(pack.articles) for pack in self.evidence_packs),
                "packs": [pack.to_dict() for pack in self.evidence_packs],
            },
            "review": self.review.to_dict(),
            "citations": self.citations.to_dict(),
            "confidence": self.confidence.to_dict(),
            "customer_review": self.customer_review.to_dict(),
            "expert_review": self.expert_review.to_dict(),
            "customer_report": self.customer_report.to_dict(),
            "expert_report": self.expert_report.to_dict(),
            "integration": self.integration_bundle.to_dict(),
            "metadata": dict(self.metadata),
        }
