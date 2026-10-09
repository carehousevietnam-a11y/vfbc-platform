# 세금 VERIFY 콘텐츠 최종본 (Claude 완성·검수본)

> 작성: ChatGPT 수정본(A~D)을 Claude가 검수·보완하여 완성. 구조 규칙: **1차 4개 : 2차 7개 = 36.4% : 63.6% (2차 = 1차의 1.75배)**, 질문 생략 없음. 고객 화면에는 한국어 생활 문장만 표시하고, 영문 코드는 내부 저장에만 사용한다. 세액·납세의무는 어디에서도 단정하지 않는다.

---

# A. 진입 화면과 1차 질문

## A-0. 진입 화면 (질문 수에 포함하지 않음)

**고객 화면**

**어떤 세금 문제인가요?**

가장 가까운 것을 하나 골라 주세요. 서류가 없거나 잘 몰라도 괜찮습니다.

① 내 소득에 대한 세금  
급여, 개인 수입, 임대료, 해외에서 받은 돈  
② 물건·서비스 거래에 대한 세금  
부가가치세(VAT), 전자 인보이스(전자 세금계산서)  
③ 회사의 세금  
회사의 매출·비용·신고·납부, 법인세  
④ 잘 모르겠습니다  
개인소득세 질문부터 시작합니다  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 | 이동 |
|---|---|---|
| ① | `tax_route=personal_income_tax`, `route_selection_mode=selected` | 개인소득세 Q1-P |
| ② | `tax_route=vat_einvoice`, `route_selection_mode=selected` | VAT·전자 인보이스 Q1-V |
| ③ | `tax_route=corporate_tax`, `route_selection_mode=selected` | 법인세 Q1-C |
| ④ | `tax_route=unsure_default_personal`, `route_selection_mode=unsure` | 개인소득세 Q1-P (기본) |
| ⑤ 직접 입력 | `tax_route=unsure_default_personal`, `route_selection_mode=direct_input` | 개인소득세 Q1-P (기본) |

## A-1. 개인소득세 — 1차

### Q1-P

**고객 화면**

**지금 확인하려는 세금 문제는 어떤 소득에서 시작되었고, 그 소득에 대해 현재 어떤 점을 확인하고 싶으신가요?**

① 베트남 회사에서 받은 **급여와 관련된 세금**을 확인하고 싶습니다. 급여에서 세금이 빠졌거나 연말 정산·환급 등이 맞는지 궁금합니다.  
② 개인 계약이나 프로젝트로 받은 **수입과 관련된 세금**을 확인하고 싶습니다. 누가 세금을 처리해야 하는지 또는 신고가 필요한지 궁금합니다.  
③ 집세나 해외에서 받은 돈 등 **급여 외 소득과 관련된 세금**을 확인하고 싶습니다. 이 소득을 어떻게 신고하거나 처리해야 하는지 궁금합니다.  
④ 급여·계약·임대·해외소득 등 **여러 소득이 함께 관련되어 있습니다.** 각각 어떻게 처리되었는지 한꺼번에 확인하고 싶습니다.  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `income_source=salary`, `tax_handling_interest=withholding_or_year_end` |
| ② | `income_source=personal_contract_project`, `tax_handling_interest=responsibility_or_filing` |
| ③ | `income_source=rental_or_foreign_income`, `tax_handling_interest=reporting_or_treatment` |
| ④ | `income_source=mixed_income`, `tax_handling_interest=combined_tax_treatment` |
| ⑤ 직접 입력 | `income_source=direct_input`, `tax_handling_interest=direct_input_detail` |

---

### Q2-P

**고객 화면**

**위 소득에서 실제로 돈이 오간 방식은 어떠했고, 세금 처리를 맡은 사람이나 회사는 어떻게 되어 있었나요?**

① 돈을 받을 때마다 회사나 상대방이 먼저 세금을 떼고, 나머지 금액을 받았습니다.  
② 돈을 먼저 전부 받은 뒤 제가 직접 세금을 처리하거나 신고해야 하는 것으로 안내받았습니다.  
③ 돈을 받은 뒤 회사나 상대방이 세금을 처리한다고 들었지만, 실제로 어떻게 처리했는지는 확인하지 못했습니다.  
④ 여러 번 또는 여러 곳에서 돈을 받았고, 각각 세금 처리를 맡은 사람이 달랐거나 처리 방식이 달랐습니다.  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `income_payment_flow=tax_withheld_before_payment`, `tax_handler=paying_party` |
| ② | `income_payment_flow=full_payment_then_self_process`, `tax_handler=taxpayer` |
| ③ | `income_payment_flow=full_payment_or_unclear`, `tax_handler=third_party_claimed` |
| ④ | `income_payment_flow=multiple_payment_methods`, `tax_handler=multiple_handlers` |
| ⑤ 직접 입력 | `income_payment_flow=direct_input`, `tax_handler=direct_input_detail` |

---

### Q3-P

**고객 화면**

**세금과 관련해 가지고 있는 자료는 어느 정도이고, 그 자료로 무엇을 가장 먼저 확인하고 싶으신가요?**

① 급여명세서·지급내역·세금 서류 등 자료를 대부분 가지고 있고, 세금이 어떻게 계산되었는지부터 확인하고 싶습니다.  
② 계약서나 입금내역 같은 일부 자료만 가지고 있고, 받은 돈과 세금 처리가 맞게 연결되는지 확인하고 싶습니다.  
③ 자료가 여러 곳에 흩어져 있거나 날짜·금액이 서로 달라서, 전체를 한꺼번에 비교해 보고 싶습니다.  
④ 가지고 있는 자료가 거의 없어서, 무엇을 준비해야 하는지부터 알고 싶습니다.  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `record_possession=mostly_available`, `record_check_need=calculation_linkage` |
| ② | `record_possession=partially_available`, `record_check_need=income_tax_linkage` |
| ③ | `record_possession=scattered_or_inconsistent`, `record_check_need=cross_document_consistency` |
| ④ | `record_possession=little_or_none`, `record_check_need=required_record_guidance` |
| ⑤ 직접 입력 | `record_possession=direct_input`, `record_check_need=direct_input_detail` |

---

### Q4-P

**고객 화면**

**지금 세금 문제를 확인하게 된 계기는 무엇이었고, 현재 가장 어려운 부분은 어디에 있나요?**

① 세금 관련 안내나 서류를 받아서 내용이 맞는지 확인하려고 합니다.  
② 세금 신고·정산을 해야 하는 시점이 되어 무엇을 해야 하는지 확인하려고 합니다.  
③ 이미 세금 처리를 했지만 금액이나 처리 결과가 예상과 달라서 확인하려고 합니다.  
④ 베트남어로 된 설명이나 서류를 이해하기 어려워서 실제로 무엇을 해야 하는지 확인하려고 합니다.  
⑤ 특별히 받은 서류나 막힌 일은 없고, 제 세금 상황에 문제가 없는지 미리 점검해 보고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `tax_issue_trigger=notice_or_document_received`, `current_difficulty=content_verification` |
| ② | `tax_issue_trigger=filing_or_settlement_due`, `current_difficulty=required_action_unclear` |
| ③ | `tax_issue_trigger=result_mismatch`, `current_difficulty=result_explanation` |
| ④ | `tax_issue_trigger=language_barrier`, `current_difficulty=document_understanding` |
| ⑤ | `tax_issue_trigger=self_check`, `current_difficulty=no_specific_blocker` |
| ⑥ 직접 입력 | `tax_issue_trigger=direct_input`, `current_difficulty=direct_input_detail` |

---

## A-2. VAT·전자 인보이스 — 1차

### Q1-V

**고객 화면**

**지금 확인하려는 부가가치세(VAT) 문제는 어떤 거래에서 시작되었고, 그 거래에서 무엇이 맞는지 확인하고 싶으신가요?**

① 베트남에서 고객에게 물건이나 서비스를 판매한 거래입니다. 판매 금액과 VAT 처리가 맞는지 확인하고 싶습니다.  
② 베트남에서 물건이나 서비스를 구입한 거래입니다. 받은 전자 인보이스와 VAT 처리가 맞는지 확인하고 싶습니다.  
③ 제가 한 기억이 없는 거래이거나 어떤 거래인지 분명하지 않은데, 인보이스나 VAT 안내를 받았습니다. 어떤 거래에 대한 것인지부터 확인하고 싶습니다.  
④ 해외 고객 또는 해외 공급자와 거래하면서 베트남 VAT와 전자 인보이스 처리가 어떻게 연결되는지 확인하고 싶습니다.  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `vat_transaction_type=domestic_sale`, `vat_check_focus=sales_vat_treatment` |
| ② | `vat_transaction_type=domestic_purchase`, `vat_check_focus=purchase_invoice_vat` |
| ③ | `vat_transaction_type=unrecognized_transaction`, `vat_check_focus=transaction_identification` |
| ④ | `vat_transaction_type=cross_border_transaction`, `vat_check_focus=cross_border_vat_invoice_treatment` |
| ⑤ 직접 입력 | `vat_transaction_type=direct_input`, `vat_check_focus=direct_input_detail` |

---

### Q2-V

**고객 화면**

**위 거래의 전자 인보이스는 누가 발행했거나 받았고, 지금은 어떤 상태인가요?**

① 제가(또는 우리 회사가) 인보이스를 발행했고, 발행은 끝났지만 내용이 맞는지 확인하고 싶습니다.  
② 거래 상대방이 발행해서 제가 받았고, 내용이 실제 거래와 맞는지 확인하고 싶습니다.  
③ 거래는 했는데 인보이스를 아직 발행하지도 받지도 못했습니다. 지금 어떻게 해야 하는지 알고 싶습니다.  
④ 인보이스가 수정·취소되었거나 다시 발행되어서, 이전 것과 새것이 어떤 관계인지 모르겠습니다.  
⑤ 회사 담당자나 세무 대행사가 처리해서, 제가 인보이스 상태를 정확히 알지 못합니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `invoice_handling_actor=self_issued`, `invoice_handling_state=issued_content_check` |
| ② | `invoice_handling_actor=counterparty_issued`, `invoice_handling_state=received_content_check` |
| ③ | `invoice_handling_actor=not_issued_by_anyone`, `invoice_handling_state=issuance_needed` |
| ④ | `invoice_handling_actor=revised_or_reissued`, `invoice_handling_state=revision_relation_unclear` |
| ⑤ | `invoice_handling_actor=staff_or_agent_handled`, `invoice_handling_state=state_unknown` |
| ⑥ 직접 입력 | `invoice_handling_actor=direct_input`, `invoice_handling_state=direct_input_detail` |

---

### Q3-V

**고객 화면**

**거래 자료와 전자 인보이스를 가지고 계신다면 어떤 자료가 있고, 서로 맞춰 볼 때 무엇이 가장 걱정되시나요?**

① 인보이스와 거래·입금 자료가 모두 있고, 금액·VAT 금액·세율이 서로 맞는지 확인하고 싶습니다.  
② 인보이스와 거래 자료가 모두 있고, 거래 날짜나 상대방 정보가 서로 맞는지 확인하고 싶습니다.  
③ 인보이스만 있고 실제 거래 자료는 거의 없어서, 인보이스가 실제 거래를 제대로 담고 있는지 알고 싶습니다.  
④ 거래 자료만 있고 인보이스가 없거나 일부만 있어서, 무엇이 빠져 있는지 알고 싶습니다.  
⑤ 여러 거래와 인보이스가 섞여 있어서, 어느 인보이스가 어느 거래의 것인지 정리가 필요합니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `vat_record_set=invoice_and_transaction_available`, `vat_record_check=amount_and_vat_match` |
| ② | `vat_record_set=invoice_and_transaction_available`, `vat_record_check=date_and_party_match` |
| ③ | `vat_record_set=invoice_only`, `vat_record_check=invoice_vs_transaction` |
| ④ | `vat_record_set=transaction_only_or_partial_invoice`, `vat_record_check=missing_invoice_scope` |
| ⑤ | `vat_record_set=mixed_multiple_records`, `vat_record_check=linkage_organization` |
| ⑥ 직접 입력 | `vat_record_set=direct_input`, `vat_record_check=direct_input_detail` |

---

### Q4-V

**고객 화면**

**지금 VAT 문제를 확인하게 된 계기는 무엇이었고, 현재 가장 막혀 있는 부분은 무엇인가요?**

① 세무기관이나 거래 상대방에게서 전자 인보이스 관련 안내를 받아 내용이 맞는지 확인하려고 합니다.  
② VAT 신고나 전자 인보이스 처리를 해야 하는 시점이 되어 무엇을 해야 하는지 확인하려고 합니다.  
③ 이미 인보이스를 발행·수령했지만 내용이나 VAT 금액이 맞지 않아 다음 처리를 결정하기 어렵습니다.  
④ 베트남어로 된 인보이스나 안내 내용을 이해하기 어려워 실제로 어떤 조치를 해야 하는지 확인하려고 합니다.  
⑤ 특별히 받은 안내나 막힌 일은 없고, 제 VAT·인보이스 처리에 문제가 없는지 미리 점검해 보고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `vat_issue_trigger=authority_or_counterparty_notice`, `vat_current_blockage=notice_verification` |
| ② | `vat_issue_trigger=filing_or_invoice_action_due`, `vat_current_blockage=required_action_unclear` |
| ③ | `vat_issue_trigger=invoice_result_mismatch`, `vat_current_blockage=next_action_unclear` |
| ④ | `vat_issue_trigger=language_barrier`, `vat_current_blockage=document_understanding` |
| ⑤ | `vat_issue_trigger=self_check`, `vat_current_blockage=no_specific_blocker` |
| ⑥ 직접 입력 | `vat_issue_trigger=direct_input`, `vat_current_blockage=direct_input_detail` |

---

## A-3. 법인세 — 1차

### Q1-C

**고객 화면**

**지금 확인하려는 법인세 문제는 회사의 어떤 세금 처리에서 시작되었고, 현재 어떤 부분까지 확인하고 싶으신가요?**

① 회사의 법인세 신고를 준비하면서 계산과 신고 내용이 맞는지 확인하고 싶습니다.  
② 법인세 신고는 했지만 신고된 내용이나 계산 결과가 맞는지 다시 확인하고 싶습니다.  
③ 세무기관에서 검토나 자료 요청을 받아, 회사가 어떤 부분을 확인해야 하는지 알고 싶습니다.  
④ 법인세 금액이나 납부 결과가 예상과 달라서 계산 근거와 처리 과정을 확인하고 싶습니다.  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_tax_stage=filing_preparation`, `corporate_tax_check_scope=calculation_and_filing` |
| ② | `corporate_tax_stage=filed`, `corporate_tax_check_scope=filed_content_and_calculation` |
| ③ | `corporate_tax_stage=authority_review_or_request`, `corporate_tax_check_scope=authority_issue_review` |
| ④ | `corporate_tax_stage=tax_amount_result_issue`, `corporate_tax_check_scope=calculation_basis_and_process` |
| ⑤ 직접 입력 | `corporate_tax_stage=direct_input`, `corporate_tax_check_scope=direct_input_detail` |

---

### Q2-C

**고객 화면**

**현재 회사의 세금 자료는 어느 정도 정리되어 있고, 자료를 실제 신고에 연결할 때 어떤 부분을 확인해야 하나요?**

① 회계자료와 세금 관련 자료가 대부분 정리되어 있지만, 신고에 어떤 자료가 실제로 반영되었는지 확인하고 싶습니다.  
② 일부 자료만 정리되어 있고 나머지는 여러 담당자나 파일에 흩어져 있어 신고에 필요한 자료가 무엇인지 확인하고 싶습니다.  
③ 회계자료와 세금자료는 있지만 기간이나 처리 기준이 서로 달라 어떤 자료를 기준으로 해야 할지 확인하고 싶습니다.  
④ 회사 자료가 충분하지 않아 실제 신고 내용과 원자료를 비교하면서 부족한 부분을 찾아야 합니다.  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_record_readiness=mostly_organized`, `corporate_record_check=filing_traceability` |
| ② | `corporate_record_readiness=partially_distributed`, `corporate_record_check=required_document_identification` |
| ③ | `corporate_record_readiness=period_or_basis_mismatch`, `corporate_record_check=reference_basis` |
| ④ | `corporate_record_readiness=insufficient_records`, `corporate_record_check=source_reconstruction` |
| ⑤ 직접 입력 | `corporate_record_readiness=direct_input`, `corporate_record_check=direct_input_detail` |

---

### Q3-C

**고객 화면**

**회사의 실제 업무와 이미 처리된 법인세 신고를 비교했을 때 어떤 차이가 있고, 그 차이가 신고 결과에 어떻게 연결되는지 확인하고 싶으신가요?**

① 회사가 실제로 벌어들인 전체 수입과 신고에 반영된 수입이 같은지 확인하고 싶습니다.  
② 실제 회사 지출과 세금 신고에 반영된 비용의 범위가 같은지 확인하고 싶습니다.  
③ 실제 업무에서 발생한 거래와 신고 자료에 반영된 거래가 빠짐없이 연결되는지 확인하고 싶습니다.  
④ 여러 자료의 합계나 기간이 달라 신고된 결과가 실제 회사 자료와 맞는지 전체적으로 비교해야 합니다.  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_filing_comparison_issue=revenue_reporting_difference`, `corporate_filing_impact_check=taxable_income_linkage` |
| ② | `corporate_filing_comparison_issue=expense_reporting_difference`, `corporate_filing_impact_check=deductible_expense_linkage` |
| ③ | `corporate_filing_comparison_issue=transaction_reporting_difference`, `corporate_filing_impact_check=transaction_completeness` |
| ④ | `corporate_filing_comparison_issue=aggregate_or_period_difference`, `corporate_filing_impact_check=overall_filing_consistency` |
| ⑤ 직접 입력 | `corporate_filing_comparison_issue=direct_input`, `corporate_filing_impact_check=direct_input_detail` |

---

### Q4-C

**고객 화면**

**지금 법인세 문제를 확인하게 된 계기는 무엇이었고, 현재 회사에서 가장 막혀 있는 부분은 무엇인가요?**

① 세무기관에서 안내나 요청을 받아 회사가 어떤 내용을 확인하거나 제출해야 하는지 알고 싶습니다.  
② 법인세 신고·납부 시점이 되어 필요한 절차와 준비해야 할 내용을 확인하고 싶습니다.  
③ 이미 신고·납부했지만 결과나 금액이 예상과 달라서 어디에서 차이가 생겼는지 확인하고 싶습니다.  
④ 회사 담당자나 세무 담당자에게 들은 설명과 실제 자료가 달라 어떤 내용을 기준으로 해야 할지 확인하고 싶습니다.  
⑤ 특별히 받은 안내나 막힌 일은 없고, 회사의 법인세 처리에 문제가 없는지 미리 점검해 보고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_issue_trigger=authority_request`, `corporate_current_blockage=submission_or_review` |
| ② | `corporate_issue_trigger=filing_or_payment_due`, `corporate_current_blockage=procedure_preparation` |
| ③ | `corporate_issue_trigger=filed_or_paid_result_difference`, `corporate_current_blockage=result_reconciliation` |
| ④ | `corporate_issue_trigger=internal_explanation_data_difference`, `corporate_current_blockage=reference_selection` |
| ⑤ | `corporate_issue_trigger=self_check`, `corporate_current_blockage=no_specific_blocker` |
| ⑥ 직접 입력 | `corporate_issue_trigger=direct_input`, `corporate_current_blockage=direct_input_detail` |

---

# B. 2차 질문

2차는 1차의 답을 다시 묻지 않고 **안내 출처·실제와의 차이·금액 기준·기한·조치 이후 반응·막힌 이유와 자료·최종 목표**를 깊게 묻는다. 안내를 받은 적이 없는 고객도 모든 질문에 답할 수 있도록 각 질문에 해당 선택지를 둔다.

## B-1. 개인소득세 — 2차

### Q5-P

**고객 화면**

**세금 문제를 알게 된 자료나 안내는 어디에서 왔고, 그 내용이 실제 세무기관에서 나온 것인지 확인하셨나요?**

① 세무기관이나 공식 담당자로부터 직접 받은 안내이고, 발신 경로도 확인했습니다.  
② 세무기관에서 받은 것으로 알고 있지만, 실제 발신자나 공식 경로까지는 확인하지 못했습니다.  
③ 회사·고용주·계약 상대방 등을 통해 전달받았고, 원래 세무기관의 안내인지 확인하지 못했습니다.  
④ 다른 사람이나 온라인에서 전달받은 내용이라 출처와 실제 세무기관 안내인지 모두 확인이 필요합니다.  
⑤ 받은 세금 안내나 서류는 없고, 제가 먼저 확인해 보려는 것입니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `notice_source=tax_authority_direct`, `notice_authenticity=verified` |
| ② | `notice_source=claimed_tax_authority`, `notice_authenticity=unverified` |
| ③ | `notice_source=employer_or_counterparty`, `notice_authenticity=original_source_unverified` |
| ④ | `notice_source=third_party_or_online`, `notice_authenticity=source_unverified` |
| ⑤ | `notice_source=none_self_initiated`, `notice_authenticity=not_applicable` |
| ⑥ 직접 입력 | `notice_source=direct_input`, `notice_authenticity=direct_input_detail` |

---

### Q6-P

**고객 화면**

**안내받은 세금 처리 내용과 실제 소득·돈의 흐름을 비교하면 무엇이 다르고, 그중 어떤 점이 가장 설명되지 않나요?**

① 안내에서는 세금이 처리되었다고 되어 있지만, 실제 받은 돈에서 어떻게 처리되었는지 확인되지 않습니다.  
② 안내받은 금액이나 계산 방식이 실제 계약·지급 자료와 맞지 않는 것 같습니다.  
③ 안내에서는 신고나 정산이 완료되었다고 하지만, 실제 자료에서는 그 결과를 확인하기 어렵습니다.  
④ 안내 내용과 실제 상황이 크게 다르지만, 어떤 자료를 기준으로 비교해야 할지도 모르겠습니다.  
⑤ 받은 안내가 따로 없어서 비교할 내용은 없고, 제가 알고 있는 세금 처리 방식이 맞는지 확인하고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `guidance_actual_difference=tax_handling_untraceable`, `unexplained_point=payment_tax_linkage` |
| ② | `guidance_actual_difference=amount_or_calculation_mismatch`, `unexplained_point=calculation_basis` |
| ③ | `guidance_actual_difference=filing_or_settlement_unconfirmed`, `unexplained_point=result_traceability` |
| ④ | `guidance_actual_difference=overall_situation_mismatch`, `unexplained_point=comparison_basis_unclear` |
| ⑤ | `guidance_actual_difference=self_check_no_guidance`, `unexplained_point=own_understanding_basis` |
| ⑥ 직접 입력 | `guidance_actual_difference=direct_input`, `unexplained_point=direct_input_detail` |

---

### Q7-P

**고객 화면**

**확인하려는 세금 금액은 어떤 금액이고, 그 금액이 무엇을 기준으로 계산되었다고 안내받았나요?**

① 급여에서 빠진 세금 금액을 확인하고 있으며, 급여나 지급액을 기준으로 계산되었다고 들었습니다.  
② 계약·프로젝트 수입에서 처리된 세금 금액을 확인하고 있으며, 받은 금액이나 계약 금액을 기준으로 했다고 들었습니다.  
③ 임대·해외소득과 관련된 세금 금액을 확인하고 있으며, 해당 소득 금액을 기준으로 했다고 들었습니다.  
④ 여러 소득에 대한 세금 금액이 함께 표시되어 있어, 각각 어떤 금액을 기준으로 계산했는지 확인이 필요합니다.  
⑤ 아직 구체적인 세금 금액은 모르고, 어떤 금액을 확인해야 하는지부터 알고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `tax_amount_type=salary_tax_amount`, `tax_amount_basis=salary_or_payment_amount` |
| ② | `tax_amount_type=contract_income_tax_amount`, `tax_amount_basis=contract_or_received_amount` |
| ③ | `tax_amount_type=rental_or_foreign_income_tax_amount`, `tax_amount_basis=related_income_amount` |
| ④ | `tax_amount_type=mixed_income_tax_amount`, `tax_amount_basis=multiple_income_bases` |
| ⑤ | `tax_amount_type=not_yet_identified`, `tax_amount_basis=to_be_identified` |
| ⑥ 직접 입력 | `tax_amount_type=direct_input`, `tax_amount_basis=direct_input_detail` |

---

### Q8-P

**고객 화면**

**세금 신고·납부나 서류 제출 기한이 있다면 언제쯤이고, 그 날짜는 어디에서 알게 되셨나요?**

① 세무기관의 공식 안내나 서류에서 확인한 기한이 이미 지났거나 며칠 안에 다가옵니다.  
② 세무기관의 공식 안내나 서류에서 기한을 확인했고, 아직 시간 여유가 있습니다.  
③ 회사·고용주·세무 담당자가 알려준 날짜인데, 이미 지났거나 곧 다가오는 것 같습니다.  
④ 온라인에서 보았거나 다른 사람에게 들었거나 기억나는 날짜라서, 정확한 기한은 아직 확실하지 않습니다.  
⑤ 기한이 있는지도 잘 모르겠고, 따로 안내받은 날짜도 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `deadline_timing=passed_or_imminent`, `deadline_source=official_notice` |
| ② | `deadline_timing=upcoming_with_margin`, `deadline_source=official_notice` |
| ③ | `deadline_timing=possibly_passed_or_near`, `deadline_source=employer_or_tax_agent` |
| ④ | `deadline_timing=unconfirmed_date`, `deadline_source=online_hearsay_or_memory` |
| ⑤ | `deadline_timing=unknown`, `deadline_source=none` |
| ⑥ 직접 입력 | `deadline_timing=direct_input`, `deadline_source=direct_input_detail` |

---

### Q9-P

**고객 화면**

**이미 세무기관·회사·담당자에게 문의하거나 조치를 하셨다면, 그 뒤 어떤 답변을 받았고 아직 해결되지 않은 부분은 무엇인가요?**

① 문의 후 처리 방법을 안내받았지만, 실제로 어떤 자료를 제출해야 하는지는 여전히 분명하지 않습니다.  
② 자료를 제출하거나 세금 처리를 했지만, 결과가 어떻게 반영되었는지 답변을 받지 못했습니다.  
③ 담당자에게 설명을 들었지만, 설명과 실제 자료가 맞지 않아 어느 내용을 기준으로 해야 할지 모르겠습니다.  
④ 아직 문의나 조치를 하지 않았으며, 먼저 무엇을 확인하고 어떤 자료를 준비해야 하는지 알고 싶습니다.  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `post_action_response=procedure_guidance_received`, `post_action_unresolved=submission_scope_unclear` |
| ② | `post_action_response=action_completed_no_result_confirmation`, `post_action_unresolved=result_reflection_unknown` |
| ③ | `post_action_response=verbal_or_written_explanation_received`, `post_action_unresolved=explanation_data_conflict` |
| ④ | `post_action_response=no_action_yet`, `post_action_unresolved=pre_action_guidance_needed` |
| ⑤ 직접 입력 | `post_action_response=direct_input`, `post_action_unresolved=direct_input_detail` |

---

### Q10-P

**고객 화면**

**지금 실제로 진행을 막고 있는 이유는 무엇이며, 그 내용을 확인할 수 있는 자료를 가지고 계신가요?**

① 세금 관련 서류의 내용을 이해하지 못하는 것이 가장 큰 문제이고, 해당 서류를 가지고 있습니다.  
② 금액이나 계산 근거가 이해되지 않는 것이 가장 큰 문제이고, 급여·계약·입금 등의 자료를 가지고 있습니다.  
③ 신고·납부 또는 제출 방법을 몰라 진행하지 못하고 있고, 관련 안내나 화면을 가지고 있습니다.  
④ 필요한 자료 자체가 부족해서 진행하지 못하고 있으며, 현재 가지고 있는 자료부터 확인해야 합니다.  
⑤ 막혀 있는 것은 아니고 점검하는 단계이며, 가지고 있는 자료를 정리해서 확인해 보고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `blocking_reason=document_understanding`, `available_evidence=tax_document` |
| ② | `blocking_reason=amount_or_calculation_unclear`, `available_evidence=income_payment_records` |
| ③ | `blocking_reason=procedure_unknown`, `available_evidence=instruction_or_system_screen` |
| ④ | `blocking_reason=insufficient_evidence`, `available_evidence=partial_records` |
| ⑤ | `blocking_reason=no_blockage_self_check`, `available_evidence=records_at_hand` |
| ⑥ 직접 입력 | `blocking_reason=direct_input`, `available_evidence=direct_input_detail` |

---

### Q11-P

**고객 화면**

**이번 확인을 통해 최종적으로 어떤 사실을 분명히 알고 싶고, 그 다음 단계에서 어느 정도까지 도움을 받기를 원하시나요?**

① 제가 받은 안내가 맞는지 확인하고, 맞다면 제가 해야 할 신고·납부 방법까지 알고 싶습니다.  
② 세금 금액과 그 계산 근거가 맞는지 확인하고, 필요한 정정이나 후속 조치까지 알고 싶습니다.  
③ 신고·정산이 실제로 제대로 처리되었는지 확인하고, 문제가 있다면 해결에 필요한 자료와 절차까지 알고 싶습니다.  
④ 제가 가진 자료만으로 판단하기 어려운 부분을 전문가가 검토하고, 이후 필요한 조치까지 함께 진행하고 싶습니다.  
⑤ 특별한 문제가 있는지 전체 상태를 점검하고, 확인해야 할 항목과 안내를 받고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `final_goal=guidance_validity_and_compliance_action`, `support_scope=action_instructions` |
| ② | `final_goal=tax_amount_and_basis_verification`, `support_scope=correction_or_followup` |
| ③ | `final_goal=filing_settlement_completion_verification`, `support_scope=resolution_procedure` |
| ④ | `final_goal=expert_case_review`, `support_scope=expert_led_followthrough` |
| ⑤ | `final_goal=general_status_check`, `support_scope=checklist_and_guidance` |
| ⑥ 직접 입력 | `final_goal=direct_input`, `support_scope=direct_input_detail` |

---

## B-2. VAT·전자 인보이스 — 2차

### Q5-V

**고객 화면**

**VAT나 전자 인보이스 문제를 알게 된 자료는 어디에서 왔고, 그 안내가 실제 세무기관이나 공식 시스템에서 나온 것인지 확인하셨나요?**

① 세무기관이나 공식 전자 시스템에서 직접 확인했고, 출처도 확인했습니다.  
② 세무기관에서 온 것으로 알고 있지만 공식 발신 경로까지는 확인하지 못했습니다.  
③ 거래 상대방이나 회사 담당자를 통해 전달받았고, 원래 세무기관 안내인지 확인하지 못했습니다.  
④ 다른 사람이나 온라인에서 전달받은 내용이라 출처와 공식 여부를 모두 확인해야 합니다.  
⑤ 받은 VAT·인보이스 안내는 없고, 제가 먼저 확인해 보려는 것입니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `vat_notice_source=tax_authority_or_official_system`, `vat_notice_authenticity=verified` |
| ② | `vat_notice_source=claimed_tax_authority`, `vat_notice_authenticity=unverified` |
| ③ | `vat_notice_source=counterparty_or_internal_staff`, `vat_notice_authenticity=original_source_unverified` |
| ④ | `vat_notice_source=third_party_or_online`, `vat_notice_authenticity=source_unverified` |
| ⑤ | `vat_notice_source=none_self_initiated`, `vat_notice_authenticity=not_applicable` |
| ⑥ 직접 입력 | `vat_notice_source=direct_input`, `vat_notice_authenticity=direct_input_detail` |

---

### Q6-V

**고객 화면**

**받은 VAT·인보이스 안내와 실제 거래·전자 인보이스를 비교하면 무엇이 다르고, 그중 어떤 점이 가장 설명되지 않나요?**

① 안내된 거래 금액과 실제 거래 금액이 다르게 보이며, 그 차이가 VAT 계산에 어떻게 반영되는지 확인하고 싶습니다.  
② 안내된 인보이스 내용과 실제 전자 인보이스가 다르게 보이며, 어느 내용을 기준으로 해야 하는지 확인하고 싶습니다.  
③ 안내에서는 정상 처리되었다고 하지만 실제 시스템이나 인보이스에서는 그 결과가 확인되지 않으며, 반영 여부를 확인하고 싶습니다.  
④ 안내 내용과 실제 거래·인보이스가 모두 달라 보이며, 어떤 자료를 기준으로 비교해야 할지도 확인하고 싶습니다.  
⑤ 받은 안내가 따로 없어서 비교할 내용은 없고, 제가 알고 있는 VAT·인보이스 처리 방식이 맞는지 확인하고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `vat_guidance_actual_difference=transaction_amount_difference`, `vat_unexplained_point=vat_calculation_effect` |
| ② | `vat_guidance_actual_difference=invoice_content_difference`, `vat_unexplained_point=reference_document` |
| ③ | `vat_guidance_actual_difference=processing_reflection_unconfirmed`, `vat_unexplained_point=system_reflection` |
| ④ | `vat_guidance_actual_difference=overall_transaction_invoice_difference`, `vat_unexplained_point=comparison_basis` |
| ⑤ | `vat_guidance_actual_difference=self_check_no_guidance`, `vat_unexplained_point=own_understanding_basis` |
| ⑥ 직접 입력 | `vat_guidance_actual_difference=direct_input`, `vat_unexplained_point=direct_input_detail` |

---

### Q7-V

**고객 화면**

**확인하려는 VAT 금액은 어떤 금액이며, 그 금액은 거래금액·인보이스 금액·세율 중 무엇을 기준으로 계산되었다고 안내받았나요?**

① 판매 또는 구매 금액에 VAT를 적용한 금액을 확인하고 있으며, 거래금액을 기준으로 계산되었다고 들었습니다.  
② 전자 인보이스에 표시된 VAT 금액을 확인하고 있으며, 인보이스의 공급가액을 기준으로 계산되었다고 들었습니다.  
③ 적용된 VAT 세율이나 계산 방식이 맞는지 확인하고 있으며, 특정 세율을 기준으로 계산되었다고 안내받았습니다.  
④ 여러 거래의 VAT 금액이 함께 표시되어 있어 각각 어떤 거래금액과 기준으로 계산되었는지 확인이 필요합니다.  
⑤ 아직 구체적인 VAT 금액은 모르고, 어떤 금액을 확인해야 하는지부터 알고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `vat_amount_type=transaction_based_vat`, `vat_amount_basis=transaction_amount` |
| ② | `vat_amount_type=invoice_displayed_vat`, `vat_amount_basis=invoice_tax_base` |
| ③ | `vat_amount_type=rate_based_vat`, `vat_amount_basis=applied_vat_rate` |
| ④ | `vat_amount_type=multiple_transaction_vat`, `vat_amount_basis=multiple_transaction_bases` |
| ⑤ | `vat_amount_type=not_yet_identified`, `vat_amount_basis=to_be_identified` |
| ⑥ 직접 입력 | `vat_amount_type=direct_input`, `vat_amount_basis=direct_input_detail` |

---

### Q8-V

**고객 화면**

**전자 인보이스 수정·발행이나 VAT 신고·납부 기한이 있다면 언제쯤이고, 그 날짜는 어디에서 알게 되셨나요?**

① 세무기관이나 공식 전자 시스템의 안내에서 확인한 기한이 이미 지났거나 며칠 안에 다가옵니다.  
② 세무기관이나 공식 전자 시스템의 안내에서 기한을 확인했고, 아직 시간 여유가 있습니다.  
③ 거래 상대방이나 회사 담당자가 알려준 날짜인데, 이미 지났거나 곧 다가오는 것 같습니다.  
④ 온라인에서 보았거나 다른 사람에게 들었거나 기억나는 날짜라서, 정확한 기한은 아직 확실하지 않습니다.  
⑤ 기한이 있는지도 잘 모르겠고, 따로 안내받은 날짜도 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `vat_deadline_timing=passed_or_imminent`, `vat_deadline_source=official_notice` |
| ② | `vat_deadline_timing=upcoming_with_margin`, `vat_deadline_source=official_notice` |
| ③ | `vat_deadline_timing=possibly_passed_or_near`, `vat_deadline_source=counterparty_or_staff` |
| ④ | `vat_deadline_timing=unconfirmed_date`, `vat_deadline_source=online_hearsay_or_memory` |
| ⑤ | `vat_deadline_timing=unknown`, `vat_deadline_source=none` |
| ⑥ 직접 입력 | `vat_deadline_timing=direct_input`, `vat_deadline_source=direct_input_detail` |

---

### Q9-V

**고객 화면**

**이미 인보이스를 수정하거나 VAT 신고·납부 조치를 하셨다면, 그 뒤 어떤 답변이나 결과를 받았고 아직 해결되지 않은 부분은 무엇인가요?**

① 수정이나 신고 방법을 안내받았지만, 실제로 어떤 인보이스나 자료를 처리해야 하는지는 아직 명확하지 않습니다.  
② 인보이스 수정이나 신고를 했지만, 시스템에 결과가 제대로 반영되었는지 확인되지 않습니다.  
③ 담당자에게 설명을 들었지만, 설명과 실제 인보이스 내용이 달라 어느 것을 기준으로 해야 할지 모르겠습니다.  
④ 아직 아무 조치도 하지 않았으며, 먼저 어떤 자료와 인보이스를 확인해야 하는지 알고 싶습니다.  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `vat_post_action_response=procedure_guidance`, `vat_post_action_unresolved=target_document_unclear` |
| ② | `vat_post_action_response=action_completed_reflection_uncertain`, `vat_post_action_unresolved=system_reflection` |
| ③ | `vat_post_action_response=explanation_received`, `vat_post_action_unresolved=explanation_invoice_conflict` |
| ④ | `vat_post_action_response=no_action_yet`, `vat_post_action_unresolved=pre_action_check_needed` |
| ⑤ 직접 입력 | `vat_post_action_response=direct_input`, `vat_post_action_unresolved=direct_input_detail` |

---

### Q10-V

**고객 화면**

**현재 VAT 처리를 실제로 막고 있는 이유는 무엇이며, 그 문제를 확인할 수 있는 인보이스·거래자료를 가지고 계신가요?**

① 전자 인보이스의 내용을 이해하지 못하는 것이 가장 큰 문제이고, 해당 인보이스를 가지고 있습니다.  
② 거래금액과 VAT 금액이 맞는지 확인하기 어려운 것이 문제이고, 거래·입금 자료를 가지고 있습니다.  
③ 인보이스 발행·수정·신고 방법을 몰라 진행하지 못하고 있고, 관련 안내나 시스템 화면을 가지고 있습니다.  
④ 필요한 인보이스나 거래자료가 부족해서 진행하지 못하고 있으며, 현재 가진 자료부터 확인해야 합니다.  
⑤ 막혀 있는 것은 아니고 점검하는 단계이며, 가지고 있는 인보이스·거래자료를 정리해서 확인해 보고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `vat_blocking_reason=invoice_understanding`, `vat_available_evidence=invoice` |
| ② | `vat_blocking_reason=amount_or_vat_reconciliation`, `vat_available_evidence=transaction_and_payment_records` |
| ③ | `vat_blocking_reason=invoice_or_filing_procedure_unknown`, `vat_available_evidence=instruction_or_system_screen` |
| ④ | `vat_blocking_reason=insufficient_records`, `vat_available_evidence=partial_invoice_or_transaction_records` |
| ⑤ | `vat_blocking_reason=no_blockage_self_check`, `vat_available_evidence=records_at_hand` |
| ⑥ 직접 입력 | `vat_blocking_reason=direct_input`, `vat_available_evidence=direct_input_detail` |

---

### Q11-V

**고객 화면**

**이번 확인을 통해 최종적으로 어떤 VAT·전자 인보이스 사실을 분명히 알고 싶고, 그 다음 단계에서 어디까지 도움을 받기를 원하시나요?**

① 현재 전자 인보이스의 내용이 맞는지 확인하고, 필요한 수정·발행 방법까지 알고 싶습니다.  
② VAT 금액과 계산 기준이 맞는지 확인하고, 잘못된 부분이 있다면 정정 방법까지 알고 싶습니다.  
③ 신고·납부 또는 인보이스 처리가 실제로 완료되었는지 확인하고, 문제가 있다면 해결 절차까지 알고 싶습니다.  
④ 인보이스와 거래자료를 전문가가 함께 검토하고, 필요한 후속 처리까지 도움받고 싶습니다.  
⑤ 특별한 문제가 있는지 VAT·인보이스 전체 상태를 점검하고, 확인해야 할 항목과 안내를 받고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `vat_final_goal=invoice_validity_verification`, `vat_support_scope=issuance_or_correction_action` |
| ② | `vat_final_goal=vat_amount_basis_verification`, `vat_support_scope=tax_correction_action` |
| ③ | `vat_final_goal=processing_completion_verification`, `vat_support_scope=resolution_procedure` |
| ④ | `vat_final_goal=expert_invoice_transaction_review`, `vat_support_scope=expert_led_followthrough` |
| ⑤ | `vat_final_goal=general_status_check`, `vat_support_scope=checklist_and_guidance` |
| ⑥ 직접 입력 | `vat_final_goal=direct_input`, `vat_support_scope=direct_input_detail` |

---

## B-3. 법인세 — 2차

### Q5-C

**고객 화면**

**법인세 문제를 알게 된 자료나 안내는 어디에서 왔고, 그 내용이 실제 세무기관의 공식 안내인지 확인하셨나요?**

① 세무기관이나 공식 시스템에서 직접 확인했고, 출처도 확인했습니다.  
② 세무기관에서 온 것으로 알고 있지만 공식 발신 경로까지는 확인하지 못했습니다.  
③ 회사 담당자나 세무 담당자를 통해 전달받았고, 원래 세무기관 안내인지 확인하지 못했습니다.  
④ 다른 사람이나 온라인에서 전달받은 내용이라 출처와 공식 여부를 모두 확인해야 합니다.  
⑤ 받은 법인세 안내는 없고, 회사 일로 제가 먼저 확인해 보려는 것입니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_notice_source=tax_authority_or_official_system`, `corporate_notice_authenticity=verified` |
| ② | `corporate_notice_source=claimed_tax_authority`, `corporate_notice_authenticity=unverified` |
| ③ | `corporate_notice_source=company_or_tax_agent`, `corporate_notice_authenticity=original_source_unverified` |
| ④ | `corporate_notice_source=third_party_or_online`, `corporate_notice_authenticity=source_unverified` |
| ⑤ | `corporate_notice_source=none_self_initiated`, `corporate_notice_authenticity=not_applicable` |
| ⑥ 직접 입력 | `corporate_notice_source=direct_input`, `corporate_notice_authenticity=direct_input_detail` |

---

### Q6-C

**고객 화면**

**받은 법인세 안내와 실제 회사의 세금 자료를 비교하면 무엇이 다르고, 그중 어떤 점이 가장 설명되지 않나요?**

① 안내된 세금 계산 결과와 회사 자료를 비교했을 때 금액이 다르게 보이며, 그 차이가 신고 결과에 어떻게 연결되는지 확인하고 싶습니다.  
② 안내된 신고 내용과 실제 회사 자료가 다르게 보이며, 어느 자료를 기준으로 해야 하는지 확인하고 싶습니다.  
③ 신고가 완료되었다고 안내받았지만 실제 회사 자료나 시스템에서 그 결과를 확인하기 어렵습니다.  
④ 안내 내용과 실제 회사 상황이 모두 달라 보이며, 어떤 자료를 기준으로 비교해야 할지도 확인하고 싶습니다.  
⑤ 받은 안내가 따로 없어서 비교할 내용은 없고, 회사의 법인세 처리 방식에 대한 제 이해가 맞는지 확인하고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_guidance_actual_difference=tax_result_difference`, `corporate_unexplained_point=filing_result_effect` |
| ② | `corporate_guidance_actual_difference=filing_content_difference`, `corporate_unexplained_point=reference_document` |
| ③ | `corporate_guidance_actual_difference=completion_unconfirmed`, `corporate_unexplained_point=result_traceability` |
| ④ | `corporate_guidance_actual_difference=overall_company_data_difference`, `corporate_unexplained_point=comparison_basis` |
| ⑤ | `corporate_guidance_actual_difference=self_check_no_guidance`, `corporate_unexplained_point=own_understanding_basis` |
| ⑥ 직접 입력 | `corporate_guidance_actual_difference=direct_input`, `corporate_unexplained_point=direct_input_detail` |

---

### Q7-C

**고객 화면**

**확인하려는 법인세 금액은 어떤 금액이며, 그 금액은 회사의 소득·비용·신고자료 중 무엇을 기준으로 계산되었다고 안내받았나요?**

① 신고된 법인세 금액을 확인하고 있으며, 회사의 과세 대상 소득을 기준으로 계산되었다고 들었습니다.  
② 세금 계산에 반영된 금액을 확인하고 있으며, 회사의 비용 처리와 소득 계산을 기준으로 했다고 들었습니다.  
③ 이미 신고·납부한 금액을 확인하고 있으며, 제출된 법인세 신고자료를 기준으로 계산되었다고 들었습니다.  
④ 여러 금액이 함께 표시되어 있어 각각 어떤 회사 자료를 기준으로 계산했는지 확인이 필요합니다.  
⑤ 아직 구체적인 법인세 금액은 모르고, 어떤 금액을 확인해야 하는지부터 알고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_tax_amount_type=assessed_corporate_tax`, `corporate_tax_amount_basis=taxable_income` |
| ② | `corporate_tax_amount_type=calculation_amount`, `corporate_tax_amount_basis=income_and_expense_treatment` |
| ③ | `corporate_tax_amount_type=filed_or_paid_tax_amount`, `corporate_tax_amount_basis=filed_tax_return` |
| ④ | `corporate_tax_amount_type=multiple_tax_amounts`, `corporate_tax_amount_basis=multiple_company_records` |
| ⑤ | `corporate_tax_amount_type=not_yet_identified`, `corporate_tax_amount_basis=to_be_identified` |
| ⑥ 직접 입력 | `corporate_tax_amount_type=direct_input`, `corporate_tax_amount_basis=direct_input_detail` |

---

### Q8-C

**고객 화면**

**법인세 신고·납부나 세무기관 자료 제출 기한이 있다면 언제쯤이고, 그 날짜는 어디에서 알게 되셨나요?**

① 세무기관의 공식 안내나 서류에서 확인한 기한이 이미 지났거나 며칠 안에 다가옵니다.  
② 세무기관의 공식 안내나 서류에서 기한을 확인했고, 아직 시간 여유가 있습니다.  
③ 회사 담당자나 세무 담당자가 알려준 날짜인데, 이미 지났거나 곧 다가오는 것 같습니다.  
④ 온라인에서 보았거나 다른 사람에게 들었거나 기억나는 날짜라서, 정확한 기한은 아직 확실하지 않습니다.  
⑤ 기한이 있는지도 잘 모르겠고, 따로 안내받은 날짜도 없습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_deadline_timing=passed_or_imminent`, `corporate_deadline_source=official_notice` |
| ② | `corporate_deadline_timing=upcoming_with_margin`, `corporate_deadline_source=official_notice` |
| ③ | `corporate_deadline_timing=possibly_passed_or_near`, `corporate_deadline_source=company_or_tax_agent` |
| ④ | `corporate_deadline_timing=unconfirmed_date`, `corporate_deadline_source=online_hearsay_or_memory` |
| ⑤ | `corporate_deadline_timing=unknown`, `corporate_deadline_source=none` |
| ⑥ 직접 입력 | `corporate_deadline_timing=direct_input`, `corporate_deadline_source=direct_input_detail` |

---

### Q9-C

**고객 화면**

**이미 신고·납부하거나 세무기관에 자료를 제출하셨다면, 그 뒤 어떤 답변이나 결과를 받았고 아직 해결되지 않은 부분은 무엇인가요?**

① 제출이나 신고 방법은 안내받았지만, 실제로 어떤 자료를 추가해야 하는지는 아직 명확하지 않습니다.  
② 신고·납부 또는 자료 제출을 했지만, 그 결과가 세무기관 시스템에 어떻게 반영되었는지 확인되지 않습니다.  
③ 담당자에게 설명을 들었지만, 설명과 회사 자료가 달라 어느 내용을 기준으로 해야 할지 모르겠습니다.  
④ 아직 아무 조치도 하지 않았으며, 먼저 어떤 자료와 내용을 확인해야 하는지 알고 싶습니다.  
⑤ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_post_action_response=submission_guidance`, `corporate_post_action_unresolved=additional_document_scope` |
| ② | `corporate_post_action_response=action_completed_reflection_uncertain`, `corporate_post_action_unresolved=system_reflection` |
| ③ | `corporate_post_action_response=explanation_received`, `corporate_post_action_unresolved=explanation_company_data_conflict` |
| ④ | `corporate_post_action_response=no_action_yet`, `corporate_post_action_unresolved=pre_action_review_needed` |
| ⑤ 직접 입력 | `corporate_post_action_response=direct_input`, `corporate_post_action_unresolved=direct_input_detail` |

---

### Q10-C

**고객 화면**

**현재 법인세 처리를 실제로 막고 있는 이유는 무엇이며, 그 문제를 확인할 수 있는 회사 자료를 가지고 계신가요?**

① 세무기관 서류나 안내 내용을 이해하지 못하는 것이 가장 큰 문제이고, 해당 자료를 가지고 있습니다.  
② 세금 계산이나 금액의 근거가 이해되지 않는 것이 문제이고, 회사의 회계·세금 자료를 가지고 있습니다.  
③ 신고·납부 또는 자료 제출 방법을 몰라 진행하지 못하고 있고, 관련 안내나 시스템 화면을 가지고 있습니다.  
④ 필요한 회사 자료가 부족해서 진행하지 못하고 있으며, 현재 가진 자료부터 확인해야 합니다.  
⑤ 막혀 있는 것은 아니고 점검하는 단계이며, 회사가 가진 자료를 정리해서 확인해 보고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_blocking_reason=document_understanding`, `corporate_available_evidence=tax_authority_document` |
| ② | `corporate_blocking_reason=tax_calculation_unclear`, `corporate_available_evidence=accounting_and_tax_records` |
| ③ | `corporate_blocking_reason=filing_or_submission_procedure_unknown`, `corporate_available_evidence=instruction_or_system_screen` |
| ④ | `corporate_blocking_reason=insufficient_company_records`, `corporate_available_evidence=partial_company_records` |
| ⑤ | `corporate_blocking_reason=no_blockage_self_check`, `corporate_available_evidence=records_at_hand` |
| ⑥ 직접 입력 | `corporate_blocking_reason=direct_input`, `corporate_available_evidence=direct_input_detail` |

---

### Q11-C

**고객 화면**

**이번 확인을 통해 최종적으로 어떤 법인세 사실을 분명히 알고 싶고, 그 다음 단계에서 회사 업무를 어디까지 도움받기를 원하시나요?**

① 법인세 신고 내용이 맞는지 확인하고, 잘못된 부분이 있다면 수정 방법까지 알고 싶습니다.  
② 법인세 금액과 계산 근거가 맞는지 확인하고, 필요한 정정이나 후속 조치까지 알고 싶습니다.  
③ 신고·납부가 실제로 정상 처리되었는지 확인하고, 문제가 있다면 해결 절차까지 알고 싶습니다.  
④ 회사 자료와 세금 신고를 전문가가 함께 검토하고, 필요한 후속 처리까지 도움받고 싶습니다.  
⑤ 특별한 문제가 있는지 법인세 전체 상태를 점검하고, 확인해야 할 항목과 안내를 받고 싶습니다.  
⑥ **직접 입력**

**내부 저장**

| 선택 | 저장 필드 |
|---|---|
| ① | `corporate_final_goal=corporate_filing_validity_verification`, `corporate_support_scope=filing_correction_action` |
| ② | `corporate_final_goal=corporate_tax_amount_basis_verification`, `corporate_support_scope=tax_correction_followup` |
| ③ | `corporate_final_goal=filing_payment_completion_verification`, `corporate_support_scope=resolution_procedure` |
| ④ | `corporate_final_goal=expert_corporate_tax_review`, `corporate_support_scope=expert_led_followthrough` |
| ⑤ | `corporate_final_goal=general_status_check`, `corporate_support_scope=checklist_and_guidance` |
| ⑥ 직접 입력 | `corporate_final_goal=direct_input`, `corporate_support_scope=direct_input_detail` |

---

# C. 필드 표

모든 필드는 한 질문의 선택지에 2개 이상 함께 저장되고, 아래 E의 결과 문장 또는 위험 규칙에서 사용된다. 값 옆은 고객 표시 문구(G).

## C-1. 개인소득세

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `income_source` | `salary`(급여) / `personal_contract_project`(개인 계약·프로젝트 수입) / `rental_or_foreign_income`(임대·해외소득) / `mixed_income`(여러 소득이 함께 관련됨) | Q1-P |
| `tax_handling_interest` | `withholding_or_year_end`(원천징수·연말 정산) / `responsibility_or_filing`(세금 처리 책임·신고) / `reporting_or_treatment`(신고·처리 방법) / `combined_tax_treatment`(여러 소득의 통합 처리) | Q1-P |
| `income_payment_flow` | `tax_withheld_before_payment`(지급 전 세금을 먼저 뗌) / `full_payment_then_self_process`(전액 수령 후 직접 처리) / `full_payment_or_unclear`(전액 수령 후 처리 불분명) / `multiple_payment_methods`(여러 지급 방식) | Q2-P |
| `tax_handler` | `paying_party`(돈을 지급한 쪽) / `taxpayer`(본인이 직접 처리) / `third_party_claimed`(상대방이 처리한다고 들음) / `multiple_handlers`(처리 담당이 여러 곳) | Q2-P |
| `record_possession` | `mostly_available`(자료 대부분 있음) / `partially_available`(일부 자료만 있음) / `scattered_or_inconsistent`(흩어져 있거나 서로 다름) / `little_or_none`(자료가 거의 없음) | Q3-P |
| `record_check_need` | `calculation_linkage`(계산 과정 확인) / `income_tax_linkage`(받은 돈과 세금 처리의 연결) / `cross_document_consistency`(자료 간 일치 여부) / `required_record_guidance`(준비할 자료 안내) | Q3-P |
| `tax_issue_trigger` | `notice_or_document_received`(안내·서류를 받음) / `filing_or_settlement_due`(신고·정산 시점) / `result_mismatch`(처리 결과가 예상과 다름) / `language_barrier`(베트남어 이해 어려움) / `self_check`(미리 점검) | Q4-P |
| `current_difficulty` | `content_verification`(내용 확인) / `required_action_unclear`(해야 할 일이 불분명) / `result_explanation`(결과에 대한 설명) / `document_understanding`(서류 내용 이해) / `no_specific_blocker`(특별히 막힌 부분 없음) | Q4-P |
| `notice_source` | `tax_authority_direct`(세무기관에서 직접 받음) / `claimed_tax_authority`(세무기관이라고 안내받음) / `employer_or_counterparty`(회사·고용주·계약 상대방) / `third_party_or_online`(다른 사람·온라인) / `none_self_initiated`(받은 안내 없이 직접 확인) | Q5-P |
| `notice_authenticity` | `verified`(공식 출처 확인) / `unverified`(공식 출처 미확인) / `original_source_unverified`(원래 출처 미확인) / `source_unverified`(출처 미확인) / `not_applicable`(해당 없음) | Q5-P |
| `guidance_actual_difference` | `tax_handling_untraceable`(세금 처리 내용 확인 불가) / `amount_or_calculation_mismatch`(금액·계산 방식 불일치) / `filing_or_settlement_unconfirmed`(신고·정산 결과 미확인) / `overall_situation_mismatch`(상황 전반의 차이) / `self_check_no_guidance`(안내 없이 직접 점검) | Q6-P |
| `unexplained_point` | `payment_tax_linkage`(받은 돈과 세금 처리의 연결 확인) / `calculation_basis`(계산 근거) / `result_traceability`(결과 추적) / `comparison_basis_unclear`(비교 기준이 불분명) / `own_understanding_basis`(본인이 이해한 처리 방식) | Q6-P |
| `tax_amount_type` | `salary_tax_amount`(급여에서 빠진 세금 금액) / `contract_income_tax_amount`(계약 수입에서 처리된 세금 금액) / `rental_or_foreign_income_tax_amount`(임대·해외소득 세금 금액) / `mixed_income_tax_amount`(여러 소득의 세금 금액) / `not_yet_identified`(아직 모르는 금액) | Q7-P |
| `tax_amount_basis` | `salary_or_payment_amount`(급여 또는 지급액) / `contract_or_received_amount`(계약 금액 또는 받은 금액) / `related_income_amount`(해당 소득 금액) / `multiple_income_bases`(여러 소득 금액) / `to_be_identified`(확인할 금액 파악 필요) | Q7-P |
| `deadline_timing` | `passed_or_imminent`(기한이 지났거나 임박) / `upcoming_with_margin`(아직 여유 있음) / `possibly_passed_or_near`(지났거나 가까울 수 있음) / `unconfirmed_date`(날짜 미확정) / `unknown`(기한을 모름) | Q8-P |
| `deadline_source` | `official_notice`(공식 안내) / `employer_or_tax_agent`(회사·고용주·세무 담당자) / `online_hearsay_or_memory`(온라인·전해 들은 날짜·기억) / `none`(안내받은 날짜 없음) | Q8-P |
| `post_action_response` | `procedure_guidance_received`(처리 방법 안내를 받음) / `action_completed_no_result_confirmation`(조치는 했으나 결과 미확인) / `verbal_or_written_explanation_received`(설명을 들음) / `no_action_yet`(아직 조치 없음) | Q9-P |
| `post_action_unresolved` | `submission_scope_unclear`(제출 자료 범위가 불분명) / `result_reflection_unknown`(결과 반영 여부 모름) / `explanation_data_conflict`(설명과 자료가 다름) / `pre_action_guidance_needed`(조치 전 안내 필요) | Q9-P |
| `blocking_reason` | `document_understanding`(서류 내용 이해) / `amount_or_calculation_unclear`(금액·계산 근거 불명확) / `procedure_unknown`(절차를 모름) / `insufficient_evidence`(자료 부족) / `no_blockage_self_check`(막힌 것 없이 점검 중) | Q10-P |
| `available_evidence` | `tax_document`(세금 관련 서류) / `income_payment_records`(소득·지급 자료) / `instruction_or_system_screen`(안내문·시스템 화면) / `partial_records`(일부 자료) / `records_at_hand`(가지고 있는 자료) | Q10-P |
| `final_goal` | `guidance_validity_and_compliance_action`(안내의 정확성과 필요한 조치) / `tax_amount_and_basis_verification`(세금 금액·계산 근거 확인) / `filing_settlement_completion_verification`(신고·정산 처리 여부 확인) / `expert_case_review`(전문가의 사안 검토) / `general_status_check`(전체 상태 점검) | Q11-P |
| `support_scope` | `action_instructions`(신고·납부 등 다음 조치 안내) / `correction_or_followup`(정정·후속 조치) / `resolution_procedure`(문제 해결 절차) / `expert_led_followthrough`(전문가 검토 및 후속 진행) / `checklist_and_guidance`(확인 항목과 안내) | Q11-P |

## C-2. VAT·전자 인보이스

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `vat_transaction_type` | `domestic_sale`(베트남에서 판매한 거래) / `domestic_purchase`(베트남에서 구입한 거래) / `unrecognized_transaction`(기억에 없거나 불분명한 거래) / `cross_border_transaction`(해외 거래) | Q1-V |
| `vat_check_focus` | `sales_vat_treatment`(판매 VAT 처리) / `purchase_invoice_vat`(구입 인보이스와 VAT 처리) / `transaction_identification`(어떤 거래인지 확인) / `cross_border_vat_invoice_treatment`(해외 거래의 VAT·인보이스 처리) | Q1-V |
| `invoice_handling_actor` | `self_issued`(직접 발행) / `counterparty_issued`(거래 상대방이 발행) / `not_issued_by_anyone`(인보이스가 아직 없음) / `revised_or_reissued`(수정·재발행됨) / `staff_or_agent_handled`(담당자·대행사가 처리) | Q2-V |
| `invoice_handling_state` | `issued_content_check`(발행한 내용 확인) / `received_content_check`(받은 내용 확인) / `issuance_needed`(발행 필요 여부 확인) / `revision_relation_unclear`(이전 자료와의 관계 불분명) / `state_unknown`(상태를 정확히 모름) | Q2-V |
| `vat_record_set` | `invoice_and_transaction_available`(인보이스와 거래 자료 모두 있음) / `invoice_only`(인보이스만 있음) / `transaction_only_or_partial_invoice`(거래 자료만 있거나 인보이스 일부만 있음) / `mixed_multiple_records`(여러 거래·인보이스가 섞여 있음) | Q3-V |
| `vat_record_check` | `amount_and_vat_match`(금액·VAT·세율 일치 여부) / `date_and_party_match`(날짜·상대방 정보 일치 여부) / `invoice_vs_transaction`(인보이스와 실제 거래의 일치 여부) / `missing_invoice_scope`(빠진 인보이스 범위) / `linkage_organization`(인보이스·거래 연결 정리) | Q3-V |
| `vat_issue_trigger` | `authority_or_counterparty_notice`(세무기관·거래 상대방의 안내) / `filing_or_invoice_action_due`(신고·인보이스 처리 시점) / `invoice_result_mismatch`(처리한 인보이스의 불일치) / `language_barrier`(베트남어 이해 어려움) / `self_check`(미리 점검) | Q4-V |
| `vat_current_blockage` | `notice_verification`(안내 내용 확인) / `required_action_unclear`(해야 할 일이 불분명) / `next_action_unclear`(다음 조치가 불분명) / `document_understanding`(서류 내용 이해) / `no_specific_blocker`(특별히 막힌 부분 없음) | Q4-V |
| `vat_notice_source` | `tax_authority_or_official_system`(세무기관·공식 시스템) / `claimed_tax_authority`(세무기관이라고 안내받음) / `counterparty_or_internal_staff`(거래 상대방 또는 회사 담당자) / `third_party_or_online`(다른 사람·온라인) / `none_self_initiated`(받은 안내 없이 직접 확인) | Q5-V |
| `vat_notice_authenticity` | `verified`(공식 출처 확인) / `unverified`(공식 출처 미확인) / `original_source_unverified`(원래 출처 미확인) / `source_unverified`(출처 미확인) / `not_applicable`(해당 없음) | Q5-V |
| `vat_guidance_actual_difference` | `transaction_amount_difference`(거래 금액의 차이) / `invoice_content_difference`(인보이스 내용의 차이) / `processing_reflection_unconfirmed`(처리 반영 여부 미확인) / `overall_transaction_invoice_difference`(거래·인보이스 전반의 차이) / `self_check_no_guidance`(안내 없이 직접 점검) | Q6-V |
| `vat_unexplained_point` | `vat_calculation_effect`(VAT 계산에 미치는 영향) / `reference_document`(기준 문서) / `system_reflection`(시스템 반영 여부) / `comparison_basis`(비교 기준) / `own_understanding_basis`(본인이 이해한 처리 방식) | Q6-V |
| `vat_amount_type` | `transaction_based_vat`(거래 금액 기준 VAT) / `invoice_displayed_vat`(인보이스에 표시된 VAT 금액) / `rate_based_vat`(세율 기준 VAT) / `multiple_transaction_vat`(여러 거래의 VAT 금액) / `not_yet_identified`(아직 모르는 금액) | Q7-V |
| `vat_amount_basis` | `transaction_amount`(거래 금액) / `invoice_tax_base`(인보이스의 공급가액) / `applied_vat_rate`(적용된 VAT 세율) / `multiple_transaction_bases`(여러 거래 금액) / `to_be_identified`(확인할 금액 파악 필요) | Q7-V |
| `vat_deadline_timing` | `passed_or_imminent`(기한이 지났거나 임박) / `upcoming_with_margin`(아직 여유 있음) / `possibly_passed_or_near`(지났거나 가까울 수 있음) / `unconfirmed_date`(날짜 미확정) / `unknown`(기한을 모름) | Q8-V |
| `vat_deadline_source` | `official_notice`(공식 안내) / `counterparty_or_staff`(거래 상대방 또는 회사 담당자) / `online_hearsay_or_memory`(온라인·전해 들은 날짜·기억) / `none`(안내받은 날짜 없음) | Q8-V |
| `vat_post_action_response` | `procedure_guidance`(처리 방법 안내를 받음) / `action_completed_reflection_uncertain`(조치는 했으나 반영 여부 불확실) / `explanation_received`(설명을 들음) / `no_action_yet`(아직 조치 없음) | Q9-V |
| `vat_post_action_unresolved` | `target_document_unclear`(처리할 자료가 불분명) / `system_reflection`(시스템 반영 여부) / `explanation_invoice_conflict`(설명과 인보이스가 다름) / `pre_action_check_needed`(조치 전 확인 필요) | Q9-V |
| `vat_blocking_reason` | `invoice_understanding`(인보이스 내용 이해) / `amount_or_vat_reconciliation`(금액과 VAT 대조) / `invoice_or_filing_procedure_unknown`(인보이스·신고 방법을 모름) / `insufficient_records`(기록·자료 부족) / `no_blockage_self_check`(막힌 것 없이 점검 중) | Q10-V |
| `vat_available_evidence` | `invoice`(전자 인보이스) / `transaction_and_payment_records`(거래·입금 자료) / `instruction_or_system_screen`(안내문·시스템 화면) / `partial_invoice_or_transaction_records`(일부 인보이스·거래 자료) / `records_at_hand`(가지고 있는 자료) | Q10-V |
| `vat_final_goal` | `invoice_validity_verification`(인보이스 내용 확인) / `vat_amount_basis_verification`(VAT 금액·계산 기준 확인) / `processing_completion_verification`(처리 완료 여부 확인) / `expert_invoice_transaction_review`(전문가의 인보이스·거래 검토) / `general_status_check`(전체 상태 점검) | Q11-V |
| `vat_support_scope` | `issuance_or_correction_action`(발행·수정 방법) / `tax_correction_action`(정정 방법) / `resolution_procedure`(문제 해결 절차) / `expert_led_followthrough`(전문가 검토 및 후속 진행) / `checklist_and_guidance`(확인 항목과 안내) | Q11-V |

## C-3. 법인세

| 필드 | 값 (고객 표시) | 사용 질문 |
|---|---|---|
| `corporate_tax_stage` | `filing_preparation`(법인세 신고 준비) / `filed`(신고 완료) / `authority_review_or_request`(세무기관 검토·자료 요청) / `tax_amount_result_issue`(법인세 금액·결과 확인) | Q1-C |
| `corporate_tax_check_scope` | `calculation_and_filing`(계산과 신고 내용) / `filed_content_and_calculation`(신고 내용과 계산) / `authority_issue_review`(세무기관 지적 사항 검토) / `calculation_basis_and_process`(계산 근거와 처리 과정) | Q1-C |
| `corporate_record_readiness` | `mostly_organized`(대부분 정리됨) / `partially_distributed`(일부만 정리, 나머지는 흩어짐) / `period_or_basis_mismatch`(기간·기준이 다름) / `insufficient_records`(기록·자료 부족) | Q2-C |
| `corporate_record_check` | `filing_traceability`(신고에 반영된 자료 확인) / `required_document_identification`(필요한 자료 파악) / `reference_basis`(기준 자료) / `source_reconstruction`(원자료 재확인) | Q2-C |
| `corporate_filing_comparison_issue` | `revenue_reporting_difference`(수입과 신고 수입의 차이) / `expense_reporting_difference`(지출과 신고 비용의 차이) / `transaction_reporting_difference`(거래와 신고 자료의 차이) / `aggregate_or_period_difference`(합계·기간의 차이) | Q3-C |
| `corporate_filing_impact_check` | `taxable_income_linkage`(과세 소득과의 연결) / `deductible_expense_linkage`(비용 처리 범위 연결) / `transaction_completeness`(거래 누락 여부) / `overall_filing_consistency`(신고 결과 전체의 일치 여부) | Q3-C |
| `corporate_issue_trigger` | `authority_request`(세무기관의 요청) / `filing_or_payment_due`(신고·납부 시점) / `filed_or_paid_result_difference`(신고·납부 결과의 차이) / `internal_explanation_data_difference`(담당자 설명과 자료의 차이) / `self_check`(미리 점검) | Q4-C |
| `corporate_current_blockage` | `submission_or_review`(제출·검토 대응) / `procedure_preparation`(절차·준비 사항 확인) / `result_reconciliation`(결과 차이 대조) / `reference_selection`(기준 자료 선택) / `no_specific_blocker`(특별히 막힌 부분 없음) | Q4-C |
| `corporate_notice_source` | `tax_authority_or_official_system`(세무기관·공식 시스템) / `claimed_tax_authority`(세무기관이라고 안내받음) / `company_or_tax_agent`(회사 또는 세무 담당자) / `third_party_or_online`(다른 사람·온라인) / `none_self_initiated`(받은 안내 없이 직접 확인) | Q5-C |
| `corporate_notice_authenticity` | `verified`(공식 출처 확인) / `unverified`(공식 출처 미확인) / `original_source_unverified`(원래 출처 미확인) / `source_unverified`(출처 미확인) / `not_applicable`(해당 없음) | Q5-C |
| `corporate_guidance_actual_difference` | `tax_result_difference`(세금 계산 결과의 차이) / `filing_content_difference`(신고 내용의 차이) / `completion_unconfirmed`(완료 여부 미확인) / `overall_company_data_difference`(회사 자료 전반의 차이) / `self_check_no_guidance`(안내 없이 직접 점검) | Q6-C |
| `corporate_unexplained_point` | `filing_result_effect`(신고 결과에 미치는 영향) / `reference_document`(기준 문서) / `result_traceability`(결과 추적) / `comparison_basis`(비교 기준) / `own_understanding_basis`(본인이 이해한 처리 방식) | Q6-C |
| `corporate_tax_amount_type` | `assessed_corporate_tax`(신고된 법인세 금액) / `calculation_amount`(세금 계산에 반영된 금액) / `filed_or_paid_tax_amount`(신고·납부한 금액) / `multiple_tax_amounts`(여러 세금 금액) / `not_yet_identified`(아직 모르는 금액) | Q7-C |
| `corporate_tax_amount_basis` | `taxable_income`(과세 대상 소득) / `income_and_expense_treatment`(소득과 비용 처리) / `filed_tax_return`(제출한 법인세 신고자료) / `multiple_company_records`(여러 회사 자료) / `to_be_identified`(확인할 금액 파악 필요) | Q7-C |
| `corporate_deadline_timing` | `passed_or_imminent`(기한이 지났거나 임박) / `upcoming_with_margin`(아직 여유 있음) / `possibly_passed_or_near`(지났거나 가까울 수 있음) / `unconfirmed_date`(날짜 미확정) / `unknown`(기한을 모름) | Q8-C |
| `corporate_deadline_source` | `official_notice`(공식 안내) / `company_or_tax_agent`(회사 또는 세무 담당자) / `online_hearsay_or_memory`(온라인·전해 들은 날짜·기억) / `none`(안내받은 날짜 없음) | Q8-C |
| `corporate_post_action_response` | `submission_guidance`(제출 방법 안내를 받음) / `action_completed_reflection_uncertain`(조치는 했으나 반영 여부 불확실) / `explanation_received`(설명을 들음) / `no_action_yet`(아직 조치 없음) | Q9-C |
| `corporate_post_action_unresolved` | `additional_document_scope`(추가로 낼 자료 범위) / `system_reflection`(시스템 반영 여부) / `explanation_company_data_conflict`(설명과 회사 자료가 다름) / `pre_action_review_needed`(조치 전 검토 필요) | Q9-C |
| `corporate_blocking_reason` | `document_understanding`(서류 내용 이해) / `tax_calculation_unclear`(세금 계산 근거 불명확) / `filing_or_submission_procedure_unknown`(신고·제출 방법을 모름) / `insufficient_company_records`(회사 자료 부족) / `no_blockage_self_check`(막힌 것 없이 점검 중) | Q10-C |
| `corporate_available_evidence` | `tax_authority_document`(세무기관 서류) / `accounting_and_tax_records`(회계·세금 자료) / `instruction_or_system_screen`(안내문·시스템 화면) / `partial_company_records`(일부 회사 자료) / `records_at_hand`(가지고 있는 자료) | Q10-C |
| `corporate_final_goal` | `corporate_filing_validity_verification`(법인세 신고 내용 확인) / `corporate_tax_amount_basis_verification`(법인세 금액·계산 근거 확인) / `filing_payment_completion_verification`(신고·납부 완료 여부 확인) / `expert_corporate_tax_review`(전문가의 법인세 검토) / `general_status_check`(전체 상태 점검) | Q11-C |
| `corporate_support_scope` | `filing_correction_action`(신고 수정 방법) / `tax_correction_followup`(정정·후속 조치) / `resolution_procedure`(문제 해결 절차) / `expert_led_followthrough`(전문가 검토 및 후속 진행) / `checklist_and_guidance`(확인 항목과 안내) | Q11-C |

# D. 라우팅

1. 첫 진입에서 개인소득세 / VAT·전자 인보이스 / 법인세 중 하나를 고른다(A-0). 잘 모르겠거나 직접 입력이면 개인소득세 경로로 시작한다.
2. 선택한 경로의 1차 4개를 마친 뒤 같은 경로의 2차 7개로 이어진다. **질문 중간에 멈추지 않는다.**
3. **긴급해 보이는 경우**(기한 임박, 세무기관 추가 자료 요구, 신고·납부가 막힘, 받은 서류를 이해하지 못함)에도 질문을 줄이거나 건너뛰지 않는다. 모든 질문을 마친 뒤 결과에서 **전문가 진행**으로 연결한다.
4. 결과에서의 연결 안내(E-3)는 권유 문구이며, 고객에게 서비스 이동을 강제하지 않는다.

---

# E. 결과

## E-1. 1차 무료 결과

마스터 1차 결과 구성을 따른다: **01 현재 상황**(판정 1줄 + 본문 1~2문장), **02 핵심 확인 결과**(카드 3개, 카드 하단 문구 약 48자 이내), **03 주요 위험 요소**(최대 4개). 04·05는 무료 1차에서 노출하지 않는다.

- 판정·본문 = Q4 선택지, 카드1 = Q1, 카드2 = Q2, 카드3 = Q3 선택지에서 가져온다(질문·선택지가 정해지면 문장이 정해지므로 조사 오류가 없다).
- 선택지 키 = 해당 선택지의 저장 필드 쌍.
- 직접 입력을 고른 항목은 해당 칸에 `직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.`를 표시한다(카드·본문 공통).

### E-1-P. 개인소득세

**카드1 (확인하려는 것)** — Q1-P

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `income_source=salary`, `tax_handling_interest=withholding_or_year_end` | 급여에서 세금이 어떻게 처리되었는지 확인합니다. | 26 |
| ② | `income_source=personal_contract_project`, `tax_handling_interest=responsibility_or_filing` | 개인 계약·프로젝트 수입의 세금 처리를 확인합니다. | 28 |
| ③ | `income_source=rental_or_foreign_income`, `tax_handling_interest=reporting_or_treatment` | 임대료·해외소득의 신고와 처리 방법을 확인합니다. | 27 |
| ④ | `income_source=mixed_income`, `tax_handling_interest=combined_tax_treatment` | 여러 소득의 세금 처리를 한꺼번에 확인합니다. | 25 |

**카드2 (돈이 오간 방식과 처리 담당)** — Q2-P

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `income_payment_flow=tax_withheld_before_payment`, `tax_handler=paying_party` | 받을 때 상대방이 먼저 세금을 떼고 지급한 상태입니다. | 30 |
| ② | `income_payment_flow=full_payment_then_self_process`, `tax_handler=taxpayer` | 전액을 받은 뒤 직접 처리해야 한다고 안내받았습니다. | 29 |
| ③ | `income_payment_flow=full_payment_or_unclear`, `tax_handler=third_party_claimed` | 상대방이 처리한다고 들었으나 실제 처리는 미확인입니다. | 30 |
| ④ | `income_payment_flow=multiple_payment_methods`, `tax_handler=multiple_handlers` | 받은 곳마다 세금 처리 방식과 담당이 서로 다릅니다. | 29 |

**카드3 (자료 상태)** — Q3-P

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `record_possession=mostly_available`, `record_check_need=calculation_linkage` | 자료가 대부분 있어 계산 과정부터 확인할 수 있습니다. | 30 |
| ② | `record_possession=partially_available`, `record_check_need=income_tax_linkage` | 일부 자료만 있어 받은 돈과 세금의 연결을 봐야 합니다. | 31 |
| ③ | `record_possession=scattered_or_inconsistent`, `record_check_need=cross_document_consistency` | 자료가 흩어졌거나 서로 달라 전체 비교가 필요합니다. | 29 |
| ④ | `record_possession=little_or_none`, `record_check_need=required_record_guidance` | 자료가 거의 없어 준비할 자료부터 정리해야 합니다. | 28 |

**01 판정 + 본문** — Q4-P

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `tax_issue_trigger=notice_or_document_received`, `current_difficulty=content_verification` | 받으신 안내나 서류의 내용을 먼저 확인해야 하는 상태입니다. | 세금 관련 안내를 받고 확인을 시작하셨습니다. 안내의 출처와 내용이 실제 상황과 맞는지부터 살펴보겠습니다. |
| ② | `tax_issue_trigger=filing_or_settlement_due`, `current_difficulty=required_action_unclear` | 신고·정산 시점에 해야 할 일을 확인해야 하는 상태입니다. | 신고나 정산 시기가 되어 확인을 시작하셨습니다. 해야 할 일과 기한을 먼저 정리하는 것이 좋습니다. |
| ③ | `tax_issue_trigger=result_mismatch`, `current_difficulty=result_explanation` | 처리 결과가 예상과 다른 이유를 확인해야 하는 상태입니다. | 처리를 마쳤지만 금액이나 결과가 달라 확인을 시작하셨습니다. 어떤 자료에서 차이가 생겼는지 살펴보겠습니다. |
| ④ | `tax_issue_trigger=language_barrier`, `current_difficulty=document_understanding` | 베트남어 서류나 설명의 정확한 뜻을 확인해야 하는 상태입니다. | 베트남어 내용을 이해하기 어려워 확인을 시작하셨습니다. 서류가 실제로 요구하는 것이 무엇인지 쉽게 풀어서 살펴보겠습니다. |
| ⑤ | `tax_issue_trigger=self_check`, `current_difficulty=no_specific_blocker` | 특별한 문제 없이 미리 점검하시는 상태입니다. | 받은 안내나 막힌 일은 없지만 미리 점검하고 싶으셨습니다. 지금 가진 자료로 확인할 항목을 정리해 보겠습니다. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (P-R1) | `tax_issue_trigger` ∈ {notice_or_document_received}. 단, `notice_authenticity` = verified 이면 제외 | 받은 안내가 실제 세무기관에서 온 것인지 먼저 확인하지 않으면 잘못된 안내를 따를 수 있습니다. |
| 2 (P-R2) | `tax_issue_trigger` ∈ {filing_or_settlement_due} 또는 `deadline_timing` ∈ {passed_or_imminent, possibly_passed_or_near} | 신고·정산 기한이 언제인지 정확히 확인해야 합니다. |
| 3 (P-R3) | `tax_handler` ∈ {third_party_claimed, multiple_handlers} | 처리 담당이 불분명하면 같은 세금을 중복 처리하거나 빠뜨릴 수 있습니다. |
| 4 (P-R4) | `tax_handler` ∈ {taxpayer} | 직접 처리해야 하는 부분이라면 처리 시기를 놓치지 않는지 확인이 필요합니다. |
| 5 (P-R5) | `tax_issue_trigger` ∈ {result_mismatch} | 처리 결과가 예상과 다른 이유를 확인하기 전에는 어느 쪽이 맞는지 알 수 없습니다. |
| 6 (P-R6) | `tax_issue_trigger` ∈ {language_barrier} | 베트남어 서류를 잘못 이해하면 필요한 조치를 놓칠 수 있습니다. |
| 7 (P-R7) | `record_possession` ∈ {scattered_or_inconsistent, little_or_none, partially_available} | 자료가 부족하거나 서로 다르면 어느 금액이 맞는지 판단할 근거가 약해집니다. |
| 8 (P-R8) | `income_source` ∈ {mixed_income} | 소득 종류마다 처리 방식이 달라, 한꺼번에 정리하지 않으면 빠지는 부분이 생길 수 있습니다. |
| 9 (P-R9) | `income_source` ∈ {rental_or_foreign_income} | 임대·해외소득은 신고 방식이 달라 따로 확인이 필요합니다. |
| 기본 | 위 조건에 하나도 해당하지 않음 | 지금 답변만으로는 눈에 띄는 위험 신호가 많지 않지만, 어떤 자료를 기준으로 할지는 확인이 필요합니다. |

### E-1-V. VAT·전자 인보이스

**카드1 (확인하려는 것)** — Q1-V

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `vat_transaction_type=domestic_sale`, `vat_check_focus=sales_vat_treatment` | 판매 거래의 VAT 처리가 맞는지 확인합니다. | 25 |
| ② | `vat_transaction_type=domestic_purchase`, `vat_check_focus=purchase_invoice_vat` | 구입 거래의 인보이스와 VAT 처리를 확인합니다. | 27 |
| ③ | `vat_transaction_type=unrecognized_transaction`, `vat_check_focus=transaction_identification` | 어떤 거래인지 불분명한 안내를 먼저 확인합니다. | 26 |
| ④ | `vat_transaction_type=cross_border_transaction`, `vat_check_focus=cross_border_vat_invoice_treatment` | 해외 거래의 VAT와 인보이스 처리를 확인합니다. | 27 |

**카드2 (인보이스 상태)** — Q2-V

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `invoice_handling_actor=self_issued`, `invoice_handling_state=issued_content_check` | 직접 발행한 인보이스의 내용을 확인해야 합니다. | 26 |
| ② | `invoice_handling_actor=counterparty_issued`, `invoice_handling_state=received_content_check` | 상대방이 발행한 인보이스의 내용을 확인해야 합니다. | 28 |
| ③ | `invoice_handling_actor=not_issued_by_anyone`, `invoice_handling_state=issuance_needed` | 거래는 했지만 인보이스가 아직 없는 상태입니다. | 26 |
| ④ | `invoice_handling_actor=revised_or_reissued`, `invoice_handling_state=revision_relation_unclear` | 수정·재발행으로 이전 자료와의 관계가 불분명합니다. | 28 |
| ⑤ | `invoice_handling_actor=staff_or_agent_handled`, `invoice_handling_state=state_unknown` | 담당자가 처리해 인보이스 상태가 파악되지 않았습니다. | 29 |

**카드3 (자료 상태)** — Q3-V

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `vat_record_set=invoice_and_transaction_available`, `vat_record_check=amount_and_vat_match` | 인보이스와 거래자료가 있어 금액·세율 대조가 가능합니다. | 31 |
| ② | `vat_record_set=invoice_and_transaction_available`, `vat_record_check=date_and_party_match` | 인보이스와 거래자료가 있어 날짜·상대방 대조가 가능합니다. | 32 |
| ③ | `vat_record_set=invoice_only`, `vat_record_check=invoice_vs_transaction` | 인보이스만 있어 실제 거래와의 일치 확인이 필요합니다. | 30 |
| ④ | `vat_record_set=transaction_only_or_partial_invoice`, `vat_record_check=missing_invoice_scope` | 거래자료만 있어 빠진 인보이스 범위 확인이 필요합니다. | 30 |
| ⑤ | `vat_record_set=mixed_multiple_records`, `vat_record_check=linkage_organization` | 여러 거래와 인보이스가 섞여 연결 정리가 필요합니다. | 29 |

**01 판정 + 본문** — Q4-V

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `vat_issue_trigger=authority_or_counterparty_notice`, `vat_current_blockage=notice_verification` | 받으신 인보이스·VAT 안내의 내용을 먼저 확인해야 하는 상태입니다. | 세무기관이나 거래 상대방의 안내를 받고 확인을 시작하셨습니다. 안내의 출처와 내용이 실제 거래와 맞는지부터 살펴보겠습니다. |
| ② | `vat_issue_trigger=filing_or_invoice_action_due`, `vat_current_blockage=required_action_unclear` | 신고·인보이스 처리 시점에 해야 할 일을 확인해야 하는 상태입니다. | VAT 신고나 인보이스 처리 시기가 되어 확인을 시작하셨습니다. 해야 할 일과 기한을 먼저 정리하는 것이 좋습니다. |
| ③ | `vat_issue_trigger=invoice_result_mismatch`, `vat_current_blockage=next_action_unclear` | 이미 처리한 인보이스가 맞지 않는 이유를 확인해야 하는 상태입니다. | 이미 발행·수령한 인보이스의 내용이나 VAT 금액이 맞지 않아 확인을 시작하셨습니다. 어느 자료에서 차이가 생겼는지 살펴보겠습니다. |
| ④ | `vat_issue_trigger=language_barrier`, `vat_current_blockage=document_understanding` | 베트남어 인보이스·안내의 정확한 뜻을 확인해야 하는 상태입니다. | 베트남어 내용을 이해하기 어려워 확인을 시작하셨습니다. 어떤 조치가 실제로 필요한지 쉽게 풀어서 살펴보겠습니다. |
| ⑤ | `vat_issue_trigger=self_check`, `vat_current_blockage=no_specific_blocker` | 특별한 문제 없이 미리 점검하시는 상태입니다. | 받은 안내나 막힌 일은 없지만 VAT·인보이스 처리를 미리 점검하고 싶으셨습니다. 지금 가진 자료로 확인할 항목을 정리해 보겠습니다. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (V-R1) | `vat_issue_trigger` ∈ {authority_or_counterparty_notice}. 단, `vat_notice_authenticity` = verified 이면 제외 | 받은 안내가 실제 세무기관이나 공식 시스템에서 온 것인지 먼저 확인이 필요합니다. |
| 2 (V-R2) | `vat_transaction_type` ∈ {unrecognized_transaction} | 기억에 없는 거래의 안내는 사실을 확인하기 전에 대응하지 않는 것이 안전합니다. |
| 3 (V-R3) | `vat_issue_trigger` ∈ {filing_or_invoice_action_due} 또는 `vat_deadline_timing` ∈ {passed_or_imminent, possibly_passed_or_near} | 인보이스 수정·발행이나 VAT 신고 기한을 정확히 확인해야 합니다. |
| 4 (V-R4) | `vat_issue_trigger` ∈ {invoice_result_mismatch} 또는 `vat_record_check` ∈ {amount_and_vat_match, date_and_party_match, invoice_vs_transaction} | 인보이스와 실제 거래의 차이를 확인하지 않으면 VAT 처리의 근거가 약해질 수 있습니다. |
| 5 (V-R5) | `invoice_handling_actor` ∈ {not_issued_by_anyone} | 인보이스가 없는 거래는 누가 어떻게 발행해야 하는지 확인이 필요합니다. |
| 6 (V-R6) | `invoice_handling_actor` ∈ {revised_or_reissued} | 수정·재발행된 인보이스는 어느 것이 최종본인지 확인해야 합니다. |
| 7 (V-R7) | `invoice_handling_actor` ∈ {staff_or_agent_handled} | 담당자가 처리한 부분은 실제 처리 내역을 직접 확인할 필요가 있습니다. |
| 8 (V-R8) | `vat_transaction_type` ∈ {cross_border_transaction} | 해외 거래는 VAT와 인보이스 처리 방식이 달라 따로 확인이 필요합니다. |
| 9 (V-R9) | `vat_record_set` ∈ {mixed_multiple_records} | 여러 거래가 섞여 있어 빠지거나 겹치는 인보이스가 생길 수 있습니다. |
| 10 (V-R10) | `vat_issue_trigger` ∈ {language_barrier} | 베트남어 인보이스·안내를 잘못 이해하면 필요한 조치를 놓칠 수 있습니다. |
| 기본 | 위 조건에 하나도 해당하지 않음 | 지금 답변만으로는 눈에 띄는 위험 신호가 많지 않지만, 어떤 자료를 기준으로 할지는 확인이 필요합니다. |

### E-1-C. 법인세

**카드1 (확인하려는 것)** — Q1-C

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `corporate_tax_stage=filing_preparation`, `corporate_tax_check_scope=calculation_and_filing` | 법인세 신고 준비 단계의 계산과 신고를 확인합니다. | 28 |
| ② | `corporate_tax_stage=filed`, `corporate_tax_check_scope=filed_content_and_calculation` | 이미 한 법인세 신고의 내용과 계산을 확인합니다. | 27 |
| ③ | `corporate_tax_stage=authority_review_or_request`, `corporate_tax_check_scope=authority_issue_review` | 세무기관의 검토·요청에 대해 확인할 부분을 봅니다. | 28 |
| ④ | `corporate_tax_stage=tax_amount_result_issue`, `corporate_tax_check_scope=calculation_basis_and_process` | 예상과 다른 법인세 금액의 계산 근거를 확인합니다. | 28 |

**카드2 (자료 정리 상태)** — Q2-C

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `corporate_record_readiness=mostly_organized`, `corporate_record_check=filing_traceability` | 자료는 대부분 정리됐고 신고 반영 여부를 확인합니다. | 29 |
| ② | `corporate_record_readiness=partially_distributed`, `corporate_record_check=required_document_identification` | 자료가 흩어져 있어 필요한 자료부터 파악해야 합니다. | 29 |
| ③ | `corporate_record_readiness=period_or_basis_mismatch`, `corporate_record_check=reference_basis` | 자료마다 기간·기준이 달라 기준 자료 선택이 필요합니다. | 31 |
| ④ | `corporate_record_readiness=insufficient_records`, `corporate_record_check=source_reconstruction` | 자료가 부족해 원자료와 신고 내용의 비교가 필요합니다. | 30 |

**카드3 (비교할 부분)** — Q3-C

| 선택 | 저장 필드 | 카드 문장 | 글자 수 |
|---|---|---|---:|
| ① | `corporate_filing_comparison_issue=revenue_reporting_difference`, `corporate_filing_impact_check=taxable_income_linkage` | 실제 수입과 신고된 수입이 같은지 비교해야 합니다. | 28 |
| ② | `corporate_filing_comparison_issue=expense_reporting_difference`, `corporate_filing_impact_check=deductible_expense_linkage` | 실제 지출과 신고된 비용 범위의 비교가 필요합니다. | 28 |
| ③ | `corporate_filing_comparison_issue=transaction_reporting_difference`, `corporate_filing_impact_check=transaction_completeness` | 실제 거래가 신고 자료에 빠짐없이 연결됐는지 봅니다. | 29 |
| ④ | `corporate_filing_comparison_issue=aggregate_or_period_difference`, `corporate_filing_impact_check=overall_filing_consistency` | 자료의 합계·기간이 달라 전체 비교가 필요합니다. | 27 |

**01 판정 + 본문** — Q4-C

| 선택 | 저장 필드 | 판정(1줄) | 본문(2문장) |
|---|---|---|---|
| ① | `corporate_issue_trigger=authority_request`, `corporate_current_blockage=submission_or_review` | 세무기관의 안내·요청 내용을 먼저 확인해야 하는 상태입니다. | 세무기관의 안내나 요청을 받아 확인을 시작하셨습니다. 요청의 출처와 제출해야 할 내용을 먼저 살펴보겠습니다. |
| ② | `corporate_issue_trigger=filing_or_payment_due`, `corporate_current_blockage=procedure_preparation` | 신고·납부 시점에 준비할 사항을 확인해야 하는 상태입니다. | 법인세 신고·납부 시기가 되어 확인을 시작하셨습니다. 필요한 절차와 준비할 자료를 먼저 정리하겠습니다. |
| ③ | `corporate_issue_trigger=filed_or_paid_result_difference`, `corporate_current_blockage=result_reconciliation` | 이미 처리한 신고·납부 결과를 확인해야 하는 상태입니다. | 신고·납부 후 결과나 금액이 예상과 달라 확인을 시작하셨습니다. 어디에서 차이가 생겼는지 살펴보겠습니다. |
| ④ | `corporate_issue_trigger=internal_explanation_data_difference`, `corporate_current_blockage=reference_selection` | 들은 설명과 실제 자료의 차이를 확인해야 하는 상태입니다. | 담당자의 설명과 실제 자료가 달라 확인을 시작하셨습니다. 어느 내용을 기준으로 할지 먼저 살펴보겠습니다. |
| ⑤ | `corporate_issue_trigger=self_check`, `corporate_current_blockage=no_specific_blocker` | 특별한 문제 없이 미리 점검하시는 상태입니다. | 받은 안내나 막힌 일은 없지만 법인세 처리를 미리 점검하고 싶으셨습니다. 지금 가진 자료로 확인할 항목을 정리해 보겠습니다. |

**03 주요 위험 요소 규칙** — 아래 순서(우선순위)대로 조건에 맞는 것을 최대 4개까지 표시. 하나도 없으면 기본 문장 1개.

| 순서 | 조건(하나라도 일치) | 표시 문장 |
|---|---|---|
| 1 (C-R1) | `corporate_issue_trigger` ∈ {authority_request}. 단, `corporate_notice_authenticity` = verified 이면 제외 | 세무기관의 요청이 공식적인 것인지, 어떤 자료를 요구하는지 확인이 필요합니다. |
| 2 (C-R2) | `corporate_issue_trigger` ∈ {filing_or_payment_due} 또는 `corporate_deadline_timing` ∈ {passed_or_imminent, possibly_passed_or_near} | 신고·납부 기한이 언제인지 정확히 확인해야 합니다. |
| 3 (C-R3) | `corporate_issue_trigger` ∈ {internal_explanation_data_difference} | 담당자의 설명과 자료가 다를 때는 기준이 되는 자료를 먼저 정해야 합니다. |
| 4 (C-R4) | `corporate_issue_trigger` ∈ {filed_or_paid_result_difference} 또는 `corporate_tax_stage` ∈ {tax_amount_result_issue} | 신고·납부 결과가 예상과 다른 이유를 확인하기 전에는 어느 쪽이 맞는지 알 수 없습니다. |
| 5 (C-R5) | `corporate_record_readiness` ∈ {insufficient_records, partially_distributed} | 자료가 부족하거나 흩어져 있으면 신고의 근거를 설명하기 어렵습니다. |
| 6 (C-R6) | `corporate_record_readiness` ∈ {period_or_basis_mismatch} 또는 `corporate_filing_comparison_issue` ∈ {aggregate_or_period_difference} | 자료의 기간·기준이 달라 같은 기준으로 맞추는 작업이 필요합니다. |
| 7 (C-R7) | `corporate_filing_comparison_issue` ∈ {revenue_reporting_difference, expense_reporting_difference, transaction_reporting_difference} | 실제 수입·지출·거래와 신고 내용이 빠짐없이 이어지는지 확인해야 합니다. |
| 8 (C-R8) | `corporate_tax_stage` ∈ {filed} | 이미 낸 신고에 수정이 필요한지는 확인한 뒤에야 알 수 있습니다. |
| 9 (C-R9) | `corporate_tax_stage` ∈ {filing_preparation} | 신고 전에 자료의 기준을 확인하지 않으면 계산 과정에서 오류가 생길 수 있습니다. |
| 기본 | 위 조건에 하나도 해당하지 않음 | 지금 답변만으로는 눈에 띄는 위험 신호가 많지 않지만, 어떤 자료를 기준으로 할지는 확인이 필요합니다. |

## E-2. 2차 결과 (경로별)

2차 결과는 질문 하나당 소제목 1개와 선택지별 문장 1개로 구성한다. 선택지의 저장 필드 쌍이 키이며, 두 필드가 모두 문장에 반영된다. 직접 입력을 고른 질문은 `직접 적어 주신 내용은 전문가가 함께 확인하여 반영합니다.`를 표시한다.

### E-2-P. 개인소득세

**안내 출처** — Q5-P

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `notice_source=tax_authority_direct`, `notice_authenticity=verified` | 세무기관에서 직접 받은 안내이고 발신 경로도 확인하셨습니다. |
| ② | `notice_source=claimed_tax_authority`, `notice_authenticity=unverified` | 세무기관에서 온 것으로 알고 계시지만 실제 발신자와 공식 경로는 아직 확인되지 않았습니다. |
| ③ | `notice_source=employer_or_counterparty`, `notice_authenticity=original_source_unverified` | 회사·고용주·계약 상대방을 거쳐 받은 안내로, 원래 세무기관의 안내인지는 확인되지 않았습니다. |
| ④ | `notice_source=third_party_or_online`, `notice_authenticity=source_unverified` | 다른 사람이나 온라인을 통해 받은 내용이라 출처와 공식 여부를 모두 확인해야 합니다. |
| ⑤ | `notice_source=none_self_initiated`, `notice_authenticity=not_applicable` | 받으신 안내는 없고 직접 먼저 확인하시는 경우라, 출처를 따질 안내는 없습니다. |

**안내와 실제의 차이** — Q6-P

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `guidance_actual_difference=tax_handling_untraceable`, `unexplained_point=payment_tax_linkage` | 안내에는 세금이 처리됐다고 되어 있지만, 실제로 받은 돈에서 어떻게 처리됐는지는 확인되지 않습니다. |
| ② | `guidance_actual_difference=amount_or_calculation_mismatch`, `unexplained_point=calculation_basis` | 안내된 금액이나 계산 방식이 실제 계약·지급 자료와 맞지 않아 보입니다. |
| ③ | `guidance_actual_difference=filing_or_settlement_unconfirmed`, `unexplained_point=result_traceability` | 안내에는 신고나 정산이 끝났다고 되어 있지만, 실제 자료에서 그 결과를 찾기 어렵습니다. |
| ④ | `guidance_actual_difference=overall_situation_mismatch`, `unexplained_point=comparison_basis_unclear` | 안내와 실제 상황이 크게 달라 보이지만, 어떤 자료를 기준으로 비교할지부터 정해야 합니다. |
| ⑤ | `guidance_actual_difference=self_check_no_guidance`, `unexplained_point=own_understanding_basis` | 비교할 안내는 없어서, 알고 계신 세금 처리 방식이 실제와 맞는지 확인하는 것이 중심입니다. |

**금액과 계산 기준** — Q7-P

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `tax_amount_type=salary_tax_amount`, `tax_amount_basis=salary_or_payment_amount` | 급여에서 빠진 세금 금액을 확인 중이며, 급여나 지급액이 계산 기준이라고 들으셨습니다. |
| ② | `tax_amount_type=contract_income_tax_amount`, `tax_amount_basis=contract_or_received_amount` | 계약·프로젝트 수입에서 처리된 세금 금액을 확인 중이며, 받은 금액이나 계약 금액이 기준이라고 들으셨습니다. |
| ③ | `tax_amount_type=rental_or_foreign_income_tax_amount`, `tax_amount_basis=related_income_amount` | 임대·해외소득과 관련된 세금 금액을 확인 중이며, 해당 소득 금액이 기준이라고 들으셨습니다. |
| ④ | `tax_amount_type=mixed_income_tax_amount`, `tax_amount_basis=multiple_income_bases` | 여러 소득의 세금 금액이 함께 표시되어 있어, 각각의 계산 기준을 나누어 확인해야 합니다. |
| ⑤ | `tax_amount_type=not_yet_identified`, `tax_amount_basis=to_be_identified` | 아직 확인할 구체적인 금액을 모르는 상태로, 어떤 금액을 봐야 하는지부터 정리가 필요합니다. |

**기한** — Q8-P

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `deadline_timing=passed_or_imminent`, `deadline_source=official_notice` | 공식 안내에서 확인한 기한이 이미 지났거나 곧 다가와, 가장 먼저 확인해야 합니다. |
| ② | `deadline_timing=upcoming_with_margin`, `deadline_source=official_notice` | 공식 안내로 기한을 확인했고 아직 시간 여유가 있습니다. |
| ③ | `deadline_timing=possibly_passed_or_near`, `deadline_source=employer_or_tax_agent` | 회사·고용주·세무 담당자에게 들은 날짜가 지났거나 가까울 수 있어, 공식 안내와 대조가 필요합니다. |
| ④ | `deadline_timing=unconfirmed_date`, `deadline_source=online_hearsay_or_memory` | 온라인이나 다른 사람에게 들은 날짜라 정확한 기한이 확정되지 않았습니다. |
| ⑤ | `deadline_timing=unknown`, `deadline_source=none` | 기한 안내를 받은 적이 없어, 기한이 있는지부터 확인해야 합니다. |

**조치 이후** — Q9-P

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `post_action_response=procedure_guidance_received`, `post_action_unresolved=submission_scope_unclear` | 문의 후 처리 방법은 안내받았지만, 어떤 자료를 내야 하는지는 아직 분명하지 않습니다. |
| ② | `post_action_response=action_completed_no_result_confirmation`, `post_action_unresolved=result_reflection_unknown` | 자료 제출이나 세금 처리를 했지만, 결과가 어떻게 반영됐는지는 답변을 받지 못했습니다. |
| ③ | `post_action_response=verbal_or_written_explanation_received`, `post_action_unresolved=explanation_data_conflict` | 담당자의 설명과 실제 자료가 맞지 않아, 어느 내용을 기준으로 할지 정해지지 않았습니다. |
| ④ | `post_action_response=no_action_yet`, `post_action_unresolved=pre_action_guidance_needed` | 아직 문의나 조치를 하지 않았고, 무엇을 확인해 어떤 자료를 준비할지부터 정리가 필요합니다. |

**막힌 이유와 가진 자료** — Q10-P

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `blocking_reason=document_understanding`, `available_evidence=tax_document` | 서류의 내용을 이해하지 못해 막혀 있고, 해당 서류는 가지고 계십니다. |
| ② | `blocking_reason=amount_or_calculation_unclear`, `available_evidence=income_payment_records` | 금액이나 계산 근거를 이해하지 못해 막혀 있고, 급여·계약·입금 자료는 가지고 계십니다. |
| ③ | `blocking_reason=procedure_unknown`, `available_evidence=instruction_or_system_screen` | 신고·납부·제출 방법을 몰라 막혀 있고, 관련 안내나 화면은 가지고 계십니다. |
| ④ | `blocking_reason=insufficient_evidence`, `available_evidence=partial_records` | 필요한 자료가 부족해 막혀 있어, 지금 가진 자료부터 확인하는 것이 먼저입니다. |
| ⑤ | `blocking_reason=no_blockage_self_check`, `available_evidence=records_at_hand` | 막힌 부분은 없고 점검 단계이며, 가지고 계신 자료를 정리해 확인하는 것이 중심입니다. |

**알고 싶은 것과 도움 범위** — Q11-P

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `final_goal=guidance_validity_and_compliance_action`, `support_scope=action_instructions` | 받은 안내가 맞는지 확인하고, 맞다면 신고·납부 방법까지 알기를 원하십니다. |
| ② | `final_goal=tax_amount_and_basis_verification`, `support_scope=correction_or_followup` | 세금 금액과 계산 근거가 맞는지 확인하고, 필요한 정정이나 후속 조치까지 알기를 원하십니다. |
| ③ | `final_goal=filing_settlement_completion_verification`, `support_scope=resolution_procedure` | 신고·정산이 제대로 처리됐는지 확인하고, 문제가 있으면 해결에 필요한 자료와 절차까지 알기를 원하십니다. |
| ④ | `final_goal=expert_case_review`, `support_scope=expert_led_followthrough` | 자료만으로 판단하기 어려운 부분은 전문가의 검토를 받고, 이후 조치도 함께 진행하기를 원하십니다. |
| ⑤ | `final_goal=general_status_check`, `support_scope=checklist_and_guidance` | 특별한 문제가 있는지 전체 상태를 점검하고, 확인할 항목과 안내를 받기를 원하십니다. |

### E-2-V. VAT·전자 인보이스

**안내 출처** — Q5-V

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `vat_notice_source=tax_authority_or_official_system`, `vat_notice_authenticity=verified` | 세무기관이나 공식 전자 시스템에서 직접 확인했고 출처도 확인하셨습니다. |
| ② | `vat_notice_source=claimed_tax_authority`, `vat_notice_authenticity=unverified` | 세무기관에서 온 것으로 알고 계시지만 공식 발신 경로는 아직 확인되지 않았습니다. |
| ③ | `vat_notice_source=counterparty_or_internal_staff`, `vat_notice_authenticity=original_source_unverified` | 거래 상대방이나 회사 담당자를 거쳐 받은 안내로, 원래 세무기관의 안내인지는 확인되지 않았습니다. |
| ④ | `vat_notice_source=third_party_or_online`, `vat_notice_authenticity=source_unverified` | 다른 사람이나 온라인을 통해 받은 내용이라 출처와 공식 여부를 모두 확인해야 합니다. |
| ⑤ | `vat_notice_source=none_self_initiated`, `vat_notice_authenticity=not_applicable` | 받으신 VAT·인보이스 안내는 없고 직접 먼저 확인하시는 경우라, 출처를 따질 안내는 없습니다. |

**안내와 실제의 차이** — Q6-V

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `vat_guidance_actual_difference=transaction_amount_difference`, `vat_unexplained_point=vat_calculation_effect` | 안내된 거래 금액과 실제 거래 금액이 달라 보이며, 그 차이가 VAT 계산에 어떻게 반영되는지 확인이 필요합니다. |
| ② | `vat_guidance_actual_difference=invoice_content_difference`, `vat_unexplained_point=reference_document` | 안내된 인보이스 내용과 실제 전자 인보이스가 달라 보이며, 어느 쪽을 기준으로 할지 확인이 필요합니다. |
| ③ | `vat_guidance_actual_difference=processing_reflection_unconfirmed`, `vat_unexplained_point=system_reflection` | 안내에는 정상 처리됐다고 되어 있지만 실제 시스템이나 인보이스에서 그 결과를 찾기 어렵습니다. |
| ④ | `vat_guidance_actual_difference=overall_transaction_invoice_difference`, `vat_unexplained_point=comparison_basis` | 안내와 실제 거래·인보이스가 모두 달라 보여, 어떤 자료를 기준으로 비교할지부터 정해야 합니다. |
| ⑤ | `vat_guidance_actual_difference=self_check_no_guidance`, `vat_unexplained_point=own_understanding_basis` | 비교할 안내는 없어서, 알고 계신 VAT·인보이스 처리 방식이 실제와 맞는지 확인하는 것이 중심입니다. |

**금액과 계산 기준** — Q7-V

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `vat_amount_type=transaction_based_vat`, `vat_amount_basis=transaction_amount` | 판매 또는 구매 금액에 VAT를 적용한 금액을 확인 중이며, 거래 금액이 계산 기준이라고 들으셨습니다. |
| ② | `vat_amount_type=invoice_displayed_vat`, `vat_amount_basis=invoice_tax_base` | 전자 인보이스에 표시된 VAT 금액을 확인 중이며, 인보이스의 공급가액이 기준이라고 들으셨습니다. |
| ③ | `vat_amount_type=rate_based_vat`, `vat_amount_basis=applied_vat_rate` | 적용된 VAT 세율과 계산 방식을 확인 중이며, 특정 세율이 기준이라고 안내받으셨습니다. |
| ④ | `vat_amount_type=multiple_transaction_vat`, `vat_amount_basis=multiple_transaction_bases` | 여러 거래의 VAT 금액이 함께 표시되어 있어, 거래별 금액과 기준을 나누어 확인해야 합니다. |
| ⑤ | `vat_amount_type=not_yet_identified`, `vat_amount_basis=to_be_identified` | 아직 확인할 구체적인 VAT 금액을 모르는 상태로, 어떤 금액을 봐야 하는지부터 정리가 필요합니다. |

**기한** — Q8-V

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `vat_deadline_timing=passed_or_imminent`, `vat_deadline_source=official_notice` | 공식 안내나 전자 시스템에서 확인한 기한이 이미 지났거나 곧 다가와, 가장 먼저 확인해야 합니다. |
| ② | `vat_deadline_timing=upcoming_with_margin`, `vat_deadline_source=official_notice` | 공식 안내로 기한을 확인했고 아직 시간 여유가 있습니다. |
| ③ | `vat_deadline_timing=possibly_passed_or_near`, `vat_deadline_source=counterparty_or_staff` | 거래 상대방이나 회사 담당자에게 들은 날짜가 지났거나 가까울 수 있어, 공식 안내와 대조가 필요합니다. |
| ④ | `vat_deadline_timing=unconfirmed_date`, `vat_deadline_source=online_hearsay_or_memory` | 온라인이나 다른 사람에게 들은 날짜라 정확한 기한이 확정되지 않았습니다. |
| ⑤ | `vat_deadline_timing=unknown`, `vat_deadline_source=none` | 기한 안내를 받은 적이 없어, 인보이스 수정·발행이나 VAT 신고 기한이 있는지부터 확인해야 합니다. |

**조치 이후** — Q9-V

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `vat_post_action_response=procedure_guidance`, `vat_post_action_unresolved=target_document_unclear` | 수정이나 신고 방법은 안내받았지만, 어떤 인보이스나 자료를 처리해야 하는지는 아직 분명하지 않습니다. |
| ② | `vat_post_action_response=action_completed_reflection_uncertain`, `vat_post_action_unresolved=system_reflection` | 인보이스 수정이나 신고를 했지만, 시스템에 결과가 제대로 반영됐는지 확인되지 않습니다. |
| ③ | `vat_post_action_response=explanation_received`, `vat_post_action_unresolved=explanation_invoice_conflict` | 담당자의 설명과 실제 인보이스 내용이 달라, 어느 쪽을 기준으로 할지 정해지지 않았습니다. |
| ④ | `vat_post_action_response=no_action_yet`, `vat_post_action_unresolved=pre_action_check_needed` | 아직 조치를 하지 않았고, 어떤 자료와 인보이스를 확인할지부터 정리가 필요합니다. |

**막힌 이유와 가진 자료** — Q10-V

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `vat_blocking_reason=invoice_understanding`, `vat_available_evidence=invoice` | 전자 인보이스의 내용을 이해하지 못해 막혀 있고, 해당 인보이스는 가지고 계십니다. |
| ② | `vat_blocking_reason=amount_or_vat_reconciliation`, `vat_available_evidence=transaction_and_payment_records` | 거래 금액과 VAT 금액이 맞는지 확인하기 어려워 막혀 있고, 거래·입금 자료는 가지고 계십니다. |
| ③ | `vat_blocking_reason=invoice_or_filing_procedure_unknown`, `vat_available_evidence=instruction_or_system_screen` | 인보이스 발행·수정·신고 방법을 몰라 막혀 있고, 관련 안내나 시스템 화면은 가지고 계십니다. |
| ④ | `vat_blocking_reason=insufficient_records`, `vat_available_evidence=partial_invoice_or_transaction_records` | 필요한 인보이스나 거래 자료가 부족해 막혀 있어, 지금 가진 자료부터 확인하는 것이 먼저입니다. |
| ⑤ | `vat_blocking_reason=no_blockage_self_check`, `vat_available_evidence=records_at_hand` | 막힌 부분은 없고 점검 단계이며, 가지고 계신 인보이스·거래 자료를 정리해 확인하는 것이 중심입니다. |

**알고 싶은 것과 도움 범위** — Q11-V

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `vat_final_goal=invoice_validity_verification`, `vat_support_scope=issuance_or_correction_action` | 전자 인보이스의 내용이 맞는지 확인하고, 필요한 수정·발행 방법까지 알기를 원하십니다. |
| ② | `vat_final_goal=vat_amount_basis_verification`, `vat_support_scope=tax_correction_action` | VAT 금액과 계산 기준이 맞는지 확인하고, 잘못된 부분이 있으면 정정 방법까지 알기를 원하십니다. |
| ③ | `vat_final_goal=processing_completion_verification`, `vat_support_scope=resolution_procedure` | 신고·납부나 인보이스 처리가 실제로 끝났는지 확인하고, 문제가 있으면 해결 절차까지 알기를 원하십니다. |
| ④ | `vat_final_goal=expert_invoice_transaction_review`, `vat_support_scope=expert_led_followthrough` | 인보이스와 거래 자료를 전문가가 함께 검토하고, 필요한 후속 처리까지 도움받기를 원하십니다. |
| ⑤ | `vat_final_goal=general_status_check`, `vat_support_scope=checklist_and_guidance` | 특별한 문제가 있는지 VAT·인보이스 전체 상태를 점검하고, 확인할 항목과 안내를 받기를 원하십니다. |

### E-2-C. 법인세

**안내 출처** — Q5-C

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `corporate_notice_source=tax_authority_or_official_system`, `corporate_notice_authenticity=verified` | 세무기관이나 공식 시스템에서 직접 확인했고 출처도 확인하셨습니다. |
| ② | `corporate_notice_source=claimed_tax_authority`, `corporate_notice_authenticity=unverified` | 세무기관에서 온 것으로 알고 계시지만 공식 발신 경로는 아직 확인되지 않았습니다. |
| ③ | `corporate_notice_source=company_or_tax_agent`, `corporate_notice_authenticity=original_source_unverified` | 회사 담당자나 세무 담당자를 거쳐 받은 안내로, 원래 세무기관의 안내인지는 확인되지 않았습니다. |
| ④ | `corporate_notice_source=third_party_or_online`, `corporate_notice_authenticity=source_unverified` | 다른 사람이나 온라인을 통해 받은 내용이라 출처와 공식 여부를 모두 확인해야 합니다. |
| ⑤ | `corporate_notice_source=none_self_initiated`, `corporate_notice_authenticity=not_applicable` | 받으신 법인세 안내는 없고 회사 일로 먼저 확인하시는 경우라, 출처를 따질 안내는 없습니다. |

**안내와 실제의 차이** — Q6-C

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `corporate_guidance_actual_difference=tax_result_difference`, `corporate_unexplained_point=filing_result_effect` | 안내된 세금 계산 결과와 회사 자료의 금액이 달라 보이며, 그 차이가 신고 결과에 어떻게 이어지는지 확인이 필요합니다. |
| ② | `corporate_guidance_actual_difference=filing_content_difference`, `corporate_unexplained_point=reference_document` | 안내된 신고 내용과 실제 회사 자료가 달라 보이며, 어느 자료를 기준으로 할지 확인이 필요합니다. |
| ③ | `corporate_guidance_actual_difference=completion_unconfirmed`, `corporate_unexplained_point=result_traceability` | 신고가 끝났다고 안내받았지만 회사 자료나 시스템에서 그 결과를 찾기 어렵습니다. |
| ④ | `corporate_guidance_actual_difference=overall_company_data_difference`, `corporate_unexplained_point=comparison_basis` | 안내와 회사 상황이 모두 달라 보여, 어떤 자료를 기준으로 비교할지부터 정해야 합니다. |
| ⑤ | `corporate_guidance_actual_difference=self_check_no_guidance`, `corporate_unexplained_point=own_understanding_basis` | 비교할 안내는 없어서, 회사의 법인세 처리 방식에 대한 이해가 실제와 맞는지 확인하는 것이 중심입니다. |

**금액과 계산 기준** — Q7-C

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `corporate_tax_amount_type=assessed_corporate_tax`, `corporate_tax_amount_basis=taxable_income` | 신고된 법인세 금액을 확인 중이며, 회사의 과세 대상 소득이 계산 기준이라고 들으셨습니다. |
| ② | `corporate_tax_amount_type=calculation_amount`, `corporate_tax_amount_basis=income_and_expense_treatment` | 세금 계산에 반영된 금액을 확인 중이며, 비용 처리와 소득 계산이 기준이라고 들으셨습니다. |
| ③ | `corporate_tax_amount_type=filed_or_paid_tax_amount`, `corporate_tax_amount_basis=filed_tax_return` | 이미 신고·납부한 금액을 확인 중이며, 제출된 법인세 신고자료가 기준이라고 들으셨습니다. |
| ④ | `corporate_tax_amount_type=multiple_tax_amounts`, `corporate_tax_amount_basis=multiple_company_records` | 여러 금액이 함께 표시되어 있어, 각 금액이 어떤 회사 자료를 기준으로 했는지 나누어 확인해야 합니다. |
| ⑤ | `corporate_tax_amount_type=not_yet_identified`, `corporate_tax_amount_basis=to_be_identified` | 아직 확인할 구체적인 법인세 금액을 모르는 상태로, 어떤 금액을 봐야 하는지부터 정리가 필요합니다. |

**기한** — Q8-C

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `corporate_deadline_timing=passed_or_imminent`, `corporate_deadline_source=official_notice` | 공식 안내나 서류에서 확인한 기한이 이미 지났거나 곧 다가와, 가장 먼저 확인해야 합니다. |
| ② | `corporate_deadline_timing=upcoming_with_margin`, `corporate_deadline_source=official_notice` | 공식 안내로 기한을 확인했고 아직 시간 여유가 있습니다. |
| ③ | `corporate_deadline_timing=possibly_passed_or_near`, `corporate_deadline_source=company_or_tax_agent` | 회사 담당자나 세무 담당자에게 들은 날짜가 지났거나 가까울 수 있어, 공식 안내와 대조가 필요합니다. |
| ④ | `corporate_deadline_timing=unconfirmed_date`, `corporate_deadline_source=online_hearsay_or_memory` | 온라인이나 다른 사람에게 들은 날짜라 정확한 기한이 확정되지 않았습니다. |
| ⑤ | `corporate_deadline_timing=unknown`, `corporate_deadline_source=none` | 기한 안내를 받은 적이 없어, 신고·납부·제출 기한이 있는지부터 확인해야 합니다. |

**조치 이후** — Q9-C

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `corporate_post_action_response=submission_guidance`, `corporate_post_action_unresolved=additional_document_scope` | 제출이나 신고 방법은 안내받았지만, 어떤 자료를 더 내야 하는지는 아직 분명하지 않습니다. |
| ② | `corporate_post_action_response=action_completed_reflection_uncertain`, `corporate_post_action_unresolved=system_reflection` | 신고·납부나 자료 제출을 했지만, 세무기관 시스템에 어떻게 반영됐는지 확인되지 않습니다. |
| ③ | `corporate_post_action_response=explanation_received`, `corporate_post_action_unresolved=explanation_company_data_conflict` | 담당자의 설명과 회사 자료가 달라, 어느 내용을 기준으로 할지 정해지지 않았습니다. |
| ④ | `corporate_post_action_response=no_action_yet`, `corporate_post_action_unresolved=pre_action_review_needed` | 아직 조치를 하지 않았고, 어떤 자료와 내용을 확인할지부터 정리가 필요합니다. |

**막힌 이유와 가진 자료** — Q10-C

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `corporate_blocking_reason=document_understanding`, `corporate_available_evidence=tax_authority_document` | 세무기관 서류나 안내를 이해하지 못해 막혀 있고, 해당 자료는 가지고 계십니다. |
| ② | `corporate_blocking_reason=tax_calculation_unclear`, `corporate_available_evidence=accounting_and_tax_records` | 세금 계산이나 금액의 근거를 이해하지 못해 막혀 있고, 회사의 회계·세금 자료는 가지고 계십니다. |
| ③ | `corporate_blocking_reason=filing_or_submission_procedure_unknown`, `corporate_available_evidence=instruction_or_system_screen` | 신고·납부나 제출 방법을 몰라 막혀 있고, 관련 안내나 시스템 화면은 가지고 계십니다. |
| ④ | `corporate_blocking_reason=insufficient_company_records`, `corporate_available_evidence=partial_company_records` | 필요한 회사 자료가 부족해 막혀 있어, 지금 가진 자료부터 확인하는 것이 먼저입니다. |
| ⑤ | `corporate_blocking_reason=no_blockage_self_check`, `corporate_available_evidence=records_at_hand` | 막힌 부분은 없고 점검 단계이며, 회사가 가진 자료를 정리해 확인하는 것이 중심입니다. |

**알고 싶은 것과 도움 범위** — Q11-C

| 선택 | 저장 필드 | 결과 문장 |
|---|---|---|
| ① | `corporate_final_goal=corporate_filing_validity_verification`, `corporate_support_scope=filing_correction_action` | 법인세 신고 내용이 맞는지 확인하고, 잘못된 부분이 있으면 수정 방법까지 알기를 원하십니다. |
| ② | `corporate_final_goal=corporate_tax_amount_basis_verification`, `corporate_support_scope=tax_correction_followup` | 법인세 금액과 계산 근거가 맞는지 확인하고, 필요한 정정이나 후속 조치까지 알기를 원하십니다. |
| ③ | `corporate_final_goal=filing_payment_completion_verification`, `corporate_support_scope=resolution_procedure` | 신고·납부가 정상 처리됐는지 확인하고, 문제가 있으면 해결 절차까지 알기를 원하십니다. |
| ④ | `corporate_final_goal=expert_corporate_tax_review`, `corporate_support_scope=expert_led_followthrough` | 회사 자료와 세금 신고를 전문가가 함께 검토하고, 필요한 후속 처리까지 도움받기를 원하십니다. |
| ⑤ | `corporate_final_goal=general_status_check`, `corporate_support_scope=checklist_and_guidance` | 특별한 문제가 있는지 법인세 전체 상태를 점검하고, 확인할 항목과 안내를 받기를 원하십니다. |

## E-3. 결과에서의 연결 안내 (권유 문구, 강제 아님)

| 연결 | 표시 조건 | 고객 화면 문구 |
|---|---|---|
| 사기 VERIFY | 안내 출처 질문(Q5)이 “세무기관이라고 안내받음(claimed_tax_authority)” 또는 “다른 사람·온라인(third_party_or_online)”인 경우 | 받으신 안내의 출처가 확인되지 않았습니다. 사기가 걱정되시면 “사기 VERIFY”에서 먼저 확인해 보실 수 있습니다. |
| 행정문서 VERIFY | 막힌 이유(Q10)가 “서류 내용 이해(document_understanding)”이거나 V 경로에서 “인보이스 내용 이해(invoice_understanding)”인 경우, 또는 1차 계기가 “베트남어 이해 어려움(language_barrier)”인 경우 | 서류의 내용이나 진위를 자세히 확인하시려면 “행정문서 VERIFY”를 이용하실 수 있습니다. |
| 전문가 진행 | 기한 질문(Q8)이 “기한이 지났거나 임박(passed_or_imminent)” 또는 “지났거나 가까울 수 있음(possibly_passed_or_near)”, 또는 Q11 도움 범위가 “전문가 검토 및 후속 진행(expert_led_followthrough)”, 또는 세무기관 요청·검토를 받은 경우 | 기한이 가깝거나 직접 판단하기 어려운 부분은 전문가 진행으로 이어서 도와드립니다. |

- 조건이 여러 개 맞으면 모두 표시한다. 연결 안내는 결과 하단에만 표시하며 질문을 중단시키지 않는다.
- 필드 이름은 V·C 경로에서는 각각 `vat_`, `corporate_` 접두어가 붙은 같은 의미의 필드를 사용한다.

## E-4. 빈 값·직접 입력 처리

- 해당 질문에 직접 입력을 고른 경우: 해당 칸에는 직접 입력 안내 문장을 표시하고, 입력한 원문은 내부 저장(`..._detail`)에만 쌓아 이후 질문 개선에 쓴다.
- 값이 비어 있으면 해당 칸·문장 전체를 생략한다(빈 조사나 빈 괄호를 남기지 않는다).

---

# F. 자동 점검 결과 (실행 결과)

| 점검 항목 | 개인소득세 | VAT·전자 인보이스 | 법인세 |
|---|---:|---:|---:|
| 1차 질문 수 | 4 | 4 | 4 |
| 2차 질문 수 | 7 | 7 | 7 |
| 2차 비율 | 63.6% | 63.6% | 63.6% |
| 2차 ÷ 1차 | 1.75배 | 1.75배 | 1.75배 |
| 질문 수(전체) | 11 | 11 | 11 |
| 선택지 총수(직접 입력 포함) | 62 | 64 | 62 |
| 선택지별 저장 필드 수(최소) | 2 | 2 | 2 |

| 자동 점검 | 결과 |
|---|---|
| 선택지마다 결과 문장 존재 | 통과(결과 문장 수 = 선택지 수, 전 질문) |
| 모든 선택지가 서로 다른 필드 쌍 | 통과 |
| 고객 화면 문장에 영문·코드 노출(VAT 제외) | 0건 |
| 세액·납세의무 단정 표현(체납·과태료·추징·내야 합니다 등) | 0건 |
| 괄호 짝·이중 공백 | 0건 |
| 카드 문장 50자 초과 | 0건(최대 32자) |
| 위험 규칙의 필드·값이 실제 저장 값과 일치 | 통과 |
| 1차 결과 문장 중복(01/02/03) | 0건 |
| 값→고객 라벨 누락 | 0건(사용 값 239개) |
| 같은 필드 안 라벨 중복 | 0건 |
| 총 오류 / 경고 | 0 / 0 |

---

# G. 값 → 고객 표시 문구

내부 값은 화면·마이페이지·알림 어디에도 그대로 노출하지 않고 아래 문구로만 표시한다.

| 내부 값 | 고객 화면 표시 |
|---|---|
| `accounting_and_tax_records` | 회계·세금 자료 |
| `action_completed_no_result_confirmation` | 조치는 했으나 결과 미확인 |
| `action_completed_reflection_uncertain` | 조치는 했으나 반영 여부 불확실 |
| `action_instructions` | 신고·납부 등 다음 조치 안내 |
| `additional_document_scope` | 추가로 낼 자료 범위 |
| `aggregate_or_period_difference` | 합계·기간의 차이 |
| `amount_and_vat_match` | 금액·VAT·세율 일치 여부 |
| `amount_or_calculation_mismatch` | 금액·계산 방식 불일치 |
| `amount_or_calculation_unclear` | 금액·계산 근거 불명확 |
| `amount_or_vat_reconciliation` | 금액과 VAT 대조 |
| `applied_vat_rate` | 적용된 VAT 세율 |
| `assessed_corporate_tax` | 신고된 법인세 금액 |
| `authority_issue_review` | 세무기관 지적 사항 검토 |
| `authority_or_counterparty_notice` | 세무기관·거래 상대방의 안내 |
| `authority_request` | 세무기관의 요청 |
| `authority_review_or_request` | 세무기관 검토·자료 요청 |
| `calculation_amount` | 세금 계산에 반영된 금액 |
| `calculation_and_filing` | 계산과 신고 내용 |
| `calculation_basis` | 계산 근거 |
| `calculation_basis_and_process` | 계산 근거와 처리 과정 |
| `calculation_linkage` | 계산 과정 확인 |
| `checklist_and_guidance` | 확인 항목과 안내 |
| `claimed_tax_authority` | 세무기관이라고 안내받음 |
| `combined_tax_treatment` | 여러 소득의 통합 처리 |
| `company_or_tax_agent` | 회사 또는 세무 담당자 |
| `comparison_basis` | 비교 기준 |
| `comparison_basis_unclear` | 비교 기준이 불분명 |
| `completion_unconfirmed` | 완료 여부 미확인 |
| `content_verification` | 내용 확인 |
| `contract_income_tax_amount` | 계약 수입에서 처리된 세금 금액 |
| `contract_or_received_amount` | 계약 금액 또는 받은 금액 |
| `corporate_filing_validity_verification` | 법인세 신고 내용 확인 |
| `corporate_tax` | 법인세 |
| `corporate_tax_amount_basis_verification` | 법인세 금액·계산 근거 확인 |
| `correction_or_followup` | 정정·후속 조치 |
| `counterparty_issued` | 거래 상대방이 발행 |
| `counterparty_or_internal_staff` | 거래 상대방 또는 회사 담당자 |
| `counterparty_or_staff` | 거래 상대방 또는 회사 담당자 |
| `cross_border_transaction` | 해외 거래 |
| `cross_border_vat_invoice_treatment` | 해외 거래의 VAT·인보이스 처리 |
| `cross_document_consistency` | 자료 간 일치 여부 |
| `date_and_party_match` | 날짜·상대방 정보 일치 여부 |
| `deductible_expense_linkage` | 비용 처리 범위 연결 |
| `direct_input` | 직접 입력 |
| `direct_input_detail` | 직접 입력 내용 |
| `document_understanding` | 서류 내용 이해 |
| `domestic_purchase` | 베트남에서 구입한 거래 |
| `domestic_sale` | 베트남에서 판매한 거래 |
| `employer_or_counterparty` | 회사·고용주·계약 상대방 |
| `employer_or_tax_agent` | 회사·고용주·세무 담당자 |
| `expense_reporting_difference` | 지출과 신고 비용의 차이 |
| `expert_case_review` | 전문가의 사안 검토 |
| `expert_corporate_tax_review` | 전문가의 법인세 검토 |
| `expert_invoice_transaction_review` | 전문가의 인보이스·거래 검토 |
| `expert_led_followthrough` | 전문가 검토 및 후속 진행 |
| `explanation_company_data_conflict` | 설명과 회사 자료가 다름 |
| `explanation_data_conflict` | 설명과 자료가 다름 |
| `explanation_invoice_conflict` | 설명과 인보이스가 다름 |
| `explanation_received` | 설명을 들음 |
| `filed` | 신고 완료 |
| `filed_content_and_calculation` | 신고 내용과 계산 |
| `filed_or_paid_result_difference` | 신고·납부 결과의 차이 |
| `filed_or_paid_tax_amount` | 신고·납부한 금액 |
| `filed_tax_return` | 제출한 법인세 신고자료 |
| `filing_content_difference` | 신고 내용의 차이 |
| `filing_correction_action` | 신고 수정 방법 |
| `filing_or_invoice_action_due` | 신고·인보이스 처리 시점 |
| `filing_or_payment_due` | 신고·납부 시점 |
| `filing_or_settlement_due` | 신고·정산 시점 |
| `filing_or_settlement_unconfirmed` | 신고·정산 결과 미확인 |
| `filing_or_submission_procedure_unknown` | 신고·제출 방법을 모름 |
| `filing_payment_completion_verification` | 신고·납부 완료 여부 확인 |
| `filing_preparation` | 법인세 신고 준비 |
| `filing_result_effect` | 신고 결과에 미치는 영향 |
| `filing_settlement_completion_verification` | 신고·정산 처리 여부 확인 |
| `filing_traceability` | 신고에 반영된 자료 확인 |
| `full_payment_or_unclear` | 전액 수령 후 처리 불분명 |
| `full_payment_then_self_process` | 전액 수령 후 직접 처리 |
| `general_status_check` | 전체 상태 점검 |
| `guidance_validity_and_compliance_action` | 안내의 정확성과 필요한 조치 |
| `income_and_expense_treatment` | 소득과 비용 처리 |
| `income_payment_records` | 소득·지급 자료 |
| `income_tax_linkage` | 받은 돈과 세금 처리의 연결 |
| `instruction_or_system_screen` | 안내문·시스템 화면 |
| `insufficient_company_records` | 회사 자료 부족 |
| `insufficient_evidence` | 자료 부족 |
| `insufficient_records` | 기록·자료 부족 |
| `internal_explanation_data_difference` | 담당자 설명과 자료의 차이 |
| `invoice` | 전자 인보이스 |
| `invoice_and_transaction_available` | 인보이스와 거래 자료 모두 있음 |
| `invoice_content_difference` | 인보이스 내용의 차이 |
| `invoice_displayed_vat` | 인보이스에 표시된 VAT 금액 |
| `invoice_only` | 인보이스만 있음 |
| `invoice_or_filing_procedure_unknown` | 인보이스·신고 방법을 모름 |
| `invoice_result_mismatch` | 처리한 인보이스의 불일치 |
| `invoice_tax_base` | 인보이스의 공급가액 |
| `invoice_understanding` | 인보이스 내용 이해 |
| `invoice_validity_verification` | 인보이스 내용 확인 |
| `invoice_vs_transaction` | 인보이스와 실제 거래의 일치 여부 |
| `issuance_needed` | 발행 필요 여부 확인 |
| `issuance_or_correction_action` | 발행·수정 방법 |
| `issued_content_check` | 발행한 내용 확인 |
| `language_barrier` | 베트남어 이해 어려움 |
| `linkage_organization` | 인보이스·거래 연결 정리 |
| `little_or_none` | 자료가 거의 없음 |
| `missing_invoice_scope` | 빠진 인보이스 범위 |
| `mixed_income` | 여러 소득이 함께 관련됨 |
| `mixed_income_tax_amount` | 여러 소득의 세금 금액 |
| `mixed_multiple_records` | 여러 거래·인보이스가 섞여 있음 |
| `mostly_available` | 자료 대부분 있음 |
| `mostly_organized` | 대부분 정리됨 |
| `multiple_company_records` | 여러 회사 자료 |
| `multiple_handlers` | 처리 담당이 여러 곳 |
| `multiple_income_bases` | 여러 소득 금액 |
| `multiple_payment_methods` | 여러 지급 방식 |
| `multiple_tax_amounts` | 여러 세금 금액 |
| `multiple_transaction_bases` | 여러 거래 금액 |
| `multiple_transaction_vat` | 여러 거래의 VAT 금액 |
| `next_action_unclear` | 다음 조치가 불분명 |
| `no_action_yet` | 아직 조치 없음 |
| `no_blockage_self_check` | 막힌 것 없이 점검 중 |
| `no_specific_blocker` | 특별히 막힌 부분 없음 |
| `none` | 안내받은 날짜 없음 |
| `none_self_initiated` | 받은 안내 없이 직접 확인 |
| `not_applicable` | 해당 없음 |
| `not_issued_by_anyone` | 인보이스가 아직 없음 |
| `not_yet_identified` | 아직 모르는 금액 |
| `notice_or_document_received` | 안내·서류를 받음 |
| `notice_verification` | 안내 내용 확인 |
| `official_notice` | 공식 안내 |
| `online_hearsay_or_memory` | 온라인·전해 들은 날짜·기억 |
| `original_source_unverified` | 원래 출처 미확인 |
| `overall_company_data_difference` | 회사 자료 전반의 차이 |
| `overall_filing_consistency` | 신고 결과 전체의 일치 여부 |
| `overall_situation_mismatch` | 상황 전반의 차이 |
| `overall_transaction_invoice_difference` | 거래·인보이스 전반의 차이 |
| `own_understanding_basis` | 본인이 이해한 처리 방식 |
| `partial_company_records` | 일부 회사 자료 |
| `partial_invoice_or_transaction_records` | 일부 인보이스·거래 자료 |
| `partial_records` | 일부 자료 |
| `partially_available` | 일부 자료만 있음 |
| `partially_distributed` | 일부만 정리, 나머지는 흩어짐 |
| `passed_or_imminent` | 기한이 지났거나 임박 |
| `paying_party` | 돈을 지급한 쪽 |
| `payment_tax_linkage` | 받은 돈과 세금 처리의 연결 확인 |
| `period_or_basis_mismatch` | 기간·기준이 다름 |
| `personal_contract_project` | 개인 계약·프로젝트 수입 |
| `personal_income_tax` | 개인소득세 |
| `possibly_passed_or_near` | 지났거나 가까울 수 있음 |
| `pre_action_check_needed` | 조치 전 확인 필요 |
| `pre_action_guidance_needed` | 조치 전 안내 필요 |
| `pre_action_review_needed` | 조치 전 검토 필요 |
| `procedure_guidance` | 처리 방법 안내를 받음 |
| `procedure_guidance_received` | 처리 방법 안내를 받음 |
| `procedure_preparation` | 절차·준비 사항 확인 |
| `procedure_unknown` | 절차를 모름 |
| `processing_completion_verification` | 처리 완료 여부 확인 |
| `processing_reflection_unconfirmed` | 처리 반영 여부 미확인 |
| `purchase_invoice_vat` | 구입 인보이스와 VAT 처리 |
| `rate_based_vat` | 세율 기준 VAT |
| `received_content_check` | 받은 내용 확인 |
| `records_at_hand` | 가지고 있는 자료 |
| `reference_basis` | 기준 자료 |
| `reference_document` | 기준 문서 |
| `reference_selection` | 기준 자료 선택 |
| `related_income_amount` | 해당 소득 금액 |
| `rental_or_foreign_income` | 임대·해외소득 |
| `rental_or_foreign_income_tax_amount` | 임대·해외소득 세금 금액 |
| `reporting_or_treatment` | 신고·처리 방법 |
| `required_action_unclear` | 해야 할 일이 불분명 |
| `required_document_identification` | 필요한 자료 파악 |
| `required_record_guidance` | 준비할 자료 안내 |
| `resolution_procedure` | 문제 해결 절차 |
| `responsibility_or_filing` | 세금 처리 책임·신고 |
| `result_explanation` | 결과에 대한 설명 |
| `result_mismatch` | 처리 결과가 예상과 다름 |
| `result_reconciliation` | 결과 차이 대조 |
| `result_reflection_unknown` | 결과 반영 여부 모름 |
| `result_traceability` | 결과 추적 |
| `revenue_reporting_difference` | 수입과 신고 수입의 차이 |
| `revised_or_reissued` | 수정·재발행됨 |
| `revision_relation_unclear` | 이전 자료와의 관계 불분명 |
| `salary` | 급여 |
| `salary_or_payment_amount` | 급여 또는 지급액 |
| `salary_tax_amount` | 급여에서 빠진 세금 금액 |
| `sales_vat_treatment` | 판매 VAT 처리 |
| `scattered_or_inconsistent` | 흩어져 있거나 서로 다름 |
| `selected` | 직접 선택 |
| `self_check` | 미리 점검 |
| `self_check_no_guidance` | 안내 없이 직접 점검 |
| `self_issued` | 직접 발행 |
| `source_reconstruction` | 원자료 재확인 |
| `source_unverified` | 출처 미확인 |
| `staff_or_agent_handled` | 담당자·대행사가 처리 |
| `state_unknown` | 상태를 정확히 모름 |
| `submission_guidance` | 제출 방법 안내를 받음 |
| `submission_or_review` | 제출·검토 대응 |
| `submission_scope_unclear` | 제출 자료 범위가 불분명 |
| `system_reflection` | 시스템 반영 여부 |
| `target_document_unclear` | 처리할 자료가 불분명 |
| `tax_amount_and_basis_verification` | 세금 금액·계산 근거 확인 |
| `tax_amount_result_issue` | 법인세 금액·결과 확인 |
| `tax_authority_direct` | 세무기관에서 직접 받음 |
| `tax_authority_document` | 세무기관 서류 |
| `tax_authority_or_official_system` | 세무기관·공식 시스템 |
| `tax_calculation_unclear` | 세금 계산 근거 불명확 |
| `tax_correction_action` | 정정 방법 |
| `tax_correction_followup` | 정정·후속 조치 |
| `tax_document` | 세금 관련 서류 |
| `tax_handling_untraceable` | 세금 처리 내용 확인 불가 |
| `tax_result_difference` | 세금 계산 결과의 차이 |
| `tax_withheld_before_payment` | 지급 전 세금을 먼저 뗌 |
| `taxable_income` | 과세 대상 소득 |
| `taxable_income_linkage` | 과세 소득과의 연결 |
| `taxpayer` | 본인이 직접 처리 |
| `third_party_claimed` | 상대방이 처리한다고 들음 |
| `third_party_or_online` | 다른 사람·온라인 |
| `to_be_identified` | 확인할 금액 파악 필요 |
| `transaction_amount` | 거래 금액 |
| `transaction_amount_difference` | 거래 금액의 차이 |
| `transaction_and_payment_records` | 거래·입금 자료 |
| `transaction_based_vat` | 거래 금액 기준 VAT |
| `transaction_completeness` | 거래 누락 여부 |
| `transaction_identification` | 어떤 거래인지 확인 |
| `transaction_only_or_partial_invoice` | 거래 자료만 있거나 인보이스 일부만 있음 |
| `transaction_reporting_difference` | 거래와 신고 자료의 차이 |
| `unconfirmed_date` | 날짜 미확정 |
| `unknown` | 기한을 모름 |
| `unrecognized_transaction` | 기억에 없거나 불분명한 거래 |
| `unsure` | 잘 모름 |
| `unsure_default_personal` | 어느 쪽인지 잘 모름(개인소득세로 시작) |
| `unverified` | 공식 출처 미확인 |
| `upcoming_with_margin` | 아직 여유 있음 |
| `vat_amount_basis_verification` | VAT 금액·계산 기준 확인 |
| `vat_calculation_effect` | VAT 계산에 미치는 영향 |
| `vat_einvoice` | VAT·전자 인보이스 |
| `verbal_or_written_explanation_received` | 설명을 들음 |
| `verified` | 공식 출처 확인 |
| `withholding_or_year_end` | 원천징수·연말 정산 |

---

# H. Claude가 ChatGPT 수정본에서 고친 곳

- **진입 화면 신설(A-0)** — 경로 선택 문구와 선택지를 생활 문장으로 작성, 잘 모르겠거나 직접 입력이면 개인소득세로 시작.
- **Q3-P 교체** — 기존에는 Q1의 소득 종류(급여/계약/임대)를 자료 질문에서 다시 묻는 대각선 구조였음. 자료 보유 정도 × 먼저 확인할 점으로 바꿔 소득 종류와 무관하게 답할 수 있게 함.
- **Q2-V 교체** — 인보이스가 “실제 거래와 맞다/다르다”를 이미 아는 것처럼 묻던 구조를 “누가 발행했거나 받았고 지금 어떤 상태인가”로 바꿈. 담당자·대행사가 처리해 상태를 모르는 고객 선택지 추가.
- **Q3-V 교체** — 가진 자료(인보이스만/거래자료만/둘 다/섞임) × 가장 걱정되는 점으로 바꿔 Q1·Q2와의 반복 제거, 세율·VAT 금액 확인은 첫 선택지에 흡수.
- **Q1-V ③ 교체** — Q2와 겹치던 “인보이스 없음/불일치”를 “기억에 없거나 어떤 거래인지 불분명한 안내”로 바꿈(사칭·오인 안내 입구).
- **Q8 3개 경로 전면 교체** — “알고 있다/모른다” 구분만 있던 것을 기한 시점(지났거나 임박/여유 있음/지났거나 가까울 수 있음/날짜 미확정/기한 자체를 모름) × 날짜의 출처 2층으로 변경. 이 값이 전문가 진행 연결의 근거가 됨.
- **안내를 받은 적이 없는 고객용 선택지 추가** — Q4·Q5·Q6·Q7·Q10·Q11(3개 경로 모두)에 “받은 안내 없이 직접 확인/미리 점검” 선택지 추가. 서류를 받지 않은 호기심 고객도 끝까지 답할 수 있음.
- **영어 노출 수정** — Q9-P ①의 “unclear합니다”를 “분명하지 않습니다”로 수정.
- **어색한 문장 수정** — Q1-C ③(“회사의 세금 문제가 확인되어”)을 “세무기관에서 검토나 자료 요청을 받아…”로, Q11의 “내가”를 “제가”로 통일, Q6·Q9의 긴 질문 문장을 한 번에 읽히는 길이로 단축.
- **쉬운 용어** — Q1-V에 “부가가치세(VAT)”를 처음에 풀어 씀.
- **E 결과 완성** — ChatGPT본은 설명만 있고 실제 문장이 없었음. 1차(카드·판정·본문·위험 규칙)와 2차(모든 선택지별 문장)를 전부 작성. 조사 오류(예: “급여으로”)가 나지 않도록 선택지별 완성 문장 방식 사용.
- **G 라벨 완성** — 36개뿐이던 표를 사용되는 모든 내부 값(239개)으로 확장.
- **F 점검 교체** — 문서 속 자기 선언 대신 실제 실행한 자동 점검 결과로 교체.

# K. 리포트 고정 문구

서류를 첨부하면 더 정확히 확인할 수 있습니다.
