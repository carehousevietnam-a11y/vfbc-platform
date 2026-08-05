"""
STEP4 Search Result Localizer 신규 테스트.

검증 대상(지시사항 최소 목록 1~10 + CLI 출력 확인 11):
  1. ko 출력  2. en 출력  3. zh 출력  4. vi 출력
  5. Fallback(사전에 없는 값은 원문 유지)
  6. 원문 유지(original_title/original_heading)
  7. Document Number 유지
  8. Article Number 유지
  9. Source URL 유지
  10. SearchResult 불변성(입력 인스턴스가 변경되지 않음)
  11. CLI 출력 확인(별도 파일에서 subprocess로 검증)
"""

import copy

from src.result_localizer import (
    DEFAULT_LANGUAGE,
    LocalizedSearchResult,
    localize_document_type,
    localize_relation_type,
    localize_result,
    localize_results,
    localize_status,
)
from src.search_models import Document, MatchType, SearchResult


def _sample_result(**overrides) -> SearchResult:
    base = dict(
        document_id="tmquan:9999",
        document_number=["152/2020/NĐ-CP"],
        document_type="nghi_dinh",
        title="Nghị định quy định chi tiết về giấy phép lao động cho người nước ngoài",
        article_no="1",
        clause_no="2",
        item_no="a",
        heading="Điều 1 Khoản 2 Điểm a",
        status="active",
        official_url="https://vbpl.vn/van-ban/chi-tiet/x1",
        score=85.0,
        match_type=MatchType.CANONICAL_CONCEPT.value,
    )
    base.update(overrides)
    return SearchResult(**base)


def _sample_document() -> Document:
    return Document(
        document_id="tmquan:9999",
        document_number=["152/2020/NĐ-CP"],
        document_type="nghi_dinh",
        title="Nghị định quy định chi tiết về giấy phép lao động cho người nước ngoài",
        issuing_authority="Chính phủ",
        issue_date="2020-01-01",
        effective_date="2020-03-01",
        expiry_date=None,
        status="active",
        official_url="https://vbpl.vn/van-ban/chi-tiet/x1",
        content_hash=None,
    )


# ---------------------------------------------------------------------------
# 1~4. 언어별 출력
# ---------------------------------------------------------------------------


def test_korean_output():
    r = localize_result(_sample_result(), language="ko")
    assert r.language == "ko"
    assert r.document_type == "시행령"
    assert r.status_label == "시행중"
    assert "노동허가" in r.display_title  # work_permit 전체 구문 인식(가장 구체적인 개념 우선)
    assert r.heading_label == "제1조 제2항 제a호"


def test_english_output():
    r = localize_result(_sample_result(), language="en")
    assert r.language == "en"
    assert r.document_type == "Decree"
    assert r.status_label == "Active"
    assert "Work Permit" in r.display_title
    assert r.heading_label == "Article 1 Clause 2 Point a"


def test_chinese_output():
    r = localize_result(_sample_result(), language="zh")
    assert r.language == "zh"
    assert r.document_type == "法令"
    assert r.status_label == "生效中"
    assert "工作许可证" in r.display_title
    assert r.heading_label == "第1条 第2款 第a项"


def test_vietnamese_output():
    r = localize_result(_sample_result(), language="vi")
    assert r.language == "vi"
    assert r.document_type == "Nghị định"
    assert r.status_label == "Đang hiệu lực"
    # 베트남어는 원문 그대로 유지(치환 없음)
    assert r.display_title == r.original_title
    assert r.heading_label == "Điều 1 Khoản 2 Điểm a"


# ---------------------------------------------------------------------------
# 5. Fallback(사전에 없는 값은 원문 유지, 빈 문자열/None 금지)
# ---------------------------------------------------------------------------


def test_fallback_unregistered_document_type_keeps_original():
    result = _sample_result(document_type="Official Dispatch")  # 사전에 없는 유형
    r = localize_result(result, language="ko")
    assert r.document_type == "Official Dispatch"  # 원문 그대로
    assert r.document_type  # 빈 문자열 아님


def test_fallback_unregistered_status_keeps_original():
    result = _sample_result(status="pending_review")  # 사전에 없는 상태
    r = localize_result(result, language="en")
    assert r.status_label == "pending_review"
    assert r.status_label


def test_fallback_title_without_recognized_topic_keeps_original():
    result = _sample_result(title="Quyết định về việc thành lập Sở Du lịch")  # 인식 주제 없음
    r = localize_result(result, language="ko")
    assert r.display_title == result.title  # 치환 없이 원문 그대로
    assert r.display_title


def test_fallback_never_empty_or_none_for_translated_fields():
    result = _sample_result(document_type=None, status=None, title=None)
    r = localize_result(result, language="en")
    assert r.document_type  # GENERIC_DOCUMENT_LABEL 등으로 항상 비어있지 않음
    assert r.status_label
    assert r.display_title
    assert r.keyword
    assert r.summary
    assert r.description


def test_localize_document_type_helper_fallback():
    assert localize_document_type("Announcement", "ko") == "Announcement"


def test_localize_status_helper_fallback():
    assert localize_status("draft", "zh") == "draft"


def test_localize_relation_type_dictionary_and_fallback():
    assert localize_relation_type("references", "ko") == "참조"
    assert localize_relation_type("unregistered_type", "ko") == "unregistered_type"
    assert localize_relation_type(None, "ko") is None


# ---------------------------------------------------------------------------
# 6~9. 불변 필드 보존
# ---------------------------------------------------------------------------


def test_original_title_and_heading_preserved_across_all_languages():
    result = _sample_result()
    for lang in ("ko", "en", "zh", "vi"):
        r = localize_result(result, language=lang)
        assert r.original_title == result.title
        assert r.original_heading == result.heading


def test_document_number_preserved_verbatim():
    result = _sample_result()
    for lang in ("ko", "en", "zh", "vi"):
        r = localize_result(result, language=lang)
        assert r.document_number == result.document_number
        assert r.document_number == ["152/2020/NĐ-CP"]


def test_article_number_preserved_verbatim():
    result = _sample_result()
    for lang in ("ko", "en", "zh", "vi"):
        r = localize_result(result, language=lang)
        assert r.article_number == "1"
        assert r.clause_number == "2"
        assert r.point == "a"


def test_source_url_preserved_verbatim():
    result = _sample_result()
    for lang in ("ko", "en", "zh", "vi"):
        r = localize_result(result, language=lang)
        assert r.source_url == "https://vbpl.vn/van-ban/chi-tiet/x1"


def test_status_raw_field_preserved_unmodified():
    """status(원문 raw 값)는 절대 번역되지 않고 status_label만 번역된다."""
    result = _sample_result(status="active")
    for lang in ("ko", "en", "zh", "vi"):
        r = localize_result(result, language=lang)
        assert r.status == "active"  # raw 값은 항상 동일


def test_issuing_authority_and_effective_date_from_document_not_translated():
    """SearchResult에는 없는 필드라 document를 전달했을 때만 채워지며, 값
    자체는 절대 번역되지 않는다(원문 유지)."""
    result = _sample_result()
    document = _sample_document()
    r = localize_result(result, language="ko", document=document)
    assert r.issuing_authority == "Chính phủ"  # 번역 없이 원문 그대로
    assert r.effective_date == "2020-03-01"


# ---------------------------------------------------------------------------
# 10. SearchResult 불변성
# ---------------------------------------------------------------------------


def test_search_result_is_not_mutated():
    result = _sample_result()
    snapshot = copy.deepcopy(result)
    for lang in ("ko", "en", "zh", "vi"):
        localize_result(result, language=lang)
    assert result == snapshot
    assert result.title == snapshot.title
    assert result.document_number == snapshot.document_number


def test_localize_results_does_not_mutate_input_list():
    results = [_sample_result(), _sample_result(document_id="tmquan:8888")]
    snapshot = copy.deepcopy(results)
    localized = localize_results(results, "ko")
    assert results == snapshot
    assert len(localized) == 2
    assert all(isinstance(x, LocalizedSearchResult) for x in localized)


def test_localize_result_default_language_is_vietnamese():
    result = _sample_result()
    r = localize_result(result, language=None)
    assert r.language == DEFAULT_LANGUAGE == "vi"
    assert r.display_title == result.title


def test_localize_result_unsupported_language_falls_back_to_vietnamese():
    result = _sample_result()
    r = localize_result(result, language="fr")
    assert r.language == "vi"
