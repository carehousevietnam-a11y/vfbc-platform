"""
STEP 2 — 1,000건 확장 end-to-end 파이프라인.

200건 파일럿과 동일 규칙(스키마·category·3가지 버그 수정)을 5배 quota로 실행한다.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from collections import Counter
from pathlib import Path

from .audit_datasets import iter_records
from .curate_pilot_200 import backfill_pilot, curate_pilot
from .document_validation import validate_all
from .normalize_documents import normalize_vbpl_row
from .parse_legal_structure import parse_document_structure
from .pilot_target_lookup import build_th1nhng0_status_lookup, doc_numbers_from_row, norm_text
from .search_engine import LegalSearchIndex, load_from_pipeline_jsonl

logger = logging.getLogger("legal_rag.pilot_1000")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

SAMPLE_QUERIES = [
    "외국인 노동허가 요건",
    "giấy phép lao động người nước ngoài",
    "베트남 부동산 매매 시 외국인 제한",
    "quyền sử dụng đất người nước ngoài",
    "사기 계약 관련 hình sự",
    "lừa đảo chiếm đoạt tài sản",
    "đăng ký doanh nghiệp",
    "thuế giá trị gia tăng",
    "thủ tục hành chính",
    "152/2020/NĐ-CP",
]

LARGE_DOC_CHAR_THRESHOLD = 100_000


def _enrich_status_from_th1nhng0(pilot_jsonl: Path, manifest_path: Path) -> int:
    rows = list(iter_records(pilot_jsonl))
    all_numbers: set[str] = set()
    for row in rows:
        for n in doc_numbers_from_row(row):
            all_numbers.add(n)
    status_lookup = build_th1nhng0_status_lookup(all_numbers)
    enriched_count = 0
    for row in rows:
        for n in doc_numbers_from_row(row):
            key = norm_text(n)
            if key in status_lookup:
                row["tinh_trang_hieu_luc"] = status_lookup[key]
                enriched_count += 1
                break
    with pilot_jsonl.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False, default=str) + "\n")
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest["status_enriched_from_th1nhng0"] = enriched_count
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return enriched_count


def _normalize_pilot(pilot_jsonl: Path, output_dir: Path) -> tuple[list[dict], dict]:
    docs: list[dict] = []
    for row in iter_records(pilot_jsonl):
        doc, _ = normalize_vbpl_row(row)
        docs.append(doc.to_dict())

    validation = validate_all(docs)
    passed = [d for d in docs if d["documentId"] in set(validation.passed_document_ids)]

    output_dir.mkdir(parents=True, exist_ok=True)
    docs_path = output_dir / "documents.jsonl"
    with docs_path.open("w", encoding="utf-8") as f:
        for doc in passed:
            f.write(json.dumps(doc, ensure_ascii=False) + "\n")

    chunks_path = output_dir / "chunks.jsonl"
    chunk_count = 0
    with chunks_path.open("w", encoding="utf-8") as f:
        for doc in passed:
            if not doc.get("normalizedText"):
                continue
            chunks = parse_document_structure(
                doc["documentId"],
                doc["normalizedText"],
                doc.get("documentNumber") or [],
                doc.get("status") or "unknown",
            )
            for chunk in chunks:
                f.write(json.dumps(chunk.to_dict(), ensure_ascii=False) + "\n")
                chunk_count += 1

    stats = {
        "input": len(docs),
        "passed": len(passed),
        "hard_fail": validation.hard_fail_count,
        "hard_fail_details": [
            {"documentId": e.document_id, "rule": e.rule, "message": e.message}
            for e in validation.errors
        ],
        "chunks": chunk_count,
    }
    return passed, stats


def _run_search_samples(docs_path: Path, chunks_path: Path, report_dir: Path) -> list[dict]:
    documents, chunks, _ = load_from_pipeline_jsonl(docs_path, chunks_path, None)
    index = LegalSearchIndex(documents, chunks, relations=[])

    results_log = []
    for query in SAMPLE_QUERIES:
        hits = index.search(query=query, limit=5)
        results_log.append(
            {
                "query": query,
                "hit_count": len(hits),
                "top_hits": [
                    {
                        "document_number": h.document_number,
                        "title": h.title,
                        "article_no": h.article_no,
                        "clause_no": h.clause_no,
                        "status": h.status,
                        "score": h.score,
                        "match_type": h.match_type,
                    }
                    for h in hits[:3]
                ],
            }
        )
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "pilot_1000_search_samples.json").write_text(
        json.dumps(results_log, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return results_log


def _build_spot_checks(
    passed_docs: list[dict],
    raw_rows: list[dict],
    chunks_path: Path,
    search_results: list[dict],
) -> dict:
    chunk_by_doc: Counter = Counter()
    if chunks_path.exists():
        for line in chunks_path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                chunk_by_doc[json.loads(line)["documentId"]] += 1

    doc_by_id = {d["documentId"]: d for d in passed_docs}
    empty_body_by_cat: Counter = Counter()
    empty_body_total = 0
    for row in raw_rows:
        if not (row.get("markdown") or "").strip():
            empty_body_total += 1
            cats = row.get("pilotCategory") or ["(unmapped)"]
            for c in cats:
                empty_body_by_cat[c] += 1

    single_chunk_large: list[dict] = []
    multi_chunk_large: list[dict] = []
    for doc in passed_docs:
        text_len = len(doc.get("normalizedText") or "")
        if text_len < LARGE_DOC_CHAR_THRESHOLD:
            continue
        cnt = chunk_by_doc.get(doc["documentId"], 0)
        entry = {
            "document_number": doc.get("documentNumber"),
            "title": (doc.get("title") or "")[:80],
            "document_type": doc.get("documentType"),
            "category": doc.get("category"),
            "text_chars": text_len,
            "chunk_count": cnt,
        }
        if cnt <= 1:
            single_chunk_large.append(entry)
        else:
            multi_chunk_large.append(entry)

    weight = Counter(d.get("authorityWeight") for d in passed_docs)
    query_152 = next((r for r in search_results if r["query"] == "152/2020/NĐ-CP"), None)
    query_vat = next((r for r in search_results if r["query"] == "thuế giá trị gia tăng"), None)

    return {
        "authorityWeight_100_count": weight.get(100, 0),
        "authorityWeight_distribution": dict(sorted(weight.items())),
        "empty_body_count": empty_body_total,
        "empty_body_ratio_pct": round(100 * empty_body_total / max(len(raw_rows), 1), 1),
        "empty_body_by_category": dict(empty_body_by_cat.most_common()),
        "docs_with_zero_chunks": sum(1 for d in passed_docs if chunk_by_doc.get(d["documentId"], 0) == 0),
        "single_chunk_docs": sum(1 for did in chunk_by_doc if chunk_by_doc[did] == 1),
        "multi_chunk_docs": sum(1 for did in chunk_by_doc if chunk_by_doc[did] > 1),
        "total_chunks": sum(chunk_by_doc.values()),
        "large_docs_100k_plus_single_chunk": single_chunk_large[:20],
        "large_docs_100k_plus_multi_chunk_sample": multi_chunk_large[:10],
        "search_152_2020_top": query_152.get("top_hits", [])[:2] if query_152 else [],
        "search_vat_top": query_vat.get("top_hits", [])[:2] if query_vat else [],
    }


def _render_report(
    collection_manifest: dict,
    norm_stats: dict,
    passed_docs: list[dict],
    search_results: list[dict],
    spot_checks: dict,
) -> str:
    status_by_number: dict[str, str] = {}
    for doc in passed_docs:
        for num in doc.get("documentNumber") or []:
            status_by_number[num] = doc.get("status") or "unknown"

    lines = ["# STEP 2 Pilot 1,000 — Collection & Normalization Report", ""]

    lines.append("## 1. Category collection vs quota")
    quotas = collection_manifest.get("quotas", {})
    actual = collection_manifest.get("actual_counts", {})
    for cat in quotas:
        lines.append(f"- **{cat}**: {actual.get(cat, 0)} / {quotas[cat]}")
    shortfalls = collection_manifest.get("shortfalls", {})
    if shortfalls:
        lines.append("")
        lines.append("### Shortfalls")
        for cat, n in shortfalls.items():
            lines.append(f"- {cat}: {n}건 부족")
    lines.append("")

    lines.append("## 2. Spot checks (200건 리뷰 재발 방지)")
    lines.append(f"- **authorityWeight=100**: {spot_checks['authorityWeight_100_count']}건")
    lines.append(f"- **authorityWeight 분포**: {spot_checks['authorityWeight_distribution']}")
    lines.append(
        f"- **빈 본문(원본 markdown empty)**: {spot_checks['empty_body_count']}건 "
        f"({spot_checks['empty_body_ratio_pct']}%)"
    )
    lines.append(f"- **빈 본문 by category**: {spot_checks['empty_body_by_category']}")
    lines.append(f"- **청크 0개 문서**: {spot_checks['docs_with_zero_chunks']}건")
    lines.append(
        f"- **단일 청크 / 다중 청크**: {spot_checks['single_chunk_docs']} / "
        f"{spot_checks['multi_chunk_docs']} (총 청크 {spot_checks['total_chunks']})"
    )
    if spot_checks["large_docs_100k_plus_single_chunk"]:
        lines.append("- **10만자+ 단일 청크 (주의)**:")
        for item in spot_checks["large_docs_100k_plus_single_chunk"][:10]:
            lines.append(
                f"  - {item['document_number']} ({item['document_type']}, "
                f"{item['text_chars']}자, {item['chunk_count']} chunks)"
            )
    else:
        lines.append("- **10만자+ 단일 청크**: 없음")
    if spot_checks["large_docs_100k_plus_multi_chunk_sample"]:
        lines.append("- **10만자+ 다중 청크 샘플**:")
        for item in spot_checks["large_docs_100k_plus_multi_chunk_sample"][:5]:
            lines.append(
                f"  - {item['document_number']} → {item['chunk_count']} chunks "
                f"({item['text_chars']}자)"
            )
    lines.append("")

    lines.append("## 3. Validation")
    lines.append(
        f"- Input: {norm_stats.get('input')}, Passed: {norm_stats.get('passed')}, "
        f"Hard-fail: {norm_stats.get('hard_fail')}"
    )
    if norm_stats.get("hard_fail_details"):
        for item in norm_stats["hard_fail_details"][:20]:
            lines.append(f"  - `{item['documentId']}` Rule {item['rule']}: {item['message']}")
    lines.append("")

    lines.append("## 4. Distributions")
    status = Counter(d.get("status") for d in passed_docs)
    weight = Counter(d.get("authorityWeight") for d in passed_docs)
    category = Counter(c for d in passed_docs for c in (d.get("category") or []))
    relation_type = Counter(
        rel.get("relationType")
        for d in passed_docs
        for rel in (d.get("relatedDocuments") or [])
    )
    lines.append("### status")
    for k, v in status.most_common():
        lines.append(f"- `{k}`: {v}")
    lines.append("### authorityWeight")
    for k, v in sorted(weight.items()):
        lines.append(f"- {k}: {v}")
    lines.append("### category")
    for k, v in category.most_common():
        lines.append(f"- `{k}`: {v}")
    lines.append("### relationType (relatedDocuments)")
    if relation_type:
        for k, v in relation_type.most_common():
            lines.append(f"- `{k}`: {v}")
    else:
        lines.append("- (none — tmquan corpus has no relatedDocuments edges)")
    lines.append("")

    lines.append("## 5. Sample search queries (10)")
    for item in search_results:
        lines.append(f"- **{item['query']}** → {item['hit_count']}건")
        for hit in item.get("top_hits", [])[:2]:
            lines.append(
                f"  - {hit.get('document_number')} | score={hit.get('score')} "
                f"{hit.get('match_type')} | {(hit.get('title') or '')[:60]}"
            )
    lines.append("")

    lines.append("## 6. Document list (abbreviated — full list in JSON manifest)")
    for item in sorted(
        collection_manifest.get("documents", []),
        key=lambda x: (x.get("category") or "", x.get("title") or ""),
    )[:50]:
        nums = ", ".join(item.get("document_number") or [])
        lines.append(
            f"- [{item.get('category')}] `{nums}` — {(item.get('title') or '')[:70]}"
        )
    if len(collection_manifest.get("documents", [])) > 50:
        lines.append(f"- … 외 {len(collection_manifest['documents']) - 50}건 (manifest JSON 참고)")
    lines.append("")
    return "\n".join(lines)


def run_pipeline(
    targets_path: Path,
    pilot_raw_path: Path,
    collection_manifest_path: Path,
    normalized_dir: Path,
    reports_dir: Path,
    skip_curate: bool = False,
    backfill: bool = False,
    max_scan_rows: int | None = None,
) -> dict:
    if backfill and pilot_raw_path.exists():
        collection_manifest = backfill_pilot(
            targets_path, pilot_raw_path, collection_manifest_path, max_scan_rows=max_scan_rows
        )
    elif not skip_curate or not pilot_raw_path.exists():
        collection_manifest = curate_pilot(
            targets_path, pilot_raw_path, collection_manifest_path, max_scan_rows=max_scan_rows
        )
    else:
        collection_manifest = json.loads(collection_manifest_path.read_text(encoding="utf-8"))

    enriched = _enrich_status_from_th1nhng0(pilot_raw_path, collection_manifest_path)
    collection_manifest["status_enriched_from_th1nhng0"] = enriched

    raw_rows = list(iter_records(pilot_raw_path))
    passed_docs, norm_stats = _normalize_pilot(pilot_raw_path, normalized_dir)
    search_results = _run_search_samples(
        normalized_dir / "documents.jsonl",
        normalized_dir / "chunks.jsonl",
        reports_dir,
    )
    spot_checks = _build_spot_checks(
        passed_docs,
        raw_rows,
        normalized_dir / "chunks.jsonl",
        search_results,
    )

    report_md = _render_report(collection_manifest, norm_stats, passed_docs, search_results, spot_checks)
    reports_dir.mkdir(parents=True, exist_ok=True)
    (reports_dir / "pilot_1000_report.md").write_text(report_md, encoding="utf-8")
    summary = {
        "spot_checks": spot_checks,
        "collection": collection_manifest,
        "normalization": norm_stats,
        "search_samples": search_results,
    }
    (reports_dir / "pilot_1000_report.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )
    return summary


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="STEP2 pilot 1,000 expansion pipeline")
    parser.add_argument("--targets", type=str, default="data/pilot/pilot_1000_targets.json")
    parser.add_argument("--pilot-raw", type=str, default="data/raw/pilot/pilot_1000.jsonl")
    parser.add_argument("--collection-manifest", type=str, default="data/pilot/pilot_1000_collected.json")
    parser.add_argument("--normalized-dir", type=str, default="data/normalized/pilot_1000")
    parser.add_argument("--reports-dir", type=str, default="reports")
    parser.add_argument("--skip-curate", action="store_true")
    parser.add_argument("--backfill", action="store_true", help="기존 수집분에 quota 미달 카테고리만 추가")
    parser.add_argument("--max-scan-rows", type=int, default=None)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_arg_parser().parse_args(argv)
    run_pipeline(
        Path(args.targets),
        Path(args.pilot_raw),
        Path(args.collection_manifest),
        Path(args.normalized_dir),
        Path(args.reports_dir),
        skip_curate=args.skip_curate,
        backfill=args.backfill,
        max_scan_rows=args.max_scan_rows,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
