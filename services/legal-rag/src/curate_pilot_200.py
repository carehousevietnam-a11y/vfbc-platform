"""
STEP 2 — 200건 파일럿 큐레이션 수집.

Hugging Face tmquan/vbpl-vn 스트리밍으로 중앙(trung_uong) 법령을 수집하고,
data/pilot/pilot_200_targets.json의 카테고리별 quota·후보 doc_number·키워드에
맞춰 data/raw/pilot/pilot_200.jsonl을 생성한다.

실행:
    python -m src.curate_pilot_200 \\
        --targets data/pilot/pilot_200_targets.json \\
        --output data/raw/pilot/pilot_200.jsonl \\
        --manifest data/pilot/pilot_200_collected.json
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from datasets import load_dataset

from .pilot_target_lookup import (
    build_priority_number_index,
    build_title_priority_rules,
    doc_numbers_from_row,
    match_row_to_target,
    norm_text,
    passes_filters,
)

logger = logging.getLogger("legal_rag.curate_pilot")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


def _norm_text(value: str | None) -> str:
    if not value:
        return ""
    text = unicodedata.normalize("NFC", value).lower()
    return re.sub(r"\s+", " ", text).strip()


def _doc_numbers_from_row(row: dict[str, Any]) -> list[str]:
    return doc_numbers_from_row(row)


def _norm_text(value: str | None) -> str:
    return norm_text(value)


def _build_number_index(targets: dict) -> dict[str, tuple[str, str]]:
    index = build_priority_number_index(targets)
    return {k: (v[0], v[2]) for k, v in index.items()}


def _build_keyword_index(targets: dict) -> dict[str, list[str]]:
    return {
        category: [_norm_text(k) for k in spec.get("title_keywords", [])]
        for category, spec in targets["categories"].items()
    }


@dataclass
class CollectionState:
    quotas: dict[str, int]
    counts: Counter = field(default_factory=Counter)
    repealed_counts: Counter = field(default_factory=Counter)
    repealed_cap: int = 2
    collected_ids: set[str] = field(default_factory=set)
    records: list[dict] = field(default_factory=list)
    match_log: list[dict] = field(default_factory=list)

    def remaining(self, category: str) -> int:
        return max(0, self.quotas[category] - self.counts[category])

    def total_remaining(self) -> int:
        return sum(self.remaining(c) for c in self.quotas)

    def can_add(self, category: str, match_kind: str) -> bool:
        if self.remaining(category) <= 0:
            return False
        if match_kind == "repealed_example" and self.repealed_counts[category] >= self.repealed_cap:
            return False
        return True

    def add(self, row: dict, category: str, match_kind: str, matched_by: str) -> None:
        doc_name = str(row.get("doc_name"))
        if doc_name in self.collected_ids:
            return
        enriched = dict(row)
        enriched["pilotCategory"] = [category]
        if match_kind == "repealed_example":
            enriched["pilotStatusHint"] = "repealed"
        self.records.append(enriched)
        self.collected_ids.add(doc_name)
        self.counts[category] += 1
        if match_kind == "repealed_example":
            self.repealed_counts[category] += 1
        self.match_log.append(
            {
                "doc_name": doc_name,
                "document_number": _doc_numbers_from_row(row),
                "title": row.get("title"),
                "category": category,
                "match_kind": match_kind,
                "matched_by": matched_by,
                "scope": row.get("scope"),
                "doc_type": row.get("doc_type"),
            }
        )


def _passes_filters(row: dict, allowed_scope: set[str], allowed_types: set[str]) -> bool:
    return passes_filters(row, allowed_scope, allowed_types)


def _match_category_by_number(
    numbers: list[str], number_index: dict[str, tuple[str, str]]
) -> tuple[str, str, str] | None:
    for num in numbers:
        key = _norm_text(num)
        if key in number_index:
            category, kind = number_index[key]
            return category, kind, num
    return None


def _match_category_by_keywords(title: str, keyword_index: dict[str, list[str]]) -> tuple[str, str] | None:
    norm_title = _norm_text(title)
    if not norm_title:
        return None
    for category, keywords in keyword_index.items():
        for kw in keywords:
            if kw and kw in norm_title:
                return category, kw
    return None


def curate_pilot(
    targets_path: Path,
    output_path: Path,
    manifest_path: Path,
    max_scan_rows: int | None = None,
) -> dict:
    targets = json.loads(targets_path.read_text(encoding="utf-8"))
    quotas = targets["quotas"]
    allowed_scope = set(targets["allowed_scope"])
    allowed_types = set(targets["allowed_doc_types"])
    repealed_cap = int(targets.get("repealed_examples_per_category", 2))

    state = CollectionState(quotas=quotas, repealed_cap=repealed_cap)
    number_index = _build_number_index(targets)
    keyword_index = _build_keyword_index(targets)
    title_rules = build_title_priority_rules(targets)

    logger.info("Phase 1: priority doc_number/title scan (quota=%s)", quotas)
    ds = load_dataset("tmquan/vbpl-vn", "documents", split="train", streaming=True)

    scanned = 0
    for row in ds:
        scanned += 1
        if max_scan_rows and scanned > max_scan_rows:
            break
        if state.total_remaining() <= 0:
            break
        if not _passes_filters(row, allowed_scope, allowed_types):
            continue

        hit = match_row_to_target(row, build_priority_number_index(targets), title_rules)
        if not hit:
            continue
        category, kind, matched = hit
        if kind == "title_keyword":
            continue
        if state.can_add(category, kind):
            state.add(row, category, kind, matched)

        if scanned % 10000 == 0:
            logger.info("Phase1 스캔 %d행 — 수집 %d건 — %s", scanned, len(state.records), dict(state.counts))

    logger.info("Phase 2: keyword backfill (remaining=%s)", {c: state.remaining(c) for c in quotas if state.remaining(c)})
    ds2 = load_dataset("tmquan/vbpl-vn", "documents", split="train", streaming=True)
    scanned2 = 0
    for row in ds2:
        scanned2 += 1
        if max_scan_rows and (scanned + scanned2) > max_scan_rows:
            break
        if state.total_remaining() <= 0:
            break
        if not _passes_filters(row, allowed_scope, allowed_types):
            continue

        numbers = _doc_numbers_from_row(row)
        hit = _match_category_by_number(numbers, number_index)
        if hit:
            category, kind, matched = hit
            if state.can_add(category, kind):
                state.add(row, category, kind, f"doc_number:{matched}")
            continue

        title = row.get("title") or ""
        kw_hit = _match_category_by_keywords(title, keyword_index)
        if kw_hit:
            category, kw = kw_hit
            if category == "Criminal" and "tài sản" in kw:
                continue
            if state.can_add(category, "title_keyword"):
                state.add(row, category, "title_keyword", f"title_keyword:{kw}")

        if scanned2 % 10000 == 0:
            logger.info("Phase2 스캔 %d행 — 수집 %d건", scanned2, len(state.records))

    scanned += scanned2

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        for record in state.records:
            f.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")

    shortfalls = {cat: state.remaining(cat) for cat in quotas if state.remaining(cat) > 0}
    manifest = {
        "scanned_rows": scanned,
        "collected_total": len(state.records),
        "quotas": quotas,
        "actual_counts": dict(state.counts),
        "repealed_counts": dict(state.repealed_counts),
        "shortfalls": shortfalls,
        "documents": state.match_log,
    }
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    logger.info(
        "수집 완료: %d/%d (스캔 %d행). 부족: %s",
        len(state.records),
        sum(quotas.values()),
        scanned,
        shortfalls or "없음",
    )
    return manifest


def backfill_pilot(
    targets_path: Path,
    output_path: Path,
    manifest_path: Path,
    categories: list[str] | None = None,
    max_scan_rows: int | None = None,
) -> dict:
    """기존 pilot jsonl/manifest에 이어 특정 카테고리 quota 미달분만 추가 수집."""
    targets = json.loads(targets_path.read_text(encoding="utf-8"))
    quotas = targets["quotas"]
    allowed_scope = set(targets["allowed_scope"])
    allowed_types = set(targets["allowed_doc_types"])
    repealed_cap = int(targets.get("repealed_examples_per_category", 2))

    existing_records: list[dict] = []
    if output_path.exists():
        existing_records = [json.loads(line) for line in output_path.read_text(encoding="utf-8").splitlines() if line.strip()]

    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    actual = Counter(manifest.get("actual_counts") or {})
    repealed = Counter(manifest.get("repealed_counts") or {})

    fill_categories = categories or [c for c in quotas if actual.get(c, 0) < quotas[c]]
    if not fill_categories:
        logger.info("Backfill 불필요 — 모든 quota 충족")
        return manifest

    backfill_quotas = {c: quotas[c] - actual.get(c, 0) for c in fill_categories}
    logger.info("Backfill 시작 — categories=%s quotas=%s", fill_categories, backfill_quotas)

    state = CollectionState(quotas=backfill_quotas, repealed_cap=repealed_cap)
    state.records = list(existing_records)
    state.collected_ids = {str(r.get("doc_name")) for r in existing_records}
    state.counts = Counter({c: 0 for c in backfill_quotas})
    state.repealed_counts = Counter({c: 0 for c in backfill_quotas})
    if manifest.get("documents"):
        state.match_log = list(manifest["documents"])

    number_index = _build_number_index(targets)
    keyword_index = _build_keyword_index(targets)
    title_rules = build_title_priority_rules(targets)

    scanned = 0
    ds = load_dataset("tmquan/vbpl-vn", "documents", split="train", streaming=True)
    for row in ds:
        scanned += 1
        if max_scan_rows and scanned > max_scan_rows:
            break
        if state.total_remaining() <= 0:
            break
        if not _passes_filters(row, allowed_scope, allowed_types):
            continue
        doc_name = str(row.get("doc_name"))
        if doc_name in state.collected_ids:
            continue

        hit = match_row_to_target(row, build_priority_number_index(targets), title_rules)
        if hit:
            category, kind, matched = hit
            if category not in backfill_quotas:
                continue
            if kind == "title_keyword":
                continue
            if state.can_add(category, kind):
                state.add(row, category, kind, matched)
            continue

        numbers = _doc_numbers_from_row(row)
        num_hit = _match_category_by_number(numbers, number_index)
        if num_hit:
            category, kind, matched = num_hit
            if category in backfill_quotas and state.can_add(category, kind):
                state.add(row, category, kind, f"doc_number:{matched}")
            continue

        title = row.get("title") or ""
        kw_hit = _match_category_by_keywords(title, keyword_index)
        if kw_hit:
            category, kw = kw_hit
            if category not in backfill_quotas:
                continue
            if category == "Criminal" and "tài sản" in kw:
                continue
            if state.can_add(category, "title_keyword"):
                state.add(row, category, "title_keyword", f"title_keyword:{kw}")
                continue

        _LEGAL_AREA_BACKFILL: dict[str, tuple[str, ...]] = {
            "Criminal": (
                "hình sự",
                "hinh su",
                "bộ luật hình sự",
                "tố tụng hình sự",
                "thi hành án hình sự",
            ),
            "Immigration": (
                "xuất nhập cảnh",
                "quốc tịch",
                "cư trú",
                "hộ chiếu",
                "biên phòng",
            ),
            "RealEstate": (
                "đất đai",
                "nhà ở",
                "bất động sản",
                "phát triển đô thị",
            ),
            "Civil": ("dân sự", "thi hành án dân sự"),
            "Commercial": ("thương mại", "quản lý thị trường"),
            "Investment": ("đầu tư", "đầu tư tại việt nam"),
            "Banking": ("tín dụng", "ngân hàng"),
            "Customs": ("hải quan", "xuất nhập khẩu", "xuất nhập cảnh hàng hóa"),
        }
        for cat, hints in _LEGAL_AREA_BACKFILL.items():
            if cat not in backfill_quotas or state.remaining(cat) <= 0:
                continue
            la = (row.get("legal_area") or "").lower()
            ti = (row.get("title") or "").lower()
            if any(h in la or h in ti for h in hints):
                if cat == "Investment" and any(
                    x in ti for x in ("đầu tư công", "đầu tư nước ngoài", "đối tác công tư")
                ):
                    continue
                if state.can_add(cat, "legal_area"):
                    state.add(row, cat, "legal_area", f"legal_area:{row.get('legal_area')}")
                    break

        if scanned % 50000 == 0:
            logger.info("Backfill 스캔 %d행 — 추가 %d건 — %s", scanned, len(state.records) - len(existing_records), dict(state.counts))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        for record in state.records:
            f.write(json.dumps(record, ensure_ascii=False, default=str) + "\n")

    for c in quotas:
        actual[c] = sum(1 for e in state.match_log if e.get("category") == c)
        repealed[c] = sum(
            1 for e in state.match_log if e.get("category") == c and e.get("match_kind") == "repealed_example"
        )

    shortfalls = {cat: max(0, quotas[cat] - actual.get(cat, 0)) for cat in quotas if actual.get(cat, 0) < quotas[cat]}
    updated = {
        **manifest,
        "scanned_rows": (manifest.get("scanned_rows") or 0) + scanned,
        "collected_total": len(state.records),
        "quotas": quotas,
        "actual_counts": dict(actual),
        "repealed_counts": dict(repealed),
        "shortfalls": shortfalls,
        "documents": state.match_log,
        "backfill_added": sum(state.counts.values()),
    }
    manifest_path.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
    logger.info(
        "Backfill 완료: +%d건, total=%d/%d, 부족=%s",
        sum(state.counts.values()),
        len(state.records),
        sum(quotas.values()),
        shortfalls or "없음",
    )
    return updated


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="STEP2 200-doc pilot curation")
    parser.add_argument("--targets", type=str, default="data/pilot/pilot_200_targets.json")
    parser.add_argument("--output", type=str, default="data/raw/pilot/pilot_200.jsonl")
    parser.add_argument("--manifest", type=str, default="data/pilot/pilot_200_collected.json")
    parser.add_argument("--max-scan-rows", type=int, default=None, help="테스트용 스캔 상한")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_arg_parser().parse_args(argv)
    curate_pilot(
        Path(args.targets),
        Path(args.output),
        Path(args.manifest),
        max_scan_rows=args.max_scan_rows,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
