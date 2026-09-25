/** Layer G — integrated·judgment slug 정규화 (legacy alias 단일 출구). */

const SLUG_ALIASES: Record<string, Record<string, string>> = {
  case01_customerResponded: {
    none: "no_contact_yet",
    contacted: "has_responded",
    attended: "has_responded",
    resubmitted: "has_responded",
    waiting_response: "has_responded",
    explained_unresolved: "has_responded",
    more_demand: "has_responded",
  },
  case01_deadline: {
    confirmed: "deadline_day_known",
    specific_date: "deadline_day_known",
    known_date: "deadline_day_known",
    not_checked: "no_deadline_stated",
    not_stated: "no_deadline_stated",
    not_advised: "no_deadline_stated",
    unknown: "uncertain",
    unsure: "uncertain",
    asap: "deadline_window_only",
    overdue_concern: "deadline_window_only",
  },
  case02_deadline: {
    confirmed: "deadline_day_known",
    deadline_mentioned: "deadline_window_only",
    not_stated: "no_deadline_stated",
    unsure: "uncertain",
  },
  case03_customerResponse: {
    none: "no_contact_yet",
    not_yet: "no_contact_yet",
  },
  case04_customerResponse: {
    none: "no_contact_yet",
    not_started: "no_contact_yet",
  },
  case05_customerResponse: {
    none: "no_contact_yet",
  },
  case01_factRelationship: {
    partial: "partial_situation",
    mismatch: "info_mismatch",
  },
  case03_factRelationship: {
    mismatch: "partial_core_dispute",
  },
  case04_submissionRelation: {
    mismatch: "not_matching",
  },
  case05_factRelationship: {
    mismatch: "partial_core_dispute",
    partial: "partial_situation",
  },
};

export function effectiveAdminVerifyJudgmentSlug(
  fieldId: string,
  raw: string | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const alias = SLUG_ALIASES[fieldId]?.[raw];
  return alias ?? raw;
}
