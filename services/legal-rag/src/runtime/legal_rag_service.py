"""STEP13 end-to-end runtime orchestration for VFBCAI Legal RAG."""

from __future__ import annotations

import time
from typing import Any

from ..ai_review_engine import AIReviewEngine
from ..answer_tier import ANSWER_TIER_EXPERT_REFERRAL, classify_answer_tier, reconcile_answer_tier
from ..citation_engine import build_citations
from ..confidence_engine import calculate_confidence
from ..customer_report_builder import build_customer_report
from ..customer_review_builder import build_customer_review
from ..evidence_builder import build_evidence_packs
from ..expert_report_builder import build_expert_report
from ..expert_review_builder import build_expert_review
from ..integration.report_service import build_service_integration_bundle
from ..multilingual_legal_terms import extract_partial_ontology_matches
from ..query_translation import QueryTranslationResult, should_skip_translation, translate_query_terms
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
        pipeline_started = time.perf_counter()

        translation = self._resolve_translation(
            normalized.question,
            language=normalized.language,
            api_key=api_key,
            translation_model=translation_model or self._translation_model,
            client=client,
        )

        search_started = time.perf_counter()
        search_results, search_meta = search_with_fallback(
            self._search_index,
            question=normalized.question,
            language=normalized.language,
            translated_terms=translation.terms,
            limit=normalized.limit,
        )
        search_duration_ms = (time.perf_counter() - search_started) * 1000.0

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
        answer_tier = reconcile_answer_tier(
            search_results,
            review_status=review.status,
            verified_citation_count=len(citations.citations),
        )
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

        total_duration_ms = (time.perf_counter() - pipeline_started) * 1000.0

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
                "translation_no_legal_terms": translation.no_legal_terms,
                "search_stage": search_meta.get("search_stage"),
                "search_queries": search_meta.get("search_queries"),
                "search_stages_attempted": search_meta.get("search_stages_attempted"),
                "search_duration_ms": round(search_duration_ms, 2),
                "pipeline_duration_ms": round(total_duration_ms, 2),
                "answer_tier": answer_tier,
                "top_search_score": top_score,
            },
        )

    def _resolve_translation(
        self,
        question: str,
        *,
        language: str | None,
        api_key: str | None,
        translation_model: str | None,
        client: Any | None,
    ) -> QueryTranslationResult:
        """Call OpenAI term extraction only when local ontology cannot match the query."""
        if should_skip_translation(language):
            return QueryTranslationResult(skipped=True, terms=[])

        if extract_partial_ontology_matches(question):
            return QueryTranslationResult(skipped=True, terms=[])

        return translate_query_terms(
            question,
            language=language,
            api_key=api_key,
            model=translation_model,
            client=client,
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
