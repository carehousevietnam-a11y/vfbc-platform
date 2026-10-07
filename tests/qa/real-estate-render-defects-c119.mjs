import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { renderDefectHitsC119 } from "../../src/lib/contentPacks/realEstate/renderDefectChecks.ts";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminVerifyFirstResultPanel } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();
const KEYS = [
  "adjacent_dup",
  "verb_stem_repeat",
  "hope_form_m2_m3",
  "label_echo",
  "metric_josa",
  "direction_mismatch",
];

const totals = Object.fromEntries(
  CASES.map((c) => [c, { combos: 0, ...Object.fromEntries(KEYS.map((k) => [k, 0])) }]),
);

for (const caseId of CASES) {
  for (const answers of enumeratePhase1Combinations(caseId)) {
    totals[caseId].combos++;
    const data = buildFirstResultData(caseId, answers);
    const transition = bridge.resolveFirstResultTransition(answers, data);
    const slots = bridge.getFirstResultContentSlots(answers);
    const html = renderToStaticMarkup(
      createElement(AdminVerifyFirstResultPanel, {
        data,
        onContinue: () => {},
        contentSlots: slots,
        transitionHooks: transition,
      }),
    );
    const visible = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const metrics = data.keyMetrics.map((m) => m.footnote ?? "");
    const hits = renderDefectHitsC119(metrics, visible, transition, {
      caseId,
      answers,
      subtitle: slots.firstResultCautionsSectionSubtitle,
    });
    for (const k of KEYS) totals[caseId][k] += hits[k] ?? 0;
  }
}

console.log(JSON.stringify(totals, null, 2));
