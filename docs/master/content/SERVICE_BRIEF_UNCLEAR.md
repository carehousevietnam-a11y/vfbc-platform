# 불명확·기타 문서 검토 — 서비스 범위 발췌

원문 파일: docs/master/VFBCAI_UNCLEAR_STEP1_INVESTIGATION_v1.md

## 0. 결론 — Unclear 서비스와 CASE_06은 다르다
절: §0. 결론 — Unclear 서비스와 CASE_06은 다르다

**CASE_06은 Unclear VERIFY가 아니다.**
| | CASE_06 | `/verify/unclear` |
|--|---------|-------------------|
| 소속 | `VERIFY → 행정문서` (`/verify/admin`) 안의 한 CASE | 별도 VERIFY 서비스. `service_type`: `verify_unclear` |
| MASTER 이름 | 「불명확한 **행정문서**」 | 고객 라벨 「불확실한 문서」 (`ko.ts`) |
| 역할 | 행정문서 **안에서** CASE_01~05로 재분류하는 bridge/fallback. 끝까지 불명확할 때만 CASE_06 Phase2 | **분류·진입 보조 서비스** (DQ-U2). 상황 기록은 Unclear에 남기고, 전문 영역이 분명해지면 안내와 링크만 제공 |
| 재분류 대상 | money→02, 출석→03, 보완→04, 처분→05, 위반→01 (`행정문서 MASTER` §6) | 전문 VERIFY로 **자동 세션 전환 없음**. 결과·한 줄 안내·CTA/link. 답변 시드·질문 skip 금지 |
| 질문 SoT | `VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` § CASE_06 + `VFBCAI_CASE06_DESIGN_DECISIONS_v1.1.md` | 서비스 질문 MASTER **없음**. 페이지는 레거시 `reviewStage` / `incidentType` |

인계 원칙의 Unclear Adapter는 **CASE_06을 복사하는 작업이 아니다.** CASE_06은 이미 있는 Admin 원형이고, 재설계·CASE_07 생성이 금지된다. Unclear 서비스는 그 공통 구조(Profile, Phase1/2, DI, STOP, bridge 커밋, persistence) 위에 **도메인 질문만** 얹는 다음 서비스다.

## 1. MASTER에서 확인한 정의
절: §1.1 행정문서 CASE_06 (Admin 내부) · §1.2 서비스로서의 「불명확」

- **역할 문장:** 깊은 조사의 독립 사건 유형이 아니라 **재분류용 bridge/fallback**. 여전히 불명확할 때만 Phase2.
- §18: 직접 설명을 상황 데이터로 보존하고, 분류가 불가능하면 **불명확/fallback**. CASE_07로 해결하지 않는다.
- §38: 불명확은 fallback/reclassification 경로. 임의 CASE_07 금지. 확정 CASE는 그 서비스 MASTER를 따른다.
- §50: 적용 순서의 마지막이 `VERIFY → 불명확`. 부동산과 같이 레거시 질문을 CASE로 승격하지 않는 원칙(§43)이 다음 서비스의 기본이다. Unclear 전용 질문 표는 이 Skill에 없다.

`VFBCAI_MASTER_HANDOFF_PRINCIPLES_v1.md` §4 그림의 `Unclear Adapter`는 Admin Master 아래의 서비스 Adapter다. CASE_06 재작성이 아니다.

## 3. Adapter로 얹을 최소 설계 (구현하지 않음)
절: §3. Adapter로 얹을 최소 설계 (구현하지 않음)

- 「이 서류가 무엇인지」를 가르는 도메인 질문. 축 후보는 현재 진단 체크리스트와 맞닿는다: 발신 주체, 요구 행동(납부/제출/출석/없음), 기한, 고객이 들은 내용. Skill §43식 레거시 `incidentTypes` 7종을 그대로 CASE로 올리지 않는다
- 서비스 경계는 DQ-U1. 전문 영역이 분명해진 뒤의 고객 안내는 **DQ-U2 최종 결정** (§4)

DQ-U2가 허용하는 STEP2 범위는 **분류 → 안내 문구 → CTA/link**까지다. cross-service session handoff와 data migration은 하지 않는다.

하지 않을 것:

- CASE_06 재설계, CASE_07, `isCase06BridgedToNativeCase` 호출, CASE_06 값으로 Unclear 필드 채우기
- Unclear 분류 결과를 전문 서비스의 답변값으로 시드하거나, 그 서비스의 Master 질문을 건너뛰게 하는 것
- `/verify/unclear` 레거시 질문 UI를 새 질문의 SoT로 승격
- Fraud/Tax/RE의 내부 `unclear` slug를 이 서비스로 합치기 (Fraud F6과 동일 방향)

## 4. [DESIGN QUESTION]
절: §4. [DESIGN QUESTION] · §4.1 DQ-U2 최종 결정 — 안내만, 세션 이전 없음

| ID | 주제 | 현황 | 권장 | 근거 |
|----|------|------|------|------|
| **DQ-U1** | Unclear와 CASE_06의 관계 | 이름이 둘 다 불명확. 소속은 다름 | **별도 카테고리로 고정.** CASE_06 = 행정문서 내부 bridge. `/verify/unclear` = 서류 종류를 모를 때의 VERIFY 서비스. 둘을 합치거나 CASE_06 질문을 Unclear에 복사하지 않음 | MASTER § CASE_06 역할 문장. 인계 원칙의 Adapter 그림. Fraud F6 |
| **DQ-U2** | 전문 영역이 분명해지면 | 진단 문구만 재라우팅을 말하고, 세션 이전 코드는 없음 | **최종 결정 (2026-09-25).** `/verify/unclear`는 분류·진입 보조. ② 명확해지면 전문 서비스로 **안내**한다. 자동 세션 전환이 아니다. 아래 §4.1 | 인계 원칙 F. 전문 서비스 Master 질문은 그 서비스 SoT |

`/verify/unclear`는 **분류·진입 보조 서비스**다. 특정 전문 영역이 분명해지면 다음만 한다.

1. Unclear 프로파일에 현재 상황을 기록한다. 결과 화면은 Unclear 자체 결과로 유지한다.
2. 해당 전문 VERIFY가 필요한 이유를 한 줄로 안내한다.
3. 그 서비스로 가는 CTA/link를 제공한다. 예: 「사기 관련 검토가 필요한 상황일 수 있습니다」 → 「사기 VERIFY에서 확인하기」 → `/verify/fraud`.
4. Unclear의 분류 결과를 전문 서비스의 실제 답변값으로 두지 않는다. 강제 seed 금지. 질문 skip 금지.
5. 전문 서비스에 들어간 뒤에는 그 서비스의 Master 질문을 처음부터 진행한다.

현재 단계에서는 cross-service session handoff와 data migration을 구현하지 않는다. 이후 STEP2-0 / STEP2-1 범위는 **분류 → 안내 문구 → CTA/link**까지다.
