from src.deduplicate_documents import deduplicate


_counter = {"n": 0}


def _doc(**kwargs):
    _counter["n"] += 1
    base = {
        "documentId": "x",
        "sourceDataset": "tmquan_vbpl_vn",
        # 테스트마다 고유값 — tier2(sourceDataset+sourceDocumentId) 규칙이 의도치
        # 않게 다른 tier 테스트를 오염시키지 않도록 함. tier2를 직접 테스트할 때만
        # 명시적으로 동일 값을 지정한다.
        "sourceDocumentId": f"auto-{_counter['n']}",
        "officialUrl": None,
        "documentNumber": [],
        "title": None,
        "issueDate": None,
        "issuingAuthority": None,
        "contentHash": None,
        "originalText": None,
    }
    base.update(kwargs)
    return base


def test_no_duplicates_when_all_fields_differ():
    docs = [
        _doc(documentId="a", officialUrl="https://vbpl.vn/a"),
        _doc(documentId="b", officialUrl="https://vbpl.vn/b"),
    ]
    outcome = deduplicate(docs)
    assert outcome.total_after_dedup == 2
    assert len([g for g in outcome.groups if len(g.member_document_ids) > 1]) == 0


def test_tier1_official_url_match():
    docs = [
        _doc(documentId="tmquan:1", officialUrl="https://vbpl.vn/x"),
        _doc(documentId="th1nhng0:99", officialUrl="https://vbpl.vn/x"),
    ]
    outcome = deduplicate(docs)
    assert outcome.total_after_dedup == 1
    group = outcome.groups[0]
    assert group.match_tier == 1
    assert set(group.member_document_ids) == {"tmquan:1", "th1nhng0:99"}


def test_tier2_same_source_document_id_match():
    docs = [
        _doc(documentId="tmquan:1-v1", sourceDataset="tmquan_vbpl_vn", sourceDocumentId="186739"),
        _doc(documentId="tmquan:1-v2", sourceDataset="tmquan_vbpl_vn", sourceDocumentId="186739"),
    ]
    outcome = deduplicate(docs)
    assert outcome.total_after_dedup == 1
    assert outcome.groups[0].match_tier == 2


def test_tier3_docnumber_date_authority_match():
    docs = [
        _doc(
            documentId="tmquan:1",
            documentNumber=["152/2020/NĐ-CP"],
            issueDate="2020-12-30",
            issuingAuthority="Chính phủ",
        ),
        _doc(
            documentId="th1nhng0:5",
            documentNumber=["152/2020/NĐ-CP"],
            issueDate="2020-12-30",
            issuingAuthority="Chính phủ",
        ),
    ]
    outcome = deduplicate(docs)
    assert outcome.total_after_dedup == 1
    assert outcome.groups[0].match_tier == 3


def test_tier4_title_date_authority_match_when_no_docnumber():
    docs = [
        _doc(
            documentId="a",
            title="Về việc ban hành Quy chế tổ chức",
            issueDate="2015-01-01",
            issuingAuthority="UBND tỉnh A",
        ),
        _doc(
            documentId="b",
            title="về việc ban hành quy chế tổ chức!!",  # 대소문자/문장부호만 다름
            issueDate="2015-01-01",
            issuingAuthority="ubnd tỉnh a",
        ),
    ]
    outcome = deduplicate(docs)
    assert outcome.total_after_dedup == 1


def test_tier5_content_hash_only_is_weak_match_not_merged():
    docs = [
        _doc(documentId="a", contentHash="deadbeef", title="Title A", issueDate="2020-01-01"),
        _doc(documentId="b", contentHash="deadbeef", title="Title B", issueDate="2020-02-02"),
    ]
    outcome = deduplicate(docs)
    # tier1~4 어느 것도 일치하지 않으므로 자동 병합되지 않는다
    assert outcome.total_after_dedup == 2
    assert len(outcome.weak_matches) == 1
    assert set(outcome.weak_matches[0]["documentIds"]) == {"a", "b"}


def test_canonical_prefers_document_with_body_and_tmquan_source():
    docs = [
        _doc(
            documentId="th1nhng0:5",
            officialUrl="https://vbpl.vn/y",
            sourceDataset="th1nhng0_vietnamese_legal",
            originalText=None,
        ),
        _doc(
            documentId="tmquan:1",
            officialUrl="https://vbpl.vn/y",
            sourceDataset="tmquan_vbpl_vn",
            originalText="본문 있음",
        ),
    ]
    outcome = deduplicate(docs)
    assert outcome.groups[0].canonical_document_id == "tmquan:1"
