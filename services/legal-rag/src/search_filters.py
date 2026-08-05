"""
Filter Engine — 실제 실행 가능한 구현.

지원 (STEP3 지시사항): status, document_type, issuing_authority, effective_date,
issue_date, article_no, relation_type

⚠️ DB에 연결하지 않는다. SearchResult 리스트(또는 Document/Chunk 리스트)에 대한
   순수 Python 필터링이다.

설계 판단(추측이 아니라 명시적 기본값): STEP3 지시사항은 effective_date/issue_date를
"지원"한다고만 명시하고 정확일치인지 범위인지 규정하지 않았다. 기본은 정확일치
(`effective_date`)로 하되, 범위 검색이 필요한 경우를 위해 `_from`/`_to` 옵션을
추가로 제공한다(SearchFilters에 이미 정의됨) — 이 판단 근거를 README에도 명시한다.
"""

from __future__ import annotations

from .search_models import Document, SearchFilters, SearchResult


def _date_in_range(value: str | None, exact: str | None, date_from: str | None, date_to: str | None) -> bool:
    if exact is None and date_from is None and date_to is None:
        return True
    if value is None:
        return False
    if exact is not None:
        return value == exact
    if date_from and value < date_from:
        return False
    if date_to and value > date_to:
        return False
    return True


def _document_ids_with_relation_type(relations: list[dict], relation_type: str) -> set[str]:
    ids: set[str] = set()
    for edge in relations:
        if edge.get("relation_type") == relation_type or edge.get("relationType") == relation_type:
            src = edge.get("source_document_id") or edge.get("sourceDocumentId")
            tgt = edge.get("target_document_id") or edge.get("targetDocumentId")
            if src:
                ids.add(src)
            if tgt:
                ids.add(tgt)
    return ids


def apply_filters(
    results: list[SearchResult],
    filters: SearchFilters | None,
    documents_by_id: dict[str, Document] | None = None,
    relations: list[dict] | None = None,
) -> list[SearchResult]:
    """
    SearchResult 리스트에 필터를 적용한다. status/document_type/article_no는
    SearchResult 자체 필드로 바로 판정 가능하고, issuing_authority/effective_date/
    issue_date/relation_type은 Document 조회가 필요하다(documents_by_id 필수).
    """
    if filters is None or filters.is_empty():
        return results

    documents_by_id = documents_by_id or {}
    relation_doc_ids: set[str] | None = None
    if filters.relation_type:
        relation_doc_ids = _document_ids_with_relation_type(relations or [], filters.relation_type)

    filtered = []
    for r in results:
        if filters.status is not None and r.status != filters.status:
            continue
        if filters.document_type is not None and r.document_type != filters.document_type:
            continue
        if filters.article_no is not None and r.article_no != filters.article_no:
            continue

        doc = documents_by_id.get(r.document_id)

        if filters.issuing_authority is not None:
            if not doc or doc.issuing_authority != filters.issuing_authority:
                continue

        if not _date_in_range(
            doc.effective_date if doc else None,
            filters.effective_date, filters.effective_date_from, filters.effective_date_to,
        ):
            continue

        if not _date_in_range(
            doc.issue_date if doc else None,
            filters.issue_date, filters.issue_date_from, filters.issue_date_to,
        ):
            continue

        if relation_doc_ids is not None and r.document_id not in relation_doc_ids:
            continue

        filtered.append(r)

    return filtered


def filter_documents(
    documents: list[Document], filters: SearchFilters | None, relations: list[dict] | None = None
) -> list[Document]:
    """query 없이 필터만으로 문서를 조회하는 'browse' 모드용 (search_engine.py에서 사용)."""
    if filters is None or filters.is_empty():
        return documents

    relation_doc_ids: set[str] | None = None
    if filters.relation_type:
        relation_doc_ids = _document_ids_with_relation_type(relations or [], filters.relation_type)

    out = []
    for doc in documents:
        if filters.status is not None and doc.status != filters.status:
            continue
        if filters.document_type is not None and doc.document_type != filters.document_type:
            continue
        if filters.issuing_authority is not None and doc.issuing_authority != filters.issuing_authority:
            continue
        if not _date_in_range(
            doc.effective_date, filters.effective_date, filters.effective_date_from, filters.effective_date_to
        ):
            continue
        if not _date_in_range(
            doc.issue_date, filters.issue_date, filters.issue_date_from, filters.issue_date_to
        ):
            continue
        if relation_doc_ids is not None and doc.document_id not in relation_doc_ids:
            continue
        # article_no는 문서 단위 필터가 아니라 chunk 단위 개념이므로 browse 모드에서는 무시
        out.append(doc)
    return out
