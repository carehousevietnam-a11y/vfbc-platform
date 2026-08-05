"""
STEP5-3 OpenAI RAG Connector 신규 테스트.

⚠️ 이 파일은 실제 OpenAI API를 절대 호출하지 않는다 — 모든 테스트는 Mock
Client(`_FakeOpenAIClient`)를 주입해서 실행하며, 네트워크 요청이 전혀
발생하지 않는다.
"""

import copy
import json

import pytest

from src.ai_review_models import (
    STATUS_API_ERROR,
    STATUS_CONFIGURATION_ERROR,
    STATUS_INSUFFICIENT_EVIDENCE,
    STATUS_INVALID_LANGUAGE,
    STATUS_INVALID_RESPONSE,
    STATUS_NO_EVIDENCE,
    STATUS_SUCCESS,
)
from src.evidence_builder import ArticleReference, EvidencePack
from src.openai_rag_connector import (
    ENV_API_KEY,
    ENV_MODEL,
    _JSON_FORMAT_INSTRUCTION,
    call_openai_rag,
)
from src.prompt_builder import build_prompt


# ---------------------------------------------------------------------------
# Mock Client — openai.OpenAI와 동일한 형태(client.chat.completions.create)를
# 흉내내되, 실제 네트워크 요청은 전혀 하지 않는다.
# ---------------------------------------------------------------------------


class _FakeMessage:
    def __init__(self, content):
        self.content = content


class _FakeChoice:
    def __init__(self, content):
        self.message = _FakeMessage(content)


class _FakeResponse:
    def __init__(self, content):
        self.choices = [_FakeChoice(content)]


class _FakeCompletions:
    def __init__(self, content=None, exception=None):
        self._content = content
        self._exception = exception
        self.calls: list[dict] = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if self._exception is not None:
            raise self._exception
        return _FakeResponse(self._content)


class _FakeChat:
    def __init__(self, completions):
        self.completions = completions


class FakeOpenAIClient:
    """openai.OpenAI()와 동일한 인터페이스(client.chat.completions.create)를
    갖는 테스트 전용 Mock. 실제 API를 호출하지 않는다."""

    def __init__(self, content: str | None = None, exception: Exception | None = None):
        self.completions = _FakeCompletions(content, exception)
        self.chat = _FakeChat(self.completions)

    @property
    def calls(self) -> list[dict]:
        return self.completions.calls


# ---------------------------------------------------------------------------
# 픽스처
# ---------------------------------------------------------------------------


def _evidence_pack(**overrides) -> EvidencePack:
    base = dict(
        document_id="tmquan:1001",
        document_number=["152/2020/NĐ-CP"],
        title="Nghị định quy định về giấy phép lao động",
        issuing_authority="Chính phủ",
        effective_date="2021-02-15",
        status="active",
        official_url="https://vbpl.vn/van-ban/chi-tiet/x1",
        articles=[
            ArticleReference(article_no="9", clause_no=None, item_no=None,
                              heading="Điều 9", score=85.0, match_type="canonical_concept"),
        ],
        search_keywords=["giấy phép lao động"],
        top_score=85.0,
        top_match_type="canonical_concept",
        original_title="Nghị định quy định về giấy phép lao động",
        original_headings=["Điều 9"],
    )
    base.update(overrides)
    return EvidencePack(**base)


def _prompt(evidence_packs=None, language="ko", question="노동허가 조건이 뭔가요?"):
    return build_prompt(evidence_packs or [_evidence_pack()], user_question=question, language=language)


def _valid_json_response(document_number="152/2020/NĐ-CP", article="Điều 9") -> str:
    return json.dumps({
        "summary": "노동허가는 관련 시행령에 따라 발급됩니다.",
        "legal_basis": [{"document_number": document_number, "article": article}],
        "risk_factors": ["경력요건 미충족 시 반려 위험"],
        "required_documents": ["여권 사본", "학위증명서"],
        "expert_review_required": False,
        "expert_review_reason": None,
    }, ensure_ascii=False)


@pytest.fixture(autouse=True)
def _clean_openai_env(monkeypatch):
    """모든 테스트는 환경변수를 명시적으로 세팅/해제해야 하므로, 매 테스트
    시작 전 OPENAI_API_KEY/OPENAI_MODEL을 항상 제거해 격리한다."""
    monkeypatch.delenv(ENV_API_KEY, raising=False)
    monkeypatch.delenv(ENV_MODEL, raising=False)
    yield


# ---------------------------------------------------------------------------
# 1. Evidence 없음 -> OpenAI 호출 0회
# ---------------------------------------------------------------------------


def test_no_evidence_returns_no_evidence_status_without_calling_openai():
    prompt = _prompt(evidence_packs=[])
    client = FakeOpenAIClient(content=_valid_json_response())
    result = call_openai_rag(prompt, evidence_packs=[], api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_NO_EVIDENCE
    assert client.calls == []  # OpenAI 호출 0회


# ---------------------------------------------------------------------------
# 2. Prompt 전달 검증
# ---------------------------------------------------------------------------


def test_prompt_is_passed_to_client_unchanged():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_valid_json_response())
    call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)

    assert len(client.calls) == 1
    messages = client.calls[0]["messages"]
    system_messages = [m["content"] for m in messages if m["role"] == "system"]
    user_messages = [m["content"] for m in messages if m["role"] == "user"]
    assert prompt.system_prompt in system_messages  # Prompt Builder 결과 그대로 전달됨
    assert user_messages == [prompt.user_prompt]
    assert client.calls[0]["model"] == "gpt-4o"


# ---------------------------------------------------------------------------
# 3. JSON 파싱 성공/실패
# ---------------------------------------------------------------------------


def test_valid_json_response_returns_success():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_valid_json_response())
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_SUCCESS
    assert result.summary
    assert result.model == "gpt-4o"


def test_invalid_json_response_returns_invalid_response():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content="이것은 JSON이 아닙니다 { 깨진 텍스트")
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_INVALID_RESPONSE
    assert result.raw_text == "이것은 JSON이 아닙니다 { 깨진 텍스트"


def test_non_dict_json_response_returns_invalid_response():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=json.dumps(["a", "b"]))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_INVALID_RESPONSE


# ---------------------------------------------------------------------------
# 4. API 예외
# ---------------------------------------------------------------------------


def test_api_exception_returns_api_error():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(exception=ConnectionError("network down"))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_API_ERROR
    assert result.error_code == "ConnectionError"


# ---------------------------------------------------------------------------
# 5. API KEY / MODEL 없음
# ---------------------------------------------------------------------------


def test_missing_api_key_returns_configuration_error_and_no_call():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_valid_json_response())
    result = call_openai_rag(prompt, evidence_packs=packs, api_key=None, model="gpt-4o", client=client)
    assert result.status == STATUS_CONFIGURATION_ERROR
    assert client.calls == []


def test_missing_model_returns_configuration_error_and_no_call():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_valid_json_response())
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model=None, client=client)
    assert result.status == STATUS_CONFIGURATION_ERROR
    assert client.calls == []


def test_api_key_read_from_environment_variable(monkeypatch):
    monkeypatch.setenv(ENV_API_KEY, "sk-env-test")
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_valid_json_response())
    result = call_openai_rag(prompt, evidence_packs=packs, api_key=None, model="gpt-4o", client=client)
    assert result.status == STATUS_SUCCESS
    assert len(client.calls) == 1


def test_model_read_from_environment_variable(monkeypatch):
    monkeypatch.setenv(ENV_MODEL, "gpt-4o-env")
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_valid_json_response())
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model=None, client=client)
    assert result.status == STATUS_SUCCESS
    assert result.model == "gpt-4o-env"


# ---------------------------------------------------------------------------
# 6. ko/en/zh/vi 지원 + 미지원 언어
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("language", ["ko", "en", "zh", "vi"])
def test_supported_languages_succeed(language):
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs, language=language)
    client = FakeOpenAIClient(content=_valid_json_response())
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_SUCCESS
    assert result.language == language


def test_unsupported_language_returns_invalid_language_without_calling_openai():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs, language="fr")
    client = FakeOpenAIClient(content=_valid_json_response())
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_INVALID_LANGUAGE
    assert client.calls == []


# ---------------------------------------------------------------------------
# 7. Citation 유지 / 제거 / insufficient_evidence
# ---------------------------------------------------------------------------


def test_citation_matching_evidence_is_kept():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_valid_json_response(document_number="152/2020/NĐ-CP", article="Điều 9"))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_SUCCESS
    assert len(result.legal_basis) == 1
    assert result.legal_basis[0].document_number == "152/2020/NĐ-CP"
    assert result.legal_basis[0].article == "Điều 9"


def test_citation_with_unknown_document_number_is_removed():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_valid_json_response(document_number="999/9999/XX-YY", article="Điều 1"))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.legal_basis == []
    assert result.status == STATUS_INSUFFICIENT_EVIDENCE  # 인용을 시도했으나 전부 무효화됨


def test_citation_with_known_document_but_unknown_article_becomes_null():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    # 문서번호는 유효하지만 Evidence에 없는 조항(Điều 999)을 인용
    client = FakeOpenAIClient(content=_valid_json_response(document_number="152/2020/NĐ-CP", article="Điều 999"))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert len(result.legal_basis) == 1
    assert result.legal_basis[0].document_number == "152/2020/NĐ-CP"
    assert result.legal_basis[0].article is None  # 조항만 null로 대체, citation 자체는 유지
    assert result.status == STATUS_SUCCESS  # 문서번호 자체는 유효했으므로 success 유지


def test_all_citations_removed_results_in_insufficient_evidence():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    raw = json.dumps({
        "summary": "요약",
        "legal_basis": [
            {"document_number": "999/AAAA", "article": "Điều 1"},
            {"document_number": "888/BBBB", "article": "Điều 2"},
        ],
        "risk_factors": [],
        "required_documents": [],
        "expert_review_required": False,
    }, ensure_ascii=False)
    client = FakeOpenAIClient(content=raw)
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_INSUFFICIENT_EVIDENCE
    assert result.legal_basis == []
    assert result.expert_review_required is True


def test_no_citations_in_response_still_succeeds():
    """모델이 애초에 legal_basis를 제시하지 않은 경우(빈 리스트)는 '인용 시도 후
    실패'가 아니므로 insufficient_evidence로 강등하지 않는다."""
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    raw = json.dumps({
        "summary": "요약",
        "legal_basis": [],
        "risk_factors": [],
        "required_documents": [],
        "expert_review_required": True,
        "expert_review_reason": "구체적 사안 확인 필요",
    }, ensure_ascii=False)
    client = FakeOpenAIClient(content=raw)
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_SUCCESS
    assert result.legal_basis == []


# ---------------------------------------------------------------------------
# 7-1. Citation 판단 근거(note/basis/quote_or_basis) 호환 파싱
# ---------------------------------------------------------------------------


def _response_with_basis_field(field_name: str | None, value=None, *, document_number="152/2020/NĐ-CP", article="Điều 9") -> str:
    citation = {"document_number": document_number, "article": article}
    if field_name is not None:
        citation[field_name] = value
    return json.dumps({
        "summary": "요약",
        "legal_basis": [citation],
        "risk_factors": [],
        "required_documents": [],
        "expert_review_required": False,
        "expert_review_reason": None,
    }, ensure_ascii=False)


def test_legal_basis_note_is_parsed_and_preserved():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_response_with_basis_field("note", "제9조가 신청 요건의 근거입니다."))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.legal_basis[0].note == "제9조가 신청 요건의 근거입니다."


def test_legal_basis_basis_field_is_used_as_fallback():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_response_with_basis_field("basis", "Evidence에 근거한 판단입니다."))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.legal_basis[0].note == "Evidence에 근거한 판단입니다."


def test_legal_basis_quote_or_basis_field_is_used_as_fallback():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_response_with_basis_field("quote_or_basis", "원문 Evidence를 요약한 근거입니다."))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.legal_basis[0].note == "원문 Evidence를 요약한 근거입니다."


def test_missing_legal_basis_note_becomes_none():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_response_with_basis_field(None))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.legal_basis[0].note is None


def test_unknown_document_removes_citation_and_its_note():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_response_with_basis_field(
        "note", "이 근거도 함께 제거되어야 합니다.", document_number="999/9999/XX-YY", article="Điều 1"
    ))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.legal_basis == []
    assert result.status == STATUS_INSUFFICIENT_EVIDENCE


def test_known_document_and_article_preserve_note():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_response_with_basis_field("note", "검증된 문서와 조항의 판단 근거입니다."))
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.legal_basis[0].document_number == "152/2020/NĐ-CP"
    assert result.legal_basis[0].article == "Điều 9"
    assert result.legal_basis[0].note == "검증된 문서와 조항의 판단 근거입니다."


def test_json_format_instruction_requires_note_field():
    assert '"note"' in _JSON_FORMAT_INSTRUCTION
    assert "판단 근거" in _JSON_FORMAT_INSTRUCTION
    assert "Evidence에 없는" in _JSON_FORMAT_INSTRUCTION


# ---------------------------------------------------------------------------
# 8. PromptPackage 불변성
# ---------------------------------------------------------------------------


def test_prompt_package_not_mutated():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    snapshot = copy.deepcopy(prompt)
    client = FakeOpenAIClient(content=_valid_json_response())
    call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert prompt == snapshot


def test_evidence_packs_not_mutated():
    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    snapshot = copy.deepcopy(packs)
    client = FakeOpenAIClient(content=_valid_json_response())
    call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert packs == snapshot


# ---------------------------------------------------------------------------
# 9. Mock Client만 사용됨 — 실제 openai.OpenAI가 생성/호출되지 않는지 확인
# ---------------------------------------------------------------------------


def test_real_openai_client_never_constructed_when_mock_is_injected(monkeypatch):
    import openai as real_openai

    def _fail_if_called(*args, **kwargs):
        raise AssertionError("실제 openai.OpenAI()가 생성되면 안 됨 — Mock Client가 주입되었음")

    monkeypatch.setattr(real_openai, "OpenAI", _fail_if_called)

    packs = [_evidence_pack()]
    prompt = _prompt(evidence_packs=packs)
    client = FakeOpenAIClient(content=_valid_json_response())
    result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)
    assert result.status == STATUS_SUCCESS  # 예외 없이 정상 완료 -> 실제 client 생성자가 호출되지 않았음을 의미


# ---------------------------------------------------------------------------
# 10. 통합 테스트 — Search Engine -> Evidence Builder -> Prompt Builder ->
#     OpenAI Connector(Mock) -> AIReviewResult 전체 파이프라인
# ---------------------------------------------------------------------------


class TestFullPipelineIntegration:
    @staticmethod
    def _build_index():
        from pathlib import Path
        from src.search_engine import LegalSearchIndex

        return LegalSearchIndex.from_pipeline_jsonl(
            Path(__file__).resolve().parents[1] / "data" / "normalized" / "documents_deduped.jsonl",
            Path(__file__).resolve().parents[1] / "data" / "normalized" / "chunks.jsonl",
        )

    def test_full_pipeline_with_real_search_results(self):
        from src.evidence_builder import build_evidence_packs

        index = self._build_index()
        results = index.search(query="노동허가", language="ko", limit=5)
        packs = build_evidence_packs(results, query="giấy phép lao động", documents_by_id=index.documents_by_id)
        prompt = build_prompt(packs, user_question="노동허가 조건이 뭔가요?", language="ko")

        client = FakeOpenAIClient(content=_valid_json_response(
            document_number=packs[0].document_number[0] if packs and packs[0].document_number else "unknown",
            article=None,
        ))
        result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)

        assert result.status in (STATUS_SUCCESS, STATUS_INSUFFICIENT_EVIDENCE)
        assert len(client.calls) == 1  # OpenAI 호출은 정확히 1회만
        assert result.source_document_count == prompt.document_count

    def test_full_pipeline_with_no_search_results(self):
        """검색 결과가 아예 없는 경우: Evidence Builder -> 빈 리스트 ->
        Prompt Builder -> Connector까지 이어져도 OpenAI 호출이 발생하면 안 된다."""
        from src.evidence_builder import build_evidence_packs

        empty_results = []  # 검색 결과 없음을 시뮬레이션
        packs = build_evidence_packs(empty_results, query="존재하지 않는 법령 검색어")
        prompt = build_prompt(packs, user_question="이 질문에 대한 근거가 있나요?", language="ko")

        client = FakeOpenAIClient(content=_valid_json_response())
        result = call_openai_rag(prompt, evidence_packs=packs, api_key="sk-test", model="gpt-4o", client=client)

        assert result.status == STATUS_NO_EVIDENCE
        assert client.calls == []  # OpenAI 호출 0회
