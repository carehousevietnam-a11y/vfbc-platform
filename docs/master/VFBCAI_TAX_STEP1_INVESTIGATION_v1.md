# Tax VERIFY — STEP1 조사 (코드 미변경)

| 항목 | 내용 |
|------|------|
| **단계** | STEP1 조사만. STEP2-0 매핑·구현 없음 |
| **코드** | 수정하지 않음 |
| **증거** | LEVEL 1 (문서·코드 확인). 실행·브라우저 없음 |
| **SoT 공백** | `docs/master/` 행정문서 질문 MASTER에 세금 CASE **없음** |
| **순서** | Skill §50: 부동산 다음 사기 → 세금 → 불명확. 행정 질문 문장 복사 금지 |
| **Adapter** | Handoff §4–§5. 공통 엔진 재사용, domain 질문·값·규칙만 신규 |

조사일: 2026-09-24.

---

## 1. MASTER에 있는 세금 의도

`VFBCAI_행정문서_질문_MASTER_최종합의본_v1.0.md`를 검색하면 세금·세무가 없다. CASE는 01~06뿐이고 CASE_07은 금지다.

세금이 문서에 나오는 곳은 다음뿐이다.

- Skill §2: 세금은 VERIFY 안의 별도 전문 영역. 행정과 역할을 섞지 않음.
- Skill §50: 사기 다음이 세금. 질문 수를 맞추지 않고, 행정 질문을 그대로 복사하지 않음.
- Handoff §4–§5: Tax Adapter. Admin Master + CASE_06이 원형. domain 질문만 새로 둠.
- CASE_06 재설계 메모의 `case06_paymentNature` 예시 안에 「기존 발생 비용(세금 등)」이 있다. 이것은 행정 불명확 문서의 납부 성격 보기이지, `/verify/tax` 질문 SoT가 아니다.

질문 문장 SoT는 없다.

---

## 2. 현재 구현

`*tax*Profiling*` 파일은 없다. `adminVerifyProfiling.ts`의 `tax`는 행정 경로의 서류·기관 라벨(CASE_06 발신 후보 등)이다. Tax VERIFY 질문 체인이 아니다.

`/verify/tax`는 Fraud와 같은 레거시 골격이다. 랜딩(`MASTER_LANDING_TAX`) 뒤 로컬 3문항 + 선택 첨부 → 가입 → 템플릿 진단 → 기관 안내. Phase2·STOP 함수·bridge·slug/label 분리는 없다.

| 순서 | 화면 | 저장 | 진단 |
|------|------|------|------|
| Page1 stage | `prevent`/`case` → pre/post. 있으면 질문1 생략 | page1 meta | 전달 안 함 |
| 질문1 | 「제출·계약 전 서류 검토」/「문제 발생 후 대응 검토」 | `review_stage` | 전달 안 함 |
| 질문2 | 한글 5종+기타. 사전·사후 라벨만 다름 | `incident_type` | **이 문자열만** |
| 질문3 | 사전: 형식·누락·조항·번역·공증·전체. 사후: 협의·이의·경찰·판결·기타 | `review_focus` | 주석상 진단에 전달 안 함 |
| 질문4 | 파일 선택 | Storage | 첨부 유무로 summary만 갈림 |
| 이후 | 기관 안내: 세무기관·관세기관·회계·신고·기타 | 결과 뒤 | 질문 아님 |

질문2 저장 값 (`verifyDiagnosis.ts` `tax.incidentTypes`와 동일): `세금고지서`, `신고서류`, `계좌동결통지`, `가산세통지`, `세무조사`, `기타`.

진단 체크리스트가 말하는 사실(고지 금액·근거, 납부·이의 기한, 사업자번호·명의, 가산세)은 질문이 묻지 않는다. 랜딩 카피도 기한·명의를 말하지만 질문3은 일반 서류검토/절차 단계다.

구현 깊이: **레거시 카테고리 퍼널.** Adapter 시작 전. LEVEL 1.

---

## 3. 재사용할 것 / domain으로 이미 있는 축

재사용: Phase 분리, 공식 DI `other`+note, 그리드에서 DI 제외·하단 1회, STOP 함수, 가입·증거·결과·restore, DI 헬퍼 호출. CASE_06 함수 본문과 `isCase06BridgedToNativeCase`는 복사·호출하지 않는다.

이미 화면이 나누는 축:

| 축 | 현재 | 결과 연결 |
|----|------|-----------|
| 사전 / 사후 | 질문1. 문구는 계약·제출 전이라 세무 통지와 어긋남 | 질문2·3 갈래만. 진단 거의 불변 |
| 서류·문제 종류 | 질문2 한글 5종+기타 | 진단 incidentType **유일 입력** |
| 확인 초점 / 단계 | 질문3. Fraud와 같은 일반 문장 | CRM만 |

진단이 이미 전제로 두는 사실(근거·금액, 기한, 명의, 가산세)은 질문으로 올릴지 **미확정**. DQ-T4.

체크리스트 §8 각주(이분법 라우팅은 내용 개수 대상 아님, DI 불요)는 질문1을 라우팅으로 유지할 때에만 해당한다.

---

## 4. §1–§8 — 현재 Tax (Adapter 전)

| § | 현재 |
|---|------|
| 1 DI | **미착수.** 「기타」는 공식 `other`+note가 아님 |
| 2 CTA | **미확인.** Admin stitch rail 아님. LEVEL 4 |
| 3 재분류 | **해당 없음.** 행정 Q1·CASE_06 스택 미사용 |
| 4 Bridge | **해당 없음.** 만들지 않은 상태가 맞음 |
| 5 STOP | **미착수.** 3문항 후 가입 |
| 6 Harness | **N/A.** 이번 조사는 코드·문서만 |
| 7 Legacy | **주의.** 한글 value가 진단 키. 질문3은 진단 밖. Page1이면 질문1 생략 |
| 8 옵션 수 | **미달.** 질문2는 내용 6. 질문1은 2. 질문3은 각 6. 공식 DI 없음 |

---

## 5. DESIGN QUESTION

질문 문장과 필드 표는 승인 전에 쓰지 않는다.

**DQ-T1. 세금 질문을 어디에 두는가**

행정 MASTER에 세금 CASE가 없다. `adminVerifyProfiling.ts`의 `tax`는 발신·서류 라벨이다.

권장: Tax Adapter는 별도 프로파일링 모듈로 둔다. 행정 CASE_01~06과 CASE_02(납부) 안에 세무 문항을 넣지 않는다. 고지서처럼 보여도 `/verify/tax`와 `/verify/admin`은 다른 서비스다.

근거: 행정 MASTER에 세금 없음, Handoff §4–§5, Skill §2·§50, `adminVerifyProfiling.ts`의 `tax`는 라벨만.

**DQ-T2. 첫 분기를 지금의 사전/사후 문구로 둘 것인가**

갈래 구조는 사전/사후다. 표시 문장은 「제출·계약 전」이라 랜딩(고지·기한·명의)과 맞지 않는다. Page1 stage가 있으면 질문1을 다시 묻지 않는다.

권장: 첫 축은 두 갈래 라우팅으로 둔다. 그러면 §8 각주대로 DI를 붙이지 않는다. `adminCaseDocumentKind`는 쓰지 않는다. Page1에서 받은 stage는 다시 묻지 않는다. 「계약 전」문장을 세무 라우팅 라벨로 유지할지는 승인 항목으로 남긴다. 문장 작성은 STEP2-0에서 한다.

근거: `REVIEW_STAGE_OPTIONS`, `MASTER_LANDING_TAX`, `mapReviewPage1StageToVerifyStage`, 체크리스트 §8 각주.

**DQ-T3. 서류 5종의 저장 값을 한글로 둘 것인가**

진단 키는 `세금고지서` 등 한글이다. 페이지 주석은 진단·DB를 바꾸지 말라고 적혀 있다. 「기타」는 공식 DI가 아니다.

권장: 신규 저장은 slug + 표시 라벨. 옛 한글은 읽기 전용. 내용 5개 + `ADMIN_DIRECT_EXPLAIN_CHOICE`. `verifyDiagnosis.ts` 계약은 이 STEP1에서 바꾸지 않고, 호출 경계에서 slug를 옛 한글으로 읽을지 확정한 뒤 STEP2-0에 적는다.

근거: `PREVENT_DOCUMENT_OPTIONS`, `CASE_ISSUE_OPTIONS`, `verifyDiagnosis.ts` `tax.incidentTypes`, 페이지 402–403행 주석.

**DQ-T4. 질문3과 진단 체크리스트 중 무엇이 domain 사실인가**

질문3은 진단에 들어가지 않고 Fraud와 문장이 같다. 진단이 말하는 것은 고지 금액·근거(`basis`), 납부·이의 기한(`deadline`), 사업자번호·명의(`identity`), 가산세(`penalty`)다.

권장: 그 네 사실을 Phase2 후보로 둔다. 질문3(형식·공증 / 경찰 단계)은 세무 사실질문이 아니므로 결과 이후 안내로 옮긴다. 질문 문장은 승인 뒤에만 쓴다.

근거: 질문3 주석(438–457행), `verifyDiagnosis.ts` tax `checklistTemplate`·`rejectionRisksTemplate`, `MASTER_LANDING_TAX`.

**DQ-T5. 기관 안내를 질문 Adapter에 넣지 않는가**

세무기관·관세기관·회계·신고는 결과 뒤 참고 블록이다. 고객 화면 전문가 라벨은 `VFBCAI 전문가팀`만이다.

권장: 이 블록은 질문 Adapter 밖에 둔다. Phase2 선택지로 옮기지 않는다. 블록 삭제 여부는 이 STEP1이 결정하지 않는다.

근거: `TAX_AGENCY_OPTIONS`, 헌법의 전문가 라벨.

**DQ-T6. Admin CASE_06의 세무 라벨과 이 서비스를 연결할 것인가**

CASE_06이 발신을 세무로 보는 것과 `/verify/tax` 진입은 별개다. 「기타」는 지금 같은 페이지에 남는다.

권장: `isCase06BridgedToNativeCase`를 호출하지 않는다. CASE_06 답변으로 세무 필드를 채우지 않는다. 불명확은 세무 모듈 안에 둘지 `/verify/unclear`로 보낼지를 따로 정한다.

근거: 행정 MASTER의 CASE_06 재분류는 01~05뿐, Handoff 원칙 F, `adminVerifyProfiling.ts`의 `tax` 라벨.

**DQ-T7. 3문항 종료를 STOP으로 볼 것인가**

질문3과 선택 첨부 뒤 가입·템플릿 진단이다. 기한·명의·가산세가 결과에 반영되는 완료가 아니다.

권장: Phase1은 DQ-T2·T3가 확정한 라우팅과 서류 종류. Phase2는 DQ-T4에서 승인한 사실만. 문항 수를 3으로 고정하지 않는다. `*PathComplete`는 STEP2-0 이후다.

근거: 체크리스트 §5, Skill §50, `step`이 `incident`에서 `form`으로 넘어가는 조건.

---

*2026-09-24. STEP1 조사. 코드 미변경. DQ 승인 전 STEP2-0 없음.*
