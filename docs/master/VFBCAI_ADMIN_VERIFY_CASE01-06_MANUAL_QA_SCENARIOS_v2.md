# Admin VERIFY CASE_01~06 — 통합 수동 검사 고정 시나리오 v2.1

| 항목 | 내용 |
|------|------|
| **버전** | v2.1 (v2 대체) |
| **용도** | 사람 **직접 클릭** 검사 · **CASE당 30분** 목표 |
| **금지** | 자동화·스크립트·코드 수정 |
| **URL** | `https://<HOST>/verify/admin` |
| **Q1** | `adminCaseDocumentKind` (`adminVerifyProfiling.ts` ~93–115) |
| **CASE_01 질문 SoT** | `VFBCAI_CASE01_RATIO_REMEDIATION_QUESTION_BRIEF_v3.md` |
| **CASE_02 질문 SoT** | `VFBCAI_CASE02_RATIO_REMEDIATION_QUESTION_BRIEF_v3.md` (`32ea12d` 계열) |
| **CASE_06 출시 SoT** | `VFBCAI_CASE06_LAUNCH_SIMPLIFIED_BRIEF_v1.md` (`42f2019`) |

**퍼널 (CASE_01~05):** Phase1 → **【대표 직접 클릭】** 간이 증거(경로 라) → 가입 → **1차 결과** → Phase2 → **2차 결과**.

**퍼널 (CASE_06 출시):** Phase1만 → 간이 증거(라) → 가입 → **간소화 1차 결과** → **전문가 진행하기** (Phase2·2차 결과 **없음**).

---

## A. 확정 판정 규칙 (모든 CASE)

### A.1 결과 화면

| # | 규칙 | FAIL 예 |
|---|------|---------|
| R1 | **응답 요약** = 고객 **직접 입력값**(날짜·금액·장소·text·DI note·보조 입력칸) + `첨부 자료: {파일명}` 만. **선택지 라벨 문장은 요약에 없음** | 요약에 「벌금을 납부하라」 등 번호 카드 라벨만 반복 |
| R2 | 입력한 **고유 문장·날짜·금액 원문**이 결과 **어딘가에 최소 1회** 그대로 보임 | `CASE05-MANUAL-DEADLINE-…` 입력했는데 요약에 없음 |
| R3 | 선택지 라벨은 **카드/필드에 짧게 1회**. **동일 문장이 여러 섹션에 반복**되면 FAIL | 주의·요약·미확인에 같은 문장 3회 |
| R4 | **문장 깨짐** FAIL — `…입니다 입니다`, `…했습니다. 상태로` 등 | |
| R5 | **카드 제목 ≠ 내용** FAIL | 제목 「기한」 본문 「납부 방법」 |
| R6 | **판단 문장이 선택과 반대** FAIL | 답 「아직 연락 안 함」 → 「대응한 이력이 있음」 |

### A.2 질문 흐름

| # | 규칙 |
|---|------|
| Q1 | **2차 실질 질문 수 > 1차 실질 질문 수** (화면에서 Phase2 choice 질문 개수가 Phase1보다 많아야 함) |
| Q2 | **1차·2차에서 목표(confirmGoal / finalGoal / re_goal 등)를 두 번 묻지 않음** |
| Q3 | **같은 신호 반복 금지** — 예: 「통역 필요」「제3자에게 들음」이 **여러 질문**에서 같은 의미로 다시 묻지 않음 (CASE_01: **K `languageAccessFact` 단일**, L에 제3자 선택지 없음 — Brief v3) |

**CASE_06 출시 예외 (A안):** 출시판 CASE_06은 대표 결정(2026-09-25, A안)에 따라 **2차 질문이 없는** 전문가 연결 전용 흐름이며, **Q1의 의도된 예외**다. 출시 후 재설계에서 해소한다. (§H)

### A.3 공통

| # | 규칙 |
|---|------|
| U1 | 내부 **slug** UI 노출 없음 |
| U2 | PC + **375px** 각 1회 레이아웃·줄바꿈 확인 |
| **P10** | 검사는 **검사 대상 git 커밋**을 체크아웃한 **별도 worktree·서버**에서 수행. **QA 보고서에 검사 커밋 해시 필수** (로컬 미커밋·다른 브랜치로 검사 금지) |

---

## B. 경로 종류 (CASE마다 4개)

| 코드 | 이름 | 목적 |
|------|------|------|
| **가** | 풀 체인 | 번호 선택으로 Phase1·Phase2 끝까지 (**CASE_06:** Phase1·전문가 CTA까지) |
| **나** | 직접 입력(other) | 하단 DI + **CASE 고유 note** |
| **다** | 입력칸 일부 비움 | text/note 비우면 **진행 불가**여야 PASS |
| **라** | 파일 업로드 | **【대표 직접 클릭】** 아래 파일명으로 1건 업로드 |

업로드 파일명: `CASE0X-UPLOAD-REPRESENTATIVE.pdf` (X=1~6).

---

## C. CASE_01 — Brief v3 조합 **#2** (`has_responded` × payment × `date_place_wrong`)

| | |
|--|--|
| **Q1** | `violation_notice` |
| **P1 (5)** | `violationContent` → `factRelationship`(**날짜·장소 다름**) → `customerResponded`(**이미 대응함**) → `deadline` → `confirmGoal` |
| **P2 기대 축 (v3 #2)** | A,B,**C,D**,G,H,**E,Ff**,**P** — **9 실질** (Brief §5 행 #2) |
| **금지 확인** | `no_contact`용 **L/Q/O**가 이 경로에 **안 나옴**. **제3자·간접**은 **K만** (L에 제3자 선택지 없음) |

### 가 — 풀 체인 (#2)

| 단계 | 입력 (화면에서 클릭) |
|------|----------------------|
| P1 | 위반: 교통위반류 · 사실: **날짜·장소가 다름** · 대응: **이미 대응함** · 기한: **확인함** · 목표: **사유 이해** (confirmGoal **1회만**) |
| P1 text | 기한 text: **`CASE01-V3-DATE-2026-08-12`** |
| 라 | **【대표 직접 클릭】** `CASE01-UPLOAD-REPRESENTATIVE.pdf` |
| 1차 | 결과 체크리스트 **§D1** |
| P2 | 열리는 질문 순서대로: 요구·사실·**conflict facet(C)**·**spatiotemporal(D)**·증거·막힘·**responseDetail(E)**·followUp·**paymentInstruction(P)** 등 — **스킵 없이** |
| P2 text / 보조 | conflict `conflict_other` 등 DI note **`CASE01-V3-DI-CONFLICT-고유BETA`** · 시공간(D) 등 text 요구 시 **`CASE01-V3-PLACE-다낭시하이쩌우`** |
| 2차 | 결과 체크리스트 **§D1** |

### 나 — DI

| | |
|--|--|
| P1-1 | 위반 **직접 설명** → **`CASE01-V3-DI-VIOLATION-고유ALPHA`** (`violationContentNote` 등 보조 입력칸) |
| P2 | `conflict_other` 등 **직접 설명** → **`CASE01-V3-DI-CONFLICT-고유BETA`** |
| 라 | 생략 가능(가와 별도 세션) 또는 동일 파일명 |

### 다 — 비움

| | |
|--|--|
| | P1 기한 text **`CASE01-V3-DATE-…` 비움** → Phase1/2 **완료 불가** (예) |
| | 또는 P2 필수 text / DI **note 비움** → 다음 불가 (예) |

### 라 — 업로드 중심

| | |
|--|--|
| | (가)와 동일하되 Phase1 증거 단계에서만 **【대표 직접 클릭】** `CASE01-UPLOAD-REPRESENTATIVE.pdf` |
| | 1차 요약에 **`첨부 자료: CASE01-UPLOAD-REPRESENTATIVE.pdf`** (또는 표시 정책에 맞는 파일명) |

### §D1 CASE_01 체크 (예/아니오)

| # | 항목 | 예 |
|---|------|-----|
| 1 | Q1: Phase2 질문 수 > Phase1 질문 수 | |
| 2 | confirmGoal을 2차에서 다시 묻지 않음 | |
| 3 | 「통역/제3자」가 L·P1·K에 **중복**되지 않음 (K만) | |
| 4 | 응답 요약에 **라벨 문장 없음**, 직접 입력·첨부만 | |
| 5 | `CASE01-V3-DATE-…` / DI / PLACE / **보조 입력칸(note·R3 text) 원문**이 **응답 요약(또는 R2 허용 영역)**에 **≥1회** | |
| 6 | R3~R6 (반복·깨짐·제목·반대 의미) 통과 | |
| 7 | (다) 비움 시 진행 막힘 | |

**30분 팁:** 가만 전부 예 → 나·다·라는 동일 CASE 새 세션에서 각 5~7분.

---

## D. CASE_02 — Brief v3 · timing 조합 **#3** (`unpaid` × `match` × `how_when_where`)

| | |
|--|--|
| **Q1** | `payment_demand` |
| **P1 (6)** | subject → infoSource → situationMatch(**맞음**) → paymentAmount → paymentStatus(**미납**) → confirmGoal(**언제·어디·어떻게 납부** — `how_when_where`) |
| **P2 기대 (Brief v3 §5 #3)** | Dl, Dd, Pm, Np, Bl, **Ev**, **Cf** — **7 실질** (Ch **없음**) |
| **필수 확인** | **`case02_evidence`(Ev)** · **`case02_paymentConfirmationFact`(Cf)** 화면에 **실제로 노출·응답** (timing 경로) |

### 가 — 풀 체인 (#3 + Ev/Cf)

| 단계 | 입력 |
|------|------|
| P1 | 납부 대상·출처·상황 **일치** · 금액 **정확히 앎** → text **`CASE02-V3-AMOUNT-2500000VND`** · **미납** · 목표 **언제·어디·어떻게** |
| 라 | **【대표 직접 클릭】** `CASE02-UPLOAD-REPRESENTATIVE.pdf` |
| 1차 | §D2 |
| P2 | 기한·방법(Pm)·미납 안내 등 Brief 축 순서대로 · **증거(Ev)** 1선택 · **납부 확인 방법(Cf)** 1선택 (예: `cf_receipt_official` 또는 `cf_no_instruction`) |
| 2차 | §D2 |

### 나 — DI

| | |
|--|--|
| | subject **직접 입력** → **`CASE02-V3-DI-SUBJECT-GAMMA`** · 목표는 timing 유지 시 **Ev·Cf**까지 (가)와 동일 세션에서 확인 |

### 다 — 비움

| | |
|--|--|
| | amount text 또는 DI **note 비움** → 불가 (예) |

### 라 — 업로드

| | |
|--|--|
| | (가)와 동일 파일명 · 요약에 첨부 표시 |

### §D2 체크

| # | 항목 | 예 |
|---|------|-----|
| 1 | P2 > P1 질문 수 | |
| 2 | confirmGoal **1회** (2차 재질문 없음) | |
| 3 | 동일 신호 반복 없음 (**Ch 노출 없음** — v3 삭제) | |
| 4~6 | A.1 R1~R6 | |
| 7 | `CASE02-V3-AMOUNT-…` 또는 DI 원문 ≥1 | |
| 8 | 첨부 파일명 요약 표시 | |
| 9 | P2에서 **Ev·Cf** 질문이 **노출되고 답함** (timing 경로) | |

---

## E. CASE_03 — 출석 (`attendance_demand`)

| **가** | 출석 요구 · 초점 일시·장소 · **출석함** · 목표 · `specific_date` · P2 전부 · text **`CASE03-V2-ATTEND-PLACE-호치민`** · 라 `CASE03-UPLOAD-REPRESENTATIVE.pdf` |
| **나** | demand DI **`CASE03-V2-DI-DEMAND-EPSILON`** |
| **다** | explanationDetail(또는 필수 text) **비움** |
| **라** | 업로드 + (가) 축약 |

### §D3 체크 — §D2와 동일 8항 (`CASE03-V2-…`) · P10

---

## F. CASE_04 — 보완 (`supplement_demand`)

| **가** | 대상 추가서류 · 목표 · 일부제출 · `specific_date` · P2 전부 · **`CASE04-V2-DOCDETAIL-보완목록`** · 라 `CASE04-UPLOAD-REPRESENTATIVE.pdf` |
| **나** | target DI **`CASE04-V2-DI-TARGET-ZETA`** |
| **다** | `specific_date` 후 **날짜 text 비움** → 불가 (구현 시) |
| **라** | 업로드 중심 |

### §D4 체크 — §D2와 동일 8항 · P10

---

## G. CASE_05 — 처분 (`disposition_notice`)

| **가** | 거부/취소류 · 사유 이해 · 문의함 · `specific_date` · **`CASE05-V2-DEADLINE-2026-09-01`** · P2 factRelationship~ · 라 `CASE05-UPLOAD-REPRESENTATIVE.pdf` |
| **나** | disposition DI **`CASE05-V2-DI-DISP-ETA`** |
| **다** | `case05_deadlineDate` **비움** → 불가 |
| **라** | 업로드 |

### §D5 체크 — §D2와 동일 8항 (`CASE05-V2-DEADLINE-…` 필수) · P10

---

## H. CASE_06 — 출시 간소화 (`unclear`) · `42f2019`

> **출시판 CASE_06은 대표 결정(2026-09-25, A안)에 따라 2차 질문이 없는 전문가 연결 전용 흐름이며, 「2차 실질 질문 > 1차」 규칙의 의도된 예외다. 출시 후 재설계에서 해소한다.**

| | |
|--|--|
| **P1** | v1.1 **5문항만** (`case06_requiredActionCandidate` ~ `case06_customerResponse`) |
| **Phase2** | **0개 정상** (체인·브릿지 **없음**) |
| **결과** | 입력 요약 + 전문가 필요 이유 · **AI 판단 문장 없음** · **전문가 진행하기** 단일 CTA (AI 리포트 없음) |

### 가 — LAUNCH 풀

| 단계 | 입력 |
|------|------|
| Q1 | `unclear` |
| P1 | `problem_action_unclear` · P1-2~5 번호 선택 |
| P1-4 | `deadline_submit_by_date` → text **`CASE06-LAUNCH-DEADLINE-2026-11-15`** |
| 라 | **【대표 직접 클릭】** `CASE06-UPLOAD-REPRESENTATIVE.pdf` |
| 가입 | Master 가입 |
| 결과 | §D6 · **「전문가 진행하기」** → CRM 접수·접수 완료(도장/마이페이지) |

### 나 — DI

| | |
|--|--|
| | P1-1 DI note **`CASE06-LAUNCH-DI-ACTION-OMEGA`** · 나머지 P1 번호 |

### 다 — 비움

| | |
|--|--|
| | P1-4 날짜 slug 선택 후 **`case06_deadlineDate` 비움** → **진행 불가** (예) |

### 라 — 업로드

| | |
|--|--|
| | P1 완료 + **`첨부 자료: CASE06-UPLOAD-REPRESENTATIVE.pdf`** in 요약 |

### §D6 체크 — 출시판 10항 (예/아니오)

| # | 항목 | 예 |
|---|------|-----|
| 1 | Phase1 **5문항만** · Phase2 체인 질문 **없음** | |
| 2 | **R1** 응답 요약 = 직접 입력 + 첨부 (선택지 라벨만 요약 **아님**) | |
| 3 | **R2** `CASE06-LAUNCH-*` 원문 **≥1회** | |
| 4 | **R3·R4·R5** 통과 | |
| 5 | **AI 판단·판정 문장 블록 없음** | |
| 6 | **가격·확정 표현 없음** | |
| 7 | 「여러 요구·특정 어려움」**전문가 필요 이유** 문단 표시 | |
| 8 | **AI 리포트 CTA 없음** · **전문가 진행하기**만 | |
| 9 | 전문가 클릭 후 **CRM 접수·접수 완료** 기존 흐름 | |
| 10 | **case02_* 등 타 CASE 필드 복사 UI 없음** | |

**Q1:** CASE_06은 항목 1이 **예**이면 Q1 규칙 **예외 적용** (A.2).

---

## I. 실행 매트릭스 (검사자 · 30분/CASE)

| CASE | 가 | 나 | 다 | 라 | §D | PC | 375 | 검사 커밋 (P10) |
|------|----|----|----|----|-----|-----|-----|-----------------|
| 01 | ☐ | ☐ | ☐ | ☐ | D1 전항 예 | ☐ | ☐ | `________________` |
| 02 | ☐ | ☐ | ☐ | ☐ | D2 전항 예 | ☐ | ☐ | `________________` |
| 03 | ☐ | ☐ | ☐ | ☐ | D3 | ☐ | ☐ | `________________` |
| 04 | ☐ | ☐ | ☐ | ☐ | D4 | ☐ | ☐ | `________________` |
| 05 | ☐ | ☐ | ☐ | ☐ | D5 | ☐ | ☐ | `________________` |
| 06 | ☐ | ☐ | ☐ | ☐ | D6 전항 예 | ☐ | ☐ | `________________` |

**CASE PASS:** 해당 §D **전항 예** + 가·나·다·라 **4경로 완료** (다는 「막힘 확인」만으로도 경로 완료).

**전체 PASS:** 6 CASE 모두 PASS · **동일 검사 커밋**으로 수행(P10).

---

## J. 참고

- v2: 동일 파일명 · v2.1로 갱신 (2026-09-25)
- v1: `VFBCAI_ADMIN_VERIFY_CASE01-06_MANUAL_QA_SCENARIOS_v1.md` (폐기)
- CASE_06 출시: `VFBCAI_CASE06_LAUNCH_SIMPLIFIED_BRIEF_v1.md`
- Handoff: `VFBCAI_ADMIN_CASE0506_AUDIT_FINDINGS_HANDOFF_v2.md`
- UI: `.cursor/rules/06-ui-design-responsive-typography-qa.mdc`

---

*v2.1 · 2026-09-25 · 문서만 · push 없음*
