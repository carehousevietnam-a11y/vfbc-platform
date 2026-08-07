"""
Pilot curation — priority target lookup helpers.

HF tmquan/vbpl-vn 스트리밍에서 문서번호·제목 우선 검색을 수행한다.
"""

from __future__ import annotations

import json
import logging
import re
import unicodedata
from pathlib import Path
from typing import Any

from datasets import load_dataset

from .utils import normalize_document_number

logger = logging.getLogger("legal_rag.pilot_target_lookup")


def norm_text(value: str | None) -> str:
    if not value:
        return ""
    text = unicodedata.normalize("NFC", value).lower()
    return re.sub(r"\s+", " ", text).strip()


def doc_numbers_from_row(row: dict[str, Any]) -> list[str]:
    raw = row.get("doc_number")
    if raw is None:
        return []
    items = raw if isinstance(raw, list) else [raw]
    result: list[str] = []
    for item in items:
        result.extend(normalize_document_number(str(item)))
    return result


def build_priority_number_index(targets: dict, categories: set[str] | None = None) -> dict[str, tuple[str, str, str]]:
    """normalized number -> (category, original number, match_kind)"""
    index: dict[str, tuple[str, str, str]] = {}
    for category, spec in targets["categories"].items():
        if categories and category not in categories:
            continue
        for num in spec.get("doc_numbers", []):
            for n in normalize_document_number(num):
                index[norm_text(n)] = (category, num, "doc_number")
        for num in spec.get("repealed_doc_numbers", []):
            for n in normalize_document_number(num):
                index[norm_text(n)] = (category, num, "repealed_example")
    return index


def build_title_priority_rules(targets: dict) -> dict[str, list[tuple[str, str]]]:
    """category -> [(pattern, match_kind)]"""
    rules: dict[str, list[tuple[str, str]]] = {}
    for category, spec in targets["categories"].items():
        items: list[tuple[str, str]] = []
        for pattern in spec.get("title_priority", []):
            items.append((norm_text(pattern), "title_priority"))
        if category == "Criminal":
            items.extend(
                [
                    (norm_text("bộ luật hình sự"), "criminal_code"),
                    (norm_text("bo luat hinh su"), "criminal_code"),
                ]
            )
        if category == "RealEstate":
            items.extend(
                [
                    (norm_text("người nước ngoài"), "foreign_realestate"),
                ]
            )
        if items:
            rules[category] = items
    return rules


def passes_filters(row: dict, allowed_scope: set[str], allowed_types: set[str]) -> bool:
    if row.get("scope") not in allowed_scope:
        return False
    if row.get("doc_type") not in allowed_types:
        return False
    if not row.get("markdown") and not row.get("title"):
        return False
    return True


def match_row_to_target(
    row: dict[str, Any],
    number_index: dict[str, tuple[str, str, str]],
    title_rules: dict[str, list[tuple[str, str]]],
) -> tuple[str, str, str] | None:
    numbers = doc_numbers_from_row(row)
    for num in numbers:
        key = norm_text(num)
        if key in number_index:
            category, orig, kind = number_index[key]
            return category, kind, f"doc_number:{orig}"

    title = norm_text(row.get("title"))
    if not title:
        return None

    for category, patterns in title_rules.items():
        for pattern, kind in patterns:
            if pattern and pattern in title:
                if kind == "foreign_realestate":
                    if not any(k in title for k in ("đất", "nhà ở", "bất động sản", "quyền sử dụng")):
                        continue
                if kind == "criminal_code":
                    if row.get("doc_type") not in {"luat", "bo_luat"}:
                        continue
                return category, kind, f"title:{pattern}"
    return None


def scan_priority_targets(
    targets_path: Path,
    categories: set[str] | None = None,
    max_scan_rows: int | None = None,
) -> tuple[dict[str, dict], dict[str, Any]]:
    """
    Stream HF dataset and collect rows matching priority doc_numbers / title rules.
    Returns (found_by_match_key, scan_stats).
    """
    targets = json.loads(targets_path.read_text(encoding="utf-8"))
    allowed_scope = set(targets["allowed_scope"])
    allowed_types = set(targets["allowed_doc_types"])
    number_index = build_priority_number_index(targets, categories)
    title_rules = build_title_priority_rules(targets)
    if categories:
        title_rules = {k: v for k, v in title_rules.items() if k in categories}

    found: dict[str, dict] = {}
    scanned = 0
    ds = load_dataset("tmquan/vbpl-vn", "documents", split="train", streaming=True)

    for row in ds:
        scanned += 1
        if max_scan_rows and scanned > max_scan_rows:
            break
        if not passes_filters(row, allowed_scope, allowed_types):
            continue

        hit = match_row_to_target(row, number_index, title_rules)
        if not hit:
            continue
        category, kind, matched_by = hit
        if categories and category not in categories:
            continue

        doc_name = str(row.get("doc_name"))
        match_key = f"{category}:{kind}:{doc_name}"
        if match_key in found:
            continue
        enriched = dict(row)
        enriched["pilotCategory"] = [category]
        if kind == "repealed_example":
            enriched["pilotStatusHint"] = "repealed"
        found[match_key] = {
            "row": enriched,
            "category": category,
            "match_kind": kind,
            "matched_by": matched_by,
            "document_number": doc_numbers_from_row(row),
            "title": row.get("title"),
            "doc_name": doc_name,
        }

        if len(number_index) > 0:
            nums = {norm_text(n) for n in doc_numbers_from_row(row)}
            for n in list(number_index.keys()):
                if n in nums and n in {norm_text(x) for x in found.get(f"{number_index[n][0]}:doc_number:{doc_name}", {}).get("document_number", [])}:
                    pass  # defer missing calc to end

        if scanned % 25000 == 0:
            logger.info("priority scan %d rows — found %d targets", scanned, len(found))

    found_numbers = set()
    for item in found.values():
        for n in item.get("document_number") or []:
            found_numbers.add(norm_text(n))
    missing_numbers = [
        {"category": number_index[k][0], "doc_number": number_index[k][1], "kind": number_index[k][2]}
        for k in number_index
        if k not in found_numbers
    ]

    stats = {
        "scanned_rows": scanned,
        "found_count": len(found),
        "priority_numbers_requested": len(number_index),
        "priority_numbers_found": len(number_index) - len(missing_numbers),
        "missing_priority_numbers": missing_numbers,
    }
    return found, stats


def build_th1nhng0_status_lookup(doc_numbers: set[str], max_rows: int = 500_000) -> dict[str, str]:
    """doc_number (normalized lower) -> tinh_trang_hieu_luc from th1nhng0 metadata stream."""
    if not doc_numbers:
        return {}
    wanted = {norm_text(n) for nums in doc_numbers for n in normalize_document_number(nums)}
    lookup: dict[str, str] = {}
    try:
        ds = load_dataset(
            "th1nhng0/vietnamese-legal-documents",
            "metadata",
            split="data",
            streaming=True,
            revision="0a39ad7eae8e6c188cb225c4b1443c3b346461d8",
        )
    except Exception:
        logger.warning("th1nhng0 metadata 스트리밍 로드 실패 — status enrichment 건너뜀", exc_info=True)
        return {}
    scanned = 0
    for row in ds:
        scanned += 1
        if max_rows and scanned > max_rows:
            break
        if len(lookup) >= len(wanted):
            break
        so = row.get("so_ky_hieu")
        if not so:
            continue
        for n in normalize_document_number(str(so)):
            key = norm_text(n)
            if key in wanted and key not in lookup:
                status = row.get("tinh_trang_hieu_luc")
                if status:
                    lookup[key] = str(status)
    return lookup
