/**
 * F07 — 옛 slug → v3 canonical slug (읽기·복원·판단·결과 공통).
 * 저장 시 canonicalize는 multi normalize / 단일 필드 라벨 조회 전에 적용.
 */

const GLOBAL_LEGACY: Record<string, string> = {};

function fieldMap(fieldId: string, map: Record<string, string>): void {
  for (const [legacy, canonical] of Object.entries(map)) {
    GLOBAL_LEGACY[`${fieldId}|${legacy}`] = canonical;
  }
}

fieldMap("case01_procedureStageFact", {
  stage_unsure: "stage_unsure_first",
});

fieldMap("case01_spatiotemporalFacet", {
  st_has_records: "st_has_records",
  st_witness_only: "st_witness_only",
  st_memory_only: "st_memory_only",
  st_cannot_verify: "st_cannot_verify",
});

fieldMap("case05_explanationDetail", {
  written: "written_no_receipt",
  verbal: "verbal_no_record",
  both: "both_unverified",
  unsure: "written_no_receipt",
});

fieldMap("case05_factDetail", {
  date_place: "date_place_certain",
  content_differs: "content_differs_clear",
  hard_to_verify: "date_place_fuzzy",
  unsure: "content_differs_vague",
});

fieldMap("case05_appealDetail", {
  filed: "filed_no_schedule",
  preparing: "preparing_deadline_unknown",
  considering: "considering_rules_unread",
  unsure: "considering_rules_unread",
});

fieldMap("case04_unclearFocus", {
  what_submit: "what_submit_list",
  whole_unclear: "what_submit_list",
  why_submit: "why_submit_reason",
  format: "format_how",
  deadline: "what_submit_apply",
  connection: "what_submit_apply",
});

fieldMap("case04_repeatSupplement", {
  more_docs: "more_docs_same_kind",
  more_modify: "more_modify_reject_prior",
  more_explanation: "more_modify_new_field",
  multiple: "more_docs_new_kind",
  not_applicable: "more_docs_same_kind",
});

/** 공개 대응표 (보고용) — fieldId|legacy → canonical */
export function getAdminVerifyChoiceSlugLegacyMap(): Record<string, string> {
  return { ...GLOBAL_LEGACY };
}

export function canonicalizeAdminVerifyChoiceSlug(
  fieldId: string,
  slug: string,
): string {
  if (!slug) return slug;
  return GLOBAL_LEGACY[`${fieldId}|${slug}`] ?? slug;
}

export function canonicalizeAdminVerifyChoiceAnswer(
  fieldId: string,
  raw: string | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    return trimmed;
  }
  return canonicalizeAdminVerifyChoiceSlug(fieldId, trimmed);
}
