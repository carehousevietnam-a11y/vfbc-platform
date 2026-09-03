# VFBCAI QA — Playwright 최소 인프라

목적: Cursor 브라우저 도구의 한계(시크릿/뷰포트 고정)를 보완하기 위한 **보조** 도구.

재현 가능 항목:
1. Desktop `1280x800`
2. Mobile `375x812`
3. Clean session (테스트마다 새 BrowserContext)
4. Known QA account 로그인 상태 (`storageState` 재사용)

## 사용법

### 1) storageState 1회 생성 (매 QA마다 실행하지 않음)

현재 1차 구현은 **tamtru만** 지원. (wp / trc / driving-license는 TODO)

```bash
# localhost:3010 개발 서버가 떠 있어야 함
npx playwright test tests/qa/generate-storage-state.ts --project=desktop
```

환경변수로 계정/필드를 바꿀 수 있다 (미지정 시 기본 QA 패턴 사용):

- `QA_SERVICE` (기본 `tamtru`)
- `QA_EMAIL` / `QA_NAME` / `QA_PHONE` / `QA_ADDRESS` / `QA_KAKAO`
- `PLAYWRIGHT_BASE_URL` (기본 `http://localhost:3010`)

생성 경로 예: `tests/qa/.auth/tamtru-reentry-qa-tamtru-existing-20260903.json`

### 2) 스모크 (인프라 동작 확인)

```bash
npx playwright test tests/qa/smoke.spec.ts --project=desktop
```

## 경고

`tests/qa/.auth/` 아래 JSON에는 **세션 토큰이 포함**된다.
절대 git에 커밋하지 않는다. (`.gitignore`에 디렉터리 전체가 등록되어 있다.)

## 범위 밖

- CI 연동
- CHECK 4서비스 전체 스크립트
- 이메일 OTP 자동화
- Cursor 브라우저 QA 워크플로우 대체 (병행 사용)
