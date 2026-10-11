# 불확실한 문서 검토(verify_unclear) 콘텐츠 최종본 (Claude 작성·검수본)

> 받은 서류가 무엇인지 모를 때 분류와 진입을 돕는 서비스이며, 행정문서 안의 사건 유형(CASE_06)과는 별개다. 전문 검토로 이어지는 연결은 안내 문구와 링크만 제공한다. 구조 기준: **2차 질문 비중은 전체의 최소 60% 이상(1차 40% 이하)이며, 이보다 2차가 더 많아도 된다(예: 30:70).** 질문 수와 선택지 수는 고정값이 아니며 필요하면 늘릴 수 있고, 질문 생략은 없다. 이 문서의 작성 결과는 경로당 1차 4개 : 2차 9개(31% : 69%)이다. 고객 화면에는 한국어 생활 문장만 표시하고, 영문 코드는 내부 저장에만 사용한다. 서류의 진위나 법적 효력은 판단하지 않고, 확인할 사항과 이어서 볼 검토를 안내하는 데 그친다.

---

# A. 진입 화면과 1차 질문

## A-0. 진입 화면 (질문 수에 포함하지 않음)

**고객 화면**

**받은 서류나 안내가 무엇을 하라는 내용 같으신가요?**

가장 가까운 것을 골라 주세요. 잘 모르겠다면 내용을 알아보는 경로로 시작합니다.

① 돈을 내라는 내용 같습니다  
입금, 납부, 수수료, 벌금 같은 표현이 있습니다.  
② 서류를 내거나 출석하라는 내용 같습니다  
제출, 보완, 방문, 출석 같은 표현이 있습니다.  
③ 알리는 내용 같습니다  
무엇을 하라는 말은 없고 알려 주는 내용처럼 보입니다.  
④ 잘 모르겠습니다  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 | 이동 |
|---|---|---|
| ① | `unclear_actionHint=pay`, `unclear_routeSelectionMode=selected` | 경로 M (Q1-M ~ Q13-M) |
| ② | `unclear_actionHint=submit_or_appear`, `unclear_routeSelectionMode=selected` | 경로 D (Q1-D ~ Q13-D) |
| ③ | `unclear_actionHint=notice_only`, `unclear_routeSelectionMode=selected` | 경로 N (Q1-N ~ Q13-N) |
| ④ | `unclear_actionHint=unsure`, `unclear_routeSelectionMode=unsure` | 경로 N (기본 경로) |
| ⑤ 직접 입력 | `unclear_actionHint=direct_input`, `unclear_routeSelectionMode=direct_input` | 경로 N (기본 경로). 입력 원문은 `unclear_actionHint` 상세로 저장 |

## A-1. 돈을 내라는 서류 — 1차

### Q1-M

**고객 화면**

**받은 서류나 안내는 어떤 형태이고, 거기에 요구하는 내용이 얼마나 구체적으로 적혀 있나요?**

① **종이 서류**로 받았습니다. 해야 할 일이나 낼 돈이 항목별로 구체적으로 적혀 있습니다.  
② **이메일**로 받았습니다. 내용이 한두 줄로 짧거나 모호해서 무엇을 요구하는지 알기 어렵습니다.  
③ **문자나 메신저**로 받았습니다. 해야 할 일이나 낼 돈이 글로 구체적으로 적혀 있습니다.  
④ **링크나 큐알 코드**로 안내받았습니다. 내용은 연결된 화면에서만 볼 수 있어 아직 확인하지 못했습니다.  
⑤ **전화나 방문으로 말로만** 들었습니다. 받은 서류가 없어 확인할 글이 따로 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_documentForm=paper_doc`, `unclear_contentDetail=detail_full` |
| ② | `unclear_documentForm=email_body`, `unclear_contentDetail=detail_brief` |
| ③ | `unclear_documentForm=chat_message`, `unclear_contentDetail=detail_full` |
| ④ | `unclear_documentForm=link_code`, `unclear_contentDetail=detail_linked` |
| ⑤ | `unclear_documentForm=verbal_only`, `unclear_contentDetail=detail_none` |
| ⑥ 직접 입력 | `unclear_documentForm=direct_input`, `unclear_contentDetail=direct_input_detail` |

---

### Q2-M

**고객 화면**

**서류에 보낸 곳으로 적힌 곳은 어디이고, 그 곳과 제가 이전에 한 일이 있나요?**

① **세무서·구청·출입국사무소 같은 공공기관**이 보낸 것으로 적혀 있습니다. 최근 그 기관에 제가 신청하거나 신고한 일이 있습니다.  
② **공안(경찰)·검찰·법원**이 보낸 것으로 적혀 있습니다. 그 곳과 관련될 만한 일이 제게는 전혀 없습니다.  
③ **은행이나 금융회사**가 보낸 것으로 적혀 있습니다. 평소 제가 거래하던 은행과 이름이 같습니다.  
④ **회사·통신사·택배사·쇼핑 플랫폼**이 보낸 것으로 적혀 있습니다. 제가 거래하거나 이용한 적이 없는 곳입니다.  
⑤ **보낸 곳이 적혀 있지 않거나 개인**입니다. 처음 보는 이름이라 제가 한 일과 관계가 있는지 알 수 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_senderClaim=public_agency`, `unclear_senderRelation=rel_recent` |
| ② | `unclear_senderClaim=police_court`, `unclear_senderRelation=rel_none` |
| ③ | `unclear_senderClaim=bank_claim`, `unclear_senderRelation=rel_customer` |
| ④ | `unclear_senderClaim=company_claim`, `unclear_senderRelation=rel_none` |
| ⑤ | `unclear_senderClaim=unnamed_claim`, `unclear_senderRelation=rel_unknown` |
| ⑥ 직접 입력 | `unclear_senderClaim=direct_input`, `unclear_senderRelation=direct_input_detail` |

---

### Q3-M

**고객 화면**

**이 연락은 몇 번, 어떤 식으로 받았고, 제가 먼저 신청하거나 문의한 일과 이어져 있나요?**

① **오늘이나 어제 처음 한 번** 받았습니다. 제가 먼저 신청하거나 문의한 일은 없어서 갑작스럽게 받았습니다.  
② **며칠 전에 한 번** 받았고 그 뒤 연락은 없습니다. 제가 최근에 신청하거나 문의한 일을 한 직후에 온 연락입니다.  
③ **같은 내용을 여러 번 반복**해서 받았습니다. 제가 신청하거나 문의한 일과 이어진 연락으로 보입니다.  
④ **여러 번 받으면서 표현이 점점 강해졌습니다.** 제가 신청하거나 문의한 적 없는 일인데 계속 옵니다.  
⑤ **전화나 방문을 받은 뒤** 이어서 받았습니다. 그 전화나 방문은 제가 요청한 것이 아닙니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_contactPattern=first_contact`, `unclear_requestLink=req_none` |
| ② | `unclear_contactPattern=once_earlier`, `unclear_requestLink=req_related` |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_requestLink=req_related` |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_requestLink=req_none` |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_requestLink=req_none` |
| ⑥ 직접 입력 | `unclear_contactPattern=direct_input`, `unclear_requestLink=direct_input_detail` |

---

### Q4-M

**고객 화면**

**지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?**

① **진짜 서류인지** 모르겠습니다. 제가 직접 확인할 수 있도록 방법을 알려 주면 좋겠습니다.  
② **정말 내야 하는 돈인지, 금액이 맞는지** 모르겠습니다. 근거를 같이 따져 줄 전문가가 필요합니다.  
③ **기한을 놓칠까** 걱정됩니다. 지금 무엇부터 해야 하는지 순서를 하나씩 알려 주면 좋겠습니다.  
④ **이미 응했거나 돈을 보내** 불안합니다. 지금까지의 상황을 전문가가 함께 봐 주면 좋겠습니다.  
⑤ **크게 걱정되지는 않습니다.** 서둘러 움직이기보다 확인하는 방법을 알아 두고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_mainConcern=doubt_genuine`, `unclear_helpWanted=help_guide` |
| ② | `unclear_mainConcern=doubt_owed`, `unclear_helpWanted=help_expert` |
| ③ | `unclear_mainConcern=doubt_deadline`, `unclear_helpWanted=help_guide` |
| ④ | `unclear_mainConcern=doubt_done`, `unclear_helpWanted=help_expert` |
| ⑤ | `unclear_mainConcern=doubt_none`, `unclear_helpWanted=help_guide` |
| ⑥ 직접 입력 | `unclear_mainConcern=direct_input`, `unclear_helpWanted=direct_input_detail` |

---

## A-2. 서류 제출·출석 서류 — 1차

### Q1-D

**고객 화면**

**받은 서류나 안내는 어떤 형태이고, 거기에 요구하는 내용이 얼마나 구체적으로 적혀 있나요?**

① **종이 서류**로 받았습니다. 해야 할 일이나 낼 돈이 항목별로 구체적으로 적혀 있습니다.  
② **이메일**로 받았습니다. 내용이 한두 줄로 짧거나 모호해서 무엇을 요구하는지 알기 어렵습니다.  
③ **문자나 메신저**로 받았습니다. 해야 할 일이나 낼 돈이 글로 구체적으로 적혀 있습니다.  
④ **링크나 큐알 코드**로 안내받았습니다. 내용은 연결된 화면에서만 볼 수 있어 아직 확인하지 못했습니다.  
⑤ **전화나 방문으로 말로만** 들었습니다. 받은 서류가 없어 확인할 글이 따로 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_documentForm=paper_doc`, `unclear_contentDetail=detail_full` |
| ② | `unclear_documentForm=email_body`, `unclear_contentDetail=detail_brief` |
| ③ | `unclear_documentForm=chat_message`, `unclear_contentDetail=detail_full` |
| ④ | `unclear_documentForm=link_code`, `unclear_contentDetail=detail_linked` |
| ⑤ | `unclear_documentForm=verbal_only`, `unclear_contentDetail=detail_none` |
| ⑥ 직접 입력 | `unclear_documentForm=direct_input`, `unclear_contentDetail=direct_input_detail` |

---

### Q2-D

**고객 화면**

**서류에 보낸 곳으로 적힌 곳은 어디이고, 그 곳과 제가 이전에 한 일이 있나요?**

① **세무서·구청·출입국사무소 같은 공공기관**이 보낸 것으로 적혀 있습니다. 최근 그 기관에 제가 신청하거나 신고한 일이 있습니다.  
② **공안(경찰)·검찰·법원**이 보낸 것으로 적혀 있습니다. 그 곳과 관련될 만한 일이 제게는 전혀 없습니다.  
③ **은행이나 금융회사**가 보낸 것으로 적혀 있습니다. 평소 제가 거래하던 은행과 이름이 같습니다.  
④ **회사·통신사·택배사·쇼핑 플랫폼**이 보낸 것으로 적혀 있습니다. 제가 거래하거나 이용한 적이 없는 곳입니다.  
⑤ **보낸 곳이 적혀 있지 않거나 개인**입니다. 처음 보는 이름이라 제가 한 일과 관계가 있는지 알 수 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_senderClaim=public_agency`, `unclear_senderRelation=rel_recent` |
| ② | `unclear_senderClaim=police_court`, `unclear_senderRelation=rel_none` |
| ③ | `unclear_senderClaim=bank_claim`, `unclear_senderRelation=rel_customer` |
| ④ | `unclear_senderClaim=company_claim`, `unclear_senderRelation=rel_none` |
| ⑤ | `unclear_senderClaim=unnamed_claim`, `unclear_senderRelation=rel_unknown` |
| ⑥ 직접 입력 | `unclear_senderClaim=direct_input`, `unclear_senderRelation=direct_input_detail` |

---

### Q3-D

**고객 화면**

**이 연락은 몇 번, 어떤 식으로 받았고, 제가 먼저 신청하거나 문의한 일과 이어져 있나요?**

① **오늘이나 어제 처음 한 번** 받았습니다. 제가 먼저 신청하거나 문의한 일은 없어서 갑작스럽게 받았습니다.  
② **며칠 전에 한 번** 받았고 그 뒤 연락은 없습니다. 제가 최근에 신청하거나 문의한 일을 한 직후에 온 연락입니다.  
③ **같은 내용을 여러 번 반복**해서 받았습니다. 제가 신청하거나 문의한 일과 이어진 연락으로 보입니다.  
④ **여러 번 받으면서 표현이 점점 강해졌습니다.** 제가 신청하거나 문의한 적 없는 일인데 계속 옵니다.  
⑤ **전화나 방문을 받은 뒤** 이어서 받았습니다. 그 전화나 방문은 제가 요청한 것이 아닙니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_contactPattern=first_contact`, `unclear_requestLink=req_none` |
| ② | `unclear_contactPattern=once_earlier`, `unclear_requestLink=req_related` |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_requestLink=req_related` |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_requestLink=req_none` |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_requestLink=req_none` |
| ⑥ 직접 입력 | `unclear_contactPattern=direct_input`, `unclear_requestLink=direct_input_detail` |

---

### Q4-D

**고객 화면**

**지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?**

① **진짜 서류인지, 개인정보를 내도 되는지** 모르겠습니다. 제가 직접 확인할 수 있도록 방법을 알려 주면 좋겠습니다.  
② **무엇을, 언제까지 내야 하는지** 모르겠습니다. 요구하는 서류와 그 근거를 전문가와 함께 정리하고 싶습니다.  
③ **직접 가야 하는지, 안 가면 어떻게 되는지** 걱정됩니다. 방문할 때 통역이나 동행이 필요할 수 있습니다.  
④ **이미 일부를 냈거나 답했습니다.** 지금까지의 응답이 괜찮은지 전문가가 함께 봐 주면 좋겠습니다.  
⑤ **크게 걱정되지는 않습니다.** 서둘러 움직이기보다 확인하는 방법을 알아 두고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_mainConcern=doubt_genuine_privacy`, `unclear_helpWanted=help_guide` |
| ② | `unclear_mainConcern=doubt_what`, `unclear_helpWanted=help_expert` |
| ③ | `unclear_mainConcern=doubt_appear`, `unclear_helpWanted=help_expert` |
| ④ | `unclear_mainConcern=doubt_done`, `unclear_helpWanted=help_expert` |
| ⑤ | `unclear_mainConcern=doubt_none`, `unclear_helpWanted=help_guide` |
| ⑥ 직접 입력 | `unclear_mainConcern=direct_input`, `unclear_helpWanted=direct_input_detail` |

---

## A-3. 내용을 모르는 서류 — 1차

### Q1-N

**고객 화면**

**받은 서류나 안내는 어떤 형태이고, 거기에 요구하는 내용이 얼마나 구체적으로 적혀 있나요?**

① **종이 서류**로 받았습니다. 해야 할 일이나 낼 돈이 항목별로 구체적으로 적혀 있습니다.  
② **이메일**로 받았습니다. 내용이 한두 줄로 짧거나 모호해서 무엇을 요구하는지 알기 어렵습니다.  
③ **문자나 메신저**로 받았습니다. 해야 할 일이나 낼 돈이 글로 구체적으로 적혀 있습니다.  
④ **링크나 큐알 코드**로 안내받았습니다. 내용은 연결된 화면에서만 볼 수 있어 아직 확인하지 못했습니다.  
⑤ **전화나 방문으로 말로만** 들었습니다. 받은 서류가 없어 확인할 글이 따로 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_documentForm=paper_doc`, `unclear_contentDetail=detail_full` |
| ② | `unclear_documentForm=email_body`, `unclear_contentDetail=detail_brief` |
| ③ | `unclear_documentForm=chat_message`, `unclear_contentDetail=detail_full` |
| ④ | `unclear_documentForm=link_code`, `unclear_contentDetail=detail_linked` |
| ⑤ | `unclear_documentForm=verbal_only`, `unclear_contentDetail=detail_none` |
| ⑥ 직접 입력 | `unclear_documentForm=direct_input`, `unclear_contentDetail=direct_input_detail` |

---

### Q2-N

**고객 화면**

**서류에 보낸 곳으로 적힌 곳은 어디이고, 그 곳과 제가 이전에 한 일이 있나요?**

① **세무서·구청·출입국사무소 같은 공공기관**이 보낸 것으로 적혀 있습니다. 최근 그 기관에 제가 신청하거나 신고한 일이 있습니다.  
② **공안(경찰)·검찰·법원**이 보낸 것으로 적혀 있습니다. 그 곳과 관련될 만한 일이 제게는 전혀 없습니다.  
③ **은행이나 금융회사**가 보낸 것으로 적혀 있습니다. 평소 제가 거래하던 은행과 이름이 같습니다.  
④ **회사·통신사·택배사·쇼핑 플랫폼**이 보낸 것으로 적혀 있습니다. 제가 거래하거나 이용한 적이 없는 곳입니다.  
⑤ **보낸 곳이 적혀 있지 않거나 개인**입니다. 처음 보는 이름이라 제가 한 일과 관계가 있는지 알 수 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_senderClaim=public_agency`, `unclear_senderRelation=rel_recent` |
| ② | `unclear_senderClaim=police_court`, `unclear_senderRelation=rel_none` |
| ③ | `unclear_senderClaim=bank_claim`, `unclear_senderRelation=rel_customer` |
| ④ | `unclear_senderClaim=company_claim`, `unclear_senderRelation=rel_none` |
| ⑤ | `unclear_senderClaim=unnamed_claim`, `unclear_senderRelation=rel_unknown` |
| ⑥ 직접 입력 | `unclear_senderClaim=direct_input`, `unclear_senderRelation=direct_input_detail` |

---

### Q3-N

**고객 화면**

**이 연락은 몇 번, 어떤 식으로 받았고, 제가 먼저 신청하거나 문의한 일과 이어져 있나요?**

① **오늘이나 어제 처음 한 번** 받았습니다. 제가 먼저 신청하거나 문의한 일은 없어서 갑작스럽게 받았습니다.  
② **며칠 전에 한 번** 받았고 그 뒤 연락은 없습니다. 제가 최근에 신청하거나 문의한 일을 한 직후에 온 연락입니다.  
③ **같은 내용을 여러 번 반복**해서 받았습니다. 제가 신청하거나 문의한 일과 이어진 연락으로 보입니다.  
④ **여러 번 받으면서 표현이 점점 강해졌습니다.** 제가 신청하거나 문의한 적 없는 일인데 계속 옵니다.  
⑤ **전화나 방문을 받은 뒤** 이어서 받았습니다. 그 전화나 방문은 제가 요청한 것이 아닙니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_contactPattern=first_contact`, `unclear_requestLink=req_none` |
| ② | `unclear_contactPattern=once_earlier`, `unclear_requestLink=req_related` |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_requestLink=req_related` |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_requestLink=req_none` |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_requestLink=req_none` |
| ⑥ 직접 입력 | `unclear_contactPattern=direct_input`, `unclear_requestLink=direct_input_detail` |

---

### Q4-N

**고객 화면**

**지금 가장 크게 걱정되는 점은 무엇이고, 어떤 방식의 도움을 원하시나요?**

① **무슨 뜻인지, 응해야 하는지** 모르겠습니다. 내용을 쉬운 말로 번역하고 설명해 주면 좋겠습니다.  
② **진짜 서류인지** 모르겠습니다. 제가 직접 확인할 수 있도록 방법을 알려 주면 좋겠습니다.  
③ **놓친 내용이 있을까** 걱정됩니다. 이전 절차나 문의 기록과 함께 살펴보고 싶습니다.  
④ **이미 답장했거나 응했습니다.** 지금까지의 응답이 괜찮은지 전문가가 함께 봐 주면 좋겠습니다.  
⑤ **크게 걱정되지는 않습니다.** 급하지 않으니 어떤 서류인지 차근차근 분류해 보고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_mainConcern=doubt_meaning`, `unclear_helpWanted=help_translate` |
| ② | `unclear_mainConcern=doubt_genuine`, `unclear_helpWanted=help_guide` |
| ③ | `unclear_mainConcern=doubt_missing`, `unclear_helpWanted=help_guide` |
| ④ | `unclear_mainConcern=doubt_done`, `unclear_helpWanted=help_expert` |
| ⑤ | `unclear_mainConcern=doubt_none`, `unclear_helpWanted=help_guide` |
| ⑥ 직접 입력 | `unclear_mainConcern=direct_input`, `unclear_helpWanted=direct_input_detail` |

---

# B. 2차 질문

## B-1. 돈을 내라는 서류 — 2차

### Q5-M

**고객 화면**

**서류에 적힌 내 정보는 얼마나 맞고, 같은 서류를 받은 사람이 주변에 더 있나요?**

① **이름·회사명·주소가 모두 정확**합니다. 주변에 물어보니 이 서류를 받은 사람은 저뿐인 것 같습니다.  
② **이름은 맞지만 주소나 번호가 일부 다릅니다.** 주변 사람들이 같은 서류를 받았는지는 아직 물어보지 못했습니다.  
③ **이름 없이 일반 호칭**만 적혀 있습니다. 회사 동료나 지인도 똑같은 내용을 받았다고 합니다.  
④ **다른 사람이나 다른 회사 이름**이 적혀 있습니다. 이 서류를 받은 사람은 저뿐인 것 같아 잘못 온 것인지 모르겠습니다.  
⑤ **적힌 정보를 아직 확인하지 않았습니다.** 주변 사람들도 받았는지 알아본 적이 없어 아직 잘 모르겠습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_otherRecipients=oth_only_me` |
| ② | `unclear_identityMatch=id_partial`, `unclear_otherRecipients=oth_unknown` |
| ③ | `unclear_identityMatch=id_generic`, `unclear_otherRecipients=oth_others` |
| ④ | `unclear_identityMatch=id_other`, `unclear_otherRecipients=oth_only_me` |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_otherRecipients=oth_unknown` |
| ⑥ 직접 입력 | `unclear_identityMatch=direct_input`, `unclear_otherRecipients=direct_input_detail` |

---

### Q6-M

**고객 화면**

**서류나 연락에 공식 문서의 요소(기관명·문서번호·날짜·직인)가 얼마나 있고, 연락처를 공식 정보와 대조해 보셨나요?**

① **기관명·문서번호·날짜·직인이 모두** 있습니다. 하지만 적힌 연락처를 공식 정보와 대조해 보지는 않았습니다.  
② **그중 일부만** 있습니다. 공식 사이트에서 같은 기관의 연락처를 찾아 대조해 보았더니 비슷했습니다.  
③ **공식 요소가 없고 연락처가 개인 번호나 일반 이메일**뿐입니다. 공식 사이트의 연락처와 대조해 보니 서로 달랐습니다.  
④ **링크나 큐알 코드로만** 안내합니다. 그 링크가 공식 사이트 주소와 같은지 대조해 보지 않았습니다.  
⑤ **문장이 번역투이거나 어색**합니다. 공식 연락처와 대조해 보니 같아서 오히려 헷갈립니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_officialCompare=cmp_unchecked` |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_officialCompare=cmp_same` |
| ③ | `unclear_authenticityMark=mark_weak`, `unclear_officialCompare=cmp_diff` |
| ④ | `unclear_authenticityMark=mark_link_only`, `unclear_officialCompare=cmp_unchecked` |
| ⑤ | `unclear_authenticityMark=mark_odd_text`, `unclear_officialCompare=cmp_same` |
| ⑥ 직접 입력 | `unclear_authenticityMark=direct_input`, `unclear_officialCompare=direct_input_detail` |

---

### Q7-M

**고객 화면**

**서류가 요구하는 돈은 어떤 명목이라고 적혀 있고, 그 명목에 해당하는 일을 제가 한 기억이 있나요?**

① **세금이나 세무 관련 비용**이라고 적혀 있습니다. 세금 신고나 납부를 한 기억이 있어 내용이 맞는지 확인하고 싶습니다.  
② **벌금·과태료·행정 수수료**라고 적혀 있습니다. 벌금이나 수수료를 부과받을 만한 일이 기억나지 않습니다.  
③ **서비스 이용료나 거래 대금**이라고 적혀 있습니다. 실제로 이용하거나 거래했는지 기억이 불확실합니다.  
④ **보증금·선납금·예치금**이라고 적혀 있습니다. 임대나 매매 계약을 한 기억이 있습니다.  
⑤ **무슨 돈인지 명목이 적혀 있지 않습니다.** 어떤 일에 대한 돈인지 짚이는 일도 전혀 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_moneyNature=nature_tax`, `unclear_dealMemory=mem_yes` |
| ② | `unclear_moneyNature=nature_fine`, `unclear_dealMemory=mem_no` |
| ③ | `unclear_moneyNature=nature_trade`, `unclear_dealMemory=mem_unsure` |
| ④ | `unclear_moneyNature=nature_deposit`, `unclear_dealMemory=mem_yes` |
| ⑤ | `unclear_moneyNature=nature_unstated`, `unclear_dealMemory=mem_no` |
| ⑥ 직접 입력 | `unclear_moneyNature=direct_input`, `unclear_dealMemory=direct_input_detail` |

---

### Q8-M

**고객 화면**

**요구하는 금액은 어느 정도이고, 그 금액의 계산 내역이 적혀 있나요?**

① **100만 동 미만**을 요구합니다. 항목별 계산 내역이 함께 적혀 있어 확인해 볼 수 있습니다.  
② **100만 동 이상 1천만 동 미만**을 요구합니다. 총액만 적혀 있고 계산 내역은 없습니다.  
③ **1천만 동 이상 1억 동 미만**을 요구합니다. 계산 내역이 없어 큰 금액의 근거를 알 수 없습니다.  
④ **1억 동 이상**을 요구합니다. 항목별 내역은 있지만 그 내역이 맞는지 판단하기 어렵습니다.  
⑤ **금액이 적혀 있지 않습니다.** 얼마를 내라는 것인지 알 수 없고 계산 내역도 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_amountScale=amt_under1m`, `unclear_amountBasis=ab_itemized` |
| ② | `unclear_amountScale=amt_1m_10m`, `unclear_amountBasis=ab_total` |
| ③ | `unclear_amountScale=amt_10m_100m`, `unclear_amountBasis=ab_total` |
| ④ | `unclear_amountScale=amt_over100m`, `unclear_amountBasis=ab_itemized` |
| ⑤ | `unclear_amountScale=amt_unstated`, `unclear_amountBasis=ab_none` |
| ⑥ 직접 입력 | `unclear_amountScale=direct_input`, `unclear_amountBasis=direct_input_detail` |

---

### Q9-M

**고객 화면**

**돈을 어디로 보내라고 되어 있고, 그 받는 곳의 이름이 서류의 보낸 곳과 같은가요?**

① **기관 이름의 계좌**로 보내라고 합니다. 계좌 이름이 서류에 적힌 보낸 곳의 이름과 같습니다.  
② **회사 이름의 계좌**로 보내라고 합니다. 계좌 이름이 서류에 적힌 보낸 곳의 이름과 다릅니다.  
③ **개인 이름의 계좌**로 보내라고 합니다. 계좌 주인이 보낸 곳과 어떤 관계인지 설명이 없습니다.  
④ **링크·큐알 코드·앱**으로 결제하라고 합니다. 결제 화면의 이름이 보낸 곳과 같은지 아직 확인하지 못했습니다.  
⑤ **현금이나 상품권**으로 내라고 합니다. 돈을 받는 곳의 이름이 서류에 따로 적혀 있지 않습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_payee=payee_institution`, `unclear_payeeMatch=pm_same` |
| ② | `unclear_payee=payee_company`, `unclear_payeeMatch=pm_diff` |
| ③ | `unclear_payee=payee_person`, `unclear_payeeMatch=pm_unknown` |
| ④ | `unclear_payee=payee_online`, `unclear_payeeMatch=pm_unknown` |
| ⑤ | `unclear_payee=payee_cash`, `unclear_payeeMatch=pm_na` |
| ⑥ 직접 입력 | `unclear_payee=direct_input`, `unclear_payeeMatch=direct_input_detail` |

---

### Q10-M

**고객 화면**

**서류나 연락에서 어떤 압박을 받았고, 그 압박은 어떤 수단으로 전해졌나요?**

① **압박 없이 안내만** 있습니다. 재촉이나 협박 없이 서류에 적힌 내용으로만 전해졌습니다.  
② **기한 안에 하라고 재촉**합니다. 문자나 메신저로 같은 말을 반복해서 보내 오고 있습니다.  
③ **연체료·가산금이나 법적 조치를 예고**합니다. 그런 내용이 서류에 글로 적혀 있어 확인할 수 있습니다.  
④ **계좌 동결·체포·출국 금지 같은 강한 불이익**을 말합니다. 전화로 직접 들었습니다.  
⑤ **다른 사람에게 말하지 말고 비밀로 하라**고 합니다. 문자나 메신저로 요구해 왔습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureChannel=ch_document` |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureChannel=ch_message` |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureChannel=ch_document` |
| ④ | `unclear_pressureType=press_threat`, `unclear_pressureChannel=ch_call` |
| ⑤ | `unclear_pressureType=press_secret`, `unclear_pressureChannel=ch_message` |
| ⑥ 직접 입력 | `unclear_pressureType=direct_input`, `unclear_pressureChannel=direct_input_detail` |

---

### Q11-M

**고객 화면**

**서류나 안내의 기한은 어떤 상태이고, 기한을 넘기면 어떻게 된다고 하나요?**

① **기한이 적혀 있지 않습니다.** 기한을 넘기면 어떻게 된다는 말도 어디에도 없습니다.  
② **서류에 날짜가 적혀 있고 아직 여유**가 있습니다. 넘기면 가산금이나 연체료가 붙는다고 합니다.  
③ **서류에 날짜가 적혀 있고 사흘 안으로 가깝습니다.** 넘기면 법적 조치를 한다고 합니다.  
④ **서류에 적힌 기한이 이미 지났습니다.** 기한을 넘기면 어떤 일이 생기는지는 알지 못합니다.  
⑤ **메시지나 말로만 기한**을 알려 줬습니다. 넘기면 법적 조치를 한다고 겁을 줬습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineStake=stake_none` |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineStake=stake_money` |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineStake=stake_legal` |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineStake=stake_unknown` |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineStake=stake_legal` |
| ⑥ 직접 입력 | `unclear_deadlineStatus=direct_input`, `unclear_deadlineStake=direct_input_detail` |

---

### Q12-M

**고객 화면**

**이 서류와 관련해 지금까지 한 일은 무엇이고, 그 뒤에 상대의 연락은 어떻게 되었나요?**

① **아무것도 하지 않았습니다.** 그 뒤에도 상대에게서 추가로 온 연락이나 요구는 전혀 없습니다.  
② **문의하거나 답장·통화**를 했습니다. 그 뒤에도 상대가 계속해서 연락해 오고 있습니다.  
③ **링크를 열었거나 앱을 설치**했습니다. 그 뒤에는 별다른 일이 없었고 상대 연락도 오지 않았습니다.  
④ **개인정보나 서류를 이미 보냈습니다.** 그 뒤에도 정보를 더 달라는 요구가 계속 오고 있습니다.  
⑤ **돈을 일부 또는 전부 보냈습니다.** 그 뒤에는 상대의 연락이 끊겨 더 이상 닿지 않습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_followUp=fu_none` |
| ② | `unclear_actionTaken=act_contacted`, `unclear_followUp=fu_more` |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_followUp=fu_none` |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_followUp=fu_more` |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_followUp=fu_cut` |
| ⑥ 직접 입력 | `unclear_actionTaken=direct_input`, `unclear_followUp=direct_input_detail` |

---

### Q13-M

**고객 화면**

**남아 있는 자료는 무엇이고, 그 자료로 무엇을 하고 싶으신가요?**

① **서류 원본**을 가지고 있습니다. 서류 내용을 직접 대조해서 진짜인지 확인해 보고 싶습니다.  
② **사진·캡처나 문자·통화 기록**이 남아 있습니다. 상담이나 신고에 쓸 자료로 정리하고 싶습니다.  
③ **송금 내역이나 영수증**이 있습니다. 낸 돈을 되찾을 수 있는 방법을 알고 싶습니다.  
④ **일부를 잃어버렸거나 지웠습니다.** 남아 있는 자료만으로도 진짜인지 확인해 보고 싶습니다.  
⑤ **남은 자료가 없습니다.** 앞으로 증거가 될 만한 것을 무엇부터 모아 두어야 하는지 알고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceGoal=goal_verify` |
| ② | `unclear_evidenceKind=ev_capture`, `unclear_evidenceGoal=goal_report` |
| ③ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceGoal=goal_recover` |
| ④ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceGoal=goal_verify` |
| ⑤ | `unclear_evidenceKind=ev_none`, `unclear_evidenceGoal=goal_prepare` |
| ⑥ 직접 입력 | `unclear_evidenceKind=direct_input`, `unclear_evidenceGoal=direct_input_detail` |

---

## B-2. 서류 제출·출석 서류 — 2차

### Q5-D

**고객 화면**

**서류에 적힌 내 정보는 얼마나 맞고, 같은 서류를 받은 사람이 주변에 더 있나요?**

① **이름·회사명·주소가 모두 정확**합니다. 주변에 물어보니 이 서류를 받은 사람은 저뿐인 것 같습니다.  
② **이름은 맞지만 주소나 번호가 일부 다릅니다.** 주변 사람들이 같은 서류를 받았는지는 아직 물어보지 못했습니다.  
③ **이름 없이 일반 호칭**만 적혀 있습니다. 회사 동료나 지인도 똑같은 내용을 받았다고 합니다.  
④ **다른 사람이나 다른 회사 이름**이 적혀 있습니다. 이 서류를 받은 사람은 저뿐인 것 같아 잘못 온 것인지 모르겠습니다.  
⑤ **적힌 정보를 아직 확인하지 않았습니다.** 주변 사람들도 받았는지 알아본 적이 없어 아직 잘 모르겠습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_otherRecipients=oth_only_me` |
| ② | `unclear_identityMatch=id_partial`, `unclear_otherRecipients=oth_unknown` |
| ③ | `unclear_identityMatch=id_generic`, `unclear_otherRecipients=oth_others` |
| ④ | `unclear_identityMatch=id_other`, `unclear_otherRecipients=oth_only_me` |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_otherRecipients=oth_unknown` |
| ⑥ 직접 입력 | `unclear_identityMatch=direct_input`, `unclear_otherRecipients=direct_input_detail` |

---

### Q6-D

**고객 화면**

**서류나 연락에 공식 문서의 요소(기관명·문서번호·날짜·직인)가 얼마나 있고, 연락처를 공식 정보와 대조해 보셨나요?**

① **기관명·문서번호·날짜·직인이 모두** 있습니다. 하지만 적힌 연락처를 공식 정보와 대조해 보지는 않았습니다.  
② **그중 일부만** 있습니다. 공식 사이트에서 같은 기관의 연락처를 찾아 대조해 보았더니 비슷했습니다.  
③ **공식 요소가 없고 연락처가 개인 번호나 일반 이메일**뿐입니다. 공식 사이트의 연락처와 대조해 보니 서로 달랐습니다.  
④ **링크나 큐알 코드로만** 안내합니다. 그 링크가 공식 사이트 주소와 같은지 대조해 보지 않았습니다.  
⑤ **문장이 번역투이거나 어색**합니다. 공식 연락처와 대조해 보니 같아서 오히려 헷갈립니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_officialCompare=cmp_unchecked` |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_officialCompare=cmp_same` |
| ③ | `unclear_authenticityMark=mark_weak`, `unclear_officialCompare=cmp_diff` |
| ④ | `unclear_authenticityMark=mark_link_only`, `unclear_officialCompare=cmp_unchecked` |
| ⑤ | `unclear_authenticityMark=mark_odd_text`, `unclear_officialCompare=cmp_same` |
| ⑥ 직접 입력 | `unclear_authenticityMark=direct_input`, `unclear_officialCompare=direct_input_detail` |

---

### Q7-D

**고객 화면**

**서류가 요구하는 것은 무엇이고, 왜 그것이 필요한지 설명이 있나요?**

① **신분증·여권·체류 관련 서류**를 요구합니다. 이유 설명 없이 낼 서류의 이름만 한 줄로 적혀 있습니다.  
② **사업자·계약·거래 서류**를 요구합니다. 왜 필요한지 이유가 서류 안에 구체적으로 설명되어 있습니다.  
③ **경위서·설명서 같은 진술**을 요구합니다. 그 진술이 왜 필요한지 이유가 서류에 적혀 있지 않습니다.  
④ **직접 출석하거나 방문**하라고 합니다. 일시와 장소, 이유가 서류에 설명되어 있습니다.  
⑤ **사이트 접속이나 앱 설치**를 하라고 합니다. 왜 접속하거나 설치해야 하는지 이유가 적혀 있지 않습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_requestTarget=tgt_id_docs`, `unclear_requestReason=reason_none` |
| ② | `unclear_requestTarget=tgt_docs_biz`, `unclear_requestReason=reason_stated` |
| ③ | `unclear_requestTarget=tgt_statement`, `unclear_requestReason=reason_none` |
| ④ | `unclear_requestTarget=tgt_appear`, `unclear_requestReason=reason_stated` |
| ⑤ | `unclear_requestTarget=tgt_online`, `unclear_requestReason=reason_none` |
| ⑥ 직접 입력 | `unclear_requestTarget=direct_input`, `unclear_requestReason=direct_input_detail` |

---

### Q8-D

**고객 화면**

**요구 내용은 얼마나 구체적으로 적혀 있고, 그것을 제가 가진 것으로 준비할 수 있나요?**

① **서류 목록과 제출 양식이 모두** 있습니다. 제가 가진 서류로 준비할 수 있을 것 같습니다.  
② **목록은 있지만 양식은 없습니다.** 그중 일부는 제가 구하기 어려운 서류라서 걱정됩니다.  
③ **‘관련 서류’ 정도로만** 적혀 있습니다. 그래서 무엇을 준비해야 하는지 전혀 알 수 없습니다.  
④ **무엇을 내야 하는지 적혀 있지 않습니다.** 준비할 서류가 있는지도 알 수 없습니다.  
⑤ **서류 요구 없이 연락하라고만** 합니다. 연락하면 그다음에 무엇을 요구할지 몰라서 불안합니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_requestSpecificity=spec_full`, `unclear_prepState=prep_ready` |
| ② | `unclear_requestSpecificity=spec_list_only`, `unclear_prepState=prep_hard` |
| ③ | `unclear_requestSpecificity=spec_vague`, `unclear_prepState=prep_unknown` |
| ④ | `unclear_requestSpecificity=spec_none`, `unclear_prepState=prep_na` |
| ⑤ | `unclear_requestSpecificity=spec_contact_only`, `unclear_prepState=prep_unknown` |
| ⑥ 직접 입력 | `unclear_requestSpecificity=direct_input`, `unclear_prepState=direct_input_detail` |

---

### Q9-D

**고객 화면**

**제출이나 출석은 어떤 방법으로 하라고 되어 있고, 그 접수처가 공식인지 확인해 보셨나요?**

① **지정된 장소에 직접 방문**하라고 합니다. 그 주소가 기관의 공식 정보와 같은 것을 확인했습니다.  
② **우편이나 창구 접수**라고 합니다. 그 우편 주소와 창구가 공식인지는 아직 확인하지 않았습니다.  
③ **이메일이나 메신저로 보내라**고 합니다. 받는 주소가 공식인지는 아직 확인하지 않았습니다.  
④ **웹사이트에 올리라**고 합니다. 그 사이트가 공식 사이트인지 알아볼 방법을 몰라 확인이 어렵습니다.  
⑤ **전화나 화상 통화**로 하라고 합니다. 통화 상대가 어느 기관의 누구인지 알려 주지 않은 채 통화하자고 합니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_deliveryMethod=deliver_visit`, `unclear_venueCheck=venue_checked` |
| ② | `unclear_deliveryMethod=deliver_post`, `unclear_venueCheck=venue_unchecked` |
| ③ | `unclear_deliveryMethod=deliver_chat`, `unclear_venueCheck=venue_unchecked` |
| ④ | `unclear_deliveryMethod=deliver_upload`, `unclear_venueCheck=venue_unknown` |
| ⑤ | `unclear_deliveryMethod=deliver_call`, `unclear_venueCheck=venue_unknown` |
| ⑥ 직접 입력 | `unclear_deliveryMethod=direct_input`, `unclear_venueCheck=direct_input_detail` |

---

### Q10-D

**고객 화면**

**서류나 연락에서 어떤 압박을 받았고, 그 압박은 어떤 수단으로 전해졌나요?**

① **압박 없이 안내만** 있습니다. 재촉이나 협박 없이 서류에 적힌 내용으로만 전해졌습니다.  
② **기한 안에 하라고 재촉**합니다. 문자나 메신저로 같은 말을 반복해서 보내 오고 있습니다.  
③ **연체료·가산금이나 법적 조치를 예고**합니다. 그런 내용이 서류에 글로 적혀 있어 확인할 수 있습니다.  
④ **계좌 동결·체포·출국 금지 같은 강한 불이익**을 말합니다. 전화로 직접 들었습니다.  
⑤ **다른 사람에게 말하지 말고 비밀로 하라**고 합니다. 문자나 메신저로 요구해 왔습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureChannel=ch_document` |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureChannel=ch_message` |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureChannel=ch_document` |
| ④ | `unclear_pressureType=press_threat`, `unclear_pressureChannel=ch_call` |
| ⑤ | `unclear_pressureType=press_secret`, `unclear_pressureChannel=ch_message` |
| ⑥ 직접 입력 | `unclear_pressureType=direct_input`, `unclear_pressureChannel=direct_input_detail` |

---

### Q11-D

**고객 화면**

**서류나 안내의 기한은 어떤 상태이고, 기한을 넘기면 어떻게 된다고 하나요?**

① **기한이 적혀 있지 않습니다.** 기한을 넘기면 어떻게 된다는 말도 어디에도 없습니다.  
② **서류에 날짜가 적혀 있고 아직 여유**가 있습니다. 넘기면 가산금이나 연체료가 붙는다고 합니다.  
③ **서류에 날짜가 적혀 있고 사흘 안으로 가깝습니다.** 넘기면 법적 조치를 한다고 합니다.  
④ **서류에 적힌 기한이 이미 지났습니다.** 기한을 넘기면 어떤 일이 생기는지는 알지 못합니다.  
⑤ **메시지나 말로만 기한**을 알려 줬습니다. 넘기면 법적 조치를 한다고 겁을 줬습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineStake=stake_none` |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineStake=stake_money` |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineStake=stake_legal` |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineStake=stake_unknown` |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineStake=stake_legal` |
| ⑥ 직접 입력 | `unclear_deadlineStatus=direct_input`, `unclear_deadlineStake=direct_input_detail` |

---

### Q12-D

**고객 화면**

**이 서류와 관련해 지금까지 한 일은 무엇이고, 그 뒤에 상대의 연락은 어떻게 되었나요?**

① **아무것도 하지 않았습니다.** 그 뒤에도 상대에게서 추가로 온 연락이나 요구는 전혀 없습니다.  
② **문의하거나 답장·통화**를 했습니다. 그 뒤에도 상대가 계속해서 연락해 오고 있습니다.  
③ **링크를 열었거나 앱을 설치**했습니다. 그 뒤에는 별다른 일이 없었고 상대 연락도 오지 않았습니다.  
④ **개인정보나 서류를 이미 보냈습니다.** 그 뒤에도 정보를 더 달라는 요구가 계속 오고 있습니다.  
⑤ **돈을 일부 또는 전부 보냈습니다.** 그 뒤에는 상대의 연락이 끊겨 더 이상 닿지 않습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_followUp=fu_none` |
| ② | `unclear_actionTaken=act_contacted`, `unclear_followUp=fu_more` |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_followUp=fu_none` |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_followUp=fu_more` |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_followUp=fu_cut` |
| ⑥ 직접 입력 | `unclear_actionTaken=direct_input`, `unclear_followUp=direct_input_detail` |

---

### Q13-D

**고객 화면**

**남아 있는 자료는 무엇이고, 그 자료로 무엇을 하고 싶으신가요?**

① **서류 원본**을 가지고 있습니다. 서류 내용을 직접 대조해서 진짜인지 확인해 보고 싶습니다.  
② **사진·캡처나 문자·통화 기록**이 남아 있습니다. 상담이나 신고에 쓸 자료로 정리하고 싶습니다.  
③ **송금 내역이나 영수증**이 있습니다. 낸 돈을 되찾을 수 있는 방법을 알고 싶습니다.  
④ **일부를 잃어버렸거나 지웠습니다.** 남아 있는 자료만으로도 진짜인지 확인해 보고 싶습니다.  
⑤ **남은 자료가 없습니다.** 앞으로 증거가 될 만한 것을 무엇부터 모아 두어야 하는지 알고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceGoal=goal_verify` |
| ② | `unclear_evidenceKind=ev_capture`, `unclear_evidenceGoal=goal_report` |
| ③ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceGoal=goal_recover` |
| ④ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceGoal=goal_verify` |
| ⑤ | `unclear_evidenceKind=ev_none`, `unclear_evidenceGoal=goal_prepare` |
| ⑥ 직접 입력 | `unclear_evidenceKind=direct_input`, `unclear_evidenceGoal=direct_input_detail` |

---

## B-3. 내용을 모르는 서류 — 2차

### Q5-N

**고객 화면**

**서류에 적힌 내 정보는 얼마나 맞고, 같은 서류를 받은 사람이 주변에 더 있나요?**

① **이름·회사명·주소가 모두 정확**합니다. 주변에 물어보니 이 서류를 받은 사람은 저뿐인 것 같습니다.  
② **이름은 맞지만 주소나 번호가 일부 다릅니다.** 주변 사람들이 같은 서류를 받았는지는 아직 물어보지 못했습니다.  
③ **이름 없이 일반 호칭**만 적혀 있습니다. 회사 동료나 지인도 똑같은 내용을 받았다고 합니다.  
④ **다른 사람이나 다른 회사 이름**이 적혀 있습니다. 이 서류를 받은 사람은 저뿐인 것 같아 잘못 온 것인지 모르겠습니다.  
⑤ **적힌 정보를 아직 확인하지 않았습니다.** 주변 사람들도 받았는지 알아본 적이 없어 아직 잘 모르겠습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_otherRecipients=oth_only_me` |
| ② | `unclear_identityMatch=id_partial`, `unclear_otherRecipients=oth_unknown` |
| ③ | `unclear_identityMatch=id_generic`, `unclear_otherRecipients=oth_others` |
| ④ | `unclear_identityMatch=id_other`, `unclear_otherRecipients=oth_only_me` |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_otherRecipients=oth_unknown` |
| ⑥ 직접 입력 | `unclear_identityMatch=direct_input`, `unclear_otherRecipients=direct_input_detail` |

---

### Q6-N

**고객 화면**

**서류나 연락에 공식 문서의 요소(기관명·문서번호·날짜·직인)가 얼마나 있고, 연락처를 공식 정보와 대조해 보셨나요?**

① **기관명·문서번호·날짜·직인이 모두** 있습니다. 하지만 적힌 연락처를 공식 정보와 대조해 보지는 않았습니다.  
② **그중 일부만** 있습니다. 공식 사이트에서 같은 기관의 연락처를 찾아 대조해 보았더니 비슷했습니다.  
③ **공식 요소가 없고 연락처가 개인 번호나 일반 이메일**뿐입니다. 공식 사이트의 연락처와 대조해 보니 서로 달랐습니다.  
④ **링크나 큐알 코드로만** 안내합니다. 그 링크가 공식 사이트 주소와 같은지 대조해 보지 않았습니다.  
⑤ **문장이 번역투이거나 어색**합니다. 공식 연락처와 대조해 보니 같아서 오히려 헷갈립니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_officialCompare=cmp_unchecked` |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_officialCompare=cmp_same` |
| ③ | `unclear_authenticityMark=mark_weak`, `unclear_officialCompare=cmp_diff` |
| ④ | `unclear_authenticityMark=mark_link_only`, `unclear_officialCompare=cmp_unchecked` |
| ⑤ | `unclear_authenticityMark=mark_odd_text`, `unclear_officialCompare=cmp_same` |
| ⑥ 직접 입력 | `unclear_authenticityMark=direct_input`, `unclear_officialCompare=direct_input_detail` |

---

### Q7-N

**고객 화면**

**서류 내용을 얼마나 이해하셨고, 주변에 이 서류를 같이 봐 줄 사람이 있나요?**

① **대부분 이해**했습니다. 회사 동료나 지인에게 나머지 부분을 물어볼 수 있어 도움받기 쉽습니다.  
② **절반쯤 이해**했습니다. 이 서류를 같이 봐 줄 사람이 주변에 전혀 없어 혼자 판단해야 합니다.  
③ **거의 이해하지 못했습니다.** 주변에 이 서류에 대해 물어볼 만한 사람이 없어 막막한 상태입니다.  
④ **외국어(베트남어)라 읽기 어렵습니다.** 베트남어를 읽을 수 있는 지인이 주변에 있습니다.  
⑤ **사진이 흐리거나 잘려 읽을 수 없습니다.** 다시 찍거나 원본을 구할 방법은 모르겠습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_understandingLevel=und_most`, `unclear_helperNearby=helper_yes` |
| ② | `unclear_understandingLevel=und_half`, `unclear_helperNearby=helper_none` |
| ③ | `unclear_understandingLevel=und_little`, `unclear_helperNearby=helper_none` |
| ④ | `unclear_understandingLevel=und_language`, `unclear_helperNearby=helper_yes` |
| ⑤ | `unclear_understandingLevel=und_blurry`, `unclear_helperNearby=helper_none` |
| ⑥ 직접 입력 | `unclear_understandingLevel=direct_input`, `unclear_helperNearby=direct_input_detail` |

---

### Q8-N

**고객 화면**

**서류에서 가장 눈에 띄는 것은 무엇이고, 그것이 제가 이미 알고 있는 이름이나 내용인가요?**

① **법령 이름이나 조항 번호**가 눈에 띕니다. 제가 처음 보는 법령이거나 낯선 내용입니다.  
② **기관 이름이나 문서번호**가 눈에 띕니다. 제가 이미 알고 있는 기관이거나 익숙한 내용입니다.  
③ **금액이나 계좌번호**가 눈에 띕니다. 제가 아는 거래와 관련된 금액이 아닐까 짐작됩니다.  
④ **날짜나 기한**이 눈에 띕니다. 처음 보는 내용이라 무슨 날짜인지 도무지 모르겠습니다.  
⑤ **링크나 전화번호뿐**입니다. 처음 보는 번호라 무엇을 하라는 것인지 전혀 모르겠습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_keyElement=key_law`, `unclear_keyKnown=known_no` |
| ② | `unclear_keyElement=key_agency`, `unclear_keyKnown=known_yes` |
| ③ | `unclear_keyElement=key_money`, `unclear_keyKnown=known_yes` |
| ④ | `unclear_keyElement=key_date`, `unclear_keyKnown=known_no` |
| ⑤ | `unclear_keyElement=key_contact`, `unclear_keyKnown=known_no` |
| ⑥ 직접 입력 | `unclear_keyElement=direct_input`, `unclear_keyKnown=direct_input_detail` |

---

### Q9-N

**고객 화면**

**읽어 본 느낌으로는 무엇을 요구하는 것 같고, 그렇게 느낀 근거는 무엇인가요?**

① **돈을 내라는 것** 같습니다. 금액이나 납부 안내가 문장 안에 직접 적혀 있어서입니다.  
② **서류를 내거나 출석하라는 것** 같습니다. 분위기로 짐작할 뿐 정확한 문장은 이해하지 못했습니다.  
③ **그냥 알려 주는 내용** 같습니다. 요구 문장은 없고 안내문처럼 보이는 분위기 때문입니다.  
④ **연락하라는 말뿐**입니다. 연락처와 연락하라는 말이 문장에 직접 적혀 있어서 그렇게 느꼈습니다.  
⑤ **판단하기 어렵습니다.** 느낌의 근거로 삼을 만한 부분조차 찾지 못해서 판단이 어렵습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_impliedRequest=imp_money`, `unclear_impliedBasis=im_text` |
| ② | `unclear_impliedRequest=imp_submit`, `unclear_impliedBasis=im_feel` |
| ③ | `unclear_impliedRequest=imp_notice`, `unclear_impliedBasis=im_feel` |
| ④ | `unclear_impliedRequest=imp_contact`, `unclear_impliedBasis=im_text` |
| ⑤ | `unclear_impliedRequest=imp_unknown`, `unclear_impliedBasis=im_none` |
| ⑥ 직접 입력 | `unclear_impliedRequest=direct_input`, `unclear_impliedBasis=direct_input_detail` |

---

### Q10-N

**고객 화면**

**서류나 연락에서 어떤 압박을 받았고, 그 압박은 어떤 수단으로 전해졌나요?**

① **압박 없이 안내만** 있습니다. 재촉이나 협박 없이 서류에 적힌 내용으로만 전해졌습니다.  
② **기한 안에 하라고 재촉**합니다. 문자나 메신저로 같은 말을 반복해서 보내 오고 있습니다.  
③ **연체료·가산금이나 법적 조치를 예고**합니다. 그런 내용이 서류에 글로 적혀 있어 확인할 수 있습니다.  
④ **계좌 동결·체포·출국 금지 같은 강한 불이익**을 말합니다. 전화로 직접 들었습니다.  
⑤ **다른 사람에게 말하지 말고 비밀로 하라**고 합니다. 문자나 메신저로 요구해 왔습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureChannel=ch_document` |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureChannel=ch_message` |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureChannel=ch_document` |
| ④ | `unclear_pressureType=press_threat`, `unclear_pressureChannel=ch_call` |
| ⑤ | `unclear_pressureType=press_secret`, `unclear_pressureChannel=ch_message` |
| ⑥ 직접 입력 | `unclear_pressureType=direct_input`, `unclear_pressureChannel=direct_input_detail` |

---

### Q11-N

**고객 화면**

**서류나 안내의 기한은 어떤 상태이고, 기한을 넘기면 어떻게 된다고 하나요?**

① **기한이 적혀 있지 않습니다.** 기한을 넘기면 어떻게 된다는 말도 어디에도 없습니다.  
② **서류에 날짜가 적혀 있고 아직 여유**가 있습니다. 넘기면 가산금이나 연체료가 붙는다고 합니다.  
③ **서류에 날짜가 적혀 있고 사흘 안으로 가깝습니다.** 넘기면 법적 조치를 한다고 합니다.  
④ **서류에 적힌 기한이 이미 지났습니다.** 기한을 넘기면 어떤 일이 생기는지는 알지 못합니다.  
⑤ **메시지나 말로만 기한**을 알려 줬습니다. 넘기면 법적 조치를 한다고 겁을 줬습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineStake=stake_none` |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineStake=stake_money` |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineStake=stake_legal` |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineStake=stake_unknown` |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineStake=stake_legal` |
| ⑥ 직접 입력 | `unclear_deadlineStatus=direct_input`, `unclear_deadlineStake=direct_input_detail` |

---

### Q12-N

**고객 화면**

**이 서류와 관련해 지금까지 한 일은 무엇이고, 그 뒤에 상대의 연락은 어떻게 되었나요?**

① **아무것도 하지 않았습니다.** 그 뒤에도 상대에게서 추가로 온 연락이나 요구는 전혀 없습니다.  
② **문의하거나 답장·통화**를 했습니다. 그 뒤에도 상대가 계속해서 연락해 오고 있습니다.  
③ **링크를 열었거나 앱을 설치**했습니다. 그 뒤에는 별다른 일이 없었고 상대 연락도 오지 않았습니다.  
④ **개인정보나 서류를 이미 보냈습니다.** 그 뒤에도 정보를 더 달라는 요구가 계속 오고 있습니다.  
⑤ **돈을 일부 또는 전부 보냈습니다.** 그 뒤에는 상대의 연락이 끊겨 더 이상 닿지 않습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_followUp=fu_none` |
| ② | `unclear_actionTaken=act_contacted`, `unclear_followUp=fu_more` |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_followUp=fu_none` |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_followUp=fu_more` |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_followUp=fu_cut` |
| ⑥ 직접 입력 | `unclear_actionTaken=direct_input`, `unclear_followUp=direct_input_detail` |

---

### Q13-N

**고객 화면**

**남아 있는 자료는 무엇이고, 그 자료로 무엇을 하고 싶으신가요?**

① **서류 원본**을 가지고 있습니다. 서류 내용을 직접 대조해서 진짜인지 확인해 보고 싶습니다.  
② **사진·캡처나 문자·통화 기록**이 남아 있습니다. 상담이나 신고에 쓸 자료로 정리하고 싶습니다.  
③ **송금 내역이나 영수증**이 있습니다. 낸 돈을 되찾을 수 있는 방법을 알고 싶습니다.  
④ **일부를 잃어버렸거나 지웠습니다.** 남아 있는 자료만으로도 진짜인지 확인해 보고 싶습니다.  
⑤ **남은 자료가 없습니다.** 앞으로 증거가 될 만한 것을 무엇부터 모아 두어야 하는지 알고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceGoal=goal_verify` |
| ② | `unclear_evidenceKind=ev_capture`, `unclear_evidenceGoal=goal_report` |
| ③ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceGoal=goal_recover` |
| ④ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceGoal=goal_verify` |
| ⑤ | `unclear_evidenceKind=ev_none`, `unclear_evidenceGoal=goal_prepare` |
| ⑥ 직접 입력 | `unclear_evidenceKind=direct_input`, `unclear_evidenceGoal=direct_input_detail` |

---

# C. 필드 표

모든 질문은 한 문장 안에서 두 가지를 함께 묻고, 선택지는 굵은 요점과 설명 문장으로 두 가지 정보를 함께 담는다. 첫 필드는 질문의 첫째 정보, 둘째 필드는 둘째 정보이며, 결과 문장은 두 정보를 함께 반영하고 위험 규칙·연결 안내의 조건에도 두 필드를 함께 쓴다. 조건에 쓰이지 않는 필드도 이후 상담 정리와 질문 개선을 위해 저장한다. 값 옆은 고객 표시 문구(G).

## C-1. 돈을 내라는 서류

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `unclear_documentForm` | `paper_doc`(종이 서류) / `email_body`(이메일) / `chat_message`(문자·메신저) / `link_code`(링크·큐알 코드 안내) / `verbal_only`(말로만 들음) | Q1-M |
| `unclear_contentDetail` | `detail_full`(요구 내용이 구체적임) / `detail_brief`(요구 내용이 짧거나 모호함) / `detail_linked`(내용이 연결 화면에만 있음) / `detail_none`(받은 서류 없이 말로만 전달됨) | Q1-M |
| `unclear_senderClaim` | `public_agency`(공공기관(세무·행정·출입국·노동)) / `police_court`(공안·경찰·검찰·법원) / `bank_claim`(은행·금융회사) / `company_claim`(회사·통신·택배·플랫폼) / `unnamed_claim`(보낸 곳이 없거나 개인) | Q2-M |
| `unclear_senderRelation` | `rel_recent`(최근 그 곳에 신청·신고한 일이 있음) / `rel_none`(그 곳과 한 일이 없음) / `rel_customer`(평소 거래하던 곳) / `rel_unknown`(관계가 있는지 모름) | Q2-M |
| `unclear_contactPattern` | `first_contact`(처음 한 번 받음) / `once_earlier`(며칠 전에 한 번 받음) / `repeated_same`(같은 내용을 반복해서 받음) / `escalating_tone`(반복되며 표현이 점점 강해짐) / `after_visit`(전화·방문 뒤에 이어서 받음) | Q3-M |
| `unclear_requestLink` | `req_none`(내가 신청·문의한 일은 없음) / `req_related`(내가 신청·문의한 일 뒤에 받음) | Q3-M |
| `unclear_mainConcern` | `doubt_genuine`(진짜인지 모르겠음) / `doubt_owed`(내야 하는 돈인지·금액이 맞는지 모르겠음) / `doubt_deadline`(기한을 놓칠까 걱정함) / `doubt_done`(이미 응해서 불안함) / `doubt_none`(크게 걱정하지 않음) | Q4-M |
| `unclear_helpWanted` | `help_guide`(스스로 확인할 방법을 원함) / `help_expert`(전문가와 함께 확인하길 원함) | Q4-M |
| `unclear_identityMatch` | `id_exact`(내 정보가 정확히 맞음) / `id_partial`(이름만 맞고 일부 다름) / `id_generic`(일반 호칭만 있음) / `id_other`(다른 사람·회사 이름) / `id_unchecked`(아직 확인하지 않음) | Q5-M |
| `unclear_otherRecipients` | `oth_only_me`(이 서류를 받은 사람이 나뿐인 것 같음) / `oth_unknown`(주변에서 받았는지 모름) / `oth_others`(주변 사람도 같은 서류를 받음) | Q5-M |
| `unclear_authenticityMark` | `mark_full`(기관명·번호·날짜·직인이 모두 있음) / `mark_partial`(일부 요소만 있음) / `mark_weak`(공식 요소 없이 개인 번호·일반 이메일뿐) / `mark_link_only`(링크·큐알 코드로만 안내함) / `mark_odd_text`(문장이 번역투이거나 어색함) | Q6-M |
| `unclear_officialCompare` | `cmp_unchecked`(공식 정보와 대조해 보지 않음) / `cmp_same`(공식 연락처와 대조해 보니 같음) / `cmp_diff`(공식 연락처와 대조해 보니 다름) | Q6-M |
| `unclear_moneyNature` | `nature_tax`(세금·세무 관련) / `nature_fine`(벌금·과태료·행정 수수료) / `nature_trade`(서비스 이용료·거래 대금) / `nature_deposit`(보증금·선납금·예치금) / `nature_unstated`(명목이 적혀 있지 않음) | Q7-M |
| `unclear_dealMemory` | `mem_yes`(해당하는 일이 실제로 있었음) / `mem_no`(해당하는 일이 기억나지 않음) / `mem_unsure`(있었는지 불확실함) | Q7-M |
| `unclear_amountScale` | `amt_under1m`(100만 동 미만) / `amt_1m_10m`(100만 동 이상 1천만 동 미만) / `amt_10m_100m`(1천만 동 이상 1억 동 미만) / `amt_over100m`(1억 동 이상) / `amt_unstated`(금액이 적혀 있지 않음) | Q8-M |
| `unclear_amountBasis` | `ab_itemized`(항목별 계산 내역이 있음) / `ab_total`(총액만 적혀 있음) / `ab_none`(금액도 내역도 없음) | Q8-M |
| `unclear_payee` | `payee_institution`(기관 이름의 계좌) / `payee_company`(회사 이름의 계좌) / `payee_person`(개인 이름의 계좌) / `payee_online`(링크·큐알 코드·앱 결제) / `payee_cash`(현금·상품권) | Q9-M |
| `unclear_payeeMatch` | `pm_same`(계좌 이름이 보낸 곳과 같음) / `pm_diff`(계좌 이름이 보낸 곳과 다름) / `pm_unknown`(받는 곳과 보낸 곳의 관계를 모름) / `pm_na`(받는 곳 이름이 따로 없음) | Q9-M |
| `unclear_pressureType` | `press_none`(압박 없음) / `press_deadline`(기한 안에 하라는 재촉) / `press_legal`(연체료·법적 조치 예고) / `press_threat`(계좌 동결·체포 등 강한 불이익) / `press_secret`(비밀 유지 요구) | Q10-M |
| `unclear_pressureChannel` | `ch_document`(서류로 전해짐) / `ch_message`(문자·메신저로 전해짐) / `ch_call`(전화로 전해짐) | Q10-M |
| `unclear_deadlineStatus` | `dl_none`(기한 표시 없음) / `dl_far`(기한이 여유 있음) / `dl_near`(기한이 가까움) / `dl_passed`(기한이 이미 지남) / `dl_verbal`(말·메시지로만 기한을 들음) | Q11-M |
| `unclear_deadlineStake` | `stake_none`(넘겨도 된다는 불이익 설명이 없음) / `stake_money`(넘기면 가산금·연체료가 붙는다고 함) / `stake_legal`(넘기면 법적 조치를 한다고 함) / `stake_unknown`(넘기면 어떻게 되는지 모름) | Q11-M |
| `unclear_actionTaken` | `act_nothing`(아무것도 하지 않음) / `act_contacted`(문의·답장·통화함) / `act_clicked`(링크 열람·앱 설치) / `act_sent_info`(개인정보·서류 제출) / `act_sent_money`(송금함) | Q12-M |
| `unclear_followUp` | `fu_none`(그 뒤 추가 연락이 없음) / `fu_more`(그 뒤에도 추가 요구가 계속됨) / `fu_cut`(그 뒤 상대가 연락을 끊음) | Q12-M |
| `unclear_evidenceKind` | `ev_original`(서류 원본 보관) / `ev_capture`(사진·캡처·대화 기록 보관) / `ev_payment`(송금 내역·영수증 보관) / `ev_partial`(일부를 잃어버림) / `ev_none`(남은 자료 없음) | Q13-M |
| `unclear_evidenceGoal` | `goal_verify`(진짜인지 대조해 보고 싶음) / `goal_report`(상담·신고에 쓸 자료로 정리하고 싶음) / `goal_recover`(낸 돈을 되찾는 방법을 알고 싶음) / `goal_prepare`(앞으로 모아 둘 자료를 알고 싶음) | Q13-M |

## C-2. 서류 제출·출석 서류

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `unclear_documentForm` | `paper_doc`(종이 서류) / `email_body`(이메일) / `chat_message`(문자·메신저) / `link_code`(링크·큐알 코드 안내) / `verbal_only`(말로만 들음) | Q1-D |
| `unclear_contentDetail` | `detail_full`(요구 내용이 구체적임) / `detail_brief`(요구 내용이 짧거나 모호함) / `detail_linked`(내용이 연결 화면에만 있음) / `detail_none`(받은 서류 없이 말로만 전달됨) | Q1-D |
| `unclear_senderClaim` | `public_agency`(공공기관(세무·행정·출입국·노동)) / `police_court`(공안·경찰·검찰·법원) / `bank_claim`(은행·금융회사) / `company_claim`(회사·통신·택배·플랫폼) / `unnamed_claim`(보낸 곳이 없거나 개인) | Q2-D |
| `unclear_senderRelation` | `rel_recent`(최근 그 곳에 신청·신고한 일이 있음) / `rel_none`(그 곳과 한 일이 없음) / `rel_customer`(평소 거래하던 곳) / `rel_unknown`(관계가 있는지 모름) | Q2-D |
| `unclear_contactPattern` | `first_contact`(처음 한 번 받음) / `once_earlier`(며칠 전에 한 번 받음) / `repeated_same`(같은 내용을 반복해서 받음) / `escalating_tone`(반복되며 표현이 점점 강해짐) / `after_visit`(전화·방문 뒤에 이어서 받음) | Q3-D |
| `unclear_requestLink` | `req_none`(내가 신청·문의한 일은 없음) / `req_related`(내가 신청·문의한 일 뒤에 받음) | Q3-D |
| `unclear_mainConcern` | `doubt_genuine_privacy`(진짜인지·개인정보를 내도 되는지 모르겠음) / `doubt_what`(무엇을 언제까지 내야 하는지 모르겠음) / `doubt_appear`(직접 가야 하는지 걱정함) / `doubt_done`(이미 응해서 불안함) / `doubt_none`(크게 걱정하지 않음) | Q4-D |
| `unclear_helpWanted` | `help_guide`(스스로 확인할 방법을 원함) / `help_expert`(전문가와 함께 확인하길 원함) | Q4-D |
| `unclear_identityMatch` | `id_exact`(내 정보가 정확히 맞음) / `id_partial`(이름만 맞고 일부 다름) / `id_generic`(일반 호칭만 있음) / `id_other`(다른 사람·회사 이름) / `id_unchecked`(아직 확인하지 않음) | Q5-D |
| `unclear_otherRecipients` | `oth_only_me`(이 서류를 받은 사람이 나뿐인 것 같음) / `oth_unknown`(주변에서 받았는지 모름) / `oth_others`(주변 사람도 같은 서류를 받음) | Q5-D |
| `unclear_authenticityMark` | `mark_full`(기관명·번호·날짜·직인이 모두 있음) / `mark_partial`(일부 요소만 있음) / `mark_weak`(공식 요소 없이 개인 번호·일반 이메일뿐) / `mark_link_only`(링크·큐알 코드로만 안내함) / `mark_odd_text`(문장이 번역투이거나 어색함) | Q6-D |
| `unclear_officialCompare` | `cmp_unchecked`(공식 정보와 대조해 보지 않음) / `cmp_same`(공식 연락처와 대조해 보니 같음) / `cmp_diff`(공식 연락처와 대조해 보니 다름) | Q6-D |
| `unclear_requestTarget` | `tgt_id_docs`(신분증·여권·체류 서류) / `tgt_docs_biz`(사업자·계약·거래 서류) / `tgt_statement`(경위서·설명서 같은 진술) / `tgt_appear`(직접 출석·방문) / `tgt_online`(사이트 접속·앱 설치) | Q7-D |
| `unclear_requestReason` | `reason_none`(왜 필요한지 설명이 없음) / `reason_stated`(왜 필요한지 서류에 설명됨) | Q7-D |
| `unclear_requestSpecificity` | `spec_full`(목록과 양식이 모두 있음) / `spec_list_only`(목록만 있고 양식 없음) / `spec_vague`(‘관련 서류’ 정도로만 적힘) / `spec_none`(내야 할 것이 적혀 있지 않음) / `spec_contact_only`(연락하라고만 함) | Q8-D |
| `unclear_prepState` | `prep_ready`(가진 서류로 준비할 수 있음) / `prep_hard`(일부는 구하기 어려움) / `prep_unknown`(준비할 수 있는지 모름) / `prep_na`(준비할 서류가 없음) | Q8-D |
| `unclear_deliveryMethod` | `deliver_visit`(지정 장소에 직접 방문) / `deliver_post`(우편·창구 접수) / `deliver_chat`(이메일·메신저로 제출) / `deliver_upload`(웹사이트에 올리기) / `deliver_call`(전화·화상 통화) | Q9-D |
| `unclear_venueCheck` | `venue_checked`(접수처가 공식 정보와 같음을 확인함) / `venue_unchecked`(접수처가 공식인지 확인하지 않음) / `venue_unknown`(접수처가 공식인지 확인할 방법을 모름) | Q9-D |
| `unclear_pressureType` | `press_none`(압박 없음) / `press_deadline`(기한 안에 하라는 재촉) / `press_legal`(연체료·법적 조치 예고) / `press_threat`(계좌 동결·체포 등 강한 불이익) / `press_secret`(비밀 유지 요구) | Q10-D |
| `unclear_pressureChannel` | `ch_document`(서류로 전해짐) / `ch_message`(문자·메신저로 전해짐) / `ch_call`(전화로 전해짐) | Q10-D |
| `unclear_deadlineStatus` | `dl_none`(기한 표시 없음) / `dl_far`(기한이 여유 있음) / `dl_near`(기한이 가까움) / `dl_passed`(기한이 이미 지남) / `dl_verbal`(말·메시지로만 기한을 들음) | Q11-D |
| `unclear_deadlineStake` | `stake_none`(넘겨도 된다는 불이익 설명이 없음) / `stake_money`(넘기면 가산금·연체료가 붙는다고 함) / `stake_legal`(넘기면 법적 조치를 한다고 함) / `stake_unknown`(넘기면 어떻게 되는지 모름) | Q11-D |
| `unclear_actionTaken` | `act_nothing`(아무것도 하지 않음) / `act_contacted`(문의·답장·통화함) / `act_clicked`(링크 열람·앱 설치) / `act_sent_info`(개인정보·서류 제출) / `act_sent_money`(송금함) | Q12-D |
| `unclear_followUp` | `fu_none`(그 뒤 추가 연락이 없음) / `fu_more`(그 뒤에도 추가 요구가 계속됨) / `fu_cut`(그 뒤 상대가 연락을 끊음) | Q12-D |
| `unclear_evidenceKind` | `ev_original`(서류 원본 보관) / `ev_capture`(사진·캡처·대화 기록 보관) / `ev_payment`(송금 내역·영수증 보관) / `ev_partial`(일부를 잃어버림) / `ev_none`(남은 자료 없음) | Q13-D |
| `unclear_evidenceGoal` | `goal_verify`(진짜인지 대조해 보고 싶음) / `goal_report`(상담·신고에 쓸 자료로 정리하고 싶음) / `goal_recover`(낸 돈을 되찾는 방법을 알고 싶음) / `goal_prepare`(앞으로 모아 둘 자료를 알고 싶음) | Q13-D |

## C-3. 내용을 모르는 서류

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `unclear_documentForm` | `paper_doc`(종이 서류) / `email_body`(이메일) / `chat_message`(문자·메신저) / `link_code`(링크·큐알 코드 안내) / `verbal_only`(말로만 들음) | Q1-N |
| `unclear_contentDetail` | `detail_full`(요구 내용이 구체적임) / `detail_brief`(요구 내용이 짧거나 모호함) / `detail_linked`(내용이 연결 화면에만 있음) / `detail_none`(받은 서류 없이 말로만 전달됨) | Q1-N |
| `unclear_senderClaim` | `public_agency`(공공기관(세무·행정·출입국·노동)) / `police_court`(공안·경찰·검찰·법원) / `bank_claim`(은행·금융회사) / `company_claim`(회사·통신·택배·플랫폼) / `unnamed_claim`(보낸 곳이 없거나 개인) | Q2-N |
| `unclear_senderRelation` | `rel_recent`(최근 그 곳에 신청·신고한 일이 있음) / `rel_none`(그 곳과 한 일이 없음) / `rel_customer`(평소 거래하던 곳) / `rel_unknown`(관계가 있는지 모름) | Q2-N |
| `unclear_contactPattern` | `first_contact`(처음 한 번 받음) / `once_earlier`(며칠 전에 한 번 받음) / `repeated_same`(같은 내용을 반복해서 받음) / `escalating_tone`(반복되며 표현이 점점 강해짐) / `after_visit`(전화·방문 뒤에 이어서 받음) | Q3-N |
| `unclear_requestLink` | `req_none`(내가 신청·문의한 일은 없음) / `req_related`(내가 신청·문의한 일 뒤에 받음) | Q3-N |
| `unclear_mainConcern` | `doubt_meaning`(무슨 뜻인지·응해야 하는지 모르겠음) / `doubt_genuine`(진짜인지 모르겠음) / `doubt_missing`(놓친 내용이 있을까 걱정함) / `doubt_done`(이미 응해서 불안함) / `doubt_none`(크게 걱정하지 않음) | Q4-N |
| `unclear_helpWanted` | `help_translate`(번역·설명을 원함) / `help_guide`(스스로 확인할 방법을 원함) / `help_expert`(전문가와 함께 확인하길 원함) | Q4-N |
| `unclear_identityMatch` | `id_exact`(내 정보가 정확히 맞음) / `id_partial`(이름만 맞고 일부 다름) / `id_generic`(일반 호칭만 있음) / `id_other`(다른 사람·회사 이름) / `id_unchecked`(아직 확인하지 않음) | Q5-N |
| `unclear_otherRecipients` | `oth_only_me`(이 서류를 받은 사람이 나뿐인 것 같음) / `oth_unknown`(주변에서 받았는지 모름) / `oth_others`(주변 사람도 같은 서류를 받음) | Q5-N |
| `unclear_authenticityMark` | `mark_full`(기관명·번호·날짜·직인이 모두 있음) / `mark_partial`(일부 요소만 있음) / `mark_weak`(공식 요소 없이 개인 번호·일반 이메일뿐) / `mark_link_only`(링크·큐알 코드로만 안내함) / `mark_odd_text`(문장이 번역투이거나 어색함) | Q6-N |
| `unclear_officialCompare` | `cmp_unchecked`(공식 정보와 대조해 보지 않음) / `cmp_same`(공식 연락처와 대조해 보니 같음) / `cmp_diff`(공식 연락처와 대조해 보니 다름) | Q6-N |
| `unclear_understandingLevel` | `und_most`(대부분 이해함) / `und_half`(절반쯤 이해함) / `und_little`(거의 이해하지 못함) / `und_language`(외국어라 읽기 어려움) / `und_blurry`(흐리거나 잘려 읽을 수 없음) | Q7-N |
| `unclear_helperNearby` | `helper_yes`(같이 봐 줄 사람이 있음) / `helper_none`(같이 봐 줄 사람이 없음) | Q7-N |
| `unclear_keyElement` | `key_law`(법령 이름·조항 번호) / `key_agency`(기관 이름·문서번호) / `key_money`(금액·계좌번호) / `key_date`(날짜·기한) / `key_contact`(링크·전화번호뿐) | Q8-N |
| `unclear_keyKnown` | `known_no`(처음 보는 이름·내용임) / `known_yes`(알고 있는 이름·내용임) | Q8-N |
| `unclear_impliedRequest` | `imp_money`(돈을 내라는 것 같음) / `imp_submit`(서류를 내거나 출석하라는 것 같음) / `imp_notice`(알리는 내용 같음) / `imp_contact`(연락하라는 말뿐임) / `imp_unknown`(판단하기 어려움) | Q9-N |
| `unclear_impliedBasis` | `im_text`(문장에 직접 적혀 있어서) / `im_feel`(분위기로 짐작해서) / `im_none`(근거를 찾지 못해서) | Q9-N |
| `unclear_pressureType` | `press_none`(압박 없음) / `press_deadline`(기한 안에 하라는 재촉) / `press_legal`(연체료·법적 조치 예고) / `press_threat`(계좌 동결·체포 등 강한 불이익) / `press_secret`(비밀 유지 요구) | Q10-N |
| `unclear_pressureChannel` | `ch_document`(서류로 전해짐) / `ch_message`(문자·메신저로 전해짐) / `ch_call`(전화로 전해짐) | Q10-N |
| `unclear_deadlineStatus` | `dl_none`(기한 표시 없음) / `dl_far`(기한이 여유 있음) / `dl_near`(기한이 가까움) / `dl_passed`(기한이 이미 지남) / `dl_verbal`(말·메시지로만 기한을 들음) | Q11-N |
| `unclear_deadlineStake` | `stake_none`(넘겨도 된다는 불이익 설명이 없음) / `stake_money`(넘기면 가산금·연체료가 붙는다고 함) / `stake_legal`(넘기면 법적 조치를 한다고 함) / `stake_unknown`(넘기면 어떻게 되는지 모름) | Q11-N |
| `unclear_actionTaken` | `act_nothing`(아무것도 하지 않음) / `act_contacted`(문의·답장·통화함) / `act_clicked`(링크 열람·앱 설치) / `act_sent_info`(개인정보·서류 제출) / `act_sent_money`(송금함) | Q12-N |
| `unclear_followUp` | `fu_none`(그 뒤 추가 연락이 없음) / `fu_more`(그 뒤에도 추가 요구가 계속됨) / `fu_cut`(그 뒤 상대가 연락을 끊음) | Q12-N |
| `unclear_evidenceKind` | `ev_original`(서류 원본 보관) / `ev_capture`(사진·캡처·대화 기록 보관) / `ev_payment`(송금 내역·영수증 보관) / `ev_partial`(일부를 잃어버림) / `ev_none`(남은 자료 없음) | Q13-N |
| `unclear_evidenceGoal` | `goal_verify`(진짜인지 대조해 보고 싶음) / `goal_report`(상담·신고에 쓸 자료로 정리하고 싶음) / `goal_recover`(낸 돈을 되찾는 방법을 알고 싶음) / `goal_prepare`(앞으로 모아 둘 자료를 알고 싶음) | Q13-N |

# D. 라우팅

1. 진입 화면에서 ①은 경로 M, ②는 경로 D, ③과 ④ 잘 모르겠습니다, ⑤ 직접 입력은 경로 N으로 이동한다.
2. ③ 알리는 내용 같습니다와 잘 모르겠습니다는 같은 경로 N이지만 선택 방식(`unclear_routeSelectionMode`)을 다르게 저장한다.
3. 경로 안에서는 Q1부터 Q13까지 순서대로 진행하며 생략하지 않는다. 1차(Q1~Q4) 종료 시 E-1 무료 결과, 2차(Q5~Q13) 종료 시 E-2 결과를 표시한다.
4. 분류 결과는 불확실한 문서 검토의 자체 결과로 유지한다. 전문 검토로 자동 이동하지 않으며, 답변을 전달하거나 그쪽 질문을 생략시키지 않는다.

---

# E. 결과

## E-1. 1차 무료 결과

마스터 1차 결과 구성을 따른다: **01 현재 상황**(판정 1줄 + 본문 1~2문장), **02 핵심 확인 결과**(카드 3개, 카드 하단 문구 약 48자 이내), **03 주요 위험 요소**(최대 4개). 04·05는 무료 1차에서 노출하지 않는다.

- 판정·본문 = Q4 선택지, 카드1 = Q1, 카드2 = Q2, 카드3 = Q3 선택지에서 가져온다(질문·선택지가 정해지면 문장이 정해지므로 조사 오류가 없다).
- 선택지 키 = 해당 선택지의 저장 필드 쌍.
- 직접 입력을 고른 항목은 해당 칸에 `직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.`를 표시한다(카드·본문 공통).

### E-1-M. 돈을 내라는 서류

**카드1 (서류의 형태)** — Q1-M

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_documentForm=paper_doc`, `unclear_contentDetail=detail_full` | 종이로 받은, 요구가 구체적인 납부 관련 서류입니다 | 28 |
| ② | `unclear_documentForm=email_body`, `unclear_contentDetail=detail_brief` | 이메일로 받은, 내용이 짧은 납부 관련 서류입니다 | 27 |
| ③ | `unclear_documentForm=chat_message`, `unclear_contentDetail=detail_full` | 문자·메신저로 받은, 요구가 구체적인 납부 관련 서류입니다 | 32 |
| ④ | `unclear_documentForm=link_code`, `unclear_contentDetail=detail_linked` | 링크·큐알 코드로만 안내받은 납부 관련 서류입니다 | 27 |
| ⑤ | `unclear_documentForm=verbal_only`, `unclear_contentDetail=detail_none` | 말로만 전해 들은 납부 관련 서류입니다 | 21 |

**카드2 (보낸 곳)** — Q2-M

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_senderClaim=public_agency`, `unclear_senderRelation=rel_recent` | 최근 신청한 공공기관 이름으로 온 납부 관련 서류입니다 | 30 |
| ② | `unclear_senderClaim=police_court`, `unclear_senderRelation=rel_none` | 공안·경찰·검찰·법원 이름으로 온 납부 관련 서류입니다 | 30 |
| ③ | `unclear_senderClaim=bank_claim`, `unclear_senderRelation=rel_customer` | 평소 거래하던 은행 이름으로 온 납부 관련 서류입니다 | 29 |
| ④ | `unclear_senderClaim=company_claim`, `unclear_senderRelation=rel_none` | 거래한 적 없는 업체 이름으로 온 납부 관련 서류입니다 | 30 |
| ⑤ | `unclear_senderClaim=unnamed_claim`, `unclear_senderRelation=rel_unknown` | 보낸 곳이 분명하지 않은 납부 관련 서류입니다 | 25 |

**카드3 (연락이 이어진 흐름)** — Q3-M

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_contactPattern=first_contact`, `unclear_requestLink=req_none` | 오늘이나 어제 처음 받은, 신청한 일 없는 납부 관련 서류입니다 | 35 |
| ② | `unclear_contactPattern=once_earlier`, `unclear_requestLink=req_related` | 내가 신청·문의한 뒤 한 번 받은 납부 관련 서류입니다 | 30 |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_requestLink=req_related` | 신청한 일과 이어져 반복해서 온 납부 관련 서류입니다 | 29 |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_requestLink=req_none` | 표현이 점점 강해진 납부 관련 서류입니다 | 22 |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_requestLink=req_none` | 전화·방문 뒤에 이어서 받은 납부 관련 서류입니다 | 27 |

**01 판정 + 본문** — Q4-M

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `unclear_mainConcern=doubt_genuine`, `unclear_helpWanted=help_guide` | 진짜 여부 확인이 먼저 필요한 납부 요구입니다 | 보낸 곳이 공식 자료와 같은지 확인하기 전에는 돈을 보내지 않는 것이 안전합니다. 서류에 적힌 번호가 아니라 공식 자료의 연락처로 확인해 보세요. |
| ② | `unclear_mainConcern=doubt_owed`, `unclear_helpWanted=help_expert` | 납부 의무와 금액의 근거 확인이 필요한 요구입니다 | 내야 하는 돈인지는 서류에 적힌 근거(조항·계약·부과 내역)와 금액 계산 내역으로 따져 볼 수 있습니다. 근거가 없다면 글로 요청하고, 혼자 판단하기 어렵다면 전문가와 함께 확인해 보세요. |
| ③ | `unclear_mainConcern=doubt_deadline`, `unclear_helpWanted=help_guide` | 기한의 근거 확인이 급한 납부 요구입니다 | 기한이 서류에 적혀 있는지, 언제까지인지부터 확인하세요. 기한이 임박해도 확인 없이 송금하는 것은 피하고 날짜를 기록해 두세요. |
| ④ | `unclear_mainConcern=doubt_done`, `unclear_helpWanted=help_expert` | 이미 응한 뒤라 추가 피해를 막는 것이 우선입니다 | 추가 요구가 오더라도 응하지 말고 송금·제출 내역과 대화를 그대로 보관하세요. 상황에 따라 은행·공식 기관 문의와 전문가 확인을 함께 살펴보세요. |
| ⑤ | `unclear_mainConcern=doubt_none`, `unclear_helpWanted=help_guide` | 급하지 않게 차분히 확인해 볼 수 있는 서류입니다 | 요구 사항이 있는지부터 읽어 보고, 없다면 보관해 두어도 됩니다. 나중에 필요할 수 있으니 받은 날짜와 경로를 적어 두세요. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (m_exposed) | `unclear_actionTaken` ∈ {act_sent_money, act_sent_info, act_clicked} 또는 `unclear_mainConcern` ∈ {doubt_done} | 이미 돈이나 개인정보를 보냈거나 링크를 열었다면 추가 피해를 막는 조치가 가장 급합니다 |
| 2 (m_payee) | `unclear_payee` ∈ {payee_person, payee_online, payee_cash} 또는 `unclear_payeeMatch` ∈ {pm_diff} | 개인 계좌·링크·현금으로 내라는 요구는 기관의 공식 납부 방법과 같은지 확인이 필요합니다 |
| 3 (m_threat) | `unclear_pressureType` ∈ {press_threat, press_secret} 또는 `unclear_contactPattern` ∈ {escalating_tone, repeated_same} | 강한 불이익을 말하거나 비밀·재촉을 요구하는 방식은 서두르게 만드는 신호일 수 있습니다 |
| 4 (m_sender) | `unclear_senderClaim` ∈ {unnamed_claim} 또는 `unclear_identityMatch` ∈ {id_generic, id_other} 또는 `unclear_authenticityMark` ∈ {mark_weak, mark_link_only, mark_odd_text} 또는 `unclear_officialCompare` ∈ {cmp_diff} | 보낸 곳이나 내 정보가 분명하지 않아 진짜 서류인지부터 확인이 필요합니다 |
| 5 (m_deadline) | `unclear_deadlineStatus` ∈ {dl_near, dl_passed, dl_verbal} 또는 `unclear_mainConcern` ∈ {doubt_deadline} | 기한이 가깝거나 지났거나 말로만 전해졌다면 기한의 근거 서류부터 확인해야 합니다 |
| 6 (m_amount) | `unclear_amountScale` ∈ {amt_10m_100m, amt_over100m, amt_unstated} 또는 `unclear_moneyNature` ∈ {nature_unstated} | 금액이 크거나 적혀 있지 않아 계산 근거를 서류로 확인해야 합니다 |
| 7 (m_evidence) | `unclear_evidenceKind` ∈ {ev_none, ev_partial} | 남은 자료가 부족해 지금 가진 자료를 먼저 보관해 두어야 합니다 |
| 기본 | 위 조건에 하나도 해당하지 않음 | 입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 돈을 보내기 전에 보낸 곳과 근거를 확인하세요 |

### E-1-D. 서류 제출·출석 서류

**카드1 (서류의 형태)** — Q1-D

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_documentForm=paper_doc`, `unclear_contentDetail=detail_full` | 종이로 받은, 요구가 구체적인 제출·출석 관련 서류입니다 | 31 |
| ② | `unclear_documentForm=email_body`, `unclear_contentDetail=detail_brief` | 이메일로 받은, 내용이 짧은 제출·출석 관련 서류입니다 | 30 |
| ③ | `unclear_documentForm=chat_message`, `unclear_contentDetail=detail_full` | 문자·메신저로 받은, 요구가 구체적인 제출·출석 관련 서류입니다 | 35 |
| ④ | `unclear_documentForm=link_code`, `unclear_contentDetail=detail_linked` | 링크·큐알 코드로만 안내받은 제출·출석 관련 서류입니다 | 30 |
| ⑤ | `unclear_documentForm=verbal_only`, `unclear_contentDetail=detail_none` | 말로만 전해 들은 제출·출석 관련 서류입니다 | 24 |

**카드2 (보낸 곳)** — Q2-D

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_senderClaim=public_agency`, `unclear_senderRelation=rel_recent` | 최근 신청한 공공기관 이름으로 온 제출·출석 관련 서류입니다 | 33 |
| ② | `unclear_senderClaim=police_court`, `unclear_senderRelation=rel_none` | 공안·경찰·검찰·법원 이름으로 온 제출·출석 관련 서류입니다 | 33 |
| ③ | `unclear_senderClaim=bank_claim`, `unclear_senderRelation=rel_customer` | 평소 거래하던 은행 이름으로 온 제출·출석 관련 서류입니다 | 32 |
| ④ | `unclear_senderClaim=company_claim`, `unclear_senderRelation=rel_none` | 거래한 적 없는 업체 이름으로 온 제출·출석 관련 서류입니다 | 33 |
| ⑤ | `unclear_senderClaim=unnamed_claim`, `unclear_senderRelation=rel_unknown` | 보낸 곳이 분명하지 않은 제출·출석 관련 서류입니다 | 28 |

**카드3 (연락이 이어진 흐름)** — Q3-D

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_contactPattern=first_contact`, `unclear_requestLink=req_none` | 오늘이나 어제 처음 받은, 신청한 일 없는 제출·출석 관련 서류입니다 | 38 |
| ② | `unclear_contactPattern=once_earlier`, `unclear_requestLink=req_related` | 내가 신청·문의한 뒤 한 번 받은 제출·출석 관련 서류입니다 | 33 |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_requestLink=req_related` | 신청한 일과 이어져 반복해서 온 제출·출석 관련 서류입니다 | 32 |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_requestLink=req_none` | 표현이 점점 강해진 제출·출석 관련 서류입니다 | 25 |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_requestLink=req_none` | 전화·방문 뒤에 이어서 받은 제출·출석 관련 서류입니다 | 30 |

**01 판정 + 본문** — Q4-D

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `unclear_mainConcern=doubt_genuine_privacy`, `unclear_helpWanted=help_guide` | 제출 전에 진짜 여부 확인이 필요한 서류입니다 | 서류를 내거나 개인정보를 보내기 전에 보낸 곳이 공식 자료와 같은지 확인하세요. 서류에 적힌 번호가 아니라 공식 자료의 연락처로 확인하는 것이 안전합니다. |
| ② | `unclear_mainConcern=doubt_what`, `unclear_helpWanted=help_expert` | 요구 서류와 기한의 근거 확인이 필요한 서류입니다 | 서류에 낼 것의 목록과 기한이 적혀 있는지 먼저 확인하세요. 적혀 있지 않다면 보낸 곳에 글로 요청해 근거를 받아 두세요. |
| ③ | `unclear_mainConcern=doubt_appear`, `unclear_helpWanted=help_expert` | 출석 요구의 근거 확인이 필요한 서류입니다 | 출석을 요구하는 근거와 장소·일정이 서류에 적혀 있는지부터 확인하세요. 근거가 확인되기 전에는 방문 약속을 서두르지 마세요. |
| ④ | `unclear_mainConcern=doubt_done`, `unclear_helpWanted=help_expert` | 이미 응한 뒤라 추가 응답 전에 확인이 필요합니다 | 무엇을 언제 보냈는지 정리해 두고 추가 요구에는 응하기 전에 확인하세요. 보낸 내용과 대화는 그대로 보관하세요. |
| ⑤ | `unclear_mainConcern=doubt_none`, `unclear_helpWanted=help_guide` | 차분히 확인해 볼 수 있는 서류입니다 | 요구 사항이 있는지부터 읽어 보고, 없다면 보관해 두어도 됩니다. 받은 날짜와 경로를 적어 두세요. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (d_exposed) | `unclear_actionTaken` ∈ {act_sent_money, act_sent_info, act_clicked} 또는 `unclear_mainConcern` ∈ {doubt_done} | 이미 개인정보나 서류를 보냈거나 링크를 열었다면 추가 피해를 막는 조치가 먼저입니다 |
| 2 (d_data) | `unclear_requestTarget` ∈ {tgt_id_docs} 또는 `unclear_deliveryMethod` ∈ {deliver_chat, deliver_call} | 신분 자료를 메신저나 온라인으로 내라는 요구라면 요구한 곳이 공식인지 먼저 확인해야 합니다 |
| 3 (d_threat) | `unclear_pressureType` ∈ {press_threat, press_secret} 또는 `unclear_contactPattern` ∈ {escalating_tone, repeated_same} | 강한 불이익이나 비밀·재촉이 있는 요구는 서두르게 만드는 신호일 수 있습니다 |
| 4 (d_sender) | `unclear_senderClaim` ∈ {unnamed_claim} 또는 `unclear_identityMatch` ∈ {id_generic, id_other} 또는 `unclear_authenticityMark` ∈ {mark_weak, mark_link_only, mark_odd_text} 또는 `unclear_officialCompare` ∈ {cmp_diff} | 보낸 곳이나 내 정보가 분명하지 않아 진짜 요구인지부터 확인이 필요합니다 |
| 5 (d_vague) | `unclear_requestSpecificity` ∈ {spec_vague, spec_none, spec_contact_only} 또는 `unclear_mainConcern` ∈ {doubt_what} | 무엇을 내야 하는지 분명하지 않아 공식 경로로 먼저 문의할 필요가 있습니다 |
| 6 (d_deadline) | `unclear_deadlineStatus` ∈ {dl_near, dl_passed, dl_verbal} | 제출이나 출석 기한이 가깝거나 지났거나 불분명해 기한의 근거를 먼저 확인해야 합니다 |
| 7 (d_appear) | `unclear_requestTarget` ∈ {tgt_appear, tgt_online} 또는 `unclear_venueCheck` ∈ {venue_unchecked} | 직접 방문이나 사이트 접속을 요구하고 있어 장소와 주소가 공식 자료와 같은지 확인이 필요합니다 |
| 기본 | 위 조건에 하나도 해당하지 않음 | 입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 제출하기 전에 요구가 공식인지 확인하세요 |

### E-1-N. 내용을 모르는 서류

**카드1 (서류의 형태)** — Q1-N

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_documentForm=paper_doc`, `unclear_contentDetail=detail_full` | 종이로 받은, 요구가 구체적인 내용이 불분명한 서류입니다 | 31 |
| ② | `unclear_documentForm=email_body`, `unclear_contentDetail=detail_brief` | 이메일로 받은, 내용이 짧은 내용이 불분명한 서류입니다 | 30 |
| ③ | `unclear_documentForm=chat_message`, `unclear_contentDetail=detail_full` | 문자·메신저로 받은, 요구가 구체적인 내용이 불분명한 서류입니다 | 35 |
| ④ | `unclear_documentForm=link_code`, `unclear_contentDetail=detail_linked` | 링크·큐알 코드로만 안내받은 내용이 불분명한 서류입니다 | 30 |
| ⑤ | `unclear_documentForm=verbal_only`, `unclear_contentDetail=detail_none` | 말로만 전해 들은 내용이 불분명한 서류입니다 | 24 |

**카드2 (보낸 곳)** — Q2-N

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_senderClaim=public_agency`, `unclear_senderRelation=rel_recent` | 최근 신청한 공공기관 이름으로 온 내용이 불분명한 서류입니다 | 33 |
| ② | `unclear_senderClaim=police_court`, `unclear_senderRelation=rel_none` | 공안·경찰·검찰·법원 이름으로 온 내용이 불분명한 서류입니다 | 33 |
| ③ | `unclear_senderClaim=bank_claim`, `unclear_senderRelation=rel_customer` | 평소 거래하던 은행 이름으로 온 내용이 불분명한 서류입니다 | 32 |
| ④ | `unclear_senderClaim=company_claim`, `unclear_senderRelation=rel_none` | 거래한 적 없는 업체 이름으로 온 내용이 불분명한 서류입니다 | 33 |
| ⑤ | `unclear_senderClaim=unnamed_claim`, `unclear_senderRelation=rel_unknown` | 보낸 곳이 분명하지 않은 내용이 불분명한 서류입니다 | 28 |

**카드3 (연락이 이어진 흐름)** — Q3-N

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_contactPattern=first_contact`, `unclear_requestLink=req_none` | 오늘이나 어제 처음 받은, 신청한 일 없는 내용이 불분명한 서류입니다 | 38 |
| ② | `unclear_contactPattern=once_earlier`, `unclear_requestLink=req_related` | 내가 신청·문의한 뒤 한 번 받은 내용이 불분명한 서류입니다 | 33 |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_requestLink=req_related` | 신청한 일과 이어져 반복해서 온 내용이 불분명한 서류입니다 | 32 |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_requestLink=req_none` | 표현이 점점 강해진 내용이 불분명한 서류입니다 | 25 |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_requestLink=req_none` | 전화·방문 뒤에 이어서 받은 내용이 불분명한 서류입니다 | 30 |

**01 판정 + 본문** — Q4-N

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `unclear_mainConcern=doubt_meaning`, `unclear_helpWanted=help_translate` | 내용을 이해하는 것이 먼저 필요한 서류입니다 | 무슨 뜻인지 모르는 서류에는 일단 응하지 않고 내용을 이해하는 것이 먼저입니다. 제목, 보낸 곳, 날짜 세 가지부터 정리해 보세요. |
| ② | `unclear_mainConcern=doubt_genuine`, `unclear_helpWanted=help_guide` | 진짜 여부 확인이 필요한 불분명한 서류입니다 | 보낸 곳이 공식 자료와 같은지 확인하기 전에는 링크나 번호로 연락하지 않는 것이 안전합니다. 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요. |
| ③ | `unclear_mainConcern=doubt_missing`, `unclear_helpWanted=help_guide` | 놓친 내용이 없는지 앞뒤 자료와 함께 확인이 필요한 상황입니다 | 이 서류와 이어지는 이전 절차나 문의 기록이 있는지 함께 놓고 보세요. 날짜와 번호가 이어지는지 확인하면 연결이 보일 수 있습니다. |
| ④ | `unclear_mainConcern=doubt_done`, `unclear_helpWanted=help_expert` | 이미 응한 뒤라 추가 응답 전에 확인이 필요한 상황입니다 | 무엇을 언제 보냈는지 정리해 두고 추가 연락에는 응하기 전에 확인하세요. 필요하면 전문가와 함께 살펴볼 수 있습니다. |
| ⑤ | `unclear_mainConcern=doubt_none`, `unclear_helpWanted=help_guide` | 차분히 서류를 분류해 볼 수 있는 상황입니다 | 걱정이 크지 않다면 서류를 보관하고 어떤 서류인지 차근차근 분류해 보세요. 요구 사항이 없다면 급하게 움직일 필요는 없습니다. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (n_exposed) | `unclear_actionTaken` ∈ {act_sent_money, act_sent_info, act_clicked} 또는 `unclear_mainConcern` ∈ {doubt_done} | 이미 돈이나 정보를 보냈거나 링크를 열었다면 추가 응답 전에 상황 정리가 먼저입니다 |
| 2 (n_sender) | `unclear_senderClaim` ∈ {unnamed_claim} 또는 `unclear_identityMatch` ∈ {id_generic, id_other} 또는 `unclear_authenticityMark` ∈ {mark_weak, mark_link_only, mark_odd_text} 또는 `unclear_officialCompare` ∈ {cmp_diff} | 보낸 곳과 내 정보가 분명하지 않은 서류라 응하기 전에 발신처부터 확인해야 합니다 |
| 3 (n_understand) | `unclear_understandingLevel` ∈ {und_little, und_language, und_blurry} 또는 `unclear_mainConcern` ∈ {doubt_meaning} | 내용을 충분히 이해하지 못한 상태라 핵심 부분부터 풀이하거나 번역받을 필요가 있습니다 |
| 4 (n_pressure) | `unclear_pressureType` ∈ {press_threat, press_secret, press_deadline, press_legal} 또는 `unclear_contactPattern` ∈ {escalating_tone, repeated_same} | 경고 문구나 재촉이 있어 서두르지 말고 근거를 확인할 필요가 있습니다 |
| 5 (n_hidden) | `unclear_impliedRequest` ∈ {imp_money, imp_submit, imp_contact} 또는 `unclear_keyElement` ∈ {key_money, key_contact} | 안내문처럼 보여도 돈·제출·연락을 요구하는 내용이 숨어 있을 수 있어 요구 사항을 따로 확인하세요 |
| 6 (n_deadline) | `unclear_deadlineStatus` ∈ {dl_near, dl_passed, dl_verbal} | 기한이 분명하지 않거나 가깝다면 서류에서 기한의 근거부터 찾아야 합니다 |
| 7 (n_evidence) | `unclear_evidenceKind` ∈ {ev_none, ev_partial} | 남은 자료가 부족해 서류의 제목·보낸 곳·날짜를 먼저 글로 정리해 두어야 합니다 |
| 기본 | 위 조건에 하나도 해당하지 않음 | 입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 서류를 보관하고 어떤 서류인지 먼저 분류해 보세요 |

## E-2. 2차 결과 (경로별)

2차 결과는 질문 하나당 소제목 1개와 선택지별 문장 1개로 구성한다. 선택지의 저장 필드 쌍이 키이며, 문장은 선택한 구체 값을 반영한다. 직접 입력을 고른 질문은 `직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.`를 표시한다.

### E-2-M. 돈을 내라는 서류

**내 정보의 기재** — Q5-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_otherRecipients=oth_only_me` | 정확히 맞는 정보가 제가 이전에 낸 정보라면 실제 절차나 거래와 이어지는지 확인해 보세요. 나만 받은 서류라면 실제 절차와 연결될 가능성을 보되, 정확하다고 진짜라는 뜻은 아니므로 보낸 곳 확인을 함께 하세요. |
| ② | `unclear_identityMatch=id_partial`, `unclear_otherRecipients=oth_unknown` | 일부만 맞다면 오래된 정보이거나 잘못 모은 정보일 수 있습니다. 주변에 같은 서류를 받은 사람이 있는지 물어보면 여러 사람에게 보낸 서류인지 가늠할 수 있습니다. |
| ③ | `unclear_identityMatch=id_generic`, `unclear_otherRecipients=oth_others` | 받는 사람이 특정되지 않았고 다른 사람도 같은 서류를 받았다면 여러 사람에게 같은 내용이 간 것일 가능성이 큽니다. 내 사정과 맞는 내용인지부터 따져 보세요. |
| ④ | `unclear_identityMatch=id_other`, `unclear_otherRecipients=oth_only_me` | 다른 이름이 적혀 있다면 잘못 보낸 서류일 수 있습니다. 응하지 말고 받은 경위를 기록한 뒤 보낸 곳에 공식 경로로 확인하세요. |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_otherRecipients=oth_unknown` | 이름·회사명·주소·번호가 맞는지 먼저 대조해 보세요. 하나라도 다르면 그 점을 메모하고, 주변에 같은 서류를 받은 사람이 있는지도 함께 물어보세요. |

**공식 문서 요소** — Q6-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_officialCompare=cmp_unchecked` | 공식 문서의 기본 요소가 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식은 흉내 낼 수 있으니 문서번호와 연락처를 공식 자료와 대조해 보세요. |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_officialCompare=cmp_same` | 빠진 요소가 무엇인지 적어 두세요. 연락처가 같더라도 같은 기관이 보낸 다른 문서와 비교하면 차이가 드러나는 경우가 있습니다. |
| ③ | `unclear_authenticityMark=mark_weak`, `unclear_officialCompare=cmp_diff` | 공식 요소가 없고 연락처도 공식 정보와 다르다면 근거로 삼기 어렵습니다. 문서번호나 담당자를 글로 요청해 보고, 답이 없다면 응하지 않는 것이 안전합니다. |
| ④ | `unclear_authenticityMark=mark_link_only`, `unclear_officialCompare=cmp_unchecked` | 링크나 큐알 코드는 열기 전에 확인이 먼저입니다. 같은 기관의 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요. |
| ⑤ | `unclear_authenticityMark=mark_odd_text`, `unclear_officialCompare=cmp_same` | 연락처가 같아도 문체가 어색하다면 외국어를 옮긴 것이거나 흉내 낸 서류일 수 있습니다. 어색한 부분을 표시해 두고 같은 기관의 다른 안내문과 비교해 보세요. |

**돈의 성격** — Q7-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_moneyNature=nature_tax`, `unclear_dealMemory=mem_yes` | 세금 명목이고 신고·납부한 기억이 있다면 납세 통지나 세무기관 공식 안내와 금액을 대조해 보세요. 세금 검토에서 이어서 확인할 수 있습니다. |
| ② | `unclear_moneyNature=nature_fine`, `unclear_dealMemory=mem_no` | 부과받을 일이 기억나지 않는다면 부과 근거와 이의 제기 방법이 서류에 있는지 확인하세요. 행정문서 검토에서 이어서 볼 수 있습니다. |
| ③ | `unclear_moneyNature=nature_trade`, `unclear_dealMemory=mem_unsure` | 계약이나 이용 내역, 입금 기록과 대조해 실제 거래가 있었는지 확인하세요. 확인 전에 서둘러 보내지 마세요. |
| ④ | `unclear_moneyNature=nature_deposit`, `unclear_dealMemory=mem_yes` | 약속한 계약이 서류로 있는지가 우선입니다. 임대나 매매와 관련되어 보이면 부동산 검토에서 이어서 확인할 수 있습니다. |
| ⑤ | `unclear_moneyNature=nature_unstated`, `unclear_dealMemory=mem_no` | 명목 없이 돈만 요구한다면 무엇에 대한 돈인지 먼저 확인이 필요합니다. 명목을 글로 요청하고 답이 없다면 응하지 않는 것이 안전합니다. |

**금액 규모** — Q8-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_amountScale=amt_under1m`, `unclear_amountBasis=ab_itemized` | 금액이 크지 않고 내역이 있어도 근거 없이 내는 습관은 피하세요. 내역의 각 항목이 계약이나 공식 자료와 맞는지 대조해 보세요. |
| ② | `unclear_amountScale=amt_1m_10m`, `unclear_amountBasis=ab_total` | 중간 정도의 금액이면서 내역이 없다면 부과 근거와 계산 내역을 먼저 요청하세요. 내역이 오기 전에는 송금을 미루세요. |
| ③ | `unclear_amountScale=amt_10m_100m`, `unclear_amountBasis=ab_total` | 큰 금액은 송금 전에 근거 서류와 계약, 입금 기록을 모두 대조하는 것이 좋습니다. 내역 없이 총액만 요구하는 점은 따로 확인이 필요합니다. |
| ④ | `unclear_amountScale=amt_over100m`, `unclear_amountBasis=ab_itemized` | 매우 큰 금액은 단독으로 판단하지 말고 전문가 확인을 권합니다. 내역의 각 항목을 근거 서류와 대조해 정리해 두세요. |
| ⑤ | `unclear_amountScale=amt_unstated`, `unclear_amountBasis=ab_none` | 금액이 없는 납부 요구는 계산 근거부터 확인이 필요합니다. 금액을 글로 요청하고 구두로 들은 금액은 날짜와 함께 기록하세요. |

**입금 방식** — Q9-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_payee=payee_institution`, `unclear_payeeMatch=pm_same` | 계좌 이름이 보낸 곳과 같더라도 공식 안내의 납부 방법과 같은지 확인하세요. 공식 안내는 해당 기관의 사이트에서 찾을 수 있습니다. |
| ② | `unclear_payee=payee_company`, `unclear_payeeMatch=pm_diff` | 보낸 곳과 계좌 이름이 다르다면 특히 확인이 필요합니다. 그 회사와 실제 거래가 있었는지, 왜 다른 이름으로 받는지 공식 경로로 물어보세요. |
| ③ | `unclear_payee=payee_person`, `unclear_payeeMatch=pm_unknown` | 기관이나 회사 명의가 아닌 개인 계좌로 보내라는 요구는 특히 확인이 필요합니다. 보내기 전에 보낸 곳의 공식 납부 방법을 확인하세요. |
| ④ | `unclear_payee=payee_online`, `unclear_payeeMatch=pm_unknown` | 링크나 앱 결제는 열기 전에 주소와 설치 경로가 공식인지 확인이 필요합니다. 공식 사이트에 직접 접속해 같은 결제 안내가 있는지 보세요. |
| ⑤ | `unclear_payee=payee_cash`, `unclear_payeeMatch=pm_na` | 현금이나 상품권은 되돌리기 어렵고 기록이 남지 않아 신중해야 합니다. 보내기 전에 공식 경로로 확인하고 전문가 확인을 살펴보세요. |

**압박의 방식** — Q10-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureChannel=ch_document` | 압박이 없는 안내라면 급하게 움직일 이유는 서류에서 확인되지 않습니다. 요구 사항이 있는지 천천히 읽어 보세요. |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureChannel=ch_message` | 기한을 재촉하는 연락이라면 그 기한의 근거가 서류에 있는지 확인하세요. 메시지로만 오는 기한은 날짜와 함께 기록해 두세요. |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureChannel=ch_document` | 불이익을 예고하는 문구라면 어떤 근거로 어떤 절차가 이어지는지 서류에 적혀 있는지 확인하세요. 근거가 없다면 공식 경로로 문의가 필요합니다. |
| ④ | `unclear_pressureType=press_threat`, `unclear_pressureChannel=ch_call` | 강한 불이익을 앞세워 즉시 응하라는 연락은 그 자체로 의심할 만한 점입니다. 전화를 끊고 공식 연락처로 확인하며 통화 기록은 그대로 보관하세요. |
| ⑤ | `unclear_pressureType=press_secret`, `unclear_pressureChannel=ch_message` | 비밀을 요구하는 것은 주변의 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람이나 전문가와 상의하고 메시지는 지우지 말고 보관하세요. |

**기한** — Q11-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineStake=stake_none` | 기한이 없다면 서두를 이유가 서류에서는 확인되지 않습니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요. |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineStake=stake_money` | 여유가 있다면 그 안에 근거 확인을 마칠 수 있습니다. 가산금이 서류의 어떤 근거에서 나오는지도 함께 확인하고 기한 날짜를 달력에 표시해 두세요. |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineStake=stake_legal` | 기한이 가깝다면 확인과 준비를 동시에 시작해야 합니다. 법적 조치의 근거가 서류에 있는지 보고 연장이 가능한지 공식 경로로 문의하세요. |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineStake=stake_unknown` | 기한이 지났더라도 바로 포기하지 말고 가능한 조치를 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관하세요. |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineStake=stake_legal` | 서류 없이 말로만 정한 기한은 근거가 확인되지 않은 상태입니다. 기한의 근거 서류를 요청하고 요청한 기록을 남기세요. |

**이미 한 조치** — Q12-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_followUp=fu_none` | 아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 확인부터 시작하세요. |
| ② | `unclear_actionTaken=act_contacted`, `unclear_followUp=fu_more` | 연락이 이어지는 상태라면 무엇을 말했는지 날짜와 함께 정리하세요. 요구에 응하기 전에 보낸 곳 확인이 먼저이고, 서류에 적힌 연락처가 맞는지도 확인하세요. |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_followUp=fu_none` | 추가 입력은 멈추고 설치한 앱은 지우는 것을 살펴보세요. 입력한 정보가 있다면 어떤 정보인지 기록하고, 이후 이상한 연락이 오는지 지켜보세요. |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_followUp=fu_more` | 보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 신분증이나 계좌 정보를 보냈다면 관련 기관이나 은행에 알리는 방법을 확인하세요. |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_followUp=fu_cut` | 연락이 끊겼더라도 송금 내역과 받는 계좌 정보를 보관하고 가능한 한 빨리 은행에 문의하세요. 대화와 영수증은 지우지 말고 사기 검토에서 이어서 확인할 수 있습니다. |

**남은 자료** — Q13-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceGoal=goal_verify` | 원본이 있으면 검토가 가장 정확해집니다. 원본은 훼손하지 말고 사본을 만들어 대조에 사용하세요. |
| ② | `unclear_evidenceKind=ev_capture`, `unclear_evidenceGoal=goal_report` | 글자가 모두 보이고 날짜·상대 번호가 확인되도록 순서대로 정리해 두세요. 원본 대화는 지우지 말고 화면 캡처도 함께 보관하세요. |
| ③ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceGoal=goal_recover` | 송금 내역은 금액·날짜·받는 계좌가 보이게 보관하세요. 이 자료는 은행 문의와 이후 확인에서 가장 중요하게 쓰입니다. |
| ④ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceGoal=goal_verify` | 잃어버린 부분은 발급처나 통신사에 다시 요청할 수 있는지 알아보세요. 기억나는 내용은 날짜와 함께 먼저 글로 적어 두세요. |
| ⑤ | `unclear_evidenceKind=ev_none`, `unclear_evidenceGoal=goal_prepare` | 자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 확인에 도움이 됩니다. 전문가 진행에서 함께 정리할 수 있습니다. |

### E-2-D. 서류 제출·출석 서류

**내 정보의 기재** — Q5-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_otherRecipients=oth_only_me` | 정확히 맞는 정보가 제가 이전에 낸 정보라면 실제 절차나 거래와 이어지는지 확인해 보세요. 나만 받은 서류라면 실제 절차와 연결될 가능성을 보되, 정확하다고 진짜라는 뜻은 아니므로 보낸 곳 확인을 함께 하세요. |
| ② | `unclear_identityMatch=id_partial`, `unclear_otherRecipients=oth_unknown` | 일부만 맞다면 오래된 정보이거나 잘못 모은 정보일 수 있습니다. 주변에 같은 서류를 받은 사람이 있는지 물어보면 여러 사람에게 보낸 서류인지 가늠할 수 있습니다. |
| ③ | `unclear_identityMatch=id_generic`, `unclear_otherRecipients=oth_others` | 받는 사람이 특정되지 않았고 다른 사람도 같은 서류를 받았다면 여러 사람에게 같은 내용이 간 것일 가능성이 큽니다. 내 사정과 맞는 내용인지부터 따져 보세요. |
| ④ | `unclear_identityMatch=id_other`, `unclear_otherRecipients=oth_only_me` | 다른 이름이 적혀 있다면 잘못 보낸 서류일 수 있습니다. 응하지 말고 받은 경위를 기록한 뒤 보낸 곳에 공식 경로로 확인하세요. |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_otherRecipients=oth_unknown` | 이름·회사명·주소·번호가 맞는지 먼저 대조해 보세요. 하나라도 다르면 그 점을 메모하고, 주변에 같은 서류를 받은 사람이 있는지도 함께 물어보세요. |

**공식 문서 요소** — Q6-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_officialCompare=cmp_unchecked` | 공식 문서의 기본 요소가 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식은 흉내 낼 수 있으니 문서번호와 연락처를 공식 자료와 대조해 보세요. |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_officialCompare=cmp_same` | 빠진 요소가 무엇인지 적어 두세요. 연락처가 같더라도 같은 기관이 보낸 다른 문서와 비교하면 차이가 드러나는 경우가 있습니다. |
| ③ | `unclear_authenticityMark=mark_weak`, `unclear_officialCompare=cmp_diff` | 공식 요소가 없고 연락처도 공식 정보와 다르다면 근거로 삼기 어렵습니다. 문서번호나 담당자를 글로 요청해 보고, 답이 없다면 응하지 않는 것이 안전합니다. |
| ④ | `unclear_authenticityMark=mark_link_only`, `unclear_officialCompare=cmp_unchecked` | 링크나 큐알 코드는 열기 전에 확인이 먼저입니다. 같은 기관의 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요. |
| ⑤ | `unclear_authenticityMark=mark_odd_text`, `unclear_officialCompare=cmp_same` | 연락처가 같아도 문체가 어색하다면 외국어를 옮긴 것이거나 흉내 낸 서류일 수 있습니다. 어색한 부분을 표시해 두고 같은 기관의 다른 안내문과 비교해 보세요. |

**요구하는 것** — Q7-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_requestTarget=tgt_id_docs`, `unclear_requestReason=reason_none` | 신분 자료는 요구한 곳이 공식인지 확인한 뒤 필요한 항목만 내는 것이 안전합니다. 용도 설명이 없다면 용도를 글로 요청하세요. |
| ② | `unclear_requestTarget=tgt_docs_biz`, `unclear_requestReason=reason_stated` | 설명된 이유가 공식 자료와 맞는지, 요구한 곳이 그 서류를 요구할 권한이 있는지 확인하세요. 제출 전에 사본을 만들어 두세요. |
| ③ | `unclear_requestTarget=tgt_statement`, `unclear_requestReason=reason_none` | 진술은 한번 내면 바꾸기 어려울 수 있어 내용을 신중히 정리하세요. 작성한 내용은 사본을 남기고 낼 곳을 먼저 확인하세요. |
| ④ | `unclear_requestTarget=tgt_appear`, `unclear_requestReason=reason_stated` | 일시와 장소가 공식 자료와 맞는지 확인하세요. 혼자 가기 어렵다면 동행이나 통역을 구하는 것도 방법입니다. |
| ⑤ | `unclear_requestTarget=tgt_online`, `unclear_requestReason=reason_none` | 접속 주소와 앱 설치 경로가 공식인지 먼저 확인하세요. 공식 사이트에 직접 접속해 같은 안내가 있는지 보세요. |

**요구의 구체성** — Q8-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_requestSpecificity=spec_full`, `unclear_prepState=prep_ready` | 목록과 양식이 갖춰져 있다면 같은 양식이 공식 자료에도 있는지 대조해 보세요. 빠진 서류가 없는지 내 보관 서류와 비교하세요. |
| ② | `unclear_requestSpecificity=spec_list_only`, `unclear_prepState=prep_hard` | 양식이 없다면 형식을 어떻게 맞출지 공식 경로로 확인하세요. 구하기 어려운 서류는 대체 가능한지 함께 물어보고 문의 내용은 기록해 두세요. |
| ③ | `unclear_requestSpecificity=spec_vague`, `unclear_prepState=prep_unknown` | 무엇을 내야 하는지 불분명한 요구는 구체적인 목록을 글로 요청하세요. 막연한 요구에 서류를 한꺼번에 보내는 것은 피하세요. |
| ④ | `unclear_requestSpecificity=spec_none`, `unclear_prepState=prep_na` | 요구 내용이 없다면 요구의 근거부터 확인해야 합니다. 서류의 목적과 담당자를 글로 요청해 보세요. |
| ⑤ | `unclear_requestSpecificity=spec_contact_only`, `unclear_prepState=prep_unknown` | 연락만 하라는 서류는 연락을 유도하는 방식일 수 있습니다. 서류의 번호가 아닌 공식 연락처로 사실 여부를 먼저 확인하세요. |

**제출·출석 방법** — Q9-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_deliveryMethod=deliver_visit`, `unclear_venueCheck=venue_checked` | 공식 정보와 주소가 같다면 방문 전에 필요한 서류와 시간을 다시 확인하세요. 방문 증빙이 될 접수 자료를 받아 두세요. |
| ② | `unclear_deliveryMethod=deliver_post`, `unclear_venueCheck=venue_unchecked` | 우편이나 창구 접수라면 주소와 창구가 공식 자료와 같은지 먼저 확인하고 접수 증빙을 받아 두세요. 보낸 날짜와 수령 확인 자료를 보관하는 것이 좋습니다. |
| ③ | `unclear_deliveryMethod=deliver_chat`, `unclear_venueCheck=venue_unchecked` | 이메일이나 메신저 제출은 받는 주소가 공식인지 확인이 필요합니다. 공식 자료에 나온 주소와 같은지 비교하세요. |
| ④ | `unclear_deliveryMethod=deliver_upload`, `unclear_venueCheck=venue_unknown` | 접속 주소가 공식 사이트인지 먼저 확인하세요. 공식 사이트에서 직접 찾아 들어가 같은 절차가 있는지 보세요. |
| ⑤ | `unclear_deliveryMethod=deliver_call`, `unclear_venueCheck=venue_unknown` | 통화로 서류나 정보를 말하는 것은 기록이 남지 않아 신중해야 합니다. 통화 요구는 서류로 다시 받을 수 있는지 요청하세요. |

**압박의 방식** — Q10-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureChannel=ch_document` | 압박이 없는 안내라면 급하게 움직일 이유는 서류에서 확인되지 않습니다. 요구 사항이 있는지 천천히 읽어 보세요. |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureChannel=ch_message` | 기한을 재촉하는 연락이라면 그 기한의 근거가 서류에 있는지 확인하세요. 메시지로만 오는 기한은 날짜와 함께 기록해 두세요. |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureChannel=ch_document` | 불이익을 예고하는 문구라면 어떤 근거로 어떤 절차가 이어지는지 서류에 적혀 있는지 확인하세요. 근거가 없다면 공식 경로로 문의가 필요합니다. |
| ④ | `unclear_pressureType=press_threat`, `unclear_pressureChannel=ch_call` | 강한 불이익을 앞세워 즉시 응하라는 연락은 그 자체로 의심할 만한 점입니다. 전화를 끊고 공식 연락처로 확인하며 통화 기록은 그대로 보관하세요. |
| ⑤ | `unclear_pressureType=press_secret`, `unclear_pressureChannel=ch_message` | 비밀을 요구하는 것은 주변의 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람이나 전문가와 상의하고 메시지는 지우지 말고 보관하세요. |

**기한** — Q11-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineStake=stake_none` | 기한이 없다면 서두를 이유가 서류에서는 확인되지 않습니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요. |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineStake=stake_money` | 여유가 있다면 그 안에 근거 확인을 마칠 수 있습니다. 가산금이 서류의 어떤 근거에서 나오는지도 함께 확인하고 기한 날짜를 달력에 표시해 두세요. |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineStake=stake_legal` | 기한이 가깝다면 확인과 준비를 동시에 시작해야 합니다. 법적 조치의 근거가 서류에 있는지 보고 연장이 가능한지 공식 경로로 문의하세요. |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineStake=stake_unknown` | 기한이 지났더라도 바로 포기하지 말고 가능한 조치를 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관하세요. |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineStake=stake_legal` | 서류 없이 말로만 정한 기한은 근거가 확인되지 않은 상태입니다. 기한의 근거 서류를 요청하고 요청한 기록을 남기세요. |

**이미 한 조치** — Q12-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_followUp=fu_none` | 아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 확인부터 시작하세요. |
| ② | `unclear_actionTaken=act_contacted`, `unclear_followUp=fu_more` | 연락이 이어지는 상태라면 무엇을 말했는지 날짜와 함께 정리하세요. 요구에 응하기 전에 보낸 곳 확인이 먼저이고, 서류에 적힌 연락처가 맞는지도 확인하세요. |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_followUp=fu_none` | 추가 입력은 멈추고 설치한 앱은 지우는 것을 살펴보세요. 입력한 정보가 있다면 어떤 정보인지 기록하고, 이후 이상한 연락이 오는지 지켜보세요. |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_followUp=fu_more` | 보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 신분증이나 계좌 정보를 보냈다면 관련 기관이나 은행에 알리는 방법을 확인하세요. |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_followUp=fu_cut` | 연락이 끊겼더라도 송금 내역과 받는 계좌 정보를 보관하고 가능한 한 빨리 은행에 문의하세요. 대화와 영수증은 지우지 말고 사기 검토에서 이어서 확인할 수 있습니다. |

**남은 자료** — Q13-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceGoal=goal_verify` | 원본이 있으면 검토가 가장 정확해집니다. 원본은 훼손하지 말고 사본을 만들어 대조에 사용하세요. |
| ② | `unclear_evidenceKind=ev_capture`, `unclear_evidenceGoal=goal_report` | 글자가 모두 보이고 날짜·상대 번호가 확인되도록 순서대로 정리해 두세요. 원본 대화는 지우지 말고 화면 캡처도 함께 보관하세요. |
| ③ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceGoal=goal_recover` | 송금 내역은 금액·날짜·받는 계좌가 보이게 보관하세요. 이 자료는 은행 문의와 이후 확인에서 가장 중요하게 쓰입니다. |
| ④ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceGoal=goal_verify` | 잃어버린 부분은 발급처나 통신사에 다시 요청할 수 있는지 알아보세요. 기억나는 내용은 날짜와 함께 먼저 글로 적어 두세요. |
| ⑤ | `unclear_evidenceKind=ev_none`, `unclear_evidenceGoal=goal_prepare` | 자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 확인에 도움이 됩니다. 전문가 진행에서 함께 정리할 수 있습니다. |

### E-2-N. 내용을 모르는 서류

**내 정보의 기재** — Q5-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_otherRecipients=oth_only_me` | 정확히 맞는 정보가 제가 이전에 낸 정보라면 실제 절차나 거래와 이어지는지 확인해 보세요. 나만 받은 서류라면 실제 절차와 연결될 가능성을 보되, 정확하다고 진짜라는 뜻은 아니므로 보낸 곳 확인을 함께 하세요. |
| ② | `unclear_identityMatch=id_partial`, `unclear_otherRecipients=oth_unknown` | 일부만 맞다면 오래된 정보이거나 잘못 모은 정보일 수 있습니다. 주변에 같은 서류를 받은 사람이 있는지 물어보면 여러 사람에게 보낸 서류인지 가늠할 수 있습니다. |
| ③ | `unclear_identityMatch=id_generic`, `unclear_otherRecipients=oth_others` | 받는 사람이 특정되지 않았고 다른 사람도 같은 서류를 받았다면 여러 사람에게 같은 내용이 간 것일 가능성이 큽니다. 내 사정과 맞는 내용인지부터 따져 보세요. |
| ④ | `unclear_identityMatch=id_other`, `unclear_otherRecipients=oth_only_me` | 다른 이름이 적혀 있다면 잘못 보낸 서류일 수 있습니다. 응하지 말고 받은 경위를 기록한 뒤 보낸 곳에 공식 경로로 확인하세요. |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_otherRecipients=oth_unknown` | 이름·회사명·주소·번호가 맞는지 먼저 대조해 보세요. 하나라도 다르면 그 점을 메모하고, 주변에 같은 서류를 받은 사람이 있는지도 함께 물어보세요. |

**공식 문서 요소** — Q6-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_officialCompare=cmp_unchecked` | 공식 문서의 기본 요소가 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식은 흉내 낼 수 있으니 문서번호와 연락처를 공식 자료와 대조해 보세요. |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_officialCompare=cmp_same` | 빠진 요소가 무엇인지 적어 두세요. 연락처가 같더라도 같은 기관이 보낸 다른 문서와 비교하면 차이가 드러나는 경우가 있습니다. |
| ③ | `unclear_authenticityMark=mark_weak`, `unclear_officialCompare=cmp_diff` | 공식 요소가 없고 연락처도 공식 정보와 다르다면 근거로 삼기 어렵습니다. 문서번호나 담당자를 글로 요청해 보고, 답이 없다면 응하지 않는 것이 안전합니다. |
| ④ | `unclear_authenticityMark=mark_link_only`, `unclear_officialCompare=cmp_unchecked` | 링크나 큐알 코드는 열기 전에 확인이 먼저입니다. 같은 기관의 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요. |
| ⑤ | `unclear_authenticityMark=mark_odd_text`, `unclear_officialCompare=cmp_same` | 연락처가 같아도 문체가 어색하다면 외국어를 옮긴 것이거나 흉내 낸 서류일 수 있습니다. 어색한 부분을 표시해 두고 같은 기관의 다른 안내문과 비교해 보세요. |

**이해 정도** — Q7-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_understandingLevel=und_most`, `unclear_helperNearby=helper_yes` | 대부분 이해했다면 이해되지 않는 나머지 부분을 표시해 두세요. 그 부분이 핵심일 수 있어 물어볼 때 함께 보여 주면 좋습니다. |
| ② | `unclear_understandingLevel=und_half`, `unclear_helperNearby=helper_none` | 이해한 부분과 모르는 부분을 나누어 적어 보세요. 모르는 부분만 전문가에게 가져가면 시간이 줄어듭니다. |
| ③ | `unclear_understandingLevel=und_little`, `unclear_helperNearby=helper_none` | 이해하지 못한 서류에는 응하지 않고 먼저 내용을 풀이받는 것이 안전합니다. 제목과 번호, 날짜를 먼저 정리하세요. |
| ④ | `unclear_understandingLevel=und_language`, `unclear_helperNearby=helper_yes` | 중요한 부분부터 번역을 받아 원본과 함께 보관하세요. 지인에게는 한 부분씩 나누어 번역을 받으면 확인하기 쉽습니다. |
| ⑤ | `unclear_understandingLevel=und_blurry`, `unclear_helperNearby=helper_none` | 글자가 모두 보이도록 밝은 곳에서 다시 찍어 두세요. 원본이 있다면 다시 확인할 수 있게 보관하세요. |

**눈에 띄는 요소** — Q8-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_keyElement=key_law`, `unclear_keyKnown=known_no` | 법령이나 조항 번호가 나온다면 그 조항이 무엇을 요구하는지 공식 자료로 확인해 보세요. 낯선 법령이라면 이름과 번호를 그대로 적어 두세요. |
| ② | `unclear_keyElement=key_agency`, `unclear_keyKnown=known_yes` | 알고 있는 기관이라도 그 기관의 공식 연락처로 서류가 맞는지 확인하세요. 서류에 적힌 연락처는 쓰지 마세요. |
| ③ | `unclear_keyElement=key_money`, `unclear_keyKnown=known_yes` | 금액이나 계좌가 보이는 서류는 돈을 요구하는 내용일 수 있습니다. 아는 거래와 이어지는지 대조하고 송금 전에 근거를 먼저 확인하세요. |
| ④ | `unclear_keyElement=key_date`, `unclear_keyKnown=known_no` | 날짜가 보인다면 기한인지, 단순 발행일인지 구분해 보세요. 기한이라면 그 근거부터 확인하세요. |
| ⑤ | `unclear_keyElement=key_contact`, `unclear_keyKnown=known_no` | 내용 없이 연락처만 있다면 연락을 유도하는 방식일 수 있습니다. 연락하기 전에 공식 자료로 먼저 확인하세요. |

**요구의 느낌** — Q9-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_impliedRequest=imp_money`, `unclear_impliedBasis=im_text` | 돈을 요구하는 것 같다면 납부 관련 서류로 보고 보낸 곳과 근거를 먼저 확인하세요. 확인 전에는 송금하지 마세요. |
| ② | `unclear_impliedRequest=imp_submit`, `unclear_impliedBasis=im_feel` | 제출이나 출석을 요구하는 것 같다면 무엇을 언제까지 해야 하는지 서류에서 찾아보세요. 공식 연락처로 사실 여부를 확인하세요. |
| ③ | `unclear_impliedRequest=imp_notice`, `unclear_impliedBasis=im_feel` | 안내 성격이라면 요구 사항이 없는지 한 번 더 읽어 보세요. 요구가 없다면 보관해 두어도 충분합니다. |
| ④ | `unclear_impliedRequest=imp_contact`, `unclear_impliedBasis=im_text` | 연락만 하라는 서류는 연락하기 전에 보낸 곳 확인이 먼저입니다. 서류의 연락처가 아닌 공식 연락처를 쓰세요. |
| ⑤ | `unclear_impliedRequest=imp_unknown`, `unclear_impliedBasis=im_none` | 판단이 어렵다면 서류를 그대로 보관하고 제목·보낸 곳·날짜부터 정리하세요. 이후 전문가 진행에서 함께 분류할 수 있습니다. |

**압박의 방식** — Q10-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureChannel=ch_document` | 압박이 없는 안내라면 급하게 움직일 이유는 서류에서 확인되지 않습니다. 요구 사항이 있는지 천천히 읽어 보세요. |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureChannel=ch_message` | 기한을 재촉하는 연락이라면 그 기한의 근거가 서류에 있는지 확인하세요. 메시지로만 오는 기한은 날짜와 함께 기록해 두세요. |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureChannel=ch_document` | 불이익을 예고하는 문구라면 어떤 근거로 어떤 절차가 이어지는지 서류에 적혀 있는지 확인하세요. 근거가 없다면 공식 경로로 문의가 필요합니다. |
| ④ | `unclear_pressureType=press_threat`, `unclear_pressureChannel=ch_call` | 강한 불이익을 앞세워 즉시 응하라는 연락은 그 자체로 의심할 만한 점입니다. 전화를 끊고 공식 연락처로 확인하며 통화 기록은 그대로 보관하세요. |
| ⑤ | `unclear_pressureType=press_secret`, `unclear_pressureChannel=ch_message` | 비밀을 요구하는 것은 주변의 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람이나 전문가와 상의하고 메시지는 지우지 말고 보관하세요. |

**기한** — Q11-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineStake=stake_none` | 기한이 없다면 서두를 이유가 서류에서는 확인되지 않습니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요. |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineStake=stake_money` | 여유가 있다면 그 안에 근거 확인을 마칠 수 있습니다. 가산금이 서류의 어떤 근거에서 나오는지도 함께 확인하고 기한 날짜를 달력에 표시해 두세요. |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineStake=stake_legal` | 기한이 가깝다면 확인과 준비를 동시에 시작해야 합니다. 법적 조치의 근거가 서류에 있는지 보고 연장이 가능한지 공식 경로로 문의하세요. |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineStake=stake_unknown` | 기한이 지났더라도 바로 포기하지 말고 가능한 조치를 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관하세요. |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineStake=stake_legal` | 서류 없이 말로만 정한 기한은 근거가 확인되지 않은 상태입니다. 기한의 근거 서류를 요청하고 요청한 기록을 남기세요. |

**이미 한 조치** — Q12-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_followUp=fu_none` | 아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 확인부터 시작하세요. |
| ② | `unclear_actionTaken=act_contacted`, `unclear_followUp=fu_more` | 연락이 이어지는 상태라면 무엇을 말했는지 날짜와 함께 정리하세요. 요구에 응하기 전에 보낸 곳 확인이 먼저이고, 서류에 적힌 연락처가 맞는지도 확인하세요. |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_followUp=fu_none` | 추가 입력은 멈추고 설치한 앱은 지우는 것을 살펴보세요. 입력한 정보가 있다면 어떤 정보인지 기록하고, 이후 이상한 연락이 오는지 지켜보세요. |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_followUp=fu_more` | 보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 신분증이나 계좌 정보를 보냈다면 관련 기관이나 은행에 알리는 방법을 확인하세요. |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_followUp=fu_cut` | 연락이 끊겼더라도 송금 내역과 받는 계좌 정보를 보관하고 가능한 한 빨리 은행에 문의하세요. 대화와 영수증은 지우지 말고 사기 검토에서 이어서 확인할 수 있습니다. |

**남은 자료** — Q13-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceGoal=goal_verify` | 원본이 있으면 검토가 가장 정확해집니다. 원본은 훼손하지 말고 사본을 만들어 대조에 사용하세요. |
| ② | `unclear_evidenceKind=ev_capture`, `unclear_evidenceGoal=goal_report` | 글자가 모두 보이고 날짜·상대 번호가 확인되도록 순서대로 정리해 두세요. 원본 대화는 지우지 말고 화면 캡처도 함께 보관하세요. |
| ③ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceGoal=goal_recover` | 송금 내역은 금액·날짜·받는 계좌가 보이게 보관하세요. 이 자료는 은행 문의와 이후 확인에서 가장 중요하게 쓰입니다. |
| ④ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceGoal=goal_verify` | 잃어버린 부분은 발급처나 통신사에 다시 요청할 수 있는지 알아보세요. 기억나는 내용은 날짜와 함께 먼저 글로 적어 두세요. |
| ⑤ | `unclear_evidenceKind=ev_none`, `unclear_evidenceGoal=goal_prepare` | 자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 확인에 도움이 됩니다. 전문가 진행에서 함께 정리할 수 있습니다. |

## E-3. 결과에서의 연결 안내 (권유 문구, 강제 아님)

| 연결 | 표시 조건 | 고객 화면 문구 |
|---|---|---|
| 세금 검토 | `unclear_moneyNature` ∈ {nature_tax} | 세금과 관련된 서류로 보인다면 세금 검토에서 이어서 확인해 보실 수 있습니다. |
| 행정문서 검토 | `unclear_senderClaim` ∈ {public_agency} 또는 `unclear_moneyNature` ∈ {nature_fine} 또는 `unclear_requestLink` ∈ {req_related} | 행정 절차와 관련된 서류로 보인다면 행정문서 검토에서 이어서 확인해 보실 수 있습니다. |
| 부동산 검토 | `unclear_moneyNature` ∈ {nature_deposit} 또는 `unclear_requestTarget` ∈ {tgt_docs_biz} | 부동산·계약과 관련된 서류로 보인다면 부동산 검토에서 이어서 확인해 보실 수 있습니다. |
| 사기 검토 | `unclear_senderClaim` ∈ {police_court} 또는 `unclear_actionTaken` ∈ {act_sent_money, act_sent_info, act_clicked} 또는 `unclear_pressureType` ∈ {press_threat, press_secret} | 사기나 사칭이 의심되는 상황일 수 있으니 사기 검토에서 이어서 확인해 보실 수 있습니다. |
| 전문가 진행 | `unclear_deadlineStatus` ∈ {dl_passed} 또는 `unclear_amountScale` ∈ {amt_over100m} 또는 `unclear_understandingLevel` ∈ {und_little, und_language} | 기한이 지났거나 금액이 크거나 내용을 이해하기 어렵다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |
| 서류 첨부 | 모든 결과 화면 | 받으신 서류를 첨부하면 더 정확히 확인할 수 있습니다. |

- 연결 문구는 권유이며, 고객이 선택하지 않아도 결과와 리포트는 그대로 제공한다.
- 전문 검토로 가는 연결은 한 줄 안내와 링크(/verify/tax, /verify/admin, /verify/real-estate, /verify/fraud)만 제공한다.
- 자동 세션 전환, 답변 값 전달, 상대 서비스 질문 생략은 하지 않는다. 링크를 따라가면 그쪽 서비스의 질문을 처음부터 진행한다.
- 연결 문구 우선순위: 사기 검토 > 세금 검토 > 행정문서 검토 > 부동산 검토 > 전문가 진행. 해당 조건이 여러 개면 최대 2개까지 표시한다.

## E-4. 빈 값·직접 입력 처리

- 해당 질문에 직접 입력을 고른 경우: 해당 칸에는 직접 입력 안내 문장을 표시하고, 입력한 원문은 내부 저장(`..._detail`)에만 쌓아 이후 질문 개선에 쓴다.
- 값이 비어 있으면 해당 칸·문장 전체를 생략한다(빈 조사나 빈 괄호를 남기지 않는다).

---

# F. 자동 점검 결과 (실행 결과)

| 점검 항목 | 돈을 내라는 서류 | 서류 제출·출석 서류 | 내용을 모르는 서류 |
|---|---:|---:|---:|
| 1차 질문 수 | 4 | 4 | 4 |
| 2차 질문 수 | 9 | 9 | 9 |
| 2차 비율 | 69.2% | 69.2% | 69.2% |
| 2차 ÷ 1차 | 2.25배 | 2.25배 | 2.25배 |
| 질문 수(전체) | 13 | 13 | 13 |
| 선택지 총수(직접 입력 포함) | 78 | 78 | 78 |
| 선택지별 저장 필드 수(최소) | 2 | 2 | 2 |

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
| 값→고객 라벨 누락 | 0건(사용 값 166개) |
| 같은 값 다른 라벨 / 같은 필드 안 라벨 중복 | 0건 |
| 총 오류 / 경고 | 0 / 0 |

---

# G. 값 → 고객 표시 문구

내부 값은 화면·마이페이지·알림 어디에도 그대로 노출하지 않고 아래 문구로만 표시한다.

| 내부 값 | 고객 화면 표시 |
|---|---|
| `ab_itemized` | 항목별 계산 내역이 있음 |
| `ab_none` | 금액도 내역도 없음 |
| `ab_total` | 총액만 적혀 있음 |
| `act_clicked` | 링크 열람·앱 설치 |
| `act_contacted` | 문의·답장·통화함 |
| `act_nothing` | 아무것도 하지 않음 |
| `act_sent_info` | 개인정보·서류 제출 |
| `act_sent_money` | 송금함 |
| `after_visit` | 전화·방문 뒤에 이어서 받음 |
| `amt_10m_100m` | 1천만 동 이상 1억 동 미만 |
| `amt_1m_10m` | 100만 동 이상 1천만 동 미만 |
| `amt_over100m` | 1억 동 이상 |
| `amt_under1m` | 100만 동 미만 |
| `amt_unstated` | 금액이 적혀 있지 않음 |
| `bank_claim` | 은행·금융회사 |
| `ch_call` | 전화로 전해짐 |
| `ch_document` | 서류로 전해짐 |
| `ch_message` | 문자·메신저로 전해짐 |
| `chat_message` | 문자·메신저 |
| `cmp_diff` | 공식 연락처와 대조해 보니 다름 |
| `cmp_same` | 공식 연락처와 대조해 보니 같음 |
| `cmp_unchecked` | 공식 정보와 대조해 보지 않음 |
| `company_claim` | 회사·통신·택배·플랫폼 |
| `deliver_call` | 전화·화상 통화 |
| `deliver_chat` | 이메일·메신저로 제출 |
| `deliver_post` | 우편·창구 접수 |
| `deliver_upload` | 웹사이트에 올리기 |
| `deliver_visit` | 지정 장소에 직접 방문 |
| `detail_brief` | 요구 내용이 짧거나 모호함 |
| `detail_full` | 요구 내용이 구체적임 |
| `detail_linked` | 내용이 연결 화면에만 있음 |
| `detail_none` | 받은 서류 없이 말로만 전달됨 |
| `direct_input` | 직접 입력 |
| `direct_input_detail` | 직접 입력(상세) |
| `dl_far` | 기한이 여유 있음 |
| `dl_near` | 기한이 가까움 |
| `dl_none` | 기한 표시 없음 |
| `dl_passed` | 기한이 이미 지남 |
| `dl_verbal` | 말·메시지로만 기한을 들음 |
| `doubt_appear` | 직접 가야 하는지 걱정함 |
| `doubt_deadline` | 기한을 놓칠까 걱정함 |
| `doubt_done` | 이미 응해서 불안함 |
| `doubt_genuine` | 진짜인지 모르겠음 |
| `doubt_genuine_privacy` | 진짜인지·개인정보를 내도 되는지 모르겠음 |
| `doubt_meaning` | 무슨 뜻인지·응해야 하는지 모르겠음 |
| `doubt_missing` | 놓친 내용이 있을까 걱정함 |
| `doubt_none` | 크게 걱정하지 않음 |
| `doubt_owed` | 내야 하는 돈인지·금액이 맞는지 모르겠음 |
| `doubt_what` | 무엇을 언제까지 내야 하는지 모르겠음 |
| `email_body` | 이메일 |
| `escalating_tone` | 반복되며 표현이 점점 강해짐 |
| `ev_capture` | 사진·캡처·대화 기록 보관 |
| `ev_none` | 남은 자료 없음 |
| `ev_original` | 서류 원본 보관 |
| `ev_partial` | 일부를 잃어버림 |
| `ev_payment` | 송금 내역·영수증 보관 |
| `first_contact` | 처음 한 번 받음 |
| `fu_cut` | 그 뒤 상대가 연락을 끊음 |
| `fu_more` | 그 뒤에도 추가 요구가 계속됨 |
| `fu_none` | 그 뒤 추가 연락이 없음 |
| `goal_prepare` | 앞으로 모아 둘 자료를 알고 싶음 |
| `goal_recover` | 낸 돈을 되찾는 방법을 알고 싶음 |
| `goal_report` | 상담·신고에 쓸 자료로 정리하고 싶음 |
| `goal_verify` | 진짜인지 대조해 보고 싶음 |
| `help_expert` | 전문가와 함께 확인하길 원함 |
| `help_guide` | 스스로 확인할 방법을 원함 |
| `help_translate` | 번역·설명을 원함 |
| `helper_none` | 같이 봐 줄 사람이 없음 |
| `helper_yes` | 같이 봐 줄 사람이 있음 |
| `id_exact` | 내 정보가 정확히 맞음 |
| `id_generic` | 일반 호칭만 있음 |
| `id_other` | 다른 사람·회사 이름 |
| `id_partial` | 이름만 맞고 일부 다름 |
| `id_unchecked` | 아직 확인하지 않음 |
| `im_feel` | 분위기로 짐작해서 |
| `im_none` | 근거를 찾지 못해서 |
| `im_text` | 문장에 직접 적혀 있어서 |
| `imp_contact` | 연락하라는 말뿐임 |
| `imp_money` | 돈을 내라는 것 같음 |
| `imp_notice` | 알리는 내용 같음 |
| `imp_submit` | 서류를 내거나 출석하라는 것 같음 |
| `imp_unknown` | 판단하기 어려움 |
| `key_agency` | 기관 이름·문서번호 |
| `key_contact` | 링크·전화번호뿐 |
| `key_date` | 날짜·기한 |
| `key_law` | 법령 이름·조항 번호 |
| `key_money` | 금액·계좌번호 |
| `known_no` | 처음 보는 이름·내용임 |
| `known_yes` | 알고 있는 이름·내용임 |
| `link_code` | 링크·큐알 코드 안내 |
| `mark_full` | 기관명·번호·날짜·직인이 모두 있음 |
| `mark_link_only` | 링크·큐알 코드로만 안내함 |
| `mark_odd_text` | 문장이 번역투이거나 어색함 |
| `mark_partial` | 일부 요소만 있음 |
| `mark_weak` | 공식 요소 없이 개인 번호·일반 이메일뿐 |
| `mem_no` | 해당하는 일이 기억나지 않음 |
| `mem_unsure` | 있었는지 불확실함 |
| `mem_yes` | 해당하는 일이 실제로 있었음 |
| `nature_deposit` | 보증금·선납금·예치금 |
| `nature_fine` | 벌금·과태료·행정 수수료 |
| `nature_tax` | 세금·세무 관련 |
| `nature_trade` | 서비스 이용료·거래 대금 |
| `nature_unstated` | 명목이 적혀 있지 않음 |
| `notice_only` | 알리는 내용 같음 |
| `once_earlier` | 며칠 전에 한 번 받음 |
| `oth_only_me` | 이 서류를 받은 사람이 나뿐인 것 같음 |
| `oth_others` | 주변 사람도 같은 서류를 받음 |
| `oth_unknown` | 주변에서 받았는지 모름 |
| `paper_doc` | 종이 서류 |
| `pay` | 돈을 내라는 내용 같음 |
| `payee_cash` | 현금·상품권 |
| `payee_company` | 회사 이름의 계좌 |
| `payee_institution` | 기관 이름의 계좌 |
| `payee_online` | 링크·큐알 코드·앱 결제 |
| `payee_person` | 개인 이름의 계좌 |
| `pm_diff` | 계좌 이름이 보낸 곳과 다름 |
| `pm_na` | 받는 곳 이름이 따로 없음 |
| `pm_same` | 계좌 이름이 보낸 곳과 같음 |
| `pm_unknown` | 받는 곳과 보낸 곳의 관계를 모름 |
| `police_court` | 공안·경찰·검찰·법원 |
| `prep_hard` | 일부는 구하기 어려움 |
| `prep_na` | 준비할 서류가 없음 |
| `prep_ready` | 가진 서류로 준비할 수 있음 |
| `prep_unknown` | 준비할 수 있는지 모름 |
| `press_deadline` | 기한 안에 하라는 재촉 |
| `press_legal` | 연체료·법적 조치 예고 |
| `press_none` | 압박 없음 |
| `press_secret` | 비밀 유지 요구 |
| `press_threat` | 계좌 동결·체포 등 강한 불이익 |
| `public_agency` | 공공기관(세무·행정·출입국·노동) |
| `reason_none` | 왜 필요한지 설명이 없음 |
| `reason_stated` | 왜 필요한지 서류에 설명됨 |
| `rel_customer` | 평소 거래하던 곳 |
| `rel_none` | 그 곳과 한 일이 없음 |
| `rel_recent` | 최근 그 곳에 신청·신고한 일이 있음 |
| `rel_unknown` | 관계가 있는지 모름 |
| `repeated_same` | 같은 내용을 반복해서 받음 |
| `req_none` | 내가 신청·문의한 일은 없음 |
| `req_related` | 내가 신청·문의한 일 뒤에 받음 |
| `selected` | 직접 선택함 |
| `spec_contact_only` | 연락하라고만 함 |
| `spec_full` | 목록과 양식이 모두 있음 |
| `spec_list_only` | 목록만 있고 양식 없음 |
| `spec_none` | 내야 할 것이 적혀 있지 않음 |
| `spec_vague` | ‘관련 서류’ 정도로만 적힘 |
| `stake_legal` | 넘기면 법적 조치를 한다고 함 |
| `stake_money` | 넘기면 가산금·연체료가 붙는다고 함 |
| `stake_none` | 넘겨도 된다는 불이익 설명이 없음 |
| `stake_unknown` | 넘기면 어떻게 되는지 모름 |
| `submit_or_appear` | 서류 제출·출석 요구 같음 |
| `tgt_appear` | 직접 출석·방문 |
| `tgt_docs_biz` | 사업자·계약·거래 서류 |
| `tgt_id_docs` | 신분증·여권·체류 서류 |
| `tgt_online` | 사이트 접속·앱 설치 |
| `tgt_statement` | 경위서·설명서 같은 진술 |
| `und_blurry` | 흐리거나 잘려 읽을 수 없음 |
| `und_half` | 절반쯤 이해함 |
| `und_language` | 외국어라 읽기 어려움 |
| `und_little` | 거의 이해하지 못함 |
| `und_most` | 대부분 이해함 |
| `unnamed_claim` | 보낸 곳이 없거나 개인 |
| `unsure` | 잘 모르겠음 |
| `venue_checked` | 접수처가 공식 정보와 같음을 확인함 |
| `venue_unchecked` | 접수처가 공식인지 확인하지 않음 |
| `venue_unknown` | 접수처가 공식인지 확인할 방법을 모름 |
| `verbal_only` | 말로만 들음 |

---

# H. 작성 기록과 확정 기준 대비 달라진 점

- **승인 범위**: 이 서비스는 분류·진입 보조 서비스이며 행정문서 안의 CASE_06과 합치지 않는다. 결과는 한 줄 안내와 링크까지만 제공하고 세션 이전은 하지 않는다(승인된 DQ-U1, DQ-U2).
- **v2 재설계(2026.10.11)**: 한 질문은 한 가지만 묻고(서류 형태, 보낸 곳, 연락 흐름, 내 정보 기재, 공식 요소, 압박, 기한, 이미 한 조치, 남은 자료), 선택지는 서로 겹치지 않게 했다. 선택지마다 저장하는 두 필드는 구체 값과 그것을 묶은 상위 분류(예: 세무기관 → 공공기관, 계좌 이체 → 입금 방식 분류)로 하여 구체 → 상위의 2층으로 쌓이게 했다.
- **경로별 심화**: 돈 경로(M)는 돈의 성격·금액 규모·입금 방식, 제출·출석 경로(D)는 요구 대상·구체성·제출 방법, 불명 경로(N)는 이해 정도·눈에 띄는 요소·요구의 느낌을 추가로 묻는다. 1차(Q1~Q4) 4개, 2차 9개로 2차 비중이 약 69%이다.
- **금액 구간**: 금액 구간은 베트남 동 기준이다.
- **법령 근거 상태**: 행정처리법 제73조(결정 이행 10일), 민원법 제9조(90일), 정부령 제30/2020/ND-CP호 제8조는 이차 자료로 확인했으며 원문 대조가 필요하다. 형사소송법 제145조, 행정처리법 제74조, 행정소송법 제116조(소 제기 1년)는 확인하지 못해 사용하지 않았다. 질문과 선택지에는 법령 조항을 쓰지 않았다.

# K. 리포트 고정 문구

서류를 첨부하면 더 정확히 확인할 수 있습니다.

# I. AI 리포트 참고 사항

제목: 참고 사항
부제: 고객님의 선택 내용에 맞춰 정리한 확인·준비 안내입니다.
확인 기준: 확인 기준일 2026.10.10 · 법령과 제도는 개정될 수 있으므로 시행 시점의 확인이 필요합니다.
고정 문구: 위 내용은 일반 참고 정보이며, 서류의 진위나 법적 효력, 개별 사안의 책임을 판단하지 않습니다. 서류 원본 확인과 전문가 검토를 거쳐 판단됩니다.
먼저 표시: 먼저 확인
접수 건수: 접수된 자료: {n}건

## 출처를 모르는 서류를 받은 경우

제목: 서류에 응하기 전에 먼저 할 것
흐름: 서류 원본 보관 → 날짜·기한 표시 확인 → 공식 연락처로 발신처 확인 → 응하기 전 전문가 확인 [일반 실무]
- 받은 서류의 날짜, 보낸 곳, 기한 표시를 먼저 확인해 두세요. [3]
- 서류에 적힌 번호나 링크가 아니라 공식 자료에 나온 연락처로 사실 여부를 확인하세요. [4]
- 확인이 끝나기 전에는 돈이나 개인정보를 보내지 마세요. [일반 실무]

## 경로 1: 돈을 내라는 서류

### ① 준비 자료 체크

1. 받은 서류 원본 또는 캡처 / 금액, 계좌, 기한이 적힌 부분을 그대로 보존합니다. [일반 실무]
2. 발신처 확인 기록 / 공식 연락처로 확인한 날짜와 답변을 남깁니다. [4]
3. 관련 계약서나 이용 내역 / 요구하는 돈이 실제 약속과 맞는지 대조합니다. [일반 실무]
4. 세금 관련일 경우 세무기관 안내 / 납세 통지 내용과 비교합니다. [5][6]
5. 이미 낸 돈이 있다면 송금 내역 / 날짜와 금액을 함께 정리합니다. [일반 실무]

### ② 확인 순서

흐름: 서류 보관 → 발신처 확인 → 금액 근거 확인 → 응하기 전 전문가에게 전달 [일반 실무]

### ③ 서류 간 대조표

- 서류의 발신 기관 ↔ 공식 자료의 기관 정보 / 이름과 연락처가 같은지 [4]
- 요구 금액 ↔ 계약·이용 내역 / 금액의 근거가 있는지 [일반 실무]
- 입금 계좌 명의 ↔ 발신 기관 이름 / 같은 곳인지 [4]
- 서류의 기한 ↔ 받은 날짜 / 기한이 합리적인지 [1]

### ④ 시점별 정리

흐름: 서류를 받은 날 → 처음 연락한 날 → 요구한 기한 → 지금까지 한 조치 [일반 실무]
표 아래: 날짜를 순서대로 적어 두면 기한이 새로 생겼는지 알 수 있습니다. [일반 실무]

### ⑤ 자주 놓치는 점

- 기한이 가깝다는 말에 근거 서류를 확인하지 않고 송금한 경우 [4]
- 서류에 적힌 연락처로만 확인해 사실을 가리지 못한 경우 [4]
- 세무기관을 사칭한 납부 요구를 공식 경로로 확인하지 않은 경우 [5][6]

### ⑥ 전문가에게 가져갈 질문

1. 제가 받은 납부 요구가 진짜인지 어떤 순서로 확인하면 되나요? [일반 실무]
2. 이 금액의 근거가 맞는지 어떤 자료로 대조할 수 있나요? [일반 실무]
3. 이미 일부를 냈다면 어떤 자료를 가져가야 하나요? [일반 실무]

## 경로 2: 서류 제출·출석 서류

### ① 준비 자료 체크

1. 받은 서류 원본 / 제출·출석 요구가 적힌 부분과 기한을 그대로 보존합니다. [3]
2. 발신처 확인 기록 / 공식 연락처로 확인한 날짜와 답변을 남깁니다. [4]
3. 요구한 서류 목록 / 무엇을 어디에 내야 하는지 정리합니다. [일반 실무]
4. 제출할 서류의 사본 / 내기 전에 사본을 먼저 만들어 둡니다. [일반 실무]
5. 처분이나 결정이 있다면 결정서 / 이행 기간과 불복 기간 확인에 쓰입니다. [1][2]

### ② 확인 순서

흐름: 서류 보관 → 발신처 확인 → 요구 내용과 기한 확인 → 제출·출석 전 전문가에게 전달 [일반 실무]

### ③ 서류 간 대조표

- 서류의 발신 기관 ↔ 공식 자료의 기관 정보 / 이름과 연락처가 같은지 [4]
- 서류의 구성 요소 ↔ 공문의 기본 구성 / 기관명, 번호, 날짜, 직인이 있는지 [3]
- 출석 일시·장소 ↔ 공식 안내 / 같은 곳인지 [4]
- 요구 서류 목록 ↔ 내 보관 서류 / 빠진 것이 없는지 [일반 실무]

### ④ 시점별 정리

흐름: 서류를 받은 날 → 확인한 날 → 제출·출석 기한 → 준비한 서류 → 낸 날 [일반 실무]
표 아래: 처분이 있는 서류라면 받은 날부터 이행·불복 기간을 따져야 할 수 있어 날짜가 중요합니다. [1][2]

### ⑤ 자주 놓치는 점

- 무엇을 내야 하는지 분명하지 않은데 확인하지 않고 서류를 보낸 경우 [일반 실무]
- 서류의 기한이 가까운데 날짜를 기록하지 않은 경우 [1]
- 처분 서류를 받고 불복 기간을 확인하지 않은 경우 [2]

### ⑥ 전문가에게 가져갈 질문

1. 이 제출·출석 요구가 공식인지 어떻게 확인하나요? [일반 실무]
2. 제출해야 할 서류와 낼 곳은 어디인가요? [일반 실무]
3. 기한이 지났다면 어떤 방법이 있나요? [1]

## 경로 3: 내용을 모르는 서류

### ① 준비 자료 체크

1. 받은 서류 원본 또는 캡처 / 제목, 보낸 곳, 날짜가 보이게 보존합니다. [3]
2. 서류에 나온 번호들 / 문서번호, 계좌, 사건번호를 구분해 표시합니다. [3]
3. 눈에 띄는 용어의 뜻 / 법령이나 기관 이름이 있으면 따로 적어 둡니다. [일반 실무]
4. 번역본(필요한 경우) / 중요한 부분부터 번역을 받아 원본과 함께 보관합니다. [일반 실무]
5. 받은 경위 기록 / 언제 어디서 받았는지 적어 둡니다. [일반 실무]

### ② 확인 순서

흐름: 서류 보관 → 제목·보낸 곳·날짜 정리 → 분야 분류 → 해당 검토로 이어서 확인 [일반 실무]

### ③ 서류 간 대조표

- 서류의 제목 ↔ 내용 / 무엇에 대한 서류인지 [3]
- 서류의 보낸 곳 ↔ 공식 자료의 기관 정보 / 같은 곳인지 [4]
- 서류의 번호 ↔ 내가 아는 사건·거래 / 연결되는 것이 있는지 [일반 실무]

### ④ 시점별 정리

흐름: 서류를 받은 날 → 받기 전의 일 (절차, 문의, 거래) → 지금까지 한 일 [일반 실무]
표 아래: 받기 전의 일과 연결해 보면 어떤 분야의 서류인지 짐작할 수 있습니다. [일반 실무]

### ⑤ 자주 놓치는 점

- 내용을 모르는 서류의 링크를 눌러 개인정보를 입력한 경우 [4]
- 기한이 없는 안내문을 긴급한 요구로 오해해 서둘러 대응한 경우 [4]
- 받은 경위와 날짜를 기록하지 않은 경우 [일반 실무]

### ⑥ 전문가에게 가져갈 질문

1. 이 서류는 어떤 분야의 서류인가요? [일반 실무]
2. 응해야 하는 서류인지, 보관만 하면 되는지 어떻게 구분하나요? [일반 실무]
3. 번역이 필요하다면 어느 부분부터 받아야 하나요? [일반 실무]

# J. 근거·출처

확인일: 2026.10.10

| 번호 | 자료 | 발행처 | 성격 | URL | 비고 |
|---|---|---|---|---|---|
| 1 | 행정처리법 제15/2012/QH13호 제73조(결정의 이행: 받은 날부터 10일 이내) | 베트남 국회 | 법령(이차 자료로 확인) | 원문 링크 확인 중 | 원문 대조 필요. 제74조는 확인하지 못해 사용하지 않음 |
| 2 | 민원법 제02/2011/QH13호 제9조(민원 제기 기간 90일) | 베트남 국회 | 법령(이차 자료로 확인) | https://apolatlegal.com/laws/law-on-complaints-2011/ | 원문 대조 필요. 사안별 기간이 다를 수 있음 |
| 3 | 정부령 제30/2020/ND-CP호 제8조(공문의 구성 요소) | 베트남 정부 | 법령(이차 자료로 확인) | 원문 링크 확인 중 | 원문 대조 필요 |
| 4 | 공안부 사이버범죄 대응 부서(A05) 사기 수법 안내 (2020.10.13 기사) | 베트남 공안부 | 공식 기관 안내(기사 인용) | 원문 링크 확인 중 | 인증번호 요구 등 주의 안내. 원문 대조 필요 |
| 5 | 조세관리법 제38/2019/QH14호 제17조(납세자의 책임) | 베트남 국회 | 법령 | https://english.luatvietnam.vn/aw-no-38-2019-qh14-dated-june-13-2019-of-the-national-assembly-on-tax-administration-174969-Doc1.html | 세금 확정본 출처 2와 같은 자료 |
| 6 | 세무기관 사칭 사기 주의 안내 (세무총국 공문 제1353/TCT-DNNCN호 인용) | 베트남 세무총국 (세관 신문 영문판 게재) | 공식 기관 안내 | https://english.haiquanonline.com.vn/continue-to-warn-about-forms-of-fraud-against-taxpayers-30696.html | 게재일 미표시. 공식 앱·포털·공개 연락처로만 확인 |
