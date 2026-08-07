"""
Category mapping — STEP1 Schema V2 approved mapping tables.

Maps source-specific category fields to canonical 13 categories.
Unmapped values return [] with a reason for normalization reports.
"""

from __future__ import annotations

CANONICAL_CATEGORIES = frozenset({
    "Company",
    "Investment",
    "Labor",
    "Immigration",
    "Tax",
    "RealEstate",
    "Licensing",
    "Customs",
    "Banking",
    "Civil",
    "Commercial",
    "Criminal",
    "Administrative",
})

UNCLASSIFIED_LABEL = "Chưa phân loại"

# tmquan/vbpl-vn legal_area → canonical (approved mapping)
_VBPL_LEGAL_AREA_MAP: dict[str, list[str]] = {
    "Đất đai": ["RealEstate"],
    "Đầu tư tại Việt Nam": ["Investment"],
    "Thành lập và hoạt động của doanh nghiệp": ["Company"],
    "Xuất nhập khẩu": ["Customs"],
    "Quản lý thị trường": ["Commercial"],
    "Thi hành án dân sự": ["Civil"],
    "Phát triển đô thị": ["RealEstate"],
    "Môi trường": ["Licensing"],
    "Chất lượng Nông Lâm sản và Thủy sản": ["Licensing"],
    "Lâm nghiệp": ["Licensing"],
    "Điện": ["Licensing"],
    "Đào tạo và nghiên cứu y dược": ["Licensing"],
    "Tổ chức- Biên chế": ["Administrative"],
    "Tổ chức cán bộ": ["Administrative"],
    "Công chức": ["Administrative"],
    "Công chức, viên chức": ["Administrative"],
    "Đường bộ": ["Administrative"],
    "Tin học hóa": ["Administrative"],
    "Kiểm soát thủ tục hành chính": ["Administrative"],
    "Chính sách": ["Administrative"],
    "Khiếu nại, tố cáo": ["Administrative"],
    "Quản lý ngân sách nhà nước": ["Administrative"],
    "Ngân sách nhà nước": ["Administrative"],
    "Quản lý quỹ ngân sách, quỹ dự trữ nhà nước, và các quỹ tài chính khác của nhà nước": [
        "Administrative"
    ],
    "Đường thủy nội địa": ["Administrative"],
}

_VBPL_OUT_OF_SCOPE: frozenset[str] = frozenset({
    "Thủy lợi, đề điều và phòng chống bão lụt",
    "Phát triển nông thôn",
    "Thi đua khen thưởng",
    "Giáo dục thường xuyên",
})

# th1nhng0 metadata linh_vuc
_LINH_VUC_MAP: dict[str, list[str]] = {
    "Đất đai": ["RealEstate"],
    "Chính quyền địa phương": ["Administrative"],
}

# th1nhng0 legacy legal_sectors (exact string keys from sample)
_LEGACY_SECTORS_MAP: dict[str, list[str]] = {
    "Investment": ["Investment"],
    "Export & Import": ["Customs"],
    "Real estate, Transport": ["RealEstate"],
    "Employment - Wages, Administrative apparatus": ["Labor", "Administrative"],
    "Administrative apparatus": ["Administrative"],
    "Information technology, Administrative apparatus": ["Administrative"],
}

_LEGACY_OUT_OF_SCOPE: frozenset[str] = frozenset({"Education"})


def _validate_canonical(categories: list[str]) -> list[str]:
    """Return sorted unique canonical categories."""
    valid = sorted({c for c in categories if c in CANONICAL_CATEGORIES})
    return valid


def map_vbpl_legal_area(raw: str | None) -> tuple[list[str], str | None]:
    """
    Returns (category[], empty_reason).
    empty_reason is None when categories are assigned; otherwise 'unclassified' or 'out_of_scope'.
    """
    if not raw or raw == UNCLASSIFIED_LABEL:
        return [], "unclassified"
    if raw in _VBPL_OUT_OF_SCOPE:
        return [], "out_of_scope"
    mapped = _VBPL_LEGAL_AREA_MAP.get(raw)
    if mapped:
        return _validate_canonical(mapped), None
    return [], "unclassified"


def map_linh_vuc(raw: str | None) -> tuple[list[str], str | None]:
    if not raw or raw == UNCLASSIFIED_LABEL:
        return [], "unclassified"
    mapped = _LINH_VUC_MAP.get(raw)
    if mapped:
        return _validate_canonical(mapped), None
    return [], "unclassified"


def map_legal_sectors(raw: str | list[str] | None) -> tuple[list[str], str | None]:
    if raw is None:
        return [], "unclassified"
    if isinstance(raw, list):
        if not raw:
            return [], "unclassified"
        # legacy sample stores one combined string per document in the list
        key = raw[0] if len(raw) == 1 else ", ".join(raw)
    else:
        key = raw
    if key in _LEGACY_OUT_OF_SCOPE:
        return [], "out_of_scope"
    mapped = _LEGACY_SECTORS_MAP.get(key)
    if mapped:
        return _validate_canonical(mapped), None
    return [], "unclassified"
