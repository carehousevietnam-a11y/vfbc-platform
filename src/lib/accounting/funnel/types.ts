export type AccountingFunnelEntryId =
  | "vat_filing_check"
  | "invoice_processing_check"
  | "corp_tax_closing_check";

export const ACCOUNTING_FUNNEL_ENTRY_IDS: AccountingFunnelEntryId[] = [
  "vat_filing_check",
  "invoice_processing_check",
  "corp_tax_closing_check",
];

export type AccountingPackShowIfClause = {
  question_id: string;
  choice_ids: string[];
};

/** Content Pack 문구 슬롯 — Pack 채움 전에는 ko/vi 모두 빈 문자열 */
export type AccountingPackI18nText = {
  ko: string;
  vi: string;
};

export type AccountingPackChoice = {
  id: string;
  label: AccountingPackI18nText;
};

export type AccountingPackQuestion = {
  id: string;
  text: AccountingPackI18nText;
  choices: AccountingPackChoice[];
  allow_direct_input: boolean;
  show_if?: AccountingPackShowIfClause;
  sources: string[];
};

export type AccountingEntryContentPack = {
  entry_id: AccountingFunnelEntryId;
  stage1: AccountingPackQuestion[];
  stage2: AccountingPackQuestion[];
};

export type AccountingFunnelPackBundle = Record<AccountingFunnelEntryId, AccountingEntryContentPack>;

export type AccountingFunnelLanguageNoteKey = "fluent" | "interpreter" | "translator" | "none";

export type AccountingResultWhen = {
  question_id: string;
  choice_id: string;
};

export type AccountingResultVariant = {
  when: AccountingResultWhen;
  summary: string;
  check_items: string[];
  guide: string;
  sources: string[];
};

export type AccountingEntryResultPack = {
  entry_id: AccountingFunnelEntryId;
  variants: AccountingResultVariant[];
  language_notes: Record<AccountingFunnelLanguageNoteKey, string>;
};

export type AccountingFunnelResultBundle = Record<AccountingFunnelEntryId, AccountingEntryResultPack>;

export const ACCOUNTING_FUNNEL_FIRST_RESULT_DISCLAIMER =
  "본 결과는 입력하신 내용을 정리한 것이며 법령 판단이 아닙니다.";
