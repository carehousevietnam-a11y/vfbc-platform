import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { isFalseOkVerdict } from "../../src/lib/contentPacks/realEstate/renderDefectChecks.ts";

const POST_CASES = ["RE02", "RE03", "RE04", "RE05"];
const out = {
  ok_headline_post_contract: 0,
  re01_verdict_changed: 0,
  already_caution_changed: 0,
  newly_raised_to_caution: 0,
  headline_summary_grade_mismatch: 0,
};

function presentationMismatch(data) {
  const okHeadline = data.statusHeadline.includes("큰 문제가 보이지 않습니다");
  const okSummary = data.situationSummary.includes("큰 불일치가 보이지 않습니다");
  const okGrade = data.gradeLabel === "양호 (1단계)";
  const cautionTone = data.statusTone === "caution";
  if (okHeadline || okSummary || okGrade) return true;
  if (!cautionTone) return true;
  return false;
}

for (const caseId of ["RE01", ...POST_CASES]) {
  for (const answers of enumeratePhase1Combinations(caseId)) {
    const after = buildFirstResultData(caseId, answers);
    const before = buildFirstResultData(caseId, answers, undefined, { ignoreVerdictFloor: true });

    if (POST_CASES.includes(caseId) && isFalseOkVerdict(after)) out.ok_headline_post_contract++;
    if (caseId === "RE01") {
      if (
        before.statusHeadline !== after.statusHeadline ||
        before.gradeLabel !== after.gradeLabel ||
        before.statusTone !== after.statusTone ||
        before.situationSummary !== after.situationSummary
      ) {
        out.re01_verdict_changed++;
      }
    }
    if (before.statusTone === "caution") {
      if (
        before.statusHeadline !== after.statusHeadline ||
        before.gradeLabel !== after.gradeLabel ||
        before.situationSummary !== after.situationSummary
      ) {
        out.already_caution_changed++;
      }
    }
    if (before.statusTone === "ok" && after.statusTone === "caution") out.newly_raised_to_caution++;
    if (POST_CASES.includes(caseId) && presentationMismatch(after)) out.headline_summary_grade_mismatch++;
  }
}

console.log(JSON.stringify(out, null, 2));
const fail =
  out.ok_headline_post_contract > 0 ||
  out.re01_verdict_changed > 0 ||
  out.already_caution_changed > 0 ||
  out.headline_summary_grade_mismatch > 0;
if (fail) process.exit(1);
