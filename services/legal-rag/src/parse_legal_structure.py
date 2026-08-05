"""
법률 구조 파서 — 실제 실행 가능한 구현 (docs/Schema.md 3장, 4장 설계 구현).

Phần → Chương → Mục → Điều → Khoản → Điểm 계층을 정규식으로 인식하고,
Điều 단위 Chunk를 기본으로 생성한다. 긴 조문만 Khoản/Điểm까지 추가 분리한다.
모든 Chunk는 상위 Context(breadcrumb)를 유지한다.

⚠️ 이번 STEP1-1에서는 실행하지 않는다(정규화된 본문 데이터가 없음).
   deduplicate_documents.py 실행 후 huggingface.co 접근 가능한 환경에서 실행할 것.

실행 방법:
    python -m src.parse_legal_structure \
        --input data/normalized/documents_deduped.jsonl \
        --output data/normalized/chunks.jsonl

단위 테스트: tests/test_parse_legal_structure.py (합성 베트남어 법령 샘플로 검증됨)
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Iterator

from .schema import ChunkLevel, LegalChunk

logger = logging.getLogger("legal_rag.parse")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# 긴 조문 판단 임계값(문자수) — 실 데이터 분포 확인 전 잠정값(docs/Pipeline.md [6]단계 참고)
LONG_ARTICLE_CHAR_THRESHOLD = 800

# ---------------------------------------------------------------------------
# 정규식 패턴
# ---------------------------------------------------------------------------

# 줄 시작 기준으로 매칭 (MULTILINE). 베트남어 대소문자 혼용 대응.
_PHAN_RE = re.compile(r"^\s*Phần\s+(?:thứ\s+)?([IVXLCDM\d]+)\b[.:\s]*(.*)$", re.MULTILINE | re.IGNORECASE)
_CHUONG_RE = re.compile(r"^\s*Chương\s+([IVXLCDM\d]+)\b[.:\s]*(.*)$", re.MULTILINE | re.IGNORECASE)
_MUC_RE = re.compile(r"^\s*Mục\s+(\d+)\b[.:\s]*(.*)$", re.MULTILINE | re.IGNORECASE)
_DIEU_RE = re.compile(r"^\s*Điều\s+(\d+)\b[.:\s]*(.*)$", re.MULTILINE | re.IGNORECASE)
# Khoản: "1. ..." 형태로 Điều 본문 내부에서 등장 (숫자+마침표, 줄 시작)
_KHOAN_RE = re.compile(r"^\s*(\d+)\.\s+(.*)$", re.MULTILINE)
# Điểm: "a) ..." 형태 (알파벳 1글자+괄호, 줄 시작). 베트남어 đ 포함.
_DIEM_RE = re.compile(r"^\s*([a-zđ])\)\s+(.*)$", re.MULTILINE | re.IGNORECASE)


def _find_all_markers(pattern: re.Pattern, text: str) -> list[tuple[int, str, str]]:
    """(시작 offset, 번호, 제목텍스트) 목록 반환."""
    return [(m.start(), m.group(1), (m.group(2) or "").strip()) for m in pattern.finditer(text)]


# ---------------------------------------------------------------------------
# 상위 계층(Phần/Chương/Mục) breadcrumb 계산
# ---------------------------------------------------------------------------


def _build_breadcrumb_index(text: str) -> list[tuple[int, str]]:
    """
    본문 내 Phần/Chương/Mục 마커들을 offset 순으로 정렬해, 각 offset 지점의
    breadcrumb(예: "Chương III > Mục 2")을 조회할 수 있는 인덱스를 만든다.
    반환: [(offset, breadcrumb_string), ...] offset 오름차순.
    """
    markers: list[tuple[int, int, str]] = []  # (offset, level_rank, label)
    for offset, num, title in _find_all_markers(_PHAN_RE, text):
        label = f"Phần {num}" + (f" {title}" if title else "")
        markers.append((offset, 0, label))
    for offset, num, title in _find_all_markers(_CHUONG_RE, text):
        label = f"Chương {num}" + (f" {title}" if title else "")
        markers.append((offset, 1, label))
    for offset, num, title in _find_all_markers(_MUC_RE, text):
        label = f"Mục {num}" + (f" {title}" if title else "")
        markers.append((offset, 2, label))

    markers.sort(key=lambda m: m[0])

    index: list[tuple[int, str]] = []
    current: dict[int, str] = {}
    for offset, level_rank, label in markers:
        current[level_rank] = label
        # 하위 레벨이 갱신되면 그보다 상위 레벨은 유지, 동일/하위는 교체
        for lower in range(level_rank + 1, 3):
            current.pop(lower, None)
        breadcrumb = " > ".join(current[k] for k in sorted(current))
        index.append((offset, breadcrumb))

    return index


def _breadcrumb_at(index: list[tuple[int, str]], offset: int) -> str:
    result = ""
    for marker_offset, breadcrumb in index:
        if marker_offset <= offset:
            result = breadcrumb
        else:
            break
    return result


# ---------------------------------------------------------------------------
# Chunk 생성
# ---------------------------------------------------------------------------


def _split_khoan_diem(dieu_text: str, dieu_char_offset: int) -> list[dict]:
    """
    Điều 본문 내부를 Khoản(숫자.) / Điểm(알파벳)) 단위로 분리.
    Khoản이 없으면 빈 리스트 반환(호출자가 Điều 전체를 1개 chunk로 사용).
    """
    khoan_markers = _find_all_markers(_KHOAN_RE, dieu_text)
    if not khoan_markers:
        return []

    sub_chunks: list[dict] = []
    for i, (k_offset, k_num, k_title) in enumerate(khoan_markers):
        end = khoan_markers[i + 1][0] if i + 1 < len(khoan_markers) else len(dieu_text)
        khoan_text = dieu_text[k_offset:end]

        diem_markers = _find_all_markers(_DIEM_RE, khoan_text)
        if diem_markers:
            for j, (d_offset, d_letter, d_title) in enumerate(diem_markers):
                d_end = diem_markers[j + 1][0] if j + 1 < len(diem_markers) else len(khoan_text)
                diem_text = khoan_text[d_offset:d_end]
                sub_chunks.append(
                    {
                        "level": ChunkLevel.DIEM.value,
                        "khoan_no": k_num,
                        "diem_letter": d_letter,
                        "text": diem_text.strip(),
                        "charStart": dieu_char_offset + k_offset + d_offset,
                        "charEnd": dieu_char_offset + k_offset + d_end,
                    }
                )
        else:
            sub_chunks.append(
                {
                    "level": ChunkLevel.KHOAN.value,
                    "khoan_no": k_num,
                    "diem_letter": None,
                    "text": khoan_text.strip(),
                    "charStart": dieu_char_offset + k_offset,
                    "charEnd": dieu_char_offset + end,
                }
            )
    return sub_chunks


def parse_document_structure(document_id: str, text: str, document_number: list[str] | None = None, status: str | None = None) -> list[LegalChunk]:
    """
    본문 텍스트에서 Chunk 목록 생성. Điều 단위 기본, 장문은 Khoản/Điểm까지 분리.
    Điều 마커가 하나도 없으면(구조를 인식할 수 없는 경우) 문서 전체를 단일
    chunk로 반환한다 — 데이터 유실 방지가 최우선.
    """
    if not text:
        return []

    breadcrumb_index = _build_breadcrumb_index(text)
    dieu_markers = _find_all_markers(_DIEU_RE, text)

    chunks: list[LegalChunk] = []

    if not dieu_markers:
        chunks.append(
            LegalChunk(
                chunkId=f"{document_id}#full",
                documentId=document_id,
                level=ChunkLevel.DIEU.value,
                parentChunkId=None,
                path="(구조 인식 실패 — 문서 전체)",
                breadcrumbTitle="(구조 인식 실패)",
                text=text.strip(),
                charStart=0,
                charEnd=len(text),
                documentNumber=document_number or [],
                status=status,
            )
        )
        return chunks

    for i, (offset, dieu_num, dieu_title) in enumerate(dieu_markers):
        end = dieu_markers[i + 1][0] if i + 1 < len(dieu_markers) else len(text)
        dieu_text = text[offset:end]
        breadcrumb = _breadcrumb_at(breadcrumb_index, offset)
        dieu_path = (breadcrumb + " > " if breadcrumb else "") + f"Điều {dieu_num}"
        dieu_breadcrumb_title = dieu_path + (f" {dieu_title}" if dieu_title else "")
        dieu_chunk_id = f"{document_id}#dieu{dieu_num}"

        chunks.append(
            LegalChunk(
                chunkId=dieu_chunk_id,
                documentId=document_id,
                level=ChunkLevel.DIEU.value,
                parentChunkId=None,
                path=dieu_path,
                breadcrumbTitle=dieu_breadcrumb_title,
                text=dieu_text.strip(),
                charStart=offset,
                charEnd=end,
                documentNumber=document_number or [],
                status=status,
            )
        )

        # 긴 조문만 Khoản/Điểm까지 분리 (STEP1-1 지시사항)
        if len(dieu_text) >= LONG_ARTICLE_CHAR_THRESHOLD:
            for sub in _split_khoan_diem(dieu_text, offset):
                if sub["level"] == ChunkLevel.KHOAN.value:
                    sub_path = f"{dieu_path} > Khoản {sub['khoan_no']}"
                    sub_id = f"{dieu_chunk_id}.khoan{sub['khoan_no']}"
                else:
                    sub_path = f"{dieu_path} > Khoản {sub['khoan_no']} > Điểm {sub['diem_letter']}"
                    sub_id = f"{dieu_chunk_id}.khoan{sub['khoan_no']}.diem{sub['diem_letter']}"

                chunks.append(
                    LegalChunk(
                        chunkId=sub_id,
                        documentId=document_id,
                        level=sub["level"],
                        parentChunkId=dieu_chunk_id,
                        path=sub_path,
                        breadcrumbTitle=sub_path,
                        text=sub["text"],
                        charStart=sub["charStart"],
                        charEnd=sub["charEnd"],
                        documentNumber=document_number or [],
                        status=status,
                    )
                )

    return chunks


# ---------------------------------------------------------------------------
# 파이프라인 실행
# ---------------------------------------------------------------------------


def iter_documents(path: Path) -> Iterator[dict]:
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)


def run(input_path: Path, output_path: Path) -> int:
    total_chunks = 0
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8") as out_f:
        for doc in iter_documents(input_path):
            text = doc.get("normalizedText")
            chunks = parse_document_structure(
                document_id=doc["documentId"],
                text=text,
                document_number=doc.get("documentNumber"),
                status=doc.get("status"),
            )
            for chunk in chunks:
                out_f.write(json.dumps(chunk.to_dict(), ensure_ascii=False) + "\n")
                total_chunks += 1

    logger.info("구조 파싱 완료: %d개 chunk -> %s", total_chunks, output_path)
    return total_chunks


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="VFBCAI Legal Intelligence Platform — 법률 구조 파싱")
    parser.add_argument("--input", type=str, default="data/normalized/documents_deduped.jsonl")
    parser.add_argument("--output", type=str, default="data/normalized/chunks.jsonl")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)
    run(Path(args.input), Path(args.output))
    return 0


if __name__ == "__main__":
    sys.exit(main())
