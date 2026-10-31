import type { AccountingFunnelEntryId } from "./types";

export type AccountingFunnelEntryMeta = {
  entryId: AccountingFunnelEntryId;
  /** URL path under /verify/accounting */
  routeSegment: string;
  titleKey: `accounting.funnel.entry.${AccountingFunnelEntryId}.title`;
  leadKey: `accounting.funnel.entry.${AccountingFunnelEntryId}.lead`;
};

export const ACCOUNTING_FUNNEL_ENTRIES: AccountingFunnelEntryMeta[] = [
  {
    entryId: "vat_filing_check",
    routeSegment: "vat-filing-check",
    titleKey: "accounting.funnel.entry.vat_filing_check.title",
    leadKey: "accounting.funnel.entry.vat_filing_check.lead",
  },
  {
    entryId: "invoice_processing_check",
    routeSegment: "invoice-processing-check",
    titleKey: "accounting.funnel.entry.invoice_processing_check.title",
    leadKey: "accounting.funnel.entry.invoice_processing_check.lead",
  },
  {
    entryId: "corp_tax_closing_check",
    routeSegment: "corp-tax-closing-check",
    titleKey: "accounting.funnel.entry.corp_tax_closing_check.title",
    leadKey: "accounting.funnel.entry.corp_tax_closing_check.lead",
  },
];

export function accountingFunnelEntryById(
  entryId: AccountingFunnelEntryId,
): AccountingFunnelEntryMeta {
  const found = ACCOUNTING_FUNNEL_ENTRIES.find((e) => e.entryId === entryId);
  if (!found) throw new Error(`unknown accounting funnel entry: ${entryId}`);
  return found;
}

export function accountingFunnelEntryBySegment(
  segment: string,
): AccountingFunnelEntryMeta | undefined {
  return ACCOUNTING_FUNNEL_ENTRIES.find((e) => e.routeSegment === segment);
}

export function accountingFunnelHref(entryId: AccountingFunnelEntryId): string {
  const meta = accountingFunnelEntryById(entryId);
  return `/verify/accounting/${meta.routeSegment}`;
}
