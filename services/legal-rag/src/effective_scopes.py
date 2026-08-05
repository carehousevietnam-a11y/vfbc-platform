"""
legal_effective_scopes 빌더 — 실제 실행 가능한 구현 (STEP1-1 신규 요구사항).

목적: 문서 전체가 아니라 article(Điều)/khoản/điểm 단위로 효력 상태가 달라지는
"부분 실효"를 표현할 수 있는 레코드를 생성한다(schema.py의 EffectiveScope 참고).

⚠️ 데이터 한계(정직하게 명시): 현재 확보 가능한 소스 데이터
   (th1nhng0/vietnamese-legal-documents의 relationships config)는 **문서 단위**
   관계만 제공하며, "이 개정이 몇 조 몇 항을 바꾸는지" 같은 article-level 세부
   정보는 원본 데이터에 없다. 따라서 이 빌더는:
   - 관계가 없는 chunk: 문서 전체 status를 그대로 상속한 EffectiveScope 1건 생성
     (article_no/clause_no/item_no = 해당 chunk의 값, source_relation_id = None)
   - 문서 단위 relationType이 repeals/replaces/supersedes인 관계가 있는 문서:
     그 문서에 속한 **모든** chunk에 대해 effective_to를 채운 EffectiveScope 생성
     (article 단위로 정밀하게 구분하지 못함 — 이는 한계이지 결함이 아니며, 향후
     원문에서 "Điều N của ... hết hiệu lực kể từ ..." 같은 명시적 조문 단위 폐지
     문구를 파싱하는 추가 로직이 필요하다. 이번 STEP1-1에서는 구현하지 않는다.)

⚠️ 이번 STEP1-1에서는 실행하지 않는다. normalize_relations.py + parse_legal_structure.py
   완료 후 huggingface.co 접근 가능한 환경에서 실행할 것.

실행 방법:
    python -m src.effective_scopes \
        --chunks data/normalized/chunks.jsonl \
        --documents data/normalized/documents_deduped.jsonl \
        --relationships data/normalized/relationships.jsonl \
        --output data/normalized/effective_scopes.jsonl

단위 테스트: tests/test_effective_scopes.py
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from pathlib import Path

from .schema import EffectiveScope, RelationType

logger = logging.getLogger("legal_rag.effective_scopes")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

_SCOPE_ENDING_RELATIONS = {RelationType.REPEALS.value, RelationType.REPLACES.value, RelationType.SUPERSEDES.value}

_DIEU_NO_RE = re.compile(r"Điều\s+(\d+)", re.IGNORECASE)
_KHOAN_NO_RE = re.compile(r"Khoản\s+(\d+)", re.IGNORECASE)
_DIEM_NO_RE = re.compile(r"Điểm\s+([a-zđ])", re.IGNORECASE)


def _extract_article_ids(chunk: dict) -> tuple[str | None, str | None, str | None]:
    path = chunk.get("path", "")
    dieu_m = _DIEU_NO_RE.search(path)
    khoan_m = _KHOAN_NO_RE.search(path)
    diem_m = _DIEM_NO_RE.search(path)
    return (
        dieu_m.group(1) if dieu_m else None,
        khoan_m.group(1) if khoan_m else None,
        diem_m.group(1) if diem_m else None,
    )


def build_effective_scopes(
    chunks: list[dict], documents_by_id: dict[str, dict], relationships: list[dict]
) -> list[EffectiveScope]:
    # 문서별로 "이 문서를 종료시키는" 관계가 있는지 인덱싱
    ending_relations_by_target: dict[str, dict] = {}
    for edge in relationships:
        if edge.get("relationType") in _SCOPE_ENDING_RELATIONS:
            target = edge.get("targetDocumentId")
            if target and target not in ending_relations_by_target:
                ending_relations_by_target[target] = edge

    scopes: list[EffectiveScope] = []
    for chunk in chunks:
        document_id = chunk["documentId"]
        doc = documents_by_id.get(document_id, {})
        article_no, clause_no, item_no = _extract_article_ids(chunk)

        ending_edge = ending_relations_by_target.get(document_id)

        if ending_edge:
            scopes.append(
                EffectiveScope(
                    document_id=document_id,
                    article_no=article_no,
                    clause_no=clause_no,
                    item_no=item_no,
                    status=doc.get("status", "unknown"),
                    effective_from=doc.get("effectiveDate") or doc.get("issueDate"),
                    effective_to=doc.get("expiryDate"),  # None일 수 있음(원본에 날짜 없는 경우)
                    source_relation_id=ending_edge.get("edgeId"),
                )
            )
        else:
            scopes.append(
                EffectiveScope(
                    document_id=document_id,
                    article_no=article_no,
                    clause_no=clause_no,
                    item_no=item_no,
                    status=doc.get("status", "unknown"),
                    effective_from=doc.get("effectiveDate") or doc.get("issueDate"),
                    effective_to=None,
                    source_relation_id=None,
                )
            )

    return scopes


# ---------------------------------------------------------------------------
# 파이프라인 실행
# ---------------------------------------------------------------------------


def _load_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def run(chunks_path: Path, documents_path: Path, relationships_path: Path, output_path: Path) -> int:
    chunks = _load_jsonl(chunks_path)
    documents = _load_jsonl(documents_path)
    relationships = _load_jsonl(relationships_path)

    documents_by_id = {d["documentId"]: d for d in documents}
    scopes = build_effective_scopes(chunks, documents_by_id, relationships)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        for scope in scopes:
            f.write(json.dumps(scope.to_dict(), ensure_ascii=False) + "\n")

    logger.info("effective_scopes 생성 완료: %d건 -> %s", len(scopes), output_path)
    return len(scopes)


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="VFBCAI Legal Intelligence Platform — legal_effective_scopes 생성"
    )
    parser.add_argument("--chunks", type=str, default="data/normalized/chunks.jsonl")
    parser.add_argument("--documents", type=str, default="data/normalized/documents_deduped.jsonl")
    parser.add_argument("--relationships", type=str, default="data/normalized/relationships.jsonl")
    parser.add_argument("--output", type=str, default="data/normalized/effective_scopes.jsonl")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)
    run(Path(args.chunks), Path(args.documents), Path(args.relationships), Path(args.output))
    return 0


if __name__ == "__main__":
    sys.exit(main())
