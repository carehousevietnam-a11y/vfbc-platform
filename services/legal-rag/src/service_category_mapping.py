"""Map VFBCAI service types to corpus legal_area and nganh (sector) values."""

from __future__ import annotations

# Pilot vbpl legal_area values are Vietnamese free-text labels from vbpl.vn.
# th1nhng0 metadata uses linh_vuc (legal area) and nganh (issuing ministry sector).
# verify_unclear intentionally has no mapping (full corpus search).
# Distribution source: reports/legal-area-distribution.json (tmquan/vbpl-vn, 158,822 docs).

UNCLASSIFIED_LABEL = "Chưa phân loại"

SERVICE_TO_LEGAL_AREAS: dict[str, tuple[str, ...]] = {
    # CHECK — 행정 (거주·노동·임시거주·면허)
    "wp": (
        "Kiểm soát thủ tục hành chính",
        "Lao động, tiền lương, tiền công",
        "Xuất nhập khẩu",
        "Chính sách",
        "Labor",
        "Administrative apparatus",
        "Cải cách hành chính",
    ),
    "trc": (
        "Kiểm soát thủ tục hành chính",
        "Xuất nhập khẩu",
        "Chính sách",
        "Immigration",
        "Đăng ký, quản lý cư trú",
    ),
    "tamtru": (
        "Kiểm soát thủ tục hành chính",
        "Chính sách",
        "Chính quyền địa phương",
        "Đăng ký, quản lý cư trú",
    ),
    "driving_license": (
        "Đường bộ",
        "Đường thủy nội địa",
        "Giao thông vận tải",
        "Transport",
    ),
    # REGISTER — 인허가
    "permit_company": (
        "Thành lập và hoạt động của doanh nghiệp",
        "Đầu tư tại Việt Nam",
        "Business",
    ),
    "register_company": (
        "Thành lập và hoạt động của doanh nghiệp",
        "Đầu tư tại Việt Nam",
        "Business",
    ),
    "register_restaurant": (
        "Thành lập và hoạt động của doanh nghiệp",
        "An toàn thực phẩm",
        "Food safety",
    ),
    "register_cosmetics": ("Thành lập và hoạt động của doanh nghiệp", "Mỹ phẩm"),
    "register_environment": ("Môi trường", "Environment"),
    "register_fire_safety": ("Phòng cháy chữa cháy", "Fire safety"),
    "register_hygiene": ("Vệ sinh an toàn", "Hygiene"),
    "register_medical_device": ("Y tế", "Medical", "Đào tạo và nghiên cứu y dược"),
    "register_franchise": ("Thành lập và hoạt động của doanh nghiệp", "Thương mại"),
    # VERIFY
    "verify_fraud": (
        "Thi hành án dân sự",
        "Hình sự",
        "Criminal",
        "Civil",
        "An ninh và trật tự, an toàn xã hội",
    ),
    "verify_real_estate": (
        "Đất đai",
        "Real estate",
        "Phát triển đô thị",
        "Quản lý nhà và thị trường bất động sản",
    ),
    "verify_tax": (
        "Ngân sách nhà nước",
        "Quản lý ngân sách nhà nước",
        "Quản lý ngân sách",
        "Quản lý thuế, phí, lệ phí và thu khác của ngân sách nhà nước",
        "Quản lý thuế, phí và lệ phí",
        "Chính sách thuế",
        "Finance",
        "Tax",
    ),
    "verify_admin": (
        "Kiểm soát thủ tục hành chính",
        "Công chức",
        "Công chức, viên chức",
        "Administrative apparatus",
        "Cải cách hành chính",
        "Tổ chức- Biên chế",
        "Tổ chức cán bộ",
    ),
}

# th1nhng0 nganh / Monmoonluna ministry-sector labels (발행 부처 업권)
SERVICE_TO_NGANH: dict[str, tuple[str, ...]] = {
    "wp": (
        "Lao động - Thương binh và Xã hội",
        "Nội vụ",
        "Công an",
    ),
    "trc": (
        "Nội vụ",
        "Công an",
        "Tư pháp",
    ),
    "tamtru": (
        "Công an",
        "Nội vụ",
        "Tư pháp",
    ),
    "driving_license": (
        "Giao thông Vận tải",
        "Công Thương",
        "Quốc phòng",
    ),
    "permit_company": ("Tài chính", "Kế hoạch và Đầu tư", "Công Thương"),
    "register_company": ("Tài chính", "Kế hoạch và Đầu tư", "Công Thương"),
    "register_restaurant": ("Công Thương", "Y  tế", "Y tế"),
    "register_cosmetics": ("Công Thương", "Y  tế", "Y tế"),
    "register_environment": ("Tài nguyên và Môi trường", "Môi trường"),
    "register_fire_safety": ("Công an", "Quốc phòng"),
    "register_hygiene": ("Y  tế", "Y tế"),
    "register_medical_device": ("Y  tế", "Y tế"),
    "register_franchise": ("Công Thương", "Tài chính"),
    "verify_fraud": ("Tư pháp", "Công an"),
    "verify_real_estate": ("Xây dựng", "Tài chính", "Tư pháp"),
    "verify_tax": ("Tài chính", "Ngân hàng"),
    "verify_admin": ("Nội vụ", "Tư pháp"),
}


def _normalize_service_key(service_type: str | None) -> str:
    return (service_type or "").strip().lower().replace("-", "_")


def _is_unclassified_label(value: str | None) -> bool:
    text = (value or "").strip()
    if not text:
        return True
    lower = text.lower()
    return lower == UNCLASSIFIED_LABEL.lower() or "chưa phân loại" in lower


def index_has_legal_area_metadata(documents: list) -> bool:
    """True when at least one document carries a non-empty legal_area (post re-normalize)."""
    for doc in documents:
        area = getattr(doc, "legal_area", None) or (doc.get("legal_area") if isinstance(doc, dict) else None)
        if (area or "").strip() and not _is_unclassified_label(area):
            return True
    return False


def index_has_nganh_metadata(documents: list) -> bool:
    for doc in documents:
        nganh = getattr(doc, "nganh", None) or (doc.get("nganh") if isinstance(doc, dict) else None)
        if (nganh or "").strip() and not _is_unclassified_label(nganh):
            return True
    return False


def resolve_legal_areas_for_service(service_type: str | None) -> tuple[str, ...] | None:
    """Return allowed legal_area labels for a service_type, or None for full-corpus search."""
    key = _normalize_service_key(service_type)
    if not key:
        return None
    if key == "verify_unclear":
        return None
    if key == "register_company":
        key = "permit_company"
    areas = SERVICE_TO_LEGAL_AREAS.get(key)
    if areas:
        return areas
    if key.startswith("verify_"):
        return SERVICE_TO_LEGAL_AREAS.get(key)
    if key.startswith("register_"):
        return SERVICE_TO_LEGAL_AREAS.get(key)
    if key.startswith("permit_"):
        return SERVICE_TO_LEGAL_AREAS.get(key)
    return None


def resolve_nganh_for_service(service_type: str | None) -> tuple[str, ...] | None:
    key = _normalize_service_key(service_type)
    if not key:
        return None
    if key == "verify_unclear":
        return None
    if key == "register_company":
        key = "permit_company"
    areas = SERVICE_TO_NGANH.get(key)
    if areas:
        return areas
    if key.startswith("verify_"):
        return SERVICE_TO_NGANH.get(key)
    if key.startswith("register_"):
        return SERVICE_TO_NGANH.get(key)
    if key.startswith("permit_"):
        return SERVICE_TO_NGANH.get(key)
    return None


def document_matches_labels(value: str | None, allowed: tuple[str, ...]) -> bool:
    """Match a label against allowed values (exact or comma-separated parts)."""
    if not allowed:
        return True
    doc_val = (value or "").strip()
    if not doc_val:
        return False
    doc_parts = {part.strip() for part in doc_val.split(",") if part.strip()}
    allowed_set = set(allowed)
    if doc_val in allowed_set:
        return True
    return bool(doc_parts & allowed_set)


def document_matches_legal_areas(legal_area: str | None, allowed: tuple[str, ...]) -> bool:
    return document_matches_labels(legal_area, allowed)


def document_matches_nganh(nganh: str | None, allowed: tuple[str, ...]) -> bool:
    return document_matches_labels(nganh, allowed)


def classify_hybrid_scope_tier(
    legal_area: str | None,
    nganh: str | None,
    legal_areas: tuple[str, ...],
    nganh_areas: tuple[str, ...] | None,
) -> str:
    """Return tier label: tier1_legal_area | tier2_nganh | tier3_full | excluded."""
    la = (legal_area or "").strip()
    ng = (nganh or "").strip()

    if la and not _is_unclassified_label(la):
        if document_matches_legal_areas(la, legal_areas):
            return "tier1_legal_area"
        return "excluded"

    # Unclassified or empty legal_area — tier 2 or 3
    if nganh_areas and ng and not _is_unclassified_label(ng):
        if document_matches_nganh(ng, nganh_areas):
            return "tier2_nganh"
        return "excluded"

    return "tier3_full"


def document_in_hybrid_scope(
    legal_area: str | None,
    nganh: str | None,
    legal_areas: tuple[str, ...],
    nganh_areas: tuple[str, ...] | None,
) -> bool:
    tier = classify_hybrid_scope_tier(legal_area, nganh, legal_areas, nganh_areas)
    return tier != "excluded"


def estimate_hybrid_coverage(
    documents: list,
    service_type: str | None,
) -> dict[str, float | int | str | None]:
    """Estimate document counts per hybrid tier for a service (local corpus diagnostic)."""
    legal_areas = resolve_legal_areas_for_service(service_type)
    if not legal_areas:
        return {"service_type": service_type, "mode": "full_corpus", "total": len(documents)}

    nganh_areas = resolve_nganh_for_service(service_type)
    counts = {"tier1_legal_area": 0, "tier2_nganh": 0, "tier3_full": 0, "excluded": 0}
    for doc in documents:
        la = getattr(doc, "legal_area", None) or (doc.get("legal_area") if isinstance(doc, dict) else None)
        ng = getattr(doc, "nganh", None) or (doc.get("nganh") if isinstance(doc, dict) else None)
        tier = classify_hybrid_scope_tier(la, ng, legal_areas, nganh_areas)
        counts[tier] += 1

    total = len(documents) or 1
    scoped = counts["tier1_legal_area"] + counts["tier2_nganh"] + counts["tier3_full"]
    return {
        "service_type": service_type,
        "mode": "hybrid",
        "total": len(documents),
        "tier1_legal_area": counts["tier1_legal_area"],
        "tier2_nganh": counts["tier2_nganh"],
        "tier3_full": counts["tier3_full"],
        "excluded": counts["excluded"],
        "tier1_pct": round(counts["tier1_legal_area"] / total * 100, 1),
        "tier2_pct": round(counts["tier2_nganh"] / total * 100, 1),
        "tier3_pct": round(counts["tier3_full"] / total * 100, 1),
        "excluded_pct": round(counts["excluded"] / total * 100, 1),
        "scoped_pct": round(scoped / total * 100, 1),
    }
