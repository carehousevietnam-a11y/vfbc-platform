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

from .utils import normalize_document_number

logger = logging.getLogger("legal_rag.curate_pilot")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


def _norm_text(value: str | None) -> str:
    if not value:
        return ""
    text = unicodedata.normalize("NFC", value).lower()
    return re.sub(r"\s+", " ", text).strip()


def _doc_numbers_from_row(row: dict[str, Any]) -> list[str]:
    raw = row.get("doc_number")
    if raw is None:
        return []
    if isinstance(raw, list):
        items = raw
    else:
        items = [raw]
    result: list[str] = []
    for item in items:
        result.extend(normalize_document_number(str(item)))
    return result


def _build_number_index(targets: dict) -> dict[str, tuple[str, str]]:
    """normalized doc number -> (category, match_kind)"""
    index: dict[str, tuple[str, str]] = {}
    for category, spec in targets["categories"].items():
        for num in spec.get("doc_numbers", []):
            for n in normalize_document_number(num):
                index[_norm_text(n)] = (category, "doc_number")
        for num in spec.get("repealed_doc_numbers", []):
            for n in normalize_document_number(num):
                index[_norm_text(n)] = (category, "repealed_example")
    return index


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
    if row.get("scope") not in allowed_scope:
        return False
    if row.get("doc_type") not in allowed_types:
        return False
    if not row.get("markdown") and not row.get("title"):
        return False
    return True


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

    logger.info("스트리밍 수집 시작 (quota=%s)", quotas)
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

        numbers = _doc_numbers_from_row(row)
        hit = _match_category_by_number(numbers, number_index)
        if hit:
            category, kind, matched = hit
            if state.can_add(category, kind):
                state.add(row, category, kind, f"doc_number:{matched}")
            continue

        # keyword pass only when category still needs docs
        title = row.get("title") or ""
        kw_hit = _match_category_by_keywords(title, keyword_index)
        if kw_hit:
            category, kw = kw_hit
            if state.can_add(category, "title_keyword"):
                state.add(row, category, "title_keyword", f"title_keyword:{kw}")

        if scanned % 10000 == 0:
            logger.info("스캔 %d행 — 수집 %d건 — %s", scanned, len(state.records), dict(state.counts))

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
