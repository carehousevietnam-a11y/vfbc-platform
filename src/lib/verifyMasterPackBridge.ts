import type { AdminVerifyFirstResultData } from "@/components/cost-check/AdminVerifyFirstResultPanel";
import type { VerifyFirstResultTransition } from "@/lib/verifyPaidTransitionHooks";
import type { VerifyMasterContentSlots } from "@/lib/verifyMasterContentSlots";
import {
  type AdminVerifyProfilePhase,
  ADMIN_DIRECT_EXPLAIN_CHOICE,
  isAdminDirectExplainOption,
} from "@/lib/adminVerifyProfiling";
import {
  aggregateJudgmentForCase,
  buildFirstResultData,
  getNode,
  getQ1Options,
  isPhase1Complete,
  optionLabel,
  phase1QuestionIds,
  phase2QuestionIds,
  resolveCaseFromAnswers,
  nodeVisible,
} from "@/lib/contentPacks/runner";
import type { AnswerMap, RealEstateCaseId } from "@/lib/contentPacks/realEstate/types";
import { REAL_ESTATE_PHASE1_EVIDENCE_CHIPS } from "@/lib/contentPacks/realEstate/phase1EvidenceChips";
import { REAL_ESTATE_FIRST_RESULT_PACK_META } from "@/lib/contentPacks/realEstate/generated/meta";
import { resolveRealEstatePackTransitionHooks } from "@/lib/verifyPaidTransitionHooks";
import { resolveFirstResultNoRiskFloorCopy } from "@/lib/contentPacks/realEstate/firstResultNoRiskFloor";
import { hasFirstResultVerdictFloor } from "@/lib/contentPacks/realEstate/phase1VerdictBoost";

const Q1_KEY = "re_entry";
const Q1_TITLE = "지금 어떤 상황인가요?";

function packCautionsSubtitle(caseId: RealEstateCaseId): string {
  const fromPack = REAL_ESTATE_FIRST_RESULT_PACK_META[caseId]?.firstResultCautionsSectionSubtitle;
  if (fromPack) return fromPack;
  const fallback = REAL_ESTATE_FIRST_RESULT_PACK_META.RE01?.firstResultCautionsSectionSubtitle;
  return fallback ?? "| 계약 전 확인 핵심 포인트";
}
export type PackReviewQuestion =
  | {
      id: string;
      kind: "choice";
      label: string;
      options: { value: string; label: string }[];
    }
  | {
      id: string;
      kind: "text";
      label: string;
      placeholder: string;
    };

export type VerifyMasterPackBridge = {
  buildReviewQuestions: (
    answers: Record<string, string>,
    profilePhase: AdminVerifyProfilePhase,
  ) => PackReviewQuestion[];
  isPhase1Complete: (answers: Record<string, string>) => boolean;
  isPhase2QuestionSetComplete: (answers: Record<string, string>) => boolean;
  buildFirstResult: (answers: Record<string, string>) => AdminVerifyFirstResultData | null;
  resolveFirstResultTransition: (
    answers: Record<string, string>,
    data: AdminVerifyFirstResultData,
  ) => VerifyFirstResultTransition;
  getContentSlots: () => VerifyMasterContentSlots;
  getFirstResultContentSlots: (answers: Record<string, string>) => VerifyMasterContentSlots["firstResult"];
  getSignupRiskLevel: (answers: Record<string, string>) => "low" | "medium" | "high";
};

function asAnswerMap(answers: Record<string, string>): AnswerMap {
  return answers as AnswerMap;
}

/** Admin stitch shell — 직접 입력 선택지는 Pack 옵션 목록과 무관하게 항상 주입 */
function appendPackVerifyDirectExplainOption(
  options: { value: string; label: string }[],
): { value: string; label: string }[] {
  if (options.some(isAdminDirectExplainOption)) return options;
  return [...options, ADMIN_DIRECT_EXPLAIN_CHOICE];
}

function packNodeToReview(
  caseId: RealEstateCaseId,
  id: string,
  answers: AnswerMap,
): PackReviewQuestion | null {
  const node = getNode(caseId, id);
  if (!node || !nodeVisible(node, answers, caseId)) return null;
  if (node.kind === "text") {
    return {
      id: node.id,
      kind: "text",
      label: node.question,
      placeholder: node.placeholder ?? "",
    };
  }
  return {
    id: node.id,
    kind: "choice",
    label: node.question,
    options: appendPackVerifyDirectExplainOption(
      node.options.map((o) => ({ value: o.value, label: o.label })),
    ),
  };
}

export function createRealEstateVerifyMasterPackBridge(): VerifyMasterPackBridge {
  const contentSlots: VerifyMasterContentSlots = {
    evidence: {
      exampleTags: REAL_ESTATE_PHASE1_EVIDENCE_CHIPS,
    },
    firstResult: {
      firstResultTitle: "부동산 문서 1차 종합 결과",
      firstResultIntro:
        "입력하신 답변과 상황 정보를 바탕으로 정리한 1차 검토 결과입니다.",
      personalizedResultTitle: "부동산 문서 2차 개인화 결과",
      personalizedResultIntro:
        "1차 확인과 2차 추가 답변을 통합해 현재 상황에 맞게 정리한 검토 결과입니다.",
      paidDetailReviewDescription:
        "내 상황과 자료를 바탕으로 계약 조건을 더 깊이 확인합니다.",
      firstResultCautionsSectionSubtitle: packCautionsSubtitle("RE01"),
    },
  };

  return {
    getContentSlots: () => contentSlots,

    getFirstResultContentSlots(answers) {
      const map = asAnswerMap(answers);
      const caseId = resolveCaseFromAnswers(map);
      const subtitle =
        packCautionsSubtitle(caseId) ?? contentSlots.firstResult?.firstResultCautionsSectionSubtitle;
      const base = contentSlots.firstResult ?? {};
      const out: VerifyMasterContentSlots["firstResult"] = {
        ...base,
        firstResultCautionsSectionSubtitle: subtitle,
      };
      if (caseId !== "RE06" && hasFirstResultVerdictFloor(caseId)) {
        const data = buildFirstResultData(caseId, map);
        if (data.cautions.length === 0) {
          const floorCopy = resolveFirstResultNoRiskFloorCopy(caseId, map);
          if (floorCopy) {
            out.firstResultNoRiskTitle = floorCopy.title;
            out.firstResultNoRiskBody = floorCopy.body;
          }
        }
      }
      return out;
    },

    buildReviewQuestions(answers, profilePhase) {
      const map = asAnswerMap(answers);
      const list: PackReviewQuestion[] = [];
      if (profilePhase === 1) {
        list.push({
          id: Q1_KEY,
          kind: "choice",
          label: Q1_TITLE,
          options: appendPackVerifyDirectExplainOption(
            getQ1Options().map((o) => ({ value: o.value, label: o.label })),
          ),
        });
        const caseId = resolveCaseFromAnswers(map);
        if (caseId !== "RE06") {
          for (const id of phase1QuestionIds(caseId)) {
            const q = packNodeToReview(caseId, id, map);
            if (q) list.push(q);
          }
        }
        return list;
      }
      const caseId = resolveCaseFromAnswers(map);
      if (caseId === "RE06") return list;
      for (const id of phase2QuestionIds(caseId, map)) {
        const q = packNodeToReview(caseId, id, map);
        if (q) list.push(q);
      }
      return list;
    },

    isPhase1Complete(answers) {
      const map = asAnswerMap(answers);
      const entry = map[Q1_KEY];
      if (!entry || String(entry).trim() === "") return false;
      const caseId = resolveCaseFromAnswers(map);
      if (caseId === "RE06") return true;
      return isPhase1Complete(caseId, map);
    },

    isPhase2QuestionSetComplete(answers) {
      const map = asAnswerMap(answers);
      const caseId = resolveCaseFromAnswers(map);
      if (caseId === "RE06") return true;
      const ids = phase2QuestionIds(caseId, map);
      return ids.every((id) => {
        const v = map[id];
        if (v == null || v === "") return false;
        if (Array.isArray(v)) return v.length > 0;
        return String(v).trim().length > 0;
      });
    },

    buildFirstResult(answers) {
      const map = asAnswerMap(answers);
      const caseId = resolveCaseFromAnswers(map);
      const note = String(map[`${Q1_KEY}Note`] ?? "");
      return buildFirstResultData(caseId, map, note);
    },

    resolveFirstResultTransition(answers, data) {
      const caseId = resolveCaseFromAnswers(asAnswerMap(answers));
      return resolveRealEstatePackTransitionHooks(caseId, data);
    },

    getSignupRiskLevel(answers) {
      const map = asAnswerMap(answers);
      const caseId = resolveCaseFromAnswers(map);
      if (caseId === "RE06") return "medium";
      const note = String(map[`${Q1_KEY}Note`] ?? "");
      const j = aggregateJudgmentForCase(caseId, map, note);
      if (j.level === "special" || j.level === "expert") return "high";
      if (j.level === "caution") return "medium";
      return "low";
    },
  };
}

/** Stitch 진행 표시 — Pack 질문 목록 기준 */
export function getPackVerifyStitchProgress(
  questions: PackReviewQuestion[],
  activeIndex: number,
): { current: number; total: number } {
  const total = Math.max(questions.length, 1);
  const current = activeIndex >= 0 ? activeIndex + 1 : 1;
  return { current, total };
}

/** 로그인 회원 handoff — crm_activities.verify_lead meta (Pack 답변 flat 저장) */
export function buildRealEstatePackMemberVerifyMeta(
  answers: Record<string, string>,
  file?: { storagePath: string; file_name: string } | null,
): Record<string, unknown> {
  const map = asAnswerMap(answers);
  const caseId = resolveCaseFromAnswers(map);
  return {
    real_estate_pack_v1: true,
    real_estate_pack_case_id: caseId,
    ...answers,
    ...(file
      ? {
          storagePath: file.storagePath,
          file_name: file.file_name,
          submitted_document: {
            storagePath: file.storagePath,
            file_name: file.file_name,
          },
        }
      : {}),
  };
}

export function formatPackAnswerLabel(
  question: PackReviewQuestion,
  answers: Record<string, string>,
): string {
  const raw = answers[question.id];
  if (!raw) return "—";
  if (question.kind === "choice") {
    const caseId = resolveCaseFromAnswers(asAnswerMap(answers));
    const node = getNode(caseId, question.id);
    if (node) return optionLabel(node, String(raw));
    const opt = question.options.find((o) => o.value === raw);
    return opt?.label ?? raw;
  }
  return raw;
}
