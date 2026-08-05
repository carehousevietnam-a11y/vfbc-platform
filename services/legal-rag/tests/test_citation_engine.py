from __future__ import annotations

from src.ai_review_engine import ReviewResult
from src.ai_review_models import LegalBasisCitation, STATUS_SUCCESS
from src.citation_engine import CITATION_SCHEMA_VERSION, build_citations
from src.evidence_builder import ArticleReference, EvidencePack


def _pack() -> EvidencePack:
    return EvidencePack(
        document_id="doc-152",
        document_number=["152/2020/NĐ-CP", "152-2020"],
        title="Nghị định về lao động nước ngoài",
        issuing_authority="Chính phủ",
        effective_date="2021-02-15",
        status="active",
        official_url="https://vbpl.vn/example-152",
        articles=[
            ArticleReference("9", None, None, "Điều 9. Hồ sơ", 90.0, "canonical_concept"),
            ArticleReference("10", "1", "a", "Điều 10 Khoản 1 Điểm a", 80.0, "keyword_phrase"),
        ],
        search_keywords=["work permit"],
        top_score=90.0,
        top_match_type="canonical_concept",
        original_title="Nghị định về lao động nước ngoài",
        original_headings=["Điều 9. Hồ sơ", "Điều 10 Khoản 1 Điểm a"],
    )


def _review(*basis: LegalBasisCitation) -> ReviewResult:
    return ReviewResult(
        status=STATUS_SUCCESS,
        language="ko",
        question="노동허가가 필요한가요?",
        legal_basis=list(basis),
        source_document_count=1,
        source_article_count=2,
    )


def test_builds_enriched_citation_from_verified_legal_basis():
    result = build_citations(
        _review(LegalBasisCitation("152/2020/NĐ-CP", "Điều 9", "신청서류 근거")),
        [_pack()],
    )

    assert result.schema_version == CITATION_SCHEMA_VERSION
    assert result.review_status == STATUS_SUCCESS
    assert len(result.citations) == 1
    citation = result.citations[0]
    assert citation.citation_id == "CIT-001"
    assert citation.evidence_index == 1
    assert citation.document_id == "doc-152"
    assert citation.official_url == "https://vbpl.vn/example-152"
    assert citation.article_no == "9"
    assert citation.heading == "Điều 9. Hồ sơ"
    assert citation.note == "신청서류 근거"


def test_parses_full_article_clause_item_locator():
    result = build_citations(
        _review(LegalBasisCitation("152/2020/NĐ-CP", "Điều 10 Khoản 1 Điểm a")),
        [_pack()],
    )
    citation = result.citations[0]
    assert (citation.article_no, citation.clause_no, citation.item_no) == ("10", "1", "a")


def test_document_level_citation_is_supported_without_inventing_article():
    result = build_citations(
        _review(LegalBasisCitation("152/2020/NĐ-CP", None, "문서 전체 근거")),
        [_pack()],
    )
    citation = result.citations[0]
    assert citation.article is None
    assert citation.article_no is None
    assert citation.heading is None


def test_alias_document_number_maps_to_same_evidence_pack():
    result = build_citations(
        _review(LegalBasisCitation("152-2020", "Điều 9")),
        [_pack()],
    )
    assert result.citations[0].document_number == "152-2020"
    assert result.citations[0].document_id == "doc-152"


def test_missing_evidence_pack_is_excluded_not_fabricated():
    result = build_citations(
        _review(LegalBasisCitation("999/2099/NĐ-CP", "Điều 1")),
        [_pack()],
    )
    assert result.citations == []
    assert result.to_dict()["citation_count"] == 0


def test_duplicate_citations_are_removed_preserving_first_order():
    basis = LegalBasisCitation("152/2020/NĐ-CP", "Điều 9", "same")
    result = build_citations(_review(basis, basis), [_pack()])
    assert [item.citation_id for item in result.citations] == ["CIT-001"]


def test_different_notes_remain_distinct_citations():
    result = build_citations(
        _review(
            LegalBasisCitation("152/2020/NĐ-CP", "Điều 9", "근거 A"),
            LegalBasisCitation("152/2020/NĐ-CP", "Điều 9", "근거 B"),
        ),
        [_pack()],
    )
    assert [item.citation_id for item in result.citations] == ["CIT-001", "CIT-002"]


def test_input_review_and_evidence_are_not_mutated():
    review = _review(LegalBasisCitation("152/2020/NĐ-CP", "Điều 9"))
    pack = _pack()
    before_review = review.to_dict()
    before_pack = pack.to_dict()
    build_citations(review, [pack])
    assert review.to_dict() == before_review
    assert pack.to_dict() == before_pack


def test_to_dict_uses_stable_step7_contract():
    result = build_citations(
        _review(LegalBasisCitation("152/2020/NĐ-CP", "Điều 9")),
        [_pack()],
    ).to_dict()
    assert list(result) == [
        "schema_version",
        "review_status",
        "question",
        "language",
        "citation_count",
        "source_document_count",
        "source_article_count",
        "citations",
    ]
    assert result["citation_count"] == 1
