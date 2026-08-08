"""
Keyword Search — 실제 실행 가능한 구현.

검색 대상 필드 (STEP3 지시사항): title, original_text, normalized_text, search_text
지원: 부분일치(substring), Prefix, Phrase, 다중 키워드, 대소문자 무시, Unicode 정규화

⚠️ DB에 연결하지 않는다. 순수 Python 문자열 매칭(선형 스캔)이며, 실제 서비스
   규모에서는 PostgreSQL FTS(`search_text` 컬럼, docs/Schema.md 설계) 또는
   전용 검색엔진으로 교체될 것을 전제로 한 "정확성 우선" 구현이다(STEP3 목표:
   Vector Search가 아니라 정확한 검색).
"""

from __future__ import annotations

from .search_models import (
    Chunk,
    Document,
    MatchType,
    FIELD_WEIGHT,
    KEYWORD_BASE_SCORE,
    CANONICAL_CONCEPT_SCORE,
    SearchResult,
    normalize_query_text,
    result_from_chunk,
    result_from_document,
)

SEARCH_FIELDS = ("title", "original_text", "normalized_text", "search_text")

# Keyword match_type 간 우선순위(phrase가 가장 강함) — MatchType 선언 순서에
# 의존하지 않도록 명시적으로 정의한다.
# [STEP3-2] 우선순위: Phrase(0) > Prefix(1) > Substring(2) > All-Terms-Scattered(3, 최하위)
_KEYWORD_MATCH_RANK = {
    MatchType.KEYWORD_PHRASE: 0,
    MatchType.KEYWORD_PREFIX: 1,
    MatchType.KEYWORD_SUBSTRING: 2,
    MatchType.KEYWORD_ALL_TERMS: 3,
}


def _field_text(chunk: Chunk, document: Document | None, field_name: str) -> str:
    if field_name == "title":
        return normalize_query_text(document.title) if document and document.title else ""
    value = getattr(chunk, field_name, None)
    return normalize_query_text(value) if value else ""


def match_substring(text: str, keyword: str) -> bool:
    return bool(keyword) and keyword in text


def match_prefix(text: str, keyword: str) -> bool:
    """단어 경계 기준 prefix 매치 (텍스트 안에 keyword로 시작하는 단어가 있으면 매치)."""
    if not keyword:
        return False
    for word in text.split():
        if word.startswith(keyword):
            return True
    return text.startswith(keyword)


def match_phrase(text: str, phrase: str) -> bool:
    """공백까지 포함한 완전한 구(phrase) 일치 — substring과 동일 판정이지만 의미상 별도 match_type."""
    return bool(phrase) and phrase in text


def match_multi_keyword(text: str, keywords: list[str], mode: str = "all") -> bool:
    """다중 키워드 매치. mode="all"이면 전부 포함(AND), "any"면 하나라도 포함(OR)."""
    if not keywords:
        return False
    hits = [k in text for k in keywords if k]
    if not hits:
        return False
    return all(hits) if mode == "all" else any(hits)


def _split_keywords(query: str) -> list[str]:
    return [w for w in query.split() if w]


# ---------------------------------------------------------------------------
# 통합 진입점
# ---------------------------------------------------------------------------


def search_title_only_documents(
    query: str,
    documents: list[Document],
    chunks: list[Chunk],
) -> list[SearchResult]:
    """본문 청크가 없어 chunk 루프에 잡히지 않는 문서의 제목만 검색한다.

    tmquan 원본에 markdown 본문이 비어 있는 문서(예: 106/2016/QH13)는 정규화·청킹
    단계에서 chunk가 생성되지 않는다. 제목에만 법률 주제가 담긴 이런 문서도
    키워드 검색 결과에 포함되어야 한다.
    """
    query_norm = normalize_query_text(query)
    if not query_norm:
        return []

    chunked_doc_ids = {c.document_id for c in chunks}
    keywords = _split_keywords(query_norm)
    results: list[SearchResult] = []

    for doc in documents:
        if doc.document_id in chunked_doc_ids:
            continue
        title_norm = normalize_query_text(doc.title) if doc.title else ""
        if not title_norm:
            continue

        if len(keywords) > 1 and match_phrase(title_norm, query_norm):
            match_type = MatchType.KEYWORD_PHRASE
        elif match_prefix(title_norm, query_norm):
            match_type = MatchType.KEYWORD_PREFIX
        elif match_substring(title_norm, query_norm):
            match_type = MatchType.KEYWORD_SUBSTRING
        elif len(keywords) > 1 and match_multi_keyword(title_norm, keywords, "all"):
            match_type = MatchType.KEYWORD_ALL_TERMS
        else:
            continue

        score = KEYWORD_BASE_SCORE[match_type] * FIELD_WEIGHT["title"]
        results.append(result_from_document(doc, score, match_type))

    return results


def search_keyword(
    query: str,
    chunks: list[Chunk],
    documents_by_id: dict[str, Document],
    fields: tuple[str, ...] = SEARCH_FIELDS,
    multi_keyword_mode: str = "all",
) -> list[SearchResult]:
    """
    query 하나로 phrase(전체 구/다중 키워드 전부 포함) > prefix > substring 순으로
    판정하고, 매치된 필드 중 가장 가중치가 높은 필드를 기준으로 점수를 매긴다.
    """
    query_norm = normalize_query_text(query)
    if not query_norm:
        return []

    keywords = _split_keywords(query_norm)
    results: list[SearchResult] = []

    for chunk in chunks:
        document = documents_by_id.get(chunk.document_id)
        best_match_type: MatchType | None = None
        best_field_weight = 0.0

        for field_name in fields:
            text = _field_text(chunk, document, field_name)
            if not text:
                continue

            field_weight = FIELD_WEIGHT.get(field_name, 1.0)

            if len(keywords) > 1 and match_phrase(text, query_norm):
                match_type = MatchType.KEYWORD_PHRASE
            elif match_prefix(text, query_norm):
                match_type = MatchType.KEYWORD_PREFIX
            elif match_substring(text, query_norm):
                match_type = MatchType.KEYWORD_SUBSTRING
            elif len(keywords) > 1 and match_multi_keyword(text, keywords, multi_keyword_mode):
                # [STEP3-2] 이전에는 이 분기가 KEYWORD_PHRASE와 동일 점수를 받아
                # "giấy/phép/lao/động" 각 단어가 흩어져 있는 무관한 문서까지 상위에
                # 노출되는 품질 문제가 있었다. 연속 문자열(phrase/prefix/substring)로
                # 전혀 매치되지 않을 때만 최후 수단으로 시도하고, 점수도 최하위로 낮춘다.
                match_type = MatchType.KEYWORD_ALL_TERMS
            else:
                continue

            candidate_rank = (_KEYWORD_MATCH_RANK[match_type], -field_weight)
            current_rank = (
                (_KEYWORD_MATCH_RANK[best_match_type], -best_field_weight)
                if best_match_type is not None else (999, 0.0)
            )
            if candidate_rank < current_rank:
                best_match_type = match_type
                best_field_weight = field_weight

        if best_match_type is not None:
            score = KEYWORD_BASE_SCORE[best_match_type] * best_field_weight
            results.append(result_from_chunk(chunk, document, score, best_match_type))

    return results


# ---------------------------------------------------------------------------
# [STEP3-2 신규] Canonical Legal Concept Match
#
# LegalQueryNormalizer가 다국어 질의를 canonical_vi(예: "giấy phép lao động")로
# 변환한 경우, 그 문구 전체가 문서 제목/조문 heading에 "연속된 문자열"로 정확히
# 존재하는지만 확인한다. 단어가 흩어져 있는 경우는 Concept Match로 인정하지
# 않는다(위 KEYWORD_ALL_TERMS와 명확히 구분).
#
# ⚠️ 현재 STEP2 스키마(search_models.py)에는 "대표 키워드"/"metadata" 전용 필드가
#    없으므로, 실제 존재하는 필드 중 이 목적에 가장 부합하는 document.title(문서
#    제목)과 chunk.heading(조문 heading, 종종 장/조 breadcrumb+제목을 포함)만
#    검사한다 — Dataset/Schema 변경은 금지되어 있으므로 새 필드를 추가하지 않았다.
# ---------------------------------------------------------------------------


def search_canonical_concept(
    canonical_phrase: str,
    documents: list[Document],
    chunks: list[Chunk],
    documents_by_id: dict[str, Document],
) -> list[SearchResult]:
    """canonical_vi 문구가 문서 제목 또는 조문 heading에 정확히(연속 문자열로)
    존재하는 경우만 CANONICAL_CONCEPT 매치로 인정한다."""
    phrase_norm = normalize_query_text(canonical_phrase)
    if not phrase_norm:
        return []

    results: list[SearchResult] = []

    for doc in documents:
        title_norm = normalize_query_text(doc.title) if doc.title else ""
        if title_norm and phrase_norm in title_norm:
            results.append(
                result_from_document(doc, CANONICAL_CONCEPT_SCORE, MatchType.CANONICAL_CONCEPT)
            )

    for chunk in chunks:
        heading_norm = normalize_query_text(chunk.heading) if chunk.heading else ""
        if heading_norm and phrase_norm in heading_norm:
            document = documents_by_id.get(chunk.document_id)
            results.append(
                result_from_chunk(chunk, document, CANONICAL_CONCEPT_SCORE, MatchType.CANONICAL_CONCEPT)
            )

    return results
