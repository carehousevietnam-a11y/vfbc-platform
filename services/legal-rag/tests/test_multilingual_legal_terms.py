from src.multilingual_legal_terms import LEGAL_TERMS, all_concepts, lookup_canonical_vi


def test_work_permit_concept_registered():
    assert "work_permit" in LEGAL_TERMS
    assert LEGAL_TERMS["work_permit"]["canonical_vi"] == "giấy phép lao động"


def test_lookup_korean_synonyms():
    for term in ["노동허가", "노동 허가", "취업허가", "취업 허가", "근로허가", "근로 허가"]:
        assert lookup_canonical_vi(term) == "giấy phép lao động", term


def test_lookup_english_synonyms():
    for term in ["work permit", "employment permit", "labor permit", "labour permit"]:
        assert lookup_canonical_vi(term) == "giấy phép lao động", term


def test_lookup_chinese_synonyms():
    for term in ["工作许可证", "工作许可", "劳动许可证", "劳动许可"]:
        assert lookup_canonical_vi(term) == "giấy phép lao động", term


def test_lookup_vietnamese_synonyms():
    for term in ["giấy phép lao động", "giay phep lao dong"]:
        assert lookup_canonical_vi(term) == "giấy phép lao động", term


def test_lookup_is_case_and_whitespace_insensitive():
    assert lookup_canonical_vi("  WORK PERMIT  ") == "giấy phép lao động"
    assert lookup_canonical_vi("노동   허가") is None or lookup_canonical_vi("노동허가") == "giấy phép lao động"


def test_lookup_unregistered_term_returns_none():
    assert lookup_canonical_vi("이것은 사전에 없는 완전히 다른 용어") is None
    assert lookup_canonical_vi("residence card") is None


def test_lookup_empty_or_none_returns_none():
    assert lookup_canonical_vi("") is None
    assert lookup_canonical_vi(None) is None  # type: ignore[arg-type]


def test_all_concepts_extensible_list():
    concepts = all_concepts()
    assert isinstance(concepts, list)
    assert "work_permit" in concepts
