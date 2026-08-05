"""VFBCAI Legal Intelligence Platform — Expert Review Builder (STEP9).

동일한 STEP6~8 공통 결과를 전문가/관리자 업무용 Review JSON으로 변환한다.
검증된 citation, confidence 산식, Evidence 원문 메타데이터를 보존하며 입력 객체를
수정하지 않는다.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .ai_review_engine import ReviewResult
from .citation_engine import CitationResult
from .confidence_engine import ConfidenceResult
from .evidence_builder import EvidencePack

EXPERT_REVIEW_SCHEMA_VERSION = "step9-expert"


@dataclass(frozen=True)
class ExpertEvidenceRecord:
    evidence_index: int
    document_id: str
    document_number: tuple[str, ...]
    title: str | None
    issuing_authority: str | None
    effective_date: str | None
    status: str | None
    official_url: str | None
    top_score: float
    top_match_type: str
    search_keywords: tuple[str, ...]
    articles: tuple[dict[str, Any], ...]

    def to_dict(self) -> dict[str, Any]:
        return {
            "evidence_index": self.evidence_index,
            "document_id": self.document_id,
            "document_number": list(self.document_number),
            "title": self.title,
            "issuing_authority": self.issuing_authority,
            "effective_date": self.effective_date,
            "status": self.status,
            "official_url": self.official_url,
            "top_score": self.top_score,
            "top_match_type": self.top_match_type,
            "search_keywords": list(self.search_keywords),
            "articles": [dict(article) for article in self.articles],
        }


@dataclass
class ExpertReview:
    review: ReviewResult
    citations: CitationResult
    confidence: ConfidenceResult
    evidence: list[ExpertEvidenceRecord] = field(default_factory=list)
    schema_version: str = EXPERT_REVIEW_SCHEMA_VERSION

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "audience": "expert",
            "review": self.review.to_dict(),
            "citations": self.citations.to_dict(),
            "confidence": self.confidence.to_dict(),
            "evidence": [item.to_dict() for item in self.evidence],
            "verification": {
                "review_legal_basis_count": len(self.review.legal_basis),
                "verified_citation_count": len(self.citations.citations),
                "evidence_document_count": len(self.evidence),
                "evidence_article_count": sum(
                    len(item.articles) for item in self.evidence
                ),
                "expert_review_required": (
                    self.review.expert_review_required
                    or self.confidence.expert_review_required
                ),
            },
        }


def _evidence_records(packs: list[EvidencePack]) -> list[ExpertEvidenceRecord]:
    records: list[ExpertEvidenceRecord] = []
    for index, pack in enumerate(packs, start=1):
        records.append(
            ExpertEvidenceRecord(
                evidence_index=index,
                document_id=pack.document_id,
                document_number=tuple(pack.document_number),
                title=pack.title,
                issuing_authority=pack.issuing_authority,
                effective_date=pack.effective_date,
                status=pack.status,
                official_url=pack.official_url,
                top_score=pack.top_score,
                top_match_type=pack.top_match_type,
                search_keywords=tuple(pack.search_keywords),
                articles=tuple(article.to_dict() for article in pack.articles),
            )
        )
    return records


def build_expert_review(
    review_result: ReviewResult,
    citation_result: CitationResult,
    confidence_result: ConfidenceResult,
    evidence_packs: list[EvidencePack],
) -> ExpertReview:
    """공통 결과와 Evidence를 전문가용 독립 Review로 묶는다."""
    return ExpertReview(
        review=review_result,
        citations=citation_result,
        confidence=confidence_result,
        evidence=_evidence_records(evidence_packs),
    )
