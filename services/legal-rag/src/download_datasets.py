"""
Hugging Face 데이터셋 다운로드 CLI — 저메모리/재시작 안전 최종 구현.

Sample 모드:
- `datasets.load_dataset()`와 원격 Parquet 직접 읽기를 사용하지 않는다.
- Hugging Face Dataset Viewer `/rows` REST API에서 최대 100행씩 받아 JSONL로 저장한다.
- 따라서 대형 `content.parquet`을 WSL 프로세스가 직접 열지 않아 `Killed` 위험을 크게 줄인다.
- Dataset Viewer API는 현재 게시된 Viewer 데이터를 제공하므로 Sample 모드에서는 revision 고정을
  보장하지 않는다. Full 모드만 snapshot_download에서 고정 revision을 사용한다.

Full 모드:
- 기존과 동일하게 `snapshot_download()`와 고정 revision을 사용한다.

실행 예:
    python -m src.download_datasets --sample 10 --dataset th1nhng0
    python -m src.download_datasets --sample 100 --dataset vbpl
    python -m src.download_datasets --full --dataset vbpl
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests

from .utils import retry, sha256_file

logger = logging.getLogger("legal_rag.download")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

VBPL_VN_REPO = "tmquan/vbpl-vn"
VBPL_VN_REVISION = "11c902856b7a389788853fdd39b4998a5effa490"

VIETNAMESE_LEGAL_DOCS_REPO = "th1nhng0/vietnamese-legal-documents"
VIETNAMESE_LEGAL_DOCS_REVISION = "0a39ad7eae8e6c188cb225c4b1443c3b346461d8"
VIETNAMESE_LEGAL_DOCS_CONFIGS = (
    "metadata",
    "content",
    "relationships",
    "legacy_content",
    "legacy_metadata",
)

DATASET_VIEWER_BASE_URL = "https://datasets-server.huggingface.co"
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parents[1] / "data" / "raw"
MANIFEST_FILENAME = "download_manifest.json"
PART_SUFFIX = ".part"
VIEWER_PAGE_SIZE = 100
HTTP_TIMEOUT_SECONDS = 90
OPTIONAL_VIEWER_CONFIGS = {"legacy_content", "legacy_metadata"}


@dataclass(frozen=True)
class DownloadTarget:
    key: str
    repo_id: str
    revision: str
    configs: tuple[str, ...] | None


TARGETS: dict[str, DownloadTarget] = {
    "vbpl": DownloadTarget("vbpl", VBPL_VN_REPO, VBPL_VN_REVISION, None),
    "th1nhng0": DownloadTarget(
        "th1nhng0",
        VIETNAMESE_LEGAL_DOCS_REPO,
        VIETNAMESE_LEGAL_DOCS_REVISION,
        VIETNAMESE_LEGAL_DOCS_CONFIGS,
    ),
}


# ---------------------------------------------------------------------------
# Manifest
# ---------------------------------------------------------------------------


def _empty_manifest() -> dict[str, Any]:
    return {"entries": {}}


def _load_manifest(output_dir: Path) -> dict[str, Any]:
    path = output_dir / MANIFEST_FILENAME
    if not path.exists():
        return _empty_manifest()

    try:
        manifest = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        logger.warning("manifest를 읽지 못해 새로 생성합니다: %s (%s)", path, exc)
        return _empty_manifest()

    if not isinstance(manifest, dict):
        return _empty_manifest()
    if not isinstance(manifest.get("entries"), dict):
        manifest["entries"] = {}
    return manifest


def _save_manifest(output_dir: Path, manifest: dict[str, Any]) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / MANIFEST_FILENAME
    tmp_path = path.with_name(path.name + PART_SUFFIX)
    tmp_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    tmp_path.replace(path)


def _manifest_key(output_dir: Path, file_path: Path) -> str:
    return str(file_path.relative_to(output_dir)).replace("\\", "/")


def _file_metadata(file_path: Path, **extra: Any) -> dict[str, Any]:
    metadata: dict[str, Any] = {
        "sha256": sha256_file(str(file_path)),
        "size_bytes": file_path.stat().st_size,
    }
    metadata.update(extra)
    return metadata


def _is_existing_sample_valid(
    output_dir: Path,
    manifest: dict[str, Any],
    file_path: Path,
    requested_rows: int,
    config: str,
    split: str,
) -> bool:
    if not file_path.is_file():
        return False

    key = _manifest_key(output_dir, file_path)
    previous = manifest.get("entries", {}).get(key)
    if not isinstance(previous, dict):
        return False

    if previous.get("source_method") != "dataset_viewer_rows":
        return False
    if previous.get("sample_rows") != requested_rows:
        return False
    if previous.get("config") != config or previous.get("split") != split:
        return False

    expected_hash = previous.get("sha256")
    expected_size = previous.get("size_bytes")
    if not isinstance(expected_hash, str) or not isinstance(expected_size, int):
        return False
    if file_path.stat().st_size != expected_size:
        return False
    if sha256_file(str(file_path)) != expected_hash:
        return False

    logger.info("기존 검증 샘플 재사용: %s (%d행)", key, requested_rows)
    return True


def _record_file(
    output_dir: Path,
    manifest: dict[str, Any],
    file_path: Path,
    **extra: Any,
) -> None:
    key = _manifest_key(output_dir, file_path)
    metadata = _file_metadata(file_path, **extra)
    manifest.setdefault("entries", {})[key] = metadata
    logger.info(
        "검증 완료: %s (%.2f MB, sha256=%s...)",
        key,
        metadata["size_bytes"] / 1024 / 1024,
        metadata["sha256"][:12],
    )


# ---------------------------------------------------------------------------
# HTTP helpers / Dataset Viewer
# ---------------------------------------------------------------------------


def _auth_headers() -> dict[str, str]:
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_HUB_TOKEN")
    if not token:
        return {}
    return {"Authorization": f"Bearer {token}"}


def _request_json(
    session: requests.Session,
    endpoint: str,
    params: dict[str, Any],
    max_attempts: int = 4,
) -> dict[str, Any]:
    url = f"{DATASET_VIEWER_BASE_URL}/{endpoint.lstrip('/')}"
    delay = 2.0

    for attempt in range(1, max_attempts + 1):
        try:
            response = session.get(
                url,
                params=params,
                headers=_auth_headers(),
                timeout=HTTP_TIMEOUT_SECONDS,
            )

            if response.status_code == 429 and attempt < max_attempts:
                retry_after = response.headers.get("Retry-After")
                wait = float(retry_after) if retry_after and retry_after.isdigit() else delay
                logger.warning("Dataset Viewer 요청 제한. %.1f초 후 재시도 (%d/%d)", wait, attempt, max_attempts)
                time.sleep(wait)
                delay *= 2
                continue

            response.raise_for_status()
            payload = response.json()
            if not isinstance(payload, dict):
                raise RuntimeError(f"예상하지 못한 Dataset Viewer 응답 형식: {type(payload).__name__}")
            if payload.get("error"):
                raise RuntimeError(f"Dataset Viewer 오류: {payload['error']}")
            return payload

        except (requests.RequestException, ValueError, RuntimeError) as exc:
            if attempt >= max_attempts:
                raise RuntimeError(
                    f"Dataset Viewer 요청 실패: endpoint={endpoint}, params={params}"
                ) from exc
            logger.warning("Dataset Viewer 요청 실패 (%d/%d): %s", attempt, max_attempts, exc)
            time.sleep(delay)
            delay *= 2

    raise RuntimeError("Dataset Viewer 요청 실패")


def _resolve_config_and_split(
    session: requests.Session,
    target: DownloadTarget,
    requested_config: str | None,
) -> tuple[str, str]:
    payload = _request_json(session, "/splits", {"dataset": target.repo_id})
    splits = payload.get("splits")
    if not isinstance(splits, list) or not splits:
        raise RuntimeError(f"Dataset Viewer에서 split 정보를 찾지 못했습니다: {target.repo_id}")

    candidates = [item for item in splits if isinstance(item, dict)]
    if requested_config is not None:
        candidates = [item for item in candidates if item.get("config") == requested_config]
        if not candidates:
            available = sorted({
                str(item.get("config"))
                for item in splits
                if isinstance(item, dict) and item.get("config") is not None
            })
            raise RuntimeError(
                f"요청 config를 찾지 못했습니다: {requested_config}; 사용 가능={available}"
            )

    preferred_split = "train" if target.key == "vbpl" else "data"
    selected = next(
        (item for item in candidates if item.get("split") == preferred_split),
        candidates[0],
    )

    config = selected.get("config")
    split = selected.get("split")
    if not isinstance(config, str) or not isinstance(split, str):
        raise RuntimeError(f"잘못된 split 응답: {selected}")
    return config, split


def _download_viewer_rows(
    session: requests.Session,
    target: DownloadTarget,
    config: str,
    split: str,
    out_path: Path,
    limit: int,
) -> int:
    tmp_path = out_path.with_name(out_path.name + PART_SUFFIX)
    tmp_path.unlink(missing_ok=True)

    written = 0
    offset = 0

    logger.info(
        "Dataset Viewer 저메모리 읽기 시작: dataset=%s config=%s split=%s n=%d",
        target.repo_id,
        config,
        split,
        limit,
    )

    try:
        with tmp_path.open("w", encoding="utf-8", buffering=1024 * 1024) as handle:
            while written < limit:
                page_length = min(VIEWER_PAGE_SIZE, limit - written)
                payload = _request_json(
                    session,
                    "/rows",
                    {
                        "dataset": target.repo_id,
                        "config": config,
                        "split": split,
                        "offset": offset,
                        "length": page_length,
                    },
                )

                items = payload.get("rows")
                if not isinstance(items, list):
                    raise RuntimeError("Dataset Viewer 응답에 rows 배열이 없습니다.")
                if not items:
                    break

                for item in items:
                    if not isinstance(item, dict) or "row" not in item:
                        raise RuntimeError("Dataset Viewer row 형식이 올바르지 않습니다.")
                    handle.write(
                        json.dumps(
                            item["row"],
                            ensure_ascii=False,
                            default=str,
                            separators=(",", ":"),
                        )
                        + "\n"
                    )
                    written += 1
                    if written >= limit:
                        break

                offset += len(items)
                logger.info("%s:%s 진행: %d/%d", target.key, config, written, limit)

                if len(items) < page_length:
                    break

            handle.flush()
            os.fsync(handle.fileno())

        if written == 0:
            raise RuntimeError(
                f"Dataset Viewer에서 행을 받지 못했습니다: {target.repo_id}/{config}/{split}"
            )

        tmp_path.replace(out_path)
        return written
    except BaseException:
        tmp_path.unlink(missing_ok=True)
        raise


# ---------------------------------------------------------------------------
# Full download
# ---------------------------------------------------------------------------


@retry(max_attempts=4, base_delay=3.0)
def _snapshot_download_with_retry(**kwargs: Any) -> str:
    from huggingface_hub import snapshot_download

    return snapshot_download(**kwargs)


def download_full(target: DownloadTarget, output_dir: Path, resume: bool = True) -> None:
    dest = output_dir / target.key
    dest.mkdir(parents=True, exist_ok=True)

    logger.info(
        "Full download 시작: %s (revision=%s) -> %s",
        target.repo_id,
        target.revision,
        dest,
    )

    local_dir = _snapshot_download_with_retry(
        repo_id=target.repo_id,
        repo_type="dataset",
        revision=target.revision,
        local_dir=str(dest),
        resume_download=resume,
        tqdm_class=None,
    )
    logger.info("Full download 완료: %s", local_dir)

    manifest = _load_manifest(output_dir)
    for path in sorted(Path(local_dir).rglob("*")):
        if (
            path.is_file()
            and path.name != MANIFEST_FILENAME
            and not path.name.endswith(PART_SUFFIX)
        ):
            _record_file(
                output_dir,
                manifest,
                path,
                source_method="snapshot_download",
                revision=target.revision,
            )

    manifest[f"{target.key}_revision"] = target.revision
    _save_manifest(output_dir, manifest)


# ---------------------------------------------------------------------------
# Sample download
# ---------------------------------------------------------------------------


def download_sample(target: DownloadTarget, output_dir: Path, n: int) -> None:
    if n <= 0:
        raise ValueError("--sample 값은 1 이상의 정수여야 합니다.")

    dest = output_dir / target.key
    dest.mkdir(parents=True, exist_ok=True)
    manifest = _load_manifest(output_dir)

    with requests.Session() as session:
        requested_configs = target.configs or (None,)

        for requested_config in requested_configs:
            config, split = _resolve_config_and_split(session, target, requested_config)
            out_name = (
                f"sample_{requested_config}.jsonl"
                if requested_config is not None
                else "sample.jsonl"
            )
            out_path = dest / out_name
            out_path.with_name(out_path.name + PART_SUFFIX).unlink(missing_ok=True)

            if _is_existing_sample_valid(
                output_dir,
                manifest,
                out_path,
                n,
                config,
                split,
            ):
                continue

            try:
                written = _download_viewer_rows(
                    session,
                    target,
                    config,
                    split,
                    out_path,
                    n,
                )
            except RuntimeError as exc:
                if config not in OPTIONAL_VIEWER_CONFIGS:
                    raise

                logger.warning(
                    "선택 config 건너뜀: %s/%s — Dataset Viewer가 응답하지 않습니다: %s",
                    target.repo_id,
                    config,
                    exc,
                )
                skipped = manifest.setdefault(f"{target.key}_skipped_sample_configs", [])
                if config not in skipped:
                    skipped.append(config)
                _save_manifest(output_dir, manifest)
                continue

            _record_file(
                output_dir,
                manifest,
                out_path,
                source_method="dataset_viewer_rows",
                sample_rows=written,
                dataset=target.repo_id,
                config=config,
                split=split,
                revision_guaranteed=False,
            )
            manifest[f"{target.key}_sample_source"] = "dataset_viewer_rows"
            manifest[f"{target.key}_sample_revision_guaranteed"] = False
            _save_manifest(output_dir, manifest)
            logger.info("Sample 저장 완료: %s (%d행)", out_path, written)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="VFBCAI Legal Intelligence Platform — Hugging Face 데이터셋 다운로드",
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--sample", type=int, metavar="N", help="앞 N개 행만 저메모리 다운로드")
    mode.add_argument("--full", action="store_true", help="전체 데이터셋 다운로드")

    parser.add_argument(
        "--dataset",
        choices=["all", "vbpl", "th1nhng0"],
        default="all",
        help="다운로드할 데이터셋 선택 (기본: all)",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=str(DEFAULT_OUTPUT_DIR),
        help=f"저장 경로 (기본: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--no-resume",
        action="store_true",
        help="Full 모드에서 기존 로컬 캐시를 무시하고 처음부터 다시 받기",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    if args.sample is not None and args.sample <= 0:
        parser.error("--sample 값은 1 이상의 정수여야 합니다.")

    output_dir = Path(args.output_dir).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    keys = ["vbpl", "th1nhng0"] if args.dataset == "all" else [args.dataset]
    targets = [TARGETS[key] for key in keys]

    try:
        for target in targets:
            if args.sample is not None:
                download_sample(target, output_dir, args.sample)
            else:
                download_full(target, output_dir, resume=not args.no_resume)
    except KeyboardInterrupt:
        logger.error("사용자가 다운로드를 중단했습니다.")
        return 130
    except Exception:
        logger.exception("다운로드 실패")
        return 1

    logger.info("전체 다운로드 작업 완료. manifest: %s", output_dir / MANIFEST_FILENAME)
    return 0


if __name__ == "__main__":
    sys.exit(main())
