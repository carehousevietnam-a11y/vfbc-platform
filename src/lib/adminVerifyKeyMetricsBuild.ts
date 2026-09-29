/**
 * Layer D — 결과 카드 제목(manifest) ↔ 본문 필드 연결.
 * @see ADMIN_VERIFY_KEY_METRIC_MANIFEST · ADMIN_VERIFY_KEY_METRIC_BODY_FIELD_IDS
 */

import type { ReviewAnswers } from "@/components/cost-check/MasterReviewQuotationReport";
import { getLegacyChoiceLabel } from "@/lib/adminVerifyChoiceSlugCanonical";
import {
  CASE01_OPTION_LABELS,
  CASE01_CUSTOMER_RESPONDED_NOTE_KEY,
  CASE01_DATE_PLACE_AUX_KEY,
  CASE01_DEADLINE_DATE_KEY,
  CASE01_FACT_DIFFERENCE_AUX_KEY,
  CASE01_FACT_RELATIONSHIP_NOTE_KEY,
  CASE01_VIOLATION_CONTENT_NOTE_KEY,
  CASE02_DEADLINE_DATE_KEY,
  CASE02_PAYMENT_AMOUNT_DETAIL_KEY,
  CASE03_DEADLINE_DATE_KEY,
  CASE04_DEADLINE_DATE_KEY,
  CASE05_DEADLINE_DATE_KEY,
  getAdminChoiceNoteKey,
  getCase02FieldOptionLabel,
  getCase03FieldLabelFromAnswers,
  getCase04FieldLabelFromAnswers,
  getCase05FieldLabelFromAnswers,
  getCase06FieldOptionLabel,
  isAdminVerifyPhase2PathComplete,
  adminVerifyFieldHasSlug,
  type MasterCaseId,
  getCaseOptionLabel,
} from "@/lib/adminVerifyProfiling";
import {
  CASE06_DEADLINE_DATE_KEY,
  CASE06_PAYMENT_AMOUNT_TEXT_KEY,
  isCase06LaunchSimplifiedSession,
  isCase06LegacyRestorePath,
} from "@/lib/adminVerifyCase06Redesign";
import {
  ADMIN_VERIFY_KEY_METRIC_MANIFEST,
  shortenKeyMetricFootnote,
  type KeyMetricSlot,
} from "@/lib/adminVerifyKeyMetricManifest";

export type BuiltKeyMetric = {
  label: string;
  title: string;
  footnote: string;
  status: "ok" | "caution";
};

/** 보고용 — 카드 슬롯별 본문 필드 id */
export const ADMIN_VERIFY_KEY_METRIC_BODY_FIELD_IDS: Partial<
  Record<MasterCaseId, readonly (readonly string[])[]>
> = {
  CASE_01: [
    ["case01_violationContent", "case01_factRelationship"],
    ["case01_confirmGoal"],
    ["case01_customerResponded", "case01_evidence", "case01_responseDetail"],
    [
      "case01_deadline",
      CASE01_DEADLINE_DATE_KEY,
      CASE01_DATE_PLACE_AUX_KEY,
      CASE01_FACT_DIFFERENCE_AUX_KEY,
      CASE01_FACT_RELATIONSHIP_NOTE_KEY,
    ],
  ],
  CASE_02: [
    ["case02_paymentSubject", "case02_paymentInfoSource", "case02_paymentBasis"],
    ["case02_confirmGoal"],
    ["case02_paymentStatus", "case02_paymentMethod", "case02_authorityResponse"],
    [
      "case02_deadline",
      CASE02_DEADLINE_DATE_KEY,
      "case02_situationMatch",
      CASE02_PAYMENT_AMOUNT_DETAIL_KEY,
    ],
  ],
  CASE_03: [
    ["case03_authorityDemand", "case03_inquiryFocus"],
    ["case03_confirmGoal", "case03_finalGoal"],
    ["case03_customerResponse", "case03_evidence", "case03_explanationDetail"],
    ["case03_deadline", CASE03_DEADLINE_DATE_KEY, "case03_factRelationship"],
  ],
  CASE_04: [
    ["case04_supplementTarget", "case04_supplementReason"],
    ["case04_confirmGoal", "case04_finalGoal"],
    ["case04_customerResponse", "case04_submissionRelation", "case04_initialSubmission"],
    ["case04_deadline", CASE04_DEADLINE_DATE_KEY],
  ],
  CASE_05: [
    ["case05_dispositionType"],
    ["case05_confirmGoal", "case05_finalGoal"],
    ["case05_customerResponse", "case05_evidence", "case05_dispositionReason"],
    ["case05_deadline", CASE05_DEADLINE_DATE_KEY, "case05_factRelationship"],
  ],
  CASE_06: [
    ["case06_requiredActionCandidate"],
    ["case06_knowledgeSource", "case06_sourceChannel"],
    ["case06_deadlineActionPair", "case06_customerResponse"],
    [CASE06_DEADLINE_DATE_KEY],
  ],
};

const CAUTION_VALUES = new Set([
  "unsure",
  "unknown",
  "unclear",
  "partial",
  "mismatch",
  "hard_to_judge",
  "not_stated",
  "not_advised",
  "uncertain",
  "yes_unclear",
  "none",
  "no",
  "no_contact_yet",
  "not_started",
  "situation_mismatch",
  "date_place_wrong",
  "deny_action",
  "partial_situation",
  "info_mismatch",
  "hard_to_explain",
  "more_demand",
  "overdue_concern",
  "not_checked",
  "mismatch_request",
  "has_issue",
]);

function case01FieldLabel(fieldId: string, answers: ReviewAnswers): string | null {
  const raw = answers[fieldId as keyof ReviewAnswers]?.trim();
  if (!raw) return null;
  if (fieldId === CASE01_CUSTOMER_RESPONDED_NOTE_KEY) return raw;
  if (fieldId === CASE01_VIOLATION_CONTENT_NOTE_KEY) return raw;
  if (fieldId === CASE01_FACT_RELATIONSHIP_NOTE_KEY) return raw;
  if (fieldId === CASE01_DATE_PLACE_AUX_KEY || fieldId === CASE01_FACT_DIFFERENCE_AUX_KEY) {
    return raw;
  }
  if (fieldId === CASE01_DEADLINE_DATE_KEY) return `기한 ${raw}`;
  if (raw === "other") {
    const note = answers[getAdminChoiceNoteKey(fieldId)]?.trim();
    return note || CASE01_OPTION_LABELS.other || raw;
  }
  if (fieldId === "case01_evidence" && raw.startsWith("[")) {
    try {
      const slugs = JSON.parse(raw) as string[];
      const labels = slugs
        .map((s) => case01OptionLabel(fieldId, s))
        .filter((label): label is string => Boolean(label));
      return labels.length ? labels.join(", ") : null;
    } catch {
      /* single */
    }
  }
  return case01OptionLabel(fieldId, raw);
}

/** 질문별 선택지 라벨 → 공용 라벨 순으로 찾고, 끝내 못 찾은 내부 코드값은 화면에 내보내지 않는다. */
function case01OptionLabel(fieldId: string, slug: string): string | null {
  const perQuestion = getCaseOptionLabel("CASE_01", fieldId, slug);
  if (perQuestion && perQuestion !== slug) return perQuestion;
  const shared = CASE01_OPTION_LABELS[slug];
  if (shared) return shared;
  const legacy = getLegacyChoiceLabel(fieldId, slug);
  if (legacy) return legacy;
  return /^[a-z0-9_]+$/.test(slug) ? null : slug;
}

/** 질문별 선택지 라벨 → 공용 라벨 순으로 찾고, 끝내 못 찾은 내부 코드값은 화면에 내보내지 않는다. */
function case02OptionLabel(fieldId: string, slug: string): string | null {
  const label = getCase02FieldOptionLabel(fieldId, slug);
  if (label !== slug) return label;
  return /^[a-z0-9_]+$/.test(slug) ? null : slug;
}

function case02FieldLabel(fieldId: string, answers: ReviewAnswers): string | null {
  if (fieldId === CASE02_DEADLINE_DATE_KEY) {
    const raw = answers[fieldId]?.trim();
    return raw ? `기한 ${raw}` : null;
  }
  if (fieldId === CASE02_PAYMENT_AMOUNT_DETAIL_KEY) {
    const raw = answers[fieldId]?.trim();
    return raw ? `금액 ${raw}` : null;
  }
  const raw = answers[fieldId as keyof ReviewAnswers]?.trim();
  if (!raw) return null;
  if (raw === "other") {
    const note = answers[getAdminChoiceNoteKey(fieldId)]?.trim();
    const fallback = getCase02FieldOptionLabel(fieldId, "other");
    return note || fallback || null;
  }
  return case02OptionLabel(fieldId, raw);
}

function case03FieldLabel(fieldId: string, answers: ReviewAnswers): string | null {
  if (fieldId === CASE03_DEADLINE_DATE_KEY) {
    const raw = answers[fieldId]?.trim();
    return raw ? `기한 ${raw}` : null;
  }
  const fromAnswers = getCase03FieldLabelFromAnswers(fieldId, answers);
  return fromAnswers?.label ?? null;
}

function case04FieldLabel(fieldId: string, answers: ReviewAnswers): string | null {
  if (fieldId === CASE04_DEADLINE_DATE_KEY) {
    const raw = answers[fieldId]?.trim();
    return raw ? `기한 ${raw}` : null;
  }
  const fromAnswers = getCase04FieldLabelFromAnswers(fieldId, answers);
  return fromAnswers?.label ?? null;
}

function case05FieldLabel(fieldId: string, answers: ReviewAnswers): string | null {
  if (fieldId === CASE05_DEADLINE_DATE_KEY) {
    const raw = answers[fieldId]?.trim();
    return raw ? `기한 ${raw}` : null;
  }
  const fromAnswers = getCase05FieldLabelFromAnswers(fieldId, answers);
  return fromAnswers?.label ?? null;
}

function case06FieldLabel(fieldId: string, answers: ReviewAnswers): string | null {
  if (fieldId === CASE06_DEADLINE_DATE_KEY) {
    const raw = answers[fieldId]?.trim();
    return raw ? `기한 ${raw}` : null;
  }
  if (fieldId === CASE06_PAYMENT_AMOUNT_TEXT_KEY) {
    const raw = answers[fieldId]?.trim();
    return raw ? `금액 ${raw}` : null;
  }
  const raw = answers[fieldId as keyof ReviewAnswers]?.trim();
  if (!raw) return null;
  if (raw === "other") {
    const note = answers[getAdminChoiceNoteKey(fieldId)]?.trim();
    return note || getCase06FieldOptionLabel(fieldId, "other");
  }
  return getCase06FieldOptionLabel(fieldId, raw);
}

function fieldLabelForMetric(
  caseId: MasterCaseId,
  fieldId: string,
  answers: ReviewAnswers,
): string | null {
  switch (caseId) {
    case "CASE_01":
      return case01FieldLabel(fieldId, answers);
    case "CASE_02":
      return case02FieldLabel(fieldId, answers);
    case "CASE_03":
      return case03FieldLabel(fieldId, answers);
    case "CASE_04":
      return case04FieldLabel(fieldId, answers);
    case "CASE_05":
      return case05FieldLabel(fieldId, answers);
    case "CASE_06":
      return case06FieldLabel(fieldId, answers);
    default:
      return null;
  }
}

function slotHasCaution(
  caseId: MasterCaseId,
  fieldIds: readonly string[],
  answers: ReviewAnswers,
): boolean {
  for (const fieldId of fieldIds) {
    const raw = answers[fieldId as keyof ReviewAnswers]?.trim();
    if (!raw) continue;
    if (fieldId === "case01_evidence" && adminVerifyFieldHasSlug(answers, "case01_evidence", "none")) {
      return true;
    }
    if (fieldId === "case05_evidence" && adminVerifyFieldHasSlug(answers, "case05_evidence", "none")) {
      return true;
    }
    if (CAUTION_VALUES.has(raw)) return true;
    if (raw.startsWith("[") && fieldId.includes("evidence")) {
      try {
        const slugs = JSON.parse(raw) as string[];
        if (slugs.some((s) => CAUTION_VALUES.has(s))) return true;
      } catch {
        /* ignore */
      }
    }
  }
  if (caseId === "CASE_01" && answers.case01_customerResponded === "none") return true;
  if (caseId === "CASE_04" && answers.case04_customerResponse === "not_started") return true;
  if (caseId === "CASE_05" && answers.case05_customerResponse === "none") return true;
  return false;
}

function collectSlotFootnote(
  caseId: MasterCaseId,
  fieldIds: readonly string[],
  answers: ReviewAnswers,
): string {
  const parts: string[] = [];
  for (const fieldId of fieldIds) {
    const label = fieldLabelForMetric(caseId, fieldId, answers);
    if (label && !parts.includes(label)) parts.push(label);
  }
  if (caseId === "CASE_01" && isAdminVerifyPhase2PathComplete(answers)) {
    const respondedNote = answers[CASE01_CUSTOMER_RESPONDED_NOTE_KEY]?.trim();
    if (respondedNote && !parts.includes(respondedNote)) parts.push(respondedNote);
  }
  return parts.join(" · ");
}

function dedupeFootnotesAcrossSlots(metrics: BuiltKeyMetric[]): BuiltKeyMetric[] {
  const seen = new Set<string>();
  return metrics.map((metric) => {
    const parts = metric.footnote
      .split(" · ")
      .map((p) => p.trim())
      .filter(Boolean)
      .filter((p) => {
        if (seen.has(p)) return false;
        seen.add(p);
        return true;
      });
    return { ...metric, footnote: parts.join(" · ") };
  });
}

export function buildAdminVerifyClassifiedKeyMetrics(
  caseId: MasterCaseId,
  answers: ReviewAnswers,
): BuiltKeyMetric[] {
  if (
    caseId === "CASE_06" &&
    isCase06LaunchSimplifiedSession(answers) &&
    !isCase06LegacyRestorePath(answers)
  ) {
    return [];
  }
  const slots: KeyMetricSlot[] = ADMIN_VERIFY_KEY_METRIC_MANIFEST[caseId] ?? [];
  const bodyFields = ADMIN_VERIFY_KEY_METRIC_BODY_FIELD_IDS[caseId] ?? [];
  const metrics: BuiltKeyMetric[] = [];

  for (let i = 0; i < 4; i += 1) {
    const slot = slots[i];
    const fieldIds = bodyFields[i] ?? [];
    const footnote = collectSlotFootnote(caseId, fieldIds, answers);
    if (!footnote.trim()) continue;
    metrics.push({
      label: slot?.label ?? `0${i + 1}`,
      title: slot?.title ?? "",
      footnote: shortenKeyMetricFootnote(footnote),
      status: slotHasCaution(caseId, fieldIds, answers) ? "caution" : "ok",
    });
  }

  return dedupeFootnotesAcrossSlots(metrics);
}
