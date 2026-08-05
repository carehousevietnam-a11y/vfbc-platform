"""
Work Permit(노동허가) Pilot Corpus 추출 스텁 (Pipeline.md [7]단계 참고).

1. 키워드 매치로 시드 문서 선정
2. legal_relationships 그래프 순회(개정/폐지/참조)로 연결 문서까지 확장
3. matched_keywords / relation_depth / included_reason 기록 (단순 키워드
   포함만으로 저장하지 않는다는 원 지시사항 반영)

VFBCAI checkDiagnosis.ts와는 이번 단계에서 연결하지 않는다
(Architecture.md 6장 통합 경계 참고).

TODO: 전체 구현.
"""

from __future__ import annotations

WORK_PERMIT_KEYWORDS = [
    "giấy phép lao động",
    "người lao động nước ngoài",
    "người nước ngoài làm việc tại Việt Nam",
    "miễn giấy phép lao động",
    "xác nhận không thuộc diện cấp giấy phép lao động",
    "phiếu lý lịch tư pháp",
    "giấy chứng nhận sức khỏe",
    "văn bản xác nhận kinh nghiệm",
    "bằng cấp",
    "dịch thuật",
    "chứng thực",
    "hợp pháp hóa lãnh sự",
]


def find_seed_documents(chunks_path: str, keywords: list[str] = WORK_PERMIT_KEYWORDS) -> list[str]:
    """키워드 매치 시드 문서 documentId 목록 반환. TODO: 구현."""
    raise NotImplementedError("STEP1 재개 시 구현")


def expand_via_relationships(
    seed_document_ids: list[str], relationships_path: str, max_depth: int = 2
) -> list[dict]:
    """관계 그래프 순회로 확장 + included_reason 기록. TODO: 구현."""
    raise NotImplementedError("STEP1 재개 시 구현")


if __name__ == "__main__":
    raise SystemExit("이 스크립트는 설계 스텁입니다. parse_legal_structure.py 실행 후 구현하세요.")
