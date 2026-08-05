from src.normalize_relations import (
    extract_internal_relations,
    map_relation_type,
    normalize_relationship_rows,
)
from src.schema import RelationType


def test_map_relation_type_amends():
    assert map_relation_type("Sửa đổi, bổ sung một số điều") == RelationType.AMENDS


def test_map_relation_type_repeals():
    assert map_relation_type("Bãi bỏ") == RelationType.REPEALS


def test_map_relation_type_replaces():
    assert map_relation_type("Thay thế") == RelationType.REPLACES


def test_map_relation_type_supersedes():
    assert map_relation_type("Thay thế toàn bộ") == RelationType.SUPERSEDES


def test_map_relation_type_implements():
    assert map_relation_type("Hướng dẫn thi hành") == RelationType.IMPLEMENTS


def test_map_relation_type_references():
    assert map_relation_type("Căn cứ") == RelationType.REFERENCES


def test_map_relation_type_unknown_for_unrecognized():
    assert map_relation_type("일부 알 수 없는 라벨") == RelationType.UNKNOWN


def test_map_relation_type_none():
    assert map_relation_type(None) == RelationType.UNKNOWN


def test_normalize_relationship_rows_preserves_direction():
    rows = [{"doc_id": "100", "other_doc_id": "200", "relationship": "Sửa đổi"}]
    edges, unknown = normalize_relationship_rows(iter(rows))
    assert len(edges) == 1
    edge = edges[0]
    assert edge.sourceDocumentId == "th1nhng0:100"
    assert edge.targetDocumentId == "th1nhng0:200"
    assert edge.relationType == "amends"
    assert edge.rawRelationLabel == "Sửa đổi"
    assert len(unknown) == 0


def test_normalize_relationship_rows_tracks_unknown_labels():
    rows = [{"doc_id": "1", "other_doc_id": "2", "relationship": "?????"}]
    edges, unknown = normalize_relationship_rows(iter(rows))
    assert edges[0].relationType == "unknown"
    assert edges[0].rawRelationLabel == "?????"
    assert unknown["?????"] == 1


def test_normalize_relationship_rows_skips_missing_ids():
    rows = [{"doc_id": None, "other_doc_id": "2", "relationship": "x"}]
    edges, _ = normalize_relationship_rows(iter(rows))
    assert edges == []


def test_extract_internal_relations_khoan_dieu_nay():
    text = "Theo quy định tại Khoản 2 Điều này, người lao động phải..."
    relations = extract_internal_relations("doc1", "doc1#dieu5.khoan1", text)
    assert len(relations) == 1
    rel = relations[0]
    assert rel.targetRawRef == "Khoản 2 Điều này"
    assert rel.targetChunkId == "doc1#dieu5.khoan2"
    assert rel.relationType == "references"


def test_extract_internal_relations_no_match_returns_empty():
    text = "Đây là văn bản không có tham chiếu nội bộ."
    relations = extract_internal_relations("doc1", "doc1#dieu1", text)
    assert relations == []


def test_extract_internal_relations_khoan_nay_without_number():
    text = "Các trường hợp quy định tại khoản này không áp dụng."
    relations = extract_internal_relations("doc1", "doc1#dieu1.khoan3", text)
    assert len(relations) == 1
    assert relations[0].targetChunkId is None  # "khoản này"는 대상 특정 불가
