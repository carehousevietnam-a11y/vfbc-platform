# 작업 인계 (HANDOFF)

새 대화나 Cursor를 시작할 때 이 문서를 먼저 읽는다. 대표가 매번 같은 설명을 붙이지 않게 하려는 문서다. 작업을 끝낼 때마다 「현재 상태」만 고쳐 쓴다(규칙은 DECISIONS·LESSONS에 있고 여기에 다시 쓰지 않는다).

## 시작할 때 읽는 순서
1. 이 문서
2. `docs/master/DECISIONS.md`의 2026-10-14 행, `docs/master/LESSONS.md` #56~#59 (전체를 읽지 않고 필요한 행만)

## 현재 상태 (마지막 갱신: 2026-10-14)
- 저장소: `C:\vfbcai-new`, 작업 브랜치 `chore/harness-v1`, 푸시 대상 `chore/harness-v1-clean`
- 직접 인허가 8개 서비스(식당·위생·소방·환경·화장품·의료기기·프랜차이즈·회사설립) 질문을 고객 목소리 "~합니다" 체로 재작성함
- 푸시된 마지막 커밋: 945fae2 (조사 을/를 받침 규칙, 의료기기·프랜차이즈 첫 질문 재구성)
- 커밋 전 변경: 환경 3번, 화장품 2·3·4번, 의료기기 3번 선택지와 프랜차이즈 질문 문구 수정, LESSONS #59 (대표가 PowerShell에서 커밋·푸시)
- 미리보기: `https://vfbc-platform-git-chore-41a8aa-carehousevietnam-a11ys-projects.vercel.app/verify/<서비스>` (restaurant, hygiene, fire, environment, cosmetics, medical, franchise, company)
- 화면 확인 완료: 식당, 의료기기, 프랜차이즈, 소방 / 확인 전: 환경, 화장품, 위생, 회사설립(질문 2 이후)

## 남은 일
1. 위 푸시 후 확인 전 서비스를 화면으로 확인
2. main(운영) 반영 여부 결정
3. 보안(GitHub Private 전환, Vercel Firewall 요청 제한, SQL B)과 실제 폰 확인은 대표가 직접 함

## 파일 위치
- 공통 질문 틀: `scripts/register-voice-spec.mjs` (서비스 말만 바꿔 씀)
- 업종 질문: `scripts/<서비스>-content-spec.mjs`
- 수정 후 `node scripts/build-<서비스>-content-final.mjs --write`로 설계서(md)와 화면 데이터를 다시 만든다. 공통 틀을 고치면 8개 서비스를 모두 다시 만들어 diff를 확인한다.

## 작업 방식 (토큰 절약)
- 질문·선택지는 하나라도 어색하면 안 된다. 고객이 억지로 느끼지 않는지 소리 내어 읽고 확인한다.
- 화면 확인은 Claude가 직접 하되, 페이지 전체 글 읽기는 서비스당 한 번만 한다. 문장 점검은 스펙 파일에서 먼저 한다.
- 파일은 필요한 줄만 읽고, 출력이 긴 명령은 앞부분만 본다.
- 수정은 요청한 부분만 한다. 범위를 넓힐 때는 먼저 묻는다.
- 커밋·푸시는 대표가 PowerShell에서 한다. 접두사는 `content:` 또는 `chore:`를 쓴다(fix는 LESSONS 기록이 필요함).
- 한 시간 넘게 쉬었다면 긴 대화를 이어 가지 말고 이 문서를 읽는 새 대화로 시작한다.
- 요청은 묶어서 보낸다. 진행 중 확정·수정된 내용은 DECISIONS에 한 줄 추가한다.
