"""OpenAI-based legal search term extraction for non-Vietnamese queries."""

from __future__ import annotations

import json
import logging
import os
import re
import time
from dataclasses import dataclass
from typing import Any

from .multilingual_legal_terms import list_canonical_vi_terms

logger = logging.getLogger("legal_rag.query_translation")

ENV_TRANSLATION_MODEL = "LEGAL_RAG_TRANSLATION_MODEL"
DEFAULT_TRANSLATION_MODEL = "gpt-4o-mini"

_SYSTEM_PROMPT = (
    "You extract Vietnamese legal search keywords from user questions for a Vietnam legal corpus.\n"
    "Do NOT translate into full sentences. Return short noun phrases that appear in Vietnamese law texts.\n"
    "Prefer terms from the provided standard glossary when applicable.\n"
    "If the question is clearly unrelated to Vietnamese law/administration (weather, sports, chit-chat), "
    'return {"terms": [], "no_legal_terms": true}.\n'
    'Output JSON only: {"terms": ["...", "..."], "no_legal_terms": false}'
)


def _resolve_translation_model(model: str | None) -> str:
    if model:
        return model.strip()
    return (os.environ.get(ENV_TRANSLATION_MODEL) or DEFAULT_TRANSLATION_MODEL).strip()


def _build_user_prompt(question: str) -> str:
    glossary = ", ".join(list_canonical_vi_terms())
    return (
        f"Standard glossary (prefer these when relevant): {glossary}\n\n"
        f"User question:\n{question}\n\n"
        "Return 1-5 Vietnamese legal search terms as JSON."
    )


def _parse_terms(raw_text: str) -> tuple[list[str], bool]:
    cleaned = (raw_text or "").strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE | re.MULTILINE).strip()
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        return [], False
    no_legal_terms = False
    if isinstance(parsed, dict):
        terms = parsed.get("terms")
        no_legal_terms = bool(parsed.get("no_legal_terms"))
    elif isinstance(parsed, list):
        terms = parsed
    else:
        return [], False
    if not isinstance(terms, list):
        return [], no_legal_terms
    result: list[str] = []
    for item in terms:
        if isinstance(item, str) and item.strip():
            result.append(item.strip())
    return result, no_legal_terms


@dataclass(frozen=True)
class QueryTranslationResult:
    skipped: bool
    terms: list[str]
    duration_ms: float | None = None
    error: str | None = None
    no_legal_terms: bool = False


def should_skip_translation(language: str | None) -> bool:
    return (language or "").strip().lower() == "vi"


def translate_query_terms(
    question: str,
    *,
    language: str | None = None,
    api_key: str | None = None,
    model: str | None = None,
    client: Any | None = None,
) -> QueryTranslationResult:
    """Extract Vietnamese legal search terms; skip when language is explicitly vi."""
    if should_skip_translation(language):
        return QueryTranslationResult(skipped=True, terms=[])

    q = (question or "").strip()
    if not q:
        return QueryTranslationResult(skipped=False, terms=[], error="empty_question")

    resolved_model = _resolve_translation_model(model)
    resolved_key = api_key or os.environ.get("OPENAI_API_KEY")
    if not resolved_key:
        return QueryTranslationResult(skipped=False, terms=[], error="missing_api_key")

    started = time.perf_counter()
    if client is None:
        try:
            import openai
        except ImportError:
            return QueryTranslationResult(skipped=False, terms=[], error="openai_not_installed")
        client = openai.OpenAI(api_key=resolved_key)

    try:
        response = client.chat.completions.create(
            model=resolved_model,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": _build_user_prompt(q)},
            ],
            response_format={"type": "json_object"},
        )
        raw = response.choices[0].message.content
        terms, no_legal_terms = _parse_terms(raw or "")
        duration_ms = (time.perf_counter() - started) * 1000.0
        if not terms:
            return QueryTranslationResult(
                skipped=False,
                terms=[],
                duration_ms=duration_ms,
                error="empty_terms",
                no_legal_terms=no_legal_terms,
            )
        return QueryTranslationResult(
            skipped=False,
            terms=terms,
            duration_ms=duration_ms,
            no_legal_terms=no_legal_terms,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("Query translation failed: %s", type(exc).__name__)
        duration_ms = (time.perf_counter() - started) * 1000.0
        return QueryTranslationResult(
            skipped=False,
            terms=[],
            duration_ms=duration_ms,
            error=type(exc).__name__,
        )
