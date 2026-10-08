# A. 1차
## ■ Q1 (1차)
고객 화면  
질문: 지금 겪고 계신 세금 문제는 누구의, 어떤 상황과 관련되어 있나요?  
① 회사에서 급여를 받고 있는데, 회사가 세금을 떼고 준 금액이 맞는지, 제가 따로 신고할 것이 있는지 모르겠습니다.  
② 개인으로 일하거나 계약을 맺고 돈을 받고 있는데, 세금을 어떻게 신고해야 하고 누가 미리 떼어야 하는지 모르겠습니다.  
③ 베트남에 있는 집·방 임대 수입이나 해외에서 받은 돈이 있는데, 베트남에 신고해야 하는지 모르겠습니다.  
④ 회사에서 물건이나 서비스를 사고팔았는데, 부가가치세(VAT)와 전자 인보이스를 발행하거나 받은 내용이 실제 거래와 맞는지 모르겠습니다.  
⑤ 회사의 1년 수입·비용에 대한 세금(법인세) 신고를 준비 중이거나 이미 했는데, 내용이 맞는지 확인하고 싶습니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | tax_subject=individual / income_source=salary / open_issue=withholding_and_extra_filing |
| ② | tax_subject=individual / income_source=freelance_contract / open_issue=filing_method_and_withholding_party |
| ③ | tax_subject=individual / income_source=rental_or_foreign / open_issue=reporting_obligation |
| ④ | tax_subject=business / tax_area=vat_invoice / open_issue=transaction_invoice_match |
| ⑤ | tax_subject=business / tax_area=corporate_income / open_issue=filing_accuracy |
분기:  
① → Q2 → Q3 → Q4 → Q5 → 개인 2차 Q7 → Q8 → Q9 → Q12  
② → Q2 → Q3 → Q4 → Q5 → 개인 2차 Q7 → Q8 → Q9 → Q12  
③ → Q2 → Q3 → Q4 → Q5 → 개인 2차 Q7 → Q8 → Q9 → Q12  
④ → Q2 → Q3 → Q6 → 사업 2차 Q10 → Q12  
⑤ → Q2 → Q3 → Q6 → 사업 2차 Q11 → Q12
## ■ Q2 (1차)
고객 화면  
질문: 세금 신고나 납부 기한이 언제인지 알고 있으며, 현재 어떤 상태인가요?  
① 기한을 알고 있고 아직 여유가 있어, 필요한 자료를 준비하고 있습니다.  
② 기한이 얼마 남지 않았지만 정확한 날짜나 준비할 자료를 아직 확인하지 못했습니다.  
③ 신고나 납부 기한이 이미 지난 것 같지만, 세무기관에서 따로 연락받지는 않았습니다.  
④ 신고는 했지만 접수나 납부가 끝났는지 확실하지 않아 현재 상태를 확인하고 있습니다.  
⑤ 정확한 기한을 모르고 있어, 언제 무엇을 신고하거나 납부해야 하는지부터 확인하고 싶습니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | tax_deadline_status=upcoming / filing_stage=preparation / urgency=normal |
| ② | tax_deadline_status=near_due / filing_stage=preparation / urgency=high |
| ③ | tax_deadline_status=overdue / filing_stage=not_started / urgency=high |
| ④ | tax_deadline_status=processing_status_unknown / filing_stage=submitted_or_partial / urgency=medium |
| ⑤ | tax_deadline_status=unknown / filing_stage=not_started / urgency=high |
분기:  
① → Q3  
② → Q3  
③ → Q3  
④ → Q3  
⑤ → Q3
## ■ Q3 (1차)
고객 화면  
질문: 세무기관에서 받은 연락이나 문서가 있으며, 지금 어떤 대응이 필요한 상황인가요?  
① 세무기관에서 일반적인 세금 안내를 받았지만, 제 상황에 적용되는 내용과 준비할 자료를 확인하고 싶습니다.  
② 세금번호나 등록정보에 관한 연락을 받아, 어떤 정보가 문제인지 확인하고 싶습니다.  
③ 신고내용이나 자료를 제출하라는 요청을 받아, 무엇을 언제까지 내야 하는지 확인해야 합니다.  
④ 세금이나 납부와 관련된 통지를 받아, 문서 내용과 대응기한을 확인해야 합니다.  
⑤ 아직 세무기관에서 받은 연락이나 문서는 없습니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | authority_notice_type=general_guidance / authority_request=applicability_check / response_status=not_started |
| ② | authority_notice_type=tax_identity / authority_request=registration_update_check / response_status=not_started |
| ③ | authority_notice_type=filing_document_request / authority_request=evidence_submission / response_status=action_required |
| ④ | authority_notice_type=tax_payment_or_assessment_notice / authority_request=notice_content_check / response_status=action_required |
| ⑤ | authority_notice_type=none / authority_request=none / response_status=not_applicable |
분기:  
① → Q1 답에 따라 개인 Q4 또는 사업 Q6  
② → Q1 답에 따라 개인 Q4 또는 사업 Q6  
③ → **긴급 Stop → 결과 → 전문가 진행**  
④ → **긴급 Stop → 결과 → 전문가 진행**  
⑤ → Q1 답에 따라 개인 Q4 또는 사업 Q6
## ■ Q4 (1차 · 개인)
고객 화면  
질문: 세금번호(MST)를 가지고 있거나 등록하는 과정에서, 여권 정보와 연결된 문제가 있나요?  
① MST가 있지만 예전 여권으로 등록되어 있어, 새 여권 정보로 바뀌었는지 확인하고 싶습니다.  
② MST를 처음 등록하려고 하는데, 여권으로 어떤 등록을 해야 하는지와 발급 상태를 모르겠습니다.  
③ MST가 있지만 회사나 세무업무에서 조회되지 않아, 여권과 등록정보가 맞는지 확인하고 싶습니다.  
④ MST가 여러 개이거나 번호가 달라, 현재 어떤 번호를 사용해야 하는지 확인하고 싶습니다.  
⑤ MST 관련 문제는 없거나, 현재 어떤 문제가 있는지 잘 모르겠습니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | mst_status=existing / passport_status=old_passport_linked / mst_issue=passport_update |
| ② | mst_status=not_registered / passport_status=registration_needed / mst_issue=first_registration |
| ③ | mst_status=existing / passport_status=data_mismatch / mst_issue=system_lookup_failure |
| ④ | mst_status=multiple_or_unclear / passport_status=identity_conflict / mst_issue=duplicate_record_resolution |
| ⑤ | mst_status=no_issue_or_unknown / passport_status=unknown / mst_issue=no_issue_or_unknown |
분기: Q4 완료 → Q5
## ■ Q5 (1차 · 개인)
고객 화면  
질문: 실제로 받은 소득은 어떤 방식으로 발생했고, 세금 처리는 어디까지 확인되어 있나요?  
① 회사에서 급여를 정기적으로 받고 있고, 급여명세서에서 세금이 공제된 내용을 확인할 수 있습니다.  
② 계약이나 프로젝트로 돈을 받고 있고, 계약서와 지급받은 금액을 확인할 수 있지만 세금 처리는 더 확인해야 합니다.  
③ 베트남에서 임대료를 받고 있고, 임대계약과 실제 받은 금액을 확인할 수 있지만 신고 내용은 확인하지 못했습니다.  
④ 해외에서 돈을 받고 있고, 해외 지급자료는 있지만 베트남에서 어떻게 신고되었는지는 확인하지 못했습니다.  
⑤ 여러 방식으로 소득을 받고 있어, 각각의 소득과 세금 처리 내용을 구분해서 확인해야 합니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | income_source=salary / income_pattern=regular / withholding_status=employer_withheld / income_evidence=payroll |
| ② | income_source=freelance_contract / income_pattern=project_based / withholding_status=unknown / income_evidence=contract |
| ③ | income_source=rental_or_foreign / income_pattern=rental_regular / withholding_status=unknown / income_evidence=rental_agreement |
| ④ | income_source=rental_or_foreign / income_pattern=foreign_received / withholding_status=unknown / income_evidence=foreign_payment_record |
| ⑤ | income_source=mixed_income / income_pattern=multiple / withholding_status=unknown / income_evidence=mixed_records |
분기: Q5 완료 → Q1의 income_source를 Q5에서 다시 확인한 경우 Q5 값을 최종값으로 사용 → 개인 2차 Q7
## ■ Q6 (1차 · 사업)
고객 화면  
질문: 회사의 세금 문제는 거래 인보이스와 법인세 중 어느 부분을 확인해야 하나요?  
① 물건이나 서비스를 판매하고 전자 인보이스를 발행했는데, 거래금액과 VAT가 실제 거래와 맞는지 확인하고 싶습니다.  
② 물건이나 서비스를 구매하고 전자 인보이스를 받았는데, 회사정보·금액·VAT가 실제 구매와 맞는지 확인하고 싶습니다.  
③ 거래는 있었지만 전자 인보이스가 없거나 누락되어, 어떻게 처리해야 하는지 확인하고 싶습니다.  
④ 전자 인보이스의 회사정보·금액·날짜 등이 실제 거래와 달라, 수정이 필요한지 확인하고 싶습니다.  
⑤ 회사의 1년 수입·비용을 기준으로 법인세 신고를 준비하거나 이미 제출했는데, 신고내용이 실제 회계자료와 맞는지 확인하고 싶습니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | tax_area=vat_invoice / invoice_role=seller / invoice_status=issued / invoice_match=sales_transaction_match |
| ② | tax_area=vat_invoice / invoice_role=buyer / invoice_status=received / invoice_match=purchase_transaction_match |
| ③ | tax_area=vat_invoice / invoice_role=transaction_party / invoice_status=missing / invoice_match=transaction_without_invoice |
| ④ | tax_area=vat_invoice / invoice_role=transaction_party / invoice_status=issued_or_received / invoice_match=invoice_data_mismatch |
| ⑤ | tax_area=corporate_income / invoice_role=not_applicable / invoice_status=not_applicable / invoice_match=not_applicable |
분기:  
① → Q10 → Q12  
② → Q10 → Q12  
③ → Q10 → Q12  
④ → Q10 → Q12  
⑤ → Q11 → Q12
# B. 2차
## ■ Q7 (2차 · 개인)
고객 화면  
질문: MST와 관련해 어떤 자료를 가지고 있으며, 지금 확인해야 할 부분은 무엇인가요?  
① 새 여권과 기존 MST 자료가 있어, 두 정보가 제대로 연결되어 있는지 확인해야 합니다.  
② MST를 신청한 자료가 있어, 실제 발급 결과와 현재 등록상태를 확인해야 합니다.  
③ MST가 조회되지 않아, 여권과 기존 세금등록자료를 비교해 확인해야 합니다.  
④ MST가 여러 개로 보여, 기존 등록자료를 비교해 어떤 번호를 사용해야 하는지 확인해야 합니다.  
⑤ MST 관련 문제는 없거나 잘 모르겠어서, 현재 가진 여권·세금자료를 기준으로 확인해야 합니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | mst_evidence_status=available / mst_evidence_type=passport_and_mst_record / mst_issue=passport_update |
| ② | mst_evidence_status=available / mst_evidence_type=registration_application / mst_issue=first_registration |
| ③ | mst_evidence_status=partial / mst_evidence_type=passport_and_mst_record / mst_issue=system_lookup_failure |
| ④ | mst_evidence_status=partial / mst_evidence_type=passport_and_mst_record / mst_issue=duplicate_record_resolution |
| ⑤ | mst_evidence_status=unknown / mst_evidence_type=unknown / mst_issue=no_issue_or_unknown |
분기: Q7 완료 → Q8
## ■ Q8 (2차 · 개인)
고객 화면  
질문: 소득과 세금 처리 자료 중 현재 확인할 수 있는 것은 어디까지인가요?  
① 급여명세서에 세금 공제가 표시되어 있어, 회사의 신고·납부자료와 맞는지 확인해야 합니다.  
② 계약서와 지급자료가 있어, 계약금에서 처리된 세금과 신고자료가 연결되는지 확인해야 합니다.  
③ 임대계약과 입금자료가 있어, 실제 임대수입과 신고자료가 연결되는지 확인해야 합니다.  
④ 해외 지급자료가 있어, 받은 금액과 베트남 신고자료가 연결되는지 확인해야 합니다.  
⑤ 여러 소득자료가 섞여 있어, 각각의 소득과 세금 처리자료를 먼저 구분해야 합니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=income_check_point / 값 |
|---|---|
| ① | income_check_point=salary_filing_match / income_evidence=payroll |
| ② | income_check_point=contract_tax_match / income_evidence=contract |
| ③ | income_check_point=rental_income_match / income_evidence=rental_agreement |
| ④ | income_check_point=foreign_income_match / income_evidence=foreign_payment_record |
| ⑤ | income_check_point=mixed_income_separation / income_evidence=mixed_records |
분기: Q8 완료 → Q9
## ■ Q9 (2차 · 개인)
고객 화면  
질문: 현재 가지고 있는 소득·세금 자료가 실제 내용을 얼마나 확인할 수 있는 상태인가요?  
① 계약서와 입금내역이 모두 있어, 받은 돈의 출처와 금액을 자료로 확인할 수 있습니다.  
② 급여명세서와 회사 세금자료는 있지만, 실제 신고·납부까지 연결되는 자료가 부족합니다.  
③ 임대·계약 자료는 있지만 입금내역이 부족해, 실제 받은 금액을 완전히 확인하기 어렵습니다.  
④ 해외 지급자료는 있지만 베트남 신고자료가 부족해, 두 자료를 연결해 확인해야 합니다.  
⑤ 자료가 여러 곳에 있거나 일부가 없어, 실제 소득과 세금 처리를 다시 정리해야 합니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | evidence_status=complete / evidence_type=contract_and_payment / evidence_linkage=income_confirmable |
| ② | evidence_status=partial / evidence_type=payroll_tax_document / evidence_linkage=filing_payment_uncertain |
| ③ | evidence_status=partial / evidence_type=income_payment_record / evidence_linkage=income_amount_uncertain |
| ④ | evidence_status=partial / evidence_type=foreign_payment_record / evidence_linkage=foreign_reporting_uncertain |
| ⑤ | evidence_status=scattered_or_missing / evidence_type=mixed_or_incomplete / evidence_linkage=requires_document_reconstruction |
분기: Q9 완료 → Q12
## ■ Q10 (2차 · 사업 · VAT/인보이스)
고객 화면  
질문: 전자 인보이스와 실제 거래에서 어떤 부분이 다르며, 현재 어떤 자료를 확인해야 하나요?  
① 인보이스 금액과 실제 계약·입금금액이 달라, 거래자료와 금액을 함께 확인해야 합니다.  
② VAT 금액이나 적용 내용이 실제 거래와 달라 보여, 세금자료와 인보이스를 함께 확인해야 합니다.  
③ 회사명·MST·주소 등 상대방 정보가 실제 거래자료와 달라, 거래 상대방 정보를 확인해야 합니다.  
④ 인보이스 날짜와 실제 거래일이 달라, 거래자료와 신고에 사용된 날짜를 확인해야 합니다.  
⑤ 인보이스가 없거나 수정이 완료되지 않아, 실제 거래자료와 현재 인보이스 상태를 함께 확인해야 합니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | invoice_match=amount_mismatch / invoice_detail_issue=transaction_amount / invoice_resolution_status=needs_review |
| ② | invoice_match=vat_mismatch / invoice_detail_issue=vat_amount / invoice_resolution_status=needs_review |
| ③ | invoice_match=party_information_mismatch / invoice_detail_issue=counterparty_information / invoice_resolution_status=needs_review |
| ④ | invoice_match=date_mismatch / invoice_detail_issue=transaction_date / invoice_resolution_status=needs_review |
| ⑤ | invoice_match=invoice_missing_or_correction_pending / invoice_detail_issue=invoice_status / invoice_resolution_status=correction_or_reissue_needed |
분기: Q10 완료 → Q12
## ■ Q11 (2차 · 사업 · 법인세)
고객 화면  
질문: 법인세 신고에서 실제 자료와 신고내용 중 무엇을 확인해야 하나요?  
① 연간 수입과 비용을 정리했지만, 신고에 사용한 금액이 실제 회계자료와 같은지 확인해야 합니다.  
② 법인세 신고를 준비 중이며, 신고에 사용할 비용자료가 실제 비용과 맞는지 확인해야 합니다.  
③ 법인세 신고서를 제출했지만, 정상 접수되었는지와 추가 자료 요청이 있는지 확인해야 합니다.  
④ 법인세를 납부했지만, 실제 납부기록이 세금계정에 반영되었는지 확인해야 합니다.  
⑤ 신고내용과 회계자료 사이에 차이가 있어, 어떤 자료를 기준으로 다시 확인해야 하는지 모르겠습니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | corporate_filing_issue=annual_amount_match / corporate_filing_stage=preparation / corporate_evidence_status=accounting_record |
| ② | corporate_filing_issue=expense_evidence / corporate_filing_stage=preparation / corporate_evidence_status=expense_document |
| ③ | corporate_filing_issue=submission_status / corporate_filing_stage=submitted / corporate_evidence_status=filing_receipt |
| ④ | corporate_filing_issue=payment_reflection / corporate_filing_stage=paid / corporate_evidence_status=payment_record |
| ⑤ | corporate_filing_issue=accounting_filing_difference / corporate_filing_stage=review_needed / corporate_evidence_status=mixed_accounting_records |
분기: Q11 완료 → Q12
## ■ Q12 (2차 · 공통)
고객 화면  
질문: 이번 세금 검토에서 가장 먼저 확인하고 싶은 결과는 무엇인가요?  
① 현재 신고·납부에 필요한 자료와 절차를 정리해, 제가 직접 처리할 수 있는 상태가 되고 싶습니다.  
② 이미 처리한 신고·납부 내용 중 잘못되었을 가능성이 있는 부분을 확인하고 싶습니다.  
③ MST·소득·원천징수 또는 회사의 인보이스·법인세 자료를 모아 전체 상태를 확인하고 싶습니다.  
④ 세무기관에서 받은 문서나 요청에 대응하기 전에, 내용과 필요한 자료를 확인하고 싶습니다.  
⑤ 자료가 복잡하거나 직접 판단하기 어려워, 확인된 내용을 바탕으로 전문가에게 진행을 요청하고 싶습니다.  
⑥ 직접 입력
내부 저장
| 선택 | 필드=값 |
|---|---|
| ① | final_goal=self_filing_guidance / assistance_level=information_and_preparation |
| ② | final_goal=prior_filing_review / assistance_level=error_check |
| ③ | final_goal=overall_tax_status_review / assistance_level=integrated_review |
| ④ | final_goal=authority_response_review / assistance_level=notice_response_preparation |
| ⑤ | final_goal=expert_assistance / assistance_level=professional_handoff |
분기: Q12 완료 → 종합 결과
# C. 프로파일 필드표
| 필드 | 값 목록 | 쓰이는 결과 문장 |
|---|---|---|
| tax_subject | individual / business | E-01 |
| income_source | salary / freelance_contract / rental_or_foreign / mixed_income | E-02 |
| open_issue | withholding_and_extra_filing / filing_method_and_withholding_party / reporting_obligation / transaction_invoice_match / filing_accuracy | E-01 |
| tax_area | vat_invoice / corporate_income | E-03 |
| tax_deadline_status | upcoming / near_due / overdue / processing_status_unknown / unknown | E-04 |
| filing_stage | preparation / not_started / submitted_or_partial | E-04 |
| urgency | normal / high / medium | E-04 |
| authority_notice_type | general_guidance / tax_identity / filing_document_request / tax_payment_or_assessment_notice / none | E-05 |
| authority_request | applicability_check / registration_update_check / evidence_submission / notice_content_check / none | E-05 |
| response_status | not_started / action_required / not_applicable | E-05 |
| mst_status | existing / not_registered / multiple_or_unclear / no_issue_or_unknown | E-06 |
| passport_status | old_passport_linked / registration_needed / data_mismatch / identity_conflict / unknown | E-06 |
| mst_issue | passport_update / first_registration / system_lookup_failure / duplicate_record_resolution / no_issue_or_unknown | E-06, E-07 |
| income_pattern | regular / project_based / rental_regular / foreign_received / multiple | E-02 |
| withholding_status | employer_withheld / unknown | E-02 |
| income_evidence | payroll / contract / rental_agreement / foreign_payment_record / mixed_records | E-02, E-08 |
| mst_evidence_status | available / partial / unknown | E-07 |
| mst_evidence_type | passport_and_mst_record / registration_application / unknown | E-07 |
| income_check_point | salary_filing_match / contract_tax_match / rental_income_match / foreign_income_match / mixed_income_separation | E-08 |
| evidence_status | complete / partial / scattered_or_missing | E-08 |
| evidence_type | contract_and_payment / payroll_tax_document / income_payment_record / foreign_payment_record / mixed_or_incomplete | E-08 |
| evidence_linkage | income_confirmable / filing_payment_uncertain / income_amount_uncertain / foreign_reporting_uncertain / requires_document_reconstruction | E-08 |
| invoice_role | seller / buyer / transaction_party / not_applicable | E-03 |
| invoice_status | issued / received / missing / issued_or_received / not_applicable | E-03 |
| invoice_match | sales_transaction_match / purchase_transaction_match / transaction_without_invoice / invoice_data_mismatch / not_applicable / amount_mismatch / vat_mismatch / party_information_mismatch / date_mismatch / invoice_missing_or_correction_pending | E-03, E-09 |
| invoice_detail_issue | transaction_amount / vat_amount / counterparty_information / transaction_date / invoice_status | E-09 |
| invoice_resolution_status | needs_review / correction_or_reissue_needed | E-09 |
| corporate_filing_issue | annual_amount_match / expense_evidence / submission_status / payment_reflection / accounting_filing_difference | E-10 |
| corporate_filing_stage | preparation / submitted / paid / review_needed | E-10 |
| corporate_evidence_status | accounting_record / expense_document / filing_receipt / payment_record / mixed_accounting_records | E-10 |
| final_goal | self_filing_guidance / prior_filing_review / overall_tax_status_review / authority_response_review / expert_assistance | E-11 |
| assistance_level | information_and_preparation / error_check / integrated_review / notice_response_preparation / professional_handoff | E-11 |
# D. 라우팅·Stop
| 조건 | 처리 |
|---|---|
| Q1 ①②③ | Q2 → Q3 → Q4 → Q5 → Q7 → Q8 → Q9 → Q12 |
| Q1 ④ | Q2 → Q3 → Q6 → Q10 → Q12 |
| Q1 ⑤ | Q2 → Q3 → Q6 → Q11 → Q12 |
| Q2 ① | Q3 진행 |
| Q2 ② | Q3 진행, 결과에서 기한 확인 필요 강조 |
| Q2 ③ | 세무기관 연락 없음 → Stop 없음 → Q3 진행, 결과에서 긴급 확인 필요 강조 |
| Q2 ④ | Q3 진행 |
| Q2 ⑤ | Q3 진행, 정확한 기한 확인 필요 |
| Q3 ① | Q1 ①②③이면 Q4, Q1 ④⑤이면 Q6 |
| Q3 ② | Q1 ①②③이면 Q4, Q1 ④⑤이면 Q6 |
| Q3 ③ | **긴급 Stop → 결과 → 전문가 진행** |
| Q3 ④ | **긴급 Stop → 결과 → 전문가 진행** |
| Q3 ⑤ | Q1 답에 따라 Q4 또는 Q6 진행 |
| Q4 ①②③④⑤ | Q5 진행 |
| Q5 완료 | Q7 진행. Q5의 income_source가 Q1과 다르면 Q5 값을 최종값으로 사용 |
| Q6 ①②③④ | Q10 → Q12 |
| Q6 ⑤ | Q11 → Q12 |
| Q7 완료 | Q8 진행 |
| Q8 완료 | Q9 진행 |
| Q9 완료 | Q12 진행 |
| Q10 완료 | Q12 진행 |
| Q11 완료 | Q12 진행 |
| Q12 완료 | 종합 결과 |
| 세무기관의 신고·자료 제출 요청 확인 | **긴급 Stop + 전문가 진행** |
| 세무기관의 세금·납부 통지 확인 | **긴급 Stop + 전문가 진행** |
| 고객이 기한이 지난 것 같다고만 답하고 세무기관 연락이 없음 | **Stop 없음**, 질문 계속 진행 |
| 세무기관 연락이 없다고 답함 | Stop 없음 |
| 세무기관의 일반 안내·세금번호 연락 | Stop 없음, 해당 경로 계속 진행 |
| MST 관련 문제 없음 또는 모름 | Stop 없음, Q5 진행 |
| 세무기관 사칭 의심 | 현재 1차 질문에는 별도 사칭 선택지를 두지 않으며, 직접입력으로 사칭 상황이 확인된 경우 결과에서 사기 VERIFY 연결 |
| 세무기관 문서의 진위·내용·대응이 핵심 | 결과 화면에서 행정문서 VERIFY 연결 |
| 질문 중 서비스 강제 이동 | 사용하지 않음. 결과 화면 연결 버튼 방식 유지 |
| 특수·복잡 케이스 | 결과에서 전문가 진행 연결 |
# E. 결과 문장
## ■ 공통 40%
### E-01. 현재 확인 대상
**표시 조건:** 모든 결과
현재 확인 대상은 **개인 세금 / 사업·법인 세금**이며, 처음 설명하신 문제는 **급여 세금 / 개인 계약·프로젝트 소득 / 임대·해외소득 / 부가가치세(VAT)·전자 인보이스 / 법인세 신고** 중 하나로 확인되었습니다. 실제 세액이나 납부의무는 현재 답변만으로 확정하지 않고 관련 자료와 신고·납부 기록을 함께 확인해야 합니다.
### E-02. 개인 소득
**표시 조건:** tax_subject=individual
현재 소득은 **급여 / 개인 계약·프로젝트 소득 / 임대·해외 관련 소득 / 여러 종류의 소득**으로 확인되었고, 발생 방식은 **정기적으로 발생 / 계약·프로젝트별 발생 / 정기 임대수입 / 해외에서 받은 소득 / 여러 방식으로 발생**으로 확인됩니다. 고객이 제시한 소득자료와 실제 신고·세금 처리 내용을 대조할 필요가 있습니다.
### E-03. 사업 세금 영역
**표시 조건:** tax_subject=business
현재 사업 세금 영역은 **부가가치세(VAT)·전자 인보이스 / 법인세**로 확인되었습니다. VAT·전자 인보이스의 경우 **판매 / 구매 / 거래는 있으나 인보이스 없음 / 실제 거래와 인보이스 정보가 다름** 중 해당 상황을 확인하고, 법인세의 경우 실제 회계자료와 신고내용을 대조할 필요가 있습니다.
### E-04. 신고·납부 기한
**표시 조건:** tax_deadline_status가 존재할 때
현재 기한 상태는 **아직 기한 전 / 기한이 임박함 / 기한이 지난 것 같음 / 처리상태를 확인해야 함 / 정확한 기한을 모름**으로 확인됩니다. 정확한 신고·납부 기한은 세무기관 자료와 실제 신고기록을 기준으로 확인해야 합니다.
**표시 조건:** tax_deadline_status=overdue AND authority_notice_type=none
세무기관에서 별도 연락을 받은 상태는 아니므로 현재 정보만으로 긴급 Stop을 적용하지 않습니다. 다만 기한이 실제로 지났는지는 우선 확인할 필요가 있습니다.
### E-05. 세무기관 연락
**표시 조건:** authority_notice_type=general_guidance OR authority_notice_type=tax_identity
현재 세무기관에서 받은 내용은 **일반 세금 안내 / 세금번호·등록정보 관련 연락**으로 확인되었습니다. 실제 문서의 내용과 요청사항을 확인한 뒤 현재 세금 문제와 어떻게 연결되는지 판단할 필요가 있습니다.
**표시 조건:** authority_notice_type=none
현재까지 세무기관에서 받은 연락이나 문서는 없는 것으로 확인되었습니다. 따라서 고객이 설명한 세금 문제와 실제 신고·납부자료를 중심으로 확인합니다.
### E-06. MST 상태
**표시 조건:** tax_subject=individual AND mst_status가 존재할 때
현재 MST 상태는 **MST가 있음 / 아직 MST가 없음 / 여러 개이거나 상태가 불명확함 / 관련 문제는 없거나 잘 모름**으로 확인됩니다. 여권 연결 상태가 확인된 경우 **예전 여권으로 연결됨 / 신규 등록이 필요함 / 등록정보가 다름 / 신원정보를 확인할 수 없음**으로 표시하며, 실제 MST와 여권자료를 대조해야 합니다.
### E-07. MST 자료
**표시 조건:** tax_subject=individual AND mst_evidence_status가 존재할 때
MST 관련 자료는 **자료를 가지고 있음 / 일부 자료만 있음 / 현재 자료 상태를 확인하기 어려움**으로 확인됩니다. 실제 여권·MST 자료 또는 신청자료를 대조하여 등록상태와 연결정보를 확인할 필요가 있습니다.
### E-08. 개인 소득·증빙 상세
**표시 조건:** tax_subject=individual
현재 확인할 소득 관련 자료는 **급여·세금자료 / 계약자료 / 임대계약 자료 / 해외 지급자료 / 여러 소득자료**이며, 고객이 확인하려는 부분은 **급여 신고 연결 / 계약소득 세금 처리 연결 / 임대소득 신고 연결 / 해외소득 신고 연결 / 여러 소득의 구분**입니다. 자료 상태에 따라 실제 소득과 신고·납부 내용을 추가로 대조해야 합니다.
### E-09. 전자 인보이스 상세
**표시 조건:** tax_subject=business AND tax_area=vat_invoice
전자 인보이스의 차이는 **거래금액 / VAT / 거래 상대방 정보 / 거래일자 / 인보이스 발행·수정 상태** 중 하나로 확인되었습니다. 실제 계약·입금·거래자료와 전자 인보이스를 대조하여 수정 또는 추가 확인이 필요한지 판단합니다.
### E-10. 법인세 상세
**표시 조건:** tax_subject=business AND tax_area=corporate_income
법인세에서 확인할 부분은 **연간 금액 일치 여부 / 비용 증빙 / 신고 접수 상태 / 납부 반영 여부 / 회계자료와 신고자료 차이**이며, 현재 단계는 **준비 중 / 제출 완료 / 납부 완료 / 재검토 필요**로 확인됩니다. 실제 회계·신고·납부자료를 함께 확인해야 합니다.
### E-11. 최종 목적
**표시 조건:** final_goal가 존재할 때
이번 검토의 목적은 **직접 신고 준비 / 기존 신고·납부 검토 / 전체 세금 상태 확인 / 세무기관 대응 준비 / 전문가 진행**으로 확인되었습니다. 이에 따라 현재 확보된 자료를 기준으로 확인이 필요한 부분과 추가 검토가 필요한 부분을 구분합니다.
### E-12. 긴급·전문가 진행
**표시 조건:** authority_notice_type=filing_document_request OR authority_notice_type=tax_payment_or_assessment_notice**
세무기관에서 **신고·자료 제출 요청 또는 세금·납부 관련 통지**를 받은 상태이므로, 요청내용과 대응기한을 우선 확인해야 합니다. 현재 답변만으로 세액이나 납부의무를 단정하지 않으며 **전문가 진행**으로 연결합니다.
**표시 조건:** tax_deadline_status=near_due OR tax_deadline_status=overdue OR urgency=high
기한 확인이 중요한 상태입니다. 세무기관의 기한 있는 조치가 확인되지 않은 경우에는 즉시 Stop하지 않고, 정확한 신고·납부 기한과 현재 처리상태를 우선 확인합니다.
### E-13. 사기 VERIFY
**표시 조건:** 직접입력 내용 또는 저장된 상황에서 세무기관 사칭이 확인될 때
세무기관을 사칭한 연락이나 납부 요구가 의심되는 경우에는 실제 기관에서 보낸 것인지 먼저 확인해야 합니다. 결과 화면의 **사기 VERIFY** 버튼을 통해 연락 내용과 관련 증거를 별도로 확인할 수 있습니다.
### E-14. 행정문서 VERIFY
**표시 조건:** authority_notice_type=filing_document_request OR authority_notice_type=tax_payment_or_assessment_notice AND 문서의 진위·내용·대응 확인이 핵심인 경우
세무기관에서 받은 문서 자체의 진위·내용·대응이 핵심인 경우에는 결과 화면의 **행정문서 VERIFY** 버튼을 통해 문서를 별도로 확인할 수 있습니다.
### E-15. 전문가 진행
**표시 조건:** final_goal=expert_assistance OR authority_notice_type=filing_document_request OR authority_notice_type=tax_payment_or_assessment_notice**
현재 확인된 자료와 상황을 바탕으로 **전문가 진행**을 선택할 수 있습니다. 전문가 검토에서는 고객이 제공한 신고·납부자료, 세무기관 통지, 소득·거래자료를 기준으로 추가 확인이 필요한 부분을 검토합니다.
# F. MASTER 충돌 여부
**MASTER 충돌 여부: 없음**
# G. 값 → 고객용 라벨 대응표
| 필드 | 값 | 고객용 라벨 |
|---|---|---|
| tax_subject | individual | 개인 세금 |
| tax_subject | business | 사업·법인 세금 |
| income_source | salary | 급여 |
| income_source | freelance_contract | 개인 계약·프로젝트 소득 |
| income_source | rental_or_foreign | 임대·해외 관련 소득 |
| income_source | mixed_income | 여러 종류의 소득 |
| open_issue | withholding_and_extra_filing | 급여 세금 공제·추가 신고 확인 |
| open_issue | filing_method_and_withholding_party | 개인 소득 신고·세금 처리 주체 확인 |
| open_issue | reporting_obligation | 임대·해외소득 신고 여부 확인 |
| open_issue | transaction_invoice_match | 실제 거래와 VAT·전자 인보이스 확인 |
| open_issue | filing_accuracy | 법인세 신고내용 확인 |
| tax_area | vat_invoice | 부가가치세(VAT)·전자 인보이스 |
| tax_area | corporate_income | 법인세 |
| tax_deadline_status | upcoming | 아직 기한 전 |
| tax_deadline_status | near_due | 기한이 임박함 |
| tax_deadline_status | overdue | 기한이 지난 것 같음 |
| tax_deadline_status | processing_status_unknown | 처리상태를 확인해야 함 |
| tax_deadline_status | unknown | 정확한 기한을 모름 |
| filing_stage | preparation | 준비 중 |
| filing_stage | not_started | 아직 시작하지 않음 |
| filing_stage | submitted_or_partial | 신고했거나 일부 처리함 |
| urgency | normal | 일반적인 확인 |
| urgency | high | 기한 확인이 중요함 |
| urgency | medium | 처리상태 확인 필요 |
| authority_notice_type | general_guidance | 일반 세금 안내 |
| authority_notice_type | tax_identity | 세금번호·등록정보 관련 연락 |
| authority_notice_type | filing_document_request | 신고·자료 제출 요청 |
| authority_notice_type | tax_payment_or_assessment_notice | 세금·납부 관련 통지 |
| authority_notice_type | none | 세무기관 연락 없음 |
| authority_request | applicability_check | 내 상황에 적용되는 내용 확인 |
| authority_request | registration_update_check | 등록정보 확인 |
| authority_request | evidence_submission | 자료 제출 대응 |
| authority_request | notice_content_check | 통지 내용 확인 |
| authority_request | none | 해당 없음 |
| response_status | not_started | 아직 대응하지 않음 |
| response_status | action_required | 대응 필요 |
| response_status | not_applicable | 해당 없음 |
| mst_status | existing | MST가 있음 |
| mst_status | not_registered | 아직 MST가 없음 |
| mst_status | multiple_or_unclear | 여러 개이거나 상태가 불명확함 |
| mst_status | no_issue_or_unknown | 관련 문제는 없거나 잘 모름 |
| passport_status | old_passport_linked | 예전 여권으로 연결됨 |
| passport_status | registration_needed | 신규 등록이 필요함 |
| passport_status | data_mismatch | 등록정보가 다름 |
| passport_status | identity_conflict | 신원정보 충돌이 있음 |
| passport_status | unknown | 여권 연결 상태를 확인하기 어려움 |
| mst_issue | passport_update | 여권 정보 변경 확인 |
| mst_issue | first_registration | 최초 MST 등록 확인 |
| mst_issue | system_lookup_failure | MST 조회 문제 확인 |
| mst_issue | duplicate_record_resolution | 중복 MST 확인 |
| mst_issue | no_issue_or_unknown | MST 문제 없음 또는 확인 필요 |
| income_pattern | regular | 정기적으로 발생 |
| income_pattern | project_based | 계약·프로젝트별 발생 |
| income_pattern | rental_regular | 정기 임대수입 |
| income_pattern | foreign_received | 해외에서 받은 소득 |
| income_pattern | multiple | 여러 방식으로 발생 |
| withholding_status | employer_withheld | 회사가 세금을 공제함 |
| withholding_status | unknown | 원천징수 상태를 확인하지 못함 |
| income_evidence | payroll | 급여·세금자료 |
| income_evidence | contract | 계약자료 |
| income_evidence | rental_agreement | 임대계약 자료 |
| income_evidence | foreign_payment_record | 해외 지급자료 |
| income_evidence | mixed_records | 여러 소득자료 |
| mst_evidence_status | available | 자료를 가지고 있음 |
| mst_evidence_status | partial | 일부 자료만 있음 |
| mst_evidence_status | unknown | 자료 상태를 확인하기 어려움 |
| mst_evidence_type | passport_and_mst_record | 여권·MST 자료 |
| mst_evidence_type | registration_application | MST 등록 신청자료 |
| mst_evidence_type | unknown | 확인할 자료를 특정하기 어려움 |
| income_check_point | salary_filing_match | 급여와 세금 신고 연결 |
| income_check_point | contract_tax_match | 계약소득과 세금 처리 연결 |
| income_check_point | rental_income_match | 임대소득과 신고자료 연결 |
| income_check_point | foreign_income_match | 해외소득과 신고자료 연결 |
| income_check_point | mixed_income_separation | 여러 소득 구분 |
| evidence_status | complete | 자료가 충분함 |
| evidence_status | partial | 일부 자료가 있음 |
| evidence_status | scattered_or_missing | 자료가 흩어져 있거나 부족함 |
| evidence_type | contract_and_payment | 계약서·입금자료 |
| evidence_type | payroll_tax_document | 급여·세금자료 |
| evidence_type | income_payment_record | 소득·입금자료 |
| evidence_type | foreign_payment_record | 해외 지급자료 |
| evidence_type | mixed_or_incomplete | 여러 자료 또는 불완전한 자료 |
| evidence_linkage | income_confirmable | 소득 확인 가능 |
| evidence_linkage | filing_payment_uncertain | 신고·납부 연결 확인 필요 |
| evidence_linkage | income_amount_uncertain | 실제 소득금액 확인 필요 |
| evidence_linkage | foreign_reporting_uncertain | 해외소득 신고 연결 확인 필요 |
| evidence_linkage | requires_document_reconstruction | 자료 재구성이 필요함 |
| invoice_role | seller | 판매자 |
| invoice_role | buyer | 구매자 |
| invoice_role | transaction_party | 거래 당사자 |
| invoice_role | not_applicable | 해당 없음 |
| invoice_status | issued | 발행함 |
| invoice_status | received | 받음 |
| invoice_status | missing | 없음 또는 누락됨 |
| invoice_status | issued_or_received | 발행 또는 수령함 |
| invoice_status | not_applicable | 해당 없음 |
| invoice_match | sales_transaction_match | 판매 거래와 일치 |
| invoice_match | purchase_transaction_match | 구매 거래와 일치 |
| invoice_match | transaction_without_invoice | 거래는 있지만 인보이스 없음 |
| invoice_match | invoice_data_mismatch | 실제 거래와 인보이스 정보가 다름 |
| invoice_match | not_applicable | 해당 없음 |
| invoice_match | amount_mismatch | 거래금액이 다름 |
| invoice_match | vat_mismatch | VAT가 다름 |
| invoice_match | party_information_mismatch | 거래 상대방 정보가 다름 |
| invoice_match | date_mismatch | 거래일자가 다름 |
| invoice_match | invoice_missing_or_correction_pending | 인보이스가 없거나 수정 대기 중 |
| invoice_detail_issue | transaction_amount | 거래금액 |
| invoice_detail_issue | vat_amount | VAT |
| invoice_detail_issue | counterparty_information | 거래 상대방 정보 |
| invoice_detail_issue | transaction_date | 거래일자 |
| invoice_detail_issue | invoice_status | 인보이스 발행·수정 상태 |
| invoice_resolution_status | needs_review | 확인 필요 |
| invoice_resolution_status | correction_or_reissue_needed | 수정·재발행 확인 필요 |
| corporate_filing_issue | annual_amount_match | 연간 금액 일치 여부 |
| corporate_filing_issue | expense_evidence | 비용 증빙 |
| corporate_filing_issue | submission_status | 신고 접수 상태 |
| corporate_filing_issue | payment_reflection | 납부 반영 여부 |
| corporate_filing_issue | accounting_filing_difference | 회계자료와 신고자료 차이 |
| corporate_filing_stage | preparation | 준비 중 |
| corporate_filing_stage | submitted | 제출 완료 |
| corporate_filing_stage | paid | 납부 완료 |
| corporate_filing_stage | review_needed | 재검토 필요 |
| corporate_evidence_status | accounting_record | 회계자료 |
| corporate_evidence_status | expense_document | 비용자료 |
| corporate_evidence_status | filing_receipt | 신고 접수자료 |
| corporate_evidence_status | payment_record | 납부자료 |
| corporate_evidence_status | mixed_accounting_records | 여러 회계자료 |
| final_goal | self_filing_guidance | 직접 신고 준비 |
| final_goal | prior_filing_review | 기존 신고·납부 검토 |
| final_goal | overall_tax_status_review | 전체 세금 상태 확인 |
| final_goal | authority_response_review | 세무기관 대응 준비 |
| final_goal | expert_assistance | 전문가 진행 |
| assistance_level | information_and_preparation | 정보 확인·준비 |
| assistance_level | error_check | 오류 확인 |
| assistance_level | integrated_review | 종합 검토 |
| assistance_level | notice_response_preparation | 통지 대응 준비 |
| assistance_level | professional_handoff | 전문가 진행 |
