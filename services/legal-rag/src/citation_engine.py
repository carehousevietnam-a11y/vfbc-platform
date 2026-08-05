"""VFBCAI Legal Intelligence Platform — Citation Engine (STEP7).

STEP6 ``ReviewResult.legal_basis``에 포함된 검증 완료 citation을 기존
``EvidencePack``의 원문 메타데이터와 연결해, API/PDF에서 사용할 수 있는
구조화된 citation record로 변환한다.

이 모듈은 법률 근거를 새로 생성하거나 검색/랭킹을 변경하지 않는다.
문서번호와 조항은 STEP5-3 Connector가 이미 Evidence와 대조해 검증한 값만
입력으로 사용하며, Evidence에서 찾을 수 없는 항목은 결과에 포함하지 않는다.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import re
from typing import Any

from .ai_review_engine import ReviewResult
from .evidence_builder import ArticleReference, EvidencePack

CITATION_SCHEMA_VERSION = "step7"

_LOCATOR_RE = re.compile(
    r"^\s*Điều\s+(?P<article>[^\s]+)"
    r"(?:\s+Khoản\s+(?P<clause>[^\s]+))?"
    r"(?:\s+Điểm\s+(?P<item>[^\s]+))?\s*$",
    re.IGNORECASE,
)


@dataclass(frozen=True)
class CitationRecord:
    """Evidence와 연결된 단일 법적 근거."""

    citation_id: str
    evidence_index: int
    document_id: str
    document_number: str
    title: str | None
    issuing_authority: str | None
    effective_date: str | None
    status: str | None
    official_url: str | None
    article: str | None
    article_no: str | None
    clause_no: str | None
    item_no: str | None
    heading: str | None
    note: str | None

    def to_dict(self) -> dict[str, Any]:
        return {
            "citation_id": self.citation_id,
            "evidence_index": self.evidence_index,
            "document_id": self.document_id,
            "document_number": self.document_number,
            "title": self.title,
            "issuing_authority": self.issuing_authority,
            "effective_date": self.effective_date,
            "status": self.status,
            "official_url": self.official_url,
            "article": self.article,
            "article_no": self.article_no,
            "clause_no": self.clause_no,
            "item_no": self.item_no,
            "heading": self.heading,
            "note": self.note,
        }


@dataclass
class CitationResult:
    """STEP7 citation 서비스의 독립 출력 계약.

    STEP6 Review JSON을 변경하지 않고 별도 객체로 제공한다.
    """

    review_status: str
    question: str
    language: str | None
    citations: list[CitationRecord] = field(default_factory=list)
    source_document_count: int = 0
    source_article_count: int = 0
    schema_version: str = CITATION_SCHEMA_VERSION

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "review_status": self.review_status,
            "question": self.question,
            "language": self.language,
            "citation_count": len(self.citations),
            "source_document_count": self.source_document_count,
            "source_article_count": self.source_article_count,
            "citations": [citation.to_dict() for citation in self.citations],
        }


def _parse_locator(locator: str | None) -> tuple[str | None, str | None, str | None]:
    if not locator:
        return (None, None, None)
    match = _LOCATOR_RE.match(locator)
    if not match:
        return (None, None, None)
    return (match.group("article"), match.group("clause"), match.group("item"))


def _format_locator(article: ArticleReference) -> str | None:
    if article.article_no is None and article.clause_no is None and article.item_no is None:
        return None
    parts: list[str] = []
    if article.article_no is not None:
        parts.append(f"Điều {article.article_no}")
    if article.clause_no is not None:
        parts.append(f"Khoản {article.clause_no}")
    if article.item_no is not None:
        parts.append(f"Điểm {article.item_no}")
    return " ".join(parts) if parts else None


def _find_pack(document_number: str, packs: list[EvidencePack]) -> EvidencePack | None:
    for pack in packs:
        if document_number in pack.document_number:
            return pack
    return None


def _find_article(pack: EvidencePack, locator: str | None) -> ArticleReference | None:
    if locator is None:
        return None
    for article in pack.articles:
        if _format_locator(article) == locator:
            return article
    return None


def build_citations(
    review_result: ReviewResult,
    evidence_packs: list[EvidencePack],
) -> CitationResult:
    """검증된 STEP6 legal basis를 Evidence 메타데이터와 연결한다.

    입력 객체는 읽기 전용으로 취급하며 mutation하지 않는다. 동일한 문서번호,
    조항, note가 반복되면 첫 항목만 유지한다. Citation 순서는 AIReviewResult의
    legal_basis 순서를 그대로 보존한다.
    """
    citations: list[CitationRecord] = []
    seen: set[tuple[str, str | None, str | None]] = set()

    for legal_basis in review_result.legal_basis:
        key = (legal_basis.document_number, legal_basis.article, legal_basis.note)
        if key in seen:
            continue

        pack = _find_pack(legal_basis.document_number, evidence_packs)
        if pack is None:
            # 방어적 처리: STEP5-3에서 검증된 citation이어도 호출자가 다른
            # Evidence 목록을 넘겼다면 근거를 새로 만들지 않고 제외한다.
            continue

        article_ref = _find_article(pack, legal_basis.article)
        article_no, clause_no, item_no = _parse_locator(legal_basis.article)
        if article_ref is not None:
            article_no = article_ref.article_no
            clause_no = article_ref.clause_no
            item_no = article_ref.item_no

        evidence_index = evidence_packs.index(pack) + 1
        citation_id = f"CIT-{len(citations) + 1:03d}"
        citations.append(
            CitationRecord(
                citation_id=citation_id,
                evidence_index=evidence_index,
                document_id=pack.document_id,
                document_number=legal_basis.document_number,
                title=pack.title,
                issuing_authority=pack.issuing_authority,
                effective_date=pack.effective_date,
                status=pack.status,
                official_url=pack.official_url,
                article=legal_basis.article,
                article_no=article_no,
                clause_no=clause_no,
                item_no=item_no,
                heading=article_ref.heading if article_ref else None,
                note=legal_basis.note,
            )
        )
        seen.add(key)

    return CitationResult(
        review_status=review_result.status,
        question=review_result.question,
        language=review_result.language,
        citations=citations,
        source_document_count=review_result.source_document_count,
        source_article_count=review_result.source_article_count,
    )
