"""
VFBCAI Legal Intelligence Platform — Prompt Builder (STEP5-2).

Evidence Pack을 그대로 GPT에게 전달하지 않는다. 이 모듈은:

    EvidencePack 목록 -> Prompt Builder -> PromptPackage(LLM Prompt)

로 변환하는 순수 텍스트 조립 전용 독립 모듈이다.

⚠️ 이 모듈은 OpenAI API를 절대 호출하지 않는다 — Prompt 문자열만 만들어
   반환한다. Search Engine/Evidence Builder/SearchResult/EvidencePack/Document는
   이 모듈에서 전혀 수정하지 않으며(읽기 전용으로만 사용), 검색 점수 역시
   절대 변경하지 않는다(토큰 예산 초과 시에도 "어떤 Evidence/조항을 프롬프트에
   포함시킬지"만 선택할 뿐, score 값 자체를 건드리지 않는다).
"""

from __future__ import annotations

from dataclasses import dataclass, field, replace
from datetime import datetime, timezone

from .evidence_builder import ArticleReference, EvidencePack

# ---------------------------------------------------------------------------
# 버전/기본값
# ---------------------------------------------------------------------------

# evidence_builder.py 자체는 __version__을 export하지 않으므로(수정 금지 원칙상
# 추가하지 않음), 이 모듈이 가정하는 EvidencePack 스키마 계약 버전을 여기서
# 문서화 목적으로 자체 선언한다.
EVIDENCE_BUILDER_VERSION = "step5-1"
PROMPT_BUILDER_VERSION = "step5-2"

DEFAULT_MAX_TOKENS = 8000

NO_EVIDENCE_MESSAGE = "관련 법령을 찾지 못했습니다."
INSUFFICIENT_EVIDENCE_MESSAGE = "추가 전문가 검토가 필요합니다."


# ---------------------------------------------------------------------------
# PromptPackage — 최종 산출물
# ---------------------------------------------------------------------------


@dataclass
class PromptPackage:
    system_prompt: str
    user_prompt: str
    evidence_count: int      # 프롬프트에 실제로 포함된 Evidence Pack 개수(토큰 트리밍 반영)
    document_count: int      # 위와 동일 개념(문서 단위 = Evidence Pack 단위이므로 evidence_count와 같음)
    article_count: int       # 프롬프트에 실제로 포함된 관련 조항 총 개수(토큰 트리밍 반영)
    estimated_tokens: int    # system_prompt + user_prompt 합산 추정 토큰 수
    metadata: dict

    def to_dict(self) -> dict:
        return {
            "system_prompt": self.system_prompt,
            "user_prompt": self.user_prompt,
            "evidence_count": self.evidence_count,
            "document_count": self.document_count,
            "article_count": self.article_count,
            "estimated_tokens": self.estimated_tokens,
            "metadata": dict(self.metadata),
        }


# ---------------------------------------------------------------------------
# 토큰 추정 — 실제 tokenizer(tiktoken 등) 의존성 없이 순수 휴리스틱으로 근사.
# CJK/한글 문자는 대체로 문자당 1토큰에 가깝고, 라틴 문자(영어/베트남어 성조
# 포함)는 대체로 4자당 1토큰에 가깝다는 일반적인 경험칙을 사용한다.
# ⚠️ 이것은 근사치이며 실제 OpenAI tokenizer의 정확한 카운트가 아니다.
# ---------------------------------------------------------------------------


def _is_cjk_or_hangul(ch: str) -> bool:
    code = ord(ch)
    return (
        0xAC00 <= code <= 0xD7A3    # Hangul Syllables
        or 0x4E00 <= code <= 0x9FFF   # CJK Unified Ideographs
        or 0x3040 <= code <= 0x30FF   # Hiragana/Katakana
    )


def estimate_tokens(text: str) -> int:
    """텍스트의 추정 토큰 수(휴리스틱 근사치, 정확한 tokenizer 아님)."""
    if not text:
        return 0
    cjk_chars = sum(1 for ch in text if _is_cjk_or_hangul(ch))
    other_chars = len(text) - cjk_chars
    other_tokens = (other_chars + 3) // 4  # 4자당 1토큰(올림)
    return cjk_chars + max(other_tokens, 1 if other_chars else 0)


# ---------------------------------------------------------------------------
# System Prompt
# ---------------------------------------------------------------------------


def build_system_prompt(
    *,
    answer_tier: str = "direct",
    service_group: str | None = None,
) -> str:
    lines = [
        "당신은 베트남 법률 AI Review Assistant입니다.",
        "",
        "다음 원칙을 반드시 지키십시오:",
        "- 아래 제공된 Evidence(검색된 베트남 법령 근거)만을 근거로 판단하십시오.",
        "- Evidence에 없는 법률 내용을 만들어내지 마십시오.",
        "- 추측하지 마십시오.",
        "- 환각(hallucination)을 절대 생성하지 마십시오.",
        '- 확정적 판단 문장("~입니다", "~해야 합니다", "무효입니다", "사기입니다", "책임이 있습니다")을 쓰지 마십시오.',
        '- 허용 표현: "~로 해석될 수 있습니다", "~와 관련이 있을 수 있습니다", "~조문이 적용될 가능성이 있습니다".',
        "- 질문 하나에 완결된 답을 작성하고, 절차·서류는 번호 목록으로 구분하십시오.",
        "- 법률 용어 옆에 짧은 풀이를 병기하십시오 (예: 노동허가(Work Permit)).",
    ]
    if answer_tier == "related":
        lines.extend(
            [
                "- 이번 Evidence는 질의와 완전히 일치하지 않을 수 있는 '관련 근거'입니다.",
                "- 답변 문장마다 근거 조문(문서번호·Điều/Khoản/Điểm)을 반드시 먼저 구체적으로 명시한 뒤, 그다음에 해석 표현을 붙이십시오.",
                '- "관련 법령에 따르면", "해당 법령에 의하면", "법적으로는" 같은 조문 없이 근거를 흐리게 하는 얼버무리는 표현을 절대 쓰지 마십시오.',
                "- 여러 해석 가능성을 제시하되, 판례·행정 해석 차이가 있을 수 있음을 명시하십시오.",
            ]
        )
        if service_group == "verify":
            lines.append(
                "- VERIFY(계약/분쟁/사기/세무) 영역: 인접 조문·일반 원칙을 근거로 해석 가이드를 적극 제시하십시오."
            )
    if service_group in {"check", "register"}:
        lines.extend(
            [
                "- CHECK/REGISTER(행정·인허가) 영역: 필요 서류·절차·순서는 구체적으로 안내할 수 있습니다.",
                "- 단, 최종 승인/거절 여부는 절대 판단하지 마십시오 (정부기관 영역).",
            ]
        )
    lines.append(
        f'- 관련 Evidence가 없으면 반드시 "{NO_EVIDENCE_MESSAGE}"라고만 답하십시오.'
    )
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Evidence Section 렌더링
# ---------------------------------------------------------------------------


def _format_locator(article: ArticleReference) -> str:
    if article.article_no is None and article.clause_no is None and article.item_no is None:
        return "(문서 전체)"
    parts: list[str] = [f"Điều {article.article_no}"] if article.article_no else []
    if article.clause_no:
        parts.append(f"Khoản {article.clause_no}")
    if article.item_no:
        parts.append(f"Điểm {article.item_no}")
    return " ".join(parts) if parts else "(문서 전체)"


def _render_evidence_block(pack: EvidencePack, index: int) -> str:
    document_number = ", ".join(pack.document_number) if pack.document_number else "(없음)"
    related_articles = (
        ", ".join(_format_locator(a) for a in pack.articles) if pack.articles else "(없음)"
    )
    lines = [
        f"[Evidence {index}]",
        f"문서번호: {document_number}",
        f"문서명: {pack.title or '(없음)'}",
        f"발행기관: {pack.issuing_authority or '(없음)'}",
        f"시행일: {pack.effective_date or '(없음)'}",
        f"관련 조항: {related_articles}",
        f"Match Type: {pack.top_match_type}",
        f"검색 점수: {pack.top_score}",
        f"출처 URL: {pack.official_url or '(없음)'}",
    ]
    return "\n".join(lines)


def build_evidence_section(packs: list[EvidencePack]) -> str:
    """EvidencePack 목록(문서번호 순으로 이미 정렬되어 들어온다고 가정 —
    evidence_builder.build_evidence_packs()의 계약)을 Prompt용 텍스트로 렌더링."""
    if not packs:
        return "(제공된 Evidence 없음)"
    blocks = [_render_evidence_block(p, i) for i, p in enumerate(packs, start=1)]
    return "\n\n".join(blocks)


# ---------------------------------------------------------------------------
# Response Rules
# ---------------------------------------------------------------------------


def build_response_rules(*, answer_tier: str = "direct") -> str:
    tier_note = ""
    if answer_tier == "related":
        tier_note = (
            "7. 관련 근거 기반 답변: 각 문장마다 문서번호·조항(Điều/Khoản/Điểm)을 먼저 "
            "구체적으로 명시한 뒤 해석 표현을 붙이십시오.\n"
            '8. "관련 법령에 따르면", "해당 법령에 의하면" 등 조문 없이 근거를 흐리는 '
            "표현을 쓰지 마십시오.\n"
        )
    return (
        "Response Rules:\n"
        "1. Evidence 밖의 법률을 생성하지 마십시오.\n"
        "2. Evidence 밖의 조항을 생성하지 마십시오.\n"
        "3. Evidence 밖의 준비서류를 생성하지 마십시오.\n"
        f'4. 관련 Evidence가 없으면 "{NO_EVIDENCE_MESSAGE}"라고만 답하십시오.\n'
        f'5. 근거가 부족하면 "{INSUFFICIENT_EVIDENCE_MESSAGE}"라고 답하십시오.\n'
        "6. 답변 시 반드시 인용한 Evidence의 문서번호와 조항을 함께 표시하십시오.\n"
        f"{tier_note}"
    )


# ---------------------------------------------------------------------------
# 토큰 예산 내 트리밍 — 점수순 -> 문서번호순 -> 조항순
#
# "어떤 Evidence/조항을 포함할지"만 선택하며, score 값 자체는 절대 변경하지
# 않는다. EvidencePack도 직접 mutate하지 않고 dataclasses.replace()로 새
# 인스턴스만 만든다(원본 객체는 항상 그대로 보존됨).
# ---------------------------------------------------------------------------


def _doc_number_sort_key(pack: EvidencePack) -> tuple[str, str]:
    return (pack.document_number[0] if pack.document_number else "", pack.document_id)


def _fit_within_budget(
    packs: list[EvidencePack], budget_tokens: int
) -> list[EvidencePack]:
    """packs(문서번호 순 입력)를 budget_tokens 안에 들어오도록 트리밍한다.

    선택 우선순위: 점수순(top_score 내림차순) -> 문서번호순 -> 조항순.
    한 Evidence Pack 전체가 안 들어가면, 그 Pack 안에서 조항을 점수순으로
    남기며 잘라낸다(조항 자체의 정렬 순서는 유지, dedupe도 이미 완료된 상태
    이므로 여기서는 개수만 줄인다). 잘려나간 Pack/조항은 버려질 뿐, score
    값 자체는 전혀 수정하지 않는다.
    """
    if budget_tokens <= 0:
        return []

    # 1) 선택 우선순위: 점수순(내림차순) -> 문서번호순 -> document_id
    priority_order = sorted(
        packs, key=lambda p: (-p.top_score, *_doc_number_sort_key(p))
    )

    kept: list[EvidencePack] = []
    used_tokens = 0

    for pack in priority_order:
        full_text = _render_evidence_block(pack, 1)  # 인덱스는 트리밍 판단에 영향 없음
        full_tokens = estimate_tokens(full_text)

        if used_tokens + full_tokens <= budget_tokens:
            kept.append(pack)
            used_tokens += full_tokens
            continue

        # 전체가 안 들어가면, 조항을 점수순으로 남기며 잘라낸다(정렬은
        # evidence_builder가 이미 Article->Clause->Point로 해둔 값을 유지).
        if not pack.articles:
            continue  # 조항 자체가 없으면 더 줄일 게 없음 -> 이 Pack은 제외

        articles_by_score_desc = sorted(pack.articles, key=lambda a: -a.score)
        for cut in range(len(articles_by_score_desc), 0, -1):
            kept_article_set = set(a.dedup_key() for a in articles_by_score_desc[:cut])
            trimmed_articles = [a for a in pack.articles if a.dedup_key() in kept_article_set]
            candidate = replace(pack, articles=trimmed_articles)
            candidate_text = _render_evidence_block(candidate, 1)
            candidate_tokens = estimate_tokens(candidate_text)
            if used_tokens + candidate_tokens <= budget_tokens:
                kept.append(candidate)
                used_tokens += candidate_tokens
                break
        # cut까지 다 시도해도 안 들어가면(헤더만으로도 예산 초과) 이 Pack은 완전히 제외

    # 2) 최종 표시 순서는 항상 문서번호 순(Evidence Section 지시사항)
    kept.sort(key=_doc_number_sort_key)
    return kept


# ---------------------------------------------------------------------------
# 핵심 빌더 함수
# ---------------------------------------------------------------------------


def build_prompt(
    evidence_packs: list[EvidencePack],
    user_question: str,
    language: str | None = None,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    *,
    answer_tier: str = "direct",
    service_group: str | None = None,
) -> PromptPackage:
    """EvidencePack 목록 + 사용자 질문 -> PromptPackage(LLM에 보낼 프롬프트).

    OpenAI API를 호출하지 않는다 — 프롬프트 문자열만 만들어 반환한다.
    `evidence_packs`/그 안의 `ArticleReference`는 이 함수에서 절대 mutate되지
    않는다(트리밍이 필요하면 dataclasses.replace()로 새 객체만 생성).
    """
    system_prompt = build_system_prompt(answer_tier=answer_tier, service_group=service_group)
    response_rules = build_response_rules(answer_tier=answer_tier)

    # 시스템 프롬프트 + Evidence 섹션 이외의 고정 오버헤드(질문/규칙/구조 텍스트)
    # 토큰을 먼저 계산해, Evidence 섹션에 남는 예산을 구한다.
    overhead_text = (
        system_prompt
        + "\n\nUser Question:\n" + (user_question or "")
        + "\n\n" + response_rules
    )
    overhead_tokens = estimate_tokens(overhead_text)
    evidence_budget = max(max_tokens - overhead_tokens, 0)

    full_evidence_tokens = estimate_tokens(build_evidence_section(evidence_packs))
    if full_evidence_tokens <= evidence_budget:
        # 트리밍이 필요 없어도 Evidence Section 표시 순서는 항상 문서번호 순이어야 한다
        # (지시사항: "Evidence가 여러 개면 문서번호 순으로 정렬"). 원본 리스트는 건드리지
        # 않고 새 리스트만 정렬해서 사용한다.
        selected_packs = sorted(evidence_packs, key=_doc_number_sort_key)
    else:
        selected_packs = _fit_within_budget(evidence_packs, evidence_budget)

    evidence_section = build_evidence_section(selected_packs)

    user_prompt = (
        "Evidence Section:\n"
        f"{evidence_section}\n\n"
        "User Question:\n"
        f"{user_question or ''}\n\n"
        f"{response_rules}"
    )

    estimated_tokens = estimate_tokens(system_prompt) + estimate_tokens(user_prompt)

    article_count = sum(len(p.articles) for p in selected_packs)

    metadata = {
        "language": language,
        "answer_tier": answer_tier,
        "service_group": service_group,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "evidence_builder_version": EVIDENCE_BUILDER_VERSION,
        "prompt_builder_version": PROMPT_BUILDER_VERSION,
    }

    return PromptPackage(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        evidence_count=len(selected_packs),
        document_count=len(selected_packs),
        article_count=article_count,
        estimated_tokens=estimated_tokens,
        metadata=metadata,
    )
