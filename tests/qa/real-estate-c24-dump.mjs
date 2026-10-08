import fs from "fs";
import path from "path";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import {
  isPhase2QuestionSetComplete,
  phase2QuestionIds,
} from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { buildRealEstatePackPhase2PersistMeta } from "../../src/lib/contentPacks/realEstate/packPhase2Persist.ts";
import { buildRealEstatePhase2SummaryLinesFromActivities } from "../../src/lib/contentPacks/realEstate/realEstatePackMypageFields.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();
const bundle = realEstatePackBundle();
const OUT = path.join("tests/qa/_output");
fs.mkdirSync(OUT, { recursive: true });

function optionAt(node, variant) {
  if (node.kind === "text") return `detail-${variant}`;
  const opts = node.options ?? [];
  if (!opts.length) return "01";
  return opts[variant % opts.length]?.value ?? opts[0].value;
}

function walkPhase2Variant(caseId, phase1Answers, variant) {
  const answers = { ...phase1Answers };
  for (let round = 0; round < 64; round++) {
    const ids = phase2QuestionIds(caseId, answers);
    let changed = false;
    for (const id of ids) {
      if (answers[id] != null && String(answers[id]).trim() !== "") continue;
      const node = bundle.nodes[caseId]?.find((n) => n.id === id);
      if (!node) continue;
      answers[id] = optionAt(node, variant + ids.indexOf(id));
      changed = true;
    }
    if (!changed && isPhase2QuestionSetComplete(caseId, answers)) break;
  }
  return answers;
}

for (const caseId of CASES) {
  const lines = [];
  const combos = [...enumeratePhase1Combinations(caseId)];
  const step = Math.max(1, Math.floor(combos.length / 20));
  let written = 0;
  for (let i = 0; i < combos.length && written < 20; i += step) {
    const answers = walkPhase2Variant(caseId, combos[i], written);
    const data = bridge.buildPersonalizedResult(answers);
    const persist = buildRealEstatePackPhase2PersistMeta(answers, 2);
    const mypageLines = buildRealEstatePhase2SummaryLinesFromActivities([
      { action: "verify_lead", meta: persist },
    ]);
    lines.push(`=== ${caseId} path ${written + 1} ===`);
    lines.push(`grade2_screen: ${data?.gradeFilled} (${data?.gradeLabel})`);
    lines.push(`grade2_persist: ${persist.real_estate_pack_grade2}`);
    lines.push(`summary_screen: ${data?.situationSummary ?? ""}`);
    lines.push(`summary_persist: ${persist.real_estate_pack_phase2_summary ?? ""}`);
    lines.push(`mypage_lines: ${mypageLines.join(" | ")}`);
    lines.push(`persist_keys: ${Object.keys(persist).sort().join(", ")}`);
    lines.push("");
    written++;
  }
  fs.writeFileSync(path.join(OUT, `c24-dump-${caseId}.txt`), lines.join("\n"), "utf8");
}

console.log("wrote c24-dump-RE01..05.txt");
