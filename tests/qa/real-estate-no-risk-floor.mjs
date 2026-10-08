/**
 * C1.25 — 판정 하한 + 위험 0건 시 §03 「먼저 확인할 사항」; RE01 양호 문구 유지
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import {
  AdminVerifyFirstResultPanel,
  FIRST_RESULT_DEFAULT_NO_RISK_BODY,
  FIRST_RESULT_DEFAULT_NO_RISK_TITLE,
} from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import { hasFirstResultVerdictFloor } from "../../src/lib/contentPacks/realEstate/phase1VerdictBoost.ts";

const POST = ["RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();
const FLOOR_TITLE = "먼저 확인할 사항";
const OLD_TITLE = FIRST_RESULT_DEFAULT_NO_RISK_TITLE;
const OLD_BODY_SNIP = "주의할 위험 요인이 보이지 않습니다";

const stats = {
  floor_zero_caution_combos: 0,
  floor_zero_missing_new_copy: 0,
  floor_zero_old_copy: 0,
  re01_ok_changed: 0,
  ok_grade_wrong_no_risk: 0,
};

function renderNoRiskHtml(answers, caseId) {
  const data = buildFirstResultData(caseId, answers);
  const slots = bridge.getFirstResultContentSlots(answers);
  return renderToStaticMarkup(
    createElement(AdminVerifyFirstResultPanel, {
      data,
      onContinue: () => {},
      domain: "real-estate",
      contentSlots: slots,
    }),
  );
}

for (const caseId of ["RE01", ...POST]) {
  for (const answers of enumeratePhase1Combinations(caseId)) {
    const data = buildFirstResultData(caseId, answers);
    const isCaution = data.gradeLabel.includes("주의 요망");
    const zeroRisk = data.cautions.length === 0;
    const floor = hasFirstResultVerdictFloor(caseId);

    if (caseId === "RE01" && data.gradeLabel.includes("양호")) {
      const html = renderNoRiskHtml(answers, caseId);
      if (!html.includes(OLD_TITLE) || html.includes(FLOOR_TITLE)) stats.re01_ok_changed++;
      continue;
    }

    if (POST.includes(caseId) && isCaution && zeroRisk && floor) {
      stats.floor_zero_caution_combos++;
      const html = renderNoRiskHtml(answers, caseId);
      if (!html.includes(FLOOR_TITLE)) stats.floor_zero_missing_new_copy++;
      if (html.includes(OLD_TITLE) || html.includes(OLD_BODY_SNIP)) stats.floor_zero_old_copy++;
    }

    if (data.gradeLabel.includes("양호") && zeroRisk) {
      const html = renderNoRiskHtml(answers, caseId);
      if (html.includes(FLOOR_TITLE)) stats.ok_grade_wrong_no_risk++;
    }
  }
}

console.log(JSON.stringify(stats, null, 2));
const fail =
  stats.floor_zero_missing_new_copy > 0 ||
  stats.floor_zero_old_copy > 0 ||
  stats.re01_ok_changed > 0 ||
  stats.ok_grade_wrong_no_risk > 0;
if (fail) process.exit(1);
