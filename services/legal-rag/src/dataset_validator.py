"""
Dataset Validator — 실제 실행 가능한 구현 (STEP3-1).

검증 대상(지시사항 그대로): Official URL, Document Number, Issue Date,
Effective Date, Status, Title, Relationship, Content, Metadata, 중복, 누락,
형식 오류.

⚠️ 실제 huggingface.co 데이터로 실행한 적은 없다. 아래 단위/통합 테스트는
   실제 스키마를 모사한 합성 데이터(정상 케이스 + 의도적 결함 케이스 혼합)로
   검증기 자체가 문제를 정확히 잡아내는지 확인한 것이다 — "실제 데이터 검증"과
   "검증기 코드가 올바르게 동작하는지 검증"은 다른 층위이며, 이번 STEP3-1
   제출에서는 후자만 실제로 완료했다.
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .deduplicate_documents import deduplicate
from .normalize_relations import map_relation_type

logger = logging.getLogger("legal_rag.dataset_validator")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

_DOC_NUMBER_FORMAT_RE = re.compile(r"^[\w\d]+[/-][\w\d/\-]+$", re.UNICODE)
_URL_FORMAT_RE = re.compile(r"^https?://", re.IGNORECASE)


@dataclass
class CategoryResult:
    checked: int = 0
    passed: int = 0
    missing: int = 0
    malformed: int = 0
    examples: list[str] = field(default_factory=list)

    def add_example(self, text: str, cap: int = 20) -> None:
        if len(self.examples) < cap:
            self.examples.append(text)

    def to_dict(self) -> dict:
        return {
            "checked": self.checked, "passed": self.passed,
            "missing": self.missing, "malformed": self.malformed,
            "examples": self.examples,
        }


@dataclass
class ValidationReport:
    categories: dict[str, CategoryResult] = field(default_factory=dict)
    duplicate_group_count: int = 0
    duplicate_groups_sample: list[dict] = field(default_factory=list)
    total_documents: int = 0
    total_relationships: int = 0

    def cat(self, name: str) -> CategoryResult:
        return self.categories.setdefault(name, CategoryResult())

    def to_dict(self) -> dict:
        return {
            "total_documents": self.total_documents,
            "total_relationships": self.total_relationships,
            "duplicate_group_count": self.duplicate_group_count,
            "duplicate_groups_sample": self.duplicate_groups_sample,
            "categories": {k: v.to_dict() for k, v in self.categories.items()},
        }


# ---------------------------------------------------------------------------
# 문서(Canonical Schema dict) 검증
# ---------------------------------------------------------------------------


def validate_official_url(docs: list[dict], report: ValidationReport) -> None:
    cat = report.cat("official_url")
    for doc in docs:
        cat.checked += 1
        url = doc.get("officialUrl")
        if not url:
            cat.missing += 1
            continue
        if _URL_FORMAT_RE.match(url):
            cat.passed += 1
        else:
            cat.malformed += 1
            cat.add_example(f"{doc.get('documentId')}: officialUrl 형식 오류 -> {url!r}")


def validate_document_number(docs: list[dict], report: ValidationReport) -> None:
    cat = report.cat("document_number")
    for doc in docs:
        cat.checked += 1
        numbers = doc.get("documentNumber") or []
        if not numbers:
            cat.missing += 1
            continue
        bad = [n for n in numbers if not (_DOC_NUMBER_FORMAT_RE.match(n) or n.lower() == "không số")]
        if bad:
            cat.malformed += 1
            cat.add_example(f"{doc.get('documentId')}: 문서번호 형식 오류 -> {bad}")
        else:
            cat.passed += 1


def _validate_date_field(docs: list[dict], canonical_field: str, category_name: str, report: ValidationReport) -> None:
    cat = report.cat(category_name)
    for doc in docs:
        cat.checked += 1
        value = doc.get(canonical_field)
        if value is None:
            cat.missing += 1
        else:
            # normalize_date가 이미 정규화에 성공한 값만 여기 들어옴(ISO 문자열).
            # 재검증(포맷이 실제로 ISO YYYY-MM-DD인지)까지 한 번 더 확인.
            if re.match(r"^\d{4}-\d{2}-\d{2}$", value):
                cat.passed += 1
            else:
                cat.malformed += 1
                cat.add_example(f"{doc.get('documentId')}: {canonical_field} 형식 오류 -> {value!r}")


def validate_issue_date(docs: list[dict], report: ValidationReport) -> None:
    _validate_date_field(docs, "issueDate", "issue_date", report)


def validate_effective_date(docs: list[dict], report: ValidationReport) -> None:
    _validate_date_field(docs, "effectiveDate", "effective_date", report)


def validate_status(docs: list[dict], report: ValidationReport) -> None:
    cat = report.cat("status")
    known = {"active", "partially_expired", "fully_expired", "amended", "replaced", "suspended", "unknown"}
    for doc in docs:
        cat.checked += 1
        status = doc.get("status")
        raw_status = doc.get("rawStatus")
        if status not in known:
            cat.malformed += 1
            cat.add_example(f"{doc.get('documentId')}: 알 수 없는 status 값 -> {status!r}")
        elif status == "unknown" and raw_status:
            # 원본에는 상태값이 있었는데 표준화 매핑에 실패한 경우 — "형식 오류"보다는
            # "매핑 커버리지 부족"에 가까우므로 malformed로 집계하되 원인을 명시
            cat.malformed += 1
            cat.add_example(f"{doc.get('documentId')}: rawStatus={raw_status!r} 매핑 실패(표준화 안 됨)")
        elif status == "unknown":
            cat.missing += 1
        else:
            cat.passed += 1


def validate_title(docs: list[dict], report: ValidationReport) -> None:
    cat = report.cat("title")
    for doc in docs:
        cat.checked += 1
        title = doc.get("title")
        if not title or not title.strip():
            cat.missing += 1
        else:
            cat.passed += 1


def validate_content(docs: list[dict], report: ValidationReport) -> None:
    cat = report.cat("content")
    html_cat = report.cat("html_residue")
    for doc in docs:
        cat.checked += 1
        html_cat.checked += 1
        text = doc.get("normalizedText")
        if not text:
            cat.missing += 1
            continue
        cat.passed += 1
        if "<" in text and ">" in text and re.search(r"<[a-zA-Z/][^>]*>", text):
            html_cat.malformed += 1
            html_cat.add_example(f"{doc.get('documentId')}: 정규화 후에도 HTML 태그 잔존")
        else:
            html_cat.passed += 1


def validate_metadata_completeness(docs: list[dict], report: ValidationReport) -> None:
    """핵심 메타데이터(문서번호/제목/발행기관/시행일) 4종 중 몇 개나 채워졌는지."""
    cat = report.cat("metadata_completeness")
    core_fields = ("documentNumber", "title", "issuingAuthority", "issueDate")
    for doc in docs:
        cat.checked += 1
        filled = sum(1 for f in core_fields if doc.get(f))
        if filled == len(core_fields):
            cat.passed += 1
        elif filled == 0:
            cat.missing += 1
            cat.add_example(f"{doc.get('documentId')}: 핵심 메타데이터 전부 누락")
        else:
            cat.malformed += 1
            cat.add_example(f"{doc.get('documentId')}: 핵심 메타데이터 {filled}/{len(core_fields)}만 존재")


def validate_duplicates(docs: list[dict], report: ValidationReport) -> None:
    outcome = deduplicate(docs)
    groups = [g for g in outcome.groups if len(g.member_document_ids) > 1]
    report.duplicate_group_count = len(groups)
    report.duplicate_groups_sample = [
        {"canonical": g.canonical_document_id, "members": g.member_document_ids, "tier": g.match_tier}
        for g in groups[:20]
    ]


# ---------------------------------------------------------------------------
# Relationship 검증
# ---------------------------------------------------------------------------


def validate_relationships(
    raw_relationships: list[dict], mapped_docs: list[dict], report: ValidationReport
) -> None:
    cat = report.cat("relationship")
    known_doc_ids = {d["documentId"] for d in mapped_docs}
    report.total_relationships = len(raw_relationships)

    for edge in raw_relationships:
        cat.checked += 1
        src = edge.get("doc_id")
        tgt = edge.get("other_doc_id")
        label = edge.get("relationship")

        if src is None or tgt is None:
            cat.missing += 1
            cat.add_example(f"관계 edge에 doc_id/other_doc_id 누락: {edge}")
            continue

        rel_type = map_relation_type(label)
        src_id = f"th1nhng0:{src}"
        tgt_id = f"th1nhng0:{tgt}"
        missing_refs = [x for x in (src_id, tgt_id) if x not in known_doc_ids]

        if missing_refs:
            cat.malformed += 1
            cat.add_example(f"관계가 참조하는 문서가 현재 로드된 집합에 없음: {missing_refs}")
        elif rel_type.value == "unknown":
            cat.malformed += 1
            cat.add_example(f"relation_type 매핑 실패(라벨 미분류): {label!r}")
        else:
            cat.passed += 1


# ---------------------------------------------------------------------------
# 통합 실행
# ---------------------------------------------------------------------------


def run_validation(
    mapped_docs: list[dict], raw_relationships: list[dict] | None = None
) -> ValidationReport:
    report = ValidationReport()
    report.total_documents = len(mapped_docs)

    validate_official_url(mapped_docs, report)
    validate_document_number(mapped_docs, report)
    validate_issue_date(mapped_docs, report)
    validate_effective_date(mapped_docs, report)
    validate_status(mapped_docs, report)
    validate_title(mapped_docs, report)
    validate_content(mapped_docs, report)
    validate_metadata_completeness(mapped_docs, report)
    validate_duplicates(mapped_docs, report)

    if raw_relationships:
        validate_relationships(raw_relationships, mapped_docs, report)

    return report


def render_markdown(report: ValidationReport) -> str:
    lines = ["# Dataset Validation Report", ""]
    lines.append(f"- 전체 문서 수: {report.total_documents}")
    lines.append(f"- 전체 관계 수: {report.total_relationships}")
    lines.append(f"- 중복 그룹 수: {report.duplicate_group_count}")
    lines.append("")

    for name, cat in report.categories.items():
        lines.append(f"## {name}")
        lines.append(f"- 검사: {cat.checked} / 통과: {cat.passed} / 누락: {cat.missing} / 형식오류: {cat.malformed}")
        if cat.examples:
            lines.append("- 예시:")
            for ex in cat.examples[:10]:
                lines.append(f"  - {ex}")
        lines.append("")

    if report.duplicate_groups_sample:
        lines.append("## 중복 문서 그룹 (샘플)")
        for g in report.duplicate_groups_sample:
            lines.append(f"- 대표: `{g['canonical']}`, 구성원: {g['members']}, tier: {g['tier']}")
        lines.append("")

    return "\n".join(lines)


def write_reports(report: ValidationReport, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "dataset-validation.json").write_text(
        json.dumps(report.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (output_dir / "dataset-validation.md").write_text(render_markdown(report), encoding="utf-8")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="VFBCAI Legal Intelligence Platform — Dataset Validator")
    parser.add_argument("--documents", type=str, default="data/normalized/documents_mapped.jsonl")
    parser.add_argument("--relationships-raw", type=str, default=None)
    parser.add_argument("--output-dir", type=str, default="reports")
    return parser


def _load_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    docs = _load_jsonl(Path(args.documents))
    if not docs:
        logger.warning("문서가 없습니다: %s (dataset_mapper.py를 먼저 실행하세요)", args.documents)

    raw_relationships = None
    if args.relationships_raw:
        from .audit_datasets import iter_records

        raw_relationships = list(iter_records(Path(args.relationships_raw)))

    report = run_validation(docs, raw_relationships)
    write_reports(report, Path(args.output_dir))

    logger.info("Dataset Validation 완료: 문서 %d개, 중복그룹 %d개", report.total_documents, report.duplicate_group_count)
    return 0


if __name__ == "__main__":
    sys.exit(main())
