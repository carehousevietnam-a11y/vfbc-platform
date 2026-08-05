"""
VFBCAI Legal Intelligence Platform — Search Result Localizer (STEP4).

검색은 항상 베트남 법령 원문 기준으로 수행된다 — 이 모듈은 Search Algorithm/
Ranking/MatchType/Score에 전혀 관여하지 않는다. 이미 계산된 `SearchResult`를
입력받아, 사용자가 선택한 언어(ko/en/zh/vi)로 "표시용" 라벨만 추가한
`LocalizedSearchResult`를 새로 만들어 반환하는 순수 출력 단계다.

Google Translate, 그 외 외부 번역 API, OpenAI를 사용하지 않는다 — 법률 용어
사전(Ontology) + 이 모듈 전용 Localizer Dictionary 조회(O(1))로만 동작한다.
자유 문장 전체를 기계번역하지 않고, 사전에 등록된 구간만 원문 안에서
치환하는 "부분 치환" 방식을 쓴다(허위/과장 번역을 만들지 않기 위함).

⚠️ `SearchResult`는 절대 변경(mutate)하지 않는다 — 새 dataclass만 생성해
   반환하며, 입력으로 받은 SearchResult 인스턴스는 그대로 보존된다.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

from .search_models import Document, SearchResult

# ---------------------------------------------------------------------------
# 지원 언어
# ---------------------------------------------------------------------------

SUPPORTED_LANGUAGES = ("ko", "en", "zh", "vi")
DEFAULT_LANGUAGE = "vi"  # language=None -> 자동 베트남어(STEP4 지시사항)

GENERIC_DOCUMENT_LABEL = {"vi": "Văn bản", "ko": "문서", "en": "Document", "zh": "文件"}


def _resolve_language(language: str | None) -> str:
    return language if language in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE


def _normalize(text: str | None) -> str:
    """조회 키 생성 전용 정규화: Unicode NFC + 소문자 + trim + 연속 공백 정리."""
    if not text:
        return ""
    normalized = unicodedata.normalize("NFC", text).strip().lower()
    return " ".join(normalized.split())


# ---------------------------------------------------------------------------
# Localizer Dictionary — 카테고리별 concept -> {ko,en,zh,vi} 라벨.
# 향후 다른 개념을 추가할 때는 딕셔너리에 항목만 추가하면 된다(조회 로직 무변경).
#
# 실 데이터셋(tmquan/th1nhng0 혼합)에는 문서유형이 slug("nghi_dinh")/영문
# ("Decision")/베트남어 원문("Quyết định") 표기로 섞여 들어온다(STEP1에서 이미
# 확인된 데이터 커버리지 한계, Dataset은 이번 STEP에서 수정하지 않음). 각
# concept에 알려진 원문 표기 변주를 raw_aliases로 등록해 최대한 흡수한다.
# ---------------------------------------------------------------------------

DOCUMENT_TYPE_DICTIONARY: dict[str, dict] = {
    "law": {
        "raw_aliases": ["law", "luật"],
        "labels": {"vi": "Luật", "ko": "법률", "en": "Law", "zh": "法律"},
    },
    "decree": {
        "raw_aliases": ["nghi_dinh", "nghị định", "decree"],
        "labels": {"vi": "Nghị định", "ko": "시행령", "en": "Decree", "zh": "法令"},
    },
    "decision": {
        "raw_aliases": ["quyet_dinh", "quyết định", "decision"],
        "labels": {"vi": "Quyết định", "ko": "결정", "en": "Decision", "zh": "决定"},
    },
    "circular": {
        "raw_aliases": ["thong_tu", "thông tư", "circular"],
        "labels": {"vi": "Thông tư", "ko": "통첩(시행규칙)", "en": "Circular", "zh": "通知"},
    },
    "resolution": {
        "raw_aliases": ["nghi_quyet", "nghị quyết", "resolution"],
        "labels": {"vi": "Nghị quyết", "ko": "결의", "en": "Resolution", "zh": "决议"},
    },
    "directive": {
        "raw_aliases": ["chi_thi", "chỉ thị", "directive"],
        "labels": {"vi": "Chỉ thị", "ko": "지시", "en": "Directive", "zh": "指示"},
    },
    "joint_circular": {
        "raw_aliases": ["joint_circular", "thông tư liên tịch", "lien tich thong tu"],
        "labels": {"vi": "Thông tư liên tịch", "ko": "합동통첩", "en": "Joint Circular", "zh": "联合通知"},
    },
    "ordinance": {
        "raw_aliases": ["sac_lenh", "sắc lệnh", "ordinance"],
        "labels": {"vi": "Sắc lệnh", "ko": "칙령", "en": "Ordinance", "zh": "敕令"},
    },
}

STATUS_DICTIONARY: dict[str, dict] = {
    "active": {
        "raw_aliases": ["active"],
        "labels": {"vi": "Đang hiệu lực", "ko": "시행중", "en": "Active", "zh": "生效中"},
    },
    "fully_expired": {
        "raw_aliases": ["fully_expired"],
        "labels": {"vi": "Hết hiệu lực toàn bộ", "ko": "완전 실효", "en": "Fully Expired", "zh": "完全失效"},
    },
    "unknown": {
        "raw_aliases": ["unknown"],
        "labels": {"vi": "Chưa xác định", "ko": "상태 미확인", "en": "Unknown", "zh": "状态未知"},
    },
}

# SearchResult에는 relation_type 필드가 없으므로 LocalizedSearchResult에 직접
# 넣지는 않지만(존재하지 않는 데이터를 지어내지 않기 위함), STEP4 지시사항의
# 번역 대상 목록에 포함되어 있으므로 향후 확장을 위한 조회 함수는 제공한다
# (아래 localize_relation_type() 참고).
RELATION_TYPE_DICTIONARY: dict[str, dict] = {
    "references": {
        "raw_aliases": ["references"],
        "labels": {"vi": "Tham chiếu", "ko": "참조", "en": "References", "zh": "引用"},
    },
    "amends": {
        "raw_aliases": ["amends"],
        "labels": {"vi": "Sửa đổi", "ko": "개정", "en": "Amends", "zh": "修订"},
    },
    "repeals": {
        "raw_aliases": ["repeals"],
        "labels": {"vi": "Bãi bỏ", "ko": "폐지", "en": "Repeals", "zh": "废止"},
    },
    "replaces": {
        "raw_aliases": ["replaces"],
        "labels": {"vi": "Thay thế", "ko": "대체", "en": "Replaces", "zh": "替代"},
    },
    "guides": {
        "raw_aliases": ["guides"],
        "labels": {"vi": "Hướng dẫn", "ko": "안내(가이드)", "en": "Guides", "zh": "指导"},
    },
}

# 법률 주제(keyword/summary/description 판단용) — 제목/heading에 아래 베트남어
# 구문이 "연속 문자열"로 존재하면 해당 주제로 인식한다. 더 구체적인 개념을
# 먼저 검사하도록 순서를 의도적으로 배치했다(예: work_permit이 labor보다 먼저 —
# "giấy phép lao động"는 "lao động"의 상위 개념이므로).
LEGAL_TOPIC_DICTIONARY: dict[str, dict] = {
    "work_permit": {
        "match_vi": "giấy phép lao động",
        "labels": {"vi": "Giấy phép lao động", "ko": "노동허가", "en": "Work Permit", "zh": "工作许可证"},
    },
    "temporary_residence_card": {
        "match_vi": "thẻ tạm trú",
        "labels": {
            "vi": "Thẻ tạm trú", "ko": "임시거주증",
            "en": "Temporary Residence Card", "zh": "临时居留证",
        },
    },
    "immigration": {
        "match_vi": "xuất nhập cảnh",
        "labels": {"vi": "Xuất nhập cảnh", "ko": "출입국", "en": "Immigration", "zh": "出入境"},
    },
    "residence": {
        "match_vi": "cư trú",
        "labels": {"vi": "Cư trú", "ko": "거주", "en": "Residence", "zh": "居留"},
    },
    "labor": {
        "match_vi": "lao động",
        "labels": {"vi": "Lao động", "ko": "노동", "en": "Labor", "zh": "劳动"},
    },
    "investment": {
        "match_vi": "đầu tư",
        "labels": {"vi": "Đầu tư", "ko": "투자", "en": "Investment", "zh": "投资"},
    },
    "company": {
        "match_vi": "doanh nghiệp",
        "labels": {"vi": "Doanh nghiệp", "ko": "기업(법인)", "en": "Company", "zh": "企业"},
    },
    "tax": {
        "match_vi": "thuế",
        "labels": {"vi": "Thuế", "ko": "세무", "en": "Tax", "zh": "税务"},
    },
    "construction": {
        "match_vi": "xây dựng",
        "labels": {"vi": "Xây dựng", "ko": "건설", "en": "Construction", "zh": "建筑"},
    },
    "administrative": {
        "match_vi": "hành chính",
        "labels": {"vi": "Hành chính", "ko": "행정", "en": "Administrative", "zh": "行政"},
    },
}

# Điều/Khoản/Điểm 라벨(heading_label 조합용)
ARTICLE_LABEL_DICTIONARY: dict[str, dict[str, str]] = {
    "article": {"vi": "Điều", "ko": "조", "en": "Article", "zh": "条"},
    "clause": {"vi": "Khoản", "ko": "항", "en": "Clause", "zh": "款"},
    "point": {"vi": "Điểm", "ko": "호", "en": "Point", "zh": "项"},
}


def _build_alias_index(dictionary: dict[str, dict]) -> dict[str, str]:
    index: dict[str, str] = {}
    for concept_key, concept in dictionary.items():
        for alias in concept.get("raw_aliases", []):
            index[_normalize(alias)] = concept_key
    return index


_DOCUMENT_TYPE_ALIAS_INDEX = _build_alias_index(DOCUMENT_TYPE_DICTIONARY)
_STATUS_ALIAS_INDEX = _build_alias_index(STATUS_DICTIONARY)
_RELATION_TYPE_ALIAS_INDEX = _build_alias_index(RELATION_TYPE_DICTIONARY)


# ---------------------------------------------------------------------------
# 카테고리별 로컬라이즈 함수 — 전부 Fallback 원칙 준수(사전에 없으면 원문 유지,
# 빈 문자열/None을 만들어내지 않음. 단, 원본 데이터 자체가 없는 경우(예:
# article_no가 애초에 없음)는 "번역 실패"가 아니라 "데이터 없음"이므로 None 허용).
# ---------------------------------------------------------------------------


def localize_document_type(raw_document_type: str | None, language: str | None = None) -> str:
    lang = _resolve_language(language)
    if not raw_document_type:
        return GENERIC_DOCUMENT_LABEL[lang]
    concept_key = _DOCUMENT_TYPE_ALIAS_INDEX.get(_normalize(raw_document_type))
    if concept_key:
        return DOCUMENT_TYPE_DICTIONARY[concept_key]["labels"].get(lang, raw_document_type)
    return raw_document_type  # Fallback: 사전에 없는 문서유형은 원문 그대로


def localize_status(raw_status: str | None, language: str | None = None) -> str:
    lang = _resolve_language(language)
    key = raw_status if raw_status else "unknown"
    concept_key = _STATUS_ALIAS_INDEX.get(_normalize(key))
    if concept_key:
        return STATUS_DICTIONARY[concept_key]["labels"].get(lang, key)
    return key  # Fallback: 사전에 없는 상태값은 원문 그대로


def localize_relation_type(raw_relation_type: str | None, language: str | None = None) -> str | None:
    """[확장용] SearchResult에는 relation_type 필드가 없어 LocalizedSearchResult에는
    직접 반영하지 않지만, STEP4 지시사항의 번역 대상 목록에 포함되어 있으므로
    독립 함수로 제공한다(향후 relation 조회 API 등에서 재사용 가능)."""
    if raw_relation_type is None:
        return None
    lang = _resolve_language(language)
    concept_key = _RELATION_TYPE_ALIAS_INDEX.get(_normalize(raw_relation_type))
    if concept_key:
        return RELATION_TYPE_DICTIONARY[concept_key]["labels"].get(lang, raw_relation_type)
    return raw_relation_type


def _detect_topic_label(text: str | None, language: str) -> str | None:
    if not text:
        return None
    normalized = _normalize(text)
    for concept in LEGAL_TOPIC_DICTIONARY.values():
        if concept["match_vi"] in normalized:
            return concept["labels"].get(language, concept["labels"]["vi"])
    return None


def _apply_topic_substitution(text: str | None, language: str) -> tuple[str | None, str | None]:
    """text 안에서 인식된 법률주제(canonical 베트남어 구문)만 해당 언어 라벨로
    "부분 치환"한다(문장 전체를 기계번역하지 않음 — 사전에 없는 나머지 원문은
    그대로 보존된다). 반환: (치환된 text, 감지된 topic 라벨 or None)."""
    if not text:
        return text, None
    if language == "vi":
        return text, _detect_topic_label(text, "vi")

    normalized_text = unicodedata.normalize("NFC", text)
    for concept in LEGAL_TOPIC_DICTIONARY.values():
        phrase = concept["match_vi"]
        pattern = re.compile(re.escape(phrase), re.IGNORECASE)
        m = pattern.search(normalized_text)
        if m:
            label = concept["labels"].get(language, concept["labels"]["vi"])
            replaced = normalized_text[: m.start()] + label + normalized_text[m.end():]
            return replaced, label
    return text, None  # Fallback: 인식된 주제 없음 -> 원문 그대로 유지


def _build_heading_label(
    article_no: str | None,
    clause_no: str | None,
    item_no: str | None,
    raw_heading: str | None,
    language: str,
) -> str | None:
    if article_no:
        art = ARTICLE_LABEL_DICTIONARY["article"][language]
        parts: list[str]
        if language == "ko":
            parts = [f"제{article_no}{art}"]
            if clause_no:
                parts.append(f"제{clause_no}{ARTICLE_LABEL_DICTIONARY['clause'][language]}")
            if item_no:
                parts.append(f"제{item_no}{ARTICLE_LABEL_DICTIONARY['point'][language]}")
        elif language == "zh":
            parts = [f"第{article_no}{art}"]
            if clause_no:
                parts.append(f"第{clause_no}{ARTICLE_LABEL_DICTIONARY['clause'][language]}")
            if item_no:
                parts.append(f"第{item_no}{ARTICLE_LABEL_DICTIONARY['point'][language]}")
        else:  # en / vi
            parts = [f"{art} {article_no}"]
            if clause_no:
                parts.append(f"{ARTICLE_LABEL_DICTIONARY['clause'][language]} {clause_no}")
            if item_no:
                parts.append(f"{ARTICLE_LABEL_DICTIONARY['point'][language]} {item_no}")
        return " ".join(parts)
    if raw_heading:
        return raw_heading  # Fallback: 구조 인식 실패 등 자유형 heading은 원문 유지
    return None  # 원본에 heading 정보 자체가 없음(번역 실패 아님 — 데이터 없음)


# ---------------------------------------------------------------------------
# LocalizedSearchResult
# ---------------------------------------------------------------------------


@dataclass
class LocalizedSearchResult:
    # --- 절대 번역하지 않는 필드(SearchResult에서 그대로 보존) ---
    document_id: str
    document_number: list[str]
    article_number: str | None
    clause_number: str | None
    point: str | None
    issuing_authority: str | None
    effective_date: str | None
    status: str | None
    source_url: str | None
    original_title: str | None
    original_heading: str | None
    score: float
    match_type: str

    # --- Localize 대상(사용자 선택 언어) ---
    language: str
    display_title: str
    document_type: str
    status_label: str
    keyword: str
    summary: str
    description: str
    heading_label: str | None

    def to_dict(self) -> dict:
        return {
            "document_id": self.document_id,
            "document_number": self.document_number,
            "article_number": self.article_number,
            "clause_number": self.clause_number,
            "point": self.point,
            "issuing_authority": self.issuing_authority,
            "effective_date": self.effective_date,
            "status": self.status,
            "source_url": self.source_url,
            "original_title": self.original_title,
            "original_heading": self.original_heading,
            "score": self.score,
            "match_type": self.match_type,
            "language": self.language,
            "display_title": self.display_title,
            "document_type": self.document_type,
            "status_label": self.status_label,
            "keyword": self.keyword,
            "summary": self.summary,
            "description": self.description,
            "heading_label": self.heading_label,
        }


def localize_result(
    result: SearchResult,
    language: str | None = None,
    document: Document | None = None,
) -> LocalizedSearchResult:
    """SearchResult(불변) + language -> LocalizedSearchResult.

    `document`(선택)는 issuing_authority/effective_date처럼 SearchResult 자체에는
    없는 필드를 보강하기 위한 것이다 — SearchResult 스키마는 이 함수에서도
    전혀 바뀌지 않는다. 호출자가 documents_by_id에서 조회해 전달할 수 있다
    (search_engine.py의 LegalSearchIndex.search_localized() 참고).
    """
    lang = _resolve_language(language)

    display_title, title_topic_label = _apply_topic_substitution(result.title, lang)
    document_type_label = localize_document_type(result.document_type, lang)
    status_label = localize_status(result.status, lang)
    heading_label = _build_heading_label(result.article_no, result.clause_no, result.item_no, result.heading, lang)

    keyword = title_topic_label or document_type_label
    summary = display_title if display_title else document_type_label
    issuing_authority = document.issuing_authority if document else None
    effective_date = document.effective_date if document else None
    description_parts = [p for p in (document_type_label, keyword, issuing_authority) if p]
    description = " — ".join(description_parts) if description_parts else GENERIC_DOCUMENT_LABEL[lang]

    return LocalizedSearchResult(
        document_id=result.document_id,
        document_number=list(result.document_number),
        article_number=result.article_no,
        clause_number=result.clause_no,
        point=result.item_no,
        issuing_authority=issuing_authority,
        effective_date=effective_date,
        status=result.status,
        source_url=result.official_url,
        original_title=result.title,
        original_heading=result.heading,
        score=result.score,
        match_type=result.match_type,
        language=lang,
        display_title=display_title or (result.title or GENERIC_DOCUMENT_LABEL[lang]),
        document_type=document_type_label,
        status_label=status_label,
        keyword=keyword,
        summary=summary or GENERIC_DOCUMENT_LABEL[lang],
        description=description,
        heading_label=heading_label,
    )


def localize_results(
    results: list[SearchResult],
    language: str | None = None,
    documents_by_id: dict[str, Document] | None = None,
) -> list[LocalizedSearchResult]:
    documents_by_id = documents_by_id or {}
    return [
        localize_result(r, language, documents_by_id.get(r.document_id))
        for r in results
    ]
