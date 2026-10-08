/**
 * C1.16 — 경로1(첫 선택)·경로2(마지막 선택) 1차 결과 덤프
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildPath2Phase1Answers,
  enumeratePhase1Combinations,
} from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { buildFirstResultData } from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { AdminVerifyFirstResultPanel } from "../../src/components/cost-check/AdminVerifyFirstResultPanel.tsx";

const bridge = createRealEstateVerifyMasterPackBridge();
const contentSlots = bridge.getContentSlots().firstResult;

function path1Answers(caseId) {
  return enumeratePhase1Combinations(caseId)[0];
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, "\n")
    .replace(/\n+/g, "\n")
    .trim();
}

function dump(caseId, label, answers) {
  const data = buildFirstResultData(caseId, answers);
  const html = renderToStaticMarkup(
    createElement(AdminVerifyFirstResultPanel, {
      data,
      onContinue: () => {},
      contentSlots,
      transitionHooks: bridge.resolveFirstResultTransition(answers, data),
    }),
  );
  console.log(`\n========== ${caseId} ${label} ==========`);
  console.log(JSON.stringify(answers, null, 2));
  console.log("--- pack ---");
  console.log(
    [data.statusHeadline, data.situationSummary, ...data.keyMetrics.map((m) => m.footnote)].join(
      "\n",
    ),
  );
  console.log("--- visible ---");
  console.log(stripTags(html).slice(0, 5000));
}

dump("RE01", "PATH1", path1Answers("RE01"));
dump("RE01", "PATH2", buildPath2Phase1Answers("RE01"));
