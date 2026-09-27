/**
 * F07 / F03 — legacy slug 정책 (단일 출구).
 * - 저장 시 canonicalize: CANONICALIZE_ON_SAVE 만
 * - 판단·신호: JUDGMENT_SUPPRESSED_LEGACY → skip
 * - 요약·라벨: LEGACY_CHOICE_LABELS 원문 표시
 */
import {
  CASE04_AUTHORITY_FOLLOWUP_LEGACY_TO_CANONICAL,
  CASE04_EVIDENCE_LEGACY_TO_CANONICAL,
  CASE04_LEGACY_AUTHORITY_FOLLOWUP_LABELS,
  CASE04_LEGACY_EVIDENCE_LABELS,
  CASE04_LEGACY_UNCLEAR_FOCUS_LABELS,
  CASE04_UNCLEAR_FOCUS_LEGACY_TO_CANONICAL,
} from "./adminVerifyCase04ChoiceFinalV3";
import {
  CASE05_APPEAL_DETAIL_LEGACY_TO_CANONICAL,
  CASE05_AUTHORITY_FOLLOWUP_LEGACY_TO_CANONICAL,
  CASE05_BLOCKAGE_LEGACY_TO_CANONICAL,
  CASE05_DISPOSITION_REASON_LEGACY_TO_CANONICAL,
  CASE05_EVIDENCE_LEGACY_TO_CANONICAL,
  CASE05_FINAL_GOAL_LEGACY_TO_CANONICAL,
  CASE05_LEGACY_DISPOSITION_REASON_LABELS,
  CASE05_LEGACY_EXPLANATION_DETAIL_LABELS,
  CASE05_LEGACY_APPEAL_DETAIL_LABELS,
  CASE05_LEGACY_AUTHORITY_FOLLOWUP_LABELS,
  CASE05_LEGACY_BLOCKAGE_LABELS,
  CASE05_LEGACY_EVIDENCE_LABELS,
  CASE05_LEGACY_FINAL_GOAL_LABELS,
} from "./adminVerifyCase05ChoiceFinalV2";

const CANONICALIZE_ON_SAVE: Record<string, Record<string, string>> = {
  case01_noticeDeliveryFact: {
    del_written_only: "del_written",
    del_written_read: "del_written",
  },
  case05_authorityFollowUp: CASE05_AUTHORITY_FOLLOWUP_LEGACY_TO_CANONICAL,
  case05_appealDetail: CASE05_APPEAL_DETAIL_LEGACY_TO_CANONICAL,
  case05_blockage: CASE05_BLOCKAGE_LEGACY_TO_CANONICAL,
  case05_dispositionReason: CASE05_DISPOSITION_REASON_LEGACY_TO_CANONICAL,
  case05_evidence: CASE05_EVIDENCE_LEGACY_TO_CANONICAL,
  case05_finalGoal: CASE05_FINAL_GOAL_LEGACY_TO_CANONICAL,
  case04_unclearFocus: CASE04_UNCLEAR_FOCUS_LEGACY_TO_CANONICAL,
  case04_authorityFollowUp: CASE04_AUTHORITY_FOLLOWUP_LEGACY_TO_CANONICAL,
  case04_evidence: CASE04_EVIDENCE_LEGACY_TO_CANONICAL,
  case03_authorityFollowUp: { re_attendance: "more_explanation", unsure: "no_response" },
  case03_prepRequired: { unsure: "unknown" },
  case03_evidence: { unsure: "none" },
};

/** 판단 문장·Profile 신호에 쓰지 않음 — 응답 요약에만 원문 라벨 */
const JUDGMENT_SUPPRESSED_LEGACY = new Set<string>([
  "case05_explanationDetail|unsure",
  "case05_factDetail|unsure",
  "case05_factDetail|hard_to_verify",
  "case05_appealDetail|unsure",
  "case05_authorityFollowUp|payment_demand",
  "case05_blockage|deadline",
  "case05_blockage|unsure",
  "case05_evidence|contract",
  "case05_evidence|unsure",
  "case05_finalGoal|expert",
  "case05_finalGoal|unsure",
  "case05_explanationDetail|both_unverified",
  "case04_unclearFocus|deadline",
  "case04_unclearFocus|connection",
  "case04_unclearFocus|whole_unclear",
  "case04_repeatSupplement|more_explanation",
  "case04_repeatSupplement|multiple",
  "case04_repeatSupplement|not_applicable",
  "case03_repeatFollowUp|not_applicable",
]);

/** 분기·신호용 — 저장값을 새 slug로 바꾸지 않고, equals 시 양쪽 인정 */
const BRANCH_EQUIVALENT_ALIASES: Record<string, Record<string, string[]>> = {
  case05_explanationDetail: {
    written_no_receipt: ["written"],
    written_receipt_ok: ["written"],
    verbal_no_record: ["verbal"],
    verbal_with_record: ["verbal"],
    both_unverified: ["both"],
    both_aligned: ["both"],
  },
  case05_factDetail: {
    date_place_certain: ["date_place"],
    content_differs_clear: ["content_differs"],
  },
  case05_appealDetail: {
    filed_no_schedule: ["filed"],
    filed_no_receipt: ["filed"],
    filed_schedule_known: ["filed"],
    preparing_deadline_unknown: ["preparing", "preparing_deadline_known"],
    preparing_deadline_known: ["preparing"],
    considering: ["considering_rules_unread", "considering_rules_read"],
  },
  case05_authorityFollowUp: {
    changed: ["modified", "revoked"],
    wants_more: ["more_docs", "attendance_explanation"],
    no_response: ["under_review"],
  },
  case05_dispositionReason: {
    no_clear_reason: ["unsure"],
  },
  case05_blockage: {
    what_to_do: ["appeal_method", "evidence"],
  },
  case05_evidence: {
    submitted_docs: ["payment_proof"],
  },
  case05_finalGoal: {
    what_to_do: ["evidence"],
  },
  case04_unclearFocus: {
    what_submit_list: ["what_submit"],
    what_submit_apply: ["deadline", "connection", "why_submit_apply"],
    why_submit_reason: ["why_submit"],
    format_how: ["format"],
  },
  case04_authorityFollowUp: {
    accepted: ["awaiting_review"],
    more_supplement: ["more_docs"],
  },
  case04_evidence: {
    none: ["unsure"],
  },
  case03_authorityFollowUp: {
    more_explanation: ["re_attendance"],
    no_response: ["unsure"],
  },
  case03_prepRequired: {
    unknown: ["unsure"],
  },
  case03_evidence: {
    none: ["unsure"],
  },
  case04_repeatSupplement: {
    more_docs_same_kind: ["more_docs"],
    more_modify_reject_prior: ["more_modify"],
  },
};

const LEGACY_CHOICE_LABELS: Record<string, string> = {
  "case03_authorityFollowUp|re_attendance": "다시 방문하거나 출석하라고 안내했습니다.",
  "case03_authorityFollowUp|unsure": "받은 안내를 정확히 이해하기 어렵습니다.",
  "case03_prepRequired|unsure": "준비해야 할 것을 정확히 모르겠습니다.",
  "case03_evidence|unsure": "지금 확인할 수 있는 자료가 있는지 아직 확인하지 못했습니다.",
  "case03_repeatFollowUp|not_applicable": "반복 요구는 없었거나 아직 확인하지 못했습니다.",
  "case05_explanationDetail|unsure":
    "제출한 소명·의견의 형태를 정확히 구분하기 어렵습니다.",
  "case05_explanationDetail|written": "서면으로 소명·의견을 제출했습니다",
  "case05_explanationDetail|verbal": "전화·방문 등으로 설명했습니다",
  "case05_explanationDetail|both": "서면과 구두 설명을 함께 했습니다",
  "case05_factDetail|date_place": "날짜·장소·상황이 다릅니다",
  "case05_factDetail|content_differs": "내용·사실관계가 다릅니다",
  "case05_factDetail|hard_to_verify": "그때 상황을 확인하기 어렵습니다",
  "case05_factDetail|unsure":
    "실제 상황과 처분 사유의 차이를 정확히 말하기 어렵습니다.",
  "case05_appealDetail|filed": "이의제기·재검토를 신청했습니다",
  "case05_appealDetail|preparing": "신청을 준비하고 있습니다",
  "case05_appealDetail|considering": "신청 여부를 검토하고 있습니다",
  "case05_appealDetail|unsure":
    "이의제기·재검토 신청 상태를 정확히 확인하지 못했습니다.",
  ...Object.fromEntries(
    Object.entries(CASE05_LEGACY_AUTHORITY_FOLLOWUP_LABELS).map(([slug, label]) => [
      `case05_authorityFollowUp|${slug}`,
      label,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CASE05_LEGACY_BLOCKAGE_LABELS).map(([slug, label]) => [
      `case05_blockage|${slug}`,
      label,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CASE05_LEGACY_EVIDENCE_LABELS).map(([slug, label]) => [
      `case05_evidence|${slug}`,
      label,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CASE05_LEGACY_FINAL_GOAL_LABELS).map(([slug, label]) => [
      `case05_finalGoal|${slug}`,
      label,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CASE05_LEGACY_APPEAL_DETAIL_LABELS).map(([slug, label]) => [
      `case05_appealDetail|${slug}`,
      label,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CASE05_LEGACY_DISPOSITION_REASON_LABELS).map(([slug, label]) => [
      `case05_dispositionReason|${slug}`,
      label,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CASE05_LEGACY_EXPLANATION_DETAIL_LABELS).map(([slug, label]) => [
      `case05_explanationDetail|${slug}`,
      label,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CASE04_LEGACY_UNCLEAR_FOCUS_LABELS).map(([slug, label]) => [
      `case04_unclearFocus|${slug}`,
      label,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CASE04_LEGACY_AUTHORITY_FOLLOWUP_LABELS).map(([slug, label]) => [
      `case04_authorityFollowUp|${slug}`,
      label,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CASE04_LEGACY_EVIDENCE_LABELS).map(([slug, label]) => [
      `case04_evidence|${slug}`,
      label,
    ]),
  ),
  "case04_unclearFocus|what_submit": "무엇을 제출해야 하는지",
  "case04_unclearFocus|why_submit": "왜 제출해야 하는지",
  "case04_unclearFocus|format": "어떤 형식이어야 하는지",
  "case04_unclearFocus|deadline": "언제까지 제출해야 하는지",
  "case04_unclearFocus|connection": "기존 제출 내용과 어떻게 연결되는지",
  "case04_unclearFocus|whole_unclear": "전체 요구가 이해되지 않음",
  "case04_repeatSupplement|more_docs": "추가 서류를 다시 요구했습니다",
  "case04_repeatSupplement|more_modify": "수정/보완을 다시 요구했습니다",
  "case04_repeatSupplement|more_explanation": "추가 설명을 다시 요구했습니다",
  "case04_repeatSupplement|multiple": "여러 가지를 다시 요구했습니다",
  "case04_repeatSupplement|not_applicable": "해당 없음 / 아직 모름",
  "case01_noticeDeliveryFact|del_written_only":
    "문서·서면만 받았고, 내용은 일부만 이해했습니다.",
  "case01_noticeDeliveryFact|del_written_read":
    "문서·서면을 받았고, 요지는 읽었습니다.",
};

export type LegacySlugPolicyRow = {
  legacy: string;
  policy: "1:1 동일" | "원문 표시로 처리";
  note?: string;
};

/** F03 보고용 — fieldId별 legacy 정책 */
export function getLegacySlugPolicyReport(fieldId: string): LegacySlugPolicyRow[] {
  const rows: LegacySlugPolicyRow[] = [];
  const add = (legacy: string, policy: LegacySlugPolicyRow["policy"], note?: string) => {
    rows.push({ legacy, policy, note });
  };

  if (fieldId === "case01_noticeDeliveryFact") {
    add("del_written_only", "1:1 동일", "→ del_written");
    add("del_written_read", "1:1 동일", "→ del_written");
  }
  if (fieldId === "case05_explanationDetail") {
    add("written", "1:1 동일", "판단·신호: 접수 여부 미언급");
    add("verbal", "1:1 동일", "판단·신호: 기록 여부 미언급");
    add("both", "1:1 동일", "판단·신호: 일치 검증 미언급");
    add("unsure", "원문 표시로 처리");
  }
  if (fieldId === "case05_factDetail") {
    add("date_place", "1:1 동일", "→ date_place_certain");
    add("content_differs", "1:1 동일", "→ content_differs_clear");
    add("hard_to_verify", "원문 표시로 처리");
    add("unsure", "원문 표시로 처리");
  }
  if (fieldId === "case05_appealDetail") {
    add("filed", "1:1 동일", "판단·신호: 일정·접수 세부 미언급");
    add("preparing", "1:1 동일", "판단·신호: 기한 인지 미언급");
    add("considering", "1:1 동일", "판단·신호: 요건 읽음 미언급");
    add("considering_rules_unread", "1:1 동일", "→ considering");
    add("considering_rules_read", "1:1 동일", "→ considering");
    add("unsure", "원문 표시로 처리");
  }
  if (fieldId === "case05_authorityFollowUp") {
    add("modified", "1:1 동일", "→ changed");
    add("revoked", "1:1 동일", "→ changed");
    add("more_docs", "1:1 동일", "→ wants_more");
    add("attendance_explanation", "1:1 동일", "→ wants_more");
    add("payment_demand", "원문 표시로 처리");
  }
  if (fieldId === "case05_blockage") {
    add("appeal_method", "1:1 동일", "→ what_to_do");
    add("deadline", "원문 표시로 처리");
    add("unsure", "원문 표시로 처리");
  }
  if (fieldId === "case05_evidence") {
    add("contract", "원문 표시로 처리");
    add("unsure", "원문 표시로 처리");
  }
  if (fieldId === "case05_finalGoal") {
    add("expert", "원문 표시로 처리");
    add("unsure", "원문 표시로 처리");
  }
  if (fieldId === "case04_unclearFocus") {
    add("what_submit", "1:1 동일", "→ what_submit_list");
    add("why_submit", "1:1 동일", "→ why_submit_reason");
    add("why_submit_apply", "1:1 동일", "→ what_submit_apply");
    add("format", "1:1 동일", "→ format_how");
    add("deadline", "원문 표시로 처리");
    add("connection", "원문 표시로 처리");
    add("whole_unclear", "원문 표시로 처리");
  }
  if (fieldId === "case04_authorityFollowUp") {
    add("awaiting_review", "1:1 동일", "→ accepted");
    add("more_docs", "1:1 동일", "→ more_supplement");
  }
  if (fieldId === "case04_evidence") {
    add("unsure", "1:1 동일", "→ none");
  }
  if (fieldId === "case04_repeatSupplement") {
    add("more_docs", "1:1 동일", "→ more_docs_same_kind");
    add("more_modify", "1:1 동일", "→ more_modify_reject_prior");
    add("more_explanation", "원문 표시로 처리");
    add("multiple", "원문 표시로 처리");
    add("not_applicable", "원문 표시로 처리");
  }
  return rows;
}

export function getAdminVerifyChoiceSlugLegacyMap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [fieldId, map] of Object.entries(CANONICALIZE_ON_SAVE)) {
    for (const [legacy, canonical] of Object.entries(map)) {
      out[`${fieldId}|${legacy}`] = canonical;
    }
  }
  return out;
}

export function isLegacySlugJudgmentSuppressed(fieldId: string, slug: string): boolean {
  return JUDGMENT_SUPPRESSED_LEGACY.has(`${fieldId}|${slug}`);
}

export function getLegacyChoiceLabel(fieldId: string, slug: string): string | undefined {
  return LEGACY_CHOICE_LABELS[`${fieldId}|${slug}`];
}

export function slugMatchesChoiceValue(
  fieldId: string,
  raw: string | undefined,
  targetSlug: string,
): boolean {
  if (!raw?.trim()) return false;
  const slug = raw.trim();
  if (isLegacySlugJudgmentSuppressed(fieldId, slug)) {
    return slug === targetSlug;
  }
  if (slug === targetSlug) return true;
  const aliases = BRANCH_EQUIVALENT_ALIASES[fieldId]?.[targetSlug];
  return aliases?.includes(slug) ?? false;
}

export function canonicalizeAdminVerifyChoiceSlug(
  fieldId: string,
  slug: string,
): string {
  if (!slug) return slug;
  return CANONICALIZE_ON_SAVE[fieldId]?.[slug] ?? slug;
}

export function canonicalizeAdminVerifyChoiceAnswer(
  fieldId: string,
  raw: string | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) return trimmed;
  return canonicalizeAdminVerifyChoiceSlug(fieldId, trimmed);
}

/** 판단·신호·분기용 — suppressed legacy는 undefined */
export function resolveAdminVerifyChoiceSlugForJudgment(
  fieldId: string,
  raw: string | undefined,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const slug = raw.trim();
  if (slug.startsWith("[")) return slug;
  if (isLegacySlugJudgmentSuppressed(fieldId, slug)) return undefined;
  return canonicalizeAdminVerifyChoiceSlug(fieldId, slug);
}
