"""Authority weight derivation from document_type — STEP1 Schema V2."""

from __future__ import annotations

import re

_WEIGHT_PATTERNS: list[tuple[re.Pattern, int]] = [
    # tmquan doc_type uses snake_case: "luat", "bo_luat" (underscore, not space)
    (re.compile(r"^bo_luat$|^luat$|bộ\s*luật|bo[\s_]*luat|\blaw\b|\bluật\b", re.IGNORECASE), 100),
    (re.compile(r"nghị\s*định|nghi_dinh|\bdecree\b", re.IGNORECASE), 90),
    (re.compile(r"thông\s*tư|thong_tu|\bcircular\b", re.IGNORECASE), 80),
    (re.compile(r"quyết\s*định|quyet_dinh|\bdecision\b", re.IGNORECASE), 60),
    (re.compile(r"nghị\s*quyết|nghi_quyet|\bresolution\b", re.IGNORECASE), 50),
]


def compute_authority_weight(document_type: str | None) -> int:
    if not document_type:
        return 30
    for pattern, weight in _WEIGHT_PATTERNS:
        if pattern.search(document_type):
            return weight
    return 30
