from src.query_normalizer import LegalQueryNormalizer, detect_language


def test_detect_korean():
    assert detect_language("노동허가") == "ko"


def test_detect_english():
    assert detect_language("work permit") == "en"


def test_detect_chinese():
    assert detect_language("工作许可证") == "zh"


def test_detect_vietnamese():
    assert detect_language("giấy phép lao động") == "vi"
    assert detect_language("Điều 2") == "vi"


def test_detect_empty_string_fallback_vi():
    assert detect_language("") == "vi"


def test_normalize_korean_to_canonical_vi():
    n = LegalQueryNormalizer()
    result = n.normalize("노동허가")
    assert result.canonical_query == "giấy phép lao động"
    assert result.matched_concept is True
    assert result.detected_language == "ko"
    assert result.language_source == "auto_detected"


def test_normalize_english_to_canonical_vi():
    n = LegalQueryNormalizer()
    result = n.normalize("work permit")
    assert result.canonical_query == "giấy phép lao động"
    assert result.matched_concept is True


def test_normalize_chinese_to_canonical_vi():
    n = LegalQueryNormalizer()
    result = n.normalize("工作许可证")
    assert result.canonical_query == "giấy phép lao động"
    assert result.matched_concept is True


def test_normalize_vietnamese_stays_canonical_vi():
    n = LegalQueryNormalizer()
    result = n.normalize("giấy phép lao động")
    assert result.canonical_query == "giấy phép lao động"
    assert result.matched_concept is True


def test_normalize_explicit_language_overrides_detection():
    n = LegalQueryNormalizer()
    # 텍스트 자체는 한글이 아니지만 language="ko"를 명시하면 language_source가 explicit이어야 함
    result = n.normalize("work permit", language="ko")
    assert result.language_source == "explicit"
    assert result.detected_language == "ko"
    # 사전 조회는 텍스트 자체(영문)로 수행되므로 canonical 결과는 동일해야 함
    assert result.canonical_query == "giấy phép lao động"


def test_normalize_unregistered_query_returns_original_unchanged():
    n = LegalQueryNormalizer()
    original = "Điều 9 Khoản 2"
    result = n.normalize(original)
    assert result.matched_concept is False
    assert result.canonical_query == original  # 원문 그대로(strip 외 변형 없음)


def test_normalize_preserves_case_and_diacritics_when_unmatched():
    """사전에 없는 베트남어 원문 질의는 대소문자/성조가 절대 바뀌지 않아야 한다
    (기존 검색 결과 보존을 위한 핵심 요구사항)."""
    n = LegalQueryNormalizer()
    original = "152/2020/NĐ-CP"
    result = n.normalize(original)
    assert result.canonical_query == original


def test_normalize_trims_surrounding_whitespace_only_when_unmatched():
    n = LegalQueryNormalizer()
    result = n.normalize("  Điều 2  ")
    assert result.canonical_query == "Điều 2"


def test_normalize_auto_detect_when_language_not_supported_value():
    n = LegalQueryNormalizer()
    result = n.normalize("노동허가", language="fr")  # 지원하지 않는 언어 코드 -> 자동 감지로 폴백
    assert result.language_source == "auto_detected"
    assert result.detected_language == "ko"


def test_normalize_empty_query():
    n = LegalQueryNormalizer()
    result = n.normalize("")
    assert result.canonical_query == ""
    assert result.matched_concept is False
