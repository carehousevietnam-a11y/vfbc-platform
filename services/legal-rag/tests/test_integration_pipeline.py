"""
합성(synthetic) raw 데이터로 Audit -> Normalize -> Deduplicate -> Parse ->
Relations -> EffectiveScopes 전체 체인을 실제로 실행해 검증하는 통합 테스트.

실제 Hugging Face 데이터는 전혀 사용하지 않는다(네트워크 불필요). 대신
download_datasets.py가 생성할 것으로 예상되는 것과 동일한 파일명/구조 규칙
(data/raw/vbpl/sample.jsonl, data/raw/th1nhng0/sample_{config}.jsonl)을 그대로
재현하여, audit_datasets.py의 파일 분류 로직(_classify_file)까지 함께 검증한다.
"""

import json
from pathlib import Path

from src.audit_datasets import run_audit
from src.deduplicate_documents import deduplicate
from src.effective_scopes import build_effective_scopes
from src.normalize_documents import normalize_all
from src.normalize_relations import normalize_relationship_rows
from src.parse_legal_structure import parse_document_structure


def _write_jsonl(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def _build_raw_fixture(tmp_path: Path) -> Path:
    raw_dir = tmp_path / "data" / "raw"

    vbpl_rows = [
        {
            "doc_name": "1001",
            "source_url": "https://vbpl.vn/van-ban/chi-tiet/x1",
            "api_url": "https://vbpl-bientap-gateway.moj.gov.vn/api/qtdc/public/doc/1001",
            "title": "Quy định về giấy phép lao động",
            "doc_type": "nghi_dinh",
            "doc_number": ["152/2020/NĐ-CP"],
            "issue_date": "30/12/2020",
            "issuing_authority": "Chính phủ",
            "markdown": (
                "Chương I\nQUY ĐỊNH CHUNG\n\n"
                "Điều 1. Phạm vi điều chỉnh\n"
                "Nghị định này quy định về giấy phép lao động cho người lao động nước ngoài "
                "làm việc tại Việt Nam.\n\n"
                "Điều 2. Đối tượng áp dụng\n"
                "1. Người lao động nước ngoài.\n"
                "2. Người sử dụng lao động.\n"
            ),
        },
        {
            "doc_name": "1002",
            "source_url": "https://vbpl.vn/van-ban/chi-tiet/x2",
            "title": "Văn bản không liên quan",
            "doc_type": "thong_tu",
            "doc_number": None,
            "issue_date": None,
            "issuing_authority": "Bộ Tài chính",
            "markdown": None,
        },
    ]
    _write_jsonl(raw_dir / "vbpl" / "sample.jsonl", vbpl_rows)

    th_metadata_rows = [
        {
            "id": "5001",
            "title": "Quy định về giấy phép lao động",  # tmquan doc 1001과 동일 문서(중복 시나리오)
            "so_ky_hieu": "152/2020/NĐ-CP",
            "ngay_ban_hanh": "30/12/2020",
            "co_quan_ban_hanh": "Chính phủ",
            "tinh_trang_hieu_luc": "Còn hiệu lực",
        },
        {
            "id": "5002",
            "title": "Một văn bản khác hoàn toàn",
            "so_ky_hieu": "99/2019/TT-BLĐTBXH",
            "ngay_ban_hanh": "01/01/2019",
            "co_quan_ban_hanh": "Bộ Lao động Thương binh và Xã hội",
            "tinh_trang_hieu_luc": "Hết hiệu lực toàn bộ",
        },
    ]
    _write_jsonl(raw_dir / "th1nhng0" / "sample_metadata.jsonl", th_metadata_rows)

    th_content_rows = [
        {"id": "5001", "content_html": "<p>Điều 1. Phạm vi điều chỉnh...</p>"},
        {"id": "5002", "content_html": "<p>Điều 1. Nội dung khác...</p>"},
    ]
    _write_jsonl(raw_dir / "th1nhng0" / "sample_content.jsonl", th_content_rows)

    th_relationship_rows = [
        {"doc_id": "5002", "other_doc_id": "5001", "relationship": "Bãi bỏ"},
    ]
    _write_jsonl(raw_dir / "th1nhng0" / "sample_relationships.jsonl", th_relationship_rows)

    return raw_dir


def test_full_pipeline_end_to_end(tmp_path):
    raw_dir = _build_raw_fixture(tmp_path)

    # 1. Audit
    audit_result = run_audit(raw_dir)
    assert audit_result.total_documents >= 3  # vbpl 2건 + th1nhng0 metadata 2건 중 body 유무 무관 카운트
    assert audit_result.relationship_total == 1
    assert audit_result.missing_body_count >= 1  # doc_name=1002는 markdown=None

    # 2. Normalize
    documents = [doc for doc, _ in normalize_all(raw_dir)]
    assert len(documents) == 4  # vbpl 2 + th1nhng0 metadata 2
    doc_by_id = {d.documentId: d for d in documents}
    assert "tmquan:1001" in doc_by_id
    assert "th1nhng0:5001" in doc_by_id
    assert doc_by_id["th1nhng0:5001"].status == "active"
    assert doc_by_id["th1nhng0:5002"].status == "repealed"
    assert doc_by_id["th1nhng0:5001"].originalText is not None  # content join 성공

    # 3. Deduplicate — tmquan:1001과 th1nhng0:5001은 documentNumber+issueDate+authority가 동일
    doc_dicts = [d.to_dict() for d in documents]
    outcome = deduplicate(doc_dicts)
    merged_groups = [g for g in outcome.groups if len(g.member_document_ids) > 1]
    assert len(merged_groups) == 1
    assert set(merged_groups[0].member_document_ids) == {"tmquan:1001", "th1nhng0:5001"}
    assert outcome.total_after_dedup == 3  # 4건 중 1건 병합

    # 4. Parse legal structure (병합 살아남은 문서들에 대해)
    dropped_ids = {
        m for g in outcome.groups for m in g.member_document_ids
        if m != g.canonical_document_id
    }
    survivors = [d for d in documents if d.documentId not in dropped_ids]
    all_chunks = []
    for doc in survivors:
        chunks = parse_document_structure(
            doc.documentId, doc.normalizedText, doc.documentNumber, doc.status
        )
        all_chunks.extend(chunks)
    assert len(all_chunks) > 0
    # tmquan:1001은 Điều 1, Điều 2를 포함해야 함
    tmquan_chunks = [c for c in all_chunks if c.documentId == "tmquan:1001"]
    assert any("Điều 1" in c.path for c in tmquan_chunks)
    assert any("Điều 2" in c.path for c in tmquan_chunks)

    # 5. Relations — th1nhng0:5002 "Bãi bỏ" th1nhng0:5001 (원본 방향 보존)
    relationships_raw_path = raw_dir / "th1nhng0" / "sample_relationships.jsonl"
    from src.audit_datasets import iter_records

    edges, unknown = normalize_relationship_rows(iter_records(relationships_raw_path))
    assert len(edges) == 1
    assert edges[0].sourceDocumentId == "th1nhng0:5002"
    assert edges[0].targetDocumentId == "th1nhng0:5001"
    assert edges[0].relationType == "repeals"
    assert len(unknown) == 0

    # 6. Effective scopes — repeals 관계의 대상(th1nhng0:5001, 병합되어 사라졌을 수 있음)에
    #    대한 scope 생성 로직 검증. 병합으로 인해 documentId가 바뀌었을 수 있으므로,
    #    병합 전 원본 문서 집합으로 직접 검증한다(파이프라인 순서 의존성 확인 목적).
    documents_by_id = {d.documentId: d.to_dict() for d in documents}
    chunks_for_5001 = parse_document_structure(
        "th1nhng0:5001", doc_by_id["th1nhng0:5001"].normalizedText,
        doc_by_id["th1nhng0:5001"].documentNumber, doc_by_id["th1nhng0:5001"].status,
    )
    chunk_dicts = [c.to_dict() for c in chunks_for_5001]
    edge_dicts = [e.to_dict() for e in edges]
    scopes = build_effective_scopes(chunk_dicts, documents_by_id, edge_dicts)
    assert len(scopes) == len(chunk_dicts)
    assert all(s.source_relation_id == edges[0].edgeId for s in scopes)
