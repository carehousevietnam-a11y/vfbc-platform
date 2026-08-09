"""
Filter Engine — 실제 실행 가능한 구현.

지원 (STEP3 지시사항): status, document_type, issuing_authority, effective_date,
issue_date, article_no, relation_type, legal_area hybrid scope (tier1/tier2/tier3)
"""

from __future__ import annotations

from .search_models import Chunk, Document, SearchFilters, SearchResult
from .service_category_mapping import document_in_hybrid_scope, document_matches_legal_areas


def scope_index_for_hybrid(
    documents: list[Document],
    chunks: list[Chunk],
    legal_areas: tuple[str, ...],
    nganh_areas: tuple[str, ...] | None,
) -> tuple[list[Document], list[Chunk], dict[str, Document]]:
    scoped_docs = [
        d
        for d in documents
        if document_in_hybrid_scope(d.legal_area, d.nganh, legal_areas, nganh_areas)
    ]
    doc_ids = {d.document_id for d in scoped_docs}
    scoped_chunks = [c for c in chunks if c.document_id in doc_ids]
    documents_by_id = {d.document_id: d for d in scoped_docs}
    return scoped_docs, scoped_chunks, documents_by_id


def scope_index_for_legal_areas(
    documents: list[Document],
    chunks: list[Chunk],
    legal_areas: tuple[str, ...],
) -> tuple[list[Document], list[Chunk], dict[str, Document]]:
    """Legacy narrow filter — classified legal_area only (excludes unclassified)."""
    allowed = tuple(legal_areas)
    scoped_docs = [d for d in documents if document_matches_legal_areas(d.legal_area, allowed)]
    doc_ids = {d.document_id for d in scoped_docs}
    scoped_chunks = [c for c in chunks if c.document_id in doc_ids]
    documents_by_id = {d.document_id: d for d in scoped_docs}
    return scoped_docs, scoped_chunks, documents_by_id


def scope_index_for_filters(
    documents: list[Document],
    chunks: list[Chunk],
    filters: SearchFilters,
) -> tuple[list[Document], list[Chunk], dict[str, Document]]:
    if filters.hybrid_scope and filters.legal_areas:
        return scope_index_for_hybrid(
            documents,
            chunks,
            filters.legal_areas,
            filters.nganh_areas,
        )
    if filters.legal_areas:
        return scope_index_for_legal_areas(documents, chunks, filters.legal_areas)
    return documents, chunks, {d.document_id: d for d in documents}


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

        if filters.hybrid_scope and filters.legal_areas:
            if not doc or not document_in_hybrid_scope(
                doc.legal_area, doc.nganh, filters.legal_areas, filters.nganh_areas
            ):
                continue
        elif filters.legal_areas is not None:
            if not doc or not document_matches_legal_areas(doc.legal_area, filters.legal_areas):
                continue

        filtered.append(r)

    return filtered


def filter_documents(
    documents: list[Document], filters: SearchFilters | None, relations: list[dict] | None = None
) -> list[Document]:
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
        if filters.hybrid_scope and filters.legal_areas:
            if not document_in_hybrid_scope(
                doc.legal_area, doc.nganh, filters.legal_areas, filters.nganh_areas
            ):
                continue
        elif filters.legal_areas is not None:
            if not document_matches_legal_areas(doc.legal_area, filters.legal_areas):
                continue
        out.append(doc)
    return out
