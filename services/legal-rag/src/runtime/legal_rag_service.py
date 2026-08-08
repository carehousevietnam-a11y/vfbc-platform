"""STEP13 end-to-end runtime orchestration for VFBCAI Legal RAG."""

from __future__ import annotations

from typing import Any

from ..ai_review_engine import AIReviewEngine
from ..answer_tier import ANSWER_TIER_EXPERT_REFERRAL, classify_answer_tier
from ..citation_engine import build_citations
from ..confidence_engine import calculate_confidence
from ..customer_report_builder import build_customer_report
from ..customer_review_builder import build_customer_review
from ..evidence_builder import build_evidence_packs
from ..expert_report_builder import build_expert_report
from ..expert_review_builder import build_expert_review
from ..integration.report_service import build_service_integration_bundle
from ..query_translation import translate_query_terms
from ..search_engine import LegalSearchIndex
from ..search_with_fallback import search_with_fallback
from .models import LegalRAGRequest, LegalRAGRuntimeResult


class LegalRAGService:
    """Framework-neutral, dependency-injected runtime service."""

    def __init__(
        self,
        search_index: LegalSearchIndex,
        review_engine: AIReviewEngine | None = None,
        *,
        translation_model: str | None = None,
    ) -> None:
        self._search_index = search_index
        self._review_engine = review_engine or AIReviewEngine()
        self._translation_model = translation_model

    def run(
        self,
        request: LegalRAGRequest,
        *,
        api_key: str | None = None,
        model: str | None = None,
        translation_model: str | None = None,
        client: Any | None = None,
    ) -> LegalRAGRuntimeResult:
        normalized = request.normalized()

        translation = translate_query_terms(
            normalized.question,
            language=normalized.language,
            api_key=api_key,
            model=translation_model or self._translation_model,
            client=client,
        )

        search_results, search_meta = search_with_fallback(
            self._search_index,
            question=normalized.question,
            language=normalized.language,
            translated_terms=translation.terms,
            limit=normalized.limit,
        )

        answer_tier = classify_answer_tier(search_results)
        top_score = max((item.score for item in search_results), default=0.0)

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
            answer_tier=answer_tier,
            service_group=normalized.context.service_group,
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
                "pipeline": "translate>search>evidence>review>citation>confidence>dual_review>dual_report>integration",
                "search_limit": normalized.limit,
                "translation_skipped": translation.skipped,
                "translation_terms": list(translation.terms),
                "translation_duration_ms": translation.duration_ms,
                "translation_error": translation.error,
                "search_stage": search_meta.get("search_stage"),
                "search_queries": search_meta.get("search_queries"),
                "answer_tier": answer_tier,
                "top_search_score": top_score,
            },
        )


def run_legal_rag(
    *,
    search_index: LegalSearchIndex,
    request: LegalRAGRequest,
    review_engine: AIReviewEngine | None = None,
    api_key: str | None = None,
    model: str | None = None,
    translation_model: str | None = None,
    client: Any | None = None,
) -> LegalRAGRuntimeResult:
    """Convenience entry point for API or worker integration."""
    return LegalRAGService(search_index, review_engine).run(
        request,
        api_key=api_key,
        model=model,
        translation_model=translation_model,
        client=client,
    )
