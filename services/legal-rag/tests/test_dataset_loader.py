import json
from pathlib import Path

from src.dataset_loader import DATASET_SOURCE_KEYS, load_dataset_as_dict, load_dataset_records


def _write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def test_load_dataset_records_vbpl(tmp_path):
    raw_dir = tmp_path / "data" / "raw"
    _write_jsonl(raw_dir / "vbpl" / "sample.jsonl", [{"doc_name": "1", "title": "A"}])

    records = list(load_dataset_records("vbpl", raw_dir))
    assert len(records) == 1
    source_key, row = records[0]
    assert source_key == "vbpl"
    assert row["doc_name"] == "1"


def test_load_dataset_records_th1nhng0_multiple_configs(tmp_path):
    raw_dir = tmp_path / "data" / "raw"
    _write_jsonl(raw_dir / "th1nhng0" / "sample_metadata.jsonl", [{"id": "1", "title": "M"}])
    _write_jsonl(raw_dir / "th1nhng0" / "sample_content.jsonl", [{"id": "1", "content_html": "<p>x</p>"}])
    _write_jsonl(raw_dir / "th1nhng0" / "sample_relationships.jsonl", [{"doc_id": "1", "other_doc_id": "2", "relationship": "x"}])

    grouped = load_dataset_as_dict("th1nhng0", raw_dir)
    assert set(grouped.keys()) == {"th1nhng0_metadata", "th1nhng0_content", "th1nhng0_relationships"}
    assert len(grouped["th1nhng0_metadata"]) == 1
    assert len(grouped["th1nhng0_relationships"]) == 1


def test_load_dataset_records_does_not_mix_datasets(tmp_path):
    raw_dir = tmp_path / "data" / "raw"
    _write_jsonl(raw_dir / "vbpl" / "sample.jsonl", [{"doc_name": "1"}])
    _write_jsonl(raw_dir / "th1nhng0" / "sample_metadata.jsonl", [{"id": "1"}])

    vbpl_records = list(load_dataset_records("vbpl", raw_dir))
    th_records = list(load_dataset_records("th1nhng0", raw_dir))
    assert len(vbpl_records) == 1
    assert len(th_records) == 1
    assert vbpl_records[0][0] == "vbpl"
    assert th_records[0][0] == "th1nhng0_metadata"


def test_load_dataset_records_missing_dir_returns_empty(tmp_path):
    assert list(load_dataset_records("vbpl", tmp_path / "nonexistent")) == []


def test_load_dataset_records_invalid_key_raises():
    import pytest

    with pytest.raises(ValueError):
        list(load_dataset_records("unknown_dataset", Path(".")))


def test_dataset_source_keys_cover_all_known_sources():
    all_keys = set().union(*DATASET_SOURCE_KEYS.values())
    assert "vbpl" in all_keys
    assert "th1nhng0_metadata" in all_keys
    assert "th1nhng0_relationships" in all_keys
    assert "th1nhng0_legacy_metadata" in all_keys
