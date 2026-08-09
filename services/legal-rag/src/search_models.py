"""
Legal Search Engine 데이터 모델 — 실제 실행 가능한 구현.

이 모듈의 필드명은 STEP2에서 확정한 SQL 스키마(sql/create_schema.sql)의 컬럼명을
그대로 따른다(예: `document_id`, `article_no`, `official_url`) — src/schema.py의
CanonicalDocument/LegalChunk(camelCase, STEP1 Pipeline 산출물)와는 명명 규칙이
다르다는 점에 주의. 두 표현 사이의 변환은 search_engine.py의
`load_from_pipeline_jsonl()`이 담당한다.

⚠️ 이 모듈은 어떤 DB에도 연결하지 않는다. `Document`/`Chunk`는 legal_documents/
   legal_chunks 테이블의 "행 하나"를 흉내 낸 순수 Python dataclass일 뿐이다.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date
from enum import Enum


# ---------------------------------------------------------------------------
# Match type (STEP3 지시사항: score, match_type을 검색 결과에 반드시 포함)
# ---------------------------------------------------------------------------


class MatchType(str, Enum):
    EXACT_DOCUMENT_NUMBER = "exact_document_number"
    EXACT_ARTICLE = "exact_article"
    EXACT_URL = "exact_url"
    EXACT_DOCUMENT_ID = "exact_document_id"
    CANONICAL_CONCEPT = "canonical_concept"  # [STEP3-2 신규] canonical_vi 전체 문구가
    # 문서 제목/조문 heading에 연속 문자열로 정확히 존재하는 경우 (단어 흩어짐 불인정)
    KEYWORD_PHRASE = "keyword_phrase"
    KEYWORD_PREFIX = "keyword_prefix"
    KEYWORD_SUBSTRING = "keyword_substring"
    KEYWORD_ALL_TERMS = "keyword_all_terms"  # [STEP3-2 신규] 다중 키워드가 텍스트 여기저기에
    # 흩어져서(비연속) 전부 존재하는 경우 — 이전에는 KEYWORD_PHRASE와 동일 점수였던
    # 버그를 분리해 최하위 우선순위로 내림(STEP3-2 지시사항)


# Ranking 점수 — "단순 점수, Exact 우선 Keyword 다음" (STEP3 지시사항).
# RRF 등 정교한 랭킹은 이번 단계에서 구현하지 않는다.
EXACT_SCORE = {
    MatchType.EXACT_DOCUMENT_NUMBER: 100.0,
    MatchType.EXACT_DOCUMENT_ID: 100.0,
    MatchType.EXACT_URL: 95.0,
    MatchType.EXACT_ARTICLE: 90.0,
}
# [STEP3-2 신규] Canonical Legal Concept Match 점수 — 기존 Exact 계열(90~100)보다
# 낮고 Phrase Match(50)보다 높게 고정(지시사항 예시: 90 또는 95 중 Exact 최저값(90)과
# 겹치지 않도록 85로 설정 — Exact Article(90)과 명확히 구분되어야 하므로).
CANONICAL_CONCEPT_SCORE = 85.0
KEYWORD_BASE_SCORE = {
    MatchType.KEYWORD_PHRASE: 50.0,
    MatchType.KEYWORD_PREFIX: 30.0,
    MatchType.KEYWORD_SUBSTRING: 20.0,
    # [STEP3-2 신규] 다중 키워드가 흩어져서 전부 존재 — Substring(20)보다도 낮은
    # 최하위 우선순위(지시사항: "Phrase와 동일 점수를 주면 안 된다" + "가장 마지막")
    MatchType.KEYWORD_ALL_TERMS: 10.0,
}
# 검색 대상 필드별 가중치 (title에서 매치되면 본문보다 약간 더 관련성 높다고 간주)
FIELD_WEIGHT = {
    "title": 1.5,
    "heading": 1.3,
    "search_text": 1.0,
    "normalized_text": 1.0,
    "original_text": 0.9,
}


# ---------------------------------------------------------------------------
# Document / Chunk (legal_documents / legal_chunks 테이블 행 표현)
# ---------------------------------------------------------------------------


@dataclass
class Document:
    document_id: str                 # legal_documents.internal_id
    document_number: list[str] = field(default_factory=list)
    document_type: str | None = None
    title: str | None = None
    issuing_authority: str | None = None
    issue_date: str | None = None
    effective_date: str | None = None
    expiry_date: str | None = None
    status: str = "unknown"
    official_url: str | None = None
    content_hash: str | None = None
    legal_area: str | None = None
    nganh: str | None = None

    @staticmethod
    def from_dict(d: dict) -> "Document":
        return Document(
            document_id=d["document_id"],
            document_number=list(d.get("document_number") or []),
            document_type=d.get("document_type"),
            title=d.get("title"),
            issuing_authority=d.get("issuing_authority"),
            issue_date=d.get("issue_date"),
            effective_date=d.get("effective_date"),
            expiry_date=d.get("expiry_date"),
            status=d.get("status") or "unknown",
            official_url=d.get("official_url"),
            content_hash=d.get("content_hash"),
            legal_area=d.get("legal_area"),
            nganh=d.get("nganh"),
        )


@dataclass
class Chunk:
    chunk_id: str
    document_id: str
    chapter_no: str | None = None
    article_no: str | None = None
    clause_no: str | None = None
    item_no: str | None = None
    heading: str | None = None
    original_text: str = ""
    normalized_text: str | None = None
    search_text: str | None = None
    status: str | None = None
    official_url: str | None = None
    content_hash: str | None = None
    legal_area: str | None = None

    @staticmethod
    def from_dict(d: dict) -> "Chunk":
        return Chunk(
            chunk_id=d["chunk_id"],
            document_id=d["document_id"],
            chapter_no=d.get("chapter_no"),
            article_no=d.get("article_no"),
            clause_no=d.get("clause_no"),
            item_no=d.get("item_no"),
            heading=d.get("heading"),
            original_text=d.get("original_text") or "",
            normalized_text=d.get("normalized_text"),
            search_text=d.get("search_text"),
            status=d.get("status"),
            official_url=d.get("official_url"),
            content_hash=d.get("content_hash"),
            legal_area=d.get("legal_area"),
        )


# ---------------------------------------------------------------------------
# 검색 결과 (STEP3 지시사항의 "검색 결과 반드시 포함" 목록 그대로)
# ---------------------------------------------------------------------------


@dataclass
class SearchResult:
    document_id: str
    document_number: list[str]
    document_type: str | None
    title: str | None
    article_no: str | None
    clause_no: str | None
    item_no: str | None
    heading: str | None
    status: str | None
    official_url: str | None
    score: float
    match_type: str

    def to_dict(self) -> dict:
        return {
            "document_id": self.document_id,
            "document_number": self.document_number,
            "document_type": self.document_type,
            "title": self.title,
            "article_no": self.article_no,
            "clause_no": self.clause_no,
            "item_no": self.item_no,
            "heading": self.heading,
            "status": self.status,
            "official_url": self.official_url,
            "score": self.score,
            "match_type": self.match_type,
        }


def result_from_chunk(chunk: Chunk, document: Document | None, score: float, match_type: MatchType) -> SearchResult:
    return SearchResult(
        document_id=chunk.document_id,
        document_number=list(document.document_number) if document else [],
        document_type=document.document_type if document else None,
        title=document.title if document else None,
        article_no=chunk.article_no,
        clause_no=chunk.clause_no,
        item_no=chunk.item_no,
        heading=chunk.heading,
        status=chunk.status or (document.status if document else None),
        official_url=chunk.official_url or (document.official_url if document else None),
        score=score,
        match_type=match_type.value,
    )


def result_from_document(document: Document, score: float, match_type: MatchType) -> SearchResult:
    return SearchResult(
        document_id=document.document_id,
        document_number=list(document.document_number),
        document_type=document.document_type,
        title=document.title,
        article_no=None,
        clause_no=None,
        item_no=None,
        heading=None,
        status=document.status,
        official_url=document.official_url,
        score=score,
        match_type=match_type.value,
    )


# ---------------------------------------------------------------------------
# Filters (STEP3 Filter Engine 지원 목록)
# ---------------------------------------------------------------------------


@dataclass
class SearchFilters:
    status: str | None = None
    document_type: str | None = None
    issuing_authority: str | None = None
    effective_date: str | None = None       # 정확히 이 날짜(ISO)와 일치
    effective_date_from: str | None = None  # 범위 검색(둘 다 옵션)
    effective_date_to: str | None = None
    issue_date: str | None = None
    issue_date_from: str | None = None
    issue_date_to: str | None = None
    article_no: str | None = None
    relation_type: str | None = None        # legal_relations.relation_type — 참여 문서만 통과
    legal_areas: tuple[str, ...] | None = None  # vbpl legal_area labels (service-scoped search)
    nganh_areas: tuple[str, ...] | None = None  # th1nhng0 nganh / ministry sector fallback
    hybrid_scope: bool = False  # tiered legal_area + nganh inclusion (see search_filters)

    def is_empty(self) -> bool:
        return all(
            v is None
            for v in (
                self.status, self.document_type, self.issuing_authority,
                self.effective_date, self.effective_date_from, self.effective_date_to,
                self.issue_date, self.issue_date_from, self.issue_date_to,
                self.article_no, self.relation_type, self.legal_areas,
                self.nganh_areas,
            )
        ) and not self.hybrid_scope


# ---------------------------------------------------------------------------
# 조번호(Chương/Điều/Khoản/Điểm) 경로 파싱 — Pipeline JSONL(breadcrumb path)을
# legal_chunks의 chapter_no/article_no/clause_no/item_no 컬럼으로 변환할 때 사용.
# (src/parse_legal_structure.py의 정규식과 동일한 패턴이나, 기존 STEP1-1 파일을
#  수정하지 않기 위해 이 모듈 안에 독립적으로 둔다 — "services/legal-rag 내부만
#  수정" 원칙은 지키되 승인된 이전 단계 파일은 건드리지 않는다는 판단.)
# ---------------------------------------------------------------------------

_CHUONG_NO_RE = re.compile(r"Chương\s+([IVXLCDM\d]+)", re.IGNORECASE)
_DIEU_NO_RE = re.compile(r"Điều\s+(\d+)", re.IGNORECASE)
_KHOAN_NO_RE = re.compile(r"Khoản\s+(\d+)", re.IGNORECASE)
_DIEM_NO_RE = re.compile(r"Điểm\s+([a-zđ])", re.IGNORECASE)


def parse_locators_from_path(path: str) -> dict[str, str | None]:
    """chunk의 breadcrumb path(예: "Chương I > Điều 9 > Khoản 2")에서 조번호 추출."""
    if not path:
        return {"chapter_no": None, "article_no": None, "clause_no": None, "item_no": None}
    chuong_m = _CHUONG_NO_RE.search(path)
    dieu_m = _DIEU_NO_RE.search(path)
    khoan_m = _KHOAN_NO_RE.search(path)
    diem_m = _DIEM_NO_RE.search(path)
    return {
        "chapter_no": chuong_m.group(1) if chuong_m else None,
        "article_no": dieu_m.group(1) if dieu_m else None,
        "clause_no": khoan_m.group(1) if khoan_m else None,
        "item_no": diem_m.group(1) if diem_m else None,
    }


# ---------------------------------------------------------------------------
# 쿼리 문자열에서 "Điều 9 Khoản 2" 형태의 조문 참조를 인식 (search_exact.py에서 사용)
# ---------------------------------------------------------------------------

_ARTICLE_QUERY_RE = re.compile(
    r"Điều\s+(?P<dieu>\d+)"
    r"(?:\s*,?\s*Khoản\s+(?P<khoan>\d+))?"
    r"(?:\s*,?\s*Điểm\s+(?P<diem>[a-zđ]))?",
    re.IGNORECASE,
)


def parse_article_query(query: str) -> dict[str, str | None] | None:
    """자유 텍스트 쿼리에서 "Điều N [Khoản M [Điểm x]]" 패턴을 인식."""
    m = _ARTICLE_QUERY_RE.search(query)
    if not m:
        return None
    return {
        "article_no": m.group("dieu"),
        "clause_no": m.group("khoan"),
        "item_no": m.group("diem"),
    }


def normalize_query_text(text: str) -> str:
    """Unicode NFC 정규화 + 소문자 변환 (Keyword Search 대소문자/유니코드 무시 요구사항)."""
    if not text:
        return ""
    return unicodedata.normalize("NFC", text).lower().strip()
