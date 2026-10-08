# Fraud VERIFY — STEP2-0 필드 표 (코드 미변경)

| 항목 | 내용 |
|------|------|
| **전제** | STEP1 DQ-F1·F2·F3·F5·F6·F7 승인. DQ-F4 승인: Phase2 = 발신처·수익·계좌·송금. 질문3은 질문 체인이 아님 |
| **코드** | 작성·수정 없음. 아래 표는 STEP2-1 착수 전 설계 |
| **배치** | 행정 `adminVerifyProfiling.ts` / CASE_01~06에 넣지 않음 (DQ-F1). 구현 시 모듈은 RE와 같이 별도. 이 문서는 파일을 만들지 않음 |
| **DI** | 공식 선택지는 기존 `ADMIN_DIRECT_EXPLAIN_CHOICE` (`value: "other"`, 라벨 `ADMIN_DIRECT_EXPLAIN_LABEL`). Fraud 전용 DI 문구·value를 새로 만들지 않음 |
| **하지 않음** | CASE_07, `isCase06BridgedToNativeCase` 호출, CASE_06 값으로 사기 필드 채우기, 기관 안내를 Phase2로 편입, `verifyDiagnosis.ts` 계약 변경 |

조사·매핑일: 2026-09-24.

---

## 0. 승인 반영

| DQ | 필드 표에 넣은 결정 |
|----|---------------------|
| F1 | 사기 필드는 `fraud_*`. 행정 CASE 문항이 아님 |
| F2 | Phase1 첫 축은 사전/사후. Page1 `prevent`→`pre`, `case`→`post` 이면 그 질문을 다시 내지 않음 |
| F3 | 수법 저장은 slug. 한글은 표시 라벨. 내용 「기타」 slug 없음. 정식 DI = `ADMIN_DIRECT_EXPLAIN_CHOICE` |
| F4 | Phase2 사실 4개: 발신처, 수익률·조건, 계좌 명의, 송금 여부. 옛 질문3은 결과 이후 안내 |
| F5 | `FRAUD_AGENCY_OPTIONS` 블록은 질문 표 밖 |
| F6 | 불명확·DI note는 사기 프로파일 안에 둠. Admin CASE_06·`/verify/unclear`로 보내지 않음 |
| F7 | 종료를 3문항에 고정하지 않음. Phase1 2축 + Phase2 4사실. `*PathComplete`는 STEP2-1 |

진단 템플릿의 `liability`(법적 책임 조항)는 이번 승인 목록에 없다. 질문 필드에 넣지 않는다.

옛 질문3이 결과 뒤로 옮겨지므로, Phase1에 「확인하고 싶은 것」 질문을 새로 만들지 않는다. F7의 목표 칸은 F4에서 질문 체인 밖으로 확정됐다.

---

## 1. Phase1

Page1에서 `mapReviewPage1StageToVerifyStage`가 `pre` 또는 `post`를 주면 `fraud_reviewStage`는 이미 알려진 값이다. 그 경우 1번을 건너뛰고 2번부터다.

| 순서 | fieldId | 질문 | 저장 | DI |
|------|---------|------|------|----|
| 1 | `fraud_reviewStage` | 어떤 검토가 필요하신가요? | slug | 없음. **승인 예외** — 갈래가 사전/사후 둘뿐이라 공식 DI를 붙이면 세 번째 경로가 생긴다 |
| 2 | `fraud_scheme` | 사전: 어떤 서류를 검토하시나요? / 사후: 어떤 문제가 발생했나요? | slug | `ADMIN_DIRECT_EXPLAIN_CHOICE`. note 키 `fraud_schemeNote` |

### 1.1 `fraud_reviewStage`

| slug | 표시 |
|------|------|
| `pre` | 제출·계약 전 서류 검토 |
| `post` | 문제 발생 후 대응 검토 |

읽기: Page1 `prevent` → `pre`, `case` → `post`. 기존 `review_stage` 값 `pre`/`post`는 같은 slug다.

### 1.2 `fraud_scheme` — slug + 표시 라벨

같은 slug를 사전·사후가 공유한다. 화면 라벨만 갈래에 따라 바꾼다. 저장 값에 한글을 넣지 않는다.

| slug | 사전 라벨 (기존 title) | 사후 라벨 (기존 title) | 읽기 전용 옛 value |
|------|------------------------|------------------------|--------------------|
| `investment` | 투자 제안서 | 투자사기 피해 | `투자사기` |
| `loan` | 대출 제안서 | 대출사기 피해 | `대출사기` |
| `online_trade` | 온라인 거래 내역 | 온라인거래사기 피해 | `온라인거래사기` |
| `romance` | 결혼·연애 관련 서류 | 결혼·연애사기 피해 | `결혼·연애사기` |
| `partnership` | 사업제휴 제안서 | 사업제휴사기 피해 | `사업제휴사기` |

내용 5개 + 공식 DI 1개. 옛 내용 선택지 `기타` / title `기타`는 slug가 아니다.

| 항목 | 규칙 |
|------|------|
| 신규 저장 | 다섯 slug 또는 `other` |
| DI | `ADMIN_DIRECT_EXPLAIN_CHOICE`. 번호 그리드에서 제외, 하단 1회 |
| note | `getAdminChoiceNoteKey("fraud_scheme")` → `fraud_schemeNote`. `other`이면 note 없으면 미완료 |
| 완료 | `isAdminVerifyChoiceFieldComplete` |
| 옛 `기타` | 읽기 전용. 새 쓰기에서 내용 slug로 저장하지 않음. note가 없으면 `other` 미완료와 같이 보고 DI를 한 번 받는다 |

현재 `verifyDiagnosis.ts`의 `incidentTypes`는 한글 문자열이다. 이 STEP2-0은 그 계약을 바꾸지 않는다. 프로파일 저장은 slug다. 기존 진단 호출이 한글을 요구하면, 호출 경계에서만 slug → 위 표의 옛 value로 읽는다. `other`는 다섯 유형 문자열이 아니므로 진단 유형 문자열로 넣지 않고, note를 사건 설명 쪽으로 넘긴다. 진단 파일 수정은 이 문서의 구현 범위가 아니다.

---

## 2. Phase2 — 사실 4개

1차에서 받은 사전/사후·수법은 다시 묻지 않는다. 네 문항 모두 선택이며, 각각 내용 4개 + `ADMIN_DIRECT_EXPLAIN_CHOICE`다. note 키는 `{fieldId}Note`. 완료는 `isAdminVerifyChoiceFieldComplete`.

진단 `checklistTemplate`에 있는 문장만 질문으로 옮긴다. 선택지는 그 문장이 갈라 놓는 상태다.

| 순서 | fieldId | 질문 | 진단 근거 |
|------|---------|------|-----------|
| 1 | `fraud_issuer` | 서류나 안내에 나온 발신처(회사·기관·상대 이름)는 어디까지 확인되나요? | `issuer` — 발신처가 실제로 존재하고 등록된 곳인지 |
| 2 | `fraud_returns` | 상대가 제시한 수익이나 조건은 어느 쪽에 가깝나요? | `returns` — 수익률·조건이 비정상적으로 좋은지 |
| 3 | `fraud_account` | 송금 계좌 명의와 서류에 적힌 이름은 어떻게 연결되어 있나요? | `account` — 계좌 명의와 서류상 회사명 일치 |
| 4 | `fraud_remittance` | 돈은 지금 어느 상태인가요? | `recommendedStepsNoFile` — 아직 송금 전인지, 송금 임박인지 |

### 2.1 `fraud_issuer`

| slug | 표시 |
|------|------|
| `registered_match` | 서류의 회사·기관명이 실제 등록된 곳으로 확인된다 |
| `name_unverified` | 이름은 있으나 등록됐는지는 확인하지 못했다 |
| `name_mismatch` | 안내받은 곳과 서류의 이름이 다르다 |
| `cannot_tell` | 발신처를 서류에서 확인하기 어렵다 |

### 2.2 `fraud_returns`

연애·온라인 거래에는 수익률 문장이 없을 수 있다. 필드는 진단 라벨 「수익률·조건」 하나다. 수법별로 질문을 나누지 않는다.

| slug | 표시 |
|------|------|
| `abnormal` | 시장에서 보기 어려운 수익이나 조건을 제시했다 |
| `stated_unclear` | 수익·조건은 적혀 있으나 왜 그런지는 알기 어렵다 |
| `money_demand` | 수익률 약속은 없고, 선입금·대금·금전 요구가 중심이다 |
| `not_stated` | 수익이나 조건이 서류에 드러나 있지 않다 |

### 2.3 `fraud_account`

| slug | 표시 |
|------|------|
| `name_match` | 계좌 명의가 서류의 회사·담당자 이름과 같다 |
| `name_mismatch` | 계좌 명의가 서류 이름과 다르다 |
| `no_account` | 아직 계좌를 안내받지 않았다 |
| `cannot_compare` | 계좌나 서류 이름이 없어 대조할 수 없다 |

### 2.4 `fraud_remittance`

| slug | 표시 |
|------|------|
| `not_sent` | 아직 돈을 보내지 않았다 |
| `imminent` | 곧 보내야 하거나, 보내라는 재촉을 받고 있다 |
| `sent` | 이미 일부 또는 전부를 보냈다 |
| `sent_again` | 보낸 뒤에 추가 송금을 요구받았다 |

---

## 3. 질문 체인이 아닌 것

### 3.1 옛 질문3 → 결과 이후 안내 (DQ-F4)

프로파일 필드가 아니다. `fraud_*` 답변 키로 저장하지 않는다. Phase1·Phase2 `needs*`에 넣지 않는다. STOP이 이 선택을 기다리지 않는다.

결과 화면 다음 안내에, 갈래만 나눠 기존 문장을 둔다.

| `fraud_reviewStage` | 안내 제목 (기존) | 기존 문장 |
|---------------------|------------------|-----------|
| `pre` | 무엇을 확인하고 싶으신가요? 에 해당하던 목록 | 제출 요건과 형식 / 누락된 내용이나 서류 / 불리하거나 위험한 조항 / 원본과 번역본의 일치 여부 / 공증·인증·영사확인 필요 여부 / 전체 검토가 필요함 |
| `post` | 현재 어느 단계인가요? 에 해당하던 목록 | 공식 대응 전 / 상대방·기관과 협의 중 / 이의신청·통지 준비 중 / 경찰·검찰·법원·행정기관 접수 / 판결·결정 후 후속 대응 / 기타 |

사후 목록의 「기타」도 질문 DI가 아니다. 이 블록에 `ADMIN_DIRECT_EXPLAIN_CHOICE`를 붙이지 않는다.

### 3.2 기관 안내 (DQ-F5)

`FRAUD_AGENCY_OPTIONS`(경찰 신고, 경제수사기관, 민사법원, 형사절차, 기타)와 그 안내 본문은 질문 Adapter 밖이다. Phase2로 옮기지 않고, 3.1 목록과 합치지 않는다.

---

## 4. 패턴 체크 (설계)

| § | 판정 | 근거 |
|---|------|------|
| 1 DI | **PASS (설계)** | 수법·Phase2 4필드는 `other`+note, 그리드 제외·하단 1회. 사전/사후만 DI 예외 |
| 2 CTA | **N/A** | 질문 재배치만. rail CTA 정책은 이 표에 없음 |
| 3 재분류 | **PASS (설계)** | 행정 Q1·CASE 스택을 쓰지 않음. DI note는 사기 안에 남음 |
| 4 Bridge | **PASS (설계)** | `isCase06BridgedToNativeCase` 없음. 사기 → 행정 CASE 시드 없음 |
| 5 STOP | **주의** | 함수 이름은 STEP2-1의 `fraudPhase1Complete` + Phase2 4필드 완료. 이 문서는 식을 쓰지 않음. 질문3은 완료 조건이 아님 |
| 6 Harness | **N/A** | 제품 코드 없음 |
| 7 Legacy | **PASS (설계)** | 한글 수법·`기타`는 읽기 전용. 질문3·기관 안내는 답변 키가 아님 |
| 8 옵션 수 | **PASS (설계)** | 수법 5+DI, Phase2 각 4+DI. 사전/사후 2개는 F2 승인 예외 |

---

## 5. STEP2-1에 넘기지 않는 것

- `adminVerifyProfiling.ts`에 `fraud_*` 추가
- `verifyDiagnosis.ts`의 `incidentTypes` 한글 배열 교체
- 기관 안내 삭제·개명
- 질문3을 Phase2 분기로 되돌리기
- 파일 업로드를 이 필드 표의 질문으로 추가 (현재 질문4는 선택 첨부. 증거 게이트는 기존 VERIFY 업로드를 유지)

---

*2026-09-24. STEP2-0 필드 표. 코드 없음. Ace 승인 DQ-F1~F7 반영.*
