"""
Canonical Document Schema 정규화 — STEP1 Schema V2.

실행 방법:
    python -m src.normalize_documents \
        --input-dir data/raw --output-dir data/normalized --reports-dir reports

원본 데이터(data/raw/*)는 절대 수정하지 않는다.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any, Iterator

from .audit_datasets import discover_data_files, iter_records, _classify_file
from .authority_weight import compute_authority_weight
from .category_mapping import map_legal_sectors, map_linh_vuc, map_vbpl_legal_area
from .document_validation import ValidationReport, validate_all
from .normalize_relations import normalize_relationship_rows
from .relation_documents import attach_relations_to_documents
from .schema import CanonicalDocument, DocumentStatus, SourceDataset
from .utils import (
    build_search_text,
    normalize_date,
    normalize_document_number,
    normalize_vietnamese_text,
    sha256_text,
)

logger = logging.getLogger("legal_rag.normalize")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

VBPL_VN_REVISION = "11c902856b7a389788853fdd39b4998a5effa490"
VIETNAMESE_LEGAL_DOCS_REVISION = "0a39ad7eae8e6c188cb225c4b1443c3b346461d8"

_STATUS_MAP = {
    "còn hiệu lực": DocumentStatus.ACTIVE,
    "hết hiệu lực một phần": DocumentStatus.AMENDED,
    "hết hiệu lực toàn bộ": DocumentStatus.REPEALED,
    "hết hiệu lực": DocumentStatus.REPEALED,
    "đã sửa đổi": DocumentStatus.AMENDED,
    "sửa đổi": DocumentStatus.AMENDED,
    "thay thế": DocumentStatus.SUPERSEDED,
    "ngưng hiệu lực": DocumentStatus.SUSPENDED,
    "in effect": DocumentStatus.ACTIVE,
    "not in effect": DocumentStatus.REPEALED,
    "expired": DocumentStatus.REPEALED,
}


def standardize_status(raw_status: str | None) -> DocumentStatus:
    if not raw_status:
        return DocumentStatus.UNKNOWN
    key = raw_status.strip().lower()
    for pattern, status in _STATUS_MAP.items():
        if pattern in key:
            return status
    return DocumentStatus.UNKNOWN


def apply_not_yet_effective(status: DocumentStatus, effective_date: str | None, today: date | None = None) -> DocumentStatus:
    today = today or date.today()
    if status != DocumentStatus.ACTIVE:
        return status
    if not effective_date:
        return status
    try:
        eff = date.fromisoformat(effective_date[:10])
    except ValueError:
        return status
    if eff > today:
        return DocumentStatus.NOT_YET_EFFECTIVE
    return status


def finalize_status(raw_status: str | None, effective_date: str | None, today: date | None = None) -> str:
    base = standardize_status(raw_status)
    final = apply_not_yet_effective(base, effective_date, today=today)
    return final.value


def _build_content_fields(original: str | None) -> tuple[str | None, str | None, str | None]:
    if not original:
        return None, None, None
    normalized = normalize_vietnamese_text(original)
    search_text = build_search_text(normalized)
    return original, normalized, search_text


def normalize_vbpl_row(row: dict[str, Any], today: date | None = None) -> tuple[CanonicalDocument, str | None]:
    original, normalized, search_text = _build_content_fields(row.get("markdown"))
    content_hash = sha256_text(normalized) if normalized else None
    doc_type = row.get("doc_type")
    legal_area = row.get("legal_area")
    pilot_category = row.get("pilotCategory")
    if pilot_category and isinstance(pilot_category, list):
        category = pilot_category
        empty_reason = None
    else:
        category, empty_reason = map_vbpl_legal_area(legal_area)

    if row.get("pilotStatusHint") == "repealed":
        status = DocumentStatus.REPEALED.value
        raw_status = "pilot:repealed_example"
    else:
        status = DocumentStatus.UNKNOWN.value
        raw_status = None

    doc = CanonicalDocument(
        documentId=f"tmquan:{row.get('doc_name')}",
        sourceDataset=SourceDataset.TMQUAN_VBPL_VN.value,
        sourceRevision=VBPL_VN_REVISION,
        sourceDocumentId=str(row.get("doc_name")),
        officialUrl=row.get("source_url"),
        gatewayUrl=row.get("api_url"),
        documentNumber=normalize_document_number(
            (row.get("doc_number") or [None])[0] if isinstance(row.get("doc_number"), list)
            else row.get("doc_number")
        ),
        documentType=doc_type,
        title=row.get("title"),
        issuingAuthority=row.get("issuing_authority"),
        issueDate=normalize_date(row.get("issue_date")),
        effectiveDate=None,
        expiryDate=None,
        publicationDate=None,
        status=status,
        rawStatus=raw_status,
        category=category,
        authorityWeight=compute_authority_weight(doc_type),
        language="vi",
        summary=row.get("summary"),
        keywords=[],
        originalText=original,
        normalizedText=normalized,
        searchText=search_text,
        contentHash=content_hash,
    )
    return doc, empty_reason


def normalize_th1nhng0_metadata_row(
    row: dict[str, Any], content_by_id: dict[str, str] | None = None, today: date | None = None
) -> tuple[CanonicalDocument, str | None]:
    content_by_id = content_by_id or {}
    doc_id = str(row.get("id"))
    original = content_by_id.get(doc_id)
    original, normalized, search_text = _build_content_fields(original)
    content_hash = sha256_text(normalized) if normalized else None
    raw_status = row.get("tinh_trang_hieu_luc")
    doc_type = row.get("loai_van_ban")
    effective_date = normalize_date(row.get("ngay_co_hieu_luc"))
    category, empty_reason = map_linh_vuc(row.get("linh_vuc"))

    return CanonicalDocument(
        documentId=f"th1nhng0:{doc_id}",
        sourceDataset=SourceDataset.TH1NHNG0_METADATA.value,
        sourceRevision=VIETNAMESE_LEGAL_DOCS_REVISION,
        sourceDocumentId=doc_id,
        officialUrl=None,
        gatewayUrl=None,
        documentNumber=normalize_document_number(row.get("so_ky_hieu")),
        documentType=doc_type,
        title=row.get("title"),
        issuingAuthority=row.get("co_quan_ban_hanh"),
        issueDate=normalize_date(row.get("ngay_ban_hanh")),
        effectiveDate=effective_date,
        expiryDate=normalize_date(row.get("ngay_het_hieu_luc")),
        publicationDate=normalize_date(row.get("ngay_dang_cong_bao")),
        status=finalize_status(raw_status, effective_date, today=today),
        rawStatus=raw_status,
        category=category,
        authorityWeight=compute_authority_weight(doc_type),
        language="vi",
        summary=None,
        keywords=[],
        originalText=original,
        normalizedText=normalized,
        searchText=search_text,
        contentHash=content_hash,
    ), empty_reason


def normalize_th1nhng0_legacy_row(
    row: dict[str, Any], content_by_id: dict[str, str] | None = None, today: date | None = None
) -> tuple[CanonicalDocument, str | None]:
    content_by_id = content_by_id or {}
    doc_id = str(row.get("id"))
    original = content_by_id.get(doc_id)
    original, normalized, search_text = _build_content_fields(original)
    content_hash = sha256_text(normalized) if normalized else None
    raw_status = row.get("effect_status")
    doc_type = row.get("legal_type")
    effective_date = normalize_date(row.get("effect_date"))
    category, empty_reason = map_legal_sectors(row.get("legal_sectors"))

    return CanonicalDocument(
        documentId=f"th1nhng0-legacy:{doc_id}",
        sourceDataset=SourceDataset.TH1NHNG0_LEGACY.value,
        sourceRevision=VIETNAMESE_LEGAL_DOCS_REVISION,
        sourceDocumentId=doc_id,
        officialUrl=None,
        gatewayUrl=None,
        documentNumber=normalize_document_number(row.get("document_number")),
        documentType=doc_type,
        title=row.get("title"),
        issuingAuthority=row.get("issuing_authority"),
        issueDate=normalize_date(row.get("issuance_date")),
        effectiveDate=effective_date,
        expiryDate=normalize_date(row.get("effectless_date")),
        publicationDate=None,
        status=finalize_status(raw_status, effective_date, today=today),
        rawStatus=raw_status,
        category=category,
        authorityWeight=compute_authority_weight(doc_type),
        language="vi",
        summary=None,
        keywords=[],
        originalText=original,
        normalizedText=normalized,
        searchText=search_text,
        contentHash=content_hash,
    ), empty_reason


def _load_content_index(files: list[Path], classify_key: str) -> dict[str, str]:
    index: dict[str, str] = {}
    for path in files:
        if _classify_file(path) != classify_key:
            continue
        for row in iter_records(path):
            rid = str(row.get("id"))
            body = row.get("content_html") or row.get("content")
            if rid and body:
                index[rid] = body
    return index


def normalize_all(input_dir: Path, today: date | None = None) -> Iterator[tuple[CanonicalDocument, str | None]]:
    files = discover_data_files(input_dir)
    if not files:
        logger.warning("입력 디렉토리에서 데이터 파일을 찾지 못했습니다: %s", input_dir)
        return

    th1nhng0_content_index = _load_content_index(files, "th1nhng0_content")
    th1nhng0_legacy_content_index = _load_content_index(files, "th1nhng0_legacy_content")

    for path in files:
        source_key = _classify_file(path)
        if source_key == "vbpl":
            for row in iter_records(path):
                yield normalize_vbpl_row(row, today=today)
        elif source_key == "th1nhng0_metadata":
            for row in iter_records(path):
                yield normalize_th1nhng0_metadata_row(row, th1nhng0_content_index, today=today)
        elif source_key == "th1nhng0_legacy_metadata":
            for row in iter_records(path):
                yield normalize_th1nhng0_legacy_row(row, th1nhng0_legacy_content_index, today=today)


def _load_relationship_edges(input_dir: Path) -> list:
    files = discover_data_files(input_dir)
    edges = []
    for path in files:
        if _classify_file(path) != "th1nhng0_relationships":
            continue
        batch, _ = normalize_relationship_rows(iter_records(path))
        edges.extend(batch)
    return edges


def _render_report_markdown(stats: dict) -> str:
    lines = ["# Normalization Report (STEP1 Schema V2)", ""]
    lines.append(f"- Total documents: {stats['total']}")
    lines.append(f"- Passed validation: {stats['passed']}")
    lines.append(f"- Hard-fail: {stats['hard_fail']}")
    lines.append("")
    lines.append("## Status distribution")
    for k, v in stats["status"].most_common():
        lines.append(f"- `{k}`: {v}")
    lines.append("")
    lines.append("## authorityWeight distribution")
    for k, v in sorted(stats["authority_weight"].items()):
        lines.append(f"- {k}: {v}")
    lines.append("")
    lines.append("## Category distribution (canonical)")
    for k, v in stats["category"].most_common():
        lines.append(f"- `{k}`: {v}")
    lines.append("")
    lines.append("## Empty category (`[]`)")
    lines.append(f"- Total: {stats['empty_category_total']}")
    lines.append(f"- unclassified: {stats['empty_unclassified']}")
    lines.append(f"- out_of_scope: {stats['empty_out_of_scope']}")
    lines.append("")
    lines.append("## relatedDocuments (SoT)")
    lines.append(f"- Documents with relations: {stats['docs_with_relations']}")
    lines.append(f"- Total relation entries: {stats['relation_entries']}")
    for k, v in stats["relation_type"].most_common():
        lines.append(f"- `{k}`: {v}")
    if stats.get("relation_unknown_needs_review"):
        lines.append("")
        lines.append("### relationType unknown (needs review)")
        for k, v in stats["relation_unknown_needs_review"].most_common():
            lines.append(f"- `{k}`: {v}")
    if stats.get("hard_fail_details"):
        lines.append("")
        lines.append("## Hard-fail details")
        for item in stats["hard_fail_details"]:
            lines.append(f"- `{item['documentId']}` Rule {item['rule']}: {item['message']}")
    lines.append("")
    return "\n".join(lines)


def run(input_dir: Path, output_dir: Path, reports_dir: Path, today: date | None = None) -> dict:
    output_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / "documents.jsonl"

    docs: list[dict] = []
    empty_reasons: list[tuple[str, str, str]] = []  # docId, raw hint, reason

    for doc, empty_reason in normalize_all(input_dir, today=today):
        d = doc.to_dict()
        if empty_reason:
            empty_reasons.append((doc.documentId, "", empty_reason))
        docs.append(d)

    edges = _load_relationship_edges(input_dir)
    attach_relations_to_documents(docs, edges)

    validation: ValidationReport = validate_all(docs, today=today)
    passed_ids = set(validation.passed_document_ids)
    output_docs = [d for d in docs if d["documentId"] in passed_ids]

    with out_path.open("w", encoding="utf-8") as f:
        for doc in output_docs:
            f.write(json.dumps(doc, ensure_ascii=False) + "\n")

    category_counter: Counter = Counter()
    for doc in output_docs:
        if doc.get("category"):
            for c in doc["category"]:
                category_counter[c] += 1

    empty_unclassified = sum(1 for _, _, r in empty_reasons if r == "unclassified")
    empty_out_of_scope = sum(1 for _, _, r in empty_reasons if r == "out_of_scope")

    relation_type_counter: Counter = Counter()
    docs_with_relations = 0
    relation_entries = 0
    for doc in output_docs:
        rels = doc.get("relatedDocuments") or []
        if rels:
            docs_with_relations += 1
        relation_entries += len(rels)
        for rel in rels:
            relation_type_counter[rel.get("relationType", "unknown")] += 1

    stats = {
        "total": len(docs),
        "passed": len(output_docs),
        "hard_fail": validation.hard_fail_count,
        "status": Counter(d.get("status") for d in output_docs),
        "authority_weight": Counter(d.get("authorityWeight") for d in output_docs),
        "category": category_counter,
        "empty_category_total": sum(1 for d in output_docs if not d.get("category")),
        "empty_unclassified": empty_unclassified,
        "empty_out_of_scope": empty_out_of_scope,
        "docs_with_relations": docs_with_relations,
        "relation_entries": relation_entries,
        "relation_type": relation_type_counter,
        "hard_fail_details": [
            {"documentId": e.document_id, "rule": e.rule, "message": e.message}
            for e in validation.errors
        ],
    }
    stats_serializable = {
        **stats,
        "status": dict(stats["status"]),
        "authority_weight": {str(k): v for k, v in stats["authority_weight"].items()},
        "category": dict(stats["category"]),
        "relation_type": dict(stats["relation_type"]),
    }

    (reports_dir / "normalization-v2.json").write_text(
        json.dumps(stats_serializable, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (reports_dir / "normalization-v2.md").write_text(_render_report_markdown(stats), encoding="utf-8")

    logger.info(
        "정규화 완료: %d건 입력, %d건 통과, %d건 hard-fail -> %s",
        len(docs),
        len(output_docs),
        validation.hard_fail_count,
        out_path,
    )
    return stats_serializable


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="VFBCAI Legal Intelligence Platform — Document 정규화 (V2)")
    parser.add_argument("--input-dir", type=str, default="data/raw")
    parser.add_argument("--output-dir", type=str, default="data/normalized")
    parser.add_argument("--reports-dir", type=str, default="reports")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)
    run(Path(args.input_dir), Path(args.output_dir), Path(args.reports_dir))
    return 0


if __name__ == "__main__":
    sys.exit(main())
