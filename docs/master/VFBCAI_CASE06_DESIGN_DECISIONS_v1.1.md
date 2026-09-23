# CASE_06 재설계 — [DESIGN QUESTION] 결정 사항 v1.1

**v1.1 변경사항 (STEP2-0 보충 조사 반영, 2026-09-23):**
- 참조 대상이 `VFBCAI_CASE06_MASTER_REDESIGN_v1.1.md`로 갱신됨 (체인③ 옵션 보완,
  `case06_dispositionType`→`case06_dispositionTypeCandidate` 개명)
- 아래 "DQ11 — 현재 재분류 라우팅 구조" 항목 신규 추가 (STEP2-0 브라우저 trace로 확인된
  중대 아키텍처 사실)
- DQ9 최종 확정 (기존 필드 유지 결정)

STEP1 조사 보고(2026-09-23)에서 제기된 10개 [DESIGN QUESTION]에 대한 결정입니다.
이 문서는 `VFBCAI_CASE06_MASTER_REDESIGN_v1.md`를 보충하며, STEP2 구현은
두 문서를 함께 기준으로 합니다.

---

## DQ1. Option value 슬러그 / DB persist 키

**결정:** Ace가 전체 슬러그를 미리 확정하지 않습니다. Cursor가 기존 코드베이스
네이밍 컨벤션(snake_case, 영문, 질문의 Profile 필드명을 접두어로 사용)에 맞춰
슬러그를 제안하고, **STEP2 구현 전 "필드·옵션 value 매핑 표"를 먼저 보고**합니다.
이 표를 Ace가 확인한 뒤에만 실제 persist 로직을 구현합니다.
(즉 STEP2를 "2-0 설계 매핑 보고" → "2-1 구현"으로 분리)

## DQ2. Direct Input 문구 통일

**결정:** 통일합니다. Phase1 Q1~Q5, Phase2 5개 체인의 모든 질문에서
Direct Input 라벨은 예외 없이 다음 전체 문구를 사용합니다:

> 위에 내용이 없거나 설명이 필요합니다 → 직접 입력

MASTER 문서에서 "직접 입력"으로 축약 표기된 곳도 전부 위 전체 문구로 구현합니다.

## DQ3. 재분류 원칙 1 "모순 검증" 규칙

**결정:** 필드 단위 모순 매트릭스를 만들지 않습니다. 대신 다음 단순 규칙을 적용합니다.

- 해당 후보(①~④)의 전용 Phase2 체인을 **구조화된 선택지(비-DI)로 STOP까지 완주**하면
  → 별도 모순 신호가 없는 한 candidate가 **확정**됩니다.
- 체인의 **첫 번째 질문**(예: ①체인 Q1 `case06_paymentNature`)에서 사용자가
  Direct Input을 선택하고, 그 입력 내용이 해당 후보 카테고리와 명백히 다른 사건
  유형을 가리키는 경우에만 **모순 신호**로 취급합니다. 이 경우 자동 재분류하지 않고
  ⑤ 체인(재확인)으로 유도하거나 Profile에 `case06_classificationStatus="needs_review"`로
  표시합니다 (자동 판정 로직은 만들지 않고, 신호만 기록).
- 그 외 세부 답변(예: ①체인 Q3 "전혀 다름")은 모순이 아니라 **정상적인 상황 편차**로
  처리하고, 후속 Result 문구에 반영합니다.

## DQ4. 재분류 원칙 3 "이관" 필드 매핑표

**결정:** 사전 전체 매핑표를 만들지 않습니다. Cursor는 5개 체인을 각각 구현하면서,
**해당 체인 범위 안에서만** target CASE의 어느 필드와 동일 축인지 판단하고,
"이 축은 스킵합니다"라는 제안을 체인별로 STEP2 사전 보고에 포함합니다.
Ace가 체인별로 승인한 뒤에만 스킵 로직을 구현합니다. 애매하면 스킵하지 않고
target CASE 쪽 질문을 그대로 유지합니다(중복이 확정적으로 증명된 경우만 스킵).

## DQ5 / DQ6. 재분류 후 UX 구조 + Phase2 완료 판정 기준

이 두 개는 사실상 하나의 결정입니다.

**결정:**
- Q1은 항상 `CASE_06`으로 고정 유지합니다 (기존 Canonical Funnel 구조를 깨지 않음).
- 재설계된 5개 체인은 **CASE_06 자체의 Phase2**입니다. target CASE(02~05)의
  네이티브 Phase2 질문 세트로 화면을 전환하지 않습니다. "재분류"는 UI 질문
  세트를 바꾸는 것이 아니라, **Result/분류/액션 문구에 쓰이는 classification 값**입니다.
- 따라서 `isAdminVerifyPhase2PathComplete`는 Q1=CASE_06일 때 **CASE_06 자체 체인의
  STOP 조건**으로 완료를 판정하도록 수정합니다. `getEffectiveAdminVerifyCase`가
  반환하는 target CASE의 필드 완료 여부로 게이트를 걸지 않습니다.
- **이것이 STEP1에서 지적된 기존 버그(Q1=CASE_06인데 완료 판정은 CASE_02 기준)의
  실제 수정 방향이기도 합니다.** 재설계 착수 전에 현재 프로덕션에서 이 불일치로
  실제 사용자가 퍼널이 막히는 사례가 있었는지 먼저 확인해 주십시오 (아래 "추가 지시" 참조).

## DQ7. 체인③ Q6 (`case06_submissionEvidence`) 노출 조건

**결정:** `case06_submissionResponse`(Q4)가 "아직 대응 안 함"이 **아닌** 경우에만
Q6을 노출합니다. 즉 사용자가 이미 무언가를 제출/설명한 적이 있을 때만
"현재 가지고 있는 자료" 질문을 추가로 묻습니다.

## DQ8. ⑤ 체인 재확인 1~5 신호 ↔ P1-Q1 매핑

**결정:** 예, 1:1 동일 축입니다. ⑤ 체인 Q1(`case06_unclearContentRecheck`)의
선택지 1~5는 P1-Q1의 후보 1~5(돈/출석/서류/처분/불명확)와 동일한 분류 축이며,
"두 번째 기회"로 더 풍부한 맥락에서 재확인하는 질문입니다. 1~5 중 하나가 선택되면
해당 candidate로 재분류 후보를 갱신하고 해당 체인(①~④)으로 진입합니다.
다시 DI(여전히 불명확)가 나오면 MASTER 문서의 STOP 규칙대로
`unresolved`/`expertHandoffRequired=true`로 종료합니다.

## DQ9. 기존 `profile*` 필드 호환 / 마이그레이션 — **최종 확정 (v1.1)**

**STEP2-0 보충 조사 결과:** 저장소에 읽기 전용(SELECT-only) 집계 도구가 없어
실제 Production 건수를 확인할 수 없음(LEVEL 4, 조회 불가).

**최종 결정:** 새 DB 접근 경로를 만들면서까지 건수를 확인하지 않습니다. 건수를
모르는 상태에서는 **보수적으로 "유의미한 사용이 있을 수 있다"고 가정**합니다.
따라서:
- 기존 필드(`profileDocumentSource`, `case06_documentNature`,
  `profileCurrentGoal`, `profileAuthorityGuidance`, `profilePerceivedIssue`,
  `case06_exactSource`~`case06_finalGoal` 등)는 **코드에서 삭제하지 않습니다.**
- 신규 구현(재설계 v1.1 필드)은 이 구필드를 참조하지 않고 완전히 별도 경로로
  동작합니다.
- 구필드는 `restore` 경로에서만 읽기 호환을 유지하고, 신규 UI/로직에는 노출하지
  않습니다 (사실상 deprecated 상태로 코드에 주석 표기).

## DQ11. 현재 재분류 라우팅 구조 (신규, STEP2-0 브라우저 trace로 확인)

**발견 사실 (LEVEL 3, `CASE_06_E` strict trace):** 현재 프로덕션은 Phase1 답변만으로
재분류가 확정되는 순간, **CASE_06 자체의 Phase2 질문을 전혀 거치지 않고 곧바로
target CASE(예: CASE_02)의 네이티브 Phase2 질문으로 전환**합니다.
(실제 trace: Phase2 첫 질문부터 `case02_paymentSubject`이며, 이후 12개 질문이
전부 `case02_*`; `case06_*` Phase2 질문은 0건 관측됨.)

이것이 애초에 CASE_06이 "질문 0~2개로 끝난다"고 지적됐던 **근본 원인**입니다 —
CASE_06 고유의 심화 체인이 사실상 실행되지 않고 있었습니다.

**결정:** DQ5/DQ6 결정(재설계 5개 체인은 CASE_06 자체 Phase2로 유지, target CASE
네이티브 질문으로 화면을 바로 전환하지 않음)을 그대로 유지합니다. 다만 이는
**단순 문구/옵션 교체가 아니라, 현재 "재분류 확정 즉시 target Phase2로 점프"하는
라우팅 로직 자체를 재작성해야 하는 변경**임을 명확히 인지하고 구현 범위에
반영합니다.

구체적으로 Cursor는 STEP2-1에서 다음을 반드시 포함해야 합니다:
1. `buildAdminVerifyProfileQuestions(..., 2)`가 Q1=CASE_06일 때, Profile이 이미
   CASE_02 등으로 재분류되었더라도 **CASE_06 재설계 체인이 아직 STOP에 도달하지
   않았다면** target CASE 네이티브 질문이 아니라 **CASE_06 체인의 다음 질문**을
   반환하도록 분기 로직 변경.
2. `getEffectiveAdminVerifyCase(..., 2)`를 이 분기에 사용할지, 아니면 별도의
   "CASE_06 체인 완료 여부" 판정 함수를 새로 둘지는 Cursor가 기존 코드 구조를
   보고 제안 (구현 전 사전 보고 필수).
3. 이 변경이 CASE_02 handoff(`seedCase02AnswersFromCase06Handoff`)와 어떻게
   상호작용하는지 — 특히 체인① STOP 이후 target CASE_02로 넘어갈 때 이 handoff를
   계속 쓸지, 재설계 원칙 3(이관)으로 대체할지 — STEP2-1 사전 보고에 포함.

## DQ10. 전문가 확인 종료 시 Result/CTA

**결정:** Cursor는 먼저 앱 내에 이미 존재하는 "전문가 상담 필요" 계열
Result 상태/CTA 컴포넌트가 있는지 조사합니다 (다른 CASE의 unresolved/ambiguous
종료 패턴 포함). 있으면 그 패턴을 재사용합니다. 없으면 **새 UI를 임의로
만들지 말고** 최소한의 제안(문구, 배치)만 STEP2 사전 보고에 포함해서
Ace 확인 후 구현합니다.

---

## STEP2 진행 순서 (필수)

1. **STEP2-0 (설계 보고, 코드 미변경):**
   - DQ1 옵션 value 매핑표 전체
   - DQ4 체인별 이관 후보 필드 제안
   - DQ9 기존 필드 실사용 건수 조사
   - DQ10 기존 전문가 확인 UI 패턴 존재 여부
   - 위 내용을 STEP1과 동일한 보고 형식으로 제출 → Ace 확인
2. **STEP2-1 (구현):** Ace 확인 후에만 착수. CASE_AUDIT_CHECKLIST A~H 전체 +
   지시서 §4 브라우저 E2E 7개 시나리오 + DQ5/DQ6에 따른
   `isAdminVerifyPhase2PathComplete` 수정 포함.
3. 구현 중 새로운 [DESIGN QUESTION]이 발견되면 임의 판단하지 말고 즉시 중단·보고.

## 추가 지시 (긴급, STEP2-0과 별도로 지금 바로 확인)

STEP1에서 발견된 다음 항목은 재설계와 무관하게 **현재 프로덕션에 이미 존재할 수 있는
버그**입니다. 별도로 조사·보고해 주십시오 (코드 수정은 하지 않음):

> `isAdminVerifyPhase2PathComplete` → `getEffectiveAdminVerifyCase(..., 2)`가
> `CASE_02`이면 `case02PathFieldsComplete`를 요구하는데, 실제 UI는 CASE_06
> 질문만 노출하는 경우 — 현재 CASE_06 경유 사용자 중 이 불일치로 Phase2를
> 완료 처리받지 못하는(퍼널이 막히는) 실제 사례가 있었는지, 로그/QA 스크립트
> 기준으로 조사해 주십시오. LEVEL 1/2/3 중 가능한 수준까지 확인 바랍니다.
