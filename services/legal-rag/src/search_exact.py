"""
Exact Search — 실제 실행 가능한 구현.

지원 범위 (STEP3 지시사항):
    - 법령번호 (예: 152/2020/NĐ-CP, 47/2014/QH13)
    - 조문 (Điều/Khoản/Điểm)
    - 공식 URL
    - Document ID

⚠️ DB에 연결하지 않는다. `documents: list[Document]`, `chunks: list[Chunk]`를
   인자로 받아 순수 Python으로 검색한다(STEP2 legal_documents/legal_chunks 테이블의
   행을 흉내 낸 in-memory 데이터).
"""

from __future__ import annotations

import re

from .search_models import (
    Chunk,
    Document,
    MatchType,
    EXACT_SCORE,
    SearchResult,
    parse_article_query,
    result_from_chunk,
    result_from_document,
)
from .utils import normalize_document_number

# 법령번호처럼 보이는지 판정하는 패턴 (audit_datasets.py의 문서번호 형식 검사와 동일한 발상:
# 숫자/문자 뒤에 '/' 또는 '-'가 오는 형태). "Không số"도 유효한 번호로 인정.
_DOC_NUMBER_LIKE_RE = re.compile(r"^[\w\d]+[/-][\w\d/\-]+$", re.UNICODE)


def _norm(s: str | None) -> str:
    return (s or "").strip().lower()


# ---------------------------------------------------------------------------
# 개별 매처
# ---------------------------------------------------------------------------


def search_by_document_number(documents: list[Document], query: str) -> list[SearchResult]:
    """법령번호 정확 매치. src/utils.py의 정규화 로직을 그대로 재사용해 표기 변주를 흡수."""
    candidates = normalize_document_number(query)
    if not candidates:
        return []
    query_norm = {_norm(c) for c in candidates}

    results = []
    for doc in documents:
        doc_numbers_norm = {_norm(n) for n in doc.document_number}
        if query_norm & doc_numbers_norm:
            results.append(
                result_from_document(doc, EXACT_SCORE[MatchType.EXACT_DOCUMENT_NUMBER], MatchType.EXACT_DOCUMENT_NUMBER)
            )
    return results


def search_by_document_id(documents: list[Document], query: str) -> list[SearchResult]:
    query_norm = _norm(query)
    return [
        result_from_document(doc, EXACT_SCORE[MatchType.EXACT_DOCUMENT_ID], MatchType.EXACT_DOCUMENT_ID)
        for doc in documents
        if _norm(doc.document_id) == query_norm
    ]


def search_by_official_url(
    documents: list[Document], chunks: list[Chunk], documents_by_id: dict[str, Document], query: str
) -> list[SearchResult]:
    query_norm = _norm(query)
    results = []
    for doc in documents:
        if _norm(doc.official_url) == query_norm and doc.official_url:
            results.append(result_from_document(doc, EXACT_SCORE[MatchType.EXACT_URL], MatchType.EXACT_URL))
    for chunk in chunks:
        if chunk.official_url and _norm(chunk.official_url) == query_norm:
            doc = documents_by_id.get(chunk.document_id)
            results.append(result_from_chunk(chunk, doc, EXACT_SCORE[MatchType.EXACT_URL], MatchType.EXACT_URL))
    return results


def search_by_article(
    chunks: list[Chunk],
    documents_by_id: dict[str, Document],
    article_no: str | None,
    clause_no: str | None = None,
    item_no: str | None = None,
    document_id: str | None = None,
    document_number: str | None = None,
) -> list[SearchResult]:
    """
    조문(Điều/Khoản/Điểm) 정확 검색. document_id 또는 document_number 중 하나로
    문서를 특정할 수 있으면 함께 좁혀 검색한다(둘 다 없으면 전체 문서 대상으로 검색).
    """
    if article_no is None:
        return []

    target_doc_ids: set[str] | None = None
    if document_id:
        target_doc_ids = {document_id}
    elif document_number:
        norm_query = {_norm(c) for c in normalize_document_number(document_number)}
        target_doc_ids = {
            d.document_id for d in documents_by_id.values()
            if {_norm(n) for n in d.document_number} & norm_query
        }

    results = []
    for chunk in chunks:
        if target_doc_ids is not None and chunk.document_id not in target_doc_ids:
            continue
        if _norm(chunk.article_no) != _norm(article_no):
            continue
        if clause_no is not None and _norm(chunk.clause_no) != _norm(clause_no):
            continue
        if item_no is not None and _norm(chunk.item_no) != _norm(item_no):
            continue
        doc = documents_by_id.get(chunk.document_id)
        results.append(
            result_from_chunk(chunk, doc, EXACT_SCORE[MatchType.EXACT_ARTICLE], MatchType.EXACT_ARTICLE)
        )
    return results


# ---------------------------------------------------------------------------
# 통합 진입점 — 쿼리 문자열 하나로 어떤 종류의 exact 매치인지 자동 판별
# ---------------------------------------------------------------------------


def search_exact(
    query: str,
    documents: list[Document],
    chunks: list[Chunk],
    documents_by_id: dict[str, Document] | None = None,
) -> list[SearchResult]:
    """
    쿼리 문자열을 보고 가능한 모든 exact 매치 유형을 시도해 결과를 합친다
    (URL/법령번호/조문/Document ID 중 실제로 매치되는 것만 반환됨 — 여러 유형이
    동시에 매치될 수도 있으며 이는 정상이다. 최종 dedupe/ranking은 search_engine.py 담당).
    """
    if documents_by_id is None:
        documents_by_id = {d.document_id: d for d in documents}

    query = (query or "").strip()
    if not query:
        return []

    results: list[SearchResult] = []

    if query.lower().startswith("http://") or query.lower().startswith("https://"):
        results.extend(search_by_official_url(documents, chunks, documents_by_id, query))
        return results  # URL은 다른 유형과 겹칠 일이 없으므로 바로 반환

    results.extend(search_by_document_id(documents, query))

    if _DOC_NUMBER_LIKE_RE.match(query) or query.lower() == "không số":
        results.extend(search_by_document_number(documents, query))

    article_ref = parse_article_query(query)
    if article_ref and article_ref.get("article_no"):
        results.extend(
            search_by_article(
                chunks, documents_by_id,
                article_no=article_ref["article_no"],
                clause_no=article_ref["clause_no"],
                item_no=article_ref["item_no"],
            )
        )

    return results
