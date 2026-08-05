"""
Dataset Audit — 실제 실행 가능한 구현.

⚠️ 이번 STEP1-1에서는 실행하지 않는다(로컬 데이터가 없음). download_datasets.py로
   data/raw/를 채운 뒤(sample 또는 full), huggingface.co 접근 가능한 환경에서
   아래 명령으로 실행할 것.

실행 방법:
    python -m src.audit_datasets --input-dir data/raw --output-dir reports

parquet/jsonl/csv를 자동 판별해 읽으므로, download_datasets.py의 --sample(jsonl)과
--full(parquet, snapshot 그대로) 결과 모두에 대해 실행 가능하다.
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
from typing import Any, Iterator

logger = logging.getLogger("legal_rag.audit")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# ---------------------------------------------------------------------------
# 소스별 필드 매핑 (공개 Dataset Card 기준, docs/Schema.md 7장과 동일)
# ---------------------------------------------------------------------------

SOURCE_FIELD_MAPS: dict[str, dict[str, str]] = {
    "vbpl": {
        "id": "doc_name",
        "title": "title",
        "doc_number": "doc_number",
        "doc_type": "doc_type",
        "issue_date": "issue_date",
        "issuing_authority": "issuing_authority",
        "body": "markdown",
        "url": "source_url",
        "status": None,  # tmquan 스키마에는 효력상태 필드가 없음(README 확인됨)
    },
    "th1nhng0_metadata": {
        "id": "id",
        "title": "title",
        "doc_number": "so_ky_hieu",
        "doc_type": "loai_van_ban",
        "issue_date": "ngay_ban_hanh",
        "issuing_authority": "co_quan_ban_hanh",
        "body": None,  # content config에 별도 존재
        "url": None,
        "status": "tinh_trang_hieu_luc",
    },
    "th1nhng0_content": {
        "id": "id",
        "body": "content_html",
    },
    "th1nhng0_relationships": {
        "source": "doc_id",
        "target": "other_doc_id",
        "relation": "relationship",
    },
    "th1nhng0_legacy_metadata": {
        "id": "id",
        "title": "title",
        "doc_number": "document_number",
        "doc_type": "legal_type",
        "issue_date": "issuance_date",
        "issuing_authority": "issuing_authority",
        "body": None,
        "url": None,
        "status": "effect_status",
    },
    "th1nhng0_legacy_content": {
        "id": "id",
        "body": "content",
    },
}

_DOC_NUMBER_FORMAT_RE = re.compile(r"^[\w\d]+[/-][\w\d/\-]+$", re.UNICODE)


# ---------------------------------------------------------------------------
# 파일 discovery + 로딩 (parquet/jsonl 자동 판별)
# ---------------------------------------------------------------------------


def _classify_file(path: Path) -> str | None:
    """파일 경로/이름으로 어떤 SOURCE_FIELD_MAPS 키에 해당하는지 추정."""
    name = path.name.lower()
    parts = [p.lower() for p in path.parts]

    if "vbpl" in parts and "th1nhng0" not in parts:
        return "vbpl"

    if "th1nhng0" in parts or "vietnamese-legal-documents" in "/".join(parts):
        if "legacy" in parts or "legacy" in name:
            if "content" in name:
                return "th1nhng0_legacy_content"
            if "metadata" in name:
                return "th1nhng0_legacy_metadata"
            return None
        if "relationship" in name:
            return "th1nhng0_relationships"
        if "content" in name:
            return "th1nhng0_content"
        if "metadata" in name or "sample" in name:
            return "th1nhng0_metadata"
    return None


def iter_records(path: Path) -> Iterator[dict[str, Any]]:
    """parquet/jsonl/csv 파일에서 레코드를 dict로 순회."""
    suffix = path.suffix.lower()
    if suffix == ".parquet":
        import pyarrow.parquet as pq

        table = pq.read_table(path)
        for batch in table.to_batches():
            for row in batch.to_pylist():
                yield row
    elif suffix in (".jsonl", ".ndjson"):
        with path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    yield json.loads(line)
    elif suffix == ".csv":
        import csv

        with path.open("r", encoding="utf-8", newline="") as f:
            yield from csv.DictReader(f)
    else:
        logger.debug("건너뜀(지원하지 않는 확장자): %s", path)


def discover_data_files(input_dir: Path) -> list[Path]:
    exts = (".parquet", ".jsonl", ".ndjson", ".csv")
    return sorted(
        p for p in input_dir.rglob("*")
        if p.is_file() and p.suffix.lower() in exts and p.name != "download_manifest.json"
    )


# ---------------------------------------------------------------------------
# Audit 결과 컨테이너
# ---------------------------------------------------------------------------


@dataclass
class AuditResult:
    revision_info: dict = field(default_factory=dict)
    license_info: dict = field(default_factory=dict)
    files_examined: list[str] = field(default_factory=list)
    total_documents: int = 0
    per_source_counts: Counter = field(default_factory=Counter)
    metadata_field_presence: dict[str, Counter] = field(default_factory=dict)
    relationship_total: int = 0
    relationship_type_counts: Counter = field(default_factory=Counter)
    duplicate_candidate_count: int = 0
    missing_body_count: int = 0
    missing_url_count: int = 0
    missing_issue_date_count: int = 0
    status_value_counts: Counter = field(default_factory=Counter)
    doc_number_format_ok: int = 0
    doc_number_format_bad: int = 0
    issuing_authority_top: Counter = field(default_factory=Counter)
    file_sizes_bytes: dict[str, int] = field(default_factory=dict)
    sha256_manifest: dict = field(default_factory=dict)

    def to_json_safe(self) -> dict:
        d = {}
        for k, v in self.__dict__.items():
            if isinstance(v, Counter):
                d[k] = dict(v.most_common())
            elif isinstance(v, dict) and v and isinstance(next(iter(v.values())), Counter):
                d[k] = {kk: dict(vv.most_common()) for kk, vv in v.items()}
            else:
                d[k] = v
        return d


KNOWN_LICENSES = {
    "vbpl": {
        "license": "CC-BY-4.0",
        "note": "원본 vbpl.vn 공개 포털(robots.txt Allow: /), 재배포는 CC-BY-4.0",
    },
    "th1nhng0": {
        "license": "원문: Public Domain (베트남 정보접근법 104/2016/QH13, "
        "법령공포법 64/2025/QH15) / 편집본: CC-BY-4.0",
        "note": "편집(스키마·큐레이션) 부분에만 CC-BY-4.0 출처 표시 필요",
    },
}

KNOWN_REVISIONS = {
    "vbpl": "11c902856b7a389788853fdd39b4998a5effa490",
    "th1nhng0": "0a39ad7eae8e6c188cb225c4b1443c3b346461d8",
}


# ---------------------------------------------------------------------------
# 핵심 Audit 로직
# ---------------------------------------------------------------------------


def _get(row: dict, key: str | None) -> Any:
    if key is None:
        return None
    return row.get(key)


# 본문이 별도 config/파일에 존재하는 "메타데이터 전용" 소스 -> 대응하는 본문 소스 키.
# 이 매핑이 있는 소스는 자기 행에 body 필드가 없다고 해서 "본문 없음"으로 단정하지
# 않고, 대응 본문 소스의 id 집합과 대조해 실제 join 가능 여부를 판정한다.
# (이전 버전의 버그: th1nhng0_metadata 모든 행이 무조건 missing_body로 잘못 집계됨)
_METADATA_TO_CONTENT_SOURCE = {
    "th1nhng0_metadata": "th1nhng0_content",
    "th1nhng0_legacy_metadata": "th1nhng0_legacy_content",
}


def _build_content_id_index(files: list[Path]) -> dict[str, set[str]]:
    """소스별로 본문(body)이 실제 존재하는 id 집합을 미리 수집(2-pass 감사의 1st pass)."""
    index: dict[str, set[str]] = {}
    for path in files:
        source_key = _classify_file(path)
        field_map = SOURCE_FIELD_MAPS.get(source_key, {}) if source_key else {}
        if source_key not in ("th1nhng0_content", "th1nhng0_legacy_content", "vbpl"):
            continue
        id_key = field_map.get("id")
        body_key = field_map.get("body")
        if not id_key or not body_key:
            continue
        ids = index.setdefault(source_key, set())
        for row in iter_records(path):
            if row.get(body_key):
                ids.add(str(row.get(id_key)))
    return index


def audit_file(path: Path, result: AuditResult, content_id_index: dict[str, set[str]]) -> None:
    source_key = _classify_file(path)
    field_map = SOURCE_FIELD_MAPS.get(source_key, {}) if source_key else {}

    result.files_examined.append(str(path))
    try:
        result.file_sizes_bytes[str(path)] = path.stat().st_size
    except OSError:
        pass

    presence = result.metadata_field_presence.setdefault(source_key or "unknown", Counter())

    seen_ids_for_dup_check: Counter = Counter()

    # 이 소스가 "문서 정체성"을 나타내는 소스인지 판정. content류(th1nhng0_content 등)는
    # 별도 문서가 아니라 metadata 소스의 본문 보충 자료이므로 total_documents에 중복 가산하지 않는다.
    is_identity_source = source_key in ("vbpl", "th1nhng0_metadata", "th1nhng0_legacy_metadata")
    content_lookup_key = _METADATA_TO_CONTENT_SOURCE.get(source_key)
    joined_content_ids = content_id_index.get(content_lookup_key, set()) if content_lookup_key else None

    for row in iter_records(path):
        presence.update([k for k, v in row.items() if v not in (None, "", [])])

        if source_key == "th1nhng0_relationships":
            result.relationship_total += 1
            rel = _get(row, field_map.get("relation"))
            result.relationship_type_counts[str(rel)] += 1
            continue

        if source_key in ("th1nhng0_content", "th1nhng0_legacy_content"):
            # 본문 보충 소스 자체는 문서로 집계하지 않음(위 is_identity_source=False)
            continue

        if is_identity_source:
            result.per_source_counts[source_key or "unknown"] += 1
            result.total_documents += 1

            if "body" in field_map and field_map.get("body") is not None:
                # 본문이 같은 행에 존재하는 소스(vbpl)
                body_val = _get(row, field_map.get("body"))
                if not body_val:
                    result.missing_body_count += 1
            elif joined_content_ids is not None:
                # 본문이 별도 content 소스에 있는 경우 — id로 join 가능 여부 확인
                row_id = str(_get(row, field_map.get("id")))
                if row_id not in joined_content_ids:
                    result.missing_body_count += 1
            # 매핑 정보 자체가 없으면(Audit 시점에 content 파일이 아직 없음) 판정 보류
            # — 잘못된 "본문 없음" 오탐을 만들지 않기 위해 카운트하지 않는다.

        if "url" in field_map:
            url_val = _get(row, field_map.get("url"))
            if field_map.get("url") is not None and not url_val:
                result.missing_url_count += 1

        if "issue_date" in field_map:
            date_val = _get(row, field_map.get("issue_date"))
            if not date_val:
                result.missing_issue_date_count += 1

        if "status" in field_map and field_map.get("status"):
            status_val = _get(row, field_map.get("status"))
            if status_val:
                result.status_value_counts[str(status_val)] += 1

        if "doc_number" in field_map:
            doc_num = _get(row, field_map.get("doc_number"))
            candidates = doc_num if isinstance(doc_num, list) else ([doc_num] if doc_num else [])
            for c in candidates:
                if not c:
                    continue
                if _DOC_NUMBER_FORMAT_RE.match(str(c)) or str(c).lower() == "không số":
                    result.doc_number_format_ok += 1
                else:
                    result.doc_number_format_bad += 1

        if "issuing_authority" in field_map:
            auth = _get(row, field_map.get("issuing_authority"))
            if auth:
                result.issuing_authority_top[str(auth)] += 1

        # 간이 중복 후보 탐지: (doc_number, issue_date) 조합 재등장 횟수
        if "doc_number" in field_map and "issue_date" in field_map:
            key = (
                json.dumps(_get(row, field_map.get("doc_number")), ensure_ascii=False),
                _get(row, field_map.get("issue_date")),
            )
            seen_ids_for_dup_check[key] += 1

    result.duplicate_candidate_count += sum(
        1 for count in seen_ids_for_dup_check.values() if count > 1
    )


def load_manifest_sha256(input_dir: Path) -> dict:
    manifest_path = input_dir / "download_manifest.json"
    if manifest_path.exists():
        return json.loads(manifest_path.read_text(encoding="utf-8"))
    return {}


def run_audit(input_dir: Path) -> AuditResult:
    result = AuditResult()
    result.license_info = KNOWN_LICENSES
    result.revision_info = KNOWN_REVISIONS
    result.sha256_manifest = load_manifest_sha256(input_dir)

    files = discover_data_files(input_dir)
    if not files:
        logger.warning(
            "입력 디렉토리에서 데이터 파일을 찾지 못했습니다: %s "
            "(먼저 download_datasets.py를 실행했는지 확인하세요)",
            input_dir,
        )
        return result

    # 1st pass: content류 소스의 id 집합 미리 수집 (join 가능 여부 판정용)
    content_id_index = _build_content_id_index(files)

    # 2nd pass: 실제 감사
    for path in files:
        logger.info("Audit 중: %s", path)
        audit_file(path, result, content_id_index)

    return result


# ---------------------------------------------------------------------------
# 리포트 출력
# ---------------------------------------------------------------------------


def render_markdown(result: AuditResult) -> str:
    lines = ["# Dataset Audit Report", ""]
    lines.append("## Revision")
    for k, v in result.revision_info.items():
        lines.append(f"- `{k}`: `{v}`")
    lines.append("")

    lines.append("## License")
    for k, v in result.license_info.items():
        lines.append(f"- **{k}**: {v.get('license')} — {v.get('note')}")
    lines.append("")

    lines.append("## 검사한 파일")
    lines.append(f"- 총 {len(result.files_examined)}개 파일")
    for f in result.files_examined:
        size = result.file_sizes_bytes.get(f, 0)
        lines.append(f"  - `{f}` ({size / 1024 / 1024:.2f} MB)")
    lines.append("")

    lines.append("## 문서 통계")
    lines.append(f"- 전체 문서 수(정체성 소스 기준, content류 join 대상은 중복 집계 안 함): **{result.total_documents}**")
    for src, count in result.per_source_counts.items():
        lines.append(f"  - {src}: {count}")
    lines.append(f"- 본문 없는 문서: {result.missing_body_count}")
    lines.append(f"- Official URL 없는 문서: {result.missing_url_count}")
    lines.append(f"- 시행일 없는 문서: {result.missing_issue_date_count}")
    lines.append(f"- 문서번호 형식 정상: {result.doc_number_format_ok}")
    lines.append(f"- 문서번호 형식 비정상(수동 확인 필요): {result.doc_number_format_bad}")
    lines.append(f"- 중복 후보(문서번호+시행일 동일): {result.duplicate_candidate_count}")
    lines.append("")

    lines.append("## 효력상태(Status) 분포")
    for status, count in result.status_value_counts.most_common(20):
        lines.append(f"- `{status}`: {count}")
    lines.append("")

    lines.append("## 관계(Relationship) 통계")
    lines.append(f"- 총 관계 수: {result.relationship_total}")
    for rel, count in result.relationship_type_counts.most_common(30):
        lines.append(f"  - `{rel}`: {count}")
    lines.append("")

    lines.append("## 발행기관 Top 20")
    for auth, count in result.issuing_authority_top.most_common(20):
        lines.append(f"- {auth}: {count}")
    lines.append("")

    lines.append("## SHA256 Manifest")
    if result.sha256_manifest:
        lines.append(f"- manifest에 기록된 파일 수: {len(result.sha256_manifest.get('entries', {}))}")
    else:
        lines.append("- (download_manifest.json 없음 — download_datasets.py를 먼저 실행)")
    lines.append("")

    lines.append("## 메타데이터 필드 존재율")
    for src, counter in result.metadata_field_presence.items():
        lines.append(f"### {src}")
        for field_name, count in counter.most_common(30):
            lines.append(f"- `{field_name}`: {count}")
    lines.append("")

    return "\n".join(lines)


def write_reports(result: AuditResult, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)

    (output_dir / "dataset-audit.json").write_text(
        json.dumps(result.to_json_safe(), ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (output_dir / "dataset-audit.md").write_text(render_markdown(result), encoding="utf-8")

    logger.info("리포트 저장 완료: %s", output_dir)


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="VFBCAI Legal Intelligence Platform — Dataset Audit")
    parser.add_argument("--input-dir", type=str, default="data/raw")
    parser.add_argument("--output-dir", type=str, default="reports")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    result = run_audit(Path(args.input_dir))
    write_reports(result, Path(args.output_dir))
    return 0


if __name__ == "__main__":
    sys.exit(main())
