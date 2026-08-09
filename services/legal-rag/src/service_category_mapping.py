"""Map VFBCAI service types to corpus legal_area values (vbpl Vietnamese labels)."""

from __future__ import annotations

# Pilot vbpl legal_area values are Vietnamese free-text labels from vbpl.vn.
# th1nhng0 legacy uses English legal_sectors strings — both are listed where relevant.
# verify_unclear intentionally has no mapping (full corpus search).
# Distribution source: reports/legal-area-distribution.json (tmquan/vbpl-vn, 158,822 docs).

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
    ),
    "tamtru": (
        "Kiểm soát thủ tục hành chính",
        "Chính sách",
        "Chính quyền địa phương",
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
    # verify_unclear — intentionally omitted (returns None → no area filter)
}


def _normalize_service_key(service_type: str | None) -> str:
    return (service_type or "").strip().lower().replace("-", "_")


def index_has_legal_area_metadata(documents: list) -> bool:
    """True when at least one document carries a non-empty legal_area (post re-normalize)."""
    for doc in documents:
        area = getattr(doc, "legal_area", None) or (doc.get("legal_area") if isinstance(doc, dict) else None)
        if (area or "").strip():
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


def document_matches_legal_areas(legal_area: str | None, allowed: tuple[str, ...]) -> bool:
    """Match document legal_area against allowed labels (exact or comma-separated parts)."""
    if not allowed:
        return True
    doc_area = (legal_area or "").strip()
    if not doc_area:
        return False
    doc_parts = {part.strip() for part in doc_area.split(",") if part.strip()}
    allowed_set = set(allowed)
    if doc_area in allowed_set:
        return True
    return bool(doc_parts & allowed_set)
