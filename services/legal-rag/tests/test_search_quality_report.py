from src.search_quality_report import compute_quality
from src.validate_real_dataset import build_realistic_fixture_rows, run_pipeline
from src.dataset_mapper import map_dataset
from src.deduplicate_documents import deduplicate
from src.normalize_relations import normalize_relationship_rows
from src.parse_legal_structure import parse_document_structure


def _build_quality_inputs():
    rows = build_realistic_fixture_rows()
    pipeline_report, index = run_pipeline(rows)

    mapped_docs, _ = map_dataset(rows)
    outcome = deduplicate(mapped_docs)
    dropped = {m for g in outcome.groups for m in g.member_document_ids if m != g.canonical_document_id}
    deduped_docs = [d for d in mapped_docs if d["documentId"] not in dropped]

    all_chunks = []
    for doc in deduped_docs:
        chunks = parse_document_structure(
            doc["documentId"], doc.get("normalizedText"), doc.get("documentNumber"), doc.get("status")
        )
        all_chunks.extend(c.to_dict() for c in chunks)

    raw_relationships = [row for sk, row in rows if sk == "th1nhng0_relationships"]
    edges, _ = normalize_relationship_rows(iter(raw_relationships))
    edge_dicts = [e.to_dict() for e in edges]

    return mapped_docs, deduped_docs, all_chunks, edge_dicts, index


def test_compute_quality_exact_success_is_high():
    mapped_docs, deduped_docs, chunks, edges, index = _build_quality_inputs()
    report = compute_quality(deduped_docs, chunks, edges, index, pre_dedup_documents=mapped_docs)
    assert report.exact_success.rate == 1.0


def test_compute_quality_document_match_is_high():
    mapped_docs, deduped_docs, chunks, edges, index = _build_quality_inputs()
    report = compute_quality(deduped_docs, chunks, edges, index, pre_dedup_documents=mapped_docs)
    assert report.document_match.rate == 1.0


def test_compute_quality_article_match_uses_path_locators():
    """LegalChunk.to_dict()에는 article_no가 아니라 path만 있으므로, 이를 올바르게
    파싱해서 계산하는지 확인(회귀 테스트 — 과거 이 부분이 버그였음)."""
    mapped_docs, deduped_docs, chunks, edges, index = _build_quality_inputs()
    report = compute_quality(deduped_docs, chunks, edges, index, pre_dedup_documents=mapped_docs)
    assert report.article_match.denominator > 0
    assert report.article_match.rate == 1.0


def test_compute_quality_duplicate_count_uses_pre_dedup_set():
    """dedup 이후 목록만 넘기면 항상 0이 나오는 버그가 있었음(회귀 테스트).
    pre_dedup_documents를 명시적으로 넘기면 실제 중복 그룹 수가 나와야 한다."""
    mapped_docs, deduped_docs, chunks, edges, index = _build_quality_inputs()
    report = compute_quality(deduped_docs, chunks, edges, index, pre_dedup_documents=mapped_docs)
    assert report.duplicate_documents == 1

    # pre_dedup_documents를 생략하면(=documents 그대로 사용) dedup된 집합에는
    # 중복이 없으므로 0이 나오는 것이 정상 동작임을 함께 확인
    report_without_pre = compute_quality(deduped_docs, chunks, edges, index)
    assert report_without_pre.duplicate_documents == 0


def test_compute_quality_missing_documents_detected():
    mapped_docs, deduped_docs, chunks, edges, index = _build_quality_inputs()
    report = compute_quality(deduped_docs, chunks, edges, index, pre_dedup_documents=mapped_docs)
    assert report.missing_documents == 1  # markdown=None인 vbpl:999999


def test_compute_quality_html_errors_zero_after_normalization():
    mapped_docs, deduped_docs, chunks, edges, index = _build_quality_inputs()
    report = compute_quality(deduped_docs, chunks, edges, index, pre_dedup_documents=mapped_docs)
    assert report.html_errors == 0  # normalize_vietnamese_text가 HTML을 제거했어야 함


def test_compute_quality_relationship_match():
    mapped_docs, deduped_docs, chunks, edges, index = _build_quality_inputs()
    report = compute_quality(deduped_docs, chunks, edges, index, pre_dedup_documents=mapped_docs)
    # 미분류(unknown) 관계는 분모에서 제외되므로, 분류된 관계(references) 1건만 대상
    assert report.relationship_match.denominator == 1
    assert report.relationship_match.rate == 1.0


def test_compute_quality_parsing_errors_zero_when_structure_recognized():
    mapped_docs, deduped_docs, chunks, edges, index = _build_quality_inputs()
    report = compute_quality(deduped_docs, chunks, edges, index, pre_dedup_documents=mapped_docs)
    assert report.parsing_errors == 0
