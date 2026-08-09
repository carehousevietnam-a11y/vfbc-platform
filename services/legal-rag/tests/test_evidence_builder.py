"""
STEP5-1 Evidence Builder 신규 테스트.

검증 대상(지시사항 최소 목록):
  1. 동일 문서 병합
  2. 조항 중복 제거
  3. 조항 정렬(Article -> Clause -> Point)
  4. URL 유지
  5. 문서번호 유지
  6. 점수 유지
  7. MatchType 유지
  8. 검색 결과 변경 없음(SearchResult 원본 불변)
  9. 빈 결과 처리
  10. 복수 문서 처리
"""

import copy

from src.evidence_builder import (
    EVIDENCE_SIBLING_MATCH_TYPE,
    ArticleReference,
    EvidencePack,
    build_evidence_packs,
    format_evidence_pack_text,
)
from src.search_models import Chunk, Document, MatchType, SearchResult


def _result(**overrides) -> SearchResult:
    base = dict(
        document_id="tmquan:1001",
        document_number=["152/2020/NĐ-CP"],
        document_type="nghi_dinh",
        title="Nghị định quy định về giấy phép lao động",
        article_no=None,
        clause_no=None,
        item_no=None,
        heading=None,
        status="active",
        official_url="https://vbpl.vn/van-ban/chi-tiet/x1",
        score=50.0,
        match_type=MatchType.KEYWORD_PHRASE.value,
    )
    base.update(overrides)
    return SearchResult(**base)


# ---------------------------------------------------------------------------
# 1. 동일 문서 병합
# ---------------------------------------------------------------------------


def test_same_document_results_are_merged_into_one_pack():
    results = [
        _result(article_no="9", score=50.0),
        _result(article_no="10", score=60.0),
        _result(article_no="12", score=40.0),
    ]
    packs = build_evidence_packs(results)
    assert len(packs) == 1
    assert packs[0].document_id == "tmquan:1001"
    assert len(packs[0].articles) == 3


def test_merged_pack_keeps_top_score_and_match_type():
    results = [
        _result(article_no="9", score=50.0, match_type=MatchType.KEYWORD_PHRASE.value),
        _result(article_no="10", score=85.0, match_type=MatchType.CANONICAL_CONCEPT.value),
    ]
    packs = build_evidence_packs(results)
    assert packs[0].top_score == 85.0
    assert packs[0].top_match_type == MatchType.CANONICAL_CONCEPT.value


# ---------------------------------------------------------------------------
# 2. 조항 중복 제거
# ---------------------------------------------------------------------------


def test_duplicate_article_locator_is_deduplicated():
    results = [
        _result(article_no="9", clause_no="1", score=50.0, heading="Điều 9 Khoản 1 (첫 매치)"),
        _result(article_no="9", clause_no="1", score=90.0, heading="Điều 9 Khoản 1 (두번째 매치)"),
    ]
    packs = build_evidence_packs(results)
    assert len(packs[0].articles) == 1
    # 같은 조항이 중복될 때는 더 높은 점수의 매치를 남긴다(재계산이 아니라 기존 값 중 선택)
    assert packs[0].articles[0].score == 90.0
    assert packs[0].articles[0].heading == "Điều 9 Khoản 1 (두번째 매치)"


def test_distinct_clause_or_point_are_not_deduplicated():
    results = [
        _result(article_no="9", clause_no="1", score=50.0),
        _result(article_no="9", clause_no="2", score=50.0),
        _result(article_no="9", clause_no="1", item_no="a", score=50.0),
    ]
    packs = build_evidence_packs(results)
    assert len(packs[0].articles) == 3


# ---------------------------------------------------------------------------
# 3. 조항 정렬(Article -> Clause -> Point)
# ---------------------------------------------------------------------------


def test_articles_sorted_numerically_not_lexically():
    results = [
        _result(article_no="10", score=50.0),
        _result(article_no="9", score=50.0),
        _result(article_no="2", score=50.0),
    ]
    packs = build_evidence_packs(results)
    article_nos = [a.article_no for a in packs[0].articles]
    assert article_nos == ["2", "9", "10"]  # 문자열 정렬이면 "10","2","9" 순이 됨(오답)


def test_articles_sorted_by_article_then_clause_then_point():
    results = [
        _result(article_no="9", clause_no="2", item_no="b", score=50.0),
        _result(article_no="9", clause_no="1", item_no=None, score=50.0),
        _result(article_no="9", clause_no="2", item_no="a", score=50.0),
        _result(article_no="3", clause_no=None, item_no=None, score=50.0),
    ]
    packs = build_evidence_packs(results)
    locators = [(a.article_no, a.clause_no, a.item_no) for a in packs[0].articles]
    assert locators == [
        ("3", None, None),
        ("9", "1", None),
        ("9", "2", "a"),
        ("9", "2", "b"),
    ]


def test_none_article_sorts_before_numbered_articles():
    results = [
        _result(article_no="1", score=50.0),
        _result(article_no=None, score=30.0),  # 문서 전체(조항 없음) 매치
    ]
    packs = build_evidence_packs(results)
    assert packs[0].articles[0].article_no is None
    assert packs[0].articles[1].article_no == "1"


# ---------------------------------------------------------------------------
# 4~7. 값 보존(URL/문서번호/점수/MatchType)
# ---------------------------------------------------------------------------


def test_url_preserved():
    results = [_result(official_url="https://vbpl.vn/x9")]
    packs = build_evidence_packs(results)
    assert packs[0].official_url == "https://vbpl.vn/x9"


def test_document_number_preserved():
    results = [_result(document_number=["77/2022/NĐ-CP", "77-bis/2022/NĐ-CP"])]
    packs = build_evidence_packs(results)
    assert packs[0].document_number == ["77/2022/NĐ-CP", "77-bis/2022/NĐ-CP"]


def test_score_preserved_not_recalculated():
    results = [_result(article_no="5", score=73.5)]
    packs = build_evidence_packs(results)
    assert packs[0].articles[0].score == 73.5
    assert packs[0].top_score == 73.5


def test_match_type_preserved():
    results = [_result(article_no="5", match_type=MatchType.EXACT_ARTICLE.value)]
    packs = build_evidence_packs(results)
    assert packs[0].articles[0].match_type == MatchType.EXACT_ARTICLE.value
    assert packs[0].top_match_type == MatchType.EXACT_ARTICLE.value


# ---------------------------------------------------------------------------
# 8. 검색 결과 변경 없음(SearchResult 원본 불변)
# ---------------------------------------------------------------------------


def test_input_search_results_are_not_mutated():
    results = [_result(article_no="9", score=50.0), _result(article_no="10", score=60.0)]
    snapshot = copy.deepcopy(results)
    build_evidence_packs(results)
    assert results == snapshot


def test_search_result_object_identity_and_values_unchanged_after_multiple_calls():
    results = [_result(article_no="9")]
    original_score = results[0].score
    original_title = results[0].title
    for _ in range(3):
        build_evidence_packs(results)
    assert results[0].score == original_score
    assert results[0].title == original_title


# ---------------------------------------------------------------------------
# 9. 빈 결과 처리
# ---------------------------------------------------------------------------


def test_empty_results_returns_empty_list():
    packs = build_evidence_packs([])
    assert packs == []


# ---------------------------------------------------------------------------
# 10. 복수 문서 처리
# ---------------------------------------------------------------------------


def test_multiple_documents_produce_multiple_packs_sorted_by_document_number():
    results = [
        _result(document_id="tmquan:B", document_number=["200/2021/NĐ-CP"], score=50.0),
        _result(document_id="tmquan:A", document_number=["100/2020/NĐ-CP"], score=90.0),
    ]
    packs = build_evidence_packs(results)
    assert len(packs) == 2
    assert [p.document_id for p in packs] == ["tmquan:A", "tmquan:B"]  # 문서번호 기준 정렬


def test_multiple_documents_each_keep_own_articles_independent():
    results = [
        _result(document_id="tmquan:A", document_number=["100/2020/NĐ-CP"], article_no="1", score=50.0),
        _result(document_id="tmquan:A", document_number=["100/2020/NĐ-CP"], article_no="2", score=50.0),
        _result(document_id="tmquan:B", document_number=["200/2021/NĐ-CP"], article_no="1", score=50.0),
    ]
    packs = build_evidence_packs(results)
    by_id = {p.document_id: p for p in packs}
    assert len(by_id["tmquan:A"].articles) == 2
    assert len(by_id["tmquan:B"].articles) == 1


# ---------------------------------------------------------------------------
# 부가: query(검색 키워드)/Document 보강, dataclass 불변성, 텍스트 렌더링
# ---------------------------------------------------------------------------


def test_query_recorded_as_search_keyword():
    results = [_result()]
    packs = build_evidence_packs(results, query="giấy phép lao động")
    assert packs[0].search_keywords == ["giấy phép lao động"]


def test_no_query_leaves_search_keywords_empty():
    results = [_result()]
    packs = build_evidence_packs(results, query=None)
    assert packs[0].search_keywords == []


def test_documents_by_id_enriches_issuing_authority_and_effective_date():
    results = [_result(document_id="tmquan:1001")]
    document = Document(
        document_id="tmquan:1001",
        document_number=["152/2020/NĐ-CP"],
        document_type="nghi_dinh",
        title="Nghị định quy định về giấy phép lao động",
        issuing_authority="Chính phủ",
        issue_date="2020-01-01",
        effective_date="2020-03-01",
        expiry_date=None,
        status="active",
        official_url="https://vbpl.vn/van-ban/chi-tiet/x1",
        content_hash=None,
    )
    packs = build_evidence_packs(results, documents_by_id={"tmquan:1001": document})
    assert packs[0].issuing_authority == "Chính phủ"
    assert packs[0].effective_date == "2020-03-01"


def test_missing_document_lookup_leaves_enrichment_fields_none():
    results = [_result()]
    packs = build_evidence_packs(results, documents_by_id={})
    assert packs[0].issuing_authority is None
    assert packs[0].effective_date is None


def test_original_title_matches_title_and_is_not_translated():
    results = [_result(title="Nghị định quy định về giấy phép lao động")]
    packs = build_evidence_packs(results)
    assert packs[0].title == packs[0].original_title == "Nghị định quy định về giấy phép lao động"


def test_original_headings_deduplicated_and_order_preserved():
    results = [
        _result(article_no="9", heading="Điều 9"),
        _result(article_no="9", heading="Điều 9"),  # 중복
        _result(article_no="10", heading="Điều 10"),
    ]
    packs = build_evidence_packs(results)
    assert packs[0].original_headings == ["Điều 9", "Điều 10"]


def test_article_reference_is_frozen_dataclass():
    ref = ArticleReference(article_no="1", clause_no=None, item_no=None, heading=None, score=1.0, match_type="x")
    try:
        ref.article_no = "2"  # type: ignore[misc]
        assert False, "frozen dataclass여야 함"
    except Exception:
        pass


def test_format_evidence_pack_text_contains_key_fields():
    results = [_result(article_no="9", score=85.0, match_type=MatchType.CANONICAL_CONCEPT.value)]
    packs = build_evidence_packs(results, query="giấy phép lao động")
    text = format_evidence_pack_text(packs[0])
    assert "Evidence Pack" in text
    assert "152/2020/NĐ-CP" in text
    assert "제9조" in text
    assert "giấy phép lao động" in text
    assert "canonical_concept" in text
    assert "85.0" in text


def test_evidence_pack_to_dict_roundtrip_keys():
    results = [_result(article_no="9")]
    packs = build_evidence_packs(results)
    d = packs[0].to_dict()
    expected_keys = {
        "document_id", "document_number", "title", "issuing_authority",
        "effective_date", "status", "official_url", "articles",
        "search_keywords", "top_score", "top_match_type",
        "original_title", "original_headings",
    }
    assert set(d.keys()) == expected_keys
    assert isinstance(d["articles"], list)
    assert isinstance(packs[0], EvidencePack)


def test_document_level_hit_expands_sibling_articles_from_chunks():
    """canonical_concept 제목 매치(article_no=None) 시 동일 문서 chunk 조항으로 보강."""
    results = [
        _result(
            document_id="tmquan:CONCEPT-TITLE",
            document_number=["77/2022/NĐ-CP"],
            article_no=None,
            score=85.0,
            match_type=MatchType.CANONICAL_CONCEPT.value,
        )
    ]
    chunks = {
        "tmquan:CONCEPT-TITLE": [
            Chunk.from_dict({
                "chunk_id": "tmquan:CONCEPT-TITLE#dieu1",
                "document_id": "tmquan:CONCEPT-TITLE",
                "chapter_no": "I",
                "article_no": "1",
                "clause_no": None,
                "item_no": None,
                "heading": "Điều 1 Phạm vi điều chỉnh",
                "original_text": "Điều 1.",
                "normalized_text": "Điều 1.",
                "search_text": "điều 1.",
                "status": "active",
                "official_url": None,
                "content_hash": None,
            }),
            Chunk.from_dict({
                "chunk_id": "tmquan:CONCEPT-TITLE#dieu2",
                "document_id": "tmquan:CONCEPT-TITLE",
                "chapter_no": "I",
                "article_no": "2",
                "clause_no": None,
                "item_no": None,
                "heading": "Điều 2 Điều kiện cấp phép",
                "original_text": "Điều 2.",
                "normalized_text": "Điều 2.",
                "search_text": "điều 2.",
                "status": "active",
                "official_url": None,
                "content_hash": None,
            }),
        ]
    }
    packs = build_evidence_packs(results, chunks_by_document_id=chunks)
    assert len(packs) == 1
    assert [a.article_no for a in packs[0].articles] == ["1", "2"]
    assert all(a.match_type == EVIDENCE_SIBLING_MATCH_TYPE for a in packs[0].articles)
    assert packs[0].top_match_type == MatchType.CANONICAL_CONCEPT.value


def test_article_level_hits_are_not_expanded_with_siblings():
    results = [
        _result(article_no="9", score=90.0, match_type=MatchType.KEYWORD_PHRASE.value),
    ]
    chunks = {
        "tmquan:1001": [
            Chunk.from_dict({
                "chunk_id": "tmquan:1001#dieu10",
                "document_id": "tmquan:1001",
                "chapter_no": None,
                "article_no": "10",
                "clause_no": None,
                "item_no": None,
                "heading": "Điều 10",
                "original_text": "Điều 10.",
                "normalized_text": "Điều 10.",
                "search_text": "điều 10.",
                "status": "active",
                "official_url": None,
                "content_hash": None,
            }),
        ]
    }
    packs = build_evidence_packs(results, chunks_by_document_id=chunks)
    assert len(packs[0].articles) == 1
    assert packs[0].articles[0].article_no == "9"
    assert packs[0].articles[0].match_type == MatchType.KEYWORD_PHRASE.value


def test_sibling_expansion_enables_citation_validation():
    from src.openai_rag_connector import call_openai_rag
    from src.prompt_builder import build_prompt
    from tests.test_openai_rag_connector import FakeOpenAIClient, _valid_json_response

    results = [
        _result(
            document_id="tmquan:CONCEPT-TITLE",
            document_number=["77/2022/NĐ-CP"],
            article_no=None,
            score=85.0,
            match_type=MatchType.CANONICAL_CONCEPT.value,
        )
    ]
    chunks = {
        "tmquan:CONCEPT-TITLE": [
            Chunk.from_dict({
                "chunk_id": "tmquan:CONCEPT-TITLE#dieu9",
                "document_id": "tmquan:CONCEPT-TITLE",
                "chapter_no": "I",
                "article_no": "9",
                "clause_no": None,
                "item_no": None,
                "heading": "Điều 9 Hồ sơ",
                "original_text": "Điều 9.",
                "normalized_text": "Điều 9.",
                "search_text": "điều 9.",
                "status": "active",
                "official_url": None,
                "content_hash": None,
            }),
        ]
    }
    packs = build_evidence_packs(results, chunks_by_document_id=chunks)
    prompt = build_prompt(packs, user_question="노동허가 서류는?", language="ko")
    client = FakeOpenAIClient(
        content=_valid_json_response(document_number="77/2022/NĐ-CP", article="Điều 9")
    )
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)

    assert result.status == "success"
    assert len(result.legal_basis) == 1
    assert result.legal_basis[0].article == "Điều 9"
