/**
 * C2.1 — phase1 3125 × phase2 visible graph reach
 */
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import {
  isPhase2QuestionSetComplete,
  phase2QuestionIds,
  resolveCaseFromAnswers,
} from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { buildRealEstatePackPhase2PersistMeta, assertPackCaseIdConsistent } from "../../src/lib/contentPacks/realEstate/packPhase2Persist.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();
const bundle = realEstatePackBundle();

function firstOptionFor(node) {
  if (node.kind === "text") return "sample text";
  return node.options[0]?.value ?? "01";
}

function walkPhase2Answers(caseId, phase1Answers) {
  const answers = { ...phase1Answers };
  for (let round = 0; round < 64; round++) {
    const ids = phase2QuestionIds(caseId, answers);
    let changed = false;
    for (const id of ids) {
      if (answers[id] != null && String(answers[id]).trim() !== "") continue;
      const node = bundle.nodes[caseId]?.find((n) => n.id === id);
      if (!node) continue;
      answers[id] = firstOptionFor(node);
      changed = true;
    }
    if (!changed && isPhase2QuestionSetComplete(caseId, answers)) break;
  }
  const ids = phase2QuestionIds(caseId, answers);
  return { answers, ids };
}

const stats = {
  combinations: 0,
  phase2_incomplete: 0,
  empty_chain: 0,
  case_id_mismatch: 0,
  bridge_unanswered: 0,
  progress_total_drift: 0,
};

for (const caseId of CASES) {
  for (const phase1 of enumeratePhase1Combinations(caseId)) {
    stats.combinations++;
    const { answers, ids } = walkPhase2Answers(caseId, phase1);
    if (ids.length === 0) stats.empty_chain++;
    if (!isPhase2QuestionSetComplete(caseId, answers)) stats.phase2_incomplete++;
    try {
      const meta = buildRealEstatePackPhase2PersistMeta(answers, 2);
      assertPackCaseIdConsistent(answers);
      if (meta.real_estate_pack_case_id !== caseId) stats.case_id_mismatch++;
    } catch {
      stats.case_id_mismatch++;
    }
    if (!bridge.isPhase2QuestionSetComplete(answers)) stats.bridge_unanswered++;
    const qs = bridge.buildReviewQuestions(answers, 2);
    const packQs = qs.filter((q) => q.id !== "re_entry");
    if (packQs.length !== ids.length) stats.progress_total_drift++;
  }
}

console.log(JSON.stringify(stats, null, 2));
const fail =
  stats.phase2_incomplete > 0 ||
  stats.empty_chain > 0 ||
  stats.case_id_mismatch > 0 ||
  stats.bridge_unanswered > 0 ||
  stats.progress_total_drift > 0;
if (fail) process.exit(1);
