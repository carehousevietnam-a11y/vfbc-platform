"""
문서 중복 제거 — 실제 실행 가능한 구현 (STEP1-1 지시사항의 5단계 우선순위 반영).

중복 판별 우선순위:
    1. Official URL 일치
    2. Official Document ID 일치 (sourceDocumentId, 단 동일 sourceDataset 내에서만 의미 있음 —
       서로 다른 데이터셋의 sourceDocumentId는 독립적인 채번 체계이므로 교차 매칭에는
       사용하지 않는다)
    3. documentNumber + issueDate + issuingAuthority 일치
    4. title + issueDate + issuingAuthority 일치 (제목 정규화 후 비교)
    5. contentHash 일치 (보조키로만 사용 — 위 1~4 중 어느 것도 성립하지 않을 때만 참고,
       단독으로 병합을 확정하지 않고 duplicate-report.json에 "weak match"로만 기록)

⚠️ 이번 STEP1-1에서는 실행하지 않는다(정규화된 데이터가 없음). normalize_documents.py
   실행 후 huggingface.co 접근 가능한 환경에서 실행할 것.

실행 방법:
    python -m src.deduplicate_documents \
        --input data/normalized/documents.jsonl \
        --output-dir data/normalized \
        --reports-dir reports

단위 테스트: tests/test_deduplicate_documents.py
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger("legal_rag.dedup")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

_TITLE_NORMALIZE_RE = re.compile(r"[^\w\s]", re.UNICODE)
_WHITESPACE_RE = re.compile(r"\s+")


def _normalize_title_for_match(title: str | None) -> str | None:
    if not title:
        return None
    t = title.strip().lower()
    t = _TITLE_NORMALIZE_RE.sub("", t)
    t = _WHITESPACE_RE.sub(" ", t).strip()
    return t or None


def _doc_number_key(doc: dict) -> str | None:
    numbers = doc.get("documentNumber") or []
    if not numbers:
        return None
    return "|".join(sorted(n.strip().lower() for n in numbers if n))


@dataclass
class DedupGroup:
    canonical_document_id: str
    member_document_ids: list[str] = field(default_factory=list)
    match_tier: int = 0  # 1~5, 어느 우선순위 규칙으로 병합됐는지
    match_key: str = ""


@dataclass
class DedupOutcome:
    groups: list[DedupGroup] = field(default_factory=list)
    weak_matches: list[dict] = field(default_factory=list)  # tier 5(content hash)만 일치하는 쌍
    total_input: int = 0
    total_after_dedup: int = 0


def _pick_canonical(members: list[dict]) -> dict:
    """
    그룹 내에서 대표 레코드 선정.
    우선순위: originalText가 있는 것 > sourceDataset이 tmquan인 것(정제도 높음, README 근거) >
              나머지는 documentId 사전순(재현성 위해 결정적 규칙 사용).
    """

    def score(doc: dict) -> tuple:
        has_body = 1 if doc.get("originalText") else 0
        is_tmquan = 1 if doc.get("sourceDataset") == "tmquan_vbpl_vn" else 0
        return (-has_body, -is_tmquan, doc.get("documentId", ""))

    return sorted(members, key=score)[0]


def deduplicate(documents: list[dict]) -> DedupOutcome:
    outcome = DedupOutcome(total_input=len(documents))

    # tier별 인덱스: key -> [documentId, ...]
    by_url: dict[str, list[dict]] = {}
    by_source_doc_id: dict[tuple[str, str], list[dict]] = {}
    by_docnum_date_authority: dict[tuple, list[dict]] = {}
    by_title_date_authority: dict[tuple, list[dict]] = {}
    by_content_hash: dict[str, list[dict]] = {}

    for doc in documents:
        if doc.get("officialUrl"):
            by_url.setdefault(doc["officialUrl"], []).append(doc)

        key_src = (doc.get("sourceDataset", ""), doc.get("sourceDocumentId", ""))
        by_source_doc_id.setdefault(key_src, []).append(doc)

        dn_key = _doc_number_key(doc)
        if dn_key and doc.get("issueDate") and doc.get("issuingAuthority"):
            key = (dn_key, doc["issueDate"], doc["issuingAuthority"].strip().lower())
            by_docnum_date_authority.setdefault(key, []).append(doc)

        title_key = _normalize_title_for_match(doc.get("title"))
        if title_key and doc.get("issueDate") and doc.get("issuingAuthority"):
            key = (title_key, doc["issueDate"], doc["issuingAuthority"].strip().lower())
            by_title_date_authority.setdefault(key, []).append(doc)

        if doc.get("contentHash"):
            by_content_hash.setdefault(doc["contentHash"], []).append(doc)

    assigned: dict[str, str] = {}  # documentId -> group representative documentId
    groups: dict[str, DedupGroup] = {}

    def _merge(members: list[dict], tier: int, match_key: str) -> None:
        if len(members) < 2:
            return
        ids = [m["documentId"] for m in members]
        existing_group_reps = {assigned[i] for i in ids if i in assigned}

        if existing_group_reps:
            rep = sorted(existing_group_reps)[0]
        else:
            rep = _pick_canonical(members)["documentId"]

        group = groups.setdefault(
            rep, DedupGroup(canonical_document_id=rep, match_tier=tier, match_key=match_key)
        )
        for i in ids:
            if i not in group.member_document_ids:
                group.member_document_ids.append(i)
            assigned[i] = rep

    # 우선순위 1: Official URL
    for url, members in by_url.items():
        _merge(members, tier=1, match_key=f"officialUrl={url}")

    # 우선순위 2: (sourceDataset, sourceDocumentId) — 동일 소스 내 중복(재크롤링 등) 탐지용
    for key, members in by_source_doc_id.items():
        _merge(members, tier=2, match_key=f"sourceDocId={key}")

    # 우선순위 3: documentNumber + issueDate + issuingAuthority
    for key, members in by_docnum_date_authority.items():
        _merge(members, tier=3, match_key=f"docNum+date+authority={key}")

    # 우선순위 4: title + issueDate + issuingAuthority
    for key, members in by_title_date_authority.items():
        _merge(members, tier=4, match_key=f"title+date+authority={key}")

    outcome.groups = list(groups.values())

    # 우선순위 5: contentHash — 위 1~4로 이미 묶이지 않은 것만 "weak match"로 별도 기록
    # (자동 병합하지 않음 — VFBCAI 마스터문서 16장 "허위 데이터 절대 금지"와 동일 취지로,
    #  본문이 같다는 사실만으로 서로 다른 문서번호/제목을 가진 레코드를 단정적으로 합치지 않는다)
    for content_hash, members in by_content_hash.items():
        ids = [m["documentId"] for m in members]
        if len(ids) < 2:
            continue
        reps = {assigned.get(i, i) for i in ids}
        if len(reps) > 1:
            outcome.weak_matches.append(
                {
                    "contentHash": content_hash,
                    "documentIds": ids,
                    "note": "본문 해시는 같지만 tier1~4 규칙으로는 병합되지 않음 — 수동 확인 필요",
                }
            )

    deduped_ids = set(assigned.values()) | (
        set(d["documentId"] for d in documents) - set(assigned.keys())
    )
    outcome.total_after_dedup = len(deduped_ids)
    return outcome


# ---------------------------------------------------------------------------
# 파일 입출력
# ---------------------------------------------------------------------------


def load_documents(path: Path) -> list[dict]:
    docs = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                docs.append(json.loads(line))
    return docs


def write_deduped(documents: list[dict], outcome: DedupOutcome, output_path: Path) -> None:
    dropped = set()
    for group in outcome.groups:
        for member_id in group.member_document_ids:
            if member_id != group.canonical_document_id:
                dropped.add(member_id)

    with output_path.open("w", encoding="utf-8") as f:
        for doc in documents:
            if doc["documentId"] not in dropped:
                f.write(json.dumps(doc, ensure_ascii=False) + "\n")


def write_report(outcome: DedupOutcome, report_path: Path) -> None:
    report = {
        "total_input": outcome.total_input,
        "total_after_dedup": outcome.total_after_dedup,
        "duplicate_groups": [
            {
                "canonicalDocumentId": g.canonical_document_id,
                "memberDocumentIds": g.member_document_ids,
                "matchTier": g.match_tier,
                "matchKey": g.match_key,
            }
            for g in outcome.groups
            if len(g.member_document_ids) > 1
        ],
        "weak_matches_content_hash_only": outcome.weak_matches,
    }
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="VFBCAI Legal Intelligence Platform — 중복 제거")
    parser.add_argument("--input", type=str, default="data/normalized/documents.jsonl")
    parser.add_argument("--output-dir", type=str, default="data/normalized")
    parser.add_argument("--reports-dir", type=str, default="reports")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    input_path = Path(args.input)
    if not input_path.exists():
        logger.error("입력 파일이 없습니다: %s (normalize_documents.py를 먼저 실행하세요)", input_path)
        return 1

    documents = load_documents(input_path)
    outcome = deduplicate(documents)

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    write_deduped(documents, outcome, output_dir / "documents_deduped.jsonl")

    reports_dir = Path(args.reports_dir)
    reports_dir.mkdir(parents=True, exist_ok=True)
    write_report(outcome, reports_dir / "duplicate-report.json")

    logger.info(
        "중복 제거 완료: 입력 %d개 -> 결과 %d개 (중복 그룹 %d개)",
        outcome.total_input, outcome.total_after_dedup,
        len([g for g in outcome.groups if len(g.member_document_ids) > 1]),
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
