# CASE_06 — LOCK 결정 로그 v1.0

| 항목 | 내용 |
|------|------|
| **STATUS** | **LOCKED** |
| **승인** | Ace — STEP2-1 최종 확인 완료 (2026-09-23) |
| **범위** | VERIFY → 행정문서 `CASE_06` (재설계 v1.1 + STEP2-1 브릿지·persist·하네스 정합) |
| **SoT (구현)** | `docs/master/VFBCAI_CASE06_MASTER_REDESIGN_v1.1.md` · `docs/master/VFBCAI_CASE06_DESIGN_DECISIONS_v1.1.md` |
| **감사 기준** | `docs/master/VFBCAI_CASE_AUDIT_CHECKLIST_v1.md` A~H |

---

## 검증 기록 (LOCK 시점)

| 검증 | 결과 | 근거 |
|------|------|------|
| Strict full v2 | `lockReady: true` | `tests/qa/_strict-v2-lock-final.json` → `LOCK_READINESS` |
| CASE_06 체인 ②③④⑤ | `finalPathComplete: true` 각각 | 동일 JSON `coreCases.CASE_06_CHAIN_*` |
| CASE_06_E (원칙 2) | `finalPathComplete: true` | `coreCases.CASE_06_E` |
| Engine / label | `engineMismatchCount: 0`, `labelAssertFailCount: 0` | 동일 |
| Persist slug audit | `persistSlugPassAll: true` | 동일 (DQ1 키·노트 포함) |
| TypeScript | `npx tsc --noEmit` | STEP2-1 완료 시점 PASS |
| **Lesson Governance (파일)** | Master Skill § Verified Lessons **12–17** (CASE_06) | `.cursor/skills/vfbcai-master-development/SKILL.md` |
| **Lesson Governance (git)** | LOCK 시점 커밋에 Skill·거버넌스 diff 포함 필요 | `VFBCAI_CASE_AUDIT_CHECKLIST_v1` LOCK 절 — Ace 확인 후 commit |

**회귀 범위 (LOCK 전 확인):** standalone `CASE_01` / `CASE_02` / `CASE_04` / `CASE_05` — 브릿지 분기는 `isCase06BridgedToNativeCase`가 Q1=`CASE_06` + 브릿지 커밋 후에만 활성.

---

## 핵심 확정 결정 (원칙 → 결정 → 이유)

### D1. 재분류 원칙 2 — target 값-질문 시딩 제거

- **원칙:** `VFBCAI_CASE06_MASTER_REDESIGN_v1.1` 재분류 원칙 2 — CASE_06에서 모은 정보는 **상태·맥락**이며, target CASE의 **값-질문을 스킵·자동 채우지 않음**.
- **결정:** `seedCase02AnswersFromCase06Handoff`가 `case02_deadline` 등을 `"confirmed"` 등으로 채워 Phase2 질문이 생략되던 동작을 **제거**. handoff는 체인 STOP + 브릿지 커밋 이후에도 **answers를 변경하지 않고** 반환.
- **이유:** Ace 확정 — 게이트 버그가 아니라 원칙 2 위반이었음. 사용자는 target CASE 마감·금액 등 **값**을 반드시 확인해야 함.
- **코드:** `src/lib/adminVerifyProfiling.ts` — `seedCase02AnswersFromCase06Handoff`.

### D2. Classification vs Active Question Case 분리 (DQ11 정합)

- **원칙:** Q1은 Canonical Funnel상 `CASE_06` 유지. 재분류는 Result·Profile·후속 라우팅에 쓰이는 **classification**과, 화면에 노출되는 **질문 세트(active question case)** 를 혼동하지 않음.
- **결정:** Phase2에서 CASE_06 재설계 체인이 STOP에 도달하기 전에는 **CASE_06 체인 질문**을 우선 노출. `getAdminVerifyActiveQuestionCase` / `isCase06Phase2ChainComplete`로 완료 판정.
- **이유:** STEP2-0 trace — 재분류 확정 직후 target 네이티브 Phase2로 점프하면 CASE_06 심화 체인이 0건 실행되는 구조적 결함.
- **코드:** `adminVerifyProfiling.ts` — `getAdminVerifyActiveQuestionCase`, `isAdminVerifyPhase2PathComplete` (Q1=CASE_06 분기).

### D3. 체인 STOP 후 브릿지 체크포인트 → target 네이티브 진입

- **원칙:** 체인①~④는 CASE_06 **전용 Phase2**로 완주한 뒤, target CASE로 **이어지는 개인화 상세검토**는 Canonical Funnel의 네이티브 경로를 따름 (DQ5/DQ6 + STEP2-1 브릿지 UX).
- **결정:** `isCase06AwaitingBridgeSnapshot` / `applyCase06BridgeSnapshot` — 체인 완료 후 사용자 확인(체크포인트) 후 `case06_bridgeSnapshotCommitted` 등으로 네이티브 CASE_02~05 질문 세트 진입.
- **이유:** 재분류 candidate를 Profile에 반영한 뒤, target 도메인 질문으로 전환 시 **단절·질문 flash** 없이 handoff.
- **코드:** `src/lib/adminVerifyCase06Redesign.ts` — bridge snapshot API.

### D4. 브릿지 후 target Phase1 선행 노출 (②→03, ③→04, ④→05)

- **원칙:** Phase2 = Phase1 Known 기반 심화. 브릿지만으로 Phase1 필드가 채워진 것으로 간주하면 **NEVER ASK AGAIN** 역전·게이트 영구 false.
- **결정:** `isCase06BridgedToNativeCase(answers, nativeCase)`일 때 `appendCase03/04/05PathQuestions`가 **Phase1(`appendCase05Phase1Questions` 등)을 Phase2 append 전에** 실행. `case05PathFieldsComplete` 등 Phase1 완료 조건과 정합.
- **이유:** LOCK 전 ②③④ `finalPathComplete: false` — 제품이 Phase2만 append하고 Phase1 gate는 미충족 (CASE_02 reclass 패턴과 동일 클래스).
- **코드:** `adminVerifyProfiling.ts` — `appendCase05PathQuestions` ( 및 03/04 동형).

### D5. DQ1 — slug·노트 persist (CRM meta)

- **원칙:** DQ1 — 구현 전 매핑 표 보고 후 persist; Direct Input 노트는 choice note key와 함께 복원 가능해야 함.
- **결정:** `CASE06_V11_PERSIST_ANSWER_KEYS` + `CASE06_V11_ANSWER_NOTE_KEYS`를 `CASE06_ANSWER_KEYS` / `buildAdminVerifyAnswersPersistMeta` 경로에 연결. strict runner `buildPersistSlugAudit`으로 sim slug → persist → restore → effective label 검증.
- **이유:** LOCK readiness에 `persistSlugPassAll` 필수; 체인·DI 응답이 재진입·메타에 유실되면 Case continuity 깨짐.
- **코드:** `adminVerifyCase06Redesign.ts`, `adminVerifyProfiling.ts`; `tests/qa/admin-verify-strict-full-v2.mjs`.

### D6. CHAIN_05 `LABEL_ASSERT_FAIL` — 하네스(타이밍/DI), 제품 회귀 아님

- **원칙:** Product vs Harness 구분 (`05-vfbcai-ai-dev-team` · audit checklist F).
- **결정:** recheck 체인 DQ2 DI — 패널 오픈만 하고 노트 미커밋·`다음` disabled 상태에서 sim이 진행된 **하네스 결함**. 버튼 매칭·`keyboard.type`·커밋 대기 수정. 제품 stuck on recheck로 분류하지 않음.
- **이유:** 캡처 `tests/qa/_chain05-capture/label-fail-case06_unclearFactRelation.json` — empty textarea, disabled next.
- **근거:** 수정 후 `tests/qa/_chain05-pass.json` 및 full lock run 0건.

---

## LOCK 후 변경 금지 (요약)

- CASE_06 v1.1 Phase1 5문항·5체인 문구·순서·옵션 개수(내용 5 + DI 1) 임의 변경.
- D1~D4 분기 순서 역전 (체인 미완료 시 target 네이티브 점프, 브릿지 없는 handoff, Phase1 생략).
- `CASE_06` LOCK 범위 밖에서 CASE_05 네이티브를 CASE_06 템플릿으로 일괄 교체.

**의도적 미포함 / 별도 Mission:** CASE_05~01 standalone 고도화, DQ4 체인별 이관 스킵 전면 확정, Production 배포.

---

## 관련 파일 (frozen 참조)

| 영역 | 경로 |
|------|------|
| CASE_06 redesign | `src/lib/adminVerifyCase06Redesign.ts` |
| Profiling · bridge · persist | `src/lib/adminVerifyProfiling.ts` |
| Strict QA | `tests/qa/admin-verify-strict-full-v2.mjs`, `tests/qa/_strict-v2-lock-final.json` |
| 설계 | `docs/master/VFBCAI_CASE06_MASTER_REDESIGN_v1.1.md`, `VFBCAI_CASE06_DESIGN_DECISIONS_v1.1.md` |

---

*형식: CASE_02 LOCK 시 사용한 「결정 로그」 패턴(승인·검증·원칙별 결정·frozen scope)과 동일 계열. CASE_02 전용 파일이 repo에 없으면 본 문서를 CASE_06 LOCK 템플릿으로 사용.*
