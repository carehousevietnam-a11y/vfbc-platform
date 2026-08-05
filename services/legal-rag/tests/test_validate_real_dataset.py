from src.validate_real_dataset import build_realistic_fixture_rows, run_pipeline


def test_realistic_fixture_builds_without_error():
    rows = build_realistic_fixture_rows()
    assert len(rows) > 0
    source_keys = {sk for sk, _ in rows}
    assert "vbpl" in source_keys
    assert "th1nhng0_metadata" in source_keys
    assert "th1nhng0_content" in source_keys
    assert "th1nhng0_relationships" in source_keys


def test_run_pipeline_completes_all_stages():
    rows = build_realistic_fixture_rows()
    report, index = run_pipeline(rows)
    stage_names = [s.name for s in report.stages]
    assert "normalize" in stage_names
    assert "deduplicate" in stage_names
    assert "parse_structure" in stage_names
    assert "relationships" in stage_names
    assert "effective_scopes" in stage_names
    assert all(s.ok for s in report.stages)


def test_run_pipeline_detects_unmapped_relation_label():
    rows = build_realistic_fixture_rows()
    report, _ = run_pipeline(rows)
    assert any("미분류" in p for p in report.problems)


def test_run_pipeline_khoan_diem_split_detected():
    rows = build_realistic_fixture_rows()
    report, _ = run_pipeline(rows)
    khoan_stage = next(s for s in report.stages if s.name == "parse_structure.khoan_diem_split")
    assert khoan_stage.ok


def test_run_pipeline_search_smoke_tests_pass():
    rows = build_realistic_fixture_rows()
    report, index = run_pipeline(rows)
    assert len(report.search_smoke_tests) > 0
    assert all(t["ok"] for t in report.search_smoke_tests)


def test_run_pipeline_index_is_searchable():
    rows = build_realistic_fixture_rows()
    _, index = run_pipeline(rows)
    results = index.search(query="152/2020/NĐ-CP")
    assert len(results) >= 1
    assert results[0].match_type == "exact_document_number"


def test_run_pipeline_empty_input_does_not_crash():
    report, index = run_pipeline([])
    assert "Normalize 단계에서 매핑된 문서가 0건" in " ".join(report.problems)
    assert index.search(query="anything") == []
