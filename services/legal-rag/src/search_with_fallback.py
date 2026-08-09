"""Multilingual search orchestration with ontology → translation → original fallback."""

from __future__ import annotations

import re

from .multilingual_legal_terms import extract_partial_ontology_matches
from .search_engine import LegalSearchIndex
from .search_models import SearchFilters, SearchResult, normalize_query_text
from .service_category_mapping import index_has_legal_area_metadata, resolve_legal_areas_for_service

_DOCUMENT_NUMBER_RE = re.compile(
    r"\b\d{1,4}/\d{4}/(?:NĐ-CP|NĐ|TT-[A-ZĐ]+|QH\d+|QĐ-[A-ZĐ]+|NQ-HĐND|Nghị định|Thông tư)\b",
    re.IGNORECASE,
)
_VIETNAMESE_LEGAL_MARKERS_RE = re.compile(
    r"(Điều\s+\d+|Luật|Nghị định|Thông tư|Khoản\s+\d+|NĐ-CP|TT-|QH\d+)",
    re.IGNORECASE,
)

# Cap per-stage term fan-out so translation cannot trigger dozens of full scans.
_MAX_TERMS_PER_STAGE = 3


def _dedupe_results(results: list[SearchResult]) -> list[SearchResult]:
    best: dict[tuple, SearchResult] = {}
    for item in results:
        key = (item.document_id, item.article_no, item.clause_no, item.item_no)
        if key not in best or item.score > best[key].score:
            best[key] = item
    merged = list(best.values())
    merged.sort(key=lambda r: r.score, reverse=True)
    return merged


def _normalize_term_key(term: str) -> str:
    return normalize_query_text((term or "").strip())


def _search_terms(
    index: LegalSearchIndex,
    terms: list[str],
    *,
    language: str | None,
    limit: int,
    max_terms: int = _MAX_TERMS_PER_STAGE,
    filters: SearchFilters | None = None,
) -> list[SearchResult]:
    results: list[SearchResult] = []
    seen_terms: set[str] = set()
    for term in terms:
        if len(seen_terms) >= max_terms:
            break
        normalized = (term or "").strip()
        if not normalized:
            continue
        term_key = _normalize_term_key(normalized)
        if term_key in seen_terms:
            continue
        seen_terms.add(term_key)

        if len(_dedupe_results(results)) >= limit:
            break

        hits = index.search(query=normalized, limit=limit, language=language, filters=filters)
        results.extend(hits)
        results = _dedupe_results(results)[:limit]
    return results


def looks_like_vietnamese_legal_reference(question: str | None) -> bool:
    text = (question or "").strip()
    if not text:
        return False
    if _DOCUMENT_NUMBER_RE.search(text):
        return True
    return _VIETNAMESE_LEGAL_MARKERS_RE.search(text) is not None


def should_search_original_question(language: str | None, question: str | None = None) -> bool:
    """Vietnamese queries may fall back to the raw question; other languages should not.

    Scanning an 100k-chunk Vietnamese corpus with Korean/English text is almost never
    useful and costs tens of seconds on VPS hardware. Exception: the question itself
    contains Vietnamese legal references (document numbers, Điều/Luật markers).
    """
    if (language or "").strip().lower() in {"", "vi"}:
        return True
    return looks_like_vietnamese_legal_reference(question)


def _primary_search_stage(stage_hits: dict[str, list[SearchResult]]) -> str:
    """Pick the stage that produced the highest-scoring result."""
    best_stage = "none"
    best_score = -1.0
    for stage, hits in stage_hits.items():
        if not hits:
            continue
        top = max(item.score for item in hits)
        if top > best_score:
            best_score = top
            best_stage = stage
    return best_stage


def search_with_fallback(
    index: LegalSearchIndex,
    *,
    question: str,
    language: str | None,
    translated_terms: list[str],
    limit: int,
    allow_original_question: bool | None = None,
    service_type: str | None = None,
) -> tuple[list[SearchResult], dict]:
    """Run ontology, translated-term, and (vi-only) original-question stages; merge hits."""
    legal_areas = resolve_legal_areas_for_service(service_type)
    if legal_areas and not index_has_legal_area_metadata(index.documents):
        legal_areas = None
    area_filters: SearchFilters | None = (
        SearchFilters(legal_areas=legal_areas) if legal_areas else None
    )

    stages_attempted: list[str] = []
    stage_hits: dict[str, list[SearchResult]] = {}
    search_queries: list[str] = []
    searched_term_keys: set[str] = set()
    allow_original = (
        should_search_original_question(language, question)
        if allow_original_question is None
        else allow_original_question
    )

    partial_terms = extract_partial_ontology_matches(question)
    if partial_terms:
        stages_attempted.append("ontology_partial")
        stage_hits["ontology_partial"] = _search_terms(
            index,
            partial_terms,
            language=language,
            limit=limit,
            filters=area_filters,
        )
        search_queries.extend(partial_terms)
        searched_term_keys.update(_normalize_term_key(t) for t in partial_terms)

    translation_terms = [
        term
        for term in translated_terms
        if _normalize_term_key(term) not in searched_term_keys
    ]
    if translation_terms:
        stages_attempted.append("translated_terms")
        stage_hits["translated_terms"] = _search_terms(
            index,
            translation_terms,
            language=language,
            limit=limit,
            filters=area_filters,
        )
        search_queries.extend(translation_terms)

    merged = _dedupe_results(
        [hit for hits in stage_hits.values() for hit in hits]
    )[:limit]

    if merged:
        return merged, {
            "search_stage": _primary_search_stage(stage_hits),
            "search_queries": search_queries,
            "search_stages_attempted": stages_attempted,
            "legal_area_filter": list(legal_areas) if legal_areas else None,
        }

    if allow_original:
        stages_attempted.append("original_question")
        results = index.search(
            query=question,
            limit=limit,
            language=language,
            filters=area_filters,
        )
        return results[:limit], {
            "search_stage": "original_question",
            "search_queries": [question],
            "search_stages_attempted": stages_attempted,
            "legal_area_filter": list(legal_areas) if legal_areas else None,
        }

    return [], {
        "search_stage": "none",
        "search_queries": [],
        "search_stages_attempted": stages_attempted,
        "legal_area_filter": list(legal_areas) if legal_areas else None,
    }
