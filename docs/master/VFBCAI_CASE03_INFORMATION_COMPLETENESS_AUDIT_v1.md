# CASE_03 Information Completeness Audit

| 항목 | 내용 |
|------|------|
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (fa4cce9) |
| **증거** | LEVEL 1. `adminVerifyProfiling.ts`, `AdminVerifyFirstResultPanel.tsx` |
| **코드** | 수정 없음 |

Phase1은 5개다. `authorityDemand`, `inquiryFocus`, `customerResponse`, `confirmGoal`, `deadline`. Phase2 후보는 사실비교, 소명 상세, 기관 후속, 준비물, 반복, 막힘, 증거, 최종목표. `inquiryFocus`의 Phase2 재질문은 1차에서 이미 답하면 열리지 않아 2차 축으로 세지 않는다.

## 판정

### ① 정보완결성 — FAIL

출석·소명 날짜, 장소, 당사자, 어디가 다른지는 선택값으로 안 남는다. 아래 데이터 손실과 같다. 질문을 마쳐도 「언제, 어디서, 무슨 일이었나」를 다시 물어야 한다.

### ② 다중신호성 — FAIL

한 칸 라벨만 바꾸고 다음 질문·증거·결과가 같은 선택지가 있다. 기한 미확인 4개, 막힘·증거·최종목표의 값, 반복의 내용 선택지가 그렇다.

### ③ 선택지 판별력 — FAIL

다른 라벨이 같은 다음 질문·같은 결과로 합쳐진다. `partial`/`mismatch`, 기한 미확인 4개, 반복 내용 선택지, `phone_message`/`attendance`의 결과 문장.

### ④ 비장식성 — FAIL

질문 전체 장식: `blockage`, `evidence`, `finalGoal`. 값을 바꿔도 결과 문장이 같다. 기한 미확인 4개와 반복 내용 선택지는 질문 안 장식이다.

### ⑤ 직접입력 의존성 — PASS

정상 경로의 골격(요구, 확인 초점, 대응, 목표, 기한 상태, 사실비교)은 대표 선택지로 채워진다. 날짜·장소가 비는 것은 ①이지, 자유텍스트 필수 의존이 아니다.

### 1차 vs 2차 — 1차 = 2차. 무조건 FAIL. 실질 축 5:5

| 구분 | 질문 |
|------|------|
| 1차 실질 5 | `authorityDemand`, `inquiryFocus`, `customerResponse`, `confirmGoal`, `deadline` |
| 2차 실질 5 | `factRelationship`, `explanationDetail`, `authorityFollowUp`, `prepRequired`, `repeatFollowUp` |
| 2차 장식 | `blockage`, `evidence`, `finalGoal` |

하한은 3:7~4:6이다. 5:5는 1차 = 2차라 무조건 FAIL이고, 하한 아래다. ①~④ FAIL은 따로 남는다.

---

# 데이터 손실 버그 (기한·날짜·장소)

| 항목 | 내용 |
|------|------|
| **범위** | CASE_06에서 나온 「날짜·금액·장소를 답해도 Profile에 값이 없는」 패턴만 점검 |
| **증거** | LEVEL 1. `adminVerifyProfiling.ts`, `AdminVerifyFirstResultPanel.tsx` `buildCase03IntegratedSituation` |
| **코드** | 수정 없음 |

CASE_03 질문 체인에 `kind: "text"` 후속 입력은 없다. 금액 질문도 없다.

## 데이터 손실 버그

| 선택 | 라벨이 말하는 사실 | Profile·결과에 남는 것 |
|------|-------------------|------------------------|
| `case03_deadline` = `specific_date` | 출석·설명 날짜를 확인함 | slug `specific_date`와 선택지 문장만. 날짜 문자열 필드 없음. `deadline` 칸은 그 문장. 통합문은 「출석·소명 기한은 확인된 상태입니다.」 날짜 없음 |
| `case03_deadline` = `other` + note | 고객이 적은 기한 문장 | Profile `deadline`은 `getCase03FieldOptionLabel`만 사용. note는 기한 칸으로 복사되지 않음 |
| `case03_customerResponse` = `attendance` | 지정된 장소에 방문 | slug만. 장소 문자열 없음 |
| `case03_evidence` = `attendance_notice` | 출석 일시·장소가 적힌 안내 | 자료 종류 slug만. 일시·장소 값 없음 |
| `case03_prepRequired` = `attendance_only` | 지정된 날짜에 출석하면 됨 | slug만. 날짜 없음 |

`uncertain` · `period_stated` · `not_stated` · `unsure` · `when_attend`는 날짜를 모른다고 답한다. 날짜 값이 없는 것이 이 버그는 아니다.

`effectiveDate` 프로파일 칸은 CASE_03 답으로 채워지지 않는다.

---

*2026-09-25. CASE_06 `deadline_pay_by_date` · `exact_amount_known` · `date_place_method_known` · `exact_effective_date`와 같은 유형. 코드 미변경.*
