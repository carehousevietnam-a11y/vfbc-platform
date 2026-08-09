"""Answer generation policy — disclaimer, tier-3 referral, and DESIGN v3 grade B/C copy."""

from __future__ import annotations

import re
from typing import TYPE_CHECKING

from .multilingual_legal_terms import extract_partial_ontology_matches

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


def build_expert_referral_summary(
    question: str,
    *,
    language: str | None = None,
    service_group: str | None = None,
    service_type: str | None = None,
) -> str:
    """Grade C — practical guide first, then expert referral (no invented law citations)."""
    return build_no_evidence_guidance_summary(
        question,
        language=language,
        service_group=service_group,
        service_type=service_type,
    )


_CANONICAL_TOPIC_KO: dict[str, str] = {
    "giấy phép lao động": "노동허가(외국인 근로 허가)",
    "thẻ tạm thường trú": "거주증(TRC)",
    "tạm trú": "임시거주등록(땀주)",
    "giấy phép lái xe": "운전면허",
    "lừa đảo": "부동산·계약 사기 위험",
    "hợp đồng thuê nhà": "임대·부동산 계약",
}

_SERVICE_TYPE_TOPIC_KO: dict[str, str] = {
    "wp": "노동허가(외국인 근로 허가)",
    "trc": "거주증(TRC)",
    "tamtru": "임시거주등록(땀주)",
    "driving-license": "운전면허",
    "verify_fraud": "부동산·계약 사기 위험",
    "verify_real-estate": "임대·부동산 계약",
    "verify_tax": "세무·회계 서류",
    "verify_admin": "행정 문서",
    "verify_unclear": "불확실한 서류·분쟁",
}

_GUIDANCE_CHECKLIST_KO: dict[str, list[str]] = {
    "giấy phép lao động": [
        "고용계약서·회사 사업자 정보 등 근로 관계를 보여주는 서류",
        "학력·경력 증명, 건강검진 등 신청 시 흔히 요구되는 기본 서류",
        "현재 체류 자격·만료일 — 허가 종류에 따라 필요 서류가 달라질 수 있습니다",
    ],
    "thẻ tạm thường trú": [
        "여권·현재 체류 자격(비자/스탬프)과 만료일",
        "거주 목적을 보여주는 근로·사업·가족 관계 증빙",
        "거주지 임대차 계약·임대 확인 서류 등 주소 증빙",
    ],
    "tạm trú": [
        "여권·입국 스탬프·현재 체류 상태",
        "거주지 주소·임대차 또는 거주 확인 서류",
        "등록 기한·연장 사유를 설명할 수 있는 상황 정리(언제부터 어디에 거주 중인지)",
    ],
    "giấy phép lái xe": [
        "본국 운전면허증·공증·번역 여부",
        "체류 자격·거주 증빙(허가 종류에 따라 요구 서류가 다름)",
        "신규 발급 vs 전환(교환) 중 어떤 경로인지",
    ],
    "lừa đảo": [
        "계약서·영수증·송금 내역·메신저 대화 등 거래 흔적",
        "상대방 신원·부동산 권리(소유·대리 권한)를 확인할 수 있는 자료",
        "당시 약속·지급 조건·인도 시점을 시간순으로 정리한 메모",
    ],
    "hợp đồng thuê nhà": [
        "임대차 계약서·보증금·월세 지급 내역",
        "부동산 소유·대리 권한을 확인할 수 있는 서류 사본",
        "분쟁이 된 조항(해지·보증금 반환·수리 의무 등)을 표시한 계약서",
    ],
}

_GUIDANCE_CHECKLIST_VI: dict[str, list[str]] = {
    "giấy phép lao động": [
        "Hợp đồng lao động và thông tin doanh nghiệp",
        "Bằng cấp, kinh nghiệm, giấy khám sức khỏe",
        "Tư cách lưu trú hiện tại và ngày hết hạn",
    ],
}

_DEFAULT_CHECKLIST_KO: dict[str, list[str]] = {
    "check": [
        "여권·체류 자격·만료일 등 기본 신분·체류 정보",
        "질문과 관련된 계약서·허가증·신청 서류 사본",
        "지금까지 진행한 절차(어디에 제출했는지, 결과는 무엇인지)를 짧게 정리",
    ],
    "verify": [
        "문제가 된 계약서·영수증·송금·메신저 대화 등 핵심 자료",
        "상대방·부동산·회사의 신원·권한을 확인할 수 있는 자료",
        "무엇이 걱정되는지(사기·분쟁·위조 등)를 한 문장으로 정리",
    ],
    "register": [
        "사업 형태(개인·법인)·업종·예상 영업 장소",
        "임대차·투자·대표자 신분 등 설립·인허가에 필요한 기본 정보",
        "이미 받은 안내문·반려 통지·임시 허가 등이 있다면 사본",
    ],
}


def _resolve_guidance_topic(
    question: str,
    *,
    service_group: str | None,
    service_type: str | None,
) -> tuple[str, str | None]:
    """Return (display topic label, canonical_vi key for checklist lookup)."""
    matches = extract_partial_ontology_matches(question)
    if matches:
        canonical = matches[0]
        label = _CANONICAL_TOPIC_KO.get(canonical, canonical)
        return label, canonical

    if service_type:
        normalized = service_type.replace("-", "_")
        if service_type in _SERVICE_TYPE_TOPIC_KO:
            label = _SERVICE_TYPE_TOPIC_KO[service_type]
            canonical = next(
                (key for key, value in _CANONICAL_TOPIC_KO.items() if value == label),
                None,
            )
            return label, canonical
        if normalized in _SERVICE_TYPE_TOPIC_KO:
            label = _SERVICE_TYPE_TOPIC_KO[normalized]
            return label, None

    if service_group:
        group_labels = {
            "check": "체류·허가·행정 확인",
            "verify": "서류·분쟁·위험 검토",
            "register": "사업자 설립·인허가",
        }
        return group_labels.get(service_group, "관련 행정·법률·인허가"), None

    return "관련 행정·법률·인허가", None


def _guidance_checklist(
    *,
    canonical: str | None,
    service_group: str | None,
    language: str | None,
) -> list[str]:
    if language == "vi" and canonical and canonical in _GUIDANCE_CHECKLIST_VI:
        return _GUIDANCE_CHECKLIST_VI[canonical]
    if canonical and canonical in _GUIDANCE_CHECKLIST_KO:
        return _GUIDANCE_CHECKLIST_KO[canonical]
    if service_group and service_group in _DEFAULT_CHECKLIST_KO:
        return _DEFAULT_CHECKLIST_KO[service_group]
    return [
        "질문과 관련된 서류·계약·허가증 사본",
        "지금까지 진행한 절차와 결과를 짧게 정리한 메모",
        "체류 자격·만료일·거주지 등 기본 정보",
    ]


def build_no_evidence_guidance_summary(
    question: str,
    *,
    language: str | None = None,
    service_group: str | None = None,
    service_type: str | None = None,
) -> str:
    """Grade C — topic guide + honest no-match note + expert CTA."""
    q = (question or "").strip()
    topic, canonical = _resolve_guidance_topic(
        q,
        service_group=service_group,
        service_type=service_type,
    )
    checklist = _guidance_checklist(
        canonical=canonical,
        service_group=service_group,
        language=language,
    )
    bullets = "\n".join(f"- {item}" for item in checklist)

    if language == "vi":
        intro = f"Về câu hỏi của bạn ({q}), " if q else "Về câu hỏi của bạn, "
        body = (
            f"{intro}vấn đề này có vẻ liên quan đến **{topic}**.\n\n"
            "Dù chúng tôi chưa tìm thấy văn bản pháp luật cụ thể trong cơ sở dữ liệu, "
            "bạn có thể chuẩn bị theo hướng dẫn chung sau:\n"
            f"{bullets}\n\n"
            "Kết luận chính xác phụ thuộc vào hồ sơ và thực tế từng trường hợp. "
            'Nhấn "Yêu cầu tư vấn chuyên gia" trong phòng tư vấn để VFBCAI hỗ trợ bước tiếp theo.'
        )
    else:
        intro = f"말씀하신 \"{q}\"" if q else "말씀하신 내용"
        body = (
            f"{intro}은(는) **{topic}** 관련 문의로 보입니다.\n\n"
            "데이터베이스에서 바로 대응되는 법령 조문은 찾지 못했지만, "
            "아래 일반 가이드를 참고해 준비하실 수 있습니다:\n"
            f"{bullets}\n\n"
            "실제 결론은 서류·상황·지역 관행에 따라 달라질 수 있습니다. "
            "정확한 확인과 다음 단계 안내는 Case Room(마이페이지)에서 "
            "「전문가 상담 요청」을 누르시면 VFBCAI 전문가팀이 도와드립니다."
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


_ARTICLE_LOCATOR_RE = re.compile(
    r"^\s*Điều\s+(?P<article>[^\s]+)"
    r"(?:\s+Khoản\s+(?P<clause>[^\s]+))?"
    r"(?:\s+Điểm\s+(?P<item>[^\s]+))?\s*$",
    re.IGNORECASE,
)


def _format_korean_article_locator(article: str) -> str:
    """Convert verified Điều/Khoản locator to Korean 제N조 제M항 style."""
    match = _ARTICLE_LOCATOR_RE.match(article)
    if not match:
        return article.strip()
    parts: list[str] = [f"제{match.group('article')}조"]
    if match.group("clause"):
        parts.append(f"제{match.group('clause')}항")
    if match.group("item"):
        parts.append(f"제{match.group('item')}호")
    return " ".join(parts)


def format_structured_citation(
    *,
    title: str | None,
    document_number: str,
    article: str | None = None,
    language: str | None = None,
) -> str:
    """DESIGN v3 §5 — structured citation line for grade A (when article is verified)."""
    name = (title or "").strip() or document_number
    base = f"{name} ({document_number})"
    if not article:
        return base
    if language == "vi":
        return f"{base} {article.strip()}"
    return f"{base} {_format_korean_article_locator(article)}"


def format_document_reference(
    *,
    title: str | None,
    document_number: str,
    language: str | None = None,
) -> str:
    """DESIGN v3 grade B — document name/number only, never invent articles."""
    _ = language
    return format_structured_citation(
        title=title,
        document_number=document_number,
        article=None,
    )


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
