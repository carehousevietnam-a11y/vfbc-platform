"""
Search Quality Report — 실제 실행 가능한 구현 (STEP3-1).

포함 지표(지시사항 그대로): Exact 성공률, Keyword 성공률, Document Match,
Article Match, Relationship Match, Status Match, Parsing 오류, 누락 문서,
중복 문서, HTML 오류.

⚠️ 실제 huggingface.co 데이터로 실행한 적은 없다. `--fixture`는
   validate_real_dataset.py의 실 스키마 모사 합성 데이터를 그대로 사용한다.

실행 방법:
    python -m src.search_quality_report --fixture
    python -m src.search_quality_report --data-dir data/raw --dataset all
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

from .dataset_loader import load_dataset_records
from .dataset_mapper import map_dataset
from .dataset_validator import validate_duplicates
from .search_engine import LegalSearchIndex
from .search_models import SearchFilters, parse_locators_from_path
from .validate_real_dataset import _build_search_index, build_realistic_fixture_rows, run_pipeline

logger = logging.getLogger("legal_rag.search_quality_report")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

_HTML_RESIDUE_RE = re.compile(r"<[a-zA-Z/][^>]*>")


@dataclass
class Metric:
    numerator: int = 0
    denominator: int = 0
    examples: list[str] = field(default_factory=list)

    @property
    def rate(self) -> float | None:
        if self.denominator == 0:
            return None
        return round(self.numerator / self.denominator, 4)

    def to_dict(self) -> dict:
        return {
            "numerator": self.numerator, "denominator": self.denominator,
            "rate": self.rate, "examples": self.examples[:10],
        }


@dataclass
class QualityReport:
    exact_success: Metric = field(default_factory=Metric)
    keyword_success: Metric = field(default_factory=Metric)
    document_match: Metric = field(default_factory=Metric)
    article_match: Metric = field(default_factory=Metric)
    relationship_match: Metric = field(default_factory=Metric)
    status_match: Metric = field(default_factory=Metric)
    parsing_errors: int = 0
    missing_documents: int = 0
    duplicate_documents: int = 0
    html_errors: int = 0
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "exact_success": self.exact_success.to_dict(),
            "keyword_success": self.keyword_success.to_dict(),
            "document_match": self.document_match.to_dict(),
            "article_match": self.article_match.to_dict(),
            "relationship_match": self.relationship_match.to_dict(),
            "status_match": self.status_match.to_dict(),
            "parsing_errors": self.parsing_errors,
            "missing_documents": self.missing_documents,
            "duplicate_documents": self.duplicate_documents,
            "html_errors": self.html_errors,
            "notes": self.notes,
        }


def compute_quality(
    documents: list[dict],
    chunks: list[dict],
    relations: list[dict],
    index: LegalSearchIndex,
    pre_dedup_documents: list[dict] | None = None,
) -> QualityReport:
    """
    `documents`는 검색 인덱스에 실제로 적재된(=dedup 이후) 문서 목록이어야 한다
    (Exact/Document Match가 실제 인덱스 상태를 반영해야 하므로). 중복 문서 집계만은
    `pre_dedup_documents`(주어지지 않으면 `documents`로 대체)를 사용한다 — dedup
    이후 목록으로 중복을 검사하면 이미 제거되어 항상 0이 나오는 문제를 피하기 위함.
    """
    report = QualityReport()
    duplicate_check_source = pre_dedup_documents if pre_dedup_documents is not None else documents

    # --- Exact 성공률 (문서번호 기준) ---
    for doc in documents:
        numbers = doc.get("documentNumber") or []
        if not numbers:
            continue
        report.exact_success.denominator += 1
        results = index.search(query=numbers[0])
        if any(r.match_type.startswith("exact") for r in results):
            report.exact_success.numerator += 1
        else:
            report.exact_success.examples.append(f"{doc.get('documentId')}: {numbers[0]!r} 검색 실패")

    # --- Document Match (Document ID로 직접 조회) ---
    for doc in documents:
        report.document_match.denominator += 1
        results = index.search(query=doc["documentId"])
        if any(r.match_type == "exact_document_id" for r in results):
            report.document_match.numerator += 1
        else:
            report.document_match.examples.append(f"{doc['documentId']}: document_id 검색 실패")

    # --- Article Match ---
    for chunk in chunks:
        locators = parse_locators_from_path(chunk.get("path") or "")
        article_no = locators.get("article_no")
        if not article_no:
            continue
        report.article_match.denominator += 1
        results = index.search(query=f"Điều {article_no}", filters=None)
        hit = any(
            r.match_type == "exact_article" and r.article_no == article_no
            and r.document_id == chunk.get("documentId")
            for r in results
        )
        if hit:
            report.article_match.numerator += 1
        else:
            report.article_match.examples.append(
                f"{chunk.get('chunkId') or chunk.get('chunk_id')}: 조문(Điều {article_no}) 검색 실패"
            )

    # --- Keyword 성공률 (chunk 본문의 첫 어절로 검색) ---
    for chunk in chunks:
        text = chunk.get("text") or chunk.get("original_text") or ""
        words = text.split()
        if not words:
            continue
        keyword = words[0]
        report.keyword_success.denominator += 1
        results = index.search(query=keyword)
        if any(r.match_type.startswith("keyword") for r in results):
            report.keyword_success.numerator += 1
        else:
            report.keyword_success.examples.append(
                f"{chunk.get('chunkId') or chunk.get('chunk_id')}: 키워드 {keyword!r} 검색 실패"
            )

    # --- Relationship Match ---
    for edge in relations:
        rel_type = edge.get("relationType") or edge.get("relation_type")
        if not rel_type or rel_type == "unknown":
            continue
        report.relationship_match.denominator += 1
        results = index.search(filters=SearchFilters(relation_type=rel_type))
        src = edge.get("sourceDocumentId") or edge.get("source_document_id")
        tgt = edge.get("targetDocumentId") or edge.get("target_document_id")
        doc_ids_found = {r.document_id for r in results}
        if src in doc_ids_found or tgt in doc_ids_found:
            report.relationship_match.numerator += 1
        else:
            report.relationship_match.examples.append(f"관계 {src}->{tgt}({rel_type}) 필터 검색 실패")

    # --- Status Match ---
    status_values = {c.get("status") for c in chunks if c.get("status")}
    for status in status_values:
        expected_ids = {
            (c.get("documentId") or c.get("document_id")) for c in chunks if c.get("status") == status
        }
        report.status_match.denominator += 1
        results = index.search(filters=SearchFilters(status=status))
        found_ids = {r.document_id for r in results}
        if expected_ids & found_ids:
            report.status_match.numerator += 1
        else:
            report.status_match.examples.append(f"status={status} 필터 검색 결과 0건")

    # --- Parsing 오류 ---
    report.parsing_errors = sum(
        1 for c in chunks if (c.get("path") == "(구조 인식 실패 — 문서 전체)")
    )

    # --- 누락 문서 ---
    chunk_doc_ids = {c.get("documentId") or c.get("document_id") for c in chunks}
    report.missing_documents = sum(
        1 for d in documents
        if not d.get("normalizedText") or d["documentId"] not in chunk_doc_ids
    )

    # --- 중복 문서 (반드시 dedup 이전 원본 집합 기준으로 계산 — dedup 이후 목록에는
    #     이미 중복이 제거되어 있으므로 여기서 검사하면 항상 0이 나오는 버그를 방지) ---
    dup_report_holder = _DupReportShim()
    validate_duplicates(duplicate_check_source, dup_report_holder)
    report.duplicate_documents = dup_report_holder.duplicate_group_count

    # --- HTML 오류 ---
    for doc in documents:
        text = doc.get("normalizedText")
        if text and _HTML_RESIDUE_RE.search(text):
            report.html_errors += 1

    return report


class _DupReportShim:
    """dataset_validator.validate_duplicates()가 기대하는 ValidationReport 인터페이스의
    최소 구현(duplicate_group_count/duplicate_groups_sample 속성만 필요)."""

    def __init__(self) -> None:
        self.duplicate_group_count = 0
        self.duplicate_groups_sample: list[dict] = []


def render_markdown(report: QualityReport) -> str:
    lines = ["# Search Quality Report", ""]

    def metric_line(name: str, m: Metric) -> str:
        rate_str = f"{m.rate * 100:.1f}%" if m.rate is not None else "N/A(대상 없음)"
        return f"- **{name}**: {m.numerator}/{m.denominator} = {rate_str}"

    lines.append(metric_line("Exact 성공률", report.exact_success))
    lines.append(metric_line("Keyword 성공률", report.keyword_success))
    lines.append(metric_line("Document Match", report.document_match))
    lines.append(metric_line("Article Match", report.article_match))
    lines.append(metric_line("Relationship Match", report.relationship_match))
    lines.append(metric_line("Status Match", report.status_match))
    lines.append(f"- **Parsing 오류**: {report.parsing_errors}건")
    lines.append(f"- **누락 문서**: {report.missing_documents}건")
    lines.append(f"- **중복 문서(그룹)**: {report.duplicate_documents}건")
    lines.append(f"- **HTML 오류**: {report.html_errors}건")
    lines.append("")

    for name, m in (
        ("Exact 성공률", report.exact_success), ("Keyword 성공률", report.keyword_success),
        ("Document Match", report.document_match), ("Article Match", report.article_match),
        ("Relationship Match", report.relationship_match), ("Status Match", report.status_match),
    ):
        if m.examples:
            lines.append(f"## 실패 예시 — {name}")
            for ex in m.examples:
                lines.append(f"- {ex}")
            lines.append("")

    if report.notes:
        lines.append("## 참고")
        for n in report.notes:
            lines.append(f"- {n}")

    return "\n".join(lines)


def write_reports(report: QualityReport, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "search-quality.json").write_text(
        json.dumps(report.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (output_dir / "search-quality.md").write_text(render_markdown(report), encoding="utf-8")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="VFBCAI Legal Intelligence Platform — Search Quality Report")
    parser.add_argument("--fixture", action="store_true")
    parser.add_argument("--data-dir", type=str, default="data/raw")
    parser.add_argument("--dataset", choices=["vbpl", "th1nhng0", "all"], default="all")
    parser.add_argument("--output-dir", type=str, default="reports")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    if args.fixture:
        rows = build_realistic_fixture_rows()
    else:
        data_dir = Path(args.data_dir)
        keys = ["vbpl", "th1nhng0"] if args.dataset == "all" else [args.dataset]
        rows = []
        for key in keys:
            rows.extend(load_dataset_records(key, data_dir))
        if not rows:
            logger.warning("로컬에 실제 데이터가 없습니다(%s). --fixture를 사용하세요.", data_dir)
            return 1

    pipeline_report, index = run_pipeline(rows)

    # run_pipeline이 만든 index는 이미 dedup+chunk+relations 반영된 것이므로,
    # 동일 소스에서 documents/chunks/relations를 다시 계산해 지표 산출에 사용한다.
    from .dataset_mapper import map_dataset as _map_dataset
    from .deduplicate_documents import deduplicate as _deduplicate
    from .effective_scopes import build_effective_scopes as _build_effective_scopes
    from .normalize_relations import normalize_relationship_rows as _normalize_relationship_rows
    from .parse_legal_structure import parse_document_structure as _parse_document_structure

    mapped_docs, _ = _map_dataset(rows)
    outcome = _deduplicate(mapped_docs)
    dropped = {m for g in outcome.groups for m in g.member_document_ids if m != g.canonical_document_id}
    deduped_docs = [d for d in mapped_docs if d["documentId"] not in dropped]

    all_chunks = []
    for doc in deduped_docs:
        chunks = _parse_document_structure(
            doc["documentId"], doc.get("normalizedText"), doc.get("documentNumber"), doc.get("status")
        )
        all_chunks.extend(c.to_dict() for c in chunks)

    raw_relationships = [row for source_key, row in rows if source_key == "th1nhng0_relationships"]
    edges, _ = _normalize_relationship_rows(iter(raw_relationships)) if raw_relationships else ([], {})
    edge_dicts = [e.to_dict() for e in edges]

    report = compute_quality(deduped_docs, all_chunks, edge_dicts, index, pre_dedup_documents=mapped_docs)
    if pipeline_report.problems:
        report.notes.append(f"파이프라인 실행 중 {len(pipeline_report.problems)}건 문제 발견(real-dataset-pipeline.md 참고)")

    write_reports(report, Path(args.output_dir))
    logger.info(
        "Search Quality Report 생성 완료: exact=%s keyword=%s",
        report.exact_success.rate, report.keyword_success.rate,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
