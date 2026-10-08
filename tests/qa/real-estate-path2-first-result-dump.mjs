/**
 * C1.15 — 경로2(마지막 선택지) 1차 결과 렌더 전문 덤프
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildPath2Phase1Answers } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { AdminVerifyFirstResultPanel } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";
import { findJosaViolations } from "../../src/lib/contentPacks/realEstate/koreanParticle.ts";
import { isRe01ViewingOwnerConflict } from "../../src/lib/contentPacks/realEstate/m45Engine.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();
const contentSlots = bridge.getContentSlots().firstResult;

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .replace(/\n+/g, "\n")
    .trim();
}

for (const caseId of CASES) {
  const answers = buildPath2Phase1Answers(caseId);
  const data = buildFirstResultData(caseId, answers);
  const html = renderToStaticMarkup(
    createElement(AdminVerifyFirstResultPanel, {
      data,
      onContinue: () => {},
      contentSlots,
      transitionHooks: bridge.resolveFirstResultTransition(answers, data),
    }),
  );
  const visible = stripTags(html);
  const packText = [
    data.statusHeadline,
    data.situationSummary,
    ...data.keyMetrics.map((m) => m.footnote),
  ].join("\n");
  const m1 = data.keyMetrics[0]?.footnote ?? "";
  const m2 = data.keyMetrics[1]?.footnote ?? "";
  const checks = {
    josa: findJosaViolations(packText),
    summary_eq_m1: (data.situationSummary ?? "").trim() === m1.trim(),
    grade_ok:
      data.statusTone === "caution"
        ? data.gradeLabel === "주의 요망 (2단계)"
        : data.gradeLabel === "양호 (1단계)",
    re01_conflict: caseId === "RE01" ? isRe01ViewingOwnerConflict(answers, m1, m2) : false,
  };
  console.log(`\n========== ${caseId} PATH2 ==========`);
  console.log("--- answers ---");
  console.log(JSON.stringify(answers, null, 2));
  console.log("--- pack fields ---");
  console.log(packText);
  console.log("--- checks ---");
  console.log(JSON.stringify(checks, null, 2));
  console.log("--- visible text (excerpt 4000) ---");
  console.log(visible.slice(0, 4000));
}
