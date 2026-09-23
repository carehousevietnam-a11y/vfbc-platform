import { buildCase01Phase2QuestionPlan, isCase01PathComplete } from "../src/lib/adminVerifyProfiling.ts";

const phase1Base = {
  _case01Active: "1",
  case01_violationContent: "traffic",
  case01_confirmGoal: "verify_applicability",
  case01_customerResponded: "none",
  case01_deadline: "confirmed",
};

const scenarios = {
  A: {
    ...phase1Base,
    case01_authorityDemand: "payment",
    case01_factRelationship: "match",
    case01_authorityResponse: "not_yet",
    case01_evidence: "notice",
  },
  B: {
    ...phase1Base,
    case01_authorityDemand: "unclear",
    case01_factRelationship: "unknown",
    case01_actualSituation: "unsure",
    case01_authorityResponse: "not_yet",
    case01_evidence: "none",
    case01_factRelationshipNote: "날짜와 장소를 더 확인해야 합니다",
    case01_authorityDemandNote: "무엇을 해야 하는지 모르겠습니다",
  },
  "B-mid": {
    ...phase1Base,
    case01_authorityDemand: "unclear",
    case01_factRelationship: "unknown",
  },
  C: {
    ...phase1Base,
    case01_customerResponded: "explained_unresolved",
    case01_authorityDemand: "attendance",
    case01_factRelationship: "partial_situation",
    case01_authorityResponse: "more_required",
    case01_evidence: "submitted_docs",
    case01_factRelationshipNote: "날짜가 다릅니다",
    case01_authorityResponseNote: "추가 서류를 요구했습니다",
  },
  D: {
    ...phase1Base,
    case01_confirmGoal: "verify_violation",
    case01_customerResponded: "explained_unresolved",
    case01_authorityDemand: "payment",
    case01_factRelationship: "deny_action",
    case01_authorityResponse: "explained_no_reply",
    case01_evidence: "notice",
    case01_factRelationshipNote: "그 행동을 하지 않았습니다",
  },
  E: {
    ...phase1Base,
    case01_authorityDemand: "attendance",
    case01_factRelationship: "date_place_wrong",
    case01_authorityResponse: "not_yet",
    case01_evidence: "message",
    case01_factRelationshipNote: "날짜와 장소가 다릅니다",
  },
  "E-mid": {
    ...phase1Base,
    case01_authorityDemand: "attendance",
    case01_factRelationship: "date_place_wrong",
    case01_actualSituation: "deny",
    case01_authorityResponse: "not_yet",
    case01_evidence: "message",
  },
};

const coreFields = [
  "case01_authorityDemand",
  "case01_factRelationship",
  "case01_actualSituation",
  "case01_authorityResponse",
  "case01_evidence",
];

for (const [id, answers] of Object.entries(scenarios)) {
  const plan = buildCase01Phase2QuestionPlan(answers);
  const next = buildCase01Phase2QuestionPlan({});
  console.log(`Scenario ${id}`);
  console.log("  planIds:", plan.map((q) => q.id).join(" -> ") || "(complete — no pending)");
  console.log("  planCount:", plan.length);
  console.log("  pathComplete:", isCase01PathComplete(answers));
  console.log(
    "  coreResolved:",
    coreFields
      .map((field) => {
        if (field === "case01_actualSituation") {
          const carried =
            answers.case01_actualSituation ||
            ["match", "partial_situation", "deny_action", "date_place_wrong"].includes(
              answers.case01_factRelationship,
            );
          return `${field}:${carried ? "yes" : "no"}`;
        }
        return `${field}:${answers[field] ? "yes" : "no"}`;
      })
      .join(", "),
  );
  console.log("  freshStart:", next.map((q) => q.id).slice(0, 5).join(" -> "));
  console.log("");
}
