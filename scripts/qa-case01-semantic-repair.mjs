import {
  attachCaseResolutionSnapshot,
  buildCase01Phase2RenderedChainAudit,
  runCase01QaScenario,
  ADMIN_DIRECT_EXPLAIN_LABEL,
} from "../src/lib/adminVerifyProfiling.ts";

const SCENARIOS = {
  A: "match + 아직 대응 안 함 + payment(included)",
  B: "unknown relationship + understanding_unknown demand",
  C: "partial + has_responded + explained_situation",
  D: "deny_action + has_responded + disputed_facts",
  E: "date_place_wrong + none response",
  F: "payment included (payment scenario)",
  G: "supplement included",
};

const scenarioIds = Object.keys(SCENARIOS);

const base = {
  adminCaseDocumentKind: "violation_notice",
  situation: "received_document",
  profileDocumentSource: "court",
  profileReceivedReason: "rejection",
  stage: "case",
};
const phase1 = {
  case01_violationContent: "traffic",
  case01_factRelationship: "match",
  case01_customerResponded: "none",
  case01_deadline: "uncertain",
  case01_confirmGoal: "verify_applicability",
};
const scenarioAnswers = {
  A: {
    ...base,
    ...phase1,
    case01_authorityDemand: "payment",
    case01_paymentDemandScope: "included_with_other",
    case01_actualSituation: "accept_facts",
    case01_deadline: "confirmed",
    case01_deadlineDate: "2026-10-15",
    case01_evidence: "notice",
  },
  B: {
    ...base,
    ...phase1,
    case01_factRelationship: "unknown",
    case01_confirmGoal: "why_notice",
      case01_authorityDemand: "demand_unclear",
    case01_actualSituation: "unsure",
    case01_deadline: "unknown",
    case01_evidence: "none",
    case01_factRelationshipNote: "날짜와 장소를 더 확인해야 합니다",
    case01_authorityDemandNote: "무엇을 해야 하는지 모르겠습니다",
    case01_blockage: "content_unclear",
  },
  C: {
    ...base,
    case01_violationContent: "traffic",
    case01_factRelationship: "partial_situation",
    case01_confirmGoal: "fact_difference",
    case01_customerResponded: "has_responded",
    case01_authorityDemand: "attendance",
    case01_actualSituation: "partial",
    case01_deadline: "uncertain",
    case01_responseDetail: "explained_situation",
    case01_authorityResponse: "more_required",
    case01_evidence: "submitted_docs",
    case01_factDifferenceDetail: "날짜가 다릅니다",
    case01_authorityResponseNote: "추가 서류를 요구했습니다",
  },
  D: {
    ...base,
    case01_violationContent: "traffic",
    case01_factRelationship: "deny_action",
    case01_confirmGoal: "fact_difference",
    case01_customerResponded: "has_responded",
    case01_authorityDemand: "attendance",
    case01_actualSituation: "deny",
    case01_deadline: "confirmed",
    case01_deadlineDate: "2026-11-01",
    case01_responseDetail: "disputed_facts",
    case01_authorityResponse: "re_attendance",
    case01_evidence: "notice",
    case01_factDifferenceDetail: "그 행동을 하지 않았습니다",
  },
  E: {
    ...base,
    case01_violationContent: "traffic",
    case01_factRelationship: "date_place_wrong",
    case01_confirmGoal: "fact_difference",
    case01_customerResponded: "none",
    case01_authorityDemand: "attendance",
    case01_actualSituation: "deny",
    case01_deadline: "uncertain",
    case01_evidence: "message",
    case01_factDifferenceDetail: "날짜와 장소가 다릅니다",
    case01_datePlaceDetail: "2024년 3월, 다른 지역에 있었습니다",
  },
  F: {
    ...base,
    ...phase1,
    case01_authorityDemand: "payment",
    case01_paymentDemandScope: "included_with_other",
    case01_actualSituation: "accept_facts",
    case01_deadline: "confirmed",
    case01_deadlineDate: "2026-12-01",
    case01_evidence: "notice",
  },
  G: {
    ...base,
    ...phase1,
    case01_authorityDemand: "supplement",
    case01_supplementDemandScope: "included_with_notice",
    case01_actualSituation: "accept_facts",
    case01_deadline: "confirmed",
    case01_deadlineDate: "2026-09-30",
    case01_evidence: "submitted_docs",
  },
};

const allReports = {};

for (const id of scenarioIds) {
  const answers = attachCaseResolutionSnapshot(scenarioAnswers[id]);
  const audit = buildCase01Phase2RenderedChainAudit(answers);
  const qa = runCase01QaScenario(id);
  allReports[id] = {
    description: SCENARIOS[id],
    renderedCount: audit.renderedCount,
    pathComplete: audit.pathComplete,
    steps: audit.steps,
    skipped: audit.skipped,
  };
}

import { writeFileSync } from "node:fs";
writeFileSync("scripts/qa-case01-semantic-audit.json", JSON.stringify(allReports, null, 2), "utf8");
console.log(JSON.stringify(allReports, null, 2));

// Summary checks
let failAxis = 0;
let oldDeadline = 0;
let badDirectInput = 0;
for (const [id, report] of Object.entries(allReports)) {
  for (const step of report.steps) {
    if (!step.axisAligned) failAxis += 1;
    if (step.questionText.includes("언제까지 어떤 대응")) oldDeadline += 1;
    for (const choice of step.choices) {
      if (choice.value === "other" && choice.label !== ADMIN_DIRECT_EXPLAIN_LABEL) {
        badDirectInput += 1;
      }
    }
  }
  console.error(
    `[SUMMARY ${id}] rendered=${report.renderedCount} pathComplete=${report.pathComplete}`,
  );
}
console.error(
  `[GLOBAL] axisFail=${failAxis} oldDeadlineQuestion=${oldDeadline} badDirectInput=${badDirectInput}`,
);
