# VFBCAI MASTER DEVELOPMENT SKILL — v1.6 추가분

v1.5 추가분을 대체한다. `.cursor/skills/vfbcai-master-development/SKILL.md` v1.4 본문 끝에 이어 붙인 Governance 확장의 원문 사본이다.

**v1.6 변경 (2026-09-26, 충돌 시 최신 결정 우선):**

- **[VALIDATION SEPARATION]**: 자동화 스크립트(Playwright 등) 결과는 "브라우저 확인함"(수동)으로 인정하지 않음 — 2026-09-25 P01 결정 반영
- **[QA LANGUAGE]**: Cursor 창 보고 어휘 규칙과, 검토자의 "통합 PASS" 최종 판정을 구분
- 신규: **[QUESTION DESIGN]**, **[INDEPENDENT VERIFICATION]**, **[FAILURE PATTERN REGISTRY]**

## [INVESTIGATION BEFORE IMPLEMENTATION — 상시 적용]

CASE 조사 단계에서는 구현하지 않는다.

먼저:

- 현재 코드 구조 확인
- MASTER 기준과 비교
- 질문/선택지 차이 확인
- Direct Input 연결 확인
- raw/effective 경로 확인
- dead/legacy code 확인
- Result 연결 확인
- 공용 경로 영향 확인

이후 [DESIGN QUESTION]을 확정하고, 사용자 결정 후에만 구현한다.

조사 중 발견한 문제를 Cursor가 임의로 설계 변경하거나 추가 구현하지 않는다.

단, 이미 LOCK된 원칙(질문·선택 고도화, 비율 규칙 등)은 사용자에게 다시 묻지 않고 적용한다. [DESIGN QUESTION]은 새로운 사업 판단에만 사용한다.

## [QA LANGUAGE — 상시 적용]

Cursor 창의 보고에서는 PASS / FAIL / 완료 / 정상 / 문제없음 / 양호를 사용하지 않는다.

허용 어휘:

- 코드 확인함
- 실행함 (자동화 스크립트 실행 포함)
- 브라우저 확인함 (사람이 화면에서 직접 클릭·확인한 경우만)
- 미확인

코드·로그·화면에 실제로 존재하는 문자열은 원문 그대로 인용할 수 있다.

"통합 PASS"는 Cursor 창이 쓰지 않는다. 검토자(Claude)가 [INDEPENDENT VERIFICATION]의 A~E 근거가 모두 같은 검사 커밋에서 갖춰졌을 때만 쓰는 최종 판정이다. 문서·코드·QA 단계 결과를 통합 PASS로 부르지 않는다.

## [VALIDATION SEPARATION — 상시 적용]

- 함수를 직접 호출한 결과는 "코드 확인함" 또는 "실행함"이다.
- Playwright 등 자동화 스크립트로 브라우저 DOM을 읽은 결과도 "실행함"(참고 자료)이다. "브라우저 확인함"으로 표기하지 않는다.
- "브라우저 확인함"은 사람이 화면에서 직접 클릭하며 확인한 경우만이다.
- 구현한 창이 만든 스크립트를 다른 창이 실행만 한 것은 독립 검증이 아니다.
- 수동 검사는 커밋 기준 별도 worktree 서버에서만 하고, 보고에 검사 커밋 해시를 적는다(P10).

## [DIRECT INPUT — 상시 적용]

모든 Direct Input(기타+메모) 답변은

`raw → normalization/effective value → Situation Profile → CASE 분류 → branching → Result`

전체 경로 연결을 조사 없이 "UI 존재"만으로 연결됐다고 보지 않는다.

입력 원문은 결과의 "응답 요약"에 최소 1회 원문 그대로 남아야 한다.

## [RAW/EFFECTIVE VALUE — 상시 적용]

조건문/게이트가 raw value와 effective value 중 무엇을 사용해야 하는지 해당 CASE의 설계 의도와 비교해서 확인한다.

모든 조건문이 반드시 effective value를 써야 한다는 뜻은 아니다.

옛 slug → 새 slug 변환은 한 곳에서만 하고, 고객이 말하지 않은 사실을 만들어 넣지 않는다(정확히 같은 뜻이 없으면 원문 표시).

## [RESULT CONNECTION — 상시 적용]

답변이 Profile에 저장되는 것만으로 연결됐다고 보지 않는다.

1차 결과와 2차 개인화 결과 각각에서 실제 표시 여부를 별도로 확인한다.

카드 제목은 본문 내용과 맞아야 하고, 같은 문장을 여러 섹션에 반복하지 않으며, 판단 문장은 고객이 고른 답과 같은 방향이어야 한다.

## [REGRESSION — 상시 적용]

공용 함수/공용 UI를 수정하면 다른 CASE에 대한 영향 범위를 반드시 조사·보고한다.

## [QUESTION DESIGN — 상시 적용, LOCK]

- 질문의 목적은 사건 재구성이다. 질문이 끝나면 전문가가 다시 묻지 않아도 될 만큼 사건 구조가 파악되어야 한다.
- 적은 질문 수 × 높은 정보 밀도. 선택지 하나에 여러 사실(행동·기관 반응·접수 여부·현재 상태·남은 자료·미확인 사항 등)을 담는 것이 목표다.
- 여러 사실을 담을 때는 현실적으로 가능한 사실 조합을 선택지가 빈틈없이 덮어야 한다(D03). 빈틈은 질문 추가가 아니라 같은 질문 안의 선택지 구성으로 해결한다.
- 목록형 예외: "어떤 종류가 있는가"만 묻는 질문은 짧은 이름 + 여러 개 선택. 밀도는 질문 문장에서 확보한다.
- 비율: 2차 실질 질문 수 > 1차 실질 질문 수 (4:6 공식 폐기, 2026-09-25). 비율을 맞추기 위한 질문 추가 금지. 질문 수는 사건 복잡도가 정한다.
- 같은 사실을 다른 질문에서 추가 가치 없이 다시 묻지 않는다. 1차·2차 목표 질문 중복 금지.
- 선택지는 고객 1인칭 사실 문장. 3인칭 결과 문장("…라고 응답했습니다")은 선택지가 될 수 없다.

## [INDEPENDENT VERIFICATION — 상시 적용]

통합 판정은 아래 다섯 가지가 모두 같은 검사 커밋 기준으로 있을 때만 가능하다.

- **A 구조**: 질문 → slug → Profile → branch → result 연결 (자동 테스트)
- **B 선택 공간**: 사실 조합 커버리지 자동 검사 + 독립 의미 검증자 판정
- **C 데이터**: 입력값이 결과까지 보존됨 (화면 원문)
- **D 화면**: 커밋 기준 서버의 화면 원문 수집 (수집자는 판정하지 않음)
- **E 의미**: 선택한 답과 판단 문장 방향 일치 (자동 검사 + 독립 의미 검증자)

독립 의미 검증자는 다른 창의 보고·Brief·PASS 판정을 보지 않고, 규칙 문서와 화면 원문만 본다.

## [FAILURE PATTERN REGISTRY — 상시 적용]

모든 Brief·구현·검증은 `docs/master/VFBCAI_FAILURE_PATTERN_REGISTRY.md`(F·D·P 항목)를 체크리스트로 사용한다. 새 실패 유형이 나오면 그 자리에서 번호를 추가한다.

## [CASE AUDIT CHECKLIST 참조]

CASE 조사·구현·감사는 `docs/master/VFBCAI_CASE_AUDIT_CHECKLIST_v1.md`를 기준으로 한다.

개별 지시문에 체크리스트 항목이 없어도 이 문서를 항상 적용한다.
