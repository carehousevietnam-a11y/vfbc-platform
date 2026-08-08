"""Evidence strength classification for 3-tier answer policy."""

from __future__ import annotations

from .search_models import MatchType, SearchResult

ANSWER_TIER_DIRECT = "direct"
ANSWER_TIER_RELATED = "related"
ANSWER_TIER_EXPERT_REFERRAL = "expert_referral"

# Conservative initial thresholds — tune after Linda review of score distribution.
DIRECT_MIN_SCORE = 50.0
RELATED_MIN_SCORE = 10.0

_DIRECT_MATCH_TYPES = {
    MatchType.EXACT_DOCUMENT_NUMBER,
    MatchType.EXACT_DOCUMENT_ID,
    MatchType.EXACT_URL,
    MatchType.EXACT_ARTICLE,
    MatchType.CANONICAL_CONCEPT,
    MatchType.KEYWORD_PHRASE,
    MatchType.KEYWORD_PREFIX,
    MatchType.KEYWORD_SUBSTRING,
}


def classify_answer_tier(search_results: list[SearchResult]) -> str:
    """Map search hits to direct / related / expert_referral tiers."""
    if not search_results:
        return ANSWER_TIER_EXPERT_REFERRAL

    top = max(search_results, key=lambda item: item.score)
    if top.score >= DIRECT_MIN_SCORE and top.match_type in _DIRECT_MATCH_TYPES:
        return ANSWER_TIER_DIRECT
    if top.score >= RELATED_MIN_SCORE:
        return ANSWER_TIER_RELATED
    return ANSWER_TIER_EXPERT_REFERRAL
