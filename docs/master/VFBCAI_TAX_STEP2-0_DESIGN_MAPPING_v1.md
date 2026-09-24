# Tax VERIFY — STEP2-0 필드 표 (코드 미변경)

| 항목 | 내용 |
|------|------|
| **전제** | STEP1 DQ-T1·T3·T4·T5·T6·T7 승인. DQ-T2 승인: 사전/사후 라우팅, DI 없음. 표시는 「고지·통지를 받기 전」/「고지·통지를 받은 후」. DQ-T4 승인: Phase2 = 근거·기한·명의·가산세. 질문3은 질문 체인이 아님 (Fraud DQ-F4와 동일) |
| **코드** | 작성·수정 없음. 아래 표는 STEP2-1 착수 전 설계 |
| **배치** | 행정 `adminVerifyProfiling.ts` / CASE_01~06에 넣지 않음 (DQ-T1). 구현 시 모듈은 Fraud·RE와 같이 별도. 이 문서는 파일을 만들지 않음 |
| **DI** | 공식 선택지는 기존 `ADMIN_DIRECT_EXPLAIN_CHOICE` (`value: "other"`, 라벨 `ADMIN_DIRECT_EXPLAIN_LABEL`). Tax 전용 DI 문구·value를 새로 만들지 않음 |
| **하지 않음** | CASE_07, `isCase06BridgedToNativeCase` 호출, CASE_06·행정 `tax` 라벨로 세무 필드 채우기, 기관 안내를 Phase2로 편입, `verifyDiagnosis.ts` 계약 변경, 법령 조문·금액 생성 |

조사·매핑일: 2026-09-24.

---

## 0. 승인 반영

| DQ | 필드 표에 넣은 결정 |
|----|---------------------|
| T1 | 세무 필드는 `tax_*`. 행정 CASE 문항이 아님. 행정 프로파일의 `tax` 발신 라벨과 연결하지 않음 |
| T2 | Phase1 첫 축은 사전/사후. DI 없음. 표시는 아래 1.1. Page1 `prevent`→`pre`, `case`→`post` 이면 그 질문을 다시 내지 않음 |
| T3 | 서류 종류 저장은 slug. 한글은 표시 라벨. 내용 「기타」 slug 없음. 정식 DI = `ADMIN_DIRECT_EXPLAIN_CHOICE` |
| T4 | Phase2 사실 4개: 근거, 기한, 명의, 가산세. 옛 질문3은 결과 이후 안내 |
| T5 | `TAX_AGENCY_OPTIONS` 블록은 질문 표 밖 |
| T6 | 불명확·DI note는 세무 프로파일 안에 둠. Admin CASE_06·`/verify/unclear`·CASE_02로 보내지 않음 |
| T7 | 종료를 3문항에 고정하지 않음. Phase1 2축 + Phase2 4사실. `*PathComplete`는 STEP2-1 |

계좌동결은 Phase2 다섯 번째 사실이 아니다. 서류 종류 slug `account_freeze`로만 둔다. 진단 `rejectionRisksTemplate`의 「가산세·계좌동결」문장은 결과 서술이지 추가 질문이 아니다.

옛 질문3이 결과 뒤로 옮겨지므로, Phase1에 「확인하고 싶은 것」 질문을 새로 만들지 않는다.

---

## 1. Phase1

Page1에서 `mapReviewPage1StageToVerifyStage`가 `pre` 또는 `post`를 주면 `tax_reviewStage`는 이미 알려진 값이다. 그 경우 1번을 건너뛰고 2번부터다.

| 순서 | fieldId | 질문 | 저장 | DI |
|------|---------|------|------|----|
| 1 | `tax_reviewStage` | 고지·통지를 받기 전인가요, 받은 후인가요? | slug | 없음. **승인 예외** — 갈래가 둘뿐이라 공식 DI를 붙이면 세 번째 경로가 생긴다. 체크리스트 §8 각주 |
| 2 | `tax_documentKind` | 사전: 어떤 세무 서류를 검토하시나요? / 사후: 어떤 세무 문제가 발생했나요? | slug | `ADMIN_DIRECT_EXPLAIN_CHOICE`. note 키 `tax_documentKindNote` |

### 1.1 `tax_reviewStage`

| slug | 표시 |
|------|------|
| `pre` | 고지·통지를 받기 전 |
| `post` | 고지·통지를 받은 후 |

읽기: Page1 `prevent` → `pre`, `case` → `post`. 기존 `review_stage` 값 `pre`/`post`는 같은 slug다. 옛 표시 「제출·계약 전 서류 검토」/「문제 발생 후 대응 검토」는 쓰지 않는다.

### 1.2 `tax_documentKind` — slug + 표시 라벨

같은 slug를 사전·사후가 공유한다. 화면 라벨만 갈래에 따라 바꾼다. 저장 값에 한글을 넣지 않는다. 라벨은 현재 `PREVENT_DOCUMENT_OPTIONS` / `CASE_ISSUE_OPTIONS`의 title이다.

| slug | 사전 라벨 (기존 title) | 사후 라벨 (기존 title) | 읽기 전용 옛 value |
|------|------------------------|------------------------|--------------------|
| `notice` | 세금 고지서 | 세금 고지 문제 | `세금고지서` |
| `filing` | 신고서류 | 신고 관련 문제 | `신고서류` |
| `account_freeze` | 계좌동결 통지서 | 계좌동결 문제 | `계좌동결통지` |
| `surcharge` | 가산세 통지서 | 가산세 문제 | `가산세통지` |
| `audit` | 세무조사 관련 서류 | 세무조사 대응 | `세무조사` |

내용 5개 + 공식 DI 1개. 옛 내용 선택지 `기타` / title `기타`는 slug가 아니다.

| 항목 | 규칙 |
|------|------|
| 신규 저장 | 다섯 slug 또는 `other` |
| DI | `ADMIN_DIRECT_EXPLAIN_CHOICE`. 번호 그리드에서 제외, 하단 1회 |
| note | `getAdminChoiceNoteKey("tax_documentKind")` → `tax_documentKindNote`. `other`이면 note 없으면 미완료 |
| 완료 | `isAdminVerifyChoiceFieldComplete` |
| 옛 `기타` | 읽기 전용. 새 쓰기에서 내용 slug로 저장하지 않음. note가 없으면 `other` 미완료와 같이 보고 DI를 한 번 받는다 |

현재 `verifyDiagnosis.ts`의 `tax.incidentTypes`는 한글 문자열이다. 이 STEP2-0은 그 계약을 바꾸지 않는다. 프로파일 저장은 slug다. 기존 진단 호출이 한글을 요구하면, 호출 경계에서만 slug → 위 표의 옛 value로 읽는다. `other`는 다섯 유형 문자열이 아니므로 진단 유형 문자열로 넣지 않고, note를 사건 설명 쪽으로 넘긴다. 진단 파일 수정은 이 문서의 구현 범위가 아니다.

---

## 2. Phase2 — 사실 4개

1차에서 받은 사전/사후·서류 종류는 다시 묻지 않는다. 네 문항 모두 선택이며, 각각 내용 4개 + `ADMIN_DIRECT_EXPLAIN_CHOICE`다. note 키는 `{fieldId}Note`. 완료는 `isAdminVerifyChoiceFieldComplete`.

진단 `checklistTemplate`의 네 id만 질문으로 옮긴다. 선택지는 그 문장이 갈라 놓는 상태다. 법령 조문과 금액은 선택지로 만들지 않는다.

| 순서 | fieldId | 질문 | 진단 근거 |
|------|---------|------|-----------|
| 1 | `tax_basis` | 고지 금액과 근거는 서류에 어떻게 적혀 있나요? | `basis` — 고지 금액과 근거 법령이 명시되어 있는지 |
| 2 | `tax_deadline` | 납부·이의신청 기한은 지금 어느 상태인가요? | `deadline` — 납부·이의신청 기한이 언제까지인지 |
| 3 | `tax_identity` | 사업자등록번호와 명의는 서류와 어떻게 맞나요? | `identity` — 사업자등록번호·명의가 정확히 일치하는지 |
| 4 | `tax_penalty` | 가산세는 서류에서 어떻게 보이나요? | `penalty` — 가산세 발생 가능성이 있는지 |

### 2.1 `tax_basis`

| slug | 표시 |
|------|------|
| `both_stated` | 금액과 근거가 서류에 함께 적혀 있다 |
| `amount_only` | 금액은 있으나 근거는 보이지 않는다 |
| `basis_unclear` | 근거로 보이는 문구는 있으나 금액과 어떻게 연결되는지 알기 어렵다 |
| `not_stated` | 금액과 근거가 서류에서 확인되지 않는다 |

### 2.2 `tax_deadline`

| slug | 표시 |
|------|------|
| `dated_open` | 기한이 적혀 있고 아직 지나지 않았다 |
| `imminent` | 기한이 가깝거나, 곧 지난다 |
| `passed` | 기한이 이미 지났다 |
| `not_stated` | 기한이 서류에 없다 |

### 2.3 `tax_identity`

| slug | 표시 |
|------|------|
| `id_match` | 사업자등록번호와 명의가 서류와 같다 |
| `id_mismatch` | 번호 또는 명의가 서류와 다르다 |
| `incomplete` | 번호와 명의 중 하나만 확인할 수 있다 |
| `cannot_compare` | 대조할 번호나 명의가 없다 |

### 2.4 `tax_penalty`

| slug | 표시 |
|------|------|
| `stated` | 가산세가 서류에 항목으로 적혀 있다 |
| `possible_if_late` | 가산세 항목은 없고, 기한을 넘기면 생길 수 있다고 되어 있다 |
| `not_stated` | 가산세가 서류에 언급되어 있지 않다 |
| `cannot_tell` | 가산세인지 다른 금액인지 구분하기 어렵다 |

---

## 3. 질문 체인이 아닌 것

### 3.1 옛 질문3 → 결과 이후 안내 (DQ-T4)

프로파일 필드가 아니다. `tax_*` 답변 키로 저장하지 않는다. Phase1·Phase2 `needs*`에 넣지 않는다. STOP이 이 선택을 기다리지 않는다.

결과 화면 다음 안내에, 갈래만 나눠 기존 문장을 둔다.

| `tax_reviewStage` | 안내 제목 (기존) | 기존 문장 |
|---------------------|------------------|-----------|
| `pre` | 무엇을 확인하고 싶으신가요? 에 해당하던 목록 | 제출 요건과 형식 / 누락된 내용이나 서류 / 불리하거나 위험한 조항 / 원본과 번역본의 일치 여부 / 공증·인증·영사확인 필요 여부 / 전체 검토가 필요함 |
| `post` | 현재 어느 단계인가요? 에 해당하던 목록 | 공식 대응 전 / 상대방·기관과 협의 중 / 이의신청·통지 준비 중 / 경찰·검찰·법원·행정기관 접수 / 판결·결정 후 후속 대응 / 기타 |

사후 목록의 「기타」도 질문 DI가 아니다. 이 블록에 `ADMIN_DIRECT_EXPLAIN_CHOICE`를 붙이지 않는다.

### 3.2 기관 안내 (DQ-T5)

`TAX_AGENCY_OPTIONS`(세무기관, 관세기관, 회계·신고 관련, 기타)와 그 안내 본문은 질문 Adapter 밖이다. Phase2로 옮기지 않고, 3.1 목록과 합치지 않는다. 블록 삭제·개명은 이 표가 결정하지 않는다.

---

## 4. 패턴 체크 (설계)

| § | 판정 | 근거 |
|---|------|------|
| 1 DI | **PASS (설계)** | 서류 종류·Phase2 4필드는 `other`+note, 그리드 제외·하단 1회. 사전/사후만 DI 예외 |
| 2 CTA | **N/A** | 질문 재배치만. rail CTA 정책은 이 표에 없음 |
| 3 재분류 | **PASS (설계)** | 행정 Q1·CASE 스택을 쓰지 않음. DI note는 세무 안에 남음 |
| 4 Bridge | **PASS (설계)** | `isCase06BridgedToNativeCase` 없음. 세무 → 행정 CASE 시드 없음 |
| 5 STOP | **주의** | 함수 이름은 STEP2-1의 `taxPhase1Complete` + Phase2 4필드 완료. 이 문서는 식을 쓰지 않음. 질문3은 완료 조건이 아님 |
| 6 Harness | **N/A** | 제품 코드 없음 |
| 7 Legacy | **PASS (설계)** | 한글 서류 종류·`기타`는 읽기 전용. 질문3·기관 안내는 답변 키가 아님. 옛 라우팅 라벨은 폐기 |
| 8 옵션 수 | **PASS (설계)** | 서류 종류 5+DI, Phase2 각 4+DI. 사전/사후 2개는 T2 승인 예외 |

판정은 설계 문서 기준이다. 코드·브라우저 증거가 없으므로 LEVEL 1이며, 구현 PASS가 아니다.

---

## 5. STEP2-1에 넘기지 않는 것

- `adminVerifyProfiling.ts`에 `tax_*` 추가
- `verifyDiagnosis.ts`의 `incidentTypes` 한글 배열 교체
- 기관 안내 삭제·개명
- 질문3을 Phase2 분기로 되돌리기
- 계좌동결을 Phase2 다섯 번째 질문으로 추가
- 파일 업로드를 이 필드 표의 질문으로 추가 (현재 선택 첨부. 증거 게이트는 기존 VERIFY 업로드를 유지)

---

*2026-09-24. STEP2-0 필드 표. 코드 없음. Ace 승인 DQ-T1~T7 반영. T2 라벨은 승인 문구 그대로.*
