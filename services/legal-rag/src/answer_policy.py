"""Answer generation policy — disclaimer, tier-3 referral, and DESIGN v3 grade B/C copy."""

from __future__ import annotations

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .evidence_builder import EvidencePack

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

_SIGNUP_CTA_KO = (
    "더 정확한 법령 근거·맞춤 AI 리포트·전문가 검토는 무료 회원가입 후 "
    "마이페이지에서 이용하실 수 있습니다."
)
_SIGNUP_CTA_VI = (
    "Để xem căn cứ pháp lý chi tiết, báo cáo AI và hỗ trợ chuyên gia, "
    "vui lòng đăng ký miễn phí và tiếp tục tại Trang của tôi."
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


def has_verified_article_citations(legal_basis) -> bool:
    """True when at least one citation has a non-null article locator (grade A signal)."""
    return any(item.article for item in legal_basis)


def collect_document_references(evidence_packs: list[EvidencePack]) -> list[dict[str, str | None]]:
    """Unique document-level references from evidence packs (title + number, no invented articles)."""
    seen: set[tuple[str, str | None]] = set()
    refs: list[dict[str, str | None]] = []
    for pack in evidence_packs:
        document_number = pack.document_number[0] if pack.document_number else pack.document_id
        title = pack.title
        key = (document_number, title)
        if key in seen:
            continue
        seen.add(key)
        refs.append(
            {
                "document_number": document_number,
                "title": title,
                "official_url": pack.official_url,
            }
        )
    return refs


def format_structured_citation(
    *,
    title: str | None,
    document_number: str,
    article: str | None = None,
) -> str:
    """DESIGN v3 §5 — structured citation line for grade A (when article is verified)."""
    name = (title or "").strip() or document_number
    base = f"{name} ({document_number})"
    if article:
        return f"{base} {article}"
    return base


def _format_document_list(refs: list[dict[str, str | None]], *, language: str | None) -> str:
    if not refs:
        return ""
    lines: list[str] = []
    for ref in refs[:5]:
        number = ref["document_number"] or ""
        title = ref["title"] or number
        if language == "vi":
            lines.append(f"- {title} ({number})")
        else:
            lines.append(f"- {title} (문서번호: {number})")
    return "\n".join(lines)


def _service_context_phrase(service_group: str | None, *, language: str | None) -> str:
    if language == "vi":
        mapping = {
            "check": "thủ tục hành chính và giấy tờ",
            "register": "cấp phép và thành lập doanh nghiệp",
            "verify": "rà soát tài liệu và rủi ro pháp lý",
        }
        return mapping.get(service_group or "", "vấn đề pháp lý liên quan")
    mapping = {
        "check": "행정·체류·허가 확인",
        "register": "사업자 인허가·설립",
        "verify": "서류·분쟁·위험 검토",
    }
    return mapping.get(service_group or "", "관련 법률·행정 사안")


def build_partial_evidence_summary(
    question: str,
    evidence_packs: list[EvidencePack],
    *,
    language: str | None = None,
    service_group: str | None = None,
    include_signup_cta: bool = False,
) -> str:
    """DESIGN v3 grade B — document confirmed, article not specified."""
    refs = collect_document_references(evidence_packs)
    q = (question or "").strip()
    doc_block = _format_document_list(refs, language=language)
    context = _service_context_phrase(service_group, language=language)

    if language == "vi":
        intro = f"Về câu hỏi của bạn ({q}), " if q else "Về câu hỏi của bạn, "
        body = (
            f"{intro}chúng tôi đã xác định được văn bản pháp luật liên quan đến {context}:\n"
            f"{doc_block}\n\n"
            "Tuy nhiên, AI chưa thể xác định chính xác điều/khoản cụ thể áp dụng cho trường hợp của bạn. "
            "Để xác nhận căn cứ chính xác và bước tiếp theo, vui lòng yêu cầu VFBCAI xem xét chuyên gia "
            "hoặc tải lên hồ sơ để nhận báo cáo AI chi tiết hơn."
        )
        if include_signup_cta:
            body += f"\n\n{_SIGNUP_CTA_VI}"
    else:
        intro = f"말씀하신 \"{q}\"" if q else "말씀하신 내용"
        body = (
            f"{intro}에 대해, {context}와 관련된 아래 법령·문서가 데이터베이스에서 확인되었습니다:\n"
            f"{doc_block}\n\n"
            "다만 AI가 귀하의 상황에 적용되는 구체적인 조항(Điều/Khoản)까지는 특정하지 못했습니다. "
            "정확한 근거 확인과 다음 단계 안내는 VFBCAI 전문가 검토 또는 서류 업로드 후 "
            "AI 리포트를 통해 진행하실 수 있습니다."
        )
        if include_signup_cta:
            body += f"\n\n{_SIGNUP_CTA_KO}"

    return append_mandatory_disclaimer(body)


def build_anonymous_topic_guidance(
    question: str,
    *,
    language: str | None = None,
    inferred_topic: str | None = None,
) -> str:
    """Pre-signup /ai — topic inference + general guidance + signup CTA (no case-specific depth)."""
    q = (question or "").strip()
    topic = (inferred_topic or "").strip() or "관련 행정·법률·인허가"
    if language == "vi":
        body = (
            f"Câu hỏi của bạn có vẻ liên quan đến {topic}. "
            "Ở chế độ khách, VFBCAI chỉ cung cấp hướng dẫn chung và loại hồ sơ thường cần — "
            "không thể đưa căn cứ pháp lý chi tiết hoặc đánh giá theo hồ sơ cụ thể. "
            f"{_SIGNUP_CTA_VI}"
        )
    else:
        body = (
            f"말씀하신 내용은 **{topic}** 관련 사안으로 보입니다. "
            "비회원 상태에서는 일반적인 절차·서류 안내만 드릴 수 있으며, "
            "개인 상황에 맞는 법령 근거·조항·AI 리포트는 제공되지 않습니다. "
            f"{_SIGNUP_CTA_KO}"
        )
    return append_mandatory_disclaimer(body)
