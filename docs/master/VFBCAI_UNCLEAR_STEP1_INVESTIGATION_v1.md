# Unclear VERIFY — STEP1 조사 (코드 미변경)

| 항목 | 내용 |
|------|------|
| **범위** | MASTER 문서의 불명확 정의, `src`의 `/verify/unclear` 구현, Admin Master / CASE_06 대비 Adapter 최소 설계 |
| **하지 않음** | 코드 수정, STEP2-0 매핑, STEP2-1, RE STEP2-1, cross-service session handoff |
| **DQ 상태** | **DQ-U2 Ace 최종 결정** (2026-09-25). DQ-U1, U3~U7은 조사 권장안 유지 |
| **완전성** | §6. LOCK `fa4cce9` 적용. 현재 퍼널은 1차>2차 **무조건 FAIL**, 실질 축 비율 하한 미달 **FAIL** |
| **대기** | RE STEP2-1은 1번창(CASE_03/04 + CASE_01 bridge) 이후. 그 신호가 오면 이 문서는 유지하고 `VFBCAI_REALESTATE_STEP2-0_DESIGN_MAPPING_v1.md` 구현으로 전환 |
| **검증** | LEVEL 1 문서·코드 대조. 브라우저 QA 없음 |

---

## 0. 결론 — Unclear 서비스와 CASE_06은 다르다

**CASE_06은 Unclear VERIFY가 아니다.**

| | CASE_06 | `/verify/unclear` |
|--|---------|-------------------|
| 소속 | `VERIFY → 행정문서` (`/verify/admin`) 안의 한 CASE | 별도 VERIFY 서비스. `service_type`: `verify_unclear` |
| MASTER 이름 | 「불명확한 **행정문서**」 | 고객 라벨 「불확실한 문서」 (`ko.ts`) |
| 역할 | 행정문서 **안에서** CASE_01~05로 재분류하는 bridge/fallback. 끝까지 불명확할 때만 CASE_06 Phase2 | **분류·진입 보조 서비스** (DQ-U2). 상황 기록은 Unclear에 남기고, 전문 영역이 분명해지면 안내와 링크만 제공 |
| 재분류 대상 | money→02, 출석→03, 보완→04, 처분→05, 위반→01 (`행정문서 MASTER` §6) | 전문 VERIFY로 **자동 세션 전환 없음**. 결과·한 줄 안내·CTA/link. 답변 시드·질문 skip 금지 |
| 질문 SoT | `VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` § CASE_06 + `VFBCAI_CASE06_DESIGN_DECISIONS_v1.1.md` | 서비스 질문 MASTER **없음**. 페이지는 레거시 `reviewStage` / `incidentType` |

인계 원칙의 Unclear Adapter는 **CASE_06을 복사하는 작업이 아니다.** CASE_06은 이미 있는 Admin 원형이고, 재설계·CASE_07 생성이 금지된다. Unclear 서비스는 그 공통 구조(Profile, Phase1/2, DI, STOP, bridge 커밋, persistence) 위에 **도메인 질문만** 얹는 다음 서비스다.

Skill §50 순서: 행정문서 MASTER 다음이 부동산 → 사기 → 세금 → **불명확**. Fraud STEP2-0은 사기 쪽 불명확·DI를 Admin CASE_06이나 `/verify/unclear`로 보내지 않는다고 이미 고정했다 (`VFBCAI_FRAUD_STEP2-0_DESIGN_MAPPING_v1.md` F6).

---

## 1. MASTER에서 확인한 정의

### 1.1 행정문서 CASE_06 (Admin 내부)

`docs/master/VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md`

- § CASE_06 제목: 불명확한 행정문서.
- 1차 5문항(문서 내용, 확인 목적, 인지 경로, 안내된 행동, 조건부 기한) + DI.
- 2차 체인: `exactSource → keyPhrase → requiredAction → receiptPath → actualCore → blockage → evidence → finalGoal`.
- **역할 문장:** 깊은 조사의 독립 사건 유형이 아니라 **재분류용 bridge/fallback**. 여전히 불명확할 때만 Phase2.
- §6: 비용→02, 출석/소명→03, 보완→04, 처분/제한→05, 위반/문제→01. 끝까지 불명확하면 CASE_06 Phase2만.
- §8: CASE_01~06 질문 방향은 다시 설계하지 않는다. CASE_07 금지(문서 앞부분).

`VFBCAI_CASE06_DESIGN_DECISIONS_v1.1.md`: Q1은 CASE_06 고정. 재분류 체인은 CASE_06 Phase2이며, target CASE 값을 시드해 질문을 건너뛰지 않는다.

### 1.2 서비스로서의 「불명확」

`VFBCAI_MASTER_DEVELOPMENT_SKILL_v1.2.md`

- §18: 직접 설명을 상황 데이터로 보존하고, 분류가 불가능하면 **불명확/fallback**. CASE_07로 해결하지 않는다.
- §38: 불명확은 fallback/reclassification 경로. 임의 CASE_07 금지. 확정 CASE는 그 서비스 MASTER를 따른다.
- §50: 적용 순서의 마지막이 `VERIFY → 불명확`. 부동산과 같이 레거시 질문을 CASE로 승격하지 않는 원칙(§43)이 다음 서비스의 기본이다. Unclear 전용 질문 표는 이 Skill에 없다.

`VFBCAI_MASTER_HANDOFF_PRINCIPLES_v1.md` §4 그림의 `Unclear Adapter`는 Admin Master 아래의 서비스 Adapter다. CASE_06 재작성이 아니다.

`VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` §1~§8은 Admin CASE 작업용으로 쓰여 있다. Unclear에 얹을 때 그대로 적용할 항목은 DI(`other`+note), 질문 중 rail CTA 숨김, STOP 함수 하나, harness/product 구분, 레거시 orphan 처리, 옵션 4~5+DI이다. §3~§4의 `getEffectiveAdminVerifyCase` / `isCase06BridgedToNativeCase`는 **Admin 행정문서 내부** 게이트이므로 Unclear 서비스가 호출·복사하지 않는다. RE STEP2-0 DQ-RE-07과 같은 방식(서비스 자체 커밋 플래그)이 최소안이다.

---

## 2. 현재 `src` 구현

| 위치 | 사실 |
|------|------|
| `src/app/verify/unclear/page.tsx` | `CATEGORY = "unclear"`. 랜딩 `MASTER_LANDING_UNCLEAR`. 질문 단계는 `reviewStage` → `incidentType` → `reviewFocus` → 설명. `getDiagnosis("unclear", …)`. `service_type: verify_unclear`. Master Situation Profile / `adminVerifyProfiling` 없음 |
| `MasterFunnelLanding.tsx` | `MASTER_LANDING_UNCLEAR`의 `makeVerifyLanding` 세 번째 인자와 `VERIFY_MASTER_LANDINGS` 키는 **`notary`**. 고객 제목은 「불확실한 문서」 |
| `verifyDiagnosis.ts` `unclear` | 체크리스트: 발신 기관, 요구 조치, 기한, 불이익. `incidentTypes`: 정부기관서류, 법원서류, 경찰서류, 회사서류, 개인간서류, 출처불명, 기타. 권고 문장에 「행정/세무/부동산 재라우팅」이 있으나 라우팅 함수는 없음 |
| 페이지 상수 | `UNCLEAR_AGENCY_OPTIONS`: 관공서 확인창구, 법원 민원실, 경찰 민원센터, 세무기관, 기타 행정기관. 결과 참고 안내. 공식 URL은 `dichvucong.gov.vn` |
| 진입 | 홈·헤더·`aiGateway`·`costCheck`·`quoteReviewLinks`가 `/verify/unclear`로 연결. i18n: ko 「불확실한 문서 / 어떤 서류인지 모를 때」 |

이 페이지는 Admin CASE_06 질문(`exactSource`, `actualCore` 등)을 쓰지 않는다. 부동산 페이지와 같은 **레거시 incident 퍼널 + 마스터 랜딩**이다.

---

## 3. Adapter로 얹을 최소 설계 (구현하지 않음)

재사용할 것 (Admin에서 이미 검증된 구조, 함수 복사 아님):

- 리포트 셸, Stitch 선택, 질문 중 rail은 GUIDE / OFFICIAL SOURCES만
- Phase1 / Phase2, Situation Profile, `other`+note DI, 명시적 STOP 하나
- persistence / restore, 가입·자료 게이트, 1차·2차 결과 연결
- 브릿지는 **커밋 플래그 이후**에만 다음 질문을 연다. 힌트로 다음 값·질문을 시드하지 않는다

Unclear에만 새로 필요할 것 (STEP2-0 전, 이 조사는 목록만):

- 「이 서류가 무엇인지」를 가르는 도메인 질문. 축 후보는 현재 진단 체크리스트와 맞닿는다: 발신 주체, 요구 행동(납부/제출/출석/없음), 기한, 고객이 들은 내용. Skill §43식 레거시 `incidentTypes` 7종을 그대로 CASE로 올리지 않는다
- 서비스 경계는 DQ-U1. 전문 영역이 분명해진 뒤의 고객 안내는 **DQ-U2 최종 결정** (§4)
- 서비스 id `verify_unclear` 유지. Admin meta·CASE_06 스냅샷에 답을 쓰지 않음

DQ-U2가 허용하는 STEP2 범위는 **분류 → 안내 문구 → CTA/link**까지다. cross-service session handoff와 data migration은 하지 않는다.

하지 않을 것:

- CASE_06 재설계, CASE_07, `isCase06BridgedToNativeCase` 호출, CASE_06 값으로 Unclear 필드 채우기
- Unclear 분류 결과를 전문 서비스의 답변값으로 시드하거나, 그 서비스의 Master 질문을 건너뛰게 하는 것
- `/verify/unclear` 레거시 질문 UI를 새 질문의 SoT로 승격
- Fraud/Tax/RE의 내부 `unclear` slug를 이 서비스로 합치기 (Fraud F6과 동일 방향)

---

## 4. [DESIGN QUESTION]

DQ-U2만 Ace 최종 결정이다. DQ-U1, U3~U7은 조사 권장안이며 STEP2-0 전에 승인받는다.

| ID | 주제 | 현황 | 권장 | 근거 |
|----|------|------|------|------|
| **DQ-U1** | Unclear와 CASE_06의 관계 | 이름이 둘 다 불명확. 소속은 다름 | **별도 카테고리로 고정.** CASE_06 = 행정문서 내부 bridge. `/verify/unclear` = 서류 종류를 모를 때의 VERIFY 서비스. 둘을 합치거나 CASE_06 질문을 Unclear에 복사하지 않음 | MASTER § CASE_06 역할 문장. 인계 원칙의 Adapter 그림. Fraud F6 |
| **DQ-U2** | 전문 영역이 분명해지면 | 진단 문구만 재라우팅을 말하고, 세션 이전 코드는 없음 | **최종 결정 (2026-09-25).** `/verify/unclear`는 분류·진입 보조. ② 명확해지면 전문 서비스로 **안내**한다. 자동 세션 전환이 아니다. 아래 §4.1 | 인계 원칙 F. 전문 서비스 Master 질문은 그 서비스 SoT |
| **DQ-U3** | 레거시 질문을 SoT로 쓸지 | `incidentTypes` 7개(기타 포함), `reviewStage` 사전/사후, 기관 안내 5개 | **승격하지 않음.** 읽기 호환만. 신규 질문은 STEP2-0 매핑표. `기타`는 DI `other`+note | Skill §18·§43 유추, 체크리스트 §7·§8 |
| **DQ-U4** | 질문 MASTER 부재 | 행정문서와 달리 Unclear 질문·옵션 확정본이 없음 | 기준은 Skill의 fallback 정의 + 이 STEP1 DQ 승인. 진단 체크리스트 4축(발신, 요구, 기한, 불이익)을 Phase1 골격 후보로만 두고, 문구·slug는 STEP2-0에서 확정 | MASTER §8은 CASE_01~06에 대한 선언이지 Unclear 서비스 질문 표가 아님 |
| **DQ-U5** | 랜딩 `notary` | `MASTER_LANDING_UNCLEAR`가 서비스 id `notary`. 본문에 번역·공증 카드가 있음. 고객 제목은 불확실한 문서 | 공증 서비스로 읽히지 않게, STEP2에서 랜딩 키·카피의 문서 정체 축을 맞출지 **별도 UI DQ**. 질문 Adapter와 한 커밋에 섞지 않음 | CASE_03/04형 라벨-의미 불일치. 랜딩 id `notary`는 코드 사실 |
| **DQ-U6** | 구현 순서 | Skill은 불명확을 세금 다음으로 둠. 이 조사는 RE STEP2-1 대기 중 병행 | **조사 문서만 선행.** Unclear STEP2-0/2-1은 RE STEP2-1, 그리고 이미 있는 Fraud 매핑·Tax 순서 뒤로 둔다. 이 창에서 구현 시작 신호가 아니면 착수하지 않음 | Skill §50. 사용자 지시(RE는 1번창 이후) |
| **DQ-U7** | CRM `verify_unclear` | 리드·문서 링크·PDF 라벨이 `verify_unclear` / 「불확실한 서류 검토」 | 서비스 타입 유지. Admin CASE_06 meta로 바꾸지 않음. DB 스키마 변경 없음 | 인계 원칙: DB/API/CRM 구조 변경 금지 |

### 4.1 DQ-U2 최종 결정 — 안내만, 세션 이전 없음

`/verify/unclear`는 **분류·진입 보조 서비스**다. 특정 전문 영역이 분명해지면 다음만 한다.

1. Unclear 프로파일에 현재 상황을 기록한다. 결과 화면은 Unclear 자체 결과로 유지한다.
2. 해당 전문 VERIFY가 필요한 이유를 한 줄로 안내한다.
3. 그 서비스로 가는 CTA/link를 제공한다. 예: 「사기 관련 검토가 필요한 상황일 수 있습니다」 → 「사기 VERIFY에서 확인하기」 → `/verify/fraud`.
4. Unclear의 분류 결과를 전문 서비스의 실제 답변값으로 두지 않는다. 강제 seed 금지. 질문 skip 금지.
5. 전문 서비스에 들어간 뒤에는 그 서비스의 Master 질문을 처음부터 진행한다.

현재 단계에서는 cross-service session handoff와 data migration을 구현하지 않는다. 이후 STEP2-0 / STEP2-1 범위는 **분류 → 안내 문구 → CTA/link**까지다.

---

## 5. 체크리스트 §1~§8 (현재 코드, 설계 전)

| § | 현재 `/verify/unclear` | Adapter 시 최소 |
|---|------------------------|-----------------|
| 1 DI | 레거시 퍼널. Admin `other`+note 패턴 없음 | 신규 선택 문항에만 적용 |
| 2 CTA | 마스터 질문 rail 정책 미적용 (incident 단계) | 질문 화면에서 landing CTA 숨김. 결과 CTA 유지 |
| 3 재분류 | 서비스 재라우팅 문구만 | DQ-U2: Unclear 결과는 Unclear에 유지. 전문 서비스는 안내+링크. CASE_06 effective case 스택을 호출하지 않음. 시드·skip 금지 |
| 4 Bridge | 없음 | 필요 시 Unclear 자체 커밋 플래그. CASE_06 함수 복사 금지 |
| 5 STOP | `incidentType`+설명 채움 수준 | 판단에 필요한 필드만. pathComplete 이중 함수 금지 |
| 6 Harness | 이 조사에서 실패 재현 없음 | 구현 후 product vs harness 분리 |
| 7 Legacy | `incidentType` 7종, 기관 안내, `notary` 키 | DQ-U3·U5. orphan을 질문 없이 두지 않음 |
| 8 옵션 | 기관 5개, incident 7개(기타 포함) | 4~5+DI. 초과·「기타」는 STEP2-0에서만 정리 |

---

## 6. 정보 완전성 감사 (LOCK 기준 적용)

기준 원문: `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` (커밋 `fa4cce9`, LOCK). 이 절은 그 문서를 수정하거나 완화하지 않는다. 증거는 LEVEL 1. `src/app/verify/unclear/page.tsx`, `src/lib/verifyDiagnosis.ts` `buildDiagnosis`. 코드는 바꾸지 않았다.

현재 `/verify/unclear`에는 Phase2 질문 체인이 없다. 질문 단계는 `reviewStage` → `incidentType`(사전 `PREVENT_DOCUMENT_OPTIONS` 7 / 사후 `CASE_ISSUE_OPTIONS` 7) → `reviewFocus`(사전 6 / 사후 6) → 자유 설명이다. 그 다음이 진단이다.

`buildDiagnosis`는 카테고리 템플릿과 파일 유무로 체크리스트·위험·권고를 만든다. `incidentType`은 요약에 선택 문구를 붙이는 데 쓰인다. `reviewFocus`는 진단 함수에 전달되지 않고 CRM `review_focus`에만 저장된다 (`page.tsx` 주석과 호출 인자).

### 6.1 1차 vs 2차

| 관계 | 판정 |
|------|------|
| 1차 질문만 있고 2차 질문 깊이가 없음 | **1차 > 2차 → 무조건 FAIL** |
| 실질 축 비율 | Phase2 실질 축 0. 하한 **3:7~4:6** 아래 → **FAIL** |

비율은 화면 질문 수가 아니라, 기준 ②~④를 통과한 실질 축만 센다. 아래 6.2에서 2차를 통과한 축은 없다.

### 6.2 기준 ①~⑤

| 기준 | 판정 | 코드에서 확인한 사실 |
|------|------|----------------------|
| ① 정보 완결성 | **FAIL** | 발신·요구·기한·상대 대응이 선택값으로 구조화되지 않는다. 진단 요약은 사건유형 문구와 자유 설명을 다시 보여 준다. 질문을 끝내도 「그래서 무슨 일이 있었나요?」에 해당하는 설명란이 남아 있다 |
| ② 다중 신호성 | **FAIL** | `reviewFocus`는 다음 질문·증거·진단 문장을 바꾸지 않는다. `incidentType`은 요약 한 줄만 바꾼다 |
| ③ 선택지 판별력 | **FAIL** | 사전/사후 서류 7종은 서로 다른 제목이어도 같은 `buildDiagnosis` 템플릿이다. 다음 `needs*`가 없다 |
| ④ 비장식성 | **FAIL** | ③에서 갈라지지 않는 선택지다. 사후 6단계(`CASE_STAGE_OPTIONS`)도 진단 분기가 없다 |
| ⑤ 직접입력 의존 | **FAIL** | 진단 호출 조건에 사건 설명 문자열이 있다. 정상 경로의 핵심 사실이 자유 텍스트에 있다. `other`+note 정식 경로는 없다 |

### 6.3 권장 (구현하지 않음)

Unclear STEP2-0을 쓸 때 이 FAIL을 전제로 둔다. 2차 실질 축은 1차 실질 축보다 깊어야 하고, 실질 축 비는 3:7~4:6 하한 이상이어야 한다. 하한은 상한이 아니다. 장식 질문은 비율에서 뺀다. DQ-U2의 안내 문구·CTA는 2차 질문을 대체하지 않는다. 전문 서비스로 넘긴 뒤의 1차·2차 밀도는 그 서비스 감사에서 판정한다.

RE STEP2-1과 이 감사의 구현은 시작하지 않는다.

---

*2026-09-24 조사. 2026-09-25 DQ-U2 최종 결정 반영. 2026-09-25 정보 완전성 LOCK(`fa4cce9`) §6 적용. 코드 없음. RE STEP2-1 신호 시 이 문서는 유지하고 `VFBCAI_REALESTATE_STEP2-0_DESIGN_MAPPING_v1.md` 구현으로 전환.*
