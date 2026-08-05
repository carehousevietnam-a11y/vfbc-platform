"""
VFBCAI Legal Intelligence Platform — 다국어 검색어 정규화 (LegalQueryNormalizer).

흐름: 입력 -> (언어 확인: 명시적 지정 or Unicode 기반 자동 감지) -> multilingual_legal_terms.py
사전 조회 -> canonical_vi 반환.

Google Translate API, 그 외 외부 번역 API, LLM을 전혀 사용하지 않는다 — 법률 용어
사전(Ontology) 조회만으로 동작한다.

⚠️ 사전에 없는 질의(대부분의 베트남어 원문 질의 포함)는 원문을 그대로 반환한다
   (trim만 적용, 대소문자/내부 공백은 건드리지 않음) — 기존 검색 결과가 정규화
   도입 전후로 달라지지 않도록 보존하기 위함이다. 사전 조회에만 쓰이는 내부 정규화
   (소문자화/공백정리 등)는 canonical_query에 절대 반영되지 않는다.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

from .multilingual_legal_terms import lookup_canonical_vi

# ---------------------------------------------------------------------------
# 언어 감지
# ---------------------------------------------------------------------------

SUPPORTED_LANGUAGES = ("ko", "en", "zh", "vi")

_HANGUL_RE = re.compile(r"[\uac00-\ud7a3]")
_CJK_RE = re.compile(r"[\u4e00-\u9fff]")
# 베트남어 전용(라틴 알파벳 + 성조/전용 문자) 유니코드 범위 — 성조 결합 문자와
# đ/Đ, ơ/ư 등 베트남어에서만 쓰이는 라틴 확장 문자를 포함한다.
_VIETNAMESE_CHAR_RE = re.compile(
    "[" +
    "\u00c0-\u00c3\u00c8-\u00ca\u00cc\u00cd\u00d2-\u00d5\u00d9\u00da\u00dd"  # À Á Ả Ã È É Ẻ Ẽ Ê Ì Í Ỉ Ĩ Ò Ó Ỏ Õ Ô Ơ Ù Ú Ỳ 등 상위 라틴-1 일부
    "\u00e0-\u00e3\u00e8-\u00ea\u00ec\u00ed\u00f2-\u00f5\u00f9\u00fa\u00fd"  # 소문자 대응
    "\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01a0\u01a1\u01af\u01b0"  # Ă ă Đ đ Ĩ ĩ Ũ ũ Ơ ơ Ư ư
    "\u1ea0-\u1ef9"  # 베트남어 결합 성조 라틴 확장(Ạ..ỹ 전체 블록)
    "]",
    re.IGNORECASE,
)


def detect_language(text: str) -> str:
    """
    Unicode 기반 자동 언어 감지. 우선순위를 고정해 모호함을 없앤다:
      1. 한글 포함 -> ko
      2. CJK(한자) 포함 -> zh
      3. 베트남어 전용 문자 포함 -> vi
      4. ASCII 중심(위 세 범주에 없음) -> en
      5. 그 외(위 어느 것도 아님) -> vi (fallback)
    """
    if not text:
        return "vi"
    if _HANGUL_RE.search(text):
        return "ko"
    if _CJK_RE.search(text):
        return "zh"
    if _VIETNAMESE_CHAR_RE.search(text):
        return "vi"
    if text.isascii():
        return "en"
    return "vi"


# ---------------------------------------------------------------------------
# 정리(clean) — 사전 조회 키 생성 전용. canonical_query에는 사용하지 않음.
# ---------------------------------------------------------------------------


def _clean_for_lookup(text: str) -> str:
    """trim + 연속 공백 정리 + Unicode NFC + 소문자 변환 (사전 조회 키 생성 전용)."""
    if not text:
        return ""
    normalized = unicodedata.normalize("NFC", text).strip().lower()
    return " ".join(normalized.split())


# ---------------------------------------------------------------------------
# 정규화 결과
# ---------------------------------------------------------------------------


@dataclass
class NormalizationResult:
    original_query: str
    detected_language: str      # 실제 사용된 언어(명시적 지정 또는 자동 감지 결과)
    language_source: str        # "explicit" | "auto_detected"
    cleaned_query: str          # 사전 조회용으로만 정리된 버전(디버깅/테스트용)
    canonical_query: str        # 실제 검색 엔진에 전달되는 값
    matched_concept: bool       # 법률 용어 사전에서 매치되었는지 여부


class LegalQueryNormalizer:
    """법률 용어 사전 기반 다국어 검색어 정규화기. 번역 API/LLM 미사용."""

    def detect(self, text: str) -> str:
        return detect_language(text)

    def clean(self, text: str) -> str:
        return _clean_for_lookup(text)

    def normalize(self, query: str, language: str | None = None) -> NormalizationResult:
        original = query or ""

        if language is not None and language in SUPPORTED_LANGUAGES:
            used_language = language
            language_source = "explicit"
        else:
            used_language = self.detect(original)
            language_source = "auto_detected"

        cleaned = self.clean(original)
        canonical = lookup_canonical_vi(cleaned) if cleaned else None

        if canonical is not None:
            # 사전 매치 — canonical_vi(등록된 표준 베트남어 표현)를 그대로 사용.
            return NormalizationResult(
                original_query=original,
                detected_language=used_language,
                language_source=language_source,
                cleaned_query=cleaned,
                canonical_query=canonical,
                matched_concept=True,
            )

        # 사전에 없는 질의 — 원문을 그대로 반환한다(strip만 적용, 기존
        # search_exact.py/search_keyword.py도 내부에서 동일하게 strip을 수행하므로
        # 이 정도의 trim은 기존 검색 결과에 영향을 주지 않는다). 대소문자·내부
        # 공백·유니코드 결합형은 변경하지 않아 베트남어 원문 검색을 그대로 보존한다.
        return NormalizationResult(
            original_query=original,
            detected_language=used_language,
            language_source=language_source,
            cleaned_query=cleaned,
            canonical_query=original.strip(),
            matched_concept=False,
        )
