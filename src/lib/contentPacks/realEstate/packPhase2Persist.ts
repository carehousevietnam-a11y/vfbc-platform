import {
  ADMIN_VERIFY_ANSWERS_META_JSON_KEY,
  ADMIN_VERIFY_PROFILE_PHASE_META_KEY,
} from "@/lib/adminVerifyProfiling";
import { resolveCaseFromAnswers } from "../runner";
import type { AnswerMap, RealEstateCaseId } from "./types";
import { buildPackPersonalizedResult } from "./personalizedResultBuilder";
import type { CrmActivityLike } from "@/lib/adminVerifyMypageFields";

const PACK_CASE_META_KEY = "real_estate_pack_case_id";
const PACK_V1_FLAG = "real_estate_pack_v1";

export const REAL_ESTATE_PACK_GRADE2_META_KEY = "real_estate_pack_grade2";
export const REAL_ESTATE_PACK_PHASE2_SUMMARY_META_KEY = "real_estate_pack_phase2_summary";
export const REAL_ESTATE_PACK_CAUTION_COUNT_META_KEY = "real_estate_pack_caution_count";
export const REAL_ESTATE_PACK_HEADLINE_META_KEY = "real_estate_pack_headline";

function serializePackAnswers(answers: AnswerMap): string {
  const payload: Record<string, string> = {};
  for (const [key, val] of Object.entries(answers)) {
    if (val == null) continue;
    if (Array.isArray(val)) {
      if (val.length) payload[key] = val.join(",");
      continue;
    }
    const s = String(val).trim();
    if (s) payload[key] = s;
  }
  return JSON.stringify(payload);
}

export function assertPackCaseIdConsistent(answers: AnswerMap): RealEstateCaseId {
  const caseId = resolveCaseFromAnswers(answers);
  const fromMeta = answers[PACK_CASE_META_KEY];
  if (fromMeta && String(fromMeta).trim() && String(fromMeta) !== caseId) {
    throw new Error(
      `pack case_id mismatch: re_entry→${caseId} vs ${PACK_CASE_META_KEY}=${fromMeta}`,
    );
  }
  return caseId;
}

/** Phase2 persist — flat Pack answers + Admin 호환 단계 플래그 (My Page 단일 리더) */
export function buildRealEstatePackPhase2PersistMeta(
  answers: AnswerMap,
  profilePhase: 1 | 2,
): Record<string, string> {
  const caseId = assertPackCaseIdConsistent(answers);
  const meta: Record<string, string> = {
    [ADMIN_VERIFY_ANSWERS_META_JSON_KEY]: serializePackAnswers(answers),
    [ADMIN_VERIFY_PROFILE_PHASE_META_KEY]: String(profilePhase),
    [PACK_V1_FLAG]: "true",
    [PACK_CASE_META_KEY]: caseId,
  };
  if (profilePhase === 2) {
    const personalized = buildPackPersonalizedResult(caseId, answers);
    if (personalized) {
      meta[REAL_ESTATE_PACK_GRADE2_META_KEY] = String(personalized.gradeFilled);
      meta[REAL_ESTATE_PACK_PHASE2_SUMMARY_META_KEY] = personalized.situationSummary ?? "";
      meta[REAL_ESTATE_PACK_CAUTION_COUNT_META_KEY] = String(personalized.cautions?.length ?? 0);
      const headline =
        personalized.statusHeadline?.trim() ||
        personalized.situationSummary?.split(/(?<=[.!?…])\s+/)[0]?.trim() ||
        "";
      if (headline) meta[REAL_ESTATE_PACK_HEADLINE_META_KEY] = headline;
    }
  }
  return meta;
}

export function parsePackAnswersFromActivities(
  activities: CrmActivityLike[],
): Record<string, string> | null {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    const raw = activities[i]?.meta;
    if (!raw || typeof raw !== "object") continue;
    const restored = restorePackAnswersFromVerifyMeta(raw as Record<string, unknown>);
    if (restored && Object.keys(restored).length > 0) return restored;
  }
  return null;
}

export function restorePackAnswersFromVerifyMeta(
  meta: Record<string, unknown>,
): Record<string, string> | null {
  const raw = meta[ADMIN_VERIFY_ANSWERS_META_JSON_KEY];
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}
