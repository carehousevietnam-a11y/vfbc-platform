"""
VFBCAI Legal Intelligence Platform — 다국어 법률 용어 사전 (Ontology 기반).

Google Translate, 외부 번역 API, LLM을 사용하지 않는다. 법률 개념(concept) 단위로
표준 베트남어 표현(canonical_vi)과 한국어/영어/중국어/베트남어 동의어를 직접
등록한 사전만 사용한다.

⚠️ 이 모듈은 search_engine.py/search_exact.py/search_keyword.py 등 기존 검색
   로직을 전혀 참조하지 않는다 — 순수 사전 조회 유틸리티다.

구조:
    LEGAL_TERMS[concept_key] = {
        "canonical_vi": str,      # 검색에 항상 사용할 표준 베트남어 표현
        "ko": list[str],
        "en": list[str],
        "zh": list[str],
        "vi": list[str],          # canonical_vi 자체 + 비공식 변형(성조 생략 등) 포함
    }

향후 다른 법률 개념(예: 거주증/TRC, 임시거주등록/땀주 등)을 추가할 때는
LEGAL_TERMS에 새 key만 추가하면 된다 — 조회 로직(lookup_canonical_vi 등)은
수정할 필요가 없다.
"""

from __future__ import annotations

import unicodedata

# ---------------------------------------------------------------------------
# 법률 개념 사전
# ---------------------------------------------------------------------------

LEGAL_TERMS: dict[str, dict[str, object]] = {
    "work_permit": {
        "canonical_vi": "giấy phép lao động",
        "ko": [
            "노동허가",
            "노동 허가",
            "취업허가",
            "취업 허가",
            "근로허가",
            "근로 허가",
        ],
        "en": [
            "work permit",
            "employment permit",
            "labor permit",
            "labour permit",
        ],
        "zh": [
            "工作许可证",
            "工作许可",
            "劳动许可证",
            "劳动许可",
        ],
        "vi": [
            "giấy phép lao động",
            "giay phep lao dong",
        ],
    },
}


# ---------------------------------------------------------------------------
# 조회용 정규화 + 인덱스
# ---------------------------------------------------------------------------


def _normalize_term(term: str) -> str:
    """사전 조회 전용 정규화: Unicode NFC + 소문자 + trim + 연속 공백 정리.

    ⚠️ 이 정규화는 사전 "조회 키"를 만드는 데만 쓰인다. 검색 엔진에 실제로
    전달되는 질의 문자열(canonical_vi 또는 원문)에는 영향을 주지 않는다.
    """
    if not term:
        return ""
    text = unicodedata.normalize("NFC", term).strip().lower()
    return " ".join(text.split())


def _build_lookup_index() -> dict[str, str]:
    """모든 개념의 모든 언어 동의어(정규화됨) -> canonical_vi 매핑을 1회 생성."""
    index: dict[str, str] = {}
    for concept in LEGAL_TERMS.values():
        canonical_vi = str(concept["canonical_vi"])
        index[_normalize_term(canonical_vi)] = canonical_vi
        for lang in ("ko", "en", "zh", "vi"):
            for term in concept.get(lang, []) or []:
                index[_normalize_term(str(term))] = canonical_vi
    return index


_LOOKUP_INDEX: dict[str, str] = _build_lookup_index()


def lookup_canonical_vi(term: str) -> str | None:
    """임의 언어의 법률 용어를 canonical_vi(표준 베트남어 표현)로 변환.

    사전에 없으면 None을 반환한다 — 호출자(query_normalizer.py)가 이 경우
    원문을 그대로 사용하도록 처리한다.
    """
    if not term:
        return None
    return _LOOKUP_INDEX.get(_normalize_term(term))


def all_concepts() -> list[str]:
    """등록된 법률 개념 key 목록 (테스트/디버깅용)."""
    return list(LEGAL_TERMS.keys())
