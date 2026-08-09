"""
Canonical Document Schema 정규화 — 실제 실행 가능한 구현.

⚠️ 이번 STEP1-1에서는 실행하지 않는다(로컬 raw 데이터가 없음). download_datasets.py
   실행 후 huggingface.co 접근 가능한 환경에서 실행할 것.

실행 방법:
    python -m src.normalize_documents \
        --input-dir data/raw --output-dir data/normalized

원본 데이터(data/raw/*)는 이 스크립트가 절대 수정하지 않는다. 결과는
data/normalized/documents.jsonl에 별도로 기록된다.

단위 테스트: tests/test_normalize_documents.py (합성 샘플 레코드로 실제 실행/검증됨)
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any, Iterator

from .audit_datasets import discover_data_files, iter_records, _classify_file  # noqa: F401 (재사용)
from .schema import CanonicalDocument, DocumentStatus, SourceDataset
from .utils import (
    build_search_text,
    normalize_date,
    normalize_document_number,
    normalize_vietnamese_text,
    sha256_text,
)

logger = logging.getLogger("legal_rag.normalize")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

VBPL_VN_REVISION = "11c902856b7a389788853fdd39b4998a5effa490"
VIETNAMESE_LEGAL_DOCS_REVISION = "0a39ad7eae8e6c188cb225c4b1443c3b346461d8"

# 효력상태 표준화 매핑 (docs/Schema.md 2장과 동일)
_STATUS_MAP = {
    "còn hiệu lực": DocumentStatus.ACTIVE,
    "hết hiệu lực một phần": DocumentStatus.PARTIALLY_EXPIRED,
    "hết hiệu lực toàn bộ": DocumentStatus.FULLY_EXPIRED,
    "hết hiệu lực": DocumentStatus.FULLY_EXPIRED,
    "đã sửa đổi": DocumentStatus.AMENDED,
    "sửa đổi": DocumentStatus.AMENDED,
    "thay thế": DocumentStatus.REPLACED,
    "ngưng hiệu lực": DocumentStatus.SUSPENDED,
    "in effect": DocumentStatus.ACTIVE,
    "not in effect": DocumentStatus.FULLY_EXPIRED,
}


def standardize_status(raw_status: str | None) -> DocumentStatus:
    if not raw_status:
        return DocumentStatus.UNKNOWN
    key = raw_status.strip().lower()
    for pattern, status in _STATUS_MAP.items():
        if pattern in key:
            return status
    return DocumentStatus.UNKNOWN


def _build_content_fields(original: str | None) -> tuple[str | None, str | None, str | None]:
    """originalText는 그대로, normalizedText/searchText는 가공해 생성."""
    if not original:
        return None, None, None
    normalized = normalize_vietnamese_text(original)
    search_text = build_search_text(normalized)
    return original, normalized, search_text


# ---------------------------------------------------------------------------
# 소스별 정규화 함수
# ---------------------------------------------------------------------------


def _normalize_legal_area(value: object) -> str | None:
    """Preserve vbpl legal_area / th1nhng0 linh_vuc / legacy legal_sectors as a single string."""
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    if isinstance(value, list):
        parts = [str(item).strip() for item in value if str(item).strip()]
        return ", ".join(parts) if parts else None
    text = str(value).strip()
    return text or None


def normalize_vbpl_row(row: dict[str, Any]) -> CanonicalDocument:
    original, normalized, search_text = _build_content_fields(row.get("markdown"))
    content_hash = sha256_text(normalized) if normalized else None

    return CanonicalDocument(
        documentId=f"tmquan:{row.get('doc_name')}",
        sourceDataset=SourceDataset.TMQUAN_VBPL_VN.value,
        sourceRevision=VBPL_VN_REVISION,
        sourceDocumentId=str(row.get("doc_name")),
        officialUrl=row.get("source_url"),
        gatewayUrl=row.get("api_url"),
        documentNumber=normalize_document_number(
            (row.get("doc_number") or [None])[0] if isinstance(row.get("doc_number"), list)
            else row.get("doc_number")
        ),
        documentType=row.get("doc_type"),
        title=row.get("title"),
        issuingAuthority=row.get("issuing_authority"),
        issueDate=normalize_date(row.get("issue_date")),
        effectiveDate=None,   # tmquan 스키마에 없음(Audit로 확인 필요, docs/Schema.md 참고)
        expiryDate=None,
        status=DocumentStatus.UNKNOWN.value,  # tmquan에는 효력상태 필드 없음
        rawStatus=None,
        originalText=original,
        normalizedText=normalized,
        searchText=search_text,
        contentHash=content_hash,
        legalArea=_normalize_legal_area(row.get("legal_area")),
    )


def normalize_th1nhng0_metadata_row(
    row: dict[str, Any], content_by_id: dict[str, str] | None = None
) -> CanonicalDocument:
    content_by_id = content_by_id or {}
    doc_id = str(row.get("id"))
    original = content_by_id.get(doc_id)
    original, normalized, search_text = _build_content_fields(original)
    content_hash = sha256_text(normalized) if normalized else None

    raw_status = row.get("tinh_trang_hieu_luc")

    return CanonicalDocument(
        documentId=f"th1nhng0:{doc_id}",
        sourceDataset=SourceDataset.TH1NHNG0_METADATA.value,
        sourceRevision=VIETNAMESE_LEGAL_DOCS_REVISION,
        sourceDocumentId=doc_id,
        officialUrl=None,  # th1nhng0 metadata에는 URL 필드 없음(Audit로 재확인)
        gatewayUrl=None,
        documentNumber=normalize_document_number(row.get("so_ky_hieu")),
        documentType=row.get("loai_van_ban"),
        title=row.get("title"),
        issuingAuthority=row.get("co_quan_ban_hanh"),
        issueDate=normalize_date(row.get("ngay_ban_hanh")),
        effectiveDate=normalize_date(row.get("ngay_co_hieu_luc")),
        expiryDate=normalize_date(row.get("ngay_het_hieu_luc")),
        status=standardize_status(raw_status).value,
        rawStatus=raw_status,
        originalText=original,
        normalizedText=normalized,
        searchText=search_text,
        contentHash=content_hash,
        legalArea=_normalize_legal_area(row.get("linh_vuc")),
    )


def normalize_th1nhng0_legacy_row(row: dict[str, Any], content_by_id: dict[str, str] | None = None) -> CanonicalDocument:
    content_by_id = content_by_id or {}
    doc_id = str(row.get("id"))
    original = content_by_id.get(doc_id)
    original, normalized, search_text = _build_content_fields(original)
    content_hash = sha256_text(normalized) if normalized else None

    raw_status = row.get("effect_status")

    doc_number = row.get("document_number")
    return CanonicalDocument(
        documentId=f"th1nhng0-legacy:{doc_id}",
        sourceDataset=SourceDataset.TH1NHNG0_LEGACY.value,
        sourceRevision=VIETNAMESE_LEGAL_DOCS_REVISION,
        sourceDocumentId=doc_id,
        officialUrl=None,
        gatewayUrl=None,
        documentNumber=normalize_document_number(doc_number),
        documentType=row.get("legal_type"),
        title=row.get("title"),
        issuingAuthority=row.get("issuing_authority"),
        issueDate=normalize_date(row.get("issuance_date")),
        effectiveDate=normalize_date(row.get("effect_date")),
        expiryDate=normalize_date(row.get("effectless_date")),
        status=standardize_status(raw_status).value,
        rawStatus=raw_status,
        originalText=original,
        normalizedText=normalized,
        searchText=search_text,
        contentHash=content_hash,
        legalArea=_normalize_legal_area(row.get("legal_sectors")),
    )


def _load_content_index(files: list[Path], classify_key: str) -> dict[str, str]:
    """content config 파일들을 {id: body} dict로 로드 (metadata와 join하기 위함)."""
    index: dict[str, str] = {}
    for path in files:
        if _classify_file(path) != classify_key:
            continue
        for row in iter_records(path):
            rid = str(row.get("id"))
            body = row.get("content_html") or row.get("content")
            if rid and body:
                index[rid] = body
    return index


def normalize_all(input_dir: Path) -> Iterator[CanonicalDocument]:
    files = discover_data_files(input_dir)
    if not files:
        logger.warning(
            "입력 디렉토리에서 데이터 파일을 찾지 못했습니다: %s "
            "(download_datasets.py를 먼저 실행했는지 확인)",
            input_dir,
        )
        return

    th1nhng0_content_index = _load_content_index(files, "th1nhng0_content")
    th1nhng0_legacy_content_index = _load_content_index(files, "th1nhng0_legacy_content")

    for path in files:
        source_key = _classify_file(path)
        if source_key == "vbpl":
            for row in iter_records(path):
                yield normalize_vbpl_row(row)
        elif source_key == "th1nhng0_metadata":
            for row in iter_records(path):
                yield normalize_th1nhng0_metadata_row(row, th1nhng0_content_index)
        elif source_key == "th1nhng0_legacy_metadata":
            for row in iter_records(path):
                yield normalize_th1nhng0_legacy_row(row, th1nhng0_legacy_content_index)
        # th1nhng0_content / th1nhng0_legacy_content / th1nhng0_relationships는
        # 여기서 문서 레코드로 취급하지 않음(각각 join 대상 또는 normalize_relations.py 대상)


def run(input_dir: Path, output_dir: Path) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / "documents.jsonl"

    count = 0
    with out_path.open("w", encoding="utf-8") as f:
        for doc in normalize_all(input_dir):
            f.write(json.dumps(doc.to_dict(), ensure_ascii=False) + "\n")
            count += 1

    logger.info("정규화 완료: %d개 문서 -> %s", count, out_path)
    return count


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="VFBCAI Legal Intelligence Platform — Document 정규화")
    parser.add_argument("--input-dir", type=str, default="data/raw")
    parser.add_argument("--output-dir", type=str, default="data/normalized")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)
    run(Path(args.input_dir), Path(args.output_dir))
    return 0


if __name__ == "__main__":
    sys.exit(main())
