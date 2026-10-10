# [서비스 이름] VERIFY 콘텐츠 양식

이 파일은 확정 콘텐츠 파일의 제목·표·필드 구조만 남긴 빈 양식이다. 문장·질문·선택지·수치는 비워 두었다.

---

# 작성 규칙

아래는 원문이다. 줄 끝의 출처 표시만 덧붙였다.

## 9. 질문·선택지 설계 표준

■ 9. 질문·선택지 설계 표준 (모든 서비스 공통, 대표 확정) 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9〕
9-1. 플랫폼 목적 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-1〕
- VFBCAI의 목적은 베트남어를 전혀 모르는 외국인이 각 항목을 처리할 때 가장 많이 겪는 문제를, 아주 디테일하고 정확하게 최대한 많이 정보로 축적하는 것이다. 이 축적이 독보적인 플랫폼의 근거다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-1〕
- 마지막 리포트는 이 정보를 최대한 많이, 디테일하고 정확하게 뽑아 제공한다. 그것이 고객 신뢰의 근거다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-1〕
- 질문이나 선택지의 개수를 늘리는 것이 목표가 아니다. 질문 하나, 선택지 하나에서 얻는 정보의 정밀도와 깊이(정보 밀도)를 높이는 것이 목표다. 개수는 4~5개 + 직접입력(3절)을 유지한다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-1〕
9-2. 대상 고객 기준 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-2〕
- 고객은 베트남어를 전혀 모르고 베트남 행정·세무·법률 체계에 익숙하지 않은 외국인이다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-2〕
- 전문가 수준의 프로파일링을 유지하되, 베트남어를 모르는 외국인이 자신의 실제 경험만으로 이해하고 선택할 수 있는 자연스러운 생활 언어로 표현한다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-2〕
- 쉽게 쓰는 것과 정보를 적게 얻는 것은 다르다. 쉬운 표현이어도 얻는 정보는 줄이지 않는다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-2〕
- 전문 용어는 없애지 않는다. 용어와 실제 상황을 함께 적는다. 예: "VAT — 회사에서 물건·서비스를 사고팔며 생기는 세금과 신고 내용을 확인하고 싶습니다." 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-2〕
- 선택지는 고객이 자기 경험을 읽고 자기 상황을 찾는 문장이어야 한다. 저장값(필드 값)은 영문 코드로 분리한다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-2〕
9-3. 질문 2단 정보 구조 (최소 기준) 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-3〕
- 모든 핵심 질문은 최소 2단 정보 구조로 설계한다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-3〕
  ① 상황을 구분하는 정보(대상·종류·단계) 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-3〕
  ② 그 상황을 구체화하는 정보(원인·상태·기한·기관·증거·대응 이력 등) 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-3〕
- 하나의 질문에서 이 두 정보 층을 자연스럽게 함께 수집한다. 그리고 다음 질문은 앞서 확보한 정보에 따라 더 정밀하게 분기한다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-3〕
- 2단 구조는 질문 수를 늘리라는 뜻이 아니다. 질문 한 개당 정보 밀도를 높이라는 뜻이다. "질문을 두 개 만든다"로 해석하지 않는다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-3〕
9-4. 선택지 2단 정보 구조 (최소 기준) 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-4〕
- 선택지 한 문장은 최소 2가지 이상의 정보 층위를 함께 담는다. 예: 대상 + 상황, 사건 + 상태, 상황 + 고객 목적, 상태 + 증거. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-4〕
- 고객이 하나를 선택하면 내부에서 2개 이상의 필드로 분해해 저장한다. 선택 자체가 데이터가 되어야 한다. 선택지마다 "분해 규칙(어느 필드에 어느 값으로 저장하는지)"을 Content Pack에 명시한다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-4〕
- 예: "회사에서 매출이나 매입 거래를 했고, VAT 신고 내용이 실제 거래와 맞는지 확인하고 싶습니다." → 법인 / VAT / 매출·매입 거래 / 신고내용 확인 / 실제 거래 대조 필요, 로 분해 저장. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-4〕
- 같은 정보를 담은 선택지를 중복하지 않는다. 서로 다른 실제 상황을 구분한다. Yes/No 금지. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-4〕
- 한 선택지에 서로 다른 값이 섞여 저장되지 않게, 분해 규칙은 값 1:1로 정의한다(같은 값 = 같은 의미/라벨). 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-4〕
9-5. 외국인이 가장 많이 겪는 문제 반영 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-5〕
- 각 서비스의 질문·선택지는 해당 서비스에서 외국인이 처리 중 실제로 자주 막히는 지점(서류 이해 불가, 기한 모름, 기관 요구 사항 불명확, 비용·절차 불확실, 사기·분쟁 위험 등)을 구분하도록 설계한다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-5〕
- 각 선택지는 "전문가가 이 정보로 실제 판단을 할 수 있는가"를 통과해야 한다(전문가 판단용 정보가 프로파일에 남는다). 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-5〕
9-6. 리포트 연결 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-6〕
- 모든 저장 필드는 리포트에서 다시 쓰인다. 리포트에 쓰이지 않는 필드는 만들지 않는다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-6〕
- 리포트(유료)는 1차 + 2차에서 축적한 정보를 최대한 활용해 디테일하고 정확하게 작성한다. 단정 표현은 피하고 확인된 사실 중심으로 쓴다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-6〕
- 결과 문장의 변수 자리에는 저장값이 아니라 고객용 라벨을 넣는다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-6〕
9-7. 서비스별 Content Pack 작성 시 필수 체크(원문 제출 전 자체 점검) 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-7〕
- [ ] 외국인이 베트남어를 몰라도 이해할 수 있는가 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-7〕
- [ ] 질문 하나가 2단 정보를 담고 다음 질문이 그에 따라 분기하는가 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-7〕
- [ ] 각 선택지가 2가지 이상 정보를 담고 분해 규칙이 명시되었는가 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-7〕
- [ ] 전문가가 판단할 수 있는 정보가 프로파일에 남는가 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-7〕
- [ ] 저장 필드가 모두 리포트에 쓰이는가 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-7〕
- [ ] 고정 문서 3·4절과 충돌하지 않는가 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-7〕
9-8. 적용 범위 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-8〕
- 신규 서비스(세금, 기타/불명확)는 처음부터 이 표준을 적용한다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-8〕
- 이미 구현된 서비스(Admin, 부동산, 사기)에 소급 적용할지는 대표가 따로 지시할 때만 한다. 지시가 없으면 수정하지 않는다. 〔출처: docs/master/VFBCAI_FIXED_CONTEXT.md ■9 9-8〕

## 1차·2차 비율

질문 개수는 1차 40% : 2차 60%가 기본 골격이다. 상황에 따라 질문 수를 제한하거나 건너뛰지 않는다. 어떤 경우에도 2차 질문 수가 1차보다 많아야 한다. 이 비율을 서비스별 고정 개수로 바꾸지 않고 문구 그대로 적용한다. 〔출처: Ace 지시 2026-10-09(확정 기준)〕

- **최소 질문** = 불필요한 질문 제거 · **필요한 질문 생략 금지**. 〔출처: .cursor/skills/vfbcai-master-development/SKILL.md § Profiling Stop Condition〕
- **판정** | Phase2 **실질 축 수** **>** Phase1 **실질 축 수** (엄격 부등식) 〔출처: docs/master/VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md § 최소 비율 가드레일 (LOCK)〕
- **질문 개수** | 사건 **복잡도**가 정함. 단순 사건은 1차·2차 모두 **적어도 됨** (예: 1차 **3** · 2차 **4** → 4>3 **PASS**) 〔출처: docs/master/VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md § 최소 비율 가드레일 (LOCK)〕
- **금지** | **비율을 맞추기 위한** 질문·축 **추가** 〔출처: docs/master/VFBCAI_INFORMATION_COMPLETENESS_AUDIT_CRITERIA_v1.md § 최소 비율 가드레일 (LOCK)〕

---

# 양식

데이터 객체의 키 이름은 `src/lib/contentPacks/tax/taxContentFinal.data.ts`의 구조를 따른다. 값은 빈 칸이다.

## 데이터 키

```
entry.code
entry.id
entry.route
entry.phase
entry.prompt
entry.subtitle
entry.choices[].value
entry.choices[].label
entry.choices[].description
entry.choices[].fields
entry.directFields
questions[].code
questions[].id
questions[].route
questions[].phase
questions[].prompt
questions[].choices[].value
questions[].choices[].label
questions[].choices[].fields
firstResult.[경로 코드].cards[].questionCode
firstResult.[경로 코드].cards[].title
firstResult.[경로 코드].cards[].sentences
firstResult.[경로 코드].verdicts.[필드 조건].headline
firstResult.[경로 코드].verdicts.[필드 조건].body
firstResult.[경로 코드].risks.rules[].clauses[].field
firstResult.[경로 코드].risks.rules[].clauses[].values
labels
connections
directNotice
reportFixed.missingFileNotice
reportGuide.title
reportGuide.subtitle
reportGuide.caption
reportGuide.disclaimer
reportGuide.firstMark
reportGuide.fileCountTemplate
reportGuide.notice.title
reportGuide.notice.flow
reportGuide.notice.chips
reportGuide.notice.items[].text
reportGuide.notice.items[].chips
reportGuide.routes.[경로 코드].checklist.title
reportGuide.routes.[경로 코드].checklist.rows[].name
reportGuide.routes.[경로 코드].checklist.rows[].why
reportGuide.routes.[경로 코드].checklist.rows[].chips
reportGuide.routes.[경로 코드].order.title
reportGuide.routes.[경로 코드].order.flow
reportGuide.routes.[경로 코드].order.chips
reportGuide.routes.[경로 코드].compare.title
reportGuide.routes.[경로 코드].compare.rows[].left
reportGuide.routes.[경로 코드].compare.rows[].right
reportGuide.routes.[경로 코드].compare.rows[].point
reportGuide.routes.[경로 코드].compare.rows[].chips
reportGuide.routes.[경로 코드].timeline.title
reportGuide.routes.[경로 코드].timeline.flow
reportGuide.routes.[경로 코드].timeline.chips
reportGuide.routes.[경로 코드].timeline.note
reportGuide.routes.[경로 코드].timeline.noteChips
reportGuide.routes.[경로 코드].misses.title
reportGuide.routes.[경로 코드].misses.items[].text
reportGuide.routes.[경로 코드].misses.items[].chips
reportGuide.routes.[경로 코드].questions.title
reportGuide.routes.[경로 코드].questions.items[].text
reportGuide.routes.[경로 코드].questions.items[].chips
reportGuide.sources.confirmedOn
reportGuide.sources.rows[].id
reportGuide.sources.rows[].name
reportGuide.sources.rows[].publisher
reportGuide.sources.rows[].kind
reportGuide.sources.rows[].urls
reportGuide.sources.rows[].note
```

# A. 진입 화면과 1차 질문

## A-0. 진입 화면 (질문 수에 포함하지 않음)

**고객 화면**

**[진입 질문]**

[진입 안내 문장]

① [선택지 문장]
[선택지 부가 설명]
② [선택지 문장]
[선택지 부가 설명]
③ [선택지 문장]
[선택지 부가 설명]
④ [선택지 문장]
[선택지 부가 설명]
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 | 이동 |
|---|---|---|
| ① | `[필드 이름]=[값]`, `[필드 이름]=[값]` | [다음 질문 코드] |
| ② | `[필드 이름]=[값]`, `[필드 이름]=[값]` | [다음 질문 코드] |
| ③ | `[필드 이름]=[값]`, `[필드 이름]=[값]` | [다음 질문 코드] |
| ④ | `[필드 이름]=[값]`, `[필드 이름]=[값]` | [다음 질문 코드] |
| ⑤ 직접 입력 | `[필드 이름]=[값]`, `[필드 이름]=[값]` | [다음 질문 코드] |

## A-1. [경로 이름] — 1차

같은 블록을 1차 질문마다 반복한다. 경로는 서비스에 필요한 수만큼 둔다.

### Q1-[경로 코드]

**고객 화면**

**[질문 내용]**

① [선택지 문장]
② [선택지 문장]
③ [선택지 문장]
④ [선택지 문장]
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `[필드 이름]=[값]`, `[필드 이름]=[값]` |
| ② | `[필드 이름]=[값]`, `[필드 이름]=[값]` |
| ③ | `[필드 이름]=[값]`, `[필드 이름]=[값]` |
| ④ | `[필드 이름]=[값]`, `[필드 이름]=[값]` |
| ⑤ 직접 입력 | `[필드 이름]=[값]`, `[필드 이름]=[값]` |

### Q2-[경로 코드]

Q1-[경로 코드]와 같은 고객 화면·내부 저장 표.

### Q3-[경로 코드]

Q1-[경로 코드]와 같은 고객 화면·내부 저장 표.

### Q4-[경로 코드]

Q1-[경로 코드]와 같은 고객 화면·내부 저장 표.

# B. 2차 질문

## B-1. [경로 이름] — 2차

### Q5-[경로 코드]

Q1-[경로 코드]와 같은 고객 화면·내부 저장 표.

### Q6-[경로 코드]

Q1-[경로 코드]와 같은 고객 화면·내부 저장 표.

### Q7-[경로 코드]

Q1-[경로 코드]와 같은 고객 화면·내부 저장 표.

### Q8-[경로 코드]

Q1-[경로 코드]와 같은 고객 화면·내부 저장 표.

### Q9-[경로 코드]

Q1-[경로 코드]와 같은 고객 화면·내부 저장 표.

### Q10-[경로 코드]

Q1-[경로 코드]와 같은 고객 화면·내부 저장 표.

### Q11-[경로 코드]

Q1-[경로 코드]와 같은 고객 화면·내부 저장 표.

# C. 필드 표

모든 필드는 한 질문의 선택지에 2개 이상 함께 저장되고, 아래 E의 결과 문장 또는 위험 규칙에서 사용된다. 값 옆은 고객 표시 문구(G).

## C-1. [경로 이름]

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `[필드 이름]` | `[값]`([고객 표시 문구]) / `[값]`([고객 표시 문구]) | [질문 코드] |

# D. 라우팅

1. [진입에서 고르는 경로와, 잘 모르겠거나 직접 입력일 때의 이동]
2. [1차 질문을 마친 뒤 같은 경로의 2차로 이어지는 규칙. 질문 중간에 멈추지 않는다.]
3. [긴급해 보여도 질문을 줄이거나 건너뛰지 않는 규칙. 질문을 마친 뒤 결과에서 전문가 진행으로 연결한다.]
4. [결과의 연결 안내는 권유이며, 서비스 이동을 강제하지 않는다.]

# E. 결과

## E-1. 1차 무료 결과

마스터 1차 결과 구성: **01 현재 상황**(판정 1줄 + 본문 1~2문장), **02 핵심 확인 결과**(카드 3개), **03 주요 위험 요소**. 04·05는 무료 1차에서 노출하지 않는다.

- 판정·본문 = [질문 코드] 선택지, 카드 = [질문 코드] 선택지에서 가져온다.
- 선택지 키 = 해당 선택지의 저장 필드 쌍.
- 직접 입력을 고른 항목은 해당 칸에 `[직접 입력 안내 문장]`을 표시한다.

### E-1-[경로 코드]. [경로 이름]

**카드1 ([카드 제목])** — [질문 코드]

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---|
| ① | `[필드 이름]=[값]` | [카드 문장] | [글자 수] |

**판정** — [질문 코드]

| 선택 | 판정 문장 | 본문 |
|---|---|---|
| ① | [판정 문장] | [본문] |

**위험** — [질문 코드]

| 조건 | 위험 문장 |
|---|---|
| [필드 조건] | [위험 문장] |

## E-2. 2차 결과 (경로별)

### E-2-[경로 코드]. [경로 이름]

| 질문 | 선택 | 결과 문장 |
|---|---|---|
| [질문 코드] | ① | [결과 문장] |

## E-3. 결과에서의 연결 안내 (권유 문구, 강제 아님)

[연결 안내 문장]

## E-4. 빈 값·직접 입력 처리

- 해당 질문에 직접 입력을 고른 경우: 해당 칸에는 직접 입력 안내 문장을 표시하고, 입력한 원문은 내부 저장(`[필드 이름]_detail`)에만 쌓아 이후 질문 개선에 쓴다.
- 값이 비어 있으면 해당 칸·문장 전체를 생략한다(빈 조사나 빈 괄호를 남기지 않는다).

# F. 자동 점검 결과 (실행 결과)

| 점검 항목 | [경로 이름] |
|---|---:|
| 1차 질문 수 | [수] |
| 2차 질문 수 | [수] |
| 2차 비율 | [비율] |
| 2차 ÷ 1차 | [배수] |
| 질문 수(전체) | [수] |
| 선택지 총수(직접 입력 포함) | [수] |
| 선택지별 저장 필드 수(최소) | [수] |

| 자동 점검 | 결과 |
|---|---|
| 선택지마다 결과 문장 존재 | [통과 또는 실패] |
| 모든 선택지가 서로 다른 필드 쌍 | [통과 또는 실패] |
| 고객 화면 문장에 영문·코드 노출 | [건수] |
| 단정 표현 | [건수] |
| 괄호 짝·이중 공백 | [건수] |
| 카드 문장 길이 초과 | [건수] |
| 위험 규칙의 필드·값이 실제 저장 값과 일치 | [통과 또는 실패] |
| 1차 결과 문장 중복 | [건수] |
| 값→고객 라벨 누락 | [건수] |
| 같은 필드 안 라벨 중복 | [건수] |
| 총 오류 / 경고 | [수] / [수] |

# G. 값 → 고객 표시 문구

내부 값은 화면·마이페이지·알림 어디에도 그대로 노출하지 않고 아래 문구로만 표시한다.

| 내부 값 | 고객 화면 표시 |
|---|---|
| `[값]` | [고객 표시 문구] |

# H. 수정 기록

- **[수정 항목]** — [무엇을 고쳤는지]

# K. 리포트 고정 문구

[첨부 안내 문장]

# I. AI 리포트 참고 사항

제목: [참고 사항 제목]
부제: [참고 사항 부제]
확인 기준: 확인 기준일 [확인일] · [개정 안내 문장]
고정 문구: [면책 문장]
먼저 표시: [먼저 표시 문구]
접수 건수: 접수된 자료: {n}건

## [공통 안내 제목]

제목: [안내 제목]
흐름: [단계] → [단계] → [단계] → [단계] [출처 표시]
- [항목 문장] [출처 표시]

## 경로: [경로 이름]

### ① 준비 자료 체크

1. [자료 이름] / [왜 필요한가] [출처 표시]

### ② 확인 순서

흐름: [단계] → [단계] → [단계] [출처 표시]

### ③ 서류 간 대조표

- [왼쪽 자료] ↔ [오른쪽 자료] / [대조 포인트] [출처 표시]

### ④ 시점별 정리

흐름: [시점] → [시점] → [시점] [출처 표시]
표 아래: [시점 안내 문장] [출처 표시]

### ⑤ 자주 놓치는 점

- [놓치기 쉬운 상황] [출처 표시]

### ⑥ 전문가에게 가져갈 질문

1. [가져갈 질문] [출처 표시]

# J. 근거·출처

확인일: [확인일]

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | [자료 이름] | [발행처] | [성격] | [URL] | [비고] |
