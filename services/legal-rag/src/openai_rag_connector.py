"""
VFBCAI Legal Intelligence Platform — OpenAI RAG Connector (STEP5-3).

Prompt Builder가 만든 PromptPackage를 실제 OpenAI Chat Completions API에
전달하고, 응답을 파싱해 AIReviewResult로 변환하는 Connector.

이 모듈이 담당하는 것은 딱 4가지뿐이다:
    1. Prompt 전달(공식 OpenAI SDK, `client.chat.completions.create`)
    2. 응답 JSON 파싱
    3. Citation(문서번호/조항) 검증 — Evidence Pack에 실제로 존재하는 것만 허용
    4. 오류 처리(설정 오류/언어 오류/파싱 오류/API 오류를 상태 코드로 매핑)

⚠️ Search Engine/Evidence Builder/Prompt Builder/Result Localizer/Dataset/
   Pipeline은 이 모듈에서 전혀 수정하지 않는다(읽기 전용 import만). 이 모듈
   자체도 법률/조항/준비서류/Evidence를 새로 만들어내지 않는다 — Prompt
   Builder가 만든 프롬프트를 그대로 보내고, 모델이 인용한 근거를 Evidence
   Pack과 대조해서 "검증"만 한다.
"""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Any

from .ai_review_models import (
    ALL_STATUSES,
    STATUS_API_ERROR,
    STATUS_CONFIGURATION_ERROR,
    STATUS_INSUFFICIENT_EVIDENCE,
    STATUS_INVALID_LANGUAGE,
    STATUS_INVALID_RESPONSE,
    STATUS_NO_EVIDENCE,
    STATUS_SUCCESS,
    SUPPORTED_LANGUAGES,
    AIReviewResult,
    LegalBasisCitation,
)
from .evidence_builder import EvidencePack
from .prompt_builder import PromptPackage

logger = logging.getLogger("legal_rag.openai_rag_connector")

# ---------------------------------------------------------------------------
# 환경변수 이름 (하드코딩 금지 — 값 자체는 항상 환경변수 또는 명시적 인자로만 받는다)
# ---------------------------------------------------------------------------

ENV_API_KEY = "OPENAI_API_KEY"
ENV_MODEL = "OPENAI_MODEL"

# 모델에게 구조화된 JSON으로만 답하도록 요구하는 "기술적" 포맷 지시문.
# ⚠️ 이것은 법률/조항/준비서류/Evidence 내용을 추가하는 것이 아니라, 응답을
#    파싱 가능한 형태로 받기 위한 순수 포맷 규격이다(Prompt Builder가 만든
#    system_prompt/user_prompt 문자열 자체는 이 모듈에서 전혀 수정하지 않고
#    그대로 별도 메시지로 추가 전달할 뿐이다 — "Prompt Builder 결과를 그대로
#    사용" 원칙 준수).
_JSON_FORMAT_INSTRUCTION = (
    "반드시 아래 JSON 스키마 형태로만 응답하십시오(다른 텍스트를 추가하지 마십시오):\n"
    "{\n"
    '  "summary": "요약 문자열",\n'
    '  "legal_basis": [{"document_number": "문서번호", "article": "관련 조항 또는 null", '
    '"note": "해당 법령과 조항이 판단 근거가 되는 이유"}],\n'
    '  "risk_factors": ["위험 요인 문자열", ...],\n'
    '  "required_documents": ["준비서류 문자열", ...],\n'
    '  "expert_review_required": true 또는 false,\n'
    '  "expert_review_reason": "사유 문자열 또는 null"\n'
    "}\n"
    "legal_basis의 document_number와 article은 반드시 제공된 Evidence Section에 "
    "실제로 존재하는 값만 사용하십시오. note는 해당 Evidence에 근거한 판단 이유만 "
    "작성해야 하며, Evidence에 없는 법률 내용, 조항 내용, 의무 또는 준비서류를 "
    "생성하지 마십시오."
)


# ---------------------------------------------------------------------------
# 설정(API KEY / MODEL) 해석 — 하드코딩 금지, 인자 우선 -> 환경변수
# ---------------------------------------------------------------------------


def _resolve_api_key(api_key: str | None) -> str | None:
    return api_key if api_key else os.environ.get(ENV_API_KEY) or None


def _resolve_model(model: str | None) -> str | None:
    return model if model else os.environ.get(ENV_MODEL) or None


# ---------------------------------------------------------------------------
# 응답 JSON 파싱
# ---------------------------------------------------------------------------

_MARKDOWN_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE | re.MULTILINE)


def _extract_json_text(raw: str) -> str:
    """일부 모델이 JSON을 마크다운 코드펜스로 감싸는 경우를 대비한 방어적 정리.
    (response_format=json_object를 요청하지만, 다양한 client/모델 조합에 대비)"""
    if not raw:
        return raw
    return _MARKDOWN_FENCE_RE.sub("", raw).strip()


def _parse_response_json(raw_text: str) -> dict | None:
    try:
        cleaned = _extract_json_text(raw_text)
        parsed = json.loads(cleaned)
    except (json.JSONDecodeError, TypeError):
        return None
    if not isinstance(parsed, dict):
        return None
    return parsed


# ---------------------------------------------------------------------------
# Citation 검증 — Evidence Pack에 실제로 존재하는 문서번호/조항만 허용
# ---------------------------------------------------------------------------


def _format_article_locator(article) -> str | None:
    if article.article_no is None and article.clause_no is None and article.item_no is None:
        return None
    parts = [f"Điều {article.article_no}"] if article.article_no else []
    if article.clause_no:
        parts.append(f"Khoản {article.clause_no}")
    if article.item_no:
        parts.append(f"Điểm {article.item_no}")
    return " ".join(parts) if parts else None


def _build_evidence_lookup(
    evidence_packs: list[EvidencePack],
) -> tuple[set[str], dict[str, set[str]]]:
    """(유효 문서번호 집합, {문서번호 -> 유효 조항 표기 집합}) 을 만든다.
    Evidence Pack/ArticleReference는 이 함수에서 읽기만 하며 전혀 mutate하지 않는다."""
    valid_document_numbers: set[str] = set()
    valid_articles_by_document: dict[str, set[str]] = {}

    for pack in evidence_packs:
        for doc_number in pack.document_number:
            valid_document_numbers.add(doc_number)
            locator_set = valid_articles_by_document.setdefault(doc_number, set())
            for article in pack.articles:
                locator = _format_article_locator(article)
                if locator:
                    locator_set.add(locator)

    return valid_document_numbers, valid_articles_by_document


def _validate_citations(
    raw_legal_basis: Any, evidence_packs: list[EvidencePack]
) -> list[LegalBasisCitation]:
    """모델이 응답한 legal_basis(list[dict])를 Evidence Pack과 대조해 검증한다.
    - Evidence에 없는 문서번호를 가진 citation은 통째로 제거한다.
    - 문서번호는 유효하지만 조항이 Evidence에 없으면 article을 None으로 대체한다
      (지시사항: "조항 제거 또는 null" 중 null 대체 방식을 채택).
    """
    if not isinstance(raw_legal_basis, list):
        return []

    valid_document_numbers, valid_articles_by_document = _build_evidence_lookup(evidence_packs)

    validated: list[LegalBasisCitation] = []
    for item in raw_legal_basis:
        if not isinstance(item, dict):
            continue
        document_number = item.get("document_number")
        if not document_number or document_number not in valid_document_numbers:
            continue  # Evidence에 없는 문서번호 -> citation 자체를 제거
        article = item.get("article")
        valid_locators = valid_articles_by_document.get(document_number, set())
        if article is not None and article not in valid_locators:
            article = None  # Evidence에 없는 조항 -> null로 대체
        # 판단 근거 설명은 모델/버전별 호환성을 위해 note -> basis ->
        # quote_or_basis 순서로 읽는다. 단, 이 자유 텍스트의 사실성을 완전히
        # 자동 검증할 수는 없으므로 문서번호/조항만 whitelist로 강제 검증한다.
        note_value = item.get("note")
        if not isinstance(note_value, str):
            note_value = item.get("basis")
        if not isinstance(note_value, str):
            note_value = item.get("quote_or_basis")
        note = note_value if isinstance(note_value, str) else None

        validated.append(LegalBasisCitation(document_number=document_number, article=article, note=note))

    return validated


# ---------------------------------------------------------------------------
# 메시지 조립(OpenAI SDK 형식) — Prompt Builder 결과는 절대 수정하지 않고
# 그대로 별도 메시지로 전달한다. 포맷 지시문은 완전히 별개의 system 메시지로
# 추가한다(법률/조항/준비서류/Evidence 내용 추가가 아니라 순수 응답 형식 지시).
# ---------------------------------------------------------------------------


def _build_messages(prompt_package: PromptPackage) -> list[dict]:
    return [
        {"role": "system", "content": prompt_package.system_prompt},
        {"role": "system", "content": _JSON_FORMAT_INSTRUCTION},
        {"role": "user", "content": prompt_package.user_prompt},
    ]


# ---------------------------------------------------------------------------
# 핵심 Connector 함수
# ---------------------------------------------------------------------------


def call_openai_rag(
    prompt_package: PromptPackage,
    evidence_packs: list[EvidencePack],
    api_key: str | None = None,
    model: str | None = None,
    client: Any | None = None,
) -> AIReviewResult:
    """PromptPackage + Evidence Pack -> AIReviewResult.

    `client`(선택)는 공식 OpenAI SDK의 `openai.OpenAI` 인스턴스와 동일한
    형태(`client.chat.completions.create(model=..., messages=..., response_format=...)`)를
    갖는 객체를 기대한다. 테스트에서는 이 자리에 실제 API를 호출하지 않는
    Mock 객체를 주입한다. `client`가 주어지지 않고 아래 모든 사전 조건을
    통과한 경우에만, 이 함수는 `openai` 패키지를 지연 import해 실제
    `openai.OpenAI(api_key=...)` 클라이언트를 생성한다(이 STEP에서는 실제
    호출을 수행하지 않는 것이 원칙이므로, 실제 운영 연결 시점에만 이 경로가
    실행되도록 설계했다).
    """
    document_count = prompt_package.document_count
    language = prompt_package.metadata.get("language") if prompt_package.metadata else None

    # ---- 1) Evidence 0 -> 절대 호출 금지 ----
    if document_count <= 0 or not evidence_packs:
        return AIReviewResult(
            status=STATUS_NO_EVIDENCE,
            language=language,
            expert_review_required=True,
            expert_review_reason="검색된 관련 법령 근거(Evidence)가 없어 AI 검토를 수행하지 않았습니다.",
            source_document_count=document_count,
            source_article_count=prompt_package.article_count,
            model=model,
            error_code=STATUS_NO_EVIDENCE,
        )

    # ---- 2) Prompt 비어있음 -> 절대 호출 금지(설정/입력 오류로 간주) ----
    if not (prompt_package.system_prompt or "").strip() or not (prompt_package.user_prompt or "").strip():
        return AIReviewResult(
            status=STATUS_CONFIGURATION_ERROR,
            language=language,
            expert_review_required=True,
            expert_review_reason="Prompt가 비어 있어 AI 검토를 수행할 수 없습니다.",
            source_document_count=document_count,
            source_article_count=prompt_package.article_count,
            model=model,
            error_code="empty_prompt",
        )

    # ---- 3) 지원하지 않는 언어 -> 호출 금지 ----
    if language is not None and language not in SUPPORTED_LANGUAGES:
        return AIReviewResult(
            status=STATUS_INVALID_LANGUAGE,
            language=language,
            expert_review_required=True,
            expert_review_reason=f"지원하지 않는 언어입니다: {language}",
            source_document_count=document_count,
            source_article_count=prompt_package.article_count,
            model=model,
            error_code=STATUS_INVALID_LANGUAGE,
        )
    resolved_language = language or "vi"

    # ---- 4) API KEY 없음 -> 호출 금지 ----
    resolved_api_key = _resolve_api_key(api_key)
    if not resolved_api_key:
        return AIReviewResult(
            status=STATUS_CONFIGURATION_ERROR,
            language=resolved_language,
            expert_review_required=True,
            expert_review_reason=f"{ENV_API_KEY}가 설정되지 않아 AI 검토를 수행할 수 없습니다.",
            source_document_count=document_count,
            source_article_count=prompt_package.article_count,
            model=model,
            error_code="missing_api_key",
        )

    # ---- 5) MODEL 없음 -> 호출 금지 ----
    resolved_model = _resolve_model(model)
    if not resolved_model:
        return AIReviewResult(
            status=STATUS_CONFIGURATION_ERROR,
            language=resolved_language,
            expert_review_required=True,
            expert_review_reason=f"{ENV_MODEL}이 설정되지 않아 AI 검토를 수행할 수 없습니다.",
            source_document_count=document_count,
            source_article_count=prompt_package.article_count,
            model=None,
            error_code="missing_model",
        )

    # ---- 6) 실제 호출(또는 주입된 Mock 호출) ----
    messages = _build_messages(prompt_package)

    if client is None:
        try:
            import openai  # 지연 import — 이 STEP에서는 실제로 도달하지 않는 경로(테스트는 항상 client 주입)
        except ImportError:
            return AIReviewResult(
                status=STATUS_CONFIGURATION_ERROR,
                language=resolved_language,
                expert_review_required=True,
                expert_review_reason="openai 패키지가 설치되어 있지 않습니다.",
                source_document_count=document_count,
                source_article_count=prompt_package.article_count,
                model=resolved_model,
                error_code="openai_not_installed",
            )
        client = openai.OpenAI(api_key=resolved_api_key)

    try:
        response = client.chat.completions.create(
            model=resolved_model,
            messages=messages,
            response_format={"type": "json_object"},
        )
        raw_text = response.choices[0].message.content
    except Exception as exc:  # noqa: BLE001 — 어떤 client(Mock 포함)가 던지는 예외든 api_error로 매핑
        logger.warning("OpenAI 호출 실패: %s", exc)
        return AIReviewResult(
            status=STATUS_API_ERROR,
            language=resolved_language,
            expert_review_required=True,
            expert_review_reason="OpenAI API 호출 중 오류가 발생했습니다.",
            source_document_count=document_count,
            source_article_count=prompt_package.article_count,
            model=resolved_model,
            error_code=type(exc).__name__,
        )

    # ---- 7) JSON 파싱 ----
    parsed = _parse_response_json(raw_text)
    if parsed is None:
        return AIReviewResult(
            status=STATUS_INVALID_RESPONSE,
            language=resolved_language,
            expert_review_required=True,
            expert_review_reason="AI 응답을 해석할 수 없어 전문가 검토가 필요합니다.",
            source_document_count=document_count,
            source_article_count=prompt_package.article_count,
            model=resolved_model,
            raw_text=raw_text,
            error_code=STATUS_INVALID_RESPONSE,
        )

    # ---- 8) Citation 검증 ----
    validated_legal_basis = _validate_citations(parsed.get("legal_basis"), evidence_packs)

    raw_had_citations = bool(parsed.get("legal_basis"))
    status = STATUS_SUCCESS
    expert_review_required = bool(parsed.get("expert_review_required", False))
    expert_review_reason = parsed.get("expert_review_reason") if isinstance(parsed.get("expert_review_reason"), str) else None

    if raw_had_citations and not validated_legal_basis:
        # 모델이 인용을 시도했지만 전부 Evidence 밖이었던 경우 -> 근거 불충분
        status = STATUS_INSUFFICIENT_EVIDENCE
        expert_review_required = True
        expert_review_reason = expert_review_reason or "AI가 제시한 근거가 검색된 Evidence와 일치하지 않아 추가 전문가 검토가 필요합니다."

    summary = parsed.get("summary") if isinstance(parsed.get("summary"), str) else None
    risk_factors = [x for x in parsed.get("risk_factors", []) if isinstance(x, str)] if isinstance(parsed.get("risk_factors"), list) else []
    required_documents = (
        [x for x in parsed.get("required_documents", []) if isinstance(x, str)]
        if isinstance(parsed.get("required_documents"), list) else []
    )

    return AIReviewResult(
        status=status,
        language=resolved_language,
        summary=summary,
        legal_basis=validated_legal_basis,
        risk_factors=risk_factors,
        required_documents=required_documents,
        expert_review_required=expert_review_required,
        expert_review_reason=expert_review_reason,
        source_document_count=document_count,
        source_article_count=prompt_package.article_count,
        model=resolved_model,
        raw_text=raw_text,
        error_code=None if status == STATUS_SUCCESS else status,
    )
