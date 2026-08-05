"""
Real Dataset Loader — 실제 실행 가능한 구현 (STEP3-1).

⚠️ 이 모듈의 다운로드 함수(`download_if_missing`)는 huggingface.co에 접근 가능한
   **사용자 로컬 PC에서만** 실행한다. 이 샌드박스는 huggingface.co에 접근할 수
   없음이 이미 확인되었으므로(403 host_not_allowed), 이번 STEP3-1 제출 과정에서
   실제로 다운로드를 실행하지 않았다.

역할 분담:
  - `src/download_datasets.py`(STEP1-1): revision 고정 + resume + SHA256 + 재시도
    로 실제 파일을 `data/raw/`에 받아오는 "다운로드 전용" 모듈. 이번 STEP3-1에서
    수정하지 않는다.
  - `dataset_loader.py`(본 모듈, STEP3-1 신규): 이미 받아진(또는 앞으로 받을)
    로컬 파일을 dataset_key(tmquan/th1nhng0) 단위로 **포맷 자동 인식**해 읽어
    들이는 "로드 전용" 모듈. download_datasets.py의 다운로드 함수를 그대로
    재사용하고, audit_datasets.py의 파일 discovery/파싱 유틸을 재사용해
    중복 구현을 피했다(기존 STEP1-1 파일은 수정하지 않음).

지원 포맷: Parquet / JSON / JSONL (자동 인식, audit_datasets.iter_records 재사용)
지원 데이터셋: tmquan(단일 config), th1nhng0(metadata/content/relationships/legacy)
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Iterator

from .audit_datasets import _classify_file, discover_data_files, iter_records
from .download_datasets import (
    TARGETS,
    VBPL_VN_REVISION,
    VIETNAMESE_LEGAL_DOCS_REVISION,
    download_full,
    download_sample,
)

logger = logging.getLogger("legal_rag.dataset_loader")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


# ---------------------------------------------------------------------------
# 다운로드 (사용자 로컬 PC 전용 — 이 샌드박스에서 실행하지 않음)
# ---------------------------------------------------------------------------


def download_if_missing(
    dataset_key: str, output_dir: Path, sample: int | None = None, force: bool = False
) -> Path:
    """
    dataset_key("vbpl" 또는 "th1nhng0")에 해당하는 로컬 디렉토리가 비어있으면
    download_datasets.py의 다운로드 함수를 호출한다. 이미 파일이 있으면
    (force=True가 아닌 한) 재다운로드하지 않는다.

    ⚠️ huggingface.co 접근이 가능한 환경에서만 실제로 데이터가 받아진다.
       이 함수 자체는 STEP1-1의 download_datasets.py를 그대로 호출할 뿐이며,
       이번 STEP3-1 제출 시 실행되지 않았다(아래 CLI --download 플래그 참고).
    """
    if dataset_key not in TARGETS:
        raise ValueError(f"알 수 없는 dataset_key: {dataset_key} (vbpl 또는 th1nhng0)")

    target = TARGETS[dataset_key]
    dest = output_dir / dataset_key
    already_has_files = dest.exists() and any(dest.iterdir())

    if already_has_files and not force:
        logger.info("이미 로컬에 파일이 있어 다운로드를 건너뜁니다: %s", dest)
        return dest

    if sample is not None:
        download_sample(target, output_dir, sample)
    else:
        download_full(target, output_dir, resume=True)

    return dest


# ---------------------------------------------------------------------------
# 로드 (포맷 자동 인식) — audit_datasets.py의 discovery/iter_records 재사용
# ---------------------------------------------------------------------------


# dataset_key -> 이 데이터셋에 속하는 audit_datasets._classify_file() 반환값 집합
DATASET_SOURCE_KEYS: dict[str, set[str]] = {
    "vbpl": {"vbpl"},
    "th1nhng0": {
        "th1nhng0_metadata", "th1nhng0_content",
        "th1nhng0_relationships", "th1nhng0_legacy_metadata", "th1nhng0_legacy_content",
    },
}


def load_dataset_records(dataset_key: str, data_dir: Path) -> Iterator[tuple[str, dict]]:
    """
    data_dir(보통 data/raw) 아래에서 dataset_key에 속하는 파일들을 찾아
    (source_key, row) 튜플을 순회한다. source_key는 "vbpl" 또는
    "th1nhng0_metadata"/"th1nhng0_content"/"th1nhng0_relationships"/
    "th1nhng0_legacy_metadata"/"th1nhng0_legacy_content" 중 하나(audit_datasets.py의
    분류 체계와 동일) — 어느 config/파일에서 온 행인지 구분해야 dataset_mapper.py가
    올바른 컬럼 매핑을 고를 수 있기 때문이다.
    """
    if dataset_key not in DATASET_SOURCE_KEYS:
        raise ValueError(f"알 수 없는 dataset_key: {dataset_key}")

    valid_source_keys = DATASET_SOURCE_KEYS[dataset_key]
    files = discover_data_files(data_dir)
    matched_files = [f for f in files if _classify_file(f) in valid_source_keys]

    if not matched_files:
        logger.warning(
            "dataset_key=%s에 해당하는 로컬 파일을 찾지 못했습니다(%s). "
            "download_if_missing() 또는 download_datasets.py를 먼저 실행하세요.",
            dataset_key, data_dir,
        )
        return

    for path in matched_files:
        source_key = _classify_file(path)
        logger.info("로드 중: %s (source_key=%s)", path, source_key)
        for row in iter_records(path):
            yield source_key, row


def load_dataset_as_dict(dataset_key: str, data_dir: Path) -> dict[str, list[dict]]:
    """source_key별로 행을 모아 dict[str, list[dict]] 형태로 반환(소규모 데이터/테스트용).
    대용량 Full 다운로드에는 load_dataset_records()의 제너레이터 형태를 직접 쓸 것."""
    out: dict[str, list[dict]] = {}
    for source_key, row in load_dataset_records(dataset_key, data_dir):
        out.setdefault(source_key, []).append(row)
    return out


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="VFBCAI Legal Intelligence Platform — Real Dataset Loader"
    )
    parser.add_argument("--dataset", choices=["vbpl", "th1nhng0", "all"], default="all")
    parser.add_argument("--data-dir", type=str, default="data/raw")
    parser.add_argument(
        "--download", action="store_true",
        help="로컬에 파일이 없으면 다운로드 시도(huggingface.co 접근 가능 환경 전용)",
    )
    parser.add_argument("--sample", type=int, default=None, help="--download와 함께 사용 시 샘플 N개만")
    parser.add_argument("--print-summary", action="store_true", help="로드된 레코드 수 요약 출력")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    data_dir = Path(args.data_dir)
    keys = ["vbpl", "th1nhng0"] if args.dataset == "all" else [args.dataset]

    for key in keys:
        if args.download:
            download_if_missing(key, data_dir, sample=args.sample)

        if args.print_summary:
            counts: dict[str, int] = {}
            for source_key, _ in load_dataset_records(key, data_dir):
                counts[source_key] = counts.get(source_key, 0) + 1
            logger.info("dataset=%s 로드 요약: %s", key, json.dumps(counts, ensure_ascii=False))

    return 0


if __name__ == "__main__":
    sys.exit(main())
