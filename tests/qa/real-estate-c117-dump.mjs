import fs from "fs";
import path from "path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { enumerateCoveringPhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { AdminVerifyFirstResultPanel } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import { optionLabel } from "../../src/lib/contentPacks/runner.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const OUT = path.join("tests/qa/_output");
const bridge = createRealEstateVerifyMasterPackBridge();
const contentSlots = bridge.getContentSlots().firstResult;
const bundle = realEstatePackBundle();

function labelsFor(caseId, answers) {
  const ids = bundle.phase1Order?.[caseId] ?? [];
  return ids
    .map((id) => {
      const node = bundle.nodes[caseId]?.find((n) => n.id === id);
      if (!node) return null;
      const v = answers[id];
      if (v == null) return null;
      return `${id}=${optionLabel(node, Array.isArray(v) ? v[0] : String(v))}`;
    })
    .filter(Boolean);
}

function strip(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

fs.mkdirSync(OUT, { recursive: true });

for (const caseId of CASES) {
  const lines = [];
  let idx = 0;
  for (const answers of enumerateCoveringPhase1Combinations(caseId)) {
    idx++;
    const data = buildFirstResultData(caseId, answers);
    const html = renderToStaticMarkup(
      createElement(AdminVerifyFirstResultPanel, {
        data,
        onContinue: () => {},
        contentSlots,
        transitionHooks: bridge.resolveFirstResultTransition(answers, data),
      }),
    );
    const visible = strip(html);
    lines.push(`--- combo ${caseId}-${idx} ---`);
    lines.push(`choices: ${labelsFor(caseId, answers).join(" | ")}`);
    lines.push(`headline: ${data.statusHeadline}`);
    lines.push(`summary: ${data.situationSummary}`);
    lines.push(`grade: ${data.gradeLabel}`);
    lines.push(`m1: ${data.keyMetrics[0]?.footnote ?? ""}`);
    lines.push(`m2: ${data.keyMetrics[1]?.footnote ?? ""}`);
    lines.push(`m3: ${data.keyMetrics[2]?.footnote ?? ""}`);
    lines.push(`cautions_subtitle: ${visible.includes("계약 전 확인") ? "| 계약 전 확인 핵심 포인트" : visible.match(/반려 방지|계약 전 확인/)?.[0] ?? ""}`);
    lines.push(`transition_what: ${bridge.resolveFirstResultTransition(answers, data).hookWhatMore}`);
    lines.push("");
  }
  fs.writeFileSync(path.join(OUT, `c117-dump-${caseId}.txt`), lines.join("\n"), "utf8");
}
console.log("wrote c117-dump-RE01..RE05.txt");
