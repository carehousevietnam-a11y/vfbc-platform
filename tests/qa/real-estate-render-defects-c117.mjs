import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { renderDefectHits, isFalseOkVerdict } from "../../src/lib/contentPacks/realEstate/renderDefectChecks.ts";
import { comboIncludesHighRisk } from "../../src/lib/contentPacks/realEstate/riskSelectionCatalog.ts";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminVerifyFirstResultPanel } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();
const contentSlots = bridge.getContentSlots().firstResult;

const totals = Object.fromEntries(
  CASES.map((c) => [
    c,
    {
      combos: 0,
      orphan_josa_start: 0,
      bare_state_ime: 0,
      missing_period: 0,
      double_space: 0,
      empty_paren: 0,
      brace_leftover: 0,
      generic_fallback: 0,
      admin_doc_phrase: 0,
      false_ok_high_risk: 0,
    },
  ]),
);

for (const caseId of CASES) {
  for (const answers of enumeratePhase1Combinations(caseId)) {
    totals[caseId].combos++;
    const data = buildFirstResultData(caseId, answers);
    const transition = bridge.resolveFirstResultTransition(answers, data);
    const html = renderToStaticMarkup(
      createElement(AdminVerifyFirstResultPanel, {
        data,
        onContinue: () => {},
        contentSlots,
        transitionHooks: transition,
      }),
    );
    const visible = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const packText = data.keyMetrics.map((m) => m.footnote ?? "").filter(Boolean).join("\n");
    const hits = renderDefectHits(packText, visible, transition);
    for (const k of Object.keys(hits)) {
      if (k in totals[caseId]) totals[caseId][k] += hits[k];
    }
    if (comboIncludesHighRisk(caseId, answers) && isFalseOkVerdict(data)) {
      totals[caseId].false_ok_high_risk++;
    }
  }
}

console.log(JSON.stringify(totals, null, 2));
