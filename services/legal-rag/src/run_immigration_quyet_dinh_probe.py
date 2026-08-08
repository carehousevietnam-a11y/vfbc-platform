"""
Immigration-only probe: add quyet_dinh doc_type and rescan for STEP 2 final check.

Other categories keep the base 4 doc types. Reports potential Immigration gains,
sample titles, and authorityWeight=60 distribution for new quyet_dinh matches.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from collections import Counter
from pathlib import Path

from datasets import load_dataset

from .authority_weight import compute_authority_weight
from .curate_pilot_200 import CollectionState, _legal_area_backfill_map, _pick_keyword_match
from .pilot_target_lookup import (
    build_priority_number_index,
    build_title_priority_rules,
    doc_numbers_from_row,
    match_row_to_target,
    norm_text,
)

logger = logging.getLogger("legal_rag.immigration_quyet_dinh")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

IMMIGRATION = "Immigration"
EXTRA_DOC_TYPE = "quyet_dinh"


def _immigration_match(row: dict, targets: dict) -> tuple[str, str] | None:
    """Return (match_kind, matched_by) if row is on-topic Immigration."""
    imm_index = build_priority_number_index(targets, {IMMIGRATION})
    title_rules = {IMMIGRATION: build_title_priority_rules(targets).get(IMMIGRATION, [])}
    keyword_index = {
        IMMIGRATION: [
            norm_text(k) for k in targets["categories"][IMMIGRATION].get("title_keywords", [])
        ]
    }

    hit = match_row_to_target(row, imm_index, title_rules)
    if hit:
        category, kind, matched = hit
        if category == IMMIGRATION:
            return kind, matched

    numbers = doc_numbers_from_row(row)
    for num in numbers:
        key = norm_text(num)
        if key in imm_index:
            category, _, kind = imm_index[key]
            if category == IMMIGRATION:
                return kind, f"doc_number:{num}"

    kw_hit = _pick_keyword_match(
        row.get("title") or "",
        keyword_index,
        lambda cat, kind: cat == IMMIGRATION,
    )
    if kw_hit:
        return "title_keyword", f"title_keyword:{kw_hit[1]}"

    la = (row.get("legal_area") or "").lower()
    ti = (row.get("title") or "").lower()
    for hint in _legal_area_backfill_map().get(IMMIGRATION, ()):
        if hint in la or hint in ti:
            return "legal_area", f"legal_area:{row.get('legal_area')}"

    return None


def probe_immigration_quyet_dinh(
    targets_path: Path,
    collected_manifest_path: Path,
    max_scan_rows: int | None = None,
) -> dict:
    targets = json.loads(targets_path.read_text(encoding="utf-8"))
    manifest = json.loads(collected_manifest_path.read_text(encoding="utf-8"))
    existing_ids = {d.get("doc_name") for d in manifest.get("documents") or []}
    immigration_now = manifest.get("actual_counts", {}).get(IMMIGRATION, 0)
    quota = targets["quotas"][IMMIGRATION]
    remaining = max(0, quota - immigration_now)

    allowed_scope = set(targets["allowed_scope"])
    base_types = set(targets["allowed_doc_types"])

    candidates: list[dict] = []
    scanned = 0
    quyet_dinh_total = 0
    quyet_dinh_immigration_topic = 0

    ds = load_dataset("tmquan/vbpl-vn", "documents", split="train", streaming=True)
    for row in ds:
        scanned += 1
        if max_scan_rows and scanned > max_scan_rows:
            break
        if row.get("scope") not in allowed_scope:
            continue
        if row.get("doc_type") != EXTRA_DOC_TYPE:
            continue
        quyet_dinh_total += 1
        if str(row.get("doc_name")) in existing_ids:
            continue

        match = _immigration_match(row, targets)
        if not match:
            continue
        quyet_dinh_immigration_topic += 1
        kind, matched_by = match
        candidates.append(
            {
                "doc_name": row.get("doc_name"),
                "document_number": doc_numbers_from_row(row),
                "title": row.get("title"),
                "doc_type": row.get("doc_type"),
                "legal_area": row.get("legal_area"),
                "match_kind": kind,
                "matched_by": matched_by,
                "authorityWeight": compute_authority_weight(str(row.get("doc_type") or "")),
            }
        )
        if len(candidates) >= remaining:
            break

    addable = min(len(candidates), remaining)
    projected = immigration_now + addable

    sample_new = candidates[:25]
    sample_random_mid = candidates[len(candidates) // 2 : len(candidates) // 2 + 10] if candidates else []

    return {
        "immigration_before": immigration_now,
        "immigration_quota": quota,
        "remaining_quota": remaining,
        "scanned_rows": scanned,
        "quyet_dinh_trung_uong_seen": quyet_dinh_total,
        "quyet_dinh_immigration_on_topic_not_collected": len(candidates),
        "addable_up_to_quota": addable,
        "immigration_projected_total": projected,
        "projected_fill_pct": round(100 * projected / quota, 1),
        "new_match_kind_distribution": dict(Counter(c["match_kind"] for c in candidates)),
        "sample_new_titles": sample_new,
        "sample_mid_titles": sample_random_mid,
    }


def apply_immigration_quyet_dinh_backfill(
    targets_path: Path,
    pilot_raw_path: Path,
    collection_manifest_path: Path,
    max_scan_rows: int | None = None,
) -> dict:
    """Append Immigration quyet_dinh matches to existing pilot (Immigration quota only)."""
    targets = json.loads(targets_path.read_text(encoding="utf-8"))
    manifest = json.loads(collection_manifest_path.read_text(encoding="utf-8"))
    immigration_now = manifest.get("actual_counts", {}).get(IMMIGRATION, 0)
    remaining = max(0, targets["quotas"][IMMIGRATION] - immigration_now)
    if remaining <= 0:
        logger.info("Immigration quota already filled")
        return manifest

    # Custom scan: only quyet_dinh rows, Immigration match, append to jsonl/manifest
    from .curate_pilot_200 import CollectionState

    allowed_scope = set(targets["allowed_scope"])
    repealed_cap = int(targets.get("repealed_examples_per_category", 2))
    existing_records: list[dict] = []
    if pilot_raw_path.exists():
        existing_records = [
            json.loads(line)
            for line in pilot_raw_path.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]

    state = CollectionState(quotas={IMMIGRATION: remaining}, repealed_cap=repealed_cap)
    state.records = list(existing_records)
    state.collected_ids = {str(r.get("doc_name")) for r in existing_records}
    state.counts = Counter({IMMIGRATION: 0})
    state.repealed_counts = Counter({IMMIGRATION: 0})
    if manifest.get("documents"):
        state.match_log = list(manifest["documents"])

    scanned = 0
    ds = load_dataset("tmquan/vbpl-vn", "documents", split="train", streaming=True)
    for row in ds:
        scanned += 1
        if max_scan_rows and scanned > max_scan_rows:
            break
        if state.remaining(IMMIGRATION) <= 0:
            break
        if row.get("scope") not in allowed_scope or row.get("doc_type") != EXTRA_DOC_TYPE:
            continue
        doc_name = str(row.get("doc_name"))
        if doc_name in state.collected_ids:
            continue
        match = _immigration_match(row, targets)
        if not match:
            continue
        kind, matched_by = match
        if state.can_add(IMMIGRATION, kind):
            state.add(row, IMMIGRATION, kind, matched_by)

    pilot_raw_path.parent.mkdir(parents=True, exist_ok=True)
    with pilot_raw_path.open("w", encoding="utf-8") as f:
        for record in state.records:
            f.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")

    actual = Counter(manifest.get("actual_counts") or {})
    repealed = Counter(manifest.get("repealed_counts") or {})
    for c in targets["quotas"]:
        actual[c] = sum(1 for e in state.match_log if e.get("category") == c)
        repealed[c] = sum(
            1
            for e in state.match_log
            if e.get("category") == c and e.get("match_kind") == "repealed_example"
        )

    shortfalls = {
        cat: max(0, targets["quotas"][cat] - actual.get(cat, 0))
        for cat in targets["quotas"]
        if actual.get(cat, 0) < targets["quotas"][cat]
    }
    updated = {
        **manifest,
        "scanned_rows": (manifest.get("scanned_rows") or 0) + scanned,
        "collected_total": len(state.records),
        "quotas": targets["quotas"],
        "actual_counts": dict(actual),
        "repealed_counts": dict(repealed),
        "shortfalls": shortfalls,
        "documents": state.match_log,
        "immigration_quyet_dinh_added": state.counts[IMMIGRATION],
    }
    collection_manifest_path.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
    logger.info(
        "Immigration quyet_dinh backfill: +%d → Immigration %d/%d",
        state.counts[IMMIGRATION],
        actual[IMMIGRATION],
        targets["quotas"][IMMIGRATION],
    )
    return updated


def build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Immigration quyet_dinh probe (STEP2 final check)")
    p.add_argument("--targets", default="data/pilot/pilot_10000_targets.json")
    p.add_argument("--collection-manifest", default="data/pilot/pilot_10000_collected.json")
    p.add_argument("--pilot-raw", default="data/raw/pilot/pilot_10000.jsonl")
    p.add_argument("--apply", action="store_true", help="Append matched quyet_dinh rows to pilot corpus")
    p.add_argument("--max-scan-rows", type=int, default=None)
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_arg_parser().parse_args(argv)
    targets_path = Path(args.targets)
    manifest_path = Path(args.collection_manifest)

    result = probe_immigration_quyet_dinh(targets_path, manifest_path, max_scan_rows=args.max_scan_rows)
    out_path = Path("reports/pilot_10000_immigration_quyet_dinh_probe.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    if args.apply and result["addable_up_to_quota"] > 0:
        apply_immigration_quyet_dinh_backfill(
            targets_path,
            Path(args.pilot_raw),
            manifest_path,
            max_scan_rows=args.max_scan_rows,
        )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
