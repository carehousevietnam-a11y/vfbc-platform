/**
 * P7c: 메시지 Pack JSON → contentPackData.ts (3건 수정 적용).
 * Run: node scripts/build-accounting-funnel-pack-data.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "src/lib/accounting/funnel/contentPackData.ts");

/** @type {Record<string, unknown>} */
const RAW = {
  vat_filing_check: {
    entry_id: "vat_filing_check",
    stage1: [
      {
        id: "vat_s1_q1",
        text: "베트남 법인의 부가가치세 신고는 지금까지 누가 처리했습니까?",
        choices: [
          { id: "self", text: "제가 자료를 모으고 신고 내용을 직접 확인합니다." },
          { id: "staff", text: "베트남 직원이 처리하고 저는 결과를 보고받습니다." },
          { id: "accountant", text: "외부 회계 담당자가 신고를 처리합니다." },
          { id: "mixed", text: "직원이 자료를 준비하고 외부 회계 담당자가 신고합니다." },
          { id: "unknown", text: "누가 어디까지 처리하는지 정확히 모릅니다." },
        ],
        allow_direct_input: true,
        show_if: null,
        sources: [],
      },
      {
        id: "vat_s1_q2",
        text: "부가가치세 신고와 관련해 실제로 어떤 일이 있었습니까?",
        choices: [
          { id: "normal", text: "신고를 마쳤다는 말을 들었고 별다른 문제는 전달받지 않았습니다." },
          { id: "late", text: "자료 준비나 신고 일정이 늦어진 적이 있습니다." },
          { id: "correction", text: "신고한 뒤 금액이나 거래 내용을 다시 확인하거나 수정한 적이 있습니다." },
          { id: "request", text: "추가 자료를 제출하거나 거래 내용을 설명해 달라는 요청을 받았습니다." },
          { id: "uncertain", text: "신고가 제대로 끝났는지, 어떤 내용으로 신고했는지 잘 모릅니다." },
        ],
        allow_direct_input: true,
        show_if: null,
        sources: [],
      },
      {
        id: "vat_s1_q3",
        text: "세금 신고와 관련된 베트남어 안내나 담당자의 설명을 어떻게 이해합니까?",
        choices: [
          { id: "fluent", text: "베트남어를 읽고 필요한 내용을 직접 이해합니다." },
          { id: "interpreter", text: "옆에서 통역하거나 설명해 주는 사람이 있습니다." },
          { id: "translator", text: "AI나 번역기로 대략 이해하고 중요한 내용은 다시 확인합니다." },
          { id: "none", text: "베트남어를 거의 몰라 안내나 설명을 직접 이해하기 어렵습니다." },
        ],
        allow_direct_input: true,
        show_if: null,
        sources: [],
      },
    ],
    stage2: [
      {
        id: "vat_s2_q1",
        text: "신고를 직접 처리하거나 결과를 확인할 때, 신고가 끝났다는 사실을 무엇으로 확인했습니까?",
        choices: [
          { id: "submission_record", text: "신고 제출이나 접수 사실을 보여 주는 자료를 확인했습니다." },
          { id: "accountant_report", text: "회계 담당자가 보내 준 신고 결과나 보고 내용을 확인했습니다." },
          { id: "staff_message", text: "직원에게 완료했다는 메시지나 설명을 받았습니다." },
          { id: "tax_payment", text: "세금 납부 내역만 확인했습니다." },
          { id: "not_verified", text: "완료했다는 말은 들었지만 직접 확인할 자료가 없습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "vat_s1_q1", choice_ids: ["self", "staff", "accountant", "mixed", "unknown"] },
        sources: [],
      },
      {
        id: "vat_s2_q2",
        text: "자료 준비나 신고 일정이 늦어졌을 때, 실제로 어디에서 문제가 생겼습니까?",
        choices: [
          { id: "missing_invoice", text: "거래 인보이스나 증빙 자료가 제때 모이지 않았습니다." },
          { id: "late_handover", text: "직원이나 회계 담당자에게 자료를 전달하는 과정이 늦어졌습니다." },
          { id: "unclear_request", text: "무슨 자료를 준비해야 하는지 안내를 제대로 이해하지 못했습니다." },
          { id: "no_progress_update", text: "자료를 전달한 뒤 신고 진행 상황을 제때 확인하지 못했습니다." },
          { id: "other_delay", text: "위와 다른 이유로 신고 일정이 늦어졌습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "vat_s1_q2", choice_ids: ["late"] },
        sources: [],
      },
      {
        id: "vat_s2_q3",
        text: "신고한 뒤 금액이나 거래 내용을 다시 확인하거나 수정했다면, 어떤 부분이 달랐습니까?",
        choices: [
          { id: "sales_amount", text: "매출 내역이나 발행한 인보이스의 금액이 달랐습니다." },
          { id: "purchase_amount", text: "매입 내역이나 받은 인보이스의 금액이 달랐습니다." },
          { id: "transaction_records", text: "은행 내역이나 거래 자료와 신고에 반영된 내용이 달랐습니다." },
          { id: "period_difference", text: "거래를 어느 기간에 반영했는지 다시 확인했습니다." },
          { id: "unknown_change", text: "수정했다는 사실만 알고 구체적으로 무엇이 달라졌는지는 모릅니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "vat_s1_q2", choice_ids: ["correction"] },
        sources: [],
      },
      {
        id: "vat_s2_q4",
        text: "추가 자료나 거래 설명을 요청받았다면, 실제로 어떤 상황이었습니까?",
        choices: [
          { id: "invoice_request", text: "특정 거래의 인보이스나 관련 자료를 다시 제출해 달라는 요청이었습니다." },
          { id: "transaction_explanation", text: "매출이나 매입 거래의 내용과 금액을 설명해 달라는 요청이었습니다." },
          { id: "filing_confirmation", text: "신고 내용이나 제출 여부를 다시 확인해 달라는 요청이었습니다." },
          { id: "language_problem", text: "요청을 받았지만 베트남어 설명을 충분히 이해하지 못했습니다." },
          { id: "unknown_request", text: "요청을 받았다는 사실만 알고 구체적인 내용은 모릅니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "vat_s1_q2", choice_ids: ["request"] },
        sources: [],
      },
      {
        id: "vat_s2_q5",
        text: "신고가 제대로 끝났는지 잘 모른다면, 현재 어떤 자료를 가지고 있습니까?",
        choices: [
          { id: "filing_copy", text: "제출한 신고 내용이나 결과를 확인할 수 있는 자료가 있습니다." },
          { id: "accountant_summary", text: "회계 담당자가 정리한 보고서나 메시지만 있습니다." },
          { id: "payment_only", text: "세금 납부 내역은 있지만 신고 내용을 확인할 자료는 없습니다." },
          { id: "partial_documents", text: "일부 자료는 있지만 신고 결과와 연결해서 확인하기 어렵습니다." },
          { id: "no_records", text: "신고 관련 자료가 어디에 있는지 모르거나 가지고 있지 않습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "vat_s1_q2", choice_ids: ["uncertain"] },
        sources: [],
      },
      {
        id: "vat_s2_q6",
        text: "베트남어 안내나 회계 담당자의 설명을 이해하기 어려웠을 때, 실제로 어떻게 확인했습니까?",
        choices: [
          { id: "direct", text: "베트남어를 직접 읽고 내용을 이해했습니다." },
          { id: "interpreter", text: "직원이나 통역 담당자가 내용을 설명해 주었습니다." },
          { id: "translator", text: "AI나 번역기로 대략 번역한 뒤 내용을 확인했습니다." },
          { id: "accountant_korean", text: "회계 담당자에게 한국어로 설명해 달라고 요청했습니다." },
          { id: "not_understood", text: "충분히 이해하지 못해 요청의 의미나 처리 결과를 확인하지 못했습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "vat_s1_q3", choice_ids: ["fluent", "interpreter", "translator", "none"] },
        sources: [],
      },
    ],
  },
  invoice_processing_check: {
    entry_id: "invoice_processing_check",
    stage1: [
      {
        id: "invoice_s1_q1",
        text: "베트남에서 거래할 때 인보이스는 지금까지 누가 챙기고 처리했습니까?",
        choices: [
          { id: "self", text: "제가 인보이스를 확인하고 회계 담당자에게 전달합니다." },
          { id: "staff", text: "베트남 직원이 인보이스를 모아 정리합니다." },
          { id: "accountant", text: "외부 회계 담당자가 인보이스 처리까지 담당합니다." },
          { id: "mixed", text: "직원이 자료를 모으고 외부 회계 담당자가 확인합니다." },
          { id: "unknown", text: "누가 인보이스를 어디까지 처리하는지 정확히 모릅니다." },
        ],
        allow_direct_input: true,
        show_if: null,
        sources: [],
      },
      {
        id: "invoice_s1_q2",
        text: "인보이스를 주고받거나 정리하면서 실제로 어떤 일이 있었습니까?",
        choices: [
          { id: "normal", text: "받고 발행한 인보이스를 모아 정리하고 있습니다." },
          { id: "missing", text: "거래는 있었지만 인보이스를 받지 못했거나 찾지 못한 적이 있습니다." },
          { id: "mismatch", text: "인보이스의 거래처나 금액이 다른 자료와 맞지 않은 적이 있습니다." },
          { id: "late", text: "인보이스를 늦게 받거나 회계 담당자에게 늦게 전달한 적이 있습니다." },
          { id: "unclear", text: "인보이스가 제대로 처리됐는지 확인하지 못한 적이 있습니다." },
        ],
        allow_direct_input: true,
        show_if: null,
        sources: [],
      },
      {
        id: "invoice_s1_q3",
        text: "인보이스에 적힌 베트남어 내용이나 담당자의 설명은 어떻게 이해합니까?",
        choices: [
          { id: "fluent", text: "베트남어를 읽고 거래 내용을 직접 이해합니다." },
          { id: "interpreter", text: "옆에서 통역하거나 설명해 주는 사람이 있습니다." },
          { id: "translator", text: "AI나 번역기로 대략 이해하고 중요한 부분은 다시 확인합니다." },
          { id: "none", text: "베트남어를 거의 몰라 인보이스 내용을 직접 확인하기 어렵습니다." },
        ],
        allow_direct_input: true,
        show_if: null,
        sources: [],
      },
    ],
    stage2: [
      {
        id: "invoice_s2_q1",
        text: "인보이스를 직접 챙기거나 담당자에게 전달할 때, 자료는 주로 어디에 보관합니까?",
        choices: [
          { id: "system", text: "회계 프로그램이나 회사 시스템에 등록합니다." },
          { id: "spreadsheet", text: "엑셀이나 표에 거래 내역과 인보이스를 정리합니다." },
          { id: "email_chat", text: "이메일이나 메신저로 받은 파일을 모아 전달합니다." },
          { id: "paper", text: "종이 인보이스나 출력물을 중심으로 관리합니다." },
          { id: "scattered", text: "파일, 메시지, 종이 자료가 여러 곳에 흩어져 있습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "invoice_s1_q1", choice_ids: ["self", "staff", "accountant", "mixed", "unknown"] },
        sources: [],
      },
      {
        id: "invoice_s2_q2",
        text: "거래는 있었지만 인보이스를 받지 못했거나 찾지 못했다면, 실제로 어떤 상황입니까?",
        choices: [
          { id: "supplier_not_sent", text: "거래처가 인보이스를 보내 주지 않았습니다." },
          { id: "cannot_find", text: "받았던 인보이스를 회사 자료에서 찾지 못했습니다." },
          { id: "wrong_recipient", text: "다른 직원이나 담당자가 인보이스를 받은 것으로 보입니다." },
          { id: "language_unclear", text: "베트남어 안내를 이해하지 못해 발급이나 전달 상황을 확인하지 못했습니다." },
          { id: "unknown", text: "인보이스가 없는 이유를 아직 확인하지 못했습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "invoice_s1_q2", choice_ids: ["missing"] },
        sources: [],
      },
      {
        id: "invoice_s2_q3",
        text: "인보이스의 거래처나 금액이 다른 자료와 맞지 않았다면, 어떤 부분이 달랐습니까?",
        choices: [
          { id: "company", text: "인보이스에 적힌 회사명이나 거래처 정보가 달랐습니다." },
          { id: "amount", text: "인보이스 금액과 계약서나 지급 내역이 달랐습니다." },
          { id: "description", text: "인보이스에 적힌 거래 내용과 실제 거래 내용이 달랐습니다." },
          { id: "date", text: "인보이스 날짜와 실제 거래나 지급 시점이 달랐습니다." },
          { id: "unknown", text: "차이가 있다는 말은 들었지만 구체적인 항목은 모릅니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "invoice_s1_q2", choice_ids: ["mismatch"] },
        sources: [],
      },
      {
        id: "invoice_s2_q4",
        text: "인보이스를 늦게 받거나 늦게 전달했다면, 주로 어디에서 시간이 지체됐습니까?",
        choices: [
          { id: "supplier_delay", text: "거래처가 인보이스를 늦게 보내 주었습니다." },
          { id: "internal_collection", text: "회사 내부에서 거래 자료를 모으는 데 시간이 걸렸습니다." },
          { id: "handover", text: "직원과 회계 담당자 사이에서 자료 전달이 늦어졌습니다." },
          { id: "language", text: "베트남어 요청이나 안내를 이해하는 데 시간이 걸렸습니다." },
          { id: "unknown", text: "어디에서 지체됐는지 정확히 확인하지 못했습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "invoice_s1_q2", choice_ids: ["late"] },
        sources: [],
      },
      {
        id: "invoice_s2_q5",
        text: "인보이스가 제대로 처리됐는지 확인하지 못했다면, 현재 무엇을 확인할 수 있습니까?",
        choices: [
          { id: "registered", text: "인보이스 파일과 회계 자료 등록 여부를 확인할 수 있습니다." },
          { id: "file_only", text: "인보이스 파일은 있지만 회계 자료에 반영됐는지는 모릅니다." },
          { id: "summary_only", text: "회계 담당자의 정리표만 있고 원본 인보이스는 찾기 어렵습니다." },
          { id: "message_only", text: "처리했다는 메시지나 구두 설명만 있습니다." },
          { id: "no_access", text: "인보이스와 회계 자료를 어디에서 확인해야 하는지 모릅니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "invoice_s1_q2", choice_ids: ["unclear"] },
        sources: [],
      },
      {
        id: "invoice_s2_q6",
        text: "인보이스의 베트남어 내용을 직접 이해하기 어려울 때, 실제로 어떻게 확인했습니까?",
        choices: [
          { id: "colleague", text: "베트남 직원이나 동료에게 내용을 설명해 달라고 했습니다." },
          { id: "accountant", text: "회계 담당자에게 인보이스 내용을 확인해 달라고 했습니다." },
          { id: "translator", text: "AI나 번역기로 내용을 대략 번역했습니다." },
          { id: "interpreter", text: "통역 담당자가 내용을 설명해 주었습니다." },
          { id: "not_checked", text: "내용을 충분히 이해하지 못해 별도로 확인하지 못했습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "invoice_s1_q3", choice_ids: ["fluent", "interpreter", "translator", "none"] },
        sources: [],
      },
    ],
  },
  corp_tax_closing_check: {
    entry_id: "corp_tax_closing_check",
    stage1: [
      {
        id: "corp_s1_q1",
        text: "베트남 법인의 회계 장부와 연말 결산은 지금까지 누가 챙겼습니까?",
        choices: [
          { id: "self", text: "제가 자료를 모으고 결산 결과를 직접 확인했습니다." },
          { id: "staff", text: "베트남 직원이 장부와 결산 자료를 정리했습니다." },
          { id: "accountant", text: "외부 회계 담당자가 장부와 결산을 처리했습니다." },
          { id: "mixed", text: "직원이 자료를 준비하고 외부 회계 담당자가 결산을 진행했습니다." },
          { id: "unknown", text: "장부와 결산을 누가 어디까지 처리하는지 정확히 모릅니다." },
        ],
        allow_direct_input: true,
        show_if: null,
        sources: [],
      },
      {
        id: "corp_s1_q2",
        text: "법인세 결산과 관련해 실제로 어떤 일이 있었습니까?",
        choices: [
          { id: "completed", text: "결산이 끝났다는 보고를 받고 결과 자료를 확인했습니다." },
          { id: "delay", text: "결산 자료 준비나 결과 확인이 늦어진 적이 있습니다." },
          { id: "difference", text: "장부와 은행 내역 또는 거래 자료 사이에 차이가 있다는 말을 들었습니다." },
          { id: "request", text: "회계 담당자로부터 추가 자료나 거래 설명을 요청받았습니다." },
          { id: "unknown", text: "결산이 어디까지 진행됐고 무엇이 끝났는지 정확히 모릅니다." },
        ],
        allow_direct_input: true,
        show_if: null,
        sources: [],
      },
      {
        id: "corp_s1_q3",
        text: "결산 자료나 회계 담당자의 베트남어 설명은 어떻게 이해합니까?",
        choices: [
          { id: "fluent", text: "베트남어를 읽고 필요한 내용을 직접 이해합니다." },
          { id: "interpreter", text: "옆에서 통역하거나 설명해 주는 사람이 있습니다." },
          { id: "translator", text: "AI나 번역기로 대략 이해하고 중요한 내용은 다시 확인합니다." },
          { id: "none", text: "베트남어를 거의 몰라 결산 자료나 설명을 직접 이해하기 어렵습니다." },
        ],
        allow_direct_input: true,
        show_if: null,
        sources: [],
      },
    ],
    stage2: [
      {
        id: "corp_s2_q1",
        text: "장부와 결산을 직접 챙기거나 결과를 확인할 때, 회사 거래 자료는 주로 어디에 있습니까?",
        choices: [
          { id: "accounting_system", text: "회계 프로그램에 거래 내역이 정리되어 있습니다." },
          { id: "spreadsheet", text: "엑셀이나 표로 거래 내역을 정리합니다." },
          { id: "bank_invoice", text: "은행 거래 내역과 인보이스를 따로 모아 확인합니다." },
          { id: "accountant_records", text: "외부 회계 담당자가 보관한 장부와 자료에 의존합니다." },
          { id: "scattered", text: "자료가 여러 곳에 흩어져 있어 전체 내역을 한 번에 확인하기 어렵습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "corp_s1_q1", choice_ids: ["self", "staff", "accountant", "mixed", "unknown"] },
        sources: [],
      },
      {
        id: "corp_s2_q2",
        text: "결산 자료 준비나 결과 확인이 늦어졌다면, 실제로 어떤 상황이 있었습니까?",
        choices: [
          { id: "missing_records", text: "매출, 매입 또는 비용 자료가 모두 모이지 않았습니다." },
          { id: "bank_reconciliation", text: "은행 거래 내역과 장부를 대조하는 데 시간이 걸렸습니다." },
          { id: "invoice_delay", text: "인보이스나 거래 증빙을 늦게 받거나 찾지 못했습니다." },
          { id: "accountant_followup", text: "회계 담당자에게 진행 상황을 여러 번 확인해야 했습니다." },
          { id: "language_delay", text: "베트남어 요청과 설명을 이해하는 데 시간이 걸렸습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "corp_s1_q2", choice_ids: ["delay"] },
        sources: [],
      },
      {
        id: "corp_s2_q3",
        text: "장부와 은행 내역 또는 거래 자료 사이에 차이가 있었다면, 어떤 차이였습니까?",
        choices: [
          { id: "bank_amount", text: "은행 입출금 금액과 장부에 기록된 금액이 달랐습니다." },
          { id: "missing_transaction", text: "은행 내역에는 있지만 장부에서 찾지 못한 거래가 있었습니다." },
          { id: "expense_evidence", text: "비용으로 기록된 거래의 인보이스나 증빙을 찾지 못했습니다." },
          { id: "customer_supplier", text: "거래처별 매출이나 매입 내역이 다른 자료와 맞지 않았습니다." },
          { id: "unknown_difference", text: "차이가 있다는 말만 들었고 구체적인 내용은 확인하지 못했습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "corp_s1_q2", choice_ids: ["difference"] },
        sources: [],
      },
      {
        id: "corp_s2_q4",
        text: "회계 담당자가 추가 자료나 거래 설명을 요청했다면, 어떤 자료를 요청했습니까?",
        choices: [
          { id: "bank", text: "은행 거래 내역이나 입출금 관련 자료를 요청했습니다." },
          { id: "invoices", text: "매출이나 매입 인보이스와 관련 증빙을 요청했습니다." },
          { id: "contracts", text: "계약서, 주문 내역 또는 거래 내용을 확인할 자료를 요청했습니다." },
          { id: "expenses", text: "비용으로 처리한 지출의 영수증이나 관련 자료를 요청했습니다." },
          { id: "unclear", text: "요청을 받았지만 정확히 어떤 자료가 필요한지 이해하지 못했습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "corp_s1_q2", choice_ids: ["request"] },
        sources: [],
      },
      {
        id: "corp_s2_q5",
        text: "결산이 어디까지 진행됐는지 정확히 모른다면, 현재 어떤 자료를 가지고 있습니까?",
        choices: [
          { id: "closing_report", text: "결산 결과 보고서나 정리된 재무 자료가 있습니다." },
          { id: "ledger", text: "장부나 거래 내역 자료가 있습니다." },
          { id: "filing_evidence", text: "세금 신고나 납부와 관련된 확인 자료가 일부 있습니다." },
          { id: "messages", text: "회계 담당자와 주고받은 메시지나 이메일만 있습니다." },
          { id: "no_records", text: "결산 자료가 어디에 있는지 모르거나 확인할 자료가 거의 없습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "corp_s1_q2", choice_ids: ["unknown"] },
        sources: [],
      },
      {
        id: "corp_s2_q6",
        text: "결산 자료의 베트남어 내용이나 회계 담당자의 설명을 실제로 어떻게 확인했습니까?",
        choices: [
          { id: "direct", text: "베트남어를 직접 읽고 내용을 이해했습니다." },
          { id: "interpreter", text: "직원이나 통역 담당자가 내용을 설명해 주었습니다." },
          { id: "translator", text: "AI나 번역기로 대략 번역한 뒤 내용을 확인했습니다." },
          { id: "accountant_korean", text: "회계 담당자에게 한국어로 설명해 달라고 요청했습니다." },
          { id: "not_understood", text: "설명을 충분히 이해하지 못해 자료의 의미를 확인하지 못했습니다." },
        ],
        allow_direct_input: true,
        show_if: { question_id: "corp_s1_q3", choice_ids: ["fluent", "interpreter", "translator", "none"] },
        sources: [],
      },
    ],
  },
};

const REMOVE_STAGE2 = new Set(["vat_s2_q6", "invoice_s2_q6", "corp_s2_q6"]);
const TEXT_PATCH = {
  vat_s1_q1: "베트남 법인의 부가가치세 신고는 보통 누가 처리합니까?",
  invoice_s1_q1: "베트남에서 거래할 때 인보이스는 보통 누가 챙기고 처리합니까?",
};

function normalizeQuestion(q) {
  if (TEXT_PATCH[q.id]) q = { ...q, text: TEXT_PATCH[q.id] };
  const out = {
    id: q.id,
    text: q.text,
    choices: q.choices.map((c) => ({ id: c.id, label: c.text })),
    allow_direct_input: q.allow_direct_input,
    sources: q.sources,
  };
  if (q.show_if && typeof q.show_if === "object" && q.show_if.question_id) {
    out.show_if = q.show_if;
  }
  return out;
}

function normalizeEntry(entry) {
  return {
    entry_id: entry.entry_id,
    stage1: entry.stage1.map(normalizeQuestion),
    stage2: entry.stage2.filter((q) => !REMOVE_STAGE2.has(q.id)).map(normalizeQuestion),
  };
}

const bundle = {
  vat_filing_check: normalizeEntry(RAW.vat_filing_check),
  invoice_processing_check: normalizeEntry(RAW.invoice_processing_check),
  corp_tax_closing_check: normalizeEntry(RAW.corp_tax_closing_check),
};

const header = `// Generated by scripts/build-accounting-funnel-pack-data.mjs — do not edit by hand.
import type { AccountingFunnelPackBundle } from "./types";

export const ACCOUNTING_FUNNEL_PACKS: AccountingFunnelPackBundle = `;

fs.writeFileSync(outPath, `${header}${JSON.stringify(bundle, null, 2)} as const satisfies AccountingFunnelPackBundle;\n`, "utf8");
console.log("wrote", outPath);
