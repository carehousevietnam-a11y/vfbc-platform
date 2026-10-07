import type {
  AdminVerifyFirstResultData,
  AdminVerifyKeyMetric,
} from "@/components/cost-check/AdminVerifyFirstResultPanel";
import type { RiskLevel } from "../engine/packRunner";
import type { AnswerMap, ContentPackNode, RealEstateCaseId } from "./types";
import { buildResultMetrics, buildResultSteps } from "./m45Engine";

type Grade = { filled: number; label: string; tone: "ok" | "caution"; expertHandoff: boolean };

function headlineFor(grade: Grade, hasIssues: boolean): string {
  if (grade.expertHandoff) return "VFBCAI 전문가팀 진행이 필요한 사건입니다";
  if (grade.label === "전문가 권장") return "전문가 권장 단계로 점검이 필요합니다";
  if (grade.label === "주의") return "주의 단계로 점검이 필요합니다";
  if (hasIssues) return "확인이 필요한 부분이 있습니다";
  return "현재 확인한 범위에서는 큰 문제가 보이지 않습니다";
}

const METRIC_CARD_META: { label: string; title: string }[] = [
  { label: "01. 상황", title: "계약·진행 상황" },
  { label: "02. 확인 목표", title: "우선 확인 목표" },
  { label: "03. 대응·자료", title: "대응·준비 자료" },
];

function needsAttention(level: RiskLevel, cautions: string[], expertHandoff: boolean): boolean {
  if (expertHandoff || level === "special" || level === "expert" || level === "caution") return true;
  return cautions.length > 0;
}

function metricCardStatus(attention: boolean): AdminVerifyKeyMetric["status"] {
  return attention ? "caution" : "ok";
}

export { buildResultMetrics, buildResultSteps } from "./m45Engine";

export type { PackM45 } from "./generated/m45";

export function buildFirstResultPayload(
  caseId: RealEstateCaseId,
  answers: AnswerMap,
  grade: Grade,
  cautions: string[],
  getNode: (caseId: RealEstateCaseId, id: string) => ContentPackNode | undefined,
  caseLabel: string,
  judgmentLevel: RiskLevel,
  expertHandoff: boolean,
  phase1VerdictBoost = false,
  firstResultVerdictFloor = false,
): AdminVerifyFirstResultData {
  const [m1, m2, m3] = buildResultMetrics(caseId, answers);
  const metricLines = [m1, m2, m3];
  const today = new Date();
  const ref = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
  const actions = buildResultSteps(caseId, answers);
  const attention =
    firstResultVerdictFloor ||
    phase1VerdictBoost ||
    needsAttention(judgmentLevel, cautions, expertHandoff);
  const statusHeadline = headlineFor(grade, attention);
  const situationLead = attention
    ? `현재 파악된 사건 유형(${caseLabel}) 기준으로 보면, 일부 항목은 추가 확인이 필요합니다.`
    : `현재 파악된 사건 유형(${caseLabel}) 기준으로 보면, 확인한 범위에서는 큰 불일치가 보이지 않습니다.`;
  const situationSummary = situationLead;
  const keyMetrics: AdminVerifyKeyMetric[] = METRIC_CARD_META.map((meta, i) => {
    const footnote = (metricLines[i] ?? "").trim();
    return {
      label: meta.label,
      title: meta.title,
      footnote,
      status: footnote ? metricCardStatus(attention) : "caution",
    };
  });
  return {
    stageLabel: "검토",
    statusHeadline,
    statusTone: attention ? "caution" : "ok",
    situationSummary,
    gradeFilled: attention ? Math.max(grade.filled, 2) : 1,
    gradeLabel: attention ? "주의 요망 (2단계)" : "양호 (1단계)",
    keyMetrics,
    cautions,
    unconfirmed: [],
    actions,
    referenceDateLabel: ref,
    caseClassificationLabel: caseLabel,
    case06ExpertHandoffRequired: grade.expertHandoff,
  };
}
