import fs from "fs";
import path from "path";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { realEstatePackBundle } from "../../src/lib/contentPacks/realEstate/packBundle.ts";
import {
  isPhase2QuestionSetComplete,
  phase2QuestionIds,
} from "../../src/lib/contentPacks/runner.ts";
import { createRealEstateVerifyMasterPackBridge } from "../../src/lib/verifyMasterPackBridge.ts";
import { ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY } from "../../src/lib/adminVerifyProfiling.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const bridge = createRealEstateVerifyMasterPackBridge();
const bundle = realEstatePackBundle();
const OUT = path.join("tests/qa/_output");
fs.mkdirSync(OUT, { recursive: true });

function firstOptionFor(node) {
  if (node.kind === "text") return "sample text";
  return node.options[0]?.value ?? "01";
}

function walkPhase2Answers(caseId, phase1Answers) {
  const answers = { ...phase1Answers };
  for (let round = 0; round < 64; round++) {
    const ids = phase2QuestionIds(caseId, answers);
    let changed = false;
    for (const id of ids) {
      if (answers[id] != null && String(answers[id]).trim() !== "") continue;
      const node = bundle.nodes[caseId]?.find((n) => n.id === id);
      if (!node) continue;
      answers[id] = firstOptionFor(node);
      changed = true;
    }
    if (!changed && isPhase2QuestionSetComplete(caseId, answers)) break;
  }
  return answers;
}

for (const caseId of CASES) {
  const lines = [];
  let n = 0;
  for (const phase1 of enumeratePhase1Combinations(caseId)) {
    n++;
    if (n > 20) break;
    const answers = walkPhase2Answers(caseId, phase1);
    answers[ADMIN_PHASE2_DOCUMENTS_ANY_UPLOADED_ANSWERS_KEY] = "1";
    const data = bridge.buildPersonalizedResult(answers);
    lines.push(`=== ${caseId} combo ${n} ===`);
    lines.push(`headline: ${data?.statusHeadline ?? "(null)"}`);
    lines.push(`summary: ${data?.situationSummary ?? ""}`);
    lines.push(`grade: ${data?.gradeLabel ?? ""}`);
    lines.push(`core: ${data?.personalizedContext?.coreJudgment ?? ""}`);
    lines.push(`integrated: ${data?.personalizedContext?.integratedSituation ?? ""}`);
    lines.push(`phase1Facts: ${(data?.personalizedContext?.phase1Facts ?? []).join(" | ")}`);
    lines.push(`phase2Additions: ${(data?.personalizedContext?.phase2Additions ?? []).join(" | ")}`);
    lines.push(`cautions: ${(data?.cautions ?? []).join(" | ")}`);
    lines.push(`actions: ${(data?.actions ?? []).join(" | ")}`);
    lines.push("");
  }
  fs.writeFileSync(path.join(OUT, `c23-dump-${caseId}.txt`), lines.join("\n"), "utf8");
}
console.log("wrote c23-dump-RE01..RE05.txt");
