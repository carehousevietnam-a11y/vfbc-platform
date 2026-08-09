from src.case_library_seed import build_case_library_publish_seed, suggest_case_library_hook


def test_suggest_case_library_hook_from_question():
    hook = suggest_case_library_hook(
        "노동허가 경력 요건이 어떻게 되나요?",
        topic="노동허가",
    )
    assert "노동허가" in hook
    assert "체크리스트" in hook or "확인" in hook


def test_build_case_library_publish_seed_includes_metadata():
    seed = build_case_library_publish_seed(
        "TRC 발급 조건 알려주세요",
        topic="거주증(TRC)",
        service_group="check",
        service_type="trc",
        answer_grade="insufficient_evidence",
    )
    assert seed["source_question"]
    assert seed["hook_headline"]
    assert seed["publish_channel"] == "case_library_landing"
    assert seed["answer_grade"] == "insufficient_evidence"
