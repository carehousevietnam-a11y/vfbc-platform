"""
VFBCAI Legal Intelligence Platform — Evidence Builder (STEP5-1).

SearchResult 목록을 그대로 AI(향후 STEP8 AI Document Review 등)에게 전달하지
않는다. 이 모듈은:

    SearchResult 목록 -> Evidence Builder -> Evidence Pack(문서 단위)

으로 변환하는 순수 가공(post-processing) 전용 독립 모듈이다.

⚠️ Search Engine/Ranking/Score/MatchType/SearchResult/Document 모델은 이 모듈이
   전혀 관여하지 않는다 — 이미 계산된 SearchResult를 입력받아 "그룹화 + 중복
   제거 + 정렬"만 수행하며, 어떤 값도 새로 계산(재채점/재랭킹)하지 않는다.
   OpenAI 등 외부 AI API도 호출하지 않는다(순수 데이터 가공).
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .search_models import Document, SearchResult


# ---------------------------------------------------------------------------
# ArticleReference — Evidence Pack 안의 "관련 조항" 개별 항목(Điều/Khoản/Điểm)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ArticleReference:
    article_no: str | None   # 관련 조항(Điều)
    clause_no: str | None    # 관련 항(Khoản)
    item_no: str | None      # 관련 호(Điểm)
    heading: str | None      # 원문 Heading(해당 조항 매치의 breadcrumb, 번역/가공 없이 그대로)
    score: float             # 해당 조항 매치의 검색 점수(SearchResult.score 그대로)
    match_type: str          # 해당 조항 매치의 MatchType(SearchResult.match_type 그대로)

    def dedup_key(self) -> tuple[str | None, str | None, str | None]:
        """같은 조항 중복 제거용 키 — (article_no, clause_no, item_no)."""
        return (self.article_no, self.clause_no, self.item_no)

    def to_dict(self) -> dict:
        return {
            "article_no": self.article_no,
            "clause_no": self.clause_no,
            "item_no": self.item_no,
            "heading": self.heading,
            "score": self.score,
            "match_type": self.match_type,
        }


# ---------------------------------------------------------------------------
# EvidencePack — 문서 단위로 그룹화된 최종 산출물
# ---------------------------------------------------------------------------


@dataclass
class EvidencePack:
    document_id: str
    document_number: list[str]         # 문서번호 (원문 그대로)
    title: str | None                  # 문서제목(=원문 제목, 이 모듈은 번역하지 않음)
    issuing_authority: str | None      # 발행기관 (Document 보강 시에만 채워짐)
    effective_date: str | None         # 시행일 (Document 보강 시에만 채워짐)
    status: str | None
    official_url: str | None           # 관련 URL / 출처
    articles: list[ArticleReference]   # 관련 조항/항/호 (Article -> Clause -> Point 정렬, 중복 제거됨)
    search_keywords: list[str]         # 검색 키워드(이 Evidence Pack을 만든 검색 질의)
    top_score: float                   # 검색 점수 — 이 문서에 속한 매치 중 최고점(재계산 아님, 그대로 가져옴)
    top_match_type: str                # 위 top_score를 가진 매치의 MatchType(그대로)
    original_title: str | None         # 원문 제목(title과 동일 값 — 번역되지 않았음을 명시)
    original_headings: list[str]       # 원문 Heading 전체 목록(중복 제거, 원문 그대로 보존)

    def to_dict(self) -> dict:
        return {
            "document_id": self.document_id,
            "document_number": self.document_number,
            "title": self.title,
            "issuing_authority": self.issuing_authority,
            "effective_date": self.effective_date,
            "status": self.status,
            "official_url": self.official_url,
            "articles": [a.to_dict() for a in self.articles],
            "search_keywords": self.search_keywords,
            "top_score": self.top_score,
            "top_match_type": self.top_match_type,
            "original_title": self.original_title,
            "original_headings": self.original_headings,
        }


# ---------------------------------------------------------------------------
# 정렬 키 — Article -> Clause -> Point 순, 숫자는 숫자로 비교(문자열 정렬로
# "10"이 "9"보다 앞에 오는 문제 방지), 값이 없으면(None) 가장 앞으로.
# ---------------------------------------------------------------------------


def _locator_sort_key(value: str | None) -> tuple[int, float, str]:
    if value is None:
        return (0, 0.0, "")
    stripped = value.strip()
    if stripped.isdigit():
        return (1, float(int(stripped)), "")
    # 숫자가 아닌 표기(로마숫자/문자 등, 예: Điểm "a","b")는 숫자 표기들 뒤에,
    # 그 안에서는 알파벳/문자열 순으로 정렬한다.
    return (1, float("inf"), stripped.lower())


def _article_sort_key(ref: ArticleReference) -> tuple:
    return (
        _locator_sort_key(ref.article_no),
        _locator_sort_key(ref.clause_no),
        _locator_sort_key(ref.item_no),
    )


# ---------------------------------------------------------------------------
# Evidence Builder — 핵심 변환 함수
# ---------------------------------------------------------------------------


def build_evidence_packs(
    results: list[SearchResult],
    query: str | None = None,
    documents_by_id: dict[str, Document] | None = None,
) -> list[EvidencePack]:
    """SearchResult 목록 -> Evidence Pack 목록(문서번호 기준 정렬).

    `results`는 이 함수 안에서 전혀 수정되지 않는다(읽기 전용 순회만 수행) —
    "SearchResult 수정 금지" 원칙을 지킨다. `documents_by_id`(선택)는
    issuing_authority/effective_date처럼 SearchResult 자체에는 없는 필드를
    보강하기 위한 것으로, search_engine.py의 LegalSearchIndex.documents_by_id를
    그대로 전달하면 된다(Search Engine 코드 자체는 변경하지 않음).
    """
    documents_by_id = documents_by_id or {}
    search_keywords = [query] if query else []

    # 1) 문서 단위 그룹화 (입력 순서와 무관하게 document_id로 묶는다)
    groups: dict[str, list[SearchResult]] = {}
    order: list[str] = []
    for r in results:
        if r.document_id not in groups:
            groups[r.document_id] = []
            order.append(r.document_id)
        groups[r.document_id].append(r)

    packs: list[EvidencePack] = []
    for document_id in order:
        group = groups[document_id]

        # 2) 조항 중복 제거 — 같은 (article_no, clause_no, item_no)는 그 그룹 내
        #    최고 점수를 가진 매치 하나만 남긴다(재계산이 아니라 기존 score 중 선택).
        best_by_locator: dict[tuple, ArticleReference] = {}
        for r in group:
            ref = ArticleReference(
                article_no=r.article_no,
                clause_no=r.clause_no,
                item_no=r.item_no,
                heading=r.heading,
                score=r.score,
                match_type=r.match_type,
            )
            key = ref.dedup_key()
            existing = best_by_locator.get(key)
            if existing is None or ref.score > existing.score:
                best_by_locator[key] = ref

        # 3) 정렬 — Article -> Clause -> Point
        articles = sorted(best_by_locator.values(), key=_article_sort_key)

        # 4) 원문 Heading 전체 목록(중복 제거, 원본 순서 보존)
        seen_headings: set[str] = set()
        original_headings: list[str] = []
        for r in group:
            if r.heading and r.heading not in seen_headings:
                seen_headings.add(r.heading)
                original_headings.append(r.heading)

        # 5) 대표 점수/MatchType — 이 문서에 속한 매치 중 최고점(재계산 아님)
        top_result = max(group, key=lambda r: r.score)

        # 6) 문서번호/제목/URL/상태 — 그룹 내 어느 SearchResult나 동일 문서이므로
        #    첫 항목 기준(같은 document_id면 document_number/title/status 값은
        #    이론상 전부 동일해야 정상이지만, 방어적으로 None이 아닌 첫 값을 사용)
        document_number: list[str] = []
        title: str | None = None
        status: str | None = None
        official_url: str | None = None
        for r in group:
            if not document_number and r.document_number:
                document_number = list(r.document_number)
            if title is None and r.title:
                title = r.title
            if status is None and r.status:
                status = r.status
            if official_url is None and r.official_url:
                official_url = r.official_url

        document = documents_by_id.get(document_id)
        issuing_authority = document.issuing_authority if document else None
        effective_date = document.effective_date if document else None
        if official_url is None and document is not None:
            official_url = document.official_url
        if title is None and document is not None:
            title = document.title
        if not document_number and document is not None:
            document_number = list(document.document_number)
        if status is None and document is not None:
            status = document.status

        packs.append(
            EvidencePack(
                document_id=document_id,
                document_number=document_number,
                title=title,
                issuing_authority=issuing_authority,
                effective_date=effective_date,
                status=status,
                official_url=official_url,
                articles=articles,
                search_keywords=list(search_keywords),
                top_score=top_result.score,
                top_match_type=top_result.match_type,
                original_title=title,
                original_headings=original_headings,
            )
        )

    # 7) 문서번호 기준 정렬(지시사항: "문서번호 기준 정렬"). 문서번호가 여러 개인
    #    경우 첫 번째 값을 대표로 사용하고, 문서번호가 아예 없으면 document_id로
    #    정렬해 결정적(deterministic) 순서를 보장한다.
    packs.sort(key=lambda p: (p.document_number[0] if p.document_number else "", p.document_id))

    return packs


def format_evidence_pack_text(pack: EvidencePack) -> str:
    """[선택적 유틸리티] Evidence Pack을 지시사항 출력 예시와 동일한 형태의
    일반 텍스트로 렌더링한다(디버깅/로그용, 이 모듈의 핵심 산출물은 어디까지나
    EvidencePack 데이터클래스 자체이며 이 함수는 부가 기능일 뿐이다)."""
    lines = ["Evidence Pack"]
    lines.append("문서번호")
    lines.append(", ".join(pack.document_number) if pack.document_number else "(없음)")
    lines.append("문서명")
    lines.append(pack.title or "(없음)")
    lines.append("발행기관")
    lines.append(pack.issuing_authority or "(없음)")
    lines.append("시행일")
    lines.append(pack.effective_date or "(없음)")
    lines.append("관련 조항")
    if pack.articles:
        for a in pack.articles:
            parts = []
            if a.article_no:
                parts.append(f"제{a.article_no}조")
            if a.clause_no:
                parts.append(f"제{a.clause_no}항")
            if a.item_no:
                parts.append(f"제{a.item_no}호")
            lines.append(" ".join(parts) if parts else "(문서 전체)")
    else:
        lines.append("(없음)")
    lines.append("검색 키워드")
    lines.append(", ".join(pack.search_keywords) if pack.search_keywords else "(없음)")
    lines.append("Match Type")
    lines.append(pack.top_match_type)
    lines.append("검색 점수")
    lines.append(str(pack.top_score))
    lines.append("출처 URL")
    lines.append(pack.official_url or "(없음)")
    return "\n".join(lines)
