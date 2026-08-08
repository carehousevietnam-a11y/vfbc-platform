"""
STEP 2 rework — 타겟 우선 보강 (200건 전체 재수집 없이 교체).

Immigration/Labor/Criminal/RealEstate 카테고리에서 저품질 keyword 매칭 문서를
핵심 법전(doc_number / title_priority) 후보로 교체한다.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from .audit_datasets import iter_records
from .pilot_target_lookup import (
    build_th1nhng0_status_lookup,
    doc_numbers_from_row,
    norm_text,
    scan_priority_targets,
)

logger = logging.getLogger("legal_rag.rework_pilot")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

REWORK_CATEGORIES = {"Labor", "Immigration", "Criminal", "RealEstate"}


def _load_records(path: Path) -> dict[str, dict]:
    return {str(r["doc_name"]): r for r in iter_records(path)}


def _is_removable(entry: dict, category: str) -> bool:
    nums = entry.get("document_number") or []
    if not nums:
        return True
    if entry.get("match_kind") == "doc_number":
        return False
    if entry.get("match_kind") == "repealed_example":
        return False
    if entry.get("match_kind") in {"title_priority", "criminal_code", "foreign_realestate"}:
        return False

    title = norm_text(entry.get("title"))
    matched_by = entry.get("matched_by") or ""

    if category == "Criminal":
        if "tài sản" in matched_by or "tai san" in matched_by:
            return True
        if "hình sự" not in title and entry.get("doc_type") not in {"luat", "bo_luat"}:
            return True
    if category == "RealEstate":
        if "người nước ngoài" not in title and "nuoc ngoai" not in title:
            if entry.get("match_kind") == "title_keyword":
                return True
    if category in {"Labor", "Immigration"}:
        if entry.get("match_kind") == "title_keyword":
            return True
    return False


def _manifest_entry_from_row(item: dict) -> dict:
    row = item["row"]
    return {
        "doc_name": item["doc_name"],
        "document_number": item.get("document_number") or doc_numbers_from_row(row),
        "title": item.get("title") or row.get("title"),
        "category": item["category"],
        "match_kind": item["match_kind"],
        "matched_by": item["matched_by"],
        "scope": row.get("scope"),
        "doc_type": row.get("doc_type"),
    }


def rework_pilot(
    targets_path: Path,
    pilot_jsonl: Path,
    collection_manifest_path: Path,
    swap_log_path: Path,
    max_scan_rows: int | None = None,
) -> dict:
    manifest = json.loads(collection_manifest_path.read_text(encoding="utf-8"))
    existing_records = _load_records(pilot_jsonl)
    existing_log = manifest.get("documents", [])

    by_cat: dict[str, list[dict]] = defaultdict(list)
    for entry in existing_log:
        by_cat[entry["category"]].append(entry)

    found, scan_stats = scan_priority_targets(
        targets_path, categories=REWORK_CATEGORIES, max_scan_rows=max_scan_rows
    )
    found_by_cat: dict[str, list[dict]] = defaultdict(list)
    for item in found.values():
        found_by_cat[item["category"]].append(item)

    # Prefer doc_number > title_priority > criminal_code > foreign_realestate
    kind_rank = {
        "doc_number": 0,
        "repealed_example": 1,
        "title_priority": 2,
        "criminal_code": 3,
        "foreign_realestate": 4,
    }
    for cat in found_by_cat:
        found_by_cat[cat].sort(key=lambda x: kind_rank.get(x["match_kind"], 99))

    swaps: list[dict] = []
    kept_ids = {e["doc_name"] for e in existing_log if e["category"] not in REWORK_CATEGORIES}
    new_log: list[dict] = [e for e in existing_log if e["category"] not in REWORK_CATEGORIES]
    new_records: dict[str, dict] = {
        k: v for k, v in existing_records.items() if v.get("pilotCategory", [None])[0] not in REWORK_CATEGORIES
    }

    for category in sorted(REWORK_CATEGORIES):
        quota = manifest["quotas"][category]
        current = by_cat[category]
        incoming = found_by_cat.get(category, [])
        incoming.sort(key=lambda x: kind_rank.get(x["match_kind"], 99))

        selected: list[dict] = []
        selected_ids: set[str] = set()

        for item in incoming:
            if len(selected) >= quota:
                break
            doc_name = item["doc_name"]
            if doc_name in selected_ids:
                continue
            selected.append(_manifest_entry_from_row(item))
            new_records[doc_name] = item["row"]
            selected_ids.add(doc_name)

        for entry in current:
            if len(selected) >= quota:
                break
            if entry["doc_name"] in selected_ids:
                continue
            if _is_removable(entry, category):
                continue
            selected.append(entry)
            selected_ids.add(entry["doc_name"])

        for entry in current:
            if len(selected) >= quota:
                break
            if entry["doc_name"] in selected_ids:
                continue
            selected.append(entry)
            selected_ids.add(entry["doc_name"])

        old_ids = {e["doc_name"] for e in current}
        new_ids = {s["doc_name"] for s in selected}
        for entry in current:
            if entry["doc_name"] not in new_ids:
                swaps.append({"action": "removed", "category": category, **entry})
        for entry in selected:
            if entry["doc_name"] not in old_ids:
                swaps.append({"action": "added", "category": category, **entry})

        new_log.extend(selected[:quota])

    # Status enrichment via th1nhng0 metadata (doc_number join)
    all_numbers: set[str] = set()
    for entry in new_log:
        for n in entry.get("document_number") or []:
            all_numbers.add(n)
    status_lookup = build_th1nhng0_status_lookup(all_numbers)
    enriched_count = 0
    for doc_name, row in new_records.items():
        nums = doc_numbers_from_row(row)
        for n in nums:
            key = norm_text(n)
            if key in status_lookup:
                row["tinh_trang_hieu_luc"] = status_lookup[key]
                enriched_count += 1
                break

    with pilot_jsonl.open("w", encoding="utf-8") as f:
        for entry in new_log:
            doc_name = entry["doc_name"]
            row = new_records.get(doc_name) or existing_records.get(doc_name)
            if row:
                f.write(json.dumps(row, ensure_ascii=False, default=str) + "\n")

    actual_counts = Counter(e["category"] for e in new_log)
    repealed_counts = Counter(
        e["category"] for e in new_log if e.get("match_kind") == "repealed_example"
    )
    updated_manifest = {
        **manifest,
        "rework": True,
        "priority_scan": scan_stats,
        "status_enriched_from_th1nhng0": enriched_count,
        "collected_total": len(new_log),
        "actual_counts": dict(actual_counts),
        "repealed_counts": dict(repealed_counts),
        "shortfalls": {cat: max(0, manifest["quotas"][cat] - actual_counts.get(cat, 0)) for cat in manifest["quotas"]},
        "documents": new_log,
    }
    collection_manifest_path.write_text(json.dumps(updated_manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    swap_report = {
        "swaps": swaps,
        "removed_count": sum(1 for s in swaps if s["action"] == "removed"),
        "added_count": sum(1 for s in swaps if s["action"] == "added"),
        "priority_scan": scan_stats,
        "status_enriched_from_th1nhng0": enriched_count,
    }
    swap_log_path.parent.mkdir(parents=True, exist_ok=True)
    swap_log_path.write_text(json.dumps(swap_report, ensure_ascii=False, indent=2), encoding="utf-8")

    logger.info(
        "Rework complete: removed=%d added=%d priority_found=%d/%d",
        swap_report["removed_count"],
        swap_report["added_count"],
        scan_stats["priority_numbers_found"],
        scan_stats["priority_numbers_requested"],
    )
    return swap_report


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="STEP2 pilot targeted rework")
    parser.add_argument("--targets", type=str, default="data/pilot/pilot_200_targets.json")
    parser.add_argument("--pilot-raw", type=str, default="data/raw/pilot/pilot_200.jsonl")
    parser.add_argument("--collection-manifest", type=str, default="data/pilot/pilot_200_collected.json")
    parser.add_argument("--swap-log", type=str, default="reports/pilot_200_rework_swaps.json")
    parser.add_argument("--max-scan-rows", type=int, default=None)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_arg_parser().parse_args(argv)
    rework_pilot(
        Path(args.targets),
        Path(args.pilot_raw),
        Path(args.collection_manifest),
        Path(args.swap_log),
        max_scan_rows=args.max_scan_rows,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
