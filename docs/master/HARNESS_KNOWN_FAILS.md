# 알려진 기존 실패

verify는 아래 항목이 실패해도 막지 않고, 결과 줄의 "알려진 기존 실패"에만 센다.
이 목록에 없는 실패는 막는다.

## lint

- 명령: `npm run lint`
- 원인: ESLint가 저장소 기존 코드에서 오류 90건과 경고 276건으로 끝난다(2026-10-11 실행, 종료 코드 1). 대표 오류는 `@typescript-eslint/no-explicit-any`이다. 이번 단계에서 그 코드를 고치지 않는다.

## g4-golden

- 명령: `node scripts/harness-known-g4.mjs`
- 원인: `tests/qa/admin-verify-2step-result.mjs`의 G-4 부동산 PDF 골든 비교는 main `5264c3a`부터 실패해 온 기존 문제다. 이 작업 트리에는 `pdf-parse`와 `tests/qa/_output/golden-other-32b0231.json`이 없다. 그 테스트 파일은 환경 변수가 있으면 운영 DB를 조회하므로 verify는 파일 전체를 실행하지 않고, 골든 비교가 성립하지 않는 상태만 알려진 실패로 표시한다.

## tax-question-standard

- 명령: `node scripts/harness-recurrence.mjs tax-question-standard`
- 원인: 세금 팩 선택지 155개는 한 라벨에 두 문장을 붙여 두었고, 굵은 요점과 설명 문장이 나뉘어 있지 않다. 질문의 쉼표, 필드 2개, 선택지 수, 문서와 팩의 개수는 통과한다. 세금 콘텐츠와 세금 팩은 수정하지 않는다.
