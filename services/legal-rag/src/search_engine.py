"""
Legal Search Engine — 실제 실행 가능한 구현.

통합 순서 (STEP3 지시사항 그대로): Exact Search → Keyword Search → Filter → Ranking
Ranking은 단순 점수(Exact 우선, Keyword 다음)만 구현한다. RRF는 이번 단계에서
구현하지 않는다.

⚠️ 어떤 PostgreSQL/Supabase에도 연결하지 않는다. `LegalSearchIndex`는 순수
   in-memory 구조이며, 데이터는 (1) 테스트용 합성 데이터를 직접 넘기거나
   (2) STEP1-1 파이프라인이 만든 로컬 JSONL(`data/normalized/*.jsonl`)을
   `load_from_pipeline_jsonl()`로 변환해 불러온다 — 이는 실제 Hugging Face 데이터
   다운로드나 DB 적재가 아니라, 로컬 파일 → 메모리 로드일 뿐이다.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

from .query_normalizer import LegalQueryNormalizer
from .result_localizer import LocalizedSearchResult, localize_results
from .search_exact import search_exact
from .search_filters import apply_filters, filter_documents
from .search_keyword import search_canonical_concept, search_keyword, search_title_only_documents
from .search_models import (
    Chunk,
    Document,
    SearchFilters,
    SearchResult,
    parse_locators_from_path,
    result_from_chunk,
    result_from_document,
)
from .utils import build_search_text

logger = logging.getLogger("legal_rag.search_engine")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# 다국어 검색어 정규화기 — 모듈 싱글턴(요청마다 새로 만들지 않음). Exact/Keyword/
# Filter/Ranking 로직 자체에는 관여하지 않고, search() 진입 시 질의 문자열을
# canonical_vi(또는 원문)로 변환하는 전처리 단계로만 사용된다.
_QUERY_NORMALIZER = LegalQueryNormalizer()


# ---------------------------------------------------------------------------
# STEP1-1 Pipeline JSONL(camelCase, src/schema.py) -> STEP2/STEP3 SQL 스타일(snake_case)
# 변환 로더. 기존 STEP1-1 파일(normalize_documents.py 등)은 수정하지 않는다.
# ---------------------------------------------------------------------------


def _load_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def _canonical_document_to_row(d: dict) -> dict:
    return {
        "document_id": d["documentId"],
        "document_number": d.get("documentNumber") or [],
        "document_type": d.get("documentType"),
        "title": d.get("title"),
        "issuing_authority": d.get("issuingAuthority"),
        "issue_date": d.get("issueDate"),
        "effective_date": d.get("effectiveDate"),
        "expiry_date": d.get("expiryDate"),
        "status": d.get("status") or "unknown",
        "official_url": d.get("officialUrl"),
        "content_hash": d.get("contentHash"),
    }


def _legal_chunk_to_row(c: dict) -> dict:
    locators = parse_locators_from_path(c.get("path", ""))
    text = c.get("text") or ""
    return {
        "chunk_id": c["chunkId"],
        "document_id": c["documentId"],
        "chapter_no": locators["chapter_no"],
        "article_no": locators["article_no"],
        "clause_no": locators["clause_no"],
        "item_no": locators["item_no"],
        "heading": c.get("breadcrumbTitle") or c.get("path"),
        "original_text": text,
        # STEP1-1 LegalChunk에는 원본/정규화 본문이 단일 text 필드로만 존재한다
        # (이미 normalize_documents.py 단계에서 정규화된 상태). 따라서
        # original_text와 normalized_text는 같은 값을 공유한다 — 완전히 별도인
        # "가공 전 원본"을 chunk 단위로 보존하려면 parse_legal_structure.py 자체를
        # 수정해야 하며, 이는 STEP3 범위 밖이다(알려진 한계, README에 명시).
        "normalized_text": text,
        "search_text": build_search_text(text),
        "status": c.get("status"),
        "official_url": None,  # 아래 load_from_pipeline_jsonl()에서 문서의 official_url로 보강
        "content_hash": None,
    }


def load_from_pipeline_jsonl(
    documents_path: Path, chunks_path: Path, relationships_path: Path | None = None
) -> tuple[list[Document], list[Chunk], list[dict]]:
    """
    STEP1-1 파이프라인 산출물(`data/normalized/documents_deduped.jsonl`,
    `chunks.jsonl`, `relationships.jsonl`)을 읽어 Document/Chunk 객체와 관계
    리스트로 변환한다. 파일이 없으면 빈 리스트를 반환한다(에러로 죽지 않음 —
    실 데이터가 아직 없는 게 정상 상태이기 때문).
    """
    doc_rows = [_canonical_document_to_row(d) for d in _load_jsonl(documents_path)]
    documents = [Document.from_dict(r) for r in doc_rows]
    documents_by_id = {d.document_id: d for d in documents}

    chunk_rows = []
    for c in _load_jsonl(chunks_path):
        row = _legal_chunk_to_row(c)
        doc = documents_by_id.get(row["document_id"])
        if doc:
            row["official_url"] = doc.official_url
        chunk_rows.append(row)
    chunks = [Chunk.from_dict(r) for r in chunk_rows]

    relations = _load_jsonl(relationships_path) if relationships_path else []

    return documents, chunks, relations


# ---------------------------------------------------------------------------
# LegalSearchIndex — Exact -> Keyword -> Filter -> Ranking 통합
# ---------------------------------------------------------------------------


class LegalSearchIndex:
    def __init__(
        self, documents: list[Document], chunks: list[Chunk], relations: list[dict] | None = None
    ):
        self.documents = documents
        self.chunks = chunks
        self.relations = relations or []
        self.documents_by_id: dict[str, Document] = {d.document_id: d for d in documents}

    @classmethod
    def from_dicts(
        cls, documents: list[dict], chunks: list[dict], relations: list[dict] | None = None
    ) -> "LegalSearchIndex":
        return cls(
            [Document.from_dict(d) for d in documents],
            [Chunk.from_dict(c) for c in chunks],
            relations,
        )

    @classmethod
    def from_pipeline_jsonl(
        cls, documents_path: Path, chunks_path: Path, relationships_path: Path | None = None
    ) -> "LegalSearchIndex":
        documents, chunks, relations = load_from_pipeline_jsonl(documents_path, chunks_path, relationships_path)
        return cls(documents, chunks, relations)

    def _dedupe_keep_best(self, results: list[SearchResult]) -> list[SearchResult]:
        """
        같은 (document_id, article_no, clause_no, item_no) 조합이 exact와 keyword
        양쪽에서 매치된 경우, 점수가 더 높은 쪽(항상 exact)만 남긴다.
        """
        best: dict[tuple, SearchResult] = {}
        for r in results:
            key = (r.document_id, r.article_no, r.clause_no, r.item_no)
            if key not in best or r.score > best[key].score:
                best[key] = r
        return list(best.values())

    def search(
        self,
        query: str | None = None,
        filters: SearchFilters | None = None,
        limit: int = 20,
        language: str | None = None,
    ) -> list[SearchResult]:
        """Exact -> Keyword -> Filter -> Ranking 순서로 실행.

        language(선택, 기본값 None — 기존 호출 방식과 100% 호환)가 주어지면
        검색 직전에 LegalQueryNormalizer로 다국어 법률 용어 사전 정규화를 1회
        수행해 query를 canonical_vi(또는 원문)로 바꾼 뒤, 아래의 기존 Exact/
        Keyword/Filter/Ranking 로직에는 그 결과 문자열만 그대로 전달한다 — 검색
        로직 자체는 전혀 변경하지 않는다. 사전에 없는 질의(대부분의 베트남어
        원문 질의 포함)는 원문 그대로 전달되므로 기존 검색 결과와 동일하다.
        """
        results: list[SearchResult] = []

        if query:
            normalization = _QUERY_NORMALIZER.normalize(query, language)
            normalized_query = normalization.canonical_query

            concept_hits: list[SearchResult] = []
            if normalization.matched_concept:
                # [STEP3-2] 다국어 질의가 법률 용어 사전의 canonical_vi로 정규화된
                # 경우에만 Concept Match를 시도한다 — canonical_vi 문구가 문서
                # 제목/조문 heading에 연속 문자열로 정확히 있어야만 인정됨.
                concept_hits = search_canonical_concept(
                    normalized_query, self.documents, self.chunks, self.documents_by_id
                )

            exact_hits = search_exact(normalized_query, self.documents, self.chunks, self.documents_by_id)
            keyword_hits = search_keyword(normalized_query, self.chunks, self.documents_by_id)
            title_only_hits = search_title_only_documents(
                normalized_query, self.documents, self.chunks
            )
            results = self._dedupe_keep_best(
                concept_hits + exact_hits + keyword_hits + title_only_hits
            )
        elif filters and not filters.is_empty():
            if filters.article_no is not None:
                # article_no는 chunk 단위 개념이므로 문서가 아니라 chunk를 기준으로 browse.
                # 여기서는 아직 필터를 적용하지 않은 전체 chunk 목록만 만들고,
                # 실제 필터링은 아래 공통 apply_filters 단계에서 수행한다.
                results = [
                    result_from_chunk(c, self.documents_by_id.get(c.document_id), 0.0, _BrowseMatchTypeShim())
                    for c in self.chunks
                ]
            else:
                # 문서 단위 browse는 filter_documents가 필터링까지 전부 수행한다
                docs = filter_documents(self.documents, filters, self.relations)
                results = [result_from_document(d, score=0.0, match_type=_BrowseMatchTypeShim()) for d in docs]
                filters = None  # 이미 적용 완료 — 아래 공통 단계에서 중복 적용하지 않음
        else:
            return []

        if filters and not filters.is_empty():
            results = apply_filters(results, filters, self.documents_by_id, self.relations)

        # Ranking: 단순 점수 내림차순 (Exact가 항상 Keyword보다 높은 고정 점수를
        # 가지므로 이 정렬만으로 "Exact 우선, Keyword 다음"이 자연히 만족된다)
        results.sort(key=lambda r: r.score, reverse=True)

        return results[:limit] if limit else results

    def search_localized(
        self,
        query: str | None = None,
        filters: SearchFilters | None = None,
        limit: int = 20,
        language: str | None = None,
    ) -> list[LocalizedSearchResult]:
        """[STEP4] search()를 그대로 호출한 뒤(Search Algorithm/Ranking/MatchType/
        Score는 전혀 관여하지 않음), 반환 직전에만 result_localizer.py로 표시용
        라벨을 추가한다 — "반환 직전에만 최소 연결"(STEP4 지시사항) 원칙을 지키기
        위해 새 메서드로 분리했으며, 기존 search()의 시그니처·동작은 무변경이다."""
        results = self.search(query=query, filters=filters, limit=limit, language=language)
        return localize_results(results, language, self.documents_by_id)


class _BrowseMatchTypeShim:
    """browse 모드(필터만 있는 검색)의 match_type 표시용 — MatchType enum에는
    'filter_only'가 없으므로 문자열 값을 직접 갖는 최소 shim을 사용한다."""

    value = "filter_only"


# ---------------------------------------------------------------------------
# CLI (search_cli.py에서 재사용)
# ---------------------------------------------------------------------------


def build_index_from_args(args: argparse.Namespace) -> LegalSearchIndex:
    documents_path = Path(args.data_dir) / "documents_deduped.jsonl"
    chunks_path = Path(args.data_dir) / "chunks.jsonl"
    relationships_path = Path(args.data_dir) / "relationships.jsonl"

    if not documents_path.exists() or not chunks_path.exists():
        logger.warning(
            "파이프라인 산출물을 찾지 못했습니다(%s). 빈 인덱스로 시작합니다 — "
            "STEP1-1 파이프라인(normalize_documents.py 등)을 먼저 실행하세요.",
            args.data_dir,
        )
        return LegalSearchIndex([], [], [])

    return LegalSearchIndex.from_pipeline_jsonl(documents_path, chunks_path, relationships_path)
