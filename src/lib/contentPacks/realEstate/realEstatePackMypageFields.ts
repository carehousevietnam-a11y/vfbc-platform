import {
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
} from "@/lib/adminVerifyProfiling";
import {
  isAdminPhase2DocumentsUploadComplete,
  type CrmActivityLike,
} from "@/lib/adminVerifyMypageFields";
import { buildPackPersonalizedResult } from "./personalizedResultBuilder";
import { buildFirstResultData, phase1QuestionIds } from "../runner";
import type { AnswerMap, RealEstateCaseId } from "./types";
import { resolveCaseFromAnswers } from "../runner";
import {
  REAL_ESTATE_PACK_HEADLINE_META_KEY,
  REAL_ESTATE_PACK_PHASE2_SUMMARY_META_KEY,
  buildRealEstatePackPhase2PersistMeta,
  parsePackAnswersFromActivities,
} from "./packPhase2Persist";

/** My Page paid dashboard eyebrow — Pack 슬롯(기본=Admin 문구 패턴) */
export const VERIFY_REAL_ESTATE_MYPAGE_RESULT_EYEBROW = "부동산 문서 종합 결과";

export function isVerifyRealEstatePackPaidMypageItem(item: {
  serviceType?: string | null;
  phase2Complete?: boolean;
}): boolean {
  const st = item.serviceType?.replace(/-/g, "_");
  return st === "verify_real_estate" && item.phase2Complete === true;
}

export function isRealEstatePhase2DocumentsUploadComplete(
  activities: CrmActivityLike[],
): boolean {
  return isAdminPhase2DocumentsUploadComplete(activities);
}

function findLatestMetaString(activities: CrmActivityLike[], key: string): string | null {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const meta = activities[i]?.meta;
    if (!meta || typeof meta !== "object") continue;
    const raw = (meta as Record<string, unknown>)[key];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return null;
}

function phase1AnswerSubset(caseId: RealEstateCaseId, answers: AnswerMap): AnswerMap {
  const out: AnswerMap = { re_entry: answers.re_entry };
  const note = answers.re_entryNote;
  if (note != null && String(note).trim() !== "") out.re_entryNote = note;
  for (const id of phase1QuestionIds(caseId)) {
    if (answers[id] != null && String(answers[id]).trim() !== "") out[id] = answers[id];
  }
  return out;
}

function splitSummaryLines(summary: string): string[] {
  const trimmed = summary.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(/(?<=[.!?…])\s+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 2) return parts;
  return [parts[0], parts.slice(1).join(" ")];
}

export function buildRealEstatePhase2SummaryLinesFromActivities(
  activities: CrmActivityLike[],
): string[] {
  const persisted = findLatestMetaString(activities, REAL_ESTATE_PACK_PHASE2_SUMMARY_META_KEY);
  if (persisted) return splitSummaryLines(persisted);

  const answers = parsePackAnswersFromActivities(activities);
  if (!answers || Object.keys(answers).length === 0) return [];
  const caseId = resolveCaseFromAnswers(answers);
  const data = buildPackPersonalizedResult(caseId, answers);
  if (!data?.situationSummary) return [];
  return splitSummaryLines(data.situationSummary);
}

export function buildRealEstatePhase1SummaryLinesFromActivities(
  activities: CrmActivityLike[],
): string[] {
  const answers = parsePackAnswersFromActivities(activities);
  if (!answers || Object.keys(answers).length === 0) return [];
  const caseId = resolveCaseFromAnswers(answers);
  const direct = answers.re_entryNote;
  const data = buildFirstResultData(
    caseId,
    phase1AnswerSubset(caseId, answers),
    typeof direct === "string" ? direct : undefined,
  );
  const line = data.situationSummary?.trim();
  return line ? splitSummaryLines(line).slice(0, 2) : [];
}

export function buildRealEstatePackExpertHandoffMeta(
  answers: AnswerMap,
): Record<string, unknown> {
  return buildRealEstatePackPhase2PersistMeta(answers, 2);
}
