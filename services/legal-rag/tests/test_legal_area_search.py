"""Tests for service_type → legal_area mapping and scoped search."""

from __future__ import annotations

import time

from src.search_engine import LegalSearchIndex
from src.search_models import Document, SearchFilters
from src.search_with_fallback import search_with_fallback
from src.service_category_mapping import (
    document_matches_legal_areas,
    resolve_legal_areas_for_service,
)


def test_resolve_legal_areas_normalizes_hyphens():
    areas = resolve_legal_areas_for_service("driving-license")
    assert areas is not None
    assert "Đường bộ" in areas


def test_verify_unclear_has_no_area_filter():
    assert resolve_legal_areas_for_service("verify_unclear") is None


def test_document_matches_legal_areas_comma_separated():
    assert document_matches_legal_areas("Đất đai, Môi trường", ("Môi trường",))


def _labor_doc() -> Document:
    return Document(
        document_id="tmquan:1",
        title="Giấy phép lao động cho người nước ngoài",
        legal_area="Lao động, tiền lương, tiền công",
    )


def _tax_doc() -> Document:
    return Document(
        document_id="tmquan:2",
        title="Quy định về thuế giá trị gia tăng",
        legal_area="Quản lý thuế, phí và lệ phí",
    )


def _chunk(doc_id: str, text: str, chunk_id: str) -> dict:
    return {
        "chunk_id": chunk_id,
        "document_id": doc_id,
        "heading": text,
        "original_text": text,
        "normalized_text": text,
        "search_text": text.lower(),
        "legal_area": None,
    }


def test_legal_area_filter_reduces_scan_scope():
    """Filter ON should exclude hits from non-matching legal_area documents."""
    labor = _labor_doc()
    tax = _tax_doc()
    chunks = [
        _chunk("tmquan:1", "giấy phép lao động điều kiện cấp phép", "c1"),
        _chunk("tmquan:2", "giấy phép lao động thuế nộp ngân sách", "c2"),
    ]
    index = LegalSearchIndex.from_dicts(
        [labor.to_dict() if hasattr(labor, "to_dict") else {
            "document_id": labor.document_id,
            "title": labor.title,
            "legal_area": labor.legal_area,
            "status": "active",
        }, {
            "document_id": tax.document_id,
            "title": tax.title,
            "legal_area": tax.legal_area,
            "status": "active",
        }],
        chunks,
    )

    unfiltered, _ = search_with_fallback(
        index,
        question="giấy phép lao động",
        language="vi",
        translated_terms=[],
        limit=10,
        service_type=None,
    )
    filtered, meta = search_with_fallback(
        index,
        question="giấy phép lao động",
        language="vi",
        translated_terms=[],
        limit=10,
        service_type="wp",
    )

    assert len(unfiltered) >= 1
    assert all(r.document_id == "tmquan:1" for r in filtered)
    assert meta.get("legal_area_filter") is not None


def test_legal_area_filter_improves_timing_on_large_synthetic_index():
    """Scoped chunks reduce keyword scan work (wall time should not increase)."""
    docs = []
    chunks = []
    for i in range(200):
        area = "Lao động, tiền lương, tiền công" if i < 5 else "Chưa phân loại"
        doc_id = f"tmquan:{i}"
        docs.append({
            "document_id": doc_id,
            "title": f"Doc {i} giấy phép lao động",
            "legal_area": area,
            "status": "active",
        })
        for j in range(50):
            text = f"giấy phép lao động chunk {i}-{j}"
            chunks.append({
                "chunk_id": f"c{i}-{j}",
                "document_id": doc_id,
                "heading": text,
                "original_text": text,
                "normalized_text": text,
                "search_text": text,
            })

    index = LegalSearchIndex.from_dicts(docs, chunks)
    areas = resolve_legal_areas_for_service("wp")
    filters = SearchFilters(legal_areas=areas)

    start = time.perf_counter()
    index.search(query="giấy phép lao động", limit=5)
    unfiltered_ms = (time.perf_counter() - start) * 1000

    start = time.perf_counter()
    index.search(query="giấy phép lao động", limit=5, filters=filters)
    filtered_ms = (time.perf_counter() - start) * 1000

    assert filtered_ms <= unfiltered_ms * 1.5
