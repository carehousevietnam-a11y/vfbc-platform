"""VFBCAI Legal Intelligence Platform — Confidence Engine (STEP8).

STEP6 ReviewResult, STEP7 CitationResult, 기존 EvidencePack을 읽어 근거 기반의
결정적(deterministic) confidence score를 계산한다.

이 모듈은 검색 점수, 랭킹, Evidence, Review 또는 Citation을 수정하지 않는다.
모델의 자기평가를 사용하지 않고 이미 존재하는 검증 가능한 신호만 사용한다.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .ai_review_engine import ReviewResult
from .ai_review_models import STATUS_SUCCESS, SUPPORTED_LANGUAGES
from .citation_engine import CitationResult
from .evidence_builder import EvidencePack

CONFIDENCE_SCHEMA_VERSION = "step8"

LEVEL_HIGH = "high"
LEVEL_MEDIUM = "medium"
LEVEL_LOW = "low"
LEVEL_INSUFFICIENT = "insufficient"


@dataclass(frozen=True)
class ConfidenceBreakdown:
    evidence_strength: int
    citation_coverage: int
    source_quality: int
    review_completeness: int

    def to_dict(self) -> dict[str, int]:
        return {
            "evidence_strength": self.evidence_strength,
            "citation_coverage": self.citation_coverage,
            "source_quality": self.source_quality,
            "review_completeness": self.review_completeness,
        }


@dataclass(frozen=True)
class ConfidenceResult:
    score: int
    level: str
    breakdown: ConfidenceBreakdown
    expert_review_required: bool
    reasons: tuple[str, ...]
    evidence_document_count: int
    evidence_article_count: int
    verified_citation_count: int
    schema_version: str = CONFIDENCE_SCHEMA_VERSION

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "score": self.score,
            "level": self.level,
            "breakdown": self.breakdown.to_dict(),
            "expert_review_required": self.expert_review_required,
            "reasons": list(self.reasons),
            "evidence_document_count": self.evidence_document_count,
            "evidence_article_count": self.evidence_article_count,
            "verified_citation_count": self.verified_citation_count,
        }


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _evidence_strength(packs: list[EvidencePack]) -> int:
    if not packs:
        return 0
    average_score = sum(_clamp(pack.top_score, 0.0, 100.0) for pack in packs) / len(packs)
    score_component = 25.0 * (average_score / 100.0)
    article_count = sum(len(pack.articles) for pack in packs)
    breadth_component = 10.0 * min(article_count / 3.0, 1.0)
    return round(score_component + breadth_component)


def _citation_coverage(review: ReviewResult, citations: CitationResult) -> int:
    expected = len(review.legal_basis)
    if expected == 0:
        return 0
    verified = min(len(citations.citations), expected)
    return round(30.0 * verified / expected)


def _source_quality(packs: list[EvidencePack]) -> int:
    if not packs:
        return 0
    total = 0.0
    for pack in packs:
        points = 0.0
        if pack.official_url:
            points += 8.0
        if pack.document_number:
            points += 4.0
        if (pack.status or "").strip().lower() in {"active", "effective", "in_force", "valid"}:
            points += 4.0
        if pack.issuing_authority:
            points += 2.0
        if pack.effective_date:
            points += 2.0
        total += points
    return round(total / len(packs))


def _review_completeness(review: ReviewResult) -> int:
    points = 0
    if review.summary and review.summary.strip():
        points += 5
    if review.risk_factors:
        points += 2
    if review.required_documents:
        points += 2
    if review.language in SUPPORTED_LANGUAGES:
        points += 2
    if review.status == STATUS_SUCCESS:
        points += 4
    return points


def _level(score: int) -> str:
    if score >= 80:
        return LEVEL_HIGH
    if score >= 60:
        return LEVEL_MEDIUM
    if score >= 35:
        return LEVEL_LOW
    return LEVEL_INSUFFICIENT


def calculate_confidence(
    review_result: ReviewResult,
    citation_result: CitationResult,
    evidence_packs: list[EvidencePack],
) -> ConfidenceResult:
    """검증 가능한 기존 신호만으로 confidence 결과를 계산한다."""
    evidence = _evidence_strength(evidence_packs)
    citations = _citation_coverage(review_result, citation_result)
    quality = _source_quality(evidence_packs)
    completeness = _review_completeness(review_result)
    raw_score = evidence + citations + quality + completeness

    # 성공하지 못한 Review가 높은 confidence로 보이지 않도록 안전 상한을 둔다.
    score = min(raw_score, 49) if review_result.status != STATUS_SUCCESS else raw_score
    score = int(_clamp(score, 0, 100))

    reasons: list[str] = []
    if not evidence_packs:
        reasons.append("no_evidence")
    if review_result.legal_basis and not citation_result.citations:
        reasons.append("no_verified_citations")
    elif len(citation_result.citations) < len(review_result.legal_basis):
        reasons.append("partial_citation_coverage")
    if any(not pack.official_url for pack in evidence_packs):
        reasons.append("missing_official_url")
    if review_result.status != STATUS_SUCCESS:
        reasons.append(f"review_status:{review_result.status}")
    if score < 60:
        reasons.append("low_confidence")

    expert_required = review_result.expert_review_required or score < 70
    return ConfidenceResult(
        score=score,
        level=_level(score),
        breakdown=ConfidenceBreakdown(
            evidence_strength=evidence,
            citation_coverage=citations,
            source_quality=quality,
            review_completeness=completeness,
        ),
        expert_review_required=expert_required,
        reasons=tuple(reasons),
        evidence_document_count=len(evidence_packs),
        evidence_article_count=sum(len(pack.articles) for pack in evidence_packs),
        verified_citation_count=len(citation_result.citations),
    )
