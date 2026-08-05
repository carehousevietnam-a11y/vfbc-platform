"""Expert-facing Executive Report builder (STEP10).

Transforms STEP9 ExpertReview into a report-oriented JSON contract while
preserving verification, evidence, citation, and confidence detail.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .expert_review_builder import ExpertReview
from .report_sections import ReportMetric, ReportSection

EXPERT_REPORT_SCHEMA_VERSION = "step10-expert-report"


@dataclass
class ExpertReport:
    status: str
    language: str | None
    question: str
    title: str
    sections: list[ReportSection] = field(default_factory=list)
    schema_version: str = EXPERT_REPORT_SCHEMA_VERSION

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "report_type": "expert",
            "status": self.status,
            "language": self.language,
            "question": self.question,
            "title": self.title,
            "sections": [section.to_dict() for section in self.sections],
        }


def build_expert_report(review: ExpertReview) -> ExpertReport:
    """Build the expert report without mutating the STEP9 result."""
    common = review.review
    verification = review.to_dict()["verification"]

    sections = [
        ReportSection("executive_summary", "Executive Summary", content=common.summary),
        ReportSection(
            "case_overview",
            "Case Overview",
            items=[{
                "question": common.question,
                "language": common.language,
                "status": common.status,
                "model": common.model,
                "prompt_metadata": dict(common.prompt_metadata),
            }],
        ),
        ReportSection(
            "verification_metrics",
            "Verification Metrics",
            metrics=[ReportMetric(key, key, value) for key, value in verification.items()],
        ),
        ReportSection(
            "confidence_analysis",
            "Confidence Analysis",
            items=[review.confidence.to_dict()],
        ),
        ReportSection(
            "legal_analysis",
            "Legal Analysis",
            content=common.summary,
            items=[basis.to_dict() for basis in common.legal_basis],
        ),
        ReportSection(
            "citation_summary",
            "Citation Summary",
            items=[citation.to_dict() for citation in review.citations.citations],
        ),
        ReportSection(
            "evidence_summary",
            "Evidence Summary",
            items=[item.to_dict() for item in review.evidence],
        ),
        ReportSection("risk_analysis", "Risk Analysis", items=list(common.risk_factors)),
        ReportSection("required_documents", "Required Documents", items=list(common.required_documents)),
        ReportSection(
            "recommended_actions",
            "Recommended Actions",
            items=["request_expert_review"] if verification["expert_review_required"] else ["proceed_with_review_result"],
        ),
        ReportSection(
            "internal_notes",
            "Internal Notes",
            content=common.expert_review_reason,
            items=list(review.confidence.reasons),
        ),
    ]

    return ExpertReport(
        status=common.status,
        language=common.language,
        question=common.question,
        title="VFBCAI Expert Legal Review",
        sections=sections,
    )
