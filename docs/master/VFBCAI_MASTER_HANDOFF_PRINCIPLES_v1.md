# VFBCAI 현재 개발 인계 지시 (Master Handoff Principles) v1.0

| 항목 | 내용 |
|------|------|
| **용도** | CASE_03 / CASE_04 / CASE_05 및 이후 **VERIFY** 서비스(행정문서 Admin Master, 부동산, 사기, 세무, 불명확 등) 작업의 **상위 원칙** |
| **관계** | `docs/VFBCAI_CONSTITUTION.md` · `VFBCAI_REUSABLE_PATTERNS_CHECKLIST_v1.md` · `VFBCAI_CASE_AUDIT_CHECKLIST_v1.md` 하위 실행 기준 |
| **갱신** | 2026-09-24 (Ace 인계 지시 반영) |

---

## 1. 확립된 뼈대 — 재설계 금지

**Admin Master / CASE_06** 및 공통 VERIFY Master funnel의 다음 축은 **이미 확립**된 것으로 취급한다. Mission 범위에서 **재설계·대체·순서 변경**하지 않는다.

- Phase1(Skeleton) / Phase2(Investigative deepening) 역할 분리  
- Adaptive chain · `needs*` · `caseNNPathFieldsComplete` · STOP  
- Q1 entry · Profile 재분류 · `getEffectiveAdminVerifyCase`  
- CASE_06 bridge · snapshot · native CASE handoff  
- Evidence gate · signup · 1차/2차 Result · persistence / `restore`  
- Canonical funnel (간단자료 → 가입 → 결과 → 개인화 상세검토 → 2차 → AI Report / Expert)

구조 변경이 필요해 보이면 **Root Cause 조사 → Brief → Ace 승인** 후에만 IMPLEMENTER 착수.

---

## 2. CASE_03 / 04 / 05 = Adapter (재개발 아님)

네이티브 CASE_03·04·05 작업은 **재개발**이 아니라 **Adapter** 작업이다.

- **공통 Master 엔진** (`adminVerifyProfiling.ts` 계열, Question builder, Profile, Focus, pathComplete, Result 연결)은 유지  
- **도메인별로 연결하는 것:** fieldId · 라벨 · 옵션 slug · `needs*` 게이트 · classify 신호 · Result 시그널  
- CASE마다 **독립 질문 체계·새 namespace**를 만들지 않는다 (Master Skill § EXPERT INVESTIGATIVE PROFILING)

---

## 3. 정합성 수정 — 계속 진행 (재설계가 아님)

STEP1/STEP2에서 확인된 **설계 drift·버그**는 Adapter 범위 안에서 **정합성 수정**으로 계속 진행한다. 다음은 **재설계가 아니다.**

- 라벨–필드 의미 불일치 (예: MASTER Q2 문구 vs `confirmGoal` 옵션 축)  
- 죽은 필드 · classify-only slug · FOCUS–append 불일치  
- DI 누락 · `other`+note 경로 단절 · raw/effective slug 불일치  
- harness와 product SoT 불일치 (**§6** — harness만 수정)

수정 시 **최소 diff** · CASE Audit + Reusable Patterns 체크리스트 준수.

---

## 4. 공통 컴포넌트 — 한 번 고치면 전체 재사용

다음은 **CASE Adapter가 아닌 공통 Master / UI** 레이어다. 문제 발견 시 **공통 레벨에서 한 번** 수정한다.

- Admin / RE Master layout · question rail · CTA 정책 (`hideVerifyMasterQuestionRailCtas` 등)  
- Entry Q1 · DI 렌더링 (numbered grid vs 하단 DI 블록) · `ADMIN_DIRECT_EXPLAIN_CHOICE`  
- 공용 choice complete · note key · persist meta  
- Member handoff terminal exit · loading / signup retry

한 CASE만을 위한 CSS/가드 **중복 추가**는 지양한다.

---

## 5. 문제 발견 시 — 먼저 4분류

조사·수정 전에 아래 중 **무엇인지** 먼저 분리한다. (잘못된 레이어 수정 = 회귀·낭비)

| 분류 | 예시 | 대응 |
|------|------|------|
| **공통 Master 문제** | pathComplete vs effective case 불일치, bridge 게이트, DI 공통 규칙 | 공통 함수·UI · Verified Lesson |
| **특정 Adapter 문제** | CASE_04 `confirmGoal` 라벨 drift, CASE_05 phantom field | 해당 `caseNN_*` · classify · Result만 |
| **데이터 문제** | meta/restore slug, RLS, API — **본 인계 범위 밖**은 Human Boundary |
| **Harness 문제** | strict trace plan·assert·seed가 product SoT와 불일치 | `tests/qa/*` — product 우회 금지 |

보고·Mission Brief에 분류를 **명시**한다 (`03-qa-self-loop.mdc` · Reusable Patterns §6).

---

## 6. 작업 순서 (권장)

1. STEP1 조사 (코드 미변경) · DQ + 권장안 · 패턴 체크  
2. STEP2-0 설계 매핑 (코드 미변경) · Ace 승인  
3. STEP2-1 Adapter 구현 · `tsc` · product Browser (LEVEL 3) · harness 정합  
4. CASE Audit A~H · Lesson sync (PASS 후)

동일 파일 동시 수정이 겹치면 **CASE 순차 구현** (예: CASE_03 STEP2-1 완료 후 CASE_04 STEP2-1).

---

## 7. VERIFY 서비스 확장

부동산 / 사기 / 세무 / 불명확 등 **다른 VERIFY** 포트도 동일 원칙을 따른다.

- Admin Master에서 검증된 funnel·handoff·UI 패턴을 **복사하되**, 서비스별 질문 라이브러리는 **각 도메인 Adapter**로 연결  
- Admin과 코드가 비슷해 보여도 **임의 동기화·일괄 복사**하지 않고, 실제 구현을 조사한 뒤 최소 변경

---

*본 문서는 VFBCAI 플랫폼 오픈(2026-10) 병렬 CASE 작업 인계 기준이다.*
