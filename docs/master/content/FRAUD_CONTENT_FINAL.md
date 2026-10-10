# 사기 검토(verify_fraud) 콘텐츠 최종본 (Claude 작성·검수본)

> 사전(제출·계약 전) 경로와 사후(문제 발생 후) 경로 2개로 구성했다. 법령 근거는 이차 자료로 확인했으며 원문 대조가 필요한 항목은 출처 표에 표시했다. 구조 기준: **2차 질문 비중은 전체의 최소 60% 이상(1차 40% 이하)이며, 이보다 2차가 더 많아도 된다(예: 30:70).** 질문 수와 선택지 수는 고정값이 아니며 필요하면 늘릴 수 있고, 질문 생략은 없다. 이 문서의 작성 결과는 경로당 1차 4개 : 2차 6개(40% : 60%)이다. 고객 화면에는 한국어 생활 문장만 표시하고, 영문 코드는 내부 저장에만 사용한다. 사기 여부·법적 책임·피해 회복 가능성은 판단하지 않고, 확인할 사항과 준비 자료를 안내하는 데 그친다.

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
| ① | `fraud_reviewStage=pre`, `fraud_routeSelectionMode=selected` | 경로 B (Q1-B ~ Q10-B) |
| ② | `fraud_reviewStage=post`, `fraud_routeSelectionMode=selected` | 경로 A (Q1-A ~ Q10-A) |
| ③ | `fraud_reviewStage=pre`, `fraud_routeSelectionMode=unsure` | 경로 B (기본 경로) |
| ④ 직접 입력 | `fraud_reviewStage=pre`, `fraud_routeSelectionMode=direct_input` | 경로 B (기본 경로). 입력 원문은 `fraud_routeSelectionMode` 상세로 저장 |

## A-1. 제출·계약 전 서류 검토 — 1차

### Q1-B

**고객 화면**

**어떤 제안을 받으셨고, 상대가 무엇을 요구하나요?**

① 투자나 사업 제휴를 내세운 제안인데, 먼저 돈을 넣으라고 합니다  
② 대출 제안인데, 신분증이나 계좌 정보를 달라고 합니다  
③ 온라인 거래나 임대 중인데, 앱 설치나 로그인을 하라고 합니다  
④ 기관이나 지인을 내세운 상대가 직접 만나자거나 다른 곳으로 옮기자고 합니다  
⑤ 어떤 유형인지 잘 모르겠지만, 서명이나 계약을 서두르라고 합니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_scheme=investment`, `fraud_requestedAction=send_first` |
| ② | `fraud_scheme=loan`, `fraud_requestedAction=give_info` |
| ③ | `fraud_scheme=online_trade`, `fraud_requestedAction=install_login` |
| ④ | `fraud_scheme=impersonation`, `fraud_requestedAction=meet_move` |
| ⑤ | `fraud_scheme=unsure_scheme`, `fraud_requestedAction=sign_now` |
| ⑥ 직접 입력 | `fraud_scheme=direct_input`, `fraud_requestedAction=direct_input_detail` |

---

### Q2-B

**고객 화면**

**상대와는 어떻게 연락이 닿았고, 무엇을 보고 믿게 되었나요?**

① 문자메시지로 연락이 왔고, 공식 기관처럼 보이는 문서가 있습니다  
② 메신저로 연락했고, 수익 인증 자료를 보여 줍니다  
③ 전화로 연락이 왔고, 지인 소개라고 합니다  
④ 온라인 광고를 보고 연락했고, 유명 사이트라서 믿었습니다  
⑤ 직접 만나서 이야기했고, 믿을 만한 근거는 딱히 없습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_contactChannel=text_message`, `fraud_trustBasis=official_look` |
| ② | `fraud_contactChannel=messenger`, `fraud_trustBasis=returns_proof` |
| ③ | `fraud_contactChannel=phone_call`, `fraud_trustBasis=referral` |
| ④ | `fraud_contactChannel=online_post`, `fraud_trustBasis=platform_trust` |
| ⑤ | `fraud_contactChannel=in_person`, `fraud_trustBasis=no_basis` |
| ⑥ 직접 입력 | `fraud_contactChannel=direct_input`, `fraud_trustBasis=direct_input_detail` |

---

### Q3-B

**고객 화면**

**받은 서류나 기록이 있다면, 상대 정보는 얼마나 적혀 있나요?**

① 계약서나 약정서가 있고, 상대 이름·주소·등록번호가 모두 적혀 있습니다  
② 제안서나 안내문이 있고, 상대 정보는 일부만 적혀 있습니다  
③ 대화 내용만 있고, 상대는 이름이나 별칭만 알려 줬습니다  
④ 입금 안내만 받았고, 상대 정보는 적혀 있지 않습니다  
⑤ 받은 서류는 없고, 상대 정보도 아직 확인하지 않았습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_recordKind=contract_draft`, `fraud_partyInfoInRecord=full_info` |
| ② | `fraud_recordKind=proposal`, `fraud_partyInfoInRecord=partial_info` |
| ③ | `fraud_recordKind=chat_log`, `fraud_partyInfoInRecord=name_only` |
| ④ | `fraud_recordKind=pay_request`, `fraud_partyInfoInRecord=no_info` |
| ⑤ | `fraud_recordKind=no_record`, `fraud_partyInfoInRecord=unchecked_info` |
| ⑥ 직접 입력 | `fraud_recordKind=direct_input`, `fraud_partyInfoInRecord=direct_input_detail` |

---

### Q4-B

**고객 화면**

**지금 어느 단계이고, 상대가 얼마나 재촉하나요?**

① 제안만 받았고, 재촉은 없습니다  
② 조건을 협의 중이고, 조금 서두르는 분위기입니다  
③ 구두로 동의했고, 빨리 결정하라고 재촉합니다  
④ 서명이나 입금 직전이고, 거절하면 손해라고 합니다  
⑤ 아직 제안 단계인데도 빨리 결정하라고 합니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_commitmentStage=just_asked`, `fraud_pressureLevel=no_pressure` |
| ② | `fraud_commitmentStage=negotiating`, `fraud_pressureLevel=mild_pressure` |
| ③ | `fraud_commitmentStage=agreed_unsigned`, `fraud_pressureLevel=strong_pressure` |
| ④ | `fraud_commitmentStage=ready_to_pay`, `fraud_pressureLevel=threat_loss` |
| ⑤ | `fraud_commitmentStage=just_asked`, `fraud_pressureLevel=strong_pressure` |
| ⑥ 직접 입력 | `fraud_commitmentStage=direct_input`, `fraud_pressureLevel=direct_input_detail` |

---

## A-2. 문제 발생 후 대응 검토 — 1차

### Q1-A

**고객 화면**

**어떤 일을 겪으셨나요?**

① 투자나 사업 제휴에 돈을 넣었는데, 돌려받지 못하고 있습니다  
② 대출을 받으려다 수수료 같은 추가 비용만 계속 요구받았습니다  
③ 온라인 거래나 임대로 돈을 보냈는데 물건이나 서비스를 받지 못했습니다  
④ 기관이나 지인, 취업·연애를 내세운 상대에게 돈을 보낸 뒤 연락이 끊겼습니다  
⑤ 어떤 유형인지 잘 모르겠지만, 약속한 계약이 이행되지 않습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_scheme=investment`, `fraud_problemType=money_not_returned` |
| ② | `fraud_scheme=loan`, `fraud_problemType=extra_fees_charged` |
| ③ | `fraud_scheme=online_trade`, `fraud_problemType=goods_not_received` |
| ④ | `fraud_scheme=impersonation`, `fraud_problemType=contact_lost` |
| ⑤ | `fraud_scheme=unsure_scheme`, `fraud_problemType=contract_unfulfilled` |
| ⑥ 직접 입력 | `fraud_scheme=direct_input`, `fraud_problemType=direct_input_detail` |

---

### Q2-A

**고객 화면**

**상대와는 어떻게 연락이 닿았고, 무엇을 보고 믿게 되었나요?**

① 문자메시지로 연락을 받았고, 공식 기관처럼 보이는 문서를 믿었습니다  
② 메신저로 연락했고, 수익 인증 자료를 보고 믿었습니다  
③ 전화로 연락을 받았고, 지인 소개라서 믿었습니다  
④ 온라인 광고를 보고 연락했고, 유명 사이트라서 믿었습니다  
⑤ 직접 만나서 이야기했고, 특별한 근거 없이 믿었습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_contactChannel=text_message`, `fraud_trustBasis=official_look` |
| ② | `fraud_contactChannel=messenger`, `fraud_trustBasis=returns_proof` |
| ③ | `fraud_contactChannel=phone_call`, `fraud_trustBasis=referral` |
| ④ | `fraud_contactChannel=online_post`, `fraud_trustBasis=platform_trust` |
| ⑤ | `fraud_contactChannel=in_person`, `fraud_trustBasis=no_basis` |
| ⑥ 직접 입력 | `fraud_contactChannel=direct_input`, `fraud_trustBasis=direct_input_detail` |

---

### Q3-A

**고객 화면**

**문제를 알게 된 지 얼마나 되었고, 어떻게 알게 되었나요?**

① 일주일 이내이고, 연락이 끊겨서 알게 되었습니다  
② 한 달 이내이고, 출금이나 환급이 안 돼서 알게 되었습니다  
③ 6개월 이내이고, 비슷한 사례를 보고 알게 되었습니다  
④ 6개월이 넘었고, 가족이나 지인의 조언으로 알게 되었습니다  
⑤ 한 달 이내이고, 은행이나 기관의 안내로 알게 되었습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_elapsedTime=within_week`, `fraud_discoveryTrigger=contact_stopped` |
| ② | `fraud_elapsedTime=within_month`, `fraud_discoveryTrigger=withdrawal_failed` |
| ③ | `fraud_elapsedTime=within_half_year`, `fraud_discoveryTrigger=news_or_warning` |
| ④ | `fraud_elapsedTime=over_half_year`, `fraud_discoveryTrigger=family_advice` |
| ⑤ | `fraud_elapsedTime=within_month`, `fraud_discoveryTrigger=bank_alert` |
| ⑥ 직접 입력 | `fraud_elapsedTime=direct_input`, `fraud_discoveryTrigger=direct_input_detail` |

---

### Q4-A

**고객 화면**

**지금 상대와 연락이 되나요? 상대는 어떤 입장인가요?**

① 연락이 되고, 돌려주겠다고 약속합니다  
② 연락이 되는데, 더 보내라고 요구합니다  
③ 연락이 끊겼고, 아무 말이 없습니다  
④ 상대가 차단했고, 책임이 없다고 합니다  
⑤ 번호나 계정이 바뀌었고, 오히려 위협합니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_contactStatus=in_contact`, `fraud_counterpartyStance=promises_return` |
| ② | `fraud_contactStatus=in_contact`, `fraud_counterpartyStance=demands_more` |
| ③ | `fraud_contactStatus=contact_cut`, `fraud_counterpartyStance=silent` |
| ④ | `fraud_contactStatus=blocked`, `fraud_counterpartyStance=denies_all` |
| ⑤ | `fraud_contactStatus=changed_number`, `fraud_counterpartyStance=threatens` |
| ⑥ 직접 입력 | `fraud_contactStatus=direct_input`, `fraud_counterpartyStance=direct_input_detail` |

---

# B. 2차 질문

## B-1. 제출·계약 전 서류 검토 — 2차

### Q5-B

**고객 화면**

**서류나 안내에 나온 회사·기관·상대 이름은 어디까지 확인되었나요?**

① 이름을 확인했고, 등록 정보도 직접 조회했습니다  
② 이름은 있지만, 상대가 말해 준 내용뿐입니다  
③ 공식 연락처로 물었더니 보낸 적이 없다는 답을 받았습니다  
④ 누구인지 알 수 없고, 아직 확인하지 않았습니다  
⑤ 이름은 있지만, 아직 확인해 보지 않았습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_senderIdentity=verified_entity`, `fraud_senderCheckBasis=registry_checked` |
| ② | `fraud_senderIdentity=name_only_entity`, `fraud_senderCheckBasis=counterparty_said` |
| ③ | `fraud_senderIdentity=impersonation_hint`, `fraud_senderCheckBasis=callback_checked` |
| ④ | `fraud_senderIdentity=unknown_sender`, `fraud_senderCheckBasis=not_checked` |
| ⑤ | `fraud_senderIdentity=name_only_entity`, `fraud_senderCheckBasis=not_checked` |
| ⑥ 직접 입력 | `fraud_senderIdentity=direct_input`, `fraud_senderCheckBasis=direct_input_detail` |

---

### Q6-B

**고객 화면**

**상대가 내세운 수익이나 조건은 어느 쪽에 가깝나요?**

① 높은 수익을 내세우며 원금이나 수익을 보장한다고 합니다  
② 낮은 금리와 쉬운 승인을 내세우며 수수료나 보증금을 먼저 내라고 합니다  
③ 시세보다 싼 상품을 내세우며 기간이나 인원이 한정이라고 합니다  
④ 결혼이나 동거 약속을 내세우며 다른 사람에게는 말하지 말라고 합니다  
⑤ 수익 분배나 지분을 약속하며 별다른 조건은 없다고 합니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_benefitType=high_return`, `fraud_benefitCondition=guaranteed` |
| ② | `fraud_benefitType=easy_loan`, `fraud_benefitCondition=fee_first` |
| ③ | `fraud_benefitType=cheap_goods`, `fraud_benefitCondition=limited_time` |
| ④ | `fraud_benefitType=marriage_promise`, `fraud_benefitCondition=secrecy` |
| ⑤ | `fraud_benefitType=profit_share`, `fraud_benefitCondition=no_condition` |
| ⑥ 직접 입력 | `fraud_benefitType=direct_input`, `fraud_benefitCondition=direct_input_detail` |

---

### Q7-B

**고객 화면**

**송금하라는 계좌의 명의와 서류에 적힌 이름은 어떻게 연결되어 있나요?**

① 계좌 명의가 서류의 상대 이름과 같고, 따로 확인하지는 않았습니다  
② 계좌 명의가 상대 이름과 다르고, 이유를 물으면 피합니다  
③ 개인 명의 계좌로 보내라고 하고, 이유 설명은 없습니다  
④ 계좌 명의를 아직 모르고, 물어보지도 않았습니다  
⑤ 계좌 명의가 상대 이름과 다르지만, 이유를 설명해 주었습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_accountMatch=matches_party`, `fraud_accountExplanation=not_asked` |
| ② | `fraud_accountMatch=differs_party`, `fraud_accountExplanation=evasive` |
| ③ | `fraud_accountMatch=personal_account`, `fraud_accountExplanation=no_explanation` |
| ④ | `fraud_accountMatch=account_unknown`, `fraud_accountExplanation=not_asked` |
| ⑤ | `fraud_accountMatch=differs_party`, `fraud_accountExplanation=explained_ok` |
| ⑥ 직접 입력 | `fraud_accountMatch=direct_input`, `fraud_accountExplanation=direct_input_detail` |

---

### Q8-B

**고객 화면**

**지금까지 돈을 보냈거나 개인정보를 알려 준 적이 있나요?**

① 돈도 보내지 않았고, 정보도 알려 주지 않았습니다  
② 보내라는 요청만 받았고, 신분증은 보냈습니다  
③ 일부를 이미 보냈고, 계좌·카드 정보를 알려 줬습니다  
④ 전부 보냈고, 인증번호나 비밀번호를 알려 줬습니다  
⑤ 돈은 보내지 않았지만, 신분증을 보냈습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_moneyStatus=not_sent`, `fraud_infoShared=none_shared` |
| ② | `fraud_moneyStatus=asked_to_send`, `fraud_infoShared=id_shared` |
| ③ | `fraud_moneyStatus=partly_sent`, `fraud_infoShared=account_shared` |
| ④ | `fraud_moneyStatus=sent_all`, `fraud_infoShared=login_shared` |
| ⑤ | `fraud_moneyStatus=not_sent`, `fraud_infoShared=id_shared` |
| ⑥ 직접 입력 | `fraud_moneyStatus=direct_input`, `fraud_infoShared=direct_input_detail` |

---

### Q9-B

**고객 화면**

**대화·서류·입금 내역은 보관하고 있나요? 상대와는 어떻게 연락하나요?**

① 모두 보관하고 있고, 전화 통화도 가능합니다  
② 모두 보관하고 있고, 온라인으로만 연락합니다  
③ 일부만 보관하고 있고, 직접 만날 수 있습니다  
④ 일부를 지웠거나 사라졌고, 직접 연락하기는 어렵습니다  
⑤ 남은 자료가 없고, 온라인으로만 연락합니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_evidenceState=all_kept`, `fraud_contactMethod=phone_ok` |
| ② | `fraud_evidenceState=all_kept`, `fraud_contactMethod=only_online` |
| ③ | `fraud_evidenceState=partly_kept`, `fraud_contactMethod=visit_ok` |
| ④ | `fraud_evidenceState=deleted_some`, `fraud_contactMethod=no_direct` |
| ⑤ | `fraud_evidenceState=none_kept`, `fraud_contactMethod=only_online` |
| ⑥ 직접 입력 | `fraud_evidenceState=direct_input`, `fraud_contactMethod=direct_input_detail` |

---

### Q10-B

**고객 화면**

**상대가 추가로 요구한 것이 있나요? 확인해 보겠다고 하면 어떻게 반응하나요?**

① 비용을 더 내라고 하고, 확인하지 말라고 합니다  
② 기한 안에 하라고 재촉하고, 확인 얘기에 화를 냅니다  
③ 다른 앱이나 사이트로 옮기자고 하고, 확인을 요청해 본 적은 없습니다  
④ 다른 사람에게 말하지 말라고 하고, 확인하지 말라고 합니다  
⑤ 추가 요구는 없고, 확인해 보라고 합니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_additionalDemand=more_money`, `fraud_verificationResponse=discourages_check` |
| ② | `fraud_additionalDemand=urgent_deadline`, `fraud_verificationResponse=gets_angry` |
| ③ | `fraud_additionalDemand=move_platform`, `fraud_verificationResponse=not_tried` |
| ④ | `fraud_additionalDemand=keep_secret`, `fraud_verificationResponse=discourages_check` |
| ⑤ | `fraud_additionalDemand=none_demand`, `fraud_verificationResponse=welcomes_check` |
| ⑥ 직접 입력 | `fraud_additionalDemand=direct_input`, `fraud_verificationResponse=direct_input_detail` |

---

## B-2. 문제 발생 후 대응 검토 — 2차

### Q5-A

**고객 화면**

**서류나 안내에 나온 회사·기관·상대 이름은 어디까지 확인되었나요?**

① 이름을 확인했고, 등록 정보도 직접 조회했습니다  
② 이름은 있었지만, 상대가 말해 준 내용뿐이었습니다  
③ 나중에 공식 연락처로 물었더니 보낸 적이 없다고 했습니다  
④ 누구인지 알 수 없고, 확인하지 못했습니다  
⑤ 이름은 있었지만, 아직 확인해 보지 못했습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_senderIdentity=verified_entity`, `fraud_senderCheckBasis=registry_checked` |
| ② | `fraud_senderIdentity=name_only_entity`, `fraud_senderCheckBasis=counterparty_said` |
| ③ | `fraud_senderIdentity=impersonation_hint`, `fraud_senderCheckBasis=callback_checked` |
| ④ | `fraud_senderIdentity=unknown_sender`, `fraud_senderCheckBasis=not_checked` |
| ⑤ | `fraud_senderIdentity=name_only_entity`, `fraud_senderCheckBasis=not_checked` |
| ⑥ 직접 입력 | `fraud_senderIdentity=direct_input`, `fraud_senderCheckBasis=direct_input_detail` |

---

### Q6-A

**고객 화면**

**상대가 내세웠던 수익이나 조건은 어느 쪽에 가까웠나요?**

① 높은 수익을 내세우며 원금이나 수익을 보장한다고 했습니다  
② 낮은 금리와 쉬운 승인을 내세우며 수수료나 보증금을 먼저 내라고 했습니다  
③ 시세보다 싼 상품을 내세우며 기간이나 인원이 한정이라고 했습니다  
④ 결혼이나 동거 약속을 내세우며 다른 사람에게는 말하지 말라고 했습니다  
⑤ 수익 분배나 지분을 약속했고 별다른 조건은 없다고 했습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_benefitType=high_return`, `fraud_benefitCondition=guaranteed` |
| ② | `fraud_benefitType=easy_loan`, `fraud_benefitCondition=fee_first` |
| ③ | `fraud_benefitType=cheap_goods`, `fraud_benefitCondition=limited_time` |
| ④ | `fraud_benefitType=marriage_promise`, `fraud_benefitCondition=secrecy` |
| ⑤ | `fraud_benefitType=profit_share`, `fraud_benefitCondition=no_condition` |
| ⑥ 직접 입력 | `fraud_benefitType=direct_input`, `fraud_benefitCondition=direct_input_detail` |

---

### Q7-A

**고객 화면**

**돈을 보낸 계좌의 명의와 서류에 적힌 이름은 어떻게 연결되어 있었나요?**

① 계좌 명의가 서류의 상대 이름과 같았고, 따로 확인하지는 않았습니다  
② 계좌 명의가 상대 이름과 달랐고, 이유를 물으면 피했습니다  
③ 개인 명의 계좌로 보냈고, 이유 설명은 없었습니다  
④ 계좌가 여러 개였고, 이유를 물으면 피했습니다  
⑤ 계좌 명의를 모르는 채 보냈고, 물어보지도 못했습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_accountMatch=matches_party`, `fraud_accountExplanation=not_asked` |
| ② | `fraud_accountMatch=differs_party`, `fraud_accountExplanation=evasive` |
| ③ | `fraud_accountMatch=personal_account`, `fraud_accountExplanation=no_explanation` |
| ④ | `fraud_accountMatch=multiple_accounts`, `fraud_accountExplanation=evasive` |
| ⑤ | `fraud_accountMatch=account_unknown`, `fraud_accountExplanation=not_asked` |
| ⑥ 직접 입력 | `fraud_accountMatch=direct_input`, `fraud_accountExplanation=direct_input_detail` |

---

### Q8-A

**고객 화면**

**돈은 어느 정도 보냈나요?**

① 돈은 보내지 않았습니다  
② 일부를 보냈고, 100만 동 미만입니다  
③ 전부 보냈고, 100만 동 이상 1천만 동 미만입니다  
④ 여러 번 나누어 보냈고, 1천만 동 이상 1억 동 미만입니다  
⑤ 전부 보냈고, 1억 동 이상입니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_moneyStatus=not_sent`, `fraud_lossScale=loss_none` |
| ② | `fraud_moneyStatus=partly_sent`, `fraud_lossScale=loss_under_1m` |
| ③ | `fraud_moneyStatus=sent_all`, `fraud_lossScale=loss_1m_10m` |
| ④ | `fraud_moneyStatus=repeated_sent`, `fraud_lossScale=loss_10m_100m` |
| ⑤ | `fraud_moneyStatus=sent_all`, `fraud_lossScale=loss_over_100m` |
| ⑥ 직접 입력 | `fraud_moneyStatus=direct_input`, `fraud_lossScale=direct_input_detail` |

---

### Q9-A

**고객 화면**

**대화·서류·입금 내역은 보관하고 있나요? 상대와는 어떻게 연락할 수 있나요?**

① 모두 보관하고 있고, 전화 통화도 가능합니다  
② 모두 보관하고 있고, 온라인으로만 연락했습니다  
③ 일부만 보관하고 있고, 직접 만날 수도 있습니다  
④ 일부를 지웠거나 사라졌고, 직접 연락하기는 어렵습니다  
⑤ 남은 자료가 없고, 온라인으로만 연락했습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_evidenceState=all_kept`, `fraud_contactMethod=phone_ok` |
| ② | `fraud_evidenceState=all_kept`, `fraud_contactMethod=only_online` |
| ③ | `fraud_evidenceState=partly_kept`, `fraud_contactMethod=visit_ok` |
| ④ | `fraud_evidenceState=deleted_some`, `fraud_contactMethod=no_direct` |
| ⑤ | `fraud_evidenceState=none_kept`, `fraud_contactMethod=only_online` |
| ⑥ 직접 입력 | `fraud_evidenceState=direct_input`, `fraud_contactMethod=direct_input_detail` |

---

### Q10-A

**고객 화면**

**지금까지 어떤 조치를 해 보셨고, 결과는 어떤가요?**

① 은행에 거래 중단이나 환수를 요청했고, 접수되어 진행 중입니다  
② 거래 플랫폼에 신고했지만, 답변이 없습니다  
③ 상대에게 직접 환불을 요청했지만, 거절당했습니다  
④ 주변에 상담했고, 아직 결과는 모릅니다  
⑤ 아직 아무 조치도 하지 않았습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `fraud_actionTaken=bank_recall`, `fraud_actionResult=accepted` |
| ② | `fraud_actionTaken=platform_report`, `fraud_actionResult=no_reply` |
| ③ | `fraud_actionTaken=direct_refund`, `fraud_actionResult=rejected` |
| ④ | `fraud_actionTaken=consulted_others`, `fraud_actionResult=too_early` |
| ⑤ | `fraud_actionTaken=nothing_yet`, `fraud_actionResult=not_applicable` |
| ⑥ 직접 입력 | `fraud_actionTaken=direct_input`, `fraud_actionResult=direct_input_detail` |

---

# C. 필드 표

모든 필드는 한 질문의 선택지에 2개 이상 함께 저장되고, 아래 E의 결과 문장 또는 위험 규칙에서 사용된다. 값 옆은 고객 표시 문구(G).

## C-1. 제출·계약 전 서류 검토

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `fraud_scheme` | `investment`(투자·수익·사업 제휴 관련) / `loan`(대출 관련) / `online_trade`(온라인 거래·임대 관련) / `impersonation`(기관·지인 사칭, 취업·연애 관련) / `unsure_scheme`(어떤 유형인지 모름) | Q1-B |
| `fraud_requestedAction` | `send_first`(먼저 돈을 보내라는 요구) / `give_info`(신분증·계좌 정보를 달라는 요구) / `install_login`(앱 설치·로그인을 하라는 요구) / `meet_move`(만나자거나 다른 곳으로 옮기자는 요구) / `sign_now`(서명·계약을 서두르라는 요구) | Q1-B |
| `fraud_contactChannel` | `text_message`(문자메시지) / `messenger`(메신저 앱) / `phone_call`(전화) / `online_post`(온라인 광고·게시글) / `in_person`(직접 만남) | Q2-B |
| `fraud_trustBasis` | `official_look`(공식 기관처럼 보이는 문서) / `returns_proof`(수익 인증 자료) / `referral`(지인·소개) / `platform_trust`(유명 사이트·플랫폼 이용) / `no_basis`(특별한 근거 없음) | Q2-B |
| `fraud_recordKind` | `contract_draft`(계약서·약정서) / `proposal`(제안서·안내문) / `chat_log`(대화 내용) / `pay_request`(입금 안내·청구서) / `no_record`(받은 서류 없음) | Q3-B |
| `fraud_partyInfoInRecord` | `full_info`(상대 정보가 모두 적혀 있음) / `partial_info`(상대 정보가 일부만 적혀 있음) / `name_only`(이름이나 별칭만 있음) / `no_info`(상대 정보가 없음) / `unchecked_info`(아직 확인하지 않음) | Q3-B |
| `fraud_commitmentStage` | `just_asked`(제안만 받음) / `negotiating`(조건을 협의 중) / `agreed_unsigned`(구두로 동의함) / `ready_to_pay`(서명·입금 직전) | Q4-B |
| `fraud_pressureLevel` | `no_pressure`(재촉 없음) / `mild_pressure`(다소 서두름) / `strong_pressure`(빠른 결정을 강하게 재촉함) / `threat_loss`(거절하면 손해라고 위협함) | Q4-B |
| `fraud_senderIdentity` | `verified_entity`(회사·기관 이름이 확인됨) / `name_only_entity`(이름만 있고 확인되지 않음) / `impersonation_hint`(기관·회사를 사칭하는 듯함) / `unknown_sender`(누구인지 알 수 없음) | Q5-B |
| `fraud_senderCheckBasis` | `registry_checked`(등록 정보를 직접 조회함) / `counterparty_said`(상대가 말한 내용뿐임) / `callback_checked`(공식 연락처로 직접 확인함) / `not_checked`(아직 확인하지 않음) | Q5-B |
| `fraud_benefitType` | `high_return`(높은 수익·이자) / `easy_loan`(낮은 금리·쉬운 승인) / `cheap_goods`(시세보다 싼 상품) / `marriage_promise`(결혼·동거 약속) / `profit_share`(수익 분배·지분 약속) | Q6-B |
| `fraud_benefitCondition` | `guaranteed`(원금·수익을 보장한다고 함) / `fee_first`(수수료·보증금을 먼저 내라고 함) / `limited_time`(기간·인원이 한정이라고 함) / `secrecy`(비밀 유지를 요구함) / `no_condition`(별다른 조건 없음) | Q6-B |
| `fraud_accountMatch` | `matches_party`(서류의 상대 이름과 일치) / `differs_party`(상대 이름과 다름) / `personal_account`(개인 명의 계좌) / `account_unknown`(명의를 아직 모름) | Q7-B |
| `fraud_accountExplanation` | `not_asked`(아직 물어보지 않음) / `evasive`(설명을 피하거나 말이 바뀜) / `no_explanation`(설명이 없음) / `explained_ok`(다른 명의의 이유를 설명함) | Q7-B |
| `fraud_moneyStatus` | `not_sent`(아직 보내지 않음) / `asked_to_send`(보내 달라는 요청만 받음) / `partly_sent`(일부를 이미 보냄) / `sent_all`(전부 보냄) | Q8-B |
| `fraud_infoShared` | `none_shared`(정보를 알려 주지 않음) / `id_shared`(신분증을 보냄) / `account_shared`(계좌·카드 정보를 알려 줌) / `login_shared`(인증번호·비밀번호를 알려 줌) | Q8-B |
| `fraud_evidenceState` | `all_kept`(대화·서류·입금 내역을 모두 보관) / `partly_kept`(일부만 보관) / `deleted_some`(일부를 지웠거나 사라짐) / `none_kept`(남은 자료 없음) | Q9-B |
| `fraud_contactMethod` | `phone_ok`(전화 통화가 가능함) / `only_online`(온라인으로만 연락함) / `visit_ok`(직접 만날 수 있음) / `no_direct`(직접 연락하기 어려움) | Q9-B |
| `fraud_additionalDemand` | `more_money`(추가 비용을 더 요구함) / `urgent_deadline`(기한 안에 하라고 재촉함) / `move_platform`(다른 앱·사이트로 이동을 요구함) / `keep_secret`(다른 사람에게 말하지 말라고 함) / `none_demand`(추가 요구 없음) | Q10-B |
| `fraud_verificationResponse` | `discourages_check`(확인하지 말라고 함) / `gets_angry`(확인 얘기에 화를 냄) / `not_tried`(확인을 요청해 보지 않음) / `welcomes_check`(확인을 해 보라고 함) | Q10-B |

## C-2. 문제 발생 후 대응 검토

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `fraud_scheme` | `investment`(투자·수익·사업 제휴 관련) / `loan`(대출 관련) / `online_trade`(온라인 거래·임대 관련) / `impersonation`(기관·지인 사칭, 취업·연애 관련) / `unsure_scheme`(어떤 유형인지 모름) | Q1-A |
| `fraud_problemType` | `money_not_returned`(보낸 돈이 돌아오지 않음) / `extra_fees_charged`(추가 비용만 계속 요구받음) / `goods_not_received`(물건·서비스를 받지 못함) / `contact_lost`(연락이 끊김) / `contract_unfulfilled`(약속한 계약이 이행되지 않음) | Q1-A |
| `fraud_contactChannel` | `text_message`(문자메시지) / `messenger`(메신저 앱) / `phone_call`(전화) / `online_post`(온라인 광고·게시글) / `in_person`(직접 만남) | Q2-A |
| `fraud_trustBasis` | `official_look`(공식 기관처럼 보이는 문서) / `returns_proof`(수익 인증 자료) / `referral`(지인·소개) / `platform_trust`(유명 사이트·플랫폼 이용) / `no_basis`(특별한 근거 없음) | Q2-A |
| `fraud_elapsedTime` | `within_week`(일주일 이내) / `within_month`(한 달 이내) / `within_half_year`(6개월 이내) / `over_half_year`(6개월 초과) | Q3-A |
| `fraud_discoveryTrigger` | `contact_stopped`(연락이 끊겨서) / `withdrawal_failed`(출금·환급이 안 돼서) / `news_or_warning`(비슷한 사례를 보고) / `family_advice`(가족·지인의 조언으로) / `bank_alert`(은행·기관의 안내로) | Q3-A |
| `fraud_contactStatus` | `in_contact`(연락이 되는 중) / `contact_cut`(연락이 끊김) / `blocked`(상대가 차단함) / `changed_number`(번호·계정이 바뀜) | Q4-A |
| `fraud_counterpartyStance` | `promises_return`(돌려주겠다고 약속함) / `demands_more`(더 보내라고 요구함) / `silent`(아무 말 없음) / `denies_all`(책임을 부인함) / `threatens`(오히려 협박함) | Q4-A |
| `fraud_senderIdentity` | `verified_entity`(회사·기관 이름이 확인됨) / `name_only_entity`(이름만 있고 확인되지 않음) / `impersonation_hint`(기관·회사를 사칭하는 듯함) / `unknown_sender`(누구인지 알 수 없음) | Q5-A |
| `fraud_senderCheckBasis` | `registry_checked`(등록 정보를 직접 조회함) / `counterparty_said`(상대가 말한 내용뿐임) / `callback_checked`(공식 연락처로 직접 확인함) / `not_checked`(아직 확인하지 않음) | Q5-A |
| `fraud_benefitType` | `high_return`(높은 수익·이자) / `easy_loan`(낮은 금리·쉬운 승인) / `cheap_goods`(시세보다 싼 상품) / `marriage_promise`(결혼·동거 약속) / `profit_share`(수익 분배·지분 약속) | Q6-A |
| `fraud_benefitCondition` | `guaranteed`(원금·수익을 보장한다고 함) / `fee_first`(수수료·보증금을 먼저 내라고 함) / `limited_time`(기간·인원이 한정이라고 함) / `secrecy`(비밀 유지를 요구함) / `no_condition`(별다른 조건 없음) | Q6-A |
| `fraud_accountMatch` | `matches_party`(서류의 상대 이름과 일치) / `differs_party`(상대 이름과 다름) / `personal_account`(개인 명의 계좌) / `multiple_accounts`(계좌가 여러 개였음) / `account_unknown`(명의를 아직 모름) | Q7-A |
| `fraud_accountExplanation` | `not_asked`(아직 물어보지 않음) / `evasive`(설명을 피하거나 말이 바뀜) / `no_explanation`(설명이 없음) | Q7-A |
| `fraud_moneyStatus` | `not_sent`(아직 보내지 않음) / `partly_sent`(일부를 이미 보냄) / `sent_all`(전부 보냄) / `repeated_sent`(여러 번 나누어 보냄) | Q8-A |
| `fraud_lossScale` | `loss_none`(금전 피해 없음) / `loss_under_1m`(100만 동 미만) / `loss_1m_10m`(100만 동 이상 1천만 동 미만) / `loss_10m_100m`(1천만 동 이상 1억 동 미만) / `loss_over_100m`(1억 동 이상) | Q8-A |
| `fraud_evidenceState` | `all_kept`(대화·서류·입금 내역을 모두 보관) / `partly_kept`(일부만 보관) / `deleted_some`(일부를 지웠거나 사라짐) / `none_kept`(남은 자료 없음) | Q9-A |
| `fraud_contactMethod` | `phone_ok`(전화 통화가 가능함) / `only_online`(온라인으로만 연락함) / `visit_ok`(직접 만날 수 있음) / `no_direct`(직접 연락하기 어려움) | Q9-A |
| `fraud_actionTaken` | `bank_recall`(은행에 거래 중단·환수 요청) / `platform_report`(거래 플랫폼에 신고) / `direct_refund`(상대에게 직접 환불 요청) / `consulted_others`(주변에 상담함) / `nothing_yet`(아직 아무것도 하지 않음) | Q10-A |
| `fraud_actionResult` | `accepted`(접수되어 진행 중) / `no_reply`(답변이 없음) / `rejected`(거절·보류됨) / `too_early`(아직 결과를 모름) / `not_applicable`(해당 없음) | Q10-A |

# D. 라우팅

1. 진입 화면에서 ①을 고르면 경로 B(제출·계약 전), ②를 고르면 경로 A(문제 발생 후)로 이동한다.
2. ③ 잘 모르겠습니다와 ④ 직접 입력은 기본 경로인 B로 이동하며, 선택 방식(`fraud_routeSelectionMode`)만 다르게 저장한다.
3. 경로 안에서는 Q1부터 Q10까지 순서대로 진행하며 생략하지 않는다. 1차(Q1~Q4) 종료 시 E-1 무료 결과, 2차(Q5~Q10) 종료 시 E-2 결과를 표시한다.
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
| ① | `fraud_scheme=investment`, `fraud_requestedAction=send_first` | 투자 제안을 받았고 먼저 돈을 넣으라는 요구가 있습니다 | 30 |
| ② | `fraud_scheme=loan`, `fraud_requestedAction=give_info` | 대출 제안을 받았고 신분증·계좌 정보를 요구받고 있습니다 | 31 |
| ③ | `fraud_scheme=online_trade`, `fraud_requestedAction=install_login` | 온라인 거래·임대에서 앱 설치나 로그인을 요구받고 있습니다 | 32 |
| ④ | `fraud_scheme=impersonation`, `fraud_requestedAction=meet_move` | 기관·지인을 내세운 상대가 장소를 옮기자고 요구합니다 | 29 |
| ⑤ | `fraud_scheme=unsure_scheme`, `fraud_requestedAction=sign_now` | 유형은 알 수 없지만 서명을 서두르라는 요구가 있습니다 | 30 |

**카드2 (연락 경로와 믿은 근거)** — Q2-B

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_contactChannel=text_message`, `fraud_trustBasis=official_look` | 문자로 연락이 왔고 공식 문서처럼 보이는 자료가 있습니다 | 31 |
| ② | `fraud_contactChannel=messenger`, `fraud_trustBasis=returns_proof` | 메신저로 연락했고 수익 인증 자료를 내세우고 있습니다 | 29 |
| ③ | `fraud_contactChannel=phone_call`, `fraud_trustBasis=referral` | 전화로 연락이 왔고 지인 소개라고 말하고 있습니다 | 27 |
| ④ | `fraud_contactChannel=online_post`, `fraud_trustBasis=platform_trust` | 온라인 광고로 시작했고 유명 사이트라는 점을 믿은 상태입니다 | 33 |
| ⑤ | `fraud_contactChannel=in_person`, `fraud_trustBasis=no_basis` | 직접 만나 이야기했지만 믿을 근거가 뚜렷하지 않습니다 | 29 |

**카드3 (받은 서류와 상대 정보)** — Q3-B

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_recordKind=contract_draft`, `fraud_partyInfoInRecord=full_info` | 계약서가 있고 상대 정보가 모두 적혀 있습니다 | 25 |
| ② | `fraud_recordKind=proposal`, `fraud_partyInfoInRecord=partial_info` | 제안서가 있지만 상대 정보는 일부만 적혀 있습니다 | 27 |
| ③ | `fraud_recordKind=chat_log`, `fraud_partyInfoInRecord=name_only` | 대화 내용만 있고 상대는 이름이나 별칭뿐입니다 | 25 |
| ④ | `fraud_recordKind=pay_request`, `fraud_partyInfoInRecord=no_info` | 입금 안내만 있고 상대 정보는 적혀 있지 않습니다 | 27 |
| ⑤ | `fraud_recordKind=no_record`, `fraud_partyInfoInRecord=unchecked_info` | 받은 서류가 없고 상대 정보도 확인 전입니다 | 24 |

**01 판정 + 본문** — Q4-B

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `fraud_commitmentStage=just_asked`, `fraud_pressureLevel=no_pressure` | 제안만 받은 초기 단계로, 확인할 시간이 있는 상황입니다 | 아직 약속이나 송금이 없어 서류와 상대 정보를 차분히 살펴볼 수 있습니다. 확인이 끝나기 전에는 돈이나 개인정보를 보내지 않는 것이 안전합니다. |
| ② | `fraud_commitmentStage=negotiating`, `fraud_pressureLevel=mild_pressure` | 조건을 협의하는 중이며 결정을 서두르는 분위기가 있습니다 | 협의 단계라서 아직 되돌릴 수 있는 부분이 많습니다. 서두르는 이유가 무엇인지 묻고, 서류에 적힌 조건과 말로 들은 조건이 같은지 맞춰 보세요. |
| ③ | `fraud_commitmentStage=agreed_unsigned`, `fraud_pressureLevel=strong_pressure` | 구두로 동의한 상태에서 빠른 결정을 재촉받는 상황입니다 | 서명이나 송금 전이라면 아직 멈추고 확인할 수 있는 시점입니다. 강하게 재촉하는 연락은 확인할 시간을 주지 않으려는 신호일 수 있어 주의가 필요합니다. |
| ④ | `fraud_commitmentStage=ready_to_pay`, `fraud_pressureLevel=threat_loss` | 서명·입금 직전에 손해를 내세워 압박받는 상황으로 보입니다 | 지금 서명하거나 보내면 되돌리기 어려울 수 있어 한 번 더 확인이 필요합니다. 상대가 확인을 막는다면 그 사실 자체를 기록해 두세요. |
| ⑤ | `fraud_commitmentStage=just_asked`, `fraud_pressureLevel=strong_pressure` | 제안 단계인데도 빠른 결정을 재촉받는 상황입니다 | 내용을 충분히 확인하기도 전에 결정을 요구하고 있어 신중한 접근이 필요합니다. 재촉이 계속되면 연락 내용을 모두 남겨 두고 확인 전에는 응하지 마세요. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (pre_sent) | `fraud_moneyStatus` ∈ {partly_sent, sent_all} 또는 `fraud_infoShared` ∈ {account_shared, login_shared} | 이미 돈을 보냈거나 계좌·인증 정보를 알려 준 상태라 추가 피해를 막는 조치를 먼저 살펴봐야 할 수 있습니다 |
| 2 (pre_account) | `fraud_accountMatch` ∈ {differs_party, personal_account, account_unknown} | 송금 계좌의 명의가 서류의 상대와 다르거나 확인되지 않아 보내기 전에 명의 확인이 필요합니다 |
| 3 (pre_block) | `fraud_verificationResponse` ∈ {discourages_check, gets_angry} 또는 `fraud_additionalDemand` ∈ {keep_secret} | 상대가 확인이나 상의를 막고 있어 독립된 경로로 사실을 확인할 필요가 있습니다 |
| 4 (pre_pressure) | `fraud_pressureLevel` ∈ {strong_pressure, threat_loss} 또는 `fraud_additionalDemand` ∈ {urgent_deadline} | 결정을 강하게 재촉받고 있어 서둘러 서명하거나 보내기 전에 한 번 더 멈추고 확인해야 합니다 |
| 5 (pre_sender) | `fraud_senderIdentity` ∈ {name_only_entity, impersonation_hint, unknown_sender} | 회사·기관 이름이 아직 확인되지 않았거나 사칭이 의심되어 발신처 확인이 먼저 필요합니다 |
| 6 (pre_promise) | `fraud_benefitCondition` ∈ {guaranteed, fee_first} | 수익 보장이나 선납 비용 요구가 있어 약속이 서류에 어떻게 적혀 있는지 확인이 필요합니다 |
| 7 (pre_move) | `fraud_additionalDemand` ∈ {more_money, move_platform} 또는 `fraud_requestedAction` ∈ {install_login, meet_move} | 추가 비용 요구나 다른 곳으로 옮기자는 요구가 있어 요구가 늘어나는 흐름을 기록해 둘 필요가 있습니다 |
| 기본 | 위 조건에 하나도 해당하지 않음 | 입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 서명이나 송금 전에 상대와 서류를 한 번 더 확인하세요 |

### E-1-A. 문제 발생 후 대응 검토

**카드1 (겪은 문제)** — Q1-A

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_scheme=investment`, `fraud_problemType=money_not_returned` | 투자한 돈이 돌아오지 않는 문제가 생긴 상황입니다 | 27 |
| ② | `fraud_scheme=loan`, `fraud_problemType=extra_fees_charged` | 대출 과정에서 추가 비용 요구가 이어진 상황입니다 | 27 |
| ③ | `fraud_scheme=online_trade`, `fraud_problemType=goods_not_received` | 온라인 거래·임대 후 물건이나 서비스를 받지 못한 상황입니다 | 33 |
| ④ | `fraud_scheme=impersonation`, `fraud_problemType=contact_lost` | 기관·지인을 내세운 상대와 돈을 보낸 뒤 연락이 끊겼습니다 | 32 |
| ⑤ | `fraud_scheme=unsure_scheme`, `fraud_problemType=contract_unfulfilled` | 유형은 알 수 없지만 계약이 약속대로 이행되지 않습니다 | 30 |

**카드2 (연락 경로와 믿은 근거)** — Q2-A

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_contactChannel=text_message`, `fraud_trustBasis=official_look` | 문자로 시작됐고 공식 문서처럼 보인 자료를 믿었습니다 | 29 |
| ② | `fraud_contactChannel=messenger`, `fraud_trustBasis=returns_proof` | 메신저로 시작됐고 수익 인증 자료를 보고 믿었습니다 | 28 |
| ③ | `fraud_contactChannel=phone_call`, `fraud_trustBasis=referral` | 전화로 시작됐고 지인 소개라서 믿은 경우입니다 | 25 |
| ④ | `fraud_contactChannel=online_post`, `fraud_trustBasis=platform_trust` | 온라인 광고로 시작됐고 유명 사이트라는 점을 믿었습니다 | 30 |
| ⑤ | `fraud_contactChannel=in_person`, `fraud_trustBasis=no_basis` | 직접 만나 시작됐고 뚜렷한 근거 없이 믿은 경우입니다 | 29 |

**카드3 (시간 경과와 알게 된 계기)** — Q3-A

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `fraud_elapsedTime=within_week`, `fraud_discoveryTrigger=contact_stopped` | 일주일 이내에 연락 두절로 문제를 알게 되었습니다 | 27 |
| ② | `fraud_elapsedTime=within_month`, `fraud_discoveryTrigger=withdrawal_failed` | 한 달 이내에 출금·환급 불가로 문제를 알게 되었습니다 | 30 |
| ③ | `fraud_elapsedTime=within_half_year`, `fraud_discoveryTrigger=news_or_warning` | 6개월 이내에 비슷한 사례를 보고 문제를 알게 되었습니다 | 31 |
| ④ | `fraud_elapsedTime=over_half_year`, `fraud_discoveryTrigger=family_advice` | 6개월이 지나서 주변 조언으로 문제를 알게 되었습니다 | 29 |
| ⑤ | `fraud_elapsedTime=within_month`, `fraud_discoveryTrigger=bank_alert` | 한 달 이내에 은행·기관 안내로 문제를 알게 되었습니다 | 30 |

**01 판정 + 본문** — Q4-A

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `fraud_contactStatus=in_contact`, `fraud_counterpartyStance=promises_return` | 연락이 닿고 상대가 반환을 약속하고 있는 상황입니다 | 약속만으로는 실제 반환이 이루어지는지 알 수 없으니 약속한 내용을 글로 받아 두세요. 반환을 이유로 더 보내라는 요구가 나오면 응하기 전에 멈추고 확인하세요. |
| ② | `fraud_contactStatus=in_contact`, `fraud_counterpartyStance=demands_more` | 연락은 닿지만 상대가 추가 송금을 계속 요구하는 상황입니다 | 추가로 보낼수록 피해가 커질 수 있어 더 보내기 전에 지금까지의 요구를 정리해 확인해야 합니다. 요구한 내용과 시점이 보이도록 대화를 저장해 두세요. |
| ③ | `fraud_contactStatus=contact_cut`, `fraud_counterpartyStance=silent` | 상대와 연락이 끊긴 채 응답이 없는 상황입니다 | 연락이 끊기기 전의 대화와 송금 기록이 가장 중요한 근거가 됩니다. 지금 가진 자료부터 시간 순서로 정리해 두세요. |
| ④ | `fraud_contactStatus=blocked`, `fraud_counterpartyStance=denies_all` | 상대가 연락을 차단하고 책임을 부인하는 상황입니다 | 차단되기 전의 대화 화면과 송금 내역을 먼저 확보하는 것이 중요합니다. 상대가 책임을 부인하더라도 기록이 남아 있다면 이후 확인에 쓰일 수 있습니다. |
| ⑤ | `fraud_contactStatus=changed_number`, `fraud_counterpartyStance=threatens` | 상대가 연락처를 바꾸고 위협까지 하는 상황으로 보입니다 | 위협을 받았다면 혼자 대응하지 말고 위협 내용을 그대로 저장한 뒤 전문가나 관련 기관에 알리는 것이 좋습니다. 상대의 요구에는 응하지 마세요. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (post_amount) | `fraud_lossScale` ∈ {loss_10m_100m, loss_over_100m} | 피해 금액이 커서 은행과 관련 기관에 빨리 알리고 전문가와 함께 진행하는 방법을 살펴볼 필요가 있습니다 |
| 2 (post_more) | `fraud_counterpartyStance` ∈ {demands_more, threatens} 또는 `fraud_moneyStatus` ∈ {repeated_sent} | 추가 송금이나 위협이 이어지고 있어 요구에 응하기 전에 멈추고 기록을 남겨야 합니다 |
| 3 (post_contact) | `fraud_contactStatus` ∈ {contact_cut, blocked, changed_number} | 상대와 연락이 끊기거나 차단되어 있어 남아 있는 대화와 송금 기록을 먼저 확보해야 합니다 |
| 4 (post_evidence) | `fraud_evidenceState` ∈ {deleted_some, none_kept, partly_kept} | 자료가 일부 또는 전부 없는 상태라 은행 거래 내역과 앱 기록으로 다시 모을 수 있는지 확인이 필요합니다 |
| 5 (post_time) | `fraud_elapsedTime` ∈ {within_half_year, over_half_year} | 시간이 지났다면 거래 내역과 기록 확인이 어려워질 수 있어 가능한 한 빨리 확인하는 것이 좋습니다 |
| 6 (post_account) | `fraud_accountMatch` ∈ {differs_party, multiple_accounts, personal_account} | 송금 계좌의 명의가 다르거나 여러 개여서 계좌별 송금 내역을 따로 정리해 둘 필요가 있습니다 |
| 7 (post_fee) | `fraud_problemType` ∈ {extra_fees_charged} 또는 `fraud_benefitCondition` ∈ {fee_first} | 수수료 등 추가 비용 요구가 반복되어 이미 낸 비용을 항목별로 정리해 둘 필요가 있습니다 |
| 8 (post_noaction) | `fraud_actionTaken` ∈ {nothing_yet} | 아직 취한 조치가 없어 자료 정리와 은행 문의부터 시작하는 것이 좋습니다 |
| 기본 | 위 조건에 하나도 해당하지 않음 | 입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 송금 내역과 대화 기록은 계속 보관해 두세요 |

## E-2. 2차 결과 (경로별)

2차 결과는 질문 하나당 소제목 1개와 선택지별 문장 1개로 구성한다. 선택지의 저장 필드 쌍이 키이며, 두 필드가 모두 문장에 반영된다. 직접 입력을 고른 질문은 `직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.`를 표시한다.

### E-2-B. 제출·계약 전 서류 검토

**발신처 확인** — Q5-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_senderIdentity=verified_entity`, `fraud_senderCheckBasis=registry_checked` | 이름을 등록 정보로 직접 확인한 점은 좋은 출발입니다. 다만 그 이름을 쓰는 사람이 실제 연락해 온 상대와 같은지도 함께 맞춰 보세요. |
| ② | `fraud_senderIdentity=name_only_entity`, `fraud_senderCheckBasis=counterparty_said` | 이름이 상대의 말에만 근거한 상태라 독립된 자료로 확인하는 것이 먼저입니다. 등록 정보나 공식 연락처로 직접 조회해 보세요. |
| ③ | `fraud_senderIdentity=impersonation_hint`, `fraud_senderCheckBasis=callback_checked` | 공식 연락처에서 보낸 적이 없다는 답이 나왔다면 이름만 빌려 쓴 연락일 가능성을 살펴볼 필요가 있습니다. 받은 서류와 연락처를 그대로 보관해 두세요. |
| ④ | `fraud_senderIdentity=unknown_sender`, `fraud_senderCheckBasis=not_checked` | 상대가 누구인지 알 수 없고 확인도 전이라면 어떤 요구에도 응하지 않는 것이 좋습니다. 먼저 이름과 연락처를 공식 자료로 조회해 보세요. |
| ⑤ | `fraud_senderIdentity=name_only_entity`, `fraud_senderCheckBasis=not_checked` | 이름만 있고 확인 전인 상태라 지금 조회해 보는 것이 가장 빠른 확인 방법입니다. 서류에 적힌 번호와 대표자 이름을 공식 조회 결과와 비교해 보세요. |

**수익·조건** — Q6-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_benefitType=high_return`, `fraud_benefitCondition=guaranteed` | 높은 수익과 원금 보장이 함께 나오면 서류에 근거와 위험 설명이 있는지 확인이 필요합니다. 보장 문구가 계약서에 실제로 적혀 있는지 살펴보세요. |
| ② | `fraud_benefitType=easy_loan`, `fraud_benefitCondition=fee_first` | 승인 전에 수수료나 보증금을 먼저 요구하는 방식은 주의해서 볼 필요가 있습니다. 공식 대출 상품 안내와 비용 항목이 일치하는지 확인해 보세요. |
| ③ | `fraud_benefitType=cheap_goods`, `fraud_benefitCondition=limited_time` | 시세보다 싼 가격에 기한 압박이 겹치면 비교할 시간을 막는 방식일 수 있습니다. 같은 상품의 다른 판매처 가격과 판매자 정보를 먼저 비교해 보세요. |
| ④ | `fraud_benefitType=marriage_promise`, `fraud_benefitCondition=secrecy` | 관계를 내세우며 비밀 유지를 요구하는 것은 주변의 확인을 막는 신호일 수 있습니다. 믿을 만한 가족이나 지인에게 상황을 먼저 알려 보세요. |
| ⑤ | `fraud_benefitType=profit_share`, `fraud_benefitCondition=no_condition` | 조건 없이 수익 분배나 지분을 약속한다면 그 내용이 서류에 어떻게 적히는지가 중요합니다. 구두 약속은 서류로 남겨 달라고 요청해 보세요. |

**송금 계좌 명의** — Q7-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_accountMatch=matches_party`, `fraud_accountExplanation=not_asked` | 명의가 서류의 상대와 같다는 점은 일단 일치하는 부분입니다. 그래도 그 계좌가 실제 상대의 것인지 은행 안내나 공식 자료로 한 번 더 확인해 보세요. |
| ② | `fraud_accountMatch=differs_party`, `fraud_accountExplanation=evasive` | 명의가 다른 데다 설명을 피한다면 송금 전에 이유를 꼭 확인해야 할 부분으로 보입니다. 설명을 받은 내용은 글로 남겨 두세요. |
| ③ | `fraud_accountMatch=personal_account`, `fraud_accountExplanation=no_explanation` | 회사나 기관의 거래인데 개인 명의 계좌를 안내받았다면 이유를 따져 볼 필요가 있습니다. 공식 계좌 안내를 별도 경로로 확인해 보세요. |
| ④ | `fraud_accountMatch=account_unknown`, `fraud_accountExplanation=not_asked` | 명의를 모르는 상태에서는 송금 여부를 판단하기 어렵습니다. 보내기 전에 계좌 명의를 먼저 확인해 달라고 요청해 보세요. |
| ⑤ | `fraud_accountMatch=differs_party`, `fraud_accountExplanation=explained_ok` | 설명이 있더라도 그 이유를 뒷받침하는 자료가 있는지 확인이 필요합니다. 명의가 다른 이유를 서류나 공식 안내로 확인해 보세요. |

**송금과 정보 제공** — Q8-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_moneyStatus=not_sent`, `fraud_infoShared=none_shared` | 돈도 정보도 보내지 않은 지금이 가장 확인하기 좋은 시점입니다. 확인이 끝날 때까지 이 상태를 유지하세요. |
| ② | `fraud_moneyStatus=asked_to_send`, `fraud_infoShared=id_shared` | 신분증을 이미 보냈다면 도용 가능성에 대비해 어디에 썼는지 확인해 둘 필요가 있습니다. 같은 서류를 더 보내지 말고 보낸 기록을 남겨 두세요. |
| ③ | `fraud_moneyStatus=partly_sent`, `fraud_infoShared=account_shared` | 일부 송금과 계좌·카드 정보 제공이 겹쳐 있어 추가 피해를 막는 조치를 먼저 살펴볼 필요가 있습니다. 거래 은행이나 카드사에 상황을 문의해 보세요. |
| ④ | `fraud_moneyStatus=sent_all`, `fraud_infoShared=login_shared` | 송금과 인증 정보 제공이 모두 이루어졌다면 지체 없이 은행과 해당 서비스에 알리는 것이 중요할 수 있습니다. 비밀번호 변경과 거래 내역 확인부터 해 보세요. |
| ⑤ | `fraud_moneyStatus=not_sent`, `fraud_infoShared=id_shared` | 송금은 하지 않았으므로 금전 피해는 아직 없는 상태입니다. 보낸 신분증이 어디에 쓰일 수 있는지 확인하고 더 이상 보내지 마세요. |

**자료 보관과 연락 방법** — Q9-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_evidenceState=all_kept`, `fraud_contactMethod=phone_ok` | 자료를 모두 보관하고 있어 확인에 필요한 근거가 갖춰진 상태입니다. 통화가 가능하다면 중요한 내용은 글로 다시 받아 두세요. |
| ② | `fraud_evidenceState=all_kept`, `fraud_contactMethod=only_online` | 자료는 보관되어 있지만 온라인 연락만 가능하다면 상대 신원을 확인하기 어려울 수 있습니다. 대화 화면은 날짜가 보이게 저장해 두세요. |
| ③ | `fraud_evidenceState=partly_kept`, `fraud_contactMethod=visit_ok` | 일부 자료가 없다면 지금 남은 것부터 정리하고 빠진 부분을 표시해 두세요. 직접 만날 때는 혼자 가지 말고 믿을 만한 사람에게 알려 두는 것이 좋습니다. |
| ④ | `fraud_evidenceState=deleted_some`, `fraud_contactMethod=no_direct` | 지운 자료는 앱이나 은행 기록에서 다시 확인할 수 있는 경우가 있으니 복구 가능 여부를 알아보세요. 직접 연락이 어렵다면 남은 기록을 중심으로 정리하는 편이 좋습니다. |
| ⑤ | `fraud_evidenceState=none_kept`, `fraud_contactMethod=only_online` | 남은 자료가 없더라도 은행 거래 내역이나 앱 기록으로 일부를 다시 모을 수 있습니다. 지금부터 오는 연락은 모두 저장해 두세요. |

**추가 요구와 확인 요청에 대한 반응** — Q10-B

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_additionalDemand=more_money`, `fraud_verificationResponse=discourages_check` | 추가 비용을 요구하면서 확인을 막는 조합은 가장 주의가 필요한 신호 중 하나입니다. 더 보내기 전에 지금까지의 요구를 시간 순서로 정리해 보세요. |
| ② | `fraud_additionalDemand=urgent_deadline`, `fraud_verificationResponse=gets_angry` | 기한을 내세워 재촉하고 확인 요청에 화를 낸다면 판단할 시간을 빼앗으려는 방식일 수 있습니다. 기한이 실제로 서류에 적혀 있는지부터 확인해 보세요. |
| ③ | `fraud_additionalDemand=move_platform`, `fraud_verificationResponse=not_tried` | 대화를 다른 앱으로 옮기자는 요구는 기록과 보호 장치에서 멀어질 수 있습니다. 옮기기 전에 지금 대화부터 저장하고, 확인을 요청해 보세요. |
| ④ | `fraud_additionalDemand=keep_secret`, `fraud_verificationResponse=discourages_check` | 주변과 상의하지 못하게 막는 것은 주의해서 볼 신호입니다. 믿을 만한 사람에게 지금 상황을 알리고 함께 살펴보세요. |
| ⑤ | `fraud_additionalDemand=none_demand`, `fraud_verificationResponse=welcomes_check` | 추가 요구가 없고 확인에 열려 있다면 안심할 만한 부분입니다. 그래도 상대가 알려 준 확인 방법이 독립된 공식 자료인지는 따로 살펴보세요. |

### E-2-A. 문제 발생 후 대응 검토

**발신처 확인** — Q5-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_senderIdentity=verified_entity`, `fraud_senderCheckBasis=registry_checked` | 이름이 등록 정보로 확인됐다면 그 정보를 기록해 두면 이후 확인에 도움이 됩니다. 확인된 이름과 실제 연락해 온 사람이 같은지도 맞춰 보세요. |
| ② | `fraud_senderIdentity=name_only_entity`, `fraud_senderCheckBasis=counterparty_said` | 이름이 상대의 말에만 근거했다면 지금이라도 등록 정보와 공식 연락처로 조회해 볼 필요가 있습니다. 조회 결과는 날짜와 함께 저장해 두세요. |
| ③ | `fraud_senderIdentity=impersonation_hint`, `fraud_senderCheckBasis=callback_checked` | 공식 기관이 보낸 적이 없다고 답했다면 이름을 빌려 쓴 연락이었을 가능성을 살펴볼 필요가 있습니다. 그 답변도 글이나 화면으로 남겨 두세요. |
| ④ | `fraud_senderIdentity=unknown_sender`, `fraud_senderCheckBasis=not_checked` | 상대가 누구인지 확인되지 않은 상태에서는 어디에 문의할지 정하기 어렵습니다. 송금 내역에 나온 계좌 정보부터 확인하면 단서를 찾을 수 있습니다. |
| ⑤ | `fraud_senderIdentity=name_only_entity`, `fraud_senderCheckBasis=not_checked` | 이름은 있지만 확인 전이라면 지금 조회해 보는 것이 가장 빠른 방법입니다. 서류에 적힌 번호와 대표자 이름을 공식 조회 결과와 비교해 보세요. |

**수익·조건** — Q6-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_benefitType=high_return`, `fraud_benefitCondition=guaranteed` | 수익과 원금 보장을 약속받았다면 그 약속이 어디에 어떤 문구로 남아 있는지 정리하는 것이 중요합니다. 계약서, 대화, 광고 화면을 따로 모아 두세요. |
| ② | `fraud_benefitType=easy_loan`, `fraud_benefitCondition=fee_first` | 승인 전에 낸 수수료나 보증금은 항목과 금액을 따로 정리해 두면 이후 확인에 도움이 됩니다. 요구받은 시점과 이유도 함께 적어 두세요. |
| ③ | `fraud_benefitType=cheap_goods`, `fraud_benefitCondition=limited_time` | 상품 정보, 판매자 정보, 결제 내역을 한곳에 모아 두면 거래 플랫폼 문의 때 도움이 됩니다. 판매 페이지 화면도 지워지기 전에 저장해 두세요. |
| ④ | `fraud_benefitType=marriage_promise`, `fraud_benefitCondition=secrecy` | 관계를 이유로 보낸 돈은 시기와 금액을 정리해 두는 것이 중요합니다. 혼자 감당하기 어려운 일이므로 믿을 만한 사람에게 상황을 알리는 것도 필요합니다. |
| ⑤ | `fraud_benefitType=profit_share`, `fraud_benefitCondition=no_condition` | 약속이 구두였다면 대화나 메시지에 남은 표현을 찾아 정리해 두세요. 서류가 없더라도 송금 내역과 대화가 함께 있으면 확인에 쓰일 수 있습니다. |

**송금 계좌 명의** — Q7-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_accountMatch=matches_party`, `fraud_accountExplanation=not_asked` | 명의가 서류 속 상대와 같았다면 그 이름이 실제 존재하는 사람이나 회사인지 확인해 볼 수 있습니다. 송금 내역에 나온 은행과 계좌번호를 기록해 두세요. |
| ② | `fraud_accountMatch=differs_party`, `fraud_accountExplanation=evasive` | 명의가 다르고 설명도 없었다면 이후 확인에서 중요하게 볼 부분입니다. 계좌 명의와 설명 요청 내용을 시간 순서로 정리해 두세요. |
| ③ | `fraud_accountMatch=personal_account`, `fraud_accountExplanation=no_explanation` | 개인 명의 계좌로 보낸 내역은 은행 거래 확인서로 정리해 둘 수 있습니다. 같은 계좌로 다른 사람도 보냈는지는 전문가 확인이 필요할 수 있습니다. |
| ④ | `fraud_accountMatch=multiple_accounts`, `fraud_accountExplanation=evasive` | 계좌가 여러 개였다면 계좌별로 보낸 날짜와 금액을 표로 정리하는 것이 중요합니다. 각 계좌의 은행과 명의도 함께 적어 두세요. |
| ⑤ | `fraud_accountMatch=account_unknown`, `fraud_accountExplanation=not_asked` | 명의를 모르는 상태라면 송금 내역에서 은행과 계좌 정보를 먼저 확인하세요. 은행에 거래 확인서를 요청하면 명의 확인에 도움이 될 수 있습니다. |

**송금 상태와 피해 규모** — Q8-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_moneyStatus=not_sent`, `fraud_lossScale=loss_none` | 금전 피해가 없다면 앞으로 같은 연락이 오지 않도록 기록을 정리하는 것이 중요합니다. 개인정보를 준 적이 있는지 한 번 더 점검해 보세요. |
| ② | `fraud_moneyStatus=partly_sent`, `fraud_lossScale=loss_under_1m` | 금액이 크지 않아도 송금 날짜와 계좌를 정리해 두면 은행이나 플랫폼 문의에 도움이 됩니다. 추가 요구에는 응하지 마세요. |
| ③ | `fraud_moneyStatus=sent_all`, `fraud_lossScale=loss_1m_10m` | 송금 시간이 지날수록 확인이 어려워질 수 있어 거래 은행에 빨리 문의해 보는 것이 좋습니다. 은행 안내 내용도 날짜와 함께 기록해 두세요. |
| ④ | `fraud_moneyStatus=repeated_sent`, `fraud_lossScale=loss_10m_100m` | 여러 번에 걸쳐 큰 금액을 보냈다면 송금 내역을 날짜순으로 표로 정리하는 것이 먼저입니다. 금액이 크므로 전문가와 함께 진행하는 방법도 살펴볼 만합니다. |
| ⑤ | `fraud_moneyStatus=sent_all`, `fraud_lossScale=loss_over_100m` | 피해 금액이 매우 크다면 은행과 관련 기관에 가능한 한 빨리 알리고 전문가 상담을 함께 받는 것이 필요할 수 있습니다. 모든 송금 증빙을 원본 그대로 보관하세요. |

**자료 보관과 연락 방법** — Q9-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_evidenceState=all_kept`, `fraud_contactMethod=phone_ok` | 자료가 모두 있다면 날짜순으로 정리해 두는 것이 가장 큰 준비입니다. 통화가 가능하더라도 중요한 약속은 글로 다시 받아 두세요. |
| ② | `fraud_evidenceState=all_kept`, `fraud_contactMethod=only_online` | 자료는 있지만 온라인 연락뿐이라면 상대 계정 정보와 주소를 함께 저장해 두세요. 대화 화면에 날짜가 보이게 저장하는 것이 좋습니다. |
| ③ | `fraud_evidenceState=partly_kept`, `fraud_contactMethod=visit_ok` | 빠진 자료는 은행 기록이나 앱 기록에서 다시 모을 수 있는지 알아보세요. 직접 만날 때는 혼자 가지 말고 믿을 만한 사람에게 알려 두세요. |
| ④ | `fraud_evidenceState=deleted_some`, `fraud_contactMethod=no_direct` | 지운 자료는 복구 가능 여부를 먼저 알아보세요. 남은 기록과 은행 거래 내역을 중심으로 정리하는 편이 좋습니다. |
| ⑤ | `fraud_evidenceState=none_kept`, `fraud_contactMethod=only_online` | 남은 자료가 없더라도 은행 거래 내역은 금융기관에 요청해 받을 수 있습니다. 지금부터 오는 연락은 모두 저장해 두세요. |

**이미 취한 조치** — Q10-A

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `fraud_actionTaken=bank_recall`, `fraud_actionResult=accepted` | 은행에 요청이 접수된 상태라면 접수 번호와 담당 부서, 안내받은 내용을 기록해 두세요. 이후 진행 상황은 날짜와 함께 계속 남겨 두는 것이 좋습니다. |
| ② | `fraud_actionTaken=platform_report`, `fraud_actionResult=no_reply` | 답변이 없다면 신고 날짜와 화면을 저장하고 다시 문의해 보세요. 플랫폼 밖의 다른 확인 경로도 함께 살펴볼 필요가 있습니다. |
| ③ | `fraud_actionTaken=direct_refund`, `fraud_actionResult=rejected` | 거절 내용을 글로 남겨 두면 이후 확인에 도움이 됩니다. 상대와의 직접 협상은 추가 요구로 이어질 수 있어 주의가 필요합니다. |
| ④ | `fraud_actionTaken=consulted_others`, `fraud_actionResult=too_early` | 주변의 조언도 도움이 되지만 어느 기관에 어떤 자료를 낼지는 별도로 확인이 필요합니다. 상담 내용과 조언받은 날짜를 적어 두세요. |
| ⑤ | `fraud_actionTaken=nothing_yet`, `fraud_actionResult=not_applicable` | 아직 조치 전이라면 자료 정리와 은행 문의부터 시작할 수 있습니다. 시간이 지날수록 확인이 어려워질 수 있어 가능한 한 빨리 움직이는 것이 좋습니다. |

## E-3. 결과에서의 연결 안내 (권유 문구, 강제 아님)

| 연결 | 표시 조건 | 고객 화면 문구 |
|---|---|---|
| 행정문서 검토 | `fraud_senderIdentity` ∈ {impersonation_hint} 또는 `fraud_trustBasis` ∈ {official_look} 또는 `fraud_scheme` ∈ {impersonation} | 공공기관 이름으로 받은 문서라면 행정문서 검토에서 함께 확인해 보실 수 있습니다. |
| 불확실한 문서 검토 | `fraud_recordKind` ∈ {proposal, chat_log} 이면서 `fraud_partyInfoInRecord` ∈ {no_info, name_only} | 어떤 문서인지 분명하지 않다면 불확실한 문서 검토에서 먼저 분류해 보실 수 있습니다. |
| 전문가 진행 | `fraud_lossScale` ∈ {loss_10m_100m, loss_over_100m} 또는 `fraud_counterpartyStance` ∈ {threatens} 또는 `fraud_moneyStatus` ∈ {sent_all, repeated_sent} | 금액이 크거나 위협이 있는 상황이라면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |
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
| 2차 질문 수 | 6 | 6 |
| 2차 비율 | 60.0% | 60.0% |
| 2차 ÷ 1차 | 1.50배 | 1.50배 |
| 질문 수(전체) | 10 | 10 |
| 선택지 총수(직접 입력 포함) | 60 | 60 |
| 선택지별 저장 필드 수(최소) | 2 | 2 |

| 자동 점검 | 결과 |
|---|---|
| 선택지마다 결과 문장 존재 | 통과(결과 문장 수 = 선택지 수, 전 질문) |
| 모든 선택지가 서로 다른 필드 쌍 | 통과 |
| 선택지 수 4~5개 + 직접 입력 | 통과 |
| 고객 화면 문장에 영문·코드 노출 | 0건 |
| 단정 표현(사기입니다, 사기로 확정, 불법입니다, 범죄입니다, 처벌됩니다 등) | 0건 |
| 괄호 짝·이중 공백 | 0건 |
| 카드 문장 50자 초과 | 0건(최대 33자) |
| 위험 규칙의 필드·값이 실제 저장 값과 일치 | 통과 |
| 1차 결과 문장 중복(01/02/03) | 0건 |
| 값→고객 라벨 누락 | 0건(사용 값 133개) |
| 같은 값 다른 라벨 / 같은 필드 안 라벨 중복 | 0건 |
| 총 오류 / 경고 | 0 / 0 |

---

# G. 값 → 고객 표시 문구

내부 값은 화면·마이페이지·알림 어디에도 그대로 노출하지 않고 아래 문구로만 표시한다.

| 내부 값 | 고객 화면 표시 |
|---|---|
| `accepted` | 접수되어 진행 중 |
| `account_shared` | 계좌·카드 정보를 알려 줌 |
| `account_unknown` | 명의를 아직 모름 |
| `agreed_unsigned` | 구두로 동의함 |
| `all_kept` | 대화·서류·입금 내역을 모두 보관 |
| `asked_to_send` | 보내 달라는 요청만 받음 |
| `bank_alert` | 은행·기관의 안내로 |
| `bank_recall` | 은행에 거래 중단·환수 요청 |
| `blocked` | 상대가 차단함 |
| `callback_checked` | 공식 연락처로 직접 확인함 |
| `changed_number` | 번호·계정이 바뀜 |
| `chat_log` | 대화 내용 |
| `cheap_goods` | 시세보다 싼 상품 |
| `consulted_others` | 주변에 상담함 |
| `contact_cut` | 연락이 끊김 |
| `contact_lost` | 연락이 끊김 |
| `contact_stopped` | 연락이 끊겨서 |
| `contract_draft` | 계약서·약정서 |
| `contract_unfulfilled` | 약속한 계약이 이행되지 않음 |
| `counterparty_said` | 상대가 말한 내용뿐임 |
| `deleted_some` | 일부를 지웠거나 사라짐 |
| `demands_more` | 더 보내라고 요구함 |
| `denies_all` | 책임을 부인함 |
| `differs_party` | 상대 이름과 다름 |
| `direct_input` | 직접 입력 |
| `direct_input_detail` | 직접 입력(상세) |
| `direct_refund` | 상대에게 직접 환불 요청 |
| `discourages_check` | 확인하지 말라고 함 |
| `easy_loan` | 낮은 금리·쉬운 승인 |
| `evasive` | 설명을 피하거나 말이 바뀜 |
| `explained_ok` | 다른 명의의 이유를 설명함 |
| `extra_fees_charged` | 추가 비용만 계속 요구받음 |
| `family_advice` | 가족·지인의 조언으로 |
| `fee_first` | 수수료·보증금을 먼저 내라고 함 |
| `full_info` | 상대 정보가 모두 적혀 있음 |
| `gets_angry` | 확인 얘기에 화를 냄 |
| `give_info` | 신분증·계좌 정보를 달라는 요구 |
| `goods_not_received` | 물건·서비스를 받지 못함 |
| `guaranteed` | 원금·수익을 보장한다고 함 |
| `high_return` | 높은 수익·이자 |
| `id_shared` | 신분증을 보냄 |
| `impersonation` | 기관·지인 사칭, 취업·연애 관련 |
| `impersonation_hint` | 기관·회사를 사칭하는 듯함 |
| `in_contact` | 연락이 되는 중 |
| `in_person` | 직접 만남 |
| `install_login` | 앱 설치·로그인을 하라는 요구 |
| `investment` | 투자·수익·사업 제휴 관련 |
| `just_asked` | 제안만 받음 |
| `keep_secret` | 다른 사람에게 말하지 말라고 함 |
| `limited_time` | 기간·인원이 한정이라고 함 |
| `loan` | 대출 관련 |
| `login_shared` | 인증번호·비밀번호를 알려 줌 |
| `loss_10m_100m` | 1천만 동 이상 1억 동 미만 |
| `loss_1m_10m` | 100만 동 이상 1천만 동 미만 |
| `loss_none` | 금전 피해 없음 |
| `loss_over_100m` | 1억 동 이상 |
| `loss_under_1m` | 100만 동 미만 |
| `marriage_promise` | 결혼·동거 약속 |
| `matches_party` | 서류의 상대 이름과 일치 |
| `meet_move` | 만나자거나 다른 곳으로 옮기자는 요구 |
| `messenger` | 메신저 앱 |
| `mild_pressure` | 다소 서두름 |
| `money_not_returned` | 보낸 돈이 돌아오지 않음 |
| `more_money` | 추가 비용을 더 요구함 |
| `move_platform` | 다른 앱·사이트로 이동을 요구함 |
| `multiple_accounts` | 계좌가 여러 개였음 |
| `name_only` | 이름이나 별칭만 있음 |
| `name_only_entity` | 이름만 있고 확인되지 않음 |
| `negotiating` | 조건을 협의 중 |
| `news_or_warning` | 비슷한 사례를 보고 |
| `no_basis` | 특별한 근거 없음 |
| `no_condition` | 별다른 조건 없음 |
| `no_direct` | 직접 연락하기 어려움 |
| `no_explanation` | 설명이 없음 |
| `no_info` | 상대 정보가 없음 |
| `no_pressure` | 재촉 없음 |
| `no_record` | 받은 서류 없음 |
| `no_reply` | 답변이 없음 |
| `none_demand` | 추가 요구 없음 |
| `none_kept` | 남은 자료 없음 |
| `none_shared` | 정보를 알려 주지 않음 |
| `not_applicable` | 해당 없음 |
| `not_asked` | 아직 물어보지 않음 |
| `not_checked` | 아직 확인하지 않음 |
| `not_sent` | 아직 보내지 않음 |
| `not_tried` | 확인을 요청해 보지 않음 |
| `nothing_yet` | 아직 아무것도 하지 않음 |
| `official_look` | 공식 기관처럼 보이는 문서 |
| `online_post` | 온라인 광고·게시글 |
| `online_trade` | 온라인 거래·임대 관련 |
| `only_online` | 온라인으로만 연락함 |
| `over_half_year` | 6개월 초과 |
| `partial_info` | 상대 정보가 일부만 적혀 있음 |
| `partly_kept` | 일부만 보관 |
| `partly_sent` | 일부를 이미 보냄 |
| `pay_request` | 입금 안내·청구서 |
| `personal_account` | 개인 명의 계좌 |
| `phone_call` | 전화 |
| `phone_ok` | 전화 통화가 가능함 |
| `platform_report` | 거래 플랫폼에 신고 |
| `platform_trust` | 유명 사이트·플랫폼 이용 |
| `post` | 문제 발생 후 대응 검토 |
| `pre` | 제출·계약 전 서류 검토 |
| `profit_share` | 수익 분배·지분 약속 |
| `promises_return` | 돌려주겠다고 약속함 |
| `proposal` | 제안서·안내문 |
| `ready_to_pay` | 서명·입금 직전 |
| `referral` | 지인·소개 |
| `registry_checked` | 등록 정보를 직접 조회함 |
| `rejected` | 거절·보류됨 |
| `repeated_sent` | 여러 번 나누어 보냄 |
| `returns_proof` | 수익 인증 자료 |
| `secrecy` | 비밀 유지를 요구함 |
| `selected` | 직접 선택함 |
| `send_first` | 먼저 돈을 보내라는 요구 |
| `sent_all` | 전부 보냄 |
| `sign_now` | 서명·계약을 서두르라는 요구 |
| `silent` | 아무 말 없음 |
| `strong_pressure` | 빠른 결정을 강하게 재촉함 |
| `text_message` | 문자메시지 |
| `threat_loss` | 거절하면 손해라고 위협함 |
| `threatens` | 오히려 협박함 |
| `too_early` | 아직 결과를 모름 |
| `unchecked_info` | 아직 확인하지 않음 |
| `unknown_sender` | 누구인지 알 수 없음 |
| `unsure` | 잘 모르겠음 |
| `unsure_scheme` | 어떤 유형인지 모름 |
| `urgent_deadline` | 기한 안에 하라고 재촉함 |
| `verified_entity` | 회사·기관 이름이 확인됨 |
| `visit_ok` | 직접 만날 수 있음 |
| `welcomes_check` | 확인을 해 보라고 함 |
| `withdrawal_failed` | 출금·환급이 안 돼서 |
| `within_half_year` | 6개월 이내 |
| `within_month` | 한 달 이내 |
| `within_week` | 일주일 이내 |

---

# H. 작성 기록과 확정 기준 대비 달라진 점

- **승인 문서(1차 2개 + 2차 4개)에서 달라진 점**: 10-09 확정 기준(2차 질문 비중 최소 60%)을 충족하도록 경로당 질문을 10개(1차 4 : 2차 6)로 확장했다. 개수는 고정값이 아니며 필요하면 늘릴 수 있다. 승인된 2차 사실 4개(발신처, 수익·조건, 계좌 명의, 송금 여부)는 Q5~Q8에 그대로 넣고, Q9(자료 보관·연락 방법)와 Q10(사전: 추가 요구·확인 반응 / 사후: 이미 취한 조치)을 추가했다. 1차는 승인된 2개(수법, 사전·사후 구분)에 더해 Q2·Q3·Q4를 새로 구성했고, 사전/사후 구분은 진입 화면(A-0)으로 옮겼다.
- **기존 문장 재사용 범위**: 서비스 범위 발췌의 문장은 범위와 slug(`pre`/`post`)에만 쓰고 옛 질문 문구는 쓰지 않았다. 결과 이후 안내 블록 두 목록만 기존 문장 그대로 두었다(E-3-1).
- **필드명**: 모두 `fraud_` 접두어를 쓰고, 승인 문서에 있던 `fraud_reviewStage`, `fraud_scheme`만 이름을 유지했다. 승인 문서에 있던 `fraud_returns`는 `fraud_benefitType`·`fraud_benefitCondition` 두 필드로 나누어 선택지마다 2개 이상 저장되도록 했다.
- **수법 구성 변경(Ace 승인 2026.10.10)**: 승인 설계의 수법 5종(투자, 대출, 온라인 거래, 결혼·연애, 사업 제휴)에는 기관·지인 사칭, 취업·임대 사기와 '유형을 모름'이 빠져 있어 `fraud_scheme`을 투자·수익·사업 제휴(`investment`), 대출(`loan`), 온라인 거래·임대(`online_trade`), 기관·지인 사칭·취업·연애(`impersonation`), 어떤 유형인지 모름(`unsure_scheme`)으로 바꿨다. `romance`와 `partnership` 값은 쓰지 않는다.
- **금액 구간**: 사후 Q8의 피해 규모는 베트남 동 기준 구간이다. 형법상 사기죄 기준 금액(200만 동 이상)과 신뢰 남용(400만 동 이상)은 고객 문장에 쓰지 않고 참고 사항 출처에만 둔다.
- **직접 입력 처리**: 직접 입력을 고른 고객에게도 기본 경로 B를 제공하고 입력 원문은 상세 필드에 저장한다. 경로 기본값(B)은 Ace 확인 대상이다.
- **법령 근거 상태**: 형법 제174·175조, 민법 제127·131·132·468조, 형법 제201조, 형법 제217a조, 전자상거래법 제122/2025/QH15호, 형사소송법 제144조는 이차 자료로 확인했다. 원문 대조가 필요하다. 형사소송법 제145조, 행정처리법 제74조, 행정소송법 제116조는 확인하지 못해 사용하지 않았다.

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
| 3 | 민법 제468조(이자 상한 연 20%) 및 형법 제201조(고리대금) | 베트남 국회 | 법령(이차 자료로 확인) | URL 미확보 | 상한 초과분은 무효. 형법 제201조는 상한의 5배 이상 등 요건. 원문 대조 필요 |
| 4 | 형법 제217a조(다단계 판매) 및 정부령 제40/2018/ND-CP호 | 베트남 국회·정부 | 법령(이차 자료로 확인) | URL 미확보 | 원문 대조 필요 |
| 5 | 전자상거래법 제122/2025/QH15호(2025.12.10 통과, 2026.7.1 시행) 및 소비자권익보호법 제19/2023/QH15호 | 베트남 국회 | 법령(이차 자료로 확인) | https://kpmg.com/us/en/taxnewsflash/news/2026/06/tnf-vietnam-law-on-e-commerce-2025-effective-july-1-2026.html , https://blogs.duanemorris.com/vietnam/2026/01/16/vietnam-new-law-on-e-commerce-what-you-must-know/ | 소비자권익보호법 시행일은 이번에 확인하지 못함. 확인 필요 |
| 6 | 형사소송법 제101/2015/QH13호 제144조(신고는 구두 또는 서면) | 베트남 국회 | 법령(이차 자료로 확인) | URL 미확보 | 제145조 등 후속 조항은 확인하지 못해 사용하지 않음. 확인 필요 |
| 7 | 공안부 사이버범죄 대응 부서(A05) 사기 수법 안내 (2020.10.13 기사) | 베트남 공안부 | 공식 기관 안내(기사 인용) | URL 미확보 | 수법과 인증번호 요구 주의 안내. 기사 URL은 Cursor가 재확인 |
| 8 | 외국인 관련 결혼 중개·상담 규정 (정부령 제126/2014/ND-CP호 제51~52조, 정부령 제82/2020/ND-CP호 제39조) | 베트남 정부 | 법령(이차 자료로 확인) | URL 미확보 | 원문 대조 필요 |
| 9 | 기업법 제59/2020/QH14호 (제28조 기업등록증의 내용) | 베트남 국회 | 법령 | https://english.luatvietnam.vn/law-on-enterprises-no-59-2020-qh14-dated-june-17-2020-of-the-national-assembly-186272-doc1.html | 세금 확정본 출처 6과 같은 자료 |
