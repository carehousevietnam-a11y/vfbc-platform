import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  ADMIN_CASE_ENTRY_Q1_KEY,
  attachCaseResolutionSnapshot,
  getAdminChoiceNoteKey,
  CASE01_FACT_DIFFERENCE_DETAIL_KEY,
  CASE01_DATE_PLACE_DETAIL_KEY,
} from "../../src/lib/adminVerifyProfiling.ts";
import {
  buildAdminVerifyPersonalizedContext,
  buildAdminVerifyPersonalizedResult,
} from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";

const OUT = join(process.cwd(), "test-results", "case01-personalized-full-chain");
mkdirSync(OUT, { recursive: true });

const NEEDLES = [
  "신호 위치와 시간이 다릅니다",
  "2026-10-01 1군 응우온후에",
  "현장 사진 추가 제출",
  "사진·영상",
  "설명받은 내용과 실제 상황이 다르다고 이야기했습니다",
];

const answers = attachCaseResolutionSnapshot({
  situation: "received_document",
  stage: "case",
  profileDocumentSource: "court",
  [ADMIN_CASE_ENTRY_Q1_KEY]: "violation_notice",
  case01_violationContent: "traffic_spatiotemporal_dispute",
  case01_factRelationship: "date_place_wrong",
  case01_customerResponded: "has_responded",
  case01_deadline: "deadline_window_only",
  case01_confirmGoal: "fact_difference",
  case01_authorityDemand: "payment",
  case01_paymentDemandScope: "core_case",
  case01_actualSituation: "deny",
  [CASE01_FACT_DIFFERENCE_DETAIL_KEY]: "신호 위치와 시간이 다릅니다",
  [CASE01_DATE_PLACE_DETAIL_KEY]: "2026-10-01 1군 응우온후에",
  case01_responseDetail: "disputed_facts",
  case01_authorityResponse: "more_required",
  [getAdminChoiceNoteKey("case01_authorityResponse")]: "현장 사진 추가 제출",
  case01_evidence: "photo_video",
  case01_blockage: "facts_why",
});

const ctx = buildAdminVerifyPersonalizedContext(answers);
const result = buildAdminVerifyPersonalizedResult(answers, ctx);
const summaryOnly = (result.case01PrincipleFStateLines ?? []).join("\n");
const blob = [
  summaryOnly,
  result.unconfirmed.join(" "),
].join("\n");

const checks = NEEDLES.map((needle) => ({
  needle,
  found: blob.includes(needle),
}));

const report = {
  checks,
  pass: checks.every((c) => c.found),
  integratedSituation: ctx.integratedSituation,
  phase2Additions: ctx.phase2Additions,
  phase2Text: ctx.phase2Additions.join(" "),
  principleF: result.case01PrincipleFStateLines,
};
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass: report.pass, checks }, null, 2));
process.exitCode = report.pass ? 0 : 1;
