import fs from "fs";
import path from "path";
import { REAL_ESTATE_PHASE2_DOCUMENT_LISTS } from "../../src/lib/contentPacks/realEstate/phase2Documents.ts";
import { enumeratePhase1Combinations } from "../../src/lib/contentPacks/realEstate/exhaustivePhase1.ts";
import { phase2QuestionIds } from "../../src/lib/contentPacks/runner.ts";

const CASES = ["RE01", "RE02", "RE03", "RE04", "RE05"];
const OUT = path.join("tests/qa/_output");
fs.mkdirSync(OUT, { recursive: true });

for (const caseId of CASES) {
  const lines = [];
  const docs = REAL_ESTATE_PHASE2_DOCUMENT_LISTS[caseId];
  lines.push(`=== ${caseId} phase2 documents (draft) ===`);
  lines.push(`required: ${(docs?.documents ?? []).join(" | ")}`);
  lines.push(`optional: ${(docs?.optionalDocuments ?? []).join(" | ")}`);
  lines.push(`exampleTags: ${(docs?.exampleTags ?? []).join(" | ")}`);
  lines.push("");
  let n = 0;
  for (const answers of enumeratePhase1Combinations(caseId)) {
    n++;
    if (n > 5) break;
    const ids = phase2QuestionIds(caseId, answers);
    lines.push(`combo-${n} phase2_ids(${ids.length}): ${ids.join(", ")}`);
  }
  lines.push("");
  fs.writeFileSync(path.join(OUT, `c21-dump-${caseId}.txt`), lines.join("\n"), "utf8");
}
console.log("wrote c21-dump-RE01..RE05.txt");
