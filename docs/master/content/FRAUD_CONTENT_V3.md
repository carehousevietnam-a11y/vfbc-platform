# 사기 검토(verify_fraud) 콘텐츠 최종본 (Claude 작성·검수본)

> 사전(제출·계약 전) 경로와 사후(문제 발생 후) 경로 2개로 구성했다. 법령 근거는 이차 자료로 확인했으며 원문 대조가 필요한 항목은 출처 표에 표시했다. 구조 기준: **2차 질문 비중은 전체의 최소 60% 이상(1차 40% 이하)이며, 이보다 2차가 더 많아도 된다(예: 30:70).** 질문 수와 선택지 수는 고정값이 아니며 필요하면 늘릴 수 있고, 질문 생략은 없다. 이 문서의 작성 결과는 경로당 1차 4개 : 2차 9개(31% : 69%)이다. 고객 화면에는 한국어 생활 문장만 표시하고, 영문 코드는 내부 저장에만 사용한다. 사기 여부·법적 책임·피해 회복 가능성은 판단하지 않고, 확인할 사항과 준비 자료를 안내하는 데 그친다.

---

# A. 진입 화면과 1차 질문

## A-0. 진입 화면 (질문 수에 포함하지 않음)

**고객 화면**

**지금 어떤 상황에서 확인하려고 하시나요?**

가까운 상황을 골라 주세요. 잘 모르겠다면 제출·계약 전 검토부터 시작합니다.

① 제출·계약 전 서류 검토  
받은 제안서나 계약서, 입금 요청을 따르기 전에 살펴보고 싶습니다.  
② 문제 발생 후 대응 검토  
돈을 보냈거나 문제가 생긴 뒤 무엇을 준비할지 알고 싶습니다.  
③ 잘 모르겠습니다  
④ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 | 이동 |
|---|---|---|
| ① | `fraud_reviewStage=pre`, `fraud_routeSelectionMode=selected` | 경로 B (Q1-B ~ Q13-B) |
| ② | `fraud_reviewStage=post`, `fraud_routeSelectionMode=selected` | 경로 A (Q1-A ~ Q13-A) |
| ③ | `fraud_reviewStage=pre`, `fraud_routeSelectionMode=unsure` | 경로 B (기본 경로) |
| ④ 직접 입력 | `fraud_reviewStage=pre`, `fraud_routeSelectionMode=direct_input` | 경로 B (기본 경로). 입력 원문은 `fraud_routeSelectionMode` 상세로 저장 |

## A-1. 제출·계약 전 서류 검토 — 1차

### Q1-B

**고객 화면**

**받은 제안은 어떤 종류이고, 그 제안은 누구 앞으로 온 것인가요?**

① **투자·수익·사업 제휴**를 내세운 제안입니다. 제 개인 돈을 맡기는 방식의 제안으로 받았습니다.  
② **대출**을 내세운 제안입니다. 제 회사(사업체) 이름으로 받는 대출이라 조건을 꼭 확인하고 싶습니다.  
③ **온라인 거래나 임대**를 내세운 제안입니다. 제 개인 이름으로 계약하자는 제안으로 받았습니다.  
④ **기관·지인·일자리·연애**를 내세운 제안입니다. 가족이나 지인이 받은 제안을 제가 대신 알아보고 있습니다.  
⑤ **어떤 종류인지 잘 모르겠습니다.** 제 회사 직원 여러 명에게도 같은 연락이 온 것 같습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_scheme=investment`, `fraud_offerHolder=holder_self` |
| ② | `fraud_scheme=loan`, `fraud_offerHolder=holder_company` |
| ③ | `fraud_scheme=online_trade`, `fraud_offerHolder=holder_self` |
| ④ | `fraud_scheme=impersonation`, `fraud_offerHolder=holder_other` |
| ⑤ | `fraud_scheme=unsure_scheme`, `fraud_offerHolder=holder_company` |
| ⑥ 직접 입력 | `fraud_scheme=direct_input`, `fraud_offerHolder=direct_input_detail` |

---

### Q2-B

**고객 화면**

**상대가 내세운 명목은 무엇이고, 그 명목을 믿게 하려고 무엇을 보여 주었나요?**

① **고수익·투자·가상자산·다단계·사업 제휴**를 내세웁니다. 수익을 인증하는 캡처와 다른 사람의 후기를 보여 줍니다.  
② **소액 과제·구인·아르바이트**를 내세웁니다. 일의 내용만 말로 설명하고 보여 준 자료는 없습니다.  
③ **연애·결혼·소개**를 내세웁니다. 멋진 사진과 프로필을 보여 주며 관계를 쌓아 갑니다.  
④ **임대·매매의 보증금·예약금, 택배·관세 비용**을 내세웁니다. 계약서나 영수증, 물건 사진을 보여 줍니다.  
⑤ **공안(경찰)·세무·법원 연락이나 비자·체류·행정 대행**을 내세웁니다. 공문 사진이나 신분증·명함 사진을 보여 줍니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_pretext=pre_invest`, `fraud_pretextProof=proof_profile` |
| ② | `fraud_pretext=pre_tasks`, `fraud_pretextProof=proof_none` |
| ③ | `fraud_pretext=pre_romance`, `fraud_pretextProof=proof_profile` |
| ④ | `fraud_pretext=pre_deposit`, `fraud_pretextProof=proof_docs` |
| ⑤ | `fraud_pretext=pre_authority`, `fraud_pretextProof=proof_docs` |
| ⑥ 직접 입력 | `fraud_pretext=direct_input`, `fraud_pretextProof=direct_input_detail` |

---

### Q3-B

**고객 화면**

**상대와는 어떤 경로로 연락이 닿았고, 그 연락은 누가 먼저 시작했나요?**

① **문자·전화·이메일**로 연락이 왔습니다. 상대가 제 연락처를 알고 먼저 연락해 왔습니다.  
② **메신저나 소셜 앱(잘로·페이스북 등)**으로 연락이 왔습니다. 상대가 먼저 말을 걸어 대화가 이어졌습니다.  
③ **온라인 광고·게시글이나 거래·구인 플랫폼**에서 만났습니다. 제가 그 글을 보고 먼저 연락했습니다.  
④ **지인의 소개**로 알게 되었습니다. 소개해 준 지인이 두 사람을 먼저 연결해 주었습니다.  
⑤ **직접 만나서** 시작되었습니다. 제가 먼저 상대를 찾아가서 직접 얼굴을 보고 만났습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_contactChannel=direct_contact`, `fraud_contactInitiator=init_them` |
| ② | `fraud_contactChannel=messenger`, `fraud_contactInitiator=init_them` |
| ③ | `fraud_contactChannel=online_post`, `fraud_contactInitiator=init_me` |
| ④ | `fraud_contactChannel=referral`, `fraud_contactInitiator=init_third` |
| ⑤ | `fraud_contactChannel=in_person`, `fraud_contactInitiator=init_me` |
| ⑥ 직접 입력 | `fraud_contactChannel=direct_input`, `fraud_contactInitiator=direct_input_detail` |

---

### Q4-B

**고객 화면**

**지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?**

① **상대가 진짜인지** 모르겠습니다. 제가 직접 확인할 수 있도록 확인 방법을 알려 주면 좋겠습니다.  
② **서명해도 되는지, 조건이 너무 좋아 보여** 걱정됩니다. 계약 조건과 서류를 전문가가 함께 봐 주면 좋겠습니다.  
③ **먼저 돈을 보내라는 요구**가 괜찮은지 모르겠습니다. 송금하기 전에 상대 정보와 계좌를 함께 확인해 주면 좋겠습니다.  
④ **개인정보를 달라는 요구**가 괜찮은지 모르겠습니다. 무엇은 줘도 되고 무엇은 안 되는지 알려 주면 좋겠습니다.  
⑤ **재촉이 부담스럽습니다.** 서두르지 않고 천천히 확인할 수 있는 방법을 알고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_mainConcern=doubt_party`, `fraud_helpWanted=help_guide` |
| ② | `fraud_mainConcern=doubt_sign`, `fraud_helpWanted=help_expert` |
| ③ | `fraud_mainConcern=doubt_prepay`, `fraud_helpWanted=help_expert` |
| ④ | `fraud_mainConcern=doubt_data`, `fraud_helpWanted=help_guide` |
| ⑤ | `fraud_mainConcern=doubt_rush`, `fraud_helpWanted=help_guide` |
| ⑥ 직접 입력 | `fraud_mainConcern=direct_input`, `fraud_helpWanted=direct_input_detail` |

---

## A-2. 문제 발생 후 대응 검토 — 1차

### Q1-A

**고객 화면**

**겪은 일은 어떤 종류이고, 그 일을 겪은 사람은 누구(어떤 명의)인가요?**

① **투자·수익·사업 제휴**와 관련해 문제가 생겼습니다. 제 개인 돈을 맡겼다가 문제가 생겼습니다.  
② **대출**과 관련해 문제가 생겼습니다. 제 회사(사업체) 이름으로 받은 대출 건입니다.  
③ **온라인 거래나 임대**와 관련해 문제가 생겼습니다. 제 개인 이름으로 계약한 거래에서 생긴 문제입니다.  
④ **기관·지인·일자리·연애**를 내세운 상대와 문제가 생겼습니다. 가족이나 지인이 겪은 일을 제가 대신 알아보고 있습니다.  
⑤ **어떤 종류인지 잘 모르겠습니다.** 제 회사 직원 여러 명이 같은 일을 겪은 것 같습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_scheme=investment`, `fraud_victimHolder=victim_self` |
| ② | `fraud_scheme=loan`, `fraud_victimHolder=victim_company` |
| ③ | `fraud_scheme=online_trade`, `fraud_victimHolder=victim_self` |
| ④ | `fraud_scheme=impersonation`, `fraud_victimHolder=victim_other` |
| ⑤ | `fraud_scheme=unsure_scheme`, `fraud_victimHolder=victim_company` |
| ⑥ 직접 입력 | `fraud_scheme=direct_input`, `fraud_victimHolder=direct_input_detail` |

---

### Q2-A

**고객 화면**

**상대가 내세웠던 명목은 무엇이었고, 그 일 뒤에 피해 회복을 대행해 주겠다는 새 제안을 받았나요?**

① **고수익·투자·가상자산·다단계·사업 제휴**를 내세웠습니다. 피해를 알린 뒤 되찾아 주겠다는 업체가 따로 연락해 왔습니다.  
② **소액 과제·구인·아르바이트**를 내세웠습니다. 그 뒤로 새로 받은 다른 제안이나 연락은 따로 없습니다.  
③ **연애·결혼·소개**를 내세웠습니다. 그 뒤로 새로 받은 다른 제안이나 연락은 아직 따로 없습니다.  
④ **임대·매매의 보증금·예약금, 택배·관세 비용**을 내세웠습니다. 돈을 되찾아 준다는 제안을 받았지만 믿어도 될지 고민 중입니다.  
⑤ **공안(경찰)·세무·법원 연락이나 비자·체류·행정 대행**을 내세웠습니다. 해결해 주겠다며 수수료를 요구하는 대행 제안을 받았습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_pretext=pre_invest`, `fraud_recoveryOffer=ro_offered` |
| ② | `fraud_pretext=pre_tasks`, `fraud_recoveryOffer=ro_none` |
| ③ | `fraud_pretext=pre_romance`, `fraud_recoveryOffer=ro_none` |
| ④ | `fraud_pretext=pre_deposit`, `fraud_recoveryOffer=ro_considering` |
| ⑤ | `fraud_pretext=pre_authority`, `fraud_recoveryOffer=ro_offered` |
| ⑥ 직접 입력 | `fraud_pretext=direct_input`, `fraud_recoveryOffer=direct_input_detail` |

---

### Q3-A

**고객 화면**

**상대와는 어떤 경로로 연락이 닿았고, 그 연락은 누가 먼저 시작했나요?**

① **문자·전화·이메일**로 연락이 닿았습니다. 상대가 제 연락처를 알고 먼저 연락해 왔습니다.  
② **메신저나 소셜 앱(잘로·페이스북 등)**으로 연락이 닿았습니다. 상대가 먼저 말을 걸어 대화가 이어졌습니다.  
③ **온라인 광고·게시글이나 거래·구인 플랫폼**에서 만났습니다. 제가 그 글을 보고 먼저 연락했습니다.  
④ **지인의 소개**로 알게 되었습니다. 소개해 준 지인이 두 사람을 먼저 연결해 주었습니다.  
⑤ **직접 만나서** 시작되었습니다. 제가 먼저 상대를 찾아가서 직접 얼굴을 보고 만났습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_contactChannel=direct_contact`, `fraud_contactInitiator=init_them` |
| ② | `fraud_contactChannel=messenger`, `fraud_contactInitiator=init_them` |
| ③ | `fraud_contactChannel=online_post`, `fraud_contactInitiator=init_me` |
| ④ | `fraud_contactChannel=referral`, `fraud_contactInitiator=init_third` |
| ⑤ | `fraud_contactChannel=in_person`, `fraud_contactInitiator=init_me` |
| ⑥ 직접 입력 | `fraud_contactChannel=direct_input`, `fraud_contactInitiator=direct_input_detail` |

---

### Q4-A

**고객 화면**

**지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?**

① **보낸 돈이 어떻게 될지** 걱정됩니다. 은행에 문의해서 되돌릴 방법이 있는지 전문가와 함께 보고 싶습니다.  
② **상대가 계속 추가로 요구**해 걱정됩니다. 더 보내지 않기 위해 어떻게 대응할지 방법을 알려 주면 좋겠습니다.  
③ **연락이 끊기고 증거가 부족**해 걱정됩니다. 남은 자료를 모으는 방법을 차근차근 알려 주면 좋겠습니다.  
④ **어디에 알려야 하는지** 모르겠습니다. 신고할 곳과 신고서 작성을 전문가가 함께 해 주면 좋겠습니다.  
⑤ **개인정보를 줘서** 걱정됩니다. 악용되지 않게 내 정보를 보호하는 방법을 알려 주면 좋겠습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_mainConcern=doubt_recover`, `fraud_helpWanted=help_expert` |
| ② | `fraud_mainConcern=doubt_more`, `fraud_helpWanted=help_guide` |
| ③ | `fraud_mainConcern=doubt_cut`, `fraud_helpWanted=help_guide` |
| ④ | `fraud_mainConcern=doubt_where`, `fraud_helpWanted=help_expert` |
| ⑤ | `fraud_mainConcern=doubt_leak`, `fraud_helpWanted=help_guide` |
| ⑥ 직접 입력 | `fraud_mainConcern=direct_input`, `fraud_helpWanted=direct_input_detail` |

---

# B. 2차 질문

## B-1. 제출·계약 전 서류 검토 — 2차

### Q5-B

**고객 화면**

**상대나 회사의 이름은 어디까지 확인되었고, 상대가 알려 준 연락처는 어떤 것인가요?**

① **공식 조회로 이름과 등록 정보를 확인**했습니다. 상대가 알려 준 연락처도 회사의 대표 연락처와 같았습니다.  
② **회사 이름만 공식 조회로 확인**했습니다. 연락해 오는 사람은 개인 번호나 개인 계정만 씁니다.  
③ **상대가 말해 준 이름만** 알고 있습니다. 공식 조회는 하지 못했고 연락처도 개인 번호뿐입니다.  
④ **확인해 보니 정보가 맞지 않습니다.** 상대가 알려 준 회사 연락처와 조회 결과가 서로 다릅니다.  
⑤ **아직 확인해 보지 않았습니다.** 상대에게서 받은 연락처가 아직 없어 무엇을 확인할지 모르겠습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_identityCheck=checked_official`, `fraud_contactKind=ct_company` |
| ② | `fraud_identityCheck=checked_name_only`, `fraud_contactKind=ct_personal` |
| ③ | `fraud_identityCheck=name_only_known`, `fraud_contactKind=ct_personal` |
| ④ | `fraud_identityCheck=check_mismatch`, `fraud_contactKind=ct_company` |
| ⑤ | `fraud_identityCheck=not_checked`, `fraud_contactKind=ct_none` |
| ⑥ 직접 입력 | `fraud_identityCheck=direct_input`, `fraud_contactKind=direct_input_detail` |

---

### Q6-B

**고객 화면**

**상대는 어떤 수익이나 조건을 내세웠고, 그 조건을 어떤 방식으로 전달받았나요?**

① **원금이나 수익을 보장**한다고 합니다. 다른 사람의 수익 인증 캡처와 후기 화면으로 보여 줍니다.  
② **짧은 기간에 아주 높은 확정 수익**을 말합니다. 말로만 약속하고 문서로는 받은 것이 없습니다.  
③ **수수료나 보증금을 먼저 내야** 한다고 합니다. 계약서나 안내 화면에 그 조건이 글로 적혀 있습니다.  
④ **조건은 일반적이고 특별한 보장은 없습니다.** 조건이 서류에 글로 적혀 있어 한 번 더 확인하고 싶습니다.  
⑤ **조건 설명이 거의 없습니다.** 무엇을 약속받았는지 말로만 들어서 내용이 매우 불분명합니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_benefitType=benefit_guaranteed`, `fraud_conditionVia=via_capture` |
| ② | `fraud_benefitType=benefit_high_fixed`, `fraud_conditionVia=via_verbal` |
| ③ | `fraud_benefitType=benefit_fee_first`, `fraud_conditionVia=via_written` |
| ④ | `fraud_benefitType=benefit_ordinary`, `fraud_conditionVia=via_written` |
| ⑤ | `fraud_benefitType=benefit_unexplained`, `fraud_conditionVia=via_verbal` |
| ⑥ 직접 입력 | `fraud_benefitType=direct_input`, `fraud_conditionVia=direct_input_detail` |

---

### Q7-B

**고객 화면**

**상대가 지금 요구하는 것은 무엇이고, 그 요구를 몇 번이나 받았나요?**

① **먼저 돈을 보내라**고 합니다. 여러 번 같은 요구를 받아 거절하기가 점점 어렵습니다.  
② **신분증이나 계좌 정보**를 달라고 합니다. 필요한 이유를 설명해 주었지만 믿어도 되는지 모르겠습니다.  
③ **앱 설치나 로그인**을 하라고 합니다. 한 번 요구받았고 아직은 하지 않은 채 망설이고 있습니다.  
④ **만나자거나 다른 곳으로 옮기자**고 합니다. 대화 도중 여러 번 같은 제안을 반복했습니다.  
⑤ **서명이나 계약을 서두르라**고 합니다. 한 번 요구받았고 서류 내용은 아직 읽는 중입니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_requestedAction=send_first`, `fraud_requestTimes=rq_repeated` |
| ② | `fraud_requestedAction=give_info`, `fraud_requestTimes=rq_explained` |
| ③ | `fraud_requestedAction=install_login`, `fraud_requestTimes=rq_once` |
| ④ | `fraud_requestedAction=meet_move`, `fraud_requestTimes=rq_repeated` |
| ⑤ | `fraud_requestedAction=sign_now`, `fraud_requestTimes=rq_once` |
| ⑥ 직접 입력 | `fraud_requestedAction=direct_input`, `fraud_requestTimes=direct_input_detail` |

---

### Q8-B

**고객 화면**

**송금하라는 계좌는 어떤 상태이고, 요구하는 금액은 어느 정도인가요?**

① **서류에 적힌 상대의 이름과 계좌 명의가 같습니다.** 요구하는 금액은 100만 동 이상 1천만 동 미만입니다.  
② **계좌 명의가 상대 이름과 다르거나 개인 명의**입니다. 요구하는 금액이 1천만 동 이상으로 큽니다.  
③ **계좌가 여러 개이거나 자주 바뀝니다.** 한 번에는 100만 동 미만이지만 여러 번 나눠 보내라고 합니다.  
④ **해외 계좌나 가상자산 주소**입니다. 추적이 어려운 수단으로 1천만 동이 넘는 큰 금액을 요구합니다.  
⑤ **계좌가 아직 안내되지 않았습니다.** 얼마를 보내야 하는지도 아직 정해지지 않았습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_accountMatch=matches_party`, `fraud_askAmount=ask_1m_10m` |
| ② | `fraud_accountMatch=differs_party`, `fraud_askAmount=ask_over10m` |
| ③ | `fraud_accountMatch=multiple_accounts`, `fraud_askAmount=ask_under1m` |
| ④ | `fraud_accountMatch=overseas_or_crypto`, `fraud_askAmount=ask_over10m` |
| ⑤ | `fraud_accountMatch=account_not_given`, `fraud_askAmount=ask_unstated` |
| ⑥ 직접 입력 | `fraud_accountMatch=direct_input`, `fraud_askAmount=direct_input_detail` |

---

### Q9-B

**고객 화면**

**상대는 어떤 방식으로 재촉하거나 압박하고, 그 연락은 얼마나 자주 오나요?**

① **재촉은 없습니다.** 재촉하는 연락 자체가 오지 않아 시간을 두고 천천히 확인하고 싶습니다.  
② **기한을 정해 두거나 이번 기회뿐이라며 마감이 임박했다**고 합니다. 하루에도 여러 번 연락해서 재촉합니다.  
③ **비밀로 하라며 다른 사람에게 말하지 못하게** 합니다. 처음 한 번 강하게 말했고 그 뒤로는 반복하지 않았습니다.  
④ **확인해 보겠다고 하면 화를 내거나 말을 돌립니다.** 그 말을 했을 때 한 번 그런 반응을 보였습니다.  
⑤ **지인이나 다른 사람을 내세워 압박**합니다. 그 사람들이 번갈아 가며 매일 연락해 옵니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_pressureType=press_none`, `fraud_pressureFreq=pf_none` |
| ② | `fraud_pressureType=press_deadline`, `fraud_pressureFreq=pf_daily` |
| ③ | `fraud_pressureType=press_secret`, `fraud_pressureFreq=pf_once` |
| ④ | `fraud_pressureType=press_evasive`, `fraud_pressureFreq=pf_once` |
| ⑤ | `fraud_pressureType=press_third_party`, `fraud_pressureFreq=pf_daily` |
| ⑥ 직접 입력 | `fraud_pressureType=direct_input`, `fraud_pressureFreq=direct_input_detail` |

---

### Q10-B

**고객 화면**

**받은 서류나 기록은 어떤 것이 있고, 그 서류를 읽고 이해하셨나요?**

① **상대 정보가 모두 적힌 계약서나 약정서**가 있습니다. 베트남어로 되어 있어 대부분 이해하지 못했습니다.  
② **상대 정보가 일부만 적힌 계약서나 제안서**가 있습니다. 내용을 대략 읽었지만 이해하지 못한 부분이 남아 있습니다.  
③ **안내문이나 광고 화면, 대화 내용만** 있습니다. 내용을 읽고 이해했지만 정식 서류가 아니라 근거가 부족합니다.  
④ **입금 안내만** 받았습니다. 계좌와 금액은 이해했지만 무엇에 대한 돈인지는 모릅니다.  
⑤ **받은 서류가 없습니다.** 읽을 서류 자체가 없어 무엇을 요청해야 할지부터 알고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_recordKind=contract_full`, `fraud_recordRead=rd_not` |
| ② | `fraud_recordKind=contract_partial`, `fraud_recordRead=rd_partly` |
| ③ | `fraud_recordKind=chat_log`, `fraud_recordRead=rd_understood` |
| ④ | `fraud_recordKind=pay_request`, `fraud_recordRead=rd_understood` |
| ⑤ | `fraud_recordKind=no_record`, `fraud_recordRead=rd_na` |
| ⑥ 직접 입력 | `fraud_recordKind=direct_input`, `fraud_recordRead=direct_input_detail` |

---

### Q11-B

**고객 화면**

**이 제안과 관련해 지금까지 한 일은 무엇이고, 그 뒤에 상대의 반응은 어떠했나요?**

① **아무것도 하지 않았습니다.** 상대에게서 추가로 온 연락도 아직은 하나도 없는 상태입니다.  
② **문의만 해 보았습니다.** 문의한 뒤로 상대가 매일 계속해서 연락을 해 오고 있는 상황입니다.  
③ **개인정보나 신분증을 보냈거나 앱을 설치·로그인**했습니다. 그 뒤로 추가 요구가 계속 오고 있습니다.  
④ **소액을 먼저 보냈습니다.** 그 뒤로 상대가 갑자기 연락을 끊어 버리고 아무 답이 없습니다.  
⑤ **서명이나 도장을 이미 했습니다.** 그 뒤로는 상대에게서 특별한 연락이 오지 않았습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_actionTaken=nothing_yet`, `fraud_followUp=fu_none` |
| ② | `fraud_actionTaken=asked_only`, `fraud_followUp=fu_more` |
| ③ | `fraud_actionTaken=gave_info`, `fraud_followUp=fu_more` |
| ④ | `fraud_actionTaken=sent_small`, `fraud_followUp=fu_cut` |
| ⑤ | `fraud_actionTaken=signed_already`, `fraud_followUp=fu_none` |
| ⑥ 직접 입력 | `fraud_actionTaken=direct_input`, `fraud_followUp=direct_input_detail` |

---

### Q12-B

**고객 화면**

**확인해 보겠다고 하면 상대는 어떻게 반응하고, 그 반응을 본 뒤 어떻게 하셨나요?**

① **기꺼이 필요한 자료를 줍니다.** 그 반응을 믿고 일단 다음 단계까지 계속 진행하고 있습니다.  
② **대답이 매번 바뀌거나 앞뒤가 맞지 않습니다.** 그래서 진행을 잠시 멈추고 생각 중입니다.  
③ **오히려 서두르라고 재촉합니다.** 불안해서 가까운 주변 사람에게 의견을 물어보았습니다.  
④ **연락을 끊거나 차단합니다.** 그 뒤로는 더 진행하지 않고 그대로 멈춘 채 지켜보는 상태입니다.  
⑤ **아직 확인해 보겠다고 말해 보지 않았습니다.** 말해 보기 전에 어떻게 말할지 주변에 물어보려 합니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_verifyReaction=react_open`, `fraud_afterReaction=ar_continue` |
| ② | `fraud_verifyReaction=react_inconsistent`, `fraud_afterReaction=ar_paused` |
| ③ | `fraud_verifyReaction=react_pressure`, `fraud_afterReaction=ar_asked` |
| ④ | `fraud_verifyReaction=react_cut`, `fraud_afterReaction=ar_paused` |
| ⑤ | `fraud_verifyReaction=react_untested`, `fraud_afterReaction=ar_asked` |
| ⑥ 직접 입력 | `fraud_verifyReaction=direct_input`, `fraud_afterReaction=direct_input_detail` |

---

### Q13-B

**고객 화면**

**대화·서류·입금 내역은 어느 정도 남아 있고, 그 자료는 어디에 보관되어 있나요?**

① **대화와 서류, 입금 내역이 모두** 있습니다. 클라우드나 다른 기기에도 백업해 두었습니다.  
② **대화만** 있습니다. 휴대폰 안에만 있어서 기기를 잃거나 고장 나면 사라질 수 있습니다.  
③ **서류만 있고 대화는 남아 있지 않습니다.** 종이 서류로 집이나 사무실에 보관하고 있습니다.  
④ **일부를 지웠거나 잃어버렸습니다.** 지운 자료가 휴대폰 안에 남아 있는지는 확인하지 못했습니다.  
⑤ **남은 자료가 없습니다.** 따로 보관해 둔 곳이 어디에도 없어 처음부터 모아야 합니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_evidenceState=all_kept`, `fraud_evidenceWhere=kp_backup` |
| ② | `fraud_evidenceState=chat_only`, `fraud_evidenceWhere=kp_phone` |
| ③ | `fraud_evidenceState=docs_only`, `fraud_evidenceWhere=kp_paper` |
| ④ | `fraud_evidenceState=deleted_some`, `fraud_evidenceWhere=kp_phone` |
| ⑤ | `fraud_evidenceState=none_kept`, `fraud_evidenceWhere=kp_none` |
| ⑥ 직접 입력 | `fraud_evidenceState=direct_input`, `fraud_evidenceWhere=direct_input_detail` |

---

## B-2. 문제 발생 후 대응 검토 — 2차

### Q5-A

**고객 화면**

**문제를 알게 된 지 얼마나 되었고, 알게 된 뒤에도 돈을 더 보냈나요?**

① **오늘 알게 되었습니다.** 알게 된 뒤에는 상대에게 돈을 더 보내지 않고 멈췄습니다.  
② **일주일 안에 알게 되었습니다.** 상대의 요구에 밀려 알게 된 뒤에도 조금 더 보냈습니다.  
③ **한 달쯤 전에 알게 되었습니다.** 그 뒤로는 한 푼도 더 보내지 않고 바로 멈추었습니다.  
④ **반년쯤 전에 알게 되었습니다.** 시간이 지나 그 뒤에 보낸 돈이 있는지 정확히 기억나지 않습니다.  
⑤ **반년이 넘게 지났습니다.** 상대가 곧바로 연락을 끊어서 더 보낼 일 자체가 없었습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_elapsedTime=elapsed_today`, `fraud_sentAfter=sa_none` |
| ② | `fraud_elapsedTime=elapsed_week`, `fraud_sentAfter=sa_some` |
| ③ | `fraud_elapsedTime=elapsed_month`, `fraud_sentAfter=sa_none` |
| ④ | `fraud_elapsedTime=elapsed_half_year`, `fraud_sentAfter=sa_unsure` |
| ⑤ | `fraud_elapsedTime=elapsed_over_half`, `fraud_sentAfter=sa_na` |
| ⑥ 직접 입력 | `fraud_elapsedTime=direct_input`, `fraud_sentAfter=direct_input_detail` |

---

### Q6-A

**고객 화면**

**이상하다고 처음 느낀 계기는 무엇이고, 그 뒤 누구와 상의했나요?**

① **상대가 갑자기 연락을 끊었습니다.** 아직 아무와도 이야기하지 못하고 혼자 고민하고 있습니다.  
② **약속한 수익이나 물건이 오지 않았습니다.** 가족에게 사정을 이야기하고 함께 걱정하고 있습니다.  
③ **추가 비용을 계속 요구**해서 의심이 생겼습니다. 혼자 생각하다가 아직 어디에도 말하지 않았습니다.  
④ **은행이나 가족이 먼저 이상하다고 알려** 주었습니다. 은행 창구에 이미 문의해 안내를 받았습니다.  
⑤ **직접 조회해 보고 알게 되었습니다.** 친한 친구 한 사람에게만 먼저 조심스럽게 이야기해 보았습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_discovery=disc_contact_cut`, `fraud_firstConsult=cs_alone` |
| ② | `fraud_discovery=disc_broken_promise`, `fraud_firstConsult=cs_family` |
| ③ | `fraud_discovery=disc_more_fees`, `fraud_firstConsult=cs_alone` |
| ④ | `fraud_discovery=disc_outside`, `fraud_firstConsult=cs_official` |
| ⑤ | `fraud_discovery=disc_self_check`, `fraud_firstConsult=cs_family` |
| ⑥ 직접 입력 | `fraud_discovery=direct_input`, `fraud_firstConsult=direct_input_detail` |

---

### Q7-A

**고객 화면**

**지금 상대는 어떻게 행동하고 있고, 돈을 돌려주겠다는 말이 있었나요?**

① **더 보내라고 계속 요구**합니다. 더 내면 곧 전부 돌려주겠다고 여러 번 약속했습니다.  
② **여러 핑계를 대며 시간을 끕니다.** 돌려준다는 날짜만 계속 바뀌어 약속만 반복됩니다.  
③ **신고하면 불이익이 있다고 협박**합니다. 이제는 돌려줄 수 없다고 분명히 거절했습니다.  
④ **연락해도 답이 없습니다.** 돌려주겠다는 이야기는 지금까지 한 번도 오간 적이 없습니다.  
⑤ **저를 차단했거나 연락처를 바꿨습니다.** 돌려줄 방법에 대해서도 아무 설명이 없었습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_counterpartyStance=demands_more`, `fraud_refundPromise=rp_promised` |
| ② | `fraud_counterpartyStance=excuses`, `fraud_refundPromise=rp_promised` |
| ③ | `fraud_counterpartyStance=threatens`, `fraud_refundPromise=rp_denied` |
| ④ | `fraud_counterpartyStance=silent`, `fraud_refundPromise=rp_none` |
| ⑤ | `fraud_counterpartyStance=blocked_changed`, `fraud_refundPromise=rp_none` |
| ⑥ 직접 입력 | `fraud_counterpartyStance=direct_input`, `fraud_refundPromise=direct_input_detail` |

---

### Q8-A

**고객 화면**

**돈은 어떤 방법으로 보냈고, 그 돈은 어디서 마련한 것인가요?**

① **은행 계좌로 송금**했습니다. 제가 따로 모아 둔 돈을 직접 계좌에서 꺼내 보냈습니다. 다른 사람 돈은 아닙니다.  
② **전자지갑이나 간편결제**로 보냈습니다. 급해서 주변 사람에게서 빌린 돈으로 서둘러 보냈습니다.  
③ **가상자산으로 보냈습니다.** 회사 운영비나 다른 사람의 돈을 잠시 가져다 사용했습니다.  
④ **현금이나 상품권으로 건넸습니다.** 제 월급과 생활비를 아껴서 겨우 마련한 소중한 돈이었습니다.  
⑤ **아직 돈을 보내지 않았습니다.** 그래서 이 질문에서 따질 만한 손해는 없는 상태입니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_payMethod=pay_bank`, `fraud_moneySource=src_own` |
| ② | `fraud_payMethod=pay_wallet`, `fraud_moneySource=src_borrowed` |
| ③ | `fraud_payMethod=pay_crypto`, `fraud_moneySource=src_company` |
| ④ | `fraud_payMethod=pay_cash`, `fraud_moneySource=src_own` |
| ⑤ | `fraud_payMethod=pay_none`, `fraud_moneySource=src_na` |
| ⑥ 직접 입력 | `fraud_payMethod=direct_input`, `fraud_moneySource=direct_input_detail` |

---

### Q9-A

**고객 화면**

**손해를 본 금액은 어느 정도이고, 그것이 생활이나 사업에 얼마나 영향을 주나요?**

① **아직 손해를 본 금액이 없습니다.** 생활에 미친 영향도 전혀 없고 평소처럼 지내는 상태입니다.  
② **100만 동 미만**의 손해를 보았습니다. 아쉽기는 하지만 생활에는 큰 영향이 없습니다.  
③ **100만 동 이상 1천만 동 미만**의 손해를 보았습니다. 부담은 되지만 당장 감당할 수 있습니다.  
④ **1천만 동 이상 1억 동 미만**의 손해를 보았습니다. 달마다 나가는 비용을 낼 일이 걱정될 정도로 부담됩니다.  
⑤ **1억 동 이상**의 손해를 보았습니다. 생활이나 사업이 흔들릴 만큼 심각한 상황입니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_lossScale=loss_none`, `fraud_lossImpact=li_none` |
| ② | `fraud_lossScale=loss_under_1m`, `fraud_lossImpact=li_none` |
| ③ | `fraud_lossScale=loss_1m_10m`, `fraud_lossImpact=li_manageable` |
| ④ | `fraud_lossScale=loss_10m_100m`, `fraud_lossImpact=li_manageable` |
| ⑤ | `fraud_lossScale=loss_over_100m`, `fraud_lossImpact=li_serious` |
| ⑥ 직접 입력 | `fraud_lossScale=direct_input`, `fraud_lossImpact=direct_input_detail` |

---

### Q10-A

**고객 화면**

**돈은 어떤 형태로 나누어 보냈고, 송금 내역은 얼마나 남아 있나요?**

① **한 번에 한 계좌로** 보냈습니다. 은행 앱과 영수증에 송금 내역이 모두 남아 있습니다.  
② **같은 계좌로 여러 번** 나누어 보냈습니다. 일부 날짜의 내역만 남아 있고 나머지는 찾아야 합니다.  
③ **여러 계좌로 나누어** 보냈습니다. 계좌마다 날짜와 금액을 하나씩 정리해 둔 표가 있습니다.  
④ **어디로 어떻게 보냈는지 잘 기억나지 않습니다.** 송금 내역을 어디서 찾는지 몰라 아직 확인하지 못했습니다.  
⑤ **보낸 돈이 없습니다.** 송금 내역이 따로 없어서 신고할 때 낼 자료도 따로 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_transferPattern=tp_once_one`, `fraud_txRecord=tx_have` |
| ② | `fraud_transferPattern=tp_many_one`, `fraud_txRecord=tx_partial` |
| ③ | `fraud_transferPattern=tp_many_multi`, `fraud_txRecord=tx_have` |
| ④ | `fraud_transferPattern=tp_unknown`, `fraud_txRecord=tx_none` |
| ⑤ | `fraud_transferPattern=tp_none`, `fraud_txRecord=tx_none` |
| ⑥ 직접 입력 | `fraud_transferPattern=direct_input`, `fraud_txRecord=direct_input_detail` |

---

### Q11-A

**고객 화면**

**상대에게 개인정보를 준 적이 있고, 그 뒤 이상한 일이 생겼나요?**

① **개인정보를 주지 않았습니다.** 신분증이나 계좌 정보는 보내지 않아 유출된 것은 없습니다.  
② **이름과 전화번호 같은 기본 정보**를 주었습니다. 그 뒤로 낯선 번호의 광고 문자와 전화가 늘었습니다.  
③ **신분증 사진**을 보냈습니다. 아직 눈에 띄는 이상은 없지만 앞으로 무슨 일이 생길지 걱정입니다.  
④ **계좌번호나 카드 정보**를 알려 주었습니다. 제 이름으로 결제나 대출이 된 흔적을 발견했습니다.  
⑤ **원격 조종 앱을 설치**하게 했습니다. 그 뒤로 수상한 문자와 전화가 계속 오고 있습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_infoGiven=info_none`, `fraud_infoAftermath=ia_none` |
| ② | `fraud_infoGiven=info_basic`, `fraud_infoAftermath=ia_spam` |
| ③ | `fraud_infoGiven=info_id_copy`, `fraud_infoAftermath=ia_none` |
| ④ | `fraud_infoGiven=info_finance`, `fraud_infoAftermath=ia_misuse` |
| ⑤ | `fraud_infoGiven=info_remote`, `fraud_infoAftermath=ia_spam` |
| ⑥ 직접 입력 | `fraud_infoGiven=direct_input`, `fraud_infoAftermath=direct_input_detail` |

---

### Q12-A

**고객 화면**

**지금까지 어떤 조치를 했고, 그 조치에 대해 어떤 답을 받았나요?**

① **아직 아무 조치도 하지 못했습니다.** 어디부터 해야 할지 몰라 시작하지 못한 상태입니다.  
② **은행이나 결제 업체에 지급 정지**를 요청했습니다. 접수는 되었고 처리 결과를 기다리는 중입니다.  
③ **경찰에 신고**했습니다. 신고는 접수되었고 배정된 담당자의 연락을 기다리고 있습니다.  
④ **상대에게 직접 환불을 요구**했습니다. 거절당했거나 오랫동안 답을 받지 못한 상태입니다.  
⑤ **주변 사람이나 상담 기관에 물어보았습니다.** 아직 실제 신고나 요청은 시작하지 않았습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_actionTaken=nothing_yet`, `fraud_actionResponse=rs_not_started` |
| ② | `fraud_actionTaken=bank_recall`, `fraud_actionResponse=rs_waiting` |
| ③ | `fraud_actionTaken=police_report`, `fraud_actionResponse=rs_waiting` |
| ④ | `fraud_actionTaken=direct_refund`, `fraud_actionResponse=rs_rejected` |
| ⑤ | `fraud_actionTaken=consulted_others`, `fraud_actionResponse=rs_not_started` |
| ⑥ 직접 입력 | `fraud_actionTaken=direct_input`, `fraud_actionResponse=direct_input_detail` |

---

### Q13-A

**고객 화면**

**남아 있는 자료는 어느 정도이고, 그 자료는 어디에 보관되어 있나요?**

① **대화와 서류, 입금 내역이 모두** 남아 있습니다. 클라우드나 다른 기기에도 사본을 저장해 두었습니다.  
② **입금 내역만** 남아 있습니다. 휴대폰 안에만 있어서 기기를 잃거나 고장 나면 사라질 수 있습니다.  
③ **대화만** 남아 있습니다. 대화 화면이 휴대폰 안에만 있고 따로 저장은 하지 않았습니다.  
④ **일부를 지웠거나 잃어버렸습니다.** 남은 자료는 종이로 인쇄해 집 서랍에 따로 두었습니다.  
⑤ **남은 자료가 없습니다.** 따로 보관한 곳이 어디에도 없어서 처음부터 다시 모아야 합니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_evidenceState=all_kept`, `fraud_evidenceWhere=kp_backup` |
| ② | `fraud_evidenceState=payment_only`, `fraud_evidenceWhere=kp_phone` |
| ③ | `fraud_evidenceState=chat_only`, `fraud_evidenceWhere=kp_phone` |
| ④ | `fraud_evidenceState=deleted_some`, `fraud_evidenceWhere=kp_paper` |
| ⑤ | `fraud_evidenceState=none_kept`, `fraud_evidenceWhere=kp_none` |
| ⑥ 직접 입력 | `fraud_evidenceState=direct_input`, `fraud_evidenceWhere=direct_input_detail` |

---

# C. 필드 표

모든 질문은 한 문장 안에서 두 가지를 함께 묻고, 선택지는 굵은 요점과 설명 문장으로 두 가지 정보를 함께 담는다. 첫 필드는 질문의 첫째 정보, 둘째 필드는 둘째 정보이며, 결과 문장은 두 정보를 함께 반영하고 위험 규칙·연결 안내의 조건에도 두 필드를 함께 쓴다. 조건에 쓰이지 않는 필드도 이후 상담 정리와 질문 개선을 위해 저장한다. 값 옆은 고객 표시 문구(G).

## C-1. 제출·계약 전 서류 검토

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `fraud_scheme` | `investment`(투자·수익·사업 제휴) / `loan`(대출) / `online_trade`(온라인 거래·임대) / `impersonation`(기관·지인·일자리·연애를 내세움) / `unsure_scheme`(어떤 종류인지 모름) | Q1-B |
| `fraud_offerHolder` | `holder_self`(제 개인 명의로 받음) / `holder_company`(제 회사 명의로 받음) / `holder_other`(가족·지인이 받은 것을 대신 알아봄) | Q1-B |
| `fraud_pretext` | `pre_invest`(고수익·투자·가상자산·다단계·사업 제휴) / `pre_tasks`(소액 과제·구인·아르바이트) / `pre_romance`(연애·결혼·소개) / `pre_deposit`(임대·매매 보증금·예약금, 택배·관세 비용) / `pre_authority`(공안·세무·법원 연락, 비자·체류·행정 대행) | Q2-B |
| `fraud_pretextProof` | `proof_profile`(수익 인증 캡처·후기·프로필을 보여 줌) / `proof_none`(보여 준 자료 없이 말로만 설명함) / `proof_docs`(서류·영수증·신분증 사진을 보여 줌) | Q2-B |
| `fraud_contactChannel` | `direct_contact`(문자·전화·이메일로 연락이 옴) / `messenger`(메신저·소셜 앱으로 연락이 옴) / `online_post`(온라인 광고·게시글·플랫폼에서 만남) / `referral`(지인의 소개로 알게 됨) / `in_person`(직접 만나서 시작됨) | Q3-B |
| `fraud_contactInitiator` | `init_them`(상대가 먼저 연락함) / `init_me`(제가 먼저 연락함) / `init_third`(소개한 지인이 먼저 연결함) | Q3-B |
| `fraud_mainConcern` | `doubt_party`(상대가 진짜인지 모르겠음) / `doubt_sign`(서명해도 되는지·조건이 너무 좋아 보여 걱정함) / `doubt_prepay`(먼저 돈을 보내라는 요구가 괜찮은지 모르겠음) / `doubt_data`(개인정보 요구가 괜찮은지 모르겠음) / `doubt_rush`(재촉이 부담스러움) | Q4-B |
| `fraud_helpWanted` | `help_guide`(스스로 확인할 방법을 원함) / `help_expert`(전문가와 함께 확인하길 원함) | Q4-B |
| `fraud_identityCheck` | `checked_official`(공식 조회로 이름·등록 정보 확인) / `checked_name_only`(회사 이름만 공식 조회로 확인) / `name_only_known`(상대가 말한 이름만 앎) / `check_mismatch`(확인해 보니 정보가 맞지 않음) / `not_checked`(아직 확인하지 않음) | Q5-B |
| `fraud_contactKind` | `ct_company`(회사 대표 연락처를 알려 줌) / `ct_personal`(개인 번호·계정으로만 연락함) / `ct_none`(연락처를 받지 못함) | Q5-B |
| `fraud_benefitType` | `benefit_guaranteed`(원금·수익을 보장한다고 함) / `benefit_high_fixed`(짧은 기간에 아주 높은 확정 수익을 말함) / `benefit_fee_first`(수수료·보증금을 먼저 내라고 함) / `benefit_ordinary`(조건이 일반적이고 특별한 보장은 없음) / `benefit_unexplained`(조건 설명이 거의 없음) | Q6-B |
| `fraud_conditionVia` | `via_capture`(수익 캡처·후기로 조건을 보여 줌) / `via_verbal`(조건을 말로만 전달받음) / `via_written`(조건이 서류·화면에 글로 적혀 있음) | Q6-B |
| `fraud_requestedAction` | `send_first`(먼저 돈을 보내라고 함) / `give_info`(신분증·계좌 정보를 달라고 함) / `install_login`(앱 설치·로그인을 하라고 함) / `meet_move`(만나자거나 다른 곳으로 옮기자고 함) / `sign_now`(서명·계약을 서두르라고 함) | Q7-B |
| `fraud_requestTimes` | `rq_repeated`(같은 요구를 여러 번 받음) / `rq_explained`(필요한 이유를 설명받음) / `rq_once`(그 요구를 한 번 받음) | Q7-B |
| `fraud_accountMatch` | `matches_party`(계좌 명의가 상대 이름과 같음) / `differs_party`(계좌 명의가 상대 이름과 다르거나 개인 명의) / `multiple_accounts`(계좌가 여러 개이거나 자주 바뀜) / `overseas_or_crypto`(해외 계좌·가상자산 주소) / `account_not_given`(계좌가 아직 안내되지 않음) | Q8-B |
| `fraud_askAmount` | `ask_1m_10m`(요구 금액이 100만 동 이상 1천만 동 미만) / `ask_over10m`(요구 금액이 1천만 동 이상) / `ask_under1m`(요구 금액이 100만 동 미만) / `ask_unstated`(요구 금액이 정해지지 않음) | Q8-B |
| `fraud_pressureType` | `press_none`(재촉 없음) / `press_deadline`(기한·마감 임박을 내세워 재촉) / `press_secret`(비밀 유지 요구) / `press_evasive`(확인하겠다고 하면 화를 내거나 말을 돌림) / `press_third_party`(지인·제3자를 내세워 압박) | Q9-B |
| `fraud_pressureFreq` | `pf_none`(재촉 연락이 없음) / `pf_daily`(매일 여러 번 연락함) / `pf_once`(한 번 강하게 말함) | Q9-B |
| `fraud_recordKind` | `contract_full`(상대 정보가 모두 적힌 계약서·약정서) / `contract_partial`(상대 정보가 일부만 적힌 계약서·제안서) / `chat_log`(안내문·광고 화면·대화 내용만 있음) / `pay_request`(입금 안내만 받음) / `no_record`(받은 서류 없음) | Q10-B |
| `fraud_recordRead` | `rd_not`(서류를 거의 이해하지 못함) / `rd_partly`(서류를 일부만 이해함) / `rd_understood`(서류를 읽고 이해함) / `rd_na`(읽을 서류가 없음) | Q10-B |
| `fraud_actionTaken` | `nothing_yet`(아무것도 하지 않음) / `asked_only`(문의만 해 봄) / `gave_info`(개인정보 제공·앱 설치·로그인) / `sent_small`(소액을 먼저 보냄) / `signed_already`(서명·도장을 이미 함) | Q11-B |
| `fraud_followUp` | `fu_none`(그 뒤 상대의 추가 연락이 없음) / `fu_more`(그 뒤에도 추가 요구가 계속됨) / `fu_cut`(그 뒤 상대가 연락을 끊음) | Q11-B |
| `fraud_verifyReaction` | `react_open`(기꺼이 자료를 줌) / `react_inconsistent`(대답이 바뀌거나 앞뒤가 맞지 않음) / `react_pressure`(오히려 서두르라고 재촉함) / `react_cut`(연락을 끊거나 차단함) / `react_untested`(아직 확인하겠다고 말해 보지 않음) | Q12-B |
| `fraud_afterReaction` | `ar_continue`(그 반응을 믿고 계속 진행함) / `ar_paused`(진행을 멈추고 생각 중임) / `ar_asked`(주변 사람에게 의견을 물음) | Q12-B |
| `fraud_evidenceState` | `all_kept`(대화·서류·입금 내역이 모두 있음) / `chat_only`(대화만 있음) / `docs_only`(서류만 있음) / `deleted_some`(일부를 지웠거나 잃어버림) / `none_kept`(남은 자료 없음) | Q13-B |
| `fraud_evidenceWhere` | `kp_backup`(클라우드·다른 기기에도 백업함) / `kp_phone`(휴대폰 안에만 있음) / `kp_paper`(종이 서류로 보관함) / `kp_none`(보관한 곳이 없음) | Q13-B |

## C-2. 문제 발생 후 대응 검토

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `fraud_scheme` | `investment`(투자·수익·사업 제휴) / `loan`(대출) / `online_trade`(온라인 거래·임대) / `impersonation`(기관·지인·일자리·연애를 내세움) / `unsure_scheme`(어떤 종류인지 모름) | Q1-A |
| `fraud_victimHolder` | `victim_self`(제 개인 명의의 일) / `victim_company`(제 회사 명의의 일) / `victim_other`(가족·지인이 겪은 일을 대신 알아봄) | Q1-A |
| `fraud_pretext` | `pre_invest`(고수익·투자·가상자산·다단계·사업 제휴) / `pre_tasks`(소액 과제·구인·아르바이트) / `pre_romance`(연애·결혼·소개) / `pre_deposit`(임대·매매 보증금·예약금, 택배·관세 비용) / `pre_authority`(공안·세무·법원 연락, 비자·체류·행정 대행) | Q2-A |
| `fraud_recoveryOffer` | `ro_offered`(피해 회복 대행 제안을 받음) / `ro_none`(피해 회복 대행 제안은 받지 않음) / `ro_considering`(회복 대행 제안을 받고 고민 중임) | Q2-A |
| `fraud_contactChannel` | `direct_contact`(문자·전화·이메일로 연락이 옴) / `messenger`(메신저·소셜 앱으로 연락이 옴) / `online_post`(온라인 광고·게시글·플랫폼에서 만남) / `referral`(지인의 소개로 알게 됨) / `in_person`(직접 만나서 시작됨) | Q3-A |
| `fraud_contactInitiator` | `init_them`(상대가 먼저 연락함) / `init_me`(제가 먼저 연락함) / `init_third`(소개한 지인이 먼저 연결함) | Q3-A |
| `fraud_mainConcern` | `doubt_recover`(보낸 돈이 어떻게 될지 걱정함) / `doubt_more`(상대의 추가 요구가 걱정됨) / `doubt_cut`(연락이 끊기고 증거가 부족해 걱정함) / `doubt_where`(어디에 알려야 하는지 모르겠음) / `doubt_leak`(개인정보를 준 것이 걱정됨) | Q4-A |
| `fraud_helpWanted` | `help_expert`(전문가와 함께 확인하길 원함) / `help_guide`(스스로 확인할 방법을 원함) | Q4-A |
| `fraud_elapsedTime` | `elapsed_today`(알게 된 지 하루 이내) / `elapsed_week`(알게 된 지 일주일 이내) / `elapsed_month`(알게 된 지 한 달쯤) / `elapsed_half_year`(알게 된 지 반년쯤) / `elapsed_over_half`(알게 된 지 반년 넘음) | Q5-A |
| `fraud_sentAfter` | `sa_none`(알게 된 뒤 돈을 더 보내지 않음) / `sa_some`(알게 된 뒤에도 돈을 더 보냄) / `sa_unsure`(더 보낸 돈이 있는지 불분명함) / `sa_na`(연락이 끊겨 더 보낼 일이 없었음) | Q5-A |
| `fraud_discovery` | `disc_contact_cut`(상대가 갑자기 연락을 끊음) / `disc_broken_promise`(약속한 수익·물건이 오지 않음) / `disc_more_fees`(추가 비용을 계속 요구함) / `disc_outside`(은행·가족 등 바깥에서 알려 줌) / `disc_self_check`(직접 조회해 보고 알게 됨) | Q6-A |
| `fraud_firstConsult` | `cs_alone`(혼자 고민하고 있음) / `cs_family`(가족·지인과 상의함) / `cs_official`(은행·경찰 등 공식 기관에 문의함) | Q6-A |
| `fraud_counterpartyStance` | `demands_more`(더 보내라고 계속 요구함) / `excuses`(핑계를 대며 시간을 끎) / `threatens`(신고하면 불이익이 있다고 협박함) / `silent`(연락에 답이 없음) / `blocked_changed`(차단했거나 연락처를 바꿈) | Q7-A |
| `fraud_refundPromise` | `rp_promised`(곧 돌려주겠다고 약속함) / `rp_denied`(돌려줄 수 없다고 거절함) / `rp_none`(환불 이야기가 오가지 않음) | Q7-A |
| `fraud_payMethod` | `pay_bank`(은행 계좌로 송금함) / `pay_wallet`(전자지갑·간편결제로 보냄) / `pay_crypto`(가상자산으로 보냄) / `pay_cash`(현금·상품권으로 건넴) / `pay_none`(아직 돈을 보내지 않음) | Q8-A |
| `fraud_moneySource` | `src_own`(내 돈으로 냄) / `src_borrowed`(빌린 돈으로 냄) / `src_company`(회사 돈·남의 돈으로 냄) / `src_na`(보낸 돈이 없음) | Q8-A |
| `fraud_lossScale` | `loss_none`(손해 없음) / `loss_under_1m`(100만 동 미만 손해) / `loss_1m_10m`(100만 동 이상 1천만 동 미만 손해) / `loss_10m_100m`(1천만 동 이상 1억 동 미만 손해) / `loss_over_100m`(1억 동 이상 손해) | Q9-A |
| `fraud_lossImpact` | `li_none`(생활에 큰 영향 없음) / `li_manageable`(부담되지만 감당할 수 있음) / `li_serious`(생활·사업에 심각한 영향) | Q9-A |
| `fraud_transferPattern` | `tp_once_one`(한 번에 한 계좌로 보냄) / `tp_many_one`(여러 번 같은 계좌로 보냄) / `tp_many_multi`(여러 계좌로 나누어 보냄) / `tp_unknown`(보낸 경로가 기억나지 않음) / `tp_none`(보낸 돈이 없음) | Q10-A |
| `fraud_txRecord` | `tx_have`(송금 내역을 모두 가지고 있음) / `tx_partial`(송금 내역을 일부만 가지고 있음) / `tx_none`(송금 내역이 없음) | Q10-A |
| `fraud_infoGiven` | `info_none`(개인정보를 주지 않음) / `info_basic`(이름·전화번호 등 기본 정보 제공) / `info_id_copy`(신분증 사진 제공) / `info_finance`(계좌·카드 정보 제공) / `info_remote`(원격 조종 앱을 설치함) | Q11-A |
| `fraud_infoAftermath` | `ia_none`(아직 눈에 띄는 이상은 없음) / `ia_spam`(스팸 전화·문자가 늘어남) / `ia_misuse`(내 이름으로 도용된 흔적이 있음) | Q11-A |
| `fraud_actionTaken` | `nothing_yet`(아무것도 하지 않음) / `bank_recall`(은행·결제 업체에 지급 정지 요청) / `police_report`(경찰에 신고함) / `direct_refund`(상대에게 직접 환불을 요구함) / `consulted_others`(주변 사람이나 상담 기관에 물어봄) | Q12-A |
| `fraud_actionResponse` | `rs_not_started`(아직 처리가 시작되지 않음) / `rs_waiting`(접수하고 결과를 기다리는 중) / `rs_rejected`(거절되거나 답을 받지 못함) | Q12-A |
| `fraud_evidenceState` | `all_kept`(대화·서류·입금 내역이 모두 있음) / `payment_only`(입금 내역만 남아 있음) / `chat_only`(대화만 있음) / `deleted_some`(일부를 지웠거나 잃어버림) / `none_kept`(남은 자료 없음) | Q13-A |
| `fraud_evidenceWhere` | `kp_backup`(클라우드·다른 기기에도 백업함) / `kp_phone`(휴대폰 안에만 있음) / `kp_paper`(종이 서류로 보관함) / `kp_none`(보관한 곳이 없음) | Q13-A |

# D. 라우팅

1. 진입 화면에서 ①을 고르면 경로 B(제출·계약 전), ②를 고르면 경로 A(문제 발생 후)로 이동한다.
2. ③ 잘 모르겠습니다와 ④ 직접 입력은 기본 경로인 B로 이동하며, 선택 방식(`fraud_routeSelectionMode`)만 다르게 저장한다.
3. 경로 안에서는 Q1부터 Q13까지 순서대로 진행하며 생략하지 않는다. 1차(Q1~Q4) 종료 시 E-1 무료 결과, 2차(Q5~Q13) 종료 시 E-2 결과를 표시한다.
4. 1차에서 받은 수법(`fraud_scheme`)과 사전/사후 구분은 2차에서 다시 묻지 않는다.
5. 공식 기관 명의 사용이나 큰 금액 등 연결 조건은 E-3의 권유 문구로만 안내하며, 질문이나 경로를 바꾸지 않는다.

---

# E. 결과

## E-1. 1차 무료 결과

마스터 1차 결과 구성을 따른다: **01 현재 상황**(판정 1줄 + 본문 1~2문장), **02 핵심 확인 결과**(카드 3개, 카드 하단 문구 약 48자 이내), **03 주요 위험 요소**(최대 4개). 04·05는 무료 1차에서 노출하지 않는다.

- 판정·본문 = Q4 선택지, 카드1 = Q1, 카드2 = Q2, 카드3 = Q3 선택지에서 가져온다(질문·선택지가 정해지면 문장이 정해지므로 조사 오류가 없다).
- 선택지 키 = 해당 선택지의 저장 필드 쌍.
- 직접 입력을 고른 항목은 해당 칸에 `직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.`를 표시한다(카드·본문 공통).

### E-1-B. 제출·계약 전 서류 검토

**카드1 (받은 제안의 종류)** — Q1-B

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_scheme=investment`, `fraud_offerHolder=holder_self` | 개인 돈을 맡기는 투자·수익 제안을 받은 상황입니다 | 28 |
| ② | `fraud_scheme=loan`, `fraud_offerHolder=holder_company` | 회사 이름으로 대출 제안을 받은 상황입니다 | 23 |
| ③ | `fraud_scheme=online_trade`, `fraud_offerHolder=holder_self` | 개인 이름으로 온라인 거래·임대 제안을 받은 상황입니다 | 30 |
| ④ | `fraud_scheme=impersonation`, `fraud_offerHolder=holder_other` | 가족·지인이 받은 제안을 대신 알아보는 상황입니다 | 27 |
| ⑤ | `fraud_scheme=unsure_scheme`, `fraud_offerHolder=holder_company` | 회사로 종류를 알 수 없는 제안을 받은 상황입니다 | 27 |

**카드2 (상대가 내세운 명목)** — Q2-B

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_pretext=pre_invest`, `fraud_pretextProof=proof_profile` | 수익 인증을 앞세운 투자·제휴 제안을 받은 상황입니다 | 29 |
| ② | `fraud_pretext=pre_tasks`, `fraud_pretextProof=proof_none` | 말로만 설명하는 과제·구인 제안을 받은 상황입니다 | 27 |
| ③ | `fraud_pretext=pre_romance`, `fraud_pretextProof=proof_profile` | 프로필로 관계를 쌓는 연애·소개 제안을 받은 상황입니다 | 30 |
| ④ | `fraud_pretext=pre_deposit`, `fraud_pretextProof=proof_docs` | 서류를 보여 주는 보증금·택배 비용 요구를 받은 상황입니다 | 32 |
| ⑤ | `fraud_pretext=pre_authority`, `fraud_pretextProof=proof_docs` | 공문 사진을 보여 주는 기관·행정 대행 연락을 받은 상황입니다 | 34 |

**카드3 (연락이 닿은 경로)** — Q3-B

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_contactChannel=direct_contact`, `fraud_contactInitiator=init_them` | 문자·전화·이메일로 상대가 먼저 연락해 온 상황입니다 | 29 |
| ② | `fraud_contactChannel=messenger`, `fraud_contactInitiator=init_them` | 메신저로 상대가 먼저 말을 걸어 온 상황입니다 | 25 |
| ③ | `fraud_contactChannel=online_post`, `fraud_contactInitiator=init_me` | 온라인 글을 보고 제가 먼저 연락한 상황입니다 | 25 |
| ④ | `fraud_contactChannel=referral`, `fraud_contactInitiator=init_third` | 지인의 소개로 연결된 상황입니다 | 17 |
| ⑤ | `fraud_contactChannel=in_person`, `fraud_contactInitiator=init_me` | 제가 먼저 찾아가 직접 만나서 시작된 상황입니다 | 26 |

**01 판정 + 본문** — Q4-B

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `fraud_mainConcern=doubt_party`, `fraud_helpWanted=help_guide` | 상대의 실체 확인이 먼저 필요한 제안입니다 | 상대가 알려 준 연락처가 아니라 공식 조회와 공개 자료로 이름과 등록 정보를 확인하세요. 확인이 끝나기 전에는 송금이나 서명을 미루는 것이 안전합니다. |
| ② | `fraud_mainConcern=doubt_sign`, `fraud_helpWanted=help_expert` | 서명 전에 조건과 서류 확인이 필요한 제안입니다 | 서명한 문서는 이후 다투기 어려울 수 있어 조건을 읽고 이해한 뒤에 서명하세요. 말로 들은 조건이 문서에도 있는지 대조해 보세요. |
| ③ | `fraud_mainConcern=doubt_prepay`, `fraud_helpWanted=help_expert` | 먼저 송금하라는 요구는 확인 후에 판단할 제안입니다 | 수익이나 서비스를 받기 전에 먼저 돈을 내라는 구조는 특히 신중해야 합니다. 보내기 전에 상대 정보와 계좌 명의를 확인하고 요구 내용을 글로 남겨 두세요. |
| ④ | `fraud_mainConcern=doubt_data`, `fraud_helpWanted=help_guide` | 개인정보 제공 전에 요구의 필요성을 확인해야 하는 제안입니다 | 신분증이나 계좌, 인증번호는 필요한 이유를 확인하기 전에는 제공하지 않는 것이 안전합니다. 꼭 필요한 항목만 내도 되는지 먼저 물어보세요. |
| ⑤ | `fraud_mainConcern=doubt_rush`, `fraud_helpWanted=help_guide` | 재촉에 흔들리지 않고 확인할 시간이 필요한 상황입니다 | 서두르게 만드는 요구는 확인할 시간을 주지 않으려는 방식일 수 있습니다. 시간을 달라고 말한 뒤 상대의 반응도 함께 기록해 두세요. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (pre_exposed) | `fraud_actionTaken` ∈ {gave_info, sent_small, signed_already} | 이미 정보를 주었거나 앱을 설치했거나 송금·서명을 했다면 추가 응답 전에 상황 정리가 먼저입니다 |
| 2 (pre_account) | `fraud_accountMatch` ∈ {differs_party, multiple_accounts, overseas_or_crypto} | 송금 계좌의 명의나 수단이 서류와 맞지 않거나 되돌리기 어려워 보내기 전에 확인이 필요합니다 |
| 3 (pre_prepay) | `fraud_benefitType` ∈ {benefit_fee_first, benefit_guaranteed, benefit_high_fixed} 또는 `fraud_requestedAction` ∈ {send_first} 또는 `fraud_mainConcern` ∈ {doubt_prepay} | 먼저 돈을 내거나 수익을 보장한다는 조건은 근거를 확인하기 전에는 응하지 않는 것이 안전합니다 |
| 4 (pre_pressure) | `fraud_pressureType` ∈ {press_secret, press_evasive, press_third_party} 또는 `fraud_verifyReaction` ∈ {react_pressure, react_cut, react_inconsistent} | 재촉이나 비밀 요구, 확인을 피하는 반응은 확인할 시간을 막는 신호일 수 있습니다 |
| 5 (pre_identity) | `fraud_identityCheck` ∈ {name_only_known, check_mismatch, not_checked, checked_name_only} | 상대나 회사 정보가 확인되지 않아 송금이나 서명 전에 공식 자료로 대조해야 합니다 |
| 6 (pre_authority) | `fraud_pretext` ∈ {pre_authority} | 기관을 내세운 연락이라면 연락처가 아니라 공식 자료의 연락처로 사실을 먼저 확인해야 합니다 |
| 7 (pre_record) | `fraud_recordKind` ∈ {chat_log, pay_request, no_record} | 서류나 상대 정보가 부족해 조건을 문서로 받아 두는 것이 먼저입니다 |
| 8 (pre_evidence) | `fraud_evidenceState` ∈ {deleted_some, none_kept} | 남은 자료가 부족해 지금부터 오는 연락과 안내를 모두 저장해 두어야 합니다 |
| 기본 | 위 조건에 하나도 해당하지 않음 | 입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 서명이나 송금 전에 상대와 서류를 한 번 더 확인하세요 |

### E-1-A. 문제 발생 후 대응 검토

**카드1 (겪은 문제의 종류)** — Q1-A

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_scheme=investment`, `fraud_victimHolder=victim_self` | 개인 돈을 맡긴 투자·수익 관련 문제를 겪은 상황입니다 | 30 |
| ② | `fraud_scheme=loan`, `fraud_victimHolder=victim_company` | 회사 이름으로 한 대출 관련 문제를 겪은 상황입니다 | 28 |
| ③ | `fraud_scheme=online_trade`, `fraud_victimHolder=victim_self` | 개인 이름으로 한 온라인 거래·임대 문제를 겪은 상황입니다 | 32 |
| ④ | `fraud_scheme=impersonation`, `fraud_victimHolder=victim_other` | 가족·지인이 겪은 일을 대신 알아보는 상황입니다 | 26 |
| ⑤ | `fraud_scheme=unsure_scheme`, `fraud_victimHolder=victim_company` | 회사 직원이 함께 겪은 종류 불명의 문제 상황입니다 | 28 |

**카드2 (상대가 내세웠던 명목)** — Q2-A

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_pretext=pre_invest`, `fraud_recoveryOffer=ro_offered` | 투자·제휴 피해 뒤 회복 대행 제안까지 받은 상황입니다 | 30 |
| ② | `fraud_pretext=pre_tasks`, `fraud_recoveryOffer=ro_none` | 과제·구인 명목으로 피해를 겪은 상황입니다 | 23 |
| ③ | `fraud_pretext=pre_romance`, `fraud_recoveryOffer=ro_none` | 연애·소개 명목으로 피해를 겪은 상황입니다 | 23 |
| ④ | `fraud_pretext=pre_deposit`, `fraud_recoveryOffer=ro_considering` | 보증금·택배 비용 피해 뒤 회복 제안을 고민하는 상황입니다 | 32 |
| ⑤ | `fraud_pretext=pre_authority`, `fraud_recoveryOffer=ro_offered` | 기관 명목 피해 뒤 해결 대행 제안을 받은 상황입니다 | 29 |

**카드3 (연락이 닿았던 경로)** — Q3-A

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_contactChannel=direct_contact`, `fraud_contactInitiator=init_them` | 문자·전화·이메일로 상대가 먼저 연락해 왔던 상황입니다 | 30 |
| ② | `fraud_contactChannel=messenger`, `fraud_contactInitiator=init_them` | 메신저로 상대가 먼저 말을 걸어 왔던 상황입니다 | 26 |
| ③ | `fraud_contactChannel=online_post`, `fraud_contactInitiator=init_me` | 온라인 글을 보고 제가 먼저 연락했던 상황입니다 | 26 |
| ④ | `fraud_contactChannel=referral`, `fraud_contactInitiator=init_third` | 지인의 소개로 연결되었던 상황입니다 | 19 |
| ⑤ | `fraud_contactChannel=in_person`, `fraud_contactInitiator=init_me` | 제가 먼저 찾아가 직접 만나서 시작되었던 상황입니다 | 28 |

**01 판정 + 본문** — Q4-A

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `fraud_mainConcern=doubt_recover`, `fraud_helpWanted=help_expert` | 송금 후 가능한 조치를 빨리 확인해야 하는 상황입니다 | 송금 내역과 받은 계좌 정보를 정리해 가능한 한 빨리 거래 은행에 문의해 보세요. 피해 회복 여부는 사정에 따라 달라 이 서비스에서 판단하지 않습니다. |
| ② | `fraud_mainConcern=doubt_more`, `fraud_helpWanted=help_guide` | 추가 요구에 응하기 전에 멈추는 것이 우선인 상황입니다 | 더 보내면 해결된다는 말에는 응하지 말고 요구 내용과 날짜를 그대로 보관하세요. 이미 보낸 내역을 정리한 뒤 전문가 확인을 살펴보세요. |
| ③ | `fraud_mainConcern=doubt_cut`, `fraud_helpWanted=help_guide` | 남은 대화와 송금 기록을 먼저 확보해야 하는 상황입니다 | 상대 계정, 번호, 계좌 정보가 남아 있을 때 화면을 날짜와 함께 저장하세요. 연락이 끊겼다는 사실도 날짜와 함께 기록하세요. |
| ④ | `fraud_mainConcern=doubt_where`, `fraud_helpWanted=help_expert` | 알릴 곳과 준비 자료를 정리해야 하는 상황입니다 | 송금한 은행, 거래한 플랫폼, 수사기관 중 어디에 어떤 자료를 낼지 정해 두면 도움이 됩니다. 알리는 방법은 구두나 서면이 가능하니 자료를 먼저 정리하세요. |
| ⑤ | `fraud_mainConcern=doubt_leak`, `fraud_helpWanted=help_guide` | 제공한 개인정보를 보호하는 조치가 먼저 필요한 상황입니다 | 제공한 정보의 종류와 날짜를 정리하세요. 계좌나 인증번호를 줬다면 해당 금융기관에 알리는 방법을 먼저 확인하세요. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (post_amount) | `fraud_lossScale` ∈ {loss_10m_100m, loss_over_100m} | 피해 금액이 커서 은행과 관련 기관에 빨리 알리고 전문가와 함께 진행하는 방법을 살펴볼 필요가 있습니다 |
| 2 (post_more) | `fraud_counterpartyStance` ∈ {demands_more, threatens} 또는 `fraud_discovery` ∈ {disc_more_fees} 또는 `fraud_mainConcern` ∈ {doubt_more} | 추가 송금이나 위협이 이어지고 있어 요구에 응하기 전에 멈추고 기록을 남겨야 합니다 |
| 3 (post_method) | `fraud_payMethod` ∈ {pay_crypto, pay_cash} | 송금 수단이 기록을 남기기 어렵거나 되돌리기 어려워 거래 내역을 서둘러 확보해야 합니다 |
| 4 (post_info) | `fraud_infoGiven` ∈ {info_id_copy, info_finance, info_remote} 또는 `fraud_mainConcern` ∈ {doubt_leak} | 신분·금융 정보를 주었거나 기기 접근을 허용했다면 정보 보호 조치를 먼저 확인해야 합니다 |
| 5 (post_contact) | `fraud_counterpartyStance` ∈ {silent, blocked_changed} 또는 `fraud_discovery` ∈ {disc_contact_cut} 또는 `fraud_mainConcern` ∈ {doubt_cut} | 상대와 연락이 끊기거나 차단되어 있어 남아 있는 대화와 송금 기록을 먼저 확보해야 합니다 |
| 6 (post_time) | `fraud_elapsedTime` ∈ {elapsed_half_year, elapsed_over_half} | 시간이 지났다면 거래 내역과 기록 확인이 어려워질 수 있어 가능한 한 빨리 확인하는 것이 좋습니다 |
| 7 (post_account) | `fraud_transferPattern` ∈ {tp_many_multi, tp_unknown} | 송금 계좌가 여러 개이거나 알 수 없어 계좌별 송금 내역을 따로 정리해 둘 필요가 있습니다 |
| 8 (post_recovery_offer) | `fraud_recoveryOffer` ∈ {ro_offered, ro_considering} | 피해 회복을 대행해 준다는 제안은 추가 비용 요구로 이어질 수 있어 먼저 확인이 필요합니다 |
| 9 (post_evidence) | `fraud_evidenceState` ∈ {deleted_some, none_kept, chat_only, payment_only} | 자료가 일부 또는 전부 없는 상태라 은행 거래 내역과 앱 기록으로 다시 모을 수 있는지 확인이 필요합니다 |
| 10 (post_noaction) | `fraud_actionTaken` ∈ {nothing_yet} | 공식 경로에 알린 조치가 없어 자료 정리와 은행 문의부터 시작하는 것이 좋습니다 |
| 기본 | 위 조건에 하나도 해당하지 않음 | 입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 송금 내역과 대화 기록은 계속 보관해 두세요 |

## E-2. 2차 결과 (경로별)

2차 결과는 질문 하나당 소제목 1개와 선택지별 문장 1개로 구성한다. 선택지의 저장 필드 쌍이 키이며, 문장은 선택한 구체 값을 반영한다. 직접 입력을 고른 질문은 `직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.`를 표시한다.

### E-2-B. 제출·계약 전 서류 검토

**상대 정보의 확인** — Q5-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_identityCheck=checked_official`, `fraud_contactKind=ct_company` | 공식 조회로 확인된 부분은 의미가 있지만 연락해 온 사람이 그 회사 소속인지는 따로 봐야 합니다. 대표 연락처까지 같다면 연락한 사람이 그 회사 직원인지도 그 번호로 직접 물어 확인하세요. |
| ② | `fraud_identityCheck=checked_name_only`, `fraud_contactKind=ct_personal` | 회사가 실제로 있어도 그 이름을 사칭할 수 있습니다. 개인 연락처로만 연락한다면 그 사람이 회사 소속인지 회사 대표 번호로 따로 확인해야 합니다. |
| ③ | `fraud_identityCheck=name_only_known`, `fraud_contactKind=ct_personal` | 상대가 직접 말해 준 이름만으로는 확인된 것이 아닙니다. 개인 번호뿐이라면 이름을 공식 조회에서 먼저 찾아본 뒤 연락처가 회사의 것인지 대조하세요. |
| ④ | `fraud_identityCheck=check_mismatch`, `fraud_contactKind=ct_company` | 정보가 맞지 않는다면 그 점이 확인의 핵심 단서입니다. 알려 준 연락처와 조회 결과가 다르다는 점을 메모해 두고 그 연락처로는 더 연락하지 마세요. |
| ⑤ | `fraud_identityCheck=not_checked`, `fraud_contactKind=ct_none` | 송금이나 서명 전에 이름, 등록번호, 대표자를 공식 자료로 대조하는 것이 첫 확인입니다. 연락처를 받지 못했다면 회사 대표 연락처를 먼저 요청하고, 그 번호를 공식 자료와 대조하세요. |

**수익·조건의 성격** — Q6-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_benefitType=benefit_guaranteed`, `fraud_conditionVia=via_capture` | 보장 문구가 문서로 남아 있는지, 누가 책임지는지 확인하세요. 캡처나 후기는 누구나 만들 수 있으니 조건이 계약서에 글로 적혀 있는지 따로 확인하세요. |
| ② | `fraud_benefitType=benefit_high_fixed`, `fraud_conditionVia=via_verbal` | 단기간의 높은 확정 수익은 근거를 확인하기 전에는 믿기 어려운 조건입니다. 말로만 한 약속은 나중에 증명하기 어려우니 같은 내용을 글로 보내 달라고 요청해 두세요. |
| ③ | `fraud_benefitType=benefit_fee_first`, `fraud_conditionVia=via_written` | 서비스나 수익을 받기 전에 수수료를 먼저 내라는 구조는 특히 신중해야 합니다. 글로 적혀 있더라도 먼저 내는 돈의 근거가 공식 자료로 확인되는지 따져 보세요. |
| ④ | `fraud_benefitType=benefit_ordinary`, `fraud_conditionVia=via_written` | 조건이 일반적이어도 상대 확인과 서류 대조는 필요합니다. 글로 받은 조건이라면 그 문구를 보관하고 말로 들은 내용과 같은지 대조해 보세요. |
| ⑤ | `fraud_benefitType=benefit_unexplained`, `fraud_conditionVia=via_verbal` | 조건을 모르는 채로 진행하지 말고 조건을 글로 요청하세요. 조건을 글로 정리해 달라고 요청하고, 거절하거나 미룬다면 그 반응을 기록해 두세요. |

**상대의 현재 요구** — Q7-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_requestedAction=send_first`, `fraud_requestTimes=rq_repeated` | 먼저 송금하는 요구에는 보내기 전에 상대와 계좌를 확인하세요. 같은 요구가 반복되는 것 자체가 압박이므로 요구가 올 때마다 날짜와 내용을 기록하고 응하지 마세요. |
| ② | `fraud_requestedAction=give_info`, `fraud_requestTimes=rq_explained` | 신분증과 계좌 정보는 악용될 수 있어 요구가 공식인지 확인한 뒤에 제공하세요. 설명된 이유가 공식 절차와 맞는지 확인하기 전에는 보내지 말고 꼭 필요한 항목만 정하세요. |
| ③ | `fraud_requestedAction=install_login`, `fraud_requestTimes=rq_once` | 앱 설치나 로그인은 계정과 기기에 접근을 줄 수 있어 신중해야 합니다. 아직 하지 않았다면 그대로 멈추고 공식 앱 스토어와 공식 사이트에서 같은 앱이 있는지 확인하세요. |
| ④ | `fraud_requestedAction=meet_move`, `fraud_requestTimes=rq_repeated` | 만남이나 장소 이동 요구는 혼자 응하지 말고 믿을 만한 사람에게 알려 두세요. 반복되는 제안은 기록이 남지 않는 곳으로 옮기려는 시도일 수 있으니 현재 대화방의 기록을 먼저 보관하세요. |
| ⑤ | `fraud_requestedAction=sign_now`, `fraud_requestTimes=rq_once` | 서명을 서두르는 것은 확인할 시간을 막는 방식일 수 있습니다. 읽는 중이라면 이해할 때까지 서명을 미루고 모르는 조항은 표시해 전문가에게 가져가세요. |

**송금 계좌의 명의** — Q8-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_accountMatch=matches_party`, `fraud_askAmount=ask_1m_10m` | 명의가 서류 속 상대와 같더라도 그 이름이 실제 존재하는 사람이나 회사인지 확인해 보세요. 중간 규모의 금액이므로 명의가 같아도 상대의 등록 정보를 먼저 확인한 뒤에 판단하세요. |
| ② | `fraud_accountMatch=differs_party`, `fraud_askAmount=ask_over10m` | 명의가 다르다면 이유를 글로 물어보고 답을 기록하세요. 큰 금액을 명의가 다른 계좌로 보내는 것은 특히 위험하므로 이유를 글로 받기 전에는 송금하지 마세요. |
| ③ | `fraud_accountMatch=multiple_accounts`, `fraud_askAmount=ask_under1m` | 계좌가 바뀌는 이유를 확인하고 바뀐 계좌와 날짜를 모두 적어 두세요. 소액으로 나눠 보내게 하는 방식은 의심을 줄이려는 것일 수 있으니 합산 금액을 따져 보세요. |
| ④ | `fraud_accountMatch=overseas_or_crypto`, `fraud_askAmount=ask_over10m` | 해외 계좌나 가상자산은 되돌리기 어려운 경우가 많아 보내기 전에 더 신중해야 합니다. 큰 금액과 추적이 어려운 수단이 함께라면 보내기 전에 전문가와 상담하는 것을 권합니다. |
| ⑤ | `fraud_accountMatch=account_not_given`, `fraud_askAmount=ask_unstated` | 계좌가 안내되면 명의가 서류의 상대와 같은지 먼저 확인하세요. 금액과 계좌가 정해지기 전에 확인할 수 있는 것을 먼저 확인하고, 안내가 오면 글로 받아 두세요. |

**재촉과 압박** — Q9-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_pressureType=press_none`, `fraud_pressureFreq=pf_none` | 재촉이 없다면 확인할 시간을 충분히 가질 수 있습니다. 재촉이 없다면 서두르지 말고 확인에 필요한 시간을 충분히 쓰세요. |
| ② | `fraud_pressureType=press_deadline`, `fraud_pressureFreq=pf_daily` | 기한의 근거가 문서에 있는지 확인하고 기한을 이유로 확인을 생략하지 마세요. 매일 반복되는 재촉은 연락 기록을 남기고 한 번에 답하지 말고 확인할 시간을 달라고 말하세요. |
| ③ | `fraud_pressureType=press_secret`, `fraud_pressureFreq=pf_once` | 주변에 말하지 못하게 하는 것은 확인을 막으려는 방식일 수 있습니다. 한 번이라도 비밀을 요구했다면 그 문구를 저장해 두고 믿을 만한 사람과 상의하세요. |
| ④ | `fraud_pressureType=press_evasive`, `fraud_pressureFreq=pf_once` | 확인을 피하는 반응은 중요한 단서입니다. 그 반응이 한 번이었더라도 대화 기록을 보관하고 다시 한 번 확인을 요청해 보세요. |
| ⑤ | `fraud_pressureType=press_third_party`, `fraud_pressureFreq=pf_daily` | 지인이나 제3자의 말도 별도 확인이 필요합니다. 여러 사람이 번갈아 연락하는 것은 하나의 시도일 수 있으니 각자의 연락처와 말한 내용을 모아 두세요. |

**받은 서류와 기록** — Q10-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_recordKind=contract_full`, `fraud_recordRead=rd_not` | 계약서가 있다면 상대 이름·주소·등록번호가 공식 자료와 같은지 대조하세요. 이해하지 못한 서류에는 서명하지 말고 번역과 설명을 받은 뒤에 판단하세요. |
| ② | `fraud_recordKind=contract_partial`, `fraud_recordRead=rd_partly` | 상대 정보가 빠진 서류는 보완을 요청하고 받은 답을 기록하세요. 이해하지 못한 부분을 표시해 두고 그 부분만 먼저 설명을 받아 보세요. |
| ③ | `fraud_recordKind=chat_log`, `fraud_recordRead=rd_understood` | 대화 내용은 날짜와 상대 이름이 보이게 순서대로 캡처해 두세요. 내용은 이해했으니 핵심 조건을 글로 정리해 달라고 요청해 서류 형태로 받아 두세요. |
| ④ | `fraud_recordKind=pay_request`, `fraud_recordRead=rd_understood` | 입금 안내만 있다면 무엇에 대한 돈인지 문서로 확인하는 것이 먼저입니다. 무엇에 대한 돈인지 글로 먼저 받기 전에는 입금하지 마세요. |
| ⑤ | `fraud_recordKind=no_record`, `fraud_recordRead=rd_na` | 서류가 없을수록 이후 확인이 어려워지므로 지금부터 대화와 안내를 모두 저장하세요. 서류가 없으니 계약서·상대 등록 정보·조건 설명서를 먼저 요청하세요. |

**이미 한 일** — Q11-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_actionTaken=nothing_yet`, `fraud_followUp=fu_none` | 아직 아무것도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 추가 연락이 없는 지금이 가장 안전하게 확인할 수 있는 시점입니다. |
| ② | `fraud_actionTaken=asked_only`, `fraud_followUp=fu_more` | 문의한 내용과 받은 답을 날짜와 함께 기록하세요. 연락이 계속된다면 응답을 서두르지 말고 오는 연락을 모두 보관하세요. |
| ③ | `fraud_actionTaken=gave_info`, `fraud_followUp=fu_more` | 보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 추가 요구에는 응하지 말고 보낸 정보와 날짜를 정리해 두세요. |
| ④ | `fraud_actionTaken=sent_small`, `fraud_followUp=fu_cut` | 소액을 보낸 뒤 더 큰 금액을 요구하는 방식이 있습니다. 연락이 끊겼어도 송금 내역을 보관하고 은행에 문의할 수 있는지 확인하세요. |
| ⑤ | `fraud_actionTaken=signed_already`, `fraud_followUp=fu_none` | 서명한 문서의 사본을 확보하고 조건을 정리하세요. 연락이 없더라도 서명한 서류의 사본을 확보하고 내용을 확인하세요. |

**확인 요청에 대한 반응** — Q12-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_verifyReaction=react_open`, `fraud_afterReaction=ar_continue` | 자료를 준다면 그 자료를 공식 자료와 대조해 보세요. 계속 진행하더라도 받은 자료가 공식 조회와 일치하는지 확인한 뒤에 다음 단계로 넘어가세요. |
| ② | `fraud_verifyReaction=react_inconsistent`, `fraud_afterReaction=ar_paused` | 말이 바뀌는 부분을 날짜와 함께 기록하세요. 멈춘 것은 좋은 선택입니다. 바뀐 대답을 날짜별로 적어 비교해 두세요. |
| ③ | `fraud_verifyReaction=react_pressure`, `fraud_afterReaction=ar_asked` | 확인을 막으려는 반응은 신중하게 보아야 합니다. 주변의 의견을 들은 것은 좋은 방법입니다. 재촉 문구를 저장해 함께 보여 주세요. |
| ④ | `fraud_verifyReaction=react_cut`, `fraud_afterReaction=ar_paused` | 연락을 끊는다면 남은 대화와 계좌 정보를 먼저 보관하세요. 더 진행하지 않았다면 지금까지의 대화와 보낸 자료를 먼저 보관하세요. |
| ⑤ | `fraud_verifyReaction=react_untested`, `fraud_afterReaction=ar_asked` | 시간을 달라고 말해 보면 상대의 반응이 중요한 단서가 됩니다. 확인하겠다는 말은 정중하게 하되 기한을 정해 자료를 요청하고, 그 반응을 기록하세요. |

**자료 보관 상태** — Q13-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_evidenceState=all_kept`, `fraud_evidenceWhere=kp_backup` | 자료가 모두 있다면 날짜순으로 정리해 두는 것이 가장 큰 준비입니다. 백업까지 해 두었으니 원본은 그대로 두고 사본으로 확인을 진행하세요. |
| ② | `fraud_evidenceState=chat_only`, `fraud_evidenceWhere=kp_phone` | 서류와 계좌 정보를 대화에서 따로 뽑아 정리해 두세요. 휴대폰 안에만 있다면 지금 바로 캡처하고 다른 곳에 한 번 더 저장해 두세요. |
| ③ | `fraud_evidenceState=docs_only`, `fraud_evidenceWhere=kp_paper` | 서류에 적힌 연락처와 날짜를 기준으로 연락 경위를 기억나는 대로 적어 두세요. 종이 서류는 사진과 스캔으로 사본을 만들어 두면 확인할 때 편합니다. |
| ④ | `fraud_evidenceState=deleted_some`, `fraud_evidenceWhere=kp_phone` | 지운 자료는 복구가 가능한지 먼저 알아보세요. 휴대폰의 휴지통이나 백업에서 되살릴 수 있는지 지금 바로 확인해 보세요. |
| ⑤ | `fraud_evidenceState=none_kept`, `fraud_evidenceWhere=kp_none` | 자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 도움이 됩니다. 지금부터 오는 연락은 모두 저장하고, 기억나는 경위를 날짜순으로 적어 두세요. |

### E-2-A. 문제 발생 후 대응 검토

**시간 경과** — Q5-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_elapsedTime=elapsed_today`, `fraud_sentAfter=sa_none` | 가장 빨리 움직일 수 있는 시점입니다. 오늘 알았다면 지금 바로 은행에 지급 정지를 문의하는 것이 가장 중요합니다. |
| ② | `fraud_elapsedTime=elapsed_week`, `fraud_sentAfter=sa_some` | 아직 빠르게 확인할 수 있는 시기입니다. 더 보낸 돈도 있으니 보낸 날짜와 금액을 구분해서 적어 두세요. |
| ③ | `fraud_elapsedTime=elapsed_month`, `fraud_sentAfter=sa_none` | 시간이 조금 지났어도 확인할 수 있는 자료가 남아 있을 수 있습니다. 한 달이 지났어도 신고와 지급 정지 문의는 가능하니 서둘러 시작하세요. |
| ④ | `fraud_elapsedTime=elapsed_half_year`, `fraud_sentAfter=sa_unsure` | 시간이 지날수록 기록 확인이 어려워질 수 있습니다. 기억이 불분명하다면 통장 거래 내역을 뽑아 보낸 돈을 먼저 확인하세요. |
| ⑤ | `fraud_elapsedTime=elapsed_over_half`, `fraud_sentAfter=sa_na` | 시간이 오래 지났다면 가진 자료를 모두 모아 전문가와 함께 가능한 조치를 확인하는 것이 좋습니다. 오래된 일일수록 남은 기록이 중요하니 지금 있는 자료부터 모아 보세요. |

**알게 된 계기** — Q6-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_discovery=disc_contact_cut`, `fraud_firstConsult=cs_alone` | 연락이 끊긴 시점과 마지막 대화를 기록해 두세요. 혼자 고민하기보다 보낸 기록을 정리해 상담을 받아 보는 것이 좋습니다. |
| ② | `fraud_discovery=disc_broken_promise`, `fraud_firstConsult=cs_family` | 약속한 내용이 문서나 대화로 남아 있는지 확인하세요. 약속 내용이 담긴 대화를 먼저 저장하고 가족과 함께 날짜순으로 정리하세요. |
| ③ | `fraud_discovery=disc_more_fees`, `fraud_firstConsult=cs_alone` | 추가 비용 요구 내역을 항목별로 정리하세요. 추가 비용 요구는 같은 수법이 반복되는 신호이니 더 보내기 전에 멈추세요. |
| ④ | `fraud_discovery=disc_outside`, `fraud_firstConsult=cs_official` | 받은 안내 내용과 담당 부서, 접수 번호를 기록하세요. 공식 기관 안내를 받았다면 그때 받은 안내문이나 접수 기록을 보관하세요. |
| ⑤ | `fraud_discovery=disc_self_check`, `fraud_firstConsult=cs_family` | 확인한 과정과 날짜를 기록하세요. 조회한 화면과 결과를 캡처해 두면 신고할 때 근거 자료가 됩니다. |

**상대의 현재 상태** — Q7-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_counterpartyStance=demands_more`, `fraud_refundPromise=rp_promised` | 추가 요구에는 응하지 말고 대화는 그대로 저장하세요. 더 내면 돌려준다는 말은 흔한 수법이니 추가로 보내지 말고 그 말을 저장하세요. |
| ② | `fraud_counterpartyStance=excuses`, `fraud_refundPromise=rp_promised` | 변명 내용과 날짜를 순서대로 기록하세요. 바뀐 약속 날짜를 모두 적어 두면 속이려는 의도를 보여 주는 자료가 됩니다. |
| ③ | `fraud_counterpartyStance=threatens`, `fraud_refundPromise=rp_denied` | 위협 내용을 그대로 저장하고 대응하지 마세요. 협박 문구는 중요한 증거이니 지우지 말고 저장한 뒤 신고하세요. |
| ④ | `fraud_counterpartyStance=silent`, `fraud_refundPromise=rp_none` | 마지막 연락 날짜와 내용을 기록하세요. 답이 없는 상태에서도 마지막 대화와 계좌 정보는 꼭 보관해 두세요. |
| ⑤ | `fraud_counterpartyStance=blocked_changed`, `fraud_refundPromise=rp_none` | 남아 있는 대화 화면과 이전 번호·계정을 보관하세요. 차단되기 전의 대화 화면과 상대 계정 정보를 먼저 저장해 두세요. |

**송금 방식** — Q8-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_payMethod=pay_bank`, `fraud_moneySource=src_own` | 은행 이체는 기록이 남아 은행에 문의하기 쉬운 방식입니다. 은행 송금은 지급 정지 요청이 가능할 수 있으니 오늘 안에 은행에 문의하세요. |
| ② | `fraud_payMethod=pay_wallet`, `fraud_moneySource=src_borrowed` | 앱의 거래 내역과 상대 계정 정보를 저장하고 해당 서비스 고객센터에 문의 방법을 확인하세요. 결제 업체에도 이의 신청이 가능한지 문의하고 빌린 돈은 갚을 계획을 따로 정리하세요. |
| ③ | `fraud_payMethod=pay_crypto`, `fraud_moneySource=src_company` | 가상자산은 거래 기록의 주소와 시각이 중요합니다. 가상자산은 추적이 어려우니 거래 번호와 지갑 주소를 지금 바로 저장하세요. |
| ④ | `fraud_payMethod=pay_cash`, `fraud_moneySource=src_own` | 현금은 기록이 적어 만난 날짜·장소·사람의 정보를 최대한 적어 두세요. 현금은 영수증이 없기 쉬우니 건넨 날짜와 장소, 받은 사람의 특징을 적어 두세요. |
| ⑤ | `fraud_payMethod=pay_none`, `fraud_moneySource=src_na` | 송금하지 않았다면 이후 추가 요구에 응하지 않는 것이 가장 중요합니다. 돈을 보내지 않았다면 지금 멈추는 것이 가장 좋은 대응입니다. |

**피해 규모** — Q9-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_lossScale=loss_none`, `fraud_lossImpact=li_none` | 금전 피해가 없다면 같은 연락이 오지 않도록 기록을 정리하세요. 손해가 없는 지금이 개인정보와 계정을 점검하기에 가장 좋은 때입니다. |
| ② | `fraud_lossScale=loss_under_1m`, `fraud_lossImpact=li_none` | 금액이 크지 않아도 송금 날짜와 계좌를 정리해 두면 은행이나 플랫폼 문의에 도움이 됩니다. 금액이 작아도 같은 수법으로 더 큰 피해가 생길 수 있으니 기록은 남기세요. |
| ③ | `fraud_lossScale=loss_1m_10m`, `fraud_lossImpact=li_manageable` | 송금 시간이 지날수록 확인이 어려워질 수 있어 거래 은행에 빨리 문의하세요. 이 정도 금액이면 신고와 지급 정지 문의를 해 볼 가치가 충분합니다. |
| ④ | `fraud_lossScale=loss_10m_100m`, `fraud_lossImpact=li_manageable` | 금액이 크므로 송금 내역을 날짜순 표로 정리하는 것이 먼저입니다. 큰 금액이므로 전문가와 함께 신고서와 증거를 갖추는 것이 안전합니다. |
| ⑤ | `fraud_lossScale=loss_over_100m`, `fraud_lossImpact=li_serious` | 피해 금액이 매우 크다면 은행과 관련 기관에 가능한 한 빨리 알리고 전문가 상담을 함께 받는 것이 필요할 수 있습니다. 손해가 매우 크므로 오늘 바로 전문가 상담과 지급 정지 문의를 병행하세요. |

**송금 횟수와 계좌** — Q10-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_transferPattern=tp_once_one`, `fraud_txRecord=tx_have` | 한 번의 송금이라면 이체 확인증 하나로 정리할 수 있습니다. 송금 내역 화면을 저장하고 거래 일시와 받은 계좌 정보를 정리해 두세요. |
| ② | `fraud_transferPattern=tp_many_one`, `fraud_txRecord=tx_partial` | 같은 계좌로 반복해 보냈다면 날짜와 금액을 표로 정리하세요. 은행에서 전체 거래 내역을 발급받으면 빠진 날짜까지 한 번에 확인할 수 있습니다. |
| ③ | `fraud_transferPattern=tp_many_multi`, `fraud_txRecord=tx_have` | 계좌별로 날짜·금액·명의를 따로 정리하세요. 계좌가 여러 개라면 받은 사람별로 금액을 합쳐 두면 신고할 때 도움이 됩니다. |
| ④ | `fraud_transferPattern=tp_unknown`, `fraud_txRecord=tx_none` | 송금 내역에서 은행과 계좌번호를 먼저 확인하세요. 은행 앱의 거래 내역이나 통장 정리로 날짜와 금액을 먼저 확인해 보세요. |
| ⑤ | `fraud_transferPattern=tp_none`, `fraud_txRecord=tx_none` | 송금이 없다면 정보 제공이나 서명 같은 다른 노출이 있었는지 점검하세요. 보낸 돈이 없다면 상대와의 대화와 요구 내용을 중심으로 자료를 모으세요. |

**정보 제공** — Q11-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_infoGiven=info_none`, `fraud_infoAftermath=ia_none` | 정보를 주지 않았다면 앞으로도 요구에 응하지 않는 것이 좋습니다. 정보를 주지 않았다면 이후 오는 연락에도 아무것도 보내지 마세요. |
| ② | `fraud_infoGiven=info_basic`, `fraud_infoAftermath=ia_spam` | 기본 정보가 알려졌다면 이후 비슷한 연락이 올 수 있습니다. 낯선 번호는 받지 말고 문자 속 링크는 누르지 말며 번호는 차단하세요. |
| ③ | `fraud_infoGiven=info_id_copy`, `fraud_infoAftermath=ia_none` | 보낸 사본의 종류와 날짜를 정리하세요. 신분증을 보냈다면 새 대출이나 가입이 생기지 않는지 정기적으로 확인하세요. |
| ④ | `fraud_infoGiven=info_finance`, `fraud_infoAftermath=ia_misuse` | 해당 금융기관에 가능한 한 빨리 알려 추가 조치 방법을 확인하세요. 도용 흔적이 있다면 오늘 안에 은행에 알리고 카드와 계좌 사용을 정지하세요. |
| ⑤ | `fraud_infoGiven=info_remote`, `fraud_infoAftermath=ia_spam` | 설치한 앱은 지우고 관련 계정의 비밀번호를 바꾸는 것을 살펴보세요. 원격 앱은 바로 삭제하고 휴대폰의 비밀번호와 계정을 모두 바꾸세요. |

**이미 취한 조치** — Q12-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_actionTaken=nothing_yet`, `fraud_actionResponse=rs_not_started` | 아직 조치 전이라면 자료 정리와 은행 문의부터 시작할 수 있습니다. 먼저 은행 지급 정지 문의, 증거 정리, 신고 순서로 하나씩 시작하세요. |
| ② | `fraud_actionTaken=bank_recall`, `fraud_actionResponse=rs_waiting` | 접수 번호와 담당 부서, 안내받은 내용을 기록해 두세요. 접수 번호를 적어 두고 결과가 나오면 그 안내문을 보관하세요. |
| ③ | `fraud_actionTaken=police_report`, `fraud_actionResponse=rs_waiting` | 접수한 기관과 날짜, 접수 번호를 기록하세요. 신고 접수증과 담당자 연락처를 보관하고 추가 자료는 그 담당자에게 내세요. |
| ④ | `fraud_actionTaken=direct_refund`, `fraud_actionResponse=rs_rejected` | 상대와의 직접 협상은 추가 요구로 이어질 수 있어 주의가 필요합니다. 직접 요구한 대화는 모두 저장하고 이제는 공식 기관 절차로 옮기세요. |
| ⑤ | `fraud_actionTaken=consulted_others`, `fraud_actionResponse=rs_not_started` | 주변의 조언은 참고가 되지만 어느 기관에 어떤 자료를 낼지는 따로 확인이 필요합니다. 조언을 들었다면 이제 지급 정지와 신고 중 가능한 것부터 실제로 시작하세요. |

**자료 보관 상태** — Q13-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_evidenceState=all_kept`, `fraud_evidenceWhere=kp_backup` | 자료가 모두 있다면 날짜순으로 정리하는 것이 가장 큰 준비입니다. 자료가 충분하니 원본은 그대로 두고 사본을 날짜순으로 정리해 신고에 쓰세요. |
| ② | `fraud_evidenceState=payment_only`, `fraud_evidenceWhere=kp_phone` | 입금 내역만 있어도 은행 문의에 쓸 수 있습니다. 입금 내역만 있다면 상대 계좌와 날짜가 보이게 캡처해 따로 저장하세요. |
| ③ | `fraud_evidenceState=chat_only`, `fraud_evidenceWhere=kp_phone` | 대화에서 계좌 정보와 약속 내용을 따로 뽑아 정리하세요. 대화는 상대가 지울 수 있으니 지금 전체를 캡처해 다른 곳에도 저장하세요. |
| ④ | `fraud_evidenceState=deleted_some`, `fraud_evidenceWhere=kp_paper` | 지운 자료는 복구가 가능한지 먼저 알아보세요. 지운 자료는 휴대폰 백업이나 상대 쪽 기록으로 되살릴 수 있는지 확인하세요. |
| ⑤ | `fraud_evidenceState=none_kept`, `fraud_evidenceWhere=kp_none` | 남은 자료가 없어도 은행 거래 내역은 금융기관에 요청해 받을 수 있습니다. 은행 거래 내역을 발급받는 것부터 시작하면 가장 빨리 자료를 모을 수 있습니다. |

## E-3. 결과에서의 연결 안내 (권유 문구, 강제 아님)

| 연결 | 표시 조건 | 고객 화면 문구 |
|---|---|---|
| 행정문서 검토 | `fraud_pretext` ∈ {pre_authority} 또는 `fraud_scheme` ∈ {impersonation} | 공공기관 이름으로 받은 문서라면 행정문서 검토에서 함께 확인해 보실 수 있습니다. |
| 불확실한 문서 검토 | `fraud_recordKind` ∈ {chat_log, pay_request} | 어떤 문서인지 분명하지 않다면 불확실한 문서 검토에서 먼저 분류해 보실 수 있습니다. |
| 전문가 진행 | `fraud_lossScale` ∈ {loss_10m_100m, loss_over_100m} 또는 `fraud_counterpartyStance` ∈ {threatens} 또는 `fraud_infoGiven` ∈ {info_id_copy, info_finance, info_remote} 또는 `fraud_actionTaken` ∈ {signed_already} | 금액이 크거나 위협이 있거나 중요한 정보를 이미 준 상황이라면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |
| 서류 첨부 | 모든 결과 화면 | 받으신 서류나 대화 내용을 첨부하면 더 정확히 확인할 수 있습니다. |

- 연결 문구는 권유이며, 고객이 선택하지 않아도 결과와 리포트는 그대로 제공한다.
- 행정문서 검토와 불확실한 문서 검토로 가는 연결은 링크 안내만 제공한다. 답변 이전, 질문 생략, 세션 이전은 하지 않는다.
- 아래 안내 블록은 결과 화면 다음에 표시하는 일반 안내이며 질문이나 저장 필드가 아니다(기존 승인 문장 그대로).

### E-3-1. 결과 이후 안내 블록 (질문 아님, 저장 필드 없음)

**제출·계약 전 (`fraud_reviewStage=pre`) — 확인하고 싶은 것에 해당하던 목록**

- 제출 요건과 형식
- 누락된 내용이나 서류
- 불리하거나 위험한 조항
- 원본과 번역본의 일치 여부
- 공증·인증·영사확인 필요 여부
- 전체 검토가 필요함

**문제 발생 후 (`fraud_reviewStage=post`) — 현재 단계에 해당하던 목록**

- 공식 대응 전
- 상대방·기관과 협의 중
- 이의신청·통지 준비 중
- 경찰·검찰·법원·행정기관 접수
- 판결·결정 후 후속 대응
- 기타

이 두 목록은 기존 승인 문장을 그대로 옮긴 것이며, 서로 합치지 않고 질문 체인에 넣지 않는다. 사후 목록의 「기타」는 직접 입력 대상이 아니다. 기존 기관 안내 옵션(경찰 신고, 경제수사기관, 민사법원, 형사절차, 기타)과 그 본문은 질문 밖의 별도 안내로만 두며 위 목록과 합치지 않는다.

## E-4. 빈 값·직접 입력 처리

- 해당 질문에 직접 입력을 고른 경우: 해당 칸에는 직접 입력 안내 문장을 표시하고, 입력한 원문은 내부 저장(`..._detail`)에만 쌓아 이후 질문 개선에 쓴다.
- 값이 비어 있으면 해당 칸·문장 전체를 생략한다(빈 조사나 빈 괄호를 남기지 않는다).

---

# F. 자동 점검 결과 (실행 결과)

| 점검 항목 | 제출·계약 전 서류 검토 | 문제 발생 후 대응 검토 |
|---|---:|---:|
| 1차 질문 수 | 4 | 4 |
| 2차 질문 수 | 9 | 9 |
| 2차 비율 | 69.2% | 69.2% |
| 2차 ÷ 1차 | 2.25배 | 2.25배 |
| 질문 수(전체) | 13 | 13 |
| 선택지 총수(직접 입력 포함) | 78 | 78 |
| 선택지별 저장 필드 수(최소) | 2 | 2 |

| 자동 점검 | 결과 |
|---|---|
| 선택지마다 결과 문장 존재 | 통과(결과 문장 수 = 선택지 수, 전 질문) |
| 모든 선택지가 서로 다른 필드 쌍 | 통과 |
| 선택지 4개 이상 + 직접 입력 | 통과 |
| 고객 화면 문장에 영문·코드 노출 | 0건 |
| 단정 표현(사기입니다, 사기로 확정, 불법입니다, 범죄입니다, 처벌됩니다 등) | 0건 |
| 괄호 짝·이중 공백 | 0건 |
| 카드 문장 50자 초과 | 0건(최대 34자) |
| 위험 규칙의 필드·값이 실제 저장 값과 일치 | 통과 |
| 1차 결과 문장 중복(01/02/03) | 0건 |
| 값→고객 라벨 누락 | 0건(사용 값 189개) |
| 같은 값 다른 라벨 / 같은 필드 안 라벨 중복 | 0건 |
| 총 오류 / 경고 | 0 / 0 |

---

# G. 값 → 고객 표시 문구

내부 값은 화면·마이페이지·알림 어디에도 그대로 노출하지 않고 아래 문구로만 표시한다.

| 내부 값 | 고객 화면 표시 |
|---|---|
| `account_not_given` | 계좌가 아직 안내되지 않음 |
| `all_kept` | 대화·서류·입금 내역이 모두 있음 |
| `ar_asked` | 주변 사람에게 의견을 물음 |
| `ar_continue` | 그 반응을 믿고 계속 진행함 |
| `ar_paused` | 진행을 멈추고 생각 중임 |
| `ask_1m_10m` | 요구 금액이 100만 동 이상 1천만 동 미만 |
| `ask_over10m` | 요구 금액이 1천만 동 이상 |
| `ask_under1m` | 요구 금액이 100만 동 미만 |
| `ask_unstated` | 요구 금액이 정해지지 않음 |
| `asked_only` | 문의만 해 봄 |
| `bank_recall` | 은행·결제 업체에 지급 정지 요청 |
| `benefit_fee_first` | 수수료·보증금을 먼저 내라고 함 |
| `benefit_guaranteed` | 원금·수익을 보장한다고 함 |
| `benefit_high_fixed` | 짧은 기간에 아주 높은 확정 수익을 말함 |
| `benefit_ordinary` | 조건이 일반적이고 특별한 보장은 없음 |
| `benefit_unexplained` | 조건 설명이 거의 없음 |
| `blocked_changed` | 차단했거나 연락처를 바꿈 |
| `chat_log` | 안내문·광고 화면·대화 내용만 있음 |
| `chat_only` | 대화만 있음 |
| `check_mismatch` | 확인해 보니 정보가 맞지 않음 |
| `checked_name_only` | 회사 이름만 공식 조회로 확인 |
| `checked_official` | 공식 조회로 이름·등록 정보 확인 |
| `consulted_others` | 주변 사람이나 상담 기관에 물어봄 |
| `contract_full` | 상대 정보가 모두 적힌 계약서·약정서 |
| `contract_partial` | 상대 정보가 일부만 적힌 계약서·제안서 |
| `cs_alone` | 혼자 고민하고 있음 |
| `cs_family` | 가족·지인과 상의함 |
| `cs_official` | 은행·경찰 등 공식 기관에 문의함 |
| `ct_company` | 회사 대표 연락처를 알려 줌 |
| `ct_none` | 연락처를 받지 못함 |
| `ct_personal` | 개인 번호·계정으로만 연락함 |
| `deleted_some` | 일부를 지웠거나 잃어버림 |
| `demands_more` | 더 보내라고 계속 요구함 |
| `differs_party` | 계좌 명의가 상대 이름과 다르거나 개인 명의 |
| `direct_contact` | 문자·전화·이메일로 연락이 옴 |
| `direct_input` | 직접 입력 |
| `direct_input_detail` | 직접 입력(상세) |
| `direct_refund` | 상대에게 직접 환불을 요구함 |
| `disc_broken_promise` | 약속한 수익·물건이 오지 않음 |
| `disc_contact_cut` | 상대가 갑자기 연락을 끊음 |
| `disc_more_fees` | 추가 비용을 계속 요구함 |
| `disc_outside` | 은행·가족 등 바깥에서 알려 줌 |
| `disc_self_check` | 직접 조회해 보고 알게 됨 |
| `docs_only` | 서류만 있음 |
| `doubt_cut` | 연락이 끊기고 증거가 부족해 걱정함 |
| `doubt_data` | 개인정보 요구가 괜찮은지 모르겠음 |
| `doubt_leak` | 개인정보를 준 것이 걱정됨 |
| `doubt_more` | 상대의 추가 요구가 걱정됨 |
| `doubt_party` | 상대가 진짜인지 모르겠음 |
| `doubt_prepay` | 먼저 돈을 보내라는 요구가 괜찮은지 모르겠음 |
| `doubt_recover` | 보낸 돈이 어떻게 될지 걱정함 |
| `doubt_rush` | 재촉이 부담스러움 |
| `doubt_sign` | 서명해도 되는지·조건이 너무 좋아 보여 걱정함 |
| `doubt_where` | 어디에 알려야 하는지 모르겠음 |
| `elapsed_half_year` | 알게 된 지 반년쯤 |
| `elapsed_month` | 알게 된 지 한 달쯤 |
| `elapsed_over_half` | 알게 된 지 반년 넘음 |
| `elapsed_today` | 알게 된 지 하루 이내 |
| `elapsed_week` | 알게 된 지 일주일 이내 |
| `excuses` | 핑계를 대며 시간을 끎 |
| `fu_cut` | 그 뒤 상대가 연락을 끊음 |
| `fu_more` | 그 뒤에도 추가 요구가 계속됨 |
| `fu_none` | 그 뒤 상대의 추가 연락이 없음 |
| `gave_info` | 개인정보 제공·앱 설치·로그인 |
| `give_info` | 신분증·계좌 정보를 달라고 함 |
| `help_expert` | 전문가와 함께 확인하길 원함 |
| `help_guide` | 스스로 확인할 방법을 원함 |
| `holder_company` | 제 회사 명의로 받음 |
| `holder_other` | 가족·지인이 받은 것을 대신 알아봄 |
| `holder_self` | 제 개인 명의로 받음 |
| `ia_misuse` | 내 이름으로 도용된 흔적이 있음 |
| `ia_none` | 아직 눈에 띄는 이상은 없음 |
| `ia_spam` | 스팸 전화·문자가 늘어남 |
| `impersonation` | 기관·지인·일자리·연애를 내세움 |
| `in_person` | 직접 만나서 시작됨 |
| `info_basic` | 이름·전화번호 등 기본 정보 제공 |
| `info_finance` | 계좌·카드 정보 제공 |
| `info_id_copy` | 신분증 사진 제공 |
| `info_none` | 개인정보를 주지 않음 |
| `info_remote` | 원격 조종 앱을 설치함 |
| `init_me` | 제가 먼저 연락함 |
| `init_them` | 상대가 먼저 연락함 |
| `init_third` | 소개한 지인이 먼저 연결함 |
| `install_login` | 앱 설치·로그인을 하라고 함 |
| `investment` | 투자·수익·사업 제휴 |
| `kp_backup` | 클라우드·다른 기기에도 백업함 |
| `kp_none` | 보관한 곳이 없음 |
| `kp_paper` | 종이 서류로 보관함 |
| `kp_phone` | 휴대폰 안에만 있음 |
| `li_manageable` | 부담되지만 감당할 수 있음 |
| `li_none` | 생활에 큰 영향 없음 |
| `li_serious` | 생활·사업에 심각한 영향 |
| `loan` | 대출 |
| `loss_10m_100m` | 1천만 동 이상 1억 동 미만 손해 |
| `loss_1m_10m` | 100만 동 이상 1천만 동 미만 손해 |
| `loss_none` | 손해 없음 |
| `loss_over_100m` | 1억 동 이상 손해 |
| `loss_under_1m` | 100만 동 미만 손해 |
| `matches_party` | 계좌 명의가 상대 이름과 같음 |
| `meet_move` | 만나자거나 다른 곳으로 옮기자고 함 |
| `messenger` | 메신저·소셜 앱으로 연락이 옴 |
| `multiple_accounts` | 계좌가 여러 개이거나 자주 바뀜 |
| `name_only_known` | 상대가 말한 이름만 앎 |
| `no_record` | 받은 서류 없음 |
| `none_kept` | 남은 자료 없음 |
| `not_checked` | 아직 확인하지 않음 |
| `nothing_yet` | 아무것도 하지 않음 |
| `online_post` | 온라인 광고·게시글·플랫폼에서 만남 |
| `online_trade` | 온라인 거래·임대 |
| `overseas_or_crypto` | 해외 계좌·가상자산 주소 |
| `pay_bank` | 은행 계좌로 송금함 |
| `pay_cash` | 현금·상품권으로 건넴 |
| `pay_crypto` | 가상자산으로 보냄 |
| `pay_none` | 아직 돈을 보내지 않음 |
| `pay_request` | 입금 안내만 받음 |
| `pay_wallet` | 전자지갑·간편결제로 보냄 |
| `payment_only` | 입금 내역만 남아 있음 |
| `pf_daily` | 매일 여러 번 연락함 |
| `pf_none` | 재촉 연락이 없음 |
| `pf_once` | 한 번 강하게 말함 |
| `police_report` | 경찰에 신고함 |
| `post` | 문제 발생 후 대응 검토 |
| `pre` | 제출·계약 전 서류 검토 |
| `pre_authority` | 공안·세무·법원 연락, 비자·체류·행정 대행 |
| `pre_deposit` | 임대·매매 보증금·예약금, 택배·관세 비용 |
| `pre_invest` | 고수익·투자·가상자산·다단계·사업 제휴 |
| `pre_romance` | 연애·결혼·소개 |
| `pre_tasks` | 소액 과제·구인·아르바이트 |
| `press_deadline` | 기한·마감 임박을 내세워 재촉 |
| `press_evasive` | 확인하겠다고 하면 화를 내거나 말을 돌림 |
| `press_none` | 재촉 없음 |
| `press_secret` | 비밀 유지 요구 |
| `press_third_party` | 지인·제3자를 내세워 압박 |
| `proof_docs` | 서류·영수증·신분증 사진을 보여 줌 |
| `proof_none` | 보여 준 자료 없이 말로만 설명함 |
| `proof_profile` | 수익 인증 캡처·후기·프로필을 보여 줌 |
| `rd_na` | 읽을 서류가 없음 |
| `rd_not` | 서류를 거의 이해하지 못함 |
| `rd_partly` | 서류를 일부만 이해함 |
| `rd_understood` | 서류를 읽고 이해함 |
| `react_cut` | 연락을 끊거나 차단함 |
| `react_inconsistent` | 대답이 바뀌거나 앞뒤가 맞지 않음 |
| `react_open` | 기꺼이 자료를 줌 |
| `react_pressure` | 오히려 서두르라고 재촉함 |
| `react_untested` | 아직 확인하겠다고 말해 보지 않음 |
| `referral` | 지인의 소개로 알게 됨 |
| `ro_considering` | 회복 대행 제안을 받고 고민 중임 |
| `ro_none` | 피해 회복 대행 제안은 받지 않음 |
| `ro_offered` | 피해 회복 대행 제안을 받음 |
| `rp_denied` | 돌려줄 수 없다고 거절함 |
| `rp_none` | 환불 이야기가 오가지 않음 |
| `rp_promised` | 곧 돌려주겠다고 약속함 |
| `rq_explained` | 필요한 이유를 설명받음 |
| `rq_once` | 그 요구를 한 번 받음 |
| `rq_repeated` | 같은 요구를 여러 번 받음 |
| `rs_not_started` | 아직 처리가 시작되지 않음 |
| `rs_rejected` | 거절되거나 답을 받지 못함 |
| `rs_waiting` | 접수하고 결과를 기다리는 중 |
| `sa_na` | 연락이 끊겨 더 보낼 일이 없었음 |
| `sa_none` | 알게 된 뒤 돈을 더 보내지 않음 |
| `sa_some` | 알게 된 뒤에도 돈을 더 보냄 |
| `sa_unsure` | 더 보낸 돈이 있는지 불분명함 |
| `selected` | 직접 선택함 |
| `send_first` | 먼저 돈을 보내라고 함 |
| `sent_small` | 소액을 먼저 보냄 |
| `sign_now` | 서명·계약을 서두르라고 함 |
| `signed_already` | 서명·도장을 이미 함 |
| `silent` | 연락에 답이 없음 |
| `src_borrowed` | 빌린 돈으로 냄 |
| `src_company` | 회사 돈·남의 돈으로 냄 |
| `src_na` | 보낸 돈이 없음 |
| `src_own` | 내 돈으로 냄 |
| `threatens` | 신고하면 불이익이 있다고 협박함 |
| `tp_many_multi` | 여러 계좌로 나누어 보냄 |
| `tp_many_one` | 여러 번 같은 계좌로 보냄 |
| `tp_none` | 보낸 돈이 없음 |
| `tp_once_one` | 한 번에 한 계좌로 보냄 |
| `tp_unknown` | 보낸 경로가 기억나지 않음 |
| `tx_have` | 송금 내역을 모두 가지고 있음 |
| `tx_none` | 송금 내역이 없음 |
| `tx_partial` | 송금 내역을 일부만 가지고 있음 |
| `unsure` | 잘 모르겠음 |
| `unsure_scheme` | 어떤 종류인지 모름 |
| `via_capture` | 수익 캡처·후기로 조건을 보여 줌 |
| `via_verbal` | 조건을 말로만 전달받음 |
| `via_written` | 조건이 서류·화면에 글로 적혀 있음 |
| `victim_company` | 제 회사 명의의 일 |
| `victim_other` | 가족·지인이 겪은 일을 대신 알아봄 |
| `victim_self` | 제 개인 명의의 일 |

---

# H. 작성 기록과 확정 기준 대비 달라진 점

- **v2 재설계(2026.10.11)**: 한 질문은 한 가지만 묻도록 다시 만들고(제안 종류, 상대가 내세운 명목, 연락 경로, 상대 정보의 확인, 수익·조건, 현재 요구, 송금 계좌 명의, 재촉, 받은 서류, 이미 한 일, 확인 요청에 대한 반응, 자료 보관 / 사후: 알게 된 계기, 시간 경과, 상대의 현재 상태, 송금 방식, 피해 규모, 송금 횟수와 계좌, 정보 제공, 이미 취한 조치), 선택지는 서로 겹치지 않게 했다. 선택지마다 저장하는 두 필드는 구체 값과 이를 묶은 상위 분류(예: 문자메시지 → 직접 전달된 연락, 가상자산 → 추적이 어려운 방식)로 하여 구체 → 상위의 2층으로 쌓이게 했다.
- **질문 수**: 경로당 13개(1차 4 : 2차 9, 2차 비중 약 69%)이다. 개수는 고정값이 아니며 필요하면 늘릴 수 있다.
- **수법 구성 유지(Ace 승인 2026.10.10)**: `fraud_scheme`은 투자·수익·사업 제휴(`investment`), 대출(`loan`), 온라인 거래·임대(`online_trade`), 기관·지인 사칭·취업·연애(`impersonation`), 어떤 유형인지 모름(`unsure_scheme`) 5개로 그대로 두었다. 수법 안의 세부 유형은 승인된 5개를 바꾸지 않고 Q2 `fraud_pretext`(상대가 내세운 명목)로 따로 물어 구체화했다.
- **기존 문장 재사용 범위**: 서비스 범위 발췌의 문장은 범위와 slug(`pre`/`post`)에만 쓰고 옛 질문 문구는 쓰지 않았다. 결과 이후 안내 블록 두 목록만 기존 문장 그대로 두었다(E-3-1).
- **금액 구간**: 사후 Q9의 피해 규모는 베트남 동 기준 구간이다. 형법상 사기죄 기준 금액(200만 동 이상)과 신뢰 남용(400만 동 이상)은 고객 문장에 쓰지 않고 참고 사항 출처에만 둔다.
- **직접 입력 처리**: 직접 입력을 고른 고객에게도 기본 경로 B를 제공하고 입력 원문은 상세 필드에 저장한다. 경로 기본값(B)은 Ace 확인 대상이다.
- **법령 근거 상태**: 질문과 선택지에는 법령 조항을 쓰지 않았다. 형법 제174·175조, 민법 제127·131·132·468조, 형법 제201조, 형법 제217a조, 전자상거래법 제122/2025/QH15호, 형사소송법 제144조는 이차 자료로 확인했으며 원문 대조가 필요하다. 형사소송법 제145조, 행정처리법 제74조, 행정소송법 제116조는 확인하지 못해 사용하지 않았다.

# K. 리포트 고정 문구

서류를 첨부하면 더 정확히 확인할 수 있습니다.

# I. AI 리포트 참고 사항

제목: 참고 사항
부제: 고객님의 선택 내용에 맞춰 정리한 확인·준비 안내입니다.
확인 기준: 확인 기준일 2026.10.10 · 법령과 제도는 개정될 수 있으므로 시행 시점의 확인이 필요합니다.
고정 문구: 위 내용은 일반 참고 정보이며, 개별 사안의 사기 여부나 법적 책임, 피해 회복 가능성을 판단하지 않습니다. 서류 원본 확인과 전문가 검토를 거쳐 판단됩니다.
먼저 표시: 먼저 확인
접수 건수: 접수된 자료: {n}건

## 의심스러운 연락을 받은 경우

제목: 상대의 요구에 응하기 전에 먼저 할 것
흐름: 대화·서류 보관 → 송금·정보 제공 멈춤 → 공식 연락처로 직접 확인 → 전문가 확인 [일반 실무]
- 상대가 알려 준 연락처가 아니라 공식 자료에 나온 연락처로 사실을 확인해 보세요. [7]
- 대화 화면과 받은 서류, 입금 내역은 지우지 말고 날짜가 보이게 그대로 저장해 두세요. [일반 실무]
- 공식 기관을 내세운 연락이라도 개인정보나 인증번호는 전화나 메시지로 알려 주지 마세요. [7]

## 경로 1: 제출·계약 전 서류 검토

### ① 준비 자료 체크

1. 받은 제안서·계약서 원본 / 상대가 내세운 수익과 조건이 문서에 어떻게 적혀 있는지 확인하는 기본 자료입니다. [일반 실무]
2. 상대의 이름·등록 정보 확인 자료 / 회사라면 이름, 등록 번호, 대표자를 공식 조회 결과와 비교합니다. [9]
3. 송금하라는 계좌 정보 / 계좌 명의가 서류의 상대와 같은지 비교합니다. [7]
4. 대화 기록 (문자, 메신저, 통화 기록) / 약속과 요구가 언제 어떻게 나왔는지 보여 줍니다. [7]
5. 수익·조건을 설명한 자료 / 보장 문구, 수수료, 기한이 문서로 남아 있는지 확인합니다. [5]

### ② 확인 순서

흐름: 자료 모으기 (제안서·대화·계좌) → 서로 맞는지 보기 (이름·계좌·조건) → 송금·정보 제공 보류 후 전문가에게 전달 [일반 실무]

### ③ 서류 간 대조표

- 서류의 상대 이름 ↔ 송금 계좌 명의 / 같은 사람이나 회사인지 [7]
- 서류의 등록 정보 ↔ 공식 조회 결과 / 이름, 번호, 대표자가 맞는지 [9]
- 말로 들은 조건 ↔ 서류에 적힌 조건 / 보장, 수수료, 기한이 서류에도 있는지 [일반 실무]
- 서류에 적힌 연락처 ↔ 공식 안내 연락처 / 같은 번호와 주소인지 [7]

### ④ 시점별 정리

흐름: 첫 연락 (언제, 어디서) → 제안 내용 → 요구 사항 (송금, 정보) → 기한 → 현재 단계 [일반 실무]
표 아래: 위 순서대로 날짜를 적어 두면 요구가 늘어나는 구간이 보입니다. [일반 실무]

### ⑤ 자주 놓치는 점

- 계좌 명의가 서류의 상대와 다른데 이유를 확인하지 않고 보낸 경우 [7]
- 서류의 회사 이름만 확인하고 실제 연락해 온 사람이 그 회사 소속인지는 확인하지 않은 경우 [9]
- 말로 들은 수익 보장이 계약서에는 없는데 그대로 서명한 경우 [5]
- 결혼 관련 소개나 상담 업체의 경우 운영 허가와 계약 조건을 확인하지 않은 경우 [8]

### ⑥ 전문가에게 가져갈 질문

1. 제가 받은 서류와 상대 정보로 더 확인해야 할 것은 무엇인가요? [일반 실무]
2. 송금하라는 계좌의 명의가 다른 경우 어떻게 확인하는 것이 좋은가요? [일반 실무]
3. 이 계약서의 수익 보장이나 수수료 조항은 어떻게 해석되나요? [1][5]

## 경로 2: 문제 발생 후 대응 검토

### ① 준비 자료 체크

1. 송금 내역 (은행 이체 확인서, 거래 내역) / 보낸 날짜, 금액, 받은 계좌를 보여 주는 기본 자료입니다. [7]
2. 대화 기록 (문자, 메신저, 통화 기록) / 상대의 약속과 요구, 연락이 끊긴 시점을 보여 줍니다. [7]
3. 받은 서류 (제안서, 계약서, 광고 화면) / 약속한 수익과 조건이 어떻게 적혀 있었는지 보여 줍니다. [5]
4. 상대 정보 (이름, 연락처, 계좌, 계정 주소) / 이후 확인에서 상대를 특정하는 데 쓰입니다. [7]
5. 이미 취한 조치의 기록 (은행 문의, 플랫폼 신고 접수 내용) / 접수 번호와 답변 내용을 함께 보관합니다. [일반 실무]

### ② 확인 순서

흐름: 자료 모으기 (송금·대화·서류) → 날짜순으로 정리하기 → 은행·플랫폼 문의 기록 → 전문가에게 전달 [일반 실무]

### ③ 서류 간 대조표

- 송금 내역 ↔ 대화 기록 / 보낸 시점과 요구한 시점이 이어지는지 [7]
- 받은 서류 ↔ 실제 결과 / 약속한 내용과 지금 상태가 어떻게 다른지 [5]
- 상대가 알려 준 계좌 ↔ 실제 입금 계좌 / 명의와 번호가 같은지 [7]
- 신고·문의 내용 ↔ 받은 답변 / 날짜와 담당 부서가 기록되어 있는지 [일반 실무]

### ④ 시점별 정리

흐름: 첫 연락 → 제안 내용 → 송금 (날짜별) → 추가 요구 → 연락 두절 또는 문제 발견 → 이미 한 조치 [일반 실무]
표 아래: 위 순서대로 날짜와 금액을 적어 두면 어느 구간의 자료가 부족한지 보입니다. [일반 실무]

### ⑤ 자주 놓치는 점

- 대화를 지우거나 앱을 삭제해 증빙이 사라진 경우 [7]
- 상대와 직접 협상하다가 추가 송금을 한 경우 [7]
- 민법상 속아서 한 거래의 무효를 주장할 수 있는 기간이 있는데, 알게 된 때부터의 기간을 확인하지 않은 경우 [2]
- 신고 방법과 접수 기관을 확인하지 않고 여러 곳에 서로 다른 내용으로 알린 경우 [6]

### ⑥ 전문가에게 가져갈 질문

1. 제가 가진 자료로 어떤 기관에 어떻게 알리는 것이 좋은가요? [6]
2. 이미 송금한 돈에 대해 은행이나 플랫폼에서 확인할 수 있는 것은 무엇인가요? [일반 실무]
3. 계약이나 송금을 취소하거나 무효로 다투려면 기간과 준비 자료는 어떻게 되나요? [2]

# J. 근거·출처

확인일: 2026.10.10

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 형법 제100/2015/QH13호(제12/2017/QH14호 개정) 제174조 사기, 제175조 신뢰 남용 | 베트남 국회 | 법령(이차 자료로 확인) | https://lawnet.vn/ngan-hang-phap-luat/en/tu-van-phap-luat/trach-nhiem-hinh-su/what-are-penalties-for-obtaining-property-by-fraud-in-vietnam-390034 , https://lawnet.vn/thong-tin-phap-luat/en/tu-van-luat/penalties-for-abuse-of-trust-to-appropriate-property-in-vietnam-120363.html | 사기죄 기준 금액 200만 동 이상, 신뢰 남용 400만 동 이상(이차 자료). 원문 대조 필요 |
| 2 | 민법 제91/2015/QH13호 제127조(속임·위협), 제131조(무효의 효과), 제132조(청구 기간) | 베트남 국회 | 법령(이차 자료로 확인) | https://lawnet.vn/thong-tin-phap-luat/en/dan-su/time-limit-for-requesting-court-to-declare-civil-transactions-invalid-in-vietnam-128405.html , https://lawnet.vn/thong-tin-phap-luat/en/dan-su/will-civil-transactions-conducted-due-to-deception-threats-or-coercion-in-vietnam-be-invalidated-153757.html | 속임을 알았거나 알 수 있었던 때부터 2년(이차 자료). 원문 대조 필요 |
| 3 | 민법 제468조(이자 상한 연 20%) 및 형법 제201조(고리대금) | 베트남 국회 | 법령(이차 자료로 확인) | 원문 링크 확인 중 | 상한 초과분은 무효. 형법 제201조는 상한의 5배 이상 등 요건. 원문 대조 필요 |
| 4 | 형법 제217a조(다단계 판매) 및 정부령 제40/2018/ND-CP호 | 베트남 국회·정부 | 법령(이차 자료로 확인) | 원문 링크 확인 중 | 원문 대조 필요 |
| 5 | 전자상거래법 제122/2025/QH15호(2025.12.10 통과, 2026.7.1 시행) 및 소비자권익보호법 제19/2023/QH15호 | 베트남 국회 | 법령(이차 자료로 확인) | https://kpmg.com/us/en/taxnewsflash/news/2026/06/tnf-vietnam-law-on-e-commerce-2025-effective-july-1-2026.html , https://blogs.duanemorris.com/vietnam/2026/01/16/vietnam-new-law-on-e-commerce-what-you-must-know/ | 소비자권익보호법 시행일은 이번에 확인하지 못함. 확인 필요 |
| 6 | 형사소송법 제101/2015/QH13호 제144조(신고는 구두 또는 서면) | 베트남 국회 | 법령(이차 자료로 확인) | 원문 링크 확인 중 | 제145조 등 후속 조항은 확인하지 못해 사용하지 않음. 확인 필요 |
| 7 | 공안부 사이버범죄 대응 부서(A05) 사기 수법 안내 (2020.10.13 기사) | 베트남 공안부 | 공식 기관 안내(기사 인용) | 원문 링크 확인 중 | 수법과 인증번호 요구 주의 안내. 원문 대조 필요 |
| 8 | 외국인 관련 결혼 중개·상담 규정 (정부령 제126/2014/ND-CP호 제51~52조, 정부령 제82/2020/ND-CP호 제39조) | 베트남 정부 | 법령(이차 자료로 확인) | 원문 링크 확인 중 | 원문 대조 필요 |
| 9 | 기업법 제59/2020/QH14호 (제28조 기업등록증의 내용) | 베트남 국회 | 법령 | https://english.luatvietnam.vn/law-on-enterprises-no-59-2020-qh14-dated-june-17-2020-of-the-national-assembly-186272-doc1.html | 세금 확정본 출처 6과 같은 자료 |
