"""Answer generation policy — mandatory disclaimer and tier-3 expert referral copy."""

from __future__ import annotations

import re

MANDATORY_DISCLAIMER = (
    "이 내용은 AI가 관련 법령을 바탕으로 제공하는 참고용 가이드이며, "
    "실제 진행은 반드시 전문가와 상의하시기 바랍니다."
)

# Tier-2 forbidden definitive endings (conservative heuristic for tests/guardrails).
FORBIDDEN_DEFINITIVE_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"무효입니다"),
    re.compile(r"사기입니다"),
    re.compile(r"책임이 있습니다"),
    re.compile(r"해야\s+합니다"),
    re.compile(r"[^가-힣]입니다(?!\s*수\s*있)"),  # block plain "~입니다" conclusions
)


def append_mandatory_disclaimer(text: str) -> str:
    """Always append the legal disclaimer at application level (never rely on the model)."""
    cleaned = (text or "").strip()
    if not cleaned:
        return MANDATORY_DISCLAIMER
    if MANDATORY_DISCLAIMER in cleaned:
        return cleaned
    return f"{cleaned}\n\n{MANDATORY_DISCLAIMER}"


def build_expert_referral_summary(question: str, *, language: str | None = None) -> str:
    """Tier 3 — complete customer-facing answer when no corpus evidence was found."""
    q = (question or "").strip()
    if language == "vi":
        intro = f"Về câu hỏi của bạn ({q}), " if q else "Về câu hỏi của bạn, "
        body = (
            f"{intro}chúng tôi chưa tìm thấy văn bản pháp luật cụ thể tương ứng trong cơ sở dữ liệu. "
            "Loại vấn đề này thường phụ thuộc vào sự kiện, hồ sơ và thực tiễn địa phương, "
            "nên việc chuyên gia xem xét trực tiếp thường là cách nhanh và chính xác nhất. "
            'Bạn có thể nhấn "Yêu cầu tư vấn chuyên gia" trong phòng tư vấn để đội ngũ chuyên gia VFBCAI hỗ trợ.'
        )
    else:
        intro = f"말씀하신 \"{q}\"" if q else "말씀하신 내용"
        body = (
            f"{intro}에 대해, 현재 데이터베이스에서 바로 대응되는 법령을 찾지 못했습니다. "
            "이런 사안은 실제 서류·상황·지역 관행에 따라 결론이 달라질 수 있어, "
            "전문가가 직접 확인하시는 것이 가장 확실하고 빠른 방법입니다. "
            "Case Room(마이페이지)에서 「전문가 상담 요청」을 누르시면 VFBCAI 전문가팀이 확인 후 안내드립니다."
        )
    return append_mandatory_disclaimer(body)


def contains_forbidden_definitive_phrasing(text: str) -> bool:
    """Return True if text contains clearly forbidden definitive legal conclusions."""
    if not text:
        return False
    for pattern in FORBIDDEN_DEFINITIVE_PATTERNS:
        if pattern.search(text):
            return True
    return False
