import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { renderDefectHitsC118 } from "../../src/lib/contentPacks/realEstate/renderDefectChecks.ts";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminVerifyFirstResultPanel } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();

const totals = Object.fromEntries(
  CASES.map((c) => [
    c,
    {
      combos: 0,
      orphan_josa_start: 0,
      metric_josa: 0,
      bad_state_tail: 0,
      direction_mismatch: 0,
      wrong_subtitle: 0,
      missing_period: 0,
      admin_doc_phrase: 0,
    },
  ]),
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
    const metrics = data.keyMetrics.map((m) => m.footnote ?? "").filter(Boolean);
    const hits = renderDefectHitsC118(metrics, visible, transition, {
      caseId,
      answers,
      subtitle: slots.firstResultCautionsSectionSubtitle,
    });
    for (const k of Object.keys(totals[caseId])) {
      if (k !== "combos" && k in hits) totals[caseId][k] += hits[k];
    }
  }
}

console.log(JSON.stringify(totals, null, 2));
