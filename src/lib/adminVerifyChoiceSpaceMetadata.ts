/**
 * §3 선택 공간 메타 — situation형 질문만 (kind: list 제외).
 * 테스트 A/B/C 입력.
 */

export type ChoiceDimensionSpec = {
  id: string;
  values: readonly string[];
};

export type ChoiceInfeasibleCombo = {
  facts: Record<string, string>;
  reason: string;
};

export type ChoiceOptionFactSpec = {
  slug: string;
  facts: Record<string, string>;
  /** Test B — judgment polarity vs slug */
  polarity?: "positive" | "negative" | "neutral";
};

/** Test A — feasible combo not covered by slug; covered only via DI when listed here with reason. */
export type ChoiceDirectInputDelegation = {
  /** `comboKey(facts)` for each intentionally DI-only feasible combo */
  comboKeys: readonly string[];
  reason: string;
};

export type ChoiceSpaceQuestionMeta = {
  fieldId: string;
  dimensions: ChoiceDimensionSpec[];
  infeasible: ChoiceInfeasibleCombo[];
  options: ChoiceOptionFactSpec[];
  /** Explicit DI delegation for uncovered feasible combos (Test A). Empty/absent = fail on gap. */
  directInputDelegations?: readonly ChoiceDirectInputDelegation[];
};

export const ADMIN_VERIFY_CHOICE_SPACE_METADATA: Record<string, ChoiceSpaceQuestionMeta> = {
  case01_noticeDeliveryFact: {
    fieldId: "case01_noticeDeliveryFact",
    dimensions: [{ id: "delivery_channel", values: ["in_person", "phone", "written", "not_yet"] }],
    infeasible: [],
    options: [
      { slug: "del_in_person", facts: { delivery_channel: "in_person" }, polarity: "neutral" },
      { slug: "del_phone_message", facts: { delivery_channel: "phone" }, polarity: "neutral" },
      { slug: "del_written", facts: { delivery_channel: "written" }, polarity: "neutral" },
      { slug: "del_not_received_yet", facts: { delivery_channel: "not_yet" }, polarity: "negative" },
    ],
  },
  case05_explanationDetail: {
    fieldId: "case05_explanationDetail",
    dimensions: [
      { id: "channel", values: ["written", "verbal", "both"] },
      { id: "receipt_or_record", values: ["confirmed", "missing", "unverified"] },
    ],
    infeasible: [],
    options: [
      {
        slug: "written_no_receipt",
        facts: { channel: "written", receipt_or_record: "missing" },
        polarity: "neutral",
      },
      {
        slug: "written_receipt_ok",
        facts: { channel: "written", receipt_or_record: "confirmed" },
        polarity: "positive",
      },
      {
        slug: "verbal_no_record",
        facts: { channel: "verbal", receipt_or_record: "missing" },
        polarity: "neutral",
      },
      {
        slug: "verbal_with_record",
        facts: { channel: "verbal", receipt_or_record: "confirmed" },
        polarity: "positive",
      },
      {
        slug: "both_unverified",
        facts: { channel: "both", receipt_or_record: "unverified" },
        polarity: "negative",
      },
      {
        slug: "both_aligned",
        facts: { channel: "both", receipt_or_record: "confirmed" },
        polarity: "positive",
      },
    ],
  },
  case05_factDetail: {
    fieldId: "case05_factDetail",
    dimensions: [
      { id: "mismatch_kind", values: ["date_place", "content", "vague"] },
      { id: "certainty", values: ["clear", "fuzzy"] },
    ],
    infeasible: [
      {
        facts: { mismatch_kind: "vague", certainty: "clear" },
        reason: "vague mismatch implies low certainty",
      },
    ],
    options: [
      {
        slug: "date_place_certain",
        facts: { mismatch_kind: "date_place", certainty: "clear" },
        polarity: "negative",
      },
      {
        slug: "date_place_fuzzy",
        facts: { mismatch_kind: "date_place", certainty: "fuzzy" },
        polarity: "negative",
      },
      {
        slug: "content_differs_clear",
        facts: { mismatch_kind: "content", certainty: "clear" },
        polarity: "negative",
      },
      {
        slug: "content_differs_vague",
        facts: { mismatch_kind: "content", certainty: "fuzzy" },
        polarity: "negative",
      },
    ],
  },
  case05_appealDetail: {
    fieldId: "case05_appealDetail",
    dimensions: [
      { id: "appeal_stage", values: ["filed", "preparing", "considering"] },
      { id: "schedule_known", values: ["yes", "no", "na"] },
      { id: "receipt_known", values: ["yes", "no", "na"] },
    ],
    infeasible: [
      {
        facts: { appeal_stage: "considering", schedule_known: "yes" },
        reason: "considering stage has no schedule yet",
      },
    ],
    options: [
      {
        slug: "filed_no_schedule",
        facts: { appeal_stage: "filed", schedule_known: "no", receipt_known: "yes" },
        polarity: "neutral",
      },
      {
        slug: "filed_no_receipt",
        facts: { appeal_stage: "filed", schedule_known: "no", receipt_known: "no" },
        polarity: "negative",
      },
      {
        slug: "filed_schedule_known",
        facts: { appeal_stage: "filed", schedule_known: "yes", receipt_known: "yes" },
        polarity: "positive",
      },
      {
        slug: "preparing_deadline_unknown",
        facts: { appeal_stage: "preparing", schedule_known: "no", receipt_known: "na" },
        polarity: "neutral",
      },
      {
        slug: "preparing_deadline_known",
        facts: { appeal_stage: "preparing", schedule_known: "yes", receipt_known: "na" },
        polarity: "neutral",
      },
      {
        slug: "considering",
        facts: { appeal_stage: "considering", schedule_known: "na", receipt_known: "na" },
        polarity: "neutral",
      },
    ],
  },
  case04_unclearFocus: {
    fieldId: "case04_unclearFocus",
    dimensions: [{ id: "unclear_axis", values: ["what", "why", "format", "apply", "where"] }],
    infeasible: [],
    options: [
      { slug: "what_submit_list", facts: { unclear_axis: "what" }, polarity: "negative" },
      { slug: "what_submit_apply", facts: { unclear_axis: "apply" }, polarity: "negative" },
      { slug: "why_submit_reason", facts: { unclear_axis: "why" }, polarity: "negative" },
      { slug: "why_submit_apply", facts: { unclear_axis: "apply" }, polarity: "negative" },
      { slug: "format_how", facts: { unclear_axis: "format" }, polarity: "negative" },
      { slug: "format_where", facts: { unclear_axis: "where" }, polarity: "negative" },
    ],
  },
  case04_repeatSupplement: {
    fieldId: "case04_repeatSupplement",
    dimensions: [{ id: "repeat_kind", values: ["docs_same", "docs_new", "modify_prior", "modify_new"] }],
    infeasible: [],
    options: [
      { slug: "more_docs_same_kind", facts: { repeat_kind: "docs_same" }, polarity: "negative" },
      { slug: "more_docs_new_kind", facts: { repeat_kind: "docs_new" }, polarity: "negative" },
      { slug: "more_modify_reject_prior", facts: { repeat_kind: "modify_prior" }, polarity: "negative" },
      { slug: "more_modify_new_field", facts: { repeat_kind: "modify_new" }, polarity: "negative" },
    ],
  },
};
