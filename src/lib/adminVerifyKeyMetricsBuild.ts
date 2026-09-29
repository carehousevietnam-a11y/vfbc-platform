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

/** Stitch 2차 결과 — 카드 배지 (표시 전용, metric.status와 독립). */
export type KeyMetricBadgeTier = "missing" | "unconfirmed" | "caution" | "ok";

export type AdminVerifyStitchRibbonState = "A" | "B" | "C";

export type KeyMetricSignalRegistryEntry = {
  fields: readonly string[];
  kind: "unconfirmed" | "caution";
  prefix?: string;
};

export type SlotSignalRule = {
  unconfirmed?: readonly string[];
  cautions?: readonly string[];
};

/** CASE_01~05 · manifest 슬롯 4개 순서. */
export const ADMIN_VERIFY_KEY_METRIC_SLOT_SIGNAL_RULES: Partial<
  Record<MasterCaseId, readonly [SlotSignalRule, SlotSignalRule, SlotSignalRule, SlotSignalRule]>
> = {
  CASE_01: [
    {
      unconfirmed: [
        "어떤 부분이 문제",
        "통지 핵심 문구",
        "안내 문구 확인",
        "당시 실제 상황 정리",
        "실제 상황과 기관 안내의 차이",
      ],
      cautions: [
        "알고 있는 상황",
        "이번 건 핵심",
        "출석·소명·추가 설명",
        "실제로 해당",
        "일부는 맞지만",
        "지적한",
        "핵심 사실",
        "행동은 맞지만",
        "날짜·장소",
        "제출·등록",
        "기관에서 문제",
      ],
    },
    {
      unconfirmed: ["우선 확인할 항목"],
      cautions: ["사실관계 차이 확인이 우선", "당시 일정·장소 기억"],
    },
    {
      unconfirmed: [
        "기관이 요구한 추가 대응",
        "기관 답변",
        "확인 가능한 자료",
        "준비할 자료",
        "다음 대응 방법",
      ],
      cautions: [
        "아직 기관",
        "기관에서 추가",
        "관련 자료가 없",
        "사진·영상",
        "어떤 사실",
        "안내 내용을 제",
        "기관에 사실관계",
        "다른 사람을 통해",
      ],
    },
    {
      unconfirmed: ["대응 기한", "통지서 대응"],
      cautions: ["대응 기한이 확인", "기한 경과"],
    },
  ],
  CASE_02: [
    {
      unconfirmed: [
        "납부 안내를 받은 경로",
        "납부 요구 사유",
        "납부 사유·근거",
        "납부 금액",
        "납부 금액·사유",
        "납부 요구와 실제 상황의 관계",
      ],
      cautions: [
        "다른 사람을 통해",
        "이전 처리와",
        "납부 의무",
        "금액 확인",
        "납부와 처리",
        "이미 납부",
        "안내 금액",
        "미납 시 추가",
      ],
    },
    { unconfirmed: ["우선 확인할 항목"], cautions: ["우선 목표"] },
    {
      unconfirmed: [
        "기관의 납부 처리 결과",
        "대리 납부 처리 상태",
        "기관이 요구한 추가 대응",
        "기관 답변",
        "현재 진행 중인 절차",
        "납부 방법",
        "미납 시 기관 안내·결과",
      ],
      cautions: ["아직 납부", "납부했으나", "일부만 납부", "납부 후 기관"],
    },
    {
      unconfirmed: ["납부 기한"],
      cautions: ["납부 기한이 확인", "납부 요구와 실제"],
    },
  ],
  CASE_03: [
    {
      unconfirmed: ["기관 요구 내용", "기관이 확인하려는 내용", "출석·소명 요구 사유"],
      cautions: ["이미 대응했으나 추가 출석"],
    },
    { unconfirmed: ["우선 확인할 항목"], cautions: ["이전 대응 내용 확인"] },
    {
      unconfirmed: [
        "기관이 요구한 추가 대응",
        "기관 답변",
        "기관 후속 반응",
        "준비해야 할 내용",
        "추가로 전달할 설명·자료",
        "확인 가능한 자료",
        "설명·제출 후 다음 조치",
      ],
      cautions: [
        "아직 기관에 설명",
        "이미 일부 대응",
        "설명과 자료",
        "설명·출석이 충분",
        "설명 후 기관",
        "기관에서 추가",
        "기관이 다른 절차",
        "추가 설명·출석",
      ],
    },
    {
      unconfirmed: ["출석·소명 기한", "기관 확인 내용과 실제 상황의 관계"],
      cautions: ["출석·소명 기한이 확인", "기관이 확인하려는 내용과 실제"],
    },
  ],
  CASE_04: [
    {
      unconfirmed: ["보완 요구 내용", "보완이 필요한 이유", "처음 제출 내용과 보완 요구의 관계"],
      cautions: ["이미 보완했으나 추가"],
    },
    { unconfirmed: ["우선 확인할 항목"], cautions: ["기존 제출 내용 확인"] },
    {
      unconfirmed: [
        "기관 답변·접수 여부",
        "기관 후속 반응",
        "처음 제출한 내용",
        "추가로 제출할 서류",
        "수정해야 할 항목",
        "추가로 제출할 증빙",
        "확인 가능한 자료",
      ],
      cautions: [
        "아직 보완",
        "보완 자료",
        "보완 제출 후 기관",
        "추가 보완",
        "이미 제출한 자료",
      ],
    },
    {
      unconfirmed: ["보완 제출 기한"],
      cautions: ["보완 제출 기한이 확인", "보완 제출 후 검토"],
    },
  ],
  CASE_05: [
    {
      unconfirmed: [
        "처분 사유",
        "처분·조치 내용",
        "직접 설명한 조치 내용",
        "처분 내용과 실제 상황의 관계",
        "당시 상황 재구성",
        "처분 사유와 실제 상황의 차이",
        "처분 문구·범위",
        "처분 영향 범위·기간",
        "처분이 주는 실제 영향",
      ],
      cautions: [
        "허가·자격",
        "일정 기간 활동",
        "통지 내용과 실제",
        "처분 내용과 실제",
        "과거 사실 확인",
      ],
    },
    {
      unconfirmed: ["우선 확인할 항목", "다음 조치 계획", "신청 여부·시기"],
      cautions: ["이의·재검토를 검토"],
    },
    {
      unconfirmed: [
        "기관에 한 대응 방식",
        "기관 답변·접수 여부",
        "기관 후속 결과",
        "반복 대응 내용",
        "기관의 다음 답변·조치",
        "현재 막힌 부분",
        "제출 서류 종류",
      ],
      cautions: [
        "아직 기관에 설명",
        "이미 대응 자료",
        "이의·재검토를 요청",
        "문의만 진행",
        "서면 소명",
        "구두·방문",
        "서면·구두",
        "이의·재검토 신청",
        "신청 준비",
        "기관이 처분 유지",
        "처분 후 기관",
        "재검토 진행",
        "처분이 유지",
        "처분 내용이 변경",
        "처분이 철회",
        "처분 후 추가",
        "처분 영향을 일부",
      ],
    },
    {
      unconfirmed: [
        "처분 관련 대응 기한",
        "처분 통지의 기한 표기",
      ],
      cautions: ["처분 관련 대응 기한이 확인", "기한이 지났을 가능성"],
    },
  ],
};

type SignalRow = readonly [string, "unconfirmed" | "caution", readonly string[]];

function rowsToRegistry(rows: readonly SignalRow[]): Record<string, KeyMetricSignalRegistryEntry> {
  const out: Record<string, KeyMetricSignalRegistryEntry> = {};
  for (const [signal, kind, fields] of rows) {
    out[signal] = { fields, kind };
  }
  return out;
}

/** Exact signal → source fieldIds (슬롯은 manifest body fieldIds strict 포함으로만 결정). */
export const ADMIN_VERIFY_KEY_METRIC_SIGNAL_REGISTRY: Partial<
  Record<MasterCaseId, Readonly<Record<string, KeyMetricSignalRegistryEntry>>>
> = {
  CASE_01: rowsToRegistry([
    ["통지서에 적힌 위반·문제 내용", "unconfirmed", ["case01_violationContent"]],
    ["어떤 부분이 문제라고 하는지", "unconfirmed", ["case01_violationContent"]],
    ["통지서 기한", "unconfirmed", ["case01_deadline"]],
    ["통지서 기한 확인 필요", "caution", ["case01_deadline"]],
    ["우선 확인할 항목", "unconfirmed", ["case01_confirmGoal"]],
    ["확인 가능한 자료", "unconfirmed", ["case01_evidence"]],
    ["실제 상황과 기관 안내의 차이", "unconfirmed", ["case01_factRelationship"]],
    ["기관이 요구한 추가 대응 내용", "unconfirmed", ["case01_customerResponded"]],
    ["위반 사실을 인정하지 않음 — 통지 내용과 대조 필요", "caution", ["case01_factRelationship"]],
    ["알고 있는 상황과 기관 안내 내용이 다르다고 응답함", "caution", ["case01_violationContent"]],
    ["사실관계 차이 확인이 우선 목표로 선택됨", "caution", ["case01_confirmGoal"]],
    ["아직 기관에 설명하거나 자료를 제출하지 않은 상태임", "caution", ["case01_customerResponded"]],
    ["기관에서 추가 대응을 요구한 상태임", "caution", ["case01_customerResponded"]],
    ["관련 자료가 없다고 응답함 — 확보 가능한 증빙을 먼저 정리하는 것이 좋음", "caution", ["case01_evidence"]],
    ["출석·소명·추가 설명 요구가 핵심으로 확인됨", "caution", ["case01_violationContent"]],
    ["실제로 해당 행동·상황이 없었다고 정리됨", "caution", ["case01_factRelationship"]],
  ] as const),
  CASE_02: rowsToRegistry([
    ["납부 안내를 받은 경로", "unconfirmed", ["case02_paymentInfoSource"]],
    ["납부 요구 사유", "unconfirmed", ["case02_paymentSubject"]],
    ["납부 기한", "unconfirmed", ["case02_deadline"]],
    ["우선 확인할 항목", "unconfirmed", ["case02_confirmGoal"]],
    ["납부 처리 여부 확인이 필요합니다", "unconfirmed", ["case02_paymentStatus"]],
    ["납부 사유·근거 확인이 필요합니다", "unconfirmed", ["case02_paymentBasis"]],
    ["납부 요구와 실제 상황의 관계", "unconfirmed", ["case02_situationMatch"]],
    ["기관 답변", "unconfirmed", ["case02_authorityResponse"]],
    ["납부 방법", "unconfirmed", ["case02_paymentMethod"]],
    ["미납 시 기관 안내·결과", "unconfirmed", ["case02_authorityResponse"]],
    ["납부 사유·근거", "unconfirmed", ["case02_paymentBasis"]],
    ["기관의 납부 처리 결과", "unconfirmed", ["case02_paymentStatus"]],
    ["금액 확인이 우선 목표로 선택됨", "caution", ["case02_confirmGoal"]],
    ["납부했으나 기관 처리 여부가 확인되지 않음", "caution", ["case02_paymentStatus"]],
    ["납부했으나 처리 여부 미확인 — 기관 반응 확인 필요", "caution", ["case02_paymentStatus"]],
    ["아직 납부하지 않은 상태임", "caution", ["case02_paymentStatus"]],
    ["납부 요구와 실제 상황이 다르다고 응답함", "caution", ["case02_situationMatch"]],
  ] as const),
  CASE_03: rowsToRegistry([
    ["기관 요구 내용", "unconfirmed", ["case03_authorityDemand"]],
    ["기관이 확인하려는 내용", "unconfirmed", ["case03_inquiryFocus"]],
    ["출석·소명 기한", "unconfirmed", ["case03_deadline"]],
    ["우선 확인할 항목", "unconfirmed", ["case03_confirmGoal"]],
    ["사실관계 확인이 필요합니다", "unconfirmed", ["case03_factRelationship"]],
    ["기관 답변·접수 여부", "unconfirmed", ["case03_authorityFollowUp"]],
    ["기관 후속 반응", "unconfirmed", ["case03_customerResponse"]],
    ["기관 답변", "unconfirmed", ["case03_customerResponse"]],
    ["설명·출석 후 기관 반응이 불명확합니다", "unconfirmed", ["case03_customerResponse"]],
    ["출석·소명 요구 사유", "unconfirmed", ["case03_authorityDemand"]],
    ["이미 일부 대응을 한 상태 — 기관 반응 확인이 필요함", "caution", ["case03_customerResponse"]],
    ["기관이 확인하려는 내용과 실제 상황이 다르다고 응답함", "caution", ["case03_factRelationship"]],
    ["확인 가능한 자료·증빙", "unconfirmed", ["case03_evidence"]],
    ["아직 기관에 설명하거나 방문하지 않은 상태임", "caution", ["case03_customerResponse"]],
    ["기관 반응이 불명확함 — 확인 필요", "caution", ["case03_customerResponse"]],
  ] as const),
  CASE_04: rowsToRegistry([
    ["보완 요구 내용", "unconfirmed", ["case04_supplementTarget"]],
    ["보완 대상 확인이 필요합니다", "unconfirmed", ["case04_supplementTarget"]],
    ["보완 사유 확인이 필요합니다", "unconfirmed", ["case04_supplementReason"]],
    ["보완 제출 기한", "unconfirmed", ["case04_deadline"]],
    ["보완 제출 기한 확인이 필요합니다", "unconfirmed", ["case04_deadline"]],
    ["우선 확인할 항목", "unconfirmed", ["case04_confirmGoal"]],
    [
      "보완 요구와 기존 제출 내용의 관계 확인이 필요합니다",
      "unconfirmed",
      ["case04_submissionRelation"],
    ],
    ["기관 답변·접수 여부", "unconfirmed", ["case04_customerResponse"]],
    ["기관 후속 반응", "unconfirmed", ["case04_customerResponse"]],
    ["보완 제출 후 기관 반응 미확인 — 확인 필요", "caution", ["case04_customerResponse"]],
    ["보완 제출 후 기관 반응 확인이 필요합니다", "unconfirmed", ["case04_customerResponse"]],
    ["보완이 필요한 이유", "unconfirmed", ["case04_supplementReason"]],
    ["처음 제출 내용과 보완 요구의 관계", "unconfirmed", ["case04_submissionRelation"]],
    ["추가로 제출할 서류 종류", "unconfirmed", ["case04_addDocDetail"]],
    ["보완 처리 여부 확인이 필요합니다", "unconfirmed", ["case04_customerResponse"]],
    ["아직 보완 자료를 준비하거나 제출하지 않은 상태임", "caution", ["case04_customerResponse"]],
    ["보완 자료를 제출한 상태 — 기관 반응 확인이 필요함", "caution", ["case04_customerResponse"]],
  ] as const),
  CASE_05: rowsToRegistry([
    ["처분 사유", "unconfirmed", ["case05_dispositionType"]],
    ["처분·조치 내용 확인이 필요합니다", "unconfirmed", ["case05_dispositionType"]],
    ["처분 관련 기한 확인이 필요합니다", "unconfirmed", ["case05_deadline"]],
    ["우선 확인할 항목", "unconfirmed", ["case05_confirmGoal"]],
    ["처분 내용과 실제 상황의 관계", "unconfirmed", ["case05_factRelationship"]],
    ["처분이 주는 실제 영향", "unconfirmed", ["case05_dispositionType"]],
    ["다음 조치 계획", "unconfirmed", ["case05_confirmGoal"]],
    ["처분·조치 내용", "unconfirmed", ["case05_dispositionType"]],
    ["아직 기관에 설명·자료 제출·재검토 요청을 하지 않은 상태임", "caution", ["case05_customerResponse"]],
    ["처분 관련 대응 기한", "unconfirmed", ["case05_deadline"]],
    ["처분 관련 대응 기한(날짜)", "unconfirmed", ["case05_deadline", CASE05_DEADLINE_DATE_KEY]],
    ["처분 후 기관 반응 미확인 — 확인 필요", "caution", ["case05_customerResponse"]],
    ["처분 후 기관 반응 확인이 필요합니다", "unconfirmed", ["case05_customerResponse"]],
    ["처분 후 기관 반응이 불명확합니다", "unconfirmed", ["case05_customerResponse"]],
    ["통지 내용과 실제 상황이 다르게 느껴지는 상태로 응답함", "caution", ["case05_dispositionType"]],
    ["이의·재검토를 요청한 상태 — 진행 결과 확인이 필요함", "caution", ["case05_customerResponse"]],
  ] as const),
};

const PREFIX_SIGNAL_BINDINGS: Partial<
  Record<MasterCaseId, readonly KeyMetricSignalRegistryEntry[]>
> = {
  CASE_01: [{ prefix: "추가 요구 내용:", kind: "unconfirmed", fields: ["case01_customerResponded"] }],
};

export function resolveAdminVerifyStitchRibbonState(
  unconfirmed: readonly string[],
  cautions: readonly string[],
): AdminVerifyStitchRibbonState {
  if (unconfirmed.length > 0) return "A";
  if (cautions.length > 0) return "B";
  return "C";
}

function signalMatchesRuleLabel(signal: string, ruleLabel: string): boolean {
  return signal === ruleLabel;
}

function slotIndexForSourceFields(
  caseId: MasterCaseId,
  fields: readonly string[],
): number | null {
  for (let slot = 0; slot < 4; slot += 1) {
    const body = ADMIN_VERIFY_KEY_METRIC_BODY_FIELD_IDS[caseId]?.[slot] ?? [];
    if (fields.every((fieldId) => body.includes(fieldId))) return slot;
  }
  return null;
}

function lookupSignalRegistryEntry(
  caseId: MasterCaseId,
  signal: string,
  kind: "unconfirmed" | "caution",
): KeyMetricSignalRegistryEntry | null {
  const exact = ADMIN_VERIFY_KEY_METRIC_SIGNAL_REGISTRY[caseId]?.[signal];
  if (exact && exact.kind === kind) return exact;
  const prefixes = PREFIX_SIGNAL_BINDINGS[caseId] ?? [];
  for (const entry of prefixes) {
    if (entry.kind !== kind || !entry.prefix) continue;
    if (signal.startsWith(entry.prefix)) return entry;
  }
  return null;
}

function findSignalSlotIndex(
  caseId: MasterCaseId,
  signal: string,
  kind: "unconfirmed" | "caution",
): number | null {
  const fromRegistry = lookupSignalRegistryEntry(caseId, signal, kind);
  if (fromRegistry) {
    return slotIndexForSourceFields(caseId, fromRegistry.fields);
  }
  const rules = ADMIN_VERIFY_KEY_METRIC_SLOT_SIGNAL_RULES[caseId];
  if (!rules) return null;
  for (let slot = 0; slot < 4; slot += 1) {
    const rule = rules[slot];
    const labels = kind === "unconfirmed" ? rule.unconfirmed : rule.cautions;
    if (!labels) continue;
    for (const label of labels) {
      if (signalMatchesRuleLabel(signal, label)) {
        const body = ADMIN_VERIFY_KEY_METRIC_BODY_FIELD_IDS[caseId]?.[slot] ?? [];
        if (body.length > 0) return slot;
      }
    }
  }
  return null;
}

export function resolveKeyMetricBadgeTier(input: {
  hasFootnote: boolean;
  hasUnconfirmedSignal: boolean;
  hasCautionSignal: boolean;
}): KeyMetricBadgeTier {
  if (!input.hasFootnote) return "missing";
  if (input.hasUnconfirmedSignal) return "unconfirmed";
  if (input.hasCautionSignal) return "caution";
  return "ok";
}

function manifestSlotHasFootnote(
  caseId: MasterCaseId,
  slotIndex: number,
  answers: ReviewAnswers,
): boolean {
  const bodyFields = ADMIN_VERIFY_KEY_METRIC_BODY_FIELD_IDS[caseId] ?? [];
  const fieldIds = bodyFields[slotIndex] ?? [];
  return collectSlotFootnote(caseId, fieldIds, answers).trim().length > 0;
}

export type ResolveKeyMetricBadgeTiersResult = {
  tiers: KeyMetricBadgeTier[];
  /** manifest 슬롯 index — keyMetrics와 동일 순서 */
  slotIndices: number[];
  fallbackAssigned: string[];
  unassignedSignals: string[];
  assignmentBySignal: Record<string, number>;
};

export function resolveKeyMetricBadgeTiers(input: {
  caseId: MasterCaseId;
  answers: ReviewAnswers;
  unconfirmed: readonly string[];
  cautions: readonly string[];
}): ResolveKeyMetricBadgeTiersResult {
  const { caseId, answers, unconfirmed, cautions } = input;
  const assignmentBySignal: Record<string, number> = {};
  const fallbackAssigned: string[] = [];
  const unassignedSignals: string[] = [];
  const slotUnconfirmed: boolean[] = [false, false, false, false];
  const slotCaution: boolean[] = [false, false, false, false];

  const assignSignal = (signal: string, kind: "unconfirmed" | "caution") => {
    if (assignmentBySignal[signal] !== undefined) return;
    const slot = findSignalSlotIndex(caseId, signal, kind);
    if (slot === null) {
      unassignedSignals.push(signal);
      return;
    }
    assignmentBySignal[signal] = slot;
    if (kind === "unconfirmed") slotUnconfirmed[slot] = true;
    else slotCaution[slot] = true;
  };

  for (const item of unconfirmed) assignSignal(item, "unconfirmed");
  for (const item of cautions) assignSignal(item, "caution");

  const tiers4: KeyMetricBadgeTier[] = [];
  for (let slot = 0; slot < 4; slot += 1) {
    const hasFootnote = manifestSlotHasFootnote(caseId, slot, answers);
    tiers4.push(
      resolveKeyMetricBadgeTier({
        hasFootnote,
        hasUnconfirmedSignal: slotUnconfirmed[slot],
        hasCautionSignal: slotCaution[slot],
      }),
    );
  }

  const slotIndices: number[] = [];
  const tiers: KeyMetricBadgeTier[] = [];
  for (let slot = 0; slot < 4; slot += 1) {
    if (!manifestSlotHasFootnote(caseId, slot, answers)) continue;
    slotIndices.push(slot);
    tiers.push(tiers4[slot]);
  }

  return { tiers, slotIndices, fallbackAssigned, unassignedSignals, assignmentBySignal };
}
