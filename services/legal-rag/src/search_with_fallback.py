"""Multilingual search orchestration with translation + ontology partial-match fallback."""

from __future__ import annotations

from .multilingual_legal_terms import extract_partial_ontology_matches
from .search_engine import LegalSearchIndex
from .search_models import SearchResult


def _dedupe_results(results: list[SearchResult]) -> list[SearchResult]:
    best: dict[tuple, SearchResult] = {}
    for item in results:
        key = (item.document_id, item.article_no, item.clause_no, item.item_no)
        if key not in best or item.score > best[key].score:
            best[key] = item
    merged = list(best.values())
    merged.sort(key=lambda r: r.score, reverse=True)
    return merged


def search_with_fallback(
    index: LegalSearchIndex,
    *,
    question: str,
    language: str | None,
    translated_terms: list[str],
    limit: int,
) -> tuple[list[SearchResult], dict]:
    """Try translated terms, then partial ontology, then original question."""
    stage = "none"
    results: list[SearchResult] = []

    if translated_terms:
        stage = "translated_terms"
        for term in translated_terms:
            term = (term or "").strip()
            if not term:
                continue
            hits = index.search(query=term, limit=limit, language=language)
            results.extend(hits)
        results = _dedupe_results(results)
        if results:
            return results[:limit], {
                "search_stage": stage,
                "search_queries": list(translated_terms),
            }

    partial_terms = extract_partial_ontology_matches(question)
    if partial_terms:
        stage = "ontology_partial"
        for term in partial_terms:
            hits = index.search(query=term, limit=limit, language=language)
            results.extend(hits)
        results = _dedupe_results(results)
        if results:
            return results[:limit], {
                "search_stage": stage,
                "search_queries": partial_terms,
            }

    stage = "original_question"
    results = index.search(query=question, limit=limit, language=language)
    return results[:limit], {
        "search_stage": stage,
        "search_queries": [question],
    }
