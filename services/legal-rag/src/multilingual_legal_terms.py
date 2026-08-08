"""
VFBCAI Legal Intelligence Platform — 다국어 법률 용어 사전 (Ontology 기반).

Google Translate, 외부 번역 API, LLM을 사용하지 않는다. 법률 개념(concept) 단위로
표준 베트남어 표현(canonical_vi)과 한국어/영어/중국어/베트남어 동의어를 직접
등록한 사전만 사용한다.
"""

from __future__ import annotations

import unicodedata

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
            "외국인 노동허가",
            "외국인 노동 허가",
            "노동허가 경력",
            "노동허가 경력 요건",
            "경력 요건",
            "노동허가 신청",
            "노동허가 갱신",
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
            "người lao động nước ngoài",
        ],
    },
    "trc": {
        "canonical_vi": "thẻ tạm thường trú",
        "ko": [
            "거주증",
            "거주 증",
            "trc",
            "거주증 갱신",
            "거주증 신청",
            "임시거주증",
            "거주증 발급",
            "거주증 조건",
        ],
        "en": [
            "temporary residence card",
            "trc",
            "residence card",
        ],
        "zh": [
            "临时居留证",
            "居留证",
        ],
        "vi": [
            "thẻ tạm thường trú",
            "the tam thuong tru",
            "giấy tạm thường trú",
        ],
    },
    "tamtru": {
        "canonical_vi": "tạm trú",
        "ko": [
            "땀주",
            "임시거주",
            "임시 거주",
            "임시거주등록",
            "임시거주 등록",
            "임시거주등록 기한",
            "임시거주 신고",
            "임시체류",
        ],
        "en": [
            "temporary residence registration",
            "tam tru",
        ],
        "zh": [
            "临时居留登记",
            "暂住登记",
        ],
        "vi": [
            "tạm trú",
            "tam tru",
            "đăng ký tạm trú",
        ],
    },
    "driving_license": {
        "canonical_vi": "giấy phép lái xe",
        "ko": [
            "운전면허",
            "운전 면허",
            "운전면허 전환",
            "운전면허 신규",
            "운전면허 갱신",
            "국제운전면허",
        ],
        "en": [
            "driving license",
            "driver license",
        ],
        "zh": [
            "驾驶证",
            "驾驶执照",
        ],
        "vi": [
            "giấy phép lái xe",
            "giay phep lai xe",
        ],
    },
    "verify_fraud": {
        "canonical_vi": "lừa đảo",
        "ko": [
            "부동산 사기",
            "부동산 사기 계약",
            "사기 계약",
            "사기 거래",
            "사기",
            "사기성 계약",
            "사기 피해",
        ],
        "en": [
            "real estate fraud",
            "fraudulent contract",
            "property fraud",
            "scam contract",
        ],
        "zh": [
            "房产诈骗",
            "欺诈合同",
            "合同诈骗",
        ],
        "vi": [
            "lừa đảo",
            "gian lận",
            "hợp đồng giả mạo",
        ],
    },
    "verify_real_estate": {
        "canonical_vi": "hợp đồng thuê nhà",
        "ko": [
            "임대 계약",
            "임대계약",
            "임대 계약 분쟁",
            "임대 분쟁",
            "임대차",
            "임차",
            "부동산 임대",
            "전세",
            "월세",
        ],
        "en": [
            "rental contract",
            "lease dispute",
            "tenancy agreement",
            "landlord tenant",
        ],
        "zh": [
            "租赁合同",
            "租赁纠纷",
            "租房合同",
        ],
        "vi": [
            "hợp đồng thuê nhà",
            "hợp đồng thuê",
            "thuê nhà",
            "cho thuê nhà",
        ],
    },
}


def _normalize_term(term: str) -> str:
    if not term:
        return ""
    text = unicodedata.normalize("NFC", term).strip().lower()
    return " ".join(text.split())


def _build_lookup_index() -> dict[str, str]:
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
    if not term:
        return None
    return _LOOKUP_INDEX.get(_normalize_term(term))


def list_canonical_vi_terms() -> list[str]:
    """Unique canonical Vietnamese terms for translation-layer few-shot guidance."""
    seen: set[str] = set()
    terms: list[str] = []
    for concept in LEGAL_TERMS.values():
        canonical = str(concept["canonical_vi"])
        if canonical not in seen:
            seen.add(canonical)
            terms.append(canonical)
    return terms


def extract_partial_ontology_matches(query: str) -> list[str]:
    """Return canonical_vi terms whose registered synonyms appear inside the query."""
    normalized_query = _normalize_term(query)
    if not normalized_query:
        return []

    hits: list[tuple[int, str]] = []
    for synonym, canonical in _LOOKUP_INDEX.items():
        if len(synonym) < 2:
            continue
        if synonym in normalized_query:
            hits.append((len(synonym), canonical))

    if not hits:
        return []

    hits.sort(key=lambda item: item[0], reverse=True)
    ordered: list[str] = []
    seen: set[str] = set()
    for _, canonical in hits:
        if canonical in seen:
            continue
        seen.add(canonical)
        ordered.append(canonical)
    return ordered


def all_concepts() -> list[str]:
    return list(LEGAL_TERMS.keys())
