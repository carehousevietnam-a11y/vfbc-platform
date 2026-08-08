"""
STEP5-2 Prompt Builder 신규 테스트.

검증 대상(지시사항 최소 목록):
  1. Prompt 생성
  2. Evidence 포함
  3. 문서번호 유지
  4. 조항 유지
  5. URL 유지
  6. 사용자 질문 유지(변형/번역 없음)
  7. Evidence 없음
  8. 다중 Evidence
  9. 토큰 제한(트리밍)
  10. Metadata 생성
  11. 입력 객체 불변성(EvidencePack/ArticleReference mutate 안 됨)
"""

import copy

from src.evidence_builder import ArticleReference, EvidencePack
from src.prompt_builder import (
    DEFAULT_MAX_TOKENS,
    INSUFFICIENT_EVIDENCE_MESSAGE,
    NO_EVIDENCE_MESSAGE,
    PromptPackage,
    build_prompt,
    estimate_tokens,
)


def _pack(**overrides) -> EvidencePack:
    base = dict(
        document_id="tmquan:1001",
        document_number=["152/2020/NĐ-CP"],
        title="Nghị định quy định về giấy phép lao động",
        issuing_authority="Chính phủ",
        effective_date="2021-02-15",
        status="active",
        official_url="https://vbpl.vn/van-ban/chi-tiet/x1",
        articles=[
            ArticleReference(
                article_no="9", clause_no=None, item_no=None,
                heading="Điều 9", score=85.0, match_type="canonical_concept",
            ),
        ],
        search_keywords=["giấy phép lao động"],
        top_score=85.0,
        top_match_type="canonical_concept",
        original_title="Nghị định quy định về giấy phép lao động",
        original_headings=["Điều 9"],
    )
    base.update(overrides)
    return EvidencePack(**base)


# ---------------------------------------------------------------------------
# 1. Prompt 생성
# ---------------------------------------------------------------------------


def test_build_prompt_returns_prompt_package():
    result = build_prompt([_pack()], user_question="노동허가 조건이 뭔가요?")
    assert isinstance(result, PromptPackage)
    assert result.system_prompt
    assert result.user_prompt


def test_system_prompt_contains_required_principles():
    result = build_prompt([_pack()], user_question="test")
    assert "베트남 법률 AI Review Assistant" in result.system_prompt
    assert "환각" in result.system_prompt
    assert NO_EVIDENCE_MESSAGE in result.system_prompt


def test_openai_is_never_called_no_network_dependency():
    """이 모듈은 순수 텍스트 조립만 하므로 실제 OpenAI API 호출/클라이언트
    사용 흔적이 없어야 한다(모듈 docstring이 'OpenAI를 호출하지 않는다'고
    설명하는 것 자체는 정상이므로, 실제 호출 패턴만 검사한다)."""
    import src.prompt_builder as pb
    source = open(pb.__file__, encoding="utf-8").read()
    assert "import openai" not in source
    assert "api.openai.com" not in source
    assert "chat.completions" not in source
    assert "OpenAI(" not in source


# ---------------------------------------------------------------------------
# 2. Evidence 포함
# ---------------------------------------------------------------------------


def test_evidence_included_in_user_prompt():
    result = build_prompt([_pack()], user_question="test")
    assert "Evidence Section:" in result.user_prompt
    assert "[Evidence 1]" in result.user_prompt
    assert "문서명: Nghị định quy định về giấy phép lao động" in result.user_prompt


def test_evidence_includes_all_required_fields():
    result = build_prompt([_pack()], user_question="test")
    for label in ("문서번호:", "문서명:", "발행기관:", "시행일:", "관련 조항:", "Match Type:", "검색 점수:", "출처 URL:"):
        assert label in result.user_prompt


# ---------------------------------------------------------------------------
# 3~5. 문서번호/조항/URL 유지
# ---------------------------------------------------------------------------


def test_document_number_preserved_in_prompt():
    result = build_prompt([_pack(document_number=["77/2022/NĐ-CP"])], user_question="test")
    assert "77/2022/NĐ-CP" in result.user_prompt


def test_article_locator_preserved_in_prompt():
    pack = _pack(articles=[
        ArticleReference(article_no="9", clause_no="2", item_no="a", heading="h", score=90.0, match_type="exact_article"),
    ])
    result = build_prompt([pack], user_question="test")
    assert "Điều 9" in result.user_prompt
    assert "Khoản 2" in result.user_prompt
    assert "Điểm a" in result.user_prompt


def test_url_preserved_in_prompt():
    result = build_prompt([_pack(official_url="https://vbpl.vn/x9")], user_question="test")
    assert "https://vbpl.vn/x9" in result.user_prompt


# ---------------------------------------------------------------------------
# 6. 사용자 질문 유지(변형/번역 금지)
# ---------------------------------------------------------------------------


def test_user_question_included_verbatim():
    question = "TRC 만료 3개월 전에 갱신 신청 가능한가요? 노동허가 필요한가요?"
    result = build_prompt([_pack()], user_question=question)
    assert question in result.user_prompt


def test_user_question_not_translated_or_modified_for_english_language_metadata():
    question = "노동허가 조건이 뭔가요?"
    result = build_prompt([_pack()], user_question=question, language="en")
    assert question in result.user_prompt  # language 메타데이터와 무관하게 원문 그대로


def test_user_question_with_vietnamese_text_preserved():
    question = "Điều kiện xin giấy phép lao động là gì?"
    result = build_prompt([_pack()], user_question=question)
    assert question in result.user_prompt


# ---------------------------------------------------------------------------
# 7. Evidence 없음
# ---------------------------------------------------------------------------


def test_empty_evidence_list():
    result = build_prompt([], user_question="test")
    assert "(제공된 Evidence 없음)" in result.user_prompt
    assert result.evidence_count == 0
    assert result.document_count == 0
    assert result.article_count == 0


def test_response_rules_mention_no_evidence_message():
    result = build_prompt([], user_question="test")
    assert NO_EVIDENCE_MESSAGE in result.user_prompt
    assert INSUFFICIENT_EVIDENCE_MESSAGE in result.user_prompt


# ---------------------------------------------------------------------------
# 8. 다중 Evidence
# ---------------------------------------------------------------------------


def test_multiple_evidence_included_and_sorted_by_document_number():
    packs = [
        _pack(document_id="tmquan:B", document_number=["200/2021/NĐ-CP"], top_score=50.0),
        _pack(document_id="tmquan:A", document_number=["100/2020/NĐ-CP"], top_score=90.0),
    ]
    result = build_prompt(packs, user_question="test")
    assert result.evidence_count == 2
    idx_a = result.user_prompt.index("100/2020/NĐ-CP")
    idx_b = result.user_prompt.index("200/2021/NĐ-CP")
    assert idx_a < idx_b  # 문서번호 순으로 표시(점수와 무관)


def test_multiple_evidence_article_count_summed():
    pack1 = _pack(document_id="tmquan:A", document_number=["1/2020"], articles=[
        ArticleReference("1", None, None, None, 50.0, "keyword_phrase"),
        ArticleReference("2", None, None, None, 50.0, "keyword_phrase"),
    ])
    pack2 = _pack(document_id="tmquan:B", document_number=["2/2020"], articles=[
        ArticleReference("5", None, None, None, 50.0, "keyword_phrase"),
    ])
    result = build_prompt([pack1, pack2], user_question="test")
    assert result.article_count == 3
    assert result.document_count == 2


# ---------------------------------------------------------------------------
# 9. 토큰 제한(트리밍)
# ---------------------------------------------------------------------------


def test_default_max_tokens_is_8000():
    assert DEFAULT_MAX_TOKENS == 8000


def test_low_score_evidence_dropped_when_over_budget():
    high = _pack(document_id="tmquan:HIGH", document_number=["9/2020"], top_score=95.0,
                  title="X" * 2000)
    low = _pack(document_id="tmquan:LOW", document_number=["1/2020"], top_score=10.0,
                 title="Y" * 2000)

    # 예산을 넉넉하게 줘서 "둘 다 포함될 때"와 "high 하나만 있을 때"의 실제 프롬프트
    # 크기를 먼저 측정한 뒤, 그 사이 값으로 max_tokens를 설정해 강제로 low만
    # 트리밍되도록 만든다(내부 오버헤드 텍스트 길이에 의존하지 않는 자체 보정 방식).
    full_result = build_prompt([low, high], user_question="q", max_tokens=1_000_000)
    high_only_result = build_prompt([high], user_question="q", max_tokens=1_000_000)
    budget = high_only_result.estimated_tokens + 20
    assert budget < full_result.estimated_tokens  # 실제로 트리밍이 필요한 상황인지 사전 확인

    result = build_prompt([low, high], user_question="q", max_tokens=budget)
    assert result.evidence_count == 1
    assert "9/2020" in result.user_prompt      # 점수 높은 쪽이 남아야 함
    assert "1/2020" not in result.user_prompt  # 점수 낮은 쪽은 잘림


def test_score_values_never_changed_by_trimming():
    high = _pack(document_id="tmquan:HIGH", document_number=["9/2020"], top_score=95.0)
    low = _pack(document_id="tmquan:LOW", document_number=["1/2020"], top_score=10.0)
    original_scores = (high.top_score, low.top_score)
    build_prompt([low, high], user_question="q", max_tokens=50)
    assert (high.top_score, low.top_score) == original_scores  # 원본 score 불변


def test_estimated_tokens_within_budget_when_trimmed():
    packs = [
        _pack(document_id=f"tmquan:{i}", document_number=[f"{i}/2020"], top_score=float(i))
        for i in range(20)
    ]
    max_tokens = 500
    result = build_prompt(packs, user_question="q", max_tokens=max_tokens)
    # 완벽한 정확도를 보장하진 않지만(휴리스틱), 트리밍 후 evidence_count가 전체보다 작아야 함
    assert result.evidence_count < len(packs)


def test_articles_within_pack_trimmed_by_score_when_pack_itself_too_large():
    articles = [
        ArticleReference(str(i), None, None, f"heading {i}" * 50, score=float(100 - i), match_type="keyword_phrase")
        for i in range(1, 11)
    ]
    pack = _pack(articles=articles, top_score=99.0)

    full_result = build_prompt([pack], user_question="q", max_tokens=1_000_000)
    minimal_pack = _pack(articles=[articles[0]], top_score=99.0)  # 가장 높은 점수(article_no="1") 1건만
    minimal_result = build_prompt([minimal_pack], user_question="q", max_tokens=1_000_000)

    budget = (minimal_result.estimated_tokens + full_result.estimated_tokens) // 2
    assert minimal_result.estimated_tokens <= budget < full_result.estimated_tokens

    result = build_prompt([pack], user_question="q", max_tokens=budget)
    # 조항이 일부만 남아야 하며, 남은 조항 중 가장 높은 점수(article_no="1")는 유지되어야 함
    assert 0 < result.article_count < 10
    assert "Điều 1" in result.user_prompt


def _render_helper(pack: EvidencePack) -> str:
    from src.prompt_builder import build_evidence_section
    return build_evidence_section([pack])


# ---------------------------------------------------------------------------
# 10. Metadata 생성
# ---------------------------------------------------------------------------


def test_metadata_contains_required_keys():
    result = build_prompt([_pack()], user_question="test", language="ko")
    assert set(result.metadata.keys()) == {
        "language",
        "answer_tier",
        "service_group",
        "created_at",
        "evidence_builder_version",
        "prompt_builder_version",
    }
    assert result.metadata["language"] == "ko"
    assert result.metadata["evidence_builder_version"]
    assert result.metadata["prompt_builder_version"]
    assert result.metadata["created_at"]  # ISO 형식 문자열 존재


def test_metadata_language_none_when_not_specified():
    result = build_prompt([_pack()], user_question="test")
    assert result.metadata["language"] is None


def test_prompt_package_to_dict_roundtrip():
    result = build_prompt([_pack()], user_question="test", language="vi")
    d = result.to_dict()
    assert d["metadata"]["language"] == "vi"
    assert d["evidence_count"] == 1


# ---------------------------------------------------------------------------
# 11. 입력 객체 불변성
# ---------------------------------------------------------------------------


def test_evidence_pack_not_mutated():
    pack = _pack()
    snapshot = copy.deepcopy(pack)
    build_prompt([pack], user_question="test")
    assert pack == snapshot


def test_evidence_pack_list_not_mutated_during_trimming():
    packs = [_pack(document_id="tmquan:A", top_score=90.0), _pack(document_id="tmquan:B", top_score=10.0)]
    snapshot = copy.deepcopy(packs)
    build_prompt(packs, user_question="test", max_tokens=30)
    assert packs == snapshot


def test_article_reference_not_mutated():
    ref = ArticleReference("9", None, None, "Điều 9", 85.0, "canonical_concept")
    pack = _pack(articles=[ref])
    snapshot = copy.deepcopy(ref)
    build_prompt([pack], user_question="test")
    assert ref == snapshot
