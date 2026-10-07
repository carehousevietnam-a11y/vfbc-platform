import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { hasPhase1VerdictBoost } from "../../src/lib/contentPacks/realEstate/phase1VerdictBoost.ts";
import { isFalseOkVerdict } from "../../src/lib/contentPacks/realEstate/renderDefectChecks.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const out = { false_ok_with_boost: 0, non_boost_verdict_diff: 0 };

for (const caseId of CASES) {
  for (const answers of enumeratePhase1Combinations(caseId)) {
    const boost = hasPhase1VerdictBoost(caseId, answers);
    const withBoost = buildFirstResultData(caseId, answers);
    if (boost && isFalseOkVerdict(withBoost)) out.false_ok_with_boost++;
    if (!boost && caseId === "RE01") {
      const without = buildFirstResultData(caseId, answers, undefined, { ignoreVerdictBoost: true });
      if (
        withBoost.statusHeadline !== without.statusHeadline ||
        withBoost.gradeLabel !== without.gradeLabel ||
        withBoost.statusTone !== without.statusTone
      ) {
        out.non_boost_verdict_diff++;
      }
    }
  }
}

console.log(JSON.stringify(out, null, 2));
if (out.false_ok_with_boost > 0 || out.non_boost_verdict_diff > 0) process.exit(1);
