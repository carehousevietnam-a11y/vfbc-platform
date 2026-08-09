"""Hybrid legal_area + nganh category scoping (DESIGN v2 §2)."""

from __future__ import annotations

from src.search_engine import LegalSearchIndex
from src.search_models import SearchFilters
from src.search_with_fallback import search_with_fallback
from src.service_category_mapping import (
    classify_hybrid_scope_tier,
    document_in_hybrid_scope,
    estimate_hybrid_coverage,
)


def test_tier1_legal_area_match():
    tier = classify_hybrid_scope_tier(
        "Lao động, tiền lương, tiền công",
        None,
        ("Lao động, tiền lương, tiền công",),
        ("Nội vụ",),
    )
    assert tier == "tier1_legal_area"


def test_tier2_nganh_fallback_when_legal_area_unclassified():
    tier = classify_hybrid_scope_tier(
        "Chưa phân loại",
        "Lao động - Thương binh và Xã hội",
        ("Lao động, tiền lương, tiền công",),
        ("Lao động - Thương binh và Xã hội", "Nội vụ"),
    )
    assert tier == "tier2_nganh"


def test_tier3_full_when_both_unclassified():
    tier = classify_hybrid_scope_tier(
        "Chưa phân loại",
        None,
        ("Lao động, tiền lương, tiền công",),
        ("Nội vụ",),
    )
    assert tier == "tier3_full"


def test_excluded_wrong_classified_legal_area():
    tier = classify_hybrid_scope_tier(
        "Quản lý thuế, phí và lệ phí",
        None,
        ("Lao động, tiền lương, tiền công",),
        ("Nội vụ",),
    )
    assert tier == "excluded"


def test_hybrid_scope_includes_unclassified_labor_nganh():
    docs = [
        {
            "document_id": "d1",
            "legal_area": "Chưa phân loại",
            "nganh": "Lao động - Thương binh và Xã hội",
            "status": "active",
        },
        {
            "document_id": "d2",
            "legal_area": "Quản lý thuế, phí và lệ phí",
            "nganh": "Tài chính",
            "status": "active",
        },
    ]
    chunks = [
        {
            "chunk_id": "c1",
            "document_id": "d1",
            "heading": "giấy phép lao động",
            "original_text": "giấy phép lao động điều kiện",
            "normalized_text": "giấy phép lao động điều kiện",
            "search_text": "giấy phép lao động điều kiện",
        },
        {
            "chunk_id": "c2",
            "document_id": "d2",
            "heading": "giấy phép lao động thuế",
            "original_text": "giấy phép lao động thuế",
            "normalized_text": "giấy phép lao động thuế",
            "search_text": "giấy phép lao động thuế",
        },
    ]
    index = LegalSearchIndex.from_dicts(docs, chunks)
    results, meta = search_with_fallback(
        index,
        question="giấy phép lao động",
        language="vi",
        translated_terms=[],
        limit=10,
        service_type="wp",
    )
    assert meta.get("hybrid_scope")
    assert all(r.document_id == "d1" for r in results)
    assert meta.get("hybrid_coverage")


def test_estimate_hybrid_coverage_synthetic():
    docs = [
        type("D", (), {"legal_area": "Lao động, tiền lương, tiền công", "nganh": None})(),
        type("D", (), {"legal_area": "Chưa phân loại", "nganh": "Lao động - Thương binh và Xã hội"})(),
        type("D", (), {"legal_area": "Chưa phân loại", "nganh": None})(),
        type("D", (), {"legal_area": "Quản lý thuế, phí và lệ phí", "nganh": "Tài chính"})(),
    ]
    report = estimate_hybrid_coverage(docs, "wp")
    assert report["tier1_legal_area"] == 1
    assert report["tier2_nganh"] == 1
    assert report["tier3_full"] == 1
    assert report["excluded"] == 1
