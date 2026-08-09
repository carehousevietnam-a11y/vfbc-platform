"""Evidence strength classification for 3-tier answer policy."""

from __future__ import annotations

from .ai_review_models import STATUS_INSUFFICIENT_EVIDENCE, STATUS_NO_EVIDENCE, STATUS_PARTIAL_EVIDENCE
from .search_models import MatchType, SearchResult

ANSWER_TIER_DIRECT = "direct"
ANSWER_TIER_RELATED = "related"
ANSWER_TIER_EXPERT_REFERRAL = "expert_referral"

# Conservative initial thresholds — tune after Linda review of score distribution.
DIRECT_MIN_SCORE = 50.0
RELATED_MIN_SCORE = 10.0

_DIRECT_MATCH_TYPE_VALUES = {
    MatchType.EXACT_DOCUMENT_NUMBER.value,
    MatchType.EXACT_DOCUMENT_ID.value,
    MatchType.EXACT_URL.value,
    MatchType.EXACT_ARTICLE.value,
    MatchType.CANONICAL_CONCEPT.value,
    MatchType.KEYWORD_PHRASE.value,
    MatchType.KEYWORD_PREFIX.value,
    MatchType.KEYWORD_SUBSTRING.value,
}


def classify_answer_tier(search_results: list[SearchResult]) -> str:
    """Map search hits to direct / related / expert_referral tiers."""
    if not search_results:
        return ANSWER_TIER_EXPERT_REFERRAL

    top = max(search_results, key=lambda item: item.score)
    match_type = top.match_type.value if isinstance(top.match_type, MatchType) else str(top.match_type)
    if top.score >= DIRECT_MIN_SCORE and match_type in _DIRECT_MATCH_TYPE_VALUES:
        return ANSWER_TIER_DIRECT
    if top.score >= RELATED_MIN_SCORE:
        return ANSWER_TIER_RELATED
    return ANSWER_TIER_EXPERT_REFERRAL


def reconcile_answer_tier(
    search_results: list[SearchResult],
    *,
    review_status: str,
    verified_citation_count: int,
) -> str:
    """Align tier metadata with final review/citation outcomes."""
    if not search_results:
        return ANSWER_TIER_EXPERT_REFERRAL
    if review_status in {STATUS_NO_EVIDENCE, STATUS_INSUFFICIENT_EVIDENCE}:
        return ANSWER_TIER_EXPERT_REFERRAL
    if review_status == STATUS_PARTIAL_EVIDENCE:
        return ANSWER_TIER_RELATED
    if verified_citation_count == 0 and review_status != "success":
        return ANSWER_TIER_EXPERT_REFERRAL
    return classify_answer_tier(search_results)
