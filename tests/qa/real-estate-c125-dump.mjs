import fs from "fs";
import path from "path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { enumerateCoveringPhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { AdminVerifyFirstResultPanel } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";

const CASES = ["RE02", "RE03", "RE04", "RE05"];
const OUT = path.join("tests/qa/_output");
const bridge = createRealEstateVerifyMasterPackBridge();
const PER_CASE = 20;

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
    const slots = bridge.getFirstResultContentSlots(answers);
    const html = renderToStaticMarkup(
      createElement(AdminVerifyFirstResultPanel, {
        data,
        onContinue: () => {},
        domain: "real-estate",
        contentSlots: slots,
      }),
    );
    const text = strip(html);
    lines.push(`--- combo ${caseId}-${idx} ---`);
    lines.push(`grade: ${data.gradeLabel}`);
    lines.push(`cautions_count: ${data.cautions.length}`);
    lines.push(`cautions_subtitle: ${slots.firstResultCautionsSectionSubtitle ?? ""}`);
    lines.push(`no_risk_title_slot: ${slots.firstResultNoRiskTitle ?? "(default)"}`);
    lines.push(`no_risk_body_slot: ${slots.firstResultNoRiskBody ?? "(default)"}`);
    if (data.cautions.length === 0) {
      const titleIn = slots.firstResultNoRiskTitle ?? "현재 확인한 답변에서는 주의할 위험 요인이 보이지 않습니다.";
      lines.push(`rendered_no_risk_title: ${text.includes(titleIn) ? titleIn : "MISSING"}`);
    }
    lines.push("");
    if (idx >= PER_CASE) break;
  }
  fs.writeFileSync(path.join(OUT, `c125-dump-${caseId}.txt`), lines.join("\n"), "utf8");
}
console.log("wrote c125-dump-RE02..RE05.txt");
