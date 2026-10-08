# CASE_04 Information Completeness Audit

| 항목 | 내용 |
|------|------|
| **기준** | `VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md` LOCK (fa4cce9) |
| **증거** | LEVEL 1. `adminVerifyProfiling.ts`, `AdminVerifyFirstResultPanel.tsx` |
| **코드** | 수정 없음 |

Phase1은 4개다. `supplementTarget`, `confirmGoal`, `customerResponse`, `deadline`. Phase2는 최초 제출, 제출 관계(항상), 보완 사유, 대상별 상세, 기관 후속, 반복, 막힘, 증거, 최종목표.

## 판정

### ① 정보완결성 — FAIL

보완 날짜가 값으로 안 남고, 당사자가 없다. 추가 서류·수정·증빙 상세(`addDocDetail`, `modifyDetail`, `evidenceDetail`)는 저장만 되고 결과 문장으로 안 간다. 질문을 마쳐도 「언제까지, 무엇을」의 실값이 비는 경로가 있다.

### ② 다중신호성 — FAIL

기한 미확인 4개, 상세 질문의 값, 막힘·증거·최종목표, 반복 내용 선택지는 라벨만 바뀐다.

### ③ 선택지 판별력 — FAIL

다른 라벨이 같은 결과로 합쳐진다. 기한 미확인 4개, `understand_materials`/`prepare_materials`, `more_supplement`/`more_docs`, 반복 내용 선택지.

### ④ 비장식성 — FAIL

질문 전체 장식: `addDocDetail`, `modifyDetail`, `evidenceDetail`, `unclearFocus`, `blockage`, `evidence`, `finalGoal`.

### ⑤ 직접입력 의존성 — PASS

정상 경로의 보완 대상·목표·대응·기한 상태·제출 관계는 대표 선택지로 채워진다. 날짜가 비는 것은 ①이다.

### 1차 vs 2차 — 1차 < 2차 (PASS 후보). 실질 축 4:5. 하한 FAIL

| 구분 | 질문 |
|------|------|
| 1차 실질 4 | `supplementTarget`, `confirmGoal`, `customerResponse`, `deadline` |
| 2차 실질 5 | `initialSubmission`, `submissionRelation`, `supplementReason`, `authorityFollowUp`, `repeatSupplement` |
| 2차 장식 | `addDocDetail`, `modifyDetail`, `evidenceDetail`, `unclearFocus`, `blockage`, `evidence`, `finalGoal` |

1차 4축 위에 최초 제출, 제출 관계, 보완 사유, 기관 후속, 반복이 더해져 정보 밀도는 1차 < 2차다. 이 부등식만 PASS 후보다. 실질 축 4:5는 하한 4:6보다 2차가 얕아 FAIL이다. ①~④ FAIL은 따로 남는다.

---

# 데이터 손실 버그 (기한·날짜)

| 항목 | 내용 |
|------|------|
| **범위** | CASE_06에서 나온 「날짜·금액·장소를 답해도 Profile에 값이 없는」 패턴만 점검 |
| **증거** | LEVEL 1. `adminVerifyProfiling.ts`, `AdminVerifyFirstResultPanel.tsx` `buildCase04IntegratedSituation` |
| **코드** | 수정 없음 |

CASE_04 질문 체인에 `kind: "text"` 후속 입력은 없다. 금액 질문도 없고, 장소를 묻는 선택지도 없다.

## 데이터 손실 버그

| 선택 | 라벨이 말하는 사실 | Profile·결과에 남는 것 |
|------|-------------------|------------------------|
| `case04_deadline` = `specific_date` | 보완 날짜를 확인함 | slug `specific_date`와 선택지 문장만. 날짜 문자열 필드 없음. `deadline` 칸은 「보완해야 하는 날짜를 확인했습니다.」 통합문은 「보완 제출 기한은 확인된 상태입니다.」 날짜 없음 |
| `case04_deadline` = `other` + note | 고객이 적은 기한 문장 | Profile `deadline`은 `getCase04FieldOptionLabel`만 사용. note는 기한 칸으로 복사되지 않음 |

`uncertain` · `period_stated` · `not_stated` · `unsure` · blockage `deadline`은 기한을 모른다고 답한다. 날짜 값이 없는 것이 이 버그는 아니다.

`effectiveDate` 프로파일 칸은 CASE_04 답으로 채워지지 않는다.

---

*2026-09-25. CASE_05 `specific_date`, CASE_06 `deadline_pay_by_date`와 같은 유형. 코드 미변경.*
