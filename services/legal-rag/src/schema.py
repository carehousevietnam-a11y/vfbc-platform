"""
Canonical Schema 공유 정의.

docs/Schema.md 및 STEP1-Schema-V2-Design.md 설계를 코드로 구현한다.
모든 파이프라인 단계(normalize/deduplicate/parse/relations)가 이 모듈의
dataclass를 공통으로 사용해 필드 불일치를 방지한다.

⚠️ 이번 단계에서 PostgreSQL 적재는 하지 않는다.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from enum import Enum


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class SourceDataset(str, Enum):
    TMQUAN_VBPL_VN = "tmquan_vbpl_vn"
    TH1NHNG0_METADATA = "th1nhng0_vietnamese_legal"
    TH1NHNG0_LEGACY = "th1nhng0_legacy"


class DocumentStatus(str, Enum):
    """V2 status enum (7 values). not_yet_effective is derived from effectiveDate."""

    ACTIVE = "active"
    NOT_YET_EFFECTIVE = "not_yet_effective"
    AMENDED = "amended"
    SUPERSEDED = "superseded"
    REPEALED = "repealed"
    SUSPENDED = "suspended"
    UNKNOWN = "unknown"


class RelationType(str, Enum):
    """V2 relation types (12 values). unknown is separate from related_to."""

    IMPLEMENTS = "implements"
    IMPLEMENTED_BY = "implemented_by"
    AMENDS = "amends"
    AMENDED_BY = "amended_by"
    SUPERSEDES = "supersedes"
    SUPERSEDED_BY = "superseded_by"
    REPEALS = "repeals"
    REPEALED_BY = "repealed_by"
    REFERENCES = "references"
    REFERENCED_BY = "referenced_by"
    RELATED_TO = "related_to"
    UNKNOWN = "unknown"


class ChunkLevel(str, Enum):
    PHAN = "phan"
    CHUONG = "chuong"
    MUC = "muc"
    DIEU = "dieu"
    KHOAN = "khoan"
    DIEM = "diem"


# ---------------------------------------------------------------------------
# Canonical Document Schema (STEP1 Schema V2)
# ---------------------------------------------------------------------------


@dataclass
class RelatedDocumentEntry:
    documentId: str
    relationType: str  # RelationType value

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class CanonicalDocument:
    documentId: str
    sourceDataset: str
    sourceRevision: str
    sourceDocumentId: str
    officialUrl: str | None
    gatewayUrl: str | None
    documentNumber: list[str]
    documentType: str | None
    title: str | None
    issuingAuthority: str | None
    issueDate: str | None          # ISO YYYY-MM-DD
    effectiveDate: str | None      # ISO YYYY-MM-DD
    expiryDate: str | None         # ISO YYYY-MM-DD
    publicationDate: str | None = None
    status: str = DocumentStatus.UNKNOWN.value
    rawStatus: str | None = None
    category: list[str] = field(default_factory=list)
    authorityWeight: int = 30
    language: str = "vi"
    summary: str | None = None
    keywords: list[str] = field(default_factory=list)
    relatedDocuments: list[dict] = field(default_factory=list)  # RelatedDocumentEntry.to_dict()
    supersedes: list[str] = field(default_factory=list)
    supersededBy: list[str] = field(default_factory=list)
    amends: list[str] = field(default_factory=list)
    amendedBy: list[str] = field(default_factory=list)
    originalText: str | None = None
    normalizedText: str | None = None
    searchText: str | None = None
    contentHash: str | None = None
    importedAt: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class LegalChunk:
    chunkId: str
    documentId: str
    level: str
    parentChunkId: str | None
    path: str
    breadcrumbTitle: str
    text: str
    charStart: int
    charEnd: int
    documentNumber: list[str] = field(default_factory=list)
    status: str | None = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class RelationshipEdge:
    edgeId: str
    sourceDocumentId: str
    targetDocumentId: str
    relationType: str
    rawRelationLabel: str | None
    sourceDataset: str
    confidence: float | None = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class InternalRelation:
    edgeId: str
    documentId: str
    sourceChunkId: str
    targetChunkId: str | None
    targetRawRef: str
    relationType: str = "references"

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class EffectiveScope:
    document_id: str
    article_no: str | None
    clause_no: str | None
    item_no: str | None
    status: str
    effective_from: str | None
    effective_to: str | None
    source_relation_id: str | None

    def to_dict(self) -> dict:
        return asdict(self)
