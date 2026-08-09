"""Answer generation policy — disclaimer, tier-3 referral, and DESIGN v3 grade B/C copy."""

from __future__ import annotations

import re
from dataclasses import dataclass
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
    "정확한 서류 목록·예시 샘플·맞춤 AI 리포트·전문가 검토는 무료 회원가입 후 "
    "마이페이지에서 이용하실 수 있습니다."
)
_SIGNUP_CTA_VI = (
    "Đăng ký miễn phí để xem mẫu hồ sơ, báo cáo AI và hỗ trợ chuyên gia tại Trang của tôi."
)

_MYPAGE_SAMPLES_CTA_KO = (
    "정확한 서류 목록과 예시 샘플은 무료회원 가입 후 마이페이지에서 확인하실 수 있습니다."
)
_MYPAGE_SAMPLES_CTA_VI = (
    "Danh sách hồ sơ chính xác và mẫu ví dụ có thể xem tại Trang của tôi sau khi đăng ký miễn phí."
)

_EXPERT_CTA_KO = (
    "회원님 상황에 맞는 정확한 확인이 필요하시면, 마이페이지 Case Room에서 "
    "「전문가 상담 요청」을 남겨 주세요. VFBCAI 전문가팀이 서류를 검토한 뒤 "
    "다음 단계를 안내해 드립니다."
)
_EXPERT_CTA_VI = (
    'Nhấn "Yêu cầu tư vấn chuyên gia" trong phòng tư vấn — đội ngũ VFBCAI sẽ '
    "xem xét hồ sơ và hướng dẫn bước tiếp theo."
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

@dataclass(frozen=True)
class DocumentGuideTier:
    """Required administrative documents vs situational attachments."""

    required: tuple[str, ...]
    supplementary: tuple[str, ...]


_GUIDANCE_DOCUMENTS_KO: dict[str, DocumentGuideTier] = {
    "giấy phép lao động": DocumentGuideTier(
        required=(
            "여권 사본 및 현재 체류 자격(비자) 정보",
            "고용계약서·회사 사업자등록 등 근로 관계를 보여주는 기본 서류",
            "노동허가 신청에 필요한 정해진 행정 서식(해당 시)",
        ),
        supplementary=(
            "학력·경력 증명서, 건강검진 결과 등 자격 요건 증빙",
            "이전 허가증·갱신 이력이 있다면 해당 사본",
            "고용주(회사) 측에서 요청하는 추가 확인 서류",
        ),
    ),
    "thẻ tạm thường trú": DocumentGuideTier(
        required=(
            "여권 및 현재 체류 자격(비자/스탬프)과 만료일",
            "거주 목적을 보여주는 근로·사업·가족 관계 기본 증빙",
            "거주지 주소를 확인할 수 있는 임대차·거주 확인 서류",
        ),
        supplementary=(
            "회사·사업자 관련 서류(근로·투자 목적인 경우)",
            "이전 TRC·체류 이력이 있다면 해당 사본",
            "기관에서 추가로 요청한 확인 서류",
        ),
    ),
    "tạm trú": DocumentGuideTier(
        required=(
            "여권·입국 스탬프 및 현재 체류 상태",
            "거주지 주소·임대차 또는 거주 확인 서류",
            "임시거주등록(땀주) 신청·연장에 필요한 정해진 행정 서식",
        ),
        supplementary=(
            "등록·연장 사유를 설명할 수 있는 상황 정리(거주 시작일·주소 등)",
            "집주인·거주지 확인에 필요한 추가 연락처·서류",
            "이전 등록증 사본(갱신·연장인 경우)",
        ),
    ),
    "giấy phép lái xe": DocumentGuideTier(
        required=(
            "여권 및 현재 체류 자격 증빙",
            "본국 운전면허증(전환·교환 신청 시)",
            "신청 유형에 맞는 정해진 행정 서식",
        ),
        supplementary=(
            "면허증 공증·번역본(요구되는 경우)",
            "거주지·체류 기간 확인 서류",
            "이전 발급·갱신 이력이 있다면 해당 사본",
        ),
    ),
    "lừa đảo": DocumentGuideTier(
        required=(
            "계약서·영수증·송금 내역 등 거래의 핵심 증빙",
            "상대방과의 연락 기록(메신저·이메일 등)",
            "문제가 된 약속·지급·인도 시점을 정리한 메모",
        ),
        supplementary=(
            "부동산·회사의 소유·대리 권한을 확인할 수 있는 자료",
            "중개인·제3자 관련 서류·대화 기록",
            "이미 제출한 신고·민원 접수 확인서(있다면)",
        ),
    ),
    "hợp đồng thuê nhà": DocumentGuideTier(
        required=(
            "임대차 계약서 원본 또는 사본",
            "보증금·월세 지급 내역(송금·영수증 등)",
            "분쟁이 된 조항이 표시된 계약서",
        ),
        supplementary=(
            "부동산 소유·대리 권한 확인 자료",
            "입주 전·후 사진, 수리·하자 관련 기록",
            "집주인·중개인과의 추가 연락 기록",
        ),
    ),
}

_DEFAULT_GUIDE_KO: dict[str, DocumentGuideTier] = {
    "check": DocumentGuideTier(
        required=(
            "여권 사본 및 현재 체류 자격·만료일",
            "질문과 직접 관련된 허가증·신청 서류 사본",
            "해당 절차에 필요한 정해진 행정 서식(있는 경우)",
        ),
        supplementary=(
            "고용·거주·사업 관계를 보여주는 계약서·확인서",
            "지금까지 진행한 절차와 결과를 짧게 정리한 메모",
            "기관·회사에서 추가로 요청한 서류",
        ),
    ),
    "verify": DocumentGuideTier(
        required=(
            "검토가 필요한 계약서·영수증·송금 내역 등 핵심 자료",
            "상대방·부동산·회사의 신원·권한을 확인할 수 있는 기본 자료",
            "무엇이 걱정되는지 한 문장으로 정리한 메모",
        ),
        supplementary=(
            "메신저·이메일 등 추가 연락 기록",
            "중개·제3자 관련 서류",
            "이미 받은 안내·통지·반려 문서(있다면)",
        ),
    ),
    "register": DocumentGuideTier(
        required=(
            "사업 형태(개인·법인)·업종·예상 영업 장소 정보",
            "대표자 신분·거주 관련 기본 증빙",
            "설립·인허가에 필요한 정해진 신청 서식",
        ),
        supplementary=(
            "임대차·투자·자본 관련 확인 서류",
            "이미 받은 안내문·반려 통지·임시 허가 사본",
            "업종별 추가 요구 서류(해당 시)",
        ),
    ),
}

_DEFAULT_GUIDE_FALLBACK_KO = DocumentGuideTier(
    required=(
        "여권 및 현재 체류·거주 관련 기본 정보",
        "질문과 관련된 계약서·허가증·신청 서류 사본",
        "해당 절차에 필요한 정해진 행정 서식(있는 경우)",
    ),
    supplementary=(
        "지금까지 진행한 절차와 결과를 짧게 정리한 메모",
        "상대방·회사·부동산 관련 추가 확인 자료",
        "기관에서 요청한 추가 서류",
    ),
)


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


def _resolve_document_guide(
    *,
    canonical: str | None,
    service_group: str | None,
) -> DocumentGuideTier:
    if canonical and canonical in _GUIDANCE_DOCUMENTS_KO:
        return _GUIDANCE_DOCUMENTS_KO[canonical]
    if service_group and service_group in _DEFAULT_GUIDE_KO:
        return _DEFAULT_GUIDE_KO[service_group]
    return _DEFAULT_GUIDE_FALLBACK_KO


def _format_bullet_block(items: tuple[str, ...], *, prefix: str = "  · ") -> str:
    return "\n".join(f"{prefix}{item}" for item in items)


def _format_document_guide_section(
    guide: DocumentGuideTier,
    *,
    language: str | None,
) -> str:
    if language == "vi":
        return (
            "【Hồ sơ hành chính bắt buộc】\n"
            f"{_format_bullet_block(guide.required)}\n\n"
            "【Hồ sơ bổ sung】\n"
            f"{_format_bullet_block(guide.supplementary)}\n\n"
            f"{_MYPAGE_SAMPLES_CTA_VI}"
        )
    return (
        "【필수 행정서류】\n"
        f"{_format_bullet_block(guide.required)}\n\n"
        "【추가·첨부 서류】\n"
        f"{_format_bullet_block(guide.supplementary)}\n\n"
        f"{_MYPAGE_SAMPLES_CTA_KO}"
    )


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
    guide = _resolve_document_guide(canonical=canonical, service_group=service_group)
    guide_section = _format_document_guide_section(guide, language=language)

    if language == "vi":
        intro = f"Về câu hỏi của bạn ({q}), " if q else "Về câu hỏi của bạn, "
        body = (
            f"{intro}chúng tôi hiểu đây là vấn đề liên quan đến **{topic}**.\n\n"
            "Hiện chưa xác định được văn bản pháp luật cụ thể trong cơ sở dữ liệu, "
            "nhưng bạn có thể chuẩn bị hồ sơ theo thứ tự sau để được hỗ trợ nhanh hơn:\n\n"
            f"{guide_section}\n\n"
            f"{_EXPERT_CTA_VI}"
        )
    else:
        intro = f"말씀하신 \"{q}\"" if q else "말씀하신 내용"
        body = (
            f"{intro}은(는) **{topic}** 관련 문의로 이해했습니다.\n\n"
            "지금 단계에서는 데이터베이스에서 귀하의 상황에 바로 대응하는 법령 조문을 "
            "특정하지 못했습니다. 다만 아래 순서로 서류를 준비하시면, 전문가 상담 시 "
            "훨씬 빠르게 맞춤 안내를 받으실 수 있습니다.\n\n"
            f"{guide_section}\n\n"
            f"{_EXPERT_CTA_KO}"
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


_TITLE_BOILERPLATE_RE = re.compile(
    r"^(?:Sửa đổi, bổ sung một số điều của(?: của)? |"
    r"Hướng dẫn (?:thực hiện |thủ tục )?|"
    r"Quy định (?:chi tiết và hướng dẫn thi hành |mẫu )?|"
    r"Thông tư hướng dẫn )",
    re.IGNORECASE,
)
_LAW_CORE_RE = re.compile(r"(Luật\s+[^.]{4,80})", re.IGNORECASE)
_DECREE_CORE_RE = re.compile(r"(Nghị định\s+[^.]{4,60})", re.IGNORECASE)


def abbreviate_vietnamese_title(title: str | None, *, max_len: int = 44) -> str:
    """Shorten long Vietnamese legal document titles for chat readability."""
    text = (title or "").strip()
    if not text:
        return ""
    text = _TITLE_BOILERPLATE_RE.sub("", text).strip()
    for pattern in (_LAW_CORE_RE, _DECREE_CORE_RE):
        match = pattern.search(text)
        if match:
            text = match.group(1).strip()
            break
    if len(text) > max_len:
        text = text[: max_len - 1].rstrip(" ,;") + "…"
    return text


def _format_document_list(
    refs: list[dict[str, str | None]],
    *,
    language: str | None,
    max_items: int = 3,
) -> str:
    if not refs:
        return ""
    lines: list[str] = []
    for ref in refs[:max_items]:
        number = (ref["document_number"] or "").strip()
        short_title = abbreviate_vietnamese_title(ref["title"])
        if language == "vi":
            if short_title and short_title != number:
                lines.append(f"· {number}\n  {short_title}")
            else:
                lines.append(f"· {number or short_title}")
        else:
            if short_title and short_title != number:
                lines.append(f"· {number}\n  {short_title}")
            else:
                lines.append(f"· {number or short_title}")
    remaining = len(refs) - max_items
    if remaining > 0:
        if language == "vi":
            lines.append(f"· +{remaining} văn bản liên quan khác")
        else:
            lines.append(f"· 외 {remaining}건의 관련 문서")
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
    _, canonical = _resolve_guidance_topic(q, service_group=service_group, service_type=None)

    doc_count = len(refs)
    if language == "vi":
        intro = f"Về câu hỏi của bạn ({q}), " if q else "Về câu hỏi của bạn, "
        body = (
            f"{intro}đã xác định {doc_count} văn bản liên quan đến {context}:\n\n"
            f"{doc_block}\n\n"
            "Tuy nhiên, AI chưa thể xác định chính xác điều/khoản cụ thể áp dụng cho trường hợp của bạn. "
            "Vui lòng tham khảo hồ sơ bên dưới và yêu cầu tư vấn chuyên gia khi cần xác nhận chính xác."
        )
        if include_signup_cta:
            body += f"\n\n{_SIGNUP_CTA_VI}"
    else:
        intro = f"말씀하신 \"{q}\"" if q else "말씀하신 내용"
        body = (
            f"{intro}은(는) **{context}** 관련 문의로 이해했습니다.\n\n"
            f"관련 법령·문서 **{doc_count}건**이 확인되었습니다:\n\n"
            f"{doc_block}\n\n"
            "다만 귀하의 상황에 적용되는 구체 조항(Điều/Khoản)까지는 아직 특정하지 못했습니다. "
            "아래 서류 준비 순서를 참고해 주세요.\n\n"
            f"{_format_document_guide_section(_resolve_document_guide(canonical=canonical, service_group=service_group), language=language)}\n\n"
            f"{_EXPERT_CTA_KO}"
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
            f"말씀하신 내용은 **{topic}** 관련 사안으로 보입니다.\n\n"
            "비회원 상태에서는 일반적인 절차·서류 안내만 드릴 수 있습니다. "
            "개인 상황에 맞는 법령 근거·조항·AI 리포트는 회원 전용입니다.\n\n"
            f"{_format_document_guide_section(_DEFAULT_GUIDE_FALLBACK_KO, language=language)}\n\n"
            f"{_SIGNUP_CTA_KO}"
        )
    return append_mandatory_disclaimer(body)
