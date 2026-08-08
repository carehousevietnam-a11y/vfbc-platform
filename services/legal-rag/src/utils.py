"""
공통 유틸리티. 네트워크 없이 단위 테스트 가능한 순수 함수들로 구성.
(tests/test_utils.py 참고 — 이 모듈은 실제로 실행/검증되었음)
"""

from __future__ import annotations

import functools
import hashlib
import logging
import re
import time
import unicodedata
from datetime import date, datetime

logger = logging.getLogger("legal_rag")

# ---------------------------------------------------------------------------
# Hashing
# ---------------------------------------------------------------------------


def sha256_text(text: str) -> str:
    """정제된 본문 텍스트의 SHA-256 해시(contentHash) 계산."""
    if text is None:
        return ""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_file(path: str, chunk_size: int = 1024 * 1024) -> str:
    """다운로드된 파일의 SHA-256 계산 (download_datasets.py의 무결성 검증용)."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


# ---------------------------------------------------------------------------
# Vietnamese text normalization
# ---------------------------------------------------------------------------

_WHITESPACE_RE = re.compile(r"[ \t\u00a0]+")
_MULTI_NEWLINE_RE = re.compile(r"\n{3,}")

# 법률 구조 마커(Phần/Chương/Mục/Điều) 앞에 개행 삽입 — tmquan markdown은 종종
# 줄바꿈 없이 한 줄로 저장되어 parse_legal_structure의 ^\s*Điều 정규식이
# 매칭하지 못한다. 정규화 단계에서 마커 경계를 복원한다(파서 변경보다 낮은 리스크).
_LEGAL_STRUCTURE_NEWLINE_RES: list[re.Pattern] = [
    re.compile(r"(?<=\S)\s+(?=Phần\s+(?:thứ\s+)?(?:[IVXLCDM\d]+)\b)", re.IGNORECASE | re.UNICODE),
    re.compile(r"(?<=\S)\s+(?=Chương\s+(?:[IVXLCDM\d]+)\b)", re.IGNORECASE | re.UNICODE),
    re.compile(r"(?<=\S)\s+(?=Mục\s+\d+\b)", re.IGNORECASE | re.UNICODE),
    # 조문 헤더는 "Điều N." 형태가 대부분 — 본문 인용 "theo Điều 5 Luật" 오탐 완화
    re.compile(r"(?<=\S)\s+(?=Điều\s+\d+\.)", re.IGNORECASE | re.UNICODE),
]

# 구형/신형 정서법 정규화(1984년 이후 표준) — VFBCAI 마스터문서 9장에서 언급된
# tmquan 데이터셋의 정규화 방식과 동일한 원칙(Toà→Tòa 등)을 자체 정규화 시에도 적용.
_TONE_MARK_FIXES = {
    "Ủ": "Ủ",  # NFC 통일 (분해형 -> 결합형)
    "Òa": "Òa",
    "oà": "oà",
}

# HTML/CSS/스캐폴딩 제거용 패턴(단순 케이스만, 실 데이터의 정확한 스캐폴딩 형태는
# audit_datasets.py 실행 후 보강 필요)
_HTML_TAG_RE = re.compile(r"<[^>]+>")
_CSS_BLOCK_RE = re.compile(r"\{[^{}]*\}")
_MSO_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


def _insert_legal_structure_newlines(text: str) -> str:
    """연속 문자열 본문에서 Phần/Chương/Mục/Điều 마커 앞에 개행을 삽입한다."""
    for pattern in _LEGAL_STRUCTURE_NEWLINE_RES:
        text = pattern.sub("\n", text)
    return text


def normalize_vietnamese_text(raw: str) -> str:
    """
    NFC 정규화 + 공백 정리. HTML/CSS 스캐폴딩이 섞여 있으면 제거.
    원본(originalText)은 이 함수의 입력으로만 사용하고, 원본 자체는 수정하지 않는다
    (normalizedText 필드에만 결과를 저장).
    """
    if not raw:
        return ""

    text = unicodedata.normalize("NFC", raw)

    # HTML 본문인 경우 태그/스크립트 제거 (th1nhng0 content_html 대응)
    if "<" in text and ">" in text:
        text = _MSO_COMMENT_RE.sub(" ", text)
        text = _HTML_TAG_RE.sub(" ", text)

    text = _insert_legal_structure_newlines(text)
    text = _WHITESPACE_RE.sub(" ", text)
    text = _MULTI_NEWLINE_RE.sub("\n\n", text)
    text = "\n".join(line.strip() for line in text.split("\n"))
    return text.strip()


def build_search_text(normalized: str) -> str:
    """
    PostgreSQL FTS(`simple` config) + pg_trgm 대상 검색 텍스트 생성.
    베트남어 전용 사전을 가정하지 않으므로(STEP1-1 지시사항), 소문자 변환과
    공백 정리만 수행하고 발음 구별 기호(dấu)는 보존한다 — trigram 검색은
    원 표기 그대로 매칭해야 하기 때문.
    """
    if not normalized:
        return ""
    text = normalized.lower()
    text = _WHITESPACE_RE.sub(" ", text)
    return text.strip()


# ---------------------------------------------------------------------------
# Document number normalization
# ---------------------------------------------------------------------------

# "Nghị quyết số: 528/2018/UBTVQH14" 같은 접두어 제거
_DOC_NUM_PREFIX_RE = re.compile(
    r"^\s*(nghị\s+quyết|nghị\s+định|quyết\s+định|thông\s+tư(?:\s+liên\s+tịch)?|"
    r"chỉ\s+thị|luật|pháp\s+lệnh|lệnh|sắc\s+lệnh)\s*(?:số\s*:?)?\s*",
    re.IGNORECASE | re.UNICODE,
)
# "109/2005/QĐ-BCA (A11)" 같은 괄호 주석 제거
_DOC_NUM_TRAILING_ANNOTATION_RE = re.compile(r"\s*\([^)]*\)\s*$")
# "...ngày 18/5/2007" 같은 날짜 꼬리 제거
_DOC_NUM_TRAILING_DATE_RE = re.compile(
    r"\s*ngày\s+\d{1,2}/\d{1,2}/\d{2,4}\s*$", re.IGNORECASE | re.UNICODE
)
# 여러 개 번호를 "và"/","로 나열한 경우 분리
_DOC_NUM_SPLIT_RE = re.compile(r"\s*(?:,|\bvà\b)\s*", re.IGNORECASE | re.UNICODE)

_NO_NUMBER_SENTINEL = "không số"


def normalize_document_number(raw: str | None) -> list[str]:
    """
    원본 문서번호 문자열을 Canonical `documentNumber`(list[str])로 정규화.
    "Không số"(번호 없음)는 그대로 보존한다(docs/Schema.md 참고).
    """
    if not raw or not raw.strip():
        return []

    text = raw.strip()
    if text.lower() == _NO_NUMBER_SENTINEL:
        return [text]

    text = _DOC_NUM_PREFIX_RE.sub("", text)
    text = _DOC_NUM_TRAILING_DATE_RE.sub("", text)
    text = _DOC_NUM_TRAILING_ANNOTATION_RE.sub("", text)

    parts = [p.strip() for p in _DOC_NUM_SPLIT_RE.split(text) if p.strip()]
    return parts if parts else [text]


# ---------------------------------------------------------------------------
# Date normalization
# ---------------------------------------------------------------------------

_DATE_FORMATS = ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d")


def normalize_date(raw: str | None) -> str | None:
    """
    다양한 원본 날짜 포맷(DD/MM/YYYY, YYYY-MM-DD 등)을 ISO YYYY-MM-DD로 변환.
    파싱 실패 시 None 반환(예외를 던지지 않음 — 대량 배치 처리 중 일부 결측/오류
    레코드 때문에 전체 파이프라인이 중단되지 않도록 함).
    """
    if not raw or not str(raw).strip():
        return None
    raw = str(raw).strip()

    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(raw, fmt).date().isoformat()
        except ValueError:
            continue

    # "YYYY-MM-DD 00:00:00" 같은 타임스탬프 형태
    try:
        return datetime.fromisoformat(raw.split(" ")[0].split("T")[0]).date().isoformat()
    except ValueError:
        pass

    logger.warning("normalize_date: 알 수 없는 날짜 형식 - %r", raw)
    return None


# ---------------------------------------------------------------------------
# Slug
# ---------------------------------------------------------------------------

_VI_CHAR_MAP = str.maketrans(
    "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡ"
    "ùúụủũưừứựửữỳýỵỷỹđ"
    "ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ"
    "ÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ",
    "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooo"
    "uuuuuuuuuuuyyyyyd"
    "AAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOO"
    "UUUUUUUUUUUYYYYYD",
)


def slugify_vi(text: str) -> str:
    """베트남어 전체명을 ASCII snake_case slug로 변환 (예: 'Nghị định' -> 'nghi_dinh')."""
    if not text:
        return ""
    text = unicodedata.normalize("NFC", text).translate(_VI_CHAR_MAP)
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "_", text).strip("_")
    return text


# ---------------------------------------------------------------------------
# Retry decorator (download_datasets.py에서 사용)
# ---------------------------------------------------------------------------


def retry(max_attempts: int = 3, base_delay: float = 2.0, exceptions: tuple = (Exception,)):
    """
    지수 백오프 재시도 데코레이터. 외부 라이브러리 의존성 없이 표준 라이브러리만 사용.
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            attempt = 0
            while True:
                attempt += 1
                try:
                    return func(*args, **kwargs)
                except exceptions as exc:  # noqa: BLE001
                    if attempt >= max_attempts:
                        logger.error(
                            "재시도 %d회 모두 실패: %s(%s)", max_attempts, func.__name__, exc
                        )
                        raise
                    delay = base_delay * (2 ** (attempt - 1))
                    logger.warning(
                        "%s 실패(시도 %d/%d), %.1f초 후 재시도: %s",
                        func.__name__,
                        attempt,
                        max_attempts,
                        delay,
                        exc,
                    )
                    time.sleep(delay)

        return wrapper

    return decorator
