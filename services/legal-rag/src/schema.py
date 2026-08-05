"""
Canonical Schema 공유 정의.

docs/Schema.md의 설계를 실제 코드로 구현한 것. 모든 파이프라인 단계
(normalize/deduplicate/parse/relations)가 이 모듈의 dataclass를 공통으로 사용해
필드 불일치를 방지한다.

⚠️ 이번 단계에서 PostgreSQL 적재는 하지 않는다. 이 모듈은 순수 Python
   dataclass/enum이며 어떤 DB에도 연결하지 않는다.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime, date, timezone
from enum import Enum


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class SourceDataset(str, Enum):
    TMQUAN_VBPL_VN = "tmquan_vbpl_vn"
    TH1NHNG0_METADATA = "th1nhng0_vietnamese_legal"
    TH1NHNG0_LEGACY = "th1nhng0_legacy"


class DocumentStatus(str, Enum):
    ACTIVE = "active"
    PARTIALLY_EXPIRED = "partially_expired"
    FULLY_EXPIRED = "fully_expired"
    AMENDED = "amended"
    REPLACED = "replaced"
    SUSPENDED = "suspended"
    UNKNOWN = "unknown"


class RelationType(str, Enum):
    AMENDS = "amends"
    REPEALS = "repeals"
    REPLACES = "replaces"
    SUPERSEDES = "supersedes"
    REFERENCES = "references"
    IMPLEMENTS = "implements"
    UNKNOWN = "unknown"


class ChunkLevel(str, Enum):
    PHAN = "phan"
    CHUONG = "chuong"
    MUC = "muc"
    DIEU = "dieu"
    KHOAN = "khoan"
    DIEM = "diem"


# ---------------------------------------------------------------------------
# Canonical Document Schema (docs/Schema.md 1장 — originalText/normalizedText/
# searchText로 필드가 갱신됨, STEP1-1 지시사항 기준)
# ---------------------------------------------------------------------------


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
    status: str                    # DocumentStatus 값
    rawStatus: str | None
    originalText: str | None       # 원본 그대로(HTML 또는 원본 마크다운), 절대 가공하지 않음
    normalizedText: str | None     # NFC 정규화 + 스캐폴딩 제거된 본문
    searchText: str | None         # FTS/trigram 검색용 (소문자, 공백 정리, simple config 대상)
    contentHash: str | None        # normalizedText의 SHA-256
    importedAt: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class LegalChunk:
    chunkId: str
    documentId: str
    level: str                      # ChunkLevel 값
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
    relationType: str               # RelationType 값
    rawRelationLabel: str | None
    sourceDataset: str
    confidence: float | None = None

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class InternalRelation:
    """
    문서 내부 참조 관계 (예: "quy định tại Khoản 2 Điều này").
    cross-document RelationshipEdge와 별도로 관리 — STEP1-1 지시사항의
    "Internal Relation도 별도 생성" 요구사항 구현.
    """

    edgeId: str
    documentId: str
    sourceChunkId: str
    targetChunkId: str | None       # 대상 chunk를 특정할 수 없으면 None (targetRawRef만 보존)
    targetRawRef: str               # 원문 참조 표현 그대로 (예: "Khoản 2 Điều này")
    relationType: str = "references"

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class EffectiveScope:
    """
    부분 실효(article/khoản/điểm 단위 효력 상태)를 지원하기 위한 스키마.
    STEP1-1 지시사항의 legal_effective_scopes 설계를 구현.

    현재 소스 데이터(th1nhng0 relationships)는 문서 단위 관계만 제공하므로,
    article 단위 부분실효는 명시적으로 감지되지 않는 한 문서 전체 범위
    (article_no=None)로 생성된다 — 이 한계는 src/effective_scopes.py의
    docstring에 명시했다.
    """

    document_id: str
    article_no: str | None          # None이면 문서 전체 범위
    clause_no: str | None
    item_no: str | None
    status: str                     # DocumentStatus 값
    effective_from: str | None      # ISO date
    effective_to: str | None        # ISO date, None이면 현재까지 유효
    source_relation_id: str | None  # 이 scope 변경의 근거가 된 RelationshipEdge.edgeId

    def to_dict(self) -> dict:
        return asdict(self)
