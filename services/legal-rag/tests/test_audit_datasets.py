import json
from pathlib import Path

from src.audit_datasets import run_audit


def _write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def test_audit_counts_documents_once_not_per_content_file(tmp_path):
    """
    회귀 테스트: th1nhng0_metadata 행이 content 파일과 join 가능한 경우
    missing_body로 잘못 집계되지 않아야 한다(과거 버그).
    """
    raw_dir = tmp_path / "data" / "raw"
    _write_jsonl(
        raw_dir / "th1nhng0" / "sample_metadata.jsonl",
        [{"id": "1", "title": "A", "tinh_trang_hieu_luc": "Còn hiệu lực"}],
    )
    _write_jsonl(
        raw_dir / "th1nhng0" / "sample_content.jsonl",
        [{"id": "1", "content_html": "<p>본문 있음</p>"}],
    )

    result = run_audit(raw_dir)
    # metadata 1건만 "문서"로 집계 (content는 별도 문서로 중복 집계되지 않음)
    assert result.total_documents == 1
    # content와 join 가능하므로 missing_body는 0이어야 함
    assert result.missing_body_count == 0


def test_audit_flags_missing_body_when_no_matching_content(tmp_path):
    raw_dir = tmp_path / "data" / "raw"
    _write_jsonl(
        raw_dir / "th1nhng0" / "sample_metadata.jsonl",
        [{"id": "1", "title": "A"}, {"id": "2", "title": "B"}],
    )
    _write_jsonl(
        raw_dir / "th1nhng0" / "sample_content.jsonl",
        [{"id": "1", "content_html": "<p>본문 있음</p>"}],  # id=2는 본문 없음
    )

    result = run_audit(raw_dir)
    assert result.total_documents == 2
    assert result.missing_body_count == 1


def test_audit_vbpl_missing_body_detected_directly():
    pass  # 통합 테스트(test_integration_pipeline.py)에서 vbpl 케이스로 이미 검증됨


def test_audit_empty_dir_returns_empty_result(tmp_path):
    result = run_audit(tmp_path / "nonexistent")
    assert result.total_documents == 0
    assert result.files_examined == []


def test_audit_relationship_counting(tmp_path):
    raw_dir = tmp_path / "data" / "raw"
    _write_jsonl(
        raw_dir / "th1nhng0" / "sample_relationships.jsonl",
        [
            {"doc_id": "1", "other_doc_id": "2", "relationship": "Sửa đổi"},
            {"doc_id": "3", "other_doc_id": "4", "relationship": "Sửa đổi"},
            {"doc_id": "5", "other_doc_id": "6", "relationship": "Bãi bỏ"},
        ],
    )
    result = run_audit(raw_dir)
    assert result.relationship_total == 3
    assert result.relationship_type_counts["Sửa đổi"] == 2
    assert result.relationship_type_counts["Bãi bỏ"] == 1


def test_audit_doc_number_format_check(tmp_path):
    raw_dir = tmp_path / "data" / "raw"
    _write_jsonl(
        raw_dir / "vbpl" / "sample.jsonl",
        [
            {"doc_name": "1", "doc_number": ["152/2020/NĐ-CP"], "markdown": "x"},
            {"doc_name": "2", "doc_number": ["이상한형식"], "markdown": "x"},
        ],
    )
    result = run_audit(raw_dir)
    assert result.doc_number_format_ok == 1
    assert result.doc_number_format_bad == 1
