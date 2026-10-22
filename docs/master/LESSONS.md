# 교훈 장부

한 항목은 문제, 원인, 재발 방지, 자동 검사 네 줄이다. 자동 검사가 없으면 없음이라고 적는다.

1. 문제: 실제 화면을 직접 확인하지 않고 완료로 보고됨
   원인: 코드만 보고 화면 결과를 완료로 적음
   재발 방지: 화면 점검 결과 없이는 완료로 보고하지 않는다
   자동 검사: 없음

2. 문제: UI 기준을 세금 하나에만 맞춤
   원인: 행정과 세금이 다른데 세금만 보고 맞춤
   재발 방지: UI 기준은 행정과 세금 둘 다로 잡는다
   자동 검사: 없음

3. 문제: PDF에 참고 사항이 두 번 그려짐
   원인: 같은 문단을 그리는 경로가 겹침
   재발 방지: PDF 추출 텍스트에서 같은 문단이 두 번 나오면 실패로 본다
   자동 검사: pdf-duplicate

4. 문제: PDF 출처 노트에 내부 용어(Cursor, URL 등)가 나옴
   원인: 고객에게 보이지 말아야 할 말이 출처 노트와 화면에 들어감
   재발 방지: 고객 화면 문장과 PDF 추출 텍스트에서 내부 용어 목록을 검사한다
   자동 검사: internal-terms

5. 문제: 질문 수·선택지 수·비율을 숫자로 고정한 테스트
   원인: 기대 개수를 테스트 안에 숫자로 적음
   재발 방지: 테스트에 질문 수를 숫자로 고정하지 않고, 문서에서 읽은 값과 비교한다
   자동 검사: question-count-hardcode

6. 문제: 입구 이동 칸에 낡은 질문 수(Q10)가 남음
   원인: 질문 목록은 늘었는데 문서의 범위 문장은 예전 번호 그대로임
   재발 방지: 문서 안의 질문 번호 범위가 실제 질문 수와 같은지 확인한다
   자동 검사: question-range

7. 문제: 같은 내용이 두 질문에 중복되어 위험 판단이 이중 계산됨
   원인: 한 축을 두 질문에서 다시 물음
   재발 방지: 한 축은 한 질문에서만 묻는다
   자동 검사: 없음

8. 문제: 새 서비스 브랜치에 앞선 커밋이 빠져 화면이 500
   원인: 필요한 커밋이 없는 지점에서 브랜치를 만듦
   재발 방지: 브랜치를 만들기 전에 필요한 커밋이 들어 있는지 확인한다
   자동 검사: 없음

9. 문제: .env.local이 없어 개발 서버 500
   원인: 환경 파일 없이 서버를 시작함
   재발 방지: 개발 서버를 시작하기 전에 환경 파일이 있는지 확인한다. 내용은 출력하지 않는다
   자동 검사: 없음

10. 문제: 공통 파일 수정이 다른 서비스에 영향
    원인: 여러 서비스가 쓰는 파일에서 줄을 지움
    재발 방지: 공통 파일은 추가만 하고, 삭제된 줄이 있으면 커밋을 막는다
    자동 검사: shared-diff

11. 문제: 작업 폴더가 틀려 스크립트를 못 찾음
    원인: 다른 체크아웃에서 명령을 실행함
    재발 방지: 작업을 시작하기 전에 폴더, 브랜치, 최근 커밋을 확인한다
    자동 검사: 없음

12. 문제: 기기로 파일을 복사한 뒤 첫 쓰기가 오래된 내용일 수 있음
    원인: 복사본이 갱신되기 전에 그 파일을 읽음
    재발 방지: 복사한 뒤 크기를 확인한다
    자동 검사: 없음

13. 문제: 지시서가 길면 붙여 넣기에서 잘림
    원인: 긴 지시문을 한 번에 붙임
    재발 방지: 지시서는 짧게 쓰고, 커밋은 git commit -F 로 한다
    자동 검사: 없음

14. 문제: 운영 DB를 쓰는 개발 서버에서 흐름을 끝까지 진행하면 기록이 남음
    원인: 저장이나 가입 단계를 눌러 운영 기록에 남음
    재발 방지: 저장·가입 단계는 누르지 않는다
    자동 검사: 없음

15. 문제: 질문·선택지가 한 가지만 묻거나 한 문장으로만 쓰임
    원인: 2중 구조 없이 질문과 선택지를 만듦
    재발 방지: 질문·선택지는 QUESTION_STANDARD.md의 2중 구조를 따른다. 한 축만 묻거나 한 문장짜리 선택지를 만들면 실패로 본다.
    자동 검사: question-standard

16. 문제: 사기·불확실한 문서 2차에서 빨간 "지원하지 않는 검토 건입니다."가 나옴
    원인: 새 서비스를 만들면서 공용 저장 API의 허용 서비스 목록에 추가하지 않음
    재발 방지: 새 서비스를 추가할 때 공용 API 허용 목록에 그 서비스 종류를 추가한다
    자동 검사: standards-lock (verify 페이지의 서비스 종류가 admin-verify-meta에 있는지 검사)

17. 문제: 기준을 항목마다 다시 설명하고 고치게 됨
    원인: 마스터 기준이 흩어져 있고 자동으로 막는 장치가 없었음
    재발 방지: docs/master/STANDARDS.md 하나에 모으고, 변경은 대표 승인(ACE-APPROVED) 뒤에만 한다
    자동 검사: standards-lock, commit-msg hook

18. 문제: 사기·불확실한 문서 보고서 1페이지가 길어져 KEY RISKS가 "…"로 잘리고 RECOMMENDED ACTIONS가 사라짐. 결론 문장이 "…합니다.입니다"로 깨짐
    원인: 세금 보고서 패턴(결론은 짧은 항목명, 1차 확인은 짧은 요점, 2차는 항목별 한 문장)을 따르지 않고 선택지 전체 문장을 그대로 넣음
    재발 방지: 보고서 1차 확인은 선택지의 굵은 요점만, 2차는 항목별 첫 문장만 쓴다. 보고서 틀과 세금 패턴은 바꾸지 않는다
    자동 검사: report-layout

19. 문제: 의미 없이 긴 글이 나오면 읽는 사람이 이해하지 못하고 지루해서 이탈함
    원인: 글의 정보 밀도를 기준으로 삼지 않음
    재발 방지: 빈말·반복을 빼고 정보로 채운다. 단 질문·선택지의 2층 구조는 줄이지 않는다 (STANDARDS A14, 2026-10-12 정정)
    자동 검사: report-layout (핵심 블록 줄 수 상한)

20. 문제: 리포트 2차 확인에 정보 없는 빈말 줄이 들어가고, 조치 칸이 오른쪽 요약과 같은 말을 반복하며, 근거 목록과 위험 박스가 붙어 보임 (불확실·사기 서비스)
    원인: 선택지 문장을 그대로 옮기고 정보 밀도(A14)와 블록 간격을 기준으로 거르지 않음
    재발 방지: 2차 줄은 최대 5줄, 빈말 패턴(직접 적어 주신·원본이 있으면·전문가가 함께)은 제외, 조치 칸은 "즉시 · / 다음 ·" 두 줄, 강조 블록 앞 간격 확보
    자동 검사: report-layout (핵심 블록 줄 수 상한), commit-msg (fix 커밋은 LESSONS 기록 필수)

운영 규칙: 대표님이 지적해서 고친 모든 것은 같은 커밋에서 이 파일에 번호를 붙여 쌓는다. Claude와 Cursor는 작업 전 이 파일을 읽고 같은 실수를 반복하지 않는다.

21. 문제: 선택지 최대 5개 규칙이 "상한 없음"으로 바뀌어 기록되었고, 사기·불확실 질문에 6~8개 선택지가 들어감. 또 A14 문구("한 문장에 한 가지 정보")가 2층 복합 질문 구조와 충돌함
    원인: 대표님이 확정하지 않은 해석(상한 없음)을 최신 지시로 기록했고, 새 기준을 쓰면서 기존 구조(2층)와 맞춰 보지 않음
    재발 방지: 선택지는 4~5개 + 직접 입력(5개 초과 금지), A14는 빈말 제거 원칙이며 2층 구조는 줄이지 않는다. 기준을 바꾸기 전에 기존 확정 구조와 충돌하는지 대표님께 확인한다
    자동 검사: question-standard (선택지 4~5개 검사, 2026-10-12 켬)

22. 문제: 정보를 많이 뽑는다는 목적이 앞서 질문·선택지가 부자연스럽거나, 베트남어를 모르는 외국인 눈높이에 맞지 않을 수 있음. 또 사기·불확실 선택지의 둘째 정보가 첫째의 묶음 값(예: 공공기관)이고 설명이 반복되어 실제로는 정보 1개만 얻는 질문이 있음 (사기 11/26, 불확실 10/39. 세무는 0)
    원인: 2층 구조를 채우는 데 집중했고 둘째 정보가 첫째와 별개인지, 독자가 이해하기 쉬운지 점검하지 않음
    재발 방지: A15(독자는 베트남어를 모르는 외국인, 자연스러운 연결, 쉬운 말). 둘째 정보는 첫째에서 따라 나오는 값이 아니라 별개의 정보여야 하고, 한 질문 안에서 같은 설명을 반복하지 않는다 (세무 질문을 본보기로 삼는다)
    자동 검사: question-standard (A16 설명 반복·둘째 필드 공유 3개 초과 검사, 2026-10-12 켬)

23. 문제: 고친 내용을 화면에서 확인할 때 옛 화면(선택지 7~8개)이 보임
    원인: 같은 이름의 브랜치(chore/harness-v1)가 서로 다른 폴더(C:\vfbcai-unclear, C:\vfbcai-new)에 있었고, Cursor가 옛 폴더를 보고 있었음
    재발 방지: 화면 확인 전에 Cursor 하단의 폴더 이름과 브랜치, 마지막 커밋을 먼저 확인한다. 작업 폴더는 C:\vfbcai-new 하나만 쓴다. 개발 서버는 3001번 등 열린 주소를 확인한다.
    자동 검사: 없음

24. 문제: 고객 문장에 금지어("반드시", "무조건", "100%")가 들어가 콘텐츠 점검이 실패함
    원인: 기존 결과 문장을 이어 붙이며 금지어 점검을 거치지 않음
    재발 방지: 콘텐츠를 만든 직후 해당 서비스의 content-final 점검을 먼저 돌린다. 쉬운 말로 "꼭"처럼 바꿔 쓴다.
    자동 검사: tests/qa/*-content-final (banned phrase)

25. 문제: 법령 조문 번호가 2차 자료만으로 적혀 틀린 번호가 나갈 위험
    원인: 공식 원문 대조 없이 "원문 대조 필요"가 남아 있음
    재발 방지: 조문 번호는 공개 자료로 대조한 것만 쓰고, 대조하지 못한 번호는 본문에 쓰지 않고 출처 표에 "대조 필요"로 둔다. 확인일을 적는다.
    자동 검사: 없음 (J 표의 확인일 수동 갱신)

26. 문제: PDF 기준 비교(pdf-baseline)가 날짜가 바뀌면 9개 모두 "다름"으로 실패함
    원인: PDF에 실행한 날짜(발급일)가 찍히는데 기준 파일에는 만든 날의 날짜가 저장됨
    재발 방지: 기준 비교에서 실행 날짜처럼 매번 바뀌는 값은 빼고 비교한다. 실패하면 PDF_DIFF_DETAIL=1로 다른 위치부터 본다.
    자동 검사: 켬 (scripts/harness-pdf-baseline.mjs, 공백·발급일 제외 비교)

27. 문제: 새 서비스(거주증) 화면이 질문 대신 CHECK 견적서로 열리고, 질문 카드가 2층(설명 문장) 없이 작은 버튼으로 나옴
    원인: 화면이 비용 서비스 이름("trc")과 질문 이름 앞부분("fraud_", "unclear_")으로 모양을 고르는데 새 서비스가 그 목록에 없었음
    재발 방지: 새 서비스를 연결할 때 (1) VERIFY 엔진은 견적서 화면을 쓰지 않는지 (2) 질문 이름 앞부분이 MASTER 카드 목록에 들어 있는지 확인하고, 실제 화면에서 1번 질문 카드 모양(번호 배지·설명 문장)을 본다.
    자동 검사: 없음 (화면 확인 필요)

28. 문제: 무료 1차 결과에 "1차 판정 결과", "주의 판독 등급" 막대가 나와 판정·점수처럼 보임, 카드마다 같은 문장이 두 번 나옴
    원인: 공용 결과 화면의 고정 문구와 카드 아래 문장이 서비스 구분 없이 나옴
    재발 방지: 무료 결과에 판정·등급을 쓰지 않는 서비스는 결과 데이터에 neutralFirstResult를 넣는다(기존 서비스 화면은 그대로).
    자동 검사: 없음 (화면 확인 필요)

29. 문제: PDF에서 물결표(~)가 깨진 글자로 나옴 ("2~5년" → 깨짐)
    원인: PDF 글꼴에 물결표 글자가 없음
    재발 방지: 고객 문장과 출처에 물결표를 쓰지 않고 "2년에서 5년"처럼 쓴다.
    자동 검사: 없음 (다음 묶음에서 금지 글자 점검에 추가 예정)

30. 문제: 거주증 질문 규칙 자동 점검이 켜졌다고 보고했지만 실제 검사 목록에는 빠져 있었음
    원인: 점검 파일에 추가한 변경이 저장(커밋)되지 않은 채 보고됨
    재발 방지: "자동 검사 켬"이라고 보고하기 전에 검사 파일에 서비스 이름이 들어 있는지 grep으로 확인하고, 일부러 틀린 값을 넣어 실패하는지 한 번 본다. 지금은 trc·wp·tamtru·license 네 서비스를 한 목록으로 검사한다.
    자동 검사: 켬 (scripts/harness-recurrence.mjs question-standard)

31. 문제: 새 서비스를 늘릴 때마다 공용 파일 20여 곳에 같은 항목을 손으로 추가해야 해서 빠뜨릴 위험이 큼 (마이페이지 조건문 하나를 잘못 바꿔 타입 오류 2건 발생)
    원인: 서비스 목록이 한 곳에 모여 있지 않고 파일마다 조건문으로 흩어져 있음
    재발 방지: 새 서비스는 기존 서비스(verify_trc 등)가 나오는 모든 줄을 grep으로 찾아 같은 자리에 추가하고, 추가 후 tsc를 바로 돌린다. 다음 정리 단계에서 서비스 목록을 한 파일로 모으는 작업을 검토한다.
    자동 검사: tsc (타입 오류로 일부만 잡힘)

32. 문제: 서비스 이름을 바꿔 파일을 만들 때 "company"를 바꾸다가 "accompany"(동행 단계 이름)까지 바뀌어 점검이 실패함
    원인: 단어 경계 없이 글자 그대로 바꿈
    재발 방지: 이름 바꾸기는 다른 단어 안에 들어간 경우를 제외하는 방식으로 하고, 만든 직후 해당 서비스 점검을 바로 돌린다.
    자동 검사: tests/qa/<서비스>-content-final.mjs (서비스 단계 값 점검)

33. 문제: 인허가 7종의 기존 판정이 화면 파일 안에만 있어 팩에서 그대로 불러 쓸 수 없음
    원인: 화면 파일은 판정 함수를 밖으로 내보낼 수 없음(화면 파일 규칙)
    재발 방지: 같은 규칙을 공용 파일(registerRule.ts)에 두고, 화면 파일의 판정 줄이 바뀌면 점검이 실패하도록 감지한다.
    자동 검사: 켬 (tests/qa/<업종>-content-final.mjs pageRule)


34. 문제: 지시서에 메뉴 불 켜기 방향을 거꾸로 적음 (새 화면이 REGISTER가 아니라 VERIFY에 켜지는 것이 문제인데 반대로 씀)
    원인: 대표가 말한 현재 상태를 코드(경로가 /verify/로 시작하면 VERIFY)와 대조하지 않고 문장만 보고 목표를 정함
    재발 방지: 지시서를 쓰기 전에 현재 동작을 코드로 확인하고, 현재 상태와 목표를 한 줄씩 나란히 적어 대표 말과 맞는지 본다.
    자동 검사: 없음

35. 문제: 이 환경의 파일 쓰기 도구가 사용자 컴퓨터가 아닌 클라우드에 파일을 만들어 tsc가 모듈을 못 찾음
    원인: 사용자 폴더는 device_bash로만 쓸 수 있는데 일반 쓰기 도구를 사용함
    재발 방지: 사용자 폴더의 새 파일은 device_bash로 만들고, 만든 직후 ls로 존재를 확인한다.
    자동 검사: tsc (모듈 없음 오류로 잡힘)

36. 문제: 마이페이지 전문가 요청 서버가 행정문서·부동산만 허용해 새 12개 서비스는 요청이 거절됨
    원인: 새 서비스를 연결할 때 서버의 허용 목록을 확인하지 않음
    재발 방지: 새 서비스 연결 체크에 mypage-expert-request의 허용 서비스를 넣는다(지금은 expertOptions.ts 목록으로 한 곳에서 관리).
    자동 검사: 없음 (화면에서 요청 확인 필요)

37. 문제: 운전면허 출처에 기관과 번호가 잘못 적혀 있었음 (공안부 35/2024로 적었으나 35/2024는 교통운수부 통달, 외국 면허 교환은 공안부 12/2025)
    원인: 이차 자료만 보고 "원문 대조 필요"로 표시한 채 두었고, 기관 이름을 번호와 대조하지 않음
    재발 방지: 법령 출처는 번호, 발행 기관, 시행일을 한 줄로 같이 확인하고, 확인되면 비고에 "확인함"을 적는다.
    자동 검사: 없음 (법령 원문 대조 필요)

38. 문제: 출처 비고에 "제36~38조"처럼 물결표를 써서 고객 문구 규칙(물결표 금지)을 어길 뻔함
    원인: 조문 범위를 줄여 쓰다가 규칙 확인을 건너뜀
    재발 방지: 조문·기간 범위는 "제36조부터 제38조"처럼 풀어 쓴다. 수정 후 추가된 줄에서 물결표를 검색한다(git diff -U0 | grep '^+' | grep '~').
    자동 검사: 없음 (콘텐츠 검사의 금칙어 목록에 물결표 포함 여부 확인 필요)

39. 문제: 화면 수정 후 확인 중 예전 개발 서버(포트 3000)를 보고 "반영 안 됨"으로 오판함
    원인: 개발 서버가 여러 개 떠 있었고(3000, 3001), 최신 코드는 3001 서버였음
    재발 방지: 화면 확인 전에 npm run dev 출력의 Local 주소와 Dir를 확인해 현재 폴더 서버 포트로 접속한다. 같은 폴더에 서버가 이미 있으면 그 주소를 쓴다.
    자동 검사: 없음 (화면 확인 절차)

40. 문제: 작업 환경(VM)에서 git 명령을 시험하다 .git 안에 잠금 파일(.lock)이 남음
    원인: VM이 마운트 폴더에서 파일을 지울 수 없어 git이 만든 잠금 파일이 그대로 남음
    재발 방지: VM에서는 git add, commit, reset을 실행하지 않는다. git 읽기 명령(diff, log, status)만 쓰고 커밋은 대표 PC에서만 한다.
    자동 검사: 없음 (작업 규칙)

41. 문제: UI 색 통일 중 위험도·완료 같은 의미 있는 색(초록, 노랑, 빨강)까지 파랑으로 바꿈
    원인: 색 치환을 파일 전체에 일괄 적용하고, 장식 색과 의미 색을 먼저 나누지 않음
    재발 방지: 색 통일은 장식 색에만 적용한다. 위험도(양호/중간/경고), 완료, 긴급 표시는 바꾸기 전에 코드에서 의미를 확인하고 제외한다. 일괄 치환 뒤에는 상태 표시 화면을 직접 확인한다.
    자동 검사: 없음 (화면 확인 필요)

42. 문제: 마이페이지 "진행 단계" 줄에 고정 최소폭(420px)이 있어 375px 모바일에서 4번째 단계가 잘리고 가로 스크롤이 생김. 작은 글자(9~10px)도 모바일에서 읽기 어려움
    원인: PC 기준 폭을 고정값으로 두고 모바일(375px) 화면을 확인하지 않음. 글자 크기를 9px까지 낮춰 사용함
    재발 방지: 카드 안 가로 배열(단계 표시 등)에는 고정 최소폭을 쓰지 않고 칸 비율로 나눈다. 본문·날짜·배지 글자는 11px 이상, 좁은 칸 안의 굵은 라벨은 글자를 키우기 전에 칸 폭을 측정한다(11px로 키우면 옆 라벨과 3px 간격으로 붙음, 10px 유지).
    자동 검사: 없음 (375px 화면 확인 필요)

43. 문제: 마이페이지 모바일 하단 탭(신청현황·알림)이 유료 화면에서 눌러도 반응 없음. 서류지갑 이동 시 제목이 고정 헤더(85px)에 가려짐
    원인: 탭이 가리키는 위치 id(#applications, #notifications)가 유료 화면에는 없었고(화면별로 id를 null로 처리), 이동 위치에 헤더 높이만큼의 여백(scroll-mt)이 없었음
    재발 방지: 하단 탭·메뉴의 이동 대상은 무료/유료 모든 상태에서 존재하는지 확인한다. 화면별로 카드를 숨길 때는 그 카드의 id를 대신 받을 카드를 정한다. 고정 헤더가 있으면 이동 대상에 scroll-mt-24를 둔다. 확인할 때는 같은 해시를 연속으로 누르면 이동하지 않으므로 해시를 바꿔 가며 눌러 본다.
    자동 검사: 없음 (375px 유료/무료 화면에서 탭 4개 직접 확인 필요)

44. 문제: 화면 점검 중 모바일 "도움말" 탭을 눌러 /consultation에 들어가자, 페이지가 자동으로 상담 접수(leads, crm_activities)를 실제로 생성함
    원인: /consultation은 로그인 계정 정보가 있으면 몇 초 뒤 자동 접수하는 페이지인데, 이동 대상 코드를 확인하지 않고 점검용으로 열었음. localhost도 실제 DB(Supabase)에 연결되어 있음
    재발 방지: 점검(QA)으로 페이지를 열기 전에 그 페이지가 자동 저장·접수·전송을 하는지 코드를 먼저 확인한다. 자동 접수 페이지(/consultation 등)는 로그인한 실제 계정으로 열지 않는다. 하단 탭처럼 한 번 누르면 접수되는 연결은 고객이 실수로 누르는 경우를 고려해 확인 단계를 둘지 대표 승인을 받는다.
    자동 검사: 없음 (작업 규칙)

45. 문제: 관리자 문서관리 화면이 "데이터를 불러오는 중 문제가 발생했습니다. Bad Request" 오류로 열리지 않음
    원인: 리드 전체(최대 2000건)의 id를 한 번에 .in("lead_id", ids)로 조회해 요청 주소가 너무 길어짐(리드 1000건 이상에서 발생). 또 한 번에 최대 1000행만 돌려주어 그 이상은 오류 없이 조용히 잘리는 문제도 같은 위치에 있었음
    재발 방지: .in()에 넣는 id는 100개 안팎 묶음으로 나눠 조회하고, 묶음마다 range()로 페이지를 넘겨 끝까지 읽는다. 화면을 만들 때 데이터가 1000건 이상인 경우(테스트 데이터 포함)를 한 번 열어 본다.
    자동 검사: 없음 (관리자 목록 화면은 리드 1000건 이상에서 열어 확인 필요)

46. 문제: 운영 DB의 RLS 정책을 점검하니 고객 서류 저장소(documents) 전체 읽기, leads 전체 읽기, result_tokens 전체 읽기, notifications 읽기·쓰기, previous_rejections 전체 권한이 비로그인(anon) 사용자에게 열려 있었음
    원인: 개발 중 화면이 동작하도록 anon 정책을 조건 없이(true) 열어 두고, 서버 경유로 바꾸는 후속 정리를 하지 않았음. 저장소가 "비공개"여도 RLS 정책이 열려 있으면 비공개가 아님
    재발 방지: 새 테이블·저장소 정책은 anon에게 조건 없는 읽기(true)를 만들지 않는다. 읽기는 서버(supabaseAdmin)로만 한다. 정책을 추가·변경하면 docs/master/SECURITY_RLS_AUDIT.md를 갱신한다. 새 기능 배포 전에 anon 정책 목록을 다시 조회한다.
    자동 검사: 없음 (Supabase SQL Editor의 카탈로그 조회로 정기 확인 필요)

47. 문제: 새로 만든 테이블(funnel_events)에 서버 API가 저장하려 하자 "permission denied"(코드 42501)로 실패함
    원인: 이 Supabase 프로젝트는 새 테이블에 서버용(service_role) 권한을 자동으로 주지 않음. 테이블을 만들어도 별도 GRANT가 필요함
    재발 방지: 새 테이블 SQL에는 RLS 켜기와 함께 `grant select, insert, update, delete on public.테이블 to service_role;`을 포함한다. 브라우저용(anon, authenticated) 권한은 필요한 경우에만 따로 준다. 새 테이블 적용 후에는 서버 API로 저장 1회를 확인한다.
    자동 검사: 없음 (새 테이블 SQL 작성 시 점검)

48. 문제: 작업 환경(VM)에서 Supabase 주소로 접속하려 했으나 이름 조회 실패(EAI_AGAIN)로 DB 건수를 읽지 못함
    원인: VM의 네트워크는 허용 목록 외 사이트(Supabase 포함)를 막는다. DB 확인용 스크립트를 VM에서 실행하려 함
    재발 방지: DB 조회가 필요한 확인은 스크립트를 tests/qa/_output/ 에 만들어 두고 대표 PC(PowerShell)에서 실행해 결과만 받는다. VM에서 키를 쓰는 조회를 시도하지 않는다. 스크립트는 개인정보 열을 읽지 않고 집계만 출력하며 키는 출력하지 않는다.
    자동 검사: 없음 (작업 규칙)

49. 문제: 점검용으로 /verify/trc 질문을 끝까지 눌렀더니, 이미 로그인된 회원 브라우저라서 가입 폼 없이 바로 접수가 처리되어 운영 DB에 접수 1건이 생김 (퍼널 접수 기록 확인 중)
    원인: 로그인된 계정이 있으면 질문 완료 직후 회원 확인 단계에서 자동 접수된다(44번 /consultation과 같은 종류). 점검 브라우저가 대표 계정으로 로그인되어 있었음
    재발 방지: 접수 기록이 남는 점검은 미리 "어떤 계정으로 어떤 접수가 생기는지"를 알리고 승인받은 뒤에 한다. 점검 때는 첨부 파일을 올리지 않고 반려 이력은 "없음"으로 답해 부수 기록(서류 저장소, previous_rejections)을 만들지 않는다. 생긴 테스트 접수는 관리자에서 확인할 수 있게 둔다.
    자동 검사: 없음 (작업 규칙)

50. 문제: 점검 중 VERIFY 가입 폼(이름·연락처·이메일 제출)을 제출하면 /api/lead-submit이 운영 Supabase에 실제 계정(Auth 사용자)을 만들고 로그인 세션까지 바꿈
    원인: localhost 개발 서버도 운영 Supabase에 연결되어 있고, 가입 폼 제출은 접수와 계정 생성을 한 번에 한다
    재발 방지: 비로그인 접수 경로는 폼 제출로 점검하지 않는다. 서버 접수 API(/api/lead-intake)를 테스트 값("TEST 삭제대상")으로 직접 호출해 확인하고, 계정이 만들어지는 /api/lead-submit은 호출하지 않는다. 생긴 테스트 접수는 관리자에서 확인할 수 있게 문서에 적는다.
    자동 검사: 없음 (작업 규칙)
    확인 방법: 브라우저 점검 때 page 안에서 window.fetch를 덮어 /api/lead-submit만 가짜 응답({ok:true, token:'MOCK'})으로 바꾸고, /api/lead-intake 응답은 그대로 기록해 확인한다.

51. 배포 브랜치와 작업 브랜치가 다르면 서버 API 를 쓰는 DB 변경(정책 제거)을 먼저 하면 운영 접수가 멈춘다.
    증상: 새 API 코드는 chore/harness-v1-clean 에만 있었고 운영은 main(옛 코드)을 배포하고 있었다.
    재발 방지: DB 정책을 닫는 SQL 은 운영 주소에서 새 API 응답(없는 주소와 다른 JSON 응답)을 확인한 뒤에 실행한다.

52. 인허가 질문에서 한 선택지의 두 정보를 서로 무관한 두 가지로 묶어 엉뚱한 짝이 생겼다.
    증상: 법인설립 Q1 "한국 본사가 투자" + "무역·유통 사업", 식당 Q1 "새로 개업" + "일반 식당"처럼 첫째와 둘째가 이어지지 않아 고객이 맥락을 이해하지 못했다. 국적과 제출자, 지역과 담당 기관을 아는지도 같은 문제였다. 8종이 같은 문장(걱정·견적·서류·시점·국적·지역)을 그대로 복사해 서비스 맥락도 없었다.
    원인: 기준(굵은 요점=첫째 정보, 설명=둘째 정보)을 "서로 다른 두 필드"로만 읽고, 둘째 정보가 첫째 정보에서 이어져야 한다는 기준 견본(세금 Q1-P)을 놓쳤다.
    재발 방지: 선택지의 둘째 정보는 첫째 정보의 같은 주제 안에서 이어지는 세부(확인할 점, 다음 상태)로 쓴다. 서로 독립된 두 속성은 한 선택지에 묶지 말고 별개 질문이나 별개 필드로 나눈다. 새 질문은 서비스 이름과 상황이 드러나게 쓰고, 다른 서비스 문장을 복사하지 않는다. 필드 이름은 명세 파일 한 곳에서만 쓰이므로 수정은 명세(scripts/*-content-spec.mjs)에서 하고 build --write 로 다시 만든다.

53. 모바일에서 선택지 카드의 화살표가 글 아래 별도 줄로 내려가 카드마다 빈 공간이 생겼다.
    증상: 폭 430px 이하에서 설명이 없는 카드도 화살표 한 줄 때문에 높아 보이고 정렬이 어긋났다.
    원인: 선택지 카드(SelectionCard stitch)가 430px 이하에서만 세로 배치(space-y)와 화살표 오른쪽 정렬(ml-auto)을 따로 썼다.
    재발 방지: 카드 레이아웃은 PC 폭에서만 보지 말고 390px 폭으로 줄여 화면을 직접 확인한다. 화살표는 모든 폭에서 오른쪽 가운데에 둔다.
    자동 검사: 없음 (작업 규칙)

54. 서비스 구분(직접 확인하기·직접 검토하기·직접 인허가 받기)별 전문 AI 문구가 한 가지로 통일되어 있었다.
    증상: 질문 화면 제목 옆에 모든 서비스가 "베트남 법률전문 AI"로 표시됐다.
    원인: 각 verify 페이지의 specialtyLine 을 복사해 쓰면서 서비스 구분별로 나누지 않았다.
    재발 방지: 직접 확인하기=행정전문 AI, 직접 검토하기=법률전문 AI, 직접 인허가 받기=인허가 전문 AI 로 표시한다. 새 서비스를 만들 때 구분을 먼저 정하고 specialtyLine 을 맞춘다.
    자동 검사: 없음 (작업 규칙)

55. 화면 문구를 설정값만 바꾸고 실제 표시 위치를 확인하지 않아 반영되지 않았다.
    증상: verify 페이지의 specialtyLine 을 바꿨지만 질문 화면 제목 옆 문구는 "베트남 법률전문 AI" 그대로였다.
    원인: 제목 옆 문구는 공통 헤더(FunnelPageHeader)가 engine 기본 문구(FUNNEL_ENGINE_COPY)로 표시했고 specialtyLine 은 랜딩에서만 쓰였다.
    재발 방지: 화면 문구를 바꿀 때는 그 문구가 실제로 그려지는 컴포넌트를 먼저 찾고, 수정 뒤 해당 화면을 열어 표시를 확인한다. 이제 헤더는 eyebrowText 로 서비스별 문구를 받는다.
    자동 검사: 없음 (작업 규칙)

56. 의료기기·프랜차이즈 질문에서 서로 무관한 두 속성이 한 선택지에 묶여 맥락이 끊겼다.
    증상: 의료기기 Q1은 절차와 위험 등급이 임의로 짝지어졌고(예: "등록 내용 변경"+"가장 높은 등급"), Q12는 모델 수와 사고 보고, 프랜차이즈 Q1은 절차와 업종, Q4는 계약서와 상표가 서로 이어지지 않았다.
    원인: LESSONS 52번을 8종 중 먼저 고친 서비스에만 적용하고, 남은 서비스는 필드 두 개를 그대로 나열한 문장을 유지했다.
    재발 방지: 서비스를 새로 점검할 때 모든 선택지를 "첫째 정보를 읽고 둘째 정보가 자연스럽게 이어지는가"로 한 줄씩 읽는다. 독립된 두 속성은 한쪽을 예시(제품 종류, 계약서에 쓰는 상표 등)로 풀어 다른 쪽이 따라오게 쓰거나 별개 질문으로 나눈다.
    자동 검사: 없음 (작업 규칙)

57. 질문과 선택지를 우리 분류 체계로 써서 고객이 사무실에서 하는 말과 어긋났다.
    증상: 서류 준비 상태, 제도 용어, 맡길 범위를 묻는 질문, 비용·견적 질문, "전문가에게 맡기고 싶다"는 선택지가 있어 호객처럼 읽히고 고객이 이탈할 수 있었다. 또 "어디쯤이고"처럼 어색한 문장이 신뢰를 떨어뜨렸다.
    원인: 고객이 실제로 하는 말(상황, 경험, 감정, 답답함에 약간의 정보)이 아니라 우리가 알고 싶은 항목을 기준으로 질문을 만들었다.
    재발 방지: 모든 질문은 고객이 사무실에서 하는 말로 쓰고(~합니다 체), 비용·견적·위임 희망 질문과 모든 고객이 같은 답을 하는 소망은 쓰지 않는다. 공통 질문은 scripts/register-voice-spec.mjs 한 곳에서 고친다. 확정 문장은 DECISIONS 2026-10-14 행을 따른다.
    자동 검사: 없음 (작업 규칙)

58. 공통 질문 틀이 서비스 말 뒤에 조사 "를"을 고정으로 붙여 받침 있는 말이 틀렸다.
    증상: "소방 승인를", "가맹 사업 등록를"처럼 화면에 어색한 조사가 나왔다. 식당 한 곳만 화면으로 확인해 나머지 서비스에서 늦게 발견했다.
    원인: register-voice-spec.mjs가 서비스 말(cfg.noun, cfg.dateWord) 뒤에 조사를 고정 문자열로 붙였다.
    재발 방지: 서비스 말 뒤 조사는 eulReul()처럼 받침을 보고 고른다. 새 조사가 필요하면 같은 방식으로 함수를 만든다. 공통 틀을 고치면 8개 서비스 생성 파일을 모두 다시 만들어 diff로 확인한다.
    자동 검사: 없음 (작업 규칙)

59. 선택지 둘째 줄이 첫 줄에 없는 상태(이미 받음, 직접 만듦)를 전제해 고객이 억지로 느낄 수 있었다.
    증상: "헤어 제품을 팔고 있습니다. 이미 받은 신고 번호를 갱신할 때…"처럼 첫 줄에 없는 사실을 둘째 줄이 말했다. 환경 "화학 공장"+"허가 갱신", 화장품 "색조 판매"+"직접 만든 제품"도 같았다.
    원인: 둘째 줄의 걱정에 필요한 상태(이미 신고함, 직접 만듦, 갱신 임박)를 첫 줄에 쓰지 않았다.
    재발 방지: 둘째 줄이 말하는 상태는 첫 줄에 먼저 쓴다. 모든 선택지를 고객 입장에서 소리 내어 읽어 "이 사람이 정말 이렇게 말할까"를 한 줄씩 확인한다. 어색하면 코드 값은 그대로 두고 문장만 고친다.
    자동 검사: 없음 (작업 규칙)

60. 모바일에서 답변 요약 줄이 질문 글에 밀려 고른 답이 보이지 않았고, 직접 입력 버튼 글자가 꺾였다.
    증상: 선택지를 고르면 위쪽에 "✓ 질문 + 고른 답"이 한 줄로 쌓이는데, 모바일에서는 긴 질문 글이 폭을 다 차지해 고른 답이 너비 0으로 사라졌다. "위에 내용이 없거나 설명이 필요합니다 → 직접 입력" 버튼은 "직접 / 입력"으로 줄이 꺾였다.
    원인: 질문 글 span이 줄어들지 않는 설정(shrink-0)이고 답 span은 한 줄로 자르는 설정(truncate)이라 좁은 폭에서 답이 먼저 사라졌다. 직접 입력 문구는 붙여 써야 할 묶음을 지정하지 않았다.
    재발 방지: 모바일(640px 미만)에서는 답변 요약에 질문 글을 숨기고 고른 답만 한 줄로 보인다. 줄이 꺾여도 되는 문구는 붙일 단어를 줄바꿈 없는 공백(\u00A0)으로 묶는다. 화면 확인은 PC에서 창 폭을 600px 미만으로 줄여서도 한다. 공통 파일 수정이므로 커밋 메시지에 SHARED-EDIT-APPROVED 줄을 넣는다.
    자동 검사: 없음 (작업 규칙)

61. 질문 문장이 어떤 상태를 전제해 선택지와 어긋났다.
    증상: 회사설립 질문 4 "대표는 상주하실 예정이고"인데 선택지에 "오가며 관리", "현지인을 대표로", "아직 못 정함"이 있었다. 위생은 질문 2·3이 "생산 시설", "작업장"을 전제해 유통만 하는 고객에게 맞지 않았다.
    원인: 질문 앞부분에 선택지 중 하나의 상태를 쓰거나, 한 가지 업태 기준으로 질문을 만들었다.
    재발 방지: 질문 문장에는 선택지가 나뉘는 기준을 전제로 쓰지 않는다(누가 맡을 예정인지 묻는다). 업종 질문은 첫 질문의 모든 선택지 고객이 읽어도 맞는지 확인하고, 선택지는 질문당 5개를 넘기지 않으므로 기존 선택지를 합치거나 바꿔서 해결한다.
    자동 검사: 없음 (작업 규칙)

62. 질문을 교체했는데 품질 검사 파일이 옛 필드 이름을 직접 쓰고 있어 검사가 실패했다.
    증상: 직접 확인하기 4개에서 질문 5를 교체한 뒤 tests/qa/<서비스>-content-final.mjs 가 옛 선택지(help_full)를 찾다가 멈췄다. 새 질문 문장이 30자 미만이거나 선택지 한 줄이 45자 미만이어도 실패했다.
    원인: 질문 필드(예: trc_helpWanted)를 스펙과 검사 파일, 서비스 단계 추천·요약 규칙이 함께 참조한다.
    재발 방지: 질문을 교체할 때는 스펙의 요약(summaries)·위험(risks)·단계(tierRules)·연결(connections)·라벨과 tests/qa 의 필드 참조를 함께 바꾸고, 질문 문장은 쉼표가 있는 30자 이상, 선택지 한 줄은 마침표가 있는 45자 이상으로 쓴다. 공유 저장소 폴더에서 git stash 를 쓰면 index.lock 이 남으니 쓰지 않는다.
    자동 검사: tests/qa/*-content-final.mjs

63. 문제: 회계 P1 격리 테스트가 스키마 없음으로 전체 스킵됨
    원인: 운영 Supabase에 마이그레이션 미적용 + 로컬 Supabase 미기동
    재발 방지: 회계 DB 테스트는 ACCOUNTING_TEST_LOCAL=1과 `npx supabase start` 로컬 DB에서만 실행한다. 운영 URL에 마이그레이션을 적용하지 않는다.
    자동 검사: node tests/accounting/isolation.mjs (로컬)

64. 문제: `npx supabase start`가 .env.local UTF-8 BOM 때문에 config 파싱 실패
    원인: .env.local 첫 키에 BOM(﻿)이 붙음
    재발 방지: .env.local은 BOM 없는 UTF-8로 저장한다. 회계 테스트 스크립트는 읽을 때 BOM을 제거한다.
    자동 검사: 없음

65. 문제: 로컬 Supabase 초기화 시 accounting 마이그레이션이 public.users 없음으로 실패
    원인: accounting_is_business_member()가 public.users를 참조하는데 빈 로컬 DB에는 users 테이블이 없음
    재발 방지: `supabase/migrations/20261016000000_accounting_prereq_public_users.sql`은 users가 없을 때만 최소 users를 만든다. 운영(이미 users 있음)에서는 no-op이다.
    자동 검사: npx supabase db reset --local 후 마이그레이션 적용 확인

66. 문제: lead-submit이 요청 본문의 companySignupChannel로 member_type=company를 저장할 수 있었음
    원인: 클라이언트가 보낸 채널 문자열을 서버가 신뢰함
    재발 방지: 기업회원은 `/api/company-member-signup`만 company로 저장한다. lead-submit은 `LEAD_SUBMIT_MEMBER_TYPE`(personal)만 insert한다. signup profile RLS는 본인·동일 org company_owner 조회만, insert/update는 service role만. 이 가입 작업의 표기는 S1(가입)이다. 설계서 P2(거래 입력)와 섞지 않는다.
    자동 검사: node tests/accounting/company-signup.mjs

67. 문제: accounting_can_read_company_signup_profile이 SECURITY DEFINER와 search_path는 맞았지만 PUBLIC·anon EXECUTE가 남아 있었다
    원인: Postgres는 새 함수에 PUBLIC EXECUTE를 기본으로 준다. 회수 구문이 없었다
    재발 방지: 회계 SECURITY DEFINER 함수는 search_path를 고정하고 PUBLIC·anon EXECUTE를 회수한다. 화면이 부르는 함수만 authenticated에 실행 권한을 준다
    자동 검사: node tests/accounting/transactions.mjs (anon_execute_revoked)

68. 문제: 확정 거래를 사용자 토큰으로 UPDATE/DELETE하면 오류 없이 0건이 된다
    원인: RLS가 confirmed 행을 업데이트 대상에서 빼서, 트리거까지 도달하지 않는다
    재발 방지: 화면은 확정 거래의 수정 버튼을 그리지 않는다. 트리거 차단 검사는 service role로 하고, 사용자 토큰 검사는 값이 그대로인지 본다
    자동 검사: node tests/accounting/transactions.mjs (confirmed_update_blocked, confirmed_delete_blocked)

69. 문제: 하네스 g4-golden(pdf-parse·골든 파일 검사)을 설계서 G4(외화 환산 규칙)와 혼동할 수 있다
    원인: 이름에 g4가 들어가 있어 회계 미검증 게이트 G4와 겹쳐 보인다
    재발 방지: g4-golden은 QA 하네스 전용이며 회계 G4와 무관하다. 회계 외화는 사용자 입력 환율과 미검증 표시만 쓴다
    자동 검사: 없음 (문서·LESSONS)

70. 문제: 회계 P2-a 단일 미션이 35분을 넘겼다
    원인: 거래 입력·RLS·UI·테스트 범위가 한 번에 들어갔다
    재발 방지: 설계서 P2는 P2-a(거래 입력)·P2-b(증빙)·P2-c(번역)로 나눈다
    자동 검사: 없음 (범위 분할)

71. 문제: 비VND 거래를 대표가 확정할 수 있었다
    원인: G4 미검증인데 confirm 액션만 막지 않았다
    재발 방지: 비VND는 초안·제출만 허용하고 confirm은 서버·UI 모두 FX_CONFIRM_BLOCKED로 막는다
    자동 검사: node tests/accounting/transactions.mjs (fx_confirm_blocked)
    상태: superseded by #76

72. 문제: 거래 목록에서 증빙 연결됨/누락으로 거르지 못한다
    원인: 목록 필터는 기간·유형·상태만 있고, 증빙 연결 상태는 배지로만 보인다
    재발 방지: 설계서 5-5의 증빙 연결 상태 필터가 목록에 있을 때만 그 항목을 통과로 본다
    자동 검사: 없음
    상태: 해결 (2026-10-16). 목록 쿼리 evidence=all|linked|missing. 연결됨은 evidence_files 1건 이상이고 배지와 같은 기준이다. 허용값 외는 400.

73. 문제: 거래 목록 증빙 필터의 베트남어는 담당자 검수 전 임시값이다
    원인: P2c에서 지정한 임시 번역을 카탈로그에 넣었다. 키는 accounting.txn.filter.evidence, evidence.all, evidence.linked, evidence.missing
    재발 방지: 베트남어는 Chứng từ / Tất cả / Đã đính kèm / Thiếu chứng từ 로 두고, 담당자 검수 전에는 고치지 않는다
    자동 검사: 없음

74. 문제: 다른 조직 증빙 경로의 스토리지 목록 조회가 HTTP 200이다
    원인: storage list는 권한 없는 객체를 오류로 거절하지 않고 RLS로 빼서 빈 배열을 준다
    재발 방지: 격리 판정은 상태 코드만 보지 않는다. 같은 폴더 목록을 소유자가 하면 1건, 다른 조직이면 0건이어야 한다. 다운로드와 서명 URL은 400이어야 한다
    자동 검사: 없음

75. 문제: 확정과 ledger_entries 생성이 분리되면 롤백 없이 confirmed만 남을 수 있다
    원인: 클라이언트에서 status만 UPDATE했다
    재발 방지: `accounting_confirm_transaction` RPC 한 트랜잭션에서 분개 삽입 후 확정한다. 트리거로 confirmed 전 차변합=대변합을 강제한다
    자동 검사: node tests/accounting/p3-posting.mjs

76. 문제: #71 비VND confirm 전면 차단은 G4 미검증 표시 요구와 맞지 않는다
    원인: P2에서 FX_CONFIRM_BLOCKED로 막았다
    재발 방지: P3부터 비VND는 사용자 입력 fx_rate로 amount_vnd를 쓰고 confirm은 허용한다. `accounting_ledger_entries_enriched.fx_conversion_unverified`와 UI 미검증 표시로 G4를 표시한다
    자동 검사: node tests/accounting/transactions.mjs (fx_confirm_with_unverified)

77. 문제: Node 하네스가 새 TS 모듈 상대 import를 못 찾는다
    원인: transactionEntry에서 postingRulesEngine 상대 경로를 ESM이 해석하지 못했다
    재발 방지: confirm RPC 호출은 transactionEntry에 두고, postingRulesEngine.ts는 enriched 조회 전용으로 유지한다
    자동 검사: node tests/accounting/p3-posting.mjs

78. 문제: posting_rules가 effective_from만 보면 동일 txn_date에 빈 condition과 구체 condition이 섞일 때 비결정적이다
    원인: ORDER BY effective_from desc 만 있었다
    재발 방지: `accounting_posting_rule_specificity` 후 effective_from desc. 마이그레이션 `20261016120000_accounting_p3b_posting_order_search.sql`
    자동 검사: node tests/accounting/p3-posting.mjs (posting_rule_specificity_wins, posting_rule_txn_date_effective_from)

79. 문제: 장부 화면 hydration 경고가 AccountingModuleHeader부터 찍힘
    원인: 서버 HTML과 클라이언트 첫 렌더의 문구는 같다(한국어 라벨). 차이는 Cursor 브라우저가 hydration 전에 요소에 붙인 data-cursor-ref 속성이다. 언어 쿠키·날짜 포맷의 서버/클라이언트 불일치가 아니다. 같은 화면을 Chrome으로 열면 hydration 오류가 없다. 로케일은 서버가 읽은 기존 vfbcai_locale을 LocaleProvider 초기값으로만 넘긴다.
    재발 방지: AccountingModuleHeader에 suppressHydrationWarning을 넣지 않는다. 새 사이트 쿠키를 만들지 않는다. hydration 판정은 data-cursor-ref를 주입하지 않는 브라우저에서 한다.
    자동 검사: node tests/accounting/p3c-browser-check.mjs (로컬 시드 hold 후)

80. 문제: 375px 장부 목록과 거래 상세에 하단 탭 4개(홈, 거래 입력, 세금 신고, 더보기)가 없다
    원인: AccountingModuleHeader는 거래 입력·장부 조회만 있다. 홈·세금 신고·더보기 화면은 아직 없다.
    재발 방지: 대상 화면이 생기기 전에 빈 하단 탭을 넣지 않는다. P3c에서는 실패로 기록만 한다.
    자동 검사: 없음 (p3c-browser-check의 mobile bottom tabs 4는 found=none)

81. 문제: 375px 장부 카드에 비VND 환산 미검증 배지가 빠졌다
    원인: 배지를 데스크톱 표에만 그렸다
    재발 방지: 모바일 카드에도 같은 미검증 배지를 그린다
    자동 검사: node tests/accounting/p3c-browser-check.mjs (mobile fx badge)

82. 문제: p2c step0 재실행의 증빙 필터 건수 검사가 UNAUTHENTICATED
    원인: 저장해 둔 조직 A 세션 토큰이 만료됨. 임시 member 삭제와 무관하다. 같은 실행에서 같은 조직 member의 서명 URL·다운로드는 200이고, 이번에 만든 임시 member는 끝에서 삭제됐다(잔여 2명 포함).
    재발 방지: 저장된 세션으로 다시 로그인한다. 만료 토큰을 제품 격리 실패로 보지 않는다.
    자동 검사: 없음

83. 문제: P4a 법령 점검 Playwright가 ko 라벨을 못 찾음
    원인: networkidle 직후에도 클라이언트가 vnk_admin·서식 목록을 불러오는 중이었다. member UPDATE RLS는 0행이라 오류 없이 통과해 테스트만 실패로 보였다.
    재발 방지: 회계 브라우저 하네스는 `sb-<supabase-host>-auth-token` 키와 화면 제목 waitFor를 쓴다. form_versions member 쓰기 테스트는 행 변경 여부로 판정한다.
    자동 검사: node tests/accounting/p4a-browser-check.mjs, node tests/accounting/p4a-form-registry.mjs

84. 문제: 375px 하단 탭 4개(홈·거래 입력·세금 신고·더보기)가 P3c 범위 화면에 없다
    원인: 홈·세금 신고·더보기 라우트가 아직 없고 AccountingModuleHeader만 있다(LESSONS 80).
    재발 방지: 홈·세금 신고 화면을 만들 때 하단 탭 4개를 함께 넣는다. P3c 마감 검증에서는 실패로만 기록하고 빈 탭을 넣지 않는다.
    자동 검사: 없음

85. 문제: p2c step0 증빙 필터 건수만 재검증할 때 저장 세션 만료로 UNAUTHENTICATED
    원인: seed-report.json은 남지만 session-a access_token이 만료된다(LESSONS 82).
    재발 방지: 검증 시작 직전 조직 A owner를 signInWithPassword로 재로그인한 뒤 linked·missing 필터만 호출한다.
    자동 검사: node tests/qa/_output/p2c-evidence-filter/filter-count-recheck.mjs

86. 문제: 회계 로컬 검증을 운영 Supabase(.env.local)에 붙인 next dev로 돌리면 P2/P3c 시드가 운영 DB에 남는다
    원인: 기본 next dev는 .env.local의 NEXT_PUBLIC_SUPABASE_URL을 쓴다.
    재발 방지: 회계 브라우저·시드 검증은 `node tests/accounting/p3c-local-next.mjs`로 로컬 Supabase만 바인딩한다. 운영 DB는 읽기 전용 잔여 조회만 한다.
    자동 검사: p3c-local-next.mjs가 non-local URL이면 거부

87. 문제: `node tests/accounting/isolation.mjs`의 owner_can_confirm이 실패한다
    원인: P3a 이후 `accounting_guard_confirmed_transaction`이 status=confirmed로 바꿀 때 차변합=대변합 ledger_entries를 요구한다. isolation은 P1 시절처럼 UPDATE만 했고 posting_rules·분개가 없어 트리거가 `accounting: cannot confirm without balanced ledger_entries`를 냈다. 대표 권한(RLS) 결함이 아니다.
    재발 방지: isolation에서 확정 전 `seedTestPostingRule`로 TEST-* 규칙을 넣고 owner는 `accounting_confirm_transaction` RPC로 확정한다. member_cannot_confirm은 UPDATE로 owner-only 트리거를 계속 검사한다. vnk_expert 확정 거부는 이 스크립트에 없고 p3-posting.mjs의 member_confirm_rpc_blocked가 역할을 분담한다.
    자동 검사: node tests/accounting/isolation.mjs (owner_can_confirm, cross_org_*)

88. 문제: `http://localhost:3020`에서 Internal Server Error가 난다
    원인: `.next/dev/logs/next-development.log`에 webpack 캐시 `ENOENT … client-development\\14.pack.gz`가 찍혔다. 캐시가 깨졌거나 dev 서버가 오래 돌아가며 pack 파일이 사라진 상태다. 3020은 `next dev --webpack -p 3020`(cwd vfbcai-new)이고, Supabase는 프로세스 환경의 `NEXT_PUBLIC_SUPABASE_URL`·`NEXT_PUBLIC_SUPABASE_ANON_KEY`·`SUPABASE_SERVICE_ROLE_KEY`에 따른다. `p3c-local-next.mjs`로 띄우면 위 세 변수만 로컬 `supabase status`로 덮어쓴다.
    재발 방지: 회계 브라우저 QA는 `node tests/accounting/p3c-local-next.mjs`를 쓴다. 500이 계속되면 `.next` 삭제 후 재기동한다. 운영 URL 바인딩 여부는 호스트가 127.0.0.1/localhost인지로만 판정하고 비밀값은 로그에 남기지 않는다.
    자동 검사: 없음 (재현 시 next-development.log의 ENOENT pack)

89. 문제: 모바일 하단 탭 4개(§5-1 홈·거래 입력·세금 신고·더보기) 담당 단계가 문서에 없어 P3c에서만 반복 실패로 남는다
    원인: §8 구현 단계에 “탭” 항목이 없고 P3c는 장부·거래만 있다(LESSONS 80·84).
    재발 방지: **세금 신고(§5-3) 화면을 만드는 P5**와 **홈 대시보드(§5-2)·더보기(상단 메뉴 나머지)** 라우트를 넣는 미션에서 공통 모바일 네비를 한 번에 넣는다. P3c/P4a 마감 범위에는 빈 탭을 넣지 않는다.
    자동 검사: 없음

95. 문제: P5b-2 브라우저 QA에서 `/login` 비밀번호 없이 막히고, `?periodKey=` URL이 ① 기본정보에 반영되지 않아 초안 생성이 비활성화되었다
    원인: 로그인은 매직링크 전용이고, VAT 클라이언트는 기간을 입력·localStorage만 읽었다. Playwright는 `sb-127-auth-token` 주입(LESSONS 83)이 필요하다.
    재발 방지: VAT는 `useSearchParams().periodKey`로 초기 기간을 채운다. 로컬 회계 브라우저 하네스는 `p5b-vat-browser-seed.mjs`→`.p5b-session.json`→`p5b-vat-browser-check.mjs` 순서로 돌린다. 시드 거래는 `accounting_confirm_transaction`으로 확정해 장부 메모·번역 배지를 본다. 격리 시드에서 org B owner를 org A 멤버에 넣지 않는다.
    자동 검사: node tests/accounting/p5b-vat-browser-check.mjs

94. 문제: P5b 부가가치세 화면에서 기간별 거래 점검 시 org_id를 클라이언트 state에 두지 않으면 RLS만 의존한다
    원인: precheck가 period_key만 필터해 다중 org 가입 시 혼동 가능성.
    재발 방지: GET /api/accounting/vat/declaration이 orgId를 반환하고, 클라이언트 점검 쿼리에 org_id를 명시한다.
    자동 검사: 없음

118. 문제: P9-5b에서 승인된 대표가 상단 「내 회사 정보」·홈 「설정」을 눌러도 `/company` 온보딩 게이트 때문에 거래 입력으로만 이동했다
    원인: `AccountingWorkspaceGate`는 승인 workspace에서 `/company`를 거래 입력으로 replace한다(온보딩 경로 전용).
    재발 방지: 승인 대표 조회는 `/company/accounting/profile`로 분리하고, 메뉴·더보기·허브 설정 href만 해당 경로로 연결한다. 게이트는 수정하지 않는다. TT89 이전 과세기간은 `gtgt01FormPeriod` 상수·`PERIOD_BEFORE_TT89`로 초안·검토 요청을 막는다.
    자동 검사: tests/accounting/isolation.mjs (p95b_*), p9-5b-browser-check.mjs, p9-2-home-hub-browser.mjs

93. 문제: P5a-2에서 Pack v2.1 §5와 엔진 [27][28][34][35] 체인이 어긋나 있었다
    원인: Cursor 초안 Pack·단순 [35]=[31]+[33] 식이 TT89 Phụ lục I와 불일치.
    재발 방지: field_map·computeGtgt01은 Claude G2 v2.1 §5만 따르고, 마이그레이션은 갱신용 새 파일만 추가한다.
    자동 검사: node tests/accounting/p5a-vat-gtgt.mjs

92. 문제: P5a 착수 시 `docs/master/forms/G2_VAT_FORM_PACK.md`가 저장소에 없었다
    원인: Form Verification Pack이 커밋되지 않은 상태에서 구현 미션만 내려왔다.
    재발 방지: Pack 파일을 먼저 `docs/master/forms/`에 커밋한 뒤 P5a 엔진·field_map 시드를 넣는다. Pack 없이는 §5 수식을 임의 추가하지 않는다.
    자동 검사: test -f docs/master/forms/G2_VAT_FORM_PACK.md

90. 문제: LESSONS 커밋에 ACE-APPROVED가 대표 승인 전에 붙었다
    원인: `b037823` 등 보호 파일(LESSONS) 커밋 시 hook을 통과하려고 ACE-APPROVED 줄을 먼저 넣었다. 승인·문구 확정이 커밋보다 뒤일 수 있다.
    재발 방지: LESSONS·STANDARDS 등 보호 파일은 대표가 내용을 확인한 뒤에만 ACE-APPROVED 커밋한다. 이번 P3c 마감 보완(87–89)은 지시에 따라 LESSONS에 기록하고 ACE-APPROVED로 커밋한다.
    자동 검사: .githooks/commit-msg

91. 문제: accounting_exports에 불변 트리거(accounting_trg_deny_exports_mutate)를 걸면 org cascade 삭제가 막혀 테스트 정리가 실패한다
    원인: exports는 insert-only라 UPDATE·DELETE가 모두 예외다. organizations 삭제가 exports로 cascade되면서 같은 트리거에 걸린다(evidence_files·ledger_entries와 같은 구조).
    재발 방지: 로컬 테스트 정리 때 exports 삭제 직전에 이 트리거를 일시정지하고 끝나면 반드시 되살린다(p3c-ledger-seed.mjs guardStatements 참고). 운영에서는 정리 삭제를 하지 않는다.
    자동 검사: node tests/accounting/p3c-ledger-seed.mjs cleanup

93. 문제: P6a 화면이 API를 `credentials: "include"`로만 호출해 401이 났다
    원인: accounting API 라우트는 Authorization Bearer 토큰만 읽는다(requestUser.ts). 쿠키 세션은 읽지 않는다.
    재발 방지: 회계 화면의 fetch는 accountingAuthFetch(src/lib/accounting/authFetch.ts)를 쓴다.
    자동 검사: node tests/accounting/p6b-browser-check.mjs

94. 문제: 클라이언트 컴포넌트가 evidenceEntry.ts에서 상수를 import해 `node:crypto` webpack 빌드 오류가 나고 API가 500이 됐다
    원인: 서버 전용 모듈(node:crypto)을 클라이언트 번들이 끌어왔다.
    재발 방지: 클라이언트는 서버 모듈에서 상수도 import하지 않고 리터럴을 쓴다. 3020이 500이면 LESSONS 88 순서(프로세스 종료·.next 삭제·p3c-local-next)로 복구한 뒤 서버 로그의 import trace를 먼저 본다.
    자동 검사: node tests/accounting/p6b-browser-check.mjs

95. 문제: vnk_expert가 접수증을 올릴 수 없었다(스토리지 insert 정책이 company_owner·company_member만 허용)
    원인: P6a가 접수증 경로를 `filing/...`로 잡았고 정책은 첫 폴더가 org_id여야 한다. DB 테스트는 경로 문자열만 넣어 업로드를 검사하지 않았다.
    재발 방지: 경로는 `{org_id}/filing/...`로 하고 배정된 vnk_expert 전용 insert 정책을 P6b 마이그레이션에 추가했다. 파일 업로드가 있는 기능은 브라우저에서 실제 업로드까지 확인한다.
    자동 검사: node tests/accounting/p6b-browser-check.mjs (A6)

96. 문제: i18n_texts insert 정책이 status를 제한하지 않아 누구나 human_verified를 직접 넣을 수 있었다
    원인: 베트남어 확정 권한이 RLS가 아니라 화면 규칙에만 있었다.
    재발 방지: human_verified insert는 트리거로 막고 accounting_confirm_vi_text(company_member+locale=vi 또는 배정된 vnk_expert, 설계서 §3)로만 새 version을 넣는다. company_owner는 locale과 무관하게 확정하지 않는다.
    자동 검사: node tests/accounting/p6b-corrections.mjs

97. 문제: 정정 요청을 review_comments UPDATE로 바로 resolved 처리하면 승인 절차(새 거래+역분개)를 우회한다
    원인: P6a resolve 정책이 작성자·대표에게 모든 comment의 status 변경을 허용했다.
    재발 방지: target_type=transaction인 correction_request는 accounting_approve_correction·accounting_reject_correction 안에서만 resolved가 되도록 update 트리거로 강제했다.
    자동 검사: node tests/accounting/p6b-corrections.mjs (direct_resolve_blocked)

98. 문제: `p6b-browser-check.mjs` 첫 실행이 Playwright TimeoutError로 끊기고 재실행은 28/0 통과한다
    원인: 3020 dev에서 `/vnk/accounting/review-queue` 등 첫 라우트 webpack 컴파일이 60s waitFor(조직명·코멘트)보다 길어질 수 있다. 제품 격리·RLS 결함이 아니라 cold-compile·부하에 따른 **flaky** 타임아웃이다.
    재발 방지: 마감 판정 전 한 번 재실행하거나, dev를 미리 해당 URL로 워밍업한 뒤 하네스를 돌린다. 60s 내 500이면 LESSONS 94·88( import trace·.next 삭제)을 먼저 본다.
    자동 검사: node tests/accounting/p6b-browser-check.mjs

99. 문제: 로컬 purge harness용 leads/crm 부트스트랩 SQL을 `supabase/migrations`에 넣으면 운영 push 시 RLS 없는 테이블·GRANT가 생길 수 있다.
    재발 방지: harness 전용 SQL은 `tests/security/`에만 두고, 운영 마이그레이션에는 `audit_log` 등 실제 제품 스키마만 넣는다.
    자동 검사: node tests/security/pre-signup-document-purge.mjs

100. 문제: P7a `p7a-funnel-browser-check.mjs`가 Playwright chromium 미설치로 즉시 실패했다(`Executable doesn't exist`).
    원인: Cursor 샌드박스·신규 환경에서 `@playwright/test`만 있고 브라우저 바이너리는 별도 설치가 필요했다.
    재발 방지: 회계 퍼널·UI 마감 전 `npx playwright install chromium`을 한 번 실행한다. dev는 `p3c-local-next.mjs`(3020)만 쓴다(LESSONS 86).
    자동 검사: node tests/accounting/p7a-funnel-browser-check.mjs

101. 문제: P7b에서 purge harness·전체 E2E(가입→승인 대기)를 미실행했다. P7d에서 harness는 통과했으나 `accounting_organizations` INSERT/UPDATE에 `accounting_audit_log` 트리거가 없어 조직 생성·승인 audit 검증이 실패했다.
    원인: P1 `accounting_audit_log_append` 트리거가 `accounting_transactions` 등에만 붙고 `accounting_organizations`에는 없음. P7b는 시간·범위상 harness/E2E를 보고만 하고 종료했다.
    재발 방지: 설계 §6 audit 누락 게이트는 org 생성·`approval_status` 전환용 트리거(또는 서버 audit insert) 추가 후 `tests/accounting/p7d`류로 INSERT/UPDATE 행·hash·PII 미기록을 자동 검사한다. purge는 `node tests/security/pre-signup-document-purge.mjs` + `verify-accounting-funnel/...` 경로 시나리오를 harness에 포함한다.
    자동 검사: node tests/security/pre-signup-document-purge.mjs (P7d: funnel 경로는 `runPreSignupDocumentPurge` 로컬 시나리오로 확인됨 — 미가입 31일 삭제·가입 후 user_id 보존)

102. 문제: P7d 조직 audit 실패·E2E가 `vat_s1_q2` 고정 클릭으로 Pack 분기(show_if·label)를 따라가지 못했다.
    원인: `accounting_organizations`에 audit 트리거 미부착. E2E는 P7a와 동일한 label needle·stage2 루프가 필요했으나 별도 스크립트가 q2를 순서 클릭만 시도했다.
    재발 방지: P7e 마이그레이션 `20261017120000_accounting_p7e_org_audit_triggers.sql`로 INSERT·`approval_status` UPDATE만 audit. E2E는 `p7a-funnel-browser-check.mjs`와 동일 Pack 네비게이션을 `p7e-e2e-browser.mjs`에 재사용한다.
    자동 검사: node tests/accounting/p7e-org-audit.mjs · node tests/accounting/p7e-e2e-browser.mjs

105. 문제: P6c에서 vnk_staff가 승인 대기 org의 `approval_status`를 UPDATE하면 RLS가 `new row violates`로 실패했다.
    원인: UPDATE 후 행이 `pending`이 아니게 되어 `accounting_orgs_select_pending_staff`만으로는 결과 행 SELECT가 불가했고, 멤버십도 없었다.
    재발 방지: `accounting_is_vnk_staff()`용 org SELECT 정책을 추가하고, pending 전환은 guard 트리거+staff UPDATE 정책으로 처리한다. `node tests/accounting/p6c-org-approval.mjs`로 승인·audit를 검증한다.
    자동 검사: node tests/accounting/p6c-org-approval.mjs

104. 문제: 1차 결과 화면이 Content Pack 슬롯 없이 placeholder만 표시됐다.
    원인: 질문 Pack만 `contentPackData.ts`에 있고 결과 Pack JSON·타입·해석 로직이 없었다.
    재발 방지: `docs/master/content/RESULT_PACK_FUNNEL.json` 단일 원본 + `loadResultPacks.ts`·`resolveFirstResult.ts`·`validateResultPackAlignment.ts`. E2E는 `p7g-result-pack.mjs`·`p7g-first-result-browser.mjs`.
    자동 검사: node tests/accounting/p7g-result-pack.mjs · node tests/accounting/p7g-first-result-browser.mjs

103. 문제: P7e E2E가 가입 완료 화면까지 가지 못했다.
    원인: (b) 로컬 `accounting_prereq`가 만든 `public.users`에 phone·email 등 컬럼이 없어 `/api/company-member-signup`이 500(`column users.phone does not exist`)을 반환. E2E는 주소 placeholder 불일치·`/login`이 비밀번호 폼이 아닌 매직링크 UI라 password 입력 대기가 (d)에 해당했다.
    재발 방지: `20261017130000_accounting_users_profile_columns.sql`로 프로필 컬럼 IF NOT EXISTS 추가. `p7f-e2e-browser.mjs`는 3020 기동 검사·signup API status(PII 제외)·`company-member-signup-done`·가입 후 `signInWithPassword`+localStorage 세션 주입·`accounting-workspace-pending-approval`로 완주. 모바일은 퍼널 q1 재시도 루프.
    자동 검사: node tests/accounting/p7f-e2e-browser.mjs

107. 문제: P5c 홈 Playwright가 owner 데스크톱에서 `home-schedule`을 찾지 못했다.
    원인: 홈 데이터는 `useEffect` 후 로드되는데 카드 testid를 즉시 검사했다.
    재발 방지: `p5c-home-browser-check.mjs`는 `home-recent`·`home-schedule` waitFor 후 DOM을 검사한다. 교차 org 홈 스냅샷은 `isolation.mjs`의 `home_*` 케이스 4건으로 검증한다.
    자동 검사: node tests/accounting/p5c-home-browser-seed.mjs · node tests/accounting/p5c-home-browser-check.mjs · node tests/accounting/isolation.mjs

106. 문제: P5c 회계 홈·공통 셸에서 거래 입력 `useSearchParams` 초기화와 Next layout 추가 시 tsc가 `.next/dev/types` 불일치로 실패할 수 있다.
    원인: `company/accounting/layout.tsx` 신설 후 dev 서버가 남긴 validator 타입과 정적 `tsc` include가 어긋남.
    재발 방지: 회계 UI 마감 전 `.next/dev/types` 삭제 후 `npx tsc --noEmit`. 거래 목록 URL 필터(`status`·`evidence`)는 `Suspense`로 감싼다. 홈 데이터는 anon+RLS `supabase`만 쓰고 `company_member`는 declarations 쿼리를 생략한다.
    자동 검사: npx tsc --noEmit · node tests/accounting/evidence.mjs (ko/vi 키 parity)

109. 문제: P7-2a에서 기업회원 가입 후 작업공간 연결·승인 대기 게이트가 없었다.
    원인: 조직 생성은 signup API에만 있고 회계 모듈 첫 진입·퍼널 Expert CTA가 placeholder였다.
    재발 방지: `/api/accounting/company-profile` + `/company/accounting/company` 온보딩, `/company/accounting/pending` 대기, `AccountingWorkspaceGate`로 작업공간 URL 차단. Expert CTA는 `resolveAccountingWorkspaceDestination` 링크.
    자동 검사: npx tsx tests/accounting/p7-2a-verify.mjs · npx tsx tests/accounting/isolation.mjs

111. 문제: P7-2b 조직 서류·승인 요청·전문가 승인 흐름과 온보딩 폼 Playwright 제출 버튼 비활성 이슈.
    원인: pending→approved 직행을 막으려 `in_review`와 `accounting_org_request_review` RPC가 필요하고, 온보딩 E2E는 SelectionCard 클릭 후 `profileOk`가 갱신되지 않아 submit이 disabled로 남을 수 있다.
    재발 방지: `accounting_org_documents`·`/api/accounting/org-documents`·`org-approval-request`·전문가 큐는 `in_review`만 처리. 반려는 `i18n_texts` field `review_note`. 온보딩 E2E는 `accounting-onboard-category-*`·`position-*` testid 사용.
    자동 검사: npx tsx tests/accounting/p7-2b-org-docs.mjs · npx tsx tests/accounting/isolation.mjs · node tests/accounting/p7-2a-onboard-form-browser.mjs

110. 문제: P7-2a 보완에서 pending 사용자가 작업공간 URL 직접 접근 시 클라이언트 gate만으로는 HTML 노출·3020 EADDRINUSE·퍼널 ko 「준비」 실패가 있었다.
    원인: 데이터 페이지는 RSC에서 승인 상태를 보지 않았고, E2E는 vi locale 쿠키가 라우트 간 유지됐으며, 3020에 구 dev가 남아 500이 났다.
    재발 방지: `AccountingWorkspaceDataServerLayout`로 transactions·ledger·vat·filing·evidence 서버 redirect. 퍼널 브라우저 QA는 라우트마다 `accounting-funnel-locale-ko` 클릭. `uiCatalog` ko/vi 키 parity로 vi 누락은 `tsc` 실패.
    자동 검사: node tests/accounting/p7-2a-e2e-browser.mjs · npx tsx tests/accounting/isolation.mjs · node tests/accounting/p7-1-supplement-browser.mjs

108. 문제: P7-1 보완에서 isolation 단독 `node` 실행이 실패하고 3020이 500·빈 화면이었다.
    원인: `isolation.mjs`가 `accountingHomeData.ts`를 tsx 없이 import해 ESM이 `vatDeadline`을 못 풀었고, Next는 `.next` 불일치·로컬 Supabase env 없이 기동됐다. Expert CTA·퍼널 locale은 SSR과 쿠키 locale이 달라 hydration 경고가 났다.
    재발 방지: `npx tsx tests/accounting/isolation.mjs`·`node tests/accounting/p3c-local-next.mjs`. `AccountingFunnelExpertCta`·`AccountingFunnelClient`는 mount 후 세션·locale UI를 그린다.
    자동 검사: npx tsx tests/accounting/isolation.mjs · node tests/accounting/p7-1-supplement-browser.mjs

112. 문제: P7-2b 보완 E2E에서 반려 사유 미표시·비전문가 전문가 큐 빈 목록·pending 서류 업로드 500이 있었다.
    원인: `accounting_i18n_texts` SELECT는 `accounting_can_use_org_data`(승인 org만)라 rejected owner가 `review_note`를 못 읽었다. `denyNonExpertQueueAccess`는 owner/member만 막고 무소속 사용자는 200 빈 큐를 받았다. org-doc POST 후 audit 로그를 user RLS로 읽어 pending org에서 500이 났다.
    재발 방지: `listOrgDocuments`는 owner+rejected일 때 service role로 `review_note`만 조회. 전문가 큐 gate는 `vnk_expert`/`vnk_admin` 없으면 403. 업로드는 userClient storage·audit는 트리거에 맡기고 POST 응답에서 audit SELECT 생략.
    자동 검사: node tests/accounting/p7-2b-e2e-browser.mjs · npx tsx tests/accounting/isolation.mjs

113. 문제: P8-1a에서 `node tests/accounting/p3-posting.mjs`가 21 pass·2 fail로 종료했다.
    원인: `filed_manual_period_blocked`·`rollback_not_confirmed` 케이스가 기대와 불일치(기간 잠금·롤백 시나리오).
    재발 방지: filed_manual·정정 롤백 게이트는 p3-posting 실패를 0으로 만든 뒤 §9 차변합·확정 불변을 다시 매핑한다. 수정은 별도 IMPLEMENT 미션.
    자동 검사: node tests/accounting/p3-posting.mjs

114. 문제: P8-1a에서 `node tests/accounting/p7e-org-audit.mjs`가 `accounting: org must be in_review before expert resolution`로 중단했다.
    원인: harness가 승인 전 `in_review` 전환(`accounting_org_request_review`) 없이 expert resolution을 호출한 순서.
    재발 방지: p7e는 P7-2b RPC 순서(pending→in_review→approve/reject)를 따른다. LESSONS 111·102와 동일 계열.
    자동 검사: node tests/accounting/p7e-org-audit.mjs

115. 문제: P8-1a에서 `p7g-result-pack.mjs`·`p7a-content-pack-validate.mjs`가 Content Pack 정렬·stage 카운트에서 실패했다.
    원인: RESULT_PACK의 `when.question_id`가 Pack의 `vat_s1_q2` 등과 불일치(unknown_question)·production entry stage1/2=0·flags 검사 FAIL.
    재발 방지: 공식 Content Pack 수령·`contentPackData` question_id 동기화 후 p7a·p7g 0 fail. 문구 invent 금지.
    자동 검사: node tests/accounting/p7g-result-pack.mjs · node tests/accounting/p7a-content-pack-validate.mjs

116. 문제: P8-1b에서 회계 브라우저 하네스 연쇄 실패(p5c `home-recent` 45s, p4b `p3c-ledger/report.json` 없음, p5b `① 기본정보` 30s, p7a·p7g·p7f `accounting-funnel-active` 90s, p7-2b `/company/accounting/pending` 60s).
    원인: p4b는 p3c-ledger 시드 산출물 미선행; 퍼널 계열은 Pack stage0·`accounting-funnel-active` 미노출(P8-1a p7a·p7g node FAIL과 동일 계열). p5c는 시드 후 홈 카드 미표시(세션·RLS·3020 상태). p7-2b는 온보딩→pending redirect 미도달.
    재발 방지: P8-1b 재실행 전 p3c-ledger-seed·Pack 정렬(P7a/P7g node 0 fail)·p5c 시드·3020 `p3c-local-next` 재기동 순서를 고정한다. 가입 5파일 미커밋 변경이 있어도 이번 실패는 퍼널 active·ledger report 선행 누락이 주원인으로 보인다.
    자동 검사: node tests/accounting/p5c-home-browser-check.mjs · node tests/accounting/p4b-browser-check.mjs · node tests/accounting/p5b-vat-browser-check.mjs · node tests/accounting/p7a-funnel-browser-check.mjs · node tests/accounting/p7f-e2e-browser.mjs

117. 문제: P8-2·P8-3에서 `npx tsx tests/accounting/isolation.mjs`가 36 pass·1 fail(`p72a_duplicate_org_blocked`)로 종료했다.
    원인: `provisionCompanyMemberSignup`이 기존 `company_owner` 멤버십이 있을 때 `CompanySignupAlreadyProvisionedError` 대신 `{ orgId, approvalStatus }`를 반환했다. 가입 5파일 stash(`signup-tail-held-2026-10-17`)에만 중복 차단 throw가 있었고 HEAD에는 미반영.
    재발 방지: isolation 37/0 전에 `provisionCompanyMemberSignup.ts`만 stash에서 복원·커밋해 throw 경로를 HEAD에 고정한다. stash pop 없이 1파일 checkout만.
    자동 검사: npx tsx tests/accounting/isolation.mjs

120. 문제: P9-6b VAT wizard 동시 저장을 `updated_at`만으로는 감지되지 않았다(트리거 없음).
    원인: `accounting_declarations.updated_at`이 computed 갱신 시 항상 바뀌지 않을 수 있다.
    재발 방지: `computed._wizard.revision`을 올리고 `expectedRevision`으로 409 `CONCURRENT_SAVE`를 반환한다. 번역은 `deferTranslation`로 저장 응답 후 비동기 처리한다.
    자동 검사: npx tsx tests/accounting/isolation.mjs (p96b_*) · node tests/accounting/p9-6b-browser-check.mjs

119. 문제: P9-6 §11 전 범위를 한 미션에 넣으면 VAT ①~⑥ 서버 공동 편집·검토 코멘트·정정 사유 등 미연결 화면이 남는다.
    원인: VAT wizard는 client step·localStorage만 있고 `declarations.computed`에 단계·작성자 메타가 없었다. 거래 UI는 memo/description 필드가 API에 없었다.
    재발 방지: `accountingI18nTexts`·`form-basis`·보기 전환 바를 먼저 고정한 뒤, VAT `_wizard`·나머지 자유입력 칸을 단계별 미션으로 붙인다. LESSONS 번호는 기존 #95·#110 중복 없이 최대+1(118 P9-5b, 119 P9-6)만 쓴다.
    자동 검사: node tests/accounting/isolation.mjs · (추가) p9-6-browser-check.mjs

121. 문제: P9-6b 마감 QA #1·#3이 UI 저장·비동기 번역 타이밍에 따라 PASS/FAIL이 바뀌었다.
    원인: `deferTranslation`·기계번역 완료 시점을 하네스가 기다렸고, 반대 언어 `accounting_i18n_texts` 행을 시드하지 않았다.
    재발 방지: 번역 대기·원문 유지 검증은 ko/vi 중 한쪽만 `status=original`로 service 시드하고 번역 API를 호출하지 않는다.
    자동 검사: P96B_QA_PARTIAL=1 node tests/accounting/p9-6b-qa-close.mjs

122. 문제: p5b-vat-browser-check가 filed_manual(2026-09) 기간 input에 fill을 시도해 타임아웃했다.
    원인: `declarations.status=filed_manual`이면 해당 기간 입력 잠금이 정상 동작인데 하네스가 미제출 기간과 동일하게 다루었다.
    재발 방지: 미제출 기간(시드 period)에서 입력·초안 시나리오를 돌리고, filed_manual URL에서는 period input `disabled`를 단언한다.
    자동 검사: node tests/accounting/p5b-vat-browser-seed.mjs · node tests/accounting/p5b-vat-browser-check.mjs

123. 문제: P9-6b 마감 보고가 FAIL만 적고 제품 결함 vs 하네스 전제 구분이 없었다.
    원인: 세션 주입·Playwright 전제 실패와 표시 로직 버그를 같은 bucket에 넣었다.
    재발 방지: QA 마감 시 항목마다 원인 분류(제품/하네스) 한 줄을 보고에 포함한다.
    자동 검사: (수동) P9-6b 마감 보고 템플릿

124. 문제: 번역 대기 검증 하네스가 항목 클릭 후 고정 1.2초만 기다려, 같은 코드인데 1차 FAIL·2차 PASS가 나왔다.
    원인: 거래 상세의 비동기 로드·번역 상태 반영 시점을 고정 지연으로 가정했다.
    재발 방지: 고정 sleep 대신 메모 값 또는 "번역 대기" 요소가 나타날 때까지 최대 10초 조건 대기한다. 번역 완료는 DB 행을 폴링(최대 60초, 5초 간격)해 확인한다.
    자동 검사: P9_BIDI_MODE=pending|translate|failure node tests/accounting/p9-carryover-bidi.mjs

125. 문제: 번역 하네스의 결과 note에 사용자 입력 메모 원문 일부가 들어가 console.log로 출력됐다.
    원인: 디버깅용 텍스트 덤프를 결과 객체에 그대로 넣었다.
    재발 방지: 하네스 로그·note에는 길이·존재 여부·언어·status·version만 남기고, 메모·코멘트 원문은 출력하지 않는다. 커밋 전 `console.log` 대상을 점검한다.
    자동 검사: Select-String -Path tests/accounting/p9-carryover-bidi.mjs -Pattern 'ko_head|innerText' (0건이어야 함)

126. 문제: 데스크톱 1440에서 번역 완료 후 같은 목록을 연 직후에는 한국어 칸이 갱신되지 않아 FAIL이 났고, 같은 조건의 새로고침 후에는 한국어가 표시됐다(모바일은 PASS).
    원인: 번역 완료 이전에 열린 상태를 판정했다. 번역 결과는 새로 로드된 화면에서만 확인하는 것이 안전하다(분류 a, 하네스 타이밍).
    재발 방지: 번역 후 판정은 DB 폴링 완료 → 새로고침 → 항목 재오픈 뒤 DOM 텍스트로 판정한다. 스크린샷 판독에 의존하지 않는다.
    자동 검사: P9_BIDI_MODE=translate node tests/accounting/p9-carryover-bidi.mjs

127. 문제: P10 `confirmed` standardized_drafts UPDATE/DELETE 하네스가 PostgREST `error`만 보고 FAIL했다.
    원인: RLS가 0행 갱신이면 예외를 내지 않고, 트리거는 호출되지 않는다.
    재발 방지: confirmed 불변 검증은 갱신·삭제 `select` 행 수 0과 service_role로 읽은 값 유지를 함께 단언한다.
    자동 검사: node tests/accounting/p10-standardized.mjs

128. 문제: P10 로컬 보완 검증에서 status 주입·`next dev -p 3022` 후 120초 내 HTTP ready가 되지 않아 브라우저 목록 검증이 SKIP되었다.
    원인: 콜드 컴파일·Windows spawn 대기가 하네스 상한(60×2s)보다 길었다.
    재발 방지: 로컬 UI 검증 전 `p3c-local-next.mjs` 등으로 3020을 먼저 기동하거나, 3022 ready 폴링 상한을 늘리고 `.next` 워밍을 분리한다.
    자동 검사: node tests/accounting/p10-local-supplement.mjs

129. 문제: P10 목록 3022 검증에서 `next dev` 로그는 Ready인데 6분 폴링 중 `/vat/standardized` HTTP 응답이 없었다.
    원인: 동시에 다른 `next dev`가 떠 있으면 Turbopack이 `Another next dev server`로 라우트 응답이 막힐 수 있다(`.env.local`은 그대로 로드됨).
    재발 방지: 3022 기동 전 기존 next dev(3020 등)를 종료하거나 Ace가 지시한 production build·단일 서버 방식을 쓴다.
    자동 검사: node tests/accounting/p10-list-3022-verify.mjs

129. 문제: P10 목록 3022 검증에서 `next dev` 로그는 Ready인데 6분 폴링 중 `/vat/standardized` HTTP 응답이 없었다.
    원인: 동시에 다른 `next dev`가 떠 있으면 Turbopack이 `Another next dev server`로 라우트 응답이 막힐 수 있다(`.env.local`은 그대로 로드됨).
    재발 방지: 3022 기동 전 기존 next dev(3020 등)를 종료하거나 Ace가 지시한 production build·단일 서버 방식을 쓴다.
    자동 검사: node tests/accounting/p10-list-3022-verify.mjs
