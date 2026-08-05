"""
Dataset Mapper — 실제 실행 가능한 구현 (STEP3-1).

실제 raw 컬럼 → Canonical Schema(src/schema.py `CanonicalDocument`와 동일 필드,
STEP1-1 normalize_documents.py 산출물과 동일한 dict 형태) 매핑을 수행한다.

STEP1-1의 `normalize_documents.py`(normalize_vbpl_row 등)와 다른 점: 그쪽은
공개 Dataset Card 기준으로 **확정된 컬럼명**을 하드코딩해 매핑하지만, 이 모듈은
"실제 데이터를 열어보기 전까지는 컬럼명이 문서화된 것과 다를 수 있다"는 전제로
**alias(후보 컬럼명 목록)를 우선순위대로 시도**하고, 어떤 alias도 매치되지 않으면
에러 없이 None으로 채우되 어떤 필드가 비었는지 리포트로 남긴다("컬럼 누락/컬럼명
차이 자동 처리" 요구사항). normalize_documents.py는 STEP3-1에서 수정하지 않는다
— 이 모듈은 그 옆에 나란히 존재하는 더 방어적인 대안이다.

⚠️ 실제 huggingface.co 데이터로 이 매퍼를 실행한 적은 없다(다운로드 자체가
   이 샌드박스에서 불가능하기 때문). alias 목록은 두 데이터셋의 공개 Dataset
   Card(STEP1 조사 결과, docs/Schema.md 7장)를 근거로 작성했다.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .normalize_documents import standardize_status
from .utils import (
    build_search_text,
    normalize_date,
    normalize_document_number,
    normalize_vietnamese_text,
    sha256_text,
)

logger = logging.getLogger("legal_rag.dataset_mapper")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

VBPL_VN_REVISION = "11c902856b7a389788853fdd39b4998a5effa490"
VIETNAMESE_LEGAL_DOCS_REVISION = "0a39ad7eae8e6c188cb225c4b1443c3b346461d8"

# source_key -> (sourceDataset 값, documentId 접두어, sourceRevision)
SOURCE_KEY_META = {
    "vbpl": ("tmquan_vbpl_vn", "tmquan", VBPL_VN_REVISION),
    "th1nhng0_metadata": ("th1nhng0_vietnamese_legal", "th1nhng0", VIETNAMESE_LEGAL_DOCS_REVISION),
    "th1nhng0_legacy_metadata": ("th1nhng0_legacy", "th1nhng0-legacy", VIETNAMESE_LEGAL_DOCS_REVISION),
}

# content가 별도 source_key에 있는 경우의 매핑(join 대상)
CONTENT_SOURCE_FOR = {
    "th1nhng0_metadata": "th1nhng0_content",
    "th1nhng0_legacy_metadata": "th1nhng0_legacy_content",
}

# ---------------------------------------------------------------------------
# 컬럼 alias 목록 (우선순위대로 시도) — 두 데이터셋의 공개 스키마 전체를 합집합.
# 실제 컬럼명이 문서와 다르더라도, 유사한 이름이 있으면 자동으로 흡수하려는 목적.
# ---------------------------------------------------------------------------

FIELD_ALIASES: dict[str, list[str]] = {
    "sourceDocumentId": ["doc_name", "id", "item_id", "document_id"],
    "officialUrl": ["source_url", "official_url", "url"],
    "gatewayUrl": ["api_url", "gateway_url"],
    "documentNumberRaw": ["doc_number", "so_ky_hieu", "document_number", "doc_num"],
    "documentType": ["doc_type", "loai_van_ban", "legal_type", "type"],
    "title": ["title", "ten_van_ban"],
    "issuingAuthority": ["issuing_authority", "co_quan_ban_hanh"],
    "issueDateRaw": ["issue_date", "ngay_ban_hanh", "issuance_date"],
    "effectiveDateRaw": ["effective_date", "ngay_co_hieu_luc", "effect_date"],
    "expiryDateRaw": ["expiry_date", "ngay_het_hieu_luc", "effectless_date"],
    "rawStatus": ["tinh_trang_hieu_luc", "effect_status", "status"],
    "bodyRaw": ["markdown", "content_html", "content", "body", "text"],
}


@dataclass
class MappingIssue:
    source_key: str
    row_id: str | None
    canonical_field: str
    detail: str


@dataclass
class MappingReport:
    total_rows: int = 0
    mapped_rows: int = 0
    field_hit_counts: dict[str, int] = field(default_factory=dict)
    field_miss_counts: dict[str, int] = field(default_factory=dict)
    issues: list[MappingIssue] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "total_rows": self.total_rows,
            "mapped_rows": self.mapped_rows,
            "field_hit_counts": self.field_hit_counts,
            "field_miss_counts": self.field_miss_counts,
            "issue_count": len(self.issues),
            "issues_sample": [i.__dict__ for i in self.issues[:50]],
        }


def _first_present(row: dict[str, Any], aliases: list[str], report: MappingReport, canonical_field: str) -> Any:
    for alias in aliases:
        value = row.get(alias)
        if value not in (None, "", [], {}):
            report.field_hit_counts[canonical_field] = report.field_hit_counts.get(canonical_field, 0) + 1
            return value
    report.field_miss_counts[canonical_field] = report.field_miss_counts.get(canonical_field, 0) + 1
    return None


def map_row(
    row: dict[str, Any],
    source_key: str,
    report: MappingReport,
    content_by_id: dict[str, str] | None = None,
) -> dict[str, Any] | None:
    """단일 raw row -> Canonical Schema dict(CanonicalDocument.to_dict()와 동일 형태)."""
    if source_key not in SOURCE_KEY_META:
        report.issues.append(
            MappingIssue(source_key, None, "_source", f"알 수 없는 source_key: {source_key}")
        )
        return None

    source_dataset, id_prefix, revision = SOURCE_KEY_META[source_key]

    source_document_id = _first_present(row, FIELD_ALIASES["sourceDocumentId"], report, "sourceDocumentId")
    if source_document_id is None:
        report.issues.append(
            MappingIssue(source_key, None, "sourceDocumentId", "행 식별자(id)를 찾을 수 없어 매핑 불가")
        )
        return None
    source_document_id = str(source_document_id)

    official_url = _first_present(row, FIELD_ALIASES["officialUrl"], report, "officialUrl")
    gateway_url = _first_present(row, FIELD_ALIASES["gatewayUrl"], report, "gatewayUrl")
    doc_number_raw = _first_present(row, FIELD_ALIASES["documentNumberRaw"], report, "documentNumberRaw")
    document_type = _first_present(row, FIELD_ALIASES["documentType"], report, "documentType")
    title = _first_present(row, FIELD_ALIASES["title"], report, "title")
    issuing_authority = _first_present(row, FIELD_ALIASES["issuingAuthority"], report, "issuingAuthority")
    issue_date_raw = _first_present(row, FIELD_ALIASES["issueDateRaw"], report, "issueDateRaw")
    effective_date_raw = _first_present(row, FIELD_ALIASES["effectiveDateRaw"], report, "effectiveDateRaw")
    expiry_date_raw = _first_present(row, FIELD_ALIASES["expiryDateRaw"], report, "expiryDateRaw")
    raw_status = _first_present(row, FIELD_ALIASES["rawStatus"], report, "rawStatus")

    body_raw = None
    for alias in FIELD_ALIASES["bodyRaw"]:
        value = row.get(alias)
        if value not in (None, "", [], {}):
            body_raw = value
            break
    if body_raw is None and content_by_id is not None:
        body_raw = content_by_id.get(source_document_id)

    if body_raw is not None:
        report.field_hit_counts["bodyRaw"] = report.field_hit_counts.get("bodyRaw", 0) + 1
    else:
        report.field_miss_counts["bodyRaw"] = report.field_miss_counts.get("bodyRaw", 0) + 1

    normalized_text = normalize_vietnamese_text(body_raw) if body_raw else None
    search_text = build_search_text(normalized_text) if normalized_text else None
    content_hash = sha256_text(normalized_text) if normalized_text else None

    if isinstance(doc_number_raw, list):
        document_number: list[str] = []
        for item in doc_number_raw:
            document_number.extend(normalize_document_number(item))
    else:
        document_number = normalize_document_number(doc_number_raw)

    document_id = f"{id_prefix}:{source_document_id}"

    return {
        "documentId": document_id,
        "sourceDataset": source_dataset,
        "sourceRevision": revision,
        "sourceDocumentId": source_document_id,
        "officialUrl": official_url,
        "gatewayUrl": gateway_url,
        "documentNumber": document_number,
        "documentType": document_type,
        "title": title,
        "issuingAuthority": issuing_authority,
        "issueDate": normalize_date(issue_date_raw) if issue_date_raw else None,
        "effectiveDate": normalize_date(effective_date_raw) if effective_date_raw else None,
        "expiryDate": normalize_date(expiry_date_raw) if expiry_date_raw else None,
        "status": standardize_status(raw_status).value if raw_status else "unknown",
        "rawStatus": raw_status,
        "originalText": body_raw,
        "normalizedText": normalized_text,
        "searchText": search_text,
        "contentHash": content_hash,
    }


def map_dataset(
    rows: list[tuple[str, dict]], report: MappingReport | None = None
) -> tuple[list[dict], MappingReport]:
    """
    (source_key, row) 튜플 목록(dataset_loader.load_dataset_records()의 출력 형태)을
    Canonical Schema dict 목록으로 변환. content류 source_key(th1nhng0_content 등)는
    문서로 매핑하지 않고 본문 join 인덱스로만 사용한다(STEP1-1 normalize_documents.py와
    동일 원칙).
    """
    report = report or MappingReport()

    content_index: dict[str, dict[str, str]] = {"th1nhng0_metadata": {}, "th1nhng0_legacy_metadata": {}}
    content_source_map = {"th1nhng0_content": "th1nhng0_metadata", "th1nhng0_legacy_content": "th1nhng0_legacy_metadata"}

    for source_key, row in rows:
        if source_key in content_source_map:
            target = content_source_map[source_key]
            row_id = row.get("id")
            body = row.get("content_html") or row.get("content")
            if row_id is not None and body:
                content_index[target][str(row_id)] = body

    mapped: list[dict] = []
    for source_key, row in rows:
        if source_key not in SOURCE_KEY_META:
            continue  # content/relationships 등은 문서 매핑 대상이 아님
        report.total_rows += 1
        content_by_id = content_index.get(source_key)
        canonical = map_row(row, source_key, report, content_by_id)
        if canonical:
            mapped.append(canonical)
            report.mapped_rows += 1

    return mapped, report


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="VFBCAI Legal Intelligence Platform — Dataset Mapper")
    parser.add_argument("--data-dir", type=str, default="data/raw")
    parser.add_argument("--dataset", choices=["vbpl", "th1nhng0", "all"], default="all")
    parser.add_argument("--output", type=str, default="data/normalized/documents_mapped.jsonl")
    parser.add_argument("--reports-dir", type=str, default="reports")
    return parser


def main(argv: list[str] | None = None) -> int:
    from .dataset_loader import load_dataset_records  # 지연 import(순환참조 방지)

    parser = build_arg_parser()
    args = parser.parse_args(argv)

    data_dir = Path(args.data_dir)
    keys = ["vbpl", "th1nhng0"] if args.dataset == "all" else [args.dataset]

    all_rows: list[tuple[str, dict]] = []
    for key in keys:
        all_rows.extend(load_dataset_records(key, data_dir))

    mapped, report = map_dataset(all_rows)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        for doc in mapped:
            f.write(json.dumps(doc, ensure_ascii=False) + "\n")

    reports_dir = Path(args.reports_dir)
    reports_dir.mkdir(parents=True, exist_ok=True)
    (reports_dir / "dataset-mapping.json").write_text(
        json.dumps(report.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8"
    )

    logger.info(
        "매핑 완료: %d/%d행 성공 -> %s", report.mapped_rows, report.total_rows, output_path
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
