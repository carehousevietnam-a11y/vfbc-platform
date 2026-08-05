"""
Legal Knowledge Base Schema 검증기 — 실제 실행 가능한 구현.

⚠️ 이 스크립트는 어떤 PostgreSQL 인스턴스에도 연결하지 않는다(DB 연결 코드 없음).
   sql/create_schema.sql 텍스트를 정적으로 파싱해 다음을 검증한다:
     - 모든 테이블이 PRIMARY KEY를 가지는가
     - 모든 FOREIGN KEY가 실제 존재하는 테이블/컬럼을 참조하는가
     - 모든 CREATE INDEX가 실제 존재하는 테이블/컬럼을 대상으로 하는가
     - 모든 FK 컬럼에 대응하는 INDEX가 있는가(STEP2 지시사항 "모든 FK Index 생성")
     - legal_documents/legal_chunks/legal_relations/legal_effective_scopes의
       컬럼 집합이 STEP2 지시사항에 명시된 컬럼 목록과 정확히 일치하는가
       ("추측으로 컬럼을 추가하지 않는다" 요구사항의 기계적 검증)

이 스크립트는 STEP2 제출 시 실제로 실행되어 reports/schema-validation.{md,json}을
생성했다(아래 실행 방법 참고). 별도로, 개발 중 sql/*.sql은 로컬 disposable
PostgreSQL(샌드박스 내, Supabase 아님)에서 실제 실행해 문법 오류가 없음을
추가로 확인했다 — 그 결과는 이 스크립트가 생성하는 리포트가 아니라 작업
보고에 별도로 기록했다(이 스크립트 자체는 DB 없이도 항상 재현 가능해야 하므로
DB 실행 결과를 코드에 하드코딩하지 않는다).

실행 방법:
    python -m src.build_schema --sql-dir sql --output-dir reports
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger("legal_rag.build_schema")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# STEP2 지시사항에 명시된 컬럼 목록 그대로 (추측 방지의 기준선).
# legal_articles는 STEP2에 구체 목록이 없어 검증 대상에서 제외한다(README에 사유 명시).
EXPECTED_COLUMNS = {
    "legal_documents": {
        "internal_id", "source_dataset", "source_revision", "official_document_id",
        "official_url", "document_number", "document_type", "title",
        "issuing_authority", "issue_date", "effective_date", "expiry_date",
        "status", "raw_status", "content_hash", "created_at", "updated_at",
    },
    "legal_chunks": {
        "chunk_id", "document_id", "chapter_no", "article_no", "clause_no",
        "item_no", "heading", "original_text", "normalized_text", "search_text",
        "status", "official_url", "content_hash",
    },
    "legal_relations": {
        "relation_id", "source_document_id", "target_document_id", "relation_type",
        "source_article", "target_article", "effective_from", "effective_to", "verified",
    },
    "legal_effective_scopes": {
        "scope_id", "document_id", "article_no", "clause_no", "item_no",
        "status", "effective_from", "effective_to", "relation_id",
    },
    "legal_dataset_versions": {
        "dataset_name", "revision", "download_date", "sha256", "license", "verified",
    },
    "legal_import_history": {
        "import_id", "dataset", "revision", "started_at", "finished_at",
        "success", "imported_documents", "warnings", "errors",
    },
}

REQUIRED_INDEX_TARGETS = {
    # (table, column) — STEP2 지시사항에 명시된 인덱스 요구사항
    ("legal_documents", "document_number"),
    ("legal_documents", "official_url"),
    ("legal_documents", "status"),
    ("legal_chunks", "article_no"),
    ("legal_relations", "relation_type"),
    ("legal_documents", "content_hash"),
}


# ---------------------------------------------------------------------------
# 데이터 구조
# ---------------------------------------------------------------------------


@dataclass
class ColumnDef:
    name: str
    raw: str
    is_primary_key: bool = False
    references: tuple[str, str] | None = None  # (table, column)


@dataclass
class TableDef:
    name: str
    columns: dict[str, ColumnDef] = field(default_factory=dict)
    primary_key_columns: list[str] = field(default_factory=list)
    foreign_keys: list[tuple[list[str], str, list[str]]] = field(default_factory=list)
    # (local_columns, ref_table, ref_columns)


@dataclass
class IndexDef:
    name: str
    table: str
    columns: list[str]


@dataclass
class ValidationIssue:
    severity: str  # "error" | "warning"
    message: str


@dataclass
class ValidationReport:
    tables: dict[str, TableDef] = field(default_factory=dict)
    indexes: list[IndexDef] = field(default_factory=list)
    issues: list[ValidationIssue] = field(default_factory=list)

    def add_error(self, msg: str) -> None:
        self.issues.append(ValidationIssue("error", msg))

    def add_warning(self, msg: str) -> None:
        self.issues.append(ValidationIssue("warning", msg))

    @property
    def error_count(self) -> int:
        return sum(1 for i in self.issues if i.severity == "error")

    @property
    def warning_count(self) -> int:
        return sum(1 for i in self.issues if i.severity == "warning")


# ---------------------------------------------------------------------------
# SQL 파싱 (create_schema.sql 전용 — 범용 SQL 파서가 아니라, 이 프로젝트가
# 스스로 생성한 정형화된 DDL 스타일에 맞춘 목적 파서)
# ---------------------------------------------------------------------------


def _strip_comments(sql: str) -> str:
    return re.sub(r"--[^\n]*", "", sql)


def _extract_balanced(text: str, start_paren_index: int) -> tuple[str, int]:
    """start_paren_index가 가리키는 '(' 부터 대응하는 ')' 까지 내용을 추출."""
    assert text[start_paren_index] == "("
    depth = 0
    for i in range(start_paren_index, len(text)):
        if text[i] == "(":
            depth += 1
        elif text[i] == ")":
            depth -= 1
            if depth == 0:
                return text[start_paren_index + 1 : i], i
    raise ValueError("괄호 불균형 — SQL 파싱 실패")


def _split_top_level(body: str) -> list[str]:
    """콤마로 분리하되, 중첩된 괄호 안의 콤마는 무시."""
    parts = []
    depth = 0
    current = []
    for ch in body:
        if ch == "(":
            depth += 1
            current.append(ch)
        elif ch == ")":
            depth -= 1
            current.append(ch)
        elif ch == "," and depth == 0:
            parts.append("".join(current).strip())
            current = []
        else:
            current.append(ch)
    if current:
        parts.append("".join(current).strip())
    return [p for p in parts if p]


_TABLE_NAME_RE = re.compile(r"(?:[\w]+\.)?([\w]+)")


def parse_create_tables(sql: str) -> dict[str, TableDef]:
    sql = _strip_comments(sql)
    tables: dict[str, TableDef] = {}

    for m in re.finditer(r"CREATE TABLE\s+([\w.]+)\s*\(", sql, re.IGNORECASE):
        full_name = m.group(1)
        table_name = _TABLE_NAME_RE.match(full_name.split(".")[-1]).group(1)
        paren_start = m.end() - 1
        body, _ = _extract_balanced(sql, paren_start)
        table = TableDef(name=table_name)

        for item in _split_top_level(body):
            item_stripped = item.strip()
            upper = item_stripped.upper()

            if upper.startswith("CONSTRAINT"):
                _parse_table_constraint(item_stripped, table)
            elif upper.startswith("PRIMARY KEY"):
                cols = _extract_paren_col_list(item_stripped)
                table.primary_key_columns.extend(cols)
            elif upper.startswith("FOREIGN KEY"):
                _parse_inline_foreign_key(item_stripped, table)
            elif upper.startswith("CHECK") or upper.startswith("UNIQUE"):
                continue  # 컬럼 목록 검증에는 영향 없음
            else:
                col = _parse_column_def(item_stripped)
                if col:
                    table.columns[col.name] = col
                    if col.is_primary_key:
                        table.primary_key_columns.append(col.name)
                    if col.references:
                        table.foreign_keys.append(([col.name], col.references[0], [col.references[1]]))

        tables[table_name] = table

    return tables


def _extract_paren_col_list(text: str) -> list[str]:
    idx = text.find("(")
    if idx == -1:
        return []
    body, _ = _extract_balanced(text, idx)
    return [c.strip().split()[0] for c in body.split(",") if c.strip()]


def _parse_column_def(item: str) -> ColumnDef | None:
    tokens = item.strip().split(None, 1)
    if not tokens:
        return None
    name = tokens[0]
    rest = tokens[1] if len(tokens) > 1 else ""

    is_pk = bool(re.search(r"\bPRIMARY KEY\b", rest, re.IGNORECASE))
    ref_match = re.search(r"REFERENCES\s+([\w.]+)\s*\(([^)]+)\)", rest, re.IGNORECASE)
    references = None
    if ref_match:
        ref_table = ref_match.group(1).split(".")[-1]
        ref_col = ref_match.group(2).strip().split(",")[0].strip()
        references = (ref_table, ref_col)

    return ColumnDef(name=name, raw=rest, is_primary_key=is_pk, references=references)


def _parse_inline_foreign_key(item: str, table: TableDef) -> None:
    m = re.search(
        r"FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+([\w.]+)\s*\(([^)]+)\)",
        item, re.IGNORECASE,
    )
    if not m:
        return
    local_cols = [c.strip() for c in m.group(1).split(",")]
    ref_table = m.group(2).split(".")[-1]
    ref_cols = [c.strip() for c in m.group(3).split(",")]
    table.foreign_keys.append((local_cols, ref_table, ref_cols))


def _parse_table_constraint(item: str, table: TableDef) -> None:
    upper = item.upper()
    if "PRIMARY KEY" in upper:
        pk_match = re.search(r"PRIMARY KEY\s*\(([^)]+)\)", item, re.IGNORECASE)
        if pk_match:
            table.primary_key_columns.extend(c.strip() for c in pk_match.group(1).split(","))
    if "FOREIGN KEY" in upper:
        _parse_inline_foreign_key(item, table)
    # CHECK 제약은 컬럼 존재 검증에 영향 없으므로 파싱하지 않음


def parse_create_indexes(sql: str) -> list[IndexDef]:
    sql = _strip_comments(sql)
    indexes = []
    for m in re.finditer(
        r"CREATE(?:\s+UNIQUE)?\s+INDEX\s+([\w]+)\s+ON\s+([\w.]+)\s*(?:USING\s+\w+\s*)?\(([^)]+)\)",
        sql, re.IGNORECASE,
    ):
        name = m.group(1)
        table = m.group(2).split(".")[-1]
        columns = [c.strip() for c in m.group(3).split(",")]
        indexes.append(IndexDef(name=name, table=table, columns=columns))
    return indexes


# ---------------------------------------------------------------------------
# 검증 로직
# ---------------------------------------------------------------------------


def validate(sql: str) -> ValidationReport:
    report = ValidationReport()
    report.tables = parse_create_tables(sql)
    report.indexes = parse_create_indexes(sql)

    if not report.tables:
        report.add_error("CREATE TABLE 문을 하나도 찾지 못했습니다 — 파싱 실패 가능성")
        return report

    # 1. 모든 테이블이 PK를 가지는가
    for name, table in report.tables.items():
        if not table.primary_key_columns:
            report.add_error(f"[{name}] PRIMARY KEY가 없습니다")

    # 2. 모든 FK가 실제 존재하는 테이블/컬럼을 참조하는가
    for name, table in report.tables.items():
        for local_cols, ref_table, ref_cols in table.foreign_keys:
            for lc in local_cols:
                if lc not in table.columns:
                    report.add_error(f"[{name}] FK 로컬 컬럼 '{lc}'이 테이블에 존재하지 않습니다")
            if ref_table not in report.tables:
                report.add_error(f"[{name}] FK가 존재하지 않는 테이블 '{ref_table}'을 참조합니다")
                continue
            ref_table_def = report.tables[ref_table]
            for rc in ref_cols:
                if rc not in ref_table_def.columns and rc not in ref_table_def.primary_key_columns:
                    report.add_error(
                        f"[{name}] FK가 '{ref_table}'의 존재하지 않는 컬럼 '{rc}'을 참조합니다"
                    )

    # 3. 모든 INDEX가 실제 존재하는 테이블/컬럼을 대상으로 하는가
    for idx in report.indexes:
        if idx.table not in report.tables:
            report.add_error(f"[INDEX {idx.name}] 존재하지 않는 테이블 '{idx.table}'을 대상으로 합니다")
            continue
        table_def = report.tables[idx.table]
        for col in idx.columns:
            if col not in table_def.columns and col not in table_def.primary_key_columns:
                report.add_error(
                    f"[INDEX {idx.name}] '{idx.table}'의 존재하지 않는 컬럼 '{col}'을 대상으로 합니다"
                )

    # 4. 모든 FK 컬럼에 대응하는 INDEX가 있는가
    indexed_pairs = {(idx.table, idx.columns[0]) for idx in report.indexes if idx.columns}
    for name, table in report.tables.items():
        for local_cols, _, _ in table.foreign_keys:
            first_col = local_cols[0]
            if (name, first_col) not in indexed_pairs:
                report.add_error(
                    f"[{name}] FK 컬럼 '{first_col}'에 대응하는 INDEX가 없습니다 "
                    f"(STEP2 지시사항: 모든 FK Index 생성)"
                )

    # 5. STEP2 지시사항 컬럼 목록과 정확히 일치하는가 (추측 컬럼 추가 방지 검증)
    for table_name, expected_cols in EXPECTED_COLUMNS.items():
        if table_name not in report.tables:
            report.add_error(f"[{table_name}] STEP2 지시사항에 명시된 테이블이 SQL에 없습니다")
            continue
        actual_cols = set(report.tables[table_name].columns.keys())
        extra = actual_cols - expected_cols
        missing = expected_cols - actual_cols
        if extra:
            report.add_error(f"[{table_name}] STEP2 지시사항에 없는 컬럼이 추가됨(추측 금지 위반): {sorted(extra)}")
        if missing:
            report.add_error(f"[{table_name}] STEP2 지시사항의 컬럼이 누락됨: {sorted(missing)}")

    # 6. 필수 인덱스 대상(REQUIRED_INDEX_TARGETS)이 실제로 색인되었는가
    for table, col in REQUIRED_INDEX_TARGETS:
        found = any(idx.table == table and col in idx.columns for idx in report.indexes)
        if not found:
            report.add_error(f"[{table}.{col}] STEP2 필수 인덱스 요구사항을 충족하는 INDEX가 없습니다")

    return report


# ---------------------------------------------------------------------------
# 리포트 출력
# ---------------------------------------------------------------------------


def render_markdown(report: ValidationReport) -> str:
    lines = ["# Schema Validation Report", ""]
    lines.append(f"- 검사한 테이블 수: {len(report.tables)}")
    lines.append(f"- 검사한 인덱스 수: {len(report.indexes)}")
    lines.append(f"- 오류: {report.error_count}건 / 경고: {report.warning_count}건")
    lines.append("")

    lines.append("## 테이블별 PRIMARY KEY / FOREIGN KEY")
    for name, table in sorted(report.tables.items()):
        lines.append(f"### `{name}`")
        lines.append(f"- 컬럼 수: {len(table.columns)}")
        lines.append(f"- PRIMARY KEY: {table.primary_key_columns or '(없음)'}")
        if table.foreign_keys:
            for local_cols, ref_table, ref_cols in table.foreign_keys:
                lines.append(f"  - FK: {local_cols} -> `{ref_table}`({ref_cols})")
        lines.append("")

    lines.append("## 검사 결과")
    if not report.issues:
        lines.append("모든 검증 항목을 통과했습니다. 오류/경고 없음.")
    else:
        for issue in report.issues:
            prefix = "🔴 ERROR" if issue.severity == "error" else "🟡 WARNING"
            lines.append(f"- {prefix}: {issue.message}")
    lines.append("")

    return "\n".join(lines)


def to_json_safe(report: ValidationReport) -> dict:
    return {
        "table_count": len(report.tables),
        "index_count": len(report.indexes),
        "error_count": report.error_count,
        "warning_count": report.warning_count,
        "tables": {
            name: {
                "columns": sorted(table.columns.keys()),
                "primary_key": table.primary_key_columns,
                "foreign_keys": [
                    {"local_columns": lc, "ref_table": rt, "ref_columns": rc}
                    for lc, rt, rc in table.foreign_keys
                ],
            }
            for name, table in report.tables.items()
        },
        "indexes": [
            {"name": idx.name, "table": idx.table, "columns": idx.columns}
            for idx in report.indexes
        ],
        "issues": [{"severity": i.severity, "message": i.message} for i in report.issues],
    }


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="VFBCAI Legal Intelligence Platform — SQL Schema 정적 검증 (DB 연결 없음)"
    )
    parser.add_argument("--sql-dir", type=str, default="sql")
    parser.add_argument("--output-dir", type=str, default="reports")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    sql_path = Path(args.sql_dir) / "create_schema.sql"
    if not sql_path.exists():
        logger.error("SQL 파일이 없습니다: %s", sql_path)
        return 1

    sql = sql_path.read_text(encoding="utf-8")
    report = validate(sql)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "schema-validation.md").write_text(render_markdown(report), encoding="utf-8")
    (output_dir / "schema-validation.json").write_text(
        json.dumps(to_json_safe(report), ensure_ascii=False, indent=2), encoding="utf-8"
    )

    logger.info(
        "Schema 검증 완료: 테이블 %d개, 인덱스 %d개, 오류 %d건, 경고 %d건",
        len(report.tables), len(report.indexes), report.error_count, report.warning_count,
    )
    return 1 if report.error_count > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
