/**
 * C1.23 — Phase1 질문 그래프: 마지막 visible 질문 후 isPhase1Complete + bridge 질문 목록 정합
 */
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import {
  isPhase1Complete,
  visiblePhase1QuestionIds,
} from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();

function isAnswered(q, answers) {
  const v = answers[q.id];
  if (v == null || v === "") return false;
  if (Array.isArray(v)) return v.length > 0;
  return String(v).trim().length > 0;
}

const stats = {
  combinations: 0,
  phase1_incomplete: 0,
  bridge_unanswered: 0,
  progress_total_drift: 0,
};

for (const caseId of CASES) {
  for (const answers of enumeratePhase1Combinations(caseId)) {
    stats.combinations++;
    if (!isPhase1Complete(caseId, answers)) stats.phase1_incomplete++;
    const qs = bridge.buildReviewQuestions(answers, 1);
    const unanswered = qs.filter((q) => !isAnswered(q, answers));
    if (unanswered.length) stats.bridge_unanswered++;
    const visible = visiblePhase1QuestionIds(caseId, answers);
    const packQs = qs.filter((q) => q.id !== "re_entry");
    if (packQs.length !== visible.length) stats.progress_total_drift++;
  }
}

console.log(JSON.stringify(stats, null, 2));
const fail =
  stats.phase1_incomplete > 0 ||
  stats.bridge_unanswered > 0 ||
  stats.progress_total_drift > 0;
if (fail) process.exit(1);
