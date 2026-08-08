"""
관계(Relationship) 정규화 — 실제 실행 가능한 구현.

두 가지 산출물을 생성한다:
1. Cross-document relations: th1nhng0 relationships raw -> RelationshipEdge
   (원본 방향 doc_id -> other_doc_id 그대로 보존, relation_type은 표준 enum으로
   매핑하되 미분류 라벨은 "unknown"으로 보존하고 별도 리포트에 기록)
2. Internal relations: 문서 본문 내부의 자기참조 표현("Khoản 2 Điều này" 등)을
   정규식으로 추출해 문서 내부 chunk 간 관계로 별도 생성 (cross-document와 혼합하지 않음)

⚠️ 이번 STEP1-1에서는 실행하지 않는다. normalize_documents.py(+ id 매핑) 완료 후
   huggingface.co 접근 가능한 환경에서 실행할 것.

실행 방법:
    python -m src.normalize_relations \
        --relationships-raw data/raw/th1nhng0/relationships.parquet \
        --documents data/normalized/documents_deduped.jsonl \
        --chunks data/normalized/chunks.jsonl \
        --output-dir data/normalized \
        --reports-dir reports

단위 테스트: tests/test_normalize_relations.py
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Iterator

from .audit_datasets import iter_records
from .schema import InternalRelation, RelationshipEdge, RelationType, SourceDataset

logger = logging.getLogger("legal_rag.relations")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

VIETNAMESE_LEGAL_DOCS_REVISION = "0a39ad7eae8e6c188cb225c4b1443c3b346461d8"

# ---------------------------------------------------------------------------
# raw label -> RelationType 매핑 (패턴 기반, best-effort)
#
# 주의: th1nhng0 relationships의 실제 relationship 라벨 값 종류·분포는 아직
# 확인되지 않았다(huggingface.co 접근 불가로 미조사). 아래 패턴은 베트남 법제처
# 문서 관계 표현의 일반적 어휘를 근거로 한 잠정 매핑이며, audit_datasets.py의
# relationship-quality 결과로 검증·보강이 필요하다. 매칭되지 않는 라벨은 절대
# 추측으로 분류하지 않고 "unknown"으로 보존한다(rawRelationLabel은 항상 원본
# 그대로 유지).
# ---------------------------------------------------------------------------

_RELATION_PATTERNS: list[tuple[re.Pattern, RelationType]] = [
    (re.compile(r"sửa\s*đổi|bổ\s*sung|amend", re.IGNORECASE), RelationType.AMENDS),
    (re.compile(r"bãi\s*bỏ|hết\s*hiệu\s*lực|repeal", re.IGNORECASE), RelationType.REPEALS),
    (re.compile(r"thay\s*thế toàn bộ|supersede", re.IGNORECASE), RelationType.SUPERSEDES),
    (re.compile(r"thay\s*thế|replace", re.IGNORECASE), RelationType.SUPERSEDES),
    (re.compile(r"hướng\s*dẫn|quy\s*định\s*chi\s*tiết|implement", re.IGNORECASE), RelationType.IMPLEMENTS),
    (re.compile(r"dẫn\s*chiếu|căn\s*cứ|liên\s*quan|reference|cite", re.IGNORECASE), RelationType.REFERENCES),
]


def map_relation_type(raw_label: str | None) -> RelationType:
    if not raw_label:
        return RelationType.UNKNOWN
    for pattern, rel_type in _RELATION_PATTERNS:
        if pattern.search(raw_label):
            return rel_type
    return RelationType.UNKNOWN


# ---------------------------------------------------------------------------
# Cross-document relations
# ---------------------------------------------------------------------------


def normalize_relationship_rows(
    rows: Iterator[dict], id_prefix: str = "th1nhng0"
) -> tuple[list[RelationshipEdge], Counter]:
    """
    raw relationships 행(doc_id, other_doc_id, relationship)을 RelationshipEdge로 변환.
    원본 방향(doc_id -> other_doc_id)을 그대로 보존한다 — 방향을 임의로 뒤집지 않는다.
    """
    edges: list[RelationshipEdge] = []
    unknown_label_counts: Counter = Counter()

    for row in rows:
        source_raw = row.get("doc_id")
        target_raw = row.get("other_doc_id")
        raw_label = row.get("relationship")
        if source_raw is None or target_raw is None:
            continue

        rel_type = map_relation_type(raw_label)
        if rel_type == RelationType.UNKNOWN:
            unknown_label_counts[str(raw_label)] += 1

        source_id = f"{id_prefix}:{source_raw}"
        target_id = f"{id_prefix}:{target_raw}"
        edge_id = f"{source_id}->{target_id}:{rel_type.value}"

        edges.append(
            RelationshipEdge(
                edgeId=edge_id,
                sourceDocumentId=source_id,
                targetDocumentId=target_id,
                relationType=rel_type.value,
                rawRelationLabel=str(raw_label) if raw_label is not None else None,
                sourceDataset=SourceDataset.TH1NHNG0_METADATA.value,
                confidence=None,  # 원본 그래프를 그대로 사용, 자체 추론 아님
            )
        )

    return edges, unknown_label_counts


# ---------------------------------------------------------------------------
# Internal relations (문서 내부 자기참조)
# ---------------------------------------------------------------------------

# "Khoản 2 Điều này" / "khoản này" / "Điều 5 của Nghị định này" 류의 자기참조 표현
_INTERNAL_REF_PATTERNS = [
    re.compile(r"[Kk]hoản\s+(\d+)\s+[Đđ]iều\s+này"),
    re.compile(r"[Đđ]iều\s+(\d+)\s+(?:của\s+)?(?:[Nn]ghị\s+định|[Tt]hông\s+tư|[Ll]uật)\s+này"),
    re.compile(r"[Kk]hoản\s+này"),
    re.compile(r"[Đđ]iểm\s+này"),
]


def extract_internal_relations(document_id: str, chunk_id: str, text: str) -> list[InternalRelation]:
    """
    chunk 본문에서 자기참조 표현을 찾아 InternalRelation 리스트 생성.
    참조 대상 chunk를 정확히 특정할 수 없는 경우(예: "khoản này"는 문맥 의존적)
    targetChunkId는 None으로 두고 targetRawRef만 원문 그대로 보존한다.
    """
    relations: list[InternalRelation] = []
    for pattern in _INTERNAL_REF_PATTERNS:
        for m in pattern.finditer(text):
            target_chunk_id = None
            groups = m.groups()
            if groups and groups[0] and groups[0].isdigit():
                # "Khoản N Điều này" -> 같은 Điều 내부의 Khoản N을 가리킬 가능성이 높음
                dieu_prefix = chunk_id.split(".khoan")[0]  # 상위 Điều chunkId 추정
                target_chunk_id = f"{dieu_prefix}.khoan{groups[0]}"

            relations.append(
                InternalRelation(
                    edgeId=f"{chunk_id}#internal#{len(relations)}",
                    documentId=document_id,
                    sourceChunkId=chunk_id,
                    targetChunkId=target_chunk_id,
                    targetRawRef=m.group(0),
                    relationType="references",
                )
            )
    return relations


# ---------------------------------------------------------------------------
# 파이프라인 실행
# ---------------------------------------------------------------------------


def run_cross_document(relationships_raw_path: Path, output_dir: Path, reports_dir: Path) -> int:
    rows = iter_records(relationships_raw_path)
    edges, unknown_counts = normalize_relationship_rows(rows)

    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / "relationships.jsonl"
    with out_path.open("w", encoding="utf-8") as f:
        for edge in edges:
            f.write(json.dumps(edge.to_dict(), ensure_ascii=False) + "\n")

    reports_dir.mkdir(parents=True, exist_ok=True)
    (reports_dir / "relationship-quality.json").write_text(
        json.dumps(
            {
                "total_edges": len(edges),
                "relation_type_counts": dict(
                    Counter(e.relationType for e in edges).most_common()
                ),
                "unmapped_raw_labels_needing_manual_review": dict(
                    unknown_counts.most_common(100)
                ),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    logger.info("Cross-document 관계 정규화 완료: %d개 edge -> %s", len(edges), out_path)
    return len(edges)


def run_internal(chunks_path: Path, output_dir: Path) -> int:
    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / "internal_relations.jsonl"

    total = 0
    with chunks_path.open("r", encoding="utf-8") as in_f, out_path.open(
        "w", encoding="utf-8"
    ) as out_f:
        for line in in_f:
            line = line.strip()
            if not line:
                continue
            chunk = json.loads(line)
            relations = extract_internal_relations(
                chunk["documentId"], chunk["chunkId"], chunk.get("text", "")
            )
            for rel in relations:
                out_f.write(json.dumps(rel.to_dict(), ensure_ascii=False) + "\n")
                total += 1

    logger.info("Internal 관계 추출 완료: %d개 -> %s", total, out_path)
    return total


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="VFBCAI Legal Intelligence Platform — 관계 정규화")
    parser.add_argument("--relationships-raw", type=str, default="data/raw/th1nhng0/relationships.parquet")
    parser.add_argument("--chunks", type=str, default="data/normalized/chunks.jsonl")
    parser.add_argument("--output-dir", type=str, default="data/normalized")
    parser.add_argument("--reports-dir", type=str, default="reports")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    relationships_path = Path(args.relationships_raw)
    if relationships_path.exists():
        run_cross_document(relationships_path, Path(args.output_dir), Path(args.reports_dir))
    else:
        logger.warning(
            "relationships raw 파일이 없어 cross-document 관계 정규화를 건너뜁니다: %s",
            relationships_path,
        )

    chunks_path = Path(args.chunks)
    if chunks_path.exists():
        run_internal(chunks_path, Path(args.output_dir))
    else:
        logger.warning(
            "chunks 파일이 없어 internal 관계 추출을 건너뜁니다: %s (parse_legal_structure.py 먼저 실행)",
            chunks_path,
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
