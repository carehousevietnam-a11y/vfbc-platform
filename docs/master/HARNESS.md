# 하네스 1단계

합격 기준과 `npm run verify`, 커밋 전 검사다. 행정·세금·부동산·사기·불확실한 문서의 기존 코드와 콘텐츠는 이 단계의 수정 대상이 아니다.

## 공통 합격 기준

1. `node ./node_modules/typescript/bin/tsc --noEmit` 가 통과한다.
2. 서비스별 content-final이 통과한다.
   - 세금: `node tests/qa/tax-content-final.mjs`
   - 사기: `node tests/qa/fraud-content-final.mjs`
   - 불확실한 문서: `node tests/qa/unclear-content-final.mjs`
   - 행정·부동산: content-final 파일이 없다. PDF 기준 텍스트로 잠근다.
3. 아래 PDF 추출 텍스트가 `tests/baseline/pdf/` 의 기준 파일과 같다. 기준 파일이 없으면 verify가 현재 PDF를 뽑아 그 폴더에 저장한다.
   - 세금 7개: `tax-P-free`, `tax-V-free`, `tax-C-free`, `tax-P-paid`, `tax-V-paid`, `tax-C-paid`, `tax-direct`
   - 부동산: `re-RE01`
   - 행정 무료: `admin-free-basic`
4. 공통 파일은 줄을 지우지 않고 추가만 한다. 목록은 `tests/baseline/shared-files.txt`다.
5. 운영 DB에 저장하지 않는다. verify와 content-final, PDF 생성은 Supabase에 쓰지 않는다.
6. push하지 않는다.

## 사기·불확실한 문서

- 모든 질문이 01부터 번호 카드다.
- 라디오가 없다.
- 선택지에 영문, 코드값, 내부 용어가 없다.
- 같은 질문 안에서 선택지 제목이 중복되지 않는다.
- 직접 입력 안내가 있다.
- 선택지마다 저장 필드가 2개다.

## 범위 밖

- 서류 첨부 리포트 연동. 나중에 별도 작업이다.
- 가입·결제 흐름 수정.

## verify

`npm run verify` 가 위 기준을 순서대로 실행한다. 스크립트 표준 출력의 마지막 줄은 `통과 n / 실패 n / 알려진 기존 실패 n` 만이다.
알려진 기존 실패는 `docs/master/HARNESS_KNOWN_FAILS.md` 에 있다. 그 항목은 실패해도 verify를 막지 않는다. 목록에 없는 새 실패는 종료 코드 1로 막는다.
자세한 로그는 `tests/qa/_output/verify-last.log` 에만 남긴다. 그 폴더는 커밋하지 않는다.

사용법: 이 폴더에서 `git config core.hooksPath .githooks` 를 한 번 실행한다.
그 다음부터 커밋 직전에 tsc와 content-final 테스트가 돌고, 실패하면 커밋이 막힌다.
공통 파일의 줄 삭제도 같은 hook이 막는다. 이 브랜치는 push하지 않는다.
