"""
STEP3-2 Search Quality Improvement 신규 테스트.

검증 대상:
  1. ko/en/zh/vi 4개 언어 "work_permit" 질의가 모두 Canonical Concept Match를 반환
  2. 검색 우선순위: Document Exact > Article Exact > Canonical Concept(85) >
     Phrase(50) > Prefix(30) > Substring(20) > All-Terms-Scattered(10)
  3. 기존 Document Number Exact / Article Exact 회귀 없음
  4. 기존 Keyword Match(진짜 연속 phrase) 회귀 없음 — 점수 50 유지
  5. "단어가 흩어진 매치"는 더 이상 Phrase와 동일 점수를 받지 않음(최하위로 강등)
"""

from src.search_engine import LegalSearchIndex
from src.search_models import MatchType


def _sample_dicts():
    documents = [
        {
            # 제목에 canonical_vi("giấy phép lao động")가 연속 문자열로 정확히 포함됨
            # -> Canonical Concept Match(문서 제목) 대상
            "document_id": "tmquan:CONCEPT-TITLE",
            "document_number": ["77/2022/NĐ-CP"],
            "document_type": "nghi_dinh",
            "title": "Nghị định quy định chi tiết về giấy phép lao động cho người nước ngoài",
            "issuing_authority": "Chính phủ",
            "issue_date": "2022-01-01",
            "effective_date": "2022-03-01",
            "expiry_date": None,
            "status": "active",
            "official_url": "https://vbpl.vn/van-ban/chi-tiet/concept-title",
            "content_hash": None,
        },
        {
            # 본문에 연속 phrase "giấy phép lao động"가 존재하지만 제목/heading에는 없음
            # -> 기존 Keyword Phrase Match(점수 50) 대상, Concept Match 아님
            "document_id": "tmquan:PHRASE-BODY",
            "document_number": ["88/2019/TT-BLĐTBXH"],
            "document_type": "thong_tu",
            "title": "Thông tư hướng dẫn một số nội dung khác",
            "issuing_authority": "Bộ Lao động",
            "issue_date": "2019-05-01",
            "effective_date": None,
            "expiry_date": None,
            "status": "active",
            "official_url": None,
            "content_hash": None,
        },
        {
            # 제목/본문 어디에도 연속 phrase 없이 "lao động" 관련 단어만 흩어져 있음
            # -> KEYWORD_ALL_TERMS(최하위) 대상, 노동허가와 실질적 관련 없는 문서
            "document_id": "tmquan:UNRELATED-SCATTERED",
            "document_number": ["99/2015/QĐ-UBND"],
            "document_type": "quyet_dinh",
            "title": "Quyết định về việc thành lập Sở Du lịch",
            "issuing_authority": "UBND tỉnh",
            "issue_date": "2015-01-01",
            "effective_date": None,
            "expiry_date": None,
            "status": "active",
            "official_url": None,
            "content_hash": None,
        },
        {
            # 법령번호 Exact / 조문 Exact 회귀 확인용
            "document_id": "tmquan:EXACT-CHECK",
            "document_number": ["152/2020/NĐ-CP"],
            "document_type": "nghi_dinh",
            "title": "Văn bản dùng để kiểm tra exact match không liên quan chủ đề",
            "issuing_authority": "Chính phủ",
            "issue_date": "2020-01-01",
            "effective_date": None,
            "expiry_date": None,
            "status": "active",
            "official_url": None,
            "content_hash": None,
        },
    ]

    chunks = [
        {
            "chunk_id": "tmquan:CONCEPT-TITLE#dieu1",
            "document_id": "tmquan:CONCEPT-TITLE",
            "chapter_no": "I", "article_no": "1", "clause_no": None, "item_no": None,
            "heading": "Điều 1 Phạm vi điều chỉnh",
            "original_text": "Điều 1. Nghị định này quy định về điều kiện cấp phép.",
            "normalized_text": "Điều 1. Nghị định này quy định về điều kiện cấp phép.",
            "search_text": "điều 1. nghị định này quy định về điều kiện cấp phép.",
            "status": "active", "official_url": "https://vbpl.vn/van-ban/chi-tiet/concept-title",
            "content_hash": None,
        },
        {
            "chunk_id": "tmquan:PHRASE-BODY#dieu1",
            "document_id": "tmquan:PHRASE-BODY",
            "chapter_no": None, "article_no": "1", "clause_no": None, "item_no": None,
            "heading": "Điều 1 Nội dung khác",
            "original_text": "Điều 1. Người lao động phải có giấy phép lao động trước khi làm việc.",
            "normalized_text": "Điều 1. Người lao động phải có giấy phép lao động trước khi làm việc.",
            "search_text": "điều 1. người lao động phải có giấy phép lao động trước khi làm việc.",
            "status": "active", "official_url": None, "content_hash": None,
        },
        {
            "chunk_id": "tmquan:UNRELATED-SCATTERED#dieu1",
            "document_id": "tmquan:UNRELATED-SCATTERED",
            "chapter_no": None, "article_no": "1", "clause_no": None, "item_no": None,
            "heading": "Điều 1",
            "original_text": (
                "Điều 1. Sở Du lịch có trách nhiệm quản lý lao động của ngành, "
                "cấp giấy tờ liên quan và thực hiện phép thử hoạt động."
            ),
            "normalized_text": (
                "Điều 1. Sở Du lịch có trách nhiệm quản lý lao động của ngành, "
                "cấp giấy tờ liên quan và thực hiện phép thử hoạt động."
            ),
            "search_text": (
                "điều 1. sở du lịch có trách nhiệm quản lý lao động của ngành, "
                "cấp giấy tờ liên quan và thực hiện phép thử hoạt động."
            ),
            "status": "active", "official_url": None, "content_hash": None,
        },
        {
            "chunk_id": "tmquan:EXACT-CHECK#dieu3",
            "document_id": "tmquan:EXACT-CHECK",
            "chapter_no": "I", "article_no": "3", "clause_no": "2", "item_no": None,
            "heading": "Điều 3 Khoản 2",
            "original_text": "Điều 3. Khoản 2. Nội dung không liên quan chủ đề tìm kiếm.",
            "normalized_text": "Điều 3. Khoản 2. Nội dung không liên quan chủ đề tìm kiếm.",
            "search_text": "điều 3. khoản 2. nội dung không liên quan chủ đề tìm kiếm.",
            "status": "active", "official_url": None, "content_hash": None,
        },
    ]
    return documents, chunks


def _build_index() -> LegalSearchIndex:
    documents, chunks = _sample_dicts()
    return LegalSearchIndex.from_dicts(documents, chunks)


# ---------------------------------------------------------------------------
# 1. 4개 언어 모두 Canonical Concept Match 반환
# ---------------------------------------------------------------------------


def test_korean_query_returns_canonical_concept_match():
    index = _build_index()
    r = index.search(query="노동허가", language="ko")
    concept_hits = [x for x in r if x.match_type == MatchType.CANONICAL_CONCEPT.value]
    assert any(x.document_id == "tmquan:CONCEPT-TITLE" for x in concept_hits)


def test_english_query_returns_canonical_concept_match():
    index = _build_index()
    r = index.search(query="work permit", language="en")
    concept_hits = [x for x in r if x.match_type == MatchType.CANONICAL_CONCEPT.value]
    assert any(x.document_id == "tmquan:CONCEPT-TITLE" for x in concept_hits)


def test_chinese_query_returns_canonical_concept_match():
    index = _build_index()
    r = index.search(query="工作许可证", language="zh")
    concept_hits = [x for x in r if x.match_type == MatchType.CANONICAL_CONCEPT.value]
    assert any(x.document_id == "tmquan:CONCEPT-TITLE" for x in concept_hits)


def test_vietnamese_canonical_query_returns_canonical_concept_match():
    index = _build_index()
    r = index.search(query="giấy phép lao động", language="vi")
    concept_hits = [x for x in r if x.match_type == MatchType.CANONICAL_CONCEPT.value]
    assert any(x.document_id == "tmquan:CONCEPT-TITLE" for x in concept_hits)


# ---------------------------------------------------------------------------
# 2. Document Exact / Article Exact 회귀 없음
# ---------------------------------------------------------------------------


def test_document_number_exact_unaffected():
    index = _build_index()
    r = index.search(query="152/2020/NĐ-CP")
    assert len(r) == 1
    assert r[0].match_type == MatchType.EXACT_DOCUMENT_NUMBER.value
    assert r[0].score == 100.0
    assert r[0].document_id == "tmquan:EXACT-CHECK"


def test_article_exact_unaffected():
    index = _build_index()
    r = index.search(query="Điều 3 Khoản 2")
    exact_hits = [x for x in r if x.match_type == MatchType.EXACT_ARTICLE.value]
    assert len(exact_hits) == 1
    assert exact_hits[0].score == 90.0
    assert exact_hits[0].article_no == "3"
    assert exact_hits[0].clause_no == "2"


# ---------------------------------------------------------------------------
# 3. 우선순위: Concept(85) > Phrase(50) > All-Terms-Scattered(10)
# ---------------------------------------------------------------------------


def test_search_priority_ordering_for_work_permit_query():
    index = _build_index()
    r = index.search(query="노동허가", language="ko")  # -> giấy phép lao động

    # 결과는 score 내림차순 정렬되어 있으므로, 문서별 "최고 점수 결과"만 남긴다
    # (같은 문서가 문서 단위 Concept Match와 조문 단위 Keyword Match로 각각
    # 별도 결과를 갖는 것은 정상 동작 — dedupe 키가 article_no까지 포함하기 때문).
    by_doc: dict[str, object] = {}
    for x in r:
        by_doc.setdefault(x.document_id, x)

    assert by_doc["tmquan:CONCEPT-TITLE"].match_type == MatchType.CANONICAL_CONCEPT.value
    assert by_doc["tmquan:CONCEPT-TITLE"].score == 85.0

    assert by_doc["tmquan:PHRASE-BODY"].match_type == MatchType.KEYWORD_PHRASE.value
    assert by_doc["tmquan:PHRASE-BODY"].score == 50.0

    # 흩어진 단어만 있는 무관 문서는 최하위(KEYWORD_ALL_TERMS, 10점)로 강등되어야 한다
    assert by_doc["tmquan:UNRELATED-SCATTERED"].match_type == MatchType.KEYWORD_ALL_TERMS.value
    assert by_doc["tmquan:UNRELATED-SCATTERED"].score == 10.0

    # 결과 정렬 순서 자체도 Concept > Phrase > All-Terms 이어야 한다
    scores = [x.score for x in r]
    assert scores == sorted(scores, reverse=True)
    ranked_doc_ids = [x.document_id for x in r]
    assert ranked_doc_ids.index("tmquan:CONCEPT-TITLE") < ranked_doc_ids.index("tmquan:PHRASE-BODY")
    assert ranked_doc_ids.index("tmquan:PHRASE-BODY") < ranked_doc_ids.index("tmquan:UNRELATED-SCATTERED")


def test_concept_match_requires_contiguous_phrase_not_scattered_words():
    """제목에 canonical_vi 구성 단어가 흩어져 있을 뿐 연속 문자열로는 없는 문서는
    Concept Match로 인정되면 안 된다(지시사항 핵심 조건)."""
    index = _build_index()
    r = index.search(query="노동허가", language="ko")
    scattered_doc = next(x for x in r if x.document_id == "tmquan:UNRELATED-SCATTERED")
    assert scattered_doc.match_type != MatchType.CANONICAL_CONCEPT.value


# ---------------------------------------------------------------------------
# 4. 기존 Keyword Match(진짜 연속 phrase) 회귀 없음
# ---------------------------------------------------------------------------


def test_direct_vietnamese_phrase_query_still_matches_as_phrase():
    """다국어 사전과 무관하게, 사전에 없는 임의의 연속 phrase 질의는 여전히
    KEYWORD_PHRASE로 정상 동작해야 한다(회귀 확인)."""
    index = _build_index()
    r = index.search(query="Sở Du lịch")  # 사전에 없는 질의 -> 원문 그대로 검색
    assert any(
        x.document_id == "tmquan:UNRELATED-SCATTERED" and x.match_type == MatchType.KEYWORD_PHRASE.value
        for x in r
    )


def test_filters_and_dedupe_still_work_with_new_match_types():
    index = _build_index()
    r = index.search(query="노동허가", language="ko")
    # 문서 단위(article_no=None) Concept Match 결과가 정확히 1건 존재해야 한다.
    # (같은 문서의 조문 단위 Keyword Phrase 결과는 dedupe 키가 달라 별도로 남는
    # 것이 정상 — Concept Match 자체의 dedupe만 검증한다)
    concept_doc_level_hits = [
        x for x in r if x.document_id == "tmquan:CONCEPT-TITLE" and x.match_type == MatchType.CANONICAL_CONCEPT.value
    ]
    assert len(concept_doc_level_hits) == 1
    assert concept_doc_level_hits[0].article_no is None
