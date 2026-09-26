/**
 * Layer J judgment clause polarity tags (Test B).
 * Same vocabulary as choice-space metadata polarity — not inferred from clause text.
 */
export type LayerJClausePolarityTag = "positive" | "negative" | "neutral";

const O2 = "§03·2차";

function k(caseCode: string, fieldId: string, slug: string): string {
  return `${caseCode}|${O2}|${fieldId}|${slug}`;
}

/** Explicit slug → judgment polarity for §3 choice-space audit fields. */
export const LAYER_J_CHOICE_SPACE_CLAUSE_POLARITY: Record<string, LayerJClausePolarityTag> = {
  [k("01", "case01_noticeDeliveryFact", "del_in_person")]: "neutral",
  [k("01", "case01_noticeDeliveryFact", "del_phone_message")]: "neutral",
  [k("01", "case01_noticeDeliveryFact", "del_written")]: "neutral",
  [k("01", "case01_noticeDeliveryFact", "del_not_received_yet")]: "negative",

  [k("04", "case04_unclearFocus", "what_submit_list")]: "negative",
  [k("04", "case04_unclearFocus", "what_submit_apply")]: "negative",
  [k("04", "case04_unclearFocus", "why_submit_reason")]: "negative",
  [k("04", "case04_unclearFocus", "format_how")]: "negative",
  [k("04", "case04_unclearFocus", "format_where")]: "negative",

  [k("04", "case04_repeatSupplement", "more_docs_same_kind")]: "negative",
  [k("04", "case04_repeatSupplement", "more_docs_new_kind")]: "negative",
  [k("04", "case04_repeatSupplement", "more_modify_reject_prior")]: "negative",
  [k("04", "case04_repeatSupplement", "more_modify_new_field")]: "negative",

  [k("05", "case05_explanationDetail", "written_no_receipt")]: "neutral",
  [k("05", "case05_explanationDetail", "written_receipt_ok")]: "positive",
  [k("05", "case05_explanationDetail", "verbal_no_record")]: "neutral",
  [k("05", "case05_explanationDetail", "verbal_with_record")]: "positive",
  [k("05", "case05_explanationDetail", "both_unverified")]: "negative",
  [k("05", "case05_explanationDetail", "both_aligned")]: "positive",

  [k("05", "case05_factDetail", "date_place_certain")]: "negative",
  [k("05", "case05_factDetail", "date_place_fuzzy")]: "negative",
  [k("05", "case05_factDetail", "content_differs_clear")]: "negative",
  [k("05", "case05_factDetail", "content_differs_vague")]: "negative",

  [k("05", "case05_appealDetail", "filed_no_schedule")]: "neutral",
  [k("05", "case05_appealDetail", "filed_no_receipt")]: "negative",
  [k("05", "case05_appealDetail", "filed_schedule_known")]: "positive",
  [k("05", "case05_appealDetail", "preparing_deadline_unknown")]: "neutral",
  [k("05", "case05_appealDetail", "preparing_deadline_known")]: "neutral",
  [k("05", "case05_appealDetail", "considering_rules_unread")]: "neutral",
  [k("05", "case05_appealDetail", "considering_rules_read")]: "neutral",
  [k("05", "case05_appealDetail", "considering")]: "neutral",

  [k("05", "case05_authorityFollowUp", "changed")]: "positive",
  [k("05", "case05_authorityFollowUp", "wants_more")]: "negative",
};
