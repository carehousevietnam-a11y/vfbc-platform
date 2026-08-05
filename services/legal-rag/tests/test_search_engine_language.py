"""
다국어 정규화가 search_engine.py에 최소 침습으로 연결되었는지 검증하는 신규 테스트.

핵심 검증 대상:
  1. 기존 베트남어 검색 결과가 language 파라미터 도입 전후로 동일함(회귀 없음)
  2. ko/en/zh/vi 네 언어 질의가 동일한 canonical_vi로 정규화되어 동일한 검색 결과를 반환함
  3. 사전에 없는 질의는 기존과 동일하게 동작함(Exact/Keyword/Filter/Ranking 로직 무변경)
"""

from src.search_engine import LegalSearchIndex
from src.search_models import SearchFilters


def _sample_dicts():
    """work_permit 개념(canonical_vi='giấy phép lao động')이 실제로 포함된 chunk를
    갖는 최소 합성 데이터 — 4개 언어 질의가 동일 결과를 반환하는지 확인하는 용도."""
    documents = [
        {
            "document_id": "tmquan:9001",
            "document_number": ["152/2020/NĐ-CP"],
            "document_type": "nghi_dinh",
            "title": "Quy định về giấy phép lao động",
            "issuing_authority": "Chính phủ",
            "issue_date": "2020-12-30",
            "effective_date": "2021-02-15",
            "expiry_date": None,
            "status": "active",
            "official_url": "https://vbpl.vn/van-ban/chi-tiet/wp1",
            "content_hash": None,
        },
        {
            "document_id": "tmquan:9002",
            "document_number": ["10/2021/TT-BLĐTBXH"],
            "document_type": "thong_tu",
            "title": "Một văn bản hoàn toàn không liên quan",
            "issuing_authority": "Bộ Lao động",
            "issue_date": "2021-01-01",
            "effective_date": None,
            "expiry_date": None,
            "status": "active",
            "official_url": None,
            "content_hash": None,
        },
    ]
    chunks = [
        {
            "chunk_id": "tmquan:9001#dieu1",
            "document_id": "tmquan:9001",
            "chapter_no": "I",
            "article_no": "1",
            "clause_no": None,
            "item_no": None,
            "heading": "Điều 1 Phạm vi điều chỉnh",
            "original_text": "Điều 1. Nghị định này quy định về giấy phép lao động cho người nước ngoài.",
            "normalized_text": "Điều 1. Nghị định này quy định về giấy phép lao động cho người nước ngoài.",
            "search_text": "điều 1. nghị định này quy định về giấy phép lao động cho người nước ngoài.",
            "status": "active",
            "official_url": "https://vbpl.vn/van-ban/chi-tiet/wp1",
            "content_hash": None,
        },
        {
            "chunk_id": "tmquan:9002#dieu1",
            "document_id": "tmquan:9002",
            "chapter_no": None,
            "article_no": "1",
            "clause_no": None,
            "item_no": None,
            "heading": "Điều 1",
            "original_text": "Điều 1. Quy định về thuế thu nhập cá nhân, không liên quan lao động.",
            "normalized_text": "Điều 1. Quy định về thuế thu nhập cá nhân, không liên quan lao động.",
            "search_text": "điều 1. quy định về thuế thu nhập cá nhân, không liên quan lao động.",
            "status": "active",
            "official_url": None,
            "content_hash": None,
        },
    ]
    return documents, chunks


def _build_index() -> LegalSearchIndex:
    documents, chunks = _sample_dicts()
    return LegalSearchIndex.from_dicts(documents, chunks)


# ---------------------------------------------------------------------------
# 1. 기존 베트남어 검색 회귀 없음
# ---------------------------------------------------------------------------


def test_vietnamese_query_unaffected_by_language_param_default():
    index = _build_index()
    r_no_param = index.search(query="152/2020/NĐ-CP")
    r_explicit_none = index.search(query="152/2020/NĐ-CP", language=None)
    assert [r.to_dict() for r in r_no_param] == [r.to_dict() for r in r_explicit_none]
    assert len(r_no_param) == 1
    assert r_no_param[0].match_type == "exact_document_number"


def test_article_search_unaffected_by_language_param():
    index = _build_index()
    r_no_param = index.search(query="Điều 1")
    r_with_language = index.search(query="Điều 1", language="vi")
    # 둘 다 사전에 없는 질의이므로 원문 그대로 전달되어 결과가 동일해야 한다.
    assert [r.to_dict() for r in r_no_param] == [r.to_dict() for r in r_with_language]


def test_filters_still_work_unchanged():
    index = _build_index()
    r = index.search(query="Điều 1", filters=SearchFilters(status="active"))
    assert len(r) == 2
    assert all(x.status == "active" for x in r)


# ---------------------------------------------------------------------------
# 2. 네 언어가 동일한 canonical_vi로 정규화되어 동일 결과를 반환
# ---------------------------------------------------------------------------


def test_four_languages_return_identical_results():
    index = _build_index()

    r_ko = index.search(query="노동허가", language="ko")
    r_en = index.search(query="work permit", language="en")
    r_zh = index.search(query="工作许可证", language="zh")
    r_vi = index.search(query="giấy phép lao động", language="vi")

    results_by_lang = {"ko": r_ko, "en": r_en, "zh": r_zh, "vi": r_vi}

    # 전부 비어있지 않아야 하고(work_permit 문서가 실제로 매치되어야 함)
    for lang, results in results_by_lang.items():
        assert len(results) > 0, f"{lang} 검색 결과가 비어있음"

    # 네 언어가 반환하는 document_id 집합이 동일해야 한다.
    doc_id_sets = {lang: {r.document_id for r in results} for lang, results in results_by_lang.items()}
    assert doc_id_sets["ko"] == doc_id_sets["en"] == doc_id_sets["zh"] == doc_id_sets["vi"]

    # 점수/정렬까지 완전히 동일해야 한다(동일 canonical_query가 전달되므로).
    dicts_by_lang = {lang: [r.to_dict() for r in results] for lang, results in results_by_lang.items()}
    assert dicts_by_lang["ko"] == dicts_by_lang["en"] == dicts_by_lang["zh"] == dicts_by_lang["vi"]


def test_four_languages_match_work_permit_document():
    index = _build_index()
    r_ko = index.search(query="노동허가", language="ko")
    assert any(r.document_id == "tmquan:9001" for r in r_ko)


def test_auto_detect_without_language_param_matches_explicit():
    index = _build_index()
    r_auto = index.search(query="노동허가")  # language 미지정 -> 자동감지(ko)
    r_explicit = index.search(query="노동허가", language="ko")
    assert [r.to_dict() for r in r_auto] == [r.to_dict() for r in r_explicit]


# ---------------------------------------------------------------------------
# 3. 사전에 없는 질의(미등록 법률 개념)는 기존과 동일하게 동작
# ---------------------------------------------------------------------------


def test_unregistered_multilingual_query_falls_back_to_original_text_search():
    index = _build_index()
    # "residence card"는 사전에 없으므로 원문 그대로 키워드 검색에 전달됨(매치 없음이 정상)
    r = index.search(query="residence card", language="en")
    assert r == []
