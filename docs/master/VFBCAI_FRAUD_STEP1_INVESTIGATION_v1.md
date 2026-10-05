# Fraud VERIFY — STEP1 조사 (코드 미변경)

| 항목 | 내용 |
|------|------|
| **단계** | STEP1 조사만. STEP2-0 매핑·구현 없음 |
| **코드** | 수정하지 않음 |
| **SoT 공백** | `docs/master/`에 사기·편취 질문 MASTER는 없음 |
| **행정문서 MASTER** | `VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md` — CASE_01~06만. **CASE_07 금지** |
| **순서** | Skill §50: 부동산 다음 사기 → 세금 → 불명확. 행정문서 질문을 복사하지 않음 |
| **Adapter** | `VFBCAI_MASTER_HANDOFF_PRINCIPLES_v1.md` §4–§5. 공통 엔진 재사용, domain 질문·값·규칙만 신규 |
| **인접 선례** | Real Estate는 `realEstateVerifyProfiling.ts` + STEP2-0. CASE_06 함수 복사 금지, DI 헬퍼만 호출 |

조사일: 2026-09-24.

---

## 1. MASTER에 있는 사기 의도

행정문서 질문 MASTER는 사기 CASE를 정의하지 않는다. 재분류 목적지은 CASE_01~05(위반·납부·출석·보완·처분)와, 불명확 유지인 CASE_06뿐이다.

사기가 문서에 나오는 위치는 다음뿐이다.

- Skill §2: 사기는 VERIFY 안의 별도 전문 영역. 행정과 역할을 섞지 않음.
- Skill §48·§50: 검증된 행정문서 **방법**을 재사용한다. 질문 문장을 복사하지 않는다. 새 상황을 행정 CASE 질문에 억지로 넣지 않는다. 적용 순서는 부동산 다음 사기.
- Handoff §4–§5: Admin Master + CASE_06이 원형이다. Fraud는 Adapter다. 새로 만드는 것은 domain 질문·값·규칙뿐이다. CASE_07을 만들지 않는다.
- 랜딩 카피(`MASTER_LANDING_FRAUD`): 송금·계약 전 진위 확인, 그리고 이미 피해가 난 뒤의 대응 점검. 위험 신호는 비현실적 수익·긴급 송금·정보 불일치.

즉 설계 의도는 「행정 CASE_01~06에 사기 문항을 추가」가 아니라 「같은 퍼널 기계 위에 사기 사실만 얹는 별도 서비스」다. 질문 문장 SoT는 아직 없다.

---

## 2. 현재 구현이 어디까지인가

`adminVerifyProfiling.ts`에 fraud / 사기 / 편취 문자열은 없다. `*fraud*Profiling*` 파일도 없다.

`/verify/fraud`는 랜딩 이후 **로컬 3문항 + 선택 첨부**다. Situation Profile·Phase2 adaptive·STOP 함수·bridge·slug/label 분리는 없다.

| 순서 | 화면 | 저장 | 진단(`verifyDiagnosis.ts`) |
|------|------|------|---------------------------|
| Page1 stage | `prevent` / `case` → `reviewStage` pre/post. 있으면 질문1 생략 | `review_check_stage` 등 page1 meta | 전달 안 함 |
| 질문1 | 제출·계약 전 / 문제 발생 후 | `review_stage` | 전달 안 함 |
| 질문2 | 사전: 제안서 5종+기타. 사후: 피해 5종+기타. value는 한글 문자열 (`투자사기` …) | `incident_type` | **이 문자열만** incidentType |
| 질문3 | 사전: 요건·누락·위험조항·번역·공증·전체. 사후: 협의·이의·경찰·판결·기타 | `review_focus` | 주석상 진단에 전달 안 함 |
| 질문4 | 파일 선택 | Storage | 첨부 유무로 summary 문구만 갈림 |
| 이후 | 가입 → 템플릿 진단 → 기관 안내(경찰·경제수사·민사·형사) | CRM meta | 체크리스트는 유형과 무관하게 동일 |

진단 템플릿이 말하는 사실(발신처 실재, 비정상 수익, 계좌 명의, 송금 전인지)은 질문이 묻지 않는다. 질문3은 결과 분기를 바꾸지 않는다. 기관 안내는 질문 체인이 아니라 결과 뒤 참고 블록이며, 외부 기관명·공공 URL이 있다.

구현 깊이: **레거시 카테고리 퍼널.** Admin/CASE_06 Adapter는 시작 전이다.

---

## 3. Adapter로 재사용할 것 / domain만 둘 것

재사용(새로 만들지 않음): Phase1 skeleton · Phase2는 1차 사실을 다시 묻지 않음 · 공식 DI `other`+note · 번호 그리드에서 DI 제외·하단 1회 · STOP은 `*PathComplete` 함수 · 가입·증거·1차 결과·전문가 연결·restore · 질문 렌더. DI 헬퍼는 호출만. CASE_06 함수 본문과 `isCase06BridgedToNativeCase`는 복사·호출하지 않는다 (RE STEP2-0과 같은 경계).

domain으로 이미 살아 있는 축은 세 개다. 질문 문장을 새로 쓰지 않고, 현재 화면이 이미 갈라 놓는 사실만 적는다.

| 축 | 현재 위치 | 결과와의 연결 |
|----|-----------|----------------|
| 사전 / 사후 | 질문1, Page1이면 생략 | 질문2·3 갈래. 진단 문구는 거의 안 바꿈 |
| 수법·서류 종류 | 질문2 한글 5종+기타 | 진단 incidentType **유일 입력** |
| 고객이 보려는 것 / 지금 단계 | 질문3 | CRM만. 진단 분기 없음 |

진단이 이미 전제로 두는 사실(송금 여부·임박, 발신처, 계좌 명의, 제시된 조건)은 질문 축으로 승격할지 **미확정**이다. 아래 DQ-F4.

---

## 4. 체크리스트 §1–§8 — 현재 Fraud (Adapter 전)

| § | 현재 | 메모 |
|---|------|------|
| 1 DI | **미착수** | 질문2·3의 「기타」는 공식 `other`+note가 아님. 하단 DI 블록 없음 |
| 2 CTA | **미확인** | 질문 화면이 Admin stitch rail이 아님 |
| 3 재분류 | **해당 없음** | 행정 Q1·CASE_06 스택을 쓰지 않음. 「기타」는 같은 서비스에 남음 |
| 4 Bridge | **해당 없음** | Admin bridge 없음. 만들지 않은 상태가 맞음 |
| 5 STOP | **미착수** | 3문항 후 가입. pathComplete 함수 없음 |
| 6 Harness | **N/A** | 이번 조사는 제품 코드·문서만 |
| 7 Legacy | **주의** | 한글 value가 진단 키. 질문3은 진단 밖 meta. Page1 stage는 질문1을 건너뜀 |
| 8 옵션 수 | **미달** | 질문2는 내용 6(5+기타). 질문1은 2. 질문3 사전·사후 각 6. 공식 DI 없음 |

---

## 5. DESIGN QUESTION

질문 문장·선택지 원문·파일 추가는 이 STEP1에서 하지 않는다.

**DQ-F1. 사기 질문을 어디에 두는가**

행정 MASTER에 사기 CASE가 없고 CASE_07은 금지다. `adminVerifyProfiling.ts`에도 사기 필드가 없다.

권장: Fraud Adapter는 RE와 같이 **별도 프로파일링 모듈**로 둔다. 행정 CASE_01~06 안에 문항을 넣지 않는다. 질문 문장 SoT가 없으므로, 아래 축이 승인되기 전에 STEP2-0 필드 표를 만들지 않는다.

근거: 행정문서 MASTER §1, Handoff §4–§5, Skill §50, `adminVerifyProfiling.ts` 검색 0건.

**DQ-F2. 첫 분기를 사전/사후로 유지하는가**

현재 첫 갈래는 서류 종류가 아니라 사전/사후다. Page1 `prevent`/`case`가 있으면 질문1을 다시 묻지 않는다. 행정 Q1(위반·납부·출석·보완·처분)과 축이 다르다.

권장: 첫 분기는 사기 domain의 사전/사후로 둔다. `adminCaseDocumentKind`를 재사용하지 않는다. Page1에서 이미 받은 stage는 다시 묻지 않는다.

근거: `REVIEW_STAGE_OPTIONS`, `mapReviewPage1StageToVerifyStage`, `MASTER_LANDING_FRAUD`.

**DQ-F3. 수법 5종의 저장 값을 한글 그대로 둘 것인가**

진단·CRM은 `투자사기` 등 한글 문자열에 묶여 있다. 화면 주석은 진단·DB를 바꾸지 말라고 적혀 있다. 체크리스트 §8은 내용 4~5 + 공식 DI이고, 「기타」는 DI가 아니다.

권장: 신규 쓰기는 slug + 표시 라벨. 기존 한글 값은 읽기 전용 fallback. 내용 5개 + 공식 DI로 「기타」를 흡수한다. `verifyDiagnosis.ts`의 incidentType 계약은 이 STEP1에서 바꾸지 않고, 문자열을 유지할지 slug로 옮길지는 STEP2-0 전에 확정한다.

근거: `PREVENT_DOCUMENT_OPTIONS` / `CASE_ISSUE_OPTIONS`, `verifyDiagnosis.ts` `fraud.incidentTypes`, 페이지 423–424행 주석.

**DQ-F4. 질문3과 진단 체크리스트 중 무엇이 domain 사실인가**

질문3(형식·번역·공증 / 협의·경찰 단계)은 진단에 들어가지 않는다. 진단이 말하는 사실(발신처, 수익·조건, 계좌 명의, 송금 전인지)은 질문이 없다.

권장: 결과에 이미 있는 그 사실을 Phase2 후보로 둔다. 질문3의 일반 서류검토 항목은 사기 프로파일로 승격하지 않는다. 사후 「지금 단계」를 남길지는 질문3 전체 유지가 아니라 별도 승인으로 자른다. 질문 문장은 승인 뒤에만 쓴다.

근거: 질문3 주석(460–471행), `verifyDiagnosis.ts` fraud `checklistTemplate`·`recommendedStepsNoFile`.

**DQ-F5. 결과 뒤 기관 안내를 질문 Adapter에 넣지 않는가**

경찰·경제수사·민사·형사는 질문 체인이 아니다. 고객 화면 전문가 라벨은 `VFBCAI 전문가팀`만이고, 외부 기관명을 전문가 라벨로 쓰지 않는다.

권장: 기관 안내 블록은 이번 질문 Adapter 범위 밖으로 둔다. Phase2 선택지로 옮기지 않는다. 블록을 지울지는 이 STEP1 결정이 아니다.

근거: `FRAUD_AGENCY_OPTIONS`, 헌법의 전문가 라벨.

**DQ-F6. 불명확 탈출을 Admin CASE_06에 연결할 것인가**

사기 「기타」는 같은 페이지에 남는다. `/verify/unclear`는 다른 서비스다. Admin CASE_06 bridge는 행정 문서 재분류용이다.

권장: Fraud에서 `isCase06BridgedToNativeCase`를 호출하지 않는다. 불명확은 사기 모듈 안의 플래그로 두거나, unclear 서비스로 보낼지를 따로 정한다. CASE_06 답변으로 사기 필드를 채우지 않는다.

근거: 행정 MASTER §6, RE STEP2-0 DQ-RE-07, Handoff 원칙 F.

**DQ-F7. 지금 3문항 종료를 STOP으로 볼 것인가**

지금은 질문3과 선택 첨부 뒤 가입·템플릿 진단이다. 중요한 사실이 결과에 반영되는 기준의 STOP이 아니다.

권장: Phase1은 DQ-F2·F3(사전/사후, 수법, 그리고 질문3의 역할이 F4에서 확정된 뒤의 목표). Phase2는 F4에서 승인된 사실만. 문항 수를 3으로 고정하지 않는다. `*PathComplete`는 STEP2-0 이후의 구현 항목이다.

근거: 체크리스트 §5, Skill §50의 「질문 수를 인위적으로 맞추지 않음」, 현재 `step`이 `incident`에서 `form`으로 넘어가는 조건.

---

*2026-09-24. STEP1 조사. 코드 미변경. DQ 승인 전 STEP2-0 없음.*
