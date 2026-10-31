import type { AccountingFunnelPackBundle } from "./types";

/** P7-1 Content Pack 슬롯 — 질문·선택지·결과 문구는 Pack 수신 후 scripts/build-accounting-funnel-pack-data.mjs 로 채웁니다. */
export const ACCOUNTING_FUNNEL_PACKS: AccountingFunnelPackBundle = {
  vat_filing_check: {
    entry_id: "vat_filing_check",
    stage1: [],
    stage2: [],
  },
  invoice_processing_check: {
    entry_id: "invoice_processing_check",
    stage1: [],
    stage2: [],
  },
  corp_tax_closing_check: {
    entry_id: "corp_tax_closing_check",
    stage1: [],
    stage2: [],
  },
};
