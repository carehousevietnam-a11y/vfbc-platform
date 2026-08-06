"""STEP13 end-to-end runtime orchestration for VFBCAI Legal RAG.

This module connects the already-tested STEP1-12 components. It does not alter
search, ranking, evidence, prompt, OpenAI, citation, confidence, report, or
platform integration logic.
"""

from __future__ import annotations

from typing import Any

from ..ai_review_engine import AIReviewEngine
from ..citation_engine import build_citations
from ..confidence_engine import calculate_confidence
from ..customer_report_builder import build_customer_report
from ..customer_review_builder import build_customer_review
from ..evidence_builder import build_evidence_packs
from ..expert_report_builder import build_expert_report
from ..expert_review_builder import build_expert_review
from ..integration.report_service import build_service_integration_bundle
from ..search_engine import LegalSearchIndex
from .models import LegalRAGRequest, LegalRAGRuntimeResult


class LegalRAGService:
    """Framework-neutral, dependency-injected runtime service."""

    def __init__(
        self,
        search_index: LegalSearchIndex,
        review_engine: AIReviewEngine | None = None,
    ) -> None:
        self._search_index = search_index
        self._review_engine = review_engine or AIReviewEngine()

    def run(
        self,
        request: LegalRAGRequest,
        *,
        api_key: str | None = None,
        model: str | None = None,
        client: Any | None = None,
    ) -> LegalRAGRuntimeResult:
        normalized = request.normalized()

        search_results = self._search_index.search(
            query=normalized.question,
            limit=normalized.limit,
            language=normalized.language,
        )
        evidence_packs = build_evidence_packs(
            search_results,
            query=normalized.question,
            documents_by_id=self._search_index.documents_by_id,
        )
        review = self._review_engine.review(
            evidence_packs=evidence_packs,
            user_question=normalized.question,
            language=normalized.language,
            api_key=api_key,
            model=model,
            client=client,
        )
        citations = build_citations(review, evidence_packs)
        confidence = calculate_confidence(review, citations, evidence_packs)
        customer_review = build_customer_review(review, citations, confidence)
        expert_review = build_expert_review(review, citations, confidence, evidence_packs)
        customer_report = build_customer_report(customer_review)
        expert_report = build_expert_report(expert_review)
        integration_bundle = build_service_integration_bundle(
            context=normalized.context,
            customer_report=customer_report,
            expert_report=expert_report,
        )

        return LegalRAGRuntimeResult(
            request=normalized,
            search_results=search_results,
            evidence_packs=evidence_packs,
            review=review,
            citations=citations,
            confidence=confidence,
            customer_review=customer_review,
            expert_review=expert_review,
            customer_report=customer_report,
            expert_report=expert_report,
            integration_bundle=integration_bundle,
            metadata={
                "pipeline": "search>evidence>review>citation>confidence>dual_review>dual_report>integration",
                "search_limit": normalized.limit,
            },
        )


def run_legal_rag(
    *,
    search_index: LegalSearchIndex,
    request: LegalRAGRequest,
    review_engine: AIReviewEngine | None = None,
    api_key: str | None = None,
    model: str | None = None,
    client: Any | None = None,
) -> LegalRAGRuntimeResult:
    """Convenience entry point for API or worker integration."""
    return LegalRAGService(search_index, review_engine).run(
        request,
        api_key=api_key,
        model=model,
        client=client,
    )
