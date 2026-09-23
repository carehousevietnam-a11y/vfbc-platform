VFBCAI 현재 개발 인계 지시

현재 Claude가 진행 중인 작업은 기존 VFBCAI 개발 결과를 이어서 진행해야 한다.
처음부터 다시 설계하거나 CASE별로 다시 개발하지 않는다.

[1. 가장 중요한 전제]

VFBCAI의 VERIFY → 행정문서 Admin Master와 CASE_01~06은 이미 구현되어 있다.
특히 Admin VERIFY Master와 CASE_06은 여러 차례의 실제 구현/QA를 통해
질문 구조, 상황추적 프로파일링, Phase1/Phase2, adaptive branching,
STOP, persistence/restore, reclassification, expert handoff 등의
공통 패턴이 이미 확립되어 있다.

따라서 현재 목표는:
"CASE_03부터 다시 만드는 것"이 아니라
기존 Admin Master + CASE_01~06에서 이미 확립된 공통 구조를
다른 VERIFY 서비스에 가장 빠르게 적용하는 것이다.

절대로 기존 구현을 폐기하고 새로운 구조를 만들지 않는다.

[2. 절대로 다시 하지 말 것]

다음 작업은 하지 않는다.

- Admin VERIFY Master 재설계
- CASE_01~06 재작성
- CASE_06 재설계
- CASE_07 생성
- 기존 질문/선택 구조를 처음부터 다시 조사
- 기존 Situation Profiling 구조를 새로 만드는 작업
- Master UI 재디자인
- CHECK / VERIFY / REGISTER 구조 변경
- DB/API/CRM/Storage/RLS 구조 변경
- 기존 business logic의 광범위한 refactor
- 이미 PASS한 CASE_06을 다시 반복 QA
- 이미 확정된 질문/선택/STOP 로직을 임의로 변경
- legacy funnel을 다시 살리는 작업

[3. 반드시 보존해야 하는 Master 원칙]

다음은 VFBCAI 공통 Master Architecture로 취급한다.

A. 사용자에게는 단순하게,
   시스템 내부에서는 정교하게.

B. 질문은 단순 UX 문구가 아니다.
   각 답변은 Situation Profile을 구조화하고
   이후 질문/분기/결과에 실제 영향을 주어야 한다.

C. 질문 구조는 다음 사고방식을 포함한다.
- 조사/프로파일링
- 목표/주장
- 사건 시작점
- 시간/순서
- 당사자
- 사용자의 행동
- 상대방 행동/반응
- 현재 상태
- 증거
- 권리/요구사항
- 막힘/장애
- 최종 목표

D. Phase 1과 Phase 2는 동일 정보를 반복하지 않는다.

E. Phase 2는 형식적인 추가 질문이 아니다.
   Phase 1과 정보 밀도가 균형을 가져야 한다.

F. CASE_06 등 handoff에서 얻은 정보는
   "상태 정보"이지 목표 CASE의 실제 사실값이 아니다.
   따라서 CASE_06 → CASE_02/03/04/05로 이동할 경우
   목표 CASE의 고유 value-question을 생략하지 않는다.

G. active question case와 final classification case를 분리한다.

H. STOP은 단순 field-filled 여부가 아니라
   해당 경로에서 실제 판단에 필요한 정보가 확보되었는지 기준으로 한다.

I. raw slug를 저장하고 display label과 분리한다.

J. persistence / restore 후에도 동일한 Situation Profile과
   질문 상태가 유지되어야 한다.

K. DI는 질문 카드 안에 반복해서 넣지 않는다.
   전체 질문 흐름의 하단에서 한 번의 자연스러운 flow로 처리한다.

L. 질문 진행 중에는 불필요한 결과/Expert CTA를 노출하지 않는다.

M. Browser E2E는 실제 UI를 통과해야 한다.
   harness가 직접 state를 주입하여 제품이 통과한 것처럼 만들지 않는다.

N. harness 실패와 제품 실패를 구분한다.

O. 모든 코드 변경 후:
   npx tsc --noEmit

P. 증거 없이 PASS / COMPLETE / LOCK이라고 선언하지 않는다.

[4. 현재 가장 빠른 구현 방법]

CASE_03/04/05를 각각 처음부터 개발하지 않는다.

먼저 기존 코드에서 이미 구현된 공통 구조를 그대로 찾아서
"VERIFY Common Master" 형태로 추출 가능한 부분과
서비스별 Adapter 부분을 분리한다.

개념적으로:

VFBCAI Constitution
        ↓
MASTER DEVELOPMENT SKILL v1.2
        ↓
MASTER QUESTION ARCHITECTURE
        ↓
Situation Tracking Profiling
        ↓
ADMIN VERIFY MASTER
        ↓
공통 VERIFY MASTER PATTERN
        ↓
--------------------------------
| CASE_03 Adapter
| CASE_04 Adapter
| CASE_05 Adapter
| Real Estate Adapter
| Fraud Adapter
| Tax Adapter
| Unclear Adapter
--------------------------------

[5. 공통으로 재사용할 것]

기존 Admin Master에서 가능한 한 그대로 재사용한다.

- Situation Profile 구조
- question builder 패턴
- adaptive branching
- active question case
- final classification
- STOP condition
- Phase1/Phase2 구조
- bridge snapshot
- persistence
- restore
- handoff
- signup gate
- evidence gate
- personalized result 연결
- CRM meta 구조
- expert handoff 구조
- QA harness 패턴
- Master UI 컴포넌트

서비스마다 새로 만들어야 하는 것은
실제 domain-specific question/value/rule뿐이다.

[6. 현재 작업 순서]

1단계:
현재 Claude가 수정한 working tree와 기존 구현을 조사한다.

2단계:
Admin Master / CASE_06의 기존 구현을 기준으로
현재 프로젝트에서 이미 재사용 가능한 공통 로직을 식별한다.

3단계:
새로운 대형 refactor를 하지 않는다.

4단계:
CASE_03 → CASE_04 → CASE_05를
기존 Master architecture에 맞춰 Adapter 방식으로 구현한다.

5단계:
각 CASE마다 기존 Master의 질문/분기/STOP/persistence/result 구조를
재사용하고 domain-specific 값만 연결한다.

6단계:
그 다음 Real Estate / Fraud / Tax / Unclear 등에 동일한 방식으로 적용한다.

7단계:
각 단계에서 최소 검증:
- tsc
- 해당 CASE 핵심 engine check
- 실제 browser flow가 필요한 경우 실제 UI flow

이미 검증 완료된 Admin Master / CASE_06을 다시 처음부터 QA하지 않는다.

[7. 특히 중요한 금지사항]

"더 정확하게 만들기 위해 다시 전체 설계부터 검증하자"
라는 접근을 하지 않는다.

현재 필요한 것은 새로운 설계가 아니라
이미 검증된 설계를 반복 적용하는 것이다.

문제가 발견되면:
1. 공통 Master 문제인지
2. 특정 Adapter 문제인지
3. 질문 데이터 문제인지
4. QA harness 문제인지
먼저 분리한다.

공통 Master 문제라면 한 번 수정하고 모든 서비스에 재사용한다.
Adapter 문제라면 해당 서비스만 수정한다.

[8. 최종 목표]

목표는 CASE별 bespoke implementation이 아니다.
하나의 VFBCAI VERIFY Master Architecture를 만들고
각 VERIFY 서비스는 domain adapter만 갖는 구조다.

고객에게는:
단순하고 빠른 질문

내부에서는:
정교한 Situation Profile + adaptive investigation + evidence +
classification + personalized result
가 동시에 작동해야 한다.

현재까지 구현된 Admin Master와 CASE_06의 결과물을
새로운 출발점으로 취급하지 말고
이미 완성된 Master의 원형으로 취급하라.

가장 중요한 것은 "재개발하지 않는 것"이다.
