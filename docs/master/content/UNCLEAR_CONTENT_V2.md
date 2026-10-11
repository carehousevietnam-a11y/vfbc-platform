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
| ① | `unclear_actionHint=pay`, `unclear_routeSelectionMode=selected` | 경로 M (Q1-M ~ Q10-M) |
| ② | `unclear_actionHint=submit_or_appear`, `unclear_routeSelectionMode=selected` | 경로 D (Q1-D ~ Q10-D) |
| ③ | `unclear_actionHint=notice_only`, `unclear_routeSelectionMode=selected` | 경로 N (Q1-N ~ Q10-N) |
| ④ | `unclear_actionHint=unsure`, `unclear_routeSelectionMode=unsure` | 경로 N (기본 경로) |
| ⑤ 직접 입력 | `unclear_actionHint=direct_input`, `unclear_routeSelectionMode=direct_input` | 경로 N (기본 경로). 입력 원문은 `unclear_actionHint` 상세로 저장 |

## A-1. 돈을 내라는 서류 — 1차

### Q1-M

**고객 화면**

**받은 서류나 안내는 어떤 형태인가요?**

① 직인과 문서번호가 있는 종이 공문입니다  
② 청구서나 고지서 양식입니다  
③ 이메일로 받았습니다  
④ 문자나 메신저로 받았습니다  
⑤ 링크나 큐알 코드로 안내받았습니다  
⑥ 전화나 방문으로 말로만 들었습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_documentForm=paper_official`, `unclear_formGroup=form_formal` |
| ② | `unclear_documentForm=bill_form`, `unclear_formGroup=form_formal` |
| ③ | `unclear_documentForm=email_body`, `unclear_formGroup=form_digital` |
| ④ | `unclear_documentForm=chat_message`, `unclear_formGroup=form_digital` |
| ⑤ | `unclear_documentForm=link_code`, `unclear_formGroup=form_digital` |
| ⑥ | `unclear_documentForm=verbal_only`, `unclear_formGroup=form_oral` |
| ⑦ 직접 입력 | `unclear_documentForm=direct_input`, `unclear_formGroup=direct_input_detail` |

---

### Q2-M

**고객 화면**

**서류에 보낸 곳으로 적힌 곳은 어디인가요?**

① 세무기관(세무서·세무총국)입니다  
② 공안·경찰·검찰·법원입니다  
③ 구·시·성 등 지방 행정기관입니다  
④ 출입국·노동 등 외국인 관련 기관입니다  
⑤ 은행이나 금융회사입니다  
⑥ 회사·통신사·택배사·쇼핑 플랫폼입니다  
⑦ 보낸 곳이 적혀 있지 않거나 개인입니다  
⑧ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_senderClaim=tax_authority`, `unclear_senderGroup=grp_public` |
| ② | `unclear_senderClaim=police_court`, `unclear_senderGroup=grp_public` |
| ③ | `unclear_senderClaim=local_admin`, `unclear_senderGroup=grp_public` |
| ④ | `unclear_senderClaim=foreign_agency`, `unclear_senderGroup=grp_public` |
| ⑤ | `unclear_senderClaim=bank_claim`, `unclear_senderGroup=grp_finance` |
| ⑥ | `unclear_senderClaim=company_claim`, `unclear_senderGroup=grp_private` |
| ⑦ | `unclear_senderClaim=unnamed_claim`, `unclear_senderGroup=grp_unnamed` |
| ⑧ 직접 입력 | `unclear_senderClaim=direct_input`, `unclear_senderGroup=direct_input_detail` |

---

### Q3-M

**고객 화면**

**이 연락은 어떻게 이어져 왔나요?**

① 오늘이나 어제 처음 한 번 받았습니다  
② 며칠 전에 한 번 받고 그 뒤 연락은 없습니다  
③ 같은 내용을 여러 번 반복해서 받았습니다  
④ 받을수록 표현이 점점 강해졌습니다  
⑤ 전화나 방문을 받은 뒤에 이어서 받았습니다  
⑥ 제가 신청하거나 문의한 뒤에 받았습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_contactPattern=first_contact`, `unclear_contactFlow=flow_single` |
| ② | `unclear_contactPattern=once_earlier`, `unclear_contactFlow=flow_single` |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_contactFlow=flow_repeat` |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_contactFlow=flow_escalate` |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_contactFlow=flow_followup` |
| ⑥ | `unclear_contactPattern=after_request`, `unclear_contactFlow=flow_expected` |
| ⑦ 직접 입력 | `unclear_contactPattern=direct_input`, `unclear_contactFlow=direct_input_detail` |

---

### Q4-M

**고객 화면**

**지금 가장 크게 걱정되는 점은 무엇인가요?**

① 진짜 서류인지 모르겠습니다  
② 정말 내야 하는 돈인지 모르겠습니다  
③ 금액이 맞는지 모르겠습니다  
④ 기한을 놓칠까 걱정됩니다  
⑤ 이미 응했거나 알려 줘서 불안합니다  
⑥ 크게 걱정되지는 않고 확인만 하고 싶습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_mainConcern=doubt_genuine`, `unclear_firstAction=next_sender` |
| ② | `unclear_mainConcern=doubt_owed`, `unclear_firstAction=next_basis` |
| ③ | `unclear_mainConcern=doubt_amount`, `unclear_firstAction=next_basis` |
| ④ | `unclear_mainConcern=doubt_deadline`, `unclear_firstAction=next_deadline` |
| ⑤ | `unclear_mainConcern=doubt_done`, `unclear_firstAction=next_stop` |
| ⑥ | `unclear_mainConcern=doubt_none`, `unclear_firstAction=next_keep` |
| ⑦ 직접 입력 | `unclear_mainConcern=direct_input`, `unclear_firstAction=direct_input_detail` |

---

## A-2. 서류 제출·출석 서류 — 1차

### Q1-D

**고객 화면**

**받은 서류나 안내는 어떤 형태인가요?**

① 직인과 문서번호가 있는 종이 공문입니다  
② 청구서나 고지서 양식입니다  
③ 이메일로 받았습니다  
④ 문자나 메신저로 받았습니다  
⑤ 링크나 큐알 코드로 안내받았습니다  
⑥ 전화나 방문으로 말로만 들었습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_documentForm=paper_official`, `unclear_formGroup=form_formal` |
| ② | `unclear_documentForm=bill_form`, `unclear_formGroup=form_formal` |
| ③ | `unclear_documentForm=email_body`, `unclear_formGroup=form_digital` |
| ④ | `unclear_documentForm=chat_message`, `unclear_formGroup=form_digital` |
| ⑤ | `unclear_documentForm=link_code`, `unclear_formGroup=form_digital` |
| ⑥ | `unclear_documentForm=verbal_only`, `unclear_formGroup=form_oral` |
| ⑦ 직접 입력 | `unclear_documentForm=direct_input`, `unclear_formGroup=direct_input_detail` |

---

### Q2-D

**고객 화면**

**서류에 보낸 곳으로 적힌 곳은 어디인가요?**

① 세무기관(세무서·세무총국)입니다  
② 공안·경찰·검찰·법원입니다  
③ 구·시·성 등 지방 행정기관입니다  
④ 출입국·노동 등 외국인 관련 기관입니다  
⑤ 은행이나 금융회사입니다  
⑥ 회사·통신사·택배사·쇼핑 플랫폼입니다  
⑦ 보낸 곳이 적혀 있지 않거나 개인입니다  
⑧ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_senderClaim=tax_authority`, `unclear_senderGroup=grp_public` |
| ② | `unclear_senderClaim=police_court`, `unclear_senderGroup=grp_public` |
| ③ | `unclear_senderClaim=local_admin`, `unclear_senderGroup=grp_public` |
| ④ | `unclear_senderClaim=foreign_agency`, `unclear_senderGroup=grp_public` |
| ⑤ | `unclear_senderClaim=bank_claim`, `unclear_senderGroup=grp_finance` |
| ⑥ | `unclear_senderClaim=company_claim`, `unclear_senderGroup=grp_private` |
| ⑦ | `unclear_senderClaim=unnamed_claim`, `unclear_senderGroup=grp_unnamed` |
| ⑧ 직접 입력 | `unclear_senderClaim=direct_input`, `unclear_senderGroup=direct_input_detail` |

---

### Q3-D

**고객 화면**

**이 연락은 어떻게 이어져 왔나요?**

① 오늘이나 어제 처음 한 번 받았습니다  
② 며칠 전에 한 번 받고 그 뒤 연락은 없습니다  
③ 같은 내용을 여러 번 반복해서 받았습니다  
④ 받을수록 표현이 점점 강해졌습니다  
⑤ 전화나 방문을 받은 뒤에 이어서 받았습니다  
⑥ 제가 신청하거나 문의한 뒤에 받았습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_contactPattern=first_contact`, `unclear_contactFlow=flow_single` |
| ② | `unclear_contactPattern=once_earlier`, `unclear_contactFlow=flow_single` |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_contactFlow=flow_repeat` |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_contactFlow=flow_escalate` |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_contactFlow=flow_followup` |
| ⑥ | `unclear_contactPattern=after_request`, `unclear_contactFlow=flow_expected` |
| ⑦ 직접 입력 | `unclear_contactPattern=direct_input`, `unclear_contactFlow=direct_input_detail` |

---

### Q4-D

**고객 화면**

**지금 가장 크게 걱정되는 점은 무엇인가요?**

① 진짜 서류인지 모르겠습니다  
② 무엇을 내야 하는지 모르겠습니다  
③ 직접 가야 하는지, 안 가면 어떻게 되는지 걱정됩니다  
④ 기한을 놓칠까 걱정됩니다  
⑤ 개인정보를 내도 되는지 걱정됩니다  
⑥ 이미 일부를 냈거나 답했습니다  
⑦ 크게 걱정되지는 않고 확인만 하고 싶습니다  
⑧ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_mainConcern=doubt_genuine`, `unclear_firstAction=next_sender` |
| ② | `unclear_mainConcern=doubt_what`, `unclear_firstAction=next_basis` |
| ③ | `unclear_mainConcern=doubt_appear`, `unclear_firstAction=next_basis` |
| ④ | `unclear_mainConcern=doubt_deadline`, `unclear_firstAction=next_deadline` |
| ⑤ | `unclear_mainConcern=doubt_privacy`, `unclear_firstAction=next_sender` |
| ⑥ | `unclear_mainConcern=doubt_done`, `unclear_firstAction=next_stop` |
| ⑦ | `unclear_mainConcern=doubt_none`, `unclear_firstAction=next_keep` |
| ⑧ 직접 입력 | `unclear_mainConcern=direct_input`, `unclear_firstAction=direct_input_detail` |

---

## A-3. 내용을 모르는 서류 — 1차

### Q1-N

**고객 화면**

**받은 서류나 안내는 어떤 형태인가요?**

① 직인과 문서번호가 있는 종이 공문입니다  
② 청구서나 고지서 양식입니다  
③ 이메일로 받았습니다  
④ 문자나 메신저로 받았습니다  
⑤ 링크나 큐알 코드로 안내받았습니다  
⑥ 전화나 방문으로 말로만 들었습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_documentForm=paper_official`, `unclear_formGroup=form_formal` |
| ② | `unclear_documentForm=bill_form`, `unclear_formGroup=form_formal` |
| ③ | `unclear_documentForm=email_body`, `unclear_formGroup=form_digital` |
| ④ | `unclear_documentForm=chat_message`, `unclear_formGroup=form_digital` |
| ⑤ | `unclear_documentForm=link_code`, `unclear_formGroup=form_digital` |
| ⑥ | `unclear_documentForm=verbal_only`, `unclear_formGroup=form_oral` |
| ⑦ 직접 입력 | `unclear_documentForm=direct_input`, `unclear_formGroup=direct_input_detail` |

---

### Q2-N

**고객 화면**

**서류에 보낸 곳으로 적힌 곳은 어디인가요?**

① 세무기관(세무서·세무총국)입니다  
② 공안·경찰·검찰·법원입니다  
③ 구·시·성 등 지방 행정기관입니다  
④ 출입국·노동 등 외국인 관련 기관입니다  
⑤ 은행이나 금융회사입니다  
⑥ 회사·통신사·택배사·쇼핑 플랫폼입니다  
⑦ 보낸 곳이 적혀 있지 않거나 개인입니다  
⑧ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_senderClaim=tax_authority`, `unclear_senderGroup=grp_public` |
| ② | `unclear_senderClaim=police_court`, `unclear_senderGroup=grp_public` |
| ③ | `unclear_senderClaim=local_admin`, `unclear_senderGroup=grp_public` |
| ④ | `unclear_senderClaim=foreign_agency`, `unclear_senderGroup=grp_public` |
| ⑤ | `unclear_senderClaim=bank_claim`, `unclear_senderGroup=grp_finance` |
| ⑥ | `unclear_senderClaim=company_claim`, `unclear_senderGroup=grp_private` |
| ⑦ | `unclear_senderClaim=unnamed_claim`, `unclear_senderGroup=grp_unnamed` |
| ⑧ 직접 입력 | `unclear_senderClaim=direct_input`, `unclear_senderGroup=direct_input_detail` |

---

### Q3-N

**고객 화면**

**이 연락은 어떻게 이어져 왔나요?**

① 오늘이나 어제 처음 한 번 받았습니다  
② 며칠 전에 한 번 받고 그 뒤 연락은 없습니다  
③ 같은 내용을 여러 번 반복해서 받았습니다  
④ 받을수록 표현이 점점 강해졌습니다  
⑤ 전화나 방문을 받은 뒤에 이어서 받았습니다  
⑥ 제가 신청하거나 문의한 뒤에 받았습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_contactPattern=first_contact`, `unclear_contactFlow=flow_single` |
| ② | `unclear_contactPattern=once_earlier`, `unclear_contactFlow=flow_single` |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_contactFlow=flow_repeat` |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_contactFlow=flow_escalate` |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_contactFlow=flow_followup` |
| ⑥ | `unclear_contactPattern=after_request`, `unclear_contactFlow=flow_expected` |
| ⑦ 직접 입력 | `unclear_contactPattern=direct_input`, `unclear_contactFlow=direct_input_detail` |

---

### Q4-N

**고객 화면**

**지금 가장 크게 걱정되는 점은 무엇인가요?**

① 무슨 뜻인지 모르겠습니다  
② 진짜 서류인지 모르겠습니다  
③ 응해야 하는지 보관만 해도 되는지 모르겠습니다  
④ 놓친 내용이 있을까 걱정됩니다  
⑤ 이미 답장했거나 응했습니다  
⑥ 크게 걱정되지는 않고 무슨 서류인지만 알고 싶습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_mainConcern=doubt_meaning`, `unclear_firstAction=next_understand` |
| ② | `unclear_mainConcern=doubt_genuine`, `unclear_firstAction=next_sender` |
| ③ | `unclear_mainConcern=doubt_respond`, `unclear_firstAction=next_understand` |
| ④ | `unclear_mainConcern=doubt_missing`, `unclear_firstAction=next_deadline` |
| ⑤ | `unclear_mainConcern=doubt_done`, `unclear_firstAction=next_stop` |
| ⑥ | `unclear_mainConcern=doubt_none`, `unclear_firstAction=next_keep` |
| ⑦ 직접 입력 | `unclear_mainConcern=direct_input`, `unclear_firstAction=direct_input_detail` |

---

# B. 2차 질문

## B-1. 돈을 내라는 서류 — 2차

### Q5-M

**고객 화면**

**서류에 적힌 내 정보는 어떻게 되어 있나요?**

① 이름·회사명·주소가 모두 정확합니다  
② 이름은 맞지만 주소나 번호가 일부 다릅니다  
③ 이름 없이 일반 호칭만 적혀 있습니다  
④ 다른 사람이나 다른 회사 이름이 적혀 있습니다  
⑤ 적힌 정보를 아직 확인하지 않았습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_aimHint=aim_specific` |
| ② | `unclear_identityMatch=id_partial`, `unclear_aimHint=aim_partial` |
| ③ | `unclear_identityMatch=id_generic`, `unclear_aimHint=aim_generic` |
| ④ | `unclear_identityMatch=id_other`, `unclear_aimHint=aim_misdirected` |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_aimHint=aim_unchecked` |
| ⑥ 직접 입력 | `unclear_identityMatch=direct_input`, `unclear_aimHint=direct_input_detail` |

---

### Q6-M

**고객 화면**

**서류나 연락에서 확인되는 요소는 무엇인가요?**

① 기관명·문서번호·날짜·직인이 모두 있습니다  
② 그중 일부만 있습니다  
③ 모두 없고 문장만 있습니다  
④ 연락처가 개인 번호나 일반 이메일 주소입니다  
⑤ 링크나 큐알 코드로만 안내합니다  
⑥ 문장이 번역투이거나 어색합니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_formality=fm_formal` |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_formality=fm_partial` |
| ③ | `unclear_authenticityMark=mark_none`, `unclear_formality=fm_informal` |
| ④ | `unclear_authenticityMark=mark_personal_contact`, `unclear_formality=fm_informal` |
| ⑤ | `unclear_authenticityMark=mark_link_only`, `unclear_formality=fm_link` |
| ⑥ | `unclear_authenticityMark=mark_odd_text`, `unclear_formality=fm_odd` |
| ⑦ 직접 입력 | `unclear_authenticityMark=direct_input`, `unclear_formality=direct_input_detail` |

---

### Q7-M

**고객 화면**

**서류가 요구하는 돈의 성격은 무엇이라고 적혀 있나요?**

① 세금이나 세무 관련 비용입니다  
② 벌금·과태료·행정 수수료입니다  
③ 서비스 이용료나 요금입니다  
④ 채무나 거래 대금입니다  
⑤ 보증금·선납금·예치금입니다  
⑥ 명목이 적혀 있지 않습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_moneyNature=nature_tax`, `unclear_moneyReviewLink=link_tax` |
| ② | `unclear_moneyNature=nature_fine`, `unclear_moneyReviewLink=link_admin` |
| ③ | `unclear_moneyNature=nature_fee`, `unclear_moneyReviewLink=link_trade` |
| ④ | `unclear_moneyNature=nature_debt`, `unclear_moneyReviewLink=link_trade` |
| ⑤ | `unclear_moneyNature=nature_deposit`, `unclear_moneyReviewLink=link_property` |
| ⑥ | `unclear_moneyNature=nature_unstated`, `unclear_moneyReviewLink=link_none` |
| ⑦ 직접 입력 | `unclear_moneyNature=direct_input`, `unclear_moneyReviewLink=direct_input_detail` |

---

### Q8-M

**고객 화면**

**요구하는 금액은 어느 정도인가요?**

① 100만 동 미만입니다  
② 100만 동 이상 1천만 동 미만입니다  
③ 1천만 동 이상 1억 동 미만입니다  
④ 1억 동 이상입니다  
⑤ 금액이 적혀 있지 않습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_amountScale=amt_under1m`, `unclear_amountTier=tier_small` |
| ② | `unclear_amountScale=amt_1m_10m`, `unclear_amountTier=tier_medium` |
| ③ | `unclear_amountScale=amt_10m_100m`, `unclear_amountTier=tier_large` |
| ④ | `unclear_amountScale=amt_over100m`, `unclear_amountTier=tier_xlarge` |
| ⑤ | `unclear_amountScale=amt_unstated`, `unclear_amountTier=tier_unknown` |
| ⑥ 직접 입력 | `unclear_amountScale=direct_input`, `unclear_amountTier=direct_input_detail` |

---

### Q9-M

**고객 화면**

**돈을 어디로 보내라고 되어 있나요?**

① 기관 이름으로 된 계좌입니다  
② 회사 이름으로 된 계좌입니다  
③ 개인 이름으로 된 계좌입니다  
④ 링크·큐알 코드·앱으로 결제하라고 합니다  
⑤ 현금이나 상품권으로 내라고 합니다  
⑥ 계좌나 방법이 적혀 있지 않습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_payee=payee_institution`, `unclear_paymentGroup=pay_account` |
| ② | `unclear_payee=payee_company`, `unclear_paymentGroup=pay_account` |
| ③ | `unclear_payee=payee_person`, `unclear_paymentGroup=pay_account` |
| ④ | `unclear_payee=payee_online`, `unclear_paymentGroup=pay_online` |
| ⑤ | `unclear_payee=payee_cash`, `unclear_paymentGroup=pay_cash` |
| ⑥ | `unclear_payee=payee_unstated`, `unclear_paymentGroup=pay_none` |
| ⑦ 직접 입력 | `unclear_payee=direct_input`, `unclear_paymentGroup=direct_input_detail` |

---

### Q10-M

**고객 화면**

**서류나 연락에 어떤 압박이 있나요?**

① 압박 없이 안내만 있습니다  
② 기한 안에 하라는 안내만 있습니다  
③ 연체료·가산금이나 법적 조치를 예고합니다  
④ 지금 바로 하지 않으면 안 된다고 재촉합니다  
⑤ 계좌 동결·체포·출국 금지 같은 강한 불이익을 말합니다  
⑥ 다른 사람에게 말하지 말고 비밀로 하라고 합니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureLevel=lvl_none` |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureLevel=lvl_low` |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureLevel=lvl_mid` |
| ④ | `unclear_pressureType=press_rush`, `unclear_pressureLevel=lvl_mid` |
| ⑤ | `unclear_pressureType=press_threat`, `unclear_pressureLevel=lvl_high` |
| ⑥ | `unclear_pressureType=press_secret`, `unclear_pressureLevel=lvl_high` |
| ⑦ 직접 입력 | `unclear_pressureType=direct_input`, `unclear_pressureLevel=direct_input_detail` |

---

### Q11-M

**고객 화면**

**서류나 안내의 기한은 어떻게 되어 있나요?**

① 기한이 적혀 있지 않습니다  
② 서류에 날짜가 적혀 있고 아직 여유가 있습니다  
③ 서류에 날짜가 적혀 있고 사흘 안으로 가깝습니다  
④ 서류에 적힌 기한이 이미 지났습니다  
⑤ 메시지나 말로만 기한을 알려 줬습니다  
⑥ 기한이 있는 것 같은데 정확히 모릅니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineSource=dls_none` |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineSource=dls_doc` |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineSource=dls_doc` |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineSource=dls_doc` |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineSource=dls_message` |
| ⑥ | `unclear_deadlineStatus=dl_unclear`, `unclear_deadlineSource=dls_unknown` |
| ⑦ 직접 입력 | `unclear_deadlineStatus=direct_input`, `unclear_deadlineSource=direct_input_detail` |

---

### Q12-M

**고객 화면**

**지금까지 이 서류와 관련해 한 일이 있나요?**

① 아무것도 하지 않았습니다  
② 보낸 곳에 문의만 했습니다  
③ 링크를 열었거나 앱을 설치했습니다  
④ 개인정보나 서류를 이미 보냈습니다  
⑤ 돈을 일부 또는 전부 보냈습니다  
⑥ 답장을 했거나 통화를 했습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_exposureLevel=exp_none` |
| ② | `unclear_actionTaken=act_asked`, `unclear_exposureLevel=exp_low` |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_exposureLevel=exp_mid` |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_exposureLevel=exp_info` |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_exposureLevel=exp_money` |
| ⑥ | `unclear_actionTaken=act_replied`, `unclear_exposureLevel=exp_contact` |
| ⑦ 직접 입력 | `unclear_actionTaken=direct_input`, `unclear_exposureLevel=direct_input_detail` |

---

### Q13-M

**고객 화면**

**남아 있는 자료는 무엇인가요?**

① 서류 원본을 가지고 있습니다  
② 사진이나 캡처만 있습니다  
③ 문자·메신저·통화 기록이 남아 있습니다  
④ 송금 내역이나 영수증이 있습니다  
⑤ 일부를 잃어버렸거나 지웠습니다  
⑥ 남은 자료가 없습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceState=evs_strong` |
| ② | `unclear_evidenceKind=ev_photo`, `unclear_evidenceState=evs_medium` |
| ③ | `unclear_evidenceKind=ev_chat`, `unclear_evidenceState=evs_medium` |
| ④ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceState=evs_strong` |
| ⑤ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceState=evs_weak` |
| ⑥ | `unclear_evidenceKind=ev_none`, `unclear_evidenceState=evs_weak` |
| ⑦ 직접 입력 | `unclear_evidenceKind=direct_input`, `unclear_evidenceState=direct_input_detail` |

---

## B-2. 서류 제출·출석 서류 — 2차

### Q5-D

**고객 화면**

**서류에 적힌 내 정보는 어떻게 되어 있나요?**

① 이름·회사명·주소가 모두 정확합니다  
② 이름은 맞지만 주소나 번호가 일부 다릅니다  
③ 이름 없이 일반 호칭만 적혀 있습니다  
④ 다른 사람이나 다른 회사 이름이 적혀 있습니다  
⑤ 적힌 정보를 아직 확인하지 않았습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_aimHint=aim_specific` |
| ② | `unclear_identityMatch=id_partial`, `unclear_aimHint=aim_partial` |
| ③ | `unclear_identityMatch=id_generic`, `unclear_aimHint=aim_generic` |
| ④ | `unclear_identityMatch=id_other`, `unclear_aimHint=aim_misdirected` |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_aimHint=aim_unchecked` |
| ⑥ 직접 입력 | `unclear_identityMatch=direct_input`, `unclear_aimHint=direct_input_detail` |

---

### Q6-D

**고객 화면**

**서류나 연락에서 확인되는 요소는 무엇인가요?**

① 기관명·문서번호·날짜·직인이 모두 있습니다  
② 그중 일부만 있습니다  
③ 모두 없고 문장만 있습니다  
④ 연락처가 개인 번호나 일반 이메일 주소입니다  
⑤ 링크나 큐알 코드로만 안내합니다  
⑥ 문장이 번역투이거나 어색합니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_formality=fm_formal` |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_formality=fm_partial` |
| ③ | `unclear_authenticityMark=mark_none`, `unclear_formality=fm_informal` |
| ④ | `unclear_authenticityMark=mark_personal_contact`, `unclear_formality=fm_informal` |
| ⑤ | `unclear_authenticityMark=mark_link_only`, `unclear_formality=fm_link` |
| ⑥ | `unclear_authenticityMark=mark_odd_text`, `unclear_formality=fm_odd` |
| ⑦ 직접 입력 | `unclear_authenticityMark=direct_input`, `unclear_formality=direct_input_detail` |

---

### Q7-D

**고객 화면**

**서류가 요구하는 것은 무엇인가요?**

① 신분증·여권·체류 관련 서류입니다  
② 사업자·회사 관련 서류입니다  
③ 계약서나 거래 서류입니다  
④ 경위서·설명서 같은 진술입니다  
⑤ 직접 출석하거나 방문하라는 것입니다  
⑥ 사이트 접속이나 앱 설치입니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_requestTarget=tgt_id_docs`, `unclear_targetGroup=grp_personal` |
| ② | `unclear_requestTarget=tgt_business_docs`, `unclear_targetGroup=grp_business` |
| ③ | `unclear_requestTarget=tgt_contract_docs`, `unclear_targetGroup=grp_contract` |
| ④ | `unclear_requestTarget=tgt_statement`, `unclear_targetGroup=grp_statement` |
| ⑤ | `unclear_requestTarget=tgt_appear`, `unclear_targetGroup=grp_appear` |
| ⑥ | `unclear_requestTarget=tgt_online`, `unclear_targetGroup=grp_online` |
| ⑦ 직접 입력 | `unclear_requestTarget=direct_input`, `unclear_targetGroup=direct_input_detail` |

---

### Q8-D

**고객 화면**

**요구 내용은 얼마나 구체적으로 적혀 있나요?**

① 서류 목록과 제출 양식이 모두 있습니다  
② 목록은 있지만 양식은 없습니다  
③ '관련 서류' 정도로만 적혀 있습니다  
④ 무엇을 내야 하는지 적혀 있지 않습니다  
⑤ 서류 요구 없이 연락하라고만 합니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_requestSpecificity=spec_full`, `unclear_listQuality=list_clear` |
| ② | `unclear_requestSpecificity=spec_list_only`, `unclear_listQuality=list_partial` |
| ③ | `unclear_requestSpecificity=spec_vague`, `unclear_listQuality=list_vague` |
| ④ | `unclear_requestSpecificity=spec_none`, `unclear_listQuality=list_none` |
| ⑤ | `unclear_requestSpecificity=spec_contact_only`, `unclear_listQuality=list_contact` |
| ⑥ 직접 입력 | `unclear_requestSpecificity=direct_input`, `unclear_listQuality=direct_input_detail` |

---

### Q9-D

**고객 화면**

**제출이나 출석은 어떤 방법으로 하라고 되어 있나요?**

① 지정된 장소에 직접 방문하는 것입니다  
② 우편이나 창구 접수입니다  
③ 이메일이나 메신저로 보내라는 것입니다  
④ 웹사이트에 올리라는 것입니다  
⑤ 전화나 화상 통화로 하라는 것입니다  
⑥ 방법이 적혀 있지 않습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_deliveryMethod=deliver_visit`, `unclear_deliveryGroup=dgrp_formal` |
| ② | `unclear_deliveryMethod=deliver_post`, `unclear_deliveryGroup=dgrp_formal` |
| ③ | `unclear_deliveryMethod=deliver_chat`, `unclear_deliveryGroup=dgrp_digital` |
| ④ | `unclear_deliveryMethod=deliver_upload`, `unclear_deliveryGroup=dgrp_digital` |
| ⑤ | `unclear_deliveryMethod=deliver_call`, `unclear_deliveryGroup=dgrp_digital` |
| ⑥ | `unclear_deliveryMethod=deliver_unstated`, `unclear_deliveryGroup=dgrp_unspecified` |
| ⑦ 직접 입력 | `unclear_deliveryMethod=direct_input`, `unclear_deliveryGroup=direct_input_detail` |

---

### Q10-D

**고객 화면**

**서류나 연락에 어떤 압박이 있나요?**

① 압박 없이 안내만 있습니다  
② 기한 안에 하라는 안내만 있습니다  
③ 연체료·가산금이나 법적 조치를 예고합니다  
④ 지금 바로 하지 않으면 안 된다고 재촉합니다  
⑤ 계좌 동결·체포·출국 금지 같은 강한 불이익을 말합니다  
⑥ 다른 사람에게 말하지 말고 비밀로 하라고 합니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureLevel=lvl_none` |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureLevel=lvl_low` |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureLevel=lvl_mid` |
| ④ | `unclear_pressureType=press_rush`, `unclear_pressureLevel=lvl_mid` |
| ⑤ | `unclear_pressureType=press_threat`, `unclear_pressureLevel=lvl_high` |
| ⑥ | `unclear_pressureType=press_secret`, `unclear_pressureLevel=lvl_high` |
| ⑦ 직접 입력 | `unclear_pressureType=direct_input`, `unclear_pressureLevel=direct_input_detail` |

---

### Q11-D

**고객 화면**

**서류나 안내의 기한은 어떻게 되어 있나요?**

① 기한이 적혀 있지 않습니다  
② 서류에 날짜가 적혀 있고 아직 여유가 있습니다  
③ 서류에 날짜가 적혀 있고 사흘 안으로 가깝습니다  
④ 서류에 적힌 기한이 이미 지났습니다  
⑤ 메시지나 말로만 기한을 알려 줬습니다  
⑥ 기한이 있는 것 같은데 정확히 모릅니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineSource=dls_none` |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineSource=dls_doc` |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineSource=dls_doc` |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineSource=dls_doc` |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineSource=dls_message` |
| ⑥ | `unclear_deadlineStatus=dl_unclear`, `unclear_deadlineSource=dls_unknown` |
| ⑦ 직접 입력 | `unclear_deadlineStatus=direct_input`, `unclear_deadlineSource=direct_input_detail` |

---

### Q12-D

**고객 화면**

**지금까지 이 서류와 관련해 한 일이 있나요?**

① 아무것도 하지 않았습니다  
② 보낸 곳에 문의만 했습니다  
③ 링크를 열었거나 앱을 설치했습니다  
④ 개인정보나 서류를 이미 보냈습니다  
⑤ 돈을 일부 또는 전부 보냈습니다  
⑥ 답장을 했거나 통화를 했습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_exposureLevel=exp_none` |
| ② | `unclear_actionTaken=act_asked`, `unclear_exposureLevel=exp_low` |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_exposureLevel=exp_mid` |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_exposureLevel=exp_info` |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_exposureLevel=exp_money` |
| ⑥ | `unclear_actionTaken=act_replied`, `unclear_exposureLevel=exp_contact` |
| ⑦ 직접 입력 | `unclear_actionTaken=direct_input`, `unclear_exposureLevel=direct_input_detail` |

---

### Q13-D

**고객 화면**

**남아 있는 자료는 무엇인가요?**

① 서류 원본을 가지고 있습니다  
② 사진이나 캡처만 있습니다  
③ 문자·메신저·통화 기록이 남아 있습니다  
④ 송금 내역이나 영수증이 있습니다  
⑤ 일부를 잃어버렸거나 지웠습니다  
⑥ 남은 자료가 없습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceState=evs_strong` |
| ② | `unclear_evidenceKind=ev_photo`, `unclear_evidenceState=evs_medium` |
| ③ | `unclear_evidenceKind=ev_chat`, `unclear_evidenceState=evs_medium` |
| ④ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceState=evs_strong` |
| ⑤ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceState=evs_weak` |
| ⑥ | `unclear_evidenceKind=ev_none`, `unclear_evidenceState=evs_weak` |
| ⑦ 직접 입력 | `unclear_evidenceKind=direct_input`, `unclear_evidenceState=direct_input_detail` |

---

## B-3. 내용을 모르는 서류 — 2차

### Q5-N

**고객 화면**

**서류에 적힌 내 정보는 어떻게 되어 있나요?**

① 이름·회사명·주소가 모두 정확합니다  
② 이름은 맞지만 주소나 번호가 일부 다릅니다  
③ 이름 없이 일반 호칭만 적혀 있습니다  
④ 다른 사람이나 다른 회사 이름이 적혀 있습니다  
⑤ 적힌 정보를 아직 확인하지 않았습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_aimHint=aim_specific` |
| ② | `unclear_identityMatch=id_partial`, `unclear_aimHint=aim_partial` |
| ③ | `unclear_identityMatch=id_generic`, `unclear_aimHint=aim_generic` |
| ④ | `unclear_identityMatch=id_other`, `unclear_aimHint=aim_misdirected` |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_aimHint=aim_unchecked` |
| ⑥ 직접 입력 | `unclear_identityMatch=direct_input`, `unclear_aimHint=direct_input_detail` |

---

### Q6-N

**고객 화면**

**서류나 연락에서 확인되는 요소는 무엇인가요?**

① 기관명·문서번호·날짜·직인이 모두 있습니다  
② 그중 일부만 있습니다  
③ 모두 없고 문장만 있습니다  
④ 연락처가 개인 번호나 일반 이메일 주소입니다  
⑤ 링크나 큐알 코드로만 안내합니다  
⑥ 문장이 번역투이거나 어색합니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_formality=fm_formal` |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_formality=fm_partial` |
| ③ | `unclear_authenticityMark=mark_none`, `unclear_formality=fm_informal` |
| ④ | `unclear_authenticityMark=mark_personal_contact`, `unclear_formality=fm_informal` |
| ⑤ | `unclear_authenticityMark=mark_link_only`, `unclear_formality=fm_link` |
| ⑥ | `unclear_authenticityMark=mark_odd_text`, `unclear_formality=fm_odd` |
| ⑦ 직접 입력 | `unclear_authenticityMark=direct_input`, `unclear_formality=direct_input_detail` |

---

### Q7-N

**고객 화면**

**서류 내용을 얼마나 이해하셨나요?**

① 대부분 이해했습니다  
② 절반쯤 이해했습니다  
③ 거의 이해하지 못했습니다  
④ 외국어라 읽기 어렵습니다  
⑤ 사진이 흐리거나 잘려 읽을 수 없습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_understandingLevel=und_most`, `unclear_readability=read_ok` |
| ② | `unclear_understandingLevel=und_half`, `unclear_readability=read_ok` |
| ③ | `unclear_understandingLevel=und_little`, `unclear_readability=read_hard` |
| ④ | `unclear_understandingLevel=und_language`, `unclear_readability=read_lang` |
| ⑤ | `unclear_understandingLevel=und_blurry`, `unclear_readability=read_blurry` |
| ⑥ 직접 입력 | `unclear_understandingLevel=direct_input`, `unclear_readability=direct_input_detail` |

---

### Q8-N

**고객 화면**

**서류에서 가장 눈에 띄는 것은 무엇인가요?**

① 법령 이름이나 조항 번호입니다  
② 기관 이름입니다  
③ 문서번호·사건번호·세금번호 같은 번호입니다  
④ 금액이나 계좌번호입니다  
⑤ 날짜나 기한입니다  
⑥ 링크나 전화번호뿐입니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_keyElement=key_law`, `unclear_elementGroup=eg_legal` |
| ② | `unclear_keyElement=key_agency`, `unclear_elementGroup=eg_agency` |
| ③ | `unclear_keyElement=key_numbers`, `unclear_elementGroup=eg_numbers` |
| ④ | `unclear_keyElement=key_money`, `unclear_elementGroup=eg_money` |
| ⑤ | `unclear_keyElement=key_date`, `unclear_elementGroup=eg_date` |
| ⑥ | `unclear_keyElement=key_contact`, `unclear_elementGroup=eg_contact` |
| ⑦ 직접 입력 | `unclear_keyElement=direct_input`, `unclear_elementGroup=direct_input_detail` |

---

### Q9-N

**고객 화면**

**읽어 본 느낌으로는 무엇을 요구하는 것 같나요?**

① 돈을 내라는 것 같습니다  
② 서류를 내거나 출석하라는 것 같습니다  
③ 그냥 알려 주는 내용 같습니다  
④ 연락하라는 말뿐입니다  
⑤ 판단하기 어렵습니다  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_impliedRequest=imp_money`, `unclear_requestHint=hint_pay` |
| ② | `unclear_impliedRequest=imp_submit`, `unclear_requestHint=hint_submit` |
| ③ | `unclear_impliedRequest=imp_notice`, `unclear_requestHint=hint_notice` |
| ④ | `unclear_impliedRequest=imp_contact`, `unclear_requestHint=hint_contact` |
| ⑤ | `unclear_impliedRequest=imp_unknown`, `unclear_requestHint=hint_unknown` |
| ⑥ 직접 입력 | `unclear_impliedRequest=direct_input`, `unclear_requestHint=direct_input_detail` |

---

### Q10-N

**고객 화면**

**서류나 연락에 어떤 압박이 있나요?**

① 압박 없이 안내만 있습니다  
② 기한 안에 하라는 안내만 있습니다  
③ 연체료·가산금이나 법적 조치를 예고합니다  
④ 지금 바로 하지 않으면 안 된다고 재촉합니다  
⑤ 계좌 동결·체포·출국 금지 같은 강한 불이익을 말합니다  
⑥ 다른 사람에게 말하지 말고 비밀로 하라고 합니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureLevel=lvl_none` |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureLevel=lvl_low` |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureLevel=lvl_mid` |
| ④ | `unclear_pressureType=press_rush`, `unclear_pressureLevel=lvl_mid` |
| ⑤ | `unclear_pressureType=press_threat`, `unclear_pressureLevel=lvl_high` |
| ⑥ | `unclear_pressureType=press_secret`, `unclear_pressureLevel=lvl_high` |
| ⑦ 직접 입력 | `unclear_pressureType=direct_input`, `unclear_pressureLevel=direct_input_detail` |

---

### Q11-N

**고객 화면**

**서류나 안내의 기한은 어떻게 되어 있나요?**

① 기한이 적혀 있지 않습니다  
② 서류에 날짜가 적혀 있고 아직 여유가 있습니다  
③ 서류에 날짜가 적혀 있고 사흘 안으로 가깝습니다  
④ 서류에 적힌 기한이 이미 지났습니다  
⑤ 메시지나 말로만 기한을 알려 줬습니다  
⑥ 기한이 있는 것 같은데 정확히 모릅니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineSource=dls_none` |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineSource=dls_doc` |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineSource=dls_doc` |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineSource=dls_doc` |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineSource=dls_message` |
| ⑥ | `unclear_deadlineStatus=dl_unclear`, `unclear_deadlineSource=dls_unknown` |
| ⑦ 직접 입력 | `unclear_deadlineStatus=direct_input`, `unclear_deadlineSource=direct_input_detail` |

---

### Q12-N

**고객 화면**

**지금까지 이 서류와 관련해 한 일이 있나요?**

① 아무것도 하지 않았습니다  
② 보낸 곳에 문의만 했습니다  
③ 링크를 열었거나 앱을 설치했습니다  
④ 개인정보나 서류를 이미 보냈습니다  
⑤ 돈을 일부 또는 전부 보냈습니다  
⑥ 답장을 했거나 통화를 했습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_exposureLevel=exp_none` |
| ② | `unclear_actionTaken=act_asked`, `unclear_exposureLevel=exp_low` |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_exposureLevel=exp_mid` |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_exposureLevel=exp_info` |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_exposureLevel=exp_money` |
| ⑥ | `unclear_actionTaken=act_replied`, `unclear_exposureLevel=exp_contact` |
| ⑦ 직접 입력 | `unclear_actionTaken=direct_input`, `unclear_exposureLevel=direct_input_detail` |

---

### Q13-N

**고객 화면**

**남아 있는 자료는 무엇인가요?**

① 서류 원본을 가지고 있습니다  
② 사진이나 캡처만 있습니다  
③ 문자·메신저·통화 기록이 남아 있습니다  
④ 송금 내역이나 영수증이 있습니다  
⑤ 일부를 잃어버렸거나 지웠습니다  
⑥ 남은 자료가 없습니다  
⑦ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceState=evs_strong` |
| ② | `unclear_evidenceKind=ev_photo`, `unclear_evidenceState=evs_medium` |
| ③ | `unclear_evidenceKind=ev_chat`, `unclear_evidenceState=evs_medium` |
| ④ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceState=evs_strong` |
| ⑤ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceState=evs_weak` |
| ⑥ | `unclear_evidenceKind=ev_none`, `unclear_evidenceState=evs_weak` |
| ⑦ 직접 입력 | `unclear_evidenceKind=direct_input`, `unclear_evidenceState=direct_input_detail` |

---

# C. 필드 표

모든 선택지는 필드 2개를 함께 저장한다. 첫 필드는 구체 값, 둘째 필드는 그 값을 묶은 상위 분류(또는 연결 단서)이며, 결과 문장은 선택한 구체 값을 반영하고 위험 규칙·연결 안내의 조건에는 구체 값과 상위 분류를 함께 쓴다. 조건에 쓰이지 않는 필드도 이후 상담 정리와 질문 개선을 위해 저장한다. 값 옆은 고객 표시 문구(G).

## C-1. 돈을 내라는 서류

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `unclear_documentForm` | `paper_official`(종이 공문) / `bill_form`(청구서·고지서 양식) / `email_body`(이메일) / `chat_message`(문자·메신저) / `link_code`(링크·큐알 코드 안내) / `verbal_only`(전화·방문으로 말로 들음) | Q1-M |
| `unclear_formGroup` | `form_formal`(정식 서류 형태) / `form_digital`(전자 메시지 형태) / `form_oral`(말로만 전달됨) | Q1-M |
| `unclear_senderClaim` | `tax_authority`(세무기관) / `police_court`(공안·경찰·검찰·법원) / `local_admin`(지방 행정기관) / `foreign_agency`(출입국·노동 관련 기관) / `bank_claim`(은행·금융회사) / `company_claim`(회사·통신·택배·플랫폼) / `unnamed_claim`(보낸 곳이 없거나 개인) | Q2-M |
| `unclear_senderGroup` | `grp_public`(공공기관) / `grp_finance`(금융회사) / `grp_private`(민간 업체) / `grp_unnamed`(보낸 곳이 불분명) | Q2-M |
| `unclear_contactPattern` | `first_contact`(처음 한 번 받음) / `once_earlier`(며칠 전에 한 번 받음) / `repeated_same`(같은 내용을 반복해서 받음) / `escalating_tone`(점점 강한 표현으로 바뀜) / `after_visit`(전화·방문 뒤에 받음) / `after_request`(내가 신청·문의한 뒤에 받음) | Q3-M |
| `unclear_contactFlow` | `flow_single`(한 번만 받음) / `flow_repeat`(반복해서 받음) / `flow_escalate`(강도가 높아짐) / `flow_followup`(연락 뒤에 이어짐) / `flow_expected`(내 요청과 이어짐) | Q3-M |
| `unclear_mainConcern` | `doubt_genuine`(진짜인지 모르겠음) / `doubt_owed`(내야 하는지 모르겠음) / `doubt_amount`(금액이 맞는지 모르겠음) / `doubt_deadline`(기한을 놓칠까 걱정함) / `doubt_done`(이미 응해서 불안함) / `doubt_none`(크게 걱정하지 않음) | Q4-M |
| `unclear_firstAction` | `next_sender`(먼저 보낸 곳 확인) / `next_basis`(먼저 근거 확인) / `next_deadline`(먼저 기한 확인) / `next_stop`(추가 응답을 멈추고 확인) / `next_keep`(차분히 보관하고 확인) | Q4-M |
| `unclear_identityMatch` | `id_exact`(내 정보가 정확히 맞음) / `id_partial`(이름만 맞고 일부 다름) / `id_generic`(일반 호칭만 있음) / `id_other`(다른 사람·회사 이름) / `id_unchecked`(아직 확인하지 않음) | Q5-M |
| `unclear_aimHint` | `aim_specific`(나를 특정한 서류) / `aim_partial`(일부만 특정됨) / `aim_generic`(불특정 다수 대상일 수 있음) / `aim_misdirected`(엉뚱한 수신일 수 있음) / `aim_unchecked`(확인 전) | Q5-M |
| `unclear_authenticityMark` | `mark_full`(기관명·번호·날짜·직인이 모두 있음) / `mark_partial`(일부 요소만 있음) / `mark_none`(공식 요소가 없음) / `mark_personal_contact`(개인 번호·일반 이메일) / `mark_link_only`(링크·큐알 코드로만 안내) / `mark_odd_text`(문장이 어색함) | Q6-M |
| `unclear_formality` | `fm_formal`(형식을 갖춤) / `fm_partial`(형식이 일부 부족함) / `fm_informal`(형식이 없음) / `fm_link`(링크로만 연결됨) / `fm_odd`(문체가 어색함) | Q6-M |
| `unclear_moneyNature` | `nature_tax`(세금·세무 관련) / `nature_fine`(벌금·과태료·행정 수수료) / `nature_fee`(서비스 이용료·요금) / `nature_debt`(채무·거래 대금) / `nature_deposit`(보증금·선납금·예치금) / `nature_unstated`(명목이 적혀 있지 않음) | Q7-M |
| `unclear_moneyReviewLink` | `link_tax`(세금 검토와 연결) / `link_admin`(행정문서 검토와 연결) / `link_trade`(계약·이용 내역 대조) / `link_property`(부동산·계약 검토와 연결) / `link_none`(연결할 분야가 불분명) | Q7-M |
| `unclear_amountScale` | `amt_under1m`(100만 동 미만) / `amt_1m_10m`(100만 동 이상 1천만 동 미만) / `amt_10m_100m`(1천만 동 이상 1억 동 미만) / `amt_over100m`(1억 동 이상) / `amt_unstated`(금액이 적혀 있지 않음) | Q8-M |
| `unclear_amountTier` | `tier_small`(소액) / `tier_medium`(중간 금액) / `tier_large`(큰 금액) / `tier_xlarge`(매우 큰 금액) / `tier_unknown`(금액 불명) | Q8-M |
| `unclear_payee` | `payee_institution`(기관 이름 계좌) / `payee_company`(회사 이름 계좌) / `payee_person`(개인 이름 계좌) / `payee_online`(링크·큐알·앱 결제) / `payee_cash`(현금·상품권) / `payee_unstated`(받는 곳이 적혀 있지 않음) | Q9-M |
| `unclear_paymentGroup` | `pay_account`(계좌 이체) / `pay_online`(온라인 결제) / `pay_cash`(현금성 수단) / `pay_none`(방법 불명) | Q9-M |
| `unclear_pressureType` | `press_none`(압박 없음) / `press_deadline`(기한 안내) / `press_legal`(법적 조치·가산금 예고) / `press_rush`(지금 바로 하라고 재촉) / `press_threat`(계좌 동결·체포 등 강한 불이익) / `press_secret`(비밀 유지 요구) | Q10-M |
| `unclear_pressureLevel` | `lvl_none`(없음) / `lvl_low`(낮음) / `lvl_mid`(중간) / `lvl_high`(높음) | Q10-M |
| `unclear_deadlineStatus` | `dl_none`(기한 표시 없음) / `dl_far`(기한이 여유 있음) / `dl_near`(기한이 가까움) / `dl_passed`(기한이 이미 지남) / `dl_verbal`(말·메시지로만 기한을 들음) / `dl_unclear`(기한이 분명하지 않음) | Q11-M |
| `unclear_deadlineSource` | `dls_none`(어디에도 없음) / `dls_doc`(서류에 적혀 있음) / `dls_message`(메시지·구두로만 들음) / `dls_unknown`(출처를 모름) | Q11-M |
| `unclear_actionTaken` | `act_nothing`(아무것도 하지 않음) / `act_asked`(보낸 곳에 문의함) / `act_clicked`(링크 열람·앱 설치) / `act_sent_info`(개인정보·서류 제출) / `act_sent_money`(송금함) / `act_replied`(답장·통화함) | Q12-M |
| `unclear_exposureLevel` | `exp_none`(노출 없음) / `exp_low`(노출 적음) / `exp_mid`(정보 노출 가능성) / `exp_info`(개인정보 노출) / `exp_money`(금전 피해 가능성) / `exp_contact`(연락이 이어진 상태) | Q12-M |
| `unclear_evidenceKind` | `ev_original`(원본 보관) / `ev_photo`(사진·캡처만 있음) / `ev_chat`(대화·통화 기록) / `ev_payment`(송금 내역·영수증) / `ev_partial`(일부를 잃어버림) / `ev_none`(남은 자료 없음) | Q13-M |
| `unclear_evidenceState` | `evs_strong`(자료가 충분함) / `evs_medium`(자료가 일부 있음) / `evs_weak`(자료가 부족함) | Q13-M |

## C-2. 서류 제출·출석 서류

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `unclear_documentForm` | `paper_official`(종이 공문) / `bill_form`(청구서·고지서 양식) / `email_body`(이메일) / `chat_message`(문자·메신저) / `link_code`(링크·큐알 코드 안내) / `verbal_only`(전화·방문으로 말로 들음) | Q1-D |
| `unclear_formGroup` | `form_formal`(정식 서류 형태) / `form_digital`(전자 메시지 형태) / `form_oral`(말로만 전달됨) | Q1-D |
| `unclear_senderClaim` | `tax_authority`(세무기관) / `police_court`(공안·경찰·검찰·법원) / `local_admin`(지방 행정기관) / `foreign_agency`(출입국·노동 관련 기관) / `bank_claim`(은행·금융회사) / `company_claim`(회사·통신·택배·플랫폼) / `unnamed_claim`(보낸 곳이 없거나 개인) | Q2-D |
| `unclear_senderGroup` | `grp_public`(공공기관) / `grp_finance`(금융회사) / `grp_private`(민간 업체) / `grp_unnamed`(보낸 곳이 불분명) | Q2-D |
| `unclear_contactPattern` | `first_contact`(처음 한 번 받음) / `once_earlier`(며칠 전에 한 번 받음) / `repeated_same`(같은 내용을 반복해서 받음) / `escalating_tone`(점점 강한 표현으로 바뀜) / `after_visit`(전화·방문 뒤에 받음) / `after_request`(내가 신청·문의한 뒤에 받음) | Q3-D |
| `unclear_contactFlow` | `flow_single`(한 번만 받음) / `flow_repeat`(반복해서 받음) / `flow_escalate`(강도가 높아짐) / `flow_followup`(연락 뒤에 이어짐) / `flow_expected`(내 요청과 이어짐) | Q3-D |
| `unclear_mainConcern` | `doubt_genuine`(진짜인지 모르겠음) / `doubt_what`(무엇을 내야 하는지 모르겠음) / `doubt_appear`(출석 여부가 걱정됨) / `doubt_deadline`(기한을 놓칠까 걱정함) / `doubt_privacy`(개인정보 제출이 걱정됨) / `doubt_done`(이미 응해서 불안함) / `doubt_none`(크게 걱정하지 않음) | Q4-D |
| `unclear_firstAction` | `next_sender`(먼저 보낸 곳 확인) / `next_basis`(먼저 근거 확인) / `next_deadline`(먼저 기한 확인) / `next_stop`(추가 응답을 멈추고 확인) / `next_keep`(차분히 보관하고 확인) | Q4-D |
| `unclear_identityMatch` | `id_exact`(내 정보가 정확히 맞음) / `id_partial`(이름만 맞고 일부 다름) / `id_generic`(일반 호칭만 있음) / `id_other`(다른 사람·회사 이름) / `id_unchecked`(아직 확인하지 않음) | Q5-D |
| `unclear_aimHint` | `aim_specific`(나를 특정한 서류) / `aim_partial`(일부만 특정됨) / `aim_generic`(불특정 다수 대상일 수 있음) / `aim_misdirected`(엉뚱한 수신일 수 있음) / `aim_unchecked`(확인 전) | Q5-D |
| `unclear_authenticityMark` | `mark_full`(기관명·번호·날짜·직인이 모두 있음) / `mark_partial`(일부 요소만 있음) / `mark_none`(공식 요소가 없음) / `mark_personal_contact`(개인 번호·일반 이메일) / `mark_link_only`(링크·큐알 코드로만 안내) / `mark_odd_text`(문장이 어색함) | Q6-D |
| `unclear_formality` | `fm_formal`(형식을 갖춤) / `fm_partial`(형식이 일부 부족함) / `fm_informal`(형식이 없음) / `fm_link`(링크로만 연결됨) / `fm_odd`(문체가 어색함) | Q6-D |
| `unclear_requestTarget` | `tgt_id_docs`(신분증·여권·체류 서류) / `tgt_business_docs`(사업자·회사 서류) / `tgt_contract_docs`(계약서·거래 서류) / `tgt_statement`(경위서·설명서) / `tgt_appear`(직접 출석·방문) / `tgt_online`(사이트 접속·앱 설치) | Q7-D |
| `unclear_targetGroup` | `grp_personal`(개인 신분 자료) / `grp_business`(사업 자료) / `grp_contract`(계약·거래 자료) / `grp_statement`(설명·진술) / `grp_appear`(출석·방문) / `grp_online`(온라인 접속) | Q7-D |
| `unclear_requestSpecificity` | `spec_full`(목록·양식이 모두 있음) / `spec_list_only`(목록만 있음) / `spec_vague`('관련 서류'로만 적힘) / `spec_none`(내용이 적혀 있지 않음) / `spec_contact_only`(연락만 요구) | Q8-D |
| `unclear_listQuality` | `list_clear`(구체적) / `list_partial`(일부만 구체적) / `list_vague`(모호함) / `list_none`(없음) / `list_contact`(연락 유도) | Q8-D |
| `unclear_deliveryMethod` | `deliver_visit`(지정 장소 방문) / `deliver_post`(우편·창구 접수) / `deliver_chat`(이메일·메신저로 전달) / `deliver_upload`(웹사이트 업로드) / `deliver_call`(전화·화상 통화) / `deliver_unstated`(방법이 적혀 있지 않음) | Q9-D |
| `unclear_deliveryGroup` | `dgrp_formal`(대면·우편 접수) / `dgrp_digital`(전자 전달) / `dgrp_unspecified`(방법 불명) | Q9-D |
| `unclear_pressureType` | `press_none`(압박 없음) / `press_deadline`(기한 안내) / `press_legal`(법적 조치·가산금 예고) / `press_rush`(지금 바로 하라고 재촉) / `press_threat`(계좌 동결·체포 등 강한 불이익) / `press_secret`(비밀 유지 요구) | Q10-D |
| `unclear_pressureLevel` | `lvl_none`(없음) / `lvl_low`(낮음) / `lvl_mid`(중간) / `lvl_high`(높음) | Q10-D |
| `unclear_deadlineStatus` | `dl_none`(기한 표시 없음) / `dl_far`(기한이 여유 있음) / `dl_near`(기한이 가까움) / `dl_passed`(기한이 이미 지남) / `dl_verbal`(말·메시지로만 기한을 들음) / `dl_unclear`(기한이 분명하지 않음) | Q11-D |
| `unclear_deadlineSource` | `dls_none`(어디에도 없음) / `dls_doc`(서류에 적혀 있음) / `dls_message`(메시지·구두로만 들음) / `dls_unknown`(출처를 모름) | Q11-D |
| `unclear_actionTaken` | `act_nothing`(아무것도 하지 않음) / `act_asked`(보낸 곳에 문의함) / `act_clicked`(링크 열람·앱 설치) / `act_sent_info`(개인정보·서류 제출) / `act_sent_money`(송금함) / `act_replied`(답장·통화함) | Q12-D |
| `unclear_exposureLevel` | `exp_none`(노출 없음) / `exp_low`(노출 적음) / `exp_mid`(정보 노출 가능성) / `exp_info`(개인정보 노출) / `exp_money`(금전 피해 가능성) / `exp_contact`(연락이 이어진 상태) | Q12-D |
| `unclear_evidenceKind` | `ev_original`(원본 보관) / `ev_photo`(사진·캡처만 있음) / `ev_chat`(대화·통화 기록) / `ev_payment`(송금 내역·영수증) / `ev_partial`(일부를 잃어버림) / `ev_none`(남은 자료 없음) | Q13-D |
| `unclear_evidenceState` | `evs_strong`(자료가 충분함) / `evs_medium`(자료가 일부 있음) / `evs_weak`(자료가 부족함) | Q13-D |

## C-3. 내용을 모르는 서류

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `unclear_documentForm` | `paper_official`(종이 공문) / `bill_form`(청구서·고지서 양식) / `email_body`(이메일) / `chat_message`(문자·메신저) / `link_code`(링크·큐알 코드 안내) / `verbal_only`(전화·방문으로 말로 들음) | Q1-N |
| `unclear_formGroup` | `form_formal`(정식 서류 형태) / `form_digital`(전자 메시지 형태) / `form_oral`(말로만 전달됨) | Q1-N |
| `unclear_senderClaim` | `tax_authority`(세무기관) / `police_court`(공안·경찰·검찰·법원) / `local_admin`(지방 행정기관) / `foreign_agency`(출입국·노동 관련 기관) / `bank_claim`(은행·금융회사) / `company_claim`(회사·통신·택배·플랫폼) / `unnamed_claim`(보낸 곳이 없거나 개인) | Q2-N |
| `unclear_senderGroup` | `grp_public`(공공기관) / `grp_finance`(금융회사) / `grp_private`(민간 업체) / `grp_unnamed`(보낸 곳이 불분명) | Q2-N |
| `unclear_contactPattern` | `first_contact`(처음 한 번 받음) / `once_earlier`(며칠 전에 한 번 받음) / `repeated_same`(같은 내용을 반복해서 받음) / `escalating_tone`(점점 강한 표현으로 바뀜) / `after_visit`(전화·방문 뒤에 받음) / `after_request`(내가 신청·문의한 뒤에 받음) | Q3-N |
| `unclear_contactFlow` | `flow_single`(한 번만 받음) / `flow_repeat`(반복해서 받음) / `flow_escalate`(강도가 높아짐) / `flow_followup`(연락 뒤에 이어짐) / `flow_expected`(내 요청과 이어짐) | Q3-N |
| `unclear_mainConcern` | `doubt_meaning`(무슨 뜻인지 모르겠음) / `doubt_genuine`(진짜인지 모르겠음) / `doubt_respond`(응해야 하는지 모르겠음) / `doubt_missing`(놓친 내용이 있을까 걱정함) / `doubt_done`(이미 응해서 불안함) / `doubt_none`(크게 걱정하지 않음) | Q4-N |
| `unclear_firstAction` | `next_understand`(먼저 내용 이해) / `next_sender`(먼저 보낸 곳 확인) / `next_deadline`(먼저 기한 확인) / `next_stop`(추가 응답을 멈추고 확인) / `next_keep`(차분히 보관하고 확인) | Q4-N |
| `unclear_identityMatch` | `id_exact`(내 정보가 정확히 맞음) / `id_partial`(이름만 맞고 일부 다름) / `id_generic`(일반 호칭만 있음) / `id_other`(다른 사람·회사 이름) / `id_unchecked`(아직 확인하지 않음) | Q5-N |
| `unclear_aimHint` | `aim_specific`(나를 특정한 서류) / `aim_partial`(일부만 특정됨) / `aim_generic`(불특정 다수 대상일 수 있음) / `aim_misdirected`(엉뚱한 수신일 수 있음) / `aim_unchecked`(확인 전) | Q5-N |
| `unclear_authenticityMark` | `mark_full`(기관명·번호·날짜·직인이 모두 있음) / `mark_partial`(일부 요소만 있음) / `mark_none`(공식 요소가 없음) / `mark_personal_contact`(개인 번호·일반 이메일) / `mark_link_only`(링크·큐알 코드로만 안내) / `mark_odd_text`(문장이 어색함) | Q6-N |
| `unclear_formality` | `fm_formal`(형식을 갖춤) / `fm_partial`(형식이 일부 부족함) / `fm_informal`(형식이 없음) / `fm_link`(링크로만 연결됨) / `fm_odd`(문체가 어색함) | Q6-N |
| `unclear_understandingLevel` | `und_most`(대부분 이해함) / `und_half`(절반쯤 이해함) / `und_little`(거의 이해하지 못함) / `und_language`(외국어라 읽기 어려움) / `und_blurry`(사진이 흐리거나 잘림) | Q7-N |
| `unclear_readability` | `read_ok`(읽는 데 문제 없음) / `read_hard`(읽기 어려움) / `read_lang`(언어 장벽) / `read_blurry`(화질 문제) | Q7-N |
| `unclear_keyElement` | `key_law`(법령 이름·조항 번호) / `key_agency`(기관 이름) / `key_numbers`(문서·사건·세금번호) / `key_money`(금액·계좌번호) / `key_date`(날짜·기한) / `key_contact`(링크·전화번호뿐) | Q8-N |
| `unclear_elementGroup` | `eg_legal`(법령 관련) / `eg_agency`(기관 관련) / `eg_numbers`(번호 관련) / `eg_money`(금전 관련) / `eg_date`(기한 관련) / `eg_contact`(연락처 관련) | Q8-N |
| `unclear_impliedRequest` | `imp_money`(돈을 내라는 것 같음) / `imp_submit`(서류·출석 요구 같음) / `imp_notice`(알려 주는 내용 같음) / `imp_contact`(연락하라는 말뿐) / `imp_unknown`(무엇을 요구하는지 모르겠음) | Q9-N |
| `unclear_requestHint` | `hint_pay`(납부 요구 가능성) / `hint_submit`(제출·출석 요구 가능성) / `hint_notice`(안내 성격) / `hint_contact`(연락 유도) / `hint_unknown`(판단 어려움) | Q9-N |
| `unclear_pressureType` | `press_none`(압박 없음) / `press_deadline`(기한 안내) / `press_legal`(법적 조치·가산금 예고) / `press_rush`(지금 바로 하라고 재촉) / `press_threat`(계좌 동결·체포 등 강한 불이익) / `press_secret`(비밀 유지 요구) | Q10-N |
| `unclear_pressureLevel` | `lvl_none`(없음) / `lvl_low`(낮음) / `lvl_mid`(중간) / `lvl_high`(높음) | Q10-N |
| `unclear_deadlineStatus` | `dl_none`(기한 표시 없음) / `dl_far`(기한이 여유 있음) / `dl_near`(기한이 가까움) / `dl_passed`(기한이 이미 지남) / `dl_verbal`(말·메시지로만 기한을 들음) / `dl_unclear`(기한이 분명하지 않음) | Q11-N |
| `unclear_deadlineSource` | `dls_none`(어디에도 없음) / `dls_doc`(서류에 적혀 있음) / `dls_message`(메시지·구두로만 들음) / `dls_unknown`(출처를 모름) | Q11-N |
| `unclear_actionTaken` | `act_nothing`(아무것도 하지 않음) / `act_asked`(보낸 곳에 문의함) / `act_clicked`(링크 열람·앱 설치) / `act_sent_info`(개인정보·서류 제출) / `act_sent_money`(송금함) / `act_replied`(답장·통화함) | Q12-N |
| `unclear_exposureLevel` | `exp_none`(노출 없음) / `exp_low`(노출 적음) / `exp_mid`(정보 노출 가능성) / `exp_info`(개인정보 노출) / `exp_money`(금전 피해 가능성) / `exp_contact`(연락이 이어진 상태) | Q12-N |
| `unclear_evidenceKind` | `ev_original`(원본 보관) / `ev_photo`(사진·캡처만 있음) / `ev_chat`(대화·통화 기록) / `ev_payment`(송금 내역·영수증) / `ev_partial`(일부를 잃어버림) / `ev_none`(남은 자료 없음) | Q13-N |
| `unclear_evidenceState` | `evs_strong`(자료가 충분함) / `evs_medium`(자료가 일부 있음) / `evs_weak`(자료가 부족함) | Q13-N |

# D. 라우팅

1. 진입 화면에서 ①은 경로 M, ②는 경로 D, ③과 ④ 잘 모르겠습니다, ⑤ 직접 입력은 경로 N으로 이동한다.
2. ③ 알리는 내용 같습니다와 잘 모르겠습니다는 같은 경로 N이지만 선택 방식(`unclear_routeSelectionMode`)을 다르게 저장한다.
3. 경로 안에서는 Q1부터 Q10까지 순서대로 진행하며 생략하지 않는다. 1차(Q1~Q4) 종료 시 E-1 무료 결과, 2차(Q5~Q10) 종료 시 E-2 결과를 표시한다.
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
| ① | `unclear_documentForm=paper_official`, `unclear_formGroup=form_formal` | 종이 공문 형태로 받은 납부 관련 서류입니다 | 24 |
| ② | `unclear_documentForm=bill_form`, `unclear_formGroup=form_formal` | 청구서·고지서 양식으로 받은 납부 관련 서류입니다 | 27 |
| ③ | `unclear_documentForm=email_body`, `unclear_formGroup=form_digital` | 이메일로 받은 납부 관련 서류입니다 | 19 |
| ④ | `unclear_documentForm=chat_message`, `unclear_formGroup=form_digital` | 문자나 메신저로 받은 납부 관련 서류입니다 | 23 |
| ⑤ | `unclear_documentForm=link_code`, `unclear_formGroup=form_digital` | 링크나 큐알 코드로 안내받은 납부 관련 서류입니다 | 27 |
| ⑥ | `unclear_documentForm=verbal_only`, `unclear_formGroup=form_oral` | 말로만 전해 들은 납부 관련 서류입니다 | 21 |

**카드2 (보낸 곳)** — Q2-M

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_senderClaim=tax_authority`, `unclear_senderGroup=grp_public` | 세무기관 이름으로 온 납부 관련 서류입니다 | 23 |
| ② | `unclear_senderClaim=police_court`, `unclear_senderGroup=grp_public` | 공안·경찰·검찰·법원 이름으로 온 납부 관련 서류입니다 | 30 |
| ③ | `unclear_senderClaim=local_admin`, `unclear_senderGroup=grp_public` | 지방 행정기관 이름으로 온 납부 관련 서류입니다 | 26 |
| ④ | `unclear_senderClaim=foreign_agency`, `unclear_senderGroup=grp_public` | 출입국·노동 관련 기관 이름으로 온 납부 관련 서류입니다 | 31 |
| ⑤ | `unclear_senderClaim=bank_claim`, `unclear_senderGroup=grp_finance` | 은행·금융회사 이름으로 온 납부 관련 서류입니다 | 26 |
| ⑥ | `unclear_senderClaim=company_claim`, `unclear_senderGroup=grp_private` | 회사·통신·택배사 이름으로 온 납부 관련 서류입니다 | 28 |
| ⑦ | `unclear_senderClaim=unnamed_claim`, `unclear_senderGroup=grp_unnamed` | 보낸 곳이 분명하지 않은 납부 관련 서류입니다 | 25 |

**카드3 (연락이 이어진 흐름)** — Q3-M

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_contactPattern=first_contact`, `unclear_contactFlow=flow_single` | 오늘이나 어제 처음 받은 납부 관련 서류입니다 | 25 |
| ② | `unclear_contactPattern=once_earlier`, `unclear_contactFlow=flow_single` | 며칠 전 한 번 받고 연락이 끊긴 납부 관련 서류입니다 | 30 |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_contactFlow=flow_repeat` | 같은 내용이 반복해서 온 납부 관련 서류입니다 | 25 |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_contactFlow=flow_escalate` | 표현이 점점 강해진 납부 관련 서류입니다 | 22 |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_contactFlow=flow_followup` | 전화·방문 뒤에 이어서 받은 납부 관련 서류입니다 | 27 |
| ⑥ | `unclear_contactPattern=after_request`, `unclear_contactFlow=flow_expected` | 내가 신청·문의한 뒤에 받은 납부 관련 서류입니다 | 27 |

**01 판정 + 본문** — Q4-M

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `unclear_mainConcern=doubt_genuine`, `unclear_firstAction=next_sender` | 진짜 여부 확인이 먼저 필요한 납부 요구입니다 | 보낸 곳이 공식 자료와 같은지 확인하기 전에는 돈을 보내지 않는 것이 안전합니다. 서류에 적힌 번호가 아니라 공식 자료의 연락처로 확인해 보세요. |
| ② | `unclear_mainConcern=doubt_owed`, `unclear_firstAction=next_basis` | 납부 의무의 근거 확인이 필요한 요구입니다 | 내야 하는 돈인지는 서류에 적힌 근거(조항·계약·부과 내역)로 따져 볼 수 있습니다. 근거가 적혀 있지 않다면 보낸 곳에 근거를 글로 요청해 보세요. |
| ③ | `unclear_mainConcern=doubt_amount`, `unclear_firstAction=next_basis` | 금액의 계산 근거 확인이 필요한 요구입니다 | 금액이 어떻게 계산되었는지 내역서나 계약과 대조해 보세요. 내역이 없다면 공식 경로로 산출 근거를 요청할 수 있습니다. |
| ④ | `unclear_mainConcern=doubt_deadline`, `unclear_firstAction=next_deadline` | 기한의 근거 확인이 급한 납부 요구입니다 | 기한이 서류에 적혀 있는지, 언제까지인지부터 확인하세요. 기한이 임박해도 확인 없이 송금하는 것은 피하고 날짜를 기록해 두세요. |
| ⑤ | `unclear_mainConcern=doubt_done`, `unclear_firstAction=next_stop` | 이미 응한 뒤라 추가 피해를 막는 것이 우선입니다 | 추가 요구가 오더라도 응하지 말고 송금·제출 내역과 대화를 그대로 보관하세요. 상황에 따라 은행·공식 기관 문의와 전문가 확인을 함께 살펴보세요. |
| ⑥ | `unclear_mainConcern=doubt_none`, `unclear_firstAction=next_keep` | 급하지 않게 차분히 확인해 볼 수 있는 서류입니다 | 요구 사항이 있는지부터 읽어 보고, 없다면 보관해 두어도 됩니다. 나중에 필요할 수 있으니 받은 날짜와 경로를 적어 두세요. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (m_exposed) | `unclear_actionTaken` ∈ {act_sent_money, act_sent_info, act_clicked} 또는 `unclear_exposureLevel` ∈ {exp_money, exp_info, exp_mid} 또는 `unclear_firstAction` ∈ {next_stop} | 이미 돈이나 개인정보를 보냈거나 링크를 열었다면 추가 피해를 막는 조치가 가장 급합니다 |
| 2 (m_payee) | `unclear_payee` ∈ {payee_person, payee_online, payee_cash} 또는 `unclear_paymentGroup` ∈ {pay_online, pay_cash} | 개인 계좌·링크·현금으로 내라는 요구는 기관의 공식 납부 방법과 같은지 확인이 필요합니다 |
| 3 (m_threat) | `unclear_pressureType` ∈ {press_threat, press_secret, press_rush} 또는 `unclear_pressureLevel` ∈ {lvl_high} 또는 `unclear_contactFlow` ∈ {flow_escalate, flow_repeat} | 강한 불이익을 말하거나 비밀·재촉을 요구하는 방식은 서두르게 만드는 신호일 수 있습니다 |
| 4 (m_sender) | `unclear_senderGroup` ∈ {grp_unnamed} 또는 `unclear_formality` ∈ {fm_informal, fm_link} 또는 `unclear_identityMatch` ∈ {id_generic, id_other} 또는 `unclear_authenticityMark` ∈ {mark_none, mark_personal_contact} 또는 `unclear_aimHint` ∈ {aim_misdirected} | 보낸 곳이나 내 정보가 분명하지 않아 진짜 서류인지부터 확인이 필요합니다 |
| 5 (m_deadline) | `unclear_deadlineStatus` ∈ {dl_near, dl_passed, dl_verbal} 또는 `unclear_deadlineSource` ∈ {dls_message} 또는 `unclear_mainConcern` ∈ {doubt_deadline} | 기한이 가깝거나 지났거나 말로만 전해졌다면 기한의 근거 서류부터 확인해야 합니다 |
| 6 (m_amount) | `unclear_amountTier` ∈ {tier_large, tier_xlarge, tier_unknown} 또는 `unclear_amountScale` ∈ {amt_over100m} 또는 `unclear_moneyNature` ∈ {nature_unstated} | 금액이 크거나 적혀 있지 않아 계산 근거를 서류로 확인해야 합니다 |
| 7 (m_evidence) | `unclear_evidenceState` ∈ {evs_weak} 또는 `unclear_evidenceKind` ∈ {ev_none, ev_partial} | 남은 자료가 부족해 지금 가진 자료를 먼저 보관해 두어야 합니다 |
| 기본 | 위 조건에 하나도 해당하지 않음 | 입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 돈을 보내기 전에 보낸 곳과 근거를 확인하세요 |

### E-1-D. 서류 제출·출석 서류

**카드1 (서류의 형태)** — Q1-D

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_documentForm=paper_official`, `unclear_formGroup=form_formal` | 종이 공문 형태로 받은 제출·출석 관련 서류입니다 | 27 |
| ② | `unclear_documentForm=bill_form`, `unclear_formGroup=form_formal` | 청구서·고지서 양식으로 받은 제출·출석 관련 서류입니다 | 30 |
| ③ | `unclear_documentForm=email_body`, `unclear_formGroup=form_digital` | 이메일로 받은 제출·출석 관련 서류입니다 | 22 |
| ④ | `unclear_documentForm=chat_message`, `unclear_formGroup=form_digital` | 문자나 메신저로 받은 제출·출석 관련 서류입니다 | 26 |
| ⑤ | `unclear_documentForm=link_code`, `unclear_formGroup=form_digital` | 링크나 큐알 코드로 안내받은 제출·출석 관련 서류입니다 | 30 |
| ⑥ | `unclear_documentForm=verbal_only`, `unclear_formGroup=form_oral` | 말로만 전해 들은 제출·출석 관련 서류입니다 | 24 |

**카드2 (보낸 곳)** — Q2-D

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_senderClaim=tax_authority`, `unclear_senderGroup=grp_public` | 세무기관 이름으로 온 제출·출석 관련 서류입니다 | 26 |
| ② | `unclear_senderClaim=police_court`, `unclear_senderGroup=grp_public` | 공안·경찰·검찰·법원 이름으로 온 제출·출석 관련 서류입니다 | 33 |
| ③ | `unclear_senderClaim=local_admin`, `unclear_senderGroup=grp_public` | 지방 행정기관 이름으로 온 제출·출석 관련 서류입니다 | 29 |
| ④ | `unclear_senderClaim=foreign_agency`, `unclear_senderGroup=grp_public` | 출입국·노동 관련 기관 이름으로 온 제출·출석 관련 서류입니다 | 34 |
| ⑤ | `unclear_senderClaim=bank_claim`, `unclear_senderGroup=grp_finance` | 은행·금융회사 이름으로 온 제출·출석 관련 서류입니다 | 29 |
| ⑥ | `unclear_senderClaim=company_claim`, `unclear_senderGroup=grp_private` | 회사·통신·택배사 이름으로 온 제출·출석 관련 서류입니다 | 31 |
| ⑦ | `unclear_senderClaim=unnamed_claim`, `unclear_senderGroup=grp_unnamed` | 보낸 곳이 분명하지 않은 제출·출석 관련 서류입니다 | 28 |

**카드3 (연락이 이어진 흐름)** — Q3-D

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_contactPattern=first_contact`, `unclear_contactFlow=flow_single` | 오늘이나 어제 처음 받은 제출·출석 관련 서류입니다 | 28 |
| ② | `unclear_contactPattern=once_earlier`, `unclear_contactFlow=flow_single` | 며칠 전 한 번 받고 연락이 끊긴 제출·출석 관련 서류입니다 | 33 |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_contactFlow=flow_repeat` | 같은 내용이 반복해서 온 제출·출석 관련 서류입니다 | 28 |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_contactFlow=flow_escalate` | 표현이 점점 강해진 제출·출석 관련 서류입니다 | 25 |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_contactFlow=flow_followup` | 전화·방문 뒤에 이어서 받은 제출·출석 관련 서류입니다 | 30 |
| ⑥ | `unclear_contactPattern=after_request`, `unclear_contactFlow=flow_expected` | 내가 신청·문의한 뒤에 받은 제출·출석 관련 서류입니다 | 30 |

**01 판정 + 본문** — Q4-D

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `unclear_mainConcern=doubt_genuine`, `unclear_firstAction=next_sender` | 진짜 여부 확인이 먼저 필요한 제출·출석 요구입니다 | 서류를 보내거나 방문하기 전에 보낸 곳이 공식 자료와 같은지 확인하세요. 서류에 적힌 연락처가 아니라 공식 자료의 연락처를 쓰는 것이 안전합니다. |
| ② | `unclear_mainConcern=doubt_what`, `unclear_firstAction=next_basis` | 요구 내용의 범위 확인이 필요한 제출 요구입니다 | 필요한 서류가 목록으로 적혀 있는지 먼저 확인하세요. 목록이 없다면 보낸 곳에 무엇을 내야 하는지 공식 경로로 문의할 수 있습니다. |
| ③ | `unclear_mainConcern=doubt_appear`, `unclear_firstAction=next_basis` | 출석 요구의 근거와 일정 확인이 필요한 상황입니다 | 출석 일시와 장소가 서류에 적혀 있는지, 공식 안내와 같은지 확인하세요. 안 갔을 때의 결과는 서류에 적힌 근거에 따라 달라지므로 내용을 정확히 읽어 보세요. |
| ④ | `unclear_mainConcern=doubt_deadline`, `unclear_firstAction=next_deadline` | 기한의 근거 확인이 급한 제출·출석 요구입니다 | 제출이나 출석 기한이 서류에 적혀 있는지부터 확인하세요. 기한이 가깝다면 서류 준비와 전문가 확인을 함께 살펴보세요. |
| ⑤ | `unclear_mainConcern=doubt_privacy`, `unclear_firstAction=next_sender` | 개인정보 제출 전에 요구가 공식인지 확인이 필요한 상황입니다 | 신분증이나 계좌 정보는 요구한 곳이 공식인지 확인하기 전에는 보내지 않는 것이 안전합니다. 꼭 필요한 항목만 내도 되는지도 문의해 보세요. |
| ⑥ | `unclear_mainConcern=doubt_done`, `unclear_firstAction=next_stop` | 이미 응한 뒤라 추가 응답 전에 정리가 필요한 상황입니다 | 무엇을 언제 보냈는지 사본과 함께 정리하고 추가 요구에는 응하기 전에 확인하세요. 필요하면 전문가와 함께 다음 단계를 살펴보세요. |
| ⑦ | `unclear_mainConcern=doubt_none`, `unclear_firstAction=next_keep` | 차분히 요구 내용을 확인해 볼 수 있는 서류입니다 | 무엇을 언제까지 하라는 것인지 읽어 보고 정리해 두세요. 나중에 필요하니 받은 날짜와 경로를 적어 두세요. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (d_exposed) | `unclear_actionTaken` ∈ {act_sent_money, act_sent_info, act_clicked} 또는 `unclear_exposureLevel` ∈ {exp_money, exp_info, exp_mid} 또는 `unclear_firstAction` ∈ {next_stop} | 이미 개인정보나 서류를 보냈거나 링크를 열었다면 추가 피해를 막는 조치가 먼저입니다 |
| 2 (d_data) | `unclear_requestTarget` ∈ {tgt_id_docs} 또는 `unclear_targetGroup` ∈ {grp_personal} 또는 `unclear_deliveryGroup` ∈ {dgrp_digital} 또는 `unclear_deliveryMethod` ∈ {deliver_chat, deliver_call} | 신분 자료를 메신저나 온라인으로 내라는 요구라면 요구한 곳이 공식인지 먼저 확인해야 합니다 |
| 3 (d_threat) | `unclear_pressureType` ∈ {press_threat, press_secret, press_rush} 또는 `unclear_pressureLevel` ∈ {lvl_high} 또는 `unclear_contactFlow` ∈ {flow_escalate, flow_repeat} | 강한 불이익이나 비밀·재촉이 있는 요구는 서두르게 만드는 신호일 수 있습니다 |
| 4 (d_sender) | `unclear_senderGroup` ∈ {grp_unnamed} 또는 `unclear_formality` ∈ {fm_informal, fm_link} 또는 `unclear_identityMatch` ∈ {id_generic, id_other} 또는 `unclear_authenticityMark` ∈ {mark_none, mark_personal_contact} 또는 `unclear_aimHint` ∈ {aim_misdirected} | 보낸 곳이나 내 정보가 분명하지 않아 진짜 요구인지부터 확인이 필요합니다 |
| 5 (d_vague) | `unclear_requestSpecificity` ∈ {spec_vague, spec_none, spec_contact_only} 또는 `unclear_listQuality` ∈ {list_vague, list_none, list_contact} 또는 `unclear_mainConcern` ∈ {doubt_what} | 무엇을 내야 하는지 분명하지 않아 공식 경로로 먼저 문의할 필요가 있습니다 |
| 6 (d_deadline) | `unclear_deadlineStatus` ∈ {dl_near, dl_passed, dl_verbal, dl_unclear} 또는 `unclear_deadlineSource` ∈ {dls_message, dls_unknown} 또는 `unclear_mainConcern` ∈ {doubt_deadline} | 제출이나 출석 기한이 가깝거나 지났거나 불분명해 기한의 근거를 먼저 확인해야 합니다 |
| 7 (d_appear) | `unclear_requestTarget` ∈ {tgt_appear, tgt_online} | 직접 방문이나 사이트 접속을 요구하고 있어 장소와 주소가 공식 자료와 같은지 확인이 필요합니다 |
| 기본 | 위 조건에 하나도 해당하지 않음 | 입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 제출하기 전에 요구가 공식인지 확인하세요 |

### E-1-N. 내용을 모르는 서류

**카드1 (서류의 형태)** — Q1-N

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_documentForm=paper_official`, `unclear_formGroup=form_formal` | 종이 공문 형태로 받은 내용이 불분명한 서류입니다 | 27 |
| ② | `unclear_documentForm=bill_form`, `unclear_formGroup=form_formal` | 청구서·고지서 양식으로 받은 내용이 불분명한 서류입니다 | 30 |
| ③ | `unclear_documentForm=email_body`, `unclear_formGroup=form_digital` | 이메일로 받은 내용이 불분명한 서류입니다 | 22 |
| ④ | `unclear_documentForm=chat_message`, `unclear_formGroup=form_digital` | 문자나 메신저로 받은 내용이 불분명한 서류입니다 | 26 |
| ⑤ | `unclear_documentForm=link_code`, `unclear_formGroup=form_digital` | 링크나 큐알 코드로 안내받은 내용이 불분명한 서류입니다 | 30 |
| ⑥ | `unclear_documentForm=verbal_only`, `unclear_formGroup=form_oral` | 말로만 전해 들은 내용이 불분명한 서류입니다 | 24 |

**카드2 (보낸 곳)** — Q2-N

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_senderClaim=tax_authority`, `unclear_senderGroup=grp_public` | 세무기관 이름으로 온 내용이 불분명한 서류입니다 | 26 |
| ② | `unclear_senderClaim=police_court`, `unclear_senderGroup=grp_public` | 공안·경찰·검찰·법원 이름으로 온 내용이 불분명한 서류입니다 | 33 |
| ③ | `unclear_senderClaim=local_admin`, `unclear_senderGroup=grp_public` | 지방 행정기관 이름으로 온 내용이 불분명한 서류입니다 | 29 |
| ④ | `unclear_senderClaim=foreign_agency`, `unclear_senderGroup=grp_public` | 출입국·노동 관련 기관 이름으로 온 내용이 불분명한 서류입니다 | 34 |
| ⑤ | `unclear_senderClaim=bank_claim`, `unclear_senderGroup=grp_finance` | 은행·금융회사 이름으로 온 내용이 불분명한 서류입니다 | 29 |
| ⑥ | `unclear_senderClaim=company_claim`, `unclear_senderGroup=grp_private` | 회사·통신·택배사 이름으로 온 내용이 불분명한 서류입니다 | 31 |
| ⑦ | `unclear_senderClaim=unnamed_claim`, `unclear_senderGroup=grp_unnamed` | 보낸 곳이 분명하지 않은 내용이 불분명한 서류입니다 | 28 |

**카드3 (연락이 이어진 흐름)** — Q3-N

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `unclear_contactPattern=first_contact`, `unclear_contactFlow=flow_single` | 오늘이나 어제 처음 받은 내용이 불분명한 서류입니다 | 28 |
| ② | `unclear_contactPattern=once_earlier`, `unclear_contactFlow=flow_single` | 며칠 전 한 번 받고 연락이 끊긴 내용이 불분명한 서류입니다 | 33 |
| ③ | `unclear_contactPattern=repeated_same`, `unclear_contactFlow=flow_repeat` | 같은 내용이 반복해서 온 내용이 불분명한 서류입니다 | 28 |
| ④ | `unclear_contactPattern=escalating_tone`, `unclear_contactFlow=flow_escalate` | 표현이 점점 강해진 내용이 불분명한 서류입니다 | 25 |
| ⑤ | `unclear_contactPattern=after_visit`, `unclear_contactFlow=flow_followup` | 전화·방문 뒤에 이어서 받은 내용이 불분명한 서류입니다 | 30 |
| ⑥ | `unclear_contactPattern=after_request`, `unclear_contactFlow=flow_expected` | 내가 신청·문의한 뒤에 받은 내용이 불분명한 서류입니다 | 30 |

**01 판정 + 본문** — Q4-N

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `unclear_mainConcern=doubt_meaning`, `unclear_firstAction=next_understand` | 내용을 이해하는 것이 먼저 필요한 서류입니다 | 무슨 뜻인지 모르는 서류에는 일단 응하지 않고 내용을 이해하는 것이 먼저입니다. 제목, 보낸 곳, 날짜 세 가지부터 정리해 보세요. |
| ② | `unclear_mainConcern=doubt_genuine`, `unclear_firstAction=next_sender` | 진짜 여부 확인이 필요한 불분명한 서류입니다 | 보낸 곳이 공식 자료와 같은지 확인하기 전에는 링크나 번호로 연락하지 않는 것이 안전합니다. 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요. |
| ③ | `unclear_mainConcern=doubt_respond`, `unclear_firstAction=next_understand` | 요구 사항이 있는지 구분하는 것이 필요한 서류입니다 | 서류에 해야 할 일이 적혀 있는지부터 구분해 보세요. 요구가 없다면 보관만 해도 되는 경우가 많습니다. |
| ④ | `unclear_mainConcern=doubt_missing`, `unclear_firstAction=next_deadline` | 놓친 내용이 없는지 앞뒤 자료와 함께 확인이 필요한 상황입니다 | 이 서류와 이어지는 이전 절차나 문의 기록이 있는지 함께 놓고 보세요. 날짜와 번호가 이어지는지 확인하면 연결이 보일 수 있습니다. |
| ⑤ | `unclear_mainConcern=doubt_done`, `unclear_firstAction=next_stop` | 이미 응한 뒤라 추가 응답 전에 확인이 필요한 상황입니다 | 무엇을 언제 보냈는지 정리해 두고 추가 연락에는 응하기 전에 확인하세요. 필요하면 전문가와 함께 살펴볼 수 있습니다. |
| ⑥ | `unclear_mainConcern=doubt_none`, `unclear_firstAction=next_keep` | 차분히 서류를 분류해 볼 수 있는 상황입니다 | 걱정이 크지 않다면 서류를 보관하고 어떤 서류인지 차근차근 분류해 보세요. 요구 사항이 없다면 급하게 움직일 필요는 없습니다. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (n_exposed) | `unclear_actionTaken` ∈ {act_sent_money, act_sent_info, act_clicked} 또는 `unclear_exposureLevel` ∈ {exp_money, exp_info, exp_mid} 또는 `unclear_firstAction` ∈ {next_stop} | 이미 돈이나 정보를 보냈거나 링크를 열었다면 추가 응답 전에 상황 정리가 먼저입니다 |
| 2 (n_sender) | `unclear_senderGroup` ∈ {grp_unnamed} 또는 `unclear_formality` ∈ {fm_informal, fm_link} 또는 `unclear_identityMatch` ∈ {id_generic, id_other} 또는 `unclear_authenticityMark` ∈ {mark_none, mark_personal_contact} 또는 `unclear_aimHint` ∈ {aim_misdirected} | 보낸 곳과 내 정보가 분명하지 않은 서류라 응하기 전에 발신처부터 확인해야 합니다 |
| 3 (n_understand) | `unclear_understandingLevel` ∈ {und_little, und_language, und_blurry} 또는 `unclear_readability` ∈ {read_hard, read_lang, read_blurry} 또는 `unclear_mainConcern` ∈ {doubt_meaning} | 내용을 충분히 이해하지 못한 상태라 핵심 부분부터 풀이하거나 번역받을 필요가 있습니다 |
| 4 (n_pressure) | `unclear_pressureType` ∈ {press_threat, press_secret, press_rush, press_legal} 또는 `unclear_contactFlow` ∈ {flow_escalate, flow_repeat} | 경고 문구나 재촉이 있어 서두르지 말고 근거를 확인할 필요가 있습니다 |
| 5 (n_hidden) | `unclear_impliedRequest` ∈ {imp_money, imp_submit, imp_contact} 또는 `unclear_requestHint` ∈ {hint_pay, hint_submit, hint_contact} 또는 `unclear_elementGroup` ∈ {eg_money, eg_contact} | 안내문처럼 보여도 돈·제출·연락을 요구하는 내용이 숨어 있을 수 있어 요구 사항을 따로 확인하세요 |
| 6 (n_deadline) | `unclear_deadlineStatus` ∈ {dl_near, dl_passed, dl_verbal, dl_unclear} | 기한이 분명하지 않거나 가깝다면 서류에서 기한의 근거부터 찾아야 합니다 |
| 7 (n_evidence) | `unclear_evidenceState` ∈ {evs_weak} 또는 `unclear_evidenceKind` ∈ {ev_none, ev_partial} | 남은 자료가 부족해 서류의 제목·보낸 곳·날짜를 먼저 글로 정리해 두어야 합니다 |
| 기본 | 위 조건에 하나도 해당하지 않음 | 입력하신 내용에서는 뚜렷한 위험 신호가 많지 않지만, 서류를 보관하고 어떤 서류인지 먼저 분류해 보세요 |

## E-2. 2차 결과 (경로별)

2차 결과는 질문 하나당 소제목 1개와 선택지별 문장 1개로 구성한다. 선택지의 저장 필드 쌍이 키이며, 문장은 선택한 구체 값을 반영한다. 직접 입력을 고른 질문은 `직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.`를 표시한다.

### E-2-M. 돈을 내라는 서류

**내 정보의 기재** — Q5-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_aimHint=aim_specific` | 내 정보가 정확히 적혀 있다면 실제 절차나 거래와 이어지는지 확인해 보세요. 정확하다고 해서 진짜라는 뜻은 아니므로 보낸 곳 확인을 함께 하세요. |
| ② | `unclear_identityMatch=id_partial`, `unclear_aimHint=aim_partial` | 일부만 맞다면 오래된 정보이거나 잘못 모은 정보일 수 있습니다. 어디서 나온 정보인지 보낸 쪽에 공식 경로로 물어볼 수 있습니다. |
| ③ | `unclear_identityMatch=id_generic`, `unclear_aimHint=aim_generic` | 받는 사람이 특정되지 않은 서류는 여러 사람에게 같은 내용이 간 것일 수 있습니다. 내 사정과 맞는 내용인지부터 따져 보세요. |
| ④ | `unclear_identityMatch=id_other`, `unclear_aimHint=aim_misdirected` | 다른 이름이 적혀 있다면 잘못 보낸 서류일 수 있습니다. 응하지 말고 받은 경위를 기록한 뒤 보낸 곳에 공식 경로로 확인하세요. |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_aimHint=aim_unchecked` | 이름·회사명·주소·번호가 맞는지 먼저 대조해 보세요. 하나라도 다르면 그 점을 메모해 두는 것이 확인의 시작입니다. |

**공식 문서 요소** — Q6-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_formality=fm_formal` | 공식 문서의 기본 요소가 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식은 흉내 낼 수 있으니 문서번호와 보낸 곳은 공식 자료로 대조하세요. |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_formality=fm_partial` | 빠진 요소가 무엇인지 적어 두세요. 같은 기관이 보낸 다른 문서와 비교하면 차이가 드러나는 경우가 있습니다. |
| ③ | `unclear_authenticityMark=mark_none`, `unclear_formality=fm_informal` | 공식 요소가 하나도 없는 문서는 근거로 삼기 어렵습니다. 문서번호나 담당자를 글로 요청해 보고, 답이 없다면 응하지 않는 것이 안전합니다. |
| ④ | `unclear_authenticityMark=mark_personal_contact`, `unclear_formality=fm_informal` | 기관 대표 번호나 공식 주소가 아니라면 같은 이름의 기관이 맞는지 확인이 필요합니다. 기관의 공식 사이트에 나온 연락처와 비교하세요. |
| ⑤ | `unclear_authenticityMark=mark_link_only`, `unclear_formality=fm_link` | 링크나 큐알 코드는 열기 전에 확인이 먼저입니다. 같은 기관의 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요. |
| ⑥ | `unclear_authenticityMark=mark_odd_text`, `unclear_formality=fm_odd` | 공식 문서에는 보통 정해진 문체가 있습니다. 어색한 부분을 표시해 두고 같은 기관의 다른 안내문과 비교해 보세요. |

**돈의 성격** — Q7-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_moneyNature=nature_tax`, `unclear_moneyReviewLink=link_tax` | 세금 명목이라면 납세 통지나 세무기관 공식 안내와 대조해 보세요. 세금 검토에서 이어서 확인할 수 있습니다. |
| ② | `unclear_moneyNature=nature_fine`, `unclear_moneyReviewLink=link_admin` | 부과 근거와 이의 제기 방법이 서류에 있는지 확인하세요. 행정문서 검토에서 이어서 볼 수 있습니다. |
| ③ | `unclear_moneyNature=nature_fee`, `unclear_moneyReviewLink=link_trade` | 어떤 서비스에 대한 요금인지 계약이나 이용 내역과 맞는지 확인하세요. 이용한 적이 없다면 근거를 요청할 수 있습니다. |
| ④ | `unclear_moneyNature=nature_debt`, `unclear_moneyReviewLink=link_trade` | 거래 서류와 입금 기록을 대조해 이미 낸 돈은 없는지 확인하세요. 확인 전에 서둘러 보내지 마세요. |
| ⑤ | `unclear_moneyNature=nature_deposit`, `unclear_moneyReviewLink=link_property` | 약속한 계약이 서류로 있는지가 우선입니다. 임대나 매매와 관련되어 보이면 부동산 검토에서 이어서 확인할 수 있습니다. |
| ⑥ | `unclear_moneyNature=nature_unstated`, `unclear_moneyReviewLink=link_none` | 명목 없이 돈만 요구한다면 무엇에 대한 돈인지 먼저 확인이 필요합니다. 명목을 글로 요청하고 답이 없다면 응하지 않는 것이 안전합니다. |

**금액 규모** — Q8-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_amountScale=amt_under1m`, `unclear_amountTier=tier_small` | 금액이 크지 않아도 근거 없이 내는 습관은 피하세요. 소액으로 시작해 점점 올리는 방식도 있어 근거 확인은 같습니다. |
| ② | `unclear_amountScale=amt_1m_10m`, `unclear_amountTier=tier_medium` | 중간 정도의 금액이라면 부과 근거와 계산 내역을 서류에서 먼저 확인하세요. 내역이 없다면 공식 경로로 요청하세요. |
| ③ | `unclear_amountScale=amt_10m_100m`, `unclear_amountTier=tier_large` | 큰 금액은 송금 전에 근거 서류와 계약, 입금 기록을 모두 대조하는 것이 좋습니다. 확인이 끝나기 전에는 송금을 미루세요. |
| ④ | `unclear_amountScale=amt_over100m`, `unclear_amountTier=tier_xlarge` | 매우 큰 금액은 단독으로 판단하지 말고 전문가 확인을 권합니다. 근거 서류와 상대 정보를 먼저 정리하세요. |
| ⑤ | `unclear_amountScale=amt_unstated`, `unclear_amountTier=tier_unknown` | 금액이 없는 납부 요구는 계산 근거부터 확인이 필요합니다. 금액을 글로 요청하고 구두로 들은 금액은 날짜와 함께 기록하세요. |

**입금 방식** — Q9-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_payee=payee_institution`, `unclear_paymentGroup=pay_account` | 계좌 명의가 보낸 기관과 같은지, 공식 안내의 납부 방법과 같은지 확인하세요. 공식 안내는 해당 기관의 사이트에서 찾을 수 있습니다. |
| ② | `unclear_payee=payee_company`, `unclear_paymentGroup=pay_account` | 회사 계좌라면 그 회사와 실제 거래가 있었는지, 사업자 정보가 확인되는지 살펴보세요. 계약이나 청구 이력과 대조하세요. |
| ③ | `unclear_payee=payee_person`, `unclear_paymentGroup=pay_account` | 기관이나 회사 명의가 아닌 개인 계좌로 보내라는 요구는 특히 확인이 필요합니다. 보내기 전에 보낸 곳의 공식 납부 방법을 확인하세요. |
| ④ | `unclear_payee=payee_online`, `unclear_paymentGroup=pay_online` | 링크나 앱 결제는 열기 전에 주소와 설치 경로가 공식인지 확인이 필요합니다. 공식 사이트에 직접 접속해 같은 결제 안내가 있는지 보세요. |
| ⑤ | `unclear_payee=payee_cash`, `unclear_paymentGroup=pay_cash` | 현금이나 상품권은 되돌리기 어렵고 기록이 남지 않아 신중해야 합니다. 보내기 전에 공식 경로로 확인하고 전문가 확인을 살펴보세요. |
| ⑥ | `unclear_payee=payee_unstated`, `unclear_paymentGroup=pay_none` | 받는 곳이 없다면 연락을 유도하는 방식일 수 있어 주의가 필요합니다. 연락하기 전에 보낸 곳을 먼저 확인하세요. |

**압박의 방식** — Q10-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureLevel=lvl_none` | 압박이 없는 안내라면 급하게 움직일 이유는 서류에서 확인되지 않습니다. 요구 사항이 있는지 천천히 읽어 보세요. |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureLevel=lvl_low` | 기한만 안내한 경우에는 그 기한의 근거가 서류에 있는지 확인하면 됩니다. 날짜를 기록해 두세요. |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureLevel=lvl_mid` | 불이익을 예고하는 문구라면 어떤 근거로 어떤 절차가 이어지는지 서류에 적혀 있는지 확인하세요. 근거가 없다면 공식 경로로 문의가 필요합니다. |
| ④ | `unclear_pressureType=press_rush`, `unclear_pressureLevel=lvl_mid` | 재촉은 확인할 시간을 주지 않으려는 방식일 수 있어 주의가 필요합니다. 시간이 급해 보여도 보낸 곳 확인을 먼저 하세요. |
| ⑤ | `unclear_pressureType=press_threat`, `unclear_pressureLevel=lvl_high` | 강한 불이익을 앞세워 즉시 응하라는 연락은 그 자체로 의심할 만한 점입니다. 응하기 전에 공식 연락처로 확인하고 대화는 그대로 보관하세요. |
| ⑥ | `unclear_pressureType=press_secret`, `unclear_pressureLevel=lvl_high` | 비밀을 요구하는 것은 주변의 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람이나 전문가와 상의해 보세요. |

**기한** — Q11-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineSource=dls_none` | 기한이 없다면 서두를 이유가 서류에서는 확인되지 않습니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요. |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineSource=dls_doc` | 서류에 기한이 있고 여유가 있다면 그 안에 확인을 마칠 수 있습니다. 기한 날짜를 달력에 표시해 두세요. |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineSource=dls_doc` | 기한이 가깝다면 확인과 준비를 동시에 시작해야 합니다. 응하기 어려운 부분은 기한 연장이 가능한지 공식 경로로 문의하세요. |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineSource=dls_doc` | 기한이 지났더라도 바로 포기하지 말고 가능한 조치를 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관하세요. |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineSource=dls_message` | 서류 없이 말로만 정한 기한은 근거가 확인되지 않은 상태입니다. 기한의 근거 서류를 요청하고 요청한 기록을 남기세요. |
| ⑥ | `unclear_deadlineStatus=dl_unclear`, `unclear_deadlineSource=dls_unknown` | 기한이 분명하지 않다면 서류에서 날짜나 기간 표현을 먼저 찾아보세요. 찾을 수 없다면 보낸 곳에 기한이 있는지 확인이 필요합니다. |

**이미 한 조치** — Q12-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_exposureLevel=exp_none` | 아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 확인부터 시작하세요. |
| ② | `unclear_actionTaken=act_asked`, `unclear_exposureLevel=exp_low` | 문의만 했다면 문의한 날짜와 방법, 받은 답을 기록해 두세요. 서류에 적힌 연락처로 물었다면 그 연락처가 맞는지도 확인이 필요합니다. |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_exposureLevel=exp_mid` | 링크를 열었거나 앱을 설치했다면 추가 입력은 멈추고 설치한 앱은 지우는 것을 살펴보세요. 입력한 정보가 있다면 어떤 정보인지 기록하세요. |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_exposureLevel=exp_info` | 보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 신분증이나 계좌 정보를 보냈다면 관련 기관이나 은행에 알리는 방법을 확인하세요. |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_exposureLevel=exp_money` | 송금 내역과 받는 계좌 정보를 그대로 보관하고 가능한 한 빨리 은행에 문의하세요. 추가로 보내라는 요구가 와도 응하지 말고 사기 검토에서 이어서 확인할 수 있습니다. |
| ⑥ | `unclear_actionTaken=act_replied`, `unclear_exposureLevel=exp_contact` | 무엇을 말했는지 날짜와 함께 정리해 두세요. 이후 연락이 오더라도 요구에 응하기 전에 보낸 곳 확인이 먼저입니다. |

**남은 자료** — Q13-M

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceState=evs_strong` | 원본이 있으면 검토가 가장 정확해집니다. 원본은 훼손하지 말고 사본을 만들어 사용하세요. |
| ② | `unclear_evidenceKind=ev_photo`, `unclear_evidenceState=evs_medium` | 사진은 글자가 모두 보이고 날짜가 확인되도록 다시 정리해 두면 좋습니다. 가능하면 원본 확보 방법도 알아보세요. |
| ③ | `unclear_evidenceKind=ev_chat`, `unclear_evidenceState=evs_medium` | 대화와 통화 기록은 날짜와 상대 번호가 보이게 그대로 보관하세요. 삭제하지 말고 화면을 순서대로 캡처해 두면 도움이 됩니다. |
| ④ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceState=evs_strong` | 송금 내역은 금액·날짜·받는 계좌가 보이게 보관하세요. 이 자료는 이후 확인과 문의에서 가장 중요하게 쓰입니다. |
| ⑤ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceState=evs_weak` | 잃어버린 부분은 발급처나 통신사에 다시 요청할 수 있는지 알아보세요. 기억나는 내용은 날짜와 함께 먼저 글로 적어 두세요. |
| ⑥ | `unclear_evidenceKind=ev_none`, `unclear_evidenceState=evs_weak` | 자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 확인에 도움이 됩니다. 전문가 진행에서 함께 정리할 수 있습니다. |

### E-2-D. 서류 제출·출석 서류

**내 정보의 기재** — Q5-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_aimHint=aim_specific` | 내 정보가 정확히 적혀 있다면 실제 절차나 거래와 이어지는지 확인해 보세요. 정확하다고 해서 진짜라는 뜻은 아니므로 보낸 곳 확인을 함께 하세요. |
| ② | `unclear_identityMatch=id_partial`, `unclear_aimHint=aim_partial` | 일부만 맞다면 오래된 정보이거나 잘못 모은 정보일 수 있습니다. 어디서 나온 정보인지 보낸 쪽에 공식 경로로 물어볼 수 있습니다. |
| ③ | `unclear_identityMatch=id_generic`, `unclear_aimHint=aim_generic` | 받는 사람이 특정되지 않은 서류는 여러 사람에게 같은 내용이 간 것일 수 있습니다. 내 사정과 맞는 내용인지부터 따져 보세요. |
| ④ | `unclear_identityMatch=id_other`, `unclear_aimHint=aim_misdirected` | 다른 이름이 적혀 있다면 잘못 보낸 서류일 수 있습니다. 응하지 말고 받은 경위를 기록한 뒤 보낸 곳에 공식 경로로 확인하세요. |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_aimHint=aim_unchecked` | 이름·회사명·주소·번호가 맞는지 먼저 대조해 보세요. 하나라도 다르면 그 점을 메모해 두는 것이 확인의 시작입니다. |

**공식 문서 요소** — Q6-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_formality=fm_formal` | 공식 문서의 기본 요소가 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식은 흉내 낼 수 있으니 문서번호와 보낸 곳은 공식 자료로 대조하세요. |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_formality=fm_partial` | 빠진 요소가 무엇인지 적어 두세요. 같은 기관이 보낸 다른 문서와 비교하면 차이가 드러나는 경우가 있습니다. |
| ③ | `unclear_authenticityMark=mark_none`, `unclear_formality=fm_informal` | 공식 요소가 하나도 없는 문서는 근거로 삼기 어렵습니다. 문서번호나 담당자를 글로 요청해 보고, 답이 없다면 응하지 않는 것이 안전합니다. |
| ④ | `unclear_authenticityMark=mark_personal_contact`, `unclear_formality=fm_informal` | 기관 대표 번호나 공식 주소가 아니라면 같은 이름의 기관이 맞는지 확인이 필요합니다. 기관의 공식 사이트에 나온 연락처와 비교하세요. |
| ⑤ | `unclear_authenticityMark=mark_link_only`, `unclear_formality=fm_link` | 링크나 큐알 코드는 열기 전에 확인이 먼저입니다. 같은 기관의 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요. |
| ⑥ | `unclear_authenticityMark=mark_odd_text`, `unclear_formality=fm_odd` | 공식 문서에는 보통 정해진 문체가 있습니다. 어색한 부분을 표시해 두고 같은 기관의 다른 안내문과 비교해 보세요. |

**요구하는 것** — Q7-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_requestTarget=tgt_id_docs`, `unclear_targetGroup=grp_personal` | 신분 자료는 요구한 곳이 공식인지 확인한 뒤 필요한 항목만 내는 것이 안전합니다. 사본에는 용도를 적어 두는 방법도 있습니다. |
| ② | `unclear_requestTarget=tgt_business_docs`, `unclear_targetGroup=grp_business` | 사업 서류는 요구한 기관이 해당 서류를 요구할 권한이 있는지 확인하세요. 제출 전에 사본을 만들어 두세요. |
| ③ | `unclear_requestTarget=tgt_contract_docs`, `unclear_targetGroup=grp_contract` | 계약·거래 서류 요구는 그 거래의 상대가 맞는지 확인하는 것이 먼저입니다. 부동산 거래와 관련되어 보이면 부동산 검토에서 이어서 확인할 수 있습니다. |
| ④ | `unclear_requestTarget=tgt_statement`, `unclear_targetGroup=grp_statement` | 진술은 한번 내면 바꾸기 어려울 수 있어 내용을 신중히 정리하세요. 작성한 내용은 사본을 남기고 낼 곳을 먼저 확인하세요. |
| ⑤ | `unclear_requestTarget=tgt_appear`, `unclear_targetGroup=grp_appear` | 일시와 장소가 공식 자료와 맞는지 확인하세요. 혼자 가기 어렵다면 동행이나 통역을 구하는 것도 방법입니다. |
| ⑥ | `unclear_requestTarget=tgt_online`, `unclear_targetGroup=grp_online` | 접속 주소와 앱 설치 경로가 공식인지 먼저 확인하세요. 공식 사이트에 직접 접속해 같은 안내가 있는지 보세요. |

**요구의 구체성** — Q8-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_requestSpecificity=spec_full`, `unclear_listQuality=list_clear` | 목록과 양식이 갖춰져 있다면 같은 양식이 공식 자료에도 있는지 대조해 보세요. 빠진 서류가 없는지 내 보관 서류와 비교하세요. |
| ② | `unclear_requestSpecificity=spec_list_only`, `unclear_listQuality=list_partial` | 양식이 없다면 형식을 어떻게 맞출지 보낸 곳에 공식 경로로 확인하세요. 문의 내용은 기록해 두세요. |
| ③ | `unclear_requestSpecificity=spec_vague`, `unclear_listQuality=list_vague` | 무엇을 내야 하는지 불분명한 요구는 구체적인 목록을 글로 요청하세요. 막연한 요구에 서류를 한꺼번에 보내는 것은 피하세요. |
| ④ | `unclear_requestSpecificity=spec_none`, `unclear_listQuality=list_none` | 요구 내용이 없다면 요구의 근거부터 확인해야 합니다. 서류의 목적과 담당자를 글로 요청해 보세요. |
| ⑤ | `unclear_requestSpecificity=spec_contact_only`, `unclear_listQuality=list_contact` | 연락만 하라는 서류는 연락을 유도하는 방식일 수 있습니다. 서류의 번호가 아닌 공식 연락처로 사실 여부를 먼저 확인하세요. |

**제출·출석 방법** — Q9-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_deliveryMethod=deliver_visit`, `unclear_deliveryGroup=dgrp_formal` | 방문 장소가 공식 자료에 나온 주소와 같은지 확인하세요. 방문 전에 필요한 서류와 시간을 다시 확인하세요. |
| ② | `unclear_deliveryMethod=deliver_post`, `unclear_deliveryGroup=dgrp_formal` | 우편이나 창구 접수라면 접수 증빙을 받아 두세요. 보낸 날짜와 수령 확인 자료를 보관하는 것이 좋습니다. |
| ③ | `unclear_deliveryMethod=deliver_chat`, `unclear_deliveryGroup=dgrp_digital` | 이메일이나 메신저 제출은 받는 주소가 공식인지 확인이 필요합니다. 공식 자료에 나온 주소와 같은지 비교하세요. |
| ④ | `unclear_deliveryMethod=deliver_upload`, `unclear_deliveryGroup=dgrp_digital` | 접속 주소가 공식 사이트인지 먼저 확인하세요. 공식 사이트에서 직접 찾아 들어가 같은 절차가 있는지 보세요. |
| ⑤ | `unclear_deliveryMethod=deliver_call`, `unclear_deliveryGroup=dgrp_digital` | 통화로 서류나 정보를 말하는 것은 기록이 남지 않아 신중해야 합니다. 통화 요구는 서류로 다시 받을 수 있는지 요청하세요. |
| ⑥ | `unclear_deliveryMethod=deliver_unstated`, `unclear_deliveryGroup=dgrp_unspecified` | 방법이 없다면 공식 방법을 먼저 확인해야 합니다. 보낸 곳의 공식 연락처로 제출 방법을 문의하세요. |

**압박의 방식** — Q10-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureLevel=lvl_none` | 압박이 없는 안내라면 급하게 움직일 이유는 서류에서 확인되지 않습니다. 요구 사항이 있는지 천천히 읽어 보세요. |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureLevel=lvl_low` | 기한만 안내한 경우에는 그 기한의 근거가 서류에 있는지 확인하면 됩니다. 날짜를 기록해 두세요. |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureLevel=lvl_mid` | 불이익을 예고하는 문구라면 어떤 근거로 어떤 절차가 이어지는지 서류에 적혀 있는지 확인하세요. 근거가 없다면 공식 경로로 문의가 필요합니다. |
| ④ | `unclear_pressureType=press_rush`, `unclear_pressureLevel=lvl_mid` | 재촉은 확인할 시간을 주지 않으려는 방식일 수 있어 주의가 필요합니다. 시간이 급해 보여도 보낸 곳 확인을 먼저 하세요. |
| ⑤ | `unclear_pressureType=press_threat`, `unclear_pressureLevel=lvl_high` | 강한 불이익을 앞세워 즉시 응하라는 연락은 그 자체로 의심할 만한 점입니다. 응하기 전에 공식 연락처로 확인하고 대화는 그대로 보관하세요. |
| ⑥ | `unclear_pressureType=press_secret`, `unclear_pressureLevel=lvl_high` | 비밀을 요구하는 것은 주변의 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람이나 전문가와 상의해 보세요. |

**기한** — Q11-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineSource=dls_none` | 기한이 없다면 서두를 이유가 서류에서는 확인되지 않습니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요. |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineSource=dls_doc` | 서류에 기한이 있고 여유가 있다면 그 안에 확인을 마칠 수 있습니다. 기한 날짜를 달력에 표시해 두세요. |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineSource=dls_doc` | 기한이 가깝다면 확인과 준비를 동시에 시작해야 합니다. 응하기 어려운 부분은 기한 연장이 가능한지 공식 경로로 문의하세요. |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineSource=dls_doc` | 기한이 지났더라도 바로 포기하지 말고 가능한 조치를 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관하세요. |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineSource=dls_message` | 서류 없이 말로만 정한 기한은 근거가 확인되지 않은 상태입니다. 기한의 근거 서류를 요청하고 요청한 기록을 남기세요. |
| ⑥ | `unclear_deadlineStatus=dl_unclear`, `unclear_deadlineSource=dls_unknown` | 기한이 분명하지 않다면 서류에서 날짜나 기간 표현을 먼저 찾아보세요. 찾을 수 없다면 보낸 곳에 기한이 있는지 확인이 필요합니다. |

**이미 한 조치** — Q12-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_exposureLevel=exp_none` | 아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 확인부터 시작하세요. |
| ② | `unclear_actionTaken=act_asked`, `unclear_exposureLevel=exp_low` | 문의만 했다면 문의한 날짜와 방법, 받은 답을 기록해 두세요. 서류에 적힌 연락처로 물었다면 그 연락처가 맞는지도 확인이 필요합니다. |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_exposureLevel=exp_mid` | 링크를 열었거나 앱을 설치했다면 추가 입력은 멈추고 설치한 앱은 지우는 것을 살펴보세요. 입력한 정보가 있다면 어떤 정보인지 기록하세요. |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_exposureLevel=exp_info` | 보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 신분증이나 계좌 정보를 보냈다면 관련 기관이나 은행에 알리는 방법을 확인하세요. |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_exposureLevel=exp_money` | 송금 내역과 받는 계좌 정보를 그대로 보관하고 가능한 한 빨리 은행에 문의하세요. 추가로 보내라는 요구가 와도 응하지 말고 사기 검토에서 이어서 확인할 수 있습니다. |
| ⑥ | `unclear_actionTaken=act_replied`, `unclear_exposureLevel=exp_contact` | 무엇을 말했는지 날짜와 함께 정리해 두세요. 이후 연락이 오더라도 요구에 응하기 전에 보낸 곳 확인이 먼저입니다. |

**남은 자료** — Q13-D

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceState=evs_strong` | 원본이 있으면 검토가 가장 정확해집니다. 원본은 훼손하지 말고 사본을 만들어 사용하세요. |
| ② | `unclear_evidenceKind=ev_photo`, `unclear_evidenceState=evs_medium` | 사진은 글자가 모두 보이고 날짜가 확인되도록 다시 정리해 두면 좋습니다. 가능하면 원본 확보 방법도 알아보세요. |
| ③ | `unclear_evidenceKind=ev_chat`, `unclear_evidenceState=evs_medium` | 대화와 통화 기록은 날짜와 상대 번호가 보이게 그대로 보관하세요. 삭제하지 말고 화면을 순서대로 캡처해 두면 도움이 됩니다. |
| ④ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceState=evs_strong` | 송금 내역은 금액·날짜·받는 계좌가 보이게 보관하세요. 이 자료는 이후 확인과 문의에서 가장 중요하게 쓰입니다. |
| ⑤ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceState=evs_weak` | 잃어버린 부분은 발급처나 통신사에 다시 요청할 수 있는지 알아보세요. 기억나는 내용은 날짜와 함께 먼저 글로 적어 두세요. |
| ⑥ | `unclear_evidenceKind=ev_none`, `unclear_evidenceState=evs_weak` | 자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 확인에 도움이 됩니다. 전문가 진행에서 함께 정리할 수 있습니다. |

### E-2-N. 내용을 모르는 서류

**내 정보의 기재** — Q5-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_identityMatch=id_exact`, `unclear_aimHint=aim_specific` | 내 정보가 정확히 적혀 있다면 실제 절차나 거래와 이어지는지 확인해 보세요. 정확하다고 해서 진짜라는 뜻은 아니므로 보낸 곳 확인을 함께 하세요. |
| ② | `unclear_identityMatch=id_partial`, `unclear_aimHint=aim_partial` | 일부만 맞다면 오래된 정보이거나 잘못 모은 정보일 수 있습니다. 어디서 나온 정보인지 보낸 쪽에 공식 경로로 물어볼 수 있습니다. |
| ③ | `unclear_identityMatch=id_generic`, `unclear_aimHint=aim_generic` | 받는 사람이 특정되지 않은 서류는 여러 사람에게 같은 내용이 간 것일 수 있습니다. 내 사정과 맞는 내용인지부터 따져 보세요. |
| ④ | `unclear_identityMatch=id_other`, `unclear_aimHint=aim_misdirected` | 다른 이름이 적혀 있다면 잘못 보낸 서류일 수 있습니다. 응하지 말고 받은 경위를 기록한 뒤 보낸 곳에 공식 경로로 확인하세요. |
| ⑤ | `unclear_identityMatch=id_unchecked`, `unclear_aimHint=aim_unchecked` | 이름·회사명·주소·번호가 맞는지 먼저 대조해 보세요. 하나라도 다르면 그 점을 메모해 두는 것이 확인의 시작입니다. |

**공식 문서 요소** — Q6-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_authenticityMark=mark_full`, `unclear_formality=fm_formal` | 공식 문서의 기본 요소가 갖춰져 있으면 확인할 근거가 있다는 뜻입니다. 다만 형식은 흉내 낼 수 있으니 문서번호와 보낸 곳은 공식 자료로 대조하세요. |
| ② | `unclear_authenticityMark=mark_partial`, `unclear_formality=fm_partial` | 빠진 요소가 무엇인지 적어 두세요. 같은 기관이 보낸 다른 문서와 비교하면 차이가 드러나는 경우가 있습니다. |
| ③ | `unclear_authenticityMark=mark_none`, `unclear_formality=fm_informal` | 공식 요소가 하나도 없는 문서는 근거로 삼기 어렵습니다. 문서번호나 담당자를 글로 요청해 보고, 답이 없다면 응하지 않는 것이 안전합니다. |
| ④ | `unclear_authenticityMark=mark_personal_contact`, `unclear_formality=fm_informal` | 기관 대표 번호나 공식 주소가 아니라면 같은 이름의 기관이 맞는지 확인이 필요합니다. 기관의 공식 사이트에 나온 연락처와 비교하세요. |
| ⑤ | `unclear_authenticityMark=mark_link_only`, `unclear_formality=fm_link` | 링크나 큐알 코드는 열기 전에 확인이 먼저입니다. 같은 기관의 공식 사이트에 직접 접속해서 같은 안내가 있는지 찾아보세요. |
| ⑥ | `unclear_authenticityMark=mark_odd_text`, `unclear_formality=fm_odd` | 공식 문서에는 보통 정해진 문체가 있습니다. 어색한 부분을 표시해 두고 같은 기관의 다른 안내문과 비교해 보세요. |

**이해 정도** — Q7-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_understandingLevel=und_most`, `unclear_readability=read_ok` | 대부분 이해했다면 이해되지 않는 나머지 부분을 표시해 두세요. 그 부분이 핵심일 수 있어 확인이 필요합니다. |
| ② | `unclear_understandingLevel=und_half`, `unclear_readability=read_ok` | 이해한 부분과 모르는 부분을 나누어 적어 보세요. 모르는 부분만 전문가에게 가져가면 시간이 줄어듭니다. |
| ③ | `unclear_understandingLevel=und_little`, `unclear_readability=read_hard` | 이해하지 못한 서류에는 응하지 않고 먼저 내용을 풀이받는 것이 안전합니다. 제목과 번호, 날짜를 먼저 정리하세요. |
| ④ | `unclear_understandingLevel=und_language`, `unclear_readability=read_lang` | 중요한 부분부터 번역을 받아 원본과 함께 보관하세요. 번역은 한 부분씩 나누어 받으면 확인하기 쉽습니다. |
| ⑤ | `unclear_understandingLevel=und_blurry`, `unclear_readability=read_blurry` | 글자가 모두 보이도록 밝은 곳에서 다시 찍어 두세요. 원본이 있다면 다시 확인할 수 있게 보관하세요. |

**눈에 띄는 요소** — Q8-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_keyElement=key_law`, `unclear_elementGroup=eg_legal` | 법령이나 조항 번호가 나온다면 그 조항이 무엇을 요구하는지 공식 자료로 확인해 보세요. 어떤 분야의 서류인지 분류에 도움이 됩니다. |
| ② | `unclear_keyElement=key_agency`, `unclear_elementGroup=eg_agency` | 기관 이름이 있다면 그 기관의 공식 연락처로 서류가 맞는지 확인할 수 있습니다. 서류에 적힌 연락처는 쓰지 마세요. |
| ③ | `unclear_keyElement=key_numbers`, `unclear_elementGroup=eg_numbers` | 번호가 무엇의 번호인지부터 구분해 표시해 두세요. 번호는 이후 확인에서 가장 큰 단서가 됩니다. |
| ④ | `unclear_keyElement=key_money`, `unclear_elementGroup=eg_money` | 금액이나 계좌가 보이는 서류는 돈을 요구하는 내용일 수 있습니다. 송금 전에 근거를 먼저 확인하세요. |
| ⑤ | `unclear_keyElement=key_date`, `unclear_elementGroup=eg_date` | 날짜가 보인다면 기한인지, 단순 발행일인지 구분해 보세요. 기한이라면 그 근거부터 확인하세요. |
| ⑥ | `unclear_keyElement=key_contact`, `unclear_elementGroup=eg_contact` | 내용 없이 연락처만 있다면 연락을 유도하는 방식일 수 있습니다. 연락하기 전에 공식 자료로 먼저 확인하세요. |

**요구의 느낌** — Q9-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_impliedRequest=imp_money`, `unclear_requestHint=hint_pay` | 돈을 요구하는 것 같다면 납부 관련 서류로 보고 보낸 곳과 근거를 먼저 확인하세요. 확인 전에는 송금하지 마세요. |
| ② | `unclear_impliedRequest=imp_submit`, `unclear_requestHint=hint_submit` | 제출이나 출석을 요구하는 것 같다면 무엇을 언제까지 해야 하는지 서류에서 찾아보세요. 공식 연락처로 사실 여부를 확인하세요. |
| ③ | `unclear_impliedRequest=imp_notice`, `unclear_requestHint=hint_notice` | 안내 성격이라면 요구 사항이 없는지 한 번 더 읽어 보세요. 요구가 없다면 보관해 두어도 충분합니다. |
| ④ | `unclear_impliedRequest=imp_contact`, `unclear_requestHint=hint_contact` | 연락만 하라는 서류는 연락하기 전에 보낸 곳 확인이 먼저입니다. 서류의 연락처가 아닌 공식 연락처를 쓰세요. |
| ⑤ | `unclear_impliedRequest=imp_unknown`, `unclear_requestHint=hint_unknown` | 판단이 어렵다면 서류를 그대로 보관하고 제목·보낸 곳·날짜부터 정리하세요. 이후 전문가 진행에서 함께 분류할 수 있습니다. |

**압박의 방식** — Q10-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_pressureType=press_none`, `unclear_pressureLevel=lvl_none` | 압박이 없는 안내라면 급하게 움직일 이유는 서류에서 확인되지 않습니다. 요구 사항이 있는지 천천히 읽어 보세요. |
| ② | `unclear_pressureType=press_deadline`, `unclear_pressureLevel=lvl_low` | 기한만 안내한 경우에는 그 기한의 근거가 서류에 있는지 확인하면 됩니다. 날짜를 기록해 두세요. |
| ③ | `unclear_pressureType=press_legal`, `unclear_pressureLevel=lvl_mid` | 불이익을 예고하는 문구라면 어떤 근거로 어떤 절차가 이어지는지 서류에 적혀 있는지 확인하세요. 근거가 없다면 공식 경로로 문의가 필요합니다. |
| ④ | `unclear_pressureType=press_rush`, `unclear_pressureLevel=lvl_mid` | 재촉은 확인할 시간을 주지 않으려는 방식일 수 있어 주의가 필요합니다. 시간이 급해 보여도 보낸 곳 확인을 먼저 하세요. |
| ⑤ | `unclear_pressureType=press_threat`, `unclear_pressureLevel=lvl_high` | 강한 불이익을 앞세워 즉시 응하라는 연락은 그 자체로 의심할 만한 점입니다. 응하기 전에 공식 연락처로 확인하고 대화는 그대로 보관하세요. |
| ⑥ | `unclear_pressureType=press_secret`, `unclear_pressureLevel=lvl_high` | 비밀을 요구하는 것은 주변의 확인을 막으려는 방식일 수 있습니다. 믿을 만한 사람이나 전문가와 상의해 보세요. |

**기한** — Q11-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_deadlineStatus=dl_none`, `unclear_deadlineSource=dls_none` | 기한이 없다면 서두를 이유가 서류에서는 확인되지 않습니다. 누군가 기한을 말한다면 그 근거를 글로 요청해 보세요. |
| ② | `unclear_deadlineStatus=dl_far`, `unclear_deadlineSource=dls_doc` | 서류에 기한이 있고 여유가 있다면 그 안에 확인을 마칠 수 있습니다. 기한 날짜를 달력에 표시해 두세요. |
| ③ | `unclear_deadlineStatus=dl_near`, `unclear_deadlineSource=dls_doc` | 기한이 가깝다면 확인과 준비를 동시에 시작해야 합니다. 응하기 어려운 부분은 기한 연장이 가능한지 공식 경로로 문의하세요. |
| ④ | `unclear_deadlineStatus=dl_passed`, `unclear_deadlineSource=dls_doc` | 기한이 지났더라도 바로 포기하지 말고 가능한 조치를 빨리 확인하는 것이 중요합니다. 받은 날짜를 증명할 자료를 보관하세요. |
| ⑤ | `unclear_deadlineStatus=dl_verbal`, `unclear_deadlineSource=dls_message` | 서류 없이 말로만 정한 기한은 근거가 확인되지 않은 상태입니다. 기한의 근거 서류를 요청하고 요청한 기록을 남기세요. |
| ⑥ | `unclear_deadlineStatus=dl_unclear`, `unclear_deadlineSource=dls_unknown` | 기한이 분명하지 않다면 서류에서 날짜나 기간 표현을 먼저 찾아보세요. 찾을 수 없다면 보낸 곳에 기한이 있는지 확인이 필요합니다. |

**이미 한 조치** — Q12-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_actionTaken=act_nothing`, `unclear_exposureLevel=exp_none` | 아직 아무 조치도 하지 않은 지금이 가장 안전하게 확인할 수 있는 시점입니다. 서류를 그대로 보관하고 확인부터 시작하세요. |
| ② | `unclear_actionTaken=act_asked`, `unclear_exposureLevel=exp_low` | 문의만 했다면 문의한 날짜와 방법, 받은 답을 기록해 두세요. 서류에 적힌 연락처로 물었다면 그 연락처가 맞는지도 확인이 필요합니다. |
| ③ | `unclear_actionTaken=act_clicked`, `unclear_exposureLevel=exp_mid` | 링크를 열었거나 앱을 설치했다면 추가 입력은 멈추고 설치한 앱은 지우는 것을 살펴보세요. 입력한 정보가 있다면 어떤 정보인지 기록하세요. |
| ④ | `unclear_actionTaken=act_sent_info`, `unclear_exposureLevel=exp_info` | 보낸 정보의 종류와 날짜를 정리하고 추가 요구에는 응하지 마세요. 신분증이나 계좌 정보를 보냈다면 관련 기관이나 은행에 알리는 방법을 확인하세요. |
| ⑤ | `unclear_actionTaken=act_sent_money`, `unclear_exposureLevel=exp_money` | 송금 내역과 받는 계좌 정보를 그대로 보관하고 가능한 한 빨리 은행에 문의하세요. 추가로 보내라는 요구가 와도 응하지 말고 사기 검토에서 이어서 확인할 수 있습니다. |
| ⑥ | `unclear_actionTaken=act_replied`, `unclear_exposureLevel=exp_contact` | 무엇을 말했는지 날짜와 함께 정리해 두세요. 이후 연락이 오더라도 요구에 응하기 전에 보낸 곳 확인이 먼저입니다. |

**남은 자료** — Q13-N

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `unclear_evidenceKind=ev_original`, `unclear_evidenceState=evs_strong` | 원본이 있으면 검토가 가장 정확해집니다. 원본은 훼손하지 말고 사본을 만들어 사용하세요. |
| ② | `unclear_evidenceKind=ev_photo`, `unclear_evidenceState=evs_medium` | 사진은 글자가 모두 보이고 날짜가 확인되도록 다시 정리해 두면 좋습니다. 가능하면 원본 확보 방법도 알아보세요. |
| ③ | `unclear_evidenceKind=ev_chat`, `unclear_evidenceState=evs_medium` | 대화와 통화 기록은 날짜와 상대 번호가 보이게 그대로 보관하세요. 삭제하지 말고 화면을 순서대로 캡처해 두면 도움이 됩니다. |
| ④ | `unclear_evidenceKind=ev_payment`, `unclear_evidenceState=evs_strong` | 송금 내역은 금액·날짜·받는 계좌가 보이게 보관하세요. 이 자료는 이후 확인과 문의에서 가장 중요하게 쓰입니다. |
| ⑤ | `unclear_evidenceKind=ev_partial`, `unclear_evidenceState=evs_weak` | 잃어버린 부분은 발급처나 통신사에 다시 요청할 수 있는지 알아보세요. 기억나는 내용은 날짜와 함께 먼저 글로 적어 두세요. |
| ⑥ | `unclear_evidenceKind=ev_none`, `unclear_evidenceState=evs_weak` | 자료가 없어도 기억나는 경위를 날짜순으로 적어 두면 확인에 도움이 됩니다. 전문가 진행에서 함께 정리할 수 있습니다. |

## E-3. 결과에서의 연결 안내 (권유 문구, 강제 아님)

| 연결 | 표시 조건 | 고객 화면 문구 |
|---|---|---|
| 세금 검토 | `unclear_senderClaim` ∈ {tax_authority} 또는 `unclear_moneyReviewLink` ∈ {link_tax} | 세금과 관련된 서류로 보인다면 세금 검토에서 이어서 확인해 보실 수 있습니다. |
| 행정문서 검토 | `unclear_senderClaim` ∈ {local_admin, foreign_agency} 또는 `unclear_moneyReviewLink` ∈ {link_admin} 또는 `unclear_contactPattern` ∈ {after_request} | 행정 절차와 관련된 서류로 보인다면 행정문서 검토에서 이어서 확인해 보실 수 있습니다. |
| 부동산 검토 | `unclear_moneyReviewLink` ∈ {link_property} 또는 `unclear_requestTarget` ∈ {tgt_contract_docs} | 부동산·계약과 관련된 서류로 보인다면 부동산 검토에서 이어서 확인해 보실 수 있습니다. |
| 사기 검토 | `unclear_senderClaim` ∈ {police_court} 또는 `unclear_exposureLevel` ∈ {exp_money, exp_info} 또는 `unclear_pressureLevel` ∈ {lvl_high} | 사기나 사칭이 의심되는 상황일 수 있으니 사기 검토에서 이어서 확인해 보실 수 있습니다. |
| 전문가 진행 | `unclear_deadlineStatus` ∈ {dl_passed} 또는 `unclear_amountTier` ∈ {tier_xlarge} 또는 `unclear_understandingLevel` ∈ {und_little, und_language} | 기한이 지났거나 금액이 크거나 내용을 이해하기 어렵다면 전문가와 함께 진행하는 방법도 있습니다. 필요하시면 전문가 진행을 선택해 주세요. |
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
| 선택지 총수(직접 입력 포함) | 90 | 91 | 89 |
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
| 값→고객 라벨 누락 | 0건(사용 값 209개) |
| 같은 값 다른 라벨 / 같은 필드 안 라벨 중복 | 0건 |
| 총 오류 / 경고 | 0 / 0 |

---

# G. 값 → 고객 표시 문구

내부 값은 화면·마이페이지·알림 어디에도 그대로 노출하지 않고 아래 문구로만 표시한다.

| 내부 값 | 고객 화면 표시 |
|---|---|
| `act_asked` | 보낸 곳에 문의함 |
| `act_clicked` | 링크 열람·앱 설치 |
| `act_nothing` | 아무것도 하지 않음 |
| `act_replied` | 답장·통화함 |
| `act_sent_info` | 개인정보·서류 제출 |
| `act_sent_money` | 송금함 |
| `after_request` | 내가 신청·문의한 뒤에 받음 |
| `after_visit` | 전화·방문 뒤에 받음 |
| `aim_generic` | 불특정 다수 대상일 수 있음 |
| `aim_misdirected` | 엉뚱한 수신일 수 있음 |
| `aim_partial` | 일부만 특정됨 |
| `aim_specific` | 나를 특정한 서류 |
| `aim_unchecked` | 확인 전 |
| `amt_10m_100m` | 1천만 동 이상 1억 동 미만 |
| `amt_1m_10m` | 100만 동 이상 1천만 동 미만 |
| `amt_over100m` | 1억 동 이상 |
| `amt_under1m` | 100만 동 미만 |
| `amt_unstated` | 금액이 적혀 있지 않음 |
| `bank_claim` | 은행·금융회사 |
| `bill_form` | 청구서·고지서 양식 |
| `chat_message` | 문자·메신저 |
| `company_claim` | 회사·통신·택배·플랫폼 |
| `deliver_call` | 전화·화상 통화 |
| `deliver_chat` | 이메일·메신저로 전달 |
| `deliver_post` | 우편·창구 접수 |
| `deliver_unstated` | 방법이 적혀 있지 않음 |
| `deliver_upload` | 웹사이트 업로드 |
| `deliver_visit` | 지정 장소 방문 |
| `dgrp_digital` | 전자 전달 |
| `dgrp_formal` | 대면·우편 접수 |
| `dgrp_unspecified` | 방법 불명 |
| `direct_input` | 직접 입력 |
| `direct_input_detail` | 직접 입력(상세) |
| `dl_far` | 기한이 여유 있음 |
| `dl_near` | 기한이 가까움 |
| `dl_none` | 기한 표시 없음 |
| `dl_passed` | 기한이 이미 지남 |
| `dl_unclear` | 기한이 분명하지 않음 |
| `dl_verbal` | 말·메시지로만 기한을 들음 |
| `dls_doc` | 서류에 적혀 있음 |
| `dls_message` | 메시지·구두로만 들음 |
| `dls_none` | 어디에도 없음 |
| `dls_unknown` | 출처를 모름 |
| `doubt_amount` | 금액이 맞는지 모르겠음 |
| `doubt_appear` | 출석 여부가 걱정됨 |
| `doubt_deadline` | 기한을 놓칠까 걱정함 |
| `doubt_done` | 이미 응해서 불안함 |
| `doubt_genuine` | 진짜인지 모르겠음 |
| `doubt_meaning` | 무슨 뜻인지 모르겠음 |
| `doubt_missing` | 놓친 내용이 있을까 걱정함 |
| `doubt_none` | 크게 걱정하지 않음 |
| `doubt_owed` | 내야 하는지 모르겠음 |
| `doubt_privacy` | 개인정보 제출이 걱정됨 |
| `doubt_respond` | 응해야 하는지 모르겠음 |
| `doubt_what` | 무엇을 내야 하는지 모르겠음 |
| `eg_agency` | 기관 관련 |
| `eg_contact` | 연락처 관련 |
| `eg_date` | 기한 관련 |
| `eg_legal` | 법령 관련 |
| `eg_money` | 금전 관련 |
| `eg_numbers` | 번호 관련 |
| `email_body` | 이메일 |
| `escalating_tone` | 점점 강한 표현으로 바뀜 |
| `ev_chat` | 대화·통화 기록 |
| `ev_none` | 남은 자료 없음 |
| `ev_original` | 원본 보관 |
| `ev_partial` | 일부를 잃어버림 |
| `ev_payment` | 송금 내역·영수증 |
| `ev_photo` | 사진·캡처만 있음 |
| `evs_medium` | 자료가 일부 있음 |
| `evs_strong` | 자료가 충분함 |
| `evs_weak` | 자료가 부족함 |
| `exp_contact` | 연락이 이어진 상태 |
| `exp_info` | 개인정보 노출 |
| `exp_low` | 노출 적음 |
| `exp_mid` | 정보 노출 가능성 |
| `exp_money` | 금전 피해 가능성 |
| `exp_none` | 노출 없음 |
| `first_contact` | 처음 한 번 받음 |
| `flow_escalate` | 강도가 높아짐 |
| `flow_expected` | 내 요청과 이어짐 |
| `flow_followup` | 연락 뒤에 이어짐 |
| `flow_repeat` | 반복해서 받음 |
| `flow_single` | 한 번만 받음 |
| `fm_formal` | 형식을 갖춤 |
| `fm_informal` | 형식이 없음 |
| `fm_link` | 링크로만 연결됨 |
| `fm_odd` | 문체가 어색함 |
| `fm_partial` | 형식이 일부 부족함 |
| `foreign_agency` | 출입국·노동 관련 기관 |
| `form_digital` | 전자 메시지 형태 |
| `form_formal` | 정식 서류 형태 |
| `form_oral` | 말로만 전달됨 |
| `grp_appear` | 출석·방문 |
| `grp_business` | 사업 자료 |
| `grp_contract` | 계약·거래 자료 |
| `grp_finance` | 금융회사 |
| `grp_online` | 온라인 접속 |
| `grp_personal` | 개인 신분 자료 |
| `grp_private` | 민간 업체 |
| `grp_public` | 공공기관 |
| `grp_statement` | 설명·진술 |
| `grp_unnamed` | 보낸 곳이 불분명 |
| `hint_contact` | 연락 유도 |
| `hint_notice` | 안내 성격 |
| `hint_pay` | 납부 요구 가능성 |
| `hint_submit` | 제출·출석 요구 가능성 |
| `hint_unknown` | 판단 어려움 |
| `id_exact` | 내 정보가 정확히 맞음 |
| `id_generic` | 일반 호칭만 있음 |
| `id_other` | 다른 사람·회사 이름 |
| `id_partial` | 이름만 맞고 일부 다름 |
| `id_unchecked` | 아직 확인하지 않음 |
| `imp_contact` | 연락하라는 말뿐 |
| `imp_money` | 돈을 내라는 것 같음 |
| `imp_notice` | 알려 주는 내용 같음 |
| `imp_submit` | 서류·출석 요구 같음 |
| `imp_unknown` | 무엇을 요구하는지 모르겠음 |
| `key_agency` | 기관 이름 |
| `key_contact` | 링크·전화번호뿐 |
| `key_date` | 날짜·기한 |
| `key_law` | 법령 이름·조항 번호 |
| `key_money` | 금액·계좌번호 |
| `key_numbers` | 문서·사건·세금번호 |
| `link_admin` | 행정문서 검토와 연결 |
| `link_code` | 링크·큐알 코드 안내 |
| `link_none` | 연결할 분야가 불분명 |
| `link_property` | 부동산·계약 검토와 연결 |
| `link_tax` | 세금 검토와 연결 |
| `link_trade` | 계약·이용 내역 대조 |
| `list_clear` | 구체적 |
| `list_contact` | 연락 유도 |
| `list_none` | 없음 |
| `list_partial` | 일부만 구체적 |
| `list_vague` | 모호함 |
| `local_admin` | 지방 행정기관 |
| `lvl_high` | 높음 |
| `lvl_low` | 낮음 |
| `lvl_mid` | 중간 |
| `lvl_none` | 없음 |
| `mark_full` | 기관명·번호·날짜·직인이 모두 있음 |
| `mark_link_only` | 링크·큐알 코드로만 안내 |
| `mark_none` | 공식 요소가 없음 |
| `mark_odd_text` | 문장이 어색함 |
| `mark_partial` | 일부 요소만 있음 |
| `mark_personal_contact` | 개인 번호·일반 이메일 |
| `nature_debt` | 채무·거래 대금 |
| `nature_deposit` | 보증금·선납금·예치금 |
| `nature_fee` | 서비스 이용료·요금 |
| `nature_fine` | 벌금·과태료·행정 수수료 |
| `nature_tax` | 세금·세무 관련 |
| `nature_unstated` | 명목이 적혀 있지 않음 |
| `next_basis` | 먼저 근거 확인 |
| `next_deadline` | 먼저 기한 확인 |
| `next_keep` | 차분히 보관하고 확인 |
| `next_sender` | 먼저 보낸 곳 확인 |
| `next_stop` | 추가 응답을 멈추고 확인 |
| `next_understand` | 먼저 내용 이해 |
| `notice_only` | 알리는 내용 같음 |
| `once_earlier` | 며칠 전에 한 번 받음 |
| `paper_official` | 종이 공문 |
| `pay` | 돈을 내라는 내용 같음 |
| `pay_account` | 계좌 이체 |
| `pay_cash` | 현금성 수단 |
| `pay_none` | 방법 불명 |
| `pay_online` | 온라인 결제 |
| `payee_cash` | 현금·상품권 |
| `payee_company` | 회사 이름 계좌 |
| `payee_institution` | 기관 이름 계좌 |
| `payee_online` | 링크·큐알·앱 결제 |
| `payee_person` | 개인 이름 계좌 |
| `payee_unstated` | 받는 곳이 적혀 있지 않음 |
| `police_court` | 공안·경찰·검찰·법원 |
| `press_deadline` | 기한 안내 |
| `press_legal` | 법적 조치·가산금 예고 |
| `press_none` | 압박 없음 |
| `press_rush` | 지금 바로 하라고 재촉 |
| `press_secret` | 비밀 유지 요구 |
| `press_threat` | 계좌 동결·체포 등 강한 불이익 |
| `read_blurry` | 화질 문제 |
| `read_hard` | 읽기 어려움 |
| `read_lang` | 언어 장벽 |
| `read_ok` | 읽는 데 문제 없음 |
| `repeated_same` | 같은 내용을 반복해서 받음 |
| `selected` | 직접 선택함 |
| `spec_contact_only` | 연락만 요구 |
| `spec_full` | 목록·양식이 모두 있음 |
| `spec_list_only` | 목록만 있음 |
| `spec_none` | 내용이 적혀 있지 않음 |
| `spec_vague` | '관련 서류'로만 적힘 |
| `submit_or_appear` | 서류 제출·출석 요구 같음 |
| `tax_authority` | 세무기관 |
| `tgt_appear` | 직접 출석·방문 |
| `tgt_business_docs` | 사업자·회사 서류 |
| `tgt_contract_docs` | 계약서·거래 서류 |
| `tgt_id_docs` | 신분증·여권·체류 서류 |
| `tgt_online` | 사이트 접속·앱 설치 |
| `tgt_statement` | 경위서·설명서 |
| `tier_large` | 큰 금액 |
| `tier_medium` | 중간 금액 |
| `tier_small` | 소액 |
| `tier_unknown` | 금액 불명 |
| `tier_xlarge` | 매우 큰 금액 |
| `und_blurry` | 사진이 흐리거나 잘림 |
| `und_half` | 절반쯤 이해함 |
| `und_language` | 외국어라 읽기 어려움 |
| `und_little` | 거의 이해하지 못함 |
| `und_most` | 대부분 이해함 |
| `unnamed_claim` | 보낸 곳이 없거나 개인 |
| `unsure` | 잘 모르겠음 |
| `verbal_only` | 전화·방문으로 말로 들음 |

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
