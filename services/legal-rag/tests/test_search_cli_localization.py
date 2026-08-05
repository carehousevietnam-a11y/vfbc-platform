"""
STEP4 CLI 출력 확인 테스트 (지시사항 최소 검증 항목 11).

--fixture 내장 합성 데이터로 실제 `python -m src.search_cli`를 서브프로세스로
실행해, 4개 언어 텍스트 출력이 로컬라이즈되고 --json 출력은 기존 그대로임을
확인한다.

[Windows UTF-8 회귀 수정] subprocess 실행 시 PYTHONUTF8/PYTHONIOENCODING을
명시적으로 설정하고 encoding="utf-8"/errors="replace"를 사용한다. 또한
Windows PowerShell 기본 콘솔 코드페이지(cp1252)를 시뮬레이션한 테스트를
포함해, search_cli.py의 `_configure_utf8_console()`이 실제로 UnicodeEncodeError를
막아주는지 검증한다(테스트 쪽 환경변수만으로 문제를 숨기지 않기 위함).
"""

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _utf8_env() -> dict:
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"
    return env


def _run_cli(*args: str, env: dict | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, "-m", "src.search_cli", *args],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=30,
        env=env if env is not None else _utf8_env(),
    )


def test_cli_korean_text_output_is_localized():
    proc = _run_cli("--fixture", "--language", "ko", "--query", "노동허가")
    assert proc.returncode == 0, proc.stderr
    # document_type/status가 한국어 라벨로 표시되어야 한다(대괄호 안)
    assert "[" in proc.stdout and "]" in proc.stdout
    assert "결정" in proc.stdout or "시행령" in proc.stdout or "지시" in proc.stdout or "통첩" in proc.stdout \
        or "결의" in proc.stdout or "칙령" in proc.stdout


def test_cli_english_text_output_is_localized():
    proc = _run_cli("--fixture", "--language", "en", "--query", "work permit")
    assert proc.returncode == 0, proc.stderr
    assert proc.stdout.strip() != ""


def test_cli_chinese_text_output_is_localized():
    proc = _run_cli("--fixture", "--language", "zh", "--query", "工作许可证")
    assert proc.returncode == 0, proc.stderr
    assert proc.stdout.strip() != ""


def test_cli_vietnamese_text_output_runs():
    proc = _run_cli("--fixture", "--language", "vi", "--query", "giấy phép lao động")
    assert proc.returncode == 0, proc.stderr
    assert proc.stdout.strip() != ""


def test_cli_json_output_unchanged_by_localization():
    """--json은 STEP4 이전과 완전히 동일한 raw SearchResult 필드만 가져야 한다
    (display_title/document_type_label 같은 Localizer 필드가 섞이면 안 됨)."""
    proc = _run_cli("--fixture", "--language", "ko", "--query", "152/2020/NĐ-CP", "--json")
    assert proc.returncode == 0, proc.stderr
    data = json.loads(proc.stdout)
    assert len(data) >= 1
    expected_keys = {
        "document_id", "document_number", "document_type", "title",
        "article_no", "clause_no", "item_no", "heading", "status",
        "official_url", "score", "match_type",
    }
    assert set(data[0].keys()) == expected_keys  # Localizer 필드가 섞이지 않았는지 확인


def test_cli_document_number_preserved_in_text_output():
    proc = _run_cli("--fixture", "--language", "ko", "--query", "152/2020/NĐ-CP")
    assert proc.returncode == 0, proc.stderr
    assert "152/2020/NĐ-CP" in proc.stdout  # 문서번호는 원문 그대로 텍스트 출력에도 노출


# ---------------------------------------------------------------------------
# [Windows UTF-8 회귀 수정] cp1252 콘솔 환경 시뮬레이션
# ---------------------------------------------------------------------------


def _cp1252_simulated_env() -> dict:
    """Windows PowerShell 기본 콘솔 코드페이지(cp1252)를 재현하기 위해
    PYTHONUTF8/PYTHONIOENCODING을 일부러 비우거나 cp1252로 강제 지정한다.
    search_cli.py의 _configure_utf8_console()이 이 상황에서도 stdout/stderr를
    UTF-8로 재설정해 UnicodeEncodeError 없이 통과해야 한다."""
    env = os.environ.copy()
    env.pop("PYTHONUTF8", None)
    env["PYTHONIOENCODING"] = "cp1252"
    env["LC_ALL"] = "C"
    env["LANG"] = "C"
    return env


def test_cli_korean_output_survives_simulated_cp1252_console():
    proc = _run_cli(
        "--fixture", "--language", "ko", "--query", "노동허가",
        env=_cp1252_simulated_env(),
    )
    assert proc.returncode == 0, proc.stderr
    assert "UnicodeEncodeError" not in proc.stderr
    assert "charmap" not in proc.stderr
    assert proc.stdout.strip() != ""


def test_cli_chinese_output_survives_simulated_cp1252_console():
    proc = _run_cli(
        "--fixture", "--language", "zh", "--query", "工作许可证",
        env=_cp1252_simulated_env(),
    )
    assert proc.returncode == 0, proc.stderr
    assert "UnicodeEncodeError" not in proc.stderr
    assert proc.stdout.strip() != ""


def test_cli_vietnamese_output_survives_simulated_cp1252_console():
    proc = _run_cli(
        "--fixture", "--language", "vi", "--query", "giấy phép lao động",
        env=_cp1252_simulated_env(),
    )
    assert proc.returncode == 0, proc.stderr
    assert "UnicodeEncodeError" not in proc.stderr
    assert proc.stdout.strip() != ""

