import type { AdminVerifyFirstResultData } from "@/components/cost-check/AdminVerifyFirstResultPanel";
import { ADMIN_DIRECT_EXPLAIN_CHOICE, isAdminDirectExplainOption } from "@/lib/adminVerifyProfiling";
import type { AdminVerifyProfilePhase } from "@/lib/adminVerifyProfiling";
import {
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
} from "@/lib/adminVerifyProfiling";
import type { VerifyMasterContentSlots } from "@/lib/verifyMasterContentSlots";
import type { PackReviewQuestion, VerifyMasterPackBridge } from "@/lib/verifyMasterPackBridge";

/** 저장 키. 이미 tax_ 로 시작하면 한 번만 둔다. */
export function taxStorageKey(field: string): string {
  return field.startsWith("tax_") ? field : `tax_${field}`;
}

type ChoiceFields = Record<string, string>;

type TaxChoice = {
  value: string;
  label: string;
  fields: ChoiceFields;
};

type TaxQuestion = {
  id: string;
  prompt: string;
  choices: TaxChoice[];
};

const Q1_ID = "tax_q1";
const Q2_ID = "tax_q2";
const Q3_ID = "tax_q3";
const Q4_ID = "tax_q4";
const Q5_ID = "tax_q5";
const Q6_ID = "tax_q6";
const Q7_ID = "tax_q7";
const Q8_ID = "tax_q8";
const Q9_ID = "tax_q9";
const Q10_ID = "tax_q10";
const Q11_ID = "tax_q11";
const Q12_ID = "tax_q12";

const Q1: TaxQuestion = {
  id: Q1_ID,
  prompt: "지금 겪고 계신 세금 문제는 누구의, 어떤 상황과 관련되어 있나요?",
  choices: [
    {
      value: "q1_salary",
      label:
        "회사에서 급여를 받고 있는데, 회사가 세금을 떼고 준 금액이 맞는지, 제가 따로 신고할 것이 있는지 모르겠습니다.",
      fields: {
        tax_subject: "individual",
        income_source: "salary",
        open_issue: "withholding_and_extra_filing",
      },
    },
    {
      value: "q1_freelance",
      label:
        "개인으로 일하거나 계약을 맺고 돈을 받고 있는데, 세금을 어떻게 신고해야 하고 누가 미리 떼어야 하는지 모르겠습니다.",
      fields: {
        tax_subject: "individual",
        income_source: "freelance_contract",
        open_issue: "filing_method_and_withholding_party",
      },
    },
    {
      value: "q1_rental",
      label:
        "베트남에 있는 집·방 임대 수입이나 해외에서 받은 돈이 있는데, 베트남에 신고해야 하는지 모르겠습니다.",
      fields: {
        tax_subject: "individual",
        income_source: "rental_or_foreign",
        open_issue: "reporting_obligation",
      },
    },
    {
      value: "q1_vat",
      label:
        "회사에서 물건이나 서비스를 사고팔았는데, 부가가치세(VAT)와 전자 인보이스를 발행하거나 받은 내용이 실제 거래와 맞는지 모르겠습니다.",
      fields: {
        tax_subject: "business",
        tax_area: "vat_invoice",
        open_issue: "transaction_invoice_match",
      },
    },
    {
      value: "q1_cit",
      label:
        "회사의 1년 수입·비용에 대한 세금(법인세) 신고를 준비 중이거나 이미 했는데, 내용이 맞는지 확인하고 싶습니다.",
      fields: {
        tax_subject: "business",
        tax_area: "corporate_income",
        open_issue: "filing_accuracy",
      },
    },
  ],
};

const Q2: TaxQuestion = {
  id: Q2_ID,
  prompt: "세금 신고나 납부 기한이 언제인지 알고 있으며, 현재 어떤 상태인가요?",
  choices: [
    {
      value: "q2_upcoming",
      label: "기한을 알고 있고 아직 여유가 있어, 필요한 자료를 준비하고 있습니다.",
      fields: { tax_deadline_status: "upcoming", filing_stage: "preparation", urgency: "normal" },
    },
    {
      value: "q2_near",
      label: "기한이 얼마 남지 않았지만 정확한 날짜나 준비할 자료를 아직 확인하지 못했습니다.",
      fields: { tax_deadline_status: "near_due", filing_stage: "preparation", urgency: "high" },
    },
    {
      value: "q2_overdue",
      label: "신고나 납부 기한이 이미 지난 것 같지만, 세무기관에서 따로 연락받지는 않았습니다.",
      fields: { tax_deadline_status: "overdue", filing_stage: "not_started", urgency: "high" },
    },
    {
      value: "q2_unknown_status",
      label: "신고는 했지만 접수나 납부가 끝났는지 확실하지 않아 현재 상태를 확인하고 있습니다.",
      fields: {
        tax_deadline_status: "processing_status_unknown",
        filing_stage: "submitted_or_partial",
        urgency: "medium",
      },
    },
    {
      value: "q2_deadline_unknown",
      label: "정확한 기한을 모르고 있어, 언제 무엇을 신고하거나 납부해야 하는지부터 확인하고 싶습니다.",
      fields: { tax_deadline_status: "unknown", filing_stage: "not_started", urgency: "high" },
    },
  ],
};

const Q3: TaxQuestion = {
  id: Q3_ID,
  prompt: "세무기관에서 받은 연락이나 문서가 있으며, 지금 어떤 대응이 필요한 상황인가요?",
  choices: [
    {
      value: "q3_general",
      label:
        "세무기관에서 일반적인 세금 안내나 세금번호·등록정보 관련 연락을 받아, 제 상황에 해당하는 내용과 무엇이 문제인지 확인하고 싶습니다.",
      fields: {
        authority_notice_type: "general_or_registration",
        authority_request: "applicability_or_registration_check",
        response_status: "not_started",
      },
    },
    {
      value: "q3_impersonation",
      label: "세무기관이라며 연락이 왔거나 납부를 요구받았는데, 실제 세무기관이 맞는지 의심스럽습니다.",
      fields: {
        authority_notice_type: "suspected_impersonation",
        authority_request: "authenticity_check",
        response_status: "check_before_paying",
      },
    },
    {
      value: "q3_filing_request",
      label: "신고내용이나 자료를 제출하라는 요청을 받아, 무엇을 언제까지 내야 하는지 확인해야 합니다.",
      fields: {
        authority_notice_type: "filing_document_request",
        authority_request: "evidence_submission",
        response_status: "action_required",
      },
    },
    {
      value: "q3_payment_notice",
      label: "세금이나 납부와 관련된 통지를 받아, 문서 내용과 대응기한을 확인해야 합니다.",
      fields: {
        authority_notice_type: "tax_payment_or_assessment_notice",
        authority_request: "notice_content_check",
        response_status: "action_required",
      },
    },
    {
      value: "q3_none",
      label: "아직 세무기관에서 받은 연락이나 문서는 없습니다.",
      fields: {
        authority_notice_type: "none",
        authority_request: "none",
        response_status: "not_applicable",
      },
    },
  ],
};

const Q4: TaxQuestion = {
  id: Q4_ID,
  prompt: "세금번호(MST)를 가지고 있거나 등록하는 과정에서, 여권 정보와 연결된 문제가 있나요?",
  choices: [
    {
      value: "q4_old_passport",
      label: "MST가 있지만 예전 여권으로 등록되어 있어, 새 여권 정보로 바뀌었는지 확인하고 싶습니다.",
      fields: { mst_status: "existing", passport_status: "old_passport_linked", mst_issue: "passport_update" },
    },
    {
      value: "q4_first",
      label: "MST를 처음 등록하려고 하는데, 여권으로 어떤 등록을 해야 하는지와 발급 상태를 모르겠습니다.",
      fields: {
        mst_status: "not_registered",
        passport_status: "registration_needed",
        mst_issue: "first_registration",
      },
    },
    {
      value: "q4_lookup",
      label: "MST가 있지만 회사나 세무업무에서 조회되지 않아, 여권과 등록정보가 맞는지 확인하고 싶습니다.",
      fields: { mst_status: "existing", passport_status: "data_mismatch", mst_issue: "system_lookup_failure" },
    },
    {
      value: "q4_multiple",
      label: "MST가 여러 개이거나 번호가 달라, 현재 어떤 번호를 사용해야 하는지 확인하고 싶습니다.",
      fields: {
        mst_status: "multiple_or_unclear",
        passport_status: "identity_conflict",
        mst_issue: "duplicate_record_resolution",
      },
    },
    {
      value: "q4_unknown",
      label: "MST 관련 문제는 없거나, 현재 어떤 문제가 있는지 잘 모르겠습니다.",
      fields: {
        mst_status: "no_issue_or_unknown",
        passport_status: "unknown",
        mst_issue: "no_issue_or_unknown",
      },
    },
  ],
};

const Q5: TaxQuestion = {
  id: Q5_ID,
  prompt: "실제로 받은 소득은 어떤 방식으로 발생했고, 세금 처리는 어디까지 확인되어 있나요?",
  choices: [
    {
      value: "q5_salary",
      label: "회사에서 급여를 정기적으로 받고 있고, 급여명세서에서 세금이 공제된 내용을 확인할 수 있습니다.",
      fields: {
        income_source: "salary",
        income_pattern: "regular",
        withholding_status: "employer_withheld",
        income_evidence: "payroll",
      },
    },
    {
      value: "q5_contract",
      label:
        "계약이나 프로젝트로 돈을 받고 있고, 계약서와 지급받은 금액을 확인할 수 있지만 세금 처리는 더 확인해야 합니다.",
      fields: {
        income_source: "freelance_contract",
        income_pattern: "project_based",
        withholding_status: "unknown",
        income_evidence: "contract",
      },
    },
    {
      value: "q5_rental",
      label:
        "베트남에서 임대료를 받고 있고, 임대계약과 실제 받은 금액을 확인할 수 있지만 신고 내용은 확인하지 못했습니다.",
      fields: {
        income_source: "rental_or_foreign",
        income_pattern: "rental_regular",
        withholding_status: "unknown",
        income_evidence: "rental_agreement",
      },
    },
    {
      value: "q5_foreign",
      label: "해외에서 돈을 받고 있고, 해외 지급자료는 있지만 베트남에서 어떻게 신고되었는지는 확인하지 못했습니다.",
      fields: {
        income_source: "rental_or_foreign",
        income_pattern: "foreign_received",
        withholding_status: "unknown",
        income_evidence: "foreign_payment_record",
      },
    },
    {
      value: "q5_mixed",
      label: "여러 방식으로 소득을 받고 있어, 각각의 소득과 세금 처리 내용을 구분해서 확인해야 합니다.",
      fields: {
        income_source: "mixed_income",
        income_pattern: "multiple",
        withholding_status: "unknown",
        income_evidence: "mixed_records",
      },
    },
  ],
};

const Q6: TaxQuestion = {
  id: Q6_ID,
  prompt: "회사의 세금 문제는 거래 인보이스와 법인세 중 어느 부분을 확인해야 하나요?",
  choices: [
    {
      value: "q6_seller",
      label:
        "물건이나 서비스를 판매하고 전자 인보이스를 발행했는데, 거래금액과 VAT가 실제 거래와 맞는지 확인하고 싶습니다.",
      fields: {
        tax_area: "vat_invoice",
        invoice_role: "seller",
        invoice_status: "issued",
        invoice_match: "sales_transaction_match",
      },
    },
    {
      value: "q6_buyer",
      label:
        "물건이나 서비스를 구매하고 전자 인보이스를 받았는데, 회사정보·금액·VAT가 실제 구매와 맞는지 확인하고 싶습니다.",
      fields: {
        tax_area: "vat_invoice",
        invoice_role: "buyer",
        invoice_status: "received",
        invoice_match: "purchase_transaction_match",
      },
    },
    {
      value: "q6_missing",
      label: "거래는 있었지만 전자 인보이스가 없거나 누락되어, 어떻게 처리해야 하는지 확인하고 싶습니다.",
      fields: {
        tax_area: "vat_invoice",
        invoice_role: "transaction_party",
        invoice_status: "missing",
        invoice_match: "transaction_without_invoice",
      },
    },
    {
      value: "q6_mismatch",
      label: "전자 인보이스의 회사정보·금액·날짜 등이 실제 거래와 달라, 수정이 필요한지 확인하고 싶습니다.",
      fields: {
        tax_area: "vat_invoice",
        invoice_role: "transaction_party",
        invoice_status: "issued_or_received",
        invoice_match: "invoice_data_mismatch",
      },
    },
    {
      value: "q6_cit",
      label:
        "회사의 1년 수입·비용을 기준으로 법인세 신고를 준비하거나 이미 제출했는데, 신고내용이 실제 회계자료와 맞는지 확인하고 싶습니다.",
      fields: {
        tax_area: "corporate_income",
        invoice_role: "not_applicable",
        invoice_status: "not_applicable",
        invoice_match: "not_applicable",
      },
    },
  ],
};

const Q7: TaxQuestion = {
  id: Q7_ID,
  prompt: "MST와 관련해 어떤 자료를 가지고 있으며, 지금 확인해야 할 부분은 무엇인가요?",
  choices: [
    {
      value: "q7_passport",
      label: "새 여권과 기존 MST 자료가 있어, 두 정보가 제대로 연결되어 있는지 확인해야 합니다.",
      fields: {
        mst_evidence_status: "available",
        mst_evidence_type: "passport_and_mst_record",
        mst_issue: "passport_update",
      },
    },
    {
      value: "q7_application",
      label: "MST를 신청한 자료가 있어, 실제 발급 결과와 현재 등록상태를 확인해야 합니다.",
      fields: {
        mst_evidence_status: "available",
        mst_evidence_type: "registration_application",
        mst_issue: "first_registration",
      },
    },
    {
      value: "q7_lookup",
      label: "MST가 조회되지 않아, 여권과 기존 세금등록자료를 비교해 확인해야 합니다.",
      fields: {
        mst_evidence_status: "partial",
        mst_evidence_type: "passport_and_mst_record",
        mst_issue: "system_lookup_failure",
      },
    },
    {
      value: "q7_multiple",
      label: "MST가 여러 개로 보여, 기존 등록자료를 비교해 어떤 번호를 사용해야 하는지 확인해야 합니다.",
      fields: {
        mst_evidence_status: "partial",
        mst_evidence_type: "passport_and_mst_record",
        mst_issue: "duplicate_record_resolution",
      },
    },
    {
      value: "q7_unknown",
      label: "MST 관련 문제는 없거나 잘 모르겠어서, 현재 가진 여권·세금자료를 기준으로 확인해야 합니다.",
      fields: { mst_evidence_status: "unknown", mst_evidence_type: "unknown", mst_issue: "no_issue_or_unknown" },
    },
  ],
};

const Q8: TaxQuestion = {
  id: Q8_ID,
  prompt: "소득과 세금 처리 자료 중 현재 확인할 수 있는 것은 어디까지인가요?",
  choices: [
    {
      value: "q8_payroll",
      label: "급여명세서에 세금 공제가 표시되어 있어, 회사의 신고·납부자료와 맞는지 확인해야 합니다.",
      fields: { income_check_point: "salary_filing_match", income_evidence: "payroll" },
    },
    {
      value: "q8_contract",
      label: "계약서와 지급자료가 있어, 계약금에서 처리된 세금과 신고자료가 연결되는지 확인해야 합니다.",
      fields: { income_check_point: "contract_tax_match", income_evidence: "contract" },
    },
    {
      value: "q8_rental",
      label: "임대계약과 입금자료가 있어, 실제 임대수입과 신고자료가 연결되는지 확인해야 합니다.",
      fields: { income_check_point: "rental_income_match", income_evidence: "rental_agreement" },
    },
    {
      value: "q8_foreign",
      label: "해외 지급자료가 있어, 받은 금액과 베트남 신고자료가 연결되는지 확인해야 합니다.",
      fields: { income_check_point: "foreign_income_match", income_evidence: "foreign_payment_record" },
    },
    {
      value: "q8_mixed",
      label: "여러 소득자료가 섞여 있어, 각각의 소득과 세금 처리자료를 먼저 구분해야 합니다.",
      fields: { income_check_point: "mixed_income_separation", income_evidence: "mixed_records" },
    },
  ],
};

const Q9: TaxQuestion = {
  id: Q9_ID,
  prompt: "현재 가지고 있는 소득·세금 자료가 실제 내용을 얼마나 확인할 수 있는 상태인가요?",
  choices: [
    {
      value: "q9_complete",
      label: "계약서와 입금내역이 모두 있어, 받은 돈의 출처와 금액을 자료로 확인할 수 있습니다.",
      fields: {
        evidence_status: "complete",
        evidence_type: "contract_and_payment",
        evidence_linkage: "income_confirmable",
      },
    },
    {
      value: "q9_payroll",
      label: "급여명세서와 회사 세금자료는 있지만, 실제 신고·납부까지 연결되는 자료가 부족합니다.",
      fields: {
        evidence_status: "partial",
        evidence_type: "payroll_tax_document",
        evidence_linkage: "filing_payment_uncertain",
      },
    },
    {
      value: "q9_rental",
      label: "임대·계약 자료는 있지만 입금내역이 부족해, 실제 받은 금액을 완전히 확인하기 어렵습니다.",
      fields: {
        evidence_status: "partial",
        evidence_type: "income_payment_record",
        evidence_linkage: "income_amount_uncertain",
      },
    },
    {
      value: "q9_foreign",
      label: "해외 지급자료는 있지만 베트남 신고자료가 부족해, 두 자료를 연결해 확인해야 합니다.",
      fields: {
        evidence_status: "partial",
        evidence_type: "foreign_payment_record",
        evidence_linkage: "foreign_reporting_uncertain",
      },
    },
    {
      value: "q9_scattered",
      label: "자료가 여러 곳에 있거나 일부가 없어, 실제 소득과 세금 처리를 다시 정리해야 합니다.",
      fields: {
        evidence_status: "scattered_or_missing",
        evidence_type: "mixed_or_incomplete",
        evidence_linkage: "requires_document_reconstruction",
      },
    },
  ],
};

const Q10: TaxQuestion = {
  id: Q10_ID,
  prompt: "전자 인보이스와 실제 거래에서 어떤 부분이 다르며, 현재 어떤 자료를 확인해야 하나요?",
  choices: [
    {
      value: "q10_amount",
      label: "인보이스 금액과 실제 계약·입금금액이 달라, 거래자료와 금액을 함께 확인해야 합니다.",
      fields: {
        invoice_match: "amount_mismatch",
        invoice_detail_issue: "transaction_amount",
        invoice_resolution_status: "needs_review",
      },
    },
    {
      value: "q10_vat",
      label: "VAT 금액이나 적용 내용이 실제 거래와 달라 보여, 세금자료와 인보이스를 함께 확인해야 합니다.",
      fields: {
        invoice_match: "vat_mismatch",
        invoice_detail_issue: "vat_amount",
        invoice_resolution_status: "needs_review",
      },
    },
    {
      value: "q10_party",
      label: "회사명·MST·주소 등 상대방 정보가 실제 거래자료와 달라, 거래 상대방 정보를 확인해야 합니다.",
      fields: {
        invoice_match: "party_information_mismatch",
        invoice_detail_issue: "counterparty_information",
        invoice_resolution_status: "needs_review",
      },
    },
    {
      value: "q10_date",
      label: "인보이스 날짜와 실제 거래일이 달라, 거래자료와 신고에 사용된 날짜를 확인해야 합니다.",
      fields: {
        invoice_match: "date_mismatch",
        invoice_detail_issue: "transaction_date",
        invoice_resolution_status: "needs_review",
      },
    },
    {
      value: "q10_missing",
      label: "인보이스가 없거나 수정이 완료되지 않아, 실제 거래자료와 현재 인보이스 상태를 함께 확인해야 합니다.",
      fields: {
        invoice_match: "invoice_missing_or_correction_pending",
        invoice_detail_issue: "invoice_status",
        invoice_resolution_status: "correction_or_reissue_needed",
      },
    },
  ],
};

const Q11: TaxQuestion = {
  id: Q11_ID,
  prompt: "법인세 신고에서 실제 자료와 신고내용 중 무엇을 확인해야 하나요?",
  choices: [
    {
      value: "q11_annual",
      label: "연간 수입과 비용을 정리했지만, 신고에 사용한 금액이 실제 회계자료와 같은지 확인해야 합니다.",
      fields: {
        corporate_filing_issue: "annual_amount_match",
        corporate_filing_stage: "preparation",
        corporate_evidence_status: "accounting_record",
      },
    },
    {
      value: "q11_expense",
      label: "법인세 신고를 준비 중이며, 신고에 사용할 비용자료가 실제 비용과 맞는지 확인해야 합니다.",
      fields: {
        corporate_filing_issue: "expense_evidence",
        corporate_filing_stage: "preparation",
        corporate_evidence_status: "expense_document",
      },
    },
    {
      value: "q11_submitted",
      label: "법인세 신고서를 제출했지만, 정상 접수되었는지와 추가 자료 요청이 있는지 확인해야 합니다.",
      fields: {
        corporate_filing_issue: "submission_status",
        corporate_filing_stage: "submitted",
        corporate_evidence_status: "filing_receipt",
      },
    },
    {
      value: "q11_paid",
      label: "법인세를 납부했지만, 실제 납부기록이 세금계정에 반영되었는지 확인해야 합니다.",
      fields: {
        corporate_filing_issue: "payment_reflection",
        corporate_filing_stage: "paid",
        corporate_evidence_status: "payment_record",
      },
    },
    {
      value: "q11_diff",
      label: "신고내용과 회계자료 사이에 차이가 있어, 어떤 자료를 기준으로 다시 확인해야 하는지 모르겠습니다.",
      fields: {
        corporate_filing_issue: "accounting_filing_difference",
        corporate_filing_stage: "review_needed",
        corporate_evidence_status: "mixed_accounting_records",
      },
    },
  ],
};

const Q12: TaxQuestion = {
  id: Q12_ID,
  prompt: "이번 세금 검토에서 가장 먼저 확인하고 싶은 결과는 무엇인가요?",
  choices: [
    {
      value: "q12_self",
      label: "현재 신고·납부에 필요한 자료와 절차를 정리해, 제가 직접 처리할 수 있는 상태가 되고 싶습니다.",
      fields: { final_goal: "self_filing_guidance", assistance_level: "information_and_preparation" },
    },
    {
      value: "q12_prior",
      label: "이미 처리한 신고·납부 내용 중 잘못되었을 가능성이 있는 부분을 확인하고 싶습니다.",
      fields: { final_goal: "prior_filing_review", assistance_level: "error_check" },
    },
    {
      value: "q12_overall",
      label: "MST·소득·원천징수 또는 회사의 인보이스·법인세 자료를 모아 전체 상태를 확인하고 싶습니다.",
      fields: { final_goal: "overall_tax_status_review", assistance_level: "integrated_review" },
    },
    {
      value: "q12_notice",
      label: "세무기관에서 받은 문서나 요청에 대응하기 전에, 내용과 필요한 자료를 확인하고 싶습니다.",
      fields: { final_goal: "authority_response_review", assistance_level: "notice_response_preparation" },
    },
    {
      value: "q12_expert",
      label: "자료가 복잡하거나 직접 판단하기 어려워, 확인된 내용을 바탕으로 전문가에게 진행을 요청하고 싶습니다.",
      fields: { final_goal: "expert_assistance", assistance_level: "professional_handoff" },
    },
  ],
};

const QUESTIONS = [Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12];

/** G표 + 패치 1에서 추가된 고객용 라벨. 화면에는 이 라벨만 쓴다. */
const G_LABELS: Record<string, Record<string, string>> = {
  tax_subject: { individual: "개인 세금", business: "사업·법인 세금" },
  income_source: {
    salary: "급여",
    freelance_contract: "개인 계약·프로젝트 소득",
    rental_or_foreign: "임대·해외 관련 소득",
    mixed_income: "여러 종류의 소득",
  },
  open_issue: {
    withholding_and_extra_filing: "급여 세금 공제·추가 신고 확인",
    filing_method_and_withholding_party: "개인 소득 신고·세금 처리 주체 확인",
    reporting_obligation: "임대·해외소득 신고 여부 확인",
    transaction_invoice_match: "실제 거래와 VAT·전자 인보이스 확인",
    filing_accuracy: "법인세 신고내용 확인",
  },
  tax_area: { vat_invoice: "부가가치세(VAT)·전자 인보이스", corporate_income: "법인세" },
  tax_deadline_status: {
    upcoming: "아직 기한 전",
    near_due: "기한이 임박함",
    overdue: "기한이 지난 것 같음",
    processing_status_unknown: "처리상태를 확인해야 함",
    unknown: "정확한 기한을 모름",
  },
  filing_stage: {
    preparation: "준비 중",
    not_started: "아직 시작하지 않음",
    submitted_or_partial: "신고했거나 일부 처리함",
  },
  urgency: { normal: "일반적인 확인", high: "기한 확인이 중요함", medium: "처리상태 확인 필요" },
  authority_notice_type: {
    general_or_registration: "일반 안내·세금번호 관련 연락",
    suspected_impersonation: "세무기관 사칭이 의심되는 연락",
    filing_document_request: "신고·자료 제출 요청",
    tax_payment_or_assessment_notice: "세금·납부 관련 통지",
    none: "세무기관 연락 없음",
  },
  authority_request: {
    applicability_or_registration_check: "해당 내용·등록정보 확인",
    authenticity_check: "실제 세무기관인지 확인",
    evidence_submission: "자료 제출 대응",
    notice_content_check: "통지 내용 확인",
    none: "해당 없음",
  },
  response_status: {
    not_started: "아직 대응하지 않음",
    action_required: "대응 필요",
    not_applicable: "해당 없음",
    check_before_paying: "납부·정보 제공 전 확인 필요",
  },
  mst_status: {
    existing: "MST가 있음",
    not_registered: "아직 MST가 없음",
    multiple_or_unclear: "여러 개이거나 상태가 불명확함",
    no_issue_or_unknown: "관련 문제는 없거나 잘 모름",
  },
  passport_status: {
    old_passport_linked: "예전 여권으로 연결됨",
    registration_needed: "신규 등록이 필요함",
    data_mismatch: "등록정보가 다름",
    identity_conflict: "신원정보 충돌이 있음",
    unknown: "여권 연결 상태를 확인하기 어려움",
  },
  mst_issue: {
    passport_update: "여권 정보 변경 확인",
    first_registration: "최초 MST 등록 확인",
    system_lookup_failure: "MST 조회 문제 확인",
    duplicate_record_resolution: "중복 MST 확인",
    no_issue_or_unknown: "MST 문제 없음 또는 확인 필요",
  },
  income_pattern: {
    regular: "정기적으로 발생",
    project_based: "계약·프로젝트별 발생",
    rental_regular: "정기 임대수입",
    foreign_received: "해외에서 받은 소득",
    multiple: "여러 방식으로 발생",
  },
  withholding_status: {
    employer_withheld: "회사가 세금을 공제함",
    unknown: "원천징수 상태를 확인하지 못함",
  },
  income_evidence: {
    payroll: "급여·세금자료",
    contract: "계약자료",
    rental_agreement: "임대계약 자료",
    foreign_payment_record: "해외 지급자료",
    mixed_records: "여러 소득자료",
  },
  mst_evidence_status: {
    available: "자료를 가지고 있음",
    partial: "일부 자료만 있음",
    unknown: "자료 상태를 확인하기 어려움",
  },
  mst_evidence_type: {
    passport_and_mst_record: "여권·MST 자료",
    registration_application: "MST 등록 신청자료",
    unknown: "확인할 자료를 특정하기 어려움",
  },
  income_check_point: {
    salary_filing_match: "급여와 세금 신고 연결",
    contract_tax_match: "계약소득과 세금 처리 연결",
    rental_income_match: "임대소득과 신고자료 연결",
    foreign_income_match: "해외소득과 신고자료 연결",
    mixed_income_separation: "여러 소득 구분",
  },
  evidence_status: {
    complete: "자료가 충분함",
    partial: "일부 자료가 있음",
    scattered_or_missing: "자료가 흩어져 있거나 부족함",
  },
  evidence_type: {
    contract_and_payment: "계약서·입금자료",
    payroll_tax_document: "급여·세금자료",
    income_payment_record: "소득·입금자료",
    foreign_payment_record: "해외 지급자료",
    mixed_or_incomplete: "여러 자료 또는 불완전한 자료",
  },
  evidence_linkage: {
    income_confirmable: "소득 확인 가능",
    filing_payment_uncertain: "신고·납부 연결 확인 필요",
    income_amount_uncertain: "실제 소득금액 확인 필요",
    foreign_reporting_uncertain: "해외소득 신고 연결 확인 필요",
    requires_document_reconstruction: "자료 재구성이 필요함",
  },
  invoice_role: {
    seller: "판매자",
    buyer: "구매자",
    transaction_party: "거래 당사자",
    not_applicable: "해당 없음",
  },
  invoice_status: {
    issued: "발행함",
    received: "받음",
    missing: "없음 또는 누락됨",
    issued_or_received: "발행 또는 수령함",
    not_applicable: "해당 없음",
  },
  invoice_match: {
    sales_transaction_match: "판매 거래와 일치",
    purchase_transaction_match: "구매 거래와 일치",
    transaction_without_invoice: "거래는 있지만 인보이스 없음",
    invoice_data_mismatch: "실제 거래와 인보이스 정보가 다름",
    not_applicable: "해당 없음",
    amount_mismatch: "거래금액이 다름",
    vat_mismatch: "VAT가 다름",
    party_information_mismatch: "거래 상대방 정보가 다름",
    date_mismatch: "거래일자가 다름",
    invoice_missing_or_correction_pending: "인보이스가 없거나 수정 대기 중",
  },
  invoice_detail_issue: {
    transaction_amount: "거래금액",
    vat_amount: "VAT",
    counterparty_information: "거래 상대방 정보",
    transaction_date: "거래일자",
    invoice_status: "인보이스 발행·수정 상태",
  },
  invoice_resolution_status: {
    needs_review: "확인 필요",
    correction_or_reissue_needed: "수정·재발행 확인 필요",
  },
  corporate_filing_issue: {
    annual_amount_match: "연간 금액 일치 여부",
    expense_evidence: "비용 증빙",
    submission_status: "신고 접수 상태",
    payment_reflection: "납부 반영 여부",
    accounting_filing_difference: "회계자료와 신고자료 차이",
  },
  corporate_filing_stage: {
    preparation: "준비 중",
    submitted: "제출 완료",
    paid: "납부 완료",
    review_needed: "재검토 필요",
  },
  corporate_evidence_status: {
    accounting_record: "회계자료",
    expense_document: "비용자료",
    filing_receipt: "신고 접수자료",
    payment_record: "납부자료",
    mixed_accounting_records: "여러 회계자료",
  },
  final_goal: {
    self_filing_guidance: "직접 신고 준비",
    prior_filing_review: "기존 신고·납부 검토",
    overall_tax_status_review: "전체 세금 상태 확인",
    authority_response_review: "세무기관 대응 준비",
    expert_assistance: "전문가 진행",
  },
  assistance_level: {
    information_and_preparation: "정보 확인·준비",
    error_check: "오류 확인",
    integrated_review: "종합 검토",
    notice_response_preparation: "통지 대응 준비",
    professional_handoff: "전문가 진행",
  },
};

const NO_TAX_ASSERTION =
  "실제 세액이나 납부의무는 현재 답변만으로 확정하지 않고 관련 자료와 신고·납부 기록을 함께 확인해야 합니다.";

export type TaxProfile = Record<string, string>;

function answered(answers: Record<string, string>, id: string): boolean {
  return Boolean(answers[id]?.trim());
}

function choiceOf(question: TaxQuestion, value: string | undefined): TaxChoice | undefined {
  if (!value || value === "other") return undefined;
  return question.choices.find((choice) => choice.value === value);
}

export function buildTaxProfile(answers: Record<string, string>): TaxProfile {
  const profile: TaxProfile = {};
  const apply = (question: TaxQuestion) => {
    const choice = choiceOf(question, answers[question.id]);
    if (!choice) return;
    for (const [field, value] of Object.entries(choice.fields)) {
      profile[taxStorageKey(field)] = value;
    }
  };
  for (const question of QUESTIONS) {
    if (question.id === Q5_ID) continue;
    apply(question);
  }
  apply(Q5);
  if (answers[Q1_ID] === "other") {
    profile[taxStorageKey("tax_subject")] = "unknown";
  }
  return profile;
}

export function taxField(profile: TaxProfile, field: string): string {
  return profile[taxStorageKey(field)] ?? "";
}

export function taxLabel(field: string, value: string): string {
  if (!value) return "";
  return G_LABELS[field]?.[value] ?? "";
}

function isDirectQ1(answers: Record<string, string>): boolean {
  return answers[Q1_ID] === "other";
}

function isStop(profile: TaxProfile): boolean {
  const notice = taxField(profile, "authority_notice_type");
  return notice === "filing_document_request" || notice === "tax_payment_or_assessment_notice";
}

function isPersonal(profile: TaxProfile): boolean {
  return taxField(profile, "tax_subject") === "individual";
}

function isVat(answers: Record<string, string>, profile: TaxProfile): boolean {
  if (answers[Q6_ID] && answers[Q6_ID] !== "other") {
    return taxField(profile, "tax_area") === "vat_invoice";
  }
  return answers[Q1_ID] === "q1_vat";
}

function isCit(answers: Record<string, string>, profile: TaxProfile): boolean {
  if (answers[Q6_ID] && answers[Q6_ID] !== "other") {
    return taxField(profile, "tax_area") === "corporate_income";
  }
  return answers[Q1_ID] === "q1_cit";
}

function skipsQ7(answers: Record<string, string>): boolean {
  return answers[Q4_ID] === "q4_unknown";
}

function toReview(question: TaxQuestion): PackReviewQuestion {
  const options = question.choices.map((choice) => ({ value: choice.value, label: choice.label }));
  const withDirect = options.some(isAdminDirectExplainOption)
    ? options
    : [...options, ADMIN_DIRECT_EXPLAIN_CHOICE];
  return { id: question.id, kind: "choice", label: question.prompt, options: withDirect };
}

function phase1Questions(answers: Record<string, string>): TaxQuestion[] {
  const list: TaxQuestion[] = [Q1];
  if (!answered(answers, Q1_ID)) return list;
  list.push(Q2);
  if (!answered(answers, Q2_ID)) return list;
  list.push(Q3);
  if (!answered(answers, Q3_ID)) return list;
  const profile = buildTaxProfile(answers);
  if (isDirectQ1(answers) || isStop(profile)) return list;
  if (isPersonal(profile)) {
    list.push(Q4, Q5);
    return list;
  }
  if (taxField(profile, "tax_subject") === "business") {
    list.push(Q6);
  }
  return list;
}

function phase2Questions(answers: Record<string, string>): TaxQuestion[] {
  const profile = buildTaxProfile(answers);
  if (isDirectQ1(answers) || isStop(profile)) return [];
  if (isPersonal(profile)) {
    const list: TaxQuestion[] = [];
    if (!skipsQ7(answers)) list.push(Q7);
    list.push(Q8, Q9, Q12);
    return list;
  }
  if (isVat(answers, profile)) return [Q10, Q12];
  if (isCit(answers, profile)) return [Q11, Q12];
  return [];
}

export function isTaxPhase1Complete(answers: Record<string, string>): boolean {
  if (!answered(answers, Q1_ID) || !answered(answers, Q2_ID) || !answered(answers, Q3_ID)) return false;
  const profile = buildTaxProfile(answers);
  if (isDirectQ1(answers) || isStop(profile)) return true;
  if (isPersonal(profile)) return answered(answers, Q4_ID) && answered(answers, Q5_ID);
  if (taxField(profile, "tax_subject") === "business") return answered(answers, Q6_ID);
  return false;
}

export function isTaxPhase2Complete(answers: Record<string, string>): boolean {
  if (!isTaxPhase1Complete(answers)) return false;
  return phase2Questions(answers).every((question) => answered(answers, question.id));
}

const TAX_IDENTITY = {
  serviceId: "tax" as const,
  serviceDisplayName: "세금",
  breadcrumb: {
    service: "세금 VERIFY",
    phase: "세금 검토",
    pageMetaLabel: "세금 VERIFY",
    pageMetaSuffix: "세금 검토",
  },
  sectionLabels: {
    section01: "01 현재 상황",
    section01Meta: "확인된 세금 상황",
    section02: "02 확인 결과",
    section05: "05 다음 확인",
    section05Title: "이어서 확인할 방법",
    personalizedIntroSubtitle: "1차 확인과 추가 답변을 반영한 세금 검토입니다.",
  },
  nextStepCard: {
    sectionLabel: "다음 확인",
    headline: "추가 확인 또는 VFBCAI 전문가팀 검토로 이어갈 수 있습니다",
    subcopy: "확인된 답변과 자료를 기준으로 다음 검토를 선택합니다.",
    reportTitle: "AI 리포트 요청하기",
    reportDescription: "확인된 세금 답변과 자료를 바탕으로 상세 검토를 정리합니다.",
  },
};

function labelOf(field: string, profile: TaxProfile): string {
  return taxLabel(field, taxField(profile, field));
}

function expertLines(profile: TaxProfile): string[] {
  const fields = [
    "filing_stage",
    "authority_request",
    "response_status",
    "corporate_evidence_status",
    "assistance_level",
    "invoice_resolution_status",
    "mst_issue",
  ];
  return fields
    .map((field) => labelOf(field, profile))
    .filter((line) => line.length > 0);
}

function buildSentences(profile: TaxProfile, phase2: boolean): string[] {
  const lines: string[] = [];
  const subject = taxField(profile, "tax_subject");
  const openIssue = labelOf("open_issue", profile);
  if (subject === "unknown") {
    lines.push(
      `현재 확인 대상은 직접 입력으로 설명해 주신 상황입니다. ${NO_TAX_ASSERTION}`,
    );
  } else if (subject === "individual" || subject === "business") {
    const subjectLabel = labelOf("tax_subject", profile);
    lines.push(
      openIssue
        ? `현재 확인 대상은 ${subjectLabel}이며, 처음 설명하신 문제는 ${openIssue}입니다. ${NO_TAX_ASSERTION}`
        : `현재 확인 대상은 ${subjectLabel}입니다. ${NO_TAX_ASSERTION}`,
    );
  }

  if (subject === "individual") {
    const income = labelOf("income_source", profile);
    const pattern = labelOf("income_pattern", profile);
    if (income) {
      lines.push(
        pattern
          ? `현재 소득은 ${income}으로 확인되었고, 발생 방식은 ${pattern}으로 확인됩니다. 고객이 제시한 소득자료와 실제 신고·세금 처리 내용을 대조할 필요가 있습니다.`
          : `현재 소득은 ${income}으로 확인되었습니다. 고객이 제시한 소득자료와 실제 신고·세금 처리 내용을 대조할 필요가 있습니다.`,
      );
    }
  }

  if (subject === "business") {
    const area = labelOf("tax_area", profile);
    if (area) {
      lines.push(
        `현재 사업 세금 영역은 ${area}로 확인되었습니다. 실제 거래·회계자료와 신고내용을 대조할 필요가 있습니다.`,
      );
    }
  }

  const deadline = labelOf("tax_deadline_status", profile);
  if (deadline) {
    lines.push(
      `현재 기한 상태는 ${deadline}으로 확인됩니다. 정확한 신고·납부 기한은 세무기관 자료와 실제 신고기록을 기준으로 확인해야 합니다.`,
    );
  }
  if (
    taxField(profile, "tax_deadline_status") === "overdue" &&
    taxField(profile, "authority_notice_type") === "none"
  ) {
    lines.push(
      "세무기관에서 별도 연락을 받은 상태는 아니므로 현재 정보만으로 긴급 중단을 적용하지 않습니다. 다만 기한이 실제로 지났는지는 우선 확인할 필요가 있습니다.",
    );
  }

  const notice = taxField(profile, "authority_notice_type");
  if (notice === "general_or_registration") {
    lines.push(
      "현재 세무기관에서 받은 내용은 일반 안내·세금번호 관련 연락으로 확인되었습니다. 실제 문서의 내용과 요청사항을 확인한 뒤 현재 세금 문제와 어떻게 연결되는지 판단할 필요가 있습니다.",
    );
  }
  if (notice === "none") {
    lines.push(
      "현재까지 세무기관에서 받은 연락이나 문서는 없는 것으로 확인되었습니다. 따라서 고객이 설명한 세금 문제와 실제 신고·납부자료를 중심으로 확인합니다.",
    );
  }
  if (notice === "suspected_impersonation") {
    lines.push(
      "세무기관을 사칭한 연락이나 납부 요구가 의심되는 경우에는 실제 기관에서 보낸 것인지 먼저 확인해야 합니다. 결과 화면의 사기 VERIFY 버튼을 통해 연락 내용과 관련 증거를 별도로 확인할 수 있습니다.",
    );
  }

  if (subject === "individual" && taxField(profile, "mst_status")) {
    const mst = labelOf("mst_status", profile);
    const passport = labelOf("passport_status", profile);
    lines.push(
      passport
        ? `현재 MST 상태는 ${mst}으로 확인됩니다. 여권 연결 상태는 ${passport}으로 표시하며, 실제 MST와 여권자료를 대조해야 합니다.`
        : `현재 MST 상태는 ${mst}으로 확인됩니다. 실제 MST와 여권자료를 대조해야 합니다.`,
    );
  }

  if (phase2 && subject === "individual" && taxField(profile, "mst_evidence_status")) {
    lines.push(
      `MST 관련 자료는 ${labelOf("mst_evidence_status", profile)}으로 확인됩니다. 실제 여권·MST 자료 또는 신청자료를 대조하여 등록상태와 연결정보를 확인할 필요가 있습니다.`,
    );
  }

  if (phase2 && subject === "individual" && taxField(profile, "income_check_point")) {
    lines.push(
      `현재 확인할 소득 관련 자료는 ${labelOf("income_evidence", profile) || "확인된 자료"}이며, 고객이 확인하려는 부분은 ${labelOf("income_check_point", profile)}입니다. 자료 상태에 따라 실제 소득과 신고·납부 내용을 추가로 대조해야 합니다.`,
    );
  }
  if (phase2 && subject === "individual" && taxField(profile, "evidence_linkage")) {
    lines.push(`자료 연결 상태는 ${labelOf("evidence_linkage", profile)}입니다.`);
  }

  if (phase2 && subject === "business" && taxField(profile, "tax_area") === "vat_invoice") {
    const detail = labelOf("invoice_detail_issue", profile);
    if (detail) {
      lines.push(
        `전자 인보이스의 차이는 ${detail}으로 확인되었습니다. 실제 계약·입금·거래자료와 전자 인보이스를 대조하여 수정 또는 추가 확인이 필요한지 판단합니다.`,
      );
    }
  }

  if (phase2 && subject === "business" && taxField(profile, "tax_area") === "corporate_income") {
    const issue = labelOf("corporate_filing_issue", profile);
    const stage = labelOf("corporate_filing_stage", profile);
    if (issue) {
      lines.push(
        `법인세에서 확인할 부분은 ${issue}이며, 현재 단계는 ${stage || "확인 중"}로 확인됩니다. 실제 회계·신고·납부자료를 함께 확인해야 합니다.`,
      );
    }
  }

  const goal = labelOf("final_goal", profile);
  if (goal) {
    lines.push(
      `이번 검토의 목적은 ${goal}으로 확인되었습니다. 이에 따라 현재 확보된 자료를 기준으로 확인이 필요한 부분과 추가 검토가 필요한 부분을 구분합니다.`,
    );
  }

  if (isStop(profile)) {
    lines.push(
      "세무기관에서 신고·자료 제출 요청 또는 세금·납부 관련 통지를 받은 상태이므로, 요청내용과 대응기한을 우선 확인해야 합니다. 현재 답변만으로 세액이나 납부의무를 단정하지 않으며 전문가 진행으로 연결합니다.",
    );
    lines.push(
      "세무기관에서 받은 문서 자체의 진위·내용·대응이 핵심인 경우에는 결과 화면의 행정문서 VERIFY 버튼을 통해 문서를 별도로 확인할 수 있습니다.",
    );
  }

  const deadlineStatus = taxField(profile, "tax_deadline_status");
  if (deadlineStatus === "near_due" || deadlineStatus === "overdue" || taxField(profile, "urgency") === "high") {
    lines.push(
      "기한 확인이 중요한 상태입니다. 세무기관의 기한 있는 조치가 확인되지 않은 경우에는 즉시 중단하지 않고, 정확한 신고·납부 기한과 현재 처리상태를 우선 확인합니다.",
    );
  }

  if (
    taxField(profile, "final_goal") === "expert_assistance" ||
    isStop(profile) ||
    subject === "unknown"
  ) {
    lines.push(
      "현재 확인된 자료와 상황을 바탕으로 전문가 진행을 선택할 수 있습니다. 전문가 검토에서는 고객이 제공한 신고·납부자료, 세무기관 통지, 소득·거래자료를 기준으로 추가 확인이 필요한 부분을 검토합니다.",
    );
  }

  return lines.filter((line, index) => lines.indexOf(line) === index);
}

function buildResult(
  answers: Record<string, string>,
  phase2: boolean,
): AdminVerifyFirstResultData | null {
  if (!answered(answers, Q1_ID)) return null;
  const profile = buildTaxProfile(answers);
  const sentences = buildSentences(profile, phase2);
  const summary = sentences[0] ?? "확인된 세금 상황을 자료와 함께 대조해야 합니다.";
  const rest = sentences.slice(1);
  const expert = expertLines(profile);
  const caution =
    isStop(profile) ||
    taxField(profile, "authority_notice_type") === "suspected_impersonation" ||
    taxField(profile, "urgency") === "high" ||
    taxField(profile, "tax_subject") === "unknown";
  return {
    stageLabel: phase2 ? "2차 검토" : "1차 검토",
    statusHeadline: summary,
    statusTone: caution ? "caution" : "ok",
    situationSummary: sentences.join(" "),
    gradeFilled: Math.min(5, Math.max(1, expert.length || 1)),
    gradeLabel: "확인된 항목",
    keyMetrics: expert.slice(0, 4).map((title) => ({
      label: "확인",
      title,
      footnote: "답변에서 확인된 내용입니다. 세액이나 납부의무를 단정하지 않습니다.",
      status: caution ? "caution" : "ok",
    })),
    cautions: rest.slice(0, 4),
    unconfirmed: [
      "정확한 신고·납부 기한과 실제 처리 기록은 자료와 함께 확인해야 합니다.",
    ],
    actions: caution
      ? ["확인된 내용을 바탕으로 VFBCAI 전문가팀 검토로 이어갈 수 있습니다."]
      : ["이어서 필요한 자료와 신고·납부 기록을 대조할 수 있습니다."],
    referenceDateLabel: "이번 답변 기준",
    caseClassificationLabel: labelOf("tax_subject", profile) || "세금 검토",
    case06ExpertHandoffRequired:
      isStop(profile) || taxField(profile, "tax_subject") === "unknown" || taxField(profile, "final_goal") === "expert_assistance",
    adminResponseSummaryLines: expert,
    personalizedContext: phase2
      ? {
          integratedSituation: summary,
          phase1Facts: sentences.slice(0, 3),
          phase2Additions: rest.slice(0, 4),
          documentsNeededNote: "가지고 있는 신고·납부 자료와 세무기관 연락 자료를 함께 확인할 수 있습니다.",
          coreJudgment: rest[0] ?? summary,
        }
      : undefined,
  };
}

function contentSlotsFor(answers: Record<string, string>): VerifyMasterContentSlots["firstResult"] {
  const profile = buildTaxProfile(answers);
  const notice = taxField(profile, "authority_notice_type");
  const links: { label: string; targetServiceEntryPath: string }[] = [];
  if (notice === "suspected_impersonation") {
    links.push({ label: "사기 VERIFY", targetServiceEntryPath: "/verify/fraud" });
  }
  if (notice === "filing_document_request" || notice === "tax_payment_or_assessment_notice") {
    links.push({ label: "행정문서 VERIFY", targetServiceEntryPath: "/verify/admin" });
  }
  return {
    firstResultTitle: "세금 1차 종합 결과",
    firstResultIntro: "입력하신 답변을 바탕으로 정리한 1차 세금 검토입니다. 세액이나 납부의무는 단정하지 않습니다.",
    personalizedResultTitle: "세금 2차 개인화 결과",
    personalizedResultIntro: "1차 확인과 추가 답변을 반영한 세금 검토입니다. 세액이나 납부의무는 단정하지 않습니다.",
    paidDetailReviewDescription: "내 상황과 자료를 바탕으로 세금 신고·납부 기록을 더 확인합니다.",
    firstResultCautionsSectionSubtitle: "| 이어서 확인할 포인트",
    firstResultNoRiskTitle: "지금 답변만으로 긴급한 통지 대응은 확인되지 않았습니다",
    firstResultNoRiskBody: "세액이나 납부의무는 단정하지 않으며, 자료와 신고 기록을 함께 확인합니다.",
    serviceLinks: links,
    urgentNotice:
      notice === "suspected_impersonation" ? "확인 전에는 송금이나 개인정보 제공을 보류하세요" : undefined,
    identity: TAX_IDENTITY,
  };
}

const BASE_SLOTS: VerifyMasterContentSlots = {
  identity: TAX_IDENTITY,
  evidence: {
    exampleTags: ["급여명세서", "MST·여권 자료", "전자 인보이스", "법인세 신고 자료", "세무기관 연락"],
    identity: TAX_IDENTITY,
  },
  firstResult: contentSlotsFor({}),
};

export function createTaxVerifyMasterPackBridge(): VerifyMasterPackBridge {
  return {
    buildReviewQuestions(answers, profilePhase: AdminVerifyProfilePhase) {
      const source = profilePhase === 1 ? phase1Questions(answers) : phase2Questions(answers);
      return source.map(toReview);
    },
    isPhase1Complete: isTaxPhase1Complete,
    isPhase2QuestionSetComplete: isTaxPhase2Complete,
    buildFirstResult(answers) {
      return buildResult(answers, false);
    },
    buildPersonalizedResult(answers) {
      if (!isTaxPhase2Complete(answers)) return null;
      return buildResult(answers, true);
    },
    resolveFirstResultTransition(_answers, data) {
      const caution = data.statusTone === "caution";
      return {
        hookHeadline: caution ? "확인이 더 필요한 세금 상황입니다" : "이어서 자료를 대조할 수 있습니다",
        hookWhy: "답변만으로 세액이나 납부의무를 정하지 않기 위해 자료 확인이 이어집니다.",
        hookWho: "신고·납부 기록이나 세무기관 연락을 가진 경우에 이어서 확인할 수 있습니다.",
        hookWhatMore: "MST, 소득 자료, 인보이스 또는 법인세 자료를 함께 볼 수 있습니다.",
        trustLine: "확인된 사실과 고객이 가진 자료를 기준으로 정리합니다.",
      };
    },
    getContentSlots: () => BASE_SLOTS,
    getFirstResultContentSlots(answers) {
      return contentSlotsFor(answers);
    },
    getSignupRiskLevel(answers) {
      const profile = buildTaxProfile(answers);
      if (
        isStop(profile) ||
        taxField(profile, "authority_notice_type") === "suspected_impersonation" ||
        taxField(profile, "tax_subject") === "unknown" ||
        taxField(profile, "urgency") === "high"
      ) {
        return "high";
      }
      if (taxField(profile, "urgency") === "medium") return "medium";
      return "low";
    },
  };
}

export function buildTaxMemberVerifyMeta(
  answers: Record<string, string>,
  file?: { storagePath: string; file_name: string } | null,
): Record<string, unknown> {
  const profile = buildTaxProfile(answers);
  return {
    tax_pack_v1: true,
    ...answers,
    ...profile,
    tax_expert_summary: expertLines(profile).join(" · "),
    ...(file
      ? {
          storagePath: file.storagePath,
          file_name: file.file_name,
          submitted_document: { storagePath: file.storagePath, file_name: file.file_name },
        }
      : {}),
  };
}

const TAX_PACK_CASE_META_KEY = "tax_pack_case_id";
const TAX_PACK_V1_FLAG = "tax_pack_v1";
const TAX_PACK_GRADE2_META_KEY = "tax_pack_grade2";
const TAX_PACK_PHASE2_SUMMARY_META_KEY = "tax_pack_phase2_summary";
const TAX_PACK_CAUTION_COUNT_META_KEY = "tax_pack_caution_count";
const TAX_PACK_HEADLINE_META_KEY = "tax_pack_headline";

/** Q1 선택값. 직접입력은 unknown. 부동산 resolveCaseFromAnswers와 같은 역할. */
export function resolveTaxCaseFromAnswers(answers: Record<string, string>): string {
  const q1 = String(answers[Q1_ID] ?? "");
  if (q1 === "other" || !q1.trim()) return "unknown";
  return q1;
}

function assertTaxPackCaseIdConsistent(answers: Record<string, string>): string {
  const caseId = resolveTaxCaseFromAnswers(answers);
  const fromMeta = answers[TAX_PACK_CASE_META_KEY];
  if (fromMeta && String(fromMeta).trim() && String(fromMeta) !== caseId) {
    throw new Error(
      `pack case_id mismatch: tax_q1→${caseId} vs ${TAX_PACK_CASE_META_KEY}=${fromMeta}`,
    );
  }
  return caseId;
}

function serializeTaxPackAnswers(answers: Record<string, string>): string {
  const payload: Record<string, string> = {};
  for (const [key, val] of Object.entries(answers)) {
    if (val == null) continue;
    const s = String(val).trim();
    if (s) payload[key] = s;
  }
  return JSON.stringify(payload);
}

export function buildTaxPhase2PersistMeta(
  answers: Record<string, string>,
  profilePhase: 1 | 2,
): Record<string, string> {
  const caseId = assertTaxPackCaseIdConsistent(answers);
  const meta: Record<string, string> = {
    [ADMIN_VERIFY_ANSWERS_META_JSON_KEY]: serializeTaxPackAnswers(answers),
    [ADMIN_VERIFY_PROFILE_PHASE_META_KEY]: String(profilePhase),
    [TAX_PACK_V1_FLAG]: "true",
    [TAX_PACK_CASE_META_KEY]: caseId,
  };
  if (profilePhase === 2) {
    const personalized = buildResult(answers, true);
    if (personalized) {
      meta[TAX_PACK_GRADE2_META_KEY] = String(personalized.gradeFilled);
      meta[TAX_PACK_PHASE2_SUMMARY_META_KEY] = personalized.situationSummary ?? "";
      meta[TAX_PACK_CAUTION_COUNT_META_KEY] = String(personalized.cautions?.length ?? 0);
      const headline =
        personalized.statusHeadline?.trim() ||
        personalized.situationSummary?.split(/(?<=[.!?…])\s+/)[0]?.trim() ||
        "";
      if (headline) meta[TAX_PACK_HEADLINE_META_KEY] = headline;
    }
  }
  return meta;
}

export function restoreTaxAnswersFromVerifyMeta(
  meta: Record<string, unknown>,
): Record<string, string> | null {
  const raw = meta[ADMIN_VERIFY_ANSWERS_META_JSON_KEY];
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function buildTaxExpertHandoffMeta(answers: Record<string, string>): Record<string, string> {
  const profile = buildTaxProfile(answers);
  return {
    tax_pack_v1: "true",
    tax_expert_summary: expertLines(profile).join(" · "),
    ...profile,
  };
}
