"""
STEP 2 — 200건 파일럿 end-to-end 파이프라인.

1. curate (HF stream) — optional if pilot jsonl already exists
2. normalize (STEP1 V2 rules)
3. parse chunks
4. sample search queries
5. pilot report
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from collections import Counter
from pathlib import Path

from .audit_datasets import iter_records
from .curate_pilot_200 import curate_pilot
from .document_validation import validate_all
from .normalize_documents import normalize_vbpl_row
from .parse_legal_structure import parse_document_structure
from .search_engine import LegalSearchIndex, load_from_pipeline_jsonl

logger = logging.getLogger("legal_rag.pilot_pipeline")
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
    (report_dir / "pilot_200_search_samples.json").write_text(
        json.dumps(results_log, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return results_log


def _render_pilot_report(
    collection_manifest: dict,
    norm_stats: dict,
    passed_docs: list[dict],
    search_results: list[dict],
) -> str:
    status_by_number: dict[str, str] = {}
    for doc in passed_docs:
        nums = doc.get("documentNumber") or []
        for num in nums:
            status_by_number[num] = doc.get("status") or "unknown"

    lines = ["# STEP 2 Pilot 200 — Collection & Normalization Report", ""]
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
    lines.append("## 2. Collected documents (full list)")
    for item in sorted(
        collection_manifest.get("documents", []),
        key=lambda x: (x.get("category") or "", x.get("title") or ""),
    ):
        nums = item.get("document_number") or []
        num_str = ", ".join(nums)
        status = "unknown"
        for num in nums:
            if num in status_by_number:
                status = status_by_number[num]
                break
        lines.append(
            f"- [{item.get('category')}] `{num_str}` — {item.get('title', '')} "
            f"(status: `{status}`, {item.get('match_kind')}, {item.get('doc_type')})"
        )
    lines.append("")
    lines.append("## 3. Validation")
    lines.append(f"- Input: {norm_stats.get('input')}, Passed: {norm_stats.get('passed')}, Hard-fail: {norm_stats.get('hard_fail')}")
    if norm_stats.get("hard_fail_details"):
        for item in norm_stats["hard_fail_details"]:
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
        lines.append("- (none — pilot corpus has no relatedDocuments edges in this run)")
    lines.append("")
    lines.append("## 5. Sample search queries")
    for item in search_results:
        lines.append(f"- **{item['query']}** → {item['hit_count']}건")
        for hit in item.get("top_hits", [])[:2]:
            lines.append(f"  - {hit.get('document_number')} | {hit.get('title', '')[:60]}")
    lines.append("")
    return "\n".join(lines)


def run_pipeline(
    targets_path: Path,
    pilot_raw_path: Path,
    collection_manifest_path: Path,
    normalized_dir: Path,
    reports_dir: Path,
    skip_curate: bool = False,
    max_scan_rows: int | None = None,
) -> dict:
    if not skip_curate or not pilot_raw_path.exists():
        collection_manifest = curate_pilot(
            targets_path, pilot_raw_path, collection_manifest_path, max_scan_rows=max_scan_rows
        )
    else:
        collection_manifest = json.loads(collection_manifest_path.read_text(encoding="utf-8"))

    passed_docs, norm_stats = _normalize_pilot(pilot_raw_path, normalized_dir)
    search_results = _run_search_samples(
        normalized_dir / "documents.jsonl",
        normalized_dir / "chunks.jsonl",
        reports_dir,
    )

    report_md = _render_pilot_report(collection_manifest, norm_stats, passed_docs, search_results)
    reports_dir.mkdir(parents=True, exist_ok=True)
    (reports_dir / "pilot_200_report.md").write_text(report_md, encoding="utf-8")
    summary = {
        "collection": collection_manifest,
        "normalization": norm_stats,
        "search_samples": search_results,
    }
    (reports_dir / "pilot_200_report.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2, default=str),
        encoding="utf-8",
    )
    return summary


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="STEP2 pilot 200 pipeline")
    parser.add_argument("--targets", type=str, default="data/pilot/pilot_200_targets.json")
    parser.add_argument("--pilot-raw", type=str, default="data/raw/pilot/pilot_200.jsonl")
    parser.add_argument("--collection-manifest", type=str, default="data/pilot/pilot_200_collected.json")
    parser.add_argument("--normalized-dir", type=str, default="data/normalized/pilot_200")
    parser.add_argument("--reports-dir", type=str, default="reports")
    parser.add_argument("--skip-curate", action="store_true")
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
        max_scan_rows=args.max_scan_rows,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
